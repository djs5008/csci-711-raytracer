import IXResult from "../interfaces/intersection-result";
import PhysicalEntity from "../interfaces/physical-entity";
import Ray from "../util/ray";
import Vector3 from "../util/vector3";

export default class Polygon extends PhysicalEntity {

    vertices : Array<Vector3> = [];
    normal   : Vector3        = null;

    public intersect(ray : Ray) : IXResult {
        return {
            w: null,
            entity: this,
        };
    }

}