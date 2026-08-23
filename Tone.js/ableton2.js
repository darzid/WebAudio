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
  
  fillTracksTable(tracksTable, tracks);
  sizeTracksTableContainer();
  
  initializeNumberInputs(document);
  initializeToggleButtons(document);
  initializeTableZoom(tracksTable, document.getElementById("zoom"));
  
  
  let toggleDevicesButton = document.getElementById("toggle-devices");
  toggleDevicesButton.onclick = () => {
    
    devicesPanel.style.display = (toggleDevicesButton.classList.contains("active")) ? "flex" : "none";
    sizeTracksTableContainer();
    
  }
  let toggleMixerButton = document.getElementById("toggle-mixer");
}

function initializeToggleButtons(parentElement) {
  parentElement.querySelectorAll(".toggle-button")
    .forEach((button) => button.addEventListener("click", () => button.classList.toggle("active")));
}

function sizeTracksTableContainer() {
  let tracksTable = document.getElementById("tracks-table");
  let devicesPanel = document.getElementById("track-devices-panel");
  
  let pageHeight = window.innerHeight;
    
  let devicesPanelHeight = devicesPanel.getBoundingClientRect().height;
  let devicesPanelTop = devicesPanelHeight > 0 ? devicesPanel.getBoundingClientRect().y : pageHeight;
  
  
  let tracksTableHeight = tracksTable.getBoundingClientRect().height;
  let tracksTableTop = tracksTable.getBoundingClientRect().y;
  
  let yDelta = 0;
  if (!tracksTable.dataset.initialY) {
    tracksTable.dataset.initialY = tracksTableTop;
    console.log("top", tracksTableTop);
  } 
  else {
    yDelta = tracksTable.dataset.initialY - tracksTableTop;
    console.log("yDelta", yDelta);
  }
  let tracksTableBottom = tracksTableTop + tracksTableHeight;
  
  let availableHeight = devicesPanelTop - tracksTableTop;
  let overflow = availableHeight - (tracksTableHeight + yDelta);
  console.log("overflow", overflow, tracksTable.getBoundingClientRect());
  
  if (overflow < 0) {
    console.log("overflow fix", overflow);
    tracksTable.parentElement.style.maxHeight = `${tracksTableHeight + overflow}px`;
    tracksTable.parentElement.style.height = tracksTable.parentElement.style.maxHeight;
  }
  else
  {
    console.log("no overflow", overflow);
    tracksTable.parentElement.style.maxHeight = `${tracksTableHeight}px`;
    tracksTable.parentElement.style.height = tracksTable.parentElement.style.maxHeight;
  }
}