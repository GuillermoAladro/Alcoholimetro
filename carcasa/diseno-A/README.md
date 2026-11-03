# Alcoholímetro · diseño A (Compacta) · cajón de componentes

> Copia en el repositorio del paquete `Alcoholimetro_A.zip`. Los números de pieza (A-C01, A-T01…) son los de los STEP, los DXF y el visor de esta carpeta. Decisiones generales en [DECISIONES](../../DECISIONES.md).

21-10-2026 · Guillermo · actualizado el 22-10-2026 (tapa interior deslizante, faldón derecho de la tapa, antena hacia abajo) el 25-10-2026 (sin botón: el Solo espera tarjeta todo el rato, y la toma C14 ya no lleva interruptor) el 26-10-2026 (componentes a tamaño real y conexiones comprobadas) el 01-11-2026 (antena 4G por dentro: ya no sobresale nada) y el 03-11-2026 (carcasa de chapa plegada: 29 piezas de acero en vez de 44)

## 1. Qué hay en esta carpeta

| Archivo | Qué es |
|---|---|
| `Visor_3D.html` | Visor 3D sin conexión (se abre con doble clic). Cada pieza se puede seleccionar y ocultar. Se mueven el cajón de pajitas, la tapa, la tapa interior y el cajón de componentes, y hay un botón para ocultar o ver la electrónica |
| `Conexiones_3D.html` | Dos pestañas. **Programa:** la Raspberry Pi simulada corre el programa real (`programa/`) y su pantalla se ve en la mesa; se paga con un botón, se sopla, se hace la foto y se ven el resultado y el ranking, con averías y cortes de luz. **Conexiones:** todos los componentes sobre una mesa con las 38 conexiones, cada cable con su terminal (faston, puntera, Dupont, XH…), su número W y la verificación de tensiones, corrientes, fusibles y masas. Se abre sin internet |
| `FreeCAD/Alcoholimetro_A_completo.step` | **La máquina entera para FreeCAD** (o cualquier CAD): 284 piezas con nombre y color en 9 grupos, cables y tubos incluidos. Ver su [LEEME](FreeCAD/LEEME.md) |
| `CAD_A_Compacta/Conjunto_A.step` | La máquina entera montada (piezas fabricadas y compradas) para cualquier CAD: Fusion 360, SolidWorks, FreeCAD, Onshape… |
| `CAD_A_Compacta/STEP_piezas/` | Un STEP por pieza a fabricar |
| `CAD_A_Compacta/DXF_corte/` | Un DXF por pieza, listo para el láser: el desarrollo plano con el contorno (capa CORTE), las líneas de pliegue (capa PLIEGUES) y una etiqueta con el número |
| `presupuesto/Carcasa_plegada/` | **Planos para fabricar la carcasa plegada:** `Planos_chapa_plegada.pdf` (una hoja por pieza con el desarrollo acotado, los pliegues y la pieza en 3D), un DXF y un STEP por pieza distinta, el conjunto y la lista. Lo mismo, en `presupuesto/Carcasa_alcoholimetro_plegada.zip` |
| `presupuesto/Carcasa_alcoholimetro_planos.zip` | Los planos de la versión anterior, de 44 chapas planas (los que se mandaron a pedir presupuesto el 1 y el 2 de noviembre) |
| `Lista_de_piezas.xlsx` | Piezas a fabricar y compras, con enlaces de Amazon y totales |
| `modelo/` | Los scripts que generan todo (CadQuery). Cambiando una medida se regeneran el 3D, los STEP, los DXF y la lista |

**Numeración.** Cada forma geométrica es una pieza con su número, el mismo en el visor, en el STEP y en el DXF:
- C = carcasa · T = tapa · V = policarbonato · P = cajón de pajitas · K = cajón de componentes · S = soportes.
- E y H son piezas compradas. Por ejemplo, `A-E06.1` es la fuente.

