// ===== Awawa Quest — WebAudio synth (cries & SFX) =====
'use strict';

const Sound = (() => {
  let ctx = null;
  let muted = false;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
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
    toggleMute() { muted = !muted; return muted; },
    get muted() { return muted; },
  };
})();
