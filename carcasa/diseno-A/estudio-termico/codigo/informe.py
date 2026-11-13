#!/usr/bin/env python3
"""Monta el informe en HTML a partir de los resultados (../resultados/*.json) y lo convierte a PDF con Chrome."""
import json, sys, subprocess, os
from dataclasses import replace
from termico import P, resolver
import analisis_conf as AC

R = json.load(open("../resultados/resultados.json"))
K = json.load(open("../resultados/calc.json"))
A, PN, F1, F2, F60 = (R["conf"][k] for k in ("actual", "pintado", "fan1", "fan2", "fan60"))
MC = R["mc"]; T = R["trans"]; M = R["margenes"]; BM = R["bar_max"]


def c(x, d=1):
    return f"{x:.{d}f}".replace(".", ",")


def s(x, d=0):
    return ("+" if x >= 0 else "−") + c(abs(x), d)


def fl(x):
    """Entero por abajo: para temperaturas máximas, redondear hacia el lado seguro."""
    import math
    return str(int(math.floor(x)))


def tag(t):
    return f'<span class="tag">{t}</span>'


HOJA, CALC, EST, SUP, GEN = tag("hoja"), tag("cálculo"), tag("estimación"), tag("supuesto"), tag("dato general")
FIG = [0]
FIGN = {}


def fig(nombre, pie, clase=""):
    FIG[0] += 1
    FIGN[nombre] = FIG[0]
    return f'<figure class="{clase}"><img src="../figuras/{nombre}.svg"><figcaption><b>Figura {FIG[0]}.</b> {pie}</figcaption></figure>'


def calc(titulo, formula, sust, res):
    return (f'<div class="calc"><div class="t">{titulo}</div><div class="r"><span>Fórmula</span><span class="f">{formula}</span></div>'
            f'<div class="r"><span>Sustitución</span><span class="f">{sust}</span></div><div class="r"><span>Resultado</span><span class="res">{res}</span></div></div>')


PB = {"5", "13", "14", "A"}


def h1(n, t):
    return f'<h1 class="{"pb" if n in PB else ""}"><span class="n">{n}</span>{t}</h1>'


# ------------------------------------------------------------------ valores derivados
r30 = resolver(replace(AC.CONF["actual"]["p"], Ta=30.0))
r30f = resolver(replace(AC.CONF["fan2"]["p"], Ta=30.0))
bar_todo = {k: min(v.values()) for k, v in BM.items()}
bar_quien = {k: min(v, key=v.get) for k, v in BM.items()}
NOMC = {x["clave"]: x["nombre"] for x in R["comp"]}

import numpy as np
_mc = np.load("../resultados/mc.npz")
MCMIN, MCMAX = float(np.floor(_mc["actual"][:, 1].min())), float(np.ceil(_mc["fan2"][:, 1].max()))
assert _mc["actual"][:, 1].min() > 15.0
_tr = np.load("../resultados/trans.npz")
_i = np.argmax((_tr["corte_solo"] - 25.0) < 2.0)
T_ENFRIA = float(_tr["corte_t"][_i])
partes = []
W = partes.append

# =================================================================== PORTADA
W(f'''
<section class="portada">
  <div class="sup">Alcoholímetro · diseño A (Compacta) · 13-11-2026</div>
  <h0>Estudio térmico<br>del diseño</h0>
  <div class="sub">Cuánto se calienta por dentro, qué temperatura aguanta cada pieza y qué hay que cambiar para que trabaje dos años sin visitas.</div>
  <div class="tiles">
    <div class="tile"><div class="l">Aire junto al SumUp Solo, diseño actual</div><div class="v">{s(A["local"]["solo"])} K</div>
      <div class="d">sobre la temperatura del bar, con 16 W dentro. Con el bar a 25 °C son {c(25 + A["local"]["solo"], 0)} °C; el límite del Solo es 40 °C.</div></div>
    <div class="tile"><div class="l">Lo mismo con dos ventiladores de 40 mm</div><div class="v">{s(F2["local"]["solo"])} K</div>
      <div class="d">El aire sale a {s(F2["dT"])} K. Es el cambio que hace viable el diseño.</div></div>
    <div class="tile"><div class="l">Bar más caliente que soporta hoy</div><div class="v">{fl(bar_todo["actual"])} °C</div>
      <div class="d">con todas las piezas dentro de su ficha. En la práctica, ninguno.</div></div>
    <div class="tile"><div class="l">Bar más caliente que soporta con ventilación</div><div class="v">≈ {fl(bar_todo["fan2"])} °C</div>
      <div class="d">Lo limita el módem (40 °C). El Solo aguantaría hasta {fl(BM["fan2"]["solo"])} °C.</div></div>
  </div>
  <div class="pie">Preparado para Guillermo Aladro Abad · cálculo de Claude sobre el CAD del 04-11-2026 y las cargas del Bloque 1 (13-11-2026).<br>
  <strong>Todo es cálculo: no hay nada montado ni medido.</strong> Cada cifra lleva su margen y se valida con el ensayo del apartado 14.</div>
</section>
''')

# =================================================================== RESUMEN
W(f'''
<h1>Resumen</h1>
<p class="lead">Lectura que he tomado del encargo: estudiar a fondo cómo se comporta el diseño A con el calor y decir qué temperatura soporta. Lo separo en dos preguntas, cuánto se calienta la máquina por dentro y cuánto aguanta cada pieza, y de las dos sale la respuesta práctica: en qué bares puede trabajar.</p>

<h2>Lo que sale del estudio</h2>
<ol>
<li><strong>Tal como está dibujada hoy, la máquina se calienta bastante más de lo que se había supuesto.</strong> Con 16 W dentro, el aire interior queda {s(A["dT"], 1)} K por encima del bar de media y {s(A["local"]["solo"])} K junto al Solo y el sensor (en el 80 % de los casos calculados, entre {s(MC["actual"]["solo"]["p10"])} y {s(MC["actual"]["solo"]["p90"])} K).</li>
<li><strong>La frase que me pasas se queda corta.</strong> «Con el bar a 30 °C, dentro habría unos 38–42 °C» sale de suponer +8 a +12 K. El modelo da {c(r30["Ti"], 0)} °C de media y {c(M["actual"]["30"]["solo"], 0)} °C junto al Solo.</li>
<li><strong>La causa está en el propio diseño:</strong> una caja dentro de otra con aire en medio, el frente tapado por dos policarbonatos (aísla como un doble acristalamiento), rejillas de 2,5 cm² y las piezas más delicadas arriba, donde se acumula el aire caliente.</li>
<li><strong>La carcasa aguanta de sobra; lo que no aguanta es lo que lleva dentro.</strong> Acero, pintura, policarbonato, cinta y cables soportan 70 °C o más. El Solo, el sensor y el módem tienen el límite en 40 °C; la Pi y la cámara, en 50 °C.</li>
<li><strong>Sin ventilación forzada no hay bar en el que todo quede dentro de su ficha:</strong> haría falta un bar a {fl(bar_todo["actual"])} °C. Pintar el interior y agrandar las rejillas ayuda (de 6 a 10 K menos), pero no llega.</li>
<li><strong>Con dos ventiladores de 40 mm (unos 5 m³/h reales) el aire sale a {s(F2["dT"])} K y el Solo ve {s(F2["local"]["solo"])} K.</strong> Así la máquina soporta bares de hasta unos {fl(bar_todo["fan2"])} °C con todo en ficha. Confirmo la decisión del Bloque 1 y la afino (apartado 8).</li>
<li><strong>Si la ventilación se para, el aire junto al Solo pasa de 40 °C en unos {int(round(T["fallo_t40"] * 60))} minutos</strong> (bar a 25 °C) y se estabiliza en {c(T["fallo_fin"], 0)} °C. Los ventiladores pasan a ser una pieza crítica y necesitan vigilancia y corte por programa.</li>
<li><strong>Nunca al sol directo.</strong> Con sol fuerte en el frente la chapa sube {s(R["ext"]["fan2"]["sol300"]["chapa_max"])} K y la pantalla {s(R["ext"]["fan2"]["sol300"]["Scr"])} K sobre el bar, también con ventiladores.</li>
</ol>

<h2>Temperatura soportada, por configuración</h2>
<table>
<tr><th>Configuración</th><th class="n">Calor dentro</th><th class="n">Aire interior<br>(media)</th><th class="n">Aire junto<br>al Solo</th><th class="n">Bar máximo<br>para el Solo</th><th class="n">Bar máximo con<br>todo en ficha</th><th>Pieza que limita</th></tr>
''')
for k, nom in (("actual", "Diseño actual (rejillas de hoy, cajón sin pintar)"), ("pintado", "Actual con el interior pintado"), ("fan1", "1 ventilador de 40 × 10 mm"),
               ("fan2", "<strong>2 ventiladores de 40 × 10 mm</strong>"), ("fan60", "1 ventilador de 60 × 25 mm (no cabe en los laterales)")):
    cf = R["conf"][k]
    W(f'<tr><td>{nom}</td><td class="n">{c(cf["P"])} W</td><td class="n">{s(cf["dT"], 1)} K</td><td class="n">{s(cf["local"]["solo"], 1)} K</td>'
      f'<td class="n">{fl(BM[k]["solo"])} °C</td><td class="n">{fl(bar_todo[k])} °C</td><td>{NOMC[bar_quien[k]]}</td></tr>')
W(f'''</table>
<p class="peq">«Bar máximo» es la temperatura del aire del local con la que la pieza llega justo a su límite de ficha. Calentamientos {CALC} con el modelo del apartado 5; límites {HOJA}.</p>

<h2>Qué cambia respecto a lo que ya estaba escrito</h2>
<table>
<tr><th>Documento</th><th>Calor dentro</th><th>Calentamiento sin ventilador</th><th>Con dos ventiladores</th></tr>
<tr><td>Verificación del 12-11-2026</td><td>13–15 W</td><td>+8 a +12 K (estimación rápida)</td><td>—</td></tr>
<tr><td>Bloque 1 del 13-11-2026</td><td>16 W (13–21)</td><td>+17 K (una pared) a +24 K (doble pared)</td><td>+8 K</td></tr>
<tr><td><strong>Este estudio</strong></td><td>16 W (13–21)</td><td><strong>{s(A["dT"], 1)} K de media y {s(A["local"]["solo"])} K junto al Solo</strong></td><td><strong>{s(F2["dT"])} K a la salida y {s(F2["local"]["solo"])} K junto al Solo</strong></td></tr>
</table>

<h2>Lo que haría, por orden</h2>
<ol>
<li>Dar por decidida la ventilación forzada y llevarla al CAD: entrada arriba a la derecha, junto al Solo, y salida abajo a la izquierda (apartado 8.3).</li>
<li>Pintar el cajón de componentes y el interior de la carcasa, o al menos no dejarlos galvanizados brillantes: {c(A["local"]["solo"] - PN["local"]["solo"], 0)} K menos el día que falle la ventilación.</li>
<li>Poner un fusible por ventilador y una sonda de temperatura junto al Solo, con umbrales en el programa (apartado 13).</li>
<li>Añadir tres reglas de instalación: nunca al sol, nunca junto a una fuente de calor y bares de 10 a 32 °C.</li>
<li>Antes de pedir chapa en serie, hacer el ensayo del apartado 14 con una carcasa de prototipo. Son tres horas y dice si el modelo acierta.</li>
</ol>

<h2>Contenido</h2>
<div class="indice">
''')
for n, t in (("1", "Alcance y método"), ("2", "El diseño visto como problema térmico"), ("3", "Cuánto calor hay que sacar"), ("4", "Qué temperatura aguanta cada pieza"),
             ("5", "Modelo de cálculo"), ("6", "Resultados del diseño actual"), ("7", "¿Se arregla sin ventilador?"), ("8", "Ventilación forzada"),
             ("9", "Temperatura de cada pieza y del bar"), ("10", "Arranque, averías y cortes de luz"), ("11", "Sol, funda y frío"), ("12", "Calor y vida útil"),
             ("13", "Cambios recomendados"), ("14", "Plan de ensayo"), ("15", "Conclusiones"), ("A", "Anexo: parámetros del modelo"), ("B", "Anexo: cómo repetir el cálculo"), ("", "Fuentes")):
    W(f'<div><span><span class="n">{n}</span>{t}</span></div>')
W('</div>')

# =================================================================== 1. ALCANCE
W(h1("1", "Alcance y método"))
W(f'''
<h2>1.1 Qué versión he estudiado</h2>
<ul>
<li><strong>Carcasa:</strong> diseño A (Compacta) del 04-11-2026, tal como lo generan los scripts de <code>carcasa/diseno-A/modelo/</code>: 220 × 100 × 442,5 mm, carcasa de chapa de 3 mm, cajón de componentes y tapa interior de 1,5 mm, dos policarbonatos de 5 mm en el frente y antena por dentro.</li>
<li><strong>Electrónica y cargas:</strong> las del Bloque 1 (13-11-2026): 2,5 A típicos en 5 V, fuente a 5,10 V y la propuesta de dos ventiladores Noctua NF-A4x10 5V, que todavía no está en el CAD.</li>
<li><strong>Acabado:</strong> carcasa con pintura en polvo por fuera. Del cajón de componentes ningún documento dice el acabado; como caso base lo tomo <strong>sin pintar o galvanizado</strong> {SUP}, que es el peor para el calor, y calculo también el caso pintado.</li>
</ul>

<h2>1.2 Qué he hecho</h2>
<ol>
<li>Sacar del CAD la geometría que importa para el calor: superficies, huecos entre chapas, rejillas y dónde va cada pieza.</li>
<li>Hacer el inventario del calor que se genera dentro, con su rango.</li>
<li>Reunir el límite de temperatura de cada pieza, de su hoja de datos o de su ficha en <code>componentes/</code>.</li>
<li>Construir un modelo de red térmica de 57 nodos y resolverlo para el diseño actual y para las variantes.</li>
<li>Medir la incertidumbre con 1 500 casos al azar por configuración, y la sensibilidad a cada parámetro.</li>
<li>Calcular la ventilación forzada: punto de trabajo del ventilador, averías, suciedad y disposición.</li>
<li>Simular el arranque, la avería de los ventiladores y el corte de luz nocturno.</li>
<li>Estudiar el sol, la funda de plástico y el frío.</li>
</ol>

<h2>1.3 Cómo leer las cifras</h2>
<ul>
<li>{HOJA} leído en la hoja de datos, en la ficha del repositorio o en la web del fabricante.</li>
<li>{CALC} sale del modelo o de una cuenta que está en el informe. Se puede repetir con los scripts del anexo B.</li>
<li>{EST} cifra razonada, sin dato de fabricante.</li>
<li>{SUP} lo doy por cierto sin poder comprobarlo.</li>
<li>{GEN} valor de manual o de práctica habitual.</li>
</ul>
<p>Las diferencias de temperatura van en kelvin (K), que valen lo mismo que los grados: +10 K sobre un bar a 25 °C son 35 °C.</p>

<div class="caja aviso">
<h3>Lo que este estudio no es</h3>
<ul>
<li><strong>No es una medida.</strong> El modelo acierta el orden de magnitud y el sentido de cada cambio. En el calentamiento del diseño actual la horquilla razonable es de ±5 K.</li>
<li><strong>La potencia no está medida.</strong> Los 16 W salen de consumos típicos estimados. El calentamiento sin ventilador es casi proporcional a la potencia: {c(R["pendiente"]["actual"])} K por cada vatio.</li>
<li><strong>No es una simulación de fluidos.</strong> El aire interior es un solo nodo con un reparto en altura supuesto. Los puntos calientes locales, como el chip de la Pi, van estimados aparte.</li>
</ul>
</div>
''')

