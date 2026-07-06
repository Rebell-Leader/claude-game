// ===== Awawa Quest — WebAudio synth (cries & SFX) =====
'use strict';

const AUDIO_PREF_KEY = 'awawa-quest-audio';

function loadAudioPrefs() {
  try { return JSON.parse(localStorage.getItem(AUDIO_PREF_KEY)) || {}; } catch (e) { return {}; }
}

function saveAudioPrefs(p) {
  try { localStorage.setItem(AUDIO_PREF_KEY, JSON.stringify(p)); } catch (e) { /* ignore */ }
}

let _sharedCtx = null;
function sharedAudioContext() {
  if (!_sharedCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    _sharedCtx = new AC();
  }
  if (_sharedCtx.state === 'suspended') _sharedCtx.resume();
  return _sharedCtx;
}

const Sound = (() => {
  let muted = !!loadAudioPrefs().sfxMuted;

  function ac() {
    return sharedAudioContext();
  }

  function blip(freq, dur, { type = 'square', vol = 0.08, slide = 0, when = 0 } = {}) {
    const c = ac();
    if (!c || muted) return;
    const t = c.currentTime + when;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  // The iconic hyrax scream: a rising series of "awa" pulses.
  // Pitch scales down with size (bigger awawa = deeper scream).
  function cry(speciesName) {
    const sp = SPECIES[speciesName];
    if (!sp) return;
    const size = (sp.sprite.big || 1);
    const base = 620 / size;
    const n = sp.legendary ? 6 : 4;
    for (let i = 0; i < n; i++) {
      blip(base + i * 55, 0.13, { type: 'sawtooth', vol: 0.05, slide: 160, when: i * 0.11 });
      blip((base + i * 55) / 2, 0.13, { type: 'triangle', vol: 0.05, when: i * 0.11 });
    }
  }

  const fx = {
    hit:     () => { blip(220, 0.1, { type: 'square', slide: -120 }); },
    superhit:() => { blip(180, 0.16, { type: 'sawtooth', slide: -140, vol: 0.1 }); blip(90, 0.2, { type: 'square', when: 0.04 }); },
    heal:    () => { [440, 550, 660].forEach((f, i) => blip(f, 0.12, { type: 'sine', vol: 0.07, when: i * 0.09 })); },
    throw:   () => { blip(500, 0.18, { type: 'sine', slide: 300 }); },
    shake:   () => { blip(160, 0.08, { type: 'triangle', vol: 0.09 }); },
    catch:   () => { [392, 494, 587, 784].forEach((f, i) => blip(f, 0.14, { type: 'square', vol: 0.06, when: i * 0.1 })); },
    flee:    () => { blip(400, 0.2, { type: 'sine', slide: -250 }); },
    levelup: () => { [523, 659, 784, 1046].forEach((f, i) => blip(f, 0.12, { type: 'square', vol: 0.06, when: i * 0.08 })); },
    evolve:  () => { for (let i = 0; i < 8; i++) blip(300 + i * 90, 0.1, { type: 'sawtooth', vol: 0.05, when: i * 0.07 }); },
    faint:   () => { blip(300, 0.35, { type: 'sawtooth', slide: -240, vol: 0.07 }); },
    coin:    () => { blip(880, 0.07, { type: 'square', vol: 0.05 }); blip(1175, 0.1, { type: 'square', vol: 0.05, when: 0.07 }); },
    click:   () => { blip(700, 0.04, { type: 'sine', vol: 0.04 }); },
  };

  return {
    cry,
    fx: name => fx[name] && fx[name](),
    toggleMute() {
      muted = !muted;
      const p = loadAudioPrefs();
      p.sfxMuted = muted;
      saveAudioPrefs(p);
      return muted;
    },
    get muted() { return muted; },
  };
})();

// ===== Generative chiptune background music =====
// A tiny step sequencer: bass on the beat, a random-walk pentatonic melody,
// and a soft chime every other bar. Each zone gets its own key/tempo/mood.
const Music = (() => {
  const THEMES = {
    title:  { root: 220.0, scale: [0, 2, 4, 7, 9],  bpm: 92,  wave: 'sine',     chime: true },
    cliffs: { root: 261.6, scale: [0, 2, 4, 7, 9],  bpm: 96,  wave: 'square',   chime: true },
    meadow: { root: 196.0, scale: [0, 2, 4, 7, 9],  bpm: 84,  wave: 'triangle', chime: true },
    canyon: { root: 146.8, scale: [0, 3, 5, 7, 10], bpm: 104, wave: 'square',   chime: false },
    oasis:  { root: 174.6, scale: [0, 2, 3, 7, 9],  bpm: 72,  wave: 'sine',     chime: true },
    summit: { root: 110.0, scale: [0, 3, 5, 7, 10], bpm: 112, wave: 'triangle', chime: false },
    battle: { root: 164.8, scale: [0, 3, 5, 7, 10], bpm: 138, wave: 'square',   chime: false },
    boss:   { root: 123.5, scale: [0, 1, 5, 7, 10], bpm: 148, wave: 'sawtooth', chime: false },
  };

  let enabled = loadAudioPrefs().musicMuted !== true; // on by default
  let timer = null;
  let theme = null;
  let themeName = null;
  let master = null;
  let step = 0;
  let nextTime = 0;
  let melodyIdx = 4;

  function ensureMaster(c) {
    if (!master) {
      master = c.createGain();
      master.gain.value = 0.05;
      master.connect(c.destination);
    }
    return master;
  }

  function note(c, freq, t, dur, wave, vol) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = wave;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ensureMaster(c));
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function pitch(root, scaleDeg, octave) {
    const scale = theme.scale;
    const deg = ((scaleDeg % scale.length) + scale.length) % scale.length;
    const oct = octave + Math.floor(scaleDeg / scale.length);
    return root * Math.pow(2, oct + scale[deg] / 12);
  }

  function playStep(s, t, stepDur) {
    const c = sharedAudioContext();
    // Bass: root/fifth pulse on the beat.
    if (s % 4 === 0) {
      const fifth = (s % 16 === 8);
      note(c, theme.root / 2 * (fifth ? 1.5 : 1), t, stepDur * 1.8, 'triangle', 0.9);
    }
    // Melody: random walk over the pentatonic scale on 8th notes.
    if (s % 2 === 0 && Math.random() < 0.68) {
      melodyIdx += [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)];
      melodyIdx = Math.max(0, Math.min(9, melodyIdx));
      note(c, pitch(theme.root, melodyIdx, 1), t, stepDur * (Math.random() < 0.25 ? 3 : 1.6), theme.wave, 0.5);
    }
    // Occasional high chime for sparkle on calm themes.
    if (theme.chime && s % 32 === 12) {
      note(c, pitch(theme.root, 7, 2), t, stepDur * 6, 'sine', 0.3);
    }
  }

  function scheduler() {
    const c = sharedAudioContext();
    if (!c || !theme) return;
    const stepDur = 60 / theme.bpm / 4; // 16th notes
    while (nextTime < c.currentTime + 0.3) {
      if (nextTime >= c.currentTime - 0.05) playStep(step, Math.max(nextTime, c.currentTime + 0.01), stepDur);
      nextTime += stepDur;
      step = (step + 1) % 64;
    }
  }

  function start() {
    const c = sharedAudioContext();
    if (!c || timer || !theme) return;
    step = 0;
    nextTime = c.currentTime + 0.1;
    timer = setInterval(scheduler, 120);
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  return {
    play(name) {
      if (!THEMES[name]) name = 'title';
      if (themeName === name && timer) return;
      themeName = name;
      theme = THEMES[name];
      stop();
      if (enabled) start();
    },
    toggle() {
      enabled = !enabled;
      const p = loadAudioPrefs();
      p.musicMuted = !enabled;
      saveAudioPrefs(p);
      if (enabled && theme) start(); else stop();
      return !enabled;
    },
    get muted() { return !enabled; },
  };
})();
