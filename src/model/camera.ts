import { glMatrix } from "gl-matrix";
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
    scale                    : number;
}

export default class Camera extends Entity {

    // public static BG_COLOR = new Color(1, 0, 1);
    public static BG_COLOR = new Color(0.251, 0.59, 1);
    public viewportProperties : IViewportProperties;

    constructor(
        private world    : World,
        private viewport : Bounds,
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
        const aspectRatio = this.viewport.h / this.viewport.w;
        const scale = Math.tan(glMatrix.toRadian(this.fov * 0.5));
        this.viewportProperties = {
            n,
            u,
            v,
            aspectRatio,
            scale,
        };
    }

    public render() : IRenderData {
        // console.time('RENDER TIME');
        this.setupViewportProperties();

        const pixels = [];
        const { w, h } = this.viewport;
        const { aspectRatio, scale, n, u, v } = this.viewportProperties;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                const pX = 1 - (x / w) - 0.5;
                const pY = 1 - (y / h) - 0.5;
                const uScaled = u.scale(pX * scale);
                const vScaled = v.scale(pY * scale * aspectRatio);
                const imgPoint = this.getPosition().add(uScaled).add(vScaled).add(n.scale(1 / this.focalLen));
                const rayDir = imgPoint.sub(this.getPosition()).normalize();
                const ray = new Ray(this.getPosition(), rayDir, this);

                let minResult;
                for (let entity of this.world.getPhysicalEntities()) {
                    const ixResult = entity.intersect(ray);
                    if (ixResult != null && (minResult == null || ixResult.w < minResult.w)) {
                        minResult = ixResult;
                    }
                }

                // pixels.push((minResult != null) ? Color.asColor(minResult.entity.getMaterial().scale(10/minResult.w)) : BG_COLOR);
                pixels.push((minResult != null) ? Color.asColor(minResult.entity.getMaterial()) : Camera.BG_COLOR);
            }
        }

        // console.timeEnd('RENDER TIME');
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
        super.setPosition(new Vector3(
            this.getPosition().x + movement.x,
            this.getPosition().y + movement.y,
            this.getPosition().z + movement.z,
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