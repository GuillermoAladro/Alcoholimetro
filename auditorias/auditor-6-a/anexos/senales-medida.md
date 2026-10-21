# Revisión de señales y medida — Auditor 6-A

Nota de trazabilidad: los hashes de las tablas auxiliares describen el checkout Windows y pueden diferir por CRLF/LF. El inventario canónico del paquete (`../inventario_archivos.json`) identifica los objetos Git del commit auditado. Las referencias de líneas corresponden a esa base. Las extracciones temporales no se distribuyen; los documentos originales siguen en el repositorio.

Fecha: 21-10-2026. Revisión base: `84be97669a9efec43e79b3dadc4af5e87458c41a`.

## Dictamen de esta partición

El pinout nominal Pi–ZE29A es compatible y está cruzado correctamente. El diagrama describe una topología realizable, pero no demuestra que el sistema completo funcione. No hay Raspberry Pi ni sensor conectados al ordenador de auditoría y no se ejecutó una aplicación real del alcoholímetro. Sí se ejecutaron pruebas offline del ejemplo UART y se encontraron fallos reproducibles. La vía neumática y la referencia real del conector siguen sin cerrar.

## Conexiones nominales contrastadas

| Conexión | Resultado | Evidencia primaria local |
|---|---|---|
| W18: WAGO +5V → ZE29A J1.1; retorno → J1.2 | Correcto si se confirma orientación física del conector | `winsen-ze29a/datasheets/ze29a-c2h5oh.pdf`, páginas PDF 3–4: 4,7–5,3 V, <500 mA, pin 1 Vin y 2 GND |
| W19: Pi J8.8 GPIO14 TX → ZE29A J1.4 RX | Correcto nominalmente, TTL 3,3 V | Esquema reducido Pi, hoja única, J8; manual ZE29A p.4 |
| W20: ZE29A J1.3 TX → Pi J8.10 GPIO15 RX | Correcto nominalmente | Ídem |
| Retorno de señal | Existe por los retornos de alimentación compartidos en WAGO; no falta eléctricamente un GND por el mero hecho de no ir en el mismo cable UART | MONTAJE W12/W13/W18 |
| W21/W22: contacto seco → Pi J8.11 GPIO17 y J8.9 GND | Correcto con entrada y pull-up; LED aislado | Esquema Pi J8; el botón concreto no tiene curva de microcarga conocida |
| W24: CSI CAMERA → Camera Module 3 J1 | Compatible: 15 vías, 1 mm, dos carriles CSI, 3V3 en pin 15 | Esquema Pi J3 y esquema cámara PDF p.2; BOM cámara fila 9: Amphenol SFW15R-1STE1LF |

Las referencias abreviadas de la tabla están bajo `componentes/`. Las dos hojas de esquema y el dibujo oficial del cable de 200 mm se inspeccionaron visualmente, además del texto extraído.

## Hallazgos y correcciones

### S1 — Alta: el ejemplo UART pierde tramas válidas

`componentes/winsen-ze29a/README.md:248–263`. `read_frame` busca un FF y consume ocho bytes; si la suma es incorrecta, pierde cualquier FF válido contenido en esos ocho. También descarta los bytes recibidos cuando `read(8)` devuelve menos de ocho al vencer el timeout. `ask` termina ante la primera trama válida aunque pertenezca a otro comando. Se reproduce con `FF FF 85 31 00 00 00 00 00 4A`, con lectura parcial y con una respuesta 0x88 antes de la respuesta esperada 0x85.

Corrección de referencia incluida en `../pruebas_uart.py`: buffer incremental, búsqueda de FF, ventana de nueve bytes, eliminación de solo un byte tras checksum inválido, retención de fragmentos y filtrado por comando hasta plazo límite. No es firmware de producción: faltan integración, recuperación del transporte y ensayos con módulo real.

`read(8)` de pyserial normalmente acumula todos los bytes antes de devolverlos. El ensayo de fragmentos representa una respuesta cortada por timeout, no cada fragmentación normal de un paquete USB.

