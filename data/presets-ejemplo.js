/*
 * Presets de ejemplo, embebidos para que el juego funcione sin servidor (file://).
 * Notación: H_2O -> subíndice, m/s^2 -> superíndice.
 *
 * Campos solo para ejemplos (no se guardan en el preset):
 *   defecto: true      -> se ofrece primero y queda elegido en «Nueva partida».
 *   reemplaza: [ids]   -> si el navegador tiene guardado un preset con ese id, este ejemplo lo
 *                         sustituye una única vez (versión pulida de un preset del docente).
 */
(function (EA) {
  'use strict';

  EA.PRESETS_EJEMPLO = [
    {
      esquema: 1,
      id: 'ejemplo-anhidridos',
      defecto: true,
      reemplaza: ['p-mwkv8rqh-1b8iw6'],
      nombre: 'Anhídridos u óxidos ácidos',
      grado: '3',
      descripcion: 'Pon a prueba lo que aprendiste sobre los compuestos inorgánicos: los anhídridos u óxidos ácidos, cómo se forman y cómo se nombran.',
      salas: [
        {
          escena: 'quimica',
          preguntas: [
            {
              enunciado: '¿Cómo se define químicamente un anhídrido u óxido ácido?',
              alternativas: [
                'La combinación química de un elemento no metálico con el oxígeno',
                'La combinación química de un elemento metálico con el oxígeno',
                'La combinación química de un ácido con una base',
                'La unión de un no metal con el hidrógeno'
              ],
              correcta: 0, rama: 'quimica', imagen: '',
              pista: 'Los óxidos básicos se forman con metales. ¿Con qué tipo de elemento se forman los óxidos ácidos?',
              explicacion: 'Un anhídrido u óxido ácido se forma cuando un no metal se combina con el oxígeno, como el CO_2 o el SO_3. Si el elemento es un metal, se forma un óxido básico, como el CaO.'
            },
            {
              enunciado: '¿Cuál de las siguientes fórmulas corresponde a un óxido ácido o anhídrido?',
              alternativas: ['Na_2O', 'CaO', 'NO_3', 'FeO'],
              correcta: 2, rama: 'quimica', imagen: '',
              pista: 'Un anhídrido se forma con un no metal. Revisa cuáles de estos elementos son metales: sodio, calcio, nitrógeno y hierro.',
              explicacion: 'El nitrógeno (N) es un no metal, por lo que NO_3 es un anhídrido. Na_2O, CaO y FeO son óxidos básicos, porque el sodio, el calcio y el hierro son metales.'
            },
            {
              enunciado: 'Al reaccionar el azufre con el oxígeno en condiciones de combustión estándar (S + O_2), ¿qué anhídrido se forma principalmente?',
              alternativas: ['SO_2', 'SO', 'SO_3', 'S_2O_3'],
              correcta: 0, rama: 'quimica', imagen: '',
              pista: 'En la combustión directa, el azufre actúa con valencia +4. Recuerda que el oxígeno actúa con −2.',
              explicacion: 'La combustión directa del azufre en el aire produce principalmente dióxido de azufre: S + O_2 → SO_2 (anhídrido sulfuroso).'
            },
            {
              enunciado: '¿Cómo se nombra el compuesto N_2O_3 empleando la nomenclatura de Stock?',
              alternativas: ['Óxido de nitrógeno (I)', 'Óxido de nitrógeno (V)', 'Óxido de nitrógeno (III)', 'Trióxido de dinitrógeno'],
              correcta: 2, rama: 'quimica', imagen: '',
              pista: 'En la nomenclatura de Stock se escribe «óxido de» + el elemento + su valencia en números romanos. ¿Con qué valencia actúa el nitrógeno en N_2O_3?',
              explicacion: 'Como cada nitrógeno actúa con valencia +3, en la nomenclatura de Stock se escribe óxido de nitrógeno (III). «Trióxido de dinitrógeno» también es correcto, pero en la nomenclatura sistemática.'
            },
            {
              enunciado: '¿Cuál es la fórmula química correcta del heptaóxido de diyodo?',
              alternativas: ['I_2O_5', 'IO_7', 'I_2O_7', 'I_7O_2'],
              correcta: 2, rama: 'quimica', imagen: '',
              pista: 'Los prefijos cuentan los átomos: «hepta» significa 7 y «di», 2.',
              explicacion: '«Hepta» indica 7 átomos de oxígeno y «di», 2 átomos de yodo: I_2O_7. En este óxido, el yodo actúa con valencia +7.'
            },
            {
              enunciado: 'Identifica la ecuación balanceada para la producción del óxido de teluro (IV).',
              alternativas: ['Te + 2O_2 → TeO_4', '2Te + O_2 → 2TeO_2', 'Te + O_2 → TeO_2', 'Te_2 + O_2 → Te_2O_2'],
              correcta: 2, rama: 'quimica', imagen: '',
              pista: 'El teluro actúa con valencia +4, así que su óxido es TeO_2. Luego cuenta los átomos a cada lado de la flecha.',
              explicacion: 'El óxido de teluro (IV) es TeO_2. La ecuación Te + O_2 → TeO_2 está balanceada: tiene 1 átomo de teluro y 2 de oxígeno a cada lado.'
            },
            {
              enunciado: '¿Qué ecuación química representa correctamente la formación del anhídrido sulfúrico a partir de sus elementos?',
              alternativas: ['S + O_2 → SO_3', '2S + O_2 → 2SO_3', 'S + O_3 → SO_3', '2S + 3O_2 → 2SO_3'],
              correcta: 3, rama: 'quimica', imagen: '',
              pista: 'El anhídrido sulfúrico es SO_3. Cuenta los átomos de azufre y de oxígeno: deben ser iguales a ambos lados de la flecha.',
              explicacion: 'El anhídrido sulfúrico es SO_3. En 2S + 3O_2 → 2SO_3 hay 2 átomos de azufre y 6 de oxígeno a cada lado, así que la ecuación está balanceada.'
            }
          ]
        },
        {
          escena: 'biologia',
          preguntas: [
            {
              enunciado: '¿Qué compuesto produce la siguiente reacción?\nP_4 + 5O_2 → ?',
              alternativas: ['P_2O_3', 'PO_2', 'P_2O_5', 'PH_3'],
              correcta: 2, rama: 'quimica', imagen: '',
              pista: 'Aquí el fósforo actúa con su valencia máxima, +5. Cruza esa valencia con la del oxígeno (−2).',
              explicacion: 'El fósforo alcanza su valencia máxima (+5) y forma el anhídrido fosfórico, P_2O_5. La ecuación balanceada es P_4 + 5O_2 → 2P_2O_5 (en realidad, su molécula es P_4O_{10}).'
            },
            {
              enunciado: '¿A qué compuesto corresponde la siguiente nomenclatura: anhídrido nítrico?',
              alternativas: ['N_2O', 'N_2O_3', 'NO_2', 'N_2O_5'],
              correcta: 3, rama: 'quimica', imagen: '',
              pista: 'El sufijo -ico indica la valencia mayor del nitrógeno, que es +5. Cruza esa valencia con la del oxígeno (−2).',
              explicacion: 'El sufijo -ico corresponde al máximo valor de valencia del nitrógeno (+5), mientras que el oxígeno actúa con −2. Al cruzar las valencias se obtiene N_2O_5.'
            },
            {
              enunciado: 'De acuerdo con la nomenclatura tradicional, ¿cómo se denomina el compuesto Cl_2O_7, donde el cloro actúa con valencia +7?',
              alternativas: ['Anhídrido perclórico', 'Anhídrido clórico', 'Anhídrido cloroso', 'Anhídrido hipocloroso'],
              correcta: 0, rama: 'quimica', imagen: '',
              pista: 'Para el cloro: hipo-…-oso (+1), -oso (+3), -ico (+5) y per-…-ico (+7).',
              explicacion: 'Con su mayor valencia (+7), el cloro usa el prefijo «per-» y el sufijo «-ico»: anhídrido perclórico.'
            },
            {
              enunciado: '¿Cómo se nombra el compuesto Cl_2O_5 según la nomenclatura sistemática (IUPAC)?',
              alternativas: ['Óxido de cloro (V)', 'Anhídrido clórico', 'Trióxido de dicloro', 'Pentaóxido de dicloro'],
              correcta: 3, rama: 'quimica', imagen: '',
              pista: 'La nomenclatura sistemática usa prefijos numéricos (mono-, di-, tri-, tetra-, penta-…) para contar los átomos de cada elemento.',
              explicacion: 'La nomenclatura sistemática indica con prefijos cuántos átomos hay: «penta» (5 oxígenos) y «di» (2 cloros). «Anhídrido clórico» es el nombre tradicional y «óxido de cloro (V)», el de Stock.'
            },
            {
              enunciado: '¿Cuál es el nombre en nomenclatura de Stock para el óxido ácido SeO_3?',
              alternativas: ['Óxido de selenio (III)', 'Trióxido de selenio', 'Óxido de selenio (VI)', 'Anhídrido selénico'],
              correcta: 2, rama: 'quimica', imagen: '',
              pista: 'En SeO_3, los 3 oxígenos suman −6. ¿Con qué valencia actúa el selenio? Escríbela en números romanos.',
              explicacion: 'En SeO_3, los 3 oxígenos suman −6, así que el selenio actúa con valencia +6: en la nomenclatura de Stock es óxido de selenio (VI). «Anhídrido selénico» es su nombre tradicional y «trióxido de selenio», el sistemático.'
            },
            {
              enunciado: 'El boro tiene una única valencia positiva (+3). ¿Cómo se llama su óxido ácido (B_2O_3) en la nomenclatura tradicional?',
              alternativas: ['Anhídrido boroso', 'Anhídrido bórico', 'Trióxido de diboro', 'Óxido de boro (III)'],
              correcta: 1, rama: 'quimica', imagen: '',
              pista: 'Cuando un elemento tiene una sola valencia, la nomenclatura tradicional usa la terminación de la valencia mayor.',
              explicacion: 'Cuando un elemento tiene una sola valencia, la nomenclatura tradicional usa siempre el sufijo -ico: anhídrido bórico.'
            },
            {
              enunciado: 'Completa y balancea la siguiente ecuación de formación del anhídrido nitroso: 2N_2 + __ O_2 → 2N_2O_3',
              alternativas: ['2', '3', '4', '5'],
              correcta: 1, rama: 'quimica', imagen: '',
              pista: 'Cuenta los oxígenos del producto: hay 2 moléculas de N_2O_3. Cada molécula de O_2 aporta 2 átomos.',
              explicacion: 'El producto (2N_2O_3) tiene 6 átomos de oxígeno en total, que se obtienen de 3 O_2: 2N_2 + 3O_2 → 2N_2O_3.'
            }
          ]
        }
      ]
    },
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
