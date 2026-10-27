# Programa del alcoholímetro (Raspberry Pi 3B+)

Programa de la máquina: cobra con el SumUp Solo, mide con el ZE29A, hace la foto con la Camera Module 3 y lo enseña todo en la pantalla de 7". Sustituye a `main.py` y `ze29a.py` del Project (versión en Python del 19 y 25-10-2026).

26-10-2026 · Claude para Guillermo. **No está probado con el hardware real**: todo se ha probado con el hardware simulado (apartado 4). Lo que falta comprobar con las piezas está en el apartado 9.

## 1. Qué hace

1. **Espera.** La pantalla pasa las fotos del top 10 con su resultado, el ranking y frases para animar a jugar. El Solo está siempre pidiendo tarjeta (2,00 €): la Pi le deja un cobro abierto y lo renueva cuando caduca (DECISIONES 25-10).
2. **Pago.** En cuanto el cobro sale pagado: «¡Pago aceptado!».
3. **Preparando** (10 s, el precalentamiento del sensor): coge una pajita, métela en la boquilla y espera a la señal.
4. **¡Sopla!** Un globo se infla mientras se sopla; una barra de 4 segmentos cuenta los 4 s seguidos que pide el sensor. Si se corta, el sensor vuelve a precalentar (13 s) y se avisa del intento.
5. **Cuenta atrás de 5 s y foto**, con la cámara en directo, mientras el sensor calcula. Al llegar a cero, flash y foto.
6. **Resultado** (20 s): la foto tipo polaroid, el valor contando hacia arriba, el titular según el puesto, «Puesto 120 de 360 · Top 34 %» con una barra del ranking, y fuegos, confeti o burbujas según el puesto (récord, top 10, alto, medio, bajo o cero).
7. **Vuelta a la espera.**

**El monigote** (`nucleo/monigote.js`): la ilustración anterior del avatar de Guillermo (camisa negra remangada y pantalón gris; retirada del repo el 27-10, está en el historial de git), troceada y animada. El avatar nuevo es `animaciones/Avatar GuillermoAladro.jpg`. Acompaña cada fase:
- **Espera:** saluda, señala el lector, saca bíceps, levanta el pulgar y se hace un selfie, con bocadillos: «¡Hola! ¿Te atreves?», «Paga con tarjeta o con el móvil»…
- **Pago:** celebra y levanta el pulgar.
- **Preparando:** estira, calentando.
- **¡Sopla!:** enseña a soplar con los mofletes hinchados.
- **Soplando:** anima con el puño.
- **Soplido cortado:** se encoge de hombros.
- **Cuenta atrás:** se hace un selfie (y guiña). Tras la foto, pulgar arriba.
- **Resultado:** espera pensando y luego reacciona: salta con un récord o un top 10, saca bíceps con un resultado alto, levanta el pulgar o guiña.
- **Avisos:** se encoge de hombros. **Fuera de servicio:** echa una siesta.

Cómo está hecho (`nucleo/monigote_fotos.js`, unos 680 KB de imágenes WebP generadas a partir de la ilustración):
- El torso (camisa y pantalón) es una pieza; lo que tapaban los brazos cruzados se rellenó con camisa. El cuello de la camisa va aparte, por delante del cuello.
- Cada brazo es la manga entera, que gira rígida en el hombro (como una camisa de verdad), con el antebrazo ya doblado en el codo de 10 en 10 grados; el puño remangado tapa la articulación.
- Cada cara (normal, sonrisa, guiño, esfuerzo, grito, meh, soplo, dormido y parpadeo) es la misma ilustración con la boca y los ojos retocados.
- Manos: abierta, puño, pulgar arriba y con el móvil.

Cada imagen se reduce una sola vez al tamaño al que se pinta, y el monigote se compone a 15 cuadros por segundo (a 10 si la Pi va justa); cuesta unos 4 ms por cuadro en la prueba de rendimiento. Si alguna imagen no cargara, el monigote simplemente no sale: nunca rompe la pantalla.

