import { Logger } from "./lib-ts/logger";
import { AudioApp } from "./devices/audio-app";

export class PresetBrowser {
  presets: { [key: string] : any} = {};
  
  selectedPreset = "";
  audioApp: AudioApp;
  constructor(audioApp: AudioApp) {
    this.audioApp = audioApp;
  }

  show() {
    let browser = document.getElementById("PresetBrowser") as HTMLDivElement;
    browser.style.display = "block";
    let presetsList = browser.querySelector(".PresetsList") as HTMLDivElement;
    this.presets = this.load();
    presetsList.innerHTML = "";
    Object.keys(this.presets).forEach(preset => {
      let presetItem = document.createElement("div");
      presetItem.className = "PresetListItem";
      let presetInput = document.createElement("input");
      presetInput.type = "radio";
      //presetInput.dataset.template = "preset-listitem-template";
      presetInput.id = preset + "-preset";
      presetInput.name = "SelectedPreset";
      presetInput.value = preset;
      presetItem.appendChild(presetInput);
      let presetLabel = document.createElement("label");
      presetLabel.setAttribute("for", presetInput.id);
      presetLabel.innerText = preset;
      presetItem.appendChild(presetLabel);

      presetsList.appendChild(presetItem);
    });
  }

  select() {
    let selectedPresetElement: HTMLInputElement = document.querySelector('input[name="SelectedPreset"]:checked')!;
    let selectedPresetName: string = selectedPresetElement!.value!;
    this.audioApp.setPreset(this.presets[selectedPresetName]);

    // this.audioApp.setFloatPropertyValue("Tempo",this.presets[selectedPreset].Tempo);
    // MidiClock.tempo = this.audioApp.getPropertyValue("Tempo");
    // this.audioApp.updateBpmText();

    (document.querySelector(".AppTitle") as HTMLElement).innerText = selectedPresetName;
    Logger.log("Preset selected", this.presets[selectedPresetName]);
    this.hide();
  }

  hide() {
    let browser = document.getElementById("PresetBrowser") as HTMLElement;
    browser.style.display = "none";
  }

  load() {
    const presetsString = localStorage.getItem('audioapp-presets');
    if (presetsString)
      return JSON.parse(presetsString);
    else
      return {};
  }

  save(presets: { [key: string] : string}) {
    localStorage.setItem('audioapp-presets', JSON.stringify(presets));
    this.presets = presets;
  }

  savePreset() {
    let presetName: string = window.prompt("Preset name", this.selectedPreset ? this.selectedPreset : "")!;
    let preset = this.audioApp.getPreset();
    Logger.log("Preset", preset);
    let presets = this.load();
    presets[presetName] = preset;
    this.save(presets);
    Logger.log("Save Preset", preset);
    (document.querySelector(".AppTitle") as HTMLElement).innerText = presetName;
  }
  
  export() {
    let presets = this.load();
    //let json = JSON.stringify(presets, null, 2);
    
    //const blob = new Blob(json, { type: "application/json" });
    let json = JSON.stringify(presets, null, 2)
    const jsonBlob = new Blob([json], { type: "application/json" });
    const exportUrl = window.URL.createObjectURL(jsonBlob);

    const a = document.createElement('a');
    a.href = exportUrl;
    a.download = 'Presets.json';
    a.innerText = "download";
    a.click();
    
    Logger.log("Presets", json);
  }
  
  import() {
    
  }
}
