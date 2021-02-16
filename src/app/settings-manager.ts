import Bounds from "../model/util/bounds";
import Renderer from "./renderer"

export default class SettingsManager {

    constructor(
        private renderer    : Renderer,
        private widthInput  : HTMLInputElement = <HTMLInputElement> document.getElementById('res-w'),
        private heightInput : HTMLInputElement = <HTMLInputElement> document.getElementById('res-h'),
    ) {
        this.widthInput.value  = renderer.resolution.w.toString();
        this.heightInput.value = renderer.resolution.h.toString();
        this.widthInput.onchange  = this.handleWidthChange.bind(this);
        this.heightInput.onchange = this.handleHeightChange.bind(this);
    }

    private handleWidthChange() {
        this.heightInput.value = (Math.floor(parseInt(this.widthInput.value) * (2/3))).toString();
        this.updateCanvas();
    }
    
    private handleHeightChange() {
        this.widthInput.value = (Math.floor(parseInt(this.heightInput.value) * (3/2))).toString();
        this.updateCanvas();
    }

    private updateCanvas() {
        const w = parseInt(this.widthInput.value);
        const h = parseInt(this.heightInput.value);
        this.renderer.updateResolution(new Bounds(w, h));
        this.renderer.drawImage();
    }
    
}