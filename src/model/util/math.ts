export function toRadian(a : number) {
    return (a * Math.PI) / 180;
}

export function clampVal(x : number, lowerlimit : number, upperlimit : number) {
    if (x < lowerlimit) x = lowerlimit;
    if (x > upperlimit) x = upperlimit;
    return x;
}

export function smoothStepVal(edge0 : number, edge1 : number, x : number) {
    x = clampVal((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * (3 - 2 * x);
}

export const mathFunctions = [
    {
        source: toRadian,
        settings: {
            argumentTypes: { a: 'Number' },
            returnType: 'Number',
        },
    },
    {
        source: clampVal,
        settings: {
            argumentTypes: { x: 'Number', lowerlimit: 'Number', upperlimit: 'Number' },
            returnType: 'Number',
        },
    },
    {
        source: smoothStepVal,
        settings: {
            argumentTypes: { edge0: 'Number', edge1: 'Number', x: 'Number' },
            returnType: 'Number',
        },
    },
];
