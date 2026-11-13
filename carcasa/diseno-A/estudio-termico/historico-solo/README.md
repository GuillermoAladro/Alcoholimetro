# Estudio térmico · revisión 1, con el SumUp Solo

13-11-2026 · diseño A (Compacta), CAD del 04-11-2026, con el SumUp Solo detrás del policarbonato y la fuente LRS-50-5.

- Informe: [`Estudio_termico_alcoholimetro_Solo.pdf`](Estudio_termico_alcoholimetro_Solo.pdf) (31 páginas).
- Código, figuras y resultados de esta revisión: commit `255dffa` de la rama `estudio-termico`, en `carcasa/diseno-A/estudio-termico/`.
- La revisión 2 (carpeta de arriba) la sustituye: cambia el Solo por el myPOS Sigma y la fuente por una de 12 V. Su código conserva la versión del Solo (`sigma=False` en `termico.py`, `CONF_SOLO` en `analisis_conf.py`) y la recalcula para comparar; da los mismos números que este informe.

## Resultado de la revisión 1

| Configuración | Aire interior | Aire junto al Solo | Bar más caliente con todo en ficha |
|---|---|---|---|
| Diseño actual (9 ranuras de 22 × 4 mm, cajón sin pintar) | +26,5 K de media | +31,1 K | 8 °C |
| Interior y cajón pintados | +21,7 K de media | +25,4 K | 14 °C |
| 2 ventiladores de 40 × 10 mm en serie (5,2 m³/h reales) | +6,3 K a la salida | +1,9 K | 34 °C |

Todo era cálculo: nada medido.
