# MONTAJE GENERAL

Cómo se conecta cada componente de la máquina con los demás: de qué puerto, borne o pin sale cada cable y adónde llega. Es el cableado de la guía de montaje eléctrico (v2, 20-10-2026) corregido con lo que han dejado las 31 fichas de [`componentes/`](componentes/README.md) y los documentos que descargaste.

**Estado a 21-10-2026: es un esquema de papel. Nada se ha montado ni medido todavía.** Hoy he leído los anuncios de Amazon.es de diez piezas ([resumen](montaje-general/anuncios-amazon-21-10-2026.md)). Cierran los tornillos del borne USB-A, los terminales del pulsador, los puertos de la pantalla y la posición del USB-C del Solo, y desmienten dos supuestos de la guía: el pulsador no tiene NO/COM/NC, y el esquema interno del C14 no se puede sacar del anuncio. Lo que sigue sin confirmar lleva ⚠ y está reunido en el apartado 5. Dos de esas dudas pueden cambiar el cableado: el esquema interno del módulo C14 y el tipo de conector del ZE29A.

**Hay dos documentos de diseño de la máquina y este sigue el más antiguo.** El cableado y la colocación de abajo siguen la guía de cableado y `decisiones-diseno.md` (19 y 20 de octubre). El Project tiene además `diseno-cajon-A.md`, fechado el 21-10-2026, que cambia las medidas, quita el pulsador y añade un portafusibles por rama. Está explicado en el apartado 6.3. Hasta que digas cuál manda, lo que cambia lleva la marca «diseño A».

**La parte de 230 V y la tierra:** si no tienes experiencia con red eléctrica, que un electricista la revise antes de enchufar.

