# Componentes

Una carpeta por componente del alcoholímetro, con su ficha técnica, documentos oficiales, problemas conocidos y notas de uso en el proyecto. Los enlaces de compra están en la [lista de compra](../LISTA-DE-COMPRA.md) y cómo se conecta cada uno, en [CABLEADO](../CABLEADO.md).

**Revisión del 13-11-2026:** [REVISION-13-11-2026.md](REVISION-13-11-2026.md) repasa todos los componentes y cómo se comportan entre sí (qué se queda, qué cambia, fallos a dos años y pruebas de banco). Sus cuentas se repiten con [`cuentas.py`](cuentas.py). Las fichas del 21-10-2026 no se han reescrito: donde una ficha y la revisión no coincidan, manda la revisión.

| # | Componente | Función | Ficha |
|---|---|---|---|
| 1 | Raspberry Pi 3 Model B+ | Ordenador principal: sensor, pantalla, cámara y pago | [raspberry-pi-3b-plus](raspberry-pi-3b-plus/README.md) |
| 2 | SanDisk High Endurance microSDHC 32 GB | Almacenamiento: sistema operativo y programa | [sandisk-high-endurance-32gb](sandisk-high-endurance-32gb/README.md) |
| 3 | Raspberry Pi Camera Module 3 (estándar) | Foto al usuario | [raspberry-pi-camera-module-3](raspberry-pi-camera-module-3/README.md) |
| 5 | GeeekPi pantalla IPS 7", 1024×600, HDMI | Pantalla del usuario (instrucciones, cuenta atrás, resultado) | [pantalla-geeekpi-7-hdmi](pantalla-geeekpi-7-hdmi/README.md) |
| 6 | Winsen ZE29A (alcohol en aliento) | Mide el alcohol: módulo de prueba de aliento por UART | [winsen-ze29a](winsen-ze29a/README.md) |
| 7 | Cables JST-XH de 4 pines | Clavija del sensor ZE29A | [cables-jst-xh-4-pin](cables-jst-xh-4-pin/README.md) |
| 8 | Tubo de silicona de 6 mm | Lleva el aliento de la boquilla al sensor | [tubo-silicona-6mm](tubo-silicona-6mm/README.md) |
| 9 | SumUp Solo con base de carga | Cobro con tarjeta (Cloud API) | [sumup-solo](sumup-solo/README.md) |
| 10 | Cable USB-A a USB-C acodado 90°, 30 cm | Alimenta el SumUp Solo desde el borne USB-A | [cable-usb-a-usb-c-90-30cm](cable-usb-a-usb-c-90-30cm/README.md) |
| 12 | Módem 4G USB Huawei E3372h-320 (HiLink) | Internet de la Pi con una SIM de datos. Anuncio elegido el 13-11-2026 | [modem-4g-huawei-e3372h](modem-4g-huawei-e3372h/README.md) |
| 13 | Antena 4G plana (FPC) y latiguillo CRC9 → SMA | Antena del módem, pegada dentro del cajón detrás de una ventana. Solo si la prueba de cobertura la elige frente al módem detrás de la ventana | [antena-4g-plana-fpc](antena-4g-plana-fpc/README.md) |
| 14 | Fuente Mean Well LRS-50-5 (5 V, 10 A) | Fuente única de 5 V de la máquina (230 V) | [meanwell-lrs-50-5](meanwell-lrs-50-5/README.md) |
| 15 | Toma C14 con portafusibles, sin interruptor (cambiada el 25-10-2026; la ficha estudió la de interruptor) | Entrada de red 230 V de la máquina | [modulo-c14-fusible-interruptor](modulo-c14-fusible-interruptor/README.md) |
| 16 | Fusibles cerámicos 5×20 T2,5A | Protección de la entrada de red | [fusibles-ceramicos-5x20-t2-5a](fusibles-ceramicos-5x20-t2-5a/README.md) |
| 17 | Cable de red Schuko a C13, 2 m | Conecta la máquina a la toma de pared | [cable-schuko-c13-2m](cable-schuko-c13-2m/README.md) |
| 18 | Borne USB-A hembra con tornillos (x2) | Da 5 V al SumUp Solo y a la pantalla desde la WAGO | [borne-usb-a-hembra-tornillo](borne-usb-a-hembra-tornillo/README.md) |
| 20 | Bornas WAGO 221, surtido de 75 | Reparte el raíl de 5 V (+5 V y GND) y hace todos los empalmes | [wago-221-surtido](wago-221-surtido/README.md) |
| 21 | Cable bipolar 2 × 0,75 mm² rojo/negro, 10 m | Troncal y ramas del raíl de 5 V | [cable-2x0-75-rojo-negro-10m](cable-2x0-75-rojo-negro-10m/README.md) |
| 22 | Manguera H05VV-F 3G1,5 mm², 5 m | Cableado interno de 230 V y tierra | [cable-h05vv-f-3g1-5-5m](cable-h05vv-f-3g1-5-5m/README.md) |
| 23 | Terminales de ojal M4 aislados 0,5-1,5 mm² (25 uds.) | Terminan los cables de tierra en el espárrago M4 | [terminales-ojal-m4](terminales-ojal-m4/README.md) |
| 24 | Arandelas dentadas M4 (200 uds.) | Bloqueo y contacto de la tierra en el espárrago | [arandelas-dentadas-m4](arandelas-dentadas-m4/README.md) |
| 25 | Espárragos M4 × 20 inox para soldar (20 uds.) | Punto de tierra de 230 V soldado a la chapa | [esparragos-soldar-m4x20](esparragos-soldar-m4x20/README.md) |
| 26 | Surtido de tornillería inox M3 a M6 | Fijaciones generales (fuente, toma C14, pantalla...) | [tornilleria-inox-m3-m6](tornilleria-inox-m3-m6/README.md) |
| 27 | Kit de terminales faston aislados 2,8 / 4,8 / 6,3 mm | Conexiones de la toma C14 | [kit-faston-aislados](kit-faston-aislados/README.md) |
| 28 | Crimpadora autoajustable + 1250 punteras | Punteras en los bornes de la fuente y de las WAGO. No vale para faston ni ojales (ver la 40) | [crimpadora-y-punteras](crimpadora-y-punteras/README.md) |
| 30 | Separadores hexagonales de nailon M2,5 (kit de 350) | Fijan la Pi (y el sensor) a la caja interior sin unir masas | [separadores-nylon-m2-5](separadores-nylon-m2-5/README.md) |
| 31 | Pasacables de goma, surtido de 7 tamaños (260 uds.) | Protegen los cables en los agujeros de la chapa | [pasacables-goma](pasacables-goma/README.md) |
| 33 | Placa de bornes para el GPIO de 40 pines | Por ella entra la alimentación de la Pi; bornes para la UART y los tacómetros. Nueva el 13-11-2026 | [placa-bornes-gpio](placa-bornes-gpio/README.md) |
| 34 | Ventilador Noctua NF-A4x10 5V (x2) | Uno mete aire junto al Solo y el sensor y otro lo saca por la caja de red. Nuevos el 13-11-2026 | [ventilador-noctua-nf-a4x10-5v](ventilador-noctua-nf-a4x10-5v/README.md) |
| 35 | Portafusibles MINI en línea y fusibles MINI de cuchilla | Un fusible en el +5 V del troncal y de cada rama: 5 A troncal, 3 A Pi, 2 A pantalla, Solo, sensor y ventiladores | [portafusibles-mini-en-linea](portafusibles-mini-en-linea/README.md) |
| 36 | Condensador electrolítico de 2200 µF | En el reparto de 5 V: rizado de la fuente a baja carga. Nuevo el 13-11-2026 | [condensador-2200uf](condensador-2200uf/README.md) |
| 37 | Resistencias de 1 kΩ (x2) | En serie en cada hilo de la UART. Nuevas el 13-11-2026 | [resistencias-1k](resistencias-1k/README.md) |
| 38 | Filtro de jeringa de PTFE hidrófobo (x2) | Uno en cada toma del sensor: para el líquido que entre por la boquilla. Nuevos el 13-11-2026, sin validar | [filtro-ptfe-hidrofobo](filtro-ptfe-hidrofobo/README.md) |
| 39 | Alargador USB 2.0 | Para probar el módem detrás de la ventana. Nuevo el 13-11-2026 | [alargador-usb](alargador-usb/README.md) |
| 40 | Crimpadora de carraca para terminales preaislados | Herramienta para los faston y los ojales. Nueva el 13-11-2026 | [crimpadora-terminales-aislados](crimpadora-terminales-aislados/README.md) |

