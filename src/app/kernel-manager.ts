import { GPU, IKernelRunShortcut } from "gpu.js";
import Camera from "../model/camera";
import { planeIntersect } from "../model/entities/plane";
import { sphereIntersect } from "../model/entities/sphere";
import { triangleIntersect } from "../model/entities/triangle";
import { EntityType } from "../model/entity";
import { normalizeX, normalizeY, normalizeZ, vectorFunctions } from "../model/util/vector3";
import World from "../model/world";

export default class KernelManager {

    constructor(
        private gpu : GPU
    ) {
        vectorFunctions.forEach((func) => gpu.addFunction(func));
        gpu.addFunction(sphereIntersect);
        gpu.addFunction(planeIntersect);
        gpu.addFunction(triangleIntersect);
    }

    public createKernel(camera : Camera, world : World) : IKernelRunShortcut {
        const options = {
            mode: 'gpu',
            output: [ camera.viewport.w, camera.viewport.h ],
            graphical: true,
            constants: {
                ENTITY_COUNT: world.getPhysicalEntities().length,
                SPHERE: EntityType.SPHERE,
                PLANE: EntityType.PLANE,
                TRIANGLE: EntityType.TRIANGLE,
            }
        };
        return this.gpu.createKernel(function(
            viewport    : number[],
            eyepoint    : number[],
            entities    : number[][],
            N           : number[],
            U           : number[],
            V           : number[],
            aspectRatio : number,
            fovScale    : number,
            focalLen    : number,
            cam2world   : number[],
        ) {
            const w = viewport[0];
            const h = viewport[1];
            const invFocalLen = 1 / focalLen;
            const yScale = aspectRatio * fovScale;

            const x = this.thread.x;
            const y = this.thread.y;
            const pX = [
                (U[0] * (1 - (x / w) - 0.5) * fovScale) * (invFocalLen),
                (U[1] * (1 - (x / w) - 0.5) * fovScale) * (invFocalLen),
                (U[2] * (1 - (x / w) - 0.5) * fovScale) * (invFocalLen),
            ];
            const pY = [
                (V[0] * ((y / h) - 0.5) * yScale) * (invFocalLen),
                (V[1] * ((y / h) - 0.5) * yScale) * (invFocalLen),
                (V[2] * ((y / h) - 0.5) * yScale) * (invFocalLen),
            ];
            const rayPos = [
                eyepoint[0], eyepoint[1], eyepoint[2]
            ];
            const rayDir = [
                N[0] + pX[0] + pY[0],
                N[1] + pX[1] + pY[1],
                N[2] + pX[2] + pY[2],
            ];
            const rayDirNorm = [
                normalizeX(rayDir[0], rayDir[1], rayDir[2]),
                normalizeY(rayDir[0], rayDir[1], rayDir[2]),
                normalizeZ(rayDir[0], rayDir[1], rayDir[2]),
            ];
      
            let nearestEntityIndex = -1;
            let nearestEntityDistance = Math.pow(2, 32);
            let color = [ 0.25, 0.6, 1 ];
    
            for (let i = 0; i < this.constants.ENTITY_COUNT; i++) {
                let distance = -1;
                let entityType = entities[i][0];

                if (entityType === this.constants.SPHERE) {
                    distance = sphereIntersect(
                        entities[i][1], entities[i][2], entities[i][3],
                        entities[i][7],
                        rayPos[0], rayPos[1], rayPos[2],
                        rayDirNorm[0], rayDirNorm[1], rayDirNorm[2]
                    );
                } else if (entityType === this.constants.PLANE) {
                    distance = planeIntersect(
                        entities[i][7], entities[i][8], entities[i][9],
                        rayPos[0], rayPos[1], rayPos[2],
                        rayDirNorm[0], rayDirNorm[1], rayDirNorm[2],
                        cam2world[0], cam2world[1], cam2world[2], cam2world[3],
                        cam2world[4], cam2world[4], cam2world[6], cam2world[7],
                        cam2world[8], cam2world[9], cam2world[10], cam2world[11],
                        cam2world[12], cam2world[13], cam2world[14], cam2world[15],
                    );
                } else if (entityType === this.constants.TRIANGLE) {
                    distance = triangleIntersect(
                        entities[i][7], entities[i][8], entities[i][9],
                        entities[i][10], entities[i][11], entities[i][12],
                        entities[i][13], entities[i][14], entities[i][15],
                        rayPos[0], rayPos[1], rayPos[2],
                        rayDirNorm[0], rayDirNorm[1], rayDirNorm[2],
                    );
                }
                
                if (distance >= 0 && distance < nearestEntityDistance) {
                    nearestEntityIndex = i;
                    nearestEntityDistance = distance;
                    color = [
                        entities[i][4],
                        entities[i][5],
                        entities[i][6],
                    ];
                }
            }
    
            // Set color
            this.color(color[0], color[1], color[2]);
        }, options);
    }

}