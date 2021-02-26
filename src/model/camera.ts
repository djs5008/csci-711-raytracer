import { IKernelRunShortcut } from 'gpu.js';
import Entity from './entity';
import Bounds from './util/bounds';
import { toRadian } from './util/math';
import { addVec3, crossVec3, dotVec3, Matrix4, normalizeVec3, transformM4, Vector2, Vector3 } from './util/vector';
import World from './world';

interface ISceneProperties {
    viewport : Vector2;
    eyepoint : Vector3;
    eyepointWorld : Vector3;
    entities : number[][];
    lights : number[][];
    N : Vector3;
    U : Vector3;
    V : Vector3;
    aspectRatio : number;
    fovScale : number;
    focalLen : number;
}

class Camera extends Entity {
    public static BG_COLOR : Vector3 = [0.251, 0.59, 1];
    public sceneProperties : ISceneProperties;

    private aspectRatio : number;
    private fovScale : number;
    private gpuKernel : IKernelRunShortcut;

    private entities : number[][];
    private lights   : number[][];

    constructor(
        private world : World,
        public viewport : Bounds,
        position : Vector3,
        private lookAt : Vector3,
        private up : Vector3 = [0, 1, 0],
        private fov : number = 90,
        private focalLen : number = 1,
        public yaw : number = 90,
        public pitch : number = 0,
    ) {
        super(null, position);
        this.yaw = 0;
        this.pitch = 0;
        // this.lookAt = [0, 0, 1];
        this.rotate(yaw, pitch);
    }

    private setupSceneProperties() : void {
        const viewport : Vector2 = [this.viewport.w, this.viewport.h];
        const eyepoint : Vector3 = this.position;
        this.lights     = (this.lights || this.world.getLights());
        this.entities   = (this.entities || this.world.getEntities());
        const N : Vector3 = normalizeVec3(this.lookAt);
        const U : Vector3 = normalizeVec3(crossVec3(N, Vector3.UP));
        const V : Vector3 = normalizeVec3(crossVec3(U, N));
        const aspectRatio : number = (this.aspectRatio) ?? this.viewport.h / this.viewport.w;
        const fovScale : number = (this.fovScale) ?? Math.tan(toRadian(this.fov * 0.5));
        const focalLen : number = this.focalLen;
        if (!this.aspectRatio) this.aspectRatio = aspectRatio;
        if (!this.fovScale) this.fovScale = fovScale;
        // const cam2world : Matrix4 = [
        //     U[0], V[0], N[0], 0,
        //     U[1], V[1], N[1], 0,
        //     U[2], V[2], N[2], 0,
        //     -dotVec3(eyepoint, U), -dotVec3(eyepoint, V), -dotVec3(eyepoint, N), 1,
        // ];
        // const eyepointWorld : Vector3 = transformM4(this.position, cam2world);
        this.sceneProperties = {
            viewport,
            eyepoint,
            eyepointWorld: [0, 0, 0],
            entities: this.entities,
            lights: this.lights,
            N, U, V,
            aspectRatio,
            fovScale,
            focalLen,
        };
    }

    public render() : void {
        this.setupSceneProperties();
        const {
            viewport,
            eyepoint,
            eyepointWorld,
            entities,
            lights,
            N, U, V,
            aspectRatio,
            fovScale,
            focalLen,
        } = this.sceneProperties;
        this.gpuKernel(
            viewport,
            eyepoint,
            eyepointWorld,
            entities,
            lights,
            N, U, V,
            aspectRatio,
            fovScale,
            focalLen,
        );
    }

    public move(movement : Vector3) {
        const cameraPos = this.position;
        super.position = [
            cameraPos[0] + movement[0],
            cameraPos[1] + movement[1],
            cameraPos[2] + movement[2],
        ];
    }

    public rotate(yaw : number, pitch : number) {
        const newPitch = (this.pitch + pitch);
        if (newPitch < -90 || newPitch > 90) pitch = 0;
        this.yaw   += yaw;
        this.pitch += pitch;
        const yawR   = toRadian(this.yaw);
        const pitchR = toRadian(this.pitch);
        const x = Math.cos(yawR) * Math.cos(pitchR);
        const y = Math.sin(pitchR);
        const z = Math.sin(yawR) * Math.cos(pitchR);
        this.lookAt = normalizeVec3(addVec3(this.lookAt, [x, y, z]));
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
