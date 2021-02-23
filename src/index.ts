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
    new Material([0, 0, 0.6]).setOpacity(0.5),
);
const sphere2 = new Sphere(
    [1.25, 1.5, 6.5],
    1.2,
    new Material([0.3, 0.3, 0.3]).setOpacity(0.6),
);
const grid = new Plane(
    [0, -1, 0],
    new Material([0, 0, 0]).setOpacity(0.3),
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
        [5, -0.1, 19],
        [-3, -0.1, 19],
        [5, -0.1, -2],
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
    new Material([0.7, 0.69, 0.420])
        .setOpacity(0.75),
);
const pyramid2 = new Triangle(
    [
        [0.5, 0.75, 0.5],
        [0, 0, 0],
        [0, 0, 1],
    ],
    [0, 1, 0],
    new Material([0.420, 0.7, 0.69])
        .setOpacity(0.75),
);
const pyramid3 = new Triangle(
    [
        [0.5, 0.75, 0.5],
        [0, 0, 0],
        [1, 0, 0],
    ],
    [0, 1, 0],
    new Material([0.69, 0.420, 0.7])
        .setOpacity(0.75),
);
const pyramid4 = new Triangle(
    [
        [0.5, 0.75, 0.5],
        [0, 0, 1],
        [1, 0, 1],
    ],
    [0, 1, 0],
    new Material([0.3, 0.3, 0.721])
        .setOpacity(0.75),
);

const camera = new Camera(
    world,
    renderer.resolution, // Viewport
    [0, 2.5, -5], // Position
    [0, 0, 0.1], // Lookat
    Vector3.UP,
    90,
    1,
    90,
    -10,
);

// Add entities to world
world.add(
    sphere1,
    sphere2,
    grid,
    ground1,
    ground2,
    pyramid1,
    pyramid2,
    pyramid3,
    pyramid4,
    camera,
);

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
