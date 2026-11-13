# Cableado del alcoholímetro (diseño A)

**Es la única tabla de cableado vigente** (13-11-2026). Sustituye al [MONTAJE GENERAL](historico/MONTAJE-GENERAL.md) del 20-10-2026, que queda como histórico. Si otro documento dice otra cosa, manda este; y por encima de este, [DECISIONES](DECISIONES.md).

**Es papel.** No hay nada montado ni medido. De dónde sale cada cifra y por qué se ha elegido cada cosa está en la [revisión de componentes del 13-11-2026](componentes/REVISION-13-11-2026.md). Las cuentas se repiten con [`componentes/cuentas.py`](componentes/cuentas.py).

**La parte de 230 V y la tierra la revisa un electricista antes de enchufar nada** ([hoja para él](componentes/REVISION-13-11-2026.md#10-hoja-para-el-electricista)).

> **El modelo 3D todavía no lleva estos cambios.** `carcasa/diseno-A/` (visor, `Conexiones_3D.html` y lista de piezas) sigue con cuatro portafusibles, la Pi por micro-USB y sin ventiladores. Se actualiza en el bloque de la carcasa.

## 1. Valores únicos

| Punto | Valor | Nota |
|---|---|---|
| Ajuste de la fuente | **5,10 V** sin carga, nunca más de 5,12 V | Baja a 5,05 V si el rizado medido en el sensor pasa de 150 mVpp |
| De dónde cuelga la Pi | **Directa a los bornes 4 y 5 de la fuente**, con su fusible, y entra por la placa de bornes del GPIO | Ya no por micro-USB |
| Fusible del troncal | **5 A** | Pico del troncal 3,1 A, el 62 % |
| Fusibles de rama | **Pi 3 A · pantalla 2 A · Solo 2 A · sensor 2 A · ventiladores 2 A** | La serie MINI de Littelfuse empieza en 2 A |
| Tipo de fusible de 5 V | **Cuchilla MINI de coche**, en portafusibles en línea | Seis portafusibles |
| Fusible de 230 V | **T2,5A** cerámico de 5 × 20 en la toma C14 | El segundo polo, si lo pide el electricista |
| Internet | **Módem 4G en el USB de la Pi**, antena por dentro | La Pi le corta la alimentación con `uhubctl` |
| Wi-Fi | La Pi crea la red del SumUp Solo | No se usa la Wi-Fi del bar |
| Masa | **−V unido a tierra en un solo punto** (W12b) | |
| UART | **1 kΩ en serie** en cada hilo | |
| Cinta de la cámara | La de 200 mm que trae la cámara | |

## 2. Conexiones

Numeración W del montaje anterior; W31 a W33 son nuevas. Cable de 5 V: 0,75 mm² rojo y negro. Cable de 230 V y tierra: 1,5 mm².

### A. Red y tierra

| N.º | De | A | Cable y terminales | Protección |
|---|---|---|---|---|
| W1 | Enchufe de la pared | Toma C14 | Cordón Schuko → C13 | Magnetotérmico y diferencial del bar |
| W2 | C14, pestaña del polo con fusible | Fuente, borne 1 (L) | Marrón. Faston aislado en la C14, puntera en la fuente | T2,5A de la C14 |
| W3 | C14, pestaña del otro polo | Fuente, borne 2 (N) | Azul. Igual | Segundo T2,5A en línea si lo pide el electricista |
| W6 | C14, pestaña de tierra | Espárrago de tierra del cajón, 1.ª tuerca | Verde-amarillo. Faston y ojal M4 con arandela dentada | Sin fusible |
| W7 | Espárrago del cajón, 2.ª tuerca | Fuente, borne 3 (FG) | Verde-amarillo. Ojal y puntera | — |
| W10 | Espárrago del cajón, 2.ª tuerca | Espárrago de la carcasa | Verde-amarillo flexible. **Ojal M4 y tuerca en los dos extremos** | Se suelta con llave para sacar el cajón |
| W12b | WAGO «−V», polo 3 | Espárrago del cajón, 2.ª tuerca | Verde-amarillo. Ojal M4 | Única unión de −V a tierra |

Qué pestaña de la C14 lleva el fusible se mide con la toma suelta antes de cablearla. Las chapas de la carcasa, el cajón, la tapa de la caja de red y la tapa abatible tienen que dar 0,1 Ω como mucho hasta el pin de tierra del enchufe.

### B. 5 V

| N.º | De | A | Cable y terminales | Fusible |
|---|---|---|---|---|
| W13 | Fuente, borne 5 (+V) → portafusibles | Placa de bornes GPIO, borne «5V» | Hilo de 16 AWG del portafusibles, en puntera doble con W11. Si el borne de la placa no lo admite, empalme a 0,75 mm² con una WAGO 221-412 | **MINI 3 A** |
| W13 | Fuente, borne 4 (−V) | Placa de bornes GPIO, borne «GND» | Negro, en puntera doble con W12. 25 cm como mucho | — |
| W11 | Fuente, borne 5 (+V) → portafusibles | WAGO «+5 V», polo 1 | Hilo del portafusibles directo al polo | **MINI 5 A** |
| W12 | Fuente, borne 4 (−V) | WAGO «−V» (221-413), polo 1. Su polo 2 → WAGO «GND», polo 1 | Negro | — |
| W14 | WAGO «+5 V», polo 2 → portafusibles | Borne USB-A n.º 1, tornillo «+». WAGO «GND», polo 2 → tornillo «−» | Puntera. D+ y D− unidos; S al «−» | **MINI 2 A** |
| W15 | Borne USB-A n.º 1 | SumUp Solo, USB-C | Cable USB-A → USB-C acodado. Brida en la clavija | — |
| W16 | WAGO «+5 V», polo 3 → portafusibles | Borne USB-A n.º 2. WAGO «GND», polo 3 → «−» | Como W14 | **MINI 2 A** |
| W17 | Borne USB-A n.º 2 | Pantalla, USB-C «Power IN» | Cable de la pantalla. Brida | — |
| W18 | WAGO «+5 V», polo 4 → portafusibles | ZE29A, pin 1. WAGO «GND», polo 4 → pin 2 | Hilos de la clavija JST, empalmados con WAGO 221-412 | **MINI 2 A** |
| W31 | WAGO «+5 V», polo 5 → WAGO 221-413 de ampliación → portafusibles | Rojo de los dos ventiladores. El negro, a la ampliación de «GND» | Tres hilos en una WAGO 221-413 a cada lado | **MINI 2 A** |
| W32 | Ampliación de «+5 V», polo libre | Condensador de 2200 µF, patilla +. La otra, a la ampliación de «GND» | Patillas con funda; el cuerpo, con brida | El del troncal |

Cada regleta («+5 V» y «GND») es una WAGO 221-415 con una 221-413 de ampliación enganchada a su polo 5. El fusible va siempre en el +5 V y lo más cerca posible de su origen.

### C. Señales

| N.º | De | A | Cable | Nota |
|---|---|---|---|---|
| W19 | Placa GPIO, borne GPIO14 (pin 8, TXD) → 1 kΩ | ZE29A, pin 4 (RX) | Hilo de la clavija JST | 3,3 V, 9600 8N1. Consola serie desactivada |
| W20 | ZE29A, pin 3 (TX) → 1 kΩ | Placa GPIO, borne GPIO15 (pin 10, RXD) | Igual | |
| W33 | Ventilador 1, hilo amarillo | Placa GPIO, borne GPIO22 (pin 15) | El del ventilador | Tacómetro. Resistencia interna de la Pi a 3,3 V |
| W33 | Ventilador 2, hilo amarillo | Placa GPIO, borne GPIO23 (pin 16) | Igual | |
| W23 | Pi, HDMI | Pantalla, HDMI | Cable HDMI acodado de 30 cm | Brida en los dos extremos |
| W24 | Pi, conector de cámara | Camera Module 3 | La cinta de 200 mm de la cámara | Con la Pi apagada |
| W25 | Pi, USB de abajo | Módem 4G | Directo, o con un alargador USB si el módem va detrás de la ventana | La Pi le corta la alimentación con `uhubctl` |
| W26 | Módem, toma CRC9 principal | Antena plana | Latiguillo y cable de la antena | Solo si la prueba de cobertura elige la antena |
| W27 | Pi, ranura | microSD | — | Cinta Kapton |
| W28 | Boquilla | T de presión → reductor → T de alcohol → escape | Tubo de 6 mm, **siempre cuesta abajo** | Filtro de PTFE en cada toma del sensor |

Cada resistencia de 1 kΩ va con una pata en el borne de la placa GPIO y la otra, con el hilo del sensor, en una WAGO 221-412. No hay nada soldado.

### D. Sin cable

| N.º | De | A | Nota |
|---|---|---|---|
| W29 | Pi, Wi-Fi interna como punto de acceso | SumUp Solo | 2,4 GHz, arranque automático |
| W30 | Módem | Internet | «Solo 4G», SIM sin PIN |

## 3. Cuentas

Todo es cálculo sobre datos de hoja o estimaciones; la columna de origen dice cuál.

**Consumo por rama:**

| Rama | Típico | Pico | Fusible | Pico sobre fusible | Origen |
|---|---|---|---|---|---|
| Pi con cámara y módem | 1,30 A | 2,10 A | 3 A | 70 % | Pi y cámara, estimación; módem, menos de 3,5 W (hoja de Huawei) |
| Pantalla | 0,80 A | 1,00 A | 2 A | 50 % | 5 W (anuncio) |
| Solo | 0,20 A | 1,50 A | 2 A | 75 % | Sin dato oficial |
| Sensor | 0,10 A | 0,50 A | 2 A | 25 % | Menos de 500 mA (manual) |
| Ventiladores | 0,09 A | 0,10 A | 2 A | 5 % | Hoja de Noctua |
| Troncal | 1,19 A | 3,10 A | 5 A | 62 % | La Pi no va por él |
| **Fuente** | **2,49 A** | **5,20 A** | 10 A | 52 % | |

**Tensión en la Pi**, con la fuente a 5,10 V:

| Montaje | Resistencia de la rama | Pico con el módem (2,1 A) | Peor caso, con la fuente en su mínimo |
|---|---|---|---|
| **Placa de bornes y 0,75 mm²** | 59 mΩ (92 en el peor caso) | **4,98 V** | **4,80 V** |
| Micro-USB de 22 AWG y 15 cm (diseño anterior) | 115 mΩ (226) | 4,86 V | 4,52 V |

El aviso de subtensión de la Pi salta por debajo de 4,63 V. Objetivo en banco: 4,90 V o más entre el pin 4 y el pin 6.

**Tensión en las demás cargas:** pantalla 4,91 V típicos (4,63 V en el peor caso); Solo cargando a tope 4,84 V (4,51 V); sensor 5,02 V (4,83 V), dentro de sus 4,7 a 5,3 V.

**Máximo en el sensor:** con la fuente a 5,10 V, 5,21 V en continua. El rizado no puede pasar de 186 mVpp. Se mide con osciloscopio.

**Calor:** unos 16 W dentro (entre 13 y 21 W). Sin ventilador, de 17 a 24 °C sobre el bar; con los dos ventiladores, unos 8 °C en la salida. Detalle en la [revisión](componentes/REVISION-13-11-2026.md#33-calor).

## 4. Antes de dar tensión

Las pruebas que deciden, con su criterio, están en la [revisión](componentes/REVISION-13-11-2026.md#9-pruebas-de-banco-que-deciden-por-orden). Las comprobaciones de cada pieza al recibirla (pestañas de la C14, conector del sensor, polaridades) siguen en el [paso a paso histórico](historico/MONTAJE-PASO-A-PASO.md) hasta que se rehaga sobre el diseño A.
