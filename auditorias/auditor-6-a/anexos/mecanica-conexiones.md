# Revisión complementaria de conexiones y fijaciones — Auditor 6-A

Nota de trazabilidad: los hashes de las tablas auxiliares describen el checkout Windows y pueden diferir por CRLF/LF. El inventario canónico del paquete (`../inventario_archivos.json`) identifica los objetos Git del commit auditado. Las referencias de líneas corresponden a esa base. Las extracciones temporales no se distribuyen; los documentos originales siguen en el repositorio.

Fecha: 21-10-2026. Base: `84be97669a9efec43e79b3dadc4af5e87458c41a`. Informe para integración; no modifica originales ni certifica montaje físico.

Los hashes de este anexo corresponden a los bytes del checkout Windows: los Markdown pueden diferir del blob Git por conversión CRLF/LF. inventario_archivos.json del paquete final es la fuente canónica de identidad de los archivos auditados.

## Cobertura

Revisados los cinco directorios asignados: `componentes/cable-2x0-75-rojo-negro-10m`, `separadores-nylon-m2-5`, `tornilleria-inox-m3-m6`, `pasacables-goma`, `wago-221-surtido`.

- Los 10 Markdown (README y enlaces de cada directorio) se leyeron íntegramente por fragmentos. Para reducir ruido, una copia de lectura reemplazó URL por `[URL]` y eliminó líneas vacías, conservando el texto y números de línea originales. Las URL originales no se visitaron todas: no confundir lectura del inventario de enlaces con revisión del contenido remoto.
- Los 17 PDF, 85 páginas, se abrieron y extrajeron completos. Se leyó todo el texto extraído. Las tablas con texto fuera de orden se contrastaron visualmente donde afectan al diseño. La extracción completa no equivale a una validación gráfica de cada imagen secundaria del PDF.
- Revisión visual específica: LAPP T11 p1; Bayka TD06 p2; Würth 971060155 p1; WAGO 221-415 alemán p3; Fastenal propiedades pp1–2; HAT+ p14; Nord-Lock pp10 y 13. Nueve páginas rasterizadas revisadas. Los PDF sin esa revisión visual específica conservan la limitación de capas de imagen no interpretadas íntegramente.
- Huellas, bytes y páginas: `../inventario_archivos.json`. Las copias de extracción y páginas PNG fueron materiales temporales de revisión.
- Ninguna prueba de tracción, aislamiento, fuego, temperatura, contacto, vibración o pieza real se ejecutó. Los datos de otras marcas o grados no acreditan el ASIN genérico comprado.

## Conclusión

La topología de dos WAGO de un potencial separado para +5 V y GND es correcta y las secciones nominales del proyecto entran en el rango del 221-415 para cobre flexible desnudo. El montaje no queda cerrado por ello: faltan referencias verificadas de cable/punteras/pasacables, sujeción, coordinación de protección por rama y el detalle de fijaciones que conserva separación de red. Parte de las fichas contienen recomendaciones y cálculos que no se deben trasladar a una orden de montaje como si fueran especificaciones del fabricante.

## Hallazgos y correcciones

### M01 — Los pares de apriete no están especificados para las uniones reales

**Alta para fuente y PE; documental y de diseño.** `tornilleria-inox-m3-m6/README.md:225` propone ≤0,5 N·m para la fijación de la Mean Well tomando un límite del módulo Schurter; `:227` propone 1,9 N·m para tierra desde una tabla A2-70 lubricada. Esos componentes son distintos del kit genérico y del espárrago/ojal real. El PDF Fastenal de par-tensión p1 exige además una tuerca o rosca con carga de prueba suficiente y distingue lubricación, fricción y precarga. No basta conocer el diámetro M3/M4.

**Solución:** una ficha por unión crítica con fabricante y referencia de tornillo, tuerca/rosca receptora, clase, apoyo, arandela, tratamiento, estado seco/lubricado, penetración máxima, par y método de bloqueo. Tomar el par del conjunto/fabricante o de cálculo y prueba del conjunto; marcar estos pares de las fichas actuales como orientativos no liberados. En PE, validar contacto y retención del conjunto final; un valor bajo de ohmios por sí solo no verifica precarga ni estabilidad.

### M02 — Error al reutilizar pares UNC como métricos

**Media.** `tornilleria-inox-m3-m6/README.md:330` presenta valores NL3ss/NL4ss/NL5ss de 0,6–0,7 / 1,4–1,5 / 2,1–2,3 ft·lbf como referencia para tamaños métricos. El catálogo local `NORD-LOCK_Washers_Catalogue.pdf`, p10, tabla inferior derecha, es expresamente UNC: #5-40, #8-32 y #10-24. La tabla de dimensiones superior sí vincula una arandela a varios diámetros UNC/métricos, pero no transforma los pares de una rosca en los de otra.

