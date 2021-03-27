import '../styles/index.css';

import { GPU } from 'gpu.js';
import InputManager from './app/input-manager';
import Renderer from './app/renderer';
import Camera from './model/camera';
import Plane from './model/entities/plane';
import Sphere from './model/entities/sphere';
import Triangle, { triangleBary } from './model/entities/triangle';
import World from './model/world';
import SettingsManager from './app/settings-manager';
import KernelManager from './app/kernel-manager';
import { addVec3, scaleVec3, Vector3 } from './model/util/vector';
import Material from './model/material';
import Light from './model/light';
import ModelLoader from './app/model-loader';
import Voxel from './model/entities/voxel';
import Checkerboard from './model/textures/checkerboard';
import Texture from './model/texture';
import ImageTexture from './model/textures/image-texture';
import MandelbrotTexture from './model/textures/mandelbrot';

const inputManager = new InputManager();
const gpu = new GPU();
const kernelManager = new KernelManager(gpu);
const renderer = new Renderer();

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
        [-3, -0.1, 19],
        [5, -0.1, 19],
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
    new Material([1, 0, 0]),
);
const pyramid2 = new Triangle(
    [
        [0.5, 0.75, 0.5],
        [0, 0, 0],
        [0, 0, 1],
    ],
    [0, 1, 0],
    new Material([0, 1, 0]),
);
const pyramid3 = new Triangle(
    [
        [0.5, 0.75, 0.5],
        [1, 0, 0],
        [0, 0, 0],
    ],
    [0, 1, 0],
    new Material([1, 0, 1]),
);
const pyramid4 = new Triangle(
    [
        [0.5, 0.75, 0.5],
        [0, 0, 1],
        [1, 0, 1],
    ],
    [0, 1, 0],
    new Material([1, 1, 0]),
);
const box = new Voxel(
    1, 1, 1,
    [ -1, 1, 0 ],
    new Material([0.5, 0.5, 0.5]),
);
const light1 = new Light(
    [ 0, 15, -5 ],
    [ 0, 1, 0 ],
);
const light2 = new Light(
    [ 15, 5, 10 ],
    [ 1, 0, 1 ],
);

const camera = new Camera(
    world,
    renderer.resolution, // Viewport
    [0, 2.3, -1], // Position
    [0, 0, -1], // Lookat
    Vector3.UP,
    90,
    2,
    90,
    -20,
);

const chkr = new Checkerboard([1, 0, 0], [1, 1, 0], 1);
ground1.textureId = 0; // Set ground1 to checker texture
ground2.textureId = 0; // Set ground2 to checker texture

// Image Texture
// const img = <HTMLImageElement> document.getElementById('example-texture');
// const canvas = document.createElement('canvas');
// const ctx = canvas.getContext('2d');
// canvas.width = img.width;
// canvas.height = img.height;
// ctx.drawImage(img, 0, 0, img.width, img.height);
// const imageData = ctx.getImageData(0, 0, img.width, img.height);
// const imgTex = new ImageTexture(imageData);

// Mandelbrot Texture
// const mandelbrotTex = new MandelbrotTexture();

// TODO: Make this faster
const bunnyMesh = await ModelLoader.loadModel('/bunny.obj');

// Add entities to world
world.addEntities(
    sphere1,
    sphere2,
    // grid,
    ground1,
    ground2,
    // pyramid1,
    // pyramid2,
    // pyramid3,
    // pyramid4,
    // box,
);

world.addMesh(
    bunnyMesh,
);

world.addLights(
    light1,
    light2,
);

world.addCameras(
    camera,
);

world.addTextures(
    chkr,
);

const gpuKernel = kernelManager.createKernel(camera, world);
camera.setKernel(gpuKernel);
renderer.setCamera(camera);
renderer.setGPUKernel(gpuKernel);
inputManager.setRenderer(renderer);
document.getElementById('draw-container').appendChild(gpuKernel.canvas);

(<any> window).settingsManager = new SettingsManager(renderer, [ sphere1, sphere2 ], [ light1, light2 ], chkr);

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
