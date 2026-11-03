ALCOHOLÍMETRO · CARCASA DE CHAPA PLEGADA · REVISIÓN .2
Rama: programa-raspberry
Fecha: 03-11-2026
Original conservado: ../Carcasa_plegada/
Generador corregido: ../../modelo/planos_chapa.2.py

ESTADO DE ESTA REVISIÓN
=======================
Se ha CORREGIDO el generador de documentación de fabricación para separar
el tabique de pajitas del extremo derecho de los otros tres tabiques.
Esta carpeta .2 NO contiene todavía un paquete de fabricación regenerado.
NO enviar esta carpeta como sustituto de los DXF/STEP/PDF originales hasta
regenerar todos los entregables, verificar la geometría y aprobarlos.

HALLAZGO CONFIRMADO Y CORRECCIÓN
================================
En el modelo original, construir_cajon_pajitas() construye cuatro tabiques
(1 extremo derecho, 1 cierre izquierdo y 2 separadores) con el código interno
"TABIQUE". Sin embargo, tabique(x1, -1) dobla las pestañas hacia -X mientras
que tabique(x0, +1) y tabique(xs - T/2, +1) las doblan hacia +X.
Además, la pestaña delantera empieza más alta que la trasera, por lo que
invertir la pieza no es equivalente a instalarla en el otro extremo.

El agrupador del antiguo planos_chapa.py exporta SOLO el STEP/DXF del
primer tabique (derecho) y lo presenta como cuatro unidades. Eso podría
hacer que el taller pliegue cuatro piezas del sentido equivocado.

La revisión .2 agrupa estas geometrías por separado sin cambiar sus cotas:
- Tabique del extremo derecho: una unidad, referencia A-P02.
- Tabique del cierre izquierdo y dos separadores: tres unidades, referencia
  A-P03 (el identificador del primer tabique del grupo).
- Total de piezas de acero: 29 (no cambia).
- Planos de chapa diferentes: 22 (antes 21).
- Pliegues por máquina: 40 (no cambia).

GENERACIÓN DEL PAQUETE COMPLETO .2
==================================
Requiere el proyecto completo, con Python, CadQuery y sus dependencias.
Ejecutar desde la carpeta modelo/ de la rama programa-raspberry:

    python planos_chapa.2.py ../presupuesto/Carcasa_plegada.2

Genera, al ejecutar en un entorno compatible:
- Planos_chapa_plegada.pdf
- DXF_desarrollos/
- STEP_piezas/
- Conjunto_A.step
- Lista_piezas_chapa.xlsx

El script comprueba que los dos grupos de tabiques tienen cantidades 1 y 3.
Después de la ejecución, verificar personalmente:
[ ] Dos planos de tabiques (A-P02 y A-P03); cada uno con sus líneas y sentidos de plegado.
[ ] Los dos STEP son diferentes y corresponden a su respectiva posición.
[ ] 22 planos distintos, 29 piezas de acero y 40 pliegues por máquina.
[ ] Todos los DXF de corte están cerrados y sin solapamientos ni duplicados.
[ ] Todas las piezas son chapa desarrollable: sin colisiones ni auto-intersecciones.
[ ] Las operaciones de plegado son realizables con utillaje disponible.
[ ] Controles dimensionales y tolerancias acordados con el taller.

OBSERVACIONES TÉCNICAS (NO VALIDACIÓN FINAL)
===========================================
1) Acero DC01: espesor 1,5 mm en piezas dobladas y planas, 3 mm en
   soportes/orejetas especificados. Radio interior nominal 1,5 mm;
   factor K nominal 0,33: el taller debe confirmarlo con pruebas de doblado.
2) El A-P01 (cajón de pajitas) tiene un pliegue interrumpido por tres
   aberturas. Comprobar radio en las terminaciones, alivios de plegado,
   deformación de las ranuras y secuencia de plegadora en muestra física.
3) En los PDF generados, las cotas automáticas son las generales del
   desarrollo; el detalle exacto de agujeros y recortes está en los DXF.
   Especificar tolerancias generales, cotas funcionales, referencias y
   método de inspección antes de fabricar una serie.
4) Verificar accesibilidad real de los electrodos de soldadura por puntos a
   las pestañas, especialmente en cajas cerradas y flancos de 10-13 mm.
   Definir orden de soldadura/plegado y acabado con el proveedor.
5) Verificar holguras de la tapa/guías, acceso de mantenimiento, sellado de
   ventanas, sistema antimanipulación, continuidad de tierra y separación
   de 230 V en el prototipo real. Los choques nominales en CAD no cubren
   todas las tolerancias ni las deformaciones por soldadura.
6) Verificar que la bisagra, tornillos y cerraduras se montan después de
   doblar y que la secuencia no deja pasos inaccesibles.

ALCANCE DE LA REVISIÓN
======================
Revisados el código que genera las caras y los desarrollos, el registro de
decisiones de 03-11-2026, la documentación del diseño A y muestras de DXF
y STEP. En los DXF examinados no aparecieron extremos de corte abiertos y
los STEP examinados contienen cada uno un sólido BREP cerrado. NO se ha
realizado una verificación independiente completa con CAD/plegadora ni se
ha podido regenerar el paquete completo desde este entorno.

La versión anterior sigue intacta. Se debe regenerar y revisar el paquete
.2 antes de solicitar una fabricación comercial.
