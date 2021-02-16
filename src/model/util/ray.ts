import Camera from "../camera";
import Vector3 from "./vector3";

export default class Ray {

    constructor(
        public origin      : Vector3,
        public direction   : Vector3,
        public camera      : Camera,
    ) { }

}