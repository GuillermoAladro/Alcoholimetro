# Arandelas dentadas M4 (200 uds.)

Arandelas de bloqueo dentadas M4 (lo habitual en catálogo es el tipo DIN 6797 A, de dientes exteriores; el anuncio no lo he visto y no sé cuál es) para las uniones de la puesta a tierra de 230 V. Van en el espárrago de tierra M4 × 20 soldado a la chapa de la carcasa: una bajo el ojal de tierra del C14 y otra bajo los ojales internos (fuente, panel, caja interior, cajón).

- **Compra:** ASIN B0B77J5FZS, 7,99 € por 200 uds. (precio de la hoja de componentes del 19-20-10-2026; unos 0,04 € por arandela, cuenta mía).
- **Es una pieza de la tierra de una máquina de 230 V.** Léela entera antes de montar. Si no tienes experiencia con red, que un electricista revise la tierra y la mida con corriente.

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta: **no he visto el anuncio B0B77J5FZS**. El precio, el ASIN y la cantidad son los de tu hoja. El anuncio puede no decir el material (zincado o inoxidable), la norma ni las cotas, y yo no lo sé. Esta pieza **no tiene ficha del fabricante**: lo que sigue se apoya en catálogos de arandelas DIN 6797 comparables (Bossard, Duratool/Farnell, RS PRO, ehorst), en guías de montaje de tierra de fabricantes de equipos y en fuentes de par y gripado. Las normas están de pago y no las he leído. Mi presupuesto de búsquedas web se agotó con huecos abiertos; están en el apartado 11.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales y normas](#3-documentos-oficiales-y-normas)
4. [Qué hace en una tierra y en qué orden se monta](#4-qué-hace-en-una-tierra-y-en-qué-orden-se-monta)
5. [Montaje: par, gripado, corrosión y cantidad](#5-montaje-par-gripado-corrosión-y-cantidad)
6. [Fallos, bugs y problemas conocidos](#6-fallos-bugs-y-problemas-conocidos)
7. [Qué comprobar al recibir el pack](#7-qué-comprobar-al-recibir-el-pack)
8. [Alternativas y disponibilidad](#8-alternativas-y-disponibilidad)
9. [Discrepancias con la guía y con las cifras de partida](#9-discrepancias-con-la-guía-y-con-las-cifras-de-partida)
10. [Recomendaciones para el alcoholímetro](#10-recomendaciones-para-el-alcoholímetro)
11. [Lo que no he podido verificar](#11-lo-que-no-he-podido-verificar)
12. [Fuentes](#12-fuentes)

---

## 1. Resumen para el proyecto

- **Está en el camino de la tierra de la máquina. La arandela no garantiza la tierra: la garantiza la medida.** Si la unión queda con resistencia alta, un fallo de aislamiento puede dejar el chasis con tensión. El ensayo de rutina de EN 50106 (para aparatos de EN 60335-1) pasa al menos 10 A desde una fuente de 12 V o menos y limita la resistencia a 0,1 Ω ([resumen de CYS EN 50106:2008](https://std-ol.cys.org.cy/safety-of-household-and-similar-electrical-appliances-particular-rules-for-routine-tests-referring-to-appliances-under-the-scope-of-en-60335-1)). La guía del IET usa hasta 25 A ([IET](https://electrical.theiet.org/media/1658/in-service-inspection-and-testing-of-electrical-equipment-the-earth-continuity-test.pdf)). Mide así cada pieza metálica (apartado 4.6).
- **Qué hace:** los dientes muerden la superficie y rompen óxido o restos de pintura, y dan contactos metal con metal puntuales. Así lo dicen [Wikipedia](https://en.wikipedia.org/wiki/Washer_(hardware)) y fabricantes de arandelas "perforadoras de pintura" ([Panduit](https://www.mouser.com/datasheet/2/319/RGW-100-1Y%20Product%20Page-225273.pdf), [Schneider](https://www.se.com/us/en/faqs/FA368289/)). **Qué no hace:** no sustituye el par de apriete ni la contratuerca. Nord-Lock le da 1 sobre 5 como bloqueo ([Nord-Lock](https://www.nord-lock.com/insights/knowledge/2020/how-effective-is-tooth-lock-washer/)) y dice que, si la unión pierde tensión, la arandela deja de valer y hay que cambiarla ([Nord-Lock, serrated](https://www.nord-lock.com/insights/knowledge/2020/how-effective-is-serrated-lock-washer/)).
- **El orden de la guía (chapa → arandela → ojal → tuerca) es una práctica real, pero no la única y ninguna norma abierta por mí lo fija.** IBM monta así ([IBM Docs](https://www.ibm.com/docs/TI0002C/p8hbf/withoutac.htm)). Beckhoff y Hammond ponen el ojal directo sobre metal limpio y el elemento de bloqueo del lado de la tuerca ([Beckhoff](https://infosys.beckhoff.com/content/1031/as2000/6287664651.html), [Hammond](https://www.hammfg.com/files/parts/bulletins/BUL86513.pdf)). Hay que decidir con la medida (apartado 4.3).
- **Material desconocido y es lo que más importa al recibirlas.** Estas arandelas se venden en acero de muelle zincado (350-425 HV según [Bossard](https://www.bossard.com/eshop/kr-ko/serrated-lock-washers-toothed-lock-washers/toothed-lock-washers-type-a-external-teeth/p/789) y [Duratool](https://www.farnell.com/cad/2337766.pdf)) y en inoxidable 1.4310 ([ehorst](https://www.ehorst.de/en/Zahnscheibe-DIN-6797-A2-A-4-3-aussengezahnt-Edelstahl-1058430.html)). Un pack barato de 200 puede ser cualquiera de las dos. Cotas M4 de DIN 6797 A: Ø interior 4,3 mm, Ø exterior 8 mm, espesor 0,5 mm. **La dureza no es 400-500 HV** como se planteaba: las dos hojas que he leído dicen 350-425 HV.
- **Par y gripado:** para un tornillo M4 A2-70, las tablas dan un máximo de 1,7 a 3,3 N·m según el rozamiento, y el par de rotura mínimo es 3,8 N·m ([Optimas](https://optimas.com/technical-resources/stainless-steel-fasteners-pre-load-and-tightening-torques/), [Pfeiffer Vacuum](https://www.pfeiffer-vacuum.com/global/de/knowledge/vacuum-technology/mechanical-components-in-vacuum/connections)). El límite real lo pondrá el espárrago soldado (#25), no el tornillo. Inoxidable sobre inoxidable se gripa ([TWI](https://www.twi-global.com/technical-knowledge/faqs/what-is-galling)): afecta a las tuercas (#26), no a la arandela.
- **Cantidad:** la guía usa **2 arandelas por máquina** (una por nivel de la pila, §6 pasos 2 y 3) y hasta 4 si pones una también bajo cada tuerca. Con 200 salen entre 50 y 100 máquinas. No hay otro uso en la guía. Cambia la arandela cada vez que abras la unión.

## 2. Especificaciones

### 2.1 Lo que dice tu hoja y tu guía (anuncio no visto)

| Característica | Valor | Fuente |
|---|---|---|
| Pieza | "Arandelas dentadas M4 (200 uds.)" | Hoja de compra #24, guía §1 |
| Precio | 7,99 € | Hoja de compra |
| Tipo, norma, material, acabado, cotas | **No constan** en la hoja ni en la guía | — |
| Uso | Espárrago M4 × 20 soldado, "lijar la pintura hasta el metal"; una arandela bajo el ojal del C14 y otra para los ojales internos | Guía §5.1 y §6 |

### 2.2 Cotas de una arandela dentada exterior DIN 6797 A, tamaño M4 (4,3)

| Cota | Valor | Fuente |
|---|---|---|
| Ø interior d1 | 4,3 mm mín. · con tolerancia: 4,30-4,48 mm | [Bossard BN 787](https://extranet.mandieselturbo.com/electronics/datasheets/Bossard/BN787/BN_787.pdf) · [Duratool, Farnell](https://www.farnell.com/cad/2337766.pdf) |
| Ø exterior d2 | 8 mm máx. · con tolerancia: 7,64-8,00 mm | Mismas fuentes |
| Espesor s | 0,5 mm (la hoja de Duratool no da tolerancia) | Mismas fuentes |
| Nº de dientes | **Sin verificar para M4.** Duratool da un mínimo de 6 (M3) y de 8 (M5); la fila de M4 no quedó clara en el texto que pude extraer. Bossard no lo indica | Duratool, Bossard |
| Mismas cotas en | RS PRO 276-869 (DIN 6797 A), RS PRO 287-4187 (DIN 6798 A, bolsa de 500) y RS PRO 526-596 (DIN 6797 J, dientes interiores): 4,3 / 8 / 0,5 mm | [RS 276-869](https://es.rs-online.com/web/p/arandelas/0276869), [RS 287-4187](https://pt.rs-online.com/web/p/arandelas/2874187), [RS 526-596](https://es.rs-online.com/web/p/products/526596) |

El espárrago M4 tiene 4 mm de diámetro exterior de rosca, así que el agujero de 4,3 mm deja holgura. Los ojales M4 de la hoja (#23) tienen que ser de agujero de 4,3 mm o más (cuenta mía; ficha del #23 pendiente).

### 2.3 Tipos y normas

| Denominación | Qué es | Fuente |
|---|---|---|
| DIN 6797 A | Dientes exteriores. La que mejor retiene, por la mayor circunferencia. **Es la que cubre tu uso.** | [Wikipedia](https://en.wikipedia.org/wiki/Washer_(hardware)), [RS guía](https://docs.rs-online.com/3d85/0900766b816b073d.pdf) |
| DIN 6797 J | Dientes interiores. Más estética, según Wikipedia. Los dientes quedan bajo el ojal | Wikipedia, RS guía |
| DIN 6797 V | Forma para tornillos de cabeza avellanada. La letra V la recuerdo de memoria; Wikipedia describe el tipo "countersunk" sin letra. **No aplica a este uso.** No es "de tazón" | Wikipedia (sin verificar la letra) |
| DIN 6798 A / J | Familia "serrated" en el catálogo de RS (la J figura como "internal serrated" y la A como "external tooth"). Mismas cotas M4 que la 6797 A en RS. **No he verificado en qué se diferencia de la 6797** (número de dientes, forma) | [RS guía](https://docs.rs-online.com/3d85/0900766b816b073d.pdf), [RS 287-4187](https://pt.rs-online.com/web/p/arandelas/2874187) |
| ASME B18.21.1 | Norma americana (pulgadas) de arandelas dentadas interiores, exteriores, combinadas y avellanadas | Wikipedia |
| ISO 7089 / 7090 | **Son arandelas planas**, no dentadas | Wikipedia |
| ISO 10673 | **Sin verificar.** De memoria es una norma de arandelas planas para conjuntos tornillo-arandela; no he encontrado una fuente que la relacione con arandelas dentadas | — |

**Estado de DIN 6797:** Bossard marca el DIN 6797 A como "Standard withdrawn" (retirada) en sus fichas BN 787 y BN 789, con equivalencias UNI 8841 A y ČSN 021744. No he encontrado qué norma la sustituye, si hay alguna. No he encontrado una norma ISO de arandelas dentadas. En la práctica sigue vendiéndose con la designación DIN 6797 y los catálogos de RS, Farnell y ehorst la usan.

### 2.4 Material, dureza y acabado

| Variante | Referencia | Dureza | Fuente |
|---|---|---|---|
| Acero de muelle, negra | Bossard BN 787 | 350-425 HV | [Bossard](https://extranet.mandieselturbo.com/electronics/datasheets/Bossard/BN787/BN_787.pdf) |
| Acero de muelle, zincada azul | Bossard BN 789 | 350-425 HV | [Bossard](https://www.bossard.com/eshop/kr-ko/serrated-lock-washers-toothed-lock-washers/toothed-lock-washers-type-a-external-teeth/p/789) |
| Acero de muelle, zincada TC1D (zinc comercial con pasivado trivalente transparente, desfragilizada) | Duratool DM4 | 350-425 HV10 | [Farnell](https://www.farnell.com/cad/2337766.pdf) |
| Acero de muelle, zincada | ehorst 1057473 | No indicada | [ehorst](https://www.ehorst.de/en/Zahnscheibe-DIN-6797-A-4-verzinkt-aussengezahnt-1057473.html) |
| Inoxidable "A2", acero 1.4310 | ehorst 1058430 (DIN-6797-A2) | No indicada | [ehorst](https://www.ehorst.de/en/Zahnscheibe-DIN-6797-A2-A-4-3-aussengezahnt-Edelstahl-1058430.html) |

Notas:

- **"A2" confunde.** RS PRO 276-869 y 526-596 aparecen como acero, grado A2, con zinc brillante ([RS](https://es.rs-online.com/web/p/arandelas/0276869)). Es contradictorio: A2 es el nombre del inoxidable. Un anuncio que diga "A2" no prueba que sea inoxidable.
- **Zincado:** la guía de selección de RS lo describe como de resistencia a la corrosión moderada, adecuado para uso interior en ambiente seco ([RS guía](https://docs.rs-online.com/3d85/0900766b816b073d.pdf), p. 4).
- **Hidrógeno:** Bossard avisa de que las piezas de acero galvanizadas de 360 HV o más y sometidas a tracción pueden romper por fragilización por hidrógeno y de que el horneado no lo elimina del todo ([Bossard, notas de uso](https://www.bossard.com/global-en/knowledge-hub/resources/notes-on-use/)). Una arandela trabaja casi a compresión, así que el riesgo me parece bajo (mío).

## 3. Documentos oficiales y normas

No hay documentos del fabricante de tu pack. Lo que hay son hojas de arandelas DIN 6797 comparables, guías de fabricantes de equipos y resúmenes de normas.

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Bossard BN 787, DIN 6797 A negra | Listado de tienda, 28-04-2017 | PDF | [extranet.mandieselturbo.com](https://extranet.mandieselturbo.com/electronics/datasheets/Bossard/BN787/BN_787.pdf) |
| Bossard BN 789, DIN 6797 A zincada | Ficha web (cotas en imagen) | Web | [bossard.com](https://www.bossard.com/eshop/kr-ko/serrated-lock-washers-toothed-lock-washers/toothed-lock-washers-type-a-external-teeth/p/789) |
| Duratool (Premier Farnell), DIN 6797A | Hoja v1.1, 21-07-2017 | PDF | [farnell.com](https://www.farnell.com/cad/2337766.pdf) |
| RS PRO, DIN 6797A (276-869) | Hoja | PDF | [docs.rs-online.com](https://docs.rs-online.com/42ad/A700000006887825.pdf) |
| RS PRO, DIN 6798A (287-4187) | Hoja | PDF | [docs.rs-online.com](https://docs.rs-online.com/5395/A700000011338889.pdf) |
| RS PRO, DIN 6797J (526-596) | Hoja (solo una línea de descripción) | PDF | [docs.rs-online.com](https://docs.rs-online.com/45a8/0900766b8157f74c.pdf) |
| RS, guía de selección de fijaciones | 56 pp. | PDF | [docs.rs-online.com](https://docs.rs-online.com/3d85/0900766b816b073d.pdf) |
| Bossard, notas de uso | Web | Web | [bossard.com](https://www.bossard.com/global-en/knowledge-hub/resources/notes-on-use/) |
| Nord-Lock: arandelas dentadas, "serrated" y prueba Junker | Web | Web | [tooth](https://www.nord-lock.com/insights/knowledge/2020/how-effective-is-tooth-lock-washer/) · [serrated](https://www.nord-lock.com/insights/knowledge/2020/how-effective-is-serrated-lock-washer/) · [Junker](https://www.nord-lock.com/link/8bc1485d52684ff68b4ca5366646fa8d.aspx) |
| Beckhoff, conexión de la tierra de protección | AS2000 | Web | [infosys.beckhoff.com](https://infosys.beckhoff.com/content/1031/as2000/6287664651.html) |
| Hammond, kit de tierra | BUL86513 | PDF | [hammfg.com](https://www.hammfg.com/files/parts/bulletins/BUL86513.pdf) |
| Gigamon, conexiones de hardware | HW-G-TAP-A-2 | Web | [docs.gigamon.com](https://docs.gigamon.com/doclib610/Content/HW-G-TAP-A-2/Connections.html) |
| IBM Docs, placa de enchufes | TI0002C | Web | [ibm.com](https://www.ibm.com/docs/TI0002C/p8hbf/withoutac.htm) |
| Panduit, kit de arandelas perforadoras de pintura | RGW-100-1Y | PDF | [mouser.com](https://www.mouser.com/datasheet/2/319/RGW-100-1Y%20Product%20Page-225273.pdf) |
| Schneider, continuidad de tierra del Masterpact | FA368289 | Web | [se.com](https://www.se.com/us/en/faqs/FA368289/) |
| Resumen de CYS EN 50106:2008 | Ensayos de rutina EN 60335-1 | Web | [std-ol.cys.org.cy](https://std-ol.cys.org.cy/safety-of-household-and-similar-electrical-appliances-particular-rules-for-routine-tests-referring-to-appliances-under-the-scope-of-en-60335-1) |
| 601help, tierra según IEC 60601-1 cl. 8.6 (comentario, no norma) | — | Web | [601help.com](https://601help.com/Requirements/earthing.html) |
| IET, ensayo de continuidad de tierra | — | PDF | [electrical.theiet.org](https://electrical.theiet.org/media/1658/in-service-inspection-and-testing-of-electrical-equipment-the-earth-continuity-test.pdf) |
| Pares de apriete de tornillería inoxidable | Optimas, Pfeiffer, Accu | Web | [Optimas](https://optimas.com/technical-resources/stainless-steel-fasteners-pre-load-and-tightening-torques/) · [Pfeiffer](https://www.pfeiffer-vacuum.com/global/de/knowledge/vacuum-technology/mechanical-components-in-vacuum/connections) · [Accu](https://accu-components.com/de/p/387-verbindungselemente-aus-edelstahl-empfohlene-anzugsdrehmomente) |
| Gripado | TWI, Bolt Depot | Web | [TWI](https://www.twi-global.com/technical-knowledge/faqs/what-is-galling) · [Bolt Depot](https://boltdepot.com/fastener-information/Materials-and-Grades/Thread-galling) |
| Corrosión galvánica | Fastenal, ARRL, Engineers Edge | PDF y web | [Fastenal](https://crafter.fastenal.com/static-assets/pdfs/Corrosion_rev_2017-02-21.pdf) · [ARRL](https://www.arrl.org/galvanic-corrosion) · [Engineers Edge](https://engineersedge.com/hardware/fastener_material_galvanic_13354.htm) |

### Qué dicen los más relevantes

- **Normas de aparato (EN 60335-1, EN IEC 60335-2-82).** No he podido leer ninguna cláusula. **Sin verificar:** la cláusula 27 de EN 60335-1 trata de la puesta a tierra (lo recuerdo de memoria). También de memoria, el bloqueo del borne contra aflojamiento estaría en 27.2 y la baja resistencia de la conexión (0,1 Ω con una corriente de ensayo de 25 A o 1,5 veces la nominal) en 27.5. **La cláusula "27.3" que se citaba al encargar esta ficha no la puedo confirmar ni asignar a un tema.** Quien haga el expediente de la máquina tiene que leer la cláusula 27 en la edición vigente.
- **Resumen de EN 50106:2008.** El ensayo de continuidad de tierra de rutina pasa al menos 10 A desde una fuente de 12 V o menos entre cada pieza metálica accesible a tierra y el punto de tierra (borne, clavija, contacto o pin de tierra de la entrada del aparato) y calcula la resistencia con la caída de tensión. El límite es 0,1 Ω en aparatos sin cable y, con cable de alimentación, 0,2 Ω o 0,1 Ω más la resistencia del cable. La tienda lo redacta de forma ambigua y no da cláusulas: **confírmalo en la norma**. Es coherente con tu "0,1 Ω desde el pin de tierra del C14".
- **IEC 60601-1 (medicina, no aplica a este proyecto).** 601help resume la cláusula 8.6: 0,1 Ω entre las partes a tierra y el contacto de tierra de la entrada del aparato, ensayo con 25 A o 1,5 veces la corriente nominal si es mayor, el cable de tierra del cordón en el fondo del espárrago con su propia tuerca, el resto de partes en el mismo espárrago con otra tuerca, y el espárrago solo para tierra y sin poder aflojarse desde fuera. Es un comentario de una web de ayuda, no la norma. Aun así describe casi tal cual el montaje de tu guía.
- **IEC 61439-1 (conjuntos de aparamenta, no es la norma de esta máquina).** El FAQ de Schneider cita la cláusula 8.4.3.2.2: todas las partes conductoras accesibles se interconectan y se unen al conductor de protección, y se admiten uniones atornilladas metálicas, soldadura u otras uniones conductoras. Sus propios tornillos de unión llevan "arandelas con garras que rascan la pintura" ([Schneider](https://www.se.com/us/en/faqs/FA368289/)). No he leído la cláusula.
- **UL 467 (equipo de puesta a tierra).** **No he podido abrir la norma ni encontrar una fuente que diga que "exige arandelas dentadas o contacto con metal desnudo".** La página de UL 508A que revisé no menciona UL 467 ([industrialmonitordirect](https://industrialmonitordirect.com/blogs/knowledgebase/ul-508a-panel-grounding-ground-bars-vs-din-rail-terminals)). Esa página (un blog, no la norma) dice que el punto de unión debe ser metal desnudo y que se usa arandela dentada o tornillo autorroscante para cortar el óxido residual (práctica que atribuye a un experto de Rockwell, sin cláusula). Gigamon dice que los recubrimientos no conductores deben retirarse de las roscas y otras superficies de contacto ([Gigamon](https://docs.gigamon.com/doclib610/Content/HW-G-TAP-A-2/Connections.html)). Esa redacción me suena a NEC 250.12, pero Gigamon no cita la norma: **sin verificar**.

## 4. Qué hace en una tierra y en qué orden se monta

### 4.1 Función real

1. **Rompe óxido y capas finas.** Los dientes muerden la chapa y el ojal. [Wikipedia](https://en.wikipedia.org/wiki/Washer_(hardware)) (frase sin cita) dice que las arandelas dentadas se usan para unir a tierra, que los dientes cortan óxidos y pinturas y que, **para este uso, la arandela no va bajo la cabeza o la tuerca sino entre las superficies a unir**.
2. **No sustituye lijar en los equipos que he leído.** Beckhoff ("auf unlackierte Fläche auflegen"), Hammond (dice que su terminal no pone a tierra el armario si no se quita la pintura exterior o se instalan hilos de tierra) y Gigamon (limpiar y dar antioxidante) piden quitar la pintura. Panduit y Schneider usan arandelas que la perforan para no tener que rascarla, pero son de M8 o de rack (apartado 4.2). La guía ya pide lijar.
3. **Frena algo el giro, no es un seguro.** Nord-Lock valora las "tooth lock washers" con 1 sobre 5 en bloqueo y dice que funcionan mejor con superficies blandas, porque las duras aplastan los dientes ([Nord-Lock](https://www.nord-lock.com/insights/knowledge/2020/how-effective-is-tooth-lock-washer/)). A las "serrated lock washers" les da 3 sobre 5 en otra página ([Nord-Lock](https://www.nord-lock.com/insights/knowledge/2020/how-effective-is-serrated-lock-washer/)); no explican la diferencia y no sé a qué modelos se refiere cada nombre. Son valoraciones de un fabricante de arandelas de cuña, sin cifras de ensayo en esas páginas. La prueba Junker (DIN 65151 / ISO 16130, "la más severa" según Nord-Lock) compara en su página arandelas planas, elásticas, tuercas de seguridad, doble tuerca y arandelas Nord-Lock. **No incluye arandelas dentadas ni da números** ([Nord-Lock](https://www.nord-lock.com/link/8bc1485d52684ff68b4ca5366646fa8d.aspx)). No he encontrado un ensayo independiente de arandelas dentadas M4.
4. **Puede dañar la pintura.** Las arandelas "serrated" de una pieza giran con el tornillo y pueden agrietar la pintura o el recubrimiento, con corrosión después ([Nord-Lock](https://www.nord-lock.com/insights/knowledge/2020/how-effective-is-serrated-lock-washer/)). En tu caso la pintura se quita de todos modos.

### 4.2 Qué ponen otros fabricantes y en qué orden

| Fuente | Tipo | Entre la chapa y el ojal | Del lado de la tuerca | Observación |
|---|---|---|---|---|
| [IBM Docs](https://www.ibm.com/docs/TI0002C/p8hbf/withoutac.htm) | Fabricante de equipo | Arandela dentada sobre el espárrago de tierra, luego el ojal | Tuerca | Igual que tu guía. Sin par ni pintura |
| [Wikipedia](https://en.wikipedia.org/wiki/Washer_(hardware)) | Secundaria, sin cita | Arandela entre las superficies a unir | No bajo la tuerca | Solo para unión a tierra |
| [Panduit RGW-100-1Y](https://www.mouser.com/datasheet/2/319/RGW-100-1Y%20Product%20Page-225273.pdf) | Fabricante de accesorios | Arandela perforadora de pintura, para unir sin tener que rascar la pintura | — | Para espárragos de 3/8" (M8), Ø exterior 22,2 mm, uniones de bastidores. Trae 5 cc de antioxidante |
| [Schneider FA368289](https://www.se.com/us/en/faqs/FA368289/) | Fabricante de aparamenta | Tornillos de unión con arandelas con garras | — | M8, clase 8,8, cita IEC 61439-1 8.4.3.2.2 |
| [Beckhoff AS2000](https://infosys.beckhoff.com/content/1031/as2000/6287664651.html) | Fabricante de equipo | **Nada**: ojal sobre superficie sin pintar | Arandela plana y arandela elástica bajo la cabeza | M4, clase 8,8, 3 Nm |
| [Hammond BUL86513](https://www.hammfg.com/files/parts/bulletins/BUL86513.pdf) | Fabricante de armarios | Terminal contra la pared, sin pintura | Arandela de bloqueo interior y tuerca | Mínimo 50 in·lbf (5,6 N·m), para su espárrago de 3/8" |
| [Gigamon](https://docs.gigamon.com/doclib610/Content/HW-G-TAP-A-2/Connections.html) | Fabricante de equipo | Superficie limpia con antioxidante | Dispositivos antigiro como arandelas de bloqueo | Tornillo de tierra M4; par de 5 in·lb para la pala |
| [601help](https://601help.com/Requirements/earthing.html) | Comentario sobre IEC 60601-1 | — | Arandela dentada o de bloqueo y tuerca | Cable del cordón en el fondo, el resto con otra tuerca |
| [eng-tips](https://www.eng-tips.com/viewthread.cfm?qid=276803) | Foro (opinión) | Uno propone metal base, arandela (tipo no indicado), ojal, arandela de bloqueo, tuerca. Otro prefiere ojal directo sobre el metal base | Arandela plana y de bloqueo, tuerca | Aviso de ese segundo participante: la arandela de bloqueo no debe clavarse en las caras del terminal. Limpia el metal base con estropajo y aplica grasa eléctrica "no-ox-id" |
| [mikrocontroller.net](https://www.mikrocontroller.net/topic/480762) | Foro (opinión) | Chapa lijada, arandela dentada, ojal | — | Un participante dice que las arandelas perforadoras pueden ahorrar algo de lijado |

**Lectura (mía):** no hay una forma única. Las fuentes que mandan en el equipo (IBM, Panduit, Schneider) y la de la guía dejan la arandela entre la chapa y el ojal. Las que cuidan el contacto plano (Beckhoff, Hammond, Gigamon) ponen el ojal sobre metal limpio y el bloqueo arriba. **Ninguna que haya podido leer es una norma que fije el orden.**

### 4.3 Tres montajes posibles y cuál elegir (mío)

| Montaje | Camino de la corriente | A favor | En contra |
|---|---|---|---|
| **A. Guía:** chapa → arandela → ojal → tuerca | Chapa → dientes → arandela → dientes → ojal. El ojal no toca la chapa | Los dientes rompen el óxido que se forme tras lijar. Contactos puntuales y a presión | Solo hay contacto en los dientes. Si la chapa es dura, se aplastan. Todo el bloqueo lo hace la contratuerca |
| **B.** chapa → ojal → arandela → tuerca | Contacto plano entre ojal y chapa limpia | Contacto de mucha superficie, como Beckhoff y Hammond. La arandela sobre el ojal muerde ojal y tuerca | Una chapa lijada se oxida sin protección. No hay dientes que atraviesen el óxido bajo el ojal |
| **C.** chapa → arandela → ojal → arandela → tuerca | Como A | Las dos funciones | Los dientes marcan las dos caras del ojal de cobre estañado. En un foro se avisa de que una arandela no debe clavarse en las caras del terminal. Suma 0,5 mm |

**Mi criterio:** con la chapa lijada hasta el metal y la contratuerca de la guía, **A es razonable y sigue una práctica documentada (IBM)**. Pero eso no se puede decidir sobre el papel. Haz la medida de continuidad con ≥ 10 A (apartado 4.6) con tu montaje A y repítela tras unos días de funcionamiento y tras abrir y cerrar la unión. Si sale por encima de 0,1 Ω o se mueve, prueba B o C. Si la chapa no se lija bien, A no se salva por sí sola.

### 4.4 Qué pasa si el ojal queda entre dos arandelas dentadas

Es el montaje C. Lo que dicen las fuentes:

- Nord-Lock: las arandelas dentadas muerden las superficies de contacto al apretar; si la unión pierde tensión, dejan de servir ([Nord-Lock](https://www.nord-lock.com/insights/knowledge/2020/how-effective-is-serrated-lock-washer/)).
- El único aviso que he visto sobre apretar un ojal entre dos arandelas es una opinión de foro, no una norma: la arandela de bloqueo no debe clavarse en las caras del terminal ([eng-tips](https://www.eng-tips.com/viewthread.cfm?qid=276803)).

**Mío:** (1) el ojal de cobre estañado es blando frente a una arandela de 350-425 HV, así que los dientes lo marcarán por las dos caras; (2) más puntos de contacto, pero también más espesor de unión que se relaja con el tiempo; (3) tras aflojar y volver a apretar, los dientes no caen en las mismas marcas. Para tu máquina, C solo tiene sentido si la prueba de vibración o de apriete muestra que A no basta. Es una decisión de ensayo, no de norma.

### 4.5 La lógica de los dos ojales apilados ("si sueltas un cable interno no se pierde la tierra de entrada")

La guía monta dos niveles en el mismo espárrago:

```
 Nivel 2:   tuerca  /  ojales internos (fuente, panel, caja interior, cajón)  /  arandela 2
 Nivel 1:   contratuerca  /  tuerca  /  ojal del C14  /  arandela 1  /  chapa
```

- **Mecánicamente es correcto.** Al aflojar la tuerca del nivel 2 no se suelta el ojal del C14, que sigue apretado por su tuerca y su contratuerca. La disposición coincide con lo que describe 601help para IEC 60601-1: el cable de tierra del cordón en el fondo con su propia tuerca, el resto en el mismo espárrago con otra tuerca, y el espárrago solo para tierra ([601help](https://601help.com/Requirements/earthing.html)). Un participante de foro añade que un espárrago soldado por dentro no se puede aflojar desde fuera ([mikrocontroller.net](https://www.mikrocontroller.net/topic/480762)).
- **Mío, lo que no cubre la frase de la guía:**
  1. **Un solo punto común.** Los cinco conductores de tierra pasan por un espárrago y una soldadura. Si la soldadura se parte, se pierde todo a la vez. Por eso hay que medir cada pieza desde el pin del C14 y tirar del espárrago como prueba mecánica antes de cablear (la ficha del #25 debería decir qué par aguanta).
  2. **El nivel 2 apoya sobre el nivel 1.** Su corriente va por la rosca del espárrago o por la arandela 2, la contratuerca y la tuerca 1. Si alguien afloja la tuerca 1 o la contratuerca, se suelta el ojal del C14 **y** el nivel 2 queda sin su apoyo. Marca esas dos tuercas con una raya de pintura y un rótulo ("no aflojar").
  3. **Cuatro ojales más la arandela en un nivel.** No he encontrado una fuente sobre cuántos ojales admite un solo borne ni sobre el relajamiento de una pila de cobre blando. Pregúntaselo a quien revise la máquina.
  4. **La arandela 2 hay que cambiarla** cada vez que se abra el nivel 2 (apartado 6).

### 4.6 Medida

La guía pide ≤ 0,1 Ω desde el pin de tierra del C14 hasta cada pieza metálica, con un polímetro como primera comprobación y un comprobador que inyecte 10-25 A como medida buena (§6). Es coherente con las fuentes: EN 50106 (≥ 10 A, ≤ 12 V, 0,1 Ω), la guía del IET (ensayo "duro" de hasta unos 25 A, con 1,5 veces el fusible como referencia, durante 5-20 s; ensayo "blando" de 20-200 mA solo cuando el duro dañaría la electrónica; límite 0,1 Ω sin cable y 0,1 Ω + R con cable) y 601help (25 A). **Sin verificar:** la corriente de ensayo de tipo de EN 60335-1.

Mío: un polímetro mide con muy poca corriente y no resuelve décimas de ohmio. En un contacto puntual, como el de los dientes, eso no basta para fiarse. Por eso la guía pide el comprobador de corriente alta.

## 5. Montaje: par, gripado, corrosión y cantidad

### 5.1 Par de apriete del M4 inoxidable A2-70

| Rozamiento total µ | Par máx. A2-70 M4 | Precarga | Fuente |
|---|---|---|---|
| 0,10 | 1,7 N·m | 2,97 kN | [Optimas](https://optimas.com/technical-resources/stainless-steel-fasteners-pre-load-and-tightening-torques/), [Pfeiffer](https://www.pfeiffer-vacuum.com/global/de/knowledge/vacuum-technology/mechanical-components-in-vacuum/connections) |
| 0,14 | 2,2 N·m | 2,73 kN | Pfeiffer |
| 0,20 | 2,6 N·m | 2,40 kN | Optimas, Pfeiffer |
| 0,30 | 3,0 N·m | 1,94 kN | Optimas, Pfeiffer |
| 0,40 | 3,3 N·m | 1,60 kN | Pfeiffer |
| — | Par de rotura mínimo: 3,8 N·m | — | Optimas |

- Las dos tablas son iguales y las dan solo como orientación. Pfeiffer da µ de 0,23-0,50 sin lubricar y 0,10-0,20 con pasta de MoS₂ para tornillo y tuerca inoxidables. Quiere decir que **en seco el máximo ronda 2,8-3,3 N·m y con pasta, 1,7-2,6 N·m** (lectura mía de las tablas, interpolando).
- Accu da 3 N·m como máximo recomendado para M4 A2-70 o A4-70, **en seco** y sin citar norma ([Accu](https://accu-components.com/de/p/387-verbindungselemente-aus-edelstahl-empfohlene-anzugsdrehmomente)).
- **El rango de 1,3-2,0 N·m que se planteaba no aparece en ninguna de las tablas que abrí** (las tres son máximos del tornillo, no valores para una unión eléctrica). Un valor de ese orden es prudente, pero no lo respalda una tabla.
- Para comparar: Beckhoff pide 3 Nm a un tornillo M4 de clase 8.8 para la tierra de un motor ([Beckhoff](https://infosys.beckhoff.com/content/1031/as2000/6287664651.html)).
- **Mío:** un par cercano a 3 N·m en seco deja poco margen sobre los 3,8 N·m de rotura. Y el espárrago está soldado (#25): no sé su par máximo ni su clase de resistencia. Mide el par que aguanta la soldadura de un espárrago de prueba antes de fijar el valor de la máquina. Usa destornillador o llave dinamométrica, no atornilladora eléctrica (Bolt Depot desaconseja herramientas eléctricas en inoxidable).
- **Sin verificar:** el par que fija EN 60335-1 (tabla de pares para tornillos de conexión) y el que da el fabricante del ojal (#23).

### 5.2 Gripado y lubricante

- **Inoxidable sobre inoxidable es el caso de riesgo.** El gripado es soldadura en frío entre superficies de la misma aleación cuando se rompe la capa pasiva; la rosca se bloquea y al seguir apretando se rompe la cabeza o se pelan los hilos ([TWI](https://www.twi-global.com/technical-knowledge/faqs/what-is-galling)). Prevención: lubricante, apretar más despacio y emparejar aleaciones o grados distintos (TWI). Bolt Depot añade: asentar las piezas antes, enroscar la tuerca a mano, no usar herramienta eléctrica y, si se atasca, parar, dejar enfriar y revisar la rosca ([Bolt Depot](https://boltdepot.com/fastener-information/Materials-and-Grades/Thread-galling)).
- **Dónde afecta aquí:** al espárrago inoxidable (#25) con tuercas inoxidables (#26). La arandela no es la que se gripa.
- **¿Engrasar o no?** Hay dos fuentes con intención distinta. Para el gripado, lubricar la rosca (TWI, Bolt Depot). Para la conexión eléctrica, Gigamon pide limpiar el punto y darle antioxidante, y Panduit incluye 5 cc de antioxidante en su kit de arandelas ([Gigamon](https://docs.gigamon.com/doclib610/Content/HW-G-TAP-A-2/Connections.html), [Panduit](https://www.mouser.com/datasheet/2/319/RGW-100-1Y%20Product%20Page-225273.pdf)). Un participante de eng-tips aplica grasa eléctrica "no-ox-id" sobre el metal base ([eng-tips](https://www.eng-tips.com/viewthread.cfm?qid=276803), foro).
- **Mi criterio:** sobre las caras de contacto (chapa, arandela, ojal) no pongas grasa normal ni pasta antigripado: no tengo fuente de que conduzcan. Si quieres proteger el contacto, usa un **compuesto antioxidante para conexiones eléctricas** y solo una película fina tras lijar y limpiar. En la rosca de las tuercas inoxidables, una gota de antigripado, y usa entonces la columna de par "con pasta" (1,7-2,6 N·m, apartado 5.1). No he encontrado ninguna fuente que diga si una pasta de MoS₂ o de níquel conduce.

### 5.3 Corrosión galvánica

| Pareja | Qué dicen las fuentes | Efecto en un interior seco |
|---|---|---|
| Arandela zincada sobre espárrago inoxidable | El zinc es el más anódico de los que aparecen; el 304 pasivo está casi en el extremo catódico ([Fastenal](https://crafter.fastenal.com/static-assets/pdfs/Corrosion_rev_2017-02-21.pdf)). En su tabla, un tornillo de zinc sobre una base de 304 lleva las notas 1, 4 y 5 (el chapado se consume rápido) | Se consume la capa de zinc. En ambiente seco es lento. La guía de RS limita el zincado a interior seco |
| Arandela zincada contra ojal de cobre estañado | Zinc más anódico que estaño y cobre. En la tabla de Fastenal, un tornillo de zinc sobre una base de cobre o latón lleva las notas 1, 4 y 5 (el chapado se consume) | Se consume el zinc. En ambiente seco es lento |
| Arandela inoxidable contra ojal de cobre estañado | Cobre y estaño son más anódicos que el 304 pasivo (Fastenal, [ARRL](https://www.arrl.org/galvanic-corrosion)). En la tabla de Fastenal, un tornillo de 304 sobre una base de cobre o latón da 2 (aumenta algo la corrosión de la base) | Pareja marginal. El ojal es la pieza que se sacrifica, muy despacio |
| Arandela zincada contra chapa de acero | El zinc es más anódico que el acero y lo protege (Fastenal: zinc sobre acero, notas 1 y 4) | Sin problema |

Las fuentes no dan potenciales numéricos (ni Fastenal, ni ARRL, ni Engineers Edge), solo orden y notas. Fastenal avisa de que el tratamiento superficial y el ambiente pueden cambiar mucho la actividad. **No he podido leer la MIL-STD-889 numérica.** Con estos datos (lectura mía), la arandela zincada es la pieza más anódica de la pila y la primera en consumirse. Para una máquina de bar (humedad, limpiadores, posible condensación), prefiere arandelas inoxidables.

### 5.4 Altura del apilado y cantidad

**Cuenta mía con medidas de memoria sin verificar** (tuerca M4 normal ≈ 3,2 mm, tuerca fina ≈ 2,2 mm, ojal ≈ 0,8-1,0 mm de espesor; la ficha del #23 debe confirmar el ojal):

- Nivel 1: arandela 0,5 + ojal ≈ 0,9 + tuerca 3,2 + contratuerca 2,2 ≈ 6,8 mm.
- Nivel 2: arandela 0,5 + 4 ojales ≈ 3,6 + tuerca 3,2 ≈ 7,3 mm.
- Total ≈ 14 mm de los 20 mm del espárrago (15-15,6 mm si pones una arandela más bajo cada tuerca). Quedan unos 4-6 mm de rosca libres si el espárrago mide 20 mm desde la chapa.

**Cuello de soldadura (mío):** la soldadura puede dejar un cuello o rebaba alrededor de la base del espárrago. Una arandela de agujero de 4,3 mm puede no asentar plana sobre él. Prueba una arandela y mira el asiento.

**Cantidad:**

| Montaje | Arandelas por máquina | Máquinas con 200 uds. |
|---|---|---|
| A (guía, §6 pasos 2 y 3) | 2 | 100 |
| C (una también bajo cada tuerca) | 4 | 50 |

No hay en la guía ningún otro uso de arandelas dentadas. El surtido inoxidable #26 trae "arandelas" M3-M6 (tipo sin verificar). Sobran en cualquier caso, y como hay que cambiar la arandela cada vez que se abre la unión, el exceso sirve de repuesto.

## 6. Fallos, bugs y problemas conocidos

No he encontrado reseñas técnicas ni retiradas de este pack ni de arandelas dentadas de Amazon. Lo que sigue son riesgos documentados en general y otros míos, rotulados.

| # | Problema | Gravedad para el proyecto | Fuente |
|---|---|---|---|
| 1 | Pintura o metal sin lijar bajo la unión | Alta | Hammond, Beckhoff, Gigamon |
| 2 | Material no declarado (zincado frente a inoxidable) | Media | Mío (anuncio no visto) |
| 3 | La arandela pierde eficacia al aflojarse o reutilizarse | Media | Nord-Lock |
| 4 | Bloqueo débil frente a vibración | Media (la contratuerca lo cubre) | Nord-Lock |
| 5 | Dientes aplastados contra superficie dura | Baja-media | Nord-Lock |
| 6 | Cotas fuera de tolerancia o mezcla de lotes | Media | Duratool (tolerancias), mío |
| 7 | Etiquetado "A2" engañoso | Baja | RS PRO 276-869 |
| 8 | Corrosión del zincado y óxido bajo la unión en ambiente húmedo | Baja en seco, media con humedad | Fastenal, RS guía |
| 9 | Gripado de las tuercas inoxidables sobre el espárrago | Media | TWI, Bolt Depot |
| 10 | Par excesivo que rompe el espárrago soldado | Media | Mío, tablas de par |
| 11 | Daño a pintura y recubrimientos por el giro de la arandela | Baja (se lija igual) | Nord-Lock |
| 12 | Fragilización por hidrógeno en arandela zincada dura | Baja | Bossard |
| 13 | Dientes que cortan el aislante o el cable | Baja | Mío |
| 14 | Marcas en un ojal blando y relajamiento de la pila | Baja-media | Mío, eng-tips (opinión) |

### Detalle

**1. Pintura o metal sin lijar (gravedad alta).** Hammond avisa de que su terminal de tierra no pone a tierra el armario sin quitar la pintura o añadir hilos de tierra ([Hammond](https://www.hammfg.com/files/parts/bulletins/BUL86513.pdf)). Gigamon pide quitar los recubrimientos no conductores de roscas y superficies de contacto ([Gigamon](https://docs.gigamon.com/doclib610/Content/HW-G-TAP-A-2/Connections.html)). El blog de UL 508A atribuye un contacto abierto en una prueba de continuidad a un panel pintado ([industrialmonitordirect](https://industrialmonitordirect.com/blogs/knowledgebase/ul-508a-panel-grounding-ground-bars-vs-din-rail-terminals), opinión del sitio). Mío: la arandela dentada no debe usarse como excusa para no lijar; es una ayuda para el óxido que se forme después.

**3 y 4. Eficacia, reutilización y vibración.** Nord-Lock: si la unión pierde tensión, la arandela "serrated" deja de ser eficaz y hay que sustituirla, y su reutilización vale 1 sobre 5 (bloqueo: 3 sobre 5). Para la "tooth lock washer" da 1 sobre 5 en bloqueo, reutilización "no aplicable", y dice que las superficies duras aplanan los dientes. Son las valoraciones de un fabricante de arandelas de cuña (interés comercial) y no traen datos de ensayo. Mío: es motivo para apoyarse en la contratuerca y en el par, y para sustituir la arandela cuando se abra el nivel.

**6. Cotas.** Un M4 con agujero de 3,9-4,0 mm no pasa por la rosca. La hoja de Duratool para DIN 6797 A permite 4,30-4,48 mm de diámetro interior y 7,64-8,00 mm de exterior. Un pack de 200 sin marca es la situación en la que mezclar lotes es más fácil (mío). El apartado 7 explica cómo comprobarlo.

**8. Corrosión del zincado.** Con el zinc como metal sacrificial frente al inoxidable, el recubrimiento se gasta y después aparece óxido rojo del acero de muelle. Un óxido grueso entre arandela y ojal sube la resistencia de contacto (mío). RS lo limita a interior seco.

**12. Hidrógeno.** Bossard avisa de que las piezas de muelle galvanizadas de 360 HV o más tienen riesgo de rotura por hidrógeno incluso horneadas ([Bossard](https://www.bossard.com/global-en/knowledge-hub/resources/notes-on-use/)). La BN 789 de Bossard (350-425 HV, zincada) lleva el aviso en su ficha. Duratool declara que las suyas están desfragilizadas. Mío: riesgo bajo en una arandela comprimida.

**13. Dientes y aislante.** No hay fuente. Las puntas de una arandela dentada exterior son afiladas y sobresalen hasta los 8 mm. Si el ojal es aislado, la funda de plástico queda por encima y no debería tocar los dientes. Revisa que ningún hilo ni funda toque el borde de la arandela y quita rebabas con una lima fina.

**Fallos que no he podido documentar** (no los afirmo): arandelas dentadas defectuosas de Amazon concretas, falsificaciones de arandelas o recubrimientos que se desprenden en packs de 200 uds., y casos de tierra con resistencia alta atribuidos a una arandela dentada. No he encontrado fuentes.

## 7. Qué comprobar al recibir el pack

Hazlo con las arandelas sueltas, **antes** de montar. Toma 10-20 piezas al azar del pack (criterio mío). Compra una segunda bolsa de otro vendedor si falla.

| Qué mirar | Aceptable | Cómo (mío salvo la fuente indicada) |
|---|---|---|
| Ø interior | 4,30-4,48 mm ([Duratool](https://www.farnell.com/cad/2337766.pdf)) | Calibre. O con brocas: pasa una de 4,3 mm y **no** pasa una de 4,5 mm. Tiene que pasar por la rosca de un M4 sin forzar |
| Ø exterior | 7,64-8,00 mm | Calibre |
| Espesor | 0,5 mm nominal (sin tolerancia publicada) | Micrómetro o calibre, sin aplastar los dientes |
| Dientes | Alternados, torcidos a ambos lados, sin grietas ni dientes rotos. Número de dientes sin verificar para M4 | Lupa. Cuenta los dientes de varias y compara |
| Bordes | Sin rebabas que corten | Pasa un dedo con cuidado y mira con luz rasante |
| Acabado | El zinc no se desprende al frotar con un trapo blanco | Trapo y uña |
| Imán | Zincado: se pega con fuerza. Inoxidable: poco o nada | **Orientativo.** El inoxidable 1.4310 de muelle es acero deformado en frío y puede quedar algo magnético (conocimiento general mío, **sin fuente abierta**). Si se pega fuerte, es casi seguro acero. Si no se pega, puede ser inoxidable. No decide por sí solo |
| Humedad y sal | Inoxidable: sin óxido tras 24 h húmeda con una gota de agua salada. Zincado: manchas blancas o rojas | Prueba con 3-5 arandelas aparte |
| Dientes que muerden | Marcas visibles en chapa y ojal tras apretar | Aprieta una arandela con un ojal a un trozo de la chapa lijada, al par previsto, afloja y mira con lupa. Los dientes deben marcar y no romperse ni aplastarse |
| Resistencia del montaje | ≤ 0,1 Ω en todo el recorrido de tierra | Montaje real con ≥ 10 A (comprobador de un electricista). El polímetro es solo una primera comprobación (guía §6) |

Si el anuncio no declara material, trátalo como acero zincado hasta demostrar lo contrario (mío). Pide al vendedor material, norma y recubrimiento antes de usarlas.

## 8. Alternativas y disponibilidad

### 8.1 Alternativas (solo si el pack decepciona)

| Opción | Qué es | Observación | Fuente |
|---|---|---|---|
| **Dentada inoxidable A2 1.4310** | Misma DIN 6797 A en inoxidable | La opción natural con espárragos inox y tuercas inox. En ehorst con unidades de 1000 | [ehorst](https://www.ehorst.de/en/Zahnscheibe-DIN-6797-A2-A-4-3-aussengezahnt-Edelstahl-1058430.html) |
| **DIN 6797 J** (dientes interiores) | Los dientes quedan dentro de la huella del ojal | Retiene menos (Wikipedia). Evita dientes sobresaliendo. RS PRO 526-596 | [RS](https://es.rs-online.com/web/p/products/526596) |
| **DIN 6798 A** (familia "serrated" de RS) | Otra norma de arandela dentada exterior | Mismas cotas M4 en RS. Sin verificar en qué se diferencia de la 6797 | [RS](https://pt.rs-online.com/web/p/arandelas/2874187) |
| **Ojal sobre metal limpio + arandela de bloqueo del lado de la tuerca** | Lo que hacen Beckhoff y Hammond | Sin dientes entre ojal y chapa. Beckhoff usa plana + elástica | [Beckhoff](https://infosys.beckhoff.com/content/1031/as2000/6287664651.html) |
| **Arandelas perforadoras de pintura** | Panduit RGW-100-1Y y las "con garras" de Schneider | Las que he visto son de M8 o de rack. **No he encontrado una de M4 para ojales** | [Panduit](https://www.mouser.com/datasheet/2/319/RGW-100-1Y%20Product%20Page-225273.pdf), [Schneider](https://www.se.com/us/en/faqs/FA368289/) |
| **Tornillo autorroscante o de rosca laminada** | Rosca su propio agujero en la chapa | El kit de tierra de Siemens usa un tornillo de rosca laminada. Los kits de Panduit son "thread-forming" y quitan la pintura del agujero. Cambia el diseño del espárrago | [Siemens](https://media.distributordatasolutions.com/siemenssi/2019q4/df184452b21898c0b79b33871e09e9de962d99fb.pdf), [Panduit](https://www.mouser.com/datasheet/2/319/RGW-100-1Y%20Product%20Page-225273.pdf) |
| **Elástica partida DIN 127 B** (grower) | Arandela de muelle | **No es para tierra**: no muerde la pintura (mío). Bossard BN 672 M4 inoxidable: Ø interior 4,1 mm, Ø exterior 7,6 mm, 200 uds. a 8,20 € en RS. Wikipedia cita un manual de la NASA de 1990 que dice que una arandela de este tipo es inútil para bloquear | [RS](https://pt.rs-online.com/web/p/arandelas/2887306), [Wikipedia](https://en.wikipedia.org/wiki/Washer_(hardware)) |
| **Arandelas Nord-Lock (cuña)** | Bloqueo por cuña | Mejor antiaflojamiento según el propio fabricante, pero **no he encontrado datos de su uso en tierras**. No son arandelas de tierra | [Nord-Lock](https://www.nord-lock.com/link/8bc1485d52684ff68b4ca5366646fa8d.aspx) |

No hay motivo para sustituir la dentada si resulta inoxidable y mide bien: es una práctica que sigue, por ejemplo, IBM (apartado 4.2).

### 8.2 Disponibilidad y vida del producto

La designación DIN 6797 está retirada según Bossard, pero la pieza es un artículo de catálogo muy extendido (Bossard, Farnell/Duratool, RS PRO, ehorst). No veo riesgo de descatalogación. El pack de Amazon es un anuncio sin ficha: si desaparece, hay sustituto en cualquier proveedor industrial con las cotas de la tabla 2.2.

## 9. Discrepancias con la guía y con las cifras de partida

"Notas de partida" son las cifras y normas que venían apuntadas en mi planteamiento inicial de esta ficha (dureza, par, normas citadas) y que no están en la guía. Las contrasto igual que las de la guía.

| # | La guía o las notas de partida dicen | Lo que he encontrado | Fuente |
|---|---|---|---|
| 1 | Guía §6: "chapa → arandela dentada → ojal → tuerca → contratuerca" | No es incorrecto (IBM monta igual), pero otros fabricantes ponen el ojal sobre metal limpio y la arandela de bloqueo del lado de la tuerca. Ninguna norma abierta lo fija. Decide con la medida | Apartado 4.2-4.3 |
| 2 | Guía §6: "así, si sueltas un cable interno no se pierde la tierra de entrada" | Es cierto mecánicamente. No cubre el punto común (un espárrago y una soldadura), el apoyo del nivel 2 en el nivel 1 ni cuántos ojales caben | Apartado 4.5 |
| 3 | Guía §6: límite 0,1 Ω y comprobador de 10-25 A | Coherente con EN 50106 (≥ 10 A, 12 V, 0,1 Ω), IET (hasta 25 A) y 601help (25 A) | Apartado 4.6 |
| 4 | Guía §1 #24: sin material ni norma | Hay dos familias (zincada e inoxidable) y no sé cuál es. La guía usa espárragos inox | Apartados 2.4 y 5.3 |
| 5 | Notas de partida: dureza 400-500 HV | Bossard (BN 787, BN 789) y Duratool (HV10) dan **350-425 HV** | Apartado 2.4 |
| 6 | Notas de partida: par del M4 A2-70 de 1,3-2,0 N·m "según fabricantes" | Las tablas de Optimas y Pfeiffer dan 1,7-3,3 N·m según µ (máximo del tornillo), y Accu 3 N·m en seco. El 1,3-2,0 no aparece en ninguna que abrí | Apartado 5.1 |
| 7 | Notas de partida: UL 467 "requiere arandelas dentadas o contacto con metal desnudo" | No lo puedo confirmar. No he abierto la norma y ninguna fuente que leí la cita para eso | Apartado 3 |
| 8 | Notas de partida: EN 60335-1 cláusula 27.3 | La cláusula 27 trata de la tierra (de memoria). No puedo confirmar qué trata la 27.3 | Apartado 3 |
| 9 | Notas de partida: "ISO 10673 / 7089" como normas de arandelas dentadas | ISO 7089 y 7090 son arandelas **planas** (Wikipedia). ISO 10673 sin verificar. No he encontrado norma ISO de arandelas dentadas | Apartado 2.3 |
| 10 | Notas de partida: "las dentadas se hunden en aluminio" | Nord-Lock y Wikipedia dicen lo contrario para el bloqueo: funcionan **mejor** con sustratos blandos como aluminio. Lo que puede ocurrir (mío) es que marquen y se relajen. En tu chapa de acero no aplica | Apartado 4.1 |
| 11 | Notas de partida: "3-4 arandelas por espárrago" | La guía usa 2 por máquina (una por nivel), 4 si pones también una bajo cada tuerca | Apartado 5.4 |

Puntos que tocan a otras piezas (una línea cada uno): #25 (par máximo y clase de resistencia del espárrago soldado; cuello de soldadura que puede impedir que la arandela asiente), #23 (agujero del ojal de 4,3 mm o más, espesor, material y si es estañado o aislado), #26 (tuercas inoxidables: riesgo de gripado) y #14 (el borne FG de la LRS-50-5 es de ojal o puntera; no usa arandela).

## 10. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Mide cada pieza metálica con ≥ 10 A y exige ≤ 0,1 Ω** antes de enchufar la máquina a la red. Que lo haga o lo revise un electricista. Repite la medida tras unos días de funcionamiento y después de cualquier apertura.
2. **Recibe el pack y haz el apartado 7.** Si no declara material, trátalo como acero zincado. Para una máquina de bar, prefiere inoxidable A2 (1.4310). Pide material y norma al vendedor.
3. **Orden de montaje:** sigue el de la guía (A) si la medida lo valida. Si sale alta o inestable, prueba B (ojal directo sobre metal limpio y arandela bajo la tuerca) o C (arandela también arriba). Elige por medida, no por la preferencia de una fuente.
4. **Lija y limpia hasta el metal**, sin pintura ni óxido. Pasa alcohol. Si quieres, una película fina de antioxidante para conexiones eléctricas. Protege con pintura el borde de la zona lijada (mío). **No uses grasa ni pasta antigripado en las caras de contacto.**
5. **Par:** valida con un espárrago de prueba y una llave dinamométrica. Como punto de partida (mío), las tablas de máximos para M4 A2-70 dan 1,7-2,6 N·m con pasta y unos 2,8-3,3 N·m en seco; elige un valor claramente por debajo y siempre por debajo de lo que aguante la soldadura. Aprieta despacio y a mano. Marca las tuercas con una raya de pintura.
6. **Cambia la arandela cada vez que abras la unión.** Con 200, hay repuesto de sobra.
7. **Rotula las tuercas del nivel 1** ("no aflojar") y anota en el manual de servicio el orden del apilado.
8. **No cuentes con la arandela como antiaflojamiento.** La contratuerca y el par lo hacen.
9. **No uses arandelas elásticas partidas (DIN 127) como sustituto en una tierra:** no muerden pintura ni óxido.
10. **Guarda factura, fotos del pack y resultados de las medidas** para el expediente técnico de la máquina (RD 187/2016, según la guía). Anota los valores de continuidad de cada máquina.

## 11. Lo que no he podido verificar

- **El anuncio de Amazon B0B77J5FZS:** Amazon bloquea el acceso. No sé material, norma, acabado, cotas, marca ni si hay reseñas con quejas. Una búsqueda del ASIN no lo encontró.
- **El texto de DIN 6797, DIN 6798, EN 60335-1, EN IEC 60335-2-82, IEC 61439-1, UL 467, UL 508A, NFPA 70 (NEC), ISO 3506-1, ISO 16130, DIN 65151 y ASME B18.21.1.** Están de pago. Solo tengo lo que citan las fuentes de arriba. En concreto no he leído: la cláusula 27 de EN 60335-1 (numeración, bloqueo del borne, resistencia, corriente de ensayo y tabla de pares), qué dice UL 467 sobre arandelas, ni qué sustituye al DIN 6797 retirado.
- **Número de dientes de la DIN 6797 A para M4** y diferencias exactas entre DIN 6797 y DIN 6798.
- **Diagrama del orden correcto de Burndy o Panduit:** no encontré ninguno. Panduit solo aparece con una ficha de producto (arandelas perforadoras de pintura de M8) y Burndy no apareció en ninguna búsqueda.
- **Dureza de la arandela inoxidable 1.4310:** ehorst no la da.
- **Imantación del inoxidable de muelle:** no abrí una fuente. Lo digo como conocimiento general mío.
- **Ensayos independientes de arandelas dentadas M4:** Junker o similares. La página de Nord-Lock no da cifras para ellas. No consulté el IFI ni la bibliografía de la NASA directamente (solo la cita de Wikipedia a un manual de la NASA de 1990, sobre arandelas elásticas).
- **Potenciales numéricos de la MIL-STD-889:** las tres fuentes que abrí solo dan el orden.
- **Par máximo del espárrago soldado, clase de resistencia de los espárragos y de las tuercas, y espesor y material de los ojales:** dependen de #23, #25 y #26.
- **Burndy, Thomas & Betts, Hubbell, Würth, HECO y Hilti:** ninguna búsqueda me llevó a páginas suyas sobre arandelas dentadas o tierras y mi presupuesto de búsquedas web se agotó.
- **Páginas que la herramienta rechazó** (no se reintentaron): boltscience.com (arandelas de seguridad), Wikipedia en alemán (Zahnscheibe y Fächerscheibe), Misumi USA (compatibilidad galvánica), la especificación de puesta a tierra de Northwestern University (robots) y un documento de ENEC (error).
- **Las fuentes de foros** (eng-tips, mikrocontroller.net) y las webs de comentario (601help, industrialmonitordirect) son opiniones o resúmenes, no normas. Las usé solo para el razonamiento y las he rotulado así.

## 12. Fuentes

Todos los enlaces, ordenados por tipo, y una lista de lo que no se pudo abrir, en [`enlaces.md`](enlaces.md).
