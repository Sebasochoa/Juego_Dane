(function (EA) {
  'use strict';
  EA.pantallas = EA.pantallas || {};
  EA.pantallas.editor = { montar: function (el) { el.innerHTML = '<div class="pagina"><h2>Editor de presets</h2></div>'; return { tecla: function (e) { if (e.key === 'Escape') EA.ui.ir('menu'); } }; } };
})(window.EA = window.EA || {});
