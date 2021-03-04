import { voxelIntersect, voxelNormal, voxelPoint } from '../entities/voxel';
import { planeIntersect, planePoint } from '../entities/plane';
import { sphereIntersect, sphereNormal, spherePoint } from '../entities/sphere';
import { triangleIntersect, triangleNormal, trianglePoint } from '../entities/triangle';

export const intersectFunctions = [
    {
        source: sphereIntersect,
        settings: {
            argumentTypes: { center: 'Array(3)', radius: 'Number', rayPos: 'Array(3)', rayDir: 'Array(3)' },
            returnType: 'Number',
        },
    },
    {
        source: sphereNormal,
        settings: {
            argumentTypes: { center: 'Array(3)', rayPos: 'Array(3)', rayDir: 'Array(3)', distance: 'Number' },
            returnType: 'Array(3)',
        },
    },
    {
        source: spherePoint,
        settings: {
            argumentTypes: { rayPos: 'Array(3)', rayDir: 'Array(3)', distance: 'Number' },
            returnType: 'Array(3)',
        },
    },
    {
        source: triangleIntersect,
        settings: {
            argumentTypes: { vertex0: 'Array(3)', vertex1: 'Array(3)', vertex2: 'Array(3)', rayPos: 'Array(3)', rayDir: 'Array(3)' },
            returnType: 'Number',
        },
    },
    {
        source: triangleNormal,
        settings: {
            argumentTypes: { vertex0: 'Array(3)', vertex1: 'Array(3)', vertex2: 'Array(3)' },
            returnType: 'Array(3)',
        },
    },
    {
        source: trianglePoint,
        settings: {
            argumentTypes: { rayPos: 'Array(3)', rayDir: 'Array(3)', distance: 'Number' },
            returnType: 'Array(3)',
        },
    },
    {
        source: planeIntersect,
        settings: {
            argumentTypes: { normal: 'Array(3)', rayPos: 'Array(3)', rayDir: 'Array(3)' },
            returnType: 'Number',
        },
    },
    {
        source: planePoint,
        settings: {
            argumentTypes: { rayPos: 'Array(3)', rayDir: 'Array(3)', distance: 'Number' },
            returnType: 'Array(3)',
        },
    },
    {
        source: voxelIntersect,
        settings: {
            argumentTypes: { rayPos: 'Array(3)', rayDir: 'Array(3)', minX: 'Number', maxX: 'Number', minY: 'Number', maxY: 'Number', minZ: 'Number', maxZ: 'Number' },
            returnType: 'Number',
        },
    },
    {
        source: voxelPoint,
        settings: {
            argumentTypes: { rayPos: 'Array(3)', rayDir: 'Array(3)', distance: 'Number' },
            returnType: 'Array(3)',
        },
    },
    {
        source: voxelNormal,
        settings: {
            argumentTypes: { minX: 'Number', maxX: 'Number', minY: 'Number', maxY: 'Number', minZ: 'Number', maxZ: 'Number', point: 'Array(3)' },
            returnType: 'Array(3)',
        },
    },
];
