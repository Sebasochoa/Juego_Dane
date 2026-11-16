/* Biblioteca de arte — mobiliario y material de laboratorio (Química y Biología). */
(function (EA) {
  'use strict';
  var A = EA.arte, K = A.K, V = K.V, R = K.R, C = K.C, E = K.E, P = K.P, L = K.L, T = K.T, G = K.G, Vol = K.Vol, def = K.def;

  function col(o, defecto) { return (o && o.color) || defecto; }

  // ---------------------------------------------------------------- Mobiliario

  def('mueble.meson', 720, 200, function (o) {
    var ac = col(o, 'turquesa');
    var s = E(368, 198, 366, 10, V.sombra);
    s += R(24, 186, 672, 12, 0, V.tintaS);                                  // rodapié
    s += R(12, 24, 696, 166, 4, V.cremaS) + R(12, 24, 686, 166, 4, V.crema); // cuerpo
    for (var i = 0; i < 4; i++) {
      var x = 24 + i * 170;
      s += R(x, 38, 158, 34, 6, V.cremaL) + R(x + 59, 51, 40, 8, 4, V[ac]);          // cajón
      s += R(x, 80, 158, 100, 6, V.cremaL) + R(x + (i % 2 ? 12 : 138), 110, 8, 40, 4, V[ac]); // puerta
    }
    s += Vol(0, 0, 720, 30, 8, V.tintaL, V.tinta, 8) + R(10, 4, 300, 5, 2.5, V.blanco, 'opacity=".18"'); // cubierta
    return s;
  }, 'Mesón de laboratorio. Opciones: color (acento de tiradores).');

  function miniFrasco(x, base, alto, c) {
    return R(x, base - alto, 26, alto, 6, V[c]) + R(x + 7, base - alto - 10, 12, 12, 2, V[c + 'S']) + R(x + 5, base - alto + 10, 16, alto * 0.35, 2, V.cremaL, 'opacity=".85"');
  }

  def('mueble.armario', 300, 500, function (o) {
    var ac = col(o, 'turquesa');
    var s = E(158, 498, 156, 10, V.sombra);
    s += R(0, 0, 300, 496, 12, V.metalS) + R(0, 0, 288, 496, 12, V.metal) + R(0, 0, 300, 10, 5, V.metalL);
    s += R(18, 24, 264, 300, 6, V.tintaL);
    // Estantes con frascos
    var filas = [[['coral', 44], ['amarillo', 56], ['azul', 40], ['violeta', 60], ['verde', 46], ['naranja', 52]], [['azul', 58], ['turquesa', 42], ['rosa', 50], ['amarillo', 44], ['coral', 60], ['lima', 40]], [['violeta', 46], ['naranja', 60], ['turquesa', 52], ['coral', 40], ['azul', 54], ['verde', 44]]];
    filas.forEach(function (fila, f) {
      var base = 118 + f * 100;
      fila.forEach(function (fr, i) { s += miniFrasco(34 + i * 40, base, fr[1], fr[0]); });
      s += R(18, base, 264, 8, 0, V.metalS);
    });
    s += R(18, 24, 264, 300, 6, V.vidrio, 'opacity=".16"') + P('M30 24 h64 L30 170 z', V.blanco, 'opacity=".12"') + P('M170 24 h30 L160 324 h-30 z', V.blanco, 'opacity=".06"');
    s += R(148, 24, 5, 300, 0, V.metalS) + R(132, 150, 8, 44, 4, V.metalL) + R(160, 150, 8, 44, 4, V.metalL);
    // Puertas bajas
    s += Vol(18, 340, 128, 142, 8, V[ac], V[ac + 'S'], 6) + Vol(154, 340, 128, 142, 8, V[ac], V[ac + 'S'], 6);
    s += C(128, 406, 7, V.cremaL) + C(172, 406, 7, V.cremaL);
    s += P('M82 372 l26 44 h-52 z', V.amarillo) + R(79.5, 388, 5, 14, 2.5, V.tinta) + C(82, 409, 3, V.tinta);
    return s;
  }, 'Armario de reactivos con vitrina. Opciones: color.');

  def('mueble.estante', 420, 34, function () {
    return P('M50 12 h14 v22 z M356 12 h14 l-14 22 z', V.maderaS) + Vol(0, 0, 420, 16, 5, V.madera, V.maderaS, 5) + R(8, 2, 180, 3, 1.5, V.maderaL);
  }, 'Repisa de pared (los objetos se colocan encima).');

  def('mueble.campana', 380, 400, function () {
    var s = R(150, 0, 80, 90, 0, V.metalS) + R(150, 0, 30, 90, 0, V.metal);                 // ducto
    s += Vol(0, 80, 380, 64, 12, V.metal, V.metalS, 6) + R(12, 86, 150, 5, 2.5, V.metalL);   // cabezal
    for (var i = 0; i < 6; i++) s += R(40 + i * 26, 104, 14, 22, 5, V.metalS);
    s += '<circle class="led" cx="336" cy="112" r="9" fill="' + V.verdeL + '"/>' + C(306, 112, 9, V.amarillo);
    s += R(0, 138, 380, 262, 4, V.metalS) + R(14, 144, 352, 240, 4, V.tintaL);              // cámara
    // Montaje interior: soporte con balón y vapor
    s += R(96, 366, 110, 10, 3, V.grisS) + R(110, 220, 8, 150, 3, V.grisS) + R(110, 286, 70, 7, 3, V.grisS);
    s += C(176, 322, 34, V.vidrio, 'opacity=".4"') + P('M143 326 A34 34 0 0 0 209 326 Z', V.rosa) + R(166, 268, 20, 30, 3, V.vidrio, 'opacity=".4"');
    s += '<g class="vapor">' + C(176, 250, 10, V.cremaL, 'opacity=".5"') + C(190, 228, 14, V.cremaL, 'opacity=".35"') + C(172, 204, 18, V.cremaL, 'opacity=".2"') + '</g>';
    s += R(250, 300, 46, 70, 6, V.vidrio, 'opacity=".4"') + R(250, 330, 46, 40, 6, V.amarillo);
    // Guillotina de vidrio
    s += R(14, 144, 352, 110, 0, V.vidrio, 'opacity=".2"') + P('M30 144 h70 l-60 110 h-10 z', V.blanco, 'opacity=".1"') + R(14, 250, 352, 12, 3, V.metal);
    s += R(150, 254, 80, 5, 2, V.metalS);
    s += Vol(-6, 384, 392, 16, 5, V.metal, V.metalS, 5);
    return s;
  }, 'Campana extractora de gases.');

  // ---------------------------------------------------------------- Cristalería

  def('lab.matraz', 90, 120, function (o) {
    var c = col(o, 'turquesa');
    var s = E(50, 118, 40, 5, V.sombra);
    s += P('M33 6 h24 v32 l27 62 a12 12 0 0 1 -11 18 h-56 a12 12 0 0 1 -11 -18 l27 -62 z', V.vidrio, 'opacity=".42"');
    s += P('M22 72 h46 l16 28 a12 12 0 0 1 -11 18 h-56 a12 12 0 0 1 -11 -18 z', V[c]);
    s += E(45, 72, 23, 5, V[c + 'L']);
    s += '<g class="burbujas">' + C(34, 104, 4, V[c + 'L']) + C(50, 98, 3, V[c + 'L']) + C(60, 108, 3.5, V[c + 'L']) + '</g>';
    s += R(29, 0, 32, 9, 4.5, V.vidrio, 'opacity=".9"') + L('M30 48 L17 96', V.blanco, 5, 'opacity=".5"');
    return s;
  }, 'Matraz Erlenmeyer. Opciones: color.');

  def('lab.balon', 100, 130, function (o) {
    var c = col(o, 'coral');
    var s = E(54, 128, 36, 5, V.sombra);
    s += R(38, 4, 24, 50, 4, V.vidrio, 'opacity=".42"') + C(50, 84, 44, V.vidrio, 'opacity=".42"');
    s += P('M8 92 A44 44 0 0 0 92 92 Z', V[c]) + E(50, 92, 42, 6, V[c + 'L']);
    s += '<g class="burbujas">' + C(40, 112, 4, V[c + 'L']) + C(58, 106, 3, V[c + 'L']) + '</g>';
    s += R(33, 0, 34, 9, 4.5, V.vidrio, 'opacity=".9"') + L('M24 60 Q14 78 20 98', V.blanco, 5, 'opacity=".5"');
    return s;
  }, 'Balón de fondo redondo. Opciones: color.');

  def('lab.vaso', 80, 90, function (o) {
    var c = col(o, 'azul');
    return E(44, 88, 34, 5, V.sombra) + R(6, 6, 68, 82, 9, V.vidrio, 'opacity=".42"')
      + P('M6 44 h68 v35 a9 9 0 0 1 -9 9 h-50 a9 9 0 0 1 -9 -9 z', V[c]) + R(6, 40, 68, 8, 4, V[c + 'L'])
      + R(2, 2, 76, 9, 4.5, V.vidrio, 'opacity=".9"') + L('M56 22 h10 M56 34 h10 M56 58 h10 M56 70 h10', V.blanco, 3, 'opacity=".6"')
      + L('M15 18 V70', V.blanco, 5, 'opacity=".45"');
  }, 'Vaso de precipitados. Opciones: color.');

  def('lab.tubos', 150, 110, function () {
    var s = E(80, 108, 72, 5, V.sombra) + R(8, 40, 10, 62, 0, V.maderaS) + R(132, 40, 10, 62, 0, V.maderaS);
    var cs = ['coral', 'amarillo', 'azul', 'violeta'], hs = [40, 28, 46, 34];
    cs.forEach(function (c, i) {
      var x = 24 + i * 28;
      s += R(x, 4, 20, 90, 10, V.vidrio, 'opacity=".45"') + P('M' + x + ' ' + (94 - hs[i]) + ' h20 v' + (hs[i] - 10) + ' a10 10 0 0 1 -20 0 z', V[c]) + R(x + 4, 12, 4, 40, 2, V.blanco, 'opacity=".45"');
    });
    s += Vol(0, 36, 150, 14, 5, V.madera, V.maderaS, 4) + Vol(0, 94, 150, 14, 5, V.madera, V.maderaS, 4);
    return s;
  }, 'Gradilla con tubos de ensayo.');

  def('lab.mechero', 70, 120, function () {
    return E(38, 118, 30, 5, V.sombra) + '<g class="llama">' + P('M35 4 C52 26 54 42 35 56 C16 42 18 26 35 4 z', V.azulL) + P('M35 24 C44 36 44 46 35 54 C26 46 26 36 35 24 z', V.cremaL) + '</g>'
      + R(27, 52, 16, 56, 3, V.metal) + R(27, 52, 6, 56, 3, V.metalL) + R(22, 62, 26, 8, 4, V.metalS)
      + Vol(8, 102, 54, 16, 7, V.metalS, V.grisS, 4) + C(52, 94, 6, V.coral);
  }, 'Mechero Bunsen.');

  def('lab.frasco', 60, 90, function (o) {
    var c = col(o, 'azul');
    return E(33, 88, 26, 4, V.sombra) + R(4, 26, 52, 64, 9, V[c + 'S']) + R(4, 26, 46, 64, 9, V[c]) + R(19, 10, 22, 22, 3, V[c])
      + R(15, 0, 30, 14, 5, V.tintaL) + R(12, 44, 34, 28, 4, V.cremaL) + R(17, 51, 24, 4, 2, V.tintaL) + R(17, 60, 16, 4, 2, V.gris)
      + R(9, 32, 5, 48, 2.5, V.blanco, 'opacity=".3"');
  }, 'Frasco de reactivo. Opciones: color.');

  def('lab.probeta', 50, 130, function (o) {
    var c = col(o, 'verde');
    return E(28, 128, 22, 4, V.sombra) + R(14, 4, 22, 116, 6, V.vidrio, 'opacity=".42"') + R(14, 60, 22, 60, 6, V[c]) + R(14, 56, 22, 8, 4, V[c + 'L'])
      + R(10, 0, 30, 8, 4, V.vidrio, 'opacity=".9"') + L('M28 20 h6 M28 34 h6 M28 48 h6 M28 76 h6 M28 90 h6', V.blanco, 3, 'opacity=".6"') + Vol(4, 116, 42, 12, 5, V.metal, V.metalS, 4);
  }, 'Probeta graduada. Opciones: color.');

  // ---------------------------------------------------------------- Carteles

  def('deco.tabla', 300, 210, function () {
    var s = Vol(0, 0, 300, 210, 10, V.cremaL, V.cremaS, 5) + R(14, 12, 130, 12, 6, V.tinta) + R(152, 12, 50, 12, 6, V.gris);
    var filas = 7, x0 = 14, y0 = 38, cw = 15.2, ch = 21;
    for (var f = 0; f < filas; f++) {
      for (var c = 0; c < 18; c++) {
        var existe = f === 0 ? (c === 0 || c === 17) : f < 3 ? (c < 2 || c > 11) : true;
        if (!existe) continue;
        var color = c < 2 ? V.coralL : c < 12 ? V.amarilloL : c < 17 ? V.turquesaL : V.violetaL;
        if (f === 0 && c === 0) color = V.verdeL;
        s += R(x0 + c * cw, y0 + f * ch, cw - 2.4, ch - 3, 2.5, color);
      }
    }
    // Cu y Zn marcados
    s += '<ellipse cx="' + (x0 + 11 * cw - 1) + '" cy="' + (y0 + 3 * ch + 9) + '" rx="20" ry="15" fill="none" stroke="' + V.coral + '" stroke-width="4"/>';
    return s;
  }, 'Cartel de la tabla periódica (Cu y Zn marcados).');

  def('deco.cartelPila', 200, 240, function () {
    var s = Vol(0, 0, 200, 240, 10, V.cremaL, V.cremaS, 5) + R(0, 0, 200, 46, 10, V.turquesa) + R(0, 30, 200, 16, 0, V.turquesa);
    s += T(100, 32, 'PILA CASERA', 22, V.cremaL, 'letter-spacing="1"');
    // Limón con dos láminas, cables y foco
    s += E(100, 168, 58, 40, V.amarillo) + P('M52 190 Q100 222 150 188 Q104 206 52 190 z', V.amarilloS) + E(80, 152, 14, 7, V.amarilloL);
    s += R(68, 104, 14, 62, 3, V.naranja) + R(120, 104, 14, 62, 3, V.gris);
    s += L('M75 104 V84 Q75 70 90 70', V.coral, 4) + L('M127 104 V84 Q127 70 112 70', V.tinta, 4);
    s += C(101, 68, 14, V.amarilloL) + C(101, 68, 8, V.cremaL) + L('M101 46 v-0 M80 56 l-5 -5 M122 56 l5 -5', V.amarillo, 4);
    s += T(52, 122, 'Cu', 22, V.naranjaS) + T(152, 122, 'Zn', 22, V.grisS);
    s += T(100, 230, 'ácido + 2 metales', 17, V.tinta);
    return s;
  }, 'Cartel «Pila casera» (pista del puzzle de Química).');

  def('quimica.panel', 150, 200, function (o) {
    var on = !!o.encendido;
    var s = Vol(0, 0, 150, 200, 16, V.metal, V.metalS, 7) + R(10, 6, 60, 5, 2.5, V.metalL);
    s += R(16, 18, 118, 60, 10, V.tintaS);
    if (on) {
      s += '<rect class="pantalla-viva" x="22" y="24" width="106" height="48" rx="6" fill="' + V.verde + '"/>' + T(75, 56, 'ENERGÍA', 20, V.tintaS, 'font-family="var(--fuente-mono)"');
    } else {
      s += P('M80 26 L62 50 h11 l-4 20 l19 -27 h-11 z', V.grisS) + L('M54 68 L98 28', V.coral, 5);
    }
    for (var i = 0; i < 9; i++) s += C(45 + (i % 3) * 30, 100 + Math.floor(i / 3) * 24, 8, on ? V.turquesaL : V.grisS);
    // Bornes
    s += R(34, 172, 26, 18, 5, V.naranja) + R(90, 172, 26, 18, 5, V.grisL) + T(47, 168, '+', 18, V.tinta) + T(103, 168, '–', 18, V.tinta);
    return s;
  }, 'Panel de la puerta. Opciones: encendido.');

  // ---------------------------------------------------------------- Objetos del puzzle de Química

  def('obj.limon', 70, 60, function () {
    return E(38, 56, 26, 4, V.sombra) + E(35, 32, 30, 23, V.amarillo) + C(64, 33, 7, V.amarillo) + C(7, 31, 6, V.amarillo)
      + P('M10 42 Q36 62 62 40 Q38 52 10 42 z', V.amarilloS) + E(24, 22, 9, 5, V.amarilloL)
      + P('M34 10 Q44 -4 58 4 Q50 16 34 10 z', V.verde) + L('M35 10 Q46 4 56 5', V.verdeS, 2.5);
  }, 'Limón (objeto de inventario).');

  def('obj.electrodos', 90, 110, function () {
    return C(45, 8, 8, V.metalS) + C(45, 8, 3.5, V.tintaS)
      + L('M22 46 C22 18 40 22 45 10', V.coral, 5) + L('M68 46 C68 18 50 22 45 10', V.tintaL, 5)
      + R(15, 40, 14, 14, 3, V.coralS) + R(61, 40, 14, 14, 3, V.tinta)
      + R(12, 50, 20, 58, 4, V.naranjaS) + R(12, 50, 15, 58, 4, V.naranja) + R(15, 54, 4, 40, 2, V.naranjaL)
      + R(58, 50, 20, 58, 4, V.grisS) + R(58, 50, 15, 58, 4, V.grisL) + R(61, 54, 4, 40, 2, V.blanco, 'opacity=".6"');
  }, 'Electrodos de cobre y zinc con cables (objeto de inventario).');

  def('obj.pila-limon', 110, 90, function () {
    return E(58, 86, 40, 5, V.sombra)
      + R(34, 14, 12, 40, 3, V.naranja) + R(64, 14, 12, 40, 3, V.grisL)
      + L('M40 14 C40 -2 14 2 12 20', V.coral, 4.5) + L('M70 14 C70 -2 98 2 98 20', V.tintaL, 4.5)
      + C(12, 24, 6, V.coralS) + C(98, 24, 6, V.tinta)
      + E(55, 58, 40, 28, V.amarillo) + C(94, 59, 8, V.amarillo) + C(16, 57, 7, V.amarillo)
      + P('M20 70 Q56 94 92 68 Q58 82 20 70 z', V.amarilloS) + E(40, 46, 11, 6, V.amarilloL)
      + P('M56 28 l-9 13 h7 l-3 11 l11 -15 h-7 z', V.cremaL);
  }, 'Pila de limón (resultado de combinar).');

  // ---------------------------------------------------------------- Biología

  def('lab.microscopio', 170, 220, function () {
    var s = E(96, 218, 76, 6, V.sombra);
    s += L('M122 200 V112 Q122 62 86 56', V.cremaS, 30) + L('M118 200 V112 Q118 64 86 58', V.crema, 22) + L('M112 190 V116', V.cremaL, 5);   // brazo
    s += Vol(24, 194, 136, 24, 10, V.tintaL, V.tinta, 6);                                                                                  // base
    s += G(R(-15, -50, 30, 92, 8, V.tinta) + R(-15, -50, 30, 92, 8, V.tintaL, 'opacity=".8"') + R(-9, -44, 6, 74, 3, V.gris, 'opacity=".6"')
      + R(-11, -70, 22, 24, 6, V.metal) + R(-14, -74, 28, 10, 5, V.metalS) + R(-10, 40, 20, 20, 4, V.metal) + R(-7, 58, 14, 12, 3, V.metalS), 'transform="translate(72 76) rotate(-20)"');
    s += R(36, 152, 104, 11, 4, V.metal) + R(36, 159, 104, 5, 2, V.metalS) + R(80, 148, 30, 5, 2, V.vidrio);                              // platina
    s += C(124, 126, 15, V.verde) + C(124, 126, 7, V.verdeS) + '<circle class="led" cx="62" cy="186" r="8" fill="' + V.amarilloL + '"/>';
    return s;
  }, 'Microscopio óptico.');

  def('bio.monitor', 260, 220, function (o) {
    var on = !!o.encendido;
    var s = E(138, 218, 70, 6, V.sombra) + R(110, 170, 40, 36, 0, V.metalS) + Vol(70, 200, 120, 18, 8, V.metal, V.metalS, 5);
    s += Vol(0, 0, 260, 178, 14, V.tintaL, V.tinta, 7) + R(12, 12, 236, 148, 8, V.tintaS);
    if (on) {
      s += R(12, 12, 236, 148, 8, V.azulL);
      var celdas = [[20, 20, 62, 44], [86, 16, 70, 50], [160, 22, 78, 42], [18, 68, 74, 46], [96, 70, 66, 44], [166, 68, 72, 48], [24, 118, 66, 36], [94, 118, 76, 36], [174, 120, 64, 34]];
      celdas.forEach(function (c) {
        s += R(c[0], c[1], c[2], c[3], 10, V.cremaL, 'opacity=".9"') + C(c[0] + c[2] * 0.55, c[1] + c[3] * 0.5, 7, V.azulS);
      });
      s += '<rect class="pantalla-barrido" x="12" y="12" width="236" height="14" fill="#FFFFFF" opacity=".25"/>';
    } else {
      s += T(130, 82, 'SIN', 26, V.grisS, 'font-family="var(--fuente-mono)"') + T(130, 114, 'MUESTRA', 26, V.grisS, 'font-family="var(--fuente-mono)"');
      s += '<rect class="led" x="118" y="130" width="24" height="6" rx="3" fill="' + V.coral + '"/>';
    }
    s += P('M16 16 h60 l-60 70 z', V.blanco, 'opacity=".06"');
    return s;
  }, 'Monitor del microscopio. Opciones: encendido (muestra células teñidas).');

  def('bio.modelo', 180, 330, function () {
    var s = E(98, 328, 76, 7, V.sombra) + Vol(30, 286, 120, 42, 10, V.tintaL, V.tinta, 7) + R(80, 262, 20, 30, 0, V.metalS);
    // Cabeza y torso
    s += C(90, 44, 36, V.naranjaL) + P('M112 20 A36 36 0 0 1 108 74 Q124 50 112 20 z', V.naranja) + R(78, 74, 24, 22, 0, V.naranjaL);
    s += P('M34 112 Q34 90 62 90 h56 Q146 90 146 112 V236 Q146 268 114 268 H66 Q34 268 34 236 z', V.naranjaL);
    s += P('M118 90 Q146 90 146 112 V236 Q146 268 114 268 H104 Q130 262 130 236 V112 Q130 94 118 90 z', V.naranja);
    // Ventana anatómica
    s += R(50, 104, 80, 150, 22, V.cremaL);
    s += P('M62 116 q14 -6 22 6 v36 q-14 10 -24 0 z', V.rosa) + P('M96 122 q12 -12 24 0 v30 q-12 10 -24 0 z', V.rosa);        // pulmones
    s += P('M84 150 q10 -10 18 2 q4 14 -10 22 q-14 -8 -8 -24 z', V.coral);                                                    // corazón
    s += P('M60 178 q30 -12 58 2 q0 18 -30 18 q-28 0 -28 -20 z', V.maderaS);                                                  // hígado
    s += L('M66 210 h46 q8 0 8 8 t-8 8 h-40 q-8 0 -8 8 t8 8 h34', V.rosaS, 9);                                               // intestino
    s += R(86, 104, 6, 30, 3, V.cremaS);
    return s;
  }, 'Modelo anatómico de torso.');

  def('bio.terrario', 320, 230, function () {
    var s = E(168, 228, 160, 7, V.sombra) + R(0, 0, 320, 18, 6, V.tintaL);
    s += R(6, 14, 308, 204, 6, 'var(--pared-biologia-s)') + R(6, 170, 308, 48, 0, V.maderaS) + P('M6 176 Q80 156 150 174 T314 168 V190 H6 z', V.madera);
    // Plantas
    s += L('M70 176 Q60 120 40 96 M70 176 Q72 116 90 86 M70 176 Q88 130 112 118', V.verde, 9);
    s += E(40, 92, 16, 9, V.verdeL, 'transform="rotate(-40 40 92)"') + E(92, 82, 16, 9, V.verde, 'transform="rotate(30 92 82)"') + E(116, 116, 15, 8, V.verdeL, 'transform="rotate(20 116 116)"');
    s += L('M240 170 Q236 120 252 80 M240 170 Q262 130 284 122', V.verdeS, 8) + E(254, 76, 15, 9, V.lima, 'transform="rotate(-60 254 76)"') + E(288, 120, 15, 8, V.lima, 'transform="rotate(-10 288 120)"');
    s += P('M150 174 q20 -34 50 -6 z', V.grisS) + P('M150 174 q14 -26 34 -12 q-18 0 -22 12 z', V.gris);                    // roca
    // Ranita
    s += '<g class="rana">' + E(178, 150, 18, 11, V.lima) + C(168, 140, 6, V.lima) + C(186, 140, 6, V.lima) + C(168, 139, 2.5, V.tinta) + C(186, 139, 2.5, V.tinta) + '</g>';
    s += R(6, 14, 308, 204, 6, V.vidrio, 'opacity=".14"') + P('M20 14 h70 L20 150 z', V.blanco, 'opacity=".1"');
    s += Vol(0, 212, 320, 18, 6, V.tintaL, V.tinta, 5);
    return s;
  }, 'Terrario.');

  def('bio.frasco', 70, 110, function (o) {
    var c = col(o, 'lima');
    var s = E(38, 108, 30, 4, V.sombra) + R(6, 16, 58, 92, 12, V.vidrio, 'opacity=".4"') + R(6, 34, 58, 74, 12, V[c + 'L'], 'opacity=".55"');
    if (o.tipo === 'hoja') s += L('M35 96 V50', V.verdeS, 4) + E(35, 58, 14, 22, V.verde) + L('M35 76 l-9 -9 M35 66 l9 -9', V.verdeS, 3);
    else if (o.tipo === 'concha') s += C(35, 78, 18, V.cremaL) + L('M35 78 a6 6 0 1 1 6 6 a10 10 0 1 1 -12 -10', V.maderaS, 3.5);
    else s += E(35, 72, 12, 22, V.rosaL) + C(35, 54, 9, V.rosaL) + C(31, 52, 2.5, V.tinta);
    s += Vol(2, 4, 66, 16, 6, V.madera, V.maderaS, 4) + R(12, 26, 5, 60, 2.5, V.blanco, 'opacity=".4"');
    return s;
  }, 'Frasco de espécimen. Opciones: color, tipo (hoja | concha | otro).');

  def('bio.gabinete', 300, 400, function () {
    var s = E(158, 398, 156, 9, V.sombra) + R(0, 0, 300, 396, 12, V.maderaS) + R(0, 0, 288, 396, 12, V.madera) + R(0, 0, 300, 9, 4, V.maderaL);
    s += R(18, 22, 264, 230, 6, 'var(--pared-biologia-s)') + R(18, 132, 264, 9, 0, V.maderaS) + R(18, 243, 264, 9, 0, V.maderaS);
    s += R(18, 22, 264, 230, 6, V.vidrio, 'opacity=".12"');
    s += Vol(18, 268, 264, 52, 8, V.maderaL, V.maderaS, 5) + Vol(18, 330, 264, 52, 8, V.maderaL, V.maderaS, 5) + R(126, 286, 48, 9, 4.5, V.verdeS) + R(126, 348, 48, 9, 4.5, V.verdeS);
    return s;
  }, 'Gabinete de muestras (los frascos se colocan dentro).');

  def('deco.adn', 180, 260, function () {
    var s = Vol(0, 0, 180, 260, 10, V.cremaL, V.cremaS, 5) + R(0, 0, 180, 40, 10, V.verde) + R(0, 26, 180, 14, 0, V.verde) + T(90, 29, 'ADN', 22, V.cremaL, 'letter-spacing="3"');
    var a = 'M60 54', b = 'M120 54', y, i;
    for (i = 0; i < 4; i++) { y = 54 + i * 48; a += ' C60 ' + (y + 16) + ' 120 ' + (y + 32) + ' 120 ' + (y + 48); b += ' C120 ' + (y + 16) + ' 60 ' + (y + 32) + ' 60 ' + (y + 48); }
    var cols = [V.coral, V.amarillo, V.azul, V.violeta];
    for (i = 0; i < 8; i++) { y = 66 + i * 24; var w = (i % 2 === 0) ? 44 : 24; s += R(90 - w / 2, y - 3, w, 6, 3, cols[i % 4]); }
    s += L(a, V.verdeS, 7) + L(b, V.turquesa, 7);
    return s;
  }, 'Cartel del ADN.');

  def('deco.nota', 150, 120, function () {
    return P('M0 6 a6 6 0 0 1 6 -6 h138 a6 6 0 0 1 6 6 v84 l-30 30 h-114 a6 6 0 0 1 -6 -6 z', V.amarilloL) + P('M150 90 l-30 30 v-24 a6 6 0 0 1 6 -6 z', V.amarillo)
      + C(75, 10, 8, V.coral) + R(16, 34, 110, 7, 3.5, V.tintaL) + R(16, 52, 118, 7, 3.5, V.tintaL) + R(16, 70, 80, 7, 3.5, V.tintaL)
      + P('M34 88 q8 -14 16 0 a8 8 0 0 1 -16 0 z', V.azul);
  }, 'Nota adhesiva con recordatorio de tinción.');

  def('lab.placas', 130, 44, function () {
    return E(68, 42, 60, 4, V.sombra) + E(40, 30, 38, 12, V.vidrio, 'opacity=".6"') + E(40, 28, 30, 8, V.rosaL) + C(32, 27, 3, V.coral) + C(46, 30, 4, V.coralS) + C(52, 25, 2.5, V.coral)
      + E(94, 22, 34, 11, V.vidrio, 'opacity=".6"') + E(94, 20, 27, 7, V.limaL) + C(88, 20, 3, V.verde) + C(100, 18, 3.5, V.verdeS);
  }, 'Placas de Petri.');

  def('obj.portaobjetos', 110, 50, function (o) {
    var t = !!o.tenida;
    return E(58, 46, 50, 4, V.sombra) + P('M10 14 h96 l-8 24 h-96 z', V.vidrio, 'opacity=".85"') + P('M10 14 h96 l-1.6 5 h-96 z', V.blanco, 'opacity=".7"')
      + E(54, 27, 17, 7, t ? V.azul : V.cremaS, t ? '' : 'opacity=".9"') + (t ? C(48, 26, 2.5, V.azulS) + C(56, 29, 2.5, V.azulS) + C(62, 25, 2.5, V.azulS) : '')
      + P('M6 26 h18 l-4 12 h-18 z', V.cremaL);
  }, 'Portaobjetos con muestra. Opciones: tenida.');

  def('obj.tinte', 60, 100, function () {
    return E(33, 98, 24, 4, V.sombra) + E(30, 12, 10, 12, V.coral) + R(24, 20, 12, 14, 2, V.tintaL) + R(16, 30, 28, 12, 4, V.tinta)
      + R(8, 40, 44, 58, 10, V.azulS) + R(8, 40, 38, 58, 10, V.azul) + R(13, 46, 5, 40, 2.5, V.azulL, 'opacity=".7"')
      + R(18, 56, 26, 30, 4, V.cremaL) + P('M31 60 q8 12 0 18 q-8 -6 0 -18 z', V.azul);
  }, 'Gotero de azul de metileno (objeto de inventario).');

  def('obj.muestra-tenida', 110, 50, function () { return A.REG['obj.portaobjetos'].dibujar({ tenida: true }); }, 'Muestra teñida (resultado de combinar).');
})(window.EA = window.EA || {});
