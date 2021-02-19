import { ISceneProperties } from "../camera";

export default class Ray {

    constructor(
        public origin      : number[],
        public direction   : number[],
        public cameraProps : ISceneProperties,
    ) { }

}