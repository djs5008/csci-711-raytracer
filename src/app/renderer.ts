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
            const rayPos = [eyepoint[0], eyepoint[1], eyepoint[2]];
            const rayDir = normalizeVec3(addVec3(addVec3(n, pX), pY));

            // let nearestEntityIndex = -1;
            let nearestEntityDistance = 2 ** 32;
            let color : Vector3 = [0.25, 0.6, 1];

            /* @ts-ignore */
            for (let i = 0; i < this.constants.ENTITY_COUNT; i++) {
                let distance = -1;
                const entityType = entities[i][0];
                const entityPos : Vector3 = [entities[i][1], entities[i][2], entities[i][3]];
                /* @ts-ignore */
                if (entityType === this.constants.SPHERE) {
                    const radius = entities[i][7];
                    distance = sphereIntersect(entityPos, radius, rayPos, rayDir);
                /* @ts-ignore */
                } else if (entityType === this.constants.PLANE) {
                    const normal = [entities[i][7], entities[i][8], entities[i][9]];
                    distance = planeIntersect(normal, rayPos, rayDir, e2w);
                /* @ts-ignore */
                } else if (entityType === this.constants.TRIANGLE) {
                    const v0 : Vector3 = [entities[i][7], entities[i][8], entities[i][9]];
                    const v1 : Vector3 = [entities[i][10], entities[i][11], entities[i][12]];
                    const v2 : Vector3 = [entities[i][13], entities[i][14], entities[i][15]];
                    distance = triangleIntersect(v0, v1, v2, rayPos, rayDir);
                }

                if (distance >= 0 && distance < nearestEntityDistance) {
                    // nearestEntityIndex = i;
                    nearestEntityDistance = distance;
                    color = [entities[i][4], entities[i][5], entities[i][6]];
                }
            }

            // Set color
            this.color(color[0], color[1], color[2]);
        };
    }
}
