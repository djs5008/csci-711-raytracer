import { vec3 } from "gl-matrix";
import Camera from "../camera";
import IXResult from "../interfaces/intersection-result";
import PhysicalEntity from "../interfaces/physical-entity";
import Color from "../util/color";
import Ray from "../util/ray";

export default class Plane extends PhysicalEntity {

    constructor(
        private normal : vec3,
    ) {
        super(null);
        this.setMaterial(Color.asColor(vec3.add([0,0,0], [0, 0, 0], vec3.scale([0, 0, 0], Camera.BG_COLOR, 0.75))));
    }

    intersect(ray : Ray) : IXResult {
        const denom = vec3.dot(this.normal, ray.direction);
        if (denom <= 0) return null;

        let p0l0;
        p0l0 = vec3.scale([0,0,0], ray.origin, -1);
        const t = vec3.dot(p0l0, this.normal) / denom;
        if (t < 0 || t > 25) return null;

        const { cam2world } = ray.cameraProps;
        const point = vec3.scale([0,0,0], vec3.add([0,0,0], vec3.scale([0,0,0], vec3.add([0,0,0], vec3.transformMat4([0,0,0], ray.origin, cam2world), ray.direction), t), ray.origin), 10);

        if (Math.round(point[0]) % 15 === 0 || Math.round(point[2]) % 15 === 0) {
            return {
                w: t,
                entity: this,
            };
        }

        return null;
    }

}