### S2 — Alta: el ejemplo no implementa el ciclo completo ni controla ausencia de respuesta

`componentes/winsen-ze29a/README.md:268–275`. La espera hasta 0x37 es solo un comentario; al ejecutar el bloque, se consulta 0x86 inmediatamente. El manual solo permite leer resultado en estado 0x37 (PDF p.6). Además se indexa `f[2]` sin comprobar `None`: ausencia de respuesta causa `TypeError`, reproducido offline.

Corrección: consultar estado al iniciar, sin asumir estado de encendido; pasar a calentamiento únicamente desde 0x31 o desde 0x37; comprobar ACK de 0x87; seguir estados con plazos; 0x35 exige espera y nuevo calentamiento, no un resultado cero; leer resultado únicamente al llegar a 0x37 y antes de que expire la ventana de 20 s; validar comando, longitud y checksum; ante desconexión/no respuesta devolver fallo explícito y no mostrar 0. Guardar resultado asociado a la prueba actual y borrar resultados previos al iniciar otra.

El repositorio contiene documentación y ejemplos, no una aplicación desplegable con estas garantías. La lista de cables no sustituye esa implementación.

### S3 — Alta: la interfaz neumática está incompleta en el montaje base

`MONTAJE-GENERAL.md:94` solo conecta boquilla a toma del ZE29A, dejando barrera pendiente. El manual ZE29A p.10 exige barrera que genere presión y toma de presión antes de la toma de alcohol, en sentido de soplido. La fila del diseño A (`MONTAJE-GENERAL.md:245`) introduce T presión → reductor → T alcohol → escape, coherente en orden, pero no aporta diámetros de tomas, geometría del reductor, estanqueidad, caudal ni validación de muestreo.

Corrección: definir dibujo neumático con ambos puertos identificados y dimensiones, escape libre, protección contra entrada de líquido y recorrido de muestra corto. Validar presión/caudal en la geometría final y confirmar transiciones 0x33→0x34→0x36→0x37. 10 L/min durante 4 s corresponden a unos 0,667 L; ello es cálculo del requisito del módulo, no prueba de exactitud metrológica. No inferir que un tubo de «6 mm» es 6 mm interiores. Una simulación solo de cables no verifica esta condición funcional esencial.

### S4 — Media/alta: conector real y arnés no definidos completamente

`MONTAJE-GENERAL.md:79,85–88,190–191`; fichas JST-XH y Dupont. El manual del ZE29A define cuatro señales pero no fabricante, paso ni referencia del conector. Un XH genuino usa 2,50 mm; el anuncio transcrito dice 2,54 mm. No se debe asignar color→función sin continuidad. El kit Dupont preterminado tampoco define la unión al cable JST ni al Faston del botón. Una crimpadora de punteras no cubre automáticamente contactos abiertos.

Corrección: BOM del arnés con referencia de carcasa/contacto/cable/herramienta, plano de cavidades visto desde una cara inequívoca, verificación pin a pin y alivio de tracción. Usar alojamiento o adaptador GPIO fijado mecánicamente y orientado inequívocamente; impedir desplazamiento hacia pines 2/4 de 5 V. No afirmar que el kit comprado hereda valores de los catálogos Amphenol/Harwin/JST usados como referencia.

### S5 — Media: UART de la Pi no queda configurada por el cableado

La ficha ZE29A menciona `dtoverlay=disable-bt`, pero MONTAJE no contiene una configuración de arranque reproducible. La documentación oficial actual confirma PL011 con `disable-bt`, desactivar `hciuart` y consola serie; `/dev/serial0` debe resolver a la UART esperada. Configurar hardware serie activo, consola serie desactivada, `enable_uart=1` y `dtoverlay=disable-bt` en la configuración pertinente de la imagen; comprobar después del reinicio el enlace y ausencia de consola/getty competidora. Verificar 9600, 8N1, sin control de flujo. Mantener versión exacta de imagen, kernel, firmware y dependencias en el expediente.

