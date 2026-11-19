/*
 * Biblioteca de arte — ilustraciones de la historia (1600 × 640) e íconos de las salas.
 * Mismo sistema que el resto (docs/ARTE.md): paleta en variables CSS, luz arriba a la izquierda,
 * sin contornos negros. Las personas se dibujan de espaldas o a contraluz: solo Volti tiene rostro.
 */
(function (EA) {
  'use strict';
  var A = EA.arte, K = A.K, V = K.V, R = K.R, C = K.C, E = K.E, P = K.P, L = K.L, T = K.T, G = K.G, Vol = K.Vol, def = K.def, u = A.usar;
  var NOCHE = '#18203D', NOCHE_B = '#1D2749', COLINA = '#222D52';

  // ------------------------------------------------------------------ Personajes

  /** Estudiante visto de espaldas. (x, y) = punto entre los pies. */
  function estudiante(x, y, s, o) {
    o = o || {};
    var ropa = o.ropa || 'azul', mochila = o.mochila || 'amarillo', pelo = o.pelo || V.tintaS;
    var piel = o.piel || V.maderaL, pantalon = o.pantalon || V.tintaL, pose = o.pose || 'abajo';
    var brazo = function (d) { return L(d, V[ropa + 'S'], 17); };
    var mano = function (cx, cy) { return C(cx, cy, 9, piel); };
    var g = E(6, 0, 48, 8, V.sombra);
    g += R(-24, -82, 20, 78, 9, pantalon) + R(4, -82, 20, 78, 9, pantalon) + R(14, -82, 10, 78, 5, V.tintaS, 'opacity=".25"');
    g += E(-14, -5, 15, 8, V.tintaS) + E(14, -5, 15, 8, V.tintaS);
    if (pose === 'arriba') {
      g += brazo('M-26 -140 L-58 -206') + mano(-61, -212) + brazo('M26 -140 L58 -206') + mano(61, -212);
    } else if (pose === 'linterna') {
      g += brazo('M-30 -140 L-42 -88') + mano(-43, -82) + brazo('M30 -140 L64 -158') + mano(68, -160);
      g += G(R(0, -9, 36, 18, 6, V.metalS) + R(30, -12, 10, 24, 4, V.metalL), 'transform="translate(68 -160) rotate(-20)"');
    } else {
      g += brazo('M-30 -140 L-42 -88') + mano(-43, -82) + brazo('M30 -140 L42 -88') + mano(43, -82);
    }
    g += R(-36, -152, 72, 84, 24, V[ropa + 'S']) + R(-36, -152, 64, 84, 24, V[ropa]);
    g += R(-27, -146, 54, 62, 16, V[mochila + 'S']) + R(-27, -146, 49, 62, 16, V[mochila])
      + R(-17, -112, 32, 18, 7, V[mochila + 'S']) + R(-19, -141, 18, 6, 3, V[mochila + 'L']);
    g += R(-9, -164, 18, 16, 5, piel) + C(-29, -184, 7, piel) + C(29, -184, 7, piel);
    if (o.peinado === 'coleta') {
      g += E(0, -160, 10, 20, pelo) + C(0, -190, 30, pelo) + C(0, -172, 6, V.coral);
    } else if (o.peinado === 'rizado') {
      g += C(0, -188, 27, pelo) + C(-19, -200, 15, pelo) + C(0, -209, 16, pelo) + C(19, -200, 15, pelo) + C(-25, -183, 13, pelo) + C(25, -183, 13, pelo);
    } else {
      g += C(0, -190, 30, pelo) + P('M-20 -214 q12 -10 30 -4 q-14 2 -18 10 z', pelo);
    }
    g += C(-10, -202, 9, V.blanco, 'opacity=".08"');
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' + g + '</g>';
  }

  /** El doctor Ámbar a contraluz (silueta, sin rasgos). (x, y) = pies. */
  function cientifico(x, y, s) {
    var c = '#161B33', luz = V.amarilloL;
    var g = E(0, 0, 64, 10, V.sombra);
    g += R(-26, -92, 20, 90, 9, c) + R(6, -92, 20, 90, 9, c);
    g += L('M-40 -212 L-64 -118', c, 22) + L('M40 -212 L64 -118', c, 22);
    g += P('M-56 -96 L-42 -222 Q0 -240 42 -222 L56 -96 Z', c);
    g += R(-11, -248, 22, 20, 6, c) + C(0, -274, 31, c);
    g += P('M-32 -286 q-16 -28 8 -34 q6 -20 24 -10 q20 -14 28 8 q22 2 6 34 z', c);
    // borde iluminado por el amanecer y reflejo en los anteojos
    g += L('M42 -222 L56 -96', luz, 4, 'opacity=".55"') + L('M24 -298 q18 8 14 30', luz, 4, 'opacity=".55"');
    g += '<circle cx="-12" cy="-272" r="9" fill="none" stroke="' + luz + '" stroke-width="3" opacity=".8"/>'
      + '<circle cx="13" cy="-272" r="9" fill="none" stroke="' + luz + '" stroke-width="3" opacity=".8"/>';
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' + g + '</g>';
  }

  function estrellas(lista) {
    return lista.map(function (p, i) {
      return '<circle class="estrella" style="animation-delay:' + ((i * 0.7) % 4).toFixed(1) + 's" cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="' + V.cremaL + '"/>';
    }).join('');
  }

  function arbol(x, y, s, c1, c2) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + R(-11, -150, 22, 150, 8, V.maderaS)
      + C(0, -190, 70, c1) + C(-46, -150, 50, c1) + C(46, -150, 50, c2) + C(-14, -214, 40, c2, 'opacity=".55"') + '</g>';
  }

  /** Gema de ámbar: el símbolo del doctor (el ámbar dio nombre a la electricidad). */
  function gema(x, y, r) {
    var pts = [];
    for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; pts.push((x + r * Math.cos(a)).toFixed(1) + ' ' + (y + r * Math.sin(a)).toFixed(1)); }
    return P('M' + pts.join(' L') + ' Z', V.naranja) + P('M' + x + ' ' + (y - r) + ' L' + (x + r * 0.86) + ' ' + (y - r / 2) + ' L' + x + ' ' + y + ' Z', V.amarilloL, 'opacity=".75"')
      + P('M' + x + ' ' + y + ' L' + (x + r * 0.86) + ' ' + (y + r / 2) + ' L' + x + ' ' + (y + r) + ' Z', V.naranjaS);
  }

  // ------------------------------------------------------------------ Íconos de sala (caja 120 × 120)

  function trazo(d, ancho) { return L(d, V.cremaL, ancho || 7); }
  var ICONO_SALA = {
    quimica: function () {
      return P('M38 80 H82 L89 92 a6 6 0 0 1 -5 9 H36 a6 6 0 0 1 -5 -9 Z', V.cremaL, 'opacity=".55"')
        + trazo('M46 24 h28 M52 24 v28 L31 92 a7 7 0 0 0 6 10 h46 a7 7 0 0 0 6 -10 L68 52 V24') + C(54, 88, 4, V.cremaL) + C(66, 92, 3, V.cremaL);
    },
    biologia: function () {
      return trazo('M44 20 C44 46 76 44 76 60 C76 76 44 74 44 100') + trazo('M76 20 C76 46 44 44 44 60 C44 76 76 74 76 100')
        + trazo('M50 33 h20 M50 87 h20', 6);
    },
    fisica: function () {
      return '<g fill="none" stroke="' + V.cremaL + '" stroke-width="6">' + '<ellipse cx="60" cy="60" rx="44" ry="16"/>'
        + '<ellipse cx="60" cy="60" rx="44" ry="16" transform="rotate(60 60 60)"/><ellipse cx="60" cy="60" rx="44" ry="16" transform="rotate(-60 60 60)"/></g>'
        + C(60, 60, 9, V.cremaL);
    },
    control: function () {
      return trazo('M26 28 h68 a6 6 0 0 1 6 6 v42 a6 6 0 0 1 -6 6 H26 a6 6 0 0 1 -6 -6 V34 a6 6 0 0 1 6 -6 z M48 98 h24 M60 82 v16')
        + trazo('M32 66 l14 -12 l12 8 l16 -18 l12 8', 6);
    },
    invernadero: function () {
      return P('M36 72 h48 l-7 30 H43 Z', V.cremaL, 'opacity=".55"') + trazo('M36 72 h48 l-7 30 H43 Z M60 72 V44')
        + '<ellipse cx="45" cy="44" rx="16" ry="9" fill="' + V.cremaL + '" transform="rotate(-30 45 44)"/>'
        + '<ellipse cx="75" cy="36" rx="16" ry="9" fill="' + V.cremaL + '" transform="rotate(30 75 36)"/>';
    }
  };
  function dibujoIconoSala(id) {
    var ac = (EA.ESCENAS[id] || {}).acento || 'gris';
    return R(0, 6, 120, 114, 30, V[ac + 'S']) + R(0, 0, 120, 114, 30, V[ac]) + R(14, 8, 46, 6, 3, V[ac + 'L'], 'opacity=".7"')
      + (ICONO_SALA[id] ? ICONO_SALA[id]() : '');
  }
  /** Ícono suelto de una sala (para pantallas de la interfaz). */
  A.iconoSala = function (id, tam) {
    return '<svg class="icono-sala" width="' + (tam || 80) + '" height="' + (tam || 80) + '" viewBox="0 0 120 120" aria-hidden="true" focusable="false">' + dibujoIconoSala(id) + '</svg>';
  };

  // ------------------------------------------------------------------ Introducción

  def('hist.exterior', 1600, 640, function () {
    var s = R(0, 0, 1600, 640, 0, NOCHE) + R(0, 300, 1600, 340, 0, NOCHE_B);
    s += estrellas([[90, 70, 3], [210, 150, 2], [330, 60, 2.5], [460, 120, 2], [600, 50, 3], [720, 140, 2], [1010, 60, 2.5],
      [1120, 150, 2], [1230, 50, 2], [1480, 200, 2.5], [1540, 80, 2], [60, 230, 2], [1440, 300, 2], [880, 40, 2]]);
    s += C(1340, 130, 56, V.cremaL) + C(1322, 116, 11, V.cremaS) + C(1360, 150, 14, V.cremaS) + C(1354, 104, 6, V.cremaS) + C(1340, 130, 96, V.cremaL, 'opacity=".06"');
    s += P('M0 440 Q220 360 460 410 T940 395 T1360 380 T1600 410 V640 H0 Z', COLINA);
    s += arbol(170, 560, 1, '#1F4A3A', '#24533F') + arbol(1420, 570, 1.15, '#1F4A3A', '#24533F') + arbol(320, 575, 0.7, '#245740', '#2C6247');
    // Laboratorio
    s += R(540, 250, 620, 320, 10, V.tintaL) + R(1110, 250, 50, 320, 0, '#283062') + R(520, 226, 660, 32, 10, V.metalS) + R(520, 226, 660, 10, 5, V.metal);
    s += P('M600 226 A118 118 0 0 1 836 226 Z', V.metal) + P('M600 226 A118 118 0 0 1 700 112 L700 226 Z', V.metalL, 'opacity=".5"') + R(708, 112, 18, 114, 6, V.tintaS);
    s += L('M780 140 L860 70', V.metalS, 14) + C(866, 64, 12, V.metal);
    s += L('M1100 226 V136', V.metalS, 6) + '<circle class="led" cx="1100" cy="130" r="10" fill="' + V.coral + '"/>';
    [[586, 300], [1006, 300]].forEach(function (w) {
      s += R(w[0], w[1], 130, 116, 10, V.metalS) + R(w[0] + 10, w[1] + 10, 110, 96, 6, V.amarilloL) + R(w[0] + 10, w[1] + 54, 110, 8, 0, V.metalS) + R(w[0] + 61, w[1] + 10, 8, 96, 0, V.metalS);
    });
    s += P('M1028 404 l12 -40 h10 l12 40 z', V.tintaL, 'opacity=".55"') + C(632, 392, 14, V.tintaL, 'opacity=".45"');
    // Letrero y puerta entreabierta con luz
    s += R(744, 316, 240, 44, 12, V.tinta) + gema(770, 338, 13) + T(880, 348, 'DR. ÁMBAR', 24, V.amarilloL, 'letter-spacing="2"');
    s += R(790, 376, 180, 194, 10, V.turquesaS) + R(802, 388, 156, 182, 4, V.amarilloL);
    s += P('M802 388 L872 400 L872 558 L802 570 Z', V.turquesa) + C(860, 482, 5, V.cremaL);
    s += R(770, 566, 220, 16, 5, V.metalS);
    s += P('M0 570 H1600 V640 H0 Z', '#1C3A33') + P('M800 582 H962 L1110 640 H640 Z', '#33405E');
    s += P('M874 582 L962 582 L1160 640 L900 640 Z', V.amarilloL, 'opacity=".22"');
    // Estudiantes: uno alumbra la puerta
    s += P('M676 432 L800 396 L800 560 Z', V.amarilloL, 'opacity=".16"');
    s += estudiante(560, 618, 0.95, { ropa: 'coral', mochila: 'amarillo', pelo: V.maderaS, pose: 'linterna', peinado: 'coleta' });
    s += estudiante(1060, 620, 1, { ropa: 'azul', mochila: 'verde', pelo: V.tintaS, piel: V.madera });
    s += estudiante(1210, 616, 0.9, { ropa: 'violeta', mochila: 'naranja', pelo: V.naranjaS, peinado: 'rizado' });
    return s;
  }, 'Historia: el laboratorio del doctor Ámbar de noche, con la puerta entreabierta.');

  def('hist.apagon', 1600, 640, function () {
    var s = R(0, 0, 1600, 640, 0, 'var(--pared-quimica)') + R(0, 500, 1600, 140, 0, '#2B3A45');
    s += u('mueble.armario', 60, 70, 0.86) + u('mueble.meson', 420, 300) + u('lab.matraz', 452, 180) + u('lab.tubos', 560, 202)
      + u('lab.balon', 940, 170, 1, { color: 'violeta' }) + u('lab.mechero', 1060, 180);
    s += u('ui.puerta', 1250, 40, 0.84, { acento: 'turquesa', total: 4, abiertos: 0, rotulo: 'SALIDA' });
    s += R(0, 0, 1600, 640, 0, '#0B0F22', 'opacity=".74"');
    // Luz de emergencia
    s += C(780, 60, 340, V.coral, 'opacity=".05"') + C(780, 60, 230, V.coral, 'opacity=".06"') + C(780, 60, 130, V.coral, 'opacity=".08"') + u('deco.emergencia', 720, 34);
    // La puerta se bloquea
    s += R(1296, 168, 236, 50, 10, V.coral) + T(1414, 202, 'BLOQUEADO', 26, V.tintaS, 'letter-spacing="2"');
    s += u('ui.candado', 1364, 268, 0.95, { estado: 'cerrado', numero: '' });
    // ¡CLAC!
    var pts = [], i;
    for (i = 0; i < 24; i++) { var r = i % 2 ? 84 : 128, a = i * Math.PI / 12; pts.push((250 + r * Math.cos(a)).toFixed(1) + ' ' + (150 + r * 0.78 * Math.sin(a)).toFixed(1)); }
    s += '<g class="clac">' + P('M' + pts.join(' L') + ' Z', V.amarillo) + P('M' + pts.map(function (p) {
      var xy = p.split(' '); return (250 + (xy[0] - 250) * 0.8).toFixed(1) + ' ' + (150 + (xy[1] - 150) * 0.8).toFixed(1);
    }).join(' L') + ' Z', V.amarilloL)
      + T(250, 172, '¡CLAC!', 62, V.tintaS, 'transform="rotate(-8 250 160)"') + '</g>';
    // Estudiantes con linternas
    s += P('M500 416 L1060 300 L1160 470 Z', V.amarilloL, 'opacity=".14"') + P('M834 422 L1300 270 L1360 420 Z', V.amarilloL, 'opacity=".12"');
    s += estudiante(440, 622, 0.92, { ropa: 'coral', mochila: 'amarillo', pelo: V.maderaS, pose: 'linterna', peinado: 'coleta' });
    s += estudiante(766, 626, 0.98, { ropa: 'azul', mochila: 'verde', pelo: V.tintaS, piel: V.madera, pose: 'linterna' });
    s += estudiante(620, 630, 0.9, { ropa: 'violeta', mochila: 'naranja', pelo: V.naranjaS, peinado: 'rizado' });
    return s;
  }, 'Historia: el apagón deja el laboratorio a oscuras y bloquea la puerta.');

  def('hist.volti', 1600, 640, function () {
    var s = R(0, 0, 1600, 640, 0, 'var(--pared-control)') + R(0, 520, 1600, 120, 0, 'var(--piso-control)');
    s += u('ctl.pantalla', 70, 70, 0.72) + u('ctl.mapa', 1190, 80, 0.78) + u('ctl.consola', 420, 440);
    s += R(0, 0, 1600, 640, 0, '#0B0F22', 'opacity=".45"');
    s += C(800, 290, 250, V.turquesaL, 'opacity=".07"') + C(800, 290, 175, V.turquesaL, 'opacity=".09"');
    s += '<g class="flota-lento">' + u('ui.candado', 452, 138, 0.62, { estado: 'cerrado', numero: '?' }) + '</g>';
    s += '<g class="flota-lento" style="animation-delay:-1.2s">' + u('ui.candado', 1250, 360, 0.56, { estado: 'cerrado', numero: '?' }) + '</g>';
    s += '<g class="flota-lento" style="animation-delay:-2.1s"><g transform="translate(500 330) scale(.62)">' + dibujoIconoSala('quimica') + '</g></g>';
    s += '<g class="flota-lento" style="animation-delay:-0.6s"><g transform="translate(1080 290) scale(.6)">' + dibujoIconoSala('fisica') + '</g></g>';
    s += u('ui.robot', 640, 96, 1.6, { expresion: 'contento' });
    // Globo de diálogo
    s += R(1000, 34, 320, 96, 26, V.cremaL) + P('M1030 122 L1000 160 L1072 126 Z', V.cremaL) + T(1160, 94, '¡Hola! Soy Volti.', 32, V.tintaS);
    return s;
  }, 'Historia: Volti, el robot asistente, despierta con la energía de respaldo.');

  def('hist.mapa', 1600, 640, function (o) {
    var salas = (o.salas && o.salas.length) ? o.salas : ['quimica', 'biologia', 'fisica'];
    var s = R(0, 0, 1600, 640, 0, '#1E3463');
    var grilla = '', i;
    for (i = 40; i < 1600; i += 40) grilla += 'M' + i + ' 0 V640 ';
    for (i = 40; i < 640; i += 40) grilla += 'M0 ' + i + ' H1600 ';
    s += L(grilla, V.azul, 2, 'opacity=".28"') + T(800, 66, 'PLANO DEL LABORATORIO', 28, V.azulL, 'letter-spacing="6"');
    var n = salas.length, izq = 300, der = 1400;
    var xs = [], ys = [];
    for (i = 0; i <= n; i++) { xs.push(izq + i * (der - izq) / n); ys.push(i % 2 ? 360 : 300); }
    // Ruta: inicio -> salas -> salida
    var d = 'M120 ' + ys[0];
    for (i = 0; i <= n; i++) d += ' L' + xs[i].toFixed(0) + ' ' + ys[i];
    s += L(d, V.cremaL, 8, 'stroke-dasharray="4 18" class="ruta"');
    s += C(120, ys[0], 30, V.amarillo) + C(120, ys[0], 12, V.tintaS) + T(120, ys[0] + 72, 'INICIO', 24, V.amarilloL, 'letter-spacing="2"');
    salas.forEach(function (id, k) {
      var x = xs[k], y = ys[k], nombre = (EA.ESCENAS[id] || { nombre: id }).nombre;
      s += '<g transform="translate(' + (x - 75) + ' ' + (y - 75) + ') scale(1.25)">' + dibujoIconoSala(id) + '</g>';
      s += C(x - 66, y - 70, 24, V.amarillo) + T(x - 66, y - 60, String(k + 1), 28, V.tintaS);
      var partes = nombre.split(' ');
      var l1 = partes.slice(0, Math.ceil(partes.length / 2)).join(' '), l2 = partes.slice(Math.ceil(partes.length / 2)).join(' ');
      if (partes.length <= 2) { l1 = nombre; l2 = ''; }
      s += T(x, y + 110, l1, 26, V.cremaL) + (l2 ? T(x, y + 142, l2, 26, V.cremaL) : '');
    });
    // Salida
    var sx = xs[n], sy = ys[n];
    s += C(sx, sy, 130, V.verdeL, 'opacity=".12"');
    s += R(sx - 68, sy - 100, 136, 196, 18, V.verdeS) + R(sx - 56, sy - 88, 112, 184, 8, V.verde) + R(sx - 56, sy - 88, 112, 8, 4, V.verdeL);
    s += L('M' + (sx - 26) + ' ' + (sy + 6) + ' h52 m-18 -18 l18 18 l-18 18', V.cremaL, 9);
    s += R(sx - 78, sy - 146, 156, 38, 10, V.tinta) + T(sx, sy - 118, 'SALIDA', 24, V.verdeL, 'letter-spacing="2"');
    return s;
  }, 'Historia: plano con la ruta de las salas del preset. Opciones: salas (ids de escena).');

  // ------------------------------------------------------------------ Final

  def('hist.salida', 1600, 640, function (o) {
    var celebran = o.celebran !== false;
    var s = R(0, 0, 1600, 640, 0, 'var(--pared-quimica-s)') + R(0, 540, 1600, 100, 0, '#2B3A45');
    // Exterior al amanecer
    var hueco = '<clipPath id="hueco-salida"><rect x="560" y="70" width="480" height="470" rx="6"/></clipPath>';
    var fuera = R(560, 70, 480, 470, 0, V.naranjaL) + R(560, 250, 480, 290, 0, V.amarilloL) + R(560, 380, 480, 160, 0, V.cremaL);
    for (var i = 0; i < 9; i++) fuera += P('M800 430 L' + (560 + i * 60) + ' 70 L' + (590 + i * 60) + ' 70 Z', V.blanco, 'opacity=".22"');
    fuera += C(800, 440, 92, V.amarillo) + C(800, 440, 70, V.amarilloL);
    fuera += P('M560 470 Q700 420 820 450 T1040 440 V540 H560 Z', V.verde) + P('M560 510 Q760 470 1040 500 V540 H560 Z', V.verdeS);
    s += hueco + '<g clip-path="url(#hueco-salida)">' + fuera + '</g>';
    // Marco y hojas abiertas
    s += R(536, 46, 528, 26, 8, V.turquesaS) + R(536, 46, 26, 500, 6, V.turquesaS) + R(1038, 46, 26, 500, 6, V.turquesaS) + R(536, 46, 528, 8, 4, V.turquesaL, 'opacity=".5"');
    s += R(470, 70, 92, 470, 0, V.metalS) + R(1038, 70, 92, 470, 0, V.metalS) + R(470, 70, 20, 470, 0, V.metal) + R(1110, 70, 20, 470, 0, V.metal);
    [0, 1, 2, 3].forEach(function (k) { s += C(740 + k * 40, 30, 11, V.verdeL); });
    // Luz que entra
    s += P('M560 540 L1040 540 L1340 640 L260 640 Z', V.amarilloL, 'opacity=".28"');
    if (celebran) {
      s += estudiante(690, 600, 1.05, { ropa: 'coral', mochila: 'amarillo', pelo: V.maderaS, pose: 'arriba', peinado: 'coleta' });
      s += estudiante(806, 612, 1.1, { ropa: 'azul', mochila: 'verde', pelo: V.tintaS, piel: V.madera, pose: 'arriba' });
      s += estudiante(926, 604, 1.0, { ropa: 'violeta', mochila: 'naranja', pelo: V.naranjaS, pose: 'arriba', peinado: 'rizado' });
      s += u('ui.robot', 1170, 250, 1.05, { expresion: 'contento' });
      // Papel picado
      [[620, 120, 'coral', 20], [700, 170, 'amarillo', -30], [880, 110, 'turquesa', 15], [980, 180, 'violeta', -10], [760, 230, 'verde', 40], [940, 260, 'coral', -25]].forEach(function (c, k) {
        s += '<rect class="confeti" style="animation-delay:' + (k * 0.35).toFixed(2) + 's" x="' + c[0] + '" y="' + c[1] + '" width="16" height="8" rx="2" fill="' + V[c[2]] + '" transform="rotate(' + c[3] + ' ' + c[0] + ' ' + c[1] + ')"/>';
      });
    } else {
      s += cientifico(800, 548, 1.05);
      s += estudiante(560, 628, 0.95, { ropa: 'coral', mochila: 'amarillo', pelo: V.maderaS, peinado: 'coleta' });
      s += estudiante(1040, 632, 1, { ropa: 'azul', mochila: 'verde', pelo: V.tintaS, piel: V.madera });
      s += u('ui.robot', 1200, 280, 0.95, { expresion: 'neutral' });
    }
    return s;
  }, 'Historia: la puerta abierta al amanecer. Opciones: celebran (estudiantes festejando o el doctor a contraluz).');

  def('hist.nota', 1600, 640, function () {
    var s = R(0, 0, 1600, 640, 0, 'var(--pared-quimica)') + R(0, 0, 1600, 70, 0, 'var(--pared-quimica-s)');
    s += R(1200, 90, 300, 250, 16, V.metalS) + R(1212, 102, 276, 226, 8, V.azulL) + C(1430, 160, 34, V.amarilloL) + P('M1212 280 Q1300 240 1390 270 T1488 262 V328 H1212 Z', V.verdeL)
      + R(1344, 102, 10, 226, 0, V.metalS) + R(1212, 210, 276, 10, 0, V.metalS);
    // Mesa
    s += R(0, 470, 1600, 170, 0, V.maderaS) + R(0, 470, 1600, 26, 0, V.madera) + R(0, 470, 1600, 6, 0, V.maderaL);
    // Nota del doctor
    var nota = R(0, 0, 500, 400, 10, V.cremaS) + R(0, 0, 492, 392, 10, V.cremaL);
    nota += R(30, 50, 300, 14, 7, V.tintaL);
    for (var i = 0; i < 6; i++) nota += L('M30 ' + (110 + i * 38) + ' q30 -10 60 0 t60 0 t60 0 t60 0 t60 0' + (i % 2 ? '' : ' t60 0'), V.gris, 5);
    nota += T(330, 360, 'Dr. Ámbar', 40, V.tinta, 'font-style="italic"') + gema(440, 84, 26);
    nota += R(-20, -12, 110, 30, 4, V.amarilloL, 'opacity=".85" transform="rotate(-18 35 3)"') + R(400, -14, 110, 30, 4, V.amarilloL, 'opacity=".85" transform="rotate(16 455 1)"');
    s += '<g transform="translate(560 90) rotate(-3 250 200)">' + nota + '</g>';
    // Objetos sobre la mesa
    s += '<g class="vapor">' + C(300, 380, 12, V.cremaL, 'opacity=".5"') + C(316, 352, 16, V.cremaL, 'opacity=".35"') + C(296, 322, 20, V.cremaL, 'opacity=".2"') + '</g>';
    s += L('M352 430 q30 0 30 24 t-30 24', V.coralS, 9) + Vol(250, 400, 104, 92, 18, V.coral, V.coralS, 8) + R(262, 410, 14, 60, 7, V.coralL, 'opacity=".6"');
    s += '<g fill="none" stroke="' + V.tinta + '" stroke-width="7"><circle cx="1150" cy="470" r="30"/><circle cx="1238" cy="470" r="30"/><path d="M1180 466 q14 -10 28 0 M1120 462 l-34 -14 M1268 462 l34 -14"/></g>';
    s += C(1150, 470, 26, V.vidrio, 'opacity=".35"') + C(1238, 470, 26, V.vidrio, 'opacity=".35"');
    // Insignia de ayudantes
    s += P('M1350 420 l-26 70 l26 -14 l26 14 Z', V.coral) + P('M1410 420 l-26 70 l26 -14 l26 14 Z', V.coralS);
    s += C(1380, 410, 52, V.amarilloS) + C(1380, 404, 48, V.amarillo) + K.P('M1380 374 l10 20 l22 3 l-16 15 l4 22 l-20 -11 l-20 11 l4 -22 l-16 -15 l22 -3 z', V.amarilloL);
    s += u('ui.robot', 40, 230, 1.05, { expresion: 'contento' });
    return s;
  }, 'Historia: la nota del doctor Ámbar sobre la mesa.');

  def('hist.sinEnergia', 1600, 640, function () {
    var s = R(0, 0, 1600, 640, 0, 'var(--pared-control-s)') + R(0, 520, 1600, 120, 0, '#2A2C56');
    s += R(120, 90, 260, 220, 14, V.metalS) + R(132, 102, 236, 196, 8, NOCHE) + C(300, 160, 30, V.cremaL) + C(312, 152, 28, NOCHE)
      + estrellas([[170, 140, 2.5], [230, 250, 2], [330, 260, 2], [200, 200, 2]]) + R(244, 102, 10, 196, 0, V.metalS) + R(132, 196, 236, 10, 0, V.metalS);
    s += P('M132 298 L368 298 L520 640 L-20 640 Z', V.cremaL, 'opacity=".05"');
    // Batería vacía
    s += '<rect x="500" y="200" width="460" height="220" rx="34" fill="none" stroke="' + V.metal + '" stroke-width="16"/>' + R(962, 266, 34, 88, 10, V.metal);
    s += '<rect class="led" x="528" y="228" width="44" height="164" rx="14" fill="' + V.coral + '"/>';
    s += T(760, 336, '0 %', 84, V.coralL);
    s += u('ui.robot', 1100, 220, 1.25, { expresion: 'dormido' });
    return s;
  }, 'Historia: la batería de respaldo se agotó y Volti duerme.');
})(window.EA = window.EA || {});
