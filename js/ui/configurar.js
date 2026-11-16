/* Configuración de partida: preset, equipos, temporizador. */
(function (EA) {
  'use strict';
  var A = EA.arte, CFG = EA.CONFIG, P = EA.presets, esc = EA.util.escapar;
  EA.pantallas = EA.pantallas || {};

  EA.pantallas.configurar = {
    montar: function (el) {
      var prefs = EA.almacen.prefs();
      var todos = EA.almacen.presets();
      var jugables = todos.filter(function (p) { return P.validarPreset(p).ok; });
      var st = {
        grado: prefs.grado,
        preset: prefs.preset,
        n: Math.max(CFG.EQUIPOS_MIN, Math.min(CFG.EQUIPOS_MAX, prefs.numEquipos)),
        equipos: [],
        temporizador: prefs.temporizador,
        segundos: prefs.segundos
      };
      for (var i = 0; i < CFG.EQUIPOS_MAX; i++) {
        var g = prefs.equipos[i] || {};
        st.equipos.push({ nombre: typeof g.nombre === 'string' && g.nombre ? g.nombre : CFG.NOMBRES_EQUIPO[i], color: i });
      }
      (prefs.equipos || []).forEach(function (g, i) {
        if (i < st.equipos.length && typeof g.color === 'number' && g.color >= 0 && g.color < CFG.COLORES_EQUIPO.length) st.equipos[i].color = g.color;
      });
      // Colores únicos
      var usados = {};
      st.equipos.forEach(function (e) {
        while (usados[e.color]) e.color = (e.color + 1) % CFG.COLORES_EQUIPO.length;
        usados[e.color] = true;
      });

      el.innerHTML = '<div class="pagina">'
        + '<div class="pagina-cab"><h2>Nueva partida</h2></div>'
        + '<div class="config">'
        + '<section class="panel" aria-labelledby="t-preset"><div class="fila entre"><h3 id="t-preset">1. Elijan el preset</h3>'
        + '<label class="fila" style="font-size:22px">Grado <select id="f-grado" style="width:300px;min-height:52px;font-size:22px"><option value="todos">Todos</option>'
        + P.GRADOS.map(function (g) { return '<option value="' + g.id + '">' + esc(g.nombre) + '</option>'; }).join('') + '</select></label></div>'
        + '<div class="lista-presets desliza" id="lista" role="radiogroup" aria-labelledby="t-preset"></div></section>'
        + '<section class="panel desliza" aria-labelledby="t-equipos"><div class="fila entre"><h3 id="t-equipos">2. Equipos</h3>'
        + '<span class="paso"><button type="button" class="btn-icono" id="eq-menos" aria-label="Quitar un equipo">' + A.icono('menos') + '</button><output id="eq-n" aria-live="polite"></output>'
        + '<button type="button" class="btn-icono" id="eq-mas" aria-label="Agregar un equipo">' + A.icono('mas') + '</button></span></div>'
        + '<div id="equipos"></div>'
        + '<div class="opcion-bloque"><div class="fila entre"><label class="interruptor"><input type="checkbox" id="t-activo"> Temporizador por turno</label>'
        + '<span class="paso"><button type="button" class="btn-icono" id="t-menos" aria-label="Menos tiempo">' + A.icono('menos') + '</button><output id="t-seg"></output>'
        + '<button type="button" class="btn-icono" id="t-mas" aria-label="Más tiempo">' + A.icono('mas') + '</button></span></div>'
        + '<p class="tenue" style="font-size:22px;margin-top:8px">Corre durante todo el turno. Si se agota con una pregunta abierta, cuenta como error. Responder rápido da hasta +' + CFG.BONO_RAPIDEZ_MAX + ' puntos.</p></div>'
        + '<div class="opcion-bloque tenue" style="font-size:22px">El sonido y el volumen se controlan arriba a la derecha, en cualquier momento.</div>'
        + '</section></div>'
        + '<div class="pagina-pie"><button type="button" class="btn sec" id="volver">' + A.icono('flechaIzq', 30) + 'Menú</button>'
        + '<span class="error-texto" id="aviso" role="alert"></span>'
        + '<button type="button" class="btn" id="comenzar" data-foco>Comenzar' + A.icono('flecha', 30) + '</button></div>'
        + '</div>';

      var $ = function (s) { return el.querySelector(s); };
      $('#f-grado').value = st.grado;
      if ($('#f-grado').value !== st.grado) { st.grado = 'todos'; $('#f-grado').value = 'todos'; }

      function pintarPresets() {
        var lista = P.filtrarPorGrado(jugables, st.grado);
        if (!lista.some(function (p) { return p.id === st.preset; })) st.preset = lista.length ? lista[0].id : '';
        if (!lista.length) {
          $('#lista').innerHTML = '<div class="aviso">' + A.icono('ayuda', 34) + '<span>No hay presets jugables para este grado. Cambien el filtro o creen uno en el Editor de presets.</span></div>';
        } else {
          $('#lista').innerHTML = lista.map(function (p) {
            var salas = p.salas.map(function (s) { return EA.ESCENAS[s.escena].nombre; });
            var nq = p.salas.reduce(function (a, s) { return a + s.preguntas.length; }, 0);
            return '<label class="preset-op"><input type="radio" name="preset" value="' + esc(p.id) + '"' + (p.id === st.preset ? ' checked' : '') + '>'
              + '<span><strong>' + esc(p.nombre) + '</strong>' + (p.descripcion ? '<span class="desc">' + esc(p.descripcion) + '</span>' : '')
              + '<span class="chips"><span class="chip">' + esc(P.nombreGrado(p.grado)) + '</span><span class="chip">' + p.salas.length + ' salas</span><span class="chip">' + nq + ' preguntas</span></span>'
              + '<span class="desc">' + esc(salas.join(' → ')) + '</span></span></label>';
          }).join('');
        }
        $('#comenzar').disabled = !st.preset;
      }

      function pintarEquipos() {
        $('#eq-n').textContent = st.n + ' equipos';
        $('#eq-menos').disabled = st.n <= CFG.EQUIPOS_MIN;
        $('#eq-mas').disabled = st.n >= CFG.EQUIPOS_MAX;
        var enUso = {};
        st.equipos.slice(0, st.n).forEach(function (e) { enUso[e.color] = true; });
        $('#equipos').innerHTML = st.equipos.slice(0, st.n).map(function (e, i) {
          var c = CFG.COLORES_EQUIPO[e.color];
          return '<div class="equipo-fila">' + '<span class="simbolo-eq" style="--eq:' + c.hex + '">' + A.icono(CFG.SIMBOLOS_EQUIPO[i], 34) + '</span>'
            + '<input type="text" maxlength="24" value="' + esc(e.nombre) + '" data-eq="' + i + '" aria-label="Nombre del equipo ' + (i + 1) + '">'
            + '<span class="colores" role="group" aria-label="Color del equipo ' + (i + 1) + '">' + CFG.COLORES_EQUIPO.map(function (col, k) {
              var mio = e.color === k;
              return '<button type="button" class="color-op" style="--c:' + col.hex + '" data-eq="' + i + '" data-color="' + k + '" aria-pressed="' + mio + '" aria-label="' + col.nombre + (enUso[k] && !mio ? ' (en uso)' : '') + '"' + (enUso[k] && !mio ? ' disabled' : '') + '></button>';
            }).join('') + '</span></div>';
        }).join('');
      }

      function pintarTiempo() {
        $('#t-activo').checked = st.temporizador;
        $('#t-seg').textContent = EA.util.formatoTiempo(st.segundos) + ' min';
        $('#t-menos').disabled = !st.temporizador || st.segundos <= CFG.TEMPORIZADOR_MIN;
        $('#t-mas').disabled = !st.temporizador || st.segundos >= CFG.TEMPORIZADOR_MAX;
        $('#t-seg').classList.toggle('tenue', !st.temporizador);
      }

      function guardar() {
        EA.almacen.guardarPrefs({
          grado: st.grado, preset: st.preset, numEquipos: st.n, temporizador: st.temporizador, segundos: st.segundos,
          equipos: st.equipos.map(function (e) { return { nombre: e.nombre, color: e.color }; })
        });
      }

      function comenzar() {
        var preset = jugables.filter(function (p) { return p.id === st.preset; })[0];
        if (!preset) { $('#aviso').textContent = 'Elijan un preset para comenzar.'; return; }
        var nombres = {};
        var equipos = st.equipos.slice(0, st.n).map(function (e, i) {
          var nombre = e.nombre.trim() || CFG.NOMBRES_EQUIPO[i];
          var base = nombre, k = 2;
          while (nombres[nombre.toLowerCase()]) nombre = base + ' ' + (k++);
          nombres[nombre.toLowerCase()] = true;
          return { nombre: nombre, color: CFG.COLORES_EQUIPO[e.color].hex, simbolo: CFG.SIMBOLOS_EQUIPO[i] };
        });
        guardar();
        EA.ui.ir('juego', { preset: preset, equipos: equipos, opciones: { temporizador: st.temporizador ? st.segundos : 0 } });
      }

      el.addEventListener('change', function (e) {
        if (e.target.id === 'f-grado') { st.grado = e.target.value; pintarPresets(); }
        else if (e.target.name === 'preset') { st.preset = e.target.value; }
        else if (e.target.id === 't-activo') { st.temporizador = e.target.checked; pintarTiempo(); }
      });
      el.addEventListener('input', function (e) {
        if (e.target.matches('input[data-eq]')) st.equipos[+e.target.getAttribute('data-eq')].nombre = e.target.value;
      });
      el.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        if (b.id === 'eq-menos' && st.n > CFG.EQUIPOS_MIN) { st.n--; pintarEquipos(); }
        else if (b.id === 'eq-mas' && st.n < CFG.EQUIPOS_MAX) {
          st.n++;
          // el equipo nuevo toma un color libre
          var nuevo = st.equipos[st.n - 1], uso = {};
          st.equipos.slice(0, st.n - 1).forEach(function (x) { uso[x.color] = true; });
          while (uso[nuevo.color]) nuevo.color = (nuevo.color + 1) % CFG.COLORES_EQUIPO.length;
          pintarEquipos();
        }
        else if (b.id === 't-menos') { st.segundos = Math.max(CFG.TEMPORIZADOR_MIN, st.segundos - CFG.TEMPORIZADOR_PASO); pintarTiempo(); }
        else if (b.id === 't-mas') { st.segundos = Math.min(CFG.TEMPORIZADOR_MAX, st.segundos + CFG.TEMPORIZADOR_PASO); pintarTiempo(); }
        else if (b.classList.contains('color-op')) {
          st.equipos[+b.getAttribute('data-eq')].color = +b.getAttribute('data-color');
          pintarEquipos();
          var again = el.querySelector('.color-op[data-eq="' + b.getAttribute('data-eq') + '"][data-color="' + b.getAttribute('data-color') + '"]');
          if (again) again.focus();
        }
        else if (b.id === 'volver') { guardar(); EA.ui.ir('menu'); }
        else if (b.id === 'comenzar') comenzar();
      });

      pintarPresets(); pintarEquipos(); pintarTiempo();
      return {
        tecla: function (e) {
          if (e.key === 'Escape') { guardar(); EA.ui.ir('menu'); }
          else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') comenzar();
        }
      };
    }
  };
})(window.EA = window.EA || {});
