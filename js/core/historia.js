/*
 * Historia del juego: textos de la introducción y del final (lógica pura, sin DOM).
 * Cada panel es { arte, opciones, titulo, texto }. «arte» es un id del registro de arte
 * (js/art/historia.js). El texto es plano: la interfaz lo escapa antes de mostrarlo.
 */
(function (EA) {
  'use strict';
  var CFG = EA.CONFIG;

  /** «A», «A y B», «A, B y C». */
  function enumerar(lista) {
    if (lista.length <= 1) return lista.join('');
    return lista.slice(0, -1).join(', ') + ' y ' + lista[lista.length - 1];
  }

  function minutos(segundos) {
    var m = Math.round(segundos / 60);
    return m + (m === 1 ? ' minuto' : ' minutos');
  }

  /**
   * Paneles de la introducción.
   * ctx: { salas: ['quimica', ...] (escenas del preset, en orden), modo: 'turnos' | 'solo', limite: segundos }
   */
  function intro(ctx) {
    var doc = CFG.CIENTIFICO;
    var nombres = ctx.salas.map(function (id) { return EA.ESCENAS[id].nombre; });
    var recorrido = 'Para salir hay que atravesar ' + ctx.salas.length + ' salas: ' + enumerar(nombres) + '.';
    var mision;
    if (ctx.modo === 'solo') {
      mision = recorrido + ' En cada sala, abran todos los candados para que se abra la puerta. '
        + (ctx.limite
          ? 'La energía de respaldo dura ' + minutos(ctx.limite) + ': ¡escapen antes de que se acabe el tiempo!'
          : '¡Escapen antes de que vuelva el ' + doc + '!');
    } else {
      mision = recorrido + ' Cada equipo buscará su propia salida, por turnos: abran todos los candados de cada sala '
        + 'para que se abra la puerta. ¡El primer equipo en escapar gana!';
    }
    return [
      {
        arte: 'hist.exterior', titulo: 'Una puerta entreabierta',
        texto: 'Todo el barrio habla del ' + doc + ', un científico brillante… y bastante despistado. '
          + 'Esta tarde dejó entreabierta la puerta de su laboratorio, y ustedes no pudieron resistir la curiosidad.'
      },
      {
        arte: 'hist.apagon', titulo: '¡Apagón!',
        texto: 'Estaban mirando sus inventos cuando, de pronto, ¡clac!: se cortó la luz. '
          + 'El sistema de seguridad se activó y cerró todas las puertas con candados electrónicos.'
      },
      {
        arte: 'hist.volti', titulo: 'Volti despierta',
        texto: 'Con la energía de respaldo se encendió Volti, el robot asistente del doctor: «Estos candados solo se abren '
          + 'respondiendo preguntas de ciencias. Exploren cada sala y, si se traban, pídanme ayuda».'
      },
      { arte: 'hist.mapa', opciones: { salas: ctx.salas }, titulo: 'La misión', texto: mision }
    ];
  }

  /**
   * Paneles del final. r = EA.juego.resumen(estado).
   * Si la partida la terminó el docente no hay historia: se va directo a los resultados.
   */
  function final(r) {
    if (!r.motivoFin || r.motivoFin === 'docente') return [];
    var doc = CFG.CIENTIFICO;
    var nota = {
      arte: 'hist.nota', titulo: 'Una nota junto a la salida',
      texto: 'Afuera los esperaba una nota: «Entrar sin permiso no estuvo bien… pero resolver todos mis candados fue brillante. '
        + 'Los espero el lunes como ayudantes del laboratorio. — ' + CFG.CIENTIFICO_FIRMA + '».'
    };
    if (r.modo === 'solo') {
      var eq = r.equipos[0];
      if (eq.escapo) {
        return [
          {
            arte: 'hist.salida', opciones: { celebran: true }, titulo: '¡Lo lograron!',
            texto: 'La última puerta se abrió y la luz del amanecer entró al laboratorio. ' + eq.nombre + ' escapó con '
              + eq.puntaje + ' puntos.'
          },
          nota
        ];
      }
      return [
        {
          arte: 'hist.sinEnergia', titulo: 'Se acabó la energía',
          texto: 'La batería de respaldo llegó a cero y Volti entró en modo de ahorro… Alcanzaron a abrir '
            + eq.candadosAbiertos + ' de ' + eq.candadosTotales + ' candados.'
        },
        {
          arte: 'hist.salida', opciones: { celebran: false }, titulo: 'El regreso del doctor',
          texto: 'Al amanecer, el ' + doc + ' volvió y abrió las puertas: «¡Estuvieron muy cerca! '
            + 'Vuelvan cuando quieran a intentarlo de nuevo».'
        }
      ];
    }
    var primero = r.equipos.filter(function (e) { return e.ordenEscape === 1; })[0];
    return [
      {
        arte: 'hist.salida', opciones: { celebran: true }, titulo: '¡Libres!',
        texto: 'La última puerta se abrió y la luz del amanecer entró al laboratorio. '
          + (primero ? primero.nombre + ' fue el primer equipo en escapar' + (r.equipos.length > 1 ? ' y, al final, todos lograron salir.' : '.') : '')
      },
      nota
    ];
  }

  EA.historia = { intro: intro, final: final, enumerar: enumerar, minutos: minutos };
})(typeof window !== 'undefined' ? (window.EA = window.EA || {}) : (globalThis.EA = globalThis.EA || {}));
