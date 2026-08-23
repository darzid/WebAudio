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
  fillTracksTable(tracksTable, tracks);
  
  initializeNumberInputs(document);
  initializeToggleButtons(document);
  initializeTableZoom(tracksTable, document.getElementById("zoom"));
}

function initializeToggleButtons(parentElement) {
  parentElement.querySelectorAll(".toggle-button")
    .forEach((button) => button.addEventListener("click", () => button.classList.toggle("active")));
}