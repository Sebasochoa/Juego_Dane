/*
 * Prueba de diseño con contenido extremo (navegador real, headless, sin dependencias).
 * Recorre todas las pantallas con textos larguísimos, palabras sin espacios, 5 alternativas,
 * 4 equipos con nombres largos, 5 salas y el preset real del docente, y en cada una corre la
 * auditoría (tools/auditoria.js): nada fuera del lienzo, sin desbordes y todos los botones pulsables.
 * Uso: node tools/e2e-diseno.js
 */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { abrir, urlJuego, RAIZ } = require('./cdp.js');
const AUDITORIA = require('./auditoria.js');
const foto = (pag, n) => pag.captura(path.join(RAIZ, 'capturas', 'diseno-' + n + '.png'));

const PALABRA = 'CH_3CH_2CH_2CH_2CH_2CH_2CH_2CH_2CH_2CH_2CH_2COOH-Pneumonoultramicroscópico';
const LARGO = 'En un experimento de laboratorio se calentaron 250 mL de una disolución acuosa de cloruro de sodio '
  + 'al 5 % en masa hasta que el volumen se redujo a la mitad por evaporación, manteniendo constante la cantidad de soluto. '
  + 'Considerando que la densidad de la disolución resultante es aproximadamente 1,07 g/mL, ¿cuál es su nueva concentración? ' + PALABRA;
function pregunta(i, n) {
  const alts = [];
  for (let k = 0; k < n; k++) alts.push('Alternativa ' + 'ABCDE'[k] + ' con un texto bastante largo que ocupa varias líneas para probar el diseño ' + (k === 1 ? PALABRA : 'de la tarjeta ' + i));
  return { enunciado: i % 2 ? LARGO : '¿Pregunta corta ' + i + '?', alternativas: alts, correcta: 0, rama: 'fisica', imagen: '',
    pista: 'Pista muy larga: ' + LARGO, explicacion: 'Explicación muy larga: ' + LARGO + ' ' + LARGO };
}
const ESCENAS = ['quimica', 'biologia', 'fisica', 'control', 'invernadero'];
const EXTREMO = {
  esquema: 1, id: 'extremo', grado: '5',
  nombre: 'Preset con un nombre larguísimo para probar cómo se acomoda el diseño en pantalla',
  descripcion: 'Descripción también muy larga para el selector de presets: ' + LARGO.slice(0, 300),
  salas: ESCENAS.map((e) => ({ escena: e, preguntas: Array.from({ length: 4 }, (_, i) => pregunta(i, i % 2 ? 5 : 2)) }))
};
const EQUIPOS = ['Electromagnetismo_123456', 'Los Supercientíficos 4°B', 'Termodinámica__Avanzada', 'Ñandúes de la Química'];