**Chapa plegada** (desde el 03-11-2026): acero DC01 de 1,5 mm cortado por láser y plegado a 90° (radio interior 1,5 mm). Las piezas se unen por soldadura por puntos sobre pestañas; las de 3 mm (anillas, asideros y pestaña de tope), con MIG.
- **29 piezas de acero** (21 planos distintos), en vez de 44 chapas planas; 40 pliegues por máquina.
- **Carcasa:** cuerpo en cruz (trasera, laterales y suelo en una chapa) · panel frontal con pestañas a los lados y arriba · bandeja con pestañas · apoyo trasero de la tapa interior y 2 guías traseras en ángulo.
- **Tapa:** techo con el faldón delantero y el derecho en una chapa.
- **Cajón de pajitas:** cuerpo en U (fondo, delantera y trasera) · 4 tabiques iguales (los 2 extremos y los 2 separadores) · tapa plana.
- **Cajón de componentes:** cuerpo en U (base y laterales) · frente y trasera con pestañas · caja de red en una chapa · repisa del Solo en ángulo.

## 2. La máquina

| | |
|---|---|
| Medidas (ancho × fondo × alto) | **220 × 100 × 443 mm** (más 5 mm del policarbonato de delante) |
| Frente, de arriba abajo | Cámara y Solo · boquilla · pantalla · 3 ranuras de pajitas |
| Alturas desde la base | Cámara 375 · Solo 353 · boquilla 325 · pantalla 237 mm |
| Tapa | Abatible hacia la izquierda, 1 cerradura, con faldón delantero y derecho; debajo, una tapa interior plana que entra deslizando por una ranura del lateral derecho |
| Cajón de pajitas | Sin tirador; 2 anillas con 2 candados |
| Piezas a fabricar | 33: 29 de acero (21 planos distintos) y 4 de policarbonato |
| Chapa y policarbonato | 8,1 kg (7,5 kg de acero) |
| Botón | Ninguno en todo el proyecto, tampoco interruptor de red: el SumUp Solo está siempre esperando tarjeta y la prueba empieza al pagar; la máquina se apaga desenchufándola |
| Primer pedido de compras | ~937 €, con herramientas y rollos que sobran; desglose en la lista (los 5 artículos de la antena 4G llevan precio orientativo) |
| Anclaje a la pared | 18 tirafondos 6 × 60 con taco de 8 mm, apretados desde dentro |

**Altura de montaje:** con la boquilla a 1,45 m del suelo, la base de la máquina queda a 1,12 m.

**Carcasa.**
- Una sola sección arriba con una tapa; el cajón de componentes entra por arriba.
- Abajo sigue el cajón de pajitas con sus 3 compartimentos. Sale **hacia la izquierda**; su tapa queda enrasada con el lateral izquierdo.
- **Candados del cajón de pajitas** (ya no lleva tirador):
  - Hay 2 pares de anillas de chapa de 3 mm con agujero Ø9, a 40 y 110 mm de la base.
  - En cada par, una anilla va soldada a la franja fija del lateral, delante del hueco. La otra va soldada a la tapa del cajón, justo encima, con los agujeros en línea.
  - Cada candado (arco de 5 mm) pasa por las dos anillas de su par.
  - Para sacar el cajón se quitan los dos candados y se tira de las anillas.
  - Candados: ABUS 65/30 de latón, pack de 2 con la misma llave (B01H9Z6HB4).

**Frente.**
- La chapa tiene las ventanas de la pantalla (159 × 91), del Solo (85 × 85) y de la cámara (Ø12), y el agujero de la boquilla (Ø10).
- **Dos policarbonatos de 5 mm**, con el panel en medio:
  - Uno **delante**, apoyado en el panel.
  - Otro **detrás**, entre el panel y el cajón de componentes.
- **Sujeción:** 10 tornillos de seguridad M4 × 16 los atraviesan a los dos y al panel.
  - Por fuera llevan cabeza plana Torx con pin, a ras del policarbonato (avellanado a Ø8,5).
  - Por dentro, una tuerca M4 con fijador de roscas. Solo se pueden quitar desde dentro.
- **Doble protección:** si alguien rompe el policarbonato de fuera, el de dentro sigue protegiendo la pantalla, el Solo y la cámara.
- **Boquilla:** los dos policarbonatos llevan un taladro Ø7 que guía y sujeta la pajita. El de fuera va avellanado.
- Abajo quedan las 3 ranuras de las pajitas.

**Cajón de componentes.**
- Caja de chapa abierta por arriba, **sin asa**. Dentro, a ras del borde, lleva dos **asideros** (chapa de 3 mm con un agujero de Ø22 para meter dos dedos), uno a cada lado. Con ellos se levanta.
- Contra su frente, a ras de las ventanas, van la pantalla, el Solo y la cámara. En la trasera van la Pi, el sensor y la fuente.
- Se apoya en **4 silentblocks** sobre la bandeja.
- Lo centran topes de goma:
  - por los lados;
  - por delante, con topes dobles que apoyan en la cara trasera del policarbonato;
  - por detrás, en dos guías.
