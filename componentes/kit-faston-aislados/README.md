# Kit de terminales faston aislados (hembra y macho) de 2,8, 4,8 y 6,3 mm

Terminales de pala (faston) para dos usos. Los de 4,8 mm (hembra aislada) van crimpados en los puentes de 1,5 mm² del módulo C14 (#15) y en los terminales del interruptor: **son conexiones de 230 V**. Los de 2,8 mm van en el cable de señal del pulsador arcade (#11): **no es 230 V**. Los machos del kit no tienen sitio en el montaje de la guía (el módulo y el pulsador ya traen lengüeta) (mío).

- **Compra:** ASIN B0B4H54KPS, 10,99 € (precio de la hoja de componentes del 19-20/10/2026). Es la pieza nº 27 de la hoja.
- **Es una pieza de 230 V.** Léela entera antes de crimpar nada. Si no tienes experiencia con red, que un electricista revise este cableado.

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a las herramientas de lectura y no lo intenté: **no he visto el anuncio B0B4H54KPS**. El precio, el ASIN y lo que dice la hoja ("kit de terminales faston aislados de 2,8, 4,8 y 6,3 mm") son los de tu hoja y tu guía. Una búsqueda del ASIN no devolvió su anuncio; devolvió kits parecidos de otras tiendas, que no son esta pieza. **Esta pieza no tiene ficha del fabricante**: lo que sigue se apoya en catálogos de TE, Phoenix Contact, Klauke y Vogt, y en las normas (de pago, de las que solo pude leer resúmenes). Mi herramienta de lectura web devuelve resúmenes y no el original: donde una cifra importa, doy el enlace para que la compruebes.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales y normas](#3-documentos-oficiales-y-normas)
4. [Crimpado, retención y montaje](#4-crimpado-retención-y-montaje)
5. [Fallos, bugs y problemas conocidos](#5-fallos-bugs-y-problemas-conocidos)
6. [Qué comprobar al recibirlo](#6-qué-comprobar-al-recibirlo)
7. [Alternativas](#7-alternativas)
8. [Discrepancias con la guía de montaje y con mi planteamiento inicial](#8-discrepancias-con-la-guía-de-montaje-y-con-mi-planteamiento-inicial)
9. [Recomendaciones para el alcoholímetro](#9-recomendaciones-para-el-alcoholímetro)
10. [Lo que no he podido verificar](#10-lo-que-no-he-podido-verificar)
11. [Fuentes](#11-fuentes)

---

## 1. Resumen para el proyecto

- **El kit no publica lo que importa.** Los kits parecidos que vi no dan rango de sección por color, material, aislante, espesor de lengüeta ni tensión ([ejemplo: kit de 140 piezas de UncleWiener](https://unclewiener.com/products/150pcs-insulated-male-female-wire-connector-2-8mm-4-8mm-6-3mm-set-fs030150), que además cuenta 140 piezas y no 150). El anuncio de Amazon no lo he visto. Hay que **medir con calibre y probar el crimpado** antes de usarlo en 230 V ([apartado 6](#6-qué-comprobar-al-recibirlo)).
- **1,5 mm² flexible cae en el límite rojo/azul y los fabricantes no coinciden.** Klauke, Vogt, Cimco y TE ponen el rojo en 0,5-1,0 mm² (o 22-18 AWG) y el azul en 1,5-2,5 mm² (16-14 AWG). Phoenix Contact y la marca RND de Farnell ponen el rojo en 0,5-1,5 mm². Para un hilo de 1,5 mm² de 230 V, **el terminal correcto es el azul** (mío, con esas tablas); el rojo solo vale si el envase del kit dice "hasta 1,5 mm²" **y** el crimpado pasa la prueba de tirón ([apartado 2.3](#23-códigos-de-color-y-rangos-de-sección-por-fabricante)).
- **La crimpadora #28 (autoajustable, de punteras) probablemente no es la herramienta.** Knipex vende herramientas distintas para punteras (perfil hexagonal o cuadrado) y para terminales aislados (perfil "F" u oval, 3 posiciones, 0,5-6 mm²). Que una de punteras crimpe mal un faston aislado es **mi inferencia**; la comprobación es una prueba de tirón sobre 5 crimpados de prueba ([apartado 4.1](#41-herramienta-la-crimpadora-28)).
- **La hembra tiene que casar con la lengüeta en ancho y en espesor.** TE lo dice sin matices: la serie del receptáculo debe coincidir con el ancho y el espesor de la lengüeta ([TE](https://mouser.com/pdfdocs/TEConnectivityFASTONQuickReferenceGuide.pdf) ([copia local](datasheets/TEConnectivityFASTONQuickReferenceGuide.pdf))). Existen 0,5 y 0,8 mm de espesor y mi kit no dice cuál trae. El módulo C14 de la hoja probablemente trae 4,8 × 0,8 (ficha del C14, sin confirmar para tu módulo).
- **La corriente no es el problema; el contacto sí.** La máquina toma décimas de amperio de la red (guía §3 y ficha del C14). Los terminales de referencia aguantan entre 5 y 28 A según tamaño y hilo (apartado 2.4). Lo que puede fallar es un crimpado flojo o una hembra que se suelta, y **un faston suelto en la tierra no se nota**: la máquina sigue funcionando sin protección ([apartado 4.3](#43-retención-y-tirones)). Conviene **aislante de nylon (PA) y no de PVC**: el PVC se da para 70 °C (Klauke) y 75 °C (Vogt), con 60 °C en la tabla de carcasas de TE, los pines de un C14 se dimensionan a 70 °C y el PA llega a 105 °C ([apartado 2.4](#24-corriente-tensión-y-temperatura)).
- **Para el pulsador, un faston genérico "rojo" no sirve para un hilo de 22-24 AWG.** Vogt tiene hembras de 2,8 mm para 0,14-0,5 mm² (26-22 AWG); existen pares de hilos ya crimpados ([apartado 4.4](#44-cableado-del-proyecto)).

## 2. Especificaciones

### 2.1 Lo que dice tu hoja y tu guía (anuncio no visto)

| Característica | Valor | Fuente |
|---|---|---|
| Producto | Kit de terminales faston aislados de 2,8, 4,8 y 6,3 mm (hembra y macho) | Hoja de compra #27 |
| Uso | "Para la toma C14 y el pulsador" | Hoja de compra y guía §1 |
| Precio | 10,99 € | Hoja de compra |
| Número de piezas, colores, rango de sección, material, aislante, espesor de lengüeta, herramientas incluidas | **No constan** | Sin verificar |

### 2.2 Tamaños de lengüeta

| Ancho × espesor | En pulgadas | Dónde se ve | Fuente |
|---|---|---|---|
| 2,8 × 0,5 mm | .110 × .020 | TE (serie 110); pulsadores arcade de Adafruit y Sanwa son de 2,8 mm | [TE](https://mouser.com/pdfdocs/TEConnectivityFASTONQuickReferenceGuide.pdf) ([copia local](datasheets/TEConnectivityFASTONQuickReferenceGuide.pdf)), ficha del pulsador |
| 2,8 × 0,8 mm | .110 × .032 | Klauke 8201B, Vogt 389808, RND 465-00517 | [Bürklin](https://buerklin.com/en/p/klauke/flat-plugs/8201b/07F6765), [Vogt](https://docs.rs-online.com/8033/A700000011290009.pdf) ([copia local](datasheets/A700000011290009.pdf)), [Distrelec](https://docs.rs-online.com/f28c/A700000011111237.pdf) ([copia local](datasheets/A700000011111237.pdf)) |
| 4,8 × 0,5 mm | .187 × .020 | TE, Cimco, Klauke 8302B (según Bürklin) | [TE](https://mouser.com/pdfdocs/TEConnectivityFASTONQuickReferenceGuide.pdf) ([copia local](datasheets/TEConnectivityFASTONQuickReferenceGuide.pdf)), [Conrad](https://asset.conrad.com/media10/add/160267/c1/-/de/000737405DS01/tehnicni-podatki-737405-ploscati-tulec-sirina-63-mm-debelina-08-mm-180-delno-izoliran-modre-barve-cimco-180232-1-kos.pdf) ([copia local](datasheets/tehnicni-podatki-737405-ploscati-tulec-sirina-63-mm-debelina-08-mm-180-delno-izoliran-modre-barve-cimco-180232-1-kos.pdf)), [Bürklin](https://buerklin.com/en/p/klauke/flat-plugs/8302b/07F6769) |
| 4,8 × 0,8 mm | .187 × .032 | TE, Cimco, RND 465-00513. Es el de los módulos C14 genéricos y Schurter según la ficha del C14 | [TE](https://mouser.com/pdfdocs/TEConnectivityFASTONQuickReferenceGuide.pdf) ([copia local](datasheets/TEConnectivityFASTONQuickReferenceGuide.pdf)), [Distrelec](https://docs.rs-online.com/f28c/A700000011111237.pdf) ([copia local](datasheets/A700000011111237.pdf)) |
| 6,3 × 0,8 mm | .250 × .032 | Phoenix, Klauke, Cimco, TE | [Phoenix](https://www.phoenixcontact.com/de/produkte/3240538/pdf) |
| 9,5 × 1,2 mm | .375 × .047 | Cimco (amarillo, 4-6 mm²), TE. No está en este kit | [Conrad](https://asset.conrad.com/media10/add/160267/c1/-/de/000737405DS01/tehnicni-podatki-737405-ploscati-tulec-sirina-63-mm-debelina-08-mm-180-delno-izoliran-modre-barve-cimco-180232-1-kos.pdf) ([copia local](datasheets/tehnicni-podatki-737405-ploscati-tulec-sirina-63-mm-debelina-08-mm-180-delno-izoliran-modre-barve-cimco-180232-1-kos.pdf)) |

- Los cuatro anchos de IEC 61210 son 2,8, 4,8, 6,3 y 9,5 mm ([VDE Verlag](https://www.vde-verlag.de/iec-standards/217505/iec-61210-2010.html)). UL 310 añade 3,2 y 5,2 mm (.125 y .205) ([GlobalSpec](https://standards.globalspec.com/std/14548971/ul-310)). El espesor de la norma **no lo he podido leer**.
- **Contradicción entre tiendas, para el mismo Klauke:** Bürklin da el 8302B como 4,8 × 0,5 y Zählerschrank24 como 4,8 × 0,8 (y el 8303B como 4,8 × 0,5). No sé cuál tiene razón. Sirve de ejemplo de que el espesor se mide y no se supone ([Bürklin](https://buerklin.com/en/p/klauke/flat-plugs/8302b/07F6769), [Zählerschrank24](https://www.zaehlerschrank24.de/installationsmaterial/aderendhuelsen/flachstecker-pvc-isoliert/flachstecker.html)).
- TE marca el espesor de la lengüeta en el propio terminal, visible a través del aislante, en las series 110 y 187 de su gama Ultra-Fast Plus ([catálogo TE 82004, p. 93](https://www.farnell.com/datasheets/2686465.pdf)). Un kit genérico no tiene por qué hacerlo.

### 2.3 Códigos de color y rangos de sección por fabricante

El código de color depende del fabricante. Esto es lo que dicen las fichas que pude abrir. **Las divergencias están en negrita.**

| Fabricante y serie | Rojo | Azul | Amarillo | Aislante y temperatura | Fuente |
|---|---|---|---|---|---|
| TE Ultra-Fast (cat. 82004, pp. 91-92) | 22-18 AWG (violeta: 26-22 AWG) | 16-14 AWG | 12-10 AWG | Nylon 6/6, 105 °C | [TE 82004](https://docs.rs-online.com/1f29/A700000015454362.pdf) ([copia local](datasheets/A700000015454362.pdf)) |
| TE PIDG FASTON (cat. 82004, pp. 99-103) | 22-18 AWG (en una lectura previa de la misma página apareció **22-16 AWG** para un grupo de piezas reconocidas UL; las tablas salen desordenadas, confírmalo en el PDF) | 16-14 AWG (verde: 14-12) | 12-10 AWG | Nylon, 105 °C, 300 V máx. La línea económica ("Budget Line") es **PVC UL 94 V-0**, rojo 22-18 y azul 16-14, **sin temperatura declarada** | [TE 82004](https://docs.rs-online.com/1f29/A700000015454362.pdf) ([copia local](datasheets/A700000015454362.pdf)) |
| TE .187 rojo, 2-520275-2 (RS) | 0,3-0,8 mm² (22-18 AWG) en la tabla del producto; **la tabla de colores de la serie dice 0,25-1,6 mm²** | | | Nylon | [RS](https://uk.rs-online.com/web/p/crimp-receptacles/7820735) |
| Klauke 8201B / 8302B (Bürklin) | 0,5-1,0 mm² (AWG 20-17) | 1,5-2,5 mm² (AWG 16-14) | 4-6 mm² (850, según Zählerschrank24) | 8201B: **PVC, hasta 70 °C**. 8302B: PA, 105 °C | [Bürklin 8201B](https://buerklin.com/en/p/klauke/flat-plugs/8201b/07F6765), [8302B](https://buerklin.com/en/p/klauke/flat-plugs/8302b/07F6769) |
| Vogt (ficha) | 0,5-1 mm² (22-18 AWG) y **0,14-0,5 mm² (26-22 AWG)** en la serie de 2,8 mm | 1,5-2,5 mm² (16-14 AWG) | 4-6 mm² (12-10 AWG) | PVC −10 a +75 °C. PA −55 a +105 °C. Los colores no constan en la ficha | [Vogt](https://docs.rs-online.com/8033/A700000011290009.pdf) ([copia local](datasheets/A700000011290009.pdf)), [Vogt 3945](https://cdn.soselectronic.com/productdata/4c/16/27acd06b/3945.pdf) ([copia local](datasheets/3945.pdf)) |
| Phoenix Contact C-SCFFI / C-SCMI | **0,5-1,5 mm²** (C-SCFFI 1,5/6,3×0,8, art. 3240538) | 1,5-2,5 mm² (C-SCMI 2,5/6,3×0,8, art. 3240059) | No abierto | PA, 105 °C. Pelado máximo: 7 mm (rojo), 8 mm (azul) | [3240538](https://www.phoenixcontact.com/de/produkte/3240538/pdf), [3240059](https://docs.rs-online.com/ab4d/0900766b812c0b94.pdf) ([copia local](datasheets/0900766b812c0b94.pdf)) |
| Cimco (Conrad) | 0,5-1 mm² | 1,5-2,5 mm² | 4-6 mm² | PA, −60 a +105 °C. DIN 46245 partes 1-3 | [Conrad](https://asset.conrad.com/media10/add/160267/c1/-/de/000737405DS01/tehnicni-podatki-737405-ploscati-tulec-sirina-63-mm-debelina-08-mm-180-delno-izoliran-modre-barve-cimco-180232-1-kos.pdf) ([copia local](datasheets/tehnicni-podatki-737405-ploscati-tulec-sirina-63-mm-debelina-08-mm-180-delno-izoliran-modre-barve-cimco-180232-1-kos.pdf)) |
| RND 465 (Farnell/Distrelec) | **0,5-1,5 mm²** (2,8 × 0,5, 2,8 × 0,8, 4,8 × 0,8 y 6,3 × 0,8) | 1,5-2,5 mm² (4,8 × 0,8 y 6,3 × 0,8) | 4-6 mm² | Nylon, 105 °C. UL E502428 | [Distrelec](https://docs.rs-online.com/f28c/A700000011111237.pdf) ([copia local](datasheets/A700000011111237.pdf)), [RS](https://de.rs-online.com/web/p/flachsteckhulse/2833086) |
| HellermannTyton | **Sin verificar**: no encontré su ficha | | | | |
| El kit B0B4H54KPS | **Sin verificar** | | | | |

Los números de página son los que dio mi herramienta de lectura sobre el PDF de TE y no coinciden del todo entre lecturas (el código de colores sale en la p. 91 o 92 según la lectura, y las tablas salen desordenadas). Abre el PDF para confirmar cada cifra.

**Qué implica para un hilo de 1,5 mm² (cálculo y deducción míos)**

- 1,5 mm² equivale a unos **15,4 AWG**: entre el 16 AWG (1,31 mm²) y el 14 AWG (2,08 mm²). Cae justo entre el rango final del rojo y el inicio del azul.
- Con el rojo de Klauke, Vogt, Cimco y TE Ultra-Fast, 1,5 mm² queda **fuera** (0,5-1,0 mm² o 22-18 AWG). Con el rojo de Phoenix y RND queda **dentro** (0,5-1,5 mm²). El azul de todos incluye 1,5 mm².
- 1,5 mm² está en el **límite inferior** del azul y en el **límite superior** del rojo de Phoenix y RND. **Con ninguno de los dos hay margen por el otro lado**: lo decide la prueba de tirón, no la etiqueta.
- La guía ya usa ojales M4 "para 0,5-1,5 mm²" (#23). Es el mismo convenio que Phoenix y RND (rojo hasta 1,5), lo cual es compatible con que el kit #27 tenga un rojo de 0,5-1,5 mm². Es una coincidencia plausible, no una prueba.
- **Diámetro del aislante del hilo:** el H05VV-F 3G1,5 (#22) mide 9,8 mm de diámetro exterior como máximo ([Nexans](https://www.nexans.fr/en/products/Building/Residential/Flexibles-wires/H05VV-F-536932484/product~10264568~.html)); la página no da el diámetro de cada hilo. Mide con calibre el de tus hilos (esperable unos 3 mm: estimación mía sin fuente) y compáralo con el rango de aislante del terminal. Los terminales azules de TE de 16-14 AWG de la gama Ultra-Fast Plus admiten 2,29-4,06 mm ([TE 82004, p. 94](https://www.farnell.com/datasheets/2686465.pdf)).

### 2.4 Corriente, tensión y temperatura

| Dato | Valor | Fuente y condición |
|---|---|---|
| Corriente máxima, 2,8 mm | **14 A** con hilo de 1,5 mm² | [TE, guía rápida](https://mouser.com/pdfdocs/TEConnectivityFASTONQuickReferenceGuide.pdf) ([copia local](datasheets/TEConnectivityFASTONQuickReferenceGuide.pdf)), "Current Carrying Capacity" |
| Corriente máxima, 4,8/5,2 mm | **20 A** con 2,5 mm² | Igual |
| Corriente máxima, 6,3 mm | **28 A** con 4 o 6 mm² | Igual |
| Corriente en ensayo de calentamiento, aislado Ultra-Fast, lengüeta .110 (2,8 mm) | 2 A (22 AWG), 3 A (20), 4 A (18), **5 A (16)**, **8 A (14)**, con subida máxima de 20 °C (UL 310) | [TE 108-2043 Rev D](https://www.farnell.com/datasheets/2672036.pdf) ([copia local](datasheets/2672036.pdf)) |
| Ídem, lengüetas .187/.205/.250 (4,8-6,3 mm) | 3 A (22), 4 A (20), 7 A (18), **10 A (16)**, **15 A (14)**, 20 A (12), 24 A (10) | Igual |
| Corriente máxima por sección (Vogt, tira PVC o PA) | 10 A (0,5-1,0 mm²), **15 A (1,5-2,5 mm²)**, 25 A (4-6 mm²) | [Vogt](https://docs.rs-online.com/8033/A700000011290009.pdf) ([copia local](datasheets/A700000011290009.pdf)) |
| Algunas piezas TE reconocidas UL | Limitadas a **8 A** como máximo | [TE 82004, p. 92, nota 2](https://docs.rs-online.com/1f29/A700000015454362.pdf) ([copia local](datasheets/A700000015454362.pdf)) |
| Tensión TE | 600 V CA (Ultra-Fast); 300 V máx. (PIDG FASTON); 1000 V (señales y luminarias, Ultra-Fast) | [TE 108-2043](https://www.farnell.com/datasheets/2672036.pdf) ([copia local](datasheets/2672036.pdf)), [TE 82004](https://docs.rs-online.com/1f29/A700000015454362.pdf) ([copia local](datasheets/A700000015454362.pdf)) |
| Tensión IEC 61210 | Hasta 1000 V CA y 1500 V CC | [VDE Verlag](https://www.vde-verlag.de/iec-standards/217505/iec-61210-2010.html) |
| Tensión Klauke, Vogt, Phoenix, Cimco, RND | **No consta** en lo que leí | — |
| Temperatura del aislante | PA/nylon 105 °C (TE, Klauke 8302B, Phoenix, Vogt, Cimco, RND). **PVC: 70 °C (Klauke 8201B), 75 °C (Vogt)**. La guía de TE da 60 °C para PVC en carcasas | Fichas arriba; [TE, guía rápida](https://mouser.com/pdfdocs/TEConnectivityFASTONQuickReferenceGuide.pdf) ([copia local](datasheets/TEConnectivityFASTONQuickReferenceGuide.pdf)) |
| Temperatura según el recubrimiento del terminal | Estañado: 110 °C. Sin recubrir: 90 °C. TE dice que la temperatura admisible de la conexión es la ambiente más la subida del terminal | Igual |
| Pines C14 | 70 °C máximo | Ficha del C14, [IEC 60320 en Wikipedia](https://en.wikipedia.org/wiki/IEC_60320) |

**Lo que estas cifras dicen del "10 A / 16 A / 20-25 A" de mi planteamiento inicial.** Las cifras dependen de la fuente y del hilo: el 2,8 mm va de 5 A (16 AWG, ensayo con subida de 20 °C) a 14 A (1,5 mm²) en TE. El 4,8 mm, de 10 A (16 AWG) a 20 A (2,5 mm²). El 6,3 mm llega a 28 A con 4-6 mm². Los valores de mi planteamiento inicial (10, 16 y 20-25 A) caen dentro del abanico, pero **ninguna fuente que leí los da tal cual**, y ninguno es del kit (que no los publica).

**Cálculo propio de la carga.** La guía da unos 14 W de red en régimen típico y 26 W en el pico de 5 V (§3). Con la eficiencia del 83 % y suponiendo factor de potencia 1, el pico son unos 31 W en la red, es decir 0,14 A a 230 V. Aunque el factor de potencia real sea bajo, hablamos de décimas de amperio. El pico de arranque de 45 A de la LRS-50-5 (guía §2.6; ficha #14) dura milisegundos. Una resistencia de contacto de 1 Ω con 0,15 A disipa unos 22 mW. **La corriente nominal del terminal no limita este diseño.** Lo que importa es que el contacto no se afloje ni se suelte.

### 2.5 Qué terminal corresponde a cada hilo de la guía

| Hilo (guía §5.1 y §5.3) | Sección | Terminal que propongo (mío) | Condición |
|---|---|---|---|
| Marrón y azul del C14 al interruptor, y del interruptor a la fuente | 1,5 mm² flexible | Hembra aislada **azul** (1,5-2,5 mm²), 4,8 × 0,8 si el módulo es 4,8 × 0,8, de **PA** | Aprobar la prueba de tirón (apartado 4.2) |
| Verde-amarillo del pin de tierra del C14 | 1,5 mm² flexible | Igual, más largo que L y N | Mejor con retención o soldado (apartado 4.3) |
| Pulsador al pin de la Pi | 0,14-0,34 mm² (26-22 AWG, según el hilo) | Hembra de 2,8 mm para 0,14-0,5 mm², **no la roja genérica** | Apartado 4.4 |

## 3. Documentos oficiales y normas

No hay documento del fabricante del kit. Las normas son de pago: solo leí resúmenes y vistas previas.

### 3.1 Normas

| Norma | Tema | Qué he podido leer | Enlace |
|---|---|---|---|
| **IEC 61210:2010** (EN 61210) | Terminaciones planas de conexión rápida para conductores de cobre: requisitos de seguridad | Solo el alcance (VDE Verlag y GlobalSpec): lengüetas de 2,8, 4,8, 6,3 y 9,5 mm con detente de agujero o de hendidura; conductores de cobre flexibles o rígidos hasta 6 mm² (macizos hasta 2,5 mm²); hasta 1000 V CA y 1500 V CC. Segunda edición, sustituye a la de 1993. El resumen dice que cubre las terminaciones **sin aislar**. **No leí dimensiones, espesores ni ensayos** | [VDE Verlag](https://www.vde-verlag.de/iec-standards/217505/iec-61210-2010.html), [GlobalSpec](https://standards.globalspec.com/std/1275144/iec-61210) |
| **UL 310** | Terminales eléctricos de conexión rápida | Solo el alcance (GlobalSpec): anchos 2,8, 3,2, 4,8, 5,2 y 6,3 mm; uno o dos conductores de cobre de 26-10 AWG; cableado interno y terminación de campo; ed. 2014 con entrada posterior de 30-11-2023, estado activa. **No leí los ensayos**. TE los cita: subida máxima de 20 °C en el ensayo de calentamiento ([TE 108-2043](https://www.farnell.com/datasheets/2672036.pdf) ([copia local](datasheets/2672036.pdf))) | [GlobalSpec](https://standards.globalspec.com/std/14548971/ul-310) |
| **UL 486A-B** | Conectores de hilo y terminales: tracción | Valores de tracción **por fuentes secundarias** (Cirris, Checkline). **No leí la norma** | [Cirris](https://cirris.com/crimp-pull-testers-pullout-force-per-wire-size/), [Checkline](https://www.checkline.com/res/products/126307/wire_pull_test_standards.pdf) ([copia local](datasheets/wire_pull_test_standards.pdf)) |
| **IEC 60352-2** (EN 60352-2:2006 + A1:2013, sustituida por **EN IEC 60352-2:2024** desde el 16-12-2024) | Conexiones crimpadas sin soldar | Alcance (EVS): hilos trenzados de 0,05 a 10 mm² y barriles preaislados. **No pude abrir la vista previa del VDE** (el sitio rechazó la herramienta) y no conozco sus valores de tracción | [EVS](https://www.evs.ee/en/evs-en-60352-2-2006) |
| **DIN 46245** (partes 1-3) | Hembras con aislamiento (nombre que dan Vogt y Cimco) | Solo como referencia de catálogo | [Vogt](https://docs.rs-online.com/8033/A700000011290009.pdf) ([copia local](datasheets/A700000011290009.pdf)), [Conrad](https://asset.conrad.com/media10/add/160267/c1/-/de/000737405DS01/tehnicni-podatki-737405-ploscati-tulec-sirina-63-mm-debelina-08-mm-180-delno-izoliran-modre-barve-cimco-180232-1-kos.pdf) ([copia local](datasheets/tehnicni-podatki-737405-ploscati-tulec-sirina-63-mm-debelina-08-mm-180-delno-izoliran-modre-barve-cimco-180232-1-kos.pdf)) |
| **DIN 46247** parte 1 | Hembras sin aislamiento | Solo como referencia de catálogo (Hilpress) | [Hilpress](https://www.hilpress.com/kabelschuhe-mit-isolation/flachsteckhuelsen/pvc-standard-ausfuehrung) |
| **DIN 46244** | En una ficha de Hilpress figura como norma de la **lengüeta** (Flachstecker 2,8 × 0,8 sin aislar), no de la hembra | Solo como referencia de catálogo | [Hilpress](https://www.hilpress.com/product-datasheet/9ba5ab8c4969450ca61286e6d5017c77/create) |
| **DIN 46342-1** | Lengüetas con agujero de fijación. Borrador de 1981 retirado | Solo el título | [DIN](https://www.din.de/en/getting-involved/standards-committees/dke/drafts/wdc-beuth:din21:2355750) |
| **DIN 46340 y DIN 46341** | — | **No encontré fuente**: no sé qué cubren | — |
| **EN 60335-1 / EN IEC 60335-2-82** | Seguridad de la máquina | **No leí ninguna cláusula** sobre terminales, cableado interno, tierra o acceso a partes vivas | Ficha del C14 |

### 3.2 Fichas y catálogos de fabricante

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| TE, FASTON Terminals (Insulated and Uninsulated), catálogo | 82004, rev. 3-11 | PDF | [RS](https://docs.rs-online.com/1f29/A700000015454362.pdf) ([copia local](datasheets/A700000015454362.pdf)) |
| TE, copia del catálogo (Ultra-Fast Plus, pp. 93-94) | 82004 | PDF | [Farnell](https://www.farnell.com/datasheets/2686465.pdf) |
| TE, especificación de producto Ultra-Fast aislado | 108-2043 Rev D, 11-03-2011 | PDF | [Farnell](https://www.farnell.com/datasheets/2672036.pdf) ([copia local](datasheets/2672036.pdf)) |
| TE, guía rápida FASTON | — | PDF | [Mouser](https://mouser.com/pdfdocs/TEConnectivityFASTONQuickReferenceGuide.pdf) ([copia local](datasheets/TEConnectivityFASTONQuickReferenceGuide.pdf)) |
| TE, página de la marca (receptáculos y lengüetas) | — | Web | [te.com](https://www.te.com/en/products/brands/faston/faston-receptacles-and-tabs.html) |
| Phoenix Contact C-SCFFI 1,5/6,3×0,8, art. 3240538 | — | Web/PDF | [Phoenix](https://www.phoenixcontact.com/de/produkte/3240538/pdf) |
| Phoenix Contact C-SCMI 2,5/6,3×0,8, art. 3240059 | — | PDF | [RS](https://docs.rs-online.com/ab4d/0900766b812c0b94.pdf) ([copia local](datasheets/0900766b812c0b94.pdf)) |
| Klauke 8201B (2,8 × 0,8, rojo) y 8302B (azul) | 07F6765 / 07F6769 | Web | [Bürklin 8201B](https://buerklin.com/en/p/klauke/flat-plugs/8201b/07F6765), [8302B](https://buerklin.com/en/p/klauke/flat-plugs/8302b/07F6769) |
| Vogt, receptáculos aislados de 2,8 mm (DIN 46245/1) | UL E235796 | PDF | [RS](https://docs.rs-online.com/8033/A700000011290009.pdf) ([copia local](datasheets/A700000011290009.pdf)) |
| Vogt, receptáculos aislados 6,3 × 0,8 | series 39xx | PDF | [SOS](https://cdn.soselectronic.com/productdata/4c/16/27acd06b/3945.pdf) ([copia local](datasheets/3945.pdf)) |
| RND 465 (Farnell), receptáculos aislados | UL E502428 | PDF | [Distrelec](https://docs.rs-online.com/f28c/A700000011111237.pdf) ([copia local](datasheets/A700000011111237.pdf)) |
| Cimco 180232 (Conrad), receptáculos aislados | — | PDF | [Conrad](https://asset.conrad.com/media10/add/160267/c1/-/de/000737405DS01/tehnicni-podatki-737405-ploscati-tulec-sirina-63-mm-debelina-08-mm-180-delno-izoliran-modre-barve-cimco-180232-1-kos.pdf) ([copia local](datasheets/tehnicni-podatki-737405-ploscati-tulec-sirina-63-mm-debelina-08-mm-180-delno-izoliran-modre-barve-cimco-180232-1-kos.pdf)) |
| Knipex 97 52 (terminales aislados) y 97 53 (punteras) | — | Web | [Rapid](https://www.rapidonline.com/catalogue/product/50-4513), [Knipex](https://www.knipex-tools.com/products/crimping-pliers/knipex-preciforce/knipex-preciforce-crimping-pliers-insulated-terminals-plug-connectors-and-butt-connectors/975235), [ITS](https://its.co.uk/pd/knipex-self-adjusting-hexagonal-wire-ferrules-crimping-pliers-180mm-_kni975314.htm) |

No pude abrir los dibujos de cliente de TE (el sitio rechaza la herramienta) ni la hoja de aplicación de TE que cita la especificación 108-2043 (**114-2123**). Esa hoja sería la fuente de pelado e inspección de crimpado de TE.

### 3.3 Qué dicen los más relevantes

- **TE 108-2043** (aislado Ultra-Fast, ensayo con UL 310 y CSA C22.2 nº 153): 105 °C, 600 V CA, rigidez de 3400 V CA durante 1 minuto. Tracción de crimpado mínima: 4 lbf (26 AWG), 6 (24), 10 (22), 16 (20), 20 (18), 30 (16), 60 (14), 70 (12), 80 lbf (10), con tirón gradual de 1 pulgada por minuto y 1 minuto de espera. No incluye ensayo de vibración en la lista que leí. Fuente: [Farnell](https://www.farnell.com/datasheets/2672036.pdf) ([copia local](datasheets/2672036.pdf)). Es un terminal de nylon de la gama Ultra-Fast de TE: **no es el kit**.
- **TE, guía rápida:** los receptáculos Positive Lock se enclavan sobre lengüetas con agujero y solo se sueltan hundiendo un pulsador integrado. En la tabla de la guía todos son de 6,35 × 0,81 mm. Dice que las series deben coincidir en ancho y espesor, y que las dimensiones de crimpado están controladas con precisión ([TE](https://mouser.com/pdfdocs/TEConnectivityFASTONQuickReferenceGuide.pdf) ([copia local](datasheets/TEConnectivityFASTONQuickReferenceGuide.pdf))).
- **TE 82004:** dice que la tracción de un crimpado PIDG FASTON se acerca a la del propio hilo, y marca algunas piezas como no aprobadas por UL ni CSA ([TE 82004](https://docs.rs-online.com/1f29/A700000015454362.pdf) ([copia local](datasheets/A700000015454362.pdf))). La aprobación depende del número de pieza, incluso dentro de TE.
- **Phoenix:** de su azul C-SCMI dice que la zona de crimpado va soldada con aporte para la máxima fuerza de arrancamiento ([3240059](https://docs.rs-online.com/ab4d/0900766b812c0b94.pdf) ([copia local](datasheets/0900766b812c0b94.pdf))). El pelado máximo es de 7 mm (rojo) u 8 mm (azul) ([3240538](https://www.phoenixcontact.com/de/produkte/3240538/pdf)). La página del rojo dice que está pensado para herramientas CRIMPFOX "RCI" (el nombre del modelo salió cortado en lo que leí).
- **Klauke 8201B:** hembra de 2,8 × 0,8, latón estañado, **funda de PVC hasta 70 °C**, sección 0,5-1,0 mm² (AWG 20-17) ([Bürklin](https://buerklin.com/en/p/klauke/flat-plugs/8201b/07F6765)).
- **Vogt:** la misma gama existe en PVC (−10 a +75 °C) y en PA (−55 a +105 °C); en 2,8 mm hay un rango de **0,14-0,5 mm² (26-22 AWG)** con terminal propio ([Vogt](https://docs.rs-online.com/8033/A700000011290009.pdf) ([copia local](datasheets/A700000011290009.pdf))).

## 4. Crimpado, retención y montaje

### 4.1 Herramienta: la crimpadora #28

- **Lo que dicen los fabricantes de la herramienta.** Knipex ofrece, para punteras, una pinza autoajustable de perfil hexagonal o cuadrado de 0,08-16 mm² ([ITS](https://its.co.uk/pd/knipex-self-adjusting-hexagonal-wire-ferrules-crimping-pliers-180mm-_kni975314.htm); la página se contradice entre "hexagonal" y "cuadrado"). Para terminales aislados ofrece otra, de perfil "F" u "oval" con 3 posiciones, de 0,5-6 mm² (AWG 20-10) ([Rapid](https://www.rapidonline.com/catalogue/product/50-4513), [Knipex](https://www.knipex-tools.com/products/crimping-pliers/knipex-preciforce/knipex-preciforce-crimping-pliers-insulated-terminals-plug-connectors-and-butt-connectors/975235); esta última página se contradice sobre si es para aislados o sin aislar). TE referencia herramientas y matrices propias para sus faston ([TE 82004, p. 101-102](https://docs.rs-online.com/1f29/A700000015454362.pdf) ([copia local](datasheets/A700000015454362.pdf))).
- **Riesgo (inferencia mía).** Un barril de faston suele ser una chapa enrollada (con costura) dentro de un manguito de aislante. Una matriz cerrada de punteras comprime los cuatro (o seis) lados, no forma el pliegue en "F" o en "doble hendidura" para el que están diseñados, y aplasta el manguito. No he encontrado ninguna fuente que lo afirme así para la crimpadora #28; la ficha de #28 se hace aparte.
- **Cómo verificarlo (mío).** Antes de crimpar nada en 230 V:
  1. Haz 5 crimpados de prueba con un trozo del H05VV-F 3G1,5 (#22) y 5 terminales azules.
  2. Mira cada uno: costura cerrada y sin grieta, aislante intacto, hilo sin asomar fuera del manguito.
  3. Corta uno por el barril con alicates de corte. Los hilos deben verse **compactados**, sin huecos, y el pliegue debe haber agarrado el cobre.
  4. Haz la prueba de tirón del apartado 4.2 con los otros cuatro.
  5. Si falla, **no uses esa herramienta**: compra una pinza de terminales aislados (apartado 7).

### 4.2 Pelado, inspección visual y prueba de tirón

**Pelado y preparación**

- Longitud: 6-7 mm es lo razonable. Phoenix da **7 mm como máximo** para su rojo de 6,3 × 0,8 y 8 mm para su azul ([3240538](https://www.phoenixcontact.com/de/produkte/3240538/pdf), [3240059](https://docs.rs-online.com/ab4d/0900766b812c0b94.pdf) ([copia local](datasheets/0900766b812c0b94.pdf))). Las fichas de TE, Klauke y Vogt que leí no dan la longitud de pelado. La del kit: sin verificar.
- Pela sin cortar hilos. **No estañes el cobre antes de crimpar**: el estaño fluye bajo presión y el crimpado se afloja con el tiempo. Es práctica general; **no he encontrado una fuente que lo diga con cifras** (TE y Phoenix no lo dicen en lo que leí).
- **Un solo hilo por terminal.** El barril de 1,5-2,5 mm² está dimensionado para esa sección: dos hilos de 1,5 mm² suman 3 mm², por encima del rango (mío). El alcance de UL 310 cubre terminales para uno o dos conductores ([GlobalSpec](https://standards.globalspec.com/std/14548971/ul-310)); el kit no dice si es el caso, así que **uno por terminal**.

**Inspección visual (criterio mío; no leí la hoja de aplicación de TE 114-2123)**

- Con aislante opaco (lo habitual en el PVC, mío) **no se ve el hilo** por dentro. TE ofrece manguitos translúcidos en su serie Ultra-Fast Plus ([TE 82004, p. 93-94](https://www.farnell.com/datasheets/2686465.pdf)). Si el tuyo es opaco, la inspección se reduce a: costura cerrada, aislante entero y sin abrir, hilo del cable entrando en la zona de agarre del aislante, y sin cobre visible fuera del manguito.
- Compara siempre con el terminal cortado de la prueba (apartado 4.1).

**Fuerza de arrancamiento**

| AWG (mm² aprox.) | UL 486A (fuente secundaria) | TE 108-2043 (primaria, aislado Ultra-Fast) |
|---|---|---|
| 24 (0,20) | 5 lbf = 22 N | 6 lbf = 27 N |
| 22 (0,33) | 8 lbf = 36 N | 10 lbf = 44 N |
| 20 (0,52) | 13 lbf = 58 N | 16 lbf = 71 N |
| 18 (0,82) | 20 lbf = 89 N | 20 lbf = 89 N |
| **16 (1,31)** | **30 lbf = 133 N** | **30 lbf = 133 N** |
| **14 (2,08)** | **50 lbf = 222 N** | **60 lbf = 267 N** |

Fuentes: [Cirris](https://cirris.com/crimp-pull-testers-pullout-force-per-wire-size/) y [Checkline](https://www.checkline.com/res/products/126307/wire_pull_test_standards.pdf) ([copia local](datasheets/wire_pull_test_standards.pdf)) para UL 486A (ambas dan los mismos valores, como "libras"; no leí la norma) y [TE 108-2043](https://www.farnell.com/datasheets/2672036.pdf) ([copia local](datasheets/2672036.pdf)). Conversión de lbf a N: cálculo mío. **Los valores de IEC 60352-2 no los pude leer.**

- **1,5 mm² ≈ 15,4 AWG** (cálculo mío): su exigencia cae entre 133 N y 222-267 N. **Criterio mío: exigir al menos 133 N (13,6 kgf), el valor de 16 AWG.**
- **Prueba casera (mía, adaptando el método de TE: tirón gradual y 1 minuto de espera con la carga):** sujeta la parte delantera del terminal (el contacto, **no** el barril crimpado) entre dos tacos de madera en un tornillo de banco y cuelga del cable una carga de **15 kg (147 N)** durante 1 minuto. El cable no debe deslizar. Es un montaje improvisado; el ensayo normalizado usa una máquina de tracción. No sirve tirar del terminal ya enchufado en una lengüeta: la fricción de la hembra suelta mucho antes (el ensayo de acoplamiento de TE tiene su propia tabla de fuerzas, que no pude interpretar).
- **Con una báscula de gancho** (mía), tira despacio de 2-3 crimpados de prueba hasta que cedan y anota el valor; ese dato vale más que el de uno que aguante los 147 N.
- **El tirón con la mano** detecta un crimpado muy malo, pero no demuestra los 133 N. No lo uses como único criterio.
- Un terminal que pasa la tracción no es por eso bueno eléctricamente: TE advierte de que la máxima tracción no garantiza el máximo rendimiento eléctrico ([TE 82004, p. 91](https://docs.rs-online.com/1f29/A700000015454362.pdf) ([copia local](datasheets/A700000015454362.pdf))). Una prueba eléctrica simple (mía): hacer pasar 5 A de una fuente de laboratorio por un conjunto hembra + lengüeta + hilo durante 30 minutos y comprobar con un termómetro infrarrojo que no sube más de 20 °C (el criterio de UL 310/TE para su corriente nominal; el kit no declara la suya).

### 4.3 Retención y tirones

- **Qué es la retención.** La lengüeta del módulo puede traer un agujero o una hendidura, y la hembra un resalte que entra en ella. IEC 61210 cubre lengüetas con detente de agujero o de hendidura ([VDE Verlag](https://www.vde-verlag.de/iec-standards/217505/iec-61210-2010.html)). TE vende receptáculos "Positive Lock" que se enclavan sobre lengüetas con agujero y solo se sueltan hundiendo un pulsador; **en su guía rápida son solo de 6,35 × 0,81 mm** ([TE](https://mouser.com/pdfdocs/TEConnectivityFASTONQuickReferenceGuide.pdf) ([copia local](datasheets/TEConnectivityFASTONQuickReferenceGuide.pdf))). Los faston de kit genérico, por lo común, solo agarran por fricción y, a lo sumo, por un resalte (mío).
- **Qué lengüeta lleva tu módulo: sin verificar.** La ficha #15 no dice si las lengüetas traen agujero o muesca. Mírala con lupa al recibir el módulo.
- **Efecto de tirar del cable sin retención:** la hembra sale. Si es un puente L o N, la máquina se apaga. Si es la **tierra**, la máquina sigue funcionando sin protección y **nadie lo nota** (mío). Por eso la guía (§5.1) pide el hilo de tierra más largo; además conviene sujetarlo.
- **Contacto flojo y calor.** Un contacto flojo tiene más resistencia y, con corriente, más calor (P = I²R). Artículos sobre conectores fundidos explican que la causa es la resistencia de contacto por poca tensión o corrosión, y que el fusible puede no saltar porque la corriente sigue dentro de su valor ([Underhood Service](https://www.underhoodservice.com/melted-connectors/); es un artículo de automoción, no de 230 V). Con las décimas de amperio de esta máquina el calentamiento es bajo (apartado 2.4); el riesgo de verdad es el **arco** de un contacto intermitente a 230 V, que carboniza el plástico. **No encontré fuente con una cifra de corriente para ese caso** (mío).
- **Vibración:** la especificación TE 108-2043 que leí no incluye ensayo de vibración ([Farnell](https://www.farnell.com/datasheets/2672036.pdf) ([copia local](datasheets/2672036.pdf))). Una máquina de bar con golpes y puertas es un entorno de vibración (mío).
- **Sujeción (mío):** brida del haz a un punto fijo de la chapa, a pocos centímetros de los terminales, de modo que cualquier tirón no llegue al faston. Es lo mismo que pide la ficha del C14 (apartado 6.3).

### 4.4 Cableado del proyecto

**Dirección.** Las hembras (receptáculos) van en el cable y las lengüetas (machos) en el equipo, de modo que **el cable desenchufado no deja una lengüeta viva al aire** (mío). Los machos del kit no tienen uso en la guía.

**Cuántos terminales (cuenta mía, depende del esquema real del módulo, ficha #15):**

| Dónde | Hembras | Tamaño |
|---|---|---|
| Puentes C14 a interruptor (L y N), dos extremos | 4 | 4,8 mm (a confirmar) |
| Interruptor a fuente (L y N), solo el extremo del interruptor | 2 | Igual |
| Tierra, pin del C14 | 1 | 4,8 o 6,3 mm (a confirmar) |
| Pulsador | 2 | 2,8 mm |
| **Total por máquina** | **unas 7 para 230 V + 2 para el pulsador** | |

Suma una reserva de crimpados de prueba y de errores. Un kit de cientos de piezas sobra.

**Tierra con faston.** La guía dice "Faston / ojal M4" para el pin de tierra del C14. La ficha del C14 habla del "terminal faston" del pin de tierra y de los faston estañados de 4,8 × 0,8 de Schurter KD ([ficha del C14](../modulo-c14-fusible-interruptor/README.md)); no es raro, pero tampoco está confirmado para tu módulo. Lo que hay que añadir es la medida de continuidad: la guía (§6) pide 0,1 Ω desde el pin de tierra del C14 a cada pieza metálica con un comprobador de 10-25 A. **Esa medida es la que detecta un faston de tierra flojo.** No he leído la cláusula de EN 60335-1 sobre conexiones de tierra (**sin verificar** si admite faston).

**Pulsador (2,8 mm, señal).**

- Hay que medir el ancho y el **espesor** de las lengüetas del pulsador (2,8 × 0,5 o 2,8 × 0,8) y comprar la hembra que coincida. La ficha del pulsador dice que el botón EG STARTS de este ASIN no publica terminales.
- **¿Hay faston hembra de 2,8 mm para un hilo de 22 AWG (0,34 mm²)?** Sí, pero **no en el rojo genérico**. El rojo estándar es 0,5-1,0 mm² (Klauke 8201B: AWG 20-17) o 0,5-1,5 mm² (RND). Vogt tiene una serie de 2,8 mm (2,8 × 0,5 y 2,8 × 0,8) de **0,14-0,5 mm² (26-22 AWG)** en PVC, art. 389805 y 389808 ([Vogt](https://docs.rs-online.com/8033/A700000011290009.pdf) ([copia local](datasheets/A700000011290009.pdf))). TE tiene un violeta de 26-22 AWG en su gama Ultra-Fast ([TE 82004, pp. 91-92](https://docs.rs-online.com/1f29/A700000015454362.pdf) ([copia local](datasheets/A700000015454362.pdf))). Con 24 AWG (0,2 mm²) y un rojo de 0,5-1,0 mm², el crimpado puede quedar flojo (mío).
- **Alternativas para el pulsador** (mías): usar para el pulsador un hilo de 0,5 mm² (20 AWG) con el rojo genérico; soldar el hilo a la lengüeta del pulsador (Adafruit dice que soldar a los conectores de sus botones es válido: [Adafruit](https://learn.adafruit.com/arcade-buttons?view=all)); o comprar hilos ya crimpados, como los "quick-connect wire pairs" de 0,11" (2,8 mm), 20 cm, de Adafruit (PID 1152, 10 uds., 4,95 USD), que tienen un conector JST XH de 2 pines en el otro extremo (se puede cortar). Adafruit no dice a qué botones encajan ni qué calibre de hilo llevan. En el pulsador el riesgo es bajo (3,3 V y unos 60 µA: ficha del pulsador).
- La guía propone un solo hilo con Dupont hembra en la Pi y faston en el pulsador. Ese hilo tendría el calibre del Dupont (fino); la ficha del pulsador ya lo marca como pendiente. El calibre de los Dupont de ELEGOO (#29) **no lo he verificado**.

## 5. Fallos, bugs y problemas conocidos

La evidencia es **escasa y casi toda indirecta**: no encontré reseñas técnicas ni retiradas (CPSC, Safety Gate) de kits de faston de Amazon. Lo que sigue combina fichas de fabricante, artículos de otros sectores y riesgos plausibles (rotulados como míos).

| # | Problema | Gravedad para el proyecto | Fuente |
|---|---|---|---|
| 1 | Crimpado flojo o dañado por una herramienta que no es la adecuada | Alta | Knipex, TE (apartado 4.1); inferencia mía |
| 2 | Hembra que no casa con la lengüeta (ancho o espesor 0,5/0,8) | Alta | TE guía rápida |
| 3 | Sin retención: la hembra se suelta (tierra: silenciosamente) | Alta en tierra, media en L/N | Mío; TE (Positive Lock) |
| 4 | Rango de sección no declarado; 1,5 mm² en el límite rojo/azul | Media-alta | Tablas del apartado 2.3 |
| 5 | Aislante de PVC (60-75 °C según fuente) en pines de un C14 de hasta 70 °C | Media | Klauke, Vogt, TE; IEC 60320 |
| 6 | Material no declarado, estañado fino u oxidado | Media | Mío; TE (temperatura por recubrimiento) |
| 7 | Barril que se abre por la costura o aislante que se agrieta al crimpar | Media | Mío |
| 8 | Mezcla de tamaños y espesores en el kit | Media | Mío; kit parecido de UncleWiener |
| 9 | Sin aprobación (UL 310, VDE) ni tensión declarada | Media | TE 82004 (piezas no aprobadas); Phoenix, Klauke, Vogt sin tensión |
| 10 | Error de uso: estañar, pelar largo, dos hilos por terminal | Media | Apartado 4.2 |
| 11 | Terminal vivo accesible al público | Media-alta | Mío |
| 12 | Hilo fino del pulsador en un faston de 0,5-1,0 mm² | Baja | Vogt, Klauke |

### 5.1 Crimpado con la herramienta equivocada
Ver apartado 4.1. Es un riesgo probable porque el kit y la crimpadora son piezas distintas de la hoja, y la hoja describe la #28 como "autoajustable" y "punteras".

### 5.2 Hembra que no aprieta la lengüeta
- TE exige que el receptáculo coincida en ancho y espesor ([TE](https://mouser.com/pdfdocs/TEConnectivityFASTONQuickReferenceGuide.pdf) ([copia local](datasheets/TEConnectivityFASTONQuickReferenceGuide.pdf))). Una hembra de 0,5 mm sobre una lengüeta de 0,8 mm entra a la fuerza y se abre (mío). Una de 0,8 mm sobre una de 0,5 mm queda floja, con poca fuerza de contacto, y **es el caso peligroso** (mío).
- Una hembra de 6,3 mm sobre una lengüeta de 4,8 mm queda suelta por los lados; una de 4,8 mm sobre una de 6,3 mm no entra (mío).
- Los catálogos tienen 4,8 × 0,5 y 4,8 × 0,8 (apartado 2.2) y las tiendas se contradicen al describirlos; un kit genérico puede no decir cuál lleva. **Solución:** calibre y prueba de encaje en el módulo real.

### 5.3 Aislante de PVC delgado
Klauke da la funda de PVC de su 8201B hasta 70 °C; Vogt, de −10 a +75 °C; la guía de TE da 60 °C para el PVC en carcasas. El pin del C14 puede llegar a 70 °C en un módulo bien cargado (ficha del C14). En esta máquina la carga es pequeña y la guía exige medir que la caja no pase de 40 °C por el sensor (guía §0, riesgo 5), pero **el margen no es grande** si la fuente calienta el rincón del C14 (ficha del C14, apartado 2.2). El PA (nylon) llega a 105 °C.

### 5.4 Material y recubrimiento
- Los fabricantes serios usan latón estañado: Klauke, Vogt, Phoenix, RND ([Bürklin](https://buerklin.com/en/p/klauke/flat-plugs/8201b/07F6765), [Vogt](https://docs.rs-online.com/8033/A700000011290009.pdf) ([copia local](datasheets/A700000011290009.pdf)), [Distrelec](https://docs.rs-online.com/f28c/A700000011111237.pdf) ([copia local](datasheets/A700000011111237.pdf))). TE usa latón (ASTM B-36) o bronce fosforoso (ASTM B-139), con manguito de cobre en el barril y estañado ([TE 82004, p. 101](https://docs.rs-online.com/1f29/A700000015454362.pdf) ([copia local](datasheets/A700000015454362.pdf))); su azul de 6,3 mm figura con bronce fosforoso estañado ([Future](https://www.futureelectronics.com/p/4011342)).
- El bronce fosforoso conserva mejor la fuerza del muelle que el latón: **conocimiento general, sin fuente consultada**.
- Estañado frente a sin recubrir: TE da 110 °C para estañado y 90 °C para sin recubrir ([TE](https://mouser.com/pdfdocs/TEConnectivityFASTONQuickReferenceGuide.pdf) ([copia local](datasheets/TEConnectivityFASTONQuickReferenceGuide.pdf))). Algunos kits se anuncian como "dorados" (el título del kit de 480 piezas de ManoMano que salió en la búsqueda del ASIN, no abierto): un acabado dorado no garantiza estañado ni oro (**sin verificar**).
- **Cómo mirar (mío):** un imán descarta un terminal de acero (el latón y el cobre no se pegan). El estañado es gris plateado mate; el latón sin recubrir, amarillo. Con manchas verdes o negras, rechazar.

### 5.5 Costura, aislante agrietado, mezcla de tamaños
Fallos plausibles en cualquier kit de bajo precio, **sin fuente** (mío). Se detectan en las pruebas del apartado 6.

### 5.6 Casos conocidos de conexiones quemadas
- **Ninguna retirada de CPSC ni de Safety Gate localizada** para kits de faston. No consulté el portal de Safety Gate directamente.
- **Caso citado en la ficha del C14:** una máquina de café con el neutro del conector IEC suelto: arco, carbonización y disparo del diferencial ([foro Vesuvius](https://www.tapatalk.com/groups/vesuvius/power-inlet-problem-and-solution-s-t475.html); es una sola anécdota).
- **Terminales de crimpado apilados y flojos en un disyuntor de barco:** Ed Sherman (Boating Magazine) cuenta un pequeño incendio por conectores crimpados apilados, que dejaron huecos, aumentaron la resistencia y se calentaron ([Boating](https://boatingmag.com/dont-stack-wire-connections/)). No es 230 V y no es un faston, pero muestra el mecanismo.
- **Conectores fundidos en automoción:** la causa citada es la resistencia de contacto por poca tensión o corrosión, no el exceso de corriente ([Underhood Service](https://www.underhoodservice.com/melted-connectors/)).
- **Hilo de espresso:** un hilo del foro Home-Barista ("Burnt La Pavoni Europiccola Wiring", por el título, cableado quemado en una máquina de espresso) apareció en la búsqueda y la herramienta **pidió un permiso que no llegó a contestarse**: no lo pude leer ni sé qué terminales eran. Queda como pendiente.

### 5.7 Terminal vivo en una máquina de acceso público
El aislante de la hembra cubre su conexión, pero **la lengüeta del módulo y los demás terminales sin usar siguen al aire** (mío). La protección frente al público la da la caja cerrada con herramienta, no el faston. No leí la cláusula de EN 60335-1 sobre acceso a partes vivas (**sin verificar**). Cubre los terminales que no uses (ficha del C14, apartado 6.1) y rotula "Desconectar el cable de red antes de abrir".

## 6. Qué comprobar al recibirlo

Hazlo **antes de crimpar nada**, con el módulo C14 en la mano. Compra dos kits o piezas de repuesto: es barato.

| Qué mirar | Cómo | Aceptable | Fuente |
|---|---|---|---|
| Qué trae el kit | Cuenta por tamaño; separa por ancho y color | Los tamaños y colores corresponden al anuncio | Mío |
| Lengüeta del módulo C14 | Calibre digital: ancho (4,8 o 6,3) y **espesor** (0,5 u 0,8). Anota si hay agujero o hendidura | Lo que midas manda sobre lo que diga el vendedor | Ficha del C14, apartado 8 |
| Lengüeta del pulsador | Igual (2,8 × 0,5 o 2,8 × 0,8) | Igual | Mío |
| Hembra de prueba | Enchufa una hembra sin crimpar en cada lengüeta | Entra con esfuerzo moderado, sin holgura lateral, y **no se cae** al girar el módulo boca abajo | Mío (TE: ancho y espesor deben coincidir) |
| Aislante | Envase o anuncio: PA/nylon o PVC. Si no lo dice, trátalo como PVC | PA | Apartados 2.4 y 5.3 |
| Barril | Costura cerrada, sin rebabas ni óxido | Sí | Mío |
| Mezcla | Compara 20 terminales del mismo tamaño con el calibre | Mismo ancho y espesor | Mío |
| Prueba de crimpado | Apartado 4.1: 5 terminales con tu herramienta | Aprueba el tirón de 147 N | Apartado 4.2 |
| Calentamiento (opcional) | Apartado 4.2: 5 A, 30 minutos, termómetro | Subida ≤ 20 °C | Mío; UL 310 vía TE |
| Tierra | Con la máquina montada, continuidad desde el pin del C14 a cada pieza metálica | ≤ 0,1 Ω (guía §6) | Guía; [IET](https://electrical.theiet.org/media/1658/in-service-inspection-and-testing-of-electrical-equipment-the-earth-continuity-test.pdf) ([copia local](../documentos-compartidos/normas/in-service-inspection-and-testing-of-electrical-equipment-the-earth-continuity-test.pdf)) |

## 7. Alternativas

Solo si el kit resulta débil o la prueba de tirón falla. **No he comprobado disponibilidad ni precio en Amazon.es** de ninguna.

- **Comprar hembras de marca solo para las posiciones de 230 V:** Klauke 8302B (azul, 1,5-2,5 mm², PA), Phoenix C-SCMI 2,5/6,3×0,8 (azul, PA; solo 6,3 mm en lo que abrí), Vogt (serie 39xx, PA o PVC) o RND 465-00513 (azul, 4,8 × 0,8, nylon, UL E502428). Son cajas de 100-1000 piezas; el precio no lo miré.
- **Pinza para terminales aislados:** Knipex 97 52 (perfil "F" u oval, 3 posiciones, 0,5-6 mm²). Si la crimpadora #28 falla en la prueba, esta es la herramienta. El precio y la disponibilidad no los miré.
- **Faston con retención** (Positive Lock de TE): solo cuando la lengüeta del módulo tiene agujero y es de 6,3 mm, según la guía rápida de TE.
- **Soldar el hilo a la lengüeta y cubrirlo con termorretráctil adhesivo:** elimina el problema del encaje. Es una práctica común, pero **no leí qué dice EN 60335-1 sobre conexiones soldadas ni sobre su sujeción mecánica**.
- **Módulo C14 con bornes de tornillo o con cables ya montados:** no lo investigué (**sin verificar**); solo tendría sentido si cambias de módulo (ficha del C14, apartado 9).

## 8. Discrepancias con la guía de montaje y con mi planteamiento inicial

| # | La guía / mi planteamiento inicial dice | Lo que he encontrado | Fuente |
|---|---|---|---|
| 1 | Guía §5.1: "Faston hembra aislado" para los puentes de 1,5 mm² | Sin dato de tamaño, espesor ni rango de sección. **1,5 mm² cae entre el rojo y el azul**: azul (1,5-2,5) según TE, Klauke, Vogt, Cimco; rojo (0,5-1,5) también en Phoenix y RND | Apartado 2.3 |
| 2 | Guía §5.3: "Dupont hembra en la Pi · faston 2,8 mm en el pulsador" | 22-24 AWG (0,2-0,34 mm²) queda por debajo del rango del rojo genérico (0,5-1,0 mm²) y el crimpado puede quedar flojo (mío). Hay una serie de 0,14-0,5 mm² de Vogt | Apartado 4.4 |
| 3 | Guía §5.1: la tierra "Faston / ojal M4" | El faston de tierra suelto no se nota. La medida de continuidad de §6 lo detecta; no leí la cláusula de EN 60335-1 | Apartado 4.3 |
| 4 | Guía §1 #27: "2,8, 4,8 y 6,3 mm" para el C14 | No hay contradicción, pero la guía no fija **espesor** (0,5/0,8), ni PA frente a PVC. El módulo C14 lleva probablemente 4,8 × 0,8 (no confirmado para el tuyo) | Apartado 2.2; ficha del C14 |
| 5 | Planteamiento inicial: DIN 46244 = terminales planos hembra | En una ficha de Hilpress figura como norma de la **lengüeta**. Para las hembras aparecen DIN 46245 (aisladas: Vogt, Cimco) y DIN 46247 parte 1 (sin aislar: Hilpress) | Apartado 3.1 |
| 6 | Planteamiento inicial: DIN 46340 y 46341 | **No encontré fuente** de su contenido | Apartado 3.1 |
| 7 | Planteamiento inicial: "2,8 mm ~10 A, 4,8 mm 16 A, 6,3 mm 20-25 A" | TE: 14 A (2,8, hilo 1,5 mm²), 20 A (4,8, 2,5 mm²), 28 A (6,3, 4-6 mm²) en la guía rápida; 5-8 A (2,8) y 10-15 A (4,8) en el ensayo de calentamiento de 108-2043; Vogt: 10/15/25 A por sección. **Ninguna fuente da exactamente esos números** | Apartado 2.4 |
| 8 | Planteamiento inicial: "el rojo es 0,5-1,0 o 0,5-1,5" | Confirmado: 0,5-1,0 (Klauke, Vogt, Cimco; TE 22-18 AWG) y 0,5-1,5 (Phoenix, RND). Y TE se contradice a sí mismo: 0,3-0,8 mm² en la tabla de un rojo .187 y 0,25-1,6 mm² en la tabla de colores de la misma serie | Apartado 2.3 |
| 9 | Planteamiento inicial: "fuerza de arrancamiento exigida por UL 486A-B/IEC 60352-2" | UL 486A: 30 lbf (16 AWG) y 50 lbf (14 AWG), por fuentes secundarias. IEC 60352-2: **no leí valores** | Apartado 4.2 |

Puntos que tocan a otras piezas (una línea cada uno): **#28** (la crimpadora autoajustable debe pasar la prueba del apartado 4.1 con terminales aislados), **#15** (tamaño y espesor de la lengüeta del módulo y si hay agujero), **#22** (diámetro exterior de cada hilo del H05VV-F 3G1,5, que decide el ajuste del manguito), **#23** (los ojales M4 "para 0,5-1,5 mm²" siguen el mismo convenio que el rojo de Phoenix/RND), **#11** (espesor y ancho de las lengüetas del pulsador) y **#29** (calibre real de los Dupont).

## 9. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **No crimpes ningún cable de 230 V hasta superar la prueba del apartado 4.1** con tu herramienta y tus terminales. Si falla, usa una pinza de terminales aislados.
2. **Usa el terminal azul (1,5-2,5 mm²) para los hilos de 1,5 mm².** El rojo solo si el envase dice "hasta 1,5 mm²" y supera la prueba de tirón de 147 N.
3. **Mide antes de crimpar:** ancho y espesor de las lengüetas del C14 (#15) y del pulsador (#11). Compra o separa el espesor que coincida.
4. **Prefiere PA (nylon) a PVC** en las posiciones de 230 V y en el pin de tierra.
5. **Un hilo por terminal, sin estañar, pelado de 6-7 mm**, y brida del haz a un punto fijo cerca del módulo. El hilo de tierra, más largo y sujeto, y la continuidad de tierra medida con 10-25 A (guía §6).
6. **Si el kit no demuestra calidad, compra solo para las 7 posiciones de 230 V** terminales de marca de PA (Klauke, Phoenix, Vogt o RND) y usa el kit para lo demás (el pulsador).
7. **Para el pulsador:** mide la lengüeta; si el hilo es de 22-24 AWG, usa una hembra de 0,14-0,5 mm² (Vogt) o hilos con terminal ya crimpado, o hilo de 0,5 mm² con el rojo del kit.
8. **Cubre los terminales sin usar del módulo y rotula la máquina:** "Desconectar el cable de red antes de abrir".
9. **Guarda factura, fotos y lote** del kit y de las pruebas de tirón, para el expediente técnico de la máquina (RD 187/2016, según la guía).
10. **Que un electricista revise** el cableado de 230 V antes de la primera conexión (guía, cabecera).

## 10. Lo que no he podido verificar

- **El anuncio de Amazon B0B4H54KPS**: no sé el número de piezas, los colores por tamaño, el rango de sección de cada color, el material, el aislante, el espesor de las lengüetas, la tensión, si trae caja o herramienta, ni si hay mezcla de tamaños. Una búsqueda del ASIN no devolvió su anuncio; devolvió kits de otras tiendas (ManoMano de 480 piezas, que la herramienta no pudo abrir; UncleWiener de 140 piezas) que no son esta pieza.
- **El texto de IEC 61210, UL 310, UL 486A-B, IEC 60352-2, EN 60335-1 y la parte 2-82**: de pago. No leí dimensiones ni espesores de lengüeta de la norma, ni los ensayos, ni las fuerzas de tracción de IEC 60352-2 (el sitio de VDE rechazó la herramienta), ni la cláusula de tierra, cableado interno o acceso a partes vivas. El **ensayo de "extracción" o "retención"** de UL 310 tampoco.
- **DIN 46340 y DIN 46341**: no encontré su contenido. Lo que escribo de DIN 46244, 46245 y 46247 sale de catálogos de Hilpress, Vogt y Cimco, no de las normas.
- **HellermannTyton**: sin ficha. Vogt solo en las gamas que abrí. No abrí el amarillo (4-6 mm²) de Phoenix ni de Klauke más allá de un listado de tienda.
- **La hoja de aplicación de TE 114-2123** (pelado, inspección y dimensiones de crimpado) y los dibujos de cliente de TE: la herramienta no puede abrir te.com/DocumentDelivery.
- **Si la crimpadora #28 crimpa bien un faston aislado**: es una inferencia mía; su ficha se hace aparte.
- **La longitud de pelado del kit**, y si hay **ventana de inspección** o aislante translúcido (solo vi translúcido en TE Ultra-Fast Plus).
- **Si el módulo C14 trae lengüetas con agujero o hendidura**, y su tamaño y espesor.
- **El calibre de los Dupont de ELEGOO (#29)** y el de los hilos "quick-connect" de Adafruit.
- **Retiradas** (CPSC, Safety Gate) de kits de faston: no las encontré. No consulté los portales directamente.
- **El hilo de Home-Barista sobre un cableado quemado**: la herramienta pidió un permiso que no se contestó. No lo abrí. URLs: <https://www.home-barista.com/repairs/burnt-la-pavoni-europiccola-wiring-t104636-10.html> (página 2, error de la herramienta) y <https://www.home-barista.com/repairs/burnt-la-pavoni-europiccola-wiring-t104636.html> (página 1, permiso sin contestar).
- **El diámetro de cada hilo del H05VV-F 3G1,5** (Nexans solo da el exterior máximo de 9,8 mm). Mi "unos 3 mm" es estimación sin fuente.
- **Que el bronce fosforoso aguante mejor el muelle que el latón** y que estañar el hilo afloje el crimpado: conocimiento general, sin fuente.
- **Las cifras de TE, Phoenix, Klauke y Vogt** las leyó mi herramienta de lectura como resumen; donde una cifra importa, usa el enlace. Las fuentes de foros y artículos de otros sectores (Boating, Underhood Service, Vesuvius) son anécdotas, no normas.
- **Casos de faston quemado en aparatos de 230 V:** usé las 15 búsquedas web permitidas y no encontré uno bien documentado; los que cito son de otros sectores o anécdotas.

## 11. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos) y carpeta [`datasheets/`](datasheets/).

Todos los enlaces, ordenados por tipo, y una lista de lo que no se pudo abrir, en [`enlaces.md`](enlaces.md).
