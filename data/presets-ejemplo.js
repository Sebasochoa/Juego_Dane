/*
 * Presets de ejemplo, embebidos para que el juego funcione sin servidor (file://).
 * Notación: H_2O -> subíndice, m/s^2 -> superíndice.
 */
(function (EA) {
  'use strict';

  EA.PRESETS_EJEMPLO = [
    {
      esquema: 1,
      id: 'ejemplo-ciencias-basicas',
      nombre: 'Ejemplo: Ciencias básicas',
      grado: 'mixto',
      descripcion: 'Preset de muestra con tres salas (Química, Biología y Sala de control con Física). Úselo como modelo para crear los suyos.',
      salas: [
        {
          escena: 'quimica',
          preguntas: [
            {
              enunciado: '¿Cuál es la fórmula química del agua?',
              alternativas: ['H_2O', 'CO_2', 'O_2', 'H_2O_2'],
              correcta: 0, rama: 'quimica', imagen: '',
              pista: 'Su molécula tiene dos átomos de hidrógeno y uno de oxígeno.',
              explicacion: 'El agua es H_2O: dos átomos de hidrógeno unidos a uno de oxígeno. H_2O_2 es agua oxigenada (peróxido de hidrógeno), una sustancia distinta.'
            },
            {
              enunciado: 'Una disolución tiene pH 2. ¿Cómo se clasifica?',
              alternativas: ['Ácida', 'Neutra', 'Básica (alcalina)', 'No tiene pH'],
              correcta: 0, rama: 'quimica', imagen: '',
              pista: 'En la escala de pH, el 7 es neutro. ¿Hacia qué lado queda el 2?',
              explicacion: 'Un pH menor que 7 indica una disolución ácida; igual a 7, neutra; y mayor que 7, básica. El jugo de limón tiene un pH cercano a 2.'
            },
            {
              enunciado: '¿Qué partícula del átomo tiene carga eléctrica negativa?',
              alternativas: ['El electrón', 'El protón', 'El neutrón', 'El núcleo'],
              correcta: 0, rama: 'quimica', imagen: '',
              pista: 'Se mueve alrededor del núcleo y es mucho más liviana que las otras.',
              explicacion: 'El electrón tiene carga negativa. El protón tiene carga positiva, el neutrón no tiene carga y el núcleo (protones + neutrones) es positivo.'
            },
            {
              enunciado: '¿Cuál de estos es un cambio químico?',
              alternativas: ['Un clavo de hierro que se oxida', 'Un cubo de hielo que se derrite', 'Agua que hierve', 'Un vidrio que se rompe'],
              correcta: 0, rama: 'quimica', imagen: '',
              pista: 'En un cambio químico se forma una sustancia nueva.',
              explicacion: 'Al oxidarse, el hierro reacciona con el oxígeno y forma óxido de hierro, una sustancia nueva. Derretir, hervir o romper son cambios físicos: la sustancia sigue siendo la misma.'
            },
            {
              enunciado: 'El número atómico de un elemento indica cuántos…',
              alternativas: ['protones tiene su núcleo', 'neutrones tiene su núcleo', 'protones y neutrones suma', 'átomos forman su molécula'],
              correcta: 0, rama: 'quimica', imagen: '',
              pista: 'Es el número que identifica a cada elemento en la tabla periódica.',
              explicacion: 'El número atómico (Z) es la cantidad de protones del núcleo. La suma de protones y neutrones es el número másico (A).'
            }
          ]
        },
        {
          escena: 'biologia',
          preguntas: [
            {
              enunciado: '¿En qué organelo se produce la mayor parte del ATP durante la respiración celular?',
              alternativas: ['Mitocondria', 'Ribosoma', 'Núcleo', 'Aparato de Golgi'],
              correcta: 0, rama: 'biologia', imagen: '',
              pista: 'Se le conoce como la «central energética» de la célula.',
              explicacion: 'En las mitocondrias ocurre la respiración celular, que libera la energía de la glucosa y la almacena en moléculas de ATP.'
            },
            {
              enunciado: '¿Qué gas toman las plantas del aire para hacer la fotosíntesis?',
              alternativas: ['Dióxido de carbono (CO_2)', 'Oxígeno (O_2)', 'Nitrógeno (N_2)', 'Hidrógeno (H_2)'],
              correcta: 0, rama: 'biologia', imagen: '',
              pista: 'Es el mismo gas que nosotros expulsamos al respirar.',
              explicacion: 'En la fotosíntesis, las plantas usan CO_2, agua y luz para producir glucosa y liberar O_2.'
            },
            {
              enunciado: '¿Qué molécula guarda la información genética de las células?',
              alternativas: ['ADN', 'ATP', 'Glucosa', 'Hemoglobina'],
              correcta: 0, rama: 'biologia', imagen: '',
              pista: 'Tiene forma de doble hélice.',
              explicacion: 'El ADN (ácido desoxirribonucleico) contiene los genes. El ATP almacena energía, la glucosa es un azúcar y la hemoglobina transporta oxígeno.'
            },
            {
              enunciado: '¿Qué estructura tienen las células vegetales pero no las células animales?',
              alternativas: ['Pared celular', 'Membrana celular', 'Mitocondrias', 'Núcleo'],
              correcta: 0, rama: 'biologia', imagen: '',
              pista: 'Es una capa rígida de celulosa que rodea a la célula.',
              explicacion: 'Las células vegetales tienen pared celular (y cloroplastos). La membrana, las mitocondrias y el núcleo están en ambos tipos de células.'
            },
            {
              enunciado: '¿Qué componente de la sangre transporta la mayor parte del oxígeno?',
              alternativas: ['Los glóbulos rojos', 'Los glóbulos blancos', 'Las plaquetas', 'El plasma'],
              correcta: 0, rama: 'biologia', imagen: '',
              pista: 'Contienen hemoglobina, que le da su color a la sangre.',
              explicacion: 'Los glóbulos rojos llevan el oxígeno unido a la hemoglobina. Los glóbulos blancos defienden al cuerpo y las plaquetas ayudan a la coagulación.'
            }
          ]
        },
        {
          escena: 'control',
          preguntas: [
            {
              enunciado: '¿Cuál es la unidad de fuerza en el Sistema Internacional?',
              alternativas: ['Newton (N)', 'Joule (J)', 'Watt (W)', 'Pascal (Pa)'],
              correcta: 0, rama: 'fisica', imagen: '',
              pista: 'Lleva el apellido del científico que formuló las leyes del movimiento.',
              explicacion: 'La fuerza se mide en newtons. El joule mide energía, el watt mide potencia y el pascal mide presión.'
            },
            {
              enunciado: 'Un auto recorre 100 m en 20 s con rapidez constante. ¿Cuál es su rapidez?',
              alternativas: ['5 m/s', '2 m/s', '20 m/s', '2000 m/s'],
              correcta: 0, rama: 'fisica', imagen: '',
              pista: 'Rapidez = distancia ÷ tiempo.',
              explicacion: 'v = d / t = 100 m ÷ 20 s = 5 m/s.'
            },
            {
              enunciado: '¿Cuánto vale, aproximadamente, la aceleración de la gravedad cerca de la superficie de la Tierra?',
              alternativas: ['9,8 m/s^2', '1,6 m/s^2', '3,7 m/s^2', '98 m/s^2'],
              correcta: 0, rama: 'fisica', imagen: '',
              pista: 'Es un poco menos de 10 m/s^2.',
              explicacion: 'En la Tierra, g ≈ 9,8 m/s^2. En la Luna es de unos 1,6 m/s^2 y en Marte, de unos 3,7 m/s^2.'
            },
            {
              enunciado: 'Una resistencia de 4 Ω se conecta a una batería de 12 V. Según la ley de Ohm, ¿qué corriente circula?',
              alternativas: ['3 A', '48 A', '8 A', '16 A'],
              correcta: 0, rama: 'fisica', imagen: '',
              pista: 'Ley de Ohm: I = V ÷ R.',
              explicacion: 'I = V / R = 12 V ÷ 4 Ω = 3 A.'
            },
            {
              enunciado: '¿Qué tipo de energía tiene un objeto debido a su movimiento?',
              alternativas: ['Energía cinética', 'Energía potencial gravitatoria', 'Energía química', 'Energía potencial elástica'],
              correcta: 0, rama: 'fisica', imagen: '',
              pista: 'Depende de la masa y de la rapidez del objeto.',
              explicacion: 'La energía cinética es la del movimiento: E_c = ½ · m · v^2. Cuanto más rápido se mueve un objeto, más energía cinética tiene.'
            }
          ]
        }
      ]
    },
    {
      esquema: 1,
      id: 'plantilla-vacia',
      nombre: 'Plantilla vacía',
      grado: 'mixto',
      descripcion: 'Dos salas listas para completar con sus preguntas. Duplíquela o edítela desde el editor.',
      salas: [
        { escena: 'fisica', preguntas: [] },
        { escena: 'invernadero', preguntas: [] }
      ]
    }
  ];
})(typeof window !== 'undefined' ? (window.EA = window.EA || {}) : (globalThis.EA = globalThis.EA || {}));
