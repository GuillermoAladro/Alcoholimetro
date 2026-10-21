# Raspberry Pi Camera Module 3 (estándar, no NoIR)

Cámara que hace la foto al usuario antes de mostrarla en pantalla junto al resultado. Va conectada al puerto CSI de la Raspberry Pi 3B+ con un cable plano de 50 cm.

- **Variante del proyecto:** Standard (con filtro de infrarrojos, objetivo normal de 66° × 41°). Se descartó la NoIR.
- **Compra:** ASIN B0BRY6MVXL, 48,04 € (precio de la hoja de componentes del 19-20-10-2026).

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta, así que no he podido ver el anuncio concreto: el precio y la referencia son los de tu hoja.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales](#3-documentos-oficiales)
4. [Software y uso con la Pi 3B+](#4-software-y-uso-con-la-pi-3b)
5. [Fallos, bugs y problemas conocidos](#5-fallos-bugs-y-problemas-conocidos)
6. [Recomendaciones para el alcoholímetro](#6-recomendaciones-para-el-alcoholímetro)
7. [Lo que no he podido verificar](#7-lo-que-no-he-podido-verificar)
8. [Fuentes](#8-fuentes)

---

## 1. Resumen para el proyecto

- **Hay dos avisos de cambio de producto de 2026** (PCN 42 y PCN 43). Los módulos nuevos ya no llevan EEPROM interna y salen con la memoria OTP del sensor preprogramada. Raspberry Pi dice que no hay cambios físicos ni eléctricos, pero **no menciona la Pi 3**: conviene probar la cámara nada más recibirla.
- **El autofoco puede dar problemas a corta distancia.** A unos 40 cm de la cara, mejor disparar un ciclo de autofoco antes de la foto o fijar la posición de la lente, en vez de fiarse del modo continuo.
- **Temperatura de trabajo: 0–50 °C.** La cámara va en la caja de arriba junto a la fuente de alimentación; hay que medir la temperatura dentro de la máquina cerrada.
- **En la Pi 3 la vista previa por GPU está limitada a 2048 píxeles** por lado (manual de Picamera2). Para la foto final no hay ese límite.
- **Producción garantizada al menos hasta enero de 2030**, según el product brief. Sin problema de suministro a corto plazo.

## 2. Especificaciones

Fuente: [product brief RP-008151-DS-1](https://pip-assets.raspberrypi.com/categories/786-raspberry-pi-camera-module-3/documents/RP-008151-DS-1-camera-module-3-product-brief.pdf) ([copia local](datasheets/RP-008151-DS-1-camera-module-3-product-brief.pdf)) (junio de 2024), salvo donde se indica.

| Característica | Valor |
|---|---|
| Sensor | Sony IMX708, CMOS apilado de iluminación trasera |
| Resolución | 11,9 MP (4608 × 2592), se vende como 12 MP |
| Tamaño de píxel | 1,4 × 1,4 µm |
| Diagonal del sensor | 7,4 mm |
| Salida | RAW10 |
| Modo HDR | Hasta 3 MP |
| Modos de vídeo | 1080p50, 720p100, 480p120 |
| Objetivo (Standard) | Focal 4,74 mm, F1,8 |
| Campo de visión (Standard) | 75° diagonal, 66° horizontal, 41° vertical |
| Enfoque | Autoenfoque por detección de fase (PDAF), de 10 cm a infinito |
| Filtro IR | Con filtro de corte IR (la NoIR no lo lleva) |
| Dimensiones | 25 × 24 × 11,5 mm |
| Cable incluido | Plano (FPC) de 200 mm, conector de 15 × 1 mm |
| Temperatura de operación | 0 a 50 °C |
| Cumplimiento | FCC 47 CFR Parte 15 Subparte B Clase B, Directiva EMC 2014/30/UE, RoHS 2011/65/UE |
| Producción garantizada | Al menos hasta enero de 2030 |
| MTBF | No lo da el documento |

Datos de la [documentación oficial de cámaras](https://www.raspberrypi.com/documentation/accessories/camera.html):

- Tiempo de exposición de hasta 112 segundos.
- Existen cuatro variantes: Standard y NoIR, cada una con objetivo normal o gran angular.
- Conector de 15 pines en las Raspberry Pi hasta la Pi 4 (incluida): se usa el cable Standard-Standard que viene con la cámara. La Pi 5, Zero y las placas IO de Compute Module usan un conector mini de 22 pines y otro cable.
- La página no nombra la Pi 3 explícitamente, pero dice que los módulos son compatibles con todos los equipos con conector CSI.

## 3. Documentos oficiales

Catálogo oficial del producto: <https://pip.raspberrypi.com/categories/786-raspberry-pi-camera-module-3> (actualizado el 6-10-2025 y posteriores).

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Product brief | RP-008151-DS-1 | PDF (1,2 MB) | [descargar](https://pip-assets.raspberrypi.com/categories/786-raspberry-pi-camera-module-3/documents/RP-008151-DS-1-camera-module-3-product-brief.pdf) ([copia local](datasheets/RP-008151-DS-1-camera-module-3-product-brief.pdf)) |
| Plano mecánico (Standard) | RP-008153-DS-1 | PDF (930 KB) | [descargar](https://pip-assets.raspberrypi.com/categories/1207-design-files/documents/RP-008153-DS-1-camera-module-3-standard-mechanical-drawing.pdf) ([copia local](datasheets/RP-008153-DS-1-camera-module-3-standard-mechanical-drawing.pdf)) |
| Modelo 3D STEP | RP-008154-DS-1 | ZIP (9,5 MB) | [descargar](https://pip-assets.raspberrypi.com/categories/1207-design-files/documents/RP-008154-DS-1-camera-module-3-step.zip) ([copia local](datasheets/RP-008154-DS-1-camera-module-3-step.zip)) |
| Esquema de referencia | RP-008969-SD-3 | PDF (260 KB) | [descargar](https://pip-assets.raspberrypi.com/categories/1207-design-files/documents/RP-008969-SD-3-Raspberry%20Pi%20Camera%20Module%203%20Reference%20Schematic.pdf) ([copia local](datasheets/RP-008969-SD-3-Raspberry_Pi_Camera_Module_3_Reference_Schematic.pdf)) |
| Lista de materiales de referencia (BOM) | RP-008970-BM-2 | XLSX (12 KB) | [descargar](https://pip-assets.raspberrypi.com/categories/1207-design-files/documents/RP-008970-BM-2-RASPBERRY%20PI%20CAMERA%20MODULE%203%20Reference%20Design%20BOM.xlsx) ([copia local](datasheets/RP-008970-BM-2-RASPBERRY_PI_CAMERA_MODULE_3_Reference_Design_BOM.xlsx)) |
| Plano del cable de cámara de 200 mm | RP-008146-DS-1 | PDF (52 KB) | [descargar](https://pip-assets.raspberrypi.com/categories/786-raspberry-pi-camera-module-3/documents/RP-008146-DS-1-standard-camera-cable-200mm-reference-drawing.pdf) ([copia local](../cable-ffc-camara-50cm/datasheets/RP-008146-DS-1-standard-camera-cable-200mm-reference-drawing.pdf)) |
| Manual de Picamera2 (86 págs.) | RP-008156-DS-6 | PDF (2,8 MB) | [descargar](https://pip-assets.raspberrypi.com/categories/786-raspberry-pi-camera-module-3/documents/RP-008156-DS-6-picamera2-manual.pdf) |
| PCN 42: IMX708 con OTP preprogramada | RP-009691-PC-1 | PDF (110 KB) | [descargar](https://pip-assets.raspberrypi.com/categories/1321-pcn/documents/RP-009691-PC-1-PCN%2042_%20IMX708%20Preprogrammed%20OTP.pdf) ([copia local](datasheets/RP-009691-PC-1-PCN_42__IMX708_Preprogrammed_OTP.pdf)) |
| PCN 43: eliminación de la EEPROM interna | RP-009692-PC-1 | PDF (75 KB) | [descargar](https://pip-assets.raspberrypi.com/categories/1321-pcn/documents/RP-009692-PC-1-PCN%2043_%20Camera%20Module%203%20Internal%20EEPROM%20removal.pdf) ([copia local](datasheets/RP-009692-PC-1-PCN_43__Camera_Module_3_Internal_EEPROM_removal.pdf)) |

Otras secciones del catálogo (no he abierto su contenido):

- [Aprobaciones](https://pip.raspberrypi.com/categories/788-approvals): 9 documentos.
- [Informes de ensayo](https://pip.raspberrypi.com/categories/799-test-reports): 3 documentos.
- Datasheets del ensamblaje de sensor suelto (no aplican a la cámara completa): [Standard normal](https://pip-assets.raspberrypi.com/categories/1207-design-files/documents/RP-009992-DS-1-camera-module-3-sensor-assembly-standard-normalfov-datasheet.pdf) y [product brief del ensamblaje](https://pip-assets.raspberrypi.com/categories/786-raspberry-pi-camera-module-3/documents/RP-009789-MM-1-Camera%20Module%203%20Sensor%20Assembly%20Product%20Brief.pdf).

Más información: [página del producto](https://www.raspberrypi.com/products/camera-module-3/) y [documentación de cámaras](https://www.raspberrypi.com/documentation/accessories/camera.html).

> **No he podido leer las cotas del plano mecánico**: mi herramienta solo extrajo números sueltos, sin vistas ni cajetín. Para la carcasa (agujero de Ø10 de la lente, tornillos) conviene abrir el PDF. Si me lo pasas, lo subo a `datasheets/` y saco las cotas.

### Qué dicen los avisos de cambio de producto

- **PCN 43** ([RP-009692-PC-1](https://pip-assets.raspberrypi.com/categories/1321-pcn/documents/RP-009692-PC-1-PCN%2043_%20Camera%20Module%203%20Internal%20EEPROM%20removal.pdf) ([copia local](datasheets/RP-009692-PC-1-PCN_43__Camera_Module_3_Internal_EEPROM_removal.pdf)), 30-1-2026): se elimina por completo la EEPROM interna del módulo, porque ese componente deja de fabricarse. Efectivo desde abril de 2026. Sin cambios físicos ni eléctricos, y **no hay forma de distinguir unidades viejas de nuevas por hardware**. Quien use la EEPROM tiene que rediseñar.
- **PCN 42** ([RP-009691-PC-1](https://pip-assets.raspberrypi.com/categories/1321-pcn/documents/RP-009691-PC-1-PCN%2042_%20IMX708%20Preprogrammed%20OTP.pdf) ([copia local](datasheets/RP-009691-PC-1-PCN_42__IMX708_Preprogrammed_OTP.pdf)), julio de 2026): el proveedor del sensor IMX708 empieza a entregarlo con la memoria OTP ya grabada con el tipo de lente y si es NoIR. Sin cambios mecánicos ni eléctricos. Con `dmesg | fgrep -i imx708` se lee un ID cuyos dos primeros dígitos tras `0x` son `03` y los dos siguientes indican el modelo: `01` estándar con filtro IR, `02` gran angular, `81` estándar NoIR, `82` gran angular NoIR.
- Ninguno de los dos documentos menciona la Raspberry Pi 3 ni versiones mínimas de kernel o libcamera.

## 4. Software y uso con la Pi 3B+

Fuente: [manual de Picamera2](https://pip-assets.raspberrypi.com/categories/786-raspberry-pi-camera-module-3/documents/RP-008156-DS-6-picamera2-manual.pdf), leído en local.

- **Solo funciona con libcamera** (Picamera2 o `rpicam-*`), no con el antiguo stack de cámara.
- **Memoria (CMA):** en Pi 4 y anteriores, algunas aplicaciones pueden necesitar más memoria CMA para la cámara. Picamera2 no usa `gpu_mem`; esas líneas de `config.txt` se deben borrar porque desperdician memoria.
- **Búferes:** con resoluciones altas puede no haber memoria suficiente; la solución es bajar `buffer_count` (por defecto, uno en configuraciones de foto fija).
- **Vista previa:**
  - La vista previa DRM/KMS es la indicada para Raspberry Pi OS Lite y la recomendada para Pis de poca potencia. **No funciona con el driver antiguo `fkms`**: hay que usar `dtoverlay=vc4-kms-v3d`.
  - **El límite de la vista previa por GPU es de 2048 píxeles por lado en la Pi 3 y anteriores** (4096 en la Pi 4 y posteriores). Si se pasa una imagen mayor, da error y el programa termina.
- **Autofoco:** tres modos.
  - *Manual:* la lente solo se mueve con `LensPosition`, en dioptrías (1 / distancia en metros; 0 = infinito).
  - *Auto:* un ciclo de enfoque cuando la aplicación lo dispara con `AfTrigger`.
  - *Continuous:* la lente se reajusta sola cuando hace falta.
  - Para 40 cm, `LensPosition` ≈ 2,5 (cálculo mío con la fórmula del manual). El valor por defecto de la lente es su posición hiperfocal.
- **HDR:** se activa fuera de la configuración normal de Picamera2, antes de abrir la cámara, con `IMX708(camera_num).set_sensor_hdr_mode(True)`. Limita la imagen a 3 MP.

## 5. Fallos, bugs y problemas conocidos

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | Cambios de producto de 2026 (EEPROM y OTP) | Media, sin confirmar |
| 2 | Cámara no detectada en Pi 3B+ (DietPi) | Baja con Raspberry Pi OS, a vigilar |
| 3 | Autofoco a corta distancia | Media |
| 4 | Autofoco con luz IR (NoIR) | No aplica |
| 5 | Cable de 50 cm | Media, sin confirmar |
| 6 | Temperatura de trabajo | Media-alta |
| 7 | Interferencias con GPS | No aplica |

### 5.1 Cambios de producto de 2026

Ver [arriba](#qué-dicen-los-avisos-de-cambio-de-producto). Para una cámara que compres hoy, lo más probable es que ya sea de la versión sin EEPROM. Como no hay cambios eléctricos ni físicos, no debería notarse, pero ninguno de los avisos habla de la Pi 3. **Prueba la cámara al recibirla** y usa la misma imagen de sistema en todas las máquinas.

### 5.2 Cámara no detectada en Pi 3B+

Un usuario de DietPi 9.10 (Debian Bookworm, kernel 6.6) en una Pi 3B+ nueva y sin pantalla no consiguió que `rpicam-hello --list-cameras` encontrara la cámara: error "Could not open any dmaHeap device". El síntoma apuntaba a permisos de `/dev/vcio` (solo root). Tras añadir su usuario al grupo `video`, `rpicam-hello` detectó la imx708, aunque `vcgencmd get_camera` seguía dando `detected=0` y no logró emitir vídeo con mjpg-streamer ni motionEye. El hilo se cerró sin respuesta de los mantenedores. ([foro de DietPi](https://dietpi.com/forum/t/camera-module-3-not-detected-on-raspberry-pi-3b/22826))

- **Para este proyecto:** el sistema es Raspberry Pi OS, no DietPi. El usuario de la aplicación debe estar en el grupo `video`. Que `vcgencmd get_camera` dé `detected=0` con libcamera parece normal, pero **no lo he comprobado**.

### 5.3 Autofoco a corta distancia

- A 25–30 cm la profundidad de campo es corta y las imágenes pueden salir borrosas si el enfoque no se ajusta. Un artículo de terceros propone `AfMode` automático, o `LensPosition` fijo con el inverso de la distancia (para 30 cm, ≈ 3,33), más luz y esperar unos 2 segundos para que el enfoque se estabilice antes de capturar. Sus cifras (por ejemplo, hiperfocal de 1 m) no están verificadas. ([industrialmonitordirect.com](https://industrialmonitordirect.com/blogs/knowledgebase/fixing-raspberry-pi-camera-module-3-wide-blurry-images-at-close-range), terceros)
- Hay hilos del foro oficial sobre enfoque que oscila ([focus hunting](https://forums.raspberrypi.com/viewtopic.php?t=352804)), sobre forzar el foco ([t=354442](https://forums.raspberrypi.com/viewtopic.php?t=354442)), sobre la cámara que no enfoca ([t=377381](https://forums.raspberrypi.com/viewtopic.php?t=377381)) y sobre el enfoque manual cuando la cámara está inclinada ([t=350405](https://forums.raspberrypi.com/viewtopic.php?t=350405)). **No pude abrir ninguno.** El título del último sugiere que la inclinación (gravedad sobre la lente) puede cambiar el foco manual.

### 5.4 Autofoco con luz infrarroja (solo NoIR)

La Camera Module 3 NoIR oscila al enfocar con iluminación IR de 850 nm. Los mantenedores de libcamera lo relacionan con el algoritmo de enfoque por fase y trabajan en un archivo de sintonía distinto. El hilo no dice que afecte a la versión Standard. ([libcamera#262](https://github.com/raspberrypi/libcamera/issues/262)) **No aplica**: la NoIR está descartada.

### 5.5 Cable de 50 cm

- La cámara trae un cable de 200 mm, y el proyecto usa uno de 50 cm porque el original no llega.
- **No encontré un límite oficial de longitud.** Raspberry Pi comenta que el cable es corto por integridad de señal. Un kit de extensión basado en cable HDMI llegó a 5 m en pruebas, aunque algunos usuarios no consiguieron que la cámara se detectara con ciertos cables. ([anuncio del kit](https://www.raspberrypi.com/news/camera-board-extension/)) Un hilo antiguo de element14 no da cifras concretas.
- **Para este proyecto:** 50 cm es 2,5 veces el cable original y no tengo datos de que falle, pero **hay que probarlo**. Si da errores al capturar, probar otro cable de la misma longitud antes de culpar a la cámara.

### 5.6 Temperatura

El product brief da **0 a 50 °C**. La cámara está en la caja de arriba, cerca de la fuente de 50 W. Mide la temperatura interior con la máquina cerrada y en carga.

### 5.7 Interferencias con GPS

La documentación oficial dice que hay indicios de que el módulo puede emitir interferencias en un armónico del reloj CSI que afectan a la banda GPS L1 (1575 MHz). No aplica salvo que se añada un receptor GPS. ([documentación oficial](https://www.raspberrypi.com/documentation/accessories/camera.html))

## 6. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Pruebas al recibirla:** `rpicam-hello --list-cameras` debe listar el `imx708`. En módulos nuevos, `dmesg | fgrep -i imx708` da un ID que empieza por `0x03`; comprueba que las dos cifras siguientes son `01` (estándar) y no `81` (NoIR) ni `02`/`82` (gran angular).
2. **Foto:** disparar un ciclo de autofoco (modo *Auto* con `AfTrigger`) y esperar a que termine antes de capturar, o fijar `LensPosition` ≈ 2,5 tras probar a 40 cm. No fiarse del modo continuo para una foto única.
3. **Montaje:** si la cámara va inclinada, repetir las pruebas de enfoque con la inclinación real, y no al revés.
4. **Vista previa:** DRM/KMS con `vc4-kms-v3d` y resolución de vista previa por debajo de 2048 píxeles por lado.
5. **Cable:** probar el de 50 cm antes de montar la caja. Conectar siempre con la Pi apagada y los contactos hacia el lado correcto (el proyecto ya lo documenta).
6. **Temperatura:** registrar la temperatura de la caja de arriba con la máquina cerrada.
7. **Repuestos:** tener una cámara y un cable de repuesto por cada tanda de máquinas.
8. **Imagen única** de sistema para todas las máquinas, para evitar sorpresas entre lotes con y sin EEPROM.

## 7. Lo que no he podido verificar

- **Cotas del plano mecánico:** mi herramienta no las extrajo.
- **El anuncio de Amazon** (vendedor, versión exacta): Amazon bloquea mi acceso.
- **Efecto de los PCN 42 y 43 en la Pi 3:** los documentos no lo mencionan.
- **Que `detected=0` en `vcgencmd get_camera` sea normal con libcamera.**
- **Cuatro hilos del foro de Raspberry Pi** sobre enfoque (t=352804, 354442, 377381, 350405): no pude abrirlos.
- **Límite de longitud del cable plano:** no hay cifras fiables.
- **Contenido de las aprobaciones y los informes de ensayo** del catálogo oficial.
- **El comportamiento del autofoco de la versión Standard en luz de bar** (poca luz): no encontré pruebas.

## 8. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos) y carpeta [`datasheets/`](datasheets/).

Todos los enlaces, ordenados por tipo, en [`enlaces.md`](enlaces.md).
