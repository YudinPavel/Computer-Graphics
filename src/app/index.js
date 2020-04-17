import * as THREE from 'three';
import Dat from 'dat.gui';
import init from 'three-dat.gui';
var OrbitControls = require('../../node_modules/three-orbit-controls')(THREE);
init(Dat);

const ZERO_POINT = 0;
const MAX_AXIS_LENGTH = 100;
const BACKGROUND_COLOR = 0x808080;

window.onload = function() {

    const canvas = document.getElementById("canvas");
    const width = window.innerWidth;
    const height = window.innerWidth;
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    let renderer = new THREE.WebGLRenderer({canvas: canvas});
    renderer.setClearColor(BACKGROUND_COLOR);
    let scene = new THREE.Scene();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    let startTime;
    
    let gui = new Dat.GUI();

    let camera = Camera(width, height);

    const controls = new OrbitControls(camera, canvas);

    // create ball

    let ballMesh;

    let ball = {
        y0: 250,
        y: 250,
        r: 25,
        x: -225,
        z: 0,
        v0: 0,
        vx: 0,
        epsila: 0.7,
        motionDown: true
    }
    {
        const geometry = new THREE.SphereBufferGeometry(ball.r, 32, 16);
        const material = new THREE.MeshPhongMaterial({color: '#CA8'});
        ballMesh = new THREE.Mesh(geometry, material);
        ballMesh.position.set(ball.x, ball.y0, ball.z);
        scene.add(ballMesh);
    }
    {
        // let newFolder = gui.addFolder('Шар');
        // newFolder.add(ball, 'epsila', 0, 1, 0.1).name('Коэф.Восстановления');
        // newFolder.add(ball, 'y0', ball.r, 1000, 1).name('Y0');
    }


    // create floor
    let floorMesh;
    let floor = {
        width: 500,
        height: 100,
        x: 0,
        y: 0,
        z: 0,
        rotateY: 0,
    }
    {
        const geometry = new THREE.PlaneGeometry(floor.width, floor.height, 100, 100);
        const material = new THREE.MeshPhongMaterial({color: '#CA8'});
        material.side = THREE.DoubleSide;
        floorMesh = new THREE.Mesh(geometry, material);
        floorMesh.position.set(floor.x, floor.y, floor.z);
        floorMesh.rotation.x = -Math.PI/2;
        scene.add(floorMesh);
    }
    {
        let newFolder = gui.addFolder('Доска');
        newFolder.add(floor, 'rotateY', -Math.PI/3, Math.PI/3, 0.1).name('Угол Наклона');
    }

    // add light
    let light;
    {
        const color = 0xFFFFFF;
        const intensity = 1;
        light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 10, 0);
        light.target.position.set(-5, 0, 0);
        scene.add(light);
        scene.add(light.target);
    }
    
    //set enviroment

    let enviroment = {
        time: 1,
        g: 9.8,
        start: false
    }
    let onStart = ({
        add: () => {
             enviroment.start = !enviroment.start;
             startTime = new Date().getTime();
             if(!enviroment.start) {
                restart();
            }
        }
    })
    {
        let newFolder = gui.addFolder('Окружение');
        newFolder.add(enviroment, 'time', 0, 5, 0.01).name('Время (в x раз)');

        gui.add(onStart, 'add').name('Start/Stop');
    }

    let kostyl = 0;
    let t = 0;

    function restart() {
        ball.y0 = 250;
        ball.y = 250;
        ball.x = 0;
        ball.z = 0;
        ball.v0 = 0;
        ball.epsila = 0.7;
        ball.motionDown = true;
        t = 0;
        kostyl = 0;
    }

    function render() {
    
        let zero_height = Math.tan(floor.rotateY)*Math.abs(ball.x);

        if(Math.pow(Math.pow(floor.width/2, 2) - Math.pow(zero_height, 2), 1/2) < Math.abs(ball.x + 5)){
            zero_height = -1000;
        }
        if(ball.y < -155) {
            enviroment.start = false;
        }


        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        if ( enviroment.start ) {
            motion();
        }

        function motion() {

            t;

            if(ball.motionDown) {
                ball.y = ball.v0*t + ball.y0 - (enviroment.g * Math.pow(t, 2))/2;
                if(ball.y - ball.r < zero_height) {
                    ball.v0 = enviroment.g * t * ball.epsila;
                    ball.y0 = -ball.r - zero_height;
                    ball.motionDown = false;
                    kostyl = -10000;
                    t = 0;
                }
            }
            else {
                //AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa
                ball.y = ball.v0*t - ball.y0 - (enviroment.g * Math.pow(t, 2))/2;
                
                if (kostyl > ball.y) {
                    ball.y0 = ball.y;
                    ball.v0 = 0;
                    ball.motionDown = true;
                    t = 0;
                    if(ball.y0 < ball.r + 1 + zero_height) {
                        ball.v0 = 0;
                        t = 0;
                        ball.y0 = zero_height + ball.r;
                    }
                }

                kostyl = ball.y;
                
            }

            t+=0.1*enviroment.time;
        }

        ballMesh.position.y = ball.y;
        floorMesh.rotation.y = floor.rotateY;
        renderer.render(scene, camera);
    
        requestAnimationFrame(render);
    }
    
    requestAnimationFrame(render);
}



function Camera(width, height) {
    var viewAngle = 45;
    var startDistance = 0.1;
    var endDistance = 3000;

    var camera = new THREE.PerspectiveCamera(viewAngle, width / height, startDistance, endDistance);

    camera.position.set(100, 300, 700);

    camera.rotation.x = -0.35;

    return camera;
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