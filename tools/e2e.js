/*
 * Prueba de punta a punta en un navegador real (Chrome/Edge headless, sin dependencias).
 * Juega una partida completa con 2 equipos usando clics y teclado de verdad:
 * menú -> configuración -> puzzle de objetos -> aciertos, un fallo con pista,
 * un fallo con explicación -> escape de ambos equipos -> resumen.
 * Guarda capturas de los momentos clave en capturas/e2e-*.png.
 * Uso: node tools/e2e.js
 */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { abrir, urlJuego, RAIZ } = require('./cdp.js');

const dir = path.join(RAIZ, 'capturas');
const foto = (pag, n) => pag.captura(path.join(dir, 'e2e-' + n + '.png'));

(async () => {
  const pag = await abrir();
  const ev = (x) => pag.evaluar(x);
  const pausa = (ms) => pag.esperar(ms);
  try {
    await pag.ir(urlJuego(''));
    await ev('localStorage.clear()');
    await pag.ir(urlJuego(''));
    assert.equal(await ev('document.querySelector("h1").textContent'), 'El laboratorio del científico');

    // Menú -> Configuración
    await pag.clicEn('[data-ir="configurar"]');
    await pausa(200);
    assert.equal(await ev('document.querySelectorAll(".preset-op").length'), 2, 'solo los presets jugables aparecen (no la plantilla)');
    assert.equal(await ev('document.querySelector(".preset-op input:checked").value'), 'ejemplo-anhidridos', 'el preset del docente viene elegido');
    assert.equal(await ev('document.querySelector(\'input[name="modo"]:checked\').value'), 'turnos', 'por turnos es el modo por defecto');
    assert.equal(await ev('document.querySelectorAll(".equipo-fila").length'), 2);
    await pag.clicEn('.preset-op input[value="ejemplo-ciencias-basicas"]');
    await foto(pag, '01-configuracion');
    await pag.clicEn('#comenzar');
    await pausa(400);

    // Historia de inicio: 4 paneles; el plano muestra las salas del preset elegido
    assert.equal(await ev('document.querySelector("#pantalla").className'), 'p-historia');
    const titulos = [];
    for (let i = 0; i < 4; i++) {
      titulos.push(await ev('document.querySelector("#hist-titulo").textContent'));
      if (i === 3) {
        assert.match(await ev('document.querySelector("#hist-txt").textContent'), /3 salas: Laboratorio de Química, Laboratorio de Biología y Sala de Control/);
        await foto(pag, '01b-historia-mision');
      }
      if (i === 1) { await pag.tecla('ArrowLeft'); await pausa(300); assert.equal(await ev('document.querySelector("#hist-titulo").textContent'), titulos[0], '← vuelve al panel anterior'); await pag.tecla('ArrowRight'); await pausa(300); }
      await pag.clicEn('#hist-sig'); await pausa(350);
    }
    assert.deepEqual(titulos, ['Una puerta entreabierta', '¡Apagón!', 'Volti despierta', 'La misión']);

    // --- utilidades de juego ---
    const estado = () => ev('JSON.stringify({fase:EA.partida.fase,turno:EA.partida.turno,eq:EA.partida.equipos.map(function(e){return {p:e.puntaje,s:e.salaIdx,esc:e.escapo,st:e.stats}})})').then(JSON.parse);
    /** Índice mostrado de la respuesta correcta (lo lee del estado, como haría el docente con la clave). */
    const correcta = () => ev('(function(){var st=EA.partida,eq=st.equipos[st.turno],c=eq.salas[eq.salaIdx].candados[st.activo],q=st.preset.salas[eq.salaIdx].preguntas[c.pregunta];return c.orden.indexOf(q.correcta);})()');
    const candadoCerrado = () => ev('(function(){var st=EA.partida,eq=st.equipos[st.turno];return eq.salas[eq.salaIdx].candados.findIndex(function(c){return c.estado==="cerrado"&&!c.oculto});})()');

    async function resolverPuzzle(conArrastre) {
      const pz = await ev('(function(){var st=EA.partida,eq=st.equipos[st.turno];var e=EA.juego.escenaDe(st,eq);var s=eq.salas[eq.salaIdx];return (e.puzzle&&!s.usado)?{objs:Object.keys(e.puzzle.objetos),res:e.puzzle.resultado.id,en:e.puzzle.usarEn}:null})()');
      if (!pz) return false;
      for (const o of pz.objs) { await pag.clicEn('.hot-objeto[data-id="' + o + '"]'); await pausa(120); }
      assert.equal(await ev('document.querySelectorAll("button.casilla").length'), 2, 'dos objetos en el inventario');
      if (conArrastre) {
        const p = await ev('(function(){var b=document.querySelectorAll("button.casilla");var a=b[0].getBoundingClientRect(),c=b[1].getBoundingClientRect();return [a.left+a.width/2,a.top+a.height/2,c.left+c.width/2,c.top+c.height/2]})()');
        await pag.arrastrar(p[0], p[1], p[2], p[3]);
      } else {
        await pag.clicEn('button.casilla[data-inv="' + pz.objs[0] + '"]'); await pausa(80);
        await pag.clicEn('button.casilla[data-inv="' + pz.objs[1] + '"]');
      }
      await pausa(150);
      assert.equal(await ev('document.querySelector("button.casilla").getAttribute("data-inv")'), pz.res, 'se obtuvo el objeto combinado');
      await pag.clicEn('button.casilla[data-inv="' + pz.res + '"]'); await pausa(80);
      await pag.clicEn('.hot-examinar[data-id="' + pz.en + '"]'); await pausa(150);
      assert.equal(await ev('document.querySelectorAll(".candado-oculto").length'), 0, 'el candado oculto se reveló');
      return true;
    }

    /** Juega un turno completo del equipo actual. modo: "bien" | "mal" | "teclado". */
    async function turno(modo, fotos) {
      let e = await estado();
      assert.equal(e.fase, 'cambio');
      if (fotos && fotos.cambio) await foto(pag, fotos.cambio);
      await pag.tecla('Enter'); await pausa(150);
      e = await estado();
      assert.equal(e.fase, 'explorar');
      const hubo = await resolverPuzzle(e.turno === 0);
      if (hubo && fotos && fotos.puzzle) await foto(pag, fotos.puzzle);
      if (fotos && fotos.sala) await foto(pag, fotos.sala);
      assert.equal((await estado()).turno, e.turno, 'explorar no gasta el turno');
      const idx = await candadoCerrado();
      await pag.clicEn('.hot-candado[data-id="' + idx + '"]'); await pausa(120);
      if (fotos && fotos.confirmar) await foto(pag, fotos.confirmar);
      await pag.tecla('Enter'); await pausa(200);
      assert.equal((await estado()).fase, 'pregunta');
      const ok = await correcta();
      const n = await ev('document.querySelectorAll(".opcion").length');
      const elegir = modo === 'mal' ? (ok + 1) % n : ok;
      if (modo === 'teclado') await pag.tecla('abcde'[elegir]);
      else await pag.clicEn('.opcion[data-op="' + elegir + '"]');
      await pausa(80);
      if (fotos && fotos.pregunta) await foto(pag, fotos.pregunta);
      if (modo === 'teclado') await pag.tecla('Enter'); else await pag.clicEn('#b-confirmar');
      await pausa(200);
      assert.equal((await estado()).fase, 'resultado');
      const veredicto = await ev('document.querySelector(".veredicto h2").textContent');
      assert.equal(veredicto, modo === 'mal' ? 'Respuesta incorrecta' : '¡Correcto!');
      if (fotos && fotos.resultado) await foto(pag, fotos.resultado);
      await pag.tecla('Enter');
      if (fotos && fotos.animacion) { await pausa(1100); await foto(pag, fotos.animacion); }
      for (let i = 0; i < 80; i++) { await pausa(100); const f = (await estado()).fase; if (f === 'cambio' || f === 'fin') break; }
      return veredicto;
    }

    // Turno 1 (equipo 1): puzzle con arrastre + acierto con mouse
    await turno('bien', { cambio: '02-cambio-turno', puzzle: '03-puzzle-resuelto', confirmar: '04-confirmar-candado', pregunta: '05-pregunta', resultado: '06-acierto', animacion: '07-candado-abierto' });
    let e = await estado();
    assert.equal(e.eq[0].p, 100);
    assert.equal(e.turno, 1);

    // Turno 2 (equipo 2): fallo -> pista
    await turno('mal', { resultado: '08-fallo-pista' });
    e = await estado();
    assert.equal(e.eq[1].p, 0);
    assert.match(await ev('document.querySelector(".hud").textContent'), /100/);

    // Turno 3 (equipo 1): acierto con teclado
    await turno('teclado', {});
    // Turno 4 (equipo 2): segundo fallo en el mismo candado -> explicación, abre con 0
    await turno('mal', { pregunta: '09-segundo-intento', resultado: '10-fallo-explicacion' });
    e = await estado();
    assert.deepEqual(e.eq[1].st, { primer: 0, pista: 0, explicacion: 1 });
    assert.equal(e.eq[1].p, 0);

    // Turno 5 (equipo 1) acierta; turno 6 (equipo 2): falla otro candado, luego lo acierta con pista
    await turno('bien', {});
    await turno('mal', {});
    await turno('bien', { animacion: '11-sala-completada' });   // equipo 1 completa la sala 1 (4.º candado)
    e = await estado();
    assert.equal(e.eq[0].s, 1, 'equipo 1 pasó a la sala 2');
    assert.equal(e.eq[0].p, 450);
    await turno('bien', {});                                    // equipo 2 acierta con pista
    e = await estado();
    assert.equal(e.eq[1].st.pista, 1);
    assert.equal(e.eq[1].p, 50);

    // Resto de la partida: todos aciertan hasta que ambos escapan
    let guardia = 0, fotoSala2 = false, fotoSala3 = false;
    while ((await estado()).fase !== 'fin') {
      assert.ok(++guardia < 60, 'la partida debe terminar');
      e = await estado();
      const s = e.eq[e.turno].s;
      const f = {};
      if (s === 1 && !fotoSala2) { f.sala = '12-sala-2'; fotoSala2 = true; }
      if (s === 2 && !fotoSala3) { f.sala = '13-sala-3'; fotoSala3 = true; }
      await turno(guardia % 2 ? 'teclado' : 'bien', f);
    }
    await pausa(900);
    e = await estado();
    assert.ok(e.eq[0].esc && e.eq[1].esc, 'ambos equipos escaparon');
    assert.equal(e.eq[0].p, 12 * 100 + 3 * 50 + 200);
    assert.equal(e.eq[1].p, 10 * 100 + 50 + 3 * 50);

    // Final de la historia: nombra al primer equipo en escapar
    assert.equal(await ev('document.querySelector("#pantalla").className'), 'p-historia');
    assert.equal(await ev('document.querySelector("#hist-titulo").textContent'), '¡Libres!');
    assert.match(await ev('document.querySelector("#hist-txt").textContent'), /Protones fue el primer equipo en escapar y, al final, todos lograron salir/);
    await foto(pag, '13b-final');
    await pag.tecla('Enter'); await pausa(350);
    assert.match(await ev('document.querySelector("#hist-txt").textContent'), /Dr\. Ámbar/);
    await pag.tecla('Enter'); await pausa(400);

    // Resumen
    assert.match(await ev('document.querySelector(".pagina-cab h2").textContent'), /Ganó/);
    assert.equal(await ev('document.querySelectorAll(".tabla tbody tr").length'), 2);
    assert.ok(await ev('document.querySelectorAll(".repaso-item").length') >= 2, 'hay preguntas para repasar');
    await foto(pag, '14-resumen');
    const csv = await ev('EA.juego.resultadosCSV(EA.juego.resumen(EA.partida))');
    assert.match(csv, /"1550"/);

    // Jugar de nuevo (sin repetir la introducción) y terminar por el docente (sin final de historia)
    await pag.clicEn('#r-otra'); await pausa(300);
    assert.equal(await ev('document.querySelector("#pantalla").className'), 'p-juego', 'Jugar de nuevo va directo a la partida');
    assert.equal((await estado()).fase, 'cambio');
    await pag.tecla('Enter'); await pausa(150);
    await pag.tecla('p'); await pausa(120);
    assert.equal(await ev('document.querySelector("#pausa").hidden'), false, 'P pausa');
    await foto(pag, '15-pausa');
    await pag.tecla('p'); await pausa(100);
    await pag.tecla('h'); await pausa(150);
    assert.equal(await ev('document.querySelector("#globo").hidden'), false, 'H muestra la ayuda del asistente');
    await foto(pag, '16-ayuda-asistente');
    await pag.clicEn('#b-fin'); await pausa(150);
    await pag.clicEn('.dialogo .btn.peligro'); await pausa(400);
    assert.match(await ev('document.querySelector(".pagina-cab").textContent'), /terminada por el docente/);

    assert.deepEqual(pag.errores, [], 'sin errores de JavaScript');
    assert.deepEqual(pag.consola, [], 'sin errores ni advertencias en la consola');
    console.log('E2E OK: partida completa de 2 equipos verificada en el navegador.');
  } catch (err) {
    await foto(pag, 'ERROR').catch(() => {});
    console.error('E2E FALLÓ:', err.message);
    if (pag.errores.length) console.error('Errores de la página:\n' + pag.errores.join('\n'));
    process.exitCode = 1;
  } finally {
    await pag.cerrar();
  }
})();
