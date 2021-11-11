//GUI Controls
const pane = new Tweakpane.Pane({
  title: 'Controls',
  expanded: true,
});

//Camera Settings
let camera;
var eyeX; 
var eyeY; 
var eyeZ; 
var atX;
var atY;
var atZ;

//Terrain Settings
var terrainGrid = [];
var tileSize = 600; // # pixels for tile side
var tileCols, tileRows; //numbers of vertex = tileCols x tileRows
var scl = 5; //distance between vertex
var mult = 50; //altitude range

var tileO = [];
var tileA = [];
var tileB = [];
var tileC = [];

var direction;
var flying = 0;
var flyingX, flyingZ;

//Noise Settings
var xoff = 0; 
var zoff = 0;
var inc = 0.022; //for a smoother terrain we use lower values

//Textures and colors
let bgColor;
var sunTex;
var groundTex;

//Object Settings
var xSun, ySun, zSun;
var balloon;
var clouds = [];
var xDisp, zDisp;

var lakeShader;
var lakeTexture;
var fogShader;
var fogTexture;


function preload(){
  lakeShader = loadShader('waterShader.vert', 'waterShader.frag');
  fogShader = loadShader('shader.vert', 'shader.frag');
  sunTex = loadImage("textures/gradient_sun.png");
  groundTex = loadImage("textures/prova.png");
  
  balloon = new Balloon(800, -200, -1000);

  for ( var i = 0; i < 5; i++){
    clouds[i] = new Cloud(random([0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000]), -300, random([-2000, -1600, -1200, -800, -400]));
  }

}

function setup(){
  createCanvas(windowWidth, windowHeight, WEBGL); //windowWidth e windowHeight
  angleMode(DEGREES); //angles degree mode (alternative to radiant mode)  

  eyeX = tileSize*3/2;
  eyeY = -20;
  eyeZ = -tileSize/2;
  atX = eyeX + tileSize/2;
  atY = +10;
  atZ = eyeZ - tileSize*3/2;

  createGUI();
  camera = createCamera(); // new camera([x], [y], [z], [centerX], [centerY], [centerZ], [upX], [upY], [upZ])
  camera.setPosition(eyeX, eyeY, eyeZ);
  camera.lookAt(atX, atY, atZ); 
  camera.perspective(60, width/height, 0.1, 1999);
  //debugMode();

  tileCols = tileSize/scl + 1;
  tileRows = tileSize/scl + 1;
  flyingX = 0;
  flyingZ = 0;

  createMaps(tileCols, tileRows, inc, mult);
  createTerrainGrid();

  xSun = 1200;
  ySun = -600;
  zSun = -1990;

  xDisp = 0;
  zDisp = 0;

  bgColor = '#96b4ffff';
  background(bgColor); 
  drawTerrain();

  // initialize the createGraphics layers
  lakeTexture = createGraphics(tileSize*3, tileSize*3, WEBGL);
  fogTexture = createGraphics(tileSize*2, tileSize*2, WEBGL);

  // turn off the createGraphics layers stroke
  lakeTexture.noStroke();
  fogTexture.noStroke();

}