# =================================================================== 2. DISEÑO
W(h1("2", "El diseño visto como problema térmico"))
W(f'''
<figure class="duo"><img src="../../FreeCAD/vista-exterior.png"><img src="../../FreeCAD/vista-interior.png">
<figcaption><b>Figura {FIG[0] + 1}.</b> El diseño A según el CAD del repositorio. A la izquierda, por fuera: en el lateral izquierdo se ven las dos rejillas de tres ranuras, los agujeros del escape del soplido y la ventana de la antena. A la derecha, el frente con el policarbonato: pantalla, Solo, cámara y, detrás, la Pi y el sensor.</figcaption></figure>
''')
FIG[0] += 1
W(fig("f_seccion", "Lo que hay dentro y dónde. Los rectángulos naranjas son las piezas que disipan, con su potencia típica; el punto rojo marca las que tienen el límite en 40 °C. Las flechas azules son las rejillas actuales: una de entrada abajo y dos de salida arriba, de tres ranuras de 22 × 4 mm cada una. Dibujado a escala con las cotas del CAD."))
W(f'''
<h2>2.1 Geometría que manda en el calor</h2>
<table>
<tr><th>Elemento</th><th>Medida</th><th>Por qué importa</th></tr>
<tr><td>Carcasa exterior</td><td>220 × 100 × 442,5 mm, acero de 3 mm</td><td>Es la única superficie que da calor al bar</td></tr>
<tr><td>Zona de componentes</td><td>Los 282 mm de arriba (desde la bandeja)</td><td>Todo el calor se genera aquí, en unos 3 litros de aire</td></tr>
<tr><td>Cajón de componentes</td><td>203,5 × 73 × 228 mm, acero de 1,5 mm, abierto por arriba</td><td>Segunda pared entre la electrónica y la carcasa</td></tr>
<tr><td>Huecos cajón–carcasa</td><td>3,5 mm (izquierda), 7 mm (derecha), 9,5 mm (detrás), 10 mm (debajo)</td><td>Capas de aire quieto: aíslan</td></tr>
<tr><td>Frente</td><td>Policarbonato de 5 mm + panel de 3 mm + policarbonato de 5 mm + 3,3 mm de aire</td><td>La cara más grande y despejada es la que peor conduce</td></tr>
<tr><td>Ventanas del frente</td><td>Pantalla 159 × 91 mm y Solo 85 × 85 mm: 217 cm², el 47 % del frente del cajón</td><td>Ahí no hay acero: policarbonato, aire y policarbonato</td></tr>
<tr><td>Techo</td><td>Tapa interior de 1,5 mm, cámara de aire de 30,5 mm y tapa de 3 mm</td><td>Otra doble pared, justo encima de lo más caliente</td></tr>
<tr><td>Trasera</td><td>220 × 440 mm contra la pared, con 18 tirafondos</td><td>No ve el aire; el calor sale por la pared</td></tr>
<tr><td>Rejillas</td><td>3 rejillas de 3 ranuras de 22 × 4 mm: 2,5 cm² cada una, en la carcasa y repetidas en el cajón</td><td>Único paso de aire. Entrada a 201 mm de la base; salidas a 361 y 374 mm</td></tr>
<tr><td>Zona del cajón de pajitas</td><td>Los 160 mm de abajo, sin fuentes de calor</td><td>Hace de aleta: la chapa conduce calor hacia abajo y lo suelta</td></tr>
</table>
<p class="peq">Medidas {HOJA} del CAD (<code>diseno.py</code>, <code>specs.py</code> y <code>geo.py</code>). El número de ranuras lo he recalculado con la función <code>vent_slots_x</code> y coincide con la vista del visor.</p>

<h2>2.2 Cinco rasgos que explican el resultado</h2>
<ol>
<li><strong>Doble pared.</strong> El calor tiene que pasar del aire interior a la chapa del cajón, cruzar un hueco de aire y llegar a la carcasa antes de salir al bar. Son tres saltos de temperatura en serie donde un armario normal tiene uno.</li>
<li><strong>Frente aislado.</strong> El doble policarbonato deja pasar unos {c(A["Uwin"])} W/m²K, frente a los {c(K["h_ext"], 0)} W/m²K de una chapa pintada al aire {CALC}. El frente es casi la mitad de la superficie libre.</li>
<li><strong>Lo delicado, arriba.</strong> El Solo y el sensor (40 °C) están en el tercio superior del cajón, por encima de la fuente, la pantalla y la Pi. Con convección natural el aire caliente se acumula justo ahí.</li>
<li><strong>Rejillas simbólicas.</strong> Tres ranuras de 22 × 4 mm en dos chapas seguidas dejan pasar {c(A["Q_nat"], 2)} m³/h por tiro natural {CALC}. Sacan {c(A["P_vent"])} W de los 16.</li>
<li><strong>Cajón sin acabado definido.</strong> Una chapa galvanizada o sin pintar emite y absorbe poca radiación (emisividad 0,2–0,3 frente a 0,9 de una pintada {GEN}). En huecos tan estrechos, con las chapas pintadas la radiación lleva más de la mitad del calor; sin pintar, apenas un tercio.</li>
</ol>

<h2>2.3 Materiales</h2>
<table>
<tr><th>Material</th><th class="n">Conductividad<br>W/m·K</th><th class="n">Emisividad</th><th>Origen</th></tr>
<tr><td>Acero DC01 (carcasa y cajón)</td><td class="n">50</td><td class="n">0,2–0,3 sin pintar</td><td>{GEN}; emisividad de tablas (acero laminado 0,24; galvanizado 0,28)</td></tr>
<tr><td>Pintura en polvo</td><td class="n">—</td><td class="n">0,90</td><td>Tablas: pinturas 0,84–0,97</td></tr>
<tr><td>Policarbonato compacto</td><td class="n">0,20</td><td class="n">0,90</td><td>{HOJA} de fabricantes de plancha</td></tr>
<tr><td>Aire a 35 °C</td><td class="n">0,027</td><td class="n">—</td><td>{GEN}</td></tr>
<tr><td>Pared de ladrillo / hormigón</td><td class="n">0,6 / 1,6</td><td class="n">—</td><td>{GEN}</td></tr>
</table>
''')

# =================================================================== 3. CALOR
W(h1("3", "Cuánto calor hay que sacar"))
W(f'''
<p class="lead">Todo lo que entra por el enchufe acaba como calor dentro de la carcasa. Solo se escapa la luz de la pantalla, que son décimas de vatio.</p>
''')
W(fig("f_potencia", "Calor que deja cada pieza. El punto es el valor que usa el proyecto (Bloque 1); la barra, lo que cabe esperar entre un reposo tranquilo y una carga alta sostenida."))
W(f'''
<table>
<tr><th>Pieza</th><th class="n">Mínimo</th><th class="n">Proyecto</th><th class="n">Máximo</th><th>De dónde sale</th></tr>
<tr><td>Raspberry Pi 3B+ y cámara</td><td class="n">2,1 W</td><td class="n">4,6 W</td><td class="n">7,1 W</td><td>Raspberry Pi mide 1,9 W en reposo y 5,8 W a plena carga {HOJA}. Reproducir vídeo queda entre los dos {EST}. La cámara solo gasta durante la prueba</td></tr>
<tr><td>Pantalla de 7″</td><td class="n">2,5 W</td><td class="n">4,1 W</td><td class="n">5,1 W</td><td>5 W según el anuncio; paneles parecidos, 2,4–2,6 W. Depende del brillo</td></tr>
<tr><td>Fuente (pérdidas)</td><td class="n">2,0 W</td><td class="n">3,5 W</td><td class="n">5,0 W</td><td>Rendimiento del 83 % a plena carga {HOJA}; al 25 % de carga, 78 % {EST}</td></tr>
<tr><td>Módem 4G</td><td class="n">0,8 W</td><td class="n">2,0 W</td><td class="n">3,5 W</td><td>Menos de 3,5 W {HOJA}. Sube con mala cobertura</td></tr>
<tr><td>SumUp Solo</td><td class="n">0,3 W</td><td class="n">1,0 W</td><td class="n">2,0 W</td><td>Sin dato oficial {EST}. Tras un corte carga a 7,5 W unas dos horas, pero casi todo se queda en la batería</td></tr>
<tr><td>Sensor ZE29A</td><td class="n">0,1 W</td><td class="n">0,5 W</td><td class="n">1,0 W</td><td>Menos de 500 mA de pico {HOJA}; reposo {EST}</td></tr>
<tr><td>Dos ventiladores</td><td class="n">0,4 W</td><td class="n">0,5 W</td><td class="n">0,5 W</td><td>0,22 W típicos cada uno {HOJA}</td></tr>
<tr><td><strong>Total sin ventiladores</strong></td><td class="n">≈ 8 W</td><td class="n"><strong>{c(A["P"])} W</strong></td><td class="n">≈ 24 W</td><td>Suma</td></tr>
<tr><td><strong>Total con dos ventiladores</strong></td><td class="n"></td><td class="n"><strong>{c(F2["P"])} W</strong></td><td class="n"></td><td>Coincide con los «unos 16 W, entre 13 y 21» del Bloque 1</td></tr>
</table>
<ul>
<li><strong>Uso el valor de proyecto, 16 W, como caso nominal</strong> para que este estudio se pueda comparar con el Bloque 1.</li>
<li><strong>Mi impresión es que la media real será algo menor, de 12 a 14 W</strong> {EST}: los 4,6 W de la Pi son casi su consumo a plena carga y el módem en reposo gasta menos de 2 W. No cambia ninguna conclusión; cambia cuántos kelvin sobran.</li>
<li><strong>Es lo primero que hay que medir.</strong> Un vatímetro de enchufe entre la pared y la máquina da la cifra en un minuto. Con ella, la figura [[f_dT_P]] da el calentamiento sin más cuentas.</li>
<li>La fuente, la pantalla y la Pi suman tres cuartas partes del calor, y las tres están por debajo del Solo y del sensor.</li>
</ul>
''')

# =================================================================== 4. LÍMITES
W(h1("4", "Qué temperatura aguanta cada pieza"))
W(f'''
<p class="lead">Hay tres escalones: tres piezas que no pueden pasar de 40 °C, dos de 50 °C y todo lo demás, que aguanta 70 °C o más. El diseño térmico se decide en el primer escalón.</p>
''')
W(fig("f_limites", "Temperatura máxima de trabajo de cada pieza, según su hoja o su ficha. Las dos líneas verticales son la temperatura del aire junto al Solo que da el modelo con el bar a 25 °C."))
W(f'''
<table>
<thead><tr><th>Pieza</th><th class="c">Trabajo</th><th>Qué pasa si se sale</th><th>Origen</th></tr></thead>
<tr><td><strong>SumUp Solo</strong></td><td class="c">0 a 40 °C</td><td>El manual avisa de que fuera de ese rango puede dañarse. Además, SumUp dice que su bloqueo antimanipulación, que es permanente, puede saltar por condiciones extremas y pide evitar más de 40 °C. Lleva una batería de litio siempre cargada</td><td>{HOJA} manual y ayuda de SumUp</td></tr>
<tr><td><strong>Sensor ZE29A</strong></td><td class="c">10 a 40 °C</td><td>Fuera de rango la lectura deja de estar garantizada. El calor acorta la vida de la celda electroquímica. Por abajo también tiene límite: 10 °C</td><td>{HOJA} manual V1.1</td></tr>
<tr><td><strong>Módem 4G E3372h</strong></td><td class="c">−10 a 40 °C</td><td>Reinicios y caídas de conexión. Él mismo disipa hasta 3,5 W en un cuerpo muy pequeño</td><td>{HOJA} ficha de Huawei</td></tr>
<tr><td>Raspberry Pi 3B+</td><td class="c">0 a 50 °C</td><td>El procesador baja de 1,4 a 1,2 GHz al llegar a 60 °C y recorta más a partir de 80 °C. No se rompe, pero va lenta</td><td>{HOJA} ficha de producto</td></tr>
<tr><td>Cámara Module 3</td><td class="c">0 a 50 °C</td><td>Ruido en la imagen y enfoque menos fiable</td><td>{HOJA} ficha de producto</td></tr>
<tr><td>Pantalla GeeekPi de 7″</td><td class="c">sin dato</td><td>El fabricante no publica la temperatura. Paneles parecidos dan 0–60 °C o −20–70 °C. Tomo 50 °C {SUP}</td><td>Ficha del repositorio</td></tr>
<tr><td>Fuente LRS-50-5</td><td class="c">−30 a 70 °C</td><td>A 230 V da el 100 % hasta 50 °C y baja en línea recta hasta el 60 % a 70 °C. Esta máquina pide el 25 % típico y el 52 % de pico</td><td>{HOJA} curva de la hoja, leída en la figura</td></tr>
<tr><td>Ventiladores Noctua</td><td class="c">−10 a 70 °C</td><td>Vida media declarada de más de 150 000 h</td><td>{HOJA}</td></tr>
<tr><td>microSD, bornes WAGO, cable de PVC</td><td class="c">70 a 85 °C</td><td>Ver la figura. No limitan</td><td>{HOJA} y {GEN}</td></tr>
</table>

<h2>4.1 La carcasa y los materiales</h2>
<table>
<tr><th>Material</th><th>Aguanta</th><th>Origen</th></tr>
<tr><td>Acero y pintura en polvo</td><td>Muy por encima de 100 °C. La pintura se cura a 180–200 °C</td><td>{GEN}</td></tr>
<tr><td>Policarbonato de 5 mm y de 2 mm</td><td>115 °C en uso continuo y 135 °C en ratos cortos. Se deforma con carga a 135 °C</td><td>{HOJA} de plancha extruida</td></tr>
<tr><td>Cinta VHB de la ventana de la antena</td><td>93 °C a largo plazo y 149 °C en ratos cortos</td><td>{HOJA} de 3M</td></tr>
<tr><td>Silentblocks, topes de goma, separadores de nailon, tubo de silicona</td><td>70 °C o más</td><td>{GEN}</td></tr>
</table>
<p><strong>Conclusión:</strong> por temperatura, la estructura no es el problema en ningún caso de este estudio. El caso más caliente que calculo, con sol directo y el bar a 25 °C, deja la chapa a {c(25 + R["ext"]["actual"]["sol300"]["chapa_max"], 0)} °C.</p>

<h2>4.2 Al tacto</h2>
<ul>
<li>La chapa exterior se queda a {s(A["chapa_sup"])} K sobre el bar de media y a {s(A["chapa_max"])} K en su punto más caliente {CALC}. Con el bar a 30 °C son {c(30 + A["chapa_max"], 0)} °C como mucho, y con ventiladores, {c(30 + F2["chapa_max"], 0)} °C.</li>
<li>Por debajo de 44 °C un metal no quema aunque se toque durante horas, según los datos que recogen ASTM C1055 e ISO 13732-1. <strong>No hay riesgo de quemadura</strong>, salvo con sol directo (apartado 11).</li>
<li>Consecuencia práctica: <strong>tocar la chapa por fuera no dice nada de lo que pasa dentro.</strong> Con el interior a 55 °C, la chapa está apenas templada.</li>
</ul>
''')

