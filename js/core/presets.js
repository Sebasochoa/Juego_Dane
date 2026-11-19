/* Lógica pura de presets: normalización, validación, importación y exportación. */
(function (EA) {
  'use strict';
  var CFG = EA.CONFIG;

  var GRADOS = [
    { id: '1', nombre: '1.° de secundaria' },
    { id: '2', nombre: '2.° de secundaria' },
    { id: '3', nombre: '3.° de secundaria' },
    { id: '4', nombre: '4.° de secundaria' },
    { id: '5', nombre: '5.° de secundaria' },
    { id: 'mixto', nombre: 'Mixto' }
  ];
  var RAMAS = [
    { id: '', nombre: 'Sin rama' },
    { id: 'biologia', nombre: 'Biología' },
    { id: 'quimica', nombre: 'Química' },
    { id: 'fisica', nombre: 'Física' }
  ];
  // Identificador interno de los archivos exportados: se conserva para seguir leyendo los ya exportados.
  var FORMATO = 'apagon-aurora-presets';

  function texto(v, max) {
    var s = (typeof v === 'string' || typeof v === 'number') ? String(v) : '';
    s = s.replace(/\r\n?/g, '\n').trim();
    return max && s.length > max ? s.slice(0, max) : s;
  }

  function nombreGrado(id) {
    for (var i = 0; i < GRADOS.length; i++) if (GRADOS[i].id === id) return GRADOS[i].nombre;
    return 'Mixto';
  }
  function nombreRama(id) {
    for (var i = 0; i < RAMAS.length; i++) if (RAMAS[i].id === id) return RAMAS[i].nombre;
    return '';
  }

  /**
   * Una imagen de pregunta solo puede ser un data URI de imagen o una ruta relativa
   * local (sin esquema). Así no hay llamadas de red ni URLs peligrosas.
   */
  function imagenValida(src) {
    if (typeof src !== 'string' || !src) return false;
    if (/^data:image\/(png|jpeg|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=\s]+$/.test(src)) return true;
    if (/^[a-z][a-z0-9+.\-]*:/i.test(src) || /^\/\//.test(src) || /^[\\/]/.test(src)) return false;
    return /^[\w\-./ áéíóúñÁÉÍÓÚÑ]+\.(png|jpe?g|gif|webp|svg)$/i.test(src) && src.indexOf('..') === -1;
  }

  function nuevoId() {
    return 'p-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e9).toString(36);
  }

  function preguntaVacia() {
    var alts = [];
    for (var i = 0; i < CFG.ALTERNATIVAS_DEFECTO; i++) alts.push('');
    return { enunciado: '', alternativas: alts, correcta: 0, pista: '', explicacion: '', rama: '', imagen: '' };
  }

  /** Deja solo los campos conocidos y con los tipos correctos. Nunca lanza error. */
  function normalizarPregunta(q) {
    q = (q && typeof q === 'object') ? q : {};
    var alts = Array.isArray(q.alternativas) ? q.alternativas.map(function (a) { return texto(a, 400); }) : [];
    var correcta = (typeof q.correcta === 'number' && isFinite(q.correcta)) ? Math.floor(q.correcta) : -1;
    var rama = texto(q.rama, 20).toLowerCase();
    if (!RAMAS.some(function (r) { return r.id === rama; })) rama = '';
    var imagen = typeof q.imagen === 'string' ? q.imagen.trim() : '';
    return {
      enunciado: texto(q.enunciado, 1200),
      alternativas: alts,
      correcta: correcta,
      pista: texto(q.pista, 800),
      explicacion: texto(q.explicacion, 1500),
      rama: rama,
      imagen: imagen
    };
  }

  function normalizarPreset(p) {
    p = (p && typeof p === 'object') ? p : {};
    var grado = texto(p.grado, 10).toLowerCase();
    if (!GRADOS.some(function (g) { return g.id === grado; })) grado = 'mixto';
    var salas = Array.isArray(p.salas) ? p.salas : [];
    return {
      esquema: CFG.ESQUEMA_PRESET,
      id: texto(p.id, 60) || nuevoId(),
      nombre: texto(p.nombre, 80),
      grado: grado,
      descripcion: texto(p.descripcion, 400),
      salas: salas.map(function (s) {
        s = (s && typeof s === 'object') ? s : {};
        return {
          escena: texto(s.escena, 30),
          preguntas: (Array.isArray(s.preguntas) ? s.preguntas : []).map(normalizarPregunta)
        };
      })
    };
  }

  function validarPregunta(q) {
    var e = [];
    if (!q.enunciado) e.push('El enunciado no puede estar vacío.');
    var n = q.alternativas.length;
    if (n < CFG.ALTERNATIVAS_MIN || n > CFG.ALTERNATIVAS_MAX) {
      e.push('Debe tener entre ' + CFG.ALTERNATIVAS_MIN + ' y ' + CFG.ALTERNATIVAS_MAX + ' alternativas (tiene ' + n + ').');
    }
    if (q.alternativas.some(function (a) { return !a; })) e.push('Hay alternativas vacías.');
    var vistas = {};
    var duplicada = false;
    q.alternativas.forEach(function (a) {
      var k = a.toLowerCase().replace(/\s+/g, ' ');
      if (k && vistas[k]) duplicada = true;
      vistas[k] = true;
    });
    if (duplicada) e.push('Hay alternativas duplicadas.');
    if (!(q.correcta >= 0 && q.correcta < n)) e.push('Debe marcar exactamente una alternativa correcta.');
    if (q.imagen && !imagenValida(q.imagen)) {
      e.push('La imagen no es válida: use un archivo PNG, JPG, GIF, WebP o SVG cargado desde el editor, o una ruta relativa (por ejemplo «img/celula.png»).');
    }
    return e;
  }

  /**
   * Valida un preset ya normalizado.
   * Devuelve { ok, errores: [{ sala, pregunta, mensaje }] } (sala/pregunta en base 0 o null).
   */
  function validarPreset(p) {
    var errores = [];
    function err(mensaje, sala, pregunta) {
      errores.push({ mensaje: mensaje, sala: sala == null ? null : sala, pregunta: pregunta == null ? null : pregunta });
    }
    if (!p.nombre) err('El preset necesita un nombre.');
    if (p.salas.length < CFG.SALAS_MIN || p.salas.length > CFG.SALAS_MAX) {
      err('El preset debe tener entre ' + CFG.SALAS_MIN + ' y ' + CFG.SALAS_MAX + ' salas (tiene ' + p.salas.length + ').');
    }
    p.salas.forEach(function (s, i) {
      var esc = EA.ESCENAS[s.escena];
      if (!esc) { err('Sala ' + (i + 1) + ': el escenario «' + s.escena + '» no existe.', i); return; }
      var minimo = esc.candados.length;
      if (s.preguntas.length < minimo) {
        err('Sala ' + (i + 1) + ' (' + esc.nombre + '): necesita al menos ' + minimo + ' preguntas, una por candado (tiene ' + s.preguntas.length + ').', i);
      }
      s.preguntas.forEach(function (q, j) {
        validarPregunta(q).forEach(function (m) {
          err('Sala ' + (i + 1) + ', pregunta ' + (j + 1) + ': ' + m, i, j);
        });
      });
    });
    return { ok: errores.length === 0, errores: errores };
  }

  /** Devuelve un nombre que no choque con los existentes: «Nombre (2)». */
  function nombreLibre(nombre, existentes) {
    var usados = {};
    existentes.forEach(function (n) { usados[n.toLowerCase()] = true; });
    if (!usados[nombre.toLowerCase()]) return nombre;
    var base = nombre.replace(/\s*\(\d+\)$/, '');
    for (var i = 2; i < 1000; i++) {
      var c = base + ' (' + i + ')';
      if (!usados[c.toLowerCase()]) return c;
    }
    return base + ' (' + Date.now() + ')';
  }

  function exportar(presets) {
    return {
      formato: FORMATO,
      esquema: CFG.ESQUEMA_PRESET,
      exportado: new Date().toISOString(),
      presets: presets.map(function (p) { return normalizarPreset(p); })
    };
  }

  /**
   * Lee el texto de un archivo JSON exportado.
   * Devuelve { ok, error, validos: [preset], rechazados: [{ nombre, errores }] }.
   */
  function leerImportacion(textoJson) {
    var datos;
    try { datos = JSON.parse(textoJson); }
    catch (e) { return { ok: false, error: 'El archivo no es un JSON válido.', validos: [], rechazados: [] }; }
    if (!datos || typeof datos !== 'object') {
      return { ok: false, error: 'El archivo no contiene presets.', validos: [], rechazados: [] };
    }
    var lista;
    if (Array.isArray(datos)) lista = datos;
    else if (Array.isArray(datos.presets)) {
      if (datos.formato && datos.formato !== FORMATO) {
        return { ok: false, error: 'El archivo no es de este juego (formato «' + texto(datos.formato, 40) + '»).', validos: [], rechazados: [] };
      }
      lista = datos.presets;
    } else if (Array.isArray(datos.salas)) lista = [datos];
    else return { ok: false, error: 'El archivo no contiene presets reconocibles.', validos: [], rechazados: [] };

    var esquema = (typeof datos.esquema === 'number') ? datos.esquema : 1;
    if (esquema > CFG.ESQUEMA_PRESET) {
      return { ok: false, error: 'El archivo fue creado con una versión más nueva del juego (esquema ' + esquema + '). Actualice el juego para importarlo.', validos: [], rechazados: [] };
    }
    if (!lista.length) return { ok: false, error: 'El archivo no contiene ningún preset.', validos: [], rechazados: [] };

    var validos = [], rechazados = [];
    lista.forEach(function (crudo, i) {
      if (crudo && typeof crudo.esquema === 'number' && crudo.esquema > CFG.ESQUEMA_PRESET) {
        rechazados.push({ nombre: texto(crudo.nombre, 80) || ('Preset ' + (i + 1)), errores: ['Fue creado con una versión más nueva del juego.'] });
        return;
      }
      var p = normalizarPreset(crudo);
      var v = validarPreset(p);
      if (v.ok) validos.push(p);
      else rechazados.push({ nombre: p.nombre || ('Preset ' + (i + 1)), errores: v.errores.map(function (x) { return x.mensaje; }) });
    });
    return { ok: validos.length > 0, error: validos.length ? '' : 'Ningún preset del archivo pasó la validación.', validos: validos, rechazados: rechazados };
  }

  /**
   * Fusiona presets importados con los existentes.
   * modo: 'renombrar' (conserva ambos), 'reemplazar' (pisa el de igual nombre) u 'omitir'.
   * Devuelve { presets, agregados, reemplazados, omitidos }.
   */
  function fusionar(existentes, nuevos, modo) {
    var res = existentes.slice();
    var agregados = 0, reemplazados = 0, omitidos = 0;
    nuevos.forEach(function (n) {
      var p = normalizarPreset(n);
      var idx = -1;
      for (var i = 0; i < res.length; i++) {
        if (res[i].nombre.toLowerCase() === p.nombre.toLowerCase()) { idx = i; break; }
      }
      if (idx >= 0 && modo === 'omitir') { omitidos++; return; }
      if (idx >= 0 && modo === 'reemplazar') { p.id = res[idx].id; res[idx] = p; reemplazados++; return; }
      if (idx >= 0) p.nombre = nombreLibre(p.nombre, res.map(function (x) { return x.nombre; }));
      if (res.some(function (x) { return x.id === p.id; })) p.id = nuevoId();
      res.push(p);
      agregados++;
    });
    return { presets: res, agregados: agregados, reemplazados: reemplazados, omitidos: omitidos };
  }

  function conflictos(existentes, nuevos) {
    var nombres = {};
    existentes.forEach(function (p) { nombres[p.nombre.toLowerCase()] = true; });
    return nuevos.filter(function (p) { return nombres[p.nombre.toLowerCase()]; }).map(function (p) { return p.nombre; });
  }

  function duplicar(preset, existentes) {
    var p = normalizarPreset(JSON.parse(JSON.stringify(preset)));
    p.id = nuevoId();
    p.nombre = nombreLibre((p.nombre || 'Preset') + ' (copia)', existentes.map(function (x) { return x.nombre; }));
    return p;
  }

  /**
   * Agrega a la lista guardada los ejemplos que este navegador todavía no conoce.
   * - vistos: ids de ejemplos ya ofrecidos; si el docente borró uno, no vuelve a aparecer.
   * - Un ejemplo con «reemplaza» sustituye, en su mismo lugar, al preset guardado con alguno de esos ids.
   * - Un ejemplo con «defecto» se agrega al principio y se informa para dejarlo elegido.
   * No modifica los argumentos. Devuelve { lista, vistos, defecto, cambios }.
   */
  function migrarEjemplos(lista, vistos, ejemplos) {
    lista = lista.slice();
    vistos = vistos.slice();
    var defecto = null, cambios = 0;
    ejemplos.forEach(function (crudo) {
      if (vistos.indexOf(crudo.id) >= 0) return;
      vistos.push(crudo.id);
      cambios++;
      if (lista.some(function (p) { return p.id === crudo.id; })) return; // ya estaba: se respeta tal cual
      var nuevo = normalizarPreset(JSON.parse(JSON.stringify(crudo)));
      var reemplaza = Array.isArray(crudo.reemplaza) ? crudo.reemplaza : [];
      var idx = -1;
      for (var i = 0; i < lista.length; i++) if (reemplaza.indexOf(lista[i].id) >= 0) { idx = i; break; }
      var otros = lista.filter(function (p, j) { return j !== idx; }).map(function (p) { return p.nombre; });
      nuevo.nombre = nombreLibre(nuevo.nombre, otros);
      if (idx >= 0) lista[idx] = nuevo;
      else if (crudo.defecto) lista.unshift(nuevo);
      else lista.push(nuevo);
      if (crudo.defecto) defecto = nuevo.id;
    });
    return { lista: lista, vistos: vistos, defecto: defecto, cambios: cambios };
  }

  function filtrarPorGrado(presets, grado) {
    if (!grado || grado === 'todos') return presets.slice();
    return presets.filter(function (p) { return p.grado === grado; });
  }

  EA.presets = {
    GRADOS: GRADOS, RAMAS: RAMAS, FORMATO: FORMATO,
    nombreGrado: nombreGrado, nombreRama: nombreRama, imagenValida: imagenValida,
    nuevoId: nuevoId, preguntaVacia: preguntaVacia,
    normalizarPregunta: normalizarPregunta, normalizarPreset: normalizarPreset,
    validarPregunta: validarPregunta, validarPreset: validarPreset,
    nombreLibre: nombreLibre, exportar: exportar, leerImportacion: leerImportacion,
    fusionar: fusionar, conflictos: conflictos, duplicar: duplicar, filtrarPorGrado: filtrarPorGrado,
    migrarEjemplos: migrarEjemplos
  };
})(typeof window !== 'undefined' ? (window.EA = window.EA || {}) : (globalThis.EA = globalThis.EA || {}));
