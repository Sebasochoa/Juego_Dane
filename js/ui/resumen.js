/* Resumen final: podio (o ficha del equipo en modo un solo equipo), tabla, preguntas para repasar y CSV. */
(function (EA) {
  'use strict';
  var A = EA.arte, J = EA.juego, U = EA.util, esc = U.escapar, F = U.formatear;
  EA.pantallas = EA.pantallas || {};

  function descargar(nombre, contenido, tipo) {
    var blob = new Blob([contenido], { type: tipo });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }
  EA.descargar = descargar;

  function podio(r) {
    var maximo = Math.max.apply(null, r.equipos.map(function (f) { return f.puntaje; }).concat([1]));
    // Podio: 2.º, 1.º, 3.º (y 4.º al final)
    var orden = [1, 0, 2, 3].filter(function (i) { return i < r.equipos.length; }).map(function (i) { return r.equipos[i]; });
    return '<section class="panel" aria-label="Podio"><div class="podio">' + orden.map(function (f, k) {
      var alto = 90 + Math.round(330 * (f.puntaje / maximo));
      return '<div class="podio-col" style="--eq:' + esc(f.color) + '">' + EA.ui.simbolo(f, 38) + '<span class="nom">' + esc(f.nombre) + '</span><span class="pts">' + f.puntaje + '</span>'
        + '<div class="podio-base" style="height:' + alto + 'px;animation-delay:' + (k * 0.15) + 's"><span aria-label="Puesto ' + f.puesto + '">' + f.puesto + '.º</span></div></div>';
    }).join('') + '</div></section>';
  }

  function ficha(r) {
    var f = r.equipos[0];
    return '<section class="panel" aria-label="Resultado del equipo"><div class="ficha-solo">'
      + '<span class="sello ' + (f.escapo ? 'bien' : 'mal') + '">' + A.icono(f.escapo ? 'salida' : (r.motivoFin === 'tiempo' ? 'bateria' : 'bandera'), 64) + '</span>'
      + '<span class="fila" style="gap:12px">' + EA.ui.simbolo(f, 30) + '<span class="nom">' + esc(f.nombre) + '</span></span>'
      + '<span class="pts">' + f.puntaje + '<small>puntos</small></span>'
      + '<ul>'
      + '<li><span>Tiempo de juego</span><b>' + U.formatoTiempo(f.tiempo) + '</b></li>'
      + '<li><span>Salas completadas</span><b>' + f.salasCompletadas + ' de ' + f.totalSalas + '</b></li>'
      + '<li><span>Candados abiertos</span><b>' + f.candadosAbiertos + ' de ' + f.candadosTotales + '</b></li>'
      + '</ul></div></section>';
  }

  EA.pantallas.resumen = {
    montar: function (el, p) {
      var r = J.resumen(p.estado);
      var solo = r.modo === 'solo';
      var ganadores = r.equipos.filter(function (f) { return f.puesto === 1; });
      var titulo, chipFin;
      if (solo) {
        var eq = r.equipos[0];
        titulo = eq.escapo ? '¡' + eq.nombre + ' escapó del laboratorio!' : r.motivoFin === 'tiempo' ? 'Se acabó la energía de respaldo' : 'Partida terminada';
        chipFin = eq.escapo ? A.icono('salida', 22) + 'Escaparon' : r.motivoFin === 'tiempo' ? A.icono('bateria', 22) + 'Sin energía' : 'Terminada por el docente';
      } else {
        titulo = ganadores.length > 1 ? '¡Empate en el primer lugar!' : '¡Ganó ' + ganadores[0].nombre + '!';
        chipFin = r.motivoFin === 'docente' ? 'Partida terminada por el docente' : A.icono('salida', 22) + 'Todos escaparon';
      }

      el.innerHTML = '<div class="pagina">'
        + '<div class="pagina-cab"><h2>' + esc(titulo) + '</h2><span class="chip recorta" title="' + esc(r.preset) + '">' + esc(r.preset) + '</span>'
        + '<span class="chip">' + chipFin + '</span></div>'
        + '<div class="resumen">'
        + (solo ? ficha(r) : podio(r))
        + '<div class="desliza" style="display:flex;flex-direction:column;gap:22px;padding-right:6px">'
        + '<section class="panel" aria-label="Resultados por equipo"><table class="tabla"><thead><tr>'
        + (solo ? '' : '<th scope="col">Puesto</th>') + '<th scope="col" class="eq">Equipo</th><th scope="col">Puntaje</th><th scope="col">Al primer<br>intento</th><th scope="col">Con<br>pista</th><th scope="col">Con<br>explicación</th><th scope="col">Tiempo</th><th scope="col">¿Escapó?</th>'
        + '</tr></thead><tbody>' + r.equipos.map(function (f) {
          var escape = f.escapo
            ? '<span class="fila" style="justify-content:center;gap:6px;color:var(--verde-l)">' + A.icono('check', 24) + (solo ? 'Sí' : 'Sí, ' + f.ordenEscape + '.º') + '</span>'
            : 'No (sala ' + Math.min(f.salasCompletadas + 1, f.totalSalas) + ' de ' + f.totalSalas + ')';
          return '<tr>' + (solo ? '' : '<td>' + f.puesto + '.º</td>') + '<td class="eq"><span class="fila" style="--eq:' + esc(f.color) + '">' + EA.ui.simbolo(f, 22) + esc(f.nombre) + '</span></td>'
            + '<td class="total">' + f.puntaje + '</td><td>' + f.primer + '</td><td>' + f.pista + '</td><td>' + f.explicacion + '</td><td>' + U.formatoTiempo(f.tiempo) + '</td>'
            + '<td>' + escape + '</td></tr>';
        }).join('') + '</tbody></table></section>'
        + '<section class="panel" aria-labelledby="t-repaso"><h3 id="t-repaso">Para repasar</h3>'
        + (r.repasar.length ? '<div class="repaso">' + r.repasar.map(function (q) {
          return '<div class="repaso-item"><span class="chip n">' + A.icono('cruz', 18) + q.fallos + (q.fallos === 1 ? ' fallo' : ' fallos') + '</span><p class="q">' + F(q.enunciado) + '</p><p class="r">' + A.icono('check', 20) + ' ' + F(q.correcta) + '</p>' + (q.explicacion ? '<p>' + F(q.explicacion) + '</p>' : '') + '</div>';
        }).join('') + '</div>' : '<p class="tenue">' + (solo ? 'No fallaron ninguna pregunta. ¡Excelente trabajo!' : 'Nadie falló ninguna pregunta. ¡Excelente trabajo del grupo!') + '</p>')
        + '</section></div></div>'
        + '<div class="pagina-pie"><button type="button" class="btn sec" id="r-menu">' + A.icono('casa', 30) + 'Volver al menú</button>'
        + '<span class="fila"><button type="button" class="btn sec" id="r-csv">' + A.icono('descargar', 30) + 'Descargar resultados (CSV)</button>'
        + '<button type="button" class="btn" id="r-otra" data-foco>' + A.icono('play', 30) + 'Jugar de nuevo</button></span></div>'
        + '</div>';

      EA.audio.fx(r.motivoFin === 'tiempo' ? 'turno' : 'victoria');
      el.querySelector('#r-menu').addEventListener('click', function () { EA.ui.ir('menu'); });
      el.querySelector('#r-otra').addEventListener('click', function () {
        // Jugar de nuevo va directo a la partida: la introducción ya se vio.
        var np = { preset: p.params.preset, equipos: p.params.equipos, opciones: p.params.opciones, historia: p.params.historia };
        EA.ui.ir('juego', np);
      });
      el.querySelector('#r-csv').addEventListener('click', function () {
        var d = new Date();
        var fecha = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
        descargar('resultados-laboratorio-' + fecha + '.csv', J.resultadosCSV(r), 'text/csv;charset=utf-8');
      });
      EA.ui.anunciar(titulo);
    }
  };
})(window.EA = window.EA || {});