# =================================================================== 5. MODELO
W(h1("5", "Modelo de cálculo"))
W(f'''
<p class="lead">Una red de resistencias térmicas: cada chapa y cada masa de aire es un nodo con su temperatura, y entre nodos pasa calor por convección, radiación o conducción. Se resuelve el equilibrio de los 57 nodos a la vez.</p>
''')
W(fig("f_red", "El camino del calor en el diseño actual, con el resultado del caso base (bar a 25 °C, 15,7 W). Cada caja es un grupo de nodos con su calentamiento sobre el bar; sobre cada flecha, los vatios que pasan."))
W(f'''
<h2>5.1 Qué nodos tiene</h2>
<ul>
<li><strong>Dentro:</strong> el aire interior, las piezas que disipan (un nodo), la pantalla y la fuente con su caja de red.</li>
<li><strong>Cajón de componentes:</strong> frente, laterales, trasera, base y la tapa interior, cada uno con su temperatura.</li>
<li><strong>Carcasa:</strong> cada una de las cuatro caras partida en 11 franjas de 40 mm de alto, más la tapa, el suelo y la bandeja. Así el modelo ve cómo baja el calor por la chapa hacia la zona del cajón de pajitas.</li>
<li><strong>Fuera:</strong> el aire del bar y la pared.</li>
</ul>

<h2>5.2 Los coeficientes, paso a paso</h2>
''')
ce = K["conv_ext"]
W(calc("Convección natural en las caras exteriores (placa vertical, Churchill y Chu)",
       "Nu = [0,825 + 0,387·Ra<sup>1/6</sup> / (1 + (0,492/Pr)<sup>9/16</sup>)<sup>8/27</sup>]² · · · Ra = g·β·ΔT·L³ / (ν·α) · · · h = Nu·k / L",
       f"L = 0,44 m; ΔT = {c(ce['dT'])} K; Ra = {c(ce['Ra'] / 1e7, 1)}·10⁷; Nu = {c(ce['Nu'], 0)}; h = {c(ce['Nu'], 0)} · 0,0263 / 0,44",
       f"h = {c(ce['h'])} W/m²K con el aire quieto. Multiplicado por 1,15 porque el aire de un bar se mueve algo {EST}: {c(ce['h_f'])} W/m²K"))
W(calc("Radiación de la chapa pintada hacia el local",
       "h<sub>r</sub> = ε·σ·(T<sub>s</sub>² + T<sub>a</sub>²)·(T<sub>s</sub> + T<sub>a</sub>)",
       f"ε = 0,90; T<sub>s</sub> = {c(K['rad_ext']['Ts'] + 273.15, 0)} K; T<sub>a</sub> = 298 K",
       f"h<sub>r</sub> = {c(K['rad_ext']['h'])} W/m²K. Total exterior: {c(K['h_ext'])} W/m²K. La radiación pesa más que la convección"))
hz = K["huecos"]
W(calc("Huecos de aire entre el cajón y la carcasa",
       "h = 1,2·k<sub>aire</sub> / δ + σ·(T<sub>1</sub>² + T<sub>2</sub>²)·(T<sub>1</sub> + T<sub>2</sub>) / (1/ε<sub>1</sub> + 1/ε<sub>2</sub> − 1)",
       f"Trasero, δ = 9,5 mm: 1,2 · 0,0272 / 0,0095 = {c(hz['trasero']['hc'])}. Radiación con el cajón sin pintar (ε 0,3 y 0,85): {c(hz['trasero']['hr_sin'])}; pintado (0,9 y 0,9): {c(hz['trasero']['hr_pint'])}",
       f"Sin pintar: {c(hz['trasero']['hc'] + hz['trasero']['hr_sin'])} W/m²K. Pintado: {c(hz['trasero']['hc'] + hz['trasero']['hr_pint'])} W/m²K. Pintar el cajón multiplica por {c((hz['trasero']['hc'] + hz['trasero']['hr_pint']) / (hz['trasero']['hc'] + hz['trasero']['hr_sin']))} lo que cruza el hueco trasero. El factor 1,2 cubre el poco aire que circula por el hueco {EST}"))
v = K["ventana"]
W(calc("Ventanas del frente: doble policarbonato",
       "U = 1 / (R<sub>hueco 1</sub> + t/k + R<sub>hueco 2</sub> + t/k + 1/h<sub>ext</sub>)",
       f"R<sub>hueco 1</sub> = {c(v['Rg1'], 3)}; policarbonato 0,005/0,20 = {c(v['Rpc'], 3)}; R<sub>hueco 2</sub> (los 3 mm del panel) = {c(v['Rg2'], 3)}; otra vez {c(v['Rpc'], 3)}; 1/h<sub>ext</sub> = {c(v['Ro'], 3)} m²K/W",
       f"U = {c(v['U'], 1)} W/m²K, frente a {c(v['U_chapa'], 1)} de una chapa pintada. Por las dos ventanas (217 cm²) salen {c(A['P_win'])} W"))
rj = K["rejillas"]
W(calc("Tiro natural por las rejillas actuales",
       "Δp = ρ·g·Δz·ΔT/T · · · Q = √(2·Δp / (ρ·ΣK)) · · · P = ρ·c<sub>p</sub>·Q·ΔT<sub>salida</sub>",
       f"Δz = 0,166 m; ΔT de la columna = {c(rj['dTcol'], 0)} K; Δp = {c(rj['dp'], 2)} Pa. Cada rejilla son dos chapas en serie de {c(rj['A_rej'], 2)} cm² con C<sub>d</sub> = 0,65",
       f"Q = {c(rj['Q'], 2)} m³/h. El aire sale a {s(rj['dT_sal'])} K y se lleva {c(rj['P'])} W. Con 0,18 Pa de empuje no se puede pedir más"))
al = K["aleta"]
W(calc("La zona del cajón de pajitas como aleta",
       "m = √(h·P / (k·A<sub>c</sub>)) · · · η = tanh(m·L) / (m·L)",
       f"h = {c(K['h_ext'])} W/m²K; perímetro útil 0,42 m; acero de 3 mm, k = 50 W/m·K; L = 0,16 m; m = {c(al['m'])}&nbsp;m⁻¹; m·L = {c(al['mL'], 2)}",
       f"η = {c(al['eta'], 2)}: la chapa de abajo trabaja al {c(al['eta'] * 100, 0)} % de lo que haría si estuviera tan caliente como la de arriba. Por ahí salen {c(al['P'])} W"))
pa = K["pared"]
W(calc("Calor hacia la pared",
       "G ≈ 4·r<sub>eq</sub>·k<sub>pared</sub> (placa caliente sobre un macizo)",
       f"r<sub>eq</sub> = √(0,22 · 0,44 / π) = {c(pa['r'], 3)} m; ladrillo k = 0,6; hormigón k = 1,6 W/m·K",
       f"Ladrillo: {c(pa['ladrillo'], 2)} W/K; hormigón: {c(pa['hormigon'], 1)} W/K; pladur: del orden de 0,1 W/K {EST}. Caso base: 0,35 W/K"))
W(f'''
<h2>5.3 Comprobaciones del modelo</h2>
<table>
<tr><th>Comprobación</th><th>Resultado</th></tr>
<tr><td>Balance de energía: lo que sale por todos los caminos frente a lo que se genera</td><td>15,69 W frente a 15,69 W</td></tr>
<tr><td>Independencia de la malla: 11, 22 y 44 franjas por cara</td><td>+26,51, +26,54 y +26,55 K</td></tr>
<tr><td>Contraste con la regla de los armarios eléctricos (k = 5,5 W/m²K sobre el área eficaz, montaje en pared), aplicada a la zona de componentes</td><td>Regla: A = 1,4·0,22·(0,282 + 0,10) + 1,8·0,10·0,282 = {c(R["reglas"]["A_sup"], 3)} m²; ΔT = 15,7 / (5,5 · {c(R["reglas"]["A_sup"], 3)}) = <strong>{s(R["reglas"]["dT_sup"], 1)} K</strong>. Modelo con el cajón «transparente» (huecos muy conductores y todo pintado): <strong>{s(R["doble_pared"]["sin"], 1)} K</strong></td></tr>
<tr><td>Lo que añade la doble pared con el cajón sin pintar</td><td>De {s(R["doble_pared"]["sin"], 1)} a {s(R["doble_pared"]["con"], 1)} K: unos {c(R["doble_pared"]["con"] - R["doble_pared"]["sin"], 0)} K</td></tr>
</table>
<p>La tercera fila es la que da confianza: quitando lo que este diseño tiene de particular, el modelo cae sobre la regla empírica que usa la industria para armarios de chapa pintada.</p>

<h2>5.4 Dónde puede fallar</h2>
<ul>
<li><strong>Convección dentro del cajón.</strong> Es el coeficiente peor conocido: 3,5 W/m²K entre el aire y las paredes (rango 2,5–5). Un cajón lleno de cables y placas no se parece a una placa lisa.</li>
<li><strong>Reparto del aire en altura.</strong> Supongo que el aire de arriba está un 30 % más caliente que la media (rango 15–45 %), del orden de lo que maneja la IEC TR 60890 para armarios cerrados. Hay que medirlo con tres sondas a distinta altura.</li>
<li><strong>La pared.</strong> Tomo una conductancia fija. Una pared real tarda horas en calentarse, así que las primeras horas se lleva algo más.</li>
<li><strong>Con ventilador,</strong> el aire interior es un solo nodo bien mezclado. Lo que ve cada pieza depende de por dónde pase la corriente; lo trato con un factor por pieza (apartado 8.2).</li>
</ul>
''')

