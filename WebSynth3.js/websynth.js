let audioApp = null;
let elementHandlerRegistry = null;

let logging = false;

function consoleLog(message, args) {
  if (logging) {
    console.log(message, args);
  }
}

function consoleError(message, args) {
  //if (logging) {
    console.error(message, args);
 // }
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

  audioApp = elementHandlerRegistry.handlers.find(handler => handler.elementClass == "AudioApp");

  // setupAudioGraph();
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
  if (evnt) {
    evnt.call(checkbox);
    console.log("Fire checkbox changed")
  }
    
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

// function setupAudioGraph() {
//   const audioContext = new AudioContext();
//   audioContext.onprocessorerror = (e) => alert("WebAudio error: " + e)
//   audioContext.destination.channelCount = 2;
//   audioContext.destination.channelCountMode = "max";

//   audioApp = elementHandlerRegistry.handlers.find(handler => handler.elementClass == "AudioApp");
//   audioApp.setupAudioGraph(audioContext);
// }

function stepOnOffClick(srcElement) {
  let checkbox = srcElement.parentElement.querySelector('input');
  checkbox.checked=!checkbox.checked;
  var evnt = checkbox["onchange"];
  if (evnt)
    evnt.call(checkbox);
}
