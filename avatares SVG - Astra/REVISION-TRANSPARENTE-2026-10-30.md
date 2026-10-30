# Revisión del 30-10-2026 · fondo transparente

He revisado uno a uno los **154 SVG estáticos** de la colección (14 hojas maestras y 140 piezas) a partir del commit `0aa384a`. Cada pieza se ha renderizado y comparado con su recorte de la hoja original de `animaciones/`, tanto sobre blanco como **sobre negro, que es como se verá en la pantalla de la máquina**. Las dos escenas animadas de Guillermo no se han modificado.

## Qué no era coherente

1. **Fondo blanco incrustado.** Los 154 SVG llevaban un rectángulo blanco de fondo. Las hojas maestras y las vistas de cuerpo de Guillermo, además, llevaban sombras de suelo. Sobre la pantalla negra, cada pieza salía como un rectángulo blanco con el personaje dentro.
2. **Siluetas con fondo dentro y partes fuera.** Al quitar el fondo, las siluetas anteriores dejaban **169.128 px de blanco del fondo** dentro del recorte. Más de la mitad era un filo de 1 a 3 px a lo largo del contorno, que sobre negro se ve como un halo blanco. El resto eran manchas mayores; la más grande, un bloque de fondo delante del pecho en el perfil de Laura. Además dejaban fuera **47.572 px del personaje**, sobre todo en las vistas de cuerpo.
3. **Nombres distintos para la misma expresión.** Guillermo usaba `05-serio` y `06-sonrisa`, y Carla `06-sonrisa`, mientras que los otros doce usaban `05-neutral` y `06-risa`.
4. **Estructura distinta entre avatares.** Unos llevaban un recorte doble y otros uno solo; Guillermo tenía otra organización de capas y sombras en las vistas, y los márgenes del `viewBox` variaban.

## Qué se ha cambiado

- **Fondo transparente** en los 154 archivos, sin sombras de suelo. La hoja completa conserva la firma.
- **Siluetas nuevas** para las 140 piezas y las 14 hojas, con un modelo de segmentación sobre la hoja original y limpiadas para el negro: sin filo claro en el pelo, sin blanco atrapado entre rizos, sin líneas de borde de panel ni cuñas de fondo junto a los hombros. Se conservan la ropa blanca (Laura, Paradigma), las zapatillas blancas, la visera transparente del casco de Marcos y la manguera hasta el borde de la hoja. Las máscaras están en `herramientas/mascaras/`.
- **Trazados y degradados intactos.** Son los de la hoja maestra Astra, sin volver a vectorizar. Solo cambia el recorte.
- **Nombres y estructura iguales en los 14 avatares:** `01-frontal` … `10-guino`, un único recorte (`silueta`) y un `viewBox` con 8 px de margen en coordenadas de la hoja. Las excepciones son todas de Guillermo: `10-ceno-fruncido`, porque su hoja no tiene guiño; sus vistas `01`–`04`, que mantienen el id de recorte que esperan los generadores de las escenas; y sus retratos, que combinan además los recortes de su capa y de las vecinas, porque en su hoja el pelo cruza las particiones.
- **Vistas previas sobre negro, README y control de calidad nuevos** en cada carpeta.

## Resultado por avatar

Medido a la resolución de la hoja. «Fondo quitado» es el blanco de fondo que el recorte anterior dejaba dentro de la silueta; «Personaje recuperado» es la parte del personaje que dejaba fuera. IoU es la coincidencia entre el SVG renderizado y la silueta, y el error es la diferencia media de color (0–255) dentro de la silueta frente a la hoja original.

