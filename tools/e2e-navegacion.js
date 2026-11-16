/*
 * Prueba de regresión de navegación (navegador real, headless, sin dependencias).
 * Entra y sale varias veces de cada pantalla y comprueba que CADA clic hace su efecto UNA sola vez:
 * un solo diálogo por acción, «Cancelar» cierra al primer clic, «Guardar» guarda al primer clic,
 * y una partida nueva no arrastra manejadores de la anterior.
 * Uso: node tools/e2e-navegacion.js
 */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { abrir, urlJuego, RAIZ } = require('./cdp.js');
const foto = (pag, n) => pag.captura(path.join(RAIZ, 'capturas', 'nav-' + n + '.png'));

(async () => {
  const pag = await abrir();
  const ev = (x) => pag.evaluar(x);
  const pausa = (ms) => pag.esperar(ms);
  const dialogos = () => ev('document.querySelectorAll("#capa-modal .velo").length');
  const pantalla = () => ev('document.querySelector("#pantalla").className');
  const clic = async (sel, ms = 150) => { await pag.clicEn(sel); await pausa(ms); };
  const BTN = (n) => '.velo:last-child .dialogo .acciones button:nth-child(' + n + ')';
  try {
    await pag.ir(urlJuego(''));
    await ev('localStorage.clear()');
    await pag.ir(urlJuego(''));

    // ---- Ir y volver varias veces por todas las pantallas del menú
    for (let i = 0; i < 4; i++) {
      await clic('[data-ir="editor"]'); assert.equal(await pantalla(), 'p-editor');
      await clic('[data-a="menu"]'); assert.equal(await pantalla(), 'p-menu');
      await clic('[data-ir="configurar"]'); assert.equal(await pantalla(), 'p-configurar');
      await clic('#volver'); assert.equal(await pantalla(), 'p-menu');
      await clic('[data-ir="ayuda"]'); assert.equal(await pantalla(), 'p-ayuda');
      await clic('#volver'); assert.equal(await pantalla(), 'p-menu');
    }
    assert.equal(await ev('document.querySelectorAll("#pantalla").length'), 1);

    // ---- Editor tras varias visitas: cada acción abre UN diálogo y se cierra con UN clic
    await clic('[data-ir="editor"]');
    await clic('[data-a="nuevo"]');
    assert.equal(await ev('document.querySelector(".pagina-cab h2").textContent'), 'Nuevo preset');

    await clic('[data-a="q-nueva"]');
    assert.equal(await dialogos(), 1, 'Agregar pregunta abre un solo diálogo');
    await clic(BTN(1));                                   // Cancelar
    assert.equal(await dialogos(), 0, 'Cancelar cierra al primer clic');
    assert.equal(await ev('document.querySelectorAll(".ed-q").length'), 0, 'cancelar no agrega nada');

    await clic('[data-a="q-nueva"]');
    await pag.clicEn('#q-enun'); await pag.escribir('¿2 + 2?');
    const alts = ['4', '3', '5', '22'];
    for (let i = 0; i < 4; i++) { await pag.clicEn('[data-alt="' + i + '"]'); await pag.escribir(alts[i]); }
    await clic(BTN(3));                                   // Guardar pregunta
    assert.equal(await dialogos(), 0, 'Guardar pregunta cierra al primer clic');
    assert.equal(await ev('document.querySelectorAll(".ed-q").length'), 1, 'la pregunta se guardó una sola vez');

    // Editar la pregunta y cancelar: no cambia
    await clic('[data-a="q-editar"][data-i="0"]');
    assert.equal(await dialogos(), 1);
    await pag.clicEn('#q-enun'); await pag.escribir(' CAMBIO');
    await clic(BTN(1));
    assert.equal(await dialogos(), 0);
    assert.ok(!(await ev('document.querySelector(".ed-q-txt p").textContent')).includes('CAMBIO'), 'cancelar descarta la edición');

    // Duplicar y eliminar pregunta: un clic, un efecto
    await clic('[data-a="q-duplicar"][data-i="0"]');
    assert.equal(await ev('document.querySelectorAll(".ed-q").length'), 2);
    await clic('[data-a="q-quitar"][data-i="1"]');
    assert.equal(await ev('document.querySelectorAll(".ed-q").length'), 1);

    // Vista previa desde la lista: se cierra con un clic
    await clic('[data-a="q-ver"][data-i="0"]');
    assert.equal(await dialogos(), 1);
    await clic('#previa-cerrar');
    assert.equal(await dialogos(), 0);

    // Agregar sala: una sola por clic
    await clic('[data-a="sala-agregar"]');
    assert.equal(await ev('document.querySelectorAll(".ed-sala").length'), 3);

    // Salir sin guardar: UN diálogo; «Seguir editando» y luego «Descartar» responden al primer clic
    await clic('[data-a="cancelar"]');
    assert.equal(await dialogos(), 1, 'Volver sin guardar abre un solo diálogo');
    await clic(BTN(1));
    assert.equal(await dialogos(), 0);
    assert.equal(await ev('document.querySelector(".pagina-cab h2").textContent'), 'Nuevo preset', 'sigue en edición');
    await clic('[data-a="cancelar"]');
    await clic(BTN(2));
    assert.equal(await dialogos(), 0);
    assert.equal(await ev('document.querySelector(".pagina-cab h2").textContent'), 'Editor de presets', 'salió al primer clic');
    assert.equal(await ev('EA.editor.presets().length'), 2, 'descartar no guardó nada');

    // Sin cambios, salir de la edición no pregunta nada
    await clic('.ed-preset:first-child [data-a="editar"]');
    await clic('[data-a="cancelar"]');
    assert.equal(await dialogos(), 0);
    assert.equal(await ev('document.querySelector(".pagina-cab h2").textContent'), 'Editor de presets');

    // Duplicar preset: exactamente uno más por clic
    await clic('.ed-preset:first-child [data-a="duplicar"]');
    assert.equal(await ev('EA.editor.presets().length'), 3, 'duplicar crea una sola copia');
    await clic('.ed-preset:last-child [data-a="eliminar"]');
    assert.equal(await dialogos(), 1);
    await clic(BTN(2));
    assert.equal(await ev('EA.editor.presets().length'), 2);
    assert.equal(await dialogos(), 0);

    // Esc sale del editor al menú de una vez
    await pag.tecla('Escape'); await pausa(150);
    assert.equal(await pantalla(), 'p-menu');

    // ---- Configuración tras varias visitas: +/- cambian de a uno
    await clic('[data-ir="configurar"]');
    await clic('#eq-mas');
    assert.equal(await ev('document.querySelectorAll(".equipo-fila").length'), 3, '+ agrega un solo equipo');
    await clic('#eq-menos');
    assert.equal(await ev('document.querySelectorAll(".equipo-fila").length'), 2);
    await clic('#t-activo'); await clic('#t-mas');
    assert.equal(await ev('document.querySelector("#t-seg").textContent'), '1:45 min', 'el tiempo sube un paso por clic');
    await clic('#t-activo');

    // ---- Partida, resumen, «Jugar de nuevo» y otra partida desde el menú: sin manejadores viejos
    const jugarYTerminar = async (n) => {
      await pag.tecla('Enter'); await pausa(150);
      assert.equal(await ev('EA.partida.fase'), 'explorar');
      await clic('#b-pausa');
      assert.equal(await ev('document.querySelector("#pausa").hidden'), false, 'partida ' + n + ': un clic en pausa pausa');
      await clic('#b-reanudar');
      assert.equal(await ev('document.querySelector("#pausa").hidden'), true, 'partida ' + n + ': un clic reanuda');
      await clic('.hot-objeto[data-id="limon"]');
      assert.equal(await ev('document.querySelectorAll("button.casilla").length'), 1, 'partida ' + n + ': recoger agrega un objeto');
      await clic('.hot-candado[data-id="0"]');
      assert.equal(await dialogos(), 1, 'partida ' + n + ': un solo diálogo de confirmación');
      await clic(BTN(1));                                 // Seguir explorando
      assert.equal(await dialogos(), 0);
      assert.equal(await ev('EA.partida.fase'), 'explorar', 'cancelar no gasta el turno');
      await clic('#b-ayuda');
      assert.equal(await ev('document.querySelector("#globo").hidden'), false);
      await clic('#b-fin');
      assert.equal(await dialogos(), 1, 'partida ' + n + ': un solo diálogo de terminar');
      await clic(BTN(2));
      assert.equal(await pantalla(), 'p-resumen');
    };
    await clic('#comenzar', 300);
    await jugarYTerminar(1);
    await clic('#r-otra', 300);
    await jugarYTerminar(2);
    await clic('#r-otra', 300);
    await jugarYTerminar(3);
    await clic('#r-menu');
    assert.equal(await pantalla(), 'p-menu');
    await clic('[data-ir="configurar"]');
    await clic('#comenzar', 300);
    await jugarYTerminar(4);
    await foto(pag, '01-final');

    assert.deepEqual(pag.errores, [], 'sin errores de JavaScript');
    assert.deepEqual(pag.consola, [], 'sin errores en la consola');
    console.log('E2E NAVEGACIÓN OK');
  } catch (err) {
    await foto(pag, 'ERROR').catch(() => {});
    console.error('E2E NAVEGACIÓN FALLÓ:', err.message);
    if (pag.errores.length) console.error('Errores de la página:\n' + pag.errores.join('\n'));
    process.exitCode = 1;
  } finally {
    await pag.cerrar();
  }
})();
