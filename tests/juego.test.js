'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const EA = require('./cargar.js');
const J = EA.juego;
const CFG = EA.CONFIG;

const preset = () => EA.presets.normalizarPreset(JSON.parse(JSON.stringify(EA.PRESETS_EJEMPLO[0])));
const equipos = (n) => Array.from({ length: n }, (_, i) => ({ nombre: 'Equipo ' + (i + 1), color: 'azul', simbolo: 'circulo' }));
const nueva = (n = 2, opciones = {}, semilla = 123) => J.crearPartida(preset(), equipos(n), opciones, semilla);

/** Índice mostrado de la alternativa correcta (o de una incorrecta) de la pregunta abierta. */
function opcion(st, correcta) {
  const eq = J.equipoActual(st);
  const c = eq.salas[eq.salaIdx].candados[st.activo];
  const q = st.preset.salas[eq.salaIdx].preguntas[c.pregunta];
  const vista = J.vistaPregunta(st);
  const idx = vista.alternativas.indexOf(q.alternativas[q.correcta]);
  assert.ok(idx >= 0);
  return correcta ? idx : (idx + 1) % vista.alternativas.length;
}

/** Resuelve el puzzle de objetos de la sala actual, si tiene. */
function resolverPuzzle(st) {
  const eq = J.equipoActual(st);
  const esc = J.escenaDe(st, eq);
  const sala = J.salaDe(st, eq);
  if (!esc.puzzle || sala.usado) return;
  const [a, b] = esc.puzzle.combinacion;
  assert.equal(J.recoger(st, a).ok, true);
  assert.equal(J.recoger(st, b).ok, true);
  assert.equal(J.combinar(st, a, b).ok, true);
  assert.equal(J.usar(st, esc.puzzle.resultado.id, esc.puzzle.usarEn).ok, true);
}

/** Juega un turno: intenta el primer candado cerrado. Devuelve el resultado. */
function turno(st, acierta, fraccion) {
  assert.equal(J.iniciarTurno(st), true);
  resolverPuzzle(st);
  const sala = J.salaDe(st, J.equipoActual(st));
  const idx = sala.candados.findIndex((c) => c.estado === 'cerrado');
  assert.ok(J.abrirPregunta(st, idx));
  const r = J.responder(st, opcion(st, acierta), fraccion);
  J.pasarTurno(st, 10);
  return r;
}

test('crearPartida: cada equipo tiene su copia y los candados coinciden con la escena', () => {
  const st = nueva(3);
  assert.equal(st.equipos.length, 3);
  st.equipos.forEach((eq) => {
    assert.equal(eq.salas.length, 3);
    eq.salas.forEach((s, i) => {
      assert.equal(s.candados.length, EA.ESCENAS[st.preset.salas[i].escena].candados.length);
      const ids = s.candados.map((c) => c.pregunta);
      assert.equal(new Set(ids).size, ids.length, 'sin preguntas repetidas dentro de la sala');
    });
  });
  assert.notEqual(st.equipos[0].salas, st.equipos[1].salas);
  assert.equal(st.fase, 'cambio');
});

test('sorteo: con banco más grande los equipos reciben preguntas distintas', () => {
  const st = nueva(2);
  // Banco de 5 y 4 candados: al menos una pregunta difiere entre los dos equipos.
  const a = st.equipos[0].salas[0].candados.map((c) => c.pregunta).sort();
  const b = st.equipos[1].salas[0].candados.map((c) => c.pregunta).sort();
  assert.notDeepEqual(a, b);
  // Con banco de 8 y 4 candados no comparten ninguna.
  const p = preset();
  p.salas[0].preguntas = p.salas[0].preguntas.concat(p.salas[1].preguntas.slice(0, 3));
  const st2 = J.crearPartida(p, equipos(2), {}, 5);
  const x = st2.equipos[0].salas[0].candados.map((c) => c.pregunta);
  const y = st2.equipos[1].salas[0].candados.map((c) => c.pregunta);
  assert.equal(x.filter((q) => y.includes(q)).length, 0);
});

