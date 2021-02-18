import { mat4 } from "gl-matrix";
import Camera from "../camera";
import IXResult from "../interfaces/intersection-result";
import PhysicalEntity from "../interfaces/physical-entity";
import Color from "../util/color";
import Ray from "../util/ray";
import Vector3 from "../util/vector3";

export default class Plane extends PhysicalEntity {

    constructor(
        private normal : Vector3,
    ) {
        super(null);
        this.setMaterial(Color.asColor((new Vector3(0, 0, 0).add(Camera.BG_COLOR.scale(0.75)))));
    }

    intersect(ray : Ray) : IXResult {
        const denom = this.normal.dot(ray.direction); 
        if (denom <= 0) return null;

        const p0l0 : Vector3 = ray.origin.scale(-1); 
        const t = p0l0.dot(this.normal) / denom;
        if (t < 0 || t > 25) return null;

        const { cam2world } = ray.cameraProps;
        const point = ray.origin.transform(cam2world).add(ray.direction.scale(t)).add(ray.origin).scale(10);

        if (Math.round(point.x) % 15 === 0 || Math.round(point.z) % 15 === 0) {
            return {
                w: t,
                entity: this,
            };
        }

        return null;
    }

}