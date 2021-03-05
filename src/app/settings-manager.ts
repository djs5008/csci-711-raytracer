import Entity from '../model/entity';
import Light from '../model/light';
import Bounds from '../model/util/bounds';
import Renderer from './renderer';

export default class SettingsManager {
    constructor(
        private renderer : Renderer,
        private toonShadableEntities : Array<Entity>,
        private lights : Array<Light>,
        private widthInput : HTMLInputElement = <HTMLInputElement> document.getElementById('res-w'),
        private heightInput : HTMLInputElement = <HTMLInputElement> document.getElementById('res-h'),
        private fullscreenBtn : HTMLButtonElement = <HTMLButtonElement> document.getElementById('fullscreen'),
        private phongShader : HTMLInputElement = <HTMLInputElement> document.getElementById('phong'),
        private toonShader : HTMLInputElement = <HTMLInputElement> document.getElementById('toon'),
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

    public setShader(event : InputEvent) {
        const { shader } = (<HTMLInputElement> event.currentTarget).dataset;
        this.toonShadableEntities.forEach((e) => e.material.setToon(shader === 'toon'));
        this.updateCanvas();
    }

    public changeLightColor(event : InputEvent) {
        const { lightIndex } = (<HTMLInputElement> event.currentTarget).dataset;
        const rgb = this.hexToRgb((<HTMLInputElement> event.currentTarget).value);
        this.lights[parseInt(lightIndex)].color = [ rgb.r, rgb.g, rgb.b ];
        this.updateCanvas();
    }

    public toggleLight(event : InputEvent) {
        const { lightIndex } = (<HTMLInputElement> event.currentTarget).dataset;
        this.lights[parseInt(lightIndex)].toggle = Boolean((<HTMLInputElement> event.currentTarget).checked);
        this.updateCanvas();
    }

    private hexToRgb(hex : string) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
        } : null;
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
