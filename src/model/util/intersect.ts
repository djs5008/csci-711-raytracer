import { planeIntersect } from '../entities/plane';
import { sphereIntersect } from '../entities/sphere';
import { triangleIntersect } from '../entities/triangle';

export const intersectFunctions = [
    {
        source: sphereIntersect,
        settings: {
            argumentTypes: { center: 'Array(3)', radius: 'Number', rayPos: 'Array(3)', rayDir: 'Array(3)' },
            returnType: 'Number',
        },
    },
    {
        source: planeIntersect,
        settings: {
            argumentTypes: { normal: 'Array(3)', rayPos: 'Array(3)', rayDir: 'Array(3)', e2w: 'Array(3)' },
            returnType: 'Number',
        },
    },
    {
        source: triangleIntersect,
        settings: {
            argumentTypes: { vertex0: 'Array(3)', vertex1: 'Array(3)', vertex2: 'Array(3)', rayPos: 'Array(3)', rayDir: 'Array(3)' },
            returnType: 'Number',
        },
    },
];
