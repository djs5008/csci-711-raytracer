import { glMatrix, mat4 } from "gl-matrix";
import Entity from "./entity";
import IRenderData from "./interfaces/render-data";
import Bounds from "./util/bounds";
import Color from "./util/color";
import Ray from "./util/ray";
import Vector3 from "./util/vector3";
import World from "./world";

interface IViewportProperties {
    n                        : Vector3;
    u                        : Vector3;
    v                        : Vector3;
    aspectRatio              : number;
    fovScale                    : number;
    cam2world                : mat4;
}

class Camera extends Entity {

    // public static BG_COLOR = new Color(1, 0, 1);
    public static BG_COLOR = new Color(0.251, 0.59, 1);
    public viewportProperties : IViewportProperties;

    private aspectRatio : number;
    private fovScale    : number;

    constructor(
        private world    : World,
        public  viewport : Bounds,
                position : Vector3,
        private lookAt   : Vector3,
        private up       : Vector3 = Vector3.UP,
        private fov      : number = 90,
        private focalLen : number = 1,
        private yaw      : number = 90,
        private pitch    : number = 0,
    ) {
        super(position);
        this.lookAt = new Vector3(0, 0, 1);
    }

    private setupViewportProperties() : void {
        const eyepoint = this.getPosition();
        const n = this.lookAt.normalize();
        const u = n.cross(this.up).normalize();
        const v = u.cross(n).normalize();
        const aspectRatio = (this.aspectRatio) ?? this.viewport.h / this.viewport.w;
        const fovScale = (this.fovScale) ?? Math.tan(glMatrix.toRadian(this.fov * 0.5));
        if (!this.aspectRatio) this.aspectRatio = aspectRatio;
        if (!this.fovScale) this.fovScale = fovScale;
        const cam2world : mat4 = [
            u.x, v.x, n.x, 0,
            u.y, v.y, n.y, 0,
            u.z, v.z, n.z, 0,
            -eyepoint.dot(u), -eyepoint.dot(v), -eyepoint.dot(n), 1
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

        const pixels = [];
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
                const uScaled = u.scale(pX * fovScale);
                const vScaled = v.scale(pY * yScale);
                const imgPoint = position.add(uScaled).add(vScaled).add(n.scale(invFocalLen));
                const rayDir = imgPoint.sub(position).normalize();
                const ray = new Ray(position, rayDir, this.viewportProperties);

                let minResult;
                for (let entity of physicalEntities) {
                    const ixResult = entity.intersect(ray);
                    if (ixResult != null && (minResult == null || ixResult.w < minResult.w)) {
                        minResult = ixResult;
                    }
                }

                if (minResult == null) {
                    pixels[p++] = Camera.BG_COLOR;
                } else {
                    pixels[p++] = Color.asColor(minResult.entity.getMaterial());
                }
            }
        }

        return {
            pixels,
        };
    }

    public getLookat() : Vector3 {
        return this.lookAt;
    }

    public setLookat(vector : Vector3) {
        this.lookAt = vector;
    }

    public move(movement : Vector3) {
        const cameraPos = this.getPosition();
        super.setPosition(new Vector3(
            cameraPos.x + movement.x,
            cameraPos.y + movement.y,
            cameraPos.z + movement.z,
        ));
    }

    public rotate(yaw : number, pitch : number) {
        this.yaw   += yaw;
        this.pitch += pitch;
        const yawR   = glMatrix.toRadian(this.yaw);
        const pitchR = glMatrix.toRadian(this.pitch);
        const x = Math.cos(yawR) * Math.cos(pitchR);
        const y = Math.sin(pitchR);
        const z = Math.sin(yawR) * Math.cos(pitchR);
        this.setLookat(this.lookAt.add(new Vector3(x, y, z)).normalize());
    }

    public setViewport(bounds : Bounds) {
        this.viewport = bounds;
    }

}

export default Camera;
export type { IViewportProperties };