- Por arriba lo limita la tapa interior plana: sobre cada asidero hay un tope de goma de 3 mm que queda 3 mm por debajo de ella (así la tapa interior pasa por encima al deslizar).
- Holguras con la carcasa:
  - delante, 12 mm (policarbonato interior 5 + tuercas 3,2 + aire);
  - izquierda, 3,5 mm;
  - derecha, 7 mm (brida de la C14);
  - detrás, 11 mm.

**230 V.**
- La toma C14 va en el lateral derecho **del cajón** y se enchufa por una ventana de la carcasa (38 × 46).
- **Toma C14 con portafusibles y sin interruptor** (Cablepelado, B07CQ54BY4). La de antes llevaba un interruptor rojo que se veía por la ventana. Ahora la máquina se enciende al enchufarla y se apaga desenchufándola, y para sacar el cajón ya había que desenchufarla.
- **Enclavamiento:** con el cable enchufado el cajón no puede subir, porque la clavija tropieza con la ventana.
- La fuente y la C14 van en la **caja de red** (chapas rojas). Es una tapa en U que se quita con 2 tuercas M4; solo salen 5 V y tierra, por pasacables.

**Internet por 4G, con la antena por dentro** (01-11-2026). Por fuera no sobresale nada.
- **Módem:** un pincho 4G (Huawei E3372h‑320, versión HiLink) con una SIM de datos, enchufado en el USB de abajo de la Pi, donde iba el AR9271.
- **Antena:** una antena plana adhesiva (FPC, 698–2700 MHz, unos 100 × 15 mm) pegada **dentro del cajón**, en su lateral izquierdo, sobre una placa de policarbonato de 2 mm (A‑S05).
- **Dos ventanas alineadas** dejan salir la señal por el lateral izquierdo, entre las rejillas de abajo y las de arriba:
  - Carcasa: 36 × 112 mm, tapada por dentro con policarbonato de 2 mm (A‑V03) pegado con cinta VHB. Por fuera queda a ras.
  - Cajón: 32 × 108 mm, tapada por el soporte de la antena.
- **Cable:** latiguillo CRC9 → SMA hembra de 15 cm en la toma principal del módem, y el cable de la antena con SMA macho. Todo va dentro del cajón: **al sacarlo ya no hay que soltar nada de la antena**.
- **Topes:** los dos topes de goma de abajo a la izquierda pasan del cajón a la carcasa. En el cajón, al subirlo, rozarían la placa de la ventana.

**Tierra.**
- C14 → espárrago del cajón → borne FG de la fuente.
- Puente con faston al espárrago de la carcasa (M4 cortado a 8 mm), detrás del cajón. El faston queda arriba, a mano.

## 3. La tapa

- **Bisagra de piano remachada** en el canto superior izquierdo:
  - Abre unos 105° y se queda apoyada en la **pestaña de tope** (T03).
  - Abierta, queda fuera del hueco y el cajón sube recto.
  - Necesita 6–8 cm libres a la izquierda.
- **Faldones:** uno delantero (con la cerradura) y otro **derecho**, doblados del mismo techo (T02). El techo sobresale 2 mm por la derecha y el faldón derecho baja por fuera del lateral hasta 4 mm por debajo de la tapa interior.
  - Cerrada, el faldón derecho tapa la ranura de la tapa interior y la de la leva: **la tapa interior no se puede sacar sin abrir con llave**, y la ranura no se ve.
  - Al abrir, el faldón se separa del lateral (gira alrededor de la bisagra del otro lado), así que no roza.
- **Cerradura de leva de 16 mm** en el faldón delantero, a la derecha:
  - Cerrada, la leva entra en una **ranura de 4 × 14** del lateral derecho.
  - **La leva recta del kit se corta a 20,5 mm** para que al girar no toque el cajón.
- **Por qué no abre hacia atrás:** abierta, su faldón y la cerradura quedan encima del cajón y no le dejan subir. Haría falta unos 30 mm más de fondo vacío.

