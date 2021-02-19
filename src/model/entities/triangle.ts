import { EntityType } from "../entity";
import IXResult from "../interfaces/intersection-result";
import PhysicalEntity from "../interfaces/physical-entity";
import Ray from "../util/ray";
import { crossX, crossY, crossZ, dot, subX, subY, subZ } from "../util/vector3";

export default class Triangle extends PhysicalEntity {

    private static EPSILON = 0.0000001;

    constructor(
        public vertices : number[][],
        public normal   : number[],
        material?       : number[],
    ) {
        super(EntityType.TRIANGLE, null, material);
    }

    public static intersect(triangle : Triangle, ray : Ray) : IXResult {


        return null;
    }

    getPhysicalProperties() : number[] {
        let vertices = [];
        for (let vertex of this.vertices) {
            vertices.push(...vertex);
        }
        return [
            ...vertices,
        ];
    }

}

export function triangleIntersect(
    vertex0x : number,
    vertex0y : number,
    vertex0z : number,
    vertex1x : number,
    vertex1y : number,
    vertex1z : number,
    vertex2x : number,
    vertex2y : number,
    vertex2z : number,
    rayPosX  : number,
    rayPosY  : number,
    rayPosZ  : number,
    rayDirX  : number,
    rayDirY  : number,
    rayDirZ  : number,
) {
    const EPSILON = 0.0000001;

    const edge1 = [
        subX(vertex1x, vertex1y, vertex1z, vertex0x, vertex0y, vertex0z),
        subY(vertex1x, vertex1y, vertex1z, vertex0x, vertex0y, vertex0z),
        subZ(vertex1x, vertex1y, vertex1z, vertex0x, vertex0y, vertex0z),
    ];

    const edge2 = [
        subX(vertex2x, vertex2y, vertex2z, vertex0x, vertex0y, vertex0z),
        subY(vertex2x, vertex2y, vertex2z, vertex0x, vertex0y, vertex0z),
        subZ(vertex2x, vertex2y, vertex2z, vertex0x, vertex0y, vertex0z),
    ];

    const h = [
        crossX(rayDirX, rayDirY, rayDirZ, edge2[0], edge2[1], edge2[2]),
        crossY(rayDirX, rayDirY, rayDirZ, edge2[0], edge2[1], edge2[2]),
        crossZ(rayDirX, rayDirY, rayDirZ, edge2[0], edge2[1], edge2[2]),
    ];

    const a : number = dot(edge1[0], edge1[1], edge1[2], h[0], h[1], h[2]);
    if (a > -EPSILON && a < EPSILON) return -1;

    const s = [
        subX(rayPosX, rayPosY, rayPosZ, vertex0x, vertex0y, vertex0z),
        subY(rayPosX, rayPosY, rayPosZ, vertex0x, vertex0y, vertex0z),
        subZ(rayPosX, rayPosY, rayPosZ, vertex0x, vertex0y, vertex0z),
    ];
    const f : number = 1.0 / a;
    const u : number = f * (dot(s[0], s[1], s[2], h[0], h[1], h[2]));
    if (u < 0 || u > 1) return -1;

    const q = [
        crossX(s[0], s[1], s[2], edge1[0], edge1[1], edge1[2]),
        crossY(s[0], s[1], s[2], edge1[0], edge1[1], edge1[2]),
        crossZ(s[0], s[1], s[2], edge1[0], edge1[1], edge1[2]),
    ];
    const v : number = f * dot(rayDirX, rayDirY, rayDirZ, q[0], q[1], q[2]);
    if (v < 0 || u + v > 1) return -1;

    const t : number = f * dot(edge2[0], edge2[1], edge2[2], q[0], q[1], q[2]);
    if (t < 0) return -1;
    
    return t;
}