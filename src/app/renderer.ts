/* eslint-disable brace-style */
/* eslint-disable no-invalid-this */
import { Kernel, KernelFunction } from 'gpu.js';
import Camera from '../model/camera';
import { planeIntersect, planePoint } from '../model/entities/plane';
import { sphereIntersect, sphereNormal, spherePoint } from '../model/entities/sphere';
import { triangleIntersect, triangleNormal, trianglePoint } from '../model/entities/triangle';
import { voxelIntersect, voxelNormal, voxelPoint } from '../model/entities/voxel';
import Bounds from '../model/util/bounds';
import { smoothStepVal } from '../model/util/math';
import { addVec3, Color, crossVec3, dotVec3, multiplyVec3, normalizeVec3, reflect, scaleVec3, subVec3, transmit, Vector2, Vector3 } from '../model/util/vector';

export default class Renderer {
    public static readonly DEFAULT_RESOLUTION = new Bounds(1920, 1080);

    public gpuKernel        : Kernel;
    private camera          : Camera;
    private lastFrameTime   : number;
    private frameCount      : number = 0;

    constructor(
        public resolution : Bounds = Renderer.DEFAULT_RESOLUTION,
    ) { }

    public async drawImage() {
        if (!this.camera) return;
        this.camera.render();
        this.updateFPS();
    }

    public setCamera(camera : Camera) {
        this.camera = camera;
        this.camera.setViewport(this.resolution);
    }

    public getCamera() : Camera {
        return this.camera;
    }

    public updateResolution(bounds : Bounds) {
        this.resolution = bounds;
        if (this.gpuKernel) {
            this.gpuKernel.setOutput([bounds.w, bounds.h]);
        }
        if (this.camera) {
            this.camera.setViewport(bounds);
        }
    }

    public setGPUKernel(gpuKernel : Kernel) {
        this.gpuKernel = gpuKernel;
    }

    public updateFPS() {
        if (this.lastFrameTime == null) this.lastFrameTime = Date.now();
        if (Date.now() - this.lastFrameTime > 1000) {
            const fps = this.frameCount - 2;
            if (fps > 0) {
                this.lastFrameTime = null;
                this.frameCount    = 0;
                document.getElementById('fps-counter').innerText = `FPS: ${fps}`;
            }
        }
        this.frameCount++;
    }

    public get canvas() {
        return this.gpuKernel.canvas;
    }

