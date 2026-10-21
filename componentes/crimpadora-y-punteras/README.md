# Crimpadora autoajustable para punteras + surtido de 1250 punteras

Es la única herramienta de crimpado de la hoja de compra. Sirve para poner punteras (terminales tubulares con collarín de plástico) en los cables flexibles que entran en bornes de tornillo: los de 230 V y la tierra en la fuente LRS-50-5, los de 5 V en la fuente, en las regletas WAGO y en los bornes USB-A.

- **Compra:** ASIN B0FQP6KDL4, 15,98 € (precio de la hoja de componentes del 19-20/10/2026). Número 28 de la hoja.
- **Toca la seguridad eléctrica.** Una puntera mal crimpada en la tierra o en un borne de 230 V no se ve y no avisa. Lee los apartados 6 y 9 antes de montar nada.

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta: **no he visto el anuncio B0FQP6KDL4**. El precio y el ASIN son los de tu hoja. No sé la marca, el rango, el perfil de crimpado ni cuántas punteras de cada sección trae el surtido. Esta pieza **no tiene ficha del fabricante**: lo que sigue se apoya en las normas que citan los catálogos de Phoenix Contact y Weidmüller, en herramientas de marca (Knipex, Weidmüller, Phoenix) y en listados de herramientas baratas de la misma clase. No he podido leer ninguna norma completa (están de pago). Gasté unas 15 búsquedas web y varios sitios no abrieron; el detalle está en el apartado 14.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Qué crimpa y qué no crimpa esta herramienta](#2-qué-crimpa-y-qué-no-crimpa-esta-herramienta)
3. [Especificaciones](#3-especificaciones)
4. [Documentos oficiales y normas](#4-documentos-oficiales-y-normas)
5. [Ajuste a la sección y longitud de pelado](#5-ajuste-a-la-sección-y-longitud-de-pelado)
6. [Seguridad: 230 V, tierra y raíl de 5 V](#6-seguridad-230-v-tierra-y-raíl-de-5-v)
7. [Cuántas punteras hacen falta y cuántas sobran](#7-cuántas-punteras-hacen-falta-y-cuántas-sobran)
8. [Fallos, bugs y problemas conocidos](#8-fallos-bugs-y-problemas-conocidos)
9. [Qué comprobar al recibirla](#9-qué-comprobar-al-recibirla)
10. [Alternativas y segunda herramienta](#10-alternativas-y-segunda-herramienta)
11. [Mantenimiento](#11-mantenimiento)
12. [Discrepancias con la guía de montaje](#12-discrepancias-con-la-guía-de-montaje)
13. [Recomendaciones para el alcoholímetro](#13-recomendaciones-para-el-alcoholímetro)
14. [Lo que no he podido verificar](#14-lo-que-no-he-podido-verificar)
15. [Fuentes](#15-fuentes)

---

## 1. Resumen para el proyecto

- **La observación de las otras fichas se confirma en lo esencial, con un matiz.** Una crimpadora autoajustable de punteras está descrita por los fabricantes solo para punteras (Knipex la define según DIN 46228-1 y -4: [RS](https://uk.rs-online.com/web/p/crimp-tools/3368179)), y el catálogo de McMaster separa estas herramientas de las de terminales ([McMaster](https://www.mcmaster.com/products/wire-and-cable-crimpers/for-wire-gauge~8)). **Los ojales aislados (#23) no caben en las mordazas y los terminales Dupont/JST (#7, #29) necesitan otra herramienta.** Para los faston aislados (#27) no hay fuente que respalde un crimpado correcto: un usuario dice que su herramienta barata sí crimpa horquillas y empalmes pequeños, sin medir tracción. La guía no incluye la herramienta para ninguno de los dos grupos. No he visto tu anuncio, así que lo afirmo para la clase, no para tu modelo. Detalle y fuentes en el apartado 2.
- **Proponer una segunda herramienta está justificado:** una crimpadora de trinquete para terminales preaislados de 0,5-6 mm². Los ojales M4 de tierra y los faston del módulo C14 forman parte del camino de tierra y de la entrada de 230 V. Apartado 10.
- **Nada del anuncio garantiza que herramienta y punteras cumplan la norma.** Knipex, Weidmüller y Phoenix declaran DIN 46228-1 y -4 para sus herramientas y punteras. Los listados baratos que leí no declaran ninguna norma. UL 486F ensaya la puntera junto con su herramienta ([Weidmüller](https://assets.dam.weidmueller.com/assets/api/adbb75f5-316f-41db-81c0-dd7dfacff88b/Original/MB_wire_end_ferrules_EN_WEB.pdf)). Lo tienes que demostrar tú con una prueba de tracción: 30 N para 0,75 mm² y 40 N para 1,5 mm² (IEC 60999-1 y UL 486F, según [Phoenix Contact](https://assets.phoenixcontact.com/file/257a95b8-0ae0-4b65-8476-514c169bc2ba/media/original)).
- **El código de colores que citas es DIN 46228-4 y lo he verificado, pero existen otros dos que lo contradicen** (negro es 1,5 mm² en DIN y en el francés, y 6 mm² en el alemán antiguo; gris es 0,75, 2,5 o 4 mm² según el código). No te fíes del color: mide el diámetro del tubo de cobre con calibre (apartado 5).
- **Pelado: unos 10 mm para una puntera de "8"** (el 8 del nombre es la longitud del cobre visible, no la del pelado). Weidmüller da 10 mm de pelado para punteras de 8 mm de contacto y Phoenix da 11 mm como máximo (apartado 5).
- **El riesgo no es el calor en los bornes de 230 V, sino la tierra y el raíl de 5 V** (cálculo mío, apartado 6). L y N llevan unas décimas de amperio, así que un crimpado malo apenas calienta; el peligro ahí es que el hilo se salga. El borne FG tiene que poder llevar la corriente de un fallo. En el raíl de 5 V, un crimpado de 100 mΩ a 5 A se come 0,5 V de los 0,57 V de margen de la Pi.
- **Del surtido de 1250 solo se usarán unas pocas secciones** (0,34, 0,75 y 1,5 mm²) y unas 5 a 23 punteras por máquina (cálculo mío, apartado 7). Sobra casi todo; lo que importa es cuántas de 0,75 y 1,5 traiga, y eso **no lo sé**.

## 2. Qué crimpa y qué no crimpa esta herramienta

Esta es la observación que las fichas de los cables JST-XH (apartados 5.11 y 6.1), del módulo C14 (apartado 6.2), del pulsador (apartado 9.3), de los ojales (#23, apartado 5.1) y de los faston (#27, apartado 4.1) señalan como hueco de la guía. Las fichas de #23 y #27 son deducciones de sus autores a partir de catálogos; ninguna había visto la herramienta. Aquí añado lo que dicen las fuentes de herramientas.

| Terminal | Pieza de la hoja | ¿La crimpa esta herramienta? | Por qué | Qué hace falta |
|---|---|---|---|---|
| Puntera con collarín, 0,34-1,5 mm² | #28 (este surtido) | **Sí, es su uso** | Knipex 97 53 04: "cable end sleeves" según DIN 46228-1 y -4 ([RS](https://uk.rs-online.com/web/p/crimp-tools/3368179)) | Comprobar el rango de tu modelo (apartado 3.2) |
| Ojal M4 aislado, 0,5-1,5 mm² | #23 | **No** | Un participante de un foro, con una herramienta autoajustable barata, dice que los ojales "no pasan por las mordazas" ([HomemadeTools](https://homemadetools.net/forum/self-adjusting-crimping-pliers-gif-85731)). McMaster vende por separado las crimpadoras de punteras (ranura fija o autoajustable) y las de terminales (ojal, horquilla, faston, empalme), cada una con su juego de matrices ([McMaster](https://www.mcmaster.com/products/terminal-crimpers)). Los preaislados necesitan una herramienta pensada para ellos y dan un perfil distinto al de las punteras ([Wiltronics](https://www.wiltronics.com.au/wiltronics-knowledge-base/how-to-crimp-insulated-wire-connectors/)) | Crimpadora de trinquete para preaislados (apartado 10) |
| Faston aislado 2,8 / 4,8 / 6,3 mm | #27 | **Sin respaldo.** Probablemente no | El mismo participante de HomemadeTools dice que su herramienta "sirve para horquillas, terminales planos y empalmes pequeños". Es una opinión de uno, sin medir tracción, y el hilo no habla de faston de 230 V. Los fabricantes de herramientas de punteras no las declaran para terminales. Un barril de faston es una chapa enrollada con costura abierta dentro de un manguito aislante; una matriz cerrada de punteras no hace el pliegue para el que se diseñan (inferencia de la ficha #27, sin fuente) | La prueba de tracción del apartado 9 y, si falla o dudas, la herramienta de preaislados |
| Contacto Dupont hembra / JST-XH (barril abierto) | #7, #29 | **No** | Los de barril abierto se crimpan en dos pasos (conductor y aislante) con matrices de 1,0-1,9 mm de ancho ([Misumi: Engineer PA-09](https://uk.misumi-ec.com/vona2/detail/223000766804/)). Un hilo de Duet3D coincide en que el crimpado de un Molex/JST abierto y el de una puntera son muy distintos y que una sola herramienta rara vez sirve bien para los dos ([Duet3D](https://forum.duet3d.com/post/88006)) | Crimpadora de microterminales (apartado 10) |

Las otras fichas ya apuntan a la misma conclusión. La de los ojales cita a McMaster y dice que una herramienta "autoajustable" es de la familia de las punteras. La de los faston cita a Knipex: una pinza para punteras (97 53) y otra distinta para terminales aislados (serie 97 52, perfil "F" u oval, 0,5-6 mm²), datos que no he abierto yo (apartado 10).

**Cuidado con el texto de los anuncios.** Un listado de una herramienta de la misma clase dice que sirve para "la mayoría de terminales de manguito aislados y no aislados y conectores" ([listado Flytuo](https://alaniazapoved.ru/products/hexagonal-crimping-tool-awg23-10-hsc8-6-6-self-adjusting-rat/205851316)). "Terminal de manguito" (sleeve terminal) es una puntera. No es un ojal ni un faston. Si el anuncio de tu herramienta dice algo parecido, no lo tomes como permiso para ojales.

**Por qué importa la diferencia de exigencia (cálculo mío con datos de las fuentes).** La tracción mínima que se pide a una puntera de 0,75 mm² es 30 N ([Phoenix](https://assets.phoenixcontact.com/file/257a95b8-0ae0-4b65-8476-514c169bc2ba/media/original)). A un terminal crimpado en AWG 18 (UL 486A) se le pide 20 lbf, unos 89 N, y en AWG 16 30 lbf, unos 133 N ([Cirris](https://cirris.com/crimp-pull-testers-pullout-force-per-wire-size/), en libras; conversión mía). Es unas tres veces más. La puntera no es lo que sostiene el cable: lo sostiene el tornillo. El ojal de tierra sí lo sostiene el crimpado.

## 3. Especificaciones

### 3.1 Lo que dice tu hoja

| Característica | Valor | Fuente |
|---|---|---|
| Pieza | Crimpadora autoajustable + 1250 punteras | Hoja, #28 |
| ASIN / precio | B0FQP6KDL4 / 15,98 € | Hoja |
| Marca, rango, perfil de crimpado, material | **No constan** | Anuncio no visto |
| Reparto del surtido por secciones y colores | **No constan** | Anuncio no visto |
| Norma declarada (DIN 46228-4, UL 486F) | **Sin verificar** | Anuncio no visto |

Una búsqueda del ASIN no devolvió el anuncio. Devolvió listados de otras tiendas con el mismo tipo de producto. Uno de [ManoMano.es](https://www.manomano.es/p/kit-de-herramientas-de-crimpado-de-ferulas-con-kit-de-terminales-de-ferulas-de-cable-de-1250-piezas-herramienta-de-crimpado-autoajustable-herramienta-de-crimpado-de-ferulas-para-awg-237-0-25-10-228879402) lleva en su título "1250 piezas", "autoajustable" y "AWG 23-7 / 0,25-10". **Solo leí el título en el resultado de búsqueda**; la página no abrió y no sé si es tu mismo producto.

### 3.2 La clase de herramienta barata (listados parecidos, no el tuyo)

| Listado | Rango | Perfil | Mecanismo | Peso | Precio | Fuente |
|---|---|---|---|---|---|---|
| Aongray (YPC, Reino Unido) | 0,25-10 mm² (AWG 23-7) | No indicado | "Self-adjustable ratchet action" | No indicado | 9,99 £ | [YPC](https://www.ypc.co.uk/product/ferrule-crimper-plier-aongray-self-adjustable-ratchat-wire-crimping-tool-0-25-10mm%c2%b2-awg23-7-crimping-pliers-to-crimp-the-bootlace-ferrules-ferrule-crimper-plier/) |
| Flytuo HSC8 6-6 | 0,25-6 mm² (AWG 23-10) | **Hexagonal** | Trinquete, "se ajusta solo" | No indicado | No indicado | [listado](https://alaniazapoved.ru/products/hexagonal-crimping-tool-awg23-10-hsc8-6-6-self-adjusting-rat/205851316) |
| Quadrios 23T030 (Rapid) | 0,25-10 mm² (AWG 23-7) | Cuatro mandriles, crimpado **cuadrado** | Ajuste automático al diámetro, ajuste fino de la presión del trinquete, palanca de liberación | 363 g | No indicado | [Rapid](https://static.rapidonline.com/pdf/06-3521_v1.pdf) |

Qué se puede decir de la clase (mío, apoyado en esos tres listados):

- El rango típico es 0,25-6 o 0,25-10 mm². Por debajo de 0,25 mm² no llegan. Para tu proyecto sobra rango: usas 0,34 a 1,5 mm².
- **El perfil no es el mismo en todos**: unos crimpan cuadrado y otros hexagonal, y muchos listados no lo dicen. Tampoco lo sabes de tu anuncio. Se ve en una puntera de prueba (apartado 9).
- Rapid advierte de que la herramienta es "solo para electricistas cualificados" y que funciona mejor con sus propios surtidos de punteras. Es un indicio de que la combinación herramienta-puntera importa (apartado 4).

**Mecanismo.** No encontré una descripción del mecanismo interno en una fuente de fabricante. Lo que sí consta:

- Un participante de un foro que tiene una herramienta parecida: "se autoajustan, no hay ajustes, aprietas" ([HomemadeTools](https://homemadetools.net/forum/self-adjusting-crimping-pliers-gif-85731)). Otro las compara con las de "iris" y sospecha que no crimpan tan fuerte como las de trinquete clásicas, y cuenta punteras que se salían del hilo. Un tercero dice que aplastan la puntera a fondo. **Son opiniones de un hilo, sin medir nada.**
- En la Knipex 97 53 04, la presión de crimpado está fijada y calibrada de fábrica; el trinquete no se abre hasta completar el crimpado, y hay una palanca para abortarlo ([reseña de element14](https://community.element14.com/products/roadtest/rv/roadtest_reviews/58/knipex-self-adjusting-crimping-plier-review), [RS](https://uk.rs-online.com/web/p/crimp-tools/3368179)). Tiene además un selector para la puntera de 16 mm² (misma reseña).
- Rapid describe un ajuste fino de la presión en su modelo barato.

### 3.3 Herramientas de marca, para comparar

| Herramienta | Rango | Perfil | Ajuste y trinquete | Tamaño y peso | Norma que declara | Fuente |
|---|---|---|---|---|---|---|
| Knipex 97 53 04 | 0,08-16 mm² (AWG 28 a 5-6, la página no es coherente) | **Cuadrado** | Autoajustable. Bloqueo forzado liberable. Presión calibrada en fábrica | 180 mm. 460 g (fuente secundaria) | Punteras según DIN 46228-1 y -4 | [RS](https://uk.rs-online.com/web/p/crimp-tools/3368179), [Sancogrup](https://www.sancogrup.ro/en/self-adjusting-crimping-pliers-for-wire-ferrules-lateral-access-180-mm-knipex-975304.html) |
| Knipex 97 53 09 | 0,08-10 mm² y 16 mm² (selector) | No indicado | Autoajustable. Trinquete liberable. Entrada frontal | 190 mm | DIN 46228-1 y -4 | [Hoffmann](https://www.hoffmann-group.com/GB/en/houk/p/97%2053%2009-) |
| Knipex 97 53 14 | 0,08-16 mm² (AWG 28-8) | **Hexagonal** | Autoajustable. Trinquete | 180 mm. 445 g | DIN 46228-1 y -4 | [ficha Knipex (ES)](https://www.knipex.com/sites/default/files/Product%20data%20sheet%20ES%2097%2053%2014.pdf) |
| Weidmüller PZ 6 Roto | 0,14-6 mm² (AWG 26-10) | Trapezoidal | Trinquete con liberación. Ajuste: no indicado | 423,66 g | Ninguna en la ficha | [Weidmüller](https://datasheet.weidmueller.com/pdf/en/9014350000/scope/1) |
| Weidmüller PZ 6/5 | 0,25-6 mm² (AWG 24-10) | Trapezoidal, cinco estaciones | Trinquete con liberación | 433 g | Ninguna en la ficha | [Weidmüller](https://datasheet.weidmueller.com/pdf/en/9011460000/scope/2) |
| Phoenix Contact CRIMPFOX 6 (1212034) | 0,25-6 mm² (AWG 24-10) | Trapezoidal, cinco posiciones (0,25-0,75 / 1-1,5 / 2,5 / 4 / 6 mm²) | Fuerza de crimpado reajustable. Bloqueo de presión desbloqueable sin herramienta | 198 mm. 444,2 g | DIN 46228-1 y -4 | [Phoenix](https://www.phoenixcontact.com/us/products/1212034/pdf) |

Diferencias que importan:

- **Posiciones frente a autoajuste.** CRIMPFOX 6 y PZ 6/5 obligan a elegir la posición según la sección: es un paso más, pero la sección va a la vista. La autoajustable no te deja elegir mal, pero **tampoco sabe si el hilo es más fino que la puntera**: si lo es, la puntera se deforma en rombo y no comprime (comentario de un lector en la [reseña de element14](https://community.element14.com/products/roadtest/rv/roadtest_reviews/58/knipex-self-adjusting-crimping-plier-review)).
- **Rango útil.** Las de marca bajan a 0,08-0,14 mm². Para ti no hace falta.
- **Precio.** La reseña de element14 da unas 115 £ por la Knipex 97 53 04 (fecha de la reseña no visible) y un comentario, 124 £ en Amazon. Compárala con los 15,98 € de la hoja, que incluyen 1250 punteras.
- **Declaración de norma.** Las de marca declaran DIN 46228-1 y -4. De las tres baratas que leí, ninguna declara norma. El autor de la reseña de element14 descartó las baratas precisamente por no declarar la norma DIN.

### 3.4 Punteras: normas, colores, dimensiones y tracción

**Colores.** La serie que citas es DIN 46228-4. La he comprobado en dos fuentes y coincide. Hay otros dos códigos en uso:

| Sección | DIN 46228-4 | Francés (NF C 63-023) | Alemán antiguo (Zoller+Fröhlich / Weidmüller) |
|---|---|---|---|
| 0,5 mm² | blanco | blanco | naranja |
| 0,75 mm² | **gris** | azul | blanco |
| 1 mm² | rojo | rojo | amarillo |
| 1,5 mm² | **negro** | negro | rojo |
| 2,5 mm² | azul | gris | azul |
| 4 mm² | gris | naranja | gris |
| 6 mm² | amarillo | verde | negro |
| 10 mm² | rojo | marrón | marfil |

Fuentes: [Phoenix Contact, "What you should know about ferrules"](https://assets.phoenixcontact.com/file/257a95b8-0ae0-4b65-8476-514c169bc2ba/media/original) (primaria; las columnas salieron en el orden DIN, francés, especial), contrastada con [Stex24](https://stex24.com/guide/wire-ferrules) (secundaria, con la misma tabla) y con un hilo de [electronicwerkstatt](https://forum.electronicwerkstatt.de/phpBB/Elektroinstallation/farbe_von_aderendhuelsen-t61770f17_bs0.html) donde se lista la serie antigua de Weidmüller.

Divergencias que te afectan:

- **Negro** es 1,5 mm² en DIN y en el código francés. Es 6 mm² en el alemán antiguo.
- **Gris** es 0,75 mm² y también 4 mm² en DIN, 2,5 mm² en el francés. En DIN conviven en el mismo color 0,75 y 4 mm²: solo el tamaño las distingue.
- **Rojo** es 1 mm² en DIN, y 1,5 mm² en el alemán antiguo. Un hilo del foro cuenta que se mezclan punteras rojas de 1 y 1,5 mm² y que eso dificulta la inspección.
- **Blanco** es 0,5 en DIN y francés, y 0,75 en el alemán antiguo.
- **Los colores de 0,14, 0,25 y 0,34 mm² no son de la norma DIN.** Ni los de 70 a 120 mm² ([Phoenix](https://assets.phoenixcontact.com/file/257a95b8-0ae0-4b65-8476-514c169bc2ba/media/original), [Wikipedia DE](https://de.wikipedia.org/wiki/Aderendh%C3%BClse)). La puntera de 0,34 mm² (la de AWG 22) tendrá el color que decida el fabricante.
- **Tabla UL 486F:** la tabla de Phoenix tiene una columna para UL 486F, pero mi lectura no alineó las columnas y **no puedo decir qué color da UL 486F**.
- Un mismo fabricante puede vender dos series. Phoenix vende la AI 2,5-8 GY, de color gris, cuyo collarín sigue el código francés (la ficha lo dice; no da la sección explícitamente y la deduzco del nombre: en DIN el gris sería 0,75 o 4 mm², no 2,5) ([ficha](https://www.mouser.com/datasheet/2/324/4/3200069-1475656.pdf)). Un surtido barato puede usar cualquiera de los códigos, o uno propio.

**Dimensiones** (Phoenix, tabla de punteras con collarín; d1 es el diámetro del tubo de cobre, d2 el del collarín; l1 es el largo total y l2 el largo del cobre visible):

| Sección | AWG | d1 | d2 | l1 / l2 disponibles (mm) |
|---|---|---|---|---|
| 0,34 mm² | 22 | 0,8 | 1,9 | 10,5/6 · 12,5/8 · 14,5/10 · 16,5/12 |
| 0,5 mm² | 20 | 1,0 | 2,6 | 12/6 · 14/8 · 16/10 |
| **0,75 mm²** | 18 | **1,2** | 2,8 | 12/6 · 14/8 · 16/10 · 18/12 |
| 1 mm² | – | 1,4 | 3,0 | 12/6 · 14/8 · 16/10 · 18/12 |
| **1,5 mm²** | 16 | **1,7** | 3,5 | 14/8 · 16/10 · 18/12 · 24/18 |
| 2,5 mm² | 14 | 2,2 | 4,2 | 14/8 · 18/12 · 24/18 |

Weidmüller da los mismos valores de d1 y d2 para 0,5, 1,5 y 2,5 mm² ([catálogo](https://assets.dam.weidmueller.com/assets/api/adbb75f5-316f-41db-81c0-dd7dfacff88b/Original/MB_wire_end_ferrules_EN_WEB.pdf)). Las equivalencias AWG-mm² son aproximadas (1 mm² no tiene AWG propio). Un ejemplo concreto: la Phoenix AI 0,75-8 GY mide 14 mm de largo total, 8 mm de contacto y 1,3 mm de diámetro, con collarín de polipropileno y cobre estañado blando; cumple DIN 46228-4 y UL 486F-E ([Phoenix](https://www.phoenixcontact.com/us/products/3200519/pdf)).

**Fuerza de arrancamiento exigida** (Phoenix, columna "IEC 60999-1" y columna "UL 486F"; el catálogo de Weidmüller da los mismos valores IEC para 0,75 mm² y siguientes):

| Sección | AWG | IEC 60999-1 | UL 486F | En kgf (cálculo mío) |
|---|---|---|---|---|
| 0,34 mm² | 22 | 15 N | 15 N | 1,5 |
| 0,5 mm² | 20 | 20 N | 20 N | 2,0 |
| **0,75 mm²** | 18 | **30 N** | **30 N** | **3,1** |
| 1 mm² | – | 35 N | 35 N | 3,6 |
| **1,5 mm²** | 16 | **40 N** | **40 N** | **4,1** |
| 2,5 mm² | 14 | 50 N | 50 N | 5,1 |

Procedimiento de ensayo según Phoenix: tirar a 25 mm/min hasta alcanzar la fuerza mínima, mantenerla un minuto y comprobar que la puntera no se mueve; luego seguir hasta que el conductor se suelte y anotar el máximo. La fila UL 486F del catálogo de Weidmüller da 20 N para las tres secciones más pequeñas de su tabla, donde Phoenix da 10, 15 y 20 N. Las dos fuentes coinciden en 30 N para 0,75 mm² y 40 N para 1,5 mm².

**Atención a otra tabla.** La hoja de Phoenix sobre tablas de normas ([Mouser](https://www.mouser.lt/pdfdocs/PhoenixContact-Tables_Norm_Cross_Section.pdf)) lista, junto a estos valores, otros mucho mayores (85 N para 0,75 mm², 150 N para 1,5 mm²). Los encabezados de esas columnas salieron ilegibles en mi lectura. Por el contexto (la tabla mezcla IEC 60999-1, IEC 60352-2 y UL 486A/B) pertenecen a normas de terminales crimpados, **no a las punteras**. No exijas 150 N a una puntera de 1,5 mm² por haber visto esa tabla. Esa atribución es mía y **sin verificar**.

## 4. Documentos oficiales y normas

### 4.1 Normas

Están de pago. **No he leído ninguna.** Lo que sé de ellas viene de catálogos de fabricantes, de Wikipedia y de la prensa técnica de Weidmüller.

| Norma | Tema | Qué he podido leer | Dónde |
|---|---|---|---|
| DIN 46228-4 | Punteras con collarín (0,5 a 50 mm²) | Edición 2020-03 según Wikipedia. Phoenix cita en otras fichas la edición 2017-05 para el diseño y 1990-09 para las dimensiones. **El texto, no** | [Wikipedia DE](https://de.wikipedia.org/wiki/Aderendh%C3%BClse), [Phoenix 3200069](https://www.mouser.com/datasheet/2/324/4/3200069-1475656.pdf) |
| DIN 46228-1 | Punteras sin collarín | Solo el nombre, en las fichas de herramientas | [RS, Knipex](https://uk.rs-online.com/web/p/crimp-tools/3368179) |
| IEC 60999-1 (EN 60999-1) | Bornes de tornillo: fuerzas de arrancamiento | Los valores, a través de Phoenix y Weidmüller. Weidmüller dice que la norma, junto con la EN 60947-1, trae también requisitos de calibre de crimpado ("crimp gauge"). **No pude abrir la vista previa de VDE** (robots.txt) | [Phoenix](https://assets.phoenixcontact.com/file/257a95b8-0ae0-4b65-8476-514c169bc2ba/media/original), [Weidmüller](https://assets.dam.weidmueller.com/assets/api/adbb75f5-316f-41db-81c0-dd7dfacff88b/Original/MB_wire_end_ferrules_EN_WEB.pdf) |
| IEC 60947-1 y -7-1 | Aparamenta y bornes de conexión | **Nada.** Weidmüller y Phoenix solo mencionan IEC/EN 60947-1 | — |
| IEC / EN 60352-2 | Conexiones crimpadas | Weidmüller recomienda usar herramienta y contacto del mismo fabricante. Phoenix la cita para los defectos de pelado y de crimpado. **Texto: no** | [Weidmüller](https://weidmueller.com/int/company/press/trade_press_news/crimping_the_right_way___made_easy.jsp) |
| UL 486F (partes A, E, F) | Punteras: A sin aislar, E aisladas, F gemelas | Solo la clasificación (Phoenix). Weidmüller: UL ensaya la puntera junto con su herramienta y da una aprobación conjunta | [Phoenix](https://assets.phoenixcontact.com/file/257a95b8-0ae0-4b65-8476-514c169bc2ba/media/original) |
| DIN EN 60228 | Clases de conductor (1, 2, 5, 6) | Solo que la puntera es para clases 2, 5 y 6, no para la clase 1 (rígido) | [Phoenix](https://assets.phoenixcontact.com/file/257a95b8-0ae0-4b65-8476-514c169bc2ba/media/original), [Weidmüller](https://assets.dam.weidmueller.com/assets/api/adbb75f5-316f-41db-81c0-dd7dfacff88b/Original/MB_wire_end_ferrules_EN_WEB.pdf) |
| DIN 41641-1 | Herramientas de crimpado | Weidmüller: las herramientas normalizadas aguantan al menos 50 000 ciclos sin perder calidad | [Weidmüller](https://weidmueller.com/int/company/press/trade_press_news/crimping_the_right_way___made_easy.jsp) |
| VDE 0100-520 (edición 2003-06) | Instalaciones eléctricas | Wikipedia la cita a propósito de las soldaduras en circuitos de potencia. No leí la norma ni sé qué cláusula | [Wikipedia DE](https://de.wikipedia.org/wiki/Aderendh%C3%BClse) |
| ITC-BT-19 (REBT) | Instalaciones interiores | Leí el texto: pide bornes o regletas para unir conductores y terminales "adecuados" por encima de 6 mm². **No dice nada de punteras ni de conductores flexibles.** Es de instalación fija, no de aparato | [PDF](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf) |

### 4.2 Documentos de fabricante

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Phoenix Contact, "What you should know about ferrules" | 3011103048 MNR 1540293/2023-04-01/00 | PDF | [descargar](https://assets.phoenixcontact.com/file/257a95b8-0ae0-4b65-8476-514c169bc2ba/media/original) |
| Weidmüller, catálogo de punteras (MB) | MB_wire_end_ferrules_EN_WEB | PDF | [descargar](https://assets.dam.weidmueller.com/assets/api/adbb75f5-316f-41db-81c0-dd7dfacff88b/Original/MB_wire_end_ferrules_EN_WEB.pdf) |
| Weidmüller, "Crimping the right way" | Artículo | Web | [leer](https://weidmueller.com/int/company/press/trade_press_news/crimping_the_right_way___made_easy.jsp) |
| Phoenix, AI 0,75-8 GY | 3200519 | PDF | [descargar](https://www.phoenixcontact.com/us/products/3200519/pdf) |
| Phoenix, AI 2,5-8 GY (código francés) | 3200069 | PDF | [descargar](https://www.mouser.com/datasheet/2/324/4/3200069-1475656.pdf) |
| Phoenix, AI 6-12 GN | 3200108 | PDF | [descargar](https://docs.rs-online.com/6789/A700000014794324.pdf) |
| Phoenix, tablas de normas por sección | — | PDF | [descargar](https://www.mouser.lt/pdfdocs/PhoenixContact-Tables_Norm_Cross_Section.pdf) |
| Phoenix, CRIMPFOX 6 | 1212034 | PDF | [descargar](https://www.phoenixcontact.com/us/products/1212034/pdf) |
| Weidmüller, PZ 6 Roto | 9014350000 | PDF | [descargar](https://datasheet.weidmueller.com/pdf/en/9014350000/scope/1) |
| Weidmüller, PZ 6/5 | 9011460000 | PDF | [descargar](https://datasheet.weidmueller.com/pdf/en/9011460000/scope/2) |
| Knipex 97 53 14, ficha (ES) | 97 53 14 | PDF | [descargar](https://www.knipex.com/sites/default/files/Product%20data%20sheet%20ES%2097%2053%2014.pdf) |
| Knipex 97 53 04, ficha (EN) | 97 53 04 | PDF | [enlace](https://www.knipex.com/sites/default/files/Product%20data%20sheet%20EN%2097%2053%2004.pdf) (**no pude abrirlo**: error de la herramienta) |
| Rapid, pinzas autoajustables Quadrios | 23T030 (06-3521) | PDF | [descargar](https://static.rapidonline.com/pdf/06-3521_v1.pdf) |
| Mean Well, manual de instalación (caja cerrada) | Enclosed_Type_EN | PDF | [descargar](https://www.meanwell.com/Upload/PDF/Enclosed_Type_EN.pdf) |

### 4.3 Qué dicen los más relevantes

- **Phoenix, "What you should know about ferrules".** Es el documento más útil. Da la correspondencia de normas (DIN 46228-1 sin collarín, DIN 46228-4 con collarín, UL 486F-A/E/F), la tabla de colores, dimensiones por sección, perfiles de crimpado (oval, trapezoidal, WM, cuadrado, hexagonal con sus rangos habituales), longitud de pelado, la tabla de arrancamiento y el ensayo, y criterios de calidad visuales. Dice que las punteras son para conductores de clase 2, 5 y 6; que no se crimpan conductores de aluminio con punteras de cobre; y que la sección nominal se define por conductancia, de modo que un conductor de 10 mm² puede medir 8-9 mm² de verdad.
- **Weidmüller, catálogo.** Añade: no se permite el conductor macizo (clase 1) con punteras; el collarín **no es un alivio de tracción** y no hay que doblar el cable en él; la puntera y la herramienta de un mismo fabricante forman un sistema; elige el perfil según el hueco del borne (redondo: hexagonal; cuadrado: cuadrado); la herramienta se mantiene y se prueba con regularidad. Dice también que a las punteras no se les puede poner marcado CE.
- **Weidmüller, artículo.** Un crimpado bien hecho es una unión homogénea y no desmontable; hay que ajustar la herramienta para que crimpe justo delante del collarín; el crimpado termina cuando el trinquete se abre solo; y hay que comprobar la calidad en cada proyecto.
- **Mean Well, manual.** Pide que todos los hilos del conductor entren en el borne y que el tornillo esté bien apretado. **No menciona punteras ni terminales crimpados, ni da longitud de pelado** (apartado 6.2).

## 5. Ajuste a la sección y longitud de pelado

### 5.1 Qué puntera en cada cable

| Cable | Dónde | Sección real | Puntera | Notas |
|---|---|---|---|---|
| Manguera H05VV-F 3G1,5 (#22): marrón, azul, verde-amarillo | L, N y FG de la LRS-50-5 | 1,5 mm² | **1,5 mm²** (negro en DIN) | El cable de red es de 1,5 mm² (nombre del cable). Que sea clase 5 (flexible): sin verificar, revisa las hebras |
| Cable 2 × 0,75 mm² rojo/negro (#21) | +V y −V de la LRS-50-5; WAGO; bornes USB-A | 0,75 mm² | **0,75 mm²** (gris en DIN) | Tiene que ser flexible (clase 5) y de cobre. **No he visto el anuncio de #21** |
| Hilos de 22 AWG (JST-XH, latiguillo micro-USB) | Extremo suelto que entra en una WAGO | 0,33 mm² (AWG 22) | **0,34 mm²** | El color de 0,34 mm² no es de la norma DIN |

Un hilo de 22 AWG tiene unos 0,33 mm² (diámetro de 0,644 mm: cálculo mío). La equivalencia 0,34 mm² = AWG 22 es la de Phoenix.

### 5.2 Qué pasa con una puntera de la sección equivocada

Los efectos de abajo son mi análisis. Se apoyan en lo que dicen las fuentes sobre cómo se cierra una puntera, no en un ensayo.

| Caso | Efecto probable | Base |
|---|---|---|
| Puntera mayor que el hilo (por ejemplo una de 0,5 mm² en AWG 22, 0,33 mm²: el hilo llena el 65 %) | El crimpado no comprime las hebras. La puntera se deforma en rombo en vez de en cuadrado y puede resbalar. Con la 0,34 el llenado sería del 96 % | Un comentario sobre la Knipex en [element14](https://community.element14.com/products/roadtest/rv/roadtest_reviews/58/knipex-self-adjusting-crimping-plier-review) dice que un hilo fino deforma el crimpado en rombo. Un participante de [HomemadeTools](https://homemadetools.net/forum/self-adjusting-crimping-pliers-gif-85731) cuenta punteras que se salían |
| Puntera menor que el hilo (0,75 mm² en un hilo de 1,5 mm²) | El hilo no entra. Si recortas hebras para que entre, bajas la sección. Si lo fuerzas, se parte el collarín o se abre el tubo | Mío |
| Puntera de 1,5 mm² en un cable de 0,75 mm² | Igual que la primera fila | Mío |
| Confundir el gris de 0,75 mm² con el gris de 4 mm² | La de 4 mm² (d1 = 2,8 mm) en un hilo de 0,75 mm² da un crimpado flojo | Código DIN: dos secciones con el mismo color. Dimensiones: [Phoenix](https://assets.phoenixcontact.com/file/257a95b8-0ae0-4b65-8476-514c169bc2ba/media/original) |
| El cable es más fino de lo que dice | La puntera "correcta" queda grande. Phoenix recuerda que la sección nominal se define por conductancia, no por geometría | [Phoenix](https://assets.phoenixcontact.com/file/257a95b8-0ae0-4b65-8476-514c169bc2ba/media/original) |

### 5.3 Longitud de pelado y de cobre

El número del nombre de la puntera (8, 10, 12) es la **longitud del cobre visible (l2)**. El tubo de cobre sigue por dentro del collarín, así que el pelado tiene que ser mayor.

| Fuente | Puntera (cobre visible l2) | Pelado |
|---|---|---|
| Weidmüller, catálogo | 6 mm (H0,25/10) | 8 mm |
| Weidmüller | 8 mm (H0,5/14, H1,5/14, H2,5/15) | **10 mm** |
| Weidmüller | 12 mm (H6,0/20) | 14 mm |
| Phoenix, AI 0,75-8 GY | 8 mm | **11 mm como máximo** |
| Phoenix, AI 6-12 GN | 12 mm | 15 mm como máximo |
| Phoenix, regla general (conductores hasta 10 mm²) | — | Largo del cobre más unos 3 mm |

Por tanto, para una puntera de "8" (la habitual para 0,75 y 1,5 mm²): **pela 10 mm** (Weidmüller) y nunca más de 11 mm (Phoenix). Para una de "10", pela 12 mm, o 13 mm como máximo (cálculo mío con las reglas de +2 mm de Weidmüller y +3 mm de Phoenix; no encontré un valor explícito para "10"). La WAGO 221 pide 11 mm de pelado y lleva un indicador en el lateral (ficha #20); una puntera de "8" de Phoenix, con 11 mm de pelado máximo, encaja con esa marca.

Resultado buscado: las hebras llegan hasta el borde de la puntera y sobresalen como mucho 0,5 mm ([Weidmüller](https://assets.dam.weidmueller.com/assets/api/adbb75f5-316f-41db-81c0-dd7dfacff88b/Original/MB_wire_end_ferrules_EN_WEB.pdf), [Phoenix](https://assets.phoenixcontact.com/file/257a95b8-0ae0-4b65-8476-514c169bc2ba/media/original)). Si lo pelas corto, el cobre no llega al final del tubo; si lo pelas largo, quedan hebras fuera del collarín.

**La longitud de la puntera tiene que caber en el borne.** No sé cuánto fondo tienen los bornes de la LRS-50-5, las WAGO ni los bornes USB-A (#18). Mide la profundidad del borne con calibre y elige 8 mm de cobre si hay duda (apartado 9).

## 6. Seguridad: 230 V, tierra y raíl de 5 V

### 6.1 Qué riesgo es cada uno (cálculo mío)

| Unión | Corriente | Qué pasa si el crimpado es malo | Gravedad |
|---|---|---|---|
| L y N de la LRS-50-5 | Unas décimas de amperio. La guía da 14 W típicos (0,1 A) | Con 0,1 A y 1 Ω de contacto se disipan 0,01 W. **El calor es irrelevante.** Lo peligroso es que el hilo se salga o dé contacto intermitente, que a 230 V puede formar arco | Alta |
| **FG (tierra) de la LRS-50-5** | Casi cero en uso normal (la guía da una fuga menor de 0,75 mA). En un fallo, la corriente que dispare el magnetotérmico o el diferencial | Si el crimpado tiene resistencia o se suelta, la carcasa conectada a FG queda con tensión sin protección. **Es la unión más importante de las punteras** | Muy alta |
| +V y −V de la LRS-50-5 y troncal de 5 V | 2,3 A típicos, 5 A de pico (guía) | Caída de tensión: ver tabla de abajo. Sube la temperatura de la unión | Media-alta |
| Ramas a Pi, pantalla, Solo y ZE29A | De 0,1 a 2 A | La Pi se reinicia o marca subtensión por debajo de 4,63 V | Media |

Caída de tensión en un crimpado según su resistencia, a los 5 A de pico de la guía (cálculo mío, V = I·R y P = I²·R):

| Resistencia del crimpado | Caída | Calor en la unión | Comentario |
|---|---|---|---|
| 10 mΩ | 0,05 V | 0,25 W | Aceptable |
| 50 mΩ | 0,25 V | 1,25 W | Se come casi la mitad del margen |
| 100 mΩ | 0,5 V | 2,5 W | El margen de la guía es 5,20 − 4,63 = 0,57 V antes de contar el cable |

La guía fija 5,20 V en la fuente y el umbral de subtensión de la Pi en 4,63 V (guía, §2.1 y §0). No tengo un valor de resistencia típica de un crimpado de punteras de una fuente; los de arriba son hipótesis. Un polímetro normal no resuelve esos milíohmios.

### 6.2 El borne de la fuente

Del manual de instalación de Mean Well ([Enclosed_Type_EN.pdf](https://www.meanwell.com/Upload/PDF/Enclosed_Type_EN.pdf), leído con una herramienta de resumen):

- La fila de la serie LRS (de la LRS-035 a la LRS-600, la LRS-50 incluida) indica tornillo **M3,5 y un par de 8-10**. **En mi lectura la tabla no daba la unidad.** La ficha de la fuente (#14) lo da en kgf·cm según otra copia del manual (montersi.pl), lo que equivale a unos 0,78-0,98 N·m (conversión mía). Con esto el valor queda **probable pero no confirmado** para la LRS-50-5.
- Tabla de calibre recomendada: AWG 18 (0,75 mm²) para hasta 6 A; AWG 14 (1,5 mm²) de 10 a 16 A. Con cinco o más hilos, reducir al 80 %.
- Pide que todos los hilos de un conductor entren en el borne y que los tornillos queden bien fijos para no dar mal contacto.
- **No menciona punteras, terminales ni longitud de pelado.** La puntera es una decisión de la guía, no una exigencia de Mean Well.

No pude abrir la hoja de datos LRS-50 de Mean Well (permiso sin contestar), así que **no sé la sección máxima de conductor que admite el borne ni el ancho útil**. Que la puntera de 1,5 mm² (collarín de unos 3,5 mm de diámetro) entre sin forzar es una comprobación que tienes que hacer tú.

### 6.3 Por qué una puntera en un cable flexible en un borne de tornillo

Lo que dicen las fuentes:

- Las punteras son para conductores de clase 2, 5 y 6; el conductor macizo (clase 1) no se admite ([Weidmüller](https://assets.dam.weidmueller.com/assets/api/adbb75f5-316f-41db-81c0-dd7dfacff88b/Original/MB_wire_end_ferrules_EN_WEB.pdf), [Phoenix](https://assets.phoenixcontact.com/file/257a95b8-0ae0-4b65-8476-514c169bc2ba/media/original)).
- Mean Well pide que entren todos los hilos del conductor.
- Wikipedia (DE) cita VDE 0100-520:2003-06 a propósito de las soldaduras en circuitos de potencia ([Wikipedia](https://de.wikipedia.org/wiki/Aderendh%C3%BClse)). No leí la norma ni sé qué exige.

Mi razonamiento: un cable flexible sin puntera tiene decenas de hebras finas. Algunas se escapan del tornillo, y una hebra suelta junto a un borne de L, N o FG es un cortocircuito o una fuga a tierra. La puntera junta las hebras, da al tornillo una superficie definida y el collarín las aísla. **No he podido leer EN 60999-1 ni IEC 60947-7-1**, así que no puedo decirte qué exigen sobre conductores flexibles; no cito cláusulas.

**El collarín no sujeta el cable.** Weidmüller lo dice expresamente: no da alivio de tracción. Un participante de un foro lo describe al revés ("alivio de tracción incorporado"), pero la fuente es el fabricante. Sujeta el cable con bridas cerca del borne.

### 6.4 Cuando la puntera falla

Una conexión suelta con carga puede calentarse y formar arco. Hay un caso en un foro de una máquina de café en el que el neutro suelto de la entrada IEC produjo un arco ([foro Vesuvius](https://www.tapatalk.com/groups/vesuvius/power-inlet-problem-and-solution-s-t475.html), citado en la ficha del módulo C14). Es una anécdota de una máquina de mucha más carga.

## 7. Cuántas punteras hacen falta y cuántas sobran

Cuenta mía a partir del cableado de la guía (§5.1 y §5.2). Supone una puntera por extremo de hilo que entra en un borne de tornillo o en una WAGO.

| Dónde | Cuántas | Sección |
|---|---|---|
| LRS-50-5: L, N y FG | 3 | 1,5 mm² |
| LRS-50-5: +V y −V | 2 | 0,75 mm² |
| WAGO: extremo del troncal (2), Solo (2), pantalla (2) | 6 | 0,75 mm² |
| WAGO: Pi (latiguillo de 22 AWG, 2) y ZE29A (2) | 4 | 0,34 mm² |
| Bornes USB-A (#18), dos unidades: VCC y GND de cada una | 4 | 0,75 mm² |
| Bornes USB-A: puente D+ / D− (2 extremos por unidad) | 0 a 4 | 0,34 o 0,75 mm² |
| **Total por máquina** | **de 5 a 23** | |

- **Mínimo, 5:** solo la fuente. **Máximo, 23:** puntera en cada hilo, también en las WAGO y con los puentes de los bornes USB-A. Los 12-20 que se manejaban caen en medio.
- **Las WAGO no necesitan puntera para el cable flexible.** Según la ficha #20 ([wago-221-surtido](../wago-221-surtido/README.md)), la hoja de WAGO de 2026 dice que no hace falta tratar los conductores, "por ejemplo, con punteras"; yo no abrí esa hoja. La ficha #20 plantea los 22 AWG sin puntera. Sin puntera en los hilos de 22 AWG (4) y con puntera en el troncal y los dos cables de 0,75 mm², las punteras bajan a 5 + 6 + 4 a 8 = unas 15 a 19. Sin puntera en ninguna WAGO, a unas 9 a 13.
- **Los bornes USB-A (#18) pueden no admitir la puntera de 0,75 mm².** La ficha #18 ([borne-usb-a-hembra-tornillo](../borne-usb-a-hembra-tornillo/README.md)) cita un bornero de paso 3,5 mm de Phoenix donde la puntera solo admite 0,25-0,5 mm². No sé qué bornero lleva el tuyo. Por eso en ese borne puede hacer falta la de 0,34 o 0,5 mm² o ir sin puntera.
- **Secciones que no usarás nunca:** 2,5, 4, 6 y 10 mm² (el mayor cable es el de 1,5 mm²).
- **Reparto del surtido: sin verificar.** Si fuera uniforme entre unas 8 secciones (hipótesis mía: 1250 ÷ 8 ≈ 156 de cada una), las punteras de 0,75 mm² darían para unas 10 máquinas si las pones en todos los hilos (hasta 16 por máquina) y para unas 80 si solo las usas en la fuente (2 por máquina). Las de 1,5 mm² (3 por máquina) darían para unas 50. Por orientación, un surtido de 3750 piezas de Rapid reparte entre 50 y 500 piezas por sección ([Rapid 13-3277](https://static.rapidonline.com/pdf/13-3277_v1.pdf)); no es el tuyo.
- **Cuenta las punteras al recibirlas** y apunta cuántas de 0,34, 0,75 y 1,5 mm² hay. Esa es la cifra que cuenta.

## 8. Fallos, bugs y problemas conocidos

La base de evidencia es **escasa**: no pude ver reseñas del anuncio, y Amazon bloquea el acceso. Lo que sigue combina lo que encontré (fabricantes y foros) con riesgos plausibles rotulados como míos.

| # | Problema | Gravedad para el proyecto | Fuente |
|---|---|---|---|
| 1 | La herramienta solo crimpa punteras (no ojales, faston ni Dupont/JST) | Alta (hueco de la guía) | Apartado 2 |
| 2 | Crimpado flojo: la puntera se sale del hilo | Alta en tierra y 230 V | HomemadeTools; mío |
| 3 | Hilo más fino que la puntera: crimpado en rombo | Media-alta | element14 (comentario) |
| 4 | Colores y secciones mezclados (tres códigos de color) | Media-alta | Phoenix; foro |
| 5 | Trinquete que no completa el ciclo | Media | Weidmüller; Knipex; Wiltronics |
| 6 | Mordazas desalineadas o con holgura | Media | Mío, sin fuente específica |
| 7 | Corte de hebras o hebras fuera del collarín por mal pelado | Media | Phoenix; Wikipedia DE |
| 8 | Pelado incorrecto (muy corto o muy largo) | Media | Weidmüller; Phoenix |
| 9 | Conductor macizo o de aluminio | Media | Weidmüller; Phoenix |
| 10 | Material de la puntera dudoso (cobre duro, estaño fino, collarín de PVC) | Media | Phoenix; Rapid; mío |
| 11 | Sin norma declarada: sin trazabilidad para el expediente CE | Media | Weidmüller; Rapid |
| 12 | La puntera no cabe en el borne (largo o diámetro) | Media | Mío |
| 13 | Creer que el collarín sujeta el cable | Baja | Weidmüller |
| 14 | Surtido con secciones inútiles y reparto desconocido | Baja | Apartado 7 |

### 8.1 Crimpado flojo

- En un hilo de HomemadeTools sobre un modelo autoajustable de mordazas tipo "iris", un participante dice que este tipo "nunca parece crimpar" la puntera tan apretada como las clásicas de trinquete y que ha visto terminaciones que se deslizan por el hilo. Otro participante, que tiene una herramienta barata de ese tipo, afirma lo contrario: que "aplastan la puntera" ([hilo, junio de 2021](https://homemadetools.net/forum/self-adjusting-crimping-pliers-gif-85731)). Dos opiniones sin medidas. **No lo sé: tienes que probar tu herramienta** (apartado 9).
- En la reseña de la Knipex, el autor hizo una prueba con hilo muy fino doblado dentro de la puntera: al tirar, el hilo se rompió pero no se salió ([element14](https://community.element14.com/products/roadtest/rv/roadtest_reviews/58/knipex-self-adjusting-crimping-plier-review)). Es una herramienta de unas 115 £, no la tuya.

### 8.2 Hilo más fino que la puntera

El autor de la reseña de la Knipex señala que un hilo más fino que la puntera puede deformar el crimpado en rombo o aplastado en vez de cuadrado ([element14](https://community.element14.com/products/roadtest/rv/roadtest_reviews/58/knipex-self-adjusting-crimping-plier-review)). Es una herramienta de marca; con una barata, sin ajuste de fábrica documentado, el efecto puede ser peor (mío). La puntera de 0,34 mm², para los hilos de 22 AWG, puede que no venga en tu surtido (mío; muchos surtidos empiezan en 0,5 mm²).

### 8.3 Trinquete

Weidmüller: el crimpado está completo cuando el trinquete se abre solo ([artículo](https://weidmueller.com/int/company/press/trade_press_news/crimping_the_right_way___made_easy.jsp)). Wiltronics: aprieta hasta que el mecanismo complete el ciclo y se libere ([Wiltronics](https://www.wiltronics.com.au/wiltronics-knowledge-base/how-to-crimp-insulated-wire-connectors/)). La Knipex no se abre hasta completar el crimpado, y tiene una palanca para abortarlo (element14). **No sé si tu herramienta tiene trinquete con liberación.** Si no lo tiene, un crimpado a medias no avisa.

### 8.4 Mal pelado

Phoenix y Wikipedia DE listan los defectos típicos: hebras sueltas fuera del collarín, grietas, puntera abierta, perfil asimétrico, rebabas, collarín dañado. Wikipedia añade que el control de calidad profesional usa cortes pulidos (micrografías). Phoenix y Weidmüller remiten a IEC/EN 60352-2 para los defectos de pelado y crimpado (no leída). La pelacables que uses importa tanto como la crimpadora: no cortes hebras.

### 8.5 Material de las punteras

Phoenix describe las suyas con tubo de cobre de pureza superior al 99,9 % (CU-DHP o CU-ETP), recocido, con dureza máxima de 105 HV y estaño de al menos 3 µm; collarín de polipropileno hasta 105 °C ([Phoenix](https://assets.phoenixcontact.com/file/257a95b8-0ae0-4b65-8476-514c169bc2ba/media/original)). Un surtido barato de Rapid (otro producto) declara aislante de PVC con 75 °C para las aisladas ([Rapid 13-3277](https://static.rapidonline.com/pdf/13-3277_v1.pdf)). **No sé de qué son las tuyas.** Un cobre duro o un latón se agrieta al crimpar. Un collarín de PVC con límite de 75 °C deja margen si la caja se mantiene por debajo de los 40 °C que pide la guía para el sensor; si se calienta más junto a la fuente, el límite se acerca (mío).

### 8.6 Sin norma ni trazabilidad

UL 486F aprueba puntera y herramienta juntas (Weidmüller), y EN 60352-2 recomienda herramienta y contacto del mismo fabricante. Un surtido genérico con una herramienta genérica no tiene ninguna de las dos garantías. Para el expediente de la máquina (RD 187/2016 según la guía), la forma de cubrirlo es **documentar tus propias pruebas de tracción**, no confiar en el anuncio. Weidmüller señala que a las punteras no se les puede poner marcado CE, así que no esperes uno en el embalaje.

## 9. Qué comprobar al recibirla

No sé qué traerá el anuncio. Este protocolo sirve igual.

### 9.1 Surtido

| Qué | Cómo | Criterio |
|---|---|---|
| Recuento por sección | Cuenta cada compartimento. Anota cuántas de 0,34, 0,75 y 1,5 | Sin faltas en las tres que usas (apartado 7) |
| Sección real | Calibre: diámetro del tubo de cobre (d1) de 5 punteras de cada sección | 0,34 mm²: 0,8 mm. 0,5: 1,0. **0,75: 1,2.** 1: 1,4. **1,5: 1,7.** 2,5: 2,2. 4: 2,8 ([Phoenix](https://assets.phoenixcontact.com/file/257a95b8-0ae0-4b65-8476-514c169bc2ba/media/original)). Tolerancia de un calibre barato, ± 0,1 mm |
| Colores | Compara con la tabla del apartado 3.4 | Si el gris de 0,75 mm² mide 2,8 mm de d1, es de 4 mm² o de otro código |
| Material | Mira el tubo: color cobre, estaño continuo, sin grietas. Crimpa una y revisa | Un tubo de latón (amarillo) o que se agrieta no vale |
| Collarín | Sin rebabas ni deformaciones. Entra el aislante del hilo hasta el fondo | — |
| Largo | l1 y l2 con calibre | En las punteras de "8": 14 mm de largo total y 8 mm de cobre visible, o cerca (tabla del apartado 3.4) |

### 9.2 Herramienta (en vacío)

| Qué | Cómo | Criterio |
|---|---|---|
| Alineación de mordazas | Cierra a fondo sin puntera y mira por la boca | Los cuatro bordes se juntan sin escalón |
| Holgura | Mueve las mordazas con la herramienta abierta | Sin juego lateral |
| Trinquete | Cierra poco a poco | Hace clic en cada diente y no se abre hasta el final. Hay palanca de liberación |
| Material | Deja la herramienta bajo una luz y comprueba el pulido y el óxido | — |

### 9.3 Crimpados de prueba

Haz 10 por cada sección que uses, con el cable real: 0,75 mm² en el cable de #21, 1,5 mm² en el de #22 y 0,34 mm² en un hilo de 22 AWG.

| Prueba | Cómo | Criterio | Fuente |
|---|---|---|---|
| Pelado | Pela 10 mm (puntera de 8 mm de cobre) | Sin hebras cortadas | Apartado 5 |
| Inspección visual (lupa o móvil con zoom) | Mira el extremo y el lateral | Sin hebras sueltas ni fuera del collarín. Las hebras llegan al borde y sobresalen unos 0,5 mm como mucho. Sin grietas ni puntera abierta. Collarín sin deformar. Sin rebabas excesivas | [Phoenix](https://assets.phoenixcontact.com/file/257a95b8-0ae0-4b65-8476-514c169bc2ba/media/original), [Wikipedia DE](https://de.wikipedia.org/wiki/Aderendh%C3%BClse) |
| Forma del crimpado | Mira la sección de la puntera | Cuadrado (o hexagonal, si es hexagonal) y simétrico. Un rombo o una "S" indican hilo fino o herramienta desajustada | Mío; element14 |
| Dimensión | Mide con calibre el ancho del crimpado en una cara | Anota el valor por sección. Será tu referencia (apartado 11) | Mío |
| Tracción manual | Tira con fuerza sostenida de cada una | No se mueve nada | Mío |
| **Tracción medida** | Sujeta la puntera en un borne de prueba apretado y cuelga un peso del cable durante un minuto, sin tirones. Una báscula colgante de equipaje de hasta 10 kg sirve | **0,75 mm²: aguanta 3,1 kg (30 N). 1,5 mm²: aguanta 4,1 kg (40 N)**; pasa si la puntera no se mueve (valores y criterio de [Phoenix](https://assets.phoenixcontact.com/file/257a95b8-0ae0-4b65-8476-514c169bc2ba/media/original); el montaje casero y los kg son míos) | Phoenix |
| Tracción hasta rotura | Con 3 unidades de cada sección | El máximo debe superar con holgura los 30 y 40 N | Phoenix |
| Corte | Corta a lo largo del crimpado una puntera de cada sección con un cortaalambres fino y mira la sección | Las hebras forman una masa compacta, sin huecos grandes ni hebras cortadas | Wikipedia DE (micrografías; esto es la versión casera, mía) |
| Todas las del lote de prueba | — | **Una sola que falle rechaza la herramienta o el lote** (criterio mío) | Mío |

### 9.4 Encaje en los bornes

Con todo sin tensión, mete una puntera crimpada en cada tipo de borne (los cinco de la LRS-50-5, una WAGO y un borne USB-A). Debe entrar sin forzar, sin que el tornillo toque el collarín, y sin sobresalir por el otro lado. En la WAGO, la palanca tiene que bajar plana y el cobre llegar al fondo (WAGO advierte de que el collarín puede reducir la sección máxima: ficha #20). Aprieta con destornillador dinamométrico al par del apartado 6.2 en la fuente y tira otra vez. Reaprieta tras unas horas de calor: es práctica general mía, el manual de Mean Well no lo dice.

Un crimpado cuadrado necesita un hueco de borne mayor que uno hexagonal de la misma área: unos 14 % más de diámetro, según un cálculo del autor de la reseña de [element14](https://community.element14.com/products/roadtest/rv/roadtest_reviews/58/knipex-self-adjusting-crimping-plier-review). Si tu herramienta crimpa cuadrado y un borne queda justo, esa es la causa más probable.

### 9.5 Conservar pruebas

Guarda fotos, el lote de las punteras, la factura y el registro de las pruebas de tracción. Son lo único que demuestra al evaluador de la máquina que el crimpado de tierra y red cumple una exigencia medida.

### 9.6 Cable de entrada

Antes de crimpar, mira las hebras del cable: debe tener muchas hebras finas (clase 5). Un cable "macizo" o de pocas hebras gruesas no admite puntera (Weidmüller, Phoenix). Raspa una hebra: debe ser cobre por dentro. Un cable plateado por fuera y gris por dentro es aluminio (CCA); Phoenix dice que los conductores de aluminio no se crimpan con punteras de cobre. Las fichas de los cables dan los criterios: para el H05VV-F de 1,5 mm² (#22), cobre desnudo de clase 5 y 13,3 Ω/km como máximo, con el cálculo de hebras ([cable-h05vv-f-3g1-5-5m](../cable-h05vv-f-3g1-5-5m/README.md)); para el de 0,75 mm² de 5 V (#21), que según su ficha puede ser un cable plano sin norma o incluso de CCA, la medida de resistencia y el recuento de hebras ([cable-2x0-75-rojo-negro-10m](../cable-2x0-75-rojo-negro-10m/README.md)). Yo no he visto esos anuncios.

## 10. Alternativas y segunda herramienta

### 10.1 Terminales preaislados (ojales #23, faston #27)

**Hace falta una segunda herramienta**, y lo justifican tres cosas:

1. Esta herramienta no los crimpa (apartado 2).
2. Al terminal crimpado se le exige más tracción que a la puntera (apartado 2): unos 89 N para AWG 18 y 133 N para AWG 16, en UL 486A.
3. Esos terminales forman parte del camino de tierra (ojales M4 del espárrago) y de la entrada de red (faston del módulo C14).

Opciones de las fuentes (todos son listados de distribuidor, no fichas de fabricante):

| Herramienta | Qué es | Precio visto | Fuente |
|---|---|---|---|
| CK 430021 | Alicate de trinquete para terminales aislados de 0,5-6 mm² (AWG 20-10), matrices rojo/azul/amarillo según código DIN, 220 mm. Declara 30 000 ciclos y lubricar cada 10 000 en ambientes sucios | **RS la da por no disponible** y a punto de retirar | [RS](https://ph.rs-online.com/web/p/crimp-tools/3438824) |
| Knipex 97 43 06 | RS lo lista como herramienta para terminales aislados de 0,25-6 mm² (AWG 20-10), 200 mm, con el lema "una herramienta para casi 1000 aplicaciones de crimpado". Eso sugiere un sistema de insertos intercambiables (deducción mía; **no sé si el precio incluye los insertos**) | 242,90 € + IVA (RS Irlanda, visto el 21-10-2026) | [RS](https://ie.rs-online.com/web/p/crimp-tools/2676882) |
| Knipex 97 22 240 | RS lo lista como herramienta para terminales aislados de 0,25-6 mm² (AWG 20-10), 240 mm, con cortatornillos M2,6-M5. **El listado mezcla campos; perfil y trinquete: no indicados** | 27,39 £ + IVA (RS Reino Unido, visto el 21-10-2026) | [RS](https://uk.rs-online.com/web/p/crimp-tools/2676871?gb=s) |
| Knipex 97 32 240 | RS lo lista para terminales de 0,5-6 mm², mezclando aislados y sin aislar. **Listado poco fiable** | No indicado | [RS](https://uk.rs-online.com/web/p/crimp-tools/1367425?gb=s) |

**Knipex 97 52 y 97 53: no las mezcles.** La ficha de los faston (#27) afirma que la serie 97 52 de Knipex es la de **terminales aislados** (perfil "F" u oval, 3 posiciones, 0,5-6 mm²) y que la 97 53 es la de punteras. Cita para ello a Rapid y a Knipex ([ficha #27](../kit-faston-aislados/README.md), apartado 4.1), y avisa de que la página de Knipex se contradice sobre si es para aislados o sin aislar. **No abrí esas páginas y no encontré en ninguna fuente una referencia "97 52 04".** Si alguien te recomienda la "97 52 04" como pinza de punteras, compruébalo antes: tómalo como pista, no como dato.

**Wiha, Facom y Klauke: sin fuente.** Las páginas oficiales de Knipex no abrieron. Para #23 y #27, busca un alicate de **trinquete** con matrices para 0,5-1,5 mm² (rojo) y 1,5-2,5 mm² (azul) y comprueba, en el anuncio, rango y trinquete con liberación. La ficha de los ojales (#23) cita una ficha de RS que describe una pinza de trinquete de 0,5 a 6 mm para todos los terminales aislados de un kit ([terminales-ojal-m4](../terminales-ojal-m4/README.md), apartado 5.1; no la he abierto). Wiltronics avisa de que hay que usar la cavidad que corresponde a cada terminal y completar el ciclo.

### 10.2 Dupont y JST-XH

| Herramienta | Qué dice la fuente | Precio visto | Fuente |
|---|---|---|---|
| Engineer PA-09 | Hilos de AWG 32 a 20. Cuatro matrices de 1,0 a 1,9 mm de ancho para terminales de paso 1,25 a 2,5 mm. Crimpa por separado el barril del conductor y el del aislante, con altura regulable. 175 mm, 135 g (Misumi) | 69 US$ (Tayda) | [Misumi](https://uk.misumi-ec.com/vona2/detail/223000766804/), [Tayda](https://www.taydaelectronics.com/hardware-tools/pa-09-micro-crimping-pliers-tool-awg32-to-awg20.html) |

- Tayda lista JST SH, GH, ZH, PH, XH, EH y XA, y "paso 1,25 y 2,5 mm". **No menciona Dupont.** Tayda también contradice a Misumi en el rango (AWG 28-20 en una parte de la página, 32-20 en el título). Un hilo de Digi-Key tiene el título "Engineer PA-09 20-32 AWG" (solo el título).
- **El SN-28B no lo encontré en ninguna fuente que abriera: sin verificar.**
- El hilo de Duet3D cita una herramienta multifunción de trinquete de bajo precio ("Paron JX-D5") que un participante dice que sirve para punteras y para barril abierto, y recomienda, en general, una herramienta por tipo de matriz ([Duet3D](https://forum.duet3d.com/post/88006)). Es una opinión de un usuario.
- Para los extremos Dupont de la Pi, la ficha de los cables JST-XH (apartado 5.11) ya da la alternativa de no crimpar y usar un puente Dupont hembra cortado por la mitad.

### 10.3 Una crimpadora de punteras de marca

Si tras las pruebas del apartado 9 la herramienta barata no cumple los 30 y 40 N en todos los crimpados de prueba, hay dos caminos: devolverla y probar otra de la misma clase, o comprar una de las de marca de la tabla 3.3. Mi criterio (no es una norma) para las uniones de 230 V y de tierra de la fuente: **o la herramienta barata supera la prueba en todos los crimpados y queda registrada, o se usa una de marca con norma declarada.** La Knipex 97 53 04 ronda las 115-124 £ según la reseña de element14 (fecha de la reseña no visible, precio no comprobado hoy).

## 11. Mantenimiento

| Qué | Dato | Fuente |
|---|---|---|
| Vida de una herramienta normalizada | Al menos 50 000 ciclos sin perder calidad (herramientas según DIN 41641-1). Weidmüller recomienda mantenimiento y comprobación periódicos | [Weidmüller](https://weidmueller.com/int/company/press/trade_press_news/crimping_the_right_way___made_easy.jsp) |
| Alicate de preaislados de marca | CK: 30 000 ciclos; lubricar al menos cada 10 000 en ambientes contaminados | [RS, CK](https://ph.rs-online.com/web/p/crimp-tools/3438824) |
| Knipex 97 53 04 | Presión calibrada en fábrica; el usuario no ajusta nada | [RS](https://uk.rs-online.com/web/p/crimp-tools/3368179), [element14](https://community.element14.com/products/roadtest/rv/roadtest_reviews/58/knipex-self-adjusting-crimping-plier-review) |
| La herramienta barata | **Sin dato de ciclos, de lubricación ni de repuestos** en los listados que leí | — |

Qué hacer (mío):

- **Referencia de calibración.** Con el protocolo del apartado 9.3, guarda 3 crimpados de cada sección (0,34, 0,75 y 1,5 mm²) con su ancho medido. Son tu patrón. Mide uno nuevo cada 200 crimpados o una vez al mes. Si el ancho se desvía de forma clara, para.
- **Prueba de tracción de control** (30 N y 40 N) al empezar cada tirada de máquinas.
- **Limpieza y aceite.** Quita el polvo de las mordazas y pon una gota de aceite fino en los pivotes de vez en cuando. Sin dato del fabricante.
- **Las mordazas se desgastan si crimpas fuera de rango** (hilo macizo, secciones por encima del rango, terminales que no son punteras). No lo hagas.
- **Recambio.** La herramienta cuesta menos de 16 € junto con las punteras (hoja). Una segunda unidad de reserva sale barata frente a una tirada de máquinas mal crimpadas. Si la usas en los 230 V, repite la prueba de tracción de control al empezar cada tirada.

## 12. Discrepancias con la guía de montaje

| # | La guía dice | Lo que he encontrado | Fuente |
|---|---|---|---|
| 1 | §1, #28: "Crimpadora autoajustable + 1250 punteras" y no incluye herramienta para ojales (#23), faston (#27) ni Dupont/JST (#7, #29) | **Se confirma el hueco** para ojales y Dupont/JST. Para faston aislados, no hay fuente que respalde que esta clase de herramienta los crimpe bien (un foro dice que sí en terminales pequeños, sin medir). Los fabricantes la declaran solo para punteras | Apartado 2 |
| 2 | §5.1 y §5.2: punteras de 1,5 mm² en L, N y FG, y de 0,75 mm² en +V y −V de la LRS-50-5 | Coherente con el calibre recomendado por Mean Well (AWG 18 hasta 6 A, AWG 14 de 10 a 16 A). **Mean Well no menciona punteras**: es decisión de la guía | [Mean Well](https://www.meanwell.com/Upload/PDF/Enclosed_Type_EN.pdf) |
| 3 | §1: "Unos 160 € son herramientas y kits que sobran: crimpadora, WAGO…" | La crimpadora se usa en cada máquina (5 a 23 punteras). Lo que sobra es el surtido, no la herramienta | Apartado 7 |
| 4 | §5.2: "Troncal… con puntera en la fuente" | Falta la **longitud de pelado**. Para punteras de 8 mm de cobre, 10 mm (Weidmüller) y 11 mm como máximo (Phoenix) | Apartado 5.3 |
| 5 | §5.1: "Faston en el C14; puntera en la LRS" | Correcto, pero necesita **dos herramientas**: la de este surtido para la LRS y otra de preaislados para el faston | Apartado 10 |
| 6 | §6: tierra 0,1 Ω y comprobador de 10-25 A | Coherente, y es la prueba que detectaría un crimpado malo en FG. Debe incluir también la unión de la puntera de FG de la LRS | Apartado 6.1 |
| 7 | §5.2: el troncal y todas las ramas llevan puntera en las WAGO | La ficha #20 recoge que WAGO dice que no hace falta puntera para el cable flexible (hoja de 2026, que yo no abrí). Sigue siendo útil en 0,75 mm² para el troncal, pero los 22 AWG pueden ir sin ella | Apartado 7 |
| 8 | §5.2: "VCC y GND en 0,75 mm²" en los bornes USB-A | Puede que la puntera de 0,75 mm² no quepa en el bornero (ficha #18). Pruébalo con una puntera real | Apartado 7 |

Puntos que tocan a otras piezas (una línea cada uno): #14 (par del borne M3,5 "8-10", unidad sin confirmar en mi lectura; sección máxima del borne desconocida), #18 (paso del bornero), #20 (puntera no necesaria, pelado de 11 mm), #21 y #22 (clase del conductor y CCA), #23 y #27 (herramienta de preaislados) y #7/#29 (herramienta de microterminales).

## 13. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Usa esta herramienta solo para punteras** y compra una segunda, de trinquete, para los ojales M4 y los faston (apartado 10). Sin ella, la tierra de la máquina depende de un crimpado que esta herramienta no puede hacer.
2. **Prueba el lote al recibirlo** (apartado 9): inspección, medida con calibre y tracción de 30 N (0,75 mm²) y 40 N (1,5 mm²). Si falla una, no uses la herramienta para la fuente. Guarda las pruebas para el expediente.
3. **Si las pruebas pasan en todos los crimpados, usa la herramienta para el 5 V y para L, N y FG de la fuente.** Para FG, mide además con un comprobador de 10-25 A (guía §6) el camino completo desde el espárrago hasta la carcasa, que incluye esa puntera. Si una sola falla, usa una herramienta de marca con norma declarada para los 230 V y la tierra (apartado 10.3).
4. **Sujeta los cables con bridas cerca del borne.** El collarín no sujeta (Weidmüller). El crimpado y el tornillo no deben cargar el cable.
5. **Elige las punteras de 8 mm de cobre y pela 10 mm**, y comprueba que caben en el borne antes de comprar más.
6. **Anota el reparto del surtido** y compra punteras de 0,75 y 1,5 mm² de una marca con norma declarada (Phoenix, Weidmüller u otra con ficha) cuando se acabe el surtido o para las máquinas que vayas a vender.
7. **Considera no poner puntera en los hilos de 22 AWG de las WAGO.** La ficha #20 recoge que WAGO no las exige. Te ahorras unas 4 punteras por máquina y 4 crimpados que podrían fallar. Mantén la puntera de 0,75 mm² en el troncal si quieres, y pruébala en la palanca (apartado 9.4).
8. **Etiqueta el color real de cada sección en la caja del surtido** con rotulador, medido con calibre. Así no dependes de un código de colores que no puedes comprobar.

## 14. Lo que no he podido verificar

- **El anuncio B0FQP6KDL4**: Amazon bloquea el acceso. No sé marca, rango, perfil (cuadrado, hexagonal o trapezoidal), si tiene trinquete con liberación, material, peso, qué norma declara, ni cuántas punteras de cada sección y de qué color trae. Una búsqueda del ASIN no lo devolvió. Un listado de ManoMano.es parecido: solo leí el título; la página no abrió.
- **El texto de DIN 46228-4, DIN 46228-1, IEC 60999-1, IEC 60947-1 y -7-1, IEC 60352-2, UL 486F y EN 60999-1:** de pago. Los valores de tracción vienen de Phoenix y Weidmüller. No leí la vista previa de IEC 60999-1 de VDE (robots.txt). No sé el perfil de crimpado que exige la norma; las fuentes dicen que hay varios perfiles válidos.
- **Qué exigen EN 60999-1 e IEC 60947-7-1** sobre conductores flexibles en bornes de tornillo, y los pares de apriete de esas normas: sin verificar. El razonamiento del apartado 6.3 es mío.
- **La tabla de Phoenix en Mouser** (85 N, 150 N): encabezados ilegibles. Mi atribución a normas de terminales es una hipótesis.
- **La columna UL 486F de colores** en el documento de Phoenix: no alineada. No sé qué color da UL 486F.
- **Las páginas oficiales de Knipex** (knipex.com y su ficha PDF EN) dieron error de la herramienta y no las rodeé. Los datos de Knipex salen de RS, Hoffmann, Sancogrup (secundaria) y de la ficha ES del 97 53 14. **No encontré ninguna "97 52 04".** Lo que digo de la serie 97 52 (terminales aislados) es de la ficha #27 y no lo he comprobado. Peso de la 97 53 04 (460 g): solo fuente secundaria.
- **Wiha, Facom, Klauke, Engineer SN-28B:** sin fuente. El Engineer PA-09 para Dupont: sin confirmar (las fuentes nombran JST y paso de 1,25 a 2,5 mm).
- **WAGO 221-415:** no abrí su ficha ni su hoja (la página de WAGO pidió un permiso que no se contestó; los documentos de RS que abrí eran de la serie 2231, otra). Lo que digo de las punteras en la 221 viene de la ficha #20, que cita la hoja de WAGO, y de nada más.
- **Hoja de datos LRS-50 de Mean Well:** permiso sin contestar. No sé la sección máxima ni el ancho útil del borne. La unidad del par (8-10) no salió en mi lectura del manual.
- **La página de McMaster** de terminales: leí los primeros 100 000 caracteres de unos 134 000.
- **Reseñas del anuncio de Amazon.es** (crimpado flojo, mordazas, trinquete): no accesibles. La evidencia sobre herramientas baratas es un hilo de foro con opiniones opuestas.
- **Vida útil, lubricación y repuestos de la herramienta barata:** sin datos.
- **Si el cable de #21 y el H05VV-F de #22 son de clase 5 (flexible) y de cobre puro:** sin verificar. No he visto sus anuncios; las fichas #21 y #22 dan los criterios.
- **Resistencia típica de un crimpado de puntera** en miliohmios: sin fuente. Los números del apartado 6.1 son hipótesis.
- **Precios de las alternativas:** solo los que vi en RS y Tayda el 21-10-2026. No miré Amazon.es.
- **Búsquedas:** usé unas 15 búsquedas web y el resto fueron páginas abiertas. Quedan abiertos los puntos de arriba.

## 15. Fuentes

Todos los enlaces, ordenados por tipo, y una lista de lo que no se pudo abrir, en [`enlaces.md`](enlaces.md).
