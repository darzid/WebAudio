import { ElementHandlerRegistry } from "./lib-ts/element-handler-registry/element-handler-registry";
import { Logger } from "./lib-ts/logger";
// import { Device } from "./devices/base-devices/device";
// import { Synth } from "./devices/synth";
// import { Track } from "./devices/track";
// import { AudioApp } from "./devices/audio-app";
import { applyTemplates } from "./lib-ts/template-expander/template-expander";

Logger.log('TypeScript works!');

var audioApp = null;

export function initialize() {
  renderTemplates();
  let audioAppElement: HTMLElement = document.getElementById("AudioApp")!;
  audioAppElement.style.opacity = "0.5";

  createElementHandlerRegistry();
  // let deviceFactory = new DeviceFactory();
  // ElementHandlerRegistry.processAll(deviceFactory);

  // audioApp = ElementHandlerRegistry.handlers.find(handler => handler.elementClass == "AudioApp");

  // setupAudioGraph();
  setupKnobs();
  Logger.log("Initialised");
  Logger.log("Ready");
  audioAppElement.style.opacity = "1.0";

  //  document.querySelectorAll(".collapser").forEach(div => toggleNextSiblingVisibility(div));
}

function renderTemplates() {
  applyTemplates();
  applyInputLists();
}

function applyInputLists() {
  let items: NodeListOf<HTMLInputElement> = document.querySelectorAll("input[list]");

  items.forEach(item => {
    let listName = item.getAttribute("list")!;
    //consoleLog("Fetch list for Item", listName, lists);

    let list = document.getElementById(listName)!;
    item.min = "0";
    if (!item.max)
      item.max = (list.children.length - 1).toString();
  });
}

function setupKnobs() {
  let knobs = document.querySelectorAll(".knob");
  // knobs.forEach(knob => setupKnob(knob));
  Logger.log("knobs setup done")
}

function createElementHandlerRegistry() {
  Logger.log("Registering element handlers")

  // ElementHandlerRegistry.registerHandler("Effector", Effector);
  ElementHandlerRegistry.registerHandler("Synth", "Synth");
  // ElementHandlerRegistry.registerHandler("DrumSynth", DrumSynth);
  ElementHandlerRegistry.registerHandler("Step", "BruteSequencerStep");
  ElementHandlerRegistry.registerHandler("BruteSequencer", "BruteSequencer");
  ElementHandlerRegistry.registerHandler("DrumStep", "DrumSequencerStep");
  ElementHandlerRegistry.registerHandler("DrumSequencer", "DrumSequencer");


  ElementHandlerRegistry.registerHandler("Track", "Track");
  ElementHandlerRegistry.registerHandler("AudioApp", "AudioApp");


  //  Logger.log(`Found ${ElementHandlerRegistry.handlers.length} handlers`, ElementHandlerRegistry.handlers);
}

// function setupAudioGraph() {
//   const audioContext = new AudioContext();
//   audioContext.onprocessorerror = (e) => alert("WebAudio error: " + e)
//   audioContext.destination.channelCount = 2;
//   audioContext.destination.channelCountMode = "max";

//   audioApp = ElementHandlerRegistry.handlers.find(handler => handler.elementClass == "AudioApp");
//   audioApp.setupAudioGraph(audioContext);
// }

function stepOnOffClick(srcElement: HTMLElement) {
  let checkbox: HTMLInputElement = srcElement.parentElement!.querySelector('input')!;
  checkbox.checked = !checkbox.checked;
  var evnt = checkbox["onchange"];
  if (evnt)
    evnt.call(checkbox, new Event("change"));
}

export function toggleNextSiblingVisibility(element: HTMLElement) {
  let nextElement = element.nextElementSibling as HTMLElement;
  if (!nextElement) {
    Logger.error("No sibling found for element", element)
  }
  if (nextElement.style.display != "none") {
    nextElement.dataset.previousDisplay = nextElement.style.display;
    nextElement.style.display = "none";
    element.classList.add("collapsed");
  } else {
    nextElement.style.display = nextElement.dataset.previousDisplay!;
    element.classList.remove("collapsed");
  }
}

initialize();
Logger.log('Initialized');

// export class DeviceFactory implements IDeviceFactory {
//   create(typeName: string, element: HTMLElement, cssClass: string): Device {
//     switch (typeName) {
//       case "AudioApp":
//         return new AudioApp(element, cssClass);
//       case "Synth": 
//         return new Synth(element, cssClass);
//       case "Track":
//         return new Track(element, cssClass);
//     }
//     let constructorString = `new ${typeName}(element, cssClass)`;
//     let instance = eval(constructorString);
//     return instance;
//   }
// }