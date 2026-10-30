# Guillermo Aladro · SVG con fondo transparente

Cuatro vistas de cuerpo entero y seis expresiones, recortadas de la [hoja maestra](../Guillermo-Aladro.svg) con fondo transparente para la pantalla negra de la máquina. Conservan los trazados y degradados de la hoja; no llevan imágenes incrustadas.

![Vistas sobre negro](vistas-preview.jpg)

| Archivo | Pieza | viewBox (x · y · ancho · alto en la hoja) | Peso |
|---|---|---|---|
| [01-frontal.svg](01-frontal.svg) | Vista frontal | 92 · 82 · 351 · 919 | 7.3 MB |
| [02-tres-cuartos.svg](02-tres-cuartos.svg) | Vista de tres cuartos | 413 · 83 · 256 · 914 | 6.2 MB |
| [03-perfil.svg](03-perfil.svg) | Vista de perfil | 654 · 94 · 195 · 904 | 4.7 MB |
| [04-espalda.svg](04-espalda.svg) | Vista de espalda | 827 · 85 · 295 · 911 | 6.0 MB |
| [05-neutral.svg](05-neutral.svg) | Expresión neutral | 0 · 1014 · 208 · 318 | 2.1 MB |
| [06-risa.svg](06-risa.svg) | Risa | 164 · 1022 · 230 · 310 | 2.3 MB |
| [07-sorpresa.svg](07-sorpresa.svg) | Sorpresa | 352 · 1020 · 214 · 312 | 2.2 MB |
| [08-cansancio.svg](08-cansancio.svg) | Cansancio, mano en la mejilla | 525 · 1032 · 222 · 301 | 2.5 MB |
| [09-ojos-cerrados.svg](09-ojos-cerrados.svg) | Ojos cerrados | 720 · 1022 · 213 · 310 | 2.2 MB |
| [10-ceno-fruncido.svg](10-ceno-fruncido.svg) | Ceño fruncido | 901 · 1017 · 221 · 315 | 2.2 MB |

La décima expresión de Guillermo es el ceño fruncido (en los demás avatares es un guiño). Las escenas [`escena-cerveza`](escena-cerveza/) y [`escena-cerveza-frontal`](escena-cerveza-frontal/) no cambian: son autónomas y sus generadores funcionan igual con `01-frontal.svg` y `03-perfil.svg` transparentes (comprobado a 0 y 5 s en Chromium).

El `viewBox` de cada pieza usa las coordenadas de la hoja con 8 px de margen alrededor de la silueta, así que todas las piezas de un avatar comparten escala. La hoja de referencia es [`animaciones/Avatar Guillermo Aladro.png`](../../animaciones/Avatar%20Guillermo%20Aladro.png).

[Control de calidad](control-calidad.json) · [Revisión del 30-10-2026](../REVISION-TRANSPARENTE-2026-10-30.md)
