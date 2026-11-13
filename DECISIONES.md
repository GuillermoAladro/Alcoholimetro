# Decisiones y cambios de diseño

Decisiones que afectan a todo el proyecto. Lo más nuevo va arriba. Si un documento del repositorio dice otra cosa, manda lo que pone aquí.

## 13-11-2026

### Una sola rama, una tabla de cableado y una lista de compra

Guillermo pide ordenar el repositorio antes de seguir (encargo del 13-11-2026, paso 0) y aprueba el plan.
- **`main` es la única rama de trabajo.** Se ha fusionado en ella `programa-raspberry` (carcasa, programa, DECISIONES y documentos al día) con las animaciones y los avatares que ya tenía. Tres archivos tocados en las dos ramas se resolvieron conservando lo de ambas.
- **Ramas que sobran:** `programa-raspberry` y `diseno-a-sin-boton` están enteras dentro de la historia de `main`. `revision-2d-00101-paradigma` tiene el mismo contenido que `main` (las 44 revisiones de animación son idénticas) más 32 archivos de trabajo y 165 commits intermedios que **no** están en `main`. Desde la sesión del 13-11 no se pudieron crear etiquetas ni borrar ramas: **las borra Guillermo**, y la de revisión, después de etiquetarla si quiere conservar esos commits.
- **Cableado:** [CABLEADO.md](CABLEADO.md) es la única tabla vigente. `MONTAJE-GENERAL.md` y `MONTAJE-PASO-A-PASO.md` pasan a [`historico/`](historico/README.md): siguen el diseño del 20-10-2026.
- **Compras:** [LISTA-DE-COMPRA.md](LISTA-DE-COMPRA.md) es la única lista vigente; la del 20-10 queda en `historico/`. La hoja de compras de `carcasa/diseno-A/Lista_de_piezas.xlsx` se regenera con la carcasa y el presupuesto; hasta entonces manda la lista.
- **Auditorías:** los ocho zips de la raíz pasan a `auditorias/zips/`.
- **Pantalla v3 del programa (12-11-2026):** sigue fuera del repositorio; falta que Guillermo pase su zip. **Sus vídeos (298 MB) no irán dentro del historial:** se guardará el guion que los genera a partir de las vistas previas de `Animaciones 2D/` y el paquete se colgará como archivo de una versión de GitHub. Motivo: `main` ya pesa 1,3 GB comprimido y cada regeneración añadiría otros 298 MB para siempre.
- Comprobado: 76 de 76 pruebas del programa en la rama fusionada, y ningún enlace relativo roto antes ni después de mover archivos.

### Componentes eléctricos revisados

Revisión completa en [`componentes/REVISION-13-11-2026.md`](componentes/REVISION-13-11-2026.md). Es papel y cálculo: no hay nada montado.
- **Fuente a 5,10 V** (tope 5,12; baja a 5,05 si el rizado medido en el sensor pasa de 150 mVpp).
- **La Pi se alimenta por una placa de bornes atornillada al GPIO**, directa a los bornes 4 y 5 de la fuente con fusible de 3 A. Sustituye al latiguillo micro-USB. Motivo: 59 mΩ en la rama en vez de 115, y contactos atornillados. Dos auditorías pedían no saltarse el polifusible de la Pi; su papel lo hace ese fusible.
- **El módem sigue en el USB de la Pi.** Se descarta darle rama propia (E1 de la verificación del 12-11): la Pi le corta la alimentación con `uhubctl` cuando se cuelga.
- **Fusibles MINI de cuchilla:** troncal 5 A, Pi 3 A, pantalla 2 A, Solo 2 A, sensor 2 A, ventiladores 2 A. Seis portafusibles (el CAD lleva cuatro).
- **Dos ventiladores Noctua NF-A4x10 5V,** entrada junto al Solo y el sensor y salida por la caja de red, con tacómetro a los GPIO 22 y 23. Motivo: sin ellos el cálculo da de 17 a 24 °C sobre el bar (unos 16 W dentro), y el Solo, el sensor y el módem tienen el límite en 40 °C. Cambia la chapa.
- **Confirmados de la verificación del 12-11:** condensador de 2200 µF en el reparto (E2), −V a tierra en un punto (E3), 1 kΩ en la UART (E4) y entrada de 230 V a revisar por el electricista (E5).
- **Soplido:** tubo siempre cuesta abajo, T hacia arriba y filtro de PTFE en las dos tomas del sensor. Los filtros están sin validar.
- **Módem:** anuncio B085RDTZMP. Devolver si llega el E3372-325.
- **Antena, sin cerrar:** la ventana de 36 × 112 mm deja pasar mal las bandas de 700 a 900 MHz. Se decide con una prueba por bandas entre la antena plana y el propio módem detrás de la ventana.
- **SumUp Solo: se queda** hasta ver tres pruebas con un Solo real (arranque tras un corte largo, pago a través de los dos policarbonatos y respuesta de SumUp por escrito). Decidido por Guillermo. Plan B si no arranca solo: un servo que pulse su botón.
- **Pantalla GeeekPi: se queda,** condicionada a que arranque sola, recuerde el brillo y se apague sin señal. Plan B: Raspberry Pi Touch Display 2.
- **Raspberry Pi 3B+: se queda,** con vídeo y no dibujo en vivo. Plan B: Pi 4B de 2 GB.
- **Salen de la lista:** latiguillo micro-USB, cables Dupont, portafusibles de vidrio de 5 × 20 y cable FFC de 50 cm (fichas en `componentes/retirados/`).
- **Sin hacer:** el modelo 3D (visor, `Conexiones_3D.html`, lista de piezas) no lleva todavía ninguno de estos cambios; entran con la carcasa. Los precios de las piezas nuevas son estimaciones: el 13-11 no se pudo leer Amazon.es.