**Fotos y ranking:**
- Todas las pruebas quedan para siempre en el ranking (solo el valor y la fecha).
- Las fotos del top 10 se guardan mientras sigan en el top 10.
- Las demás fotos se borran a las 24 h, también las que salgan del top 10 cuando las desplacen.
- Quien no quiera foto, tapa la cámara durante la cuenta atrás: no se guarda nada y sale una silueta. La pantalla de espera lo explica. Sin botón, es la única forma de que la foto sea opcional (auditoría 1.0, H17–H18).

**Si algo falla después de cobrar:**
- Casos: nadie sopla en 2 minutos, 3 soplidos cortados o el sensor deja de responder.
- La pantalla lo explica y **se devuelve el dinero** por la API de SumUp.
- Un apagón a mitad de prueba no pierde el pago: al volver, la prueba sigue sin cobrar otra vez (apartado 5).

## 2. Cómo está hecho

Un solo lenguaje, JavaScript, **sin ninguna biblioteca externa**. El mismo código corre en la Pi (Node.js + Chromium en modo kiosco) y en la simulación del navegador.

```
nucleo/      el programa: igual en la Pi y en la simulación
  maquina.js        el director: fases, tiempos y errores de cada prueba
  cobro.js          el Solo siempre pidiendo tarjeta, diario de cobros, reembolsos, recuperación tras apagón
  sumup.js          cliente de la Cloud API de SumUp
  sensor_ze29a.js   controlador del ZE29A (reintentos, acuse perdido, lectura doble del resultado)
  protocolo_ze29a.js tramas de 9 bytes, checksum y lector que se resincroniza byte a byte
  almacen.js        ranking, partidas, fotos (24 h / top 10) y diario de cobros, a prueba de apagones
  ranking.js        puesto y top 10 con memoria constante (histograma)
  pantalla.js       todo lo que se ve (lienzo de 1024 × 600, animaciones)
  monigote.js       el monigote presentador: posturas y montaje de las piezas
  monigote_fotos.js las imágenes del monigote (generadas a partir de la ilustración)
  textos.js         todos los textos de la pantalla
  reloj.js, util.js
pi/          solo en la Pi
  principal.js      arranque: monta el hardware real y la máquina
  uart.js           /dev/serial0 a 9600 8N1 (stty)
  camara.js         Camera Module 3 con rpicam-vid (MJPEG)
  servidor.js       página de la pantalla, eventos (SSE), fotos y cámara en directo, solo en 127.0.0.1
  sistema.js        perro guardián, vigilancia de la pantalla, memoria, reinicio diario, salud de la Pi
  fs_node.js        escrituras atómicas con fsync
  prueba_sensor.js  el sensor solo, por la consola (banco)
  kiosco/           la página que abre Chromium
  fuentes/          tipografías (Big Shoulders Display y Archivo, licencia OFL), sin internet
sim/         hardware simulado: ZE29A byte a byte, SumUp y Solo, cámara, tarjeta SD
sistema/     servicios de systemd, instalar.sh y vigía del Wi-Fi del bar
pruebas/     pruebas automáticas (node --test) y de extremo a extremo
```

En la Pi:
- `alcoholimetro.service` arranca `node pi/principal.js`.
- `alcoholimetro-kiosco.service` arranca Chromium a pantalla completa (dentro de `cage`, sin escritorio) apuntando a `http://127.0.0.1:8080`.
- La pantalla recibe lo que tiene que enseñar por eventos (SSE). Las fotos y la cámara en directo le llegan por el mismo servidor local.

## 3. Instalar en la Pi

Requisitos: Raspberry Pi OS Lite (Trixie) recién instalado, con la fase 2 del MONTAJE PASO A PASO hecha (UART en `/dev/serial0`, sin consola serie).

