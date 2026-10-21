# Anuncios de Amazon.es leídos para el MONTAJE GENERAL

Lo que dicen los anuncios de las piezas que fijan un cableado, leídos el 21-10-2026 en el navegador integrado (el que usa Amazon.es sin bloqueo; las herramientas anteriores no podían). Sirve para saber qué dato sale de dónde. Está resumido con mis palabras; no copio los textos de los vendedores ni guardo sus fotos.

Cada dato lleva una etiqueta de origen:

- **Texto:** lo dice el texto del anuncio.
- **Foto:** se ve en una foto del anuncio (lo que escribo es lo que se distingue, no una medida).
- **Reseña:** lo cuenta un cliente con compra verificada.
- **Cálculo mío:** lo he deducido yo y no lo garantiza nadie.

Las fichas de [`componentes/`](../componentes/README.md) dicen en su cabecera que Amazon bloqueaba el acceso. Eso ya no es cierto para estas diez piezas; cada una tiene un aviso fechado al principio con lo que cambia.

## #15 Módulo C14 con fusible e interruptor (B08Z6FCR5Z)

| Dato | Valor | Origen |
|---|---|---|
| Qué es | Entrada C14 de 3 pines, portafusibles e interruptor basculante con luz roja de 4 pines | Texto |
| Conexión trasera | Terminales faston | Texto |
| Corriente y tensión | 10 A a 125 V y 6 A a 250 V | Texto |
| Fusible | El texto da dos valores a la vez (10 A y 5 A) y no dice el tamaño. Una reseña dice que venía con fusible y otra que faltaba | Texto y reseñas |
| Esquema interno | Los dos dibujos del vendedor no coinciden entre sí (columna de entrada y fila de cada línea) y una reseña de 2 estrellas dice que el puente entre N y L del dibujo del vendedor está en el lado equivocado: el interruptor corta, pero la luz no se apaga. Otra reseña dice lo mismo (con ese puente la luz queda siempre encendida) | Fotos y reseñas |
| Fotos de clientes | Dos fotos de módulos ya instalados; no se distinguen los terminales con claridad | Fotos |
| Fallo | Una reseña dice que el interruptor empezó a fallar a las dos semanas | Reseña |

**Conclusión:** la tabla de patillas del C14 no se puede sacar del anuncio. Hay que medirla con el módulo suelto (apartado 4 del MONTAJE GENERAL).

## #18 Borne USB-A hembra a tornillo (B07V86XPL4)

| Dato | Valor | Origen |
|---|---|---|
| Tornillos | 5, rotulados **S** (malla), **+** (positivo), **D−**, **D+** y **−** (GND), en ese orden de un extremo al otro del bloque | Texto y foto |
| Cable | AWG 28 a 16 (el 0,75 mm² es AWG 18) | Texto |
| Bloque de tornillos | Enchufable (se separa del conector USB) | Texto y foto |
| Corriente máxima | No consta | — |

## #11 Pulsador arcade EG STARTS (B01N11BDX9)

| Dato | Valor | Origen |
|---|---|---|
| Pack | 5 botones de 30 mm con LED de 5 V, uno de cada color | Texto |
| Terminales | 4 faston de 2,8 mm: 2 del microinterruptor y 2 del LED | Texto y foto |
| Contactos del interruptor | **Dos**. No existen NO, COM ni NC | Texto y foto |
| Polaridad | El LED sí la tiene; el interruptor no | Texto |
| Cuáles son cuáles | En la foto, las dos patas del microinterruptor están juntas en un extremo del cuerpo gris y las del LED (doradas) en el otro. Ningún terminal lleva rótulo | Foto |
| Agujero y cabeza | 30 mm y 33 mm | Texto |
| Una reseña | Se queja de que no hay indicación de qué cable va a qué terminal | Reseña |

## #5 Pantalla GeeekPi 7" (B0CHMBCCJB)

| Dato | Valor | Origen |
|---|---|---|
| Táctil | No | Texto y reseñas |
| Puertos | Un USB-C de alimentación («Power IN»), un HDMI de tamaño completo y un selector giratorio de retroiluminación, en el mismo canto | Foto |
| En la caja | Un cable «USB a USB-C», un cable HDMI de tamaño completo, un adaptador HDMI a micro-HDMI y dos soportes | Texto |
| Cable de alimentación | El anuncio escribe «USB to USB-C»: lo normal es USB-A → USB-C, pero no dice «A» | Texto (cálculo mío) |
| Contacto de alimentación | Una reseña dice que, con tocarlo un poco, la pantalla se apaga un momento | Reseña |
| Otras reseñas | Una con 2 estrellas cuenta defectos de panel y parpadeo con distintos cables | Reseña |

