function initializeTransport() {


  let position = document.getElementById("position");
  let recButton = document.getElementById("rec-button");
  let playButton = document.getElementById("play-button");
  let stopButton = document.getElementById("stop-button");
  stopButton.disabled = true;
  let recorder = null;
  let positionTimer = null;
  let transport = Tone.getTransport();
  transport.on("stop", (time) => stop(time));
  recButton.addEventListener("click", () => {
    recorder = new Tone.Recorder();
    session.project.masterChannel.connect(recorder);

    // start recording
    recorder.start();

    start();
  });

  playButton.addEventListener("click", () => {
    start();
  });

  function start() {
    recButton.disabled = true;
    playButton.disabled = true;
    stopButton.disabled = false;

    session.project.start(Tone.now());
    let positionTimer = transport.scheduleRepeat((time) => {
      let lastIndex = transport.position.indexOf(".");
      position.innerText = transport.position.substring(0, lastIndex);
    }, "16n", "0");
    transport.start(Tone.now(), 0);
    transport.stop(Tone.now() + Tone.Time(session.project.length));
  }

  stopButton.addEventListener("click", async () => {
    transport.stop();
  });
  
  function stop(time) {
    transport.clear(positionTimer);

    if (recorder) {
      saveRecording(recorder);
    }

    recButton.disabled = false;
    playButton.disabled = false;
    stopButton.disabled = true;
  }
}
