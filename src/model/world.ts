import Camera from './camera';
import Mesh from './entities/mesh';
import Entity from './entity';
import PhysicalEntity from './interfaces/physical-entity';
import Light from './light';
import Texture from './texture';
import { Color } from './util/vector';

export default class World {
    public cameras      : Array<Camera>  = [];
    public entities     : Array<Entity>  = [];
    public lights       : Array<Light>   = [];
    public meshes       : Array<Mesh>    = [];
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
        this.addEntities(...lights);
    }

    public addCameras(...cameras : Array<Camera>) {
        this.cameras = [
            ...this.cameras,
            ...cameras,
        ];
    }

    public addMesh(...meshes : Array<Mesh>) {
        let index = this.meshes.length;
        for (const mesh of meshes) {
            mesh.id = index++;
            this.meshes.push(mesh);
        }
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

    public getMeshes() : any {
        return this.meshes;
    }

    public getTextures() : any {
        return this.textures.map((tex) => tex.serialize());
    }
}
