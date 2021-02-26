import Bounds from '../model/util/bounds';
import Renderer from './renderer';

export default class SettingsManager {
    constructor(
        private renderer : Renderer,
        private widthInput : HTMLInputElement = <HTMLInputElement> document.getElementById('res-w'),
        private heightInput : HTMLInputElement = <HTMLInputElement> document.getElementById('res-h'),
        private fullscreenBtn : HTMLButtonElement = <HTMLButtonElement> document.getElementById('fullscreen'),
    ) {
        this.widthInput.value = window.localStorage.getItem('resW') || renderer.resolution.w.toString();
        this.heightInput.value = window.localStorage.getItem('resH') || renderer.resolution.h.toString();
        this.widthInput.onchange = this.handleWidthChange.bind(this);
        this.heightInput.onchange = this.handleHeightChange.bind(this);
        this.fullscreenBtn.onclick = this.handleFullscreen.bind(this);
        this.updateCanvas();
    }

    private handleWidthChange() {
        const newHeight = (Math.floor(parseInt(this.widthInput.value) * (9/16))).toString();
        this.heightInput.value = newHeight;
        this.updateCanvas();
    }

    private handleHeightChange() {
        const newWidth = (Math.floor(parseInt(this.heightInput.value) * (16/9))).toString();
        this.widthInput.value = newWidth;
        this.updateCanvas();
    }

    private handleFullscreen() {
        this.renderer.canvas.requestFullscreen();
        this.renderer.canvas.requestPointerLock();
    }

    private updateCanvas() {
        const w = parseInt(this.widthInput.value);
        const h = parseInt(this.heightInput.value);
        window.localStorage.setItem('resW', w.toString());
        window.localStorage.setItem('resH', h.toString());
        this.renderer.updateResolution(new Bounds(w, h));
        this.renderer.drawImage();
    }
}
