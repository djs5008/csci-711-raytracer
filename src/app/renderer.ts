import Camera from "../model/camera";
import Bounds from "../model/util/bounds";

export default class Renderer {

    public static readonly DEFAULT_RESOLUTION = new Bounds(1920, 1080);

    public  canvas      : HTMLCanvasElement;
    private camera      : Camera;

    constructor(
        public resolution : Bounds = Renderer.DEFAULT_RESOLUTION,
    ) { }

    public async drawImage() {
        if (!this.camera) return;
        // console.time('FRAME DRAW');
        this.camera.render();
        // console.timeEnd('FRAME DRAW');
    }

    public setCamera(camera : Camera) {
        this.camera = camera;
        this.camera.setViewport(this.resolution);
    }

    public getCamera() : Camera {
        return this.camera;
    }

    public updateResolution(bounds : Bounds) {
        const canvas    = this.canvas;
        canvas.width    = bounds.w;
        canvas.height   = bounds.h;
        if (this.camera) {
            this.camera.setViewport(bounds);
        }
    }

    public setCanvas(canvas : HTMLCanvasElement) {
        this.canvas = canvas;
    }
 
}