import Vector3 from "./vector3";
import { IViewportProperties } from "../camera";

export default class Ray {

    constructor(
        public origin      : Vector3,
        public direction   : Vector3,
        public cameraProps : IViewportProperties,
    ) { }

}