test('sorteo: el orden de alternativas se baraja por equipo y es una permutación', () => {
  let distintos = 0;
  for (let semilla = 1; semilla <= 20; semilla++) {
    const st = nueva(2, {}, semilla);
    st.equipos.forEach((eq) => eq.salas.forEach((s) => s.candados.forEach((c) => {
      assert.deepEqual(c.orden.slice().sort(), [0, 1, 2, 3]);
      if (c.orden.join() !== '0,1,2,3') distintos++;
    })));
  }
  assert.ok(distintos > 300, 'la mayoría de los órdenes están barajados');
  assert.deepEqual(nueva(2, {}, 9).equipos, nueva(2, {}, 9).equipos, 'misma semilla, mismo sorteo');
});

test('explorar no gasta turno; el puzzle revela el candado oculto', () => {
  const st = nueva(2);
  J.iniciarTurno(st);
  const sala = J.salaDe(st, J.equipoActual(st));
  assert.equal(sala.candados[3].oculto, true);
  assert.equal(J.puedeIntentar(st, 3), false);
  assert.equal(J.abrirPregunta(st, 3), null);
  assert.match(J.pistaPuzzle(st), /dos objetos/);

  assert.equal(J.recoger(st, 'limon').ok, true);
  assert.equal(J.recoger(st, 'limon').ok, false, 'no se recoge dos veces');
  assert.equal(J.recoger(st, 'inexistente').ok, false);
  assert.equal(J.combinar(st, 'limon', 'electrodos').ok, false, 'falta recoger el otro');
  assert.equal(J.recoger(st, 'electrodos').ok, true);
  assert.match(J.pistaPuzzle(st), /Combinen/);
  assert.equal(J.usar(st, 'limon', 'panel').ok, false);
  assert.equal(J.combinar(st, 'limon', 'limon').ok, false);

  const comb = J.combinar(st, 'electrodos', 'limon');
  assert.equal(comb.ok, true);
  assert.deepEqual(sala.inventario, ['pila-limon']);
  assert.match(J.pistaPuzzle(st), /panel/);
  assert.equal(J.usar(st, 'pila-limon', 'otro').ok, false);
  const uso = J.usar(st, 'pila-limon', 'panel');
  assert.equal(uso.ok, true);
  assert.equal(uso.revela, 3);
  assert.equal(sala.candados[3].oculto, false);
  assert.deepEqual(sala.inventario, []);
  assert.equal(J.puedeIntentar(st, 3), true);

  assert.equal(st.turno, 0);
  assert.equal(st.fase, 'explorar', 'sigue siendo el turno del mismo equipo');
  assert.match(J.pistaPuzzle(st), /ya está resuelto/);
});

test('puntaje: primer intento, tras pista y tras explicación', () => {
  const st = nueva(2);
  // Equipo 1 acierta a la primera
  let r = turno(st, true);
  assert.equal(r.tipo, 'primer');
  assert.equal(r.total, CFG.PUNTOS_PRIMER_INTENTO);
  assert.equal(st.equipos[0].puntaje, 100);
  assert.equal(st.turno, 1);

  // Equipo 2 falla: recibe pista y el candado sigue cerrado
  r = turno(st, false);
  assert.equal(r.tipo, 'fallo');
  assert.ok(r.pista.length > 0);
  assert.equal(r.abierto, false);
  assert.equal(st.equipos[1].puntaje, 0);
  assert.equal(st.equipos[1].salas[0].candados.filter((c) => c.estado === 'abierto').length, 0);

  turno(st, true); // equipo 1
  // Equipo 2 reintenta el mismo candado y acierta: 50
  r = turno(st, true);
  assert.equal(r.tipo, 'pista');
  assert.equal(r.total, CFG.PUNTOS_TRAS_PISTA);

  turno(st, true); // equipo 1
  // Equipo 2 falla dos veces otro candado: explicación, se abre con 0
  r = turno(st, false);
  assert.equal(r.tipo, 'fallo');
  turno(st, true); // equipo 1 (4.º candado: completa la sala)
  r = turno(st, false);
  assert.equal(r.tipo, 'explicacion');
  assert.equal(r.abierto, true);
  assert.equal(r.puntos, 0);
  assert.ok(r.explicacion.length > 0);
  assert.ok(r.correctaTexto.length > 0);
  assert.deepEqual(st.equipos[1].stats, { primer: 0, pista: 1, explicacion: 1 });
  assert.equal(st.equipos[1].puntaje, 50);
});

