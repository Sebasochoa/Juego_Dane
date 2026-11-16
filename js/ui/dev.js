/*
 * Vistas de desarrollo (no forman parte del juego):
 *   index.html?galeria                     -> todos los componentes de arte con su id y tamaño
 *   index.html?captura=escena:quimica      -> una escena sola (admite &abiertos=N &hot=1)
 */
(function (EA) {
  'use strict';
  var A = EA.arte, esc = EA.util.escapar;
  EA.pantallas = EA.pantallas || {};

  EA.pantallas.galeria = {
    montar: function (el) {
      var ids = Object.keys(A.REG).filter(function (id) { return id.indexOf('fondo.') !== 0; }).sort();
      el.innerHTML = '<div class="galeria">' + ids.map(function (id) {
        var c = A.REG[id];
        return '<figure title="' + esc(c.nota) + '">' + A.suelto(id, {}) + '<figcaption>' + esc(id) + '<br>' + c.w + '×' + c.h + '</figcaption></figure>';
      }).join('') + '</div>';
    }
  };

  EA.pantallas.captura = {
    montar: function (el, p) {
      var m = /captura=escena:([a-z]+)/.exec(p.q);
      var ab = /abiertos=(\d+)/.exec(p.q);
      var id = m && A.ESCENAS[m[1]] ? m[1] : 'quimica';
      var v = A.vistaDemo(id, ab ? +ab[1] : 0);
      if (/usado=1/.test(p.q)) { v.usado = true; v.candados.forEach(function (c) { c.oculto = false; }); v.recogidos = Object.keys(A.ESCENAS[id].objetos || {}); }
      if (/puerta=1/.test(p.q)) v.puertaAbierta = true;
      el.innerHTML = A.componer(id, v);
      document.getElementById('utilidades').style.display = 'none';
      if (/hot=1/.test(p.q)) {
        var st = document.createElement('style');
        st.textContent = '.hot-marco{stroke-opacity:.9!important}';
        el.appendChild(st);
      }
    }
  };
})(window.EA = window.EA || {});
