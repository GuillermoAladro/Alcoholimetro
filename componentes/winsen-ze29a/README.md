# Winsen ZE29A-C2H5OH (módulo de alcohol en aliento, UART)

Es la pieza que mide. Un módulo de Winsen con sensor electroquímico de etanol, sensor de presión de soplido y lógica propia que gobierna el ciclo de prueba. La Raspberry Pi le manda órdenes por UART y el módulo se encarga de detectar el soplido, tomar la muestra y devolver un valor.

- **Compra:** ASIN B0H8NVXVG5, 108,46 € (precio de la hoja de componentes del 19-20-10-2026). En la hoja figura como "módulo suelto".
- **Fabricante:** Zhengzhou Winsen Electronics Technology Co., Ltd. (China).

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta, así que no he podido ver el anuncio: el precio y la referencia son los de tu hoja, y lo que digo del anuncio (placa WS19, conector "Rx Tx GND 5V") viene de tu guía de montaje.

> **Actualización 21-10-2026 (anuncio de Amazon.es leído).** Después de escribir esta ficha pude abrir el anuncio con el navegador integrado, así que lo que dice arriba de que Amazon bloquea el acceso ya no vale para esta pieza. Lo que cambia: las fotos muestran un módulo verde (placa WS190626240-V1.0) con un conector J1 blanco de 4 vías en un borde corto y la serigrafía «Rx Tx GND 5V». Cuadra con el manual si el pin 1 es el extremo «5V». El paso del conector no consta (en la foto la carcasa mide unos 11 a 12 mm: cálculo mío). El anuncio no dice si trae cable. Ver el [detalle y origen de cada dato](../../montaje-general/anuncios-amazon-21-10-2026.md).
>
> Mis herramientas web **resumen** las páginas y los PDF; no puedo descargar archivos. Para compensarlo, recalculé a mano las 18 tramas de ejemplo del manual (ver [sección 4](#4-verificación-de-la-guía-de-montaje-24)): todas cuadran, así que la transcripción del protocolo es fiable. Aun así, abre el PDF para los detalles de dibujo (conector, tubo).

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales](#3-documentos-oficiales)
4. [Verificación de la guía de montaje (§2.4)](#4-verificación-de-la-guía-de-montaje-24)
5. [Protocolo e integración (listo para código)](#5-protocolo-e-integración-listo-para-código)
6. [Medida: unidades, sensibilidad cruzada y calibración](#6-medida-unidades-sensibilidad-cruzada-y-calibración)
7. [Fallos, bugs y problemas conocidos](#7-fallos-bugs-y-problemas-conocidos)
8. [Marco legal](#8-marco-legal)
9. [Compra: precio, vendedores y autenticidad](#9-compra-precio-vendedores-y-autenticidad)
10. [Alternativas](#10-alternativas)
11. [Recomendaciones para el alcoholímetro](#11-recomendaciones-para-el-alcoholímetro)
12. [Lo que no he podido verificar](#12-lo-que-no-he-podido-verificar)
13. [Fuentes](#13-fuentes)

---

## 1. Resumen para el proyecto

- **No es un sensor que da ppm: es un módulo de "prueba de aliento" con su propia máquina de estados.** Detecta el soplido (sensor de presión), toma la muestra con un electroimán y devuelve un único resultado en **mg/100 mL** (equivalente en sangre, convención china). No hay lectura continua ni valor bruto. ([manual V1.1](https://www.winsen-sensor.com/d/files/manual/ze29a-c2h5oh.pdf) ([copia local](datasheets/ze29a-c2h5oh.pdf)))
- **El manual V1.1 no da vida útil, deriva, intervalo de calibración, humedad ni tiempo de recuperación.** Tampoco hay ningún comando para calibrar ni para leer el valor bruto. Con este módulo no puedes ver desde la Pi si el sensor deriva, salvo con pruebas de control (aire limpio y un patrón). Hay que pedir esos datos a Winsen **antes** de fabricar en serie.
- **La guía de montaje acierta casi todo.** Pines, protocolo, checksum, estados, tiempos y rangos coinciden con el manual. Cuatro matices importantes: "el módulo no empieza solo" **no está en el manual** (es una deducción); la conversión **÷220 a mg/L** tampoco; la vida de "unos 2 años" es de **otros** modelos de Winsen; y el conector **JST-XH no está confirmado** (el manual solo da 4 pines). El checksum `48` del foro de Arduino es **erróneo**: el correcto es `46`. Detalle en la [sección 4](#4-verificación-de-la-guía-de-montaje-24).
- **El rango de trabajo es 10–40 °C y no hay dato de humedad.** El aliento sale a unos 34–35 °C y húmedo; la condensación en el tubo es un riesgo real (el fabricante de celdas Dart pide un recorrido corto y calentado ≥ 35 °C).
- **La exactitud declarada (±0,05 mg/L) es peor que la de un etilómetro legal** (±0,020 a ±0,030 mg/L según OIML R 126). Es coherente con usarlo como aparato orientativo, no como instrumento de medida.
- **Marco legal: la orden que cita la hoja de tareas (ITC/3707/2006) está derogada** desde el 24-10-2020 por la Orden ICT/155/2020, que ahora incluye los etilómetros en su Anexo XIII. **No he podido leer ese anexo**, así que no puedo decir si una máquina recreativa de monedas entra o no. Ver [sección 8](#8-marco-legal).
- **Precio:** la tienda de Winsen lo anuncia a **58,00 USD** (no sé si incluye el envío); tu hoja marca 108,46 € en Amazon. No encontré el ZE29A en Mouser, DigiKey ni AliExpress (búsqueda limitada). Ver [sección 9](#9-compra-precio-vendedores-y-autenticidad).

## 2. Especificaciones

Fuente principal: [manual V1.1](https://www.winsen-sensor.com/d/files/manual/ze29a-c2h5oh.pdf) ([copia local](datasheets/ze29a-c2h5oh.pdf)) (sin fecha). La copia de [robu.in](https://robu.in/wp-content/uploads/2023/02/ZE29A-DATASHEET.pdf) tiene las mismas cifras. "Ficha" = [página del producto](https://www.winsen-sensor.com/product/ze29a-c2h5oh.html).

| Característica | Valor | Fuente |
|---|---|---|
| Modelo | ZE29A-C2H5OH | Manual |
| Principio | Electroquímico. La tabla del manual dice "fuel cell" (celda de combustible) y el texto dice "electrochemical"; es el mismo tipo de celda | Manual, ficha |
| Electrodos (2 o 3) | **No indicado.** La celda hermana ME2-C2H5OH nombra electrodo de trabajo y de referencia (dos) | [ME2 Ф16](https://www.winsen-sensor.com/d/files/manual/me2-c2h5oh-%D1%8416.pdf). Sin verificar para el ZE29A |
| Gas objetivo | Etanol exhalado | Manual |
| Alimentación | 5 V ± 0,3 V (de 4,7 a 5,3 V) | Manual |
| Corriente de trabajo | < 500 mA (sin valor típico) | Manual |
| Salida | UART, 3,3 V TTL | Manual |
| Parámetros de UART | 9600 baudios, 8 bits, 1 stop, sin paridad. Dirección fija 0x01 | Manual |
| Calentamiento | ≤ 10 s (estado 0x32) | Manual |
| Rango | 0 a 1,0 mg/L | Manual |
| Exactitud | ± 0,050 mg/L si C < 0,400 mg/L; ± 10 % si C ≥ 0,400 mg/L | Manual |
| Resolución | **No indicada.** El resultado es un entero en mg/100 mL; 1 unidad ≈ 0,0045 mg/L si se divide por 220 (cálculo mío) | Manual + cálculo |
| Detección de soplido | 4 s seguidos (configurable, 1 a 10 s), caudal ≥ 10 L/min | Manual |
| Compensación | Sensor de temperatura interno y sensor de presión integrado | Ficha |
| Tiempo de respuesta y de recuperación | **No indicados.** Ciclo de prueba: ver [sección 5](#estados-y-tiempos) | Manual |
| Deriva, vida útil, intervalo de calibración | **No indicados** | Manual |
| Temperatura de trabajo | 10 a 40 °C | Manual |
| Temperatura de almacenamiento | −10 a 70 °C | Manual |
| Humedad | **No indicada** | Manual |
| Tamaño | 85 × 33 × 18 mm. Sin plano, sin taladros de fijación | Manual |
| Conector | 4 pines: Vin, GND, TXD, RXD. **Tipo y paso no indicados** | Manual |
| Otras interfaces | La ficha web habla de "rich communication interfaces" y de un "interfaz 1602 reservado". El manual **solo documenta UART** | Ficha |
| Alarmas | Dos niveles (bebido / ebrio), por defecto 20 y 80 mg/100 mL | Manual |
| Certificaciones, SDS, plano 3D | **No encontré ninguno** | — |
| Contacto del fabricante | sales@winsensor.com, +86-371-67169097 / 67169670 | Manual |

Conversiones de unidades que uso en esta ficha (todas **cálculo mío**):

- 1 g/L = 100 mg/100 mL.
- Etanol en aire a 25 °C y 1 atm: 1 mg/L ≈ 530 ppm. Es decir, 0,25 mg/L ≈ 133 ppm y el fondo de escala (1,0 mg/L) ≈ 530 ppm. Por eso un sensor ambiental de 0–5 ppm no sirve para aliento.

## 3. Documentos oficiales

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Manual de usuario ZE29A-C2H5OH | V1.1, sin fecha | PDF | [descargar](https://www.winsen-sensor.com/d/files/manual/ze29a-c2h5oh.pdf) ([copia local](datasheets/ze29a-c2h5oh.pdf)) |
| Copia del manual (distribuidor robu.in) | V1.1; subida 02/2023 según la ruta | PDF | [descargar](https://robu.in/wp-content/uploads/2023/02/ZE29A-DATASHEET.pdf) |
| Copia en HTML (manuals.plus) | Sin versión; tiene un apartado "Dimension" vacío | Web | [abrir](https://manuals.plus/winsen/ze29a-c2h5oh-alcohol-sensor-module-manual) |
| Ficha de producto de Winsen | — | Web | [abrir](https://www.winsen-sensor.com/product/ze29a-c2h5oh.html) |
| Tienda Winsen (precio) | — | Web | [abrir](https://shop.winsen-sensor.com/products/ze29a-c2h5oh-electrochemical-alcohol-module) |
| Manual de la celda hermana ME2-C2H5OH-Ф16 | V1.2, sin fecha | PDF | [descargar](https://www.winsen-sensor.com/d/files/manual/me2-c2h5oh-%D1%8416.pdf) |
| Manual de la celda hermana ME2-C2H5OH-13×13 | V1.2, 26-7-2022 | PDF | [descargar](https://www.winsen-sensor.com/d/files/manual/me2-c2h5oh-13%C3%9713.pdf) |
| Manual del ZE31-C2H5OH (ambiental, **no** aliento) | No abierto | PDF | [descargar](https://www.winsen-sensor.com/d/files/manual/ze31-c2h5oh.pdf) |
| Hoja de datos de celda de aliento Dart 16 mm (referencia de la industria) | — | PDF | [descargar](https://www.dart-sensors.com/wp-content/uploads/2021/10/16mm_breath_alcohol_sensor_product_datasheet.pdf) ([copia local](datasheets/16mm_breath_alcohol_sensor_product_datasheet.pdf)) |
| OIML R 126 (2012), analizadores de aliento evidenciales | R 126 ed. 2012 | PDF | [descargar](https://www.oiml.org/en/files/pdf_r/r126-e12.pdf) ([copia local](datasheets/r126-e12.pdf)) |
| Orden ITC/3707/2006 (derogada) | BOE núm. 292, 7-12-2006 | PDF | [descargar](https://www.boe.es/boe/dias/2006/12/07/pdfs/A42985-42990.pdf) ([copia local](datasheets/A42985-42990.pdf)) |
| Orden ICT/155/2020 (vigente; Anexo XIII = etilómetros) | BOE núm. 47, 24-2-2020 | PDF | [descargar](https://www.boe.es/boe/dias/2020/02/24/pdfs/BOE-A-2020-2573.pdf) |
| NHTSA, interferencia de acetona (Flores y Frank) | DOT HS 806 922, 1985 | PDF | [descargar](https://rosap.ntl.bts.gov/view/dot/1406/dot_1406_DS1.pdf) |
| Intoximeters, libro blanco de celdas de combustible | Sin fecha (datos de los años 90) | Web | [abrir](https://www.intox.com/fuel-cell-white-paper/) |

**No existe (o no encontré)** para el ZE29A: plano mecánico, modelo 3D, hoja de seguridad, declaración de conformidad, certificado CE/RoHS, aviso de cambio de producto ni historial de revisiones. El manual V1.1 no trae fecha ni tabla de cambios.

**Versiones del manual.** Solo encontré la V1.1 (Winsen y robu.in). En el hilo del foro de Arduino, un usuario dice que "hay distintas versiones del manual" y que el PDF es incompleto, sobre todo en el comando 0x87 ([foro](https://forum.arduino.cc/t/alkoholtestsensor-ze29a-c2h5oh-mit-arduino-verbinden-und-daten-lesen/1344484), mensaje de wno158, 19-1-2025). No encontré ninguna otra revisión, así que **no sé cuál corresponde al módulo que vende Amazon**.

### Qué dice el manual

- Perfil: módulo electroquímico para detectar alcohol exhalado, con compensación de temperatura y sensor de presión para detectar el soplido. Aplicaciones: detector portátil y control de alcohol en vehículos.
- Protocolo UART con 9 comandos (ver [sección 5](#5-protocolo-e-integración-listo-para-código)).
- Ocho notas de uso:
  1. Se usa con un tubo de soplido que **diseña el cliente**.
  2. Cuidado con la alimentación de 5 V.
  3. Fijar el sensor a la estructura para que no se afloje.
  4. El tubo necesita una barrera que genere presión. Dirección de soplido fija: primero el orificio de presión y detrás el de muestra de alcohol.
  5. No usar con gases corrosivos.
  6. Entrada de aire libre y limpia.
  7. Evitar golpes y vibraciones excesivos.
  8. Tras uso prolongado en alta concentración, la recuperación es lenta.

## 4. Verificación de la guía de montaje (§2.4)

Comparé cada cifra de la sección 2.4 (y las que dependen de ella en §0, §3, §5 y §7) con el manual V1.1. Resultado: **no hay ninguna cifra errónea en la guía**, pero hay varias afirmaciones que el manual no respalda: el arranque ("no empieza solo"), la conversión ÷220, el condensador de 1000 µF, la vida de 2 años y el conector JST-XH.

| Afirmación de la guía | Manual V1.1 | Veredicto |
|---|---|---|
| 5 V ± 0,3 V (máx. 5,3 V), < 500 mA | Igual | Coincide |
| UART TTL 3,3 V, directo a la Pi | "3,3 V TTL" | Coincide. Matiz: el manual no da niveles VIH/VIL ni dice si RXD tolera 5 V. A 3,3 V (la Pi) está dentro de especificación. Mide el TX del módulo en reposo antes de unirlo a la Pi |
| 85 × 33 × 18 mm | Igual | Coincide |
| Rango 0–1,0 mg/L; ± 0,05 mg/L por debajo de 0,4; ± 10 % por encima | Igual (el manual escribe 0,400) | Coincide |
| 10–40 °C | Igual | Coincide. El manual no da humedad |
| Pines: 1 = 5 V, 2 = GND, 3 = TX, 4 = RX | Igual (Vin, GND, TXD, RXD) | Coincide. Ver nota sobre el conector abajo |
| 9600 8N1, tramas de 9 bytes `FF 01 CMD … CS` | Igual para las **peticiones**. Las **respuestas** son `FF CMD … CS` (sin el `01`) | Coincide, con matiz |
| Checksum `(−suma bytes 1 a 7) & 0xFF` | Texto: "(negativo(suma)) + 1". Las 18 tramas de ejemplo cuadran con la guía | Coincide. Ver nota sobre el checksum |
| Comandos 0x85 a 0x93 y su función | Igual | Coincide |
| Tiempo de soplido de 1 a 10 s, por defecto 4 | Rango 1–10 s; el manual da 4 s como valor de detección (configurable) y como ejemplo | Coincide |
| Estados 0x31 a 0x37 y sus tiempos (10 s, 1 min, 4 s a ≥ 10 L/min, 2–5 s, 20 s) | Igual | Coincide. La guía omite que 0x35 vuelve a 0x32 **tras 3 s** |
| "Prueba completa: 16–19 s más lo que tarde la persona" | 10 + 4 + (2 a 5) = 16 a 19 s | Cálculo correcto, pero **incompleto**: un soplido cortado cuesta 3 s + 10 s de precalentamiento otra vez, y si nadie sopla en 1 min vuelve a reposo |
| Trama de arranque `FF 01 87 32 00 00 00 00 46` | Cálculo: 0x01 + 0x87 + 0x32 = 0xBA; 0x100 − 0xBA = **0x46** | Coincide (46 es correcto) |
| "Circula la trama con checksum 48" | El hilo del foro de Arduino tiene `FF 01 87 32 00 00 00 00 48` (`setWarmUpStateCmd`, mensaje 15 de ec2021, 20-1-2025) | Confirmado: **48 es erróneo**. El manual solo trae el ejemplo `87 31` con `47` |
| "El módulo no empieza solo; hay que mandarle 87 32" | El manual **no dice** en qué estado arranca tras encender ni si emite algo solo. Solo describe 0x31 como "espera de instrucciones" | **Deducción de la guía, sin respaldo.** Consulta el estado (0x85) antes de arrancar y actúa según la respuesta. En el foro nadie lo confirmó con hardware real |
| Resultado en mg/100 mL | Igual | Coincide |
| "mg/L de aire ≈ valor / 220" | El manual **no da** esa conversión. Nota solo que el rango de los umbrales es 15–220 mg/100 mL | **Deducción de la guía.** Es plausible: la norma china de etilómetros GB/T 21254-2017 usa BAC = BrAC × 2200, es decir 1 mg/L ↔ 220 mg/100 mL ([chinesestandard.net](https://www.chinesestandard.net/Related.aspx/GBT21254-2017)). Pero con la equivalencia española (0,25 mg/L ↔ 0,5 g/L) saldría ÷200, un 10 % de diferencia |
| "En España, 0,25 mg/L ≈ 0,5 g/L en sangre" | Fuera del manual | Coincide con la tasa del art. 20 del Reglamento General de Circulación, vista en una fuente secundaria ([tuteorica.com](https://tuteorica.com/normativa-de-trafico/rgc/tasas-de-alcohol-en-sangre-y-aire-espirado-art-20-rgc/)). Es una tasa legal, no una relación fisiológica. No abrí el BOE |
| "Toma con electroimán; con 5,20 V y cables cortos no hace falta nada más; si se reinicia, condensador de 1000 µF" | El manual menciona el electroimán una vez ("actúa para tomar el gas") y no da su corriente ni dice si está en el módulo | La parte del condensador es **sugerencia de la guía**, no del manual |
| "No hay ningún comando para calibrar; el manual no da vida útil ni intervalo" | Ninguno de los 9 comandos calibra. Tampoco hay lectura bruta ni de temperatura | Coincide |
| "El sensor electroquímico de Winsen dura unos 2 años" | Nada para el ZE29A. Hermanos: ME2-Ф16 V1.2 = 2 años; ME2-13×13 V1.2 = 3 años; ZE30/ZE31 = 2 años | Solo respaldado por **otros** modelos. Para el ZE29A, sin dato |
| Tubo: barrera y orden de orificios (presión primero, muestra después) | Nota 4 | Coincide |
| "La saliva no puede llegar al sensor" | El manual solo pide entrada libre y limpia | Razonable, pero no es del manual |
| "El manual prohíbe golpes y vibraciones fuertes" | "Evitar golpes o vibraciones excesivos" | Coincide (más suave que "prohíbe") |
| "Tras soplidos con mucho alcohol tarda en recuperarse" | Nota 8: tras uso **prolongado** en alta concentración, la recuperación es lenta. Sin tiempos | Coincide en lo general; el manual no habla de soplidos sueltos |
| §3: ZE29A "0,1 A típico (est.), pico 0,5 A" | Solo el máximo (< 500 mA) | El típico es estimación de la guía, correctamente marcada |
| Conector JST-XH "comprobar que su J1 es XH" (§1 fila 7) | El manual **no dice** qué conector es | Sin verificar. La guía ya lo marca como pendiente |
| Anuncio: foto del módulo suelto (placa WS19, serigrafía "Rx Tx GND 5V"), texto de "carcasa" | — | No verificable (Amazon bloquea). Ver nota abajo |

### Nota sobre el checksum

El manual dice "(negativo (dato 1 + … + dato 7)) + 1". Si "negativo" se entiende como **invertir los bits** y luego sumar 1, es el complemento a dos y cuadra con todos los ejemplos. Si se lee como "−suma" y se suma otro 1, no cuadra. En el hilo del foro, ec2021 anota que el texto del manual "no encaja con los datos de ejemplo", seguramente por esta ambigüedad. **Valida la fórmula de la guía, `(−suma) & 0xFF`**: recalculé con un script las 18 tramas del manual y las 18 dan el checksum impreso.

### Nota sobre el conector y la serigrafía

La guía dice que la placa del anuncio rotula "Rx Tx GND 5V". Leído de un extremo al otro, es el **orden inverso** del manual (5 V, GND, TX, RX), así que cuadra si pin 1 es el lado "5V". Pero no sé si "Rx"/"Tx" están rotulados desde el lado del módulo o del lado del anfitrión. Si en la primera prueba no hay respuesta al `0x85`, cruza TX y RX antes de sospechar del módulo. El manual no da paso del conector (¿1,25, 1,5, 2,0, 2,5 o 2,54 mm?): mídelo con calibre al recibirlo.

## 5. Protocolo e integración (listo para código)

### Cableado con la Raspberry Pi 3B+

Pines físicos, según el §5.3 de la guía (los números de pin de la Pi son los estándar de la cabecera de 40 pines):

| Módulo (pin) | Señal | Pi (pin físico) | Función Pi |
|---|---|---|---|
| 1 | Vin 5 V | Regleta de 5 V (no de la Pi) | — |
| 2 | GND | Regleta de GND (masa común) | — |
| 3 | TXD (salida del módulo, 3,3 V) | 10 | GPIO15 (RXD) |
| 4 | RXD (entrada del módulo, 3,3 V) | 8 | GPIO14 (TXD) |

- Puerto: `/dev/serial0`, 9600, 8N1, sin control de flujo. Con `dtoverlay=disable-bt` pasa a la UART PL011 (la guía §7).
- Alimentación del módulo con la fuente de 5,20 V (máx. permitido 5,3 V). Si la fuente sube de 5,3 V, se sale de especificación.

### Formato de trama

Todas las tramas miden **9 bytes**. Los enteros van con el byte alto primero.

| Byte | Petición | Respuesta |
|---|---|---|
| 0 | `FF` (inicio) | `FF` |
| 1 | `01` (dirección fija) | Comando (eco) |
| 2 | Comando | Dato 1 |
| 3 a 7 | Datos (relleno con `00`) | Datos 2 a 6 |
| 8 | Checksum | Checksum |

**Checksum:** `(−(b1 + b2 + … + b7)) & 0xFF`. Equivale a `(0x100 − (suma & 0xFF)) & 0xFF`. No incluye el byte 0 ni el byte 8.

### Tramas de ejemplo del manual (todas comprobadas)

| Comando | Petición | Respuesta | Significado de la respuesta |
|---|---|---|---|
| 0x85 estado | `FF 01 85 00 00 00 00 00 7A` | `FF 85 31 00 00 00 00 00 4A` | Byte 2 = estado (0x31 reposo) |
| 0x86 resultado | `FF 01 86 00 00 00 00 00 79` | `FF 86 00 5A 00 00 00 02 1E` | Bytes 2–3 = valor (0x005A = 90 mg/100 mL); byte 7 = alarma (0x02 = ebrio) |
| 0x87 cambiar estado | `FF 01 87 31 00 00 00 00 47` | `FF 87 01 00 00 00 00 00 78` | Byte 3 de la petición = estado destino; byte 2 de la respuesta = 0x01 bien, 0x02 fallo |
| 0x88 leer tiempo de soplido | `FF 01 88 00 00 00 00 00 77` | `FF 88 04 00 00 00 00 00 74` | Byte 2 = segundos |
| 0x89 fijar tiempo de soplido | `FF 01 89 04 00 00 00 00 72` | `FF 89 01 00 00 00 00 00 76` | Rango 1–10 s |
| 0x90 leer umbrales | `FF 01 90 00 00 00 00 00 6F` | `FF 90 14 50 00 00 00 00 0C` | Byte 2 = bebido (0x14 = 20); byte 3 = ebrio (0x50 = 80) |
| 0x91 fijar umbrales | `FF 01 91 14 50 00 00 00 0A` | `FF 91 01 00 00 00 00 00 6E` | Rango 15–220 mg/100 mL; ebrio > bebido |
| 0x92 leer umbral de presión | `FF 01 92 00 00 00 00 00 6D` | `FF 92 08 00 00 00 00 00 66` | Byte 2 = umbral (0x08); rango 5–200, sin unidades |
| 0x93 fijar umbral de presión | `FF 01 93 08 00 00 00 00 64` | `FF 93 01 00 00 00 00 00 6C` | El encabezado del manual lo rotula "Blowing time" por error |

Tramas que **no** están en el manual, calculadas con la misma fórmula (cálculo mío):

| Acción | Trama |
|---|---|
| Pasar a precalentar (0x87 → 0x32) | `FF 01 87 32 00 00 00 00 46` |
| Tiempo de soplido de 5 s | `FF 01 89 05 00 00 00 00 71` |

La respuesta de 0x86 solo es válida en el estado 0x37. El manual no dice qué devuelve fuera de ese estado.

### Estados y tiempos

| Código | Estado | Qué pasa (manual) |
|---|---|---|
| 0x31 | Reposo | Espera instrucciones |
| 0x32 | Precalentando | 10 s, y pasa a 0x33 |
| 0x33 | Esperando soplido | Si no hay soplido en 1 min, vuelve a 0x31 |
| 0x34 | Soplando | Con 4 s seguidos pasa a 0x36; si se corta, a 0x35 |
| 0x35 | Soplido cortado | A los 3 s vuelve a 0x32 |
| 0x36 | Calculando | De 2 a 5 s, y pasa a 0x37 |
| 0x37 | Resultado listo | Se lee con 0x86. A los 20 s vuelve a 0x31 |

Cambios de estado permitidos con 0x87: 0x31 → 0x32; 0x37 → 0x31; 0x37 → 0x32. Cualquier otro devuelve `0x02` (fallo).

Secuencia de una prueba: consultar 0x85 → si 0x31, mandar 0x87 0x32 → esperar 0x33 (10 s; úsalos para la cuenta atrás y la foto) → el usuario sopla ≥ 4 s a ≥ 10 L/min → 0x36 → 0x37 → 0x86 → (opcional) 0x87 0x31.

### Código de ejemplo

Probado solo contra un puerto simulado, **no contra hardware real**. Maneja tramas con basura delante y valida el checksum.

```python
import time
import serial  # pyserial

START, ADDR = 0xFF, 0x01
ESTADOS = {0x31: "reposo", 0x32: "precalentando", 0x33: "esperando soplido",
           0x34: "soplando", 0x35: "soplido cortado", 0x36: "calculando",
           0x37: "resultado listo"}

def checksum(f):                      # f: al menos los bytes 0..7
    return (-sum(f[1:8])) & 0xFF

def make(cmd, *data):                 # petición de 9 bytes
    body = bytes([START, ADDR, cmd, *data]).ljust(8, b"\x00")
    return body + bytes([checksum(body)])

def read_frame(ser, timeout=1.0):     # busca FF, lee 8 bytes y valida
    t0 = time.monotonic()
    while time.monotonic() - t0 < timeout:
        if ser.read(1) == b"\xff":
            rest = ser.read(8)
            if len(rest) == 8:
                f = b"\xff" + rest
                if checksum(f) == f[8]:
                    return f
    return None

def ask(ser, cmd, *data):
    ser.reset_input_buffer()
    ser.write(make(cmd, *data))
    f = read_frame(ser)
    return f if f and f[1] == cmd else None

ser = serial.Serial("/dev/serial0", 9600, bytesize=8, parity="N",
                    stopbits=1, timeout=0.2)

f = ask(ser, 0x85)                    # estado
estado = f[2] if f else None
if estado == 0x31:
    ask(ser, 0x87, 0x32)              # empezar (f[2] == 1 si acepta)
# ... esperar a estado 0x37 consultando 0x85 cada 0,5 s ...
f = ask(ser, 0x86)
valor = (f[2] << 8) | f[3]            # mg/100 mL
alarma = f[7]                         # 0 nada, 1 bebido, 2 ebrio (por defecto 20/80)
```

Detalles de integración:

- Descarta cualquier byte hasta el siguiente `0xFF`. El manual no describe tramas espontáneas, pero tampoco dice que no existan.
- La posición del byte de alarma (byte 7) sale del único ejemplo del manual (`… 5A 00 00 00 02 1E`). Un simulador de Wokwi hecho por un usuario del foro también la pone en el byte 7 ([Wokwi](https://wokwi.com/projects/420594289441266689)); **no hay confirmación con hardware real**.
- Calcula tú los umbrales en la Pi con el valor bruto (no con el byte de alarma): el manual fija 20 y 80 en las definiciones de la alarma y no dice cómo cambian al reconfigurar con 0x91.

## 6. Medida: unidades, sensibilidad cruzada y calibración

### Unidades y conversión

| Magnitud | Cálculo | Estado |
|---|---|---|
| Valor bruto V (entero, `b2·256 + b3`) | mg/100 mL de sangre equivalente | Manual |
| g/L (‰) de sangre equivalente | V / 100 | Cálculo mío |
| mg/L de aire | V / 220 | Deducción de la guía; plausible por GB/T 21254-2017 (×2200). **Sin confirmar** |
| mg/L de aire (equivalencia española 0,25 mg/L ↔ 0,5 g/L) | V / 200 | Cálculo mío |
| ppm de etanol | mg/L × 530 (25 °C) | Cálculo mío |
| Tasa general española 0,25 mg/L | V = 50 (÷200) o 55 (÷220) | Cálculo mío |
| Tasa profesionales y noveles 0,15 mg/L | V = 30 (÷200) o 33 (÷220) | Cálculo mío; tasas según [tuteorica.com](https://tuteorica.com/normativa-de-trafico/rgc/tasas-de-alcohol-en-sangre-y-aire-espirado-art-20-rgc/) |

El módulo parece pensado para el mercado chino. Los umbrales por defecto (20 y 80 mg/100 mL) son los límites de la norma china GB 19522-2010 ([huichenglawyer.com](https://www.huichenglawyer.com/pufaku/84863.html)); existe una edición GB 19522-2024 que **no abrí** (**sin verificar** si cambian). El manual no dice qué relación aliento/sangre usa el firmware. Compáralo con un etilómetro de referencia para saber el factor real.

### Sensibilidad cruzada

**Para el ZE29A no hay tabla.** La ficha web solo dice "fuerte capacidad antiinterferencia". Lo siguiente es de **otras celdas de aliento**; el ZE29A puede variar.

| Sustancia | Respuesta en celdas de combustible de aliento | Fuente |
|---|---|---|
| Etanol (enjuague bucal, desinfectante de manos, bebida reciente) | Lee como alcohol. El alcohol residual en la boca es un riesgo de sobrecarga | [Dart](https://www.dart-sensors.com/wp-content/uploads/2021/10/16mm_breath_alcohol_sensor_product_datasheet.pdf) ([copia local](datasheets/16mm_breath_alcohol_sensor_product_datasheet.pdf)); [OIML R 126](https://www.oiml.org/en/files/pdf_r/r126-e12.pdf) ([copia local](datasheets/r126-e12.pdf)) (15 min sin meter nada en la boca). Ver nota |
| Isopropanol (desinfectante, limpiador) | Lee. Alco-Sensor: 0,042 con una dosis equivalente a 0,1 de BAC | [Intoximeters](https://www.intox.com/fuel-cell-white-paper/); Dart (sensible) |
| Metanol | Lee. Alco-Sensor: 0,043–0,047 con equivalente a 0,1 | Intoximeters; Dart (sensible) |
| Acetona | 0,0 en Alco-Sensor III y IV; "sin sensibilidad" según Dart | Intoximeters; Dart |
| Otras cetonas, benceno, tolueno, ésteres, hidrocarburos saturados | Sin sensibilidad | Dart |
| CO | **Las fuentes se contradicen:** 0,0 en Alco-Sensor (Intoximeters) frente a "sensible" en Dart. NHTSA lo cita como posible excepción | Intoximeters; Dart; [NHTSA](https://rosap.ntl.bts.gov/view/dot/1406/dot_1406_DS1.pdf) |
| Hidrógeno | Respuesta "en distintos grados" (Dart). Intoximeters no lo trata | Dart |
| H2S, SO2, aldehídos, fenol, alquenos, éter dietílico | Sensibles | Dart |
| NOx y ozono | Respuesta negativa | Dart |
| CO2 (bebidas con gas) | Sin sensibilidad | Dart |
| Vapor de agua | Transitorios breves | Dart |
| Humo de tabaco | Posible excepción; la espera de 15 min lo evita | NHTSA |

Notas:

- **Mi deducción:** en un bar, el alcohol residual en la boca es la interferencia más importante, y el módulo no la detecta. OIML R 126 trata la detección de alcohol en vías altas como función **opcional**; ni el manual ni la ficha del ZE29A hablan de ella.
- El manual de la celda hermana ME2 pide alejar el sensor de disolventes orgánicos, pinturas, medicinas y aceites ([ME2 Ф16](https://www.winsen-sensor.com/d/files/manual/me2-c2h5oh-%D1%8416.pdf)). El manual del ZE29A solo dice "no usar con gases corrosivos" y mantener la entrada limpia.
- Un sensor electroquímico ambiental de Winsen (ZE30/ZE31) lista el CO entre los gases interferentes ([ZE31](https://www.winsen-sensor.com/product/ze31-c2h5oh.html)). Es otro producto; no extrapolable.

### Calibración y deriva

- **Winsen no da procedimiento, ni intervalo, ni comando.** Las celdas ME2 tienen "estabilidad < 2 % al mes" y repetibilidad ± 0,006 mg/L ([ME2 Ф16](https://www.winsen-sensor.com/d/files/manual/me2-c2h5oh-%D1%8416.pdf)), pero **no sé si el ZE29A lleva una ME2** (sin verificar).
- **Los ME2 piden precalentar más de 48 h antes del primer uso** ([ME2 Ф16](https://www.winsen-sensor.com/d/files/manual/me2-c2h5oh-%D1%8416.pdf), [13×13](https://www.winsen-sensor.com/d/files/manual/me2-c2h5oh-13%C3%9713.pdf)) y guardarlos con los electrodos cortocircuitados. El ZE29A anuncia 10 s de calentamiento. Son cosas distintas (la máquina de estados del módulo frente a la estabilización de la celda), pero **el manual del ZE29A no dice si la celda necesita estabilizarse tras el envío**. Pregunta a Winsen.
- **Referencias de la industria:**
  - Dräger Alcotest 7000: calibración cada **12 meses**, frente a los 6 meses "típicos" de otros ([Dräger](https://www.draeger.com/en_uk/Products/Alcotest-7000)).
  - AlcoSense: recalibrar cada **12 meses**, 23,99 £ en su laboratorio ([AlcoSense](https://www.alcosense.co.uk/alcosense/calibration-and-servicing.html)).
  - Dart: en equipos evidenciales de la policía británica, cada **6 meses** por ley; vida de la celda de 3 a 5 años; el pico de salida baja con la edad ([Dart](https://www.dart-sensors.com/wp-content/uploads/2021/10/16mm_breath_alcohol_sensor_product_datasheet.pdf) ([copia local](datasheets/16mm_breath_alcohol_sensor_product_datasheet.pdf))).
  - Un distribuidor español recomendaba limpiar y recalibrar las máquinas de bar cada 4–5 meses; un laboratorio de calibración costaba más de 5.000 € ([Eroski Consumer, 2007](https://www.consumer.es/?p=33931), anterior a la norma vigente).
  - **Lion:** no encontré fuente.
- **Qué se espera del instrumento:** OIML R 126 pide deriva a largo plazo menor de 0,020 mg/L en dos meses a 0,40 mg/L. El ZE29A no declara deriva.
- **Comprobación en campo.** El módulo no expone valor bruto, así que solo hay pruebas de control: (1) soplido en blanco con aire limpio, que debe dar 0 (o casi); (2) soplido contra un patrón de etanol. OIML R 126 define los gases de prueba de referencia (34 °C, 95 % de humedad relativa, 5 % de CO2, 2 L en 5 s), pero **no describe un procedimiento de campo**. Cómo fabricar un patrón casero fiable es algo que **no he podido sustentar con fuente**.
- **Frecuencia sugerida (conclusión mía):** prueba en blanco en cada servicio y comparación con un etilómetro de referencia calibrado cada pocos meses; sustituir el módulo cuando el factor de corrección se aleje de lo aceptable o a los 12–24 meses si Winsen no da vida útil.

### Saturación y recuperación entre usuarios

- El manual no da tiempo de recuperación. Solo dice que tras uso prolongado en alta concentración la recuperación es lenta.
- Libro blanco de Intoximeters: en medición por pico, pruebas positivas repetidas bajaban las lecturas y la recuperación podía tardar "16 a 24 horas"; el método de integral que defiende lo evita. Es dato del fabricante y de estudios antiguos; **desconocemos qué hace el ZE29A**.
- Dart: la línea base puede derivar a negativo tras pruebas repetidas ([Dart](https://www.dart-sensors.com/wp-content/uploads/2021/10/16mm_breath_alcohol_sensor_product_datasheet.pdf) ([copia local](datasheets/16mm_breath_alcohol_sensor_product_datasheet.pdf))).
- **Conclusión mía:** sin lectura bruta, el único indicador es el comportamiento. Registra el resultado de cada prueba y, tras un resultado alto, impón una pausa mínima antes de la siguiente. Esa pausa hay que medirla en banco (soplido alto, y luego soplidos en blanco hasta que el valor vuelva a ≈ 0).

## 7. Fallos, bugs y problemas conocidos

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | Sin vida útil, deriva, intervalo de calibración, humedad ni recuperación en el manual | Alta |
| 2 | Sin comando de calibración ni lectura bruta: la deriva no se ve | Alta |
| 3 | Exactitud ± 0,05 mg/L (peor que un etilómetro legal) | Media (informativo); alta si se vende como medida |
| 4 | Rango 10–40 °C, aliento a 34–35 °C y húmedo, condensación | Alta |
| 5 | Alcohol residual en la boca, enjuague, desinfectante | Alta (exactitud) |
| 6 | Contaminación de la celda (disolventes, limpiadores, siliconas, saliva) | Alta |
| 7 | Manual V1.1 incompleto o ambiguo | Media |
| 8 | Conector no especificado (JST-XH sin confirmar) | Media |
| 9 | Anuncio de Amazon con texto y foto distintos; precio de 108,46 € frente a 58 USD en Winsen | Media-alta |
| 10 | Golpes y vibración | Media (va en caja suspendida) |
| 11 | Caudal de soplido ≥ 10 L/min exigente | Media |
| 12 | Marco legal sin aclarar | Alta (legal) |
| 13 | Disponibilidad y vida del producto sin datos | Baja-media |

### 7.1 Datos que faltan

El manual no trae vida útil, deriva, intervalo de calibración, humedad ni recuperación (verificado en el PDF por consulta directa). Las celdas hermanas dan 2 o 3 años en aire, pero no son el ZE29A. La celda del ZE29A **no está identificada**.

### 7.2 Sin calibración ni lectura bruta

Los nueve comandos son: estado, resultado, cambio de estado, tiempo de soplido, umbrales y umbral de presión. Ninguno calibra, da el valor del sensor o la temperatura. Si el sensor deriva, el módulo no avisa. La única defensa son las pruebas de control de la [sección 6](#calibración-y-deriva).

### 7.3 Exactitud frente a un instrumento legal

El ZE29A declara ± 0,050 mg/L por debajo de 0,400 mg/L. OIML R 126 exige en servicio ± 0,030 mg/L o 7,5 % (lo mayor), y ± 0,020 mg/L o 5 % al principio ([OIML](https://www.oiml.org/en/files/pdf_r/r126-e12.pdf) ([copia local](datasheets/r126-e12.pdf))). Con el límite español de 0,25 mg/L, ± 0,05 mg/L es un ± 20 % (cálculo mío). Es coherente con "orientativo".

### 7.4 Temperatura, humedad y condensación

- El rango de trabajo es 10–40 °C. La guía usa 40 °C como límite para decidir si añade un ventilador (porque el Solo admite hasta 40 °C); el sensor va dentro de la caja interior, cerca de la Pi.
- Dart pide mantener el recorrido de gas corto y calentarlo a al menos 35 °C para evitar condensación, y avisa de que extremos de humedad pueden dañar la celda o provocar fuga de electrolito ([Dart](https://www.dart-sensors.com/wp-content/uploads/2021/10/16mm_breath_alcohol_sensor_product_datasheet.pdf) ([copia local](datasheets/16mm_breath_alcohol_sensor_product_datasheet.pdf))).
- La salida de la celda sube con la temperatura entre unos 20 y 40 °C y luego baja; hace falta compensación por unidad ([Dart](https://www.dart-sensors.com/wp-content/uploads/2021/10/16mm_breath_alcohol_sensor_product_datasheet.pdf) ([copia local](datasheets/16mm_breath_alcohol_sensor_product_datasheet.pdf))). El ZE29A lleva compensación interna, pero **no se documenta su calidad**.
- El manual de las celdas ME2 pone 15–90 % HR sin condensación ([13×13](https://www.winsen-sensor.com/d/files/manual/me2-c2h5oh-13%C3%9713.pdf)). Un aliento a 35 °C y casi saturado entra en un tubo a 20–25 °C: la condensación es probable. **Tubo corto y pendiente hacia fuera**, conclusión mía.

### 7.5 Alcohol residual, enjuague y desinfectante

En un bar, el usuario acaba de beber. El módulo mide lo que hay en el aire del soplido: alcohol de los pulmones **y** de la boca. No tiene detección de alcohol bucal documentada. OIML R 126 prevé que el fabricante pida 15 minutos sin meter nada en la boca. La máquina no puede imponerlo; solo puede avisar en pantalla. Los vapores de desinfectante de manos (etanol o isopropanol) cerca del tubo también darán lectura.

### 7.6 Contaminación del sensor, siliconas y limpiadores

- Los manuales de Winsen piden evitar disolventes orgánicos, pinturas, medicinas, aceites y gases a alta concentración (ME2 [Ф16](https://www.winsen-sensor.com/d/files/manual/me2-c2h5oh-%D1%8416.pdf) y [13×13](https://www.winsen-sensor.com/d/files/manual/me2-c2h5oh-13%C3%9713.pdf); también el módulo ZE03, [manual](https://robu.in/wp-content/uploads/2023/11/SKU766673.pdf)). El de la ME2 13×13 añade: no encapsularlo con adhesivos o selladores que curen a más de 80 °C, ni exponerlo mucho tiempo a gases alcalinos.
- **Silicona (siloxanos):** ninguno de esos manuales la menciona. **No encontré ninguna fuente** sobre envenenamiento de este tipo de celda por siloxanos, por lo que la relación con el tubo de silicona es una **sospecha mía, sin respaldo**. El manual del ZE29A no impone ningún material para el tubo.
- **Alcohol de limpieza:** el isopropanol da lectura (Intoximeters y Dart). Limpia el exterior de la máquina lejos de la entrada, nunca con pulverizador dirigido al tubo.
- **Saliva y condensación:** pueden bloquear la entrada ("la contaminación y el bloqueo reducen la sensibilidad", ME2 Ф16). Hace falta boquilla desechable y trampa de condensación. Conclusión mía.
- **Electrolito.** El manual de la ME2 avisa: no desmontar la celda, porque una fuga de electrolito la daña. No sé qué electrolito lleva el ZE29A; no abras el módulo.

### 7.7 Manual y protocolo

- **Checksum ambiguo en el texto** del manual (ver [sección 4](#nota-sobre-el-checksum)). Los ejemplos son consistentes.
- **Encabezado erróneo de 0x93** ("Blowing time" en vez de umbral de presión).
- **Terminología mezclada:** "fuel cell" y "electrochemical"; "drinking threshold" y "drunk threshold" para el mismo parámetro (análisis de la copia de robu.in).
- **El PDF es incompleto en el comando 0x87** según un usuario del foro (wno158). Hay un resumen razonable en el mensaje de my_xy_projekt: reposo → precalentar; tras leer, a 0x32 o 0x31.
- **El hilo del foro de Arduino** ([enlace](https://forum.arduino.cc/t/alkoholtestsensor-ze29a-c2h5oh-mit-arduino-verbinden-und-daten-lesen/1344484)) no trae ninguna medida real: un principiante no logra datos con Arduino UNO y conversor de nivel; los ayudantes sospechan RX/TX cruzados o alimentación a 3,3 V en vez de 5 V; el único resultado (90 mg/100 mL) es de un simulador. **No encontré ningún informe de uso real con alcohol.**
- **Lo que no encontré:** hilos con el ZE29A o con los ZE07, ZE03 o ZE08 sobre lecturas erráticas, deriva o envenenamiento. Se agotó mi presupuesto de búsquedas web antes de buscar GitHub y foros específicos.

### 7.8 Golpes y vibración

El manual pide evitar golpes y vibraciones excesivos y fijar el sensor a la estructura para que no se afloje. La caja interior suspendida de la guía responde a eso. El tubo de silicona flexible entre boquilla y sensor también.

### 7.9 Caudal de soplido

Hacen falta 4 s a ≥ 10 L/min (≈ 0,67 L como mínimo, cálculo mío). OIML R 126 pide para instrumentos evidenciales al menos 1,2 L, 6 L/min y 5 s. Un usuario con poca capacidad pulmonar, un niño o alguien mareado puede no llegar a 10 L/min. El umbral de presión (0x93) fija cuándo el módulo cuenta el soplido y **depende de la barrera de tu tubo**; el manual no da dibujo ni valores de referencia.

### 7.10 Disponibilidad

La página del producto lleva "© 2025" y la tienda de Winsen muestra 499 unidades en stock. No hay aviso de descatalogación ni garantía de producción. **No encontré** política de garantía ni de devoluciones de Winsen.

## 8. Marco legal

Solo lo que dicen las fuentes. **No es asesoramiento legal.**

1. **Orden ITC/3707/2006: está derogada.** Regulaba el control metrológico del Estado de los etilómetros usados para imponer sanciones, hacer pruebas judiciales o aplicar normas que exijan su uso (art. 1). La derogó la Orden ICT/155/2020 (disposición derogatoria única, letra n), con efectos del 24-10-2020. Fuentes: [BOE, texto de la ITC/3707/2006](https://www.boe.es/boe/dias/2006/12/07/pdfs/A42985-42990.pdf) ([copia local](datasheets/A42985-42990.pdf)), [BOE consolidado](https://www.boe.es/eli/es/o/2006/11/22/itc3707/con) y [BOE, ICT/155/2020](https://www.boe.es/boe/dias/2020/02/24/pdfs/BOE-A-2020-2573.pdf). **Discrepancia:** una copia comercial del texto ([iberley.es](https://www.iberley.es/legislacion/orden-itc-3707-2006-22-noviembre-regula-control-metrologico-estado-instrumentos-destinados-medir-concentracion-alcohol-aire-espirado-4156772)) todavía la marca "vigente"; manda el BOE. (Otra orden de la misma fecha, la ITC/3748/2006, es de los contadores de máquinas recreativas y también está derogada; **no la confundas**.)
2. **Orden ICT/155/2020** regula el control metrológico de una lista de instrumentos que se usen para los fines del art. 8.1 de la Ley 32/2014: interés público, salud y seguridad públicas, protección e información de consumidores, recaudación, sanciones, peritajes judiciales, comercio leal y otros. El **Anexo XIII** es "Instrumentos destinados a medir la concentración de alcohol en el aire espirado". **No pude leer el anexo** (mi herramienta corta el texto antes). Por otras fuentes:
   - Un listado de instrumentos con control metrológico de la Junta de Andalucía (marzo de 2026) incluye los etilómetros bajo la ICT/155/2020, Anexo XIII, con **verificación de 1 año** ([PDF](https://juntadeandalucia.es/sites/default/files/2026-03/20260323.INSTRUMENTOS_CONTROL_METROLOGICO.pdf)).
   - Una compilación secundaria ([causadirecta.com](https://mail.causadirecta.com/ficheros/ICT-155_EMP%20Etil%C3%B3metros.pdf)) cita errores máximos de 0,020 mg/L o 5 % en el primer año y 0,030 mg/L o 7,5 % con más de un año, según OIML R 126. **Sin verificar en el BOE.**
3. **Directiva de instrumentos de medida (2014/32/UE):** los etilómetros no figuran entre los instrumentos cubiertos, según [euronorm.net](https://www.euronorm.net/content/ce-marking/directives/explanation/2014-32-eu.php) (fuente secundaria). De ahí deduzco (conclusión mía) que la regulación es nacional. **No abrí el texto de la directiva.**
4. **OIML R 126 (2012):** cubre solo los analizadores **evidenciales** cuantitativos; excluye los de cribado y los de "pasa / no pasa" ([OIML](https://www.oiml.org/en/files/pdf_r/r126-e12.pdf) ([copia local](datasheets/r126-e12.pdf))).
5. **Eroski Consumer (2007):** los tickets de las máquinas de bar no tienen validez como prueba en un control; las máquinas no estaban homologadas ni se verificaban periódicamente; la DGT advertía de que no todas eran fiables ([Consumer](https://www.consumer.es/?p=33931)). **Es anterior a la ICT/155/2020**: puede no reflejar la situación actual.
6. **La guía** propone mostrar el resultado como "orientativo".

**Lo que sigue sin respuesta:** si una máquina recreativa de monedas queda dentro del Anexo XIII, y qué exige entonces. No encontré norma que mencione expresamente los "alcoholímetros de monedas". Lo razonable es preguntar por escrito al órgano de metrología legal (Centro Español de Metrología o la dirección general de industria de la comunidad autónoma) y guardar la respuesta.

**Texto en pantalla (conclusión mía, no legal):** indicar que es un aparato de entretenimiento, no homologado, que su resultado es orientativo y que no sirve para decidir si se puede conducir. Ninguna fuente que he leído dicta una redacción.

## 9. Compra: precio, vendedores y autenticidad

### Precio

| Origen | Precio | Fuente |
|---|---|---|
| Amazon.es (tu hoja) | 108,46 € | Hoja, 19-20-10-2026 |
| Tienda de Winsen (1 unidad) | 58,00 USD, 499 en stock. Envío por DHL/FedEx (3–7 días laborables) o China Post (15–35 días); la página no dice el coste del envío | [shop.winsen-sensor.com](https://shop.winsen-sensor.com/products/ze29a-c2h5oh-electrochemical-alcohol-module) |
| Mouser, DigiKey, AliExpress | **No encontré el ZE29A** (búsqueda limitada) | — |

El subdominio `shop.winsen-sensor.com` parece la tienda oficial, pero la página no lo declara. No incluyo IVA ni aduana en la importación. No convierto el dólar a euros porque no tengo tipo de cambio verificado.

### Confusión con otros módulos

- **Los módulos de 0–5 ppm no son para aliento.** El DFRobot SEN0376 (0–5 ppm, I2C/UART; Farnell lo ofrece a 22,15 £ sin IVA y cita los alcoholímetros entre sus usos) y el Winsen ZE30/ZE31 (0–5 ppm, detectores ambientales o de vehículo) miden alcohol en el aire. Una oferta de OnBuy anuncia un módulo de 0–5 ppm con I2C/UART como "Breathalyzer Module" a 51,39 £ ([OnBuy](https://www.onbuy.com/gb/p/alcohol-gas-concentration-sensor-high-sensitivity-breathalyzer-module-vehicle-detection-diy-projects~p251393083/), [Farnell](https://uk.farnell.com/dfrobot/sen0376/gravity-alcohol-sensor/dp/3769863)). Su ficha no nombra el ZE29A, pero muestra que existen módulos con otro rango vendidos como alcoholímetro. Un aliento de 0,25 mg/L son unos 133 ppm (cálculo mío): un 0–5 ppm saturaría.
- **Los MQ-3, MQ303B y MP-3B** son semiconductores de 20–500 ppm ([lista de Winsen](https://winsen-sensor.com/alcohol-sensor)): no son electroquímicos ni llevan soplido ni UART.
- **ZE29A, no ZE29B:** no encontré ninguna ZE29B. Los hermanos de Winsen son ZE30 y ZE31 (ambientales) y las celdas ME2.

### Cómo comprobar que el módulo es auténtico

Pruebas mías, sin fuente de Winsen:

1. **Dimensiones y conector:** 85 × 33 × 18 mm y 4 pines. Mide con calibre.
2. **Rotulado:** busca "ZE29A" y el logotipo de Winsen en la placa. Compáralo con la foto de [Winsen](https://www.winsen-sensor.com/product/ze29a-c2h5oh.html). **No he visto las fotos.**
3. **Prueba funcional:** manda `FF 01 85 00 00 00 00 00 7A`. Un ZE29A debería responder con una trama de 9 bytes `FF 85 <estado> … <checksum>` (en reposo, `FF 85 31 00 00 00 00 00 4A`). Que otros módulos no respondan igual es una suposición mía, **sin verificar**: una respuesta correcta es buena señal, pero no prueba el origen.
4. **Soplo de prueba:** un soplido sin alcohol debe dar 0 (o cerca) y uno con alcohol, un valor distinto de cero.
5. **Anuncio:** el texto habla de una "carcasa" y la foto muestra el módulo suelto. Pregunta al vendedor antes de comprar, o compra una unidad de prueba.
6. Si la compra se hace a Winsen, guardar el correo con el pedido; la dirección de ventas del manual es sales@winsensor.com.

## 10. Alternativas

Solo hay motivo para mirarlas por los huecos de la [sección 7](#7-fallos-bugs-y-problemas-conocidos): deriva invisible, sin humedad, sin vida útil.

| Opción | Qué es | Pros | Contras | Fuente |
|---|---|---|---|---|
| **Seguir con el ZE29A** | Módulo cerrado | Detecta soplido, muestrea, calcula. Integración mínima (UART) | Sin datos de vida, deriva ni humedad. No recalibrable | [Manual](https://www.winsen-sensor.com/d/files/manual/ze29a-c2h5oh.pdf) ([copia local](datasheets/ze29a-c2h5oh.pdf)) |
| **Celda Winsen ME2-C2H5OH** (Ф16 o 13×13) | Celda suelta, 0–1 mg/L | Valor bruto y deriva controlables. Datos: T90 ≤ 20 s, estabilidad < 2 %/mes, vida 2–3 años | Hay que diseñar el amplificador, la bomba o electroimán, el sensor de presión y el firmware. Precalentar > 48 h. Los dos manuales **discrepan** en sensibilidad (6 ± 2 frente a 15–125 µA/(mg/L)), vida (2 frente a 3 años) y temperatura | [Ф16](https://www.winsen-sensor.com/d/files/manual/me2-c2h5oh-%D1%8416.pdf), [13×13](https://www.winsen-sensor.com/d/files/manual/me2-c2h5oh-13%C3%9713.pdf) |
| **Celdas Dart Sensors** (16 mm; variantes Economy, Standard, Professional, High Duty Cycle) | Celda de aliento de diseño evidencial | Vida de 3 a 5 años. Documentación completa de comportamiento (temperatura, respuesta, interferentes) | Requiere electrónica propia. No confirmé compra en la UE ni precios (la página de DigiKey que vi no listaba alcohol) | [Dart](https://www.dart-sensors.com/wp-content/uploads/2021/10/16mm_breath_alcohol_sensor_product_datasheet.pdf) ([copia local](datasheets/16mm_breath_alcohol_sensor_product_datasheet.pdf)) |
| **Instrumentos completos** (Dräger Alcotest 7000, AlcoSense) | Aparatos de mano | Calibración documentada cada 12 meses | No son módulos integrables; no los he visto en versión OEM | [Dräger](https://www.draeger.com/en_uk/Products/Alcotest-7000), [AlcoSense](https://www.alcosense.co.uk/alcosense/calibration-and-servicing.html) |
| **No sirven** | ZE30, ZE31, DFRobot SEN0376 (0–5 ppm); MQ-3, MQ303B, MP-3B (semiconductor) | — | Rango ambiental o tecnología inadecuada | [Winsen](https://winsen-sensor.com/alcohol-sensor), [Farnell](https://uk.farnell.com/dfrobot/sen0376/gravity-alcohol-sensor/dp/3769863) |

**Alphasense, SGX Sensortech y módulos Lion:** no he encontrado ni verificado ninguna celda de aliento de esas marcas. No las incluyo.

**Mi lectura:** mientras el proyecto sea "orientativo" y de bajo volumen, el ZE29A es la opción de menor riesgo de integración. Si el requisito pasa a ser medir con garantías, hay que cambiar a una celda con documentación (Dart o ME2) y asumir el diseño electrónico, o a un instrumento homologado.

## 11. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Antes de fabricar en serie, escribir a Winsen** (sales@winsensor.com, del manual) con estas preguntas:
   - vida útil y deriva del módulo;
   - intervalo y método de recalibración;
   - humedad de trabajo y condensación;
   - tiempo de recuperación y de espera entre pruebas;
   - estado del módulo al encender;
   - conector (tipo y paso) y dibujo mecánico;
   - dibujo del tubo de referencia (barrera, posición de orificios) y valor típico del umbral de presión;
   - relación aliento/sangre usada en el firmware;
   - revisión posterior a la V1.1 del manual;
   - certificados CE y RoHS.
2. **Comprar una unidad de prueba** y comparar el precio de Winsen (58 USD más envío) con el de Amazon (108,46 €). Antes del pedido, preguntar al vendedor de Amazon por la "carcasa" del texto.
3. **Pruebas al recibir:**
   - mide con el polímetro 5 V y GND, y el TX en reposo (debe quedarse por debajo de 3,3 V) antes de conectarlo a la Pi;
   - envía `0x85` y comprueba la respuesta;
   - mide el paso del conector;
   - haz un soplido en blanco (debe dar ≈ 0);
   - haz un soplido contra una referencia.
4. **Software:**
   - consulta el estado antes de cada prueba y no asumas 0x31 al arrancar;
   - valida siempre el checksum y resincroniza en `0xFF`;
   - pon un tiempo límite en cada espera y reintenta o reinicia con un error claro;
   - guarda el valor bruto de cada prueba en el registro;
   - calcula los umbrales en la Pi.
5. **Temperatura:** pon un sensor de temperatura junto al módulo y bloquea la prueba fuera de 10–40 °C (con mensaje en pantalla). El módulo no da su temperatura.
6. **Tubo de soplido:**
   - corto, con pendiente hacia fuera, boquilla desechable y trampa de condensación;
   - la barrera y el orden de orificios según las notas 4 y 6 del manual;
   - mide el caudal real con una jeringa de 1 L o un caudalímetro y ajusta el umbral de presión con tu tubo;
   - antes de usar el tubo de silicona, comprueba el cero del módulo con y sin el tubo, y deja ventilar el tubo nuevo (precaución mía, sin fuente);
   - mide el diámetro interior real del tubo (la hoja dice "6 mm" sin precisar si es interior o exterior).
7. **Limpieza:** nada de aerosoles ni alcohol cerca de la entrada. Limpia el exterior con un paño húmedo.
8. **Control de deriva:** soplido en blanco registrado en cada visita de mantenimiento. Comparación con un etilómetro de referencia calibrado cada pocos meses. Cambio del módulo según lo que conteste Winsen. Ten un módulo de repuesto por tanda.
9. **Aviso al usuario:** "orientativo, no homologado, no use el resultado para conducir". Pregunta a metrología legal por el Anexo XIII.
10. **Entre usuarios:** tras un resultado alto, impón una pausa mínima antes de la siguiente prueba. El tiempo hay que medirlo en banco (ver [sección 6](#saturación-y-recuperación-entre-usuarios)).
11. **Mensaje al usuario:** pide esperar 15 minutos sin meter nada en la boca antes de soplar (OIML R 126 prevé que el fabricante lo indique); la máquina no puede imponerlo.
12. **Otras piezas afectadas:** el tubo de silicona de 6 mm y los cables JST-XH tienen su propia ficha. De esta ficha: el tubo no tiene material impuesto por el fabricante, y el conector JST-XH no está confirmado.

## 12. Lo que no he podido verificar

- **El anuncio de Amazon:** vendedor, foto, texto de "carcasa", placa WS19 y rótulo "Rx Tx GND 5V" (todo de la guía).
- **Que el PDF original coincida con lo que leyó mi herramienta**, aunque las 18 tramas de ejemplo cuadran.
- **Planos mecánicos y conector** del módulo (tipo, paso, taladros).
- **Estado del módulo al encender** y si emite tramas solo.
- **Vida útil, deriva, humedad y recuperación del ZE29A**, y qué celda lleva dentro (si es una ME2).
- **La conversión mg/100 mL → mg/L** que usa el firmware (÷220 es deducción; ÷200 la alternativa).
- **La sensibilidad cruzada del ZE29A:** las tablas son de otras celdas y las fuentes se contradicen en CO.
- **Siliconas y siloxanos:** sin ninguna fuente sobre su efecto en esta celda.
- **Contenido del Anexo XIII de la ICT/155/2020** (ámbito, errores máximos, periodicidad). Sin leer en el BOE.
- **Si un alcoholímetro recreativo de monedas queda dentro del Anexo XIII.**
- **Texto de la Directiva 2014/32/UE y del art. 20 del Reglamento General de Circulación en el BOE** (solo fuentes secundarias).
- **La edición GB 19522-2024** y si cambia los umbrales de 20 y 80 mg/100 mL.
- **Disponibilidad en Mouser, DigiKey y AliExpress**, y precios de distribuidores (mi presupuesto de búsquedas web se agotó).
- **Informes de uso real** (foros, GitHub) del ZE29A y de la serie ZE: no encontré ninguno; no pude buscar más.
- **Alphasense, SGX y Lion** como alternativas.
- **Autenticidad:** no tengo fotos del original para comparar.

## 13. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos) y carpeta [`datasheets/`](datasheets/).

Todos los enlaces, ordenados por tipo y con nota de lo que no pude abrir, en [`enlaces.md`](enlaces.md).
