# Estudio térmico del diseño A · cuánto se calienta y qué temperatura aguanta

13-11-2026 · diseño A (Compacta), CAD del 04-11-2026 · cargas de la revisión de componentes del 13-11-2026 (Bloque 1): 15,7 W sin ventiladores, 16,3 W con dos.

El informe completo es [`Estudio_termico_alcoholimetro.pdf`](Estudio_termico_alcoholimetro.pdf) (31 páginas, 15 figuras). Aquí va el resumen y cómo repetir el cálculo.

> **Estado: todo es cálculo, no hay nada montado ni medido.** Cada cifra lleva su margen en el informe y se valida con el ensayo del apartado 14. Ningún cambio de los que se proponen está aplicado todavía al CAD, al cableado ni al programa.

## Resultado

![Calentamiento del aire junto al Solo en cada configuración](figuras/f_escalera.png)

Calentamiento sobre la temperatura del bar, en kelvin (1 K = 1 °C de diferencia):

| Configuración | Aire interior | Aire junto al Solo | Bar más caliente con todo en ficha |
|---|---|---|---|
| **Diseño actual** (9 ranuras de 22 × 4 mm, cajón sin pintar) | +26,5 K de media | **+31,1 K** | **8 °C** |
| Interior y cajón pintados | +21,7 K de media | +25,4 K | 14 °C |
| Sin ninguna abertura | +32,9 K de media | +38,5 K | — |
| 1 ventilador de 40 × 10 mm (4,2 m³/h reales) | +7,5 K a la salida | +2,2 K | 33 °C |
| **2 ventiladores de 40 × 10 mm en serie** (5,2 m³/h reales) | +6,3 K a la salida | **+1,9 K** | **34 °C** |
| 1 ventilador de 60 × 25 mm (14 m³/h; no cabe en los laterales) | +2,8 K a la salida | +0,8 K | 37 °C |

- **El diseño actual no vale tal cual.** Con el bar a 25 °C, el aire junto al SumUp Solo se queda en 56 °C, y su límite es 40 °C. En el 80 % de los 1 500 casos calculados al azar sale entre +26 y +36 K. Arrancando en frío con el bar a 25 °C llega a 40 °C en media hora.
- **Por qué:** la doble pared (cajón dentro de carcasa) cuesta unos 10 K, el cajón sin pintar apenas radia, el frente es doble policarbonato y las ranuras solo dejan pasar 0,2 m³/h. Sin el cajón, el modelo da casi lo mismo que la regla de armarios de Rittal (+16,6 frente a +16,9 K).
- **No se arregla sin ventilador:** con 16 veces más ranuras y todo pintado sigue en +10 K junto al Solo.
- **Con dos ventiladores de 40 mm queda en +2 K junto al Solo** y el aire sale a +6 K (entre +5 y +9). Pasa a limitar el módem (40 °C, a media altura): bar máximo de 34 °C. Propuesta de ficha: **bares de 10 a 32 °C**.
- **Frente a la revisión de componentes** (+24 K sin ventilador y +8 K con dos): la media sale parecida, +26,5 y +6,3 K. Lo nuevo es el reparto en altura: arriba, junto al Solo, son +31 K sin ventilador y +2 K con la entrada de aire a su lado.
- **Si los dos ventiladores se paran**, el Solo llega a 40 °C en unos 12 minutos con el bar a 25 °C y en 5 o 6 con el bar a 30 °C. Por eso hacen falta una sonda y que el programa deje de cobrar.

## Qué habría que cambiar

Por orden de importancia (tabla completa en el apartado 13 del informe):

1. **Dos ventiladores de 40 mm**: entrada arriba a la derecha, junto al Solo; salida abajo a la izquierda. Aberturas de Ø38 con malla y lamas, y burlete entre cajón y carcasa.
2. **Un fusible por ventilador** en vez de uno para los dos (W31).
3. **Sonda de temperatura junto al Solo** (DS18B20) y umbrales en el programa: 36 °C avisa y baja el brillo, 38 °C avería, 40 °C deja de cobrar hasta bajar de 37 °C.
4. Cajón e interior de la carcasa pintados en mate: 6 K menos cuando la ventilación falla.
5. Ventiladores con control: parados por debajo de 25 °C, en marcha por encima de 30 °C.
6. Reglas de instalación: nunca al sol, lejos de salidas de aire caliente, aberturas despejadas.

