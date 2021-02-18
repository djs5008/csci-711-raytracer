import Camera from "../model/camera";
import IRenderData from "../model/interfaces/render-data";
import Bounds from "../model/util/bounds";

export default class Renderer {

    public static readonly DEFAULT_RESOLUTION = new Bounds(192, 108);

    private ctx         : CanvasRenderingContext2D;
    private tmpCanvas   : HTMLCanvasElement;
    private tmpCtx      : CanvasRenderingContext2D;
    private imageData   : ImageData;
    private camera      : Camera;

    constructor(
        public canvas     : HTMLCanvasElement,
        public resolution : Bounds = Renderer.DEFAULT_RESOLUTION,
    ) {
        this.ctx       = canvas.getContext('2d');
        this.tmpCanvas = this.createTempCanvas(canvas);
        this.tmpCtx    = this.tmpCanvas.getContext('2d');
        this.updateResolution(resolution);
    }

    private createTempCanvas(canvas : HTMLCanvasElement) : HTMLCanvasElement {
        const tmpCanvas = <HTMLCanvasElement> document.createElement('canvas');
        tmpCanvas.width  = canvas.width;
        tmpCanvas.height = canvas.height;
        return tmpCanvas;
    }

    public async drawImage() {
        if (!this.camera) return;
        console.time('FRAME DRAW');
        const data = await this.camera.render();
        this.drawPixelData(data);
        // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.tmpCanvas, 0, 0);
        console.timeEnd('FRAME DRAW');
    }

    private drawPixelData(data : IRenderData) {
        const pixelLength = data.pixels.length * 4;
        for (let i = 0; i < pixelLength;) {
            const pix = data.pixels[i/4];
            if (!pix) {
                i+=4;
                continue;
            };
            this.imageData.data[i++] = Math.floor(pix.scale(255).x);
            this.imageData.data[i++] = Math.floor(pix.scale(255).y);
            this.imageData.data[i++] = Math.floor(pix.scale(255).z);
            this.imageData.data[i++] = 255;
        }
        this.tmpCtx.putImageData(this.imageData, 0, 0);
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
        const tmpCanvas = this.tmpCanvas;
        canvas.width    = bounds.w;
        canvas.height   = bounds.h;
        tmpCanvas.width  = bounds.w;
        tmpCanvas.height = bounds.h;
        this.imageData = new ImageData(
            new Uint8ClampedArray([ ...new Array(4 * bounds.w * bounds.h) ]),
            bounds.w,
            bounds.h
        );
        if (this.camera) {
            this.camera.setViewport(bounds);
        }
    }
 
}