/*
 * Prueba de punta a punta del editor de presets en un navegador real (headless, sin dependencias):
 * crear, validar, vista previa, guardar, duplicar, exportar/importar con conflicto, eliminar y restaurar.
 * Uso: node tools/e2e-editor.js
 */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { abrir, urlJuego, RAIZ } = require('./cdp.js');
const foto = (pag, n) => pag.captura(path.join(RAIZ, 'capturas', 'editor-' + n + '.png'));

(async () => {
  const pag = await abrir();
  const ev = (x) => pag.evaluar(x);
  const pausa = (ms) => pag.esperar(ms);
  const nombres = () => ev('EA.editor.presets().map(function(p){return p.nombre})');
  const seleccionar = (sel) => ev('document.querySelector(' + JSON.stringify(sel) + ').select()');
  const elegirGrado = (v) => ev('(function(){var s=document.querySelector("#e-grado");s.value=' + JSON.stringify(v) + ';s.dispatchEvent(new Event("change",{bubbles:true}))})()');
  const GUARDAR_Q = '.dialogo .acciones button:last-child';
  try {
    await pag.ir(urlJuego(''));
    await ev('localStorage.clear()');
    await pag.ir(urlJuego(''));
    await pag.clicEn('[data-ir="editor"]'); await pausa(200);
    assert.equal(await ev('document.querySelectorAll(".ed-preset").length'), 2, 'ejemplo + plantilla');
    assert.match(await ev('document.querySelector(".aviso").textContent'), /viven en este navegador/);
    await foto(pag, '01-lista');

    // Filtro por grado
    await elegirGrado('3'); await pausa(100);
    assert.equal(await ev('document.querySelectorAll(".ed-preset").length'), 0);
    await elegirGrado('todos'); await pausa(100);

    // Nuevo preset
    await pag.clicEn('[data-a="nuevo"]'); await pausa(200);
    await pag.clicEn('#p-nombre');
    await seleccionar('#p-nombre');
    await pag.escribir('Mi preset de prueba');
    await pag.clicEn('[data-a="q-nueva"]'); await pausa(200);

    // Guardar con errores -> mensajes en español
    await pag.clicEn(GUARDAR_Q); await pausa(100);
    const errores = await ev('document.querySelector("#q-errores").textContent');
    assert.match(errores, /enunciado no puede estar vacío/);
    assert.match(errores, /alternativas vacías/);
    await foto(pag, '02-validacion');

    // Completar la pregunta
    await pag.clicEn('#q-enun'); await pag.escribir('¿Cuál es la fórmula del dióxido de carbono? <b>x</b>');
    const alts = ['CO_2', 'CO', 'C_2O', 'O_2'];
    for (let i = 0; i < 4; i++) { await pag.clicEn('[data-alt="' + i + '"]'); await pag.escribir(alts[i]); }
    await pag.clicEn('input[name="q-correcta"][value="0"]');
    await pag.clicEn('#q-pista'); await pag.escribir('Un carbono y dos oxígenos.');
    await pag.clicEn('#q-exp'); await pag.escribir('El CO_2 tiene un átomo de carbono y dos de oxígeno.');
    await foto(pag, '03-formulario');

    // Alternativa duplicada
    await pag.clicEn('[data-alt="1"]'); await seleccionar('[data-alt="1"]'); await pag.escribir('co_2');
    await pag.clicEn(GUARDAR_Q); await pausa(100);
    assert.match(await ev('document.querySelector("#q-errores").textContent'), /duplicadas/);
    await pag.clicEn('[data-alt="1"]'); await seleccionar('[data-alt="1"]'); await pag.escribir('CO');

    // Vista previa: subíndices y HTML escapado
    await pag.clicEn('.dialogo .acciones button:nth-child(2)'); await pausa(200);
    const previa = await ev('document.querySelector(".previa-caja .tarjeta").innerHTML');
    assert.ok(previa.includes('CO<sub>2</sub>'), 'notación convertida');
    assert.ok(previa.includes('&lt;b&gt;x&lt;/b&gt;'), 'HTML escapado');
    assert.equal(await ev('document.querySelectorAll(".previa-caja .enunciado b").length'), 0, 'no se inyectó HTML');
    await foto(pag, '04-vista-previa');
    await pag.tecla('Escape'); await pausa(100);
    await pag.clicEn(GUARDAR_Q); await pausa(200);
    assert.equal(await ev('document.querySelectorAll(".ed-q").length'), 1);
    await foto(pag, '05-edicion');

    // Guardar: queda incompleto (faltan preguntas) y el aviso lo explica
    await pag.clicEn('[data-a="guardar"]'); await pausa(200);
    assert.match(await ev('document.querySelector(".dialogo").textContent'), /necesita al menos 4 preguntas/);
    await pag.tecla('Enter'); await pausa(100);
    assert.deepEqual(await nombres(), ['Ejemplo: Ciencias básicas', 'Plantilla vacía', 'Mi preset de prueba']);
    assert.ok(await ev('!!localStorage.getItem("apagon-aurora.presets.v1")'), 'persistió en localStorage');

    // Duplicar
    await pag.clicEn('.ed-preset:first-child [data-a="duplicar"]'); await pausa(150);
    assert.equal((await nombres())[3], 'Ejemplo: Ciencias básicas (copia)');

    // Exportar todos e importar el mismo archivo: conflicto de nombres
    const json = await ev('JSON.stringify(EA.presets.exportar(EA.editor.presets()))');
    assert.equal(JSON.parse(json).formato, 'apagon-aurora-presets');
    await ev('void EA.editor.importarTexto(' + JSON.stringify(json) + ')'); await pausa(200);
    assert.match(await ev('document.querySelector(".dialogo h2").textContent'), /Ya existen presets con ese nombre/);
    await foto(pag, '06-conflicto');
    await pag.clicEn('.dialogo .acciones button:first-child'); await pausa(200);   // Omitir
    assert.match(await ev('document.querySelector(".dialogo").textContent'), /omitidos/);
    await pag.tecla('Enter'); await pausa(100);
    assert.equal((await nombres()).length, 4);
    await ev('void EA.editor.importarTexto(' + JSON.stringify(json) + ')'); await pausa(200);
    await pag.clicEn('.dialogo .acciones button:last-child'); await pausa(200);    // Conservar ambos
    await pag.tecla('Enter'); await pausa(100);
    // El ejemplo y su copia entran renombrados; la plantilla y el incompleto no pasan la validación.
    assert.deepEqual((await nombres()).slice(4), ['Ejemplo: Ciencias básicas (2)', 'Ejemplo: Ciencias básicas (copia) (2)']);

    // Archivo inválido
    await ev('void EA.editor.importarTexto("{esto no es json")'); await pausa(150);
    assert.match(await ev('document.querySelector(".dialogo").textContent'), /no es un JSON válido/);
    await pag.tecla('Enter'); await pausa(100);

    // Eliminar
    await pag.clicEn('.ed-preset:last-child [data-a="eliminar"]'); await pausa(150);
    await pag.clicEn('.dialogo .btn.peligro'); await pausa(150);
    assert.equal((await nombres()).length, 5);

    // Restaurar ejemplos tras borrar el original
    await pag.clicEn('.ed-preset:first-child [data-a="eliminar"]'); await pausa(150);
    await pag.clicEn('.dialogo .btn.peligro'); await pausa(150);
    assert.ok(!(await nombres()).includes('Ejemplo: Ciencias básicas'));
    await pag.clicEn('[data-a="restaurar"]'); await pausa(150);
    await pag.clicEn('.dialogo .acciones button:last-child'); await pausa(150);
    assert.equal((await nombres())[0], 'Ejemplo: Ciencias básicas');

    // ---- Editar a fondo un preset existente: cada acción responde al primer clic
    const velos = () => ev('document.querySelectorAll("#capa-modal .velo").length');
    const cambiar = (sel, v) => ev('(function(){var s=document.querySelector(' + JSON.stringify(sel) + ');s.value=' + JSON.stringify(v) + ';s.dispatchEvent(new Event("change",{bubbles:true}))})()');
    await pag.clicEn('.ed-preset:first-child [data-a="editar"]'); await pausa(150);
    assert.equal(await ev('document.querySelector(".pagina-cab h2").textContent'), 'Editar preset');
    await pag.clicEn('#p-nombre'); await seleccionar('#p-nombre'); await pag.escribir('Ejemplo editado');
    await cambiar('#p-grado', '2');
    // Reordenar: la sala 1 baja un lugar
    await pag.clicEn('[data-a="sala-abajo"][data-i="0"]'); await pausa(120);
    assert.deepEqual(await ev('Array.from(document.querySelectorAll(".ed-sala-btn span")).map(function(s){return s.firstChild.textContent})'), ['Laboratorio de Biología', 'Laboratorio de Química', 'Sala de Control']);
    assert.equal(await ev('document.querySelector(".ed-sala.sel b").textContent'), '2', 'la sala movida sigue seleccionada');
    // Cambiar el escenario de la sala 3 (de 4 a 3 candados): conserva sus preguntas
    await pag.clicEn('[data-a="sel-sala"][data-i="2"]'); await pausa(120);
    await cambiar('#s-escena', 'fisica'); await pausa(120);
    assert.equal(await ev('document.querySelectorAll(".ed-q").length'), 5);
    assert.match(await ev('document.querySelector(".ed-sala.sel small").textContent'), /5 de 3/);
    // Editar una pregunta: agregar una 5.ª alternativa y quitar la 2.ª
    await pag.clicEn('[data-a="q-editar"][data-i="0"]'); await pausa(150);
    assert.equal(await velos(), 1);
    await pag.clicEn('[data-q="alt-agregar"]'); await pausa(100);
    assert.equal(await ev('document.querySelectorAll("[data-alt]").length'), 5);
    assert.equal(await ev('document.querySelector(\'[data-q="alt-agregar"]\').disabled'), true, 'máximo 5 alternativas');
    await pag.clicEn('[data-alt="4"]'); await pag.escribir('Quinta opción');
    await pag.clicEn('[data-q="alt-quitar"][data-i="1"]'); await pausa(100);
    assert.equal(await ev('document.querySelectorAll("[data-alt]").length'), 4);
    assert.equal(await ev('document.querySelector(\'input[name="q-correcta"]:checked\').value'), '0', 'la correcta se conserva al quitar otra');
    assert.equal(await ev('document.querySelector(\'[data-alt="3"]\').value'), 'Quinta opción');
    // Quitar la correcta obliga a marcar otra
    await pag.clicEn('[data-q="alt-quitar"][data-i="0"]'); await pausa(100);
    await pag.clicEn(GUARDAR_Q); await pausa(120);
    assert.match(await ev('document.querySelector("#q-errores").textContent'), /exactamente una alternativa correcta/);
    assert.equal(await velos(), 1, 'con errores el diálogo sigue abierto');
    await pag.clicEn('input[name="q-correcta"][value="2"]');
    await pag.clicEn(GUARDAR_Q); await pausa(150);
    assert.equal(await velos(), 0, 'guardar la pregunta cierra al primer clic');
    // Quitar una sala con preguntas pide confirmación (una sola)
    await pag.clicEn('[data-a="sala-quitar"][data-i="1"]'); await pausa(120);
    assert.equal(await velos(), 1);
    await pag.tecla('Escape'); await pausa(100);
    assert.equal(await ev('document.querySelectorAll(".ed-sala").length'), 3, 'cancelar conserva la sala');
    // Nombre repetido: no guarda y lo explica
    await pag.clicEn('#p-nombre'); await seleccionar('#p-nombre'); await pag.escribir('plantilla vacía');
    await pag.clicEn('[data-a="guardar"]'); await pausa(120);
    assert.match(await ev('document.querySelector("#e-aviso").textContent'), /Ya existe otro preset/);
    assert.equal(await ev('document.querySelector(".pagina-cab h2").textContent'), 'Editar preset');
    await pag.clicEn('#p-nombre'); await seleccionar('#p-nombre'); await pag.escribir('Ejemplo editado');
    await pag.clicEn('[data-a="guardar"]'); await pausa(200);
    assert.equal(await velos(), 0, 'un preset válido se guarda sin avisos');
    assert.equal(await ev('document.querySelector(".pagina-cab h2").textContent'), 'Editor de presets', 'guardar vuelve a la lista al primer clic');
    const editado = JSON.parse(await ev('JSON.stringify(JSON.parse(localStorage.getItem("apagon-aurora.presets.v1"))[0])'));
    assert.equal(editado.nombre, 'Ejemplo editado');
    assert.equal(editado.grado, '2');
    assert.deepEqual(editado.salas.map((x) => x.escena), ['biologia', 'quimica', 'fisica']);
    assert.equal(editado.salas[2].preguntas[0].alternativas.length, 3);
    assert.equal(editado.salas[2].preguntas[0].alternativas[2], 'Quinta opción');
    assert.equal(editado.salas[2].preguntas[0].correcta, 2);
    assert.deepEqual(await ev('EA.presets.validarPreset(EA.editor.presets()[0]).errores'), []);

    // Los cambios sobreviven a recargar la página y el preset incompleto no aparece al jugar
    await pag.ir(urlJuego(''));
    await pag.clicEn('[data-ir="configurar"]'); await pausa(200);
    const jugables = await ev('Array.from(document.querySelectorAll(".preset-op strong")).map(function(e){return e.textContent})');
    assert.ok(jugables.includes('Ejemplo: Ciencias básicas (copia)'));
    assert.ok(!jugables.includes('Mi preset de prueba'), 'un preset incompleto no se ofrece para jugar');
    await foto(pag, '07-configuracion-con-presets');

    assert.deepEqual(pag.errores, [], 'sin errores de JavaScript');
    assert.deepEqual(pag.consola, [], 'sin errores en la consola');
    console.log('E2E EDITOR OK');
  } catch (err) {
    await foto(pag, 'ERROR').catch(() => {});
    console.error('E2E EDITOR FALLÓ:', err.message);
    if (pag.errores.length) console.error('Errores de la página:\n' + pag.errores.join('\n'));
    process.exitCode = 1;
  } finally {
    await pag.cerrar();
  }
})();
