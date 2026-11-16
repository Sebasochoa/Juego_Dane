/*
 * Definición lógica de las escenas (sin dibujo): candados, puzzle de objetos y textos.
 * El arte de cada escena está en js/art/escenas.js y usa los mismos identificadores.
 */
(function (EA) {
  'use strict';

  EA.ESCENAS = {
    quimica: {
      id: 'quimica',
      nombre: 'Laboratorio de Química',
      acento: 'turquesa',
      intro: 'Los candados electrónicos se bloquearon con el apagón. Recalíbrenlos respondiendo bien.',
      candados: ['Armario de reactivos', 'Cajonera del mesón', 'Campana extractora', 'Panel de la puerta'],
      puzzle: {
        objetos: {
          limon: { nombre: 'Limón', desc: 'Un limón fresco. Su jugo es ácido: tiene iones que conducen la corriente.' },
          electrodos: { nombre: 'Electrodos con cables', desc: 'Una lámina de cobre y otra de zinc, cada una con su cable.' }
        },
        combinacion: ['limon', 'electrodos'],
        resultado: { id: 'pila-limon', nombre: 'Pila de limón', desc: 'Cobre + zinc + jugo ácido: una pila casera que entrega un poco de voltaje.' },
        usarEn: 'panel',
        revela: 3,
        alUsar: '¡Funciona! La pila de limón le dio energía al panel. Apareció un candado nuevo.',
        pistas: [
          'En esta sala hay dos objetos que pueden recoger: uno está sobre el mesón y el otro cuelga de la pared. Miren el cartel de la «pila casera».',
          'Un jugo ácido y dos metales distintos pueden producir electricidad. Combinen el limón con los electrodos en el inventario.',
          'El panel junto a la puerta está sin energía. Seleccionen la pila de limón y úsenla en el panel.'
        ]
      },
      examinar: {
        cartel: { nombre: 'Cartel «Pila casera»', texto: 'El cartel explica: dos metales distintos (cobre y zinc) clavados en una fruta ácida forman una pila. El ácido actúa como electrolito.' },
        tabla: { nombre: 'Tabla periódica', texto: 'La tabla periódica ordena los elementos por su número atómico. Alguien marcó el Cu y el Zn con un círculo.' },
        panel: { nombre: 'Panel de la puerta', texto: 'El panel está apagado: no le llega energía. Con un poco de voltaje bastaría para encenderlo.' }
      }
    },

    biologia: {
      id: 'biologia',
      nombre: 'Laboratorio de Biología',
      acento: 'verde',
      intro: 'Aquí todo sigue vivo, pero los candados no responden. Observen con atención.',
      candados: ['Base del modelo anatómico', 'Gabinete de muestras', 'Terrario', 'Monitor del microscopio'],
      puzzle: {
        objetos: {
          portaobjetos: { nombre: 'Portaobjetos con muestra', desc: 'Una capa finísima de cebolla. Sus células son casi transparentes: sin tinte apenas se distinguen.' },
          tinte: { nombre: 'Gotero de azul de metileno', desc: 'Un colorante que tiñe los núcleos de las células y las hace visibles.' }
        },
        combinacion: ['portaobjetos', 'tinte'],
        resultado: { id: 'muestra-tenida', nombre: 'Muestra teñida', desc: 'Ahora las células tienen contraste. Lista para el microscopio.' },
        usarEn: 'microscopio',
        revela: 3,
        alUsar: '¡Se ven las células! El monitor reconoció la muestra y activó su candado.',
        pistas: [
          'Hay dos objetos para recoger: uno está en el mesón, cerca del microscopio, y el otro en el estante.',
          'Las células de cebolla son casi transparentes. ¿Qué se usa para darles contraste? Combinen el portaobjetos con el gotero.',
          'La muestra ya está teñida. Selecciónenla y úsenla en el microscopio.'
        ]
      },
      examinar: {
        adn: { nombre: 'Cartel del ADN', texto: 'Una doble hélice: dos cadenas unidas por pares de bases. Aquí se guarda la información genética.' },
        microscopio: { nombre: 'Microscopio', texto: 'El microscopio está encendido, pero la platina está vacía. El monitor dice: «Sin muestra».' },
        cartelTincion: { nombre: 'Nota en la pared', texto: 'La nota dice: «Recuerda teñir la muestra. Sin colorante, las células casi no se ven».' }
      }
    },

    fisica: {
      id: 'fisica',
      nombre: 'Taller de Física',
      acento: 'naranja',
      intro: 'Péndulos, engranajes y circuitos. Todo se mueve, menos la puerta.',
      candados: ['Caja de herramientas', 'Tablero de circuitos', 'Generador electrostático'],
      puzzle: null,
      examinar: {
        pendulo: { nombre: 'Péndulo', texto: 'El péndulo va y viene sin parar. Su período depende del largo de la cuerda, no de la masa que cuelga.' },
        pizarra: { nombre: 'Pizarra', texto: 'En la pizarra: F = m · a, y el dibujo de una parábola. Alguien estudiaba el lanzamiento de proyectiles.' },
        plano: { nombre: 'Plano inclinado', texto: 'Un carrito sobre un plano inclinado. Con una rampa se necesita menos fuerza, aunque se recorre más distancia.' }
      }
    },

    control: {
      id: 'control',
      nombre: 'Sala de Control',
      acento: 'violeta',
      intro: 'Desde aquí se maneja todo el instituto. Las pantallas funcionan con energía de emergencia.',
      candados: ['Bastidor de servidores', 'Consola principal', 'Caja de llaves', 'Terminal de acceso'],
      puzzle: null,
      examinar: {
        mapa: { nombre: 'Mapa del instituto', texto: 'El mapa muestra las salas del Instituto Aurora. Las puertas bloqueadas parpadean en rojo.' },
        pantalla: { nombre: 'Monitor de energía', texto: 'La gráfica de energía cayó de golpe durante el apagón. El sistema de respaldo mantiene lo esencial.' }
      }
    },

    invernadero: {
      id: 'invernadero',
      nombre: 'Invernadero',
      acento: 'lima',
      intro: 'De noche las plantas no hacen fotosíntesis, pero siguen respirando. Igual que ustedes: respiren y piensen.',
      candados: ['Gabinete de herramientas', 'Control de riego', 'Banco de semillas'],
      puzzle: null,
      examinar: {
        torre: { nombre: 'Torre hidropónica', texto: 'Estas plantas crecen sin tierra: sus raíces reciben agua con sales minerales disueltas.' },
        luna: { nombre: 'Techo de vidrio', texto: 'A través del vidrio se ve la Luna. El vidrio deja pasar la luz y retiene el calor: por eso se llama efecto invernadero.' }
      }
    }
  };

  EA.ORDEN_ESCENAS = ['quimica', 'biologia', 'fisica', 'control', 'invernadero'];
})(typeof window !== 'undefined' ? (window.EA = window.EA || {}) : (globalThis.EA = globalThis.EA || {}));
