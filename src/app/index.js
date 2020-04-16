import * as THREE from 'three';
import Dat from 'dat.gui';
import init from 'three-dat.gui';
var OrbitControls = require('../../node_modules/three-orbit-controls')(THREE);
init(Dat);

const ZERO_POINT = 0;
const MAX_AXIS_LENGTH = 100;
const BACKGROUND_COLOR = 0x808080;

const AXIS = setAxes(ZERO_POINT, MAX_AXIS_LENGTH);

window.onload = function() {

    const canvas = document.getElementById("canvas");
    const width = window.innerWidth;
    const height = window.innerWidth;
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    let renderer = new THREE.WebGLRenderer({canvas: canvas});
    renderer.setClearColor(BACKGROUND_COLOR);
    let scene = new THREE.Scene();

    let leftBall = {
        V: 0,
        x: 10,
        y: 10,
        z: 10,

    } 
    
    let gui = new Dat.GUI();
    gui.add(leftBall, 'V').min(-0.2).max(0.2).step(0.001);

    var camera = Camera(width, height);

    const controls = new OrbitControls(camera, canvas);

    var floor = [
        Floor(MAX_AXIS_LENGTH*3, MAX_AXIS_LENGTH, MAX_AXIS_LENGTH, 0, MAX_AXIS_LENGTH/2, -Math.PI/2, 0, 0, 33, 11),
        Floor(MAX_AXIS_LENGTH*3, MAX_AXIS_LENGTH, MAX_AXIS_LENGTH, MAX_AXIS_LENGTH/2, 0, 0, 0, 0, 33, 11)
    ]

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 10, 0);
        light.target.position.set(-5, 0, 0);
        scene.add(light);
        scene.add(light.target);
    }

    {
        const sphereRadius = 15;
        const sphereWidthDivisions = 32;
        const sphereHeightDivisions = 16;
        const sphereGeo = new THREE.SphereBufferGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
        const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.position.set(-sphereRadius - 10, MAX_AXIS_LENGTH - sphereRadius, MAX_AXIS_LENGTH/2);
        scene.add(mesh);
    }

    addToScene(scene, /*...AXIS,*/ ...floor);
    
      function render() {
    
        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement;
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();
        }
    
        renderer.render(scene, camera);
    
        requestAnimationFrame(render);
      }
    
      requestAnimationFrame(render);
}

function Line(start, end, material ) {
    
    if(!material) {
        material = new THREE.LineBasicMaterial({
            color: 0xffffff
        });
    }

    var geometry = new THREE.BufferGeometry().setFromPoints([start, end]);

    return new THREE.Line(geometry, material);
}

function setAxes(zero, max) {

    var axes = [];

    axes.push( Line(new THREE.Vector3(zero, zero, zero), new THREE.Vector3(max, zero, zero)) );
    axes.push( Line(new THREE.Vector3(zero, zero, zero), new THREE.Vector3(zero, max, zero)) );
    axes.push( Line(new THREE.Vector3(zero, zero, zero), new THREE.Vector3(zero, zero, max)) );

    return axes;
}

function Point(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

function Floor(width, height, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, fragmW, fragmH, material) {

    if(!fragmW) {
        fragmW = 13;
    }

    if(!fragmH) {
        fragmH = 13;
    }

    var geometry = new THREE.PlaneGeometry(width, height, fragmW, fragmH);

    if (!material) {
        material = new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors});

        for ( var i = 0; i < geometry.faces.length; i++ ) {
            geometry.faces[i].color.setRGB(i%4>1, i%4>1, i%4>1);
        }
    }

    var floor = new THREE.Mesh(geometry, material);

    floor.position.x = positionX;
    floor.position.y = positionY;
    floor.position.z = positionZ;

    floor.rotation.x = rotationX;
    floor.rotation.y = rotationY;
    floor.rotation.z = rotationZ;
    
    return floor;
}

function Camera(width, height) {
    var viewAngle = 45;
    var startDistance = 0.1;
    var endDistance = 3000;

    var position = new Point(100, 100, 500);

    var camera = new THREE.PerspectiveCamera(viewAngle, width / height, startDistance, endDistance);

    camera.position.set(position.x, position.y, position.z);

    camera.rotation.x = -0.3;

    return camera;
}

function addToScene(scene) {
    for (var i = 1; i < arguments.length; i++) {
        scene.add(arguments[i]);
    }
}

function updateCamera() {
    camera.updateProjectionMatrix();
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
}