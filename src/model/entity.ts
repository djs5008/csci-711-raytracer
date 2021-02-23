import Material from './material';
import { Vector3 } from './util/vector';

export enum EntityType {
    SPHERE, PLANE, TRIANGLE,
}

export default abstract class Entity {
    constructor(
        public type : EntityType,
        public position : Vector3,
        public material : Material = new Material(),
    ) { }
}