## 04-11-2026

### Carcasa de 3 mm; cajón de componentes y tapa interior de 1,5 mm

Guillermo pide chapa de 3 mm en todo lo de fuera y 1,5 mm en la chapa de dentro que protege la electrónica.
- **3 mm:** cuerpo, panel frontal, bandeja, guías, apoyo de la tapa interior, anillas, tapa, pestaña de tope, cajón de pajitas, pletinas de la pantalla, repisa y contraplaca del Solo, y los asideros (que ya eran de 3).
- **1,5 mm:** el cajón de componentes (frente K01, trasera K02, cuerpo K03 y caja de red K06) y la tapa interior T01.
- **Medidas por fuera, iguales:** 220 × 100 × 442,5 mm. El faldón de la tapa baja a 30,5 mm para que el alto total no cambie (tapa interior 1,5 + faldón 30,5 + tapa 3 = 35 mm sobre el apoyo).
- **Pliegues:** radio interior igual al espesor (3 o 1,5 mm) y K = 0,33. Todos los desarrollos, DXF, STEP, planos, la lista de piezas, el visor 3D y el STEP de FreeCAD se han regenerado. 37 pliegues por máquina (antes 40).
- **Peso:** 12,5 kg de acero (10,7 de 3 mm y 1,9 de 1,5 mm; antes 9,9) y 13,1 kg con los policarbonatos. Con la electrónica, unos 15,5 kg estimados.
- **Cambios para que todo siga cabiendo y se pueda plegar** (con 3 mm la pestaña más corta que se puede plegar es de unos 12 mm):
  - **Guías traseras (C04):** ya no son angulares con un ala de 6 mm, sino pletinas planas de 12 mm soldadas por puntos contra la trasera; la altura la dan dos topes de goma pegados uno encima de otro (6 mm), que quedan a 0,5 mm del cajón. Van en x = ±70.
  - **Apoyo trasero de la tapa interior (C06):** ya no es un angular, sino una pletina plana de 8 × 207 mm soldada con MIG por su canto a la trasera.
  - **Pestaña de arriba del panel frontal (C01):** de 7 a 12 mm, con dos muescas de 14 mm donde se queda en 7,5 mm para que pasen los topes delanteros del cajón al sacarlo (pasan a 1 mm). La tapa interior pisa ahora 6,3 mm el apoyo de delante (1,8 en las muescas).
  - **Tabiques del cajón de pajitas (P02):** pestañas de 12 mm (antes 10). **Repisa del Solo (S03):** pliegue a tramos, porque la muesca del USB‑C lo corta.
  - **Cajón de componentes:** por fuera mantiene sus holguras (11,5 delante, 3,5 a la izquierda, 7 a la derecha, 9,5 detrás); por dentro es 1 mm más estrecho (200,5 mm) y tiene 1 mm menos de fondo útil (70 mm). Las ventanas de la antena, el W12, una rama de fusible y el puente de tierra se han movido 0,5–1 mm.
  - **Ranura de la tapa interior:** 2,1 × 85,5 mm; deja 6 mm de chapa detrás (antes 7,5) para que la tapa interior siga pisando 1,8 mm el apoyo trasero.
  - **Ranura de la leva:** 4 × 17 mm (3 mm más hacia abajo): con el lateral de 3 mm la leva barría el canto.
  - **Policarbonatos:** los dos 0,5 mm más bajos (223 mm) y el interior (V02) además 5 mm más estrecho (201 mm), para no tocar los radios de los pliegues del panel.
  - El puente de tierra pasa entre el cajón y el apoyo trasero por un hueco de 3 mm.
- **Comprobado:** 0 choques entre las 131 piezas; barridos limpios de la tapa, la tapa interior y los dos cajones; los cables, con los 5 avisos de siempre (tubos del soplido). Lo mismo con las 18 cabezas de los tirafondos y sus arandelas añadidas en una prueba (en el 3D sólo están los agujeros).
- **A confirmar con el taller:** que pueden plegar la pestaña de 12 mm con muescas del panel (en las muescas se queda en 7,5); la soldadura MIG de la pletina del apoyo trasero por su canto; el agarre de los remaches de la bisagra con chapa de 3 mm.
- **A revisar en compras:**
  - Los tornillos de seguridad M4 × 16 de los policarbonatos llegan, con el panel de 3 mm, justo al ras de la tuerca (roscan 3 de sus 3,2 mm). Con fijador aguanta, pero lo normal es que asome algo: mejor una tuerca baja (DIN 439, 2,2 mm) o un M4 × 18. Un M4 × 20 no cabe: tocaría el cajón.
  - Los espárragos del Solo salen de 26 mm (antes 25) y el kit es de M4 × 20: hay que pedirlos más largos (ya pasaba con 2 mm).
- El paquete `Carcasa_alcoholimetro_plegada.zip` y los planos pasan a ser los de 3 y 1,5 mm. **Los planos de 2 mm que se hayan mandado a talleres ya no valen.**