test('bono de sala y avance a la sala siguiente', () => {
  const st = nueva(2);
  let r;
  for (let i = 0; i < 4; i++) { r = turno(st, true); turno(st, false); }
  assert.equal(r.salaCompletada, true);
  assert.equal(r.bonoSala, CFG.BONO_SALA_COMPLETADA);
  assert.equal(st.equipos[0].salaIdx, 1);
  assert.equal(st.equipos[0].puntaje, 4 * 100 + 50);
  assert.equal(J.escenaDe(st, st.equipos[0]).id, 'biologia');
});

test('bono por rapidez solo con temporizador y solo al acertar', () => {
  let st = nueva(2, { temporizador: 60 });
  let r = turno(st, true, 1);
  assert.equal(r.bonoRapidez, CFG.BONO_RAPIDEZ_MAX);
  r = turno(st, true, 0.5);
  assert.equal(r.bonoRapidez, Math.round(CFG.BONO_RAPIDEZ_MAX * 0.5));
  r = turno(st, false, 1);
  assert.equal(r.bonoRapidez, 0);
  st = nueva(2, {});
  assert.equal(turno(st, true, 1).bonoRapidez, 0);
  assert.equal(J.crearPartida(preset(), equipos(2), { temporizador: 5 }, 1).opciones.temporizador, CFG.TEMPORIZADOR_MIN);
});

test('tiempo agotado: con pregunta abierta cuenta como error; sin pregunta solo pasa el turno', () => {
  const st = nueva(2, { temporizador: 30 });
  J.iniciarTurno(st);
  resolverPuzzle(st);
  J.abrirPregunta(st, 0);
  assert.equal(J.pasarTurno(st, 30), null, 'no se puede pasar con la pregunta abierta');
  const r = J.responder(st, null, 0);
  assert.equal(r.correcto, false);
  assert.equal(r.tiempoAgotado, true);
  assert.equal(r.tipo, 'fallo');
  assert.equal(st.equipos[0].salas[0].candados[0].fallos, 1);
  J.pasarTurno(st, 30);
  assert.equal(st.turno, 1);

  J.iniciarTurno(st);
  const antes = JSON.stringify(st.equipos[1].salas);
  const p = J.pasarTurno(st, 30);
  assert.equal(p.fin, false);
  assert.equal(st.turno, 0);
  assert.equal(JSON.stringify(st.equipos[1].salas), antes, 'sin penalización');
  assert.equal(st.equipos[1].tiempo, 30);
});

test('no se puede responder fuera de una pregunta ni reabrir un candado abierto', () => {
  const st = nueva(2);
  assert.equal(J.responder(st, 0), null);
  assert.equal(J.abrirPregunta(st, 0), null, 'en fase de cambio no se abren candados');
  turno(st, true);
  turno(st, true);
  J.iniciarTurno(st);
  const abierto = J.salaDe(st, J.equipoActual(st)).candados.findIndex((c) => c.estado === 'abierto');
  assert.equal(J.abrirPregunta(st, abierto), null);
});

