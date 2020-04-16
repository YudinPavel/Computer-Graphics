export class Ball {
    name;
    x = 0;
    y = 0;
    z = 0;
    Vx = 0;
    Vy = 0;
    Vz = 0;
    V0 = 0;
    h0 = 0;
    m = 0;
    R = 0;
    elasticity = 0;
    model;

    constructor(name, x, y, z, R, elasticity) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.Vx = 0;
        this.Vy = 0;
        this.Vz = 0;
        this.z = z;
        this.R = R;
        this.elasticity = elasticity;

        const geometry = new THREE.SphereGeometry(R)
        const material = new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors});

        for (let i = 0; i < geometry.faces.length; i++) {
            geometry.faces[i].color.setRGB(Math.random(), Math.random(), Math.random());
        }

        const mesh = new THREE.Mesh(geometry, material);

        this.model = mesh;
    }

    updatePosition(x, y, z) {
        mesh.position.x = this.x;
        mesh.position.y = this.y;
        mesh.position.z = this.z;
    }


}