Fuente primaria online verificada el 21-10-2026: https://www.raspberrypi.com/documentation/computers/configuration.html#configuring-uarts . La necesidad de desactivar servicio Bluetooth y consola está explícita, no inferida de foros.

### S6 — Media: el resumen de cargas excluye erróneamente la cámara

`MONTAJE-GENERAL.md:40`: «La Pi no alimenta nada». El esquema reducido Pi J3.15 entrega 3V3 y el esquema de Camera Module 3 J1.15 alimenta sus reguladores. La Pi sí alimenta cámara por CSI y AR9271 por USB. Incluir ambos en la carga de rama Pi; evitar añadir alimentación separada a la cámara. El valor de 250 mA usado por una ficha para un cálculo de FFC está marcado sin fuente y no debe convertirse en consumo garantizado.

### S7 — Media: secuencias de alimentación y fallos de retorno no caracterizados

W13 y W18 son ramas independientes; UART conecta sus GPIO. Desconectar solo una rama, o fundir su protección, puede dejar señales activas hacia equipo apagado. No se encontró especificación Ioff/power-off tolerance del ZE29A que permita aprobarlo. No se afirma que el daño sea inevitable, sino que la tolerancia no está demostrada.

Corrección: para montaje y mantenimiento desenergizar conjuntamente Pi y ZE29A antes de manipular UART. Si el requisito es soportar apertura de una rama con la otra activa, diseñar y validar buffer con protección de apagado parcial y control de habilitación, o aislamiento. No considerar una resistencia serie una garantía universal. Verificar retorno y diferencia de GND durante el pulso de muestreo. No añadir un GND fino «redundante» como solución automática: podría convertirse en retorno de potencia ante fallo del GND de alimentación.

### S8 — Media: cable CSI correcto nominalmente; 50 cm sin garantía de señal

Se verifican en esquemas los pines 1/4/7/10 GND, 2/3 D0, 5/6 D1, 8/9 reloj, 13 SCL, 14 SDA y 15 3V3. Camera J1.11 ENABLE y .12 sin uso en el esquema de referencia. El cable de 200 mm oficial define 15 vías y 1 mm; sus vistas muestran contactos en extremos opuestos de las caras. Mantener orientación documentada y continuidad extremo a extremo; conectar con todas las alimentaciones retiradas.

El cable genérico de 50 cm no tiene modelo de integridad de señal ni garantía de margen en este conjunto. La venta de un cable Standard–Mini de 500 mm para otra Pi no certifica este. Preferir el de 200 mm si la geometría final lo permite; si no, verificar capturas repetidas en ruta definitiva con Wi-Fi y pantalla activos, ausencia de errores CSI, enfoque e imagen tras reinicios. Ensayo físico pendiente.

Corrección documental adicional: una torsión mecánica de una cinta no cambia por sí sola qué conductor está unido a cuál. Evitar afirmar que toda media vuelta implica inversión eléctrica. Lo que manda es la numeración efectiva de contactos al acoplar y la continuidad 1→1; el texto de la ficha FFC §5.4 puede inducir a error.

### S9 — Media: condiciones ambientales y unidades no cerradas

ZE29A declara 10–40 °C en p.3. Su temperatura local debe medirse; `vcgencmd measure_temp` mide SoC y no sustituye la temperatura junto al módulo. La cámara/Pi tienen 0–50 °C de ambiente en sus product briefs. Los PDFs de sensores ME2, Dart o SPEC no acreditan límites del ZE29A ni material concreto del tubo comprado.

El manual devuelve entero en mg/100 mL; no publica un factor de conversión a mg/L de aire. Los divisores 200 y 220 son hipótesis del repositorio, no ensayos. Aun con UART correcta, no aprobar exactitud ni mostrar una unidad derivada como verificada sin confirmación del fabricante y contraste con patrón trazable. Este punto es metrológico, separado del dictamen eléctrico.

### S10 — Media: botón y apagado requieren verificación de sistema

