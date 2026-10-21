# GeeekPi cable FFC de 15 pines, 50 cm (cable plano para cámara Raspberry Pi)

Cable plano (FFC) que une la [Raspberry Pi Camera Module 3](../raspberry-pi-camera-module-3/README.md) con el conector CSI "CAMERA" de la [Raspberry Pi 3B+](../raspberry-pi-3b-plus/README.md). La cámara queda en la caja de arriba y la Pi en la caja interior suspendida, así que el cable de 200 mm que trae la cámara no llega.

- **Compra:** ASIN B07DKB4M1H, 7,99 € (precio de la hoja de componentes del 19-20-10-2026). Es la pieza 4 de la hoja.
- **Marca en la hoja:** GeeekPi. No he podido confirmar que el anuncio coincida con ninguna ficha de fabricante (ver [sección 3](#3-el-producto-geeekpi-y-su-documentación)).

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso automático (no he intentado eludirlo) y las búsquedas por el ASIN no devolvieron el anuncio, así que no he podido ver el anuncio concreto: la referencia y el precio son los de tu hoja, y **no sé qué pone el anuncio sobre paso, tipo de contactos ni anchura**.
>
> No repito aquí lo que ya dice la [ficha de la cámara](../raspberry-pi-camera-module-3/README.md) sobre el cable (apartado 5.5: el comentario de integridad de señal, el kit de extensión HDMI y el hilo de element14). Esta ficha profundiza.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [El producto GeeekPi y su documentación](#3-el-producto-geeekpi-y-su-documentación)
4. [Documentos y normas](#4-documentos-y-normas)
5. [Orientación, tipo de cable y pines](#5-orientación-tipo-de-cable-y-pines)
6. [Longitud: qué dicen Raspberry Pi y la comunidad](#6-longitud-qué-dicen-raspberry-pi-y-la-comunidad)
7. [Mecánica: curvatura, flexión y conectores ZIF](#7-mecánica-curvatura-flexión-y-conectores-zif)
8. [Fallos, bugs y problemas conocidos](#8-fallos-bugs-y-problemas-conocidos)
9. [Qué comprobar al recibirlo](#9-qué-comprobar-al-recibirlo)
10. [Alternativas](#10-alternativas)
11. [Recomendaciones para el alcoholímetro](#11-recomendaciones-para-el-alcoholímetro)
12. [Lo que no he podido verificar](#12-lo-que-no-he-podido-verificar)
13. [Fuentes](#13-fuentes)

---

## 1. Resumen para el proyecto

- **El riesgo real no es la longitud, es el tipo de cable.** El cable oficial lleva los contactos en caras opuestas en cada extremo ("tipo B" según OpenFlexure, "tipo D" en la nomenclatura de Molex). Hay vendedores de Amazon que lo venden con los contactos en la misma cara. OpenFlexure avisa de que un cable del tipo equivocado "quema la cámara en unos segundos" ([OpenFlexure](https://build.openflexure.org/openflexure-microscope/master/parts/electronics/camera_cable_300mm.html), [incidencia #392](https://gitlab.com/openflexure/openflexure-microscope/-/issues/392)). Es un aviso de un proyecto, no una prueba de laboratorio, pero el mecanismo cuadra con el pinout (apartado 5).
- **El anuncio de tu hoja no dice nada de esto** y yo no he podido ver el anuncio. El cable parecido de la tienda de 52Pi (no consta que sea la misma marca que GeeekPi) llega a poner "0.5mm" en el título y "1.0mm" en la descripción. Al recibirlo hay que comprobar con calibre: 15 conductores, paso 1,00 mm, anchura 16 mm, y refuerzos en caras opuestas.
- **Un cable plano de 50 cm entra dentro de lo que Raspberry Pi vende.** Raspberry Pi comercializa un cable oficial de 500 mm para cámaras con conector estándar de 15 vías (SC1130, con extremo de 22 pines para Pi 5 y Zero). The Imaging Source recomienda unos 30 cm y admite 50 cm "con buen diseño". En la Pi 3B+ no hay cifra oficial: hay que probarlo con la cámara y con la ruta final.
- **Un FFC estándar no está hecho para flexión repetida.** Las hojas de especificaciones que he leído garantizan entre 20 y 100 pliegues completos y 100 000 ciclos solo en ensayo alternativo, y 20-30 inserciones en el conector. En tu máquina el cable une una caja fija con una caja colgada de muelles: habrá micro-movimientos y vibración, aunque no haya puerta.
- **El eslabón débil es el conector ZIF de la Pi, no el cable.** Las lengüetas negras se rompen si se fuerzan y la reparación exige soldar. El cable no debe tirar del conector: hay que sujetarlo cerca de cada extremo.
- **Sin garantía ni documentación propia:** no he encontrado ficha técnica, wiki ni hoja de garantía del cable GeeekPi. Es un cable de 8 €: se compra con repuesto y se prueba el mismo día.

## 2. Especificaciones

### 2.1 Lo que necesitan la Pi 3B+ y la cámara

| Característica | Valor | Fuente |
|---|---|---|
| Conector de la Pi (CSI "CAMERA") | 15 pines, "estándar"; es el de todas las Pi hasta la Pi 4 incluida | [documentación oficial de cámaras](https://www.raspberrypi.com/documentation/accessories/camera.html) |
| Conector de la cámara | FPC de 15 × 1 mm; cable incluido de 200 mm | [product brief RP-008151-DS-1](https://pip-assets.raspberrypi.com/categories/786-raspberry-pi-camera-module-3/documents/RP-008151-DS-1-camera-module-3-product-brief.pdf) ([copia local](../raspberry-pi-camera-module-3/datasheets/RP-008151-DS-1-camera-module-3-product-brief.pdf)) |
| Paso del conector estándar | 1 mm, 15 vías | [Kiwi Electronics](https://www.kiwi-electronics.com/en/raspberry-pi-camera-accessories-133/raspberry-pi-camera-cable-standard-mini-500mm-11590) (tienda), coincide con el brief |
| Conector J1 del módulo 3 | Amphenol SFW15R-1STE1LF: 1 mm, 15 contactos, ZIF, contacto inferior ("bottom") | [esquema RP-008969-SD-3](https://pip-assets.raspberrypi.com/categories/1207-design-files/documents/RP-008969-SD-3-Raspberry%20Pi%20Camera%20Module%203%20Reference%20Schematic.pdf) ([copia local](../raspberry-pi-camera-module-3/datasheets/RP-008969-SD-3-Raspberry_Pi_Camera_Module_3_Reference_Schematic.pdf)), [RS Components](https://uk.rs-online.com/web/p/fpc-connectors/1822728P) |
| Carriles | La Pi 3B+ usa CAM1 con dos carriles de datos y el reloj. El conector de 15 vías solo soporta los carriles 0 y 1 | [esquema reducido RP-008339-DS-1](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf), esquema del módulo 3 |
| Diferenciales | 3 pares (D0, D1, CK); un GND entre pares | pinout de [Microchip](https://onlinedocs.microchip.com/oxy/GUID-BABA2044-2D69-4FCC-A1E3-98FD36992888-en-US-3/GUID-3B439A68-A4F9-43C5-AB4C-78DD6E1D8D7F.html), [Zephyr](https://docs.zephyrproject.org/latest/build/dts/api/bindings/gpio/raspberrypi,csi-connector.html), [Arducam](https://blog.arducam.com/?p=20543) |

### 2.2 El cable oficial de 200 mm (referencia)

Fuente: [plano RP-008146-DS-1](https://pip-assets.raspberrypi.com/categories/786-raspberry-pi-camera-module-3/documents/RP-008146-DS-1-standard-camera-cable-200mm-reference-drawing.pdf) ([copia local](datasheets/RP-008146-DS-1-standard-camera-cable-200mm-reference-drawing.pdf)), leído entero. El plano dice "DO NOT SCALE DRAWING".

| Característica | Valor | Tolerancia |
|---|---|---|
| Longitud | 200,0 mm | ±1,0 mm |
| Anchura | 16,0 mm | ±0,10 mm |
| Conductores | 15 | |
| Paso | 1,000 mm | ±0,02 mm |
| Margen (borde a primer conductor) | 1,0 mm | ±0,10 mm |
| Ancho de cada conductor | 0,700 mm | ±0,02 mm |
| Espesor del conductor | 0,027 mm | ±0,01 mm |
| Espesor del aislante | 0,055 mm | ±0,03 mm |
| Espesor en el extremo de contacto | 0,309 mm | ±0,05 mm |
| Longitud de la cinta de refuerzo | 6,3 mm | ±0,5 mm |
| Longitud de conductor pelado (15 pines) | 5,0 mm | ±0,5 mm |

El plano **no indica** el lado de los contactos en cada extremo, el material ni el espesor del refuerzo.

### 2.3 Lo que se sabe de este anuncio

| Característica | Valor |
|---|---|
| Marca y modelo | GeeekPi, "FFC de 15 pines, 50 cm" (hoja de componentes) |
| Paso | **Sin verificar** |
| Tipo de contactos (misma cara u opuestas) | **Sin verificar** |
| Anchura, espesor, refuerzos, material | **Sin verificar** |
| Temperatura, tensión, norma | **Sin verificar** |
| ¿Un cable o un pack? | **Sin verificar** |

### 2.4 Cable FFC genérico (para saber qué es normal)

Son datos de fabricantes de FFC, no de este cable.

| Característica | Valor | Fuente |
|---|---|---|
| Construcción | Conductores planos de cobre (a menudo estañado) laminados entre dos películas de PET; los extremos llevan un refuerzo en la cara opuesta a los contactos | [LCSC Cable](https://lcsccable.com/services/ffcfpc-cable), [Wikipedia](https://en.wikipedia.org/wiki/Flexible_flat_cable), [Würth](https://www.we-online.com/components/products/datasheet/687733100002.pdf) ([copia local](datasheets/687733100002.pdf)) |
| Espesor del extremo enchufable | 0,30 mm | [W+P](https://wppro.com/en/series/599) |
| Espesor del conductor (opciones) | 0,035, 0,05 o 0,10 mm | [W+P](https://wppro.com/en/series/599), [GCT](https://static.chipdip.ru/lib/010/DOC042010627.pdf) |
| Tensión máxima | 60 V AC (el tipo estándar de W+P: 30 V AC) | [Molex 151660241](https://www.farnell.com/datasheets/4726909.pdf), [Würth](https://www.we-online.com/components/products/datasheet/687733100002.pdf) ([copia local](datasheets/687733100002.pdf)), [W+P](https://wppro.com/en/series/599) |
| Temperatura | −40 a +105 °C (Molex); −30 a +105 °C (Würth, W+P tipo HT); +80 °C máx. en el tipo estándar de W+P | mismas fuentes |
| Resistencia del conductor, paso 1,0 mm | 1,1 Ω/m máx. | [GCT](https://static.chipdip.ru/lib/010/DOC042010627.pdf) |
| Resistencia de aislamiento | ≥ 1000 MΩ a 500 V CC, 1 min | GCT |
| Rigidez dieléctrica | Sin ruptura a 500 V CA, 1 min | GCT |
| Continuidad | Sin abiertos ni cortos con un comprobador de 3 V CC | GCT |
| Vida de flexión | ≥ 100 ciclos (plegado) y ≥ 100 000 ciclos (ensayo alternativo) | GCT |
| Vida de inserción | ≥ 30 ciclos (GCT); 20 ciclos (Würth, cable de 0,5 mm) | GCT, Würth |
| Inflamabilidad | UL 758 VW-1 | GCT |
| Acabado de contactos | Estaño (lo habitual); algunos fabricantes ofrecen oro flash | Molex, Würth, LCSC |

## 3. El producto GeeekPi y su documentación

- **No he encontrado documentación propia** del cable GeeekPi: ni ficha técnica, ni wiki, ni hoja de garantía. No pude abrir el anuncio de Amazon ni la web de la marca (`geeekpi.com` rechaza la herramienta por robots.txt; no la rodeé).
- **¿GeeekPi es 52Pi?** No lo he podido confirmar. La página "about us" de 52Pi no nombra a GeeekPi. La búsqueda de marcas registradas solo muestra "52PI" a nombre de 52pi Technology (Shanghai) Co., Ltd. Un revendedor ([ubuy](https://www.ubuy.hk/en/brand/geeekpi)) describe a GeeekPi como una marca de accesorios para Raspberry Pi fundada en 2016 y no nombra a 52Pi. Si GeeekPi y 52Pi son la misma empresa, como sugería mi planteamiento inicial, **sigue sin verificar**.
- **El cable parecido de 52Pi** (SKU Z-0192, un pack de 3 cables de 50, 100 y 200 cm a 5,94 USD) tiene un anuncio contradictorio: el título dice "15pin 0.5mm Pitch" y la descripción "15Pin 1.0mm Pitch". No da anchura, espesor, material ni lado de contactos. No hay reseñas ni garantía propia. Lo cito como ejemplo de lo que puede encontrarse, no como tu anuncio. ([52Pi Z-0192](https://52pi.com/products/52pi-camera-cable-ribbon-for-raspberry-pi))
- **La wiki de 52Pi** (`wiki.52pi.com`) no tiene página de este cable; la búsqueda de "ribbon cable" solo devolvió el cable de Pi Zero (Z-0209) y cables de PCIe de otros productos.
- **Otro caso de metadatos poco fiables:** un anuncio de 6 cables de otro vendedor (Pastall, en desertcart) pone "RF Connector" como tipo de conector en un FFC de 15 pines. Las fichas de Amazon de cables genéricos hay que leerlas con cuidado. ([desertcart](https://www.desertcart.tw/products/208589668))
- **Garantía y devolución:** no he comprobado las condiciones de Amazon.es para este vendedor. Prueba el cable en cuanto llegue, dentro del plazo de devolución.

## 4. Documentos y normas

### 4.1 Documentos descargables

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Plano del cable oficial de cámara, 200 mm | RP-008146-DS-1 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/786-raspberry-pi-camera-module-3/documents/RP-008146-DS-1-standard-camera-cable-200mm-reference-drawing.pdf) ([copia local](datasheets/RP-008146-DS-1-standard-camera-cable-200mm-reference-drawing.pdf)) |
| Product brief de la Camera Module 3 | RP-008151-DS-1 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/786-raspberry-pi-camera-module-3/documents/RP-008151-DS-1-camera-module-3-product-brief.pdf) ([copia local](../raspberry-pi-camera-module-3/datasheets/RP-008151-DS-1-camera-module-3-product-brief.pdf)) |
| Esquema de referencia de la Camera Module 3 (conector J1) | RP-008969-SD-3 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/1207-design-files/documents/RP-008969-SD-3-Raspberry%20Pi%20Camera%20Module%203%20Reference%20Schematic.pdf) ([copia local](../raspberry-pi-camera-module-3/datasheets/RP-008969-SD-3-Raspberry_Pi_Camera_Module_3_Reference_Schematic.pdf)) |
| Esquema reducido de la Pi 3B+ | RP-008339-DS-1 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf) |
| Product brief de la Pi 3B+ | RP-008338-DS-2 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf) |
| Dibujo Molex SD-15267-001, FFC de 1,00 mm (tipos A y D), rev. B | SD-15267-001 | PDF | [descargar](https://www.farnell.com/cad/4000125.pdf) ([copia local](datasheets/4000125.pdf)) |
| Especificación GCT de FFC estándar, rev. A (07/07/23) | sin referencia visible | PDF | [descargar](https://static.chipdip.ru/lib/010/DOC042010627.pdf) |
| Hoja de datos Würth WR-FFC tipo 2, 0,5 mm (ejemplo de ensayos) | 687733100002 | PDF | [descargar](https://www.we-online.com/components/products/datasheet/687733100002.pdf) ([copia local](datasheets/687733100002.pdf)) |
| Hoja de datos Molex 151660241 (FFC de 0,5 mm, tipo A) | 151660241 | PDF | [descargar](https://www.farnell.com/datasheets/4726909.pdf) |
| Serie de conectores Amphenol FCI SFW/SLW (1,00 mm), información general | sin referencia visible | PDF | [descargar](https://docs.rs-online.com/446a/0900766b816ade50.pdf) ([copia local](datasheets/0900766b816ade50.pdf)) |
| Hoja de datos del cable oficial de 500 mm (SC1130) | SC1130 | PDF | [enlace de Farnell](https://www.farnell.com/datasheets/4759386.pdf) (**no pude abrirlo**: el permiso de la herramienta no se concedió) |
| Dibujo del cable Adafruit CFF100-15F1-XXX-BK | CFF100-15F1-XXX-BK | PDF | [enlace](https://cdn-shop.adafruit.com/product-files/2143/flex_cables_CFF100-15F1-XXX-BK.PDF) (**no pude abrirlo**, mismo motivo) |

Páginas de referencia (no PDF): [documentación oficial de cámaras](https://www.raspberrypi.com/documentation/accessories/camera.html), [OpenFlexure, cable tipo B](https://build.openflexure.org/openflexure-microscope/master/parts/electronics/camera_cable_300mm.html). El resto está en [`enlaces.md`](enlaces.md).

### 4.2 Qué dicen los más relevantes

- **Plano del cable oficial:** fija las cifras de la sección 2.2. Es la referencia para medir el cable GeeekPi: 16 mm de ancho, 15 conductores de 0,7 mm a 1 mm, extremo de 0,309 ± 0,05 mm. No es una norma: es el dibujo de un cable concreto.
- **Documentación oficial de cámaras:** contactos "hacia fuera de la tapa" (flap) en los dos extremos y, en el de la cámara, "hacia la placa de la cámara". Avisa de no doblar el cable en ángulo cerrado y de apagar y desconectar la Pi antes de enchufar. No habla de longitud máxima ni de cables de terceros.
- **Product brief de la cámara:** "Take care not to fold or strain the ribbon cable", contactos hacia la placa en el lado de la cámara. No da una longitud máxima (solo los 200 mm).
- **Especificación GCT:** es la lista más completa de ensayos de un FFC estándar que he podido leer (resistencia, aislamiento, flexión, inserción). Sirve de baremo de lo que un cable de calidad debería cumplir, pero no es la del cable de tu pedido.

### 4.3 Normas aplicables

No existe, que yo haya encontrado, **una norma única** que fije las dimensiones del FFC de cámara de Raspberry Pi. Lo que aparece en las fuentes:

| Norma o referencia | Para qué | Fuente |
|---|---|---|
| UL 758 (AWM), estilo VW-1 | Inflamabilidad y tensión/temperatura asignadas del cable | [GCT](https://static.chipdip.ru/lib/010/DOC042010627.pdf) |
| UL 2896, UL 20624, UL 20861 | Estilos de cable plano: 30 V / 60 V, hasta 80 o 105 °C | [W+P](https://wppro.com/en/series/599) |
| JIS C 3102, JIS K 6732 | Métodos de ensayo de la resistencia del conductor y del alargamiento del aislante | [GCT](https://static.chipdip.ru/lib/010/DOC042010627.pdf) |
| IPC-6013, RoHS, REACH | Citados por un fabricante de cable (marketing, no verificado) | [LCSC Cable](https://lcsccable.com/services/ffcfpc-cable) |
| RoHS 2011/65/UE | Aplica a la máquina; la cámara la cumple según su brief. Del cable no hay declaración | brief de la cámara |

**Qué implica:** un cable genérico de Amazon sin datos no permite asegurar ninguna de estas normas. No es un problema de seguridad eléctrica (3,3 V y señales), pero el cable tiene aislamiento de 60 V y 0,05 mm de PET: **no debe rozar ni quedar junto a los conductores de 230 V ni a bordes de chapa vivos** (recomendación mía, a partir de los 60 V de las fichas).

## 5. Orientación, tipo de cable y pines

### 5.1 Pinout de los conectores de 15 pines

Los tres pinouts que he encontrado (Microchip, Zephyr, Arducam) coinciden. **No salen del esquema de la Pi 3B+**: la extracción de ese PDF no dio números de pin. El esquema del módulo 3 tampoco dio la asignación. Tampoco he podido comprobar que la cámara use la misma numeración que la placa receptora, aunque es lo habitual.

| Pin | Señal | Pin | Señal |
|---|---|---|---|
| 1 | GND | 9 | CK_P |
| 2 | D0_N | 10 | GND |
| 3 | D0_P | 11 | IO0 (CAM_GPIO, habilitación) |
| 4 | GND | 12 | IO1 (CAM_GPIO, LED) |
| 5 | D1_N | 13 | SCL (I2C) |
| 6 | D1_P | 14 | SDA (I2C) |
| 7 | GND | 15 | 3V3 |
| 8 | CK_N | | |

### 5.2 Qué lado de contactos va en cada extremo

| Extremo | Qué dice la fuente | Fuente |
|---|---|---|
| Pi 3B+ | Contactos mirando al conector HDMI (cara azul hacia los USB/Ethernet) | [MagPi, ~2016](https://magazine.raspberrypi.com/articles/get-started-pi-camera), [documentación antigua](https://github.com/chapas/documentation/blob/master/usage/camera/README.md) (copia en un fork, no oficial). Arducam da como **incorrecto** "contactos hacia el jack de audio" en Pi 3 y 4 ([Arducam](https://blog.arducam.com/?p=20543)) |
| Pi, texto actual | "Contactos hacia fuera de la tapa" (flap). No nombra el HDMI | [documentación oficial](https://www.raspberrypi.com/documentation/accessories/camera.html) |
| Cámara | "Contactos hacia fuera de la tapa y hacia la placa de la cámara". El conector está en la cara opuesta a la lente | documentación oficial; brief de la cámara: "metal contacts facing the circuit board" |

**La guía de montaje (§2.2, §5.3) dice "contactos hacia el HDMI" en la Pi: es coherente con estas fuentes.** Faltan dos cosas en la guía: el lado de contactos del extremo de la cámara y el **tipo de cable** (misma cara u opuestas). No he podido comprobar en una foto o plano de la Pi 3B+ de qué lado está la tapa, así que la equivalencia "lejos de la tapa = hacia el HDMI" la deduzco de las fuentes antiguas.

### 5.3 Tipo de cable: misma cara u opuestas

- **Contactos en la misma cara:** Molex lo llama "Type A" ([Molex 151660241](https://www.farnell.com/datasheets/4726909.pdf)); Würth "Type 1" ([Wikipedia](https://en.wikipedia.org/wiki/Flexible_flat_cable)).
- **Contactos en caras opuestas:** Molex "Type D"; Würth "Type 2"; OpenFlexure y LCSC lo llaman "Type B". **Los nombres cambian de un fabricante a otro. Pide y comprueba "contactos en caras opuestas", no una letra.**
- **El cable oficial es de caras opuestas.** Lo dicen Arducam ("opposite side contactor") y OpenFlexure ("Type B, con conexiones en caras opuestas en los dos extremos"). El plano de Raspberry Pi no lo indica, así que es información de terceros.
- **Cómo se ve:** con el cable plano sobre la mesa, el refuerzo (cinta azul o blanca) está en la cara contraria a los contactos. En un cable de caras opuestas, **un refuerzo queda arriba y el otro abajo**. En uno de la misma cara, los dos refuerzos quedan en la misma cara. OpenFlexure lo pide así: "una pestaña azul por cara" ([incidencia #392](https://gitlab.com/openflexure/openflexure-microscope/-/issues/392)).

### 5.4 Qué pasa si se monta mal

| Caso | Qué pasa | Fuente |
|---|---|---|
| Cable con los contactos hacia el lado equivocado en un conector | Los contactos tocan la parte aislante del conector: no hay conexión y la cámara no se detecta. No he encontrado ninguna fuente oficial que hable de daños por esto | [Core Electronics](https://forum.core-electronics.com.au/t/issues-with-camera-module/2950): "el cable solo funciona de una manera" |
| Cable mal asentado en el ZIF | Cámara no detectada (`detected=0`) o fallos intermitentes; en un hilo se arregló reasentando el conector | [element14](https://community.element14.com/products/raspberry-pi/f/forum/47406/raspberry-pi-camera/64718), [Core Electronics](https://forum.core-electronics.com.au/t/camera-board-v2-issue/1357) |
| Cable en el puerto DISPLAY en vez de CAMERA | Un moderador de element14 dice que el daño a la cámara "es posible"; el hilo no confirma daño real | [element14](https://community.element14.com/products/raspberry-pi/f/forum/47406/raspberry-pi-camera/64367) |
| **Cable de tipo equivocado, o torcido media vuelta, de modo que el orden de pines queda invertido** | OpenFlexure: la cámara "se quema en pocos segundos". Un hilo de OpenMV (otro producto) cuenta sensores y una placa muertos con un cable de extensión mal orientado; allí la causa es opinión de un usuario | [OpenFlexure](https://build.openflexure.org/openflexure-microscope/master/parts/electronics/camera_cable_300mm.html), [#392](https://gitlab.com/openflexure/openflexure-microscope/-/issues/392), [OpenMV](https://forums.openmv.io/t/openmv-camera-module-extension-cable-kills-image-sensors/7840) |
| Electricidad estática al manipular la cámara | Puede dañarla | moderador de element14 |

**Deducción mía (no está en las fuentes):** si el orden de los hilos queda invertido, el pin n de la Pi llega al pin 16−n de la cámara. El 3V3 (pin 15) iría a la masa de la cámara (pin 1) y la masa de la Pi a su alimentación. Los datos caerían sobre SDA, SCL y CAM_GPIO, y varias masas sobre señales. Esto encaja con el aviso de OpenFlexure de un "cortocircuito" y el daño.

**Un pliegue no es lo mismo que una torsión (deducción mía, geométrica).** Doblar el cable sobre sí mismo (un doblez a lo ancho) cambia la cara pero **conserva** el orden de los hilos. Torcerlo media vuelta sobre su eje cambia la cara y **invierte** el orden. Si, para que los contactos queden bien en los dos conectores, hay que dar al cable una media vuelta, algo no cuadra (tipo de cable, orientación de una placa o conector equivocado). No lo fuerces: compáralo con el cable oficial.

### 5.5 Contraste con la guía de montaje

| Afirmación de la guía | Resultado |
|---|---|
| Fila 4 de la lista: el cable de 20 cm que trae la cámara no llega | Coincide con el plano oficial (200 ± 1 mm) |
| §2.2 y §5.3: en la Pi, contactos hacia el conector HDMI, con la Pi apagada | **Coherente** con MagPi (~2016), la documentación antigua y Arducam. La documentación actual lo expresa como "lejos de la tapa" sin nombrar el HDMI |
| §5.3: conectar al puerto "CSI CAMERA" | Correcto. El otro conector de 15 pines de la Pi es el de pantalla (DSI) |
| Lado de contactos en el extremo de la cámara | **No aparece en la guía.** Es hacia la placa de la cámara (documentación oficial, brief) |
| Tipo de cable (contactos en caras opuestas) y paso de 1 mm | **No aparecen en la guía** ni, hasta donde sé, en el anuncio. Son lo que más importa (5.3, 5.4) |
| Dónde va la cámara | La guía (§4) la pone en la caja de arriba y la Pi en la caja interior suspendida. Mi planteamiento inicial de esta ficha hablaba de una puerta. Con la guía no hay puerta con bisagra, pero sí un tramo que cruza de una caja fija a una colgada de muelles (7.2) |

## 6. Longitud: qué dicen Raspberry Pi y la comunidad

La ficha de la cámara ya cita el comentario de Raspberry Pi y el kit HDMI. Esto es lo nuevo:

| Dato | Fuente |
|---|---|
| **Raspberry Pi vende un cable oficial de 500 mm** para cámaras de 15 pines: SC1130, "Standard-Mini", para Pi 5 y Zero (extremo de 22 pines y 0,5 mm en la Pi, 15 pines y 1 mm en la cámara). Cuesta 3,50 € en BerryBase. Es otro cable (otro conector en un extremo) y otra Pi; las fichas de las tiendas no nombran la Camera Module 3 en la compatibilidad | [DigiKey](https://digikey.cn/en/products/detail/raspberry-pi/SC1130/21658263), [Kiwi](https://www.kiwi-electronics.com/en/raspberry-pi-camera-accessories-133/raspberry-pi-camera-cable-standard-mini-500mm-11590), [BerryBase](https://www.berrybase.de/raspberry-pi-camera-cable-standard-mini-500mm), [CPC Farnell](https://cpc.farnell.com/raspberry-pi/sc1130/fpc-cables-camera-500mm/dp/SC20203) |
| BerryBase dice que ese cable es "blindado" (afirmación de la tienda, sin verificar) y se contradice: pone 500 mm y en la tabla "20 cm" | BerryBase |
| The Imaging Source (cámaras industriales MIPI): "la mayoría de fabricantes recomiendan unos 30 cm"; hasta 50 cm "con buen diseño y materiales de calidad"; con adaptadores se llega a 1 m. Avisa de que "no todos los cables FPC son iguales". Es guía de un fabricante de cámaras, sin datos de ensayo, y habla de FPC, no de FFC | [The Imaging Source](https://www.theimagingsource.com/en-us/support/knowledge-base/mipi-csi-2-cameras-fpc-cable-length/) |
| Factores que acortan la longitud permitida: velocidad por carril, número de carriles, resolución y fotogramas, sensibilidad del receptor y ruido ambiental | The Imaging Source |
| Adafruit probó un cable de **1 m** con una Pi B/B+ y una cámara y "funcionó muy bien", pero avisa de que 1 m es mucho para este protocolo y que en entornos con ruido puede haber imágenes corruptas | [Adafruit 2143](https://www.adafruit.com/products/2143) |
| Arducam vende cables de 15 pines de 30, 50, 100 y 200 cm y una extensión de "hasta 15 m" (tienda); su documentación no da un límite | [Arducam (blog)](https://blog.arducam.com/?p=20543), [Arducam (docs)](https://docs.arducam.com/Camera-Extension-Solution/MIPI-Camera-Cable/), [Robu](https://robu.in/product/arducam-cable-extension-kit-for-raspberry-pi-camera-up-to-15-meter-extension-compatible-with-raspberry-pi-camera/) |
| Un colaborador anónimo de element14 afirma que la cámara "puede usar una cinta de hasta 300 mm como máximo". No cita fuente ni es personal de Raspberry Pi | [element14](https://community.element14.com/technologies/experts/f/forum/44063/raspberry-pi-camera-ribbon-cable) |
| **EMI y blindaje:** un usuario envolvió cámara y cinta en cinta aislante, papel de aluminio y otra capa de cinta para bloquear el GPS, y la Pi dejó de ver la cámara; un usuario del hilo supone que el aluminio cortocircuitaba contactos (hipótesis, sin confirmar) | [Emlid](https://community.emlid.com/t/raspi-camera-not-working-after-beinfg-shielded/2869) |
| La documentación oficial avisa de que el módulo 3 puede emitir interferencia en un armónico del reloj CSI que afecta a la banda GPS L1 | [documentación oficial](https://www.raspberrypi.com/documentation/accessories/camera.html) |

**Lo que no he encontrado:**

- Ninguna cifra de Raspberry Pi para la Pi 3B+ ni para la Camera Module 3 con cable plano.
- Ningún informe verificado de fallos con 50 cm en esta combinación.
- Datos de impedancia del cable oficial ni de este.

**Síntomas típicos de un enlace marginal** (de un blog de terceros con errores en otros puntos, por ejemplo afirma que la Pi 3B+ usa cable de 22 pines, **sin verificar con fuente primaria**): mensajes `Camera frontend has timed out` y `Dequeue timer ... has expired` de libcamera, y cámara que desaparece del listado. Su pronóstico "60 % por orientación o asiento del cable" es una opinión. ([industrialmonitordirect](https://industrialmonitordirect.com/blogs/knowledgebase/raspberry-pi-camera-timeout-error-resolution-guide)) No pude abrir el apartado de resolución de problemas de la [documentación oficial de rpicam](https://www.raspberrypi.com/documentation/computers/camera_software.html): la herramienta lo cortó.

### Caída de tensión en el cable (cálculo mío)

La alimentación de 3V3 va por **un solo conductor** (pin 15) y vuelve por cuatro de masa (1, 4, 7 y 10).

- Fórmula: R = ρ · L / S, con ρ = 0,0172 Ω·mm²/m (cobre).
- Sección con las cifras del plano oficial: S = 0,700 mm × 0,027 mm = 0,0189 mm².
- Sustitución: R = 0,0172 × 0,5 / 0,0189 ≈ **0,46 Ω** por conductor a 50 cm. Con la tolerancia del espesor (0,017 mm) subiría a ≈ 0,72 Ω.
- Masa en paralelo (4 conductores): ≈ 0,11 Ω. Bucle ≈ 0,57 Ω.
- Con 250 mA (cifra de la guía, sin fuente: el brief de la cámara no da consumo): caída ≈ 0,14 V.

| Magnitud | Resultado |
|---|---|
| R de 1 conductor a 50 cm | ≈ 0,46 Ω |
| Bucle 3V3 + masa | ≈ 0,57 Ω |
| Caída a 250 mA | ≈ 0,14 V |
| Límite del fabricante GCT (1,1 Ω/m) a 50 cm | 0,55 Ω por conductor |

Es pequeña frente a 3,3 V, pero **no sé qué tensión mínima admite el módulo 3** (sus reguladores de 1,8 V y 2,8 V están en la cámara, según el esquema de referencia). Con un cable de cobre más fino y largo la caída sube. Es otro motivo para no pasar de 50 cm.

## 7. Mecánica: curvatura, flexión y conectores ZIF

### 7.1 Radio mínimo de curvatura

No he encontrado ninguna cifra de Raspberry Pi ni del fabricante del cable para el radio mínimo del FFC de cámara. Lo que hay:

| Dato | Fuente |
|---|---|
| FFC: radio ≥ 6 veces el espesor en estático y ≥ 10 veces en dinámico (afirmación de un fabricante de cable) | [LCSC Cable](https://lcsccable.com/services/ffcfpc-cable) |
| Cables FPC: radio de 10 veces el espesor "para un funcionamiento fiable" | [Teledyne FLIR](https://flir.com/support-center/iis/machine-vision/knowledge-base/what-is-the-bend-radius-of-my-flex-cable) |
| Un ensayo de plegado de otro cable de Molex usa 180° y radio 4 mm (citado en un foro; no he visto el documento) | [SparkFun](https://community.sparkfun.com/t/smol-questions-regarding-ffc-cable-mounting/43424) |
| Un fabricante de cable dice que la temperatura máxima de un FFC plegado o muy curvado baja al menos 30 °C | [W+P](https://wppro.com/en/series/599) |
| La documentación oficial pide "no doblar el cable en ángulo cerrado" y el brief "no plegarlo ni tensarlo" | documentación oficial, brief |

**Cálculo mío con cifras del plano:** el espesor total del cuerpo del cable no está en el plano. Adafruit da 0,2 mm para su cable de 1 m. Con 0,2 mm, 10 veces son 2 mm y 6 veces son 1,2 mm. Son radios muy pequeños: **un doblez a 90° de pocos milímetros es un pliegue, no una curva.** Son mínimos teóricos de fabricantes de otros cables; para la ruta real conviene un radio bastante mayor (recomendación 5).

### 7.2 Flexión repetida

- **En un FFC estándar, la flexión continua no es el uso previsto.** Las garantías que he visto son bajas: GCT, 100 ciclos de plegado y 100 000 de ensayo alternativo; Würth, 20 plegados de 180°. Un fabricante vende FFC "de alta flexibilidad" con 5 000 a 100 000 ciclos al radio asignado (marketing de [LCSC](https://lcsccable.com/services/ffcfpc-cable)).
- **Tu caso:** según la guía (§4), la cámara va en la caja de arriba (fija) y la Pi en la caja interior suspendida con muelles. No hay puerta con bisagra: el cable cruza entre una parte fija y otra que se mueve. Cada golpe o vibración flexiona un poco el cable. Si el diseño final pone la cámara en una puerta que se abre, el cable tendría flexión repetida real, y un FFC estándar **no es la solución**: hay que recurrir a cable de alta flexibilidad o a otro conexionado.
- El cable aguanta mejor en una curva suave con holgura que en un tramo corto y tenso. Es una conclusión mía.

### 7.3 Conectores ZIF de 1 mm

- **La tapa o lengüetas negras de la Pi se rompen si se fuerzan.** Hay un conector de repuesto (CSI/DSI de Pi 4/3/2/B+) en Adafruit y The Pi Hut; la reparación exige retirar el roto (las tiendas recomiendan Chip Quik) y soldar el nuevo. Ambas tiendas lo atribuyen a abrir las lengüetas con demasiado entusiasmo ([Adafruit](https://adafruit.com/product/4728), [The Pi Hut](https://thepihut.com/collections/raspberry-pi-camera/products/replacement-csi-dsi-connector-for-raspberry-pi-repair-part)). Un hilo de NVIDIA cuenta lo mismo en un Jetson con una cinta de cámara de Raspberry Pi: la lengüeta se rompió al insertar; un usuario la sujetó con una gota de cola caliente ("no sirve para producción") ([NVIDIA](https://forums.developer.nvidia.com/t/csi-camera-connector-broke/76806)).
- **Vida de inserción:** 20 a 30 ciclos en las hojas de FFC (GCT, Würth). Cada vez que quites y pongas el cable gastas uno. No he encontrado la cifra del conector de la Pi 3B+ ni de su fabricante. Adafruit enlaza un dibujo "Kaweei CF1006-15T1-M01-D" del conector de repuesto, **sin verificar** que sea el de la placa.
- **El conector de la cámara** (Amphenol SFW15R-1STE1LF) es de contacto inferior y sin bloqueo adicional ([RS](https://uk.rs-online.com/web/p/fpc-connectors/1822728P)).
- **Opiniones de foro:** un mensaje del foro de Core Electronics (sobre cámaras NoIR) dice que los cables a veces se sueltan en el envío o en el uso ([Core Electronics](https://forum.core-electronics.com.au/t/raspberry-pi-camera-s-common-issues/9492)). En el hilo de Emlid se advierte de que la cinta es frágil y de que las curvas cerradas y las inserciones repetidas la dañan ([Emlid](https://community.emlid.com/t/raspi-camera-not-working-after-beinfg-shielded/2869)).

## 8. Fallos, bugs y problemas conocidos

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | Cable de tipo equivocado u orden de pines invertido | **Alta** si pasa: puede quemar la cámara. Fácil de evitar |
| 2 | Paso, anchura o espesor fuera de medida (anuncio ambiguo) | Media: no encaja o no hace contacto |
| 3 | Lengüeta del ZIF de la Pi rota | Media-alta: obliga a soldar |
| 4 | Cable que se afloja o sale con vibración | Media-alta en una máquina de bar |
| 5 | 50 cm: errores de captura | Media, sin confirmar |
| 6 | Flexión repetida por la suspensión | Media |
| 7 | Cable dañado de fábrica (pliegues, pistas, aislamiento, extremos) | Media |
| 8 | Cable en el puerto DISPLAY o desconectado en caliente | Media |
| 9 | Blindaje casero que cortocircuita | Baja si no se hace |
| 10 | Sin ficha, sin garantía clara, anuncio inestable | Baja |

### 8.1 Tipo de cable equivocado

Ver [sección 5](#5-orientación-tipo-de-cable-y-pines). OpenFlexure documenta que hay vendedores de Amazon con el refuerzo azul en la misma cara de los dos extremos, y que eso "invierte las conexiones". Piden una advertencia a los usuarios y "una advertencia general sobre vendedores de terceros". La incidencia no trae fecha ni respuestas en lo que pude leer. El plano oficial no indica el tipo, así que lo único comprobable es comparar con el cable oficial.

### 8.2 Medidas fuera de tolerancia

- Un cable de 15 conductores a 0,5 mm de paso mediría unos 8 mm de ancho (cálculo mío) y no sirve para el conector de 1 mm.
- El anuncio de 52Pi mezcla "0.5mm" y "1.0mm" en la misma página. Si el de GeeekPi hace lo mismo no lo sé.
- El extremo enchufable debe rondar 0,30 mm ([W+P](https://wppro.com/en/series/599); plano oficial: 0,309 ± 0,05 mm). Un extremo demasiado fino no queda sujeto por el ZIF; uno demasiado grueso puede no entrar o forzar las lengüetas.

### 8.3 Lengüeta rota

Ver 7.3. La causa habitual citada es la fuerza al abrir.

### 8.4 Cable que sale con vibración

La documentación oficial dice que hay que cerrar la tapa hasta que haga clic. Los foros cuentan cintas desasentadas en el transporte (ver 7.3). En una máquina de bar con golpes, la sujeción mecánica del cable es parte del diseño. (Recomendaciones, sección 11.)

### 8.5 Errores a 50 cm

No hay informes verificados (sección 6). La ficha de la cámara ya marca esto como "media, sin confirmar".

### 8.6 y 8.7 Flexión y daños de fábrica

- Flexión: ver 7.2.
- Daños de fábrica: no he encontrado un estudio de calidad de cables FFC de Amazon. Lo que hay son incidencias aisladas: una cámara con cable que llegó con un pliegue del embalaje, que el moderador de la tienda consideró inocuo (el hilo no resuelve la causa; no era un cable de Amazon) ([Core Electronics](https://forum.core-electronics.com.au/t/camera-board-v2-issue/1357)); y los casos de tipo equivocado. **Los fallos que se esperan de cualquier FFC** (pista de cobre rota por un pliegue, aislante picado o delaminado, extremo sin refuerzo, contactos rayados o sucios, longitud fuera de tolerancia) **son deducción mía**, no están documentados para este cable.
- Los fabricantes dan tolerancias de longitud de ±2 mm a ±5 mm según el cable ([Molex SD-15267-001](https://www.farnell.com/cad/4000125.pdf) ([copia local](datasheets/4000125.pdf)); plano oficial: ±1 mm a 200 mm), así que un cable de "50 cm" que mida 49 o 51 cm no es un defecto.

### 8.8 a 8.10

- **Puerto DISPLAY:** ver 5.4. Con pantalla HDMI, el DSI no se usa; conecta siempre al conector rotulado CAMERA.
- **Conectar en caliente:** la documentación oficial y MagPi dicen que se apague y desconecte la Pi antes de enchufar o desenchufar. La guía ya lo recoge.
- **Foil casero:** ver sección 6 (Emlid). Si se quiere blindar, el blindaje debe estar aislado de los contactos.

## 9. Qué comprobar al recibirlo

Haz estas comprobaciones el mismo día, dentro del plazo de devolución. Los umbrales de continuidad y de resistencia son criterios míos; los valores de referencia salen de las fuentes citadas.

### 9.1 Con calibre y a simple vista

1. **Anchura 16,0 mm ± 0,1** y **15 conductores**, con el primero a ~1 mm del borde ([plano oficial](https://pip-assets.raspberrypi.com/categories/786-raspberry-pi-camera-module-3/documents/RP-008146-DS-1-standard-camera-cable-200mm-reference-drawing.pdf) ([copia local](datasheets/RP-008146-DS-1-standard-camera-cable-200mm-reference-drawing.pdf))). Entre el centro del primero y el del último, 14 mm (cálculo mío).
2. **Paso 1,00 mm** y conductor de ~0,7 mm.
3. **Espesor del extremo enchufable: 0,30 mm** (oficial: 0,309 ± 0,05). Mídelo con un micrómetro o un calibre, con el cable relajado.
4. **Refuerzo en los dos extremos**, en la cara contraria a los contactos, de unos 6 mm de largo. Un extremo sin refuerzo es demasiado fino para el ZIF.
5. **Tipo:** con el cable plano, los refuerzos deben estar en **caras opuestas** (uno arriba y uno abajo). Compáralo con el cable oficial de 200 mm de la cámara, extremo con extremo.
6. **Contactos:** ~5 mm de cobre al descubierto (oficial: 5,0 ± 0,5), limpios, sin arañazos ni cobre levantado, y a la misma altura en los dos extremos.
7. **Longitud:** 500 mm con una tolerancia de pocos milímetros.
8. **Cuerpo del cable:** sin pliegues marcados, arrugas, burbujas o aislante rasgado. Mira a contraluz.

### 9.2 Con polímetro (apagado, sin nada conectado)

El paso de 1 mm exige puntas finas o un adaptador FFC a pines. **No aprietes: se raya el estaño.**

1. **Continuidad pin a pin, sin cruces.** Identifica el conductor 1 por el mismo borde del cable en los dos extremos. Con el cable plano, los contactos de un extremo quedan arriba y los del otro abajo (tipo B): numera ambos desde el mismo borde y comprueba que el 1 conecta con el 1, el 2 con el 2... hasta el 15. Un orden invertido (1↔15) es un cable no válido.
2. **Aislamiento entre vecinos.** Entre conductores contiguos y entre cada uno y los demás, el polímetro en ohmios debe marcar abierto (OL). Un valor bajo indica cortocircuito o suciedad.
3. **Resistencia comparada.** Con la función REL/cero para restar la resistencia de las puntas, los 15 conductores deben dar valores parecidos. La cota del fabricante GCT es 0,55 Ω a 50 cm (1,1 Ω/m); un polímetro corriente no mide bien por debajo de 1 Ω, así que busca valores muy distintos entre conductores, no un número absoluto. Un conductor con más resistencia que los demás sugiere una grieta.
4. **Prueba de flexión.** Con el polímetro en continuidad en un conductor, dobla suavemente el cable en toda su longitud y cerca de los refuerzos. Si la lectura salta, el cable está dañado. Repítelo en unos cuantos conductores (sobre todo el 15, el 13 y el 14, que son 3V3, SCL y SDA).
5. **Etiqueta.** Marca el cable con la fecha y el resultado.

### 9.3 Prueba funcional

Primero con el cable oficial de 200 mm, para saber que cámara y Pi van bien; después con el de 50 cm, en la ruta final.

1. `rpicam-hello --list-cameras` debe listar el `imx708` (ver [ficha de la cámara](../raspberry-pi-camera-module-3/README.md#6-recomendaciones-para-el-alcoholímetro)). Una cámara "desaparecida" es un cable mal asentado, de tipo equivocado o dañado.
2. `dmesg` sin errores de la cámara, y `vcgencmd get_throttled` en `0x0`.
3. Deja la vista previa corriendo horas (`rpicam-hello -t 0`) con el cable en su ruta final, moviéndolo suavemente y golpeando la caja. Si hay imágenes cortadas, rayas o pérdidas de la cámara, cambia de cable antes de culpar a la cámara.
4. Si falla solo con 50 cm y va con 20 cm, el cable o la longitud es el problema. Prueba con otro cable de la misma longitud y con uno de 30 cm.

Son pasos míos. `rpicam-hello --list-cameras` es el comando de la ficha de la cámara; `-t 0` (sin límite de tiempo) lo pongo de memoria, **sin verificar**.

## 10. Alternativas

Solo hay motivo si el cable llega mal o si falla a 50 cm.

| Alternativa | Dato | Fuente |
|---|---|---|
| Cable de **30 cm**, si la ruta lo permite | The Imaging Source dice que la mayoría de fabricantes recomienda unos 30 cm. OpenFlexure usa un cable de 30 cm de tipo B (Farnell 3527258, The Pi Hut 102795) | [OpenFlexure](https://build.openflexure.org/openflexure-microscope/master/parts/electronics/camera_cable_300mm.html), [Imaging Source](https://www.theimagingsource.com/en-us/support/knowledge-base/mipi-csi-2-cameras-fpc-cable-length/) |
| Cable Multicomp PRO de 15 pines "opposite side", 200 mm (Farnell 3385343) | Muestra que existe el tipo con el nombre correcto; hay que ver si hay versión de 50 cm | [Farnell](https://uk.farnell.com/multicomp-pro/mp-ffca10152003b/ffc-cord-15p-opposite-side-200mm/dp/3385343) (enlace visto en la página de OpenFlexure) |
| Cables Adafruit (50, 100, 200, 300, 457 y 610 mm y 2 m; el de 1 m salía agotado) | El anuncio dice que sustituyen al cable de serie de cámara y pantalla; no indica paso, nº de contactos ni tipo (el dibujo no se abrió) | [Adafruit 2143](https://www.adafruit.com/products/2143) |
| Cables Arducam de 30, 50, 100 y 200 cm | El tipo no se indica | [Arducam](https://docs.arducam.com/Camera-Extension-Solution/MIPI-Camera-Cable/) |
| Si algún día se cambia a Pi 5 | Cables oficiales "Standard-Mini" de 300 y 500 mm (extremo de 22 pines en la Pi) | [Kiwi 300 mm](https://www.kiwi-electronics.com/en/raspberry-pi-camera-cable-standard-mini-300mm-11589), [Kiwi 500 mm](https://www.kiwi-electronics.com/en/raspberry-pi-camera-accessories-133/raspberry-pi-camera-cable-standard-mini-500mm-11590) |
| Acercar la cámara y la Pi para usar el cable oficial de 200 mm | Es el cable con el que viene la cámara | documentación oficial, brief |

## 11. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Comprueba el tipo al recibirlo** (9.1, punto 5) y no lo enchufes si los dos refuerzos están en la misma cara. Compara siempre con el cable oficial de 200 mm.
2. **Primera conexión con la Pi apagada y desconectada**, en el conector rotulado CAMERA (no en DISPLAY), con los contactos hacia el HDMI en la Pi y hacia la placa en la cámara. Sin torsión: si ves que necesitas una media vuelta, para.
3. **Prueba de banco antes de montar la caja** con la cámara y la Pi reales, el cable de 50 cm en la ruta definitiva y 24 h de vista previa. En los primeros minutos, comprueba que la cámara no se calienta de forma anormal; si lo hace, desconecta.
4. **Mide la ruta real** en el CAD de la carcasa. Si 30 cm llegan con holgura, usa 30 cm (la longitud más recomendada). Si no, 50 cm vale, pero el sobrante debe quedar en una curva suave, no apretado en un pliegue.
5. **Radio holgado.** Recomiendo un radio mínimo de unos 10 mm en cualquier curva, sin pliegues marcados, y que el cable no se doble justo en el borde del refuerzo. Es una cifra mía, mucho más conservadora que los 1-2 mm teóricos de la sección 7.1.
6. **Sujeta el cable cerca de cada conector** (a unos 2-3 cm) con una abrazadera o cinta con espuma, de forma que el tirón no llegue a la lengüeta ni al contacto, y deja una curva de servicio entre la caja fija y la suspendida. Los muelles harán que el cable trabaje. Evita la cola caliente sobre el conector (un usuario de NVIDIA la usó como apaño provisional con una lengüeta rota y avisó de que no vale para producción).
7. **Paso por el separador:** un FFC de 16 mm de ancho necesita un paso de al menos 16-18 mm. En un pasacables redondo (pieza 31 de la hoja) ese tamaño lo deja suelto y roza por los bordes. Mejor una ranura de unos 18 × 3 mm con los bordes redondeados o protegidos, para que la chapa no corte el aislante (en el plano oficial, 0,055 mm de espesor).
8. **Lejos de la fuente y del 230 V.** La LRS-50-5 y el cableado de red van en la misma caja de arriba que la cámara. El cable tiene aislamiento de 60 V: no debe rozar la fuente ni conductores de red, y conviene alejarlo del cable de la antena Wi-Fi.
9. **No añadas papel de aluminio** ni blindajes caseros. Si el cable da errores, prueba antes otro cable.
10. **Compra 2 o 3 cables** (7,99 € cada uno) por tanda: uno de prueba al recibir, uno de repuesto en la máquina. Cada extracción gasta uno de los 20-30 ciclos de inserción.
11. **Si la cámara acaba en una puerta que se abre**, el diseño cambia: hay que consultar cable de alta flexibilidad o un cableado distinto, y no basta con este FFC.
12. **Documenta el lote:** guarda fotos del cable, el anuncio y el resultado de las pruebas, por si hay que reclamar.

## 12. Lo que no he podido verificar

- **El anuncio de Amazon** (B07DKB4M1H): vendedor, pack o cable suelto, paso, anchura, tipo de contactos, material, temperatura.
- **Que GeeekPi sea una marca de 52Pi**, y cualquier ficha o wiki oficial del cable.
- **El tipo del cable oficial de Raspberry Pi** por una fuente primaria: el plano no lo indica; viene de Arducam y OpenFlexure.
- **Que la cámara use la misma numeración de pines que la Pi** (esquema sin números de pin extraídos).
- **De qué lado está la tapa del conector en la Pi 3B+**; la equivalencia "lejos de la tapa = hacia el HDMI" sale de fuentes de 2016.
- **Los efectos reales de un orden de pines invertido** en la Pi 3B+ y en la Camera Module 3: OpenFlexure afirma que se quema; no hay prueba independiente, y mi pinout invertido es deducción.
- **La longitud máxima** para la Pi 3B+ con la Camera Module 3; el cálculo de la caída de tensión usa el consumo de la guía (250 mA), que no tiene fuente.
- **El radio mínimo de curvatura y el número de flexiones** de este cable: las cifras son de fabricantes de otros cables.
- **La hoja de datos del cable oficial de 500 mm (SC1130)** y **el dibujo del cable de Adafruit**: no los pude abrir.
- **La sección de resolución de problemas** de la documentación de rpicam (cortada por la herramienta) y el significado oficial de `Camera frontend has timed out`.
- **Condiciones de garantía y devolución** del vendedor en Amazon.es.
- **Reseñas de compradores** del cable GeeekPi y de cables FFC de Amazon en general: no las he visto. El cupo de búsquedas web se agotó durante la investigación, así que no pude buscar más hilos de foro sobre cables de 50 cm ni sobre cables baratos defectuosos. Si quieres que lo siga, dímelo en un mensaje aparte.
- **Las normas del cable** (UL, RoHS, REACH): sin declaración del fabricante.

## 13. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos) y carpeta [`datasheets/`](datasheets/).

Todos los enlaces, ordenados por tipo, en [`enlaces.md`](enlaces.md).
