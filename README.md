# Apagón en el Aurora

Escape room 2D *point-and-click* para clases de ciencias de secundaria. Un apagón bloqueó
el Instituto Aurora: los equipos, guiados por el robot Volti, reabren cada sala
«recalibrando» candados con preguntas de biología, química y física.

Está pensado para que el docente lo **proyecte en clase** y los equipos jueguen por turnos.

- 100 % estático: HTML + CSS + JavaScript, sin servidor, sin dependencias y sin conexión.
- Funciona publicado en GitHub Pages **y** abriendo `index.html` con doble clic.
- No recolecta datos ni hace llamadas de red. Los presets se guardan en el navegador.
- Todo el arte es SVG + CSS, y el sonido se genera con Web Audio (no hay archivos de imagen ni de audio).

---

## Cómo jugar

1. Abra el juego y elija **Jugar**.
2. Elija un **preset** (puede filtrar por grado), configure de **2 a 4 equipos** (nombre y color)
   y, si quiere, active el **temporizador por turno** (30 a 180 segundos).
3. Cada equipo tiene **su propia copia del laboratorio**: su avance, su inventario y su puntaje.
   Los equipos se alternan en la misma pantalla.
4. En su turno, el equipo puede **explorar sin gastar el turno**: examinar la sala, recoger objetos
   y combinarlos (clic en uno y luego en otro, o arrastrando). El objeto combinado se usa en un
   punto de la sala para activar un candado que estaba sin energía.
5. **Intentar un candado consume el turno**: se abre una pregunta de opción múltiple.
   - Acierto al primer intento: **100** puntos.
   - Primer fallo: se muestra la **pista** y el turno pasa. Si aciertan en el reintento: **50**.
   - Segundo fallo en el mismo candado: se muestra la **explicación** y el candado se abre con **0** puntos,
     para no frenar la clase.
6. Con todos los candados abiertos, la puerta se abre (**+50** por sala). La puerta de la última sala
   es la salida; el **primer equipo en escapar gana +200**. Con temporizador hay hasta **+25** por rapidez.
7. La partida termina cuando todos escapan o cuando el docente pulsa **Terminar partida** (ícono de bandera).
   El resumen muestra el podio, la tabla por equipo, las preguntas más falladas («Para repasar»)
   y permite **descargar los resultados en CSV**.

El botón **Ayuda** del asistente da una pista del puzzle de objetos, sin penalización.
Solo dos escenarios tienen puzzle de objetos: Química (pila de limón) y Biología (muestra teñida).

Como todos ven la misma pantalla, el orden de las alternativas se baraja por equipo y, si la sala
tiene más preguntas que candados, cada equipo recibe un sorteo distinto.

### Atajos de teclado

| Tecla | Acción |
|---|---|
| `A`–`E` o `1`–`5` | Elegir alternativa |
| `Enter` | Confirmar o continuar |
| `Esc` | Cerrar o cancelar |
| `H` | Ayuda del asistente |
| `P` | Pausa (detiene el temporizador y oculta la pregunta) |
| `M` | Silencio |
| `F` | Pantalla completa |
| `Tab` | Recorrer los objetos de la sala (`Enter` o espacio para activarlos) |

El volumen y el silencio están siempre arriba a la derecha y la preferencia queda guardada.

### Puntaje

Todas las constantes están en un solo archivo: [`js/config.js`](js/config.js).

---

## Cómo crear presets

Un **preset** es un nombre, un grado (1.° a 5.° de secundaria o Mixto), una descripción y una lista
ordenada de **2 a 5 salas**; cada sala tiene un escenario y su banco de preguntas.

1. En el menú, entre a **Editor de presets**.
2. **Nuevo preset** (o duplique el ejemplo o la «Plantilla vacía»).
3. Agregue salas y elija el escenario de cada una. El escenario es solo el decorado: las preguntas
   pueden ser de cualquier tema.

   | Escenario | Candados (mínimo de preguntas) | Puzzle de objetos |
   |---|---|---|
   | Laboratorio de Química | 4 | Sí |
   | Laboratorio de Biología | 4 | Sí |
   | Taller de Física | 3 | No |
   | Sala de Control | 4 | No |
   | Invernadero | 3 | No |

4. En cada sala, **Agregar pregunta**: enunciado, de 2 a 5 alternativas (4 por defecto), **una sola correcta**,
   pista, explicación y, opcionalmente, rama (biología, química o física) e imagen.
5. Use **Vista previa** para ver la pregunta tal como se proyectará.
6. **Guardar preset**. Si le faltan preguntas queda guardado como «Incompleto» y no aparece al jugar
   hasta completarlo; el editor indica qué falta.

**Notación científica:** escriba `H_2O` para H₂O, `m/s^2` para m/s², `SO_4^{2-}` para SO₄²⁻ o `Na^+` para Na⁺.

**Imágenes:** se cargan desde el editor (PNG, JPG, GIF, WebP o SVG, hasta 400 KB) y quedan guardadas
dentro del preset. No se admiten direcciones de internet.

