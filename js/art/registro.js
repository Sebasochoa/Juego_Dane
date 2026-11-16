/*
 * REGISTRO CENTRAL DE ARTE — reemplazos del docente.
 *
 * Para cambiar un objeto o un fondo por su propia imagen, agregue una línea a
 * EA.ARTE_REEMPLAZOS con el identificador del componente y la ruta de su archivo
 * (PNG, JPG o SVG, relativa a index.html) o el código SVG completo como texto.
 * No hace falta tocar nada más: la posición, el tamaño y los clics se conservan.
 *
 * La imagen se ajusta a la caja nominal del componente (ancho × alto). Para ver
 * todos los identificadores y sus tamaños, abra:  index.html?galeria
 *
 * Fondos (1920 × 1080):
 *   fondo.quimica   fondo.biologia   fondo.fisica   fondo.control   fondo.invernadero
 * Interfaz:
 *   ui.candado (100×120)   ui.puerta (300×560)   ui.robot (200×240)
 * Objetos del inventario:
 *   obj.limon   obj.electrodos   obj.pila-limon   obj.portaobjetos   obj.tinte   obj.muestra-tenida
 *
 * Ejemplos:
 *   'fondo.quimica': 'arte/mi-laboratorio.png',
 *   'lab.matraz':    'arte/matraz.svg',
 *   'deco.reloj':    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90"><circle cx="45" cy="45" r="40" fill="#F4C03E"/></svg>',
 *
 * Nota: si reemplaza «ui.candado» o «ui.puerta» por una imagen fija, se pierden sus
 * estados animados (abierto, error). Los fondos y objetos se reemplazan sin efectos secundarios.
 */
(function (EA) {
  'use strict';
  EA.ARTE_REEMPLAZOS = {
    // 'fondo.quimica': 'arte/mi-laboratorio.png',
  };
})(window.EA = window.EA || {});
