# GeeekPi pantalla IPS de 7", 1024×600, HDMI, sin táctil

Pantalla del usuario: instrucciones, cuenta atrás del soplido, resultado y QR/cobro. Va a la Raspberry Pi 3B+ por HDMI y se alimenta de la rama de 5,20 V del proyecto. No es táctil: el usuario empieza con un pulsador arcade en GPIO17.

- **Compra:** ASIN B0CHMBCCJB, 45,99 € (precio de la hoja de componentes del 19-20-10-2026).
- **Documentación que cita la guía:** wiki de 52Pi, referencia EP-0170. Veredicto: **modelo probable, sin confirmar** (ver [apartado 3](#3-qué-modelo-es-exactamente)).

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta, así que no he podido ver el anuncio concreto: el precio y la referencia son los de tu hoja. El fabricante publica muy poco de este modelo (ni consumo, ni rango de tensión, ni brillo real, ni plano). Donde uso cifras de otras pantallas de 7" lo digo.

> **Actualización 21-10-2026 (anuncio de Amazon.es leído).** Después de escribir esta ficha pude abrir el anuncio con el navegador integrado, así que lo que dice arriba de que Amazon bloquea el acceso ya no vale para esta pieza. Lo que cambia: no es táctil. En un mismo canto están el USB-C «Power IN», el HDMI de tamaño completo y un selector de retroiluminación. En la caja viene un cable «USB to USB-C» (no dice si el extremo grande es A), un cable HDMI de tamaño completo, un adaptador a micro-HDMI y dos soportes. Una reseña dice que el contacto de alimentación falla con un roce. Ver el [detalle y origen de cada dato](../../montaje-general/anuncios-amazon-21-10-2026.md).

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Discrepancias con la guía de montaje](#2-discrepancias-con-la-guía-de-montaje)
3. [Qué modelo es exactamente](#3-qué-modelo-es-exactamente)
4. [Especificaciones](#4-especificaciones)
5. [Documentos oficiales](#5-documentos-oficiales)
6. [Uso, configuración e integración](#6-uso-configuración-e-integración)
7. [Fallos, bugs y problemas conocidos](#7-fallos-bugs-y-problemas-conocidos)
8. [Alternativas](#8-alternativas)
9. [Recomendaciones para el alcoholímetro](#9-recomendaciones-para-el-alcoholímetro)
10. [Lo que no he podido verificar](#10-lo-que-no-he-podido-verificar)
11. [Fuentes](#11-fuentes)

---

## 1. Resumen para el proyecto

- **El fabricante no publica lo que más importa para esta máquina:** consumo, rango de tensión admitido, temperatura de trabajo, brillo real (la wiki escribe "500 lux", que no es una unidad de brillo de pantalla), vida de la retroiluminación, plano con agujeros y EDID. Las cifras de 0,5 A y 5,25 V de la guía **son de otra pantalla** (Waveshare 7" C), no de este modelo.
- **La configuración de la guía es correcta.** La documentación oficial confirma que `hdmi_group`, `hdmi_mode` y `hdmi_cvt` no funcionan en Bookworm ni en versiones posteriores, y que `video=HDMI-A-1:1024x600M@60` en `cmdline.txt` es la sintaxis oficial. Propongo añadir una `D` (forzar detección) como seguro, y comprobar el EDID al recibirla.
- **Los mandos están en la propia placa** (palanca lateral y OSD). Con la pantalla dentro de la chapa y detrás del policarbonato no se podrá tocar. Hay que fijar el brillo antes de cerrar. No he encontrado forma documentada de regular el brillo por software.
- **Qué hace la pantalla tras un corte de luz es la prueba más importante, y no está documentado:** si arranca sola, si recuerda el brillo y si recuerda un "apagado" hecho con el botón. Hay que probarlo.
- **24/7:** paneles de 7" equivalentes dan 20.000–25.000 h hasta perder la mitad del brillo. Encendida siempre, son unos 2,3–2,9 años (cálculo mío). El fabricante además excluye de la garantía la postimagen y recomienda desenchufar la pantalla si no se usa mucho tiempo.
- **Si el modelo resulta débil:** la alternativa mejor documentada es la Raspberry Pi Touch Display 2 de 7" (500 cd/m², −20 a 70 °C, 20.000 h, producción hasta enero de 2030), pero exige rehacer la interfaz en 720×1280.

## 2. Discrepancias con la guía de montaje

Guía: `claude/guia-montaje-electrico.md` (v2, 20-10-2026).

| Qué dice la guía | Qué dicen las fuentes | Veredicto |
|---|---|---|
| §2.3: EP-0170 "es el modelo documentado que más se parece"; el anuncio no está confirmado | EP-0170 existe: [wiki de 52Pi](https://wiki.52pi.com/index.php/EP-0170) y [tienda de 52Pi](https://52pi.com/products/7-inch-800-480-capacitive-touch-display-screen-monitor-for-raspberry-pi.json), "7-inch 1024x600 60Hz Non-Touch portable screen". Coincide en panel, resolución, tamaño, HDMI completo y USB-C. | Probable, sigue sin confirmar. Ver [apartado 3](#3-qué-modelo-es-exactamente). |
| §2.3 y §3: "unos 0,5 A con la retroiluminación encendida (referencia: Waveshare 7" C)" | Waveshare 7" C: unos 490 mA con retroiluminación y 90 mA sin ella, a 5 V ([FAQ de Waveshare](https://waveshare.com/wiki/7inch_HDMI_LCD_(C))). Elecrow 7": 2,55 W ([wiki](https://elecrow.com/wiki/7inch_IPS_HD_Touch_Screen-D.html)). Pi Touch Display 2 de 7": 2,4 W ([product brief](https://pip-assets.raspberrypi.com/categories/1083-raspberry-pi-touch-display-2/documents/RP-010429-MM-3-touch-display-2-7-inch-product-brief.pdf) ([copia local](datasheets/RP-010429-MM-3-touch-display-2-7-inch-product-brief.pdf))). **52Pi no da corriente**; solo recomienda un adaptador de 5 V / 2 A. | La cifra de Waveshare es correcta y tres módulos parecidos caen en 2,4–2,55 W (0,45–0,5 A). Sirve como estimación, **no es un dato de este modelo**. |
| §3: pantalla "típico 0,5 A, pico 0,5 A" | Ninguna fuente da el pico de arranque de este modelo. | Poner un pico de **1 A** como margen de diseño (recomendación mía). Con eso el pico total sube de unos 5 A a unos 5,5 A, muy por debajo de los 10 A de la fuente. |
| §2.6: "la pantalla admite 5,25 V como máximo" | 4,75 / 5,00 / 5,25 V es la tolerancia de la **Waveshare 7" C**. 52Pi solo dice "DC 5V" y un adaptador de 5 V / 2 A. | **Cifra prestada.** 5,20 V encaja en el rango clásico de USB (4,75–5,25 V; el límite alto se subió a 5,5 V con USB-C, según [Wikipedia](https://en.wikipedia.org/wiki/USB_hardware)), pero el límite real de esta pantalla es desconocido. Medir la tensión en la pantalla (apartado 6.1). |
| §2.3: las líneas `hdmi_group` y `hdmi_cvt` "no funcionan" en Bookworm/Trixie | La [documentación oficial](https://www.raspberrypi.com/documentation/computers/legacy_config_txt.html) dice que esas opciones "no funcionan" con Bookworm y posteriores. El [white paper de KMS](https://pip-assets.raspberrypi.com/categories/1259-audio-camera-and-display/documents/RP-004341-WP-2-Troubleshooting%20KMS%20HDMI%20output.pdf) ([copia local](datasheets/RP-004341-WP-2-Troubleshooting_KMS_HDMI_output.pdf)) añade que `hdmi_force_hotplug` tampoco está implementado en KMS. | **Confirmado.** |
| §7: `video=HDMI-A-1:1024x600M@60` | Sintaxis oficial: `video=<pantalla>:<ancho>x<alto>M@<frecuencia>`. En modelos con un solo HDMI, `HDMI-A-1` es el puerto HDMI ([documentación](https://www.raspberrypi.com/documentation/computers/configuration.html)). | **Correcto.** Sugerencia: añadir `D` (apartado 6.2). |
| §2.3: "Ventana del panel: 176 × 116 mm, más que la pantalla (165 × 100)" | 165 × 100 × 8 mm es el **contorno del módulo** ([wiki](https://wiki.52pi.com/index.php/EP-0170)). El área visible con imagen no está publicada. Paneles de 7" y 1024×600 de otros fabricantes tienen 154,21 × 85,92 mm. | La ventana es 11 mm más ancha y 16 mm más alta que **todo el módulo**. Se verá borde del panel y del circuito si el policarbonato es transparente. Hay que enmascararlo (apartado 6.4). |
| §2.3 y §5.2: "el cable USB-A→USB-C que trae la pantalla" | La wiki tiene **dos listas de contenido contradictorias**: una con un cable USB-C de alimentación; otra con un convertidor HDMI→microHDMI y un "adaptador USB", dos tornillos M2.5 en vez de M3 y soportes de plástico. No dice si el cable es A→C o C→C. | **Sin verificar.** Si el cable es C→C no sirve en un borne USB-A hembra. Mira la caja al recibirla. |
| §2.3: "la wiki dice que la pantalla puede alimentar a la Pi. Aquí no se usa así" | Confirmado: la wiki monta Pi 4B y Pi 3B/3B+ con un cable USB entre la Pi y la pantalla y avisa de no alimentar la Pi por su propio puerto. | Confirmado. **No conectes ese cable USB Pi–pantalla** (apartado 6.1). |

## 3. Qué modelo es exactamente

Lo que sé:

- **EP-0170** es la referencia de 52Pi para una pantalla portátil de 7", IPS, 1024×600, 60 Hz, sin táctil, entrada HDMI de tamaño completo y alimentación por USB-C ([wiki](https://wiki.52pi.com/index.php/EP-0170), revisión 13820 del 9-11-2023; [tienda de 52Pi](https://52pi.com/products/7-inch-800-480-capacitive-touch-display-screen-monitor-for-raspberry-pi.json), SKU EP-0170; [Oz Robotics](https://ozrobotics.com/shop/7-inch-portable-screen-for-raspberry-pi-windows-pc-no-touch/), que confirma el SKU).
- Los buscadores muestran para el ASIN B0CHMBCCJB estos títulos de Amazon: en [Amazon.nl](https://www.amazon.nl/-/en/GeeekPi-Raspberry-1024x600-Portable-Monitor/dp/B0CHMBCCJB), "GeeekPi 7 inch LCD Screen … 1024x600 IPS … with Stand, Portable HDMI Monitor", compatible con Raspberry Pi 5/4B/3B+/3B/B+/Zero/400, Windows y Banana Pi M5/M2 Zero; en [Amazon.fr](https://www.amazon.fr/GeeekPi-Raspberry-1024x600-Display-Portable/dp/B0CHMBCCJB), el mismo texto sin "with Stand". La wiki de EP-0170 también lista Banana Pi M5 entre los equipos compatibles y la pantalla lleva dos soportes. **Son indicios, no prueba.** Solo he visto los títulos en los resultados de búsqueda; no he podido abrir los anuncios.

Lo que no sé:

- **Ninguna fuente dice "GeeekPi = 52Pi".** El [resumen de marca de Ubuy](https://www.ubuy.hk/en/brand/geeekpi) describe a GeeekPi como una marca de accesorios de Raspberry Pi fundada en 2016 y no nombra a 52Pi. La relación es probable por las especificaciones, pero **sin verificar**.
- **Ningún título ni página que haya visto lleva el código EP-0170** junto al ASIN B0CHMBCCJB.
- **Los títulos de Amazon cambian.** El ASIN hermano B0CJWXWJ6K aparece como "Capacitive Touchscreen … Dual-Speaker" en [Amazon.com](https://www.amazon.com/GeeekPi-Capacitive-Touchscreen-Dual-Speaker-Free-Driver/dp/B0CJWXWJ6K) y como "LCD Screen … with Stand" bajo una URL con "Touch" en [Amazon.com.au](https://www.amazon.com.au/GeeekPi-Screen-Raspberry-1024x600-Touch/dp/B0CJWXWJ6K). Es otro ASIN, pero muestra que 52Pi/GeeekPi tiene versiones táctiles y no táctiles con títulos muy parecidos. Al recibir la pantalla, comprueba que no es táctil y que lleva un único puerto USB-C de alimentación.

**Cómo confirmarlo al recibirla** (instrucciones mías): fotografiar caja y placa, anotar cualquier código impreso (EP-0170 u otro), comprobar que los conectores son los de la wiki (HDMI completo, USB-C "Power IN" y palanca lateral), y guardar el EDID (apartado 6.2).

## 4. Especificaciones

Fuente principal: [wiki de 52Pi EP-0170](https://wiki.52pi.com/index.php/EP-0170) y [ficha de tienda de 52Pi](https://52pi.com/products/7-inch-800-480-capacitive-touch-display-screen-monitor-for-raspberry-pi.json). Son las mismas cifras en ambas, salvo donde se indica.

| Característica | Valor | Nota |
|---|---|---|
| Panel | IPS de 7", 16:9 | 52Pi |
| Resolución | 1024×600 (por defecto), 60 Hz | 52Pi. La wiki avisa: otras resoluciones "pueden causar anomalías" |
| Táctil | No | 52Pi |
| Brillo | "500 lux" | **Unidad incorrecta**: el lux mide iluminancia, no el brillo de una pantalla. El brillo real en cd/m² es **sin verificar** (apartado 4.1) |
| Ángulo de visión | "89° desde las cuatro esquinas" | 52Pi. Lo normal es leerlo como 89° a cada lado (178° en total); interpretación mía |
| Contraste | No publicado | |
| Entrada de vídeo | HDMI de tamaño completo | 52Pi |
| Alimentación | 5 V CC por USB-C; recomienda un adaptador de 5 V / 2 A o más | 52Pi |
| Consumo | No publicado | Ver 4.1 y 6.1 |
| Rango de tensión | No publicado | |
| Temperatura de trabajo | No publicada | La wiki dice "evitar temperaturas extremas" sin cifra |
| Dimensiones | 165 × 100 × 8 mm | 52Pi |
| Peso | 0,50 kg | La ficha de tienda de 52Pi pone 0,50 kg en el texto y 0,55 kg en la variante |
| Área visible (con imagen) | No publicada | Ver 6.4 |
| Agujeros de montaje | No publicados | Dos soportes con tornillos alineados con marcas serigrafiadas de la placa; M3 largos en una lista, M2.5 en otra |
| Mando | Palanca lateral: pulsar = encender/apagar; arriba/abajo = retroiluminación; pulsación larga de 3 s = menú OSD | 52Pi (la wiki la llama "rotary switch" y "toggle", y en un pie de imagen dice izquierda/derecha) |
| Menú OSD | Color (brillo, retroiluminación, contraste, tono, saturación); OSD (idioma, posición, tiempo, transparencia); Función (reset, restaurar fábrica, relación de pantalla, pantalla azul, nitidez, voltear pantalla) | 52Pi. 8 idiomas |
| Vida de la retroiluminación | No publicada | |
| Certificaciones | No encontradas | Ver apartado 5 |
| Producción garantizada | No hay compromiso | La wiki no se ha tocado desde el 9-11-2023 |

### 4.1 Cifras de módulos parecidos (no son este modelo)

Sirven para saber qué es razonable esperar. **Ninguna es medida de la pantalla GeeekPi.**

| | Waveshare 7" HDMI LCD (C) | Elecrow DLH05170B | Panel Displaytech DT070BTFT-HB | Pi Touch Display 2, 7" |
|---|---|---|---|---|
| Brillo | 300 cd/m² máx. | 320 cd/m² | 500 cd/m² típico | 500 cd/m² |
| Consumo | 2,5 W; unos 490 mA con retroiluminación, 90 mA sin ella | 2,55 W | Solo panel (sin driver) | 2,4 W (retroiluminación 5 V a 450 mA, lógica 3,3 V a 50 mA) |
| Tensión | 4,75 / 5,00 / 5,25 V | 5 V USB-C | | 5 V por GPIO |
| Temperatura de trabajo | 0 a 60 °C | | −20 a 70 °C | −20 a 70 °C |
| Vida retroiluminación | | | 25.000 h típico (hasta el 50 % del brillo) | 20.000 h (L50) |
| Contorno | 164,90 × 106,96 × 8 mm | 164,90 × 102,00 × 15,15 mm | 164,9 × 100,0 × 5,7 mm | 120,2 × 189,3 mm |
| Área activa | 154,21 × 85,92 mm | 154,21 × 85,92 mm | 154,21 × 85,92 mm | 86,9 × 154,6 mm |
| Fuente | [Waveshare](https://waveshare.com/wiki/7inch_HDMI_LCD_(C)) | [Elecrow](https://elecrow.com/wiki/7inch_IPS_HD_Touch_Screen-D.html) | [datasheet](https://www.mouser.com/datasheet/2/1015/DT070BTFT-HB-Displaytech-Spec-1649616.pdf) ([copia local](datasheets/DT070BTFT-HB-Displaytech-Spec-1649616.pdf)) | [product brief](https://pip-assets.raspberrypi.com/categories/1083-raspberry-pi-touch-display-2/documents/RP-010429-MM-3-touch-display-2-7-inch-product-brief.pdf) ([copia local](datasheets/RP-010429-MM-3-touch-display-2-7-inch-product-brief.pdf)) |

Observaciones mías:

- **El contorno de 165 × 100 mm de 52Pi coincide con el del panel de 7" y 1024×600 de Displaytech** (164,9 × 100,0 mm, área activa 154,21 × 85,92 mm), y esa misma área activa la declaran Waveshare y Elecrow. Es plausible que el panel de la GeeekPi tenga esa geometría, pero **no lo he podido comprobar**.
- **El brillo puede ser bastante menor que "500":** los módulos de Waveshare y Elecrow, del mismo tamaño y resolución, dan 300–320 cd/m². Si el "500 lux" de la wiki viniera de un luxómetro pegado a la pantalla, equivaldría a unos 160 cd/m² (cálculo mío: L ≈ E/π). Es una hipótesis, no un dato. **Mídelo.**
- Las cifras del Pi Touch Display 2 las he leído con una herramienta que resume el PDF; conviene contrastarlas con el PDF original.

## 5. Documentos oficiales

52Pi **no publica datasheet en PDF, plano mecánico, EDID ni declaración de conformidad** de este modelo que yo haya encontrado. La documentación es una wiki y el manual impreso que va en la caja.

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Wiki técnica de 52Pi | EP-0170, rev. 13820 (9-11-2023) | HTML | [wiki.52pi.com](https://wiki.52pi.com/index.php/EP-0170) |
| Misma wiki en Markdown (espejo) | EP-0170 | HTML/MD | [wiki-md.52pi.com](https://wiki-md.52pi.com/docs/EP-0170) |
| Ficha de tienda de 52Pi (datos JSON) | SKU EP-0170 | JSON | [json](https://52pi.com/products/7-inch-800-480-capacitive-touch-display-screen-monitor-for-raspberry-pi.json) · [página](https://52pi.com/products/7-inch-800-480-capacitive-touch-display-screen-monitor-for-raspberry-pi) |
| Manual de usuario | "instructions" de la caja | Papel | **No encontrado en línea** |
| Modelos 3D de carcasa para la pantalla de 7" | DeskPi, modelos 16 y 17 | HTML (3DShare) | [modelo 16](https://print.deskpi.com/models/16) · [modelo 17](https://print.deskpi.com/models/17) |
| Wiki de la versión táctil con altavoces | EP-0177 | HTML | [wiki-md](https://wiki-md.52pi.com/docs/EP-0177) |

Documentos de la Raspberry Pi relevantes para la pantalla:

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Resolución de problemas de salida HDMI con KMS | RP-004341-WP-2 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/1259-audio-camera-and-display/documents/RP-004341-WP-2-Troubleshooting%20KMS%20HDMI%20output.pdf) ([copia local](datasheets/RP-004341-WP-2-Troubleshooting_KMS_HDMI_output.pdf)) |
| Opciones antiguas de `config.txt` (no funcionan en Bookworm y posteriores) | – | HTML | [documentación](https://www.raspberrypi.com/documentation/computers/legacy_config_txt.html) |
| Configuración de pantalla (`video=`) y apagado de pantalla | – | HTML | [documentación](https://www.raspberrypi.com/documentation/computers/configuration.html) |
| Parámetros de `video=` del kernel (CVT, `D`, márgenes, rotación) | – | HTML | [docs.kernel.org](https://docs.kernel.org/fb/modedb.html) |

### Qué dice la wiki de 52Pi (resumen)

- **Alimentación y montaje con Raspberry Pi:** conectar la Pi a la pantalla con tornillos, un adaptador HDMI y un adaptador USB, y dar la corriente a la pantalla. Aviso: no alimentar la Pi por su propio USB-C (4B) ni micro-USB (3B/3B+), porque lo hace la pantalla.
- **Avisos:**
  - Usar la resolución recomendada (1024×600).
  - No mantener una imagen estática mucho tiempo: la postimagen **no está cubierta por la garantía**. Usar un salvapantallas.
  - Puede haber píxeles muertos rojos, verdes o azules, y la wiki dice que no afectan al funcionamiento.
  - Desenchufar la pantalla si no se va a usar durante mucho tiempo.
  - No abrir la carcasa trasera; no tocar los circuitos (descarga electrostática); alejarla de la humedad, el polvo y las fuentes de calor.
- **FAQ:** si el OSD no se abre y la palanca solo apaga y enciende, hay que conectar la fuente HDMI, comprobar la entrada y la resolución (por defecto 1024×600). Existe una captura "bluescreen/input source" que sugiere que, sin señal, la pantalla muestra una pantalla azul (solo por el título de la imagen; no he visto la imagen).
- **No hay** en la wiki: consumo, rango de tensión, temperatura, configuración de `config.txt`, EDID, plano ni dimensiones de los agujeros.

## 6. Uso, configuración e integración

### 6.1 Alimentación desde la rama de 5,20 V

**Lo que dicen las fuentes**

- La pantalla se alimenta por **su puerto USB-C "Power IN"** a 5 V, y la wiki recomienda un adaptador de 5 V / 2 A o más. **El USB-C es independiente de la Pi:** de hecho, en el montaje de 52Pi es la pantalla la que alimenta a la Pi. ([wiki](https://wiki.52pi.com/index.php/EP-0170))
- La wiki de la versión táctil EP-0177 da "standby current: 0,5 A máx." y la misma recomendación de 5 V / 2 A ([wiki EP-0177](https://wiki-md.52pi.com/docs/EP-0177)). No sé qué mide ese "standby", ni si vale para la no táctil.
- Waveshare avisa de que, si la fuente da menos de 500 mA, la pantalla puede no arrancar o funcionar mal ([Waveshare](https://waveshare.com/wiki/7inch_HDMI_LCD_(C))). No hay un aviso equivalente de 52Pi.

**Cálculos míos** (resistividad del cobre a 20 °C, 0,0172 Ω·mm²/m; la sección real del cable USB de la caja es **sin verificar**):

| Cable | Resistencia ida y vuelta por metro | Caída a 0,5 A | Caída a 1 A |
|---|---|---|---|
| USB con hilos de 28 AWG (0,081 mm²) | 0,42 Ω | 0,21 V | 0,42 V |
| USB con hilos de 24 AWG (0,205 mm²) | 0,17 Ω | 84 mV | 0,17 V |
| 0,75 mm² (rama de la guía) | 46 mΩ | 23 mV | 46 mV |

- **Sobretensión:** con un cable USB de 1 m a 0,5 A, en la pantalla llegarán entre unos 5,0 y 5,1 V (5,20 V menos la caída de la tabla, sin contar el borne de tornillo), no 5,20 V. El límite superior que preocupa a la guía (5,25 V) **no se alcanza** salvo que el cable sea muy corto y grueso.
- **Subtensión en la pantalla:** es el riesgo contrario. Un cable USB largo y fino, más el borne USB-A de tornillo, restan décimas de voltio justo en el arranque de la retroiluminación. Si la pantalla se queda en negro, parpadea o se reinicia al encender, mide ahí primero.
- **Efecto sobre la Pi si el arranque de la retroiluminación hace caer el raíl:** suponiendo unos 0,3 m de troncal común de 0,75 mm², la resistencia ida y vuelta es de unos 14 mΩ. Un escalón de 1 A son unos **14 mV** en ese tramo, frente a los 0,57 V entre 5,20 V y el umbral de aviso de la Pi, 4,63 V ([ficha de la Pi 3B+](../raspberry-pi-3b-plus/README.md#41-subtensión)). Con esos cables, un pico de arranque de la pantalla **no debería** disparar el aviso de subtensión de la Pi. La regulación de la LRS-50-5 ante escalones es de otra ficha. **Sin verificar con medida.**
- **Lo que sí haría caer el raíl:** un cortocircuito en la rama de la pantalla, no su arranque. Es una razón para un fusible o PTC en esa rama (sugerencia mía).

**No conectes el cable USB entre la Pi y la pantalla** que describe la wiki (adaptador USB). Con la Pi alimentada aparte por su latiguillo micro-USB, ese cable crearía un segundo camino de alimentación entre las dos piezas. No aporta nada. (Deducción mía.)

### 6.2 Configuración en Raspberry Pi OS Lite (Trixie) con KMS

**Hechos oficiales**

- **Las opciones `hdmi_group`, `hdmi_mode`, `hdmi_cvt`, `overscan_*`, `hdmi_force_hotplug`, `hdmi_drive` y `config_hdmi_boost` son "legacy".** La documentación dice que las opciones de esa sección no funcionan con Bookworm y posteriores ([legacy_config_txt](https://www.raspberrypi.com/documentation/computers/legacy_config_txt.html)). El white paper de KMS dice que `hdmi_force_hotplug` no está implementado y que se use `video=…:D` ([RP-004341-WP-2](https://pip-assets.raspberrypi.com/categories/1259-audio-camera-and-display/documents/RP-004341-WP-2-Troubleshooting%20KMS%20HDMI%20output.pdf) ([copia local](datasheets/RP-004341-WP-2-Troubleshooting_KMS_HDMI_output.pdf))).
  - Las guías de Waveshare, Elecrow y Adafruit proponen esas líneas ([Waveshare](https://waveshare.com/wiki/7inch_HDMI_LCD_(C)), [Elecrow](https://elecrow.com/wiki/7inch_IPS_HD_Touch_Screen-D.html), [Adafruit](https://learn.adafruit.com/hdmi-uberguide/2299-display-no-touchscreen-1024x600-hdmi-slash-vga-slash-ntsc-slash-pal)): son opciones del sistema anterior. **No las copies.** La wiki de 52Pi no propone ninguna.
- **Sin escritorio, la resolución se fija en `cmdline.txt`** (`/boot/firmware/cmdline.txt`, todo en una línea) con `video=<pantalla>:<ancho>x<alto>M@<frecuencia>`. Si no se indica resolución, la Pi la deduce del EDID. En modelos de un solo HDMI, `HDMI-A-1` es ese puerto. Rotación y espejo: `,rotate=<grados>` y `,reflect_x`. ([documentación](https://www.raspberrypi.com/documentation/computers/configuration.html))
- **La `M`** hace que el kernel calcule los tiempos con VESA CVT en vez de buscarlos en una tabla; la **`D`** fuerza la salida como si hubiera pantalla conectada, y es la sustituta de `hdmi_force_hotplug` ([docs.kernel.org](https://docs.kernel.org/fb/modedb.html), [white paper](https://pip-assets.raspberrypi.com/categories/1259-audio-camera-and-display/documents/RP-004341-WP-2-Troubleshooting%20KMS%20HDMI%20output.pdf) ([copia local](datasheets/RP-004341-WP-2-Troubleshooting_KMS_HDMI_output.pdf))). El kernel también acepta `margin_left/right/top/bottom`.
- **Overscan:** `overscan_*` y `disable_overscan` son opciones legacy ([legacy_config_txt](https://www.raspberrypi.com/documentation/computers/legacy_config_txt.html)). En KMS, los márgenes se piden con `margin_*` en `video=`. Si la imagen sale recortada o escalada, revisa también el ajuste "relación de pantalla" del OSD (la guía de RobotShop de otra 7" de 1024×600 lo pone en Auto; no es este modelo).
- **Pi 3B+ y los tiempos de 1024×600:** el hilo [raspberrypi/linux#4719](https://github.com/raspberrypi/linux/issues/4719) trata de un 7" de 1024×600 que no funcionaba con KMS en una **Pi 4B**; según un mantenedor, porque sus tiempos horizontales no son divisibles por 2. La documentación oficial limita esa restricción a la serie 4 ([config_txt/video.adoc](https://github.com/raspberrypi/documentation/blob/master/documentation/asciidoc/computers/config_txt/video.adoc)). **La Pi 3B+ no es de la serie 4**, así que ese fallo no debería aplicar. (Deducción mía.)
- **Mi cálculo del CVT 1024×600 a 60 Hz:** reloj de píxel de 49,0 MHz y totales de 1312 × 624. Es la misma temporización (49,00 MHz, 288 y 24 de blanking) que da el EDID de la Waveshare 7" C ([Waveshare](https://waveshare.com/wiki/7inch_HDMI_LCD_(C))). Así que `1024x600M@60` pide el mismo modo que anuncia esa pantalla. El EDID de la GeeekPi es **sin verificar**.

**Causas de pantalla negra con KMS** (white paper RP-004341-WP-2): fallo al pasar de firmware a kernel (el kernel gestiona peor un EDID defectuoso), línea de hotplug que no se activa, pantalla que solo da EDID cuando está encendida o en la entrada correcta (ocurre cuando la Pi arranca antes que la pantalla en la misma regleta), EDID mal formado, o fallo físico (cable, puerto).

**Comprobaciones recomendadas al montar la imagen.** Las dos primeras son del white paper; la tercera es mía:

```text
cat /sys/class/drm/card?-HDMI-A-1/edid > edid.bin   # copia del EDID de la pantalla (guárdalo)
cat /sys/class/drm/card?-HDMI-A-1/modes             # modos que anuncia la pantalla
cat /proc/cmdline                                    # lo que realmente se ha aplicado
```

Si no existe la carpeta `card?-HDMI-A-1`, el EDID no se ha leído.

**Línea propuesta** (mía; la de la guía más una `D` al final):

```text
video=HDMI-A-1:1024x600M@60D
```

- La `D` hace que la Pi saque imagen aunque no detecte la pantalla. Es un seguro útil si ambas se encienden a la vez tras un corte de luz. El white paper la usa como `video=HDMI-A-1:1280x720@60D`.
- **No he podido comprobar** cómo interactúa esta línea con el modo que el firmware pasa por su cuenta al kernel ([`disable_fw_kms_setup`](https://github.com/raspberrypi/documentation/blob/master/documentation/asciidoc/computers/config_txt/video.adoc)). Mira `/proc/cmdline` para ver qué ha quedado.
- Si el EDID de la pantalla es correcto, probar también sin `video=` y comparar.

**Rotación:** el panel es apaisado nativo, no hace falta. Si se montara al revés, el OSD tiene "voltear pantalla" y el kernel acepta `rotate=` (ver arriba).

**Fallos que no he podido atribuir a este modelo:** no he encontrado ningún informe de 1024×768 equivocado, parpadeo o pantalla negra de la GeeekPi/52Pi. Sí hay ejemplos de otras marcas (apartado 7.5).

### 6.3 Brillo, OSD y persistencia

- **Hay dos controles:** la palanca lateral (arriba/abajo = retroiluminación con aviso en pantalla) y el menú OSD (brillo, retroiluminación, contraste…) que se abre con ella. La documentación de 52Pi no menciona botones aparte, PWM expuesto ni brillo por USB. ([wiki](https://wiki.52pi.com/index.php/EP-0170))
- **Regulación por software:** no hay documentación. La única vía posible es DDC/CI por el cable HDMI (herramienta `ddcutil`, brillo = función VCP 10; [man](https://www.mankier.com/1/ddcutil)), pero no sé si esta placa lo implementa. **Sin verificar.** Prueba: `ddcutil detect` con la pantalla conectada.
- **Persistencia tras un corte de luz:** la wiki no dice si el brillo del OSD se guarda ni si la pantalla arranca sola al recibir tensión o espera a que se pulse la palanca. **Sin verificar.** Es la prueba más importante (apartado 9).
- **Con la pantalla cerrada dentro de la chapa, estos mandos no serán accesibles.** Fija el brillo, la relación de pantalla y la nitidez antes de montar.
- **Qué hace la pantalla sin señal:** el OSD tiene una opción "pantalla azul" y la wiki muestra una captura de ese nombre. Si, al perder la señal, la pantalla se queda en azul con la retroiluminación encendida, apagar el HDMI desde la Pi **no ahorraría vida de retroiluminación**. Otras placas genéricas de 7" se comportan así ([hilo del foro de moOde](https://moodeaudio.org/forum/showthread.php?tid=5300): pantalla de 7" sin marca que, en una Pi 4, se quedaba en azul con "no signal"; sin solución en el hilo). **Sin verificar para este modelo.**

### 6.4 Mecánica y ventana de la carcasa

- **Módulo:** 165 × 100 × 8 mm ([wiki](https://wiki.52pi.com/index.php/EP-0170)).
- **Área activa:** no publicada. Por analogía con paneles de ese tamaño, 154,21 × 85,92 mm (**deducción mía**, ver 4.1).
- **Agujeros:** no publicados. La wiki habla de soportes fijados "a las marcas serigrafiadas de la placa", sin cotas. Tendrás que medir con calibre la placa recibida. Los modelos 3D de carcasa de DeskPi ([16](https://print.deskpi.com/models/16), [17](https://print.deskpi.com/models/17)) podrían traer cotas; **solo he podido leer el título de las páginas**.
- **Ventana de 176 × 116 mm de la guía** (cálculos míos):
  - La ventana es 11 mm más ancha y 16 mm más alta que el módulo entero, de modo que el módulo no puede sujetarse por el marco de la ventana: hay que fijarlo por sus propios puntos o por la parte de atrás.
  - Alrededor del área activa (supuesta de 154,21 × 85,92 mm) quedan a la vista 10,9 mm por cada lado y 15 mm arriba y abajo de borde del panel, circuito y chapa.
  - **Solución:** una máscara negra opaca en la cara interior del policarbonato, con una abertura del tamaño del área activa (algo mayor, unos 156 × 87 mm). Mide el desplazamiento real del área activa respecto al contorno del módulo: puede no estar centrada, sobre todo en vertical (sin verificar).
- **Fondo:** 8 mm del módulo más los conectores HDMI y USB-C con sus cables. Dónde están los conectores y cuánto sobresalen es **sin verificar** (la wiki tiene un diagrama de puertos que no pude leer). Reserva fondo y mídelo al recibirla.

### 6.5 Óptica y legibilidad en un bar

- **Brillo y contraste reales: sin verificar.** El texto de 52Pi no sirve (lux). Otros 7" similares dan 300–320 cd/m² (apartado 4.1).
- **Cuánto brillo hace falta:** una guía de selección cita 200–400 nits para interiores controlados y 500–800 nits para zonas muy luminosas ([blog de Alibaba](https://seller.alibaba.com/blogs/2026/southeast-asia/industrial-equipment/monitor-brightness-500-1000nit-guide-alibaba-b2b); fuente comercial). Una web de iluminación dice que en bares es habitual quedar por debajo de 100 lux ([lights.co.uk](https://lights.co.uk/restaurant-lighting); fuente comercial). **Conclusión mía:** en un bar con poca luz, 300 cd/m² sobran. El problema serían los reflejos del policarbonato (un foco directo sobre la ventana) y la luz de calle en un local con cristal.
- **IPS:** el ángulo de visión es el fuerte del panel (89° a cada lado según 52Pi). La contrapartida es el brillo negro: sin imagen se ve un gris oscuro, y más si se deja la retroiluminación al máximo (conocimiento general, sin fuente).
- **Policarbonato:** añade un segundo reflejo y puede dar velo (conocimiento general, sin fuente). Un policarbonato mate o con antirreflejo ayuda; hay que probarlo con la pantalla encendida.

### 6.6 Funcionamiento continuo (24/7)

- **Retroiluminación.** No hay cifra de 52Pi. Datos de módulos parecidos: 20.000 h (L50, Pi Touch Display 2 7") y 25.000 h (Displaytech 7", medidos a 140 mA; avisa de que la vida puede bajar si la corriente pasa de 200 mA). A 8.760 h por año, **20.000 h son 2,3 años, 25.000 h son 2,9 años y 50.000 h serían 5,7 años** (cálculo mío). "L50" significa que el brillo cae a la mitad, no que se apague. Reducir el brillo alarga la vida (conocimiento general, sin fuente de este modelo).
- **Retención de imagen.** Los IPS son los TFT más susceptibles: una imagen estática (barras de navegación, logos) puede dejar una huella. Normalmente es reversible; el "burn-in" persistente es más difícil de quitar. Recomiendan salvapantallas con movimiento, apagar la pantalla en reposo, brillo y contraste moderados ([Focus LCDs](https://focuslcds.com/journals/ghosting-burn-in-on-ips-tft-panels/), [Elo](https://elosupport.elotouch.com/hc/en-us/articles/31652979962775-What-are-the-Best-Methods-to-Prevent-LCD-Image-Retention)). **52Pi excluye la postimagen de la garantía.**
- **Apagar la retroiluminación con inactividad.** Hay tres caminos, ninguno comprobado con esta pantalla:
  1. **Por señal:** la Pi corta el HDMI y la pantalla pasa a reposo. Depende de lo descrito en 6.3 (pantalla azul).
  2. **Por tensión:** un MOSFET o relé corta los 5 V de la pantalla desde un GPIO. Solo vale si la pantalla arranca sola al recibir tensión.
  3. **Atenuar:** solo con el OSD (inaccesible) o con DDC/CI (sin verificar).
  La documentación oficial indica cómo se blanquea la consola (`consoleblank`) y avisa de que, si la pantalla despierta enseguida mostrando "NO SIGNAL", se añada `vc4.force_hotplug=1` al `cmdline.txt` ([documentación](https://www.raspberrypi.com/documentation/computers/configuration.html)).
- **Temperatura.** Sin cifras de este modelo (Waveshare 7" C: 0–60 °C; paneles Displaytech y Pi Touch Display 2: −20 a 70 °C). Mide dentro de la máquina, con la pantalla junto a la fuente de 50 W.
- **El fabricante recomienda desenchufar la pantalla si se deja sin usar mucho tiempo** ([wiki](https://wiki.52pi.com/index.php/EP-0170)). No hay una prohibición del uso continuo, pero no está pensada ni garantizada para él.

## 7. Fallos, bugs y problemas conocidos

No he encontrado ningún informe independiente (foro, issue, reseña técnica) sobre esta pantalla concreta; la búsqueda web de la sesión se agotó. Lo que sigue son riesgos deducidos de la documentación del fabricante, de la oficial de la Pi y de pantallas parecidas.

| # | Problema | Gravedad para el proyecto | Nivel de evidencia | Detalle |
|---|---|---|---|---|
| 1 | Modelo del anuncio sin confirmar | Media | Indicios | [7.1](#71-modelo-sin-confirmar) |
| 2 | Especificaciones clave no publicadas (consumo, tensión, temperatura, brillo, plano) | Media-alta | Hecho (falta de datos) | [7.2](#72-especificaciones-no-publicadas) |
| 3 | Comportamiento tras un corte de luz desconocido; mandos inaccesibles con la máquina cerrada | Alta hasta probarlo | Sin verificar | [7.3](#73-corte-de-luz-y-mandos-inaccesibles) |
| 4 | Contenido de la caja y cable de alimentación contradictorios | Media | Wiki de 52Pi | [7.4](#74-contenido-de-la-caja-y-cable) |
| 5 | Pantalla negra o resolución equivocada con KMS | Media | Documentación oficial | [7.5](#75-pantalla-negra-o-resolución-equivocada-kms) |
| 6 | Retención de imagen y postimagen sin garantía | Media | Fabricante y terceros | [7.6](#76-retención-de-imagen) |
| 7 | Vida de la retroiluminación en uso continuo | Media | Módulos parecidos | [7.7](#77-vida-de-la-retroiluminación) |
| 8 | Píxeles muertos aceptados por el fabricante | Baja-media | Wiki de 52Pi | [7.8](#78-píxeles-muertos) |
| 9 | Pantalla azul "no signal" con retroiluminación encendida | Baja-media | Sin verificar | [7.9](#79-pantalla-azul-sin-señal) |
| 10 | Temporización de 1024×600 en Pi 4 (#4719) | No aplica a la Pi 3B+ | Documentación oficial | [7.10](#710-temporización-1024600-en-pi-4) |
| 11 | Variación entre lotes y marcas con el mismo panel | Media | Sin datos | [7.11](#711-lotes-y-marcas) |
| 12 | Sin certificados ni declaración de conformidad localizados | Media | Hecho (falta de datos) | [7.12](#712-certificados) |
| 13 | Sin compromiso de producción | Media | Hecho (falta de datos) | [7.13](#713-disponibilidad) |

### 7.1 Modelo sin confirmar

Ver [apartado 3](#3-qué-modelo-es-exactamente). Consecuencia práctica: **toda cifra de la wiki EP-0170 que aparece en esta ficha vale solo si el anuncio resulta ser EP-0170**.

### 7.2 Especificaciones no publicadas

La wiki y la tienda de 52Pi no dan consumo, tensión admitida, temperatura, brillo en cd/m², contraste, vida de la retroiluminación ni plano ([wiki](https://wiki.52pi.com/index.php/EP-0170), [tienda](https://52pi.com/products/7-inch-800-480-capacitive-touch-display-screen-monitor-for-raspberry-pi.json)). Oz Robotics tampoco las da ([Oz Robotics](https://ozrobotics.com/shop/7-inch-portable-screen-for-raspberry-pi-windows-pc-no-touch/)). Core Electronics, que vende esta pantalla de 52Pi (CE10331) y enlaza la wiki de EP-0170, dice expresamente que no indica consumo ni garantía ([Core Electronics](https://core-electronics.com.au/52pi-7-inch-display-hdmi-for-pi-and-windows.html.plain.md)). Para fabricar en serie hay que pedírselas a 52Pi/GeeekPi por escrito o medirlas.

### 7.3 Corte de luz y mandos inaccesibles

No hay documentación sobre si la pantalla arranca sola ni si conserva el brillo. En una máquina de bar donde se corta la luz con frecuencia, una pantalla que espera una pulsación de la palanca para encenderse dejaría la máquina muerta hasta que alguien abra la chapa. **Prueba obligatoria** (apartado 9). También probar el corte estando la pantalla "apagada" con la palanca. Con la máquina cerrada, la palanca y el OSD no se alcanzan (deducción mía a partir del montaje de la guía).

### 7.4 Contenido de la caja y cable

La wiki lista dos contenidos distintos: (a) cable USB-C de alimentación, cable HDMI de tamaño completo, dos tornillos M3 largos, dos patas de goma, dos soportes, instrucciones; (b) pantalla, cable HDMI, cable USB-C, convertidor HDMI→microHDMI, adaptador USB, dos soportes de plástico, dos tornillos M2.5 y dos patas de goma. Lo vendido en Amazon.es puede ser cualquiera de las dos (o ninguna). La tienda de Core Electronics y Oz Robotics muestran la primera lista. Si el cable es C→C, **no funcionará** en un borne USB-A hembra.

### 7.5 Pantalla negra o resolución equivocada (KMS)

- **Documentado por Raspberry Pi** (white paper RP-004341-WP-2): ver las causas del apartado 6.2. El caso que afecta a esta máquina es el de la Pi que arranca antes que la pantalla cuando ambas cuelgan de la misma regleta. En la Pi 3B+ el arranque es largo, de modo que lo normal es que la pantalla llegue antes (deducción mía, **sin verificar**): haz una prueba con 20 cortes de luz seguidos.
- **Resolución equivocada:** la wiki de 52Pi avisa de que otras resoluciones pueden dar anomalías. Waveshare avisa de que, si no se fija la resolución a mano, la pantalla puede ir mal ([Waveshare](https://waveshare.com/wiki/7inch_HDMI_LCD_(C))). Una guía de otra 7" de 1024×600 describe como síntoma "caracteres muy pequeños o imagen incompleta" y manda poner "relación de pantalla" en Auto desde el OSD ([guía de RobotShop](https://cdn.robotshop.com/media/s/suf/rb-suf-110/pdf/raspberry_pi_7__hd_1024_600_tft_lcd_screen_display_settings_-_wiki.pdf); otro modelo, no este). **No he encontrado el caso concreto de 1024×768.**
- **Líneas heredadas:** al buscar soluciones se encuentran hilos que recomiendan `hdmi_cvt`, `hdmi_group` o `disable_overscan` ([OctoDash#1877](https://github.com/UnchartedBull/OctoDash/issues/1877)). Con KMS no funcionan.

### 7.6 Retención de imagen

Ver 6.6. La wiki pide un salvapantallas y excluye la postimagen de la garantía. Para una interfaz de máquina, el riesgo está en la pantalla de reposo (texto fijo, QR, logotipo siempre en el mismo sitio).

### 7.7 Vida de la retroiluminación

Ver 6.6. A brillo alto y 24/7, entre 2 y 3 años hasta la mitad del brillo (cálculo mío con cifras de otros módulos). No hay dato de este modelo.

### 7.8 Píxeles muertos

La wiki de 52Pi admite que puede haber píxeles muertos rojos, verdes o azules y dice que no afectan al funcionamiento. Es decir, **el fabricante no los considera defecto**. Revisa la pantalla con colores sólidos nada más recibirla y devuélvela dentro del plazo de Amazon si hay alguno visible.

### 7.9 Pantalla azul sin señal

Ver 6.3. Para salir de dudas: quitar el HDMI, ver qué hace la pantalla a los 10 s y al minuto, y medir la corriente.

### 7.10 Temporización 1024×600 en Pi 4

El hilo [raspberrypi/linux#4719](https://github.com/raspberrypi/linux/issues/4719) (Waveshare 7" y 5" en una Pi 4B con Bullseye): pantalla en negro con KMS. Un mantenedor atribuye el fallo a tiempos horizontales no divisibles por 2 que la serie 4 no admite; el hilo no se cerró con un arreglo oficial. Soluciones de usuarios: `video=HDMI-A-2:1024x600@59` y `dtparam=i2c_vc_baudrate=50000` (esta última, según un usuario con una Pi 3B+ y la pantalla táctil oficial; a mí no me parece relacionada con el HDMI). **No aplica a la Pi 3B+** según la restricción de la serie 4 (apartado 6.2), pero es el sitio donde mirar si hubiera pantalla negra.

### 7.11 Lotes y marcas

- **Mismo panel, distinta marca.** Los módulos de 7" y 1024×600 de Waveshare, Elecrow y Displaytech comparten el área activa de 154,21 × 85,92 mm, y Displaytech vende un panel con el mismo contorno de 164,9 × 100 mm. Es plausible que haya paneles iguales bajo marcas distintas, pero **no tengo una fuente que lo diga de GeeekPi/52Pi**. No he mirado Eyoyo ni ROADOM.
- **Variación entre lotes:** no he encontrado datos. La wiki de 52Pi tiene dos listas de contenido distintas, que pueden venir de texto copiado de otras variantes; no sé si el producto ha cambiado. **Anota el lote y compra de una vez las que necesites** (sugerencia mía).

### 7.12 Certificados

No he encontrado declaración de conformidad (CE), RoHS ni informes de ensayo de este modelo. Va a 5 V, así que no toca los 230 V, pero la máquina completa necesita su evaluación de compatibilidad electromagnética y la pantalla forma parte de ella. Pídele la declaración al vendedor. (Normativa general: sin verificar el texto legal; ya la recoge la guía en §9.)

### 7.13 Disponibilidad

- No hay compromiso de producción. La wiki no cambia desde el 9-11-2023.
- Precios fuera de Amazon: 42,49 $ en la [tienda de 52Pi](https://52pi.com/products/7-inch-800-480-capacitive-touch-display-screen-monitor-for-raspberry-pi.json), 48,99 $ en [Oz Robotics](https://ozrobotics.com/shop/7-inch-portable-screen-for-raspberry-pi-windows-pc-no-touch/), 94,95 AU$ con IVA en [Core Electronics](https://core-electronics.com.au/52pi-7-inch-display-hdmi-for-pi-and-windows.html.plain.md). El precio de la hoja (45,99 €) está en ese orden.
- Comparación: la Pi Touch Display 2 se compromete a producción hasta enero de 2030 ([página del producto](https://www.raspberrypi.com/products/touch-display-2/)).

## 8. Alternativas

Solo hay motivo si el modelo resulta débil: faltan datos esenciales, no hay plano ni compromiso de producción. Para un prototipo vale; para una serie, conviene decidir antes de fabricar.

| | GeeekPi 7" (esta) | Raspberry Pi Touch Display 2, 7" | Waveshare 7" HDMI LCD (C) |
|---|---|---|---|
| Interfaz | HDMI | DSI (cinta) + 5 V por GPIO | HDMI + USB (táctil) |
| Resolución | 1024×600 | 720×1280 (vertical nativa) | 1024×600 |
| Brillo | Sin verificar | 500 cd/m² | 300 cd/m² |
| Consumo | Sin verificar | 2,4 W | 2,5 W |
| Temperatura | Sin verificar | −20 a 70 °C | 0 a 60 °C |
| Vida retroiluminación | Sin verificar | 20.000 h (L50) | No publicada |
| Plano / CAD | No | STEP de 7" ([RP-009154-DD-3](https://pip-assets.raspberrypi.com/categories/1083-raspberry-pi-touch-display-2/documents/RP-009154-DD-3-raspberry-pi-touch-display-2-step-7inch.zip)) | Dibujos (7inch_cad.zip, citado en su wiki; no lo he abierto) |
| Producción | Sin compromiso | Hasta enero de 2030 | Sin verificar |
| Precio | 45,99 € (hoja) | 60 $ de lista | Sin verificar |
| Fuente | [wiki](https://wiki.52pi.com/index.php/EP-0170) | [brief](https://pip-assets.raspberrypi.com/categories/1083-raspberry-pi-touch-display-2/documents/RP-010429-MM-3-touch-display-2-7-inch-product-brief.pdf) ([copia local](datasheets/RP-010429-MM-3-touch-display-2-7-inch-product-brief.pdf)), [página](https://www.raspberrypi.com/products/touch-display-2/) | [wiki](https://waveshare.com/wiki/7inch_HDMI_LCD_(C)) |

**Raspberry Pi Touch Display 2 (7")**

- Compatible con Raspberry Pi B+ y posteriores, así que con la 3B+ ([documentación](https://github.com/raspberrypi/documentation/blob/master/documentation/asciidoc/accessories/touch-display-2/about.adoc)).
- Contorno 120 × 189,5 mm (15 mm de fondo), área visible 88 × 155,5 mm, activa 87 × 154,5 mm (misma documentación). En apaisado, el área visible entra en la ventana de 176 × 116 mm y el módulo (189,5 × 120 mm) es mayor que la ventana, así que quedaría sujeto por detrás del panel. Falta comprobar el espacio detrás.
- Ventajas: ficha completa, STEP, temperatura de −20 a 70 °C, 500 cd/m², producción hasta 2030, y libera el puerto HDMI.
- Inconvenientes:
  - Panel de 720×1280 en vertical: la interfaz tendría que rehacerse para apaisado con `video=DSI-1:720x1280@60,rotate=…` ([documentación](https://github.com/raspberrypi/documentation/blob/master/documentation/asciidoc/accessories/touch-display-2/about.adoc)).
  - La página oficial describe el 7" como "LCD TFT" (solo el 10" es IPS); el brief da 85° de ángulo de visión ([página](https://www.raspberrypi.com/products/touch-display-2/), [brief](https://pip-assets.raspberrypi.com/categories/1083-raspberry-pi-touch-display-2/documents/RP-010429-MM-3-touch-display-2-7-inch-product-brief.pdf) ([copia local](datasheets/RP-010429-MM-3-touch-display-2-7-inch-product-brief.pdf))). No he comparado este valor con el "89°" de 52Pi: no sé si usan la misma definición.
  - Se alimenta desde los pines GPIO de la Pi: unos 0,45 A más (5 V a 450 mA según el brief) en la alimentación de la Pi; hay que revisar la subtensión.
  - Cambia el cableado y la guía.

**Waveshare 7" HDMI LCD (C):** pantalla HDMI de 1024×600 con tolerancia de tensión, consumo y temperatura publicados y dibujos mecánicos. Es táctil (se puede ignorar). Mismo tipo de ajuste que la GeeekPi, sin tocar la interfaz. No he comprobado disponibilidad ni precio en Amazon.es.

Elecrow y LCDwiki (7inch HDMI Display H) tienen wikis con menos datos que Waveshare (no dan ni temperatura ni tolerancia de tensión); no los veo mejores que esta.

## 9. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Pide a 52Pi/GeeekPi por escrito**: consumo máximo y pico de arranque, rango de tensión de entrada, temperatura de trabajo, brillo en cd/m², vida de la retroiluminación, plano de la placa con agujeros, si el brillo y el estado se guardan tras un corte, y la declaración de conformidad.
2. **Al recibirla** (pruebas de aceptación; hazlas dentro del plazo de devolución de Amazon):
   1. Revisar contenido de la caja (¿cable A→C o C→C?, ¿cable USB Pi–pantalla?) y confirmar que no es táctil. Fotografiar caja y placa y anotar códigos.
   2. Revisar pantalla con colores sólidos (blanco, negro, rojo, verde, azul): píxeles muertos, manchas, fugas de luz en los bordes.
   3. Medir con calibre: contorno, posición del área activa respecto al contorno, y agujeros de los soportes.
   4. Alimentar con una fuente de laboratorio o con un medidor USB y anotar la corriente en el arranque, a brillo máximo, a brillo mínimo y en reposo. Probar entre 4,75 y 5,25 V. **No subas de 5,25 V** a ciegas.
   5. Medir la tensión **en el conector USB-C de la pantalla** con la máquina montada y al arrancar (osciloscopio si hay).
   6. Medir el brillo: luxómetro pegado al centro de la pantalla en blanco; L ≈ E/π (aproximado).
   7. **Corte de luz:** fijar un brillo medio en el OSD, cortar la tensión y volver a dar. Repetir con la pantalla apagada con la palanca. Anotar si arranca sola y si recuerda el brillo.
   8. **Sin señal:** quitar el HDMI y ver qué hace a los 10 s y al minuto (pantalla azul con luz o reposo) y cuánto consume.
   9. En la Pi: guardar el EDID, ver `modes`, comprobar `/proc/cmdline` y probar `ddcutil detect`.
   10. Arrancar 20 veces cortando la luz de golpe y comprobar que siempre hay imagen.
3. **Configuración:** mantener la línea `video=` en `cmdline.txt` y valorar la `D` (apartado 6.2). No usar `hdmi_*`. Dejar anotado el EDID y la versión de imagen.
4. **Brillo y OSD:** fijar brillo (bien por debajo del máximo para alargar la vida), relación de pantalla y nitidez antes de cerrar, y comprobar que sobreviven a un corte.
5. **Guía de montaje:** cambiar el pico de la pantalla a 1 A, quitar "la pantalla admite 5,25 V" o marcarlo como tomado de Waveshare, y anotar "no conectar el cable USB Pi–pantalla". Medir la caída del cable USB-A→USB-C.
6. **Rama de la pantalla:** valorar un fusible o PTC propio, por si hay un cortocircuito en el cable o el conector.
7. **Interfaz:** que la pantalla de reposo se mueva (animación o desplazamiento del QR y del texto) y no deje elementos fijos siempre en el mismo píxel. Si se consigue apagar la retroiluminación en inactividad, mejor.
8. **Carcasa:** máscara opaca negra en el policarbonato con abertura según el área activa medida, y reflejos: probar policarbonato mate o antirreflejo con la pantalla encendida.
9. **Repuestos:** comprar el lote de una vez y tener una pantalla de repuesto por tanda de máquinas. Si el modelo no pasa las pruebas, o si 52Pi no responde, pasar a la Pi Touch Display 2 (con rediseño de interfaz) o a la Waveshare 7" C.

## 10. Lo que no he podido verificar

- **El anuncio de Amazon.es** (título, contenido de la caja, vendedor, reseñas): Amazon bloquea mi acceso. Solo he visto los títulos que muestran los buscadores para Amazon.nl y Amazon.fr.
- **Que B0CHMBCCJB sea EP-0170** y que GeeekPi sea la marca de Amazon de 52Pi.
- **Consumo real, pico de arranque, rango de tensión y si el USB-C necesita algo especial** (resistencias en CC): ninguna fuente.
- **Brillo real, contraste, temperatura de trabajo y vida de la retroiluminación** de este modelo.
- **Cotas de la placa, área activa y agujeros.** Las páginas de DeskPi (modelos 3D) no me dieron más que el título.
- **EDID de la pantalla** y cómo arranca con `video=…M@60D`.
- **Si el brillo del OSD se guarda y si la pantalla arranca sola tras un corte**; **si admite DDC/CI**; **qué hace sin señal**.
- **Reseñas técnicas, issues y hilos de foro de esta pantalla:** no he encontrado ninguno. Se me agotó el presupuesto de búsquedas web de la sesión, así que no pude hacer las últimas búsquedas (problemas de GeeekPi/52Pi, caída de tensión de pantallas baratas de 7"). Se pueden retomar en otro mensaje.
- **Variación entre lotes y marcas con el mismo panel:** sin datos de GeeekPi/52Pi, Eyoyo ni ROADOM.
- **Interacción de `video=` con el modo que pasa el firmware** en una Pi 3B+.
- **Certificados** (CE, RoHS) del producto.
- **Las cifras de la Pi Touch Display 2** las leí con una herramienta que resume el PDF; sin contrastar con el original.
- **Si la alimentación de la Pi 3B+ (latiguillo micro-USB) aguanta la carga extra** de la Touch Display 2, en caso de cambiar de pantalla.

## 11. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos) y carpeta [`datasheets/`](datasheets/).

Todos los enlaces, ordenados por tipo, en [`enlaces.md`](enlaces.md).