Números entre paréntesis, como (#14), son los de la lista de componentes. Los bornes de la fuente y los pines del ZE29A están comprobados con la copia local de sus hojas de datos (LRS-50 y manual V1.1). Los pines del GPIO llevan el número físico del conector de 40 pines.

## Los cuatro esquemas

**Figura 1. Alimentación (230 V → 5 V) y tierra.** Cada borne de la fuente, cada polo de las WAGO y cada destino.

[![Figura 1: alimentación y tierra](montaje-general/1-alimentacion-y-tierra.svg)](montaje-general/1-alimentacion-y-tierra.png)

**Figura 2. Puertos de la Raspberry Pi y señales.** Qué sale de cada puerto de la Pi y adónde va, y cómo se hablan la Pi y el SumUp Solo (sin cable).

[![Figura 2: puertos de la Pi y señales](montaje-general/2-pi-puertos-y-senales.svg)](montaje-general/2-pi-puertos-y-senales.png)

**Figura 3. Conector GPIO de 40 pines.** Los cuatro pines que se usan (8, 9, 10 y 11) y los errores que estropean la Pi o el sensor.

[![Figura 3: conector GPIO](montaje-general/3-gpio-40-pines.svg)](montaje-general/3-gpio-40-pines.png)

**Figura 4. Dónde está cada pieza.** Alzado de la máquina con las alturas decididas, qué cruza el separador y lo que ningún documento ha decidido todavía.

[![Figura 4: dónde está cada pieza](montaje-general/4-donde-va-cada-pieza.svg)](montaje-general/4-donde-va-cada-pieza.png)

Cada figura está en SVG (el que se ve arriba) y en PNG (pincha en la imagen) dentro de [`montaje-general/`](montaje-general/).

## 1. Resumen

- **230 V:** toma de pared → cordón Schuko-C13 (#17) → módulo C14 (#15) con fusible T2,5A (#16) e interruptor → fuente Mean Well LRS-50-5 (#14), bornes 1 (AC/L) y 2 (AC/N).
- **Tierra:** el pin de tierra del C14 va a un espárrago M4 soldado al cuerpo (#25). Del espárrago salen los cables de tierra a la fuente (borne 3, FG), al panel frontal, a la caja interior y al cajón.
- **5 V:** la fuente, ajustada a 5,20 V, da +V (borne 5) y −V (borne 4) a dos regletas WAGO 221-415 (#20), una de +5 V y otra de GND. Cada regleta tiene cinco polos: el 1 es el troncal y los polos 2 a 5 son las cuatro cargas.
- **Las cuatro cargas de 5 V:** Raspberry Pi (puerto micro-USB), SumUp Solo (borne USB-A nº 1 y cable a su USB-C), pantalla (borne USB-A nº 2 y cable a su USB-C) y sensor ZE29A (pines 1 y 2).
- **Señales de la Pi:** UART con el ZE29A por los pines 8 y 10, pulsador por los pines 9 y 11, HDMI a la pantalla, CSI a la cámara y un USB al adaptador Wi-Fi AR9271.
- **La Pi no alimenta nada.** El adaptador AR9271 es lo único que cuelga de un USB de la Pi.
- **Pi y Solo no tienen cable entre sí.** La Pi manda cobrar por Internet (Cloud API de SumUp) y los dos van por Wi-Fi de 2,4 GHz al router del bar.

## 2. Lista de conexiones, cable a cable

### A. Entrada de red y tierra (figura 1)

| N.º | De | A | Cable y terminales | Nota |
|---|---|---|---|---|
| W1 | Toma de pared (Schuko) | Módulo C14 (#15), entrada | Cordón Schuko → C13 de 2 m (#17) | El C13 se enchufa en el C14. El módulo tiene que ir bien fijado a la chapa: el tirón del cable lo aguanta la fijación (ficha #15, §6.4) |
| W2 | C14, pestaña de la fase (la que sale del portafusibles con el T2,5A) | Interruptor, contacto A | Marrón 1,5 mm², faston hembra aislado (#27) | ⚠ Qué pestaña es la de la fase y qué faston es el A: se mide con el módulo suelto (apartado 4, punto 1) |
| W3 | C14, pestaña del neutro | Interruptor, contacto C (solo en el caso 1) | Azul 1,5 mm², faston hembra aislado | ⚠ En el caso 2 no existe: el neutro va directo a W5 |
| W4 | Interruptor, contacto B (el que cierra con A) | LRS-50-5, borne 1 (AC/L) | Marrón 1,5 mm². Faston en el módulo, puntera (#28) en la fuente | |
| W5 | Interruptor, contacto D (caso 1) o pestaña del neutro del C14 (caso 2) | LRS-50-5, borne 2 (AC/N) | Azul 1,5 mm². Faston en el módulo, puntera en la fuente | |
| W6 | C14, contacto de tierra (PE) | Espárrago M4 × 20 (#25), 1ª tuerca | Verde-amarillo. Faston en el C14, ojal M4 (#23) con arandela dentada (#24) en el espárrago | ⚠ Sección: 1,5 mm² (guía) o 2,5 mm² (ITC-BT-19 §2.3). Más largo que L y N. Sin fusible ni interruptor en la tierra |
| W7 | Espárrago, 2ª tuerca | LRS-50-5, borne 3 (FG) | Verde-amarillo, ojal M4 / puntera | |
| W8 | Espárrago, 2ª tuerca | Panel frontal, si va atornillado | Verde-amarillo, ojal M4 en los dos extremos | |
| W9 | Espárrago, 2ª tuerca | Caja interior (la suspendida) | Verde-amarillo flexible, con holgura, ojal M4 | Los muelles no valen como tierra |
| W10 | Espárrago, 2ª tuerca | Cajón | Verde-amarillo flexible, con holgura, ojal M4 | |

**Los dos casos del interruptor del C14.** El anuncio dice que es un basculante con luz roja de 4 pines, pero no dice si corta uno o dos polos, y sus dos dibujos de cableado no coinciden entre sí ([anuncios](montaje-general/anuncios-amazon-21-10-2026.md)). Dos reseñas con compra verificada dicen que el dibujo del vendedor está mal: el interruptor corta, pero la luz no se apaga.

- **Caso 1, dos polos:** dos pares de contactos independientes (A–B y C–D) y la luz en otros terminales. Es lo que dio por hecho la guía. Se cablea como W2 a W5.
- **Caso 2, un polo con luz:** un solo par de contactos (A–B) y dos terminales de lámpara. Es lo que sugieren las reseñas, que hablan de un puente para la luz; no está confirmado. El neutro del C14 va directo a la fuente (W5), W3 no existe, y la lámpara va entre el neutro y el contacto B, es decir, después del interruptor, para que se apague con él. El dibujo del vendedor la conecta antes y por eso queda siempre encendida.
- **Con un solo polo hay un problema de seguridad:** el enchufe Schuko entra de las dos maneras, así que el fusible y el interruptor pueden quedar en el neutro y no en la fase. Si el módulo resulta de un polo, la decisión es sustituirlo por uno bipolar con esquema documentado o aceptar ese riesgo (ficha #15, §4 y §5).

Techo, separador y bandeja ya tienen tierra por estar soldados al cuerpo. En el espárrago el orden es: chapa, arandela dentada, ojal del PE del C14, tuerca y contratuerca; encima, otra arandela dentada, los ojales de los cables internos y otra tuerca.

### B. Raíl de 5 V (figura 1)

| N.º | De | A | Cable y terminales | Nota |
|---|---|---|---|---|
| W11 | LRS-50-5, borne 5 (DC +V) | WAGO «+5 V», polo 1 | Rojo 0,75 mm² (#21), puntera (#28) | ⚠ Sin fusible ni PTC por rama: la fuente limita entre 10,6 y 14,4 A y el cable está dado para 6 A |
| W12 | LRS-50-5, borne 4 (DC −V) | WAGO «GND», polo 1 | Negro 0,75 mm², puntera | El −V flota respecto a tierra. ⚠ Decidir si se une a tierra y en qué único punto |
| W13 | Polo 2 de las dos WAGO | Raspberry Pi, puerto micro-USB | Latiguillo micro-USB 22 AWG, ≤ 15 cm (#19): rojo → VBUS (pin 1), negro → GND (pin 5) | El anuncio dice que son 6 cables de 30 cm, uno rojo y uno negro, sin datos, pero no dice cuál va a VBUS. ⚠ Rojo = VBUS es la convención: medir polaridad y calibre antes de cortar |
| W14 | Polo 3 de las dos WAGO | Borne USB-A nº 1 (#18), tornillos «+» y «−» | Rojo y negro 0,75 mm², puntera (el borne admite AWG 28 a 16). D+ y D− unidos con un hilo corto; S (malla) sin conectar | Los cinco tornillos van rotulados S, +, D−, D+ y − (anuncio, texto y foto). ⚠ El puente D+/D− no está probado con el Solo. ⚠ Un USB-A suele ir para 1 a 1,5 A y el pico estimado del Solo es de 2 A |
| W15 | Borne USB-A nº 1 (conector hembra) | SumUp Solo (#9), USB-C del canto de abajo | Cable USB-A → USB-C acodado 90°, 30 cm (#10) | USB-C en el canto de abajo: se ve en una foto del anuncio (no es una medida). El cable que trae el Solo es C–C y no entra en el borne; la base de carga no se usa. ⚠ El anuncio del cable da 5 V y 3,1 A y 480 Mbit/s, pero no dice qué punta es la acodada ni la resistencia de 56 kΩ en el pin CC; el conector tiene que caber en la ranura de 14 × 9 mm del separador |
| W16 | Polo 4 de las dos WAGO | Borne USB-A nº 2 (#18), tornillos «+» y «−» | Igual que W14 | ⚠ Igual que W14. La pantalla tira de unos 0,5 A, así que aquí no hay problema de corriente |
| W17 | Borne USB-A nº 2 (conector hembra) | Pantalla (#5), USB-C «Power IN» | Cable «USB a USB-C» del paquete de la pantalla | La pantalla tiene un solo USB-C, junto al HDMI y al selector de la retroiluminación, en el mismo canto. ⚠ El anuncio no escribe «A»: lo normal es A → C y hay que comprobarlo al recibirlo, porque un C → C no entra en el borne. ⚠ Una reseña dice que el contacto de alimentación falla con un roce: sujetar el cable. No conectar el cable USB Pi–pantalla de la wiki de 52Pi |
| W18 | Polo 5 de las dos WAGO | ZE29A (#6), pin 1 (5 V) y pin 2 (GND) | Dos hilos de la clavija de 4 pines, 150 mm, 22 AWG (#7) | El J1 del módulo es un conector blanco de 4 vías con la serigrafía «Rx Tx GND 5V» (fotos del anuncio): el pin 1 del manual es el extremo «5V». Los hilos vienen amarillo, blanco, rojo y negro, y el anuncio no dice qué color va en cada posición: se mira en la clavija y se cablea por posición, no por color. ⚠ Tipo y paso del conector sin confirmar (la carcasa mide unos 11 a 12 mm en la foto, lo que apunta a JST-XH de 12,4 mm pero no lo prueba) |

### C. Señales y datos de la Pi (figuras 2 y 3)

| N.º | De | A | Cable y terminales | Nota |
|---|---|---|---|---|
| W19 | Pi, pin 8 (GPIO14, TXD) | ZE29A, pin 4 (RX) | Hilo de la clavija con Dupont hembra (#29) en la Pi | UART 9600 baudios, 8N1, 3,3 V. TX va a RX |
| W20 | ZE29A, pin 3 (TX) | Pi, pin 10 (GPIO15, RXD) | Igual | La serigrafía del J1 cuadra con el manual. ⚠ Comprobarlo en la placa recibida antes de dar tensión |
| W21 | Pulsador (#11), faston A del microinterruptor | Pi, pin 11 (GPIO17) | Faston hembra 2,8 mm (#27) en el pulsador, Dupont hembra en la Pi | La Pi pone el pull-up (`gpiozero.Button(17)`) |
| W22 | Pulsador, faston B del microinterruptor | Pi, pin 9 (GND) | Igual | A y B son intercambiables. El pulsador tiene 4 faston de 2,8 mm: 2 del microinterruptor (los dos que van juntos en un extremo del cuerpo gris, en la foto del anuncio) y 2 del LED, que no se conectan. ⚠ Ningún terminal va rotulado: con el polímetro en continuidad, el par que cierra al pulsar es el del interruptor |
| W23 | Pi, HDMI | Pantalla, entrada HDMI | Cable HDMI que trae la pantalla | Tamaño completo en los dos extremos |
| W24 | Pi, conector CSI «CAMERA» | Camera Module 3 (#3), conector J1 | Cable FFC de 15 pines, paso 1,0 mm, 50 cm (#4) | El anuncio es un pack de tres cables (50, 100 y 200 cm). ⚠ No dice si los contactos están en la misma cara o en caras opuestas: hace falta «caras opuestas». Lado de la Pi: contactos hacia el conector HDMI. Lado de la cámara: hacia su placa. Con la Pi apagada |
| W25 | Pi, un puerto USB 2.0 (cualquiera de los 4) | Adaptador Wi-Fi AR9271 (#12) | El propio adaptador | |
| W26 | AR9271, conector RP-SMA | Antena en el techo | Alargo RP-SMA de 30 cm (#13) hasta el jack de panel (taladro de Ø6,5 mm); la antena se enrosca fuera | ⚠ Macho y hembra del alargo, a comprobar al recibirlo. El jack toca el techo (tierra) y une la malla a tierra (ficha #13, §4.5) |
| W27 | Pi, ranura microSD | SanDisk High Endurance 32 GB (#2) | — | |
| W28 | Boquilla del panel | ZE29A, toma de aire | Tubo de silicona de 6 mm (#8) | Es un tubo, no un cable. ⚠ Opción A/B de la boquilla y barrera interior pendientes |

### D. Sin cable

| N.º | De | A | Cómo | Nota |
|---|---|---|---|---|
| W29 | Pi (por el AR9271) | SumUp Solo | Internet: Pi y Solo se conectan por Wi-Fi de 2,4 GHz al router del bar. La Pi crea el cobro con `POST /readers/{id}/checkout` y consulta el resultado con `GET /readers/{id}/checkout/{id}` | Sin conexión no se puede cobrar. Plan B: router 4G |

## 3. Los 31 componentes: dónde se conecta cada uno

| # | Componente | Dónde se conecta | Comprar (Amazon.es) |
|---|---|---|---|
| 1 | [Raspberry Pi 3B+](componentes/raspberry-pi-3b-plus/README.md) | micro-USB (W13), HDMI (W23), CSI (W24), USB (W25), pines 8 a 11 (W19 a W22) y microSD (W27) | [B0BNJPL4MW](https://www.amazon.es/dp/B0BNJPL4MW) |
| 2 | [SanDisk High Endurance](componentes/sandisk-high-endurance-32gb/README.md) | Ranura microSD de la Pi (W27) | [B07P14QHB7](https://www.amazon.es/dp/B07P14QHB7) |
| 3 | [Camera Module 3](componentes/raspberry-pi-camera-module-3/README.md) | Conector J1 → FFC → CSI de la Pi (W24). El objetivo asoma por el agujero de Ø10 del panel | [B0BRY6MVXL](https://www.amazon.es/dp/B0BRY6MVXL) |
| 4 | [Cable FFC 50 cm](componentes/cable-ffc-camara-50cm/README.md) | Entre el J1 de la cámara y el CSI de la Pi (W24) | [B07DKB4M1H](https://www.amazon.es/dp/B07DKB4M1H) |
| 5 | [Pantalla 7"](componentes/pantalla-geeekpi-7-hdmi/README.md) | HDMI desde la Pi (W23) y USB-C «Power IN» desde el borne nº 2 (W17) | [B0CHMBCCJB](https://www.amazon.es/dp/B0CHMBCCJB) |
| 6 | [ZE29A](componentes/winsen-ze29a/README.md) | Pines 1 y 2 a las WAGO (W18), pin 4 a Pi 8 y pin 3 a Pi 10 (W19, W20), toma de aire al tubo (W28) | [B0H8NVXVG5](https://www.amazon.es/dp/B0H8NVXVG5) |
| 7 | [Cables JST-XH](componentes/cables-jst-xh-4-pin/README.md) | La clavija de 4 pines del ZE29A: llevan los hilos W18 a W20. Vienen 25 clavijas con hilo y 25 conectores sin hilo | [B0CBWZNP6Z](https://www.amazon.es/dp/B0CBWZNP6Z) |
| 8 | [Tubo de silicona](componentes/tubo-silicona-6mm/README.md) | Boquilla del panel → toma de aire del ZE29A (W28) | [B0D9FJY1SG](https://www.amazon.es/dp/B0D9FJY1SG) |
| 9 | [SumUp Solo](componentes/sumup-solo/README.md) | Puerto USB-C del canto de abajo (W15) y Wi-Fi (W29) | [B0C9V3LXTF](https://www.amazon.es/dp/B0C9V3LXTF) |
| 10 | [Cable USB-A → USB-C](componentes/cable-usb-a-usb-c-90-30cm/README.md) | Del borne USB-A nº 1 al USB-C del Solo (W15) | [B0C8FS5FV2](https://www.amazon.es/dp/B0C8FS5FV2) |
| 11 | [Pulsador arcade](componentes/pulsador-arcade-30mm/README.md) | Faston A a Pi 11 y faston B a Pi 9 (W21, W22) | [B01N11BDX9](https://www.amazon.es/dp/B01N11BDX9) |
| 12 | [Adaptador AR9271](componentes/adaptador-wifi-ar9271/README.md) | Un USB de la Pi (W25) y el alargo de antena (W26) | [B0CBW6THN1](https://www.amazon.es/dp/B0CBW6THN1) |
| 13 | [Alargo RP-SMA](componentes/alargo-antena-rp-sma-30cm/README.md) | Del AR9271 al jack de panel del techo (W26) | [B0FJRPC7MN](https://www.amazon.es/dp/B0FJRPC7MN) |
| 14 | [Fuente LRS-50-5](componentes/meanwell-lrs-50-5/README.md) | Bornes 1 y 2 (W4, W5), 3 (W7), 4 (W12) y 5 (W11) | [B06XWRCWZ9](https://www.amazon.es/dp/B06XWRCWZ9) |
| 15 | [Módulo C14](componentes/modulo-c14-fusible-interruptor/README.md) | Cordón (W1), pestañas al interruptor (W2, W3), salidas a la fuente (W4, W5) y tierra (W6) | [B08Z6FCR5Z](https://www.amazon.es/dp/B08Z6FCR5Z) |
| 16 | [Fusibles T2,5A](componentes/fusibles-ceramicos-5x20-t2-5a/README.md) | En el portafusibles del C14 | [B0956XYTN6](https://www.amazon.es/dp/B0956XYTN6) |
| 17 | [Cordón Schuko-C13](componentes/cable-schuko-c13-2m/README.md) | Toma de pared → C14 (W1) | [B00AOAJAUC](https://www.amazon.es/dp/B00AOAJAUC) |
| 18 | [Bornes USB-A](componentes/borne-usb-a-hembra-tornillo/README.md) | Dos bornes: WAGO → cable del Solo (W14, W15) y WAGO → cable de la pantalla (W16, W17) | [B07V86XPL4](https://www.amazon.es/dp/B07V86XPL4) |
| 19 | [Latiguillos micro-USB](componentes/latiguillo-micro-usb-22awg/README.md) | Uno, de WAGO a micro-USB de la Pi (W13). Los otros cinco sobran | [B0DP2NT8LY](https://www.amazon.es/dp/B0DP2NT8LY) |
| 20 | [WAGO 221](componentes/wago-221-surtido/README.md) | Dos 221-415: una de +5 V y otra de GND (W11 a W18) | [B09XB58ZXJ](https://www.amazon.es/dp/B09XB58ZXJ) |
| 21 | [Cable 2 × 0,75 mm²](componentes/cable-2x0-75-rojo-negro-10m/README.md) | Troncal y ramas de 5 V (W11 a W18) | [B0D12QPF4Y](https://www.amazon.es/dp/B0D12QPF4Y) |
| 22 | [Manguera H05VV-F 3G1,5](componentes/cable-h05vv-f-3g1-5-5m/README.md) | Sus hilos marrón, azul y verde-amarillo son los de 230 V y tierra (W2 a W10) | [B07BDHJGKG](https://www.amazon.es/dp/B07BDHJGKG) |
| 23 | [Ojales M4](componentes/terminales-ojal-m4/README.md) | Extremos de los cables de tierra en el espárrago (W6 a W10) | [B0CVW7Y2P4](https://www.amazon.es/dp/B0CVW7Y2P4) |
| 24 | [Arandelas dentadas M4](componentes/arandelas-dentadas-m4/README.md) | En el espárrago, bajo cada ojal y bajo la tuerca | [B0B77J5FZS](https://www.amazon.es/dp/B0B77J5FZS) |
| 25 | [Espárrago M4 × 20](componentes/esparragos-soldar-m4x20/README.md) | Punto de tierra, soldado al cuerpo (W6 a W10) | [B0GSCLY4D7](https://www.amazon.es/dp/B0GSCLY4D7) |
| 26 | [Tornillería inox](componentes/tornilleria-inox-m3-m6/README.md) | Fijaciones (fuente, C14, pantalla). Sin función eléctrica; en la LRS la longitud del tornillo importa (fichas #14 y #26) | [B0BGRY2JGX](https://www.amazon.es/dp/B0BGRY2JGX) |
| 27 | [Kit faston](componentes/kit-faston-aislados/README.md) | Módulo C14 e interruptor (W2, W3, W4, W5, W6) y pulsador (W21, W22) | [B0B4H54KPS](https://www.amazon.es/dp/B0B4H54KPS) |
| 28 | [Crimpadora y punteras](componentes/crimpadora-y-punteras/README.md) | Punteras en los bornes de la fuente y en las WAGO (W4, W5, W7, W11 a W14, W16, W18) | [B0FQP6KDL4](https://www.amazon.es/dp/B0FQP6KDL4) |
| 29 | [Cables Dupont](componentes/cables-dupont-elegoo-120/README.md) | Extremo de la Pi de los hilos de los pines 8, 9, 10 y 11 (W19 a W22) | [B01NGTXASZ](https://www.amazon.es/dp/B01NGTXASZ) |
| 30 | [Separadores de nailon M2,5](componentes/separadores-nylon-m2-5/README.md) | Fijan la Pi y el sensor a la caja interior sin unir masas | [B0G4G7WQRM](https://www.amazon.es/dp/B0G4G7WQRM) |
| 31 | [Pasacables de goma](componentes/pasacables-goma/README.md) | En cada agujero de chapa por donde pase un cable | [B0B5DLWVZ2](https://www.amazon.es/dp/B0B5DLWVZ2) |

## 4. Antes de dar tensión

1. **Módulo C14, suelto, sin tensión y sin enchufar, con el fusible T2,5A puesto** (polímetro en continuidad; es el protocolo de la [ficha #15](componentes/modulo-c14-fusible-interruptor/README.md), §4.3 y §8.2):
   1. Fotografía y numera los terminales de atrás. Apunta el tamaño de las lengüetas.
   2. Interruptor: mide entre cada par de terminales con él en «O» y en «I». Los pares que cierran en «I» son los polos. Dos pares: caso 1 (bipolar). Un par: caso 2.
   3. Lámpara: los terminales que no cierran nunca y dan una resistencia alta (cientos de kΩ o más). Mira la tensión marcada en el interruptor: tiene que ser de 230 V, porque una de 12 V se quema.
   4. Fusible: mide entre cada pin del C14 y los terminales del portafusibles, con y sin fusible. El pin que solo cierra con el fusible puesto es el del polo con fusible. Si ningún pin va al portafusibles, el cableado de ese lado es externo y lo decides tú.
   5. Entre L y N del C14 no debe haber continuidad en ninguna posición del interruptor, ni entre los terminales de un polo y los del otro o los de la lámpara.
   6. Tierra: mide entre el pin central del C14 y su faston.
   7. Dibuja el esquema real, compáralo con el caso 1 y el caso 2 y rehaz W2 a W5.
2. **Tierra:** continuidad del pin PE del C14 a cada pieza metálica, con 0,1 Ω como máximo. La medida buena se hace con un comprobador que inyecte 10 a 25 A.
3. **Fuente sola, sin cargas:** mide entre los bornes 4 y 5 y ajusta el trimmer a 5,20 V (guía). Nunca por encima de 5,25 V. Queda abierto si conviene 5,10 a 5,15 V ([ficha #14](componentes/meanwell-lrs-50-5/README.md)). Después, con la Pi conectada, mide en sus pines: la Pi avisa de subtensión por debajo de unos 4,63 V (dato no oficial, de comentarios de usuarios).
4. **Bornes USB-A:** con el polímetro y sin tensión, continuidad entre el tornillo «+» y el pin 1 (VBUS) del conector hembra, y entre el tornillo «−» y el pin 4 (GND). Con D+ y D− unidos, su orden no importa.
5. **Cable USB-A → USB-C del Solo:** 56 kΩ entre el pin CC y VBUS (el anuncio no lo dice), qué punta es la acodada y que el conector del Solo pasa por la ranura de 14 × 9 mm del separador.
6. **Cable de la pantalla:** que su extremo grande sea USB-A, y que el contacto USB-C no se mueva con un roce.
7. **Latiguillo micro-USB:** polaridad (rojo = VBUS) y caída de tensión con carga.
8. **ZE29A:** mide con calibre el paso del J1 (2,5 mm si es XH), mira que el pin 1 es el extremo «5V» de la serigrafía y que su TX en reposo da unos 3,3 V. Mira en la clavija qué color cae en cada posición y apúntalo.
9. **Pulsador:** con el polímetro en continuidad, busca entre los cuatro faston el par que cierra al pulsar. Ese par va a los pines 9 y 11; el otro es el LED y no se conecta.
10. **GPIO:** con el alojamiento Dupont puesto, ningún hilo en un pin de 5 V (pines 2 y 4). Mide con la Pi apagada.
11. **Cable FFC:** con el cable plano sobre la mesa, el metal de una punta tiene que verse por arriba y el de la otra por abajo («caras opuestas»). Lado de la Pi: contactos hacia el conector HDMI. Lado de la cámara: contactos hacia su placa. Siempre con la Pi apagada.
12. **Todo montado:** `vcgencmd get_throttled` tiene que dar `0x0` y el pin 6 de la Pi frente a la caja interior tiene que dar circuito abierto (ficha #30).

## 5. Qué está confirmado y qué no

### 5.1 Confirmado

| Dato | Resultado | De dónde sale |
|---|---|---|
| Bornes de la LRS-50-5 | 1 AC/L, 2 AC/N, 3 FG, 4 −V, 5 +V | Datasheet local |
| Pines del ZE29A | 1 Vin, 2 GND, 3 TXD, 4 RXD, UART a 3,3 V | Manual V1.1 local |
| J1 del ZE29A | Conector blanco de 4 vías; serigrafía «Rx Tx GND 5V», que cuadra con el manual | Fotos del anuncio |
| Tornillos del borne USB-A | S, +, D−, D+ y −; cable de AWG 28 a 16 | Texto y foto del anuncio |
| Pulsador | 4 faston de 2,8 mm: 2 del microinterruptor y 2 del LED con polaridad. No hay NO, COM ni NC | Texto y foto del anuncio |
| Pantalla | Un USB-C «Power IN», un HDMI de tamaño completo y un selector de retroiluminación, en el mismo canto. No es táctil | Texto y foto del anuncio |
| USB-C del Solo | En el canto de abajo; el cable que trae es C–C | Foto del anuncio y reseña |
| Clavija XH | 25 clavijas hembra con hilo de 150 mm y 22 AWG (amarillo, blanco, rojo y negro) y 25 conectores sin hilo | Texto del anuncio |
| Cable FFC | 15 pines, paso 1,0 mm; pack de 50, 100 y 200 cm | Texto del anuncio |
| Latiguillo micro-USB | 6 cables de 30 cm, 22 AWG, rojo y negro, sin datos | Texto del anuncio |

### 5.2 Sigue sin confirmar

- **Esquema interno del C14:** cuántos polos corta el interruptor, cuál es el contacto y cuál la lámpara, y qué polo lleva el fusible. Los dos dibujos del vendedor no coinciden y dos reseñas dicen que están mal. Con un enchufe Schuko, que se puede insertar de las dos maneras, un fusible en un solo polo puede quedar en la fase o en el neutro ([ficha #15](componentes/modulo-c14-fusible-interruptor/README.md), §4 y §5). **Cierra con la medida del apartado 4.1, o con un módulo bipolar de esquema documentado.**
- **Fusible del C14:** el anuncio da dos valores (10 A y 5 A), no dice el tamaño y las reseñas se contradicen sobre si viene. La guía compra el T2,5A de 5 × 20 (#16). **Se mira al recibirlo.** Tampoco consta el ancho y el grosor de las lengüetas ([ficha #27](componentes/kit-faston-aislados/README.md)).
- **Paso y tipo del J1 del ZE29A:** el manual solo da los 4 pines. **Se mide con calibre.**
- **Cara de los contactos del FFC:** el anuncio no la dice ([ficha #4](componentes/cable-ffc-camara-50cm/README.md)). **Se ve al recibirlo.**
- **Polaridad del latiguillo micro-USB:** rojo y negro sin más ([ficha #19](componentes/latiguillo-micro-usb-22awg/README.md)). **Se mide.**
- **Cable de la pantalla:** A → C o C → C ([ficha #5](componentes/pantalla-geeekpi-7-hdmi/README.md)). **Se ve al recibirlo.**
- **Cable acodado del Solo:** qué punta es la acodada y los 56 kΩ ([ficha #10](componentes/cable-usb-a-usb-c-90-30cm/README.md)).
- **Cuál es cuál en el pulsador:** los faston no van rotulados. **Se mide.**
- **Bornes USB-A:** corriente que aguantan (1 a 1,5 A frente a un pico estimado de 2 A del Solo) y si el Solo reconoce el puente D+/D− como cargador ([fichas #9, #10 y #18](componentes/borne-usb-a-hembra-tornillo/README.md)).
- **Sección del cable de tierra:** 1,5 o 2,5 mm² ([ficha #22](componentes/cable-h05vv-f-3g1-5-5m/README.md) y [ficha #23](componentes/terminales-ojal-m4/README.md)).
- **Un solo espárrago con cinco ojales:** punto único de fallo ([ficha #25](componentes/esparragos-soldar-m4x20/README.md)).
- **Cómo soldar el espárrago:** probablemente sea de descarga de condensador y una soldadora de puntos normal no sirva (razonamiento de la ficha). Faltan el material y el espesor de la chapa.
- **Protección del raíl de 5 V:** falta fusible o PTC por rama ([ficha #14](componentes/meanwell-lrs-50-5/README.md)).
- **−V frente a tierra:** hoy el −V flota; unirlo es una decisión de un solo punto ([ficha #30](componentes/separadores-nylon-m2-5/README.md)).
- **Cómo se conectan los pines 7 a 12:** alojamiento Dupont de 2 × 3 o placa de bornes, y la herramienta para crimpar Dupont ([ficha #29](componentes/cables-dupont-elegoo-120/README.md) y [ficha #7](componentes/cables-jst-xh-4-pin/README.md)).
- **Conexión a masa del jack RP-SMA de panel:** une la malla del coaxial a tierra ([ficha #13](componentes/alargo-antena-rp-sma-30cm/README.md)).

La lista completa de decisiones y medidas está en [`componentes/pendientes.md`](componentes/pendientes.md).

## 6. Dónde va cada cosa dentro de la máquina

Figura 4 y esta tabla juntan lo que dicen `decisiones-diseno.md` (20-10-2026) y el apartado 4 de la guía. **Es el diseño más antiguo: el apartado 6.3 explica qué cambia con el diseño A del 21-10-2026.** La máquina mide 200 × 100 × 386 mm y está dividida por el separador, a 300 mm de altura. **Orientación quiere decir qué lado de la pieza mira a qué lado de la máquina.** Donde ningún documento lo decide, lo pone la tabla.

### 6.1 Dónde va cada pieza

| Pieza | Dónde (decidido) | Orientación | Estado |
|---|---|---|---|
| SumUp Solo (#9) | Caja de arriba (86 mm de alto), a la derecha, tras la ventana de 78 × 78 mm | De pie, pantalla al frente. El USB-C (canto de abajo) mira al separador y baja por la ranura de 14 × 9 mm. El botón de encendido queda en el canto derecho, mirando de frente | Decidido. USB-C confirmado por una foto del anuncio |
| Cámara (#3) | Caja de arriba, a la izquierda, con la lente en el agujero de Ø10 mm, a media altura del Solo | Lente al frente. El J1 de la cámara está en la cara contraria a la lente, así que la cinta sale hacia atrás | Decidido |
| Fuente LRS-50-5 (#14) | Caja de arriba, tumbada sobre el separador, a la izquierda y contra la trasera | Qué lado lleva los bornes: sin decidir. Tienen que quedar al alcance de un destornillador, igual que el trimmer | ⚠ Lado de los bornes sin decidir |
| WAGO 221-415 ×2 (#20) | Junto a la fuente | Sin decidir | ⚠ Posición sin decidir |
| Módulo C14 (#15) | Trasera de la caja de arriba, detrás del Solo | El C13 entra por detrás; los faston quedan dentro | ⚠ Hueco sin dibujar |
| Espárrago de tierra (#25) | Soldado por dentro, cerca de la fuente | — | ⚠ Soldadura pendiente |
| Antena y jack RP-SMA (#12, #13) | Techo, taladro de Ø6,5 mm | La antena sale por fuera y el alargo de 30 cm baja por el taladro | ⚠ Posición del taladro sin decidir |
| Caja interior suspendida | Detrás de la pantalla: 167 × 63,5 × 118 mm, sobre muelles, con la Pi y el ZE29A | Se extrae hacia la izquierda | ⚠ Falta el agujero lateral y la altura exacta |
| Raspberry Pi (#1) | Dentro de la caja interior, en vertical sobre la pared trasera, con separadores M2,5 | Sin decidir hacia qué lado miran los USB, el micro-USB, el HDMI y el conector de 40 pines | ⚠ Orientación sin decidir |
| ZE29A (#6) | Dentro de la caja interior, con separadores | La placa mide 85 × 33 × 18 mm y el J1 está en uno de sus bordes cortos (fotos del anuncio). Sin decidir hacia dónde mira | ⚠ Orientación sin decidir |
| Pantalla (#5) | Ventana de 176 × 116 mm, entre z = 170 y 286 mm, tras el policarbonato | Los puertos están todos en un canto: sin decidir cuál | ⚠ Canto de los puertos sin decidir |
| Bornes USB-A ×2 (#18) | Sin decidir | El del Solo tiene que quedar a menos de 30 cm de cable de la ranura | ⚠ Posición sin decidir |
| Pulsador (#11) | Agujero de Ø30 mm en el panel, sin posición | Cabeza de 33 mm al frente y faston por detrás | ⚠ Posición sin decidir |
| Boquilla y tubo (#8) | Opción A (recomendada): en el panel, entre la bandeja y la pantalla (z 150–170). Opción B: entre la cámara y el Solo | Tubo flexible hasta la entrada de aire del ZE29A | ⚠ Opción A o B sin elegir |
| Adaptador AR9271 (#12) | En un USB de la Pi | — | — |

### 6.2 Qué cruza el separador y las distancias sin medir

**Qué cruza el separador.** Por el paso de Ø30 mm (la guía lo mueve a x ≈ +30 mm porque la fuente tapa el centro) bajan o suben: los 5 V de la Pi (W13), los 5 V del ZE29A (W18), la cinta de la cámara (W24), el alargo de la antena (W26), los dos cables de tierra flexibles (W9 y W10), y los de la pantalla y el pulsador si el borne nº 2 o el pulsador quedan arriba. Por la ranura de 14 × 9 mm baja el USB-C del Solo. Los cables que van a la caja interior suspendida llevan holgura para que los muelles se muevan.

**Dos distancias que nadie ha medido:**

- **WAGO → micro-USB de la Pi:** el latiguillo se corta a 15 cm o menos, y la Pi está debajo del separador. Con la Pi y las WAGO fijadas, hay que comprobar que llega.
- **Borne USB-A nº 1 → USB-C del Solo:** el cable mide 30 cm y tiene que cubrir la bajada por la ranura y el recorrido hasta el borne.

### 6.3 Qué cambia con el diseño A (`diseno-cajon-A.md`, 21-10-2026)

El Project tiene un segundo documento de diseño, firmado por Guillermo el 21-10-2026. Su script `cajon/specs.py` lo llama «el elegido» y dice que B y C se eliminaron ese día. Es posterior a `decisiones-diseno.md` y a la guía de cableado, y no coincide con ellos en esto:

| Tema | Diseño de este documento (20-10) | Diseño A (21-10) | Qué cambia en las conexiones |
|---|---|---|---|
| Medidas | 200 × 100 × 386 mm | 220 × 103 × 434 mm | Nada eléctrico |
| Pi y ZE29A | Caja interior suspendida detrás de la pantalla | Trasera del cajón de componentes: Pi con separadores M2,5 de 6 mm, ZE29A encima con cuatro separadores, AR9271 en el USB de abajo | Cambia el recorrido de W19, W20, W23 y W24 |
| Fuente y C14 | Caja de arriba; C14 en la trasera | «Caja de red» dentro del cajón; C14 en su lateral derecho, enchufable por una ventana de 38 × 56 mm de la carcasa | Cambia W1 y la tierra: espárrago del cajón y puente con faston a otro espárrago de la carcasa, en vez de un solo espárrago con cinco ojales |
| Reparto de 5 V | Dos WAGO sin fusible por rama | Dos WAGO y cuatro portafusibles de pie: Pi 3 A, Solo 3 A, pantalla 3 A y sensor 2 A | **Diseño A:** entre las WAGO y cada carga va un portafusibles. El aviso «sin fusible por rama» de W11 a W18 deja de valer |
| Pulsador | Agujero de Ø30 y pines 9 y 11 | No hay pulsador: la máquina arranca cuando la cámara detecta a alguien | **Diseño A:** W21 y W22 desaparecen |
| Cámara | Cable FFC de 50 cm (#4) | «La cinta de 200 mm que trae la cámara» | **Diseño A:** W24 no usa el #4 |
| Wi-Fi | Pi y Solo, los dos al router del bar | El Solo se conecta al punto de acceso de la Pi, y la Pi sale a Internet por el AR9271 | **Diseño A:** cambia W29 |
| Antena | Taladro de Ø6,5 en el techo | Fuera, vertical, en el lateral derecho y detrás del cajón, con el alargo RP-SMA de pasamuros | Cambia la salida de W26 |
| Tubo del soplido | Boquilla → toma de aire del ZE29A | Boquilla → T de presión → reductor de latón → T de alcohol → escape por una rejilla del lateral izquierdo | Cambia W28 |
| Ventanas | Solo 78 × 78, cámara Ø10, pantalla 176 × 116 | Solo 85 × 85, cámara Ø12, pantalla 159 × 91, dos policarbonatos de 5 mm | Nada eléctrico |

Lo demás de las conexiones (fuente, tierra del C14 a la fuente, W2 a W5, UART, HDMI, bornes USB-A) es igual en los dos. **Este documento no se ha rehecho sobre el diseño A.** Si es el vigente, hay que repasar W1, W6 a W10, W11 a W18, W21 a W24, W26, W28 y W29, y rehacer la figura 4.

## Fuentes

- Guía de montaje eléctrico v2 (20-10-2026), apartados 1, 4, 5 y 8: lista de compra, dónde va cada cosa, cableado punto a punto y orden de pruebas.
- `decisiones-diseno.md` (20-10-2026): medidas de la carcasa, alturas, ventanas y pendientes de la caja interior.
- `diseno-cajon-A.md` (21-10-2026) y `cajon/specs.py`, del Project: el diseño A del apartado 6.3.
- Anuncios de Amazon.es de las piezas #4, #5, #6, #7, #9, #10, #11, #15, #18 y #19, leídos el 21-10-2026: [resumen y origen de cada dato](montaje-general/anuncios-amazon-21-10-2026.md).
- Las 31 fichas de [`componentes/`](componentes/README.md), con sus discrepancias con la guía.
- Datasheet LRS-50 de Mean Well ([copia local](componentes/meanwell-lrs-50-5/datasheets/MEAN_WELL_LRS-50_DATA_SHEET.pdf)): numeración de los bornes (1 AC/L, 2 AC/N, 3 FG, 4 DC −V, 5 DC +V).
- Manual V1.1 del ZE29A de Winsen ([copia local](componentes/winsen-ze29a/datasheets/ze29a-c2h5oh.pdf)): pines 1 Vin, 2 GND, 3 TXD y 4 RXD, UART a 3,3 V.
