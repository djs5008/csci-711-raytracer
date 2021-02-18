import { vec3 } from "gl-matrix";
import IXResult from "./interfaces/intersection-result";
import Color from "./util/color";
import Ray from "./util/ray";

interface Entity {
    intersect?(ray : Ray) : IXResult;
}

abstract class Entity {

    constructor(
        private position : vec3,
        private material : Color = new Color(255, 255, 255),
    ) { }

    public setPosition(position : vec3) : void {
        this.position = position;
    }

    public getPosition() : vec3 {
        return this.position;
    }

    public setMaterial(material : Color) : void {
        this.material = material;
    }

    public getMaterial() : vec3 {
        return [ this.material.r, this.material.g, this.material.b ];
    }

    // public addPolygons(...polygons : Array<Polygon>) {
    //     this.polygons = [
    //         ...this.polygons,
    //         ...polygons,
    //     ];
    // }

}

export default Entity;