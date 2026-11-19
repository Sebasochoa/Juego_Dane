/*
 * Auditoría de diseño (herramienta de desarrollo). Se ejecuta DENTRO de la página y devuelve
 * la lista de problemas de la pantalla visible:
 *   - controles o textos que se salen del lienzo (o de su contenedor con desplazamiento);
 *   - contenedores con desplazamiento horizontal;
 *   - texto que desborda su propia caja (salvo los recortes intencionales con «…»);
 *   - botones visibles que no se pueden pulsar porque otro elemento los tapa.
 * Uso: const problemas = await pag.evaluar(AUDITORIA);
 */
'use strict';

function auditar() {
  var problemas = [];
  var lienzo = document.getElementById('escenario').getBoundingClientRect();
  var velos = document.querySelectorAll('#capa-modal .velo');
  var modal = velos.length ? velos[velos.length - 1] : null; // el diálogo de más arriba

  function visible(el) {
    var r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      var cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
      if (n.hidden) return false;
    }
    return true;
  }
  function nombre(el) {
    var t = (el.getAttribute('aria-label') || el.textContent || el.value || '').replace(/\s+/g, ' ').trim().slice(0, 50);
    return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : '') + ' «' + t + '»';
  }
  /** Contenedor más cercano que recorta o desplaza su contenido. */
  function recortador(el) {
    for (var n = el.parentElement; n && n.id !== 'escenario'; n = n.parentElement) {
      var cs = getComputedStyle(n);
      if (/(auto|scroll|hidden|clip)/.test(cs.overflowX + ' ' + cs.overflowY)) return n;
    }
    return null;
  }
  function dentroDeSvg(el) { return !!el.closest('svg'); }

  // 1) Desplazamiento horizontal no deseado
  document.querySelectorAll('#escenario *').forEach(function (el) {
    if (!(el instanceof HTMLElement) || !visible(el)) return;
    var cs = getComputedStyle(el);
    if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 1) {
      problemas.push('Desplazamiento horizontal en ' + nombre(el) + ' (' + el.scrollWidth + ' > ' + el.clientWidth + ')');
    }
  });

  // 2) Controles y textos fuera de su lugar
  var sel = 'button, input, select, textarea, [role="button"], [role="radio"], h1, h2, h3, p, li, label, .chip, .opcion, .tarjeta, .dialogo, .panel';
  document.querySelectorAll('#escenario ' + sel.split(', ').join(', #escenario ')).forEach(function (el) {
    if (!visible(el) || dentroDeSvg(el) || el.closest('.menu-fondo')) return;
    var r = el.getBoundingClientRect();
    var cont = recortador(el);
    var rc = cont ? cont.getBoundingClientRect() : lienzo;
    var cs = cont ? getComputedStyle(cont) : null;
    var desplazaX = cs && /(auto|scroll)/.test(cs.overflowX);
    var desplazaY = cs && /(auto|scroll)/.test(cs.overflowY);
    if (!desplazaX && (r.left < rc.left - 2 || r.right > rc.right + 2)) {
      problemas.push('Se sale por el costado: ' + nombre(el) + ' [' + Math.round(r.left) + ' a ' + Math.round(r.right) + ' en un espacio de ' + Math.round(rc.left) + ' a ' + Math.round(rc.right) + ']');
    }
    if (!desplazaY && (r.top < rc.top - 2 || r.bottom > rc.bottom + 2)) {
      problemas.push('Se sale por arriba o por abajo: ' + nombre(el) + ' [' + Math.round(r.top) + ' a ' + Math.round(r.bottom) + ' en un espacio de ' + Math.round(rc.top) + ' a ' + Math.round(rc.bottom) + ']');
    }
    // Todo debe quedar dentro del lienzo de 16:9.
    if (r.right > lienzo.right + 2 || r.left < lienzo.left - 2 || (!desplazaY && (r.bottom > lienzo.bottom + 2 || r.top < lienzo.top - 2))) {
      problemas.push('Fuera del lienzo: ' + nombre(el));
    }
    // 3) Texto que desborda su propia caja (los recortes con «…» son intencionales)
    var ecs = getComputedStyle(el);
    if (/^(BUTTON|LABEL|H1|H2|H3|P)$/.test(el.tagName) || el.classList.contains('chip')) {
      if (ecs.textOverflow !== 'ellipsis' && ecs.overflowX === 'visible' && el.scrollWidth > el.clientWidth + 3 && el.clientWidth > 0) {
        problemas.push('El texto desborda su caja: ' + nombre(el) + ' (' + el.scrollWidth + ' > ' + el.clientWidth + ')');
      }
    }
  });

  // 4) Botones visibles que no se pueden pulsar
  document.querySelectorAll('#escenario button, #escenario [role="button"]').forEach(function (el) {
    if (!visible(el) || el.disabled || el.closest('[inert]') || el.closest('.menu-fondo')) return;
    if (dentroDeSvg(el)) return; // zonas de la escena: algunas se superponen a propósito (candado sobre un panel)
    if (modal && !modal.contains(el)) return; // detrás de un diálogo: es lo esperado
    var r = el.getBoundingClientRect();
    var cont = recortador(el);
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (cont) {
      var rc = cont.getBoundingClientRect();
      if (cy < rc.top || cy > rc.bottom || cx < rc.left || cx > rc.right) return; // desplazado fuera de la vista
    }
    if (cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight) {
      problemas.push('Botón fuera de la ventana: ' + nombre(el));
      return;
    }
    var arriba = document.elementFromPoint(cx, cy);
    if (!arriba || (arriba !== el && !el.contains(arriba) && !arriba.contains(el))) {
      problemas.push('Botón tapado: ' + nombre(el) + ' (encima: ' + (arriba ? nombre(arriba) : 'nada') + ')');
    }
  });
  return problemas;
}

module.exports = '(' + auditar.toString() + ')()';
