import Camera from '../camera';
import { EntityType } from '../entity';
import PhysicalEntity from '../interfaces/physical-entity';
import { addVec3, dotVec3, scaleVec3, Vector3 } from '../util/vector';

export default class Plane extends PhysicalEntity {
    constructor(
        public normal : Vector3,
    ) {
        super(EntityType.PLANE, null);
        this.material = scaleVec3(Camera.BG_COLOR, 0.75);
    }

    public getPhysicalProperties() : number[] {
        return [
            ...this.normal,
        ];
    }
}

export function planeIntersect(
    normal : Vector3,
    rayPos : Vector3,
    rayDir : Vector3,
    e2w : Vector3,
) : number {
    const denom = dotVec3(normal, rayDir);
    // if (denom <= 0) return -1;

    const p0l0 = scaleVec3(rayPos, -1);
    const t = dotVec3(p0l0, normal) / denom;
    if (t < 0 || t > 50) return -1;

    const point = scaleVec3(addVec3(scaleVec3(addVec3(e2w, rayDir), t), rayPos), 10);

    if (Math.round(point[0]) % 15 === 0 || Math.round(point[2]) % 15 === 0) {
        return t;
    }

    return -1;
}
