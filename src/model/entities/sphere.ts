import { EntityType } from '../entity';
import PhysicalEntity from '../interfaces/physical-entity';
import Material from '../material';
import { dotVec3, subVec3, Vector3 } from '../util/vector';

export default class Sphere extends PhysicalEntity {
    constructor(
        public center : Vector3,
        public radius : number,
        material? : Material,
    ) {
        super(
            EntityType.SPHERE,
            center,
            new Material(
                material?.diffuseColor,
                material?.specularColor,
                material?.ambient,
                material?.diffuse,
                material?.specular,
                material?.exponent,
                material?.opacity,
            ),
        );
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
    if (t1 > 0) return t1;
    if (t2 > 0) return t2;
    return -1;
}
