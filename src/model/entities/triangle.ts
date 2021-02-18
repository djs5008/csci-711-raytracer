import { vec3 } from "gl-matrix";
import IXResult from "../interfaces/intersection-result";
import PhysicalEntity from "../interfaces/physical-entity";
import Color from "../util/color";
import Ray from "../util/ray";

export default class Triangle extends PhysicalEntity {

    private static EPSILON = 0.0000001;

    constructor(
        public vertices : Array<vec3>,
        public normal   : vec3,
        material? : Color,
    ) {
        super(null);
        this.setMaterial(material);
    }

    public intersect(ray : Ray) : IXResult {
        const vertex0 : vec3 = this.vertices[0];
        const vertex1 : vec3 = this.vertices[1];
        const vertex2 : vec3 = this.vertices[2];

        const edge1 : vec3 = vec3.sub([0,0,0], vertex1, vertex0);
        const edge2 : vec3 = vec3.sub([0,0,0], vertex2, vertex0);

        const h : vec3 = vec3.cross([0,0,0], ray.direction, edge2);
        const a : number  = vec3.dot(edge1, h);
        if (a > -Triangle.EPSILON && a < Triangle.EPSILON) return null;

        const f : number  = 1.0 / a;
        const s : vec3 = vec3.sub([0,0,0], ray.origin, vertex0);
        const u : number  = f * (vec3.dot(s, h));
        if (u < 0 || u > 1) return null;

        const q : vec3 = vec3.cross([0,0,0], s, edge1);
        const v : number  = f * vec3.dot(ray.direction, q);
        if (v < 0 || u + v > 1) return null;

        const t : number = f * vec3.dot(edge2, q);
        if (t > 0) {
            return {
                w: t,
                entity: this,
            };
        }

        return null;
    }

}