import { addVec3, scaleVec3 } from '../model/util/vector';
import Renderer from './renderer';

export default class InputManager {
    private renderer : Renderer;
    private keyToggles : any = {};

    private startLookLoop() {
        window.addEventListener('mousemove', (evt : MouseEvent) => {
            if (!this.hasPointerLock()) return;
            const camera = this.renderer.getCamera();
            const dX = -evt.movementX * 0.07;
            const dY = -evt.movementY * 0.07;
            camera.rotate(dX, dY);
        });
    }

    private startMovementLoop() {
        window.addEventListener('keydown', (evt) => this.keyToggles[evt.key] = true );
        window.addEventListener('keyup', (evt) => delete this.keyToggles[evt.key] );
        window.setInterval(() => {
            if (!this.hasPointerLock()) return;
            const scale = 0.05;
            let dirX = 0;
            let dirY = 0;
            if (this.keyToggles['w']) {
                dirY = 1;
            } else if (this.keyToggles['s']) {
                dirY = -1;
            } else if (this.keyToggles['a']) {
                dirX = 1;
            } else if (this.keyToggles['d']) {
                dirX = -1;
            }
            if (dirX !== 0 || dirY !== 0) {
                const camera = this.renderer.getCamera();
                const { U, V } = camera.sceneProperties;
                // right*(movementX,0,0) + forward*(0,0,movementZ)
                camera.move(addVec3(scaleVec3(U, dirX*scale), scaleVec3(V, dirY*scale)));
            }
        });
    }

    private startScrollLoop() {
        window.addEventListener('wheel', (evt : WheelEvent) => {
            if (!this.hasPointerLock()) return;
            const scrollAmt = evt.deltaY;
            const dZ = scrollAmt;
            const scale = -0.01;

            const camera = this.renderer.getCamera();
            const { N } = camera.sceneProperties;
            camera.move(scaleVec3(N, dZ*scale));
        });
    }

    public hasPointerLock() : boolean {
        const canvas = this.renderer.canvas;
        return document.pointerLockElement === canvas;
    }

    public setRenderer(renderer : Renderer) {
        this.renderer = renderer;
        const canvas = renderer.canvas;
        canvas.addEventListener('click', () => canvas.requestPointerLock());
        this.startLookLoop();
        this.startMovementLoop();
        this.startScrollLoop();
    }
}
