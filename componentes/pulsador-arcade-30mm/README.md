# Pulsador arcade de 30 mm (EG STARTS, pack de 5)

Botón de inicio de la prueba. La pantalla no es táctil, así que el usuario empieza con este pulsador. Va directo a la Raspberry Pi 3B+: contacto entre GPIO17 (pin físico 11) y GND (pin físico 9), con la resistencia pull-up interna de la Pi. El LED del botón no se conecta.

- **Compra:** ASIN B01N11BDX9, 10,88 € por 5 unidades (precio de la hoja de componentes del 19-20/10/2026). Es la pieza nº 11 de la hoja.
- **Documentos:** el anuncio genérico no tiene datasheet y no he encontrado ninguno del fabricante. Los datos de microinterruptores, contactos y robustez salen de productos de referencia (Adafruit, Sanwa, Seimitsu, Zippy, Omron, Schurter, APEM) y de notas de aplicación de TE y C&K.

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta y no insistí: el precio y lo que dice el anuncio de Amazon.es son los de tu hoja. Del mismo ASIN solo vi **los títulos** de Amazon.com y Amazon.ca en resultados de búsqueda. Mi herramienta de lectura web devuelve resúmenes, no el original: donde una cifra importa, doy el enlace para que la compruebes. Se agotó el presupuesto de búsquedas web antes de cerrar todo; lo pendiente está en la [sección 14](#14-lo-que-no-he-podido-verificar).

> **Actualización 21-10-2026 (anuncio de Amazon.es leído).** Después de escribir esta ficha pude abrir el anuncio con el navegador integrado, así que lo que dice arriba de que Amazon bloquea el acceso ya no vale para esta pieza. Lo que cambia: tiene 4 faston de 2,8 mm: dos del microinterruptor y dos del LED con polaridad. **No existen NO, COM ni NC**: el interruptor tiene solo dos contactos, sin polaridad. Un faston del interruptor va al pin 9 (GND) y el otro al pin 11, en cualquier orden. Ningún terminal va rotulado: con el polímetro en continuidad, el par que cierra al pulsar es el del interruptor. Donde esta ficha habla de NO, COM y NC, vale esto. Ver el [detalle y origen de cada dato](../../montaje-general/anuncios-amazon-21-10-2026.md).

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Qué producto es exactamente](#2-qué-producto-es-exactamente)
3. [Especificaciones](#3-especificaciones)
4. [Documentos oficiales y de referencia](#4-documentos-oficiales-y-de-referencia)
5. [Conexión a la Pi y software](#5-conexión-a-la-pi-y-software)
6. [Corriente baja: el contacto y la "carga mínima"](#6-corriente-baja-el-contacto-y-la-carga-mínima)
7. [Robustez en un bar](#7-robustez-en-un-bar)
8. [ESD y cableado al GPIO](#8-esd-y-cableado-al-gpio)
9. [Montaje mecánico](#9-montaje-mecánico)
10. [Fallos, bugs y problemas conocidos](#10-fallos-bugs-y-problemas-conocidos)
11. [Qué comprobar al recibirlo](#11-qué-comprobar-al-recibirlo)
12. [Recomendaciones para el alcoholímetro](#12-recomendaciones-para-el-alcoholímetro)
13. [Discrepancias con la guía de montaje](#13-discrepancias-con-la-guía-de-montaje)
14. [Lo que no he podido verificar](#14-lo-que-no-he-podido-verificar)
15. [Fuentes](#15-fuentes)

---

## 1. Resumen para el proyecto

- **No hay datasheet ni fabricante identificable.** "EG STARTS" es una marca que se vende en Amazon y otras tiendas, con muchas series (LED de 5 V y de 12 V, tipo Happ, triangulares, rectangulares, de cúpula). Del microinterruptor interior no sé marca, contactos, carga nominal, fuerza ni recorrido. Todo eso hay que **medirlo al recibirlo** ([sección 11](#11-qué-comprobar-al-recibirlo)).
- **La conexión de la guía es correcta en lo esencial.** Pin 11 es GPIO17 y pin 9 es GND ([pinout.xyz](https://pinout.xyz/pinout/pin11_gpio17)). `gpiozero.Button` activa el pull-up interno por defecto ([código de gpiozero](https://raw.githubusercontent.com/gpiozero/gpiozero/master/gpiozero/input_devices.py)). El pull-up es de 50-65 kΩ según la documentación de Raspberry Pi ([hardware](https://www.raspberrypi.com/documentation/hardware/raspberrypi/)). Dos supuestos de la guía **no están comprobados**: que el interruptor tenga NO, COM y NC, y que los terminales sean de 2,8 mm.
- **La carga del contacto es mínima: 3,3 V y unos 51-66 µA** (cálculo mío con el pull-up de 50-65 kΩ). Es entre 15 y 20 veces menos que el mínimo de referencia de un microinterruptor de oro de Omron (5 V, 1 mA) y unas 450-590 veces menos que el de uno de plata (5 V, 30 mA). TE y C&K apuntan a contactos de oro para cargas bajas. El riesgo de un contacto que se vuelve intermitente con los meses es **real pero moderado**: la Pi todavía lee "pulsado" con una resistencia de contacto de hasta unos 19-24 kΩ (cálculo mío). Se mitiga con una resistencia externa de 1-4,7 kΩ ([sección 6](#6-corriente-baja-el-contacto-y-la-carga-mínima)).
- **El mayor riesgo en un bar son los líquidos, no la vida del interruptor.** Ninguna ficha de botón arcade que he visto publica grado IP ni IK. Cerveza o refresco en el interior pueden dar contactos sucios, pegajosidad o una fuga entre terminales que, con un pull-up tan débil, se lee como pulsación (umbral en la [sección 7](#7-robustez-en-un-bar)). Hay alternativas antivandálicas con datasheet (Schurter MSM, APEM AV).
- **Los 1.000.000 de pulsaciones son una cifra de marketing.** Aparece en textos de otros productos EG STARTS, sin método de ensayo, y un kit de la marca en Newegg dice "10 millones". Con 100 pruebas al día serían unos 27 años (cálculo mío), así que la vida del interruptor no es el factor limitante.
- **ESD:** Raspberry Pi no documenta protección de los GPIO frente a ESD. El usuario toca la tapa de plástico del botón, no el cable, pero el cable es una antena para un nodo de 50-65 kΩ. Propongo una resistencia en serie y un condensador en el extremo de la Pi (opinión, [sección 8](#8-esd-y-cableado-al-gpio)). La guía v2 quitó el filtro del pulsador; es una decisión razonable si se prueba.

## 2. Qué producto es exactamente

La hoja dice "EG STARTS arcade de 30 mm (5 uds.)" y el ASIN B01N11BDX9. Amazon bloquea el acceso, pero este ASIN aparece en resultados de búsqueda de Amazon.com y Amazon.ca. Lo único que vi son los **títulos**:

- Amazon.ca: [EG Starts 5x 30mm Arcade LED Lights Push Button Built-in Switch 5V Illuminated Buttons For Arcade Machine Games DIY Kit Parts Jamma Mame Raspberry Pi 1 2 3 (Each color of 1 Piece) & 5 Colour](https://www.amazon.ca/EG-Illuminated-Buttons-Machine-Raspberry/dp/B01N11BDX9).
- Amazon.com: [mismo título](https://www.amazon.com/EG-STARTS-Illuminated-Buttons-Raspberry/dp/B01N11BDX9) (también [esta URL](https://us.amazon.com/clp/B01N11BDX9)).

Lo que se deduce del título, con la cautela de que el anuncio español puede ser distinto:

- Cinco botones de 30 mm, **uno de cada color** ("each color of 1 piece"). Solo hace falta uno; los otros cuatro son repuestos.
- LED de **5 V**.
- "Built-in switch": interruptor incluido, sin más datos.

**Otros productos EG STARTS que no son este ASIN** y que no hay que mezclar con él:

| Producto EG STARTS | Lo que dice su ficha | Fuente |
|---|---|---|
| Kit de 1 jugador (joystick + botones), LED de 5 V | "gilded contact legs" y "reliability tested to 1,000,000 cycles". Agujero de botones de 30 mm | [Carrefour UAE](https://www.carrefouruae.com/mafuae/en/starter/eg-starts-arcade-buttons-1-player-diy-kit-joystick-5v-led-arcade-button-for-arcade-stick-pc-games-mame-raspberry-pi/p/3233001890912) |
| Mismo kit en Newegg | "built-in blue switch", contactos chapados en oro, vida "up to 10 million", agujero de botones 28-30 mm | [Newegg](https://www.newegg.com/p/2A4-00D0-00033) |
| Mismo kit en Desertcart | Una reseña dice que los botones llevan **interruptores mecánicos de teclado soldados** y que se pueden sustituir | [Desertcart](https://www.desertcart.pl/products/38404680) |
| 6X "American Style" tipo Happ, 30 mm | Se monta en un agujero de **28 mm**, terminal de **3/16" (4,8 mm)**, 1.000.000 de ciclos | [Desertcart](https://www.desertcart.lk/products/239728143) |
| 5X triangulares, LED de 12 V | 12 V, 1.000.000 de ciclos, nailon | [Shopabunda](https://www.shopabunda.com/products/eg-starts-5x-arcade-buttons-triangle-led-illuminated-push-button-switch-for-arcade-coin-machine-operated-games) |
| 5X cúpula de 60 mm, LED de 12 V | 12 V; la lista de tamaños incluye 30 mm sin explicar | [Desertcart](https://www.desertcart.pl/products/40385726) |

Consecuencia (deducción mía): la marca mezcla botones de 5 V y de 12 V, de agujero de 28 y 30 mm y de terminal de 2,8 y 4,8 mm. Para este ASIN, el título de .com/.ca apunta a 5 V, y la forma de "LED + built-in switch" se parece al botón de rosca de Adafruit (ver [sección 3](#3-especificaciones)). **No lo puedo confirmar.**

## 3. Especificaciones

### 3.1 El EG STARTS de este ASIN

| Característica | Valor | Fuente / estado |
|---|---|---|
| Pack | 5 botones de 30 mm, uno de cada color | Hoja del usuario y título de Amazon.com/.ca. **Sin verificar para Amazon.es** |
| Tensión del LED | 5 V | Título de Amazon.com/.ca. Otros EG STARTS son de 12 V |
| Interruptor | "Built-in switch". Marca, tipo, material de contacto, corriente y tensión nominales: **no publicados** | Sin verificar |
| Vida | 1.000.000 de pulsaciones "según el anuncio" | Hoja. Textos de otros EG STARTS repiten la cifra sin método ([Carrefour](https://www.carrefouruae.com/mafuae/en/starter/eg-starts-arcade-buttons-1-player-diy-kit-joystick-5v-led-arcade-button-for-arcade-stick-pc-games-mame-raspberry-pi/p/3233001890912)). **Sin verificar** |
| Contactos | "Patas doradas" y "gold-plated" en kits EG STARTS; para este ASIN no consta | "Patas doradas" no significa contacto de oro del interruptor. **Sin verificar** |
| Agujero, grosor de panel, profundidad, diámetro de cabeza, peso | No publicados | **Sin verificar** (referencias en 3.2) |
| Terminales | No publicados (2,8 mm o 4,8 mm) | **Sin verificar** |
| Fuerza y recorrido | No publicados | **Sin verificar** |
| Resistencia de contacto | No publicada | **Sin verificar** |
| IP / IK / temperatura | No publicados | **Sin verificar** |
| Certificados, RoHS, declaración de conformidad | No he visto ninguno | **Sin verificar** |
| Precio | 10,88 € por 5 (2,18 € por unidad) | Hoja (19-20/10/2026) |

### 3.2 Botones de 30 mm de referencia (no son el tuyo)

El más parecido por descripción es el de Adafruit con LED y rosca. Los datos del Sanwa, Seimitsu y Zippy son de tiendas, no del fabricante.

| | Adafruit 3489 (30 mm con LED, rosca) | Sanwa OBSF-30 (a presión) | Seimitsu PS-14-G (a presión) |
|---|---|---|---|
| Montaje | Se enrosca ([Adafruit](https://www.adafruit.com/product/3489)) | Snap-in ([Paradise Arcade](https://paradisearcadeshop.com/products/sanwa-obsf-30-snap-in-button-red)) | Snap-in ([Paradise Arcade](https://paradisearcadeshop.com/a/p/products/seimitsu-ps-14-g-30-mm-snap-in-button-red)) |
| Agujero | unos 30 mm | 30 mm | 30 mm |
| Grosor de panel | hasta unos 20 mm | hasta 3,7 mm ([Arcadexpress](https://www.arcadexpress.com/en/buttons/104-boton-arcade-sanwa-obsf-30.html)); unos 2-4 mm (Paradise) | no consta |
| Terminales | 2,8 mm ([Pihut](https://thepihut.com/products/arcade-button-with-led-30mm-translucent-green)) | 2,8 mm (.110") | .110" |
| Tamaño | dimensiones generales 33,2 × 31,7 mm (Pihut; no dice qué cota es cada una) | no consta | profundidad de instalación 32,5 mm, diámetro total 34,5 mm |
| Interruptor | microinterruptor con "gold-plated contacts"; sin valores | Sanwa SW-68 | MM9-4 (según la tienda) |
| Fuerza | "suave, sin clic fuerte" | 55 g de operación, 27 g previa, 81 g a fondo | 100 ± 30 g |
| Recorrido | no consta | 0,85 mm hasta operar, 2,53 mm total | 2,5 ± 0,3 mm hasta operar |
| Vida | no consta | ver nota abajo | mecánica más de 2.000.000 |
| LED | 2 LED SMD en serie con 200 Ω; 5 V a 10 mA (ficha) o 5 mA (texto). Rojo y amarillo **no encienden a 3,3 V** | según versión | según versión |

**Nota sobre el Sanwa SW-68: dos tiendas dan cifras distintas y ninguna es Sanwa.**

- [Paradise Arcade](https://paradisearcadeshop.com/products/sanwa-obsf-30-snap-in-button-red): DC 12 V 100 mA; vida de 1 millón de ciclos **a 5 VDC 10 mA**; resistencia de contacto de 50 mΩ o menos; aislamiento 50 MΩ a 250 VDC; −20 a +60 °C.
- [Arcadexpress](https://www.arcadexpress.com/en/microswitches/1289-sanwa-sw-68-microswitch-for-obsf-obsn-obsc-button.html): 16 A AC / 0,6 A DC, 250 VAC / 125 VDC; vida eléctrica 300.000 y mecánica 50.000.000.
- No encontré la hoja de Sanwa. No uso ninguna de las dos como dato firme.

**Zippy** ([Adafruit 817, Zippy VM-05S-00D0-Z](https://www.adafruit.com/product/817)): 3 terminales de 0,187" (4,8 mm), unos 200 g de fuerza, vida mecánica mínima 10 millones, eléctrica a 5 A mínima 10.000. Adafruit recomienda un máximo de 30 VDC y 250 mA. El producto ya no se vende ahí.

**Profundidad detrás del panel** del Adafruit 473 (a presión, sin LED): 1,5" (38 mm), o 1,25" (32 mm) doblando los contactos ([Core Electronics](https://core-electronics.com.au/arcade-button-30mm-translucent-red.html.plain.md)). Con el LED de rosca puede variar. Se mide al recibirlo.

## 4. Documentos oficiales y de referencia

No hay documento del fabricante. Esta tabla reúne lo que sirve para verificar la guía y evaluar el pulsador. Todos los enlaces están en [`enlaces.md`](enlaces.md).

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Documentación de hardware de Raspberry Pi (GPIO: tensiones, pull-up, corriente) | sección GPIO | HTML | [raspberrypi.com](https://www.raspberrypi.com/documentation/hardware/raspberrypi/) |
| BCM2835 ARM Peripherals (capítulo 6, GPIO) | RP-008249-DS-1 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/579-raspberry-pi-zero/documents/RP-008249-DS-1-bcm2835-peripherals.pdf) ([copia local](datasheets/RP-008249-DS-1-bcm2835-peripherals.pdf)) (mi herramienta solo leyó hasta la página 53) |
| Esquema reducido de la Pi 3B+ | RP-008339-DS-1 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf) |
| gpiozero, clase `Button` (código fuente) | `input_devices.py` | Python | [GitHub](https://raw.githubusercontent.com/gpiozero/gpiozero/master/gpiozero/input_devices.py) |
| Nota de aplicación de relés de Tyco Electronics (TE): contactos, películas, bajo nivel | 13C3236, 12-00 | PDF | [descargar](https://www.digital-loggers.com/relaycare.pdf) (copia en un servidor ajeno a TE) |
| Datos técnicos de contactos de C&K Components (catálogo, págs. N-7 a N-10) | catálogo C&K | PDF | [descargar](https://static.chipdip.ru/lib/181/DOC015181139.pdf) (copia en un servidor ajeno a C&K) |
| Omron: qué microinterruptores sirven para microcarga | FAQ de Omron | HTML | copia en [Digi-Key](https://forum.digikey.com/t/which-basic-switches-are-suitable-for-microload/35331) y [problemas bajo la carga mínima](https://forum.digikey.com/t/what-problems-may-occur-if-the-set-current-is-below-the-minimum-applicable-load-for-a-basic-switch/35390) |
| Omron D2MV (plata y oro): carga mínima y vida | página de Misumi | HTML | [Misumi](https://vn.misumi-ec.com/vona2/detail/221000559071/) |
| Schurter MSM, pulsador antivandálico de acero inoxidable | nombre de archivo: schurter_shris05004-1-1758128 (copia de Mouser) | PDF | [descargar](https://mouser.com/datasheet/2/358/schurter_shris05004-1-1758128.pdf) ([copia local](datasheets/schurter_shris05004-1-1758128.pdf)) |
| Schurter MSM 22 (copia de RS) | nombre de archivo: 0900766b8141c4e2 | PDF | [descargar](https://docs.rs-online.com/88f6/0900766b8141c4e2.pdf) |
| APEM, serie AV (antivandálico y de seguridad) | nombre de archivo: Farnell 1564503 | PDF | [descargar](https://www.farnell.com/datasheets/1564503.pdf) ([copia local](datasheets/1564503.pdf)) |
| TI, ESD Fundamentals Part 2: IEC 61000-4-2 | SSZT871 | PDF | [descargar](https://edgeworker.ti.com/lit/pdf/sszt871) ([copia local](datasheets/sszt871.pdf)) |
| Analog Devices, rebote de interruptores y ESD | artículo técnico | HTML | [analog.com](https://www.analog.com/en/resources/technical-articles/switch-bounce-and-other-dirty-little-secrets.html) |

### Qué dicen los más relevantes

- **Documentación de Raspberry Pi** ([hardware](https://www.raspberrypi.com/documentation/hardware/raspberrypi/)): para BCM2835, BCM2836, BCM2837 y RP3A0, el pull-up y el pull-down son de **50 kΩ mínimo y 65 kΩ máximo**. Nivel bajo de entrada máximo 0,9 V; nivel alto mínimo 1,6 V; fuga de entrada de hasta 5 µA a 85 °C. Los pads se diseñan para 16 mA. No vi nada sobre ESD en la parte que pude leer (la página quedó truncada en 100.000 caracteres). La misma cifra de 50-65 kΩ aparece en [pinout.xyz](https://pinout.xyz/pinout/gpio) y en un [cambio del repositorio de documentación](https://github.com/raspberrypi/documentation/pull/2461/files).
- **TE, nota 13C3236** ([PDF](https://www.digital-loggers.com/relaycare.pdf)): las películas de sulfuro, óxido o contaminantes dejan que los contactos cierren físicamente pero fallen eléctricamente en circuitos secos o de bajo nivel. La plata fina no se usa en bajo nivel; se recomienda para 12 V y 0,4 A o más. Una capa de oro es la opción habitual en bajo nivel. La nota no da carga mínima ni corriente de mojado.
- **C&K, catálogo** ([PDF](https://static.chipdip.ru/lib/181/DOC015181139.pdf)): define circuito seco como el que no produce arco, con un máximo de 0,4 VA y 20 V. Para interruptores táctiles recomienda **oro por debajo de 12 V y 100 mA** y plata por encima de 0,5 V y 100 mA. No da carga mínima.
- **Omron** (copia en [Digi-Key](https://forum.digikey.com/t/which-basic-switches-are-suitable-for-microload/35331)): los modelos de microcarga tienen 0,1 A nominales. Como ejemplo da 5 VDC 1 mA y avisa de que no se debe usar por debajo de la carga mínima. Por debajo, la superficie del contacto se cubre más fácilmente de una película química y puede haber fallo de contacto. La carga mínima es un valor de referencia para un nivel de fiabilidad, no una garantía ([Digi-Key](https://forum.digikey.com/t/what-problems-may-occur-if-the-set-current-is-below-the-minimum-applicable-load-for-a-basic-switch/35390)). **No pude abrir la FAQ original de Omron** (redirige a otro dominio que mi herramienta bloqueó).

## 5. Conexión a la Pi y software

### 5.1 Lo que dice la guía y lo que he comprobado

| Punto | Guía | Resultado |
|---|---|---|
| GPIO17 es el pin físico 11 | §5.3 | Correcto ([pinout.xyz](https://pinout.xyz/pinout/pin11_gpio17)) |
| GND en el pin físico 9 | §5.3 | Correcto (misma página) |
| GPIO17 no choca con la UART del ZE29A | §7 | Sin conflicto. GPIO17 solo es RTS (UART0 en Alt3, UART1 en Alt5) en la Pi 1-3 (pinout.xyz). El ZE29A usa GPIO14/15 y la config de la guía no activa control de flujo (deducción mía) |
| Pull-up interno | §2.8 | `Button` tiene `pull_up=True` por defecto: el pin queda a nivel alto y el otro lado del botón va a masa ([gpiozero](https://raw.githubusercontent.com/gpiozero/gpiozero/master/gpiozero/input_devices.py)) |
| `bounce_time=0.05` | §2.8 | Por defecto es `None` (sin antirrebote); con 0,05 se ignoran cambios durante 50 ms tras el primero (gpiozero) |
| NO y COM | §2.8, §5.3 | **Sin comprobar** que este botón tenga NO, COM y NC. Muchos botones arcade tienen solo dos terminales (el SW-68 es NO/COM según [Arcadexpress](https://www.arcadexpress.com/en/microswitches/1289-sanwa-sw-68-microswitch-for-obsf-obsn-obsc-button.html)). Con dos terminales no importa cuál va a cuál |
| Faston de 2,8 mm | §2.8 | **Sin comprobar** para este botón. Adafruit y Sanwa usan 2,8 mm; el EG STARTS tipo Happ usa 3/16" (4,8 mm). El kit de faston B0B4H54KPS trae 2,8 y 4,8 mm |

### 5.2 Números del circuito (cálculos míos, con los datos de Raspberry Pi)

| Magnitud | Valor | Cómo sale |
|---|---|---|
| Pull-up interno | 50-65 kΩ | Documentación de Raspberry Pi |
| Corriente por el contacto cerrado | 51-66 µA | 3,3 V / 65 kΩ y 3,3 V / 50 kΩ |
| Potencia en el contacto | unos 0,2 mW | 3,3 V × 66 µA |
| Tensión del contacto abierto | 3,3 V | Pull-up |
| Resistencia de contacto máxima para leer "pulsado" | unos 18,8-24,4 kΩ | V_bajo = 3,3 V · Rc / (Rc + Rpu) ≤ 0,9 V (límite de la Pi), es decir Rc ≤ 0,375 · Rpu |
| Fuga entre terminales por debajo de la cual el pin ya no queda seguro en nivel alto | unos 47-61 kΩ | Necesita ≥ 1,6 V: R_fuga ≥ 0,941 · Rpu |

### 5.3 Rebote y 50 ms

- Analog Devices muestra un pulsador pequeño con unos 5 ms de rebote (unas 10 transiciones). Dice que el rebote varía entre unidades, lotes y con la edad del interruptor ([artículo](https://www.analog.com/en/resources/technical-articles/switch-bounce-and-other-dirty-little-secrets.html)).
- Hackaday cita a Jack Ganssle recomendando 20-50 ms, y aconseja pasarse en vez de quedarse corto ([artículo](https://hackaday.com/2015/12/09/embed-with-elliot-debounce-your-noisy-buttons-part-I/)). El MAX6816 de Analog usa 40 ms ±20 ms como retardo nominal.
- Omron dice, de la serie D2MV, que los contactos conectan o cortan "en 1 ms" ([Misumi](https://vn.misumi-ec.com/vona2/detail/221000559071/)). No dice que sea el rebote.
- **Conclusión mía: 50 ms es adecuado** (conservador para un microinterruptor sano; el rebote crece si se desgasta). El coste es no detectar toques de menos de 50 ms o filtrarlos según el backend. **Sin verificar:** cómo trata cada backend de gpiozero un toque más corto que `bounce_time`. En lgpio, gpiozero llama a `gpio_set_debounce_micros`; en RPi.GPIO pasa `bouncetime` en ms ([lgpio.py](https://raw.githubusercontent.com/gpiozero/gpiozero/master/gpiozero/pins/lgpio.py), [rpigpio.py](https://raw.githubusercontent.com/gpiozero/gpiozero/master/gpiozero/pins/rpigpio.py)). No leí la documentación de lgpio ni del kernel sobre la semántica exacta. Se prueba con toques rápidos.

### 5.4 Software defensivo (opinión mía)

- Usa `when_pressed` (flanco), no un bucle que mire el nivel, y **ignora pulsaciones mientras hay una prueba en curso**.
- Si `is_pressed` es verdadero al arrancar, o lleva más de unos segundos pulsado, trata el botón como averiado (líquido, atasco o gamberrada) y regístralo.
- Inicia la prueba solo si el cobro está confirmado. Así un botón atascado no regala pruebas.
- `hold_time` y `hold_repeat` existen en `Button` (valores por defecto 1 s y `False`) por si quieres detectar el atasco con la propia clase.

## 6. Corriente baja: el contacto y la "carga mínima"

### 6.1 El problema

Un microinterruptor típico de 1 A suele tener contactos de plata (el Omron D2MV-1, por ejemplo). La plata se cubre de película de sulfuro y óxido. Con corrientes o tensiones altas, el arco y el paso de corriente rompen la película en cada cierre. Con 3,3 V y unos 60 µA, no hay arco ni calor. La película puede crecer y el contacto cierra pero no conduce, o conduce a ratos. Eso es un "circuito seco" o de bajo nivel.

### 6.2 Qué dice la literatura

| Fuente | Qué dice | Qué implica aquí |
|---|---|---|
| TE (Tyco), nota 13C3236 | Películas de sulfuro, óxido o contaminantes: el contacto cierra pero falla eléctricamente en circuitos secos o de bajo nivel. Plata fina no apta para bajo nivel (se recomienda ≥ 12 V y 0,4 A). Capa de oro habitual en bajo nivel | Un contacto de plata sin oro está fuera de su zona |
| C&K, catálogo | Circuito seco: sin arco, máximo 0,4 VA y 20 V. Táctiles: oro por debajo de 12 V y 100 mA | Nuestra carga (3,3 V, ~60 µA) es circuito seco. Corresponde oro |
| Omron | Microcarga: 5 VDC 1 mA como ejemplo. No usar por debajo de la carga mínima. D2MV de plata: mínimo de referencia **5 VDC 30 mA**; D2MV-01 de aleación de oro: **5 VDC 1 mA**, resistencia de contacto ≤ 50 mΩ ([Misumi](https://vn.misumi-ec.com/vona2/detail/221000559071/)) | Nuestros 51-66 µA están 15-20 veces por debajo del oro y 450-590 veces por debajo de la plata (cálculo mío) |
| Artículo de Assembly Magazine (autor no identificado) | Circuito seco: tensión aplicada de unos 0,08 V. Capas de corrosión de menos de unas 10 capas atómicas no cambian la resistencia; las más gruesas se quitan por ruptura eléctrica ("fritting") o por rozamiento mecánico al cerrar. Aleaciones de oro habituales: AuNi, AuPd, AuAg ([artículo](https://assemblymag.com/articles/94940-switches-relays-high-reliability-at-low-loads)) | A 3,3 V hay tensión de sobra para la ruptura de capas finas; corriente poca (opinión mía) |
| PDF alojado en nkkswitches.com sobre materiales de contacto | Oro recomendado en bajo nivel; el oro sobre plata mantiene el oro en circuitos lógicos ([PDF](https://www.nkkswitches.com/wp-content/uploads/2016/02/switchcontactmaterial.pdf)) | Refuerza lo anterior. Mi herramienta avisó de que la página no nombra a NKK |
| ScienceInsights (sin autor ni fuentes) | Ruptura inicial del óxido por debajo de 2,5 V; por debajo de 10 V (típico 5 V) es donde más fallan los contactos ([página](https://scienceinsights.org/what-is-wetting-voltage-and-why-contacts-need-it/)) | Fuente débil. Solo orientativa |

**TE tiene un matiz importante para este caso:** si un contacto de oro sobre plata ha conmutado una carga con arco, el oro se pierde y deja de valer para bajo nivel. No es nuestro caso (3,3 V y µA no producen arco), pero sugiere que el oro se conserva mientras no se le dé potencia (deducción mía).

### 6.3 ¿Es un riesgo real aquí? (valoración mía)

- **A favor del riesgo:** la carga está muy por debajo de la carga mínima de referencia, incluso de los modelos de oro. Si el interruptor es de plata sin oro, no estamos en la zona que garantiza el fabricante. El fallo sería intermitente y con los meses (pulsaciones que no se leen).
- **En contra:** la Pi lee "pulsado" mientras la resistencia del contacto sea menor de unos 19-24 kΩ, muy por encima de las decenas de mΩ de un contacto sano. La película tiene que ser gruesa. A 3,3 V hay tensión de sobra para la ruptura eléctrica de capas muy finas (Assembly Magazine cita ~0,08 V como tensión de circuito seco), aunque ninguna fuente da el umbral para una corriente de 60 µA. Si el interruptor roza al cerrar, también ayuda (Assembly lo cita como segundo mecanismo); no sé si este lo hace. No he encontrado informes de fallos por este motivo en botones arcade con la Pi. **Tampoco he encontrado una prueba que lo descarte.** En un foro de 2004, un usuario cuenta que la oxidación que ha visto estaba dentro de los microinterruptores ([Arcade Controls](https://forum.arcadecontrols.com/index.php/topic,16540.0.html)); es anecdótico.
- **Mi conclusión:** riesgo moderado. Si el interruptor resulta ser de oro (o de teclado, ver 10.5), baja a bajo. Si es de plata, la solución es barata.

### 6.4 Medidas, de menos a más

1. **Identificar el interruptor** (marca impresa en el cuerpo). Si es un Omron, Kailh o similar, buscar su hoja. Si es un SW-68 o un clon, ver 3.2.
2. **Subir la corriente de mojado con una resistencia externa** de 1-4,7 kΩ entre GPIO17 y 3V3 (por ejemplo, del pin 11 al pin 1), en paralelo con la interna. Con 2,2 kΩ la corriente por el contacto es de unos 1,5 mA (3,3 V / 2,2 kΩ; cálculo mío), muy por debajo de los 16 mA del pad. El código no cambia. Además mejora la inmunidad a fugas (sección 7) y al ruido (sección 8). **Contra:** un hilo más y 1-3 mA a 3,3 V. La documentación de Raspberry Pi dice que la alimentación de 3,3 V se diseñó para unos 3 mA por pin GPIO ([documentación](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html)); 1,5 mA es de ese orden, y para una sola entrada no debería ser un problema (opinión mía).
3. **Cambiar a un pulsador con contactos de oro** o a un interruptor de microcarga (Omron D2MV-01 o equivalente), o al antivandálico de la sección 7 en su versión de oro.
4. **Vigilar en campo:** registrar las pulsaciones que no llegan (por ejemplo, el usuario toca el botón y se ve que `is_pressed` no cambia). No hay forma de medir la resistencia de contacto desde la Pi.

## 7. Robustez en un bar

### 7.1 IP, IK y qué se sabe del botón

- **Ni el anuncio ni las fichas de referencia de botones arcade (Adafruit, Sanwa, Seimitsu, kits EG STARTS) dan grado IP ni IK.** Hay que asumir que **no tienen ninguno**. (Fuente: las páginas que abrí; no vi ninguna cifra.)
- Referencias de los códigos, por si buscas otro botón ([IP Code](https://en.wikipedia.org/wiki/IP_Code), norma IEC 60529): IP5X protegido contra polvo, IP6X estanco al polvo; IPX4 salpicaduras desde cualquier dirección, IPX5 chorros de 6,3 mm, IPX6 chorros potentes, IPX7 inmersión (1 m, 30 min); IPX9/IP69K lavado a alta presión y temperatura.
- IK ([IK Code](https://en.wikipedia.org/wiki/IK_code), EN 62262): IK06 = 1 J, IK07 = 2 J (0,5 kg desde 0,4 m), IK08 = 5 J (1,7 kg desde 0,3 m), IK10 = 20 J (5 kg desde 0,4 m).
- Los antivandálicos del mercado se publican con IK07 (Schurter MSM) a IK10 (APEM AV de Ø22). Los botones arcade de plástico que vi no publican ninguno.

### 7.2 Qué puede pasar (opinión mía, sin fuente salvo donde se indica)

| Escenario | Qué hace el botón | Efecto |
|---|---|---|
| Cerveza o refresco derramado en la máquina | El líquido baja por la holgura entre la tapa y el cuerpo hasta el interruptor (los botones arcade no son estancos). Parte del líquido sale por detrás del panel, **hacia el interior de la máquina** | Contactos sucios o pegajosos; fuga entre terminales; goteo hacia la caja, la Pi o el cajón |
| Fuga por líquido entre NO y COM | Resistencia de fuga en paralelo con el contacto | Con pull-up interno, una fuga por debajo de unos 19-24 kΩ se lee como pulsado y por debajo de unos 47-61 kΩ el nivel alto no es seguro (sección 5.2). Con un pull-up externo de 2,2 kΩ el umbral baja a unos 2 kΩ (cálculo mío). No he medido ni encontrado la conductividad de la cerveza |
| Residuo azucarado seco | Película aislante o pegajosa en el émbolo y en los contactos | Botón duro o que se queda pegado; contacto intermitente |
| Golpes con el puño, martilleo | Tapa, cuerpo y rosca de plástico | Tapa rota, cuerpo agrietado, interruptor desplazado. Un contacto roto o a masa es una avería; un atasco puede repetir pruebas (sección 5.4) |
| Humedad ambiente continua | Oxidación de terminales y contactos | Terminales faston con resistencia creciente |

El primer punto afecta a más que al botón: **el agujero de 30 mm del panel es una vía de entrada de líquido a la máquina**. Cualquier botón tendría el mismo problema salvo que lleve junta o que se cubra.

### 7.3 Alternativas robustas con datasheet

Los tres son pulsadores industriales o antivandálicos de la gama de 16-30 mm. Datos de las hojas consultadas.

| | Schurter MSM | APEM AV | Eaton M22S-D-X (RMQ-Titan) |
|---|---|---|---|
| Material | Carcasa y actuador de acero inoxidable ([datasheet](https://mouser.com/datasheet/2/358/schurter_shris05004-1-1758128.pdf) ([copia local](datasheets/schurter_shris05004-1-1758128.pdf))) | Carcasa PBT o poliamida; buje y actuador de acero inoxidable, latón niquelado o cromado, según modelo ([Farnell](https://www.farnell.com/datasheets/1564503.pdf) ([copia local](datasheets/1564503.pdf))) | No consta en la hoja que leí |
| Tamaños / agujero | Ø16, 19, 22 y 30 mm. MSM 22: rosca M22×1 | Ø19,2 mm o Ø22,2 mm en la mayoría; Ø16,2 y Ø24,2 en otros | 22,5 mm |
| Grosor de panel | MSM 22: máx. 5-6 mm según versión ([hoja RS](https://docs.rs-online.com/88f6/0900766b8141c4e2.pdf)) | 1-11 mm (antivandálico y Ø19/22) | no consta |
| IP | **IP67 en la zona de contactos** del lado frontal; el actuador móvil es IP40 al frente | IP65 a IP67 o IP69K según modelo (solo versiones selladas) | IP67 e IP69K, NEMA 4X ([hoja de un distribuidor](https://vdam.kdsi.net/digital_asset_manager/file_download.php?vi=8736462)) |
| IK | IK07 (Ø19, 22, 30); IK06 (Ø16) | IK08 (Ø19) e IK10 (Ø22) en antivandálicos | no consta |
| Contacto | **Oro: 0,1 A / 30 VDC.** Plata: 3-10 A | Plata (4 A / 12 VDC, 500.000 ciclos); algunos modelos con cúpula chapada en oro | no consta |
| Vida | Mecánica 1,5 millones | Mecánica típica 1 millón (hasta 3 millones) | 5 millones en la especificación; el título de la misma hoja da otra cifra (incoherente) |
| Fuerza / recorrido | 4,5 N; 1,0 mm (1,2 mm en el de 30 mm) | no consta | no consta |
| Temperatura | −25 a +85 °C | no consta | no consta |
| Terminales | Clavijas planas, sin medida en la hoja | no consta | no consta |

Notas:

- **La versión de oro (0,1 A / 30 VDC) del Schurter MSM encaja con la carga de bajo nivel.** No encontré en la hoja si existe en IP67 (la hoja lista otras versiones "bajo pedido"). Habría que preguntarlo a Schurter. En la hoja se dice IP67 para el contacto de las versiones indicadas, no del actuador.
- **El MSM de 30 mm podría ir en el mismo agujero de 30 mm** (la hoja dice "mounting diameter 30 mm"). **Sin verificar:** el agujero exacto y la profundidad. Mira el dibujo antes de taladrar.
- **APEM AV**: sus contactos de serie son de plata (4 A / 12 VDC). Para tu carga hay que pedir la variante con oro, y su hoja no da carga mínima.
- **Eaton**: es un componente de panel industrial (cuerpo largo con bloque de contactos aparte). La hoja que leí no da contactos ni carga mínima. Es mucho más grande que un arcade.
- **No he consultado precios.** Son varias veces más caros que 2 € por botón.
- **Seguridad eléctrica (opinión mía):** un pulsador metálico queda en contacto con la chapa puesta a tierra. Es bueno (equipotencial), pero entre los contactos y la carcasa debe haber el aislamiento que exige la norma del producto. La hoja de Schurter da resistencia a sobretensión de 4 kV para algunas versiones. Es un circuito de 3,3 V, pero el interior de la máquina lleva 230 V.
- **Pulsadores metálicos genéricos** que anuncian IP65 en tiendas generalistas: los hay (conocimiento general). No los consulté ni conozco su datasheet.

## 8. ESD y cableado al GPIO

### 8.1 Lo que dicen las fuentes

| Dato | Fuente |
|---|---|
| Los GPIO de la Pi son de 3,3 V, entradas tolerantes a 3,3 V, y los pads se diseñan para 16 mA. En lo que pude leer, la documentación oficial **no da protección ESD ni consejo sobre resistencias en serie** para entradas (sí para LED). Las dos páginas se truncaron en 100.000 caracteres | [Raspberry Pi, hardware](https://www.raspberrypi.com/documentation/hardware/raspberrypi/) y [Raspberry Pi, GPIO](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html) |
| Adafruit avisa de que, con los pines expuestos, la Pi se daña fácilmente por descarga estática o conexiones erróneas. No se debe aplicar a un GPIO menos de 0 V ni más de 5 V. (Adafruit pone el límite en 5 V; la documentación de Raspberry Pi dice que las entradas son tolerantes a 3,3 V, y es la que manda) | [Adafruit](https://learn.adafruit.com/raspberry-pi-care-and-troubleshooting/warning) |
| En el esquema reducido de la Pi 3B+ mi herramienta no vio resistencias, diodos ESD ni filtros en la red de GPIO17. **La extracción no incluye las conexiones de los componentes pasivos**, así que no puedo asegurarlo | [Esquema](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf) |
| Un participante de un foro de element14 dice, de segunda mano, que tocar los GPIO puede colgar la Pi y que las pruebas EMC no lo reprodujeron. Sin fuente primaria | [element14](https://community.element14.com/products/raspberry-pi/f/forum/18853/cases-and-esd-concerns/21157) |
| IEC 61000-4-2: nivel 4 = ±8 kV por contacto y ±15 kV en aire. El generador usa 330 Ω y 150 pF | [Wikipedia](https://en.wikipedia.org/wiki/IEC_61000-4-2), [TI SSZT871](https://edgeworker.ti.com/lit/pdf/sszt871) ([copia local](datasheets/sszt871.pdf)) |
| Modelo de cuerpo humano (HBM): 100 pF y 1,5 kΩ (JEDEC); otra especificación usa 150 pF y 330 Ω | [Wikipedia](https://en.wikipedia.org/wiki/Electrostatic_discharge) |
| Layout recomendado: **diodo TVS junto al conector y resistencia en serie junto al integrado**. La resistencia sola suele bastar para un pin de IC; un TVS sin impedancia en serie es improbable que proteja bien una entrada de alta impedancia. No da valores | [LearnEMC](https://learnemc.com/qotw-230724) |
| Un antirrebote por software no protege contra sobretensión ni ESD. Existen integrados que añaden antirrebote, ±25 V de sobretensión y ±15 kV de ESD (MAX6816/17/18) | [Analog Devices](https://www.analog.com/en/resources/technical-articles/switch-bounce-and-other-dirty-little-secrets.html) |

### 8.2 Mi valoración (opinión)

- **El usuario no toca el cable.** Toca la tapa de plástico del botón. Una descarga de un dedo busca el metal más cercano (el borde de la chapa, que está a tierra por el cable de red), no el interior del botón. El riesgo es el **acoplamiento** a un cable de 50-65 kΩ de impedancia, sobre todo si el cable pasa cerca de la chapa o de la fuente conmutada.
- **Local seco:** la carga estática crece en ambientes secos (conocimiento general; no he consultado una cifra). Hay que esperar descargas fuertes al tocar la máquina.
- **El marcado CE** (la guía §9 cita la directiva EMC) incluye normalmente un ensayo de ESD de la máquina completa. Los niveles los fija la norma de producto, que **no he consultado**. Se suelen usar ±4 kV por contacto y ±8 kV en aire (conocimiento general, sin verificar). Si el botón o su cable fallan en esa prueba, es lo primero que se retoca.
- **Un riesgo de daño directo al pin es bajo** si el cable está dentro de la chapa. Un cuelgue o un falso disparo por acoplamiento es más probable. No tengo datos que cuantifiquen ninguno de los dos.

### 8.3 Circuito mínimo propuesto (opinión y cálculo míos)

Todo en el extremo de la Pi, dentro de un conector o con termorretráctil:

```
                                 3V3 (pin 1)
                                      |
                                [R_up 2,2 kΩ]
                                      |
GPIO17 (pin 11) --[R_s 330 Ω a 1 kΩ]--+------ cable ------ botón ------ cable ------ GND (pin 9)
                                      |
                                 [C 100 nF]
                                      |
                                     GND
```

- **R_s (330 Ω a 1 kΩ)** en serie con el pin: limita la corriente en el pad ante un pico (idea de LearnEMC: resistencia junto al IC). No afecta al nivel lógico porque el pad es de alta impedancia.
- **C de 100 nF** entre el nodo del cable y GND: con el pull-up interno solo (50-65 kΩ) da una constante de tiempo de 5-6,5 ms; con la resistencia externa de 2,2 kΩ, de unos 0,2 ms. Con el interno, el flanco de subida hasta 1,6 V tarda unos 3,3-4,3 ms (cálculo mío: τ · 0,664). Cabe de sobra en los 50 ms de antirrebote.
- **TVS de 3,3 V** (unidireccional o bidireccional, de baja capacidad) entre el nodo del cable y GND, solo si las pruebas muestran falsos disparos. Cuesta céntimos, pero no hay que comprar nada para empezar.
- **Cable:** par trenzado GPIO17 + GND, corto, lejos de la fuente LRS y de los 230 V. Si la caja interior está suspendida, deja holgura (la guía §4 ya lo hace con los pasacables).
- **La guía v2 retiró el filtro del pulsador** (cambios de la v2). No es una discrepancia, es una decisión: con el cable dentro de la chapa y el botón de plástico puede bastar. Mi recomendación es dejar prevista la resistencia en serie y el condensador (cuestan céntimos) y quitarlos solo si las pruebas de ESD y de ruido salen bien.

## 9. Montaje mecánico

### 9.1 Lo que se sabe y lo que no

- **Agujero:** 30 mm en la guía y en los botones de referencia. Para este ASIN no está publicado. Un EG STARTS tipo Happ pide 28 mm ([Desertcart](https://www.desertcart.lk/products/239728143)). **No taladres hasta tener el botón en la mano.**
- **Cabeza de 33 mm (guía):** coincide con el Adafruit (dimensiones generales 33,2 × 31,7 mm según [Pihut](https://thepihut.com/products/arcade-button-with-led-30mm-translucent-green)) y con el Seimitsu (Ø34,5 mm). No es un dato del EG STARTS.
- **Grosor de la chapa:** **la guía no lo dice.** El "marco de 2,6 mm" de la guía (§0 y §2.5) es el ancho de acero que queda encima del borde del Solo: (83,16 − 78) / 2 = 2,58 mm, deducción mía. Hay que medir la chapa con calibre. Un botón de rosca admite hasta unos 20 mm (Adafruit, [Electrokit](https://www.electrokit.com/en/tryckknapp-arkad-30mm-led-rod)); uno a presión, hasta 3,7 mm (Sanwa, Arcadexpress). Una chapa de unos 2-3 mm entra en los dos casos. **No encontré el grosor mínimo** de un botón de rosca.
- **Anti-giro y muescas:** el botón de Adafruit se enrosca y "no cubre el agujero" si no es redondo y limpio. Para el EG STARTS no consta si hay muesca, pestaña o perno de alineación. Una reseña de otro EG STARTS (6X) cita que la versión blanca no tenía pasadores de alineación ([Desertcart](https://www.desertcart.nl/products/130489326)).
- **Longitud total:** sin datos para este ASIN. Referencias: Seimitsu 32,5 mm de profundidad de instalación; Adafruit 473 necesita 38 mm (32 mm con contactos doblados). Con la caja de arriba de 86 mm de alto (guía §4) hay sitio; falta comprobar lo que hay detrás del agujero.

### 9.2 Montaje con la rosca de plástico (opinión mía; sin fuente)

1. Haz el agujero redondo, sin rebabas, y repásalo. Los bordes de chapa cortan el plástico del cuerpo.
2. Aprieta la tuerca a mano más un cuarto de vuelta. Las roscas de plástico se desprenden o se agrietan con una llave.
3. Prueba a girar el cuerpo con la tuerca puesta. Si gira, el cuerpo y los terminales se mueven con cada pulsación.
4. Si la tuerca se afloja con las vibraciones, usa fijador de roscas suave (que no ataque al plástico: pruébalo antes) o una arandela.
5. Deja los terminales del LED aislados (termorretráctil o capuchón) para que no toquen la chapa ni otros cables.

### 9.3 Terminales y cable

- Mide el ancho de las lengüetas con calibre: **2,8 mm o 4,8 mm**. El kit B0B4H54KPS trae los dos.
- La guía propone "faston de 2,8 mm en el pulsador y Dupont hembra en la Pi" en el mismo hilo. **Sin fuente consultada (conocimiento general), compruébalo:** los faston aislados suelen crimparse sobre 0,5-1,5 mm² y los hilos Dupont de fábrica son mucho más finos. Un crimpado flojo es un fallo típico. Mira el rango del faston en el kit y el calibre del hilo Dupont, y si hace falta usa un hilo de mayor sección con la hembra Dupont engastada o soldada.
- Pruebas: tirar de cada terminal (pull test) y medir resistencia del hilo + conexión.

## 10. Fallos, bugs y problemas conocidos

No he encontrado reseñas técnicas ni pruebas independientes de este ASIN. Lo que sigue sale de otros productos EG STARTS, de botones arcade genéricos y de la literatura. La gravedad es para este proyecto.

| # | Problema | Gravedad |
|---|---|---|
| 10.1 | Contacto intermitente por carga mínima (circuito seco) | Media |
| 10.2 | Líquidos: fuga, pegajosidad y entrada en la máquina | Alta en un bar |
| 10.3 | Golpes y vandalismo | Media-alta |
| 10.4 | Cifra de vida (1.000.000) sin método y datos contradictorios dentro de la marca | Baja |
| 10.5 | Interruptor de tipo y calidad desconocidos (¿de teclado?) | Media |
| 10.6 | Terminal de 2,8 o 4,8 mm; 2 o 3 terminales | Baja (se ve al recibirlo) |
| 10.7 | LED de 5 V o 12 V; LED cerca de los terminales del interruptor | Baja |
| 10.8 | Variación entre colores y lotes | Baja |
| 10.9 | Terminales o crimpados flojos | Media |
| 10.10 | Desgaste del émbolo / holgura | Baja |
| 10.11 | ESD y ruido en el cable | Media-baja |
| 10.12 | Carcasa o rosca de plástico que se parte | Baja-media |

**10.1 Contacto de bajo nivel.** Ver [sección 6](#6-corriente-baja-el-contacto-y-la-carga-mínima).

**10.2 Líquidos.** Ver [sección 7](#7-robustez-en-un-bar). Sin cifras publicadas del botón. Mis cálculos de fuga están en la sección 5.2.

**10.3 Golpes.** Sin IK publicado para el botón. Los antivandálicos de referencia son IK07 (Schurter MSM) a IK10 (APEM AV Ø22).

**10.4 Cifra de vida.** El mismo texto de venta ("tested to 1,000,000 cycles") se repite en varios EG STARTS ([Carrefour](https://www.carrefouruae.com/mafuae/en/starter/eg-starts-arcade-buttons-1-player-diy-kit-joystick-5v-led-arcade-button-for-arcade-stick-pc-games-mame-raspberry-pi/p/3233001890912), [Desertcart](https://www.desertcart.nl/products/130489326)). Otro anuncio de la misma marca dice "up to 10 million presses" ([Newegg](https://www.newegg.com/p/2A4-00D0-00033)). El Sanwa SW-68 da 1 millón a 5 VDC 10 mA según Paradise Arcade, y 300.000 de vida eléctrica según Arcadexpress. Ninguna cifra es de un ensayo publicado. Con 100 pruebas al día, 1.000.000 son 27 años (cálculo mío): no importa.

**10.5 Interruptor desconocido.** Un reseñador de Desertcart dice que los botones del kit EG STARTS llevan **interruptores mecánicos de teclado soldados** ([Desertcart](https://www.desertcart.pl/products/38404680)), y Newegg habla de "built-in blue switch" ([Newegg](https://www.newegg.com/p/2A4-00D0-00033)). Es del kit, no de este ASIN. **Si este ASIN usa un interruptor de teclado (Kailh, Cherry o clon):** suelen tener contacto de oro y están pensados para cargas bajas, lo que ayuda a la sección 6 (afirmación general, sin fuente consultada), pero su soldadura a una placa del LED es una fuente de fallos mecánicos. Se descubre al recibirlo.

**10.6 Terminales y número de contactos.** Ver [5.1](#51-lo-que-dice-la-guía-y-lo-que-he-comprobado) y [9.3](#93-terminales-y-cable).

**10.7 LED.** El título de Amazon.com/.ca dice 5 V. Otros EG STARTS son de 12 V ([Shopabunda](https://www.shopabunda.com/products/eg-starts-5x-arcade-buttons-triangle-led-illuminated-push-button-switch-for-arcade-coin-machine-operated-games), [Desertcart](https://www.desertcart.pl/products/40385726)). La guía dice que el LED no se conecta, y está bien. Sobre el riesgo de alimentarlo con 5 V por error:
- **Para el LED:** si es de 5 V, es su tensión de diseño. Si resultase ser de 12 V, a 5 V luciría poco sin dañarse (conocimiento general, sin fuente). Lo contrario (LED de 5 V a 12 V) lo quema. Comprueba la tensión impresa o mide (sección 11).
- **Para la Pi, que es el riesgo serio:** si el LED comparte una pata con el interruptor (un kit EG STARTS habla de "3-pin wiring for switch and LED", [Newegg](https://www.newegg.com/p/2A4-00D0-00033)), alimentar el LED con 5 V podría llevar 5 V a GPIO17, que es de 3,3 V ([Raspberry Pi](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html)). No ocurre si el LED no se conecta. Se comprueba con el polímetro (sección 11, punto 4).
- **Referencia Adafruit:** su LED tiene dos diodos en serie con 200 Ω; a 3,3 V los rojo y amarillo no encienden. Con el EG STARTS no se ha probado.

**10.8 Variación entre colores.** Un reseñador del EG STARTS 6X (rectangular) dice que la versión blanca difiere de las demás: sin pasadores de alineación, el soporte del interruptor y LED no encaja con otros colores, y la tuerca es blanca en lugar de negra ([Desertcart](https://www.desertcart.nl/products/130489326)). En un pack con cinco colores, compara los cinco entre sí (tuerca, soporte del interruptor, fuerza) y monta el que mejor encaje.

**10.9 Terminales y crimpados.** En un hilo de 2004 sobre botones Happ, un usuario arregló un botón que daba doble pulsación apretando el conector rápido ([Arcade Controls](https://forum.arcadecontrols.com/index.php/topic,21662.0.html)). Otros usuarios del hilo "Quicks or soldering" ven los conectores rápidos más fáciles de reparar que la soldadura, y discrepan de que se oxiden ([Arcade Controls](https://forum.arcadecontrols.com/index.php/topic,16540.0.html)). Con una puerta que se abre y cierra, un faston flojo es previsible (opinión mía).

**10.10 Desgaste del émbolo.** En ese mismo hilo, un usuario dice que los microinterruptores Happ de montaje vertical se desgastan en el actuador, y que girar el botón 90° o usar uno horizontal lo mejora ([Arcade Controls](https://forum.arcadecontrols.com/index.php/topic,21662.0.html)). Es de botones Happ, no necesariamente aplicable.

**10.11 ESD y ruido.** Ver [sección 8](#8-esd-y-cableado-al-gpio).

**10.12 Rosca o carcasa.** Sin fuente específica. El riesgo de grietas por apretar de más una tuerca de plástico es de conocimiento general; ver 9.2.

## 11. Qué comprobar al recibirlo

Con los **cinco** botones y un polímetro. Anota los resultados y la foto del interruptor (marca impresa).

1. **Contenido:** 5 botones, colores, tuercas, bolsa. Guarda la caja y el lote.
2. **Fabricante del interruptor:** foto de cerca del cuerpo del interruptor. Anota cualquier referencia (Omron, Kailh, Cherry, Sanwa, "SW-68"…).
3. **Terminales:** cuenta y mide el ancho con calibre (2,8 o 4,8 mm). Identifica cuáles son del interruptor (pulsa y mide continuidad) y cuáles del LED.
4. **Aislamiento LED / interruptor:** con el botón suelto y pulsado, mide continuidad entre **cada terminal del LED y cada terminal del interruptor**. Tiene que ser circuito abierto. Si hay continuidad, el LED comparte una pata con el interruptor y no hay que alimentar el LED nunca.
5. **LED:** busca la tensión impresa en la placa del LED. Para saber si enciende, alimenta **solo uno de los cinco**, con fuente de laboratorio limitada a 10 mA y empezando en 3 V, y apunta la tensión a la que luce.
6. **Estado del contacto:** abierto sin pulsar (sin lectura en el rango más alto), cerrado al pulsar (unas décimas de ohmio con las puntas incluidas; un polímetro normal no mide mΩ). Repite 50 veces por botón, pulsando también en el borde de la tapa y despacio, y busca lecturas intermitentes.
7. **Rebote:** si dispones de osciloscopio, mira el flanco; si no, prueba con `gpiozero` y `bounce_time` pequeño (por ejemplo, 5 ms) y cuenta eventos por pulsación.
8. **Tacto:** misma sensación entre los cinco, clic, recorrido. Anota el que se salga.
9. **Mecánica:** sacude cada botón y escucha si el interruptor está suelto. Tira de la tapa para ver si sale. Mira grietas en el cuerpo, la rosca y la tuerca.
10. **Panel de prueba con tu chapa real:** haz el agujero en un trozo de la misma chapa y monta uno. Mide el grosor de la chapa con calibre. Comprueba que la tuerca engancha y que el cuerpo no gira.
11. **Prueba de líquido en un repuesto (no en el que vaya a la máquina):** moja el botón montado con agua con azúcar y sal, déjalo secar y mide la resistencia entre terminales mojado y seco. Es el número que falta en la sección 7. Comprueba después si el émbolo se pega.
12. **Guarda los otros cuatro como repuestos** y haz la misma batería a cada uno antes de dar por buena la tanda. Una segunda caja (10,88 €) como repuesto de la flota es barata.

## 12. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Para pruebas y primeras máquinas:** el EG STARTS vale (2 € por unidad). Hay que pasar la batería de la sección 11 y no perder de vista que no es un producto con ficha.
2. **Añade desde el principio la resistencia pull-up externa de 1-4,7 kΩ** (por ejemplo, 2,2 kΩ del pin 1 al pin 11). Resuelve a la vez el contacto de bajo nivel, la inmunidad a fugas y parte del ruido. Es el cambio con mejor relación coste-beneficio de esta ficha.
3. **Prevé una resistencia en serie de 330 Ω-1 kΩ y 100 nF** en el extremo de la Pi (sección 8.3) y decide tras las pruebas de ESD.
4. **Protege el agujero de 30 mm del panel** de líquidos (junta, goma, o pantalla que desvíe) y colócalo donde el derrame no caiga encima. Un botón estanco no basta si el agua entra por la tuerca.
5. **Para máquinas que vayan a un bar de verdad,** valora un pulsador antivandálico con contacto de oro (Schurter MSM de oro o equivalente) y estanco en la zona de contactos. Pregunta a Schurter por la versión IP67 de 0,1 A / 30 VDC y por el agujero exacto del de 30 mm. No he consultado precios.
6. **Software defensivo** (sección 5.4): inicio de prueba solo con cobro confirmado, ignorar pulsaciones durante la prueba, detectar atasco y registrarlo.
7. **Registra qué interruptor lleva** cada lote y la fecha, para poder reponer iguales. Si el lote cambia de interruptor sin avisar, la sección 6 puede cambiar.
8. **Elige el color por convención:** verde para "iniciar" es lo habitual en la normativa de pulsadores industriales (IEC 60073 / EN 60204-1; **no he consultado la norma**, solo lo recuerdo). No es obligatorio para este producto.
9. **Repuestos:** deja dos botones, un faston de cada ancho y un trozo de hilo en la máquina o en el kit de servicio. El cambio de un botón es una intervención de minutos.
10. **Seguridad eléctrica:** el circuito del pulsador es de 3,3 V. El peligro está en el 230 V de la misma caja. Mantén el cableado del botón separado del de red y de la fuente conmutada. Si usas un pulsador metálico, verifica el aislamiento entre sus contactos y la chapa.

## 13. Discrepancias con la guía de montaje

| # | Guía | Hallazgo |
|---|---|---|
| 1 | §2.8 "Agujero de 30 mm y cabeza de 33 mm" | Coinciden con las del botón de **Adafruit** (la referencia que cita la guía; no pude abrir su guía), no con datos del EG STARTS. Un EG STARTS tipo Happ pide 28 mm. Medir al recibir |
| 2 | §2.8 "1.000.000 de pulsaciones según el anuncio" | No verificable. El texto de otros EG STARTS repite la cifra; un kit dice 10 millones; ninguna indica método. No es el factor limitante |
| 3 | §2.8 y §5.3 "NO … COM … NC y el LED no se conectan" | Supone un SPDT. Muchos botones de 30 mm tienen dos terminales (NO/COM). Comprobarlo |
| 4 | §2.8 y §5.3 "faston de 2,8 mm" | No confirmado para este botón; el tipo Happ usa 4,8 mm. El kit de faston B0B4H54KPS cubre los dos |
| 5 | §2.8 "La Pi pone su resistencia interna" | Correcto. 50-65 kΩ según la documentación de Raspberry Pi. **No he podido leer el capítulo de GPIO del PDF de Broadcom** (BCM2835 ARM Peripherals), así que no confirmo que esa cifra esté en ese documento |
| 6 | §0 y §2.5 "marco de acero de 2,6 mm" | Es un ancho de solape, no un grosor de chapa: (83,16 − 78) / 2 = 2,58 mm (deducción mía). La guía no da el grosor de la chapa, que es el dato que importa para el botón |
| 7 | §5.3 "Dupont hembra en la Pi · faston 2,8 mm en el pulsador" | Un solo hilo no suele cubrir los dos extremos (calibres distintos). Ver 9.3 (sin fuente consultada) |
| 8 | v2 "fuera el filtro del pulsador" | No es una discrepancia: es una decisión. Mi propuesta de la sección 8.3 es dejar la resistencia y el condensador previstos |
| 9 | §1 fila 11 "su LED no se conecta" | Correcto. El título de Amazon.com/.ca dice LED de 5 V; otros EG STARTS son de 12 V. Falta saber si el LED comparte pata con el interruptor |

## 14. Lo que no he podido verificar

- **El anuncio de Amazon.es** (variante, contenido, fotos, reseñas): Amazon bloquea el acceso. Solo vi títulos de .com y .ca.
- **Marca y características del interruptor interior**, y si el contacto es de oro.
- **Cotas reales** (agujero, cabeza, longitud, grosor de panel, muescas), **terminales**, fuerza y recorrido del EG STARTS.
- **El capítulo de GPIO del PDF de Broadcom** (BCM2835 ARM Peripherals): mi herramienta solo leyó hasta la página 53 del documento.
- **La FAQ original de Omron** sobre microcarga y contactos de oro: redirige a un dominio bloqueado. Usé la copia de Digi-Key.
- **Documentos que mi herramienta no pudo abrir (bloqueados o con error):** guía de botones arcade de Adafruit (`learn.adafruit.com/arcade-buttons`), ficha de Adafruit 473, página de gpiozero en Read the Docs, Ganssle sobre antirrebote, circuit.rocks, la página Pihut del botón transparente, alldatasheet (D2F de Omron) y el blog de mbedded.ninja (solo devolvió el menú). eLinux devolvió una página de acceso denegado (Anubis) y no la rodeé.
- **Esquemático de la Pi 3B+:** no pude confirmar si hay protección en la red de GPIO17.
- **Semántica del antirrebote** de gpiozero con un toque más corto que `bounce_time` en cada backend.
- **Conductividad de la cerveza** y resistencia de fuga real en el botón.
- **Informes de campo de este botón** (reseñas, fallos en uso continuo): no los encontré.
- **IP, IK y precio de los antivandálicos** en las versiones concretas para este proyecto; si el Schurter MSM de oro existe en IP67; el agujero exacto del MSM de 30 mm.
- **Búsquedas pendientes por agotarse el presupuesto de búsqueda:** experiencia de operadores de arcade con derrames, botones arcade estancos (IP65) y otros antivandálicos disponibles en Amazon.es. Si quieres que las busque, mándame otra petición.
- **Convenio de color (IEC 60073 / EN 60204-1)** y la norma de producto aplicable al ESD de la máquina: no consultadas.

## 15. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos) y carpeta [`datasheets/`](datasheets/).

Todos los enlaces, ordenados por tipo y con nota de los que no pude abrir, en [`enlaces.md`](enlaces.md).
