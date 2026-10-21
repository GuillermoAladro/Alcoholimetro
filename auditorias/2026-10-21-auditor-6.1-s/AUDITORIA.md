# Auditoría eléctrica del alcoholímetro

**Auditor 6.1-S · 21 de octubre de 2026 · Revisión 1**

Repositorio: [GuillermoAladro/Alcoholimetro](https://github.com/GuillermoAladro/Alcoholimetro). Base examinada: `84be97669a9efec43e79b3dadc4af5e87458c41a`. Fecha según Europe/Berlin. Encargo: reconstruir el montaje descrito, comprobar su viabilidad antes de revisar unidades físicas, detectar problemas y proponer soluciones.

**DICTAMEN: NO LIBERADO PARA ENERGIZACIÓN NI FUNCIONAMIENTO DESATENDIDO.** La arquitectura es viable en principio. El circuito documentado contiene un error peligroso de bornes y varias condiciones sin definir que impiden afirmar que funcionará. El resultado favorable de los cálculos de una propuesta condicionada no constituye aprobación del circuito real.

Documento descargable: [informe PDF](AUDITORIA-Auditor-6.1-S.pdf). Evidencias: [modelo y W1-W29](modelo_circuito.json), [resultados DC](resultados_circuito.json), [resultados AC](resultados_ac.json), [resultados UART](resultados_uart.json), [inventario de 234 archivos](inventario_archivos.csv) y [detalle de ZIP y páginas](inventario_detallado.json).

## 1. Respuesta a la pregunta principal

**Hoy no puede darse por probado que el sistema funciona.** Sí se ha reconstruido virtualmente el montaje del documento y se han ejecutado comprobaciones de conexiones seleccionadas, cálculo DC, casos de fallo e integridad del protocolo. No se ha construido físicamente, no hay instrumentos conectados al equipo y no se ha ejecutado una simulación SPICE de componentes reales.

El error más grave está en la ficha de la LRS-50-5: invertía las asignaciones de entrada de red y salida DC. El documento de montaje usaba la numeración correcta. Seguir la ficha equivocada podía llevar 230 V a la salida. Se ha corregido esa errata y sus repeticiones, con la evidencia del dibujo del fabricante. La corrección documental no verifica una unidad recibida.

Los bloqueos principales restantes son: módulo C14 de topología desconocida; protección DC sin coordinación; margen de tensión y rizado no demostrado; carga USB del Solo sin referencia compatible validada; construcción de PE y separación AC/DC incompletas; comportamiento con ramas parcialmente apagadas; y ausencia de un único diseño de montaje vigente con materiales completos.

La prueba digital ha dado los resultados esperados: **14 comprobaciones DC/documentales**, que incluyen **32 combinaciones extremas de tensión/carga y 10 fallos deliberados**; **20 casos AC con 48 aserciones**; y **14 métodos de prueba UART con las 18 tramas de ejemplo del manual**. Algunos PASS significan que se detectó correctamente un defecto. Ninguno significa «hardware aprobado».

## 2. Alcance y fiabilidad de la revisión

Se ha obtenido el árbol completo de la rama `main` en el commit indicado, sin ejecutar el script de descarga del repositorio. No hay submódulos en ese árbol ni firmware de aplicación construible: predominan fichas, documentos y figuras. Los nombres de carpetas futuras del README no equivalen a esquemas CAD ni código existente.

Se inventariaron y calcularon SHA-256 de **todos los 234 archivos versionados**: 69 Markdown, 150 PDF, 4 ZIP, 4 SVG, 4 PNG, 1 DXF, 1 XLSX y 1 script shell. Los PDF directos tienen 1.541 páginas. Los tres ZIP USB contienen 54 PDF y 2.212 páginas adicionales. El cuarto ZIP contiene dos modelos STEP de cámara y dos archivos auxiliares de macOS. Total de PDF procesado: **204 documentos y 3.753 páginas**, incluyendo duplicados y versiones de comparación.

**Límite de lectura explícito:** extracción e inventario completos no equivalen a lectura técnica línea por línea ni inspección visual de las 3.753 páginas. Se revisaron las fichas y las secciones aplicables; los grandes catálogos, manuales de programación y capítulos USB ajenos al montaje tuvieron revisión dirigida. Se inspeccionaron visualmente las cuatro figuras del montaje y páginas críticas de esquemas, pinout, curvas y dimensiones. Hay páginas escaneadas, dibujos y fuentes PDF que no admiten una extracción textual fiel. Los CAD se inspeccionaron como fuentes/documentos, sin comprobar un ensamblaje mecánico completo. No se afirma haber abierto todos los enlaces externos listados. Este informe no acredita la lectura semántica exhaustiva de cada página solicitada.

Se distinguen tres clases de afirmación: **verificada documentalmente**, cuando la referencia concreta la respalda; **calculada bajo hipótesis**, cuando depende de longitudes, corrientes o resistencias declaradas; y **pendiente de banco**, cuando requiere una unidad, instrumento o ensayo. Los certificados de productos comparativos no se trasladan al ASIN comprado.

## 3. Documento de montaje y diseño de referencia

El documento buscado es [MONTAJE-GENERAL.md](../../MONTAJE-GENERAL.md). Contiene W1-W29, los cuatro dibujos y un apartado 6.3 con diferencias respecto al «diseño A». El propio texto declara que nada está montado ni medido.

Esta auditoría reconstruye el cableado que sí está completo en Git: el diseño de 19-20 de octubre presentado en MONTAJE. El «diseño A» se analiza como variante resumida, sin dar por disponibles `diseno-cajon-A.md`, `decisiones-diseno.md`, `cajon/specs.py`, `Lista_de_piezas.xlsx` ni la guía v2 externa: **esos originales no están en este árbol**. No se inventan sus cotas ni se decide en nombre del autor cuál de las dos carcasas es la definitiva.

En particular, el diseño A elimina el pulsador, pone el Solo en un AP de la Pi con salida por AR9271, cambia la cámara a cinta corta y añade fusibles 3/3/3/2 A. Usar la Wi-Fi interna para ese AP sería una solución de implementación inferida: el resumen no identifica la interfaz expresamente. En esa solución no se puede mantener la figura que desactiva la Wi-Fi interna. Añadir valores nominales de fusible tampoco demuestra protección.

## 4. Montaje virtual reconstruido

### 4.1 Mapa de bornes que debe gobernar el cableado

| LRS-50-5 | Función correcta | Conexión de la guía |
|---|---|---|
| 1 | AC/L | W4, salida de un contacto del corte de red |
| 2 | AC/N | W5, otro conductor de red |
| 3 | FG / tierra de protección | W7 a distribución de PE |
| 4 | DC -V | W12 a distribución GND |
| 5 | DC +V | W11 a distribución positiva |

Fuente: `MEAN_WELL_LRS-50_DATA_SHEET.pdf`, edición 2025-04-07, **página 4**, dibujo inspeccionado visualmente. La ficha local y la lista de adyacencias tenían errores; no son variantes alternativas del fabricante. Comprobar el modelo y los rótulos de la unidad real antes de cablear. PE y GND no son nombres intercambiables.

### 4.2 Lista completa de interconexiones

| Cables | Reconstrucción | Resultado documental |
|---|---|---|
| W1 | Pared Schuko a C13/C14 | Correcto como principio; Schuko reversible |
| W2-W5 | Portafusibles/corte de red a LRS 1 y 2 | Bloqueado: patillas internas del módulo desconocidas |
| W6-W10 | C14 PE a distribución; cuerpo, FG, frontal, caja interior y cajón | Correcto como topología; unión mecánica y ensayo pendientes |
| W11-W12 | LRS 5 y 4 a dos WAGO independientes | Correcto como reparto; protección y resistencias pendientes |
| W13 | WAGO polo 2 a micro-USB Pi, VBUS 1 y GND 5 | Polaridad por continuidad, no por color; conservar F1 de Pi |
| W14-W15 | WAGO polo 3 a breakout USB-A, cable A-C y Solo | Carga compatible y rating sin demostrar |
| W16-W17 | WAGO polo 4 a USB-A y Power IN de pantalla | Consumo/rango reales y capacidad del puerto pendientes |
| W18 | WAGO polo 5 a ZE29A 1 Vin y 2 GND | Pinout correcto; conector físico/colores pendientes |
| W19 | Pi pin físico 8, GPIO14 TX, a ZE29A 4 RX | Correcto, UART de 3,3 V |
| W20 | ZE29A 3 TX a Pi pin físico 10, GPIO15 RX | Correcto, con análisis de apagado parcial pendiente |
| W21-W22 | Contactos secos del pulsador a Pi 11/GPIO17 y 9/GND | Correcto con pull-up; LED desconectado; ausente en diseño A |
| W23 | HDMI Pi a HDMI pantalla | Correcto; también hay masas y H5V, no solo datos |
| W24 | CSI Pi a J1 Camera Module 3, FFC 15 vías de 1 mm | Correcto si orientación y cable reales coinciden; lleva alimentación |
| W25 | USB de Pi a AR9271 | Correcto; consumo dentro de la rama Pi |
| W26 | AR9271 a antena exterior por RP-SMA | Conectores a confirmar; posible unión de GND a PE por blindaje |
| W27 | microSD a Pi | Correcto; no se ha arrancado una imagen de sistema |
| W28 | Boquilla y conducto a presión/muestreo del ZE29A | No basta un tubo: faltan barrera y geometría de soplido |
| W29 | Pi y Solo por Internet/Cloud API | No es cable eléctrico; sin pruebas de cobro ni cuenta/API en este ensayo |

Los cinco alojamientos de una WAGO 221-415 están unidos entre sí: una pieza completa para positivo y otra para GND. Nunca se ponen ambos potenciales en la misma WAGO. El sensor comparte referencia lógica por su retorno de alimentación. La cámara y el adaptador Wi-Fi **sí son alimentados por la Pi**; la frase «la Pi no alimenta nada» es incorrecta.

## 5. Hallazgos y soluciones

La prioridad **bloqueante** impide liberar el montaje actual. **Alta** exige resolución antes de servicio; **media** requiere documentación o mejora antes de cerrar la versión. «Pendiente» significa ausencia de prueba suficiente, no afirmación de que la pieza esté averiada.

### F01. Bornes AC/DC mal asignados en varias fichas - bloqueante, corregido documentalmente

En el commit base, `componentes/meanwell-lrs-50-5/README.md` líneas 74, 113 y 191 asigna o repite el orden incorrecto -V,+V,FG,L,N. La ficha de cable de 0,75 mm² y `pendientes.md` heredan adyacencias falsas. MONTAJE sí es correcto. Aplicar la tabla equivocada puede destruir equipos y crear peligro de red.

**Solución aplicada:** unificar las asignaciones a 1 L, 2 N, 3 FG, 4 -V, 5 +V en la ficha y sus repeticiones, señalando la corrección de auditoría. Se conserva el commit base para reproducir la evidencia. Esto no sustituye cotejar la serigrafía real.

### F02. Módulo C14 sin esquema y protocolo de identificación incompleto - bloqueante

MONTAJE §2A y §4 no define patillas del módulo comprado y presupone que un DPST iluminado necesitaría otros terminales para la luz. Un DPST de **cuatro terminales** puede tener lámpara interna entre las salidas; el catálogo oficial Bulgin serie 8553 lo muestra. Un neón puede aparentar circuito abierto con un multímetro. Cuatro terminales y lámpara no permiten deducir SPST ni identificar conexiones de red por descarte.

**Solución:** exigir referencia exacta, esquema de fabricante, tensión de lámpara y matriz de continuidad OFF/ON de terminales numerados. Si no se obtiene ese conjunto coherente, sustituir por un módulo de corte bipolar documentado, con cubiertas y accesorios completos. No conectar una supuesta lámpara a neutro por ensayo. La familia Schurter KM/KD ofrece ejemplos documentados; el sufijo y sus accesorios deben elegirse antes de comprar, no se aprueba toda la familia por nombre.

### F03. OFF y fusible abierto no son aislamiento de mantenimiento - alta

Schuko permite intercambiar L y N. El modelo demuestra que un SPST puede cortar N y dejar fase en el primario estando OFF. Incluso con dos fusibles independientes, la apertura de uno no abre simultáneamente el otro. Un DPST ideal en OFF corta ambos caminos hacia la fuente, pero la zona anterior al interruptor permanece conectada.

**Solución:** corte bipolar documentado para la propuesta, PE permanente, desconexión del cordón y comprobación de ausencia de tensión para intervenir. No se cierra este hallazgo «aceptando el riesgo» del SPST. La necesidad normativa concreta de uno o dos fusibles se resuelve al elegir la norma de producto; no se impone aquí una regla universal de doble fusible.

### F04. Protección de troncal y ramas no coordinada - bloqueante

El diseño principal usa 0,75 mm² sin protección por rama. La LRS declara sobrecarga 110-150 % de 50 W en hiccup; dividir 55-75 W por 5,20 V da 10,58-14,42 A de referencia, **no una corriente constante garantizada durante un corto**. Puede existir un defecto parcial dañino por debajo del umbral de la fuente. F1 de la Pi no protege todo el cable anterior a la placa.

El diseño A añade fusibles de 3/3/3/2 A sin referencia, curva, energía de apertura ni valor DC. Un fusible de 3 A no limita instantáneamente a 3 A. La fuente en hiccup puede impedir una fusión rápida; el troncal anterior a las ramas continúa necesitando protección.

**Solución:** distribución protegida junto a la fuente, protección del troncal y una por positivo antes de cada cable fino. No interrumpir GND por separado. Seleccionar mediante corriente normal máxima, no disparo mínimo con tolerancia/temperatura, capacidad admisible del elemento más débil, tiempo/energía de defecto y resistencia añadida. Un distribuidor electrónico con limitación y desconexión puede dar selectividad mejor definida; exige referencia, curva, SOA, térmica y arranque propios. Cambiar cable/conector cuando no haya margen, no aumentar el fusible para esconder el fallo.

### F05. Ajustar a 5,20 V no acredita tensión correcta en todos los estados - bloqueante

El ZE29A permite 4,7-5,3 V. La LRS permite ajuste 4,5-5,5 V; su OVP 5,9-7,3 V no protege ese máximo del sensor. La tolerancia global ±2 % incluye ajuste, línea y carga; sumarle de nuevo línea y carga duplica conceptos. Como simple comprobación de margen, 5,20 x 1,02 = 5,304 V ya supera 5,3 V, sin predecir lo que dará una unidad ajustada.

Más determinante: **nota 7 de la hoja 2025, p. 2**, mantiene que con 3,3/5 V y carga 0-50 % el modo burst puede dar rizado/ruido fuera de especificación. La carga típica estimada de 2,3 A está en esa zona. No hay cota documental suficiente para asumir 80 mVpp en todos los estados. Tampoco se debe subir la fuente hasta que la Pi marque 5,20 V: las cargas ligeras pueden recibir más.

**Solución:** aceptar por tensión mínima/máxima instantánea en cada carga, en reposo, arranque, escalones y calor, no solo por lectura DC de fuente. Primero reducir caídas y contactos. Si no se cumple una ventana común, regular/proteger ramas o cambiar la fuente por una que garantice el régimen real. El objetivo numérico de §6 es una condición futura, no una garantía de la LRS comprada. Un condensador no elegido ni medido no cierra el problema de rizado.

### F06. Carga USB del Solo sin demostrar - bloqueante

El breakout y el cable no tienen referencia eléctrica suficiente. El pico de 2 A es una estimación del proyecto. Las declaraciones CE/EMV y la ficha comercial del Solo no proporcionan ventana de entrada, corriente máxima, compatibilidad BC1.2 ni autorización de servicio continuo con esta etapa.

BC1.2 exige unión D+/D- de hasta 200 ohm para DCP, pero el puente no demuestra compatibilidad del Solo ni negocia automáticamente 2 A. USB-C 2.5 exige en el cable A-C un Rp de **56 kohm ±5 %** entre CC y VBUS; no se reemplaza por 10/22 kohm para anunciar otra corriente. USB-A no está limitado universalmente a 1/1,5 A: existen conectores con otra capacidad. La capacidad del breakout comprado sigue desconocida.

**Solución:** etapa de carga USB documentada y compatible, con protección y cable identificado. Para el primer banco funcional, usar el cargador/cable admitidos por el fabricante del Solo, conservando separada la prueba de integración de la rama común. Demostrar que mantiene batería con carga baja/media/llena y uso prolongado, sin sobretemperatura. No hacer un cobro real para verificar alimentación.

### F07. Valores de pantalla tomados de otros productos - alta

La afirmación «0,5 A, no hay problema de corriente» no está demostrada para el monitor comprado. Parte de la ficha procede de Waveshare 7C; los PDF de Displaytech LVDS y Raspberry Pi Touch Display 2 son comparativos y no fijan la alimentación del GeeekPi HDMI. Una fuente recomendada de 5 V/2 A no equivale a consumo constante de 2 A ni prueba 0,5 A máximo.

**Solución:** obtener referencia/rango y medir arranque, brillo máximo, HDMI ausente y reposo. Mantener alimentación por Power IN y HDMI; no añadir otro USB de Pi a pantalla. Probar encendidos en ambos órdenes y ausencia de alimentación inversa; HDMI contiene masas y H5V. El documento de KMS explica fallos EDID cuando un monitor arranca tarde, pero no prueba el EDID real de esta unidad.

### F08. Tierra de protección sin construcción mecánica definida - bloqueante

Faltan material/espesor de chapa confirmados, método de unión del espárrago, terminales/herramienta, par de apriete, anticorrosión, recorrido flexible y retención. El diseño A añade un puente extraíble entre cajón y carcasa; un faston libre no garantiza que PE conecte primero y desconecte último. Cinco ojales o un solo espárrago no son automáticamente incumplimiento: son una unión sin cualificar. Dos espárragos tampoco aportan redundancia si comparten un único enlace.

**Solución:** plano de PE con entrada dedicada y distribución definida a FG y cada masa accesible, sin depender de guías, muelles, coaxial o fijación electrónica. Flexibles con holgura en todo el recorrido y anclaje lejos del crimpado. Si el cajón se retira, impedir red conectada con PE retirado mediante conector/secuencia mecánica apropiados. Ensayar todas las masas, incluidas piezas soldadas, después de montaje y solicitaciones previstas.

El objetivo de ingeniería de 0,1 ohm desde PE del C14 a cada masa debe registrarse con corriente, duración y compensación de puntas. No constituye por sí solo el método normativo final. La guía IET local es de inspección en servicio; no trasplantar sin más 10-25 A a toda prueba o aplicar el mismo límite desde Schuko incluyendo el cordón.

### F09. Secciones, aislamiento y normativa mezclados - alta

ITC-BT-19 trata instalaciones interiores; su regla 2,5/4 mm² de ciertos conductores PE no acredita automáticamente cada puente interno de este aparato. Tampoco puede presuponerse que un cable genérico de 0,75 mm² admita siempre 6 A ni que los hilos extraídos de una manguera tengan todas las propiedades de otro cable certificado.

**Solución:** seleccionar norma de producto y documentar sección, aislamiento, temperatura, agrupamiento, defecto y terminaciones reales. Si se cambia PE a 2,5 mm², cambiar también los ojales comprados para 0,5-1,5 mm² y su herramienta. Separar y fijar AC/DC; usar cubierta de bornes, barrera de red y protección de todos los cantos, incluidas ranuras USB/FFC. Un pasacables no es automáticamente alivio de tracción ni barrera de líquidos. No inventar una distancia de aislamiento universal sin conocer construcción y norma.

### F10. Coordinación del T2,5A con arranque sin acreditar - alta

El pico típico de 45 A de la LRS no da duración/forma suficiente para integrar I²t. Un modelo con condensador supuesto no prueba 1,5 A²s. Los I²t típicos de Schurter SPT y Eaton S505 se dan en condiciones diferentes y no se trasladan al cartucho genérico.

**Solución:** T2,5A H 250 VAC queda como candidato, con fabricante/referencia y portafusibles definidos. Comparar pulso frío/caliente, repetición, temperatura y tolerancias con datos de protección y del interruptor. La corriente resistiva impresa de un interruptor no acredita su vida con esta irrupción. Resistencia fría, arena, peso y una apertura a baja tensión solo detectan ciertos defectos; no certifican autenticidad ni capacidad de corte de red.

### F11. GND supuestamente flotante y retornos alternativos - alta

El aislamiento salida-FG de la fuente no demuestra que GND siga flotante con todos los cables. RP-SMA/USB puede referenciarlo al chasis; HDMI une masas; tornillos y soportes añaden rutas posibles. Exigir siempre circuito abierto entre Pi GND y caja es un criterio incorrecto para algunas configuraciones. Un lazo no es por sí solo prueba de mal funcionamiento.

**Solución:** matriz de continuidad GND/PE/blindajes con todos los soportes y cables, política explícita de referencia y análisis de retorno abierto. Nunca eliminar PE para suprimir un lazo ni usar coaxial como PE. Añadir un tercer hilo de GND UART sin estudiarlo puede convertirlo en retorno de potencia de hasta 0,5 A si se abre el retorno principal del sensor.

### F12. Apagado parcial no cubierto por UART y HDMI - alta

Fusibles separados hacen posible Pi encendida/sensor apagado o viceversa; una salida TX viva puede inyectar corriente a una entrada sin alimentación. El manual no garantiza tolerancia a ese estado. HDMI puede crear acoplamientos entre Pi y pantalla. Las resistencias serie solas no demuestran protección completa.

**Solución inmediata de servicio:** desconexión de todas las alimentaciones antes de conectar o cambiar señales. Para tolerancia al fallo en servicio, desarrollar interfaz UART con tolerancia de apagado y salidas en alta impedancia, habilitada solo con ambas alimentaciones válidas, y verificar el peor fallo de retorno. TI SN74LVC2G125 es un ejemplo con Ioff, no un circuito aprobado al nombrarlo; alimentación, /OE, power-good, niveles y temporización requieren diseño. Medir también retroalimentación por HDMI y USB.

### F13. Ejemplo de lectura del sensor no trata la ausencia de respuesta - alta

El código de la ficha ZE29A hace `f=ask(...,0x86)` y accede a `f[2]` sin verificar `None`; el ejemplo deja la espera a 0x37 como comentario. Un timeout puede terminar en excepción. El manual permite leer resultado en estado 0x37; no se debe tratar un fallo como cero alcohol ni aceptar sin contexto un resultado viejo.

**Solución entregada:** `uart_checks.py` valida tamaño, cabecera, comando y checksum, rechaza ausencia/campos inválidos y exige estado 0x37 suministrado por el llamante. Mantiene el entero y su unidad mg/100 mL. Las pruebas cubren las 18 tramas del manual. No es firmware de máquina: el llamante todavía debe asegurar ciclo fresco, timeout real, estados, recuperación y asociación con una sesión de pago.

### F14. Pinout correcto no completa la función de medida - alta

ZE29A 1 Vin, 2 GND, 3 TX y 4 RX y UART 9600 8N1/3,3 V coinciden con el manual. Tipo/paso de J1 y colores del arnés no están garantizados. El conducto debe producir presión y presentar primero el orificio de presión y luego el de muestra, con barrera; un tubo directo no acredita soplido de caudal suficiente. La temperatura especificada es 10-40 °C.

**Solución:** arnés por posición comprobada y conector exacto; geometría neumática dibujada y comprobada con caudal/presión, condensado y limpieza. Cables, fuente y UART correctos no prueban exactitud del etanol. No convertir mg/100 mL a mg/L dividiendo por 200/220 sin justificación del fabricante y calibración apropiada. No se ha ensayado metrología, homologación ni seguridad de resultados para conducir.

### F15. UART, inicio y Wi-Fi requieren configuración coherente - media/alta

Para la opción PL011 de esta guía: `enable_uart=1`, `dtoverlay=disable-bt`, desactivar `hciuart` y la consola serie, comprobar `/dev/serial0` y usar 9600 8N1. El bucle TX-RX se realiza con sensor desconectado. El botón tiene dos terminales de contacto seco y dos terminales del LED; no deducir COM/NC ni aplicar 5 V al GPIO.

El diseño A necesita una interfaz AP además del enlace exterior AR9271. Si se propone usar la Wi-Fi interna, no puede quedar desactivada en esa implementación. **Solución:** congelar una variante: router común, o AP por una interfaz definida más AR9271 como enlace exterior, con configuración y recuperación probadas. Verificar el chip real con `lsusb`; el ASIN por sí solo no lo garantiza. No se ha probado Wi-Fi dentro de la chapa ni servicio Cloud.

### F16. Cámara y fijaciones incompletas - media/alta

La cámara recibe 3,3 V del CSI de la Pi; ese consumo debe incluirse en la rama. El plano oficial RP-008146 dibuja el cable de contactos opuestos, aunque la ficha lo deja abierto; eso prueba el cable de referencia, no el pack genérico. El plano RP-008153 de Camera Module 3 indica taladros de **2,2 mm**: los tornillos M3-M6 de la lista y separadores M2,5 no los atraviesan.

**Solución:** fijación M2 o soporte que respete el plano, cable y orientación verificados, sin esfuerzo en ZIF ni contacto con chapa. Conectar sin alimentación, evitando dobleces y tracción. No se ha probado la integridad de señal del FFC de 50 cm ni el hueco óptico de la carcasa final. Los modelos STEP y la BOM de la cámara no sustituyen un ensamblaje completo del producto.

### F17. Terminaciones y montaje de la fuente sin especificación cerrada - alta

Una crimpadora para punteras no acredita faston, ojales, Dupont o JST. Cinco tirones de prueba son verificación adicional, no sustituyen la combinación de terminal/conductor/matriz admitida. Un ojal M4 sí puede pasar geométricamente por M3,5; su aptitud depende de la superficie y espacio del borne, no solo del nombre.

La hoja LRS muestra M3 con L=3 mm en base y L=5 mm en lateral, revisado visualmente. **Solución:** calcular penetración efectiva restando soporte/arandelas; no aplicar tablas genéricas de tornillos inox a la carcasa de la fuente. Especificar par y terminación de cada unión. Sujetar WAGO, puertos y mazos; no estañar hilos destinados a apriete si el terminal no lo admite.

### F18. Diseño A y lista de compra no forman aún una versión fabricable - bloqueante de liberación

La lista de 31 piezas corresponde a la variante antigua. No incluye toda protección DC ni fijación de cámara propuesta, herramientas de otros terminales ni necesariamente las piezas del cajón A. Hay medidas y recorridos sin cerrar. **Solución:** lista de materiales con referencias y revisiones, plano único de arnés, PE y distribución, y cotas reales. La regla comercial «comprable en Amazon» no demuestra especificación eléctrica de una oferta genérica. No se ha comprado nada ni prometido disponibilidad/precio actual.

### F19. Microcarga del botón y almacenamiento ante cortes - media

El pull-up interno de 50-65 kohm hace circular solo 51-66 uA al cerrar. Un botón arcade sin especificación de microcarga no tiene vida de contacto demostrada a esa corriente; hace falta comprobar rebote y lecturas repetidas, y elegir acondicionamiento/contacto adecuado si falla. No se recomienda aplicar 5 V al GPIO para resolverlo. La tarjeta High Endurance no garantiza consistencia del sistema ante cortes. **Solución:** imagen con escritura controlada, fotos/logs temporales donde corresponda y persistencia segura de identificadores; probar cortes con una tarjeta de ensayo, reconciliar operaciones ambiguas y no repetir cobros automáticamente. Nada de ello se ha ensayado en una Pi en este turno.

## 6. Circuito corregido de referencia y dimensionamiento

La [figura corregida](esquema_corregido.svg) es una **arquitectura de referencia condicionada**, con bloques aún por seleccionar. No es una PCB ni un esquema de fabricación con referencias cerradas. No autoriza usar las patillas desconocidas del C14 actual.

1. Schuko/C13 a entrada documentada con corte de ambos conductores activos y protección de entrada seleccionada para la fuente. PE va directo a distribución dedicada, FG y masas.
2. LRS 5 (+V) a protección principal/distribuidor próximo a fuente; LRS 4 (-V) al retorno. Troncal corta de cobre documentado, sección elegida por caída, corriente y temperatura, y fijada separadamente de AC.
3. Cuatro positivos protegidos antes de los cables de carga; cuatro retornos dedicados. Pi por micro-USB, conservando F1; sensor por J1; pantalla por Power IN; Solo mediante etapa USB compatible o cargador autorizado en el banco inicial.
4. UART cruzada, 3,3 V y referencia común; interfaz de apagado parcial si se exige tolerancia de fallo en servicio. HDMI y CSI con sus masas y alimentaciones incluidas en el análisis.
5. Mantener PE independiente de retornos funcionales. Identificar rutas reales de blindajes, aplicar política de GND y proteger cada canto y recorrido móvil.

### 6.1 Hipótesis numéricas de estudio

| Magnitud | Hipótesis o requisito | Alcance |
|---|---|---|
| Corriente máxima de rama Pi | 2,5 A | Presupuesto de estudio que incluye cámara y Wi-Fi, no medición |
| Solo / pantalla / ZE29A | 2,0 / 0,5 / 0,5 A | Primeras dos estimadas; ZE29A manual <0,5 A |
| Total | 5,5 A; 28,6 W a 5,20 V | Inferior a 50 W, con derating compatible; falta validar máximos reales |
| Ventana instantánea a la salida | 5,10-5,20 V | Objetivo futuro incluyendo rizado/transitorios, no garantía de la LRS |
| Resistencia máxima de lazo troncal | 0,010 ohm | Ida + retorno, contactos y protección en caliente |
| Lazos Pi / Solo / pantalla / sensor | 0,050 / 0,080 / 0,100 / 0,100 ohm | Pi incluye también F1 y pistas hasta la red 5 V; objetivo exigente sin demostrar |
| No disparo mínimo Pi / Solo / pantalla / sensor | 2,50 / 2,00 / 0,50 / 0,50 A | Requisito funcional con tolerancia y temperatura |
| Límite superior ideal de rama | 3,00 / 2,20 / 0,75 / 0,65 A | Para estudio de distribución electrónica; no valores de fusible |
| Umbral principal mínimo ideal | 7 A | Permite estudiar selectividad; no referencia seleccionada |

El presupuesto Pi de 50 miliohm **no se demuestra cambiando solo cable**. F1 real y su temperatura/historia pueden consumirlo. El ensayo de sensibilidad con F1 de 0,100 ohm más 0,035 ohm externos da solo **4,7075 V en placa** al extremo de carga. No se debe eludir F1 alimentando por GPIO. Si el presupuesto no es realizable, hay que rediseñar la alimentación y verificar un rango operativo admisible; el modelo condicionado no lo resuelve por asignación de un número.

Como criterios conservadores del proyecto se estudian Pi 4,90-5,25 V en red 5 V de placa, Solo/pantalla 4,75-5,25 V en sus entradas y ZE29A 4,70-5,30 V. Los rangos del Solo/pantalla **no son especificaciones verificadas de esos modelos** y deben sustituirse por los reales. El umbral de subtensión Pi es 4,63 V ±5 % según documentación oficial; no sirve de criterio para el Solo. El techo 5,25 V es criterio de proyecto, no límite universal del USB actual.

### 6.2 Caída DC y contraejemplo del montaje original

Ecuación utilizada: `V_carga = V_fuente - I_total x R_lazo_troncal - I_rama x R_lazo_rama`. Las cargas se representan como corriente constante. No se modelan convertidores internos, respuestas de control, EMI, inductancias ni oscilación.

Referencias de conductor: LAPP T11 da 26 ohm/km por hilo para cobre flexible de 0,75 mm² a 20 °C; USB 2.0 tabla 6-6 da para 22 AWG 0,0574 ohm/m por hilo. Son máximos de conductores conformes, no mediciones de los cables comprados. El lazo multiplica por dos la longitud de un hilo.

Contraejemplo declarado: troncal de 0,50 m por hilo a 0,75 mm² más 0,020 ohm de contactos; latiguillo Pi de 0,15 m por hilo a 22 AWG más 0,040 ohm de contactos; rama Solo con 0,120 ohm totales; cargas máximas del estudio. Con fuente 5,20 V salen **4,80395 V en el micro-USB Pi antes de F1** y **4,707 V en la entrada Solo**. Con 5,096 V de fuente (cribado -2 %) salen **4,69995 V y 4,603 V**. No se conoce el cableado real: esto demuestra que la guía no garantiza margen sin longitudes y contactos, no predice que esas tensiones vayan a medirse.

### 6.3 Resultado de la propuesta condicionada

Se recorrieron 16 combinaciones de cargas 0/máximo y dos extremos de fuente: **32 casos**. Para el modelo lineal y resistencias máximas fijadas, los extremos acotan el intervalo de cargas; no acotan dinámica real ni fallos fuera del modelo.

| Punto | Mínimo calculado | Máximo calculado | Qué acredita |
|---|---|---|---|
| Pi, red 5 V tras F1 | 4,920 V | 5,200 V | Solo si el lazo total, incluido F1, no supera 0,050 ohm |
| Solo, entrada USB-C | 4,885 V | 5,200 V | Solo tensión DC contra criterio provisional; no carga USB |
| Pantalla, Power IN | 4,995 V | 5,200 V | Solo contra corriente/rango supuestos |
| ZE29A, pines 1-2 | 4,995 V | 5,200 V | Compatible con su rango documental bajo estas hipótesis |

En cortos ideales limitados por rama, el total resultante es 6,00/5,70/5,75/5,65 A según falle Pi/Solo/pantalla/sensor, menor que el umbral principal mínimo ideal de 7 A. **No se ha demostrado tiempo de corte, SOA, caída durante el fallo ni selectividad de piezas reales.** Un eFuse puede limitar, reintentar o enclavarse según referencia; esa dinámica falta.

### 6.4 Otros cálculos y sus límites

Para déficit íntegro de 0,5 A durante 5 ms, un condensador ideal de 1.000 uF cae `I x t / C = 2,5 V`; solo sostiene 0,2 V durante 0,4 ms. No se afirma que ese condensador nunca pueda ayudar: depende de qué déficit deja la fuente y de ESR, conexión y respuesta del regulador. No resuelve automáticamente la nota 7.

En 0,050 ohm, 10,6/14,4 A producen 5,618/10,368 W mientras circulan. Es una sensibilidad I²R, no temperatura ni potencia media de un hiccup cuya forma y ciclo se desconocen. No se ha calculado una curva térmica ni tiempo de incendio.

## 7. Pruebas ejecutadas y reproducción

Requisitos: Python 3.10 o superior. Los tres scripts de prueba usan solo biblioteca estándar, no abren puertos serie, no conectan la red y no envían órdenes de cobro. Ejecutar desde esta carpeta:

```text
python verificar_circuito.py
python ac_topology_test.py --json resultados_ac.json
python uart_checks.py --json
```

| Bloque | Prueba ejecutada | Resultado y límite |
|---|---|---|
| DC/documental | 14 comprobaciones, 32 extremos y 10 mutaciones | 14/14; incluye rechazo correcto del diseño original y sensibilidad F1 |
| Mutaciones | Bornes invertidos, TX-TX, 5 V en UART, polaridad, PE abierto/fusionado, SPST, LED en GPIO, rama sin protección, Solo no validado | Todas detectadas por reglas declaradas; no ERC integral de un CAD |
| AC | 20 combinaciones de orientación, estado y fusible | 48/48 aserciones; interruptores/conexiones ideales |
| UART | 14 métodos; 18 tramas manual, 9 construcciones, arranque checksum 46, corrupción/ausencia/estado | 0 errores y 0 fallos; sin transmisión UART física |
| Montaje real | Continuidad, carga, osciloscopio, termopares y disparo real | No ejecutado |
| Software de máquina | Arranque Pi, cámara, UI, red, pago y sesión de medida | No ejecutado; no hay aplicación completa en el árbol |

Las reglas de `verificar_circuito.py` comprueban propiedades seleccionadas de declaraciones explícitas del JSON. El listado W1-W29 sirve de trazabilidad y **no se interpreta como un grafo eléctrico completo con todas las patillas internas**. No se reclama ERC, DRC, SPICE, modelo de semiconductor, ensayo dieléctrico, EMC, calibración o certificación. Los archivos JSON conservan los supuestos y el estado `circuit_approved: false`.

## 8. Estado de los 31 componentes

| # | Componente | Estado de integración y cierre necesario |
|---|---|---|
| 1 | Raspberry Pi 3B+ | Pinout válido; alimentación tras F1, carga combinada y configuración pendientes |
| 2 | microSD High Endurance | Interfaz válida; imagen, arranque, apagado y recuperación no ensayados |
| 3 | Camera Module 3 | CSI válido; alimentación incluida en Pi; fijación M2 y prueba de captura pendientes |
| 4 | FFC 50 cm | Referencia de contactos opuestos verificada en plano; pack y señal reales pendientes |
| 5 | Monitor GeeekPi | Rango/consumo no validados para el modelo; HDMI y Power IN previstos |
| 6 | ZE29A | Pinout y protocolo contrastados; arnés, neumática y metrología pendientes |
| 7 | Arnés JST-XH supuesto | Familia/paso y colores sin verificar; no forzar el conector |
| 8 | Tubo silicona | Geometría, diámetro útil, presión, condensado y limpieza pendientes |
| 9 | SumUp Solo | Rama de carga bloqueada hasta fuente/cable compatibles y prueba de mantenimiento de batería |
| 10 | Cable A-C acodado | Extremos, Rp, resistencia, orientación y hueco sin comprobar |
| 11 | Pulsador | Dos contactos al GPIO; LED aislado; variante A lo elimina |
| 12 | AR9271 | Alimentado por Pi; chip, driver, RF y continuidad a blindaje pendientes |
| 13 | RP-SMA | Compatibilidad y ruta de masa a chasis pendientes |
| 14 | LRS-50-5 | Bornes corregidos; baja carga/rizado, caída, térmica y protección pendientes |
| 15 | C14/interrupción | Bloqueado por esquema/referencia desconocidos; sustitución documentada propuesta |
| 16 | T2,5A | Candidato; marca, curva, capacidad de corte y coordinación pendientes |
| 17 | Schuko-C13 | Topología compatible; retención, PE y referencia de cordón pendientes |
| 18 | Breakouts USB-A | Sin rating concreto; no aprobados para alimentar Solo/pantalla |
| 19 | Latiguillo micro-USB | Polaridad, conductor, resistencia y sujeción pendientes; no evita caída F1 |
| 20 | WAGO 221 | Topología correcta con una pieza por potencial; autenticidad, terminación y soporte pendientes |
| 21 | Cable 0,75 mm² | No se presume cobre/rating del anuncio; troncal y protección deben redimensionarse |
| 22 | H05VV-F 3G1,5 | Definir uso interno, aislamiento y PE bajo norma aplicable |
| 23 | Ojales M4 | Compatibles solo con sección/borne/herramienta reales; actualizar si aumenta PE |
| 24 | Arandelas dentadas | No demuestran por sí solas penetración de pintura ni bloqueo/continuidad duraderos |
| 25 | Espárragos | Soldadura/material/retención sin cualificar; montaje de PE pendiente |
| 26 | Tornillería M3-M6 | Controlar penetración LRS; no resuelve los taladros M2 de cámara |
| 27 | Faston | Tamaño, aislamiento y crimpado de referencia exacta pendientes |
| 28 | Crimpadora/punteras | No cubre automáticamente ojales/faston/JST/Dupont; terminación según borne |
| 29 | Dupont | Solo señal, asegurar retención y no desplazamiento; no usar como solución de potencia |
| 30 | Separadores nylon | Reducen contacto mecánico; no garantizan aislamiento GND-PE del sistema completo |
| 31 | Pasacables | Seleccionar por chapa/ranura; añadir sujeción y protección de todos los cantos |

No se ha diagnosticado ningún componente individual como defectuoso; faltan unidades y resultados de banco. El estado de integración identifica lo que el diseño exige antes de montarlas.

## 9. Plan de banco para cerrar la auditoría

### 9.1 Antes de alimentar equipos

Congelar esquema/variante y lista de materiales con referencias, firmware/imagen, revisión y longitudes. Registrar fotos y mapa por continuidad de C14, USB, micro-USB, J1, FFC y pulsador con todo desconectado. Comprobar polaridad en destinos sin asumir colores. Confirmar que cada WAGO tiene un único potencial. Cerrar fijaciones, crimpados, separación, cubierta, PE y recorrido del cajón.

El trabajo de red y sus pruebas corresponden a una persona competente con equipo apropiado. Seleccionar norma de producto y procedimiento de aislamiento/fuga/continuidad antes de aplicar tensión de ensayo: no trasladar directamente los kVAC de fábrica de la fuente ni 500 V a electrónica conectada. No probar capacidad de corte de cartuchos genéricos provocando un defecto en la red.

### 9.2 Primero cargas ficticias en DC controlada

Probar el distribuidor con fuente de laboratorio limitada y cargas ficticias. Medir tensión mínima/máxima de cada destino, resistencia de lazo, rizado, arranque, pérdida de una rama y respuesta de cada protección. Ensayar fallo controlado sin usar Pi/Solo/sensor como cargas de sacrificio. Registrar corriente y duración reales de limitación, reintento/enclavamiento y efecto sobre ramas sanas.

No declarar este paso aprobado solo por continuidad o porque el LED de la fuente se encienda. Deben existir formas de onda, corriente, temperatura y criterios de la referencia seleccionada. Los límites provisionales del modelo se sustituyen por los datos reales de cada carga.

### 9.3 Integración funcional por etapas

Pi con cámara y Wi-Fi: tensión en placa después de F1, carga CPU/cámara/red simultánea y `vcgencmd get_throttled` sin eventos. El valor 0x0 es diagnóstico de Pi y no aprobación de toda la máquina. Comprobar UART en bucle con sensor fuera; después consultar estado y completar el ciclo real, con errores explícitos por timeout o soplido inválido.

Pantalla: brillo máximo, arranque tardío, EDID/modo soportado, encendidos separados y ausencia de backfeed. Solo: batería baja/media/llena, carga sostenida y temperatura con el cargador autorizado; después validar la etapa común si se mantiene. Verificar red y estado de checkout con sandbox o prueba autorizada independiente; esta auditoría no envía cobros ni datos de pago.

Neumática: medir presión/caudal y orden de tomas, comportamiento con soplido interrumpido, recuperación, condensado y limpieza. Medida de alcohol: patrón/procedimiento adecuados y respuesta del fabricante sobre unidades, conversión y mantenimiento. Un resultado UART válido no demuestra exactitud física.

### 9.4 Prueba cerrada y aceptación

Ensayar caja cerrada al peor ambiente previsto, reposo y carga, con termopares en fuente, contactos, protecciones y zonas calientes. Cumplir límites de los componentes y 10-40 °C del ZE29A; la curva horizontal LRS a 230 V permite 100 % hasta 50 °C y requiere reducción después, según su hoja, sin extrapolar esa orientación a otra colocación.

Repetir continuidad PE y revisión de arneses tras recorrido del cajón, transporte/flexión y ciclos definidos. Evaluar desconexión/pérdida de red, recuperación, estado del pago y no reutilización de resultados. Registrar serie, fecha, instrumentos, incertidumbre, fotos, configuraciones y resultados. Cualquier límite incumplido exige corrección y repetir solo las pruebas afectadas.

## 10. Cambios entregados y decisiones pendientes

Se entregan este documento y PDF, esquema de referencia, inventario completo con hashes, mapa W1-W29, tres scripts y resultados reproducibles. Se corrigen las asignaciones de bornes y adyacencias en la ficha de fuente, ficha de cable y pendientes; se añade enlace a la auditoría en README. Las propuestas restantes están descritas con condiciones de aceptación, sin cambiar silenciosamente todos los documentos antiguos ni fingir que hay piezas elegidas.

Para liberar una revisión hacen falta: una variante única y originales del diseño; entrada C14 y protecciones trazables; construcción y ensayo de PE; fuente/ramas que cumplan la envolvente real; carga USB compatible; política de masas y apagado parcial; neumática y firmware funcionales; y actas de banco. Hasta entonces el dictamen permanece **NO LIBERADO**. El informe concluye el análisis documental/digital realizado y deja abiertos, de forma expresa, la fabricación y los ensayos físicos.

## 11. Referencias principales y cobertura

Las rutas siguientes son relativas al repositorio y las páginas se cuentan desde la primera página del PDF, salvo indicación de número impreso. El inventario proporciona hashes de todos los documentos y miembros ZIP para identificar exactamente las copias examinadas.

| ID | Fuente | Datos utilizados |
|---|---|---|
| R1 | `MONTAJE-GENERAL.md`, commit base, §§1-6 | W1-W29, dos variantes y pendientes |
| R2 | `componentes/meanwell-lrs-50-5/datasheets/MEAN_WELL_LRS-50_DATA_SHEET.pdf`, 2025-04-07, pp.2-4 | Regulación/notas, OVP/OCP, curva, bornes y fijación |
| R3 | `componentes/meanwell-lrs-50-5/datasheets/Enclosed_Power_Supply_Installation_Manual.pdf`, pp.1-3 | Instalación, FG, cableado y limitaciones |
| R4 | `componentes/winsen-ze29a/datasheets/ze29a-c2h5oh.pdf`, V1.1, pp.3-10 | Alimentación, UART, estados, tramas y conducto |
| R5 | `componentes/raspberry-pi-3b-plus/datasheets/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf`, p.1 | J8/J3, CSI, HDMI y alimentación |
| R6 | `componentes/raspberry-pi-camera-module-3/datasheets/RP-008969-SD-3-Raspberry_Pi_Camera_Module_3_Reference_Schematic.pdf`, p.2 | J1 de cámara y 3,3 V |
| R7 | `componentes/raspberry-pi-camera-module-3/datasheets/RP-008153-DS-1-camera-module-3-standard-mechanical-drawing.pdf`, p.1; plano FFC RP-008146 en carpeta cable | Taladros 2,2 mm y contactos opuestos del cable de referencia |
| R8 | `componentes/documentos-compartidos/usb/BCv1.2_070312_0.zip`, Battery Charging 1.2 con errata | §1.4.7, §4.4.3 y tablas5-2/5-3; DCP, 200 ohm y corriente |
| R9 | `componentes/documentos-compartidos/usb/USB_Type-C_2.5_Release_202603.zip`, especificación Type-C2.5 | §3.5/tabla3-13 pp.85/87; §3.7.5.3.2 p.128, Rp y conectores legacy |
| R10 | `componentes/documentos-compartidos/usb/usb_20_20250603.zip`, USB2.0 y ECN VBUS Max Limit | Tabla6-6 p.105 impresa/PDF133, conductor; ECN pp.1/3, máximo VBUS actualizado |
| R11 | `componentes/cable-h05vv-f-3g1-5-5m/datasheets/T11_Conductor_resistances_and_strand_structure_metric_kr.pdf`, p.1 | 0,75/1,5 mm² y resistencias de conductor |
| R12 | `componentes/fusibles-ceramicos-5x20-t2-5a/datasheets/SPT_5x20.pdf`, p.3; `eaton-s505-ferrule-time-delay-ceramic-tube-fuses-data-sheet.pdf`, p.2 | T2,5A, I²t típico y condiciones distintas |
| R13 | Fichas y PDF de C14/terminales/PE; `documentos-compartidos/normas` | Construcción, límites de evidencias y ámbito de normas |

Contrastes primarios externos consultados: [documentación oficial de hardware Raspberry Pi](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html), niveles y detección de subtensión; [Bulgin, Rocker Switches](https://www.bulgin.com/products/pub/media/bulgin/data/A_Rocker%20Switch.pdf), p.4 impresa342, DPST iluminado de cuatro terminales; [Schurter KD](https://www.schurter.com/en/datasheet/typ_kd.pdf), familia de entrada documentada; [TI SN74LVC2G125](https://www.ti.com/lit/ds/symlink/sn74lvc2g125.pdf), pp.1/6-7, Ioff y habilitación; [Bourns MF-MSMF](https://www.bourns.com/docs/product-datasheets/mf-msmf.pdf), tabla MF-MSMF250/16X, resistencia después de disparo para sensibilidad de F1. Sus propiedades no se atribuyen a clones ni variantes desconocidas.

Las páginas de soporte SumUp y wiki52Pi no devolvieron contenido suficiente en los intentos de contraste; no se usan como datos verificados de corriente/rango. Algunos documentos locales son previews de normas y otros son de piezas alternativas. No se ha obtenido por ello texto completo de norma de producto, declaración CE de la máquina, homologación de etilómetro ni aprobación de uso comercial/desatendido. No se han contactado fabricantes ni transmitido información a terceros para cerrar dudas.

**Firma: Auditor 6.1-S.** Auditoría documental y digital, con revisión independiente de AC/PE, DC/USB y señales. Sin montaje físico ni aprobación de energización.
