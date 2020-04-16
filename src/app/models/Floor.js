export class Floor {

    name;

    model;

    constructor (name, width, height, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, fragmW, fragmH, material) {

        this.name = name;
        this.width = width;
        this.height = height;
        this.positionX = positionX;
        this.positionY = positionY; 
        this.positionZ = positionZ; 
        this.rotationX = rotationX; 
        this.rotationY = rotationY; 
        this.rotationZ = rotationZ; 
        this.fragmW = fragmW;
        this.fragmH = fragmH; 
        this.material = material;

        if(!fragmW) {
            this.fragmW = 13;
        }
    
        if(!fragmH) {
            this.fragmH = 13;
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
        
        this.model = floor;
    }
}