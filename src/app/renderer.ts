/* eslint-disable brace-style */
/* eslint-disable no-invalid-this */
import { Kernel, KernelFunction } from 'gpu.js';
import Camera from '../model/camera';
import { planeIntersect } from '../model/entities/plane';
import { sphereIntersect } from '../model/entities/sphere';
import { triangleIntersect } from '../model/entities/triangle';
import Bounds from '../model/util/bounds';
import { addVec3, normalizeVec3, scaleVec3, Vector2, Vector3 } from '../model/util/vector';

export default class Renderer {
    public static readonly DEFAULT_RESOLUTION = new Bounds(1920, 1080);

    private camera          : Camera;
    public gpuKernel        : Kernel;
    private fps             : number;
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
            entities      : number[][],
            N             : Vector3,
            U             : Vector3,
            V             : Vector3,
            aspectRatio   : number,
            fovScale      : number,
            focalLen      : number,
        ) {
            // Need to re-declare Vector3 inputs as Array(3)
            const eye = [eyepoint[0], eyepoint[1], eyepoint[2]];
            const n   = [N[0], N[1], N[2]];
            const u   = [U[0], U[1], U[2]];
            const v   = [V[0], V[1], V[2]];
            const e2w = [eyepointWorld[0], eyepointWorld[1], eyepointWorld[2]];

            const w = viewport[0];
            const h = viewport[1];
            const invFocalLen = 1 / focalLen;
            const yScale = aspectRatio * fovScale;

            const { thread: { x, y } } = this;
            const pX = scaleVec3(u, ((1 - (x / w) - 0.5) * fovScale) * invFocalLen);
            const pY = scaleVec3(v, ((0 + (y / h) - 0.5) * yScale) * invFocalLen);
            const rayDir = normalizeVec3(addVec3(addVec3(n, pX), pY));

            // let nearestEntityIndex = -1;
            const BG_COLOR : Vector3 = [0.25, 0.6, 1];

            let   BASE   = 0;
            const E_TYPE = BASE += 0;
            const E_POS  = BASE += 1;
            const E_MAT  = BASE += 3;
            const E_OPQ  = BASE += 3;
            const E_CUST = BASE += 1;

            let color : Vector3 = [ 0, 0, 0 ];
            let accOpacity = 0;
            let lastHitPos = eye;
            // let lastHitIndex = -1;
            let hit = false;

            while (accOpacity < 1) {
                const rayPos = lastHitPos;
                let nearestEntityDistance = 0xFFFFFFFF;
                let nearestEntityIndex = -1;
                let nearestEntityOpacity = -1;

                /* @ts-ignore */
                for (let i = 0; i < this.constants.ENTITY_COUNT; i++) {
                    let distance = -1;
                    const entityType    : number  =  entities[i][E_TYPE];
                    const entityPos     : Vector3 = [entities[i][E_POS+0], entities[i][E_POS+1], entities[i][E_POS+2]];
                    const entityOpacity : number  =  entities[i][E_OPQ];

                    /* @ts-ignore */
                    if (entityType === this.constants.SPHERE) {
                        const radius = entities[i][E_CUST];
                        distance = sphereIntersect(entityPos, radius, rayPos, rayDir);
                    }

                    /* @ts-ignore */
                    else if (entityType === this.constants.PLANE) {
                        const normal = [entities[i][E_CUST+0], entities[i][E_CUST+1], entities[i][E_CUST+2]];
                        distance = planeIntersect(normal, rayPos, rayDir, e2w);
                    }

                    /* @ts-ignore */
                    else if (entityType === this.constants.TRIANGLE) {
                        const v0 : Vector3 = [entities[i][E_CUST+0], entities[i][E_CUST+1], entities[i][E_CUST+2]];
                        const v1 : Vector3 = [entities[i][E_CUST+3], entities[i][E_CUST+4], entities[i][E_CUST+5]];
                        const v2 : Vector3 = [entities[i][E_CUST+6], entities[i][E_CUST+7], entities[i][E_CUST+8]];
                        distance = triangleIntersect(v0, v1, v2, rayPos, rayDir);
                    }

                    if (distance > 0 && distance < nearestEntityDistance) {
                        nearestEntityIndex = i;
                        nearestEntityDistance = distance;
                        nearestEntityOpacity = entityOpacity;
                    }
                }

                if (nearestEntityDistance === 0xFFFFFFFF) {
                    // If we have hit anything before, add the background color too!
                    if (hit) color = addVec3(color, scaleVec3(BG_COLOR, 1-accOpacity));
                    break;
                } else {
                    hit = true;
                    const translucency = 1 - accOpacity;
                    lastHitPos = addVec3(lastHitPos, scaleVec3(rayDir, nearestEntityDistance * (1 + 0.000001)));
                    color = addVec3(color, scaleVec3(
                        [
                            entities[nearestEntityIndex][E_MAT+0],
                            entities[nearestEntityIndex][E_MAT+1],
                            entities[nearestEntityIndex][E_MAT+2],
                        ], nearestEntityOpacity * translucency),
                    );
                    accOpacity += ((translucency) * nearestEntityOpacity);
                }
            }

            // Did not hit? Default to background color
            if (hit === false) {
                color = BG_COLOR;
            }

            // Set color
            this.color(color[0], color[1], color[2]);
        };
    }
}
