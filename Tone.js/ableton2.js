function initialize() {
  let playButton = document.getElementById("play");
  let stopButton = document.getElementById("stop");
  let recButton = document.getElementById("rec");
  
  playButton.onclick = () => {
    if (playButton.classList.contains("active")) return;
    playButton.classList.add("active");
  }
  
  stopButton.onclick = () => {
    if (!playButton.classList.contains("active")) return;
    playButton.classList.remove("active");
    if (recButton.classList.contains("active")) {
      recButton.classList.remove("active");
    }
  }
  
  let tracksTable = document.getElementById("tracks-table");
  let devicesPanel = document.getElementById("track-devices-panel");
  let clipEditPanel = document.getElementById("clip-editor-panel");
  
  fillTracksTable(tracksTable, tracks);
  
  initializeNumberInputs(document);
  initializeToggleButtons(document);
  initializeTableZoom(tracksTable, document.getElementById("zoom"));
  
  document.getElementById("devices-tab-button").addEventListener("click", () => showTrackDevices());
  document.getElementById("clip-editor-tab-button").addEventListener("click", () => showClip());
  
  initializeClipEditor();
  /*
  let toggleDevicesButton = document.getElementById("toggle-devices");
  console.log("toggleDevicesButton", toggleDevicesButton)
  toggleDevicesButton.onclick = () => {
    toggleDevicesButton.classList.toggle("active-tab");
    devicesPanel.style.display = (toggleDevicesButton.classList.contains("active-tab")) ? "flex" : "none";
    console.log("toggle devices")
    sizeTracksTableContainer();
  }
  let toggleClipEditButton = document.getElementById("toggle-clipview");
  toggleClipEditButton.onclick = () => {
    toggleClipEditButton.classList.toggle("active-tab");
    clipEditPanel.style.display = (toggleClipEditButton.classList.contains("active-tab")) ? "flex" : "none";
    console.log("toggle clip editor")
    sizeTracksTableContainer();
  }
  let toggleMixerButton = document.getElementById("toggle-mixer");
  */
}

function initializeToggleButtons(parentElement) {
  parentElement.querySelectorAll(".toggle-button")
    .forEach((button) => button.addEventListener("click", () => button.classList.toggle("active")));
}

