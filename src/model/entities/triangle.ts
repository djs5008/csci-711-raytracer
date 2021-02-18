import IXResult from "../interfaces/intersection-result";
import PhysicalEntity from "../interfaces/physical-entity";
import Color from "../util/color";
import Ray from "../util/ray";
import Vector3 from "../util/vector3";

export default class Triangle extends PhysicalEntity {

    private static EPSILON = 0.0000001;

    constructor(
        public vertices : Array<Vector3>,
        public normal   : Vector3,
        material? : Color,
    ) {
        super(null);
        this.setMaterial(material);
    }

    public intersect(ray : Ray) : IXResult {
        const vertex0 : Vector3 = this.vertices[0];
        const vertex1 : Vector3 = this.vertices[1];
        const vertex2 : Vector3 = this.vertices[2];

        const edge1 : Vector3 = vertex1.sub(vertex0);
        const edge2 : Vector3 = vertex2.sub(vertex0);

        const h : Vector3 = ray.direction.cross(edge2);
        const a : number  = edge1.dot(h);
        if (a > -Triangle.EPSILON && a < Triangle.EPSILON) return null;

        const f : number  = 1.0 / a;
        const s : Vector3 = ray.origin.sub(vertex0);
        const u : number  = f * (s.dot(h));
        if (u < 0 || u > 1) return null;

        const q : Vector3 = s.cross(edge1);
        const v : number  = f * ray.direction.dot(q);
        if (v < 0 || u + v > 1) return null;

        const t : number = f * edge2.dot(q);
        if (t > 0) {
            return {
                w: t,
                entity: this,
            };
        }

        return null;
    }

}