/*
 * Biblioteca de arte — base.
 * Cada componente se registra con un identificador y una caja nominal (ancho × alto)
 * y es una función que devuelve SVG dibujado con origen en la esquina superior izquierda.
 * Todo obedece docs/ARTE.md (paleta, luz arriba-izquierda, sin contornos negros).
 */
(function (EA) {
  'use strict';

  var REG = {};
  function def(id, w, h, dibujar, nota) { REG[id] = { id: id, w: w, h: h, dibujar: dibujar, nota: nota || '' }; }

  // Colores de la paleta como variables CSS: V.azul, V.azulS (sombra), V.azulL (luz)
  var V = {};
  ['tinta', 'crema', 'azul', 'turquesa', 'verde', 'lima', 'amarillo', 'naranja', 'coral', 'violeta', 'rosa', 'gris', 'madera', 'metal']
    .forEach(function (n) { V[n] = 'var(--' + n + ')'; V[n + 'S'] = 'var(--' + n + '-s)'; V[n + 'L'] = 'var(--' + n + '-l)'; });
  V.vidrio = 'var(--vidrio)';
  V.sombra = 'var(--sombra)';
  V.brillo = 'var(--brillo)';
  V.blanco = '#FFFFFF';

  // ---- Primitivas ----
  function at(o) { return o ? ' ' + o : ''; }
  function R(x, y, w, h, rx, f, o) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + f + '"' + at(o) + '/>'; }
  function C(x, y, r, f, o) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + at(o) + '/>'; }
  function E(x, y, rx, ry, f, o) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + at(o) + '/>'; }
  function P(d, f, o) { return '<path d="' + d + '" fill="' + f + '"' + at(o) + '/>'; }
  function L(d, s, w, o) { return '<path d="' + d + '" fill="none" stroke="' + s + '" stroke-width="' + (w || 4) + '" stroke-linecap="round" stroke-linejoin="round"' + at(o) + '/>'; }
  function T(x, y, txt, tam, f, o) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + tam + '" fill="' + f + '" text-anchor="middle" font-weight="800"' + at(o) + '>' + EA.util.escapar(txt) + '</text>';
  }
  function G(inner, o) { return '<g' + at(o) + '>' + inner + '</g>'; }
  /** Volumen con borde inferior en sombra (truco de "canto"). */
  function Vol(x, y, w, h, rx, f, fs, canto) {
    canto = canto == null ? 6 : canto;
    return R(x, y + canto, w, h - canto, rx, fs) + R(x, y, w, h - canto, rx, f);
  }
  function sombraPiso(cx, y, rx) { return E(cx + 8, y, rx, Math.max(6, rx * 0.07), V.sombra); }

  var K = { V: V, R: R, C: C, E: E, P: P, L: L, T: T, G: G, Vol: Vol, sombraPiso: sombraPiso, def: def };

  /**
   * Dibuja un componente del registro en (x, y) con escala s.
   * Si el docente definió un reemplazo en js/art/registro.js, se usa su imagen.
   */
  function usar(id, x, y, s, opts) {
    var c = REG[id];
    if (!c) return '';
    var rep = (EA.ARTE_REEMPLAZOS || {})[id];
    var inner;
    if (typeof rep === 'string' && rep) {
      var href = /^\s*<svg/i.test(rep) ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(rep) : rep;
      inner = '<image href="' + EA.util.escapar(href) + '" width="' + c.w + '" height="' + c.h + '" preserveAspectRatio="xMidYMid meet"/>';
    } else {
      inner = c.dibujar(opts || {});
    }
    return '<g transform="translate(' + x + ' ' + y + ')' + (s && s !== 1 ? ' scale(' + s + ')' : '') + '">' + inner + '</g>';
  }

  /** SVG suelto de un componente (para inventario, menús y galería). */
  function suelto(id, opts, clase) {
    var c = REG[id];
    if (!c) return '';
    return '<svg class="' + (clase || 'arte-suelto') + '" viewBox="0 0 ' + c.w + ' ' + c.h + '" aria-hidden="true" focusable="false">' + usar(id, 0, 0, 1, opts) + '</svg>';
  }

  // ---- Íconos de interfaz (24×24, trazo con currentColor) ----
  var ICONOS = {
    sonido: 'M4 9h4l5-4v14l-5-4H4z|M16.5 9a4.5 4.5 0 0 1 0 6|M19 6.5a8 8 0 0 1 0 11',
    silencio: 'M4 9h4l5-4v14l-5-4H4z|M16.5 9.5l5 5|M21.5 9.5l-5 5',
    pantalla: 'M4 9V4h5|M15 4h5v5|M20 15v5h-5|M9 20H4v-5',
    salirPantalla: 'M9 4v5H4|M15 4v5h5|M20 15h-5v5|M4 15h5v5',
    pausa: '#M6 5h4v14H6z|#M14 5h4v14h-4z',
    play: '#M7 4l13 8-13 8z',
    ayuda: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z|M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8|M12 17v.2',
    check: 'M4 12.5l5 5L20 6.5',
    cruz: 'M6 6l12 12|M18 6L6 18',
    candado: 'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z|M8 11V8a4 4 0 0 1 8 0v3',
    casa: 'M3 11l9-7 9 7|M5 10v10h14V10',
    reloj: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z|M12 7v5l3 2',
    flecha: 'M5 12h14|M13 6l6 6-6 6',
    flechaIzq: 'M19 12H5|M11 6l-6 6 6 6',
    arriba: 'M12 19V5|M6 11l6-6 6 6',
    abajo: 'M12 5v14|M6 13l6 6 6-6',
    mas: 'M12 5v14|M5 12h14',
    menos: 'M5 12h14',
    editar: 'M4 20h4L19 9l-4-4L4 16z',
    copiar: 'M9 8h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z|M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3',
    basura: 'M4 7h16|M9 7V4h6v3|M6 7l1 13h10l1-13',
    descargar: 'M12 4v11|M7 11l5 5 5-5|M4 20h16',
    subir: 'M12 16V5|M7 9l5-5 5 5|M4 20h16',
    bombilla: 'M9 18h6|M10 21h4|M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z',
    libro: 'M4 19V5a2 2 0 0 1 2-2h13v14H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13|M8 7h7',
    bandera: 'M5 21V4|M5 4h13l-3 4 3 4H5',
    ojo: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z|M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    rayo: '#M13 2L4 14h7l-1 8 9-12h-7z',
    estrella: '#M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z',
    salida: 'M14 4h5v16h-5|M4 12h10|M10 8l4 4-4 4',
    mochila: 'M7 8h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z|M9 8V6a3 3 0 0 1 6 0v2|M9 14h6',
    triangulo: '#M12 3l10 18H2z',
    circulo: '#M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
    cuadrado: '#M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z',
    rombo: '#M12 2l10 10-10 10L2 12z'
  };

  function icono(nombre, tam) {
    var def_ = ICONOS[nombre] || '';
    var cuerpo = def_.split('|').map(function (d) {
      if (d.charAt(0) === '#') return '<path d="' + d.slice(1) + '" fill="currentColor" stroke="none"/>';
      return '<path d="' + d + '"/>';
    }).join('');
    tam = tam || 32;
    return '<svg class="icono" width="' + tam + '" height="' + tam + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + cuerpo + '</svg>';
  }

  // =====================================================================
  //  INTERFAZ: candado, puerta, robot
  // =====================================================================

  def('ui.candado', 100, 120, function (o) {
    var e = o.estado || 'cerrado';
    var col = e === 'abierto' ? 'verde' : e === 'error' ? 'coral' : e === 'oculto' ? 'gris' : 'amarillo';
    var s = '';
    if (e === 'cerrado' || e === 'error') s += '<circle class="candado-pulso" cx="50" cy="78" r="60" fill="none" stroke="' + V[col + 'L'] + '" stroke-width="5"/>';
    s += E(56, 116, 40, 6, V.sombra);
    // Arco
    var arco = e === 'abierto' ? 'M28 36 V28 a22 22 0 0 1 44 0 V58' : 'M28 58 V40 a22 22 0 0 1 44 0 V58';
    s += G(L(arco, V.metalS, 13) + L(arco, V.metalL, 5, 'transform="translate(-2 -2)"'), 'class="candado-arco"');
    // Cuerpo
    s += Vol(10, 52, 80, 62, 14, V[col], V[col + 'S'], 6) + R(18, 60, 6, 22, 3, V[col + 'L']);
    if (e === 'abierto') {
      s += L('M33 80 l12 12 l22 -24', V.cremaL, 9);
    } else if (e === 'oculto') {
      s += P('M54 60 L38 84 h10 l-3 18 l17 -25 h-10 z', V.grisS) + L('M32 100 L70 62', V.cremaL, 5);
    } else {
      s += T(50, 93, o.numero != null ? o.numero : '', 36, V.tinta);
      if (e === 'error') s += C(86, 50, 15, V.cremaL) + T(86, 59, '!', 26, V.coralS);
    }
    return s;
  }, 'Candado. Opciones: estado (cerrado | abierto | error | oculto), numero.');

  def('ui.puerta', 300, 560, function (o) {
    var ac = o.acento || 'turquesa';
    var total = o.total || 4, abiertos = o.abiertos || 0;
    var s = E(158, 558, 160, 9, V.sombra);
    // Rótulo
    s += Vol(50, 0, 200, 48, 12, V.tinta, V.tintaS, 4) + T(150, 31, o.rotulo || 'SALIDA', 24, V.cremaL, 'letter-spacing="2"');
    // Marco
    s += R(0, 56, 300, 504, 14, V[ac + 'S']) + R(0, 56, 290, 504, 14, V[ac]) + R(0, 56, 300, 8, 4, V[ac + 'L'], 'opacity=".6"');
    // Luces de avance (una por candado)
    for (var i = 0; i < total; i++) {
      var x = 150 + (i - (total - 1) / 2) * 34;
      s += C(x, 80, 11, V.tintaS) + '<circle class="puerta-luz' + (i < abiertos ? ' on' : '') + '" data-luz="' + i + '" cx="' + x + '" cy="80" r="8"/>';
    }
    // Vano
    s += R(22, 100, 256, 460, 4, V.tintaS);
    s += '<g class="puerta-interior">' + P('M22 560 L22 100 L278 100 L278 560 Z', V.cremaL, 'opacity=".16"') + P('M90 560 L120 250 L180 250 L210 560 Z', V.cremaL, 'opacity=".22"') + '</g>';
    // Hojas (recortadas al vano)
    var hoja = function (x, clase, espejo) {
      var h = R(x, 100, 128, 460, 0, V.metal) + R(x, 100, 128, 10, 0, V.metalL)
        + R(x + 24, 150, 80, 150, 12, V.tintaL) + P('M' + (x + 34) + ' 160 h26 l-26 60 z', V.blanco, 'opacity=".14"')
        + R(x + 24, 340, 80, 8, 4, V.metalS) + R(x + 24, 362, 80, 8, 4, V.metalS)
        + R(x, 500, 128, 60, 0, V.metalS)
        + P('M' + (x + 8) + ' 548 l24 -36 h20 l-24 36 z M' + (x + 52) + ' 548 l24 -36 h20 l-24 36 z M' + (x + 96) + ' 548 l24 -36 h8 v18 l-12 18 z', V.amarillo);
      h += espejo ? R(x, 100, 5, 460, 0, V.metalS) : R(x + 123, 100, 5, 460, 0, V.metalS);
      return '<g class="' + clase + '">' + h + '</g>';
    };
    s += '<clipPath id="recorte-puerta"><rect x="22" y="100" width="256" height="460"/></clipPath>';
    s += '<g clip-path="url(#recorte-puerta)">' + hoja(22, 'hoja-izq', false) + hoja(150, 'hoja-der', true) + '</g>';
    return s;
  }, 'Puerta corrediza. Opciones: acento, rotulo, total, abiertos.');

  def('ui.robot', 200, 240, function (o) {
    var ex = o.expresion || 'neutral';
    var cara = V.turquesaL;
    var s = '<g class="robot-flota">';
    s += '<ellipse class="robot-propulsor" cx="100" cy="230" rx="30" ry="7" fill="' + V.turquesaL + '"/>';
    // Brazos
    if (ex === 'contento') {
      s += L('M56 178 q-30 -8 -30 -36', V.metalS, 9) + C(26, 138, 11, V.turquesa) + L('M144 178 q30 -8 30 -36', V.metalS, 9) + C(174, 138, 11, V.turquesaS);
    } else if (ex === 'pensando') {
      s += L('M56 182 q-24 8 -22 30', V.metalS, 9) + C(34, 214, 11, V.turquesa) + L('M144 180 q26 -4 18 -30', V.metalS, 9) + C(160, 148, 11, V.turquesaS);
    } else {
      s += L('M56 182 q-24 8 -22 30', V.metalS, 9) + C(34, 214, 11, V.turquesa) + L('M144 182 q24 8 22 30', V.metalS, 9) + C(166, 214, 11, V.turquesaS);
    }
    // Cuerpo
    s += R(86, 148, 28, 16, 4, V.metalS) + Vol(52, 160, 96, 64, 26, V.crema, V.cremaS, 6);
    s += C(100, 190, 14, V.turquesaS) + '<circle class="robot-luz" cx="100" cy="190" r="9" fill="' + V.turquesaL + '"/>';
    // Antena
    s += L('M100 42 V20', V.metalS, 6) + '<circle class="robot-luz" cx="100" cy="14" r="10" fill="' + V.amarillo + '"/>' + C(97, 11, 3, V.amarilloL);
    // Cabeza
    s += R(14, 76, 20, 40, 9, V.turquesa) + R(166, 76, 20, 40, 9, V.turquesaS);
    s += Vol(28, 38, 144, 116, 36, V.crema, V.cremaS, 7) + R(44, 46, 60, 8, 4, V.cremaL);
    s += R(46, 58, 108, 76, 24, V.tinta);
    if (ex === 'contento') {
      s += L('M68 96 q11 -16 22 0', cara, 7) + L('M110 96 q11 -16 22 0', cara, 7) + P('M82 106 h36 a18 16 0 0 1 -36 0 z', cara);
    } else if (ex === 'pensando') {
      s += C(84, 86, 10, cara) + C(124, 86, 10, cara) + C(87, 83, 4, V.tinta) + C(127, 83, 4, V.tinta) + L('M90 116 h20', cara, 6);
      s += '<g class="robot-puntos">' + C(178, 34, 6, V.cremaL) + C(190, 18, 8, V.cremaL) + '</g>';
    } else {
      s += C(80, 92, 11, cara) + C(120, 92, 11, cara) + L('M88 114 q12 9 24 0', cara, 6);
    }
    return s + '</g>';
  }, 'Asistente robot «Volti». Opciones: expresion (neutral | pensando | contento).');

  // =====================================================================
  //  FONDOS: constructor de sala
  // =====================================================================

  /** Pared + zócalo + piso en perspectiva suave. */
  function sala(o) {
    var s = R(0, 0, 1920, 790, 0, o.pared);
    s += R(0, 0, 1920, 100, 0, o.paredS);                       // franja del techo
    s += R(0, 610, 1920, 180, 0, o.paredS) + R(0, 602, 1920, 10, 0, o.acento); // zócalo + franja de acento
    // Paneles sutiles en la pared
    for (var x = 240; x < 1920; x += 480) s += R(x, 100, 4, 502, 0, o.paredS, 'opacity=".55"');
    s += R(0, 780, 1920, 300, 0, o.piso);
    // Líneas del piso
    var k, lineas = '';
    for (k = -6; k <= 6; k++) lineas += 'M' + (960 + k * 170) + ' 790 L' + (960 + k * 380) + ' 1080 ';
    lineas += 'M0 836 H1920 M0 910 H1920 M0 1010 H1920';
    s += L(lineas, o.pisoS, 3, 'opacity=".5"');
    s += R(0, 768, 1920, 22, 0, o.zocalo || V.tintaL) + R(0, 790, 1920, 16, 0, V.sombra);
    return s;
  }

  /** Luces de la escena: conos bajo lámparas y viñeta. xs = posiciones x de las lámparas. */
  function luces(xs, id) {
    var s = '<defs><radialGradient id="vin-' + id + '" cx="50%" cy="46%" r="72%"><stop offset="62%" stop-color="#141931" stop-opacity="0"/><stop offset="100%" stop-color="#141931" stop-opacity=".5"/></radialGradient></defs>';
    xs.forEach(function (x) {
      s += P('M' + (x - 70) + ' 166 L' + (x + 70) + ' 166 L' + (x + 330) + ' 790 L' + (x - 330) + ' 790 Z', V.blanco, 'opacity=".055"');
      s += E(x, 860, 380, 60, V.blanco, 'opacity=".07"');
    });
    s += '<rect width="1920" height="1080" fill="url(#vin-' + id + ')"/>';
    return s;
  }

  def('deco.lampara', 200, 60, function (o) {
    return R(92, 0, 16, 16, 0, V.tintaL) + P('M30 44 Q100 -8 170 44 Z', V[o.color || 'metal'])
      + P('M30 44 Q60 14 100 8 Q70 20 52 44 Z', V.blanco, 'opacity=".25"')
      + '<ellipse class="luz-lampara" cx="100" cy="46" rx="66" ry="9" fill="' + V.amarilloL + '"/>';
  }, 'Lámpara de techo.');

  def('deco.emergencia', 120, 50, function () {
    return Vol(0, 0, 120, 50, 10, V.metal, V.metalS, 5)
      + '<rect class="luz-emergencia" x="10" y="9" width="44" height="26" rx="8" fill="' + V.coral + '"/>'
      + '<rect class="luz-emergencia" x="66" y="9" width="44" height="26" rx="8" fill="' + V.coral + '"/>';
  }, 'Luz de emergencia.');

  def('deco.ventana', 300, 260, function () {
    var s = R(0, 0, 300, 260, 16, V.metalS) + R(14, 14, 272, 232, 8, 'var(--tinta-s)');
    s += C(214, 78, 30, V.cremaL) + C(226, 70, 28, 'var(--tinta-s)');
    [[50, 50, 3], [96, 104, 2], [140, 46, 2.5], [70, 160, 2], [180, 150, 3], [250, 180, 2], [120, 200, 2.5], [36, 110, 2]].forEach(function (p, i) {
      s += '<circle class="estrella" style="animation-delay:' + (i * 0.7) + 's" cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="' + V.cremaL + '"/>';
    });
    s += R(144, 14, 12, 232, 0, V.metalS) + R(14, 124, 272, 12, 0, V.metalS);
    s += P('M26 26 h70 l-70 90 z', V.blanco, 'opacity=".08"') + R(-10, 252, 320, 14, 6, V.metal);
    return s;
  }, 'Ventana con cielo nocturno.');

  def('deco.reloj', 90, 90, function () {
    return C(45, 45, 45, V.metalS) + C(45, 45, 38, V.cremaL) + L('M45 45 V22', V.tinta, 5) + L('M45 45 L62 54', V.coral, 4) + C(45, 45, 5, V.tinta);
  }, 'Reloj de pared.');

  EA.arte = {
    REG: REG, K: K, V: V, def: def, usar: usar, suelto: suelto, icono: icono, sala: sala, luces: luces,
    ESCENAS: {}
  };
})(window.EA = window.EA || {});
