'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const EA = require('./cargar.js');
const U = EA.util;

test('formatear convierte subíndices y superíndices', () => {
  assert.equal(U.formatear('H_2O'), 'H<sub>2</sub>O');
  assert.equal(U.formatear('m/s^2'), 'm/s<sup>2</sup>');
  assert.equal(U.formatear('CO_2 y O_2'), 'CO<sub>2</sub> y O<sub>2</sub>');
  assert.equal(U.formatear('SO_4^{2-}'), 'SO<sub>4</sub><sup>2-</sup>');
  assert.equal(U.formatear('Na^+'), 'Na<sup>+</sup>');
  assert.equal(U.formatear('10^-3'), '10<sup>-3</sup>');
  assert.equal(U.formatear('x_{máx}'), 'x<sub>máx</sub>');
});

test('formatear escapa HTML de los presets (XSS)', () => {
  const s = U.formatear('<img src=x onerror="alert(1)"> & <script>x</script>');
  assert.ok(!/<(img|script)/i.test(s));
  assert.ok(s.includes('&lt;img'));
  assert.ok(s.includes('&amp;'));
  assert.equal(U.formatear('a_{<b>}'), 'a<sub>&lt;b&gt;</sub>');
  assert.equal(U.escapar('"\'`'), '&quot;&#39;&#96;');
});

test('plano quita la notación', () => {
  assert.equal(U.plano('H_2O a 9,8 m/s^2'), 'H2O a 9,8 m/s2');
});

test('rng con semilla es determinista y barajar no pierde elementos', () => {
  const a = U.crearRng(42), b = U.crearRng(42);
  for (let i = 0; i < 20; i++) assert.equal(a(), b());
  const lista = U.indices(10);
  const mezcla = U.barajar(lista, U.crearRng(7));
  assert.deepEqual(mezcla.slice().sort((x, y) => x - y), lista);
  assert.deepEqual(lista, U.indices(10), 'no modifica el original');
});

test('formatoTiempo', () => {
  assert.equal(U.formatoTiempo(0), '0:00');
  assert.equal(U.formatoTiempo(75), '1:15');
});
