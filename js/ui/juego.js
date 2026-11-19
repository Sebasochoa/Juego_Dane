/* Pantalla de juego: escena, marcador, inventario, asistente, preguntas y turnos. */
(function (EA) {
  'use strict';
  var A = EA.arte, J = EA.juego, CFG = EA.CONFIG, U = EA.util, esc = U.escapar, F = U.formatear;
  var LETRAS = 'ABCDE';
  EA.pantallas = EA.pantallas || {};

  EA.pantallas.juego = {
    montar: function (el, params) {
      var st = J.crearPartida(params.preset, params.equipos, params.opciones, params.semilla);
      EA.partida = st; // accesible para depurar y para la prueba de punta a punta
      var solo = J.esSolo(st);
      var ui = {
        salaIdx: 0, seleccion: null, pausado: false, restante: 0, usado: 0, ultimo: 0,
        elegida: null, pregunta: null, enResultado: null, bloqueo: false, dlg: null,
        vistas: {}, timerGlobo: 0, timerPaso: 0, suprimirClic: false, ultimoTic: -1, vivo: true,
        restanteTotal: st.opciones.limite, avisoMinuto: false, salaMostrada: -1, terminando: false
      };

      el.innerHTML = '<div class="juego">'
        + '<div id="escena"></div>'
        + '<header class="hud">'
        + '<ol class="hud-equipos" id="hud-equipos" aria-label="Marcador"></ol>'
        + '<div class="hud-sala" id="hud-sala"></div>'
        + '<div class="hud-tiempo" id="hud-tiempo" role="timer"></div>'
        + '<button type="button" class="btn-icono" id="b-pausa" aria-label="Pausa (P)" title="Pausa (P)">' + A.icono('pausa', 30) + '</button>'
        + '<button type="button" class="btn-icono" id="b-fin" aria-label="Terminar partida" title="Terminar partida">' + A.icono('bandera', 30) + '</button>'
        + '</header>'
        + '<div class="inventario" id="inventario" role="group" aria-label="Inventario del equipo"></div>'
        + '<div class="asistente"><div class="lado"><div class="globo" id="globo" role="status" hidden></div>'
        + '<button type="button" class="btn chico" id="b-ayuda">' + A.icono('ayuda', 28) + 'Ayuda <kbd>H</kbd></button></div>'
        + '<div class="robot" id="robot" aria-hidden="true"></div></div>'
        + '<div class="capa" id="capa" hidden></div>'
        + '<div class="capa pausa" id="pausa" hidden><h2>Juego en pausa</h2><p class="tenue">El tiempo está detenido.</p>'
        + '<button type="button" class="btn" id="b-reanudar">' + A.icono('play', 30) + 'Reanudar <kbd>P</kbd></button></div>'
        + '</div>';

      var $ = function (s) { return el.querySelector(s); };
      var escenaEl = $('#escena'), capa = $('#capa'), globo = $('#globo'), inv = $('#inventario');

      // ------------------------------------------------------------ helpers de estado
      function eq() { return J.equipoActual(st); }
      function sala() { return eq().salas[ui.salaIdx]; }
      function escenaLog() { return EA.ESCENAS[st.preset.salas[ui.salaIdx].escena]; }
      function explorando() { return st.fase === 'explorar' && !ui.pausado && !ui.bloqueo; }

      function vista(extra) {
        extra = extra || {};
        var s = sala(), e = eq();
        return {
          candados: s.candados, recogidos: s.recogidos, usado: s.usado,
          rotulo: ui.salaIdx === e.salas.length - 1 ? 'SALIDA' : 'SALA ' + (ui.salaIdx + 2),
          puertaAbierta: s.completada && !extra.puertaAbriendo,
          puertaAbriendo: !!extra.puertaAbriendo,
          recien: extra.recien == null ? null : extra.recien
        };
      }

      /** Mientras hay una capa encima, la escena y el inventario no reciben foco ni clics. */
      function fondo() {
        var tapado = !capa.hidden || ui.pausado;
        escenaEl.inert = tapado; inv.inert = tapado; $('.asistente').inert = tapado;
        capa.inert = ui.pausado;
      }

      // ------------------------------------------------------------ pintado
      function pintarEscena() {
        escenaEl.innerHTML = A.componer(escenaLog().id, vista());
      }
      function pintarInteractivos(extra) {
        var capaInt = escenaEl.querySelector('.capa-interactivos');
        if (!capaInt) return pintarEscena();
        var foco = document.activeElement && document.activeElement.closest ? document.activeElement.closest('.hot') : null;
        var clave = foco ? [foco.getAttribute('data-accion'), foco.getAttribute('data-id')] : null;
        capaInt.innerHTML = A.interactivos(escenaLog().id, vista(extra));
        if (clave) {
          var n = capaInt.querySelector('.hot[data-accion="' + clave[0] + '"][data-id="' + clave[1] + '"]');
          if (n) n.focus({ preventScroll: true });
        }
        escenaEl.firstChild.classList.toggle('usando', !!ui.seleccion);
      }

      function pintarHud() {
        var e = eq();
        $('#hud-equipos').innerHTML = st.equipos.map(function (t, i) {
          var activo = i === st.turno && st.fase !== 'fin';
          var estado = t.escapo ? (solo ? 'Escapó' : 'Escapó (' + t.ordenEscape + '.º)')
            : activo && !solo ? 'En turno' : 'Sala ' + (t.salaIdx + 1) + '/' + t.salas.length;
          return '<li class="hud-eq' + (activo ? ' activo' : '') + (t.escapo ? ' escapo' : '') + '" style="--eq:' + esc(t.color) + '"' + (activo ? ' aria-current="true"' : '') + '>'
            + EA.ui.simbolo(t, 26) + '<span class="nom"><small>' + estado + '</small>' + esc(t.nombre) + '</span><span class="pts" aria-label="' + t.puntaje + ' puntos">' + t.puntaje + '</span></li>';
        }).join('');
        var total = e.salas.length;
        $('#hud-sala').innerHTML = '<small>Sala ' + (ui.salaIdx + 1) + ' de ' + total + '</small><strong>' + esc(escenaLog().nombre) + '</strong>';
        pintarTiempo();
      }

      function pintarTiempo() {
        var t = $('#hud-tiempo');
        var lim = st.opciones.temporizador;
        if (st.opciones.limite) {
          // Modo un solo equipo con tiempo límite: la energía de respaldo se agota.
          var rt = Math.max(0, ui.restanteTotal);
          t.className = 'hud-tiempo energia' + (rt <= 60 ? ' urgente' : '');
          t.setAttribute('aria-label', 'Energía de respaldo: tiempo que queda para escapar');
          t.title = 'Energía de respaldo';
          t.innerHTML = A.icono('bateria', 30) + '<span>' + U.formatoTiempo(Math.ceil(rt)) + '</span><span class="barra" style="transform:scaleX(' + (rt / st.opciones.limite).toFixed(3) + ')"></span>';
        } else if (lim) {
          var r = Math.max(0, ui.restante);
          t.className = 'hud-tiempo' + (r <= 10 ? ' urgente' : '');
          t.setAttribute('aria-label', 'Tiempo restante del turno');
          t.innerHTML = A.icono('reloj', 30) + '<span>' + U.formatoTiempo(Math.ceil(r)) + '</span><span class="barra" style="transform:scaleX(' + (r / lim).toFixed(3) + ')"></span>';
        } else {
          t.className = 'hud-tiempo libre';
          t.setAttribute('aria-label', solo ? 'Tiempo de juego' : 'Tiempo usado en el turno');
          t.innerHTML = A.icono('reloj', 30) + '<span>' + U.formatoTiempo(solo ? eq().tiempo + ui.usado : ui.usado) + '</span>';
        }
      }

      function pintarInventario(nuevo) {
        var s = sala();
        var casillas = '';
        var n = Math.max(3, s.inventario.length);
        for (var i = 0; i < n; i++) {
          var id = s.inventario[i];
          if (id) {
            var info = J.infoObjeto(st, id) || { nombre: id };
            casillas += '<button type="button" class="casilla' + (id === nuevo ? ' nuevo' : '') + '" data-inv="' + esc(id) + '" aria-pressed="' + (ui.seleccion === id) + '" aria-label="' + esc(info.nombre) + '" title="' + esc(info.nombre) + '">' + A.suelto('obj.' + id) + '</button>';
          } else casillas += '<span class="casilla" aria-hidden="true"></span>';
        }
        inv.innerHTML = '<span class="rotulo">' + A.icono('mochila', 34) + 'Inventario</span>' + casillas;
        if (escenaEl.firstChild) escenaEl.firstChild.classList.toggle('usando', !!ui.seleccion);
      }

      function robot(expresion) { $('#robot').innerHTML = A.suelto('ui.robot', { expresion: expresion || 'neutral' }); }

      function decir(html, expresion, plano) {
        window.clearTimeout(ui.timerGlobo);
        globo.hidden = false;
        globo.innerHTML = html;
        // reinicia la animación de entrada
        globo.style.animation = 'none'; void globo.offsetWidth; globo.style.animation = '';
        robot(expresion || 'neutral');
        if (plano !== false) EA.ui.anunciar(globo.textContent);
        ui.timerGlobo = window.setTimeout(callar, 16000);
      }
      function callar() { window.clearTimeout(ui.timerGlobo); globo.hidden = true; robot('neutral'); }

      // ------------------------------------------------------------ turnos
      function mostrarCambio() {
        var e = eq();
        // Un solo equipo: entre intentos de la misma sala se sigue jugando sin pantalla intermedia.
        if (solo && ui.salaMostrada === e.salaIdx) {
          ui.seleccion = null; ui.bloqueo = false; ui.usado = 0;
          pintarInventario();
          J.iniciarTurno(st);
          ui.ultimo = performance.now();
          pintarHud();
          return;
        }
        ui.salaMostrada = e.salaIdx;
        ui.salaIdx = e.salaIdx;
        ui.seleccion = null;
        ui.bloqueo = false;
        ui.usado = 0;
        ui.restante = st.opciones.temporizador;
        callar();
        pintarEscena(); pintarHud(); pintarInventario();
        var s = sala();
        var abiertos = s.candados.filter(function (c) { return c.estado === 'abierto'; }).length;
        var clave = e.id + ':' + ui.salaIdx;
        var primera = !ui.vistas[clave];
        capa.hidden = false; fondo();
        var cuerpo;
        if (solo) {
          var log = escenaLog();
          cuerpo = '<p class="ante">Sala ' + (ui.salaIdx + 1) + ' de ' + e.salas.length + '</p>'
            + '<p class="nombre">' + A.iconoSala(log.id, 110) + '<span>' + esc(log.nombre) + '</span></p>'
            + '<p class="info">' + s.candados.length + ' candados · ' + e.puntaje + ' puntos'
            + (st.opciones.limite ? ' · Energía: ' + U.formatoTiempo(Math.ceil(ui.restanteTotal)) : '') + '</p>';
        } else {
          cuerpo = '<p class="ante">Turno de</p>'
            + '<p class="nombre" style="--eq:' + esc(e.color) + '">' + EA.ui.simbolo(e, 66) + '<span>' + esc(e.nombre) + '</span></p>'
            + '<p class="info">Sala ' + (ui.salaIdx + 1) + ' de ' + e.salas.length + ' · ' + esc(escenaLog().nombre) + ' · ' + abiertos + ' de ' + s.candados.length + ' candados abiertos · ' + e.puntaje + ' puntos</p>';
        }
        capa.innerHTML = '<div class="cambio" role="dialog" aria-modal="true" aria-label="' + (solo ? 'Nueva sala' : 'Cambio de turno') + '">'
          + cuerpo
          + (primera ? '<p class="intro">' + esc(escenaLog().intro) + '</p>' : '')
          + '<button type="button" class="btn" id="b-turno">' + (solo ? 'Entrar a la sala' : 'Comenzar turno') + ' <kbd>Enter</kbd></button></div>';
        $('#b-turno').focus({ preventScroll: true });
        EA.audio.fx('turno');
        EA.ui.anunciar(solo ? 'Sala ' + (ui.salaIdx + 1) + ': ' + escenaLog().nombre : 'Turno de ' + e.nombre);
      }

      function comenzarTurno() {
        if (st.fase !== 'cambio') return;
        var e = eq();
        J.iniciarTurno(st);
        capa.hidden = true; capa.innerHTML = ''; fondo();
        ui.ultimo = performance.now();
        var clave = e.id + ':' + ui.salaIdx;
        if (!ui.vistas[clave]) {
          ui.vistas[clave] = true;
          decir('<b>' + esc(escenaLog().nombre) + '.</b> ' + (solo
            ? 'Exploren con calma: examinen todo y recojan lo que sirva. Cuando estén listos, elijan un candado.'
            : 'Exploren con calma: examinar y recoger no gasta el turno. Cuando estén listos, elijan un candado.'));
        }
        pintarHud();
        var primero = escenaEl.querySelector('.hot-candado');
        if (primero) primero.focus({ preventScroll: true });
      }

      function finTurno() {
        window.clearTimeout(ui.timerPaso);
        if (!ui.vivo) return;
        var r = J.pasarTurno(st, ui.usado);
        if (!r) return;
        if (r.fin) irFinal();
        else mostrarCambio();
      }

      /** Fin de la partida: la historia del final (si corresponde) y luego los resultados. */
      function irFinal() {
        if (!ui.vivo) return;
        ui.vivo = false;
        var paneles = params.historia === false ? [] : EA.historia.final(J.resumen(st));
        if (paneles.length) EA.ui.ir('historia', { paneles: paneles, siguiente: 'resumen', estado: st, params: params });
        else EA.ui.ir('resumen', { estado: st, params: params });
      }

      /** Modo un solo equipo: la energía de respaldo llegó a cero. */
      function energiaAgotada() {
        if (ui.terminando) return;
        ui.terminando = true;
        if (ui.dlg) { ui.dlg.cerrar(); ui.dlg = null; }
        J.terminar(st, ui.usado, 'tiempo');
        ui.bloqueo = true;
        ui.enResultado = null;
        EA.audio.fx('error');
        callar(); robot('pensando');
        capa.hidden = false; fondo();
        capa.innerHTML = '<div class="tarjeta" tabindex="-1" role="dialog" aria-modal="true" aria-label="Se acabó la energía" style="width:1060px">'
          + '<div class="veredicto mal"><span class="sello">' + A.icono('bateria', 60) + '</span><div><h2>¡Se acabó la energía!</h2>'
          + '<p>La batería de respaldo llegó a cero antes de que pudieran escapar.</p></div></div>'
          + '<div class="tarjeta-pie"><span class="teclas"></span><button type="button" class="btn" id="b-final">Continuar <kbd>Enter</kbd></button></div></div>';
        $('#b-final').focus({ preventScroll: true });
        pintarHud();
        EA.ui.anunciar('Se acabó la energía de respaldo.');
      }

      // ------------------------------------------------------------ temporizador
      function tic() {
        var ahora = performance.now();
        var dt = (ahora - ui.ultimo) / 1000;
        ui.ultimo = ahora;
        if (ui.pausado || ui.bloqueo || (st.fase !== 'explorar' && st.fase !== 'pregunta')) return;
        if (dt > 2) dt = 0.25; // pestaña en segundo plano: no descontar de golpe
        ui.usado += dt;
        if (st.opciones.limite) {
          ui.restanteTotal -= dt;
          var quedan = Math.ceil(ui.restanteTotal);
          if (quedan <= 10 && quedan > 0 && quedan !== ui.ultimoTic) { ui.ultimoTic = quedan; EA.audio.fx('tic'); }
          if (quedan <= 60 && quedan > 0 && !ui.avisoMinuto) {
            ui.avisoMinuto = true;
            if (st.fase === 'explorar') decir('¡Queda <b>menos de un minuto</b> de energía! Apúrense.', 'pensando');
          }
          if (ui.restanteTotal <= 0) { ui.restanteTotal = 0; pintarTiempo(); energiaAgotada(); return; }
        }
        if (st.opciones.temporizador) {
          ui.restante -= dt;
          var seg = Math.ceil(ui.restante);
          if (seg <= 10 && seg > 0 && seg !== ui.ultimoTic) { ui.ultimoTic = seg; EA.audio.fx('tic'); }
          if (ui.restante <= 0) { ui.restante = 0; pintarTiempo(); tiempoAgotado(); return; }
        }
        pintarTiempo();
      }

      function tiempoAgotado() {
        if (ui.dlg) { ui.dlg.cerrar(); ui.dlg = null; }
        if (st.fase === 'pregunta') {
          var res = J.responder(st, null, 0);
          mostrarResultado(res, null);
        } else {
          ui.bloqueo = true;
          EA.audio.fx('error');
          capa.hidden = false; fondo();
          capa.innerHTML = '<div class="tarjeta" role="dialog" aria-modal="true" aria-label="Tiempo agotado" style="width:1000px">'
            + '<div class="veredicto mal"><span class="sello">' + A.icono('reloj', 60) + '</span><div><h2>Se acabó el tiempo</h2><p>No intentaron ningún candado: el turno pasa sin penalización.</p></div></div>'
            + '<div class="tarjeta-pie"><span class="teclas"></span><button type="button" class="btn" id="b-seguir">Continuar <kbd>Enter</kbd></button></div></div>';
          ui.enResultado = { simple: true };
          $('#b-seguir').focus({ preventScroll: true });
        }
      }

      function pausar(v) {
        if (st.fase === 'fin') return;
        ui.pausado = v == null ? !ui.pausado : v;
        $('#pausa').hidden = !ui.pausado; fondo();
        $('#b-pausa').setAttribute('aria-pressed', String(ui.pausado));
        $('#b-pausa').innerHTML = A.icono(ui.pausado ? 'play' : 'pausa', 30);
        ui.ultimo = performance.now();
        if (ui.pausado) $('#b-reanudar').focus({ preventScroll: true });
        EA.ui.anunciar(ui.pausado ? 'Juego en pausa' : 'Juego reanudado');
      }

      // ------------------------------------------------------------ exploración
      function textoNoSirve(r) { return (r && r.mensaje) || 'Eso no sirve aquí.'; }

      function seleccionar(id) {
        ui.seleccion = (ui.seleccion === id) ? null : id;
        pintarInventario();
        if (ui.seleccion) {
          var info = J.infoObjeto(st, id);
          EA.audio.fx('seleccion');
          decir('<b>' + esc(info.nombre) + '.</b> ' + esc(info.desc) + ' Elijan otro objeto para combinarlo o un lugar de la sala para usarlo.');
        }
      }

      function combinar(a, b) {
        var r = J.combinar(st, a, b);
        ui.seleccion = null;
        if (r.ok) {
          EA.audio.fx('combinar');
          pintarInventario(r.resultado.id);
          decir('¡Bien pensado! Obtuvieron: <b>' + esc(r.resultado.nombre) + '</b>. ' + esc(r.resultado.desc), 'contento');
        } else {
          EA.audio.fx('nada');
          pintarInventario();
          decir(esc(r.mensaje || 'Esos dos objetos no se pueden combinar.'), 'pensando');
        }
      }

      function usarEn(objId, hotEl) {
        var accion = hotEl.getAttribute('data-accion'), id = hotEl.getAttribute('data-id');
        var pz = escenaLog().puzzle, r = { ok: false };
        if (accion === 'examinar') r = J.usar(st, objId, id);
        else if (accion === 'candado' && pz && sala().candados[+id].oculto) r = J.usar(st, objId, pz.usarEn);
        else r = { ok: false, mensaje: 'Eso no sirve aquí. Piensen qué necesita este lugar.' };
        ui.seleccion = null;
        if (r.ok) {
          EA.audio.fx('combinar'); EA.audio.fx('candado');
          pintarInventario();
          pintarInteractivos({ recien: r.revela });
          decir(esc(r.mensaje), 'contento');
        } else {
          EA.audio.fx('nada');
          pintarInventario();
          decir(esc(textoNoSirve(r)), 'pensando');
        }
      }

      function clicHot(h) {
        if (!explorando()) return;
        var accion = h.getAttribute('data-accion'), id = h.getAttribute('data-id');
        if (ui.seleccion && (accion === 'examinar' || accion === 'candado' || accion === 'puerta')) { usarEn(ui.seleccion, h); return; }
        var log = escenaLog(), s = sala();
        if (accion === 'objeto') {
          var r = J.recoger(st, id);
          if (r.ok) {
            EA.audio.fx('recoger');
            pintarInteractivos();
            pintarInventario(id);
            decir('Recogieron: <b>' + esc(r.objeto.nombre) + '</b>. ' + esc(r.objeto.desc), 'contento');
            var b = inv.querySelector('[data-inv="' + id + '"]');
            if (b) b.focus({ preventScroll: true });
          }
        } else if (accion === 'examinar') {
          EA.audio.fx('clic');
          var ex = log.examinar[id];
          var hecho = log.puzzle && log.puzzle.usarEn === id && s.usado;
          decir('<b>' + esc(ex.nombre) + '.</b> ' + esc(hecho ? 'Ya funciona gracias a ustedes. Ahora pueden intentar su candado.' : ex.texto));
        } else if (accion === 'puerta') {
          EA.audio.fx('clic');
          var ab = s.candados.filter(function (c) { return c.estado === 'abierto'; }).length;
          decir('La puerta se abrirá cuando los ' + s.candados.length + ' candados estén abiertos. Llevan <b>' + ab + ' de ' + s.candados.length + '</b>.');
        } else if (accion === 'candado') {
          var c = s.candados[+id];
          if (c.oculto) { EA.audio.fx('nada'); decir('Ese candado está <b>sin energía</b>. Hay que resolver algo en la sala para activarlo. Si se traban, pidan <b>Ayuda</b>.', 'pensando'); }
          else if (c.estado === 'abierto') { EA.audio.fx('clic'); decir('Ese candado ya está abierto. ¡Sigan con los demás!'); }
          else confirmarCandado(+id);
        }
      }

      function confirmarCandado(i) {
        var c = sala().candados[i];
        EA.audio.fx('clic');
        ui.dlg = EA.ui.dialogo({
          titulo: 'Candado ' + (i + 1) + ': ' + escenaLog().candados[i],
          html: (solo
            ? '<p>Se abrirá su pregunta. Si fallan, verán una pista y podrán volver a intentarlo.</p>'
            : '<p>Al intentarlo se abre la pregunta y <b>se usa el turno</b> del equipo.</p>')
            + (c.fallos > 0 ? '<p class="aviso">' + A.icono('bombilla', 34) + '<span>Segundo intento: tendrán la pista a la vista. Si fallan otra vez, el candado se abre sin puntos.</span></p>' : ''),
          botones: [
            { texto: 'Seguir explorando', clase: 'sec', tecla: 'Escape', accion: function () { ui.dlg = null; } },
            { texto: 'Intentar', tecla: 'Enter', accion: function () { ui.dlg = null; abrirPregunta(i); } }
          ],
          alCancelar: function () { ui.dlg = null; }
        });
      }

      // ------------------------------------------------------------ pregunta
      function cabeceraTarjeta(q) {
        var e = eq();
        return '<div class="tarjeta-cab"><span class="chip cand">' + A.icono('candado', 24) + 'Candado ' + (q.candado + 1) + ' · ' + esc(q.nombreCandado) + '</span>'
          + (q.rama ? '<span class="chip">' + esc(EA.presets.nombreRama(q.rama)) + '</span>' : '')
          + (q.intento > 1 ? '<span class="chip intento">2.º intento</span>' : '')
          + '<span class="hueco"></span><span class="chip" style="--eq:' + esc(e.color) + '">' + EA.ui.simbolo(e, 20) + esc(e.nombre) + '</span></div>';
      }

      function htmlOpciones(q, estado) {
        var maxLen = q.alternativas.reduce(function (m, a) { return Math.max(m, U.plano(a).length); }, 0);
        var clases = 'opciones' + (maxLen > 60 || q.alternativas.length === 5 || q.alternativas.length === 3 ? ' una' : '') + (maxLen > 42 || q.alternativas.length === 5 ? ' densas' : '');
        return '<div class="' + clases + '" role="radiogroup" aria-labelledby="enunciado">' + q.alternativas.map(function (a, i) {
          var cl = 'opcion', marca = '';
          if (estado) {
            if (estado.revelar && i === estado.correcta) { cl += ' es-correcta'; marca = A.icono('check', 30) + 'Correcta'; }
            else if (i === estado.elegida && !estado.acierto) { cl += ' es-error'; marca = A.icono('cruz', 30) + 'Incorrecta'; }
            else cl += ' apagada';
          }
          return '<button type="button" class="' + cl + '" role="radio" aria-checked="' + (!estado && ui.elegida === i) + '" data-op="' + i + '"' + (estado ? ' disabled' : '') + '>'
            + '<span class="letra" aria-hidden="true">' + LETRAS[i] + '</span><span class="txt"><span class="solo-lector">' + LETRAS[i] + ': </span>' + F(a) + '</span><span class="marca">' + marca + '</span></button>';
        }).join('') + '</div>';
      }

      function htmlEnunciado(q) {
        var img = (q.imagen && EA.presets.imagenValida(q.imagen)) ? '<img class="pregunta-img" src="' + esc(q.imagen) + '" alt="Imagen de la pregunta">' : '';
        var largo = U.plano(q.enunciado).length;
        return '<div class="pregunta-cuerpo"><p class="enunciado' + (largo > 280 ? ' largo muy-largo' : largo > 150 ? ' largo' : '') + '" id="enunciado">' + F(q.enunciado) + '</p>' + img + '</div>';
      }

      function abrirPregunta(i) {
        var q = J.abrirPregunta(st, i);
        if (!q) return;
        ui.pregunta = q; ui.elegida = null; ui.enResultado = null;
        callar(); robot('pensando');
        capa.hidden = false; fondo();
        capa.innerHTML = '<div class="tarjeta" tabindex="-1" role="dialog" aria-modal="true" aria-label="Pregunta del candado ' + (i + 1) + '">'
          + cabeceraTarjeta(q) + '<div class="tarjeta-cuerpo">' + htmlEnunciado(q)
          + (q.pista ? '<div class="caja-pista">' + A.icono('bombilla', 38) + '<div><b>Pista</b>' + F(q.pista) + '</div></div>' : '')
          + htmlOpciones(q, null) + '</div>'
          + '<div class="tarjeta-pie"><span class="teclas">Elijan con <kbd>A</kbd>–<kbd>' + LETRAS[q.alternativas.length - 1] + '</kbd> o <kbd>1</kbd>–<kbd>' + q.alternativas.length + '</kbd> y confirmen con <kbd>Enter</kbd></span>'
          + '<button type="button" class="btn" id="b-confirmar" disabled>Confirmar respuesta <kbd>Enter</kbd></button></div></div>';
        // El foco va a la tarjeta, no a una alternativa: así Enter no elige nada por accidente.
        var p = capa.querySelector('.tarjeta'); if (p) p.focus({ preventScroll: true });
        EA.ui.anunciar('Pregunta: ' + U.plano(q.enunciado));
      }

      function elegir(i) {
        if (st.fase !== 'pregunta' || ui.pausado || !ui.pregunta || i < 0 || i >= ui.pregunta.alternativas.length) return;
        ui.elegida = i;
        capa.querySelectorAll('.opcion').forEach(function (b, k) { b.setAttribute('aria-checked', String(k === i)); });
        var b = capa.querySelector('.opcion[data-op="' + i + '"]');
        if (b) b.focus({ preventScroll: true });
        $('#b-confirmar').disabled = false;
        EA.audio.fx('seleccion');
      }

      function confirmar() {
        if (st.fase !== 'pregunta' || ui.elegida == null || ui.pausado) return;
        var frac = st.opciones.temporizador ? ui.restante / st.opciones.temporizador : 0;
        var res = J.responder(st, ui.elegida, frac);
        mostrarResultado(res, ui.elegida);
      }

      function mostrarResultado(res, elegida) {
        var q = ui.pregunta;
        ui.enResultado = res;
        EA.audio.fx(res.correcto ? 'acierto' : 'error');
        robot(res.correcto ? 'contento' : 'neutral');
        var titulo, sub;
        if (res.correcto) { titulo = '¡Correcto!'; sub = res.tipo === 'primer' ? 'Al primer intento.' : 'Bien aprovechada la pista.'; }
        else if (res.tiempoAgotado) { titulo = 'Se acabó el tiempo'; sub = 'Cuenta como un intento fallido.'; }
        else {
          titulo = 'Respuesta incorrecta';
          sub = res.tipo !== 'fallo' ? 'Segundo fallo: el candado se abre, pero sin puntos.'
            : solo ? 'El candado sigue cerrado: pueden volver a intentarlo cuando quieran.'
            : 'El candado sigue cerrado: podrán reintentarlo en su próximo turno.';
        }
        if (res.tiempoAgotado && res.tipo === 'explicacion') sub = 'Segundo fallo: el candado se abre, pero sin puntos.';
        if (res.tiempoAgotado && res.tipo === 'fallo') sub = 'Cuenta como un intento fallido. Podrán reintentar el candado en su próximo turno.';

        var chips = '';
        if (res.correcto) chips += '<span class="chip">+' + res.puntos + ' ' + (res.tipo === 'primer' ? 'primer intento' : 'con pista') + '</span>';
        if (res.bonoRapidez) chips += '<span class="chip">+' + res.bonoRapidez + ' rapidez</span>';
        if (res.bonoSala) chips += '<span class="chip">+' + res.bonoSala + ' sala completada</span>';
        if (res.bonoEscape) chips += '<span class="chip">+' + res.bonoEscape + (solo ? ' por escapar' : ' primer equipo en escapar') + '</span>';
        if (res.abierto) chips += '<span class="chip total">' + (res.total > 0 ? '+' + res.total : '0') + ' puntos</span>';

        var caja = '';
        if (res.tipo === 'fallo' && res.pista) caja = '<div class="caja-pista">' + A.icono('bombilla', 38) + '<div><b>Pista para el próximo intento</b>' + F(res.pista) + '</div></div>';
        else if (res.abierto && res.explicacion) caja = '<div class="caja-pista exp">' + A.icono('libro', 38) + '<div><b>Explicación</b>' + F(res.explicacion) + '</div></div>';

        capa.hidden = false; fondo();
        capa.innerHTML = '<div class="tarjeta" role="dialog" aria-modal="true" aria-label="Resultado">'
          + cabeceraTarjeta(q) + '<div class="tarjeta-cuerpo">'
          + '<div class="veredicto ' + (res.correcto ? 'bien' : 'mal') + '"><span class="sello">' + A.icono(res.correcto ? 'check' : (res.tiempoAgotado ? 'reloj' : 'cruz'), 60) + '</span><div><h2>' + titulo + '</h2><p>' + sub + '</p></div></div>'
          + '<p class="enunciado largo" id="enunciado" style="margin-top:10px">' + F(q.enunciado) + '</p>'
          + htmlOpciones(q, { elegida: elegida, correcta: res.correctaVista, acierto: res.correcto, revelar: res.abierto })
          + caja
          + (chips ? '<div class="puntos-fila">' + chips + '</div>' : '') + '</div>'
          + '<div class="tarjeta-pie"><span class="teclas">' + (res.escapo ? '¡' + esc(eq().nombre) + ' escapó del laboratorio!' : res.salaCompletada ? '¡Sala completada! La puerta se abre.' : '') + '</span>'
          + '<button type="button" class="btn" id="b-seguir">Continuar <kbd>Enter</kbd></button></div></div>';
        $('#b-seguir').focus({ preventScroll: true });
        pintarHud();
        EA.ui.anunciar(titulo + '. ' + sub);
      }

      function trasResultado() {
        var res = ui.enResultado;
        if (!res) return;
        ui.enResultado = null;
        capa.hidden = true; capa.innerHTML = ''; fondo();
        if (res.simple) { finTurno(); return; }
        ui.bloqueo = true;
        pintarInteractivos({ recien: res.candado, puertaAbriendo: res.salaCompletada });
        var espera = CFG.ESPERA_CANDADO_MS;
        if (res.abierto) {
          EA.audio.fx('candado');
          if (res.salaCompletada) { EA.audio.fx(res.escapo ? 'victoria' : 'puerta'); espera = CFG.ESPERA_PUERTA_MS; }
          decir(res.escapo ? '¡Lo lograron! <b>' + esc(eq().nombre) + '</b> escapó del laboratorio.' : res.salaCompletada ? '¡Sala completada! La puerta se abre…' : 'Candado abierto.', res.correcto || res.salaCompletada ? 'contento' : 'neutral');
        } else {
          decir('El candado sigue cerrado. Recuerden la pista para la próxima.', 'neutral');
        }
        ui.timerPaso = window.setTimeout(finTurno, espera);
      }

      // ------------------------------------------------------------ eventos
      escenaEl.addEventListener('click', function (e) {
        var h = e.target.closest('.hot');
        if (h) clicHot(h);
      });

      capa.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        if (b.id === 'b-turno') comenzarTurno();
        else if (b.id === 'b-confirmar') confirmar();
        else if (b.id === 'b-seguir') trasResultado();
        else if (b.id === 'b-final') irFinal();
        else if (b.hasAttribute('data-op') && !b.disabled) elegir(+b.getAttribute('data-op'));
      });

      el.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        if (b.id === 'b-pausa' || b.id === 'b-reanudar') pausar();
        else if (b.id === 'b-fin') terminarPartida();
        else if (b.id === 'b-ayuda') ayuda();
        else if (b.hasAttribute('data-inv')) {
          if (ui.suprimirClic) { ui.suprimirClic = false; return; }
          if (!explorando()) return;
          var id = b.getAttribute('data-inv');
          if (ui.seleccion && ui.seleccion !== id) combinar(ui.seleccion, id);
          else seleccionar(id);
        }
      });

      function ayuda() {
        if (st.fase !== 'explorar' || ui.pausado) return;
        decir(A.icono('bombilla', 26) + ' ' + esc(J.pistaPuzzle(st)), 'pensando');
      }

      function terminarPartida() {
        var eraPausa = ui.pausado;
        ui.pausado = true; // detiene el reloj mientras se decide
        ui.dlg = EA.ui.dialogo({
          titulo: '¿Terminar la partida?',
          html: '<p>Se mostrará el resumen con los puntajes actuales. ' + (solo ? 'El equipo conserva sus puntos.' : 'Los equipos que no escaparon conservan sus puntos.') + '</p>',
          botones: [
            { texto: 'Seguir jugando', clase: 'sec', tecla: 'Escape', accion: reanudar },
            { texto: 'Terminar y ver resumen', clase: 'peligro', accion: function () { J.terminar(st, ui.usado, 'docente'); irFinal(); } }
          ],
          alCancelar: reanudar
        });
        function reanudar() { ui.dlg = null; ui.pausado = eraPausa; ui.ultimo = performance.now(); }
      }

      // Arrastrar objetos del inventario (mouse y táctil)
      var arr = null;
      inv.addEventListener('pointerdown', function (e) {
        var b = e.target.closest('button[data-inv]');
        if (!b || !explorando() || (e.pointerType === 'mouse' && e.button !== 0)) return;
        arr = { id: b.getAttribute('data-inv'), x: e.clientX, y: e.clientY, el: null, origen: b };
      });
      function moverArrastre(e) {
        if (!arr) return;
        if (!arr.el) {
          if (Math.abs(e.clientX - arr.x) + Math.abs(e.clientY - arr.y) < 14) return;
          arr.el = document.createElement('div');
          arr.el.className = 'fantasma';
          arr.el.innerHTML = A.suelto('obj.' + arr.id);
          document.body.appendChild(arr.el);
          if (escenaEl.firstChild) escenaEl.firstChild.classList.add('usando');
        }
        arr.el.style.left = e.clientX + 'px';
        arr.el.style.top = e.clientY + 'px';
      }
      function soltarArrastre(e) {
        if (!arr) return;
        var a = arr; arr = null;
        if (!a.el) return;
        a.el.remove();
        ui.suprimirClic = true;
        window.setTimeout(function () { ui.suprimirClic = false; }, 60);
        if (escenaEl.firstChild) escenaEl.firstChild.classList.toggle('usando', !!ui.seleccion);
        if (e.type === 'pointercancel' || !explorando()) return;
        var destino = document.elementFromPoint(e.clientX, e.clientY);
        if (!destino) return;
        var otra = destino.closest('button[data-inv]');
        var h = destino.closest('.hot');
        if (otra && otra.getAttribute('data-inv') !== a.id) combinar(a.id, otra.getAttribute('data-inv'));
        else if (h && h.getAttribute('data-accion') !== 'objeto') usarEn(a.id, h);
      }
      document.addEventListener('pointermove', moverArrastre);
      document.addEventListener('pointerup', soltarArrastre);
      document.addEventListener('pointercancel', soltarArrastre);

      var intervalo = window.setInterval(tic, 200);
      ui.ultimo = performance.now();

      robot('neutral');
      mostrarCambio();

      return {
        salir: function () {
          ui.vivo = false;
          window.clearInterval(intervalo);
          window.clearTimeout(ui.timerGlobo); window.clearTimeout(ui.timerPaso);
          document.removeEventListener('pointermove', moverArrastre);
          document.removeEventListener('pointerup', soltarArrastre);
          document.removeEventListener('pointercancel', soltarArrastre);
          if (arr && arr.el) arr.el.remove();
        },
        tecla: function (e) {
          var k = e.key.toLowerCase();
          if (st.fase === 'fin') { if (e.key === 'Enter') { e.preventDefault(); irFinal(); } return; }
          if (k === 'p') { pausar(); e.preventDefault(); return; }
          if (ui.pausado) { if (e.key === 'Escape') pausar(false); return; }
          if (st.fase === 'cambio') { if (e.key === 'Enter') { e.preventDefault(); comenzarTurno(); } return; }
          if (ui.enResultado) { if (e.key === 'Enter') { e.preventDefault(); trasResultado(); } return; }
          if (st.fase === 'pregunta') {
            var q = ui.pregunta, n = q.alternativas.length;
            var i = LETRAS.toLowerCase().indexOf(k);
            if (k.length === 1 && i >= 0 && i < n) { elegir(i); e.preventDefault(); return; }
            if (/^[1-5]$/.test(k) && +k <= n) { elegir(+k - 1); e.preventDefault(); return; }
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { elegir(ui.elegida == null ? 0 : (ui.elegida + 1) % n); e.preventDefault(); return; }
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { elegir(ui.elegida == null ? n - 1 : (ui.elegida + n - 1) % n); e.preventDefault(); return; }
            if (e.key === 'Enter' && ui.elegida != null) { e.preventDefault(); confirmar(); }
            return;
          }
          if (st.fase === 'explorar') {
            if (k === 'h') { ayuda(); e.preventDefault(); }
            else if (e.key === 'Escape') {
              if (ui.seleccion) { ui.seleccion = null; pintarInventario(); }
              else callar();
            }
          }
        }
      };
    }
  };
})(window.EA = window.EA || {});
