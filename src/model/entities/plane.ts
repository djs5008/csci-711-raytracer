import Camera from "../camera";
import { EntityType } from "../entity";
import PhysicalEntity from "../interfaces/physical-entity";
import { addVec3, addX, addY, addZ, dot, scaleVec3, scaleX, scaleY, scaleZ, transformM4X, transformM4Y, transformM4Z } from "../util/vector3";

export default class Plane extends PhysicalEntity {

    constructor(
        public normal : number[],
    ) {
        super(EntityType.PLANE, null);
        this.material = addVec3([0,0,0], scaleVec3(Camera.BG_COLOR, 0.75));
    }

    public getPhysicalProperties() : number[] {
        return [
            ...this.normal,
        ];
    }

    // public static intersect(plane : Plane, ray : Ray) : IXResult {
    //     const denom = vec3.dot(plane.normal, ray.direction);
    //     if (denom <= 0) return null;

    //     let p0l0;
    //     p0l0 = vec3.scale([0,0,0], ray.origin, -1);
    //     const t = vec3.dot(p0l0, plane.normal) / denom;
    //     if (t < 0 || t > 25) return null;

    //     const { cam2world } = ray.cameraProps;
    //     const point = vec3.scale([0,0,0], vec3.add([0,0,0], vec3.scale([0,0,0], vec3.add([0,0,0], vec3.transformMat4([0,0,0], ray.origin, cam2world), ray.direction), t), ray.origin), 10);

    //     if (Math.round(point[0]) % 15 === 0 || Math.round(point[2]) % 15 === 0) {
    //         return {
    //             w: t,
    //             entity: plane,
    //         };
    //     }

    //     return null;
    // }

}

export function planeIntersect(
        normalX: number,
        normalY: number,
        normalZ: number, 
        rayPosX: number,
        rayPosY: number, 
        rayPosZ: number, 
        rayDirX: number, 
        rayDirY: number, 
        rayDirZ: number,
        m11: number, m21: number, m31: number, m41: number,
        m12: number, m22: number, m32: number, m42: number,
        m13: number, m23: number, m33: number, m43: number,
        m14: number, m24: number, m34: number, m44: number) {
    const denom = dot(rayDirX, rayDirY, rayDirZ, normalX, normalY, normalZ);
    if (denom == 0) return -1;
        const t = -(rayPosX * normalX + rayPosY * normalY + rayPosZ * normalZ) / denom;
        if (t < 0) return -1;
        
        const trans = [
            transformM4X(rayPosX, rayPosY, rayPosZ, m11, m21, m31, m41,
                                                    m12, m22, m32, m42,
                                                    m13, m23, m33, m43,
                                                    m14, m24, m34, m44),
            transformM4Y(rayPosX, rayPosY, rayPosZ, m11, m21, m31, m41,
                                                    m12, m22, m32, m42,
                                                    m13, m23, m33, m43,
                                                    m14, m24, m34, m44),
            transformM4Z(rayPosX, rayPosY, rayPosZ, m11, m21, m31, m41,
                                                    m12, m22, m32, m42,
                                                    m13, m23, m33, m43,
                                                    m14, m24, m34, m44),
        ];
        const point1 = [
            addX(trans[0], trans[1], trans[2], rayDirX, rayDirY, rayDirZ),
            addY(trans[0], trans[1], trans[2], rayDirX, rayDirY, rayDirZ),
            addZ(trans[0], trans[1], trans[2], rayDirX, rayDirY, rayDirZ),
        ];
        const point2 = [
            scaleX(point1[0], point1[1], point1[2], t),
            scaleY(point1[0], point1[1], point1[2], t),
            scaleZ(point1[0], point1[1], point1[2], t),
        ];
        const point3 = [
            addX(point2[0], point2[1], point2[2], rayPosX, rayPosY, rayPosZ),
            addY(point2[0], point2[1], point2[2], rayPosX, rayPosY, rayPosZ),
            addZ(point2[0], point2[1], point2[2], rayPosX, rayPosY, rayPosZ),
        ];
        const point = [
            scaleX(point3[0], point3[1], point3[2], 10),
            scaleY(point3[0], point3[1], point3[2], 10),
            scaleZ(point3[0], point3[1], point3[2], 10),
        ];

        if (Math.round(point[0]) % 15 === 0 || Math.round(point[2]) % 15 === 0) {
            return t;
        }
        
        return -1;
}