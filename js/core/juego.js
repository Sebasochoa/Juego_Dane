/*
 * Motor de la partida (lógica pura, sin DOM).
 * Fases: 'cambio' -> 'explorar' -> 'pregunta' -> 'resultado' -> 'cambio' ... -> 'fin'
 *
 * Modos:
 *   'turnos' -> de 2 a 4 equipos se alternan; temporizador opcional por turno.
 *   'solo'   -> un solo equipo juega todo el tiempo; tiempo límite total opcional.
 *               Cada intento de candado es un «turno» interno (la interfaz no muestra el cambio).
 */
(function (EA) {
  'use strict';
  var CFG = EA.CONFIG;
  var U = EA.util;

  function limitar(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function crearPartida(preset, equiposCfg, opciones, semilla) {
    opciones = opciones || {};
    var modo = opciones.modo === 'solo' ? 'solo' : 'turnos';
    if (modo === 'solo') equiposCfg = equiposCfg.slice(0, 1);
    var rng = U.crearRng(semilla == null ? Date.now() : semilla);
    var equipos = equiposCfg.map(function (c, t) {
      return {
        id: t, nombre: c.nombre, color: c.color, simbolo: c.simbolo,
        puntaje: 0, salaIdx: 0, escapo: false, ordenEscape: null, tiempo: 0, turnos: 0,
        stats: { primer: 0, pista: 0, explicacion: 0 },
        salas: []
      };
    });

    preset.salas.forEach(function (sala) {
      var esc = EA.ESCENAS[sala.escena];
      var n = esc.candados.length;
      // El banco se baraja una vez; cada equipo toma un tramo distinto (con vuelta si no alcanza).
      var orden = U.barajar(U.indices(sala.preguntas.length), rng);
      equipos.forEach(function (eq, t) {
        var elegidas = [];
        for (var i = 0; i < n; i++) elegidas.push(orden[(t * n + i) % orden.length]);
        elegidas = U.barajar(elegidas, rng);
        eq.salas.push({
          candados: elegidas.map(function (qi, i) {
            return {
              pregunta: qi,
              orden: U.barajar(U.indices(sala.preguntas[qi].alternativas.length), rng),
              fallos: 0,
              estado: 'cerrado',
              puntos: 0,
              oculto: !!(esc.puzzle && esc.puzzle.revela === i)
            };
          }),
          inventario: [],
          recogidos: [],
          combinado: false,
          usado: false,
          completada: false
        });
      });
    });

    return {
      preset: preset,
      equipos: equipos,
      turno: 0,
      fase: 'cambio',
      activo: null,          // índice del candado con pregunta abierta
      escapes: 0,
      numTurno: 1,
      opciones: {
        modo: modo,
        // segundos por turno (solo en modo por turnos)
        temporizador: modo === 'turnos' && opciones.temporizador ? limitar(opciones.temporizador, CFG.TEMPORIZADOR_MIN, CFG.TEMPORIZADOR_MAX) : 0,
        // segundos totales para escapar (solo en modo un solo equipo)
        limite: modo === 'solo' && opciones.limite ? limitar(opciones.limite, CFG.LIMITE_MIN * 60, CFG.LIMITE_MAX * 60) : 0
      },
      fallos: {},            // 'sala:pregunta' -> veces fallada por el grupo
      terminado: false,
      terminadoPorDocente: false,
      motivoFin: null        // 'escape' (todos escaparon) | 'docente' | 'tiempo'
    };
  }

  function esSolo(st) { return st.opciones.modo === 'solo'; }

  function equipoActual(st) { return st.equipos[st.turno]; }
  function salaDe(st, eq) { return eq.escapo ? null : eq.salas[eq.salaIdx]; }
  function salaPreset(st, eq) { return st.preset.salas[eq.salaIdx]; }
  function escenaDe(st, eq) { return eq.escapo ? null : EA.ESCENAS[salaPreset(st, eq).escena]; }

  function iniciarTurno(st) {
    if (st.fase !== 'cambio') return false;
    st.fase = 'explorar';
    equipoActual(st).turnos++;
    return true;
  }

  // ---------- Puzzle de objetos (no consume turno) ----------

  function recoger(st, objId) {
    if (st.fase !== 'explorar') return { ok: false };
    var eq = equipoActual(st), sala = salaDe(st, eq), esc = escenaDe(st, eq);
    if (!esc.puzzle || !esc.puzzle.objetos[objId] || sala.recogidos.indexOf(objId) >= 0) return { ok: false };
    sala.recogidos.push(objId);
    sala.inventario.push(objId);
    return { ok: true, objeto: esc.puzzle.objetos[objId] };
  }

  function combinar(st, a, b) {
    if (st.fase !== 'explorar') return { ok: false };
    var eq = equipoActual(st), sala = salaDe(st, eq), esc = escenaDe(st, eq);
    if (a === b || sala.inventario.indexOf(a) < 0 || sala.inventario.indexOf(b) < 0) return { ok: false, mensaje: '' };
    var c = esc.puzzle && esc.puzzle.combinacion;
    if (!c || !((a === c[0] && b === c[1]) || (a === c[1] && b === c[0]))) {
      return { ok: false, mensaje: 'Esos dos objetos no se pueden combinar.' };
    }
    sala.inventario = sala.inventario.filter(function (x) { return x !== a && x !== b; });
    sala.inventario.push(esc.puzzle.resultado.id);
    sala.combinado = true;
    return { ok: true, resultado: esc.puzzle.resultado };
  }

  function usar(st, objId, puntoId) {
    if (st.fase !== 'explorar') return { ok: false };
    var eq = equipoActual(st), sala = salaDe(st, eq), esc = escenaDe(st, eq);
    if (sala.inventario.indexOf(objId) < 0) return { ok: false, mensaje: '' };
    var pz = esc.puzzle;
    if (!pz || pz.resultado.id !== objId || pz.usarEn !== puntoId) {
      return { ok: false, mensaje: 'Eso no sirve aquí. Piensen qué necesita este lugar.' };
    }
    sala.inventario = sala.inventario.filter(function (x) { return x !== objId; });
    sala.usado = true;
    sala.candados[pz.revela].oculto = false;
    return { ok: true, revela: pz.revela, mensaje: pz.alUsar };
  }

  function infoObjeto(st, objId) {
    var esc = escenaDe(st, equipoActual(st));
    if (!esc || !esc.puzzle) return null;
    if (esc.puzzle.objetos[objId]) return esc.puzzle.objetos[objId];
    if (esc.puzzle.resultado.id === objId) return esc.puzzle.resultado;
    return null;
  }

  /** Pista del asistente para el puzzle de objetos (sin penalización). */
  function pistaPuzzle(st) {
    var eq = equipoActual(st), sala = salaDe(st, eq), esc = escenaDe(st, eq);
    if (!sala) return '';
    var pz = esc.puzzle;
    if (!pz) return 'En esta sala no hay objetos que combinar. Elijan un candado y respondan su pregunta.';
    if (sala.usado) return 'El puzzle de objetos ya está resuelto. Solo faltan los candados.';
    if (sala.combinado) return pz.pistas[2];
    if (sala.recogidos.length < Object.keys(pz.objetos).length) return pz.pistas[0];
    return pz.pistas[1];
  }

  // ---------- Candados y preguntas ----------

  function puedeIntentar(st, idx) {
    if (st.fase !== 'explorar') return false;
    var sala = salaDe(st, equipoActual(st));
    var c = sala && sala.candados[idx];
    return !!c && c.estado === 'cerrado' && !c.oculto;
  }

  /** Abre la pregunta de un candado: a partir de aquí el turno está comprometido. */
  function abrirPregunta(st, idx) {
    if (!puedeIntentar(st, idx)) return null;
    st.fase = 'pregunta';
    st.activo = idx;
    return vistaPregunta(st);
  }

  /** Pregunta activa tal como la ve el equipo (alternativas en su orden barajado). */
  function vistaPregunta(st) {
    if (st.activo == null) return null;
    var eq = equipoActual(st);
    var c = eq.salas[eq.salaIdx].candados[st.activo];
    var q = salaPreset(st, eq).preguntas[c.pregunta];
    return {
      candado: st.activo,
      nombreCandado: escenaDe(st, eq).candados[st.activo],
      enunciado: q.enunciado,
      alternativas: c.orden.map(function (i) { return q.alternativas[i]; }),
      rama: q.rama,
      imagen: q.imagen,
      intento: c.fallos + 1,
      pista: c.fallos > 0 ? q.pista : ''
    };
  }

  /**
   * Responde la pregunta activa.
   * opcion: índice en el orden mostrado, o null si se agotó el tiempo.
   * fraccionTiempo: 0..1 de tiempo restante del turno (solo con temporizador).
   */
  function responder(st, opcion, fraccionTiempo) {
    if (st.fase !== 'pregunta') return null;
    var eq = equipoActual(st);
    var sIdx = eq.salaIdx;
    var sala = eq.salas[sIdx];
    var c = sala.candados[st.activo];
    var q = st.preset.salas[sIdx].preguntas[c.pregunta];
    var correcto = opcion != null && c.orden[opcion] === q.correcta;
    var res = {
      correcto: correcto, tiempoAgotado: opcion == null, tipo: '', candado: st.activo,
      puntos: 0, bonoRapidez: 0, bonoSala: 0, bonoEscape: 0,
      abierto: false, pista: '', explicacion: '',
      correctaVista: c.orden.indexOf(q.correcta), correctaTexto: q.alternativas[q.correcta],
      salaCompletada: false, escapo: false, ordenEscape: null
    };

    if (correcto) {
      res.tipo = c.fallos === 0 ? 'primer' : 'pista';
      res.puntos = c.fallos === 0 ? CFG.PUNTOS_PRIMER_INTENTO : CFG.PUNTOS_TRAS_PISTA;
      if (st.opciones.temporizador && typeof fraccionTiempo === 'number') {
        res.bonoRapidez = Math.round(CFG.BONO_RAPIDEZ_MAX * Math.max(0, Math.min(1, fraccionTiempo)));
      }
      eq.stats[res.tipo]++;
      res.explicacion = q.explicacion;
      res.abierto = true;
    } else {
      c.fallos++;
      var clave = sIdx + ':' + c.pregunta;
      st.fallos[clave] = (st.fallos[clave] || 0) + 1;
      if (c.fallos >= CFG.FALLOS_PARA_EXPLICACION) {
        res.tipo = 'explicacion';
        res.puntos = CFG.PUNTOS_TRAS_EXPLICACION;
        res.explicacion = q.explicacion;
        eq.stats.explicacion++;
        res.abierto = true;
      } else {
        res.tipo = 'fallo';
        res.pista = q.pista;
      }
    }

    if (res.abierto) {
      c.estado = 'abierto';
      c.puntos = res.puntos + res.bonoRapidez;
      if (sala.candados.every(function (x) { return x.estado === 'abierto'; })) {
        sala.completada = true;
        res.salaCompletada = true;
        res.bonoSala = CFG.BONO_SALA_COMPLETADA;
        eq.salaIdx++;
        if (eq.salaIdx >= eq.salas.length) {
          eq.escapo = true;
          st.escapes++;
          eq.ordenEscape = st.escapes;
          res.escapo = true;
          res.ordenEscape = eq.ordenEscape;
          if (eq.ordenEscape === 1) res.bonoEscape = CFG.BONO_ESCAPAR_PRIMERO;
        }
      }
    }
    res.total = res.puntos + res.bonoRapidez + res.bonoSala + res.bonoEscape;
    eq.puntaje += res.total;
    st.fase = 'resultado';
    st.activo = null;
    return res;
  }

  /**
   * Termina el turno actual y busca al siguiente equipo que no haya escapado.
   * segundos: tiempo de juego usado en este turno.
   */
  function pasarTurno(st, segundos) {
    if (st.fase === 'fin') return { fin: true };
    if (st.fase === 'pregunta') return null; // hay que responder (o agotar el tiempo) primero
    equipoActual(st).tiempo += Math.max(0, segundos || 0);
    var n = st.equipos.length;
    for (var k = 1; k <= n; k++) {
      var t = (st.turno + k) % n;
      if (!st.equipos[t].escapo) {
        st.turno = t;
        st.fase = 'cambio';
        st.numTurno++;
        return { fin: false, equipo: t };
      }
    }
    st.fase = 'fin';
    st.terminado = true;
    st.motivoFin = 'escape';
    return { fin: true };
  }

  /**
   * Termina la partida antes de tiempo.
   * motivo: 'docente' (botón «Terminar partida») o 'tiempo' (se acabó el tiempo límite).
   */
  function terminar(st, segundos, motivo) {
    if (st.fase !== 'fin') {
      if (st.fase !== 'cambio') equipoActual(st).tiempo += Math.max(0, segundos || 0);
      st.motivoFin = motivo === 'tiempo' ? 'tiempo' : 'docente';
      st.terminadoPorDocente = st.motivoFin === 'docente';
    }
    st.fase = 'fin';
    st.terminado = true;
    st.activo = null;
  }

  // ---------- Resumen ----------

  function resumen(st) {
    var filas = st.equipos.map(function (eq) {
      var abiertos = 0, total = 0;
      eq.salas.forEach(function (s) {
        s.candados.forEach(function (c) { total++; if (c.estado === 'abierto') abiertos++; });
      });
      return {
        id: eq.id, nombre: eq.nombre, color: eq.color, simbolo: eq.simbolo,
        puntaje: eq.puntaje, primer: eq.stats.primer, pista: eq.stats.pista, explicacion: eq.stats.explicacion,
        tiempo: Math.round(eq.tiempo), escapo: eq.escapo, ordenEscape: eq.ordenEscape,
        salasCompletadas: eq.escapo ? eq.salas.length : eq.salaIdx, totalSalas: eq.salas.length,
        candadosAbiertos: abiertos, candadosTotales: total
      };
    });
    filas.sort(function (a, b) {
      if (b.puntaje !== a.puntaje) return b.puntaje - a.puntaje;
      var oa = a.ordenEscape || 99, ob = b.ordenEscape || 99;
      if (oa !== ob) return oa - ob;
      return a.tiempo - b.tiempo;
    });
    filas.forEach(function (f, i) {
      f.puesto = (i > 0 && filas[i - 1].puntaje === f.puntaje) ? filas[i - 1].puesto : i + 1;
    });

    var repasar = Object.keys(st.fallos).map(function (k) {
      var p = k.split(':');
      var q = st.preset.salas[+p[0]].preguntas[+p[1]];
      return {
        sala: +p[0], fallos: st.fallos[k], enunciado: q.enunciado,
        correcta: q.alternativas[q.correcta], explicacion: q.explicacion, clave: k
      };
    }).sort(function (a, b) { return b.fallos - a.fallos || (a.clave < b.clave ? -1 : 1); }).slice(0, CFG.REPASO_MAX);

    return {
      preset: st.preset.nombre, equipos: filas, repasar: repasar,
      modo: st.opciones.modo, limite: st.opciones.limite, motivoFin: st.motivoFin,
      terminadoPorDocente: st.terminadoPorDocente, turnos: st.numTurno
    };
  }

  var TEXTO_MOTIVO = { escape: 'Todos escaparon', docente: 'Terminada por el docente', tiempo: 'Se acabó el tiempo límite' };

  function celdaCSV(v) {
    var s = String(v == null ? '' : v);
    // Evita que una hoja de cálculo interprete el texto como fórmula.
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }

  function resultadosCSV(r) {
    var lineas = [];
    lineas.push(['Preset', r.preset].map(celdaCSV).join(','));
    lineas.push(['Modo', r.modo === 'solo' ? 'Un solo equipo' : 'Por turnos'].map(celdaCSV).join(','));
    lineas.push(['Fin de la partida', TEXTO_MOTIVO[r.motivoFin] || ''].map(celdaCSV).join(','));
    lineas.push('');
    lineas.push(['Puesto', 'Equipo', 'Puntaje', 'Aciertos al primer intento', 'Aciertos con pista', 'Con explicación', 'Tiempo (s)', 'Salas completadas', 'Escapó', 'Orden de escape'].map(celdaCSV).join(','));
    r.equipos.forEach(function (f) {
      lineas.push([f.puesto, U.plano(f.nombre), f.puntaje, f.primer, f.pista, f.explicacion, f.tiempo,
        f.salasCompletadas + ' de ' + f.totalSalas, f.escapo ? 'Sí' : 'No', f.ordenEscape || ''].map(celdaCSV).join(','));
    });
    if (r.repasar.length) {
      lineas.push('');
      lineas.push(['Para repasar', 'Veces fallada', 'Respuesta correcta', 'Explicación'].map(celdaCSV).join(','));
      r.repasar.forEach(function (q) {
        lineas.push([U.plano(q.enunciado), q.fallos, U.plano(q.correcta), U.plano(q.explicacion)].map(celdaCSV).join(','));
      });
    }
    return '﻿' + lineas.join('\r\n') + '\r\n';
  }

  EA.juego = {
    crearPartida: crearPartida, esSolo: esSolo, equipoActual: equipoActual, salaDe: salaDe, escenaDe: escenaDe,
    iniciarTurno: iniciarTurno, recoger: recoger, combinar: combinar, usar: usar,
    infoObjeto: infoObjeto, pistaPuzzle: pistaPuzzle,
    puedeIntentar: puedeIntentar, abrirPregunta: abrirPregunta, vistaPregunta: vistaPregunta,
    responder: responder, pasarTurno: pasarTurno, terminar: terminar,
    resumen: resumen, resultadosCSV: resultadosCSV
  };
})(typeof window !== 'undefined' ? (window.EA = window.EA || {}) : (globalThis.EA = globalThis.EA || {}));
