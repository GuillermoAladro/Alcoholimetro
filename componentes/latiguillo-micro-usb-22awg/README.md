# Latiguillo micro-USB macho, 22 AWG, 30 cm (6 uds.)

Cable corto con un conector micro-USB macho en un extremo y los hilos pelados en el otro. Lleva los 5 V desde la regleta WAGO hasta el puerto micro-USB de la Raspberry Pi 3B+. Es el **único camino de alimentación y de masa común** de la Pi.

- **Dónde va (según la guía de montaje, §0, §2.1, §3 y §5.2):** LRS-50-5 (5,20 V) → WAGO 221-415, polo 2 → **este cable**, cortado a 15 cm o menos, con el rojo a +5 V y el negro a GND → micro-USB de la Pi.
- **Compra:** ASIN B0DP2NT8LY, 8,49 € por 6 unidades (1,41 € cada una; precio de la hoja de componentes del 19-20-10-2026).

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta (`ROBOTS_DISALLOWED`), así que no he podido ver el anuncio: el precio, el ASIN y el calibre de 22 AWG son los de tu hoja. **Marca, vendedor, número de hilos, si lleva hilos de datos y cómo es el sobremoldeado del conector son desconocidos.**

Es una pieza genérica sin datasheet. Esta ficha documenta qué exige la especificación del conector, qué cae de tensión en este camino (cálculo propio con suposiciones explícitas), qué fallos hay documentados y qué medir con el polímetro al recibirla. La alimentación de la Pi en sí (umbral de subtensión, `vcgencmd get_throttled`, pines 4 y 6) ya está en la [ficha de la Pi](../raspberry-pi-3b-plus/README.md#41-subtensión); aquí no la repito, solo la completo.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales](#3-documentos-oficiales)
4. [Uso en el proyecto](#4-uso-en-el-proyecto)
5. [Fallos, bugs y problemas conocidos](#5-fallos-bugs-y-problemas-conocidos)
6. [Qué comprobar al recibirlo](#6-qué-comprobar-al-recibirlo)
7. [Alternativas](#7-alternativas)
8. [Recomendaciones para el alcoholímetro](#8-recomendaciones-para-el-alcoholímetro)
9. [Lo que no he podido verificar](#9-lo-que-no-he-podido-verificar)
10. [Fuentes](#10-fuentes)

---

## 1. Resumen para el proyecto

- **Los hilos de 22 AWG no son el problema; lo son los contactos y el fusible de la Pi.** Con 15 cm de 22 AWG el lazo (rojo + negro) vale unos 16 mΩ. Los dos contactos del micro-USB (hasta 30 mΩ cada uno según la especificación) y el fusible reseteable F1 de la Pi (de 15 a 100 mΩ según DigiKey) suman 5 o 10 veces más (cálculo propio, sección 4.3). Con un cable de 22 AWG de verdad y contactos y fusible en cota alta (caso D de la sección 4.3), con 5,20 V en la WAGO, el raíl de 5 V de la Pi queda en **unos 4,85 V a 2,0 A y 4,76 V a 2,5 A**.
- **El margen sobre el umbral de subtensión es menor de lo que parece, porque el umbral no es una cifra exacta.** La guía usa 4,63 V. Esa cifra y su tolerancia de ±5 % (de 4,40 a 4,86 V) las he visto solo en comentarios de usuarios que las atribuyen a la documentación de Raspberry Pi; **no he podido leer el texto oficial**. Frente al nominal de 4,63 V el margen a 2,0 A es de unos 0,2 V. Si el umbral real estuviera en la parte alta de la banda (4,86 V), el caso D a 2,0 A ya no dejaría margen. Conviene medir en la propia Pi (sección 6, medida 8), no fiarse del cálculo.
- **El conector micro-USB está especificado para 1,8 A mínimo por contacto de potencia, y la Pi solo tiene un contacto de VBUS y uno de GND.** La Pi 3B+ está diseñada para 2,5 A por ese conector. El pico de 2,0 A de la guía supera los 1,8 A en un 11 %. Estimo (cálculo propio) que un contacto en el límite de la especificación se calentaría unos 37 °C sobre el ambiente a 2,0 A y unos 58 °C a 2,5 A. A la corriente típica de 0,9 A son unos 7 °C. **Los picos breves no preocupan; una carga sostenida de 2 A dentro de una caja a 40 °C sí conviene medirla.**
- **Los hilos de datos no sirven para nada en este cable.** En el esquema reducido de la Pi los pines 2, 3 y 4 del micro-USB (D−, D+, ID) están marcados como sin conectar. Si el cable los trae, hay que cortarlos al ras y aislarlos. Lo mismo con el hilo de drenaje o el blindaje, si los hay: la guía dice que no se hagan más uniones de masa.
- **Lo que más puede fallar en un cable barato es el calibre real y la mecánica, no lo que diga el anuncio.** Las medidas que he visto de cables micro-USB baratos dan de 2 a 3 veces la resistencia por metro de los de marca, un cable corto barato midió 76 mΩ en un solo hilo de unos 15 cm, y un usuario cuenta que los avisos de subtensión de su Pi se fueron al cambiar solo el cable (sección 5). Hay que medir **cada una de las 6 unidades** antes de cortarlas: calibre (caída a 1 A), polaridad y que el conector asiente del todo.
- **Es un punto único de fallo.** Si el conector se afloja por vibración o un tirón, la Pi se apaga sin aviso. La especificación solo garantiza 8 N de extracción tras 10.000 ciclos y no define ninguna prueba de vibración ni de tracción del cable. Hace falta sujeción mecánica del cable cerca del conector (sección 8).

## 2. Especificaciones

El anuncio no se ha podido leer. La tabla separa lo que **debe cumplir** un conector y un cable de este tipo (con fuente) de lo que se **desconoce** de tu producto.

| Característica | Valor o requisito | Fuente |
|---|---|---|
| Referencia de compra | ASIN B0DP2NT8LY, 8,49 € por 6 uds. | Hoja del usuario / guía de montaje, fila 19 |
| Descripción del anuncio | Latiguillo micro-USB macho, 22 AWG, 30 cm | Guía de montaje, fila 19. **Sin verificar** (Amazon bloquea el acceso) |
| Uso previsto | Se corta a 15 cm o menos; rojo a +5 V, negro a GND | Guía de montaje, filas 19 y §5.2 |
| Número de hilos, datos, blindaje, colores reales | **Sin verificar** | Anuncio no accesible |
| Marca, vendedor, certificaciones | **Sin verificar** | Anuncio no accesible |
| Pines del micro-USB | 1 VBUS (rojo típico), 2 D−, 3 D+, 4 ID, 5 GND (negro típico). Los colores son "típicos", no obligatorios. La tabla es la del plug Micro-A; la copia no trae una tabla propia del Micro-B, que comparte la numeración (el ID va aparte) | Especificación Micro-USB Rev. 1.01, Tabla 4-2, p. 10 |
| Corriente por contacto de potencia (1 y 5) | **1,8 A mínimo**, con 0,5 A a la vez en los contactos 2, 3 y 4, a 25 °C ambiente | Micro-USB Rev. 1.01, sec. 5.3.2, p. 33 |
| Corriente por contacto de señal (2, 3, 4) | 1 A mínimo | Micro-USB Rev. 1.01, sec. 5.3.1, p. 33 |
| Subida de temperatura permitida | +30 °C en cualquier punto del conector con corriente aplicada | Micro-USB Rev. 1.01, sec. 5.3, p. 33 |
| Resistencia de contacto | 30 mΩ máximo inicial; +10 mΩ máximo de variación tras 10.000 ciclos | Micro-USB Rev. 1.01, sec. 5.2, p. 33 |
| Fuerza de inserción / extracción | 35 N máximo / 8 N mínimo (tras 10.000 ciclos) | Micro-USB Rev. 1.01, sec. 6.2 y 6.3, p. 34 |
| Resistencia de un adaptador de ≤150 mm | VBUS + GND, contactos incluidos: 70 mΩ máximo. Es un requisito de adaptadores, no de cables; lo uso solo como referencia para un conjunto corto | Micro-USB Rev. 1.01, sec. 4.5.8, p. 13 |
| Temperatura de funcionamiento del conector | De −30 a +80 °C (opción I) o a +85 °C (opción II) | Micro-USB Rev. 1.01, sec. 6.1, p. 34 |
| Calibre del hilo | **La especificación no lo fija** | Micro-USB Rev. 1.01 (solo remite a dibujos de cable) |
| Vibración, tracción del cable, dimensiones del sobremoldeado | **No hay prueba de vibración ni de tracción del cable.** Las dimensiones del sobremoldeado están en la Figura 4-5 (p. 18), que no pude leer | Micro-USB Rev. 1.01, sec. 4.5.2, 6 |
| Conector de la Pi 3B+ | Amphenol FCI 10103594-0001LF, micro-B de 5 posiciones, acodado, SMD con patillas de anclaje pasantes, carcasa LCP, **1,8 A**, 10.000 ciclos | Esquema reducido RP-008339-DS-1 (referencia); [Heilind](https://estore.heilind.com/04T-JWPF-VSLE-S/brg10103594-0001lf.html) y [DigiKey](https://digikey.cn/en/products/detail/amphenol-icc-fci/10103594-0001LF/2350351) (atributos) |
| Fusible de la Pi en esa línea | F1 `MF-MSMF250/X` (familia Bourns MF-MSMF250). Para el MF-MSMF250/16X-2: mantiene 2,5 A, dispara a 5 A, 16 V máx., 15 mΩ mínimo inicial, 100 mΩ R1 máx. (resistencia tras el disparo); **resistencia inicial máxima no publicada en lo que vi** | Esquema reducido; [DigiKey](https://azcus.digikey.com/en/products/detail/bourns-inc/MF-MSMF250-16X-2/2563289) |
| Protección de sobretensión de la Pi | D7 `SMBJ5.0A` (TVS) y C84 de 47 µF tras F1 | Esquema reducido RP-008339-DS-1 |
| Alimentación de la Pi 3B+ | 5 V / 2,5 A por micro-USB, o 5 V por GPIO. El brief dice que solo debe conectarse a una fuente de 5 V / 2,5 A y **no da una tensión mínima de funcionamiento**: el 4,63 V es el umbral de un aviso, no un mínimo documentado | [Product brief RP-008338-DS-2](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf) |
| Umbral de subtensión | 4,63 V. Tolerancia ±5 % (4,40 a 4,86 V) según la documentación de Raspberry Pi, o ±0,07 V según un usuario que cita el chip APX803. **Texto oficial no leído** | [element14](https://community.element14.com/products/raspberry-pi/f/forum/38347/what-is-the-minimun-supply-voltage-for-the-pi3b-plus) (comentarios de usuarios); [raspberrypi/linux#2512](https://github.com/raspberrypi/linux/issues/2512) (un participante da 4,63 V sin fuente) |
| Alimentador oficial (referencia) | +5,1 V, 2,5 A, cable de 1,5 m en 18 AWG (según una tienda; no he abierto una hoja oficial del alimentador) | [The Pi Hut](https://thepihut.com/products/raspberry-pi-zero-usa-power-supply) |
| Resistencia del cobre por metro (un conductor, a 20 °C) | 20 AWG 33,31 · **22 AWG 52,96** · 24 AWG 84,22 · 26 AWG 133,9 · 28 AWG 212,9 mΩ/m | [Wikipedia: American wire gauge](https://en.wikipedia.org/wiki/American_wire_gauge) (cobre macizo) |
| Corriente admisible, 22 AWG | 3 A a 60 °C y 7 A a 75 °C (la página las cita de una tabla de cableado de equipos; **la propia página no dice que sean de cableado de chasis**, lo deduzco) | Wikipedia: American wire gauge |

## 3. Documentos oficiales

Un latiguillo genérico no tiene datasheet. Estos son los documentos que fijan lo que debe cumplir y los de la Pi que describen su entrada de alimentación. Los he leído en local salvo donde se indica.

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| USB 2.0 Micro-USB Cables and Connectors Specification | Rev. 1.01, 4-4-2007 | PDF (1,2 MB) | [copia no oficial en git.nefarius.at](https://git.nefarius.at/nefarius/USB-Bluetooth-Specs/media/branch/master/usb_20_0702115/Micro-USB_final/Micro-USB_1_01.pdf) · [página oficial de la especificación USB 2.0](https://usb.org/document-library/usb-20-specification) (ZIP; **no he comprobado que incluya este PDF**) |
| Raspberry Pi 3B+, product brief | RP-008338-DS-2 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf) · [copia local](../raspberry-pi-3b-plus/datasheets/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf) |
| Raspberry Pi 3B+, esquema reducido (V1.0, 19-3-2018) | RP-008339-DS-1 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf) · [copia local](../raspberry-pi-3b-plus/datasheets/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf) |
| Raspberry Pi 3B+, plano mecánico | RP-008337-DS-2 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008337-DS-2-raspberry-pi-3-b-plus-mechanical-drawing.pdf) · [copia local](../raspberry-pi-3b-plus/datasheets/RP-008337-DS-2-raspberry-pi-3-b-plus-mechanical-drawing.pdf) |
| Aviso de cambio Rev 9 / Rev 1.4 (solo cambia el PMIC) | RP-003337-PC-1 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/797-pcn/documents/RP-003337-PC-1-Pi3B_%20Revision%209%20PCN.pdf) (resumen en la [ficha de la Pi](../raspberry-pi-3b-plus/README.md#qué-dice-el-aviso-de-cambio-rev-9-rp-003337-pc-1)) |
| Documentación de hardware de Raspberry Pi | — | Web | [ver](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html). **La sección "Power supply" no se pudo leer** (mi herramienta recibe la página cortada) |
| MF-MSMF250/16X-2 (Bourns), atributos | — | Web | [DigiKey](https://azcus.digikey.com/en/products/detail/bourns-inc/MF-MSMF250-16X-2/2563289). **No he podido abrir el datasheet de Bourns** (ver `enlaces.md`) |
| 10103594-0001LF (Amphenol FCI), atributos | — | Web | [Heilind](https://estore.heilind.com/04T-JWPF-VSLE-S/brg10103594-0001lf.html). **No he encontrado el PDF del fabricante** |
| Fluke Networks: cables de aluminio recubierto de cobre (CCA) | Nota de aplicación | PDF | [ver](https://cccassoc.org/wp-content/uploads/2020/03/FLUKE_Application_Note_Copper_Clad_Aluminum_CCA_Cables.pdf) |

### Qué dicen los más relevantes

**Especificación Micro-USB Rev. 1.01** (copia no oficial; números de página inferidos del texto extraído)

- Fija 1,8 A **como mínimo** para los contactos 1 y 5, con 0,5 A a la vez en 2, 3 y 4, y limita la subida de temperatura a 30 °C. No es un máximo absoluto: es la corriente que el conector debe poder llevar sin pasarse de ese calentamiento (interpretación mía).
- En la Pi 3B+ los contactos 2, 3 y 4 no se usan, así que la condición de prueba de la especificación calienta algo más que el uso real. Eso juega a favor (deducción mía).
- No fija calibre de hilo ni da límite de resistencia para un cable. El único límite de resistencia de conjunto es el de 70 mΩ para adaptadores de ≤150 mm.
- No define ensayos de vibración ni de tracción del cable. Solo temperatura de funcionamiento (de −30 a +80/85 °C) y fuerzas de inserción y extracción. Las dos pruebas de tirón que da (arrancado de la placa, 150 N, y torsión, 0 a 25 N sin daño) son "solo referencia".

**Esquema reducido de la Pi 3B+ (RP-008339-DS-1, leído y renderizado en local)**

```
J1 pin 1 (VBUS) ──┬── PP2 (punto de prueba, antes del fusible)
                  └── F1 MF-MSMF250/X ──┬── red "5V" ── PP7 (punto de prueba), pines 2 y 4 del GPIO (J8), PMIC
                                        ├── D7 SMBJ5.0A ── GND
                                        └── C84 47 µF ── GND
J1 pin 5 (GND) ── GND y puntos PP3 a PP6
J1 pines 2, 3, 4 (D−, D+, ID): marcados como sin conectar
```

- La entrada micro-USB pasa por **F1** antes de llegar a la red de 5 V. Esa red es la misma que sale a los pines 2 y 4 del GPIO, por eso alimentar por el GPIO se salta F1 (deducción mía, por el nombre de red en el esquema).
- Los puntos de prueba se llaman **PP2** (antes de F1), **PP7** (después de F1) y **PP3 a PP6** (GND). En el esquema no aparecen las siglas "TP1/TP2" de modelos antiguos de la Pi. **No he podido comprobar cómo están serigrafiados en la placa 3B+.** Para la Pi original (modelo B), un usuario de element14 dice que lo esperable entre TP1 y TP2 es el rango de VBUS de USB, de 4,75 a 5,25 V, y que una fuente buena da unos 5,1 V para compensar cable y fusible ([hilo](https://community.element14.com/products/raspberry-pi/f/forum/21109/element14-au-power-supply-for-raspberry-pi---poor-voltage)). No es documentación oficial ni es de la 3B+: **no sé qué tensión da Raspberry Pi como válida en la 3B+.**
- El esquema reducido **no muestra el chip que vigila la tensión** y no dice dónde se mide el umbral de 4,63 V. Un hilo de element14 lo atribuye a un supervisor APX803 (4,63 ± 0,07 V); el mismo hilo dice que la documentación de Raspberry Pi da ±5 %. **Dos tolerancias distintas, y no he podido leer la documentación oficial.** ([hilo](https://community.element14.com/products/raspberry-pi/f/forum/38347/what-is-the-minimun-supply-voltage-for-the-pi3b-plus))

**Plano mecánico (RP-008337-DS-2, medido sobre la imagen, ±1 mm; medida mía)**

- El micro-USB está en el borde corto, con su eje a 10,6 mm del borde izquierdo de la placa. El HDMI está centrado a 32 mm y mide unos 14,5 mm de ancho. Quedan unos 14 mm entre el eje del micro-USB y el borde del HDMI.
- Según eso, **un sobremoldeado ancho no debería chocar con la placa ni con el HDMI**. Lo que limita es el espacio libre en la dirección de inserción y lo que haya en la caja del proyecto. Lo he medido sobre la imagen del plano, no sobre una pieza real.

## 4. Uso en el proyecto

### 4.1 Circuito

Fuente: guía de montaje, §2.1, §3 y §5.2.

```
LRS-50-5 (5,20 V) → regletas WAGO 221-415: polo 2 de la de +5 V y polo 2 de la de GND
   → latiguillo micro-USB (22 AWG, ≤15 cm): rojo a +5 V, negro a GND
   → J1 micro-USB de la Pi 3B+ → F1 → red de 5 V → PMIC (genera el resto de tensiones de la placa)
```

- Consumo de la Pi con cámara y Wi-Fi USB, según la guía: **0,9 A típico y 2,0 A de pico**, ambos estimados, no medidos.
- La guía mide el ajuste de 5,20 V "con la Pi conectada". **No dice en qué punto.** Mi cálculo supone que son 5,20 V en los polos de la WAGO. Si se miden en los bornes de la fuente, hay que restar el tendido de 0,75 mm² hasta la WAGO (unos 46 mΩ de lazo por metro de ida; cálculo propio con 0,0172 Ω·mm²/m).
- **La masa del ZE29A también pasa por este cable.** La guía no une la masa de la UART de la Pi con la del sensor: el retorno va del GND del ZE29A a la WAGO y de ahí por el hilo negro de este latiguillo a la Pi. A 2,0 A, 38 mΩ (hilo y un contacto) dan unos 76 mV de diferencia de masa entre la Pi y la WAGO (cálculo propio). Es poco frente a los niveles de 3,3 V de la UART, pero es otra razón para que el hilo negro y su contacto estén bien.

### 4.2 Preparación del cable

- **Antes de cortar**, mide cada unidad (sección 6). Un cable cortado ya no se puede devolver.
- Corta por el lado de los hilos pelados, **no por el del conector**. Deja el cable más corto posible que llegue a la WAGO.
- **Datos y blindaje:** si el cable trae hilos blanco y verde (D− y D+) o un hilo desnudo de drenaje, córtalos al ras y aísla cada punta con termorretráctil. No los conectes a nada.
- Termina rojo y negro con punteras o con la entrada directa de la WAGO. El calibre de 22 AWG (0,33 mm²) entra en el rango de la WAGO 221 (0,14 a 4 mm² flexible, 0,2 a 4 mm² multifilar, sin puntera necesaria), según la [ficha de la regleta](../wago-221-surtido/README.md) (#20), que cita la hoja de WAGO; no he abierto yo esa hoja. Si el hilo es CCA o muy fino y trenzado, comprueba que no se corte al pelar.

### 4.3 Caída de tensión (cálculo propio)

**Suposiciones, todas explícitas:**

- 5,20 V constantes en la WAGO. La tensión se calcula en la **red de 5 V de la Pi, después de F1** (el punto PP7, o los pines 4 y 6 del GPIO).
- Lazo de ida y vuelta (rojo + negro). Cable de 15 cm de 22 AWG: 2 × 0,15 m × 52,96 mΩ/m = **15,9 mΩ** (cobre macizo a 20 °C; un hilo trenzado y la temperatura lo suben unos puntos porcentuales: a 60 °C, +16 % con el coeficiente típico del cobre de 0,393 %/K, dato de mi conocimiento, sin fuente abierta aquí).
- Contactos del micro-USB: 30 mΩ cada uno en el límite de la especificación, dos en serie (VBUS y GND): **60 mΩ**. Los contactos reales pueden estar por debajo (no he encontrado medidas); es una cota alta. La especificación permite +10 mΩ por contacto tras 10.000 ciclos.
- Fusible F1: dos valores de la ficha de DigiKey para el MF-MSMF250/16X-2, **15 mΩ** (mínimo inicial) y **100 mΩ** (R1 máx., tras el disparo). No encontré la resistencia inicial máxima, así que el valor real está entre ambos extremos o cerca. Uso 100 mΩ como cota alta.
- No cuento las pistas de la Pi ni las soldaduras del conector.

| Caso | R total (mΩ) | Caída a 1,0 A | A 2,0 A | A 2,5 A | Tensión en la Pi a 1,0 A | A 2,0 A | A 2,5 A |
|---|---|---|---|---|---|---|---|
| A. Solo el cable, 22 AWG, 15 cm | 15,9 | 16 mV | 32 mV | 40 mV | 5,18 V | 5,17 V | 5,16 V |
| B. A + 2 contactos de 30 mΩ | 75,9 | 76 mV | 152 mV | 190 mV | 5,12 V | 5,05 V | 5,01 V |
| C. B + F1 de 15 mΩ | 90,9 | 91 mV | 182 mV | 227 mV | 5,11 V | 5,02 V | 4,97 V |
| D. B + F1 de 100 mΩ | 175,9 | 176 mV | 352 mV | 440 mV | 5,02 V | 4,85 V | 4,76 V |
| E. Como D, con 2 contactos de 40 mΩ (tras 10.000 ciclos) | 195,9 | 196 mV | 392 mV | 490 mV | 5,00 V | 4,81 V | 4,71 V |
| F. Como D, pero el cable es de 28 AWG real | 223,9 | 224 mV | 448 mV | 560 mV | 4,98 V | 4,75 V | 4,64 V |
| G. Como D, más 1 m de tendido de 0,75 mm² (46 mΩ de lazo) | 221,8 | 222 mV | 444 mV | 555 mV | 4,98 V | 4,76 V | 4,65 V |

- **Margen disponible:** de 5,20 V a 4,63 V hay **0,57 V**. Para no bajar de 4,63 V la resistencia total del camino tiene que ser de **285 mΩ como máximo a 2,0 A** y de 228 mΩ a 2,5 A. Para no bajar de 4,86 V (parte alta de la banda de ±5 %), de **170 mΩ a 2,0 A** y de 136 mΩ a 2,5 A.
- **Lectura:** con la corriente típica de 0,9 A y 1,0 A no hay problema en ningún caso (más de 4,97 V). A 2,0 A el caso D (176 mΩ) queda 6 mΩ por encima del límite de 170 mΩ de la banda alta, y los casos F y G se acercan. A 2,5 A, F y G rozan los 4,63 V. **Las cifras de F1 y de los contactos son cotas altas, así que el cálculo es pesimista, pero deja claro que el cable de 22 AWG es la menor de las pérdidas.**
- **El 15 cm no es un límite crítico con 22 AWG real.** Usar los 30 cm enteros sumaría 16 mΩ (40 mV a 2,5 A). Con 28 AWG real, 30 cm sumarían otros 64 mΩ y el caso F quedaría en 4,62 V a 2,0 A y en 4,48 V a 2,5 A, por debajo de 4,63 V. Por eso importa medir el calibre.
- **Comparación (cálculo propio):** el cable del alimentador oficial es de 1,5 m en 18 AWG según una tienda. Con 20,9 mΩ/m por conductor (valor de la tabla AWG estándar, no traído de la página) su lazo es de unos 63 mΩ, unas 4 veces el de tu cable de 15 cm. La Pi está pensada para tolerar eso, con una fuente de 5,1 V.
- **Calor en el cable:** a 2,5 A, 0,10 W en 15 cm de 22 AWG (cálculo propio). Despreciable.

### 4.4 Corriente y calor del conector (cálculo propio)

Hipótesis: contacto en el límite de la especificación (30 mΩ), resistencia constante y subida de temperatura proporcional a la potencia, tomando como referencia los +30 °C a 1,8 A de la especificación. Cada contacto de potencia (VBUS y GND) disipa:

| Corriente | Potencia por contacto | Subida estimada | Con 40 °C ambiente en la caja | Comentario |
|---|---|---|---|---|
| 0,9 A (típico, guía) | 0,02 W | +7 °C | 47 °C | Sin problema |
| 1,8 A (valor de la especificación) | 0,10 W | +30 °C | 70 °C | Es el límite que fija la especificación |
| 2,0 A (pico, guía) | 0,12 W | +37 °C | 77 °C | Justo bajo los 80 °C de la opción I de la especificación; sin margen si fuera sostenido |
| 2,5 A (valor de diseño de la Pi) | 0,19 W | +58 °C | 98 °C | Pasaría de 85 °C si fuera sostenido |

- **¿Cabe la corriente de la Pi en el conector?** La Pi 3B+ declara 2,5 A por ese conector (product brief) y el conector que monta figura con 1,8 A (Heilind). Esos 2,5 A son un valor de diseño del alimentador, no el consumo normal. Con el consumo típico de la guía hay mucho margen. Con picos de 2,0 A de segundos o minutos tampoco hay riesgo a la vista. Lo que **no** conviene es una carga de 2 A mantenida horas dentro de la caja a 40 °C (la guía ya identifica el calor como riesgo n.º 5).
- **No he encontrado una corriente mayor de 1,8 A para este conector** en lo que abrí. Molex, Hirose y Würth, que pediste, **no los he consultado**; su valor para otros conectores micro-B no cambia el de la pieza concreta de la Pi.
- **Lo que sí puedes hacer:** medir la corriente real de la Pi en la máquina con un medidor USB en línea o un amperímetro en el hilo rojo, en el peor caso (cámara, pantalla, Wi-Fi y prueba de esfuerzo). Con la corriente real sustituyes mis estimaciones de esta tabla.

### 4.5 Mecánica

- **Un solo contacto de VBUS y uno de GND** llevan toda la corriente. Si un contacto se oxida o el conector queda un poco fuera, la resistencia sube y la caída de tensión crece justo en el pico. Es el punto donde un conector "aflojado" se nota primero.
- **Fuerza de retención:** la especificación garantiza 8 N como mínimo tras 10.000 ciclos. Un cable de 15 cm de 22 AWG pesa poco, pero cualquier tirón al abrir la máquina o al mover la caja interior suspendida (la guía la monta con muelles) actúa sobre el conector de la Pi.
- **Espacio:** la Pi va en vertical sobre la pared trasera de la caja interior con separadores M2.5. Hace falta espacio libre en la dirección de inserción más el radio de curvatura del cable. La guía no da esta cota. **Medir con la pieza en la mano.**
- **Choque entre "≤15 cm" y "holgura".** La WAGO va fija en la caja de arriba y la Pi en la caja interior suspendida con muelles, y la guía (§4) pide que los cables de esa caja salgan por pasacables "con holgura". Un latiguillo de 15 cm tirante entre una parte fija y otra que se mueve tira del conector de la Pi. Hay que comprobar en el montaje real si 15 cm dejan holgura; si no, es mejor usar 25-30 cm con un seno que 15 cm tirantes (con 22 AWG real solo cuesta 16 mΩ más). Observación mía, a partir del texto de la guía.

### 4.6 Cifras de la guía contrastadas

| Cifra o afirmación de la guía | Resultado | Fuente |
|---|---|---|
| 5 V / 2,5 A para la Pi (§2.1) | **Coincide** con el product brief | RP-008338-DS-2 |
| "Salta por debajo de 4,63 V (±5 %)" (§2.1) | **No verificado en documento oficial.** Las dos fuentes que la dan son comentarios de usuarios. La tolerancia discrepa: ±5 % (4,40 a 4,86 V) o ±0,07 V según el chip supervisor. La guía trata 4,63 V como cifra fija | element14, raspberrypi/linux#2512 |
| 5,20 V en la fuente (§0, §2.6) | Nada oficial exige 5,20 V; el alimentador oficial es de 5,1 V según una tienda. Según mi cálculo (sección 4.3), 5,20 V en la WAGO deja entre 4,76 y 5,02 V en la Pi (de 2,5 a 1,0 A) en el caso pesimista D, con un cable de 22 AWG de verdad. Es suficiente frente a 4,63 V; frente a 4,86 V (parte alta de la banda) ya no queda margen a partir de 2,0 A en ese caso | Cálculo propio |
| Pico de 2,0 A y típico de 0,9 A (§3) | Estimaciones de la guía, no medidas. Quedan bajo los 2,5 A del brief y sobre los 1,8 A del conector (el pico, en un 11 %) | Guía; brief; especificación Micro-USB |
| "Latiguillo de 22 AWG, se corta a 15 cm o menos" (§1, §5.2) | Con 22 AWG real, 15 cm no es un límite crítico (cada 15 cm cuestan 16 mΩ). Choca con la holgura que la guía pide para los cables de la caja suspendida | Cálculo propio; guía §4 |
| "Rojo a +5 V, negro a GND" (§5.2) | La especificación da esos colores como "típicos", no obligatorios. Hay que medir la polaridad | Micro-USB Rev. 1.01, Tabla 4-2 |
| "Único camino de alimentación y de masa común de la Pi" (§0, §5.2) | **Coincide** para la alimentación (esquema reducido). Para la masa, el cable HDMI de la pantalla da otro camino (deducción mía, sección 8) | RP-008339-DS-1 |
| Pi alimentada por micro-USB y hilos de datos | Los pines 2, 3 y 4 del micro-USB de la Pi no están conectados, así que los hilos de datos no hacen falta | RP-008339-DS-1 |

## 5. Fallos, bugs y problemas conocidos

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | Calibre real menor que el anunciado, o hilo CCA | Alta si ocurre; se detecta al recibirlo |
| 2 | Subtensión intermitente por cable o contacto malo | Alta |
| 3 | Colores que no corresponden a la polaridad | Alta si ocurre (polaridad invertida) |
| 4 | Conector que se afloja, o hilos rotos junto al sobremoldeado | Alta (apagado sin aviso) |
| 5 | Sobremoldeado que no asienta o no cabe | Media |
| 6 | Calor en los contactos a 2 A mantenidos | Media-baja |
| 7 | Caída extra del fusible F1 y su derating con el calor | Media-baja, sin cuantificar |
| 8 | Sin protección de sobrecorriente en la rama de la Pi | Media |
| 9 | Hilos de datos o de drenaje sueltos | Baja |
| 10 | Cambio de fabricante sin cambiar de ASIN | Media, sin confirmar |

### 5.1 Calibre real menor que el anunciado, y CCA

- **Medidas de cables micro-USB reales.** Un hilo de EEVblog (2013) midió la resistencia del camino VBUS + GND de varios cables micro-USB con una plantilla de cuatro hilos. Resultados: de 109 a 183 mΩ por metro para cables de marca (Lenmar, ASUS Nexus 7, Nokia, Tenergy, Sony, Sansa) y **de 333 a 347 mΩ por metro para dos cables de DealExtreme marcados 28 AWG**, es decir, de 2 a 3 veces más. El autor dice que esos cables limitaban un cargador a 700-800 mA frente a 1,5 A con un cable bueno. Restó contactos supuestos (20 y 30 mΩ de la hoja), no medidos. No uso sus estimaciones de AWG porque no he podido comprobar si trata la cifra como lazo o como un solo conductor; solo las resistencias medidas. ([EEVblog](https://eevblog.com/forum/reviews/quick-and-dirty-micro-usb-test-jig-and-results)). **Cálculo propio con esas cifras:** a 15 cm, esos dos cables darían unos 50 mΩ, tres veces los 16 mΩ de un 22 AWG real (un 28 AWG ideal daría 64 mΩ de lazo en 15 cm).
- **Un cable corto barato, medido.** Un blog (2015) midió un hilo de un cable USB-micro USB barato de unos 15 cm con trenzado de tela: **76 mΩ por un solo hilo** a 500 mA (38 mV), sin contar contactos. Un 22 AWG de 15 cm daría unos 8 mΩ (cálculo propio), diez veces menos. El autor lo consideró "no tan malo" para unos 600 mA. ([blog de Grant Trebbin](https://www.grant-trebbin.com/2015/08/usb-cable-resistance.html))
- **Citas de foros sobre calibres.** En el hilo de element14 sobre la tensión mínima de la 3B+, un usuario dice que muchos cables USB estándar llevan hilos de 26 a 28 AWG, demasiado finos para los 2,5 A de la Pi, y recomienda 20 a 22 AWG y no más de 1,2 a 1,8 m. En el issue raspberrypi/linux#2512, un participante dice que los cables micro-USB medios llevan 26 o 28 AWG y no se pensaron para más de 500 mA. Ninguno da una medida; son opiniones de usuarios, no una norma. ([element14](https://community.element14.com/products/raspberry-pi/f/forum/38347/what-is-the-minimun-supply-voltage-for-the-pi3b-plus), [raspberrypi/linux#2512](https://github.com/raspberrypi/linux/issues/2512))
- **CCA (aluminio recubierto de cobre).** Fluke indica que el aluminio macizo tiene un 55 % más de resistencia en continua que el cobre del mismo diámetro; el CCA queda entre ambos (deducción mía). Wikipedia dice que el CCA tiene "más resistencia o requiere un conductor mayor" y que es difícil de soldar. **No he encontrado ninguna medición de CCA en cables micro-USB** ni ninguna prueba que diga que este ASIN lo sea. ([Fluke](https://cccassoc.org/wp-content/uploads/2020/03/FLUKE_Application_Note_Copper_Clad_Aluminum_CCA_Cables.pdf), [Wikipedia](https://en.wikipedia.org/wiki/Copper-clad_aluminium_wire)). La prueba de rascado (raspar un hilo y buscar plata debajo del cobre) es la que da Fluke en esa nota.
- **Que 22 AWG se anuncie y lleve menos:** no he encontrado ningún estudio que lo cuantifique para latiguillos de Amazon.es. Es el motivo de medir (sección 6).

### 5.2 Subtensión por cable o contacto malo

- **Raspberry Pi: raspberrypi/linux#2512.** Los avisos de subtensión aparecen en el log del kernel desde la 4.14.30. Un usuario midió en una Pi (modelo no indicado en el resumen que leí): sin carga 4,86 V en los pines 4 y 6 del GPIO y 4,92 V en PP1/2; con carga de CPU 4,46 V en el GPIO, 4,64 V en PP1/2 y 4,58 V en PP7. La salida de su fuente medía 5,30 V (~300 mA) y 5,40 V (~950 mA). Otro usuario cuenta que cambió el cable micro-USB y no volvió a ver avisos en 12 horas (lo dice con duda: "creo que fue eso"). Un mantenedor dijo que el problema es "una entrega de potencia inadecuada". El registro se limita a tres mensajes cada cinco minutos. ([GitHub](https://github.com/raspberrypi/linux/issues/2512))
- **Lo que enseña ese caso (cálculo y deducción míos):** entre la salida de su fuente (5,40 V a ~950 mA) y PP1/2 (4,64 V) cayeron 0,76 V, equivalente a unos 0,8 Ω de cable y contactos si las lecturas fueron simultáneas. Eso es un camino unas 4 o 5 veces peor que el caso D de la sección 4.3. Además, PP7 y los pines 4 y 6 del GPIO son la misma red de 5 V en el esquema, pero sus lecturas a carga difieren 0,12 V (4,58 y 4,46 V); **no sé explicarlo** (el resumen que leí no dice dónde conectó la masa de la sonda) y no uso esas cifras como referencia.
- **Pi 3B+ concreta:** un usuario de element14 vio avisos y la mitad de velocidad con 4,98 V de entrada y arregló el problema con 5,1 V. No dice qué cable usaba. ([element14](https://community.element14.com/products/raspberry-pi/f/forum/38347/what-is-the-minimun-supply-voltage-for-the-pi3b-plus))
- **Pi antiguas (modelo B, fusible F3).** Hilos de element14 muestran el fallo de pantalla HDMI por debajo de 4,8 V en TP1/TP2 y una caída de unos 120 mV entre cable y conector. No son 3B+ y el fusible era otro, así que **no los uso para cifras**. ([hilo 1](https://community.element14.com/products/raspberry-pi/f/forum/18522/power-supply-issues), [hilo 2](https://community.element14.com/products/raspberry-pi/f/forum/21109/element14-au-power-supply-for-raspberry-pi---poor-voltage))
- **Reinicios con cable largo:** el único caso concreto que vi (blog de Trebbin) terminó siendo la cámara web, no el cable. No he encontrado un caso documentado de reinicio de una 3B+ por un latiguillo corto de 22 AWG.

### 5.3 Colores que no corresponden a la polaridad

- La especificación da **rojo para VBUS y negro para GND como colores "típicos"**, no obligatorios (Tabla 4-2). Un cable cualquiera de Amazon puede no seguirlos, y los cables de cuatro hilos suelen usar también blanco y verde para datos.
- Si se invierte, la Pi recibe la polaridad contraria. En el esquema reducido solo veo F1 y el TVS D7 (dibujado como un diodo unidireccional) entre la entrada y el resto, así que la protección sería que D7 conduzca y F1 dispare (deducción mía). **No lo he probado ni encontrado fuente, y no lo recomiendo probar.** Se descarta midiendo antes (sección 6, medida 4).

### 5.4 Conector flojo, hilos rotos y conector de la Pi

- **Sobre el conector de la placa:** encontré dos casos sueltos de gente con el micro-USB de la Pi roto: un usuario de Pimoroni que lo rompió y preguntó cómo alimentar la Pi de otra forma, y un usuario de Raspberry Shake (un sismógrafo sobre una Pi) cuyo enchufe aparece "agrietado", con la recomendación de cambiar la placa o usar PoE. Son anécdotas, sin cifras ni causa ni modelo claros. ([Pimoroni](https://forums.pimoroni.com/t/broken-power-supply-usb/16874), [Raspberry Shake](https://community.raspberryshake.org/t/power-supply-socket-issue/4788/2))
- **Qué no he encontrado:** datos de fallos por vibración del micro-USB, estadísticas de aflojamiento o ensayos independientes. La especificación no define vibración (sección 3). Tampoco he encontrado documentación de Raspberry Pi sobre soldaduras del conector.
- **Qué falla en cables baratos (conocimiento general):** soldaduras frías en la patilla del conector, hilos cortados al pelar, crimpados flojos y falta de descarga de tracción. Una fuente de fabricante lo resume así para cables en general (mala descarga de tracción, flexión junto al conector y soldaduras defectuosas). ([EPEC](https://www.epectec.com/articles/what-causes-cable-assemblies-to-fail-and-how-to-avoid-them.html), artículo citado en la ficha del cable USB-A a USB-C)

### 5.5 Sobremoldeado que no asienta

- No he encontrado fuente sobre sobremoldeados anchos que no asienten en la Pi 3B+. La especificación fija sus dimensiones máximas en la Figura 4-5 (p. 18) y no pude leerlas.
- Según el plano mecánico (medido sobre la imagen), no hay nada alto junto al micro-USB que choque con un sobremoldeado de tamaño normal (sección 3). En el montaje, lo que puede impedir el asiento es la caja o el separador. Se comprueba enchufando (sección 6, medida 6).

### 5.6 Calor, fusible F1 y sobrecorriente

- **F1 es un fusible reseteable (PTC).** El MF-MSMF250/16X-2 mantiene 2,5 A y dispara a 5 A según DigiKey. **No he podido abrir la curva de derating del datasheet de Bourns.** Es de conocimiento general que un fusible reseteable mantiene menos corriente al subir la temperatura (por eso a 40-50 °C dentro de una caja deja menos margen que a 23 °C), pero **no tengo la cifra**. Con picos de 2,0 A a 40 °C conviene comprobar en la máquina que F1 no se calienta ni dispara (sección 6, medida 8).
- **Sin protección en la rama.** Entre la WAGO y la Pi no hay ningún fusible; el cable de 22 AWG admite 3 A a 60 °C según la tabla de Wikipedia, y la LRS-50-5 da 10 A. Un cortocircuito en el latiguillo antes de F1 no lo limita nada más que la fuente. La ficha del cable USB-A a USB-C ya señala lo mismo para la rama del Solo. **No he comprobado el límite de sobrecorriente de la LRS-50-5**; es un tema para la ficha de la fuente.

### 5.7 Hilos de datos y de drenaje

- En un cable con cuatro hilos, los blancos y verdes (D− y D+) quedan colgando en la WAGO. No hacen nada (los pines están sin conectar en la Pi), pero podrían cortocircuitar con el +5 V o el GND si no se aíslan. Se corta y se aísla cada uno (sección 4.2).

### 5.8 Continuidad del producto

- Un anuncio genérico puede cambiar de fabricante sin cambiar de ASIN. No lo he podido confirmar para este anuncio. Compra las seis unidades y reserva el mismo lote para las máquinas en serie.

## 6. Qué comprobar al recibirlo

Con el cable **desconectado de todo y sin cortar**. Necesitas un polímetro, una fuente de laboratorio o un alimentador de 5 V y una carga resistiva (por ejemplo 5 Ω y 5 W para unos 1 A). Para acceder a los pines del micro-USB usa una placa adaptadora (breakout) micro-USB hembra, o la propia Pi **sin alimentar**; la disponibilidad de la placa en Amazon.es **no la he comprobado**.

| # | Medida | Resultado esperado | Si no sale |
|---|---|---|---|
| 1 | Aspecto: marca impresa en la funda, número de hilos, color | Calibre impreso o dato del anuncio; anota qué ves | Sin marca: trátalo como 28 AWG |
| 2 | Rasca la punta de un hilo pelado con una cuchilla o abre una punta | Cobre rojizo por dentro | Plata o gris debajo del cobre: es CCA (Fluke), recházalo |
| 3 | Continuidad de **cada** hilo extremo a extremo (hilo pelado ↔ pin del plug en la placa adaptadora) | Un hilo por pin, sin cortocircuitos entre ellos | Cualquier otro resultado: rechazar |
| 4 | **Polaridad:** con el plug en la **Pi sin alimentar**, continuidad entre el hilo rojo y el pin 2 o 4 del GPIO (5 V, pasa por F1), y entre el negro y el pin 6 o 9 (GND). Método mío, a partir del esquema | Rojo ↔ 5 V y negro ↔ GND | Si salen cruzados, el cable tiene los colores al revés: **anótalo y no lo uses sin marcar los hilos** |
| 5 | Qué hilos van a D− (pin 2), D+ (pin 3) e ID (pin 4) del plug | Opcional: saberlo permite aislarlos | Hilo que va a VBUS o GND por error: rechazar |
| 6 | **Asiento:** enchufa el plug en la Pi (sin alimentar) | El plug entra hasta el fondo, hace clic y no queda hueco visible entre el sobremoldeado y el borde de la placa | Si no asienta del todo: rechazar |
| 7 | **Calibre real por caída a 1 A:** conecta el plug a la placa adaptadora y una carga de unos 5 Ω a sus pads VBUS y GND; alimenta desde el extremo pelado (+ al rojo, − al negro) con 5 V. Mide la tensión **en cada hilo** entre el extremo pelado y su pad | Valores de referencia por hilo de 30 cm a 1 A: 22 AWG 16 mV, 24 AWG 25 mV, 26 AWG 40 mV, 28 AWG 64 mV (cálculo propio, sin contactos; el contacto del plug suma de 10 a 30 mV más) | Hasta unos 50 mV por hilo: compatible con 22 AWG. Más de unos 70 mV: hilo más fino de lo anunciado, CCA o contacto defectuoso; rechazar. Entre ambos: repetir enchufando de nuevo. Umbrales míos |
| 8 | **Prueba final en la Pi alimentada:** mide la tensión en los pines 4 y 6 del GPIO con la máquina en el peor caso (cámara, pantalla, Wi-Fi y una prueba de esfuerzo de CPU), y también en la WAGO. Mira `vcgencmd get_throttled` | `0x0`. La diferencia entre la WAGO y los pines 4 y 6, dividida por la corriente, es la resistencia real del camino (cable, contactos y F1) y se compara con la tabla 4.3 | Menos de unos 4,9 V en los pines 4 y 6 (criterio mío: deja margen sobre 4,86 V): revisa cable, contactos, el ajuste de 5,20 V y el consumo |
| 9 | **Temperatura:** tras 1 hora de carga alta, toca el conector en la Pi y el hilo | Sin calentamiento notable | Calor notable: medir con termopar o cámara térmica |
| 10 | **Tirón suave** del cable por el lado de los hilos con el plug en la Pi, midiendo la tensión | Sin saltos | Cualquier salto o corte: rechazar |

Notas:

- Los polímetros baratos no resuelven 8 mΩ. Por eso la medida 7 usa **caída de tensión bajo corriente** en lugar de resistencia.
- La medida 4 usa la Pi sin alimentar: **nunca la hagas con la Pi encendida**. El fusible F1 y el TVS D7 estarán en el camino, y es una medida de continuidad, no de tensión.
- Mide **todas** las unidades que compres, no una muestra: con un producto genérico el fallo no se reparte al azar.

## 7. Alternativas

Solo hay motivo para cambiar si el latiguillo no pasa las medidas de la sección 6 o si la sujeción mecánica resulta insuficiente.

- **Alimentar por los pines GPIO de 5 V** (pines 2 o 4 para +5 V y 6 o 9 para GND) con cables Dupont o con un conector propio. El product brief lo admite como entrada ([RP-008338-DS-2](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf)). Según el esquema reducido, esos pines están en la red de 5 V **después de F1**, así que se salta el fusible. Un hilo de element14 sobre una Pi antigua (modelo B, fusible F3) lo dice así: se pierde "toda la protección" del fusible ([element14](https://community.element14.com/products/raspberry-pi/f/forum/19139/how-much-current-can-i-put-into-my-rpi/22931)). **No he podido leer la advertencia de la documentación oficial.** Ventaja: no depende del micro-USB. Inconvenientes: sin F1, la fuente de 10 A queda como única protección, y los conectores Dupont de 0,1" no están pensados como conector de potencia (observación mía; su corriente máxima **no la he verificado**). **No lo recomiendo salvo con un fusible propio por rama.**
- **Plug micro-USB macho con bornes de tornillo**: hay placas de este tipo, pero **no he buscado fuentes ni modelos concretos** y no hay indicio de que resuelva algo que un latiguillo bien sujeto no resuelva.
- **Módulo con salida micro-USB fija:** **no investigado**; no encuentro un motivo mientras el latiguillo pase las medidas.
- **PoE:** el brief dice que la Pi es compatible con PoE con un HAT aparte. Cambia toda la arquitectura de alimentación; queda fuera de esta ficha.

## 8. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Mide las seis unidades antes de cortar ninguna** (sección 6, medidas 2 a 7). Descarta las que tengan CCA, calibre inferior a 22 AWG, polaridad cruzada o un plug que no asiente. Guarda lote, vendedor y fecha del pedido.
2. **Pregunta por escrito al vendedor** antes de comprar más: ¿cuántos hilos tiene?, ¿qué metal (cobre puro)?, ¿calibre real de rojo y negro?, ¿lleva datos?, ¿qué fabricante? Guarda la respuesta. Es lo único que los anuncios genéricos no dicen.
3. **Corta a 15 cm solo si hace falta.** Con 22 AWG real, cada 15 cm extra cuesta 16 mΩ (40 mV a 2,5 A). Un tendido de 20 a 25 cm que evite tensión en el conector es mejor que uno de 12 cm tirante.
4. **Aísla y corta al ras los hilos de datos y el de drenaje.** No conectes el blindaje a ninguna masa, según la guía (§5.2).
5. **Sujeta el cable:** una abrazadera o brida a 2 o 3 cm del sobremoldeado, fijada a la caja interior, y un seno de cable entre ese punto y la WAGO para que el movimiento de los muelles lo absorba el cable y no el plug. Es lo único que protege el único camino de potencia. **La lista de compra de la guía no incluye bridas ni abrazaderas**; habría que añadirlas.
6. **Pon un repuesto medido y marcado por máquina** (las seis unidades dan para eso). Es un fallo de segundos de reparar.
7. **Valida la tensión en la propia Pi** (sección 6, medida 8) con la máquina cerrada y a la temperatura más alta del local. Mi cálculo es una cota, no una medida. Criterio mío: al menos 4,9 V en los pines 4 y 6 en el pico, y `vcgencmd get_throttled` en `0x0`.
8. **Mide la corriente real de la Pi** y sustituye los 0,9 y 2,0 A estimados de la guía. Con ella, la sección 4.4 dice si hay riesgo de calor en el conector.
9. **Si se confirma que la Pi consume más de 2 A de forma sostenida,** reduce consumo (cámara, Wi-Fi USB) antes de tocar el cable: el cuello de botella es el conector de la Pi.
10. **Plan de reserva:** si el micro-USB resulta poco fiable en vibración, la opción es la alimentación por GPIO con fusible propio (sección 7). Antes de eso, prueba la sujeción.

**Afecta a otras piezas (una línea cada una):**

- **Ficha de la Pi:** el umbral de 4,63 V y su tolerancia (±5 % frente a ±0,07 V del supervisor, según los hilos de element14) no están confirmados en un documento oficial que haya podido abrir.
- **Regleta WAGO (#20):** su ficha ya dice que el 22 AWG (0,33 mm²) entra en el rango de la 221 y que cada carga va en su propio polo. No hay nada que corregir; solo falta que el hilo pelado sea de cobre y no se parta al pelar.
- **Fuente LRS-50-5:** falta comprobar su límite de sobrecorriente para decidir si la rama de la Pi necesita fusible.
- **Cable HDMI de la pantalla:** su pantalla y blindaje unen la masa de la Pi con la de la pantalla, que también llega a la WAGO por otro cable. Es un segundo camino de masa que la guía no cita ("no hagas más uniones de masa"). Deducción mía, no medida.

## 9. Lo que no he podido verificar

- **El anuncio de Amazon:** marca, vendedor, número de hilos, calibre real, si hay CCA, datos, blindaje, sobremoldeado. Amazon bloquea mi herramienta (`ROBOTS_DISALLOWED`) y no encontré el ASIN en otras webs.
- **El texto de la documentación oficial de Raspberry Pi sobre alimentación** (la sección "Power supply"): la página llega cortada a mi herramienta. Por eso no confirmo en un documento oficial el umbral de 4,63 V, su tolerancia, dónde se mide ni el voltaje esperado en los puntos de prueba. Lo que cito sale de comentarios de usuarios (element14, GitHub).
- **Cómo se rotulan los puntos de prueba en la placa 3B+** ("TP1/TP2" frente a PP2/PP7 del esquema) y qué tensión debe haber en ellos según la documentación.
- **El datasheet de Bourns del MF-MSMF250** (resistencia inicial máxima, curva de derating, caída a 2 A): intenté dos enlaces y mi herramienta los bloqueó. Los valores son los de DigiKey para el MF-MSMF250/16X-2. **No sé qué variante exacta (`/X`) monta la Pi.**
- **El datasheet del conector Amphenol 10103594-0001LF** (resistencia de contacto, temperatura): no encontré el PDF. Los 1,8 A y 10.000 ciclos salen de un distribuidor.
- **Conectores de Molex, Hirose y Würth:** no los he consultado.
- **La Figura 4-5 de la especificación Micro-USB** (dimensiones del sobremoldeado) y las páginas exactas, que son inferidas de una copia no oficial.
- **Datos de vibración, aflojamiento y fallos por soldadura** del micro-USB de la Pi: no he encontrado ninguno.
- **Qué Pi se midió en raspberrypi/linux#2512** y si las lecturas de PP1/2, PP35 y PP7 corresponden a una 3B+.
- **El consumo real de la Pi** en la máquina (0,9 y 2,0 A son estimaciones de la guía) y **dónde se miden los 5,20 V**.
- **La corriente máxima por pin de los conectores Dupont** (alternativa por GPIO).
- **La política de devolución de Amazon.es y el marcado CE/RoHS** del anuncio.

## 10. Fuentes

Todos los enlaces, ordenados por tipo y con nota en los que no pude abrir, en [`enlaces.md`](enlaces.md).
