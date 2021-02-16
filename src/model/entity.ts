import IXResult from "./interfaces/intersection-result";
import Color from "./util/color";
import Ray from "./util/ray";
import Vector3 from "./util/vector3";

interface Entity {
    intersect?(ray : Ray) : IXResult;
}

abstract class Entity {

    constructor(
        private position : Vector3,
        private material : Color = new Color(255, 255, 255),
    ) { }

    public setPosition(position : Vector3) : void {
        this.position = position;
    }

    public getPosition() : Vector3 {
        return this.position;
    }

    public setMaterial(material : Color) : void {
        this.material = material;
    }

    public getMaterial() : Color {
        return this.material;
    }

    // public addPolygons(...polygons : Array<Polygon>) {
    //     this.polygons = [
    //         ...this.polygons,
    //         ...polygons,
    //     ];
    // }

}

export default Entity;