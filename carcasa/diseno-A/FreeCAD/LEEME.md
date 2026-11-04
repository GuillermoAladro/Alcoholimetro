# Diseño A completo para FreeCAD

`Alcoholimetro_A_completo.step` es la máquina entera en un solo archivo STEP (AP214, en mm): 220 × 100 × 442,5 mm.
Actualizado el 04-11-2026: chapa de 3 mm por fuera, cajón de componentes y tapa interior de 1,5 mm, y los 18 agujeros de la trasera con el patrón P18-3.

**Cómo abrirlo:** en FreeCAD, *Archivo → Abrir* y elige el `.step`. Sirve igual en Fusion 360, SolidWorks, Onshape, etc.

**Qué lleva (cada pieza con su nombre y color):**

| Grupo | Piezas |
|---|---|
| 01 Carcasa | 8 piezas de chapa plegada y plana (cuerpo, panel, bandeja, apoyos, guías y anillas) |
| 02 Policarbonatos (frente y ventana de la antena) | 3 |
| 03 Tapa abatible | tapa con sus faldones, pestaña de tope, bisagra y cerradura |
| 04 Tapa interior | 1 |
| 05 Cajón de pajitas | cajón, anillas y los 2 candados |
| 06 Cajón de componentes | chapas del cajón y soportes |
| 07 Electrónica | pantalla, Solo, Pi, módem 4G, antena plana, sensor, fuente, C14, bornes, neumática… (cada uno con sus partes en color) |
| 08 Tornillería y fijaciones | tornillos, tuercas, separadores, espárragos, silentblocks, topes |
| 09 Cables y tubos | los 38 cables y tubos con su recorrido |

- Los nombres siguen la lista de piezas (`A-C01 Panel frontal`, `A-E06.1 Fuente LRS-50-5`…), sin tildes para que se lean bien en cualquier versión.
- El STEP no guarda transparencias: si quieres ver a través de los policarbonatos, en FreeCAD selecciónalos y pon *Transparencia* en la vista.
- Las chapas sueltas para fabricar siguen en `../CAD_A_Compacta/` (un STEP por pieza y los DXF de corte con los pliegues) y en `../presupuesto/Carcasa_plegada/` (los planos en PDF).

**Cómo se genera:** `python modelo/exportar_freecad.py FreeCAD/Alcoholimetro_A_completo.step` (sale del mismo modelo que el resto; si cambia `specs.py`, se vuelve a generar).
- Las vistas `vista-exterior.png` (lado izquierdo, con la ventana de la antena) y `vista-interior.png` (carcasa y cajón transparentes) salen del visor 3D, que se genera del mismo modelo. Son del 03-11-2026 (chapa de 2 mm); con la de 3 mm casi no cambian: las diferencias son de unos milímetros o quedan en la trasera (guías, apoyo y agujeros), que no se ve desde esos lados.
