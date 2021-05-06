import { EntityType } from '../entity';
import PhysicalEntity from '../interfaces/physical-entity';
import Material from '../material';
import { addVec3, dotVec3, scaleVec3, Vector3 } from '../util/vector';

export default class Plane extends PhysicalEntity {
    constructor(
        public normal    : Vector3,
        material? : Material,
    ) {
        super(EntityType.PLANE, null, material);
    }

    public getPhysicalProperties() : number[] {
        return [
            ...super.getPhysicalProperties(),
            ...this.normal,
        ];
    }
}

export function planeIntersect(
    normal : Vector3,
    rayPos : Vector3,
    rayDir : Vector3,
) : number {
    const denom = dotVec3(normal, rayDir);
    if (denom > 0) return -1;

    const p0l0 = scaleVec3(rayPos, -1);
    const t = dotVec3(p0l0, normal) / denom;
    if (t < 0) return -1;
    return t;
}

export function planePoint(
    rayPos   : Vector3,
    rayDir   : Vector3,
    distance : number,
) {
    return addVec3(scaleVec3(rayDir, distance), rayPos);
}
