/*
 * Verificaciones adicionales en navegador real (headless, sin dependencias):
 * temporizador (agotado con y sin pregunta abierta, bono de rapidez), 4 equipos,
 * resolución de laptop escolar, pantalla «Cómo jugar», reemplazo de arte y movimiento reducido.
 * Uso: node tools/e2e-extras.js
 */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { abrir, urlJuego, RAIZ } = require('./cdp.js');
const foto = (pag, n) => pag.captura(path.join(RAIZ, 'capturas', 'extra-' + n + '.png'));

(async () => {
  const pag = await abrir();
  const ev = (x) => pag.evaluar(x);
  const pausa = (ms) => pag.esperar(ms);
  const fase = () => ev('EA.partida.fase');
  const esperarFase = async (f, max = 12000) => {
    for (let t = 0; t < max; t += 100) { if (await fase() === f) return; await pausa(100); }
    throw new Error('No se llegó a la fase «' + f + '» (quedó en «' + (await fase()) + '»)');
  };
  try {
    await pag.ir(urlJuego(''));
    await ev('localStorage.clear()');
    await pag.ir(urlJuego(''));

    // Cómo jugar
    await pag.clicEn('[data-ir="ayuda"]'); await pausa(200);
    assert.match(await ev('document.querySelector(".pagina").textContent'), /Explorar es gratis/);
    await foto(pag, '01-como-jugar');
    await pag.tecla('Escape'); await pausa(150);

    // Configuración: 4 equipos + temporizador de 30 s
    await pag.clicEn('[data-ir="configurar"]'); await pausa(200);
    await pag.clicEn('#eq-mas'); await pag.clicEn('#eq-mas'); await pausa(100);
    assert.equal(await ev('document.querySelectorAll(".equipo-fila").length'), 4);
    assert.equal(await ev('document.querySelector("#eq-mas").disabled'), true, 'máximo 4 equipos');
    await pag.clicEn('#t-activo'); await pausa(80);
    for (let i = 0; i < 6; i++) await pag.clicEn('#t-menos');
    assert.equal(await ev('document.querySelector("#t-valor").textContent'), '0:30 min');
    assert.equal(await ev('document.querySelector("#t-menos").disabled'), true, 'mínimo 30 s');
    const colores = await ev('Array.from(document.querySelectorAll(".equipo-fila .simbolo-eq")).map(function(e){return e.style.getPropertyValue("--eq")})');
    assert.equal(new Set(colores).size, 4, 'cada equipo tiene un color distinto');
    await foto(pag, '02-configuracion-4-equipos');

    // Acelera el reloj 8x para no esperar 30 s reales
    await ev('(function(){var n=performance.now.bind(performance);performance.now=function(){return n()*8}})()');
    await pag.clicEn('#comenzar'); await pausa(300);
    await pag.tecla('Escape'); await pausa(250); // salta la historia
    assert.equal(await ev('EA.partida.opciones.temporizador'), 30);
    assert.equal(await ev('document.querySelectorAll(".hud-eq").length'), 4);
    await foto(pag, '03-hud-4-equipos');

    // Turno 1: el tiempo se agota SIN pregunta abierta -> pasa el turno sin penalización
    await pag.tecla('Enter'); await pausa(200);
    assert.equal(await fase(), 'explorar');
    await pausa(2600);
    await foto(pag, '04-temporizador-urgente');
    for (let t = 0; t < 8000 && !(await ev('!!document.querySelector("#b-seguir")')); t += 100) await pausa(100);
    assert.match(await ev('document.querySelector(".veredicto h2").textContent'), /Se acabó el tiempo/);
    assert.match(await ev('document.querySelector(".veredicto p").textContent'), /sin penalización/);
    await foto(pag, '05-tiempo-agotado-sin-pregunta');
    await pag.tecla('Enter'); await esperarFase('cambio');
    assert.equal(await ev('EA.partida.turno'), 1);
    assert.equal(await ev('EA.partida.equipos[0].salas[0].candados.filter(function(c){return c.fallos>0}).length'), 0);
    assert.ok(await ev('EA.partida.equipos[0].tiempo') >= 29, 'se registró el tiempo del turno');

    // Turno 2: el tiempo se agota CON la pregunta abierta -> cuenta como error
    await pag.tecla('Enter'); await pausa(150);
    await pag.clicEn('.hot-candado[data-id="0"]'); await pausa(120);
    await pag.tecla('Enter'); await pausa(150);
    assert.equal(await fase(), 'pregunta');
    await esperarFase('resultado');
    assert.match(await ev('document.querySelector(".veredicto h2").textContent'), /Se acabó el tiempo/);
    assert.equal(await ev('EA.partida.equipos[1].salas[0].candados[0].fallos'), 1);
    await foto(pag, '06-tiempo-agotado-con-pregunta');
    await pag.tecla('Enter'); await esperarFase('cambio');

    // Turno 3: acierto rápido -> bono de rapidez; la pausa detiene el reloj
    await pag.tecla('Enter'); await pausa(120);
    await pag.tecla('p'); await pausa(100);
    const antes = await ev('document.querySelector("#hud-tiempo span").textContent');
    await pausa(700);
    assert.equal(await ev('document.querySelector("#hud-tiempo span").textContent'), antes, 'en pausa el reloj no corre');
    await pag.tecla('p'); await pausa(80);
    await pag.clicEn('.hot-candado[data-id="1"]'); await pausa(100);
    await pag.tecla('Enter'); await pausa(120);
    const ok = await ev('(function(){var st=EA.partida,eq=st.equipos[st.turno],c=eq.salas[eq.salaIdx].candados[st.activo],q=st.preset.salas[eq.salaIdx].preguntas[c.pregunta];return c.orden.indexOf(q.correcta);})()');
    await pag.tecla(String(ok + 1)); await pag.tecla('Enter'); await pausa(200);
    const puntos = await ev('EA.partida.equipos[2].puntaje');
    assert.ok(puntos > 100 && puntos <= 125, 'acierto con bono de rapidez: ' + puntos);
    assert.match(await ev('document.querySelector(".puntos-fila").textContent'), /rapidez/);
    await foto(pag, '07-bono-rapidez');

    // Resolución de laptop escolar: el lienzo escala completo, sin recortes
    await pag.tamano(1366, 768); await pausa(300);
    const caja = await ev('(function(){var r=document.querySelector("#escenario").getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]})()');
    assert.ok(caja[0] >= 0 && caja[1] >= 0 && caja[2] <= 1366 && caja[3] <= 768, 'el lienzo cabe en 1366x768: ' + caja);
    assert.ok(Math.abs(caja[2] / caja[3] - 16 / 9) < 0.01, 'mantiene 16:9');
    await foto(pag, '08-laptop-1366x768');
    await pag.tamano(1024, 768); await pausa(300);
    const caja2 = await ev('(function(){var r=document.querySelector("#escenario").getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]})()');
    assert.ok(caja2[2] <= 1024 && caja2[1] > 0, 'en 4:3 aparecen barras arriba y abajo: ' + caja2);
    await foto(pag, '09-proyector-4x3');
    await pag.tamano(1920, 1080);

    // Reemplazo de arte desde el registro: imagen propia en lugar del componente
    await ev('EA.ARTE_REEMPLAZOS["lab.matraz"]="arte/mi-matraz.png"; EA.ARTE_REEMPLAZOS["deco.reloj"]=\'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90"><circle cx="45" cy="45" r="40" fill="#F4C03E"/></svg>\'');
    const svg = await ev('EA.arte.componer("quimica", EA.arte.vistaDemo("quimica", 0))');
    assert.ok(svg.includes('<image href="arte/mi-matraz.png" width="90" height="120"'), 'ruta de archivo -> <image>');
    assert.ok(svg.includes('<image href="data:image/svg+xml;charset=utf-8,%3Csvg'), 'SVG en texto -> <image> con data URI');
    await ev('EA.ARTE_REEMPLAZOS={}');

    // Coherencia arte/lógica: cada escena tiene posición para cada candado, objeto y punto de examinar
    const huecos = await ev('(function(){var m=[];Object.keys(EA.ESCENAS).forEach(function(id){var l=EA.ESCENAS[id],a=EA.arte.ESCENAS[id];if(!a){m.push(id+": sin arte");return;}if(a.candados.length!==l.candados.length)m.push(id+": candados");Object.keys(l.examinar).forEach(function(k){if(!a.examinar[k])m.push(id+": examinar "+k)});Object.keys(a.examinar).forEach(function(k){if(!l.examinar[k])m.push(id+": texto de "+k)});if(l.puzzle){Object.keys(l.puzzle.objetos).forEach(function(k){if(!a.objetos[k])m.push(id+": objeto "+k)});if(!a.examinar[l.puzzle.usarEn])m.push(id+": punto de uso");if(!EA.arte.REG["obj."+l.puzzle.resultado.id])m.push(id+": arte del resultado");}if(!EA.arte.REG["fondo."+id])m.push(id+": fondo");});return m})()');
    assert.deepEqual(huecos, []);

    // Todos los interactivos tienen etiqueta accesible y caben en la zona útil
    const fuera = await ev('(function(){var m=[];Object.keys(EA.arte.ESCENAS).forEach(function(id){var d=document.createElement("div");d.innerHTML=EA.arte.componer(id,EA.arte.vistaDemo(id,0));d.querySelectorAll(".hot").forEach(function(h){if(!h.getAttribute("aria-label")||h.getAttribute("role")!=="button"||h.getAttribute("tabindex")!=="0")m.push(id+": sin aria");var r=h.querySelector(".hot-marco");var x=+r.getAttribute("x"),y=+r.getAttribute("y"),w=+r.getAttribute("width"),hh=+r.getAttribute("height");if(x<0||y<90||x+w>1920||y+hh>930)m.push(id+": "+h.getAttribute("aria-label")+" fuera de la zona útil ["+[x,y,w,hh]+"]");if(w<110||hh<110)m.push(id+": zona de clic chica en "+h.getAttribute("aria-label"))})});return m})()');
    assert.deepEqual(fuera, []);

    // prefers-reduced-motion: las animaciones quedan desactivadas
    await pag.movimientoReducido(true);
    await pag.ir(urlJuego('?captura=escena:fisica')); await pausa(200);
    const dur = await ev('getComputedStyle(document.querySelector(".pendulo-brazo")).animationDuration');
    assert.ok(parseFloat(dur) < 0.01, 'péndulo sin animación con movimiento reducido: ' + dur);

    assert.deepEqual(pag.errores, [], 'sin errores de JavaScript');
    assert.deepEqual(pag.consola, [], 'sin errores en la consola');
    console.log('E2E EXTRAS OK');
  } catch (err) {
    await foto(pag, 'ERROR').catch(() => {});
    console.error('E2E EXTRAS FALLÓ:', err.message);
    if (pag.errores.length) console.error('Errores de la página:\n' + pag.errores.join('\n'));
    process.exitCode = 1;
  } finally {
    await pag.cerrar();
  }
})();