### Patrón de anclaje P18-3 aplicado a la trasera

Con la trasera de 3 mm y las guías nuevas se ha repetido el cálculo del patrón (`carcasa/diseno-A/calculo-anclajes/`) y **se aplica el ganador, P18-3, al CAD**: `modelo/diseno.py` (`FIJACIONES_PARED`), DXF y STEP de A-C02, planos y lista.
- Siguen siendo 18 agujeros Ø6,5 con tirafondo 6 × 80, taco SX Plus 8 × 65 y arandela M6 DIN 9021. Patrón simétrico: 5 por lado junto a los pliegues laterales (x = ±87…93, uno de ellos en la franja de arriba), 4 justo encima y debajo de la bandeja, 2 entre las guías y 2 abajo.
- **Resultado** (FEM con la chapa flexible, peso de cálculo 18 kg): factor de carga λ = 10,56 frente a 5,79 del patrón de 3 × 6 (+82 %). Tirón admisible en la esquina más desfavorable con el criterio de fischer: ≈ 6,0 kN en hormigón, 3,2 kN en ladrillo macizo y 1,6 kN en ladrillo perforado (el 3 × 6: 3,0 / 1,6 / 0,8 kN). En hormigón la chapa empieza a deformarse junto a las arandelas de arriba a partir de ≈ 1,8 kN de tirón en la esquina (con 2 mm, ≈ 0,9 kN).
- Se elige el simétrico aunque la mejor solución libre daba un 4 % más (λ 10,94): es más fácil de replantear y de comprobar, y la regla era aceptarlo si llegaba al 95 %. La búsqueda es heurística: no demuestra que sea el óptimo global.
- El cálculo con 2 mm (P18-O, que no llegó a pasarse al CAD) queda en `calculo-anclajes/historico-2mm/`.
- El patrón de 3 columnas × 6 filas ya no vale: sus agujeros de x = ±85 quedan pegados a las guías nuevas.

## 03-11-2026

### Actualización de anclaje: tacos SX Plus 8×65 y tirafondos 6×80

Se sustituyen los tacos de nailon 8×40 (H16) por **fischer SX Plus 8×65 L, ref. 568108**, y los tirafondos DIN 571 6×60 (H14) por **6×80 mm**. Siguen siendo 18 anclajes, 3 columnas × 6 filas, agujeros Ø6,5 en chapa y arandela ancha M6 DIN 9021. No cambia el contorno de la carcasa ni el DXF/STEP de los agujeros.
- **Broca de Ø8 mm**. Fischer exige taladro mínimo **75 mm** para SX Plus 8×65; se propone **85 mm en soporte macizo portante adecuado** para que un 6×80 no haga tope. Revestimientos, ladrillo perforado, bloques y pladur requieren estudiar la instalación específica y confirmar que existe profundidad útil.
- El grupo de 18 anclajes **no** se considera homologado ni apto para cualquier pared por el mero cambio de taco. Las distancias entre anclajes siguen siendo 85 mm en horizontal y 50–96,5 mm entre filas; revisar frente a las condiciones del fabricante y soporte.
- Se actualizan `modelo/diseno.py`, `modelo/hacer_bom.py` y `carcasa/diseno-A/README.md` y se añade `carcasa/diseno-A/ANCLAJE-PARED-8x65.md`. Los productos antiguos de compra (ASIN/precio) se invalidan para no pedir piezas equivocadas. **Las listas XLSX ya publicadas no se han regenerado** y no deben usarse para comprar H14/H16 hasta su actualización.

### Toda la chapa de 1,5 mm pasa a 2 mm

Guillermo pide chapa de 2 mm en todo, para que la máquina aguante más golpes y palancas. Las piezas que ya eran de 3 mm (anillas de los candados, asideros y pestaña de tope) siguen en 3 mm.
- **Medidas por fuera, iguales:** 220 × 100 × 442,5 mm. La tapa sobresale 2,5 mm por la derecha en vez de 2.
- **Pliegues:** radio interior 2 mm (igual al espesor) y K = 0,33. Todos los desarrollos, DXF, STEP y planos se han recalculado.
- **Peso de la chapa:** 9,9 kg de acero por máquina (antes 7,5); con los policarbonatos, 10,4 kg.
- **Cambios para que todo siga cabiendo:**
  - El cajón de componentes conserva sus 71 mm de fondo útil: la holgura de delante baja de 12 a 11,5 mm (el aire entre las tuercas y el cajón, de 3,8 a 3,3 mm) y el hueco de detrás, de 11 a 9,5 mm. Los topes delanteros quedan a 0,5 mm del policarbonato (antes 1). El espárrago de tierra de 8 mm queda a 1,5 mm de la trasera del cajón.
  - Las holguras de los lados no cambian (3,5 y 7 mm): el cajón es 1 mm más estrecho por fuera y 2 mm por dentro.
  - El Solo va 2 mm a la izquierda y la Pi 2 mm a la derecha, porque los radios de los pliegues del cajón crecen.
  - La fuente y la caja de red van 2,5 mm a la derecha (si no, la clavija HDMI de la Pi chocaba con el lateral de la caja de red) y la fuente 1,5 mm más arriba (su canto de abajo tocaba el radio del pliegue de la trasera del cajón).
  - El faldón de la tapa es 1 mm más bajo (31 mm), para que el alto total no cambie.
  - El lateral derecho acaba 0,8 mm por debajo del borde, en todo su grueso, para dejar sitio al pliegue del faldón derecho de la tapa.
  - La bandeja mantiene su cara de arriba a 163,5 mm y crece hacia abajo.
