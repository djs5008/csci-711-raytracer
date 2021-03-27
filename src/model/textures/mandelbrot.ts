import Texture from '../texture';
import { hsvToRgb } from '../util/color';

const MAX_ITER = 250;
const WIDTH = 500;
const HEIGHT = 400;

export default class MandelbrotTexture extends Texture {
    constructor() {
        super(WIDTH, HEIGHT);
        for (let row = 0; row < HEIGHT; row++) {
            for (let col = 0; col < WIDTH; col++) {
                const c1 = (col - WIDTH / 2.0) * 4.0 / WIDTH;
                const c2 = (row - HEIGHT/ 2.0) * 4.0 / WIDTH;
                const n = this.mandelbrot(c1, c2);
                const h = ((n / MAX_ITER)*360);
                const s = 100;
                const b = (n < MAX_ITER) ? 100 : 0;
                const clr = hsvToRgb(h, s, b);
                this.texels.push(
                    [
                        clr.r/255,
                        clr.g/255,
                        clr.b/255,
                    ],
                );
            }
        }
    }

    private mandelbrot(c1 : number, c2 : number) {
        let x = 0;
        let y = 0;
        let n = 0;
        let x2 = 0;
        let y2 = 0;
        while (x2+y2 <= 4 && n < MAX_ITER) {
            x2 = x*x;
            y2 = y*y;
            const xNew = x2 - y2 + c1;
            y = (2*x*y) + c2;
            x = xNew;
            n++;
        }
        return n;
    }
}
