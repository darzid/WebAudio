import { PianoRoll } from "./ui-components/piano-roll";
import { Session } from "./models";
import { applyTemplates } from "./lib-ts/template-expander/template-expander";
import { initializeToggleButtons } from "./ui-components/toggle-button";

const pianoRoll = new PianoRoll();
pianoRoll.init();

let output = document.getElementById("output");
var presets: { [key: string]: any };
var session: Session = new Session();
let selectedTrackId: string | null = null;

var isInitialized = false;

await session.loadProject("project.json");


applyTemplates();

document.addEventListener("click", async () => {
  await initialize();
});

async function initialize() {
  if (isInitialized == true)
    return;
  console.log("Initializing");

  isInitialized = true;
  await Tone.start();

  if (!presets) {
    loadPresets();
    console.log(`Loaded presets to presets-data`, document.getElementById("presets-data"));
  }
  else {
    console.warn("Already loaded presets");
  }

  await session.loadProject("project.json");
  let tracksElement = document.getElementById("tracks") as HTMLElement;
  session.project!.tracks.forEach(track => {
    let trackElement = document.createElement("div");
    trackElement.id = track.id;
    trackElement.setAttribute("name", track.name);
    trackElement.setAttribute("data-template", "Track");
    tracksElement.appendChild(trackElement);

    applyTemplates();

    trackElement = document.getElementById(track.id) as HTMLDivElement;

    bind(trackElement.querySelector<HTMLElement>(".track-header")!, track.channel);

    trackElement.querySelector(".track-header input[type='checkbox'][name='enabled']")!.addEventListener("change", (e) => {
      let checkbox = e.target! as HTMLInputElement;
      if (checkbox.checked!)
        console.log("Activating track " + track.id);
      else
        console.log("Deactivating track " + track.id);
      track.channel.mute = checkbox.checked;
    });
    let trackDevicesElement = trackElement.querySelector<HTMLDivElement>("div[name='Devices']")!;

    track.devices.forEach(device => {
      let newDeviceElement = document.createElement("div");
      newDeviceElement.id = `${track.id}-${device.name}`;
      newDeviceElement.setAttribute("name", device.name);
      newDeviceElement.setAttribute("data-template", device.name);
      trackDevicesElement.appendChild(newDeviceElement);

      applyTemplates();
      let deviceElement = document.getElementById(newDeviceElement.id) as HTMLElement;
      bind(deviceElement, device);
      deviceElement.querySelector(".browse-button")!.addEventListener("click", (e) => showPresetBrowser(device, deviceElement));
    });

    let trackDevices = track.devices.filter(device => device.name != "LFO");
    for (let deviceIndex = 0; deviceIndex < trackDevices.length - 1; deviceIndex++) {
      trackDevices[deviceIndex].connect(trackDevices[deviceIndex + 1]);
    }
    track.devices[track.devices.length - 1].connect(track.channel);
  })

  initializeToggleButtons();

  let armTrackInputs = document.querySelectorAll<HTMLInputElement>("input[type='radio'][name='arm-track']");
  let armTrackInput = armTrackInputs[0] as HTMLInputElement;
  armTrackInput.checked = true;
  selectedTrackId = session.project!.tracks[0]!.id;
  armTrackInputs.forEach(armTrackInput =>
    armTrackInput.addEventListener("change", () => selectedTrackId = armTrackInput.value));

  document.addEventListener("PlayNoteRequestEvent", (e) => playNote(e as CustomEvent));
  document.addEventListener("StopNoteRequestEvent", (e) => stopNote(e as CustomEvent));

  (document.getElementById("tracks") as HTMLDivElement).style.opacity = "1";

  Tone.getTransport().bpm.value = session.project!.tempo;

  let recButton = document.getElementById("rec-button") as HTMLButtonElement;
  let playButton = document.getElementById("play-button") as HTMLButtonElement;
  let stopButton = document.getElementById("stop-button") as HTMLButtonElement;
  stopButton.disabled = true;
  let recorder: Tone.Recorder = null;

  recButton.addEventListener("click", () => {
    recButton.disabled = true;
    playButton.disabled = true;
    stopButton.disabled = false;

    recorder = new Tone.Recorder();
    session.project!.masterChannel.connect(recorder);

    // start recording
    recorder.start();

    
  });

  playButton.addEventListener("click", () => {
    recButton.disabled = true;
    playButton.disabled = true;
    stopButton.disabled = false;

    session.start(Tone.now() + 0.5);
    //Tone.getTransport().stop(Tone.now() + 2.5);
  });

  stopButton.addEventListener("click", async () => {
    Tone.getTransport().stop();

    if (recorder) {
      // the recorded audio is returned as a blob
      const recording = await recorder.stop();
      // download the recording by creating an anchor element and blob url
      const url = URL.createObjectURL(recording);
      const anchor = document.createElement("a");
      anchor.download = "recording.ogg";
      anchor.href = url;
      anchor.click();

      recorder = null;
    }

    recButton.disabled = false;
    playButton.disabled = false;
    stopButton.disabled = true;
  });

  (document.getElementById("loading") as HTMLElement).style.display = "none";
  console.log("Initialized");
}

