/* Editor de presets: lista, edición, vista previa, importación y exportación. */
(function (EA) {
  'use strict';
  var A = EA.arte, CFG = EA.CONFIG, P = EA.presets, U = EA.util, esc = U.escapar, F = U.formatear;
  var LETRAS = 'ABCDE';
  EA.pantallas = EA.pantallas || {};

  function slug(s) {
    return (s || 'preset').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'preset';
  }
  function copia(o) { return JSON.parse(JSON.stringify(o)); }
  function opciones(lista, valor) {
    return lista.map(function (o) { return '<option value="' + esc(o.id) + '"' + (o.id === valor ? ' selected' : '') + '>' + esc(o.nombre) + '</option>'; }).join('');
  }

  /** Tarjeta de pregunta tal como se proyecta en el juego (sin interacción). */
  function tarjetaVista(q) {
    var maxLen = q.alternativas.reduce(function (m, a) { return Math.max(m, U.plano(a).length); }, 0);
    var n = q.alternativas.length;
    var clases = 'opciones' + (maxLen > 60 || n === 5 || n === 3 ? ' una' : '') + (maxLen > 42 || n === 5 ? ' densas' : '');
    var img = (q.imagen && P.imagenValida(q.imagen)) ? '<img class="pregunta-img" src="' + esc(q.imagen) + '" alt="Imagen de la pregunta">' : '';
    return '<div class="tarjeta">'
      + '<div class="tarjeta-cab"><span class="chip cand">' + A.icono('candado', 24) + 'Candado 1 · Vista previa</span>' + (q.rama ? '<span class="chip">' + esc(P.nombreRama(q.rama)) + '</span>' : '') + '<span class="hueco"></span></div>'
      + '<div class="pregunta-cuerpo"><p class="enunciado' + (U.plano(q.enunciado).length > 150 ? ' largo' : '') + '">' + (F(q.enunciado) || '<span class="tenue">(sin enunciado)</span>') + '</p>' + img + '</div>'
      + '<div class="' + clases + '">' + q.alternativas.map(function (a, i) {
        return '<div class="opcion' + (i === q.correcta ? ' es-correcta' : '') + '"><span class="letra">' + LETRAS[i] + '</span><span class="txt">' + (F(a) || '<span class="tenue">(vacía)</span>') + '</span><span class="marca">' + (i === q.correcta ? A.icono('check', 30) + 'Correcta' : '') + '</span></div>';
      }).join('') + '</div>'
      + (q.pista ? '<div class="caja-pista">' + A.icono('bombilla', 38) + '<div><b>Pista (tras el primer fallo)</b>' + F(q.pista) + '</div></div>' : '')
      + (q.explicacion ? '<div class="caja-pista exp">' + A.icono('libro', 38) + '<div><b>Explicación (tras el segundo fallo o al acertar)</b>' + F(q.explicacion) + '</div></div>' : '')
      + '</div>';
  }

  EA.pantallas.editor = {
    montar: function (el) {
      var presets = EA.almacen.presets();
      var st = { vista: 'lista', grado: 'todos', borrador: null, original: '', sala: 0 };

      function guardarTodo() {
        var ok = EA.almacen.guardarPresets(presets);
        if (!ok) EA.ui.dialogo({ titulo: 'No se pudo guardar', html: '<p>El navegador no permitió guardar en este equipo (almacenamiento lleno o bloqueado). Exporte sus presets a un archivo para no perderlos.</p>' });
        return ok;
      }

      // ================================================================ LISTA
      function pintarLista() {
        st.vista = 'lista';
        var lista = P.filtrarPorGrado(presets, st.grado);
        el.innerHTML = '<div class="pagina editor">'
          + '<div class="pagina-cab"><h2>Editor de presets</h2>'
          + '<label class="fila" style="font-size:22px">Grado <select id="e-grado" style="width:290px;min-height:52px;font-size:22px"><option value="todos">Todos</option>' + opciones(P.GRADOS, st.grado) + '</select></label></div>'
          + '<div class="aviso">' + A.icono('ayuda', 34) + '<span><b>Los presets viven en este navegador.</b> Para llevarlos a otra computadora (o guardarlos de respaldo), use «Exportar» y luego «Importar» en el otro equipo.</span></div>'
          + '<div class="fila ed-barra">'
          + '<button type="button" class="btn chico" data-a="nuevo" data-foco>' + A.icono('mas', 26) + 'Nuevo preset</button>'
          + '<button type="button" class="btn chico sec" data-a="importar">' + A.icono('subir', 26) + 'Importar JSON</button>'
          + '<button type="button" class="btn chico sec" data-a="exportar-todos"' + (presets.length ? '' : ' disabled') + '>' + A.icono('descargar', 26) + 'Exportar todos</button>'
          + '<button type="button" class="btn chico sec" data-a="restaurar">' + A.icono('estrella', 26) + 'Restaurar ejemplos</button>'
          + '<input type="file" id="e-archivo" accept=".json,application/json" hidden></div>'
          + '<div class="ed-lista desliza">' + (lista.length ? lista.map(function (p) {
            var v = P.validarPreset(p);
            var nq = p.salas.reduce(function (a, s) { return a + s.preguntas.length; }, 0);
            return '<article class="ed-preset" data-id="' + esc(p.id) + '"><div class="ed-preset-info"><h3>' + esc(p.nombre || '(sin nombre)') + '</h3>'
              + (p.descripcion ? '<p class="tenue">' + esc(p.descripcion) + '</p>' : '')
              + '<p class="chips"><span class="chip">' + esc(P.nombreGrado(p.grado)) + '</span><span class="chip">' + p.salas.length + ' salas</span><span class="chip">' + nq + ' preguntas</span>'
              + (v.ok ? '<span class="chip ok">' + A.icono('check', 20) + 'Listo para jugar</span>' : '<span class="chip incompleto">' + A.icono('ayuda', 20) + 'Incompleto: ' + v.errores.length + (v.errores.length === 1 ? ' pendiente' : ' pendientes') + '</span>') + '</p></div>'
              + '<div class="ed-preset-acc">'
              + '<button type="button" class="btn chico" data-a="editar">' + A.icono('editar', 24) + 'Editar</button>'
              + '<button type="button" class="btn-icono" data-a="duplicar" aria-label="Duplicar ' + esc(p.nombre) + '" title="Duplicar">' + A.icono('copiar', 28) + '</button>'
              + '<button type="button" class="btn-icono" data-a="exportar" aria-label="Exportar ' + esc(p.nombre) + '" title="Exportar a JSON">' + A.icono('descargar', 28) + '</button>'
              + '<button type="button" class="btn-icono" data-a="eliminar" aria-label="Eliminar ' + esc(p.nombre) + '" title="Eliminar">' + A.icono('basura', 28) + '</button>'
              + '</div></article>';
          }).join('') : '<p class="tenue" style="padding:30px">No hay presets para este grado. Cree uno nuevo, importe un archivo o restaure los ejemplos.</p>') + '</div>'
          + '<div class="pagina-pie"><button type="button" class="btn sec" data-a="menu">' + A.icono('flechaIzq', 30) + 'Menú <kbd>Esc</kbd></button><span class="tenue" style="font-size:22px">' + presets.length + (presets.length === 1 ? ' preset guardado' : ' presets guardados') + ' en este navegador</span></div>'
          + '</div>';
      }

      function exportarArchivo(lista, nombre) {
        EA.descargar(nombre, JSON.stringify(P.exportar(lista), null, 2), 'application/json');
      }

      function importarTexto(texto) {
        var r = P.leerImportacion(texto);
        if (!r.ok) {
          EA.ui.dialogo({
            titulo: 'No se pudo importar',
            html: '<p>' + esc(r.error) + '</p>' + (r.rechazados.length ? listaRechazados(r.rechazados) : '')
          });
          return r;
        }
        var choques = P.conflictos(presets, r.validos);
        if (choques.length) {
          EA.ui.dialogo({
            titulo: 'Ya existen presets con ese nombre',
            html: '<p>El archivo trae ' + (choques.length === 1 ? 'un preset' : choques.length + ' presets') + ' con un nombre que ya está en uso:</p><ul>' + choques.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul><p>¿Qué desea hacer?</p>',
            cerrable: true,
            botones: [
              { texto: 'Omitir esos', clase: 'sec chico', accion: function () { aplicar('omitir'); } },
              { texto: 'Reemplazar los míos', clase: 'peligro chico', accion: function () { aplicar('reemplazar'); } },
              { texto: 'Conservar ambos', clase: 'chico', accion: function () { aplicar('renombrar'); } }
            ]
          });
        } else aplicar('renombrar');
        function aplicar(modo) {
          var f = P.fusionar(presets, r.validos, modo);
          presets = f.presets;
          guardarTodo();
          pintarLista();
          var partes = [];
          if (f.agregados) partes.push(f.agregados + (f.agregados === 1 ? ' preset agregado' : ' presets agregados'));
          if (f.reemplazados) partes.push(f.reemplazados + (f.reemplazados === 1 ? ' reemplazado' : ' reemplazados'));
          if (f.omitidos) partes.push(f.omitidos + (f.omitidos === 1 ? ' omitido' : ' omitidos'));
          EA.ui.dialogo({
            titulo: 'Importación terminada',
            html: '<p>' + esc(partes.join(', ') || 'No hubo cambios') + '.</p>' + (r.rechazados.length ? '<p class="error-texto">No se importaron ' + r.rechazados.length + ' por errores:</p>' + listaRechazados(r.rechazados) : '')
          });
          EA.ui.anunciar('Importación terminada');
        }
        return r;
      }
      function listaRechazados(lista) {
        return '<ul>' + lista.map(function (x) { return '<li><b>' + esc(x.nombre) + ':</b> ' + esc(x.errores.slice(0, 3).join(' ')) + (x.errores.length > 3 ? ' (y ' + (x.errores.length - 3) + ' más)' : '') + '</li>'; }).join('') + '</ul>';
      }
      EA.editor = { importarTexto: importarTexto, presets: function () { return presets; } };

      function accionLista(a, id) {
        var p = presets.filter(function (x) { return x.id === id; })[0];
        if (a === 'menu') EA.ui.ir('menu');
        else if (a === 'nuevo') {
          var nuevo = P.normalizarPreset({ nombre: P.nombreLibre('Preset nuevo', presets.map(function (x) { return x.nombre; })), grado: st.grado === 'todos' ? 'mixto' : st.grado, salas: [{ escena: 'quimica', preguntas: [] }, { escena: 'biologia', preguntas: [] }] });
          abrirEdicion(nuevo, true);
        }
        else if (a === 'importar') el.querySelector('#e-archivo').click();
        else if (a === 'exportar-todos') exportarArchivo(presets, 'presets-laboratorio.json');
        else if (a === 'restaurar') {
          EA.ui.dialogo({
            titulo: '¿Restaurar los ejemplos?',
            html: '<p>Se volverán a agregar los presets de ejemplo y la plantilla vacía en su versión original. Sus otros presets no se tocan.</p>',
            botones: [{ texto: 'Cancelar', clase: 'sec', tecla: 'Escape' }, { texto: 'Restaurar', accion: function () { presets = EA.almacen.restaurarEjemplos(); st.grado = 'todos'; pintarLista(); EA.ui.anunciar('Ejemplos restaurados'); } }]
          });
        }
        else if (!p) return;
        else if (a === 'editar') abrirEdicion(copia(p), false);
        else if (a === 'duplicar') { presets.push(P.duplicar(p, presets)); guardarTodo(); pintarLista(); EA.ui.anunciar('Preset duplicado'); }
        else if (a === 'exportar') exportarArchivo([p], 'preset-' + slug(p.nombre) + '.json');
        else if (a === 'eliminar') {
          EA.ui.dialogo({
            titulo: '¿Eliminar «' + p.nombre + '»?',
            html: '<p>Esta acción no se puede deshacer. Si quiere conservar una copia, expórtelo antes.</p>',
            botones: [{ texto: 'Cancelar', clase: 'sec', tecla: 'Escape' }, { texto: 'Eliminar', clase: 'peligro', accion: function () { presets = presets.filter(function (x) { return x.id !== id; }); guardarTodo(); pintarLista(); EA.ui.anunciar('Preset eliminado'); } }]
          });
        }
      }

      // ================================================================ EDICIÓN
      function abrirEdicion(p, esNuevo) {
        st.borrador = p; st.sala = 0; st.esNuevo = esNuevo;
        st.original = esNuevo ? '' : JSON.stringify(p);
        pintarEdicion();
      }
      function sucio() { return JSON.stringify(st.borrador) !== st.original; }

      function pintarEdicion(foco) {
        st.vista = 'edicion';
        var b = st.borrador;
        if (st.sala >= b.salas.length) st.sala = Math.max(0, b.salas.length - 1);
        var v = P.validarPreset(P.normalizarPreset(b));
        var sala = b.salas[st.sala];
        var escSala = sala ? EA.ESCENAS[sala.escena] : null;
        var escenasOp = EA.ORDEN_ESCENAS.map(function (id) { return { id: id, nombre: EA.ESCENAS[id].nombre + ' (' + EA.ESCENAS[id].candados.length + ' candados)' }; });

        el.innerHTML = '<div class="pagina editor">'
          + '<div class="pagina-cab"><h2>' + (st.esNuevo ? 'Nuevo preset' : 'Editar preset') + '</h2>'
          + (v.ok ? '<span class="chip ok">' + A.icono('check', 22) + 'Listo para jugar</span>' : '<button type="button" class="chip incompleto" data-a="ver-errores">' + A.icono('ayuda', 22) + v.errores.length + (v.errores.length === 1 ? ' pendiente' : ' pendientes') + ' · ver</button>') + '</div>'
          + '<div class="ed-cols">'
          // ---- Columna izquierda: datos y salas
          + '<section class="panel desliza ed-datos" aria-label="Datos del preset">'
          + '<label for="p-nombre">Nombre</label><input type="text" id="p-nombre" maxlength="80" value="' + esc(b.nombre) + '" data-foco>'
          + '<div class="fila" style="gap:14px;margin-top:12px"><div style="flex:1"><label for="p-grado">Grado</label><select id="p-grado">' + opciones(P.GRADOS, b.grado) + '</select></div></div>'
          + '<label for="p-desc" style="margin-top:12px;display:block">Descripción</label><textarea id="p-desc" rows="2" maxlength="400">' + esc(b.descripcion) + '</textarea>'
          + '<h3 style="margin:18px 0 8px">Salas (en orden)</h3><ol class="ed-salas">'
          + b.salas.map(function (s, i) {
            var e = EA.ESCENAS[s.escena], min = e ? e.candados.length : 0, falta = s.preguntas.length < min;
            return '<li class="ed-sala' + (i === st.sala ? ' sel' : '') + '"><button type="button" class="ed-sala-btn" data-a="sel-sala" data-i="' + i + '" aria-pressed="' + (i === st.sala) + '"><b>' + (i + 1) + '</b><span>' + esc(e ? e.nombre : s.escena) + '<small class="' + (falta ? 'error-texto' : 'tenue') + '">' + s.preguntas.length + ' de ' + min + ' preguntas mínimas</small></span></button>'
              + '<button type="button" class="btn-icono mini" data-a="sala-arriba" data-i="' + i + '" aria-label="Subir sala ' + (i + 1) + '"' + (i === 0 ? ' disabled' : '') + '>' + A.icono('arriba', 22) + '</button>'
              + '<button type="button" class="btn-icono mini" data-a="sala-abajo" data-i="' + i + '" aria-label="Bajar sala ' + (i + 1) + '"' + (i === b.salas.length - 1 ? ' disabled' : '') + '>' + A.icono('abajo', 22) + '</button>'
              + '<button type="button" class="btn-icono mini" data-a="sala-quitar" data-i="' + i + '" aria-label="Quitar sala ' + (i + 1) + '"' + (b.salas.length <= CFG.SALAS_MIN ? ' disabled' : '') + '>' + A.icono('basura', 22) + '</button></li>';
          }).join('') + '</ol>'
          + '<button type="button" class="btn chico sec" data-a="sala-agregar"' + (b.salas.length >= CFG.SALAS_MAX ? ' disabled' : '') + '>' + A.icono('mas', 24) + 'Agregar sala</button>'
          + '<p class="tenue" style="font-size:20px;margin-top:10px">De ' + CFG.SALAS_MIN + ' a ' + CFG.SALAS_MAX + ' salas. La puerta de la última es la salida.</p>'
          + '</section>'
          // ---- Columna derecha: banco de preguntas de la sala
          + '<section class="panel ed-banco" aria-label="Banco de preguntas">'
          + (sala ? '<div class="fila entre" style="gap:16px"><h3 style="margin:0">Sala ' + (st.sala + 1) + '</h3>'
            + '<label class="fila" style="font-size:22px;flex:1">Escenario <select id="s-escena" style="min-height:52px;font-size:22px">' + opciones(escenasOp, sala.escena) + '</select></label>'
            + '<button type="button" class="btn chico" data-a="q-nueva">' + A.icono('mas', 24) + 'Agregar pregunta</button></div>'
            + '<p class="tenue" style="font-size:21px;margin:8px 0 10px">El escenario es solo el decorado: puede cargar preguntas de cualquier tema. Necesita al menos ' + (escSala ? escSala.candados.length : 0) + ' (una por candado); si carga más, cada equipo recibe un sorteo distinto.</p>'
            + '<ol class="ed-preguntas desliza">' + (sala.preguntas.length ? sala.preguntas.map(function (q, j) {
              var errs = P.validarPregunta(P.normalizarPregunta(q));
              return '<li class="ed-q' + (errs.length ? ' mal' : '') + '"><span class="num">' + (j + 1) + '</span><div class="ed-q-txt"><p>' + (F(q.enunciado.replace(/\s*\n+\s*/g, ' ')) || '<span class="tenue">(sin enunciado)</span>') + '</p>'
                + '<small>' + (errs.length ? '<span class="error-texto">' + A.icono('cruz', 16) + ' ' + esc(errs[0]) + '</span>' : '<span class="ok-texto">' + A.icono('check', 16) + ' ' + F(q.alternativas[q.correcta]) + '</span>') + (q.rama ? ' · ' + esc(P.nombreRama(q.rama)) : '') + '</small></div>'
                + '<button type="button" class="btn-icono mini" data-a="q-editar" data-i="' + j + '" aria-label="Editar pregunta ' + (j + 1) + '" title="Editar">' + A.icono('editar', 22) + '</button>'
                + '<button type="button" class="btn-icono mini" data-a="q-ver" data-i="' + j + '" aria-label="Vista previa de la pregunta ' + (j + 1) + '" title="Vista previa">' + A.icono('ojo', 22) + '</button>'
                + '<button type="button" class="btn-icono mini" data-a="q-duplicar" data-i="' + j + '" aria-label="Duplicar pregunta ' + (j + 1) + '" title="Duplicar">' + A.icono('copiar', 22) + '</button>'
                + '<button type="button" class="btn-icono mini" data-a="q-quitar" data-i="' + j + '" aria-label="Eliminar pregunta ' + (j + 1) + '" title="Eliminar">' + A.icono('basura', 22) + '</button></li>';
            }).join('') : '<li class="tenue" style="padding:24px;list-style:none">Esta sala todavía no tiene preguntas. Use «Agregar pregunta».</li>') + '</ol>' : '')
          + '</section></div>'
          + '<div class="pagina-pie"><button type="button" class="btn sec" data-a="cancelar">' + A.icono('flechaIzq', 30) + 'Volver sin guardar</button>'
          + '<span class="error-texto" id="e-aviso" role="alert"></span>'
          + '<button type="button" class="btn" data-a="guardar">' + A.icono('check', 30) + 'Guardar preset</button></div>'
          + '</div>';
        if (foco) { var f = el.querySelector(foco); if (f) f.focus({ preventScroll: true }); }
      }

      function verErrores() {
        var v = P.validarPreset(P.normalizarPreset(st.borrador));
        EA.ui.dialogo({ titulo: 'Pendientes para poder jugarlo', html: '<ul>' + v.errores.slice(0, 12).map(function (e) { return '<li>' + esc(e.mensaje) + '</li>'; }).join('') + '</ul>' + (v.errores.length > 12 ? '<p class="tenue">…y ' + (v.errores.length - 12) + ' más.</p>' : '') });
      }

      function guardarBorrador() {
        var p = P.normalizarPreset(st.borrador);
        if (!p.nombre) { el.querySelector('#e-aviso').textContent = 'Escriba un nombre para el preset.'; el.querySelector('#p-nombre').focus(); return; }
        var choque = presets.some(function (x) { return x.id !== p.id && x.nombre.toLowerCase() === p.nombre.toLowerCase(); });
        if (choque) { el.querySelector('#e-aviso').textContent = 'Ya existe otro preset con ese nombre. Elija uno distinto.'; el.querySelector('#p-nombre').focus(); return; }
        var i = presets.findIndex(function (x) { return x.id === p.id; });
        if (i >= 0) presets[i] = p; else presets.push(p);
        guardarTodo();
        var v = P.validarPreset(p);
        st.grado = 'todos';
        pintarLista();
        if (!v.ok) {
          EA.ui.dialogo({ titulo: 'Guardado, pero aún no se puede jugar', html: '<p>El preset quedó guardado como incompleto. Pendientes:</p><ul>' + v.errores.slice(0, 8).map(function (e) { return '<li>' + esc(e.mensaje) + '</li>'; }).join('') + '</ul>' + (v.errores.length > 8 ? '<p class="tenue">…y ' + (v.errores.length - 8) + ' más.</p>' : '') });
        } else EA.ui.anunciar('Preset guardado');
      }

      function salirEdicion() {
        if (!sucio()) { pintarLista(); return; }
        EA.ui.dialogo({
          titulo: '¿Salir sin guardar?',
          html: '<p>Hay cambios sin guardar en este preset.</p>',
          botones: [{ texto: 'Seguir editando', clase: 'sec', tecla: 'Escape' }, { texto: 'Descartar cambios', clase: 'peligro', accion: pintarLista }]
        });
      }

      // ---------------------------------------------------------------- Editor de una pregunta
      function editarPregunta(j) {
        var sala = st.borrador.salas[st.sala];
        var esNueva = j == null;
        var q = esNueva ? P.preguntaVacia() : copia(sala.preguntas[j]);
        var dlg;

        function cuerpo() {
          return '<div class="q-form">'
            + '<label for="q-enun">Enunciado</label><textarea id="q-enun" rows="2" maxlength="1200" data-foco>' + esc(q.enunciado) + '</textarea>'
            + '<p class="tenue q-tip">Notación: escriba <code>H_2O</code> para H<sub>2</sub>O, <code>m/s^2</code> para m/s<sup>2</sup>, <code>SO_4^{2-}</code> para SO<sub>4</sub><sup>2-</sup>.</p>'
            + '<fieldset><legend>Alternativas — marque la única correcta</legend><div id="q-alts">' + q.alternativas.map(function (a, i) {
              return '<div class="q-alt"><label class="q-radio"><input type="radio" name="q-correcta" value="' + i + '"' + (q.correcta === i ? ' checked' : '') + ' aria-label="La alternativa ' + LETRAS[i] + ' es la correcta"><span class="letra">' + LETRAS[i] + '</span></label>'
                + '<input type="text" data-alt="' + i + '" maxlength="400" value="' + esc(a) + '" aria-label="Texto de la alternativa ' + LETRAS[i] + '">'
                + '<button type="button" class="btn-icono mini" data-q="alt-quitar" data-i="' + i + '" aria-label="Quitar alternativa ' + LETRAS[i] + '"' + (q.alternativas.length <= CFG.ALTERNATIVAS_MIN ? ' disabled' : '') + '>' + A.icono('basura', 22) + '</button></div>';
            }).join('') + '</div><button type="button" class="btn chico sec" data-q="alt-agregar"' + (q.alternativas.length >= CFG.ALTERNATIVAS_MAX ? ' disabled' : '') + '>' + A.icono('mas', 22) + 'Agregar alternativa</button></fieldset>'
            + '<div class="q-dos"><div><label for="q-pista">Pista <span class="tenue">(se muestra tras el primer fallo)</span></label><textarea id="q-pista" rows="2" maxlength="800">' + esc(q.pista) + '</textarea></div>'
            + '<div><label for="q-exp">Explicación <span class="tenue">(tras el segundo fallo o al acertar)</span></label><textarea id="q-exp" rows="2" maxlength="1500">' + esc(q.explicacion) + '</textarea></div></div>'
            + '<div class="q-dos"><div><label for="q-rama">Rama <span class="tenue">(opcional)</span></label><select id="q-rama">' + opciones(P.RAMAS, q.rama) + '</select></div>'
            + '<div><label for="q-img">Imagen o esquema <span class="tenue">(opcional)</span></label><div class="fila">'
            + (q.imagen && P.imagenValida(q.imagen) ? '<img class="q-mini" src="' + esc(q.imagen) + '" alt="Imagen actual">' : '')
            + '<button type="button" class="btn chico sec" data-q="img-elegir">' + A.icono('subir', 22) + (q.imagen ? 'Cambiar' : 'Elegir archivo') + '</button>'
            + (q.imagen ? '<button type="button" class="btn chico sec" data-q="img-quitar">' + A.icono('basura', 22) + 'Quitar</button>' : '')
            + '<input type="file" id="q-img" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" hidden></div></div></div>'
            + '<div class="error-texto" id="q-errores" role="alert"></div></div>';
        }
        function leer(velo) {
          q.enunciado = velo.querySelector('#q-enun').value;
          velo.querySelectorAll('[data-alt]').forEach(function (inp) { q.alternativas[+inp.getAttribute('data-alt')] = inp.value; });
          var r = velo.querySelector('input[name="q-correcta"]:checked');
          q.correcta = r ? +r.value : -1;
          q.pista = velo.querySelector('#q-pista').value;
          q.explicacion = velo.querySelector('#q-exp').value;
          q.rama = velo.querySelector('#q-rama').value;
        }
        function repintar(velo, foco) {
          velo.querySelector('.dialogo-cuerpo').innerHTML = cuerpo();
          if (foco) { var f = velo.querySelector(foco); if (f) f.focus(); }
        }

        dlg = EA.ui.dialogo({
          titulo: esNueva ? 'Nueva pregunta' : 'Editar pregunta ' + (j + 1),
          ancho: true, cerrable: false,
          html: cuerpo(),
          botones: [
            { texto: 'Cancelar', clase: 'sec chico', accion: function () { /* descarta */ } },
            { texto: 'Vista previa', clase: 'sec chico', cerrar: false, accion: function (reg) { leer(reg.el); vistaPrevia(P.normalizarPregunta(q)); } },
            {
              texto: 'Guardar pregunta', clase: 'chico', cerrar: false, accion: function (reg) {
                leer(reg.el);
                var n = P.normalizarPregunta(q);
                var errs = P.validarPregunta(n);
                if (errs.length) {
                  reg.el.querySelector('#q-errores').innerHTML = '<ul>' + errs.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>';
                  EA.ui.anunciar('La pregunta tiene ' + errs.length + ' problemas');
                  return;
                }
                if (esNueva) sala.preguntas.push(n); else sala.preguntas[j] = n;
                reg.cerrar();
                pintarEdicion('[data-a="q-nueva"]');
              }
            }
          ],
          alMontar: function (velo) {
            velo.addEventListener('click', function (e) {
              var b = e.target.closest('[data-q]');
              if (!b) return;
              var a = b.getAttribute('data-q');
              leer(velo);
              if (a === 'alt-agregar' && q.alternativas.length < CFG.ALTERNATIVAS_MAX) { q.alternativas.push(''); repintar(velo, '[data-alt="' + (q.alternativas.length - 1) + '"]'); }
              else if (a === 'alt-quitar' && q.alternativas.length > CFG.ALTERNATIVAS_MIN) {
                var i = +b.getAttribute('data-i');
                q.alternativas.splice(i, 1);
                if (q.correcta === i) q.correcta = -1; else if (q.correcta > i) q.correcta--;
                repintar(velo, '[data-q="alt-agregar"]');
              }
              else if (a === 'img-elegir') velo.querySelector('#q-img').click();
              else if (a === 'img-quitar') { q.imagen = ''; repintar(velo, '[data-q="img-elegir"]'); }
            });
            velo.addEventListener('change', function (e) {
              if (e.target.id !== 'q-img' || !e.target.files || !e.target.files[0]) return;
              var archivo = e.target.files[0];
              leer(velo);
              if (archivo.size > CFG.IMAGEN_MAX_BYTES) {
                velo.querySelector('#q-errores').textContent = 'La imagen pesa ' + Math.round(archivo.size / 1024) + ' KB. El máximo es ' + Math.round(CFG.IMAGEN_MAX_BYTES / 1024) + ' KB: redúzcala antes de cargarla.';
                return;
              }
              var lector = new FileReader();
              lector.onload = function () {
                if (P.imagenValida(String(lector.result))) { q.imagen = String(lector.result); repintar(velo, '[data-q="img-elegir"]'); }
                else velo.querySelector('#q-errores').textContent = 'Ese archivo no es una imagen compatible (PNG, JPG, GIF, WebP o SVG).';
              };
              lector.readAsDataURL(archivo);
            });
          }
        });
        return dlg;
      }

      function vistaPrevia(q) {
        var velo = document.createElement('div');
        velo.className = 'velo previa';
        velo.innerHTML = '<div class="previa-caja" role="dialog" aria-modal="true" aria-label="Vista previa de la pregunta"><p class="previa-rotulo">Vista previa — así se verá proyectada</p>' + tarjetaVista(q)
          + '<button type="button" class="btn" id="previa-cerrar">Cerrar vista previa <kbd>Esc</kbd></button></div>';
        EA.ui.dialogoLibre(velo, '#previa-cerrar');
      }

      // ================================================================ eventos
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-a]');
        if (!b || b.disabled) return;
        var a = b.getAttribute('data-a');
        if (st.vista === 'lista') {
          var art = b.closest('.ed-preset');
          accionLista(a, art ? art.getAttribute('data-id') : null);
          return;
        }
        var bo = st.borrador, i = +b.getAttribute('data-i'), sala = bo.salas[st.sala], tmp;
        if (a === 'cancelar') salirEdicion();
        else if (a === 'guardar') guardarBorrador();
        else if (a === 'ver-errores') verErrores();
        else if (a === 'sel-sala') { st.sala = i; pintarEdicion('[data-a="sel-sala"][data-i="' + i + '"]'); }
        else if (a === 'sala-agregar' && bo.salas.length < CFG.SALAS_MAX) {
          var usadas = bo.salas.map(function (s) { return s.escena; });
          var libre = EA.ORDEN_ESCENAS.filter(function (x) { return usadas.indexOf(x) < 0; })[0] || EA.ORDEN_ESCENAS[0];
          bo.salas.push({ escena: libre, preguntas: [] }); st.sala = bo.salas.length - 1; pintarEdicion('#s-escena');
        }
        else if (a === 'sala-quitar' && bo.salas.length > CFG.SALAS_MIN) {
          var quitar = function () { bo.salas.splice(i, 1); if (st.sala >= i && st.sala > 0) st.sala--; pintarEdicion('[data-a="sala-agregar"]'); };
          if (bo.salas[i].preguntas.length) EA.ui.dialogo({ titulo: '¿Quitar la sala ' + (i + 1) + '?', html: '<p>Se eliminarán también sus ' + bo.salas[i].preguntas.length + ' preguntas.</p>', botones: [{ texto: 'Cancelar', clase: 'sec', tecla: 'Escape' }, { texto: 'Quitar sala', clase: 'peligro', accion: quitar }] });
          else quitar();
        }
        else if (a === 'sala-arriba' && i > 0) { tmp = bo.salas[i - 1]; bo.salas[i - 1] = bo.salas[i]; bo.salas[i] = tmp; st.sala = i - 1; pintarEdicion('[data-a="sala-arriba"][data-i="' + (i - 1) + '"]'); }
        else if (a === 'sala-abajo' && i < bo.salas.length - 1) { tmp = bo.salas[i + 1]; bo.salas[i + 1] = bo.salas[i]; bo.salas[i] = tmp; st.sala = i + 1; pintarEdicion('[data-a="sala-abajo"][data-i="' + (i + 1) + '"]'); }
        else if (a === 'q-nueva') editarPregunta(null);
        else if (a === 'q-editar') editarPregunta(i);
        else if (a === 'q-ver') vistaPrevia(P.normalizarPregunta(sala.preguntas[i]));
        else if (a === 'q-duplicar') { sala.preguntas.splice(i + 1, 0, copia(sala.preguntas[i])); pintarEdicion('[data-a="q-editar"][data-i="' + (i + 1) + '"]'); }
        else if (a === 'q-quitar') { sala.preguntas.splice(i, 1); pintarEdicion('[data-a="q-nueva"]'); }
      });
      el.addEventListener('input', function (e) {
        if (st.vista !== 'edicion') return;
        if (e.target.id === 'p-nombre') st.borrador.nombre = e.target.value;
        else if (e.target.id === 'p-desc') st.borrador.descripcion = e.target.value;
      });
      el.addEventListener('change', function (e) {
        if (e.target.id === 'e-grado') { st.grado = e.target.value; pintarLista(); el.querySelector('#e-grado').focus(); }
        else if (e.target.id === 'e-archivo' && e.target.files && e.target.files[0]) {
          var lector = new FileReader();
          lector.onload = function () { importarTexto(String(lector.result)); };
          lector.onerror = function () { EA.ui.dialogo({ titulo: 'No se pudo leer el archivo', html: '<p>Intente de nuevo con otro archivo.</p>' }); };
          lector.readAsText(e.target.files[0]);
          e.target.value = '';
        }
        else if (e.target.id === 'p-grado') st.borrador.grado = e.target.value;
        else if (e.target.id === 's-escena') { st.borrador.salas[st.sala].escena = e.target.value; pintarEdicion('#s-escena'); }
      });

      pintarLista();
      return {
        tecla: function (e) {
          if (e.key !== 'Escape') return;
          if (st.vista === 'lista') EA.ui.ir('menu'); else salirEdicion();
        },
        salir: function () { EA.editor = null; }
      };
    }
  };
})(window.EA = window.EA || {});
