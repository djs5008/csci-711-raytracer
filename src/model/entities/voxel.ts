import { EntityType } from '../entity';
import PhysicalEntity from '../interfaces/physical-entity';
import Material from '../material';
import { addVec3, normalizeVec3, scaleVec3, Vector3 } from '../util/vector';

export default class Voxel extends PhysicalEntity {
    constructor(
        public width : number,
        public height : number,
        public depth : number,
        public position : Vector3,
        public material : Material,
    ) {
        super(EntityType.VOXEL, position, material);
    }

    public getPhysicalProperties() : number[] {
        const minX = this.position[0] - (this.width  / 2);
        const minY = this.position[1] - (this.height / 2);
        const minZ = this.position[2] - (this.depth  / 2);
        const maxX = this.position[0] + (this.width  / 2);
        const maxY = this.position[1] + (this.height / 2);
        const maxZ = this.position[2] + (this.depth  / 2);
        return [
            ...super.getPhysicalProperties(),
            minX, minY, minZ, maxX, maxY, maxZ,
        ];
    }
}

export function voxelIntersect(
    rayPos : Vector3,
    rayDir : Vector3,
    minX : number,
    maxX : number,
    minY : number,
    maxY : number,
    minZ : number,
    maxZ : number,
) : number {
    const invdir = [ 1 / rayDir[0], 1 / rayDir[1], 1 / rayDir[2] ];
    const lb = [
        Math.min(minX, maxX),
        Math.min(minY, maxY),
        Math.min(minZ, maxZ),
    ];
    const rt = [
        Math.max(minX, maxX),
        Math.max(minY, maxY),
        Math.max(minZ, maxZ),
    ];
    const t1 = (lb[0] - rayPos[0])*invdir[0];
    const t2 = (rt[0] - rayPos[0])*invdir[0];
    const t3 = (lb[1] - rayPos[1])*invdir[1];
    const t4 = (rt[1] - rayPos[1])*invdir[1];
    const t5 = (lb[2] - rayPos[2])*invdir[2];
    const t6 = (rt[2] - rayPos[2])*invdir[2];

    const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
    const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));

    if (tmax < 0) {
        // t = tmax;
        return -1;
    }

    if (tmin > tmax) {
        // t = tmax;
        return -1;
    }

    // t = tmin;
    return tmin;
}

export function voxelPoint(
    rayPos   : Vector3,
    rayDir   : Vector3,
    distance : number,
) : Vector3 {
    return addVec3(rayPos, scaleVec3(rayDir, distance));
}

export function voxelNormal(
    minX  : number,
    maxX  : number,
    minY  : number,
    maxY  : number,
    minZ  : number,
    maxZ  : number,
    point : Vector3,
) : Vector3 {
    const EPSILON = 0.00001;
    let result = [ 0, 0, 0 ];
    if (Math.abs(point[0] - minX) <= EPSILON) result = [  1,  0,  0 ];
    else if (Math.abs(point[0] - maxX) <= EPSILON) result = [ -1,  0,  0 ];
    else if (Math.abs(point[1] - minY) <= EPSILON) result = [  0,  1,  0 ];
    else if (Math.abs(point[1] - maxY) <= EPSILON) result = [  0, -1,  0 ];
    else if (Math.abs(point[2] - minZ) <= EPSILON) result = [  0,  0,  1 ];
    else if (Math.abs(point[2] - maxZ) <= EPSILON) result = [  0,  0, -1 ];
    return normalizeVec3(result);
}
