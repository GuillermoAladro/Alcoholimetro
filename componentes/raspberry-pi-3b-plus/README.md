# Raspberry Pi 3 Model B+

Ordenador monoplaca que hace de cerebro del alcoholímetro: lee el sensor por UART, maneja la pantalla y la cámara, y habla con el datáfono.

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales](#3-documentos-oficiales)
4. [Fallos, bugs y problemas conocidos](#4-fallos-bugs-y-problemas-conocidos)
5. [Recomendaciones para el alcoholímetro](#5-recomendaciones-para-el-alcoholímetro)
6. [Lo que no he podido verificar](#6-lo-que-no-he-podido-verificar)
7. [Fuentes](#7-fuentes)

---

## 1. Resumen para el proyecto

- **Temperatura de trabajo: 0–50 °C** según el product brief. Dentro de una carcasa de acero cerrada, con una fuente de 50 W al lado, ese límite se puede superar en verano en un bar. Hay que medir la temperatura interior de la máquina cerrada, no la de la sala.
- **El punto débil más probable en una máquina 24/7 es la tarjeta microSD**, no la placa. Hace falta reducir escrituras (raíz de solo lectura, logs en RAM) y valorar tarjeta industrial.
- **Alimentación:** el aviso de subtensión salta a unos 4,63 V medidos en la propia placa. Se recomienda una fuente de 5,1 V nominal y un cable corto y grueso. El diseño actual (5,20 V y latiguillo ≤ 15 cm) va en la línea buena.
- **Hay dos revisiones de placa en circulación** (Rev 1.3 y Rev 1.4, con otro chip de alimentación). La Rev 1.4 exige firmware de septiembre de 2021 o posterior. Al comprar recambios conviene usar siempre la misma imagen actualizada.
- **Ciclo de vida:** producción garantizada al menos hasta **enero de 2028**. Para una flota de máquinas conviene tener un plan de relevo.

## 2. Especificaciones

Fuente: [product brief RP-008338-DS-2](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf) (octubre de 2025), salvo donde se indica.

| Característica | Valor |
|---|---|
| SoC | Broadcom BCM2837B0, Cortex-A53 de 64 bits, 1,4 GHz |
| RAM | 1 GB |
| Wi-Fi | 2,4 y 5 GHz, IEEE 802.11 b/g/n/ac |
| Bluetooth | 4.2 y BLE |
| Ethernet | Gigabit **sobre USB 2.0**, máximo real 300 Mbps |
| USB | 4 × USB 2.0 |
| Vídeo | HDMI de tamaño completo, DSI (pantalla MIPI), CSI (cámara MIPI) |
| Almacenamiento | microSD |
| Alimentación | 5 V CC / 2,5 A por micro-USB, o 5 V por el conector GPIO |
| PoE | Compatible, pero requiere un PoE HAT aparte |
| Temperatura de operación | 0 a 50 °C |
| MTBF | 378 000 horas (Ground Benign) |
| Huella mecánica | Igual que Pi 2 B y Pi 3 B |
| Producción garantizada | Hasta enero de 2028 |

### GPIO (documentación oficial de hardware)

Fuente: [documentación de hardware](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html).

- Todos los GPIO son de **3,3 V. No son tolerantes a 5 V.**
- Nivel bajo de entrada máximo: 0,9 V. Nivel alto de entrada mínimo: 1,6 V.
- Pull-up y pull-down internos: entre 50 y 65 kΩ.
- Corriente por pin: 8 mA por defecto, 16 mA como máximo. El diseño del raíl de 3,3 V asume unos 3 mA por pin; cargar todos los pines a 16 mA puede hacer colapsar ese raíl.
- UART serie: TX en GPIO14 y RX en GPIO15.
- Pull-up fijo en GPIO2 y GPIO3.

### Control térmico

Fuente: [documentación de hardware](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html).

- Límite duro de 85 °C en todos los modelos. Entre 80 y 85 °C se reduce progresivamente la frecuencia de los núcleos Arm.
- **En la 3B+ hay además un límite blando de 60 °C** (configurable con `temp_soft_limit`). Al alcanzarlo, la CPU baja de 1,4 a 1,2 GHz y se reduce un poco la tensión.
- La temperatura se mide con `vcgencmd measure_temp`; la propia documentación avisa de que las lecturas desde Linux pueden ser imprecisas.

## 3. Documentos oficiales

Catálogo oficial de producto: <https://pip.raspberrypi.com/categories/532-raspberry-pi-3-model-b> (actualizado el 6-10-2025).

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Product brief | RP-008338-DS-2 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf) |
| Plano mecánico | RP-008337-DS-2 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008337-DS-2-raspberry-pi-3-b-plus-mechanical-drawing.pdf) |
| Plano mecánico (CAD) | RP-008336-DS-1 | DXF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008336-DS-1-raspberry-pi-3-b-plus-mechanical-drawing.dxf) |
| Esquema reducido | RP-008339-DS-1 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf) |
| Plano mecánico de la caja oficial | RP-008160-DS-1 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008160-DS-1-raspberry-pi-3-b-plus-case-mechanical-drawing.pdf) |
| Aviso de cambio de producto (Rev 9 / Rev 1.4) | RP-003337-PC-1 | PDF (10 MB) | [descargar](https://pip-assets.raspberrypi.com/categories/797-pcn/documents/RP-003337-PC-1-Pi3B_%20Revision%209%20PCN.pdf) |
| Declaración de conformidad UE | RP-001265-CF-3 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/534-approvals/documents/RP-001265-CF-3-rpi-3bplus%20EU%20Declaration%20of%20Conformity%20(DoC).pdf) |
| FCC | RP-000116-CF-1 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/534-approvals/documents/RP-000116-CF-1-FCC.pdf) |
| Certificado CB | RP-000092-CF-1 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/534-approvals/documents/RP-000092-CF-1-CB%20certificate.pdf) |