**Tapa interior plana (antipolvo, deslizante).**
- Debajo de la tapa que se levanta hay una chapa lisa, sin ningún agujero, que tapa todo el hueco de arriba. Queda a ras del borde del panel frontal y 6 mm por encima del cajón de componentes.
- **Entra deslizando por una ranura del lateral derecho** (2,1 × 87 mm, justo encima del borde del panel), de derecha a izquierda, hasta que toca el lateral izquierdo. Metida, queda a ras por fuera del lateral.
- **Guías:** desliza sobre dos apoyos de todo el ancho:

  | Apoyo | Vuelo | Qué es |
  |---|---|---|
  | Delante | 7 mm | La pestaña de arriba del panel frontal (doblada hacia atrás) |
  | Detrás | 9,5 mm | El apoyo trasero C06: un angular con el ala de 12 mm hacia arriba soldada a la trasera |

  La tapa interior pisa 2,8 mm el de delante y 1,8 mm el de detrás. Los salientes del lateral izquierdo de antes sobran: la tapa apoya en todo su largo. No hay silicona: el polvo tendría que colarse por debajo de ese solape.
- La ranura deja chapa a los dos lados (2,5 mm delante y 7,5 mm detrás), así la franja de arriba del lateral sigue unida.
- **Muesca R8** encima de la ranura, en el centro: por ahí se pone el dedo sobre la tapa interior para arrastrarla hacia fuera.
- **Para sacarla:** abrir la tapa con la llave, poner el dedo en la muesca, arrastrar unos centímetros y tirar hacia la derecha. **Hacen falta unos 23 cm libres a la derecha de la máquina.**
- **Para meterla:** por la ranura, de derecha a izquierda, hasta el tope. Después se cierra la tapa.
- **Puente de tierra:** pasa por encima del borde trasero del cajón y por debajo del apoyo trasero, en los 4,5 mm que hay entre los dos, así la tapa interior desliza sin pisarlo.
- **Para que quepa** (cambios del 21-10):
  - Se ha quitado el asa del cajón.
  - El panel frontal sube 4,5 mm, hasta la altura de la tapa interior.
  - El faldón de la tapa sube de 28 a 32 mm para que la leva de la cerradura gire por encima.
  - En total la máquina es 8,5 mm más alta (443 mm).

## 4. Montaje

**Carcasa.**
1. Suelda por puntos el panel frontal al cuerpo (sus pestañas laterales van por dentro de los laterales), y luego el apoyo trasero de la tapa interior. Las anillas fijas de los candados, con MIG. Lima bien la ranura del lateral derecho para que la tapa interior deslice sin rebabas.
2. Pon el policarbonato de fuera y el de dentro. Mete los 10 tornillos de seguridad desde fuera y apriétalos por dentro con tuerca M4 y fijador de roscas, sin forzar: el policarbonato se agrieta si se aprieta de más.
3. Suelda por puntos las guías traseras (por su ala) y la bandeja (por sus pestañas), y los espárragos de la carcasa (tierra).
4. Pega por dentro del lateral izquierdo la ventana de la antena (A‑V03, policarbonato de 2 mm) con cinta VHB, centrada en su hueco. Limpia antes con alcohol. Pega también los dos topes de goma de abajo a la izquierda, debajo de la ventana.

**Cajón de componentes.**
1. **Soldar el cajón:**
   - Frente y trasera dentro del cuerpo en U, por puntos sobre sus pestañas. Los dos asideros (3 mm), con MIG.
   - Al frente: la repisa del Solo y los espárragos de las pletinas de la pantalla y del Solo.
   - Al lateral derecho: el espárrago de tierra.
   - En la base: los 2 espárragos M4×10 de la caja de red.
2. **Toma C14** en el recorte del lateral derecho, con el fusible T2,5A.
3. **Fuente LRS‑50‑5** contra la trasera, con 2 tornillos M3 (como mucho 3 mm dentro de la fuente). Los bornes quedan hacia la C14.
4. **230 V y tierra** (1,5 mm²):
   - C14 L y N → fuente L y N.
   - Tierra de la C14 → espárrago del cajón → FG de la fuente.
   - Ajusta la fuente a 5,20 V.
5. **Caja de red:**
   - Saca +5 V y GND por el pasacables.
   - Pon la tapa en U y apriétala con 2 tuercas M4 y arandela dentada.
