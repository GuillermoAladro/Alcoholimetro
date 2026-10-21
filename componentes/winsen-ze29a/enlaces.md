# Enlaces guardados: Winsen ZE29A-C2H5OH

Todas las páginas consultadas para la [ficha](README.md), reunidas el 21-10-2026. "Leído" significa que mi herramienta devolvió el contenido (resumido, no descargado). "No abierto" significa que el enlace salió en una búsqueda o en otra página y no lo abrí.

## Winsen: producto y manual del ZE29A

- [Manual V1.1 del ZE29A-C2H5OH (PDF)](https://www.winsen-sensor.com/d/files/manual/ze29a-c2h5oh.pdf). Leído tres veces con preguntas distintas. Sin fecha ni historial de revisiones.
- [Ficha del producto](https://www.winsen-sensor.com/product/ze29a-c2h5oh.html). Leída. Menciona un interfaz 1602 reservado y "rich communication interfaces".
- [Misma ficha en otra ruta](https://winsen-sensor.com/sensors/alcohol-sensor/ze29a-c2h5oh.html). Salió en búsqueda; no abierta.
- [Lista de sensores de alcohol de Winsen](https://winsen-sensor.com/alcohol-sensor). Leída (ZE29A, ZE30, ZE31, ME2, MQ-3B, MQ303B, MP-3B, GM-302B/C).
- [Centro de descargas de Winsen](https://www.winsen-sensor.com/newdownload/). Solo vi el enlace; no abierto.
- [Tienda de Winsen: ZE29A, 58,00 USD](https://shop.winsen-sensor.com/products/ze29a-c2h5oh-electrochemical-alcohol-module). Leída. Sin descargas ni especificaciones.
- [Tienda de Winsen: ZE30-C2H5OH, 5 unidades](https://shop.winsen-sensor.com/products/electrochemical-alcohol-module-ze30-c2h5oh). Leída. La página dice ser un módulo de 0–5 ppm; las etiquetas meta describen por error un MQ-2.
- [Página del ZE31-C2H5OH](https://www.winsen-sensor.com/product/ze31-c2h5oh.html). Leída. Manual enlazado, no abierto: [ze31-c2h5oh.pdf](https://www.winsen-sensor.com/d/files/manual/ze31-c2h5oh.pdf).
- [Página del ZE30-C2H5OH](https://www.winsen-sensor.com/product/ze30-c2h5oh.html), [MQ-3B](https://www.winsen-sensor.com/product/mq-3b.html). Solo enlaces de la lista; no abiertos.

## Copias del manual

- [Copia en robu.in (ZE29A-DATASHEET.pdf)](https://robu.in/wp-content/uploads/2023/02/ZE29A-DATASHEET.pdf). Leída; V1.1, mismas cifras.
- [Copia HTML en manuals.plus](https://manuals.plus/winsen/ze29a-c2h5oh-alcohol-sensor-module-manual). Leída; sin versión, apartado "Dimension" vacío.
- [robu.in, página `?p=1209992`](https://robu.in/?p=1209992). Resultó ser la portada de la tienda, sin datos del producto.

## Celdas hermanas (ME2) y otros manuales de Winsen

- [ME2-C2H5OH-Ф16, V1.2 (PDF)](https://www.winsen-sensor.com/d/files/manual/me2-c2h5oh-%D1%8416.pdf). Leído. En la búsqueda salió como `me2-c2h5oh-ф16.pdf`.
- [ME2-C2H5OH-13×13, V1.2, 26-7-2022 (PDF)](https://www.winsen-sensor.com/d/files/manual/me2-c2h5oh-13%C3%9713.pdf). Leído. En la búsqueda salió como `me2-c2h5oh-13×13.pdf`.
- [ZE03, manual V2.8 (2021-08-04), vía robu.in](https://robu.in/wp-content/uploads/2023/11/SKU766673.pdf). Leído; **no es el ZE29A**, solo se usó para las precauciones generales de la serie ZE.
- [ZE03, manual V2.6 (2019-04-16), vía chipdip](https://static.chipdip.ru/lib/091/DOC036091016.pdf) y [ZE08-CH2O, vía chipdip](https://static.chipdip.ru/lib/395/DOC036395650.pdf). Abiertos; **no son el ZE29A** y no se usan.

## Protocolo y ejemplos de código

- [Foro de Arduino: "Alkoholtestsensor Ze29a-c2h5oh mit Arduino verbinden und Daten lesen"](https://forum.arduino.cc/t/alkoholtestsensor-ze29a-c2h5oh-mit-arduino-verbinden-und-daten-lesen/1344484). Leído dos veces. Contiene la trama `87 32` con checksum `48` errónea (mensaje 15). No hay mediciones reales.
- [Simulador de Wokwi (ec2021)](https://wokwi.com/projects/420594289441266689). Leído. Es un simulador, no hardware real.
- [Otro proyecto de Wokwi](https://wokwi.com/projects/420536876646490113). Salió en búsqueda; no abierto.

## Ofertas y módulos con los que se puede confundir

- [OnBuy: "Alcohol Gas Concentration Sensor … Breathalyzer Module"](https://www.onbuy.com/gb/p/alcohol-gas-concentration-sensor-high-sensitivity-breathalyzer-module-vehicle-detection-diy-projects~p251393083/). Leído. No es un ZE29A (0–5 ppm, I2C/UART).
- [Farnell: DFRobot SEN0376 Gravity Alcohol Sensor](https://uk.farnell.com/dfrobot/sen0376/gravity-alcohol-sensor/dp/3769863). Leído. 0–5 ppm.
- [Mouser: DFRobot Gravity Alcohol Sensor](https://www.mouser.in/new/dfrobot/dfrobot-gravity-alcohol-sensor/). Salió en búsqueda; no abierto.
- [Forensics Detectors: FD-Alcohol-SENSOR](https://www.forensicsdetectors.com/en-es/products/alcohol-sensor). Leído. Sensor ambiental de 0–100 ppm, 195 €; se usó solo como ejemplo de tabla de sensibilidad cruzada de una celda electroquímica de etanol (no es una celda de aliento).
- **Amazon.es, ASIN B0H8NVXVG5:** no accesible (Amazon bloquea a mi herramienta). Una búsqueda por el ASIN no devolvió nada relacionado.
- **Mouser, DigiKey, AliExpress:** no encontré el ZE29A. [Página de proveedor de Dart en DigiKey](https://www.digikey.com/en/supplier-centers/dart-sensors): abierta; no listaba sensores de alcohol.

## Tecnología de celdas de combustible y referencias de la industria

- [Dart Sensors: hoja de datos de celdas de aliento de 16 mm](https://www.dart-sensors.com/wp-content/uploads/2021/10/16mm_breath_alcohol_sensor_product_datasheet.pdf). Leída dos veces.
- [Dart Sensors en Made in Britain](https://www.madeinbritain.org/members/dart-sensors). Salió en búsqueda; no abierto.
- [Intoximeters: libro blanco de celdas de combustible](https://www.intox.com/fuel-cell-white-paper/). Leído.
- [Alcopro: ¿responde el Alco-Sensor a las cetonas diabéticas?](https://alcopro.com/?p=19267). Leído. [Alcopro: hechos sobre celdas de combustible](https://alcopro.com/fuel-cell-facts/): no abierto.
- [NHTSA DOT HS 806 922 (1985): interferencia de acetona](https://rosap.ntl.bts.gov/view/dot/1406/dot_1406_DS1.pdf). Leído.
- [Dräger Alcotest 7000](https://www.draeger.com/en_uk/Products/Alcotest-7000). Leída (calibración cada 12 meses).
- [AlcoSense: calibración y servicio](https://www.alcosense.co.uk/alcosense/calibration-and-servicing.html). Leída (recalibrar cada 12 meses, 23,99 £). Otras páginas de AlcoSense/Halfords sobre calibración salieron en búsqueda; no abiertas.
- [Manual técnico Dräger Alcotest 9510 (Washington)](https://wsp.wa.gov/breathtest/docs/webdms/Draeger/Tech_Man/Draeger%20Alcotest%209510%20Technical%20Manual%20WA%20State%20Version%203.2.pdf). Salió en búsqueda; no abierto.
- Lion Alcolmeter: **no encontré fuente**.

## Normativa: España, UE y metrología

- [BOE: Orden ITC/3707/2006, texto original (PDF)](https://www.boe.es/boe/dias/2006/12/07/pdfs/A42985-42990.pdf). Leído.
- [BOE: ITC/3707/2006 consolidada (derogada)](https://www.boe.es/eli/es/o/2006/11/22/itc3707/con). Leída.
- [iberley: copia de la ITC/3707/2006](https://www.iberley.es/legislacion/orden-itc-3707-2006-22-noviembre-regula-control-metrologico-estado-instrumentos-destinados-medir-concentracion-alcohol-aire-espirado-4156772). Leída. La marca "vigente"; **contradice al BOE**.
- [BOE: Orden ICT/155/2020 (ELI)](https://www.boe.es/eli/es/o/2020/02/07/ict155/con) y [PDF BOE-A-2020-2573](https://www.boe.es/boe/dias/2020/02/24/pdfs/BOE-A-2020-2573.pdf). Leídos solo en parte: **la herramienta cortó el texto antes del Anexo XIII**.
- [Junta de Andalucía: listado de instrumentos con control metrológico (marzo de 2026)](https://juntadeandalucia.es/sites/default/files/2026-03/20260323.INSTRUMENTOS_CONTROL_METROLOGICO.pdf). Leído; fuente de "etilómetros, Anexo XIII, verificación 1 año".
- [Compilación sobre el Anexo XIII y los errores máximos (causadirecta.com)](https://mail.causadirecta.com/ficheros/ICT-155_EMP%20Etil%C3%B3metros.pdf). Leída. Fuente secundaria que mezcla normas.
- [BOE: Orden ITC/3748/2006 (contadores de máquinas recreativas, derogada)](https://www.boe.es/eli/es/o/2006/11/22/itc3748/con). Leída. **No es la de etilómetros**; la menciono solo para evitar la confusión (mi herramienta devolvió su contenido al pedirle otra referencia del BOE).
- [Eroski Consumer (2007): alcoholímetros en locales de ocio](https://www.consumer.es/?p=33931). Leído. Anterior a la ICT/155/2020.
- [Directiva 2014/32/UE explicada (euronorm.net)](https://www.euronorm.net/content/ce-marking/directives/explanation/2014-32-eu.php). Leída; fuente secundaria. Texto oficial de la directiva en [EUR-Lex](https://eur-lex.europa.eu/eli/dir/2014/32/2015-01-27/eng): salió en búsqueda; no abierto.
- [OIML R 126 (2012)](https://www.oiml.org/en/files/pdf_r/r126-e12.pdf). Leído.
- [tuteorica.com: art. 20 RGC, tasas de alcohol](https://tuteorica.com/normativa-de-trafico/rgc/tasas-de-alcohol-en-sangre-y-aire-espirado-art-20-rgc/). Leído; fuente secundaria. BOE del Reglamento General de Circulación: **no abierto**.

## Normativa china (de dónde parecen salir las unidades del módulo)

- [chinesestandard.net: GB/T 21254-2017 (etilómetros)](https://www.chinesestandard.net/Related.aspx/GBT21254-2017). Leída; fuente de BAC = BrAC × 2200 (cláusula 4.1.5).
- [Abogados (huichenglawyer.com): GB 19522-2010, umbrales 20 y 80 mg/100 mL](https://www.huichenglawyer.com/pufaku/84863.html). Leída.
- [chinesestandard.net: GB 19522-2024](https://www.chinesestandard.net/PDF.aspx/GB19522-2024). Salió en búsqueda; no abierto.

## Cómo me ayudó la búsqueda (limitaciones)

- Mi presupuesto de búsquedas web se agotó antes de buscar: placa "WS19", AliExpress/Mouser/DigiKey, GitHub y foros sobre la serie ZE, siloxanos en celdas electroquímicas, Lion/Alphasense/SGX.