### Llevar los presets a otra computadora

> Los presets viven **en este navegador**. Si cambia de computadora o de navegador, o borra los datos
> de navegación, no estarán.

- **Exportar** (un preset, o «Exportar todos») descarga un archivo `.json`.
- **Importar JSON** en la otra computadora lo carga. El archivo se valida; si un nombre ya existe,
  puede conservar ambos, reemplazar el suyo u omitirlo.
- **Restaurar ejemplos** vuelve a agregar el preset de ejemplo y la plantilla.

---

## Cómo publicar en GitHub Pages

1. Suba este repositorio a GitHub (rama `main`).
2. En el repositorio: **Settings → Pages**.
3. En *Build and deployment*, elija **Deploy from a branch**, rama **`main`** y carpeta **`/ (root)`**. Guarde.
4. En uno o dos minutos el juego estará en `https://<usuario>.github.io/<nombre-repo>/`.

No hay paso de compilación. Todas las rutas son relativas y el archivo `.nojekyll` evita que
GitHub procese los archivos.

Para usarlo sin internet, descargue el repositorio (Code → Download ZIP), descomprímalo y abra `index.html`.

---

## Cómo reemplazar arte

Todo el arte está registrado con un identificador y un tamaño nominal. Para cambiar un objeto o un
fondo por su propia imagen **no hace falta tocar la lógica**: edite solo
[`js/art/registro.js`](js/art/registro.js).

```js
EA.ARTE_REEMPLAZOS = {
  'fondo.quimica': 'arte/mi-laboratorio.png',   // PNG, JPG o SVG, ruta relativa a index.html
  'lab.matraz':    'arte/matraz.svg',
  'deco.reloj':    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90">…</svg>'  // o el SVG como texto
};
```

- Abra **`index.html?galeria`** para ver todos los identificadores con su tamaño.
- Los fondos miden 1920×1080 (`fondo.quimica`, `fondo.biologia`, `fondo.fisica`, `fondo.control`, `fondo.invernadero`).
- La imagen se ajusta a la caja del componente y conserva su posición y su zona de clic.
- Si reemplaza `ui.candado` o `ui.puerta` por una imagen fija se pierden sus estados animados.
- Para que el arte nuevo combine con el resto, siga la guía [`docs/ARTE.md`](docs/ARTE.md)
  (paleta, luz desde arriba a la izquierda, sin contornos negros).

---

## Cómo correr las pruebas

Solo se necesita [Node.js](https://nodejs.org) 22 o superior. No hay nada que instalar.

```bash
node --test
```

Ejecuta las pruebas de la lógica pura (turnos, puntaje, sorteo, validación e importación de presets,
notación científica, contraste AA de la paleta) e incluye una partida completa de 2 equipos.

Las pruebas en navegador usan Chrome o Edge ya instalados, en modo *headless* (sin dependencias;
si no los encuentra, defina la variable `CHROME_PATH`):

```bash
node tools/e2e.js
```

```bash
node tools/e2e-editor.js
```

```bash
node tools/e2e-extras.js
```

```bash
node tools/capturas.js
```

- `e2e.js`: partida completa con 2 equipos usando clics y teclado reales (aciertos, fallo con pista,
  fallo con explicación, escape de ambos, resumen).
- `e2e-editor.js`: crear, validar, vista previa, guardar, duplicar, exportar, importar con conflicto, eliminar y restaurar.
- `e2e-extras.js`: temporizador, 4 equipos, resoluciones 1366×768 y 4:3, reemplazo de arte, zonas de clic y movimiento reducido.
- `capturas.js`: renderiza cada escena a PNG en `capturas/` para revisarlas a ojo.

Estas herramientas son solo de desarrollo: el juego no las carga.

---

## Estructura

```
index.html            Página única
css/                  paleta.css (colores), base.css, escena.css (animaciones), ui.css, editor.css
js/config.js          Puntajes y límites
js/core/              Lógica pura: util, escenas (textos y puzzles), presets, juego
js/art/               Biblioteca SVG (base, lab, taller), escenas y registro de reemplazos
js/audio/             Efectos y música con Web Audio
js/ui/                Pantallas: menú, configuración, juego, resumen, editor
data/                 Presets de ejemplo embebidos
docs/ARTE.md          Guía de arte
tests/                Pruebas con node --test
tools/                Capturas y pruebas en navegador (solo desarrollo)
```

## Compatibilidad y accesibilidad

- Versiones recientes de Chrome, Edge, Firefox y Safari. Lienzo lógico 16:9 (1920×1080) que escala a la ventana, con barras si hace falta.
- Mouse, táctil y teclado. Foco visible, etiquetas `aria` en los objetos interactivos y contraste AA.
- Acierto y error se indican con ícono y texto, no solo con color; cada equipo tiene color **y** símbolo.
- Las animaciones se desactivan si el sistema pide movimiento reducido.
