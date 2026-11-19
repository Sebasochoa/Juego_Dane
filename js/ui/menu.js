/* Menú principal y pantalla «Cómo jugar». */
(function (EA) {
  'use strict';
  var A = EA.arte, CFG = EA.CONFIG;
  EA.pantallas = EA.pantallas || {};

  EA.pantallas.menu = {
    montar: function (el) {
      el.innerHTML =
        '<div class="menu-fondo" aria-hidden="true">' + A.componer(A.ESCENAS.control ? 'control' : 'quimica', A.vistaDemo(A.ESCENAS.control ? 'control' : 'quimica', 2)) + '</div>'
        + '<div class="menu-robot" aria-hidden="true">' + A.suelto('ui.robot', { expresion: 'contento' }) + '</div>'
        + '<div class="menu">'
        + '<p class="ante">Escape room de ciencias</p>'
        + '<h1>El laboratorio del <span>científico</span></h1>'
        + '<p class="lema">Se colaron en el laboratorio del doctor Ámbar y un apagón los dejó encerrados. Abran todos los candados de cada sala con lo que saben de ciencias para abrir la puerta… y escapen antes de que se acabe el tiempo.</p>'
        + '<nav class="menu-botones" aria-label="Menú principal">'
        + '<button type="button" class="btn" data-ir="configurar" data-foco>' + A.icono('play', 34) + 'Jugar</button>'
        + '<button type="button" class="btn sec" data-ir="editor">' + A.icono('editar', 34) + 'Editor de presets</button>'
        + '<button type="button" class="btn sec" data-ir="ayuda">' + A.icono('ayuda', 34) + 'Cómo jugar</button>'
        + '</nav></div>'
        + '<p class="menu-pie">Funciona sin conexión · No recolecta datos · Atajos: M silencio, F pantalla completa</p>';
      el.querySelectorAll('.menu-fondo .hot').forEach(function (h) { h.removeAttribute('tabindex'); h.removeAttribute('role'); });
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-ir]');
        if (b) EA.ui.ir(b.getAttribute('data-ir'));
      });
    }
  };

  EA.pantallas.ayuda = {
    montar: function (el, params) {
      el.innerHTML = '<div class="pagina">'
        + '<div class="pagina-cab"><h2>Cómo jugar</h2></div>'
        + '<div class="ayuda-cols">'
        + '<div class="panel desliza"><ol>'
        + '<li><b>Dos modos de juego.</b> <i>Por turnos:</i> de 2 a 4 equipos se turnan en la misma pantalla; cada uno tiene su propio laboratorio, avance, inventario y puntaje. <i>Un solo equipo:</i> juega todo el tiempo y, si quieren, con un tiempo límite (la energía de respaldo).</li>'
        + '<li><b>Explorar es gratis.</b> Examinen la sala, recojan objetos y combínenlos (clic en uno y luego en otro, o arrastrando) sin gastar el turno.</li>'
        + '<li><b>Intentar un candado usa el turno.</b> Se abre una pregunta de opción múltiple. Elijan y confirmen.</li>'
        + '<li><b>Si fallan,</b> ven una pista y el turno pasa (en modo un solo equipo, pueden reintentar cuando quieran). Al segundo fallo en el mismo candado se muestra la explicación y el candado se abre sin puntos.</li>'
        + '<li><b>Con todos los candados abiertos,</b> la puerta se abre y pasan a la sala siguiente. La puerta de la última sala es la salida.</li>'
        + '<li><b>Gana el equipo con más puntos.</b> El asistente Volti da pistas del puzzle de objetos con el botón «Ayuda», sin penalización.</li>'
        + '</ol></div>'
        + '<div class="panel desliza"><h3>Puntaje</h3><table class="tabla-pts">'
        + '<tr><td>Acierto al primer intento</td><td>' + CFG.PUNTOS_PRIMER_INTENTO + '</td></tr>'
        + '<tr><td>Acierto después de la pista</td><td>' + CFG.PUNTOS_TRAS_PISTA + '</td></tr>'
        + '<tr><td>Después de la explicación</td><td>' + CFG.PUNTOS_TRAS_EXPLICACION + '</td></tr>'
        + '<tr><td>Sala completada</td><td>+' + CFG.BONO_SALA_COMPLETADA + '</td></tr>'
        + '<tr><td>Primer equipo en escapar (o escapar, si juega uno solo)</td><td>+' + CFG.BONO_ESCAPAR_PRIMERO + '</td></tr>'
        + '<tr><td>Rapidez (con temporizador)</td><td>hasta +' + CFG.BONO_RAPIDEZ_MAX + '</td></tr>'
        + '</table><h3 style="margin-top:22px">Teclado</h3><div class="ayuda-teclas">'
        + '<span><kbd>A</kbd>–<kbd>E</kbd> / <kbd>1</kbd>–<kbd>5</kbd></span><span>Elegir alternativa</span>'
        + '<span><kbd>Enter</kbd></span><span>Confirmar o continuar</span>'
        + '<span><kbd>Esc</kbd></span><span>Cerrar o cancelar</span>'
        + '<span><kbd>H</kbd></span><span>Ayuda del asistente</span>'
        + '<span><kbd>P</kbd> <kbd>M</kbd> <kbd>F</kbd></span><span>Pausa, silencio, pantalla completa</span>'
        + '<span><kbd>Tab</kbd></span><span>Recorrer los objetos de la sala</span>'
        + '</div></div></div>'
        + '<div class="pagina-pie"><button type="button" class="btn sec" id="volver" data-foco>' + A.icono('flechaIzq', 30) + 'Volver <kbd>Esc</kbd></button><span></span></div>'
        + '</div>';
      function volver() { EA.ui.ir(params.desde || 'menu'); }
      el.querySelector('#volver').addEventListener('click', volver);
      return { tecla: function (e) { if (e.key === 'Escape') volver(); } };
    }
  };
})(window.EA = window.EA || {});