Otras secciones del catálogo oficial (no he abierto su contenido):

- [Aprobaciones](https://pip.raspberrypi.com/categories/534-approvals): 41 documentos, uno por país.
- [Informes de ensayo](https://pip.raspberrypi.com/categories/537-test-reports): 8 subcategorías.
- [Diagrama de antena](https://pip.raspberrypi.com/categories/778-antenna-pattern), [folleto](https://pip.raspberrypi.com/categories/535-leaflet) y [archivos de test](https://pip.raspberrypi.com/categories/536-test-files).

Documentación de software y hardware:

- [Documentación de hardware](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html)
- [Configuración (UART, pantalla, `config.txt`)](https://www.raspberrypi.com/documentation/computers/configuration.html)
- [Anuncio de Raspberry Pi OS Trixie](https://www.raspberrypi.com/news/trixie-the-new-version-of-raspberry-pi-os/)
- [Manual de Picamera2](https://datasheets.raspberrypi.com/camera/picamera2-manual.pdf)

> Los PDF no están copiados en este repositorio porque el entorno donde se preparó no podía descargarlos. El script [`datasheets/descargar.sh`](datasheets/descargar.sh) los baja todos a tu ordenador.

### Qué dice el aviso de cambio Rev 9 (RP-003337-PC-1)

- La placa pasa de la revisión de PCB R5 a la R9, y el modelo de software de **1.3 a 1.4**.
- Cambia **solo el chip de gestión de alimentación (PMIC)**, que pasa a ser el DA9090. Es el único cambio eléctrico descrito.
- Aviso fechado el 4-3-2022; transición en octubre-noviembre de 2022, con unidades viejas y nuevas mezcladas en distribución.
- **La Rev 1.4 requiere firmware de septiembre de 2021 o posterior.** Se comprueba con `vcgencmd version`.
- En `cat /proc/cpuinfo` las unidades nuevas aparecen como "Raspberry Pi 3 Model B+ Rev 1.4".

## 4. Fallos, bugs y problemas conocidos

| # | Problema | Gravedad para el proyecto | Estado |
|---|---|---|---|
| 1 | Subtensión por fuente o cable | Alta | Se evita con buena alimentación |
| 2 | Corrupción de la microSD | Alta | Se mitiga por configuración |
| 3 | Temperatura de la carcasa | Media-alta | Hay que medirla |
| 4 | Rev 1.4 y firmware mínimo | Media | Se evita usando imagen actual |
| 5 | `disable-wifi` rompe el Bluetooth en algunas 3B+ | Baja (no se usa Bluetooth) | Corregido en firmware reciente |
| 6 | Puerto serie en Trixie | Media, sin confirmar | Probar primero |
| 7 | Error de IRQ con vc4/KMS (2018) | Baja | Histórico |
| 8 | Apagado a 80 °C con kernel mainline | Solo si se usa otro kernel | Específico de Arch Linux ARM |

### 4.1 Subtensión

- El aviso salta por debajo de **4,63 V ±5 %**. Un hilo de element14 lo atribuye al chip supervisor APX803 (4,63 ± 0,07 V); la documentación de Raspberry Pi da ±5 % para el mismo aviso. ([element14](https://community.element14.com/products/raspberry-pi/f/forum/38347/what-is-the-minimun-supply-voltage-for-the-pi3b-plus/138377))
- Un ingeniero de ese hilo explica que 5,1 V es un valor nominal: la caída en el cable hace que un cargador de 5,0 V entregue menos en los pines, por eso se recomienda 5,1 V. También dice que el micro-USB no está pensado para cargadores de móvil.
- Los avisos aparecen en el log del kernel desde la versión 4.14.30. Se vieron casos con cables de conductores finos, con unos 4,64 V medidos bajo carga; cambiar solo el cable eliminó los avisos. Hay un límite de registro de 3 mensajes cada 5 minutos. ([raspberrypi/linux#2512](https://github.com/raspberrypi/linux/issues/2512))
- Diagnóstico: `vcgencmd get_throttled` (debe dar `0x0`) y medir entre el pin físico 4 (5 V) y el 6 (GND) bajo carga.
- `avoid_warnings=2` oculta el aviso pero no arregla la causa. No lo uses.
- Alimentar por el GPIO de 5 V salta las protecciones de la entrada micro-USB; está permitido por el brief, pero entonces la fuente tiene que ser fiable.

### 4.2 Corrupción de la tarjeta microSD

- Las tarjetas de consumo aguantan pocos ciclos de escritura; con escritura constante pueden agotarse en meses. Fuentes de escritura típicas: `journald`, bases de datos, swap. ([industrialmonitordirect.com](https://industrialmonitordirect.com/hu/blogs/knowledgebase/preventing-raspberry-pi-sd-card-corruption-in-industrial-iot-systems), artículo de terceros, no oficial)
- Medidas que recomienda ese artículo:
  - Raíz del sistema en solo lectura, con `tmpfs` para `/tmp`, `/var/log` y `/var/tmp`.
  - `journald` con `Storage=volatile`.
  - Tarjetas industriales SLC o pSLC.
  - SSD por USB como alternativa.
  - Probar la recuperación ante un corte de corriente simulado.
- Los cortes de luz bruscos son el escenario normal en un bar: la raíz de solo lectura es la defensa principal.
- Hilos del foro oficial sobre el tema que encontré pero no pude abrir: [Pi 3 B+ Repeating MicroSD corruption](https://raspberrypi.org/forums/viewtopic.php?t=208079).

### 4.3 Temperatura

- Límite blando de 60 °C (1,4 → 1,2 GHz) y duro de 85 °C. Sin disipador funciona; solo va algo más lenta al calentarse.
- Hay un [issue en la documentación oficial](https://github.com/raspberrypi/documentation/issues/970) que señala que las páginas de Raspberry Pi se contradicen sobre los umbrales y la forma de leer la temperatura. Mide siempre con `vcgencmd measure_temp`.
- El límite de **50 °C de temperatura ambiente** del brief es el que importa dentro de la máquina.

### 4.4 Revisión 1.4 y firmware

- Ver el [aviso de cambio](#qué-dice-el-aviso-de-cambio-rev-9-rp-003337-pc-1) arriba. Una imagen vieja puede no arrancar en una placa nueva.

### 4.5 `disable-wifi` rompe el Bluetooth en algunas placas

- En algunas Pi 3B+ (revisiones `a020d3` y `a020d4`), desactivar el Wi-Fi integrado con `dtoverlay=disable-wifi` deja el Bluetooth sin funcionar: `hciuart` falla con "Initialization timed out". Wi-Fi y Bluetooth comparten una línea de reset. ([raspberrypi/firmware#1611](https://github.com/raspberrypi/firmware/issues/1611))
- Un usuario confirmó que se arregla con el firmware de prueba, ya incluido en la última versión de `rpi-update`. Los mantenedores también apuntan a un posible problema de alimentación.
- **Para este proyecto:** como no se usa Bluetooth y el Wi-Fi interno se sustituye por el adaptador AR9271, el efecto es nulo. Aun así, si el Wi-Fi interno no se apaga como esperas, este es el sitio donde mirar.

### 4.6 Puerto serie en Trixie

- El anuncio oficial de Trixie recomienda **instalar una imagen limpia** en vez de actualizar desde Bookworm. Dice que probaron hasta la Pi 1 y que en la Pi 3 "se siente perfectamente usable". Un comentario de usuario en esa página menciona problemas de puerto serie y de un HAT en una Pi 3 tras actualizar. ([anuncio](https://www.raspberrypi.com/news/trixie-the-new-version-of-raspberry-pi-os/))
- Existe un hilo titulado [Serial port problems under Trixie](https://forums.raspberrypi.com/viewtopic.php?t=397046), que **no pude abrir**: no sé a qué modelos afecta ni si tiene solución.
- **Para este proyecto:** el sensor ZE29A va por UART. **Prueba la UART lo primero** al montar la imagen, antes de seguir con lo demás.
- Otros cambios de Trixie del anuncio y sus comentarios: el swap lo gestiona systemd (ya no existe `/etc/dphys-swapfile`) y la configuración del watchdog está en `/usr/lib/systemd/system.conf.d/40-rpi-enable-watchdog.conf`. Son comentarios de usuarios, no texto oficial.

### 4.7 Error "Unbalanced enable for IRQ" con vc4 (2018)

- Con aceleración gráfica (modos KMS), el log se llena de avisos del driver vc4. Se vio con el kernel 4.9.80 y a un usuario se le arregló con el 4.14.34; no hay corrección oficial documentada en el ticket. ([bug #1756553](https://bugs.launchpad.net/raspbian/+bug/1756553))
- Es antiguo. Merece la pena revisar `dmesg` tras montar la imagen, porque el proyecto pinta la cámara a pantalla completa con DRM.

### 4.8 Apagado a 80 °C con kernel mainline

- En Arch Linux ARM (kernel mainline, no el de Raspberry Pi), el sistema se apagaba al llegar a 80 °C por un error en los puntos de disparo térmicos del devicetree. ([hilo](https://archlinuxarm.org/forum/viewtopic.php?p=62642))
- No afecta a Raspberry Pi OS. Solo importaría si algún día se cambia de sistema.

## 5. Recomendaciones para el alcoholímetro

Son conclusiones mías a partir de lo anterior, no afirmaciones de las fuentes.

1. **Alimentación:** mantener 5,1–5,2 V nominales y el latiguillo corto. Medir en los pines físicos 4 y 6 con el sistema en el pico de consumo (cámara, pantalla y Wi-Fi activos). Que `vcgencmd get_throttled` dé `0x0`.
2. **Almacenamiento:** raíz de solo lectura o tmpfs para logs, y tarjeta de calidad (idealmente industrial). Probar cortando la corriente de golpe varias veces.
3. **Térmica:** poner un sensor o registrar `vcgencmd measure_temp` con la máquina cerrada y la fuente en carga, a la temperatura de verano más alta del local. Si se acerca a 50 °C de ambiente, mejorar la ventilación.
4. **Imagen única:** una sola imagen de Trixie reciente para todas las máquinas, sin actualizar desde Bookworm, comprobando el firmware de cada placa (Rev 1.3 y 1.4).
5. **UART:** probar el sensor serie en cuanto arranque la imagen nueva.
6. **Vigilancia:** configurar el watchdog de hardware para que una máquina colgada se reinicie sola.
7. **Plan de relevo:** la placa solo tiene producción garantizada hasta enero de 2028.
8. **Certificación:** la Pi tiene certificación modular de radio y declaración de conformidad UE, pero el producto final (la máquina completa) necesita su propia evaluación. Esto ya está recogido en la guía de montaje del proyecto.

## 6. Lo que no he podido verificar

- **Puerto serie en Trixie:** no pude abrir el hilo del foro; solo hay un comentario de usuario en el anuncio.
- **PL011 vs mini UART en la Pi 3:** la página oficial se cortaba antes de esa sección. Lo que se sabe del proyecto (la UART buena está en el Bluetooth por defecto; `dtoverlay=disable-bt` la pasa a GPIO14/15) es práctica conocida, pero no la he leído en esta sesión. El sticky [Pi3 UART stopped working?](https://forums.raspberrypi.com/viewtopic.php?t=141195) la explica, y tampoco pude abrirlo.
- **Contenido de los informes de ensayo y las aprobaciones por país:** solo he listado el índice.
- **Corrupción de microSD:** los hilos del foro oficial no se abrieron; la parte de mitigación sale de un artículo de terceros.
- **Cámara Camera Module 3 en Pi 3 y el límite de memoria de Picamera2:** apareció en las búsquedas pero no lo investigué a fondo. El límite de 2048 px en directo viene de la guía de montaje del proyecto.
- **Ethernet y USB comparten bus:** el brief dice que el Ethernet va sobre USB 2.0 con un máximo de 300 Mbps. Que eso afecte al adaptador Wi-Fi USB es una deducción mía, no medida.

## 7. Fuentes

- [Product brief de la Pi 3B+ (RP-008338-DS-2)](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf)
- [Catálogo oficial de producto](https://pip.raspberrypi.com/categories/532-raspberry-pi-3-model-b)
- [Aviso de cambio Rev 9 (PCN)](https://pip-assets.raspberrypi.com/categories/797-pcn/documents/RP-003337-PC-1-Pi3B_%20Revision%209%20PCN.pdf)
- [Aprobaciones y declaraciones de conformidad](https://pip.raspberrypi.com/categories/534-approvals)
- [Documentación de hardware de Raspberry Pi](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html)
- [Configuración de Raspberry Pi (pantalla y UART)](https://www.raspberrypi.com/documentation/computers/configuration.html)
- [Anuncio de Raspberry Pi OS Trixie](https://www.raspberrypi.com/news/trixie-the-new-version-of-raspberry-pi-os/)
- [raspberrypi/firmware#1611: `disable-wifi` y Bluetooth](https://github.com/raspberrypi/firmware/issues/1611)
- [raspberrypi/linux#2512: avisos de subtensión](https://github.com/raspberrypi/linux/issues/2512)
- [raspberrypi/documentation#970: contradicciones sobre throttling](https://github.com/raspberrypi/documentation/issues/970)
- [element14: tensión mínima de alimentación de la 3B+](https://community.element14.com/products/raspberry-pi/f/forum/38347/what-is-the-minimun-supply-voltage-for-the-pi3b-plus/138377)
- [Bug #1756553: Unbalanced enable for IRQ](https://bugs.launchpad.net/raspbian/+bug/1756553)
- [Arch Linux ARM: apagado a 80 °C](https://archlinuxarm.org/forum/viewtopic.php?p=62642)
- [Prevención de corrupción de SD en sistemas industriales (terceros)](https://industrialmonitordirect.com/hu/blogs/knowledgebase/preventing-raspberry-pi-sd-card-corruption-in-industrial-iot-systems)
