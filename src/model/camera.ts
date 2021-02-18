import { glMatrix, mat4, vec3 } from "gl-matrix";
import Entity from "./entity";
import IRenderData from "./interfaces/render-data";
import Bounds from "./util/bounds";
import Color from "./util/color";
import Ray from "./util/ray";
import World from "./world";

interface IViewportProperties {
    n                        : vec3;
    u                        : vec3;
    v                        : vec3;
    aspectRatio              : number;
    fovScale                    : number;
    cam2world                : mat4;
}

class Camera extends Entity {

    // public static BG_COLOR = new Color(1, 0, 1);
    public static BG_COLOR : vec3 = [0.251, 0.59, 1];
    public viewportProperties : IViewportProperties;

    private aspectRatio : number;
    private fovScale    : number;

    constructor(
        private world    : World,
        public  viewport : Bounds,
                position : vec3,
        private lookAt   : vec3,
        private up       : vec3 = [ 0, 1, 0 ],
        private fov      : number = 90,
        private focalLen : number = 1,
        private yaw      : number = 90,
        private pitch    : number = 0,
    ) {
        super(position);
        this.lookAt = [ 0, 0, 1 ];
    }

    private setupViewportProperties() : void {
        const eyepoint = this.getPosition();
        const n = vec3.normalize([0,0,0], this.lookAt);
        const u = vec3.normalize([0,0,0], vec3.cross([0,0,0], n, this.up));
        const v = vec3.normalize([0,0,0], vec3.cross([0,0,0], u, n));
        const aspectRatio = (this.aspectRatio) ?? this.viewport.h / this.viewport.w;
        const fovScale = (this.fovScale) ?? Math.tan(glMatrix.toRadian(this.fov * 0.5));
        if (!this.aspectRatio) this.aspectRatio = aspectRatio;
        if (!this.fovScale) this.fovScale = fovScale;
        const cam2world : mat4 = [
            u[0], v[0], n[0], 0,
            u[1], v[1], n[1], 0,
            u[2], v[2], n[2], 0,
            -vec3.dot(eyepoint, u), -vec3.dot(eyepoint, v), -vec3.dot(eyepoint, n), 1
        ];
        this.viewportProperties = {
            n,
            u,
            v,
            aspectRatio,
            fovScale,
            cam2world,
        };
    }

    public render() : IRenderData {
        this.setupViewportProperties();

        const pixels : Array<Color> = [];
        const { w, h } = this.viewport;
        const { aspectRatio, fovScale, n, u, v } = this.viewportProperties;

        const physicalEntities = this.world.getPhysicalEntities();
        const position = this.getPosition();
        const yScale = fovScale * aspectRatio;
        const invFocalLen = 1 / this.focalLen;

        let p = 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const pX = 1 - (x / w) - 0.5;
                const pY = 1 - (y / h) - 0.5;
                let uScaled, vScaled, imgPoint, rayDir;
                uScaled = vec3.scale([0,0,0], u, pX * fovScale);
                vScaled = vec3.scale([0,0,0], v, pY * yScale);
                imgPoint = vec3.scale([0,0,0], vec3.add([0,0,0], vec3.add([0,0,0], vec3.add([0,0,0], position, uScaled), vScaled), n), invFocalLen);
                rayDir = vec3.normalize([0,0,0], vec3.sub([0,0,0], imgPoint, position));
                const ray = new Ray(position, rayDir, this.viewportProperties);

                let minResult;
                for (let entity of physicalEntities) {
                    const ixResult = entity.intersect(ray);
                    if (ixResult != null && (minResult == null || ixResult.w < minResult.w)) {
                        minResult = ixResult;
                    }
                }

                if (minResult == null) {
                    pixels[p++] = Color.asColor(Camera.BG_COLOR);
                } else {
                    pixels[p++] = Color.asColor(minResult.entity.getMaterial());
                }
            }
        }

        return {
            pixels,
        };
    }

    public getLookat() : vec3 {
        return this.lookAt;
    }

    public setLookat(vector : vec3) {
        this.lookAt = vector;
    }

    public move(movement : vec3) {
        const cameraPos = this.getPosition();
        super.setPosition([
            cameraPos[0] + movement[0],
            cameraPos[1] + movement[1],
            cameraPos[2] + movement[2],
        ]);
    }

    public rotate(yaw : number, pitch : number) {
        this.yaw   += yaw;
        this.pitch += pitch;
        const yawR   = glMatrix.toRadian(this.yaw);
        const pitchR = glMatrix.toRadian(this.pitch);
        const x = Math.cos(yawR) * Math.cos(pitchR);
        const y = Math.sin(pitchR);
        const z = Math.sin(yawR) * Math.cos(pitchR);
        this.setLookat(vec3.normalize([0,0,0], vec3.add([0,0,0], this.lookAt, [ x, y, z ])));
    }

    public setViewport(bounds : Bounds) {
        this.viewport = bounds;
    }

}

export default Camera;
export type { IViewportProperties };