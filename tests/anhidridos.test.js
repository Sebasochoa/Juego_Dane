'use strict';
/*
 * Preset por defecto «Anhídridos u óxidos ácidos», aportado por el docente.
 * Se pulió la presentación (tildes, mayúsculas, notación, pistas y explicaciones) sin cambiar
 * las preguntas ni las alternativas. Estas pruebas lo garantizan comparando con el original.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const EA = require('./cargar.js');
const P = EA.presets;

// Original exportado por el docente (solo enunciados, alternativas y respuesta marcada).
const ORIGINAL = [
  ['¿Cómo se define químicamente un anhídrido u óxido ácido?', ['La combinación química de un elemento no metálico con el oxígeno', 'La combinación química de un elemento metálico con el oxígeno', 'La combinación química de un ácido con una base', 'La unión de un no metal con el hidrógeno'], 0],
  ['¿Cuál de las siguientes fórmulas corresponde a un óxido ácido o anhídrido?', ['Na_2O', 'CaO', 'NO_3', 'FeO'], 2],
  ['Al reaccionar el azufre con el oxígeno en condiciones de combustión estándar (S + O₂), ¿qué anhídrido se forma principalmente?', ['SO_2', 'SO', 'SO_3', 'S_2O_3'], 0],
  ['¿Cómo se nombra el compuesto N₂O₃ empleando la nomenclatura de Stock?', ['Óxido de nitrógeno (I)', 'Óxido de nitrógeno (V)', 'Óxido de nitrógeno (III)', 'Trióxido de dinitrógeno'], 2],
  ['¿Cuál es la fórmula química correcta del heptaóxido de diyodo?', ['I_2O_5', 'IO_7', 'I_2O_7', 'I_7O_2'], 2],
  ['Identifica la ecuación con balanceada para la protección del óxido de teluro (IV)', ['Te + 2O_2 --> TeO_4', '2Te + O_2 --> 2TeO_2', 'Te + O_2 --> TeO_2', 'Te_2 + O_2 --> Te_2O_2'], 2],
  ['¿Qué ecuación química representa correctamente la formación del anhídrido sulfúrico a partir de sus elementos?', ['S+ O_2  --> SO_3', '2S+ O_2  --> 2SO_3', 'S+ O_3 --> SO_3', '2S+ 3O_2  --> 2SO_3'], 3],
  ['¿Qué compuesto produce la siguiente reacción? \n\nP_4 +  5O_2 ->  ??', ['P_2O_3', 'PO_2', 'P_2O_5', 'PH_3'], 2],
  ['¿A qué compuesto corresponde la siguiente nomenclatura:  anhídrido nítrico?', ['N_2O', 'N_2O_3', 'NO_2', 'N_2O_5'], 0],
  ['De acuerdo a la nomenclatura tradicional, ¿cómo se denomina el compuesto Cl₂O₇, donde el cloro actúa con valencia +7?', ['Anhídrido perclórico', 'Anhídrido clórico', 'Anhídrido cloroso', 'Anhídrido hipocloroso'], 0],
  ['¿Cómo se nombra el compuesto Cl_2O_5) según la nomenclatura sistemática (IUPAC)?', ['Óxido de cloro (V)', 'Anhídrido clórico', 'Trióxido de dicloro', 'Pentaóxido de dicloro'], 3],
  ['¿Cuál es el nombre en nomenclatura de Stock para el óxido ácido SeO_3', ['Óxido de selenio (III)', 'Trióxido de selenio', 'Óxido de selenio (VI)', 'Anhídrido selénico'], 0],
  ['El boro tiene una única valencia positiva (+ 3) ¿cómo se llama su óxido ácido (B_2O_3) en nomenclatura tradicional?', ['Anhídrido boroso', 'Anhídrido bórico', 'Trióxido de diboro', 'Óxido de boro (III)'], 1],
  ['Completa y balancea la siguiente ecuación de formación del anhídrido nitroso: 2N_2 + __ O_2 --> 2N_2O_3', ['2', '3', '4', '5'], 1]
];

/** Quita diferencias solo tipográficas: subíndices Unicode, flechas y espacios. */
const tipografia = (s) => s.replace(/₂/g, '_2').replace(/₃/g, '_3').replace(/₇/g, '_7')
  .replace(/-->|->/g, '→').replace(/\s+/g, ' ').replace(/ ?\+ ?/g, '+').trim();
const palabras = (s) => tipografia(s).toLowerCase().replace(/[¿?¡!.,:;()]/g, ' ').split(/\s+/).filter((w) => w.length > 2);

const preset = () => P.normalizarPreset(EA.ejemploPorId('ejemplo-anhidridos'));
const preguntas = () => preset().salas.flatMap((s) => s.preguntas);

