# Lista de compra (diseño A)

**Es la única lista de compra vigente** (13-11-2026). Sustituye a la [lista del 20-10-2026](historico/LISTA-DE-COMPRA-20-10-2026.md). Sale de la [revisión de componentes del 13-11-2026](componentes/REVISION-13-11-2026.md), que explica por qué se queda, entra o sale cada pieza.

- **Regla del proyecto:** todo se tiene que poder pedir en Amazon.es. Enlace de cada pieza: `https://www.amazon.es/dp/<ASIN>`.
- **Precios:** los de las piezas que ya estaban se vieron en Amazon.es entre el 19 y el 25-10-2026. **El 13-11-2026 no se pudo leer Amazon.es:** los precios de las piezas nuevas son estimaciones o de otra tienda, y está dicho en cada línea.
- **Falta el presupuesto.** Los tres totales (primer pedido, coste real de una máquina y herramientas), la chapa, los herrajes de la carcasa y los gastos que se repiten van en el bloque del presupuesto. Hasta entonces, la hoja de compras de `carcasa/diseno-A/Lista_de_piezas.xlsx` sigue con la lista anterior: **manda esta.**
- **Dos numeraciones:** «Ref.» es la del CAD (`modelo/diseno.py`); «#» es la de las fichas de [`componentes/`](componentes/README.md).

Unidades por máquina.

## 1. Electrónica

