import { EntityType } from '../entity';
import PhysicalEntity from '../interfaces/physical-entity';
import Material from '../material';
import { addVec3, dotVec3, normalizeVec3, scaleVec3, subVec3, Vector3 } from '../util/vector';

export default class Sphere extends PhysicalEntity {
    constructor(
        public center : Vector3,
        public radius : number,
        material? : Material,
    ) {
        super(EntityType.SPHERE, center, material);
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
    let min = -1;
    if (discriminant < 0) return min;
    const t1 = sideLength - Math.sqrt(discriminant);
    const t2 = sideLength + Math.sqrt(discriminant);
    // find min positive
    if (t1 > 0 && t2 < 0)      min = t1;
    else if (t2 > 0 && t1 < 0) min = t2;
    else if (t1 > 0 && t2 > 0) min = Math.min(t1, t2);

    if (min < 0) return min;

    return min;
}

export function sphereNormal(
    center   : Vector3,
    rayPos   : Vector3,
    rayDir   : Vector3,
    distance : number,
) : Vector3 {
    const point = spherePoint(rayPos, rayDir, distance);
    return normalizeVec3(subVec3(center, point));
}

export function spherePoint(
    rayPos   : Vector3,
    rayDir   : Vector3,
    distance : number,
) {
    return addVec3(scaleVec3(rayDir, distance), rayPos);
}