# =================================================================== 6. RESULTADOS
W(h1("6", "Resultados del diseño actual"))
W(f'''
<p class="lead">Caso base: bar a 25 °C, 15,7 W dentro, rejillas actuales, carcasa pintada, cajón sin pintar y pared de ladrillo.</p>
<table>
<tr><th>Punto</th><th class="n">Sobre el bar</th><th class="n">Con el bar a 25 °C</th><th class="n">Con el bar a 30 °C</th></tr>
<tr><td>Chapa exterior, zona de componentes (media)</td><td class="n">{s(A["chapa_sup"], 1)} K</td><td class="n">{c(25 + A["chapa_sup"], 0)} °C</td><td class="n">{c(30 + A["chapa_sup"], 0)} °C</td></tr>
<tr><td>Chapa del cajón de componentes (media)</td><td class="n">{s(A["cajon"], 1)} K</td><td class="n">{c(25 + A["cajon"], 0)} °C</td><td class="n">{c(30 + A["cajon"], 0)} °C</td></tr>
<tr><td><strong>Aire interior, media</strong></td><td class="n"><strong>{s(A["dT"], 1)} K</strong></td><td class="n"><strong>{c(25 + A["dT"], 0)} °C</strong></td><td class="n"><strong>{c(r30["Ti"], 0)} °C</strong></td></tr>
<tr><td><strong>Aire junto al Solo y al sensor</strong></td><td class="n"><strong>{s(A["local"]["solo"], 1)} K</strong></td><td class="n"><strong>{c(25 + A["local"]["solo"], 0)} °C</strong></td><td class="n"><strong>{c(M["actual"]["30"]["solo"], 0)} °C</strong></td></tr>
<tr><td>Aire junto a la Pi y al módem</td><td class="n">{s(A["local"]["pi"], 1)} K</td><td class="n">{c(25 + A["local"]["pi"], 0)} °C</td><td class="n">{c(M["actual"]["30"]["pi"], 0)} °C</td></tr>
<tr><td>Superficie de la pantalla</td><td class="n">{s(A["Scr"], 0)} K</td><td class="n">{c(25 + A["Scr"], 0)} °C</td><td class="n">{c(30 + A["Scr"], 0)} °C</td></tr>
</table>
''')
W(fig("f_escalera", "De fuera a dentro: cuánto sube la temperatura en cada salto. La chapa exterior apenas se entera (+6 K); los dos saltos grandes están dentro, entre la carcasa y el cajón y entre el cajón y el aire."))
W(f'''
<h2>6.1 Dónde se pierde la temperatura</h2>
<ul>
<li><strong>Del bar a la chapa exterior: {s(A["chapa_sup"])} K.</strong> La carcasa de 3 mm reparte bien el calor y por fuera está casi fría.</li>
<li><strong>De la carcasa al cajón: {s(A["cajon"] - A["chapa_sup"])} K.</strong> Es el precio de los huecos de aire.</li>
<li><strong>Del cajón al aire interior: {s(A["dT"] - A["cajon"])} K.</strong> Poca superficie (0,14 m²) y aire casi quieto.</li>
<li><strong>De la media a la zona del Solo: {s(A["local"]["solo"] - A["dT"])} K.</strong> El aire caliente sube.</li>
<li>Con el interior pintado, el segundo y el tercer salto se reducen y el total baja {c(A["local"]["solo"] - PN["local"]["solo"], 0)} K.</li>
</ul>

<h2>6.2 Por dónde sale el calor</h2>
''')
W(fig("f_caminos", "Reparto de la potencia por camino de salida. A la izquierda, el diseño actual: ningún camino destaca, todos son malos. A la derecha, con dos ventiladores: dos tercios del calor se van con el aire."))
W(f'''
<div class="dos">
<div>
<ul>
<li>Los laterales son la mejor superficie, pero son estrechos: {c(A["caminos"]["laterales"])} W.</li>
<li>El frente entero, entre ventanas y marco, evacua {c(A["caminos"]["ventanas"] + A["caminos"]["frente"])} W, pese a ser la cara más grande.</li>
<li>La pared se lleva {c(A["caminos"]["pared"])} W. En pladur baja a la cuarta parte.</li>
<li>La zona del cajón de pajitas y el suelo, que no generan calor, sacan {c(A["caminos"]["zona_baja"] + A["caminos"]["suelo"])} W gracias a la chapa de 3 mm.</li>
<li>La tapa, con su cámara de aire, solo {c(A["caminos"]["techo"])} W.</li>
</ul>
</div>
<div>
''')
W(fig("f_mapa", "Calentamiento de la chapa exterior por cara y altura (diseño actual). La trasera es la más caliente porque detrás van la fuente y la Pi y porque la pared evacua poco."))
W(f'''</div></div>

<h2>6.3 Con otra potencia</h2>
''')
W(fig("f_dT_P", "Calentamiento del aire junto al Solo según la potencia. Las líneas rojas marcan cuánto puede calentarse como mucho para no pasar de 40 °C con el bar a 25, 30 y 35 °C. Sin ventilador se pasa siempre; con ventilador sobra margen en todo el rango."))
W(f'''
<ul>
<li>Sin ventilador, cada vatio de más son {c(R["pendiente"]["actual"])} K junto al Solo. Con ventiladores, {c(R["pendiente"]["fan2"], 2)} K.</li>
<li>Para que el diseño actual cumpliera con el bar a 25 °C tendría que disipar menos de 7 W. No es realista: solo la pantalla y la Pi en reposo ya suman 4,5 W, sin contar la fuente.</li>
</ul>

<h2>6.4 Cuánto me puedo estar equivocando</h2>
<p>He repetido el cálculo 1 500 veces por configuración, sacando cada parámetro incierto de su rango (anexo A): potencia entre 12 y 21 W, convección interior, emisividades, tipo de pared, aire del bar, calidad de las soldaduras, fugas y reparto en altura.</p>
''')
W(fig("f_mc", f"Resultado de los 1 500 casos por configuración. Ningún caso del diseño actual baja de {s(MCMIN)} K; ningún caso con ventiladores pasa de {s(MCMAX)} K."))
W(fig("f_sens", "Efecto de cada parámetro por separado sobre el diseño actual. Lo que más mueve el resultado es lo que se puede decidir: las rejillas, la potencia y el acabado del cajón. Lo que no se controla (pared, aire del bar, soldaduras) apenas pesa."))
W(f'''
<div class="caja">
<h3>Lectura</h3>
<ul>
<li>En el diseño actual, el aire junto al Solo queda entre {s(MC["actual"]["solo"]["p10"])} y {s(MC["actual"]["solo"]["p90"])} K sobre el bar en el 80 % de los casos, con mediana de {s(MC["actual"]["solo"]["p50"])} K.</li>
<li>Para no pasar de 40 °C con el bar a 25 °C harían falta menos de +15 K. <strong>No lo cumple ninguno de los 1 500 casos.</strong> La conclusión no depende de cómo afine los parámetros.</li>
</ul>
</div>

<h2>6.5 Por qué sale más que en el Bloque 1</h2>
<table>
<tr><th>Punto</th><th>Bloque 1</th><th>Este estudio</th><th class="n">Efecto</th></tr>
<tr><td>Paredes</td><td>Regla de armarios: 5,5 W/m²K sobre 0,15 m², con un 40 % menos por la doble pared: 0,50 W/K</td><td>Red de nodos con cada hueco, el frente de policarbonato, la pared y la zona de abajo: {c((A["P"] - A["P_vent"]) / A["dT"], 2)} W/K, contando las ventanas</td><td class="n">parecido</td></tr>
<tr><td>Rejillas</td><td>4 W por tiro natural, con una chapa</td><td>{c(A["P_vent"])} W: el aire cruza dos chapas seguidas en cada rejilla</td><td class="n">+3 K</td></tr>
<tr><td>Acabado del cajón</td><td>No lo distingue</td><td>Sin pintar como caso base; pintado baja a {s(PN["dT"], 1)} K</td><td class="n">±5 K</td></tr>
<tr><td>Dónde se mide</td><td>Media del aire interior: +24 K</td><td>Media {s(A["dT"], 1)} K, y además la zona del Solo: {s(A["local"]["solo"])} K</td><td class="n">+5 K</td></tr>
</table>
<p>En la media los dos cálculos casi coinciden. Lo nuevo es el reparto en altura: las piezas de 40 °C están en la zona más caliente, y esa es la cifra que hay que comparar con su límite.</p>
''')

# =================================================================== 7. SIN VENTILADOR
W(h1("7", "¿Se arregla sin ventilador?"))
W(f'''
<p class="lead">Lo he intentado antes de dar por buena la ventilación forzada, porque un ventilador es una pieza que se mueve y una abertura por la que entra una copa. La respuesta es que no.</p>
<table>
<tr><th>Medida pasiva</th><th class="n">Aire junto al Solo</th><th class="n">Bar máximo para el Solo</th><th>Pega</th></tr>
<tr><td>Diseño actual</td><td class="n">{s(A["local"]["solo"], 1)} K</td><td class="n">{fl(40 - A["local"]["solo"])} °C</td><td></td></tr>
<tr><td>Pintar el cajón y el interior de la carcasa (mate, cualquier color)</td><td class="n">{s(PN["local"]["solo"], 1)} K</td><td class="n">{fl(40 - PN["local"]["solo"])} °C</td><td>Ninguna. Hay que hacerlo de todos modos</td></tr>
<tr><td>Rejillas 4 veces mayores (10 cm² cada una)</td><td class="n">{s(R["pasiva"]["4"]["solo"], 1)} K</td><td class="n">{fl(40 - R["pasiva"]["4"]["solo"])} °C</td><td>12 ranuras por rejilla</td></tr>
<tr><td>Rejillas 16 veces mayores (40 cm² cada una)</td><td class="n">{s(R["pasiva"]["16"]["solo"], 1)} K</td><td class="n">{fl(40 - R["pasiva"]["16"]["solo"])} °C</td><td>Medio lateral abierto: entran líquidos, dedos y palillos</td></tr>
<tr><td>Las dos cosas: 40 cm² por rejilla e interior pintado</td><td class="n">{s(R["pasiva_max"]["solo"], 1)} K</td><td class="n">{fl(40 - R["pasiva_max"]["solo"])} °C</td><td>Lo mismo, y aun así se queda corta en verano</td></tr>
<tr><td>Bajar la potencia a 12 W (pantalla de 2,4 W, brillo bajo)</td><td class="n">{s(A["local"]["solo"] - 3.7 * R["pendiente"]["actual"], 0)} K</td><td class="n">{fl(40 - (A["local"]["solo"] - 3.7 * R["pendiente"]["actual"]))} °C</td><td>Ayuda, pero sola no basta</td></tr>
</table>
<ul>
<li><strong>Con el tiro natural no hay fuerza:</strong> 17 cm de desnivel y 30 K de diferencia dan 0,18 Pa. Un ventilador de 40 mm da 17 Pa, cien veces más.</li>
<li><strong>La única pasiva que llegaría</strong> es abrir del orden de 40 a 80 cm² arriba y otro tanto abajo. En una máquina de bar «a prueba de balas» eso es peor que un ventilador.</li>
<li><strong>Otra vía sería rehacer la arquitectura:</strong> quitar la doble pared, o atornillar la fuente y la Pi directamente a la carcasa para que la chapa de 3 mm haga de disipador. Choca con el cajón extraíble sobre silentblocks, que es una decisión tomada por otros motivos. No la propongo.</li>
<li><strong>Las medidas pasivas sí valen como red de seguridad:</strong> con el interior pintado, una avería de los ventiladores deja la máquina {c(A["local"]["solo"] - PN["local"]["solo"], 0)} K más fría.</li>
</ul>
''')

# =================================================================== 8. VENTILACIÓN FORZADA
W(h1("8", "Ventilación forzada"))
fn = K["fan"]
W(f'''
<p class="lead">El Bloque 1 propone dos Noctua NF-A4x10 5V, uno metiendo aire y otro sacándolo. Aquí compruebo cuánto aire mueven de verdad, cuánto enfría, dónde tienen que ir y qué pasa cuando fallan.</p>

<h2>8.1 Cuánto aire mueven</h2>
''')
W(calc("Punto de trabajo: curva del ventilador contra la resistencia de las aberturas",
       "n·Δp<sub>máx</sub>·(1 − Q/Q<sub>máx</sub>) = K·(ρ/2)·(Q/A)²",
       f"NF-A4x10 5V: Q<sub>máx</sub> = 8,2 m³/h y Δp<sub>máx</sub> = 1,78 mm H₂O = {c(fn['Pmax'])} Pa. Abertura de Ø38 mm: A = {c(fn['A_o'])} cm². K = 14. Con dos en serie (n = 2) y Q = 5,2 m³/h: velocidad {c(fn['v'], 2)} m/s; lado derecho 14 · {c(fn['pdin'], 2)} = {c(fn['dp_sys'])} Pa; lado izquierdo 2 · {c(fn['Pmax'])} · (1 − 5,2/8,2) = {c(fn['dp_fan'])} Pa",
       "Un ventilador: 4,2 m³/h (51 % de su caudal libre). Dos en serie: 5,2 m³/h (63 %)"))
W(f'''
<ul>
<li><strong>K</strong> es la suma de las pérdidas de todo el recorrido, referida a la abertura de Ø38: dos mallas de protección (unas 3 cada una), dos entradas y salidas bruscas (1,5 cada una), el paso por las dos chapas y los obstáculos de dentro (de 3 a 5). En total, entre 10 y 20; tomo 14 {EST}.</li>
<li>La curva del ventilador la tomo recta entre sus dos datos de catálogo {EST}. La real tiene una panza a medio caudal, así que estos caudales son algo optimistas: por eso el Bloque 1 usó 4,5 m³/h y aquí uso 5,2 con K holgado. La diferencia entre los dos son 0,7 K.</li>
<li>El empuje del aire caliente ({c(fn["empuje"], 2)} Pa) no cuenta frente al ventilador: el sentido de la corriente se elige.</li>
</ul>
<table>
<tr><th>Caudal real (m³/h) según lo limpio que sea el paso</th><th class="n">K = 10</th><th class="n">K = 20</th><th class="n">K = 40</th><th class="n">K = 80</th><th class="n">Catálogo, caudal libre</th></tr>
''')
for nom, cat in (("1 × 40×10", "8,2"), ("2 × 40×10 en serie", "8,2"), ("2 × 40×20 en serie", "9,4"), ("1 × 60×25", "29,2")):
    f_ = R["fan"][nom]
    W(f'<tr><td>{nom.replace("×", " × ").replace("  ", " ")} mm</td>' + "".join(f'<td class="n">{c(f_[k])}</td>' for k in ("K10", "K20", "K40", "K80")) + f'<td class="n">{cat}</td></tr>')
W(f'''</table>
<p class="peq">Caudales libres y presiones {HOJA} de Noctua. El de 60 mm lleva K referido a su abertura de Ø58.</p>
''')
W(fig("f_fan", "Izquierda: curvas de uno y de dos ventiladores de 40 × 10 mm contra tres resistencias del recorrido; los puntos son el caso de cálculo. Derecha: calentamiento del aire que sale según el caudal real, con 16 W dentro."))
W(f'''
<h2>8.2 Cuánto enfría</h2>
''')
W(calc("Balance con ventilación: lo que no sale con el aire sale por las paredes",
       "ΔT<sub>salida</sub> = P / (G<sub>paredes</sub> + ρ·c<sub>p</sub>·Q)",
       f"P = {c(fn['P'])} W; G<sub>paredes</sub> = {c(fn['G_par'], 2)} W/K (del modelo); ρ·c<sub>p</sub>·Q = 1,17 · 1006 · 5,2 / 3600 = {c(fn['rcq'], 2)} W/K",
       f"ΔT<sub>salida</sub> = {c(fn['P'])} / {c(fn['G_par'] + fn['rcq'], 2)} = {s(fn['dT'], 1)} K. En el 80 % de los casos calculados, entre {s(MC['fan2']['media']['p10'], 1)} y {s(MC['fan2']['media']['p90'], 1)} K"))