6. **Reparto de 5 V:**
   - Dos WAGO 221‑415 en la base (+5 V y GND).
   - 4 portafusibles de pie contra la caja de red: Pi 3 A, Solo 3 A, pantalla 3 A y sensor 2 A.
   - 2 bornes USB‑A de pie, para la pantalla y el Solo.
7. **Raspberry Pi** en la trasera, con separadores M2.5 de 6 mm. El módem 4G va en el USB de abajo, con la SIM dentro.
   - **Antena 4G:** pega el soporte (A‑S05) por dentro del lateral izquierdo del cajón con cinta VHB, tapando su ventana, y pega encima la antena plana con el cable hacia arriba.
   - Quita la tapa del módem y enchufa el latiguillo CRC9 en la toma principal (sujétalo con una brida o cinta: entra a presión). Enrosca el SMA de la antena y recoge lo que sobra con una brida, sin doblarlo a menos de 1 cm de radio.
8. **ZE29A** en la trasera, encima de la Pi, con 4 separadores.
   - Tubo de silicona: boquilla → T de presión → reductor de latón → T de alcohol → escape por la rejilla del lateral izquierdo.
9. **Pantalla** contra el frente, con burlete.
   - La aprietan las dos pletinas (tuercas M4 sobre separadores de 6 mm).
   - Conecta el HDMI acodado y el USB‑C.
10. **Solo** sobre su repisa, con el USB‑C por la muesca. Lo aprieta la contraplaca, con goma de 2 mm.
11. **Cámara** con 4 tornillos M2 avellanados y separadores de 8 mm. La cinta va a la Pi.
12. **Bridas** a las ranuras de la trasera. Solo el puente de tierra pasa por encima del borde del cajón.

**Meter el cajón.**
1. Bájalo, cogido por los asideros, hasta los silentblocks.
2. Conecta el faston de tierra.
3. Mete la tapa interior por la ranura del lateral derecho hasta el tope.
4. Cierra la tapa y enchufa.

**Sacarlo.** Se hace al revés: desenchufar, abrir la tapa, sacar la tapa interior por la derecha, soltar el faston de tierra y levantar el cajón con dos dedos en cada asidero.

**Cambiar un policarbonato.** Saca el cajón: las tuercas quedan a la vista por dentro. Se sueltan y los tornillos salen por delante.

**Colgar la máquina en la pared (18 tornillos).**
- **Dónde van:** 18 agujeros redondos de Ø6,5 en la trasera, en 3 columnas (en el centro y a 85 mm a cada lado) y 6 filas (a 25, 75, 125, 205, 295 y 391,5 mm de la base).
  - 9 tornillos quedan detrás del cajón de pajitas y 9 detrás del cajón de componentes.
  - Las filas esquivan la bandeja y el apoyo trasero de la tapa interior.
- **Material:** tirafondo hexagonal 6 × 60 (DIN 571), taco de nylon de 8 × 40 y arandela ancha M6 (DIN 9021).
- **Montaje:**
  1. Imprime el DXF del cuerpo (`A-C02.dxf`) a escala 1:1 y usa su parte central (la trasera) de plantilla para marcar los 18 agujeros en la pared.
  2. Taladra con broca de 8 mm, 60 mm de hondo, y mete los tacos.
  3. Saca el cajón de componentes y el de pajitas.
  4. Apoya la máquina contra la pared, entre dos personas o sobre un listón atornillado de forma provisional debajo.
  5. Pon los 18 tirafondos desde dentro, cada uno con su arandela, y apriétalos con una llave de vaso de 10.
- **Quitarla:** solo se puede desde dentro. Por fuera no queda ninguna cabeza a la vista.
- En el 3D solo están los agujeros. Los tirafondos, tacos y arandelas están en la lista de compra.
- Las cabezas sobresalen 6 mm por dentro. Por eso el cajón de pajitas tiene 8 mm menos de fondo y el cajón de componentes pasa a 5 mm de ellas.

## 5. Agujeros y pasos de cable

