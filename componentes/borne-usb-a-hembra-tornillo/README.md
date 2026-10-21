# Borne USB-A hembra con terminales de tornillo (placa breakout, 2 unidades)

Placa con un conector USB-A hembra y bornes de tornillo para sacar sus cuatro señales (VCC, D−, D+, GND). Hay **dos por máquina**: una da los 5 V al SumUp Solo (con el cable USB-A→USB-C acodado de la ficha #10) y la otra a la pantalla (con el cable USB que trae la pantalla). Se alimentan desde la regleta WAGO con cable de 0,75 mm² en VCC y GND, y llevan **D+ y D− unidos** con un puente para que el puerto parezca un cargador dedicado.

- **Compra:** ASIN B07V86XPL4, 10,99 € por 2 unidades (precio de la hoja de componentes del 19-20-10-2026; la hoja anota "Quedaban 4").
- **Dónde va (guía de montaje, §5.2):** regleta WAGO (5,20 V) → **este borne** → cable USB-A→USB-C → Solo / pantalla.

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta, así que no he podido ver el anuncio: el precio y la referencia son los de tu hoja. Una búsqueda del ASIN en la web no devolvió nada relacionado. **Marca, paso del bornero, calibre de cable admitido, orden real de los bornes, grosor de las pistas, corriente nominal y protecciones de tu placa son desconocidos.**

Es una pieza genérica sin datasheet. Esta ficha documenta qué dicen los conectores y las placas comparables, qué exige USB al puente D+/D−, qué riesgos tiene en este montaje y qué hay que medir al recibirla.

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

- **Es el eslabón más débil de la rama de 5 V.** La fuente (LRS-50-5) no salta hasta unos 10,6-14,4 A a 5,2 V ([ficha de la fuente](../meanwell-lrs-50-5/README.md)). Lo que hay entre la regleta y el Solo es un conector USB-A de placa, y los conectores USB-A de ficha están dados para **1 A a 1,5 A** (Kycon, Mill-Max, Molex, Würth; apartado 2). Tres placas "USB-A hembra a bornes" de otras marcas se rotulan para **100 mA** (CamdenBoss) y **500 mA** (Delock; CPC/Farnell, que además dice que es para datos y no para carga). La tuya puede ser distinta, pero **el anuncio no se ha podido leer**.
- **La pantalla encaja; el Solo no está demostrado.** La pantalla se estima en 0,5 A (cifra de otra pantalla; 52Pi recomienda una fuente de 2 A, [ficha de la pantalla](../pantalla-geeekpi-7-hdmi/README.md)). El Solo, según la guía, 0,8 A típico y **2,0 A de pico, ambos estimados**. Un pico de 2,0 A queda por encima de la clasificación de casi todos los USB-A de placa (cálculo, apartado 4.2). Hay que **medir la corriente real** antes de fabricar en serie.
- **El puente D+/D− es una técnica real, pero solo sirve si el aparato la reconoce.** Un cargador dedicado de la especificación USB Battery Charging 1.2 (BC 1.2) une D+ y D− con 200 Ω como máximo, y un cortocircuito directo vale ([Microchip](https://developerhelp.microchip.com/xwiki/bin/view/applications/usb/power-delivery/battery-charging/)). Apple, Samsung y otros usan tensiones en D+/D− en vez del puente ([TI](https://static.chipdip.ru/lib/162/DOC013162143.pdf), [happytrees](https://happytrees.org/USB_charger_data_pins)). **Ninguna fuente dice que el Solo o la pantalla usen BC 1.2.** Sin reconocimiento, el estándar USB deja al aparato en 100 mA.
- **La fuente de 10 A no protege este borne.** Una fuente de tensión da lo que el aparato pide, así que un Solo que ignore el límite de 100 mA o 1,5 A no se frena solo. Un cortocircuito en la placa tampoco lo cortaría la LRS hasta corrientes muy por encima de lo que aguantan las pistas. **Falta un fusible o PTC por rama** (propuesta mía, apartado 8).
- **VCC/GND hay que comprobarlos antes de dar tensión; D+/D− no importan.** Como van unidos por el puente, un D+ y D− intercambiados en la serigrafía son inocuos. Un VCC y GND cruzados no. El orden estándar del USB-A es 1 VBUS, 2 D−, 3 D+, 4 GND ([Wikipedia](https://en.wikipedia.org/wiki/USB_hardware)), pero tu placa puede no seguirlo. La prueba de continuidad del apartado 6 lo comprueba sin tensión.
- **Mecánica: dos puntos débiles típicos.** Los tornillos de bornero se aflojan con vibración y ciclos de temperatura ([JLCPCB](https://jlcpcb.com/blog/pcb-terminal-blocks-guide)). Y los conectores USB-A transmiten a la placa hasta 35 N al enchufar y 10-15 N mínimos al desenchufar según la ficha ([Molex](https://docs.rs-online.com/6a44/A700000008643305.pdf) ([copia local](datasheets/A700000008643305.pdf)), [Kycon](https://www.mouser.in/new/kycon/kycon-high-retention-usb/)); **la fuerza que aguantan sus soldaduras a la placa no está publicada** en ninguna ficha que haya podido abrir. Hay que fijar la placa y sujetar el cable.

### Discrepancias con la guía de montaje y con el enunciado

| Dónde | Qué dice | Qué dicen las fuentes | Valoración |
|---|---|---|---|
| Guía §5.2 | Con D+/D− unidos "el puerto se identifica como cargador y el Solo carga a toda velocidad" | BC 1.2 respalda lo primero (DCP). No hay ningún documento de SumUp que diga que el Solo lo detecte (ya lo marcan las fichas [del Solo](../sumup-solo/README.md) y [del cable](../cable-usb-a-usb-c-90-30cm/README.md)). "A toda velocidad" **no está respaldado** | Suposición sin verificar |
| Guía §3 | Solo: 2,0 A de pico (est.) por este borne | Los receptáculos USB-A de ficha dan 1-1,5 A (los más generosos, 2,5 y 3 A: apartado 2). Placas comparables: 0,1-0,5 A | El pico estimado supera la clasificación habitual |
| Guía §5.2 | Pantalla: "el cable USB-A→USB-C que trae la pantalla" | La [ficha de la pantalla](../pantalla-geeekpi-7-hdmi/README.md) dice que la wiki de 52Pi no aclara si es A→C o C→C. Un cable C→C no encaja en este borne | Sin verificar; mira la caja al recibirla |
| Guía §1 fila 18 | "Toma USB para Solo y pantalla" | Sin anuncio no sé si la placa está pensada para alimentar o solo para datos | Sin verificar |
| Enunciado | "La especificación USB 2.0 y los fabricantes dan 1,5 A por contacto y hasta 3 A en versiones reforzadas" | 1,5 A: Molex, Würth, Kycon (alta retención). **1 A: Kycon KUSBVLPX, Mill-Max.** 3 A: un USB-A de **9 contactos (USB 3.0)** de GCT. No he podido leer el texto de la especificación USB 2.0 | Cierto con matices; el valor depende del modelo |

## 2. Especificaciones

El anuncio no se ha podido leer. La tabla separa lo que se **sabe del tipo de pieza** de lo que se **desconoce de la tuya**.

### 2.1 Datos de tu pieza

| Característica | Valor | Fuente |
|---|---|---|
| Referencia de compra | ASIN B07V86XPL4, 10,99 € por 2 uds. (5,50 € cada una) | Hoja del usuario / guía §1 fila 18 |
| Conectores | 1 USB-A hembra + bornes de tornillo para VCC, D+, D−, GND | Guía §1 y §5.2 |
| Paso del bornero (3,5 / 5,0 / 5,08 mm) | **Sin verificar** | Anuncio no visible |
| Calibre de cable admitido | **Sin verificar.** La guía usa 0,75 mm² | Ver apartado 4.4 |
| Orden y rotulado de los bornes | **Sin verificar** | Ver apartado 4.5 |
| Corriente nominal | **Sin verificar** | |
| Protecciones (fusible reseteable, TVS, LED, diodo) | **Sin verificar.** Las placas comparables que he leído no llevan ninguna | [SparkFun](https://learn.sparkfun.com/tutorials/usb-type-a-female-breakout-hookup-guide/all), [Open Electronics](https://oe2.open-electronics.org/?p=56711), [CamdenBoss](https://www.farnell.com/datasheets/3927991.pdf) ([copia local](datasheets/3927991.pdf)) (no mencionan ninguna) |
| Tamaño, agujeros de fijación, grosor de cobre, ancho de pistas | **Sin verificar** | |
| Blindaje del conector (¿a GND, flotante?) | **Sin verificar** | |

### 2.2 Estándar USB (lo que debe cumplir un puerto)

| Característica | Valor | Fuente |
|---|---|---|
| Orden de pines USB-A | 1 VBUS (rojo), 2 D− (blanco), 3 D+ (verde), 4 GND (negro) | [Wikipedia, USB hardware](https://en.wikipedia.org/wiki/USB_hardware) (los colores varían: naranja/dorado/azul en algunos cables) |
| Tensión VBUS en un puerto host | 5 V ±5 % (4,75-5,25 V) | Wikipedia (misma página). Con USB Type-C el tope subió a 5,5 V |
| Tensión mínima en el dispositivo | 4,35 V (poca potencia); 4,4 V en un hub | Wikipedia (misma página) |
| Corriente de un dispositivo sin configurar | 100 mA | [Microchip](https://developerhelp.microchip.com/xwiki/bin/view/applications/usb/power-delivery/battery-charging/) |
| Corriente tras enumerar (USB 2.0 / 3.x) | 500 mA / 900 mA | Microchip |
| Corriente de un puerto cargador (BC 1.2, DCP) | Hasta 1,5 A, sin datos | Microchip; [TI, Tabla 4](https://static.chipdip.ru/lib/162/DOC013162143.pdf) |
| Cargador dedicado: puente D+/D− | 200 Ω como máximo (sin mínimo) | Microchip; TI (157-200 Ω en su chip, p. 4) |
| Ciclos de conexión de un USB-A estándar | 1.500 | Wikipedia |

### 2.3 Receptáculos USB-A hembra de fabricantes (ejemplos)

Son los conectores en sí, no tu placa. Muestran el rango de corriente que da la industria.

| Pieza | Corriente | Resistencia de contacto | Otros datos | Fuente |
|---|---|---|---|---|
| Molex 105057-0001 (USB-A simple, recto, THT) | **1,5 A** (30 V) | 30 mΩ máx. inicial; 100 mΩ tras ciclos | Subida de temperatura máx. 30 °C a 1,5 A; –40 a +85 °C incluida la subida; enchufar 35 N máx.; desenchufar 10 N mín.; 20.000 ciclos | [Molex PS-105057-001](https://docs.rs-online.com/6a44/A700000008643305.pdf) ([copia local](datasheets/A700000008643305.pdf)) |
| Würth 61400826021 (USB 2.0 A **doble**, apilado) | 1,5 A | 20 mΩ máx. | 1.500 ciclos; –40 a +105 °C; soldadura por ola | [Würth](https://www.we-online.com/components/products/datasheet/61400826021.pdf) ([copia local](datasheets/61400826021.pdf)) |
| Kycon KUSBVLPX (perfil bajo) | **1 A** | 30 mΩ máx. | Carcasa de latón niquelado, THT | [Mouser](https://www.mouser.be/new/kycon/kycon-kusbvlpx-usb-receptacles) |
| Kycon KUSBVXHT (alta retención) | 1,5 A | 30 mΩ máx. | Extracción mín. 15 N; 1.500 ciclos; "50 % más de retención" que los estándar | [Mouser](https://www.mouser.in/new/kycon/kycon-high-retention-usb/) |
| Mill-Max (hoja de zócalos USB) | **1 A** por contacto para 30 °C de subida | "50 m" (unidad perdida en la extracción) | Patas de posicionamiento acodadas para retención en la placa | [Mill-Max](https://www.mill-max.com/sites/default/files/external/assets/2017-12/USB%20Sockets.pdf) ([copia local](datasheets/USB_Sockets.pdf)) |
| Kyoritsu (conector USB A/B, página web) | 1,5 A (USB 1.0) y **2,5 A (USB 2.0)** | 30 mΩ máx. | 1.500 ciclos; enchufar 35 N; desenchufar 10 N | [Kyoritsu](https://www.kyohritsu.com/eclib/OTHER/FIG/CONNECTOR/3505.pdf) |
| GCT USB1135 (USB 3.0 tipo A, **9 contactos**) | **3 A** (30 V) | No indicada en la ficha del distribuidor | 20.000 ciclos; patas de blindaje en acero inoxidable "para mejor retención" | [Future Electronics](https://www.futureelectronics.com/p/5134155) (la ficha de GCT no se abrió, ver [enlaces.md](enlaces.md)) |
| Multicomp USB-A-S-RA (USB 2.0 A simple, acodado a PCB) | 1,5 A (250 V CA, 30 V CA) | 30 mΩ máx. | –20 a +60 °C; no dice nada de retención | [Farnell](https://www.farnell.com/datasheets/2856485.pdf) ([copia local](datasheets/2856485.pdf)) |
| "USB 2.0 A connector" de Distrelec (fabricante no indicado) | 1,5 A máx. **por pin** | 30 mΩ máx. | –55 a +85 °C; sin ciclos ni retención | [chipdip (copia)](https://static.chipdip.ru/lib/628/DOC041628005.pdf) |
| Lumberg 2410 08 (USB-A **macho** acodado) | 1 A | | | Según la [ficha #10](../cable-usb-a-usb-c-90-30cm/README.md); no lo abrí |

Lectura: el USB-A estándar suele darse para 1 a 1,5 A. Las cifras de 2,5 y 3 A existen, pero son de una página que no cita la norma (Kyoritsu) y de un conector de USB 3.0 con más contactos (GCT). **Tu placa puede llevar cualquiera de ellos o uno peor**; el vendedor no lo dice en lo que he podido ver.

### 2.4 Placas "USB-A hembra a bornes" comparables (otras marcas)

| Placa | Corriente | Bornes | Fuente |
|---|---|---|---|
| CamdenBoss CIM/USBA (módulo para carril DIN) | **30 V CC, 100 mA** | Tornillo M3, 0,2-4 mm² (30-12 AWG), pelado 6 mm, par máx. 0,5 N·m; +5V, D−, D+, GND y blindaje aparte | [Farnell, ficha](https://www.farnell.com/datasheets/3927991.pdf) ([copia local](datasheets/3927991.pdf)), [element14](https://nz.element14.com/camdenboss/cim-usba/tb-interface-usb-a-recpt-tb/dp/221181701) |
| CPC/Farnell "USB2 A Screw Termination Keystone Socket" (KUA2bk; fabricante no indicado) | "500 mA a 5 V"; "para transmisión de datos, no para carga" | Hilos de 0,4-1,3 mm de diámetro (16-26 AWG); dos puntos de tierra para el blindaje | [Farnell, ficha](https://www.farnell.com/datasheets/2905819.pdf) ([copia local](datasheets/2905819.pdf)) |
| Delock 66653 (adaptador USB-A hembra a 4 pines) | Hasta 500 mA a 5 V | Pines de soldar de 2,54 mm (no tornillo); 32,3 × 16,0 × 8,0 mm | [Delock](https://www.delock.com/produkt/66653/merkmale.html) |
| SparkFun USB Type A Female Breakout | Sin dato | Cabecera de 0,1"; placa de 1,00" × 0,80" con 4 agujeros; rotulado VCC, D−, D+, GND; sin protecciones citadas | [SparkFun](https://learn.sparkfun.com/tutorials/usb-type-a-female-breakout-hookup-guide/all) |

Estas placas no son la tuya. Pero las tres que he podido leer con datos de corriente están rotuladas para **0,1 a 0,5 A**, y una avisa de que no es para carga. Si la tuya declara más, el anuncio debería decirlo.

### 2.5 Borneros de tornillo (ejemplos, para ver qué cabe)

| Bloque | Cable | Pelado | Par de apriete | Fuente |
|---|---|---|---|---|
| Phoenix Contact, ficha 1751251 (3 posiciones, **paso 3,5 mm**, serie MKDS) | 0,14-1,5 mm² rígido y flexible (AWG 26-16). **Con puntera: solo 0,25-0,5 mm²** | 5 mm | 0,22-0,25 N·m | [Phoenix (copia en MAN)](https://extranet.mandieselturbo.com/electronics/datasheets/Phoenix/MKDS%20Series/1751251_04_en_04.pdf) |
| CamdenBoss CIM/USBA (tornillo M3) | 0,2-4 mm² (30-12 AWG) | 6 mm | máx. 0,5 N·m | [Farnell](https://www.farnell.com/datasheets/3927991.pdf) ([copia local](datasheets/3927991.pdf)) |
| Multicomp, bornero de PCB **paso 5,08 mm** | 0,2-4 mm² (26-12 AWG) | No indicado | 7,0 lb-pulgada (≈ 0,79 N·m, conversión mía) | [Farnell](https://www.farnell.com/datasheets/1600406.pdf) |

- **Deducción mía:** un cable flexible de 0,75 mm² entra desnudo en un bornero de 3,5 mm como el de Phoenix (0,14-1,5 mm²), pero **una puntera de 0,75 mm² no entra** (el límite con puntera es 0,5 mm²). En un bloque de 5,08 mm entra con y sin puntera, a falta de medir la puntera real.
- JLCPCB dice que el paso decide el cable que admite el bloque y da como rangos típicos 28-16 AWG para un bloque pequeño y 20-6 AWG para uno de potencia ([JLCPCB](https://jlcpcb.com/blog/pcb-terminal-blocks-guide)); no liga cada paso a un calibre.

### 2.6 Pistas de cobre (cálculo mío, sin dato de tu placa)

Fórmula de IPC-2221 para capa externa (k = 0,048), cobre de 1 oz (35 µm) y 10 °C de subida, tal como la recoge [NextPCB](https://www.nextpcb.com/blog/pcb-trace-width-calculator-ipc-2221-guide):

| Corriente | Ancho de pista necesario (1 oz, +10 °C) | Subida de temperatura si la pista mide 0,3 mm |
|---|---|---|
| 0,8 A | 0,22 mm | 6 °C |
| 1,0 A | 0,30 mm | 10 °C |
| 1,5 A | 0,53 mm | 25 °C |
| 2,0 A | 0,78 mm | 48 °C |
| 3,0 A | 1,37 mm | no calculado |

- Los valores de 1, 2 y 3 A coinciden con los de la tabla de NextPCB (11,8, 30,8 y 54 mil; 1 mil = 0,0254 mm). Los de 0,8 y 1,5 A y la columna de subida son cálculo mío con esa misma fórmula.
- **No tengo dato del cobre ni del ancho de pista de tu placa.** Es un valor que se puede medir con la lupa o un calibre al recibirla. Si el cobre es de 0,5 oz, hace falta el doble de ancho (cálculo mío).

## 3. Documentos oficiales

Un borne genérico no tiene datasheet. Estos son los documentos que aplican. **No he podido abrir los ZIP de USB-IF**; lo que cito de BC 1.2 sale de documentos que lo resumen (Microchip, TI).

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| USB Battery Charging Specification v1.2 | BC 1.2 (listada 11-12-2019) | ZIP | [descargar](https://usb.org/sites/default/files/BCv1.2_070312_0.zip) ([copia local](../documentos-compartidos/usb/BCv1.2_070312_0.zip)) · [página](https://usb.org/document-library/battery-charging-v12-spec-and-adopters-agreement) (enlaces tomados de la [ficha #10](../cable-usb-a-usb-c-90-30cm/README.md); no los abrí) |
| USB 2.0 Specification | ZIP con ECN hasta abril de 2025 | ZIP, 13,82 MB | [descargar](https://usb.org/sites/default/files/usb_20_20250603.zip) ([copia local](../documentos-compartidos/usb/usb_20_20250603.zip)) · [página](https://usb.org/document-library/usb-20-specification) (ídem; no abrí) |
| USB 2.0 Specification, copia no oficial de 2011 | Capítulo 6: conectores, 6.5.3 receptáculos A y B (p. 94) | PDF | [usb_20.pdf](https://git.nefarius.at/nefarius/USB-Bluetooth-Specs/media/branch/master/usb_20_0702115/usb_20.pdf). Solo se pudo leer el índice |
| TI TPS2513/TPS2513A/TPS2514/TPS2514A, "USB Dedicated Charging Port Controller" | SLVSBY8B (09-2013) | PDF | [copia en chipdip](https://static.chipdip.ru/lib/162/DOC013162143.pdf) · enlace oficial de TI visto en una búsqueda: [ti.com/lit/gpn/TPS2513](https://ti.com/lit/gpn/TPS2513) (no abierto) |
| Microchip: carga por USB (BC 1.2) | Sin referencia | Web | [ver](https://developerhelp.microchip.com/xwiki/bin/view/applications/usb/power-delivery/battery-charging/) |
| Molex, especificación de producto del USB 105057-0001 | PS-105057-001 (EC SH2009-0472 A, 27-11-2008) | PDF, 9 págs. | [ver](https://docs.rs-online.com/6a44/A700000008643305.pdf) ([copia local](datasheets/A700000008643305.pdf)) |
| Würth WR-COM USB 2.0 tipo A doble | 61400826021 | PDF, 7 págs. | [ver](https://www.we-online.com/components/products/datasheet/61400826021.pdf) ([copia local](datasheets/61400826021.pdf)) |
| Kycon KUSBVLPX (perfil bajo) y KUSBVXHT (alta retención) | Páginas de producto en Mouser | Web | [KUSBVLPX](https://www.mouser.be/new/kycon/kycon-kusbvlpx-usb-receptacles) · [KUSBVXHT](https://www.mouser.in/new/kycon/kycon-high-retention-usb/) |
| Mill-Max, zócalos USB | Hoja PR589, págs. 148-150 | PDF | [ver](https://www.mill-max.com/sites/default/files/external/assets/2017-12/USB%20Sockets.pdf) ([copia local](datasheets/USB_Sockets.pdf)) |
| Kyoritsu, conector USB A/B | Página de producto | Web (se descarga como PDF) | [ver](https://www.kyohritsu.com/eclib/OTHER/FIG/CONNECTOR/3505.pdf) |
| Multicomp USB-A-S-RA | Hoja de 1 página | PDF | [ver](https://www.farnell.com/datasheets/2856485.pdf) ([copia local](datasheets/2856485.pdf)) |
| GCT USB1135 (USB 3.0 tipo A, 3 A) | Ficha del fabricante: **no abierta** | PDF | [ver](https://gct.co/files/drawings/usb1135.pdf) · [listado en Future](https://www.futureelectronics.com/p/5134155) |
| CamdenBoss CIM/USBA | Código Farnell 221181701 | PDF | [ver](https://www.farnell.com/datasheets/3927991.pdf) ([copia local](datasheets/3927991.pdf)) |
| CPC/Farnell, USB2 A tornillo (KUA2bk) | Fechada 30-01-2020 | PDF | [ver](https://www.farnell.com/datasheets/2905819.pdf) ([copia local](datasheets/2905819.pdf)) |
| Phoenix Contact, bornero de PCB 3,5 mm | Item 1751251 | PDF | [ver](https://extranet.mandieselturbo.com/electronics/datasheets/Phoenix/MKDS%20Series/1751251_04_en_04.pdf) |
| Multicomp, bornero de PCB 5,08 mm | MC000034 a MC000041 (28-05-2012) | PDF | [ver](https://www.farnell.com/datasheets/1600406.pdf) |
| ITC-BT-36, Instalaciones a muy baja tensión (REBT) | ITC-BT-36 | PDF | [ver](https://www.plcmadrid.es/wp-content/uploads/ITC-BT-36.pdf) ([copia local](../documentos-compartidos/normas/ITC-BT-36.pdf)) |

### Qué dicen los más relevantes

**Cargador dedicado (BC 1.2 y TI)**

- Un DCP une D+ con D− con **200 Ω como máximo**; no hay mínimo, así que un hilo vale ([Microchip](https://developerhelp.microchip.com/xwiki/bin/view/applications/usb/power-delivery/battery-charging/)).
- El dispositivo lo detecta en dos pasos: aplica 0,5-0,7 V a D+ y mira que D− suba de 0,4 V; luego lo repite al revés para distinguirlo de un puerto con datos de carga (CDP). Un dispositivo que lo detecta puede tomar hasta 1,5 A ([Microchip](https://developerhelp.microchip.com/xwiki/bin/view/applications/usb/power-delivery/battery-charging/)).
- Los dispositivos que **no** soportan BC 1.2 activan D+ al ver VBUS, y un DCP no responde a esa señal (paráfrasis de [Microchip](https://developerhelp.microchip.com/xwiki/bin/view/applications/usb/power-delivery/battery-charging/)). Deducción mía: quedan como un puerto estándar sin enumerar, es decir, 100 mA.
- El controlador de TI documenta las señales que cargadores reales ponen en D+/D−: puente BC 1.2 (≤200 Ω); **Divider 1** (D+ = 2 V, D− = 2,7 V, adaptadores de "5 W"); **Divider 2** (D+ = 2,7 V, D− = 2 V, "10 W"); **Divider 3** (2,7 V en ambos, "12 W"); y 1,2 V en ambos, usado por algunos cargadores de tabletas ([TI, págs. 10-11](https://static.chipdip.ru/lib/162/DOC013162143.pdf)). El mismo chip prueba varios modos hasta que el dispositivo carga.

**Conector USB-A de Molex (PS-105057-001)**

- 1,5 A máximos, 30 mΩ de contacto inicial y 100 mΩ tras las pruebas de ciclos, subida de temperatura máxima de 30 °C a 1,5 A ([Molex](https://docs.rs-online.com/6a44/A700000008643305.pdf) ([copia local](datasheets/A700000008643305.pdf)), secciones 3.3 y 3.6).
- Fuerza de enchufado 35 N máx. y de desenchufado 10 N mín.; retención del terminal en su carcasa 5 N mín. **No da la fuerza de retención del conector en la placa** ni la de tirón del cable (sección 3.7).

## 4. Uso en el proyecto

### 4.1 Circuito

Fuente: guía de montaje §5.2 y §2.5.

```
LRS-50-5 (5,20 V) → WAGO 221-415 (polos 3 y 4) → 0,75 mm² (VCC y GND) → BORNE USB-A (este)
   (D+ y D− unidos con un puente corto en el propio borne)
→ Solo:    cable USB-A→USB-C acodado 30 cm (#10)
→ Pantalla: cable USB que trae la pantalla (tipo de cable: sin verificar)
```

### 4.2 Corriente: qué soporta cada eslabón

| Eslabón | Corriente de referencia | Fuente |
|---|---|---|
| Solo (pico, estimación de la guía) | 2,0 A | Guía §3 |
| Solo (típico, estimación de la guía) | 0,8 A | Guía §3 |
| Pantalla (cifra de otra pantalla) | 0,5 A; 52Pi recomienda fuente de 2 A | [Ficha de la pantalla](../pantalla-geeekpi-7-hdmi/README.md) |
| Cable de 0,75 mm² | 6 A según la hoja de compra | Guía §1 fila 21 |
| Receptáculo USB-A de ficha | 1 a 1,5 A (casos de 2,5 y 3 A: apartado 2.3) | Apartado 2.3 |
| Placas comparables de otras marcas | 0,1 a 0,5 A | Apartado 2.4 |
| Un dispositivo que detecta un DCP (BC 1.2) | hasta 1,5 A | Microchip |
| Salto de la fuente por sobrecarga (OCP) | ≈ 10,6-14,4 A a 5,2 V (cálculo de la ficha de la fuente) | [Ficha de la fuente](../meanwell-lrs-50-5/README.md) |

**Cálculo mío con el conector de Molex** (única ficha que da subida de temperatura): 30 °C a 1,5 A. Supongo que la subida crece con el cuadrado de la corriente (aproximación mía):

| Corriente | Subida estimada | Con 40 °C en la caja |
|---|---|---|
| 0,5 A | 3 °C | 43 °C |
| 0,8 A | 8 °C | 48 °C |
| 1,0 A | 13 °C | 53 °C |
| 1,5 A | 30 °C (dato de ficha) | 70 °C |
| 2,0 A | 53 °C | 93 °C: **por encima de los 85 °C de la ficha** |

- La temperatura de la caja de 40 °C es el límite del Solo, no una medida. La subida de la ficha es con el conector nuevo; tras ciclos de enchufado la resistencia de contacto puede subir de 30 a 100 mΩ (Molex) y la subida con ella.
- Con contactos de 30 a 100 mΩ, a 2 A se pierden de 0,12 a 0,40 V entre VBUS y GND solo en el interfaz enchufe-receptáculo (cálculo mío: 2 contactos × 2 A × resistencia). Súmalos a las pérdidas del cable de la [ficha #10](../cable-usb-a-usb-c-90-30cm/README.md).
- **Las pistas de la placa** pueden ser otro límite (tabla 2.6). No sé su ancho.
- **Conclusión (mía):** a 0,5-0,8 A no hay problema esperable. A 2 A, un USB-A de placa genérico va fuera de la clasificación de casi todas las fichas. Lo decide la corriente real del Solo, que **nadie ha medido**.

### 4.3 El puente D+/D−

**Qué hace.** Convierte el puerto en un "cargador dedicado" de BC 1.2. Un dispositivo que implemente BC 1.2 y lo detecte puede subir de 100 mA a 1,5 A (Microchip).

**Qué pasa según el aparato.**

| Aparato | Qué espera en D+/D− | Fuente |
|---|---|---|
| Dispositivo con BC 1.2 o con el estándar chino YD/T 1591-2009 | D+ y D− unidos (≤200 Ω) | Microchip; TI (cita ambos estándares); [Wikipedia](https://en.wikipedia.org/wiki/USB_hardware) (el estándar chino fue el primero en unir D+ y D− en el cargador) |
| iPhone/iPad (Apple) | Tensiones fijas en D+/D−: 2,0/2,0 V = 0,5 A; D+ 2,0 V y D− 2,7 V = 1 A; D+ 2,7 V y D− 2,0 V = 2,1 A; 2,7/2,7 V = 2,4 A | [happytrees](https://happytrees.org/USB_charger_data_pins); TI las nombra Divider 1/2/3 (5, 10 y 12 W) |
| Samsung (Galaxy Note antiguo) | 1,2 V en ambas | happytrees; TI (1,2 V "algunos cargadores de tabletas") |
| Cargadores baratos | D+ y D− unidos; la página los cita como lo que "mejor funciona en la mayoría" | happytrees |
| Dispositivo que no reconoce nada | Queda como puerto estándar: 100 mA | Microchip |

- No he encontrado qué corriente toma un iPad ante un D+/D− unidos, ni qué detectan los lectores de tarjetas o los terminales de pago. **Sin fuente.**
- **Qué detecta el SumUp Solo: sin verificar.** Ninguna fuente lo dice (fichas del [Solo](../sumup-solo/README.md) y del [cable](../cable-usb-a-usb-c-90-30cm/README.md)). La hoja REG001 del Solo lista un cargador de red con salidas de 5 V a 20 V, pero eso es el cargador y no lo que detecta el lector.
- **Pantalla:** una pantalla HDMI de 7" que se alimenta por USB no suele esperar nada en D+/D−. No hay fuente de 52Pi sobre eso; es una suposición.

**¿Importa que el aparato no reconozca el puente? (cálculo mío)**

- Lo que cambia es el techo: de 1,5 A a **100 mA** (o 500 mA si el aparato ya se considera configurado; sin host no habrá enumeración).
- Con la fuente de 10 A, **no importa para la sobrecarga**: una fuente da lo que el aparato pide, no lo empuja. Lo que importa es que el Solo cargue poco.
- Con 100 mA a 5 V son 0,5 W. El Solo tiene una batería de 6,16 Wh ([ficha del Solo](../sumup-solo/README.md)): llenarla desde cero a 0,5 W llevaría unas 12 h (6,16 Wh / 0,5 W), sin pérdidas y sin que el Solo consumiera nada. Si en reposo y en uso consume más de 0,5 W, la batería se agotaría aunque esté "enchufado". Es un caso extremo y no hay dato de que el Solo se comporte así.
- Hay que **medir con y sin puente** (apartado 6, medida 10): si la corriente no cambia, el Solo no usa la señal.

**Cómo hacer el puente.** Un trozo corto de cable (unos 3 cm) con un extremo bajo el tornillo de D+ y el otro bajo el de D−. La resistencia de un hilo así es de miliohmios, muy por debajo de 200 Ω. Si los bornes están contiguos, un hilo de 0,25-0,5 mm² con puntera entra en un bornero de 3,5 mm (Phoenix, apartado 2.5).

### 4.4 Cable de 0,75 mm² y bornero

- Longitud de pelado típica: 5-6 mm (Phoenix 5 mm; CamdenBoss 6 mm). Mídelo en tu placa.
- Si el bornero es de 3,5 mm, quizá la puntera de 0,75 mm² del kit de crimpado de la hoja (#28) **no entre** (límite 0,5 mm² en el ejemplo de Phoenix; el de tu placa es desconocido). Prueba con una puntera real antes de crimpar el lote.
- Si no entra la puntera, un cable flexible desnudo de 0,75 mm² sí cabe en el ejemplo de 3,5 mm, pero los hilos sueltos pueden escapar del tornillo. Retuerce el extremo y comprueba que no queda ningún hilo fuera.
- Los cables de rama en 0,75 mm²: 23 mΩ por metro, es decir, 46 mV a 2 A con 0,5 m de ida y 0,5 m de vuelta (cálculo mío).

### 4.5 Orden de los bornes y comprobación

- El estándar es VBUS, D−, D+, GND (Wikipedia). Los fabricantes rotulan "VCC, D−, D+, GND" (SparkFun), "+5V, D−, D+, GND" (CamdenBoss) o VBUS/D−/D+/GND (Open Electronics). Una placa barata puede ordenarlos distinto, rotularlos mal o no rotularlos.
- **Si VCC y GND están cruzados**, el borne daría polaridad inversa al USB-C del Solo o de la pantalla. **No he encontrado ningún dato de qué ocurre en esos aparatos**; los USB-C no están obligados por el estándar a soportar polaridad inversa en VBUS (deducción mía, sin fuente) y el daño es posible. Se evita con la prueba del apartado 6, que se hace **sin tensión**.
- Si D+ y D− están cruzados, no pasa nada: van unidos.

### 4.6 Seguridad: 5 V junto a 230 V

- **Nivel de tensión.** 5 V CC está muy por debajo del límite de MBTS: 50 V CA o 75 V CC ([ITC-BT-36, apartado 1](https://www.plcmadrid.es/wp-content/uploads/ITC-BT-36.pdf) ([copia local](../documentos-compartidos/normas/ITC-BT-36.pdf))). La fuente aísla la salida de la red (ficha de la fuente: 4 kVAC entrada-salida en ensayo).
- **Fuente MBTS.** El apartado 2.1 de la ITC-BT-36 pide que un circuito MBTS se alimente de una fuente con transformador de aislamiento de seguridad (cita la UNE-EN 60742) u otra de nivel de aislamiento equivalente. La hoja de la LRS-50-5 cita EN 61558-1 y -2-16 ([ficha de la fuente](../meanwell-lrs-50-5/README.md)). **Que eso cumpla el requisito de la ITC no lo he comprobado** (las normas son de pago).
- **Separación.** El apartado 2.2 pide una "separación de protección" entre los conductores MBTS y los de cualquier otro circuito, y la admite por separación física, por una cubierta no metálica adicional, por una pantalla o vaina metálica, o por aislamiento para la tensión más alta. Si los cables no tienen resistencia mecánica suficiente, deben ir en conductos que los protejan (pág. 4). **No da una distancia en mm** en lo que leí. La norma de producto de la guía (EN 60335) es de pago y **no la he leído**.
- **Identificación.** La guía usa marrón (L), azul (N) y verde-amarillo (tierra) para la red, y rojo y negro para los 5 V. No he encontrado una norma que fije el color de un cable de 5 V; mantén rojo/negro **solo** para los 5 V y etiqueta las regletas.
- **Dónde colocar el borne.** En la caja de arriba, con la fuente y la C14 detrás del Solo, los cables de 230 V y los de 5 V comparten espacio (guía §4). Mantén los dos grupos en haces distintos, con bridas, y que ningún cable de 5 V pase junto a los bornes de L/N de la LRS.
- **Blindaje del conector.** Si el blindaje del USB-A va a GND en la placa (**sin verificar**), apoyarlo en la chapa (que va a tierra, guía §5.1) uniría el 0 V de 5 V con tierra. La guía dice "no hagas más uniones de masa" (§5.2) y la [ficha de la fuente](../meanwell-lrs-50-5/README.md) deja abierta si conviene unir −V a FG. Monta la placa sobre separadores de nylon (el kit #30 los trae) y mide la continuidad entre el blindaje y la chapa.

## 5. Fallos, bugs y problemas conocidos

No he encontrado reseñas técnicas, foros ni issues sobre **este ASIN**: una sola búsqueda del ASIN no devolvió nada relacionado y las reseñas de Amazon no se pueden abrir. Lo que sigue es el comportamiento esperable de este tipo de placa, con fuente donde la hay.

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | Corriente del Solo (2,0 A de pico estimado) por encima de la clasificación del conector y de las pistas | Alta para el Solo; baja para la pantalla |
| 2 | Cortocircuito en la placa o el cable sin fusible: la LRS no corta hasta ≈ 10,6 A | Alta si ocurre |
| 3 | El Solo no reconoce el puente D+/D− y carga a 100 mA | Media-alta, sin verificar |
| 4 | Orden de bornes no estándar o serigrafía errónea (VCC/GND cruzados) | Alta si ocurre; se detecta sin tensión |
| 5 | Tornillos que se aflojan con vibración y ciclos de temperatura | Media |
| 6 | Conector USB-A arrancado de la placa por un tirón del cable | Media-alta |
| 7 | Cable de 0,75 mm² (o su puntera) que no cabe en el bornero | Media (montaje) |
| 8 | Blindaje del conector unido a GND y apoyado en la chapa | Baja-media |
| 9 | Cable de la pantalla C→C: no encaja en el USB-A | Media (ver ficha de la pantalla) |
| 10 | Placa sin marca, lote variable, sin garantía de continuidad | Media, sin confirmar |
| 11 | Desgaste del USB-A hembra por conexiones repetidas | Baja |

### 5.1 Corriente y calor

Ver apartados 2.3, 2.4, 2.6 y 4.2. Resumen: las tres placas "USB-A a bornes" que he podido leer se rotulan para 0,1-0,5 A, y los conectores USB-A sueltos van de 1 a 1,5 A (con casos de 2,5 y 3 A). **No hay dato del tuyo.** El calor se concentra en los contactos y las pistas, no en el cable.

### 5.2 Sin protección

- La fuente de 10 A tiene una protección OCP de 110-150 % de la potencia (≈ 10,6-14,4 A a 5,2 V), en modo "hiccup" ([ficha de la fuente](../meanwell-lrs-50-5/README.md)). Un cortocircuito en esta rama puede hacer pasar varios amperios por unas pistas y un cable de 28 AWG que no los aguantan, antes de que la fuente reaccione (deducción mía).
- Las placas comparables que he leído no mencionan fusible ni TVS. Un puerto USB de un ordenador o de un cargador comercial suele limitar la corriente; este no (observación mía, sin fuente).
- **Qué hace falta:** un fusible o PTC en el cable de VCC de cada rama (propuesta mía, apartado 8). La [ficha de la pantalla](../pantalla-geeekpi-7-hdmi/README.md) hace la misma propuesta.

### 5.3 Puente D+/D− que no se reconoce

Ver apartado 4.3. El fallo no es peligroso para la placa. Es peligroso para el servicio: un Solo con la batería baja no cobra.

### 5.4 Tornillos que se aflojan

- Un tornillo flojo vibra y da fallos intermitentes, y puede acabar en arco; un tornillo bien apretado con un mecanismo de bloqueo suele ser lo más seguro bajo vibración ([JLCPCB](https://jlcpcb.com/blog/pcb-terminal-blocks-guide)).
- Los ciclos de temperatura dilatan y contraen los materiales, lo que carga las soldaduras y los tornillos de apriete y puede agrietar la soldadura con el tiempo (JLCPCB, misma página). La máquina estará 24/7 en un bar, con calor y apagados nocturnos.
- **Cifras de par de apriete:** no hay de tu placa. Ejemplos: 0,22-0,25 N·m (Phoenix, 3,5 mm), máx. 0,5 N·m (CamdenBoss, M3), ≈ 0,79 N·m (Multicomp, 5,08 mm).
- La página de JLCPCB no da intervalo de reapriete ni valores de par; el reapriete tras la primera semana y cada año es consejo mío.

### 5.5 Conector arrancado y soldaduras

- La fuerza de enchufar un USB-A llega a 35 N y la de desenchufar es de 10 N como mínimo (15 N en un conector de alta retención) ([Molex](https://docs.rs-online.com/6a44/A700000008643305.pdf) ([copia local](datasheets/A700000008643305.pdf)), [Kycon](https://www.mouser.in/new/kycon/kycon-high-retention-usb/), [Kyoritsu](https://www.kyohritsu.com/eclib/OTHER/FIG/CONNECTOR/3505.pdf)). Todo eso pasa por las patas del conector a la placa.
- Molex no da fuerza de retención a la placa. Mill-Max habla de patas de posicionamiento acodadas "para retención" y GCT de patas de blindaje de acero inoxidable "para mejor retención", sin cifras (ver apartado 2.3). **No hay un valor publicado que me diga cuánto aguanta la soldadura de tu placa.**
- El mismo problema de tensión mecánica existe en los bornes: JLCPCB dice que la tensión de inserción y apriete pasa sobre todo al taladro metalizado de la pata, y que un pad pequeño o una soldadura escasa pueden agrietarse (JLCPCB).
- **Observación mía:** con un cable de 30 cm acodado de por medio, un tirón accidental al abrir la máquina llega al conector. Sujeta el cable y fija la placa.

### 5.6 Cable que no cabe

Ver apartado 4.4. En un bornero de 3,5 mm, la puntera de 0,75 mm² puede no entrar.

### 5.7 Blindaje y chasis

Ver apartado 4.6. Comprueba la continuidad entre el blindaje del conector y GND, y entre el blindaje y la chapa.

### 5.8 Calidad, lote y falsificaciones

- No he encontrado informes de falsificación de esta clase de placa. Una placa sin marca no se falsifica: lo que hay es **variación de fabricante y lote** bajo un mismo ASIN (riesgo general, sin fuente para este anuncio).
- Los fallos que se esperan en una placa barata: soldadura fría en el conector o los bornes, taladros mal alineados, serigrafía errónea. **Sin fuente para este anuncio.**
- Solución práctica: comprar con margen, medir **todas** las unidades (apartado 6) y guardar el mismo lote para las máquinas en serie.

### 5.9 Desgaste

El USB-A estándar se da para 1.500 ciclos (Wikipedia; Würth, Kycon, Kyoritsu); Molex da 20.000. Un montaje fijo, que se desconecta pocas veces, no los agotará (deducción mía).

## 6. Qué comprobar al recibirlo

Necesitas un polímetro, un destornillador adecuado a los tornillos, el cable USB-A→USB-C de la ficha #10 y una placa breakout USB-C hembra (la misma que pide la ficha #10 para sus pruebas; la disponibilidad en Amazon.es no la he comprobado). Pines del USB-C: VBUS A4/A9/B4/B9; GND A1/A12/B1/B12; D+ A6; D− A7; CC A5 (los de VBUS, GND y CC figuran en la [ficha de Molex citada en la ficha #10](https://static.chipdip.ru/lib/641/DOC034641065.pdf); D+ y D− son la asignación estándar).

Las medidas 3 a 6 se hacen **con el borne sin tensión**.

| # | Medida | Resultado esperado | Si no sale |
|---|---|---|---|
| 1 | Inspección con lupa: serigrafía de los cuatro bornes, soldadura del USB-A y de sus patas de anclaje, posición de los agujeros, paso (3,5 / 5,0 / 5,08 mm) y ancho de las pistas | Soldaduras con menisco, sin puentes ni pines doblados; bornes rotulados | Anota qué es. Soldaduras mates o con huecos: rechaza |
| 2 | Pelado y hueco: prueba un cable de 0,75 mm² desnudo y una puntera de 0,75 mm² | Entra sin dejar hilos fuera | Si la puntera no entra, usa cable desnudo retorcido u otro tamaño |
| 3 | Bornes sin cables ni puente: VCC↔GND, VCC↔D+, VCC↔D−, D+↔D−, y VCC y D±↔blindaje del conector | Abierto en todos | Cualquier continuidad: rechaza (D+↔D− unidos de fábrica sería una placa distinta) |
| 4 | **Con el cable #10 enchufado en el USB-A y la placa sin tensión:** continuidad entre el borne VCC y VBUS (A4/A9) del breakout USB-C; GND con A1/A12; D+ con A6; D− con A7 | VCC→VBUS y GND→GND con continuidad; D+→A6 y D−→A7 (o cruzados, da igual) | **VCC en GND o al revés: no des tensión.** Rechaza o cambia el cableado. Sin D+/D−: cable "solo carga" (ficha #10) |
| 5 | Con el puente puesto: A6↔A7 | Continuidad (pocos ohmios, <200 Ω) | Sin continuidad: el puente no hace contacto o el cable no lleva D+/D− |
| 6 | Blindaje del conector: continuidad con GND y con la chapa | Anota si va a GND. **Sin continuidad con la chapa** | Continuidad con la chapa: separadores de nylon o aislar |
| 7 | Tirón: tira suavemente de cada cable en su borne; mueve el USB-A lateralmente con el cable puesto | Ningún cable sale; el conector no se mueve ni cruje | Cualquier holgura o salto: rechaza |
| 8 | **Caída bajo carga:** 5 V y carga de unos 1 A (resistencia de potencia de unos 5 Ω o carga electrónica) en el extremo USB-C; mide VCC→VBUS y GND→GND (borne al breakout) | Menos de 0,3 V de caída total a 1 A, incluido el cable (umbral mío; el cable solo suma unos 0,14 V según la ficha #10) | Más: sospecha de contactos o pistas |
| 9 | **Prueba térmica:** 1 h a la corriente real (medida 10) con termopar o termómetro IR en el USB-A y los bornes | No más de 30 °C sobre ambiente (el límite de subida de la ficha de Molex a 1,5 A) | Más: descarta la placa o reduce la corriente |
| 10 | **Con el Solo (y con la pantalla):** medidor USB en línea o amperímetro. Anota corriente máxima, típica y en reposo, **con y sin el puente D+/D−**, y la tensión en la entrada del aparato | Corriente mayor con el puente (si el aparato lo usa). Pico real del Solo y de la pantalla | Si no cambia con el puente: el aparato no lo usa. Si el pico pasa de 1,5 A: ver apartado 8 |
| 11 | Reapriete: vuelve a apretar los tornillos tras la primera semana de ciclos de temperatura | Sin movimiento notable | Anota; si siguen aflojándose, usa puntera o cambia de bornero |

Notas:

- Las medidas 3 a 6 las hace cualquier polímetro con zumbador. No requieren corriente.
- **Mide todas las unidades que compres**, no una muestra. Con un producto genérico los fallos no se reparten al azar.
- Como alternativa a la 4 sin cable A-C: un cable USB-A macho de repuesto con los hilos pelados sirve, **pero primero identifica sus hilos** (los colores varían entre cables; Wikipedia lista naranja o rojo para VBUS y azul o negro para GND) enchufándolo a un cargador y midiendo, antes de usarlo como referencia.

## 7. Alternativas

Solo hay motivo si la corriente real del Solo pasa de 1 A o la placa falla las pruebas.

1. **Quitar el conector USB-A de la cadena de potencia (mía).** Cortar el extremo USB-A del cable del Solo (y del de la pantalla, si lo es de tipo A) y cablear VCC y GND directamente a la regleta, y D+/D− unidos entre sí. Quita el eslabón más débil. Inconvenientes: se pierde el cable original, hay que empalmar hilos de 24-28 AWG (cuyo calibre se desconoce), y la regleta WAGO 221 tiene un mínimo de cable que no he comprobado. Lo mejor es empalmar con soldadura y termorretráctil a un tramo de 0,75 mm², con tracción sujeta.
2. **Conector de potencia superior si diseñas una placa propia.** Existen receptáculos USB-A de 3 A con 9 contactos y patas de acero inoxidable (GCT USB1135, [Future Electronics](https://www.futureelectronics.com/p/5134155)); es un componente suelto, no un borne listo.
3. **Módulo de carril DIN CamdenBoss CIM/USBA.** Tiene bornes y tornillo M3 de 0,2-4 mm², pero está dado para **100 mA** ([Farnell](https://www.farnell.com/datasheets/3927991.pdf) ([copia local](datasheets/3927991.pdf))). **No sirve para alimentar el Solo.**
4. **Módulo de carga USB para carril DIN.** WAGO tiene uno con un USB 2.0 tipo A, hasta 1,5 A, con detección automática de la señal D+/D− y protección de sobrecorriente, pero con **entrada de 10 a 30 V CC**, no 5 V ([Control Design](https://www.controldesign.com/vendors/products/2015/wago-rail-mount-charging-module)). No encaja con una fuente de 5 V; implicaría una fuente de 12 o 24 V. No he comprobado disponibilidad ni precio.
5. **Controlador de puerto de carga con autodetección (TI TPS2513A/TPS2514A).** Hace el puente BC 1.2 y los modos de Apple y Samsung en uno ([TI](https://static.chipdip.ru/lib/162/DOC013162143.pdf)). Es un chip, no un módulo; solo tendría sentido si el Solo exigiera otro modo. Hay circuitos equivalentes de otros fabricantes en LCSC (PJ5102SG, AT5102SG) que vi en una búsqueda y no abrí.

## 8. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Mide primero la corriente real del Solo y de la pantalla** con un medidor USB en línea (carga completa, arranque, con y sin puente D+/D−). Sustituye las estimaciones de 0,8 y 2,0 A. Todo lo demás depende de eso.
2. **Decide según el pico medido del Solo:**
   - **Hasta 1 A:** la placa vale si pasa la tabla del apartado 6.
   - **Entre 1 y 1,5 A:** solo si el anuncio declara esa corriente por escrito o si pasa la prueba térmica con margen (medida 9).
   - **Más de 1,5 A:** no uses un USB-A de placa genérico para el Solo. Elige la alternativa 1 del apartado 7.
   - **Pantalla:** 0,5 A a 1 A, dentro de la franja de 1 a 1,5 A. Basta con que la placa pase la inspección.
3. **Pregunta al vendedor por escrito** (antes de pedir 20 unidades): corriente nominal, paso del bornero, calibre admitido, orden de los bornes, si el blindaje va a GND, grosor de cobre y ancho de pistas, y si trae fusible. Guarda la respuesta.
4. **Un fusible o PTC por rama**, en el cable de VCC entre la regleta y el borne. El valor lo marca la corriente real medida: algo por encima del pico y por debajo de lo que aguante el eslabón más débil (conector, pistas o cable de 28 AWG). Si no hay un valor que cumpla las dos cosas, la placa no vale. Un portafusibles en línea de cuchilla o de cristal es más fiable que un PTC en una caja caliente (consejo mío, sin fuente).
5. **Haz el puente D+/D− con un hilo corto y mide con y sin él.** Si la corriente no cambia, no es necesario; dejarlo no daña nada que yo sepa. Para la pantalla, probablemente no haga falta.
6. **Mecánica:** fija la placa con separadores de nylon en sus agujeros (si los tiene), sujeta el cable a 2-3 cm del conector con una brida, deja holgura y no uses el cable como asa. Usa pasacables.
7. **Aprieta con el par recomendado de tu bornero** (pídelo) y no a fondo; marca los tornillos con un punto de rotulador para ver si se mueven; reaprieta tras la primera semana y en cada revisión.
8. **Separa e identifica:** rojo y negro de 0,75 mm² solo para 5 V, en haces aparte de los 230 V. Pon una etiqueta "5 V" en cada regleta y en cada borne.
9. **Compra con margen:** 2 por máquina. Para 10 máquinas son 20 unidades de un mismo lote; comprueba todas y guarda 2 de repuesto. Apunta lote, vendedor y fecha del pedido.
10. **Confirma el cable de la pantalla** (¿A→C o C→C?) antes de decidir. Si es C→C, este borne no sirve para la pantalla.

**Afecta a otras piezas (una línea cada una):**

- **Cable USB-A→USB-C (#10):** necesita hilos D+/D− para que el puente llegue al Solo, y el calibre de sus hilos decide cuánto cae (ficha #10).
- **Fuente (#14):** su OCP (≈ 10,6-14,4 A) no protege esta rama; la guía no pone fusible por rama (ficha de la fuente).
- **Pantalla (#5):** su ficha pide medir el consumo real y confirmar el tipo de cable.
- **Crimpadora y punteras (#28):** puede que las punteras de 0,75 mm² no quepan en un bornero de 3,5 mm.
- **Separadores de nylon (#30):** sirven para aislar este borne de la chapa.

## 9. Lo que no he podido verificar

- **El anuncio de Amazon (B07V86XPL4):** marca, vendedor, paso del bornero, calibre admitido, orden de los bornes, corriente nominal, protecciones, blindaje, tamaño, agujeros. Amazon bloquea mi herramienta y el ASIN no aparece en otras webs.
- **El texto de BC 1.2 y de USB 2.0:** no abrí los ZIP de USB-IF. No pude leer qué corriente fija la especificación USB 2.0 para los conectores: la cifra de 1,5 A del enunciado coincide con varias fichas de fabricante, pero no la vi en la especificación. Lo que cito sale de Microchip, TI, Wikipedia y fichas de fabricante.
- **Amphenol y TE:** no pude abrir fichas de estos dos fabricantes (la de Amphenol en DigiKey la rechazó la herramienta y no encontré una de TE). Los fabricantes de la tabla 2.3 son Molex, Würth, Kycon, Mill-Max, GCT y Kyoritsu, más dos hojas de distribuidor.
- **Qué detectan el Solo y la pantalla en D+/D−** y si el puente cambia su corriente. Tampoco la corriente real ni la tensión mínima de ninguno de los dos.
- **Qué ocurre con la polaridad invertida** en el USB-C del Solo o de la pantalla. Busqué y no hallé dato: un documento de onsemi trata corriente inversa y sobretensión en VBUS, pero no polaridad invertida.
- **Cuánto aguanta la soldadura del conector USB-A a la placa** y la fuerza de tirón del cable: ninguna ficha lo da.
- **Los pares de apriete de tu bornero** y su paso.
- **La ficha de GCT USB1135** (el servidor rechazó la herramienta) y las de Amphenol (rechazada) y Phoenix Contact (HTTP 429): no las pude abrir. Los datos de Phoenix salen de una copia en el servidor de MAN.
- **TI:** el servidor ti.com no se abrió (la herramienta no obtuvo permiso); usé la copia de chipdip.
- **Cuál es el cable que trae la pantalla.**
- **Si SumUp admite una fuente y un cable propios para el Solo** (el manual pide los originales; ver la [ficha del Solo](../sumup-solo/README.md)).
- **Disponibilidad y precio de alternativas** (WAGO, GCT) en Amazon.es.
- **Normas de producto de pago (EN 60335-1, EN 60335-2-82):** requisitos de separación de cables de baja tensión y de materiales.
- **Garantía y política de devolución** de Amazon.es y marcado CE/RoHS del anuncio.

## 10. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos) y carpeta [`datasheets/`](datasheets/).

Todos los enlaces, ordenados por tipo y con nota en los que no pude abrir, en [`enlaces.md`](enlaces.md).
