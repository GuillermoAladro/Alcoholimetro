# Revisión individual de los 156 SVG · 2026-10-30

Se han revisado individualmente **los 156 SVG de esta colección**: 14 hojas completas, 140 vistas y expresiones separadas, y las dos escenas animadas de Guillermo. Los 154 estáticos se conservan tras la revisión; se corrigen las dos escenas y se actualizan sus generadores para mantener las correcciones al reconstruirlas.

Versión de partida: [`842c9af8c436`](https://github.com/GuillermoAladro/Alcoholimetro/commit/842c9af8c436e415b2085c7d09aee58572c41911). El [informe por archivo](revision-individual-2026-10-30.json) contiene las huellas de cada SVG, sus comprobaciones y las de sus renders. Los SVG de esquemas eléctricos de otras carpetas no pertenecen a esta colección.

## Resultado por avatar

Cada fila incluye la hoja completa, las cuatro vistas de cuerpo y las seis expresiones. Se ha terminado la inspección de un personaje antes de avanzar al siguiente. Se compararon los renders nuevos con las referencias vigentes de `animaciones/`, ampliando las seis caras.

| Avatar | SVG revisados | Observaciones |
|---|---:|---|
| [Guillermo Aladro](Guillermo-Aladro/) | 11/11 | Cabello completo, rasgos y seis expresiones coherentes; reloj en muñeca izquierda, camiseta negra, vaqueros y zapatillas conservados. Sin fragmentos vecinos ni nuevos defectos de recorte. |
| [Ander](Ander/) | 11/11 | Pelo corto, cejas y barba coherentes en seis expresiones. Sudadera azul con capucha, cordones, bolsillo canguro, vaqueros y zapatillas consistentes en cuatro vistas. La mano de cansancio está completa. |
| [Carla](Carla/) | 11/11 | Pelo largo ondulado, pendientes, colgante y tatuaje del brazo izquierdo coherentes entre vistas. Top negro, vaqueros y botines de tacón bajo conservados. Seis expresiones y mano de cansancio sin recortes nuevos. |
| [Dari](Dari/) | 11/11 | Gafas alineadas con ojos y orejas, rizos íntegros, bigote y perilla coherentes. Chaqueta beige con capucha y cierres, manos y calzado conservados. Seis expresiones completas. |
| [Deivi](Deivi/) | 11/11 | Referencia actual con camiseta lila, pelo ondulado oscuro y rostro sin barba. Rasgos, seis expresiones, mano apoyada en mejilla, cuatro siluetas, vaqueros y zapatillas coherentes. |
| [Gabacho](Gabacho/) | 11/11 | Rizos, rasgos y seis expresiones coherentes. Camiseta de Francia: escudo y dos estrellas en pecho izquierdo, ribetes tricolores y detalle de nuca en vistas correctas. Se contrastó ampliado el ribete inferior del retrato de ojos cerrados: coincide con la referencia. |
| [Kiriku](Kiriku/) | 11/11 | Polo negro, jersey sobre los hombros y gafas colgadas del cuello conservan posición y forma; cabello corto y seis expresiones coherentes. Recortes separan correctamente cabezas, mano y ropa, sin fragmentos vecinos. |
| [Laura](Laura/) | 11/11 | Camiseta blanca completa con textura, escote y sombras conservados; pelo largo liso y aros coherentes. Frontal sin restos del nombre; manos, calzado y seis expresiones sin pérdidas de recorte. |
| [Marcos Bombero](Marcos-Bombero/) | 11/11 | Referencia vigente con casco amarillo, visor levantado, barboquejo y manguera en mano derecha; uniforme oscuro, bandas reflectantes y botas coherentes entre vistas. Casco y cara completos en seis expresiones; la salida de la manguera del encuadre coincide con la referencia. |
| [Marta](Marta/) | 11/11 | Cárdigan gris con punto y botones conservados; pinza de pelo visible donde corresponde en perfil y espalda. Rostro, cabello, mano de cansancio, mangas y seis expresiones coherentes. |
| [Paradigma](Paradigma/) | 11/11 | Se comprobaron especialmente las seis camisetas blancas: cuello, costuras y sombreado recuperados siguen íntegros. Pelo partido, bigote/perilla, chaqueta negra y vaqueros oscuros coherentes. Sin fragmentos de retratos vecinos ni nuevas correcciones. |
| [Rodri](Rodri/) | 11/11 | Pelo ondulado, barba, chaqueta acolchada negra con capucha y camiseta oscura coherentes. Costuras, manos en bolsillos, vaqueros y zapatillas conservados en las cuatro vistas. Seis expresiones completas, incluida la mano de cansancio. |
| [Sara Saez](Sara-Saez/) | 11/11 | Pelo largo oscuro, pendientes, piercing de nariz y colgante de cruz conservados. Top negro de manga larga, pantalón cargo, bolsillos y zapatillas coherentes en las cuatro vistas. Seis expresiones y mano de cansancio completas. |
| [Yorgi](Yorgi/) | 11/11 | Corte de pelo, barba, aros, camiseta azul oscura y reloj en muñeca izquierda coherentes. Vaqueros, manos en bolsillos y zapatillas conservados en las cuatro vistas. Seis expresiones completas, sin restos de retratos vecinos. |

No se han encontrado nuevos problemas de coherencia o recorte que justifiquen modificar estos 154 SVG. Se conservan las correcciones anteriores de cabello, camisetas blancas y separación entre retratos.

## Correcciones de las escenas

| Escena | Problema encontrado | Corrección |
|---|---|---|
| [Perfil](Guillermo-Aladro/escena-cerveza/) | Algunas piezas referenciadas con `href` no aparecían en Inkscape 1.2; CairoSVG interpretaba el recorte compuesto sin quitar el brazo original. | Referencias `href` y `xlink:href` equivalentes; contornos de sentido opuesto con regla `nonzero` para conservar el hueco del brazo. Se mantiene el aspecto en Chromium. |
| [Frontal](Guillermo-Aladro/escena-cerveza-frontal/) | Las mismas incompatibilidades, un pequeño hueco entre manga y hombro al levantar el brazo, y tres restos blancos junto a la ropa. | Compatibilidad de referencias y recorte; unión vectorial detrás de la manga; eliminación localizada de los tres restos. Vídeo y vista previa regenerados desde el SVG final. |

Los cambios también están en ambos `generar_escena.py`. No se han alterado los trazados de la cara ni del pelo. La geometría añadida en la escena frontal completa la camiseta bajo la articulación.

[Vista previa frontal actualizada](Guillermo-Aladro/escena-cerveza-frontal/Guillermo-Aladro-cerveza-frontal-preview.png) · [Vídeo frontal actualizado](Guillermo-Aladro/escena-cerveza-frontal/Guillermo-Aladro-cerveza-frontal.mp4)

## Comprobaciones realizadas

- **156/156 SVG:** XML válido, identificadores únicos, referencias internas resueltas y contenido vectorial sin imágenes incrustadas, scripts o recursos remotos.
- **154/154 estáticos:** bytes contrastados con los blobs publicados; render nuevo en Inkscape y lectura completa de cada PNG. Se revisaron pelo, caras, expresiones, manos, ropa, accesorios, siluetas y límites de los recortes.
- **Dos escenas:** línea de tiempo SMIL real comprobada en Chromium 153.0.8010.0 en 14 instantes por escena, sin errores. Las transformaciones de la pose coinciden exactamente a los 0 y 12 segundos; las capturas rasterizadas presentan pequeñas diferencias de suavizado de bordes.
- **Contacto del vaso:** 106 muestras por escena durante el sorbo, de 3,3 a 6,8 s. Error máximo borde-labios inferior a 0,001 píxeles en ambas.
- **Compatibilidad de las escenas:** fotogramas equivalentes de reposo y sorbo (0 y 5 s) en Chromium, Inkscape y CairoSVG, sin piezas ausentes ni brazo duplicado. Inkscape y CairoSVG se usan para fotogramas estáticos; la reproducción animada se verifica en Chromium.
- **Vídeo frontal:** 12 segundos, 1280 × 900, 24 fps y 288 fotogramas; decodificación completa sin errores. Vista previa extraída del SVG corregido.

La revisión comprueba coherencia con las referencias disponibles y consistencia de las exportaciones. Las métricas de imagen no certifican identidad facial ni perfección artística.
