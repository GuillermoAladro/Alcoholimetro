# Auditor 6-A - revisión independiente USB, periféricos y masas

Nota de trazabilidad: los hashes de las tablas auxiliares describen el checkout Windows y pueden diferir por CRLF/LF. El inventario canónico del paquete (`../inventario_archivos.json`) identifica los objetos Git del commit auditado. Las referencias de líneas corresponden a esa base. Las extracciones temporales no se distribuyen; los documentos originales siguen en el repositorio.

Fecha: 21-10-2026. Base: `84be97669a9efec43e79b3dadc4af5e87458c41a`.

## Veredicto de esta parte

La topología de cuatro ramas de 5 V es plausible, pero el documento no demuestra que el conjunto funcione ni protege adecuadamente todos los escenarios de fallo. No se puede aprobar W14-W17 para producción con el borne genérico sin corriente nominal, consumo y protocolo de carga reales. La comprobación final de masa flotante es incompatible con otras conexiones previstas, salvo aislamiento adicional o ausencia de continuidad interna que debe medirse. No hay hardware conectado: ninguna medida de tensión, temperatura, aislamiento, comunicación o carga se ha efectuado.

## Hallazgos prioritarios y soluciones

### U01 - P1 - criterio de masa flotante contradictorio

Evidencia: `MONTAJE-GENERAL.md:73` afirma que -V flota; W26, línea 92, monta el RP-SMA haciendo contacto con PE; línea 158 exige circuito abierto entre Pi pin 6 y caja interior; líneas 192/194 repiten ambas afirmaciones. La ficha del alargo §4.5 reconoce que RF GND suele unirse a USB GND pero no lo ha medido. La contradicción documental es cierta; la continuidad efectiva del adaptador concreto es condicional.

Además, USB Type-C Release 2.5, p.87, tabla 3-13 nota 5, exige conectar blindaje y GND dentro de ambos plugs de un cable A-C. Dejar S del borne sin cable no garantiza que la carcasa USB quede aislada: el propio cable puede unirla a GND. Los separadores de nailon no aíslan HDMI, conectores, coaxial o apoyos metálicos.

Solución: publicar una matriz de continuidad de 0 V, PE y blindajes con todos los cables montados. Para conservar el criterio flotante, usar un pasamuros RF mecánicamente aislado del metal, aislamiento de carcasas USB y pantalla y verificar continuidad antes/después de cada conexión. Si se elige 0 V referido a PE, documentar una unión deliberada apropiada y sustituir el criterio de circuito abierto; nunca usar el coaxial como conductor de protección ni retirar PE. EMC/ESD y clasificación SELV/PELV se resuelven dentro del diseño del producto, no por una etiqueta aislada.

### U02 - P1 - el fusible 3 A del diseño A no acredita protección del USB

Evidencia: W14-W17, líneas 75-78; diseño A línea 240: 3 A Solo y 3 A pantalla. Borne B07V86XPL4 sin corriente nominal; PDFs son de piezas diferentes. Ejemplos primarios: Würth 61400826021 p.2 =1,5 A; Molex 105057 p.2 =1,5 A y p.3 subida térmica máx. 30°C a esa corriente; CamdenBoss 3927991 p.1 =100 mA; la placa 2905819 p.1/2 =500 mA para datos. Ninguna cifra acredita la placa comprada.

Un fusible nominal 3 A puede mantener una sobrecarga por encima de la corriente admisible de un conector 1 A/1,5 A. No basta con añadir portafusibles ni con medir continuidad. El origen 10 A puede sostener defectos de varios amperios que no activen su hiccup.

Solución: sustituir los bornes genéricos por puertos de carga con referencia, capacidad térmica, limitación de corriente y respuesta a cortocircuito documentadas. Coordinar Iload_max, tolerancia del limitador, corriente del elemento más débil y curva tiempo-corriente/I²t. No fijar aquí un fusible definitivo sin los modelos y el perfil de arranque. Para prototipo del Solo, el camino de referencia es su alimentador/cable autorizado; integrarlo cambia la distribución y requiere diseñar de nuevo la red protegida. Cortar un cable elimina el receptáculo pero no soluciona protocolo, calibre, alivio de tracción o protección.