test('es válido, de 3.° de secundaria y es el predeterminado', () => {
  const crudo = EA.ejemploPorId('ejemplo-anhidridos');
  assert.equal(crudo.defecto, true);
  assert.deepEqual(crudo.reemplaza, ['p-mwkv8rqh-1b8iw6'], 'sustituye la copia del docente');
  assert.equal(EA.PRESETS_EJEMPLO[0].id, 'ejemplo-anhidridos', 'va primero');
  const p = preset();
  assert.deepEqual(P.validarPreset(p).errores, []);
  assert.equal(p.nombre, 'Anhídridos u óxidos ácidos');
  assert.equal(p.grado, '3');
  assert.deepEqual(p.salas.map((s) => s.escena), ['quimica', 'biologia'], 'se respetan las salas del docente');
  assert.deepEqual(p.salas.map((s) => s.preguntas.length), [7, 7]);
  assert.equal(p.defecto, undefined, 'las marcas de ejemplo no se guardan en el preset');
});

test('las alternativas son las mismas del original (solo cambios tipográficos)', () => {
  const qs = preguntas();
  assert.equal(qs.length, ORIGINAL.length);
  qs.forEach((q, i) => {
    assert.deepEqual(q.alternativas.map(tipografia), ORIGINAL[i][1].map(tipografia), 'pregunta ' + (i + 1));
  });
});

// Únicas correcciones de redacción permitidas en los enunciados.
const ERRATAS = [
  ['ecuación con balanceada', 'ecuación balanceada'], ['protección', 'producción'],
  ['De acuerdo a la', 'De acuerdo con la'], ['Cl_2O_5)', 'Cl_2O_5'],
  ['(+ 3) ¿cómo', '(+3). ¿Cómo'], ['en nomenclatura tradicional', 'en la nomenclatura tradicional']
];

test('los enunciados son los mismos (solo se corrigieron erratas)', () => {
  preguntas().forEach((q, i) => {
    const original = ERRATAS.reduce((s, [mal, bien]) => s.replace(mal, bien), ORIGINAL[i][0]);
    const a = new Set(palabras(original));
    const b = palabras(q.enunciado);
    const comunes = b.filter((w) => a.has(w)).length;
    assert.equal(comunes, Math.max(a.size, b.length), 'pregunta ' + (i + 1) + ': ' + q.enunciado);
  });
});

test('respuestas: se mantienen las del docente salvo dos claves que estaban mal marcadas', () => {
  const clave = ['La combinación química de un elemento no metálico con el oxígeno', 'NO_3', 'SO_2', 'Óxido de nitrógeno (III)', 'I_2O_7',
    'Te + O_2 → TeO_2', '2S + 3O_2 → 2SO_3', 'P_2O_5', 'N_2O_5', 'Anhídrido perclórico', 'Pentaóxido de dicloro',
    'Óxido de selenio (VI)', 'Anhídrido bórico', '3'];
  const cambiadas = [];
  preguntas().forEach((q, i) => {
    assert.equal(q.alternativas[q.correcta], clave[i], 'pregunta ' + (i + 1));
    if (q.correcta !== ORIGINAL[i][2]) cambiadas.push(i + 1);
  });
  // 9: «anhídrido nítrico» es N₂O₅ (la propia explicación del docente lo dice).
  // 12: en SeO₃ el selenio actúa con +6 -> óxido de selenio (VI).
  assert.deepEqual(cambiadas, [9, 12]);
});

test('cada pregunta trae pista, explicación y rama; sin flechas ni espacios dobles', () => {
  preguntas().forEach((q, i) => {
    assert.ok(q.pista.length > 20, 'pista de la pregunta ' + (i + 1));
    assert.ok(q.explicacion.length > 20, 'explicación de la pregunta ' + (i + 1));
    assert.equal(q.rama, 'quimica');
    [q.enunciado, q.pista, q.explicacion].concat(q.alternativas).forEach((t) => {
      assert.ok(!/-->|->|  |[₀-₉]/.test(t), 'tipografía en: ' + t);
      assert.ok(!/^[a-záéíóú]/.test(t) || /^\d/.test(t), 'empieza con mayúscula: ' + t);
    });
    assert.match(q.enunciado, /[?.:)\d]$|→ \?$/, 'termina con signo: ' + q.enunciado);
  });
});

test('las ecuaciones de la clave están balanceadas', () => {
  // Cuenta átomos de cada lado de una ecuación escrita con la notación del juego.
  const atomos = (lado) => {
    const t = {};
    lado.split('+').forEach((termino) => {
      const m = /^\s*(\d*)\s*(.+?)\s*$/.exec(termino);
      const coef = m[1] ? +m[1] : 1;
      const re = /([A-Z][a-z]?)(?:_\{?(\d+)\}?)?/g;
      let x;
      while ((x = re.exec(m[2]))) t[x[1]] = (t[x[1]] || 0) + coef * (x[2] ? +x[2] : 1);
    });
    return t;
  };
  ['Te + O_2 → TeO_2', '2S + 3O_2 → 2SO_3', 'S + O_2 → SO_2', 'P_4 + 5O_2 → 2P_2O_5', '2N_2 + 3O_2 → 2N_2O_3'].forEach((ec) => {
    const [izq, der] = ec.split('→');
    assert.deepEqual(atomos(izq), atomos(der), ec);
  });
  ['2Te + O_2 → 2TeO_2', 'S + O_2 → SO_3', '2S + O_2 → 2SO_3'].forEach((ec) => {
    const [izq, der] = ec.split('→');
    assert.notDeepEqual(atomos(izq), atomos(der), 'distractor desbalanceado: ' + ec);
  });
});
