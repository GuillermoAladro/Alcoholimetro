# Módulo de entrada C14 con portafusibles e interruptor luminoso

Entrada de red de 230 V de la máquina. Va en la trasera de la caja de arriba. Recibe el cable Schuko–C13 de 2 m (#17) y lleva el interruptor y el fusible. De él salen L y N (cable de 1,5 mm² con faston) a la fuente Mean Well LRS-50-5 (#14). El pin de tierra va al espárrago M4 de tierra.

- **Compra:** ASIN B08Z6FCR5Z, 7,70 € (precio de la hoja de componentes del 19-20-10-2026).
- **Es una pieza de 230 V.** Léela entera antes de enchufar nada. Si no tienes experiencia con red, que un electricista revise este módulo y la tierra.

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta: **no he visto el anuncio B08Z6FCR5Z**. El precio, el ASIN y lo que dice el anuncio ("interruptor LED de 4 pines, 6 A / 250 V, fusible de 10 A") son los de tu hoja y tu guía. Esta pieza **no tiene ficha del fabricante**: lo que sigue se apoya en la norma, en módulos certificados de referencia (Schurter, Bulgin) y en fichas de módulos genéricos parecidos. Mi presupuesto de búsquedas web se agotó antes de poder cerrar algunos huecos; están en el apartado 12.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales y normas](#3-documentos-oficiales-y-normas)
4. [Esquema interno y cómo identificarlo](#4-esquema-interno-y-cómo-identificarlo)
5. [Fusible, polaridad y corte unipolar o bipolar](#5-fusible-polaridad-y-corte-unipolar-o-bipolar)
6. [Instalación y cableado](#6-instalación-y-cableado)
7. [Fallos, bugs y problemas conocidos](#7-fallos-bugs-y-problemas-conocidos)
8. [Qué comprobar al recibirlo](#8-qué-comprobar-al-recibirlo)
9. [Alternativas](#9-alternativas)
10. [Discrepancias con la guía de montaje](#10-discrepancias-con-la-guía-de-montaje)
11. [Recomendaciones para el alcoholímetro](#11-recomendaciones-para-el-alcoholímetro)
12. [Lo que no he podido verificar](#12-lo-que-no-he-podido-verificar)
13. [Fuentes](#13-fuentes)

---

## 1. Resumen para el proyecto

- **"4 pines con luz" no quiere decir "interruptor bipolar".** Con cuatro terminales hay dos esquemas posibles: un interruptor unipolar con lámpara aparte, o uno bipolar sin lámpara separada (apartado 4). Los vendedores de módulos parecidos se contradicen entre sí: unos lo llaman DPST y otros SPST ([Probots](https://probots.co.in/iec-c14-3-pin-ac-power-socket-fuse-switch-snap-fit.html), [BuildYourCNC](https://buildyourcnc.com/products/ac-power-connector-c14-male-3-pins-screw-panel-mount-10a-250v-iec-320-with-fuse-and-switch)). La guía da por hecho que el interruptor es bipolar. **Hay que medirlo**, y el protocolo está en el apartado 4.3. Si es unipolar y se cablea como si fuera bipolar, el neutro pasaría por la lámpara.
- **Lo normal en estos módulos es un solo portafusibles, es decir, un solo polo con fusible.** Con un enchufe Schuko, que se puede insertar de las dos maneras ([Wikipedia: Schuko](https://en.wikipedia.org/wiki/Schuko)), ese polo puede ser fase o neutro según cómo se enchufe. Un fusible en el neutro corta igual una sobrecarga entre L y N, pero **no corta un fallo de aislamiento de la fase al chasis**; ahí solo protegen el magnetotérmico y el diferencial del local. Detalle y fuentes en el apartado 5.
- **No es un módulo certificado.** Los módulos genéricos comparables no traen aprobaciones (VDE, ENEC, UL) o se declaran "autocertificados" ([RS PRO EMI-13](https://docs.rs-online.com/cba3/0900766b815867ba.pdf)). La caja es para bares y funciona sin personal: el módulo habrá que justificarlo en el expediente de la máquina. Un módulo certificado cuesta bastante más, pero sobre 470 € de electrónica por máquina la diferencia es pequeña (apartado 9).
- **Ojo con la fijación en la chapa.** Los módulos genéricos de clip están hechos para chapas finas: 1 mm en [MWMS](https://www.kaufland.at/product/470137149/), 0,8-2,5 mm en [RS PRO EMI-13](https://docs.rs-online.com/cba3/0900766b815867ba.pdf). Con chapa de 2 mm o 2,6 mm puede no sujetar. Los módulos buenos se piden por espesor o se fijan con tornillos M3.
- **El faston de los genéricos y de Schurter es de 4,8 × 0,8 mm, no de 6,3 mm.** Solo Bulgin ofrece 6,3 mm en algunas versiones ([Bulgin](https://docs.rs-online.com/713f/A700000008622360.pdf)). Mide con calibre al recibirlo y comprueba el grosor de la lengüeta (0,5 o 0,8 mm) contra el kit de faston (#27).
- **El fusible T2,5A de la guía es coherente con la fuente.** Un fusible de referencia de la misma familia (Littelfuse 215, 2,5 A) tiene 22,29 A²s de I²t de fusión y 1500 A de poder de corte ([datasheet](https://littelfuse.com/%7E/media/electronics/datasheets/fuses/littelfuse_fuse_215_datasheet.pdf.pdf)). El fusible concreto de Amazon (#16) no publica ficha.

## 2. Especificaciones

### 2.1 Lo que dice tu hoja y tu guía (anuncio no visto)

| Característica | Valor | Fuente |
|---|---|---|
| Conector | C14, módulo de panel con portafusibles e interruptor luminoso | Hoja de compra #15 |
| Interruptor | "LED de 4 pines", 6 A / 250 V | Guía §2.7 |
| Fusible incluido | 10 A (hay que cambiarlo por T2,5A cerámico 5×20) | Guía §1 y §2.7 |
| Precio | 7,70 € | Hoja de compra |

Nada de esto lo he podido comprobar en el anuncio. El anuncio no se ha podido abrir y una búsqueda del ASIN no devolvió resultados.

### 2.2 Datos de norma para un C14

| Característica | Valor | Fuente |
|---|---|---|
| Norma del conector | IEC 60320-1 (edición citada por Wikipedia: 2021). Hoja C13/C14 | [Wikipedia: IEC 60320](https://en.wikipedia.org/wiki/IEC_60320) |
| Corriente y tensión | 10 A, 250 V, 50/60 Hz | [Schurter](https://schurter.com/en/knowledge/appliance-couplers), [Wikipedia](https://en.wikipedia.org/wiki/IEC_60320) |
| Temperatura máxima en los pines | 70 °C para C13/C14. 120 °C para C15/C16 (con un resalte que impide meter un C13 en un C16) | [Wikipedia](https://en.wikipedia.org/wiki/IEC_60320), [Interpower](https://interpower.com/ic/InfoPower/designing-with-specific-iec-60320-connectors-and-inlets.html) |
| Clase de protección | Clase I (con tierra). C13/C14 polarizados | [Wikipedia](https://en.wikipedia.org/wiki/IEC_60320) |
| UL/CSA | UL certifica C13/C14 hasta 15 A, por encima del máximo IEC de 10 A | [Wikipedia](https://en.wikipedia.org/wiki/IEC_60320) |
| Separación de los pines | 14 mm (horizontal) × 4 mm (vertical) | [Wikipedia](https://en.wikipedia.org/wiki/IEC_60320) |
| Humedad | El conector no lleva protección especial contra humedad: la tiene que dar el aparato | [Schurter](https://schurter.com/en/knowledge/appliance-couplers) |

**Qué significa "10 A 250 V" aquí (mío):** es el valor del conector C14 según IEC 60320-1. No dice nada del interruptor ni del portafusibles del módulo, que tienen sus propios límites. En módulos genéricos parecidos, el interruptor es de 6 A / 250 V o 10 A / 125 V ([MWMS](https://www.kaufland.at/product/470137149/), [BuildYourCNC](https://buildyourcnc.com/products/ac-power-connector-c14-male-3-pins-screw-panel-mount-10a-250v-iec-320-with-fuse-and-switch)), aunque el título diga "10 A 250 V". La carga de este proyecto es muy pequeña: la fuente consume unos 14 W típicos (guía §3), es decir, décimas de amperio. El límite de 6 A del interruptor no es problema en uso continuo. El pico de arranque de 45 A de la LRS-50-5 (dato de la guía; ficha #14) sí importa al interruptor (apartado 7).

**La temperatura de 70 °C (mío):** se mide en la base de los pines. La fuente disipa unos 2,5 W con 12 W de carga y unos 5 W con 26 W (cálculo mío con la eficiencia del 83 % de la guía), dentro de la misma caja. Basta con medir la temperatura interior de la caja cerrada, algo que la guía ya pide por el sensor (límite de 40 °C).

### 2.3 Módulos genéricos comparables (rangos encontrados)

No son tu módulo. Sirven para saber qué esperar.

| Dato | MWMS (Kaufland.at) | Probots PRO3226 | RS PRO EMI-13 | RS PRO EMI-21 | Maplin SE-AS-303-1 |
|---|---|---|---|---|---|
| Interruptor | 4 pines, iluminado, 6 A/250 V o 10 A/125 V | 4 pines, rojo iluminado, "DPST", 10 A | DPST, sin luz, 6 A/250 V (módulo) | Sin interruptor | DPST, 10 A/250 V |
| Portafusibles | Uno; indica fusibles de vidrio de 250 V (no da la medida); trae un fusible de reserva en el cajetín | Cajón de 5×20, vidrio o cerámica; **fusible no incluido** | Uno, 5×20 | Uno, 5×20 | 5×20, vidrio o cerámica; polo sin indicar |
| Terminales | 4,8 × 0,8 mm o soldar | 4,8 mm o soldar | 4,8 × 0,8 mm o soldar | 4,8 × 0,8 mm o soldar | 4,8 × 0,8 mm |
| Recorte | ≈ 47 × 27 mm | ≈ 47 × 27 mm | No indicado | No indicado | 54,3 × 28,5 mm, tornillos a 40 mm |
| Marco / fondo | ≈ 50,3 × 30,5 mm, fondo 31 mm | — | — | — | — |
| Fijación y espesor | Clip (snap-in), chapa de 1 mm | Clip | Clip, 0,8-2,5 mm | Tornillos | Tornillos |
| Aislamiento y rigidez | — | — | 2 kVAC 1 min; ≥ 1000 MΩ a 500 VDC; contacto ≤ 10 mΩ | Igual | — |
| Temperatura de trabajo | — | — | 0-70 °C | 0-70 °C | −45 a +105 °C |
| Aprobaciones | Ninguna indicada | Ninguna (UL94V-0 del plástico, que no es una certificación del módulo) | "Autocertificado" | "Autocertificado" | Ninguna indicada |
| Fuente | [enlace](https://www.kaufland.at/product/470137149/) | [enlace](https://probots.co.in/iec-c14-3-pin-ac-power-socket-fuse-switch-snap-fit.html) | [ficha](https://docs.rs-online.com/cba3/0900766b815867ba.pdf) | [ficha](https://docs.rs-online.com/2742/0900766b815867af.pdf) | [enlace](https://pro.maplin.co.uk/products/c14-iec-fused-and-switched-inlet) |

Otros listados genéricos que he mirado dicen: [BuildYourCNC](https://buildyourcnc.com/products/ac-power-connector-c14-male-3-pins-screw-panel-mount-10a-250v-iec-320-with-fuse-and-switch) (interruptor SPST rojo iluminado, 6 A a 250 V y 10 A a 125 V, rigidez 2000 VAC, sin aprobaciones, y se contradice entre "tornillos" y "snap-in"), [Improvium](https://improvium.odoo.com/en/shop/fused-rocker-power-inlet-iec-320-c14-10a-red-switch-with-fuse-1627) (DPST de 4 pines, fusible de vidrio de 10 A incluido, 50 × 31 mm, sin aprobaciones), [uElectronics](https://uelectronics.com/producto/modulo-de-entrada-iec320-c14-ac-250v-10a-con-interruptor-negro-o-rojo/) (4 pines, agujero de 3 mm, sin aprobaciones) y [Besomi](https://besomi.com/jo_en/srsx0208-iec320-c14power-socket-with-switch-function-and-fuse-holder.html) (sin detalles).

**Recorte de la ventana.** La cifra de 27,5 × 48,5 mm (la "ventana típica" que se maneja para esta pieza) **no aparece en ninguna fuente que haya abierto**. Lo que sí hay:

- Genéricos de clip: 47 × 27 mm aproximado (MWMS, Probots).
- [Schurter, serie con interruptor de 2 polos y clip](https://docs.rs-online.com/07e0/A700000008623303.pdf): 47 × 28 mm (tolerancia +0,10 / −0,05) sin blindaje EMC y 47,8 × 28,8 con blindaje. El texto extraído no etiqueta esas cifras como "recorte", así que confírmalo en el dibujo.
- Genéricos de tornillos: 54,3 × 28,5 mm con agujeros a 40 mm (Maplin). Schurter KD/KG, que llevan selector de tensión: 27,5 mm por 66,5 (KD) u 80 mm (KG) ([KD](https://www.farnell.com/datasheets/2351262.pdf), [KG](https://www.farnell.com/datasheets/2349197.pdf)). Tampoco están etiquetadas como "recorte" ni se distingue cuál es el ancho.
- Schurter da tolerancias de décimas de milímetro (+0,10 / −0,05 mm en la serie con clip). Pide el recorte con corte láser y confirma con el módulo en la mano. Un recorte demasiado ancho deja el hueco a la vista bajo una brida estrecha ([reseña en desertcart](https://www.desertcart.co.za/products/17152458)).

**Espesores de chapa.** Los de referencia son estos:

| Fabricante | Clip (snap-in) | Tornillos |
|---|---|---|
| Schurter KD/KG | 1,5, 2 o 2,5 mm | hasta 8 mm, M3, par máximo 0,5 Nm |
| Schurter serie con clip (arriba) | 1, 1,5, 2 o 2,5 mm | — |
| Bulgin | Versiones de 1, 1,5, 2 o 3 mm (sufijo del código) | Versiones con tornillos |
| Genéricos | 1 mm (MWMS) o 0,8-2,5 mm (RS PRO) | Según modelo |

Fuentes: [Schurter KD](https://www.farnell.com/datasheets/1830753.pdf), [Schurter KG](https://www.farnell.com/datasheets/2349197.pdf), [Bulgin](https://docs.rs-online.com/713f/A700000008622360.pdf), [RS PRO EMI-13](https://docs.rs-online.com/cba3/0900766b815867ba.pdf), [MWMS](https://www.kaufland.at/product/470137149/).

### 2.4 Referencia certificada: Schurter KD

Datasheet PG05 ([versión 2014](https://www.farnell.com/datasheets/1830753.pdf), [versión 2017](https://www.farnell.com/datasheets/2351262.pdf)). Es una pieza de otra liga, pero muestra qué debería poder afirmar un buen módulo.

| Característica | Valor |
|---|---|
| Entrada | C14 (IEC 60320-1), clase I |
| Corriente y tensión | IEC 10 A / 250 VAC, 50 Hz. UL/CSA 10 A / 125 VAC, 60 Hz (versión de 2014) |
| Portafusibles | 5×20 o 6,3×32 mm, **1 o 2 polos**, seguro contra contacto (IEC 60127-6, PC2) |
| Interruptor | **2 polos**, basculante, IEC 61058-1. Iluminado y unipolar, bajo pedido |
| Terminales | Faston 4,8 × 0,8 mm, estañados |
| Rigidez dieléctrica | > 3 kVAC entre L y N, > 4 kVAC entre L/N y tierra (1 min, 50 Hz) |
| Temperatura de trabajo | −25 a 70 °C. Pines del C14 a 70 °C |
| Protección | IP40 por delante (IEC 60529) |
| Aprobaciones | VDE 40029908, UL E93617, CSA 38456, CCC |

Otras notas de Schurter: la potencia que admite el portafusibles baja por encima de 23 °C de ambiente (2 W en un polo a 23 °C en la serie 6202: [ficha](https://at.schurter.com/en/datasheet/6202)). El portafusibles de la serie 6202 solo se abre **quitando antes el enchufe** (la ficha dice "plug removal necessary").

## 3. Documentos oficiales y normas

No hay documentos del fabricante de tu módulo. Lo que hay son las normas y fichas de módulos comparables.

### 3.1 Normas

Las normas están de pago. Solo he podido leer extractos y páginas de resumen.

| Norma | Tema | Qué he podido leer | Enlace |
|---|---|---|---|
| IEC 60320-1 (EN 60320-1) | Acopladores de aparato: hoja C13/C14 | Resumen en Wikipedia, Schurter e Interpower. Texto completo: no | [Wikipedia](https://en.wikipedia.org/wiki/IEC_60320) |
| IEC 61058-1 (EN 61058-1) | Interruptores de aparatos | Vista previa de la edición 3.2 (2008): alcance hasta 480 V y 63 A, sin la tabla de marcado | [vista previa ANSI](https://webstore.ansi.org/preview-pages/IEC/preview_iec61058-1%7Bed3.2%7Db.pdf) |
| IEC 60127-1/-2/-6 (EN 60127) | Fusibles miniatura, cartuchos, portafusibles | Solo lo que citan los datasheets de Littelfuse y Schurter. No he abierto las normas | [Littelfuse 215](https://littelfuse.com/%7E/media/electronics/datasheets/fuses/littelfuse_fuse_215_datasheet.pdf.pdf) |
| EN 60335-1 y EN IEC 60335-2-82 | Seguridad de aparatos y máquinas recreativas | Solo el alcance de la parte 2-82. **El texto de las cláusulas no** | [EVS](https://evs.ee/en/evs-en-iec-60335-2-82-2022) |
| IEC 60364 / REBT (ITC-BT-19) | Instalaciones eléctricas | Solo el resumen de IEC 60364-4-43. **ITC-BT-19 no se abrió** (la herramienta pidió un permiso que no llegó a contestarse) | [genorma](https://genorma.com/en/standards/iec-60364-4-43-2008-ed3) |

**Qué dicen los más relevantes**

- **IEC 60320-1.** Define los acopladores de dos polos más tierra para 250 V. El C13/C14 es de 10 A y 70 °C; el C15/C16 es de 120 °C y se reconoce por un resalte que impide enchufar un C13 en un C16 ([Wikipedia](https://en.wikipedia.org/wiki/IEC_60320)). En la edición de 2015 se añadió una cláusula que prohíbe engranar acopladores no estándar con los de la hoja estándar (misma fuente).
- **IEC 61058-1.** Cubre interruptores accionados a mano o a pie para aparatos de hasta 480 V y 63 A. Trae pruebas de ciclos de maniobra, de calentamiento, de distancias de fuga, de hilo incandescente (glow-wire) y de seguimiento superficial (proof tracking). La vista previa no muestra los valores ([ANSI](https://webstore.ansi.org/preview-pages/IEC/preview_iec61058-1%7Bed3.2%7Db.pdf)). Dato útil: Bulgin ofrece interruptores "high inrush" con una corriente de pico de 85 A según EN 61058-1 (versiones mini bisel) o 150 A según IEC 65 ([catálogo Polysnap](https://www.farnell.com/datasheets/625732.pdf)).
- **IEC 60127.** El Littelfuse 215 (5×20, retardado, cerámico, 1500 A a 250 V) declara cumplir la hoja 5 de la parte 2 de IEC 60127 ([datasheet](https://littelfuse.com/%7E/media/electronics/datasheets/fuses/littelfuse_fuse_215_datasheet.pdf.pdf)). La parte 6 es la de los portafusibles; Schurter habla de "PC2" y de potencia admisible por polo ([ficha 6202](https://at.schurter.com/en/datasheet/6202)).
- **EN IEC 60335-2-82.** Cubre máquinas recreativas y de servicio personal comerciales, de hasta 250 V monofásicas ([EVS](https://evs.ee/en/evs-en-iec-60335-2-82-2022)). **Según esa misma página, la edición de 2022 se retira el 16-09-2026 y la sustituye una de 2026.** La guía (§9) cita la de 2022. La página de EVS tiene fechas internas incoherentes, así que confirma la edición vigente con AENOR o con EVS directamente.
- **EN 60335-1.** Schurter dice que su inlet C18 con fusible está pensado para aplicaciones de IEC/UL 62368-1 y de IEC 60335-1, y menciona los requisitos de hilo incandescente (glow-wire) para uso sin vigilancia ([ficha 6202](https://at.schurter.com/en/datasheet/6202)). **Mi lectura:** una máquina de bar funciona sin vigilancia, así que probablemente esos ensayos se aplican a las piezas aislantes que soportan conexiones de red, y habría que confirmarlo en la norma. El módulo genérico de Probots solo dice "UL94V-0" ([Probots](https://probots.co.in/iec-c14-3-pin-ac-power-socket-fuse-switch-snap-fit.html)), que es otra cosa (clasificación de llama del material, no el ensayo de hilo incandescente). Mi recuerdo de la cláusula y la temperatura (30.2.3, 750 °C) **no está verificado**.

### 3.2 Fichas de referencia

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Schurter KD, entrada C14 con portafusibles de 1-2 polos, interruptor de 2 polos y selector de tensión | PG05, 17-06-2014 | PDF | [Farnell 1830753](https://www.farnell.com/datasheets/1830753.pdf) |
| Schurter KD (versión posterior) | PG05, 08-05-2017 | PDF | [Farnell 2351262](https://www.farnell.com/datasheets/2351262.pdf) |
| Schurter KG | PG05 KG | PDF | [Farnell 2349197](https://www.farnell.com/datasheets/2349197.pdf) · [Farnell 2111230](https://www.farnell.com/datasheets/2111230.pdf) |
| Schurter, C14 con interruptor de 2 polos y clip (serie 4793) | Documento "KM01.1205.11" de RS (la ficha del producto es la KM01.1105.11: confirma que cubre tu pieza) | PDF | [RS](https://docs.rs-online.com/07e0/A700000008623303.pdf) · [producto](https://es.rs-online.com/web/p/products/4982647) |
| Schurter 6202, inlet C18 con portafusibles de 1 polo | 6202 | Web | [Schurter](https://at.schurter.com/en/datasheet/6202) |
| Bulgin, catálogo Polysnap (módulos con fusible, interruptor y neón) | BZV, Polyflange | PDF | [Farnell 625732](https://www.farnell.com/datasheets/625732.pdf) · [Farnell 308323](https://www.farnell.com/datasheets/308323.pdf) |
| Bulgin, catálogo de entradas y salidas IEC (PF, PX) | — | PDF | [RS](https://docs.rs-online.com/713f/A700000008622360.pdf) |
| Bulgin BZH01/Z0000/02 (C14, interruptor unipolar con neón, fusible) | 23-3226 | PDF | [Rapid](https://static.rapidonline.com/pdf/23-3226_v1.pdf) |
| RS PRO EMI-13 (C14, fusible, DPST) | RS 811-7229 | PDF | [RS](https://docs.rs-online.com/cba3/0900766b815867ba.pdf) |
| RS PRO EMI-21 (C14 con fusible, sin interruptor) | RS 811-7213 | PDF | [RS](https://docs.rs-online.com/2742/0900766b815867af.pdf) |
| Beta Layout KES 1SI (C14 con fusible de 6,3 A, 4,8 mm) | RK-10817 | PDF | [Beta Layout](https://de.beta-layout.com/download/rk/RK-10817_882.pdf) |
| Littelfuse serie 215 (5×20 retardado, cerámico) | 215 | PDF | [Littelfuse](https://littelfuse.com/%7E/media/electronics/datasheets/fuses/littelfuse_fuse_215_datasheet.pdf.pdf) |
| ENEC: uso indebido de la marca | — | Web | [enec.com](https://enec.com/misusing-the-enec-mark/) |
| ENEC: verificar un certificado | — | Web | [buscador](https://enec.com/search-enec-certificates/) |
| VDE: uso ilegal de la marca | — | Web | [VDE](https://www2.vde.com/en/Institute/OnlineService/VDE-approved-products/Pages/Unlawful_use.aspx) |

### 3.3 Marcas de certificación: qué significan y cómo desconfiar

| Marca | Qué es | Fuente |
|---|---|---|
| **ENEC** | Marca europea que indica que un organismo certificó el producto (ensayo, inspección y certificación) según la norma EN aplicable. Se muestra con un número de identificación. Las entradas IEC de Bulgin figuran como "VDE, ENEC, UL, CSA" | [ETICS](https://enec.com/misusing-the-enec-mark/), [Bulgin](https://docs.rs-online.com/713f/A700000008622360.pdf) |
| **VDE** | Marca del instituto VDE. VDE dice que hace inspecciones periódicas de fábrica y ensayos de muestras de producción y de mercado, y que persigue el uso ilegal de la marca | [VDE](https://www2.vde.com/en/Institute/OnlineService/VDE-approved-products/Pages/Unlawful_use.aspx) |
| **UL (cURus, "UR")** | Reconocimiento de componente de UL. Los datasheets de Schurter dan un número de archivo (E93617) | [Schurter KD](https://www.farnell.com/datasheets/1830753.pdf) |
| **CE** | Declaración del fabricante bajo las directivas. **No es un ensayo de seguridad hecho por un tercero** (mío). En un componente suelto no prueba nada. Un foro de instaladores de EE. UU. opina que el CE no equivale al UL ([Mike Holt](https://forums.mikeholt.com/threads/certs.142888/)); es una opinión de foro, no una fuente técnica | — |
| **TÜV** | **No he encontrado fuente** sobre esta marca en módulos C14. Solo vale con número de certificado verificable | — |

**Cómo reconocer un módulo sin certificar o con marcas falsas (mío, apoyado en las fuentes)**

- La marca real lleva **número de licencia o de archivo**. ETICS considera uso indebido mostrar la marca ENEC sin su número de identificación o sin certificado válido ([ETICS](https://enec.com/misusing-the-enec-mark/)). Busca ese número en el [buscador de ENEC](https://enec.com/search-enec-certificates/) y comprueba que el fabricante y el modelo coinciden. UL pide lo mismo con el número de archivo y su base de datos ([Mike Holt](https://forums.mikeholt.com/threads/certs.142888/)).
- Los listados con una **lista de siglas sin números** (por ejemplo "CE, UL, IEC, EC, ULC, CCC, VDE") son sospechosos. El módulo [MUZHI en desertcart](https://www.desertcart.nl/products/179347998) los cita así, sin ningún certificado.
- Los certificados falsos existen: UL Demko publicó en 2022 el aviso de una licencia ENEC 15 falsificada para una luminaria viaria ([carta](https://etics.org/doc/doc_20368_main1_ENEC+%20Fradulent%20ENEC-01983-PLUS-UL_UL%20Demko%202022-08-10%281%29.pdf)). No era un módulo C14, pero sirve de ejemplo.
- Los fabricantes serios publican un datasheet con dibujo, esquema de patillas y rigidez dieléctrica (Schurter, Bulgin). Si el anuncio no enlaza nada parecido, trátalo como módulo sin certificar (mío).
- Etiquetas con faltas de ortografía en el nombre del certificador, marcas deformadas o impresión borrosa son señales de falsificación ([IAEI](https://iaeimagazine.org/?p=12984), artículo de Intertek de 2014).

## 4. Esquema interno y cómo identificarlo

### 4.1 Lo que dicen las fuentes

- **Módulo certificado, bipolar (Schurter KD/KG).** Interruptor de 2 polos y portafusibles de 1 o 2 polos. El esquema de la variante de 1 polo funde un conductor de línea; el de 2 polos funde L y N. Los terminales de entrada son L, N y PE, y los de salida L', N' y PE'. Los elementos individuales vienen ya cableados entre sí ([KD](https://www.farnell.com/datasheets/1830753.pdf), [KG](https://www.farnell.com/datasheets/2349197.pdf), [serie con clip](https://docs.rs-online.com/07e0/A700000008623303.pdf)).
- **Módulo certificado, unipolar con luz (Bulgin BZH01).** Interruptor unipolar con neón, un portafusibles y tres faston de 6,3 mm. Según una pregunta en la tienda (fuente secundaria), los pines 1 y 2 son el contacto del interruptor y el 3 es el neutro para el neón ([Rapid](https://rapidonline.com/bulgin-bzh01-z0000-02-horizontal-neon-sp-fused-inlet-23-3226)).
- **Iluminación de interruptores (e-switch).** Hay tres tipos: independiente (la luz va con su propia alimentación), dependiente (la luz va con la misma fuente que el interruptor) y semiindependiente (comparten un terminal) ([e-switch en Mouser](https://lv.mouser.com/pdfDocs/ptmscript_rockerswitches.pdf)).
- **Módulos genéricos.** Las descripciones se contradicen. [Probots](https://probots.co.in/iec-c14-3-pin-ac-power-socket-fuse-switch-snap-fit.html) e [Improvium](https://improvium.odoo.com/en/shop/fused-rocker-power-inlet-iec-320-c14-10a-red-switch-with-fuse-1627) llaman DPST a un interruptor de 4 pines. [BuildYourCNC](https://buildyourcnc.com/products/ac-power-connector-c14-male-3-pins-screw-panel-mount-10a-250v-iec-320-with-fuse-and-switch) lo llama SPST y a la vez habla de corte bipolar. [Cirkit Designer](https://docs.cirkitdesigner.com/component/516c8da1-0c90-4d3d-89f2-7a7d0c86a461/rocker-switch-fused-iec-320-c14-inlet-power) describe un SPST con el fusible solo en la línea. Probots dice que la línea está unida internamente a un lado del portafusibles. Ninguno publica un esquema que pueda leer.
- **Reseña** (desertcart, JulyPanny): la corriente pasa por el fusible, y el interruptor se puede usar o puentear según el cableado ([reseña](https://www.desertcart.co.za/products/17152458)). Es la opinión de un comprador.

**Conclusión de las fuentes:** no hay una forma estándar de saber, por el anuncio, qué polo lleva el fusible ni cuántos polos corta el interruptor. Tiene que decidirlo la medida.

### 4.2 Esquemas de principio por número de pines (mío, sin fuente primaria)

Es la regla habitual de terminales. No la he podido confirmar con una hoja de datos y hay excepciones. Sirve para entender qué esperar.

| Pines | ¿Lámpara? | Qué suele ser | Polos que corta |
|---|---|---|---|
| 2 | No | SPST | 1 |
| 3 | Sí | SPST con la lámpara compartiendo un terminal (el esquema del Bulgin BZH01) | 1 |
| **4** | **No** | DPST | **2** |
| **4** | **Sí** | **SPST más lámpara independiente (2 contactos + 2 de lámpara).** Un DPST con la lámpara dentro es posible, pero no lo he visto documentado | **1 (lo habitual)** |
| 6 | Sí | DPST más lámpara (4 contactos + 2 de lámpara), o DPDT según el modelo | 2 |

Esquemas de principio:

```
A) 4 pines con luz, unipolar (una de las dos posibilidades con "LED de 4 pines")

   1 ──/──── 2            contacto del interruptor (1 polo)
   3 ─[lámpara]─ 4        lámpara aparte: neón, o LED con resistencia

   Los pines 3 y 4 NO son un segundo polo. Van entre la salida del
   interruptor y N (la luz se enciende con el interruptor en ON) o entre la
   entrada y N (luz siempre encendida si hay red). La lámpara tiene que ser
   de 230 V (viene marcado).

B) 4 pines sin luz, bipolar (DPST)

   1 ──/──── 2            polo A (L)
   3 ──/──── 4            polo B (N)

C) 6 pines con luz, bipolar

   1 ──/──── 2            polo A
   3 ──/──── 4            polo B
   5 ─[lámpara]─ 6        lámpara
```

Y la parte del fusible en un módulo "3 en 1" típico (mío, sin confirmar):

```
 C14, parte trasera
 L? ───────┬── (clip del portafusibles) ── fusible ── (clip) ── terminal "salida"  ──► interruptor ──► a la fuente
 N? ───────┴────────────────────────────────────────────────────────────────────────► (directo, o por el 2º polo si es bipolar)
 PE ────────────────────────────────────────────────────────────────────────────────► tierra del chasis
```

**Importante:** la etiqueta "L" o "N" del vendedor no vale como dato de seguridad, porque el enchufe Schuko es reversible (apartado 5).

### 4.3 Cómo identificar el módulo con el polímetro (mío)

Se hace con el módulo suelto, **sin tensión y sin enchufar**, con el fusible puesto (conviene el T2,5A definitivo).

1. **Fotografía y numera** los terminales de la parte trasera. Apunta tamaño de lengüeta, marcas del cuerpo y de la caja del interruptor.
2. **Interruptor.** Con el polímetro en continuidad, mide entre cada par de terminales del interruptor con él en OFF y en ON. Los pares que cierran en ON son los polos. **Dos pares cerrando = bipolar. Un par = unipolar.**
3. **Lámpara.** Los terminales que no cierran nunca y dan una resistencia alta (cientos de kΩ o más) son la lámpara. Busca su tensión marcada en el cuerpo del interruptor: tiene que ser de 230 V. Una lámpara de 12 V conectada a red se quema.
4. **Fusible.** Mide entre cada pin del C14 y los terminales del portafusibles, con y sin fusible. Cierra solo con fusible puesto = ese es el polo con fusible. Si ningún pin del C14 va a un clip, el cableado es externo y lo decides tú.
5. **Aislamiento entre polos.** Entre L y N del C14 no debe haber continuidad en ninguna posición, y entre los terminales de un polo y los del otro (o los de la lámpara) tampoco.
6. **Tierra.** Mide entre el pin de tierra del C14 (el central) y su terminal faston. Repítelo con el cordón C13 (#17) enchufado, entre el contacto de tierra de su clavija Schuko y ese terminal, restando la resistencia del cable. El cuerpo es de plástico: la tierra del módulo es solo ese terminal.
7. **Dibuja el esquema real** y comprueba que coincide con tu guía antes de cablear. Si es unipolar, la guía §5.1 no vale tal como está escrita (apartado 10).

## 5. Fusible, polaridad y corte unipolar o bipolar

Esta es la parte que más importa para la seguridad. Separo lo que he podido leer de lo mío.

### 5.1 El hecho de partida

El enchufe Schuko es simétrico y se puede insertar de las dos maneras. Las bases Schuko no están polarizadas: no hay forma de distinguir cuál de los dos contactos es la fase si no se mide ([Wikipedia: Schuko](https://en.wikipedia.org/wiki/Schuko)). El intento de normalizar la polaridad (IEC 60906-1) solo se adoptó en Sudáfrica y Brasil (misma fuente). **Por tanto, con tu cable Schuko-C13 (#17) no hay garantía de qué conductor del módulo es la fase.** Un hilo de foro británico apunta lo mismo: en la práctica, la inversión puede dejar un fusible primario en el neutro ([ECN](https://www.electrical-contractor.net/forums/ubbthreads.php/topics/133955.html), foro).

### 5.2 Qué protege cada elemento (mi análisis, con las fuentes que lo respaldan)

Un módulo con un solo fusible es la columna 1 o la columna 2, según cómo se enchufe el Schuko. No se puede saber cuál.

| Situación | 1. Fusible solo en el neutro | 2. Fusible solo en la fase | 3. Un fusible en cada polo |
|---|---|---|---|
| Cortocircuito o sobrecarga entre L y N dentro de la máquina | Corta. La corriente es la misma en los dos conductores | Corta | Corta |
| Fallo de aislamiento de la fase al chasis (tierra) | **No ve esa corriente.** La corta el magnetotérmico o el diferencial del local | Corta | Corta |
| Se abre un fusible por sobrecorriente: ¿queda la fase conectada al interior? | **Sí** | No | Depende de cuál abra primero. Puede ser el del neutro |

Fuentes: el artículo de Richard Nute en InCompliance (1990) dice que un solo fusible protege del sobrecalentamiento sea cual sea el polo cableado ([InCompliance](https://incompliancemag.com/the-use-of-overcurrent-protection-in-plug-and-socket-connected-equipment/)). Otro artículo de InCompliance dice que el fusible del neutro es redundante ante un cortocircuito L-N y **no hace nada ante un fallo de fase a tierra**, y que el doble fusible importa sobre todo cuando la polaridad se puede invertir. También propone, para equipo monofásico con enchufe, un fusible de fase ajustado a la carga y otro de neutro un escalón mayor, y avisa de que algunas autoridades consideran no conforme cualquier fusible en el neutro ([InCompliance](https://incompliancemag.com/double-fusing-or-fusing-both-sides-of-the-line/)). En un foro alemán, un participante recuerda que la corriente circula por los dos conductores, de modo que cortar un polo basta como protección de sobreintensidad ([mikrocontroller.net](https://www.mikrocontroller.net/topic/563613)). TDK-Lambda y Electropages dicen que el doble fusible garantiza la protección completa si se invierte la polaridad, y que con doble fusible hay un 50 % de probabilidades de que abra el del neutro, con el riesgo de que un técnico crea que no hay tensión ([TDK-Lambda](https://www.us.lambda.tdk.com/resources/blogs/201907.html), [Electropages](https://www.electropages.com/2017/08/when-is-dual-fusing-in-power-supplies-dangerous/)). Ese riesgo lo señalan para equipos de conexión fija, no para los de enchufe.

### 5.3 El interruptor

- Un **interruptor unipolar puede quedar en el neutro**. Con él en OFF, la fase sigue llegando a la fuente y a todo lo que cuelga de ella. Un hilo de ECN lo describe como el riesgo principal ([ECN](https://www.electrical-contractor.net/forums/ubbthreads.php/topics/133955.html)) y uno de woodworker.de, con una lámpara de pie, también ([woodworker.de](https://www.woodworker.de/forum/goto/post?id=535032)). Son foros, no normas.
- En el mismo hilo alemán se menciona una etiqueta "Spannungsfrei nur nach Ziehen des Netzsteckers" (sin tensión solo tras desenchufar) y se afirma que la norma solo exige esa etiqueta. Se pide la fuente y no se da. **No lo doy por cierto.**
- Otros foros repiten las mismas ideas sin citar ninguna cláusula. En un hilo de eng-tips sobre un cuadro de control con Schuko, el autor se inclina, de forma provisional, por interruptores bipolares y pide que lo revise el laboratorio de ensayos ([eng-tips](https://www.eng-tips.com/viewthread.cfm?qid=503148)). En Amp Garage un participante dice que, sin polaridad en la base, un fusible en un solo lado estaría en el polo equivocado la mitad de las veces, y en Mike Holt otro dice que nunca se puede estar seguro al 100 % de la polaridad ([Amp Garage](https://ampgarage.com/forum/viewtopic.php?p=403726), [Mike Holt](https://forums.mikeholt.com/threads/double-fusing-for-equipment-connected-via-plug.113956)).
- Para esta máquina, una sola desconexión por interruptor no es el aislamiento que importa. Lo que de verdad aísla es **desenchufar el cable** (mío).

### 5.4 Qué dicen las normas (lo que he podido leer y lo que no)

| Norma o guía | Qué he podido leer | Resultado |
|---|---|---|
| **EN 60335-1 / EN IEC 60335-2-82** (las que aplican a la máquina según la guía) | Solo el alcance de la parte 2-82 ([EVS](https://evs.ee/en/evs-en-iec-60335-2-82-2022)). **No he podido leer ninguna cláusula** | **Sin verificar.** No puedo decir qué exigen sobre corte omnipolar ni sobre fusible en aparatos con enchufe reversible |
| **IEC 60364 / REBT (ITC-BT)** | IEC 60364-4-43:2008 está **retirada desde el 19-07-2023** y sustituida por la edición 4 de 2023 ([genorma](https://genorma.com/en/standards/iec-60364-4-43-2008-ed3)). ITC-BT-19 no se abrió | Estas normas regulan la **instalación fija**, no el aparato. Tres fuentes secundarias (TDK-Lambda, Electropages, InCompliance) dicen que IEC 364 y los reglamentos de instalaciones **prohíben fusibles en el neutro** en edificios y en equipo conectado de forma fija. Para equipo con enchufe solo hay la discusión de InCompliance citada arriba |
| **IEC 60601-1** (medicina) | Solo por fuentes secundarias | Se dice que exige fusibles en ambos polos para equipo médico ([mikrocontroller.net](https://www.mikrocontroller.net/topic/563613), [AAC](https://forum.allaboutcircuits.com/threads/fusing-neutrals.160774/), [TDK-Lambda](https://www.us.lambda.tdk.com/resources/blogs/201907.html)), sin cláusula. **No aplica a este proyecto** |
| **IEC 60950-1 / 62368-1** (equipos de oficina y audio) | Solo un comentario en foro ([AAC](https://forum.allaboutcircuits.com/threads/fusing-neutrals.160774/)) que dice que 60950-1 permite fusible en el neutro con un aviso marcado | **Sin verificar.** Ningún artículo que abrí cita cláusula |
| **EN 60204-1** (maquinaria) | Un participante de AAC dice que desaconseja el fusible en el neutro, sin cláusula | **Sin verificar** |

**Lo que sí puedo decir:** en las fuentes que he podido leer **no hay ninguna que imponga fusible o corte bipolar a una máquina de clase I conectada por enchufe, fuera del equipo médico**. El hilo de mikrocontroller.net llega a la misma conclusión: lo exige la medicina, y nadie aporta una cláusula para otros equipos. Eso **no demuestra que no exista tal exigencia en EN 60335-1 o en la parte 2-82**: tiene que leerlas quien haga el análisis de riesgos de la máquina (la guía §9 ya lo pide).

### 5.5 Mi lectura (rotulada como mía)

1. Para una máquina de bar de clase I con carcasa metálica y enchufe Schuko, lo prudente es **fusible y corte en los dos polos**. Es lo que recomiendan varios participantes de foros para carcasas metálicas ([mikrocontroller.net](https://www.mikrocontroller.net/topic/563613)) y lo que ofrecen los módulos certificados (Schurter con fusible de 2 polos; Bulgin con doble fusible: [Schurter KD](https://www.farnell.com/datasheets/1830753.pdf), [Bulgin](https://www.farnell.com/datasheets/625732.pdf)).
2. Con un módulo de fusible único y tierra bien hecha, el riesgo restante es el fallo fase-chasis con el fusible en el neutro. La corriente de fallo circula entonces por la tierra y la corta el magnetotérmico o el diferencial del local, no el fusible de la máquina. Si la tierra falla, el chasis queda con tensión. Con **tierra de buena calidad** (apartado 8) y **diferencial de 30 mA** aguas arriba, el riesgo baja mucho, pero **no sé si los bares donde se instale lo tienen**. Pregúntalo antes de instalar.
3. El interruptor no es el aislamiento. Rotula la máquina: "Desconectar el cable de red antes de abrir" (la fase puede seguir dentro con el interruptor en OFF).
4. Si el interruptor es **unipolar**, la luz del interruptor no demuestra que el neutro esté cortado.

## 6. Instalación y cableado

### 6.1 Fijación en la chapa

- **Recorte:** mide el módulo real con calibre antes de cortar la chapa. Las cifras de las fuentes (47 × 27-28 mm, apartado 2.3) no coinciden con la de 27,5 × 48,5 mm que circula como ventana típica. Haz un **recorte de prueba con la misma chapa** (2 mm o 2,6 mm) antes de la tirada.
- **Clip o tornillos:** con 2-2,6 mm de acero, los clips de módulos genéricos (1 mm en MWMS, 0,8-2,5 mm en RS PRO) pueden quedar flojos o no entrar. Schurter cubre hasta 2,5 mm con clip (no llega a 2,6) y hasta 8 mm con tornillos M3 a 0,5 Nm máximo ([KD](https://www.farnell.com/datasheets/1830753.pdf)). Bulgin tiene versiones para 3 mm ([catálogo](https://docs.rs-online.com/713f/A700000008622360.pdf)). **Mi consejo:** módulo con tornillos si es posible.
- **Fuerzas:** el C14 aguanta la inserción y la extracción del C13 cada vez que se enchufa. Con un clip flojo, el módulo se mueve y tira de los faston. Prueba el módulo montado: empuja y tira del conector con el cable puesto.
- **Parte trasera:** los módulos genéricos suelen no llevar tapa: los terminales quedan al aire y la tienda recomienda termorretráctil ([Probots](https://probots.co.in/iec-c14-3-pin-ac-power-socket-fuse-switch-snap-fit.html)). Los terminales que no uses (por ejemplo los de lámpara) deben quedar cubiertos.
- **Fusible:** el portafusibles tiene que ser **seguro contra contacto** (no se puede abrir con el cable enchufado). El cajón de Probots, según su apartado de preguntas, se abre con un destornillador pequeño aunque el cable esté enchufado ([Probots](https://probots.co.in/iec-c14-3-pin-ac-power-socket-fuse-switch-snap-fit.html)). Schurter lo evita (hay que quitar antes el enchufe: [6202](https://at.schurter.com/en/datasheet/6202)). Como el C14 está en la trasera y accesible desde fuera, **esta prueba es obligada**.

### 6.2 Terminales faston

- **Tamaño:** los genéricos y Schurter usan 4,8 × 0,8 mm (apartado 2.3). Bulgin usa 2,8, 4,8 o 6,3 mm según versión ([catálogo](https://docs.rs-online.com/713f/A700000008622360.pdf)). **No he podido verificar el tamaño de tu módulo.** La idea de que estos módulos "suelen llevar 6,3 mm" no la respalda ninguna fuente que haya abierto.
- **Grosor de la lengüeta (mío):** hay lengüetas de 0,5 y de 0,8 mm. Un receptáculo hecho para 0,5 mm en una lengüeta de 0,8 mm entra a la fuerza y se deforma. Uno de 0,8 en una de 0,5 queda flojo. La ficha del kit (#27) debe decir qué grosor lleva. Si no coinciden, no uses esos faston en el módulo.
- **Sección (mío):** el cable de 1,5 mm² está en el límite entre los terminales aislados "rojos" (0,5-1,5 mm²) y "azules" (1,5-2,5 mm²) del código de colores habitual. Mira el embalaje del kit: el barril debe cerrar sobre el cobre sin sobrar, y la garra del aislante debe agarrar el aislante del cable.
- **Crimpado (mío):** se crimpa con una crimpadora de **terminales aislados** con matriz que cierre barril y aislante. Mi impresión es que las crimpadoras "autoajustables" de punteras no siempre sirven para faston aislados, pero **no lo he comprobado**: mira la ficha del #28. No se suelda el cobre del barril.
- **Tirón (mío):** tras crimpar, tira firme a mano de cada terminal. Si el cable sale, se descarta. De memoria, la norma de conexiones crimpadas es IEC 60352-2 y UL 486A-B las prueba por tracción; **no las he leído** y no puedo dar valores.
- **Lengüetas de retención:** en un terminal con vibración, el receptáculo con lengüeta de enclavamiento es preferible. El módulo irá en una máquina de bar con golpes y vibración por el uso (mío).

### 6.3 El cable de 230 V

- **Esquema de la guía (§5.1):** los hilos marrón y azul van entre el C14, el interruptor y la LRS-50-5. Funciona si el interruptor es bipolar y si coincide con tu esquema medido (apartado 4.3). Si no, hay que redibujarlo.
- **Tierra:** el pin de tierra del C14 va al espárrago con un hilo verde-amarillo **más largo** que L y N, para que si alguien tira sea lo último que se suelte (guía §5.1).
- **Sujeción de los hilos (mío):** asegura el haz con una brida a un punto fijo de la trasera, a pocos centímetros de los terminales, para que cualquier tirón no llegue a los faston.

### 6.4 ¿El conector C13 hace de anclaje del cable?

La guía (§2.7) dice que con una C14 el cable es desmontable, que "el propio conector C13 hace de anclaje" y que no hace falta prensaestopas. **No he encontrado una fuente primaria que lo diga así.** Lo que sí puedo apoyar en fuentes y en razonamiento mío:

- El cable de red entra en la máquina por un conector separable (C13) que encaja en el C14 ([Wikipedia](https://en.wikipedia.org/wiki/IEC_60320)). No hay un cable fijado a la máquina, así que no hay nada que anclar con prensaestopas (mío). El alivio de tensión del cable flexible está en la pieza moldeada del conector C13, que es parte del cordón (#17). Que el cordón esté bien moldeado y marcado es lo que hay que comprobar en su ficha.
- Un tirón del cable lo resisten el rozamiento del C13 en el C14 y, a través de él, la fijación del módulo a la chapa (mío). Por eso importa la fijación (apartado 6.1): un clip flojo traspasaría el esfuerzo a los hilos y los faston. Si el tirón saca el conector, el esfuerzo desaparece.
- Algunos fabricantes ofrecen clips de retención para evitar la desconexión accidental ([Bulgin: KT0006, KT0009, KT0012](https://docs.rs-online.com/713f/A700000008622360.pdf)). Son para sus entradas, no para el módulo de Amazon.

Conclusión mía: la afirmación de la guía es razonable, con la condición de que el módulo vaya bien fijado y los hilos bien sujetos dentro.

## 7. Fallos, bugs y problemas conocidos

La base de evidencia es **escasa**: no he encontrado reseñas técnicas, foros ni retiradas sobre este anuncio en concreto, y mi presupuesto de búsquedas se agotó. Lo que sigue combina lo que sí encontré con riesgos plausibles (rotulados como míos).

| # | Problema | Gravedad para el proyecto | Fuente |
|---|---|---|---|
| 1 | Sin certificación de terceros | Alta | Varias fichas, abajo |
| 2 | Interruptor de "4 pines" posiblemente unipolar | Alta | Apartado 4 |
| 3 | Fusible en un solo polo, polaridad indeterminada | Media-alta | Apartado 5 |
| 4 | Portafusibles que se abre con el cable enchufado | Alta si se confirma | Probots |
| 5 | Sin tapa trasera: terminales al aire | Media-alta | Probots |
| 6 | Clip no válido para 2-2,6 mm de chapa | Media-alta | MWMS, RS PRO |
| 7 | Conexión floja que calienta o forma arco | Alta (consecuencia) | Caso Vesuvius |
| 8 | Fusible de 10 A que no protege al interruptor de 6 A | Media | Anuncio |
| 9 | Pico de arranque de 45 A sobre un interruptor sin clase "inrush" | Media | Mío |
| 10 | Material posiblemente sin ensayo de hilo incandescente | Media | Schurter (mío) |
| 11 | Marcas de certificación falsas o sin número | Media | MUZHI |
| 12 | Anuncio contradictorio: "fusible incluido" o no | Baja | Probots, desertcart |
| 13 | Desgaste del interruptor | Baja | woodworker.de |
| 14 | Neón o LED que parpadea, chispas, soldaduras frías, fusible que se sale, tierra sin continuidad | Sin fuente | Mío |

### 7.1 Sin certificación (gravedad alta)

Los módulos comparables o no declaran aprobaciones o se declaran "autocertificados": [RS PRO EMI-13 y EMI-21](https://docs.rs-online.com/cba3/0900766b815867ba.pdf), [Probots](https://probots.co.in/iec-c14-3-pin-ac-power-socket-fuse-switch-snap-fit.html) (los controles "Safety-First verified" y "Lab Verified" son propios de la tienda), [MWMS](https://www.kaufland.at/product/470137149/), [BuildYourCNC](https://buildyourcnc.com/products/ac-power-connector-c14-male-3-pins-screw-panel-mount-10a-250v-iec-320-with-fuse-and-switch), [Besomi](https://besomi.com/jo_en/srsx0208-iec320-c14power-socket-with-switch-function-and-fuse-holder.html) y [Maplin](https://pro.maplin.co.uk/products/c14-iec-fused-and-switched-inlet). Schurter publica números de VDE y UL en sus fichas y Bulgin lista VDE, ENEC, UL y CSA (sin números en el catálogo). Sin aprobaciones no hay garantía de ensayos de calentamiento, rigidez, distancias de fuga ni hilo incandescente. **No sé si tu módulo concreto está certificado**: el anuncio no lo he visto. Si lo estuviera, el número tendría que figurar en el cuerpo.

### 7.2 Interruptor y fusible: topología desconocida

Ver apartados 4 y 5. Resumen: en módulos parecidos conviven descripciones de SPST y de DPST para el mismo tipo de pieza, y el polo que lleva el fusible no se indica en ninguna. Ni la ficha de [Maplin](https://pro.maplin.co.uk/products/c14-iec-fused-and-switched-inlet) ni el catálogo de [Bulgin](https://docs.rs-online.com/713f/A700000008622360.pdf) dicen qué polo lleva el fusible.

### 7.3 Portafusibles y tapa trasera

[Probots](https://probots.co.in/iec-c14-3-pin-ac-power-socket-fuse-switch-snap-fit.html) describe un módulo sin tapa trasera y con un cajón de fusible que, según su apartado de preguntas, se abre con un destornillador pequeño aunque el cable esté enchufado. La misma tienda recomienda desenchufar el cable para cablear y cubrir los terminales con termorretráctil. Es un módulo de la misma clase que el tuyo, pero no el tuyo. **Hay que probarlo en el tuyo.**

### 7.4 Fijación en la chapa

MWMS indica clip para chapa de 1 mm ([enlace](https://www.kaufland.at/product/470137149/)) y RS PRO, de 0,8 a 2,5 mm ([ficha](https://docs.rs-online.com/cba3/0900766b815867ba.pdf)). Con una chapa de 2 a 2,6 mm el resultado depende del modelo. Los fabricantes serios venden el clip por espesor (Bulgin 1/1,5/2/3 mm, Schurter 1,5/2/2,5 mm). Una reseña de [desertcart](https://www.desertcart.co.za/products/17152458) (módulo JulyPanny) avisa de una **brida estrecha**, que deja ver un recorte demasiado ancho. Otra reseña, de otro módulo ([RuoFeng](https://www.desertcart.com.cy/products/69895561)), dice que el marco incluido esconde un corte impreciso.

### 7.5 Conexión floja, calor y arco (caso real)

En una máquina de café, el pin de neutro suelto del conector IEC de entrada produjo un arco que carbonizó el conector, lo puso a tierra y disparó el diferencial. El autor sospecha que el conector (ya un recambio) tenía un puente remachado propenso a quemarse y que la causa fue una conexión floja, no una sobrecorriente ([foro Vesuvius](https://www.tapatalk.com/groups/vesuvius/power-inlet-problem-and-solution-s-t475.html)). Es una sola anécdota, de un aparato más cargado que el tuyo (una máquina de café consume mucho más), pero ilustra el modo de fallo que más preocupa en estos módulos: **un terminal flojo con carga se calienta**. Con unos 0,1-0,5 A el riesgo es mucho menor, pero vibración y años de uso en un bar pueden aflojar contactos (mío).

### 7.6 Fusible de 10 A

Con un fusible de 10 A, el interruptor de 6 A queda sin proteger ante una sobrecarga entre 6 y 10 A, y la fuente (que consume décimas de amperio) tampoco queda protegida de un fallo interno moderado (mío). La guía lo corrige con un T2,5A cerámico (#16). Hay además contradicciones sobre si el fusible viene o no en el módulo: Probots dice que **no** se incluye ([Probots](https://probots.co.in/iec-c14-3-pin-ac-power-socket-fuse-switch-snap-fit.html)); una reseña dice que sí y otra que no ([desertcart](https://www.desertcart.co.za/products/17152458)); MWMS trae uno de reserva ([Kaufland](https://www.kaufland.at/product/470137149/)).

**Cajón de fusible y fusible cerámico.** MWMS indica que se usen solo fusibles de vidrio de 250 V ([Kaufland](https://www.kaufland.at/product/470137149/)). No sé el motivo ni la medida de su cajón (los 5×20 de cerámica y de vidrio tienen las mismas dimensiones). Si tu módulo dice lo mismo, consúltalo con el vendedor antes de poner el cerámico, y comprueba que entra y hace buen contacto con las dos pinzas.

**Comprobación del T2,5A (datos de Littelfuse 215, que es una referencia y no el fusible de Amazon):** 2,5 A, resistencia nominal en frío 0,0386 Ω, caída máxima de 180 mV a la corriente nominal, I²t de fusión 22,29 A²s, poder de corte 1500 A a 250 V, tiempos de apertura de 0,75-80 s a 2,75 × In y de 10-150 ms a 10 × In ([datasheet](https://littelfuse.com/%7E/media/electronics/datasheets/fuses/littelfuse_fuse_215_datasheet.pdf.pdf)). La guía de fusibles de Littelfuse recomienda que la I²t del pulso sea como máximo el 20 % de la I²t de fusión, no pasar del 75 % de la corriente nominal en continuo y limitar el portafusibles al 60 % de su valor nominal ([Fuseology Design Guide](https://info.littelfuse.com/hubfs/Fuseology%20Design%20Guide.pdf)). **Mis cuentas:** con los 1,5 A²s del arranque que da la guía (sin verificar por mí; ficha #14), el límite del 20 % de 22,29 A²s son 4,46 A²s. Cumple. En continuo, el 75 % de 2,5 A son 1,9 A, muy por encima de la corriente de la fuente. La caída en el fusible es de unos 0,04 V a 1 A (0,0386 Ω × 1 A), es decir, unos 0,04 W en el portafusibles.

### 7.7 Pico de arranque sobre el interruptor (mío)

La LRS-50-5 tiene un pico de arranque de 45 A a 230 V según la guía (ficha #14). Es una corriente breve, pero cada encendido la aplica sobre los contactos del interruptor de 6 A. Bulgin vende interruptores específicos "high inrush" (85 A según EN 61058-1 o 150 A según IEC 65: [catálogo](https://www.farnell.com/datasheets/625732.pdf)). Mi lectura es que existen porque el pico de arranque de las fuentes conmutadas castiga a los interruptores normales; el catálogo no lo explica. **No tengo datos del interruptor de tu módulo.** Mitigación: la máquina se puede dejar siempre conectada y el interruptor casi no se usa (la guía ya avisa de no encender y apagar seguido).

### 7.8 Resistencia al fuego del material (mío, con una fuente de Schurter)

Schurter menciona los requisitos de hilo incandescente de IEC 60335-1 para uso sin vigilancia ([6202](https://at.schurter.com/en/datasheet/6202)). Probots solo declara UL94V-0 para el plástico ([Probots](https://probots.co.in/iec-c14-3-pin-ac-power-socket-fuse-switch-snap-fit.html)). No sé si el módulo de Amazon pasa el ensayo; el análisis de riesgos de la máquina tendrá que decidir si hace falta ensayarlo.

### 7.9 Marcas dudosas

El listado de [MUZHI](https://www.desertcart.nl/products/179347998) cita "CE, UL, IEC, EC, ULC, CCC, VDE" sin números ni certificados. Es un ejemplo del tipo de afirmación que no hay que dar por válida (apartado 3.3).

### 7.10 Fallos que no he podido documentar

No he encontrado fuentes, y por tanto **no afirmo**, sobre: neón o LED del interruptor que parpadea; chispas al accionar; soldaduras frías en las pestañas; fusibles que se salen del cajetín; módulos cuyo fusible no corta el polo previsto; tierra sin continuidad con el soporte metálico; contactos que se aflojan con los años; retiradas de CPSC o de Safety Gate de módulos C14 con interruptor (mis dos búsquedas devolvieron solo resultados de otras categorías, y el portal de Safety Gate no lo abrí). Son riesgos plausibles (míos) y la lista del apartado 8 está pensada para detectarlos.

Una sola referencia de duración: un participante de woodworker.de cuenta que los interruptores corrientes aguantan solo unos 2-3 años con uso frecuente ([woodworker.de](https://www.woodworker.de/forum/goto/post?id=535032)). Es una opinión de foro. En esta máquina el interruptor casi no se acciona.

## 8. Qué comprobar al recibirlo

Hazlo **antes de montar**, con el módulo suelto y sin tensión. Compra dos o tres unidades (7,70 € cada una): una sirve para abrir y mirar por dentro, y otra para el recambio.

### 8.1 Inspección visual y mecánica

| Qué mirar | Aceptable | Fuente |
|---|---|---|
| Marcado en el cuerpo | Tensión, corriente y **marca de certificación con número** | Mío |
| Dimensiones | Contra calibre: brida, fondo, tamaño de faston y grosor de la lengüeta | Apartado 2.3 |
| Cuerpo | Sin rebabas, grietas ni plástico deformado. Lengüetas firmes y rectas | Mío |
| Fusible incluido | Anota su marca y calibre. Se sustituye por el T2,5A | Apartado 7.6 |
| Cajón del fusible | **No se puede abrir con un C13 enchufado**. El fusible no se sale al agitarlo | Apartado 6.1 |
| Interruptor | Recorrido firme, no queda en posición intermedia, y la lámpara es de 230 V | Mío |
| Ajuste en el recorte | Prueba con un trozo de la misma chapa. Sin holgura ni movimiento | Apartado 6.1 |

### 8.2 Medidas con polímetro (sin tensión)

| Medida | Cómo | Valor aceptable | Fuente del criterio |
|---|---|---|---|
| Interruptor en OFF | Continuidad en cada polo | Abierto (OL) | Mío |
| Interruptor en ON | Continuidad en cada polo | Cerrado y estable al mover y empujar el interruptor y los terminales. La resistencia debería ser casi la de las puntas. Módulos comparables declaran ≤ 10 mΩ ([RS PRO](https://docs.rs-online.com/2742/0900766b815867af.pdf)) y menos de 15 mΩ con portafusibles ([Bulgin](https://docs.rs-online.com/713f/A700000008622360.pdf)). Un polímetro no resuelve esos valores | Fabricante |
| Entre polos y hacia la lámpara | Continuidad L-N y entre polos | Abierto en las dos posiciones | Mío |
| Topología | Protocolo del apartado 4.3 | Sale un esquema claro que coincide con el cableado | Mío |
| Fusible | Continuidad con el fusible puesto | Cerrado. Un T2,5A de referencia tiene 0,0386 Ω nominal ([Littelfuse](https://littelfuse.com/%7E/media/electronics/datasheets/fuses/littelfuse_fuse_215_datasheet.pdf.pdf)) | Datasheet |
| Tierra | Entre el pin de tierra del C14 y su terminal. Repite con el cordón C13 enchufado, desde el contacto de tierra de la clavija Schuko | ≈ 0 Ω. Con cordón, el valor del cable más una décima de ohmio como mucho (criterio del IET, abajo) | Mío / [IET](https://electrical.theiet.org/media/1658/in-service-inspection-and-testing-of-electrical-equipment-the-earth-continuity-test.pdf) |
| Aislamiento (megóhmetro de 500 V) | Entre L y N, y de L y N a tierra. **Deja fuera la lámpara** (un megóhmetro puede dañar un LED con resistencia: mío) | Objetivo ≥ 1000 MΩ, que es lo que declaran módulos comparables ([RS PRO](https://docs.rs-online.com/2742/0900766b815867af.pdf)). Cualquier valor de pocos MΩ o menos: rechazo (criterio mío) | Fabricante / mío |
| Rigidez dieléctrica | Ensayo de alta tensión (comparables: 2 kVAC 1 min; Schurter KD: > 3 kV L-N y > 4 kV a tierra) | **No lo hagas tú.** Solo un electricista o un laboratorio con equipo adecuado | [Schurter](https://www.farnell.com/datasheets/1830753.pdf) |

**Tierra con valores reales.** El polímetro solo vale como primera comprobación. La guía (§6) pide 0,1 Ω máximo desde el pin de tierra hasta cada pieza metálica y un comprobador que inyecte 10-25 A. La guía del IET para ensayos en servicio es coherente: 0,1 Ω sin cable de alimentación y (0,1 + R) Ω con él; el ensayo "duro" usa hasta 25 A (1,5 veces el fusible, con un tope de 25 A, durante 5-20 s) y el "suave" usa 20-200 mA ([IET](https://electrical.theiet.org/media/1658/in-service-inspection-and-testing-of-electrical-equipment-the-earth-continuity-test.pdf)). Es una guía de ensayos en servicio, no la norma de producto. Para la declaración de conformidad, la cláusula de EN 60335-1 sobre continuidad de tierra **no la he leído**.

### 8.3 Con la máquina montada

1. **Primer encendido con protección:** conecta a través de una base con diferencial o desde un circuito con diferencial de 30 mA, sin tocar nada dentro. Esto debería hacerlo o supervisarlo un electricista.
2. **Prueba de la lámpara:** se enciende con el interruptor en ON y con la tensión correcta. Un parpadeo o un zumbido es señal de módulo malo.
3. **Calentamiento:** tras una hora con la máquina cerrada, mide con termómetro infrarrojo la temperatura del módulo y de los terminales. No debería haber diferencia apreciable con la caja. Compárala con el límite de 70 °C de los pines.
4. **Tirón del cable:** tira del cordón C13 con la máquina apagada. El conector debe salir sin arrastrar el módulo ni cargar los terminales.
5. **Repite la medida de tierra** del apartado 8.2 sobre la máquina montada, desde el pin del C14 a cada pieza metálica.

## 9. Alternativas

Solo si el módulo resulta débil (apartados 4, 5 y 8). **No he comprobado disponibilidad ni precio en Amazon.es** de ninguna. Los de RS, Rapid, Farnell, Distrelec o Reichelt son distribuidores comunes en Europa.

| Opción | Qué es | Polos | Aprobaciones (según fuente) | Terminales | Fijación | Fuente |
|---|---|---|---|---|---|---|
| **Schurter KD** (PG05) | C14 con portafusibles de 1 o 2 polos e interruptor de 2 polos. Sin luz de serie; iluminado bajo pedido | Interruptor 2. Fusible 1 o 2 | VDE 40029908, UL E93617, CSA, CCC | 4,8 × 0,8 | Tornillos hasta 8 mm o clip de 1,5-2,5 mm | [Farnell](https://www.farnell.com/datasheets/1830753.pdf) |
| **Schurter serie 4793 con clip** | C14 con interruptor de 2 polos. En RS: la referencia KM01.1105.11 **sin cajón de fusible** (se pide aparte). 22,77 € sin IVA (precio orientativo de RS) | Interruptor 2 | RoHS, UL, CSA (RS); VDE 40046933 en el documento | 4,8 × 0,8 (documento) | Clip de 1-2,5 mm | [RS](https://es.rs-online.com/web/p/products/4982647), [documento](https://docs.rs-online.com/07e0/A700000008623303.pdf) |
| **Bulgin BZH01** | C14 con interruptor unipolar con neón y un fusible | Interruptor 1. Fusible 1 | UL, CSA, VDE (según Rapid) | 6,3 mm (BZH01) | Clip de 1-3 mm | [Rapid](https://rapidonline.com/bulgin-bzh01-z0000-02-horizontal-neon-sp-fused-inlet-23-3226), [datasheet](https://static.rapidonline.com/pdf/23-3226_v1.pdf) |
| **Bulgin BZH15/BZH16** | Igual con **doble fusible** (entrada PF0033) | Interruptor 1. **Fusible 2** | La ficha de Rapid no lista aprobaciones | 6,3 (BZH15), 2,8 (BZH16) | Clip | [datasheet](https://static.rapidonline.com/pdf/23-3226_v1.pdf) |
| **Bulgin PF/PX** | Entradas C14 sueltas (con fusible simple o doble), con interruptores Polysnap aparte, incluidos "high inrush" | Según montaje | VDE, ENEC, UL, CSA (catálogo) | 2,8, 4,8 o 6,3 | Clip 1/1,5/2/3 mm o tornillos | [catálogo](https://docs.rs-online.com/713f/A700000008622360.pdf), [Polysnap](https://www.farnell.com/datasheets/625732.pdf) |

También aparecen en las fuentes: el Schurter PF11 (doble fusible, 6 A, clip de 1,5 mm como máximo; **Jameco lo da por descatalogado**: [Jameco](https://www.jameco.com/z/PF11-Schurter-AC-Power-Inlet-Receptacle-C14-with-Dual-Fuse-Snap-In-6A-250VAC_2290631.html)), y un interruptor-disyuntor para equipo ("CBE"), que da protección contra sobrecarga además de conmutar ([Schurter](https://schurter.com/en/knowledge/appliance-couplers)). No he mirado a Lumberg, Corcom ni Qualtek: **sin verificar**.

**Mi lectura:** el problema del módulo de 7,70 € no es la corriente sino la falta de certificación y de esquema. El único precio que he visto de un módulo certificado con interruptor bipolar es el Schurter de RS: 22,77 € sin IVA, y sin cajón de fusible. Aun sumando fusibles y portafusibles, la diferencia es de unas pocas decenas de euros sobre los 470 € de electrónica por máquina (cuenta mía). La opción más simple para este proyecto, a falta de ver el esquema del módulo de Amazon, es un módulo tipo Schurter KD (sin selector de tensión) con fusible de 2 polos e interruptor de 2 polos, fijado con tornillos para tu chapa. Como alternativa, una entrada C14 con doble fusible sin interruptor y un interruptor bipolar iluminado aparte.

## 10. Discrepancias con la guía de montaje

| # | La guía dice | Lo que he encontrado | Fuente |
|---|---|---|---|
| 1 | §2.7: "interruptor LED de 4 pines" y "comprueba con el polímetro que corta fase y neutro" | Correcto pedir la comprobación, pero **4 pines con luz pueden ser un interruptor unipolar con lámpara independiente**, no un bipolar. Hay que identificar la topología, no solo verificar que corta los dos | Apartado 4 |
| 2 | §5.1: "C14, entrada L (tras el fusible) → interruptor, entra L", y N igual, como puentes | Supone que hay dos polos de interruptor y un fusible en L. En un módulo unipolar con lámpara, el puente de N iría a la lámpara. Y el fusible puede estar en el neutro según cómo se enchufe | Apartados 4 y 5 |
| 3 | §5.1: "Los puentes del C14 siguen el dibujo del vendedor" | Las descripciones de vendedores de módulos parecidos se contradicen (SPST/DPST). No hay dibujo fiable. Manda la medida | Apartado 4.1 |
| 4 | §1, #27: kit de faston de "2,8, 4,8 y 6,3 mm" para el C14 y el pulsador | No es una contradicción, es un aviso: los genéricos y Schurter tienen lengüeta de **4,8 × 0,8**, y 6,3 solo aparece en Bulgin. Mide la tuya y comprueba el grosor de la lengüeta contra el kit | Apartado 2.3 |
| 5 | §2.7: el interruptor es de 6 A / 250 V | En módulos parecidos es "6 A/250 V o 10 A/125 V" ([MWMS](https://www.kaufland.at/product/470137149/)), y el título "10 A 250 V" es del conector. No contradice a la guía, pero conviene recordar que el límite lo pone el interruptor | Apartado 2.2 |
| 6 | §2.7: "el propio conector C13 hace de anclaje" | No hay fuente primaria que lo diga así. Es plausible (el anclaje está en el cordón), pero la fuerza de enchufar y desenchufar la soporta la fijación del módulo a la chapa | Apartado 6.4 |
| 7 | §9: "EN IEC 60335-2-82" | Según EVS, la edición de 2022 **se retira el 16-09-2026** y la sustituye la de 2026. Comprueba la edición vigente. Afecta a toda la máquina, no solo a esta pieza | Apartado 3.1 |
| 8 | §2.7: fusible T2,5A, 22 A²s, arranque ≈ 1,5 A²s | La cifra de 22 A²s coincide con el datasheet del Littelfuse 215 (22,29 A²s para 2,5 A). El 1,5 A²s del arranque no lo he comprobado (ficha #14) | Apartado 7.6 |

Puntos que tocan a otras piezas (una línea cada uno): #16 (comprobar que el fusible cerámico entra en el cajón; apartado 7.6), #27 (tamaño y grosor del faston), #28 (que la crimpadora sirva para faston aislados), #17 (cordón C13 moldeado y marcado) y #14 (el pico de arranque de 45 A sobre el interruptor).

## 11. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **No enchufes el módulo hasta saber su esquema real.** Aplica el protocolo del apartado 4.3 y dibuja el esquema con fotos. Si el interruptor es unipolar, corrige el cableado de la guía §5.1.
2. **Mejor un módulo con fusible bipolar e interruptor bipolar, con certificación verificable** (apartado 9), sobre todo porque la máquina estará sin vigilancia en bares. El coste extra es pequeño frente al conjunto.
3. **Si te quedas con el genérico, hazlo con medidas y rótulos:** fusible T2,5A cerámico en lugar del de 10 A; cajón de fusible que no se abra con el cable enchufado; terminales cubiertos; faston de la medida y grosor correctos; tierra medida con corriente alta; y el cartel "Desconectar el cable de red antes de abrir".
4. **Pregunta por el diferencial de 30 mA** del bar donde se instale la máquina, porque con un fusible posiblemente en el neutro es lo que protege el fallo fase-chasis.
5. **Fijación en la chapa:** módulo con tornillos M3 (par máximo 0,5 Nm en Schurter) o un clip del espesor adecuado. Haz un recorte de prueba con la chapa real.
6. **Cables y anclaje:** brida del haz a un punto fijo cerca del módulo, tierra más larga, y valora un clip de retención del C13 si el modelo lo admite.
7. **Pide al vendedor** los certificados con números y el esquema interno. Si no los da, considéralo un módulo sin certificar.
8. **Guarda factura, fotos y lote** del módulo para el expediente técnico de la máquina (RD 187/2016, según la guía). Un electricista o el laboratorio que haga la evaluación decidirá si el módulo sin certificar hay que ensayarlo dentro del equipo.
9. **Repuesto:** dos módulos más y fusibles T2,5A de repuesto por cada tanda de máquinas.

## 12. Lo que no he podido verificar

- **El anuncio de Amazon B08Z6FCR5Z**: Amazon bloquea el acceso y el ASIN no devolvió resultados en una búsqueda. No sé la marca, el esquema, el polo del fusible, el tamaño del faston, el recorte, el espesor de chapa que admite, si el fusible viene incluido ni si lleva marcas de certificación.
- **Si el interruptor es unipolar o bipolar.** Es la pregunta clave y solo se contesta con el módulo en la mano.
- **El texto de EN 60335-1, EN IEC 60335-2-82, IEC 60320-1, IEC 61058-1 e IEC 60127**: están de pago. En concreto no he leído las cláusulas sobre corte omnipolar, fusibles en aparatos con enchufe reversible, continuidad de tierra, glow-wire para uso sin vigilancia (mi recuerdo de la cláusula 30.2.3 y 750 °C no está comprobado), ni las pruebas de tracción de terminales.
- **REBT / ITC-BT-19** (la herramienta pidió un permiso que no se contestó) y la página de Schurter de la pieza KD13.1101.151 (mismo motivo). No los pude abrir.
- **Retiradas (CPSC, Safety Gate/RAPEX)** de módulos C14: hice dos búsquedas y no devolvieron nada de esta categoría. No consulté el portal de Safety Gate directamente.
- **Fallos de neón parpadeante, chispas, soldaduras frías, fusible que se sale, tierra sin continuidad:** no encontré fuentes.
- **Valores de tracción de faston crimpados** (IEC 60352-2, UL 486A-B): no los he leído.
- **Marca TÜV en módulos C14:** sin fuente.
- **Disponibilidad y precio en Amazon.es** de las alternativas (apartado 9), y los módulos de Lumberg, Corcom y Qualtek.
- **Las fuentes de foros** (mikrocontroller.net, All About Circuits, Mike Holt, Amp Garage, ECN, woodworker.de, eng-tips) son opiniones, no normas. Las he usado solo para el razonamiento y las he rotulado así.
- **El presupuesto de búsquedas web se agotó** antes de poder consultar la edición vigente de IEC 61058-1, IEC 60320-1 e IEC 60127-6 y sus páginas en el almacén de IEC. Quedan pendientes. Del IEC 61058-1 solo he visto la vista previa de la edición 3.2 (2008).

## 13. Fuentes

Todos los enlaces, ordenados por tipo, y una lista de lo que no se pudo abrir, en [`enlaces.md`](enlaces.md).
