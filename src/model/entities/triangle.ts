import { EntityType } from '../entity';
import PhysicalEntity from '../interfaces/physical-entity';
import Material from '../material';
import { addVec3, crossVec3, dotVec3, normalizeVec3, scaleVec3, subVec3, Vector3 } from '../util/vector';

export default class Triangle extends PhysicalEntity {
    public meshId : number;
    constructor(
        public vertices : Vector3[],
        public normal : Vector3,
        material? : Material,
    ) {
        super(EntityType.TRIANGLE, null, material);
    }

    public getPhysicalProperties() : number[] {
        const vertices = [];
        for (const vertex of this.vertices) {
            vertices.push(...vertex);
        }
        return [
            ...super.getPhysicalProperties(),
            this.meshId,
            ...vertices,
        ];
    }
}

export function triangleIntersect(
    vertex0 : Vector3,
    vertex1 : Vector3,
    vertex2 : Vector3,
    rayPos : Vector3,
    rayDir : Vector3,
) : number {
    const EPSILON = 0.0000001;

    const edge1 = subVec3(vertex1, vertex0);
    const edge2 = subVec3(vertex2, vertex0);

    const h : Vector3 = crossVec3(rayDir, edge2);
    const a : number = dotVec3(edge1, h);
    if (a > -EPSILON && a < EPSILON) return -1;

    const s : Vector3 = subVec3(rayPos, vertex0);
    const f : number = 1.0 / a;
    const u : number = f * dotVec3(s, h);
    if (u < 0 || u > 1) return -1;

    const q : Vector3 = crossVec3(s, edge1);
    const v : number = f * dotVec3(rayDir, q);
    if (v < 0 || u + v > 1) return -1;

    const t : number = f * dotVec3(edge2, q);
    if (t < 0) return -1;

    return t;
}

export function trianglePoint(
    rayPos   : Vector3,
    rayDir   : Vector3,
    distance : number,
) : Vector3 {
    return addVec3(scaleVec3(rayDir, distance), rayPos);
}

export function triangleNormal(
    vertex0 : Vector3,
    vertex1 : Vector3,
    vertex2 : Vector3,
) : Vector3 {
    const edge1 = subVec3(vertex1, vertex0);
    const edge2 = subVec3(vertex2, vertex0);
    return normalizeVec3(crossVec3(edge2, edge1));
}

export function triangleBary(
    point   : Vector3,
    vertex0 : Vector3,
    vertex1 : Vector3,
    vertex2 : Vector3,
) : Vector3 {
    const v0 = subVec3(vertex1, vertex0);
    const v1 = subVec3(vertex2, vertex0);
    const v2 = subVec3(point, vertex0);
    const d00 = dotVec3(v0, v0);
    const d01 = dotVec3(v0, v1);
    const d11 = dotVec3(v1, v1);
    const d20 = dotVec3(v2, v0);
    const d21 = dotVec3(v2, v1);
    const denom = d00 * d11 - d01 * d01;
    const v = (d11 * d20 - d01 * d21) / denom;
    const w = (d00 * d21 - d01 * d20) / denom;
    const u = 1.0 - v - w;
    return [ u, v, w ];
}
