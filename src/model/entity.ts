import Material from './material';
import { Vector3 } from './util/vector';

export enum EntityType {
    SPHERE, PLANE, TRIANGLE, VOXEL, LIGHT, MESH
}

export default abstract class Entity {
    constructor(
        public type : EntityType,
        public position : Vector3,
        public material : Material = new Material(),
        public textureId : number  = -1,
        public texOffset : Vector3 = [ 0, 0, 0 ],
    ) { }
}
