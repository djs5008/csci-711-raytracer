/* eslint-disable brace-style */
/* eslint-disable no-invalid-this */
import { Kernel, KernelFunction } from 'gpu.js';
import Camera from '../model/camera';
import { planeIntersect } from '../model/entities/plane';
import { sphereIntersect } from '../model/entities/sphere';
import { triangleIntersect } from '../model/entities/triangle';
import Bounds from '../model/util/bounds';
import { addVec3, Color, normalizeVec3, scaleVec3, Vector2, Vector3 } from '../model/util/vector';

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
            entities      : any,
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
            const e2w : Vector3 = [eyepointWorld[0], eyepointWorld[1], eyepointWorld[2]];

            // Viewport Properties & Calculations
            const w : number = viewport[0];
            const h : number = viewport[1];
            const yScale : number = aspectRatio * fovScale;
            const invFocalLen : number = 1 / focalLen;

            // Calculate the Ray direction
            const { thread: { x, y } } = this; // x, y
            const pX : Vector3 = scaleVec3(u, ((1 - (x / w) - 0.5) * fovScale) * invFocalLen);
            const pY : Vector3 = scaleVec3(v, ((0 + (y / h) - 0.5) * yScale) * invFocalLen);
            const rayDir = normalizeVec3(addVec3(addVec3(n, pX), pY));

            // Background Color
            const BG_COLOR : Vector3 = [0.25, 0.6, 1];

            // Define the indexes of physical entity properties
            let   BASE   : number = 0;
            const E_TYPE : number = BASE += 0;  // Entity Type
            const E_POS  : number = BASE += 1;  // Entity Position
            const E_MAT  : number = BASE += 3;  // Entity Material (Color)
            const E_CUST : number = BASE += 11; // Entity Custom Property Begin Index

            // Result Variables
            let firstHit    : boolean = true;        // Has not been hit?
            let color       : Color   = [ 0, 0, 0 ]; // Accumulated Color
            let accOpacity  : number  = 0;           // Accumulated Opacity
            let lastHitPos  : Vector3 = eye;         // "Last Hit" Vector3

            // Iterate until the accumulated opacity
            while (accOpacity < 1) {
                const rayPos : Vector3 = lastHitPos;
                let nearestEntityDistance : number = MAX_INT;
                let nearestEntityIndex    : number = -1;

                /* @ts-ignore */
                for (let i = 0; i < this.constants.ENTITY_COUNT; i++) {
                    // Entity Information
                    const entityType    : number  =  entities[i][E_TYPE];
                    const entityPos     : Vector3 = [entities[i][E_POS+0], entities[i][E_POS+1], entities[i][E_POS+2]];
                    let distance        : number  = -1;

                    // Retrieve Sphere Intersection Information
                    /* @ts-ignore */
                    if (entityType === this.constants.SPHERE) {
                        const radius = entities[i][E_CUST];
                        distance = sphereIntersect(entityPos, radius, rayPos, rayDir);
                    }

                    // Retrieve Plane Intersection Information
                    /* @ts-ignore */
                    else if (entityType === this.constants.PLANE) {
                        const normal = [entities[i][E_CUST+0], entities[i][E_CUST+1], entities[i][E_CUST+2]] as Vector3;
                        distance = planeIntersect(normal, rayPos, rayDir, e2w);
                    }

                    // Retrieve Triangle Intersection Information
                    /* @ts-ignore */
                    else if (entityType === this.constants.TRIANGLE) {
                        const v0 : Vector3 = [entities[i][E_CUST+0], entities[i][E_CUST+1], entities[i][E_CUST+2]];
                        const v1 : Vector3 = [entities[i][E_CUST+3], entities[i][E_CUST+4], entities[i][E_CUST+5]];
                        const v2 : Vector3 = [entities[i][E_CUST+6], entities[i][E_CUST+7], entities[i][E_CUST+8]];
                        distance = triangleIntersect(v0, v1, v2, rayPos, rayDir);
                    }

                    // Check to see if we've hit an entity closer than the previously found entity
                    //  (if any)
                    if (distance > 0 && distance < nearestEntityDistance) {
                        nearestEntityIndex = i;
                        nearestEntityDistance = distance;
                    }
                }

                // We have not hit any entities (this cycle)
                if (nearestEntityDistance === MAX_INT) {
                    // Add the Background color for the remaining opacity
                    color = addVec3(color, scaleVec3(BG_COLOR, 1-accOpacity));
                    break;
                } else {
                    // Material Properties
                    // const nearestEntityMaterial = entities[nearestEntityIndex][E_MAT];
                    const COLOR_DIFFUSE  : Color  = [ entities[nearestEntityIndex][E_MAT + 0], entities[nearestEntityIndex][E_MAT + 1], entities[nearestEntityIndex][E_MAT + 2] ] as Color;
                    const COLOR_SPECULAR : Color  = [ entities[nearestEntityIndex][E_MAT + 3], entities[nearestEntityIndex][E_MAT + 4], entities[nearestEntityIndex][E_MAT + 5] ] as Color;
                    const AMBIENT        : number = entities[nearestEntityIndex][E_MAT + 6];
                    const DIFFUSE        : number = entities[nearestEntityIndex][E_MAT + 7];
                    const SPECULAR       : number = entities[nearestEntityIndex][E_MAT + 8];
                    const EXPONENT       : number = entities[nearestEntityIndex][E_MAT + 9];
                    const OPACITY        : number = entities[nearestEntityIndex][E_MAT + 10];

                    // TODO: Need to use these in Phong calculation. Remove this line when used.
                    COLOR_SPECULAR; AMBIENT; DIFFUSE; SPECULAR; EXPONENT; OPACITY;

                    // Move the "hit" vector forward to the hit location.
                    lastHitPos = addVec3(lastHitPos, scaleVec3(rayDir, nearestEntityDistance * (1 + EPSILON)));

                    // Amount of "opacity" left
                    const translucency : number = 1 - accOpacity;

                    // Default the color if it's the first time being hit
                    if (firstHit) {
                        color = COLOR_DIFFUSE;
                    }

                    // Add the current color (and previous colors) to the "discovered" color.
                    color = addVec3(color, scaleVec3(
                        [
                            entities[nearestEntityIndex][E_MAT+0],
                            entities[nearestEntityIndex][E_MAT+1],
                            entities[nearestEntityIndex][E_MAT+2],
                        ], OPACITY * translucency),
                    );

                    // Increase the amount of accumulated opacity hit
                    accOpacity += ((translucency) * OPACITY);
                    firstHit = false;
                }
            }

            // Set color of this x,y pixel
            this.color(color[0], color[1], color[2]);
        };
    }
}
