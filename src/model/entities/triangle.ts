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
        let edge1 : Vector3 = new Vector3();
        let edge2 : Vector3 = new Vector3();
        let h : Vector3 = new Vector3();
        let s : Vector3 = new Vector3();
        let q : Vector3 = new Vector3();

        let a, f, u, v;

        edge1 = vertex1.sub(vertex0);
        edge2 = vertex2.sub(vertex0);

        h = ray.direction.cross(edge2);
        a = edge1.dot(h);
        if (a > -Triangle.EPSILON && a < Triangle.EPSILON) {
            return null;    // This ray is parallel to this triangle.
        }
        f = 1.0 / a;
        s = ray.origin.sub(vertex0);
        u = f * (s.dot(h));
        if (u < 0.0 || u > 1.0) {
            return null;
        }
        q = s.cross(edge1);
        v = f * ray.direction.dot(q);
        if (v < 0.0 || u + v > 1.0) {
            return null;
        }
        // At this stage we can compute t to find out where the intersection point is on the line.
        const t = f * edge2.dot(q);
        if (t > Triangle.EPSILON) // ray intersection
        {
            // outIntersectionPoint.set(0.0, 0.0, 0.0);
            // outIntersectionPoint.scaleAdd(t, rayVector, rayOrigin);
            return {
                w: t,
                entity: this,
            };
        } else // This means that there is a line intersection but not a ray intersection.
        {
            return null;
        }
    }

}