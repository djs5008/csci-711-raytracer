import Renderer from "./renderer";

export default class InputManager {

    private keyToggles  : any       = {};
    private inputDebouncer : number;
    
    constructor(
        private renderer : Renderer
    ) {
        this.startLookLoop();
        this.startMovementLoop();
        this.startScrollLoop();

        const canvas = document.getElementById('draw');
        canvas.addEventListener('click', () => canvas.requestPointerLock());
    }

    private startLookLoop() {
        window.addEventListener('mousemove', (evt : MouseEvent) => {
            if (!this.hasPointerLock()) return;
            const camera = this.renderer.getCamera();
            const dX = -evt.movementX * 0.1;
            const dY = -evt.movementY * 0.1;
            camera.rotate(dX, dY);
            this.redraw();
        });
    }

    private startMovementLoop() {
        window.addEventListener('keydown', (evt) => this.keyToggles[evt.key] = true );
        window.addEventListener('keyup', (evt) => delete this.keyToggles[evt.key] );
        window.setInterval(() => {
            if (!this.hasPointerLock()) return;
            const scale = 0.2;
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
                const u = camera.viewportProperties.u; // Right (relative)
                const v = camera.viewportProperties.v; // Up (relative)

                // right*(movementX,0,0) + forward*(0,0,movementZ)
                
                camera.move(u.scale(dirX*scale).add(v.scale(dirY*scale)));
                this.redraw(true);
            }
        });
    }

    private startScrollLoop() {
        window.addEventListener('wheel', (evt : WheelEvent) => {
            if (!this.hasPointerLock()) return;
            const scrollAmt = evt.deltaY;
            const dZ        = scrollAmt;
            const scale     = -0.01;

            const camera = this.renderer.getCamera();
            const n = camera.viewportProperties.n;
            camera.move(n.scale(dZ*scale));
            this.redraw();
        });
    }

    private redraw(force? : boolean) {
        if (!force && this.inputDebouncer != null)
            window.clearTimeout(this.inputDebouncer);
        this.inputDebouncer = window.setTimeout(() => {
            this.renderer.drawImage();
        });
    }

    private hasPointerLock() {
        const canvas = document.getElementById('draw');
        return document.pointerLockElement === canvas;
    }

}