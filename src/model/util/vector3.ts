export class Vector3 {
    static UP : number[] = [0, 1, 0];
}

export function addVec3(a: number[], b: number[]) : number[] {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function addX(x1: number, x2: number, x3: number, y1: number, y2: number, y3: number) : number { return x1 + y1; }
export function addY(x1: number, x2: number, x3: number, y1: number, y2: number, y3: number) : number { return x2 + y2; }
export function addZ(x1: number, x2: number, x3: number, y1: number, y2: number, y3: number) : number { return x3 + y3; }

export function subVec3(a: number[], b: number[]) : number[] {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function subX(x1: number, x2: number, x3: number, y1: number, y2: number, y3: number) : number { return x1 - y1; }
export function subY(x1: number, x2: number, x3: number, y1: number, y2: number, y3: number) : number { return x2 - y2; }
export function subZ(x1: number, x2: number, x3: number, y1: number, y2: number, y3: number) : number { return x3 - y3; }

export function dotVec3(a: number[], b: number[]) : number {
    return (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
}

export function dot(x1 : number, x2: number, x3: number, y1: number, y2: number, y3: number) : number {
    return x1 * y1 + x2 * y2 + x3 * y3; 
}

export function crossVec3(a : number[], b : number[]) : number[] {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
};

export function crossX(x1: number, x2: number, x3: number, y1: number, y2: number, y3: number) : number {
    return x2 * y3 - x3 * y2;
} 
  
export function crossY(x1: number, x2: number, x3: number, y1: number, y2: number, y3: number) : number {
    return x3 * y1 - x1 * y3;
}

export function crossZ(x1: number, x2: number, x3: number, y1: number, y2: number, y3: number) : number {
    return x1 * y2 - x2 * y1;
}

export function scaleVec3(a : number[], x : number) : number[] {
    return [a[0] * x, a[1] * x, a[2] * x];
}

export function scaleX(x1: number, x2: number, x3: number, scale: number) : number { return scale * x1; }
export function scaleY(x1: number, x2: number, x3: number, scale: number) : number { return scale * x2; }
export function scaleZ(x1: number, x2: number, x3: number, scale: number) : number { return scale * x3; }

export function normalizeVec3(a: number[]) : number[] {
    let mag = magnitudeVec3(a);
    return scaleVec3(a, 1 / mag);
}

export function normalizeX(x1: number, x2: number, x3: number) {
    var mag = magnitude(x1, x2, x3);
    return scaleX(x1, x2, x3, 1 / mag);
}
  
export function normalizeY(x1: number, x2: number, x3: number) {
    var mag = magnitude(x1, x2, x3);
    return scaleY(x1, x2, x3, 1 / mag);
}

export function normalizeZ(x1: number, x2: number, x3: number) {
    var mag = magnitude(x1, x2, x3);
    return scaleZ(x1, x2, x3, 1 / mag);
}

export function magnitudeVec3(a : number[]) : number {
    return Math.sqrt(dotVec3(a, a));
}

export function magnitude(x1: number, x2: number, x3: number) : number {
    return Math.sqrt(x1 * x1 + x2 * x2 + x3 * x3);
}

export function transformM4X(
    x : number, y: number, z : number, 
    m11 : number, m21 : number, m31 : number, m41 : number,
    m12 : number, m22 : number, m32 : number, m42 : number,
    m13 : number, m23 : number, m33 : number, m43 : number,
    m14 : number, m24 : number, m34 : number, m44 : number) {
    let w = m41 * x + m42 * y + m43 * z + m44;
    return (m11 * x + m12 * y + m13 * z + m14) / w;
}

export function transformM4Y(
    x : number, y: number, z : number, 
    m11 : number, m21 : number, m31 : number, m41 : number,
    m12 : number, m22 : number, m32 : number, m42 : number,
    m13 : number, m23 : number, m33 : number, m43 : number,
    m14 : number, m24 : number, m34 : number, m44 : number) {
    let w = m41 * x + m42 * y + m43 * z + m44;
    return (m21 * x + m22 * y + m23 * z + m24) / w;
}

export function transformM4Z(
    x : number, y: number, z : number, 
    m11 : number, m21 : number, m31 : number, m41 : number,
    m12 : number, m22 : number, m32 : number, m42 : number,
    m13 : number, m23 : number, m33 : number, m43 : number,
    m14 : number, m24 : number, m34 : number, m44 : number) {
    let w = m41 * x + m42 * y + m43 * z + m44;
    return (m31 * x + m32 * y + m33 * z + m34) / w;
}

export const vectorFunctions = [
    addX, addY, addZ,
    subX, subY, subZ,
    crossX, crossY, crossZ,
    scaleX, scaleY, scaleZ,
    normalizeX, normalizeY, normalizeZ,
    transformM4X, transformM4Y, transformM4Z,
    dot, magnitude
];