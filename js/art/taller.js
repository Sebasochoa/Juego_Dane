/* Biblioteca de arte — Taller de Física, Sala de control e Invernadero. */
(function (EA) {
  'use strict';
  var A = EA.arte, K = A.K, V = K.V, R = K.R, C = K.C, E = K.E, P = K.P, L = K.L, T = K.T, G = K.G, Vol = K.Vol, def = K.def;
  var MONO = 'font-family="var(--fuente-mono)"';

  // ================================================================= FÍSICA

  def('mueble.mesa', 520, 190, function () {
    var s = E(268, 188, 262, 9, V.sombra);
    s += R(26, 30, 26, 158, 4, V.maderaS) + R(468, 30, 26, 158, 4, V.maderaS) + R(26, 30, 12, 158, 4, V.madera) + R(468, 30, 12, 158, 4, V.madera);
    s += R(52, 120, 416, 16, 4, V.maderaS) + Vol(70, 100, 380, 26, 4, V.metal, V.metalS, 5);
    s += Vol(0, 0, 520, 34, 8, V.madera, V.maderaS, 9) + R(12, 4, 230, 5, 2.5, V.maderaL);
    return s;
  }, 'Mesa de taller.');

  def('fis.pizarra', 480, 280, function () {
    var s = Vol(0, 0, 480, 280, 12, V.madera, V.maderaS, 8) + R(14, 14, 452, 240, 6, '#2F4A45') + P('M14 14 h120 l-120 150 z', V.blanco, 'opacity=".05"');
    s += T(120, 74, 'F = m · a', 44, V.cremaL, 'font-style="italic"');
    s += L('M40 104 h160', V.amarilloL, 4, 'opacity=".8"');
    s += T(120, 150, 'v = d / t', 34, V.cremaL, 'font-style="italic" opacity=".85"');
    // Tiro parabólico
    s += L('M250 224 h200 M250 224 v-170', V.cremaL, 4, 'opacity=".8"');
    s += L('M252 222 Q346 -30 440 222', V.naranjaL, 5, 'stroke-dasharray="12 9"');
    s += C(346, 96, 9, V.naranja) + L('M346 96 h46 m-10 -8 l10 8 l-10 8', V.cremaL, 4) + L('M346 96 v44 m-8 -10 l8 10 l8 -10', V.coralL, 4);
    s += T(402, 86, 'v', 24, V.cremaL, 'font-style="italic"') + T(366, 150, 'g', 24, V.coralL, 'font-style="italic"');
    s += R(150, 258, 60, 12, 4, V.cremaL) + R(230, 258, 40, 12, 4, V.gris);
    return s;
  }, 'Pizarra con fórmulas y tiro parabólico.');

  def('fis.pendulo', 260, 420, function () {
    var s = E(138, 416, 120, 8, V.sombra);
    s += L('M40 412 L118 22 M220 412 L142 22', V.metalS, 14) + L('M36 410 L114 22', V.metal, 5);
    s += Vol(20, 400, 220, 18, 8, V.tintaL, V.tinta, 5) + Vol(96, 8, 68, 26, 10, V.naranja, V.naranjaS, 6);
    s += '<g class="pendulo-brazo">' + R(128, 30, 4, 250, 2, V.cremaL) + C(130, 296, 34, V.naranjaS) + C(127, 293, 31, V.naranja) + E(116, 280, 10, 6, V.naranjaL) + '</g>';
    s += C(130, 28, 8, V.tinta);
    return s;
  }, 'Péndulo simple (animado).');

  function engranaje(cx, cy, r, dientes, col, clase) {
    var d = '';
    for (var i = 0; i < dientes; i++) d += '<rect x="' + (cx - r * 0.14) + '" y="' + (cy - r * 1.2) + '" width="' + (r * 0.28) + '" height="' + (r * 0.5) + '" rx="' + (r * 0.06) + '" fill="' + V[col + 'S'] + '" transform="rotate(' + (i * 360 / dientes) + ' ' + cx + ' ' + cy + ')"/>';
    return '<g class="engranaje' + (clase ? ' ' + clase : '') + '">' + d + C(cx, cy, r, V[col + 'S']) + C(cx - 2, cy - 2, r - 3, V[col]) + C(cx, cy, r * 0.56, V[col + 'S'], 'opacity=".5"')
      + C(cx, cy, r * 0.2, V.tinta) + R(cx - r * 0.07, cy - r * 0.75, r * 0.14, r * 0.5, 2, V[col + 'L'], 'opacity=".7"') + '</g>';
  }

  def('fis.engranajes', 260, 200, function () {
    return Vol(0, 0, 260, 200, 14, V.tintaL, V.tinta, 7) + engranaje(86, 104, 56, 10, 'naranja') + engranaje(186, 70, 34, 8, 'amarillo', 'inv') + engranaje(196, 148, 24, 6, 'metal');
  }, 'Tablero de engranajes (animado).');

  def('fis.plano', 360, 170, function () {
    var s = E(186, 168, 176, 6, V.sombra);
    s += P('M10 164 L350 164 L350 40 Z', V.maderaS) + P('M10 164 L350 164 L350 52 Z', V.madera) + L('M40 156 L340 58', V.maderaL, 4, 'opacity=".7"');
    s += L('M74 164 A64 64 0 0 0 68 138', V.tinta, 4) + T(104, 158, '20°', 22, V.tinta);
    // Carrito sobre la rampa
    s += G(Vol(-44, -40, 88, 34, 8, V.azul, V.azulS, 6) + R(-34, -34, 30, 6, 3, V.azulL) + C(-24, 2, 13, V.tinta) + C(24, 2, 13, V.tinta) + C(-24, 2, 5, V.metal) + C(24, 2, 5, V.metal), 'transform="translate(230 80) rotate(-18.5)"');
    s += L('M258 44 L326 21', V.cremaL, 3) + C(336, 24, 14, V.metalS) + C(336, 24, 6, V.tinta);
    return s;
  }, 'Plano inclinado con carrito.');

  def('fis.circuito', 320, 220, function () {
    var s = Vol(0, 0, 320, 220, 14, V.verdeS, '#28603A', 8) + R(12, 10, 110, 5, 2.5, V.verde);
    s += L('M40 60 H170 V110 M170 150 V180 H40 V130 M40 96 V60', V.amarilloL, 5);
    // Pila
    s += R(22, 96, 36, 34, 5, V.tinta) + R(22, 96, 36, 12, 5, V.coral) + T(40, 124, '+', 18, V.cremaL);
    // Foco
    s += '<circle class="pantalla-viva" cx="110" cy="56" r="24" fill="' + V.amarillo + '"/>' + C(110, 56, 14, V.amarilloL) + R(100, 76, 20, 10, 3, V.metalS);
    // Resistencia e interruptor
    s += R(152, 110, 36, 40, 6, V.crema) + R(152, 118, 36, 5, 0, V.coral) + R(152, 128, 36, 5, 0, V.violeta) + R(152, 138, 36, 5, 0, V.naranja);
    s += C(86, 180, 7, V.metalL) + C(126, 180, 7, V.metalL) + L('M86 180 L122 162', V.metalL, 6);
    // Zona del candado
    s += R(208, 16, 96, 188, 10, V.tinta, 'opacity=".35"') + T(256, 196, 'CIRCUITO', 14, V.verdeL, MONO);
    return s;
  }, 'Tablero de circuitos.');

  def('fis.generador', 180, 330, function () {
    var s = E(98, 326, 76, 7, V.sombra);
    s += '<g>' + L('M30 60 l-22 -14 l14 -2 l-16 -14', V.amarilloL, 5, 'class="chispa"') + L('M150 58 l22 -16 l-14 -1 l15 -15', V.amarilloL, 5, 'class="chispa"') + '</g>';
    s += R(74, 120, 32, 170, 0, V.vidrio, 'opacity=".5"') + R(84, 120, 8, 170, 0, V.coral, 'opacity=".8"') + R(74, 120, 8, 170, 0, V.blanco, 'opacity=".3"');
    s += C(90, 74, 62, V.metalS) + C(86, 70, 58, V.metal) + E(64, 46, 20, 12, V.metalL, 'transform="rotate(-30 64 46)"');
    s += Vol(40, 282, 100, 44, 12, V.naranja, V.naranjaS, 8) + C(64, 300, 7, V.tinta) + R(84, 294, 40, 10, 5, V.tinta);
    return s;
  }, 'Generador electrostático (Van de Graaff).');

  def('fis.herramientas', 420, 260, function () {
    var s = Vol(0, 0, 420, 260, 12, V.maderaL, V.maderaS, 7), x, y;
    for (y = 30; y < 250; y += 36) for (x = 30; x < 410; x += 36) s += C(x, y, 3.5, V.maderaS);
    // Llave, martillo, destornillador, alicate, regla
    s += G(R(-9, -70, 18, 140, 6, V.metal) + C(0, -76, 24, V.metal) + P('M-10 -100 h20 v24 h-20 z', V.maderaL) + C(0, 76, 16, V.metal) + C(0, 76, 7, V.maderaL), 'transform="translate(70 126) rotate(18)"');
    s += R(150, 60, 16, 170, 6, V.madera) + R(124, 40, 70, 40, 8, V.metalS) + R(124, 40, 70, 12, 6, V.metal);
    s += R(232, 130, 22, 100, 10, V.coral) + R(239, 44, 8, 90, 2, V.metal) + R(232, 130, 8, 100, 4, V.coralL, 'opacity=".5"');
    s += L('M300 50 L318 140 M336 50 L318 140', V.metalS, 12) + L('M318 140 L300 226 M318 140 L338 226', V.azul, 14) + C(318, 140, 8, V.tinta);
    s += R(374, 40, 22, 190, 4, V.amarillo) + L('M374 60 h10 M374 80 h14 M374 100 h10 M374 120 h14 M374 140 h10 M374 160 h14 M374 180 h10 M374 200 h14', V.tinta, 3);
    return s;
  }, 'Panel de herramientas.');

  def('fis.cajaHerr', 260, 170, function () {
    var s = E(138, 168, 130, 7, V.sombra) + L('M84 44 V20 Q84 8 96 8 H164 Q176 8 176 20 V44', V.tintaL, 12);
    s += Vol(0, 40, 260, 128, 14, V.coral, V.coralS, 9) + R(0, 84, 260, 10, 0, V.coralS) + R(14, 48, 100, 6, 3, V.coralL);
    s += Vol(30, 72, 34, 34, 6, V.metal, V.metalS, 4) + Vol(196, 72, 34, 34, 6, V.metal, V.metalS, 4);
    return s;
  }, 'Caja de herramientas.');

  def('fis.iman', 90, 90, function () {
    return E(48, 88, 36, 4, V.sombra) + L('M22 70 V40 a23 23 0 0 1 46 0 V70', V.coral, 22, 'stroke-linecap="butt"') + R(11, 62, 22, 22, 2, V.metalL) + R(57, 62, 22, 22, 2, V.metalL)
      + L('M16 44 a29 29 0 0 1 14 -24', V.coralL, 4, 'opacity=".7"');
  }, 'Imán de herradura.');

  def('fis.pesas', 150, 80, function () {
    return E(78, 78, 70, 4, V.sombra) + Vol(4, 30, 52, 48, 8, V.metalS, V.grisS, 6) + R(22, 18, 16, 16, 4, V.grisS) + T(30, 64, '1 kg', 15, V.tinta)
      + Vol(62, 44, 40, 34, 7, V.metalS, V.grisS, 5) + R(75, 34, 14, 14, 4, V.grisS) + Vol(108, 54, 30, 24, 6, V.metalS, V.grisS, 4) + R(117, 46, 12, 12, 4, V.grisS);
  }, 'Juego de pesas.');

  // ================================================================= SALA DE CONTROL

  def('ctl.pantalla', 520, 300, function () {
    var s = Vol(0, 0, 520, 300, 16, V.tintaL, V.tintaS, 8) + R(14, 14, 492, 262, 8, '#161A3A');
    var x, y, g = '';
    for (x = 60; x < 500; x += 62) g += 'M' + x + ' 30 V230 ';
    for (y = 60; y < 240; y += 44) g += 'M30 ' + y + ' H490 ';
    s += L(g, V.violeta, 2, 'opacity=".35"');
    s += L('M30 74 L110 66 L170 80 L230 62 L262 70 L280 196 L330 204 L380 190 L440 200 L490 194', V.verdeL, 6, 'class="grafica-linea" pathLength="600"');
    s += R(266, 30, 3, 200, 0, V.coral) + R(276, 34, 150, 30, 6, V.coral) + T(351, 56, 'APAGÓN', 20, V.tintaS, MONO);
    s += T(92, 262, 'ENERGÍA', 20, V.violetaL, MONO) + '<rect class="led" x="160" y="246" width="50" height="16" rx="5" fill="' + V.amarillo + '"/>' + T(400, 262, 'RESPALDO 38 %', 20, V.amarilloL, MONO);
    s += P('M14 14 h150 l-150 120 z', V.blanco, 'opacity=".04"');
    return s;
  }, 'Pantalla mural: monitor de energía.');

  def('ctl.mapa', 420, 300, function () {
    var s = Vol(0, 0, 420, 300, 16, V.tintaL, V.tintaS, 8) + R(14, 14, 392, 262, 8, '#161A3A');
    var salas = [[34, 40, 110, 86, 'turquesa'], [154, 40, 110, 86, 'verde'], [274, 40, 112, 86, 'naranja'], [34, 150, 150, 96, 'violeta'], [214, 150, 172, 96, 'lima']];
    salas.forEach(function (c, i) {
      s += R(c[0], c[1], c[2], c[3], 8, V[c[4] + 'S'], 'opacity=".55"') + '<rect x="' + c[0] + '" y="' + c[1] + '" width="' + c[2] + '" height="' + c[3] + '" rx="8" fill="none" stroke="' + V[c[4] + 'L'] + '" stroke-width="3"/>';
      s += '<rect class="led" style="animation-delay:' + (i * 0.3) + 's" x="' + (c[0] + c[2] - 9) + '" y="' + (c[1] + c[3] / 2 - 12) + '" width="16" height="24" rx="4" fill="' + V.coral + '"/>';
    });
    s += R(144, 126, 10, 24, 0, V.violetaL, 'opacity=".5"') + R(184, 190, 30, 10, 0, V.violetaL, 'opacity=".5"');
    s += T(210, 268, 'INSTITUTO AURORA', 17, V.violetaL, MONO + ' letter-spacing="3"');
    return s;
  }, 'Pantalla mural: mapa del instituto.');

  def('ctl.consola', 760, 230, function () {
    var s = E(388, 228, 384, 9, V.sombra);
    s += R(30, 70, 700, 158, 8, V.tintaS) + R(30, 70, 690, 150, 8, V.tintaL) + R(60, 110, 200, 96, 8, V.tinta) + R(500, 110, 200, 96, 8, V.tinta) + R(60, 118, 200, 8, 0, V.violeta) + R(500, 118, 200, 8, 0, V.violeta);
    s += P('M0 84 L40 0 H720 L760 84 Z', V.metalS) + P('M10 76 L46 6 H714 L750 76 Z', V.metal) + P('M46 6 H400 L380 18 H52 Z', V.metalL, 'opacity=".7"');
    // Pantallitas y controles
    s += R(70, 16, 120, 48, 6, '#161A3A') + L('M80 50 l20 -16 l18 10 l22 -20 l26 14', V.turquesaL, 4) + R(560, 16, 130, 48, 6, '#161A3A') + R(572, 40, 14, 16, 2, V.violetaL) + R(594, 30, 14, 26, 2, V.violetaL) + R(616, 36, 14, 20, 2, V.violetaL) + R(638, 24, 14, 32, 2, V.amarilloL) + R(660, 44, 14, 12, 2, V.violetaL);
    var cols = ['coral', 'amarillo', 'verde', 'azul', 'violeta', 'turquesa'], i;
    for (i = 0; i < 6; i++) s += C(226 + i * 28, 28, 9, V[cols[i] + 'S']) + '<circle class="led" style="animation-delay:' + (i * 0.37) + 's" cx="' + (226 + i * 28) + '" cy="27" r="7" fill="' + V[cols[i]] + '"/>';
    for (i = 0; i < 5; i++) s += R(222 + i * 32, 46, 22, 18, 4, V.tintaL);
    s += R(410, 14, 120, 54, 8, V.tinta, 'opacity=".25"');
    s += R(432, 22, 8, 40, 4, V.tinta) + C(436, 30, 9, V.coral) + R(468, 22, 8, 40, 4, V.tinta) + C(472, 52, 9, V.amarillo) + R(504, 22, 8, 40, 4, V.tinta) + C(508, 38, 9, V.turquesa);
    return s;
  }, 'Consola principal.');

  def('ctl.servidor', 220, 480, function () {
    var s = E(118, 478, 112, 8, V.sombra) + R(0, 0, 220, 476, 10, V.tintaS) + R(0, 0, 210, 476, 10, V.tinta) + R(0, 0, 220, 8, 4, V.tintaL);
    for (var i = 0; i < 8; i++) {
      var y = 22 + i * 55;
      s += R(16, y, 178, 44, 6, V.tintaL) + R(24, y + 8, 60, 6, 3, V.violeta) + R(24, y + 22, 40, 6, 3, V.grisS) + R(24, y + 32, 50, 6, 3, V.grisS);
      for (var k = 0; k < 4; k++) s += '<circle class="led" style="animation-delay:' + (((i * 4 + k) * 0.29) % 1.8).toFixed(2) + 's" cx="' + (118 + k * 20) + '" cy="' + (y + 22) + '" r="6" fill="' + [V.verdeL, V.amarillo, V.verdeL, V.turquesaL][(i + k) % 4] + '"/>';
    }
    s += R(6, 12, 4, 440, 2, V.blanco, 'opacity=".07"');
    return s;
  }, 'Bastidor de servidores.');

  def('ctl.cajaLlaves', 180, 200, function () {
    var s = Vol(0, 0, 180, 200, 14, V.metal, V.metalS, 8) + R(12, 8, 70, 5, 2.5, V.metalL) + R(16, 22, 148, 152, 8, V.tintaL);
    [[46, 'amarillo'], [90, 'coral'], [134, 'turquesa']].forEach(function (k) {
      s += C(k[0], 46, 6, V.metalS) + L('M' + k[0] + ' 46 V70', V.metalS, 4) + C(k[0], 84, 14, V[k[1]]) + C(k[0], 84, 5, V.tintaL) + R(k[0] - 4, 96, 8, 44, 2, V[k[1]]) + R(k[0] + 4, 118, 9, 6, 1, V[k[1]]) + R(k[0] + 4, 130, 7, 6, 1, V[k[1]]);
    });
    s += R(16, 22, 148, 152, 8, V.vidrio, 'opacity=".16"') + P('M26 22 h46 l-46 60 z', V.blanco, 'opacity=".1"');
    return s;
  }, 'Caja de llaves.');

  def('ctl.terminal', 200, 300, function () {
    var s = E(108, 298, 90, 8, V.sombra) + P('M50 296 L64 150 H136 L150 296 Z', V.tintaS) + P('M50 296 L64 150 H126 L134 296 Z', V.tintaL) + Vol(30, 282, 140, 16, 6, V.tinta, V.tintaS, 4);
    s += Vol(0, 0, 200, 160, 14, V.violeta, V.violetaS, 8) + R(14, 14, 172, 114, 8, '#161A3A') + R(12, 6, 70, 5, 2.5, V.violetaL);
    s += T(100, 52, 'ACCESO', 22, V.violetaL, MONO) + '<rect class="led" x="40" y="72" width="120" height="30" rx="6" fill="' + V.coral + '"/>' + T(100, 94, 'BLOQUEADO', 17, V.tintaS, MONO);
    s += C(100, 144, 6, V.tintaS);
    return s;
  }, 'Terminal de acceso.');

  def('ctl.silla', 160, 250, function () {
    return E(84, 246, 60, 7, V.sombra) + R(74, 150, 12, 76, 0, V.metalS) + L('M30 236 H130 M80 222 V236', V.metalS, 10) + C(34, 240, 8, V.tinta) + C(126, 240, 8, V.tinta)
      + Vol(24, 0, 112, 120, 22, V.violeta, V.violetaS, 8) + R(36, 12, 8, 80, 4, V.violetaL, 'opacity=".6"') + Vol(14, 128, 132, 32, 14, V.violeta, V.violetaS, 8);
  }, 'Silla de operador.');

  // ================================================================= INVERNADERO

  function hoja(x, y, rx, ry, rot, c) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + c + '" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"/>'; }
  function maceta(c) {
    return E(74, 198, 52, 5, V.sombra) + P('M26 128 H114 L104 196 H36 Z', V[c + 'S']) + P('M26 128 H104 L96 196 H36 Z', V[c]) + Vol(18, 116, 104, 22, 8, V[c], V[c + 'S'], 6) + R(26, 120, 40, 4, 2, V[c + 'L']);
  }

  def('inv.maceta', 140, 200, function (o) {
    var t = o.tipo || 'hojas', s = '';
    if (t === 'cactus') {
      s += R(52, 30, 36, 96, 18, V.verdeS) + R(52, 30, 26, 96, 13, V.verde) + L('M52 84 H34 V60', V.verde, 16) + L('M88 96 H108 V72', V.verdeS, 16)
        + L('M62 44 v70 M72 40 v74', V.verdeL, 2.5, 'opacity=".7"') + C(70, 26, 9, V.rosa) + C(70, 26, 4, V.amarilloL);
      s += maceta('naranja');
    } else if (t === 'helecho') {
      [-60, -36, -14, 12, 36, 60].forEach(function (a, i) {
        s += G(L('M0 0 Q6 -50 0 -98', V.verdeS, 4) + hoja(-10, -30, 12, 6, -30, V.verde) + hoja(10, -42, 12, 6, 30, V.verdeL) + hoja(-10, -58, 11, 5, -30, V.verdeL) + hoja(10, -72, 10, 5, 30, V.verde) + hoja(0, -92, 7, 11, 0, V.verde), 'transform="translate(70 122) rotate(' + a + ') scale(' + (i % 2 ? 1 : 0.86) + ')"');
      });
      s += maceta('violeta');
    } else {
      s += L('M70 124 Q60 80 34 54 M70 124 Q72 70 76 30 M70 124 Q86 86 112 66', V.verdeS, 6);
      s += hoja(30, 48, 30, 18, 40, V.verde) + hoja(78, 26, 20, 32, 6, V.verdeL) + hoja(114, 62, 28, 17, -34, V.verde) + L('M14 36 L46 60 M78 2 V50 M134 46 L98 76', V.verdeS, 3);
      s += maceta(o.color || 'crema');
    }
    return s;
  }, 'Planta en maceta. Opciones: tipo (hojas | cactus | helecho), color.');

  def('inv.colgante', 160, 260, function () {
    var s = '<g class="mecer">' + L('M80 0 L44 96 M80 0 L116 96 M80 0 V96', V.cremaS, 3);
    s += L('M50 120 Q22 160 34 214 M70 124 Q66 190 80 250 M108 120 Q140 150 126 200 M90 124 Q104 170 100 222', V.verdeS, 5);
    [[34, 150, -30], [30, 186, 20], [36, 214, -10], [70, 164, 30], [74, 204, -30], [80, 246, 10], [132, 150, 30], [130, 180, -20], [126, 204, 10], [98, 160, -30], [102, 196, 30], [100, 224, 0]].forEach(function (h, i) {
      s += hoja(h[0], h[1], 12, 7, h[2], i % 2 ? V.verde : V.limaS);
    });
    s += hoja(54, 92, 26, 12, -24, V.verde) + hoja(106, 92, 26, 12, 24, V.verdeL) + hoja(80, 84, 14, 22, 0, V.verde);
    s += P('M36 96 H124 L112 136 H48 Z', V.maderaS) + P('M36 96 H114 L104 136 H48 Z', V.madera) + R(32, 92, 96, 12, 6, V.maderaL);
    return s + '</g>';
  }, 'Planta colgante (se mece).');

  def('inv.mesaCultivo', 560, 230, function () {
    var s = E(288, 228, 280, 9, V.sombra);
    s += R(30, 60, 20, 168, 4, V.metalS) + R(510, 60, 20, 168, 4, V.metalS) + R(40, 150, 480, 12, 4, V.metalS);
    // Sacos bajo la mesa
    s += Vol(90, 168, 110, 58, 16, V.crema, V.cremaS, 8) + R(118, 186, 54, 8, 4, V.madera) + Vol(380, 176, 90, 50, 14, V.maderaL, V.maderaS, 8);
    // Bandejas con plántulas
    for (var b = 0; b < 3; b++) {
      var x = 26 + b * 176;
      for (var i = 0; i < 5; i++) {
        var px = x + 18 + i * 30, alto = 16 + ((i * 7 + b * 5) % 4) * 9;
        s += L('M' + px + ' 40 V' + (40 - alto), V.verdeS, 4) + hoja(px - 7, 40 - alto, 9, 5, -30, V.lima) + hoja(px + 7, 40 - alto - 3, 9, 5, 30, V.verdeL);
      }
      s += Vol(x, 34, 156, 30, 6, V.tintaL, V.tinta, 6) + R(x + 6, 36, 144, 7, 3, V.maderaS);
    }
    s += Vol(0, 56, 560, 22, 6, V.metal, V.metalS, 6) + R(10, 58, 220, 4, 2, V.metalL);
    return s;
  }, 'Mesa de cultivo con plántulas.');

  def('inv.torre', 180, 420, function () {
    var s = E(98, 416, 78, 8, V.sombra) + P('M20 60 L160 60 L190 410 L-10 410 Z', V.violetaL, 'opacity=".1"');
    s += Vol(30, 0, 120, 30, 10, V.tintaL, V.tinta, 6) + '<rect class="pantalla-viva" x="44" y="26" width="92" height="10" rx="5" fill="' + V.rosaL + '"/>';
    s += R(66, 40, 48, 340, 10, V.cremaS) + R(66, 40, 36, 340, 10, V.cremaL);
    for (var i = 0; i < 5; i++) {
      var y = 80 + i * 60, izq = i % 2 === 0;
      var x = izq ? 66 : 114, d = izq ? -1 : 1;
      s += P('M' + x + ' ' + (y + 4) + ' l' + (d * 34) + ' -12 v26 l' + (-d * 34) + ' 8 z', V.cremaS);
      s += hoja(x + d * 30, y - 22, 16, 10, d * -40, V.verde) + hoja(x + d * 44, y - 8, 15, 9, d * -10, V.lima) + hoja(x + d * 18, y - 14, 12, 8, d * 30, V.verdeL);
    }
    s += Vol(20, 372, 140, 44, 12, V.tintaL, V.tinta, 8) + R(40, 386, 50, 8, 4, V.azulL) + '<circle class="led" cx="134" cy="390" r="7" fill="' + V.verdeL + '"/>';
    return s;
  }, 'Torre hidropónica con luz de cultivo.');

  def('inv.gabinete', 240, 360, function () {
    var s = E(128, 358, 124, 8, V.sombra) + R(0, 0, 240, 356, 12, V.verdeS) + R(0, 0, 230, 356, 12, V.verde) + R(0, 0, 240, 9, 4, V.verdeL);
    s += R(14, 20, 100, 320, 8, V.verdeS, 'opacity=".55"') + R(126, 20, 100, 320, 8, V.verdeS, 'opacity=".55"');
    s += L('M40 60 h48 M40 76 h48 M40 92 h48 M152 60 h48 M152 76 h48 M152 92 h48', V.tinta, 6, 'opacity=".3"');
    s += R(98, 160, 9, 46, 4.5, V.cremaL) + R(133, 160, 9, 46, 4.5, V.cremaL);
    // Pala y rastrillo apoyados
    s += G(R(-5, -150, 10, 130, 4, V.madera) + P('M-20 -20 h40 v30 q-20 26 -40 0 z', V.metal), 'transform="translate(222 350) rotate(8)"');
    return s;
  }, 'Gabinete de herramientas de jardín.');

  def('inv.riego', 200, 240, function () {
    var s = L('M100 0 V30 M30 214 V240 M170 214 V236', V.metalS, 12) + L('M96 0 V26', V.metal, 4);
    s += Vol(0, 26, 200, 190, 14, V.azul, V.azulS, 8) + R(12, 34, 80, 5, 2.5, V.azulL);
    // Manómetro
    s += C(52, 82, 32, V.metalS) + C(52, 82, 26, V.cremaL) + L('M52 82 L68 68', V.coral, 4) + C(52, 82, 4, V.tinta) + L('M34 96 a22 22 0 0 1 2 -30', V.verde, 4);
    // Válvulas
    s += C(52, 160, 20, V.coral) + C(52, 160, 7, V.coralS) + L('M36 160 h32 M52 144 v32', V.coralS, 5);
    s += R(108, 44, 78, 156, 10, V.tinta, 'opacity=".3"');
    s += '<g>' + '<path class="gota" d="M170 236 q7 12 0 18 q-7 -6 0 -18 z" fill="' + V.azulL + '"/></g>';
    return s;
  }, 'Control de riego.');

  def('inv.semillas', 300, 240, function () {
    var s = E(158, 238, 154, 8, V.sombra) + R(0, 0, 300, 236, 12, V.maderaS) + R(0, 0, 290, 236, 12, V.madera) + R(0, 0, 300, 9, 4, V.maderaL);
    var cols = ['lima', 'amarillo', 'naranja', 'verde', 'coral', 'turquesa'];
    for (var f = 0; f < 4; f++) for (var c = 0; c < 4; c++) {
      var x = 14 + c * 68, y = 18 + f * 54;
      s += R(x, y, 60, 46, 6, V.maderaL) + R(x + 12, y + 8, 36, 14, 3, V.cremaL) + C(x + 20, y + 15, 4, V[cols[(f * 4 + c) % 6]]) + R(x + 22, y + 30, 16, 6, 3, V.maderaS);
    }
    return s;
  }, 'Banco de semillas.');

  def('inv.regadera', 130, 100, function () {
    return E(66, 98, 54, 4, V.sombra) + L('M88 50 L122 22', V.turquesaS, 10) + R(112, 10, 16, 22, 4, V.turquesaS) + L('M30 42 Q0 44 6 70 Q10 86 30 84', V.turquesaS, 9)
      + Vol(26, 32, 68, 66, 10, V.turquesa, V.turquesaS, 7) + R(34, 40, 6, 40, 3, V.turquesaL) + R(22, 26, 76, 12, 6, V.turquesaS);
  }, 'Regadera.');
})(window.EA = window.EA || {});