## #6 Sensor ZE29A (B0H8NVXVG5)

| Dato | Valor | Origen |
|---|---|---|
| Qué se ve | Un módulo verde, placa WS190626240-V1.0, con el sensor azul y un condensador grande. Una imagen muestra dos módulos | Foto |
| Conector J1 | Blanco, de 4 vías, en un borde corto de la placa, con la serigrafía «Rx Tx GND 5V» de un extremo al otro | Foto |
| Orden respecto al manual | El manual numera 1 = 5 V, 2 = GND, 3 = TX y 4 = RX: el pin 1 es el extremo «5V» de la serigrafía | Cálculo mío (cuadra con la foto) |
| Cable incluido | El anuncio no dice si trae cable | Texto |
| Paso del conector | No consta. En la foto la carcasa mide unos 11 a 12 mm de ancho (cálculo mío, con la placa de 33 mm de referencia), lo que queda entre JST-PH (10 mm) y JST-XH (12,4 mm) | Cálculo mío |
| Texto del anuncio | Habla de una carcasa de alta densidad y de tornillos a los dos lados; las fotos son del módulo suelto | Texto y foto |

## #7 Cables JST-XH de 4 pines (B0CBWZNP6Z)

| Dato | Valor | Origen |
|---|---|---|
| Contenido | 25 clavijas hembra de 4 pines con hilo y 25 conectores macho de 4 pines sin hilo | Texto |
| Hilos | 150 mm, 22 AWG, amarillo, blanco, rojo y negro | Texto |
| Paso | El anuncio dice 2,54 mm (el JST-XH nominal es de 2,5 mm) | Texto |
| Qué color va a qué posición | No consta | — |
| Otro extremo | Hilo pelado, sin conector | Texto |

## #4 Cable FFC de cámara (B07DKB4M1H)

| Dato | Valor | Origen |
|---|---|---|
| Contenido | Tres cables: 50, 100 y 200 cm | Texto |
| Conector | 15 pines, paso 1,0 mm | Texto |
| Compatibilidad | Raspberry Pi 2B, 3B, 3B+ y 4B; no Zero | Texto |
| Contactos en la misma cara o en caras opuestas | No consta | — |

## #19 Latiguillos micro-USB (B0DP2NT8LY)

| Dato | Valor | Origen |
|---|---|---|
| Contenido | 6 cables de 30 cm, 22 AWG, con un extremo micro-USB y el otro pelado y estañado | Texto |
| Hilos | Uno rojo y uno negro. No dice cuál va a VBUS | Texto |
| Datos | No sirve para datos (solo dos hilos) | Texto |
| Especificación del vendedor | 12 V y 3 A, valor de marketing | Texto |

## #10 Cable USB-A → USB-C acodado de 30 cm (B0C8FS5FV2)

| Dato | Valor | Origen |
|---|---|---|
| Cable | USB-C de 30 cm con una punta acodada a 90°, 5 V y 3,1 A de carga, 480 Mbit/s de datos | Texto |
| Qué punta es la acodada | No consta | — |
| Resistencia CC (56 kΩ) | No consta | — |
| Extremo en el borne | El anuncio no escribe «USB-A»; se llama «cable USB C». Con 480 Mbit/s y carga a 5 V, el otro extremo es USB-A | Cálculo mío |

## #9 SumUp Solo (B0C9V3LXTF)

| Dato | Valor | Origen |
|---|---|---|
| Qué trae | Lector, base de carga, tarjeta con las marcas aceptadas, guía y un cable | Texto y foto |
| Cable que trae | USB-C en las dos puntas (una reseña con compra verificada lo dice) | Reseña |
| Conectividad | Wi-Fi y datos móviles; batería de hasta 12 h | Texto |
| Dónde está el USB-C del lector | En el **canto de abajo** del lector, hacia el centro. Se ve en una foto en perspectiva (la barra de estado de la pantalla marca cuál es el canto de arriba). Es una foto, no una medida: ni la distancia a la esquina ni el tamaño de la ranura constan | Foto |
| Botón de encendido | En el canto derecho: se ve un botón cuadrado en esa misma foto | Foto |
| Fotos que miré | Seis de las siete de la galería; en las demás no se ve ningún puerto | Foto |

## Lo que sigue sin salir de Amazon

- Esquema interno del C14.
- Paso y tipo del conector J1 del ZE29A.
- Cara de los contactos del FFC.
- Polaridad del latiguillo micro-USB y calibre real de sus hilos.
- Corriente máxima del borne USB-A y el cable de 30 cm acodado.
