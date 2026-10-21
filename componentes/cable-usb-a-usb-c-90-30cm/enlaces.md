# Enlaces guardados: cable USB-A a USB-C acodado 90°, 30 cm

Todas las páginas consultadas para la [ficha](README.md), reunidas el 21-10-2026.

## Anuncio y proyecto

- Amazon.es, ASIN B0C8FS5FV2 (`https://www.amazon.es/dp/B0C8FS5FV2`): **no abierto** (Amazon bloquea el acceso). Una búsqueda del ASIN en la web no devolvió ningún resultado útil.
- [camelcamelcamel.es, ASIN B0C8FS5FV2](https://es.camelcamelcamel.com/product/B0C8FS5FV2): intento de abrirlo para ver el título del anuncio; **error de la herramienta, no se abrió**.
- Guía de montaje eléctrico del proyecto (v2, 20-10-2026), `claude/guia-montaje-electrico.md` del proyecto del usuario: §1 filas 10 y 18, §2.5, §3, §5.2. Leída en una copia local; no tiene URL.

## Normas y documentos de USB-IF (para descargar)

- [Document Library de USB-IF](https://usb.org/documents)
- [USB Type-C Cable and Connector Specification, Release 2.5 (página)](https://usb.org/document-library/usb-type-cr-cable-and-connector-specification-release-25) · [ZIP, 28,38 MB](https://www.usb.org/sites/default/files/USB%20Type-C%202.5%20Release%20202603.zip) ([copia local](../documentos-compartidos/usb/USB_Type-C_2.5_Release_202603.zip)). El ZIP **no se pudo abrir**.
- [USB 2.0 Specification (página)](https://usb.org/document-library/usb-20-specification) · [ZIP, 13,82 MB](https://usb.org/sites/default/files/usb_20_20250603.zip) ([copia local](../documentos-compartidos/usb/usb_20_20250603.zip)). **No se pudo abrir.**
- [Battery Charging v1.2 Spec and Adopters Agreement (página)](https://usb.org/document-library/battery-charging-v12-spec-and-adopters-agreement) · [ZIP](https://usb.org/sites/default/files/BCv1.2_070312_0.zip) ([copia local](../documentos-compartidos/usb/BCv1.2_070312_0.zip)). **No se pudo abrir.**
- [Programa de cumplimiento de USB-IF](https://usb.org/node/579) (remite a `cms.usb.org/integrators-list`) · [cms.usb.org](https://cms.usb.org/) (no abierto)
- [audioXpress: nuevo programa Certified USB Logo (1-10-2021)](https://audioxpress.com/news/new-certified-usb-logo-program-for-usb4-usb-type-c-and-usb-power-delivery-specifications)

## Copias no oficiales de documentos USB (solo para consulta)

- [ECN "Legacy Cable Rp Tolerance" (Type-C Release 1.0, 11-8-2014)](https://docs.ampnuts.ru/eevblog.docs/Standards/USB%203.1/usb_31_030215/USB%20Type-C/USB%20Type-C%20ECNs/USB%20Type-C%20ECN%20Legacy%20Cable%20Rp%20Tolerance%20v4.pdf). Leído. Copia en una web de terceros, no en usb.org.
- [Carpeta de la especificación USB 2.0 (2011) en git.nefarius.at](https://git.nefarius.at/nefarius/USB-Bluetooth-Specs/src/branch/master/usb_20_0702115) · [usb_20.pdf](https://git.nefarius.at/nefarius/USB-Bluetooth-Specs/media/branch/master/usb_20_0702115/usb_20.pdf). Solo se extrajo el índice y la lista de tablas (Table 6-2, Table 6-6, sección 7.2.2); **el cuerpo no se pudo leer**.

## Resumen de la especificación USB Type-C (Rp, cables A-C, BC 1.2)

- [Google, Chromium OS: Cable and adapter tips and tricks](https://chromium.org/chromium-os/developer-library/reference/hardware/cable-and-adapter-tips-and-tricks) (la guía enlaza la misma página con `www.` y barra final). Cita las secciones 3.5.1, 3.5.2 y 3.6.1.
- [Zebra: USB cable (ZQ220 Plus / ZQ120 Plus)](https://docs.zebra.com/content/tcm/us/en/printers/mobile/zq220plus-zq120plus-ug/miscellaneous/usb-cable.html): cableado de un cable USB-C a USB-A con Rp de 56 kΩ ±5 %.
- [Infineon: resistencias de terminación USB Type-C](https://community.infineon.com/t5/Knowledge-Base-Articles/Termination-Resistors-Required-for-the-USB-Type-C-Connector/ta-p/253544)
- [Microchip: señales CC y VCONN de USB Type-C](https://developerhelp.microchip.com/xwiki/bin/view/applications/usb/typec-features/cc-vconn-signals/)
- [Microchip: carga por USB (BC 1.2, DCP, D+/D−)](https://developerhelp.microchip.com/xwiki/bin/view/applications/usb/power-delivery/battery-charging/)
- [Espressif: guía de hardware USB Type-C](https://docs.espressif.com/projects/esp-iot-solution/en/latest/usb/usb_overview/usb_typec_hardware_guide.html)
- [Total Phase: medir cables PD y Type-C](https://www.totalphase.com/blog/2018/08/power-delivery-type-c-cables-work-together-measure-evaluate/): consultado, no da valores de Rp ni de resistencia.

## Calibre, resistencia de hilos y contactos

- [Wikipedia: American wire gauge](https://en.wikipedia.org/wiki/American_wire_gauge): resistencias del cobre macizo a 20 °C.
- [geekchamp: qué significa 28AWG/1P + 24AWG/2C](https://geekchamp.com/what-does-28awg-1p24awg-2c-mean-on-a-usb-cable/): cita las resistencias máximas de las tablas de USB 2.0. Fuente secundaria.
- [Monoprice: cableado de cables USB](https://www.monoprice.com/p/resources/usb-cable-wiring-what-every-user-should-know)
- [Farnell: hoja de un cable USB 2.0 con 28 AWG y 20 AWG](https://www.farnell.com/cad/1564253.pdf): 237 Ω/km máximos para el 28 AWG trenzado estañado. No pude identificar el fabricante.
- [absurdlyoptimized: USB cables](https://absurdlyoptimized.com/tech/usb-cables/) y [su portada](https://www.absurdlyoptimized.com/articles/usb-cables): consultados y **descartados** (el artículo es incoherente consigo mismo y no probó cables).
- Hilo de foro con la misma tabla de calibres en el que no hay cita de la norma: [Steinberg](https://forums.steinberg.net/t/ur22-cuts-out-intermittently/646259/307) · [electronicwerkstatt](https://forum.electronicwerkstatt.de/phpBB/Grundlagen/usb_verlaengerungskabel_fuer_1a-t154605f26_bs0.html). No aportan datos citables.
- Fichas de conectores (ejemplos, no del cable concreto):
  - [Molex, plug USB Type-C (PS-10544-001)](https://static.chipdip.ru/lib/641/DOC034641065.pdf)
  - [GCT, receptáculo USB Type-C USB4515](https://www.farnell.com/datasheets/3565766.pdf)
  - [Lumberg, USB-A macho acodado 2410 08](https://www.lumberg.com/en/products/product/2410+08)
  - [Kyoritsu, conector USB A/B](https://www.kyohritsu.com/eclib/OTHER/FIG/CONNECTOR/3505.pdf)
- [EPEC: causas de fallo en cables y cómo evitarlas](https://www.epectec.com/articles/what-causes-cable-assemblies-to-fail-and-how-to-avoid-them.html)

## Cables mal hechos: Benson Leung y otros casos

- [TechSpot: cable USB-C que estropea el Chromebook de un ingeniero](https://www.techspot.com/news/63707-terrible-usb-type-c-cable-fries-engineer-chromebook.html)
- [HotHardware: Amazon prohíbe cables USB-C deficientes (30-3-2016)](https://hothardware.com/news/amazon-bans-shoddy-usb-c-cables)
- [PhoneArena: OnePlus confirma que sus cables y adaptadores USB-C pueden dañar fuentes externas](https://www.phonearena.com/news/OnePlus-confirms-that-its-USB-Type-C-cables-and-adapters-can-damage-external-power-sources_id76145)
- [PCWorld: cables USB-C malos, aviso del ingeniero de Google (5-11-2015)](https://www.pcworld.com/article/424287/beware-bad-usb-c-cables-google-engineer-warnswhile-naming-names.html)
- [Engadget (4-11-2015)](https://www.engadget.com/2015-11-04-google-pixel-engineer-vs-shoddy-usb-type-c-cables.html)
- [Slashdot (5-11-2015)](https://hardware.slashdot.org/story/15/11/05/1959216/google-engineer-warns-against-perils-of-buying-cheap-third-party-usb-c-cables)
- [Android Authority (5-11-2015)](https://www.androidauthority.com/beware-of-cheap-usb-type-c-cables-653827): resumen que mezcla adaptadores micro-B y cables A-C; usado solo como contexto.
- [Ars Technica (febrero de 2016)](https://arstechnica.com/gadgets/2016/02/google-engineer-finds-usb-type-c-cable-thats-so-bad-it-fried-his-chromebook-pixel/): **bloqueado para mi herramienta, no abierto.**
- [Reseña original de Benson Leung en Amazon.com](https://www.amazon.com/review/R2XDBFUD9CTN2R/): **no abierta** (Amazon bloquea el acceso). El enlace sale de TechSpot.
- Otros resultados de la búsqueda que **no abrí**: [Lowyat](https://lowyat.net/2016/94419/usb-type-c-reviewer-loses-his-chromebook-pixel-2-to-bad-cable), [Digital Trends](https://www.digitaltrends.com/computing/google-engineer-calls-out-oneplus-for-selling-unsafe-usb-type-c-cables-and-adapters/), [PCWorld sobre OnePlus](https://www.pcworld.com/article/424425/google-engineer-calls-out-oneplus-usb-c-cable-and-adapter-for-damage-risk.html), [The Register](https://www.theregister.com/2015/11/05/google_engineer_ids_dodgy_usbs/), [Lester Chan](https://lesterchan.net/blog/2015/11/05/getting-usb-type-c-cable-from-amazon-read-this-guy-review-first/).

## SumUp Solo (consumidor del cable)

- [Manual del Solo en manuals.plus](https://manuals.plus/sumup/solo-card-reader-manual): copia de terceros, leída (cargar solo con cable y adaptador autorizados, 12 h, batería de 6,16 Wh). Un primer intento con la variante `/trackback` falló.
- [Ficha técnica del Solo (Currys, PDF BRI42258_TECH)](https://ik.imagekit.io/pimberly/595e406f0f15f30010780448/cd32c72b/62ea63129b3cd64ff4000200/BRI42258_TECH.pdf) ([copia local](../sumup-solo/datasheets/BRI42258_TECH.pdf))
- [SumUp: presentación del Solo (carga con base o por USB-C)](https://www.sumup.com/en-gb/card-reader-solo-learn-more/)
- Páginas de ayuda de SumUp: [visión general del Solo](https://help.sumup.com/en-US/articles/7m7xB884fHboMUpBrtOtdL-sumup-solo-overview) y [carga y batería (título "Get the most out of your card reader")](https://help.sumup.com/en-IE/articles/5O4zuxJ7i8LBXcGMFXj11G). Las abrí y **no cargaron contenido del artículo**.
- Tiendas, sin datos de carga útiles: [Galaxus](https://www.galaxus.de/en/s12/product/sumup-solo-pos-system-17546314), [AgozTech](https://agoztech.com/en-se/products/usb-c-cable-fast-charger-for-sumup-solo). Sin abrir: [if Design Award de la base de carga](https://ifdesign.com/de/winner-ranking/project/sumup-solo-charging-station-cradle/297222) (error de la herramienta).

## Alternativas

- StarTech R2ACR-30C-USB-CABLE: [CDW](https://www.cdw.com/product/startech-1ft-30cm-usb-a-to-usb-c-fast-charging-cable-rugged-right-angle/7155188) · [LDLC](https://www.ldlc.com/en/product/PB00666530.html) · [Yeppon (no disponible)](https://www.yeppon.it/products/startech-com-cavo-usb-1154053). No abrí la página oficial de StarTech.

## Otras fichas del repositorio

- [Raspberry Pi 3B+](../raspberry-pi-3b-plus/README.md): el umbral de subtensión de 4,63 V es de la Pi y no del Solo.

## Copias locales de los documentos

Documentos descargados el 21-10-2026 y guardados en el repositorio. Si un documento tiene enlace original en esta ficha, aparece junto a él como "copia local".

**Citados en esta ficha y guardados en otra carpeta:**

- [BCv1.2_070312_0.zip](../documentos-compartidos/usb/BCv1.2_070312_0.zip): USB-IF, Battery Charging Specification Rev. 1.2 (ZIP)
- [BRI42258_TECH.pdf](../sumup-solo/datasheets/BRI42258_TECH.pdf): SumUp Solo: ficha técnica del lector (BRI42258)
- [USB_Type-C_2.5_Release_202603.zip](../documentos-compartidos/usb/USB_Type-C_2.5_Release_202603.zip): USB-IF, USB Type-C Specification Release 2.5 (ZIP, 03-2026)
- [usb_20_20250603.zip](../documentos-compartidos/usb/usb_20_20250603.zip): USB-IF, USB 2.0 Specification (ZIP, 06-2025)