No hay número 11: era el pulsador de inicio y se quitó porque la máquina no lleva botón (el SumUp Solo está siempre esperando tarjeta, ver [DECISIONES](../DECISIONES.md)).

Tampoco hay 4, 19, 29 ni 32: se retiraron el 13-11-2026 (abajo).

## Carcasa: componentes propuestos (no incluidos en los eléctricos)

| Estado | Componente | Función | Ficha |
|---|---|---|---|
| **Pendiente de comprar y validar** | **Permabond TA4204**, adhesivo estructural transparente bicomponente | Fijación interior de las ventanas de policarbonato de 5 mm / metacrilato a la carcasa metálica; requiere ensayo de compatibilidad y retención mecánica | [adhesivo-permabond-ta4204](adhesivo-permabond-ta4204/README.md) |

Lo que las fichas dejan abierto (decisiones, medidas por hacer y documentos que faltan) está reunido en [pendientes.md](pendientes.md).

Cada ficha indica de dónde sale cada dato y marca lo que no está verificado. Los enlaces a PDF y páginas están reunidos en el `enlaces.md` de cada carpeta.

**Retirados el 01-11-2026** (en [retirados](retirados/)): el adaptador Wi-Fi AR9271 y el alargo de antena RP-SMA, que sacaban la antena por fuera de la chapa.

**Retirados el 13-11-2026** (en [retirados](retirados/)): el [cable FFC de 50 cm](retirados/cable-ffc-camara-50cm/README.md) (4; se usa la cinta que trae la cámara), el [latiguillo micro-USB](retirados/latiguillo-micro-usb-22awg/README.md) (19; la Pi entra por la placa de bornes; queda como plan B), los [cables Dupont](retirados/cables-dupont-elegoo-120/README.md) (29; la UART va a bornes) y los [portafusibles de 5 × 20 con fusibles de vidrio](retirados/portafusibles-en-linea-5x20/README.md) (32; sustituidos por los MINI).
