function toOneBased(time) {
  if (typeof time === "string")
    time = Tone.Time(time);
  let parts = time.toBarsBeatsSixteenths().split(":");
  let bars = parseInt(parts[0]);
  let beats = parseInt(parts[1]);
  let sixteenths = parseFloat(parts[2]);
  return `${bars + 1}:${beats + 1}:${sixteenths + 1}`;
}

function getSixteenths(time) {
  if (typeof time === "string")
    time = Tone.Time(time);
  console.log("getSixteenths", time)
  let parts = time.toBarsBeatsSixteenths().split(":");
  let bars = parseInt(parts[0]);
  let beats = (bars * 4) + parseInt(parts[1]);
  let sixteenths = (beats * 4) + parseFloat(parts[2]);
  return sixteenths;
}

