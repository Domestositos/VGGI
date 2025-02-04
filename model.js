'use strict';

class Model {

    stepsU = 50
    stepsV = 40

    constructor(name, glContext, shaderProgram) {
        this.name = name;
        this.gl = glContext;                 // Store WebGL context.
        this.shaderProgram = shaderProgram;  // Store shader program.
        this.iVertexBuffer = this.gl.createBuffer();
        this.count = 0;

        this.BufferData(this.CreateSurfaceData());  // Initialize buffer with surface data.
    }

    CalculateCoordinateVertex(u, v) {
        let x = (-3 * u - u ** 5 + 2 * u ** 3 * v ** 2 + 3 * u * v ** 4) / (6 * (u ** 2 + v ** 2));
        let y = (-3 * v - 3 * u ** 4 * v - 2 * u ** 2 * v ** 3 + v ** 5) / (6 * (u ** 2 + v ** 2));
        let z = u;

        return [x, y, z]
    }

    // Generates surface data for U and V polylines.
    CreateSurfaceData() {
        const vertices = [];
        const uMin = -1, uMax = 1;
        const vMin = 0.2, vMax = 1;
        const stepU = (uMax - uMin) / this.stepsU;
        const stepV = (vMax - vMin) / this.stepsV;

        // U-polylines
        for (let u = uMin; u <= uMax; u += stepU) {
            for (let v = vMin; v <= vMax; v += stepV) {
                const [x, y, z] = this.CalculateCoordinateVertex(u, v)
                vertices.push(x, y, z);
                console.log("U")
            }
        }

        // V-polylines
        for (let v = vMin; v <= vMax; v += stepV) {
            for (let u = uMin; u <= uMax; u += stepU) {
                const [x, y, z] = this.CalculateCoordinateVertex(u, v)
                vertices.push(x, y, z);
                console.log("V")
            }
        }

        return vertices;
    }

    // Bind data to WebGL buffer.
    BufferData(vertices) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.iVertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        this.count = vertices.length / 3;
    }

    // Draw the model.
    Draw() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.iVertexBuffer);
        this.gl.vertexAttribPointer(this.shaderProgram.iAttribVertex, 3, this.gl.FLOAT, false, 0, 0);

        for (let i = 0; i < this.stepsU; i++) { 
            let offset = i*this.stepsV
            this.gl.drawArrays(this.gl.LINE_STRIP, offset, this.stepsV);
        }

        for (let i = 0; i < this.stepsV; i++) { 
            let offset = this.stepsU*this.stepsV + i*this.stepsU
            this.gl.drawArrays(this.gl.LINE_STRIP, offset, this.stepsU);
        }
    }
}