function loadPresets() {
  fetch('.\\preset-bank.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      presets = data;
      let presetBrowser = document.getElementById("PresetBrowser") as HTMLDivElement;
      (document.getElementById('presets-data') as HTMLElement).textContent = JSON.stringify(data, null, 2);

      let presetPaths = Object.keys(data);
      presetPaths.forEach(presetPath => {
        presetPath = presetPath.replace("effect\\", "").replace("instrument\\", "").replace(".json", "");
        let deviceName = presetPath.split("\\")[0];

        let devicePresetSelect = document.getElementById(deviceName + "-presets") as HTMLSelectElement;
        if (!devicePresetSelect) {
          devicePresetSelect = document.createElement("select");
          devicePresetSelect.id = `${deviceName}-presets`;
          devicePresetSelect.size = 5;
          devicePresetSelect.style.display = "none";
          presetBrowser.appendChild(devicePresetSelect);
        }

        let option = document.createElement("option") as HTMLOptionElement;
        option.innerText = presetPath.split("\\")[1]!;
        devicePresetSelect.appendChild(option);
      })
    })
    .catch(error => {
      console.error('Error loading JSON:', error);
    });
}

function showPresetBrowser(device: any, deviceElement: HTMLElement) {
  let deviceName = deviceElement.getAttribute("name");
  let presetListElement = document.getElementById(`${deviceName}-presets`) as HTMLSelectElement;
  if (!presetListElement) {
    return;
  }
  let boundingRect = deviceElement.querySelector(".title-bar")!.getBoundingClientRect();
  presetListElement.style.position = "absolute";
  presetListElement.style.left = `${boundingRect.left}px`;
  presetListElement.style.top = `${boundingRect.top + boundingRect.height}px`;
  presetListElement.style.width = `${boundingRect.width}px`;
  presetListElement.style.display = "inline";
  presetListElement.addEventListener("change", () => applyPreset(device, deviceElement, presetListElement, presetListElement.value));
}

function applyPreset(device: any, deviceElement: HTMLElement, presetListElement: HTMLSelectElement, presetName: string) {
  let presetPaths = Object.keys(presets);
  let presetPath: string = presetPaths.find(presetPath => presetPath.endsWith("\\" + presetName))!;
  let preset: any = presets[presetPath];

  let presetParameterNames = Object.keys(preset);
  let presetCursor = preset;
  let module = device;
  applyModuleParameters(presetCursor, module, presetParameterNames);

  let addEventHandler = false;

  let numberParameters = deviceElement.querySelectorAll(".Parameter input");
  numberParameters.forEach(element => {
    bindNumberInputElement(element as HTMLInputElement, device, addEventHandler);
  });

  let optionParameters = deviceElement.querySelectorAll(".Parameter select");
  optionParameters.forEach(element => {
    bindOptionSelectElement(element as HTMLSelectElement, device, addEventHandler);
  });

  presetListElement.style.display = "none";
  console.log(`Preset ${presetName} applied`);
}

function applyModuleParameters(presetCursor: any, module: any, presetParameterNames: string[]) {
  presetParameterNames.forEach(paramName => {
    if (typeof presetCursor[paramName] === "object") {
      let moduleParamNames = Object.keys(presetCursor[paramName]);
      applyModuleParameters(presetCursor[paramName], module[paramName], moduleParamNames);
    }
    else {
      let paramType = typeof presetCursor[paramName];
      if (paramType === "number" || paramType === "string") {
        if (typeof module[paramName] != "object") {
          module[paramName] = presetCursor[paramName];
        } else {
          module[paramName].value = presetCursor[paramName];
        }
      }
    }
  });
}

function playNote(eventInfo: CustomEvent) {
  let track = session.project!.tracks.find(track => track.id === selectedTrackId)!;
  if (track.devices.length == 0) return;
  track.instrument.triggerAttack(eventInfo.detail.note, Tone.now());
}

function stopNote(eventInfo: CustomEvent) {
  let track = session.project!.tracks.find(track => track.id === selectedTrackId)!;
  if (track.devices.length == 0) return;
  track.instrument.triggerRelease(Tone.now());
}

