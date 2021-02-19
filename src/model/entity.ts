import { vec3 } from "gl-matrix";
import IXResult from "./interfaces/intersection-result";
import Ray from "./util/ray";

enum EntityType {
    SPHERE, PLANE, TRIANGLE,
}

interface Entity {
    intersect?(ray : Ray) : IXResult;
}

abstract class Entity {

    constructor(
        public type     : EntityType,
        public position : number[],
        public material : number[] = [ 255, 255, 255 ],
    ) { }

    // public addPolygons(...polygons : Array<Polygon>) {
    //     this.polygons = [
    //         ...this.polygons,
    //         ...polygons,
    //     ];
    // }

}

export default Entity;
export { EntityType };