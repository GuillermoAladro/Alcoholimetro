# Auditoría auxiliar de red, fuente, fusibles y tierra — Auditor 6-A

Nota de trazabilidad: los hashes de las tablas auxiliares describen el checkout Windows y pueden diferir por CRLF/LF. El inventario canónico del paquete (`../inventario_archivos.json`) identifica los objetos Git del commit auditado. Las referencias de líneas corresponden a esa base. Las extracciones temporales no se distribuyen; los documentos originales siguen en el repositorio.

Fecha: 21 de octubre de 2026. Revisión base: `84be97669a9efec43e79b3dadc4af5e87458c41a` de `GuillermoAladro/Alcoholimetro`. Informe auxiliar para integrar en la auditoría general; no modifica las instrucciones originales.

## Dictamen y alcance

**No procede aprobar la energización de la máquina a partir de la documentación actual.** La arquitectura C14 → fusible → corte bipolar → fuente aislada de 5 V, con unión de protección de las partes metálicas, es técnicamente viable. Sin embargo, hay una asignación de bornes de la fuente peligrosamente invertida en una ficha, un cortocircuito L–N dibujado en otra, una identificación del interruptor no resuelta y falta coordinación de las protecciones de 5 V. El ajuste a 5,20 V tampoco garantiza el margen de los equipos conectados.

Esta es una auditoría documental y de cálculo. No se han montado componentes físicos ni medido continuidad, aislamiento, corriente de fuga, temperatura, rizado, arranque, interrupción de cortocircuitos o protección de tierra del equipo real. Los resultados no son una certificación del producto ni una afirmación de que la unidad comprada funcione. Los errores documentales identificados sí son comprobables sin disponer de esa unidad.

Se han procesado íntegros los textos de `MONTAJE-GENERAL.md` y las carpetas asignadas: fuente Mean Well, módulo C14, fusibles, cordón Schuko-C13, manguera H05VV-F, ojales, arandelas dentadas, espárragos, faston y crimpadora. El inventario al final distingue extracción completa de revisión técnica focalizada. Las 382 páginas de PDF no se han inspeccionado todas visualmente; se han renderizado y comprobado las páginas técnicas decisivas de la fuente. Ninguna especificación de un producto equivalente se atribuye automáticamente al producto de Amazon.

## R01 — Crítico: dos órdenes incompatibles de bornes de la LRS-50-5

**Evidencia:** `componentes/meanwell-lrs-50-5/README.md:74`, y reiteraciones en las líneas 113, 191 y 263, sitúan −V y +V en 1 y 2, y AC/L y AC/N en 4 y 5. `MONTAJE-GENERAL.md:35`, 37, 52, 53, 72 y 73 usa el orden opuesto, que es el correcto. La tabla «Terminal Pin No. Assignment» del datasheet original, página 4, da inequívocamente:

| Borne de la LRS-50-5 | Función correcta |
|---|---|
| 1 | AC/L |
| 2 | AC/N |
| 3 | FG, tierra de protección de la fuente |
| 4 | DC −V |
| 5 | DC +V |

**Consecuencia:** quien ejecute el orden de la ficha de componente puede aplicar 230 V a bornes destinados al circuito de baja tensión. No es una discrepancia cosmética ni se resuelve eligiendo una interpretación visual del lado de observación.

**Solución:** una sola tabla canónica basada en el datasheet y en los marcados de la unidad real; eliminar/reemplazar todas las tablas y frases contradictorias; mostrar un dibujo del fabricante con referencia clara de orientación. Un comprobador de conexiones debe rechazar cualquier red AC conectada a 4/5 y cualquier carga DC conectada a 1/2. La correspondencia con la serigrafía física se verifica antes de alimentar.