```bash
git clone https://github.com/GuillermoAladro/Alcoholimetro.git
cd Alcoholimetro/programa
bash sistema/instalar.sh
nano ~/.config/alcoholimetro/sumup.json   # api_key, merchant_code, reader_id, app_id, affiliate_key
sudo reboot
```

`instalar.sh` hace lo siguiente:
- Instala `nodejs`, `chromium`, `cage`, `rpicam-apps`, `fake-hwclock` y `firmware-ath9k-htc`.
- Crea `/var/lib/alcoholimetro` (los datos, 0700) y `/etc/alcoholimetro/config.json`.
- Deja la plantilla de SumUp con permisos 600.
- Pone el registro del sistema en RAM y el perro guardián del sistema a 15 s.
- Activa los tres servicios y pasa las pruebas automáticas.

| Para | Comando |
|---|---|
| Ver lo que pasa | `journalctl -u alcoholimetro -f` |
| Estado en JSON (fase, salud, cobros abiertos, temperatura, subtensión…) | `curl -s http://127.0.0.1:8080/estado` |
| Banco sin cobrar | `sudo systemctl stop alcoholimetro && node pi/principal.js --gratis` |
| Probar solo el sensor (fases 6 y 7 del PASO A PASO) | `sudo systemctl stop alcoholimetro && node pi/prueba_sensor.js` (`--estado`, `--vigilar`, `--detalle` para ver las tramas) |

**Tarjeta de solo lectura (recomendado en la ficha de la SanDisk).** Si se activa la capa de solo lectura de `raspi-config`, `/var/lib/alcoholimetro` tiene que ir en una partición aparte que sí se escriba; si no, el ranking y las fotos se perderían en cada reinicio. Hay que hacerlo al preparar la imagen maestra.

## 4. Probar sin hardware

| Qué | Cómo |
|---|---|
| Pruebas automáticas (76) | `node --test pruebas/*.test.js`. Tardan unos 20 s: el reloj es virtual y cada prueba simula minutos de máquina |
| El programa entero en un ordenador | `node pi/principal.js --simular` y abrir `http://127.0.0.1:8080`. Se paga con `curl -X POST 127.0.0.1:8080/sim/tarjeta`, se sopla con `curl -X POST "127.0.0.1:8080/sim/soplar?ms=4500"` y el alcohol se fija con `curl -X POST "127.0.0.1:8080/sim/alcohol?gl=0.6"` |
| De extremo a extremo con Chromium | `node pruebas/e2e/kiosco.js /tmp` (necesita Playwright) |
| Horas de máquina al azar (fuzz) | `node pruebas/fuzz.js <semilla> <horas>`: clientes, PIN lentos, rechazos, red que cae, respuestas perdidas, sensor que se desconecta y cortes de luz. Comprueba que cada pago acaba en una partida o en un reembolso, nunca en las dos ni en ninguna. Pasado con 160 semillas × 24 h |
| En 3D, con botones | Artefacto «Conexiones del alcoholímetro», pestaña **Programa**. Corre este mismo código con el hardware simulado: paga, sopla, tapa la cámara, sube tu foto, provoca averías (sin internet, sensor desconectado, ruido en la UART, tarjeta llena, cámara rota…), corta la luz a mitad de prueba y adelanta el reloj 24 h. El registro enseña las tramas de la UART y las peticiones a SumUp |

**Para cambiar algo y verlo en la simulación:**
1. Edita los archivos de `nucleo/`.
2. En `carcasa/diseno-A/modelo/realista/` ejecuta `python montar.py conexiones Conexiones_3D.html offline`.
3. Lo que funciona en la simulación funciona igual en la Pi, porque el código es el mismo. Solo cambia el hardware: `pi/` frente a `sim/`.

## 5. Para que no falle nunca (sin nadie en el bar)