Si se mantiene el diseño con botón: entrada GPIO17 con pull-up y contacto seco es correcta; añadir debounce y una sola acción por pulsación. La resistencia interna 50–65 kΩ implica 51–66 µA, que no demuestra fiabilidad de contacto del modelo genérico con el tiempo. Evaluar filtro/protección de entrada y contacto apto para microcarga si las pruebas lo exigen. Si manda diseño A, eliminar W21/W22 y verificar detección por cámara; son variantes distintas.

La microSD de alta resistencia no acredita tolerancia a corte de alimentación. Montaje solo dibuja corte de red; no hay política implementada de apagado/recuperación. Preparar raíz de solo lectura o política de escrituras controlada, registro persistente de lo imprescindible y prueba de reinicio tras corte en estados definidos. Los resultados de una prueba no deben reaparecer como actuales al reiniciar.

## Pruebas reproducibles ya ejecutadas

Comando, desde la raíz del chat:

```text
python auditorias/auditor-6-a/pruebas_uart.py --repo . --output resultados-uart-local.json
```

Solo biblioteca estándar. Lee el ejemplo de la revisión auditada, extrae sus funciones por AST y usa un puerto falso; no cambia el repositorio ni abre un puerto físico.

| Ensayo | Ejemplo original | Parser de referencia |
|---|---|---|
| 18 checksums de las tablas del manual | 18 correctos | Misma regla validada |
| Petición warmup 0x87→0x32 | `FF 01 87 32 00 00 00 00 46` | Coincide |
| Respuesta válida | Pasa | Pasa |
| Basura inicial sin FF | Pasa | Pasa |
| FF espurio antes de respuesta | Falla | Pasa |
| Read parcial antes de timeout | Falla | Pasa |
| Checksum alterado | Rechaza correctamente | Rechaza correctamente |
| Trama truncada | Rechaza correctamente | Rechaza correctamente |
| Trama corrupta seguida de buena | Pasa | Pasa |
| Respuesta de otro comando seguida de esperada | Falla | Pasa |
| Acceso a resultado tras ausencia de respuesta | `TypeError` | Requiere control de aplicación |

Ocho escenarios de recepción: ejemplo 5/8; parser de referencia 8/8. Esto demuestra los casos del modelo, no inmunidad física a ruido, comunicación con el ZE29A real, ni correcto funcionamiento del instrumento completo. Una trama de 9 bytes a 9600 8N1 ocupa 9,375 ms; consulta+respuesta al menos 18,75 ms sin latencia de proceso.

## Ensayos de aceptación pendientes de hardware

1. Verificar arnés desenergizado: polaridad, continuidad, ausencia de cortos, posición GPIO, conector y FFC.
2. Medir alimentación ZE29A en J1 y niveles UART antes de unir equipos; tensiones nominales dentro de especificaciones con todas las cargas.
3. Verificar imagen, PL011, UART libre de consola, consulta 0x85, ACK y checksum; registrar UART con analizador lógico.
4. Ciclo válido, soplido interrumpido, falta de soplido, ausencia de sensor, pérdida de UART y reinicio en cada estado. Ninguno debe mostrar cero por falta de datos.
5. Medir caudal/estanqueidad/presión en vía final y obtener una muestra válida con barrera y tomas identificadas.
6. Cámara en ruta final, capturas sostenidas y reinicios; prueba con tráfico Wi-Fi y resto de cargas concurrentes.
7. Temperatura local, condensación, retorno tras muestra alta y comprobación con patrón de referencia. No confundir prueba eléctrica satisfactoria con calibración.

## Cobertura documental honesta

Se han abierto y extraído los 59 archivos asignados, incluidas 594 páginas PDF, el XLSX completo (una hoja, 19 líneas de BOM), el ZIP STEP completo y el DXF. La extracción íntegra no equivale a una lectura semántica línea por línea de 60 MB de entidades STEP o de 205 páginas de registros BCM2835. Se revisaron a fondo el montaje, pinouts, alimentación/señales, protocolo, esquemas y restricciones pertinentes; los manuales de referencia extensos, certificaciones y catálogos ajenos se inspeccionaron por estructura y secciones aplicables. No se validaron todos sus enunciados ni se resolvió un modelo 3D ensamblado. Debe preservarse esta distinción al responder a «absolutamente todos».

