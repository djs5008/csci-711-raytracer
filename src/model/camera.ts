import { glMatrix, mat4, vec3 } from "gl-matrix";
import { IKernelRunShortcut, KernelOutput } from "gpu.js";
import Entity from "./entity";
import IRenderData from "./interfaces/render-data";
import Bounds from "./util/bounds";
import { addVec3, crossVec3, dotVec3, normalizeVec3, Vector3 } from "./util/vector3";
import World from "./world";

interface ISceneProperties {
    viewport    : number[];
    eyepoint    : number[];
    entities    : number[][];
    N           : number[];
    U           : number[];
    V           : number[];
    aspectRatio : number;
    fovScale    : number;
    focalLen    : number;
    cam2world   : number[];
}

class Camera extends Entity {

    public static BG_COLOR    : number[] = [0.251, 0.59, 1];
    public viewportProperties : ISceneProperties;

    private aspectRatio : number;
    private fovScale    : number;

    private gpuKernel   : IKernelRunShortcut;

    constructor(
        private world    : World,
        public  viewport : Bounds,
                position : number[],
        private lookAt   : number[],
        private up       : number[] = [ 0, 1, 0 ],
        private fov      : number = 90,
        private focalLen : number = 1,
        private yaw      : number = 90,
        private pitch    : number = 0,
    ) {
        super(null, position);
        this.yaw    = 0;
        this.pitch  = 0;
        this.lookAt = [ 0, 0, 1 ];
        this.rotate(yaw, pitch);
    }

    private setupViewportProperties() : void {
        const eyepoint = this.position;
        const entities = this.world.getPhysicalEntities();
        const N = normalizeVec3(this.lookAt);
        const U = normalizeVec3(crossVec3(N, Vector3.UP));
        const V = normalizeVec3(crossVec3(U, N));
        const aspectRatio = (this.aspectRatio) ?? this.viewport.h / this.viewport.w;
        const fovScale = (this.fovScale) ?? Math.tan(glMatrix.toRadian(this.fov * 0.5));
        const focalLen = this.focalLen;
        if (!this.aspectRatio) this.aspectRatio = aspectRatio;
        if (!this.fovScale) this.fovScale = fovScale;
        const cam2world : mat4 = [
            U[0], V[0], N[0], 0,
            U[1], V[1], N[1], 0,
            U[2], V[2], N[2], 0,
            -dotVec3(eyepoint, U), -dotVec3(eyepoint, V), -dotVec3(eyepoint, N), 1
        ];
        this.viewportProperties = {
            viewport: [ this.viewport.w, this.viewport.h ],
            eyepoint,
            entities,
            N,
            U,
            V,
            aspectRatio,
            fovScale,
            focalLen,
            cam2world,
        };
    }

    public render() : void {
        this.setupViewportProperties();

        const { viewport, eyepoint, entities, N, U, V, aspectRatio, fovScale, focalLen, cam2world } = this.viewportProperties;
        const output : KernelOutput = this.gpuKernel(
            viewport,
            eyepoint,
            entities,
            N,
            U,
            V,
            aspectRatio,
            fovScale,
            focalLen,
            cam2world
        );
    }

    public move(movement : number[]) {
        const cameraPos = this.position;
        super.position = [
            cameraPos[0] + movement[0],
            cameraPos[1] + movement[1],
            cameraPos[2] + movement[2],
        ];
    }

    public rotate(yaw : number, pitch : number) {
        this.yaw   += yaw;
        this.pitch += pitch;
        const yawR   = glMatrix.toRadian(this.yaw);
        const pitchR = glMatrix.toRadian(this.pitch);
        const x = Math.cos(yawR) * Math.cos(pitchR);
        const y = Math.sin(pitchR);
        const z = Math.sin(yawR) * Math.cos(pitchR);
        this.lookAt = normalizeVec3(addVec3(this.lookAt, [ x, y, z ]));
    }

    public setViewport(bounds : Bounds) {
        this.viewport = bounds;
    }

    public setKernel(kernel : IKernelRunShortcut) {
        this.gpuKernel = kernel;
    }

}

export default Camera;
export type { ISceneProperties };