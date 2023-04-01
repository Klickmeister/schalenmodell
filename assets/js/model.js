/*jshint esversion: 6 */

/* ############################################################################ 
Kurs «Generative Gestaltung» an der TH Köln
Christian Noss
christian.noss@th-koeln.de
https://twitter.com/cnoss
https://cnoss.github.io/generative-gestaltung/

############################################################################ */

const saveParams = {
  sketchName: "gg-sketch"
}

// Params for canvas
const canvasParams = {
  holder: document.getElementById('canvas'),
  state: false,
  mouseX: false,
  mouseY: false,
  mouseLock: false,
  background: 0,
  gui: true,
  mode: 'SVG', // canvas or svg … SVG mode is experimental 
};
getCanvasHolderSize();

// Params for the drawing
const drawingParams = {
  strokeWeight: 1,
  strokeWeightMax: 10,
  strokeWeightStep: 0.1
};

// Params for logging
const loggingParams = {
  targetDrawingParams: document.getElementById('drawingParams'),
  targetCanvasParams: document.getElementById('canvasParams'),
  state: false
};

let orbitElementList;
let maxSizeOribit = 200;

const orbitSegmentWeight = 20;
const orbitSegmentPadding = orbitSegmentWeight /2;
const contentPriorityMax = 11;
const techPriorityMax = 3;

const hueStep = 10;
const hueStartContent = 360 - contentPriorityMax * hueStep;

const alphaStart = 40;
const alphaStepContent = (100 - alphaStart) / contentPriorityMax;

const infoConsole = document.getElementById("console");


/* ###########################################################################
Classes
############################################################################ */

class OrbitElement{
  constructor(objectData){
    this.hue = objectData.hue;
    this.radius = objectData.radius;
    this.begin = objectData.begin;
    this.end = objectData.end;
    this.alpha = objectData.alpha;
    this.content = objectData.content;
    this.id = slugify(this.content["Webservice/ Service"]);
    this.element = this.createOrbitElement();
    
    this.addElementInfo();
    this.addListener();
  }

  onClickAction(){
    console.log(this.id);
  }

  addListener(){
    this.element.addEventListener("click", this.onClickAction, false);
  }

  addElementInfo(){
    infoConsole.innerHTML = helperPrettifyLogs(this.content);
  }

  createOrbitElement(){
    strokeWeight(99);
    stroke(this.hue,100,100,this.alpha);
    strokeCap(SQUARE);
    noFill();
    arc(0,0,this.radius, this.radius, this.begin, this.end);
    const elements = [...document.querySelectorAll("svg path")];
    const latestElement = elements.find(ele => Number(ele.getAttribute("stroke-width")) === 99 );
    latestElement.setAttribute("id", this.id);
    latestElement.setAttribute("stroke-width", orbitSegmentWeight);
    return latestElement;
  }
}



/* ###########################################################################
Custom Functions
############################################################################ */

function drawOribitElements(elementsForPrio, prio){

  const elementNumber = elementsForPrio.length;
  const elementAngle = 360 / elementNumber;
  const radius = maxSizeOribit - (prio * orbitSegmentWeight * 2.5);
  const hue = (hueStartContent + prio * hueStep) % 360;
  const alpha = alphaStart + prio + alphaStepContent;

  let begin = random(0,360);
  let count = 0;

  elementsForPrio.forEach(ele => {
    const [key, content] = ele;
    const padding = orbitSegmentPadding;
    const end = begin + elementAngle - padding;
    const objectData = {
      alpha, radius, begin, end, hue, content
    };
    const element = new OrbitElement(objectData);
    begin = end + padding;
    count ++;
  });
}

function getOrbitElementsWithForPrio(prio){
  const orbitElementsForPrio = Object.entries(orbitElementList).filter((entry) => {
    const [key, value] = entry;
    if(value["fachliche Priorität"] === prio) return value;
    return false;
  });
  return orbitElementsForPrio;
}

function renderContentModel(){
  for(let prio = 0; prio < contentPriorityMax;  prio++){
    const elementsForPrio = getOrbitElementsWithForPrio(prio);
    
    if(elementsForPrio.length > 0){
      drawOribitElements(elementsForPrio, prio);
    }
  }
  
}



/* ###########################################################################
P5 Functions
############################################################################ */

function preload() {
  const url = './data/erco-services.json';
  orbitElementList = loadJSON(url);
}

function setup() {

  let canvas;
  if (canvasParams.mode === 'SVG') {
    canvas = createCanvas(canvasParams.w, canvasParams.h, SVG);
  } else { 
    canvas = createCanvas(canvasParams.w, canvasParams.h);
    canvas.parent("canvas");
  }


  // Display & Render Options
  frameRate(25);
  angleMode(DEGREES);
  colorMode(HSB, 360, 100, 100, 100);
  smooth();

  // GUI Management
  if (canvasParams.gui) { 
    const sketchGUI = createGui('Params');
    sketchGUI.addObject(drawingParams);
    noLoop();
  }

  // Anything else
  fill(200);
  stroke(0);
}



function draw() {

  translate(width/2, height/2);
  maxSizeOribit = width > height ? height * 0.8 : width *0.8;
  renderContentModel();
  

}




function keyPressed() {

  if (keyCode === 81) { // Q-Key
  }

  if (keyCode === 87) { // W-Key
  }

  if (keyCode === 89) { // Y-Key
  }

  if (keyCode === 88) { // X-Key
  }

  if (keyCode === 83) { // S-Key
    const suffix = (canvasParams.mode === "canvas") ? '.jpg' : '.svg';
    const fragments = location.href.split(/\//).reverse();
    const suggestion = fragments[1] ? fragments[1] : 'gg-sketch';
    const fn = prompt(`Filename for ${suffix}`, suggestion);
    if (fn !== null) save(fn + suffix);
  }

  if (keyCode === 49) { // 1-Key
  }

  if (keyCode === 50) { // 2-Key
  }

  if (keyCode === 76) { // L-Key
    if (!canvasParams.mouseLock) {
      canvasParams.mouseLock = true;
    } else { 
      canvasParams.mouseLock = false;
    }
    document.getElementById("canvas").classList.toggle("mouseLockActive");
  }


}



function mousePressed() {}



function mouseReleased() {}



function mouseDragged() {}



function keyReleased() {
  if (keyCode == DELETE || keyCode == BACKSPACE) clear();
}





/* ###########################################################################
Service Functions
############################################################################ */

function slugify(str){
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getCanvasHolderSize() {
  canvasParams.w = canvasParams.holder.clientWidth;
  canvasParams.h = canvasParams.holder.clientHeight;
}



function resizeMyCanvas() {
  getCanvasHolderSize();
  resizeCanvas(canvasParams.w, canvasParams.h);
}



function windowResized() {
  resizeMyCanvas();
}



function logInfo(content) {

  if (loggingParams.targetDrawingParams) {
    loggingParams.targetDrawingParams.innerHTML = helperPrettifyLogs(drawingParams);
  }

  if (loggingParams.targetCanvasParams) {
    loggingParams.targetCanvasParams.innerHTML = helperPrettifyLogs(canvasParams);
  }

}

