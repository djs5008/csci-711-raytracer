import Texture from '../texture';

export default class ImageTexture extends Texture {
    constructor(image : ImageData) {
        super(image.width, image.height);
        for (let i = 0; i < image.data.length; i += 4) {
            this.texels.push([
                image.data[i+0]/255,
                image.data[i+1]/255,
                image.data[i+2]/255,
            ]);
        }
    }
}