- **Comprobado:** 0 choques entre las 131 piezas; barridos limpios de la tapa, la tapa interior y los dos cajones; los cables, con los 5 avisos de siempre (tubos del soplido); conexiones con 0 errores.
- **A confirmar con el taller:** con 2 mm, la pestaña de arriba del panel (7 mm) y las de 8 mm del frente y la trasera del cajón de componentes quedan en el límite de lo que se suele poder plegar (depende de la matriz). Las del cajón se pueden alargar; la del panel no, sin tocar el cajón, porque los topes delanteros del cajón pasan a 0,5 mm de ella al subirlo.
- El paquete `Carcasa_alcoholimetro_plegada.zip` pasa a ser el de 2 mm.

### Tabiques del cajón de pajitas: ahora sí son 4 piezas iguales

En su auditoría, Guillermo vio que los 4 tabiques P02 no eran iguales. El del extremo derecho tiene las pestañas hacia el otro lado y es el espejo de los otros tres, no uno de ellos girado, porque la pestaña delantera empezaba a 12 mm y la trasera a 6,3. Aun así, el plano mandaba hacer 4 iguales al derecho, así que 3 habrían salido plegados al revés. Ese zip todavía no se había mandado a nadie.
- **Arreglo:** la pestaña trasera empieza también a 12 mm, igual que la delantera. La pieza queda simétrica y el tabique derecho es otro girado 180°. Siguen siendo 21 planos, con P02 ×4. La pestaña trasera pierde 5,7 mm por abajo; no importa, porque la inferior va soldada al fondo.
- **Control nuevo en `modelo/planos_chapa.py`:** antes de exportar comprueba que todas las piezas que comparten código son la misma pieza girada. Si una es un espejo o tiene otras cotas, se para y dice cuál. Con el modelo anterior salta en el tabique.
- Se quitan `planos_chapa.2.py` y `Carcasa_plegada.2/`: un solo generador y un solo paquete. Están en el historial de git.
- **A comprobar con el taller y en el prototipo** (de las observaciones de la auditoría):
  - El K y el radio reales, con una prueba de doblado.
  - El pliegue a tramos del P01 (tres ventanas): los alivios y que las ranuras no se deformen.
  - Las tolerancias generales y las cotas funcionales. El PDF da las medidas generales; los agujeros y recortes van en los DXF.
  - Que los electrodos de soldar por puntos lleguen a las pestañas de 10–13 mm, y en qué orden se pliega y se suelda.
  - Holguras de la tapa y las guías tras soldar, continuidad de tierra y separación de los 230 V.
  - Que la bisagra, los tornillos y las cerraduras se puedan montar después de plegar.
- Comprobado: 0 choques, barridos limpios, cables con los 5 avisos de siempre y conexiones con 0 errores.

### Carcasa de chapa plegada: 29 piezas de acero en vez de 44

Guillermo pide que la carcasa se pueda mandar a cortar y plegar: en vez de una chapa por cada cara, piezas que se doblan en forma de cajón, más baratas y prácticas de fabricar. Medidas exteriores, cajones, componentes y holguras no cambian.
- **Antes:** 44 chapas planas soldadas cara con cara. **Ahora:** 29 piezas de acero en 21 planos distintos, con 40 pliegues de 90° por máquina (radio interior 1,5 mm). Todas las uniones de 1,5 mm se sueldan por puntos sobre pestañas. Las piezas de 3 mm siguen planas y van con MIG.
- **Carcasa:**
  - Cuerpo C02 en cruz: trasera, laterales y suelo en una chapa (414 × 537 de desarrollo). A la izquierda, el pliegue empieza encima del hueco del cajón de pajitas.
  - Panel frontal C01 entre los laterales. Lleva pestañas de 12 mm a los lados, soldadas por dentro de los laterales, y una de 7 mm arriba, que es el apoyo delantero de la tapa interior. Por eso el panel acaba 1,5 mm más abajo (407,5 mm) y el faldón de la tapa empieza en 408. La cerradura y la tapa interior no se mueven.
  - Bandeja C03 con pestañas de 13 mm hacia abajo.
  - Apoyo trasero C06 y guías traseras C04 en ángulo, para soldarlos por puntos.
  - Fuera los salientes delantero e izquierdos de la tapa interior: la tapa apoya en todo su largo delante (pestaña del panel) y detrás (apoyo C06).
- **Tapa T02:** techo con el faldón delantero y el derecho doblados (antes, 3 chapas).
- **Cajón de pajitas:**
  - Cuerpo en U P01: fondo, delantera y trasera. Las 3 ventanas de las pajitas cruzan el pliegue, así que ese pliegue se hace a tramos.
  - 4 tabiques iguales P02: los 2 extremos y los 2 separadores.
  - La tapa sigue plana y va soldada al tabique izquierdo.
