# Mean Well LRS-50-5 (fuente de alimentación 5 V, 10 A, 50 W)

Fuente única de la máquina. Convierte los 230 V de la red en 5 V y los reparte "en estrella" a la Raspberry Pi, el SumUp Solo, la pantalla y el sensor ZE29A. Va fija a la carcasa (tumbada sobre un separador), conectada a L, N y a tierra (borne FG) desde el módulo C14, y se ajusta a 5,20 V.

- **Compra:** ASIN B06XWRCWZ9, 18,52 € (precio de la hoja de componentes del 19-20/10/2026).
- **Referencia exacta:** Mean Well LRS-50-5, carcasa nº 239A.

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta: el precio y el anuncio son los de tu hoja y **no sé si el vendedor de ese ASIN vende producto original**.
>
> **Esta es la pieza con más riesgo físico del proyecto: lleva 230 V con los bornes al aire.** Un fallo de montaje o de tierra puede causar una descarga o un incendio. El manual de Mean Well advierte de que hay riesgo de descarga eléctrica y de energía (*electrical shock and energy hazard*) y de que "The ground (FG) must be connected to earth ground" ([manual](#claves-de-fuente), copia en montersi.pl). Como dice la guía: que un electricista revise la parte de 230 V y la tierra antes de enchufar.

## Cómo leer las fuentes y los números de página

- **No he podido abrir los dos PDF oficiales** que me diste (`LRS-50-SPEC.PDF` y `Enclosed_Type_EN.pdf` en meanwell.com): mi herramienta los rechazó por un permiso que no se resolvió. He leído **copias** de la hoja (cinco versiones, de 2015 a 2025) y dos copias del manual (una fechada 2024.10.16). Las dos herramientas que uso extraen el texto y lo resumen: **las tablas salen con las columnas desordenadas** y las curvas y dibujos no se leen.
- **Números de página:** la hoja vigente (2025-04-07) tiene 4 pies de página "File Name: LRS-50-SPEC", es decir, 4 páginas. Mi herramienta no devuelve la numeración, así que **los números de página que cito (con asterisco) están deducidos del orden del texto y no están verificados**: p. 1-2* = tabla de especificaciones y notas; p. 3* = curvas de derating, características estáticas y diagrama de bloques; p. 4* = dibujo mecánico y referencia al manual.
- Donde un valor aparece igual en varias copias de la hoja lo indico; donde solo lo vi en una, también.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales](#3-documentos-oficiales)
4. [Uso, ajuste e instalación](#4-uso-ajuste-e-instalación)
5. [Fallos, bugs y problemas conocidos](#5-fallos-bugs-y-problemas-conocidos)
6. [Fusible de entrada: datos de la fuente y cálculo](#6-fusible-de-entrada-datos-de-la-fuente-y-cálculo)
7. [Alternativas y disponibilidad](#7-alternativas-y-disponibilidad)
8. [Recomendaciones para el alcoholímetro](#8-recomendaciones-para-el-alcoholímetro)
9. [Lo que no he podido verificar](#9-lo-que-no-he-podido-verificar)
10. [Fuentes](#10-fuentes)

---

## 1. Resumen para el proyecto

- **Las cifras de la guía §2.6 coinciden con la hoja vigente (2025-04-07)**, con tres matices: la fuga de < 0,75 mA es **a 240 VAC**; la hoja **no lista protección contra sobretemperatura** (solo sobrecarga y sobretensión); y la hoja que leí **no dice "clase I" por escrito** (lo dice el manual, de forma condicional). Detalle en la [tabla de verificación](#verificación-de-la-guía-26-cifra-por-cifra).
- **Lo que la guía no recoge y importa:** la hoja avisa de que, **a 5 V y con carga entre 0 y 50 %, el modo ráfaga puede sacar el rizado de la especificación** (nota 7, vista en la versión de 2019 y en una copia antigua sin fecha; no la pude confirmar en la de 2025). Tu carga típica es ≈ 2,3 A de 10 A (23 %): **la fuente trabajará casi siempre en esa zona**.
- **El ajuste de 5,20 V deja poco margen en el peor caso:** sumando las tolerancias de la hoja (línea ±0,5 %, carga ±1,0 %, coeficiente de temperatura ±0,03 %/°C) el peor caso teórico llega a ≈ 5,32 V, por encima de los 5,25 V y 5,3 V que la guía usa como tope (cálculo mío, [apartado 4.1](#41-ajuste-de-la-tensión-y-márgenes)). En la práctica será menos; hay que medirlo en caliente.
- **La curva de derating con la temperatura no se puede leer con mis herramientas.** Solo tengo un dato secundario (60 % de potencia a 70 °C, de un pasaporte de un distribuidor ruso). La carga pico de 26 W es el 52 % de la potencia nominal, así que el margen parece grande, pero **hay que medir la temperatura dentro de la caja cerrada**.
- **Falsificaciones: existen y Mean Well lo reconoce.** No encontré casos publicados de LRS-50-5 falsas, solo de otras series y de marcas parecidas ("Mieg Waei"). El ASIN no se puede comprobar: **marca sin verificar**. Mean Well recomienda comprar a sus distribuidores autorizados; guarda la factura ([apartado 5.1](#51-falsificaciones-y-marcas-parecidas)).
- **Fusible T2,5A: no veo incoherencia con el arranque.** El pico de 45 A equivale a ≈ 0,7-1,6 A²s (cálculo mío) frente a 22,3 A²s de fusión del T2,5A (Littelfuse 215). Mean Well **no dice nada de fusible externo** en la hoja ni en el manual ([apartado 6](#6-fusible-de-entrada-datos-de-la-fuente-y-cálculo)).

## 2. Especificaciones

Hoja de referencia: **LRS-50-SPEC 2025-04-07** (copia de Mean Well Australia), salvo donde se indica. Claves de fuente en [el apartado 3](#claves-de-fuente). "Sin verificar" = no pude confirmarlo en una segunda copia o no se lee bien.

| Característica | Valor | Fuente y comentario |
|---|---|---|
| Salida | 5 V, 0-10 A, 50 W | H25 p. 1-2*; igual en todas las versiones |
| Ajuste de tensión (V.ADJ) | 4,5 a 5,5 V | H25 p. 1-2*; también [Berrybase](https://www.berrybase.de/en/meanwell-1-channel-built-in-switching-power-supply-50w-5v-10a) y [Electrokit](https://www.electrokit.com/en/switchat-nataggregat-5v-10a-mean-well-lrs-50-5) |
| Tolerancia de tensión | ±2,0 % | H25 p. 1-2*. La nota 3 (versiones antiguas) dice que incluye el ajuste de fábrica, la regulación de línea y la de carga |
| Regulación de línea / de carga | ±0,5 % / ±1,0 % | H25 p. 1-2* (columnas deducidas por el orden del texto) |
| Rizado y ruido | 80 mVp-p máx. | H25 p. 1-2*. Medido a 20 MHz, con par trenzado de 12" y 0,1 µF + 47 µF en paralelo (nota 2, versiones antiguas). **Nota 7: a 5 V con carga 0-50 % puede superarse** |
| Coeficiente de temperatura | ±0,03 %/°C (0-50 °C) | H25 p. 1-2* |
| Eficiencia típica | 83 % | H25 p. 1-2*, a 230 VAC, carga nominal, 25 °C (nota 1). **No hay curva de eficiencia a carga parcial** |
| Entrada | 85-264 VAC; 120-373 VDC; 47-63 Hz | H25 p. 1-2* |
| Corriente de entrada típica | 0,95 A a 115 VAC; 0,56 A a 230 VAC | H25, H22, H19 (valor a plena carga; sin dato de factor de potencia) |
| **Corriente de arranque** | **45 A típ. a 230 VAC, arranque en frío** | H25, H22, H19 y H15 (cuatro de las cinco copias; en H15b no lo miré). El [catálogo p. 4](https://www.meanwell.com/catalog/product/files/basic-html/page4.html) da tres valores (45, 65 y 50 A a 230 VAC) para LRS-35/50/75/100 **sin etiquetarlos por modelo**; manda la hoja |
| Corriente de fuga | < 0,75 mA a 240 VAC | H25, H22, H19, H15. En la guía falta "a 240 VAC" |
| Tiempo de arranque (setup) / subida | 1000 ms y 30 ms a 230 VAC; 2000 ms y 30 ms a 115 VAC, a plena carga | H25 y H22. Qué cifra es setup y cuál es subida: deducido por el orden |
| Hold-up (mantenimiento) | 30 ms a 230 VAC; 12 ms a 115 VAC, a plena carga | H25, H22, H15 |
| Protección contra sobrecarga (OCP) | 110-150 % de la potencia nominal; modo *hiccup* con recuperación automática | H25, H22, H15. A 5,2 V equivale a ≈ 10,6-14,4 A (cálculo mío) |
| Protección contra sobretensión (OVP) | 5,9-7,3 V; **apaga la salida y hay que reencender para recuperar** | H25, H22, H19, H15b. **La versión de 2015-06 decía 5,75-6,9 V**; el catálogo dice 115-135 % |
| Protección contra sobretemperatura (OTP) | **No figura en la hoja** (miré las copias de 2015-06, 2022 y 2025) | Mi planteamiento inicial la daba por supuesta; la guía no la cita. Los distribuidores solo citan cortocircuito, sobrecarga y sobretensión |
| Temperatura de funcionamiento | −30 a +70 °C "según la curva de derating" | H25 p. 1-2* |
| Humedad de funcionamiento | 20-90 % HR, sin condensación | H25 p. 1-2* |
| Almacenamiento | −40 a +85 °C, 10-95 % HR sin condensación | H25 p. 1-2* |
| Altitud | Hasta 2000 m; reducir 5 °C por cada 1000 m más | H25 y nota 8. El catálogo dice 5000 m |
| Vibración | 10-500 Hz, 5 G, 10 min por ciclo, 60 min en cada eje X, Y, Z | H25 p. 1-2* (solo la leí en esta versión) |
| Aislamiento (ensayo) | Entrada-salida 4 kVAC; entrada-FG 2 kVAC; salida-FG 1,25 kVAC; 100 MΩ a 500 VDC | H25 p. 1-2* (solo la leí en esta versión) |
| Categoría de sobretensión | III | H25 |
| MTBF | 3149,8 K h mín. (Telcordia SR-332); 561,6 K h mín. (MIL-HDBK-217F, 25 °C) | H25 y H22. **H19 y anteriores: 645 K h (MIL-HDBK-217F, 25 °C)** |
| Dimensiones | 99 × 82 × 30 mm (L × A × H), tolerancia ±1 mm | H25 p. 4* |
| Peso | 0,21 kg | H25. [RS](https://uk.rs-online.com/web/p/switching-power-supplies/1065829) y Berrybase dicen 230 g |
| Bornes | 5 pines: 1 = −V, 2 = +V, 3 = FG, 4 = AC/L, 5 = AC/N | H22 (explícito) y H15 (deducido) p. 4*. **Comprueba las marcas impresas en la fuente** |
| Fijación | "2-M3 L=3.0" y "2-M3 L=5" | H25, H22, H19, H15b p. 4*. **No sé cuál es lateral y cuál inferior** (ver tabla de verificación) |
| Refrigeración | Convección libre, sin ventilador; carcasa metálica con perforaciones | [Elmark](https://elmark-automation.com/shop/mean-well/enclosed-power-supply-lrs-50), [Electrokit](https://www.electrokit.com/en/switchat-nataggregat-5v-10a-mean-well-lrs-50-5) |
| Indicador y ajuste | LED verde de encendido y potenciómetro V.ADJ | [ProtoSupplies](https://protosupplies.com/product/meanwell-power-supply5v-10a-50w/), [Electrokit](https://www.electrokit.com/en/switchat-nataggregat-5v-10a-mean-well-lrs-50-5) (fuentes secundarias) |
| Frecuencia de conmutación | ≈ 75 kHz a 115 VAC y ≈ 110 kHz a 230 VAC | H25 p. 3* (texto de un gráfico, **sin verificar**) |
| Garantía | 3 años | [Catálogo p. 4](https://www.meanwell.com/catalog/product/files/basic-html/page4.html) y [Mean Well Australia](https://www.meanwellaustralia.com.au/products/LRS-50) (insignia "3 Year Warranty"). Sin comprobar en la hoja |
| Uso previsto | "Solo uso profesional"; cumple EN 60335-1 con grado de contaminación 3 (PD3) | Texto de la ficha de producto de Mean Well copiado por [Elmark](https://elmark-automation.com/shop/mean-well/enclosed-power-supply-lrs-50) (fuente secundaria) |

### Normas y compatibilidad electromagnética (hoja 2025, p. 1-2*)

- **Seguridad:** UL 62368-1; TÜV BS EN/EN 62368-1; BS EN/EN 60335-1; BS EN/EN 61558-1 / -2-16; GB 4943.1; BSMI CNS 14336-1; EAC TP TC 004; AS/NZS 60950.1 (por CB). La hoja **no da números de certificado**. Las dos normas que citas, EN 62368-1 y EN 60335-1, **figuran en la lista**.
- **Emisión:** EN 55032 (CISPR 32) **clase B**, EN 55014, EN 61000-3-2 y -3.
- **Inmunidad:** EN 61000-4-2, -3, -4, -5, -6, -8, -11; EN 61000-6-2; EN 55035; "nivel de industria pesada".
- **Nota 9:** la fuente es un **componente**; el equipo final debe volver a confirmar la compatibilidad electromagnética.

### Versiones de la hoja que he leído

El texto cambia entre versiones. Esto importa si compras unidades de lotes distintos.

| Versión (marca del pie) | MTBF | OVP | Normas de seguridad | Emisión EMC | Copia leída |
|---|---|---|---|---|---|
| 2015-06-16 | 645 K h (MIL) | 5,75-6,9 V | UL 60950-1, TÜV EN 60950-1, EN 60335-1, EN 61558 | EN 55022 | [piekarz.pl](https://piekarz.pl/pdf/27180), [Rapid](https://static.rapidonline.com/pdf/85-5643_v1.pdf) (sin fecha visible, mismo contenido) |
| 2015-12-31 | 645 K h (MIL) | 5,9-7,3 V | Igual que 2015-06 | EN 55022 | [RS](https://docs.rs-online.com/19bc/0900766b814e41ec.pdf) |
| 2019-07-23 | 645 K h (MIL) | 5,9-7,3 V | UL 62368-1, TÜV EN 62368-1, EN 60335-1, EN 61558 | EN 55032 | [pulsar.pl](https://lib.pulsar.pl/karta/es/LRS-50-5.pdf) |
| 2022-02-18 | 3149,8 K (Telcordia) y 561,6 K (MIL) | 5,9-7,3 V | Igual que 2019 | EN 55032 | [apsoparts](https://www.apsoparts.com/media/downloads/asset//std.lang.all/05/22/LRS-50_1680-21407-0000-E-0522.pdf) |
| 2025-04-07 | 3149,8 K y 561,6 K | 5,9-7,3 V | Igual que 2019 | EN 55032; inmunidad con EN 55035 | [Mean Well Australia](https://www.meanwellaustralia.com.au/sites/default/files/2025-05/MEAN%20WELL%20LRS-50%20DATA%20SHEET.pdf) |

Mean Well anunció en noviembre de 2019 que la familia LRS había completado el cambio a EN/IEC 62368-1 en octubre de 2019, sin dar fecha de lote ni modelos ([EE Power](https://eepower.com/new-industry-products/mean-well-announces-lrs-family-completed-ieculen62368-safety-upgrade)). **Una unidad de stock antiguo puede ser de antes de ese cambio.**

### Verificación de la guía §2.6 cifra por cifra

| La guía dice | La hoja dice | Resultado |
|---|---|---|
| Ajuste de 4,5 a 5,5 V | 4,5-5,5 V | Coincide |
| Eficiencia 83 % | 83 % típ. a plena carga y 230 VAC | Coincide; **solo a plena carga** |
| Entrada 85-264 VAC | 85-264 VAC (y 120-373 VDC) | Coincide |
| Pico de arranque 45 A a 230 VAC | 45 A típ., arranque en frío, 230 VAC | Coincide. Es un valor **típico y en frío**; no hay dato en caliente (apartado 5.7) |
| Fuga < 0,75 mA | < 0,75 mA **a 240 VAC** | Coincide; falta la tensión |
| 99 × 82 × 30 mm | 99 × 82 × 30 mm | Coincide |
| 5 bornes (L, N, FG, −V, +V) | 5 pines: −V, +V, FG, L, N | Coincide. **+V queda junto a FG y FG junto a L** |
| Normas EN 62368-1 y EN 60335-1 | Ambas en la lista de la hoja 2025 | Coincide. La declaración CE pública cita normas antiguas (apartado 3) |
| Clase I: el borne FG es obligatorio | El manual: "The ground (FG) must be connected to earth ground" y, en su tabla de cableado, "PE and FG (Class I only)". La hoja no dice "clase I" por escrito | Coincide con el manual. Un pasaporte ruso de un distribuidor sí dice "clase I" (secundario) |
| Tornillos M3, 3 mm de penetración en los laterales y 5 mm en la base | Dibujo con "2-M3 L=3.0" y "2-M3 L=5" | **Las dos longitudes existen. La asignación lateral/inferior no la pude leer** en el texto del dibujo. Una copia de 2015 parece decir L=4,5 en vez de 3,0 (lectura única y confusa, sin confirmar). La ficha [#26](../tornilleria-inox-m3-m6/README.md) abrió tres copias (2015, 2019 y 2025) y en todas lee L=3.0; sospecha que el "4,5" viene de las cotas "4.5" y "92.5" del dibujo (hipótesis suya, sin confirmar) |
| (La guía §2.6 no lista protecciones; mi planteamiento inicial pedía comprobar OCP, OVP, OTP) | OCP (110-150 %, hiccup) y OVP (5,9-7,3 V, con reencendido); **sin OTP** | La OTP no aparece en la hoja |
| Hold-up, rizado, arranque, humedad, vibración, MTBF | 30 ms; 80 mVp-p; 1 s; 20-90 % HR; 5 G; ver tabla | La guía no los cita. Ver apartado 5 |
| Derating | Curva de carga (%) frente a temperatura ambiente, una por tensión de entrada | **No pude leer los puntos** |

## 3. Documentos oficiales

### Claves de fuente

| Clave | Documento | Enlace |
|---|---|---|
| H25 | Hoja LRS-50-SPEC 2025-04-07 (copia de Mean Well Australia) | [PDF](https://www.meanwellaustralia.com.au/sites/default/files/2025-05/MEAN%20WELL%20LRS-50%20DATA%20SHEET.pdf) |
| H22 | Hoja LRS-50-SPEC 2022-02-18 (apsoparts) | [PDF](https://www.apsoparts.com/media/downloads/asset//std.lang.all/05/22/LRS-50_1680-21407-0000-E-0522.pdf) |
| H19 | Hoja LRS-50-SPEC 2019-07-23 (pulsar.pl) | [PDF](https://lib.pulsar.pl/karta/es/LRS-50-5.pdf) |
| H15b | Hoja LRS-50-SPEC 2015-12-31 (RS) | [PDF](https://docs.rs-online.com/19bc/0900766b814e41ec.pdf) |
| H15 | Hoja LRS-50-SPEC 2015-06-16 (piekarz.pl) y copia sin fecha (Rapid) | [PDF](https://piekarz.pl/pdf/27180) · [PDF](https://static.rapidonline.com/pdf/85-5643_v1.pdf) |
| Manual | Manual de instalación "Enclosed Type" (copia de montersi.pl, sin fecha visible) | [PDF](https://www.montersi.pl/instrukcje/Enclosed_Type_EN.pdf) |
| Manual24 | Manual de instalación "Enclosed Type Switching Power Supply", fechado 2024.10.16 (copia de Mean Well Australia) | [PDF](https://www.meanwellaustralia.com.au/sites/default/files/2024-11/Enclosed%20Power%20Supply%20Installation%20Manual.pdf) |

### Tabla de documentos

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Hoja LRS-50 (oficial, **no pude abrirla**) | LRS-50-SPEC | PDF | [meanwell.com](https://www.meanwell.com/Upload/PDF/LRS-50/LRS-50-SPEC.PDF) |
| Manual de instalación, inglés (oficial, **no pude abrirlo**) | Enclosed_Type_EN | PDF | [meanwell.com](https://www.meanwell.com/Upload/PDF/Enclosed_Type_EN.pdf) |
| Manual de instalación 2024.10.16 (copia leída) | Enclosed Power Supply Installation Manual | PDF | [Mean Well Australia](https://www.meanwellaustralia.com.au/sites/default/files/2024-11/Enclosed%20Power%20Supply%20Installation%20Manual.pdf) |
| Manual de instalación, **español** (no abierto) | Enclosed_Type_SP | PDF | [meanwell.com](https://www.meanwell.com/Upload/PDF/Enclosed_Type_SP.pdf) |
| Manual de instalación, italiano (no abierto) | Enclosed_Type_IT | PDF | [meanwell.com](https://www.meanwell.com/Upload/PDF/Enclosed_Type_IT.pdf) |
| Declaración CE de conformidad LRS-35/50, versión 4, 12-1-2017 (copia leída) | LRS-50 CE DECLARATION | PDF | [Mean Well Australia](https://meanwellaustralia.com.au/sites/default/files/2024-09/MEAN%20WELL%20LRS-50%20CE%20DECLARATION.pdf) |
| Misma declaración en el sitio de Mean Well (según Elmark; no abierta) | LRS-35,50-CE-dec | PDF | [meanwell.com](https://www.meanwell.com/upload/pdf/LRS-35/LRS-35,50-CE-dec.pdf) |
| Certificado LRS-50 (**robots.txt me impidió abrirlo**) | LRS-50_CER_001 | PDF | [digimax.it](https://www.digimax.it/media_import/ALIMENTATORI/MEANWELL/ACDC%20ENCLOSED/LRS-50/LRS-50_CER_001.pdf) (el enlace tal como salió tenía espacios en la ruta; aquí están codificados) |
| Página de documentos y software (informes, certificados CB y TÜV, 3D) | LRS-50 | Web | [meanwell.com](https://www.meanwell.com/webapp/product/search.aspx?prod=LRS-50) (no abierta) |
| Información del fabricante e importador, guía rápida y seguridad (Elmark) | — | PDF | [cdn.elmark.com.pl/32063](https://cdn.elmark.com.pl/32063) (**rechazado por la herramienta**; puede tener la información de seguridad y del importador en la UE) |
| Modelo 3D / hoja en un distribuidor brasileño | LRS-50-SPEC / lrs-50-3d | PDF y ZIP | [PDF](https://metaltex.com.br/cdn/shop/files/LRS-50-SPEC.pdf?v=16745386383833487491) · [ZIP](https://metaltex.com.br/cdn/shop/files/lrs-50-3d.zip?v=6287321075361797459) (no abiertos) |
| Catálogo industrial de Mean Well, página 4 (serie LRS) | — | Web | [page4.html](https://www.meanwell.com/catalog/product/files/basic-html/page4.html) |

Cómo llegar a los certificados CB y TÜV y a los informes de ensayo: según un hilo de Digi-Key, desde [meanwellusa.com](https://www.meanwellusa.com/) se busca "LRS-50", se abre la ficha y se pulsa "Report, Certificate, etc." ([hilo](https://forum.digikey.com/t/finding-meanwell-test-report-certificates-3d-stp-file/61323)). Ojo: la ficha de RS enlaza como "LRS-50 Series Datasheet" una hoja con marca **2015-12-31** (la H15b), es decir, antigua. Los distribuidores no siempre enlazan la versión vigente.

### Qué dicen los más relevantes

**Declaración CE (versión 4, 12-1-2017).** Cubre "LRS-35,50-x" (x = 3,3; 5; 12; 15; 24; 36) a partir del número de serie "EB7xxxxxxx". Directivas: RoHS 2011/65/UE, baja tensión 2014/35/UE y compatibilidad electromagnética 2014/30/UE. Las normas que cita son **antiguas**: EN 60950-1:2006+A11+A1+A12+A2, EN 60335-1:2012+A11 / EN 62233:2008, EN 61558-1/-2-16, y para EMC EN 55022 y EN 55032:2012 clase B, EN 55024 y EN 61000-6-2. Da tres números de certificado TÜV (R50311822, R50313790, R50313121) sin decir a qué norma corresponde cada uno; **no he podido contrastarlos**. Dice que la fuente es un componente que se instalará con su carga en un equipo final y que el fabricante del equipo final **debe volver a cualificar la directiva EMC** con la instalación completa; los ensayos de Mean Well se hicieron con una placa metálica que simula la caja.
- **Discrepancia con la hoja 2025:** la hoja cita EN 62368-1 y EN 55035; esta declaración pública, EN 60950-1 y EN 55024. La declaración del sitio de Mean Well puede estar actualizada: **pide la vigente** al vendedor o a Mean Well.

**Manual de instalación.** Leí dos copias: la de montersi.pl (sin fecha ni versión) y la de Mean Well Australia, fechada **2024.10.16** (sin número de versión). Dicen lo mismo en lo esencial.
- **Tornillos de bornes:** en la copia de montersi.pl la serie LRS aparece en la tabla de tornillo único con **M3,5 y 8-10 kgf·cm** (≈ 0,8-1,0 N·m, conversión mía). En la copia de 2024 la fila de las LRS (de la LRS-035 a la LRS-600) sale desordenada y **no pude asignarle con seguridad ese valor** (hay también una línea "M4 10-12" cerca). Trátalo como probable pero **sin verificar para la LRS-50**: mira la tabla del PDF oficial. El manual advierte de tolerancias de ±10 % o ±20 % según el material y recomienda tornillos con parche de bloqueo (Nylok) en aplicaciones exigentes.
- **Calibre de cable:** tabla genérica, no por serie: AWG 18 (0,75 mm²) hasta 6 A, hasta AWG 8 (6 mm²) para 32-40 A; reducir al 80 % de la corriente con 5 o más hilos. No hay longitud de pelado.
- **Tierra:** conectar el hilo FG (verde o verde-amarillo) a tierra; el paso se puede omitir solo si la unidad está marcada clase II.
- **Fijación:** mantener distancia de aislamiento suficiente entre los tornillos de montaje y los componentes internos; la longitud máxima está en el dibujo de la hoja. Cambiar la orientación o trabajar a alta temperatura obliga a reducir la corriente.
- **Ventilación:** dejar libres los orificios; mantener **10-15 cm de separación si el equipo vecino es una fuente de calor**.
- **Advertencias:** desconectar de la red antes de instalar o mantener y evitar que se reconecte; no abrir la caja; no instalar en zonas de mucha humedad, cerca de agua, a alta temperatura o cerca del fuego; no superar la corriente ni la potencia nominales; el EMC del sistema final hay que revalidarlo.
- **Solo en la copia de 2024:** una advertencia indica que, para la LRS (normas taiwanesas CNS 15598-1 y CNS 15936), el equipo que rodea a la fuente debe tener una inflamabilidad de V1 o superior y que evite instalarla en entorno residencial. Es un requisito de Taiwán, pero apunta a que **los plásticos cercanos a la fuente (separadores, ventana de policarbonato) deberían ser ignífugos**. La copia de 2024 tampoco da temperatura ni humedad numéricas: las remite a la hoja.
- **Lo que NO dice:** no da distancias de aislamiento ni líneas de fuga (en mm) hacia el chasis; no habla de fusible interno ni externo; no trata cargas capacitivas ni arranques repetidos; no explica cómo se une la carcasa metálica a FG.

**Hoja.** Ver apartado 2. Las notas 6 y 7 son las que más importan aquí (apartado 5).

## 4. Uso, ajuste e instalación

### 4.1 Ajuste de la tensión y márgenes

El potenciómetro V.ADJ da de 4,5 a 5,5 V. Al ajustar se mide con la carga conectada y el equipo a la temperatura de trabajo. Cálculo del peor caso con las tolerancias de la hoja (todo **cálculo mío**):

| Concepto | Efecto sobre 5,20 V |
|---|---|
| Regulación de línea ±0,5 % de 5,20 V | ±26 mV |
| Regulación de carga ±1,0 % de 5,20 V | ±52 mV |
| Coeficiente de temperatura ±0,03 %/°C, ajustando a 25 °C y trabajando a 55 °C (+30 °C) | +47 mV |
| **Máximo en el peor caso** | **≈ 5,32 V** |
| **Mínimo en el peor caso** | ≈ 5,08 V (sin contar la caída del cable) |

- Esos márgenes son los **límites de la especificación**, no lo que dará tu unidad. Pero indican que ajustar a 5,20 V no garantiza quedarse por debajo de 5,25 V (tope de la guía; la ficha de la pantalla dice que esa cifra es de otra pantalla) ni de 5,3 V (máximo del ZE29A según su manual).
- Con 5,10-5,15 V el máximo teórico es ≈ 5,22-5,27 V, y el mínimo en la Pi, descontando el latiguillo (≈ 0,1-0,2 V a 2 A, estimación mía), sigue por encima de 4,63 V (umbral de subtensión de la Pi, ver [su ficha](../raspberry-pi-3b-plus/README.md)).
- El medidor también tiene error. Usa un polímetro con precisión conocida y mide **en los bornes de cada carga**, no solo en la fuente.

### 4.2 Bornes y cableado

- **Orden de los bornes (hoja p. 4*):** −V, +V, FG, L, N. **+V está junto a FG y FG junto a L.** Un hilo en el borne equivocado puede poner 230 V en el chasis o en la salida. Comprueba las marcas impresas en la unidad y haz la prueba de continuidad y aislamiento sin red antes de enchufar.
- **Par de apriete:** 8-10 kgf·cm (≈ 0,8-1,0 N·m) en tornillos M3,5 según la copia de montersi.pl; **sin verificar para la LRS-50 en la copia de 2024** (apartado 3). Reapretar tras el primer ciclo térmico es una práctica general mía; el manual no lo dice.
- **Hilos:** meter todos los filamentos en el borne (manual). La guía usa puntera en los bornes de la fuente: **no he podido comprobar la sección máxima de conductor ni el ancho útil del borne**, así que verifica que la puntera de 1,5 mm² (con collarín) cabe y que el tornillo la sujeta sin aplastarla.
- **Cable de 5 V:** la guía usa 0,75 mm² (AWG 18) para un pico de 5 A; la tabla del manual da 6 A para ese calibre. Coincide.
- **Tierra:** el cable de FG más largo que L y N (la guía ya lo dice) y sin interruptor ni fusible.
- **FG y carcasa metálica:** el manual no dice si la carcasa metálica perforada está unida a FG; el desmontaje de una LRS-150-24 tampoco lo aclara ([teardown](https://steemit.steemapps.com/teardown/@teardownit/review-teardown-and-testing-of-lrs-150-24-mean-well-power-supply)). **Trátala como parte que puede estar a potencial de red si falla el aislamiento y mantenla alejada de otros conductores.**

### 4.3 Fijación y orientación

- La hoja da dos tipos de agujeros roscados M3: "L=3,0" y "L=5" (p. 4*). Un tornillo que penetre más de lo indicado puede tocar la placa. **No sé cuál es lateral y cuál inferior**: confírmalo en el dibujo (PDF oficial) antes de elegir tornillos. Hasta entonces, usa 3 mm como límite en todos. Un vendedor ([ProtoSupplies](https://protosupplies.com/product/meanwell-power-supply5v-10a-50w/), fuente secundaria) describe dos agujeros de paso accesibles desde arriba y casquillos M3 roscados en la base y en un lateral.
- Si la fuente se fija desde abajo atravesando el separador, la longitud útil del tornillo es el espesor de todo lo que hay entre la cabeza y la base de la fuente **más** la penetración máxima. Ejemplo (cálculo mío): chapa de 2,6 mm + arandela de 0,5 mm + 5 mm máx. = tornillo de ≤ 8 mm. Mide la penetración real antes de cerrar.
- **Orientación:** la guía la monta "tumbada". El manual dice que otras orientaciones pueden exigir reducir la corriente. La hoja que leí no indica cuál es la orientación de referencia del derating. **Sin verificar.**
- **Calor de los vecinos:** el manual pide 10-15 cm de separación a fuentes de calor. En la caja de arriba la cámara (0-50 °C según su ficha) queda delante de la fuente: ver [ficha de la cámara](../raspberry-pi-camera-module-3/README.md).

### 4.4 Calor y derating

- **Curva de la hoja (p. 3*):** carga en % (20-100) frente a temperatura ambiente (−30 a +70 °C), con curvas por tensión de entrada (de 85 a 264 VAC) y una marcada aparte para 5 V a 100 VAC. **No pude leer los puntos.** Faltan: temperatura a la que empieza a bajar y pendiente.
- **Dato secundario:** el pasaporte técnico de un distribuidor ruso (Varton) dice que las LRS-35/50/75/100 dan el 60 % de la potencia nominal a +70 °C, y para la temperatura a potencia nominal da valores de −30 a +40 °C o +50 °C (tabla desordenada, sin asignar). No es un documento de Mean Well. **Sin verificar.**
- **Calor propio (cálculo mío):** con η = 83 %, a 12 W de salida la fuente disipa ≈ 2,5 W y a 26 W de pico ≈ 5,3 W. A cargas bajas la eficiencia real será menor (la hoja no la da). En total, el calor que se queda en la caja es ≈ la potencia de entrada: ≈ 14 W típicos y ≈ 31 W en el pico.
- **Conclusión:** con un pico de 26 W (52 % de 50 W), incluso con el 60 % del dato ruso a 70 °C habría margen. Pero la temperatura real dentro de la caja es el dato que falta: **mídela cerrada, en el verano del bar, con la carga real**.

### 4.5 Cargas, picos y arranque

- **Pico de 5 A frente a la protección de sobrecarga:** el OCP salta entre el 110 y el 150 % de 50 W; a 5,2 V eso son ≈ 10,6-14,4 A (cálculo mío). Un pico de 5 A queda lejos.
- **Cargas capacitivas:** no encontré nota de aplicación de Mean Well. Cálculo mío: 1000 µF (el condensador opcional del sensor) cargados en los 30 ms de subida piden ≈ 0,17 A; irrelevante frente a 10 A. La hoja no da respuesta transitoria a escalones de carga (en lo que pude leer).
- **Arranque:** la tensión de salida tarda ≈ 1 s a 230 VAC (2 s a 115 VAC) en aparecer, a plena carga (H25). La Pi arrancará después.
- **Cortes de red:** el hold-up de 30 ms a 230 VAC es **a plena carga**; a tu carga (≈ 25 %) será mayor, pero la hoja no da ese valor. Un corte más largo apaga la Pi sin avisar. La raíz de solo lectura de la guía lo mitiga.

### 4.6 Compatibilidad electromagnética y corriente de fuga en bares

- **Emisión:** EN 55032 clase B (la de uso residencial, más exigente que la A), medida por Mean Well con una placa metálica ([declaración CE](#qué-dicen-los-más-relevantes)). La fuente es un componente: **el marcado CE de la máquina completa lo respondes tú** (nota 9 de la hoja; declaración CE).
- **Filtro de entrada:** el diagrama de bloques de la hoja (p. 3*) muestra un filtro EMI; sus valores no constan. Una teardown de otra serie (LRS-150-24) muestra filtro, varistor y puente; no es tu modelo.
- **Fuga:** < 0,75 mA a 240 VAC por fuente. Un diferencial de 30 mA (el habitual en circuitos de enchufes; dato general mío) no se acerca a ese valor con una máquina. Si se corta la tierra, esa corriente pasa por quien toque el chasis: otra razón para la prueba de continuidad de tierra de la guía §6.
- **Una pregunta que la hoja no responde:** si conviene unir −V a FG por inmunidad a descargas electrostáticas (la hoja solo da el ensayo salida-FG a 1,25 kVAC). No la he podido investigar; es de diseño del proyecto.

### 4.7 Norma de producto (EN 60335-2-82) y la fuente

- Según el resumen de [EVS](https://www.evs.ee/en/evs-en-iec-60335-2-82-2022), la norma cubre máquinas recreativas comerciales y de servicio personal, y debe usarse junto con la última EN 60335-1. Que la fuente cite EN 60335-1 ayuda, pero **no sustituye** el ensayo de la máquina completa.
- **Edición:** EVS lista la edición 2022 y su A1:2025 como **retiradas desde el 16-9-2026**, con una edición 2026 como la vigente. La guía (§9) cita la de 2022. Revísalo. EVS pone "None" en el campo de directivas o reglamentos de esta norma; no lo he contrastado con el Diario Oficial de la UE.
- **Qué exige la norma a la fuente** (distancias, protección contra contacto con partes vivas, conexión de tierra): no pude leerlo, está de pago. **Sin verificar.** Tampoco sé si un alcoholímetro de pago entra en "-2-82" o en la de máquinas expendedoras (EVS dice que esas van en IEC 60335-2-75).

## 5. Fallos, bugs y problemas conocidos

**Nota sobre la evidencia:** no encontré informes concretos de fallos de la LRS-50-5 en foros o reseñas. Mi presupuesto de búsquedas web se agotó antes de poder buscar en foros en alemán, polaco y español. Lo que sigue son datos de la hoja, del fabricante y de casos de otras series. Está marcado.

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | Falsificaciones y marcas parecidas | Alta si se compra mal |
| 2 | Bornes de 230 V al aire, tierra y contacto accidental | Alta (seguridad) |
| 3 | Margen de la tensión ajustada frente a los topes de las cargas | Media-alta |
| 4 | Temperatura dentro de la caja y orientación (curva ilegible) | Media-alta |
| 5 | Rizado fuera de especificación a carga baja (modo ráfaga) | Media |
| 6 | OVP sin recuperación automática; OCP en modo hiccup | Media |
| 7 | Arranque: 45 A, 1-2 s, reencendidos rápidos | Media |
| 8 | Ambiente del bar: humedad, líquidos, polvo, vibración | Media |
| 9 | Documentación inconsistente entre versiones y distribuidores | Baja-media |
| 10 | Disponibilidad y cadena de suministro | Baja-media |

### 5.1 Falsificaciones y marcas parecidas

- **Mean Well reconoce que hay falsificaciones.** Su página de comprobación de número de serie avisa de que hay productos Mean Well falsificados en el mercado y recomienda comprar a los distribuidores autorizados que figuran en su web. Esa página es una **comprobación del periodo de garantía**, no dice que verifique la autenticidad ([Mean Well, S/N Check](https://www.meanwell.com/serviceSN.aspx)). Una noticia de Mean Well titulada "No more counterfeit! MEAN WELL is determined to fight for the trademark and intellectual property" aparece en buscadores ([enlace](https://meanwell.com/newsInfo.aspx?c=4&i=909)) pero **hoy devuelve "página no encontrada"**.
- **Casos documentados (ninguno es una LRS-50-5):**
  - Mean Well Australia muestra un falso "LPV-200-12" (la serie LPV es de plástico, no existe de 200 W y el ejemplo era metálico) y dice que las falsificaciones mejoran con el tiempo, no tienen ensayos de seguridad, sus marcas de aprobación son falsas y por lo general fallan pronto ([blog](https://www.meanwellaustralia.com.au/blog/watch-out-for-fake-mean-well-power-supplies), sin fecha clara).
  - **Marca parecida "MIEG WAEI"**, con un "MS-120-24" que un cliente tomó por Mean Well; Mean Well dice que no usa esa marca y que ese número de pieza no existe (9-10-2020, [blog](https://www.meanwellaustralia.com.au/blog/mieg-waei-power-supplies-are-not-manufactured-mean-well)).
  - **Febrero de 2026:** Big Clive abrió una falsa DIN-rail de 12 V; el logotipo imita al de Mean Well y la etiqueta tiene inglés mal copiado. Por dentro tenía filtro, aislamiento y un condensador Y que parecía real, de modo que **una falsa puede ser decente por dentro; no es una señal fiable** ([Hackaday](https://hackaday.com/2026/02/16/inside-a-fake-mean-well-din-rail-psu/); resumen leído en la página de etiqueta, no el artículo entero; [vídeo](https://www.youtube.com/watch?v=pOb51Q718F8) no abierto).
  - Un hilo de EEVblog sobre una supuesta DIN de eBay: nadie la tuvo en la mano; consejos genéricos de comprar a distribuidor, desconfiar de fotos genéricas y de unidades sin las funciones que anuncian ([hilo](https://eevblog.com/forum/beginners/real-psu-or-a-fake/msg5585743)).
- **No he encontrado ninguna guía publicada que enseñe a distinguir una LRS-50-5 falsa de una original** (etiqueta, pesos, soldaduras, QR). Lo que sigue es mío:

**Qué comprobar al recibirla (mío, no es una guía del fabricante):**
1. **Etiqueta frente a la hoja:** modelo exacto "LRS-50-5", salida 5 V 10 A, entrada de rango universal, marcas de seguridad coherentes con la hoja (TÜV, UL, CE...). Compara con una unidad comprada a un distribuidor. Los logotipos de los falsos pueden ser buenos (caso de febrero de 2026).
2. **Número de serie:** que exista, sea legible y no esté repetido entre unidades del mismo pedido. Pregúntale al distribuidor o a Mean Well si pueden confirmarlo. La declaración CE v4 (2017) dice que vale "a partir del número de serie EB7xxxxxxx": no sé cómo codifica Mean Well sus series ni qué prefijo corresponde a una unidad de 2026, así que **no uses el prefijo para decidir**; pregunta cómo se lee.
3. **Peso:** la hoja dice 0,21 kg; RS y Berrybase, 230 g. Pesa con una báscula de cocina; una unidad claramente más ligera (por ejemplo, 50 g de menos) es sospechosa. El umbral es mío.
4. **Aspecto sin abrir:** carcasa de metal perforado, acabado, rótulos del borne (−V, +V, FG, L, N), potenciómetro y LED. **No abras la fuente**: el manual lo prohíbe y hay condensadores cargados.
5. **Pruebas eléctricas por un electricista:** continuidad de tierra y resistencia de aislamiento a 500 VDC (la hoja da 100 MΩ entre entrada, salida y FG a esa tensión). No hagas un ensayo de rigidez dieléctrica (los 4 kVAC y 2 kVAC de la hoja son ensayos de fábrica) ni pruebas con red sin experiencia.
6. **Factura y trazabilidad:** conserva la factura con el nombre del vendedor y el lote.

**Dónde comprar (lo que pude comprobar):**
- Mean Well recomienda **comprar a distribuidores de su lista oficial** ([S/N Check](https://www.meanwell.com/serviceSN.aspx), [blog Australia](https://www.meanwellaustralia.com.au/blog/mieg-waei-power-supplies-are-not-manufactured-mean-well)). **No pude obtener la lista oficial de distribuidores en España o en la UE** (la página que salió en español, "distributorsPath", es para captar distribuidores nuevos).
- Distribuidores grandes que venden la LRS-50-5 y cuya ficha leí o vi: [RS](https://uk.rs-online.com/web/p/switching-power-supplies/1065829), Farnell/element14 ([ficha](https://sg.element14.com/mean-well/lrs-50-5/power-supply-ac-dc-5v-10a/dp/2815996)), [Mouser](https://www.mouser.pl/mean-well-lrs-50-power-supplies), [Berrybase](https://www.berrybase.de/en/meanwell-1-channel-built-in-switching-power-supply-50w-5v-10a) (la persona responsable en la UE que indica es TME Germany), [Electrokit](https://www.electrokit.com/en/switchat-nataggregat-5v-10a-mean-well-lrs-50-5), [Elmark](https://elmark-automation.com/shop/mean-well/enclosed-power-supply-lrs-50) y [Digimax](https://www.digimax.it/en/product/LRS-50-5). **Que aparezcan no significa que sean "autorizados"**: confírmalo con Mean Well.
- **El ASIN B06XWRCWZ9: sin verificar.** No puedo ver quién lo vende. Un anuncio de Amazon con vendedor tercero no da trazabilidad. Referencias de precio del 21-10-2026 (cambian): Berrybase 17,70 € con IVA; Electrokit 169 SEK con IVA. Los 18,52 € de tu hoja están en ese rango, así que el precio por sí solo no delata nada.

### 5.2 Bornes de 230 V al aire, tierra y contacto accidental

- **No encontré ninguna cubierta de bornes** (ni integrada ni opcional) en la hoja, en el manual ni en las fichas de distribuidores. No sé si existe. **Sin verificar.** Berrybase advierte de que el módulo solo debe instalarse dentro de un equipo adecuado y aislado frente a las tensiones de contacto. Mean Well lo define como "solo uso profesional" (ficha copiada por Elmark).
- La carcasa es de chapa perforada: un conductor o un líquido puede entrar por los orificios. **No encontré distancias de aislamiento ni líneas de fuga en mm** hacia el chasis, ni en la hoja ni en el manual (apartado 3). Tampoco el valor de las normas, que están de pago.
- **Efecto práctico:** hay que cubrir los bornes en la máquina (tapa, funda o protección propia), asegurar que ningún cable de 5 V roce la carcasa, y que la fuente no quede al alcance del usuario con la caja abierta sin herramienta. Esto es mío.

### 5.3 Margen de tensión frente a los topes de las cargas

Ver [apartado 4.1](#41-ajuste-de-la-tensión-y-márgenes). Resumen: peor caso teórico ≈ 5,32 V con un ajuste de 5,20 V. Sin datos reales de tu unidad. La pantalla no tiene máximo publicado (la cifra de 5,25 V es de otra pantalla, según su ficha); el ZE29A admite 5,3 V.

### 5.4 Temperatura y orientación

Ver [apartado 4.4](#44-calor-y-derating). No hay curva legible. Dato de familia (otra serie): una LRS-150-24 al 90-95 % de carga alcanzó 93-110 °C en la carcasa y entró en limitación térmica cíclica ([teardown](https://steemit.steemapps.com/teardown/@teardownit/review-teardown-and-testing-of-lrs-150-24-mean-well-power-supply)). Tu LRS-50-5 trabajará al 25-50 %, pero no hay medidas de ese modelo. **La hoja no lista OTP**; el comportamiento en un exceso de temperatura no está documentado.

### 5.5 Rizado a carga baja (modo ráfaga)

- La nota 7 de la hoja (copia antigua sin fecha y versión de 2019): a 5 V con carga de 0 a 50 %, la pérdida de conmutación se reduce con modo ráfaga y eso hará que el rizado y el ruido superen la especificación. Sin cifra de cuánto. **No pude confirmar que la nota siga en la hoja de 2025** (la herramienta no devolvió el texto de las notas).
- **Tu carga típica (≈ 2,3 A) es el 23 %**, dentro de la zona de la nota. Una Pi a 5,2 V tolera bien algunos cientos de mV de rizado; **el ZE29A y la pantalla no publican tolerancia al rizado** (sus fichas). Mide el rizado en los bornes de las cargas con un osciloscopio a 20 MHz de ancho de banda.

### 5.6 OVP sin recuperación y OCP en hiccup

- **OVP:** si la salida supera el umbral (5,9 V; en lotes antiguos 5,75 V), la fuente **se apaga y no vuelve hasta apagar y encender la red** (H25). En un bar sin personal, la máquina quedaría muerta hasta que alguien la apague y la encienda. Es una posibilidad remota (la salida máxima ajustable es 5,5 V), pero no recuperarse sola es una característica a conocer.
- **OCP:** al superar el 110-150 % de la potencia, la fuente entra en *hiccup*: se apaga y reintenta cada poco, y se recupera sola al quitar la sobrecarga (H25). Ante un cortocircuito en un cable de 5 V, la fuente reintenta en ciclos en vez de mantener la corriente. [Mean Well Australia](https://www.power-supplies-australia.com.au/blog/mean-well-power-supply-hiccup-mode) explica el modo (genérico, no de la LRS) y avisa de que las especificaciones de sobrecarga cambian entre versiones.
- No encontré notas de Mean Well sobre arranque con cargas capacitivas o con sobrecorriente en el arranque para la LRS.

### 5.7 Arranque, reencendidos y pico de 45 A

- **Nota 6 de la hoja:** el tiempo de arranque se mide en el primer arranque en frío y encender y apagar muy rápido puede aumentarlo. Hay que dejar pasar unos segundos entre ciclos.
- **45 A es el valor típico en frío.** La hoja no da el pico en caliente. En una fuente con termistor NTC en la entrada (la hoja no dice si lo lleva), si se vuelve a enchufar antes de que se enfríe, el pico puede ser mayor que el de frío; esto es conocimiento general mío y no viene de Mean Well. El interruptor del C14 (6 A, 250 V según el anuncio) soporta ese pico durante milisegundos o no: no he visto datos del interruptor; es asunto de la ficha del C14.
- Los datos de arranque para el fusible están en el [apartado 6](#6-fusible-de-entrada-datos-de-la-fuente-y-cálculo).

### 5.8 Ambiente del bar

- La hoja da humedad de funcionamiento de 20 a 90 % HR **sin condensación**. En lo que leí, la hoja no da grado IP; las perforaciones dejan pasar polvo, grasa y salpicaduras. El manual dice no instalarla en lugares de mucha humedad ni cerca del agua. Ninguna de las copias que leí habla de barniz protector (*conformal coating*); **sin verificar**.
- El grado de contaminación 3 (PD3) que cita la ficha de producto corresponde a un ambiente más sucio que una oficina (dato general mío); la cifra es **secundaria** (Elmark).
- **Vibración:** 5 G, 10-500 Hz (H25). Suficiente para una máquina fija; los golpes bruscos no están especificados.
- **Líquidos desde arriba:** si la chapa de la caja tiene rejillas encima de la fuente, el líquido derramado puede caer sobre el bloque de bornes. Es una observación mía de diseño, no de las fuentes.

### 5.9 Documentación inconsistente

- La hoja cambia entre versiones (apartado 2): OVP (5,75-6,9 V en 2015-06; 5,9-7,3 V desde 2015-12), MTBF (645 K h hasta 2019; 3149,8 K y 561,6 K desde 2022), normas, EMC y, posiblemente, la longitud de tornillo.
- Los distribuidores contradicen la hoja: RS pone eficiencia del 91 % en una tabla y 89 % en el texto (la hoja dice 83 %); Electrokit y Berrybase dicen 0,21 kg / 230 g; Elmark escribe 2000 mV de rizado en el modelo de 36 V (parece una errata). **No uses las fichas de tiendas como especificación.**
- El **catálogo** dice altitud de 5000 m y OVP del 115-135 %; la hoja, 2000 m y 5,9-7,3 V (en 5 V).
- La declaración CE pública es de 2017 (apartado 3).

### 5.10 Disponibilidad y cadena de suministro

Ver [apartado 7](#7-alternativas-y-disponibilidad).

## 6. Fusible de entrada: datos de la fuente y cálculo

La ficha del fusible es aparte; aquí solo lo que aporta la fuente.

**Datos de la fuente (hoja 2025, p. 1-2*):**
- Corriente de entrada típica a plena carga: **0,56 A a 230 VAC** (0,95 A a 115 VAC).
- Pico de arranque: **45 A típ. a 230 VAC, arranque en frío**.
- Fusible interno: **no consta** (ni valor ni tipo). Fusible externo recomendado: **no consta** en la hoja ni en el manual de instalación. Los distribuidores tampoco lo dan.
- Resistencia mínima implícita: 325 V de pico / 45 A ≈ 7,2 Ω (cálculo mío).

**I²t del arranque (cálculo mío).** Para un pulso que cae exponencialmente, I²t ≈ ½ · Ipico² · τ (misma forma que usa la guía de Littelfuse en su tabla de formas de onda). Con Ipico = 45 A, τ = R·C y R ≈ 7,2 Ω:

| Condensador de entrada supuesto (**no consta**) | τ | I²t |
|---|---|---|
| 100 µF | 0,72 ms | ≈ 0,7 A²s |
| 220 µF | 1,6 ms | ≈ 1,6 A²s |

El valor de la guía (≈ 1,5 A²s) corresponde al extremo alto. El pico real será más corto si hay un NTC que se calienta. **El condensador real no lo sé.**

**Fusible T2,5A cerámico (Littelfuse 215, familia de referencia de la guía):** I²t de fusión nominal **22,29 A²s** (a 10 veces la corriente nominal), caída máx. 180 mV a 2,5 A, 250 V, norma IEC 60127-2 hoja 5 ([hoja](https://littelfuse.com/%7E/media/electronics/datasheets/fuses/littelfuse_fuse_215_datasheet.pdf.pdf)). Otros valores de la misma hoja: 2 A, 11,68 A²s; 3,15 A, 43,26 A²s. La guía (§2.7) da "22 A²s" para el T2,5A: **coincide**.

**Criterio de Littelfuse ([Fuseology, p. 3-5 y 8](https://info.littelfuse.com/hubfs/Fuseology%20Design%20Guide.pdf)):** para 100 000 pulsos, el I²t del pulso no debe pasar del **22 %** del I²t de fusión nominal (como pauta general, no más del 20 %); en régimen continuo, no más del 75 % de la corriente nominal.

| Comprobación | Resultado (cálculo mío) |
|---|---|
| T2,5A: 22 % de 22,29 = 4,9 A²s admisibles frente a 0,7-1,6 A²s | Cumple con margen (3 a 7 veces) |
| T2A: 22 % de 11,68 = 2,6 A²s admisibles frente a 0,7-1,6 A²s | Cumple; menos margen si el condensador es grande |
| Corriente continua con T2,5A: 75 % = 1,9 A frente a 0,56 A de la hoja y ≈ 0,1-0,15 A reales | Cumple de sobra |

**Lectura (mía, sin imponerla):**
- **No veo incoherencia** entre T2,5A y el arranque: aguanta los 45 A con margen.
- El T2,5A es ≈ 4,5 veces la corriente de entrada a plena carga de la hoja y ≈ 20 veces la real de tu máquina. Sirve para proteger **el cableado de 1,5 mm² y cortocircuitos en el primario**, no contra sobrecargas moderadas. Esas las limita el OCP de la propia fuente (hasta 150 % de 50 W: ≈ 0,85 A de entrada, estimación mía con un factor de potencia ≈ 0,47 deducido de la hoja: 60 W / (230 V × 0,56 A)).
- Un T2A o un T1,6A también serían compatibles con el arranque si el condensador de entrada no es grande; **no hay forma de saberlo sin abrir una fuente o preguntar a Mean Well**. Si quieres afinar, la pregunta concreta a Mean Well es: valor del fusible interno e I²t de arranque.
- Mean Well no exige ni desaconseja el fusible externo en lo que pude leer.

## 7. Alternativas y disponibilidad

**Estado del producto:**
- La LRS-50 sigue en catálogo: el catálogo industrial la lista (p. 4) y la hoja más reciente que leí es del **2025-04-07**. Angst+Pfister lista una hoja con código `...E-0925` (posible revisión de septiembre de 2025) y un manual de instalación con código `...E-0122`, pero sin enlace: **no los he podido leer**. RS UK la mostraba **en stock** el 21-10-2026 y sin aviso de fin de vida ([RS](https://uk.rs-online.com/web/p/switching-power-supplies/1065829)). Mean Well dijo en 2019 que la familia LRS había vendido más de 10 millones de unidades ([EE Power](https://eepower.com/new-industry-products/mean-well-announces-lrs-family-completed-ieculen62368-safety-upgrade)).
- **No encontré aviso de descatalogación ni sucesor oficial.** No pude abrir la página de producto de Mean Well, así que **no he mirado su estado oficial de ciclo de vida**.
- **Riesgo de suministro (agosto-octubre de 2026):** en el foro de Digi-Key, una respuesta atribuida a Digi-Key (27-8-2026) dice que, por la inclusión de Hunan Aihua Group (AiSHi) en la lista de entidades de la ley estadounidense UFLPA, **han detenido la venta de "select products" de proveedores afectados, entre ellos Mean Well, "until further notice"**, sin dar plazo. El hilo trata de la LRS-100-24, no de la LRS-50-5, y un participante aconseja cualificar una segunda fuente. Es una ley de EE. UU.; **no he comprobado que afecte al suministro en España/UE ni a la LRS-50-5** ([hilo](https://forum.digikey.com/t/availability-of-lrs-100-24/71596)).

**Alternativas oficiales (solo si hay motivo):**
- **Mean Well IRM-60-5** (5 V, 10 A, 50 W): encapsulada en silicona, **clase II (sin borne de tierra)**, 87 × 52 × 29,5 mm, montaje en PCB, EN/IEC 62368-1; eficiencia 84 %; −30 a +70 °C ([RS](https://uk.rs-online.com/web/p/switching-power-supplies/1358967), hoja [IRM-60](https://docs.rs-online.com/cd12/0900766b815c75ea.pdf), no abierta). Ventaja: sin bornes de 230 V al aire ni dependencia del cable de tierra de la fuente. Inconvenientes: se monta en una placa, no se sustituye tornillo a tornillo, y el listado de RS no cita EN 60335-1 (solo EN/IEC 62368-1).
- **Sin sustituto 1:1 que haya comprobado.** Otras LRS (LRS-35-5, LRS-75-5) comparten formato y bornes, pero cambian la potencia; no las he comparado.

## 8. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Comprar a un distribuidor con factura** y confirmar con Mean Well Europe (o con el distribuidor) que es de la lista oficial. Para el ASIN B06XWRCWZ9: antes de comprar, comprobar quién vende y envía; si no es Mean Well ni un distribuidor conocido, comprar a otro.
2. **Al recibirla:** comparar etiqueta con la hoja, anotar número de serie, pesar, comprobar sin red los bornes y el potenciómetro; que un electricista haga continuidad, aislamiento y fuga. Guardar fotos y factura por lote.
3. **Pedir por escrito a Mean Well o al distribuidor:** declaración CE vigente (la pública es de 2017 con normas antiguas), certificados CB/TÜV con los números, valor del fusible interno, I²t del arranque, el dibujo con las longitudes de tornillo lateral e inferior, la curva de derating con puntos, la distancia de aislamiento mínima al chasis y si el lote es posterior al cambio a EN 62368-1.
4. **Descargar y leer la hoja y el manual oficiales** (los enlaces del apartado 3) y contrastar contra esta ficha las cifras que no pude leer: OTP, longitud de tornillo, derating, nota 7.
5. **Ajuste:** no dar por hecho 5,20 V. Medir en los bornes de cada carga, con la máquina en caliente y a plena carga, y valorar 5,10-5,15 V si los máximos de la pantalla o el ZE29A se acercan al límite.
6. **Cubrir los bornes de 230 V** con una protección propia, dejar la tierra más larga y atornillar con el par del manual. Evitar rejillas directamente encima de la fuente (líquidos) y dejar 10-15 cm de los focos de calor si el espacio lo permite, o medir.
7. **Medir en una máquina cerrada:** temperatura de la carcasa de la fuente y del aire de la caja, rizado en las cargas (nota 7), corriente de red con un vatímetro.
8. **Plan para el OVP y los cortes:** explicar al dueño del bar que, si la máquina no arranca, debe apagar con el interruptor, esperar unos segundos y encender. Llevar una fuente de repuesto por lote.
9. **Segunda fuente:** si el volumen crece, valorar una alternativa de clase II como la IRM-60-5 (exige diseñar una placa de montaje) y tener una segunda fuente cualificada, dado el riesgo de suministro de Mean Well descrito arriba.
10. **Cumplimiento:** la máquina completa necesita su propia evaluación de seguridad y de EMC; esta fuente solo es un componente (nota 9). Confirmar con un laboratorio o asesor de marcado CE qué norma aplica (-2-82, -2-75 u otra) y qué edición.

## 9. Lo que no he podido verificar

- **Los dos PDF oficiales de Mean Well** (hoja y manual): permiso rechazado. Leídas copias. No he visto los dibujos, ni las curvas.
- **Números de página** de la hoja: deducidos (apartado "Cómo leer").
- **Curva de derating** con puntos, y orientación de referencia.
- **Asignación de las longitudes de tornillo** (3 y 5 mm) a lateral/inferior; posible L=4,5 en versiones antiguas.
- **OTP:** su ausencia la vi en el texto de tres copias (2015-06, 2022 y 2025); no vi el PDF oficial ni miré la de 2019 ni la de 2015-12.
- **Notas 1 a 9** de la hoja 2025: no se extrajeron. Las leí en la copia antigua de Rapid (notas 1 a 9) y en la de 2019 (notas 6 a 8).
- **Bornes:** sección máxima de conductor, longitud de pelado y si la carcasa metálica está unida a FG; si hay tapa de bornes.
- **Distancias de aislamiento y líneas de fuga** (mm) y los requisitos de EN 60335-1 / EN 60335-2-82 (normas de pago).
- **Fusible interno** (valor y tipo), tipo de NTC y condensador de entrada.
- **Eficiencia y rizado a carga parcial**, respuesta a escalones de carga y comportamiento en un exceso de temperatura.
- **Vida de los condensadores** (la hoja no la da) y vida útil continua a 24/7. El MTBF (3149,8 K h Telcordia; 561,6 K h MIL a 25 °C) es un cálculo estadístico, no una vida. Cálculo mío: 561,6 K h equivale a ≈ 1,6 % de fallos al año en servicio continuo (8760 h) y 3149,8 K h a ≈ 0,3 %, a 25 °C.
- **Certificados TÜV/CB:** números R50311822, R50313790 y R50313121 sin contrastar; no pude abrir los certificados.
- **Autenticidad de las unidades de B06XWRCWZ9**, vendedor y lote: Amazon bloquea el acceso.
- **Lista oficial de distribuidores de Mean Well en España y la UE.**
- **Informes de fallos concretos de la LRS-50-5** en foros: presupuesto de búsqueda agotado; no se buscó en alemán, polaco ni español.
- **Notas de aplicación de Mean Well** sobre cargas capacitivas o picos al encender y apagar seguido: no encontradas.
- **Estado de ciclo de vida oficial** en la web de Mean Well.
- **Revisiones más nuevas** que la hoja del 2025-04-07 (código `E-0925` de Angst+Pfister) y el manual `E-0122`: sin enlace, no leídos. De las dos copias del manual que leí, una no muestra fecha ni versión y la otra es de 2024.10.16.
- **Par de apriete de los bornes de la LRS-50:** M3,5 y 8-10 kgf·cm según una copia del manual; en la copia de 2024 la tabla salió desordenada.
- **Que el ASIN corresponda a la revisión de 2025** o a un lote anterior a octubre de 2019.

## 10. Fuentes

Todos los enlaces, ordenados por tipo y con la nota de los que no pude abrir, en [`enlaces.md`](enlaces.md).