| Ref. | # | Pieza | ASIN | Precio | Uds. | Nota |
|---|---|---|---|---|---|---|
| E04 | 1 | Raspberry Pi 3 Model B+ | [B0BNJPL4MW](https://www.amazon.es/dp/B0BNJPL4MW) | 54,90 € | 1 | [ficha](componentes/raspberry-pi-3b-plus/README.md) |
| E21 | 2 | microSD SanDisk High Endurance 32 GB | [B07P14QHB7](https://www.amazon.es/dp/B07P14QHB7) | 20,49 € | 1 | [ficha](componentes/sandisk-high-endurance-32gb/README.md) |
| E24 | 33 | **Placa de bornes para el GPIO de 40 pines** | por elegir | 14 € (estimación) | 1 | Nueva. Por ella entra la alimentación de la Pi. [ficha](componentes/placa-bornes-gpio/README.md) |
| E03 | 3 | Raspberry Pi Camera Module 3, estándar | [B0BRY6MVXL](https://www.amazon.es/dp/B0BRY6MVXL) | 48,04 € | 1 | Con su cinta de 200 mm. [ficha](componentes/raspberry-pi-camera-module-3/README.md) |
| E01 | 5 | Pantalla GeeekPi 7" 1024 × 600 HDMI | [B0CHMBCCJB](https://www.amazon.es/dp/B0CHMBCCJB) | 45,99 € | 1 | Condicionada a la prueba B. [ficha](componentes/pantalla-geeekpi-7-hdmi/README.md) |
| E16 | — | Cable HDMI acodado de 30 cm | [B09XHW8C8W](https://www.amazon.es/dp/B09XHW8C8W) | 8,09 € | 1 | |
| E02 | 9 | SumUp Solo | [B0C9V3LXTF](https://www.amazon.es/dp/B0C9V3LXTF) | 72,18 € | 1 | Nuevo y precintado. Condicionado a las pruebas A1 a A3. [ficha](componentes/sumup-solo/README.md) |
| E17 | 10 | Cable USB-A → USB-C acodado, 30 cm | [B0C8FS5FV2](https://www.amazon.es/dp/B0C8FS5FV2) | 4,99 € | 2 | Solo y pantalla. [ficha](componentes/cable-usb-a-usb-c-90-30cm/README.md) |
| E11 | 6 | Sensor de alcohol Winsen ZE29A | [B0H8NVXVG5](https://www.amazon.es/dp/B0H8NVXVG5) | 108,46 € | 1 | [ficha](componentes/winsen-ze29a/README.md) |
| E19 | 7 | Cable JST-XH de 4 pines | [B0CBWZNP6Z](https://www.amazon.es/dp/B0CBWZNP6Z) | 8,99 € | 1 | Medir el conector del sensor al recibirlo. [ficha](componentes/cables-jst-xh-4-pin/README.md) |
| E27 | 37 | **Resistencias de 1 kΩ**, 1/4 W, película metálica | por elegir | 6 € el lote (estimación) | 2 | Nuevas. En la UART. [ficha](componentes/resistencias-1k/README.md) |
| E05 | 12 | Módem 4G Huawei **E3372h-320** | [**B085RDTZMP**](https://www.amazon.es/dp/B085RDTZMP) | unos 48 € (47,99 € en Amazon.nl el 13-11; Amazon.es sin leer) | 1 | **Devolver si llega el E3372-325.** [ficha](componentes/modem-4g-huawei-e3372h/README.md) |
| E12 | 13 | Antena 4G plana adhesiva, 698–2700 MHz, con SMA macho | por elegir | 10 € (estimación) | 1 | Solo para la prueba de cobertura. [ficha](componentes/antena-4g-plana-fpc/README.md) |
| E23 | 13 | Latiguillo CRC9 macho → SMA hembra, 15 cm | por elegir | 8 € (estimación) | 1 | Solo para la prueba de cobertura |
| E28 | 39 | **Alargador USB 2.0** A macho → A hembra, 15 a 30 cm | por elegir | 6 € (estimación) | 1 | Nuevo. Para probar el módem detrás de la ventana. [ficha](componentes/alargador-usb/README.md) |
| E25 | 34 | **Ventilador Noctua NF-A4x10 5V** | [**B00NEMGCIA**](https://www.amazon.es/dp/B00NEMGCIA) | unos 16 € (16,95 € en Coolmod el 13-11; Amazon.es sin leer) | 2 | Nuevos. [ficha](componentes/ventilador-noctua-nf-a4x10-5v/README.md) |
| E31 | — | Rejilla metálica de ventilador de 40 mm, con malla | por elegir | 8 € (estimación) | 2 | Nueva |

## 2. Soplido

| Ref. | # | Pieza | ASIN | Precio | Uds. | Nota |
|---|---|---|---|---|---|---|
| E13 | 8 | Tubo de silicona de 6 mm, 1 m | [B0D9FJY1SG](https://www.amazon.es/dp/B0D9FJY1SG) | 6,99 € | 0,4 m | [ficha](componentes/tubo-silicona-6mm/README.md) |
| E14 | — | T para tubo de 6 mm | [B0GT5XPRWK](https://www.amazon.es/dp/B0GT5XPRWK) | 4,74 € | 2 | Toma de presión y toma de alcohol |
| E15 | — | Reductor de latón 6 → 4 | [B0H38RDVZR](https://www.amazon.es/dp/B0H38RDVZR) | 8,20 € | 2 | La barrera que crea la presión |
| E29 | 38 | **Filtro de jeringa de PTFE hidrófobo**, 25 mm, 0,45 µm | por elegir | 10 € el lote (estimación) | 2 | Nuevos. Uno en cada toma del sensor. [ficha](componentes/filtro-ptfe-hidrofobo/README.md) |
| E30 | — | Tubo de 4 mm y racores para las tomas del sensor | por elegir | 10 € (estimación) | — | Se eligen al medir las tomas del módulo |

## 3. Alimentación y protección

| Ref. | # | Pieza | ASIN | Precio | Uds. | Nota |
|---|---|---|---|---|---|---|
| E06 | 14 | Fuente Mean Well LRS-50-5 | [B06XWRCWZ9](https://www.amazon.es/dp/B06XWRCWZ9) | 18,52 € | 1 | Ajustada a 5,10 V. [ficha](componentes/meanwell-lrs-50-5/README.md) |
| E07 | 15 | Toma C14 con portafusibles, sin interruptor | [B07CQ54BY4](https://www.amazon.es/dp/B07CQ54BY4) | 8,03 € | 1 | Precio de la tienda del fabricante. [ficha](componentes/modulo-c14-fusible-interruptor/README.md) |
| M01 | 16 | Fusibles cerámicos 5 × 20 T2,5A (10 uds.) | [B0956XYTN6](https://www.amazon.es/dp/B0956XYTN6) | 9,99 € | 1 o 2 | [ficha](componentes/fusibles-ceramicos-5x20-t2-5a/README.md) |
| M14 | — | Portafusibles de 5 × 20 para 250 V | por elegir | 6 € (estimación) | 0 o 1 | Solo si lo pide el electricista |
| E22 | 17 | Cordón Schuko → C13, 2 m | [B00AOAJAUC](https://www.amazon.es/dp/B00AOAJAUC) | 7,00 € | 1 | [ficha](componentes/cable-schuko-c13-2m/README.md) |
| E10 | 35 | **Portafusibles MINI en línea** | [B07Q495GQG](https://www.amazon.es/dp/B07Q495GQG) | 9,49 € | **6** | Antes 4. Mirar cuántos trae el paquete. [ficha](componentes/portafusibles-mini-en-linea/README.md) |
| E20 | 35 | **Fusibles MINI**, kit | [B0BMGBBPTT](https://www.amazon.es/dp/B0BMGBBPTT) | 15,99 € | 1 de 5 A, 1 de 3 A y 4 de 2 A | Comprobar que trae de 5 A |
| E26 | 36 | **Condensador electrolítico** 2200 µF, 16 V o más, 105 °C, baja ESR | por elegir | 8 € el lote (estimación) | 1 | Nuevo. [ficha](componentes/condensador-2200uf/README.md) |
| E09 | 18 | Borne USB-A hembra a tornillo (2 uds.) | [B07V86XPL4](https://www.amazon.es/dp/B07V86XPL4) | 10,99 € | 2 | [ficha](componentes/borne-usb-a-hembra-tornillo/README.md) |
| E08 | 20 | WAGO 221, surtido de 75 | [B09XB58ZXJ](https://www.amazon.es/dp/B09XB58ZXJ) | 27,08 € | 2 de 5 vías, 5 de 3 y unas 6 de 2 | [ficha](componentes/wago-221-surtido/README.md) |

## 4. Cableado y terminales

| Ref. | # | Pieza | ASIN | Precio | Uds. | Nota |
|---|---|---|---|---|---|---|
| M02 | 21 | Cable 2 × 0,75 mm² rojo y negro, 10 m | [B0D12QPF4Y](https://www.amazon.es/dp/B0D12QPF4Y) | 14,10 € | 1,5 m | [ficha](componentes/cable-2x0-75-rojo-negro-10m/README.md) |
| M03 | 22 | Manguera H05VV-F 3G1,5 mm², 5 m | [B07BDHJGKG](https://www.amazon.es/dp/B07BDHJGKG) | 27,74 € | 1 m | 230 V y tierra. [ficha](componentes/cable-h05vv-f-3g1-5-5m/README.md) |
| M04 | 23 | Ojales M4 (25 uds.) | [B0CVW7Y2P4](https://www.amazon.es/dp/B0CVW7Y2P4) | 5,52 € | 8 | [ficha](componentes/terminales-ojal-m4/README.md) |
| M05 | 24 | Arandelas dentadas M4 (200 uds.) | [B0B77J5FZS](https://www.amazon.es/dp/B0B77J5FZS) | 7,99 € | 6 | [ficha](componentes/arandelas-dentadas-m4/README.md) |
| M07 | 27 | Faston aislados, kit | [B0B4H54KPS](https://www.amazon.es/dp/B0B4H54KPS) | 10,99 € | 3 | Solo en la C14. [ficha](componentes/kit-faston-aislados/README.md) |
| M11 | — | Punteras dobles de 2 × 0,75 y 2 × 1,5 mm² | por elegir | 8 € (estimación) | 2 | Nuevas. Bornes 4 y 5 de la fuente |
| M15 | — | Bridas, bases adhesivas y cinta Kapton | por elegir | 8 € (estimación) | — | Nuevas. Sujetan cada conector de fricción |

## 5. Tornillería y montaje

| Ref. | # | Pieza | ASIN | Precio | Uds. | Nota |
|---|---|---|---|---|---|---|
| H07 | 25 | Espárragos M4 × 20 inox para soldar (20 uds.) | [B0GSCLY4D7](https://www.amazon.es/dp/B0GSCLY4D7) | 8,40 € | — | Tierra y soportes. [ficha](componentes/esparragos-soldar-m4x20/README.md) |
| M06 | 26 | Tornillería inox M3–M6, surtido | [B0BGRY2JGX](https://www.amazon.es/dp/B0BGRY2JGX) | 11,99 € | — | [ficha](componentes/tornilleria-inox-m3-m6/README.md) |
| M12 | — | Tornillos M2 × 12 avellanados con tuerca, inox | por elegir | 8 € el kit (estimación) | 4 | Nuevos. Cámara |
| H08 | — | Separadores de nailon M2 | [B0FVLLN788](https://www.amazon.es/dp/B0FVLLN788) | 8,99 € | 4 | Cámara |
| H09 | 30 | Separadores de nailon M2,5 (350 uds.) | [B0G4G7WQRM](https://www.amazon.es/dp/B0G4G7WQRM) | 9,99 € | 8 | Pi y placa de bornes. [ficha](componentes/separadores-nylon-m2-5/README.md) |
| H10 | 31 | Pasacables de goma (260 uds.) | [B0B5DLWVZ2](https://www.amazon.es/dp/B0B5DLWVZ2) | 7,99 € | — | [ficha](componentes/pasacables-goma/README.md) |
| M13 | — | Tapa de los bornes de la fuente | — | 0 € | 1 | Pieza de policarbonato de 2 mm, de la placa H19. Entra en el CAD |

## 6. Herramientas (una sola vez)

| Ref. | # | Pieza | ASIN | Precio | Nota |
|---|---|---|---|---|---|
| M09 | 28 | Crimpadora de punteras con 1250 punteras | [B0FQP6KDL4](https://www.amazon.es/dp/B0FQP6KDL4) | 15,98 € | [ficha](componentes/crimpadora-y-punteras/README.md) |
| M10 | 40 | **Crimpadora de carraca para terminales preaislados** (rojo, azul y amarillo, 0,5–6 mm²) | por elegir | 22 € una genérica (estimación); la Knipex 97 52 36 cuesta de 92 a 113 € en tiendas | Nueva. La de punteras no vale para faston ni ojales. [ficha](componentes/crimpadora-terminales-aislados/README.md) |

## 7. Carcasa, herrajes y anclaje

Los herrajes de la carcasa (silentblocks, topes, cerradura, bisagra, policarbonatos, tornillos de seguridad, candados) y el anclaje a la pared siguen en la hoja de compras de `carcasa/diseno-A/Lista_de_piezas.xlsx`. Se revisan con la carcasa y con el anclaje.

**Adhesivo de los policarbonatos, sin decidir.** Hay una propuesta de pegarlos con Permabond TA4204 ([ficha](componentes/adhesivo-permabond-ta4204/README.md); 34,00 € el cartucho en Lijmenwinkel el 03-11-2026, fuera de Amazon, sin comprar ni validar). Tornillos, adhesivo o las dos cosas es decisión de Guillermo y se plantea con la carcasa.

## 8. Salen de la lista

| # | Pieza | ASIN | Por qué |
|---|---|---|---|
| 19 | Latiguillo micro-USB de 22 AWG | B0DP2NT8LY | La Pi entra por la placa de bornes. Queda como plan B |
| 29 | Cables Dupont | B01NGTXASZ | La UART va a bornes |
| 32 | Portafusibles 5 × 20 en línea con fusibles de vidrio | B07KQ46H6K | Sustituidos por los MINI |
| 4 | Cable FFC de 50 cm | B07DKB4M1H | Se usa la cinta que trae la cámara |

Sus fichas están en [`componentes/retirados/`](componentes/retirados/).

## 9. De reserva, sin comprar

- **Microservo MG90S**, para pulsar el botón del SumUp Solo si no arranca solo tras un corte de luz (prueba A1).
- **Módulo de relé de 5 V**, para cortar la alimentación de la pantalla si no se apaga al quitarle el HDMI (prueba B).
- **Raspberry Pi Touch Display 2 de 7"**, si la pantalla GeeekPi no pasa la prueba B.
- **Raspberry Pi 4B de 2 GB**, si la 3B+ no mueve los vídeos con soltura (prueba C1).

## 10. No se compra en Amazon

- **SIM de datos** para el módem. De varios gigas al mes: solo las consultas a SumUp son del orden de 1 GB (estimación).