- **Cajón de componentes:**
  - Cuerpo en U K03: base y laterales.
  - Frente K01 con pestañas a los lados y abajo.
  - Trasera K02 con pestañas a la izquierda y abajo. A la derecha no lleva, porque ahí está la C14.
  - Caja de red K06 en una sola chapa, con sus 2 pestañas de fijación (antes, 5 piezas).
  - Repisa del Solo S03 en ángulo.
- **Cambios pequeños para que quepa todo:**
  - Ventanas y soporte de la antena 4G, 5 mm más atrás, por las pestañas del frente del cajón.
  - Solo, 1,5 mm a la izquierda: su espárrago tocaba el radio del pliegue.
  - Pestaña izquierda de la caja de red, 6 mm más adelante.
  - Rejilla de la base del cajón, 5 mm más corta.
  - Muesca en una pestaña de la trasera del cajón para la microSD de la Pi.
  - Esquinas de laterales y trasera recortadas bajo los pliegues de la tapa.
- **Planos:** `carcasa/diseno-A/presupuesto/Carcasa_plegada/` (y el zip `Carcasa_alcoholimetro_plegada.zip`) contiene:
  - `Planos_chapa_plegada.pdf`: una hoja por pieza, con el desarrollo acotado, las líneas de pliegue, su sentido y la pieza plegada en 3D.
  - Los DXF de los desarrollos, con capas CORTE y PLIEGUES.
  - Un STEP de cada pieza ya plegada, el conjunto y la lista.

  El desarrollo está calculado con K = 0,33; el taller puede rehacerlo con su K a partir del STEP. Lo genera `modelo/planos_chapa.py`, con la herramienta nueva `modelo/chapa.py`.
- **Ojo con los presupuestos ya pedidos:** a las 185 empresas del 1 y 2 de noviembre se les mandaron los planos de 44 chapas planas. Ese zip no se ha tocado. Para pedir precio de la versión plegada hay que mandarles el zip nuevo.
- **Comprobado en el modelo:**
  - 0 choques entre las 131 piezas.
  - Barridos limpios de tapa, tapa interior y cajones.
  - Los cables siguen con los 5 avisos de siempre (tubos del soplido) y las conexiones con 0 errores.
  - Los desarrollos no se solapan y cada uno sale de una sola chapa.

## 01-11-2026

### Antena 4G por dentro: ya no sobresale nada (los candados se quedan)

Guillermo no quiere nada que sobresalga de la carcasa, porque se rompería, y la Pi va a salir a internet con una SIM. Se cambia el Wi-Fi del bar (AR9271 con la antena por fuera) por un módem 4G con la antena plana por dentro. **Los candados del cajón de pajitas se mantienen.**
- **Fuera:** el AR9271 (E05), el alargo RP-SMA con su pasamuros (E12) y el agujero Ø6,5 del lateral derecho.
- **Módem (E05):** pincho 4G Huawei E3372h-320, versión HiLink, con una SIM de datos. Va en el USB de abajo de la Pi, donde iba el AR9271, y la Pi lo ve como una red USB (`eth1`) sin instalar nada.
- **Antena (E12):** antena plana adhesiva (FPC, 698–2700 MHz, unos 100 × 15 mm) con cable y SMA macho. Va **dentro del cajón**, pegada en su lateral izquierdo sobre una placa de policarbonato de 2 mm (A-S05). Se une al módem con un latiguillo CRC9 → SMA hembra de 15 cm (E23).
- **Ventanas en el lateral izquierdo**, alineadas, entre las rejillas de abajo y las de arriba:
  - Carcasa (C03): 36 × 112 mm. La tapa por dentro una placa de policarbonato de 2 mm (A-V03, 52 × 128) pegada con cinta VHB. Por fuera queda a ras.
  - Cajón (K04): 32 × 108 mm, tapada por el soporte de la antena.
  - La placa de 2 mm (H19) y la cinta VHB (H20) entran en la lista.
- **Topes:** los dos topes de goma de abajo a la izquierda pasan del cajón a la carcasa. En el cajón, al subirlo, rozarían la placa de la ventana.
- **Más sencillo de mantener:** todo el coaxial va dentro del cajón, así que para sacarlo ya no hay que desenroscar la antena. Tampoco hay malla de coaxial que toque la carcasa: el −V queda flotante y W12b sigue pendiente.
- **Por qué el lateral izquierdo:** delante no queda sitio (pantalla, Solo, cámara y boquilla), a la derecha la C14 y las rejillas no dejan los ~110 mm que mide la antena, y la trasera va contra la pared.
- **Avisos:**
  - La ventana es estrecha (la limita la Pi, que va pegada a ese lateral): **probar la cobertura con todo cerrado en un bar** antes de cortar chapa. Si va justa, se agrandan las ventanas.
  - Con el módem, el pico de la rama de la Pi sube a unos 2,8 A (93 % del fusible de 3 A; estimado, a medir). Colgada del troncal, la Pi baja a unos 4,58 V en el pico, por debajo del aviso de subtensión: cobra más sentido llevarla directa a la fuente (MONTAJE W13).
  - Módem, antena, latiguillo, placa y cinta están **sin anuncio elegido** y con precio orientativo. El pedido sube a unos 937 €.
- **Programa:** `vigia-red.sh` vigila ahora la red del módem (`eth1`). Si no responde en 5 minutos, desconecta y vuelve a conectar el módem por software, como mucho una vez cada 10 minutos.
- El modelo da 0 choques entre 146 piezas y los barridos de tapa, tapa interior y cajones salen limpios en pasos de 2 mm. Los cables tienen los mismos 5 avisos de siempre, todos de los tubos del soplido.