| Avatar | Fondo quitado (px) | Personaje recuperado (px) | Pieza con más fondo | IoU mín. | Error medio | Notas |
|---|---:|---:|---|---:|---:|---|
| [Ander](Ander/) | 9.293 | 2.195 | `02-tres-cuartos` (4.071 px) | 0,997 | 2,2 |  |
| [Carla](Carla/) | 10.538 | 303 | `04-espalda` (3.217 px) | 0,995 | 2,2 | `06-sonrisa`→`06-risa`. |
| [Dari](Dari/) | 10.288 | 4.295 | `02-tres-cuartos` (2.935 px) | 0,997 | 2,6 | Sin blanco atrapado entre los rizos. |
| [Deivi](Deivi/) | 9.159 | 4.947 | `04-espalda` (1.960 px) | 0,996 | 2,2 | Las esquinas inferiores de `05` y `10` son camiseta (llega al borde de la hoja). |
| [Gabacho](Gabacho/) | 14.494 | 5.669 | `07-sorpresa` (3.634 px) | 0,993 | 2,8 | Un rizo suelto en `10-guino` es del dibujo original. |
| [Guillermo Aladro](Guillermo-Aladro/) | 17.574 | 1.962 | `02-tres-cuartos` (4.184 px) | 0,994 | 2,7 | `05-serio`→`05-neutral`, `06-sonrisa`→`06-risa`; sombras de suelo fuera de las vistas de cuerpo; la escena de cerveza sigue funcionando. |
| [Kiriku](Kiriku/) | 11.398 | 3.927 | `02-tres-cuartos` (3.348 px) | 0,996 | 2,2 |  |
| [Laura](Laura/) | 26.279 | 1.741 | `03-perfil` (7.336 px) | 0,996 | 2,1 | Camiseta blanca íntegra en las seis expresiones. |
| [Marcos Bombero](Marcos-Bombero/) | 14.571 | 851 | `01-frontal` (6.097 px) | 0,997 | 2,9 | Visera transparente del casco conservada; sin sombra de contacto bajo las botas. |
| [Marta](Marta/) | 6.081 | 4.694 | `02-tres-cuartos` (1.122 px) | 0,997 | 2,4 |  |
| [Paradigma](Paradigma/) | 8.431 | 5.862 | `04-espalda` (1.249 px) | 0,996 | 2,4 | Camiseta blanca íntegra en las seis expresiones. |
| [Rodri](Rodri/) | 7.691 | 4.026 | `02-tres-cuartos` (2.307 px) | 0,997 | 2,6 |  |
| [Sara Saez](Sara-Saez/) | 15.765 | 5.091 | `02-tres-cuartos` (4.380 px) | 0,996 | 2,1 |  |
| [Yorgi](Yorgi/) | 7.566 | 2.009 | `01-frontal` (1.618 px) | 0,996 | 2,5 |  |

## Comprobaciones

- **154/154:** XML válido, ids únicos, referencias internas resueltas, sin imágenes, scripts ni recursos externos. Fondo transparente: las esquinas son transparentes salvo donde la ropa toca el borde de la hoja (Deivi y Laura, retratos `05` y `10`).
- **140/140 piezas:** IoU entre el render (resvg) y la silueta ≥ 0,993; error medio de color frente a la hoja entre 2,1 y 2,9 sobre 255. Ninguna pieza tiene fragmentos sueltos, salvo un rizo de Gabacho que está en el dibujo.
- **Chromium:** las 140 piezas se decodifican y conservan la transparencia.
- **Revisión visual:** cada avatar, completo y ampliado en pelo, zapatillas, manos, ropa blanca y bordes de retrato, comparado con la hoja original.
- **Escenas:** los dos generadores de `escena-cerveza*` se han ejecutado con las nuevas `01-frontal.svg` y `03-perfil.svg` en una copia, con el mismo resultado a 0 y 5 s en Chromium. Las escenas publicadas no cambian.
- **Reproducible:** `rehacer_transparentes.py` regenera los 154 archivos desde las hojas y las máscaras, y al volver a ejecutarse sobre su propia salida da los mismos bytes.

## Límites

- Los pelos sueltos más finos quedan algo simplificados en el contorno, porque la silueta es un trazado vectorial a resolución ×2.
- La firma conserva su tinta oscura, así que sobre negro casi no se ve.
- El rendimiento en la Raspberry Pi 3B+ no está medido. Conviene rasterizar cada pieza una vez al cargar (ver el README).
- Las métricas miden similitud con la hoja, no identidad facial ni calidad artística.

Detalle por archivo (huellas, `viewBox`, recuentos y métricas): [`revision-transparente-2026-10-30.json`](revision-transparente-2026-10-30.json).
