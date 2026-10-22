# Lista de compra (Amazon.es)

Los 32 componentes del alcoholímetro con su enlace de compra (31 de la guía más el kit de fusibles por rama que añadió la auditoría). El orden de montaje y las pruebas están en [MONTAJE PASO A PASO](MONTAJE-PASO-A-PASO.md); para el banco hace falta además el material de su fase 0. Es la lista de la guía de montaje eléctrico v2 (20-10-2026, del Project), con la misma numeración que las fichas de [`componentes/`](componentes/README.md) y que el [MONTAJE GENERAL](MONTAJE-GENERAL.md).

- Enlace de cada pieza: `https://www.amazon.es/dp/<ASIN>`. El ASIN es la referencia fija; **los precios son los vistos en Amazon.es el 19 y 20-10-2026 y cambian a menudo.**
- Todo se puede pedir en Amazon.es, que es la regla del proyecto.
- La columna «Nota» es la de la guía, corregida donde los anuncios leídos el 21-10-2026 dicen otra cosa ([lectura de los anuncios](montaje-general/anuncios-amazon-21-10-2026.md)).

> **Esta lista es la del diseño de 20-10-2026.** El Project tiene además `diseno-cajon-A.md` (21-10-2026), que cita su propia `Lista_de_piezas.xlsx` y añade piezas que aquí no están (por ejemplo cuatro portafusibles de pie). Esa hoja no está en el repositorio. Ver [MONTAJE GENERAL, apartado 6.3](MONTAJE-GENERAL.md).