### U03 - P1 - carga del Solo sin demostrar; puente D+/D- no garantiza 2 A

Evidencia: MONTAJE W14/W15 y §5.2; fichas Solo y cable declaran 0,8 A típico/2 A pico como estimaciones. USB BC 1.2 con errata, tabla 5-2, página PDF 56/impresa 45: consumidor IDEV_CHG hasta 1,5 A; fuente DCP rated IDCP 0,5-5 A. Esta distinción corrige la frase simplificada de que toda fuente DCP solo puede dar 1,5 A. §4.4/pág.PDF 51-52 y tabla 5-3 requieren comportamiento eléctrico además del puente. R_DCP_DAT tiene máximo 200Ω. Type-C 2.5 p.85/87 exige Rp 56 kΩ±5% en cable A-C, no Rp 10 kΩ/22 kΩ para anunciar más capacidad.

Conclusión: Rp 56 kΩ y puente son coherentes como interfaz legacy, pero no prueban que el Solo la reconozca ni que reciba el pico 2 A estimado bajo un mecanismo soportado. La capacidad 10 A de la LRS y el anuncio 3,1 A del cable no negocian potencia ni protegen el conector.

Solución: ensayar carga completa con hardware exacto, registrar tensión en el lector, corriente, temperatura, estado de batería y transacciones; obtener compatibilidad de la alimentación. Si se requiere más potencia, fuente USB-C con controlador de fuente/CC, camino de potencia protegido y cable C-C conforme, o alimentación autorizada. No simularlo cambiando Rp en cable A-C.

### U04 - P1 - pantalla declarada segura a partir de consumo de otra pantalla

Evidencia: MONTAJE línea 77: «unos 0,5 A, así que aquí no hay problema». Ficha pantalla líneas 30,44-46 reconoce que 0,5 A y 5,25 V proceden de Waveshare 7 C, no GeeekPi. 52Pi EP-0170 es solo candidato; recomienda 5 V/2 A y no aporta consumo pico ni rango real. Los PDFs Displaytech/TouchDisplay 2 son referencias distintas.

Solución: borrar la conclusión de ausencia de problema; identificar placa/panel y cable; medir reposo, arranque y brillo máximo en caja cerrada. Presupuestar provisionalmente la capacidad del alimentador recomendado, sin confundir 2 A de capacidad con consumo fijo. Proteger el puerto al nivel soportado por todas sus piezas.

### U05 - P1 - retorno paralelo a través de HDMI invalida «único camino de masa»

Evidencia: `latiguillo-micro-usb-22awg/README.md:3` llama al latiguillo único camino de alimentación y masa común; MONTAJE W23 une Pi y pantalla por HDMI, que incluye masas de señal, y W16 devuelve pantalla a GND. El grafo de conexiones demuestra una ruta alternativa Pi GND -> HDMI -> pantalla GND -> WAGO. Que exista y cuánto conduzca requiere confirmar la topología interna de la pantalla; no debe usarse como retorno de potencia intencionado.

Si se abre el negro W13, la máquina podría seguir encendida usando el retorno HDMI y ocultar el defecto. Tampoco es válido suponer que un fusible por positivo aísla todo un módulo: siguen conectadas líneas de señal y GND. La alimentación inversa positiva vía HDMI es una prueba pendiente, NO un fallo confirmado del modelo sin esquema.

Solución: diseñar y verificar todos los retornos de potencia, sujeción y polaridad. Abrir ramas solo en banco de baja tensión limitado y observar VBUS/3,3 V de módulos apagados. Prohibir el USB adicional Pi-pantalla, tal como ya hace MONTAJE. Mantener masas de señal funcionales; no eliminar pines GND de HDMI para resolver un lazo.

