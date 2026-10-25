# Manguera H05VV-F 3G1,5 mm², 5 m

Cable de 230 V y de tierra de la máquina. Se corta en trozos y se pela la funda: de cada trozo salen tres hilos, marrón (L), azul (N) y verde-amarillo (tierra). Con ellos se hacen los hilos de la toma C14 (#15) a los bornes L y N de la LRS-50-5 (#14) y toda la red de tierra (desde el 25-10-2026 la toma no lleva interruptor): C14, espárrago, fuente, panel, caja interior suspendida y cajón (guía §1 fila 22, §5.1 y §6).

- **Compra:** ASIN B07BDHJGKG, 27,74 € (precio de la hoja de componentes del 19-20-10-2026). Número 22 de la hoja.
- **Aviso:** Amazon bloquea el acceso a mi herramienta. **No he visto el anuncio.** No sé la marca, si el cable lleva marcado HAR/VDE ni de qué cobre es. El precio y el ASIN son los de tu hoja. Una búsqueda del ASIN solo devolvió anuncios de otros cables.
- **Es una pieza de 230 V y de tierra.** Si no tienes experiencia con red, que un electricista revise el cableado de 230 V y la tierra antes de enchufar (la guía ya lo dice).

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Los cálculos y las deducciones propias llevan la etiqueta "cálculo mío" o "conclusión mía". **Las normas IEC/EN son de pago y no he leído su texto**, con dos excepciones: HD 308 S2 (copia en PDF) y la ITC-BT-19 del REBT. De EN 60335-1 y EN 60204-1 solo he podido leer plantillas de ensayo y resúmenes (apartado 10).

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales y normas](#3-documentos-oficiales-y-normas)
4. [Uso en la máquina](#4-uso-en-la-máquina)
5. [Fallos, bugs y problemas conocidos](#5-fallos-bugs-y-problemas-conocidos)
6. [Qué comprobar al recibirla](#6-qué-comprobar-al-recibirla)
7. [Alternativas](#7-alternativas)
8. [Discrepancias con la guía y con mi planteamiento inicial](#8-discrepancias-con-la-guía-y-con-mi-planteamiento-inicial)
9. [Recomendaciones para el alcoholímetro](#9-recomendaciones-para-el-alcoholímetro)
10. [Lo que no he podido verificar](#10-lo-que-no-he-podido-verificar)
11. [Fuentes](#11-fuentes)

---

## 1. Resumen para el proyecto

- **La corriente no es el problema; la calidad del cable y el montaje sí.** Un H05VV-F 3G1,5 admite 16 A en aire a 30 °C según [Nexans](https://latrivenetacavi.nexans.com/en/products/industrial-and-logistics/industrial-Eca-class/H05VV-F38485.html), [Faber](https://asset.conrad.com/media10/add/160267/c1/-/en/001152275DS02/adatlap-1152275-toemlos-vezetek-h05vv-f-3-g-15-mm-fekete-faber-kabel-030020-meteraru.pdf) ([copia local](datasheets/adatlap-1152275-toemlos-vezetek-h05vv-f-3-g-15-mm-fekete-faber-kabel-030020-meteraru.pdf)) y [Oznur](https://www.oznurkablo.com.tr/upl/OznurKabloWeb-ENG-Catalogue-18.pdf) ([copia local](datasheets/OznurKabloWeb-ENG-Catalogue-18.pdf)). La máquina consume unos 0,1 A típicos y unos 0,56 A a plena carga (ficha #14). A 0,6 A, un metro de conductor disipa unos 5 mW (cálculo mío). Lo que puede fallar es el cobre (falso o de menos sección), un núcleo cortado al pelar la funda y los tramos de tierra que se mueven.
- **Dos cifras de mi planteamiento inicial no coinciden con las fuentes.** (1) 13,7 Ω/km es el límite del cobre **estañado**. Para cobre desnudo, que es el del H05VV-F, el límite de clase 5 es **13,3 Ω/km** ([Lapp T11](https://t3.lappcdn.com/fileadmin/catalog/ko_T_pdf/T11_Conductor_resistances_and_strand_structure_metric_kr.pdf) ([copia local](datasheets/T11_Conductor_resistances_and_strand_structure_metric_kr.pdf)), [Bayka](https://www.bayka.de/en/service/technical-information/conductor-resistance), [IET](https://electrical.theiet.org/media/1658/in-service-inspection-and-testing-of-electrical-equipment-the-earth-continuity-test.pdf) ([copia local](../documentos-compartidos/normas/in-service-inspection-and-testing-of-electrical-equipment-the-earth-continuity-test.pdf)), Nexans, Faber, Oznur). Un metro mide como máximo 13,3 mΩ a 20 °C, no 13,7. (2) El peso típico es de **94 a 115 g/m**, no de 190-220 g/m (apartado 2).
- **Pelar la funda deja un cableado interno casi idéntico al H07V-K.** El núcleo del H05VV-F de 1,5 mm² lleva 0,7 mm de PVC, igual que un H07V-K de 1,5 mm² ([Nexans](https://www.nexans.no/en/products/Building-Wires-and-Cables/Standard-wires-and-cables/Standard-Installation-cables-and-wires/PL---PMH/H05VV-F-30-536929548/product~10221724~.html), [RS](https://docs.rs-online.com/f569/0900766b81159e0e.pdf)). Lapp admite ese hilo sin funda dentro de aparatos y máquinas si va fijo y protegido, y avisa de que no vale en equipos que se puedan abrir con tensión ([Lapp H07V-K](https://dam-media.lapp.com/6/664/66488/f0a2dcc6c9bf486fbe1ae684bc0f9c6b.pdf) ([copia local](datasheets/f0a2dcc6c9bf486fbe1ae684bc0f9c6b.pdf))). Qué pide EN 60335-1 (cláusulas 23 y 27) **no lo he podido leer**.
- **El verde-amarillo es solo para la tierra.** Lo dicen HD 308 S2, IEC 60446 y la ITC-BT-19. En la hoja, la nota "verde-amarillo (tierra y puentes)" hay que leerla como "tierra en verde-amarillo, puentes en marrón y azul", que es lo que dice la tabla de §5.1.
- **Sección de la tierra: mi planteamiento inicial y el REBT no coinciden.** La ITC-BT-19 §2.3 (tabla 2) pide, para un conductor de protección que no forma parte del cable de alimentación, **2,5 mm²** con protección mecánica y **4 mm²** sin ella. No son los 1,5 y 2,5 mm² de mi planteamiento inicial. Es una regla de instalación fija. Lo que pide la norma de producto de la máquina **no lo he podido leer**.
- **Los tramos de tierra que se mueven (caja interior y cajón) son el punto débil.** Lapp describe el hilo suelto como "no previsto normativamente" en uso con movimiento, y ninguna fuente da ciclos de flexión para un H05VV-F. Hay que diseñar con holgura y radio grande, o usar un cable pensado para flexión (apartado 4.5).

## 2. Especificaciones

Valores de referencia de un H05VV-F 3G1,5 **correcto**. No son los del anuncio de Amazon, que no he visto.

| Característica | Valor | Fuente |
|---|---|---|
| Designación | H05VV-F 3G1,5: H = armonizado, 05 = 300/500 V, V = aislamiento de PVC, V = funda de PVC, F = flexible, 3G1,5 = 3 hilos con uno verde-amarillo, de 1,5 mm² | Código: conocimiento mío (HD 361 / EN 50565-1), **no leído**. Nexans confirma 300/500 V, PVC/PVC y núcleo verde-amarillo |
| Norma del cable | EN 50525-2-11. Nexans FR cita además HD 21.5 e IEC 60227-53 (tipo 53); Bricable cita UNE 21031-5 (norma española anterior) | [Nexans IT](https://latrivenetacavi.nexans.com/en/products/industrial-and-logistics/industrial-Eca-class/H05VV-F38485/product~021121007~.html), [Nexans FR](https://www.nexans.fr/en/products/Building/Residential/Flexibles-wires/H05VV-F-536932484/product~10043942~.html), [Bricable](https://cadena88.com/sites/default/files/content/products/files/9038r2x1b5/202406111450150366300.pdf) |
| Tensión asignada | 300/500 V (Uo/U). La LRS-50-5 admite hasta 264 VAC, por debajo de los 300 V de Uo (cálculo mío) | Nexans, Faber; guía §2.6 |
| Conductor | Cobre desnudo, clase 5 (flexible), EN 60228 / IEC 60228 | Nexans, [RR Kabel](https://www.rrkabel.com/products/h03-h05vvh2-f-h03-h05vv-f/), Faber |
| Hilos | Cada hilo de ≤ 0,26 mm (clase 5, 1,5 mm²). Ejemplos: 32 × 0,23 mm (Nexans 4G1,5, conductor de Ø 1,55 mm) y 48 × 0,198 mm (cordón 3G1,5 de RND). Mínimo de hilos para llegar a 1,5 mm² con 0,26 mm: 29 (cálculo mío) | [Lapp T11](https://t3.lappcdn.com/fileadmin/catalog/ko_T_pdf/T11_Conductor_resistances_and_strand_structure_metric_kr.pdf) ([copia local](datasheets/T11_Conductor_resistances_and_strand_structure_metric_kr.pdf)), [Nexans NO](https://www.nexans.no/en/products/Building-Wires-and-Cables/Standard-wires-and-cables/Standard-Installation-cables-and-wires/PL---PMH/H05VV-F-30-536929548/product~10221724~.html), [RND](https://docs.rs-online.com/d372/A700000013591443.pdf) |
| Resistencia máx. del conductor | **13,3 Ω/km** a 20 °C (cobre desnudo, clase 5). 13,7 Ω/km es el cobre estañado. Clase 2: 12,1 / 12,2 | Lapp T11, Bayka, IET (13,3 mΩ/m), Nexans, Faber, Oznur |
| Aislamiento de cada núcleo | PVC tipo TI2 (EN 50363-3), espesor medio **0,7 mm**. Núcleo de Ø 2,95 mm (medida de un 4G1,5) | Nexans IT, Nexans NO, RR Kabel |
| Funda | PVC tipo TM2 (EN 50363-4-1), espesor medio **0,9 mm** en 3G1,5 (1,0 mm en 4G1,5) | Nexans IT, Nexans NO, RR Kabel |
| Espesores mínimos de la norma | No los he podido leer (tabla de EN 50525-2-11). Solo hay valores medios de fabricante | **Sin verificar** |
| Colores | Marrón, azul y verde-amarillo (3 hilos con G/Y, tabla 1 de HD 308 S2) | [HD 308 S2:2001](https://eclass.hmu.gr/modules/document/file.php/TH155/HD%20308%20S2-2001.pdf) ([copia local](datasheets/HD_308_S2-2001.pdf)), [Letronic](https://www.letronic.de/en/produkte/datenblatt/353/h05vv-f-acc-to-vde-0285), [elektrikshop](https://www.elektrikshop.de/h05vv-f-3g1-5-pvc-schlauchleitung-weiss.html) |
| Diámetro exterior | 7,9 a 8,4 mm nominal según cinco fabricantes; máximo 9,4 mm (Nexans IT) y 9,8 mm (Nexans FR) | Tabla siguiente |
| Peso | **94 a 115 kg/km** (cable completo). Cobre: 43 kg/km. Cobre puro de 3 × 1,5 mm²: 40,3 kg/km (cálculo mío) | Tabla siguiente |
| Tensión de ensayo de fábrica | 2.000 V (Faber, Letronic) o 4.000 V (RR Kabel). **No coinciden**; no lo puedes comprobar tú | Faber, Letronic, RR Kabel |
| Corriente admisible | 16 A en aire a 30 °C (Nexans IT, Faber, Oznur). Nexans FR da 20 A "en aire libre" con otra convención. En mi planteamiento inicial: 10-16 A | Nexans, Faber, Oznur |
| Temperatura del conductor | Temperatura máxima de servicio: **60 °C** (Nexans IT, Faber). Nexans IT añade que, "inside equipment or the like were no contact with skin can be guaranteed" (texto original, ambiguo; lo leo como: donde nadie lo toca), el conductor admite **70 °C**. Cortocircuito: 150 °C (Nexans) o 160 °C (Oznur) | Nexans IT/FR, Oznur, Faber |
| Rango de uso | −5 a +70 °C en movimiento y −30 a +70 °C fijo (Letronic, RR Kabel). Nexans IT: mínimo de uso −10 °C y de instalación 5 °C. Nexans FR: −5 a +60 °C | Letronic, RR Kabel, Nexans |
| Comportamiento al fuego | Retardante de llama según IEC 60332-1-2 (un solo cable en vertical). **No tiene clase V-0 de UL94**: es un ensayo de otro tipo | Nexans, Faber, RR Kabel |
| Agua y química | "Accidental" para el agua y para los productos químicos. No es para inmersión | [Nexans FR](https://www.nexans.fr/en/products/Building/Residential/Flexibles-wires/H05VV-F-536932484/product~10264568~.html) |
| Marcado | Fabricante, **◄HAR►**, H05VV-F y número de fábrica o formato (p. ej. Nexans FR: "n (x o G) s mm² … HAR H05VV-F N° Usine"). Helukabel imprime además los metros. ◄HAR► la concede un organismo nacional: los fabricantes citan VDE (Helukabel, Letronic), IMQ (Nexans IT) y SEMKO (Nexans NO). ENEC es marca de componentes (enchufes, conectores, interruptores), no de cable (conocimiento mío) | Nexans IT/FR/NO, [Helukabel](https://shop.helukabel.com/us-en/h05vv-f-05vv-f-m29450/30125) |

### Qué dice cada fabricante (3G1,5)

| Fabricante | Ø ext. (mm) | Peso (kg/km) | Cobre (kg/km) | R máx. (Ω/km) | Radio de curvatura (móvil / fijo) | Fuente |
|---|---|---|---|---|---|---|
| Nexans / La Triveneta (IT), ref. 021121007 | máx. 9,4 | ≈ 100 | — | 13,3 | 6×D / 4×D | [página](https://latrivenetacavi.nexans.com/en/products/industrial-and-logistics/industrial-Eca-class/H05VV-F38485/product~021121007~.html) |
| Nexans (FR), refs. 10264568 y 10043942 | máx. 9,8 | ≈ 96 | — | — | 58,8 mm "estático" (= 6×9,8; no coincide con el 4×D estático de Nexans IT) | [FR blanco](https://www.nexans.fr/en/products/Building/Residential/Flexibles-wires/H05VV-F-536932484/product~10264568~.html), [FR gris](https://www.nexans.fr/en/products/Building/Residential/Flexibles-wires/H05VV-F-536932484/product~10043942~.html) |
| Faber Kabel, ref. 030020 | ≈ 8,2 | 115 | 43 | 13,3 | 5×D / 3×D | [PDF (Conrad)](https://asset.conrad.com/media10/add/160267/c1/-/en/001152275DS02/adatlap-1152275-toemlos-vezetek-h05vv-f-3-g-15-mm-fekete-faber-kabel-030020-meteraru.pdf) ([copia local](datasheets/adatlap-1152275-toemlos-vezetek-h05vv-f-3-g-15-mm-fekete-faber-kabel-030020-meteraru.pdf)) |
| Letronic, ref. 28631500 | 8,40 | 94,0 | 43,2 | — | — | [página](https://www.letronic.de/en/produkte/datenblatt/353/h05vv-f-acc-to-vde-0285) |
| RR Kabel | 8,1 | — | — | — | 7,5×D / 4×D | [página](https://www.rrkabel.com/products/h03-h05vvh2-f-h03-h05vv-f/) |
| Oznur | 7,9 | 103 | — | 13,3 | 6×D | [catálogo PDF](https://www.oznurkablo.com.tr/upl/OznurKabloWeb-ENG-Catalogue-18.pdf) ([copia local](datasheets/OznurKabloWeb-ENG-Catalogue-18.pdf)) |
| Bricable (distribuidor español) | 8,2 | 105,1 | — | — | — | [PDF](https://cadena88.com/sites/default/files/content/products/files/9038r2x1b5/202406111450150366300.pdf) |
| elektrikshop (distribuidor) | ≈ 8,1 | ≈ 110 | — | — | 7,5×D | [página](https://www.elektrikshop.de/h05vv-f-3g1-5-pvc-schlauchleitung-weiss.html) |

Radios en milímetros (cálculo mío, con D = 8,1 a 9,4 mm): 4×D = 32 a 38 mm; 6×D = 49 a 56 mm; 7,5×D = 61 a 71 mm. Un trozo de 5 m pesa entre 0,47 y 0,58 kg (cálculo mío con 94 a 115 g/m).

## 3. Documentos oficiales y normas

Un cable no tiene datasheet único: la ficha es la norma, el certificado del fabricante y su declaración de conformidad. **No he podido abrir el texto de ninguna norma IEC/EN** (de pago). Enlazo fichas de fabricante, copias legibles y resúmenes.

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Ficha del producto H05VV-F 3G1,5 | Nexans / La Triveneta Cavi, ref. 021121007 | Web | [Abrir](https://latrivenetacavi.nexans.com/en/products/industrial-and-logistics/industrial-Eca-class/H05VV-F38485/product~021121007~.html) |
| Datasheet PDF del 3G1,5 | Nexans, ref. 021121007 | PDF (mi herramienta no pudo abrirlo: robots.txt) | [PDF](https://latrivenetacavi.nexans.com/.rest/catalog/v1/product/pdf/021121007) |
| Datasheet PDF de la familia | Nexans, familia 38485 | PDF (no abierto: mismo motivo) | [PDF](https://latrivenetacavi.nexans.com/.rest/catalog/v1/family/pdf/38485/H05VV-F) |
| Declaración UE de conformidad H05VV-F | La Triveneta Cavi, 29-10-2025: LVD 2014/35/UE, RoHS, EN 50525-2-11, EN 50575, EN 60332-1-2 | PDF | [PDF](https://latrivenetacavi.nexans.com/.rest/eservice/dam/v1/file/268869/EU%20declaration%20of%20conformity_H_05VV-F.pdf) ([copia local](datasheets/EU_declaration_of_conformity_H_05VV-F.pdf)) |
| Certificado IMQ H05VV-F | Nexans | PDF sin texto legible para mi herramienta | [PDF](https://latrivenetacavi.nexans.com/.rest/eservice/dam/v1/file/268870/cert_IMQ_H05VV-F_H05VVH2-F.pdf) |
| Datasheet Faber Kabel H05VV-F 3G1,5 | Ref. 030020 | PDF | [PDF](https://asset.conrad.com/media10/add/160267/c1/-/en/001152275DS02/adatlap-1152275-toemlos-vezetek-h05vv-f-3-g-15-mm-fekete-faber-kabel-030020-meteraru.pdf) ([copia local](datasheets/adatlap-1152275-toemlos-vezetek-h05vv-f-3-g-15-mm-fekete-faber-kabel-030020-meteraru.pdf)) |
| Ficha Nexans NO del 4G1,5 (espesores, hilos) | Ref. 10221724 | Web | [Abrir](https://www.nexans.no/en/products/Building-Wires-and-Cables/Standard-wires-and-cables/Standard-Installation-cables-and-wires/PL---PMH/H05VV-F-30-536929548/product~10221724~.html) |
| Declaración de prestaciones (CPR) de RR Kabel | N.º 02/2017, tipo 318Y | PDF | [PDF](https://www.rrkabel.com/wp-content/uploads/2023/08/H05VV-F.pdf) ([copia local](datasheets/H05VV-F.pdf)) |
| Catálogo Oznur | H05VV-F, H07V-K | PDF | [PDF](https://www.oznurkablo.com.tr/upl/OznurKabloWeb-ENG-Catalogue-18.pdf) ([copia local](datasheets/OznurKabloWeb-ENG-Catalogue-18.pdf)) |
| Ficha Bricable (mangueras PVC) | H03VV-F y H05VV-F | PDF | [PDF](https://cadena88.com/sites/default/files/content/products/files/9038r2x1b5/202406111450150366300.pdf) |
| Resistencias de conductor y estructura de hilos | Lapp, tabla T11 (IEC 60228 / VDE 0295) | PDF | [PDF](https://t3.lappcdn.com/fileadmin/catalog/ko_T_pdf/T11_Conductor_resistances_and_strand_structure_metric_kr.pdf) ([copia local](datasheets/T11_Conductor_resistances_and_strand_structure_metric_kr.pdf)) |
| Resistencia de conductor clase 5 | Bayka | Web | [Abrir](https://www.bayka.de/en/service/technical-information/conductor-resistance) |
| Identificación de núcleos de cables | HD 308 S2:2001 | PDF (copia en eclass.hmu.gr) | [PDF](https://eclass.hmu.gr/modules/document/file.php/TH155/HD%20308%20S2-2001.pdf) ([copia local](datasheets/HD_308_S2-2001.pdf)) |
| Color verde-amarillo | IEC 60446 (resumen) | Web | [Wikipedia](https://en.wikipedia.org/wiki/IEC_60446) |
| H07V-K (cableado interno), hoja de datos | Lapp DB8120001EN, 11-09-2014 | PDF | [PDF](https://dam-media.lapp.com/6/664/66488/f0a2dcc6c9bf486fbe1ae684bc0f9c6b.pdf) ([copia local](datasheets/f0a2dcc6c9bf486fbe1ae684bc0f9c6b.pdf)) |
| H05V-K y H07V-K, tabla de espesores y diámetros | Elektroimportøren, producto 1040501 | PDF | [PDF](https://www.elektroimportoren.no/docs/lib/1040501-Produktblad-3.pdf) |
| H07V-K 1,5 mm² | RS, ref. 6491X | PDF | [PDF](https://docs.rs-online.com/f569/0900766b81159e0e.pdf) |
| REBT, ITC-BT-19 | RD 842/2002 | PDF (copia en plcmadrid.es) | [PDF](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf) ([copia local](../documentos-compartidos/normas/ITC-BT-19.pdf)) |
| Continuidad de tierra en equipos | IET, guía de ensayos en servicio | PDF | [PDF](https://electrical.theiet.org/media/1658/in-service-inspection-and-testing-of-electrical-equipment-the-earth-continuity-test.pdf) ([copia local](../documentos-compartidos/normas/in-service-inspection-and-testing-of-electrical-equipment-the-earth-continuity-test.pdf)) |
| Ensayos de rutina de aparatos EN 60335-1 | EN 50106:2008 (resumen del CYS) | Web | [Abrir](https://std-ol.cys.org.cy/safety-of-household-and-similar-electrical-appliances-particular-rules-for-routine-tests-referring-to-appliances-under-the-scope-of-en-60335-1) |
| Plantilla de informe de ensayo IEC 60335-1:2020 | IS 302 (Parte 1):2024 (BIS) | PDF | [PDF](https://www.bis.gov.in/wp-content/uploads/2025/09/3.pdf) |
| Manual de instalación de fuentes cerradas (LRS) | Mean Well, copia de montersi.pl y versión 2024.10.16 | PDF | [montersi](https://www.montersi.pl/instrukcje/Enclosed_Type_EN.pdf) ([copia local](../meanwell-lrs-50-5/datasheets/Enclosed_Type_EN.pdf)) · [Mean Well Australia](https://www.meanwellaustralia.com.au/sites/default/files/2024-11/Enclosed%20Power%20Supply%20Installation%20Manual.pdf) ([copia local](../meanwell-lrs-50-5/datasheets/Enclosed_Power_Supply_Installation_Manual.pdf)) |
| Aviso sobre cable flexible de cobre aluminizado | ACI, 21-09-2018 | Web | [Abrir](https://www.aci.org.uk/news/aci-warns-dangerous-turkish-flexible-cord) |
| Nota técnica sobre CCA en cables de datos | ACI/131/12 (2012) | PDF | [PDF](https://www.aci.org.uk/download_file/view/6/191) |

### Qué dicen los más relevantes

- **Fabricantes del cable.** Coinciden en lo esencial: cobre desnudo clase 5, PVC TI2/TM2, 300/500 V, 13,3 Ω/km, 16 A en aire. Difieren en diámetro, peso y radio de curvatura (tabla del apartado 2). Nexans IT distingue 60 °C de servicio normal y 70 °C de conductor dentro de aparatos sin contacto con la piel. La declaración UE de conformidad de La Triveneta Cavi cita la Directiva de baja tensión: un proveedor serio **la publica**.
- **HD 308 S2:2001.** Para cables de 3 hilos con hilo verde-amarillo, los otros dos son azul y marrón (tabla 1). El conductor de protección usa verde-amarillo y el neutro azul (apartado 3.2). Remite a EN 60446 para el verde-amarillo (apartado 3.3). La copia que leí no contiene la frase de uso exclusivo ni las proporciones de color.
- **IEC 60446 (resumen de Wikipedia).** El verde-amarillo se usa "siempre y exclusivamente" para el conductor de protección. En cualquier tramo de 15 mm, un color debe cubrir entre el 30 % y el 70 % de la superficie.
- **ITC-BT-19.** §2.2.4: protección en verde-amarillo, neutro en azul claro, fases en marrón o negro. §2.3: aplica UNE 20460-5-54 §543; tabla 2 (fase < 16 mm² → protección igual; 16-35 mm² → 16 mm²; > 35 mm² → mitad), con nota (*): mínimo 2,5 mm² si el conductor de protección no forma parte de la canalización de alimentación y tiene protección mecánica, y 4 mm² si no la tiene. No fija temperatura ni resistencia de continuidad.
- **Lapp H07V-K.** Hilo de PVC TI1 de clase 5, 450/750 V, para instalación fija y protegida dentro de aparatos, máquinas y armarios. Temperatura estática de −40 a +80 °C; "en movimiento (no previsto normativamente)": de +5 a +70 °C. Radio mínimo: 4×D en uso previsto y 2×D "con cuidado". Al no tener funda, no debe usarse en instalaciones que se puedan abrir con tensión; sin protección, solo señal y mando por debajo de 25 VAC / 60 VDC; sin protección está prohibido en locales húmedos o mojados.
- **IET y EN 50106.** Ensayo de continuidad de tierra con corriente alta. IET: "duro" con hasta 25 A (al menos 1,5 veces el fusible, 5-20 s) y "blando" con 20-200 mA; límite 0,1 Ω sin cable de alimentación y (0,1 + R) Ω con él. EN 50106 (ensayos de rutina de aparatos EN 60335-1, según el resumen del CYS): al menos 10 A con tensión en vacío ≤ 12 V; límite 0,2 Ω o 0,1 Ω más la resistencia del cable si el aparato lleva cable, y 0,1 Ω en los demás.
- **Mean Well, manual de las LRS.** Tabla de calibres: 1,5 mm² (AWG 14) para 10-16 A. Tornillos M3,5 y 8-10 kgf·cm para la serie. "Make sure that all strands … enter the terminal". No dice longitud de pelado ni menciona punteras. "The ground (FG) must be connected to earth ground".
- **ACI.** El aviso de 2018 describe un cable flexible de PVC de 1,5 y 2,5 mm² con conductores de cobre aluminizado cuya resistencia superaba el máximo de las normas; el de 2,5 mm² solo alcanzaba la capacidad de uno de 1,0 mm². Los hilos de CCA se rompen antes al flexionar, con riesgo de pérdida de continuidad o de punto caliente con arco. La nota ACI/131/12 (cables de datos) dice que los CCA muy baratos tienen "menos del 20 % de cobre".

## 4. Uso en la máquina

### 4.1 Cuánto cable hace falta (suposiciones mías)

Las longitudes son estimaciones mías sobre la guía §5.1. **Mide en tu carcasa.**

| Tramo | Hilo | Largo supuesto |
|---|---|---|
| C14, pestaña con fusible → borne L de la LRS | marrón | 0,30 m |
| C14, otra pestaña → borne N de la LRS | azul | 0,30 m |
| C14 pin de tierra → espárrago | verde-amarillo | 0,15 m |
| Espárrago → borne FG de la LRS | verde-amarillo | 0,15 m |
| Espárrago → panel | verde-amarillo | 0,20 m |
| Espárrago → caja interior (flexible) | verde-amarillo | 0,50 m |
| Espárrago → cajón (flexible) | verde-amarillo | 0,60 m |
| **Total** | G/Y ≈ 1,6 m · marrón ≈ 0,3 m · azul ≈ 0,3 m | |

Conclusión mía: el verde-amarillo es el que manda. 5 m dan para unas 3 máquinas si aprovechas los marrón y azul sobrantes de los trozos. Si fabricas más, el rollo de 5 m se queda corto por el verde-amarillo, no por los otros dos.

### 4.2 Los núcleos sueltos como cableado interno

Comparación del núcleo con el hilo H07V-K de 1,5 mm², que es el que se usaría como alternativa:

| | Núcleo del H05VV-F 3G1,5 | H07V-K 1,5 mm² |
|---|---|---|
| Tensión asignada | 300/500 V (del cable completo) | 450/750 V |
| Conductor | Cobre desnudo, clase 5 | Cobre desnudo, clase 5 |
| Aislamiento | PVC TI2, 0,7 mm de media | PVC TI1, 0,7 mm de media |
| Ø del núcleo aislado | 2,95 mm (medida de un 4G1,5) | 2,9 a 3,0 mm |
| Resistencia máx. | 13,3 Ω/km | 13,3 Ω/km (RS) |
| Temperatura de conductor | 60 °C de servicio; 70 °C dentro de aparato sin contacto (Nexans IT) | 70 °C (RS, Lapp) |
| Funda exterior | Sí (se retira) | No lleva |

Fuentes: Nexans IT/NO, [RS](https://docs.rs-online.com/f569/0900766b81159e0e.pdf), [Lapp](https://dam-media.lapp.com/6/664/66488/f0a2dcc6c9bf486fbe1ae684bc0f9c6b.pdf) ([copia local](datasheets/f0a2dcc6c9bf486fbe1ae684bc0f9c6b.pdf)), [Elektroimportøren](https://www.elektroimportoren.no/docs/lib/1040501-Produktblad-3.pdf).

**Qué dicen las fuentes sobre usar núcleos de manguera sueltos:**

- **No he encontrado ninguna norma legible que lo prohíba ni que lo autorice por escrito.** Es una práctica extendida, pero no la he podido respaldar con un texto.
- **Lo más cercano que he leído:** Lapp acepta un hilo de PVC de 0,7 mm sin funda como cableado fijo y protegido dentro de máquinas y aparatos (apartado 3). La conclusión mía es que el núcleo de la manguera, con el mismo espesor, queda en un caso parecido siempre que la caja esté cerrada y el hilo, protegido.
- **EN 60335-1:** la plantilla de ensayo de BIS (IEC 60335-1:2020) muestra que la cláusula 23 trae un ensayo de alta tensión sobre el aislamiento básico de los cables interiores, y que la cláusula 27 trae el ensayo de tierra ("earth bond test"). **No he podido leer los requisitos.** Un cable de tipo normalizado (IEC 60227) suele estar contemplado como cableado interno aceptable; es recuerdo mío, **sin verificar**.
- **EN 60204-1:** solo he visto el índice de una versión ucraniana de la edición 5.1 (tabla 5, "Minimum cross-sectional areas of copper conductors"; tabla 6, capacidades de PVC) y que la cláusula 13.2.2 trata el color del conductor de protección. **No he podido leer ninguna cláusula.** La guía no la nombra como aplicable; se usa aquí como referencia.
- **Lo que cambia al quitar la funda (conclusión mía):** se pierde la capa que protege el aislante de los roces y los cortes. Queda solo el PVC de 0,7 mm. En una caja metálica con bordes de chapa, eso exige pasacables, bridas y recorridos sin roce (#31).
- **Opción que mantiene la funda (conclusión mía):** donde L, N y tierra viajan juntos hacia la LRS (L y N desde la toma C14, FG desde el espárrago), se puede dejar la funda en el tramo central y pelar solo los extremos. Así queda un cable armonizado con doble capa en el recorrido. Depende de la distancia entre C14, espárrago y fuente en tu carcasa.

### 4.3 Temperatura dentro de la caja

- **Límite del cable:** 60 °C de servicio y, según Nexans IT, 70 °C en el conductor si el cable va "inside equipment or the like were no contact with skin can be guaranteed" (cita literal en inglés, ambigua; la leo como: donde nadie lo toca) ([Nexans IT](https://latrivenetacavi.nexans.com/en/products/industrial-and-logistics/industrial-Eca-class/H05VV-F38485/product~021121007~.html)). Faber da 60 °C ([PDF](https://asset.conrad.com/media10/add/160267/c1/-/en/001152275DS02/adatlap-1152275-toemlos-vezetek-h05vv-f-3-g-15-mm-fekete-faber-kabel-030020-meteraru.pdf) ([copia local](datasheets/adatlap-1152275-toemlos-vezetek-h05vv-f-3-g-15-mm-fekete-faber-kabel-030020-meteraru.pdf))). Con la caja abierta y un técnico tocando los hilos, el límite prudente es 60 °C (conclusión mía).
- **Temperatura que sí es conocida de la máquina:** el ZE29A trabaja entre 10 y 40 °C y el Solo entre 0 y 40 °C (guía §0). Si la caja respeta esos límites, el cable tiene 20 K de margen sobre los 60 °C y 30 K sobre los 70 °C (cálculo mío).
- **Calor de la fuente:** la ficha #14 estima 2,5 W de pérdidas con 12 W de carga y 5,3 W a 26 W (cálculo suyo). Según esa ficha, la LRS-50-5 funciona de −30 a +70 °C según la curva de derating (que allí no se pudo leer) y **no figura protección contra sobretemperatura** en la hoja. Esas fuentes no dan la temperatura interior de la caja: **hay que medirla**.
- **Autocalentamiento del cable:** 0,56 A × 13,3 mΩ/m → unos 4 mW por metro de conductor (cálculo mío). Es despreciable. El cable solo sube de temperatura por el aire que le rodea o por tocar piezas calientes.
- **EN 60335-1, límites de calentamiento (tabla 3):** no la he podido leer, **sin verificar**. La plantilla de BIS indica que la cláusula 11.8 remite a esa tabla.
- **Conclusión mía:** no apoyes los hilos de L y N en la carcasa de la LRS ni en su borne; deja holgura. Mide la temperatura del aire junto al cable y de la carcasa de la fuente en la prueba de la guía §0 (riesgo 5).

### 4.4 Tierra: color, sección y resistencia

**Color**

- El verde-amarillo es de uso exclusivo para la tierra: HD 308 S2 (apartado 3.2), IEC 60446 (resumen de Wikipedia) e ITC-BT-19 §2.2.4. No lo uses para un puente de L o N, aunque tengas el núcleo sobrante.
- Las tres fuentes dicen que el conductor de protección se identifica con verde-amarillo. Que deba serlo **en todo su recorrido** (no recolorear el hilo con cinta o termorretráctil de otro color) no lo dice ninguna de las copias que leí; la copia de HD 308 no trae esa regla. **No he podido leer EN 60335-1 cláusula 27 ni EN 60204-1 sobre esto.** Mi consejo: no cambies el color de ningún tramo.

**Sección**

| Fuente | Qué pide | Aplica a |
|---|---|---|
| ITC-BT-19 §2.3, tabla 2 | Igual a la de la fase hasta 16 mm². Mínimo de 2,5 mm² (con protección mecánica) o 4 mm² (sin ella) cuando el conductor de protección **no forma parte de la canalización de alimentación** | Instalación fija, no producto. Es una referencia conservadora, no un requisito de la máquina |
| EN 60335-1 cláusula 27 y EN 60204-1 tabla 5 | **Sin verificar** (no leídas) | Producto |
| Mi deducción | Un cordón de red correcto (#17) lleva 0,75 o 1,0 mm² (ficha #17; el del anuncio no lo conozco). Un conductor interior de 1,5 mm² es igual o mayor | Cableado interno |

- Discrepancia con mi planteamiento inicial: no he encontrado en la ITC-BT-19 las cifras de 1,5 y 2,5 mm². Las de la ITC-BT-19 son 2,5 y 4 mm². No he abierto la ITC-BT-18 ni la ITC-BT-26.
- Si un laboratorio o un electricista decide que se necesita 2,5 mm² en las ramas de tierra del espárrago a las piezas, los ojales de la hoja (#23, para 0,5-1,5 mm²) no sirven. Hay que decidirlo **antes** de comprar los ojales.

**Resistencia: el límite de 0,1 Ω**

- La guía §6 pone 0,1 Ω entre el pin de tierra del C14 y cada pieza metálica. Es coherente con IET (0,1 Ω sin cable de alimentación) y con EN 50106 (0,1 Ω en aparatos sin cable). El texto de EN 60335-1 cláusula 27 **no lo he leído**, aunque la plantilla de BIS confirma que existe un "earth bond test (Cl 27)". Otras normas distintas dan el mismo valor con 25 A: IEC 60065 ([Kikusui](https://global.kikusui.co.jp/kikusupport/why-is-an-earth-continuity-tester-necessary-to-measure-a-resistance-between-a-protective-conductor-terminal-or-a-protective-grounding-pin-and-a-protective-grounding-part-on-a-chassis/)) e IEC 60601-1 cláusula 8.6 ([601help](https://601help.com/Requirements/earthing.html)). Eso no es EN 60335-1.
- Corriente de ensayo: al menos 10 A (EN 50106) y hasta 25 A (IET). La guía dice 10-25 A: coincide.
- La máquina lleva una base C14 (cable desmontable). Que el límite sea 0,1 Ω desde el contacto de tierra de la base es **interpretación mía**; EN 50106 solo habla de aparatos "con cable" y "otros".

**Qué significa con esta manguera (cálculo mío)**

| Longitud de conductor de 1,5 mm² | Máximo según la norma (13,3 mΩ/m, 20 °C) | Cobre ideal (11,5 mΩ/m, 20 °C) | A 40 °C, máximo según norma |
|---|---|---|---|
| 1 m | 13,3 mΩ | 11,5 mΩ | 14,3 mΩ |
| 0,5 m | 6,7 mΩ | 5,7 mΩ | 7,2 mΩ |
| 1,6 m (toda la tierra supuesta) | 21,3 mΩ | 18,4 mΩ | 23,0 mΩ |

- El coeficiente de temperatura del cobre (0,393 %/K) es dato estándar mío; no lo he leído en las fuentes.
- La rama más larga (espárrago → cajón, 0,6 m) aporta hasta 8 mΩ; con el tramo del C14 al espárrago (0,15 m), unos 10 mΩ. Eso es el 10 % de los 100 mΩ. **El resto del presupuesto es de las uniones**: ojal, arandela dentada, tuerca, pintura, espárrago soldado. Por eso importa más la unión que el cable.
- Un polímetro corriente tiene décimas de ohmio de error en las puntas: no mide estos 10 mΩ. La medida buena se hace con un comprobador de 10-25 A (apartado 6.3).

### 4.5 Tramos flexibles: caja interior suspendida y cajón

- **Radios mínimos de la manguera con funda:** 4×D fijo y 6×D en movimiento (Nexans), 3×D y 5×D (Faber), 4×D y 7,5×D (RR Kabel). En milímetros: ver tabla del apartado 2.
- **Radio del núcleo suelto (D ≈ 3 mm):** 4×D = 12 mm en uso fijo y 2×D = 6 mm "con cuidado" ([Lapp H07V-K](https://dam-media.lapp.com/6/664/66488/f0a2dcc6c9bf486fbe1ae684bc0f9c6b.pdf) ([copia local](datasheets/f0a2dcc6c9bf486fbe1ae684bc0f9c6b.pdf))). Lapp marca el uso en movimiento como "no previsto normativamente".
- **Tensión de tracción recomendada (Nexans IT):** 15 N/mm² de cobre en uso móvil y 50 N/mm² en fijo. Para un solo conductor de 1,5 mm², 22,5 N en móvil y 75 N en fijo (cálculo mío; la cifra de Nexans es para el cable completo). Un tirón del cajón no debe pasar de ahí.
- **Ciclos de flexión del H05VV-F:** **ningún fabricante da cifra.** Lo que dicen: "esfuerzo mecánico medio" (Oznur, Bricable) y radio mayor en movimiento. Lapp, para su cable multinúcleo ÖLFLEX CLASSIC 100 (que no es H05VV-F), habla de flexión ocasional sin repetición continua ([ficha](https://www.electricautomationnetwork.com/en/lapp/00101183-olflex-classic-100-450-750v-5g35-lapp-colour-coded-pvc-power-and-control-cable)). Para el cajón, **no puedo decir cuántas aperturas aguanta.**
- **Recuerdo mío, sin verificar:** EN 60335-1 cláusula 23 trae un ensayo de flexión para el cableado interno que se mueve en uso normal o en mantenimiento, con un número de ciclos (del orden de cientos o de miles). No he podido leerla. Pregúntalo a quien haga la evaluación.
- **El cobre aluminizado empeora esto**: los hilos de CCA se rompen antes al flexionar ([ACI](https://www.aci.org.uk/news/aci-warns-dangerous-turkish-flexible-cord)).
- **Diseño recomendado (conclusión mía):**
  - Bucle de servicio largo, con curvatura suave y radio de varias veces el diámetro, nunca un doblez en el ojal.
  - Sujetar el cable con una brida a un punto fijo cerca del ojal, para que la flexión ocurra en el tramo libre y no en el borde del crimpado.
  - Que el cajón al salir no tire del cable ni lo retuerza. Un tope mecánico evita tensar la tierra.
  - Si el cajón se abre muchas veces (cada día, por ejemplo), usar para esa rama un cable pensado para flexión (hilo extraflexible de clase 6 o trenza de tierra), en vez del núcleo suelto. Es una pregunta para el proyecto: **¿cuántas veces al día se abre el cajón?**
  - Proteger con funda trenzada o espiral el tramo que roce con bordes.

### 4.6 Pelado y terminales (solo lo que afecta al cable)

Qué hacen los terminales (#23, #27, #28) está en sus fichas. Aquí, lo que depende del cable.

- **Pelar la funda:**
  - El núcleo tiene solo 0,7 mm de aislante. Una cuchillada lo deja sin protección y no se ve.
  - Con herramienta de corte con tope de profundidad, o con un corte longitudinal con cuchilla de gancho (conclusión mía; sin fuente).
  - Retira el relleno de PVC que va entre los núcleos (lo cita Oznur) y recorta el sobrante.
- **Pelar el núcleo:**
  - La longitud la marca el terminal. El manual de Mean Well **no la da**. Mide con la puntera o el ojal en la mano.
  - Meter todos los hilos: "Make sure that all strands … enter the terminal" (Mean Well). Una puntera de 1,5 mm² con collarín lo asegura (conclusión mía; el manual no habla de punteras).
  - No cortes hilos para que entre. Un conductor de 1,5 mm² con hilos cortados es uno de menos sección.
- **Estañado:**
  - **No estañes el extremo que va bajo un faston, un ojal crimpado o un tornillo.** El estaño fluye bajo presión y el contacto se afloja con el tiempo (conclusión mía; sin fuente).
  - Si un tramo tiene que ir estañado por otro motivo, que sea fuera de la zona de apriete.
- **Puntera en la LRS:** Mean Well da tornillos M3,5 y 8-10 kgf·cm para la serie LRS, pero la fila de la LRS sale desordenada en la copia de 2024 (ficha #14). Confirma el par en tu unidad.
- **Inspección:** tira firme del terminal después de crimpar; el hilo no debe salir ni mostrar hilos sueltos fuera del barril (conclusión mía).

## 5. Fallos, bugs y problemas conocidos

Hay muy poca evidencia sobre esta pieza en concreto: **no he encontrado reseñas técnicas, pruebas independientes ni retiradas de manguera H05VV-F por metros.** Lo que sigue combina lo que sí encontré (sobre cables parecidos) y riesgos plausibles marcados como míos.

| # | Problema | Gravedad para el proyecto | Fuente |
|---|---|---|---|
| 1 | Conductor de cobre aluminizado (CCA) o con menos cobre del marcado | Alta | ACI 2018; ACI/131/12; Fluke |
| 2 | Sección real menor que la marcada | Alta | Alertas Safety Gate (cables de aparatos), ACI |
| 3 | Núcleo cortado o rozado al pelar la funda | Alta | Mío |
| 4 | Hilos de tierra rotos por flexión repetida (cajón, caja suspendida) | Alta | Lapp (uso en movimiento no previsto); ACI (CCA) |
| 5 | Marcado ausente o falso (sin ◄HAR►, sin fabricante) | Media | Mío (no hallé casos documentados) |
| 6 | Núcleos sueltos que rozan bordes de chapa o la fuente | Media-alta | Lapp; Mean Well |
| 7 | Verde-amarillo usado como puente o recoloreado | Media | HD 308, IEC 60446 |
| 8 | Líquidos derramados sobre el cable | Media | Nexans FR (agua y química "accidental") |
| 9 | PVC reciclado o aislante más fino que el medio de fábrica | Media, sin datos | Mío |
| 10 | Temperatura junto a la fuente por encima de 60-70 °C | Baja-media | Nexans; ficha #14 |
| 11 | Estañado bajo el terminal | Media | Mío |

### 5.1 Cobre aluminizado y sección menor (gravedad alta)

- **Caso documentado:** un cable flexible de PVC de 1,5 y 2,5 mm² marcado "Made in Turkey / Ermaks" era de CCA. Su resistencia superaba el máximo de las normas; el de 2,5 mm² solo alcanzaba la capacidad de uno de 1,0 mm² ([ACI, 21-09-2018](https://www.aci.org.uk/news/aci-warns-dangerous-turkish-flexible-cord); [ECN](https://electricalcontractingnews.com/news/aci-warns-of-dangerous-turkish-flexible-cord/)). La ACI vio estos cables tras su campaña "Counterfeit Flexible Cords". No da cifras de resistencia.
- **Efecto en la resistencia (cálculo mío):** un CCA con 10 % de cobre en volumen conduce el 65 % que el cobre (regla de mezclas, sin dato de fabricante). Con 1,5 mm² daría unos 17,7 mΩ/m, el 33 % por encima del límite de 13,3 mΩ/m. Fluke dice que el aluminio tiene "alrededor del 55 % más" de resistencia que el cobre del mismo diámetro ([Fluke](https://de.flukenetworks.com/blog/cabling-chronicles/cca-not-worth-savings-or-risk)); mi cálculo da 54 %.
- **Peso:** un CCA de 10 % de cobre pesa el 37 % del cobre (cálculo mío). Fluke avisa de que algunos falsificadores añaden lastre o usan CCA más pesado: el peso solo no basta.
- **Nota de ACI/131/12** (cables de datos): los CCA muy baratos tienen "menos del 20 % de cobre".
- **Sección real menor que la marcada:** las alertas Safety Gate recientes de la base europea hablan de cables de aparatos con sección insuficiente, p. ej. SR/01407/26 (cadena de luces: sección del cable, resistencia mecánica y rigidez dieléctrica insuficientes) y SR/01413/26 (bomba sumergible ORCA: puesta a tierra, aislamiento y sección del cable inadecuados; paráfrasis mía del inglés) ([informe, copia en certifico.com](https://www.certifico.com/component/attachments/download/60165)). Otras alertas de 2020 y 2021 (alargaderas, luces) están en la [ficha #17](../cable-schuko-c13-2m/README.md#61-conductores-más-finos-de-lo-marcado). **Ninguna es una manguera H05VV-F vendida por metros.**
- **No hallé** pruebas independientes de ACI, Test-Achats, OCU, Which? o Stiftung Warentest sobre H05VV-F. No hice una búsqueda directa en esos sitios; el presupuesto de búsquedas se agotó.

### 5.2 Núcleo dañado al pelar (gravedad alta)

Con 0,7 mm de aislante, un corte o un arañazo deja el cobre cerca de la superficie y no se ve a simple vista. Es un fallo oculto que puede caer justo en el hilo de tierra. Cómo detectarlo está en el apartado 6.

### 5.3 Flexión repetida (gravedad alta)

Ver apartado 4.5. El hilo suelto no está pensado para moverse y no hay cifra de ciclos. Si falla un hilo de la tierra del cajón, el cajón queda sin protección sin que se note.

### 5.4 Marcado y trazabilidad (gravedad media)

Un cable correcto lleva impreso el fabricante, ◄HAR► y H05VV-F ([Nexans](https://latrivenetacavi.nexans.com/en/products/industrial-and-logistics/industrial-Eca-class/H05VV-F38485/product~021121007~.html)). No he encontrado casos documentados de marcado falso en H05VV-F. En módulos C14 sí hay avisos sobre marcas ENEC/VDE sin número ([ficha #15](../modulo-c14-fusible-interruptor/README.md)). Mi regla: sin fabricante y sin HAR en la funda, no vale como prueba de nada.

### 5.5 Otros riesgos (míos)

- **Roce con la chapa:** los agujeros de chapa llevan pasacables (#31); los hilos sueltos de tierra, también.
- **Líquidos:** Nexans FR clasifica el agua y la química como "accidental". Un bar no es un entorno limpio; mantén los cables fuera de la zona de salpicaduras.
- **PVC reciclado:** no hay fuente. Un PVC malo se nota en un aislante rígido, quebradizo, pegajoso o con mucho olor, pero no existe medida fiable sin laboratorio.
- **Calor:** ver apartado 4.3.

## 6. Qué comprobar al recibirla

Hazlo **antes de pelar nada**, con el cable desconectado de la red. Corta una muestra de 1,000 m para las pruebas destructivas (la muestra se guarda como referencia del lote).

### 6.1 A simple vista y medidas mecánicas

| Qué mirar | Aceptable | Fuente del criterio |
|---|---|---|
| Marcado en la funda | Fabricante, ◄HAR► (o marca del organismo), H05VV-F y 3G1,5 / 3×1,5, legible y repetido a lo largo del cable | Nexans (formato); resto mío |
| Colores de los núcleos | Marrón, azul y verde-amarillo. El verde-amarillo, con los dos colores a la vez (30-70 % de la superficie en 15 mm) | HD 308; IEC 60446 |
| Ø de la funda (calibre) | 7,9 a 8,4 mm nominal; hasta 9,4-9,8 mm (Nexans). **Menos de ~7,5 mm: desconfía** | Fabricantes; umbral mío |
| Peso de 1 m | **94 a 115 g.** Menos de ~85-90 g: desconfía (un CCA de 10 % de cobre pesaría unos 27 g menos, cálculo mío). Más de 125 g: no es el cable esperado | Fabricantes; cálculo mío |
| Núcleo aislado | Ø 2,95-3,0 mm. Conductor de Ø ≈ 1,55 mm → aislante de ≈ 0,7 mm (2,95 − 1,55) / 2 | Nexans NO |
| Hilos del conductor | Muchos y finos: ≥ 29 hilos si miden 0,26 mm. Ejemplos reales: 32 × 0,23 mm y 48 × 0,198 mm. Si hay pocos hilos gruesos, no es clase 5 | Lapp T11; Nexans NO; RND; cálculo mío |
| Aislante y funda | Flexibles y lisos. No quebradizos ni pegajosos, sin olor fuerte | Mío (sin fuente) |
| Rascado de un hilo | Cobre rojizo por dentro. Plateado = aluminio | [Fluke](https://de.flukenetworks.com/blog/cabling-chronicles/cca-not-worth-savings-or-risk), ACI |
| Doblado de un hilo suelto, repetido | No debe romperse en pocas flexiones. Compara con otro cable conocido | ACI (CCA se rompe antes); resto mío |

### 6.2 Prueba de la llama y olor

- **V-0 no aplica.** El H05VV-F se ensaya con IEC 60332-1-2 (un cable en vertical), que no se reproduce en casa.
- **No recomiendo quemar el cable:** el PVC desprende humo con ácido clorhídrico (conocimiento mío; sin fuente). Una prueba casera no demuestra nada que la sección o el peso no digan.
- **Olor y flexibilidad:** son indicios débiles, sin valor numérico.

### 6.3 Medida eléctrica

**Resistencia de un metro** (el método que decide si es cobre de 1,5 mm²):

1. Corta 1,000 m (±1 mm) de muestra y pela 15 mm de cada extremo de un núcleo.
2. Fuente de laboratorio en **corriente constante, 2 A** (tensión baja, sin red). Las pinzas de corriente van en los extremos del hilo, sobre el cobre pelado.
3. Mide la caída con un voltímetro aparte (4 hilos). Sus dos puntas tocan el cobre en dos puntos separados exactamente 1,000 m y quedan **entre** las pinzas de corriente, nunca fuera.
4. A 20 °C y 2 A, el máximo según la norma es **26,6 mV**; el cobre ideal de 1,5 mm² da 23,0 mV (cálculo mío). Corrige por temperatura: +0,4 % por kelvin (a 25 °C, +2 %).

| Hilo de 1 m | Resistencia a 20 °C | Caída a 2 A |
|---|---|---|
| Cobre 1,5 mm², máximo de la norma | 13,3 mΩ | 26,6 mV |
| Cobre 1,5 mm², ideal | 11,5 mΩ | 23,0 mV |
| Cobre 1,25 mm² | 13,8 mΩ | 27,6 mV |
| Cobre 1,0 mm² | 17,2 mΩ | 34,5 mV |
| CCA de 10 % de cobre y 1,5 mm² (estimación mía) | 17,7 mΩ | 35,4 mV |

Un resultado entre 23 y 27 mV es el esperado. Por encima de ~28 mV, con el cable a 30 °C o menos, el hilo no cumple 13,3 Ω/km: es de menos sección o de otro metal. La prueba no distingue 1,5 mm² de 1,4 mm². Repite en los tres núcleos y en un segundo trozo.

**Aislamiento:**

- Con un medidor de 500 V entre los tres hilos, y entre hilos y un papel de aluminio liado a la funda, el valor debe ser de megaohmios o más. **No tengo cifra de norma que citar.** El ensayo de fábrica del cable es de 2.000 o 4.000 V (los fabricantes no coinciden), que no debes reproducir tú.
- Que lo haga un electricista si no tienes medidor.

**Tierra ya montada:** repite la medida desde el pin del C14 hasta cada pieza metálica con un comprobador de 10-25 A (guía §6, IET, EN 50106) y guarda los valores en el expediente.

### 6.4 Documentos que pedir al vendedor

Fabricante y país de origen, certificado o licencia del cable (HAR/VDE/IMQ…), declaración UE de conformidad (la Directiva de baja tensión alcanza al cable: la de La Triveneta la cita), y hoja de datos. Si no los da, el cable está **sin garantía documental** y las medidas del apartado 6 son todo lo que tienes.

## 7. Alternativas

Solo si hay motivo. **No he comprobado disponibilidad ni precio en Amazon.es.**

| Opción | Qué es | Cuándo tiene sentido | Fuente |
|---|---|---|---|
| **H07V-K 1,5 mm² por colores** | Hilo suelto de cobre desnudo, clase 5, PVC TI1 de 0,7 mm, 450/750 V, sin funda; Lapp lo vende en varios colores, verde-amarillo incluido | No hay que pelar ninguna funda (se evita el riesgo de cortar un núcleo). Se compra el largo que se necesita de cada color. Algo más de tensión asignada | [Lapp](https://dam-media.lapp.com/6/664/66488/f0a2dcc6c9bf486fbe1ae684bc0f9c6b.pdf) ([copia local](datasheets/f0a2dcc6c9bf486fbe1ae684bc0f9c6b.pdf)), [RS](https://docs.rs-online.com/f569/0900766b81159e0e.pdf) |
| **H05V-K** | 300/500 V, **solo 0,5, 0,75 y 1,0 mm²** | **No sirve para 1,5 mm²**: ese tamaño es H07V-K | [Elektroimportøren](https://www.elektroimportoren.no/docs/lib/1040501-Produktblad-3.pdf) |
| **Misma manguera, de un fabricante con papeles** | Nexans, Faber, Helukabel, Lapp, etc., con hoja de datos, declaración UE y certificado | Si el vendedor de Amazon no da documentación | Apartado 3 |
| **Cable para flexión en las ramas móviles** | Hilo de clase 6 o trenza de tierra de 1,5 mm² o más | Cajón que se abre muchas veces. No he buscado productos concretos | Conclusión mía |

**Mi lectura:** la manguera es válida si el cable es bueno; no hace falta cambiarla. El H07V-K solo tiene sentido si prefieres no pelar fundas o necesitas más de 5 m de un color. Ni el H07V-K ni la manguera arreglan el problema de las ramas móviles (apartado 4.5).

**Disponibilidad:** el H05VV-F es un cable de catálogo estándar, con norma vigente (EN 50525-2-11) y fabricantes en toda Europa. No hay riesgo de descatalogación; el riesgo es de calidad del lote.

**Precio (contexto, no es prueba de calidad):** 27,74 € por 5 m son 5,55 €/m. En la web de OBI vi 5 m de H05VV-F 3G1,5 negro (Rev Ritter) por 5,79 € (1,16 €/m, con IVA alemán) ([OBI](https://www.obi.de/p/7624992/schlauchleitung-h05vv-f-3-g1-5-schwarz-5-m)) y elektrikshop pone 1,67 €/m al corte ([elektrikshop](https://www.elektrikshop.de/h05vv-f-3g1-5-pvc-schlauchleitung-weiss.html)). El anuncio de Amazon es varias veces más caro; no sé por qué (marca, certificación o margen). Pide los papeles antes de dar por bueno el sobreprecio.

## 8. Discrepancias con la guía y con mi planteamiento inicial

| # | La guía o mi planteamiento inicial dice | Lo que he encontrado | Fuente |
|---|---|---|---|
| 1 | Planteamiento inicial: resistencia máx. 13,7 Ω/km para 1,5 mm² (clase 5) | 13,7 es el límite del cobre **estañado**. El cobre desnudo (H05VV-F) es **13,3 Ω/km** | Lapp T11, Bayka, IET, Nexans, Faber, Oznur |
| 2 | Planteamiento inicial: un tramo de 1 m, 13,7 mΩ por conductor | Máximo 13,3 mΩ a 20 °C (ideal 11,5) | Mismas |
| 3 | Planteamiento inicial: peso típico 0,19-0,22 kg/m | **0,094-0,115 kg/m.** Con 0,2 kg/m sería un cable más grueso o relleno | Nexans, Faber, Letronic, Oznur, Bricable |
| 4 | Planteamiento inicial: tierra mínima de 1,5 mm² con protección mecánica y 2,5 mm² sin ella | ITC-BT-19 §2.3: 2,5 mm² con protección y 4 mm² sin ella, para conductores de protección fuera de la canalización de alimentación. Es norma de instalación fija; la de producto no la leí | ITC-BT-19 |
| 5 | Planteamiento inicial: 0,1 Ω según la guía y según EN 60335-1 cláusula 27 | 0,1 Ω confirmado en IET y en EN 50106 (resumen). **EN 60335-1 cl. 27 no leída** | IET, CYS |
| 6 | Guía §1 #22: el verde-amarillo sirve para "tierra y puentes" | El verde-amarillo es solo tierra. La tabla de §5.1 ya usa marrón y azul para los puentes; la frase de §1 sobra | HD 308, IEC 60446, ITC-BT-19 |
| 7 | Guía §5.1: tierra al espárrago con "faston / ojal M4" en 1,5 mm² | Los ojales M4 de la hoja (#23) son para 0,5-1,5 mm². Si se decide 2,5 mm², no valen | Hoja de compra #23; apartado 4.4 |
| 8 | Planteamiento inicial: 16 A según IEC 60364-5-52 y 10-16 A según la norma de cordones | Los fabricantes dan 16 A (aire, 30 °C). Nexans FR da 20 A. No he leído IEC 60364-5-52 | Nexans IT/FR, Faber, Oznur |

Puntos que tocan a otras piezas (una línea cada uno): #15 (la polaridad L/N depende de cómo se enchufe el Schuko; los colores del interior son los del C14, no los de la pared), #17 (cordón de red con tierra de 0,75-1,0 mm²), #23 (ojales para 0,5-1,5 mm²), #27 y #28 (faston y crimpadora) y #31 (pasacables).

## 9. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Pide al vendedor los papeles del cable** (fabricante, certificado o licencia, declaración UE de conformidad). Si no los da o no contesta, mide tú el cable (apartado 6.3) antes de pelarlo.
2. **Mide 1 m de resistencia en 4 hilos** a 2 A y pesa 1 m. Si la caída sale por encima de ~28 mV o el peso por debajo de ~90 g, **no uses ese rollo.** Guarda la muestra de 1 m, una foto del marcado y el lote.
3. **Pela con cuidado y revisa cada núcleo.** Mira el aislante con luz y flexiona el tramo pelado: si ves cobre, descarta el trozo.
4. **Tierra:** verde-amarillo solo para PE. Déjala más larga que L y N (la guía lo dice). Pregunta al electricista o al laboratorio si exigen 1,5 o 2,5 mm² para las ramas del espárrago a las piezas, **antes** de comprar los ojales.
5. **Ramas móviles (caja interior y cajón):** bucle de servicio holgado, brida cerca del ojal y tope mecánico. Si el cajón se abre a menudo, usa para esa rama un cable pensado para flexión. Responde a la pregunta del apartado 4.5.
6. **Protege el recorrido:** pasacables (#31), fundas en roces, nada apoyado en la carcasa de la LRS, y una brida del haz a un punto fijo cerca de cada borne.
7. **Donde L, N y tierra van juntos, deja la funda** si la geometría lo permite (apartado 4.2).
8. **Mide la tierra montada** con un comprobador de 10-25 A, de pin de C14 a cada pieza metálica, y guarda los valores.
9. **No estañes** bajo faston, ojal ni tornillo; introduce todos los hilos en el terminal; tira de cada crimpado.
10. **Expediente CE:** apunta tipo de cable, fabricante, lote, medidas del apartado 6 y fotos. El electricista o el laboratorio que evalúe la máquina decide si el cableado interno con núcleos de manguera cumple EN 60335-1.

## 10. Lo que no he podido verificar

- **El anuncio de Amazon (B07BDHJGKG):** no lo abrí; la búsqueda del ASIN solo devolvió otros cables. No sé la marca, la longitud real, el marcado ni si es cobre.
- **El texto de las normas** (de pago): EN 50525-2-11 (espesores mínimos, diámetros, marcado), EN 50525-1, EN 50565-1, IEC 60227-5, IEC 60228, EN 60335-1 (cláusulas 11.8 y tabla 3, 23, 25 y 27), EN IEC 60335-2-82, EN 60204-1 (cláusulas 8.2, 13 y tabla 5), IEC 60364-5-52 y 5-54, EN 60446. Las cifras vienen de fabricantes y de resúmenes.
- **Si el cableado interno con núcleos de manguera cumple EN 60335-1 / EN 60204-1.** No hay un texto que lo diga y no lo he podido leer.
- **Qué sección mínima de tierra pide la norma de producto** y si la ITC-BT-18 y la ITC-BT-26 añaden algo. No las he abierto.
- **El ensayo de flexión de la cláusula 23 de EN 60335-1** (mi recuerdo de que existe y de que tiene un número de ciclos no está comprobado).
- **Ciclos de flexión del H05VV-F:** ningún fabricante los da.
- **Espesores mínimos del aislante y de la funda:** solo tengo medias de fabricante (0,7 mm y 0,9 mm).
- **Tensión de ensayo de fábrica:** 2.000 V (Faber, Letronic) frente a 4.000 V (RR Kabel). No he podido resolverlo.
- **La ficha PDF de Nexans** del 3G1,5 y de la familia: mi herramienta no pudo abrirlas (robots.txt). La página web sí.
- **Datasheet PDF de Lapp, Prysmian y Helukabel para H05VV-F 3G1,5:** no los encontré. Lo único de Lapp sobre el tema es el H07V-K y el CLASSIC 100 (que no es H05VV-F); la ficha de Helukabel que abrí es del 0,75 mm² y remite a una descarga que no obtuve.
- **Casos de H05VV-F falsos vendidos por metros o por Amazon:** no encontré ninguno documentado. No consulté CPSC, OCU, Test-Achats, Which? ni Stiftung Warentest. No abrí el portal de Safety Gate; usé copias de informes semanales.
- **Que la tierra deba ser verde-amarilla "en todo su recorrido":** ninguna copia legible lo dice (apartado 4.4).
- **PVC reciclado:** sin fuente.
- **Cifras de CCA:** son una estimación mía (regla de mezclas), no datos de fabricante.
- **Páginas bloqueadas o no abiertas:** una copia pública de IS 302-1 (norma india basada en IEC 60335-1) en law.resource.org, cuya URL escribí de memoria y la herramienta rechazó, vista previa de IEC 60335-1 en VDE Verlag (robots.txt), página de Helukabel sobre CCA (redirigió y no la abrí), documentos ENEC 303 (error del servidor), Scribd (error de JavaScript).
- **Ninguna compra ni medida física:** todas las comprobaciones del apartado 6 son recomendaciones mías, no hechas.

## 11. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos) y carpeta [`datasheets/`](datasheets/).

Todos los enlaces, ordenados por tipo, y una lista de lo que no se pudo abrir, en [`enlaces.md`](enlaces.md).
