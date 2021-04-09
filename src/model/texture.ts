import { Color } from './util/vector';

export default class Texture {
    protected texels : Color[] = [];
    private serializedTexture : Array<any> = null;

    constructor(
        public width  : number,
        public height : number,
        public scale  : number = 1.0,
    ) { }

    public serialize() : any {
        if (this.serializedTexture == null) {
            const base = [ this.width, this.height, this.scale ];
            for (let i = 0; i < this.texels.length; i++) {
                base.push(this.texels[i][0], this.texels[i][1], this.texels[i][2]);
            }
            this.serializedTexture = base;
        }
        return this.serializedTexture;
    }

    public reserialize() {
        this.serializedTexture = null;
    }
}
