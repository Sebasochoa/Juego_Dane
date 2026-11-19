# Guía de arte — El laboratorio del científico

Todo el arte del juego es SVG + CSS escrito a mano. Esta guía es la fuente de verdad:
cualquier componente nuevo (o reemplazo del docente) debe obedecerla para que las
cinco salas se sientan parte del mismo mundo.

## 1. Estilo

- Ilustración vectorial **plana**, de formas geométricas limpias, al estilo de la gráfica
  editorial de museos de ciencia e infografías.
- Colorida y amigable, pero **no infantil**: sin caras en los objetos (solo el robot tiene
  rostro), sin proporciones "chibi", sin tipografías de fantasía.
- Esquinas redondeadas (radio mínimo 4 px, típico 8–16 px).
- **Sin contornos negros.** La separación entre formas se logra con cambio de tono.
  Cuando hace falta una línea, usa el tono *sombra* del mismo color.
- Sin degradados salvo dos excepciones: conos de luz y viñeta de la escena.
- Sin filtros SVG (`blur`, `drop-shadow`) por rendimiento.

## 2. Paleta

Definida en `css/paleta.css` como variables CSS. Cada color tiene **3 tonos**:
base (`--color`), sombra (`--color-s`) y luz (`--color-l`).

| Color     | Base      | Sombra    | Luz       | Uso principal                         |
|-----------|-----------|-----------|-----------|---------------------------------------|
| tinta     | `#1E2440` | `#141931` | `#313A66` | Texto, interfaz, zonas oscuras        |
| crema     | `#F6EFE0` | `#DCD2BC` | `#FFFBF2` | Papel, robot, paneles claros          |
| azul      | `#3D7DD8` | `#2A5BA8` | `#8DBBF5` | Líquidos, pantallas, equipo           |
| turquesa  | `#1FA7A0` | `#147A78` | `#7ADBD0` | Acento de Química                     |
| verde     | `#4FB06A` | `#357E4C` | `#9BDDAA` | Acento de Biología, acierto           |
| lima      | `#A6C83E` | `#7C9A27` | `#D3E88A` | Acento del Invernadero                |
| amarillo  | `#F4C03E` | `#C99522` | `#FBE08F` | Candados, luces, atención             |
| naranja   | `#EE8A3C` | `#BF6422` | `#F8BC8C` | Acento de Física                      |
| coral     | `#E4574F` | `#B03A37` | `#F4A19A` | Error, alarmas                        |
| violeta   | `#7A5CC8` | `#563F96` | `#B7A5EC` | Acento de Sala de control             |
| rosa      | `#E279A6` | `#B4517C` | `#F3B1CC` | Detalles orgánicos                    |
| gris      | `#9AA3B8` | `#6B748C` | `#CDD3E0` | Neutros                               |
| madera    | `#C08A5A` | `#946540` | `#E0B48A` | Mobiliario                            |
| metal     | `#B9C2D3` | `#8590A8` | `#E3E8F1` | Equipos, marcos, herrajes             |
| vidrio    | `#BFE6F2` | —         | —         | Cristal (siempre con opacidad 0.25–0.5) |

### Acento y ambiente por sala

| Sala              | Acento   | Pared (base / sombra / luz)         | Piso      |
|-------------------|----------|-------------------------------------|-----------|
| Química           | turquesa | `#1F5C66` / `#184A53` / `#2A7480`   | `#B9C8CE` |
| Biología          | verde    | `#2C6247` / `#234F39` / `#3A7C5B`   | `#CFC6AD` |
| Taller de Física  | naranja  | `#7B4630` / `#643826` / `#96593E`   | `#A59A90` |
| Sala de control   | violeta  | `#2B2A5E` / `#201F49` / `#3B3A7A`   | `#3F4170` |
| Invernadero       | lima     | `#1C2A4A` (noche) + zócalo `#5B6B33`| `#8E7D5E` |

El acento aparece en: la franja de la pared, el marco de la puerta, y dos o tres
muebles u objetos protagonistas de la sala. El **amarillo** se reserva para los candados
y el **verde/coral** para acierto/error (siempre acompañados de ícono y texto).

