function calculateCoordinateVertex(u, v) {
    let x = (-3 * u - u ** 5 + 2 * u ** 3 * v ** 2 + 3 * u * v ** 4) / (6 * (u ** 2 + v ** 2));
    let y = (-3 * v - 3 * u ** 4 * v - 2 * u ** 2 * v ** 3 + v ** 5) / (6 * (u ** 2 + v ** 2));
    let z = u;

    return [x, y, z]
}

function calculateDerivativeU(u, v){
    let x = (-Math.pow(u, 6) - Math.pow(u, 4) * Math.pow(v, 2) + Math.pow(u, 2) * Math.pow(v, 4) + Math.pow(u, 2) + Math.pow(v, 6) - Math.pow(v, 2)) 
    / (2 * (Math.pow(u, 4) + 2 * Math.pow(u, 2) * Math.pow(v, 2) + Math.pow(v, 4)));
    
    let y = (u * v * (-Math.pow(u, 4) - 2 * Math.pow(u, 2) * Math.pow(v, 2) - Math.pow(v, 4) + 1)) 
    / (Math.pow(u, 4) + 2 * Math.pow(u, 2) * Math.pow(v, 2) + Math.pow(v, 4));

    let z = 1
    return [x,y,z]
}

function calculateDerivativeV(u, v){
    let x = (u * v * (Math.pow(u, 4) + 2 * Math.pow(u, 2) * Math.pow(v, 2) + Math.pow(v, 4) + 1)) 
    / (Math.pow(u, 4) + 2 * Math.pow(u, 2) * Math.pow(v, 2) + Math.pow(v, 4));

    let y = (-Math.pow(u, 6) - Math.pow(u, 4) * Math.pow(v, 2) + Math.pow(u, 2) * Math.pow(v, 4) - Math.pow(u, 2) + Math.pow(v, 6) + Math.pow(v, 2)) 
    / (2 * (Math.pow(u, 4) + 2 * Math.pow(u, 2) * Math.pow(v, 2) + Math.pow(v, 4)));

    let z = 0;

    return [x,y,z]
}

function generateSurface(uMin = -1, uMax = 1, vMin = 0.2, vMax = 1, uSteps = 100, vSteps = 100) {
    const vertices = [];
    const indices = [];
    const normals = [];

    const stepsU = (uMax - uMin) / uSteps;
    const stepsV = (vMax - vMin) / vSteps;

    
    for (let i = 0; i <= uSteps; i++) {
        const u = uMin + i * stepsU;
        for (let j = 0; j <= vSteps; j++) {
            const v = vMin + j * stepsV;

            const [x, y, z] = calculateCoordinateVertex(u, v)
            vertices.push(x, y, z);

            const tangent_u = m4.normalize(calculateDerivativeU(u,v), []);

            const tangent_v = m4.normalize(calculateDerivativeV(u,v), []);

            normals.push(...m4.normalize(m4.cross(tangent_u, tangent_v, []), [0, 0, 1]));
        }
    }

    for (let i = 0; i < uSteps; i++) {
        for (let j = 0; j < vSteps; j++) {
            const topLeft = i * (vSteps + 1) + j;
            const topRight = i * (vSteps + 1) + (j + 1);
            const bottomLeft = (i + 1) * (vSteps + 1) + j;
            const bottomRight = (i + 1) * (vSteps + 1) + (j + 1);

            indices.push(topLeft, bottomLeft, bottomRight);
            indices.push(topLeft, bottomRight, topRight);
        }
    }

    return { vertices, normals, indices };
}

export default function Model(gl, shProgram) {
    this.iVertexBuffer = gl.createBuffer();
    this.iNormalBuffer = gl.createBuffer();
    this.iIndexBuffer = gl.createBuffer();
    this.count = 0;

    this.BufferData = function(vertices, normals, indices) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.count = indices.length;
    };

    this.Draw = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.vertexAttribPointer(shProgram.iAttribNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribNormal);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);

        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    }

    this.CreateSurfaceData = function() {
        function get(name) {
            return parseFloat(document.getElementById(name).value);
        }

        const { vertices, normals, indices } = generateSurface(get('UMin'), get('UMax'), get('VMin'), get('VMax'), get('USteps'), get('VSteps'));
        this.BufferData(vertices, normals, indices);
    }
}
