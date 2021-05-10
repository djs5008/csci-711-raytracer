import '../styles/index.css';

import { GPU } from 'gpu.js';
import InputManager from './app/input-manager';
import Renderer from './app/renderer';
import Camera from './model/camera';
import World from './model/world';
import KernelManager from './app/kernel-manager';
import { Vector3 } from './model/util/vector';
import Material from './model/material';
import Light from './model/light';
import Checkerboard from './model/textures/checkerboard';
import AudioManager from './app/audio-manager';
import Voxel from './model/entities/voxel';
import { toRadian } from './model/util/math';
import Plane from './model/entities/plane';
import * as convert from 'color-convert';

const audioManager = new AudioManager();
const inputManager = new InputManager();
const gpu = new GPU();
const kernelManager = new KernelManager(gpu);
const renderer = new Renderer();

(<any> window).handleReflectionChange = (event : any) => {
    const checked = event.currentTarget.checked;
    renderer.getCamera().reflect = checked;
};

(<any> window).toggleMute = () => {
    audioManager.toggleMute();
    document.getElementById('mute-toggle').classList.toggle('muted', audioManager.muted);
};

// Create the world
const world = new World();

// Create the entities
const light1 = new Light(
    [ 0, 15, 0 ],
    [ 255, 255, 255 ],
);

const camera = new Camera(
    world,
    renderer.resolution, // Viewport
    [0, 7, -20], // Position
    [0, 0, -1], // Lookat
    Vector3.UP,
    90,
    2,
    90,
    -30,
);

const chkr = new Checkerboard([1, 0, 0], [1, 1, 0], 1, 2, 150);

const cubes : Array<Voxel> = [];
const radius = 10;
for (let a = 0; a < 360; a += 20) {
    const cube = new Voxel(
        1,
        2,
        1,
        [
            Math.cos(toRadian(a)) * radius,
            0,
            Math.sin(toRadian(a)) * radius,
        ],
        new Material([ 255, 255, 255 ]).setSpecular(0.5).setDiffuse(0.5).setExponent(10).setReflection(0.25),
    );
    cubes.push(cube);
}

// Add entities to world
world.addEntities(
    new Plane([ 0, 1, 0 ], new Material([ 0.1, 0.1, 0.1 ]).setExponent(0.1).setDiffuse(-10).setSpecular(0)),
    ...cubes,
);

world.addLights(light1);
world.addCameras(camera);
world.addTextures(chkr);

const gpuKernel = kernelManager.createKernel(camera, world);
camera.setKernel(gpuKernel);
renderer.setCamera(camera);
renderer.setGPUKernel(gpuKernel);
inputManager.setRenderer(renderer);
document.getElementById('draw-container').appendChild(gpuKernel.canvas);

// Render from Camera
const draw = () => {
    window.requestAnimationFrame(() => {
        audioManager.updateBarHeights();
        const interval = (audioManager.barHeights.length/4) / cubes.length;
        for (let i = 0; i < cubes.length; i++) {
            const cube = cubes[i];
            const sum = audioManager.barHeights.slice(i*interval, (i+1)*interval).reduce((acc, cur) => acc+cur, 0);
            cube.height = Math.max(1, sum/interval);
            cube.position[1] = cube.height/2;
            // console.log((cube.height/25)*360);
            const color = convert.hsl.rgb([ Math.floor((cube.height/25)*360), 100, 50 ]);
            cube.material = cube.material.setDiffuseColor([ color[0]/255, color[1]/255, color[2]/255]);
        }
        renderer.drawImage();
        draw();
    });
};
renderer.drawImage();
draw();
