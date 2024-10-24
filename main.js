'use strict';

let gl;                         // WebGL context.
let surface;                    // Surface model.
let shProgram;                  // Shader program.
let spaceball;                  // TrackballRotator object.

function deg2rad(angle) {
    return (angle * Math.PI) / 180;
}

// ShaderProgram constructor.
function ShaderProgram(name, program) {
    this.name = name;
    this.prog = program;

    this.iAttribVertex = -1;
    this.iColor = -1;
    this.iModelViewProjectionMatrix = -1;

    this.Use = function() {
        gl.useProgram(this.prog);
    };
}

// Function to adjust canvas size based on devicePixelRatio
function resizeCanvas() {
    const canvas = gl.canvas;
    const displayWidth = Math.floor(canvas.clientWidth * window.devicePixelRatio);
    const displayHeight = Math.floor(canvas.clientHeight * window.devicePixelRatio);

    // Check if the canvas size needs to be updated
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}

// Draw function.
function draw() {
    resizeCanvas()

    gl.clearColor(0, 0, 0, 0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let projection = m4.perspective(Math.PI / 4, 1, 8, 12);
    let modelView = spaceball.getViewMatrix();

    let rotateToPointZero = m4.axisRotation([0.707, 0.707, 0], 0.7);
    let translateToPointZero = m4.translation(0, 0, -10);

    let matAccum0 = m4.multiply(rotateToPointZero, modelView);
    let matAccum1 = m4.multiply(translateToPointZero, matAccum0);

    let modelViewProjection = m4.multiply(projection, matAccum1);

    shProgram.Use();
    gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, modelViewProjection);
    gl.uniform4fv(shProgram.iColor, [0.5, 0, 1, 1]);

    surface.Draw();
}

// Initialize WebGL.
function initGL() {
    let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

    shProgram = new ShaderProgram('Basic', prog);
    shProgram.Use();

    shProgram.iAttribVertex = gl.getAttribLocation(prog, "vertex");
    shProgram.iModelViewProjectionMatrix = gl.getUniformLocation(prog, "ModelViewProjectionMatrix");
    shProgram.iColor = gl.getUniformLocation(prog, "color");

    surface = new Model('Surface', gl, shProgram);  // Create model instance.

    gl.enable(gl.DEPTH_TEST);
    gl.enableVertexAttribArray(shProgram.iAttribVertex);
}

// Create WebGL program.
function createProgram(gl, vShaderSrc, fShaderSrc) {
    let vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vShaderSrc);
    gl.compileShader(vShader);
    if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
        throw new Error("Vertex Shader Error: " + gl.getShaderInfoLog(vShader));
    }

    let fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fShaderSrc);
    gl.compileShader(fShader);
    if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
        throw new Error("Fragment Shader Error: " + gl.getShaderInfoLog(fShader));
    }

    let program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error("Program Link Error: " + gl.getProgramInfoLog(program));
    }
    return program;
}

// Initialize the WebGL application.
function init() {
    let canvas = document.getElementById("webglcanvas");
    gl = canvas.getContext("webgl");
    if (!gl) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>WebGL not supported in this browser.</p>";
        return;
    }

    initGL();
    spaceball = new TrackballRotator(canvas, draw, 0);
    draw();
}
