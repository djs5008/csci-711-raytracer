import Entity from '../entity';

interface PhysicalEntity {
    getPhysicalProperties() : number[]
}

class PhysicalEntity extends Entity {
    public getPhysicalProperties() : number[] {
        return [
            this.type,
            ...(this.position||[0, 0, 0]),
            ...this.material.toArray(),
        ];
    }
}

export default PhysicalEntity;