W(f'''
<p>Lo que ve cada pieza depende de dónde esté respecto a la corriente. Con la entrada junto al Solo y la salida abajo:</p>
<table>
<tr><th>Pieza</th><th class="n">Fracción del calentamiento<br>de salida que ve</th><th class="n">Aire a su lado</th><th>Por qué</th></tr>
<tr><td>SumUp Solo</td><td class="n">0,30 (0,15–0,50)</td><td class="n">{s(F2["local"]["solo"], 1)} K</td><td>Recibe el chorro de entrada, apenas mezclado</td></tr>
<tr><td>Cámara</td><td class="n">0,40</td><td class="n">{s(F2["local"]["camara"], 1)} K</td><td>Arriba, cerca de la entrada</td></tr>
<tr><td>Sensor ZE29A</td><td class="n">0,50 (0,30–0,80)</td><td class="n">{s(F2["local"]["sensor"], 1)} K</td><td>Arriba pero en el lado contrario: aire a medio mezclar</td></tr>
<tr><td>Pi y módem</td><td class="n">0,85</td><td class="n">{s(F2["local"]["pi"], 1)} K</td><td>A media altura, con el aire ya calentado</td></tr>
<tr><td>Pantalla</td><td class="n">1,00</td><td class="n">{s(F2["local"]["pantalla"], 1)} K</td><td>Junto a la salida</td></tr>
<tr><td>Fuente</td><td class="n">1,00 más 6 K</td><td class="n">{s(F2["local"]["fuente"], 1)} K</td><td>Dentro de la caja de red, sin corriente directa</td></tr>
</table>
<p class="peq">Fracciones {EST}; son lo que el ensayo del apartado 14 tiene que confirmar con una sonda en cada punto.</p>

<h2>8.3 Dónde van la entrada y la salida</h2>
<p><strong>El principio del Bloque 1 es el correcto:</strong> el aire fresco entra por donde está lo que menos aguanta y sale por donde está lo que más calienta. Al llevarlo a las cotas del CAD salen cuatro cosas:</p>
<table>
<tr><th>Punto</th><th>Qué he comprobado en el CAD</th><th>Qué propongo</th></tr>
<tr><td><strong>Entrada</strong></td><td>En el lateral derecho, arriba (donde hoy está la rejilla, a unos 345–390 mm de la base), el Solo queda a unos 12 mm del lateral del cajón. Un ventilador de 10 mm de grueso cabe, muy justo</td><td>Entrada ahí, soplando hacia el Solo. A confirmar en el bloque 3</td></tr>
<tr><td><strong>Salida «por la caja de red»</strong></td><td>A la altura de la caja de red, el lateral derecho lo ocupa la toma C14 (de 49 a 87 mm de fondo). Delante quedan 33 mm: <strong>una abertura de Ø38 no cabe</strong>. Además, el frente de la caja de red solo tiene 4 ranuras de 20 × 4 mm ({c(R["fan_cajared"]["A_cm2"])} cm²): si todo el aire pasa por ahí, el caudal baja de 5,2 a {c(R["fan_cajared"]["Q"])} m³/h</td><td><strong>Salida abajo a la izquierda</strong>, donde hoy está la rejilla de entrada: hay 49 mm de fondo entre pestañas y 46 mm de alto bajo la placa de la antena. Cabe un 40 mm, justo; hay que mover los dos topes de goma de esa zona</td></tr>
<tr><td><strong>La fuente</strong></td><td>Con la salida a la izquierda, la fuente queda en un rincón sin corriente</td><td>No importa: admite 70 °C y pasa su calor a la trasera del cajón. Sí conviene abrir 10 cm² o más de ranuras en la caja de red para que respire</td></tr>
<tr><td><strong>Ventilador de 60 mm</strong></td><td>El Bloque 1 lo dejaba abierto «si cabe». En los laterales hay 49 mm de fondo entre las pestañas del cajón: <strong>un 60 mm no cabe</strong></td><td>Dos de 40 mm. Si el fondo interior lo permite, el de salida de 40 × 20 mm</td></tr>
</table>
<ul>
<li><strong>Las rejillas actuales no valen como salida de un ventilador.</strong> Tres ranuras en dos chapas son un K de {c(R["fan_rejilla"]["K"], 0)}: el caudal se queda en {c(R["fan_rejilla"]["Q"])} m³/h y el aire sale a +12,8 K. Hacen falta aberturas de verdad, de Ø38 o equivalentes.</li>
<li><strong>El sensor queda a media corriente.</strong> Para darle también aire fresco, dejaría abierta la rejilla de arriba a la izquierda y pondría a la salida el ventilador más fuerte: con la caja en ligera depresión, esa rejilla aspira aire del bar justo al lado del sensor {EST}.</li>
<li><strong>Burlete entre cajón y carcasa en cada abertura</strong>, como ya dice el Bloque 1. Sin él, el ventilador de entrada sopla al hueco entre las dos chapas y el aire vuelve a salir sin pasar por dentro.</li>
<li><strong>Aberturas con lamas hacia abajo o con un deflector por dentro</strong>, para que una copa tirada de lado no entre. Esa protección es parte del K = 14.</li>
</ul>

<h2>8.4 Averías y suciedad</h2>
<table>
<tr><th>Situación</th><th class="n">Caudal</th><th class="n">Aire que sale</th><th class="n">Junto al Solo,<br>bar a 30 °C</th><th>Valoración</th></tr>
<tr><td>Dos ventiladores, mallas limpias</td><td class="n">5,2 m³/h</td><td class="n">{s(F2["dT"], 1)} K</td><td class="n">{c(M["fan2"]["30"]["solo"], 0)} °C</td><td>Normal</td></tr>
<tr><td>Un ventilador parado (el otro tira a través de él)</td><td class="n">{c(R["fan_fallo"]["Q"])} m³/h</td><td class="n">{s(R["fan_fallo"]["dT"], 1)} K</td><td class="n">{c(30 + 0.4 * R["fan_fallo"]["dT"], 0)} °C</td><td>Sigue en ficha. Avisar y cambiarlo en la siguiente visita</td></tr>
<tr><td>Mallas tapadas al 50 %</td><td class="n">{c(R["fan_sucio"]["50"])} m³/h</td><td class="n">{s(R["fan_sucio_dT"]["50"], 1)} K</td><td class="n">{c(30 + 0.35 * R["fan_sucio_dT"]["50"], 0)} °C</td><td>Sigue en ficha</td></tr>
<tr><td>Mallas tapadas al 75 %</td><td class="n">{c(R["fan_sucio"]["75"])} m³/h</td><td class="n">{s(R["fan_sucio_dT"]["75"], 1)} K</td><td class="n">{c(30 + 0.45 * R["fan_sucio_dT"]["75"], 0)} °C</td><td>Al límite en verano. La sonda lo ve; los tacómetros no</td></tr>
<tr><td>Mallas tapadas al 90 %, o una funda encima</td><td class="n">{c(R["fan_sucio"]["90"])} m³/h</td><td class="n">{s(R["fan_sucio_dT"]["90"], 1)} K</td><td class="n">{c(30 + 0.7 * R["fan_sucio_dT"]["90"], 0)} °C</td><td>Fuera de ficha</td></tr>
<tr><td>Los dos parados</td><td class="n">tiro natural</td><td class="n">{s(R["fallo_total"]["dT"], 0)} K de media</td><td class="n">{c(30 + R["fallo_total"]["solo"], 0)} °C</td><td>Como el diseño actual. Hay que dejar de cobrar</td></tr>
</table>
<p class="peq">Con poco caudal la corriente deja de barrer y el Solo ve una fracción mayor del calentamiento; por eso en las filas degradadas uso fracciones de 0,35 a 0,7 {EST}.</p>

<h2>8.5 Los ventiladores pasan a ser una pieza crítica</h2>
<ul>
<li><strong>Hoy los dos cuelgan del mismo fusible</strong> (W31 del Bloque 1, MINI de 2 A). Un fusible, un empalme o un cable dejan la máquina sin ventilación de golpe. Propongo <strong>un fusible por ventilador</strong>: son dos portafusibles en vez de uno.</li>
<li><strong>Los tacómetros no bastan.</strong> Un ventilador puede girar a sus vueltas con la malla tapada o con una funda encima. Hace falta <strong>una sonda de temperatura junto al Solo</strong> (una DS18B20 al GPIO4, unos 3 €), que mide lo que de verdad importa.</li>
<li><strong>Tres fuentes de temperatura para el programa:</strong> la sonda, la <code>battery_temperature</code> que da la API de SumUp y la del procesador de la Pi (<code>vcgencmd measure_temp</code>). Umbrales en el apartado 13.</li>
<li><strong>Polvo.</strong> De acuerdo con el Bloque 1: malla metálica y no filtro de espuma. Con malla, lo que se tapa se ve desde fuera y se limpia con la mano.</li>
</ul>
''')

# =================================================================== 9. MÁRGENES
W(h1("9", "Temperatura de cada pieza y del bar"))
W(f'''
<p class="lead">Las dos tablas dan la temperatura del aire junto a cada pieza según la temperatura del bar. Verde: dentro de ficha con 5 K o más de margen. Amarillo: dentro, con menos de 5 K. Rojo: fuera.</p>
''')
BARES = ["15", "20", "25", "27", "30", "35", "40"]


def tabla_margen(k, titulo):
    out = [f'<h2>{titulo}</h2><table><tr><th>Pieza</th><th class="c">Límite</th>' + "".join(f'<th class="c">Bar a {b} °C</th>' for b in BARES) + "</tr>"]
    for comp in R["comp"]:
        fila = f'<tr><td>{comp["nombre"]}</td><td class="c">{comp["tmax"]} °C</td>'
        for b in BARES:
            t = M[k][b][comp["clave"]]
            mg = comp["tmax"] - t
            cl, sim = ("ok", "✓") if mg >= 5 else (("justo", "!") if mg >= 0 else ("mal", "✗"))
            fila += f'<td class="cel"><span class="st {cl}">{sim} {c(t, 0)}</span></td>'
        out.append(fila + "</tr>")
    out.append("</table>")
    return "".join(out)


W(tabla_margen("actual", "9.1 Diseño actual"))
W(tabla_margen("fan2", "9.2 Con dos ventiladores de 40 mm"))
W(f'''<p class="ley"><span class="st ok">✓ en ficha, margen ≥ 5 K</span><span class="st justo">! en ficha, margen &lt; 5 K</span><span class="st mal">✗ fuera de ficha</span> Temperaturas en °C {CALC}. Pantalla: límite de 50 °C {SUP}. Fuente: aire dentro de la caja de red.</p>

<h2>9.3 Temperatura máxima del bar, pieza a pieza</h2>
<table>
<tr><th>Pieza</th><th class="n">Diseño actual</th><th class="n">Interior pintado</th><th class="n">1 ventilador</th><th class="n">2 ventiladores</th></tr>
''')
for comp in R["comp"]:
    k_ = comp["clave"]
    W(f'<tr><td>{comp["nombre"]} ({comp["tmax"]} °C)</td>' + "".join(f'<td class="n">{fl(BM[x][k_])} °C</td>' for x in ("actual", "pintado", "fan1", "fan2")) + "</tr>")
W(f'''<tr><td><strong>Todo en ficha</strong></td>''' + "".join(f'<td class="n"><strong>{fl(bar_todo[x])} °C</strong></td>' for x in ("actual", "pintado", "fan1", "fan2")) + f'''</tr>
</table>
<ul>
<li>Con ventilación, <strong>quien limita ya no es el Solo sino el módem</strong>: tiene el mismo límite de 40 °C y está a media altura, donde el aire ya va calentado. Si gana el montaje (b) del Bloque 1, con el módem tras la ventana de la antena, conviene que quede en la corriente de entrada.</li>
<li>Un bar climatizado está entre 21 y 26 °C: el reglamento español de instalaciones térmicas no deja calentar por encima de 21 °C ni enfriar por debajo de 26 °C. Con ventilación quedan de 8 a 13 K de margen. Un bar sin aire acondicionado en agosto puede pasar de 30 °C, y ahí el margen es de 4 K.</li>
</ul>

<h2>9.4 La Pi por dentro</h2>
<ul>
<li>El límite de 50 °C es del aire que la rodea. Lo que la frena es el procesador: a 60 °C baja de 1,4 a 1,2 GHz y a partir de 80 °C recorta más {HOJA}.</li>
<li>En las pruebas publicadas, la 3B+ gasta 1,9 W en reposo y 5,8 W a plena carga, y a plena carga llega enseguida a sus 60 °C en una mesa. De ahí saco unos 9–11 K por vatio entre el procesador y el aire {EST}.</li>
<li>Con unos 3 W reproduciendo vídeo, el procesador va de 27 a 33 K por encima del aire que lo rodea:</li>
</ul>
<table>
<tr><th>Caso</th><th class="n">Aire junto a la Pi</th><th class="n">Procesador (estimado)</th><th>Efecto</th></tr>
<tr><td>Diseño actual, bar a 25 °C</td><td class="n">{c(M["actual"]["25"]["pi"], 0)} °C</td><td class="n">{c(M["actual"]["25"]["pi"] + 27, 0)}–{c(M["actual"]["25"]["pi"] + 33, 0)} °C</td><td>Recorte fuerte: vídeo a saltos</td></tr>
<tr><td>Dos ventiladores, bar a 25 °C</td><td class="n">{c(M["fan2"]["25"]["pi"], 0)} °C</td><td class="n">{c(M["fan2"]["25"]["pi"] + 27, 0)}–{c(M["fan2"]["25"]["pi"] + 33, 0)} °C</td><td>En el umbral de los 60 °C</td></tr>
<tr><td>Dos ventiladores, bar a 35 °C</td><td class="n">{c(M["fan2"]["35"]["pi"], 0)} °C</td><td class="n">{c(M["fan2"]["35"]["pi"] + 27, 0)}–{c(M["fan2"]["35"]["pi"] + 33, 0)} °C</td><td>A 1,2 GHz casi siempre</td></tr>
</table>
<ul>
<li><strong>Dos medidas baratas:</strong> un disipador de aluminio pegado al procesador (unos 3 €; de 5 a 10 K menos {EST}) y <code>temp_soft_limit=70</code> en <code>config.txt</code>, que sube el primer umbral de 60 a 70 °C y es el máximo que admite ese ajuste.</li>
<li>Esto refuerza la prueba C1 del Bloque 1: los vídeos hay que probarlos con la caja cerrada y caliente, no sobre la mesa.</li>
</ul>

<h2>9.5 La fuente</h2>
''')
W(fig("f_fuente", "Curva de reducción de carga de la LRS-50-5 a 230 V, leída en la hoja de Mean Well, con los puntos de trabajo de la máquina. Cada trazo vertical va del consumo típico (25 %) al pico (52 %). La fuente queda dentro de su zona en todos los casos."))
W(f'''
<ul>
<li>La ficha del repositorio dejaba esta curva como «ilegible». En la figura de la hoja se lee bien: <strong>100 % hasta 50 °C y bajada recta hasta el 60 % a 70 °C</strong>, a 230 V {HOJA}.</li>
<li>La fuente no limita. Lo que sí cambia con el calor es su vida (apartado 12).</li>
</ul>

<h2>9.6 El Solo por dentro</h2>
<ul>
<li>Los 40 °C son del aire que lo rodea. Su batería irá de 3 a 5 K por encima mientras no cargue, y más cuando cargue tras un corte {EST}.</li>
<li>Las guías de carga de las baterías de litio (JEITA) reducen la carga por encima de 45 °C y la cortan entre 50 y 60 °C {GEN}. En el diseño actual, con el bar a 25 °C, la batería del Solo estaría a unos 60 °C: probablemente ni cargaría.</li>
</ul>

<div class="caja ok">
<h3>Respuesta a «qué temperatura soporta»</h3>
<ul>
<li><strong>La carcasa y los materiales:</strong> más de 70 °C en continuo. No limitan.</li>
<li><strong>La máquina tal como está dibujada:</strong> un bar a {fl(bar_todo["actual"])} °C con todo en ficha. En un bar normal, a 22–26 °C, el Solo y el sensor trabajarían a 53–57 °C.</li>
<li><strong>La máquina con dos ventiladores:</strong> hasta unos <strong>{fl(bar_todo["fan2"])} °C de bar</strong> con todo en ficha, y {fl(BM["fan2"]["solo"])} °C si solo se mira el Solo. Como especificación de instalación propongo <strong>bares de 10 a 32 °C</strong>, que deja 2 K para lo que el modelo no ve.</li>
<li><strong>Por abajo:</strong> 10 °C en el sensor. Con los ventiladores parados en frío, la máquina se calienta sola y admite bares de hasta unos 0 °C (apartado 11).</li>
<li><strong>Al sol directo:</strong> no, en ningún caso.</li>
</ul>
</div>
''')

