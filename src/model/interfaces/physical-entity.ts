import Entity from "../entity";

interface PhysicalEntity {
    getPhysicalProperties() : number[]
}

class PhysicalEntity extends Entity {}

export default PhysicalEntity;