    public static get renderFunction() : KernelFunction {
        return <KernelFunction> function(
            viewport      : Vector2,
            eyepoint      : Vector3,
            eyepointWorld : Vector3,
            entities      : any[][],
            lights        : any[][],
            meshes        : any,
            textures      : any,
            N             : Vector3,
            U             : Vector3,
            V             : Vector3,
            aspectRatio   : number,
            fovScale      : number,
            focalLen      : number,
        ) {
            // Constants
            const MAX_INT   : number = 0xFFFFFFFF;
            const EPSILON   : number = 0.001;
            const MAX_DEPTH : number = 2;

            // NOTE:
            //   Need to re-declare Vector3 inputs as Array(3)
            //
            const eye : Vector3 = [eyepoint[0], eyepoint[1], eyepoint[2]];
            const n   : Vector3 = [N[0], N[1], N[2]];
            const u   : Vector3 = [U[0], U[1], U[2]];
            const v   : Vector3 = [V[0], V[1], V[2]];
            // const e2w : Vector3 = [eyepointWorld[0], eyepointWorld[1], eyepointWorld[2]];

            // Viewport Properties & Calculations
            const w : number = viewport[0];
            const h : number = viewport[1];
            const yScale : number = aspectRatio * fovScale;

            // Calculate the Ray direction
            const { thread: { x, y } } = this; // x, y
            const pX : Vector3 = scaleVec3(u, ((1 - (x / w) - 0.5) * fovScale) * focalLen);
            const pY : Vector3 = scaleVec3(v, ((0 + (y / h) - 0.5) * yScale) * focalLen);

            // Background Color
            const BG_COLOR : Vector3 = [0.075, 0.075, 0.075];

            // Define the indexes of physical entity properties
            let   BASE    : number = 0;
            const E_TYPE  : number = BASE += 0;  // Entity Type
            const E_TEX   : number = BASE += 1;  // Entity Texture
            const E_TEX_X : number = BASE += 1;  // Entity Texture
            const E_TEX_Y : number = BASE += 1;  // Entity Texture
            const E_POS   : number = BASE += 1;  // Entity Position
            const E_MAT   : number = BASE += 3;  // Entity Material (Color)
            const E_CUST  : number = BASE += 13; // Entity Custom Property Begin Index

            // Result Variables
            let color         : Color    = [ 0, 0, 0 ];     // Accumulated Color
            let accOpacity    : number   = 0;               // Accumulated Opacity
            let accReflect    : number   = 0;               // Accumulated Reflectivity
            let depth         : number   = 0;
            let lastHitPos    : Vector3  = eye;
            let lastHitDir    : Vector3  = normalizeVec3(addVec3(addVec3(n, pX), pY));

            // Iterate until the accumulated opacity
            while (depth < MAX_DEPTH) {
                const rayPos : Vector3 = lastHitPos;
                const rayDir : Vector3 = lastHitDir;
                let hitColor              : Vector3 = [ 0, 0, 0 ];
                let nearestEntityType     : number  = -1;
                let nearestEntityIndex    : number  = -1;
                let nearestEntityDistance : number  = MAX_INT;
                let nearestEntityPoint    : Vector3 = [ 0, 0, 0 ];
                let nearestEntityNormal   : Vector3 = [ 0, 0, 0 ];
                let nearestEntityUV       : Vector3 = [ 0, 0, 0 ];

                /* @ts-ignore */
                for (let i = 0; i < this.constants.ENTITY_COUNT; i++) {
                    // Entity Information
                    const entityType    : number   =  entities[i][E_TYPE];
                    const entityPos     : Vector3  = [entities[i][E_POS+0], entities[i][E_POS+1], entities[i][E_POS+2]];
                    let distance = -1;
                    let point    = [ 0, 0, 0 ];
                    let normal   = [ 0, 0, 0 ];
                    let uv       = [ 0, 0, 0 ];

                    // Retrieve Sphere Intersection Information
                    /* @ts-ignore */
                    if (entityType === this.constants.SPHERE || entityType === this.constants.LIGHT) {
                        const radius = entities[i][E_CUST];
                        distance = sphereIntersect(entityPos, radius, rayPos, rayDir);
                        point = spherePoint(rayPos, rayDir, distance);
                        normal = sphereNormal(entityPos, rayPos, rayDir, distance);
                    }

                    // Retrieve Plane Intersection Information
                    /* @ts-ignore */
                    else if (entityType === this.constants.PLANE) {
                        const planeNormal = [entities[i][E_CUST+0], entities[i][E_CUST+1], entities[i][E_CUST+2]];
                        distance = planeIntersect(planeNormal, rayPos, rayDir);
                        point = planePoint(rayPos, rayDir, distance);
                        normal = planeNormal;
                    }

                    // Retrieve Triangle Intersection Information
                    /* @ts-ignore */
                    else if (entityType === this.constants.TRIANGLE) {
                        // const meshId : number = entities[i][E_CUST+0];
                        const v0 : Vector3 = [entities[i][E_CUST+1], entities[i][E_CUST+2], entities[i][E_CUST+3]];
                        const v1 : Vector3 = [entities[i][E_CUST+4], entities[i][E_CUST+5], entities[i][E_CUST+6]];
                        const v2 : Vector3 = [entities[i][E_CUST+7], entities[i][E_CUST+8], entities[i][E_CUST+9]];
                        distance = triangleIntersect(v0, v1, v2, rayPos, rayDir);
                        point = trianglePoint(rayPos, rayDir, distance);
                        normal = triangleNormal(v0, v1, v2);

                        const u = dotVec3(normal, crossVec3(subVec3(v2, v1), subVec3(point, v1))) / dotVec3(normal, normal);
                        const v = dotVec3(normal, crossVec3(subVec3(v0, v2), subVec3(point, v2))) / dotVec3(normal, normal);
                        const w = 1 - u - v;
                        uv = addVec3(addVec3(scaleVec3(v0, u), scaleVec3(v1, v)), scaleVec3(v2, w));
                    }

                    /* @ts-ignore */
                    else if (entityType === this.constants.VOXEL) {
                        const minX = entities[i][E_CUST+0];
                        const minY = entities[i][E_CUST+1];
                        const minZ = entities[i][E_CUST+2];
                        const maxX = entities[i][E_CUST+3];
                        const maxY = entities[i][E_CUST+4];
                        const maxZ = entities[i][E_CUST+5];
                        distance = voxelIntersect(rayPos, rayDir, minX, maxX, minY, maxY, minZ, maxZ);
                        point = voxelPoint(rayPos, rayDir, distance);
                        normal = voxelNormal(minX, maxX, minY, maxY, minZ, maxZ, point);
                    }

                    // Check to see if we've hit an entity closer than the previously found entity
                    // (if any)
                    if (distance > 0 && distance < nearestEntityDistance) {
                        nearestEntityIndex = i;
                        nearestEntityDistance = distance;
                        nearestEntityPoint    = point;
                        nearestEntityNormal   = normal;
                        nearestEntityType     = entityType;
                        nearestEntityUV       = uv;
                    }
                }

                // Material Properties
                let COLOR_DIFFUSE  : Color  = [0, 0, 0];
                let COLOR_SPECULAR : Color  = [0, 0, 0];
                let AMBIENT        : number = -1;
                let DIFFUSE        : number = -1;
                let SPECULAR       : number = -1;
                let EXPONENT       : number = -1;
                let USE_TOON       : number = 0;
                let REFLECTION     : number = 0;
                let TRANSMISSION   : number = 0;

                COLOR_DIFFUSE  = [entities[nearestEntityIndex][E_MAT + 0], entities[nearestEntityIndex][E_MAT + 1], entities[nearestEntityIndex][E_MAT + 2]] as Color;
                COLOR_SPECULAR = [entities[nearestEntityIndex][E_MAT + 3], entities[nearestEntityIndex][E_MAT + 4], entities[nearestEntityIndex][E_MAT + 5]] as Color;
                AMBIENT        = entities[nearestEntityIndex][E_MAT + 6];
                DIFFUSE        = entities[nearestEntityIndex][E_MAT + 7];
                SPECULAR       = entities[nearestEntityIndex][E_MAT + 8];
                EXPONENT       = entities[nearestEntityIndex][E_MAT + 9];
                USE_TOON       = entities[nearestEntityIndex][E_MAT + 10];
                REFLECTION     = entities[nearestEntityIndex][E_MAT + 11];
                TRANSMISSION   = entities[nearestEntityIndex][E_MAT + 12];

                // Amount of "opacity" left
                const translucency : number = 1 - accOpacity;

                // We have not hit any entities (this cycle)
                if (nearestEntityDistance === MAX_INT) {
                    // Add the Background color for the remaining opacity
                    color = addVec3(color, scaleVec3(BG_COLOR, translucency));
                    break;
                } else {
                    let diffuse   : Vector3 = [ 0, 0, 0 ];
                    let specular  : Vector3 = [ 0, 0, 0 ];
                    let rim       = 0;

                    // @ts-ignore
                    if (nearestEntityType !== this.constants.LIGHT) {
                        // Check if there is a texture
                        const texId = entities[nearestEntityIndex][E_TEX];
                        if (texId >= 0) {
                            const HEADER_LENGTH = 3;
                            const texScale = textures[texId][2];
                            const tWidth   = textures[texId][0] * texScale;
                            const tHeight  = textures[texId][1] * texScale;
                            const pX = (nearestEntityUV[2] + entities[nearestEntityIndex][E_TEX_X]);
                            const pZ = (nearestEntityUV[0] + entities[nearestEntityIndex][E_TEX_Y]);

                            const tX = Math.floor(Math.abs((pX % tWidth)  / texScale));
                            const tY = Math.floor(Math.abs((pZ % tHeight) / texScale));
                            const colorIndex = ((tX + (tY * (tWidth/texScale))) * 3) + HEADER_LENGTH;
                            hitColor = addVec3(hitColor, [
                                textures[texId][colorIndex + 0],
                                textures[texId][colorIndex + 1],
                                textures[texId][colorIndex + 2],
                            ]);
                        }
                        // @ts-ignore
                        for (let i = 0; i < this.constants.LIGHT_COUNT; i++) {
                            const LIGHT_TOGGLE = lights[i][7];
                            if (LIGHT_TOGGLE === 0) continue;
                            // Cast shadow ray
                            const lightPos = [ lights[i][0], lights[i][1], lights[i][2] ];
                            const lightDir = normalizeVec3(subVec3(lightPos, nearestEntityPoint));
                            const S = normalizeVec3(subVec3(nearestEntityPoint, lightPos));
                            const rayDir : Vector3 = lightDir;
                            const rayPos : Vector3 = addVec3(nearestEntityPoint, scaleVec3(lightDir, 0.001));

                            let nearestEntityDistance     : number  = MAX_INT;
                            let nearestEntityTransmission : number  = 0;
                            /* @ts-ignore */
                            for (let i = 0; i < this.constants.ENTITY_COUNT; i++) {
                                // Entity Information
                                const entityType    : number   =  entities[i][E_TYPE];
                                const entityPos     : Vector3  = [entities[i][E_POS+0], entities[i][E_POS+1], entities[i][E_POS+2]];
                                let distance = -1;

                                // Retrieve Sphere Intersection Information
                                /* @ts-ignore */
                                if (entityType === this.constants.SPHERE) {
                                    const radius = entities[i][E_CUST];
                                    distance = sphereIntersect(entityPos, radius, rayPos, rayDir);
                                }

                                // Retrieve Plane Intersection Information
                                /* @ts-ignore */
                                else if (entityType === this.constants.PLANE) {
                                    const planeNormal = [entities[i][E_CUST+0], entities[i][E_CUST+1], entities[i][E_CUST+2]] as Vector3;
                                    distance = planeIntersect(planeNormal, rayPos, rayDir);
                                }

                                // Retrieve Triangle Intersection Information
                                /* @ts-ignore */
                                else if (entityType === this.constants.TRIANGLE) {
                                    const v0 : Vector3 = [entities[i][E_CUST+1], entities[i][E_CUST+2], entities[i][E_CUST+3]];
                                    const v1 : Vector3 = [entities[i][E_CUST+4], entities[i][E_CUST+5], entities[i][E_CUST+6]];
                                    const v2 : Vector3 = [entities[i][E_CUST+7], entities[i][E_CUST+8], entities[i][E_CUST+9]];
                                    distance = triangleIntersect(v0, v1, v2, rayPos, rayDir);
                                }

                                // Retrieve Voxel Intersection Information
                                /* @ts-ignore */
                                else if (entityType === this.constants.VOXEL) {
                                    const minX = entities[i][E_CUST+0];
                                    const minY = entities[i][E_CUST+1];
                                    const minZ = entities[i][E_CUST+2];
                                    const maxX = entities[i][E_CUST+3];
                                    const maxY = entities[i][E_CUST+4];
                                    const maxZ = entities[i][E_CUST+5];
                                    distance = voxelIntersect(rayPos, rayDir, minX, maxX, minY, maxY, minZ, maxZ);
                                }

                                // Check to see if we've hit an entity closer than the previously found entity
                                //  (if any)
                                if (distance > 0 && distance < nearestEntityDistance) {
                                    nearestEntityDistance = distance;
                                    nearestEntityTransmission = entities[i][E_MAT+12];
                                }
                            }
                            const VD = normalizeVec3(subVec3(nearestEntityPoint, eye));
                            const normal  = nearestEntityNormal;
                            if (nearestEntityDistance === MAX_INT) {
                                const lightColor = [ lights[i][3], lights[i][4], lights[i][5] ];
                                const refl = reflect(lightDir, normal);
                                if (USE_TOON === 1) {
                                    diffuse = addVec3(diffuse, multiplyVec3(lightColor, COLOR_DIFFUSE));
                                    specular = addVec3(specular, multiplyVec3(lightColor, scaleVec3(COLOR_SPECULAR, smoothStepVal(0.005, 0.01, Math.max(0, dotVec3(VD, refl)) ** 50))));
                                } else {
                                    diffuse = addVec3(diffuse, multiplyVec3(lightColor, scaleVec3(COLOR_DIFFUSE, dotVec3(S, normal))));
                                    specular = addVec3(specular, multiplyVec3(lightColor, scaleVec3(COLOR_SPECULAR, Math.max(0, dotVec3(VD, refl)) ** EXPONENT)));
                                }
                            } else {
                                // hitColor = subVec3(color, [ 1/(nearestEntityDistance**2), 1/(nearestEntityDistance**2), 1/(nearestEntityDistance**2)]);
                            }
                            if (USE_TOON === 1) {
                                rim = smoothStepVal(0.706, 0.726, 1-dotVec3(VD, normal));
                            }
                        }
                        if (USE_TOON === 1 && rim > 0) {
                            hitColor = addVec3(hitColor, scaleVec3(hitColor, rim));
                        } else {
                            // Skip diffuse color on textured entities
                            if (texId < 0) hitColor = addVec3(hitColor, scaleVec3(COLOR_DIFFUSE, AMBIENT));
                            hitColor = addVec3(hitColor, scaleVec3(diffuse, DIFFUSE));
                            hitColor = addVec3(hitColor, scaleVec3(specular, SPECULAR));
                        }
                    } else {
                        if (depth == 0) {
                            hitColor = COLOR_DIFFUSE;
                        }
                    }
                }

                if (translucency > 0) {
                    hitColor = scaleVec3(hitColor, translucency);
                }

                // if (accReflect > 0) {
                //     hitColor = addVec3(hitColor, scaleVec3(hitColor, accReflect));
                // }

                // sprinkle in some reflection
                color = addVec3(color, scaleVec3(scaleVec3(hitColor, 1-REFLECTION), (1-accReflect)));

                if (REFLECTION > 0) {
                    // Set the "hit" direction to the reflection vector based on the hit location.
                    lastHitDir = reflect(rayDir, nearestEntityNormal);
                    // Move the "hit" vector forward to the hit location.
                    lastHitPos = addVec3(rayPos, scaleVec3(rayDir, nearestEntityDistance));
                } else if (TRANSMISSION > 0) {
                    // Move the "hit" vector forward to the hit location.
                    lastHitPos = addVec3(rayPos, scaleVec3(rayDir, nearestEntityDistance * (1.001)));
                    if (depth > 0) {
                        lastHitDir = transmit(rayDir, subVec3(nearestEntityNormal, scaleVec3(nearestEntityNormal, 2)), 1, 1.25);
                    }
                } else {
                    break;
                }

                // Increase the amount of accumulated opacity hit
                accOpacity += ((translucency) * TRANSMISSION);

                // Increase the amount of accumulated reflection
                accReflect += 1-REFLECTION;

                // Increase "recursion" depth
                depth += 1;
            }

            // Set color of this x,y pixel
            this.color(color[0], color[1], color[2]);
        };
    }
}