**Solución:** sustituir por tabla métrica de fabricante para la rosca/material exactos, sin derivar par a partir del nombre de la arandela. P10 confirma grosor de par NL3ss 0,09 pulgadas ≈2,286 mm y p8 NL3 de acero 0,07 pulgadas ≈1,778 mm. P13 sí menciona expresamente arandelas SP para superficies pintadas, resolviendo la limitación marcada en README:433; ello no acredita el comportamiento del montaje PE ni permite conservar pintura en su contacto eléctrico.

### M03 — Espesor de 2,6 mm confundido con solape; penetración insegura si se copia el ejemplo

**Alta si se ejecuta.** `tornilleria-inox-m3-m6/README.md:201` llama 2,6 mm «espesor de chapa» del marco Solo, mientras `pasacables-goma/README.md:190` identifica correctamente el valor como solape geométrico (83,16−78)/2=2,58 mm. Los ejemplos de tornillo se calculan con ese supuesto, aunque se advierte medir.

**Solución:** retirar ese espesor como dato de fabricación. Calcular penetración desde espesor real del soporte, arandelas y tornillo, incluyendo tolerancias y forma de cabeza. No trasladar profundidad máxima de la fuente a longitud total de tornillo. Tampoco introducir varillas/sonda por agujeros de la fuente para buscar fondo como recomienda README:212: usar plano e indicaciones del fabricante y comprobar longitud externa del conjunto. Desconectar no prueba que condensadores internos estén descargados; un útil que sobrepase la penetración permitida añade riesgo. El agente de alimentación revisa visualmente el plano de Mean Well para la asignación exacta de agujeros.

### M04 — Punteras de la guía sin compatibilidad geométrica cerrada con WAGO

**Media, alta si el contacto de potencia queda defectuoso.** `wago-221-surtido/README.md:5` y `:139` describen 0,75 mm² con puntera; `cable-2x0-75-rojo-negro-10m/README.md:410` cita una puntera con metal de 8 mm para la LRS. La WAGO requiere 11 mm de pelado y no precisa puntera (PDF alemán pp2–3). No hay prueba de que la puntera del kit coincida con esa profundidad; la sección nominal sola no resuelve asiento ni collarín.

