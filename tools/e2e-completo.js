/*
 * Prueba exhaustiva del flujo de juego en navegador real (headless, sin dependencias).
 * Preset propio con las 5 salas, bancos más grandes que los candados, preguntas de 2 a 5
 * alternativas, notación científica y texto con HTML malicioso. Tres equipos con estrategias
 * distintas: A acierta siempre, B falla una vez cada candado (pista), C falla dos veces
 * (explicación). En CADA turno se comprueba que la pantalla coincide con el estado.
 * Uso: node tools/e2e-completo.js
 */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { abrir, urlJuego, RAIZ } = require('./cdp.js');
const foto = (pag, n) => pag.captura(path.join(RAIZ, 'capturas', 'completo-' + n + '.png'));

const XSS = '<img src=x onerror="window.__xss=1">';
function pregunta(sala, i, nAlt) {
  const alts = [];
  for (let k = 0; k < nAlt; k++) alts.push(k === 0 ? 'Correcta S' + sala + 'P' + i + ' H_2O' : 'Distractor ' + k + ' de S' + sala + 'P' + i + (k === 1 ? ' ' + XSS : ''));
  const correcta = (sala + i) % nAlt;
  const t = alts[0]; alts[0] = alts[correcta]; alts[correcta] = t;
  return {
    enunciado: 'Pregunta ' + i + ' de la sala ' + sala + ': 10^{-3} m/s^2 ' + XSS, alternativas: alts, correcta,
    pista: 'Pista S' + sala + 'P' + i + ' <b>negrita</b>', explicacion: 'Explicación S' + sala + 'P' + i + ' CO_2', rama: ['biologia', 'quimica', 'fisica', ''][i % 4], imagen: ''
  };
}
const ESCENAS = ['invernadero', 'quimica', 'fisica', 'biologia', 'control'];
const CANDADOS = { invernadero: 3, quimica: 4, fisica: 3, biologia: 4, control: 4 };
const preset = {
  esquema: 1, id: 'prueba-completa', nombre: 'Prueba completa ' + XSS, grado: '4', descripcion: 'Cinco salas ' + XSS,
  salas: ESCENAS.map((e, s) => ({ escena: e, preguntas: Array.from({ length: CANDADOS[e] + 2 }, (_, i) => pregunta(s, i, [4, 2, 5, 3, 4, 4][i % 6])) }))
};
const TOTAL_CANDADOS = ESCENAS.reduce((a, e) => a + CANDADOS[e], 0); // 18

