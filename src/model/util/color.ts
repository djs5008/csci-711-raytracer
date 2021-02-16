import Vector3 from "./vector3";

export default class Color extends Vector3 {

    constructor(
        public r : number,
        public g : number,
        public b : number
    ) {
        super(r, g, b);
    }

    static asColor(vector : Vector3) : Color {
        return new Color(vector.x, vector.y, vector.z);
    }

}