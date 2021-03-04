import { Color } from './util/vector';

export default class Material {
    constructor(
        public diffuseColor  : Color = [ 0, 0, 0 ], // Basic Color
        public specularColor : Color = [ 1, 1, 1 ], // Specular Highlight Color
        public ambient  : number = 0.75, // kA
        public diffuse  : number = 0.5, // kD
        public specular : number = 0.5, // kS
        public exponent : number = 5, // kE
        public opacity  : number = 1.0, // Opacity
    ) {
        if (diffuse + specular > 1) {
            throw new Error('ERROR: Diffuse (kD) + Specular (kS) cannot exceed 1.0!');
        }
    }

    public setDiffuseColor(color : Color) : Material {
        this.diffuseColor = color;
        return this;
    }

    public setSpecularColor(color : Color) : Material {
        this.specularColor = color;
        return this;
    }

    public setAmbient(value : number) : Material {
        this.diffuse = value;
        return this;
    }

    public setDiffuse(value : number) : Material {
        this.diffuse = value;
        return this;
    }

    public setSpecular(value : number) : Material {
        this.specular = value;
        return this;
    }

    public setExponent(value : number) : Material {
        this.exponent = value;
        return this;
    }

    public setOpacity(value : number) : Material {
        this.opacity = value;
        return this;
    }

    public toArray() : number[] {
        return [
            ...this.diffuseColor,
            ...this.specularColor,
            this.ambient,
            this.diffuse,
            this.specular,
            this.exponent,
            this.opacity,
        ];
    }
}