## 3. Luz y sombra

- La luz viene de **arriba a la izquierda**.
- Cada volumen tiene, como máximo, tres tonos: base, una franja de *luz* arriba/izquierda
  y una franja de *sombra* abajo/derecha.
- Brillos en vidrio y metal: una barra blanca con opacidad 0.35 en el lado izquierdo.
- Sombra proyectada: elipse plana `rgba(20,25,49,.22)` bajo el objeto, desplazada
  ~8 px a la derecha. Nunca desenfocada.
- Luces de la escena: conos de luz (polígono blanco con opacidad ≤ 0.08) bajo cada
  lámpara y una viñeta radial oscura en los bordes.

## 4. Trazo

- Grosor uniforme: **4 px** para detalles (cables, asas, costuras) y **8 px** para
  estructuras (patas, tuberías). Extremos y uniones redondeados.
- Color del trazo: tono sombra del relleno vecino, nunca negro.

## 5. Escala (lienzo 1920×1080)

- Línea del piso: **y = 780**. Zona útil de juego: x 60–1860, y 110–920
  (arriba vive el marcador; abajo, el inventario y el asistente).
- Puerta: 300×560. Mesón: 190–200 de alto. Armario alto: ~500.
- Material de laboratorio sobre mesa: 80–130 de alto.
- Objetos que se pueden recoger: mínimo 60×60 y con zona de clic de al menos 110×110.
- Candado: 100×120 con zona de clic de 140×160.

## 6. Tipografía

- Familia: pila del sistema — `"Segoe UI", system-ui, -apple-system, Roboto,
  "Helvetica Neue", Arial, sans-serif` (sin fuentes remotas).
- Códigos y pantallas dentro de la escena: `Consolas, "Courier New", monospace`.
- Tamaños en base 1080: enunciado de pregunta 40 px, alternativas 32 px,
  texto general 26–28 px, mínimo absoluto 22 px. Títulos con peso 800.
- Contraste mínimo AA (4.5:1). Texto claro `--crema-l` sobre `--tinta`.

## 7. Capas de una escena

1. **Fondo** — pared, piso, ventanas (`fondo.<sala>`).
2. **Mobiliario** — mesones, estantes, equipos no interactivos.
3. **Interactivos** — candados, puerta, objetos del puzzle, puntos de uso y de examinar.
4. **Luces** — conos de luz y viñeta (no reciben clics).

## 8. Interacción y movimiento

- Todo interactivo muestra un marco punteado claro al pasar el mouse o recibir foco.
- Cursores: `pointer` (candados y puerta), `grab` (objetos), `help` (examinar).
- Animaciones al resolver: el arco del candado sube y el cuerpo pasa a verde con ✓;
  las luces de la puerta se encienden una a una; las hojas de la puerta se deslizan.
- Micro-animaciones ambientales (burbujas, vapor, LED, péndulo, pantallas): solo
  `transform` y `opacity`, y se desactivan con `prefers-reduced-motion`.

## 9. Personajes e ilustraciones de la historia

- **Solo Volti tiene rostro** (expresiones: neutral, pensando, contento, dormido).
- Los estudiantes se dibujan **de espaldas** (se ve el pelo y la mochila), con ropa y mochilas de la
  paleta y tonos de piel variados (`--madera-l`, `--madera`, `--naranja-l`).
- El doctor Ámbar aparece **solo a contraluz**: silueta oscura con un borde de luz y el reflejo de sus
  anteojos. Su símbolo es una gema de ámbar (el ámbar dio nombre a la electricidad).
- Las ilustraciones de la historia miden **1600 × 640** y se componen con los mismos muebles y objetos
  de las salas (`js/art/historia.js`). Cada sala tiene un ícono de 120 × 120 en su color de acento.

## 10. Componentes y reemplazos

Cada componente está registrado con un identificador y una caja nominal (ancho × alto)
en `js/art/`. El docente puede sustituir cualquiera desde `js/art/registro.js`
(ver README, sección «Reemplazar arte»). Abre `index.html?galeria` para ver todos los
identificadores con su tamaño.
