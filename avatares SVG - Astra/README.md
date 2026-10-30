# Avatares SVG · Astra

Colección de **14 avatares** vectorizados a partir de las hojas de `animaciones/`, con **fondo transparente** para la pantalla negra de la máquina. Cada avatar tiene su hoja completa y diez piezas sueltas (4 vistas de cuerpo entero y 6 expresiones): **154 SVG**. Todos llevan solo trazados y degradados vectoriales, sin imágenes incrustadas, scripts ni recursos externos.

**Estado actual:** [revisión y corrección del 30-10-2026](REVISION-TRANSPARENTE-2026-10-30.md) · [informe por archivo](revision-transparente-2026-10-30.json)

![Colección sobre negro](Coleccion-preview.jpg)

| Avatar | Hoja completa | Vista previa | Piezas |
|---|---|---|---|
| Ander | [SVG](Ander.svg) | [PNG](Ander-preview.png) | [10 piezas](Ander/) |
| Carla | [SVG](Carla.svg) | [PNG](Carla-preview.png) | [10 piezas](Carla/) |
| Dari | [SVG](Dari.svg) | [PNG](Dari-preview.png) | [10 piezas](Dari/) |
| Deivi | [SVG](Deivi.svg) | [PNG](Deivi-preview.png) | [10 piezas](Deivi/) |
| Gabacho | [SVG](Gabacho.svg) | [PNG](Gabacho-preview.png) | [10 piezas](Gabacho/) |
| Guillermo Aladro | [SVG](Guillermo-Aladro.svg) | [PNG](Guillermo-Aladro-preview.png) | [10 piezas + 2 escenas](Guillermo-Aladro/) |
| Kiriku | [SVG](Kiriku.svg) | [PNG](Kiriku-preview.png) | [10 piezas](Kiriku/) |
| Laura | [SVG](Laura.svg) | [PNG](Laura-preview.png) | [10 piezas](Laura/) |
| Marcos Bombero | [SVG](Marcos-Bombero.svg) | [PNG](Marcos-Bombero-preview.png) | [10 piezas](Marcos-Bombero/) |
| Marta | [SVG](Marta.svg) | [PNG](Marta-preview.png) | [10 piezas](Marta/) |
| Paradigma | [SVG](Paradigma.svg) | [PNG](Paradigma-preview.png) | [10 piezas](Paradigma/) |
| Rodri | [SVG](Rodri.svg) | [PNG](Rodri-preview.png) | [10 piezas](Rodri/) |
| Sara Saez | [SVG](Sara-Saez.svg) | [PNG](Sara-Saez-preview.png) | [10 piezas](Sara-Saez/) |
| Yorgi | [SVG](Yorgi.svg) | [PNG](Yorgi-preview.png) | [10 piezas](Yorgi/) |

Las vistas previas muestran el SVG sobre negro, como se verá en la pantalla.

## Piezas: mismos nombres en los 14

| Archivo | Pieza |
|---|---|
| `01-frontal.svg` · `02-tres-cuartos.svg` · `03-perfil.svg` · `04-espalda.svg` | Vistas de cuerpo entero |
| `05-neutral.svg` | Expresión neutral |
| `06-risa.svg` | Risa |
| `07-sorpresa.svg` | Sorpresa |
| `08-cansancio.svg` | Cansancio, mano en la mejilla |
| `09-ojos-cerrados.svg` | Ojos cerrados |
| `10-guino.svg` | Guiño (Guillermo: `10-ceno-fruncido.svg`, porque su hoja tiene el ceño fruncido) |

- **Hoja completa:** mismas medidas que la hoja original (1122 × 1402; Marcos Bombero, 1071 × 1469). Incluye la firma manuscrita.
- **Piezas:** el `viewBox` es la zona de la hoja que ocupa la silueta más 8 px de margen. Así, todas las piezas de un avatar comparten escala y se pueden colocar en su posición original. La caja está también en `<metadata id="procedencia">`.

## Uso en la máquina (Raspberry Pi 3B+)

Son SVG muy detallados (las piezas pesan entre 2 y 7 MB y tienen miles de trazados). Hay que **rasterizar cada pieza una sola vez al cargar**, al tamaño en que se va a mostrar, y en cada fotograma pintar ese bitmap:

```js
const img = new Image();
img.src = 'avatares SVG - Astra/Laura/06-risa.svg';
await img.decode();
const h = 350, w = Math.round(h * img.naturalWidth / img.naturalHeight);
const sprite = new OffscreenCanvas(w, h);
sprite.getContext('2d').drawImage(img, 0, 0, w, h);
// En cada fotograma: ctx.drawImage(sprite, x, y);
```

En este entorno, Chromium decodifica cada pieza en unos 0,7 s de media. En la Pi tardará más, así que conviene precargarlas en el arranque. El rendimiento en la Pi está sin medir.

## Escenas de Guillermo

[`escena-cerveza`](Guillermo-Aladro/escena-cerveza/) y [`escena-cerveza-frontal`](Guillermo-Aladro/escena-cerveza-frontal/) no se modifican en esta revisión. Son SVG animados autónomos, generados a partir de la versión anterior de `01-frontal.svg` y `03-perfil.svg`. Sus generadores funcionan igual con las piezas transparentes: se han regenerado con ellas en una copia y dan el mismo resultado a 0 y 5 s en Chromium.

## Herramientas

**Versión actual (fondo transparente):**

- [`herramientas/rehacer_transparentes.py`](herramientas/rehacer_transparentes.py) genera las 154 piezas a partir de las hojas maestras y de las siluetas guardadas en [`herramientas/mascaras/`](herramientas/mascaras/). Es idempotente: si se vuelve a ejecutar sobre su propia salida, da los mismos bytes.
- [`herramientas/verificar_transparentes.py`](herramientas/verificar_transparentes.py) comprueba la estructura, la transparencia, la silueta y el color frente a la hoja original. También deja hojas de revisión sobre negro.
- [`herramientas/generar_mascaras.py`](herramientas/generar_mascaras.py), [`siluetas.py`](herramientas/siluetas.py) y [`preparar_anteriores.py`](herramientas/preparar_anteriores.py) sirven para volver a calcular las siluetas si cambia una hoja de `animaciones/`.

```sh
pip install -r "avatares SVG - Astra/herramientas/requirements-transparentes.txt"
python3 "avatares SVG - Astra/herramientas/rehacer_transparentes.py" /tmp/astra-salida
python3 "avatares SVG - Astra/herramientas/verificar_transparentes.py" /tmp/astra-salida /tmp/astra-revision
```

**Versión anterior (fondo blanco):** `generar_guillermo.py`, `generar_coleccion.py`, `separar_avatar_individual.py`, `revisar_recortes_guillermo.py`, `recuperar_camiseta_paradigma.py`, `refine_colors.py` y `auditar_*.py`, junto con los `regiones*.json` y `correccion-camiseta.json` de cada carpeta. Se conservan como historial. Ya no producen los archivos publicados.

## Historial

- [Revisión individual del 30-10-2026 (mañana)](REVISION-INDIVIDUAL-2026-10-30.md) y [revisión final anterior](REVISION-FINAL.md): describen la versión con fondo blanco. Sus informes (`revision-individual-2026-10-30.json`, `revision-final-*.json`, `control-calidad-coleccion.json`, `control-calidad-Guillermo-Aladro.json`) llevan las huellas de esa versión.
- [Revisión del 30-10-2026 (fondo transparente)](REVISION-TRANSPARENTE-2026-10-30.md): versión vigente.
