class Mixer {
  constructor() {
    this.mixerPanel = document.getElementById("mixer-panel");
    this.mixerPanelContent = this.mixerPanel.querySelector(".panel-content");
    
    session.project.tracks.forEach(track => this.addTrackFader(track));
  }
  
  addTrackFader(track) {
    this.mixerPanelContent.innerHTML += `<div class="fader-container"><label>${track.name}<number-input id="${track.id}-fader" fillDirection="top" min="-100" max="0.0" step="0.1" value="${track.volume}" class="track-fader"/></label></div>`
  }
}