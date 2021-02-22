import { EntityType } from '../entity';
import PhysicalEntity from '../interfaces/physical-entity';
import { dotVec3, subVec3, Vector3 } from '../util/vector';

export default class Sphere extends PhysicalEntity {
    constructor(
        center : Vector3,
        public radius : number,
        material? : Vector3,
        opacity?  : number,
    ) {
        super(EntityType.SPHERE, center, material, opacity);
    }

    public getPhysicalProperties() : number[] {
        return [
            ...super.getPhysicalProperties(),
            this.radius,
        ];
    }
}

export function sphereIntersect(
    center : Vector3,
    radius : number,
    rayPos : Vector3,
    rayDir : Vector3,
) : number {
    const eyeToCenter = subVec3(center, rayPos);
    const sideLength = dotVec3(eyeToCenter, rayDir);
    const cameraToCenterLength = dotVec3(eyeToCenter, eyeToCenter);
    const discriminant = (radius * radius) - cameraToCenterLength + (sideLength * sideLength);
    if (discriminant < 0) return -1;
    const t1 = sideLength - Math.sqrt(discriminant);
    const t2 = sideLength + Math.sqrt(discriminant);
    const minT = Math.min(t1, t2);
    if (minT < 0) {
        return Math.max(t1, t2);
    } else {
        return minT;
    }
}
