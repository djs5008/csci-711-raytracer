import { EntityType } from '../entity';
import PhysicalEntity from '../interfaces/physical-entity';
import { dotVec3, subVec3, Vector3 } from '../util/vector';

export default class Sphere extends PhysicalEntity {
    constructor(
        center : Vector3,
        public radius : number,
        material? : Vector3,
    ) {
        super(EntityType.SPHERE, center, material);
    }

    public getPhysicalProperties() : number[] {
        return [
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
    return sideLength - Math.sqrt(discriminant);
}