Lo que **no** cambiaría: la doble pared, el doble policarbonato, la fuente y la chapa de 3 mm.

### Lo que el CAD no deja hacer como estaba pensado

- La abertura de Ø38 «por la caja de red» **no cabe** junto a la toma C14: quedan 33 mm.
- Un ventilador de 60 mm **no cabe** en los laterales: hay 49 mm de fondo entre las pestañas del cajón.
- Las rejillas actuales **no valen como salida** de un ventilador: el caudal se queda en 2,0 m³/h y el aire sale a +12,8 K.

## Cómo está calculado

- Red de 57 nodos (aire, electrónica, pantalla, fuente, caras del cajón y carcasa en 11 franjas de altura) con convección natural (Churchill–Chu, placas horizontales, Hollands), radiación entre grises, conducción por los huecos y por la chapa, tiro natural por las rejillas y caudal forzado.
- Comprobaciones: balance de energía (15,69 W entran, 15,69 W salen), independencia de malla (26,51 / 26,54 / 26,55 K con 11 / 22 / 44 franjas) y contraste con la regla de armarios.
- Incertidumbre: 1 500 casos al azar por configuración y sensibilidad parámetro a parámetro. La mayor incógnita es el consumo real (13–21 W), a medir con un vatímetro.
- Ventiladores: curva de catálogo del Noctua NF-A4x10 5V contra la resistencia del recorrido (K = 14 de caso base).
- Transitorios: arranque en frío, parada de ventiladores y corte de luz, con 6,5 kJ/K de capacidad térmica.

## Qué hay en esta carpeta

| Ruta | Contenido |
|---|---|
| `Estudio_termico_alcoholimetro.pdf` | El informe |
| `codigo/termico.py` | El modelo. Todos los parámetros están en la clase `P` |
| `codigo/analisis_conf.py` | Las seis configuraciones estudiadas |
| `codigo/analisis.py` | Corre todos los casos y escribe `resultados/` |
| `codigo/calc.py` | Las cuentas paso a paso de los recuadros del informe |
| `codigo/fig_*.py`, `codigo/estilo.py` | Las figuras |
| `codigo/informe.py`, `codigo/estilo.css` | Montan el PDF con los números de `resultados/` |
| `resultados/` | `resultados.json`, `calc.json` y las curvas (`.npz`) |
| `figuras/` | Las 14 figuras calculadas, en SVG y PNG. Las dos vistas de la figura 1 son las de `../FreeCAD/` |

## Cómo repetirlo

Hace falta Python 3 con NumPy, Matplotlib y pypdf, y Google Chrome para pasar el HTML a PDF. Las figuras usan la fuente Inter si está instalada. Todo se ejecuta desde `codigo/`:

```bash
cd carcasa/diseno-A/estudio-termico/codigo
python3 analisis.py          # unos 50 s; la semilla es fija, sale siempre lo mismo
python3 calc.py
for f in fig_a fig_b fig_c fig_red fig_seccion; do python3 $f.py; done
python3 informe.py           # escribe ../Estudio_termico_alcoholimetro.pdf
```

- **Con datos medidos:** cambiar en `analisis_conf.py` la potencia (`P_psu`, `P_scr`, `P_rest`) y el caudal (`Q_fan`), y en `termico.py` los coeficientes que el ensayo corrija.
- **Si cambia la geometría:** las cotas están al principio de la clase `P`, con los mismos valores que `carcasa/diseno-A/modelo/diseno.py`. No se leen de ahí: hay que cambiarlas a mano.

## Fuentes

Lista completa, con enlaces, en la última página del informe. Las cargas salen de la revisión de componentes del 13-11-2026 ([`componentes/REVISION-13-11-2026.md`](../../../componentes/REVISION-13-11-2026.md), el «Bloque 1»); la geometría, de `carcasa/diseno-A/modelo/diseno.py`; los límites de temperatura, de las fichas de `componentes/` y de las hojas de los fabricantes.
