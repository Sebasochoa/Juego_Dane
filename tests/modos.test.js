'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const EA = require('./cargar.js');
const J = EA.juego;
const CFG = EA.CONFIG;

const preset = () => EA.presets.normalizarPreset(EA.ejemploPorId('ejemplo-ciencias-basicas'));
const equipo = (n) => Array.from({ length: n }, (_, i) => ({ nombre: 'Equipo ' + (i + 1), color: 'azul', simbolo: 'circulo' }));

function opcionCorrecta(st, bien) {
  const eq = J.equipoActual(st), c = eq.salas[eq.salaIdx].candados[st.activo];
  const q = st.preset.salas[eq.salaIdx].preguntas[c.pregunta];
  const i = c.orden.indexOf(q.correcta);
  return bien ? i : (i + 1) % c.orden.length;
}
function resolverPuzzle(st) {
  const eq = J.equipoActual(st), esc = J.escenaDe(st, eq), sala = J.salaDe(st, eq);
  if (!esc.puzzle || sala.usado) return;
  const [a, b] = esc.puzzle.combinacion;
  J.recoger(st, a); J.recoger(st, b); J.combinar(st, a, b); J.usar(st, esc.puzzle.resultado.id, esc.puzzle.usarEn);
}

test('modo solo: un único equipo, sin temporizador por turno y con tiempo límite acotado', () => {
  const st = J.crearPartida(preset(), equipo(3), { modo: 'solo', temporizador: 60, limite: 20 * 60 }, 1);
  assert.equal(st.equipos.length, 1, 'se queda solo con el primer equipo');
  assert.equal(J.esSolo(st), true);
  assert.equal(st.opciones.temporizador, 0, 'no hay temporizador por turno en modo solo');
  assert.equal(st.opciones.limite, 1200);
  assert.equal(J.crearPartida(preset(), equipo(1), { modo: 'solo', limite: 10 }, 1).opciones.limite, CFG.LIMITE_MIN * 60);
  assert.equal(J.crearPartida(preset(), equipo(1), { modo: 'solo', limite: 99999 }, 1).opciones.limite, CFG.LIMITE_MAX * 60);
  assert.equal(J.crearPartida(preset(), equipo(1), { modo: 'solo' }, 1).opciones.limite, 0, 'sin límite si no se pide');

  const t = J.crearPartida(preset(), equipo(2), { limite: 600, temporizador: 60 }, 1);
  assert.equal(t.opciones.modo, 'turnos', 'por turnos es el modo por defecto');
  assert.equal(t.opciones.limite, 0, 'el tiempo límite total es solo del modo solo');
  assert.equal(t.opciones.temporizador, 60);
});

test('modo solo: tras cada intento sigue el mismo equipo y puede reintentar de inmediato', () => {
  const st = J.crearPartida(preset(), equipo(1), { modo: 'solo' }, 3);
  J.iniciarTurno(st);
  resolverPuzzle(st);
  J.abrirPregunta(st, 0);
  const r = J.responder(st, opcionCorrecta(st, false));
  assert.equal(r.tipo, 'fallo');
  const p = J.pasarTurno(st, 12);
  assert.deepEqual(p, { fin: false, equipo: 0 });
  J.iniciarTurno(st);
  J.abrirPregunta(st, 0);
  assert.ok(J.vistaPregunta(st).pista.length > 0, 'el reintento muestra la pista');
  assert.equal(J.responder(st, opcionCorrecta(st, true)).total, CFG.PUNTOS_TRAS_PISTA);
});

test('modo solo: partida completa con escape y bono', () => {
  const st = J.crearPartida(preset(), equipo(1), { modo: 'solo', limite: 600 }, 7);
  let guardia = 0, ultimo;
  while (st.fase !== 'fin') {
    assert.ok(++guardia < 50);
    J.iniciarTurno(st);
    resolverPuzzle(st);
    const sala = J.salaDe(st, J.equipoActual(st));
    J.abrirPregunta(st, sala.candados.findIndex((c) => c.estado === 'cerrado'));
    ultimo = J.responder(st, opcionCorrecta(st, true));
    J.pasarTurno(st, 5);
  }
  assert.equal(ultimo.escapo, true);
  assert.equal(ultimo.bonoEscape, CFG.BONO_ESCAPAR_PRIMERO, 'escapar también da bono en modo solo');
  const r = J.resumen(st);
  assert.equal(r.modo, 'solo');
  assert.equal(r.motivoFin, 'escape');
  assert.equal(r.equipos[0].puntaje, 12 * 100 + 3 * 50 + 200);
  assert.equal(r.equipos[0].candadosAbiertos, 12);
  assert.equal(r.equipos[0].candadosTotales, 12);
  assert.equal(r.equipos[0].tiempo, 60);
  const csv = J.resultadosCSV(r);
  assert.match(csv, /"Modo","Un solo equipo"/);
  assert.match(csv, /"Fin de la partida","Todos escaparon"/);
});

test('tiempo límite agotado: termina la partida con motivo «tiempo»', () => {
  const st = J.crearPartida(preset(), equipo(1), { modo: 'solo', limite: 300 }, 2);
  J.iniciarTurno(st);
  resolverPuzzle(st);
  J.abrirPregunta(st, 0);
  J.responder(st, opcionCorrecta(st, true));
  J.pasarTurno(st, 40);
  J.iniciarTurno(st);
  J.abrirPregunta(st, 1);
  J.terminar(st, 260, 'tiempo');
  assert.equal(st.fase, 'fin');
  assert.equal(st.motivoFin, 'tiempo');
  assert.equal(st.terminadoPorDocente, false);
  assert.equal(st.activo, null, 'la pregunta abierta se descarta');
  const r = J.resumen(st);
  assert.equal(r.equipos[0].tiempo, 300);
  assert.equal(r.equipos[0].candadosAbiertos, 1);
  assert.equal(r.equipos[0].escapo, false);
  assert.match(J.resultadosCSV(r), /"Fin de la partida","Se acabó el tiempo límite"/);
});

test('motivo de fin en modo por turnos', () => {
  const st = J.crearPartida(preset(), equipo(2), {}, 1);
  J.iniciarTurno(st);
  J.terminar(st, 3);
  assert.equal(st.motivoFin, 'docente');
  assert.equal(st.terminadoPorDocente, true);
  assert.match(J.resultadosCSV(J.resumen(st)), /"Modo","Por turnos"/);
});