### U06 - P2 - ensayo DCP con falso criterio de diagnóstico

Evidencia: `borne-usb-a-hembra-tornillo/README.md:344,375` y ficha cable §6: si no cambia la corriente al quitar/poner puente, concluye que el aparato no lo usa. Es falso: batería llena, temperatura, demanda inferior al límite o detección solo al conectar producen la misma corriente aunque se use BC 1.2.

Solución: comparar a estado de carga y temperatura controlados; desconectar y volver a enumerar/detectar la fuente para cada caso; usar analizador USB/osciloscopio en D+/D-, y medir el perfil de carga completo. El resultado «sin cambio» se registra como inconcluso sobre protocolo.

### U07 - P2 - margen de alimentación no cerrado por bajar el ajuste de fuente

El límite 5,25 V no es universal para todo USB actual: el ZIP USB 2 contiene el ECN VBUS Max Limit que sube a 5,50 V y advierte que periféricos existentes podrían ser sensibles. No autoriza a aplicar 5,5 V a estas cargas. Debe respetarse el límite más bajo documentado de cada componente y los transitorios, no solo el nominal USB.

El latiguillo 15 cm/22 AWG tiene R_lazo de cobre≈15,888 mΩ a 20°C. Los contactos, F1, troncal y portafusible se suman. Prueba analítica exploratoria: troncal ida 0,3 m/0,75 mm² con 6 A, latiguillo ida 0,15 m 22 AWG con 2,5 A, dos contactos 30 mΩ y F1=100 mΩ después de disparo: V_Pi=4,57772/4,62772/4,67772 V para fuentes 5,10/5,15/5,20 V. Son hipótesis, NO medidas ni cota garantizada de una Pi nueva; F1=100 mΩ es escenario post-disparo de la ficha, no resistencia inicial máxima demostrada. Exhibe que bajar tensión sin mejorar trayecto puede cruzar incluso el aviso nominal 4,63 V. No es criterio de aceptación operar pegado al umbral.

Solución: reducir resistencia real y longitud, escoger conectores y alimentación documentados, y hacer presupuesto completo de Vmax/Vmin en cada carga a temperatura y corriente extremas. Medir simultáneamente fuente y Pi, contactos y transitorios, incluida cámara/WiFi/carga Solo/retroiluminación. No compensar un mal cable subiendo indiscriminadamente el raíl común.

### U08 - P2 - diseño A y configuración WiFi histórica incompatibles

Evidencia: MONTAJE línea 243 cambia a Solo -> AP de Pi -> AR9271 -> Internet. `adaptador-wifi-ar9271/README.md` recomienda `dtoverlay=disable-wifi` en la configuración antigua. Si el AP de diseño A utiliza radio interna, desactivarla impide esa topología. Un único AR9271 en AP+STA tampoco se da por válido sin comprobar combinaciones permitidas y restricciones de canal.

Solución: escoger y versionar la topología: mantener WiFi interna para AP y AR9271 cliente; comprobar `iw phy`, identificar cada interfaz por MAC/driver, persistir nombres y configurar ruta/DHCP/NAT y recuperación. O mantener ambos clientes al router según diseño antiguo. El cableado por sí solo no configura ninguna opción. La Cloud API oficial confirma que Pi y Solo no tienen que estar en la misma red, pero ambos requieren Internet.

### U09 - P2 - disponibilidad y validez de documentos no sustituyen al hardware

AR9271.pdf tiene 152 p y tablas eléctricas completas p.139/144, pero describe el chip, no el adaptador Amazon. El módulo TPE-N150USB es otro producto, con 300-310 mA en TX y 280 mA en RX (p.6). No constituye corriente máxima del modelo recibido. Radiación, latencia y recuperación USB requieren medida con caja cerrada. Alargo con antena exterior mejora la topología pero no acredita enlace del Solo dentro de acero.

