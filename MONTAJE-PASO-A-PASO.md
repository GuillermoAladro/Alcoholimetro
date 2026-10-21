# MONTAJE PASO A PASO

Cómo montar el circuito del alcoholímetro por fases: con qué piezas y qué probar antes de pasar a la fase siguiente. Las conexiones (W1 a W30) y los números de pieza (#1 a #32) son los del [MONTAJE GENERAL](MONTAJE-GENERAL.md). Aquel documento dice qué va con qué; este dice en qué orden se monta y cómo se comprueba cada paso.

**Estado a 21-10-2026: es un procedimiento de papel. No se ha montado nada.** Sigue el diseño del MONTAJE GENERAL (guía de cableado y `decisiones-diseno.md`). Si al final manda el diseño A del 21-10-2026, cambian sobre todo las fases 3 (sin pulsador) y 8 (colocación y tierra).

**La idea:** ir de lo que no puede romper nada a lo que sí, y probar cada parte por separado antes de juntarla. El orden sigue el plan de banco de las auditorías (Auditor 6.1-S §9, 6-A §8, P §8 y 5.6 §9):

1. Piezas sin tensión.
2. La Pi sola, con su fuente oficial.
3. Los periféricos uno a uno, todavía sin la fuente de la máquina.
4. La parte de 230 V, en banco.
5. El reparto de 5 V, con cargas ficticias.
6. Las cargas reales, una a una.
7. El tubo de soplido.
8. La carcasa y la tierra.
9. La máquina cerrada.

**Cada prueba lleva un número (P2.3, P5.4…) y un criterio de «pasa».** No pases a la fase siguiente con una prueba que no pasa. Apunta cada resultado en la [tabla de registro](#registro-de-pruebas) del final. Los criterios marcados **(mío)** son propuesta mía. Los demás salen de una hoja de datos o del MONTAJE GENERAL.

## Reglas para todo el montaje

1. **La parte de 230 V (fases 4 y 8) la hace o la revisa un electricista.** Nadie toca la fuente ni el módulo C14 con el cordón enchufado. Apagar el interruptor no basta: lo que hay antes del interruptor sigue con tensión.
2. **Cables de señal y fusibles se cambian con todo apagado.** Vale para la UART, el FFC de la cámara, el pulsador y el HDMI. La única excepción es la prueba P6.13, que se hace a propósito.
3. **Nunca 5 V en un pin del GPIO.** Los únicos pines de 5 V son el 2 y el 4.
4. **Antes de conectar una carga, mide su rama sin carga:** tensión y polaridad.
5. **No subas el trimmer de la fuente para tapar una caída de tensión.** El tope es 5,12 V.
6. **Cada cable se conecta por la posición que has comprobado, no por su color.**

## Fase 0. Antes de empezar

### 0.1 Decisiones que conviene tomar ya

| Decisión | Dónde está explicada | Qué fase cambia |
|---|---|---|
| Qué diseño manda: este o el A | MONTAJE GENERAL, 6.3 | 3 y 8 |
| Unir el −V a tierra en un punto (W12b) o dejarlo flotante | W12b | 8 |
| Poner resistencias de 1 kΩ en la UART y un pull-up externo en el pulsador | W19 a W21 | 3 y 6 |
| Boquilla en la posición A o en la B | W28 | 7 |

### 0.2 Material que no está en la lista de compra

**Se monta en la máquina:**

- Tapa aislante para los bornes 1, 2 y 3 de la fuente, con material y temperatura conocidos (MONTAJE GENERAL, apartado 4, punto 16).
- Dos arandelas aislantes para el jack RP-SMA del techo (W26).
- Tornillos M2 y separadores para la cámara, cuyos taladros son de 2,2 mm (fila 3 del MONTAJE GENERAL).
- Tres resistencias de 1 kΩ y termorretráctil, si se adoptan (W19 a W21).
- Dos punteras dobles para 2 × 0,75 mm², para los bornes 4 y 5 de la fuente (W11 a W13). Comprueba antes si el kit #28 las trae.
- Racores y piezas en T para el tubo de soplido. Se eligen después de medir las tomas del sensor (P1.8, W28).
- Si el C14 resulta de un solo polo o sin esquema de fabricante: una entrada C14 bipolar con esquema documentado (P1.1).

**Solo para el banco:**

- Fuente oficial de Raspberry Pi para micro-USB, de 5,1 V y 2,5 A.
- Un cargador USB-A de 5 V y 2 A para la pantalla.
- Un cargador USB-C para el Solo, que se usa con su propio cable C–C.
- Un medidor USB (USB tester) que lea tensión y corriente. Mejor si viene con una carga USB de 1 A y 2 A.
- Cargas ficticias: resistencias de potencia de cuerpo de aluminio, atornilladas a una chapa porque se calientan:

  | Resistencia | Corriente a 5,1 V | Disipa |
  |---|---|---|
  | 1 × 2,5 Ω, 25 W | unos 2 A | 10,4 W |
  | 2 × 5 Ω, 10 W | unos 1 A cada una | 5,2 W |
  | 1 × 10 Ω, 10 W | unos 0,5 A | 2,6 W |

- Un alcoholímetro de referencia para comparar (guía §8).

### 0.3 Herramientas e instrumentos

- Polímetro (continuidad, ohmios, voltios).
- Pinza amperimétrica de continua.
- Osciloscopio de 20 MHz o más, con el muelle de masa corto en la punta.
- Calibre.
- Crimpadora para terminales preaislados, para los faston y los ojales. La #28 solo sirve para punteras (auditoría 2.0).
- Crimpadora para Dupont y JST.
- Pelacables y destornilladores aislados.
- Termómetro de contacto o termopar.
- Comprobador de continuidad de tierra de 10 a 25 A: lo trae el electricista.
- Opcional: fuente de laboratorio con límite de corriente.

## Fase 1. Recepción de piezas, sin tensión

**Piezas:** todas. **Herramientas:** polímetro y calibre. **No se enchufa nada.**

| Prueba | Pieza | Cómo | Pasa si | Si no pasa |
|---|---|---|---|---|
| P1.1 | Módulo C14 (#15) | Protocolo del MONTAJE GENERAL, apartado 4, punto 1 (siete subpasos), con el fusible T2,5A puesto | El esquema que dibujas coincide con uno de fabricante y el interruptor corta los dos polos | Se compra una entrada C14 bipolar documentada. Puedes seguir con las fases 2 y 3 mientras llega, pero no con la 4 |
| P1.2 | Fuente (#14) | Lee la etiqueta y la serigrafía de los bornes | LRS-50-5; bornes 1 AC/L, 2 AC/N, 3 FG, 4 −V, 5 +V | Devolverla |
| P1.3 | Fusibles (#16 y kit #32) | Busca en la etiqueta de la caja los valores que se usan: T2,5A, F 1, 2, 3 y 5 A. Mide la continuidad de uno de cada | Cada uno da continuidad | El grabado del cristal se lee mal: fíate de la caja |
| P1.4 | Bornes USB-A (#18), los dos | Continuidad del tornillo «+» al pin 1 del conector hembra y del «−» al pin 4 | Las dos dan continuidad | Otro borne |
| P1.5 | Cable acodado (#10) | Mira los dos extremos y qué punta es la acodada. Prueba si la punta del Solo pasa por una ranura de 14 × 9 mm | Es A → C y la punta cabe | Otro cable. Los 56 kΩ del pin CC los comprueba P3.13 |
| P1.6 | Cable de alimentación de la pantalla (viene con #5) | Mira el extremo grande | Es USB-A | Comprar un cable A → C aparte |
| P1.7 | Latiguillo micro-USB (#19) | Enchúfalo en la Pi **apagada**. Mide continuidad del hilo rojo al pin 2 del GPIO y del negro al pin 6. El micro-USB pasa por el polifusible F1 a los pines de 5 V (esquema RP-008339) | Rojo con el pin 2 y negro con el pin 6 | Si sale al revés, marca los hilos: manda la medida, no el color. Rasca un extremo: si debajo del cobre se ve gris, es aluminio cobreado y conviene otro |
| P1.8 | ZE29A (#6) | Calibre en el conector J1 para el paso. Lee la serigrafía. Mide sus dos tomas de aire: qué son (racor, tubito o agujero) y su diámetro | J1 identificado, serigrafía «Rx Tx GND 5V», tomas medidas | Si el J1 no es XH, busca una clavija que sí encaje |
| P1.9 | Clavija JST (#7) | Encájala en el J1 sin forzar y apunta qué color cae en cada pin: 1 (5V), 2 (GND), 3 (TX), 4 (RX) | Encaja sin forzar y tienes los colores apuntados | No la fuerces: otra clavija |
| P1.10 | Cable FFC (#4) | Pon el cable plano sobre la mesa | El metal de una punta se ve por arriba y el de la otra por abajo («caras opuestas») | Prueba otro cable del pack |
| P1.11 | Pulsador (#11) | Busca con el polímetro el par de faston que cierra al pulsar | Dos faston identificados y marcados | — |
| P1.12 | Tubo de silicona (#8) | Diámetro interior y exterior con calibre | Medidas apuntadas | — |
| P1.13 | WAGO (#20) | Aparta las piezas que se van a usar | 2 × 221-415, 1 × 221-413 y 4 × 221-412 | — |

**Para pasar a la fase 2:** P1.2 a P1.13 pasan y P1.1 está decidida, aunque la entrada nueva aún no haya llegado.

## Fase 2. La Pi sola, con su fuente oficial

**Piezas:** Pi (#1), microSD (#2) y un Dupont (#29). **Banco:** fuente oficial de la Pi. La fuente de la máquina no se usa todavía.

**Pasos:**

1. Graba Raspberry Pi OS Lite (Trixie) en la microSD con Raspberry Pi Imager. Activa SSH.
2. Añade a `/boot/firmware/config.txt`:
   - `enable_uart=1`
   - `dtoverlay=disable-bt`

   **No pongas** `dtoverlay=disable-wifi`: el Wi-Fi interno será el punto de acceso del Solo (W29).
3. En `/boot/firmware/cmdline.txt`, que es una sola línea:
   - quita `console=serial0,115200` si está;
   - añade al final `video=HDMI-A-1:1024x600M@60`.
4. Ejecuta `sudo systemctl disable hciuart`.
5. En `sudo raspi-config`:
   - Interface Options → Serial Port: consola **No**, hardware **Sí**.
   - Localisation → WLAN Country → **ES**.
6. Ejecuta `sudo apt install python3-picamera2 python3-serial python3-gpiozero --no-install-recommends`.

**Pruebas:**

| Prueba | Cómo | Pasa si | Si no pasa |
|---|---|---|---|
| P2.1 | Enciende la Pi y entra por SSH | Responde | Vuelve a grabar la tarjeta |
| P2.2 | `ls -l /dev/serial0` | Apunta a `ttyAMA0` | Revisa `disable-bt` y `enable_uart` |
| P2.3 | `vcgencmd get_throttled` tras 10 minutos encendida | `throttled=0x0` | Cambia la fuente o el cable |
| P2.4 | Bucle de la UART. Con la Pi **apagada**, pon un Dupont entre los pines 8 y 10. Enciéndela y ejecuta el código de abajo | Imprime `b'hola'` | Revisa la consola serie (pasos 3 y 5) |

```python
import serial
s = serial.Serial("/dev/serial0", 9600, timeout=1)
s.write(b"hola"); print(s.read(4))
```

Al terminar, quita el Dupont **con la Pi apagada**.

## Fase 3. Los periféricos uno a uno, sin la fuente de la máquina

La Pi sigue con su fuente oficial. **Cada periférico se conecta con la Pi apagada.**

### 3.1 Cámara (#3 y #4)

Prueba primero con el cable corto que trae la cámara y después con el FFC de 50 cm: así, si algo falla, sabes si es el cable (auditoría 6-A, A6A-14). En el lado de la Pi los contactos miran hacia el HDMI; en el lado de la cámara, hacia su placa.

| Prueba | Cómo | Pasa si |
|---|---|---|
| P3.1 | `rpicam-hello --list-cameras` | Aparece el sensor `imx708` |
| P3.2 | Ejecuta `rpicam-still -o prueba.jpg` 20 veces con el cable de 50 cm | Ningún error, fotos nítidas |

### 3.2 Pantalla (#5)

Conecta el HDMI de la pantalla a la Pi (W23). Alimenta la pantalla por su USB-C «Power IN», con su cable y el cargador de 5 V y 2 A, poniendo el medidor USB entre el cargador y el cable.

| Prueba | Cómo | Pasa si |
|---|---|---|
| P3.3 | Arranca la Pi | Se ve la consola a 1024 × 600 |
| P3.4 | Sube el brillo al máximo y lee el medidor USB | Apunta la corriente. El anuncio da 5 W, es decir 1 A |
| P3.5 | Roza el conector USB-C de la pantalla | La imagen no parpadea. Si parpadea, en la fase 8 hay que sujetar el cable |
| P3.6 | Pantalla encendida y la Pi **sin** su fuente: mide entre los pines 2 y 6 de la Pi | Menos de 0,5 V, es decir, la pantalla no alimenta a la Pi por el HDMI **(mío; auditoría 6.1-S F07)** |

### 3.3 Pulsador (#11, #27 y #29)

1. Pon un faston hembra de 2,8 mm en cada uno de los dos terminales del interruptor (los de P1.11).
2. Faston A → Dupont → pin 11. Faston B → Dupont → pin 9 (W21 y W22).
3. Si lo has decidido en 0.1, pon una resistencia de 1 kΩ entre el pin 11 y el pin 1 (3,3 V).

| Prueba | Cómo | Pasa si |
|---|---|---|
| P3.7 | Ejecuta el contador de abajo, pulsa 100 veces y luego deja el botón quieto 10 minutos | 100 cuentas exactas y ninguna más en esos 10 minutos (auditoría P, H12) |

```python
from gpiozero import Button
from signal import pause
n = 0
def contar():
    global n; n += 1; print(n)
Button(17, bounce_time=0.05).when_pressed = contar
pause()
```

### 3.4 Adaptador Wi-Fi AR9271 (#12) y la Wi-Fi de salida

Conecta el adaptador a un USB de la Pi (W25) y enrosca su antena.

| Prueba | Cómo | Pasa si | Si no pasa |
|---|---|---|---|
| P3.8 | `lsusb` e `iw dev` | Aparece `0cf3:9271` (Atheros AR9271) y hay dos interfaces, `wlan0` y `wlan1` | Instala `firmware-atheros`. Si el chip es otro, devuelve el adaptador |
| P3.9 | `nmcli device wifi connect <tu-red> password <clave> ifname wlan1` y luego `ping -I wlan1 1.1.1.1` | Responde | — |

**Fija los nombres `wlan0` y `wlan1` por la dirección MAC** (un archivo `.link` de systemd) para que no se intercambien al arrancar (W30).

### 3.5 Punto de acceso para el Solo (wlan0)

Ejecuta `nmcli device wifi hotspot ifname wlan0 band bg channel <1, 6 u 11> ssid <red-maquina> password <clave>`. Elige el canal más lejos posible del de tu router (W29).

| Prueba | Cómo | Pasa si |
|---|---|---|
| P3.10 | Conecta un móvil a la red de la máquina | Navega por Internet a través de la Pi |

### 3.6 SumUp Solo (#9), primero con su propio cargador

Las cuatro auditorías piden validar la carga del Solo con su cargador antes de pasarlo a la rama de la máquina.

| Prueba | Cómo | Pasa si | Si no pasa |
|---|---|---|---|
| P3.11 | Cárgalo con su cable C–C y el cargador USB-C, con el medidor USB en medio | Marca corriente y la batería sube | Contacta con SumUp |
| P3.12 | Conecta el Solo a la red de la máquina (2,4 GHz) desde su pantalla. Configura la Cloud API: sandbox, Solo virtual, emparejar el real y `GET /readers/{id}/status`. Haz un cobro de 1 € con tu tarjeta | `ONLINE`, firmware 3.3.39.0 o superior y el cobro sale | Firmware antiguo: actualizar el Solo |
| P3.13 | Cárgalo ahora con el cable acodado (#10) desde el cargador de la pantalla | Carga igual. Si no carga con este cable y sí con el suyo, al cable le falta la resistencia de 56 kΩ | Otro cable |
| P3.14 | Apaga el Solo, desenchúfalo, espera un minuto y vuelve a enchufarlo | **Apunta si se enciende solo.** Si no se enciende, la máquina no cobrará después de un corte de luz: hay que resolverlo con SumUp antes de instalarla (MONTAJE GENERAL, apartado 4, punto 15) | No bloquea el montaje, pero sí la instalación en un bar |

**Para pasar a la fase 4:** P2.1 a P3.13 pasan y P3.14 está apuntada.

## Fase 4. La parte de 230 V y la fuente, en banco (con electricista)

**Piezas:**

- Fuente (#14).
- Módulo C14 (#15) o la entrada bipolar que lo sustituya.
- Fusible T2,5A (#16) y cordón Schuko-C13 (#17).
- Hilos marrón, azul y verde-amarillo de la manguera (#22).
- Faston (#27), punteras (#28) y la tapa de bornes.

**Montaje en banco:**

- El C14 va montado en una chapa con su recorte o en una caja de pruebas aislante, **nunca suelto**.
- La fuente va con la tapa de bornes puesta, sobre una base aislante.
- **Tierra provisional:** un hilo verde-amarillo directo del PE del C14 al borne 3 (FG) de la fuente. En la fase 8 lo sustituyen W6 y W7.
- Cablea W2 a W5 según el esquema que salió en P1.1. Los faston se crimpan con la crimpadora de terminales preaislados.

| Prueba | Cómo | Pasa si | Si no pasa |
|---|---|---|---|
| P4.1 | **Sin enchufar.** Mide entre L y N del enchufe del C14, con el interruptor en O y en I. Mide también del PE del C14 a la carcasa de la fuente | Entre L y N, nunca 0 Ω (con la fuente conectada el polímetro puede marcar un valor que sube: es su condensador de entrada). Del PE a la carcasa, 0,1 Ω o menos | Revisar el cableado |
| P4.2 | Haz cinco crimpados de prueba con la misma herramienta y tira de ellos con fuerza | Ninguno se suelta. La ficha da al menos 133 N para 16 AWG (#23 y #27) | Otra herramienta u otro terminal |
| P4.3 | **Primer enchufado**, con el interruptor en O y sin tocar nada. Pasa a I y vuelve a O | En I: LED verde de la fuente y lámpara encendidos. En O: los dos apagados | Desenchufar y revisar W2 a W5 |
| P4.4 | Sin carga, mide entre los bornes 4 y 5 y ajusta el trimmer | 5,10 V | — |
| P4.5 | Cinco arranques: interruptor en I, luego en O, desenchufa y espera un minuto antes del siguiente | El T2,5A no se funde y cada vez da 5,10 V | Revisar el fusible y la coordinación (ficha #16) |
| P4.6 | Rizado sin carga con el osciloscopio | Apunta los mVp-p. Sin carga la fuente trabaja en ráfaga (nota 7 de su hoja): sirve de referencia | — |
| P4.7 | Déjala 15 minutos encendida sin carga | Nada huele y la fuente está, como mucho, tibia | Desenchufar y revisar |

## Fase 5. El reparto de 5 V, con cargas ficticias

Todavía sin la Pi, el Solo, la pantalla ni el sensor.

**Piezas:**

- WAGO (#20): 2 × 221-415, 1 × 221-413 y 4 × 221-412.
- Cable rojo y negro de 0,75 mm² (#21).
- Punteras y punteras dobles (#28).
- Los cinco portafusibles (#32): F 5 A, F 3 A, F 2 A, F 2 A y F 1 A.
- Los dos bornes USB-A (#18), con el puente D+–D− hecho y el tornillo S unido al «−».

**Cableado, con la fuente desenchufada:**

1. **Troncal (W11 y W12).**
   - Borne 5: puntera doble con el rojo del troncal y el rojo de la rama de la Pi. El troncal pasa por el portafusibles **F 5 A** y llega a la WAGO «+5 V», polo 1. Como mucho 25 cm.
   - Borne 4: puntera doble con el negro del troncal y el negro de la rama de la Pi. El troncal va al polo 1 de la WAGO 221-413 «−V», y de su polo 2 al polo 1 de la WAGO «GND». El polo 3 queda libre hasta W12b, en la fase 8.
2. **Rama de la Pi (W13), directa a la fuente.**
   - Rojo: del borne 5 a una 221-412, de ahí al portafusibles **F 3 A** y a otra 221-412 donde se empalmará el rojo del latiguillo.
   - Negro: del borne 4 a una 221-412 donde se empalmará el negro del latiguillo.
   - El latiguillo **todavía no se empalma**: la carga ficticia va en esas dos 221-412.
3. **Ramas del Solo y de la pantalla (W14 y W16).** Polo 3 o 4 de la WAGO «+5 V» → portafusibles **F 2 A** → tornillo «+» del borne. Polo 3 o 4 de la WAGO «GND» → tornillo «−».
4. **Rama del sensor (W18).** Polo 5 de la WAGO «+5 V» → portafusibles **F 1 A** → una 221-412 donde se empalmará el hilo del pin 1 de la clavija. Polo 5 de la WAGO «GND» → donde irá el hilo del pin 2.
5. El polo 2 de las dos 221-415 queda libre.

**Cargas ficticias:**

| Rama | Carga | Dónde se conecta |
|---|---|---|
| Pi | 2,5 Ω (unos 2 A) | En las dos 221-412 de la rama |
| Solo | 5 Ω (unos 1 A), o la carga USB | En el borne nº 1 |
| Pantalla | 5 Ω (unos 1 A), o la carga USB | En el borne nº 2 |
| ZE29A | 10 Ω (unos 0,5 A) | En la 221-412 de la rama y en el polo 5 de la WAGO «GND» |

| Prueba | Cómo | Pasa si | Si no pasa |
|---|---|---|---|
| P5.1 | **Sin enchufar.** Mide continuidad del borne 5 a cada salida de +5 V (a través de su fusible) y del borne 4 a cada GND. Mide también entre +5 V y GND | Todas dan continuidad. Entre +5 V y GND nunca 0 Ω | Corregir el cableado |
| P5.2 | Enchufado y sin cargas: mide cada salida. En los bornes USB-A, con el medidor USB | Todas dan la tensión de la fuente (diferencia de 0,02 V como mucho) y la polaridad es la correcta | — |
| P5.3 | Pon las cargas ficticias **una a una**. En cada caso mide la tensión en la fuente, en la WAGO y en el extremo de la rama, y la corriente con la pinza | Ningún fusible se funde. Las tensiones quedan apuntadas | — |
| P5.4 | **Las cuatro cargas a la vez** (unos 4,5 A). Mismas medidas y calcula las resistencias (fórmulas debajo) | R_troncal de 0,04 Ω o menos, R de la rama de la Pi de 0,06 Ω o menos y tensión prevista en la Pi de 4,90 V o más **(mío)** | Mide la caída en cada contacto: más de 10 mV a 2 A en uno solo indica un contacto malo **(mío)**. Rehazlo o acorta el cable. No subas el trimmer por encima de 5,12 V |
| P5.5 | Rizado con el osciloscopio en el extremo de cada rama, primero con las cuatro cargas y después solo con la del ZE29A (unos 0,5 A, el 5 % de la fuente: el peor caso de la nota 7) | En todas las ramas, pico de 5,25 V o menos (continua más medio rizado). Apunta los mVp-p | **Para.** Decide antes de seguir: filtro medido o cambiar de fuente (auditorías 6.1-S F05 y 5.6 C-05) |
| P5.6 | Una hora con las cuatro cargas | Ningún fusible fundido. Portafusibles, empalmes y bornes por debajo de 60 °C **(mío)** | El contacto que se calienta está mal hecho |
| P5.7 | **Opcional y supervisada.** Con las cargas puestas y gafas, une con un hilo corto de 0,75 mm² la salida del fusible del ZE29A con su GND, como mucho 2 s. Repite en la rama de la Pi | Se funde el fusible de esa rama, el F 5 A del troncal no, y las otras ramas vuelven a 5,0 V o más **(mío)** | Si la fuente entra en hipo y el fusible no se funde en 2 s, la protección no coordina: no sigas (auditoría 6.1-S F04) |

**Cálculo de P5.4:**

- R_troncal = (V_fuente − V_WAGO) ÷ I_troncal. I_troncal es la suma de las ramas del Solo, la pantalla y el sensor.
- R_rama = (V_al principio de la rama − V_en el extremo) ÷ I_rama.
- **Tensión prevista en la Pi** = V_fuente − 0,9 A × (R_rama_Pi + 0,12 Ω).
- Los 0,12 Ω son el latiguillo, el conector micro-USB y el polifusible de la Pi (MONTAJE GENERAL, W13).

Al acabar, quita las cargas ficticias con la fuente desenchufada.

## Fase 6. Las cargas reales, una a una, en el banco

Fuente en banco con la tierra provisional de la fase 4. **Orden: sensor, Pi, pantalla y Solo** (auditoría P, §8.7). Todo se conecta con la fuente desenchufada.

### 6.1 Sensor ZE29A, solo la alimentación

Mete la clavija en el J1 y cablea por la posición que apuntaste en P1.9: el hilo del pin 1 a la 221-412 de su fusible y el del pin 2 a la WAGO «GND» (W18). **Los hilos de los pines 3 y 4 quedan sueltos y aislados.**

| Prueba | Cómo | Pasa si | Si no pasa |
|---|---|---|---|
| P6.1 | Tensión entre los pines 1 y 2, medida en el conector | Entre 4,7 y 5,3 V (manual: 5 V ±0,3 V) | — |
| P6.2 | Tensión del pin 3 (TX) frente a GND | Unos 3,3 V | **Si da 5 V, para:** conectado a la Pi, la dañaría |
| P6.3 | Corriente de la rama en reposo, con la pinza | Apúntala. Por debajo de 0,5 A (manual) | — |

### 6.2 Raspberry Pi, sin la UART

1. Corta el latiguillo a 15 cm como mucho.
2. Empalma su rojo y su negro en las 221-412 de la rama de la Pi, según la polaridad medida en P1.7.
3. Enchufa el micro-USB a la Pi (W13).

| Prueba | Cómo | Pasa si | Si no pasa |
|---|---|---|---|
| P6.4 | Arranca la Pi. Mide entre el pin 4 y el pin 6 y ejecuta `vcgencmd get_throttled` | 4,90 V o más en reposo y `0x0` | Latiguillo más corto o de hilo más grueso, de 18 a 20 AWG (W13) |

### 6.3 La UART

Con todo desenchufado:

1. Hilo del pin 3 del sensor → Dupont → pin 10 de la Pi.
2. Hilo del pin 4 del sensor → Dupont → pin 8 de la Pi.
3. Si lo decidiste en 0.1, una resistencia de 1 kΩ en serie en cada hilo (W19 y W20).
4. Haz una foto del alojamiento Dupont puesto y compárala con la figura 3 (MONTAJE GENERAL, apartado 4, punto 11).

| Prueba | Cómo | Pasa si | Si no pasa |
|---|---|---|---|
| P6.5 | `orden(0x85)` con el código de abajo | Responde `FF 85 31 00 00 00 00 00 4A` (reposo) | **Con todo apagado**, cruza TX y RX y repite (ficha #6) |
| P6.6 | `orden(0x87, (0x32,0,0,0,0))` y después lee el estado con `orden(0x85)` cada pocos segundos, sin soplar | Pasa a 0x32 (precalentando) y unos 10 s después a 0x33. Al minuto sin soplar, vuelve a 0x31 (manual) | — |

```python
import serial
s = serial.Serial("/dev/serial0", 9600, timeout=1)
def orden(cmd, d=(0, 0, 0, 0, 0)):
    b = [0xFF, 0x01, cmd, *d]
    b.append((-sum(b[1:8])) & 0xFF)            # checksum del manual
    s.reset_input_buffer(); s.write(bytes(b)); r = s.read(9)
    print(" ".join(f"{x:02X}" for x in r) or "sin respuesta")
    return r
```

### 6.4 Pantalla

Conecta el cable de la pantalla al borne nº 2 (W17) y el HDMI a la Pi (W23).

| Prueba | Cómo | Pasa si | Si no pasa |
|---|---|---|---|
| P6.7 | Pon el medidor USB entre el borne y el cable y sube el brillo al máximo | Hay imagen. En el borne, con carga, 4,75 V o más (mínimo de un puerto USB 2.0). Apunta la corriente | — |

### 6.5 SumUp Solo

Solo si pasaron P3.11 a P3.13. Conecta el Solo al borne nº 1 con el cable acodado (W14 y W15), con el medidor USB en medio.

| Prueba | Cómo | Pasa si | Si no pasa |
|---|---|---|---|
| P6.8 | Déjalo cargando una hora | Marca corriente, la batería sube y en el borne hay 4,75 V o más. Apunta la corriente: si es de unos 0,5 A, el Solo no reconoce el puente D+/D− como cargador | Si no carga, vuelve a su cargador y habla con SumUp |
| P6.9 | Mira `battery_temperature` en `GET /readers/{id}/status` después de esa hora | Apúntala. El Solo funciona hasta 40 °C (guía) | — |

### 6.6 Todo junto

| Prueba | Cómo | Pasa si | Si no pasa |
|---|---|---|---|
| P6.10 | Todo a la vez: cámara en directo, Wi-Fi del bar, el Solo en la red de la máquina, pantalla al máximo. Mide la Pi entre los pines 4 y 6 y ejecuta `vcgencmd get_throttled` | 4,90 V o más y `0x0` durante 30 minutos | Fase 5, P5.4: rehacer contactos y acortar cables |
| P6.11 | Corriente de cada rama con la pinza, en reposo y en el pico: arranque de la Pi, foto, Solo cargando desde batería baja y retroiluminación al encender. El pico del sensor se mide en la fase 7 | Cada fusible queda por encima del pico con margen (MONTAJE GENERAL, apartado 4, punto 8) | Sube ese fusible un escalón, no más |
| P6.12 | Rizado con el osciloscopio en cada carga real | Pico de 5,25 V o menos | Como en P5.5 |
| P6.13 | **Prueba de apagado parcial, supervisada. Es la única vez que se quita un fusible con la máquina encendida, a propósito** (es 5 V). Con todo funcionando, desenrosca el portafusibles del sensor | La Pi sigue funcionando y `orden(0x85)` da «sin respuesta», no datos raros. Mide el pin 1 del sensor: si pasa de 1 V, el TX de la Pi lo está alimentando por la UART y hacen falta las resistencias de 1 kΩ (W19) **(mío; auditorías 6.1-S F12 y 6-A A6A-07)** | Vuelve a poner el fusible **con todo apagado** |

## Fase 7. El tubo de soplido y la prueba de medida

**Piezas:** tubo (#8), boquilla (opción A o B), racores y piezas en T elegidos con las medidas de P1.8, y una barrera (un reductor).

**Montaje (W28):** boquilla → T con la toma de presión → barrera → T con la toma de muestra → salida al aire. El tubo, corto y con pendiente hacia fuera, para que el agua de condensación no vaya al sensor (ficha #6).

| Prueba | Cómo | Pasa si | Si no pasa |
|---|---|---|---|
| P7.1 | `orden(0x92)` | Apunta el umbral de presión (por defecto 8) | — |
| P7.2 | `orden(0x87, (0x32,0,0,0,0))`. Espera a 0x33 y sopla fuerte y seguido 4 s | Pasa por 0x34 (soplando), 0x36 (calculando) y 0x37 (resultado listo) | Si se queda en 0x33, mejora la barrera o revisa el orden de las tomas antes de bajar el umbral con 0x93 |
| P7.3 | Sopla 2 s y para | Pasa a 0x35 (soplido cortado) y a los 3 s vuelve a 0x32 (manual) | — |
| P7.4 | Sin haber bebido, tres soplidos. Lee cada resultado con `orden(0x86)` | Menos de 20 mg/100 mL, alarma 0x00 (manual) | Revisa que el tubo no huela a disolvente y deja ventilar el tubo nuevo (ficha #8) |
| P7.5 | Después de una cerveza, tres soplidos en la máquina y tres en el alcoholímetro de referencia | Apunta las seis lecturas. **No las conviertas a mg/L**: el /220 es una deducción y Winsen no ha confirmado la unidad (auditorías H01 y 6.1-S F14) | — |
| P7.6 | Veinte soplidos seguidos y mira el tubo | No hay agua acumulada en la toma de muestra **(mío)** | Más pendiente o una trampa de condensación |

Durante P7.2 mide con la pinza el pico de corriente del sensor al tomar la muestra: completa P6.11.

## Fase 8. Carcasa y tierra (con electricista)

**Piezas:**

- Espárrago (#25), ojales (#23) y arandelas dentadas (#24).
- Hilo verde-amarillo (#22) y tornillería (#26).
- Separadores de nailon (#30) y pasacables (#31).
- Jack RP-SMA (#13) con sus arandelas aislantes, tapa de bornes, tornillos M2 de la cámara y bridas.

**Pasos, en este orden:**

1. **Espárrago:** que lo suelde un taller de chapa (ficha #25), con la pintura lijada alrededor.
2. **Fuente:** fijada por la base con M3 que entren 3 mm como mucho, contando la chapa y las arandelas (plano de la hoja de datos).
3. **C14:** en su hueco y bien fijado. Es la fijación la que aguanta el tirón del cordón (W1).
4. **Tierra definitiva:**
   - Quita la tierra provisional de la fase 4.
   - Monta W6 en la 1ª tuerca y W7 a W10 en la 2ª, en el orden del MONTAJE GENERAL, apartado 2.A.
   - Si lo decidiste en 0.1, monta W12b: del polo 3 de la 221-413 a la 2ª tuerca.
5. **Tapa de los bornes de la fuente.** El troncal de 5 V sale por el lado contrario a L y N.
6. **Caja interior:** Pi y sensor sobre separadores de nailon; la cámara con tornillos M2.
7. **Jack RP-SMA:** en el techo, con una arandela aislante a cada lado de la chapa (W26).
8. **Cables:**
   - Un pasacables en cada agujero de chapa.
   - Cada cable que va a la caja suspendida (FFC, HDMI, latiguillo, UART, tubo y la tierra W9) lleva un bucle de holgura y una brida en cada extremo (auditoría 1.0, H25).
9. **USB-C de la pantalla:** sujétalo; según una reseña, falla con un roce.
10. **Dupont:** con el alojamiento marcado o polarizado. Foto otra vez y compárala con la figura 3.

| Prueba | Cómo | Pasa si | Si no pasa |
|---|---|---|---|
| P8.1 | Continuidad de tierra desde el pin PE del C14 hasta cada pieza metálica: cuerpo, panel, techo, separador, bandeja, caja interior, cajón y carcasa de la fuente. La mide el electricista con el comprobador de 10 a 25 A | 0,1 Ω o menos en cada una | Rehacer esa unión |
| P8.2 | Con el alargo desconectado del AR9271: jack RP-SMA frente al techo | Abierto | Revisa las arandelas aislantes |
| P8.3 | Mapa de masas (MONTAJE GENERAL, apartado 4, punto 17) | Con W12b: continuidad del pin 6 de la Pi a la chapa. Sin W12b: abierto | Busca la unión que sobra: el jack o un tornillo |
| P8.4 | Todo desenchufado: continuidad de cada conexión, de W11 a W24, contra la tabla del MONTAJE GENERAL | Todas coinciden y ningún +5 V da continuidad a la chapa | — |
| P8.5 | Ensayo de aislamiento y de corriente de fuga | Lo define y lo hace el electricista con su procedimiento. **Nunca 500 V con la electrónica conectada** (auditorías) | — |
| P8.6 | Con todo funcionando, mueve la caja suspendida a mano en todas direcciones | Nada se desconecta, `get_throttled` sigue en `0x0` y la imagen no parpadea | Más holgura o mejor sujeción |

## Fase 9. La máquina cerrada

| Prueba | Cómo | Pasa si | Si no pasa |
|---|---|---|---|
| P9.1 | Tapa cerrada. Wi-Fi del Solo con `iw dev wlan0 station dump` durante una hora | Mejor que −70 dBm y ninguna desconexión | Plan B de W29: un segundo AR9271 como punto de acceso |
| P9.2 | Wi-Fi del bar por wlan1, con la antena fuera, durante una hora | Conexión estable | Mover la antena o usar el plan B de conexión (router 4G) |
| P9.3 | Media hora con foto, Wi-Fi y cobro de prueba a la vez | `get_throttled` en `0x0` (MONTAJE GENERAL, apartado 4, punto 18) | Fase 5, P5.4 |
| P9.4 | Veinte ciclos completos: cobro de prueba, soplido, foto y resultado | Los veinte sin error | — |
| P9.5 | Una hora cerrada con unos 30 °C de ambiente (guía) | Dentro, menos de 40 °C (el Solo admite hasta 40 °C y el sensor trabaja entre 10 y 40 °C). Apunta las temperaturas de la fuente, los portafusibles y los empalmes | Ventilador de 40 mm a 5 V (guía) |
| P9.6 | Rizado en cada carga con la tapa cerrada y caliente | Pico de 5,25 V o menos | Como en P5.5 |
| P9.7 | Cinco cortes de luz en momentos distintos: en reposo, durante el cobro, durante el soplido, durante la foto y al guardar | La Pi arranca sola, el programa se lanza y el sensor responde. **El Solo vuelve a `ONLINE` sin que nadie lo toque.** No hay cobros dobles y la tarjeta SD está intacta | Si el Solo no vuelve solo, ver P3.14 |

**Al pasar la fase 9, la máquina está lista para pruebas largas en tu taller, no para un bar.**

## Fase 10. Lo que falta para ponerla en un bar (no es del circuito)

- Autorización de SumUp por escrito: uso sin personal y ranura de chip tapada.
- El programa v2: lector de la UART robusto, máquina de estados completa y cobro sin duplicados (auditorías).
- Norma de producto y marcado CE (auditoría 5.6, C-09; guía §9).
- La foto: para qué sirve, cuánto tiempo se guarda y el cartel informativo (auditoría 1.0, H17 y H18).
- Qué diseño manda.

## Registro de pruebas

Copia esta tabla y añade una fila por prueba. Una prueba sin apuntar cuenta como no hecha.

| Prueba | Fecha | Pieza o número de serie | Valor medido | Pasa (sí/no) | Nota |
|---|---|---|---|---|---|
| P1.1 | | Módulo C14 | Esquema: … | | Foto del esquema |
| P4.4 | | LRS-50-5 | … V | | |
| P5.4 | | Reparto de 5 V | R_troncal … Ω · R_Pi … Ω · prevista en la Pi … V | | |
| P6.10 | | Máquina en banco | Pi … V · `get_throttled` … | | |
| … | | | | | |

## Fuentes

- [MONTAJE GENERAL](MONTAJE-GENERAL.md): conexiones W1 a W30, apartado 4 (medidas antes de dar tensión) y apartado 7 (auditorías).
- Manual V1.1 del ZE29A ([copia local](componentes/winsen-ze29a/datasheets/ze29a-c2h5oh.pdf)): tensión 5 V ±0,3 V, menos de 500 mA, UART a 3,3 V, estados 0x31 a 0x37 y sus tiempos, tramas, alarma por debajo de 20 mg/100 mL y notas sobre el tubo de soplido.
- Hoja de la LRS-50 ([copia local](componentes/meanwell-lrs-50-5/datasheets/LRS-50-SPEC.pdf)): bornes, rizado y sus notas 2 y 7, protección por hipo, arranque de 45 A y tornillos M3 (p. 4).
- Esquema reducido de la Pi 3B+ ([copia local](componentes/raspberry-pi-3b-plus/datasheets/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf)): el pin 1 del micro-USB pasa por el polifusible F1 (MF-MSMF250) a la red de 5 V, y el pin 5 es GND.
- Guía de montaje eléctrico v2 (20-10-2026), §7 y §8: configuración de la Pi y orden de pruebas.
- Auditorías del repositorio ([6.1-S](auditorias/2026-10-21-auditor-6.1-s/AUDITORIA.md), [6-A](auditorias/auditor-6-a/AUDITORIA-AUDITOR-6-A.md), Auditor P y Auditor 5.6) y las dos del Project: planes de banco, orden de las cargas, apagado parcial y criterios de tierra.
- [Tutorial de Raspberry Pi: punto de acceso con dos radios](https://www.raspberrypi.com/tutorials/host-a-hotel-wifi-hotspot/) y [Cloud API de SumUp](https://developer.sumup.com/terminal-payments/cloud-api).
