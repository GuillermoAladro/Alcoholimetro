# Adaptador Wi-Fi USB con chip Atheros AR9271 (antena RP-SMA desmontable)

Da Wi-Fi a la Raspberry Pi 3B+ cuando su Wi-Fi interno queda anulado dentro de la caja de chapa (se apaga con `dtoverlay=disable-wifi`). El adaptador va en un puerto USB de la Pi y su antena sale por el techo con el alargo RP-SMA (#13). La Pi lo necesita para llamar a la Cloud API de SumUp; el SumUp Solo usa su propio Wi-Fi (solo 2,4 GHz), en el mismo local.

- **Compra:** ASIN B0CBW6THN1, 16,24 € (precio de la hoja de componentes del 19-20-10-2026). Anuncio: "adaptador USB AR9271 con antena desmontable" (guía §1 fila 12; antena de 2 dBi según guía §2.9).
- **Chip:** Qualcomm Atheros AR9271 (driver del kernel `ath9k_htc`). Lo que no se puede saber desde aquí es **si la unidad que llegue lleva de verdad ese chip**: ver [sección 4.2](#42-comprobar-que-es-un-ar9271-al-recibirlo).

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta (`ROBOTS_DISALLOWED`), así que no he visto el anuncio: el precio, la referencia, la antena de 2 dBi y todo lo que digo del anuncio son los de tu hoja y tu guía. No sé quién fabrica la unidad, ni su ID USB, ni si lleva marcado CE.
>
> Mis herramientas web resumen las páginas y los PDF; no puedo descargar archivos. El datasheet del chip lo leí **de forma parcial** (la extracción se corta antes de las tablas eléctricas), así que las cifras de potencia y consumo salen de la hoja de un módulo comercial con el mismo chip, no del datasheet de Qualcomm. Para el comportamiento del driver leí **el código fuente del kernel de Raspberry Pi** (ramas `rpi-6.12.y` y `rpi-6.18.y`), que es fuente primaria.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales](#3-documentos-oficiales)
4. [Uso, configuración e integración](#4-uso-configuración-e-integración)
5. [Fallos, bugs y problemas conocidos](#5-fallos-bugs-y-problemas-conocidos)
6. [Normativa de radio (RED)](#6-normativa-de-radio-red)
7. [Alternativas](#7-alternativas)
8. [Recomendaciones para el alcoholímetro](#8-recomendaciones-para-el-alcoholímetro)
9. [Lo que no he podido verificar](#9-lo-que-no-he-podido-verificar)
10. [Fuentes](#10-fuentes)

---

## 1. Resumen para el proyecto

- **El chip y el driver son una buena elección en papel, pero es un chip de 2011 y lo que se vende hoy a 16 € es de marca desconocida.** El AR9271 es un 802.11b/g/n 1x1 de 2,4 GHz (72,2 Mb/s en 20 MHz, 150 Mb/s en 40 MHz) con USB 2.0 ([datasheet, rev. 2.0, nov. 2011](https://www.olimex.com/Products/USB-Modules/WiFi/MOD-WIFI-AR9271-ANT/resources/AR9271.pdf)). Los kernels 6.12 y 6.18 de Raspberry Pi compilan `ath9k_htc` como módulo ([`bcm2711_defconfig`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/arch/arm64/configs/bcm2711_defconfig)). Entre los productos de marca que las wikis confirman con este chip (Alfa AWUS036NHA, TL-WN722N v1, Netgear WNA1100, D-Link DWA-126), el Alfa figura como **EOL y agotado** en la [web de Alfa](https://www.alfa.com.tw/products/awus036nha); no he comprobado si los demás siguen a la venta.
- **Riesgo principal: que no sea un AR9271.** No he encontrado fuentes sobre falsificaciones concretas de este chip (no pude buscar más), pero la ficha ofrece una comprobación de 2 minutos con `lsusb`, `dmesg` y `iw` ([sección 4.2](#42-comprobar-que-es-un-ar9271-al-recibirlo)) basada en las tablas de IDs del propio kernel. Haz la prueba **en cuanto llegue**, dentro del plazo de devolución.
- **Firmware: la guía acierta con el chip y se equivoca de paquete.** El kernel pide primero `ath9k_htc/htc_9271-1.4.0.fw` y, si no lo encuentra, cae a `htc_9271.fw` (rama 1.3, que el propio código llama "deprecated"). Raspberry Pi OS preinstala `firmware-atheros`, que contiene `htc_9271.fw`, pero **no** (en la imagen que pude ver) `firmware-ath9k-htc`, que es el paquete del firmware libre 1.4.0 y está en `main` de Debian. Debería arrancar con el 1.3 (deducción mía del código), pero conviene instalar el 1.4.0 ([sección 4.1](#41-software-y-firmware-en-raspberry-pi-os-trixie)).
- **Consumo y subtensión: no es el problema.** Un módulo con este chip declara unos **300 mA en transmisión** y 280 mA en recepción ([hoja del TPE-N150USB](https://thinkpenguin.com/files/TPE-N150USB-spec-sheet.pdf)), frente a un límite de 1,2 A en total para los USB de la 3B+ ([documentación de Raspberry Pi](https://raw.githubusercontent.com/raspberrypi/documentation/master/documentation/asciidoc/computers/raspberry-pi/power-supplies.adoc)). Añade del orden de 5 mV de caída en el latiguillo (cálculo mío): despreciable frente a los 0,57 V de margen entre 5,20 V y 4,63 V.
- **Fiabilidad 24/7: el punto débil conocido es el USB, no el Wi-Fi.** La wiki del proyecto de firmware advierte de desconexiones por cables y alimentación, de que la suspensión no funciona (el firmware se reinicia) y de problemas de reset en algunos controladores ([wiki](https://github.com/qca/open-ath9k-htc-firmware/wiki/usb-related-issues)). Hay un caso de bloqueo aleatorio hasta desenchufar el adaptador con kernels 5.10 y 5.15 ([issue #173](https://github.com/qca/open-ath9k-htc-firmware/issues/173)). Una máquina de bar desatendida necesita **un mecanismo automático de recuperación** (sección 8).
- **Normativa: el adaptador es un equipo radio por sí mismo.** Debe llevar marcado CE, datos del fabricante y declaración de conformidad (RD 188/2016, arts. 9, 17-19). El límite en 2,4 GHz es **20 dBm de PIRE** ([ETSI EN 300 328 V2.2.2, 4.3.2.2.3](https://www.etsi.org/deliver/etsi_en/300300_300399/300328/02.02.02_60/en_300328v020202p.pdf)): un módulo con +18 dBm y una antena de 2 dBi queda justo en el límite (cálculo mío). Un adaptador sin esa documentación no debería ir en una máquina que vendas.

### 1.1 Discrepancias con la guía de montaje

| # | La guía dice | Lo que dicen las fuentes primarias |
|---|---|---|
| 1 | §2.9: "firmware libre (paquete `firmware-atheros`)" | El firmware libre 1.4.0 es el paquete **`firmware-ath9k-htc`** (sección `main`; en trixie, 1.4.0-110-ge888634+dfsg1-0.1, [tracker de Debian](https://tracker.debian.org/open-ath9k-htc-firmware)). `firmware-atheros` está en `non-free-firmware` y su lista de ficheros incluye `htc_9271.fw` y `htc_7010.fw`, pero su descripción no nombra `ath9k_htc` y no declara el ID `0cf3:9271` ([AppStream, página de sid](https://appstream.debian.org/sid/non-free-firmware/metainfo/firmware-atheros.html)). El kernel prefiere `ath9k_htc/htc_9271-1.4.0.fw` ([`hif_usb.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/hif_usb.c)). **No necesita `non-free-firmware` para el 1.4.0.** |
| 2 | §2.9: la versión 2/3 del TL-WN722N "necesita instalar drivers externos tras cada actualización" (enlace a dev.to) | Para la **v2** está confirmado que lleva RTL8188EU: el código del kernel de Raspberry Pi lo dice en un comentario (`2357:010c`, "TP-Link TL-WN722N v2") y lo gestiona el driver **del propio kernel** `rtl8xxxu` ([`core.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/realtek/rtl8xxxu/core.c)). El driver de staging `r8188eu` se eliminó en 2023 porque `rtl8xxxu` cubre el mismo hardware ([LKML, marzo 2023](https://lkml.iu.edu/hypermail/linux/kernel/2303.1/01128.html)). La necesidad de drivers externos aplica a kernels antiguos o a usos de monitor/inyección, no a un cliente Wi-Fi normal en 6.12. De la **v3** no he encontrado fuente primaria (solo un hilo de foro). **No pude abrir el enlace de dev.to** (bloqueado por la herramienta). La conclusión de la guía (preferir AR9271 al RTL8188EU) puede seguir siendo razonable por otros motivos ([sección 7](#7-alternativas)), pero el motivo que da está desfasado. |
| 3 | §2.9: AR9271 "es de los más fiables en Raspberry Pi" | No he encontrado ninguna fuente que lo sostenga. La wiki del propio proyecto de firmware dedica una página a problemas de USB y el repositorio tiene 79 issues abiertos ([GitHub](https://github.com/qca/open-ath9k-htc-firmware/)). **Sin verificar.** |
| 4 | §3: Pi + cámara + Wi-Fi USB, típico 0,9 A | Con las cifras publicadas: Pi 3B+ unos 500 mA ([documentación](https://raw.githubusercontent.com/raspberrypi/documentation/master/documentation/asciidoc/computers/raspberry-pi/power-supplies.adoc)) + cámara 250 mA (la propia guía §2.2) + adaptador 300 mA ([TPE-N150USB](https://thinkpenguin.com/files/TPE-N150USB-spec-sheet.pdf)) = **unos 1,05 A** (suma mía). Diferencia pequeña y sin efecto sobre la fuente de 10 A, pero la fila subestima. |
| 5 | (Planteamiento inicial) la 3B+ comparte una línea USB con el LAN9514 | La 3B+ no lleva LAN9514 sino un **LAN7515**: el árbol de dispositivos del kernel de Pi para la 3B+ incluye `bcm283x-rpi-lan7515.dtsi` (hub `usb424,2514` y Ethernet `usb424,7800`), mientras que la 3B usa `smsc9514` ([`bcm2837-rpi-3-b-plus.dts`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/arch/arm/boot/dts/broadcom/bcm2837-rpi-3-b-plus.dts), [`lan7515.dtsi`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/arch/arm/boot/dts/broadcom/bcm283x-rpi-lan7515.dtsi)). El límite de **1,2 A en total** para los USB de la 3B+ sí es oficial ([documentación](https://raw.githubusercontent.com/raspberrypi/documentation/master/documentation/asciidoc/computers/raspberry-pi/power-supplies.adoc)). El Wi-Fi interno va por SDIO, no por USB ([`bcm283x-rpi-wifi-bt.dtsi`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/arch/arm/boot/dts/broadcom/bcm283x-rpi-wifi-bt.dtsi)). |
| 6 | §0, §7: kernel 6.12 en Trixie | El árbol de Raspberry Pi tiene ramas `rpi-6.12.y` (6.12.113) y `rpi-6.18.y` (6.18.57), y un issue de agosto de 2026 habla de un kernel `6.18.39+rpt` ([raspberrypi/linux#7568](https://github.com/raspberrypi/linux/issues?q=is%3Aissue+ath9k_htc)). El código de `hif_usb.c` es **idéntico** en las dos ramas (solo cambia una errata en un comentario). Compruébalo con `uname -r`. |
| 7 | §7: `dtoverlay=disable-wifi` | **Confirmado:** existe y desactiva el Wi-Fi interno ([README de overlays](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/arch/arm/boot/dts/overlays/README)). |

## 2. Especificaciones

Las cifras de potencia y consumo son de **otro producto con el mismo chip** (módulo ThinkPenguin TPE-N150USB, que usa el UB93/AR9271), porque no conozco la ficha del adaptador que compras. Otro módulo con el mismo chip, el SparkLAN WUBA-171GN, anuncia 23 dBm y −30 a 75 °C ([página](https://embeddedworks.net/product/wlan382)), así que **potencia, consumo y temperatura dependen del fabricante del módulo**.

| Característica | Valor | Fuente |
|---|---|---|
| Chip | Qualcomm Atheros AR9271, "Single-Chip 1x1 MAC/BB/Radio/PA/LNA with USB Interface for 802.11n 2.4 GHz WLANs" | [Datasheet rev. 2.0, nov. 2011](https://www.olimex.com/Products/USB-Modules/WiFi/MOD-WIFI-AR9271-ANT/resources/AR9271.pdf) |
| Estándares y velocidad | 802.11b/g/n, 1x1; 72,2 Mb/s en 20 MHz y 150 Mb/s en 40 MHz | Datasheet |
| Banda | Solo 2,4 GHz. Canales 1-13 en Europa | Datasheet; [TPE-N150USB](https://thinkpenguin.com/files/TPE-N150USB-spec-sheet.pdf) |
| Interfaz | USB 2.0 host | Datasheet |
| Etapa de RF | PA, LNA y conmutador RX/TX integrados; conmutador interno de diversidad entre antena 1 y 2 | Datasheet |
| Cifrado por hardware | WEP, TKIP, AES | Datasheet |
| Encapsulado del chip | LPCC de 68 pines, 8 × 8 mm | Datasheet |
| Alimentación del chip | 3,3 V y 1,2 V (el módulo trae un regulador de 5 V a 3,3 V) | Datasheet; diagrama del TPE-N150USB |
| Potencia de TX (módulo, tolerancia ±2 dBm) | 11b: +18 dBm. 11g 6-48 Mb/s: +17. 11g 54 Mb/s: +15. HT20/HT40 MCS0-5: +16. MCS6: +14. MCS7: +11 | TPE-N150USB |
| Sensibilidad típica de RX | 11b 1 Mb/s: −92 dBm. 11g 6 Mb/s: −92; 54 Mb/s: −76. HT20 MCS0: −92; MCS7: −73. HT40 MCS0: −88; MCS7: −70 | TPE-N150USB |
| Corriente (módulo) | TX continuo: 300-310 mA. RX: 280 mA. En reposo: **no indicada** | TPE-N150USB |
| Temperatura de trabajo (módulo) | 0 a 40 °C; almacenamiento −10 a 70 °C; humedad 15-95 % sin condensación | TPE-N150USB. Igual (0-40 °C) en la [hoja del TL-WN722N](https://shop.aodatacloud.es/medias/datasheet_tl-wn722n.pdf) |
| Tamaño (módulo) | 30 × 17 × 8,5 mm | TPE-N150USB |
| Driver | `ath9k_htc` (módulo `=m` en los defconfig 6.12 y 6.18 de Pi, 32 y 64 bits) | [`bcm2711_defconfig`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/arch/arm64/configs/bcm2711_defconfig), [`bcm2709_defconfig`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/arch/arm/configs/bcm2709_defconfig) |
| Firmware | `ath9k_htc/htc_9271-1.4.0.fw` (51.008 bytes en el árbol de linux-firmware); alternativa `htc_9271.fw` (1.3) | [`hif_usb.h`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/hif_usb.h); [listado de linux-firmware](https://kernel.org/pub/scm/linux/kernel/git/maks/linux-firmware.git/tree/ath9k_htc?h=main) (réplica, no el repositorio principal) |
| IDs USB que reclama el driver para AR9271 | `0cf3:9271`, `0cf3:1006`, `0846:9030` (Netgear N150), `07b8:9271`, `07d1:3a10` (D-Link), `13d3:3327/3328/3346/3348/3349/3350`, `04ca:4605`, `040d:3801`, `0cf3:b002/b003` (Ubiquiti), `057c:8403` (AVM), `0471:209e`, `1eda:2315` | [`hif_usb.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/hif_usb.c). Los `0cf3:1006` documentados (TL-WN322G v3, TL-WN422G v2) son modelos solo 802.11b/g ([kernel wiki](https://wireless.docs.kernel.org/en/latest/en/users/drivers/ath9k_htc/devices.html), [Parabola](https://wiki.parabola.nu/WiFi_devices_known_to_work_with_Parabola_GNU/Linux-libre)) |
| Modos | Estación, ad-hoc, AP, P2P, malla y OCB | [`htc_drv_init.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/htc_drv_init.c). Para este proyecto solo importa "estación" |
| Ahorro de energía Wi-Fi | Desactivado por defecto: el driver solo marca `SUPPORTS_PS` si se carga con `ps_enable=1` | `htc_drv_init.c`; [kernel wiki](https://wireless.kernel.org/_export/raw/en/users/drivers/ath9k_htc) ("deshabilitado por defecto") |
| Conector de antena del adaptador | **Sin verificar** en tu unidad. El Alfa AWUS036NHA usa un RP-SMA hembra (rosca exterior y pin central) | [Alfa](https://www.alfa.com.tw/products/awus036nha); convención en [Wikipedia](https://en.wikipedia.org/wiki/SMA_connector) |
| Antena | 2 dBi desmontable (solo según la guía; **sin verificar**) | Guía §2.9 |
| Vida del producto | El datasheet es de 2011. El Alfa AWUS036NHA figura como EOL y agotado. No hay aviso de descatalogación de Qualcomm en las fuentes que abrí | Datasheet; [Alfa](https://www.alfa.com.tw/products/awus036nha) |

## 3. Documentos oficiales

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Datasheet del chip AR9271 (copia de Olimex) | "AR9271 Single-Chip 1x1 MAC/BB/Radio/PA/LNA with USB Interface", rev. 2.0, noviembre de 2011. Nº de documento: no consta en lo que leí | PDF | [descargar](https://www.olimex.com/Products/USB-Modules/WiFi/MOD-WIFI-AR9271-ANT/resources/AR9271.pdf) |
| Especificación de un módulo AR9271 (TPE-N150USB, UB93) | Ver. 1.22, 05-05-2016 | PDF | [descargar](https://thinkpenguin.com/files/TPE-N150USB-spec-sheet.pdf) · [réplica](https://libre.thinkpenguin.com/files/TPE-N150USB-spec-sheet.pdf) |
| Hoja de un TL-WN722N (copia de un distribuidor) | Sin versión de hardware | PDF | [descargar](https://shop.aodatacloud.es/medias/datasheet_tl-wn722n.pdf) |
| Ficha del Alfa AWUS036NHA (EOL) | Web | Web | [alfa.com.tw](https://www.alfa.com.tw/products/awus036nha) |
| Wiki del kernel: driver `ath9k_htc` | Exportación en bruto de la wiki antigua | Web | [wireless.kernel.org](https://wireless.kernel.org/_export/raw/en/users/drivers/ath9k_htc) |
| Wiki del kernel: dispositivos `ath9k_htc` | Lista de modelos e IDs | Web | [wireless.docs.kernel.org](https://wireless.docs.kernel.org/en/latest/en/users/drivers/ath9k_htc/devices.html) |
| Wiki del firmware: problemas de USB | Página "usb related issues" | Web | [github.com](https://github.com/qca/open-ath9k-htc-firmware/wiki/usb-related-issues) |
| Firmware libre ath9k_htc | Repositorio `qca/open-ath9k-htc-firmware` | Web | [github.com](https://github.com/qca/open-ath9k-htc-firmware/) |
| Debian: paquete del firmware libre | `firmware-ath9k-htc` (`main`) | Web | [tracker](https://tracker.debian.org/open-ath9k-htc-firmware) · [AppStream](https://appstream.debian.org/sid/main/metainfo/firmware-ath9k-htc.html) |
| Debian: paquete `firmware-atheros` | `non-free-firmware` | Web | [AppStream](https://appstream.debian.org/sid/non-free-firmware/metainfo/firmware-atheros.html) |
| Código del driver en el kernel de Pi | `drivers/net/wireless/ath/ath9k/` (rama `rpi-6.12.y`) | Código | [hif_usb.c](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/hif_usb.c) · [htc_drv_init.c](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/htc_drv_init.c) · [hif_usb.h](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/hif_usb.h) |
| Documentación de Raspberry Pi: alimentación | Fuente AsciiDoc de "Power supplies" | Web | [power-supplies.adoc](https://raw.githubusercontent.com/raspberrypi/documentation/master/documentation/asciidoc/computers/raspberry-pi/power-supplies.adoc) |
| Raspberry Pi 3B+, product brief | RP-008338-DS-2 (oct. 2025) | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf) |
| Raspberry Pi 3B+, declaración UE de conformidad | RP-001265-CF-3 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/534-approvals/documents/RP-001265-CF-3-rpi-3bplus%20EU%20Declaration%20of%20Conformity%20(DoC).pdf) |
| Norma armonizada de 2,4 GHz | ETSI EN 300 328 V2.2.2 (2019-07) | PDF | [descargar](https://www.etsi.org/deliver/etsi_en/300300_300399/300328/02.02.02_60/en_300328v020202p.pdf) |
| Transposición española de la RED | Real Decreto 188/2016, BOE núm. 113, 10-05-2016 | Web | [boe.es](https://www.boe.es/eli/es/rd/2016/05/06/188) |
| Directiva RED 2014/53/UE | Texto en EUR-Lex | Web | [eur-lex.europa.eu](https://eur-lex.europa.eu/eli/dir/2014/53/oj/eng) (la página no entregó el texto a mi herramienta) |

Todos los enlaces consultados están en [`enlaces.md`](enlaces.md). **No hay ficha de producto de tu adaptador concreto**: no conozco su marca. Pídele al vendedor la declaración de conformidad y la ficha ([sección 6](#6-normativa-de-radio-red)).

### Qué dicen los documentos más relevantes

- **Datasheet del AR9271 (rev. 2.0):** confirma 1x1, 2,4 GHz, USB 2.0, PA/LNA integrados y cifrado por hardware. Explica que la potencia de TX se ajusta con un lazo cerrado al inicio de cada paquete. Mi herramienta no extrajo las secciones de características eléctricas (potencia por velocidad, sensibilidad, consumo, temperatura), que aparecen en el índice como 6.2 a 6.9. **Ábrelo para esas tablas.**
- **Especificación del TPE-N150USB:** es el único documento que abrí con potencias y consumos por modo. Son de un módulo concreto y llevan tolerancia de ±2 dBm. No lista CE ni FCC (solo RoHS).
- **Wiki de problemas de USB del firmware:** ver [sección 5](#5-fallos-bugs-y-problemas-conocidos). Es la fuente más útil sobre fiabilidad.
- **Código de `hif_usb.c`:** define qué firmware se pide y en qué orden, qué IDs USB reclama el driver y que el driver **no** declara soporte de autosuspensión USB.

## 4. Uso, configuración e integración

### 4.1 Software y firmware en Raspberry Pi OS Trixie

**Qué trae la imagen.**

- La receta de la imagen oficial ([pi-gen, rama `master`, `RELEASE` por defecto `trixie`](https://raw.githubusercontent.com/RPi-Distro/pi-gen/master/build.sh)) instala `firmware-atheros`, `wpasupplicant`, `wireless-tools`, `network-manager`, `usbutils` y `ethtool` ([`02-net-tweaks`](https://raw.githubusercontent.com/RPi-Distro/pi-gen/master/stage2/02-net-tweaks/00-packages), [`01-sys-tweaks`](https://raw.githubusercontent.com/RPi-Distro/pi-gen/master/stage2/01-sys-tweaks/00-packages)). No nombra `firmware-ath9k-htc`.
- La imagen Lite de **Bookworm** de abril de 2025 (la única lista de paquetes que pude abrir) incluye `firmware-atheros 1:20240709-2~bpo12+1+rpt2`, `iw 5.19-1`, `rfkill`, `wireless-regdb` y el kernel 6.12.20+rpt, y **no** incluye `firmware-ath9k-htc` ([lista de la imagen](https://mirrors.cqupt.edu.cn/raspberry-pi-os-images/beta/raspios_lite_arm64/2025-04-08-raspios-bookworm-arm64-lite.info)). La de Trixie no la he visto: **sin verificar**.

**Qué firmware pide el kernel.** En `ath9k_hif_request_firmware` ([`hif_usb.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/hif_usb.c)):

1. Primero `ath9k_htc/htc_9271-1.4.0.fw` (o la versión de desarrollo `1.dev.0` si cargas el módulo con `use_dev_fw=1`).
2. Si no existe, `htc_9271.fw` ("stable version 1.3, deprecated", dice el comentario).
3. Si tampoco existe: `no suitable firmware found!` y el adaptador no se inicializa.

Con solo `firmware-atheros` el adaptador debería arrancar con el 1.3 tras un intento fallido del 1.4.0 (el cargador de firmware lo registra en `dmesg` como un error `-2`, inofensivo si luego sigue "Transferred FW"). Es una deducción mía del código, no una prueba. Un usuario de PureOS, que **no tenía ninguno de los dos ficheros**, vio `failed to load ath9k_htc/htc_9271-1.4.0.fw (-2)` y después `no suitable firmware found!`; la solución fue instalar `firmware-ath9k-htc` ([foro de Purism](https://forums.puri.sm/t/tp-link-wn722n-ar9002u-ar9271l-not-working/1586)). **La versión de `htc_9271.fw` que lleva `firmware-atheros` en Debian: sin verificar.**

**Instalar el 1.4.0.**

```bash
sudo apt install firmware-ath9k-htc     # sección main; sin dependencias (según un hilo de 2017)
```

- Es un paquete `all` de `main`: no hace falta habilitar `non-free-firmware` ([AppStream](https://appstream.debian.org/sid/main/metainfo/firmware-ath9k-htc.html); [ThinkPenguin](https://thinkpenguin.com/gnu-linux/penguin-wireless-n-usb-adapter-gnu-linux-tpe-n150usb-debian-firmware-install) lo confirma para Debian 11 y 12). Contiene `ath9k_htc/htc_9271-1.4.0.fw` y `htc_7010-1.4.0.fw`.
- En el resumen de AppStream, `firmware-atheros` solo muestra `htc_9271.fw` y `htc_7010.fw` (sin ruta `ath9k_htc/`), así que no deberían solaparse. **No he comprobado cómo se comporta `apt` con ambos instalados** (un parche de Proxmox añadió `Conflicts/Replaces` por solapamiento de otros paquetes: [lore.proxmox.com](https://lore.proxmox.com/all/1720011326.db8gb9ofrz.astroid@yuna.none/t/)).
- Instálalo **antes** de activar el Overlay File System (guía §7), o la instalación se perderá al reiniciar.

**Resto de la configuración.**

- Con `dtoverlay=disable-wifi` el adaptador USB queda como único dispositivo Wi-Fi. El nombre de la interfaz (`wlan0` o un nombre predecible) lo verás con `ip link`: **sin verificar**.
- Fija el país **ES**. Si no está fijado, el driver parte de los dominios regulatorios "mundiales" de Atheros: 20 dBm de PIRE máximo y canales 12-13 solo en modo pasivo (`NO_IR`) ([`regd.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/regd.c)). Qué dominio concreto aplica a tu unidad depende de su EEPROM (sin verificar). La guía ya lo prevé (raspi-config, WLAN Country ES).
- `iw dev wlan0 set power_save off` **no hace falta y probablemente devuelva "Operation not supported"**: el driver no activa `SUPPORTS_PS` salvo con `ps_enable=1`, y `ieee80211_set_power_mgmt` devuelve `-EOPNOTSUPP` si el hardware no lo soporta ([`htc_drv_init.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/htc_drv_init.c), [`net/mac80211/cfg.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/net/mac80211/cfg.c)). Es lectura mía del código, no probada.
- **Autosuspensión USB:** el kernel la desactiva por defecto para todo lo que no sea un hub ([documentación del kernel](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/Documentation/driver-api/usb/power-management.rst)), y la estructura `usb_driver` de `ath9k_hif_usb_driver` no declara `.supports_autosuspend`. Así que no hay que tocar nada, salvo no activarla tú.
- **LED:** el LED del adaptador lo conduce el host por USB y algunos controladores lo llevan mal. La wiki del firmware propone apagarlo con `echo none > /sys/class/leds/ath9k_htc-phy*/trigger` ([wiki](https://github.com/qca/open-ath9k-htc-firmware/wiki/usb-related-issues)). Úsalo solo si ves desconexiones.
- Opciones del módulo del driver (`modinfo ath9k_htc`): `nohwcrypt`, `ps_enable`, `btcoex_enable`, `debug`, `use_dev_fw` ([`htc_drv_init.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/htc_drv_init.c)). Un usuario con bloqueos probó `nohwcrypt=1 ps_enable=0 blink=0` y vio una hora estable ([issue #173](https://github.com/qca/open-ath9k-htc-firmware/issues/173)): es **muy poca evidencia**, y `blink` no es un parámetro de `ath9k_htc` en el código que leí.

### 4.2 Comprobar que es un AR9271 al recibirlo

Comandos y qué esperar. Los criterios salen de las tablas de IDs de los drivers del kernel de Pi (no son listas exhaustivas: hay más chips y más IDs); no he encontrado una guía publicada de detección de falsificaciones.

```bash
lsusb                       # ID: debe ser uno de los de la tabla de la sección 2 (lo normal: 0cf3:9271)
lsusb -t                    # la línea del adaptador debe mostrar Driver=ath9k_htc y velocidad 480M
dmesg | grep -iE "ath9k|htc|firmware"
iw dev                      # debe aparecer una interfaz Wi-Fi
iw list                     # solo "Band 1" (2,4 GHz) y un flujo espacial (HT 1x1)
```

| Qué ves | Qué significa |
|---|---|
| `lsusb` da `0cf3:9271` (u otro ID de la tabla de la sección 2) y `lsusb -t` muestra `ath9k_htc` | Es un AR9271 (o un AR7010 en el caso de `0cf3:7010`/`7015`, que no es el que compras) |
| `0bda:8179`, `0bda:0179`, `2357:010c`, `2001:3311`, `0df6:0076` y similares | RTL8188EU: lo gestiona `rtl8xxxu` ([`core.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/realtek/rtl8xxxu/core.c)). **No es un AR9271** |
| `148f:7601`, `148f:760a` a `760d`, `0b05:17d3`, `0e8d:760a/760b`, `13d3:3431/3434`, `2001:3d04`, `2717:4106` | MT7601U: driver `mt7601u` ([`usb.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/mediatek/mt7601u/usb.c)). **No es un AR9271** |
| `148f:5370` o `148f:5372` | Ralink RT5370/RT5372: driver `rt2800usb` ([`rt2800usb.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ralink/rt2x00/rt2800usb.c)). **No es un AR9271** |
| `dmesg` muestra `ath9k_htc: Transferred FW: ath9k_htc/htc_9271-1.4.0.fw, size: …` | Firmware 1.4.0 cargado ([`hif_usb.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/hif_usb.c)) |
| `Transferred FW: htc_9271.fw` | Cargó el 1.3 (falta el paquete `firmware-ath9k-htc`) |
| `no suitable firmware found!` | No hay ningún firmware instalado |
| `ath9k_htc: Target is unresponsive` y luego `Failed to initialize the device` | El firmware se cargó pero el chip no respondió en 1 s (ver [sección 5](#5-fallos-bugs-y-problemas-conocidos)) |

Comprueba además, **a mano y antes de conectar nada más**:

- **Conector:** rosca exterior y pin central (RP-SMA hembra) si el alargo (#13) acaba en macho ("plug"). Wikipedia avisa de que hay fuentes con el género al revés, así que mira el conector, no la palabra ([Wikipedia](https://en.wikipedia.org/wiki/SMA_connector)).
- **Etiquetas:** marcado CE en el aparato o su caja, nombre y dirección del fabricante, número de modelo y de lote o serie ([sección 6](#6-normativa-de-radio-red)).
- **Velocidad USB:** `480M` en `lsusb -t`. La wiki del firmware avisa de que si el controlador lo deja en Full Speed el adaptador no está soportado ([wiki](https://github.com/qca/open-ath9k-htc-firmware/wiki/usb-related-issues)).
- **Qué marcas lo llevan de verdad (confirmadas):** Alfa AWUS036NHA, TP-Link TL-WN722N **v1.x** y TL-WN721N, Netgear WNA1100, D-Link DWA-126, ThinkPenguin TPE-N150USB, Unex DNUA-93F, Ubiquiti WiFiStation ([kernel wiki](https://wireless.docs.kernel.org/en/latest/en/users/drivers/ath9k_htc/devices.html), [Parabola](https://wiki.parabola.nu/WiFi_devices_known_to_work_with_Parabola_GNU/Linux-libre)). **Panda:** no encontré fuente que lo confirme (sin verificar). Ninguna de estas es tu unidad.

### 4.3 Alimentación en el bus USB de la 3B+

| Dato | Valor | Fuente |
|---|---|---|
| Corriente del adaptador (módulo AR9271) | 300 mA en TX, 280 mA en RX | [TPE-N150USB](https://thinkpenguin.com/files/TPE-N150USB-spec-sheet.pdf) |
| Corriente declarada en el descriptor USB (TL-WN721N) | 500 mA (`MaxPower`) | [kernel wiki](https://wireless.docs.kernel.org/en/latest/en/users/drivers/ath9k_htc/devices.html) |
| Pi 3B+, corriente típica de la placa | 500 mA | [documentación](https://raw.githubusercontent.com/raspberrypi/documentation/master/documentation/asciidoc/computers/raspberry-pi/power-supplies.adoc) |
| Pi 3B+, corriente total para periféricos USB | **1,2 A** | Misma |
| Pi 3B+, fuente recomendada | 2,5 A | Misma |
| Umbral de aviso de subtensión | 4,63 V (±5 %) | Misma ([product brief](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf) no lo da) |

**Cálculo mío (efecto sobre el umbral de 4,63 V con la fuente a 5,20 V):**

- Margen: 5,20 − 4,63 = **0,57 V**.
- Un cable de 22 AWG tiene unos 0,052 Ω/m (valor estándar del cobre, no de una fuente de este proyecto). Latiguillo de 15 cm, ida y vuelta: unos 16 mΩ.
- Corriente total típica con el adaptador: 1,05 A, que son unos 16 mV. Los 0,3 A del adaptador aportan **unos 5 mV**.
- Para gastar los 0,57 V con 0,3 A adicionales haría falta una resistencia de 1,9 Ω.
- No incluyo la resistencia del fusible reseteable de entrada de la Pi (el esquema reducido muestra un MF-MSMF250 en "POWER IN"; su resistencia **no la he verificado**) ni los contactos del conector micro-USB. Mídelo en la placa: `vcgencmd get_throttled` debe dar `0x0` y debe seguir dándolo en TX continuo.

**Conclusión mía:** el adaptador no amenaza el umbral. La 3B+ da 1,2 A en total a los USB, de los que el adaptador usa una cuarta parte. Si en TX la corriente fuera mayor que en la hoja (módulos con PA más potente, como el SparkLAN de 23 dBm), seguiría lejos del límite.

### 4.4 Antena y alargo

- **Quién cubre qué:** la ficha del [alargo (#13)](../alargo-antena-rp-sma-30cm/README.md) trata los conectores, la pérdida del cable (de 0,9 a 1,4 dB con conectores, según esa ficha) y el techo de acero como plano de masa. Aquí solo lo que afecta al adaptador.
- **Género:** el Alfa lleva RP-SMA **hembra** (rosca exterior, pin) en el aparato ([Alfa](https://www.alfa.com.tw/products/awus036nha)), así que lo que se enrosca en él es un RP-SMA macho (deducción mía con la tabla de [Wikipedia](https://en.wikipedia.org/wiki/SMA_connector)). Por tanto el extremo del alargo que va al adaptador debe ser RP-SMA **macho** ("plug") y el de panel, **hembra**. Es lo que describe la guía. Falta confirmar que el adaptador que llegue sea como el Alfa.
- **Antena sobre el techo de acero (deducción mía, teoría general):** si es un monopolo, la chapa hace de plano de masa y está bien (a 2,4 GHz, λ/4 son unos 3 cm; Wikipedia pide un plano de al menos λ/4 de radio y, en otra página, medio λ) ([Ground plane](https://en.wikipedia.org/wiki/Ground_plane), [Monopole antenna](https://en.wikipedia.org/wiki/Monopole_antenna)). Si es un dipolo de 2 dBi, apoyarlo sobre la chapa lo desajusta. **No sé qué tipo de antena lleva tu unidad.** Wikipedia dice que los "rubber duck" suelen ser monopolos helicoidales acortados ([Wikipedia](https://en.wikipedia.org/wiki/Rubber_ducky_antenna)). La prueba práctica está en la ficha del alargo (RSSI con `iw dev wlan0 link` antes y después).
- **Masa (observación mía, relacionada con la guía §5.2):** la carcasa del conector de panel hace contacto con la chapa del techo, que la guía conecta a tierra de red. Por el blindaje del cable, el 0 V del adaptador (masa USB) quedaría unido a la tierra de protección a través de la antena. La guía dice "no hagas más uniones de masa". Decide si lo aceptas (es una unión de 0 V a tierra, habitual en equipos de clase I) o aísla el conector de panel (arandelas de plástico). **No he encontrado una fuente que diga cuál es mejor**; lo señalo para que lo revises con el electricista de la guía.

## 5. Fallos, bugs y problemas conocidos

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | El adaptador no es un AR9271 (chip distinto) | Alta si ocurre; probabilidad desconocida |
| 2 | Falta el firmware 1.4.0 y se carga el 1.3, o falta todo | Media (se resuelve con un paquete) |
| 3 | `Target is unresponsive` / `Failed to initialize the device` | Media-alta |
| 4 | Bloqueo aleatorio hasta desenchufar | Alta en una máquina desatendida |
| 5 | Desconexiones por cable, alimentación o controlador USB | Media |
| 6 | La suspensión USB no funciona; el firmware se reinicia | Baja-media (no se usa suspensión) |
| 7 | Reinicio del chip al hacer reset USB (según controlador) | Media, sin confirmar en la Pi |
| 8 | Hay que desenchufar y enchufar tras un reinicio (TL-WN722N) | Media, de un modelo concreto |
| 9 | CVE-2026-68363 (uso tras liberar, solo denegación de servicio local) | Baja (corregido en ramas estables; en el kernel de Pi, por inferencia) |
| 10 | Potencia y PIRE cerca del límite de 20 dBm | Media (normativa) |
| 11 | Temperatura de trabajo de 0 a 40 °C en módulos de consumo | Media |
| 12 | Disponibilidad del chip y de adaptadores de marca | Media |
| 13 | Solo 2,4 GHz | Baja (el Solo también) |

### 5.1 El adaptador no es un AR9271

No he encontrado fuentes sobre falsificaciones de este chip. Lo que sí hay es una consecuencia técnica: un adaptador con otro chip tiene otro ID USB y lo gestiona otro driver ([sección 4.2](#42-comprobar-que-es-un-ar9271-al-recibirlo)). Los drivers alternativos también están en el kernel de Pi (`rtl8xxxu`, `mt7601u`, `rt2800usb`), así que un chip distinto probablemente **funcionaría** (deducción mía), pero cambian el firmware necesario, las limitaciones del driver (`rtl8xxxu`: sin 40 MHz ni gestión de energía, según su [Kconfig](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/realtek/rtl8xxxu/Kconfig)) y lo que se declara en la documentación de conformidad ([sección 6](#6-normativa-de-radio-red)). La guía da el TL-WN722N v2 como ejemplo de cambio de chip: confirmado para la v2 con el código del kernel.

### 5.2 Firmware ausente o antiguo

- El usuario de PureOS en 2017 vio `failed to load ath9k_htc/htc_9271-1.4.0.fw (-2)`, `no suitable firmware found!` y `USB layer deinitialized`; faltaba `firmware-ath9k-htc` ([Purism](https://forums.puri.sm/t/tp-link-wn722n-ar9002u-ar9271l-not-working/1586)).
- En Arch en 2016 se discutía por qué `htc_9271.fw` y `htc_9271-1.4.0.fw` difieren solo unos 28 bytes. Respuesta de un usuario: el no versionado es para kernels antiguos ([foro de Arch](https://bbs.archlinux.org/viewtopic.php?id=214312)).
- La versión del firmware importa: la wiki del proyecto dice que ciertos errores `BOGUS urb xfer` se corrigen con firmware ≥ 1.4 y kernel ≥ 3.18 ([wiki](https://github.com/qca/open-ath9k-htc-firmware/wiki/usb-related-issues)). Con el 1.3 conviene saber que existe esa diferencia.
- Estado del firmware libre: Debian trixie lleva `1.4.0-110-ge888634+dfsg1-0.1` y testing/unstable `…-0.4` (subido el 17-08-2026) ([tracker](https://tracker.debian.org/open-ath9k-htc-firmware)). El repositorio no tiene releases publicadas y muestra 79 issues abiertos ([GitHub](https://github.com/qca/open-ath9k-htc-firmware/)): el firmware se mantiene poco, aunque el paquete de Debian se sigue actualizando.

### 5.3 "Target is unresponsive" y "Failed to initialize the device"

- En el código: `Target is unresponsive` aparece si el firmware no avisa de que está listo en 1 segundo tras la descarga; `Failed to initialize the device` es el resultado ([`htc_drv_init.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/htc_drv_init.c), [`htc_hst.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/htc_hst.c)).
- Caso de 2015 con un TL-WN722N en un router OpenWrt: el firmware se transfirió y a continuación "Target is unresponsive". Funcionaba en otros PC. Un desarrollador sospechó de falta de corriente USB y sugirió un hub con alimentación; no hay solución confirmada en el hilo ([openwrt-devel](https://lists.infradead.org/pipermail/openwrt-devel/2015-May/007216.html)).
- En la 3B+ el adaptador recibe 5 V de la placa y de su fusible de entrada. Con la fuente a 5,20 V y el latiguillo corto el riesgo de falta de corriente es bajo (sección 4.3), pero **conviene medirlo**.

### 5.4 Bloqueo aleatorio hasta desenchufar

- Issue #173 del repositorio del firmware ([GitHub](https://github.com/qca/open-ath9k-htc-firmware/issues/173)): un Alfa AWUS036NHA (AR9271, firmware 1.4.0) en dos distribuciones con kernel 5.10 y 5.15 deja de responder en momentos aleatorios hasta que se desenchufa; reinsertado, funciona hasta el siguiente fallo.
- Mensajes: `Unable to remove station entry`, `USB disconnect`, `Chip reset failed`, `Unable to reset channel`, `RX failed to go idle in 10 ms`, `Failed to wakeup in 500us`.
- Un colaborador (ZerBea) vio que desaparecía con el kernel 5.17.1 tras casi 9 horas de prueba; otro usuario, con `nohwcrypt=1 ps_enable=0 blink=0`, aguantó una hora. El desarrollador del firmware no dio un diagnóstico.
- No es un caso de Raspberry Pi y no indica la frecuencia. Pero es **el patrón de fallo** que hay que cubrir con un watchdog.

### 5.5 Desconexiones por cable, alimentación y controlador

La wiki del firmware ([usb related issues](https://github.com/qca/open-ath9k-htc-firmware/wiki/usb-related-issues)) dice:

- Un `USB disconnect` seguido de `Failed to wakeup in 500us` indica inestabilidad. El hardware es **sensible a la calidad del cable**: probar uno más corto, y usar un hub alimentado. Algunos controladores USB dan problemas.
- Los LED los conduce el host por USB; apágalos si hay desconexiones.
- Los endpoints de interrupción 3 y 4 responden lento en USB 2.0 (2-4 ms, frente a unos 0,2 ms en USB 3.0) por un defecto de diseño del controlador FUSB200 del chip.
- Si el controlador negocia Full Speed, el adaptador no está soportado.

**Para la Pi:** el adaptador va enchufado directamente al puerto (sin cable), así que el punto del cable casi no aplica. El hub de la 3B+ es el LAN7515. **No encontré datos de estabilidad del AR9271 sobre ese hub ni sobre el controlador USB de la Pi** (DWC OTG, `brcm,bcm2708-usb` en el árbol de dispositivos): sin verificar.

### 5.6 Suspensión y reset USB

- La wiki dice que la **suspensión no funciona**: el firmware se reinicia (en el mejor caso entra en bajo consumo y se reinicia al reanudar). El driver lo trata con `reset_resume` y recarga el firmware ([`hif_usb.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/hif_usb.c)).
- El reset USB "funciona en la mayoría de controladores xHCI pero puede provocar reinicios en algunos EHCI" y algunos EHCI envían una señal de suspensión tras el reset, quizá un fallo de hardware ([wiki](https://github.com/qca/open-ath9k-htc-firmware/wiki/usb-related-issues)). **No sé cómo se comporta el controlador de la Pi.** Por eso mi recomendación de recuperación (sección 8) prueba primero a recargar el módulo y no a resetear el puerto.
- La autosuspensión USB no se activa para este dispositivo por defecto (sección 4.1), y el driver no la soporta. No es un problema real salvo que alguien la active.

### 5.7 Reinicio del adaptador tras reiniciar el equipo

La wiki de Ubuntu anota para el TL-WN722N (`ath9k_htc`): "Needs unplug/replug after a reboot or power off of the PC from time to time" ([Ubuntu](https://help.ubuntu.com/community/HardwareSupportComponentsWirelessNetworkCardsTP-Link)). Es una nota genérica y sin fecha; el driver intenta reiniciar el firmware si ya estaba cargado (commit de 2013, [historial](https://git.zx2c4.com/linux-dev/log/drivers/net/wireless/ath/ath9k/hif_usb.c)), pero el síntoma que describe es justo el que no se puede arreglar a mano en una máquina cerrada. Se cubre con el arranque en frío de la prueba de recepción (sección 8).

### 5.8 Errores en el kernel

- **CVE-2026-68363** (publicado el 10-08-2026): uso tras liberar en `ath9k_hif_request_firmware` si se conecta y desconecta repetidamente un adaptador cuyo firmware no carga. Un usuario local podría causar un cuelgue (CVSS 4.4, medio). Corregido en 6.12.101, 6.18.42 y otras ramas estables ([OpenCVE](https://app.opencve.io/cve/CVE-2026-68363), agregador; el propio sitio avisa de que los datos de versiones no son del todo coherentes). El árbol de Pi `rpi-6.12.y` está en 6.12.113 y su `hif_usb.c` ya no tiene el mensaje informativo que causaba el fallo (cuenta de la cadena "requested" = 0). **Es una inferencia mía**, no un aviso de Raspberry Pi. Mantén el kernel al día con `apt upgrade` **antes** de activar el sistema de solo lectura.
- Historial de errores del archivo (2020-2022): "Fix regression with Atheros 9271" el 20-07-2020, tres arreglos de memoria en recepción el 07-04-2020 y un `memcpy` fuera de límites el 20-12-2021 ([historial](https://git.zx2c4.com/linux-dev/log/drivers/net/wireless/ath/ath9k/hif_usb.c); la lista que abrí se acaba en 2022). Los títulos de LKML muestran que al menos dos de esos arreglos se revirtieron después ([revert del "general protection fault"](https://lkml.iu.edu/hypermail/linux/kernel/2007.1/08041.html), [revert de la carrera `usb_get_urb`](https://lkml.iu.edu/hypermail/linux/kernel/2010.1/04646.html)); solo vi los títulos. No tengo el historial posterior a 2022.
- Issue #184 del repositorio del firmware (diciembre de 2025): congelación parcial del sistema al intentar arrancar un AP con un TL-WN821N/822N (AR7010+AR9287) y retirar el adaptador, en Devuan con kernel 6.12.57 ([GitHub](https://github.com/qca/open-ath9k-htc-firmware/issues/184)). **No es un AR9271 ni modo estación**; lo cito porque es un fallo reciente en 6.12. No aplica a un cliente Wi-Fi fijo.

### 5.9 Potencia y PIRE

Ver [sección 6](#6-normativa-de-radio-red). Resumen: el límite es 20 dBm de PIRE y el módulo de referencia da +18 dBm en 802.11b, así que con 2 dBi de antena queda en el límite; con tolerancia de ±2 dBm podría pasarlo. Otros módulos AR9271 anuncian 23 dBm.

### 5.10 Temperatura

Los módulos de consumo con este chip se especifican de 0 a 40 °C ([TPE-N150USB](https://thinkpenguin.com/files/TPE-N150USB-spec-sheet.pdf), [TL-WN722N](https://shop.aodatacloud.es/medias/datasheet_tl-wn722n.pdf)). La guía ya identifica el calor en la caja como riesgo 5 (el Solo admite 40 °C y la cámara 0-50 °C). El adaptador va en la Pi dentro de la caja interior suspendida. **Si la caja pasa de 40 °C, el adaptador es otro componente fuera de especificación.** Un módulo industrial existe (SparkLAN, −30 a 75 °C, [página](https://embeddedworks.net/product/wlan382)), pero no sé si hay uno compatible con tu antena y presupuesto.

### 5.11 Disponibilidad

El datasheet es de 2011 y el único modelo de marca que confirmé, el Alfa AWUS036NHA, está agotado y marcado EOL. Las unidades genéricas pueden cambiar de fabricante o de chip entre lotes sin aviso. **No hay aviso oficial de Qualcomm en lo que abrí.** Compra con holgura (unidades de repuesto del mismo lote) y registra el ID USB de cada lote.

## 6. Normativa de radio (RED)

**Aviso:** esto es lectura de las normas, no asesoría legal. Las conclusiones sobre qué debe hacer tu empresa conviene confirmarlas con un laboratorio o consultor de marcado CE.

### 6.1 Qué exige la norma a un adaptador Wi-Fi

El Real Decreto 188/2016 transpone íntegramente la Directiva 2014/53/UE ([BOE núm. 113, 10-05-2016](https://www.boe.es/eli/es/rd/2016/05/06/188)). Lo relevante, con su artículo:

| Artículo | Qué dice (paráfrasis) |
|---|---|
| 2.1.b | Es equipo radioeléctrico también el producto que debe completarse con un accesorio, "como una antena", para emitir o recibir. Un adaptador sin antena puesta sigue contando. |
| 3 | Requisitos esenciales: salud y seguridad, compatibilidad electromagnética y uso eficaz del espectro. 3.3 prevé requisitos adicionales (datos personales, fraude) por actos delegados. |
| 9.6-9.7 | El fabricante identifica el equipo con tipo, lote o serie, y pone su nombre y dirección de contacto. |
| 9.8 | Instrucciones y datos de seguridad en un idioma fácil de entender, **como mínimo en español** en España. Para emisores intencionados: **bandas de frecuencia y potencia máxima de RF**. |
| 9.9 | Cada unidad lleva la declaración UE de conformidad completa o una simplificada con la **dirección exacta de internet** del texto completo. |
| 17-19 | La declaración sigue los anexos VI y VII, y en España debe estar en castellano. El marcado CE debe ser visible, legible e indeleble y lo pone el fabricante antes de comercializar. |
| 12 | El distribuidor comprueba el marcado CE, los documentos y las instrucciones en español antes de vender. |
| 13 | Quien comercializa bajo su nombre o modifica el equipo de forma que pueda afectar a la conformidad, se considera fabricante. |

(No pude leer el Anexo VI, que fija el contenido de la declaración: el texto del BOE que entregó mi herramienta se corta tras el artículo 36.)

**Ejemplo de qué debe citar una declaración:** la de la Raspberry Pi 3B+ ([RP-001265-CF-3](https://pip-assets.raspberrypi.com/categories/534-approvals/documents/RP-001265-CF-3-rpi-3bplus%20EU%20Declaration%20of%20Conformity%20(DoC).pdf)) cita la Directiva 2014/53/UE, el procedimiento de control interno de producción (Anexo II) y las normas armonizadas **EN 300 328 V2.2.2** (2,4 GHz), EN 301 893 V2.1.1 (5 GHz), **EN 301 489-1 V2.2.3**, **EN 301 489-17 V3.1.1** y EN 62368-1. Un adaptador de 2,4 GHz debe citar al menos las tres primeras (sin la de 5 GHz). El product brief de la Pi añade que los periféricos deben cumplir las normas del país de uso y estar marcados en consecuencia ([product brief](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf)).

### 6.2 Potencia y país

- **Límite:** potencia de salida de los equipos de banda ancha no FHSS ≤ **20 dBm**, definida como PIRE media durante una ráfaga (**EN 300 328 V2.2.2, cláusulas 4.3.2.2.2 y 4.3.2.2.3**, [PDF](https://www.etsi.org/deliver/etsi_en/300300_300399/300328/02.02.02_60/en_300328v020202p.pdf)). 20 dBm son 100 mW. Mi herramienta leyó la frase de la cláusula y la definición; **no leí el reglamento de la UE sobre dispositivos de corto alcance** que fija el mismo límite, así que no cito su número.
- **Antena:** una **antena desmontable** es una "antena dedicada", que se evalúa **junto con el equipo** (cláusulas 3.1 y 4.2.4). La cláusula 4.3.1.2.3 (escrita para FHSS; no leí la equivalente para no FHSS) aplica el límite "para cualquier combinación de nivel de potencia y conjunto de antena previsto". El **alargo** cambia el conjunto de antena evaluado (más pérdida, así que menos PIRE, pero distinto del ensayado; deducción mía).
- **Cálculo mío con las cifras del módulo de referencia:** 802.11b, +18 dBm (±2) más 2 dBi = **20 dBm**, justo en el límite; con la tolerancia, hasta 22 dBm. HT20 en MCS0-5: +16 + 2 = 18 dBm. Un módulo de 23 dBm (SparkLAN) daría 25 dBm sin limitación por software. Las pérdidas del alargo (0,9 a 1,4 dB, ficha #13) bajan algo la PIRE.
- **Qué hace Linux:** el driver calcula la potencia como mínimo entre el límite del canal (dominio regulatorio) y el de usuario, y le resta una ganancia de antena **leída de la EEPROM del propio adaptador**, no la de tu antena real (lectura de `ath9k_hw_apply_txpower` y `ath9k_hw_set_4k_power_per_rate_table`, [`hw.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/hw.c), [`eeprom_4k.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/eeprom_4k.c); unidades no comprobadas). Con país sin fijar se aplica el dominio mundial del driver: 20 dBm de PIRE y canales 12-13 pasivos ([`regd.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/regd.c)). **No leí la entrada de España de la base de datos regulatoria `wireless-regdb`.**
- **Código de país ES:** fíjalo (raspi-config, como prevé la guía §7). No he podido comprobar qué canales y potencia concede `wireless-regdb` a ES (sin verificar).

### 6.3 Qué implica para la máquina

- **El adaptador es un equipo radio aparte** y debe llegar con su marcado y documentación. Si el vendedor no los da, no puedes demostrar que cumple lo que pide el artículo 9 (identificación, marcado, declaración), y meterlo en una máquina que vendas traslada el problema a ti (art. 13 si lo modificas o lo pones bajo tu nombre; lectura mía).
- **La máquina entera:** el RD 188/2016 dice (art. 1.5) que si un aparato incorpora un equipo de telecomunicación, el reglamento se aplica **solo a ese equipo**; y (art. 6.2) que un sistema de equipos ya evaluados puede comercializarse si cumple "en su conjunto". La norma EN 300 328 define "equipo combinado" (producto sin radio más uno o más equipos radio) y "equipo radio enchufable" (módulo para uso en equipo combinado), pero **no pude leer sus cláusulas para equipos combinados** (la página que recibí se corta). No puedo decir si la máquina necesita ensayo propio ni si basta con las declaraciones de la Pi y el adaptador. **Hay que preguntarlo a un laboratorio**, con el montaje exacto (antena fuera de la caja y alargo).
- **La Pi:** su Wi-Fi tiene certificación modular y su declaración cubre RED con EN 300 328 V2.2.2. Que lo apagues con `disable-wifi` no cambia que el equipo lo lleve.
- **Ciberseguridad de la RED (acto delegado 2022/30):** la guía no la menciona. Entiendo que aplica a equipos radio conectados a internet que tratan datos personales o dinero (los apartados 3.3.d, e y f), y que es obligatoria desde el 1-8-2025, pero **no lo he podido verificar**: no abrí el reglamento. El BOE confirma que el art. 3.3 de la RED prevé esas categorías (e: datos personales, f: fraude). Pregunta por ello al mismo laboratorio.

## 7. Alternativas

Solo si el AR9271 resulta débil o no se consigue. **No he encontrado comparativas de fiabilidad entre estos chips en esta sesión**; solo datos de soporte en el kernel de Pi y límites del driver.

| Alternativa | Driver en el kernel de Pi | Firmware | Limitaciones del driver | Fuente |
|---|---|---|---|---|
| RTL8188EU (p. ej. TL-WN722N v2) | `rtl8xxxu` (`=m`) | `rtlwifi/rtl8188eufw.bin` | Sin canales de 40 MHz ni gestión de energía (Kconfig) | [`Kconfig`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/realtek/rtl8xxxu/Kconfig), [`core.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/realtek/rtl8xxxu/core.c) |
| MediaTek MT7601U | `mt7601u` (`=m`) | `mt7601u.bin` | No he leído limitaciones | [`usb.h`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/mediatek/mt7601u/usb.h), [`usb.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/mediatek/mt7601u/usb.c) |
| Ralink RT5370 | `rt2800usb` (`=m`, con `RT2800USB_RT53XX=y`) | `rt2870.bin` | No he leído limitaciones | [`rt2800usb.h`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ralink/rt2x00/rt2800usb.h), [`rt2800usb.c`](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ralink/rt2x00/rt2800usb.c) |
| Ethernet RJ45 de la Pi (si el local tiene cable) | Integrado | No | Gigabit sobre USB 2.0, máximo 300 Mb/s | [product brief](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf) |
| Router 4G (plan B de la guía) | Tratado en la ficha correspondiente | | | Guía §1 |

- **Firmware de las alternativas:** los nombres de fichero salen del código. **No he comprobado en qué paquete de Debian está cada uno** (`firmware-realtek`, `firmware-mediatek`, `firmware-misc-nonfree` son los candidatos; la receta de la imagen instala `firmware-realtek` y `firmware-mediatek` según [pi-gen](https://raw.githubusercontent.com/RPi-Distro/pi-gen/master/stage2/02-net-tweaks/00-packages)). Sin verificar.
- **Consumo del RT5370:** 140 mA bajo carga de pings continuos en un dongle de elemento14 con RT5370N, medido con un medidor USB ([Gough Lui](https://goughlui.com/?p=14057)). Es un caso concreto; la potencia que midió fue de 11 a 12 mW, por debajo de lo que anunciaba la caja.
- **La alternativa más simple** si hay Ethernet es el RJ45 de la Pi. El Solo necesita su propio Wi-Fi igualmente.
- **Comparar con la guía:** la guía descarta el TL-WN722N v2/v3 por una razón desfasada (discrepancia 2). Eso no convierte al RTL8188EU en mejor ni peor que el AR9271; solo falta evidencia.

## 8. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Antes de comprar en serie, pide al vendedor** (por escrito): fabricante y modelo, ID USB, ficha técnica con potencia y consumo, declaración UE de conformidad (con la dirección de internet) y temperatura de trabajo. Si no los da, trata la unidad como no apta para una máquina que vendas.
2. **Al recibirlo:** `lsusb`, `lsusb -t`, `dmesg` e `iw list` (sección 4.2). Anota ID USB, versión de `uname -r` y el nombre del firmware cargado. Si no es `ath9k_htc`, devuélvelo o reclasifícalo con su driver correspondiente.
3. **Instala `firmware-ath9k-htc`** (1.4.0) y comprueba en `dmesg` que carga `htc_9271-1.4.0.fw`. Hazlo antes del Overlay File System. Mantén el kernel actualizado.
4. **Prueba de resistencia de 72 horas** con la Pi en la caja cerrada a la temperatura más alta esperable (guía riesgo 5): tráfico continuo hacia `api.sumup.com` y registro de `dmesg` con `Failed to wakeup`, `Chip reset failed`, `USB disconnect`, `Target is unresponsive`. Mide también `vcgencmd get_throttled` (debe ser `0x0`).
5. **Recuperación automática:** un servicio que compruebe la conectividad cada minuto y, si falla N veces, haga `modprobe -r ath9k_htc && modprobe ath9k_htc` y, como último recurso, reinicie la Pi. Es una propuesta sin probar. Dado el historial (sección 5.4-5.6) no confíes en el reset del puerto USB hasta probarlo en la Pi.
6. **Conecta el adaptador directamente** al puerto USB de la Pi, sin hub ni cable alargador, y **no uses el LAN7515 compartido** para otra cosa pesada. Apaga el LED si aparecen desconexiones (sección 4.1).
7. **Fija el país ES** y comprueba en `iw reg get` que se aplica. Mide la potencia real o pídela al fabricante: si el conjunto módulo + antena supera 20 dBm de PIRE, limítala con `iw dev … set txpower` (comprueba que el driver lo acepta; sin verificar) y documenta el valor.
8. **Documenta el conjunto de antena** (adaptador, antena, alargo) para el expediente técnico. Pregunta a un laboratorio si la máquina completa necesita ensayo con la antena fuera de la caja (sección 6.3).
9. **Decide la unión de masa** de la carcasa del conector de panel con la chapa (sección 4.4) y mide la señal con y sin alargo (ficha #13).
10. **Compra con repuesto** de la misma partida y guarda el ID USB por lote. Si la partida cambia de chip, vuelve a hacer las pruebas 2 y 4.
11. **Plan B real:** ten identificada una alternativa con driver en el kernel (sección 7) y una versión Ethernet de la imagen, por si en un local el Wi-Fi no es viable.

## 9. Lo que no he podido verificar

Se agotó el presupuesto de búsquedas web de la sesión (compartido con otros agentes) cuando faltaban algunos huecos; los que no pude cerrar con una búsqueda nueva están aquí.

- **El anuncio de Amazon** (marca, fabricante, chip real, ID USB, antena de 2 dBi, género del conector, CE, temperatura): Amazon bloquea a mi herramienta.
- **Las tablas eléctricas del datasheet de Qualcomm** (potencia por velocidad, sensibilidad, consumo, temperatura): mi herramienta no las extrajo. Usé las de un módulo comercial.
- **Falsificaciones de AR9271** y su frecuencia en Amazon: no hay fuente en esta ficha.
- **Marcas que usan el chip:** la lista sale de las wikis del kernel y de Parabola; **Panda** y cualquier marca de Amazon quedan sin fuente.
- **Qué lleva Raspberry Pi OS Trixie:** solo vi la receta de la imagen y la lista de paquetes de una imagen Bookworm de 2025. No sé si Trixie preinstala `firmware-ath9k-htc`, ni la versión de `htc_9271.fw` de `firmware-atheros`, ni cómo se comporta `apt` con ambos.
- **Páginas que mi herramienta no abrió:** la wiki del kernel `wireless.docs.kernel.org/.../ath9k_htc.html` (usé la exportación `wireless.kernel.org/_export/raw/…`), el artículo de dev.to, `info.alfa.com.tw/awus036nha` (documentos del Alfa), la página de la Comisión sobre la RED, `wiki.debian.org/ath9k_htc` y `packages.debian.org` (bloqueados por un sistema anti-robots) y Amazon.
- **Texto de la Directiva en EUR-Lex y Anexo VI:** la página no entregó el texto. Usé el BOE (RD 188/2016), que la transpone.
- **El Reglamento Delegado (UE) 2022/30** de ciberseguridad de la RED: no lo abrí; lo que digo de él es de memoria y está marcado.
- **Límite de potencia y canales de España** en `wireless-regdb`, y el reglamento europeo de dispositivos de corto alcance.
- **Cláusulas de EN 300 328 sobre equipos combinados y enchufables** (se cortó la página).
- **Estabilidad real del AR9271 sobre el hub LAN7515 y el controlador DWC OTG** de la 3B+, y pruebas de 24/7 en una Pi: no encontré datos.
- **Resistencia del fusible reseteable de entrada** de la Pi: no calculada.
- **Qué antena lleva el adaptador** (dipolo o monopolo helicoidal) y su efecto sobre la chapa: teoría general solamente.
- **NetworkManager y la MAC aleatoria:** dos hilos de Debian 9 (2017-2018) recomendaban `wifi.scan-rand-mac-address=no`; no sé si sigue haciendo falta en Trixie.
- **WPA3/PMF** con este chip: no investigado.
- **Aviso de descatalogación de Qualcomm** para el AR9271.

## 10. Fuentes

Todos los enlaces, ordenados por tipo, en [`enlaces.md`](enlaces.md).
