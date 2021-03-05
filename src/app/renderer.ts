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
import { addVec3, Color, dotVec3, multiplyVec3, normalizeVec3, scaleVec3, subVec3, Vector2, Vector3 } from '../model/util/vector';

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
            N             : Vector3,
            U             : Vector3,
            V             : Vector3,
            aspectRatio   : number,
            fovScale      : number,
            focalLen      : number,
        ) {
            // Constants
            const MAX_INT : number = 0xFFFFFFFF;
            const EPSILON : number = 0.001;

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
            const rayDir = normalizeVec3(addVec3(addVec3(n, pX), pY));

            // Background Color
            const BG_COLOR : Vector3 = [0.25, 0.6, 1];

            // Define the indexes of physical entity properties
            let   BASE   : number = 0;
            const E_TYPE : number = BASE += 0;  // Entity Type
            const E_POS  : number = BASE += 1;  // Entity Position
            const E_MAT  : number = BASE += 3;  // Entity Material (Color)
            const E_CUST : number = BASE += 12; // Entity Custom Property Begin Index

            // Result Variables
            let color         : Color    = [ 0, 0, 0 ];     // Accumulated Color
            let accOpacity    : number   = 0;               // Accumulated Opacity
            let lastHitPos    : Vector3  = eye;

            // Iterate until the accumulated opacity
            while (accOpacity < 1) {
                const rayPos : Vector3 = lastHitPos;
                let nearestEntityType     : number  = -1;
                let nearestEntityIndex    : number  = -1;
                let nearestEntityDistance : number  = MAX_INT;
                let nearestEntityPoint    : Vector3 = [ 0, 0, 0 ];
                let nearestEntityNormal   : Vector3 = [ 0, 0, 0 ];
                // const nearestMeshId         : number  = -1;
                // const nearestTriIndex       : number  = -1;

                /* @ts-ignore */
                // for (let m = 0; m < this.constants.MESH_COUNT; m++) {
                //     const minX = meshes[m][0];
                //     const maxX = meshes[m][1];
                //     const minY = meshes[m][2];
                //     const maxY = meshes[m][3];
                //     const minZ = meshes[m][4];
                //     const maxZ = meshes[m][5];
                //     const meshDistance = boundsIntersect(rayPos, rayDir, minX, maxX, minY, maxY, minZ, maxZ);
                //     if (meshDistance > 0) {
                //         for (let t = 6; t < MAX_INT; t++) {
                //             if (meshes[m][t] === -MAX_INT) break;

                //             // Entity Information
                //             const entityType    : number   =  meshes[m][t][E_TYPE];
                //             // let meshId   = -1;
                //             let distance = -1;
                //             let point    = [ 0, 0, 0 ];
                //             let normal   = [ 0, 0, 0 ];

                //             // Retrieve Triangle Intersection Information
                //             /* @ts-ignore */
                //             if (entityType === this.constants.TRIANGLE) {
                //                 // meshId = meshes[m][t][E_CUST+0];
                //                 const v0 : Vector3 = [meshes[m][t][E_CUST+1], meshes[m][t][E_CUST+2], meshes[m][t][E_CUST+3]];
                //                 const v1 : Vector3 = [meshes[m][t][E_CUST+4], meshes[m][t][E_CUST+5], meshes[m][t][E_CUST+6]];
                //                 const v2 : Vector3 = [meshes[m][t][E_CUST+7], meshes[m][t][E_CUST+8], meshes[m][t][E_CUST+9]];
                //                 distance = triangleIntersect(v0, v1, v2, rayPos, rayDir);
                //                 point = trianglePoint(rayPos, rayDir, distance);
                //                 normal = triangleNormal(v0, v1, v2);
                //             }

                //             // Check to see if we've hit an entity closer than the previously found entity
                //             //  (if any)
                //             if (distance > 0 && distance < nearestEntityDistance) {
                //                 nearestMeshId         = m;
                //                 nearestEntityDistance = distance;
                //                 nearestEntityPoint    = point;
                //                 nearestEntityNormal   = normal;
                //                 nearestEntityType     = entityType;
                //                 nearestTriIndex       = t;
                //             }
                //         }
                //     }
                // }

                /* @ts-ignore */
                for (let i = 0; i < this.constants.ENTITY_COUNT; i++) {
                    // Entity Information
                    const entityType    : number   =  entities[i][E_TYPE];
                    const entityPos     : Vector3  = [entities[i][E_POS+0], entities[i][E_POS+1], entities[i][E_POS+2]];
                    let distance = -1;
                    let point    = [ 0, 0, 0 ];
                    let normal   = [ 0, 0, 0 ];

                    // Retrieve Sphere Intersection Information
                    /* @ts-ignore */
                    if (entityType === this.constants.SPHERE || entityType === this.constants.LIGHT) {
                        const radius = entities[i][E_CUST];
                        distance = sphereIntersect(entityPos, radius, rayPos, rayDir);
                        point = spherePoint(rayPos, rayDir, distance);
                        normal = sphereNormal(entityPos, rayPos, rayDir, distance);
                        // hitEdge = ((distance - radius) <= 0.5) ? 1 : 0;
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
                    }
                }

                // We have not hit any entities (this cycle)
                if (nearestEntityDistance === MAX_INT) {
                    // Add the Background color for the remaining opacity
                    color = addVec3(color, scaleVec3(BG_COLOR, 1-accOpacity));
                    break;
                } else {
                    // Material Properties
                    let COLOR_DIFFUSE  : Color  = [0, 0, 0];
                    let COLOR_SPECULAR : Color  = [0, 0, 0];
                    let AMBIENT        : number = -1;
                    let DIFFUSE        : number = -1;
                    let SPECULAR       : number = -1;
                    let EXPONENT       : number = -1;
                    let OPACITY        : number = -1;
                    let USE_TOON       : number = 0;

                    // if (nearestMeshId === -1) {
                    COLOR_DIFFUSE  = [entities[nearestEntityIndex][E_MAT + 0], entities[nearestEntityIndex][E_MAT + 1], entities[nearestEntityIndex][E_MAT + 2]] as Color;
                    COLOR_SPECULAR = [entities[nearestEntityIndex][E_MAT + 3], entities[nearestEntityIndex][E_MAT + 4], entities[nearestEntityIndex][E_MAT + 5]] as Color;
                    AMBIENT        = entities[nearestEntityIndex][E_MAT + 6];
                    DIFFUSE        = entities[nearestEntityIndex][E_MAT + 7];
                    SPECULAR       = entities[nearestEntityIndex][E_MAT + 8];
                    EXPONENT       = entities[nearestEntityIndex][E_MAT + 9];
                    OPACITY        = entities[nearestEntityIndex][E_MAT + 10];
                    USE_TOON       = entities[nearestEntityIndex][E_MAT + 11];
                    // } else {
                    // COLOR_DIFFUSE  = [meshes[nearestMeshId][nearestTriIndex][E_MAT + 0], meshes[nearestMeshId][nearestTriIndex][E_MAT + 1], meshes[nearestMeshId][nearestTriIndex][E_MAT + 2]] as Color;
                    // COLOR_SPECULAR = [meshes[nearestMeshId][nearestTriIndex][E_MAT + 3], meshes[nearestMeshId][nearestTriIndex][E_MAT + 4], meshes[nearestMeshId][nearestTriIndex][E_MAT + 5]] as Color;
                    // AMBIENT        = meshes[nearestMeshId][nearestTriIndex][E_MAT + 6];
                    // DIFFUSE        = meshes[nearestMeshId][nearestTriIndex][E_MAT + 7];
                    // SPECULAR       = meshes[nearestMeshId][nearestTriIndex][E_MAT + 8];
                    // EXPONENT       = meshes[nearestMeshId][nearestTriIndex][E_MAT + 9];
                    // OPACITY        = meshes[nearestMeshId][nearestTriIndex][E_MAT + 10];
                    // }

                    // Amount of "opacity" left
                    const translucency : number = 1 - accOpacity;

                    let diffuse   : Vector3 = [ 0, 0, 0 ];
                    let specular  : Vector3 = [ 0, 0, 0 ];
                    let rim       = 0;

                    // @ts-ignore
                    if (nearestEntityType !== this.constants.LIGHT) {
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

                            let nearestEntityDistance : number  = MAX_INT;
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
                                }
                            }
                            const VD = normalizeVec3(subVec3(nearestEntityPoint, eye));
                            const normal  = nearestEntityNormal;
                            if (nearestEntityDistance === MAX_INT) {
                                const lightColor = [ lights[i][3], lights[i][4], lights[i][5] ];
                                const reflect = normalizeVec3(subVec3(lightDir, scaleVec3(normal, dotVec3(lightDir, normal) * 2)));
                                if (USE_TOON === 1) {
                                    diffuse = addVec3(diffuse, multiplyVec3(lightColor, COLOR_DIFFUSE));
                                    specular = addVec3(specular, multiplyVec3(lightColor, scaleVec3(COLOR_SPECULAR, smoothStepVal(0.005, 0.01, Math.max(0, dotVec3(VD, reflect)) ** 50))));
                                } else {
                                    diffuse = addVec3(diffuse, multiplyVec3(lightColor, scaleVec3(COLOR_DIFFUSE, dotVec3(S, normal))));
                                    specular = addVec3(specular, multiplyVec3(lightColor, scaleVec3(COLOR_SPECULAR, Math.max(0, dotVec3(VD, reflect)) ** EXPONENT)));
                                }
                            }
                            if (USE_TOON === 1) {
                                rim = smoothStepVal(0.706, 0.726, 1-dotVec3(VD, normal));
                            }
                        }
                        if (USE_TOON === 1 && rim > 0) {
                            color = addVec3(color, scaleVec3(color, rim));
                        } else {
                            color = addVec3(color, scaleVec3(COLOR_DIFFUSE, AMBIENT));
                            color = addVec3(color, scaleVec3(diffuse, DIFFUSE));
                            color = addVec3(color, scaleVec3(specular, SPECULAR));
                        }
                    } else {
                        color = COLOR_DIFFUSE;
                    }

                    // Add the current color (and previous colors) to the "discovered" color.
                    color = scaleVec3(color, OPACITY * translucency);

                    // Move the "hit" vector forward to the hit location.
                    lastHitPos = addVec3(lastHitPos, scaleVec3(rayDir, nearestEntityDistance * (1 + EPSILON)));

                    // Increase the amount of accumulated opacity hit
                    accOpacity += ((translucency) * OPACITY);
                }
            }

            // Set color of this x,y pixel
            this.color(color[0], color[1], color[2]);
        };
    }
}