function bind(element: HTMLElement, object: any) {
  console.log(`Bind ${element.getAttribute("name")} to object ${object.name}`, element, object);
  let addEventHandler = true;

  let numberParameters = element.querySelectorAll<HTMLInputElement>(`:scope > .ModuleParameters > article.Parameter input`);
  numberParameters.forEach(element => {
    bindNumberInputElement(element, object, addEventHandler);
  });

  let optionParameters = element.querySelectorAll<HTMLSelectElement>(`:scope > .ModuleParameters > article.Parameter select`);
  optionParameters.forEach(element => {
    bindOptionSelectElement(element, object, addEventHandler);
  });

  let partialCountParameters = element.querySelectorAll<HTMLInputElement>(":scope > .ModuleParameters > article.Parameter input[name='partialCount']");
  partialCountParameters.forEach(element => {
    let oscillatorTypeParameterSelectElement = element.parentElement!.parentElement!.querySelector<HTMLSelectElement>(".Parameter select[name='type']");
    let oscillatorTypeOptionElements = oscillatorTypeParameterSelectElement!.querySelectorAll("option");
    let elementValue = parseFloat(element.getAttribute("value")!);
    let currentPartialCountSuffix = elementValue > 0 ? `${elementValue}` : "";
    element.addEventListener("change", () => {
      let newPartialCountSuffix = elementValue > 0 ? `${elementValue}` : "";
      oscillatorTypeOptionElements.forEach(option => option.innerText = option.innerText.replace(currentPartialCountSuffix, "") + newPartialCountSuffix);
      currentPartialCountSuffix = newPartialCountSuffix;
    })
  });

  let childModules = element.querySelectorAll<HTMLElement>(`:scope > .ModuleParameters > article.Module`);
  childModules.forEach(childModuleElement => {
    bind(childModuleElement, object[(childModuleElement).getAttribute("name")!]);
  });

  console.log(`Bind finished ${element.getAttribute("name")} to object ${object.name}`, element, object);
}

function bindNumberInputElement(element: HTMLInputElement, object: any, addEventHandler: boolean) {
  let namespace = getParameterNamespace(element);
  let parameterOwner = getParameterOwner(object, namespace);
  let parameterName = element.name;
  let isNumberProperty = (typeof parameterOwner[parameterName] === "number");
  let valueElement = element.parentElement!.querySelector(`value[for="${element.name!}"]`);

  console.log(`Connecting input event for parameter "${namespace}"`, parameterOwner, parameterOwner[parameterName]);

  element.value = isNumberProperty ? parameterOwner[parameterName] : parameterOwner[parameterName].value;
  if (valueElement)
    valueElement.innerHTML = element.value;

  if (addEventHandler) {
    element.addEventListener("input", () => {
      let oldValue = isNumberProperty ? parameterOwner[parameterName] : parameterOwner[parameterName].value;
      if (isNumberProperty)
        parameterOwner[parameterName] = element.value;
      else
        parameterOwner[parameterName].value = element.value;
      if (valueElement)
        valueElement.innerHTML = element.value;
      //console.log(`Updated "${namespace}" from ${oldValue} to ${element.value}`);
    })
  }
}

function bindOptionSelectElement(element: HTMLSelectElement, object: any, addEventHandler: boolean) {
  let namespace = getParameterNamespace(element);
  let parameterOwner = getParameterOwner(object, namespace);
  let parameterName = element.name;

  element.value = parameterOwner[parameterName];

  if (addEventHandler) {
    element.addEventListener("input", () => {
      let oldValue = parameterOwner[parameterName];
      parameterOwner[parameterName] = element.value;
      //console.log(`Updated "${namespace}" from ${oldValue} to ${element.value}`);
    });
  }
}

function getParameterNamespace(element: HTMLInputElement | HTMLSelectElement) {
  let parentName: string = "";
  let parentElement = element.parentElement;
  while (parentElement && !parentName) {
    if (parentElement.classList.contains("Component") || parentElement.classList.contains("Source")) {
      parentName = parentElement.getAttribute("name")!;
    }
    else {
      parentElement = parentElement.parentElement;
    }
  }

  let namespace = parentName ? `${parentName}.${element.name}` : element.name;

  return namespace;
}

function getParameterOwner(object: any, namespace: string) {
  let namespaceParts = namespace.split(".");
  let parameterOwner = object;
  for (let namespacePartIndex = 0; namespacePartIndex < namespaceParts.length - 1; namespacePartIndex++) {
    parameterOwner = parameterOwner[namespaceParts[namespacePartIndex]!];
  }

  if (!parameterOwner) {
    if (namespaceParts.length == 2) {
      return object;
    }
    else
      throw "Parameter owner object not found for parameter " + namespaceParts[namespaceParts.length - 1];
  }

  return parameterOwner;
}