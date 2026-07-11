class Sampler {
  constructor(context) {
    this.context = context;
    this.samples = [];
    this.sampleLeases = [];
    this.recordingSource = null;
    this.recorder = null;
    this.isRecording = false;
    this.currentRecordingId = "";
    this.loadSamplesFromState();
    this._offlineContext = null;
    this._renderedBuffer = [];
    this._song = null;
  }

  async requestAccess() {
    try {
      consoleLog("request")
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
    }
    catch (err) {
      consoleError('Microphone access failed:', err.name, err.message);
    }

    this.recordingSource = this.context.createMediaStreamSource(this.stream);
    consoleLog("Microphone acccess aqcuired");
  }

  async startRendering(sourceNode) {
    consoleLog("startRendering[1] started.");
    this.isRecording = true;
    let blob = null;
    try {
      
     // this._renderedBuffer = this.context.createBuffer(2, this.context.sampleRate * 40, this.context.sampleRate);
    //  consoleLog("startRendering[2] renderedBuffer created");

      consoleLog("startRendering[2] starting offline context start rendering");
      let buffer = await this.context.startRendering();
      consoleLog("startRendering[3] completed successfully. result=", buffer);
    //  .then(audioBuffer => consoleLog("Rendering completed successfully. result=", audioBuffer));
      const wav = this._audioBufferToWav(buffer);
      blob = new Blob([wav], { type: 'audio/wav' });
      

    //  consoleLog("startRendering[4] Rendered");
     /* consoleLog("startRendering[5] created render buffer");
      sourceNode.disconnect();
      sourceNode.connect(offlineContext);
      sourceNode.start();*/
      //_consoleLog("startRendering[5] started sourceNode");
    }
    catch (error) {
      consoleError("startRendering failed.", error);
      throw error;
    }
    
    this.currentRecordingId = crypto.randomUUID();
      
    const newSample = this.importSample(this.currentRecordingId, blob);
    consoleLog("Imported recording " + this.currentRecordingId);
      
    const url = URL.createObjectURL(blob);
      
    const a = document.createElement('a');
    a.href = url;
    a.download = 'render.wav';
    a.innerText = "download";
   // a.click();
    
    document.querySelector(".app-buttons").appendChild(a);
  }

  stopRendering() {
   // consoleLog("Trying to stop rendering", this._renderedBuffer);
    this.isRecording = false;
    //this._offlineContext.suspend(0);
    consoleLog("Rendering stopped", this._renderedBuffer);
    
    /*const blob = new Blob(this._renderedBuffer.arrayBuffer);//, { type: "audio/wav" });
    consoleLog("Created blob", blob);
    const newSample = this.importSample(this.currentRecordingId, blob);*/
    //this.startPlayback(newSample.id);
   /* this._song = new AudioBufferSourceNode(this.context, { buffer: this._renderedBuffer });
    this._song.connect(this.context.destination);
    this._song.start();
    consoleLog("Playing rendered song.");*/
  }
  
  async startRecording(leaseComponentId = null) {
    if (this.currentRecordingId) {
      //consoleWarn(`Already recording with id "${this.currentRecordingId}". Stop the current recording before starting a new one.`);
      return null;
    }

    this.currentRecordingId = crypto.randomUUID();
    let sampleName = `Sample ${this.samples.length + 1}`;
    const mimeType = this._pickMimeType();
    this.recorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);

    const chunks = [];

    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    this.recorder.onstop = async () => {
      consoleLog("Recording stopped, processing data...");
      const blob = new Blob(chunks, {
        type: this.recorder.mimeType || this._pickMimeType() || chunks[0]?.type || 'audio/webm'
      });
      const newSample = this.importSample(this.currentRecordingId, blob);

      this.isRecording = false;
      this.currentRecordingId = "";
      await this.saveSamplesToState();

      document.dispatchEvent(new CustomEvent("RecordingStopped", { detail: newSample.id }));

      if (leaseComponentId)
        this.leaseSample(leaseComponentId, newSample.id);
      this.recorder = null;
      this.startPlayback(newSample.id);
    };

    this.recorder.start();
    this.isRecording = true;
    document.dispatchEvent(new CustomEvent("RecordingStarted"));
    return this.currentRecordingId;
  }

  stopRecording() {
    consoleLog("Trying to stop recording");
    if (this.recorder && this.recorder.state === 'recording') {
      this.recorder.stop();
      consoleLog("Recording stopped");
    } else {
      consoleLog("No active recording to stop");
    }
  }

  
  startPlayback(sampleId, destination, loop = false) {
    const sample = this._getSampleById(sampleId);
    if (!sample) {
      consoleError(`Sample with id "${sampleId}" not found.`);
      return;
    }

    if (sample.isPlaying) {
      //console.debug(`Sample "${sample.name}" is already playing.`);
      return;
    }

    let source = this.context.createBufferSource();

    sample.playbackSourceId = crypto.randomUUID();
    sample.playbackSource = source;

    source.connect(destination || this.context.destination);

    source.onended = (() => {
      source.disconnect();
      sample.playbackSource = null;
      sample.playbackSourceId = null;
    });

    sample.blob.arrayBuffer().then((arrayBuffer) => {
      let decodedBuffer = this.context.decodeAudioData(arrayBuffer).then((decodedBuffer) => {
        source.buffer = decodedBuffer;
        source.loop = loop;
        source.start();
      }).catch((err) => {
        consoleError("Error decoding audio data:", err);
      })
    });

    return;
  }

  stopPlayback(sampleId) {
    const playingSample = this._getSampleById(sampleId);

    if (!playingSample)
      return;
    try {
      if (playingSample.playbackSource) {
        playingSample.playbackSource.stop();
      }
    }
    catch (err) {
      consoleError(`Error stopping playback source "${playingSample.playbackSourceId}":`, err);
    }
  }

  importSample(sampleId, blob) {
    let sampleName = this._findFirstUniqueSampleName(`Sample`) || `Sample ${this.samples.length + 1}`;
    const newSample = new Sample(sampleId, sampleName, new Date(), blob);
    this.samples.push(newSample);
    consoleLog(`Imported sample: ${newSample.id}-${newSample.name} (${(newSample.blob.size / 1024).toFixed(2)} KB)`);
    return newSample;
  }

  base64ToArrayBuffer(base64) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  loadSamplesFromState() {
    if (localStorage.getItem('sampler-samples') == null)
      return;

    let samplesToLoad = JSON.parse(localStorage.getItem('sampler-samples'));

    this.samples = samplesToLoad.map(sampleData =>
      new Sample(
        sampleData.id,
        sampleData.name,
        sampleData.creationTime,
        new Blob([this.base64ToArrayBuffer(sampleData.arrayBuffer)], { type: sampleData.blobType })
      )
    );

    consoleLog(`Loaded ${this.samples.length} samples from state.`);
  }

  bufferToBase64(buffer) {
    const binary = Array.from(new Uint8Array(buffer))
      .map(byte => String.fromCharCode(byte))
      .join('');
    return btoa(binary);
  }

  async saveSamplesToState() {
    const samplesToSave = await this.samples.map(async (sample) => ({
      id: sample.id,
      name: sample.name,
      creationTime: sample.creationTime,
      arrayBuffer: this.bufferToBase64(await sample.blob.arrayBuffer()),
      blobType: sample.blob.type
    }));

    let samplesJson = JSON.stringify(await Promise.all(samplesToSave));
    localStorage.setItem('sampler-samples', samplesJson);
    consoleLog(`Saved ${samplesToSave.length} samples to state.`);
  }

  _pickMimeType() {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ];
    return candidates.find(type => MediaRecorder.isTypeSupported(type)) || '';
  }

  leaseSample(componentId, sampleId) {
    if (!sampleId)
      throw new Error(`No sample Id supplied`);

    if (!this._getSampleById(sampleId))
      throw new Error(`Cannot lease sample with id "${sampleId}" because it does not exist.`);

    if (!this.sampleLeases[sampleId])
      this.sampleLeases[sampleId] = [componentId];
    else
      this.sampleLeases[sampleId].push(componentId);

    document.dispatchEvent(new CustomEvent("SampleLeased", { detail: { componentId: componentId, sampleId: sampleId } }));
  }

  _getSampleById(sampleId) {
    return this.samples.find(sample => sample.id === sampleId);
  }

  _getSampleByName(name) {
    return this.samples.find(sample => sample.name === name);
  }

  _findFirstUniqueSampleName(baseName) {
    let sampleSuffix = this.samples.length + 1;

    let sampleName = `${baseName} ${sampleSuffix}`;
    while (this._getSampleByName(sampleName)) {
      sampleSuffix++;
      sampleName = `${baseName} ${sampleSuffix}`;
    }
    return this._getSampleByName(sampleName);
  }
  
  static _audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
  
    let result;
    if (numChannels === 2) {
      result = this._interleave(buffer.getChannelData(0), buffer.getChannelData(1));
    } else {
      result = buffer.getChannelData(0);
    }
  
    return this._encodeWAV(result, numChannels, sampleRate, bitDepth);
  }

  // Minimal helpers
  static _interleave(left, right) {
    const length = left.length + right.length;
    const result = new Float32Array(length);
  
    let i = 0;
    let j = 0;
  
    while (i < length) {
      result[i++] = left[j];
      result[i++] = right[j];
      j++;
    }
    return result;
  }

  static _encodeWAV(samples, numChannels, sampleRate, bitDepth) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
  
    function writeString(view, offset, str) {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    }
  
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
  
    this._floatTo16BitPCM(view, 44, samples);
  
    return buffer;
  }
  
  static _floatTo16BitPCM(view, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  }

}

class Sample {
  constructor(id, name, creationTime, blob) {
    this.id = id
    this.name = name;
    this.creationTime = creationTime;

    this.blob = blob;
    this.url = URL.createObjectURL(blob);
    this.playbackSourceId = null;
  }

  get blobType() { return this.blob.type; }
  get isPlaying() { return this.playbackSourceId != null; }
}
