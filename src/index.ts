import '../styles/index.css';

import { GPU } from 'gpu.js';
import InputManager from './app/input-manager';
import Renderer from './app/renderer';
import Camera from './model/camera';
import Plane from './model/entities/plane';
import Sphere from './model/entities/sphere';
import Triangle from './model/entities/triangle';
import Bounds from './model/util/bounds';
import Color from './model/util/color';
import World from './model/world';
import SettingsManager from './app/settings-manager';

const canvas          = <HTMLCanvasElement> document.getElementById('draw');
const renderer        = new Renderer(canvas);
const inputManager    = new InputManager(renderer);
const settingsManager = new SettingsManager(renderer);
const gpu = new GPU();

// Create the world
const world = new World();

// Create the entities
const sphere1 = new Sphere(
    [-0.25, 1.5, 4],
    1.4,
    new Color(0.2, 0.2, 0.2),
);
const sphere2 = new Sphere(
    [1.25, 0, 6.5],
    1.2,
    new Color(0.3, 0.3, 0.3),
);
const floor1 = new Plane([0, -1, 0]);
const floor2 = new Plane([0, 1, 0]);
const ground1 = new Triangle(
    [
        [0.5, 0.75, 0.5],
        [1, 0, 1],
        [1, 0, 0],
    ],
    [0, 1, 0],
    new Color(0.7, 0.69, 0.420)
);
const ground2 = new Triangle(
    [
        [0.5, 0.75, 0.5],
        [0, 0, 0],
        [0, 0, 1],
    ],
    [0, 1, 0],
    new Color(0.420, 0.7, 0.69)
);
const ground3 = new Triangle(
    [
        [0.5, 0.75, 0.5],
        [0, 0, 0],
        [1, 0, 0],
    ],
    [0, 1, 0],
    new Color(0.69, 0.420, 0.7)
);
const ground4 = new Triangle(
    [
        [0.5, 0.75, 0.5],
        [0, 0, 1],
        [1, 0, 1],
    ],
    [0, 1, 0],
    new Color(0.3, 0.3, 0.721)
);

const camera = new Camera(world,
    new Bounds(canvas.width, canvas.height), // Viewport
    [0, 1, -3],                   // Position
    [0, 0, 0.1],                  // Lookat
);
renderer.setCamera(camera);

// Add entities to world
world.add(sphere1, sphere2, floor1, floor2, ground1, ground2, ground3, ground4, camera);

// Render from Camera
const draw = () => {
    window.requestAnimationFrame(() => {
        renderer.drawImage();
        // draw();
    });
};
draw();
