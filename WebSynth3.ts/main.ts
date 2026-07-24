import { ElementHandlerRegistry } from "./lib-ts/element-handler-registry/element-handler-registry";
import { Logger } from "./lib-ts/logger";
import * as Tone from "tone";
import { Device } from "./devices/base-devices/device";
import { BruteSequencer } from "./devices/brute-sequencer";
import { BruteSequencerStep } from "./devices/brute-sequencer-step";
import { DrumSequencer } from "./devices/drum-sequencer";
import { DrumSequencerStep } from "./devices/drum-sequencer-step";
import { DuoSynthDevice } from "./devices/duo-synth";
import { Track } from "./devices/track";
import { AudioApp } from "./devices/audio-app";
import { applyTemplates } from "./lib-ts/template-expander/template-expander";
import { setupKnob } from "./lib-ts/knob/knob"
import { DeviceFactory } from "./lib-ts/element-handler-registry/device-factory";

var audioApp: AudioApp | null | undefined = null;

export class AppDeviceFactory extends  DeviceFactory {
  create(typeName: string, element: HTMLElement, cssClass: string): Device {
    switch (typeName) {
       case "AudioApp":
         return new AudioApp(element, cssClass);
        case "BruteSequencer":
          return new BruteSequencer(element, cssClass);
        case "BruteSequencerStep":
          return new BruteSequencerStep(element, cssClass);
        case "DrumSequencer":
          return new DrumSequencer(element, cssClass);
        case "DrumSequencerStep":
          return new DrumSequencerStep(element, cssClass);
        case "DuoSynth":
          return new DuoSynthDevice(element, cssClass);
       case "Track":
         return new Track(element, cssClass);
        default:
          throw "Unknown type " + typeName;
     }
  }
}

export function initialize() {
  renderTemplates();
  let audioAppElement: HTMLElement = document.getElementById("AudioApp")!;
  audioAppElement.style.opacity = "0.5";

  createElementHandlerRegistry();
  let deviceFactory : DeviceFactory= new AppDeviceFactory();
  ElementHandlerRegistry.processAll(deviceFactory);

  audioApp = ElementHandlerRegistry.handlers.find(handler => handler.elementClass == "AudioApp")! as AudioApp;
  audioApp.setupAudioGraph();
  // setupAudioGraph();
  setupKnobs();
  Logger.log("Initialised");
  Logger.log("Ready");
  audioAppElement.style.opacity = "1.0";

  document.querySelectorAll(".collapser").forEach(span => span.addEventListener("click", () => toggleNextSiblingVisibility(span.parentElement!)));
  (document.querySelectorAll("button.Enabled") as NodeListOf<HTMLButtonElement>).forEach(span => span.addEventListener("click", () => toggleEnabled(span)));
  document.querySelector("#play-button")!.addEventListener("click", async () => await audioApp!.play());
  document.querySelector("#rec-button")!.addEventListener("click", async () => await audioApp!.record());
  document.querySelector("#stop-button")!.addEventListener("click", async () => await audioApp!.stop());
  document.querySelector("#lowerbpm-button")!.addEventListener("click", async () => await audioApp!.lowerBpm());
  document.querySelector("#higherbpm-button")!.addEventListener("click", async () => await audioApp!.higherBpm());
  
  (document.querySelectorAll("button.play-step") as NodeListOf<HTMLButtonElement>).forEach(button => button.addEventListener("click", () => stepOnOffClick(button)));
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
  Logger.log("Setting up knobs");
  let knobs: NodeListOf<HTMLDivElement> = document.querySelectorAll("div.knob");
  knobs.forEach(knob => setupKnob(knob));
  Logger.log("knobs setup done")
}

function createElementHandlerRegistry() {
  Logger.log("Registering element handlers")

  // ElementHandlerRegistry.registerHandler("Effector", Effector);
  // ElementHandlerRegistry.registerHandler("Synth", "Synth");
  ElementHandlerRegistry.registerHandler("DuoSynth", "DuoSynth");
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

export function toggleEnabled(button: HTMLButtonElement) {
  Logger.log("ToggleEnabled")
  let checkbox: HTMLInputElement = button.querySelector("input[name='Enabled']")!;
  checkbox.checked = !checkbox.checked;
  var evnt = checkbox["onchange"];
  if (evnt) {
    evnt.call(checkbox, new Event("change"));
    console.log("Fire checkbox changed")
  }
}

initialize();