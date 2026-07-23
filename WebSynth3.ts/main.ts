import { ElementHandlerRegistry, IDeviceFactory } from "./lib-ts/element-handler-registry/element-handler-registry";
import { Logger } from "./lib-ts/logger";
import { AudioApp } from "./devices/audio-app";
import { SequencerBase } from "./devices/sequencer-base";
import { SequencerStep } from "./devices/sequencer-step";
import { BruteSequencerStep } from "./devices/brute-sequencer-step";
import { BruteSequencer } from "./devices/brute-sequencer";
import { Device } from "./devices/base-devices/device";
import { DrumSequencerStep } from "./devices/drum-sequencer-step";
import { DrumSequencer } from "./devices/drum-sequencer";
import { Synth } from "./devices/synth";
import { Track } from "./devices/track";

import { applyTemplates } from "./lib-ts/template-expander/template-expander";

Logger.log('TypeScript works!');

var audioApp: AudioApp | null = null;

export class DeviceFactory implements IDeviceFactory {
  constructor() {
    Logger.log("DeviceFactory constructor");
  }

  create(typeName: string, element: HTMLElement, cssClass: string): Device | undefined {
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
      case "Synth":
        return new Synth(element, cssClass);
      case "Track":
        return new Track(element, cssClass);
      default:
        return undefined;
    }
    // let constructorString = `new ${typeName}(element, cssClass)`;
    // let instance = eval(constructorString);
    // return instance;
    //return null;
  }
}

export function initialize() {
  renderTemplates();
  let audioAppElement: HTMLElement = document.getElementById("AudioApp")!;
  audioAppElement.style.opacity = "0.5";

  createElementHandlerRegistry();
  let deviceFactory = new DeviceFactory();
  ElementHandlerRegistry.processAll(deviceFactory);

  audioApp = ElementHandlerRegistry.handlers.find(handler => handler.elementClass == "AudioApp") as AudioApp;
  document.querySelector("#play-button")?.addEventListener("click", async () => await audioApp!.play());
  document.querySelector("#rec-button")?.addEventListener("click", async () => await audioApp!.record());
  document.querySelector("#stop-button")?.addEventListener("click", async () => await audioApp!.stop());

  // setupAudioGraph();
  setupKnobs();
  Logger.log("Knobs setup");
  audioAppElement.style.opacity = "1.0";

  let collapserSpans = document.querySelectorAll(".collapser") as NodeListOf<HTMLSpanElement>;
  collapserSpans.forEach(span => span.addEventListener("click", () => toggleNextSiblingVisibility(span.parentElement)));
  collapserSpans.forEach(span => toggleNextSiblingVisibility(span.parentElement!));
  Logger.log("Collapser divs set", collapserSpans);
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
  ElementHandlerRegistry.registerHandler("DrumStep", "DrumSequencerStep");

  ElementHandlerRegistry.registerHandler("BruteSequencer", "BruteSequencer");
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

