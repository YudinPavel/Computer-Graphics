import { Ball } from "./Ball";
import { Floor } from "./Floor";
var OrbitControls = require('../../node_modules/three-orbit-controls')(THREE);
init(Dat);

export class Scene {
    
    scene;
    renderer; 
    camera;

    fixedObjects;

    movingObjects;


    constructor() {
        const canvas = document.getElementById("canvas");
        const width = window.innerWidth;
        const height = window.innerWidth;
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        this.renderer = new THREE.WebGLRenderer({canvas: canvas});
        this.renderer.setClearColor(BACKGROUND_COLOR);
        this.scene = new THREE.Scene();
        this.gui = [];
        const controls = new OrbitControls(camera, canvas);
        this.movingObjects = {
            balls: [],
        }
        this.fixedObjects = {
            floors: [],
        }
        this.addCamera(width, height);

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

    addCamera(width, height) {
        var viewAngle = 45;
        var startDistance = 0.1;
        var endDistance = 3000;

        var position = new Point(100, 100, 500);

        var camera = new THREE.PerspectiveCamera(viewAngle, width / height, startDistance, endDistance);

        camera.position.set(position.x, position.y, position.z);

        camera.rotation.x = -0.3;

        return camera;
    }

    addBall(name, x, y, z, R, elasticity) {
        const newBall = new Ball(name, x, y, z, R, elasticity_);
        this.movingObjects.balls.push(newBall);
        this.scene.add(newBall);
        this.addGui(newBall, 'ball');
    }

    addGui(object, type) {
        let newFolder = Dat.gui.addFolder(object.name);
        
        switch(type) {
            case 'ball':
                newFolder.add(object, 'x');
                newFolder.add(object, 'y');
                newFolder.add(object, 'z');
                newFolder.add(object, 'V0');
                newFolder.add(object, 'h0');
                newFolder.add(object, 'm');
                newFolder.add(object, 'R');
                newFolder.add(object, 'elasticity');
                break;
            case 'floor':
                newFolder.add(object, 'rotationY');
                newFolder.add(object, 'elasticity');
                break;
        }
    }

    addFloor(
        name,
        width, 
        height, 
        positionX, 
        positionY, 
        positionZ, 
        rotationX, 
        rotationY, 
        rotationZ, 
        fragmW, 
        fragmH, 
        material){

            const newFloor = new Floor(
                name, width, 
                height, positionX, 
                positionY, positionZ, 
                rotationX, rotationY, 
                rotationZ, fragmH, fragmW, material
            );
            this.fixedObjects.floors.push(newFloor);
            this.scene.add(newFloor);
            this.addGui(newFloor);
    }

    updateCamera() {
        this.camera.updateProjectionMatrix();
    }

    loop() {
        

        this.renderer.render(scene, camera);

        requestAnimationFrame(() => {
            loop();
        });
    }
}