(async () => {
  const pag = await abrir();
  const ev = (x) => pag.evaluar(x);
  const pausa = (ms) => pag.esperar(ms);
  const clic = async (sel, ms = 150) => { await pag.clicEn(sel); await pausa(ms); };
  const problemas = [];
  let pantallas = 0;
  async function auditar(donde, conFoto) {
    pantallas++;
    await pausa(80);
    const p = await ev(AUDITORIA);
    p.forEach((x) => problemas.push(donde + ': ' + x));
    if (conFoto) await foto(pag, conFoto);
  }
  try {
    await pag.ir(urlJuego(''));
    await ev('localStorage.clear()');
    await pag.ir(urlJuego(''));
    await ev('EA.almacen.guardarPresets(EA.almacen.presets().concat([EA.presets.normalizarPreset(' + JSON.stringify(EXTREMO) + ')]))');
    assert.deepEqual(await ev('EA.presets.validarPreset(EA.almacen.presets().filter(function(p){return p.id==="extremo"})[0]).errores'), []);
    await pag.ir(urlJuego(''));

    await auditar('Menú', '01-menu');
    await clic('[data-ir="ayuda"]'); await auditar('Cómo jugar'); await pag.tecla('Escape'); await pausa(120);

    // ---- Editor: lista, edición de cada sala, formulario y vista previa
    await clic('[data-ir="editor"]', 250);
    await auditar('Editor (lista)');
    for (const id of ['ejemplo-anhidridos', 'extremo']) {
      await clic('.ed-preset[data-id="' + id + '"] [data-a="editar"]', 250);
      const salas = await ev('document.querySelectorAll(".ed-sala").length');
      for (let s = 0; s < salas; s++) {
        await clic('[data-a="sel-sala"][data-i="' + s + '"]', 120);
        await auditar('Editor «' + id + '», sala ' + (s + 1), id === 'extremo' && s === 0 ? '02-editor-extremo' : (id === 'ejemplo-anhidridos' && s === 0 ? '02-editor-anhidridos' : ''));
        assert.ok(await ev('(function(){var b=document.querySelector(\'[data-a="q-nueva"]\').getBoundingClientRect();return b.right<=1920&&b.left>=0})()'), '«Agregar pregunta» visible (' + id + ', sala ' + (s + 1) + ')');
      }
      await clic('[data-a="q-editar"][data-i="1"]', 200);
      await auditar('Formulario de pregunta (' + id + ')', id === 'extremo' ? '03-formulario-extremo' : '');
      await clic('.dialogo .acciones button:nth-child(2)', 200);
      await auditar('Vista previa (' + id + ')', id === 'extremo' ? '04-vista-previa-extremo' : '');
      await pag.tecla('Escape'); await pausa(100);
      await clic('.dialogo .acciones button:first-child', 150);
      await clic('[data-a="cancelar"]', 200);
    }
    await pag.tecla('Escape'); await pausa(150);

    // ---- Configuración: por turnos con 4 equipos de nombres largos, y un solo equipo
    await clic('[data-ir="configurar"]', 250);
    await ev('(function(){var s=document.querySelector("#f-grado");s.value="5";s.dispatchEvent(new Event("change",{bubbles:true}))})()'); await pausa(120);
    await clic('#eq-mas'); await clic('#eq-mas');
    for (let i = 0; i < 4; i++) { await pag.clicEn('input[data-eq="' + i + '"]'); await ev('document.querySelector(\'input[data-eq="' + i + '"]\').select()'); await pag.escribir(EQUIPOS[i]); }
    await clic('#t-activo');
    await auditar('Configuración por turnos', '05-config-turnos');
    await clic('.modo-op:nth-child(2)');
    await auditar('Configuración un solo equipo');
    await clic('.modo-op:nth-child(1)');

    // ---- Historia de inicio con 5 salas
    await clic('#comenzar', 400);
    for (let i = 0; i < 4; i++) { await auditar('Historia, panel ' + (i + 1), i === 3 ? '06-mapa-5-salas' : ''); await pag.tecla('Enter'); await pausa(350); }
    assert.equal(await ev('document.querySelector("#pantalla").className'), 'p-juego');

    // ---- Juego por turnos: cambio, exploración, confirmación, pregunta extrema, resultado
    await auditar('Cambio de turno');
    await pag.tecla('Enter'); await pausa(200);
    await auditar('Explorar (4 equipos)', '07-hud-4-equipos');
    await clic('.hot-candado[data-id="1"]');
    await auditar('Confirmar candado');
    await pag.tecla('Enter'); await pausa(200);
    await auditar('Pregunta', '08-pregunta-extrema');
    const pregunta2 = await ev('JSON.stringify({opciones:document.querySelectorAll(".opcion").length,pie:document.querySelector("#b-confirmar").getBoundingClientRect().bottom})');
    assert.ok(JSON.parse(pregunta2).pie <= 1080, 'el botón Confirmar queda a la vista');
    const mal = await ev('(function(){var st=EA.partida,eq=st.equipos[st.turno],c=eq.salas[eq.salaIdx].candados[st.activo],q=st.preset.salas[eq.salaIdx].preguntas[c.pregunta];return (c.orden.indexOf(q.correcta)+1)%c.orden.length})()');
    await clic('.opcion[data-op="' + mal + '"]', 80);
    await pag.tecla('Enter'); await pausa(200);
    await auditar('Resultado con pista larga', '09-resultado-pista');
    await pag.tecla('Enter');
    for (let t = 0; t < 40 && (await ev('EA.partida.fase')) !== 'cambio'; t++) await pausa(100);
    // Un segundo fallo para ver la explicación larga
    await pag.tecla('Enter'); await pausa(150);
    await ev('(function(){var st=EA.partida;st.turno=0;})()');
    // Terminar por el docente y ver el resumen con 4 equipos
    await clic('#b-fin'); await clic('.dialogo .btn.peligro', 400);
    await auditar('Resumen por turnos', '10-resumen-4-equipos');

    // ---- Final de la historia con nombres largos (se fuerza el estado de escape)
    await ev('EA.partida.equipos.forEach(function(e,i){e.escapo=true;e.ordenEscape=i+1});EA.partida.motivoFin="escape";'
      + 'EA.ui.ir("historia",{paneles:EA.historia.final(EA.juego.resumen(EA.partida)),siguiente:"resumen",estado:EA.partida,params:{preset:EA.partida.preset,equipos:[],opciones:{}}})');
    await pausa(300);
    await auditar('Final, panel 1', '11-final-turnos');
    await pag.tecla('Enter'); await pausa(300);
    await auditar('Final, panel 2');
    await pag.tecla('Enter'); await pausa(300);
    await auditar('Resumen tras el final');

    // ---- Un solo equipo con el preset del docente
    await clic('#r-menu', 250);
    await clic('[data-ir="configurar"]', 250);
    await ev('(function(){var s=document.querySelector("#f-grado");s.value="3";s.dispatchEvent(new Event("change",{bubbles:true}))})()'); await pausa(120);
    await clic('.modo-op:nth-child(2)');
    await pag.clicEn('#h-activo'); await pausa(80); // sin historia: directo al juego
    await clic('#comenzar', 400);
    assert.equal(await ev('document.querySelector("#pantalla").className'), 'p-juego', 'sin historia va directo al juego');
    await auditar('Nueva sala (un solo equipo)', '12-solo-sala');
    await pag.tecla('Enter'); await pausa(200);
    await auditar('Explorar (un solo equipo)');
    for (let i = 0; i < 3; i++) {
      await clic('.hot-candado.candado-cerrado');
      await pag.tecla('Enter'); await pausa(200);
      await auditar('Pregunta del docente ' + (i + 1), i === 0 ? '13-pregunta-docente' : '');
      const ok = await ev('(function(){var st=EA.partida,eq=st.equipos[0],c=eq.salas[eq.salaIdx].candados[st.activo],q=st.preset.salas[eq.salaIdx].preguntas[c.pregunta];return c.orden.indexOf(q.correcta)})()');
      await pag.tecla(String(ok + 1)); await pag.tecla('Enter'); await pausa(200);
      await auditar('Resultado del docente ' + (i + 1), i === 0 ? '14-resultado-docente' : '');
      await pag.tecla('Enter');
      for (let t = 0; t < 40 && (await ev('EA.partida.fase')) !== 'explorar'; t++) await pausa(100);
    }
    await clic('#b-fin'); await clic('.dialogo .btn.peligro', 400);
    await auditar('Resumen un solo equipo', '15-resumen-solo');

    // ---- Ventana chica (laptop) y proyector 4:3
    for (const [w, h] of [[1366, 768], [1024, 768], [800, 600]]) {
      await pag.tamano(w, h); await pausa(250);
      await auditar('Resumen en ' + w + '×' + h);
    }
    await pag.tamano(1920, 1080);

    assert.deepEqual(pag.errores, [], 'sin errores de JavaScript');
    if (problemas.length) {
      console.error(problemas.join('\n'));
      throw new Error(problemas.length + ' problemas de diseño');
    }
    console.log('E2E DISEÑO OK: ' + pantallas + ' pantallas auditadas sin problemas.');
  } catch (err) {
    await foto(pag, 'ERROR').catch(() => {});
    console.error('E2E DISEÑO FALLÓ:', err.message);
    if (pag.errores.length) console.error('Errores de la página:\n' + pag.errores.join('\n'));
    process.exitCode = 1;
  } finally {
    await pag.cerrar();
  }
})();
