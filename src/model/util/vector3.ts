import { mat4, vec3 } from 'gl-matrix';

export default class Vector3 {

    static readonly UP : Vector3 = new Vector3(0, 1, 0);

    constructor(
        public x : number = 0,
        public y : number = 0,
        public z : number = 0,
    ) { }

    static asVec3(vector : Vector3) : vec3 { return [ vector.x, vector.y, vector.z ]; }

    public add(vector : Vector3) : Vector3 {
        let result : vec3 = Vector3.asVec3(this);
        vec3.add(result, Vector3.asVec3(this), Vector3.asVec3(vector));
        return new Vector3(result[0], result[1], result[2]);
    }

    public subtract(vector : Vector3) : Vector3 { return this.sub(vector); }
    public sub(vector : Vector3) : Vector3 {
        let result : vec3 = Vector3.asVec3(this);
        vec3.sub(result, Vector3.asVec3(this), Vector3.asVec3(vector));
        return new Vector3(result[0], result[1], result[2]);
    }

    public cross(vector : Vector3) : Vector3 {
        let result : vec3 = Vector3.asVec3(this);
        vec3.cross(result, Vector3.asVec3(this), Vector3.asVec3(vector));
        return new Vector3(result[0], result[1], result[2]);
    }

    public length() : number {
        return vec3.length(Vector3.asVec3(this));
    }

    public normalize() : Vector3 {
        let result : vec3 = Vector3.asVec3(this);
        vec3.normalize(result, Vector3.asVec3(this));
        return new Vector3(result[0], result[1], result[2]);
    }

    public transform(matrix : mat4) : Vector3 {
        let result : vec3 = Vector3.asVec3(this);
        vec3.transformMat4(result, Vector3.asVec3(this), matrix);
        return new Vector3(result[0], result[1], result[2]);
    }

    public dot(vector : Vector3) : number {
        return vec3.dot(Vector3.asVec3(this), Vector3.asVec3(vector));
    }

    public scale(scale : number) : Vector3 {
        let result : vec3 = Vector3.asVec3(this);
        vec3.scale(result, Vector3.asVec3(this), scale);
        return new Vector3(result[0], result[1], result[2]);
    }

    public mult(vector : Vector3) : Vector3 { return this.multiply(vector); }
    public multiply(vector : Vector3) : Vector3 {
        let result : vec3 = Vector3.asVec3(this);
        vec3.multiply(result, Vector3.asVec3(this), Vector3.asVec3(vector));
        return new Vector3(result[0], result[1], result[2]);
    }

    public distance(point : Vector3) : number { return this.dist(point); }
    public dist(point : Vector3) : number {
        return vec3.dist(Vector3.asVec3(this), Vector3.asVec3(point));
    }
}