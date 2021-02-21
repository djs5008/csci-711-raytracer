import Entity from './entity';
import PhysicalEntity from './interfaces/physical-entity';

export default class World {
    public entities : Array<Entity> = [];

    public add(...entities : Array<Entity>) {
        this.entities = [
            ...this.entities,
            ...entities,
        ];
    }

    public getPhysicalEntities() : number[][] {
        const result : number[][] = [];
        const physicalEntities = [];
        const entities = this.entities;
        for (const entity of entities) {
            if (entity instanceof PhysicalEntity) {
                physicalEntities.push(entity);
            }
        }
        for (const entity of physicalEntities) {
            const physicalProps = Array.from({ ...entity.getPhysicalProperties(), length: 32 });
            result.push([
                entity.type,
                ...(entity.position||[0, 0, 0]),
                ...(entity.material||[1, 1, 1]),
                ...physicalProps,
            ]);
        }
        return result;
    }
}
