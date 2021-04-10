import Texture from '../texture';
import * as convert from 'color-convert';

const MAX_ITER = 1000;
const WIDTH = 400;
const HEIGHT = 160;

export default class MandelbrotTexture extends Texture {
    constructor(
        public scale : number = 1.0,
    ) {
        super(WIDTH, HEIGHT, scale);
        for (let row = 0; row < HEIGHT; row++) {
            for (let col = 0; col < WIDTH; col++) {
                const c1 = (col - WIDTH / 2.0) * 4.0 / WIDTH;
                const c2 = (row - HEIGHT/ 2.0) * 4.0 / WIDTH;
                const n = this.mandelbrot(c1, c2);
                const h = Math.floor((n / MAX_ITER)*360);
                const s = 100;
                const l = (n < MAX_ITER) ? 50 : 0;
                const clr = convert.hsl.rgb([h, s, l]);
                this.texels.push(
                    [
                        clr[0]/255,
                        clr[1]/255,
                        clr[2]/255,
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