function draw(){
  bgColor = pane.exportPreset().Background;
  background(bgColor); 
  //orbitControl();
  noStroke(); //mesh color
  
  ambientLight(100);
  pointLight(255, 255, 255, tileSize + flyingX, -1200, tileSize/2 - flyingZ);

  calculateDirection();
  if(direction != 'stay'){
    updateTerrainGrid();
    direction = 'stay';
  }

  //Draw Terrain
  drawTerrain();

  //Draw Sun
  push();
  translate(xSun + flyingX, ySun, zSun - flyingZ);
  pointLight(255, 255, 255, xSun + flyingX, ySun, zSun - flyingZ);
  noStroke();
  texture(sunTex);
  sphere(50);
  pop();


  //Draw Baloon
  balloon.move(zDisp, xDisp);
  balloon.show();

  //Draw Clouds
  for(var i = 0 ; i < 5; i++){
    clouds[i].move(zDisp, xDisp);
    clouds[i].show();
  }
  
  lakeTexture.shader(lakeShader);
  fogTexture.shader(fogShader);

  // here we're using setUniform() to send our uniform values to the shader
  lakeShader.setUniform("iResolution", [tileSize*3, tileSize*3]);
  lakeShader.setUniform("iTime", frameCount/10);
  fogShader.setUniform("iResolution", [tileSize*2, tileSize*2]);
  fogShader.setUniform("iTime", frameCount/10);
  
  // passing the texture layer geometry to render on
  lakeTexture.rect(0,0,tileSize*3, tileSize*3);
  fogTexture.rect(0,0,tileSize*2, tileSize*2);

  //Draw Fog
  /*
  push();
  texture(fogTexture);
  translate(eyeX + flyingX, eyeY, eyeZ - flyingZ - tileSize);
  sphere(tileSize*3/2); 
  pop();
  */

  //Draw Lakes
  push();
  createLake(tileRows*3, tileCols*3, mult); 
  pop();

}

function createMaps(tileCols, tileRows, inc, mult){
  tileO = generateAltitudeMap(tileCols, tileRows, inc, mult);
  tileA = flipZ(tileO);
  tileB = flipX(tileO);
  tileC = flipZ(tileB);
}

function generateAltitudeMap(tileCols, tileRows, inc, mult){
  var terrainMap = [];
  var xoff = 0;
  var zoff = 0;

  for(var z = 0; z < tileRows; z++){
    terrainMap.push([]);
    xoff = 0;
    for(var x = 0; x < tileCols; x++){
      n = (1 * noise(0.8 * xoff, 0.5 * zoff) + 0.08 * noise(9 * xoff, 9 * zoff)); 
      if (n < 0.15){
          n = 0.15;     
      }
      terrainMap[z][x] = map(n, 0.15, (1 + 0.08), -mult, mult); 
      xoff = xoff + inc; 
    }
    zoff = zoff + inc;
  }

  return terrainMap;
}

function flipZ(terrainMap){ // Flip a map along Z axis.
  var terrainMap_flipZ = [];
  for(var z = 0; z < tileRows; z++){
    terrainMap_flipZ.push(terrainMap[z].slice());
    terrainMap_flipZ[z].reverse(); 
  }
  return terrainMap_flipZ;
}

function flipX(terrainMap){ // Flip a map along X axis.
  var terrainMap_flipX = [];
  for(var z = tileRows-1; z >= 0; z--){
    terrainMap_flipX.push(terrainMap[z].slice());
  }
  return terrainMap_flipX;
}

function createTerrainGrid(){
  var heightMap, id;
  for(var i = 0; i < 4; i++){
    terrainGrid.push([]);
    for(var j = 0; j < 4; j++){
      if((i % 2) == 0){
        if((j % 2) == 0){
          id = 'C';
          heightMap = tileC;
        }
        else {
          id = 'A';
          heightMap = tileA;
        }
      }
      else {
        if((j % 2) == 0){
          id = 'B';
          heightMap = tileB;
        }
        else {
          id = 'O';
          heightMap = tileO;
        }
      }
      terrainGrid[i][j] = new Tile(id, i*tileSize, -j*tileSize, heightMap);
    }
  }
}

function drawTerrain(){
  for(var i = 0; i < 4; i++){
    for(var j = 0; j < 4; j++){
      terrainGrid[i][j].show();
    }
  }
}

