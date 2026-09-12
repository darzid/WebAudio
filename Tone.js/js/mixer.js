class Mixer {
  constructor() {
    this.mixerPanel = document.getElementById("mixer-panel");
    this.mixerPanelContent = this.mixerPanel.querySelector(".panel-content");
    
    session.project.tracks.forEach(track => this.addTrackFader(track));
  }
  
  addTrackFader(track) {
    let faderContainer = document.createElement("div");
    faderContainer.className = "fader-container";
    this.mixerPanelContent.appendChild(faderContainer);
    
    faderContainer.innerHTML += `<label>${track.name}</label><number-input id="${track.id}-fader" fillDirection="top" min="-100" max="0.0" step="0.1" value="${track.volume}" class="track-fader"/>`
    let numberInput = faderContainer.querySelector("number-input");
    numberInput.oninput = ()=> track.volume = numberInput.value;
    let muteButton = document.createElement("button");
    muteButton.innerText = "Mute";
    muteButton.className = "control toggle-button";
    faderContainer.appendChild(muteButton);
    
    let soloButton = document.createElement("button");
    soloButton.innerText = "Solo";
    soloButton.className = "control toggle-button ";
    faderContainer.appendChild(soloButton);
    
    initializeToggleButtons(faderContainer);
  }
}