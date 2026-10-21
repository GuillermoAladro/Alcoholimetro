# SanDisk High Endurance microSDHC 32 GB

Tarjeta de memoria donde vive el sistema operativo y el programa del alcoholímetro (Raspberry Pi OS Lite + aplicación en Python).

- **Referencia exacta:** `SDSQQNR-032G-GN6IA` (con adaptador SD). Código de artículo SD1-500322, GTIN 0619659173067.
- **Fabricante:** Western Digital (marca SanDisk).

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales](#3-documentos-oficiales)
4. [Resistencia: qué dicen los números](#4-resistencia-qué-dicen-los-números)
5. [Fallos, riesgos y problemas conocidos](#5-fallos-riesgos-y-problemas-conocidos)
6. [Alternativas](#6-alternativas)
7. [Recomendaciones para el alcoholímetro](#7-recomendaciones-para-el-alcoholímetro)
8. [Lo que no he podido verificar](#8-lo-que-no-he-podido-verificar)
9. [Fuentes](#9-fuentes)

---

## 1. Resumen para el proyecto

- **Está pensada para grabar vídeo en bucle** (cámaras de coche, vigilancia), con escritura secuencial. SanDisk no publica ciclos de escritura ni TBW, y no indica ninguna clase A1/A2 de rendimiento aleatorio, que es lo que más usa un sistema operativo.
- **La resistencia oficial equivale a unos 29 TB escritos** (cálculo mío a partir de las 2.500 horas de vídeo que anuncia SanDisk). Con una raíz de solo lectura y pocas escrituras sobra de largo; con logs y fotos escritos en la tarjeta, no.
- **Las pruebas independientes no son concluyentes.** Una prueba de tres años con 351 tarjetas deja a SanDisk mal en algunos titulares y bien en el texto original; no incluye ninguna High Endurance de 32 GB.
- **La garantía de 2 años excluye por defecto el registro continuo de datos.** Hay una excepción para ciertos productos Endurance, pero el texto general no dice cuáles. Conviene preguntárselo a SanDisk por escrito.
- **Hay muchas falsificaciones de microSD en el mercado.** Hay que comprarla a un vendedor autorizado y probarla al recibirla.

## 2. Especificaciones

Fuentes: [ficha oficial de SanDisk](https://www.sandisk.com/products/memory-cards/microsd-cards/sandisk-high-endurance-uhs-i-microsd) y [ficha de welectron](https://www.welectron.com/SanDisk-SDSQQNR-032G-GN6IA-High-Endurance-microSD-Card-32-GB-100-MB-s) (las dos coinciden).

| Característica | Valor |
|---|---|
| Formato | microSDHC, 32 GB |
| Clase de velocidad | Class 10, UHS-I U3, V30 |
| Lectura secuencial | Hasta 100 MB/s |
| Escritura secuencial | Hasta 40 MB/s |
| Rendimiento aleatorio (A1/A2) | **No indicado** |
| Horas de grabación | Hasta 2.500 h de vídeo Full HD (menos en 4K) |
| Temperatura de funcionamiento | −25 a 85 °C |
| Temperatura sin funcionar | −40 a 85 °C |
| Resistencia | "A prueba de temperatura, agua, golpes y rayos X" (solo la tarjeta, sin el adaptador) |
| Garantía | 2 años, limitada |
| Dimensiones | 14,99 × 10,92 × 1,02 mm |
| Certificaciones | CE, FCC, C-Tick/RCM, UKCA, EAC, ICES |
| Incluye | Adaptador SD y 1 año de RescuePRO Deluxe (recuperación de datos, requiere registro) |

Notas:

- Las 2.500 horas se calculan con vídeo Full HD a 26 Mbps grabado en un solo dispositivo. Las velocidades son de pruebas internas y pueden ser menores según el dispositivo ([hoja técnica de la versión de 64 GB](https://media.bechtle.com/asrc/180712/1c4b3d4ee288fc9434f5175bf56070570/c3/-/bf1810916b55428dbd0b01cf136c1cea/microsdxc-64-go-sandisk-high-endurance-fiche-technique-1)).
- La hoja técnica de 64 GB no da rangos de temperatura; los de −25/85 °C salen de la web de SanDisk.
- Algunas tiendas publican datos erróneos. Por ejemplo, [Logics Technology](https://logicstechnology.com/products/sandisk-high-endurance-32-gb-class-10-uhs-i-u3-microsdhc) dice "20.000 horas" para la de 32 GB, cifra que corresponde a la de 256 GB.

## 3. Documentos oficiales

| Documento | Enlace |
|---|---|
| Ficha de producto 32 GB | [sandisk.com](https://www.sandisk.com/products/memory-cards/microsd-cards/sandisk-high-endurance-uhs-i-microsd) |
| Hoja de datos de la línea (PDF) | [data-sheet-high-endurance-uhs-i-microsd.pdf](https://www.sandisk.com/tools/documentRequestHandler?docPath=%2Fcontent%2Fdam%2Fdoc-library%2Fen_us%2Fassets%2Fpublic%2Fsandisk%2Fproduct%2Fmemory-cards%2Fhigh-endurance-uhs-i-microsd%2Fdata-sheet-high-endurance-uhs-i-microsd.pdf) |
| Hoja técnica (versión 64 GB, en francés) | [Bechtle](https://media.bechtle.com/asrc/180712/1c4b3d4ee288fc9434f5175bf56070570/c3/-/bf1810916b55428dbd0b01cf136c1cea/microsdxc-64-go-sandisk-high-endurance-fiche-technique-1) |
| Garantía limitada de SanDisk | [sandisk.com](https://www.sandisk.com/support/store/warranty-policy/sandisk) |
| Información sobre las horas de grabación | [sandisk.com/proof](https://www.sandisk.com/proof) |
| Compatibilidad Full HD y 4K | [sandisk.com/HDUHS](https://www.sandisk.com/HDUHS) |
| Clases de velocidad (SD Association) | [sdcard.org](https://www.sdcard.org/consumers/speed) |

> **No he podido leer el PDF oficial de la hoja de datos** (el servidor de SanDisk dio error), y el entorno donde preparé esto no puede descargar archivos. Los datos de la tabla salen de la web oficial y de la hoja de 64 GB. Si descargas el PDF y me lo pasas, lo subo a una carpeta `datasheets/` y compruebo que no contradice nada.

## 4. Resistencia: qué dicen los números

### Lo que anuncia SanDisk

SanDisk da la resistencia en **horas de grabación de vídeo**, no en datos escritos ni en ciclos de borrado:

| Capacidad | Horas anunciadas | Escritura equivalente (cálculo) |
|---|---|---|
| 32 GB | 2.500 h | ≈ 29 TB |
| 64 GB | 5.000 h | ≈ 58 TB |
| 128 GB | 10.000 h | ≈ 117 TB |

El cálculo es mío: 26 Mbps equivalen a unos 11,7 GB por hora, y 2.500 h × 11,7 GB ≈ 29 TB, es decir, **unas 900 escrituras completas de la tarjeta**. Cuadra con el valor de 117 TBW que publica un [comparador de terceros](https://mightygadget.com/reliability-of-microsd-endurance-cards-compared/) para la de 128 GB, pero **SanDisk no publica un TBW oficial**.

Un artículo de [CDRinfo](https://www.cdrinfo.com/d7/content/sandisk-high-endurance-512gb-microsdxc) cita el ensayo de un aficionado con una de 32 GB que habría pasado de 2.000 reescrituras completas y 70 TB. Es un dato de foro, sin verificar.

### Qué hay dentro

Un desmontaje de la versión de **128 GB** ([RipItApart, 2020](https://ripitapart.com/2020/07/16/reverse-engineering-and-analysis-of-sandisk-high-endurance-microsdxc-card/)) encontró flash **3D TLC (3 bits por celda)**, no SLC ni MLC. No pudo identificar el controlador con certeza. Un comentario de lector sugiere que "alta resistencia" tiene más que ver con la temperatura que con las escrituras; es una opinión sin verificar. **No sé qué flash lleva la de 32 GB.**

## 5. Fallos, riesgos y problemas conocidos

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | Garantía que excluye el registro continuo de datos | Media-alta |
| 2 | Resultados de pruebas independientes contradictorios | Media |
| 3 | Falsificaciones | Alta si se compra mal |
| 4 | Rendimiento aleatorio no especificado | Media |
| 5 | Cortes de luz con flash TLC | Alta, se mitiga por configuración |
| 6 | Datos de marketing inconsistentes entre tiendas | Baja |

### 5.1 Garantía

La [garantía limitada de SanDisk](https://www.sandisk.com/support/store/warranty-policy/sandisk) excluye, entre otros, el uso en videovigilancia, cámaras de coche, grabadores continuos y **registro continuo de datos (como servidores)**.

- En la versión para América (no EE. UU.), esas exclusiones no se aplican a las tarjetas *High Endurance Video Monitoring*.
- En la versión general, la excepción es para "select Sandisk Endurance products", sin nombrar ningún modelo.
- **No me queda claro si una máquina que registra pagos, fotos y resultados cuenta como uso normal.** Con la raíz en solo lectura el problema casi desaparece, pero merece una pregunta por escrito al soporte.
- Para reclamar hace falta la prueba de compra (fecha, tienda) y un número de autorización de devolución. SanDisk no se hace responsable de la pérdida de datos.
- La garantía solo cubre producto original.

### 5.2 Pruebas independientes: resultados contradictorios

Matt Cole (u/mikaey00) lleva tres años sometiendo microSD a ciclos de escritura, verificación y borrado hasta que fallan. En agosto de 2026 la prensa resumió la prueba así:

- [Hardware Busters](https://hwbusters.com/news/a-three-year-microsd-endurance-test-has-written-133-petabytes-and-killed-177-cards/) y Tom's Hardware: **6 de las 7 tarjetas SanDisk de alta resistencia habrían fallado**. Ninguno de los dos artículos identifica los modelos.
- [Analytics Insight](https://www.analyticsinsight.net/tech-news/351-microsd-cards-tested-for-3-years-177-failed-full-test-results): las **High Endurance de 64 GB, las tres, fallaron**.
- [GIGAZINE](https://gigazine.net/gsc_news/en/20260821-microsd-card-test-3-years/): en la categoría de alta durabilidad, SanDisk quedó bien (más de 16.000 ciclos de media). Cole concluye que las tarjetas de alta durabilidad no son significativamente mejores que las de consumo.
- El [artículo original de Cole](https://www.bahjeez.com/the-great-microsd-card-survey-two-years-later/) da, para la **High Endurance de 64 GB**, 3 tarjetas con 9.637 ciclos de media **sin haber superado todavía el umbral de fallo del 0,1 %** (pruebas aún en curso cuando se escribió).

**Mi lectura:** las fuentes no cuadran entre sí y no he podido abrir la base de datos de Cole, así que no sé quién tiene razón. Lo que sí es seguro:

- **No hay ninguna High Endurance de 32 GB en el estudio**; la más cercana es la de 64 GB.
- La prueba es "de tortura": escribe la tarjeta entera una y otra vez sin parar. Es un uso mucho más duro que el de una máquina con raíz de solo lectura. Cole mismo dice que los tests "no han sido completamente científicos".
- Las tarjetas **industriales** salieron mucho mejor (unos 122.000 ciclos de media, 15 tarjetas probadas).

Proyecto y datos: [The Great microSD Card Survey](https://www.bahjeez.com/the-great-microsd-card-survey/) (datos de durabilidad actualizados el 28-3-2026).

### 5.3 Falsificaciones

Las microSD falsas, también con la marca SanDisk, son un problema recurrente: hay varios hilos sobre ello en el propio foro de la marca. Señales y herramientas, según el [foro de SanDisk](https://forums.sandisk.com/t/fake-micro-sd-cards/34274) y [otro hilo](https://forums.sandisk.com/t/how-can-i-check-if-my-microsd-card-is-genuine/417187):

- Precio sospechosamente bajo, envase sin sello o con impresión borrosa, capacidad anunciada que no encaja con el formato (una "SDHC" de 64 GB no existe).
- Con una falsa, los archivos desaparecen al pasar la capacidad real, y la velocidad de escritura sostenida es muy baja (unos 10–18 MB/s en el hilo, para una tarjeta de gama alta).
- **H2testw** (Windows): modo *Write + Verify* sobre toda la tarjeta. Un error o "capacidad inestable" delata una falsa. Borra todo.
- SanDisk recomienda comprar solo a distribuidores autorizados. Para dudas, soporte pide fotos de la tarjeta, el envase y el recibo.
- Pagar con tarjeta de crédito da protección si el vendedor no responde.

### 5.4 Rendimiento aleatorio

- La ficha solo da Class 10, U3 y V30: medidas de **escritura secuencial para vídeo**. No lleva clase A1 ni A2.
- Raspberry Pi documenta que sus propias tarjetas A2 hacen unos 3.200 IOPS de lectura y 1.200 de escritura (4 kB) en la Pi 4 ([documentación oficial](https://www.raspberrypi.com/documentation/accessories/sd-cards.html)).
- En una comparativa de 2018 en Pi 3B+, la mejor en lectura y escritura aleatoria de 4 kB fue la Samsung Evo+, que tampoco tenía clase A1 ([Jeff Geerling](https://www.jeffgeerling.com/blog/2018/raspberry-pi-microsd-card-performance-comparison-2018/)).
- **No he encontrado medidas de IOPS aleatorios de esta tarjeta.** Es de esperar que no destaque en eso; arranque y apertura de programas pueden ir algo más lentos que con una tarjeta A1/A2. Sin verificar.

### 5.5 Cortes de luz

- Un corte de corriente durante una escritura es una de las causas principales de corrupción ([PiSignage](https://blog.pisignage.com/how-to-optimize-raspberry-pi-for-24-7-digital-signage-complete-guide/), blog de un fabricante de señalización, con cifras sin metodología publicada).
- **No he encontrado ninguna información de que esta tarjeta tenga protección frente a cortes de alimentación.** Hay un hilo del foro de Raspberry Pi, [Power-failure tolerant SD card](https://forums.raspberrypi.com/viewtopic.php?t=240106), que no pude abrir.
- La defensa real es de configuración: raíz de solo lectura, logs en RAM y apagado limpio cuando sea posible.

### 5.6 Datos inconsistentes

Hay tiendas con cifras equivocadas (horas, temperaturas). Usa solo la web de SanDisk y su hoja técnica como referencia.

## 6. Alternativas

Datos de comparadores de terceros basados en fichas de fabricante, no medidos por mí:

| Tarjeta | Resistencia declarada | Garantía | Fuente |
|---|---|---|---|
| SanDisk High Endurance (esta) | 2.500 h (32 GB) | 2 años | SanDisk |
| SanDisk Max Endurance | 60.000 h y 702 TBW (128 GB) | 10 años | [Mighty Gadget](https://mightygadget.com/reliability-of-microsd-endurance-cards-compared/) |
| Samsung PRO Endurance (2022) | 70.080 h y 820 TBW (128 GB) | 5 años | [Mighty Gadget](https://mightygadget.com/reliability-of-microsd-endurance-cards-compared/) |
| Industriales (SLC/pSLC) | Unos 122.000 ciclos en la prueba de Cole | Varía | [GIGAZINE](https://gigazine.net/gsc_news/en/20260821-microsd-card-test-3-years/) |

La diferencia entre la High Endurance y la Max Endurance es grande: según el desmontaje de RipItApart, la Max usa la misma flash en modo pMLC y su especificación es unas 6 veces mayor (dato de un comentario del autor). **No he comprobado qué capacidades de estas tarjetas existen ni su disponibilidad en Amazon**, que es la regla del proyecto.

## 7. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Comprar solo a un vendedor autorizado** y guardar el recibo. Probar la tarjeta con H2testw nada más recibirla, mientras dure el plazo de devolución.
2. **Raíz de solo lectura** y logs en RAM. Es lo que de verdad alarga la vida de la tarjeta, sea cual sea la marca. Las fotos de la cámara deberían ir a RAM o a otro soporte, no a esta tarjeta.
3. **Una imagen maestra por máquina y una tarjeta de repuesto ya preparada.** Con una máquina parada en un bar, cambiar la tarjeta es la reparación más rápida.
4. **Escribir a SanDisk (support@SanDisk.com, según su política)** preguntando si el uso en una máquina de pago, con registro de transacciones, entra en la garantía de la High Endurance. Guardar la respuesta.
5. **Valorar la Max Endurance o una industrial** si el presupuesto lo permite: cuestan más, pero la resistencia declarada es mucho mayor y la garantía llega a 10 años. Revisa que existan en Amazon.
6. **Medir el desgaste** en las primeras semanas: cuántos GB se escriben al día. Si son pocos, la High Endurance sobra; si son muchos, hay que reducir escrituras antes de cambiar de tarjeta.
7. **Capacidad:** 32 GB bastan para el sistema y la aplicación. Una tarjeta más grande reparte mejor el desgaste, pero eso lo dice un blog de un fabricante ([PiSignage](https://blog.pisignage.com/how-to-optimize-raspberry-pi-for-24-7-digital-signage-complete-guide/)); no lo he comprobado.

## 8. Lo que no he podido verificar

- **La hoja de datos oficial en PDF:** el servidor devolvió error. Uso la web y la hoja de 64 GB.
- **La base de datos de Matt Cole:** no he podido ver las filas de SanDisk, así que no sé cuál de las versiones de prensa es la correcta.
- **Qué flash y qué controlador lleva la de 32 GB:** el desmontaje es de la de 128 GB.
- **Rendimiento aleatorio (IOPS) de esta tarjeta.**
- **Protección frente a cortes de alimentación.**
- **Qué cubre exactamente la garantía en este uso:** el texto general no nombra el modelo.
- **Los hilos del foro de Raspberry Pi** sobre la High Endurance ([t=182452](https://forums.raspberrypi.com/viewtopic.php?t=182452), [t=347981](https://forums.raspberrypi.com/viewtopic.php?t=347981)) y sobre fiabilidad a largo plazo ([t=357381](https://forums.raspberrypi.com/viewtopic.php?t=357381)): los encontré pero no pude abrirlos.
- **Disponibilidad en Amazon** de esta tarjeta y de las alternativas.

## 9. Fuentes

- [SanDisk: ficha del producto High Endurance microSD](https://www.sandisk.com/products/memory-cards/microsd-cards/sandisk-high-endurance-uhs-i-microsd)
- [SanDisk: hoja de datos (PDF)](https://www.sandisk.com/tools/documentRequestHandler?docPath=%2Fcontent%2Fdam%2Fdoc-library%2Fen_us%2Fassets%2Fpublic%2Fsandisk%2Fproduct%2Fmemory-cards%2Fhigh-endurance-uhs-i-microsd%2Fdata-sheet-high-endurance-uhs-i-microsd.pdf)
- [SanDisk: garantía limitada](https://www.sandisk.com/support/store/warranty-policy/sandisk)
- [Hoja técnica de 64 GB (Bechtle)](https://media.bechtle.com/asrc/180712/1c4b3d4ee288fc9434f5175bf56070570/c3/-/bf1810916b55428dbd0b01cf136c1cea/microsdxc-64-go-sandisk-high-endurance-fiche-technique-1)
- [welectron: SDSQQNR-032G-GN6IA](https://www.welectron.com/SanDisk-SDSQQNR-032G-GN6IA-High-Endurance-microSD-Card-32-GB-100-MB-s)
- [Logics Technology: SDSQQNR-032G-GN6IA](https://logicstechnology.com/products/sandisk-high-endurance-32-gb-class-10-uhs-i-u3-microsdhc)
- [CDRinfo: SanDisk High Endurance 512 GB](https://www.cdrinfo.com/d7/content/sandisk-high-endurance-512gb-microsdxc)
- [Mighty Gadget: fiabilidad de tarjetas de resistencia](https://mightygadget.com/reliability-of-microsd-endurance-cards-compared/)
- [RipItApart: desmontaje de la High Endurance de 128 GB](https://ripitapart.com/2020/07/16/reverse-engineering-and-analysis-of-sandisk-high-endurance-microsdxc-card/)
- [The Great microSD Card Survey (Matt Cole)](https://www.bahjeez.com/the-great-microsd-card-survey/) y [su análisis a dos años](https://www.bahjeez.com/the-great-microsd-card-survey-two-years-later/)
- [Hardware Busters: prueba de tres años](https://hwbusters.com/news/a-three-year-microsd-endurance-test-has-written-133-petabytes-and-killed-177-cards/)
- [Analytics Insight: resultados completos](https://www.analyticsinsight.net/tech-news/351-microsd-cards-tested-for-3-years-177-failed-full-test-results)
- [GIGAZINE: prueba de tres años](https://gigazine.net/gsc_news/en/20260821-microsd-card-test-3-years/)
- [Foro de SanDisk: tarjetas falsas](https://forums.sandisk.com/t/fake-micro-sd-cards/34274) y [cómo comprobar si es original](https://forums.sandisk.com/t/how-can-i-check-if-my-microsd-card-is-genuine/417187)
- [Raspberry Pi: tarjetas SD](https://www.raspberrypi.com/documentation/accessories/sd-cards.html)
- [Jeff Geerling: comparativa de microSD en Pi 3B+ (2018)](https://www.jeffgeerling.com/blog/2018/raspberry-pi-microsd-card-performance-comparison-2018/)
- [PiSignage: Raspberry Pi 24/7](https://blog.pisignage.com/how-to-optimize-raspberry-pi-for-24-7-digital-signage-complete-guide/)