function updateTerrainGrid(){
  switch(direction) {
    case 'up':
      for (var i = 0; i < 4; i++){
        for (var j = 0; j < 4; j++){
          if (j == 3){
            terrainGrid[i][j].updateMap(terrainGrid[i][1].getInfo());
          }
          else {
            terrainGrid[i][j].updateMap(terrainGrid[i][j+1].getInfo());
          }
        }
      }
      break;
    case 'down':
      for (var i = 0; i < 4; i++){
        for (var j = 0; j < 4; j++){
          if (j == 3){
            terrainGrid[i][j].updateMap(terrainGrid[i][1].getInfo());
          }
          else {
            terrainGrid[i][j].updateMap(terrainGrid[i][j+1].getInfo());
          }
        }
      }
      break;
    case 'left':
      for (var i = 0; i < 4; i++){
        for (var j = 0; j < 4; j++){
          if (i == 3){
            terrainGrid[i][j].updateMap(terrainGrid[1][j].getInfo());
          }
          else {
            terrainGrid[i][j].updateMap(terrainGrid[i+1][j].getInfo());
          }
        }
      }
      break;
    case 'right':
      for (var i = 0; i < 4; i++){
        for (var j = 0; j < 4; j++){
          if (i == 3){
            terrainGrid[i][j].updateMap(terrainGrid[1][j].getInfo());
          }
          else {
            terrainGrid[i][j].updateMap(terrainGrid[i+1][j].getInfo());
          }
        }
      }
  }
}

function calculateDirection(){
  var speed = pane.exportPreset().Speed/10;
  switch(pane.exportPreset().Direction) {
    case 'forward':
      xDisp = 0;
      if (flyingZ + speed > tileSize/2){
        flyingZ = flyingZ + speed - tileSize;
        zDisp = speed + tileSize;
        direction = 'up';
      }
      else {
        flyingZ = flyingZ + speed;
        zDisp = speed;
      }
      break;
    case 'back':
      xDisp = 0;
      if (flyingZ - speed < -tileSize/2){
        flyingZ = flyingZ - speed + tileSize;
        zDisp = - (speed + tileSize);
        direction = 'down';
      }
      else {
        flyingZ = flyingZ - speed;
        zDisp = - speed;
      }
      break;
    case 'left':
      zDisp = 0;
      if (flyingX - speed < -tileSize/2){
        flyingX = flyingX - speed + tileSize;
        xDisp = speed + tileSize;
        direction = 'left';
      }
      else {
        flyingX = flyingX - speed;
        xDisp = speed;
      }
      break;
    case 'right':
      zDisp = 0;
      if (flyingX + speed > tileSize/2){
        flyingX = flyingX + speed - tileSize;
        xDisp = - (speed + tileSize);
        direction = 'right';
      }
      else {
        flyingX = flyingX + speed;
        xDisp = - speed;
      }
      break;
    default:  
      pane.importPreset({'Speed': 0});
      direction = 'stay';
      xDisp = 0;
      zDisp = 0;
  }

  var cameraTerrain = terrainGrid[1][0].getZXAltitude(int(-((eyeZ- flyingZ)%tileSize)/scl), int(((eyeX + flyingX)%tileSize)/scl));
  console.log(cameraTerrain);
  if (cameraTerrain < 0){
    eyeY = cameraTerrain*scl - 10;
  } else{
    eyeY = -10;
  }
  
  camera.setPosition(eyeX + flyingX, eyeY, eyeZ - flyingZ);
  camera.lookAt(atX + flyingX, atY, atZ - flyingZ);


}

function createLake(rows, cols, mult){
  texture(lakeTexture);
  for (var z = 0; z < rows-1; z++){
    beginShape(TRIANGLE_STRIP); 
    for(var x = 0; x < cols; x++){
      vertex(x*scl, (mult/2)*scl, -z*scl, x*scl, z*scl);
      vertex(x*scl, (mult/2)*scl, -(z+1)*scl, x*scl, (z+1)*scl);
    }
    endShape(); 
  }
}

function createGUI(){
  // GUI controls with tweakpane
  const PARAMS = {
    Background: '#96b4ffff',
    Direction: '',
    Speed: 0,
  };

  pane.registerPlugin(TweakpaneEssentialsPlugin);

  pane.addInput(PARAMS, 'Background', {
    picker: 'inline',
    expanded: true,
  });
  
  pane.addInput(PARAMS, 'Direction', {
    options: {
      Stop: 'stop',
      Forward: 'forward',
      Back: 'back',
      Left: 'left',
      Right: 'right',
    },
  });

  pane.addInput(PARAMS, 'Speed', {min: 0, max: 100, step: 10});
 

}



/*
//make the canvas response
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
*/
