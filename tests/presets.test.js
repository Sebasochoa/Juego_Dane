'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const EA = require('./cargar.js');
const P = EA.presets;

const ejemplo = () => P.normalizarPreset(JSON.parse(JSON.stringify(EA.PRESETS_EJEMPLO[0])));
const pregunta = (extra) => Object.assign({
  enunciado: '¿2 + 2?', alternativas: ['4', '3', '5', '22'], correcta: 0, pista: 'p', explicacion: 'e', rama: '', imagen: ''
}, extra);

test('el preset de ejemplo es válido y tiene 3 salas', () => {
  const p = ejemplo();
  const v = P.validarPreset(p);
  assert.deepEqual(v.errores, []);
  assert.equal(p.salas.length, 3);
  p.salas.forEach((s) => {
    assert.ok(s.preguntas.length >= EA.ESCENAS[s.escena].candados.length);
    s.preguntas.forEach((q) => {
      assert.ok(q.pista && q.explicacion, 'cada pregunta de ejemplo trae pista y explicación');
      assert.equal(new Set(q.alternativas).size, q.alternativas.length);
    });
  });
});

test('la plantilla vacía existe y no es jugable todavía', () => {
  const p = P.normalizarPreset(EA.PRESETS_EJEMPLO[1]);
  assert.equal(P.validarPreset(p).ok, false);
});

test('validarPregunta detecta cada problema', () => {
  const v = (extra) => P.validarPregunta(P.normalizarPregunta(pregunta(extra)));
  assert.deepEqual(v({}), []);
  assert.match(v({ enunciado: '   ' }).join(' '), /enunciado/);
  assert.match(v({ alternativas: ['a'] }).join(' '), /entre 2 y 5/);
  assert.match(v({ alternativas: ['a', 'b', 'c', 'd', 'e', 'f'] }).join(' '), /entre 2 y 5/);
  assert.match(v({ alternativas: ['a', ' A ', 'c', 'd'] }).join(' '), /duplicadas/);
  assert.match(v({ alternativas: ['a', '', 'c', 'd'] }).join(' '), /vacías/);
  assert.match(v({ correcta: 7 }).join(' '), /una alternativa correcta/);
  assert.match(v({ correcta: 'x' }).join(' '), /una alternativa correcta/);
  assert.match(v({ imagen: 'javascript:alert(1)' }).join(' '), /imagen/);
  assert.match(v({ imagen: 'https://ejemplo.com/a.png' }).join(' '), /imagen/);
  assert.deepEqual(v({ imagen: 'img/celula.png' }), []);
  assert.deepEqual(v({ imagen: 'data:image/png;base64,AAAA' }), []);
  assert.deepEqual(v({ alternativas: ['Sí', 'No'], correcta: 1 }), []);
});

test('validarPreset: mínimo de preguntas por sala, número de salas y escenario', () => {
  const p = ejemplo();
  p.salas[0].preguntas = p.salas[0].preguntas.slice(0, 3);
  let v = P.validarPreset(p);
  assert.equal(v.ok, false);
  assert.match(v.errores[0].mensaje, /al menos 4 preguntas/);
  assert.equal(v.errores[0].sala, 0);

  const q = ejemplo();
  q.salas = q.salas.slice(0, 1);
  assert.match(P.validarPreset(q).errores[0].mensaje, /entre 2 y 5 salas/);

  const r = ejemplo();
  r.salas[1].escena = 'cocina';
  assert.match(P.validarPreset(r).errores[0].mensaje, /no existe/);

  const s = ejemplo();
  s.nombre = '';
  assert.match(P.validarPreset(s).errores[0].mensaje, /nombre/);
});

test('normalizar descarta campos desconocidos y tipos raros', () => {
  const p = P.normalizarPreset({ nombre: 5, grado: 'x', salas: [{ escena: 'quimica', preguntas: [{ enunciado: ['a'], alternativas: 'no', malo: '<script>' }] }], extra: 1 });
  assert.equal(p.nombre, '5');
  assert.equal(p.grado, 'mixto');
  assert.equal(p.extra, undefined);
  assert.deepEqual(p.salas[0].preguntas[0].alternativas, []);
  assert.equal(p.salas[0].preguntas[0].malo, undefined);
  assert.doesNotThrow(() => P.normalizarPreset(null));
});

test('exportar e importar ida y vuelta', () => {
  const json = JSON.stringify(P.exportar([ejemplo()]));
  const r = P.leerImportacion(json);
  assert.equal(r.ok, true);
  assert.equal(r.validos.length, 1);
  assert.deepEqual(r.validos[0], ejemplo());
});

test('importar: errores claros', () => {
  assert.match(P.leerImportacion('{no json').error, /JSON válido/);
  assert.match(P.leerImportacion('{"hola":1}').error, /reconocibles/);
  assert.match(P.leerImportacion(JSON.stringify({ formato: 'otro', presets: [] })).error, /no es de este juego/);
  assert.match(P.leerImportacion(JSON.stringify({ formato: P.FORMATO, esquema: 99, presets: [ejemplo()] })).error, /más nueva/);
  const mixto = P.leerImportacion(JSON.stringify({ formato: P.FORMATO, esquema: 1, presets: [ejemplo(), { nombre: 'Roto', salas: [] }] }));
  assert.equal(mixto.ok, true);
  assert.equal(mixto.validos.length, 1);
  assert.equal(mixto.rechazados[0].nombre, 'Roto');
  // También acepta un preset suelto
  assert.equal(P.leerImportacion(JSON.stringify(ejemplo())).validos.length, 1);
});

test('fusionar maneja conflictos de nombre', () => {
  const base = [ejemplo()];
  const nuevo = ejemplo();
  nuevo.descripcion = 'cambiado';
  assert.deepEqual(P.conflictos(base, [nuevo]), [nuevo.nombre]);

  const ren = P.fusionar(base, [nuevo], 'renombrar');
  assert.equal(ren.presets.length, 2);
  assert.equal(ren.presets[1].nombre, nuevo.nombre + ' (2)');
  assert.notEqual(ren.presets[1].id, ren.presets[0].id);

  const rem = P.fusionar(base, [nuevo], 'reemplazar');
  assert.equal(rem.presets.length, 1);
  assert.equal(rem.presets[0].descripcion, 'cambiado');
  assert.equal(rem.reemplazados, 1);

  const omi = P.fusionar(base, [nuevo], 'omitir');
  assert.equal(omi.presets.length, 1);
  assert.equal(omi.omitidos, 1);
  assert.notEqual(omi.presets[0].descripcion, 'cambiado');
});

test('duplicar y filtrar por grado', () => {
  const a = ejemplo();
  const b = P.duplicar(a, [a]);
  assert.notEqual(b.id, a.id);
  assert.equal(b.nombre, a.nombre + ' (copia)');
  b.grado = '3';
  assert.equal(P.filtrarPorGrado([a, b], '3').length, 1);
  assert.equal(P.filtrarPorGrado([a, b], 'todos').length, 2);
  assert.equal(P.nombreLibre('X', ['x', 'X (2)']), 'X (3)');
});
