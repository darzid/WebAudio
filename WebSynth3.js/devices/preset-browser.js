class PresetBrowser {
  presets = {};
  selectedPreset = "";
  constructor(audioApp) {
    this.audioApp = audioApp;
  }

  show() {
    let browser = document.getElementById("PresetBrowser");
    browser.style.display = "block";
    let presetsList = browser.querySelector(".PresetsList");
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
    let selectedPreset = document.querySelector('input[name="SelectedPreset"]:checked').value;
    this.audioApp.setPreset(this.presets[selectedPreset]);

    // this.audioApp.setFloatPropertyValue("Tempo",this.presets[selectedPreset].Tempo);
    // MidiClock.tempo = this.audioApp.getPropertyValue("Tempo");
    // this.audioApp.updateBpmText();

    document.querySelector(".AppTitle").innerText = selectedPreset;
    consoleLog("Preset selected", this.presets[selectedPreset]);
    this.hide();
  }

  hide() {
    let browser = document.getElementById("PresetBrowser");
    browser.style.display = "none";
  }

  load() {
    const presetsString = localStorage.getItem('audioapp-presets');
    if (presetsString)
      return JSON.parse(presetsString);
    else
      return {};
  }

  save(presets) {
    localStorage.setItem('audioapp-presets', JSON.stringify(presets));
    this.presets = presets;
  }

  savePreset() {
    let presetName = window.prompt("Preset name", this.selectedPreset ? this.selectedPreset : "");
    let preset = this.audioApp.getPreset();
    consoleLog("Preset", preset);
    let presets = this.load();
    presets[presetName] = preset;
    this.save(presets);
    consoleLog("Save Preset", preset);
    document.querySelector(".AppTitle").innerText = presetName;
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
    
    consoleLog("Presets", json);
  }
  
  import() {
    
  }
}
