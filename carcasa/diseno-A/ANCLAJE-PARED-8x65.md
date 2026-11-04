# Anclaje a pared — diseño A, tacos fischer SX Plus 8×65
Actualización: 04-11-2026 (trasera de 3 mm y patrón **P18-3**). Alcance: herrajes, posición de los agujeros y procedimiento de montaje.

## Especificación de proyecto (condicionada al soporte)
| Elemento | Elección | Observaciones |
|---|---|---|
| H16 | 18 tacos fischer **SX Plus 8×65 L**, referencia **568108**, caja comercial de 50 | Diámetro 8 mm, longitud 65 mm; admitir tornillo Ø4,5–6,0 según fischer |
| H14 | 18 tirafondos hexagonales **DIN 571 Ø6×80 mm** | Comprobar fabricante, rosca efectiva y longitud en obra |
| H15 | 18 arandelas **M6 DIN 9021**, ancho aprox. 18 mm | Cada una reparte el apoyo sobre la chapa |
| Agujero en chapa | **Ø6,5 mm** | Pasa tornillo Ø6; la arandela mantiene el apoyo |
| Taladro en soporte | **Ø8 mm** | Para taco 8×65; no Ø10 |
| Profundidad de taladro | Fischer **h1 ≥75 mm**; objetivo de montaje directo **85 mm** cuando el muro macizo lo permita | 85 mm permite que un Ø6×80 (con chapa de 3 mm + arandela ~1,6 mm) no choque con el fondo. El criterio del fabricante manda para otros soportes |
| Apriete | Llave de vaso **10 mm** para cabeza hexagonal Ø6 DIN 571 | Sin par universal: aplicar la ficha del tornillo/taco y evitar sobreapriete |

**Cálculo de longitud (solo caso de montaje directo sobre muro macizo y sin revestimiento):**
Longitud de tornillo aconsejada ≥ longitud taco (65) + espesor chapa (3) + arandela (~1,6) + salida útil de punta (~6) = **75,6 mm**. La elección nominal de **80 mm** deja margen de penetración, pero exige holgura en el fondo del orificio. Penetración nominal desde la cara de apoyo: 80 − 3 − 1,6 = **75,4 mm**; con un taladro de **85 mm**, margen ~**9,6 mm**. Son medidas nominales: comprobar cabezas, espesor real y tolerancias. Para revestimientos no portantes el cálculo cambia: el taco debe trabajar en el soporte resistente y el tornillo podría requerir más longitud.

## Disposición: patrón P18-3
- Carcasa: **220×100×442,5 mm**; trasera de **3 mm** (desde el 04-11-2026; antes 2 mm).
- 18 orificios Ø6,5 en la trasera, **simétricos** respecto al eje de la máquina. Calculados para que el tornillo más cargado lleve lo menos posible en el peor caso (ver [cálculo](calculo-anclajes/README.md)).
- Coordenadas (x desde el eje, + a la derecha mirando la máquina de frente; z desde la base):

| Por cada lado | x (mm) | z (mm) | Dónde |
|---|---|---|---|
| 1 | ±87,5 | 428,5 | Franja de arriba, entre el apoyo de la tapa interior y el canto |
| 2 | ±87 | 376,5 | Junto al pliegue lateral |
| 3 | ±91,5 | 325,5 | Junto al pliegue lateral |
| 4 | ±93 | 275,5 | Junto al pliegue lateral |
| 5 | ±93 | 224,5 | Junto al pliegue lateral |
| 6 | ±38,5 | 223,5 | Entre las guías traseras |
| 7 | ±54 | 175,5 | Justo encima de la bandeja |
| 8 | ±93 | 139,5 | Justo debajo de la bandeja |
| 9 | ±47,5 | 22 | Abajo, junto al pliegue del suelo |

- 14 tornillos quedan detrás del cajón de componentes y 4 detrás del cajón de pajitas.
- Los agujeros esquivan la bandeja, el apoyo de la tapa interior, las guías traseras (pletinas en x = ±64…76) y el espárrago de tierra, sin que la arandela toque ninguna pieza (queda a ≥ 1 mm del canto de las guías y a ≥ 2 mm de las demás pestañas y soldaduras). Separación mínima entre agujeros: **50 mm**.
- La plantilla es el DXF **A-C02** (a escala 1:1, su parte central es la trasera). Atención: esto **no certifica** la compatibilidad del patrón con las distancias mínimas a bordes y a otros anclajes según cada pared.
- El patrón anterior (3 columnas × 6 filas, x = −85, 0, 85) **ya no vale**: con la trasera de 3 mm las guías son pletinas planas y sus agujeros de x = ±85 quedarían pegados a ellas.