## 27-10-2026

### Carcasa más plana: 100 mm de fondo en vez de 103

Guillermo pide bajar el fondo a 100 mm. Queda en **220 × 100 × 443 mm**, más los 5 mm del policarbonato de delante.
- Los 3 mm salen del **hueco de detrás del cajón de componentes**, que pasa de 14 a 11 mm. El cajón, su interior y todo lo que lleva dentro no se mueven.
- **Espárrago de tierra de la carcasa: de 10 a 8 mm** (del mismo kit M4×20, cortado). Con 10 mm quedaba a 1 mm de la trasera del cajón; con 8 mm queda a 3 mm.
- El **puente de tierra W10** se recoloca detrás del cajón.
- **Cajón de pajitas:** 3 mm menos de fondo, porque mantiene los 8 mm libres para las cabezas de los tirafondos.
- Holguras con la trasera del cajón: pasamuros de la antena a 2,3 mm, espárrago de tierra a 3 mm, cabezas de los tirafondos a 5 mm (antes 8).
- El modelo sigue dando 0 choques y los barridos de tapa, tapa interior y cajones salen limpios. Los cables tienen los mismos 5 avisos que con 103 mm, todos de los tubos del soplido.
- Para aplanar más, lo siguiente sería una fuente más fina que la LRS-50-5 (31,5 mm), que es lo que marca el fondo del cajón.

## 26-10-2026

### Programa v2 para la Raspberry Pi (`programa/`)

- **Sustituye a `main.py`, `ze29a.py` y `prueba_sensor.py`** del Project. Está en JavaScript (Node 20 en la Pi) y la pantalla es Chromium a pantalla completa. El mismo código corre en la Pi y en el banco 3D (`carcasa/diseno-A/Conexiones_3D.html`, pestaña **Programa**), con el hardware simulado.
- **Qué hace:**
  - En espera pasa el top 10 con sus fotos y su valor, y anima a jugar.
  - El Solo pide tarjeta todo el rato. Al pagar: precalentar, «sopla» con una barra, cuenta atrás de 5 s con la cámara en directo, foto, resultado con el puesto («puesto 120 de 360 · top 34 %») y celebración.
  - Las fotos del top 10 se guardan siempre. Las demás se borran a las 24 h. El valor se queda en el ranking para siempre.
- **Avatar de Guillermo** (27-10): `animaciones/Avatar GuillermoAladro.jpg`, hoja de personaje en 3D estilo Bitmoji (camisa negra, vaqueros, zapatillas): cuerpo entero de frente, 3/4, perfil y espalda, y seis caras (sonrisa, risa, sorpresa, borracho, dormido y guiño). Es la referencia para generar con IA de vídeo las ~100 animaciones de la pantalla. Sustituye a la ilustración anterior (camisa remangada, brazos cruzados) y a su versión 3D "hinchada" (`animaciones/avatar-3d/`), retiradas del repo; siguen en el historial de git.
- **Avatares nuevos** (29-10): hojas de personaje en `animaciones/` (en `main` están las 9: Carla, Rodri, Laura, Marta, Paradigma, Sara Saez, Gabacho, Guillermo Aladro y Yorgi). La de Guillermo pasa a ser `animaciones/Avatar Guillermo Aladro.png` (camiseta negra, vaqueros, zapatillas y seis caras) y sustituye a `Avatar GuillermoAladro.jpg`, retirada del repo; sigue en el historial de git.
- **Monigote presentador** (pedido el 26-10): hoy el programa (`nucleo/monigote.js` + `nucleo/monigote_fotos.js`) aún anima la ilustración anterior troceada en piezas (cabeza con nueve caras, torso, mangas, manos), a la espera de los clips del avatar nuevo. Antes hubo una versión dibujada en código (caricatura, descartada) y otra sacada de su vídeo sin camiseta (descartada).
- **Unidad: g/L** (el valor del sensor ÷ 100). El encargo decía «g/cl», que no es una unidad de alcoholemia. Sin conversión a mg/L (H01, 6.1-S F14) y sin frases sobre conducir (H02).
- **Foto opcional sin botón:** se tapa la cámara durante la cuenta atrás. Enseñar las caras del top 10 en un bar puede necesitar consentimiento expreso (H17 y H18): consultarlo antes de instalar. Con `"fotos": false` funciona sin fotos.
- **Robustez (máquina sola en un bar):**
  - systemd la reinicia siempre. Hay un perro guardián interno y otro de hardware, y se reinicia si una fase no avanza. Reinicio diario a las 05:00.
  - Diario de cobros con fsync: tras un apagón, el pago sin prueba se convierte en prueba pendiente, como mucho 2 veces y dentro de 5 min. Si no, se reembolsa (más tarde, quien pagó seguramente se ha ido).
  - Un pago lento (PIN) nunca se da por caducado. Una respuesta perdida se busca por `foreign_transaction_id` antes de anular el cobro.
