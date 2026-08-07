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

    session.project.start("+0.1");
    
    /*var positionUpdateLoop = new Tone.Loop(function(time){
    	//instead of scheduling visuals inside of here
    	//schedule a deferred callback with Tone.Draw
    
    	Tone.Draw.schedule(function(){
    		//this callback is invoked from a requestAnimationFrame
    		//and will be invoked close to AudioContext time
        let lastIndex = transport.position.indexOf(".");
        position.innerText = transport.position.substring(0, lastIndex);
    	}, time) //use AudioContext time of the event
    }, "16n");
    
    positionUpdateLoop.start(0);*/
    
    let positionTimer = transport.scheduleRepeat((time) => {
      window.requestAnimationFrame(() => {
        let lastIndex = transport.position.indexOf(".");
        let shortPos = transport.position.substring(0, lastIndex);
        let shortPosParts = shortPos.split(":");
        let bars = parseInt(shortPosParts[0]) + 1;
        let beats = parseInt(shortPosParts[1]) + 1;
        let sixts = parseInt(shortPosParts[2]) + 1;
        
        position.innerText = `${bars}:${beats}:${sixts}`;
        
      });
      
    }, "8n", "0");
    
    transport.start("+0.1");
    transport.stop(Tone.Time(Tone.Time("+0.1") + Tone.Time(session.project.length)));
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