test('PARTIDA COMPLETA: 2 equipos, aciertos, fallo con pista, fallo con explicación y escape de ambos', () => {
  const st = nueva(2, {}, 2024);
  // Guion del equipo 2: falla una vez el 2.º candado (pista) y dos veces el 5.º (explicación).
  const fallosB = { 1: 1, 4: 2 };
  let intentoB = 0, resueltosB = 0;
  const resultados = [[], []];
  let seguridad = 0;

  while (st.fase !== 'fin') {
    assert.ok(++seguridad < 200, 'la partida debe terminar');
    const t = st.turno;
    let acierta = true;
    if (t === 1) {
      const quedan = fallosB[resueltosB] || 0;
      if (quedan > intentoB) { acierta = false; intentoB++; }
    }
    const r = turno(st, acierta);
    resultados[t].push(r);
    if (t === 1 && r.abierto) { resueltosB++; intentoB = 0; }
  }

  const [A, B] = st.equipos;
  assert.equal(A.escapo, true);
  assert.equal(B.escapo, true);
  assert.equal(A.ordenEscape, 1);
  assert.equal(B.ordenEscape, 2);
  assert.equal(st.terminado, true);
  assert.equal(st.terminadoPorDocente, false);

  // Equipo A: 12 candados al primer intento, 3 salas, escapa primero.
  assert.deepEqual(A.stats, { primer: 12, pista: 0, explicacion: 0 });
  assert.equal(A.puntaje, 12 * 100 + 3 * 50 + 200);
  assert.equal(resultados[0][resultados[0].length - 1].bonoEscape, CFG.BONO_ESCAPAR_PRIMERO);

  // Equipo B: 10 al primer intento, 1 con pista, 1 con explicación; sin bono de escape.
  assert.deepEqual(B.stats, { primer: 10, pista: 1, explicacion: 1 });
  assert.equal(B.puntaje, 10 * 100 + 50 + 0 + 3 * 50);
  assert.equal(resultados[1][resultados[1].length - 1].bonoEscape, 0);
  assert.equal(resultados[1].filter((r) => r.tipo === 'fallo').length, 2);
  assert.equal(resultados[1].filter((r) => r.tipo === 'explicacion').length, 1);

  // Tras escapar A, B juega turnos seguidos (A se salta).
  assert.equal(A.turnos, 12);
  assert.equal(B.turnos, 14);
  assert.equal(B.tiempo, 140);

  const res = J.resumen(st);
  assert.equal(res.equipos[0].nombre, 'Equipo 1');
  assert.equal(res.equipos[0].puesto, 1);
  assert.equal(res.equipos[1].puesto, 2);
  assert.equal(res.repasar.length, 2);
  assert.equal(res.repasar[0].fallos, 2, 'la más fallada va primero');
  assert.ok(res.repasar[0].explicacion && res.repasar[0].correcta);

  const csv = J.resultadosCSV(res);
  assert.ok(csv.startsWith('﻿'));
  assert.match(csv, /"Equipo 1","1350"/);
  assert.match(csv, /"Para repasar"/);
});

test('el docente puede terminar la partida antes; el resumen ordena y marca empates', () => {
  const st = nueva(3);
  turno(st, true);
  turno(st, true);
  J.iniciarTurno(st);
  J.terminar(st, 12);
  assert.equal(st.fase, 'fin');
  assert.equal(st.terminadoPorDocente, true);
  assert.equal(st.equipos[2].tiempo, 12);
  const res = J.resumen(st);
  assert.equal(res.equipos[0].puesto, 1);
  assert.equal(res.equipos[1].puesto, 1, 'empate en puntaje comparte puesto');
  assert.equal(res.equipos[2].puesto, 3);
  assert.equal(res.equipos[2].escapo, false);
  assert.deepEqual(J.pasarTurno(st, 0), { fin: true });
});

test('CSV neutraliza fórmulas de hoja de cálculo', () => {
  const st = J.crearPartida(preset(), [{ nombre: '=HYPERLINK("x")', color: 'a', simbolo: 'b' }, { nombre: 'B', color: 'a', simbolo: 'b' }], {}, 1);
  const csv = J.resultadosCSV(J.resumen(st));
  assert.ok(csv.includes('"\'=HYPERLINK(""x"")"'));
});
