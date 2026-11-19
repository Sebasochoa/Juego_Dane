/* Carga los scripts clásicos del núcleo en Node (dejan todo en globalThis.EA). */
'use strict';
const path = require('node:path');
const raiz = path.join(__dirname, '..');
['js/config.js', 'js/core/util.js', 'js/core/escenas.js', 'js/core/presets.js', 'js/core/juego.js', 'js/core/historia.js', 'data/presets-ejemplo.js']
  .forEach((f) => require(path.join(raiz, f)));

/** Copia de un preset de ejemplo por su id. */
globalThis.EA.ejemploPorId = (id) => {
  const p = globalThis.EA.PRESETS_EJEMPLO.find((x) => x.id === id);
  if (!p) throw new Error('No existe el ejemplo ' + id);
  return JSON.parse(JSON.stringify(p));
};
module.exports = globalThis.EA;
