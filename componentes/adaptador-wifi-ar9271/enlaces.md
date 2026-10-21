# Enlaces guardados: adaptador Wi-Fi USB AR9271

Todas las páginas y archivos consultados para la [ficha](README.md), reunidos el 21-10-2026. "Abierto" = mi herramienta devolvió contenido. Mi herramienta no puede descargar archivos: los PDF se descargan desde estos enlaces.

## Chip y módulos con el chip: documentos del fabricante

- [Datasheet AR9271, rev. 2.0, nov. 2011 (copia de Olimex, PDF)](https://www.olimex.com/Products/USB-Modules/WiFi/MOD-WIFI-AR9271-ANT/resources/AR9271.pdf) ([copia local](datasheets/AR9271.pdf)). Abierto; la extracción llega hasta las secciones de registros y **no incluye las tablas eléctricas** (sección 6).
- [Especificación TPE-N150USB (AR9271/UB93), ver. 1.22, 05-05-2016 (PDF)](https://thinkpenguin.com/files/TPE-N150USB-spec-sheet.pdf) ([copia local](datasheets/TPE-N150USB-spec-sheet.pdf)). Abierto. [Réplica](https://libre.thinkpenguin.com/files/TPE-N150USB-spec-sheet.pdf) ([copia local](datasheets/TPE-N150USB-spec-sheet.pdf)) (encontrada en la búsqueda, no abierta).
- [ThinkPenguin: instalación del firmware en Debian](https://thinkpenguin.com/gnu-linux/penguin-wireless-n-usb-adapter-gnu-linux-tpe-n150usb-debian-firmware-install). Abierto.
- [Alfa AWUS036NHA (EOL, agotado)](https://www.alfa.com.tw/products/awus036nha). Abierto. La página de descargas, [info.alfa.com.tw/awus036nha](https://info.alfa.com.tw/awus036nha), **no se pudo abrir** (la herramienta la bloqueó).
- [TP-Link TL-WN722N, hoja en una tienda (PDF)](https://shop.aodatacloud.es/medias/datasheet_tl-wn722n.pdf) ([copia local](datasheets/datasheet_tl-wn722n.pdf)). Abierto; no da versión de hardware ni chip.
- [TP-Link TL-WN722N, página de Dinamarca](https://www.tp-link.com/dk/home-networking/adapter/tl-wn722n/). Abierto; no da versión ni chip.
- [SparkLAN WUBA-171GN (AR9271)](https://embeddedworks.net/product/wlan382). Abierto; sin enlace a datasheet.
- Encontrados en la búsqueda y no abiertos: [SparkLAN WUBA-171GN (otra URL)](https://www.embeddedworks.net/wlan382/), [TechInfoDepot: AR9271](https://techinfodepot.shoutwiki.com/wiki/TechInfoDepot:Atheros/AR9271) (la página devolvió un bloqueo anti-robots), [TechInfoDepot: ath9k_htc](https://techinfodepot.shoutwiki.com/wiki/Ath9k_htc), [OpenBSD athn(4)](https://man.openbsd.org/athn).

## Driver y firmware

- [Kernel wiki: ath9k_htc (exportación en bruto de la wiki antigua)](https://wireless.kernel.org/_export/raw/en/users/drivers/ath9k_htc). Abierto.
- [Kernel wiki: ath9k_htc (versión actual)](https://wireless.docs.kernel.org/en/latest/en/users/drivers/ath9k_htc.html). **No se pudo abrir** (la herramienta pidió un permiso que no se concedió a tiempo).
- [Kernel wiki: dispositivos ath9k_htc](https://wireless.docs.kernel.org/en/latest/en/users/drivers/ath9k_htc/devices.html). Abierto.
- [open-ath9k-htc-firmware (repositorio)](https://github.com/qca/open-ath9k-htc-firmware/). Abierto. [Issues](https://github.com/qca/open-ath9k-htc-firmware/issues), [wiki](https://github.com/qca/open-ath9k-htc-firmware/wiki), [wiki: usb related issues](https://github.com/qca/open-ath9k-htc-firmware/wiki/usb-related-issues), [wiki: Troubleshooting and bug reporting](https://github.com/qca/open-ath9k-htc-firmware/wiki/Troubleshooting-and-bug-reporting). Abiertos.
- Issues del firmware: [#173](https://github.com/qca/open-ath9k-htc-firmware/issues/173) (bloqueo aleatorio, Alfa AWUS036NHA), [#174](https://github.com/qca/open-ath9k-htc-firmware/issues/174) (AR9485 PCIe, no es el mismo driver), [#184](https://github.com/qca/open-ath9k-htc-firmware/issues/184) (AR7010+AR9287, modo AP). Abiertos.
- [linux-firmware: carpeta ath9k_htc (réplica en kernel.org)](https://kernel.org/pub/scm/linux/kernel/git/maks/linux-firmware.git/tree/ath9k_htc?h=main). Abierto. Otras réplicas encontradas y no abiertas: [srini/linux-firmware](https://www.kernel.org/pub/scm/linux/kernel/git/srini/linux-firmware.git/tree/ath9k_htc), [historial de htc_9271.fw](https://www.kernel.org/pub/scm/linux/kernel/git/jkirsher/firmware.git/log/htc_9271.fw).
- [Debian: tracker de open-ath9k-htc-firmware](https://tracker.debian.org/open-ath9k-htc-firmware). Abierto.
- [Debian: tracker de firmware-nonfree](https://tracker.debian.org/pkg/firmware-nonfree). Abierto.
- [Debian AppStream: firmware-ath9k-htc (main)](https://appstream.debian.org/sid/main/metainfo/firmware-ath9k-htc.html). Abierto.
- [Debian AppStream: firmware-atheros (non-free-firmware), página de sid](https://appstream.debian.org/sid/non-free-firmware/metainfo/firmware-atheros.html) y [página de trixie](https://appstream.debian.org/trixie/non-free-firmware/issues/firmware-atheros.html). Abiertas.
- **No se pudieron abrir (bloqueo anti-robots de Debian):** [packages.debian.org/sid/firmware-ath9k-htc](https://packages.debian.org/sid/firmware-ath9k-htc), [packages.debian.org/sid/firmware-atheros](https://packages.debian.org/sid/firmware-atheros), [packages.debian.org/stable/firmware-atheros](https://packages.debian.org/stable/firmware-atheros), [wiki.debian.org/ath9k_htc](https://wiki.debian.org/ath9k_htc), [salsa: firmware-nonfree MR 54](https://salsa.debian.org/kernel-team/firmware-nonfree/-/merge_requests/54).
- [Proxmox: parche Conflicts/Replaces para firmware-ath9k-htc](https://lore.proxmox.com/all/1720011326.db8gb9ofrz.astroid@yuna.none/t/). Abierto.
- [Hilo de Trisquel: firmware-ath9k-htc](https://trisquel.info/es/forum/ar9271-firmware-ath9k-htc-getting-new-packages). Abierto. Otros hilos de Trisquel encontrados y no abiertos: [ath9k not free?](https://trisquel.info/en/forum/ath9k-not-free), [ath9k_htc WiFi Update](https://trisquel.info/de/forum/ath9khtc-wifi-update).

## Código fuente del kernel de Raspberry Pi (rama rpi-6.12.y; hif_usb.c comparado con rpi-6.18.y)

Todos abiertos (en bruto, en `raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/`):

- [drivers/net/wireless/ath/ath9k/hif_usb.c](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/hif_usb.c) y [hif_usb.h](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/hif_usb.h)
- [htc_drv_init.c](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/htc_drv_init.c), [htc_drv_main.c](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/htc_drv_main.c), [htc_hst.c](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/htc_hst.c)
- [ath9k/hw.c](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/hw.c), [ath9k/eeprom_4k.c](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/eeprom_4k.c), [ath9k/init.c](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/ath9k/init.c)
- [ath/regd.c](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ath/regd.c)
- [net/mac80211/cfg.c](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/net/mac80211/cfg.c)
- [Documentation/driver-api/usb/power-management.rst](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/Documentation/driver-api/usb/power-management.rst)
- [arch/arm64/configs/bcm2711_defconfig](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/arch/arm64/configs/bcm2711_defconfig), [arch/arm/configs/bcm2709_defconfig](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/arch/arm/configs/bcm2709_defconfig) (y las de rpi-6.18.y)
- [arch/arm/boot/dts/overlays/README](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/arch/arm/boot/dts/overlays/README) (`disable-wifi`)
- Árbol de dispositivos: [bcm2837-rpi-3-b-plus.dts](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/arch/arm/boot/dts/broadcom/bcm2837-rpi-3-b-plus.dts), [bcm283x-rpi-lan7515.dtsi](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/arch/arm/boot/dts/broadcom/bcm283x-rpi-lan7515.dtsi), [bcm283x-rpi-smsc9514.dtsi](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/arch/arm/boot/dts/broadcom/bcm283x-rpi-smsc9514.dtsi), [bcm2837-rpi-3-b.dts](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/arch/arm/boot/dts/broadcom/bcm2837-rpi-3-b.dts), [bcm283x-rpi-wifi-bt.dtsi](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/arch/arm/boot/dts/broadcom/bcm283x-rpi-wifi-bt.dtsi), [bcm270x.dtsi](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/arch/arm/boot/dts/broadcom/bcm270x.dtsi)
- Versiones de las ramas: [Makefile rpi-6.12.y](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/Makefile) (6.12.113 el 21-10-2026) y [Makefile rpi-6.18.y](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.18.y/Makefile) (6.18.57)
- Drivers alternativos: [rtl8xxxu/core.c](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/realtek/rtl8xxxu/core.c), [rtl8xxxu/Kconfig](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/realtek/rtl8xxxu/Kconfig), [mt7601u/Kconfig](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/mediatek/mt7601u/Kconfig), [mt7601u/usb.c](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/mediatek/mt7601u/usb.c), [mt7601u/usb.h](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/mediatek/mt7601u/usb.h), [rt2800usb.c](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ralink/rt2x00/rt2800usb.c), [rt2800usb.h](https://raw.githubusercontent.com/raspberrypi/linux/rpi-6.12.y/drivers/net/wireless/ralink/rt2x00/rt2800usb.h)
- [raspberrypi/linux: issues](https://github.com/raspberrypi/linux/issues?q=is%3Aissue+ath9k_htc). Abierto (primera página, sin resultados sobre ath9k_htc; sale el #7568, del Wi-Fi interno).

## Raspberry Pi: documentación e imagen

- [Documentación oficial, página de la Pi](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html). Abierta, pero el texto llegó **truncado** y no incluía la sección de alimentación. Usé su fuente AsciiDoc: [power-supplies.adoc](https://raw.githubusercontent.com/raspberrypi/documentation/master/documentation/asciidoc/computers/raspberry-pi/power-supplies.adoc) (abierto).
- [Product brief de la Pi 3B+ (RP-008338-DS-2, PDF)](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf). Leído en local (carpeta `raspberry-pi-3b-plus/datasheets/`).
- [Declaración UE de conformidad de la Pi 3B+ (RP-001265-CF-3, PDF)](https://pip-assets.raspberrypi.com/categories/534-approvals/documents/RP-001265-CF-3-rpi-3bplus%20EU%20Declaration%20of%20Conformity%20(DoC).pdf). Leída en local.
- [Esquema reducido de la Pi 3B+ (RP-008339-DS-1, PDF)](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf). Leído en local; casi todo son imágenes.
- [pi-gen (receta de la imagen oficial)](https://github.com/RPi-Distro/pi-gen): [build.sh](https://raw.githubusercontent.com/RPi-Distro/pi-gen/master/build.sh), [stage2/02-net-tweaks/00-packages](https://raw.githubusercontent.com/RPi-Distro/pi-gen/master/stage2/02-net-tweaks/00-packages), [stage2/01-sys-tweaks/00-packages](https://raw.githubusercontent.com/RPi-Distro/pi-gen/master/stage2/01-sys-tweaks/00-packages). Abiertos.
- [Lista de paquetes de la imagen Lite arm64 Bookworm 2025-04-08](https://mirrors.cqupt.edu.cn/raspberry-pi-os-images/beta/raspios_lite_arm64/2025-04-08-raspios-bookworm-arm64-lite.info). Abierta. No pude localizar la de Trixie.

## Fallos, foros y listas de correo

- [Foro de Purism: TL-WN722N sin firmware 1.4.0 (2017)](https://forums.puri.sm/t/tp-link-wn722n-ar9002u-ar9271l-not-working/1586). Abierto.
- [Foro de Arch: dos ficheros htc_9271 (2016)](https://bbs.archlinux.org/viewtopic.php?id=214312). Abierto.
- [openwrt-devel: "Target is unresponsive" (2015)](https://lists.infradead.org/pipermail/openwrt-devel/2015-May/007216.html). Abierto.
- [Wiki de Ubuntu: tarjetas TP-Link](https://help.ubuntu.com/community/HardwareSupportComponentsWirelessNetworkCardsTP-Link). Abierta.
- [CVE-2026-68363 en OpenCVE](https://app.opencve.io/cve/CVE-2026-68363). Abierto (agregador, no el CNA).
- [Historial de hif_usb.c (git.zx2c4.com)](https://git.zx2c4.com/linux-dev/log/drivers/net/wireless/ath/ath9k/hif_usb.c). Abierto; termina en 2022.
- LKML: [revert del "general protection fault" (2020)](https://lkml.iu.edu/hypermail/linux/kernel/2007.1/08041.html), [revert de la carrera usb_get_urb (2020)](https://lkml.iu.edu/hypermail/linux/kernel/2010.1/04646.html). Solo vi los títulos en la búsqueda; no los abrí.
- Encontrados y no abiertos: [hilo de hostap 2013](https://lists.infradead.org/pipermail/hostap/2013-June/028105.html), [lista de dispositivos con drivers libres (Tux Digital)](https://forum.tuxdigital.com/t/community-list-of-wireless-devices-with-foss-drivers/3704), [log de hif_usb.c en evilpiepirate](https://www.evilpiepirate.org/cgit/linux-bcache.git/log/drivers/net/wireless/ath/ath9k/hif_usb.c?showmsg=1).

## TL-WN722N v1/v2/v3 y alternativas con driver en el kernel

- [LKML: Greg KH borra r8188eu de staging porque rtl8xxxu cubre el mismo hardware (marzo 2023)](https://lkml.iu.edu/hypermail/linux/kernel/2303.1/01128.html). Abierto.
- [Commit que elimina el driver rtl8188eu antiguo (2021)](https://android-kvm.googlesource.com/linux/+/55dfa29b43d23bab37d98f087615ff46d38241df). Abierto.
- [Foro de OpenWrt: TL-WN722N v3](https://forum.openwrt.org/t/tp-link-wn722n-v3/30671). Abierto; no confirma chips (solo un comentario de 2023 que dice que la v1 funciona y la v2/v3 no).
- [dev.to: arreglar el TL-WN722N en Linux](https://dev.to/rizkyzhang/fix-tp-link-tl-wn722n-not-working-on-linux-4fl1) (cita la guía §2.9). **No se pudo abrir.**
- [Parabola: dispositivos Wi-Fi con drivers libres](https://wiki.parabola.nu/WiFi_devices_known_to_work_with_Parabola_GNU/Linux-libre). Abierta.
- [Gough Lui: desmontaje del element14 Wi-Pi (RT5370N), con una medida de consumo](https://goughlui.com/?p=14057). Abierto. Su tercer enlace [teardown](https://goughlui.com/2015/07/19/teardown-element14-wi-pi-usb-wireless-802-11n-150mbits-2-4ghz-dongle/) no se abrió.
- Encontrados y no abiertos: [Ask Wireshark: TL-WN722N v2](https://ask.wireshark.org/question/6244/segfault-when-enabling-monitor-mode-with-tl-wn722n-v2/), [OpenWrt: añadir TL-WN722N](https://forum.openwrt.org/t/add-tp-link-wn722n-wifi-usb-adaptor/24253?page=2), [TP-Link: descargas del TL-WN722N v2](https://www.tp-link.com/sg/support/download/tl-wn722n/v2/).

## Normativa de radio

- [Real Decreto 188/2016, BOE núm. 113, 10-05-2016](https://www.boe.es/eli/es/rd/2016/05/06/188). Abierto (el texto entregado se corta tras el artículo 36; no incluye los anexos).
- [Directiva 2014/53/UE en EUR-Lex](https://eur-lex.europa.eu/eli/dir/2014/53/oj/eng). Abierta; solo metadatos (fechas de adopción, publicación y entrada en vigor), sin el articulado. La [versión en español](https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32014L0053) dio lo mismo.
- [ETSI EN 300 328 V2.2.2 (2019-07), PDF](https://www.etsi.org/deliver/etsi_en/300300_300399/300328/02.02.02_60/en_300328v020202p.pdf) ([copia local](datasheets/en_300328v020202p.pdf)). Abierto, con partes truncadas.
- [Comisión Europea: página de la Directiva de equipos radioeléctricos](https://single-market-economy.ec.europa.eu/sectors/electrical-and-electronic-engineering-industries-eei/radio-equipment-directive-red_en) (enlazada en la guía). **No se pudo abrir.**
- No consultados: Reglamento Delegado (UE) 2022/30 (ciberseguridad), `wireless-regdb` (entrada de España), reglamento europeo de dispositivos de corto alcance.

## Antena, conectores y plano de masa

- [Wikipedia: conector SMA (incluye RP-SMA)](https://en.wikipedia.org/wiki/SMA_connector). Abierta.
- [Wikipedia: antena "rubber ducky"](https://en.wikipedia.org/wiki/Rubber_ducky_antenna). Abierta.
- [Wikipedia: plano de masa](https://en.wikipedia.org/wiki/Ground_plane). Abierta.
- [Wikipedia: antena monopolo](https://en.wikipedia.org/wiki/Monopole_antenna). Abierta.
- La ficha del [alargo de antena (#13)](../alargo-antena-rp-sma-30cm/README.md) tiene las fuentes de conectores y pérdidas del cable.

## Amazon

- [Anuncio B0CBW6THN1](https://www.amazon.es/dp/B0CBW6THN1). **Bloqueado** (`ROBOTS_DISALLOWED`). El precio y la referencia son los de la hoja.

## Copias locales de los documentos

Documentos descargados el 21-10-2026 y guardados en el repositorio. Si un documento tiene enlace original en esta ficha, aparece junto a él como "copia local".

**En esta carpeta (`datasheets/`):**

- [AR9271.pdf](datasheets/AR9271.pdf): Qualcomm Atheros AR9271: hoja de datos rev. 2.0 (11-2011)
- [TPE-N150USB-spec-sheet.pdf](datasheets/TPE-N150USB-spec-sheet.pdf): TPE-N150USB Speciﬁca�on / 802.11n b/g wiﬁ USB adapter (1T1R), UB93/AR9271 (hoja del TPE-N150USB)
- [datasheet_tl-wn722n.pdf](datasheets/datasheet_tl-wn722n.pdf): TP-Link TL-WN722N adaptador y tarjeta de red WLAN 150 Mbit/s / Marca : TP-Link (hoja del TL-WN722N)
- [en_300328v020202p.pdf](datasheets/en_300328v020202p.pdf): ETSI EN 300 328 V2.2.2, 4.3.2.2.3
