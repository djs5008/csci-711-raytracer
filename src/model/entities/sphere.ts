import { vec3 } from "gl-matrix";
import IXResult from "../interfaces/intersection-result";
import PhysicalEntity from "../interfaces/physical-entity";
import Color from "../util/color";
import Ray from "../util/ray";

export default class Sphere extends PhysicalEntity {

    constructor(
               center    : vec3,
        public radius    : number,
               material? : Color,
    ) {
        super(center);
        this.setMaterial(material);
    }

    public intersect(ray : Ray) : IXResult {

        const r = this.radius;
        let eyeToCenter, v, eoDot;
        eyeToCenter = vec3.sub([0,0,0], this.getPosition(), ray.origin);
        v = vec3.dot(eyeToCenter, ray.direction);
        if (v < 0) return null;

        eoDot = vec3.dot(eyeToCenter, eyeToCenter);
        const discriminant = ((r * r) - eoDot) + (v * v);

        if (discriminant < 0) return null;
        
        return {
            w: v - Math.sqrt(discriminant),
            entity: this,
        };
    }
    
}