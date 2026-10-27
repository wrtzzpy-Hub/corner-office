/* ============================== AUDIO ============================== */
const Audio = (() => {
  let ctx, master, sfxBus, musicBus, musicTimer, nextBeat = 0, step = 0, foot = 0;
  function init() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = .9; master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = save.sfx ? .8 : 0; sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
    if (save.music) startMusic();
  }
  function noise(dur) { const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = ctx.createBufferSource(); s.buffer = b; return s; }
  function env(g, t, a, peak, rel) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + rel); }
  function tone(type, f, t, a, peak, rel, bus = sfxBus, f2) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + a + rel); env(g, t, a, peak, rel); o.connect(g).connect(bus); o.start(t); o.stop(t + a + rel + .05); }
  function burst(t, type, freq, q, peak, rel, dur = .2) { const n = noise(dur), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = type; f.frequency.value = freq; f.Q.value = q; env(g, t, .003, peak, rel); n.connect(f).connect(g).connect(sfxBus); n.start(t); }
  const fx = {
    click() { tone("sine", 880, ctx.currentTime, .004, .25, .05); },
    paper() { const t = ctx.currentTime, n = noise(.35), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = "bandpass"; f.frequency.setValueAtTime(2500, t); f.frequency.linearRampToValueAtTime(5000, t + .3); f.Q.value = .8; env(g, t, .03, .5, .3); n.connect(f).connect(g).connect(sfxBus); n.start(t); },
    stamp() { const t = ctx.currentTime; tone("sine", 160, t, .005, .9, .25, sfxBus, 45); burst(t, "lowpass", 1200, .7, .6, .1, .12); },
    unstamp() { tone("triangle", 420, ctx.currentTime, .005, .25, .12, sfxBus, 260); },
    tick() { tone("square", 1300 + Math.random() * 500, ctx.currentTime, .001, .035, .02); },
    knock() { const t = ctx.currentTime; [0, .17].forEach(d => { tone("sine", 120, t + d, .003, .8, .12, sfxBus, 70); burst(t + d, "lowpass", 900, .7, .5, .04, .05); }); },
    good() { const t = ctx.currentTime; tone("sine", 659, t, .01, .35, .25); tone("sine", 988, t + .1, .01, .35, .4); },
    bad() { const t = ctx.currentTime, o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = "sawtooth"; o.frequency.value = 130; f.type = "lowpass"; f.frequency.value = 700; env(g, t, .01, .3, .3); o.connect(f).connect(g).connect(sfxBus); o.start(t); o.stop(t + .4); },
    fanfare() { const t = ctx.currentTime; [523, 659, 784, 1047].forEach((f, i) => tone("triangle", f, t + i * .12, .01, .35, i === 3 ? .8 : .18)); },
    promo() { const t = ctx.currentTime; [392, 523, 659, 784, 1047, 1319].forEach((f, i) => { tone("triangle", f, t + i * .1, .01, .3, i === 5 ? 1.2 : .2); tone("sine", f / 2, t + i * .1, .01, .15, .3); }); },
    blip() { tone("sine", 1180, ctx.currentTime, .003, .08, .06); },
    task() { const t = ctx.currentTime; [784, 988, 1319].forEach((f, i) => tone("triangle", f, t + i * .08, .005, .22, .25)); },
    box() { const t = ctx.currentTime; tone("sine", 110, t, .003, .5, .12, sfxBus, 60); burst(t, "bandpass", 700, 1.2, .35, .08, .1); },
    step(surface) {
      const t = ctx.currentTime; foot = 1 - foot; const p = foot ? 1 : .88;
      if (surface === "carpet") burst(t, "lowpass", 420 * p, .6, .22, .07, .1);
      else if (surface === "concrete") { burst(t, "bandpass", 1500 * p, 1.4, .18, .05, .08); tone("sine", 90 * p, t, .002, .25, .06, sfxBus, 55); }
      else { burst(t, "bandpass", 2600 * p, 2, .16, .035, .06); tone("sine", 140 * p, t, .002, .16, .04, sfxBus, 90); }
    },
  };
  const CHORDS = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 64]];
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12), SPB = 60 / 84 / 2;
  function schedule() {
    while (nextBeat < ctx.currentTime + .25) {
      const bar = Math.floor(step / 8) % 4, ch = CHORDS[bar], t = nextBeat, s = step % 8;
      if (s === 0) ch.forEach(m => { const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = o2.type = "triangle"; o.frequency.value = mtof(m); o2.frequency.value = mtof(m) * 1.004; f.type = "lowpass"; f.frequency.value = 900; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(.045, t + .6); g.gain.linearRampToValueAtTime(0.0001, t + SPB * 8 + .2); o.connect(f); o2.connect(f); f.connect(g).connect(musicBus); o.start(t); o2.start(t); o.stop(t + SPB * 8 + .3); o2.stop(t + SPB * 8 + .3); });
      if (s === 0) tone("sine", mtof(ch[0] - 12), t, .02, .12, SPB * 6, musicBus);
      if ([0, 3, 5, 6].includes(s)) tone("sine", mtof(ch[(s + bar) % 4] + 12), t, .005, .06, .35, musicBus);
      if (s % 2 === 1) { const n = noise(.05), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = "highpass"; f.frequency.value = 7000; env(g, t, .002, .035, .04); n.connect(f).connect(g).connect(musicBus); n.start(t); }
      nextBeat += SPB; step++;
    }
  }
  function startMusic() { if (!ctx) return; musicBus.gain.cancelScheduledValues(ctx.currentTime); musicBus.gain.linearRampToValueAtTime(.5, ctx.currentTime + 1.5); if (!musicTimer) { nextBeat = ctx.currentTime + .1; musicTimer = setInterval(schedule, 80); } }
  function stopMusic() { if (!ctx) return; musicBus.gain.cancelScheduledValues(ctx.currentTime); musicBus.gain.linearRampToValueAtTime(0, ctx.currentTime + .5); setTimeout(() => { if (!save.music && musicTimer) { clearInterval(musicTimer); musicTimer = null; } }, 600); }
  return { init, play(n, a) { try { if (ctx && save.sfx && fx[n]) fx[n](a); } catch (e) {} }, setMusic(on) { on ? startMusic() : stopMusic(); }, setSfx(on) { if (sfxBus) sfxBus.gain.value = on ? .8 : 0; } };
})();
