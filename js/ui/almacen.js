/* Persistencia en localStorage (con respaldo en memoria si el navegador la bloquea). */
(function (EA) {
  'use strict';
  // Las claves conservan el nombre original del proyecto para no perder los presets ya guardados.
  var CLAVE_PRESETS = 'apagon-aurora.presets.v1';
  var CLAVE_PREFS = 'apagon-aurora.prefs.v1';
  var CLAVE_EJEMPLOS = 'apagon-aurora.ejemplos.v1';
  // Ejemplos que ya venían en la primera versión (antes de existir CLAVE_EJEMPLOS).
  var EJEMPLOS_ORIGINALES = ['ejemplo-ciencias-basicas', 'plantilla-vacia'];
  var memoria = {};
  var disponible = true;

  function leer(clave) {
    try {
      var v = window.localStorage.getItem(clave);
      return v == null ? null : JSON.parse(v);
    } catch (e) {
      return Object.prototype.hasOwnProperty.call(memoria, clave) ? memoria[clave] : null;
    }
  }
  function guardar(clave, valor) {
    memoria[clave] = valor;
    try { window.localStorage.setItem(clave, JSON.stringify(valor)); return true; }
    catch (e) { disponible = false; return false; }
  }

  function ejemplos() {
    return EA.PRESETS_EJEMPLO.map(function (p) { return EA.presets.normalizarPreset(JSON.parse(JSON.stringify(p))); });
  }

  /** Presets guardados. La primera vez (y cuando el juego trae ejemplos nuevos) agrega los ejemplos. */
  function presets() {
    var lista = leer(CLAVE_PRESETS);
    var vistos = leer(CLAVE_EJEMPLOS);
    if (!Array.isArray(lista)) { lista = []; vistos = []; }
    else if (!Array.isArray(vistos)) vistos = EJEMPLOS_ORIGINALES.slice();
    lista = lista.map(EA.presets.normalizarPreset);
    var m = EA.presets.migrarEjemplos(lista, vistos, EA.PRESETS_EJEMPLO);
    if (m.cambios || !Array.isArray(leer(CLAVE_EJEMPLOS))) {
      guardar(CLAVE_PRESETS, m.lista);
      guardar(CLAVE_EJEMPLOS, m.vistos);
    }
    if (m.defecto) guardarPrefs({ preset: m.defecto });
    return m.lista;
  }
  function guardarPresets(lista) { return guardar(CLAVE_PRESETS, lista); }

  /** Vuelve a agregar los ejemplos en su versión original (reemplaza los que conserven su id). */
  function restaurarEjemplos() {
    var lista = presets();
    ejemplos().reverse().forEach(function (ej) {
      var i = lista.findIndex(function (p) { return p.id === ej.id; });
      if (i >= 0) lista[i] = ej;
      else {
        ej.nombre = EA.presets.nombreLibre(ej.nombre, lista.map(function (p) { return p.nombre; }));
        lista.unshift(ej);
      }
    });
    guardarPresets(lista);
    guardar(CLAVE_EJEMPLOS, EA.PRESETS_EJEMPLO.map(function (p) { return p.id; }));
    return lista;
  }

  var PREFS_DEFECTO = {
    volumen: 0.7, silencio: false, grado: 'todos', preset: '',
    modo: 'turnos', numEquipos: 2, equipos: [],
    temporizador: false, segundos: EA.CONFIG.TEMPORIZADOR_DEFECTO,
    limite: true, minutos: EA.CONFIG.LIMITE_DEFECTO,
    historia: true
  };
  function prefs() {
    var p = leer(CLAVE_PREFS) || {};
    var r = {};
    Object.keys(PREFS_DEFECTO).forEach(function (k) { r[k] = (typeof p[k] === typeof PREFS_DEFECTO[k]) ? p[k] : PREFS_DEFECTO[k]; });
    if (!Array.isArray(r.equipos)) r.equipos = [];
    if (r.modo !== 'solo') r.modo = 'turnos';
    return r;
  }
  function guardarPrefs(cambios) {
    var p = prefs();
    Object.keys(cambios).forEach(function (k) { p[k] = cambios[k]; });
    guardar(CLAVE_PREFS, p);
    return p;
  }

  EA.almacen = {
    presets: presets, guardarPresets: guardarPresets, restaurarEjemplos: restaurarEjemplos,
    prefs: prefs, guardarPrefs: guardarPrefs,
    persistente: function () { return disponible; }
  };
})(window.EA = window.EA || {});
