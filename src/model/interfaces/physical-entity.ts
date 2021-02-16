import Entity from "../entity";
import Ray from "../util/ray";
import IXResult from "./intersection-result";

interface PhysicalEntity {
    intersect(ray : Ray) : IXResult;
}

class PhysicalEntity extends Entity {}

export default PhysicalEntity;