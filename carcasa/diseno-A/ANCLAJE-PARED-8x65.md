# Anclaje a pared — diseño A, patrón P18-4

Actualización: **13-11-2026** (patrón **P18-4**, bloque 2). Sustituye a la ficha del 04-11 (patrón P18-3). Alcance: herrajes, posición de los 18 agujeros, plantilla, montaje con orden de apriete y ensayo en obra.

El cálculo, sus suposiciones y sus límites están en [`anclaje/ESTUDIO-ANCLAJE.md`](../../anclaje/ESTUDIO-ANCLAJE.md). **Nada está verificado con hardware.**

## 1. Dónde se puede colgar y dónde no

| Pared (con enlucido de yeso de 10–15 mm) | ¿Vale? | Coeficiente de seguridad calculado |
|---|---|---|
| Hormigón o pilar | Sí | ≈ 1,7 |
| Medio pie de ladrillo macizo | Sí | 1,71 (0,94 típico contando las juntas) |
| Medio pie de ladrillo perforado | Justo: vale para colgarse y tirar; los golpes laterales más fuertes pasan de lo que fischer recomienda | 0,94 (0,59 típico contando las juntas) |
| **Tabique de ladrillo hueco** (4 a 9 cm) | **No.** Ningún patrón llega con tacos de nailon | 0,11 |
| **Pladur** | **No** con estos tacos | — |

El coeficiente es la carga recomendada de fischer para un taco dividida por lo que le llega al anclaje más cargado en el peor de 26 casos supuestos (persona de 120 kg colgada, tirones de 1000 N, patada lateral de 4500 N…). Si la pared es de ladrillo hueco, ver las alternativas del apartado 10 del estudio antes de taladrar.

## 2. Material (por máquina)

| Elemento | Elección | Observaciones |
|---|---|---|
| H16 | 18 tacos fischer **SX Plus 8 × 65**, ref. **568108** (caja de 50) | Ø8 × 65 mm; tornillo de Ø4,5 a 6 según fischer |
| H14 | 18 tirafondos hexagonales **DIN 571 Ø6 × 80 mm de acero inoxidable A2** | Decidido el 13-11-2026. **No valen los cincados:** se oxidan y aguantan menos doblándose en el yeso (el cálculo cuenta con 500 MPa). Pedirlos con el marcado A2. Proveedor y precio, pendientes |
| H15 | 18 arandelas anchas **M6 DIN 9021** (Ø18 × 1,6), inoxidables | Una por tornillo. Del mismo material que el tirafondo |
| Agujero en la chapa | **Ø6,5 mm** | Ya viene cortado en la trasera (pieza A-C02) |
| Broca | **Ø8 mm**, de widia | Sin percutor en ladrillo perforado |
| Profundidad del taladro | **85 mm** desde la superficie del enlucido | fischer pide 75 mm como mínimo; con 85 el tirafondo de 80 no hace tope |
| Llaves | Fija o de carraca plana de **10 mm** y llave de vaso de 10 mm con carraca corta | El tirafondo mide 84 mm con la cabeza y delante de la trasera hay 86–94 mm: la llave de vaso solo cabe en los últimos 45 mm |

Longitud del tornillo: taco (65) + chapa (3) + arandela (1,6) + un diámetro de salida (6) = 75,6 mm → **80 mm**. Entra 75,4 mm en la pared; con el taladro de 85 mm quedan 9,6 mm de margen. El taco va **a ras del enlucido**: de sus 65 mm, unos 50 trabajan en ladrillo.

## 3. Los 18 agujeros: patrón P18-4

Un anillo pegado al perímetro de la trasera, simétrico: 3 arriba, 3 abajo y 6 en cada costado. **Mirando a la pared**, X desde la esquina inferior izquierda de la trasera (220 × 439,5 mm) y Z desde la base. La x del CAD es X − 110.

