/* eslint-disable no-invalid-this */
import { GPU, IKernelRunShortcut } from 'gpu.js';
import Camera from '../model/camera';
import { EntityType } from '../model/entity';
import { intersectFunctions } from '../model/util/intersect';
import { mathFunctions } from '../model/util/math';
import { vectorFunctions } from '../model/util/vector';
import World from '../model/world';
import Renderer from './renderer';

export default class KernelManager {
    constructor(
        private gpu : GPU,
    ) {
        [ ...vectorFunctions, ...intersectFunctions, ...mathFunctions ]
            .forEach((def) => gpu.addFunction(def.source as any, def.settings as any));
    }

    public createKernel(camera : Camera, world : World) : IKernelRunShortcut {
        const mode = (GPU.isGPUSupported) ? 'webgl2' : 'cpu';
        const options = {
            mode: mode,
            output: [camera.viewport.w, camera.viewport.h],
            graphical: true,
            dynamicOutput: true,
            debug: false,
            loopMaxIterations: 100,
            constants: {
                ENTITY_COUNT: world.getEntities().length,
                LIGHT_COUNT: world.getLights().length,
                SPHERE: EntityType.SPHERE,
                PLANE: EntityType.PLANE,
                TRIANGLE: EntityType.TRIANGLE,
                LIGHT: EntityType.LIGHT,
                VOXEL: EntityType.VOXEL,
            },
        };
        return this.gpu.createKernel(Renderer.renderFunction, options as any);
    }
}
