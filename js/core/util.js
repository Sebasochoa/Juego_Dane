/* Utilidades puras: azar con semilla y texto seguro con notación científica. */
(function (EA) {
  'use strict';

  /** Generador pseudoaleatorio determinista (mulberry32). */
  function crearRng(semilla) {
    var a = (semilla >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Baraja una copia del arreglo (Fisher-Yates). */
  function barajar(lista, rng) {
    var r = lista.slice();
    for (var i = r.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = r[i]; r[i] = r[j]; r[j] = tmp;
    }
    return r;
  }

  function indices(n) {
    var r = [];
    for (var i = 0; i < n; i++) r.push(i);
    return r;
  }

  var MAPA_HTML = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' };

  /** Escapa texto para insertarlo en HTML o en atributos. */
  function escapar(texto) {
    return String(texto == null ? '' : texto).replace(/[&<>"'`]/g, function (c) { return MAPA_HTML[c]; });
  }

  /**
   * Convierte notación simple a HTML seguro:
   *   H_2O -> H<sub>2</sub>O      m/s^2 -> m/s<sup>2</sup>
   *   SO_4^{2-} -> SO<sub>4</sub><sup>2-</sup>     Na^+ -> Na<sup>+</sup>
   * Primero se escapa todo; solo se generan etiquetas sub/sup.
   */
  function formatear(texto) {
    var s = escapar(texto);
    s = s.replace(/_(\{([^{}]*)\}|(\d+))/g, function (_, __, llaves, num) {
      return '<sub>' + (llaves != null ? llaves : num) + '</sub>';
    });
    s = s.replace(/\^(\{([^{}]*)\}|([+\-−]?\d+[+\-−]?)|([+\-−]))/g, function (_, __, llaves, num, signo) {
      return '<sup>' + (llaves != null ? llaves : (num != null ? num : signo)) + '</sup>';
    });
    return s.replace(/\n/g, '<br>');
  }

  /** Texto plano equivalente (para aria-label y CSV): H_2O -> H2O. */
  function plano(texto) {
    return String(texto == null ? '' : texto)
      .replace(/_\{([^{}]*)\}/g, '$1').replace(/_(\d+)/g, '$1')
      .replace(/\^\{([^{}]*)\}/g, '$1').replace(/\^([+\-−]?\d+[+\-−]?|[+\-−])/g, '$1');
  }

  function formatoTiempo(segundos) {
    var s = Math.max(0, Math.round(segundos));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  EA.util = {
    crearRng: crearRng, barajar: barajar, indices: indices,
    escapar: escapar, formatear: formatear, plano: plano, formatoTiempo: formatoTiempo
  };
})(typeof window !== 'undefined' ? (window.EA = window.EA || {}) : (globalThis.EA = globalThis.EA || {}));
