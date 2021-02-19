import { EntityType } from "../entity";
import PhysicalEntity from "../interfaces/physical-entity";
import { dot } from "../util/vector3";

export default class Sphere extends PhysicalEntity {

    constructor(
               center    : number[],
        public radius    : number,
               material? : number[],
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
        centerX: number,
        centerY: number,
        centerZ: number,
        radius: number,
        rayPosX: number,
        rayPosY: number,
        rayPosZ: number,
        rayDirX: number,
        rayDirY: number,
        rayDirZ: number) : number {
    const eyeToCenterX = centerX - rayPosX;
    const eyeToCenterY = centerY - rayPosY;
    const eyeToCenterZ = centerZ - rayPosZ;
    const sideLength = dot(eyeToCenterX, eyeToCenterY, eyeToCenterZ, rayDirX, rayDirY, rayDirZ);
    const cameraToCenterLength = dot(eyeToCenterX, eyeToCenterY, eyeToCenterZ, eyeToCenterX, eyeToCenterY, eyeToCenterZ);
    const discriminant = (radius * radius) - cameraToCenterLength + (sideLength * sideLength);
    if (discriminant < 0) {
        return -1;
    } else {
        return sideLength - Math.sqrt(discriminant);
    }
}