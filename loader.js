class Cloud {
  constructor(x, y, z){
      this.obj = loadModel("models/clouds/cloud.obj");
      this.x = x;
      this.y = y;
      this.z = z;
      this.flyingX = 0;
      this.flyingZ = 0;
      this.scale = random([200, 250, 300, 350]);
      this.angleY = random([0, 30, 60, 90]);
  }

  move(speedZ, speedX){
    this.flyingZ = this.flyingZ + speedZ;
    this.flyingX = this.flyingX - speedX;
  }

  show(){
    push();
    if (this.z + this.flyingZ > 0) {
      this.flyingX = 0;
      this.flyingZ = 0;
      this.z = -2000;
      this.x = random([0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000]);
      this.scale = random([200, 250, 300, 350]);
      this.angleY = random([0, 30, 60, 90]);
    } else if (this.z + this.flyingZ < -2000) {
      this.flyingX = 0;
      this.flyingZ = 0;
      this.z = -10;
      this.x = random([0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000]);
      this.scale = random([200, 250, 300, 350]);
      this.angleY = random([0, 30, 60, 90]);
    }
    translate(this.x - this.flyingX, this.y, this.z + this.flyingZ);
    rotateY(this.angleY);
    rotateX(180);
    scale(this.scale); 
    fill('rgba(220, 220, 220, 0.5)');
    model(this.obj);
    pop();
  }
}

class Balloon {
  constructor(x, y, z){
      this.obj = loadModel("models/balloon/Hot_air_balloon.obj");
      this.x = x;
      this.y = y;
      this.z = z;
      this.up = true;
      this.flyingX = 0;
      this.flyingZ = 0;
  }

  move(speedZ, speedX){
    this.flyingZ = this.flyingZ + speedZ;
    this.flyingX = this.flyingX - speedX;
    if (this.up){
      this.y++;
    } else {
      this.y--;
    }
  }
    
  show(){
    push();
    if (this.y < -350 || this.y > -100 ) {
      this.up = !(this.up);
    }
    if (this.z + this.flyingZ > -2400 && this.z + this.flyingZ < 0){
      translate(this.x - this.flyingX, this.y, this.z + this.flyingZ);
      rotateX(180);
      scale(0.1);
      fill(255, 0, 0);
      model(this.obj);
    }
    pop();
  }
}