## Capacidad calculada
Del [cálculo](calculo-anclajes/README.md#11-cuánto-aguanta) (modelo de elementos finitos de la trasera de 3 mm, con el peso de cálculo de 18 kg), hasta que el taco más cargado llega a la carga recomendada de fischer para un taco aislado:

| Pared | Tirón en la esquina de arriba más desfavorable | Patrón anterior 3 × 6, para comparar |
|---|---|---|
| Hormigón ≥ C20/25 | ≈ 6,0 kN (unos 610 kg de fuerza) | 3,0 kN |
| Ladrillo macizo ≥ Mz 12 | ≈ 3,2 kN | 1,6 kN |
| Ladrillo perforado ≥ HLz 12 | ≈ 1,6 kN | 0,8 kN |
| Bloque hueco de hormigón (enlucido) | ≈ 1,2 kN | 0,6 kN |

- Una persona de 80 kg que se deja caer colgada del borde (≈ 1,6 kN) queda cubierta en todas las paredes con dato de fischer.
- En hormigón y ladrillo macizo, la chapa se deforma de forma permanente junto a las arandelas de arriba antes de que lleguen los tacos: a partir de **≈ 1,8 kN** de tirón en la esquina (con la chapa de 2 mm era ≈ 0,9 kN). No es una rotura, pero queda marcada.
- Son cargas de cálculo con el criterio de fischer, **no** cargas certificadas del conjunto: hacen falta ensayos de arrancamiento en la pared real y uno de la máquina montada.

## Instalación
1. **Identificar y verificar el muro** (hormigón, ladrillo macizo/perforado, bloque, pladur; resistencia, espesor portante, juntas, revestimiento y canalizaciones). No fijar el equipo solo a un revestimiento o yeso.
2. Comprobar las distancias a borde y entre taladros para el material real; la separación mínima entre agujeros del patrón es de 50 mm. En mampostería perforada, los 18 taladros pueden debilitar unidades; no asumir independencia.
3. En ladrillo, localizar las juntas (o hacer un taladro piloto de Ø4 en los agujeros de la franja de arriba) y subir o bajar la máquina hasta que la fila de arriba caiga en ladrillo; los tacos que aun así caigan en junta se omiten (fischer: no anclar en juntas). No dejar sin tornillo ninguno de los dos de arriba.
4. Para **muro macizo apto**, trasladar el patrón del DXF, taladrar **Ø8 mm**, profundidad efectiva **85 mm dentro de soporte portante** (el fabricante pide h1 ≥75 mm para taco 8×65). Antes de perforar, comprobar espesor útil del muro y ausencia de cables/tuberías; si no existe profundidad suficiente, seleccionar otro anclaje.
5. Limpiar cada agujero; introducir un SX Plus 8×65 según su ficha; presentar la carcasa desmontando antes sus cajones para acceder a los 18 orificios.
6. Colocar cada arandela DIN 9021 M6 y tirafondo Ø6×80, apretar progresivamente sin sobreapretar, sin que el tirafondo toque el fondo, y revisar que la chapa asiente correctamente sobre la pared. Los agujeros de los lados quedan a 14 mm de la cara interior del lateral: cabe una llave de vaso de 10 mm.
7. Comprobar fijación, integridad del muro, holguras del cajón y acceso para mantenimiento. En obra, registrar material de soporte y modelo exacto del taco y tornillo.

## Límites y pendientes
- **Ladrillo hueco/perforado o bloque hueco:** diámetro y profundidad no bastan para validar por sí solos. Pueden requerirse otras fijaciones homologadas o perforación sin percusión y selección de puntos sobre tabiques internos; decidir tras identificar el material y fabricante.
- **Pladur:** no utilizar los SX Plus 8×65 en la placa como soporte principal de una máquina pública expuesta a tirones; anclar a estructura/refuerzo diseñado y verificado.
- **Revestimientos gruesos:** el tirafondo 6×80 puede quedar corto si el taco se coloca dentro de la fábrica portante. Adaptar longitudes tras medir el espesor no resistente.
- Las cargas de fabricante se refieren a **un anclaje** en condiciones de ensayo; **no multiplicar por 18** para certificar un grupo de anclajes. Se debe comprobar la pared y acciones accidentales (tirón, cuelgue, impacto).
- La lista `Lista_de_piezas.xlsx` se ha regenerado el 04-11-2026 con H14/H16; los dos artículos muestran **precio 0 € solo como dato pendiente**, no como coste cero. Revisar el paquete y precio antes de comprar.

## Fuentes oficiales
- [Fischer SX Plus 8×65, características técnicas (Ø8, h1 75 mm, Ø tornillo 4,5–6,0)](https://www.fischer.es/es-es/productos/fijaciones-estandar/fijaciones-de-nylon/taco-de-expansion-sx-plus/567857-taco-sx-plus-8x65-k-nv-antes-532677)
- [Fischer SX Plus 8×65 L, referencia 568108 y pack de 50](https://shop.fischer.es/collections/accesorios-para-anclaje-de-tubos-en-hormigon/products/taco-sx-plus-8x65-largo-sin-tornillo-50-unidades)
- [Tabla de cargas recomendadas Fischer SX Plus (individuales y sujetas a condiciones)](https://fiproductmedia.azureedge.net/media/Load%20Tables/Load%20Tables%20fischer/LT_SX-PLUS_EN_T1.pdf)