| Pieza | Agujeros |
|---|---|
| Panel frontal C01 | Ventana de pantalla 159 × 91 · ventana del Solo 85 × 85 · cámara Ø12 · boquilla Ø10 · 10 × Ø4,5 de los tornillos de los policarbonatos · 3 ranuras de pajitas |
| Policarbonato exterior V01 | 10 × Ø4,5 avellanados a Ø8,5 por delante · boquilla Ø7 avellanada |
| Policarbonato interior V02 | 10 × Ø5 · boquilla Ø7 |
| Ventana de la antena V03 | Ninguno (policarbonato de 2 mm, 52 × 128, pegado con VHB) |
| Cuerpo C02, lateral izquierdo | Hueco del cajón de pajitas · rejillas · rejilla de escape del soplido · ventana de la antena 36 × 112 |
| Anillas de los candados | Ø9 (arco de 5 mm) |
| Cuerpo C02, lateral derecho | Ventana del enchufe de la C14 38 × 46 · rejillas · ranura de la leva 4 × 14 · ranura de la tapa interior 2,1 × 87 con muesca R8 |
| Cuerpo C02, trasera | 18 agujeros Ø6,5 para la pared (3 columnas × 6 filas) |
| Bandeja C03 | 4 × Ø4,5 de los silentblocks |
| Tapa T02, faldón delantero | Ø18 de la cerradura |
| Frente del cajón K01 | Pantalla, Solo, cámara Ø12 y 4 × Ø2,4 de sus tornillos · boquilla Ø10 con pasacables |
| Trasera del cajón K02 | Fuente (M3), Pi (M2,5), sensor y bornes USB · pares de ranuras para bridas |
| Cuerpo del cajón K03, base | 4 × Ø6 que encajan en los silentblocks · rejilla bajo la fuente |
| Cuerpo del cajón K03, lateral izquierdo | Paso Ø12 del escape · rejillas · ventana de la antena 32 × 108 |
| Soporte de la antena S05 | Ninguno (policarbonato de 2 mm, 44 × 120, pegado con VHB) |
| Cuerpo del cajón K03, lateral derecho | Recorte de la C14 31,9 × 27,65 y 2 × M3 a 36 mm · rejillas |
| Caja de red K06 | Pasacables Ø12 de 5 V y tierra · rejilla · Ø4,5 de las pestañas de fijación |
| Asideros del cajón | Ø22 para los dedos |
| Tapa interior T01 | Ninguno (chapa lisa) |

## 6. Verificación de la electrónica

**5 V:** fuente LRS‑50‑5 de 10 A, ajustada a 5,20 V.

| Rama | Consumo | Fusible | Cable |
|---|---|---|---|
| Pi 3B+ + cámara + módem 4G | 1,7 A normal, 2,8 A de máximo (estimado: el módem gasta algo más que el AR9271) | 3 A | Latiguillo micro‑USB 22 AWG, corto |
| Pantalla 7" | 1 A (5 W) | 3 A | Borne USB‑A + USB‑C |
| SumUp Solo (cargando) | Hasta ~1,5 A (sin dato oficial) | 3 A | Borne USB‑A + USB‑C |
| ZE29A | Menos de 0,5 A | 2 A | JST‑XH |
| **Total** | **~5,8 A de pico; la fuente va al 58 %** | | Troncal 0,75 mm² |

**230 V.** Fusible cerámico T2,5A en la C14. El cable de 1,5 mm² no sale de la caja de red.

**Tierra.** Menos de 0,1 Ω entre el pin de tierra de la C14 y cada chapa (carcasa, cajón y tapa en U).

**Señales:**
- HDMI: de la Pi a la pantalla.
- CSI: de la cámara a la Pi, con la cinta de 200 mm que trae la cámara.
- UART de 3,3 V: de la Pi (pines 8 y 10) al ZE29A, directa.
- Internet: la Pi sale por el módem 4G (la ve como una red USB, `eth1`). El Solo se conecta al punto de acceso de la Pi o usa su propia SIM.

**Proceso de una prueba:**
1. **Reposo:** el Solo enseña el precio y espera tarjeta todo el rato. La Pi le deja un cobro abierto (SumUp Cloud API) y, cuando caduca sin pago, abre otro.
2. Antes de abrir cada cobro, la Pi comprueba que el sensor responde y que queda sitio para las fotos. Si no, pone «Fuera de servicio» y no cobra.
3. Alguien paga con tarjeta o móvil sin contacto.
4. La Pi arranca el ZE29A.
5. «Coge una pajita y sopla».
6. Soplando → calculando, y aquí se hace **la foto**.
7. Resultado con la foto en pantalla.
8. Vuelta a reposo.

