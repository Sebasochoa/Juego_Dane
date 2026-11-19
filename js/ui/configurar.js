/* Configuración de partida: preset, modo de juego (por turnos o un solo equipo), equipos y tiempo. */
(function (EA) {
  'use strict';
  var A = EA.arte, CFG = EA.CONFIG, P = EA.presets, U = EA.util, esc = U.escapar;
  EA.pantallas = EA.pantallas || {};

  EA.pantallas.configurar = {
    montar: function (el) {
      // Primero los presets: si el juego trae un ejemplo nuevo, la migración lo deja elegido en las preferencias.
      var todos = EA.almacen.presets();
      var prefs = EA.almacen.prefs();
      var jugables = todos.filter(function (p) { return P.validarPreset(p).ok; });
      var st = {
        grado: prefs.grado,
        preset: prefs.preset,
        modo: prefs.modo,
        n: Math.max(CFG.EQUIPOS_MIN, Math.min(CFG.EQUIPOS_MAX, prefs.numEquipos)),
        equipos: [],
        temporizador: prefs.temporizador,
        segundos: prefs.segundos,
        limite: prefs.limite,
        minutos: Math.max(CFG.LIMITE_MIN, Math.min(CFG.LIMITE_MAX, prefs.minutos)),
        historia: prefs.historia
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

      function opModo(valor, icono, titulo, desc) {
        return '<label class="modo-op"><input type="radio" name="modo" value="' + valor + '"' + (st.modo === valor ? ' checked' : '') + '>'
          + A.icono(icono, 40) + '<span><strong>' + titulo + '</strong><small>' + desc + '</small></span></label>';
      }
      function paso(id, etiquetaMenos, etiquetaMas) {
        return '<span class="paso"><button type="button" class="btn-icono" id="' + id + '-menos" aria-label="' + etiquetaMenos + '">' + A.icono('menos') + '</button>'
          + '<output id="' + id + '-valor"></output>'
          + '<button type="button" class="btn-icono" id="' + id + '-mas" aria-label="' + etiquetaMas + '">' + A.icono('mas') + '</button></span>';
      }

      el.innerHTML = '<div class="pagina">'
        + '<div class="pagina-cab"><h2>Nueva partida</h2></div>'
        + '<div class="config">'
        + '<section class="panel" aria-labelledby="t-preset"><div class="fila entre"><h3 id="t-preset">1. Elijan el preset</h3>'
        + '<label class="fila" style="font-size:22px">Grado <select id="f-grado" style="width:300px;min-height:52px;font-size:22px"><option value="todos">Todos</option>'
        + P.GRADOS.map(function (g) { return '<option value="' + g.id + '">' + esc(g.nombre) + '</option>'; }).join('') + '</select></label></div>'
        + '<div class="lista-presets desliza" id="lista" role="radiogroup" aria-labelledby="t-preset"></div></section>'
        + '<section class="panel desliza config-der" aria-labelledby="t-modo">'
        + '<h3 id="t-modo">2. Modo de juego</h3>'
        + '<div class="modos" role="radiogroup" aria-labelledby="t-modo">'
        + opModo('turnos', 'equipos', 'Por turnos', 'De 2 a 4 equipos se turnan')
        + opModo('solo', 'persona', 'Un solo equipo', 'Juega todo el tiempo, sin turnos')
        + '</div>'
        + '<div class="fila entre bloque-equipos"><h3 id="t-equipos">3. Equipos</h3><span id="eq-paso">' + paso('eq', 'Quitar un equipo', 'Agregar un equipo') + '</span></div>'
        + '<div id="equipos"></div>'
        + '<div class="opcion-bloque" id="bloque-tiempo"></div>'
        + '<div class="opcion-bloque"><label class="interruptor"><input type="checkbox" id="h-activo"' + (st.historia ? ' checked' : '') + '> Mostrar la historia al comenzar y al terminar</label></div>'
        + '</section></div>'
        + '<div class="pagina-pie"><button type="button" class="btn sec" id="volver">' + A.icono('flechaIzq', 30) + 'Menú</button>'
        + '<span class="error-texto" id="aviso" role="alert"></span>'
        + '<button type="button" class="btn" id="comenzar" data-foco>Comenzar' + A.icono('flecha', 30) + '</button></div>'
        + '</div>';

      var $ = function (s) { return el.querySelector(s); };
      $('#f-grado').value = st.grado;
      if ($('#f-grado').value !== st.grado) { st.grado = 'todos'; $('#f-grado').value = 'todos'; }

      function cantidad() { return st.modo === 'solo' ? 1 : st.n; }

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
        var n = cantidad();
        $('#eq-paso').hidden = st.modo === 'solo';
        $('#t-equipos').textContent = st.modo === 'solo' ? '3. Equipo' : '3. Equipos';
        $('#eq-valor').textContent = st.n + ' equipos';
        $('#eq-menos').disabled = st.n <= CFG.EQUIPOS_MIN;
        $('#eq-mas').disabled = st.n >= CFG.EQUIPOS_MAX;
        var enUso = {};
        st.equipos.slice(0, n).forEach(function (e) { enUso[e.color] = true; });
        $('#equipos').innerHTML = st.equipos.slice(0, n).map(function (e, i) {
          var c = CFG.COLORES_EQUIPO[e.color];
          return '<div class="equipo-fila">' + '<span class="simbolo-eq" style="--eq:' + c.hex + '">' + A.icono(CFG.SIMBOLOS_EQUIPO[i], 34) + '</span>'
            + '<input type="text" maxlength="24" value="' + esc(e.nombre) + '" data-eq="' + i + '" aria-label="Nombre del equipo ' + (i + 1) + '">'
            + '<span class="colores" role="group" aria-label="Color del equipo ' + (i + 1) + '">' + CFG.COLORES_EQUIPO.map(function (col, k) {
              var mio = e.color === k;
              return '<button type="button" class="color-op" style="--c:' + col.hex + '" data-eq="' + i + '" data-color="' + k + '" aria-pressed="' + mio + '" aria-label="' + col.nombre + (enUso[k] && !mio ? ' (en uso)' : '') + '"' + (enUso[k] && !mio ? ' disabled' : '') + '></button>';
            }).join('') + '</span></div>';
        }).join('');
      }

      /** Por turnos: temporizador por turno. Un solo equipo: tiempo límite total (energía de respaldo). */
      function pintarTiempo() {
        var b = $('#bloque-tiempo');
        var solo = st.modo === 'solo';
        var activo = solo ? st.limite : st.temporizador;
        if (!b.firstChild || b.getAttribute('data-modo') !== st.modo) {
          b.setAttribute('data-modo', st.modo);
          b.innerHTML = '<div class="fila entre"><label class="interruptor"><input type="checkbox" id="t-activo"> '
            + (solo ? 'Tiempo límite para escapar' : 'Temporizador por turno') + '</label>'
            + paso('t', 'Menos tiempo', 'Más tiempo') + '</div>'
            + '<p class="tenue nota-tiempo">' + (solo
              ? 'Es la energía de respaldo del laboratorio: si se acaba antes de escapar, la partida termina.'
              : 'Corre durante todo el turno. Si se agota con una pregunta abierta, cuenta como error. Responder rápido da hasta +' + CFG.BONO_RAPIDEZ_MAX + ' puntos.') + '</p>';
        }
        $('#t-activo').checked = activo;
        $('#t-valor').textContent = solo ? st.minutos + ' min' : U.formatoTiempo(st.segundos) + ' min';
        $('#t-menos').disabled = !activo || (solo ? st.minutos <= CFG.LIMITE_MIN : st.segundos <= CFG.TEMPORIZADOR_MIN);
        $('#t-mas').disabled = !activo || (solo ? st.minutos >= CFG.LIMITE_MAX : st.segundos >= CFG.TEMPORIZADOR_MAX);
        $('#t-valor').classList.toggle('tenue', !activo);
      }

      function guardar() {
        EA.almacen.guardarPrefs({
          grado: st.grado, preset: st.preset, modo: st.modo, numEquipos: st.n,
          temporizador: st.temporizador, segundos: st.segundos, limite: st.limite, minutos: st.minutos, historia: st.historia,
          equipos: st.equipos.map(function (e) { return { nombre: e.nombre, color: e.color }; })
        });
      }

      function comenzar() {
        var preset = jugables.filter(function (p) { return p.id === st.preset; })[0];
        if (!preset) { $('#aviso').textContent = 'Elijan un preset para comenzar.'; return; }
        var nombres = {};
        var equipos = st.equipos.slice(0, cantidad()).map(function (e, i) {
          var nombre = e.nombre.trim() || CFG.NOMBRES_EQUIPO[i];
          var base = nombre, k = 2;
          while (nombres[nombre.toLowerCase()]) nombre = base + ' ' + (k++);
          nombres[nombre.toLowerCase()] = true;
          return { nombre: nombre, color: CFG.COLORES_EQUIPO[e.color].hex, simbolo: CFG.SIMBOLOS_EQUIPO[i] };
        });
        guardar();
        var solo = st.modo === 'solo';
        var juego = {
          preset: preset, equipos: equipos, historia: st.historia,
          opciones: {
            modo: st.modo,
            temporizador: !solo && st.temporizador ? st.segundos : 0,
            limite: solo && st.limite ? st.minutos * 60 : 0
          }
        };
        if (st.historia) {
          var paneles = EA.historia.intro({ salas: preset.salas.map(function (s) { return s.escena; }), modo: st.modo, limite: juego.opciones.limite });
          EA.ui.ir('historia', { paneles: paneles, siguiente: 'juego', juego: juego });
        } else EA.ui.ir('juego', juego);
      }

      el.addEventListener('change', function (e) {
        if (e.target.id === 'f-grado') { st.grado = e.target.value; pintarPresets(); }
        else if (e.target.name === 'preset') { st.preset = e.target.value; }
        else if (e.target.name === 'modo') { st.modo = e.target.value; pintarEquipos(); pintarTiempo(); }
        else if (e.target.id === 't-activo') {
          if (st.modo === 'solo') st.limite = e.target.checked; else st.temporizador = e.target.checked;
          pintarTiempo();
        }
        else if (e.target.id === 'h-activo') st.historia = e.target.checked;
      });
      el.addEventListener('input', function (e) {
        if (e.target.matches('input[data-eq]')) st.equipos[+e.target.getAttribute('data-eq')].nombre = e.target.value;
      });
      el.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b || b.disabled) return;
        var solo = st.modo === 'solo';
        if (b.id === 'eq-menos' && st.n > CFG.EQUIPOS_MIN) { st.n--; pintarEquipos(); }
        else if (b.id === 'eq-mas' && st.n < CFG.EQUIPOS_MAX) {
          st.n++;
          // el equipo nuevo toma un color libre
          var nuevo = st.equipos[st.n - 1], uso = {};
          st.equipos.slice(0, st.n - 1).forEach(function (x) { uso[x.color] = true; });
          while (uso[nuevo.color]) nuevo.color = (nuevo.color + 1) % CFG.COLORES_EQUIPO.length;
          pintarEquipos();
        }
        else if (b.id === 't-menos') {
          if (solo) st.minutos = Math.max(CFG.LIMITE_MIN, st.minutos - CFG.LIMITE_PASO);
          else st.segundos = Math.max(CFG.TEMPORIZADOR_MIN, st.segundos - CFG.TEMPORIZADOR_PASO);
          pintarTiempo();
        }
        else if (b.id === 't-mas') {
          if (solo) st.minutos = Math.min(CFG.LIMITE_MAX, st.minutos + CFG.LIMITE_PASO);
          else st.segundos = Math.min(CFG.TEMPORIZADOR_MAX, st.segundos + CFG.TEMPORIZADOR_PASO);
          pintarTiempo();
        }
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
