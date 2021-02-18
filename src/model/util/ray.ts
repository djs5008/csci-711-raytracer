import { IViewportProperties } from "../camera";
import { vec3 } from "gl-matrix";

export default class Ray {

    constructor(
        public origin      : vec3,
        public direction   : vec3,
        public cameraProps : IViewportProperties,
    ) { }

}