Todo lo necesario está conectado. En uso normal ninguna rama pasa del 50 % de su fusible; la Pi llega al 93 % en su pico máximo con el módem 4G. El sensor recibe 5,1–5,2 V, y su máximo es 5,3 V.

## 7. Avisos y decisiones para ti

1. **Sin botón, en todo el proyecto** (25-10-2026). La pantalla no es táctil y no hay pulsador: el Solo está siempre esperando tarjeta y la prueba empieza al pagar. Del GPIO solo se usa la UART (pines 8 y 10).
2. **La boquilla es un cuarto agujero**, imprescindible para soplar.
3. **Solo sin contacto.** Los policarbonatos tapan el Solo: se paga con tarjeta o móvil sin contacto, sin chip ni PIN. Pendiente de preguntar a SumUp.
   - **Con dos policarbonatos la tarjeta queda a unos 20 mm del Solo** (con uno eran 14–15).
   - La norma de pago sin contacto pide leer hasta 4 cm, y el policarbonato no frena la señal, así que debería funcionar. Pero el marco de chapa alrededor puede recortar el alcance.
   - **Pruébalo con el Solo real** y los dos policarbonatos antes de cortar chapa. Si no lee bien, se quita el policarbonato interior solo en la ventana del Solo (un hueco de 85 × 85).
4. **Bornes USB‑A de 1 A.** Mide lo que pide el Solo cargando; si pasa de 1 A, cambia el borne por uno de 2–3 A.
5. **Leva de la cerradura:** hay que cortarla a 20,5 mm.
6. **Antena 4G por dentro** (01-11-2026).
   - **Prueba la cobertura antes de cortar chapa:** con el módem y la antena montados en el cajón, mira la señal en la web del módem (192.168.8.1) con todo cerrado, en un bar real. Si va justa, se agrandan las dos ventanas.
   - **Tensión en la Pi:** con el módem el pico de la Pi sube a unos 2,8 A. Colgada del troncal, en el pico baja a unos 4,58 V, por debajo del aviso de subtensión (4,63 V). Conviene llevar la Pi directa a la fuente, como dice MONTAJE W13.
   - El módem, la antena, el latiguillo, la placa de 2 mm y la cinta VHB están en la lista **sin anuncio elegido** y con precio orientativo.
   - Hace falta una **SIM de datos** (no se compra en Amazon).
7. **Medidas a confirmar con las piezas en mano:**
   - La C14: brida, recorte y tornillos son los típicos de este formato, no los del anuncio. Mirar también en qué patilla está el fusible: el enchufe Schuko entra de las dos maneras y el fusible puede quedar en el neutro.
   - Las tomas del ZE29A.
   - Los conectores de la pantalla.
8. **HDMI acodado.** Si el cable que trae la pantalla ya es acodado, sobra.
9. **Cajón de pajitas con candados.** Necesita sitio a la izquierda para quitar los candados y sacar el cajón.
10. **Sitio alrededor:** el cajón de pajitas necesita sitio a la izquierda para salir, y la tapa 6–8 cm por ese mismo lado. A la derecha hacen falta unos 23 cm para sacar la tapa interior (y el enchufe de la C14 también sale por ahí).

## 8. Comprobaciones hechas en el modelo

- **0 choques** entre las 131 piezas, con la carcasa plegada (03-11-2026).
- Cajón de componentes subiendo con la tapa abierta y la tapa interior quitada: sin roces, en pasos de 2 mm. Pasa a 1 mm del policarbonato, a 2,5 mm de las puntas de los tornillos, a 1,5 mm del apoyo trasero de la tapa interior y, con los topes delanteros, a 0,5 mm de la pestaña de arriba del panel. Por la izquierda pasa a 0,5 mm de los topes de la carcasa y a 1,5 mm de la ventana de la antena.
- Tapa interior saliendo por la ranura derecha con la tapa abierta: sin roces con el faldón.
- Con la tapa cerrada, la tapa interior no sale: a los 0,5 mm topa con el faldón derecho.
- Puente de tierra: no toca el asidero, la trasera del cajón ni el apoyo trasero.
- Coaxial de la antena 4G (unos 17 cm, dentro del cajón): no atraviesa ninguna pieza.
- Cajón de pajitas saliendo a la izquierda (sin candados): sin roces, ni con las cabezas de los tirafondos ni con las anillas fijas.
- Recorrido completo de la tapa: sin roces.
- Giro de la leva: libre, por encima de la tapa interior.
