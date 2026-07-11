class FmKick extends GainNode {
  constructor(context) {
    super(context);

    this.pitchEnvelope = {};
    this.ampEnvelope = {};

    /* this.pitchEnvelope[0.00000] = 6600;
     this.pitchEnvelope[0.0125] = 1046;
     this.pitchEnvelope[0.0250] = 261;
     this.pitchEnvelope[0.1] = 90;
     this.pitchEnvelope[0.50] = 65;*/
    // this.pitchEnvelope[1.2] = 40;

    this.pitchEnvelope[0.0000] = 6600;
    this.pitchEnvelope[0.0025] = 1046;
    this.pitchEnvelope[0.0050] = 261;
    this.pitchEnvelope[0.0200] = 90;
    this.pitchEnvelope[0.1000] = 65;

    this.ampEnvelope[0.00000] = 1;
    this.ampEnvelope[0.0025] = 0.5;
    this.ampEnvelope[0.0050] = 0.75;
    this.ampEnvelope[0.30000] = 0.01;

    this.type = "sine";
    this._velocityGain = new GainNode(context, { gain: 0.0 });
    this._amplitudeGain = new GainNode(context, { gain: 0.0 });

    this._velocityGain.connect(this._amplitudeGain);
    this._amplitudeGain.connect(this);
  }

  get velocity() { return this._velocityGain.gain; }
  get amplitude() { return this._amplitudeGain.gain; }

  play(startTime, velocity, stepDuration) {
    let oscillator = new OscillatorNode(this.context);
    oscillator.connect(this._velocityGain);
    oscillator.type = "sine";

    this.velocity.cancelScheduledValues(startTime);
    this.velocity.setValueAtTime(velocity / 127, startTime);
    this.amplitude.setValueAtTime(Object.values(this.ampEnvelope)[0], startTime);
    oscillator.frequency.cancelScheduledValues(startTime);
    oscillator.frequency.setValueAtTime(Object.values(this.pitchEnvelope)[0], startTime);

    this.applyEnvelope(this.amplitude, this.ampEnvelope, startTime, stepDuration, false);
    this.applyEnvelope(oscillator.frequency, this.pitchEnvelope, startTime, stepDuration, false);

    oscillator.start(startTime);
    oscillator.stop(startTime + 2 * stepDuration);
  }

  applyEnvelope(envelopeParam, envelope, startTime, stepDuration, log = false) {
    Object.keys(envelope).forEach((envPointOffset) => {
      let value = envelope[envPointOffset];
      //let envelopeTime = startTime + (stepDuration * envPointOffset);
      let envelopeTime = startTime + parseFloat(envPointOffset);
  
      // if (log) {
      //   logDebug("env", envelopeTime, value)
      //   logDebug(`${envelopeTime - startTime}: ${value}`);
      // }
      // if (value > 0)
      //    envelopeParam.exponentialRampToValueAtTime(value, envelopeTime);
      //  else
  
  
       envelopeParam.linearRampToValueAtTime(value, envelopeTime);


    });
  }
}
/*Creating pitch envelope for note 'C2', duration: 0.10344827586206896:
- 0: G#8 (6644.88)
- 0.002586206896551724: C6 (1046.5)
- 0.005172413793103448: C4 (261.63)
- 0.02586206896551724: F#2 (92.5)
- 0.10344827586206896: C2 (65.41)
*/
/*
: 6600
0.0025000000000000022: 1046
0.0050000000000000044: 261
0.020000000000000018: 90
0.10000000000000003: 65

*/