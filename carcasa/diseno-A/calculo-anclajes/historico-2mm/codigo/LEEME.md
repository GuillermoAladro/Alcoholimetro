# Optimización del patrón de anclaje del alcoholímetro (diseño A)

Código para reproducir todos los cálculos del informe `Informe_anclajes_alcoholimetro.pdf`.
Python ≥ 3.10 con `numpy`, `scipy`, `matplotlib`, `reportlab`, `pillow`. Unidades: N, mm, N·mm.

| Archivo | Qué hace |
|---|---|
| `nucleo.py` | Geometría verificada de la trasera, zonas donde se puede taladrar, elemento de placa ACM, modelo FEM (chapa + caja rígida + tacos + contacto unilateral), versión rápida en banda (`FEMRapido`), modelo de chapa rígida y reparto del cortante |
| `evaluacion.py` | Datos de fischer, masas y CdG, casos de carga de la envolvente, patrones de referencia A, B y C, factor de carga λ |
| `optimizar.py` | Recocido simulado + pulido (función objetivo, movimientos, zonas) |
| `barrido_b.py` | Barrido para n = 6…16 (1200 iteraciones) |
| `intensificar.py` | Segunda fase de búsqueda para n = 18 |
| `mamposteria.py` | Variante con separación mínima de 100 mm (`S_MIN=100`) |
| `seleccionar.py`, `seleccionar_util.py` | Redondea a 0,5 mm, comprueba la geometría y elige el ganador con malla de 10 mm |
| `variantes.py` | Análisis reducido de la variante simétrica y de las de mampostería |
| `juntas_ajuste.py` | Mampostería: capacidad si el instalador ajusta la altura de montaje |
| `analisis.py` | Convergencia, sensibilidad, escenarios, pérdidas, juntas de ladrillo, golpes, fallo progresivo, admisibles por pared |
| `figuras.py`, `informe.py`, `preparar_extra.py` | Figuras, CSV y PDF |

Orden de ejecución (≈ 1,5 h con 2 núcleos). La carpeta `resultados/` trae los JSON de esta ejecución para regenerar figuras e informe sin repetir la búsqueda:

```
python optimizar.py resultados_opt.json 2000 16 18      # en el estudio se interrumpió tras n = 16 (8 recocidos)
python barrido_b.py resultados_opt_b.json
python intensificar.py resultados_opt.json 18 4000 intens18.json
S_MIN=100 python mamposteria.py mamposteria.json
python seleccionar.py resultados_opt.json intens18.json patrones.json opt_todo.json
python analisis.py patrones.json resultados_analisis.json
python variantes.py seleccion.json mamposteria.json variantes.json
python juntas_ajuste.py juntas_ajuste.json
python -c "import json; a=sum((json.load(open(f)) for f in ['resultados_opt.json','resultados_opt_b.json','intens18.json']), []); json.dump(a, open('opt_todo.json','w'))"
python preparar_extra.py resultados_analisis.json seleccion.json extra.json patron_ganador.csv
python figuras.py resultados_analisis.json opt_todo.json figuras
python informe.py resultados_analisis.json opt_todo.json figuras informe.pdf extra.json
```

Las semillas aleatorias están fijadas, así que los resultados se repiten. La búsqueda es heurística: no demuestra un óptimo global.
Las cargas de los tacos son las recomendadas por fischer para un taco aislado; ningún resultado es una resistencia certificada del conjunto.

Para regenerar figuras e informe sin repetir la búsqueda: copiar los JSON de `../resultados/` a esta carpeta y ejecutar solo `preparar_extra.py`, `figuras.py` e `informe.py`. `informe.py` usa las fuentes DejaVu de `/usr/share/fonts/truetype/dejavu/` (Linux); en otro sistema, cambiar esa ruta.
