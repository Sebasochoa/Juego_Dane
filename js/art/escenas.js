/*
 * Composición de las escenas (1920×1080) en capas: fondo, mobiliario, interactivos y luces.
 * La lógica (candados, puzzle, textos) está en js/core/escenas.js con los mismos ids.
 */
(function (EA) {
  'use strict';
  var A = EA.arte, K = A.K, V = K.V, R = K.R, C = K.C, E = K.E, P = K.P, L = K.L, def = K.def, u = A.usar;
  var esc = EA.util.escapar;

  // ------------------------------------------------------------------ QUÍMICA

  def('fondo.quimica', 1920, 1080, function () {
    var s = A.sala({ pared: 'var(--pared-quimica)', paredS: 'var(--pared-quimica-s)', acento: V.turquesa, piso: 'var(--piso-quimica)', pisoS: V.metalS });
    // Azulejos claros detrás del mesón
    for (var x = 440; x < 1180; x += 62) for (var y = 480; y < 600; y += 62) s += R(x + 3, y + 3, 56, 56, 6, 'var(--pared-quimica-l)', 'opacity=".45"');
    // Tubería en el techo
    s += L('M0 122 H1920', V.metalS, 14) + L('M0 118 H1920', V.metal, 5);
    return s;
  }, 'Fondo del Laboratorio de Química (pared, piso).');

  A.ESCENAS.quimica = {
    lamparas: [250, 1130],
    mobiliario: function () {
      return u('deco.lampara', 150, 122) + u('deco.lampara', 1030, 122)
        + u('deco.reloj', 790, 150)
        + u('mueble.estante', 450, 410, 0.78)
        + u('lab.frasco', 468, 338, 0.8, { color: 'azul' }) + u('lab.frasco', 524, 338, 0.8, { color: 'coral' }) + u('lab.frasco', 580, 338, 0.8, { color: 'amarillo' })
        + u('lab.probeta', 652, 319, 0.7, { color: 'verde' }) + u('lab.vaso', 704, 347, 0.7, { color: 'violeta' })
        + u('mueble.armario', 90, 280)
        + u('mueble.meson', 440, 580)
        + u('mueble.campana', 780, 180)
        + u('lab.matraz', 458, 460) + u('lab.tubos', 556, 481, 0.9)
        + E(736, 578, 46, 7, V.cremaL) + E(736, 576, 34, 4, V.cremaS)
        + u('deco.emergencia', 1630, 150);
    },
    examinar: {
      tabla: { caja: [455, 112, 270, 189], arte: function () { return u('deco.tabla', 455, 112, 0.9); } },
      cartel: { caja: [1280, 140, 200, 240], arte: function () { return u('deco.cartelPila', 1280, 140); } },
      panel: { caja: [1305, 420, 150, 200], arte: function (v) { return u('quimica.panel', 1305, 420, 1, { encendido: v.usado }); } }
    },
    objetos: {
      limon: { x: 700, y: 520, s: 1, arte: 'obj.limon' },
      electrodos: { x: 1172, y: 296, s: 1, arte: 'obj.electrodos' }
    },
    candados: [{ x: 190, y: 400 }, { x: 560, y: 640 }, { x: 1036, y: 330 }, { x: 1330, y: 506 }],
    puerta: { x: 1540, y: 220 }
  };

  // ------------------------------------------------------------------ BIOLOGÍA

  def('fondo.biologia', 1920, 1080, function () {
    var s = A.sala({ pared: 'var(--pared-biologia)', paredS: 'var(--pared-biologia-s)', acento: V.verde, piso: 'var(--piso-biologia)', pisoS: V.maderaS });
    // Friso de hojas pintado en la pared
    for (var x = 60; x < 1920; x += 150) s += '<ellipse cx="' + x + '" cy="560" rx="34" ry="13" fill="var(--pared-biologia-l)" opacity=".5" transform="rotate(' + ((x / 150) % 2 ? -24 : 24) + ' ' + x + ' 560)"/>';
    s += L('M0 122 H1920', V.metalS, 14) + L('M0 118 H1920', V.metal, 5);
    return s;
  }, 'Fondo del Laboratorio de Biología.');

  A.ESCENAS.biologia = {
    lamparas: [1010, 1400],
    mobiliario: function () {
      return u('deco.lampara', 910, 122) + u('deco.lampara', 1300, 122)
        + u('deco.emergencia', 190, 150)
        + u('deco.ventana', 436, 140, 0.6)
        // Pedestal del modelo
        + E(568, 780, 124, 9, V.sombra) + K.Vol(450, 640, 220, 140, 10, V.verde, V.verdeS, 8) + R(462, 648, 90, 5, 2.5, V.verdeL)
        + u('bio.modelo', 470, 316)
        + u('mueble.meson', 700, 580, 1, { color: 'verde' })
        + u('lab.placas', 704, 540)
        + u('bio.gabinete', 1560, 380)
        + u('bio.frasco', 1592, 414, 0.88, { color: 'lima', tipo: 'hoja' }) + u('bio.frasco', 1676, 414, 0.88, { color: 'azul', tipo: 'concha' }) + u('bio.frasco', 1760, 414, 0.88, { color: 'amarillo' })
        + u('bio.frasco', 1592, 525, 0.88, { color: 'rosa', tipo: 'concha' }) + u('bio.frasco', 1676, 525, 0.88, { color: 'turquesa' }) + u('bio.frasco', 1760, 525, 0.88, { color: 'lima', tipo: 'hoja' })
        + u('inv.maceta', 1576, 240, 0.7, { tipo: 'helecho' })
        + u('mueble.estante', 1282, 466, 0.6) + u('bio.terrario', 1290, 300, 0.72);
    },
    examinar: {
      adn: { caja: [740, 200, 153, 221], arte: function () { return u('deco.adn', 740, 200, 0.85); } },
      cartelTincion: { caja: [914, 244, 120, 96], arte: function () { return u('deco.nota', 914, 244, 0.8); } },
      microscopio: { caja: [836, 362, 170, 220], arte: function () { return u('lab.microscopio', 836, 362); } }
    },
    dinamicos: function (v) { return u('bio.monitor', 1020, 362, 1, { encendido: v.usado }); },
    objetos: {
      portaobjetos: { x: 1296, y: 534, s: 1, arte: 'obj.portaobjetos' },
      tinte: { x: 1730, y: 282, s: 1, arte: 'obj.tinte' }
    },
    candados: [{ x: 510, y: 652 }, { x: 1660, y: 646 }, { x: 1412, y: 318 }, { x: 1090, y: 640 }],
    puerta: { x: 100, y: 220 }
  };

  // ------------------------------------------------------------------ FÍSICA

  def('fondo.fisica', 1920, 1080, function () {
    var s = A.sala({ pared: 'var(--pared-fisica)', paredS: 'var(--pared-fisica-s)', acento: V.naranja, piso: 'var(--piso-fisica)', pisoS: V.grisS });
    // Ladrillos sueltos
    [[80, 180], [300, 250], [150, 330], [960, 150], [1180, 470], [900, 520], [1700, 170], [1830, 420], [60, 520], [360, 480]].forEach(function (b) {
      s += R(b[0], b[1], 86, 30, 5, 'var(--pared-fisica-l)', 'opacity=".4"') + R(b[0] + 46, b[1] + 36, 86, 30, 5, 'var(--pared-fisica-l)', 'opacity=".25"');
    });
    s += L('M0 122 H1920', V.tintaL, 14) + L('M0 118 H1920', V.gris, 5);
    return s;
  }, 'Fondo del Taller de Física.');

  A.ESCENAS.fisica = {
    lamparas: [640, 1100],
    mobiliario: function () {
      return u('deco.lampara', 540, 122, 1, { color: 'naranja' }) + u('deco.lampara', 1000, 122, 1, { color: 'naranja' })
        + u('fis.engranajes', 930, 210)
        + u('fis.herramientas', 1236, 196, 0.72)
        + u('mueble.mesa', 420, 590)
        + u('fis.pesas', 730, 512) + u('fis.iman', 860, 502)
        + u('fis.generador', 990, 450)
        + u('fis.circuito', 1228, 400, 0.94)
        + u('fis.cajaHerr', 1250, 640, 0.95)
        + u('deco.emergencia', 1650, 150);
    },
    examinar: {
      pizarra: { caja: [420, 196, 432, 252], arte: function () { return u('fis.pizarra', 420, 196, 0.9); } },
      pendulo: { caja: [90, 360, 260, 420], arte: function () { return u('fis.pendulo', 90, 360); } },
      plano: { caja: [436, 470, 270, 124], arte: function () { return u('fis.plano', 436, 466, 0.75); } }
    },
    objetos: {},
    candados: [{ x: 1324, y: 636 }, { x: 1432, y: 424 }, { x: 1030, y: 640 }],
    puerta: { x: 1560, y: 220 }
  };

  // ------------------------------------------------------------------ SALA DE CONTROL

  def('fondo.control', 1920, 1080, function () {
    var s = A.sala({ pared: 'var(--pared-control)', paredS: 'var(--pared-control-s)', acento: V.violeta, piso: 'var(--piso-control)', pisoS: V.violetaS, zocalo: V.tintaS });
    s += R(0, 136, 1920, 8, 0, V.violeta, 'opacity=".55"') + R(0, 148, 1920, 3, 0, V.violetaL, 'opacity=".35"');
    // Guías luminosas en el piso
    s += P('M700 790 L560 1080 H620 L740 790 Z', V.violetaL, 'opacity=".22"') + P('M1220 790 L1360 1080 H1300 L1180 790 Z', V.violetaL, 'opacity=".22"');
    return s;
  }, 'Fondo de la Sala de Control.');

  A.ESCENAS.control = {
    lamparas: [320, 1340],
    mobiliario: function () {
      return u('deco.lampara', 220, 100, 1, { color: 'violeta' }) + u('deco.lampara', 1240, 100, 1, { color: 'violeta' })
        + u('ctl.servidor', 80, 300)
        + u('ctl.terminal', 350, 480)
        + u('ctl.consola', 600, 552)
        + u('ctl.silla', 1010, 720, 0.9)
        + u('ctl.cajaLlaves', 1376, 470, 0.9)
        + u('deco.emergencia', 1650, 150);
    },
    examinar: {
      pantalla: { caja: [600, 190, 520, 300], arte: function () { return u('ctl.pantalla', 600, 190); } },
      mapa: { caja: [1150, 200, 357, 255], arte: function () { return u('ctl.mapa', 1150, 200, 0.85); } }
    },
    objetos: {},
    candados: [{ x: 140, y: 470 }, { x: 760, y: 610 }, { x: 1424, y: 548 }, { x: 400, y: 644 }],
    puerta: { x: 1560, y: 220 }
  };

  // ------------------------------------------------------------------ INVERNADERO

  def('fondo.invernadero', 1920, 1080, function () {
    var s = A.sala({ pared: 'var(--pared-invernadero)', paredS: 'var(--pared-invernadero-s)', acento: V.lima, piso: 'var(--piso-invernadero)', pisoS: V.maderaS });
    // Cielo nocturno, luna y colinas tras el vidrio
    s += R(0, 100, 1920, 502, 0, 'var(--pared-invernadero)');
    s += C(1640, 250, 62, V.cremaL) + C(1618, 232, 12, V.cremaS) + C(1662, 272, 16, V.cremaS) + C(1650, 222, 7, V.cremaS) + C(1640, 250, 96, V.cremaL, 'opacity=".07"');
    [[120, 180, 3], [260, 300, 2], [420, 160, 2.5], [520, 380, 2], [690, 220, 3], [840, 150, 2], [980, 330, 2.5], [1120, 190, 2], [1260, 410, 2], [1380, 160, 3], [1480, 330, 2], [1800, 160, 2.5], [1850, 400, 2], [330, 460, 2], [1040, 480, 2.5]].forEach(function (p, i) {
      s += '<circle class="estrella" style="animation-delay:' + ((i * 0.6) % 4).toFixed(1) + 's" cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="' + V.cremaL + '"/>';
    });
    s += P('M0 602 V520 Q240 440 520 510 T1040 500 T1560 520 T1920 480 V602 Z', 'var(--pared-invernadero-s)');
    s += P('M1500 602 V200 L1920 60 V602 Z', V.cremaL, 'opacity=".035"');
    // Estructura de vidrio
    s += R(0, 100, 1920, 502, 0, V.vidrio, 'opacity=".05"');
    for (var x = 0; x <= 1920; x += 320) s += R(x - 7, 100, 14, 510, 0, V.metalS) + R(x - 7, 100, 5, 510, 0, V.metal);
    s += R(0, 340, 1920, 10, 0, V.metalS) + R(0, 96, 1920, 16, 0, V.metalS) + R(0, 96, 1920, 5, 0, V.metal);
    for (x = 20; x < 1920; x += 320) s += P('M' + x + ' 120 h90 l-90 120 z', V.blanco, 'opacity=".05"');
    // Zócalo de ladrillo
    s += R(0, 610, 1920, 160, 0, '#5B6B33');
    for (var f = 0; f < 4; f++) for (x = (f % 2 ? -60 : 0); x < 1920; x += 120) s += R(x + 3, 616 + f * 38, 112, 30, 5, '#6B7C3E', 'opacity=".55"');
    return s;
  }, 'Fondo del Invernadero (cielo nocturno tras el vidrio).');

  A.ESCENAS.invernadero = {
    lamparas: [],
    mobiliario: function () {
      return u('inv.colgante', 760, 108) + u('inv.colgante', 1140, 108, 0.9)
        + u('deco.emergencia', 190, 150)
        + u('inv.gabinete', 450, 420)
        + u('inv.maceta', 470, 284, 0.7, { tipo: 'cactus' }) + u('inv.maceta', 580, 270, 0.76, { tipo: 'hojas' })
        + u('inv.riego', 930, 296)
        + u('inv.mesaCultivo', 740, 550)
        + u('inv.regadera', 1150, 510, 0.95)
        + u('inv.semillas', 1560, 540)
        + u('inv.maceta', 1580, 400, 0.72, { tipo: 'helecho' }) + u('inv.maceta', 1716, 386, 0.78, { tipo: 'hojas', color: 'azul' });
    },
    examinar: {
      luna: { caja: [1540, 160, 200, 180], arte: function () { return ''; } },
      torre: { caja: [1340, 360, 180, 420], arte: function () { return u('inv.torre', 1340, 360); } }
    },
    objetos: {},
    candados: [{ x: 520, y: 540 }, { x: 1038, y: 348 }, { x: 1660, y: 600 }],
    puerta: { x: 100, y: 220 }
  };

  // ------------------------------------------------------------------ Compositor

  function marco(c) {
    var m = 12;
    return '<rect class="hot-marco" x="' + (c[0] - m) + '" y="' + (c[1] - m) + '" width="' + (c[2] + 2 * m) + '" height="' + (c[3] + 2 * m) + '" rx="18"/>';
  }

  function hot(accion, id, caja, etiqueta, inner, extraClase) {
    return '<g class="hot hot-' + accion + (extraClase ? ' ' + extraClase : '') + '" data-accion="' + accion + '" data-id="' + esc(id) + '" tabindex="0" role="button" aria-label="' + esc(etiqueta) + '">'
      + '<title>' + esc(etiqueta) + '</title><g class="hot-arte">' + inner + '</g>' + marco(caja) + '</g>';
  }

  function estadoCandado(c) {
    return c.oculto ? 'oculto' : c.estado === 'abierto' ? 'abierto' : c.fallos > 0 ? 'error' : 'cerrado';
  }
  var TEXTO_ESTADO = { oculto: 'sin energía', abierto: 'abierto', error: 'cerrado, ya tuvo un intento fallido', cerrado: 'cerrado' };

  /**
   * Capa de interactivos según el estado visible:
   * vista = { candados: [{estado, fallos, oculto}], recogidos: [], usado, rotulo, puertaAbierta, recien: idx|null, puertaAbriendo }
   */
  function interactivos(id, vista) {
    var art = A.ESCENAS[id], log = EA.ESCENAS[id];
    var s = art.dinamicos ? art.dinamicos(vista) : '';
    Object.keys(art.examinar || {}).forEach(function (k) {
      var ex = art.examinar[k];
      s += hot('examinar', k, ex.caja, 'Examinar: ' + log.examinar[k].nombre, ex.arte(vista));
    });
    // Puerta
    var p = art.puerta, ps = p.s || 1;
    var abiertos = vista.candados.filter(function (c) { return c.estado === 'abierto'; }).length;
    var clasePuerta = 'puerta' + (vista.puertaAbriendo ? ' abriendo' : vista.puertaAbierta ? ' abierta' : '');
    s += hot('puerta', 'puerta', [p.x + 6 * ps, p.y + 56 * ps, 288 * ps, 498 * ps], 'Puerta: ' + abiertos + ' de ' + vista.candados.length + ' candados abiertos',
      u('ui.puerta', p.x, p.y, ps, { acento: log.acento, rotulo: vista.rotulo, total: vista.candados.length, abiertos: abiertos }), clasePuerta);
    // Objetos del puzzle
    Object.keys(art.objetos || {}).forEach(function (k) {
      if (vista.recogidos.indexOf(k) >= 0) return;
      var o = art.objetos[k], c = A.REG[o.arte], sc = o.s || 1;
      var w = c.w * sc, h = c.h * sc, cw = Math.max(w, 110), ch = Math.max(h, 110);
      s += hot('objeto', k, [o.x - (cw - w) / 2, o.y - (ch - h) / 2, cw, ch], 'Recoger: ' + log.puzzle.objetos[k].nombre, u(o.arte, o.x, o.y, sc));
    });
    // Candados
    art.candados.forEach(function (pos, i) {
      var c = vista.candados[i], e = estadoCandado(c);
      s += hot('candado', String(i), [pos.x - 8, pos.y - 8, 116, 136], 'Candado ' + (i + 1) + ': ' + log.candados[i] + ', ' + TEXTO_ESTADO[e],
        u('ui.candado', pos.x, pos.y, 1, { estado: e, numero: i + 1 }), 'candado-' + e + (vista.recien === i ? ' recien' : ''));
    });
    return s;
  }

  function componer(id, vista) {
    var art = A.ESCENAS[id], log = EA.ESCENAS[id];
    return '<svg class="escena escena-' + id + '" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" role="group" aria-label="' + esc(log.nombre) + '">'
      + '<g class="capa-fondo">' + u('fondo.' + id, 0, 0) + '</g>'
      + '<g class="capa-mobiliario">' + art.mobiliario(vista) + '</g>'
      + '<g class="capa-interactivos">' + interactivos(id, vista) + '</g>'
      + '<g class="capa-luces" pointer-events="none">' + A.luces(art.lamparas || [], id) + '</g>'
      + '</svg>';
  }

  /** Vista "limpia" de una escena (para menús, editor y capturas). */
  function vistaDemo(id, abiertos) {
    var log = EA.ESCENAS[id];
    return {
      candados: log.candados.map(function (_, i) {
        return { estado: i < (abiertos || 0) ? 'abierto' : 'cerrado', fallos: 0, oculto: !!(log.puzzle && log.puzzle.revela === i) && !(i < (abiertos || 0)) };
      }),
      recogidos: [], usado: false, rotulo: 'SALIDA', puertaAbierta: false, recien: null, puertaAbriendo: false
    };
  }

  A.componer = componer;
  A.interactivos = interactivos;
  A.vistaDemo = vistaDemo;
})(window.EA = window.EA || {});
