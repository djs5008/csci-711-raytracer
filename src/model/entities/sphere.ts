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
        // const dx = ray.direction.x;
        // const dy = ray.direction.y;
        // const dz = ray.direction.z;
        // const xc = this.getPosition().x;
        // const yc = this.getPosition().y;
        // const zc = this.getPosition().z;
        // const xo = ray.origin.x;
        // const yo = ray.origin.y;
        // const zo = ray.origin.z;
        // const r = this.radius;

        // // NOTE: Skip A because of normalization step.
        // // const A = Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2);
        // const B = 2 * ((dx * (xo-xc)) + (dy * (yo-yc)) + (dz * (zo-zc)));
        // const C = Math.pow(xo-xc, 2) + Math.pow(yo-yc, 2) + Math.pow(zo-zc, 2) - (r*r);
        // const w = [ (-B + Math.sqrt((B*B) - (4 * C))) / 2, (-B - Math.sqrt((B*B) - (4 * C))) / 2 ].filter((x) => !isNaN(x));
        // const positiveRoots = w.filter((val) => val > 0).sort((a, b) => a-b);
        // const minRoot = (positiveRoots.length > 0) ? positiveRoots[0] : null;

        const r = this.radius;
        const eyeToCenter = this.getPosition().sub(ray.origin);
        const v = eyeToCenter.dot(ray.direction);
        if (v < 0) return null;
        const eoDot = eyeToCenter.dot(eyeToCenter);
        const discriminant = ((r * r) - eoDot) + (v * v);

        if (discriminant < 0) {
            return null;
        } else {
            return {
                w: v - Math.sqrt(discriminant),
                entity: this,
            };
        }

        // return minRoot;
    }
    
}