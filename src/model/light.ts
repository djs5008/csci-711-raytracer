import Sphere from './entities/sphere';
import { EntityType } from './entity';
import Material from './material';
import { Color, Vector3 } from './util/vector';

export default class Light extends Sphere {
    constructor(
        public position : Vector3,
        public color    : Color,
    ) {
        super(position, 0.5, new Material(color));
        this.type = EntityType.LIGHT;
    }

    public serialize() : any {
        return [
            ...this.position,
            ...this.color,
        ];
    }
}
