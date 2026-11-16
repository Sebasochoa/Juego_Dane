/*
 * Renderiza cada escena y las pantallas principales a PNG en capturas/ para revisión visual.
 * Uso: node tools/capturas.js [escena ...]
 */
'use strict';
const path = require('node:path');
const { abrir, urlJuego, RAIZ } = require('./cdp.js');

(async () => {
  const pedidas = process.argv.slice(2);
  const pag = await abrir();
  const dir = path.join(RAIZ, 'capturas');
  try {
    await pag.ir(urlJuego('?galeria'));
    const escenas = await pag.evaluar('Object.keys(EA.arte.ESCENAS)');
    const lista = pedidas.length ? pedidas.filter((p) => escenas.includes(p) || ['galeria', 'menu'].includes(p)) : escenas.concat(['galeria', 'menu']);
    for (const id of lista) {
      if (id === 'galeria') {
        await pag.ir(urlJuego('?galeria'));
        const alto = await pag.evaluar('document.querySelector(".galeria").scrollHeight');
        const paginas = Math.ceil(alto / 980);
        for (let i = 0; i < paginas; i++) {
          await pag.evaluar('document.querySelector(".galeria").scrollTop=' + (i * 980));
          await pag.esperar(150);
          await pag.captura(path.join(dir, 'galeria-' + (i + 1) + '.png'));
        }
      } else if (id === 'menu') {
        await pag.ir(urlJuego(''));
        await pag.esperar(300);
        await pag.captura(path.join(dir, 'menu.png'));
      } else {
        await pag.ir(urlJuego('?captura=escena:' + id));
        await pag.esperar(300);
        await pag.captura(path.join(dir, 'escena-' + id + '.png'));
        await pag.ir(urlJuego('?captura=escena:' + id + '&hot=1&usado=1&abiertos=2'));
        await pag.esperar(300);
        await pag.captura(path.join(dir, 'escena-' + id + '-hot.png'));
      }
      console.log('ok', id);
    }
    if (pag.errores.length || pag.consola.length) {
      console.log('ERRORES EN LA PÁGINA:\n' + pag.errores.concat(pag.consola).join('\n'));
      process.exitCode = 1;
    }
  } finally {
    await pag.cerrar();
  }
})().catch((e) => { console.error(e); process.exit(1); });