(async () => {
  const pag = await abrir();
  const ev = (x) => pag.evaluar(x);
  const pausa = (ms) => pag.esperar(ms);
  const clic = async (sel, ms = 90) => { await pag.clicEn(sel); await pausa(ms); };
  const dialogos = () => ev('document.querySelectorAll("#capa-modal .velo").length');
  const globo = () => ev('document.querySelector("#globo").hidden ? "" : document.querySelector("#globo").textContent');
  const S = () => ev('(function(){var st=EA.partida,eq=st.equipos[st.turno];var sala=eq.escapo?null:eq.salas[eq.salaIdx];var esc=eq.escapo?null:EA.juego.escenaDe(st,eq);return JSON.stringify({fase:st.fase,turno:st.turno,activo:st.activo,escapes:st.escapes,eqs:st.equipos.map(function(e){return {n:e.nombre,p:e.puntaje,s:e.salaIdx,esc:e.escapo,ord:e.ordenEscape,st:e.stats}}),sala:sala&&{inv:sala.inventario,rec:sala.recogidos,usado:sala.usado,comb:sala.combinado,c:sala.candados.map(function(c){return {e:c.estado,f:c.fallos,o:c.oculto}})},esc:esc&&{id:esc.id,pz:esc.puzzle&&{objs:Object.keys(esc.puzzle.objetos),res:esc.puzzle.resultado.id,en:esc.puzzle.usarEn,rev:esc.puzzle.revela},ex:Object.keys(esc.examinar)}})})()').then(JSON.parse);
  const esperarFase = async (fases, max = 8000) => {
    for (let t = 0; t < max; t += 60) { const f = await ev('EA.partida.fase'); if (fases.includes(f)) return f; await pausa(60); }
    throw new Error('No se llegó a ' + fases + ' (quedó en ' + (await ev('EA.partida.fase')) + ')');
  };

  /** La pantalla debe reflejar exactamente el estado. */
  async function coherencia(donde) {
    const s = await S();
    const dom = JSON.parse(await ev('JSON.stringify({pts:Array.from(document.querySelectorAll(".hud-eq .pts")).map(function(e){return +e.textContent}),activo:Array.from(document.querySelectorAll(".hud-eq")).findIndex(function(e){return e.classList.contains("activo")}),inv:Array.from(document.querySelectorAll("button.casilla")).map(function(b){return b.getAttribute("data-inv")}),cand:Array.from(document.querySelectorAll(".hot-candado")).map(function(h){return h.getAttribute("class").replace(/.*candado-(\\w+).*/,"$1")}),objs:Array.from(document.querySelectorAll(".hot-objeto")).map(function(h){return h.getAttribute("data-id")}),luces:document.querySelectorAll(".puerta-luz.on").length,escena:document.querySelector("svg.escena").getAttribute("class"),xss:window.__xss||0,inyectado:document.querySelectorAll("#pantalla img[onerror], #pantalla script, #capa-modal img[onerror]").length,velos:document.querySelectorAll("#capa-modal .velo").length})'));
    assert.deepEqual(dom.pts, s.eqs.map((e) => e.p), donde + ': puntajes del marcador');
    assert.equal(dom.activo, s.turno, donde + ': equipo resaltado en el marcador');
    assert.equal(dom.xss, 0, donde + ': no se ejecutó HTML del preset');
    assert.equal(dom.inyectado, 0, donde + ': no se inyectó HTML del preset');
    assert.ok(dom.velos <= 1, donde + ': a lo sumo un diálogo');
    if (s.sala && s.fase === 'explorar') {
      assert.ok(dom.escena.includes('escena-' + s.esc.id), donde + ': escena correcta (' + s.esc.id + ')');
      assert.deepEqual(dom.inv, s.sala.inv, donde + ': inventario');
      assert.deepEqual(dom.cand, s.sala.c.map((c) => (c.o ? 'oculto' : c.e === 'abierto' ? 'abierto' : c.f > 0 ? 'error' : 'cerrado')), donde + ': estado de los candados');
      assert.equal(dom.luces, s.sala.c.filter((c) => c.e === 'abierto').length, donde + ': luces de la puerta');
      if (s.esc.pz) assert.deepEqual(dom.objs.slice().sort(), s.esc.pz.objs.filter((o) => !s.sala.rec.includes(o)).sort(), donde + ': objetos visibles');
      else assert.deepEqual(dom.objs, [], donde + ': sala sin objetos');
    }
    return s;
  }

  /** Explora la sala a fondo sin gastar el turno (solo la primera vez que el equipo la ve). */
  async function explorar(s, conArrastre) {
    const turno = s.turno;
    for (const k of s.esc.ex) { await clic('.hot-examinar[data-id="' + k + '"]'); assert.ok((await globo()).length > 20, 'examinar ' + k + ' muestra un texto'); }
    await clic('.hot-puerta'); assert.match(await globo(), /candados estén abiertos/);
    if (s.esc.pz) {
      const pz = s.esc.pz;
      await clic('.hot-candado[data-id="' + pz.rev + '"]');
      assert.match(await globo(), /sin energía/); assert.equal(await dialogos(), 0, 'un candado oculto no abre pregunta');
      await pag.tecla('h'); await pausa(60); assert.ok((await globo()).length > 20, 'pista 1 del asistente');
      const p1 = await globo();
      await clic('.hot-objeto[data-id="' + pz.objs[0] + '"]');
      // Usar un objeto suelto donde no corresponde
      await clic('button.casilla[data-inv="' + pz.objs[0] + '"]');
      assert.equal(await ev('document.querySelector("button.casilla").getAttribute("aria-pressed")'), 'true');
      await clic('.hot-examinar[data-id="' + pz.en + '"]');
      assert.match(await globo(), /no sirve/i);
      assert.deepEqual((await S()).sala.inv, [pz.objs[0]], 'el objeto sigue en el inventario');
      // Seleccionar y deseleccionar con Esc
      await clic('button.casilla[data-inv="' + pz.objs[0] + '"]'); await pag.tecla('Escape'); await pausa(60);
      assert.equal(await ev('document.querySelector("button.casilla").getAttribute("aria-pressed")'), 'false');
      await clic('.hot-objeto[data-id="' + pz.objs[1] + '"]');
      await pag.tecla('h'); await pausa(60); const p2 = await globo(); assert.notEqual(p2, p1, 'la pista avanza con el progreso');
      if (conArrastre) {
        const p = await ev('(function(){var b=document.querySelectorAll("button.casilla");var a=b[0].getBoundingClientRect(),c=b[1].getBoundingClientRect();return [a.left+a.width/2,a.top+a.height/2,c.left+c.width/2,c.top+c.height/2]})()');
        await pag.arrastrar(p[0], p[1], p[2], p[3]); await pausa(120);
      } else {
        await clic('button.casilla[data-inv="' + pz.objs[1] + '"]'); await clic('button.casilla[data-inv="' + pz.objs[0] + '"]');
      }
      assert.deepEqual((await S()).sala.inv, [pz.res], 'combinación correcta');
      await pag.tecla('h'); await pausa(60); assert.notEqual(await globo(), p2);
      // Usar el resultado en un candado normal: no sirve
      await clic('button.casilla[data-inv="' + pz.res + '"]'); await clic('.hot-candado[data-id="0"]');
      assert.match(await globo(), /no sirve/i); assert.equal(await dialogos(), 0);
      // Usarlo bien: arrastrando al punto de uso o haciendo clic en el candado sin energía
      if (conArrastre) {
        const p = await ev('(function(){var a=document.querySelector("button.casilla").getBoundingClientRect(),c=document.querySelector(\'.hot-examinar[data-id="' + pz.en + '"] .hot-marco\').getBoundingClientRect();return [a.left+a.width/2,a.top+a.height/2,c.left+c.width/2,c.top+20]})()');
        await pag.arrastrar(p[0], p[1], p[2], p[3]); await pausa(120);
      } else {
        await clic('button.casilla[data-inv="' + pz.res + '"]'); await clic('.hot-candado[data-id="' + pz.rev + '"]');
      }
      const d = await S();
      assert.equal(d.sala.usado, true, 'puzzle resuelto'); assert.deepEqual(d.sala.inv, []); assert.equal(d.sala.c[pz.rev].o, false);
      // El candado revelado tapa el centro del punto de uso: se hace clic en su borde superior.
      const arriba = await ev('(function(){var c=document.querySelector(\'.hot-examinar[data-id="' + pz.en + '"] .hot-marco\').getBoundingClientRect();return [c.left+c.width/2,c.top+24]})()');
      await pag.clic(arriba[0], arriba[1]); await pausa(90);
      assert.match(await globo(), /Ya funciona/);
    } else {
      await pag.tecla('h'); await pausa(60); assert.match(await globo(), /no hay objetos que combinar/);
    }
    const d = await S();
    assert.equal(d.turno, turno); assert.equal(d.fase, 'explorar', 'explorar nunca gasta el turno');
  }

  const vistas = {};
  let turnos = 0;
  const cuenta = { fallo: 0, explicacion: 0, pista: 0, primer: 0 };

  /** Un turno completo. acierta: si responde bien. */
  async function turno(acierta) {
    turnos++;
    let s = await coherencia('cambio de turno ' + turnos);
    assert.equal(s.fase, 'cambio');
    assert.equal(await ev('document.querySelector(".cambio .nombre span:last-child").textContent'), s.eqs[s.turno].n);
    if (turnos % 3 === 0) await clic('#b-turno', 120); else { await pag.tecla('Enter'); await pausa(120); }
    s = await coherencia('inicio del turno ' + turnos);
    assert.equal(s.fase, 'explorar');
    const clave = s.turno + ':' + s.eqs[s.turno].s;
    if (!vistas[clave]) { vistas[clave] = true; await explorar(s, s.turno === 0); s = await coherencia('tras explorar, turno ' + turnos); }

    // Elegir candado: primero el que ya tiene un fallo (reintento), si no el primero cerrado
    let idx = s.sala.c.findIndex((c) => c.e === 'cerrado' && !c.o && c.f > 0);
    if (idx < 0) idx = s.sala.c.findIndex((c) => c.e === 'cerrado' && !c.o);
    assert.ok(idx >= 0, 'hay un candado disponible');
    // Un candado ya abierto solo avisa
    const abierto = s.sala.c.findIndex((c) => c.e === 'abierto');
    if (abierto >= 0 && turnos % 4 === 0) { await clic('.hot-candado[data-id="' + abierto + '"]'); assert.match(await globo(), /ya está abierto/); assert.equal(await dialogos(), 0); }

    // Abrir: con teclado (foco + Enter) o con mouse; a veces cancelar primero
    if (turnos % 2 === 0) { await ev('document.querySelector(\'.hot-candado[data-id="' + idx + '"]\').focus()'); await pag.tecla('Enter'); await pausa(100); }
    else await clic('.hot-candado[data-id="' + idx + '"]');
    assert.equal(await dialogos(), 1, 'confirmación del candado');
    if (s.sala.c[idx].f > 0) assert.match(await ev('document.querySelector(".dialogo").textContent'), /Segundo intento/);
    if (turnos % 5 === 0) {
      await pag.tecla('Escape'); await pausa(80);
      assert.equal(await dialogos(), 0); assert.equal((await S()).fase, 'explorar', 'Esc no gasta el turno');
      await clic('.hot-candado[data-id="' + idx + '"]');
    }
    await pag.tecla('Enter'); await pausa(120);
    s = await S();
    assert.equal(s.fase, 'pregunta'); assert.equal(s.activo, idx);

    // La tarjeta muestra la pregunta sorteada, con su número real de alternativas y la pista si corresponde
    const q = JSON.parse(await ev('(function(){var st=EA.partida,eq=st.equipos[st.turno],c=eq.salas[eq.salaIdx].candados[st.activo],q=st.preset.salas[eq.salaIdx].preguntas[c.pregunta];return JSON.stringify({n:q.alternativas.length,ok:c.orden.indexOf(q.correcta),fallos:c.fallos,txt:q.alternativas[q.correcta]})})()'));
    const tarjeta = JSON.parse(await ev('JSON.stringify({n:document.querySelectorAll(".opcion").length,pista:!!document.querySelector(".caja-pista"),sub:document.querySelectorAll(".tarjeta sub").length,sup:document.querySelectorAll(".enunciado sup").length,conf:document.querySelector("#b-confirmar").disabled,inerte:document.querySelector("#escena").inert})'));
    assert.equal(tarjeta.n, q.n, 'número de alternativas'); assert.equal(tarjeta.pista, q.fallos > 0, 'pista visible solo en el reintento');
    assert.ok(tarjeta.sup >= 2 && tarjeta.sub >= 1, 'notación científica convertida'); assert.equal(tarjeta.conf, true, 'no se confirma sin elegir');
    assert.equal(tarjeta.inerte, true, 'la escena no recibe clics bajo la pregunta');
    await pag.tecla('Enter'); await pausa(60);
    assert.equal((await S()).fase, 'pregunta', 'Enter sin elegir no responde');
    // Tecla fuera de rango: no elige nada
    if (q.n < 5) { await pag.tecla('e'); await pausa(40); assert.equal(await ev('document.querySelector("#b-confirmar").disabled'), true); }

    const elegir = acierta ? q.ok : (q.ok + 1) % q.n;
    // Primero se elige otra y luego se cambia de opinión
    const otra = (elegir + 1) % q.n;
    await clic('.opcion[data-op="' + otra + '"]', 50);
    const modo = turnos % 3;
    if (modo === 0) await clic('.opcion[data-op="' + elegir + '"]', 50);
    else if (modo === 1) { await pag.tecla('abcde'[elegir]); await pausa(50); }
    else { await pag.tecla(String(elegir + 1)); await pausa(50); }
    assert.equal(await ev('Array.from(document.querySelectorAll(".opcion")).findIndex(function(o){return o.getAttribute("aria-checked")==="true"})'), elegir, 'una sola alternativa marcada');
    const antes = (await S()).eqs.map((e) => e.p);
    if (modo === 0) await clic('#b-confirmar', 150); else { await pag.tecla('Enter'); await pausa(150); }
    s = await S();
    assert.equal(s.fase, 'resultado');
    const r = JSON.parse(await ev('JSON.stringify({h:document.querySelector(".veredicto h2").textContent,bien:!!document.querySelector(".veredicto.bien"),ok:document.querySelectorAll(".opcion.es-correcta").length,mal:document.querySelectorAll(".opcion.es-error").length,pista:!!document.querySelector(".caja-pista:not(.exp)"),exp:!!document.querySelector(".caja-pista.exp"),total:(document.querySelector(".chip.total")||{}).textContent||"",b:document.querySelectorAll(".tarjeta .caja-pista b").length})'));
    const gano = s.eqs[s.turno].p - antes[s.turno];
    antes.forEach((p, i) => { if (i !== s.turno) assert.equal(s.eqs[i].p, p, 'solo cambia el puntaje del equipo en turno'); });
    if (acierta) {
      assert.equal(r.h, '¡Correcto!'); assert.ok(r.bien); assert.equal(r.ok, 1); assert.equal(r.mal, 0); assert.ok(r.exp);
      cuenta[q.fallos ? 'pista' : 'primer']++;
      assert.ok(gano >= (q.fallos ? 50 : 100), 'puntos del acierto: ' + gano);
    } else if (q.fallos === 0) {
      assert.equal(r.h, 'Respuesta incorrecta'); assert.equal(r.ok, 0, 'no se revela la correcta en el primer fallo'); assert.equal(r.mal, 1); assert.ok(r.pista && !r.exp); assert.equal(gano, 0);
      cuenta.fallo++;
    } else {
      assert.equal(r.h, 'Respuesta incorrecta'); assert.equal(r.ok, 1, 'se revela la correcta'); assert.equal(r.mal, 1); assert.ok(r.exp);
      assert.ok(gano === 0 || gano === 50, 'tras la explicación solo puede sumar el bono de sala: ' + gano); cuenta.explicacion++;
    }
    if (acierta || q.fallos > 0) assert.equal(r.total, (gano > 0 ? '+' + gano : '0') + ' puntos', 'el total mostrado coincide con lo sumado');
    assert.equal(r.b, 1, 'el HTML de la pista o explicación no se interpreta');
    await coherencia('resultado del turno ' + turnos);
    if (turnos === 1) await foto(pag, '01-resultado');
    // Durante la animación posterior no se puede hacer nada
    await pag.tecla('Enter'); await pausa(40);
    if (turnos % 6 === 0) { await ev('(function(){var h=document.querySelector(".hot-candado.candado-cerrado");if(h)h.dispatchEvent(new MouseEvent("click",{bubbles:true}))})()'); assert.equal(await dialogos(), 0, 'bloqueado durante la animación'); }
    return esperarFase(['cambio', 'fin']);
  }

  try {
    await pag.ir(urlJuego(''));
    await ev('localStorage.clear()');
    await pag.ir(urlJuego(''));
    await ev('EA.almacen.guardarPresets(EA.almacen.presets().concat([EA.presets.normalizarPreset(' + JSON.stringify(preset) + ')]))');
    assert.deepEqual(await ev('EA.presets.validarPreset(EA.almacen.presets().filter(function(p){return p.id==="prueba-completa"})[0]).errores'), [], 'el preset de prueba es válido');
    await pag.ir(urlJuego(''));
    await ev('EA.CONFIG.ESPERA_CANDADO_MS=120; EA.CONFIG.ESPERA_PUERTA_MS=250');

    // Configuración: filtro por grado, 3 equipos con nombres con HTML y uno repetido
    await clic('[data-ir="configurar"]', 200);
    assert.equal(await ev('document.querySelectorAll(".preset-op").length'), 3);
    await ev('(function(){var s=document.querySelector("#f-grado");s.value="4";s.dispatchEvent(new Event("change",{bubbles:true}))})()'); await pausa(100);
    assert.equal(await ev('document.querySelectorAll(".preset-op").length'), 1, 'filtro por grado');
    assert.equal(await ev('document.querySelector(".preset-op input").checked'), true);
    await clic('#eq-mas');
    const nombres = ['Alfa ' + XSS, 'Beta', 'beta'];
    for (let i = 0; i < 3; i++) { await pag.clicEn('input[data-eq="' + i + '"]'); await ev('document.querySelector(\'input[data-eq="' + i + '"]\').select()'); await pag.escribir(nombres[i]); }
    // Cambiar un color a uno libre; los que están en uso quedan deshabilitados
    assert.equal(await ev('document.querySelector(\'.color-op[data-eq="0"][data-color="1"]\').disabled'), true);
    await clic('.color-op[data-eq="0"][data-color="5"]');
    await foto(pag, '00-configuracion');
    await clic('#comenzar', 400);
    // Historia: el plano muestra las 5 salas en orden y ningún texto del preset se interpreta como HTML
    for (let i = 0; i < 3; i++) await clic('#hist-sig', 300);
    assert.match(await ev('document.querySelector("#hist-txt").textContent'), /5 salas: Invernadero, Laboratorio de Química, Taller de Física, Laboratorio de Biología y Sala de Control/);
    assert.equal(await ev('document.querySelectorAll(\'#hist-arte svg g[transform*="scale(1.25)"]\').length'), 5, 'cinco salas en el plano');
    await clic('#hist-sig', 300);
    let s = await S();
    assert.deepEqual(s.eqs.map((e) => e.n), ['Alfa ' + XSS.slice(0, 24 - 5), 'Beta', 'beta 2'], 'nombre recortado a 24 y repetido renombrado');
    assert.equal(s.eqs.length, 3);

    // Sorteo: con banco mayor que los candados, los equipos no reciben exactamente las mismas preguntas
    const sorteo = JSON.parse(await ev('JSON.stringify(EA.partida.equipos.map(function(e){return e.salas.map(function(s){return s.candados.map(function(c){return c.pregunta}).sort().join()})}))'));
    assert.ok(sorteo[0].some((x, i) => x !== sorteo[1][i]) && sorteo[1].some((x, i) => x !== sorteo[2][i]), 'sorteo distinto por equipo');

    // Partida: A acierta siempre; B falla una vez cada candado; C falla dos veces cada candado
    const intentos = [{}, {}, {}];
    let guardia = 0, fotoSalas = {};
    while ((await ev('EA.partida.fase')) !== 'fin') {
      assert.ok(++guardia < 140, 'la partida debe terminar');
      s = await S();
      const t = s.turno, clave = s.eqs[t].s + ':' + (s.sala.c.findIndex((c) => c.e === 'cerrado' && !c.o && c.f > 0) >= 0 ? 'r' : 'n') + ':' + s.sala.c.filter((c) => c.e === 'abierto').length;
      const hechos = intentos[t][clave] || 0; intentos[t][clave] = hechos + 1;
      const enReintento = s.sala.c.some((c) => c.e === 'cerrado' && c.f > 0);
      const acierta = t === 0 ? true : t === 1 ? enReintento : false;
      const antesEsc = s.eqs.filter((e) => e.esc).length;
      await turno(acierta);
      const d = await S();
      // Un equipo que escapó no vuelve a jugar
      if (d.fase !== 'fin') assert.equal(d.eqs[d.turno].esc, false, 'el turno nunca cae en un equipo que escapó');
      if (d.eqs.filter((e) => e.esc).length > antesEsc) assert.equal(d.eqs[t].ord, antesEsc + 1, 'orden de escape');
      if (t === 0 && !fotoSalas[s.esc.id]) { fotoSalas[s.esc.id] = true; }
    }
    await pausa(500);
    // Final de la historia: el nombre del equipo (con HTML) aparece como texto, sin ejecutarse
    assert.equal(await ev('document.querySelector("#pantalla").className'), 'p-historia');
    assert.ok((await ev('document.querySelector("#hist-txt").textContent')).includes('Alfa <img src=x'), 'el nombre se muestra literal');
    assert.equal(await ev('(window.__xss||0) + document.querySelectorAll("#pantalla img").length'), 0);
    await clic('#hist-saltar', 400);

    // Resultado final exacto
    s = JSON.parse(await ev('JSON.stringify(EA.partida.equipos.map(function(e){return {p:e.puntaje,esc:e.escapo,ord:e.ordenEscape,st:e.stats,t:e.turnos}}))'));
    assert.deepEqual(s[0], { p: TOTAL_CANDADOS * 100 + 5 * 50 + 200, esc: true, ord: 1, st: { primer: TOTAL_CANDADOS, pista: 0, explicacion: 0 }, t: TOTAL_CANDADOS });
    assert.deepEqual(s[1], { p: TOTAL_CANDADOS * 50 + 5 * 50, esc: true, ord: 2, st: { primer: 0, pista: TOTAL_CANDADOS, explicacion: 0 }, t: TOTAL_CANDADOS * 2 });
    assert.deepEqual(s[2], { p: 5 * 50, esc: true, ord: 3, st: { primer: 0, pista: 0, explicacion: TOTAL_CANDADOS }, t: TOTAL_CANDADOS * 2 });
    assert.deepEqual(cuenta, { fallo: TOTAL_CANDADOS * 2, explicacion: TOTAL_CANDADOS, pista: TOTAL_CANDADOS, primer: TOTAL_CANDADOS });
    assert.equal(turnos, TOTAL_CANDADOS * 5);

    // Resumen
    assert.equal(await ev('document.querySelector("#pantalla").className'), 'p-resumen');
    const filas = JSON.parse(await ev('JSON.stringify(Array.from(document.querySelectorAll(".tabla tbody tr")).map(function(tr){return Array.from(tr.children).map(function(td){return td.textContent.trim()})}))'));
    assert.equal(filas.length, 3);
    assert.deepEqual(filas.map((f) => f[0]), ['1.º', '2.º', '3.º']);
    assert.deepEqual(filas.map((f) => f[2]), ['2250', '1150', '250']);
    assert.deepEqual(filas.map((f) => [f[3], f[4], f[5]]), [['18', '0', '0'], ['0', '18', '0'], ['0', '0', '18']]);
    assert.ok(filas.every((f) => /^Sí/.test(f[7])));
    assert.match(await ev('document.querySelector(".pagina-cab").textContent'), /Todos escaparon/);
    assert.equal(await ev('document.querySelectorAll(".podio-col").length'), 3);
    const repaso = JSON.parse(await ev('JSON.stringify(Array.from(document.querySelectorAll(".repaso-item .n")).map(function(e){return parseInt(e.textContent)}))'));
    assert.equal(repaso.length, 5, 'máximo 5 preguntas para repasar');
    assert.deepEqual(repaso, repaso.slice().sort((a, b) => b - a), 'ordenadas de más a menos falladas');
    assert.equal(await ev('(window.__xss||0) + document.querySelectorAll("#pantalla img[onerror]").length'), 0, 'resumen sin HTML inyectado');
    const csv = await ev('EA.juego.resultadosCSV(EA.juego.resumen(EA.partida))');
    assert.match(csv, /"2250","18","0","0"/); assert.match(csv, /"3","beta 2","250"/); assert.match(csv, /"Para repasar"/);
    await foto(pag, '02-resumen');

    assert.deepEqual(pag.errores, [], 'sin errores de JavaScript');
    assert.deepEqual(pag.consola.filter((l) => !/ERR_FILE_NOT_FOUND|net::ERR/.test(l)), [], 'sin errores en la consola');
    console.log('E2E COMPLETO OK: ' + turnos + ' turnos, 5 salas, 3 equipos.');
  } catch (err) {
    await foto(pag, 'ERROR').catch(() => {});
    console.error('E2E COMPLETO FALLÓ (turno ' + turnos + '):', err.message);
    if (pag.errores.length) console.error('Errores de la página:\n' + pag.errores.join('\n'));
    process.exitCode = 1;
  } finally {
    await pag.cerrar();
  }
})();
