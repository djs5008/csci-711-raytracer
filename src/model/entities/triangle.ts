import { EntityType } from '../entity';
import PhysicalEntity from '../interfaces/physical-entity';
import { crossVec3, dotVec3, subVec3, Vector3 } from '../util/vector';

export default class Triangle extends PhysicalEntity {
    constructor(
        public vertices : Vector3[],
        public normal : Vector3,
        material? : Vector3,
    ) {
        super(EntityType.TRIANGLE, null, material);
    }

    getPhysicalProperties() : number[] {
        const vertices = [];
        for (const vertex of this.vertices) {
            vertices.push(...vertex);
        }
        return [
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
