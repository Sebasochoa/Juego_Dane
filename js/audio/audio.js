/* Sonido generado con Web Audio API: efectos y música ambiental en bucle. Sin archivos. */
(function (EA) {
  'use strict';
  var ctx = null, maestro = null, busMusica = null, busFx = null;
  var volumen = 0.7, silencio = false, musicaActiva = false, planificador = null, siguiente = 0, paso = 0;

  function nivel() { return silencio ? 0 : volumen; }

  function iniciar() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      ctx = new AC();
      maestro = ctx.createGain();
      maestro.gain.value = nivel();
      maestro.connect(ctx.destination);
      busFx = ctx.createGain(); busFx.gain.value = 0.9; busFx.connect(maestro);
      busMusica = ctx.createGain(); busMusica.gain.value = 0.32; busMusica.connect(maestro);
      if (musicaActiva) arrancarMusica();
      return true;
    } catch (e) { ctx = null; return false; }
  }

  function aplicarNivel() {
    if (ctx && maestro) maestro.gain.setTargetAtTime(nivel(), ctx.currentTime, 0.03);
  }
  function setVolumen(v) { volumen = Math.max(0, Math.min(1, v)); aplicarNivel(); }
  function setSilencio(b) { silencio = !!b; aplicarNivel(); }

  /** Una nota con envolvente. */
  function tono(o) {
    if (!ctx) return;
    var t = ctx.currentTime + (o.en || 0);
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = o.tipo || 'sine';
    osc.frequency.setValueAtTime(o.f, t);
    if (o.hasta) osc.frequency.exponentialRampToValueAtTime(o.hasta, t + o.dur);
    var v = o.vol == null ? 0.3 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + (o.ataque || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    osc.connect(g);
    g.connect(o.bus || busFx);
    osc.start(t);
    osc.stop(t + o.dur + 0.05);
  }

  /** Ruido filtrado (para la puerta). */
  function ruido(o) {
    if (!ctx) return;
    var t = ctx.currentTime + (o.en || 0);
    var n = Math.floor(ctx.sampleRate * o.dur);
    var buf = ctx.createBuffer(1, n, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(o.f, t);
    if (o.hasta) f.frequency.exponentialRampToValueAtTime(o.hasta, t + o.dur);
    f.Q.value = 1.2;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.25, t + o.dur * 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(f); f.connect(g); g.connect(busFx);
    src.start(t);
  }

  var FX = {
    clic: function () { tono({ f: 660, dur: 0.06, tipo: 'triangle', vol: 0.18 }); },
    seleccion: function () { tono({ f: 520, hasta: 700, dur: 0.08, tipo: 'triangle', vol: 0.2 }); },
    recoger: function () { tono({ f: 420, hasta: 880, dur: 0.14, tipo: 'sine', vol: 0.3 }); },
    combinar: function () { tono({ f: 440, dur: 0.12, tipo: 'triangle' }); tono({ f: 660, dur: 0.12, tipo: 'triangle', en: 0.1 }); tono({ f: 990, dur: 0.22, tipo: 'sine', en: 0.2 }); },
    nada: function () { tono({ f: 220, hasta: 180, dur: 0.14, tipo: 'triangle', vol: 0.2 }); },
    acierto: function () { [523, 659, 784, 1047].forEach(function (f, i) { tono({ f: f, dur: 0.22, tipo: 'triangle', vol: 0.3, en: i * 0.09 }); }); },
    error: function () { tono({ f: 300, hasta: 200, dur: 0.22, tipo: 'sawtooth', vol: 0.16 }); tono({ f: 210, hasta: 140, dur: 0.34, tipo: 'sawtooth', vol: 0.16, en: 0.2 }); },
    candado: function () { tono({ f: 180, dur: 0.07, tipo: 'square', vol: 0.2 }); tono({ f: 1400, hasta: 2100, dur: 0.16, tipo: 'sine', vol: 0.22, en: 0.07 }); tono({ f: 2100, dur: 0.3, tipo: 'sine', vol: 0.12, en: 0.2 }); },
    puerta: function () { ruido({ f: 300, hasta: 1400, dur: 1.5, vol: 0.2, en: 0.5 }); tono({ f: 70, hasta: 110, dur: 1.5, tipo: 'sine', vol: 0.3, en: 0.5 }); tono({ f: 880, dur: 0.3, tipo: 'sine', vol: 0.2, en: 2.0 }); },
    turno: function () { tono({ f: 587, dur: 0.18, tipo: 'sine', vol: 0.28 }); tono({ f: 880, dur: 0.32, tipo: 'sine', vol: 0.28, en: 0.16 }); },
    tic: function () { tono({ f: 1000, dur: 0.04, tipo: 'square', vol: 0.08 }); },
    apagon: function () {
      tono({ f: 520, hasta: 60, dur: 0.7, tipo: 'sawtooth', vol: 0.16 });
      ruido({ f: 900, hasta: 200, dur: 0.35, vol: 0.18 });
      tono({ f: 90, dur: 0.12, tipo: 'square', vol: 0.18, en: 0.05 });
    },
    robot: function () { [660, 990, 780, 1180].forEach(function (f, i) { tono({ f: f, dur: 0.09, tipo: 'square', vol: 0.09, en: i * 0.09 }); }); },
    victoria: function () {
      [[523, 0], [659, 0.14], [784, 0.28], [1047, 0.42], [784, 0.62], [1047, 0.76], [1319, 0.9]].forEach(function (n) { tono({ f: n[0], dur: 0.3, tipo: 'triangle', vol: 0.3, en: n[1] }); });
      [262, 330, 392].forEach(function (f) { tono({ f: f, dur: 1.4, tipo: 'sine', vol: 0.16, en: 0.9 }); });
    }
  };

  function fx(nombre) {
    if (!ctx || !FX[nombre]) return;
    try { FX[nombre](); } catch (e) { /* el sonido nunca debe romper el juego */ }
  }

  // ---- Música: acordes suaves + arpegio lento, planificados con anticipación ----
  var ACORDES = [[220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66], [164.81, 196, 246.94]];
  var COMPAS = 4.8;

  function planificar() {
    if (!ctx || !musicaActiva) return;
    while (siguiente < ctx.currentTime + 1.2) {
      var ac = ACORDES[paso % ACORDES.length];
      var en = Math.max(0, siguiente - ctx.currentTime);
      ac.forEach(function (f, i) {
        tono({ f: f / 2, dur: COMPAS * 1.05, tipo: 'sine', vol: 0.16, ataque: 1.2, en: en, bus: busMusica });
        tono({ f: f * 1.003, dur: COMPAS * 1.05, tipo: 'triangle', vol: 0.05, ataque: 1.6, en: en + i * 0.02, bus: busMusica });
      });
      var arp = [ac[0], ac[2], ac[1], ac[2] * 2, ac[1], ac[2]];
      arp.forEach(function (f, i) {
        if ((paso + i) % 5 === 3) return; // pequeños silencios para que respire
        tono({ f: f * 2, dur: 0.9, tipo: 'sine', vol: 0.07, ataque: 0.02, en: en + i * (COMPAS / 6), bus: busMusica });
      });
      siguiente += COMPAS;
      paso++;
    }
  }
  function arrancarMusica() {
    if (!ctx || planificador) return;
    siguiente = ctx.currentTime + 0.1;
    planificador = window.setInterval(planificar, 300);
    planificar();
  }
  function musica(activa) {
    musicaActiva = !!activa;
    if (musicaActiva) arrancarMusica();
    else if (planificador) { window.clearInterval(planificador); planificador = null; }
  }

  EA.audio = {
    iniciar: iniciar, fx: fx, musica: musica, setVolumen: setVolumen, setSilencio: setSilencio,
    estado: function () { return { volumen: volumen, silencio: silencio, listo: !!ctx, musica: musicaActiva }; }
  };
})(window.EA = window.EA || {});
