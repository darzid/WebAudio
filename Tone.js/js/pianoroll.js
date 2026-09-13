function createPianoroll(notes, loopLength, bpm, notesChangedCallback) {
  "use strict";
  
  // ===== Constants =====
  const PITCH_COUNT = 128;
  const TOP_PITCH = PITCH_COUNT - 1;
  const BEATS_PER_BAR = 4;                 // fixed 4/4
  const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const BLACK_KEYS = new Set([1, 3, 6, 8, 10]);
  const DEFAULT_VELOCITY = 100;            // MIDI velocity 1..127
  const MIN_FREE_DURATION = 1 / 16;        // beats, used when the grid is off
  const EPS = 1e-6;
  const DRAG_THRESHOLD = 4;                // px before a press becomes a drag
  const TAP_SLOP = 8;                      // px of finger travel still counted as a tap

  const H_ZOOM = { min: 8, max: 400 };     // px per beat
  const V_ZOOM = { min: 6, max: 40 };      // px per pitch row
  const ZOOM_BUTTON_FACTOR = 1.25;

  const FIXED_GRIDS = { "1bar": 4, "1/2": 2, "1/4": 1, "1/8": 0.5, "1/16": 0.25, "1/32": 0.125 };
  const ADAPTIVE_MIN_PX = { widest: 96, wide: 48, medium: 24, narrow: 12, narrowest: 6 };
  const ADAPTIVE_STEPS = [4, 2, 1, 0.5, 0.25, 0.125, 0.0625];   // coarse → fine, in beats
  const STEP_LABELS = new Map([[4, "1 Bar"], [2, "1/2"], [1, "1/4"], [0.5, "1/8"], [0.25, "1/16"], [0.125, "1/32"], [0.0625, "1/64"]]);

  const COLORS = {
    void: "#141414",
    rowWhite: "#262626",
    rowBlack: "#1e1e1e",
    octaveLine: "#3a3a3a",
    lineSub: "#2e2e2e",
    lineBeat: "#3d3d3d",
    lineBar: "#5a5a5a",
    loopShade: "rgba(0, 0, 0, 0.4)",
    loopEdge: "#707070",
    note: "#f2b544",
    noteBorder: "#7a5312",
    noteSelected: "#fff1c9",
    playhead: "#ececec",
    ruler: "#262626",
    rulerLoop: "#333333",
    rulerTick: "#5c5c5c",
    rulerText: "#c0c0c0",
    keyWhite: "#d8d8d8",
    keyBlack: "#1a1a1a",
    keyBorder: "#a9a9a9",
    keyActive: "#f2b544",
    keyTextDark: "#333333",
    keyTextLight: "#b0b0b0",
  };

  // [pitch, start beat, duration beats] — a 1-bar starter pattern
  /*const DEMO_NOTES = [
    [60, 0, 0.5], [64, 0.5, 0.5], [67, 1, 0.5], [72, 1.5, 0.5],
    [67, 2, 0.5], [64, 2.5, 0.5], [60, 3, 1],
    [48, 0, 2], [43, 2, 2],
  ];*/

  let loopBars = parseInt(Tone.Time(loopLength).toBarsBeatsSixteenths().split(":")[0]) + 1;
  document.getElementById("barsInput").value = loopBars;
  // ===== State =====
  const state = {
    notes: [],                 // { id, pitch, start (beats), duration (beats), velocity (1..127) }
    nextId: 1,
    bpm: bpm,
    loopBars: loopBars,
    gridMode: "medium",        // key of ADAPTIVE_MIN_PX | key of FIXED_GRIDS | "off"
    triplet: false,
    snap: true,
    drawMode: true,
    follow: true,
    pxPerBeat: 80,
    rowHeight: 18,
    lastDuration: 0.25,
    selected: new Set(),
    playing: false,
    playheadBeat: 0,
    activeKey: null,
  };

  // ===== DOM =====
  const $ = (id) => document.getElementById(id);
  const dom = {
    play: $("playBtn"), pos: $("posReadout"),
    bpm: $("tempo"), bars: $("barsInput"),
    gridSelect: $("gridSelect"), triplet: $("tripletBtn"), snap: $("snapBtn"), gridReadout: $("gridReadout"),
    draw: $("drawBtn"), follow: $("followBtn"), clear: $("clearBtn"),
    zoomOutH: $("zoomOutH"), zoomInH: $("zoomInH"), zoomOutV: $("zoomOutV"), zoomInV: $("zoomInV"),
    rulerWrap: $("rulerWrap"), keysWrap: $("keysWrap"), gridWrap: $("gridWrap"),
    rulerCanvas: $("rulerCanvas"), keysCanvas: $("keysCanvas"), gridCanvas: $("gridCanvas"),
    scroller: $("scroller"), spacer: $("spacer"), hint: $("hint"),
  };

  // ===== Helpers =====
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const midiName = (pitch) => NOTE_NAMES[pitch % 12] + (Math.floor(pitch / 12) - 2);   // Ableton: C3 = MIDI 60
  const snapFloor = (beat, step) => (step ? Math.floor(beat / step + EPS) * step : beat);
  const snapRound = (beat, step) => (step ? Math.round(beat / step) * step : beat);
  const loopBeats = () => state.loopBars * BEATS_PER_BAR;
  const beatToX = (beat) => beat * state.pxPerBeat;
  const pitchToY = (pitch) => (TOP_PITCH - pitch) * state.rowHeight;

  function contentBeats() {
    const lastEnd = state.notes.reduce((max, n) => Math.max(max, n.start + n.duration), 0);
    const bars = Math.max(state.loopBars, Math.ceil(lastEnd / BEATS_PER_BAR - EPS));
    return bars * BEATS_PER_BAR;
  }

  function gridInfo() {
    if (state.gridMode === "off") return { step: null, label: "Off" };
    let base = FIXED_GRIDS[state.gridMode];
    if (base === undefined) {
      const minPx = ADAPTIVE_MIN_PX[state.gridMode];
      const scale = state.triplet ? 2 / 3 : 1;
      base = ADAPTIVE_STEPS[0];
      for (const step of ADAPTIVE_STEPS) {
        if (step * scale * state.pxPerBeat >= minPx) base = step;
        else break;
      }
    }
    const label = STEP_LABELS.get(base) + (state.triplet ? (base === 4 ? " T" : "T") : "");
    return { step: state.triplet ? (base * 2) / 3 : base, label };
  }

  // ===== Audio (Tone.js) =====
  function createAudio() {
    if (typeof Tone === "undefined") return null;
    const transport = Tone.getTransport();
    const PPQ = transport.PPQ;
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.005, decay: 0.12, sustain: 0.6, release: 0.3 },
    }).toDestination();
    synth.volume.value = -8;
    let part = null;
    const toTicks = (beats) => Tone.Ticks(Math.round(beats * PPQ));
    const hz = (pitch) => Tone.Frequency(pitch, "midi").toFrequency();

    return {
      available: true,
      unlock: () => Tone.start(),
      setBpm: (bpm) => { transport.bpm.value = bpm; },
      setLoop: (beats) => {
        transport.loop = true;
        transport.loopStart = 0;
        transport.loopEnd = toTicks(beats);
      },
      rebuild: (notes, beats) => {
        if (part) part.dispose();
        const events = notes.map((n) => ({
          time: toTicks(n.start), hz: hz(n.pitch), dur: toTicks(n.duration), vel: n.velocity / 127,
        }));
        part = new Tone.Part((time, ev) => synth.triggerAttackRelease(ev.hz, ev.dur, time, ev.vel), events);
        part.loop = true;
        part.loopStart = 0;
        part.loopEnd = toTicks(beats);
        part.start(0);
      },
      play: async () => { await Tone.start(); transport.start(); },
      stop: () => { transport.stop(); synth.releaseAll(); },
      seek: (beat) => { transport.ticks = Math.round(beat * PPQ); },
      positionBeat: () => transport.getTicksAtTime(Tone.immediate()) / PPQ,
      keyOn: (pitch) => synth.triggerAttack(hz(pitch), Tone.now(), 0.8),
      keyOff: (pitch) => synth.triggerRelease(hz(pitch), Tone.now()),
      preview: (pitch) => synth.triggerAttackRelease(hz(pitch), 0.15, Tone.now(), 0.8),
    };
  }

  const audio = createAudio() ?? {
    available: false,
    unlock: () => Promise.resolve(),
    setBpm() {}, setLoop() {}, rebuild() {}, async play() {}, stop() {}, seek() {},
    positionBeat: () => 0, keyOn() {}, keyOff() {}, preview() {},
  };

  // ===== Canvas layout & rendering =====
  const ctx = { grid: null, ruler: null, keys: null };
  let renderQueued = false;

  function sizeCanvas(canvas, width, height) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const c = canvas.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return c;
  }

  function layout() {
    ctx.grid = sizeCanvas(dom.gridCanvas, dom.gridWrap.clientWidth, dom.gridWrap.clientHeight);
    ctx.ruler = sizeCanvas(dom.rulerCanvas, dom.rulerWrap.clientWidth, dom.rulerWrap.clientHeight);
    ctx.keys = sizeCanvas(dom.keysCanvas, dom.keysWrap.clientWidth, dom.keysWrap.clientHeight);
    requestRender();
  }

  function updateSpacer() {
    dom.spacer.style.width = `${Math.ceil(beatToX(contentBeats()))}px`;
    dom.spacer.style.height = `${PITCH_COUNT * state.rowHeight}px`;
  }

  function requestRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => { renderQueued = false; render(); });
  }

  function render() {
    if (!ctx.grid) return;
    renderGrid();
    renderRuler();
    renderKeys();
  }

  function visibleRows(height) {
    const sy = dom.scroller.scrollTop;
    const first = Math.max(0, Math.floor(sy / state.rowHeight));
    const last = Math.min(TOP_PITCH, Math.floor((sy + height) / state.rowHeight));
    return { first, last, sy };
  }

  function renderGrid() {
    const c = ctx.grid;
    const W = dom.gridCanvas.clientWidth, H = dom.gridCanvas.clientHeight;
    const sx = dom.scroller.scrollLeft;
    const ppb = state.pxPerBeat, rh = state.rowHeight;
    const drawW = Math.min(W, beatToX(contentBeats()) - sx);
    c.fillStyle = COLORS.void;
    c.fillRect(0, 0, W, H);

    // pitch rows
    const rows = visibleRows(H);
    for (let row = rows.first; row <= rows.last; row++) {
      const pitch = TOP_PITCH - row;
      const y = row * rh - rows.sy;
      c.fillStyle = BLACK_KEYS.has(pitch % 12) ? COLORS.rowBlack : COLORS.rowWhite;
      c.fillRect(0, y, drawW, rh);
      if (pitch % 12 === 0) {
        c.fillStyle = COLORS.octaveLine;
        c.fillRect(0, y + rh - 1, drawW, 1);
      }
    }

    // grid subdivisions, then beat / bar lines
    const beat0 = sx / ppb, beat1 = (sx + drawW) / ppb;
    const { step } = gridInfo();
    if (step && step * ppb >= 3) {
      c.fillStyle = COLORS.lineSub;
      for (let k = Math.ceil(beat0 / step - EPS); k * step <= beat1 + EPS; k++) {
        const beat = k * step;
        if (Math.abs(beat - Math.round(beat)) < EPS) continue;
        c.fillRect(Math.round(beatToX(beat) - sx), 0, 1, H);
      }
    }
    for (let beat = Math.ceil(beat0 - EPS); beat <= beat1 + EPS; beat++) {
      const isBar = beat % BEATS_PER_BAR === 0;
      if (!isBar && ppb < 3) continue;
      c.fillStyle = isBar ? COLORS.lineBar : COLORS.lineBeat;
      c.fillRect(Math.round(beatToX(beat) - sx), 0, 1, H);
    }

    // area past the loop end
    const loopX = beatToX(loopBeats()) - sx;
    if (loopX < drawW) {
      c.fillStyle = COLORS.loopShade;
      c.fillRect(Math.max(0, loopX), 0, drawW - Math.max(0, loopX), H);
    }
    if (loopX >= 0 && loopX <= drawW) {
      c.fillStyle = COLORS.loopEdge;
      c.fillRect(Math.round(loopX), 0, 1, H);
    }

    // notes
    for (const n of state.notes) {
      const x0 = beatToX(n.start) - sx;
      const x1 = beatToX(n.start + n.duration) - sx;
      const y = pitchToY(n.pitch) - rows.sy;
      if (x1 < 0 || x0 > W || y + rh < 0 || y > H) continue;
      const w = Math.max(2, x1 - x0 - 1);
      const h = Math.max(2, rh - 2);
      c.fillStyle = state.selected.has(n.id) ? COLORS.noteSelected : COLORS.note;
      c.fillRect(Math.round(x0), y + 1, w, h);
      c.strokeStyle = COLORS.noteBorder;
      c.lineWidth = 1;
      c.strokeRect(Math.round(x0) + 0.5, y + 1.5, w - 1, h - 1);
    }

    // playhead
    const px = Math.round(beatToX(state.playheadBeat) - sx);
    if (px >= 0 && px <= W) {
      c.fillStyle = COLORS.playhead;
      c.fillRect(px, 0, 1, H);
    }
  }

  function renderRuler() {
    const c = ctx.ruler;
    const W = dom.rulerCanvas.clientWidth, H = dom.rulerCanvas.clientHeight;
    const sx = dom.scroller.scrollLeft;
    const ppb = state.pxPerBeat;
    const drawW = Math.min(W, beatToX(contentBeats()) - sx);
    c.fillStyle = COLORS.ruler;
    c.fillRect(0, 0, W, H);
    c.fillStyle = COLORS.rulerLoop;
    c.fillRect(0, 0, Math.min(drawW, beatToX(loopBeats()) - sx), H);

    const beat0 = sx / ppb, beat1 = (sx + drawW) / ppb;
    const { step } = gridInfo();
    c.fillStyle = COLORS.rulerTick;
    if (step && step * ppb >= 6) {
      for (let k = Math.ceil(beat0 / step - EPS); k * step <= beat1 + EPS; k++) {
        const beat = k * step;
        if (Math.abs(beat - Math.round(beat)) < EPS) continue;
        c.fillRect(Math.round(beatToX(beat) - sx), H - 4, 1, 4);
      }
    }

    const barPx = ppb * BEATS_PER_BAR;
    const labelEvery = Math.max(1, Math.ceil(28 / barPx));   // bars between numbered bars
    const showBeats = ppb >= 40;
    c.font = "10px system-ui, sans-serif";
    c.textBaseline = "top";
    c.textAlign = "left";
    for (let beat = Math.ceil(beat0 - EPS); beat <= beat1 + EPS; beat++) {
      const x = Math.round(beatToX(beat) - sx);
      const bar = Math.floor(beat / BEATS_PER_BAR);
      const beatInBar = beat % BEATS_PER_BAR;
      if (beatInBar === 0) {
        const labelled = bar % labelEvery === 0;
        c.fillStyle = COLORS.rulerTick;
        c.fillRect(x, labelled ? 0 : H - 10, 1, labelled ? H : 10);
        if (labelled) {
          c.fillStyle = COLORS.rulerText;
          c.fillText(String(bar + 1), x + 3, 3);
        }
      } else if (showBeats) {
        c.fillStyle = COLORS.rulerTick;
        c.fillRect(x, H - 10, 1, 10);
        c.fillStyle = COLORS.rulerText;
        c.fillText(`${bar + 1}.${beatInBar + 1}`, x + 3, 3);
      } else if (ppb >= 6) {
        c.fillStyle = COLORS.rulerTick;
        c.fillRect(x, H - 6, 1, 6);
      }
    }

    const px = Math.round(beatToX(state.playheadBeat) - sx);
    if (px >= 0 && px <= W) {
      c.fillStyle = COLORS.playhead;
      c.fillRect(px, 0, 1, H);
      c.beginPath();
      c.moveTo(px - 5, 0);
      c.lineTo(px + 6, 0);
      c.lineTo(px + 0.5, 7);
      c.closePath();
      c.fill();
    }
  }

  function renderKeys() {
    const c = ctx.keys;
    const W = dom.keysCanvas.clientWidth, H = dom.keysCanvas.clientHeight;
    const rh = state.rowHeight;
    const rows = visibleRows(H);
    const blackW = Math.round(W * 0.62);
    const showAll = rh >= 16;
    c.fillStyle = COLORS.void;
    c.fillRect(0, 0, W, H);
    c.font = `${clamp(rh - 5, 8, 11)}px system-ui, sans-serif`;
    c.textBaseline = "middle";
    c.textAlign = "right";
    for (let row = rows.first; row <= rows.last; row++) {
      const pitch = TOP_PITCH - row;
      const y = row * rh - rows.sy;
      const black = BLACK_KEYS.has(pitch % 12);
      const active = state.activeKey === pitch;
      c.fillStyle = active ? COLORS.keyActive : COLORS.keyWhite;
      c.fillRect(0, y, W, rh);
      if (black) {
        c.fillStyle = active ? COLORS.keyActive : COLORS.keyBlack;
        c.fillRect(0, y, blackW, rh);
      }
      // two white keys touch below C (B) and below F (E)
      if (pitch % 12 === 0 || pitch % 12 === 5) {
        c.fillStyle = COLORS.keyBorder;
        c.fillRect(0, y + rh - 1, W, 1);
      }
      const isC = pitch % 12 === 0;
      if (rh >= 8 && (isC || showAll)) {
        c.fillStyle = black ? COLORS.keyTextLight : COLORS.keyTextDark;
        c.fillText(midiName(pitch), (black ? blackW : W) - 3, y + rh / 2 + 0.5);
      }
    }
  }

  // ===== Note editing =====
  function noteAt(beat, pitch) {
    for (let i = state.notes.length - 1; i >= 0; i--) {
      const n = state.notes[i];
      if (n.pitch === pitch && beat >= n.start && beat < n.start + n.duration) return n;
    }
    return null;
  }

  function onRightEdge(note, x) {
    const width = beatToX(note.duration);
    const zone = Math.min(8, width * 0.4);
    return x >= beatToX(note.start + note.duration) - zone;
  }

  function notesChanged() {
    updateSpacer();
    audio.rebuild(state.notes, loopBeats());
    requestRender();
    notesChangedCallback(state.notes);
  }

  function addNoteAt(beat, pitch) {
    const { step } = gridInfo();
    const start = Math.max(0, state.snap ? snapFloor(beat, step) : beat);
    if (noteAt(start + EPS, pitch)) return null;
    let duration = step ?? state.lastDuration;
    for (const other of state.notes) {
      if (other.pitch === pitch && other.start > start + EPS) duration = Math.min(duration, other.start - start);
    }
    if (duration < EPS) return null;
    const note = { id: state.nextId++, pitch, start, duration, velocity: DEFAULT_VELOCITY };
    state.notes.push(note);
    audio.preview(pitch);
    notesChanged();
    return note;
  }

  function pruneNotes(ids) {
    const set = new Set(ids);
    if (set.size === 0) return;
    state.notes = state.notes.filter((n) => !set.has(n.id));
    for (const id of set) state.selected.delete(id);
  }

  function deleteNotes(ids) {
    pruneNotes(ids);
    notesChanged();
  }

  // Trim or remove other notes on the same pitch that the given note now covers.
  function resolveOverlaps(note) {
    const end = note.start + note.duration;
    const doomed = [];
    for (const other of state.notes) {
      if (other === note || other.pitch !== note.pitch) continue;
      const otherEnd = other.start + other.duration;
      if (otherEnd <= note.start + EPS || other.start >= end - EPS) continue;
      if (other.start < note.start - EPS) {
        other.duration = note.start - other.start;
      } else if (otherEnd > end + EPS) {
        other.duration = otherEnd - end;
        other.start = end;
      } else {
        doomed.push(other.id);
      }
    }
    pruneNotes(doomed);
  }

  function selectOnly(note) {
    state.selected.clear();
    state.selected.add(note.id);
  }

  function clearSelection() {
    state.selected.clear();
    requestRender();
  }

  function selectAll() {
    state.selected = new Set(state.notes.map((n) => n.id));
    requestRender();
  }

  // ===== Zoom =====
  function setPxPerBeat(value, anchorX, beatAtAnchor) {
    state.pxPerBeat = clamp(value, H_ZOOM.min, H_ZOOM.max);
    updateSpacer();
    dom.scroller.scrollLeft = beatToX(beatAtAnchor) - anchorX;
    updateGridReadout();
    requestRender();
  }

  function setRowHeight(value, anchorY, rowAtAnchor) {
    state.rowHeight = clamp(value, V_ZOOM.min, V_ZOOM.max);
    updateSpacer();
    dom.scroller.scrollTop = rowAtAnchor * state.rowHeight - anchorY;
    requestRender();
  }

  function zoomH(factor, anchorX) {
    setPxPerBeat(state.pxPerBeat * factor, anchorX, (dom.scroller.scrollLeft + anchorX) / state.pxPerBeat);
  }

  function zoomV(factor, anchorY) {
    setRowHeight(state.rowHeight * factor, anchorY, (dom.scroller.scrollTop + anchorY) / state.rowHeight);
  }

  function wheelDeltas(e) {
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1;
    return { dx: e.deltaX * unit, dy: e.deltaY * unit };
  }

  // ===== Grid interaction =====
  const pointers = new Map();   // pointerId → { x, y } (client coords)
  let drag = null;              // { type: "tap" | "paint" | "move" | "resize", pointerId, ... }
  let pinch = null;

  function gridPoint(e) {
    const r = dom.scroller.getBoundingClientRect();
    const vx = e.clientX - r.left, vy = e.clientY - r.top;
    const x = vx + dom.scroller.scrollLeft, y = vy + dom.scroller.scrollTop;
    return {
      vx, vy, x, y,
      beat: x / state.pxPerBeat,
      pitch: clamp(TOP_PITCH - Math.floor(y / state.rowHeight), 0, TOP_PITCH),
    };
  }

  function beginMove(note, p, pointerId) {
    const group = !state.drawMode && state.selected.has(note.id)
      ? state.notes.filter((n) => state.selected.has(n.id))
      : [note];
    drag = {
      type: "move", pointerId, anchor: note, moved: false,
      items: group.map((n) => ({ note: n, start: n.start, pitch: n.pitch })),
      beat0: p.beat, pitch0: p.pitch, vx0: p.vx, vy0: p.vy, lastPreview: note.pitch,
    };
  }

  function updateMove(p) {
    const d = drag;
    if (!d.moved) {
      if (Math.hypot(p.vx - d.vx0, p.vy - d.vy0) < DRAG_THRESHOLD) return;
      d.moved = true;
    }
    const { step } = gridInfo();
    const anchor = d.items.find((it) => it.note === d.anchor);
    const target = anchor.start + (p.beat - d.beat0);
    const minStart = Math.min(...d.items.map((it) => it.start));
    const minPitch = Math.min(...d.items.map((it) => it.pitch));
    const maxPitch = Math.max(...d.items.map((it) => it.pitch));
    const dBeat = Math.max((state.snap ? snapRound(target, step) : target) - anchor.start, -minStart);
    const dPitch = clamp(p.pitch - d.pitch0, -minPitch, TOP_PITCH - maxPitch);
    for (const it of d.items) {
      it.note.start = it.start + dBeat;
      it.note.pitch = it.pitch + dPitch;
    }
    if (d.anchor.pitch !== d.lastPreview) {
      d.lastPreview = d.anchor.pitch;
      audio.preview(d.anchor.pitch);
    }
    updateSpacer();
    requestRender();
  }

  function updateResize(p) {
    const d = drag;
    const { step } = gridInfo();
    const rawEnd = d.note.start + d.duration0 + (p.x - d.x0) / state.pxPerBeat;
    const end = state.snap ? snapRound(rawEnd, step) : rawEnd;
    d.note.duration = Math.max(step ?? MIN_FREE_DURATION, end - d.note.start);
    state.lastDuration = d.note.duration;
    updateSpacer();
    requestRender();
  }

  function updatePaint(p) {
    const d = drag;
    const { step } = gridInfo();
    if (!step || !state.snap) return;
    const cell = snapFloor(p.beat, step);
    if (cell === d.lastCell) return;
    d.lastCell = cell;
    addNoteAt(cell, d.pitch);
  }

  function commitEdit(d) {
    const notes = d.type === "move" ? d.items.map((it) => it.note) : [d.note];
    for (const n of notes) {
      if (state.notes.includes(n)) resolveOverlaps(n);
    }
    notesChanged();
  }

  function pinchStart() {
    const [a, b] = [...pointers.values()];
    const r = dom.scroller.getBoundingClientRect();
    const midX = (a.x + b.x) / 2 - r.left, midY = (a.y + b.y) / 2 - r.top;
    pinch = {
      dist0: Math.hypot(a.x - b.x, a.y - b.y) || 1,
      ppb0: state.pxPerBeat,
      beat: (dom.scroller.scrollLeft + midX) / state.pxPerBeat,
      contentY: dom.scroller.scrollTop + midY,
    };
    drag = null;
  }

  function pinchMove() {
    const [a, b] = [...pointers.values()];
    const r = dom.scroller.getBoundingClientRect();
    const midX = (a.x + b.x) / 2 - r.left, midY = (a.y + b.y) / 2 - r.top;
    const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    setPxPerBeat((pinch.ppb0 * dist) / pinch.dist0, midX, pinch.beat);
    dom.scroller.scrollTop = pinch.contentY - midY;
  }

  function updateCursor(e) {
    const p = gridPoint(e);
    const hit = noteAt(p.beat, p.pitch);
    let cursor = state.drawMode ? "crosshair" : "default";
    if (hit) cursor = onRightEdge(hit, p.x) ? "ew-resize" : state.drawMode ? "pointer" : "move";
    dom.scroller.style.cursor = cursor;
  }

  dom.scroller.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    audio.unlock().catch(() => {});
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) { pinchStart(); return; }
    if (pointers.size > 2 || pinch) return;

    const p = gridPoint(e);
    const touch = e.pointerType === "touch";
    const hit = noteAt(p.beat, p.pitch);
    if (hit) {
      if (!state.drawMode) {
        if (e.shiftKey) {
          if (state.selected.has(hit.id)) state.selected.delete(hit.id);
          else state.selected.add(hit.id);
        } else if (!state.selected.has(hit.id)) {
          selectOnly(hit);
        }
      }
      if (onRightEdge(hit, p.x)) {
        drag = { type: "resize", pointerId: e.pointerId, note: hit, x0: p.x, duration0: hit.duration };
      } else {
        beginMove(hit, p, e.pointerId);
      }
      drag.shift = e.shiftKey;
    } else if (state.drawMode) {
      if (touch) {
        drag = { type: "tap", pointerId: e.pointerId, vx0: p.vx, vy0: p.vy, beat: p.beat, pitch: p.pitch };
      } else {
        const note = addNoteAt(p.beat, p.pitch);
        drag = { type: "paint", pointerId: e.pointerId, pitch: p.pitch, lastCell: note ? note.start : null };
      }
    } else if (!e.shiftKey) {
      clearSelection();
    }
    if (drag && !touch) dom.scroller.setPointerCapture(e.pointerId);
    requestRender();
  });

  dom.scroller.addEventListener("pointermove", (e) => {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch) {
      if (pointers.size >= 2) pinchMove();
      return;
    }
    if (!drag || drag.pointerId !== e.pointerId) {
      if (e.pointerType === "mouse") updateCursor(e);
      return;
    }
    const p = gridPoint(e);
    switch (drag.type) {
      case "tap":
        if (Math.hypot(p.vx - drag.vx0, p.vy - drag.vy0) > TAP_SLOP) drag = null;
        break;
      case "paint": updatePaint(p); break;
      case "move": updateMove(p); break;
      case "resize": updateResize(p); break;
    }
  });

  function endGridPointer(e, cancelled) {
    pointers.delete(e.pointerId);
    if (pinch) {
      if (pointers.size < 2) pinch = null;
      return;
    }
    if (!drag || drag.pointerId !== e.pointerId) return;
    const d = drag;
    drag = null;
    if (d.type === "tap") {
      if (!cancelled) addNoteAt(d.beat, d.pitch);
    } else if (d.type === "move") {
      if (d.moved) commitEdit(d);
      else if (!cancelled && state.drawMode) deleteNotes([d.anchor.id]);
      else if (!cancelled && !d.shift) selectOnly(d.anchor);
    } else if (d.type === "resize") {
      commitEdit(d);
    }
    requestRender();
  }

  dom.scroller.addEventListener("pointerup", (e) => endGridPointer(e, false));
  dom.scroller.addEventListener("pointercancel", (e) => endGridPointer(e, true));

  // Keep native touch scrolling for taps and pans; block it while editing a note or pinching.
  dom.scroller.addEventListener("touchmove", (e) => {
    if (e.touches.length >= 2 || (drag && (drag.type === "move" || drag.type === "resize"))) e.preventDefault();
  }, { passive: false });

  dom.scroller.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const p = gridPoint(e);
    const hit = noteAt(p.beat, p.pitch);
    if (hit) deleteNotes([hit.id]);
  });

  dom.scroller.addEventListener("dblclick", (e) => {
    if (state.drawMode) return;
    const p = gridPoint(e);
    if (!noteAt(p.beat, p.pitch)) addNoteAt(p.beat, p.pitch);
  });

  dom.scroller.addEventListener("wheel", (e) => {
    const { dx, dy } = wheelDeltas(e);
    const r = dom.scroller.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      zoomH(Math.exp(-dy * 0.002), e.clientX - r.left);
    } else if (e.altKey) {
      e.preventDefault();
      zoomV(Math.exp(-dy * 0.002), e.clientY - r.top);
    } else if (e.shiftKey && dx === 0) {
      e.preventDefault();
      dom.scroller.scrollLeft += dy;
    }
  }, { passive: false });

  dom.scroller.addEventListener("scroll", requestRender);

  // ===== Piano keys interaction: tap plays, drag ↕ scrolls, drag ↔ zooms =====
  let keyDrag = null;

  function keyPitchAt(e) {
    const r = dom.keysCanvas.getBoundingClientRect();
    const y = e.clientY - r.top + dom.scroller.scrollTop;
    return clamp(TOP_PITCH - Math.floor(y / state.rowHeight), 0, TOP_PITCH);
  }

  function keyOn(pitch) {
    state.activeKey = pitch;
    audio.keyOn(pitch);
    requestRender();
  }

  function keyOff() {
    if (state.activeKey === null) return;
    audio.keyOff(state.activeKey);
    state.activeKey = null;
    requestRender();
  }

  dom.keysCanvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    audio.unlock().catch(() => {});
    dom.keysCanvas.setPointerCapture(e.pointerId);
    const anchorY = e.clientY - dom.keysCanvas.getBoundingClientRect().top;
    keyDrag = {
      pointerId: e.pointerId, mode: "key", x0: e.clientX, y0: e.clientY, anchorY,
      scrollTop0: dom.scroller.scrollTop, rowHeight0: state.rowHeight,
      rowAtAnchor: (dom.scroller.scrollTop + anchorY) / state.rowHeight,
    };
    keyOn(keyPitchAt(e));
  });

  dom.keysCanvas.addEventListener("pointermove", (e) => {
    if (!keyDrag || keyDrag.pointerId !== e.pointerId) return;
    const dx = e.clientX - keyDrag.x0, dy = e.clientY - keyDrag.y0;
    if (keyDrag.mode === "key") {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      keyOff();
      keyDrag.mode = Math.abs(dx) > Math.abs(dy) ? "zoom" : "scroll";
    }
    if (keyDrag.mode === "scroll") dom.scroller.scrollTop = keyDrag.scrollTop0 - dy;
    else setRowHeight(keyDrag.rowHeight0 * Math.exp(dx * 0.01), keyDrag.anchorY, keyDrag.rowAtAnchor);
  });

  function endKeyPointer() {
    keyOff();
    keyDrag = null;
  }
  dom.keysCanvas.addEventListener("pointerup", endKeyPointer);
  dom.keysCanvas.addEventListener("pointercancel", endKeyPointer);

  dom.keysCanvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const { dy } = wheelDeltas(e);
    if (e.altKey || e.ctrlKey || e.metaKey) {
      zoomV(Math.exp(-dy * 0.002), e.clientY - dom.keysCanvas.getBoundingClientRect().top);
    } else {
      dom.scroller.scrollTop += dy;
    }
  }, { passive: false });

  // ===== Ruler interaction: tap locates, drag ↕ zooms, drag ↔ scrolls =====
  let rulerDrag = null;

  dom.rulerCanvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    audio.unlock().catch(() => {});
    dom.rulerCanvas.setPointerCapture(e.pointerId);
    const vx = e.clientX - dom.rulerCanvas.getBoundingClientRect().left;
    rulerDrag = {
      pointerId: e.pointerId, moved: false, x0: e.clientX, y0: e.clientY, vx0: vx,
      ppb0: state.pxPerBeat, beat0: (dom.scroller.scrollLeft + vx) / state.pxPerBeat,
    };
  });

  dom.rulerCanvas.addEventListener("pointermove", (e) => {
    if (!rulerDrag || rulerDrag.pointerId !== e.pointerId) return;
    const dx = e.clientX - rulerDrag.x0, dy = e.clientY - rulerDrag.y0;
    if (!rulerDrag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    rulerDrag.moved = true;
    setPxPerBeat(rulerDrag.ppb0 * Math.exp(dy * 0.01), rulerDrag.vx0 + dx, rulerDrag.beat0);
  });

  function endRulerPointer(e) {
    if (!rulerDrag || rulerDrag.pointerId !== e.pointerId) return;
    const d = rulerDrag;
    rulerDrag = null;
    if (d.moved || e.type === "pointercancel") return;
    const { step } = gridInfo();
    setPlayhead(clamp(state.snap ? snapRound(d.beat0, step) : d.beat0, 0, loopBeats()));
  }
  dom.rulerCanvas.addEventListener("pointerup", endRulerPointer);
  dom.rulerCanvas.addEventListener("pointercancel", endRulerPointer);

  dom.rulerCanvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const { dx, dy } = wheelDeltas(e);
    if (e.ctrlKey || e.metaKey) zoomH(Math.exp(-dy * 0.002), e.clientX - dom.rulerCanvas.getBoundingClientRect().left);
    else dom.scroller.scrollLeft += dx || dy;
  }, { passive: false });

  // ===== Transport =====
  function updatePosReadout() {
    const b = state.playheadBeat;
    const bar = Math.floor(b / BEATS_PER_BAR) + 1;
    const beat = Math.floor(b % BEATS_PER_BAR) + 1;
    const sixteenth = Math.floor((b % 1) * 4) + 1;
    dom.pos.textContent = `${bar}.${beat}.${sixteenth}`;
  }

  function setPlayhead(beat) {
    state.playheadBeat = beat;
    audio.seek(beat);
    updatePosReadout();
    requestRender();
  }

  function followPlayhead() {
    const s = dom.scroller;
    const x = beatToX(state.playheadBeat);
    if (x < s.scrollLeft || x > s.scrollLeft + s.clientWidth) s.scrollLeft = x - 8;
  }

  function tickPlayhead() {
    if (!state.playing) return;
    state.playheadBeat = audio.positionBeat();
    updatePosReadout();
    if (state.follow) followPlayhead();
    requestRender();
    requestAnimationFrame(tickPlayhead);
  }

  async function togglePlay() {
    if (state.playing) {
      audio.stop();
      state.playing = false;
      setPlayhead(0);
    } else {
      try {
        await audio.play();
        state.playing = true;
        requestAnimationFrame(tickPlayhead);
      } catch (err) {
        console.error("Playback could not start:", err);
      }
    }
    dom.play.textContent = state.playing ? "■" : "▶";
    dom.play.classList.toggle("on", state.playing);
  }

  // ===== Controls =====
  function updateGridReadout() {
    dom.gridReadout.textContent = gridInfo().label;
  }

  function setBpm(bpm) {
    state.bpm = bpm;
    dom.bpm.value = bpm;
    audio.setBpm(bpm);
  }

  function setLoopBars(bars) {
    state.loopBars = bars;
    dom.bars.value = bars;
    audio.setLoop(loopBeats());
    notesChanged();
  }

  function setDrawMode(on) {
    state.drawMode = on;
    dom.draw.classList.toggle("on", on);
    if (on) state.selected.clear();
    requestRender();
  }

  function bindToggle(button, key, onChange) {
    button.addEventListener("click", () => {
      state[key] = !state[key];
      button.classList.toggle("on", state[key]);
      if (onChange) onChange();
    });
  }

  dom.play.addEventListener("click", togglePlay);
  dom.bpm.addEventListener("input", () => {
    const v = Number(dom.bpm.value);
    if (v >= 20 && v <= 300) { state.bpm = v; audio.setBpm(v); }
  });
  dom.bpm.addEventListener("change", () => setBpm(clamp(Number(dom.bpm.value) || state.bpm, 20, 300)));
  dom.bars.addEventListener("change", () => setLoopBars(clamp(Math.round(Number(dom.bars.value)) || state.loopBars, 1, 64)));
  dom.gridSelect.addEventListener("change", () => {
    state.gridMode = dom.gridSelect.value;
    updateGridReadout();
    requestRender();
  });
  bindToggle(dom.triplet, "triplet", () => { updateGridReadout(); requestRender(); });
  bindToggle(dom.snap, "snap");
  bindToggle(dom.follow, "follow");
  dom.draw.addEventListener("click", () => setDrawMode(!state.drawMode));
  dom.clear.addEventListener("click", () => {
    state.notes = [];
    state.selected.clear();
    notesChanged();
  });
  dom.zoomInH.addEventListener("click", () => zoomH(ZOOM_BUTTON_FACTOR, dom.scroller.clientWidth / 2));
  dom.zoomOutH.addEventListener("click", () => zoomH(1 / ZOOM_BUTTON_FACTOR, dom.scroller.clientWidth / 2));
  dom.zoomInV.addEventListener("click", () => zoomV(ZOOM_BUTTON_FACTOR, dom.scroller.clientHeight / 2));
  dom.zoomOutV.addEventListener("click", () => zoomV(1 / ZOOM_BUTTON_FACTOR, dom.scroller.clientHeight / 2));
  for (const b of document.querySelectorAll(".btn")) b.addEventListener("click", () => b.blur());

  window.addEventListener("keydown", (e) => {
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    if (e.code === "Space") { e.preventDefault(); togglePlay(); }
    else if (e.key === "b" || e.key === "B") setDrawMode(!state.drawMode);
    else if (e.key === "Delete" || e.key === "Backspace") { if (state.selected.size) deleteNotes([...state.selected]); }
    else if (e.key === "Escape") clearSelection();
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") { e.preventDefault(); selectAll(); }
  });

  // ===== Init =====
  function init() {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    dom.hint.textContent = coarse
      ? "Tap: add note · Tap note: delete · Drag note: move · Drag note edge: resize · Pinch: zoom · Ruler: tap to locate, drag ↕ zoom ↔ scroll · Keys: drag ↕ scroll ↔ zoom"
      : "Click: add note · Click note: delete (Draw) · Drag: move · Drag right edge: resize · Ctrl+wheel: zoom · Alt+wheel: row zoom · Shift+wheel: scroll · Ruler drag: ↕ zoom ↔ scroll · Space: play/stop · B: Draw/Select · Del: delete selection · Right-click: delete";
    if (!audio.available) {
      dom.play.disabled = true;
      dom.hint.textContent = "Tone.js could not be loaded (network). Editing works; playback is disabled.";
    }

    state.rowHeight = coarse ? 22 : 18;
    layout();
    const w = dom.scroller.clientWidth || 800;
    state.pxPerBeat = clamp(w / (w < 600 ? BEATS_PER_BAR : 2 * BEATS_PER_BAR), 30, 160);

    setNotes(notes);
    //audio.setBpm(state.bpm);
    //audio.setLoop(loopBeats());
    updateSpacer();
    dom.scroller.scrollTop = pitchToY(60) - dom.scroller.clientHeight / 2;
    updateGridReadout();
    updatePosReadout();
    notesChanged();

    const observer = new ResizeObserver(layout);
    observer.observe(dom.gridWrap);
    observer.observe(dom.rulerWrap);
    observer.observe(dom.keysWrap);
  }

  function setNotes(notes) {
    for (const [pitch, start, duration] of notes) {
      state.notes.push({ id: state.nextId++, pitch, start, duration, velocity: DEFAULT_VELOCITY });
    }
  }
  init();
}