| Riesgo | Qué hace el programa |
|---|---|
| El programa se cae | systemd lo reinicia en 2 s, siempre (`Restart=always`, sin límite de reintentos) |
| El programa se cuelga (bucle, E/S bloqueada) | Un hilo aparte (perro guardián) lo mata si lleva 30 s sin responder, y systemd lo arranca. Mide con el reloj monotónico: un salto de la hora no lo dispara |
| El programa está vivo pero no avanza (una espera sin fin, la tarjeta SD colgada) | La máquina sabe cuánto puede durar cada fase; si una se pasa (o la salud lleva 5 min sin comprobarse), se reinicia |
| La Pi entera se cuelga | Perro guardián del hardware a 15 s (`RuntimeWatchdogSec`) |
| Chromium se cuelga o se cierra | La página manda un latido cada 10 s; sin latido en 90 s se reinicia Chromium. La página también se recarga sola si pierde el contacto 60 s |
| Fugas de memoria lentas | Límites de systemd (400 MB el programa, 650 MB Chromium), reinicio limpio si el programa pasa de 220 MB en espera, y reinicio diario de los dos a las 05:00 si la máquina está en espera. Todo lo que se guarda en memoria tiene tope (registro, vistas, fotos en caché, partículas) y el ranking ocupa lo mismo con 10 que con un millón de partidas |
| Apagón en cualquier momento | Escrituras atómicas (archivo aparte, fsync, renombrar) y líneas que se añaden con fsync. Una línea cortada se ignora; si `estado.json` no cuadra, se reconstruye desde las partidas |
| Apagón con un pago a medias | Diario de cobros: cada paso se apunta antes de seguir. Al arrancar, un pago sin prueba se convierte en una prueba pendiente si se pagó hace menos de 5 min, como mucho 2 veces (un fallo que se repite en cada arranque no da pruebas infinitas); si no, se reembolsa. Si su partida está guardada, la persona ya vio el resultado: ni prueba ni reembolso. Nunca se cobra dos veces |
| Pago lento (PIN, autorización que tarda) | Un cobro "pendiente" nunca se da por caducado: pasado 1,5 min se cancela en el lector y se sigue vigilando hasta que SumUp lo cierre. Si acaba pagado, la prueba empieza |
| Pago que aparece tarde (la Pi sin red y el Solo con la suya) | Cuenta desde que se abrió el cobro: si es de hace más de 5 min, se reembolsa en vez de dar la prueba al siguiente que pase |
| Red rara (portal cautivo del Wi-Fi, respuestas que se pierden) | Un error de certificado cuenta como "sin conexión" (la petición no salió). Con 5 cobros en duda, no se abren más hasta aclararlos |
| Respuesta de SumUp perdida | Si la petición no llegó a salir (sin red, DNS, certificado), no hay cobro. Si pudo llegar, el cobro queda "incierto": se busca el pago por nuestra referencia hasta saberlo, y solo se da por nulo cuando ya no se puede pagar. La revisión de fondo nunca cancela el cobro de la persona que está delante |
| Reembolso que no sale | Los fallos de red o de SumUp no cuentan como intento (se reintenta a los 5 min); los demás, cada vez más tarde (máx. 1 h), y «no encuentro la transacción» no cuenta el primer día. Un «ya reembolsado» se comprueba. La decisión de reembolsar se apunta antes de hacerlo: tras un apagón a mitad se sigue reembolsando. La revisión funciona aunque la máquina esté fuera de servicio. Lo que no se puede reembolsar sale en `/estado` (`cobros_para_revisar`) |
| La hora salta (NTP, Pi sin reloj) | Las duraciones se miden con el reloj monotónico; lo que lleva la máquina en ese momento no lo toca nadie más |
| Reinicio con un cobro abierto | Antes de salir se espera a que salga el "cancelar" al Solo (máx. 4 s); al arrancar se revisa el diario |
| Sensor desconectado o con ruido | Lector que se resincroniza byte a byte, reintentos, acuse perdido comprobado con el estado, resultado leído dos veces. Una trama que falta nunca se toma por un 0. Si el sensor no responde: fuera de servicio y no se cobra |
| Tarjeta llena o de solo lectura | Fuera de servicio y no se cobra. Con poco espacio se borran antes las fotos fuera del top 10. Se recupera sola |
| Sin internet o SumUp caído | La espera sigue con el ranking y avisa de que no se puede pagar. Reintentos con espera creciente y vuelta automática |
| Cámara rota o colgada | La prueba sigue sin foto (tope de 3 s para la foto) |
| Wi-Fi del bar (AR9271) bloqueado | `vigia-red.sh` recarga el driver si la red no responde 5 min (ficha #12) |
| Pantalla marcada por imagen fija | Nada se queda quieto en la espera y todo se desplaza unos píxeles cada pocos minutos (ficha #5) |
| Pi lenta (3B+) | Partículas en memoria fija, textos y tarjetas en caché, y calidad automática: si un cuadro tarda, se quitan efectos y se baja a 20 cuadros por segundo |

## 6. Configuración (`/etc/alcoholimetro/config.json`)

| Campo | Por defecto | Qué es |
|---|---|---|
| `pago` | `sumup` | `gratis` = sin cobro (banco de pruebas) |
| `precio_centimos` | 200 | Precio de la prueba |
| `unidad` | `g/L` | `g/L` = valor del sensor ÷ 100 (su unidad, mg/100 mL de sangre equivalente). `mg/100mL` = tal cual. `mg/L` = ÷ `factor_mg_l` (220), **sin confirmar por Winsen** (auditoría H01 y 6.1-S F14) |
| `maquina.cuenta_atras_ms` / `resultado_ms` | 5000 / 20000 | Cuenta atrás de la foto y tiempo del resultado |
| `maquina.max_cortes` / `max_esperas_soplido` | 3 / 2 | Soplidos cortados y minutos sin soplar antes de anular y reembolsar |
| `maquina.umbral_pausa` / `pausa_tras_alto_ms` | 150 / 30000 | Tras un resultado de 1,50 g/L o más, 30 s sin cobrar para que el sensor se recupere. **Medir en banco** (ficha del ZE29A, apartado 6) |
| `maquina.fotos` / `detectar_camara_tapada` | true / true | Desactivar fotos, o no hacer caso a la cámara tapada |
| `maquina.posiciones` | lector arriba-derecha, boquilla y cámara arriba-izquierda | Hacia dónde apuntan las flechas de la pantalla (diseño A) |
| `cobro.consulta_ms` | 3000 | Cada cuánto se consulta el cobro (DECISIONES: 3 s, confirmar con SumUp) |
| `cobro.reembolso_automatico` | true | Si es false, el reembolso queda apuntado como manual |
| `cobro.vida_max_ms` | 90000 | Un cobro sin pagar más tiempo que esto se cancela en el lector (y se sigue vigilando) |
| `cobro.credito_max_ms` / `credito_max_veces` | 300000 / 2 | Tras un apagón, prueba pendiente para un pago de hace menos de 5 min, como mucho 2 veces; si no, reembolso (más tarde, quien pagó seguramente ya no está) |
| `camara.enfoque` / `lente` | continuo / 2.0 | O `fijo` con la lente en dioptrías (2.0 = 50 cm) |
| `camara.umbral_lux` / `umbral_bytes` | 3 / 20000 | Cámara tapada: por luz (si rpicam da metadatos) o por tamaño del JPEG. **Ajustar en el bar** |
| `camara.espejo` / `rotacion` | true / 0 | Foto como un espejo; 180 si la cámara va al revés |
| `sistema.reinicio_diario` | `05:00` | Hora del reinicio limpio (vacío para no reiniciar) |
| `almacen.retencion_fotos_h` | 24 | Horas que se guardan las fotos fuera del top 10 |

## 7. Qué se guarda y dónde

Todo está en `/var/lib/alcoholimetro` (0700; archivos 0600):

| Archivo | Contenido |
|---|---|
| `partidas/AAAA-MM.jsonl` | Una línea por prueba: id, fecha, valor bruto del sensor, alarma, foto sí/no, referencia del cobro, soplidos cortados, duración |
| `estado.json` | Ranking (histograma y top 10) y fotos con su fecha |
| `fotos/<id>.jpg` | Las del top 10 y las de las últimas 24 h |
| `cobros.jsonl` | Diario de cobros, compactado solo |

Para empezar de cero: parar el servicio y borrar la carpeta.

## 8. Decisiones tomadas al escribirlo (revísalas)

- **Unidad: g/L.** Pediste «0,2 g/cl», que no es una unidad de alcoholemia; entiendo que querías decir g/L. Es la unidad que da el propio sensor (mg/100 mL ÷ 100), sin conversiones dudosas.
- **Nada de límites para conducir** en la pantalla (auditoría H02). Siempre pone «orientativo, no sirve para saber si puedes conducir» y «Si bebes, no conduzcas».
- **Foto opcional sin botón**: tapando la cámara en la cuenta atrás. El aviso está a la vista en la espera.
  - La foto es un dato personal (H17–H18), y enseñar las caras del top 10 para siempre en un bar puede necesitar consentimiento expreso.
  - Antes de instalar la máquina, pregúntalo a alguien que sepa de protección de datos.
  - Con `"fotos": false` la máquina funciona sin fotos.
- **Reembolso automático** si la prueba no se completa. En cuanto la partida está guardada, la prueba cuenta: si se va la luz justo entre guardarla y enseñarla (unas décimas de segundo), ni se reembolsa ni se repite.
- **Pausa de 30 s tras un resultado muy alto** (recomendación de la ficha del ZE29A). Los valores son provisionales.
- **El ranking ordena por el valor bruto del sensor.** Los empates comparten puesto; en el top 10 manda quien llegó antes.

## 9. Lo que falta comprobar con el hardware real

1. **SumUp:** las rutas y los cuerpos salen de la documentación (ficha #9, apartado 4) y no se han probado. Hay que confirmar:
   - qué devuelve `GET …/checkout/{id}`;
   - la búsqueda por `foreign_transaction_id`;
   - el reembolso, y qué devuelve si ya estaba reembolsado (409);
   - cuánto dura un cobro abierto, y si al caducar sale como `cancelled` o como `failed` (con qué `payment_failure_reason`). Si sale como `failed`, la pantalla no debe enseñar «Pago rechazado» cada minuto;
   - que `terminate` no corta un pago que ya se está procesando (PIN) y que ese cobro acaba en `successful`;
   - que la Affiliate Key es obligatoria (sin ella el programa no cobra: no podría encontrar un pago con la respuesta perdida).

   Prueba P6.14 del PASO A PASO. Si algo no cuadra, se toca solo `nucleo/sumup.js`.
2. **ZE29A:**
   - en qué estado arranca;
   - el byte de alarma;
   - el tiempo de soplido real;
   - si contesta con bytes extra (el programa los acepta y lo apunta).
3. **Cámara:**
   - que `rpicam-vid` acepte `--metadata` (si no, el programa lo detecta y usa el tamaño del JPEG);
   - los umbrales de cámara tapada con la luz del bar;
   - el enfoque a la distancia real.
4. **Chromium en la Pi 3B+:** cuántos ms tarda cada cuadro (sale en `/estado` y cada 10 min en el registro). En un ordenador con la CPU frenada 6 veces, la espera tarda unos 25–45 ms por cuadro. La calidad automática baja efectos y cuadros si hace falta.
5. **`cage` + Chromium en tty1 tras un corte de luz**, y que la pantalla se encienda sola (ficha #5).
6. **Punto de acceso del Solo y Wi-Fi del bar** (W29 y W30): el programa solo necesita salida a internet.