`../inventario_archivos.json` registra cada ruta, SHA-256, tamaño y páginas; las extracciones de trabajo no se distribuyen. FCC escaneado (3 páginas) y plano Pi escaneado se revisaron visualmente; páginas con extracción casi vacía de PCN y OIML son cubiertas/blancos o requieren inspección fuera de los datos eléctricos usados. El STEP no se convirtió en ensamblaje CAD ni se verificaron interferencias. El DXF no sustituye el esquema eléctrico. Ningún archivo ilegible impidió revisar pinout o protocolo.

Las URLs primarias verificadas además de copias locales fueron el manual Winsen, configuración UART oficial y documentación oficial de software de cámara. Los manuales suministrados se conservan como evidencia de la revisión base. No se enviaron correos, no se compraron piezas y no se usó TinyFish.

### Inventario de los 59 archivos

| Ruta | Páginas PDF | Lectura/extracción |
|---|---:|---|
| componentes/raspberry-pi-3b-plus/datasheets/descargar.sh | - | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-3b-plus/datasheets/RP-000092-CF-1-CB_certificate.pdf | 2 | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-3b-plus/datasheets/RP-000116-CF-1-FCC.pdf | 3 | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-3b-plus/datasheets/RP-001265-CF-3-rpi-3bplus_EU_Declaration_of_Conformity_DoC.pdf | 2 | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-3b-plus/datasheets/RP-003337-PC-1-Pi3B__Revision_9_PCN.pdf | 7 | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-3b-plus/datasheets/RP-008156-DS-6-picamera2-manual.pdf | 86 | Abierto; extracción completa con revisión técnica selectiva |
| componentes/raspberry-pi-3b-plus/datasheets/RP-008160-DS-1-raspberry-pi-3-b-plus-case-mechanical-drawing.pdf | 1 | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-3b-plus/datasheets/RP-008336-DS-1-raspberry-pi-3-b-plus-mechanical-drawing.dxf | - | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-3b-plus/datasheets/RP-008337-DS-2-raspberry-pi-3-b-plus-mechanical-drawing.pdf | 1 | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-3b-plus/datasheets/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf | 6 | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-3b-plus/datasheets/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf | 1 | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-3b-plus/enlaces.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-3b-plus/README.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-camera-module-3/datasheets/RP-008151-DS-1-camera-module-3-product-brief.pdf | 7 | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-camera-module-3/datasheets/RP-008153-DS-1-camera-module-3-standard-mechanical-drawing.pdf | 1 | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-camera-module-3/datasheets/RP-008154-DS-1-camera-module-3-step.zip | - | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-camera-module-3/datasheets/RP-008969-SD-3-Raspberry_Pi_Camera_Module_3_Reference_Schematic.pdf | 2 | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-camera-module-3/datasheets/RP-008970-BM-2-RASPBERRY_PI_CAMERA_MODULE_3_Reference_Design_BOM.xlsx | - | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-camera-module-3/datasheets/RP-009691-PC-1-PCN_42__IMX708_Preprogrammed_OTP.pdf | 6 | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-camera-module-3/datasheets/RP-009692-PC-1-PCN_43__Camera_Module_3_Internal_EEPROM_removal.pdf | 6 | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-camera-module-3/enlaces.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/raspberry-pi-camera-module-3/README.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/winsen-ze29a/datasheets/16mm_breath_alcohol_sensor_product_datasheet.pdf | 7 | Abierto; contenido extraído / inspeccionado |
| componentes/winsen-ze29a/datasheets/A42985-42990.pdf | 6 | Abierto; contenido extraído / inspeccionado |
| componentes/winsen-ze29a/datasheets/me2-c2h5oh-f16.pdf | 4 | Abierto; contenido extraído / inspeccionado |
| componentes/winsen-ze29a/datasheets/me2-co-0-1000ppm-manual-ver1_3.pdf | 5 | Abierto; contenido extraído / inspeccionado |
| componentes/winsen-ze29a/datasheets/r126-e12.pdf | 69 | Abierto; extracción completa con revisión técnica selectiva |
| componentes/winsen-ze29a/datasheets/ze29a-c2h5oh.pdf | 10 | Abierto; contenido extraído / inspeccionado |
| componentes/winsen-ze29a/enlaces.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/winsen-ze29a/README.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/cables-jst-xh-4-pin/enlaces.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/cables-jst-xh-4-pin/README.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/cables-dupont-elegoo-120/datasheets/bwb_dubox_wtb.pdf | 3 | Abierto; contenido extraído / inspeccionado |
| componentes/cables-dupont-elegoo-120/datasheets/fci-basics-handtool-dubox-ctw.pdf | 3 | Abierto; contenido extraído / inspeccionado |
| componentes/cables-dupont-elegoo-120/enlaces.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/cables-dupont-elegoo-120/README.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/pulsador-arcade-30mm/datasheets/1564503.pdf | 32 | Abierto; extracción completa con revisión técnica selectiva |
| componentes/pulsador-arcade-30mm/datasheets/RP-008249-DS-1-bcm2835-peripherals.pdf | 205 | Abierto; extracción completa con revisión técnica selectiva |
| componentes/pulsador-arcade-30mm/datasheets/schurter_shris05004-1-1758128.pdf | 22 | Abierto; extracción completa con revisión técnica selectiva |
| componentes/pulsador-arcade-30mm/datasheets/sszt871.pdf | 3 | Abierto; contenido extraído / inspeccionado |
| componentes/pulsador-arcade-30mm/enlaces.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/pulsador-arcade-30mm/README.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/cable-ffc-camara-50cm/datasheets/0900766b816ade50.pdf | 8 | Abierto; contenido extraído / inspeccionado |
| componentes/cable-ffc-camara-50cm/datasheets/4000125.pdf | 2 | Abierto; contenido extraído / inspeccionado |
| componentes/cable-ffc-camara-50cm/datasheets/687733100002.pdf | 6 | Abierto; contenido extraído / inspeccionado |
| componentes/cable-ffc-camara-50cm/datasheets/RP-008146-DS-1-standard-camera-cable-200mm-reference-drawing.pdf | 1 | Abierto; contenido extraído / inspeccionado |
| componentes/cable-ffc-camara-50cm/enlaces.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/cable-ffc-camara-50cm/README.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/tubo-silicona-6mm/datasheets/dot_1733_DS1.pdf | 10 | Abierto; contenido extraído / inspeccionado |
| componentes/tubo-silicona-6mm/datasheets/r126-1-e21.pdf | 48 | Abierto; extracción completa con revisión técnica selectiva |
| componentes/tubo-silicona-6mm/datasheets/SPEC-AN-111-Integration-Guidelines.pdf | 5 | Abierto; contenido extraído / inspeccionado |
| componentes/tubo-silicona-6mm/datasheets/Wacker_ELASTOSIL-M-4630-A_ComplianceSheet_0925.pdf | 5 | Abierto; contenido extraído / inspeccionado |
| componentes/tubo-silicona-6mm/datasheets/XV-Silicones.pdf | 5 | Abierto; contenido extraído / inspeccionado |
| componentes/tubo-silicona-6mm/enlaces.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/tubo-silicona-6mm/README.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/sandisk-high-endurance-32gb/datasheets/data-sheet-high-endurance-uhs-i-microsd.pdf | 2 | Abierto; contenido extraído / inspeccionado |
| componentes/sandisk-high-endurance-32gb/datasheets/microsd-high-endurance-set-up-sheet-europa-2019.pdf | 2 | Abierto; contenido extraído / inspeccionado |
| componentes/sandisk-high-endurance-32gb/enlaces.md | - | Abierto; contenido extraído / inspeccionado |
| componentes/sandisk-high-endurance-32gb/README.md | - | Abierto; contenido extraído / inspeccionado |
