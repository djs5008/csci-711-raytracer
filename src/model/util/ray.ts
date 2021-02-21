import { ISceneProperties } from '../camera';
import { Vector3 } from './vector';

export default class Ray {
    constructor(
        public origin : Vector3,
        public direction : Vector3,
        public cameraProps : ISceneProperties,
    ) { }
}
