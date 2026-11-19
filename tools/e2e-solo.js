/*
 * Prueba de punta a punta del modo «un solo equipo» (navegador real, headless, sin dependencias):
 *  1) Partida completa con el preset por defecto: sin pantallas de turno entre intentos,
 *     reintento inmediato con pista, cambio de sala, escape, historia final y resumen.
 *  2) La energía de respaldo se agota explorando y con una pregunta abierta.
 *  3) El docente termina la partida: resumen directo, sin historia.
 * Uso: node tools/e2e-solo.js
 */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { abrir, urlJuego, RAIZ } = require('./cdp.js');
const AUDITORIA = require('./auditoria.js');
const foto = (pag, n) => pag.captura(path.join(RAIZ, 'capturas', 'solo-' + n + '.png'));

(async () => {
  const pag = await abrir();
  const ev = (x) => pag.evaluar(x);
  const pausa = (ms) => pag.esperar(ms);
  const clic = async (sel, ms = 120) => { await pag.clicEn(sel); await pausa(ms); };
  const S = () => ev('JSON.stringify({fase:EA.partida.fase,p:EA.partida.equipos[0].puntaje,s:EA.partida.equipos[0].salaIdx,esc:EA.partida.equipos[0].escapo,st:EA.partida.equipos[0].stats,motivo:EA.partida.motivoFin})').then(JSON.parse);
  const pantalla = () => ev('document.querySelector("#pantalla").className');
  const correcta = () => ev('(function(){var st=EA.partida,eq=st.equipos[0],c=eq.salas[eq.salaIdx].candados[st.activo],q=st.preset.salas[eq.salaIdx].preguntas[c.pregunta];return c.orden.indexOf(q.correcta)})()');
  const esperarFase = async (fases, max = 8000) => {
    for (let t = 0; t < max; t += 60) { const f = (await S()).fase; if (fases.includes(f)) return f; await pausa(60); }
    throw new Error('No se llegó a ' + fases + ' (quedó en ' + (await S()).fase + ')');
  };
  const auditar = async (donde) => { const p = await ev(AUDITORIA); assert.deepEqual(p, [], donde); };

  /** Resuelve el puzzle de objetos de la sala actual, si tiene. */
  async function puzzle() {
    const pz = await ev('(function(){var st=EA.partida,eq=st.equipos[0],e=EA.juego.escenaDe(st,eq),s=eq.salas[eq.salaIdx];return (e.puzzle&&!s.usado)?{o:Object.keys(e.puzzle.objetos),r:e.puzzle.resultado.id,rev:e.puzzle.revela}:null})()');
    if (!pz) return;
    for (const o of pz.o) await clic('.hot-objeto[data-id="' + o + '"]');
    await clic('button.casilla[data-inv="' + pz.o[0] + '"]'); await clic('button.casilla[data-inv="' + pz.o[1] + '"]');
    await clic('button.casilla[data-inv="' + pz.r + '"]'); await clic('.hot-candado[data-id="' + pz.rev + '"]');
    assert.equal(await ev('document.querySelectorAll(".candado-oculto").length'), 0, 'el puzzle activó el candado');
  }

  /** Intenta un candado; bien = acierta. Devuelve el título del resultado. */
  async function intentar(idx, bien) {
    await clic('.hot-candado[data-id="' + idx + '"]');
    await pag.tecla('Enter'); await pausa(150);
    assert.equal((await S()).fase, 'pregunta');
    const ok = await correcta();
    const n = await ev('document.querySelectorAll(".opcion").length');
    await pag.tecla(String((bien ? ok : (ok + 1) % n) + 1)); await pag.tecla('Enter'); await pausa(180);
    return ev('document.querySelector(".veredicto h2").textContent');
  }

  try {
    await pag.ir(urlJuego(''));
    await ev('localStorage.clear()');
    await pag.ir(urlJuego(''));
    await ev('EA.CONFIG.ESPERA_CANDADO_MS=150; EA.CONFIG.ESPERA_PUERTA_MS=300');

    // ---- Configuración
    await clic('[data-ir="configurar"]', 250);
    await clic('.modo-op:nth-child(2)');
    assert.equal(await ev('document.querySelector(\'input[name="modo"]:checked\').value'), 'solo');
    assert.equal(await ev('document.querySelectorAll(".equipo-fila").length'), 1);
    assert.equal(await ev('document.querySelector("#t-activo").checked'), true, 'el tiempo límite viene activado');
    assert.equal(await ev('document.querySelector("#t-valor").textContent'), '20 min');
    await pag.clicEn('input[data-eq="0"]'); await ev('document.querySelector(\'input[data-eq="0"]\').select()'); await pag.escribir('Equipo Curie');
    await clic('#comenzar', 400);
    assert.equal(await pantalla(), 'p-historia');
    for (let i = 0; i < 3; i++) await clic('#hist-sig', 300);
    assert.match(await ev('document.querySelector("#hist-txt").textContent'), /La energía de respaldo dura 20 minutos/);
    assert.doesNotMatch(await ev('document.querySelector("#hist-txt").textContent'), /turnos/);
    await clic('#hist-sig', 400);

    // ---- Sala 1: pantalla de sala (no de turno)
    assert.equal(await pantalla(), 'p-juego');
    assert.match(await ev('document.querySelector(".cambio").textContent'), /Sala 1 de 2.*Laboratorio de Química/);
    assert.match(await ev('document.querySelector("#b-turno").textContent'), /Entrar a la sala/);
    assert.equal(await ev('document.querySelector("#hud-tiempo").getAttribute("aria-label")'), 'Energía de respaldo: tiempo que queda para escapar');
    await auditar('pantalla de sala');
    await pag.tecla('Enter'); await pausa(200);
    assert.equal((await S()).fase, 'explorar');
    await pausa(1300);
    assert.notEqual(await ev('document.querySelector("#hud-tiempo span").textContent'), '20:00', 'la energía se va gastando');
    await puzzle();

    // Fallo y reintento inmediato del mismo candado, con la pista a la vista
    assert.equal(await intentar(0, false), 'Respuesta incorrecta');
    assert.match(await ev('document.querySelector(".veredicto p").textContent'), /pueden volver a intentarlo cuando quieran/);
    await foto(pag, '01-fallo');
    await pag.tecla('Enter');
    await esperarFase(['explorar']);
    assert.equal(await ev('document.querySelector(".cambio")'), null, 'sin pantalla de cambio de turno entre intentos');
    assert.equal(await ev('document.querySelector("#capa").hidden'), true);
    await clic('.hot-candado[data-id="0"]');
    assert.match(await ev('document.querySelector(".dialogo").textContent'), /Segundo intento/);
    assert.doesNotMatch(await ev('document.querySelector(".dialogo").textContent'), /turno/);
    await pag.tecla('Enter'); await pausa(150);
    assert.equal(await ev('!!document.querySelector(".caja-pista")'), true, 'el reintento muestra la pista');
    await pag.tecla(String((await correcta()) + 1)); await pag.tecla('Enter'); await pausa(180);
    assert.equal(await ev('document.querySelector(".chip.total").textContent'), '+50 puntos');
    await pag.tecla('Enter'); await esperarFase(['explorar']);

    // Resto de la sala 1
    for (let i = 1; i < 4; i++) {
      assert.equal(await intentar(i, true), '¡Correcto!');
      await pag.tecla('Enter');
      await esperarFase(['explorar', 'cambio']);
    }
    // ---- Sala 2: aparece la pantalla de la sala nueva
    assert.equal((await S()).s, 1);
    assert.equal((await S()).fase, 'cambio');
    assert.match(await ev('document.querySelector(".cambio").textContent'), /Sala 2 de 2.*Laboratorio de Biología/);
    await foto(pag, '02-sala-2');
    await pag.tecla('Enter'); await pausa(200);
    await puzzle();
    for (let i = 0; i < 4; i++) {
      const sala = await ev('JSON.stringify(EA.partida.equipos[0].salas[1].candados.map(function(c){return c.estado}))');
      const idx = JSON.parse(sala).indexOf('cerrado');
      assert.equal(await intentar(idx, true), '¡Correcto!');
      if (i === 3) {
        assert.match(await ev('document.querySelector(".puntos-fila").textContent'), /\+200 por escapar/);
        await foto(pag, '03-escape');
      }
      await pag.tecla('Enter');
      if (i < 3) await esperarFase(['explorar']);
    }
    await pausa(600);
    let s = await S();
    assert.equal(s.esc, true);
    assert.equal(s.motivo, 'escape');
    assert.deepEqual(s.st, { primer: 7, pista: 1, explicacion: 0 });
    assert.equal(s.p, 7 * 100 + 50 + 2 * 50 + 200);

    // ---- Final de la historia y resumen del equipo
    assert.equal(await pantalla(), 'p-historia');
    assert.equal(await ev('document.querySelector("#hist-titulo").textContent'), '¡Lo lograron!');
    assert.match(await ev('document.querySelector("#hist-txt").textContent'), /Equipo Curie escapó con 1050 puntos/);
    await clic('#hist-sig', 350); await clic('#hist-sig', 400);
    assert.equal(await pantalla(), 'p-resumen');
    assert.equal(await ev('document.querySelector(".pagina-cab h2").textContent'), '¡Equipo Curie escapó del laboratorio!');
    assert.equal(await ev('!!document.querySelector(".ficha-solo") && !document.querySelector(".podio")'), true, 'ficha del equipo en vez de podio');
    assert.match(await ev('document.querySelector(".ficha-solo").textContent'), /Candados abiertos8 de 8/);
    assert.equal(await ev('document.querySelectorAll(".tabla th").length'), 7, 'sin columna de puesto');
    assert.match(await ev('EA.juego.resultadosCSV(EA.juego.resumen(EA.partida))'), /"Modo","Un solo equipo"/);
    await auditar('resumen un solo equipo');
    await foto(pag, '04-resumen');

    // ---- 2) Energía agotada explorando (límite corto solo para la prueba)
    const arrancar = (seg) => ev('EA.CONFIG.LIMITE_MIN=0.05; EA.ui.ir("juego",{preset:EA.almacen.presets()[0],historia:true,'
      + 'equipos:[{nombre:"Equipo Curie",color:"#E4574F",simbolo:"triangulo"}],opciones:{modo:"solo",limite:' + seg + '}})');
    await arrancar(6);
    await pag.tecla('Enter'); await pausa(400);
    assert.match(await ev('document.querySelector("#globo").textContent'), /menos de un minuto/, 'aviso del último minuto');
    await esperarFase(['fin'], 9000);
    await pausa(200);
    assert.equal(await ev('document.querySelector(".veredicto h2").textContent'), '¡Se acabó la energía!');
    await foto(pag, '05-sin-energia');
    await pag.tecla('Enter'); await pausa(400);
    assert.equal(await pantalla(), 'p-historia');
    assert.equal(await ev('document.querySelector("#hist-titulo").textContent'), 'Se acabó la energía');
    assert.match(await ev('document.querySelector("#hist-txt").textContent'), /Alcanzaron a abrir 0 de 8 candados/);
    await clic('#hist-sig', 350);
    assert.equal(await ev('document.querySelector("#hist-titulo").textContent'), 'El regreso del doctor');
    await clic('#hist-sig', 400);
    assert.equal(await ev('document.querySelector(".pagina-cab h2").textContent'), 'Se acabó la energía de respaldo');
    assert.match(await ev('document.querySelector(".pagina-cab").textContent'), /Sin energía/);

    // Con una pregunta abierta: se cierra y termina igual
    await arrancar(4);
    await pag.tecla('Enter'); await pausa(150);
    await clic('.hot-candado[data-id="0"]'); await pag.tecla('Enter'); await pausa(150);
    assert.equal((await S()).fase, 'pregunta');
    await esperarFase(['fin'], 7000);
    await pausa(200);
    assert.equal(await ev('document.querySelectorAll(".opcion").length'), 0, 'la pregunta se cerró');
    assert.equal(await ev('document.querySelector(".veredicto h2").textContent'), '¡Se acabó la energía!');
    await pag.tecla('p'); await pausa(80);
    assert.equal(await ev('document.querySelector("#pausa").hidden'), true, 'ya no se puede pausar una partida terminada');
    await clic('#b-final', 400);
    assert.equal(await pantalla(), 'p-historia');

    // ---- 3) El docente termina: resumen directo, sin historia
    await arrancar(600);
    await pag.tecla('Enter'); await pausa(150);
    await clic('#b-fin'); await clic('.dialogo .btn.peligro', 400);
    assert.equal(await pantalla(), 'p-resumen');
    assert.equal(await ev('document.querySelector(".pagina-cab h2").textContent'), 'Partida terminada');

    assert.deepEqual(pag.errores, [], 'sin errores de JavaScript');
    assert.deepEqual(pag.consola, [], 'sin errores en la consola');
    console.log('E2E UN SOLO EQUIPO OK');
  } catch (err) {
    await foto(pag, 'ERROR').catch(() => {});
    console.error('E2E UN SOLO EQUIPO FALLÓ:', err.message);
    if (pag.errores.length) console.error('Errores de la página:\n' + pag.errores.join('\n'));
    process.exitCode = 1;
  } finally {
    await pag.cerrar();
  }
})();
