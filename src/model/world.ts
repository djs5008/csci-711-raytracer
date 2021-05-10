import Camera from './camera';
import Entity from './entity';
import PhysicalEntity from './interfaces/physical-entity';
import Light from './light';
import Texture from './texture';
import { Color } from './util/vector';

export default class World {
    public cameras      : Array<Camera>  = [];
    public entities     : Array<Entity>  = [];
    public lights       : Array<Light>   = [];
    public textures     : Array<Texture> = [];
    public ambientLight : Color;

    public addEntities(...entities : Array<Entity>) {
        this.entities = [
            ...this.entities,
            ...entities,
        ];
    }

    public addLights(...lights : Array<Light>) {
        this.lights = [
            ...this.lights,
            ...lights,
        ];
        // this.addEntities(...lights);
    }

    public addCameras(...cameras : Array<Camera>) {
        this.cameras = [
            ...this.cameras,
            ...cameras,
        ];
    }

    public addTextures(...textures : Array<Texture>) {
        this.textures = [
            ...this.textures,
            ...textures,
        ];
    }

    public getEntities() : any {
        const result = [];
        for (const entity of (<Array<PhysicalEntity>> this.entities)) {
            const physicalProps = Array.from({ ...entity.getPhysicalProperties(), length: 32 });
            result.push([ ...physicalProps ]);
        }
        return result;
    }

    public getLights() : any {
        const result = [];
        for (const light of (<Array<Light>> this.lights)) {
            result.push([ ...light.serialize() ]);
        }
        return result;
    }

    public getTextures() : any {
        return this.textures.map((tex) => tex.serialize());
    }
}