# =================================================================== 10. TRANSITORIOS
W(h1("10", "Arranque, averías y cortes de luz"))
W(f'''
<p class="lead">El mismo modelo, ahora con la masa de cada pieza: la máquina almacena unos {c(R["C_total"] / 1000)} kJ por kelvin, casi todo en la chapa.</p>
''')
W(fig("f_trans", "Temperatura del aire junto al Solo con el bar a 25 °C. Izquierda: desde que se enchufa en frío. Derecha: desde que se paran los dos ventiladores estando en régimen."))
W(f'''
<h2>10.1 Arranque en frío</h2>
<ul>
<li><strong>Diseño actual:</strong> el aire junto al Solo pasa de 40 °C a los <strong>{int(round(T["actual_t40"] * 60))} minutos</strong> de enchufar. Llega al 63 % de su subida en {int(round(T["actual_63"] * 60))} minutos y al 95 % en {c(T["actual_95"])} horas.</li>
<li><strong>Con ventiladores:</strong> se estabiliza en menos de {c(T["fan2_95"], 1)} horas, a {c(25 + T["fan2_fin"], 0)} °C.</li>
<li>El aire interior responde rápido porque dentro hay poca masa: placas, cables y un cajón de 1,9 kg. La chapa exterior tarda más, pero solo aporta 6 de los 31 K.</li>
<li><strong>Para el ensayo E1 del Bloque 1, 4 horas bastan:</strong> a las 4 h el modelo está al 99 % del valor final.</li>
</ul>

<h2>10.2 Avería de la ventilación</h2>
<ul>
<li>Si se paran los dos ventiladores con el bar a 25 °C, el aire junto al Solo pasa de {c(T["fallo_ini"], 0)} a 40 °C en unos <strong>{int(round(T["fallo_t40"] * 60))} minutos</strong> y se estabiliza en {c(T["fallo_fin"], 0)} °C.</li>
<li>Con el bar a 30 °C son unos {int(round(T["fallo_t40_30"] * 60))} minutos; a 35 °C, menos de {max(2, int(round(T["fallo_t40_35"] * 60)) + 1)}.</li>
<li>La subida es tan rápida porque las piezas ya están calientes: con ventilación la Pi y la pantalla trabajan unos 23 K por encima del bar y es el aire quien las enfría. Al pararse el aire, ese calor se queda dentro en minutos. El modelo supone que el aire caliente tarda unos 10 minutos en acumularse arriba {SUP}.</li>
<li><strong>Consecuencia:</strong> el programa no tiene horas para reaccionar, tiene minutos. Tiene que leer la sonda cada pocos segundos, bajar el consumo en cuanto vea el primer umbral y dejar de cobrar en el segundo.</li>
</ul>

<h2>10.3 Corte de luz nocturno</h2>
<ul>
<li>Apagada, la máquina se enfría sola: en {c(T_ENFRIA, 1)} horas el aire interior está a menos de 2 K del bar.</li>
<li>Un corte de 7 horas la deja a la temperatura del local. Cada mañana arranca en frío y repite la curva de la figura.</li>
<li>Para el calor esto es bueno: las noches apagada son horas a temperatura ambiente para la batería del Solo y para los condensadores de la fuente.</li>
<li>Para el Solo es su prueba difícil por otro motivo, que ya está en el Bloque 1 (prueba A1): que arranque solo.</li>
</ul>
''')

# =================================================================== 11. SOL, FUNDA, FRÍO
W(h1("11", "Sol, funda y frío"))
E = R["ext"]
W(fig("f_ext", "Calentamiento medio del aire interior en cinco situaciones. «Funda que tapa las aberturas»: en el diseño actual equivale a sellar las rejillas; con ventiladores supongo que el caudal cae a 1 m³/h."))
W(f'''
<h2>11.1 Sol directo</h2>
''')
W(calc("Calor del sol sobre el frente y un lateral",
       "P<sub>sol</sub> = q<sub>abs</sub>·(A<sub>frente</sub> + A<sub>lateral</sub>) · · · q<sub>abs</sub> = α·I",
       f"A<sub>frente</sub> = 0,22 · 0,44 = {c(K['sol']['frente'], 3)} m²; A<sub>lateral</sub> = {c(K['sol']['lado'], 3)} m². Tras un escaparate llegan de 300 a 600 W/m² {EST}; el rosa absorbe más o menos la mitad y la pantalla negra, casi todo: q<sub>abs</sub> de 150 a 300 W/m²",
       f"De {c(K['sol']['W150'], 0)} a {c(K['sol']['W300'], 0)} W de más: entre una y casi tres veces lo que genera la propia máquina"))
W(f'''
<table>
<tr><th>Sol absorbido</th><th>Configuración</th><th class="n">Aire interior</th><th class="n">Chapa más caliente</th><th class="n">Pantalla</th><th class="n">Pantalla con el bar a 25 °C</th></tr>
<tr><td rowspan="2">150 W/m² (débil u oblicuo)</td><td>Diseño actual</td><td class="n">{s(E["actual"]["sol150"]["dT"])} K</td><td class="n">{s(E["actual"]["sol150"]["chapa_max"])} K</td><td class="n">{s(E["actual"]["sol150"]["Scr"])} K</td><td class="n">{c(25 + E["actual"]["sol150"]["Scr"], 0)} °C</td></tr>
<tr><td>2 ventiladores</td><td class="n">{s(E["fan2"]["sol150"]["dT"])} K</td><td class="n">{s(E["fan2"]["sol150"]["chapa_max"])} K</td><td class="n">{s(E["fan2"]["sol150"]["Scr"])} K</td><td class="n">{c(25 + E["fan2"]["sol150"]["Scr"], 0)} °C</td></tr>
<tr><td rowspan="2">300 W/m² (directo)</td><td>Diseño actual</td><td class="n">{s(E["actual"]["sol300"]["dT"])} K</td><td class="n">{s(E["actual"]["sol300"]["chapa_max"])} K</td><td class="n">{s(E["actual"]["sol300"]["Scr"])} K</td><td class="n">{c(25 + E["actual"]["sol300"]["Scr"], 0)} °C</td></tr>
<tr><td>2 ventiladores</td><td class="n">{s(E["fan2"]["sol300"]["dT"])} K</td><td class="n">{s(E["fan2"]["sol300"]["chapa_max"])} K</td><td class="n">{s(E["fan2"]["sol300"]["Scr"])} K</td><td class="n">{c(25 + E["fan2"]["sol300"]["Scr"], 0)} °C</td></tr>
</table>
<ul>
<li>Los ventiladores salvan el aire interior, pero <strong>no salvan la pantalla ni el Solo</strong>: el sol entra por las ventanas del frente y los calienta directamente, detrás de dos policarbonatos que no dejan salir ese calor.</li>
<li>Una pantalla a {c(25 + E["fan2"]["sol300"]["Scr"], 0)} °C está en la zona en la que un LCD empieza a oscurecerse {GEN}, y el Solo recibe lo mismo en su cara.</li>
<li>Con sol directo la chapa llega a {c(25 + E["actual"]["sol300"]["chapa_max"], 0)} °C: por encima del umbral de quemadura por contacto prolongado.</li>
<li><strong>Regla de instalación:</strong> ninguna hora de sol directo sobre la máquina, tampoco a través de un cristal. Si un local solo tiene ese sitio, no se instala.</li>
</ul>

<h2>11.2 La funda de plástico</h2>
<ul>
<li><strong>Bien hecha no molesta.</strong> Una funda de 2 mm ajustada a los laterales y la tapa añade unos 0,02 m²K/W: {s(E["actual"]["funda2"]["dT"] - E["actual"]["base"]["dT"], 1)} K en el diseño actual y nada apreciable con ventiladores. Por la chapa sale poco calor; taparla cambia poco.</li>
<li><strong>Mal hecha es una avería.</strong> Si tapa las aberturas, la máquina ventilada se va a {s(E["fan2"]["funda_tapa"]["dT"])} K. La funda tiene que dejar libres la entrada, la salida, la rejilla que quede y la ventana de la antena, con margen alrededor.</li>
<li><strong>Material.</strong> El PLA de impresión 3D empieza a ablandarse hacia 55–60 °C {GEN}. En condiciones normales la chapa no llega, pero con sol sí. Mejor PETG o ABS.</li>
<li>La funda no puede ir por delante: el frente ya es la cara peor.</li>
</ul>

<h2>11.3 Fuentes de calor cercanas</h2>
<ul>
<li>El modelo toma como «bar» el aire que rodea la máquina, no el del termostato del local.</li>
<li>Encima de un radiador, junto a la salida de aire de un botellero o una nevera, al lado de la cafetera o bajo un foco halógeno, ese aire puede estar de 5 a 15 K por encima del resto {EST}. Cada kelvin ahí es un kelvin dentro.</li>
<li><strong>Regla de instalación:</strong> a más de un metro de cualquier salida de aire caliente y nunca encima de un radiador.</li>
</ul>

<h2>11.4 Frío</h2>
<table>
<tr><th>Bar</th><th class="n">Sensor, ventiladores en marcha</th><th class="n">Sensor, ventiladores parados</th><th class="n">Solo, ventiladores en marcha</th></tr>
''')
for Ta in ("0", "5", "10", "15"):
    fr = R["frio"][Ta]
    cl = "mal" if fr["fan2"]["sensor"] < 10 else "ok"
    W(f'<tr><td>{Ta} °C</td><td class="n">{c(fr["fan2"]["sensor"], 0)} °C{" (bajo su mínimo de 10 °C)" if cl == "mal" else ""}</td><td class="n">{c(fr["actual"]["sensor"], 0)} °C</td><td class="n">{c(fr["fan2"]["solo"], 0)} °C</td></tr>')
W(f'''</table>
<ul>
<li>Con los ventiladores siempre en marcha, el sensor baja de sus 10 °C cuando el bar baja de unos 7 °C. Con los ventiladores parados, la máquina se calienta sola y el sensor está a más de 30 °C aunque el bar esté a 0 °C.</li>
<li><strong>Propuesta:</strong> que los ventiladores no giren siempre. Parados por debajo de unos 25 °C en la sonda interior y en marcha por encima de 30 °C. Hace falta un transistor o un relé en su rama, o la versión PWM del mismo ventilador.</li>
<li>Ventajas: el sensor trabaja templado, que es como mejor mide y como menos condensa el aliento en el tubo; los ventiladores duran más; y entra menos polvo.</li>
<li>Tras una noche apagada en un local frío, la máquina arranca a la temperatura del bar. Si está por debajo de 10 °C, el programa tiene que esperar a que la sonda suba antes de dar una prueba por válida.</li>
</ul>
''')

# =================================================================== 12. VIDA ÚTIL
W(h1("12", "Calor y vida útil"))
dTf = (25 + A["local"]["fuente"]) - (25 + F2["local"]["fuente"])
W(f'''
<p class="lead">Estar dentro de ficha no basta para dos años. Tres piezas envejecen según la temperatura a la que pasen el tiempo, y en las tres la ventilación cambia el resultado.</p>

<h2>12.1 Batería del Solo</h2>
<table>
<tr><th>Temperatura de la batería, siempre al 100 % de carga</th><th class="n">Capacidad que queda al cabo de un año</th></tr>
<tr><td>0 °C</td><td class="n">94 %</td></tr>
<tr><td>25 °C</td><td class="n">80 %</td></tr>
<tr><td>40 °C</td><td class="n">65 %</td></tr>
<tr><td>60 °C</td><td class="n">60 % a los 3 meses</td></tr>
</table>
<p class="peq">Datos de Battery University para celdas de litio corrientes {HOJA}. El Solo va siempre enchufado: es exactamente este caso.</p>
<ul>
<li><strong>Diseño actual, bar a 25 °C:</strong> batería a unos 60 °C. Es la última fila: una batería agotada en meses, con riesgo de que se hinche.</li>
<li><strong>Con ventiladores, bar a 25 °C:</strong> batería a unos 30–32 °C. Entre la segunda y la tercera fila: del orden del 75 % al año y algo más de la mitad a los dos años {EST}.</li>
<li>Como va enchufado, perder capacidad no le impide cobrar. Lo que importa es que no se hinche y que aguante encendido un corte corto. A dos años con ventilación es razonable; sin ella, no.</li>
<li>Coincido con el Bloque 1: el Solo es una pieza que se cambia en la visita de los dos años.</li>
</ul>

<h2>12.2 Condensadores de la fuente</h2>
''')
W(calc("Vida de los condensadores electrolíticos: se dobla cada 10 °C menos",
       "L<sub>2</sub> / L<sub>1</sub> = 2<sup>(T<sub>1</sub> − T<sub>2</sub>) / 10</sup>",
       f"Aire junto a la fuente con el bar a 25 °C: {c(25 + A['local']['fuente'], 0)} °C en el diseño actual y {c(25 + F2['local']['fuente'], 0)} °C con ventiladores. Diferencia: {c(dTf, 0)} K",
       f"2<sup>{c(dTf / 10, 2)}</sup> = {c(2 ** (dTf / 10), 1)}: con ventilación, los condensadores de la fuente duran unas {c(2 ** (dTf / 10), 0)} veces más"))
