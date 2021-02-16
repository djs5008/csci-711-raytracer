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
        return this.getEntities().filter((entity) : entity is PhysicalEntity => entity instanceof PhysicalEntity);
    }

    public getEntities() : Array<Entity> {
        return [ ...this.entities ];
    }

    public transform(entity : Entity) {
        
    }

    public transformAllObjects() {

    }

    public spawn(ray : Ray) {
        
    }

}