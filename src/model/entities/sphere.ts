import IXResult from "../interfaces/intersection-result";
import PhysicalEntity from "../interfaces/physical-entity";
import Color from "../util/color";
import Ray from "../util/ray";
import Vector3 from "../util/vector3";

export default class Sphere extends PhysicalEntity {

    constructor(
               center    : Vector3,
        public radius    : number,
               material? : Color,
    ) {
        super(center);
        this.setMaterial(material);
    }

    public intersect(ray : Ray) : IXResult {

        const r = this.radius;
        const eyeToCenter = this.getPosition().sub(ray.origin);
        const v = eyeToCenter.dot(ray.direction);
        if (v < 0) return null;

        const eoDot = eyeToCenter.dot(eyeToCenter);
        const discriminant = ((r * r) - eoDot) + (v * v);

        if (discriminant < 0) return null;
        
        return {
            w: v - Math.sqrt(discriminant),
            entity: this,
        };
    }
    
}