W(f'''
<ul>
<li>Los electrolíticos son la única pieza de una fuente que se desgasta, y su vida depende casi solo de la temperatura {GEN}.</li>
<li>La hoja de la LRS-50 no da horas de vida, solo un MTBF de 561 600 h a 25 °C. Ese dato es estadístico y a 55 °C vale bastante menos.</li>
</ul>

<h2>12.3 El resto</h2>
<table>
<tr><th>Pieza</th><th>Qué le hace el calor</th><th>Qué hacer</th></tr>
<tr><td>Pantalla</td><td>La retroiluminación pierde brillo antes cuanto más caliente trabaja. Paneles parecidos dan 20 000 h a mitad de brillo; dos años encendida son 17 500 h</td><td>Brillo al mínimo útil y apagarla en las horas de cierre: menos calor y menos horas</td></tr>
<tr><td>Sensor ZE29A</td><td>Las celdas electroquímicas pierden electrolito más deprisa con calor y aire seco {GEN}. El manual no da vida</td><td>Tenerlo entre 15 y 35 °C: ni en el punto caliente ni en el chorro frío de invierno</td></tr>
<tr><td>Ventiladores</td><td>Más de 150 000 h de vida media declarada y trabajo hasta 70 °C {HOJA}. Dos años son 17 500 h</td><td>No giran siempre (apartado 11.4)</td></tr>
<tr><td>microSD, Pi, módem</td><td>Dentro de ficha no hay un mecanismo de desgaste claro</td><td>—</td></tr>
</table>
''')

# =================================================================== 13. CAMBIOS
W(h1("13", "Cambios recomendados"))
W(f'''
<p class="lead">Por orden de importancia. Los tres primeros son los que cambian el resultado; el resto son baratos y quitan riesgos.</p>
<table class="larga">
<thead><tr><th style="width:4%">N.º</th><th style="width:34%">Cambio</th><th style="width:30%">Efecto</th><th style="width:14%">Coste</th><th>Dónde se hace</th></tr></thead>
<tr><td>1</td><td><strong>Ventilación forzada con dos ventiladores de 40 mm:</strong> entrada arriba a la derecha junto al Solo, salida abajo a la izquierda. Aberturas de Ø38 con malla y lamas, y burlete entre cajón y carcasa</td><td>Aire junto al Solo de {s(A["local"]["solo"])} a {s(F2["local"]["solo"])} K. Bar máximo de {fl(bar_todo["actual"])} a {fl(bar_todo["fan2"])} °C</td><td>Unos 40 € por máquina</td><td>CAD (bloque 3) y compras</td></tr>
<tr><td>2</td><td><strong>Un fusible por ventilador</strong> en vez de uno para los dos</td><td>Un fallo eléctrico ya no deja la máquina sin ventilación</td><td>Un portafusibles</td><td>Tabla de cableado (W31)</td></tr>
<tr><td>3</td><td><strong>Sonda de temperatura junto al Solo</strong> (DS18B20) y umbrales en el programa: a 36 °C baja el brillo y avisa; a 38 °C avisa como avería; a 40 °C deja de cobrar hasta que baje de 37 °C</td><td>La máquina se protege sola en los minutos que tiene. Detecta mallas tapadas, fundas y sol, que los tacómetros no ven</td><td>Unos 3 €</td><td>Compras y programa (bloque 4)</td></tr>
<tr><td>4</td><td><strong>Cajón de componentes e interior de la carcasa pintados</strong> en mate, de cualquier color. Nunca galvanizado brillante sin pintar</td><td>{c(A["local"]["solo"] - PN["local"]["solo"], 0)} K menos cuando la ventilación falla. De paso resuelve el óxido del cajón</td><td>El de pintar por dentro</td><td>Pedido al taller</td></tr>
<tr><td>5</td><td><strong>Ventiladores con control:</strong> parados por debajo de 25 °C en la sonda, en marcha por encima de 30 °C</td><td>Sensor templado en invierno, menos polvo y más vida</td><td>Un transistor, o la versión PWM</td><td>Cableado y programa</td></tr>
<tr><td>6</td><td><strong>Reglas de instalación:</strong> nunca al sol, a más de un metro de salidas de aire caliente, bares de 10 a 32 °C, aberturas despejadas</td><td>Evita los casos que ningún ventilador arregla</td><td>Ninguno</td><td>Hoja de instalación</td></tr>
<tr><td>7</td><td><strong>Disipador en el procesador de la Pi</strong> y <code>temp_soft_limit=70</code></td><td>La Pi no baja de velocidad en verano</td><td>Unos 3 €</td><td>Compras y sistema</td></tr>
<tr><td>8</td><td><strong>Más ranuras en la caja de red</strong> (10 cm² o más entre frente y base)</td><td>La fuente respira aunque no reciba corriente directa</td><td>Ninguno</td><td>CAD</td></tr>
<tr><td>9</td><td><strong>Menos vatios:</strong> brillo al mínimo útil, pantalla apagada en el cierre y módem fijado en 4G</td><td>De 1 a 3 W menos. Con ventilación son décimas de kelvin, pero alargan la vida de la pantalla y dan margen si falla</td><td>Ninguno</td><td>Programa</td></tr>
<tr><td>10</td><td><strong>Funda</strong> que deje libres las aberturas y la antena, en PETG o ABS</td><td>No convierte un accesorio en una avería</td><td>Ninguno</td><td>Diseño de la funda</td></tr>
<tr><td>11</td><td><strong>Medir el consumo real</strong> con un vatímetro de enchufe en cuanto haya banco</td><td>Sustituye la mayor incógnita del estudio por un dato</td><td>Unos 15 €</td><td>Banco</td></tr>
</table>

<div class="caja">
<h3>Lo que no cambiaría</h3>
<ul>
<li><strong>La doble pared y el cajón extraíble.</strong> Cuestan unos {c(R["doble_pared"]["con"] - R["doble_pared"]["sin"], 0)} K sin ventilación, pero con ventilación dejan de importar: el calor se va con el aire.</li>
<li><strong>El doble policarbonato.</strong> Aísla el frente, pero protege lo más caro y con ventilación tampoco limita.</li>
<li><strong>La fuente.</strong> Trabaja holgada en todos los casos.</li>
<li><strong>La chapa de 3 mm.</strong> Reparte muy bien el calor: la zona del cajón de pajitas saca {c(A["caminos"]["zona_baja"] + A["caminos"]["suelo"])} W sin generar ninguno.</li>
</ul>
</div>
''')

# =================================================================== 14. ENSAYO
W(h1("14", "Plan de ensayo"))
W(f'''
<p class="lead">Es el ensayo E1 del Bloque 1, ampliado para que además diga si este modelo acierta. Necesita una carcasa de prototipo con el cajón montado; no hace falta que cobre.</p>

<h2>14.1 Instrumentación</h2>
<table>
<tr><th>Sonda</th><th>Dónde</th><th>Para qué</th></tr>
<tr><td>T0</td><td>Aire de la sala, a 1 m de la máquina y a su altura, a la sombra</td><td>Referencia</td></tr>
<tr><td>T1</td><td>Aire a 1 cm del canto superior del Solo</td><td>El dato que decide</td></tr>
<tr><td>T2</td><td>Aire junto al sensor ZE29A</td><td>Segunda pieza de 40 °C</td></tr>
<tr><td>T3</td><td>Aire junto al módem</td><td>Tercera pieza de 40 °C</td></tr>
<tr><td>T4, T5, T6</td><td>Aire en el eje del cajón, a 20, 110 y 210 mm de su base</td><td>Media y reparto en altura</td></tr>
<tr><td>T7</td><td>Aire dentro de la caja de red</td><td>Fuente</td></tr>
<tr><td>T8</td><td>Chapa exterior, centro del lateral derecho, pegada con cinta</td><td>Comprobar que por fuera apenas se nota</td></tr>
<tr><td>T9</td><td>Aire en la boca de salida</td><td>Caudal real, por balance</td></tr>
<tr><td>—</td><td><code>vcgencmd measure_temp</code> y <code>battery_temperature</code> del Solo, registradas cada minuto</td><td>Procesador y batería</td></tr>
<tr><td>—</td><td>Vatímetro de enchufe</td><td>Potencia real</td></tr>
</table>
<p>Valen termopares tipo K con un registrador o diez DS18B20 en un mismo bus leídas por la propia Pi.</p>

<h2>14.2 Pasos</h2>
<table>
<tr><th>Paso</th><th>Qué se hace</th><th>Duración</th><th>Lo que predice el modelo (sobre T0)</th></tr>
<tr><td>1</td><td>Máquina cerrada en la pared, programa en espera con vídeo, <strong>ventiladores parados y sus aberturas tapadas con cinta</strong>. <strong>Sin el Solo:</strong> en su sitio, una resistencia de 1 W. Es el paso que lo pondría en riesgo</td><td>3 h</td><td>T1 ≈ {s(R["conf"]["sellado"]["local"]["solo"])} K; media de T4–T6 ≈ {s(R["conf"]["sellado"]["dT"])} K; T8 ≈ {s(R["conf"]["sellado"]["chapa_sup"])} K. Parar si T1 pasa de 65 °C</td></tr>
<tr><td>2</td><td>Quitar la cinta, ventiladores en marcha</td><td>2 h</td><td>T9 ≈ {s(F2["dT"])} K (de {s(MC["fan2"]["media"]["p10"])} a {s(MC["fan2"]["media"]["p90"])}); T1 ≈ {s(F2["local"]["solo"])} K; T2 ≈ {s(F2["local"]["sensor"])} K; T3 ≈ {s(F2["local"]["modem"])} K</td></tr>
<tr><td>3</td><td>Desenchufar un ventilador</td><td>1 h</td><td>T9 ≈ {s(R["fan_fallo"]["dT"])} K</td></tr>
<tr><td>4</td><td>Tapar media malla de entrada y media de salida</td><td>1 h</td><td>T9 ≈ {s(R["fan_sucio_dT"]["50"])} K</td></tr>
<tr><td>5</td><td>Parar los dos ventiladores con las aberturas libres y cronometrar</td><td>30 min</td><td>T1 llega a T0 + 15 K en unos {int(round(T["fallo_t40"] * 60))} minutos</td></tr>
<tr><td>6</td><td>Prueba completa con cobro simulado cada 2 minutos durante 30 minutos</td><td>30 min</td><td>Sin cambio apreciable sobre el paso 2</td></tr>
</table>

<h2>14.3 Criterio de aceptación</h2>
<ul>
<li><strong>Paso 2:</strong> T1 y T2 a menos de 5 K sobre la sala y T3 a menos de 8 K. Es el criterio del Bloque 1, con el módem añadido.</li>
<li><strong>Paso 3:</strong> T1 a menos de 8 K sobre la sala con un ventilador parado.</li>
<li><strong>Procesador de la Pi</strong> por debajo de 70 °C en el paso 2 con la sala a 25 °C.</li>
<li>Si el paso 2 no cumple: revisar el burlete y las mallas antes que nada. Después, ventilador de salida de 40 × 20 mm.</li>
</ul>

<h2>14.4 Cómo corregir el modelo con las medidas</h2>
''')
W(calc("Conductancia real de la máquina cerrada y caudal real de los ventiladores",
       "G<sub>cerrada</sub> = P / ΔT<sub>media</sub> (paso 1) · · · Q = (P − G<sub>paredes</sub>·ΔT<sub>salida</sub>) / (ρ·c<sub>p</sub>·ΔT<sub>salida</sub>) (paso 2)",
       f"El modelo da G<sub>cerrada</sub> = {c(R['conf']['sellado']['P'] / R['conf']['sellado']['dT'], 2)} W/K y G<sub>paredes</sub> = {c(K['fan']['G_par'], 2)} W/K con ventilación. Ejemplo: si en el paso 2 se miden 14 W y T9 = +7 K, Q = (14 − 0,88 · 7) / (1,17 · 1006 · 7) · 3600",
       "Q = 3,4 m³/h. Con el caudal real, la figura [[f_fan]] da el margen que queda"))
W(f'''
<p>Con la potencia medida y esos dos números se rehacen las tablas del apartado 9 en una tarde. Los scripts están preparados para ello (anexo B).</p>
''')

# =================================================================== 15. CONCLUSIONES
W(h1("15", "Conclusiones"))
W(f'''
<ol>
<li><strong>El diseño A, tal como está en el CAD, no es viable térmicamente.</strong> El aire junto al Solo y al sensor queda unos {c(A["local"]["solo"], 0)} K por encima del bar, y esas piezas tienen el límite en 40 °C. El resultado aguanta cualquier combinación razonable de parámetros.</li>
<li><strong>No es un fallo de una pieza sino de la arquitectura:</strong> doble pared, frente aislado, rejillas mínimas y lo delicado arriba. Las medidas pasivas razonables dan de 6 a 10 K y hacen falta más de 20 para un verano.</li>
<li><strong>La ventilación forzada lo resuelve con mucho margen:</strong> 5 m³/h bastan para dejar el Solo a {s(F2["local"]["solo"])} K y el aire de salida a {s(F2["dT"])} K. Dos ventiladores de 40 mm los dan con holgura y con redundancia.</li>
<li><strong>La temperatura que soporta la máquina ventilada es un bar de 10 a 32 °C como especificación,</strong> con el límite real hacia {fl(bar_todo["fan2"])} °C. La carcasa en sí aguanta mucho más; mandan el Solo, el sensor y el módem.</li>
<li><strong>La ventilación pasa a ser crítica y hay que tratarla como tal:</strong> fusibles separados, tacómetros, sonda de temperatura y corte del cobro por programa. Si se para, hay unos {int(round(T["fallo_t40"] * 60))} minutos.</li>
<li><strong>Hay tres casos que ningún ventilador arregla</strong> y van a la hoja de instalación: sol directo, fuentes de calor cercanas y aberturas tapadas.</li>
<li><strong>Para los dos años sin visitas, el calor deja de ser el problema principal</strong> si se hace lo anterior. Quedan los que ya señala el Bloque 1: el arranque del Solo tras un corte, el pago a través del frente y la cobertura.</li>
</ol>
<div class="caja">
<h3>Siguiente paso que propongo</h3>
<p>Llevar al CAD las dos aberturas y los dos ventiladores en las posiciones del apartado 8.3, comprobar que caben y pedir <strong>una</strong> carcasa de prototipo. Con ella, el ensayo del apartado 14 dura una tarde y cierra el tema térmico con medidas.</p>
</div>
''')