Solución: inventario con fabricante/revisión/ID USB y firmware; medición corriente máxima real y temperatura; pruebas de pérdida/recuperación red y arranque con firmware instalado, sin asumir que el ASIN garantiza AR9271. Esta auditoría no efectúa pagos ni hace llamadas de cobro.

### U10 - P2 - certificados de pago incompletos/antiguos en el expediente

`EMV_Level_1_and_Level_2_certificates.pdf` contiene 8 p: cuatro cartas Level 1, ninguna carta Level 2. P.7 indica renovación 17-02-2026 de Solo contactless; p.1 renovación 10-02-2026 para Solo UL. La carta dice válida mientras figure en lista EMVCo: NO puede concluirse que el lector esté actualmente descertificado solo por esa fecha. El TQM p.1 es válido hasta 23-10-2026. Documentar versión y obtener documentos vigentes; no usar estos PDFs como certificación del circuito de la máquina. La declaración CE Solo de 2 p y la de base de 1 p tampoco cubren la integración.

## Comprobaciones realmente ejecutadas

1. Inventario SHA256 y extracción textual de 49 archivos asignados: 31 PDF exteriores (480 p),15 Markdown y 3 ZIP (54 PDF internos,2212 p). Ver `usb/manifest.json`. Todos los PDF se abrieron y se extrajo cada página; recuperación de 7 nombres demasiado largos mediante nombres hash. No se ejecutaron scripts del repo.
2. Lectura técnica de montaje y secciones pertinentes de fichas; consulta primaria de USB-IF,Microchip,SumUp y Raspberry Pi. No se debe afirmar lectura semántica íntegra de 2692 p: los archivos grandes incluyen registros AR9271, protocolos USB, pruebas RF, acuerdos y versiones comparadas que se indexaron y revisaron por relevancia. Se declara esta limitación expresamente.
3. Inspección visual de Type-C 2.5 p 87 y BC 1.2 p 56 para verificar tablas/Rp/valores; los renders están en `usb/`.
4. `python -X utf8 comprobaciones_usb.py`:3 comprobaciones de grafos coherentes,3 escenarios de ley de Ohm. Resultados en `usb/circuit_checks.json`. Es un modelo topológico/analítico, no SPICE, no incluye dinámica de fuente, fusible, EMI, protocolos ni modelos internos de cargas.
5. No hardware, instrumentación, tensión de red, medidas de USB, firmware ejecutado en Pi ni prueba funcional del Solo.

## Ensayos de aceptación propuestos, pendientes

| Prueba | Preparación y registro | Resultado necesario |
|---|---|---|
| Continuidad y polaridad | Fuera de tensión, cargas desconectadas; cada conductor por posición, no color | VBUS/GND correctos, ningún corto accidental; mapa de blindajes/PE consistente |
| CableA-C | Breakout sin resistencias parásitas, comprobar ambos giros y D+/D- | Rp 53,2-58,8 kΩ a VBUS; continuidad y aislamiento conforme tabla 3-13 |
| Puerto de carga | Fuente limitada, carga electrónica, modelo exacto; medir caída y temperatura | Sostiene demanda y transitorios sin exceder ratings de ninguna pieza |
| Protección rama | Carga de prueba y cortos controlados; observar fuente y otras ramas | Fallo localizado y energía/temperatura dentro de diseño; ninguna protección depende de quemar pista |
| Solo | Referencia alimentador autorizado, batería baja/alta, detección DCP controlada | Batería se mantiene/carga con carga de servicio, sin sobretemperatura; no inferir protocolo solo de corriente |
| Pantalla | Brillo máximo, patrones, arranque simultáneo/caja cerrada | Sin reset, rango tensión identificado, temperatura dentro especificación |
| Retornos/alimentación parcial | Banco de baja tensión limitado; retirar positivos/retornos uno auno | No alimentación parásita ni corriente dañina por HDMI/UART/coaxial; resultados instrumentados |
| Pi completa | Cámara activa+CPU+TXWiFi+Solo cargando+pantalla | Sin subtensión actual ni histórica tras sesión, tensión válida y margen térmico |
| WiFi/Solo | Caja final cerrada, interrupción router/Internet y reinicio | Recuperación a estado de servicio definido; ningún cobro ambiguo repetido automáticamente |