- **Dos revisiones independientes (26-10):**
  - La primera encontró 12 fallos: pago lento (PIN) cerrado como caducado, pruebas gratis sin fin en un bucle de reinicios, reembolso tras ver el resultado, la revisión de fondo cancelando el cobro de la persona que está delante, entre otros.
  - La segunda, sobre el cobro ya corregido, encontró 11 más: un pago descubierto tarde que se daba como prueba a otro, un pago que se quedaba en la cola, reembolsos que se daban por imposibles a los 40 min, un portal cautivo que llenaba el diario, entre otros.
  - Todos corregidos, cada uno con su prueba (`pruebas/revision.test.js` y `revision2.test.js`), y un fuzz de horas de máquina al azar (`pruebas/fuzz.js`).
- **Pruebas:**
  - 76 pruebas automáticas con reloj virtual (300 partidas seguidas, apagones a mitad, tarjeta llena, UART con ruido…).
  - Prueba de extremo a extremo con Chromium y prueba del banco 3D.
- **Sin probar con hardware real** (`programa/README.md`, apartado 9):
  - Las rutas de SumUp y la duración de un cobro.
  - El ZE29A real.
  - Los metadatos de `rpicam-vid`.
  - Los milisegundos por cuadro en la Pi 3B+.
- **La Affiliate Key de SumUp pasa a ser obligatoria:** sin ella el programa no cobra.

### Componentes a tamaño real en el CAD y conexiones comprobadas una a una

- **Visor 3D:**
  - Cada pieza comprada se dibuja con su forma real: Pi 3B+, Camera Module 3, pantalla 7", SumUp Solo, LRS-50-5, C14, WAGO, portafusibles, bornes USB, ZE29A, AR9271, T y reductores.
  - Las medidas salen de las fichas. No se dibujan logotipos ni marcas.
  - La chapa se ve como acero sin pintar o con colores por grupo.
- **Nuevo `Conexiones_3D.html`.** Todas las piezas sobre una mesa con las 38 conexiones (W1…W28). Cada una lleva su terminal y su verificación.
  - Resultado: 0 errores y 19 conexiones con aviso.
- **Cambios en la colocación**, encontrados al modelar a tamaño real:
  - La celda del ZE29A chocaba con la pared del cajón.
  - Entre la C14 y la fuente no cabían faston y puntera.
  - Las entradas de las WAGO quedaban debajo de la pantalla.
  - Las bornas de los USB miraban al suelo.
  - Todo corregido en `specs.py`: 0 choques, los 6 barridos limpios y ningún cable atraviesa una pieza.
- **Abiertos** (no se cambian sin decidirlo):
  - El troncal de 5 V no lleva fusible.
  - Hay que confirmar los 5,20 V de la fuente frente al máximo de 5,3 V del ZE29A.
  - La Pi cuelga del troncal y no va directa a la fuente.
  - Los bornes USB van detrás de fusibles de 3 A.
  - El −V va a tierra a través del coaxial.
  - El fusible de la C14 está en un solo polo.
- **Faltan en la lista:**
  - Tubo de 4 mm.
  - Tubo fino de 2 × 4.
  - Reductores 6 → 2,5 para las tomas del ZE29A.

## 25-10-2026

### Sin botón: el SumUp Solo está siempre esperando tarjeta

- **La máquina no lleva botón en ningún sitio.** El Solo está todo el rato esperando tarjeta:
  - La Pi le deja un cobro abierto por la Cloud API.
  - Cuando caduca sin pago (unos 60 s), abre otro.
  - En cuanto alguien paga, empieza la prueba.
- **No se cobra si la máquina no puede medir.** Antes de abrir cada cobro, la Pi comprueba que el sensor responde y que queda sitio para las fotos. Si algo falla, la pantalla dice «Fuera de servicio» y el Solo no pide tarjeta.
- **La cámara ya no arranca nada.** Esto sustituye a lo del 22-10, que arrancaba la prueba al detectar a alguien con la cámara. Ahora la cámara solo hace la foto.
- **Programa:** `programa/main.py` del Project ya funciona así.
  - Los datos de SumUp van en `~/.config/alcoholimetro/sumup.json`; `instalar.sh` deja la plantilla.
  - `--gratis` arranca pruebas sin cobrar, para el banco.
  - Probado con un lector simulado; con el Solo real, no.
- **Pendiente con el Solo real** (prueba P6.14 del [PASO A PASO](historico/MONTAJE-PASO-A-PASO.md)):
  - Cuánto dura de verdad un cobro abierto.
  - Que SumUp acepta consultar el estado cada 3 s; no publica límites.
  - Qué hacer si el sensor falla después de cobrar (reembolso).

### Sin interruptor de red: la toma C14 ya no lleva el interruptor rojo

