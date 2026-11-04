# Optimización del patrón de anclaje del alcoholímetro (diseño A, trasera de 3 mm)

Código para reproducir todos los cálculos del informe `Informe_anclajes_alcoholimetro.pdf` (04-11-2026).
Python ≥ 3.10 con `numpy`, `scipy`, `matplotlib`, `reportlab`, `pillow`. Unidades: N, mm, N·mm.

| Archivo | Qué hace |
|---|---|
| `nucleo.py` | Geometría verificada de la trasera de 3 mm, zonas donde se puede taladrar, elemento de placa ACM, modelo FEM (chapa + caja rígida + tacos + contacto unilateral), versión rápida en banda (`FEMRapido`), modelo de chapa rígida y reparto del cortante |
| `evaluacion.py` | Datos de fischer, masas y CdG (cálculo con 18 kg), casos de carga de la envolvente, patrones de referencia A, B y C, factor de carga λ |
| `optimizar.py` | Recocido simulado + pulido (función objetivo, movimientos, zonas) |
| `fase_18.py` | Búsqueda con n = 18: fase 1 (2 libres + 1 simétrico de 2000 iteraciones), el P18-O de 2 mm llevado a las zonas nuevas y fase 2 (`intensificar.py`, 4 recocidos de 4000) |
| `intensificar.py` | Segunda fase de búsqueda para n = 18 |
| `mamposteria.py` | Variante con separación mínima de 100 mm (`S_MIN=100`) |
| `seleccionar.py`, `seleccionar_util.py` | Redondea a 0,5 mm, comprueba la geometría y elige el ganador con malla de 10 mm (simétrico si llega al 95 % del libre) |
| `variantes.py` | Análisis reducido de la alternativa libre y de la variante de mampostería |
| `juntas_ajuste.py` | Mampostería: capacidad si el instalador ajusta la altura de montaje |
| `analisis.py` | Convergencia, sensibilidad, escenarios, pérdidas, juntas de ladrillo, golpes, fallo progresivo, admisibles por pared |
| `barrido_b.py` | Barrido de n = 6…16 del estudio de 2 mm (con 3 mm no se ha repetido) |
| `figuras.py`, `informe.py`, `preparar_extra.py` | Figuras, CSV y PDF |

Orden de ejecución (≈ 45 min con 2 núcleos). La carpeta `resultados/` trae los JSON de esta ejecución para regenerar figuras e informe sin repetir la búsqueda:

```
python fase_18.py                                       # resultados_opt.json + intens18.json
S_MIN=100 python mamposteria.py mamposteria.json
python seleccionar.py resultados_opt.json intens18.json patrones.json opt_todo.json
python analisis.py patrones.json resultados_analisis.json
python variantes.py seleccion.json mamposteria.json variantes.json
python juntas_ajuste.py juntas_ajuste.json
python preparar_extra.py resultados_analisis.json seleccion.json extra.json patron_ganador.csv
python figuras.py resultados_analisis.json opt_todo.json figuras
python informe.py resultados_analisis.json opt_todo.json figuras informe.pdf extra.json
```

`fase_18.py` lee el P18-O del estudio de 2 mm de `../historico-2mm/resultados/patrones.json` (ruta fijada al principio del script).
Las semillas aleatorias están fijadas, así que los resultados se repiten. La búsqueda es heurística: no demuestra un óptimo global.
Las cargas de los tacos son las recomendadas por fischer para un taco aislado; ningún resultado es una resistencia certificada del conjunto.
