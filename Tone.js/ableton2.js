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
  
  let toggleDevicesButton = document.getElementById("toggle-devices");
  toggleDevicesButton.onclick = () => {
    devicesPanel.style.display = (toggleDevicesButton.classList.contains("active")) ? "flex" : "none";
    sizeTracksTableContainer();
  }
  let toggleClipEditButton = document.getElementById("toggle-clipview");
  toggleClipEditButton.onclick = () => {
    clipEditPanel.style.display = (toggleClipEditButton.classList.contains("active")) ? "flex" : "none";
    sizeTracksTableContainer();
  }
  let toggleMixerButton = document.getElementById("toggle-mixer");
}

function initializeToggleButtons(parentElement) {
  parentElement.querySelectorAll(".toggle-button")
    .forEach((button) => button.addEventListener("click", () => button.classList.toggle("active")));
}

function pianorollScrollX() {
  document.getElementById("piano-roll").xoffset = document.getElementById("pianoroll-scroll-x").value;
}

function pianorollScrollY() {
  document.getElementById("piano-roll").yoffset = document.getElementById("pianoroll-scroll-y").value;
}

function pianorollZoomX() {
  document.getElementById("piano-roll").xrange = document.getElementById("pianoroll-zoom-x").value;
}

function pianorollZoomY() {
  document.getElementById("piano-roll").yrange = document.getElementById("pianoroll-zoom-y").value;
}