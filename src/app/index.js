import * as THREE from 'three';
import Dat from 'dat.gui';
import init from 'three-dat.gui';
var OrbitControls = require('../../node_modules/three-orbit-controls')(THREE);
init(Dat);

const ballConst = {
    y0: 250,
    y: 250,
    r: 25,
    x0: -125,
    x: -125,
    z: 0,
    v: 0,
    vy: 0,
    vx: 0,
    epsila: 0.7,
    motionDown: true
}

const floors = [
    {
        width: 3000,
        floorMesh: null,
        height: 3000,
        x: 0,
        y: 0,
        z: -3000,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0
    },
    {
        width: 3000,
        floorMesh: null,
        height: 3000,
        x: 0,
        y: 0,
        z: 3000,
        rotateX: 0,
        rotateY: Math.PI,
        rotateZ: 0
    }
]

const ZERO_POINT = 0;
const MAX_AXIS_LENGTH = 100;
const BACKGROUND_COLOR = 'white';

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
    
    //setEnviroment(scene);

    let gui = new Dat.GUI();

    let camera = Camera(width, height);

    const controls = new OrbitControls(camera, canvas);

    // create ball

    let ballMesh;

    let ball = {
        y0: 250,
        y: 250,
        r: 25,
        x0: -125,
        x: -125,
        z: 0,
        v: 0,
        vy: 0,
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
        ball.r = 25;
        ball.x0 = -125;
        ball.x = -125;
        ball.z = 0;
        ball.v = 0;
        ball.vy = 0;
        ball.vx = 0;
        ball.epsila = 0.7;
        kostyl = 0;
        t = 0;
        ball.motionDown = true;
        console.log('restart');
    }

    function render() {

        let zero_x_height = Math.tan(floor.rotateY)*(-ball.x);

        if(Math.pow(Math.pow(floor.width/2, 2) - Math.pow(zero_x_height, 2), 1/2) < Math.abs(ball.x + 5)){
            zero_x_height = -10000;
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

            let gy = -(enviroment.g * Math.pow(t, 2))/2;
            //let zero_x_height = search_y(ball.x, floor.rotateY);

            if(ball.motionDown) {

                let dx = ball.x;
                let dy = ball.y;

                ball.x = ball.vx*t + ball.x0;
                ball.y = ball.vy*t + ball.y0 + gy;

                dx = 0;
                dy = ball.y - dy;

                let rotateBall = Math.atan(dy/dx);
                let rotateSpeed = (Math.PI - (floor.rotateY + Math.PI/2) - rotateBall - (floor.rotateY + Math.PI/2));

                console.log('rotateSpeed: ' + rotateSpeed);
                if(isCollision()) {
                    ball.vy = enviroment.g * t * ball.epsila;
                    ball.v = Math.abs(ball.vx) + Math.abs(ball.vy);

                    console.log(ball.v);

                    ball.vx = ball.v * Math.cos(rotateSpeed);
                    ball.vy = ball.v * Math.sin(rotateSpeed);

                    console.log('ball.vx: ' + ball.vx);
                    console.log('ball.vy: ' + ball.vy);

                    ball.x0 = ball.x;
                    ball.y0 = -ball.r - zero_x_height;
                    ball.motionDown = false;
                    kostyl = -10000;
                    t = 0;
                }
            }
            else {

                ball.x = ball.vx*t + ball.x0;
                ball.y = ball.vy*t - ball.y0 + gy;
                
                if (kostyl > ball.y) {
                    ball.x0 = ball.x;
                    ball.y0 = ball.y;
                    ball.vy = 0;
                    ball.motionDown = true;
                    t = 0;
                }

                kostyl = ball.y;
                
            }

            function search_y(x, rotate) {
                return Math.tan(rotate) * (-x);
            }

            function isCollision() {
                let colisionX = Math.pow(Math.pow(ball.x + ball.r, 2) + Math.pow(zero_x_height, 2), 1/2) < Math.abs(floor.width/2);
                let colisionY = ball.y - ball.r < zero_x_height;
                if(colisionX && colisionY) {
                    debugger;
                }
                return colisionX && colisionY;
            }

            t+=0.1*enviroment.time;
        }

        ballMesh.position.x = ball.x;
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
    var endDistance = 30000;

    var camera = new THREE.PerspectiveCamera(viewAngle, width / height, startDistance, endDistance);

    camera.position.set(500, 300, 700);

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

function setEnviroment(scene) {
    for(let i = 0; i < floors.length; i++) {
        const geometry = new THREE.PlaneGeometry(floors[i].width, floors[i].height, 100, 100);
        const material = new THREE.MeshPhongMaterial({color: '#CA8'});
        floors[i].floorMesh = new THREE.Mesh(geometry, material);
        floors[i].floorMesh.position.set(floors[i].x, floors[i].y, floors[i].z);
        floors[i].floorMesh.rotation.x = floors[i].rotateX;
        floors[i].floorMesh.rotation.y = floors[i].rotateY;
        floors[i].floorMesh.rotation.z = floors[i].rotateZ;
        scene.add(floors[i].floorMesh);
    }
}