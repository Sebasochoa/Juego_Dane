'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const EA = require('./cargar.js');

const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'paleta.css'), 'utf8');
const color = (n) => { const m = new RegExp('--' + n + ': *(#[0-9A-Fa-f]{6})').exec(css); assert.ok(m, 'existe --' + n); return m[1]; };
function luminancia(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contraste(a, b) {
  const la = luminancia(a), lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

test('la paleta define base, sombra y luz para cada color', () => {
  ['tinta', 'crema', 'azul', 'turquesa', 'verde', 'lima', 'amarillo', 'naranja', 'coral', 'violeta', 'rosa', 'gris', 'madera', 'metal']
    .forEach((n) => { color(n); color(n + '-s'); color(n + '-l'); });
});

test('contraste AA (4.5:1) en las combinaciones de texto de la interfaz', () => {
  const pares = [
    ['crema-l', 'tinta', 'texto general'], ['crema-l', 'tinta-s', 'marcador'], ['crema-l', 'tinta-l', 'botón secundario'],
    ['tinta-s', 'amarillo', 'botón principal'], ['tinta-s', 'coral', 'botón de peligro'], ['tinta-s', 'verde', 'sello de acierto'],
    ['gris-l', 'tinta', 'texto tenue'], ['gris', 'tinta-s', 'rótulos del marcador'], ['coral-l', 'tinta', 'mensajes de error'],
    ['verde-l', 'tinta', 'respuesta correcta'], ['amarillo', 'tinta', 'acentos'], ['tinta-s', 'crema-l', 'globo del asistente']
  ];
  pares.forEach(([a, b, uso]) => {
    const r = contraste(color(a), color(b));
    assert.ok(r >= 4.5, uso + ': ' + a + ' sobre ' + b + ' = ' + r.toFixed(2));
  });
  EA.CONFIG.COLORES_EQUIPO.forEach((c) => {
    const r = contraste(color('tinta-s'), c.hex);
    assert.ok(r >= 4.5, 'símbolo sobre color de equipo ' + c.nombre + ' = ' + r.toFixed(2));
  });
});

test('escenas: 5 salas, 3–4 candados, puzzle de objetos solo en 2 y bien formado', () => {
  const ids = Object.keys(EA.ESCENAS);
  assert.equal(ids.length, 5);
  assert.deepEqual(EA.ORDEN_ESCENAS.slice().sort(), ids.slice().sort());
  let conPuzzle = 0;
  ids.forEach((id) => {
    const e = EA.ESCENAS[id];
    assert.ok(e.candados.length >= 3 && e.candados.length <= 4, id);
    assert.ok(e.nombre && e.intro && e.acento);
    if (!e.puzzle) return;
    conPuzzle++;
    const pz = e.puzzle;
    assert.equal(Object.keys(pz.objetos).length, 2, 'cadena corta: dos objetos');
    assert.deepEqual(pz.combinacion.slice().sort(), Object.keys(pz.objetos).sort());
    assert.ok(pz.revela >= 0 && pz.revela < e.candados.length);
    assert.ok(e.examinar[pz.usarEn], 'el punto de uso se puede examinar');
    assert.equal(pz.pistas.length, 3);
    assert.ok(pz.resultado.id && pz.resultado.nombre && pz.alUsar);
  });
  assert.equal(conPuzzle, 2);
});
