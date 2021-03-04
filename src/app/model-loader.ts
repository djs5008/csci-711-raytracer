import Mesh from '../model/entities/mesh';
import Triangle from '../model/entities/triangle';
import Material from '../model/material';

export default class ModelLoader {
    /**
     * Load an obj model
     * @param {string} url The url of the model
     */
    public static async loadModel(url : string) : Promise<Mesh> {
        const response = await fetch(url);
        const text = await response.text();
        const s = 5;
        const mesh = new Mesh(this.parseOBJ(text), new Material())
            .transform([
                s, 0, 0, 0,
                0, s, 0, 0,
                0, 0, s, 0,
                0, 0, 0, 1,
            ]);
        return mesh;
    }

    /**
     * Sourced From: https://webglfundamentals.org/webgl/lessons/webgl-load-obj.html
     * Modified to work with the project
     * @param {string} data The obj data being parsed
     * @return {Array<Triangle>} resulting triangles
     */
    private static parseOBJ(data : string) : Array<Triangle> {
        const result : Array<Triangle> = [];

        // because indices are base 1 let's just fill in the 0th data
        const objPositions = [[0, 0, 0]];
        const objTexcoords = [[0, 0]];
        const objNormals = [[0, 0, 0]];

        // same order as `f` indices
        const objVertexData = [objPositions, objTexcoords, objNormals];

        // same order as `f` indices
        const vertexData : number[][] = [
            [], // positions
            [], // texcoords
            [], // normals
        ];

        function addVertex(vert : string) {
            const ptn = vert.split('/');
            ptn.forEach((objIndexStr, i) => {
                if (!objIndexStr) {
                    return;
                }
                const objIndex = parseInt(objIndexStr);
                const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
                vertexData[i].push(...objVertexData[i][index]);
            });
        }

        const keywords : any = {
            v(parts : string[]) {
                objPositions.push(parts.map(parseFloat));
            },
            vt(parts : string[]) {
                objTexcoords.push(parts.map(parseFloat));
            },
            vn(parts : string[]) {
                objNormals.push(parts.map(parseFloat));
            },
            f(parts : string[]) {
                const numTriangles = parts.length - 2;
                for (let tri = 0; tri < numTriangles; ++tri) {
                    addVertex(parts[0]);
                    addVertex(parts[tri + 1]);
                    addVertex(parts[tri + 2]);
                }
            },
        };

        const keywordRE = /(\w*)(?: )*(.*)/;
        const lines = data.split('\n');
        for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
            const line = lines[lineNo].trim();
            if (line === '' || line.startsWith('#')) {
                continue;
            }
            const m = keywordRE.exec(line);
            if (!m) {
                continue;
            }
            const [, keyword, unparsedArgs] = m;
            const parts = line.split(/\s+/).slice(1);
            const handler = keywords[keyword];
            if (!handler) {
                console.warn('unhandled keyword:', keyword);
                continue;
            }
            handler(parts, unparsedArgs);
        }

        // Add triangles
        for (let i = 0; i < vertexData[0].length; i += 9) {
            result.push(
                new Triangle(
                    [
                        [ vertexData[0][i+0], vertexData[0][i+1], vertexData[0][i+2] ],
                        [ vertexData[0][i+3], vertexData[0][i+4], vertexData[0][i+5] ],
                        [ vertexData[0][i+6], vertexData[0][i+7], vertexData[0][i+8] ],
                    ],
                    null,
                    new Material([0.3, 0.3, 0.3]),
                ),
            );
        }

        // Add Normals
        // for (let i = 0; i < webglVertexData[2].length; i += 9) {
        //     myShape.addNormal(
        //         vertexData[2][i+0], vertexData[2][i+1], vertexData[2][i+2],
        //         vertexData[2][i+3], vertexData[2][i+4], vertexData[2][i+5],
        //         vertexData[2][i+6], vertexData[2][i+7], vertexData[2][i+8],
        //     );
        // }
        return result;
    }
}
