let audioApp = null;
let elementHandlerRegistry = null;

let logging = false;

function consoleLog(message, args) {
  if (logging) {
    console.log(message, args);
  }
}

function consoleError(message, args) {
  if (logging) {
    console.error(message, args);
  }
}

function consoleWarn(message, args) {
  if (logging) {
    console.warn(message, args);
  }
}

function initialize() {
  renderTemplates();
  let audioAppElement = document.getElementById("AudioApp");
  audioAppElement.style.opacity = 0.5;

  createElementHandlerRegistry();
  createElementHandlers();

  setupAudioGraph();
  setupKnobs();
  consoleLog("Initialised");
  consoleLog("Ready");
  audioAppElement.style.opacity = 1.0;
  
//  document.querySelectorAll(".collapser").forEach(div => toggleNextSiblingVisibility(div));
}

function toggleNextSiblingVisibility(element) {
  let nextElement = element.nextElementSibling;
  if (!nextElement) {
    consoleError("No sibling found for element", element)
  }
  if (nextElement.style.display != "none") {
    nextElement.dataset.previousDisplay = nextElement.style.display;
    nextElement.style.display = "none";
    element.classList.add("collapsed");
    //nextElement.classList.add("hidden");
  } else {
    nextElement.style.display = nextElement.dataset.previousDisplay;
    element.classList.remove("collapsed");
    //nextElement.classList.add("hidden");
  }
}

function toggleEnabled() {
  let checkbox = window.event.srcElement.querySelector("input[name='Enabled']");
  checkbox.checked = !checkbox.checked;
  var evnt = checkbox["onchange"];
  if (evnt)
    evnt.call(checkbox);
}

function applyInputLists() {
  let items = document.querySelectorAll("input[list]");

  items.forEach(item => {
    let listName = item.getAttribute("list");
    //consoleLog("Fetch list for Item", listName, lists);

    let list = document.getElementById(listName);
    item.min = 0;
    if (!item.max)
      item.max = list.children.length - 1;
  });
}


function renderTemplates() {
  applyTemplates();
  applyInputLists();
}

function setupKnobs() {
  let knobs = document.querySelectorAll(".knob");
  knobs.forEach(knob => setupKnob(knob));
  consoleLog("knobs setup done")
}

function createElementHandlerRegistry() {
  elementHandlerRegistry = new ElementHandlerRegistry();
  consoleLog("Registering element handlers")

//let ds = new DrumSynth(document, "DrumSynth", this);
  
  elementHandlerRegistry.registerHandler("Effector", Effector);
  elementHandlerRegistry.registerHandler("Synth", Synth);
  elementHandlerRegistry.registerHandler("DrumSynth", DrumSynth);
  elementHandlerRegistry.registerHandler("Step", BruteSequencerStep);
  elementHandlerRegistry.registerHandler("BruteSequencer", BruteSequencer);
  elementHandlerRegistry.registerHandler("DrumStep", DrumSequencerStep);
  elementHandlerRegistry.registerHandler("DrumSequencer", DrumSequencer);


  elementHandlerRegistry.registerHandler("Track", Track);
  elementHandlerRegistry.registerHandler("AudioApp", AudioApp);


  //  consoleLog(`Found ${elementHandlerRegistry.handlers.length} handlers`, elementHandlerRegistry.handlers);
}

function createElementHandlers() {
  elementHandlerRegistry.processAll();
}

function setupAudioGraph() {
  const audioContext = new AudioContext();
  audioContext.onprocessorerror = (e) => alert("WebAudio error: " + e)
  audioContext.destination.channelCount = 2;
  audioContext.destination.channelCountMode = "max";

  audioApp = elementHandlerRegistry.handlers.find(handler => handler.elementClass == "AudioApp");
  audioApp.setupAudioGraph(audioContext);
  //setupPanner(audioContext);
}




function setupPanner(audioCtx){

// set up listener and panner position information
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const xPos = Math.floor(WIDTH / 2);
const yPos = Math.floor(HEIGHT / 2);
const zPos = 295;

// define other variables

const panner = audioCtx.createPanner();
panner.panningModel = "HRTF";
panner.distanceModel = "inverse";
panner.refDistance = 1;
panner.maxDistance = 10000;
panner.rolloffFactor = 1;
panner.coneInnerAngle = 360;
panner.coneOuterAngle = 0;
panner.coneOuterGain = 0;

if (panner.orientationX) {
  panner.orientationX.setValueAtTime(1, audioCtx.currentTime);
  panner.orientationY.setValueAtTime(0, audioCtx.currentTime);
  panner.orientationZ.setValueAtTime(0, audioCtx.currentTime);
} else {
  panner.setOrientation(1, 0, 0);
}

const listener = audioCtx.listener;

if (listener.forwardX) {
  listener.forwardX.setValueAtTime(0, audioCtx.currentTime);
  listener.forwardY.setValueAtTime(0, audioCtx.currentTime);
  listener.forwardZ.setValueAtTime(-1, audioCtx.currentTime);
  listener.upX.setValueAtTime(0, audioCtx.currentTime);
  listener.upY.setValueAtTime(1, audioCtx.currentTime);
  listener.upZ.setValueAtTime(0, audioCtx.currentTime);
} else {
  listener.setOrientation(0, 0, -1, 0, 1, 0);
}

let source;

//const play = document.querySelector(".play");
//const stop = document.querySelector(".stop");

//const boomBox = document.querySelector(".boom-box");

const listenerData = document.querySelector(".listener-data");
const pannerData = document.querySelector(".panner-data");

leftBound = -xPos + 50;
rightBound = xPos - 50;

xIterator = WIDTH / 150;

// listener will always be in the same place for this demo

if (listener.positionX) {
  listener.positionX.setValueAtTime(xPos, audioCtx.currentTime);
  listener.positionY.setValueAtTime(yPos, audioCtx.currentTime);
  listener.positionZ.setValueAtTime(300, audioCtx.currentTime);
} else {
  listener.setPosition(xPos, yPos, 300);
}

//listenerData.textContent = `Listener data: X ${xPos} Y ${yPos} Z 300`;

// panner will move as the boombox graphic moves around on the screen
function positionPanner() {
  if (panner.positionX) {
    panner.positionX.setValueAtTime(xPos, audioCtx.currentTime);
    panner.positionY.setValueAtTime(yPos, audioCtx.currentTime);
    panner.positionZ.setValueAtTime(zPos, audioCtx.currentTime);
  } else {
    panner.setPosition(xPos, yPos, zPos);
  }
  //pannerData.textContent = `Panner data: X ${xPos} Y ${yPos} Z ${zPos}`;
}
}