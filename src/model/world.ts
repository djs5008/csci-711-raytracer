import Entity from "./entity";
import PhysicalEntity from "./interfaces/physical-entity";
import Ray from "./util/ray";

export default class World {

    private entities : Array<Entity> = [];

    public add(...entities : Array<Entity>) {
        this.entities = [
            ...this.entities,
            ...entities
        ];
    }

    public getPhysicalEntities() : Array<PhysicalEntity> {
        const result = [];
        const entities = this.getEntities();
        const totalEntities = entities.length;
        for (let i = 0; i < totalEntities; i++) {
            const entity = entities[i];
            if (entity instanceof PhysicalEntity) {
                result.push(entity);
            }
        }
        return result;
    }

    public getEntities() : Array<Entity> {
        return this.entities;
    }

    public transform(entity : Entity) {
        
    }

    public transformAllObjects() {

    }

    public spawn(ray : Ray) {
        
    }

}