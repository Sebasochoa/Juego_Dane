/* Persistencia en localStorage (con respaldo en memoria si el navegador la bloquea). */
(function (EA) {
  'use strict';
  var CLAVE_PRESETS = 'apagon-aurora.presets.v1';
  var CLAVE_PREFS = 'apagon-aurora.prefs.v1';
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

  function presets() {
    var lista = leer(CLAVE_PRESETS);
    if (!Array.isArray(lista)) {
      lista = ejemplos();
      guardar(CLAVE_PRESETS, lista);
    }
    return lista.map(EA.presets.normalizarPreset);
  }
  function guardarPresets(lista) { return guardar(CLAVE_PRESETS, lista); }

  /** Vuelve a agregar los ejemplos (reemplaza los que conserven su id original). */
  function restaurarEjemplos() {
    var lista = presets();
    ejemplos().forEach(function (ej) {
      var i = lista.findIndex(function (p) { return p.id === ej.id; });
      if (i >= 0) lista[i] = ej;
      else {
        ej.nombre = EA.presets.nombreLibre(ej.nombre, lista.map(function (p) { return p.nombre; }));
        lista.unshift(ej);
      }
    });
    guardarPresets(lista);
    return lista;
  }

  var PREFS_DEFECTO = { volumen: 0.7, silencio: false, grado: 'todos', preset: '', numEquipos: 2, equipos: [], temporizador: false, segundos: EA.CONFIG.TEMPORIZADOR_DEFECTO };
  function prefs() {
    var p = leer(CLAVE_PREFS) || {};
    var r = {};
    Object.keys(PREFS_DEFECTO).forEach(function (k) { r[k] = (typeof p[k] === typeof PREFS_DEFECTO[k]) ? p[k] : PREFS_DEFECTO[k]; });
    if (!Array.isArray(r.equipos)) r.equipos = [];
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
