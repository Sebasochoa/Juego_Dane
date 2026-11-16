/* Configuración central del juego. Cambia aquí los puntajes y límites. */
(function (EA) {
  'use strict';

  EA.CONFIG = {
    NOMBRE_JUEGO: 'Apagón en el Aurora',
    ESQUEMA_PRESET: 1,

    // Puntaje
    PUNTOS_PRIMER_INTENTO: 100,
    PUNTOS_TRAS_PISTA: 50,
    PUNTOS_TRAS_EXPLICACION: 0,
    BONO_SALA_COMPLETADA: 50,
    BONO_ESCAPAR_PRIMERO: 200,
    BONO_RAPIDEZ_MAX: 25, // solo con temporizador; proporcional al tiempo restante

    // Reglas
    FALLOS_PARA_EXPLICACION: 2,
    EQUIPOS_MIN: 2,
    EQUIPOS_MAX: 4,
    SALAS_MIN: 2,
    SALAS_MAX: 5,
    ALTERNATIVAS_MIN: 2,
    ALTERNATIVAS_MAX: 5,
    ALTERNATIVAS_DEFECTO: 4,

    // Temporizador por turno (segundos)
    TEMPORIZADOR_MIN: 30,
    TEMPORIZADOR_MAX: 180,
    TEMPORIZADOR_PASO: 15,
    TEMPORIZADOR_DEFECTO: 90,

    // Resumen
    REPASO_MAX: 5,

    // Imágenes embebidas en preguntas (bytes aproximados del archivo)
    IMAGEN_MAX_BYTES: 400000,

    // Equipos: color (variable de la paleta) + símbolo, para no depender solo del color
    COLORES_EQUIPO: [
      { id: 'coral', nombre: 'Coral', hex: '#E4574F' },
      { id: 'azul', nombre: 'Azul', hex: '#3D7DD8' },
      { id: 'verde', nombre: 'Verde', hex: '#4FB06A' },
      { id: 'amarillo', nombre: 'Amarillo', hex: '#F4C03E' },
      { id: 'violeta', nombre: 'Violeta', hex: '#9A7FE0' },
      { id: 'naranja', nombre: 'Naranja', hex: '#EE8A3C' }
    ],
    SIMBOLOS_EQUIPO: ['triangulo', 'circulo', 'cuadrado', 'rombo'],
    NOMBRES_EQUIPO: ['Equipo Protón', 'Equipo Neutrón', 'Equipo Electrón', 'Equipo Fotón']
  };
})(typeof window !== 'undefined' ? (window.EA = window.EA || {}) : (globalThis.EA = globalThis.EA || {}));
