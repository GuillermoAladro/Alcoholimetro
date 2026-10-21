# Terminales de ojal M4 aislados, 0,5-1,5 mm² (25 uds.)

Terminan los cables verde-amarillos de 1,5 mm² de la puesta a tierra de 230 V en el espárrago M4×20 soldado al chasis (dos tuercas, ojales apilados): C14 al espárrago, espárrago a la fuente (borne FG), panel frontal, caja interior suspendida (flexible) y cajón (flexible). Son la última pieza de la cadena de tierra: si un ojal se suelta o está mal crimpado, el chasis puede quedar con tensión.

- **Compra:** ASIN B0CVW7Y2P4, 5,52 € por 25 uds. (0,22 € por unidad), en la hoja de componentes del 19-20-10-2026 (#23). En la hoja quedaba 1 en stock.
- **Es una pieza de seguridad.** Cuesta céntimos pero va en el camino de la tierra. Léela entera antes de crimpar. Si no tienes experiencia con 230 V, que un electricista revise la tierra.

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta: **no he visto el anuncio B0CVW7Y2P4** (no intenté abrirlo). El precio, el ASIN y el rango "M4 para 0,5-1,5 mm²" son los de tu hoja y tu guía. Esta pieza **no tiene ficha del fabricante**: lo que sigue se apoya en fichas de terminales equivalentes (Phoenix Contact, TE, RS PRO, Klauke), en manuales de crimpado (Molex, Würth Elektronik) y en los textos de norma que he podido leer. Las normas de pago (EN 60335-1, UL 486A-B, IEC 60352-2) **no las he leído enteras**: lo que sé de ellas viene de informes de ensayo, resúmenes y tablas de terceros, y lo digo en cada caso.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales y normas](#3-documentos-oficiales-y-normas)
4. [El cable de 1,5 mm² en el límite del terminal rojo](#4-el-cable-de-15-mm²-en-el-límite-del-terminal-rojo)
5. [Crimpado: herramienta, procedimiento y comprobación](#5-crimpado-herramienta-procedimiento-y-comprobación)
6. [Montaje en el espárrago de tierra](#6-montaje-en-el-espárrago-de-tierra)
7. [Ojales de cables que se mueven (cajón y caja interior)](#7-ojales-de-cables-que-se-mueven-cajón-y-caja-interior)
8. [Fallos, bugs y problemas conocidos](#8-fallos-bugs-y-problemas-conocidos)
9. [Qué comprobar al recibirlo](#9-qué-comprobar-al-recibirlo)
10. [Cuántos hacen falta y repuestos](#10-cuántos-hacen-falta-y-repuestos)
11. [Alternativas](#11-alternativas)
12. [Discrepancias con la guía de montaje y con mi planteamiento inicial](#12-discrepancias-con-la-guía-de-montaje-y-con-mi-planteamiento-inicial)
13. [Recomendaciones para el alcoholímetro](#13-recomendaciones-para-el-alcoholímetro)
14. [Lo que no he podido verificar](#14-lo-que-no-he-podido-verificar)
15. [Fuentes](#15-fuentes)

---

## 1. Resumen para el proyecto

- **1,5 mm² está en el techo del terminal "rojo".** Phoenix Contact y RS PRO dan 0,5-1,5 mm² para el rojo ([Phoenix 3240018](https://asset.conrad.com/media10/add/160267/c1/-/de/000676042DS01/datasheet-676042-phoenix-contact-3240018-ring-terminal-hole-o43-mm-partially-insulated-red-100-pcs.pdf), [RS PRO](https://docs.rs-online.com/a5a9/0900766b81529c0d.pdf)), TE da 22-16 AWG (0,26-1,65 mm² según [RS](https://uk.rs-online.com/p/ring-terminals/1361930)) y **Klauke vende un ojal M4 rojo solo para 0,5-1,0 mm²** ([Bürklin](https://buerklin.com/en/p/klauke/cable-lugs/6204/07F934)). "Rojo" no significa lo mismo en todas las marcas. No sé de qué marca es el tuyo, así que **prueba con tu cable antes de crimpar el lote** (apartado 4).
- **La crimpadora #28 (autoajustable, con punteras) puede no servir para ojales.** Según McMaster, las crimpadoras de trinquete con ranura autoajustable son de la familia de las punteras (ferrules); los terminales de ojal y faston tienen otra categoría de herramienta ([McMaster](https://www.mcmaster.com/products/terminal-crimpers)). No he visto la ficha de la #28. Hasta verla, trátala como no apta y haz la prueba de tirón y de corte (apartado 5).
- **El tirón mínimo de referencia no es 40-50 N, es unos 133 N.** UL 486A para terminales da 30 lb para 16 AWG, es decir 133 N ([Cirris](https://cirris.com/crimp-pull-testers-pullout-force-per-wire-size/), confirmado por el [manual de Molex](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/2931/Quality%20Crimp%20Handbook.pdf)). 40-50 N corresponde a un 22 AWG. Discrepancia con mi planteamiento inicial (apartado 12).
- **La norma de tierra pide conexión permanente y fiable, apriete asegurado contra aflojamiento, sin riesgo de corrosión y baja resistencia.** Lo he leído solo a través de un informe de ensayo de EN 60335-1 (cláusulas 27.1, 27.2, 27.4 y 27.5), no en la norma. El REBT (ITC-BT-19 §2.3) admite soldadura sin ácido o conexión por rosca, no obliga a tornillo, y pide piezas inoxidables y tornillos previstos contra el desapriete ([ITC-BT-19](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf)).
- **Cinco ojales apilados en un espárrago son demasiados para la práctica habitual.** La única guía que encontré recomienda 2-3 por espárrago ([ARH Foundation](https://www.arhfoundation.org/connect-ring-terminals-together), no normativa). Tu guía apila 1 bajo la primera tuerca y 4 bajo la segunda (apartado 6.3).
- **Los dos cables flexibles (cajón y caja suspendida) son el punto débil.** El cable es H05VV-F, clase 5, con aislante grueso, y el ojal queda rígido en el extremo. Fatiga a la salida del barril si el cable se dobla justo ahí. Holgura, sujeción y funda (apartado 7).
- **Una máquina usa entre 6 y 8 ojales M4 (cuenta mía, apartado 10).** Con 25 uds. salen 3 máquinas y casi ningún repuesto para prácticas. Compra un lote de 100.

## 2. Especificaciones

### 2.1 Lo que dice tu hoja y tu guía (anuncio no visto)

| Característica | Valor | Fuente |
|---|---|---|
| Pieza | Ojales M4 para 0,5-1,5 mm² (25 uds.) | Hoja de compra #23 |
| Precio | 5,52 € (0,22 €/ud.) | Hoja de compra |
| Stock | Quedaba 1 | Hoja de compra |
| Uso | Ojal M4 en el espárrago de tierra de los verde-amarillos de 1,5 mm² | Guía §5.1 y §6 |

No sé la marca, el color, el material del aislante, el chapado, la longitud del barril, la temperatura ni si el lote es solo rojo. Todo eso lo debes comprobar al recibirlo (apartado 9).

### 2.2 Terminales equivalentes (datos de fabricante y de distribuidor)

No son tu producto. Sirven para saber qué esperar de un ojal M4 de 0,5-1,5 mm².

| Dato | Phoenix Contact C-RCI 1,5/M4 (3240018) | RS PRO 267-3622 (nylon) | RS PRO 613-9249 (vinilo) | TE PIDG 31886 (rojo) | Klauke 6204 |
|---|---|---|---|---|---|
| Sección | 0,5-1,5 mm² | 0,5-1,5 mm² (22-16 AWG) | 0,5-1,5 mm² (22-16 AWG) | 0,26-1,65 mm² (22-16 AWG) | **0,5-1,0 mm²** (20-18 AWG) |
| Agujero | 4,3 mm | 4,3 mm | 4,3 mm | 4,34 mm | 4,3 mm |
| Ancho / diámetro del ojal | 8 mm (ancho) | 8 mm | 6,6 mm | 7,14 mm | no indicado |
| Longitud total | 21,7 mm | 21,8 mm | 20,4 mm | 20,24 mm | no indicada |
| Espesor | 0,75 mm | 0,75 mm | 0,75 mm | 0,79 mm | no indicado |
| Barril | Cobre; chapado no indicado; la página dice "hartgelötet" (soldadura fuerte) sin precisar dónde | Cobre estañado, "doble crimpado" | Cobre estañado | Cobre estañado | Cobre estañado |
| Aislante | Plástico sin halógenos, UL 94 V2 | Nylon | Vinilo, 600 V máx. | Nylon | PA (poliamida) |
| Temperatura | -20 a 105 °C | -40 a 105 °C (la misma página dice 150 °C en la lista de características) | -40 a 105 °C | no indicada | máx. 105 °C |
| Pelado del cable | 7 mm | no indicado | no indicado | no indicado | no indicado |
| Corriente | no indicada | no indicada | 16 AWG: 18 A | no indicada | no indicada |
| Aprobaciones | ninguna listada | UL y UL Canadá | UL | "No" en la ficha del distribuidor | no indicadas |
| Fuente | [PDF Conrad](https://asset.conrad.com/media10/add/160267/c1/-/de/000676042DS01/datasheet-676042-phoenix-contact-3240018-ring-terminal-hole-o43-mm-partially-insulated-red-100-pcs.pdf) | [RS](https://de.rs-online.com/web/p/ringkabelschuh/2673622), [ficha](https://docs.rs-online.com/a5a9/0900766b81529c0d.pdf) | [RS](https://de.rs-online.com/web/p/products/6139249), [ficha](https://docs.rs-online.com/d324/A700000007945278.pdf) | [RS](https://uk.rs-online.com/p/ring-terminals/1361930) | [Bürklin](https://buerklin.com/en/p/klauke/cable-lugs/6204/07F934) |

Notas sobre la tabla:

- Phoenix describe el 3240018 como "teilisoliert" (parcialmente aislado): lleva funda de plástico solo en el barril, y el ojal queda metálico. Por las otras fichas, es la forma habitual de un "ojal aislado" (deducción mía). El PDF de Conrad es un extracto de catálogo de 13-11-2013 que remite a la documentación completa.
- Phoenix da más cotas: longitud de la funda aislante 10,5 mm, diámetro interior del collar aislante 4,1 mm, distancia del centro del ojal a la funda 7,3 mm.
- **Las páginas de distribuidor se contradicen entre sí.** La RS PRO 534-216A (PVC, rojo, M4) aparece con agujero de 4,16 mm, con diámetro exterior de 6 mm en la tabla y de 8 mm en el título, y con temperatura mínima y máxima de 75 °C ([RS](https://de.rs-online.com/web/p/ringkabelschuh/0534216A)). El agujero de 4,16 mm sería justo para un tornillo M4 (4,0 mm). Esos datos no los doy por buenos. Dos agujeros distintos con el mismo "M4" existen en el mercado: mide el tuyo.
- La ficha de RS PRO (serie RNYD) da el código de colores de la marca: rojo 0,5-1,5 mm², azul 1-2,6 mm², amarillo 2,5-6,5 mm² ([ficha](https://docs.rs-online.com/a5a9/0900766b81529c0d.pdf)). Esa ficha escribe "M4.5 (#8)" como tamaño de espárrago, aunque el agujero es de 4,3 mm.
- TE: la página de RS da 31886 con 22-16 AWG y el agujero de 4,34 mm. El PDF de TE enlazado en esa página **no tiene texto legible** (apartado 14).

### 2.3 Agujero según tamaño de tornillo

Para no confundir M4 con otras medidas. Datos de las páginas de RS PRO (distribuidor):

| Tornillo | Agujero | Fuente |
|---|---|---|
| M3 | 3,2 mm | [RS PRO 0534238](https://de.rs-online.com/web/p/ringkabelschuh/0534238) (título) |
| M3,5 | 3,7 mm | [RS PRO 2673919](https://de.rs-online.com/web/p/ringkabelschuh/2673919) (título) |
| **M4** | **4,3 mm** (4,16 a 4,34 mm según modelo) | Tabla 2.2 |
| M5 | 5,3 mm | [RS PRO 2673616](https://de.rs-online.com/web/p/products/2673616) (título) |

Un ojal M5 en un espárrago M4 deja 1,3 mm de holgura sobre el diámetro del tornillo: el ojal puede descentrarse y apoyar mal bajo la arandela. Uno de M3,5 (3,7 mm) no pasa por el M4.

### 2.4 Código de colores

| Color | Rango habitual en las fichas vistas | Fuente |
|---|---|---|
| Rojo | 0,5-1,5 mm² (Phoenix, RS PRO), 22-16 AWG (TE, RS PRO). Klauke: 0,5-1,0 mm² | Tabla 2.2 |
| Azul | 1,5-2,5 mm², 16-14 AWG (kit RS PRO 613-9952). 1-2,6 mm² en la ficha RNYD de RS PRO. 16-14 AWG en los TE PIDG azules | [ficha del kit RS PRO](https://docs.rs-online.com/2883/A700000006574165.pdf), [ficha RNYD](https://docs.rs-online.com/a5a9/0900766b81529c0d.pdf), [RS: TE PIDG azul](https://uk.rs-online.com/p/ring-terminals/6692242) (título) |
| Amarillo | 4-6 mm², 12-10 AWG (kit RS PRO). 2,5-6,5 mm² en la ficha RNYD | las mismas |

La ficha del kit RS PRO 613-9952 confirma el reparto habitual: rojo 22-16 AWG (0,5-1,5 mm²), azul 16-14 AWG (1,5-2,5 mm²), amarillo 12-10 AWG (4-6 mm²). La corriente máxima que da para el rojo con 16 AWG es de 18 A. Dice que una crimpadora de trinquete de 0,5 a 6 mm (RS 125-1964) crimpa todos los terminales aislados del kit ([ficha del kit](https://docs.rs-online.com/2883/A700000006574165.pdf)). **Sin verificar:** que todas las marcas sigan ese reparto (Klauke no lo sigue en el rojo, y la ficha RNYD de RS PRO da otros límites) y no he podido abrir el catálogo de Weidmüller ni de Hellermann. El color lo marca la sección, no la función: el hilo verde-amarillo es el que identifica la tierra, y el collar rojo del terminal no lo cambia (la ITC-BT-19 §2.2.4 pide el verde-amarillo para el conductor de protección: [ITC-BT-19](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf)).

### 2.5 Conversión AWG a mm² (cálculo mío)

Con la fórmula estándar del AWG: 16 AWG = 1,291 mm de diámetro y 1,31 mm² de sección; 14 AWG = 1,628 mm y 2,08 mm². Un terminal de "22-16 AWG" está pensado, en teoría, para hasta 1,31 mm² de cobre, y uno de "0,5-1,5 mm²" para hasta 1,5 mm². La página de RS da para el TE 31886 un máximo de 1,65 mm² con 16 AWG: no sé por qué difiere de 1,31 mm² (no he podido leer la ficha de TE). Tampoco he podido ver cómo define cada fabricante el límite.

## 3. Documentos oficiales y normas

### 3.1 Documentos de fabricante y distribuidor

No hay documento del fabricante de tu terminal. Los documentos son fichas de terminales equivalentes y manuales de crimpado.

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Phoenix Contact, ojal aislado C-RCI 1,5/M4 | 3240018, extracto de catálogo 13-11-2013 | PDF | [Conrad](https://asset.conrad.com/media10/add/160267/c1/-/de/000676042DS01/datasheet-676042-phoenix-contact-3240018-ring-terminal-hole-o43-mm-partially-insulated-red-100-pcs.pdf) |
| Phoenix Contact, ojal sin aislar C-RC 1/M4 DIN (estañado, DIN 46234) | 3240072 | PDF (listado en Bürklin, **no abierto**) | [ficha EN](https://www.buerklin.com/Buerklin-Webshop-Site/rest;loc=de_DE/attachments/Buerklin-Webshop%253A%252FFiles_24e%252F3240072en.pdf) · [declaración de conformidad EN](https://www.buerklin.com/Buerklin-Webshop-Site/rest;loc=de_DE/attachments/Buerklin-Webshop%253A%252FFiles_016%252FDeclaration_of_Conformity_60P7279_EN.pdf) |
| RS PRO, ojales de nylon serie RNYD | 267-3622 | PDF | [RS](https://docs.rs-online.com/a5a9/0900766b81529c0d.pdf) |
| RS PRO, ojales de vinilo | 613-9249 | PDF | [RS](https://docs.rs-online.com/d324/A700000007945278.pdf) |
| RS PRO, kit de ojales de vinilo rojo/azul/amarillo (código de colores y corrientes) | 613-9952 | PDF | [RS](https://docs.rs-online.com/2883/A700000006574165.pdf) |
| Klauke, ojal aislado 0,5-1,0 mm² | 6204 (Bürklin 07F934) | PDF (listado en Bürklin, **bloqueado por robots**) | [ficha EN](https://www.buerklin.com/Buerklin-Webshop-Site/rest;loc=de_DE/attachments/Buerklin-Webshop%253A%252FFiles_f48%252F6192en.pdf) |
| TE PIDG, ojal rojo M4 | 31886 (RS 136-1930) | PDF **sin texto legible** | [RS](https://docs.rs-online.com/f0e4/0900766b815a39b3.pdf) |
| Molex, *Quality Crimp Handbook* | 63800-0029, Rev. C, 20-10-2009 | PDF | [DigiKey](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/2931/Quality%20Crimp%20Handbook.pdf) |
| Würth Elektronik, inspección visual de crimpados | o510301v410 | PDF | [WE](https://www.we-online.com/catalog/media/o510301v410%20Visual%20inspection%20of%20crimped%20connections.pdf) |
| Cirris, fuerza de arranque por calibre | — | Web | [Cirris](https://cirris.com/crimp-pull-testers-pullout-force-per-wire-size/) |
| ATIS PEG, *Grounding and Corrosion of Dissimilar Materials* (S. Ulemek) | — | PDF | [ATIS](https://peg.atis.org/wp-content/uploads/2019/03/Grounding_and_Corrosion_of_Dissimilar_Materials-SUlemek.pdf) |

### 3.2 Normas

Las normas están de pago. Tabla de lo que he leído de cada una y de dónde.

| Norma | Tema | Qué he podido leer | Enlace |
|---|---|---|---|
| EN / IEC 60335-1 (cláusula 27, "Provision for earthing") | Seguridad de aparatos: conexión de tierra | Solo los títulos de 27.1, 27.2, 27.4 y 27.5 en un informe de ensayo de la edición IEC 60335-1:2010 / EN 60335-1:2012. **El texto de la norma, 27.3 y los valores (0,1 Ω, 25 A) no** | [informe SOLiC](https://portal.segen.co.uk/reseller/docs/SOLiC-Test-Report-No-2013.pdf) |
| EN 50106:2008 | Ensayo individual de serie de aparatos de EN 60335-1 | Descripción del ensayo de continuidad de tierra en la tienda de normas de Chipre | [CYS](https://std-ol.cys.org.cy/safety-of-household-and-similar-electrical-appliances-particular-rules-for-routine-tests-referring-to-appliances-under-the-scope-of-en-60335-1) |
| REBT, ITC-BT-19 §2.3 | Conductores de protección y sus conexiones, en instalaciones | Texto de la ITC. **Se aplica a instalaciones, no a aparatos** | [ITC-BT-19](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf) |
| IEC 60352-2:2024 | Conexiones crimpadas sin soldar | Solo el alcance (EVS). Sin los valores de tracción | [EVS](https://evs.ee/en/iec-60352-2-2024) |
| UL 486A-B | Terminales y conectores de hilo | Solo la tabla de fuerzas de arranque en resúmenes de Cirris y Molex. **La norma no** | [Cirris](https://cirris.com/crimp-pull-testers-pullout-force-per-wire-size/) |
| DIN 41611-3, DIN 46249-1, SEN 245010 | Fuerzas de arranque de crimpados | Solo los valores que citan Cirris (DIN 41611/3) y Würth (DIN 46249-1 y SEN 245010). Würth cita además la DIN 41611-3 para definir la altura del crimpado del aislante | [Cirris](https://cirris.com/crimp-pull-testers-pullout-force-per-wire-size/), [WE](https://www.we-online.com/catalog/media/o510301v410%20Visual%20inspection%20of%20crimped%20connections.pdf) |
| DIN 46234 | Ojal sin aislar (Phoenix 3240072) | Solo el dato de la ficha del distribuidor | [Bürklin](https://buerklin.com/en/p/phoenix-contact/cable-lugs/3240072/60P7279) |
| DIN 46237 | "Quetschkabelschuh isoliert" | Un distribuidor lo cita en un terminal de **horquilla** aislado de 0,5-1,5 mm², sin explicar el alcance de la norma | [sparepartsnow](https://www.sparepartsnow.de/produkte/stex24-quetschkabelschuh-din-46237-isoliert-gabelform-querschnitt-05mm-15mm-rot-transparent-cydt4s) |
| DIN 46225 | (citada en mi planteamiento inicial) | **No he encontrado nada.** Sin verificar | — |
| IEC 61238-1 | (citada en mi planteamiento inicial) | **No la he consultado.** Sin verificar | — |
| EN 60999-1, EN 60998-2-1 | Bornes de tornillo | Solo que la ITC-BT-19 considera conforme lo que cumpla UNE-EN 60998-2-1. Texto de la norma: no | [ITC-BT-19](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf) |
| ITC-BT-18 y ITC-BT-26 | Puesta a tierra (18); instalaciones en viviendas (26, por mi recuerdo) | **No las he abierto.** Sin verificar | — |

**Qué dicen los más relevantes**

- **EN 60335-1, cláusula 27 (a través del informe de ensayo).** El informe da por cumplidos cuatro requisitos: las partes metálicas accesibles de los aparatos de clase 1 están conectadas de forma permanente y fiable a un terminal de tierra (27.1); los medios de apriete del terminal de tierra están asegurados contra el aflojamiento accidental (27.2); no hay riesgo de corrosión por contacto entre las piezas del terminal de tierra (27.4); y la resistencia entre el terminal de tierra y las partes metálicas puestas a tierra es baja (27.5) ([informe](https://portal.segen.co.uk/reseller/docs/SOLiC-Test-Report-No-2013.pdf)). Es el sentido de los textos, no su redacción. **La norma original puede añadir condiciones** (por ejemplo, si el requisito 27.1 se limita a las partes que puedan quedar con tensión: mi recuerdo, sin verificar). Esa edición del informe es de 2010/2012: **no sé cuál es la edición vigente que te aplica** (la guía cita EN IEC 60335-2-82; la ficha del módulo C14 recoge que EVS marca su edición de 2022 como retirada el 16-09-2026).
- **EN 50106 (ensayo de serie).** Para aparatos de EN 60335-1, el ensayo de continuidad de tierra usa al menos 10 A desde una fuente de menos de 12 V, entre cada parte metálica accesible puesta a tierra y el punto de tierra. Límite: 0,1 Ω en general; para aparatos con cable de red, 0,2 Ω o 0,1 Ω más la resistencia del cable, según el resumen ([CYS](https://std-ol.cys.org.cy/safety-of-household-and-similar-electrical-appliances-particular-rules-for-routine-tests-referring-to-appliances-under-the-scope-of-en-60335-1)). Coincide con el 0,1 Ω y los 10-25 A de la guía §6. Es una fuente secundaria (descripción de tienda de normas).
- **ITC-BT-19 §2.3.** Las conexiones de los conductores de protección se hacen por soldadura sin ácido **o** por piezas de conexión de apriete por rosca. Esas piezas serán de material inoxidable, con los tornillos de apriete previstos para evitar su desapriete. Se considera que cumplen los dispositivos conformes a UNE-EN 60998-2-1. Las conexiones deben ser accesibles para verificación y ensayo. Entre metales distintos (el ejemplo es cobre-aluminio) hay que evitar el deterioro electroquímico ([ITC-BT-19](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf)). **Es una norma de instalación**: aplica a la instalación del bar, no a la máquina. La máquina se evalúa con la directiva de baja tensión y EN 60335-2-82 (guía §9). Mi lectura: sirve de buena práctica y confirma el sentido de la 27.2 y la 27.4. No dice que la conexión "deba ser por tornillo": admite soldadura.
- **IEC 60352-2:2024.** Cubre conexiones crimpadas sin soldar, con barriles aislados o sin aislar, en hilos trenzados de 0,05 a 10 mm². Describe procedimientos de ensayo y datos de experiencia para tener conexiones eléctricamente estables ([EVS](https://evs.ee/en/iec-60352-2-2024)). Cubre tu caso (1,5 mm²), pero no he podido leer sus valores de tracción. Würth cita la edición EN 60352-2:2006 para la inspección visual de crimpados ([WE](https://www.we-online.com/catalog/media/o510301v410%20Visual%20inspection%20of%20crimped%20connections.pdf)).
- **UL 486A-B.** Fuerzas mínimas de arranque de terminales según el calibre del cable. 16 AWG: 30 lb (133 N). 14 AWG: 50 lb (222 N) ([Cirris](https://cirris.com/crimp-pull-testers-pullout-force-per-wire-size/), [Molex](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/2931/Quality%20Crimp%20Handbook.pdf)). Cirris avisa de que es una tabla de referencia y de que hay que consultar las normas.

## 4. El cable de 1,5 mm² en el límite del terminal rojo

### 4.1 Lo que se sabe

- El cable de tierra sale de la manguera H05VV-F 3G1,5 (#22): clase 5 (hilo flexible, muchas hebras finas). Una ficha de H05VV-F 3G1,5 limita el conductor a 60 °C y cita EN 50525-2-11 ([Faber Kabel, vía Conrad](https://asset.conrad.com/media10/add/160267/c1/-/en/001152275DS02/adatlap-1152275-toemlos-vezetek-h05vv-f-3-g-15-mm-fekete-faber-kabel-030020-meteraru.pdf)). Esa ficha **no da el diámetro del hilo aislado**: solo el del cable completo (8,2 mm), igual que [elektrikshop](https://www.elektrikshop.de/h05vv-f-3g1-5-pvc-schlauchleitung-weiss.html) (8,1 mm).
- **El diámetro del hilo aislado de 3,0-3,5 mm de mi planteamiento inicial no lo he podido comprobar.** Mi estimación es de 3,0 a 3,3 mm (cobre de clase 5 de 1,6-1,8 mm más dos paredes de 0,7 mm de PVC; **ambas cifras son de memoria, sin fuente**). Mídelo.
- Los terminales de la tabla 2.2 son de rango 0,5-1,5 mm² o 22-16 AWG. Con 1,5 mm² clase 5 se está en el límite superior del rojo en Phoenix y RS PRO, dentro del rango de TE, y **fuera del rojo de Klauke**.
- No he podido leer el diámetro máximo de aislante que admite el collar de ningún terminal: la ficha de TE está vacía y las de RS PRO no lo dan. Como referencia, el collar del Phoenix 3240018 mide 4,1 mm por dentro ([PDF](https://asset.conrad.com/media10/add/160267/c1/-/de/000676042DS01/datasheet-676042-phoenix-contact-3240018-ring-terminal-hole-o43-mm-partially-insulated-red-100-pcs.pdf)), lo que dejaría holgura para un hilo de 3,3 mm. **En el tuyo no lo sé.**

### 4.2 Qué medir con calibre y qué hacer con el resultado

Todo esto es procedimiento mío, no de una norma.

| Medida | Cómo | Qué buscar |
|---|---|---|
| Diámetro del hilo aislado | Calibre, 3 puntos de un tramo pelado de la manguera | Anota el máximo. Esperado 3,0-3,3 mm (estimación mía) |
| Diámetro del cobre sin aislar | Pela 7 mm (el pelado que da Phoenix) y mide el cobre sin aplastarlo | Esperado 1,6-1,8 mm (estimación mía) |
| Agujero del ojal | Broca de 4,3 mm: debe pasar. Un tornillo M4 pasa sin holgura exagerada | Entre 4,16 y 4,34 mm en las fichas. Debe pasar el M4 y no pasar una broca de 4,6 mm |
| Interior del collar aislante | Brocas o varillas calibradas de 3,2, 3,4, 3,6 y 3,8 mm | Debe admitir el hilo aislado sin forzarlo y sin holgura de más de 0,5 mm (criterio mío) |
| Interior del barril | Prueba de inserción con el cobre pelado | Todas las hebras entran hasta el tope sin cortar ninguna |
| Ancho del ojal y de la funda | Calibre | Para comparar con la arandela dentada y con los ojales vecinos del apilado |

**Prueba de inserción con 3 terminales sacrificados:**

1. Pela 7 mm, retuerce ligeramente las hebras en el sentido de las agujas del reloj y mételas en el barril.
2. Si entra todo el cobre hasta el tope y el aislante llega al collar, el rojo vale. Si quedan hebras fuera o hay que forzar, no recortes hebras: cambia al terminal de la talla siguiente (azul).
3. Si el aislante del cable no entra en el collar, el rojo no sirve para este cable, aunque el cobre quepa.
4. Crimpa, corta el terminal en sección con una sierra fina o un alicate de corte y mira: sin huecos grandes, sin hebras cortadas ni hebras fuera del barril (criterios de Würth y Molex en el apartado 5).

El azul tiene el barril más ancho, pero la matriz de crimpado debe ser la de su talla. Un barril azul crimpado con la matriz del rojo no cierra bien (mío).

### 4.3 Por qué importa

Un barril lleno al límite puede dejar hebras sin atrapar o dañarlas al crimpar. Würth cuenta como defecto las hebras cortadas o rotas en el crimpado y las hebras fuera del crimpado (error de inserción) ([WE](https://www.we-online.com/catalog/media/o510301v410%20Visual%20inspection%20of%20crimped%20connections.pdf)). Molex enumera entre las causas de poco tirón las hebras cortadas o con muescas, la altura de crimpado demasiado baja o alta, y un crimpado del aislante que atraviesa la pared ([Molex](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/2931/Quality%20Crimp%20Handbook.pdf)). Según la misma fuente, un crimpado de dos hilos no es mejor que el del hilo más pequeño; no pongas dos cables en un ojal.

## 5. Crimpado: herramienta, procedimiento y comprobación

### 5.1 La crimpadora #28

- **Qué sé:** la hoja describe la #28 como "crimpadora autoajustable + 1250 punteras". La ficha de esa pieza es aparte. No la he visto.
- **Qué dicen las fuentes sobre la categoría.** El catálogo de McMaster separa las crimpadoras de trinquete para terminales y empalmes (ojal, horquilla y faston, aislados de 22 a 10 AWG) de las de punteras. Dentro de las de punteras distingue las de ranura fija y las de **ranura autoajustable** (26-8 AWG, perfil cuadrado), que ajustan el crimpado al calibre de cada puntera ([McMaster](https://www.mcmaster.com/products/terminal-crimpers)). Una crimpadora autoajustable de AutomationDirect se describe como apta para punteras aisladas y sin aislar de 26 a 8 AWG, con perfil trapecial, y su lista de usos nombra también terminales y conectores sin concretar ([IMPO](https://www.impomag.com/home/electrical-equipment-supplies/product/21062286/automationdirect-selfadjusting-rotatable-die-crimping-tool)).
- **Mi lectura:** "autoajustable" apunta a punteras. Que sirva para ojales preaislados lo decide su ficha, no la palabra. **Riesgos** de usar una de punteras en un ojal: la mordaza cierra el barril con un perfil pensado para el tubo de una puntera, y puede cortar o perforar el aislante del collar si la mordaza abarca también la funda. No he encontrado ninguna fuente que lo diga con estas palabras: es mi deducción.
- **Cómo salir de la duda sin leer nada:** haz la prueba del apartado 5.3 con 5 terminales. Si las 5 pasan el tirón y el corte, vale para este ojal. Si alguna falla, compra una crimpadora de trinquete para terminales aislados. RS PRO recomienda herramientas distintas según el modelo (533-279, 267-3133 y 125-1964 en las páginas de los tres ojales rojos que miré); **no he visto qué herramientas son**. La ficha del kit 613-9952 describe la 125-1964 como una crimpadora de trinquete de 0,5 a 6 mm para todos los terminales aislados del kit ([ficha del kit](https://docs.rs-online.com/2883/A700000006574165.pdf)), es decir, esa es la categoría de herramienta que corresponde al ojal.

### 5.2 Procedimiento (mío, apoyado en Molex y Würth)

1. Pela 7 mm (valor de Phoenix) sin cortar hebras.
2. Inserta hasta el tope, con el aislante dentro del collar y el cobre visible por el extremo del barril (Würth exige que se vea el cobre en el extremo y que ambos, conductor y aislante, estén visibles en la transición).
3. Crimpa con la matriz de la talla del terminal, en el barril (no en el ojal ni en la funda más allá de lo que marca la herramienta). Con trinquete, hasta que suelte.
4. Tira a mano. Después mide el tirón de una muestra (apartado 5.3).
5. Revisa con lupa o con el móvil con zoom (apartado 5.4).
6. Si el cable es flexible, aplica el apartado 7 antes de montar.

### 5.3 Tirón

| Calibre | UL 486A (terminales) | DIN 41611/3 | NASA-STD 8739.4 | SAE AS7928 |
|---|---|---|---|---|
| 16 AWG | **30 lb = 133 N** | 39,8 lb = 177 N | 41 lb = 182 N | 50 lb = 222 N |
| 14 AWG | 50 lb = 222 N | 58,0 lb = 258 N | 65 lb = 289 N | 70 lb = 311 N |

Fuente: [Cirris](https://cirris.com/crimp-pull-testers-pullout-force-per-wire-size/), en libras. El paso a newtons es cálculo mío (1 lb = 4,448 N). La columna UL 486A coincide con la del manual de Molex (16 AWG: 133,5 N; 14 AWG: 222,6 N). Cirris avisa de que es una tabla de referencia y remite a las normas.

- **El 1,5 mm² (unos 15,4 AWG, cálculo mío) cae entre el 16 y el 14 AWG.** Como criterio de aceptación **mío**: no menos de 133 N en ninguna muestra, y mejor más de 177 N. Molex compara el valor **más bajo** de la muestra con el mínimo y pide al menos 5 lecturas para confirmar una puesta a punto y 25 para estudiar la capacidad del proceso ([Molex](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/2931/Quality%20Crimp%20Handbook.pdf)). Con tu volumen basta con 5 lecturas por cada cambio de lote o de herramienta.
- **Otras referencias para comparar el orden de magnitud:** DIN 46249 (conectores planos) pide 200 N mínimos para 1,5 mm² con lengüetas de 4,8 a 9,5 mm, y SEN 245010 pide 150 N por mm² ([WE](https://www.we-online.com/catalog/media/o510301v410%20Visual%20inspection%20of%20crimped%20connections.pdf); la parte de esa tabla de Würth basada en IEC salió corrupta en la extracción, por eso no la uso). Ninguna es la de los ojales, así que son solo referencia.
- **Cómo medirlo sin laboratorio (mío):** una báscula de colgar de 25 kg (unos 245 N) o un dinamómetro. Sujeta el cable y el ojal por el agujero con un tornillo pasante, tira recto y sin tirones, y anota el valor máximo. Molex indica tirar a 1 pulgada por minuto, sujetando el cable y el contacto y no la zona del crimpado ([Molex](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/2931/Quality%20Crimp%20Handbook.pdf)). Würth manda ensayar con el agarre del aislante abierto, para medir solo el crimpado del conductor ([WE](https://www.we-online.com/catalog/media/o510301v410%20Visual%20inspection%20of%20crimped%20connections.pdf)); en un ojal preaislado eso no es posible, así que tu ensayo mide el conjunto (deducción mía). Con un tirón de mano no se mide nada: sirve para descartar un crimpado frío, no para aceptar.
- **Cuidado (mío):** los valores de arriba son mínimos de arranque. Un crimpado puede pasar el tirón y aun así tener una resistencia alta si el barril está demasiado flojo. La resistencia total de la unión se mide con la tierra montada (apartado 6.6).

### 5.4 Inspección visual

Criterios de Würth ([WE](https://www.we-online.com/catalog/media/o510301v410%20Visual%20inspection%20of%20crimped%20connections.pdf)) y Molex ([Molex](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/2931/Quality%20Crimp%20Handbook.pdf)), adaptados a un ojal:

| Qué mirar | Aceptable | Rechazo |
|---|---|---|
| Barril | Cerrado, sin zonas vacías ni sobrellenadas | Sin cerrar (crimpado flojo), grietas en la base (crimpado excesivo), rebabas fuertes |
| Hebras | Todas dentro del barril; el cobre se ve por el extremo | Hebras fuera del crimpado, cortadas o rotas |
| Posición del aislante del cable | Conductor y aislante visibles en la transición | Aislante bajo el crimpado del conductor (pelado corto) o cobre largo a la vista (pelado largo) |
| Entrada del barril ("bell mouth") | Embudo visible | Sin embudo, o hebras que se rompen dentro del crimpado (crimpado demasiado bajo) |
| Aislante del terminal | Sujeta el aislante del cable sin perforarlo | Perforado, cortado, o sin marca de presión del agarre |
| Torsión | El barril y el ojal alineados | Terminal torcido o con el ojal doblado (Würth: máx. 10° entre la zona de crimpado y el cuerpo) |
| Doblez de comprobación (Molex) | El hilo aguanta doblarse 60-90° en cualquier dirección varias veces sin que el aislante resbale ni el hilo se corte | Aislante que resbala o cobre que se corta |

Molex dice que un agarre de aislante grande debe abrazar al menos el 88 % del hilo y uno pequeño al menos el 50 %, sin cortar las hebras, y que se tolera que el agarre perfore el aislante solo en herramientas manuales baratas sin ajuste ([Molex](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/2931/Quality%20Crimp%20Handbook.pdf)); Würth rechaza el aislante perforado. **Para el ojal de tierra, trata la perforación del aislante del cable como rechazo.**

## 6. Montaje en el espárrago de tierra

### 6.1 Qué exigen las normas que he podido leer

- Conexión permanente y fiable a un terminal de tierra (EN 60335-1 27.1), apriete asegurado contra el aflojamiento (27.2), sin riesgo de corrosión entre las piezas del terminal (27.4) y baja resistencia (27.5), según el informe de ensayo ([informe](https://portal.segen.co.uk/reseller/docs/SOLiC-Test-Report-No-2013.pdf)).
- Para la instalación: piezas de rosca inoxidables, tornillos previstos contra el desapriete, conexiones accesibles y precaución con metales distintos ([ITC-BT-19 §2.3](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf)).
- **Sin verificar:** si EN 60335-1 exige que el terminal de tierra para el cable de red no sirva a la vez para otras conexiones, cuántos conductores admite un mismo terminal y cuál es el par de ensayo de un tornillo M4. No he podido leer el texto.

### 6.2 Par de apriete

- **No he podido verificar el 1,2 N·m de mi planteamiento inicial para un M4** (tabla de pares de ensayo de EN 60335-1, o EN 60999-1). No he leído ninguna de esas tablas. La búsqueda de la tabla no devolvió ningún texto legible.
- Referencia de orden de magnitud, no norma: la tabla de Gedore da 3,0 N·m para un M4 de clase 8.8 con coeficiente de rozamiento 0,14 (2,4-3,2 N·m según el coeficiente) ([Gedore](https://us.gedore.com/fileadmin/Service/Tabellen_Downloads/Techn_Tabellen_2018_EN.pdf)). No trae inox A2-70, que es peor, y no dice nada del espárrago soldado por puntos, que tiene su propio límite de par (ficha #25).
- **Mi propuesta provisional:** 1,0-1,2 N·m con llave dinamométrica pequeña (o la menor que dé el fabricante del espárrago), y reapretar después del primer ciclo térmico. Es una práctica mía; el borne FG de la LRS usa 8-10 kgf·cm (0,8-1,0 N·m) según la ficha #14, pero es otro tornillo (apartado 6.4).

### 6.3 Apilado de ojales

- **Práctica habitual (no normativa):** como máximo 2-3 terminales por espárrago, planos y a tope entre sí, el de mayor corriente abajo, con tuerca autoblocante en vibración ([ARH Foundation](https://www.arhfoundation.org/connect-ring-terminals-together)). Es una guía de aficionados a la aviación: indico que no es una norma.
- **Tu guía (§6):** chapa, arandela dentada, ojal del C14, tuerca, contratuerca; encima otra arandela dentada, los ojales de la LRS, del panel, de la caja interior y del cajón, y otra tuerca. Son 1 + 4 ojales.
- **Cálculo de la altura (mío, con cotas de tuerca y arandela de memoria, sin verificar: tuerca M4 de 3,2 mm, arandela dentada de 0,5 mm, ojal de 0,75-0,8 mm):** primera tanda, 0,5 + 0,8 + 3,2 + 3,2 = 7,7 mm. Segunda tanda, 0,5 + 4 × 0,8 + 3,2 = 6,9 mm. Total 14,6 mm sobre un espárrago de 20 mm: entra, con unos 3-5 mm de margen (la longitud roscada exacta del espárrago de la #25 no la sé).
- **Mi consejo:** repartir en dos espárragos, o añadir un borne de tierra intermedio, en lugar de apilar cinco. Con cinco ojales, tocar uno obliga a aflojar la tuerca que aprieta a los demás (razonamiento mío). La guía ya piensa en que quitar un cable interno no suelte la tierra de entrada: eso se conserva si la entrada tiene su propio espárrago.
- Orienta los ojales de modo que girar la tuerca en el sentido de apriete los apriete contra el espárrago y no los empuje fuera (práctica general mía).

### 6.4 Extremo de la fuente (borne FG de la LRS-50-5)

La ficha de la fuente apunta que los bornes de la LRS-50 llevan tornillo **M3,5** (según una copia del manual en montersi.pl) con 8-10 kgf·cm, y que no pudo comprobar la sección máxima del borne ([ficha #14](../meanwell-lrs-50-5/README.md)). **Un ojal M4 (agujero de 4,3 mm) no sirve en un tornillo M3,5.** La guía pone "ojal / puntera" en ese extremo: con puntera es correcto. Si el borne admite ojal, sería de M3,5 (agujero de 3,7 mm), y habría que comprar de esa talla. Es una discrepancia con la compra (apartado 12).

### 6.5 Corrosión galvánica

Índice anódico (voltios) en dos tablas de buena práctica. Mi recuerdo es que vienen de MIL-STD-889, pero la página de Engineers Edge no lo cita y no lo he podido confirmar:

| Material | Índice anódico | Fuente |
|---|---|---|
| Estaño, chapado de estaño | 0,65 (0,60 en otra fila) | [ATIS](https://peg.atis.org/wp-content/uploads/2019/03/Grounding_and_Corrosion_of_Dissimilar_Materials-SUlemek.pdf), [Engineers Edge](https://www.engineersedge.com/galvanic_capatability.htm) |
| Acero inoxidable con 18 % de cromo | 0,50 | las mismas |
| Latón y bronce | 0,40 | las mismas |
| Cobre, macizo o chapado | 0,35 | las mismas |
| Hierro, acero al carbono | 0,85 | las mismas |
| Zinc, chapado de zinc | 1,25 | las mismas |

Regla de las dos fuentes: diferencia máxima de 0,15 V en ambientes duros (exterior, humedad alta, sal), 0,25 V en ambiente normal sin control, 0,50 V en ambiente controlado.

- **Ojal estañado sobre espárrago inox:** 0,65 − 0,50 = 0,15 V (cálculo mío). Cumple incluso el límite duro. El cobre desnudo con inox también da 0,15 V, y el latón 0,10 V.
- **Ojal estañado sobre acero (el chasis):** 0,65 − 0,85 = 0,20 V. Cumple el límite normal.
- **Espárrago inox sobre chasis de acero al carbono:** 0,85 − 0,50 = 0,35 V. En ambiente normal sobrepasa el límite de 0,25 V, y el acero (más anódico) es el que se corroe, junto a la soldadura. Con chasis zincado, 1,25 − 0,50 = 0,75 V; con galvanizado en caliente (1,20), 0,70 V. **No sé de qué material y acabado es la chapa del chasis.** Es un tema de la ficha del espárrago (#25), pero afecta a esta cadena. Las páginas no tienen una fila para el inox de la serie 300 (304): usé la de 18 % de cromo como la más cercana.
- **Arandela dentada (#24):** si es de acero zincado, contra el ojal estañado da 1,25 − 0,65 = 0,60 V (cálculo mío), más que con una de inox (0,15 V). No sé de qué material son las de la hoja; la ficha #24 lo dirá. La ITC-BT-19 pide piezas de rosca inoxidables (apartado 3.2).
- Las dos fuentes son guías cualitativas. El documento de ATIS añade que los mejores resultados de resistencia de contacto fueron cobre sobre cobre y que un inhibidor de óxido estabilizó la resistencia ([ATIS](https://peg.atis.org/wp-content/uploads/2019/03/Grounding_and_Corrosion_of_Dissimilar_Materials-SUlemek.pdf)). **Mi conclusión:** el ojal estañado de cobre sobre inox y acero es una combinación aceptable. La zona crítica es la unión espárrago-chasis y la humedad: un bar tiene bebidas derramadas. Un inhibidor de óxido en las superficies de contacto es una opción que valorar (en las pruebas de ATIS mejoró la estabilidad de la resistencia); no lo he comprobado para esta unión.

### 6.6 Medida de resistencia

Después del montaje: 0,1 Ω máximo desde el pin de tierra del C14 hasta cada pieza metálica (guía §6), con un comprobador que inyecte 10 A o más; es lo que describe EN 50106 ([CYS](https://std-ol.cys.org.cy/safety-of-household-and-similar-electrical-appliances-particular-rules-for-routine-tests-referring-to-appliances-under-the-scope-of-en-60335-1)). Para saber cuánto gasta cada unión, mide cada una con un microohmímetro de 4 hilos si lo tienes. Cálculo mío del cable: un hilo de 1,5 mm² clase 5 tiene como máximo 13,3 Ω/km (valor de IEC 60228 de memoria, sin verificar), unos 7 mΩ por medio metro. Una unión crimpada y atornillada bien hecha es del orden de milésimas de ohmio; una cifra de décimas indica un ojal flojo o una arandela sobre pintura.

## 7. Ojales de cables que se mueven (cajón y caja interior)

### 7.1 Qué pasa con un ojal en un cable que se flexiona

- El ojal crimpado es un punto rígido. El cable se dobla a la salida del barril y las hebras trabajan en ese punto hasta romper. Es el mismo mecanismo que describen los de aviación en un hilo de masa de magneto: en un ensayo que su autor llama "muy poco científico", los terminales del kit estándar se partieron a las 4 flexiones, unos "de buena calidad" a las 8 y los de una marca de gama alta aguantaron más de 20 ([Van's Air Force](https://vansairforce.net/goto/post?id=1154719), foro). Es una anécdota de un caso más duro (vibración de motor), pero es el mismo modo de fallo.
- Para evitarlo, un participante del mismo hilo propone sujetar el hilo con una abrazadera y añadir capas de termorretráctil para que el cable no se mueva justo en el terminal. El agarre del aislante del terminal es en sí el alivio de tracción (Molex lo llama "strain relief") y debe sujetar el aislante sin cortarlo ([Molex](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/2931/Quality%20Crimp%20Handbook.pdf)).
- La ficha de H05VV-F da un radio de curvatura de 5 veces el diámetro para uso móvil ([Faber](https://asset.conrad.com/media10/add/160267/c1/-/en/001152275DS02/adatlap-1152275-toemlos-vezetek-h05vv-f-3-g-15-mm-fekete-faber-kabel-030020-meteraru.pdf)), pero es el radio del cable completo, no del hilo suelto. Extrapolando a un hilo de 3,2 mm saldrían unos 16 mm de radio (extrapolación mía).
- **Ciclos:** no he encontrado una cifra de vida en ciclos para un ojal crimpado en hilo de clase 5. **Sin verificar.** La norma EN 60335-1 tiene un ensayo de flexión de conductores internos (cláusula 23.3, por mi recuerdo, con 10.000 flexiones: **no lo he podido leer**). Si la máquina es para vender, esa cláusula la revisará quien haga el análisis de riesgos.

### 7.2 Medidas para el cajón y la caja suspendida (mías)

1. **Holgura con curva amplia.** Deja un seno de cable que se doble sobre un radio de al menos unos 20 mm, lejos del ojal, y que no se tense en ningún extremo del recorrido.
2. **Sujeta el cable** con una brida a un punto fijo a 30-50 mm del ojal del lado que se mueve, de modo que la flexión ocurra en el tramo libre y no en el barril. Es el mismo criterio que el de la ficha de la clavija XH ([ficha #7](../cables-jst-xh-4-pin/README.md), apartado 6.3).
3. **Termorretráctil con adhesivo** sobre el barril y 15-20 mm de cable, **después** de inspeccionar el crimpado (la funda lo oculta). Cable Ties Unlimited recomienda termorretráctil para vibración y humedad ([Cable Ties Unlimited](https://www.cabletiesunlimited.com/learn/most-common-uses-for-ring-terminals-and-10-tips/)).
4. **Hilo más flexible.** Un hilo de clase 6 (extraflexible, de silicona, 1,5 mm²) soporta más flexiones que el de PVC de clase 5. Son piezas distintas del H05VV-F de la guía (mío, sin producto concreto).
5. **Trenza de tierra.** Para las piezas que se mueven mucho, una trenza plana estañada con ojales ya prensados (mío, sin producto concreto) sustituye al hilo y aguanta la flexión mejor. No he comparado productos.
6. **Cajón:** si el cajón sale a menudo, mide la continuidad de su tierra con el cajón en las dos posiciones y en movimiento (la lectura no debe saltar).
7. **Caja interior suspendida:** el cable de tierra vibra siempre con los muelles. Es el sitio donde más me preocupa la fatiga. Tras cualquier prueba de vibración o de transporte, vuelve a medir la continuidad de esa tierra.
8. **Marca la fecha** de montaje de los dos hilos flexibles y revísalos en el mantenimiento.
9. **Comprueba si hace falta.** El informe de ensayo resume la 27.1 como "partes metálicas accesibles" conectadas de forma permanente y fiable. Mi recuerdo es que la norma lo limita a las que puedan quedar con tensión por un fallo de aislamiento (**sin verificar**). Que el cajón y la caja interior lo necesiten depende de si algo de 230 V puede tocarlos. La guía los pone a tierra, que es lo seguro.

## 8. Fallos, bugs y problemas conocidos

La base de evidencia es **escasa para este tipo de pieza**: no he encontrado pruebas independientes de lotes de ojales de Amazon (una búsqueda dedicada solo devolvió páginas de venta) ni retiradas. Lo que sigue combina fuentes de crimpado de fabricantes (Molex, Würth) con riesgos plausibles, rotulados como míos.

| # | Problema | Gravedad para el proyecto | Fuente |
|---|---|---|---|
| 1 | Crimpado flojo o frío: el cable sale del ojal con poca fuerza | Alta (tierra) | Molex, Würth |
| 2 | Barril al límite con cable clase 5 de 1,5 mm²: hebras fuera o cortadas | Media-alta | Würth, Molex; apartado 4 |
| 3 | Collar aislante que no admite el aislante grueso del cable | Media | Mío; apartado 4 |
| 4 | Crimpadora de punteras usada en un ojal (aislante partido o barril mal cerrado) | Media-alta | McMaster; resto mío |
| 5 | Aislante del terminal o del cable perforado al crimpar | Media | Würth, Molex |
| 6 | Ojal aflojado por vibración o ciclos térmicos | Alta | ITC-BT-19, informe EN 60335-1, ARH |
| 7 | Apilado de cinco ojales en un espárrago | Media | ARH (no normativa); guía §6 |
| 8 | Fatiga del hilo en los dos cables flexibles | Media-alta | Van's Air Force (foro), Molex; resto mío |
| 9 | Agujero equivocado: M5 (5,3 mm) o M3,5 (3,7 mm) en lugar de M4; o agujero justo (4,16 mm) | Media | RS PRO |
| 10 | Rojo de 0,5-1,0 mm² en lugar de 0,5-1,5 mm² (Klauke) | Media | Bürklin |
| 11 | Latón, hierro o chapado fino en lugar de cobre estañado | Media | Cable Ties Unlimited (latón); resto mío |
| 12 | Corrosión galvánica en la unión espárrago-chasis | Media (bar húmedo) | ATIS, Engineers Edge |
| 13 | Ojal "abierto" (horquilla) por error en la caja | Alta si ocurre | Mío |
| 14 | Datos contradictorios en el anuncio (temperatura, medidas) | Baja | RS PRO 534-216A |
| 15 | Lote de 25 uds.: no alcanza para repuestos ni para pruebas | Baja | Apartado 10 |

### 8.1 Crimpado flojo o frío (alta)

Molex lista como causas de poco tirón las hebras cortadas, una altura de crimpado demasiado baja o alta, un embudo ("bell mouth") pequeño o ausente, una pared del aislante atravesada y un material del terminal demasiado fino (relevante en terminales baratos), y que un cable que se sale del agarre se asocia a serraciones ligeras del terminal ([Molex](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/2931/Quality%20Crimp%20Handbook.pdf)). El manual **no usa** la expresión "crimpado frío" ni "hebras sueltas": no la atribuyo a Molex. Cirris recuerda que sus valores son de referencia y no sustituyen a la norma ([Cirris](https://cirris.com/crimp-pull-testers-pullout-force-per-wire-size/)).

### 8.2 Barril al límite y collar justo (media-alta)

Apartado 4. Resumen: pelar 7 mm, probar la inserción, medir con calibre y no recortar hebras. Si el ojal rojo no admite el hilo, el azul (matriz del azul) es la salida.

### 8.3 Herramienta equivocada (media-alta)

Apartado 5.1. McMaster separa las crimpadoras de terminales de las de punteras, y la autoajustable es de las segundas. La hoja describe la #28 como autoajustable con punteras. Mi deducción es que puede dañar el ojal. **No lo he comprobado con la #28.**

### 8.4 Aflojamiento por vibración y ciclos térmicos (alta)

La máquina de un bar recibe golpes y vibración por el uso y calienta y enfría (mío). El informe de EN 60335-1 recoge que el apriete del terminal de tierra debe estar asegurado contra el aflojamiento accidental (27.2) y la ITC-BT-19 pide tornillos previstos contra el desapriete. La guía usa arandela dentada y contratuerca. Una tuerca autoblocante (nylon) es preferible en vibración ([ARH Foundation](https://www.arhfoundation.org/connect-ring-terminals-together), no normativa), pero el nylon limita la temperatura (dato que no he comprobado). **Mío:** marca las tuercas con pintura de sellado después del par para ver a simple vista si giran, y reaprieta al mes.

### 8.5 Ojal M5 por M4 (media)

Un agujero de 5,3 mm sobre un M4 deja el ojal descentrado. Mide el agujero con una broca. Si el lote trae varios tamaños, sepáralos antes de empezar.

### 8.6 Material y calidad del lote (media)

- **Sin datos de lote concretos.** No hay marca que falsificar: es un artículo genérico. El riesgo es de material y de medidas. Cable Ties Unlimited indica que el latón conduce menos que el cobre y "limita el uso en alta corriente"; el cobre estañado mejora la resistencia a la corrosión; no habla de magnetismo ni de espesor de chapado ([Cable Ties Unlimited](https://www.cabletiesunlimited.com/blogs/learn/ring-terminal-materials-choosing-the-right-one-for-electrical-applications)). Latón o cobre llevan estaño y no son magnéticos, así que **un imán solo detecta hierro o acero estañado, no latón** (física general, mío).
- Las fichas indican cobre (Phoenix, sin decir el chapado) o cobre estañado (RS PRO, TE, Klauke). Un distribuidor describe un terminal de horquilla como cobre CU-ETP (electrolítico) estañado con poliamida ([sparepartsnow](https://www.sparepartsnow.de/produkte/stex24-quetschkabelschuh-din-46237-isoliert-gabelform-querschnitt-05mm-15mm-rot-transparent-cydt4s)). Si el anuncio del tuyo no dice el material, no lo sabes.
- **Comprobación (mía):** corta un terminal por la mitad con un alicate o lima una esquina del ojal: el cobre se ve rojizo y el latón amarillo; el hierro se pega a un imán. La conductividad no se puede medir con un polímetro corriente en una pieza tan pequeña.
- Un estañado fino sobre latón puede dejar el latón a la vista y oxidarse en un bar húmedo (mío): inspecciona los terminales guardados.

### 8.7 Datos contradictorios en las páginas de venta (baja)

La RS PRO 267-3622 pone 105 °C en la tabla y 150 °C en la lista de características, y la 534-216A pone 75 °C como mínimo y máximo. Si el anuncio de Amazon trae cifras, tómalas con reserva. El cable H05VV-F limita a 60 °C de conductor según [Faber](https://asset.conrad.com/media10/add/160267/c1/-/en/001152275DS02/adatlap-1152275-toemlos-vezetek-h05vv-f-3-g-15-mm-fekete-faber-kabel-030020-meteraru.pdf); el terminal no es el límite térmico.

### 8.8 Lo que no he podido documentar

Fallos concretos de ojales de Amazon con 230 V, retiradas o avisos de seguridad (CPSC, Safety Gate): no los busqué en esos portales. Falsificaciones de ojales con marca de certificación: sin fuente. Estañado fino: sin fuente.

## 9. Qué comprobar al recibirlo

Hazlo con el lote antes de montar nada. Es todo procedimiento mío salvo lo atribuido.

| Prueba | Cómo | Aceptable |
|---|---|---|
| Etiqueta y cantidad | Cuenta las 25 piezas. Mira la bolsa: sección o AWG, tamaño M4, color, marca | Todas del mismo color, con la medida visible |
| Color y rango | Compara con la tabla 2.4 | Rojo para 0,5-1,5 mm²; si es amarillo o azul, no es este |
| Agujero | Broca de 4,3 mm pasa; un tornillo M4 pasa sin holgura exagerada | 4,16-4,34 mm en las fichas |
| Ojal cerrado | Mira que el ojal sea un anillo completo | Sin abertura, sin horquilla |
| Imán | Acércalo a 10 piezas | No se pegan (si se pega, hierro o acero) |
| Material | Lima o corta 1-2 piezas | Rojizo por dentro (cobre) y estaño por fuera |
| Estañado | Mira el brillo | Uniforme, sin zonas rojas desnudas |
| Aislante | Doblar la funda ligeramente | No se agrieta ni se parte |
| Collar | Prueba con el hilo (apartado 4.2) | Entra el hilo aislado |
| Barril | Prueba de inserción | Entra todo el cobre |
| Tirón | 5 crimpados medidos (apartado 5.3) | 133 N o más cada uno |
| Corte | Corta un crimpado en sección (apartado 4.2) | Sin huecos grandes ni hebras cortadas |
| Dimensiones | Calibre: ancho del ojal, largo del barril, espesor | Compara con la tabla 2.2 |
| Con la tierra montada | Resistencia desde el C14 hasta cada pieza metálica | 0,1 Ω como máximo (guía; EN 50106) |

Anota marca, fecha y foto del lote para el expediente técnico de la máquina (la guía §9 ya pide el análisis de riesgos).

## 10. Cuántos hacen falta y repuestos

La guía no da un número. Esta es mi cuenta a partir de su tabla §5.1:

| Unión | Ojales M4 en el espárrago | Ojales M4 en el otro extremo | Nota |
|---|---|---|---|
| C14, pin de tierra, a espárrago | 1 | 0 (faston, #27) | La guía dice "Faston / ojal M4" en el C14. Los módulos genéricos comparables usan faston de 4,8 × 0,8 mm ([ficha #15](../modulo-c14-fusible-interruptor/README.md)): **sin verificar en tu módulo**; si el pin fuera de tornillo, +1 |
| Espárrago a LRS, borne FG | 1 | 0 (puntera) | El borne FG es M3,5 (apartado 6.4) |
| Espárrago a panel frontal | 1 | 1 | Si el panel es atornillado ("ojal M4 en los dos extremos") |
| Espárrago a caja interior | 1 | 1 | Extremo lejano implícito, no escrito en la guía |
| Espárrago a cajón | 1 | 1 | Extremo lejano implícito, no escrito en la guía |
| **Total** | **5** | **3** | **8** (6 seguros + 2 implícitos; 9 si el C14 también va con ojal) |

- **6 a 8 ojales por máquina**, según la solución para los extremos lejanos. Mi planteamiento inicial mencionaba "unos 7".
- **25 uds. dan 3 máquinas** con 1 sobrante, sin contar prácticas ni fallos. El ensayo de tirón es destructivo (5 piezas por lote o cambio de herramienta) y los primeros crimpados suelen salir mal: con eso, 25 alcanzan para 2 o 3 máquinas.
- **Mi recomendación:** un lote de 100 (o 2 de 25 más 5 de ensayo). A título de referencia, RS PRO vende 100 ojales de nylon M4 rojos (267-3622) por 9,60 € sin IVA, unos 0,10 € por unidad ([RS](https://de.rs-online.com/web/p/ringkabelschuh/2673622)); frente a los 0,22 € de la hoja, cuyo anuncio no conozco. No he comprobado disponibilidad ni precio actual de ninguno. Phoenix, TE y Klauke se venden por distribuidores europeos.
- **Repuestos:** deja unos ojales fuera del lote de las máquinas para reparaciones. Un ojal crimpado no se reutiliza: se corta y se crimpa uno nuevo (práctica mía).
- **Disponibilidad y vida del producto:** el ojal aislado de 0,5-1,5 mm² es un artículo de catálogo de muchos fabricantes (el extracto de Phoenix es de 2013) y no veo riesgo de descatalogación de la familia. El riesgo es el anuncio concreto de Amazon, que puede cambiar de fabricante o de lote sin avisar (mío, sin fuente).

## 11. Alternativas

Solo si el lote resulta flojo. Disponibilidad y precio de cada una: **sin verificar**.

| Opción | Por qué | Fuente |
|---|---|---|
| Ojal de marca (Phoenix C-RCI 1,5/M4, TE PIDG 31886, RS PRO serie RNYD) | Datos de ficha y trazabilidad | Tabla 2.2 |
| Ojal azul (1,5-2,5 mm² en el kit de RS PRO) | Si el rojo no admite el hilo de 1,5 mm² clase 5 | Apartado 4; [ficha del kit](https://docs.rs-online.com/2883/A700000006574165.pdf) |
| Bloque de tierra (borne PE de carril) en vez de apilar ojales | Reduce el apilado: un borne por cable y un solo cable al espárrago (mío, sin producto concreto) | Apartado 6.3 |
| Punteras en vez de ojal en los puntos de rosca pequeña | La guía ya lo usa en el borne FG | Guía §5.1 |
| Trenza de tierra flexible | Para el cajón y la caja suspendida | Apartado 7 |
| Hilo extraflexible (clase 6) para los hilos que se mueven | Más vida a flexión | Apartado 7 |

No he mirado Weidmüller, Hellermann, 3M, Vogt ni los ojales de Molex: no están en esta ficha por falta de presupuesto de búsquedas.

## 12. Discrepancias con la guía de montaje y con mi planteamiento inicial

| # | La guía o mi planteamiento inicial dicen | Lo que he encontrado | Fuente |
|---|---|---|---|
| 1 | Planteamiento inicial: "UL 486A-B, unos 40-50 N para 16 AWG" | UL 486A para terminales da **30 lb = 133 N** para 16 AWG; 40-50 N corresponde a un 22 AWG (8 lb = 36 N) | [Cirris](https://cirris.com/crimp-pull-testers-pullout-force-per-wire-size/), [Molex](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/2931/Quality%20Crimp%20Handbook.pdf) |
| 2 | Planteamiento inicial: "la conexión debe ser por tornillo (no soldada)" | La ITC-BT-19 §2.3 admite "soldadura sin ácido **o** piezas de conexión de apriete por rosca" (en instalaciones). La exigencia de EN 60335-1 sobre soldar o no, sin verificar | [ITC-BT-19](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf) |
| 3 | Planteamiento inicial: "par M4 1,2 N·m (EN 60999-1 / 60335-1 tabla 12)" | **No verificado**: no he podido leer esas tablas | Apartado 6.2 |
| 4 | Planteamiento inicial: IEC 61238-1 como norma de conexiones por compresión | No la he consultado. Por su título (conectores para cables de potencia) no tiene pinta de aplicarse a un ojal de 1,5 mm²; **sin verificar**. Para crimpados pequeños, la norma que aparece es IEC 60352-2 (0,05 a 10 mm²) | [EVS](https://evs.ee/en/iec-60352-2-2024) |
| 5 | Planteamiento inicial: "DIN 46237 / DIN 46225" para ojales | DIN 46237 lo cita un distribuidor para un terminal aislado de **horquilla**. DIN 46234 es el de un ojal sin aislar de Phoenix. DIN 46225: nada | Tabla 3.2 |
| 6 | Guía §5.1: "Espárrago a LRS FG: ojal / puntera" | El borne de la LRS es M3,5 según la ficha #14. Un ojal M4 no cabe. Con puntera, bien | [ficha #14](../meanwell-lrs-50-5/README.md) |
| 7 | Guía §6: 1 ojal bajo la primera tuerca y 4 bajo la segunda | La única guía de práctica que encontré recomienda 2-3 por espárrago (no normativa) | [ARH Foundation](https://www.arhfoundation.org/connect-ring-terminals-together) |
| 8 | Guía §5.1 y planteamiento inicial: "unos 7 ojales por máquina" | La guía no da número. Mi cuenta de su tabla: 6 a 8 (apartado 10) | Apartado 10 |
| 9 | Planteamiento inicial: aislante del cable de 3,0-3,5 mm | Sin fuente: no he encontrado el diámetro del hilo aislado de H05VV-F 3G1,5 (las fichas dan solo el cable: 8,1-8,2 mm) | [Faber](https://asset.conrad.com/media10/add/160267/c1/-/en/001152275DS02/adatlap-1152275-toemlos-vezetek-h05vv-f-3-g-15-mm-fekete-faber-kabel-030020-meteraru.pdf) |
| 10 | Hoja: "M4 para 0,5-1,5 mm²" | Es el rojo de Phoenix y RS PRO. El de Klauke es 0,5-1,0 mm² | [Bürklin](https://buerklin.com/en/p/klauke/cable-lugs/6204/07F934) |

Puntos que tocan a otras piezas (una línea cada uno):

- **#28 (crimpadora):** que sirva o no para ojales preaislados (apartado 5.1).
- **#25 (espárragos):** longitud roscada, par máximo del espárrago soldado y galvánica espárrago-chasis (apartados 6.2 y 6.5).
- **#24 (arandelas dentadas):** que sean inox (la ITC-BT-19 pide piezas inoxidables) y de diámetro compatible con el ojal; no las he leído.
- **#22 (manguera H05VV-F):** diámetro del hilo aislado y clase de conductor (apartado 4).
- **#14 (LRS-50-5):** el tornillo M3,5 del borne FG (apartado 6.4).
- **#15 (módulo C14):** si el pin de tierra es un faston de 4,8 mm o de tornillo.

## 13. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Antes de crimpar el lote, haz la prueba de inserción y de corte** con tu cable (apartado 4.2). Si el ojal de 0,5-1,5 mm² no admite el hilo de 1,5 mm² con su aislante, usa el de la talla siguiente.
2. **No uses la crimpadora #28 en los ojales hasta ver su ficha y probarla** (5 crimpados con tirón y corte). Si no pasa, una crimpadora de trinquete para terminales aislados cuesta poco y evita rehacer la tierra.
3. **Acepta solo crimpados que aguanten 133 N o más** (UL 486A, 16 AWG), y mejor más de 177 N. Mide 5 por lote.
4. **Reduce el apilado.** Dos espárragos, o un borne de tierra, en vez de cinco ojales en uno. Si no, dos o tres por tuerca.
5. **Par de apriete controlado**, tuerca autoblocante o contratuerca más marca de sellado, y reapriete tras el primer ciclo térmico. Confirma el par con el fabricante del espárrago (#25).
6. **Cables flexibles (cajón y caja suspendida):** curva amplia, brida a 30-50 mm del ojal, termorretráctil con adhesivo sobre el barril y revisión periódica de continuidad. Valora una trenza o un hilo extraflexible.
7. **Compra un lote de 100** y reserva unos pocos para ensayos destructivos y repuestos.
8. **Mide la tierra montada** con un comprobador de 10 A o más (0,1 Ω por pieza, guía §6; EN 50106). Que lo haga un electricista.
9. **Pide el texto de EN 60335-1 cláusula 27 y el de su tabla de pares** (por AENOR o por el laboratorio que haga la evaluación) para cerrar lo que yo no he podido leer: par, número de conductores por terminal, flexión de conductores internos.
10. **Guarda factura, fotos y lote** del terminal para el expediente técnico.

## 14. Lo que no he podido verificar

- **El anuncio de Amazon B0CVW7Y2P4.** No lo abrí: Amazon bloquea el acceso. No sé la marca, el color, el material del aislante, el chapado, el tamaño del collar, la temperatura, ni si las 25 piezas son de un solo tipo.
- **Texto de EN 60335-1** (cláusulas 23.3, 27 y la tabla de pares de tornillos), **UL 486A-B, IEC 60352-2, EN 60999-1, EN 60998-2-1, DIN 46225 y DIN 46237** (alcance real), **IEC 61238-1**. De la cláusula 27 solo tengo el resumen de un informe de ensayo. La búsqueda de la tabla de pares de EN 60335-1 y del ensayo de flexión (cláusula 23.3) no devolvió ningún texto legible.
- **El 1,2 N·m para un M4 en el espárrago:** sin fuente.
- **ITC-BT-18 e ITC-BT-26:** no las abrí. Solo leí la ITC-BT-19 (a través de una copia de plcmadrid.es).
- **Diámetro del hilo aislado del H05VV-F 3G1,5** y diámetro máximo de aislante de los terminales (la ficha de TE está vacía y las de RS PRO no lo dan).
- **Catálogos de Weidmüller, Hellermann, 3M, Vogt y Molex** de ojales. De Klauke solo vi la ficha de Bürklin (el PDF está bloqueado para robots). De TE, el PDF enlazado no tiene texto. De Phoenix, un extracto de catálogo de 2013.
- **Vida en ciclos de un ojal crimpado en un hilo flexible:** sin cifra.
- **Pruebas independientes de lotes de ojales de Amazon, falsificaciones y retiradas:** sin fuente. No consulté el portal Safety Gate.
- **Estañado:** espesor y calidad, sin cifra.
- **Cotas de tuerca y arandela dentada** usadas en el cálculo de altura (apartado 6.3): de memoria.
- **Datos de distribuidor** (RS PRO, Bürklin, Conrad): las páginas se contradicen en algunos datos (apartado 2.2).
- **Wikipedia (Kabelschuh) y otras páginas** que la herramienta no abrió están en [`enlaces.md`](enlaces.md).
- **Presupuesto de búsquedas web:** usé unas 16 búsquedas (la indicación era unas 15). El resto de la investigación fue con lectura directa de páginas ya vistas.

## 15. Fuentes

Todos los enlaces, ordenados por tipo, y una lista de lo que no se pudo abrir, en [`enlaces.md`](enlaces.md).
