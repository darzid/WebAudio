import { Logger } from "./lib-ts/logger";
import { PianoRoll } from "./ui-components/piano-roll";
import { PlayNoteRequestEvent } from "./ui-components/websynth-events";

const pianoRoll = new PianoRoll();
pianoRoll.init();

Logger.log('TypeScript works!');

// KeyDownEvent.subscribe((eventInfo: any) => onKeyDown(eventInfo));

// function onKeyDown(eventInfo: KeyDownEvent) {

//   Logger.log("Key down", eventInfo);
// }


function initialize() {
}

