import '../styles/index.css';

import { GPU } from 'gpu.js';
import InputManager from './app/input-manager';
import Renderer from './app/renderer';
import Camera from './model/camera';
import Plane from './model/entities/plane';
import Sphere from './model/entities/sphere';
import Triangle from './model/entities/triangle';
import World from './model/world';
import SettingsManager from './app/settings-manager';
import KernelManager from './app/kernel-manager';
import { Vector3 } from './model/util/vector';
import Material from './model/material';
import Light from './model/light';
import ModelLoader from './app/model-loader';

const inputManager = new InputManager();
const gpu = new GPU();
const kernelManager = new KernelManager(gpu);
const renderer = new Renderer();
new SettingsManager(renderer);

// Create the world
const world = new World();

// Create the entities
const sphere1 = new Sphere(
    [-0.25, 2.5, 4],
    1.4,
    new Material([0, 0, 0.6]),
);
const sphere2 = new Sphere(
    [1.25, 1.5, 6.25],
    1.2,
    new Material([0.3, 0.3, 0.3])
        .setExponent(40)
        .setDiffuse(0.5)
        .setSpecular(0.5),
);
const grid = new Plane(
    [0, -1, 0],
    new Material([0, 0, 0]).setSpecular(0.9).setDiffuse(0.1).setExponent(50),
);
const ground1 = new Triangle(
    [
        [-3, -0.1, -2],
        [-3, -0.1, 19],
        [5, -0.1, -2],
    ],
    [0, 1, 0],
    new Material([0.420, 0, 0]),
);
const ground2 = new Triangle(
    [
        [5, -0.1, -2],
        [-3, -0.1, 19],
        [5, -0.1, 19],
    ],
    [0, 1, 0],
    new Material([0.420, 0, 0]),
);
const pyramid1 = new Triangle(
    [
        [0.5, 0.75, 0.5],
        [1, 0, 1],
        [1, 0, 0],
    ],
    [0, 1, 0],
    new Material([0.7, 0.69, 0.420]),
);
const pyramid2 = new Triangle(
    [
        [0.5, 0.75, 0.5],
        [0, 0, 0],
        [0, 0, 1],
    ],
    [0, 1, 0],
    new Material([0.420, 0.7, 0.69]),
);
const pyramid3 = new Triangle(
    [
        [0.5, 0.75, 0.5],
        [0, 0, 0],
        [1, 0, 0],
    ],
    [0, 1, 0],
    new Material([0.69, 0.420, 0.7]),
);
const pyramid4 = new Triangle(
    [
        [0.5, 0.75, 0.5],
        [0, 0, 1],
        [1, 0, 1],
    ],
    [0, 1, 0],
    new Material([0.3, 0.3, 0.721]),
);
const light1 = new Light(
    [ -10, 35, 0 ],
    [ 0, 1, 0 ],
);
const light2 = new Light(
    [ 10, 5, 20 ],
    [ 1, 0, 1 ],
);

const camera = new Camera(
    world,
    renderer.resolution, // Viewport
    [-0.02, 0.175, 0.2], // Position
    [0, 0, -1], // Lookat
    Vector3.UP,
    90,
    0.5,
    -89,
    -45,
);

const bunnyTriangles = await ModelLoader.loadModel('/bunny.obj');

// Add entities to world
world.addEntities(
    sphere1,
    sphere2,
    grid,
    ground1,
    ground2,
    pyramid1,
    pyramid2,
    pyramid3,
    pyramid4,
    // ...getTriangles(),
    // ...bunnyTriangles,
);

world.addLights(
    light1,
    light2,
);

world.addCameras(
    camera,
);

// world.addActions(
//     action,
// );

const gpuKernel = kernelManager.createKernel(camera, world);
camera.setKernel(gpuKernel);
renderer.setCamera(camera);
renderer.setGPUKernel(gpuKernel);
inputManager.setRenderer(renderer);
document.getElementById('draw-container').appendChild(gpuKernel.canvas);

// Render from Camera
const draw = () => {
    window.requestAnimationFrame(() => {
        if (inputManager.hasPointerLock()) {
            renderer.drawImage();
        }
        draw();
    });
};
renderer.drawImage();
draw();
