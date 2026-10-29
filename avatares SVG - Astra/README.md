# Avatares SVG · Astra

Colección de **14 avatares**, comenzada por Guillermo Aladro, vectorizada a partir de las referencias actuales de `animaciones/`. Cada hoja conserva sus cuatro vistas de cuerpo completo, sus seis expresiones y sus rasgos, ropa y accesorios originales.

![Colección SVG Astra](Coleccion-preview.jpg)

| Avatar | SVG completo | Vista previa |
|---|---|---|
| Guillermo Aladro | [SVG](Guillermo-Aladro.svg) | [PNG](Guillermo-Aladro-preview.png) |
| Ander | [SVG](Ander.svg) | [PNG](Ander-preview.png) |
| Carla | [SVG](Carla.svg) | [PNG](Carla-preview.png) |
| Dari | [SVG](Dari.svg) | [PNG](Dari-preview.png) |
| Deivi | [SVG](Deivi.svg) | [PNG](Deivi-preview.png) |
| Gabacho | [SVG](Gabacho.svg) | [PNG](Gabacho-preview.png) |
| Kiriku | [SVG](Kiriku.svg) | [PNG](Kiriku-preview.png) |
| Laura | [SVG](Laura.svg) | [PNG](Laura-preview.png) |
| Marcos Bombero | [SVG](Marcos-Bombero.svg) | [PNG](Marcos-Bombero-preview.png) |
| Marta | [SVG](Marta.svg) | [PNG](Marta-preview.png) |
| Paradigma | [SVG](Paradigma.svg) | [PNG](Paradigma-preview.png) |
| Rodri | [SVG](Rodri.svg) | [PNG](Rodri-preview.png) |
| Sara Saez | [SVG](Sara-Saez.svg) | [PNG](Sara-Saez-preview.png) |
| Yorgi | [SVG](Yorgi.svg) | [PNG](Yorgi-preview.png) |

Todos los SVG contienen trazados y gradientes autónomos. Los archivos PNG/JPG son únicamente vistas previas separadas. Cada SVG conserva en sus metadatos el archivo de referencia y su hash de Git. Las dimensiones siguen las de cada hoja original.

Se han revisado las caras, expresiones, siluetas, ropa y accesorios frente a las referencias. La camiseta blanca de Laura dispone de un recorte específico para conservarla íntegra, y Marcos Bombero utiliza la referencia actual con casco y manguera.

El [informe de la colección](control-calidad-coleccion.json) registra procedencia, huellas, recuentos y comprobaciones estructurales de todos los SVG.

## Guillermo Aladro

[Abrir el SVG completo](Guillermo-Aladro.svg) · [Vista previa](Guillermo-Aladro-preview.png) · [Vistas y expresiones individuales](Guillermo-Aladro/)

Vectorización de alta densidad de la referencia actual del repositorio: **cuatro vistas de cuerpo completo y seis expresiones**, manteniendo el rostro, el peinado, el vestuario, el reloj, las zapatillas, las poses y el nombre originales. Se han limpiado el fondo y las sombras de apoyo.

- **125.827 trazados de ilustración y 87.822 gradientes de tono**, además de los recortes y las sombras vectoriales.
- SVG autónomo: geometría y gradientes reales; no contiene un PNG/JPG incrustado, fuentes externas, scripts ni recursos remotos.
- Hoja maestra de `1122 × 1402` unidades, con `viewBox` y capas identificadas.
- Diez SVG individuales: frontal, tres cuartos, perfil, espalda, serio, sonrisa, sorpresa, cansancio, ojos cerrados y ceño fruncido.
- Fondo blanco. Las vistas individuales son ilustraciones estáticas de las poses existentes, no un esqueleto de animación articulado.

### Referencia y revisión

Referencia: [`animaciones/Avatar Guillermo Aladro.png`](../animaciones/Avatar%20Guillermo%20Aladro.png), blob Git `92ff45ef7481f430f566b3fa383be7f8ea242685`.

Se han comparado la hoja completa y ampliaciones de las caras, el pelo, los dedos, el reloj, las costuras y el calzado. Los recortes individuales se han revisado para eliminar fragmentos de figuras vecinas. Se han comprobado XML, identificadores, referencias internas y ausencia de imágenes incrustadas. Renderizado contrastado con CairoSVG y librsvg.

El [informe de comprobaciones](control-calidad-Guillermo-Aladro.json) registra archivos, huellas y métricas de comparación con la referencia. Estas métricas miden similitud de imagen; no certifican identidad facial ni perfección artística. El detalle procede de la referencia disponible, sin inventar rasgos que no aparecen en ella.

La hoja maestra ocupa aproximadamente **37 MB**. Para consultar el resultado rápidamente se puede abrir la vista previa; para editar una pose se puede utilizar su archivo individual.

### Reproducción

```bash
python -m pip install -r 'avatares SVG - Astra/herramientas/requirements.txt'
python 'avatares SVG - Astra/herramientas/generar_guillermo.py' /tmp/guillermo-svg-build
```

La reconstrucción utiliza la referencia ya guardada en el repositorio. Los PNG intermedios se guardan fuera de esta carpeta y no forman parte de los SVG.


Para reconstruir las demás hojas:

```bash
python 'avatares SVG - Astra/herramientas/generar_coleccion.py' /tmp/avatares-astra-build
```