> **22-10-2026 · Sin botón en todo el proyecto.** La máquina no lleva pulsador: arranca cuando la cámara detecta a alguien. Todo lo que este documento dice del pulsador (#11) queda anulado: no se compra. Detalle en [DECISIONES](DECISIONES.md).

## Núcleo (1 a 13)

| # | Pieza | Anuncio | Enlace | Precio | Ficha | Nota |
|---|---|---|---|---|---|---|
| 1 | Controlador | Raspberry Pi 3 Model B+ | [B0BNJPL4MW](https://www.amazon.es/dp/B0BNJPL4MW) | 54,90 € | [ficha](componentes/raspberry-pi-3b-plus/README.md) |  |
| 2 | Tarjeta de memoria | SanDisk **High Endurance** 32 GB microSDHC | [B07P14QHB7](https://www.amazon.es/dp/B07P14QHB7) | 20,49 € | [ficha](componentes/sandisk-high-endurance-32gb/README.md) | Aguanta escritura continua (hecha para cámaras de vigilancia) |
| 3 | Cámara | Raspberry Pi Camera Module 3, **estándar** | [B0BRY6MVXL](https://www.amazon.es/dp/B0BRY6MVXL) | 48,04 € | [ficha](componentes/raspberry-pi-camera-module-3/README.md) | No la NoIR: da imágenes rosadas con luz normal |
| 4 | Cable de cámara | GeeekPi FFC de 15 pines, 50 cm | [B07DKB4M1H](https://www.amazon.es/dp/B07DKB4M1H) | 7,99 € | [ficha](componentes/cable-ffc-camara-50cm/README.md) | La Pi va en la caja interior y la cámara en la de arriba; el cable de 20 cm que trae la cámara no llega. El anuncio es un pack de tres cables (50, 100 y 200 cm) |
| 5 | Pantalla | GeeekPi 7" 1024×600 IPS HDMI, no táctil | [B0CHMBCCJB](https://www.amazon.es/dp/B0CHMBCCJB) | 45,99 € | [ficha](componentes/pantalla-geeekpi-7-hdmi/README.md) | Trae cable HDMI y cable USB: se usan los suyos |
| 6 | Sensor de alcohol | Winsen ZE29A (módulo suelto) | [B0H8NVXVG5](https://www.amazon.es/dp/B0H8NVXVG5) | 108,46 € | [ficha](componentes/winsen-ze29a/README.md) | En la foto del anuncio se ve el módulo suelto (placa WS19, conector «Rx Tx GND 5V»), aunque el texto habla de una carcasa. Comprobar al recibirlo |
| 7 | Clavija del sensor | Cables JST-XH de 4 pines con conector, 150 mm, 22 AWG (25 juegos) | [B0CBWZNP6Z](https://www.amazon.es/dp/B0CBWZNP6Z) | 8,99 € | [ficha](componentes/cables-jst-xh-4-pin/README.md) | Por si el ZE29A no trae su cable (el anuncio del ZE29A no lo dice). Comprobar que su J1 es XH |
| 8 | Tubo de soplido | Manguera de silicona de 6 mm, 1 m | [B0D9FJY1SG](https://www.amazon.es/dp/B0D9FJY1SG) | 6,99 € | [ficha](componentes/tubo-silicona-6mm/README.md) | Une la boquilla con el sensor |
| 9 | Lector de tarjetas | SumUp Solo con base de carga | [B0C9V3LXTF](https://www.amazon.es/dp/B0C9V3LXTF) | 72,18 € | [ficha](componentes/sumup-solo/README.md) | Quedaba 1 en stock. La base de carga no se usa en este diseño |
| 10 | Cable del Solo | USB-A → USB-C acodado 90°, 30 cm | [B0C8FS5FV2](https://www.amazon.es/dp/B0C8FS5FV2) | 4,99 € | [ficha](componentes/cable-usb-a-usb-c-90-30cm/README.md) | El USB-C está en el canto de abajo del Solo; el conector baja por una ranura de 14 × 9 mm del separador |
| 11 | ~~Botón de inicio~~ | ~~EG STARTS arcade de 30 mm (5 uds.)~~ | ~~[B01N11BDX9](https://www.amazon.es/dp/B01N11BDX9)~~ | ~~10,88 €~~ | [ficha](componentes/pulsador-arcade-30mm/README.md) | **Eliminado el 22-10-2026: no se compra.** El proyecto no lleva botón |
| 12 | Wi-Fi | Adaptador USB **AR9271** con antena desmontable | [B0CBW6THN1](https://www.amazon.es/dp/B0CBW6THN1) | 16,24 € | [ficha](componentes/adaptador-wifi-ar9271/README.md) |  |
| 13 | Alargo de antena | RP-SMA macho-hembra, 30 cm (2 uds.) | [B0FJRPC7MN](https://www.amazon.es/dp/B0FJRPC7MN) | 9,99 € | [ficha](componentes/alargo-antena-rp-sma-30cm/README.md) | Saca la antena por el techo |

Subtotal: **405,25 €** (416,13 € con el pulsador, que ya no se compra).

## Alimentación, protección y material de montaje (14 a 32)

| # | Pieza | Anuncio | Enlace | Precio | Ficha | Nota |
|---|---|---|---|---|---|---|
| 14 | Fuente | **Mean Well LRS-50-5** (5 V, 10 A, 99 × 82 × 30 mm) | [B06XWRCWZ9](https://www.amazon.es/dp/B06XWRCWZ9) | 18,52 € | [ficha](componentes/meanwell-lrs-50-5/README.md) |  |
| 15 | Toma de red | Módulo C14 con portafusibles e interruptor con luz | [B08Z6FCR5Z](https://www.amazon.es/dp/B08Z6FCR5Z) | 7,70 € | [ficha](componentes/modulo-c14-fusible-interruptor/README.md) | El anuncio no aclara el fusible (da 10 A y 5 A) y las reseñas se contradicen sobre si viene: se compra el T2,5A (#16) igualmente. Comprobar con el polímetro cuántos polos corta |
| 16 | Fusibles | Cerámicos 5×20 **T2,5A** lentos, 250 V (10 uds.) | [B0956XYTN6](https://www.amazon.es/dp/B0956XYTN6) | 9,99 € | [ficha](componentes/fusibles-ceramicos-5x20-t2-5a/README.md) | Cerámicos, no de vidrio: cortan con más seguridad si hay un cortocircuito a 230 V |
| 17 | Cable de red | Schuko → C13, 2 m | [B00AOAJAUC](https://www.amazon.es/dp/B00AOAJAUC) | 7,00 € | [ficha](componentes/cable-schuko-c13-2m/README.md) |  |
| 18 | Toma USB para Solo y pantalla | Borne USB-A hembra a tornillo (2 uds.) | [B07V86XPL4](https://www.amazon.es/dp/B07V86XPL4) | 10,99 € | [ficha](componentes/borne-usb-a-hembra-tornillo/README.md) | Quedaban 4 |
| 19 | Alimentación de la Pi | Latiguillo micro-USB macho de 22 AWG, 30 cm (6 uds.) | [B0DP2NT8LY](https://www.amazon.es/dp/B0DP2NT8LY) | 8,49 € | [ficha](componentes/latiguillo-micro-usb-22awg/README.md) | Se corta a 15 cm o menos |
| 20 | Regleta de 5 V | WAGO 221, surtido de 75 (221-412, -413 y -415) | [B09XB58ZXJ](https://www.amazon.es/dp/B09XB58ZXJ) | 27,08 € | [ficha](componentes/wago-221-surtido/README.md) | Se usan dos 221-415 por máquina |
| 21 | Cable de 5 V | 2 × 0,75 mm² rojo/negro, 10 m | [B0D12QPF4Y](https://www.amazon.es/dp/B0D12QPF4Y) | 14,10 € | [ficha](componentes/cable-2x0-75-rojo-negro-10m/README.md) | Troncal y ramas. Aguanta 6 A y el pico es de 5 A |
| 22 | Cable de 230 V y tierra | Manguera H05VV-F 3G1,5 mm², 5 m | [B07BDHJGKG](https://www.amazon.es/dp/B07BDHJGKG) | 27,74 € | [ficha](componentes/cable-h05vv-f-3g1-5-5m/README.md) | Se pela y salen los tres hilos: marrón (L), azul (N) y verde-amarillo (tierra y puentes) |
| 23 | Ojales | M4 para 0,5–1,5 mm² (25 uds.) | [B0CVW7Y2P4](https://www.amazon.es/dp/B0CVW7Y2P4) | 5,52 € | [ficha](componentes/terminales-ojal-m4/README.md) | Quedaba 1 |
| 24 | Arandelas dentadas | M4 (200 uds.) | [B0B77J5FZS](https://www.amazon.es/dp/B0B77J5FZS) | 7,99 € | [ficha](componentes/arandelas-dentadas-m4/README.md) |  |
| 25 | Espárragos de tierra | M4 × 20 inox para soldar por puntos (20 uds.) | [B0GSCLY4D7](https://www.amazon.es/dp/B0GSCLY4D7) | 8,40 € | [ficha](componentes/esparragos-soldar-m4x20/README.md) | De 20 mm para que quepan las dos tuercas con sus ojales (uno de 10 mm no llega) |
| 26 | Tornillería | Surtido de tornillos, tuercas y arandelas M3–M6 inox | [B0BGRY2JGX](https://www.amazon.es/dp/B0BGRY2JGX) | 11,99 € | [ficha](componentes/tornilleria-inox-m3-m6/README.md) |  |
| 27 | Faston | Kit de terminales faston aislados de 2,8, 4,8 y 6,3 mm | [B0B4H54KPS](https://www.amazon.es/dp/B0B4H54KPS) | 10,99 € | [ficha](componentes/kit-faston-aislados/README.md) | Para la toma C14 |
| 28 | Crimpadora y punteras | Crimpadora autoajustable + 1250 punteras | [B0FQP6KDL4](https://www.amazon.es/dp/B0FQP6KDL4) | 15,98 € | [ficha](componentes/crimpadora-y-punteras/README.md) |  |
| 29 | Cables de señal | Dupont ELEGOO, 120 uds. | [B01NGTXASZ](https://www.amazon.es/dp/B01NGTXASZ) | 9,99 € | [ficha](componentes/cables-dupont-elegoo-120/README.md) | Para los pines de la Pi |
| 30 | Separadores | Columnas hexagonales M2.5 de nylon (350 uds.) | [B0G4G7WQRM](https://www.amazon.es/dp/B0G4G7WQRM) | 9,99 € | [ficha](componentes/separadores-nylon-m2-5/README.md) | Para la Pi y el sensor |
| 31 | Pasacables | De goma, 7 tamaños (260 uds.) | [B0B5DLWVZ2](https://www.amazon.es/dp/B0B5DLWVZ2) | 7,99 € | [ficha](componentes/pasacables-goma/README.md) | En todos los agujeros de chapa por donde pase cable |
| 32 | Fusibles por rama de 5 V | Kit: 5 portafusibles en línea 5 × 20 con hilo de 16 AWG + 150 fusibles rápidos de vidrio (0,5 a 20 A) | [B07KQ46H6K](https://www.amazon.es/dp/B07KQ46H6K) | 9,99 € | [ficha](componentes/portafusibles-en-linea-5x20/README.md) | **Añadido el 21-10-2026** por el hallazgo H04 de la auditoría: un fusible en el troncal (5 A) y en el +5 V de cada rama (3 A Pi, 2 A Solo, 2 A pantalla, 1 A ZE29A); se usan los cinco portafusibles. Precio visto el 21-10-2026 |

Subtotal: **230,44 €**.

## Total

**Primer pedido: 635,69 €** sin el pulsador (646,57 € con él; una unidad de cada línea, con los precios de arriba; la guía, sin el kit de fusibles, lo redondea a unos 640 €). Unos 160 € son herramientas y kits que sobran en pedidos siguientes: crimpadora, WAGO, rollos de cable y similares. La guía calcula unos 470 € de electrónica por cada máquina siguiente, sin contar la chapa.

## Plan B de conexión (si el Wi-Fi del bar no vale)

No está en las 31 fichas. Lo propone la guía por si el Wi-Fi del bar no sirve:

| Pieza | Enlace | Precio | Nota |
|---|---|---|---|
| Router 4G USB ZTE MF79N | [B08WPXRTRL](https://www.amazon.es/dp/B08WPXRTRL) | 35,99 € | Crea un Wi-Fi propio dentro de la máquina, al que se conecta el Solo. La Pi se conecta por USB. Necesita una SIM de datos |
| Antenas TS9 | [B07YBW534D](https://www.amazon.es/dp/B07YBW534D) | 7,99 € | Comprobar que el MF79N trae conectores TS9: el anuncio no lo dice |

## Lo que cambian los anuncios leídos el 21-10-2026

- **#15 Módulo C14:** la guía dice que trae un fusible de 10 A que hay que cambiar. El anuncio da dos valores (10 A y 5 A) sin tamaño y las reseñas se contradicen sobre si viene. Se compra el T2,5A (#16) igualmente y se mide el esquema interno del módulo antes de cablearlo.
- **#11 Pulsador** (ya no se usa, ver arriba): la guía habla de NO, COM y NC. El pulsador solo tiene dos contactos de interruptor (más dos del LED), así que no hay NO, COM ni NC.
- **#7 Clavija XH:** la guía la compra «por si el ZE29A no trae su cable»; el anuncio del ZE29A no dice si lo trae.
- **#9 SumUp Solo:** el USB-C está en el canto de abajo (foto del anuncio).
- **#32 (nuevo):** la auditoría 1.0 (H04) y las cuatro auditorías del repositorio piden fusible en el troncal y en cada rama de 5 V. El kit B07KQ46H6K trae 5 portafusibles y fusibles de 1, 2, 3 y 5 A; detalle en [MONTAJE GENERAL](MONTAJE-GENERAL.md), W11 a W18.
- **Piezas que las auditorías del 21-10-2026 piden y que no están en esta lista** (ver MONTAJE GENERAL, 5.2): tapa aislante para los bornes de 230 V de la fuente; arandelas aislantes para el jack RP-SMA del techo; dos punteras dobles de 2 × 0,75 mm² para los bornes 4 y 5 de la fuente, si el kit #28 no las trae; tornillería M2 para la cámara (sus taladros son de 2,2 mm); resistencias de 1 kΩ para la UART y el pulsador si se adoptan; y, si el módulo C14 resulta de un polo o sin esquema, una entrada C14 bipolar documentada que lo sustituya.
