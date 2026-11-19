'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const EA = require('./cargar.js');
const H = EA.historia;

const resumen = (extra, equipos) => Object.assign({ modo: 'turnos', motivoFin: 'escape', limite: 0, equipos }, extra);
const fila = (nombre, extra) => Object.assign({ nombre, puntaje: 500, escapo: true, ordenEscape: null, candadosAbiertos: 12, candadosTotales: 12 }, extra);

test('enumerar y minutos', () => {
  assert.equal(H.enumerar(['A']), 'A');
  assert.equal(H.enumerar(['A', 'B']), 'A y B');
  assert.equal(H.enumerar(['A', 'B', 'C']), 'A, B y C');
  assert.equal(H.minutos(60), '1 minuto');
  assert.equal(H.minutos(1200), '20 minutos');
});

test('introducción: cuatro paneles con arte registrado y la ruta del preset', () => {
  const p = H.intro({ salas: ['quimica', 'biologia', 'control'], modo: 'turnos' });
  assert.equal(p.length, 4);
  p.forEach((x) => { assert.ok(x.arte && x.titulo && x.texto.length > 60, x.titulo); });
  assert.match(p[0].texto, /doctor Ámbar/);
  assert.match(p[1].titulo, /Apagón/);
  assert.deepEqual(p[3].opciones.salas, ['quimica', 'biologia', 'control']);
  assert.match(p[3].texto, /3 salas: Laboratorio de Química, Laboratorio de Biología y Sala de Control/);
  assert.match(p[3].texto, /por turnos/);
  assert.match(p[3].texto, /primer equipo en escapar gana/);
});

test('introducción en modo un solo equipo: con y sin tiempo límite', () => {
  const con = H.intro({ salas: ['quimica', 'fisica'], modo: 'solo', limite: 1200 })[3].texto;
  assert.match(con, /20 minutos/);
  assert.match(con, /antes de que se acabe el tiempo/);
  assert.doesNotMatch(con, /turnos/);
  const sin = H.intro({ salas: ['quimica', 'fisica'], modo: 'solo', limite: 0 })[3].texto;
  assert.match(sin, /antes de que vuelva el doctor Ámbar/);
});

test('final: sin historia si la partida la terminó el docente', () => {
  assert.deepEqual(H.final(resumen({ motivoFin: 'docente' }, [fila('A')])), []);
});

test('final por turnos: nombra al primer equipo en escapar y termina con la nota del doctor', () => {
  const p = H.final(resumen({}, [fila('Protones', { ordenEscape: 2 }), fila('Neutrones', { ordenEscape: 1 })]));
  assert.equal(p.length, 2);
  assert.equal(p[0].arte, 'hist.salida');
  assert.match(p[0].texto, /Neutrones fue el primer equipo en escapar y, al final, todos lograron salir/);
  assert.equal(p[1].arte, 'hist.nota');
  assert.match(p[1].texto, /— Dr\. Ámbar/);
});

test('final en modo solo: escape y tiempo agotado', () => {
  const ok = H.final(resumen({ modo: 'solo' }, [fila('Equipo Curie', { puntaje: 1550, ordenEscape: 1 })]));
  assert.match(ok[0].texto, /Equipo Curie escapó con 1550 puntos/);
  assert.equal(ok[0].opciones.celebran, true);
  const mal = H.final(resumen({ modo: 'solo', motivoFin: 'tiempo' }, [fila('Equipo Curie', { escapo: false, candadosAbiertos: 5 })]));
  assert.equal(mal[0].arte, 'hist.sinEnergia');
  assert.match(mal[0].texto, /5 de 12 candados/);
  assert.equal(mal[1].opciones.celebran, false);
  assert.match(mal[1].texto, /Estuvieron muy cerca/);
});
