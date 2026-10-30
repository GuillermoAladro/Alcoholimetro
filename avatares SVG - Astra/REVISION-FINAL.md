# Revisión final de los SVG publicados

Este documento registra la revisión anterior. La [revisión individual del 30 de octubre de 2026](REVISION-INDIVIDUAL-2026-10-30.md) comprueba de nuevo los 156 SVG y corrige las incompatibilidades de las escenas con Inkscape y CairoSVG descritas más abajo.

Se han revisado **los 14 avatares, uno por uno**, después de completar su publicación: **14 hojas maestras y 140 vistas individuales, 154 SVG estáticos en total**. Cada personaje dispone de cuatro vistas de cuerpo y seis expresiones. También se han comprobado la estructura y el fotograma estático de las dos escenas SVG de Guillermo que ya existían en esta carpeta.

Versión de los archivos comprobados: [`1cc10ab5dfff`](https://github.com/GuillermoAladro/Alcoholimetro/commit/1cc10ab5dfffa7f09ed42ce6bbc6a4e18aa5f1bb). Fecha: 2026-10-30 (UTC).

| Avatar | SVG revisados | Detalles de la revisión |
|---|---:|---|
| [Guillermo Aladro](Guillermo-Aladro/) | 11/11 | Pelo completo en los seis retratos; cuatro cuerpos originales conservados. |
| [Ander](Ander/) | 11/11 | Sudadera azul, cordones, capucha y barba corta. |
| [Carla](Carla/) | 11/11 | Pelo ondulado, joyería, tatuajes y botines negros. |
| [Dari](Dari/) | 11/11 | Gafas, rizos, bigote, perilla y chaqueta beige. |
| [Deivi](Deivi/) | 11/11 | Camiseta lila, pelo ondulado y rostro sin barba. |
| [Gabacho](Gabacho/) | 11/11 | Separación de mangas; escudo, estrellas y ribetes tricolores. |
| [Kiriku](Kiriku/) | 11/11 | Polo, jersey sobre hombros, gafas y límites entre retratos. |
| [Laura](Laura/) | 11/11 | Camiseta blanca íntegra, aros y frontal sin restos del nombre. |
| [Marcos Bombero](Marcos-Bombero/) | 11/11 | Casco, visor, bandas reflectantes, mangueras y botas. |
| [Marta](Marta/) | 11/11 | Textura del cárdigan, botones, pinza y mano de cansancio. |
| [Paradigma](Paradigma/) | 11/11 | Camiseta blanca con tonos y costuras recuperados en los seis retratos. |
| [Rodri](Rodri/) | 11/11 | Flequillo, barba, chaqueta acolchada y separación de los dos primeros retratos. |
| [Sara Saez](Sara-Saez/) | 11/11 | Piercing, pendientes, cruz, pelo largo y pantalón cargo. |
| [Yorgi](Yorgi/) | 11/11 | Barba, pendientes, reloj y separación curva de los últimos retratos. |

## Comprobaciones realizadas

- Coincidencia de cada archivo con su blob publicado en GitHub y de las 14 referencias originales con sus hashes.
- XML válido, identificadores únicos, referencias internas resueltas y geometría vectorial, sin imágenes incrustadas ni recursos externos.
- Renderizado nuevo de los 154 SVG estáticos mediante Inkscape; integridad de los PNG de revisión comprobada.
- Comparación visual de cada hoja con su referencia, de las cuatro vistas completas y de las seis expresiones ampliadas. Revisión de pelo, rasgos, manos, ropa, accesorios, márgenes y posibles fragmentos vecinos.
- Conservación de los trazados y gradientes de las hojas detalladas. Los límites de separación se adaptaron a cada personaje.

## Correcciones realizadas durante la revisión final

**Guillermo Aladro:** se corrigieron los seis encuadres de retrato para conservar el pelo que atravesaba las particiones internas de la hoja y eliminar restos de retratos vecinos. La hoja maestra y las cuatro vistas originales de cuerpo permanecen idénticas.

**Paradigma:** se corrigió la máscara que confundía tonos muy claros de la camiseta con el fondo. Se recuperaron las costuras y el sombreado en las seis expresiones, manteniendo los trazados, gradientes y sombras originales. La máscara no cambia fuera de las seis regiones revisadas. Se volvieron a publicar y revisar la hoja y sus diez vistas. [Detalle de la corrección](Paradigma/correccion-camiseta.json).

## Escenas preexistentes

Las escenas de Guillermo [frontal](Guillermo-Aladro/escena-cerveza-frontal/) y [de perfil](Guillermo-Aladro/escena-cerveza/) conservan sus archivos originales. Se verificaron sus hashes, estructura vectorial, referencias internas y renderizado estático con CairoSVG. Sus referencias `use href` de SVG2 no se muestran completas en Inkscape 1.2; CairoSVG sí las resuelve. Esta revisión no vuelve a certificar la reproducción completa de sus animaciones SMIL.

## Evidencia y reproducción

El [informe completo](revision-final-publicada.json) contiene los hashes, tamaños, recuentos, notas visuales y resultados por archivo. El [manifiesto](revision-final-manifiesto.json) fija los SVG y sus referencias al commit comprobado. Los [controles de las hojas maestras](control-calidad-coleccion.json) y de [Guillermo](control-calidad-Guillermo-Aladro.json) se han actualizado.

Con las dependencias de [herramientas/requirements.txt](herramientas/requirements.txt) e Inkscape instalado, se puede repetir la revisión de un personaje:

```bash
python "avatares SVG - Astra/herramientas/auditar_svg_publicados.py" \
  "Sara Saez" /tmp/revision-astra \
  "avatares SVG - Astra/revision-final-manifiesto.json"
```

El script comprueba los bytes publicados y produce las comparativas. La revisión visual queda pendiente hasta inspeccionarlas; no se aprueba automáticamente. Las métricas de similitud no sustituyen esa inspección.