## Fuentes primarias contrastadas online

- [USB-IF Type-C 2.5](https://usb.org/document-library/usb-type-cr-cable-and-connector-specification-release-25), más texto íntegro delZIP local: tabla 3-13 p 87.
- [USB-IF BC 1.2](https://usb.org/document-library/battery-charging-v12-spec-and-adopters-agreement), másZIP local: BC 1.2+errata §4.4/tabla 5-2.
- [Microchip, Battery Charging withUSB](https://developerhelp.microchip.com/xwiki/bin/view/applications/usb/power-delivery/battery-charging/): mecanismos de detección y necesidad de protección. Su resumen 1,5 A se matiza con tabla primaria de BC 1.2.
- [SumUp Cloud API](https://developer.sumup.com/terminal-payments/cloud-api): recomienda Solo enchufado y ambos equipos conectados a Internet, no necesariamente misma red; simulador no valida carga/NFC/red de hardware.
- [Raspberry Pi hardware](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html): GPIO 3,3 V y especificaciones/funciones; no certifica periféricos genéricos.
- Wiki 52Pi EP-0170 falló al abrirse con herramientaweb; no se declara reconfirmada online. Sus afirmaciones aquí se atribuyen a la ficha del repositorio.


## Inventario de archivos asignados

Todos abiertos/extraídos, con revisión técnica dirigida; no equivale a una lectura semántica completa de cada página. El detalle JSON conserva SHA256, tamaños, páginas sin texto y todos los miembros ZIP.

| Archivo | Tratamiento |
|---|---|
| `componentes/borne-usb-a-hembra-tornillo/datasheets/2856485.pdf` | PDF: 1 páginas extraídas |
| `componentes/borne-usb-a-hembra-tornillo/datasheets/2905819.pdf` | PDF: 3 páginas extraídas |
| `componentes/borne-usb-a-hembra-tornillo/datasheets/3927991.pdf` | PDF: 1 páginas extraídas |
| `componentes/borne-usb-a-hembra-tornillo/datasheets/61400826021.pdf` | PDF: 7 páginas extraídas |
| `componentes/borne-usb-a-hembra-tornillo/datasheets/A700000008643305.pdf` | PDF: 9 páginas extraídas |
| `componentes/borne-usb-a-hembra-tornillo/datasheets/USB_Sockets.pdf` | PDF: 3 páginas extraídas |
| `componentes/borne-usb-a-hembra-tornillo/enlaces.md` | Markdown: texto íntegro disponible, secciones de auditoría revisadas |
| `componentes/borne-usb-a-hembra-tornillo/README.md` | Markdown: texto íntegro disponible, secciones de auditoría revisadas |
| `componentes/cable-usb-a-usb-c-90-30cm/enlaces.md` | Markdown: texto íntegro disponible, secciones de auditoría revisadas |
| `componentes/cable-usb-a-usb-c-90-30cm/README.md` | Markdown: texto íntegro disponible, secciones de auditoría revisadas |
| `componentes/latiguillo-micro-usb-22awg/datasheets/FLUKE_Application_Note_Copper_Clad_Aluminum_CCA_Cables.pdf` | PDF: 5 páginas extraídas |
| `componentes/latiguillo-micro-usb-22awg/datasheets/Micro-USB_1_01.pdf` | PDF: 36 páginas extraídas |
| `componentes/latiguillo-micro-usb-22awg/enlaces.md` | Markdown: texto íntegro disponible, secciones de auditoría revisadas |
| `componentes/latiguillo-micro-usb-22awg/README.md` | Markdown: texto íntegro disponible, secciones de auditoría revisadas |
| `componentes/pantalla-geeekpi-7-hdmi/datasheets/DT070BTFT-HB-Displaytech-Spec-1649616.pdf` | PDF: 16 páginas extraídas |
| `componentes/pantalla-geeekpi-7-hdmi/datasheets/RP-004341-WP-2-Troubleshooting_KMS_HDMI_output.pdf` | PDF: 12 páginas extraídas |
| `componentes/pantalla-geeekpi-7-hdmi/datasheets/RP-010429-MM-3-touch-display-2-7-inch-product-brief.pdf` | PDF: 8 páginas extraídas |
| `componentes/pantalla-geeekpi-7-hdmi/enlaces.md` | Markdown: texto íntegro disponible, secciones de auditoría revisadas |
| `componentes/pantalla-geeekpi-7-hdmi/README.md` | Markdown: texto íntegro disponible, secciones de auditoría revisadas |
| `componentes/sumup-solo/datasheets/211025_-_TQM_SoC_Labels__Sum_Up__TQM5064__3_.pdf` | PDF: 2 páginas extraídas |
| `componentes/sumup-solo/datasheets/BRI42258_TECH.pdf` | PDF: 1 páginas extraídas |
| `componentes/sumup-solo/datasheets/EMV_Level_1_and_Level_2_certificates.pdf` | PDF: 8 páginas extraídas |
| `componentes/sumup-solo/datasheets/Solo___Solo_Lite_Cradle_CE_Declaration_of_conformity_.pdf` | PDF: 1 páginas extraídas |
| `componentes/sumup-solo/datasheets/SumUp_Solo_CE_Declaration_of_Conformity_Access__signed.pdf` | PDF: 2 páginas extraídas |
| `componentes/sumup-solo/enlaces.md` | Markdown: texto íntegro disponible, secciones de auditoría revisadas |
| `componentes/sumup-solo/README.md` | Markdown: texto íntegro disponible, secciones de auditoría revisadas |
| `componentes/adaptador-wifi-ar9271/datasheets/AR9271.pdf` | PDF: 152 páginas extraídas |
| `componentes/adaptador-wifi-ar9271/datasheets/datasheet_tl-wn722n.pdf` | PDF: 3 páginas extraídas |
| `componentes/adaptador-wifi-ar9271/datasheets/en_300328v020202p.pdf` | PDF: 101 páginas extraídas |
| `componentes/adaptador-wifi-ar9271/datasheets/TPE-N150USB-spec-sheet.pdf` | PDF: 11 páginas extraídas |
| `componentes/adaptador-wifi-ar9271/enlaces.md` | Markdown: texto íntegro disponible, secciones de auditoría revisadas |
| `componentes/adaptador-wifi-ar9271/README.md` | Markdown: texto íntegro disponible, secciones de auditoría revisadas |
| `componentes/alargo-antena-rp-sma-30cm/datasheets/60311052111534.pdf` | PDF: 7 páginas extraídas |
| `componentes/alargo-antena-rp-sma-30cm/datasheets/8216_techdata.pdf` | PDF: 2 páginas extraídas |
| `componentes/alargo-antena-rp-sma-30cm/datasheets/CBD01.07.0100C.pdf` | PDF: 19 páginas extraídas |
| `componentes/alargo-antena-rp-sma-30cm/datasheets/FMC0212174LF.pdf` | PDF: 3 páginas extraídas |
| `componentes/alargo-antena-rp-sma-30cm/datasheets/RG316DS.pdf` | PDF: 3 páginas extraídas |
| `componentes/alargo-antena-rp-sma-30cm/datasheets/TAOGLAS-Reverse-Polarity-SMA-Application-Note-APN-12-8-001.A.pdf` | PDF: 1 páginas extraídas |
| `componentes/alargo-antena-rp-sma-30cm/enlaces.md` | Markdown: texto íntegro disponible, secciones de auditoría revisadas |
| `componentes/alargo-antena-rp-sma-30cm/README.md` | Markdown: texto íntegro disponible, secciones de auditoría revisadas |
| `componentes/documentos-compartidos/normas/in-service-inspection-and-testing-of-electrical-equipment-the-earth-continuity-test.pdf` | PDF: 3 páginas extraídas |
| `componentes/documentos-compartidos/normas/ITC-BT-19.pdf` | PDF: 16 páginas extraídas |
| `componentes/documentos-compartidos/normas/ITC-BT-36.pdf` | PDF: 10 páginas extraídas |
| `componentes/documentos-compartidos/normas/preview_iec60335-2-82_ed2.1_b.pdf` | PDF: 13 páginas extraídas |
| `componentes/documentos-compartidos/normas/SOLiC-Test-Report-No-2013.pdf` | PDF: 21 páginas extraídas |
| `componentes/documentos-compartidos/README.md` | Markdown: texto íntegro disponible, secciones de auditoría revisadas |
| `componentes/documentos-compartidos/usb/BCv1.2_070312_0.zip` | ZIP: 5 PDF, 156 páginas extraídas |
| `componentes/documentos-compartidos/usb/usb_20_20250603.zip` | ZIP: 37 PDF, 1114 páginas extraídas |
| `componentes/documentos-compartidos/usb/USB_Type-C_2.5_Release_202603.zip` | ZIP: 12 PDF, 942 páginas extraídas |

### Miembros ZIP


`componentes/documentos-compartidos/usb/BCv1.2_070312_0.zip`

- `BCv1.2_070312/BCv1.2_070312/Battery Charging V1_2 ADOPTERS AGREEMENT - Device Class Spec.pdf` - 5 p.
- `BCv1.2_070312/BCv1.2_070312/Battery_Charging_Errata_Rev_1.2.pdf` - 3 p.
- `BCv1.2_070312/BCv1.2_070312/Battery_Charging_Errata_Rev_1.2_2012-03-15.pdf` - 5 p.
- `BCv1.2_070312/BCv1.2_070312/BC1.2 plus errata 2012-3-15.pdf` - 72 p.
- `BCv1.2_070312/BCv1.2_070312/BC1.2_without errata 2010-12-7.pdf` - 71 p.

`componentes/documentos-compartidos/usb/usb_20_20250603.zip`

- `usb_20_20250603/usb_20_20240927/usb_20_20240927/2002_05_28_errata.pdf` - 7 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/5V Short Circuit Withstand ECN.pdf` - 2 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/Connect Timing ECN.pdf` - 6 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/Device Capacitance ECN.pdf` - 2 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/Disconnect_Supplement_HSIC_v1.0_18Sep2013.pdf` - 8 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/ECN for Core Spec TEST_MODE selector values.pdf` - 3 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/ecn1-usb20-miniB-revd.pdf` - 45 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/errata-092800-1207001.pdf` - 31 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/High Speed Inter-Chip_1_0 final.pdf` - 16 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/HSIC_ECN_21May2012.pdf` - 6 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/Inter-Chip USB Supplement to the USB 2.0 Specification_1.0.pdf` - 48 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/InterfaceAssociationDescriptor_ecn.pdf` - 5 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/Micro-USB_final/Clarification on the Chamfer on USB 2 0 Micro Connectors ECN .pdf` - 4 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/Micro-USB_final/Maximum Unmating Force Value Definition to USB 2 0 Micro Connectors ECN.pdf` - 3 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/Micro-USB_final/Micro-USB Cables and Connectors ADOPTERS AGREEMENT - Device Class Spec.pdf` - 5 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/Micro-USB_final/Micro-USB ECN for Cable R3.pdf` - 3 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/Micro-USB_final/MicroUSB ECN.pdf` - 2 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/Micro-USB_final/Micro-USB_1_01.pdf` - 36 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/Micro-USB_final/XV-4687C ECN Proposal for Micro USB.pdf` - 23 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/Micro-USB_final/XV-4687C_Supplement Quad cable R1.pdf` - 15 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/resistor_ecn.pdf` - 5 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/rnd_chmfr_ECNFINAL.pdf` - 3 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/Suspend Current ECN.pdf` - 2 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/UnicodeECN.pdf` - 2 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/USB 2 0 Material Change ECN.pdf` - 3 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/USB 2.0 DCR ECN.pdf` - 16 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/USB 2.0 Double Isochronous IN ECN.pdf` - 6 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/USB 2.0 ECN VBUS Max Limit.pdf` - 5 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/USB 2.0 eUSB2 Repeater ECN.pdf` - 6 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/USB 2.0 Phase-Locked SOFs ECN.pdf` - 2 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/USB 2_0 Adopters Agreement - PDF Submission Update 20230216.pdf` - 6 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/USB OTG and Embedded Host/USB OTG ECN/USB OTGEH ECN Maximum Vbus Voltage OTGEH2.0.1.1A.001.pdf` - 4 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/USB OTG and Embedded Host/USB OTG v2.0_ Amendment final_052609.pdf` - 1 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/USB OTG and Embedded Host/USB_OTG_and_EH_2-0-version 1_1a.pdf` - 96 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/usb_20.pdf` - 650 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/USB2_LinkPowerMangement_ECN[final].pdf` - 29 p.
- `usb_20_20250603/usb_20_20240927/usb_20_20240927/USB2-LPM-Errata-final.pdf` - 8 p.

`componentes/documentos-compartidos/usb/USB_Type-C_2.5_Release_202603.zip`

- `USB Type-C 2.5 Release 202603/Release 2.4 ECNs incorporated into Release 2.5/USB Type-C R2.4 ECN Attached.SRC Clarification on Vbus duration.pdf` - 2 p.
- `USB Type-C 2.5 Release 202603/Release 2.4 ECNs incorporated into Release 2.5/USB Type-C R2.4 ECN Clarify Assured and Shared Capacity Definitions 20250403.pdf` - 2 p.
- `USB Type-C 2.5 Release 202603/Release 2.4 ECNs incorporated into Release 2.5/USB Type-C R2.4 ECN Clarify PDP in Section 4.6.2.4 20260205.pdf` - 2 p.
- `USB Type-C 2.5 Release 202603/Release 2.4 ECNs incorporated into Release 2.5/USB Type-C R2.4 ECN LRD Cleanup r2.pdf` - 22 p.
- `USB Type-C 2.5 Release 202603/Release 2.4 ECNs incorporated into Release 2.5/USB Type-C R2.4 ECN Ra Requirements 20250313.pdf` - 4 p.
- `USB Type-C 2.5 Release 202603/Release 2.4 ECNs incorporated into Release 2.5/USB Type-C R2.4 ECN Section 4.5.2.4 Updates 20250313.pdf` - 5 p.
- `USB Type-C 2.5 Release 202603/Release 2.4 ECNs incorporated into Release 2.5/USB Type-C R2.4 ECN Sink CC Pin Voltages Revised_11-25.pdf` - 4 p.
- `USB Type-C 2.5 Release 202603/Release 2.4 ECNs incorporated into Release 2.5/USB Type-C R2.4 ECN Sink with Accessory Support State Transition.pdf` - 5 p.
- `USB Type-C 2.5 Release 202603/Release 2.4 ECNs incorporated into Release 2.5/USB Type-C R2.4 ECN Source Rp Clarification r1.pdf` - 2 p.
- `USB Type-C 2.5 Release 202603/USB 3_0 Adopters Agreement PDF Submission Update 20230219.pdf` - 6 p.
- `USB Type-C 2.5 Release 202603/USB Type-C Spec R2.5 - March 2026 Compared to R2.4.pdf` - 446 p.
- `USB Type-C 2.5 Release 202603/USB Type-C Spec R2.5 - March 2026.pdf` - 442 p.
