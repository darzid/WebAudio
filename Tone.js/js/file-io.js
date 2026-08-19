var openProjectButton;
var fileInput;
var saveProjectButton;
var projectNameInput;

function initializeLoadSaveCommands(session) {
  openProjectButton = document.getElementById("open-project-button");
  fileInput = document.getElementById("file-input");
  saveProjectButton = document.getElementById("save-project-button");
  projectNameInput = document.getElementById("project-name");

  openProjectButton.style.display = "block";
  fileInput = document.getElementById("file-input");

  openProjectButton.addEventListener("click", () => {
    fileInput.parentElement.style.display = "block";
    fileInput.addEventListener('change', (e) => loadProject(e, session), false);
  });

  saveProjectButton = document.getElementById("save-project-button");
  saveProjectButton.style.display = "block";
  saveProjectButton.addEventListener("click", () => session.project.save(), false);

  projectNameInput = document.getElementById("project-name");
  projectNameInput.style.display = "inline";
  projectNameInput.addEventListener("change", () => session.project.name = projectNameInput.value);

  function loadProject(e, session) {
    var file = e.target.files[0];
    if (!file) {
      console.log("No file");
      return;
    }
    else {
      console.log("file", file.bytes);
    }

    var reader = new FileReader();
    reader.addEventListener("load", (e) => {
      try {
        var contents = e.target.result;

        let projectFile = JSON.parse(contents);
        session.project = new Project(projectFile);

        createProjectUI(session);
      }
      catch (error) {
        console.error("Error while loading project", error)
      }
      finally {
        fileInput.parentElement.style.display = "none";
      }
    });

    reader.readAsText(file);
  }
}

async function loadDefaultProject(session) {
  await fetch('.\\project.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(projectFile => {
      session.project = new Project(projectFile);
      createProjectUI(session);
    })
    .catch(error => {
      console.error('Error loading JSON:', error);
    });
}

function createProjectUI(session) {
  projectNameInput.value = session.project.name;

  tracksElement = document.getElementById("tracks");
  tracksElement.innerHTML = "";

  mixerElement = document.getElementById("mixer");
  mixerElement.innerHTML = "";

  session.project.tracks.forEach(track => renderTrack(session.project, tracksElement, track));
  initializeToggleButtons();
  initializeArmTrackButtons();

  Tone.Transport.bpm.value = session.project.tempo;
  Tone.Transport.swing = 0.2;
  Tone.Transport.swingSubdivision = "16n";

  function initializeArmTrackButtons() {
    let armTrackInputs = document.querySelectorAll("input[type='radio'][name='arm-track']");
    armTrackInputs[0].checked = true;
    selectedTrackId = session.project.tracks[0].id;
    armTrackInputs.forEach(armTrackInput =>
      armTrackInput.addEventListener("change", () => selectedTrackId = armTrackInput.value));
  }
}