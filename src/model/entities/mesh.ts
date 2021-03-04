import Entity, { EntityType } from '../entity';
import Material from '../material';
import { Matrix4, transformM4 } from '../util/vector';
import Triangle from './triangle';

export default class Mesh extends Entity {
    private _id : number;
    private minX : number = Infinity;
    private minY : number = Infinity;
    private minZ : number = Infinity;
    private maxX : number = -Infinity;
    private maxY : number = -Infinity;
    private maxZ : number = -Infinity;

    get id() {
        return this._id;
    };
    set id(id) {
        for (const triangle of this.triangles) {
            triangle.meshId = id;
        }
        this._id = id;
    }

    constructor(
        public triangles : Array<Triangle>,
        public material  : Material,
    ) {
        super(EntityType.MESH, null, material);
        this.calculateBounds();
    }

    public transform(m : Matrix4) : Mesh {
        for (const triangle of this.triangles) {
            triangle.vertices = [
                transformM4(triangle.vertices[0], m),
                transformM4(triangle.vertices[1], m),
                transformM4(triangle.vertices[2], m),
            ];
        }
        this.calculateBounds();
        return this;
    }

    private calculateBounds() {
        for (const triangle of this.triangles) {
            for (const vertex of triangle.vertices) {
                this.minX = Math.min(vertex[0], this.minX);
                this.minY = Math.min(vertex[1], this.minY);
                this.minZ = Math.min(vertex[2], this.minZ);
                this.maxX = Math.max(vertex[0], this.maxX);
                this.maxY = Math.max(vertex[1], this.maxY);
                this.maxZ = Math.max(vertex[2], this.maxZ);
            }
        }
    }

    private serializeTriangles() : number[][] {
        const result = [];
        for (const triangle of this.triangles) {
            result.push(triangle.getPhysicalProperties());
        }
        return result;
    }

    public getPhysicalProperties() : any {
        return [
            this.minX, this.maxX, this.minY, this.maxY, this.minZ, this.maxZ,
            this.serializeTriangles(),
            -0xFFFFFFFF,
        ];
    }
}
