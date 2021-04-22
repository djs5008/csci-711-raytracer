export type Vector2 = number[];
export type Vector3 = number[];
export type Matrix4 = number[];
export type Color   = Vector3;
export namespace Vector3 {
    export const UP : Vector3 = [0, 1, 0];
}

export function addVec3(a: Vector3, b: Vector3) : Vector3 {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function subVec3(a: Vector3, b: Vector3) : Vector3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function dotVec3(a: Vector3, b: Vector3) : number {
    return (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
}

export function crossVec3(a : Vector3, b : Vector3) : Vector3 {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

export function scaleVec3(a : Vector3, x : number) : Vector3 {
    return [a[0] * x, a[1] * x, a[2] * x];
}

export function magnitudeVec3(a : Vector3) : number {
    return Math.sqrt(dotVec3(a, a));
}

export function normalizeVec3(a: Vector3) : Vector3 {
    const dot = (a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    const mag = Math.sqrt(dot);
    const x = 1 / mag;
    return [a[0] * x, a[1] * x, a[2] * x];
}

export function multiplyVec3(a : Vector3, b : Vector3) : Vector3 {
    return [
        a[0] * b[0],
        a[1] * b[1],
        a[2] * b[2],
    ];
}

export function transformM4(a : Vector3, m : Matrix4) : Vector3 {
    const x = a[0]; const y = a[1]; const z = a[2];
    const w = m[3] * x + m[7] * y + m[11]* z + m[15];
    return [
        (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
        (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
        (m[2] * x + m[6] * y + m[10] * z + m[14]) / w,
    ];
}

export function toVec3(a : number[]) {
    return [ a[0], a[1], a[2] ];
}

export function reflect(incoming : Vector3, normal : Vector3) : Vector3 {
    return normalizeVec3(subVec3(incoming, scaleVec3(normal, dotVec3(incoming, normal) * 2)));
}

export function transmit(incoming : Vector3, normal : Vector3, ni : number, nt : number) : Vector3 {
    const t1 = scaleVec3(subVec3(incoming, scaleVec3(normal, dotVec3(incoming, normal))), (ni/nt));
    const t2 = 1-((Math.pow(ni, 2)*(1-Math.pow(dotVec3(incoming, normal), 2))/Math.pow(nt, 2)));
    return addVec3(t1, scaleVec3(normal, Math.sqrt(t2)));
}

export const vectorFunctions = [
    {
        source: addVec3,
        settings: {
            argumentTypes: { a: 'Array(3)', b: 'Array(3)' },
            returnType: 'Array(3)',
        },
    },
    {
        source: subVec3,
        settings: {
            argumentTypes: { a: 'Array(3)', b: 'Array(3)' },
            returnType: 'Array(3)',
        },
    },
    {
        source: dotVec3,
        settings: {
            argumentTypes: { a: 'Array(3)', b: 'Array(3)' },
            returnType: 'Number',
        },
    },
    {
        source: crossVec3,
        settings: {
            argumentTypes: { a: 'Array(3)', b: 'Array(3)' },
            returnType: 'Array(3)',
        },
    },
    {
        source: magnitudeVec3,
        settings: {
            argumentTypes: { a: 'Array(3)' },
            returnType: 'Number',
        },
    },
    {
        source: scaleVec3,
        settings: {
            argumentTypes: { a: 'Array(3)', x: 'Number' },
            returnType: 'Array(3)',
        },
    },
    {
        source: normalizeVec3,
        settings: {
            argumentTypes: { a: 'Array(3)' },
            returnType: 'Array(3)',
        },
    },
    {
        source: multiplyVec3,
        settings: {
            argumentTypes: { a: 'Array(3)', b: 'Array(3)' },
            returnType: 'Array(3)',
        },
    },
    {
        source: reflect,
        settings: {
            argumentTypes: { incoming: 'Array(3)', normal: 'Array(3)' },
            returnType: 'Array(3)',
        },
    },
    {
        source: transmit,
        settings: {
            argumentTypes: { incoming: 'Array(3)', normal: 'Array(3)', ni: 'Number', nt: 'Number' },
            returnType: 'Array(3)',
        },
    },
    // {
    //     source: toVec3,
    //     settings: {
    //         argumentTypes: { a: 'Array' },
    //         returnType: 'Array(3)',
    //     },
    // },
];