**Cierre:** documentación sin contradicciones más verificación del número y función de cada terminal de la unidad real. Fuente primaria: [Mean Well LRS-50, página 4](https://www.meanwell.com/Upload/PDF/LRS-50/LRS-50-SPEC.PDF).

## R02 — Crítico: el dibujo ASCII del módulo C14 une L y N

**Evidencia:** `componentes/modulo-c14-fusible-interruptor/README.md:238–239` contiene `L? ───┬──` y debajo `N? ───┴──`; ambas líneas quedan conectadas gráficamente antes del fusible dibujado.

**Consecuencia:** leído como esquema eléctrico, representa un cortocircuito entre los dos conductores activos antes de la protección local. Esto es un fallo del dibujo, no la constatación de que el módulo físico esté cortocircuitado. El esquema general no debe heredar esta unión.

**Solución:** dibujar dos redes independientes; cualquier cruce sin unión debe representarse de modo inequívoco. Definir nombres distintos para los dos conductores activos del C14 y para las dos salidas del interruptor; PE será una tercera red independiente. El fusible se coloca en el conductor previsto por el módulo documentado.

**Cierre:** revisión de conectividad del dibujo y matriz de continuidad de módulo, fusible e interruptor reales, todo sin conexión a red.

## R03 — Alto: identificación incompleta del interruptor y de la lámpara

**Evidencia:** `MONTAJE-GENERAL.md:62` describe dos pares de contactos independientes y «la luz en otros terminales»; si el interruptor tiene cuatro terminales, esa descripción no cabe. `componentes/modulo-c14-fusible-interruptor/README.md:206` clasifica cuatro terminales con luz como SPST con lámpara independiente «lo habitual» y declara no haber visto documentado el DPST iluminado de cuatro terminales.

Sí existen interruptores de **cuatro terminales, DPST e iluminación de neón dependiente**, con lámpara conectada internamente entre terminales compartidos con los contactos. Un ejemplo primario comprobado es [SCI R13-117](https://www.sci.com.tw/product/r13-117-series-rocker-switch/), cuya tabla declara «4P DPST ON-OFF(NEON dependent)». Esto demuestra la posibilidad de la topología; no identifica el módulo comprado.

**Consecuencia:** inferir el tipo por contar terminales o por presencia de luz puede conducir a puentes erróneos o a creer que se cortan ambos conductores cuando sólo se corta uno. Un neón puede aparecer abierto con un polímetro porque éste no alcanza su tensión de encendido: OL no prueba ausencia ni avería de la lámpara.

**Solución:** exigir referencia y esquema del módulo exacto o sustituirlo por una entrada con corte bipolar documentado. Sin tensión, identificar los dos pares de contactos mecánicos por sus estados ON/OFF, comprobar la independencia de ambos pares, mapear PE y el portafusibles con y sin cartucho. No improvisar una prueba a 230 V para identificar la lámpara. Anotar el mapa encontrado, marcado físico y orientación de vista.

El Schuko es reversible; por ello los nombres de «L» y «N» internos no garantizan qué conductor de la toma es fase. El corte bipolar reduce la posibilidad de que la fuente permanezca unida a la fase en OFF, pero **OFF no sustituye desconectar el cordón para intervenir**. Un solo fusible no implica automáticamente incumplimiento ni obliga, sin seleccionar antes la norma de producto, a montar dos fusibles independientes. La idoneidad del conjunto se determina con su esquema y norma aplicable.

**Cierre:** topología demostrada y documentación coherente. No basta «aceptar el riesgo» de un módulo desconocido, posibilidad actualmente mencionada en `MONTAJE-GENERAL.md:64`.

## R04 — Alto: 5,20 V deja margen insuficiente; rizado a carga baja no acotado

**Evidencia:** `MONTAJE-GENERAL.md:37` y 149 fijan 5,20 V, y el segundo punto indica ajuste sin carga en bornes 4/5. La figura 1, según la revisión cruzada del auditor principal, indica ajuste midiendo en la Pi: ambas instrucciones no son equivalentes. Compensar una caída en el cable de la Pi puede elevar la tensión en el resto de ramas y elevarla adicionalmente cuando cae el consumo de la Pi.

La página 2 del datasheet oficial de la LRS-50-5 especifica regulación de línea ±0,5 %, de carga ±1 %, coeficiente térmico ±0,03 %/°C en 0–50 °C, rizado nominal 80 mVpp bajo sus condiciones de medida y protección de sobretensión entre 5,9 y 7,3 V. **La nota 7 de la edición 2025-04-07 dice que las salidas 3,3/5 V pueden exceder el rizado especificado a 0–50 % de carga por funcionamiento en ráfagas.** Esa nota se comprobó visualmente en la página 2; no puede suponerse que desapareció de la edición actual.

Ejemplo conservador de presupuesto de variación, ajustando a 25 °C y evaluando hasta 50 °C, sin rizado ni transitorios:

`5,20 × [1 + 0,005 + 0,010 + (25 × 0,0003)] = 5,317 V`.

Se ha aplicado el porcentaje al ajuste de 5,20 V como aproximación conservadora. Si se aplica al nominal de 5 V, resulta 5,3125 V: la conclusión no cambia. **No se suma otra vez el ±2 % de tolerancia global**, porque la nota 3 del fabricante ya incluye ajuste de fábrica, regulación de línea y de carga. Tampoco se extrapola el coeficiente fuera de 0–50 °C.

El ejemplo no predice que cada fuente alcance esa tensión; demuestra que «ajustar a 5,20 y no superar 5,25 durante el ajuste» no constituye una garantía. En particular, no protege una carga cuyo máximo sea 5,30 V. La protección OVP de la fuente es demasiado alta para actuar como protección de precisión de esa carga.

**Solución:** suprimir el ajuste en la Pi como referencia maestra; definir tensión en bornes de salida y comprobar los extremos en todas las cargas. Un valor inicial de 5,10 V es un candidato de ensayo con más margen, no una corrección aprobada por sí sola: hay que comprobar tensión mínima de la Pi y del resto, caída de cable, carga variable, rizado y transitorios. Si no hay intervalo común que cumpla todos los equipos, usar una alimentación/regulación con envolvente documentada y protección de sobretensión apropiada para cada rama sensible. No afirmar regulación remota inexistente.

**Cierre:** tabla de límites de cada carga y medidas con osciloscopio en carga mínima/máxima y arranques, incluyendo baja carga de la LRS, con márgenes documentados. Fuente primaria: [Mean Well LRS-50, página 2 y notas 3, 7](https://www.meanwell.com/Upload/PDF/LRS-50/LRS-50-SPEC.PDF).

## R05 — Alto: protección insuficiente del troncal y de las ramas de 5 V

**Evidencia:** `MONTAJE-GENERAL.md:72` reconoce troncal de 0,75 mm², ausencia de fusibles/PTC y umbral de fuente 10,6–14,4 A; la línea 240 propone para diseño A fusibles Pi 3 A, Solo 3 A, pantalla 3 A y sensor 2 A.

La LRS-50-5 es de 50 W, 10 A nominales. El fabricante limita tanto potencia como corriente; a 5,20 V, 50 W equivalen a **9,615 A** de carga máxima continua, aunque la cifra nominal de corriente sea 10 A. El rango de sobrecarga declarado, 110–150 % de la potencia nominal, equivale indicativamente a 10,58–14,42 A a 5,20 V. **Es el rango de disparo de una protección de tipo hiccup, no una corriente continua garantizada ni un límite de precisión.**

Un defecto parcial de varios amperios puede no disparar la fuente y calentar el conductor, un conector USB o un terminal pequeño. El fusible de red T2,5 A no protege selectivamente estos circuitos. Un cortocircuito que hace entrar la fuente en hiccup puede impedir que un fusible de rama convencional acumule la energía necesaria para abrirlo: fusible más grande no equivale a protección mejor y la apertura no puede darse por garantizada.

**Solución propuesta:** distribución DC protegida con límite de corriente por rama y protección del troncal, seleccionada a partir de corrientes reales, picos de arranque, curva tiempo-corriente, capacidad de los contactos y cableado. Una eFuse o interruptor electrónico de distribución puede ofrecer un umbral independiente del régimen hiccup, pero requiere elección de componente y validación; «añadir una eFuse» no es una especificación completa. Si se usan fusibles/PTC, documentar su coordinación y el estado seguro después de un defecto. El calibre debe cumplir carga admisible de los conductores y conectores, además de evitar disparos en uso normal.

Los cuatro fusibles del diseño A son una mejora de arquitectura, pero sus cifras no pueden aprobarse sin conocer las corrientes de cada carga y los límites de sus conectores. Que la suma de calibres sea 11 A no demuestra por sí solo sobrecarga ni invalida la distribución; el presupuesto de potencia real y la coordinación son los criterios relevantes.

**Cierre:** presupuesto de carga ≤50 W y corriente admisible, elección concreta de protecciones y demostración segura de respuesta a fallos en una fuente de laboratorio limitada o banco preparado para ello. No realizar cortos improvisados sobre red de 230 V.

## R06 — Alto: el fusible de red no está validado frente a arranque y fallos

**Evidencia:** `componentes/fusibles-ceramicos-5x20-t2-5a/README.md:26`, 160–185 distingue correctamente que los 1,5 A²s son una hipótesis: el datasheet de la fuente aporta 45 A típicos de arranque en frío a 230 V, pero no anchura del pulso ni capacidad del condensador. El modelo de 205 µF no es una medición. `componentes/modulo-c14-fusible-interruptor/README.md:385` concluye «cumple» a partir de ese valor no verificado y de datos de un Littelfuse de referencia que no identifican el cartucho comprado.

**Consecuencia:** no se puede asegurar vida de pulsos ni ausencia de aperturas intempestivas del T2,5 A real. Tampoco los datos típicos de corriente de entrada equivalen a máximos garantizados. El poder de corte de un equivalente de 1500 A no demuestra el del cartucho genérico ni la coordinación con la instalación donde se usará.

**Solución:** mantener T2,5 A únicamente como selección provisional de diseño, hasta elegir referencia trazable T2,5AH250V de fabricante con curva y poder de corte adecuados, comprobar compatibilidad con portafusibles y obtener recomendación de fabricante o evidencia de inrush/rearranque bajo condiciones definidas. Verificar que la capacidad de interrupción y la protección aguas arriba cubren la corriente de defecto prevista en el punto de conexión. No inferir el poder de corte sólo del cuerpo cerámico ni sustituirlo por un fusible de 10 A.

**Cierre:** referencia exacta, datos de coordinación y revisión de selección. La auditoría no exige doble fusible universal ni deduce un calibre menor óptimo de un pulso hipotético.

## R07 — Alto: cadena PE y uniones metálicas pendientes de validar

**Evidencia:** `MONTAJE-GENERAL.md:54`, 66 y 188; `componentes/terminales-ojal-m4/README.md:3`, 8, 32. La propuesta usa PE desde C14 a espárrago M4, FG de fuente y varias partes metálicas, con ojales apilados; asume que soldaduras proporcionan unión al techo/separador/bandeja. Hay paneles/cajón móviles y espesor/material de chapa todavía inciertos (`MONTAJE-GENERAL.md:190`).

**Solución:** PE nunca se fusiblea ni conmuta. Diseñar una conexión de protección verificable desde la entrada a la fuente y a cada parte metálica accesible que requiera unión; no depender de bisagras, pintura, tornillos de cierre ni conectores de señal. Las partes móviles necesitan latiguillos flexibles, protección contra roce y radio de curvatura adecuado durante todo su recorrido. La unión soldada debe calificarse para material, espesor y proceso reales, y comprobarse; «soldado» por sí solo no prueba continuidad segura.

Un espárrago dedicado puede ser una solución válida. Lo que no está validado es la pila concreta de cinco ojales y su sistema de retención, material, par y resistencia de soldadura. No se ha encontrado fundamento para imponer aquí un máximo universal de dos o tres ojales. Es preferible una distribución de tierra dimensionada y documentada para el número y sección de conductores, o una unión de espárrago ensayada y definida por ingeniería. No transferir a esta unión el par de un tornillo de otra pieza.

La mención de 2,5/4 mm² en ITC-BT-19 corresponde a un contexto de instalaciones de baja tensión; **no basta para declarar incumplimiento de un conductor interno de aparato de 1,5 mm² ni para prescribir automáticamente 2,5 mm²**. Elegir norma de seguridad de producto y diseño, sección y ensayo coherentes con esa norma. Si cambia la sección, deben cambiar los terminales y la herramienta cuando sus rangos lo exijan.

Los posibles caminos alternativos GND–chasis por conectores de antena/HDMI/USB pueden enmascarar un PE ausente. Un ensayo de continuidad con corriente alta mal planteado podría hacer circularla por placas o cables de señal. Se debe comprobar primero el camino PE intencionado con los circuitos sensibles aislados de los caminos de ensayo, y luego comprobar el equipo ensamblado con un procedimiento definido. Un pitido de polímetro no valida una unión de protección. Una meta de 0,1 Ω en el equipo puede ser un criterio de proyecto, con resistencia del cordón y contactos contabilizada aparte; no se presenta como límite normativo universal para todo producto.

**Cierre:** plano de PE completo, materiales y pares definidos, ensayo con procedimiento e instrumento apropiados y prueba mecánica de los tramos móviles. El manual de Mean Well exige FG unido a tierra: [manual de fuentes cerradas](https://www.meanwell.com/Upload/PDF/Enclosed_Type_EN.pdf), advertencias, página 5.

## R08 — Alto: terminales, cable y herramienta no constituyen un sistema cualificado

**Evidencia:** las fichas de `kit-faston-aislados`, `terminales-ojal-m4` y `crimpadora-y-punteras` reconocen que son kits genéricos y recurren a productos equivalentes. Unas tenazas para punteras tubulares no sustituyen una matriz para terminales preaislados Faston/ojal. La ficha de ojales advierte a partir de línea 32 que el color rojo no significa el mismo rango en todas las marcas. El PDF CIMCO de una página, de nombre largo en `kit-faston-aislados/datasheets/`, muestra rojo 0,5–1 mm² y azul 1,5–2,5 mm²: apoya que no se puede asumir el rango por color.

**Solución:** seleccionar combinaciones terminal–conductor–herramienta/matriz compatibles; no cortar hebras para introducir un cable ni estañar bajo una conexión que no lo permita. Para Faston verificar ancho **y espesor** de lengüeta, retención, aislamiento y temperatura, no sólo 2,8/4,8/6,3 mm de ancho. Un kit que incluye la anchura correcta puede tener el espesor incompatible. Para los bornes de la fuente aplicar longitud de pelado y par del fabricante, no un par de otro accesorio.

El manual de Mean Well da bornes M3.5 y 8–10 kgf·cm para LRS-035/050/075/100/150F/200, equivalentes a aproximadamente **0,785–0,981 N·m**. Es el par del tornillo del borne eléctrico, no el de la fijación M3 del chasis. Confirmar la revisión y fila aplicables a la unidad real.

La tabla orientativa de cables del manual asocia 0,75 mm²/AWG18 con 6 A y propone reducción al 80 % en grupos de cinco o más conductores; no es una tabla universal de ampacidad que sustituya temperatura, agrupación, aislamiento y montaje del equipo. La manguera 3G1,5 tiene que estar identificada, con clase de conductor y aislamiento trazables. Quitar su cubierta cambia las condiciones de uso de los conductores; hay que conservar separación, protección y sujeción que corresponden al cableado interno.

**Cierre:** lista concreta de terminales y herramienta aprobada por sus fabricantes, registros de montaje y verificación mecánica/eléctrica representativa. Cinco muestras que resistan un tirón manual no certifican una combinación inadecuada.

## R09 — Alto: profundidad de tornillos y fijación de la fuente

**Evidencia adicional fuera de las carpetas asignadas:** `componentes/tornilleria-inox-m3-m6/README.md:187` y 197 reproduce «3 mm laterales, 5 mm abajo», marcado como sin confirmar; en la página 4 del datasheet LRS el plano de la base de 99 × 82 mm lleva la llamada **2-M3 L=3.0**, mientras la vista lateral de 99 × 30 mm lleva **2-M3 L=5**. La asignación de la guía parece invertida. Se comprobó el dibujo renderizado; una extracción de texto sin vistas puede perder esta asociación.

**Consecuencia:** un tornillo demasiado profundo puede invadir partes internas de la fuente. El largo total del tornillo no es la penetración: debe restarse chapa, arandelas/separadores y tolerancias efectivas.

**Solución:** elegir el patrón exacto de montaje a partir del dibujo y de la unidad; no usar la regla invertida de la guía. Para la base indicada, tratar 3,0 mm como límite indicado por el fabricante y no suponer 5 mm. Diseñar longitud y pila con margen y tolerancias reales. Confirmar el significado de la cota y el patrón ante cualquier duda antes del montaje. El par M3 de 0,5 N·m recogido en la ficha de tornillería procede de un módulo Schurter diferente y no cualifica por sí solo los tornillos de fijación de la LRS.

**Cierre:** detalle de fijación y longitud/penetración aprobado, correspondiente al patrón utilizado; inspección de montaje sin invadir el interior.

## R10 — Medio/alto: envolvente, líquido, ventilación y temperatura no están cerrados

La fuente con carcasa perforada conserva bornes de red accesibles si no existe una barrera interna apropiada. Mantener separación y retención del mazo de 230 V, cubrir terminales y evitar que un conductor soltado alcance baja tensión o metal accesible. Instalar pasacables y alivio de tracción; fijación del C14 y ventana deben corresponder al espesor y geometría reales. La figura 4 dice chapa de 1,5 mm, mientras el texto mantiene el espesor pendiente: es necesario unificar la mecánica antes de cortar, soldar y seleccionar clips.

El equipo recibe aire exhalado y potencial condensación. Evitar un camino de líquidos desde boca/tubo/sensor hasta fuente, regletas o electrónica; el manual de la fuente excluye agua/alta humedad. No asumir que una prueba de fuente fuera del cajón represente el equipo cerrado.

En la curva de reducción de potencia de la LRS-50 (página 3), a 230 V y orientación horizontal se admite 100 % hasta 50 °C y se reduce hasta 60 % a 70 °C; la curva inferior correspondiente a 100 V para 5 V empieza antes. Esto no autoriza automáticamente 70 °C dentro del aparato: el sensor y otros componentes pueden imponer límites inferiores. El espacio de 10–15 cm que el manual menciona está asociado a una fuente de calor próxima, no es un requisito general de 15 cm alrededor de toda cara que deba inventarse para esta caja.

**Cierre:** ensayo térmico del aparato cerrado en peor carga/ambiente previstos, protección frente a líquidos y verificación de separación y sujeción. La colocación física debe basarse en la envolvente final elegida.

## Montaje lógico corregido propuesto

Este esquema es una propuesta de arquitectura y exige identificar el módulo exacto y dimensionar protecciones; no prescribe puentes por posición física de un componente desconocido.

1. C13 → C14 documentado. Los dos conductores activos permanecen independientes. Uno atraviesa el fusible definido en el esquema del módulo. Ambos atraviesan los dos polos del interruptor documentado; sus salidas llegan respectivamente a bornes 1 y 2 de LRS.
2. PE de C14 llega directamente al sistema de distribución de tierra, sin fusible ni interruptor. De allí, conexiones de protección definidas a FG (borne 3) y a las partes metálicas que las requieren.
3. Borne 5 (+V) → protección adecuada del troncal → reparto positivo → protección dimensionada de cada rama → carga. Borne 4 (−V) → reparto de retornos → retorno de cada carga. Los retornos y el troncal soportan la suma máxima simultánea de corrientes.
4. Las uniones entre DC GND y chasis se deciden a nivel del equipo y se documentan junto con USB/HDMI/antena, evitando afirmar que −V flota sólo porque la fuente lo permite o se montan separadores de nylon.
5. Valor inicial de tensión sujeto al presupuesto común de las cargas; se mide la envolvente completa en los puntos de carga. No elevar la fuente para compensar sin límite una sola rama.

## Secuencia de verificación necesaria para cerrar la auditoría

| Etapa | Qué se demuestra | Estado de esta auditoría |
|---|---|---|
| Documental | Tabla única de pines, cero uniones L–N, selección de diseño y componentes | Fallos identificados; propuesta redactada |
| Sin tensión | Mapa real C14/interruptor/fusible, separación entre redes, PE continuo, crimpados y fijaciones | Pendiente de unidad física |
| Protección y aislamiento | Seguridad de PE, aislamiento y fugas según norma de producto/procedimiento | Pendiente de banco e instrumentación adecuados |
| Fuente sin cargas y con cargas de prueba | Tensión, regulación, arranque, rizado y respuesta a cargas | Cálculo de margen realizado; medidas pendientes |
| Distribución DC | Límites por rama y troncal, respuesta a fallos controlados y recuperación | Ausencia de coordinación detectada; diseño concreto pendiente |
| Aparato ensamblado | Temperatura, caída de tensión, consumo simultáneo, no reinicios, movimiento y condensación | Pendiente |

La prueba con 230 V exige que la persona que la realiza pueda preparar el banco, conectar las sondas adecuadamente y aplicar el procedimiento de seguridad del producto. No se necesita provocar un corto de red para verificar los errores documentales aquí descritos. Los ensayos de aislamiento/PE deben diseñarse para no dañar electrónica a través de caminos alternativos y ejecutarse con los valores que correspondan al producto, no valores normativos elegidos por analogía.

## Fuentes primarias verificadas en línea

- [Mean Well LRS-50, datasheet oficial, revisión 2025-04-07](https://www.meanwell.com/Upload/PDF/LRS-50/LRS-50-SPEC.PDF): página 2 especificaciones/notas, página 3 curvas, página 4 bornes y montaje. Contrastado con la copia local `componentes/meanwell-lrs-50-5/datasheets/MEAN_WELL_LRS-50_DATA_SHEET.pdf`; páginas 2–4 revisadas también como imagen.
- [Mean Well, instalación de fuentes cerradas](https://www.meanwell.com/Upload/PDF/Enclosed_Type_EN.pdf): pares de terminales, cables, tierra, condiciones ambientales y advertencias. Se leyeron las nueve páginas extraídas de la copia local; no implica aplicar a todas las unidades la revisión sin comprobar modelo/fila.
- [SCI R13-117](https://www.sci.com.tw/product/r13-117-series-rocker-switch/): ejemplo documentado de interruptor iluminado DPST con cuatro terminales. Se usa sólo para refutar una regla de identificación insuficiente, no para sustituir la ficha del C14 comprado.

## Cobertura documental y límites de lectura

La extracción textual ha recorrido cada página de todos los PDF de las carpetas asignadas y ha guardado texto, número de páginas y hash SHA-256. El PDF Faston de ruta larga se leyó desde el objeto Git por `git show`, evitando el límite de rutas de Windows; el archivo existe en el repositorio. Se procesaron **86 archivos y 382 páginas PDF**. El inventario siguiente es de archivos procesados íntegramente y técnicamente revisados de forma focalizada; no afirma una inspección visual exhaustiva de las 382 páginas ni una verificación de todas las referencias bibliográficas que contienen. No hay archivos de estas carpetas declarados ilegibles por el extractor. La exactitud de tablas y dibujos no se deduce sólo de la extracción de texto: las páginas decisivas de la fuente se comprobaron visualmente.

Se examinaron adicionalmente líneas relevantes de `componentes/tornilleria-inox-m3-m6/README.md`; no se incorpora esa carpeta a la cuenta de 86 porque pertenece a otro alcance de la auditoría general. Las figuras 1 y 4 fueron contrastadas por el auditor principal y sus discrepancias comunicadas a este informe.

| Archivo | Páginas PDF | SHA-256 |
|---|---:|---|
| MONTAJE-GENERAL.md | 0 | 52ce524cc4d6b87ab7d3d00e074734443c4f1a331ef092ff7602cbcd88fc730d |
| componentes/meanwell-lrs-50-5/enlaces.md | 0 | 2d8b8c5293b2766bc6133e701cd1eb0f4b2d3d1b27443f8585ed7302dfe1654c |
| componentes/meanwell-lrs-50-5/README.md | 0 | 330f5433d1776f1b4be166b690a6b5c109ddc999a11f95d435df067d7138fac4 |
| componentes/meanwell-lrs-50-5/datasheets/0900766b815c75ea.pdf | 4 | fb2b0406e1d9d7171ef2b5eac5e8e2c8d816a0a7cf24895fc194ccd6de3e9c03 |
| componentes/meanwell-lrs-50-5/datasheets/Enclosed_Power_Supply_Installation_Manual.pdf | 9 | 5a15bd81bd18092af9df2554f0b69b7ae40ec8ce0679b88291832017f00e7630 |
| componentes/meanwell-lrs-50-5/datasheets/Enclosed_Type_EN.pdf | 9 | 3e40e59123e5c23d498a468e851f89e5a9d89d99fdbdc82fe8c19348294e4940 |
| componentes/meanwell-lrs-50-5/datasheets/LRS-50-5.pdf | 5 | cfba7fcaad5589738fd1b2957b3caf3f213d77018c15cfa0452f94eb1ed3e97f |
| componentes/meanwell-lrs-50-5/datasheets/LRS-50-SPEC.pdf | 4 | 4ff46f63eab7b5275359f1d65f409aebebb6ccac0ab5c161e557557d474c8e6c |
| componentes/meanwell-lrs-50-5/datasheets/MEAN_WELL_LRS-50_CE_DECLARATION.pdf | 1 | 8d2ef8bcea9bb62121922e88a360de2d59e65d335b7b70fc8c94ade86538406b |
| componentes/meanwell-lrs-50-5/datasheets/MEAN_WELL_LRS-50_DATA_SHEET.pdf | 4 | 68c326d7ff1b929d2b79a53d52a14750d37bb98687a5317637a20477df48f96b |
| componentes/modulo-c14-fusible-interruptor/enlaces.md | 0 | 873a3cf22998f37720735402ef89c4cd86fdf7fa5c2bf866c42971f73899cdc3 |
| componentes/modulo-c14-fusible-interruptor/README.md | 0 | 6cebb653529f3a2d24daa19512d5e10a6b9f297cdef0eb3f36cf2c150071f89b |
| componentes/modulo-c14-fusible-interruptor/datasheets/0900766b815867ba.pdf | 2 | 303a8f3a92c86ceac38274b85715dc24dd5d4553f42edde9b07e71d5bd73adde |
| componentes/modulo-c14-fusible-interruptor/datasheets/2351262.pdf | 5 | c03ee7bdd4ca0a4b4a8ddb36f0f686e7718298e77fc1f4f36830d476593e8e63 |
| componentes/modulo-c14-fusible-interruptor/datasheets/625732.pdf | 2 | b940404d70c63f1ebf21ee5310d151c6ff520713ea498a550df1f609c3b80eaf |
| componentes/modulo-c14-fusible-interruptor/datasheets/A700000008623303.pdf | 5 | 1d9ad67f6ea1967927025005cab268102614f75fff10d7e2589eae5670454270 |
| componentes/modulo-c14-fusible-interruptor/datasheets/ENEC-fraudulent-license-UL-Demko-2022-08-10.pdf | 1 | a922e3d37dc22a0d51f9a4256736a40af25cadebc04087406dab37d40786030d |
| componentes/fusibles-ceramicos-5x20-t2-5a/enlaces.md | 0 | ef1ff1bd122fe13e390aa684019ec3626acd2048fe09ff3910cbec4ca1251423 |
| componentes/fusibles-ceramicos-5x20-t2-5a/README.md | 0 | 33e9675bda16951099e5142cea0a4b842523e172b4f83c58de6b89433a20ad84 |
| componentes/fusibles-ceramicos-5x20-t2-5a/datasheets/523987_da_ml_01.pdf | 1 | 0cf724f51242c8958a1004f89fa50209aa056d8c1b1547e3a48eee8a818c4561 |
| componentes/fusibles-ceramicos-5x20-t2-5a/datasheets/criteria_for_correct_fuse_selection.pdf | 4 | 2dc92bc38cd9dcf16a53e14be75d49c9974bdcf9d6430bbe092d3a9b23256a5d |
| componentes/fusibles-ceramicos-5x20-t2-5a/datasheets/Curvas_de_disparo_Acti9.PDF | 2 | 536eda839f032041852ca410e0766ccd9916180c8eb4f66dac115c722a2be670 |
| componentes/fusibles-ceramicos-5x20-t2-5a/datasheets/eaton-s505-ferrule-time-delay-ceramic-tube-fuses-data-sheet.pdf | 4 | e20020303c13c11bad30a5e59868f028a7f48c25ed3199640bc3a6c1f358c663 |
| componentes/fusibles-ceramicos-5x20-t2-5a/datasheets/Fuseology_Design_Guide.pdf | 9 | a7cbc7b271ced25865d2a8eddf410aafaace715dd5d826e5e6e107e84211661b |
| componentes/fusibles-ceramicos-5x20-t2-5a/datasheets/SPT_5x20.pdf | 4 | 95063c4cf2ec2a40985b5661dbf54893b8e69b491be5417c7448b06219cebc52 |
| componentes/cable-schuko-c13-2m/enlaces.md | 0 | 4c06b879202bc9a87c30f9d90d8befbcf22ad64fa1ac5cb601c00c70f542323c |
| componentes/cable-schuko-c13-2m/README.md | 0 | 57d1600ecbe6d37edea502de8bde63bd45884ef3645c5947766416dd5162cf42 |
| componentes/cable-schuko-c13-2m/datasheets/3179146.pdf | 1 | dd98de21db4de902ce837005048ae7b0fef8940c16ee38a2f54d929af3e03653 |
| componentes/cable-schuko-c13-2m/datasheets/A700000015073926.pdf | 5 | da8de165ced8dbbfd97f03fd9d319a2d0f6e57942df2ec9a541c72f9126c9b4e |
| componentes/cable-schuko-c13-2m/datasheets/intl-cord-set-config-darker.pdf | 2 | dbb13a41a9c6723db0e223b9c2fb5d8d998b066feb3dcd29689567441d997a46 |
| componentes/cable-schuko-c13-2m/datasheets/ITC-BT-43.pdf | 10 | a1049fed09c3accf404d24f80e0beb48dfe4f6df18ae7789f8732255917215df |
| componentes/cable-schuko-c13-2m/datasheets/preview_iec60320-1_ed3.0_en.pdf | 9 | b2352f98b4b3834391d7e415743bcff6ff806a9ef831df6385f9a18c6bd9d0d5 |
| componentes/cable-schuko-c13-2m/datasheets/typ_6600-3.pdf | 4 | 98f9f451e3641e0b8f35a40401f6467bf74a21bd15906b2c9d632b0e74c92f08 |
| componentes/cable-h05vv-f-3g1-5-5m/enlaces.md | 0 | 9836ef1f1def14a2540cb3fc3246bd438f6b750249a18026d0b0957da299446b |
| componentes/cable-h05vv-f-3g1-5-5m/README.md | 0 | e7058630b996bc06f021744c10c8e2f40b0cadcc2ca92b403447717015a873e7 |
| componentes/cable-h05vv-f-3g1-5-5m/datasheets/adatlap-1152275-toemlos-vezetek-h05vv-f-3-g-15-mm-fekete-faber-kabel-030020-meteraru.pdf | 2 | 9816a24e42029215554d3ab7b12c155eb502589481c8d9c5ca5f2b2b2be2b4ca |
| componentes/cable-h05vv-f-3g1-5-5m/datasheets/EU_declaration_of_conformity_H_05VV-F.pdf | 1 | 5d9cdd698c51b65a07c18c54c80d5f6044de50cb360181f2eac77c7125db0f86 |
| componentes/cable-h05vv-f-3g1-5-5m/datasheets/f0a2dcc6c9bf486fbe1ae684bc0f9c6b.pdf | 1 | 955e93c007f4261248152bad44e7bc9159fbf6c26a61958b79dd38676b41949b |
| componentes/cable-h05vv-f-3g1-5-5m/datasheets/H05VV-F.pdf | 2 | acda9e4f69063719142b3c18e560176a05b38e559e2a73678bf55a46728ebf83 |
| componentes/cable-h05vv-f-3g1-5-5m/datasheets/HD_308_S2-2001.pdf | 5 | 9569c6ea04bd53c89012e50b05a4414e8f3a73a99ea694c4a5dfa3111e1442c4 |
| componentes/cable-h05vv-f-3g1-5-5m/datasheets/OznurKabloWeb-ENG-Catalogue-18.pdf | 1 | 712dcd195a02c87d745548719da8f9a2038664ac09ed717f2d3d863caa8f496e |
| componentes/cable-h05vv-f-3g1-5-5m/datasheets/T11_Conductor_resistances_and_strand_structure_metric_kr.pdf | 1 | ad9258bad64a0c34fc30dc22df8bb1e1b749b39fb5a14a3243aa4ef5265321e3 |
| componentes/terminales-ojal-m4/enlaces.md | 0 | f9aacb8e739f6caa082b7ff5d15cacf91599b3a0321d2e7bdf5ba8485e41bc69 |
| componentes/terminales-ojal-m4/README.md | 0 | fcf39165257fa61e386e5f8e6be584b6069466501f045399e5c16a7c5627f640 |
| componentes/terminales-ojal-m4/datasheets/0900766b81529c0d.pdf | 2 | 6bd3378ce9e8da0b4941d9f53e441b25034f775ce99a93e0952a0562e43a5962 |
| componentes/terminales-ojal-m4/datasheets/A700000006574165.pdf | 7 | 27dd2cf179da04eda262aa9d8c214356b3ec89d21cf09748f4866af6763b6fd3 |
| componentes/terminales-ojal-m4/datasheets/A700000007945278.pdf | 6 | 2f8e297c619b26a14b87f1b0fcdc34b07883254e3e2962bd661726c94be9910d |
| componentes/terminales-ojal-m4/datasheets/datasheet-676042-phoenix-contact-3240018-ring-terminal-hole-o43-mm-partially-insulated-red-100-pcs.pdf | 3 | af3d417529095363a66a117d13779fa06883a7f3a4717f796534f155d6989438 |
| componentes/terminales-ojal-m4/datasheets/Quality_Crimp_Handbook.pdf | 24 | 202745c6390db7b685dd76e16e6d7c259922ea09cce595205cf98d7d3808625d |
| componentes/arandelas-dentadas-m4/enlaces.md | 0 | 461e29bfd18eef96fda2008156c321d09eb0ac773576a0da498521d5383af4d8 |
| componentes/arandelas-dentadas-m4/README.md | 0 | c2969f57f15ca410058a4e43128ce77c4221028e351913b6d6409093349725b7 |
| componentes/arandelas-dentadas-m4/datasheets/0900766b816b073d.pdf | 56 | 7f6b4a564acac5893b31b18c564c604672996fd8c102a10c4e11cf53d778397a |
| componentes/arandelas-dentadas-m4/datasheets/2337766.pdf | 1 | 2515f87d8bf004ddfe70c22ecc62068b1bb761e4754b6510008a88818481abdc |
| componentes/arandelas-dentadas-m4/datasheets/A700000006887825.pdf | 3 | 3599f21365e0f8a9948b6a78f0d116145f93e8978a734e728fba9dd355b50a06 |
| componentes/arandelas-dentadas-m4/datasheets/A700000011338889.pdf | 3 | 702cfa610835c52f5caff49b4b3b743ddedbe11b0cb9e377f0678f0fb1102d77 |
| componentes/arandelas-dentadas-m4/datasheets/BN_787.pdf | 1 | f0200ebb8eb093d46da6e46276e3813d502de4527f77638b32a92fafeb81017f |
| componentes/arandelas-dentadas-m4/datasheets/BUL86513.pdf | 1 | 5ea55d3068ae8f3e816b95bcc6e662dc6bf6acbbb17f159971bff853161d2a19 |
| componentes/arandelas-dentadas-m4/datasheets/RGW-100-1Y_Product_Page-225273.pdf | 2 | 8569ee6a02b42458a7e4fdff36abe506067b5080e0d3d98222e610abaf990ae0 |
| componentes/esparragos-soldar-m4x20/enlaces.md | 0 | 04593c86b080134b7d26053a24b83d66c7343a64f575431fa67d4e515664b4eb |
| componentes/esparragos-soldar-m4x20/README.md | 0 | 399f890e982a86673bb529048ae54077816d0cfcfdcd33207b388e2a523998df |
| componentes/esparragos-soldar-m4x20/datasheets/28208_FA_Soyer_PS-9_data.pdf | 2 | 4bc1ed1264081a17133f82b4520bb79844701b83cb787fe25ae26902963274ba |
| componentes/esparragos-soldar-m4x20/datasheets/52139189425.pdf | 2 | c5b5246a1f2bd0339981d04d0c4adc07acf164539ad04a63c042c5ec08b222c9 |
| componentes/esparragos-soldar-m4x20/datasheets/Grounding_and_Corrosion_of_Dissimilar_Materials-SUlemek.pdf | 21 | f2d8e930026f1f3bd980428a177c73c167833a398a953152481a95a54f1724e1 |
| componentes/esparragos-soldar-m4x20/datasheets/Introduction-to-Taylor-Studwelding-Systems-single-pages.pdf | 6 | f8664a28bcb48aad70025dc7e84a5767c49e18191006695fbecaac6b5fb334e8 |
| componentes/esparragos-soldar-m4x20/datasheets/produktinfo_ps-1k07.2022.pdf | 2 | 37342e86eb9eaff78497bfdd3cb09681cd8d22001c307cf55e9023f2dd9eb7d5 |
| componentes/esparragos-soldar-m4x20/datasheets/Sonderdruck_metallbau_1_2019.pdf | 3 | 6035e9a3f292098122581bf4de4de49e84ec6238efeaa7bae12758d21ad78f5f |
| componentes/kit-faston-aislados/enlaces.md | 0 | e862b49065f6ab955ada8f9e3dbfa589511c8d3f1a3840c4502439397cc4125f |
| componentes/kit-faston-aislados/README.md | 0 | a9196da8d49f843ea0243f87cfd93739d7102c49b70656c70abc93401fc6e339 |
| componentes/kit-faston-aislados/datasheets/0900766b812c0b94.pdf | 5 | 1a59f583c6d21e3c7df13eb13ee7fa7bf3fccbe997d692d078772d8854c27994 |
| componentes/kit-faston-aislados/datasheets/2672036.pdf | 5 | bf5029995cbbe5185bfe4e7a1aa820776f2b6eee26e5117e69cd8b8b2314a525 |
| componentes/kit-faston-aislados/datasheets/3945.pdf | 7 | 14f5953b1d45c388c13675b9368b99923e8d4367598a9645c3dc99017dc1c197 |
| componentes/kit-faston-aislados/datasheets/A700000011111237.pdf | 1 | 925b53bc2a959b0509923bfae670f4777f05e0bbcaef30f57ef8b5c25c196080 |
| componentes/kit-faston-aislados/datasheets/A700000011290009.pdf | 1 | f96b3011ad8ccc5f5860f92e198ef65fa728919a432ba5bb7d5da4bbee7c128e |
| componentes/kit-faston-aislados/datasheets/A700000015454362.pdf | 15 | 7fbfcfb2fe02e4699ba7f7872fa14caabc54123f3bddca86ce552bbc66cff85a |
| componentes/kit-faston-aislados/datasheets/TEConnectivityFASTONQuickReferenceGuide.pdf | 4 | 8d61330885d140843665b6d9159e44c70e5069151c5b384f24091f90eafc35e5 |
| componentes/kit-faston-aislados/datasheets/wire_pull_test_standards.pdf | 1 | b812969f921d0af68343acd9e76ac5455f1b088b1608fdcc8c30e47d1f75f68e |
| componentes/crimpadora-y-punteras/enlaces.md | 0 | 20f521e58a8e160396b54f0ca619f4d24cd2addf10b80968967ffc0a6d935f26 |
| componentes/crimpadora-y-punteras/README.md | 0 | 8228b0f6b820a5e195da8f76b563e047c8de4181762a60aa79a18d293c6a1abd |
| componentes/crimpadora-y-punteras/datasheets/06-3521_v1.pdf | 1 | 18e9dad72a2abf4b9b56e27fccc6ab3efa070150b61d4c378e62ba7a598fffc0 |
| componentes/crimpadora-y-punteras/datasheets/1540293_EN_Aderendhuelsen_LoRes.pdf | 1 | 7d2d26122306f2260952e2ffb526474ba954a91760cc7b97b507a24087cea2eb |
| componentes/crimpadora-y-punteras/datasheets/3200069-1475656.pdf | 4 | 62a2296c8196f2bac6bcc5be29720450a5f030be15ee4deb49591ac2e8c911b2 |
| componentes/crimpadora-y-punteras/datasheets/9014350000_en.pdf | 43 | 35308fad638a89df236f4deefb477bb11df1d11fb1378d1070add2197d1b5b1f |
| componentes/crimpadora-y-punteras/datasheets/A700000014794324.pdf | 7 | 7f5e1816f239fe742b6be0dbb65179545c87ac057f0470880f30b533c731ed9c |
| componentes/crimpadora-y-punteras/datasheets/MB_wire_end_ferrules_EN_WEB.pdf | 21 | c3f48a00d20750afe39406ebce078afc1fe0bbc6d15d0935d07c4e724e1bd539 |
| componentes/crimpadora-y-punteras/datasheets/PhoenixContact-Tables_Norm_Cross_Section.pdf | 1 | 3c28d70337c794b54835bbb1af042f028da8db4815a5834b0f6c6f1a71b46e1c |
| componentes/kit-faston-aislados/datasheets/tehnicni-podatki-737405-ploscati-tulec-sirina-63-mm-debelina-08-mm-180-delno-izoliran-modre-barve-cimco-180232-1-kos.pdf | 1 | a881e9cd8edec595e2bf4b85c9e9058c056b62921c9caff0eee5447ed475de86 |
