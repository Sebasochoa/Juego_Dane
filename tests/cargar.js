/* Carga los scripts clásicos del núcleo en Node (dejan todo en globalThis.EA). */
'use strict';
const path = require('node:path');
const raiz = path.join(__dirname, '..');
['js/config.js', 'js/core/util.js', 'js/core/escenas.js', 'js/core/presets.js', 'js/core/juego.js', 'data/presets-ejemplo.js']
  .forEach((f) => require(path.join(raiz, f)));
module.exports = globalThis.EA;
