# Componentes

Una carpeta por componente del alcoholímetro, con su ficha técnica, documentos oficiales, problemas conocidos y notas de uso en el proyecto. El orden es el de la hoja de componentes. Los enlaces de compra están en la [lista de compra](../LISTA-DE-COMPRA.md).

| # | Componente | Función | Ficha |
|---|---|---|---|
| 1 | Raspberry Pi 3 Model B+ | Ordenador principal: sensor, pantalla, cámara y pago | [raspberry-pi-3b-plus](raspberry-pi-3b-plus/README.md) |
| 2 | SanDisk High Endurance microSDHC 32 GB | Almacenamiento: sistema operativo y programa | [sandisk-high-endurance-32gb](sandisk-high-endurance-32gb/README.md) |
| 3 | Raspberry Pi Camera Module 3 (estándar) | Foto al usuario | [raspberry-pi-camera-module-3](raspberry-pi-camera-module-3/README.md) |
| 4 | Cable FFC de 15 pines, 50 cm (GeeekPi) | Une la cámara con el conector CSI de la Pi | [cable-ffc-camara-50cm](cable-ffc-camara-50cm/README.md) |
| 5 | GeeekPi pantalla IPS 7", 1024×600, HDMI | Pantalla del usuario (instrucciones, cuenta atrás, resultado) | [pantalla-geeekpi-7-hdmi](pantalla-geeekpi-7-hdmi/README.md) |
| 6 | Winsen ZE29A (alcohol en aliento) | Mide el alcohol: módulo de prueba de aliento por UART | [winsen-ze29a](winsen-ze29a/README.md) |
| 7 | Cables JST-XH de 4 pines | Clavija del sensor ZE29A | [cables-jst-xh-4-pin](cables-jst-xh-4-pin/README.md) |
| 8 | Tubo de silicona de 6 mm | Lleva el aliento de la boquilla al sensor | [tubo-silicona-6mm](tubo-silicona-6mm/README.md) |
| 9 | SumUp Solo con base de carga | Cobro con tarjeta (Cloud API) | [sumup-solo](sumup-solo/README.md) |
| 10 | Cable USB-A a USB-C acodado 90°, 30 cm | Alimenta el SumUp Solo desde el borne USB-A | [cable-usb-a-usb-c-90-30cm](cable-usb-a-usb-c-90-30cm/README.md) |
| 11 | Pulsador arcade 30 mm (EG STARTS) | Botón de inicio de la prueba (GPIO17) | [pulsador-arcade-30mm](pulsador-arcade-30mm/README.md) |
| 12 | Adaptador Wi-Fi USB AR9271 | Wi-Fi de la Pi con la antena fuera de la chapa | [adaptador-wifi-ar9271](adaptador-wifi-ar9271/README.md) |
| 13 | Alargo de antena RP-SMA, 30 cm | Saca la antena Wi-Fi por el techo de la chapa | [alargo-antena-rp-sma-30cm](alargo-antena-rp-sma-30cm/README.md) |
| 14 | Fuente Mean Well LRS-50-5 (5 V, 10 A) | Fuente única de 5 V de la máquina (230 V) | [meanwell-lrs-50-5](meanwell-lrs-50-5/README.md) |
| 15 | Módulo C14 con fusible e interruptor | Entrada de red 230 V de la máquina | [modulo-c14-fusible-interruptor](modulo-c14-fusible-interruptor/README.md) |
| 16 | Fusibles cerámicos 5×20 T2,5A | Protección de la entrada de red | [fusibles-ceramicos-5x20-t2-5a](fusibles-ceramicos-5x20-t2-5a/README.md) |
| 17 | Cable de red Schuko a C13, 2 m | Conecta la máquina a la toma de pared | [cable-schuko-c13-2m](cable-schuko-c13-2m/README.md) |
| 18 | Borne USB-A hembra con tornillos (x2) | Da 5 V al SumUp Solo y a la pantalla desde la WAGO | [borne-usb-a-hembra-tornillo](borne-usb-a-hembra-tornillo/README.md) |
| 19 | Latiguillo micro-USB macho 22 AWG, 30 cm (x6) | Alimenta la Pi 3B+ desde la WAGO | [latiguillo-micro-usb-22awg](latiguillo-micro-usb-22awg/README.md) |
| 20 | Bornas WAGO 221, surtido de 75 | Reparte el raíl de 5,20 V (+5 V y GND) | [wago-221-surtido](wago-221-surtido/README.md) |
| 21 | Cable bipolar 2 × 0,75 mm² rojo/negro, 10 m | Troncal y ramas del raíl de 5 V | [cable-2x0-75-rojo-negro-10m](cable-2x0-75-rojo-negro-10m/README.md) |
| 22 | Manguera H05VV-F 3G1,5 mm², 5 m | Cableado interno de 230 V y tierra | [cable-h05vv-f-3g1-5-5m](cable-h05vv-f-3g1-5-5m/README.md) |
| 23 | Terminales de ojal M4 aislados 0,5-1,5 mm² (25 uds.) | Terminan los cables de tierra en el espárrago M4 | [terminales-ojal-m4](terminales-ojal-m4/README.md) |
| 24 | Arandelas dentadas M4 (200 uds.) | Bloqueo y contacto de la tierra en el espárrago | [arandelas-dentadas-m4](arandelas-dentadas-m4/README.md) |
| 25 | Espárragos M4 × 20 inox para soldar (20 uds.) | Punto de tierra de 230 V soldado a la chapa | [esparragos-soldar-m4x20](esparragos-soldar-m4x20/README.md) |
| 26 | Surtido de tornillería inox M3 a M6 | Fijaciones generales (fuente, módulo C14, pantalla...) | [tornilleria-inox-m3-m6](tornilleria-inox-m3-m6/README.md) |
| 27 | Kit de terminales faston aislados 2,8 / 4,8 / 6,3 mm | Conexiones del módulo C14, interruptor y pulsador | [kit-faston-aislados](kit-faston-aislados/README.md) |
| 28 | Crimpadora autoajustable + 1250 punteras | Punteras en los bornes de la fuente y de las WAGO | [crimpadora-y-punteras](crimpadora-y-punteras/README.md) |
| 29 | Cables Dupont ELEGOO, 120 uds. | Conexión a los pines 8, 9, 10 y 11 de la Pi | [cables-dupont-elegoo-120](cables-dupont-elegoo-120/README.md) |
| 30 | Separadores hexagonales de nailon M2,5 (kit de 350) | Fijan la Pi (y el sensor) a la caja interior sin unir masas | [separadores-nylon-m2-5](separadores-nylon-m2-5/README.md) |
| 31 | Pasacables de goma, surtido de 7 tamaños (260 uds.) | Protegen los cables en los agujeros de la chapa | [pasacables-goma](pasacables-goma/README.md) |

Lo que las fichas dejan abierto (decisiones, medidas por hacer y documentos que faltan) está reunido en [pendientes.md](pendientes.md).

Cada ficha indica de dónde sale cada dato y marca lo que no está verificado. Los enlaces a PDF y páginas están reunidos en el `enlaces.md` de cada carpeta.
