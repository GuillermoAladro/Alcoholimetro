# Diseño A completo para FreeCAD

`Alcoholimetro_A_completo.step` es la máquina entera en un solo archivo STEP (AP214, en mm): 220 × 100 × 442,5 mm.

**Cómo abrirlo:** en FreeCAD, *Archivo → Abrir* y elige el `.step`. Sirve igual en Fusion 360, SolidWorks, Onshape, etc.

**Qué lleva (286 piezas, cada una con su nombre y color):**

| Grupo | Piezas |
|---|---|
| 01 Carcasa | 14 chapas |
| 02 Frente (policarbonatos) | 2 |
| 03 Tapa abatible | tapa, faldones, bisagra y cerradura |
| 04 Tapa interior | 1 |
| 05 Cajón de pajitas | cajón, anillas y los 2 candados |
| 06 Cajón de componentes | chapas del cajón y soportes |
| 07 Electrónica | pantalla, Solo, Pi, sensor, fuente, C14, bornes, neumática… (cada uno con sus partes en color) |
| 08 Tornillería y fijaciones | tornillos, tuercas, separadores, espárragos, silentblocks, topes |
| 09 Cables y tubos | los 38 cables y tubos con su recorrido |

- Los nombres siguen la lista de piezas (`A-C01 Panel frontal`, `A-E06.1 Fuente LRS-50-5`…), sin tildes para que se lean bien en cualquier versión.
- El STEP no guarda transparencias: si quieres ver a través de los policarbonatos, en FreeCAD selecciónalos y pon *Transparencia* en la vista.
- Las chapas sueltas para fabricar siguen en `../CAD_A_Compacta/` (un STEP por pieza y los DXF de corte).

**Cómo se genera:** `python modelo/exportar_freecad.py FreeCAD/Alcoholimetro_A_completo.step` (sale del mismo modelo que el resto; si cambia `specs.py`, se vuelve a generar).