| N.º | X (mm) | Z (mm) | Dónde | | N.º | X (mm) | Z (mm) | Dónde |
|---|---|---|---|---|---|---|---|---|
| 1 | 110 | 429,5 | Arriba, centro | | 10 | 17 | 174,5 | Costado izq., justo encima de la bandeja |
| 2 | 26 | 420,5 | Arriba, izquierda | | 11 | 203 | 174,5 | Costado dcho., justo encima de la bandeja |
| 3 | 194 | 420,5 | Arriba, derecha | | 12 | 17 | 96,5 | Costado izq., tras el cajón de pajitas |
| 4 | 17 | 363,5 | Costado izquierdo | | 13 | 203 | 96,5 | Costado dcho., tras el cajón de pajitas |
| 5 | 203 | 363,5 | Costado derecho | | 14 | 17 | 46 | Costado izq., abajo |
| 6 | 17 | 300 | Costado izquierdo | | 15 | 203 | 46 | Costado dcho., abajo |
| 7 | 203 | 300 | Costado derecho | | 16 | 60 | 20 | Abajo, izquierda |
| 8 | 17 | 236 | Costado izquierdo | | 17 | 110 | 20 | Abajo, centro |
| 9 | 203 | 236 | Costado derecho | | 18 | 160 | 20 | Abajo, derecha |

- Los n.º 1 a 3 quedan en la franja de arriba, entre el apoyo de la tapa interior y el canto; los n.º 4 a 11, detrás del cajón de componentes; los n.º 12 a 18, detrás del cajón de pajitas.
- Esquivan la bandeja, las guías traseras, el apoyo de la tapa interior y el espárrago de tierra. Separación mínima entre agujeros: 50 mm.
- Las cabezas sobresalen 5,6 mm por dentro: quedan a 3,4 mm del cajón de pajitas y a 3,9 mm del de componentes.
- El patrón anterior (P18-3) y la rejilla de 3 × 6 **ya no valen**.

## 4. Plantilla de taladros

En [`anclaje/plantilla/`](../../anclaje/plantilla/), a escala 1:1 y dibujada tal como se ve mirando a la pared:

- `Plantilla_taladros_A4_mosaico_1a1.pdf`: 3 hojas A4 apaisadas que se pegan haciendo coincidir las marcas naranjas.
- `Plantilla_taladros_A2_1a1.pdf`: una sola hoja A2, para una copistería.
- `Plantilla_taladros_1a1.dxf`: para plotter.

**Imprimir al 100 %** (sin «ajustar a página») y medir las dos reglas de control: tienen que dar 100 mm. Para no ponerla en espejo: a la izquierda queda el lado del cajón de pajitas y los candados; a la derecha, el del enchufe y la cerradura.

Ya no se usa el DXF de la pieza A-C02 como plantilla.

## 5. Montaje

### Antes de taladrar

1. **Identifica la pared** (apartado 1). Un taladro de prueba de Ø6 donde vaya a quedar tapado: polvo rojo y resistencia continua es ladrillo macizo; si la broca «cae» a tramos, es perforado o hueco. Si es tabique hueco o pladur, para.
2. Comprueba que no hay cables ni tuberías detrás.
3. Hacen falta unos 23 cm libres a la derecha de la máquina (para sacar la tapa interior) y sitio a la izquierda para el cajón de pajitas.

### Taladrar

4. Pega la plantilla con cinta, con la **línea azul a nivel**. Marca las 18 cruces con un punzón.
5. **Prueba las juntas antes de taladrar todo.** Haz un taladro piloto de Ø4 en los n.º 1, 2 y 3. Polvo gris y broca que entra blanda: has dado en junta. Si 2 de los 3 caen en junta, sube o baja la plantilla 25–30 mm y vuelve a marcar (los pilotos quedan tapados por la máquina).
6. Taladra los 18 con broca de **Ø8** a **85 mm**, perpendicular a la pared. En ladrillo perforado, **sin percutor**.
7. Sopla o aspira cada agujero y mete los tacos **a ras del enlucido**. Un taco que entra sin resistencia o gira loco ha caído en junta o en hueco: apúntalo.

### Atornillar

8. Abre la tapa, saca la tapa interior (por la derecha) y los dos cajones. Los n.º 1 a 3 se alcanzan por encima del panel; los n.º 4 a 11, por arriba, con el cajón de componentes fuera; los n.º 12 a 18, por el hueco del lateral izquierdo, con el cajón de pajitas fuera.
9. Presenta la máquina entre dos personas, o apoyada en un listón atornillado de forma provisional debajo.
10. **Colgar y nivelar:** pon el **n.º 1** (arriba, centro) y el **n.º 17** (abajo, centro) con su arandela, solo hasta que la arandela toque. Comprueba el nivel.
11. **Presentar todos:** mete los otros 16 con su arandela, dos o tres vueltas cada uno, sin apretar. Si alguno no entra en su taco, ahora se puede mover la máquina.
12. **Primera pasada**, hasta que la arandela asiente, en este orden (del centro de los costados hacia las esquinas, alternando lados):

    **8 → 9 → 6 → 11 → 7 → 10 → 4 → 13 → 5 → 12 → 2 → 15 → 3 → 14 → 1 → 17 → 16 → 18**