# =================================================================== ANEXO A
W(h1("A", "Anexo: parámetros del modelo"))
W(f'''
<table class="larga">
<thead><tr><th>Parámetro</th><th class="n">Caso base</th><th class="n">Rango en los 1 500 casos</th><th>Origen</th></tr></thead>
<tr><td>Potencia total sin ventiladores (con dos ventiladores, 0,6 W más)</td><td class="n">15,7 W</td><td class="n">12 – 21 W</td><td>Bloque 1; reparto: fuente 3,45, pantalla 4,08, resto 8,16 W</td></tr>
<tr><td>Convección del aire interior a las paredes del cajón</td><td class="n">3,5 W/m²K</td><td class="n">2,5 – 5,0</td><td>{EST}: placa vertical de 0,23 m con 10–20 K de salto</td></tr>
<tr><td>Convección de las piezas al aire interior</td><td class="n">6,0 W/m²K</td><td class="n">4,5 – 8,0</td><td>{EST}: cuerpos de 5–10 cm</td></tr>
<tr><td>Superficie de las piezas que disipan</td><td class="n">0,050 m²</td><td class="n">fija</td><td>Medidas del CAD; aparte, pantalla 0,020 m² y caja de red 0,022 m²</td></tr>
<tr><td>Factor de visión de las piezas hacia las paredes</td><td class="n">0,7</td><td class="n">0,5 – 0,9</td><td>{EST}</td></tr>
<tr><td>Emisividad exterior (pintura en polvo y policarbonato)</td><td class="n">0,90</td><td class="n">0,85 – 0,95</td><td>Tablas de emisividad</td></tr>
<tr><td>Emisividad de la cara interior de la carcasa</td><td class="n">0,85</td><td class="n">0,60 – 0,92</td><td>{SUP}: la pintura entra en la carcasa abierta</td></tr>
<tr><td>Emisividad del cajón, sin pintar</td><td class="n">0,30</td><td class="n">0,20 – 0,45</td><td>Tablas: acero laminado 0,24; galvanizado 0,28</td></tr>
<tr><td>Emisividad del cajón, pintado</td><td class="n">0,90</td><td class="n">0,80 – 0,95</td><td>Tablas</td></tr>
<tr><td>Conducción en los huecos de aire (multiplicador)</td><td class="n">1,2</td><td class="n">1,0 – 1,6</td><td>{EST}: 1,0 es aire quieto</td></tr>
<tr><td>Convección exterior (multiplicador por el aire del bar)</td><td class="n">1,15</td><td class="n">1,0 – 1,5</td><td>{EST}</td></tr>
<tr><td>Conductancia hacia la pared</td><td class="n">0,35 W/K</td><td class="n">0,1 – 1,0</td><td>{CALC}: pladur, ladrillo y hormigón</td></tr>
<tr><td>Contacto de la trasera con la pared</td><td class="n">30 W/m²K</td><td class="n">fijo</td><td>{EST}: medio milímetro de aire de media</td></tr>
<tr><td>Calidad térmica de las uniones por puntos</td><td class="n">0,5</td><td class="n">0,3 – 1,0</td><td>{EST}: 1 sería chapa continua</td></tr>
<tr><td>Conductividad del acero</td><td class="n">50 W/m·K</td><td class="n">45 – 55</td><td>{GEN}</td></tr>
<tr><td>Contacto de la fuente con la trasera del cajón</td><td class="n">1,0 W/K</td><td class="n">0,3 – 3,0</td><td>{EST}: 81 cm² de contacto seco</td></tr>
<tr><td>Contacto de la tapa y de la tapa interior con la carcasa</td><td class="n">0,10 W/K</td><td class="n">0,03 – 0,30</td><td>{EST}</td></tr>
<tr><td>Rejillas: área de cada una y coeficiente de descarga</td><td class="n">2,54 cm²; 0,65</td><td class="n">0,55 – 0,75</td><td>CAD; {GEN}</td></tr>
<tr><td>Fugas de aire por arriba (holgura de la tapa interior)</td><td class="n">0,5 cm²</td><td class="n">0 – 2 cm²</td><td>{EST}</td></tr>
<tr><td>Reparto en altura: aire de arriba respecto a la media</td><td class="n">1,30</td><td class="n">1,15 – 1,45</td><td>{EST}; a la altura del Solo resulta 1,17</td></tr>
<tr><td>Caudal con dos ventiladores</td><td class="n">5,2 m³/h</td><td class="n">3,5 – 6,5</td><td>{CALC}, apartado 8.1</td></tr>
<tr><td>Fracción del calentamiento de salida que ve el Solo</td><td class="n">0,30</td><td class="n">0,15 – 0,50</td><td>{EST}</td></tr>
<tr><td>Mejora de la convección interior con aire forzado</td><td class="n">× 1,25</td><td class="n">fija</td><td>{EST}</td></tr>
</table>
''')

# =================================================================== ANEXO B
W(h1("B", "Anexo: cómo repetir el cálculo"))
W(f'''
<p>Todo el estudio sale de unos scripts de Python (NumPy y Matplotlib). Están en el repositorio, en <code>carcasa/diseno-A/estudio-termico/codigo/</code>.</p>
<table>
<tr><th>Archivo</th><th>Qué hace</th></tr>
<tr><td><code>termico.py</code></td><td>El modelo: propiedades del aire, correlaciones, la red de 57 nodos, el estado estacionario y el transitorio. Todos los parámetros están en la clase <code>P</code></td></tr>
<tr><td><code>analisis_conf.py</code></td><td>Las configuraciones estudiadas: actual, pintado, sellado y las tres con ventilador</td></tr>
<tr><td><code>analisis.py</code></td><td>Corre todos los casos: configuraciones, potencia, caudal, sensibilidad, los 1 500 casos al azar, márgenes, sol, funda, frío y transitorios. Escribe <code>resultados.json</code></td></tr>
<tr><td><code>calc.py</code></td><td>Las cuentas paso a paso que aparecen en los recuadros</td></tr>
<tr><td><code>fig_*.py</code>, <code>estilo.py</code></td><td>Las figuras</td></tr>
<tr><td><code>informe.py</code>, <code>estilo.css</code></td><td>Montan este documento con los números de <code>resultados.json</code></td></tr>
</table>
<p><strong>Para rehacerlo con datos medidos</strong> basta cambiar en <code>analisis_conf.py</code> la potencia (<code>P_psu</code>, <code>P_scr</code>, <code>P_rest</code>) y el caudal (<code>Q_fan</code>), y en <code>termico.py</code> los coeficientes que el ensayo corrija. Después: <code>python3 analisis.py</code>, <code>python3 calc.py</code>, los <code>fig_*.py</code> y <code>python3 informe.py</code>.</p>
<p><strong>Si cambia la geometría</strong> (aberturas, huecos, espesores), las cotas están al principio de la clase <code>P</code>, con los mismos nombres y valores que en <code>carcasa/diseno-A/modelo/diseno.py</code>.</p>
''')

# =================================================================== FUENTES
W('<h1 class="pb">Fuentes</h1>')
W(f'''
<h2>Del proyecto</h2>
<ul class="fuentes">
<li>CAD del diseño A (04-11-2026): <code>carcasa/diseno-A/modelo/diseno.py</code>, <code>specs.py</code>, <code>geo.py</code> y <code>comp.py</code>; <code>carcasa/diseno-A/README.md</code>; vistas de <code>carcasa/diseno-A/FreeCAD/</code>.</li>
<li><code>DECISIONES.md</code>, entradas del 27-10 al 04-11-2026.</li>
<li>Bloque 1 · Componentes eléctricos (13-11-2026) y <code>bloque1/cuentas.py</code>; Verificación del diseño (12-11-2026).</li>
<li>Fichas de <code>componentes/</code>: SumUp Solo, Winsen ZE29A, módem Huawei E3372h, Raspberry Pi 3B+, Camera Module 3, pantalla GeeekPi, Mean Well LRS-50-5, SanDisk High Endurance y WAGO 221.</li>
<li>Hojas de datos en copia local: Mean Well LRS-50 (edición 2025-04-07, curva de la página 3), manual del ZE29A V1.1, ficha de la Raspberry Pi 3B+ y ficha de la Touch Display 2.</li>
</ul>
<h2>De fabricantes y normas, consultadas el 13-11-2026</h2>
<ul class="fuentes">
<li>SumUp, información de seguridad del Solo (rango de trabajo de 0 a 40 °C): <a href="https://www.manualslib.com/manual/3046632/Sumup-Solo.html?page=12">manualslib.com/manual/3046632/Sumup-Solo.html</a> y <a href="https://fcc.report/FCC-ID/2A39U-PRIN001/6289620.pdf">fcc.report/FCC-ID/2A39U-PRIN001/6289620.pdf</a></li>
<li>SumUp, «Avoid blocked readers» (bloqueo permanente; evitar más de 40 °C y menos de 0 °C): <a href="https://help.sumup.com/en-IE/articles/1fH1DQy2SCfsXvrdb76MS0">help.sumup.com/en-IE/articles/1fH1DQy2SCfsXvrdb76MS0</a></li>
<li>Noctua, especificaciones del NF-A4x10 5V, NF-A4x20 5V y NF-A6x25 5V: <a href="https://noctua.at/en/nf-a4x10-5v/specification">noctua.at/en/nf-a4x10-5v/specification</a>, <a href="https://noctua.at/en/nf-a4x20-5v/specification">noctua.at/en/nf-a4x20-5v/specification</a>, <a href="https://noctua.at/en/nf-a6x25-5v/specification">noctua.at/en/nf-a6x25-5v/specification</a></li>
<li>Raspberry Pi, «Thermal testing Raspberry Pi 4» (consumo de la 3B+ en reposo y en carga): <a href="https://www.raspberrypi.com/blog/thermal-testing-raspberry-pi-4/">raspberrypi.com/blog/thermal-testing-raspberry-pi-4</a></li>
<li>Raspberry Pi, documentación de gestión térmica (límite blando de 60 °C y <code>temp_soft_limit</code>): <a href="https://github.com/raspberrypi/documentation/pull/1348/files">github.com/raspberrypi/documentation/pull/1348</a>; valor máximo de 70 °C: <a href="https://www.brainboxes.com/?p=2381">brainboxes.com/?p=2381</a></li>
<li>Rittal, catálogo técnico de climatización de armarios (k = 5,5 W/m²K para chapa de acero en interior): <a href="https://www.rittal.com/imf/none/3_8419/3312800_Documentaci_oacute_n_t_eacute_cnica_EN">rittal.com/imf/none/3_8419</a>; fórmula del área eficaz para montaje contra pared: <a href="https://storage.electrika.com/flips/0700-univ-encl-15/files/assets/basic-html/page-521.html">storage.electrika.com/flips/0700-univ-encl-15</a></li>
<li>IEC TR 60890:2022, método de cálculo del calentamiento del aire en envolventes: <a href="https://standards.iteh.ai/catalog/standards/iec/7a954d7c-2b57-4c93-8b3b-f930bc8b227c/iec-tr-60890-2022">standards.iteh.ai (IEC TR 60890:2022)</a></li>
<li>Plancha de policarbonato extruido, datos técnicos (0,2 W/m·K; 115 °C en uso continuo): <a href="https://cdn.shopify.com/s/files/1/0468/4742/6721/files/EN_IMPEX_ProductGuide_08-2022.pdf">Impex, guía de producto 08-2022</a></li>
<li>3M, cinta VHB 4949 (93 °C a largo plazo, 149 °C a corto): <a href="https://www.3m.com/3M/en_US/p/d/b40072029/">3m.com/3M/en_US/p/d/b40072029</a></li>
<li>Battery University, BU-808 (capacidad tras un año según temperatura y carga): <a href="https://batteryuniversity.com/article/how-to-prolong-lithium-based-batteries">batteryuniversity.com/article/how-to-prolong-lithium-based-batteries</a></li>
<li>Texas Instruments, SLYT365 (guías JEITA de carga de baterías de litio): <a href="https://ti.com/lit/pdf/slyt365">ti.com/lit/pdf/slyt365</a></li>
<li>XP Power y TDK, vida de los condensadores electrolíticos (se dobla cada 10 °C menos): <a href="https://www.xppower.com/resources/blog/electrolytic-capacitor-lifetime-in-power-supplies">xppower.com/resources/blog/electrolytic-capacitor-lifetime-in-power-supplies</a>, <a href="https://product.tdk.com/en/contact/faq/power-supplies-0018.html">product.tdk.com/en/contact/faq/power-supplies-0018.html</a></li>
<li>Tablas de emisividad: <a href="https://blog.thermoworks.com/emissivity/">blog.thermoworks.com/emissivity</a></li>
<li>Umbral de quemadura por contacto con metal (ASTM C1055 e ISO 13732-1, citadas en un trabajo de NACE): <a href="https://www.electro-tech-online.com/custompdfs/2013/09/Insulative_Coating_Evaluation_NACE.pdf">Insulative Coating Evaluation, NACE</a></li>
<li>Real Decreto 1826/2009, que modifica el RITE (IT 3.8.2: 21 °C en calefacción y 26 °C en refrigeración): <a href="https://www.boe.es/eli/es/rd/2009/11/27/1826/con">boe.es/eli/es/rd/2009/11/27/1826/con</a></li>
</ul>
<h2>De manual</h2>
<ul class="fuentes">
<li>Convección natural en placa vertical: correlación de Churchill y Chu (1975). Capa de aire horizontal calentada por abajo: Hollands y otros (1976). Placas horizontales, aletas y radiación entre superficies grises: como las recoge cualquier texto de transmisión de calor (por ejemplo, Incropera y DeWitt).</li>
</ul>
''')

# =================================================================== MONTAJE
import re
html = "".join(partes)
html = re.sub(r"\[\[(\w+)\]\]", lambda m_: str(FIGN[m_.group(1)]), html)
doc = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Estudio térmico del alcoholímetro · diseño A</title>
<link rel="stylesheet" href="estilo.css"></head><body>{html}</body></html>'''
open("informe.html", "w").write(doc)
SALIDA = "../Estudio_termico_alcoholimetro.pdf"
subprocess.run(["google-chrome", "--headless=new", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={SALIDA}", "informe.html"],
               check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
os.remove("informe.html")
from pypdf import PdfReader
print("páginas:", len(PdfReader(SALIDA).pages), "· figuras:", FIG[0], "·", round(os.path.getsize(SALIDA) / 1e6, 2), "MB")
