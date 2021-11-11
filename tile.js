class Tile {
  constructor(id, x, z, heightMap){
    this.x = x;
    this.y = 0;
    this.z = z;
    this.id = id;
    this.heightMap = heightMap;
    this.obj = this.drawMesh();
  }
  
  getMesh(){
      return this.obj;
  }

  getInfo(){
      return [this.id, this.heightMap];
  }

  getZXAltitude(i, j){
    return this.heightMap[i][j];
  }

  updateCoordinate(x, z){
    this.x = x;
    this.z = z;
  }

  updateMap(info){
    this.id = info[0];
    this.heightMap = info[1];
  }

  drawMesh(){
    texture(groundTex);
    var y1, y2; 
    for (var z = 0; z < tileRows - 1; z++){
        beginShape(TRIANGLE_STRIP); 
        // Build triangles strip
        //
        //     (x0, y01, z1)   (x1, y11, z1) ... (x(cols-1), y(cols-1)1, z1)
        //              *-------*-------*-------*-------*
        //              | A   / | C   / | E   / | G   / |
        //              |   /   |   /   |   /   |   /   |
        //              | /   B | /   D | /   F | /   H |
        //              *-------*-------*-------*-------*
        //    (x0, y00, z0)  (x1, y10, z0)  ... (x(cols-1), y(cols-1)0, z0)
        //
        for(var x = 0; x < tileCols; x++){
          y1 = this.heightMap[z][x];
          y2 = this.heightMap[z+1][x];
          vertex(x*scl, -this.heightMap[z][x]*scl, -z*scl, map(y1, -mult, mult, 0, 2480), 1040/2);
          vertex(x*scl, -this.heightMap[z+1][x]*scl, -(z+1)*scl, map(y2, -mult, mult, 0, 2480), 1040/2);
        }
        endShape(); 
    }
  }

  show(){
    push();
    translate(this.x, this.y, this.z);
    this.drawMesh();
    pop();
  }
}