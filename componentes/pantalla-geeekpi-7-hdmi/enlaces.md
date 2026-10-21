# Enlaces guardados: GeeekPi pantalla IPS de 7", 1024×600, HDMI

Todas las páginas consultadas para la [ficha](README.md), reunidas el 21-10-2026. Las marcadas "no abierto" o "error" no se pudieron leer.

## Fabricante: 52Pi (referencia EP-0170) y distribuidores

- [Wiki técnica de 52Pi, EP-0170 (rev. 13820, 9-11-2023)](https://wiki.52pi.com/index.php/EP-0170)
- [Misma wiki en Markdown (espejo)](https://wiki-md.52pi.com/docs/EP-0170)
- [Tienda de 52Pi: página del producto (SKU EP-0170)](https://52pi.com/products/7-inch-800-480-capacitive-touch-display-screen-monitor-for-raspberry-pi)
- [Tienda de 52Pi: datos JSON del producto (variantes, SKU, texto)](https://52pi.com/products/7-inch-800-480-capacitive-touch-display-screen-monitor-for-raspberry-pi.json)
- [Core Electronics: 52Pi 7 Inch HDMI IPS Display, SKU CE10331](https://core-electronics.com.au/52pi-7-inch-display-hdmi-for-pi-and-windows.html.plain.md)
- [Oz Robotics: 7 inch Portable Screen, No Touch (confirma SKU EP-0170)](https://ozrobotics.com/shop/7-inch-portable-screen-for-raspberry-pi-windows-pc-no-touch/)
- [DeskPi 3D: 7-inch Portable Display with Raspberry Pi 5 3D-Print Case](https://print.deskpi.com/models/16) (solo se pudo leer el título)
- [DeskPi 3D: Raspberry Pi 5 + 7-inch Portable Screen Enclosure](https://print.deskpi.com/models/17) (solo se pudo leer el título)
- [Wiki de 52Pi, EP-0177 (versión táctil con altavoces; para comparar)](https://wiki-md.52pi.com/docs/EP-0177)
- [Wiki de 52Pi, Z-0051 (otro módulo de 7" con placa de control; no es este modelo: 220 cd/m², 6–7 W, 1–2 A a 5 V)](https://wiki.52pi.com/index.php/Z-0051)
- [Tienda de 52Pi: versión táctil EP-0194-US (300 cd/m², 0,9 kg; para comparar)](https://52pi.com/products/52pi-7-inch-capacitive-ips-screen-1024-600-60hz-touchscreen-display-with-speakers-for-raspberry-pi-5-4b-3b-3b-b)

## Anuncio de Amazon e identificación del modelo

- [Amazon.es, ASIN B0CHMBCCJB](https://www.amazon.es/dp/B0CHMBCCJB) (**no abierto**: Amazon bloquea el acceso de robots)
- [Amazon.nl, ASIN B0CHMBCCJB](https://www.amazon.nl/-/en/GeeekPi-Raspberry-1024x600-Portable-Monitor/dp/B0CHMBCCJB) (solo el título que mostró el buscador; no abierto)
- [Amazon.fr, ASIN B0CHMBCCJB](https://www.amazon.fr/GeeekPi-Raspberry-1024x600-Display-Portable/dp/B0CHMBCCJB) (solo el título que mostró el buscador; no abierto)
- [Amazon.com, ASIN B0CJWXWJ6K (versión táctil con altavoces)](https://www.amazon.com/GeeekPi-Capacitive-Touchscreen-Dual-Speaker-Free-Driver/dp/B0CJWXWJ6K) (solo el título del buscador; no abierto)
- [Amazon.com.au, ASIN B0CJWXWJ6K](https://www.amazon.com.au/GeeekPi-Screen-Raspberry-1024x600-Touch/dp/B0CJWXWJ6K) (solo el título del buscador; no abierto)
- [Amazon.com, tienda de GeeekPi (7 Inch Screen)](https://www.amazon.com/stores/GeeekPi/page/5F3CAD60-D805-4B37-BBB6-8704747C758F) (**no abierto**: bloqueado)
- [Ubuy: resumen de la marca GeeekPi](https://www.ubuy.hk/en/brand/geeekpi) (no nombra a 52Pi)
- [BerryBase: marca 52Pi](https://www.berrybase.at/en/52pi/) (no nombra a GeeekPi ni muestra pantallas de 7")
- [NeweggBusiness, GeeekPi 7 Inch LCD Screen](https://www.neweggbusiness.com/product/product.aspx?item=9b-3c6-02te-000j7) (**error**: contenido ilegible)
- [Newegg.ca, 3C6-05PA-005A3](https://www.newegg.ca/p/3C6-05PA-005A3) (**error**)
- [Newegg, 1EF-023W-01020](https://www.newegg.com/p/1EF-023W-01020) y [NeweggBusiness 9B-1EF-023W-01020](https://www.neweggbusiness.com/p/9B-1EF-023W-01020) (**error**)
- [camelcamelcamel.es, B0CHMBCCJB](https://es.camelcamelcamel.com/product/B0CHMBCCJB) (**error**)

## Documentación de Raspberry Pi: configuración de pantalla (KMS)

- [Resolución de problemas de salida HDMI con KMS, RP-004341-WP-2 (PDF)](https://pip-assets.raspberrypi.com/categories/1259-audio-camera-and-display/documents/RP-004341-WP-2-Troubleshooting%20KMS%20HDMI%20output.pdf) ([copia local](datasheets/RP-004341-WP-2-Troubleshooting_KMS_HDMI_output.pdf))
- [Documentación de configuración (pantalla, `video=`, apagado de pantalla)](https://www.raspberrypi.com/documentation/computers/configuration.html)
- [Opciones antiguas de `config.txt` (no funcionan en Bookworm y posteriores)](https://www.raspberrypi.com/documentation/computers/legacy_config_txt.html)
- [Referencia de `config.txt`](https://www.raspberrypi.com/documentation/computers/config_txt.html) (la página renderizada se cortaba antes de la sección de vídeo; leí el texto fuente en el repositorio)
- Texto fuente de la documentación (repositorio `raspberrypi/documentation`, rama principal, leído en un clon local el 21-10-2026, commit del 13-10-2026):
  - [config_txt/video.adoc](https://github.com/raspberrypi/documentation/blob/master/documentation/asciidoc/computers/config_txt/video.adoc): tubería HDMI de la serie 4 (tiempos horizontales pares), `disable_fw_kms_setup`
  - [configuration/audio-display.adoc](https://github.com/raspberrypi/documentation/blob/master/documentation/asciidoc/computers/configuration/audio-display.adoc): sintaxis de `video=`, rotación, `consoleblank`, `vc4.force_hotplug=1`
  - [legacy_config_txt/legacy.adoc](https://github.com/raspberrypi/documentation/blob/master/documentation/asciidoc/computers/legacy_config_txt/legacy.adoc) y [legacy_config_txt/video.adoc](https://github.com/raspberrypi/documentation/blob/master/documentation/asciidoc/computers/legacy_config_txt/video.adoc): `hdmi_group`, `hdmi_mode`, `hdmi_cvt`, `hdmi_force_hotplug`, `overscan_*`, `config_hdmi_boost`
- [Parámetros de `video=` del kernel (modedb): M, R, D, márgenes, rotación](https://docs.kernel.org/fb/modedb.html)
- [Ficha de la Raspberry Pi 3B+ del proyecto](../raspberry-pi-3b-plus/README.md) (subtensión de 4,63 V)

## Problemas y foros

- [raspberrypi/linux#4719: 7" de 1024×600 no funciona con KMS en Pi 4B](https://github.com/raspberrypi/linux/issues/4719)
- [moOde: pantalla de 7" sin marca se pone azul con "no signal"](https://moodeaudio.org/forum/showthread.php?tid=5300)
- [OctoDash#1877: borde negro en pantalla de 1024×600 (soluciones heredadas)](https://github.com/UnchartedBull/OctoDash/issues/1877)
- [Foro de RetroPie, post 138050](https://retropie.org.uk/forum/post/138050) (**error**: página de verificación del navegador, sin contenido)
- [Foro de balena: White Stripe on 7in Screen Raspberry Pi 3](https://forums.balena.io/t/white-stripe-on-7in-screen-raspberry-pi-3/869) (encontrado, no abierto)
- [Foro de element14: RPi official 7 inch touchscreen not working](https://community.element14.com/products/raspberry-pi/f/forum/32597/rpi-official-7-inch-touchscreen-not-working) (encontrado, no abierto)

## Otras pantallas de 7" usadas como referencia (no son este modelo)

- [Waveshare 7inch HDMI LCD (C): wiki](https://waveshare.com/wiki/7inch_HDMI_LCD_(C)) y [plantilla de especificaciones](https://www.waveshare.com/wiki/Template:7inch_HDMI_LCD_C_Spec) (300 cd/m², 2,5 W, 490 mA, 4,75–5,25 V, 0–60 °C, 154,21 × 85,92 mm)
- [Elecrow 7" IPS HD Touch Screen-D (DLH05170B): wiki](https://elecrow.com/wiki/7inch_IPS_HD_Touch_Screen-D.html) (320 cd/m², 2,55 W)
- [Displaytech DT070BTFT-HB: datasheet del panel (PDF)](https://www.mouser.com/datasheet/2/1015/DT070BTFT-HB-Displaytech-Spec-1649616.pdf) ([copia local](datasheets/DT070BTFT-HB-Displaytech-Spec-1649616.pdf)) (7" IPS, 500 cd/m², 25.000 h, −20 a 70 °C, 164,9 × 100,0 mm)
- [LCDwiki: 7inch HDMI Display (H)](https://lcdwiki.com/7inch_HDMI_Display_(H)) (táctil, sin brillo ni temperatura publicados)
- [Adafruit: 1024×600 non-touch display #2299](https://learn.adafruit.com/hdmi-uberguide/2299-display-no-touchscreen-1024x600-hdmi-slash-vga-slash-ntsc-slash-pal) (página de 2014, configuración heredada)
- [RobotShop: guía de ajustes de una 7" de 1024×600 (PDF)](https://cdn.robotshop.com/media/s/suf/rb-suf-110/pdf/raspberry_pi_7__hd_1024_600_tft_lcd_screen_display_settings_-_wiki.pdf) (otro modelo)

## Alternativas

- [Raspberry Pi Touch Display 2: página del producto](https://www.raspberrypi.com/products/touch-display-2/)
- [Touch Display 2, 7 pulgadas: product brief RP-010429-MM-3 (PDF)](https://pip-assets.raspberrypi.com/categories/1083-raspberry-pi-touch-display-2/documents/RP-010429-MM-3-touch-display-2-7-inch-product-brief.pdf) ([copia local](datasheets/RP-010429-MM-3-touch-display-2-7-inch-product-brief.pdf))
- [Touch Display 2, 7 pulgadas: modelo STEP RP-009154-DD-3 (ZIP)](https://pip-assets.raspberrypi.com/categories/1083-raspberry-pi-touch-display-2/documents/RP-009154-DD-3-raspberry-pi-touch-display-2-step-7inch.zip)
- [Touch Display 2: product brief genérico RP-009106-MM-8 (PDF)](https://pip-assets.raspberrypi.com/categories/1083-raspberry-pi-touch-display-2/documents/RP-009106-MM-8-touch-display-2-product-brief.pdf) (no abierto)
- [Catálogo de documentos de Touch Display 2](https://pip.raspberrypi.com/categories/1083-raspberry-pi-touch-display-2)
- [Documentación de Touch Display 2 (texto fuente: compatibilidad, dimensiones, rotación)](https://github.com/raspberrypi/documentation/blob/master/documentation/asciidoc/accessories/touch-display-2/about.adoc)

## Retención de imagen, vida, brillo y legibilidad

- [Focus LCDs: Ghosting & Burn-in on IPS TFT Panels](https://focuslcds.com/journals/ghosting-burn-in-on-ips-tft-panels/)
- [Elo: métodos para evitar la retención de imagen en LCD](https://elosupport.elotouch.com/hc/en-us/articles/31652979962775-What-are-the-Best-Methods-to-Prevent-LCD-Image-Retention)
- [Alibaba (blog de vendedores): brillo de monitores industriales, 500 vs 1000 nits](https://seller.alibaba.com/blogs/2026/southeast-asia/industrial-equipment/monitor-brightness-500-1000nit-guide-alibaba-b2b) (fuente comercial)
- [lights.co.uk: iluminación de restaurantes y bares](https://lights.co.uk/restaurant-lighting) (fuente comercial)
- [AVIXA: cómo elegir el brillo de pantallas comerciales](https://xchange.avixa.org/posts/how-to-choose-the-right-brightness-for-indoor-and-outdoor-commercial-displays) (**error**: redirige a la portada de la comunidad)
- [Baunetzwissen: iluminancias recomendadas](https://www.baunetzwissen.de/drucken/beleuchtungsstaerken-empfehlungen-fuer-raeume-167320) (abierto; no da valores para bares ni restaurantes)

## Alimentación y brillo por software

- [Wikipedia: USB hardware (tensión de VBUS)](https://en.wikipedia.org/wiki/USB_hardware)
- [ddcutil: página de manual (brillo = VCP 10)](https://www.mankier.com/1/ddcutil)
- [Microchip: características eléctricas USB](https://onlinedocs.microchip.com/oxy/GUID-FAA05C30-286C-48ED-929F-AF87B46D8887-en-US-1/GUID-E7FF3F95-993A-40AE-BAFC-38CA521C035C.html) (abierto; no concluyente)
- [Especificación USB 2.0, ECN "VBUS Max Limit"](https://git.nefarius.at/nefarius/USB-Bluetooth-Specs/raw/branch/master/usb_20_0702115/USB%202.0%20ECN%20VBUS%20Max%20Limit.pdf) (**error**: el servidor devolvió un puntero Git LFS, no el PDF)
- [Texas Instruments SLVUCP4A](https://www.ti.com/document-viewer/lit/html/SLVUCP4A/GUID-29CA5AE5-0E8F-49D2-9DBF-326133474D6B) (abierto; no da el rango de vSafe5V)

## No pude hacer

- Más búsquedas web: se agotó el presupuesto de búsquedas de la sesión antes de poder buscar reseñas, foros y problemas de GeeekPi/52Pi y de pantallas baratas de 7" con caída de tensión. No usé otros medios para saltarme el límite.

## Copias locales de los documentos

Documentos descargados el 21-10-2026 y guardados en el repositorio. Si un documento tiene enlace original en esta ficha, aparece junto a él como "copia local".

**En esta carpeta (`datasheets/`):**

- [DT070BTFT-HB-Displaytech-Spec-1649616.pdf](datasheets/DT070BTFT-HB-Displaytech-Spec-1649616.pdf): TFT LCD Module / Product Specification / DT070BTFT-HB
- [RP-004341-WP-2-Troubleshooting_KMS_HDMI_output.pdf](datasheets/RP-004341-WP-2-Troubleshooting_KMS_HDMI_output.pdf): Troubleshooting KMS HDMI output / Raspberry Pi Ltd / 2023-11-13: githash: 5385809-clean (white paper de KMS) (archivo original: `RP-004341-WP-2-Troubleshooting KMS HDMI output.pdf`)
- [RP-010429-MM-3-touch-display-2-7-inch-product-brief.pdf](datasheets/RP-010429-MM-3-touch-display-2-7-inch-product-brief.pdf): Raspberry Pi | Raspberry Pi Touch Display 2 – 7″ Portrait / Raspberry Pi Touch Display 2 –