13. **Segunda pasada**, en el mismo orden: apriete final. A mano, con carraca corta; nunca con atornillador de impacto. Para cuando la llave se ponga dura: un cuarto de vuelta más como mucho. fischer no da par de apriete para este taco; pasarse lo destroza.
14. Comprueba que la trasera asienta en la pared en todo el contorno y que ningún tornillo gira loco. Vuelve a meter los cajones y comprueba que entran sin rozar las cabezas.

### Si un taco no agarra

- **Uno o dos sueltos, separados:** se dejan puestos. El patrón sigue aguantando: sin sus 2 peores anclajes conserva dos tercios.
- **Tres o más, o dos seguidos en el mismo costado, o dos de los tres de arriba:** no dejarlo así. Rellenar esos agujeros con anclaje químico (resina y tamiz) o cambiar de sitio.

## 6. Ensayo en obra

Sin ensayo, lo anterior es cálculo. Detalle en el apartado 12 del estudio; en corto:

1. **Antes de colgar:** 5 tacos con cáncamo en posiciones de la plantilla alejadas (n.º 2, 3, 8, 16 y 18). Tirar de cada uno, perpendicular a la pared, con un extractor de anclajes o un dinamómetro de gancho, hasta **1,6 kN en ladrillo macizo o 0,8 kN en perforado**, y mantener 1 minuto. Pasa si ninguno se mueve más de 1 mm. Si alguno cede por debajo de 0,4 kN, esa pared se trata como hueca.
2. **Con la máquina colgada:** tirar de la esquina de arriba a la derecha con 1000 N. El modelo predice una separación de la trasera de 0,2 a 0,33 mm, que se recupera al soltar.
3. **Prueba de carga:** 120 kg colgados del borde de arriba durante 10 minutos y un empujón lateral fuerte abajo. Después, repasar el apriete de los 18.
4. Apuntar el tipo de pared, el grueso del yeso, cuántos taladros dieron en junta y las cargas alcanzadas.

## 7. Límites

- Las cargas de fischer son para **un taco aislado**; no se multiplican por 18. El reparto entre tacos sale de un modelo, no de un ensayo.
- Con enlucidos de más de 15 mm, el taco trabaja menos en el ladrillo y el tornillo se dobla más: hay que usar tirafondo y taladro más largos y meter el taco hasta el ladrillo.
- H14 y H16 siguen sin precio ni proveedor verificados en la lista de piezas (0 € es «pendiente», no «gratis»). El tirafondo DIN 571 de 6 × 80 en inoxidable A2 es un artículo de catálogo (cajas de 100), pero no he podido comprobar que se pueda pedir en Amazon.
- El acero del tirafondo se ha supuesto de 500 MPa, el mínimo del A2 más flojo (A2-50). DIN 571 no fija la resistencia: apuntar lo que diga el proveedor.
- Quitar la máquina solo se puede desde dentro: por fuera no queda ninguna cabeza a la vista.

## Fuentes

- [fischer SX Plus 8 × 65, características](https://www.fischer.es/es-es/productos/fijaciones-estandar/fijaciones-de-nylon/taco-de-expansion-sx-plus/567857-taco-sx-plus-8x65-k-nv-antes-532677)
- [fischer SX Plus 8 × 65, ref. 568108, caja de 50](https://shop.fischer.es/collections/accesorios-para-anclaje-de-tubos-en-hormigon/products/taco-sx-plus-8x65-largo-sin-tornillo-50-unidades)
- [Tabla de cargas recomendadas del SX Plus](https://fiproductmedia.azureedge.net/media/Load%20Tables/Load%20Tables%20fischer/LT_SX-PLUS_EN_T1.pdf)
- [`anclaje/ESTUDIO-ANCLAJE.md`](../../anclaje/ESTUDIO-ANCLAJE.md) (13-11-2026) y [`calculo-anclajes/`](calculo-anclajes/README.md) (04-11-2026)
