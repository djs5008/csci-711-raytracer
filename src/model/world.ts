import Entity from "./entity";
import PhysicalEntity from "./interfaces/physical-entity";

export default class World {

    public entities         : Array<Entity> = [];

    public add(...entities : Array<Entity>) {
        this.entities = [
            ...this.entities,
            ...entities
        ];
    }

    public getPhysicalEntities() : number[][] {
        const result : number[][] = [];
        const physicalEntities = [];
        const entities = this.entities;
        for (let entity of entities) {
            if (entity instanceof PhysicalEntity) {
                physicalEntities.push(entity);
            }
        }
        for (let entity of physicalEntities) {
            const physicalProps = entity.getPhysicalProperties();
            const physicalPropsArr = Array.from({ ...physicalProps, length: 32 });
            result.push([
                entity.type,
                ...(entity.position||[0,0,0]),
                ...(entity.material||[1,1,1]),
                ...physicalPropsArr,
            ]);
        }
        return result;
    }

}