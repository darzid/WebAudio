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
    muteButton.id=`${track.id}-mute`;
    muteButton.innerText = "Mute";
    muteButton.className = "control toggle-button mute-button";
    faderContainer.appendChild(muteButton);
    let soloedMuteButtons = [];
    muteButton.onclick = async () => {
      
      if (muteButton.classList.contains("active")) {
        track.enabled = true;
        console.log("track unmuted")
      }
      else {
        track.enabled = false;
        console.log("track muted")
      }
    };
    
    let soloButton = document.createElement("button");
    soloButton.innerText = "Solo";
    soloButton.className = "control toggle-button cyan solo-button";
    soloButton.id=`${track.id}-solo`;
    faderContainer.appendChild(soloButton);
    soloButton.onclick = async () => {
      let muteButtons = this.mixerPanelContent.querySelectorAll(".mute-button");
        
      if (soloButton.classList.contains("active")) {
        track.enabled = true;
        
        
        soloedMuteButtons.push(muteButton);
      //  soloedMuteButtons = soloedMuteButtons.splice(soloedMuteButtons.indexOf(muteButton),1);
        session.project.tracks.forEach(projectTrack => {
          if (track != projectTrack) {
            projectTrack.enabled = false;
          }
        })
        muteButtons.forEach(projectMuteButton => {
          if (projectMuteButton != muteButton) {
            
            projectMuteButton.classList.remove("active");
            projectMuteButton.disabled="";
          }
        })
        
        console.log("track solod")
      }
      else {
        
        
        session.project.tracks.forEach(projectTrack => {
          if (track != projectTrack) {
            projectTrack.enabled = true;
          }
        })
        muteButtons.forEach(projectMuteButton => {
          if (projectMuteButton != muteButton) {
            let projectSoloButton = projectMuteButton.closest(".fader-container").querySelector(".solo-button");
            if (!projectSoloButton.classList.contains("active")) {
              projectMuteButton.classList.add("active");
              projectMuteButton.disabled="true";
            }
          }
          console.log("soloed", soloedMuteButtons)
        })
        muteButton.classList.remove("active");
      
        console.log("track unsolod")
      }
    };
    initializeToggleButtons(faderContainer);
  }
}