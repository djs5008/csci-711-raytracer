import { GPU, IKernelRunShortcut } from 'gpu.js';
import Camera from '../model/camera';
import { EntityType } from '../model/entity';
import { intersectFunctions } from '../model/util/intersect';
import { vectorFunctions } from '../model/util/vector';
import World from '../model/world';
import Renderer from './renderer';

export default class KernelManager {
    constructor(
        private gpu : GPU,
    ) {
        [
            ...vectorFunctions,
            ...intersectFunctions,
        ].forEach((def) => gpu.addFunction(def.source as any, def.settings as any));
    }

    public createKernel(camera : Camera, world : World) : IKernelRunShortcut {
        const mode = (GPU.isGPUSupported) ? 'gpu' : 'cpu';
        const options = {
            mode: mode,
            output: [camera.viewport.w, camera.viewport.h],
            graphical: true,
            dynamicOutput: true,
            tactic: 'speed',
            constants: {
                ENTITY_COUNT: world.getPhysicalEntities().length,
                SPHERE: EntityType.SPHERE,
                PLANE: EntityType.PLANE,
                TRIANGLE: EntityType.TRIANGLE,
            },
        };
        return this.gpu.createKernel(Renderer.renderFunction, options as any);
    }
}
