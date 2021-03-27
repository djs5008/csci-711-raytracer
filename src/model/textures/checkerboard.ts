// import * as SimplexNoise from 'simplex-noise';
import Texture from '../texture';
import { Color } from '../util/vector';

const CHECKS = 16;

export default class Checkerboard extends Texture {
    constructor(
        public color1 : Color,
        public color2 : Color,
        public checkSize : number,
    ) {
        super(checkSize * CHECKS, checkSize * CHECKS);
        this.generateCheckerboard();
    }

    public generateCheckerboard() {
        this.texels = [];
        // const simplex = new SimplexNoise();
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const noise = 1;
                // const noise = simplex.noise2D(x, y);
                if ((((Math.floor(x / this.checkSize) % 2) + (Math.floor(y / this.checkSize) % 2)) % 2) === 0) {
                    this.texels.push([
                        this.color1[0] * Math.max(0.3, noise),
                        this.color1[1] * Math.max(0.3, noise),
                        this.color1[2] * Math.max(0.3, noise),
                    ]);
                } else {
                    this.texels.push([
                        this.color2[0] * Math.max(0.3, noise),
                        this.color2[1] * Math.max(0.3, noise),
                        this.color2[2] * Math.max(0.3, noise),
                    ]);
                }
            }
        }
    }
}
