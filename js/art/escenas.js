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
    var s = '';
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
