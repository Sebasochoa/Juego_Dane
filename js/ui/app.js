/* Aplicación: escalado del lienzo 16:9, navegación entre pantallas, diálogos, atajos globales. */
(function (EA) {
  'use strict';
  var A = EA.arte, esc = EA.util.escapar;
  var escenario, cont, capaModal, vivo;
  var actual = null;          // { nombre, tecla, salir }
  var pilaDialogos = [];
  var escala = 1;

  EA.pantallas = EA.pantallas || {};

  function ajustar() {
    escala = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    escenario.style.transform = 'translate(' + (-960 * escala) + 'px,' + (-540 * escala) + 'px) scale(' + escala + ')';
  }

  function ir(nombre, params) {
    while (pilaDialogos.length) pilaDialogos.pop().el.remove();
    if (actual && actual.salir) { try { actual.salir(); } catch (e) { /* seguir */ } }
    // Contenedor NUEVO por pantalla: así los manejadores de eventos que registró la
    // pantalla anterior desaparecen con ella y no se acumulan entre visitas.
    var nuevo = document.createElement('div');
    nuevo.id = 'pantalla';
    cont.replaceWith(nuevo);
    cont = nuevo;
    cont.className = 'p-' + nombre;
    var p = EA.pantallas[nombre];
    var ctl = p.montar(cont, params || {}) || {};
    actual = { nombre: nombre, tecla: ctl.tecla, salir: ctl.salir };
    if (!cont.contains(document.activeElement)) {
      var foco = cont.querySelector('[data-foco]') || cont.querySelector('button, input, select');
      if (foco) foco.focus({ preventScroll: true });
    }
  }

  function anunciar(texto) {
    vivo.textContent = '';
    window.setTimeout(function () { vivo.textContent = texto; }, 30);
  }

  /**
   * Diálogo modal. opciones: { titulo, html, ancho, cerrable, botones: [{ texto, clase, tecla, cerrar (def. true), accion }] }
   */
  function dialogo(o) {
    var previo = document.activeElement;
    var velo = document.createElement('div');
    velo.className = 'velo';
    var botones = (o.botones || [{ texto: 'Entendido', tecla: 'Enter' }]);
    velo.innerHTML = '<div class="dialogo' + (o.ancho ? ' ancho' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(o.titulo || '') + '">'
      + (o.titulo ? '<h2>' + esc(o.titulo) + '</h2>' : '') + '<div class="dialogo-cuerpo">' + (o.html || '') + '</div>'
      + '<div class="acciones">' + botones.map(function (b, i) {
        return '<button type="button" class="btn ' + (b.clase || '') + '" data-boton-dialogo="' + i + '">' + esc(b.texto) + (b.tecla ? ' <kbd>' + esc(b.tecla === 'Escape' ? 'Esc' : b.tecla) + '</kbd>' : '') + '</button>';
      }).join('') + '</div></div>';
    var reg = { el: velo, tecla: null, cerrar: cerrar };
    function cerrar() {
      var i = pilaDialogos.indexOf(reg);
      if (i < 0) return;
      pilaDialogos.splice(i, 1);
      velo.remove();
      if (previo && document.contains(previo)) previo.focus({ preventScroll: true });
    }
    function pulsar(i) {
      var b = botones[i];
      EA.audio.fx('clic');
      if (b.cerrar !== false) cerrar();
      if (b.accion) b.accion(reg);
    }
    velo.addEventListener('click', function (e) {
      var btn = e.target.closest('.acciones > button[data-boton-dialogo]');
      if (btn) pulsar(+btn.getAttribute('data-boton-dialogo'));
    });
    reg.tecla = function (e) {
      if (e.key === 'Tab') {
        // Mantener el foco dentro del diálogo
        var f = velo.querySelectorAll('button, input, select, textarea, [tabindex="0"]');
        if (!f.length) return true;
        var primero = f[0], ultimo = f[f.length - 1];
        if (e.shiftKey && document.activeElement === primero) { ultimo.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { primero.focus(); e.preventDefault(); }
        else if (!velo.contains(document.activeElement)) { primero.focus(); e.preventDefault(); }
        return true;
      }
      if (enCampo(e) && e.key !== 'Escape') return true;
      for (var i = 0; i < botones.length; i++) {
        if (botones[i].tecla && botones[i].tecla === e.key) {
          if (e.key === 'Enter' && document.activeElement && document.activeElement.tagName === 'BUTTON' && velo.contains(document.activeElement)) return true; // deja actuar al botón enfocado
          e.preventDefault(); pulsar(i); return true;
        }
      }
      if (e.key === 'Escape' && o.cerrable !== false) { e.preventDefault(); cerrar(); if (o.alCancelar) o.alCancelar(); }
      return true; // un diálogo abierto absorbe los atajos
    };
    capaModal.appendChild(velo);
    pilaDialogos.push(reg);
    if (o.alMontar) o.alMontar(velo, reg);
    var foco = velo.querySelector('[data-foco]') || velo.querySelector('.acciones .btn:not(.sec)') || velo.querySelector('button');
    if (foco) foco.focus({ preventScroll: true });
    return reg;
  }

  /** Capa modal con contenido propio (p. ej. vista previa). Se cierra con Esc o con el botón indicado. */
  function dialogoLibre(velo, selectorCerrar) {
    var previo = document.activeElement;
    var reg = { el: velo, cerrar: cerrar, tecla: function (e) { if (e.key === 'Escape') { e.preventDefault(); cerrar(); } else if (e.key === 'Tab') { e.preventDefault(); velo.querySelector(selectorCerrar).focus(); } return true; } };
    function cerrar() {
      var i = pilaDialogos.indexOf(reg);
      if (i < 0) return;
      pilaDialogos.splice(i, 1);
      velo.remove();
      if (previo && document.contains(previo)) previo.focus({ preventScroll: true });
    }
    capaModal.appendChild(velo);
    pilaDialogos.push(reg);
    var b = velo.querySelector(selectorCerrar);
    b.addEventListener('click', cerrar);
    b.focus({ preventScroll: true });
    return reg;
  }

  function enCampo(e) {
    var t = e.target;
    return !!t && (t.tagName === 'INPUT' && t.type !== 'checkbox' && t.type !== 'radio' && t.type !== 'range' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
  }

  // ---- Sonido y pantalla completa (siempre visibles) ----
  function pintarUtilidades() {
    var u = document.getElementById('utilidades');
    var st = EA.audio.estado();
    var pc = !!(document.fullscreenElement || document.webkitFullscreenElement);
    u.innerHTML =
      '<button type="button" class="btn-icono" id="u-silencio" aria-pressed="' + st.silencio + '" aria-label="' + (st.silencio ? 'Activar sonido (M)' : 'Silenciar (M)') + '" title="' + (st.silencio ? 'Activar sonido (M)' : 'Silenciar (M)') + '">' + A.icono(st.silencio ? 'silencio' : 'sonido', 34) + '</button>'
      + '<input type="range" id="u-volumen" min="0" max="100" step="5" value="' + Math.round(st.volumen * 100) + '" aria-label="Volumen" title="Volumen">'
      + '<button type="button" class="btn-icono" id="u-pantalla" aria-label="' + (pc ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)') + '" title="' + (pc ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)') + '">' + A.icono(pc ? 'salirPantalla' : 'pantalla', 34) + '</button>';
  }
  function alternarSilencio() {
    var s = !EA.audio.estado().silencio;
    EA.audio.setSilencio(s);
    EA.almacen.guardarPrefs({ silencio: s });
    pintarUtilidades();
    anunciar(s ? 'Sonido silenciado' : 'Sonido activado');
  }
  function pantallaCompleta() {
    var el = document.documentElement;
    var activo = document.fullscreenElement || document.webkitFullscreenElement;
    try {
      if (activo) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
    } catch (e) { /* no disponible */ }
  }

  function tecla(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (pilaDialogos.length) { pilaDialogos[pilaDialogos.length - 1].tecla(e); return; }
    if (enCampo(e)) {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    var k = e.key.toLowerCase();
    if (k === 'm') { alternarSilencio(); e.preventDefault(); return; }
    if (k === 'f') { pantallaCompleta(); e.preventDefault(); return; }
    // Activar interactivos SVG con Enter o Espacio
    if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.classList && e.target.classList.contains('hot')) {
      e.preventDefault();
      e.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return;
    }
    if (actual && actual.tecla) actual.tecla(e);
  }

  function arrancar() {
    escenario = document.getElementById('escenario');
    cont = document.getElementById('pantalla');
    capaModal = document.getElementById('capa-modal');
    vivo = document.getElementById('vivo');
    EA.almacen.presets(); // agrega los ejemplos nuevos (y deja elegido el predeterminado) antes de leer las preferencias
    var prefs = EA.almacen.prefs();
    EA.audio.setVolumen(prefs.volumen);
    EA.audio.setSilencio(prefs.silencio);

    ajustar();
    window.addEventListener('resize', ajustar);
    document.addEventListener('fullscreenchange', function () { pintarUtilidades(); ajustar(); });
    document.addEventListener('webkitfullscreenchange', function () { pintarUtilidades(); ajustar(); });
    document.addEventListener('keydown', tecla);

    // El audio solo puede iniciar tras la primera interacción
    function primerGesto() {
      if (EA.audio.iniciar()) {
        EA.audio.musica(true);
        document.removeEventListener('pointerdown', primerGesto, true);
        document.removeEventListener('keydown', primerGesto, true);
      }
    }
    document.addEventListener('pointerdown', primerGesto, true);
    document.addEventListener('keydown', primerGesto, true);

    var u = document.getElementById('utilidades');
    u.addEventListener('click', function (e) {
      if (e.target.closest('#u-silencio')) alternarSilencio();
      else if (e.target.closest('#u-pantalla')) pantallaCompleta();
    });
    u.addEventListener('input', function (e) {
      if (e.target.id !== 'u-volumen') return;
      var v = (+e.target.value) / 100;
      EA.audio.setVolumen(v);
      EA.almacen.guardarPrefs({ volumen: v });
      if (EA.audio.estado().silencio && v > 0) alternarSilencio();
    });
    u.addEventListener('change', function (e) { if (e.target.id === 'u-volumen') EA.audio.fx('seleccion'); });
    pintarUtilidades();

    // Sonido de clic en botones comunes
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.btn, .btn-icono') && !e.target.closest('.velo')) EA.audio.fx('clic');
    });

    var q = window.location.search;
    if (/[?&]galeria/.test(q)) ir('galeria');
    else if (/[?&]captura=/.test(q)) ir('captura', { q: q });
    else ir('menu');
  }

  EA.ui = {
    ir: ir, dialogo: dialogo, dialogoLibre: dialogoLibre, anunciar: anunciar, enCampo: enCampo, arrancar: arrancar,
    escala: function () { return escala; },
    hayDialogo: function () { return pilaDialogos.length > 0; },
    simbolo: function (eq, tam) {
      return '<span class="simbolo-eq" style="--eq:' + esc(eq.color) + '">' + A.icono(eq.simbolo, tam || 26) + '</span>';
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})(window.EA = window.EA || {});
