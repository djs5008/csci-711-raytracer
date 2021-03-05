import Sphere from './entities/sphere';
import { EntityType } from './entity';
import Material from './material';
import { addVec3, Color, normalizeVec3, Vector3 } from './util/vector';

export default class Light extends Sphere {
    constructor(
        public position  : Vector3,
        public color     : Color,
        public intensity : number = 5,
        public toggle    : boolean = true,
    ) {
        super(position, 0.5, new Material(color));
        this.type = EntityType.LIGHT;
        this.color = normalizeVec3(addVec3([1, 1, 1], color));
    }

    public serialize() : any {
        return [
            ...this.position,
            ...this.color,
            this.intensity,
            Number(this.toggle),
        ];
    }
}
