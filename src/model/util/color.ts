import { vec3 } from "gl-matrix";

export default class Color {

    constructor(
        public r : number,
        public g : number,
        public b : number
    ) {}

    static asColor(vector : vec3) : Color {
        return new Color(vector[0], vector[1], vector[2]);
    }

}