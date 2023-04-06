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


let orbitElementList;
let maxSizeOribit = 200;
let fontNormal;
let fontBold;

const fontsize = 16;
const orbitSegmentWeight = 20;
const orbitSegmentPadding = orbitSegmentWeight /2;
const contentPriorityMax = 11;
const techPriorityMax = 3;
const datafile = './data/erco-services-gesamtprio.json';
const prioField = 'Gesamtprio';
const colorStep = 10;
const activeColor = [35, 100, 100];

const alphaStart = 10;
const alphaStepContent = (100 - alphaStart) / contentPriorityMax;

const dataPanelHeadline = document.getElementById('data-panel-headline');
const dataPanelContent = document.getElementById('data-panel-content');
const prioPanelData = document.getElementById('prio-panel-data');

let svgCanvas;
let defaultCanvas;
let canvasContainer;

let activePrio = false;

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
    this.prio = objectData.prio;
    this.content = objectData.content;
    this.id = slugify(this.content["Webservice/ Service"]);
    this.segment = this.createOrbitSegment();
    this.element = this.createOrbitElement();
    this.opacity;
    
    this.addElementInfo();
    this.addListener();
    return this;
  }

  onClickAction(){
    const targetPrio = this.prio;
    activePrio = targetPrio;

    const targetPrioObject = prioObjects[targetPrio-1];
    targetPrioObject.showElements();
    renderContentModel();
  }

  onMouseOverActionSegment(event){
    const target = event.target;
    this.opacity = target.getAttribute("stroke-opacity");
    // target.setAttribute("stroke-opacity", 1);
  }

  onMouseOutActionSegment(event){
    const target = event.target;
    // target.setAttribute("stroke-opacity", this.opacity);
  }

  addListener(){
    if(!this.segment) return;
    const $this = this;
    this.segment.addEventListener("click", function(){ $this.onClickAction($this) }, false);
    this.element.addEventListener("click", function(){ $this.onClickAction($this) }, false);
    this.segment.addEventListener("mouseover", this.onMouseOverActionSegment, false);
    this.segment.addEventListener("mouseout", this.onMouseOutActionSegment, false);
  }

  addElementInfo(){
    
  }

  createOrbitSegment(){
    strokeWeight(99);
    stroke(this.hue,80,0,this.alpha);
    strokeCap(SQUARE);
    noFill();
    arc(0,0,this.radius, this.radius, this.begin, this.end);
    
    return getLatestElement(`segment-${this.id}`, orbitSegmentWeight, false);
  }

  createOrbitElement(){
    strokeWeight(99);
    stroke(this.hue,0,0,this.alpha * 2);

    const [hue, sat, bri] = activeColor;
    fill(hue,sat,bri,this.alpha);
    const angle = this.begin + ((this.end - this.begin) /2);
    const x = cos(angle) * this.radius/2;
    const y = sin(angle) * this.radius/2;
    ellipse(x, y, orbitSegmentWeight * 0.7);
    return getLatestElement(`element-${this.id}`, 1, false);
  }
}


class Prio{
  constructor(prio){
    this.prio =  prio;
    this.elements = this.getOrbitElementsForPrio();
    this.orbitElements = [];
    this.hue;
    this.alpha = this.getAlpha();
    this.radius;
  
    if(this.elements.length > 0){
      this.drawOribitElements();
    }

    this.navItem = this.createNavItem();
  }

  getAlpha(){
    if(activePrio === false) return alphaStart + (this.prio * alphaStepContent);
    return activePrio === this.prio ? 100 : 10;
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
    const content = this.elements.map(ele=>{
      const [key, value] = ele;
      return value['Content/Tool'];
    });

    const contentData = content.map(item=>{
      return `<li>${item}</li>`;
    });

    dataPanelContent.innerHTML = `${contentData.join('')}`;
    activePrio = this.prio;

    if(this.elements.length > 0){
      dataPanelHeadline.classList.add('is-active');
      dataPanelContent.classList.add('is-active');
    }else{
      dataPanelHeadline.classList.remove('is-active');
      dataPanelContent.classList.remove('is-active');
    }
    renderContentModel();
  }

  createNavItem(){
    const itemClasses = [];
    if(activePrio === this.prio) itemClasses.push('is-active');
    if(this.elements.length === 0) itemClasses.push('is-disabled');
    const prioText = contentPriorityMax - this.prio;
    const prioTextDisplay = prioText < 10 ? `0${prioText}` : prioText;
    const prioElement = document.createElement('li');
    prioElement.innerHTML = `Prio ${prioTextDisplay}`;

    prioElement.setAttribute('class', itemClasses.join(' '));
    prioPanelData.appendChild(prioElement);
    prioElement.addEventListener('click', ()=>{
      this.showElements(), false;
    }, false);
  }

  drawOribitElements(){
    const elementNumber = this.elements.length;
    const elementAngle = 360 / elementNumber;
    this.radius = maxSizeOribit - (this.prio * orbitSegmentWeight * 2.5);
    this.hue = 0;
    
    randomSeed(0);

    let begin = random(0,360);
    let count = 0;
    
    const radius = this.radius;
    const hue = this.hue;
    const alpha = this.alpha;
    const prio = this.prio;

    this.elements.forEach(ele => {
      const [key, content] = ele;
      const padding = orbitSegmentPadding;
      const end = begin + elementAngle - padding;
      const objectData = {
        alpha, radius, begin, end, hue, content, prio
      };
      const element = new OrbitElement(objectData);
      this.orbitElements.push(element.id);

      begin = end + padding;
      count ++;
    });
  }
}


/* ###########################################################################
Custom Functions
############################################################################ */

function getLatestElement(id, newStrokeWeight, assignIdToParent = true){
  const elements = [...document.querySelectorAll("svg path")];
  const latestElement = elements.find(ele => Number(ele.getAttribute("stroke-width")) === 99 );
  if(!latestElement) return false;

  if(assignIdToParent) { latestElement.parentElement.setAttribute("id", id); }
  else { latestElement.setAttribute("id", id); }
  latestElement.setAttribute("stroke-width", newStrokeWeight);
  return latestElement;
}

var prioObjects = [];

function renderContentModel(){
  clear();
  prioPanelData.innerHTML = '';

  const canvasWidth = canvasContainer.offsetWidth;
  maxSizeOribit = canvasWidth *0.9;
  
  for(let prio = 1; prio < contentPriorityMax; prio++){
    const prioObject = new Prio(prio);
    prioObjects.push(prioObject);
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

  svgCanvas = createCanvas(canvasParams.w, canvasParams.h, SVG);
  defaultCanvas = document.querySelector(".p5Canvas");
  canvasContainer = document.querySelector("#canvas");
  canvasContainer.appendChild(defaultCanvas);

  // Display & Render Options
  frameRate(1);
  angleMode(DEGREES);
  colorMode(HSB, 360, 100, 100, 100);
  smooth();
  noLoop();
  
  // Anything else
  fill(200);
  stroke(0);
}

function draw() {

  translate(width/2, height/2);
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
  canvasParams.h = document.body.clientHeight;
}

function resizeMyCanvas() {
  getCanvasHolderSize();
  resizeCanvas(canvasParams.w, canvasParams.h);
}

function windowResized() {
  resizeMyCanvas();
}

