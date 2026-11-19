/*
 * Pantalla de historia: muestra los paneles de la introducción o del final (ver js/core/historia.js).
 * params: { paneles, siguiente: 'juego' | 'resumen', juego (params del juego), estado, params (del resumen) }
 */
(function (EA) {
  'use strict';
  var A = EA.arte;
  EA.pantallas = EA.pantallas || {};

  // Sonido que acompaña a cada ilustración
  var SONIDO = { 'hist.apagon': 'apagon', 'hist.volti': 'robot', 'hist.salida': 'puerta', 'hist.sinEnergia': 'error', 'hist.nota': 'acierto' };

  EA.pantallas.historia = {
    montar: function (el, p) {
      var paneles = p.paneles || [];
      var esFinal = p.siguiente === 'resumen';
      var i = 0;
      var terminado = false;

      el.innerHTML = '<div class="historia" role="region" aria-label="' + (esFinal ? 'Final de la historia' : 'Historia') + '">'
        + '<div class="hist-marco" id="hist-arte"></div>'
        + '<div class="hist-texto" aria-live="polite"><h2 id="hist-titulo"></h2><p id="hist-txt"></p></div>'
        + '<div class="hist-pie">'
        + '<button type="button" class="btn sec" id="hist-saltar">' + A.icono('saltar', 28) + (esFinal ? 'Ver resultados' : 'Saltar historia') + ' <kbd>Esc</kbd></button>'
        + '<div class="hist-puntos" aria-hidden="true">' + paneles.map(function () { return '<span></span>'; }).join('') + '</div>'
        + '<span class="fila"><button type="button" class="btn sec" id="hist-atras">' + A.icono('flechaIzq', 28) + 'Atrás</button>'
        + '<button type="button" class="btn" id="hist-sig" data-foco></button></span>'
        + '</div></div>';

      var $ = function (s) { return el.querySelector(s); };

      function mostrar(n) {
        i = Math.max(0, Math.min(paneles.length - 1, n));
        var panel = paneles[i];
        $('#hist-arte').innerHTML = '<svg class="hist-panel" viewBox="0 0 1600 640" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + EA.util.escapar(panel.titulo) + '">'
          + A.usar(panel.arte, 0, 0, 1, panel.opciones || {}) + '</svg>';
        $('#hist-titulo').textContent = panel.titulo;
        $('#hist-txt').textContent = panel.texto;
        var ultimo = i === paneles.length - 1;
        $('#hist-sig').innerHTML = (ultimo ? (esFinal ? 'Ver resultados' : '¡A jugar!') : 'Siguiente') + A.icono(ultimo && !esFinal ? 'play' : 'flecha', 28) + ' <kbd>Enter</kbd>';
        $('#hist-atras').disabled = i === 0;
        $('#hist-saltar').hidden = ultimo;
        el.querySelectorAll('.hist-puntos span').forEach(function (s, k) { s.className = k === i ? 'on' : (k < i ? 'visto' : ''); });
        if (SONIDO[panel.arte]) EA.audio.fx(SONIDO[panel.arte]);
      }

      function terminar() {
        if (terminado) return;
        terminado = true;
        if (esFinal) EA.ui.ir('resumen', { estado: p.estado, params: p.params });
        else EA.ui.ir('juego', p.juego);
      }
      function siguiente() { if (i >= paneles.length - 1) terminar(); else mostrar(i + 1); }
      function anterior() { if (i > 0) mostrar(i - 1); }

      el.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b || b.disabled) return;
        if (b.id === 'hist-sig') siguiente();
        else if (b.id === 'hist-atras') anterior();
        else if (b.id === 'hist-saltar') terminar();
      });

      if (!paneles.length) { window.setTimeout(terminar, 0); return {}; }
      mostrar(0);
      return {
        tecla: function (e) {
          if (e.key === 'Escape') { e.preventDefault(); terminar(); }
          else if (e.key === 'ArrowRight' || (e.key === 'Enter' && e.target.tagName !== 'BUTTON') || (e.key === ' ' && e.target.tagName !== 'BUTTON')) { e.preventDefault(); siguiente(); }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); anterior(); }
        }
      };
    }
  };
})(window.EA = window.EA || {});
