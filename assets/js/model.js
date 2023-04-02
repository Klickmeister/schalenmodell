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
let shiftOrbit = -100;
let fontNormal;
let fontBold;

const fontsize = 16;
const orbitSegmentWeight = 20;
const orbitSegmentPadding = orbitSegmentWeight /2;
const contentPriorityMax = 11;
const techPriorityMax = 3;
const datafile = './data/erco-services-gesamtprio.json';
const prioField = 'Gesamtprio';
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
    this.segment = this.createOrbitSegment();
    this.element = this.createOrbitElement();
    this.fillOpacity;
    
    this.addElementInfo();
    this.addListener();
  }

  onClickAction(){
    console.log(this.id);
  }

  onMouseOverActionElement(event){
    const target = event.target;
    this.fillOpacity = target.getAttribute("fill-opacity");
    target.setAttribute("fill-opacity", 1);
  }

  onMouseOutActionElement(event){
    const target = event.target;
    target.setAttribute("fill-opacity", this.fillOpacity);
  }

  addListener(){
    this.segment.addEventListener("click", this.onClickAction, false);
    this.element.addEventListener("click", this.onClickAction, false);
    this.element.addEventListener("mouseover", this.onMouseOverActionElement, false);
    this.element.addEventListener("mouseout", this.onMouseOutActionElement, false);
  }

  addElementInfo(){
    infoConsole.innerHTML = helperPrettifyLogs(this.content);
  }

  createOrbitSegment(){
    push();
    translate(shiftOrbit, 0);
    strokeWeight(99);
    stroke(this.hue,80,100,this.alpha);
    strokeCap(SQUARE);
    noFill();
    arc(0,0,this.radius, this.radius, this.begin, this.end);
    pop();
    return getLatestElement(`segment-${this.id}`, orbitSegmentWeight);
  }

  createOrbitElement(){
    push();
    translate(shiftOrbit, 0);
    strokeWeight(99);
    stroke(this.hue,0,0,this.alpha * 2);
    fill(0,0,100,30);
    const angle = this.begin + ((this.end - this.begin) /2);
    const x = cos(angle) * this.radius/2;
    const y = sin(angle) * this.radius/2;
    ellipse(x, y, orbitSegmentWeight);
    pop();
    return getLatestElement(`element-${this.id}`, 2);
  }
}


class Prio{
  constructor(prio){
    this.prio = prio;
    this.elements = this.getOrbitElementsForPrio();
    this.hue;
    this.alpha;
    this.radius;

    if(this.elements.length > 0){
      this.drawOribitElements();
    }

    this.annotation = this.annotate();
  }

  getOrbitElementsForPrio(){
    const orbitElementsForPrio = Object.entries(orbitElementList).filter((entry) => {
      const [key, value] = entry;
      if(value[prioField] === this.prio) return value;
      return false;
    });
    return orbitElementsForPrio;
  }

  showElements(){
    textFont(fontNormal);
    textSize(fontsize);
    strokeWeight(0);
    fill(this.hue, 20,100,100);
    // translate(0,0);
    const content = this.elements.map(ele=>{
      const [key, value] = ele;
      return value['Content/Tool'];
    });
    console.log(content);
    const textContent = content.join("\n");
    text(textContent, maxSizeOribit * 0.3, 0);

    //let div = createDiv('').size(100, 100);
    //div.html(textContent);

  }

  annotate(){
    textFont(fontNormal);
    textSize(fontsize);
    strokeWeight(99);
    fill(this.hue, 80,100,100);
    push();
    translate(width * -0.5, height * -0.5);
    const y = this.prio * fontsize + fontsize;
    text(`Prio ${this.prio}`, 0, y);
    pop();

    const element = getLatestElement(`prio-${this.prio}`, 2);
    element.addEventListener('click', ()=>{
      this.showElements();
    }, false);
  }

  drawOribitElements(){
    const elementNumber = this.elements.length;
    const elementAngle = 360 / elementNumber;
    this.radius = maxSizeOribit - (this.prio * orbitSegmentWeight * 2.5);
    this.hue = (hueStartContent + this.prio * hueStep) % 360;
    this.alpha = alphaStart + this.prio + alphaStepContent;
  
    let begin = random(0,360);
    let count = 0;
    
    const radius = this.radius;
    const hue = this.hue;
    const alpha = this.alpha;

    this.elements.forEach(ele => {
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
}


/* ###########################################################################
Custom Functions
############################################################################ */

function getLatestElement(id, newStrokeWeight){
  const elements = [...document.querySelectorAll("svg path")];
  const latestElement = elements.find(ele => Number(ele.getAttribute("stroke-width")) === 99 );
  latestElement.parentElement.setAttribute("id", id);
  latestElement.setAttribute("stroke-width", newStrokeWeight);
  return latestElement;
}

function renderContentModel(){
  for(let prio = 0; prio < contentPriorityMax;  prio++){
    const prioObject = new Prio(prio);
    
    


    // const annotation = new PrioAnnotation(prio);
  }
  
}



/* ###########################################################################
P5 Functions
############################################################################ */

function preload() {
  const url = datafile;
  orbitElementList = loadJSON(url);
  fontNormal = loadFont('assets/fonts/RobotoCondensed-Regular.ttf');
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
  maxSizeOribit = width > height ? height * 0.75 : width *0.75;
  shiftOrbit = (width/2 - maxSizeOribit/2) * -0.9;
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