**Solución concreta:** en WAGO 221-415 genuina, usar cobre flexible sin puntera, pelado a 11 mm, hasta tope, palanca cerrada, sin hilos fuera y comprobación de retención. En bornes de tornillo, elegir terminal según fabricante de ese borne. Si se insiste en puntera en WAGO, verificar largo metálico, collarín, sección final y crimpado para ese conector. WAGO confirma que no existe autorización genérica de todas las punteras y que la longitud debe corresponder al pelado indicado: [instrucción oficial de WAGO](https://www.wago.com/global/industries/building-technology/electrical-installers/helpful-tips/ferrules), consultada 21-10-2026.

### M05 — WAGO no protege las ramas y sus cinco entradas están ocupadas

**Alta por sobrecorriente, ya cubierto por la auditoría eléctrica principal.** PDF WAGO alemán p3: cinco conexiones, **un potencial**; 32 A según EN /20 A UL no limita corriente. `README.md:129`–`:133` ocupa entrada más cuatro cargas. `:294` reconoce falta de protección por rama.

**Solución:** integrar protección DC con características coordinadas con cable, conectores y transitorios de cada carga antes del reparto definitivo. Un fusible de red no sustituye esto. Dimensionar también el troncal para el fallo posible y su protección. Para ventilador u otra carga, rediseñar distribución con bornes/puentes adecuados; no insertar dos conductores en una entrada sin aprobación explícita.

### M06 — «6 A» y estimaciones térmicas no califican el cable genérico

**Media/alta, diseño.** `cable-2x0-75-rojo-negro-10m/README.md:234` concluye 6 A como corriente asignada del cordón de 0,75 mm², pero el ASIN no tiene tipo/aislamiento/metal confirmados. Bayka TD06 p2, revisada visualmente, distingue 15 A (unipolar libre en aire), 6 A (multiconductor de aparatos domésticos/de mano, dos o tres conductores cargados) y 12 A (multiconductor para otros usos, dos/tres cargados). No permite convertir 12 A en una temperatura arbitraria y escalarla para acreditar el arnés: README:250 asume 40 K a12 A sin datos térmicos. Tampoco el factor de «número de almas cargadas» de un multiconductor acredita cuatro pares agrupados de construcción desconocida (`:236`).

**Solución:** fijar cable de cobre documentado, aislamiento, temperatura, recorrido, longitud, agrupación, corriente continua/pico y protección. Mantener los cálculos de caída resistiva como modelo (por ejemplo 0,5 m ida/vuelta a5 A y26 mΩ/m por conductor→0,130 V y0,650 W a20 °C), no convertirlos en temperatura observada. LAPP T11 p1 confirma26,0 Ω/km cobre flexible y26,7 Ω/km cobre recubierto a20 °C. Criterio de resistencia del rollo debe corregir longitud, temperatura e incertidumbre. La medición con puente al extremo incluye la resistencia del puente, que debe medirse/restarse o hacerse despreciable.

### M07 — Confundir FG con fase introduce un criterio de seguridad falso

**Media.** `cable-2x0-75-rojo-negro-10m/README.md:381` dice que tocar «L o FG» pone tensión de red en5 V. L es fase; FG correctamente conectado es PE/chasis. Un contacto del raíl con FG puede crear un vínculo a tierra no deseado (o un corto si el otro polo ya está unido), pero no aplica por sí solo230 V. No debe enseñarse FG como conductor vivo normal.

**Solución:** distinguir L/N/PE de +5 V/0 V, documentar la decisión de unir o aislar 0 V de PE y los caminos reales (pantalla, HDMI, RP-SMA, USB, tornillos). Conservar siempre PE de masas accesibles y resolver EMC/masa de señal según el diseño completo. No presentar la prueba de GND-chasis abierto de `separadores-nylon-m2-5/README.md:233` como requisito universal si un conector o enlace deliberado hace esa unión.

### M08 — Procedimientos de recepción sin poder probatorio suficiente o innecesariamente inseguros

**Media.** Casos precisos:

- WAGO `README.md:175`–`:176`: continuidad entre rails con cables ya montados no discrimina un corto de la respuesta de electrónica/condensadores. Comprobar arnés aislado de fuente y cargas; después inspección y energización DC limitada. Un polímetro de dos puntas no acredita resistencia de contactos de unos mΩ.
- WAGO `:310`: propone14 mm de pelado para exponer3 mm de cobre y medir a5 A. Usar útil de laboratorio protegido, sondas Kelvin/puntos de prueba y terminales con pelado correcto; no normalizar el cobre expuesto en el arnés final.
- Cable `README.md:330`: dice no hacer llama en casa y luego prescribe quemar una muestra fuera. Retirar la instrucción casera. No verifica IEC/UL ni identidad de material; pedir documentación/ensayo de laboratorio.
- Pasacables `README.md:320`: olor químico no identifica PVC ni plastificante. `:324` prescribe horno de cocina; retirar uso de equipo alimentario para materiales desconocidos. Prueba térmica controlada en equipo dedicado y con límites del material, sin tomarla por certificación.
- Tornillería `README.md:279`,`:382`: respuesta fuerte al imán no demuestra universalmente «no austenítico», pues deformación y composición influyen; `:385` rotura casera a par dado no certifica clase70 y `:387` sal24–48 h no identifica grado. Usar trazabilidad y ensayos aplicables; esas cribas solo detectan anomalías, no autentican.

### M09 — Pasacables y bucles de movimiento no especificados

**Media/alta por desgaste de aislamiento.** `pasacables-goma/README.md:213`–`:224`,`:356`–`:364`: el propio repositorio reconoce ranuras14×9 para Solo y18×3 propuesta paraFFC, calibre de chapa y amplitud de suspensión desconocidos. La frase «en todos los agujeros» no proporciona pieza, ranura, retención ni alivio. Un ojal abierto protege canto; no es prensaestopas/retención ni aislamiento reforzado acreditado. Una brida tan floja que permite deslizar/girar el cable (`cable README:428`) puede servir de guiado, pero no se debe contar como alivio de tracción sin ensayo.

**Solución:** tabla de pasos final con ID, placa/espesor, abertura acabada, cable/conector mayor, perfil/grommet de referencia, rango térmico, retención, puntos de abrazadera y holgura. Recalcular tamaño libre después del perfil. Separar guiado de alivio de tracción; proteger en ambos extremos el tramo móvil y probar todo el desplazamiento sin tirar de microUSB/CSI/PE. Cien movimientos a mano son cribado, no validación de fatiga de vida útil.

### M10 — Nailon: material ajeno, precarga no demostrada y error de medición de rosca

**Media/menor según punto.** Las hojas BASF/Ensinger/Würth son de grados/piezas identificados distintos del surtido. No prueban temperatura/UL94/retención del kit. BASF p2 sí da3000/1100 MPa seco/acondicionado y700 MPa módulo de fluencia, pero `separadores-nylon-m2-5/README.md:295` convierte su cociente en un tercio de apriete perdido; módulo de fluencia y relajación de precarga del conjunto no son intercambiables de forma directa. No es medida de vida útil.

`README.md:344` indica2,25 mm «entre cinco crestas». Cinco crestas delimitan cuatro pasos: para0,45 mm resultan1,80 mm. Para medir cinco pasos/2,25 mm hay que medir desde la primera hasta la sexta cresta. El mismo error afecta a la cifra1,75 mm del paso fino0,35.

**Solución:** kit o pieza trazable; altura y cabezas verificadas; evitar contacto metálico atravesando separadores cortos; par del fabricante, no extrapolación de M3 aM2,5. Corregir el método de pasos. No usar242/243 sobre termoplástico sin compatibilidad acreditada: Henkel242 p1 y243 p3 advierten fisuración. El HAT+ p14 prescribe15/16 mm para espacio de Active Cooler en placas apiladas; no impone esa altura al montaje de la Pi contra chasis.

## Aceptaciones documentales limitadas

- Dos WAGO separadas por polaridad: arquitectura coherente. Nunca poner +5/GND en distintas palancas de una sola221-415: están unidas internamente.
- Cobre flexible0,75 mm² y22 AWG(~0,33 mm²) dentro de rango0,14–4 mm² de221-415 sin puntera; no implica que cable/borna del lote sean auténticos.
- M2,5 coincide nominalmente con agujero PiØ2,75; altura libre y resistencia mecánica requieren el montaje concreto. El sensor no tiene taladros publicados en el manual, por tanto el kit no confirma su soporte.
- No aparecen pruebas realizadas del prototipo en estos cinco directorios. Las tablas de «qué comprobar» son planes.

## Inventario exacto

La lista siguiente procede del inventario de revisión; el inventario canónico completo está en `../inventario_archivos.json`. Las páginas indicadas son páginas PDF físicas desde1.

| Archivo | Lectura | Páginas |
|---|---|---|
| componentes/cable-2x0-75-rojo-negro-10m/enlaces.md | Markdown íntegro | — |
| componentes/cable-2x0-75-rojo-negro-10m/README.md | Markdown íntegro | — |
| componentes/cable-2x0-75-rojo-negro-10m/datasheets/Construction_Products_Regulations_and_Cable_Industry.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 3 |
| componentes/cable-2x0-75-rojo-negro-10m/datasheets/T11.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 1 |
| componentes/cable-2x0-75-rojo-negro-10m/datasheets/TD06EN-current-carrying-capacity-flexible-copper-cables-and-wires.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 3 |
| componentes/separadores-nylon-m2-5/enlaces.md | Markdown íntegro | — |
| componentes/separadores-nylon-m2-5/README.md | Markdown íntegro | — |
| componentes/separadores-nylon-m2-5/datasheets/0900766b816cd289.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 2 |
| componentes/separadores-nylon-m2-5/datasheets/LOCTITE-THREADLOCKER-BLUE-242-en_US.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 4 |
| componentes/separadores-nylon-m2-5/datasheets/Polymershapes_Ensigner_DataSheet-TECAMID-66-natural.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 1 |
| componentes/separadores-nylon-m2-5/datasheets/RP-008281-DS-1-hat-plus-specification.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 21 |
| componentes/separadores-nylon-m2-5/datasheets/ULTRAMID-A3K-product-information-2026-09.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 2 |
| componentes/tornilleria-inox-m3-m6/enlaces.md | Markdown íntegro | — |
| componentes/tornilleria-inox-m3-m6/README.md | Markdown íntegro | — |
| componentes/tornilleria-inox-m3-m6/datasheets/A700000007879576.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 5 |
| componentes/tornilleria-inox-m3-m6/datasheets/A700000007879596.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 4 |
| componentes/tornilleria-inox-m3-m6/datasheets/A700000008786735.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 4 |
| componentes/tornilleria-inox-m3-m6/datasheets/Mechanical_Properties_Metric_Fasteners_Jan_2016.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 2 |
| componentes/tornilleria-inox-m3-m6/datasheets/NORD-LOCK_Washers_Catalogue.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 16 |
| componentes/tornilleria-inox-m3-m6/datasheets/Property_Classes_Screws_Nuts.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 1 |
| componentes/tornilleria-inox-m3-m6/datasheets/Torque-Tension-Relationship-for-Metric-Stainless-Steel-Fasteners-A2-and-A4-70-Feb-2016.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 1 |
| componentes/pasacables-goma/enlaces.md | Markdown íntegro | — |
| componentes/pasacables-goma/README.md | Markdown íntegro | — |
| componentes/wago-221-surtido/enlaces.md | Markdown íntegro | — |
| componentes/wago-221-surtido/README.md | Markdown íntegro | — |
| componentes/wago-221-surtido/datasheets/WAGO_221-415de.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 7 |
| componentes/wago-221-surtido/datasheets/WAGO_221-415_hoja-de-datos-zh.pdf | Texto íntegro extraído y leído; revisión gráfica selectiva descrita arriba | 8 |
