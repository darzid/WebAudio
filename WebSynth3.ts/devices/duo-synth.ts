import { Logger } from "../lib-ts/logger";
import { toggleNextSiblingVisibility } from "../main";
import { AudioDevice } from "./base-devices/audio-device";
// import * as Tone from "tone";

// Source - https://stackoverflow.com/a/54432326
// Posted by Oscar, modified by community. See post 'Timeline' for change history
// Retrieved 2026-07-22, License - CC BY-SA 4.0

export class DuoSynthDevice extends AudioDevice {
  private _bypassFilters = false;
  _filter1Module: any;
  _filter2Module: any;
  _context: any;
  release: any;
  duoSynth: Tone.DuoSynth | null = null;
  constructor(element: HTMLElement, elementClass: string) {
    super(element, elementClass, "DuoSynth");
    Logger.log("Create DuoSynth for element", element);
    //this.registerPropertyInputElement("Enabled", ".SynthTitle input[name='Enabled']");

    this.registerPropertyInputElement("harmonicity", "input[name='harmonicity']");
    this.registerPropertyInputElement("detune", "input[name='detune']");
    this.registerPropertyInputElement("portamento", "input[name='portamento']");
  
    this.registerPropertyInputElement("vibratoAmount", "input[name='vibratoAmount']");
    this.registerPropertyInputElement("vibratoRate", "input[name='vibratoRate']");
    
    // this.registerPropertyInputElement("voice0_type", "input[name='voice0_type']");
    this.registerPropertyInputElement("voice0_detune", "input[name='voice0_detune']");
    this.registerPropertyInputElement("voice0_portamento", "input[name='voice0_portamento']");
    
    this.registerPropertyInputElement("voice0_filter_frequency", "input[name='voice0_filter_frequency']");
    this.registerPropertyInputElement("voice0_filter_Q", "input[name='voice0_filter_Q']");
    this.registerPropertyInputElement("voice0_filter_gain", "input[name='voice0_filter_gain']");
    this.registerPropertyInputElement("voice0_filterEnvelope_attack", "input[name='voice0_filterEnvelope_attack']");
    this.registerPropertyInputElement("voice0_filterEnvelope_decay", "input[name='voice0_filterEnvelope_decay']");
    this.registerPropertyInputElement("voice0_filterEnvelope_sustain", "input[name='voice0_filterEnvelope_sustain']");
    this.registerPropertyInputElement("voice0_filterEnvelope_release", "input[name='voice0_filterEnvelope_release']");
    
    // this.registerPropertyInputElement("voice1_type", "input[name='voice1_type']");
    this.registerPropertyInputElement("voice1_detune", "input[name='voice1_detune']");
    this.registerPropertyInputElement("voice1_portamento", "input[name='voice1_portamento']");
    
    this.registerPropertyInputElement("voice1_filter_frequency", "input[name='voice1_filter_frequency']");
    this.registerPropertyInputElement("voice1_filter_Q", "input[name='voice1_filter_Q']");
    this.registerPropertyInputElement("voice1_filter_gain", "input[name='voice1_filter_gain']");
    this.registerPropertyInputElement("voice1_filterEnvelope_attack", "input[name='voice1_filterEnvelope_attack']");
    this.registerPropertyInputElement("voice1_filterEnvelope_decay", "input[name='voice1_filterEnvelope_decay']");
    this.registerPropertyInputElement("voice1_filterEnvelope_sustain", "input[name='voice1_filterEnvelope_sustain']");
    this.registerPropertyInputElement("voice1_filterEnvelope_release", "input[name='voice1_filterEnvelope_release']");
    
    toggleNextSiblingVisibility(element.querySelector(".DeviceTitle")!);

    document.addEventListener("PlayNote", (e: Event) => {
      let customEvent = (e as CustomEvent);
      Logger.log("DuoSynth play note " + customEvent.detail.note, customEvent.detail)
      let eventInfo = e;
      //as CustomEvent;
      
      // if (eventInfo.detail.track == this.track.id) 
        this.playNote(customEvent);
    });
  }

  get audioApp() { return this.getParentElementHandler("AudioApp"); }
  get track() { return this.getParentElementHandler("Track"); }

  // get osc1Type(): NonCustomOscillatorType { return this.getPropertyInputElement("Osc1Type").dataset.optionValue as NonCustomOscillatorType; }
  // get osc2Type(): NonCustomOscillatorType { return this.getPropertyInputElement("Osc2Type").dataset.optionValue as NonCustomOscillatorType; }

  setupAudioGraph() {
    super.setupAudioGraph();
    this.duoSynth = new Tone.DuoSynth();
    this.duoSynth!.connect(this.wetOutput!);

    let propertyKeys = Object.keys(this.childElements);
    propertyKeys.forEach(key => {
      let parts = key.split("_");

      let currentObject: any = this.duoSynth;

      let previousPart = "duoSynth";
      let previousObject = null;

      for (let partIndex = 0; partIndex < parts.length - 1; partIndex++) {
        let propertyName = parts[partIndex];
        let currentObjectPropertyNames = Object.keys(currentObject!);
        let navigationPropertyExists = currentObjectPropertyNames.findIndex((item) => item == propertyName) > -1;
        if (!navigationPropertyExists) {
          throw "Cannot navigate to property " + propertyName;
        }
        currentObject = currentObject[propertyName!];
      }

      let audioParamPropertyName : string = parts[parts.length - 1]!;
      let audioParam: any = currentObject![audioParamPropertyName];

      // parts.forEach(part => {

      //   if (currentObject != null) {

      //   let newCurrent = currentObject[part];
      //     if (newCurrent) {
      //       previousObject = currentObject;
      //       currentObject = currentObject[part];
      //       previousPart = part;
      //     }
      //   }
      //   else { 
      //     Logger.warn(`Could not find param ${previousPart}.${part}`);
      //   }
      // });
        
      if (audioParam) {
        Logger.log(`Auto connecting ${key}`, audioParam);
        this.connectPropertyToParam(previousObject, audioParam, key);
        Logger.log(`Auto connected ${key}`)
      }
      else { 
    /*    this.connectPropertyToParam(previousObject, parts[parts.length - 1]);
        Logger.log(`Auto connected 2 ${key}`)*/
        //Logger.warn(`Failed to connect ${key}`, previousObject);
      }
    });
  }
  
     /*   if (currentObject != null) {
          previousObject = currentObject;
          currentObject = currentObject[part];
          previousPart = part;
        }
        else {
         Logger.warn(`Could not find param ${previousPart}.${part}`)
        }
        if (currentObject) {
          this.connectFloatPropertyToParam(currentObject, parts[parts.length - 1]);
          Logger.log(`Auto connected ${key}`)
        }
        else {
          Logger.warn(`Failed to connect ${key}`, previousObject);
        }*/
  /*    });
    });&& 
  }*/
  
  playNote(eventInfo: CustomEvent) {
    // if (!this.getPropertyValue("Enabled"))
    //   return;

    Logger.log("PlayNote", eventInfo.detail);

    let startTime = eventInfo.detail.time;
    let duration = (eventInfo.detail.stepDuration / 500) * (eventInfo.detail.gate / 127);

    this.duoSynth!.volume.value = this.velocityToDecibels(eventInfo.detail.velocity);
    this.duoSynth!.triggerAttack(eventInfo.detail.note, startTime);
    this.duoSynth!.triggerRelease(startTime + duration);
  }
  
  velocityToDecibels(velocity: number) : number {
    return 40 * Math.log10(velocity / 127); 
  }
}