- **Por qué:** el módulo C14 de antes (B08Z6FCR5Z) llevaba un interruptor basculante rojo con luz, y se veía por la ventana del lateral derecho. Era el único «botón» que quedaba en la máquina.
- **Qué se pone:** una toma C14 con portafusibles y sin interruptor (Cablepelado, [B07CQ54BY4](https://www.amazon.es/dp/B07CQ54BY4)).
  - Precio: 8,03 € en la tienda de Cablepelado; el de Amazon no lo he podido leer.
  - No trae fusible: se pone el T2,5A (#16).
- **Cómo se apaga:** la máquina se enciende al enchufarla y se apaga desenchufándola. Para sacar el cajón ya había que desenchufarla. **El enchufe de la pared tiene que quedar a mano, o el bar tiene que poder cortar esa toma:** que lo confirme el electricista.
- **Cableado:** W2 y W3 van directos de la toma a los bornes 1 y 2 de la fuente; W4 y W5 desaparecen.
- **En el CAD:**
  - La toma se monta girada: tornillos M3 a 36 mm, uno encima de otro.
  - Recorte de 31,9 × 27,65 mm en el lateral del cajón.
  - La ventana de la carcasa pasa de 38 × 56 a 38 × 46.
  - Sigue sin chocar nada y sin roces.
  - Las medidas de la toma son las típicas de ese formato, no las del anuncio: se miden al recibirla.
- **Sigue abierto:** el fusible está en un solo polo y el Schuko entra de las dos maneras, así que puede quedar en el neutro. Las auditorías piden una entrada con portafusibles de dos polos documentada ([pendientes](componentes/pendientes.md), n.º 13).

### El botón, fuera de todo el repositorio

| Dónde | Qué ha cambiado |
|---|---|
| [LISTA DE COMPRA](historico/LISTA-DE-COMPRA-20-10-2026.md) | Fuera la línea 11 (pulsador, 10,88 €). Quedan 31 componentes y el primer pedido baja a 635,69 € (636,02 € con la toma C14 nueva) |
| [`componentes/`](componentes/README.md) | Borrada la ficha del pulsador (sigue en el historial de git, commit `dca2723`). El índice explica el hueco del número 11 |
| Fichas de componentes | **Cables Dupont:** solo pines 8 y 10, con un alojamiento de 1 × 2. **Kit faston:** solo para 230 V. También limpias las fichas de la crimpadora, el C14, los pasacables y la pantalla |
| [Pendientes](componentes/pendientes.md) | Revisados el 7 y el 18. Fuera la medida de los faston del pulsador; las medidas siguientes se renumeran |
| [MONTAJE GENERAL](historico/MONTAJE-GENERAL.md) | Fuera W21, W22, la pieza 11, el agujero de Ø30 del panel y el pull-up. El punto 10 del apartado 4 pasa a ser la comprobación del cobro continuo. Figuras 2, 3 y 4 rehechas |
| [MONTAJE PASO A PASO](historico/MONTAJE-PASO-A-PASO.md) | Fuera la prueba P1.11 y la fase 3.3; las pruebas y apartados siguientes se renumeran. Nueva prueba P6.14 de cobro continuo |
| [Anuncios de Amazon.es](montaje-general/anuncios-amazon-21-10-2026.md) | Fuera el anuncio del pulsador |
| [CAD del diseño A](carcasa/diseno-A/README.md) | No tenía pulsador. Tenía el interruptor rojo de la toma C14, que se quita (apartado anterior). La cerradura de la tapa se dibuja con su llave para que no parezca un botón |

**No se tocan las auditorías** (`auditorias/` y los zips de la raíz): son informes de terceros con su fecha y hablan del pulsador porque entonces existía.

## 22-10-2026

### Sin botón en todo el proyecto

Se decide que la máquina no lleva botón. Cómo arranca la prueba sin él está en la entrada del 25-10.

### Diseño actualizado: manda el diseño A (cajón de componentes)

Cierra el pendiente 12 de [`componentes/pendientes.md`](componentes/pendientes.md). La máquina es el **diseño A, Compacta**:
- Carcasa de 220 × 103 × 443 mm.
- Un cajón de componentes que entra por arriba.
- Cajón de pajitas con dos candados.
- Dos policarbonatos en el frente.

El CAD está en [`carcasa/diseno-A/`](carcasa/diseno-A/README.md): visor 3D, STEP, DXF de corte, lista de piezas y los scripts que lo generan.

**Cambios de hoy en el CAD:**
- **Tapa interior plana deslizante.**
  - Entra por una **ranura de 2,1 × 90 mm en el lateral derecho**, justo debajo del borde del panel, y desliza hasta el lateral izquierdo.
  - Corre sobre un saliente delantero (5 mm) y uno trasero (12,5 mm), soldados por dentro.
  - Ya no lleva silicona.
  - Encima de la ranura hay una muesca R8 para arrastrarla con el dedo.
  - Para sacarla hacen falta unos 23 cm libres a la derecha de la máquina.
- **Faldón derecho en la tapa abatible.** Con la tapa cerrada tapa la ranura: la tapa interior no se puede sacar sin abrir con llave.
- **Antena girada hacia abajo**, porque hacia arriba cortaba el paso de la tapa interior.
- **Puente de tierra y coaxial** pasan por debajo del saliente trasero, para que la tapa interior no los pise.
- **Un tope de goma** sobre cada asidero, en vez de dos.
- **46 piezas a fabricar.** El modelo da 0 choques. También se ha comprobado sin roces el movimiento de:
  - la tapa;
  - la tapa interior al salir;
  - el cajón de componentes al subir;
  - el cajón de pajitas al salir.

**Pendiente:** [MONTAJE GENERAL](historico/MONTAJE-GENERAL.md), [MONTAJE PASO A PASO](historico/MONTAJE-PASO-A-PASO.md) y la [LISTA DE COMPRA](historico/LISTA-DE-COMPRA-20-10-2026.md) todavía siguen el diseño anterior (19 y 20 de octubre). Ya no tienen el pulsador, pero falta pasarlos al diseño A. Cambian sobre todo:
- la colocación;
- la tierra;
- los fusibles por rama;
- el Wi-Fi.
