#!/usr/bin/env python3
"""Monta el informe en HTML a partir de los resultados (../resultados/*.json) y lo convierte a PDF con Chrome.

Revisión 2 (13-11-2026): cobro con myPOS Sigma en un hueco del frente y fuente de 12 V."""
import json, sys, subprocess, os, math
from dataclasses import replace
import numpy as np
from termico import P, resolver, caminos
import analisis_conf as AC

R = json.load(open("../resultados/resultados.json"))
K = json.load(open("../resultados/calc.json"))
A, PN, F1, F2, F60 = (R["conf"][k] for k in ("actual", "pintado", "fan1", "fan2", "fan60"))
MC = R["mc"]; T = R["trans"]; M = R["margenes"]; BM = R["bar_max"]
SO = R["solo"]                      # revisión 1 (SumUp Solo), recalculada con el mismo modelo
SOA, SOF = SO["actual"], SO["fan2"]
DI = R["disposicion"]
MEJ = R["mejor_caso"]
KP = K["potencia"]; KS = K["sigma"]


def c(x, d=1):
    return f"{x:.{d}f}".replace(".", ",")


def s(x, d=0):
    return ("+" if x >= 0 else "−") + c(abs(x), d)


def fl(x):
    """Entero por abajo: para temperaturas máximas, redondear hacia el lado seguro."""
    return str(int(math.floor(x))).replace("-", "−")


def mins(h):
    return int(round(h * 60))


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


PB = {"13", "A"}


def h1(n, t):
    return f'<h1 class="{"pb" if n in PB else ""}"><span class="n">{n}</span>{t}</h1>'


# ------------------------------------------------------------------ valores derivados
r30 = resolver(replace(AC.CONF["actual"]["p"], Ta=30.0))
bar_todo = {k: min(v.values()) for k, v in BM.items()}
bar_quien = {k: min(v, key=v.get) for k, v in BM.items()}
bar_todo_solo = {k: min(v["bar_max"].values()) for k, v in SO.items()}
NOMC = {x["clave"]: x["nombre"] for x in R["comp"]}
bar_disp = {k: min(v["bar_max"].values()) for k, v in DI.items()}

_mc = np.load("../resultados/mc.npz")
MCMIN, MCMAX = float(np.floor(_mc["actual"][:, 1].min())), float(np.ceil(_mc["fan2"][:, 1].max()))
assert _mc["actual"][:, 1].min() > 15.0
_tr = np.load("../resultados/trans.npz")
_i = np.argmax((_tr["corte_solo"] - 25.0) < 2.0)
T_ENFRIA = float(_tr["corte_t"][_i])
# comprobaciones del modelo: balance de energía e independencia de la malla
_rb = resolver(AC.BASE, detalle=True)
BALANCE = sum(caminos(AC.BASE, _rb).values())
MALLA = [resolver(replace(AC.BASE, N=n))["dT"] for n in (11, 22, 44)]
NNODOS = len(_rb["_names"])
G_SELL = R["conf"]["sellado"]["P"] / R["conf"]["sellado"]["dT"]
SE = R["conf"]["sellado"]
RSIG = [resolver(replace(AC.BASE, R_sig=x))["dT"] for x in (0.015, 0.06)]
FCARA = (1 / KS["ho"]) / (KS["R"] + 1 / KS["ho"])      # parte del calentamiento interior del Sigma que llega a su cara
partes = []
W = partes.append

# =================================================================== PORTADA
W(f'''
<section class="portada">
  <div class="sup">Alcoholímetro · diseño A (Compacta) · revisión 2 · 13-11-2026</div>
  <h0>Estudio térmico<br>con el myPOS Sigma</h0>
  <div class="sub">Qué cambia en el calor de la máquina al sustituir el SumUp Solo por un terminal de cobro para máquinas y pasar a una fuente de 12 V.</div>
  <div class="tiles">
    <div class="tile"><div class="l">Límite del lector de tarjetas</div><div class="v">70 °C</div>
      <div class="d">El Solo se quedaba en 40 °C, con batería y con un bloqueo permanente. El Sigma deja de ser la pieza que manda.</div></div>
    <div class="tile"><div class="l">Aire junto al sensor, sin ventilador</div><div class="v">{s(A["local"]["sensor"])} K</div>
      <div class="d">sobre el bar, con {c(A["P"], 0)} W dentro ({c(A["P"] - SOA["P"], 0)} W más que con el Solo). Con el bar a 25 °C son {c(25 + A["local"]["sensor"], 0)} °C; el sensor y el módem siguen en 40 °C.</div></div>
    <div class="tile"><div class="l">Lo mismo con dos ventiladores de 40 mm</div><div class="v">{s(F2["local"]["sensor"])} K</div>
      <div class="d">con la entrada de aire junto al sensor. El aire sale a {s(F2["dT"])} K. Los ventiladores siguen haciendo falta.</div></div>
    <div class="tile"><div class="l">Bar más caliente que soporta con ventilación</div><div class="v">≈ {fl(bar_todo["fan2"])} °C</div>
      <div class="d">Igual que con el Solo: limita el módem (40 °C). Sin ventilador serían {fl(bar_todo["actual"])} °C.</div></div>
  </div>
  <div class="pie">Preparado para Guillermo Aladro Abad · cálculo de Claude sobre el CAD del 04-11-2026, las cargas de la revisión de componentes y la opción 3 del estudio de cobro (13-11-2026).<br>
  <strong>Todo es cálculo: no hay nada montado ni medido.</strong> El consumo del Sigma no está publicado y va estimado. Sustituye a la revisión 1 (con el Solo), que se conserva en <code>historico-solo/</code>.</div>
</section>
''')

# =================================================================== RESUMEN
W(f'''
<h1>Resumen</h1>
<p class="lead">Lectura que he tomado del encargo: rehacer el estudio térmico con lo que hablamos por voz, es decir, con el myPOS Sigma (la opción 3 del estudio de cobro) en lugar del SumUp Solo y con una fuente de 12 V. Como caso base pongo el Sigma en un hueco del frente, arriba a la derecha, una Mean Well LRS-50-12 en el sitio de la LRS-50-5 y un convertidor de 12 a 5 V para todo lo demás. El resto del diseño es el del CAD del 04-11-2026.</p>

<h2>Lo que sale del estudio</h2>
<ol>
<li><strong>El Sigma quita de en medio la pieza más frágil.</strong> Trabaja de −20 a 70 °C, no lleva batería y no tiene el bloqueo permanente del Solo {HOJA}. En ningún caso de este estudio se sale de su ficha.</li>
<li><strong>Pero la máquina no se enfría: se calienta más.</strong> Pasa de {c(SOA["P"], 1)} a {c(A["P"], 0)} W. El Sigma es un terminal Android con pantalla propia y gasta unos {c(KP["sigma"], 0)} W {EST}, frente a 1 W del Solo; y convertir de 12 a 5 V cuesta otros {c(KP["p_dcdc"], 0)} W. En el mejor de los casos, con un Sigma de 1,5 W y la fuente que menos pierde, serían {c(MEJ["P"], 0)} W: lo mismo que con el Solo, no menos.</li>
<li><strong>Dentro siguen dos piezas de 40 °C: el sensor y el módem.</strong> El sensor está arriba, a la misma altura que estaba el Solo. Sin ventilador, el aire a su lado queda a {s(A["local"]["sensor"])} K sobre el bar (entre {s(MC["actual"]["sensor"]["p10"])} y {s(MC["actual"]["sensor"]["p90"])} K en el 80 % de los casos); con el Solo eran {s(SOA["local"]["sensor"])} K.</li>
<li><strong>Corrijo dos cosas que te adelanté por voz sin hacer la cuenta.</strong> Dije que el calor total apenas cambiaría y que, sin ventilación, el bar máximo subiría de 8 a unos 12 °C. Hecho el cálculo, el calor sube {c(A["P"] - SOA["P"], 0)} W y el bar máximo sin ventilación <strong>baja de {fl(bar_todo_solo["actual"])} a {fl(bar_todo["actual"])} °C</strong>. En el mejor caso serían {fl(MEJ["bar_max"])} °C: prácticamente igual.</li>
<li><strong>Los dos ventiladores de 40 mm siguen siendo imprescindibles, y siguen bastando.</strong> Con unos 5 m³/h reales el aire sale a {s(F2["dT"], 1)} K (con el Solo, {s(SOF["dT"], 1)} K). El sensor ve {s(F2["local"]["sensor"])} K y el módem {s(F2["local"]["modem"])} K. La máquina soporta bares de hasta unos {fl(bar_todo["fan2"])} °C, lo mismo que con el Solo.</li>
<li><strong>La entrada de aire cambia de sitio.</strong> Con el Solo iba arriba a la derecha, junto a él. Ahora el aire fresco hay que dárselo al sensor y al módem: entrada arriba a la izquierda, junto al sensor (apartado 8.3). El Sigma queda en la zona templada y le sobra margen.</li>
<li><strong>Si la ventilación se para, el aire junto al sensor pasa de 40 °C en unos {mins(T["fallo_t40"])} minutos</strong> (bar a 25 °C) y se estabiliza en {c(T["fallo_fin"], 0)} °C. La diferencia es qué se pierde: con el Solo, un lector bloqueado para siempre; con el Sigma, nada irreversible. El sensor sale de su rango y la máquina debe dejar de vender pruebas hasta que baje.</li>
<li><strong>La fuente se puede resolver de cuatro maneras y entre ellas hay menos de 2 W.</strong> La que menos calienta es dejar la LRS-50-5 como está y añadir una fuente pequeña de 12 V solo para el Sigma: {c(R["fuentes"]["dos"]["P"], 1)} W en vez de {c(A["P"], 1)} (apartado 3.2).</li>
<li><strong>En el frente de hoy el Sigma no cabe de pie.</strong> Su marco mide 146 mm de alto y encima de la ventana de la pantalla quedan unos 120 mm. Tumbado cabe (101 mm). Es trabajo del bloque 3; para el calor da igual cómo vaya.</li>
<li><strong>Nunca al sol directo,</strong> igual que antes. El Sigma lo aguantaría; la pantalla de 7″ ({s(R["ext"]["fan2"]["sol300"]["Scr"])} K sobre el bar con ventiladores) y el sensor, no.</li>
</ol>

<h2>Temperatura soportada, por configuración</h2>
<table>
<tr><th>Configuración (todas con el Sigma)</th><th class="n">Calor dentro</th><th class="n">Aire interior<br>(media)</th><th class="n">Aire junto<br>al sensor</th><th class="n">Aire junto<br>al módem</th><th class="n">Bar máximo con<br>todo en ficha</th><th>Pieza que limita</th></tr>
''')
for k, nom in (("actual", "Sin ventilador (rejillas de hoy, cajón sin pintar)"), ("pintado", "Sin ventilador, interior pintado"), ("fan1", "1 ventilador de 40 × 10 mm"),
               ("fan2", "<strong>2 ventiladores de 40 × 10 mm</strong>"), ("fan60", "1 ventilador de 60 × 25 mm (no cabe en los laterales)")):
    cf = R["conf"][k]
    W(f'<tr><td>{nom}</td><td class="n">{c(cf["P"])} W</td><td class="n">{s(cf["dT"], 1)} K</td><td class="n">{s(cf["local"]["sensor"], 1)} K</td><td class="n">{s(cf["local"]["modem"], 1)} K</td>'
      f'<td class="n">{fl(bar_todo[k])} °C</td><td>{NOMC[bar_quien[k]]}</td></tr>')
W(f'''</table>
<p class="peq">«Bar máximo» es la temperatura del aire del local con la que la primera pieza llega justo a su límite de ficha. Calentamientos {CALC} con el modelo del apartado 5; límites {HOJA}.</p>

<h2>Qué cambia respecto a la revisión 1, con el Solo</h2>
<table>
<tr><th>Punto</th><th>Con el SumUp Solo (revisión 1)</th><th>Con el myPOS Sigma (esta revisión)</th></tr>
<tr><td>Límite del lector</td><td>0 a 40 °C; batería de litio; bloqueo permanente posible por calor</td><td><strong>−20 a 70 °C</strong>; sin batería; se alimenta a 12–48 V</td></tr>
<tr><td>Calor dentro, sin ventiladores</td><td>{c(SOA["P"], 1)} W</td><td><strong>{c(A["P"], 1)} W</strong> (de 15 a 27 W según lo que gaste el Sigma y el convertidor)</td></tr>
<tr><td>Sin ventilador: aire interior, media</td><td>{s(SOA["dT"], 1)} K</td><td>{s(A["dT"], 1)} K</td></tr>
<tr><td>Sin ventilador: aire junto a la pieza de 40 °C que está arriba</td><td>{s(SOA["local"]["solo"], 1)} K (Solo y sensor)</td><td>{s(A["local"]["sensor"], 1)} K (sensor)</td></tr>
<tr><td>Sin ventilador: bar máximo con todo en ficha</td><td>{fl(bar_todo_solo["actual"])} °C</td><td>{fl(bar_todo["actual"])} °C</td></tr>
<tr><td>Dos ventiladores: aire que sale</td><td>{s(SOF["dT"], 1)} K</td><td>{s(F2["dT"], 1)} K</td></tr>
<tr><td>Dos ventiladores: entrada de aire</td><td>Arriba a la derecha, junto al Solo</td><td>Arriba a la izquierda, junto al sensor</td></tr>
<tr><td>Dos ventiladores: sensor y módem</td><td>{s(SOF["local"]["sensor"], 1)} K y {s(SOF["local"]["modem"], 1)} K</td><td>{s(F2["local"]["sensor"], 1)} K y {s(F2["local"]["modem"], 1)} K</td></tr>
<tr><td>Dos ventiladores: bar máximo con todo en ficha</td><td>{fl(bar_todo_solo["fan2"])} °C (limita el módem)</td><td><strong>{fl(bar_todo["fan2"])} °C</strong> (limita el módem)</td></tr>
<tr><td>Si se paran los dos ventiladores</td><td>El Solo pasa de 40 °C en unos 12 minutos y puede bloquearse para siempre</td><td>El sensor pasa de 40 °C en unos {mins(T["fallo_t40"])} minutos. Nada se rompe: se deja de vender hasta que baje</td></tr>
<tr><td>Vida a dos años</td><td>La batería del Solo, siempre cargada, es lo que antes envejece</td><td>Ya no hay batería. Mandan los condensadores de la fuente y la celda del sensor</td></tr>
</table>
<p class="peq">Las dos columnas salen del mismo modelo y de las mismas cargas en 5 V. La de la izquierda repite los números de la revisión 1.</p>

<h2>Lo que haría, por orden</h2>
<ol>
<li>Mantener la decisión de la ventilación forzada. Cambiar el Solo por el Sigma no la ahorra.</li>
<li>Llevar al CAD el hueco del Sigma y la entrada de aire arriba a la izquierda, junto al sensor, y comprobar el fondo que queda detrás del terminal (apartados 2.3 y 8.3).</li>
<li>Poner la sonda de temperatura junto al sensor, no junto al lector, y que el programa deje de vender pruebas a 40 °C (apartado 13).</li>
<li>Medir en el banco lo que gasta el Sigma en reposo, con un vatímetro o una pinza en sus 12 V. Es la incógnita nueva: entre 1,5 y 6 W cambian {c(R["sigma_P"]["6.0"]["sensor"] - R["sigma_P"]["1.5"]["sensor"], 0)} K sin ventilador.</li>
<li>Decidir la fuente con el bloque 1 delante. Por calor, la mejor es dejar los 5 V como están y dar los 12 V al Sigma con una fuente pequeña aparte.</li>
<li>Pintar el cajón y el interior de la carcasa: {c(A["local"]["sensor"] - PN["local"]["sensor"], 0)} K menos el día que falle la ventilación.</li>
</ol>

<h2>Contenido</h2>
<div class="indice">
''')
for n, t in (("1", "Alcance y método"), ("2", "El diseño visto como problema térmico"), ("3", "Cuánto calor hay que sacar"), ("4", "Qué temperatura aguanta cada pieza"),
             ("5", "Modelo de cálculo"), ("6", "Resultados sin ventilador"), ("7", "¿Se arregla sin ventilador?"), ("8", "Ventilación forzada"),
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
<li><strong>Cobro:</strong> myPOS Sigma, la opción 3 del estudio de alternativas de cobro del 13-11-2026, en lugar del SumUp Solo. Va en un hueco del frente con su cara al bar, no detrás del policarbonato. <strong>No está en el CAD ni en <code>DECISIONES.md</code>:</strong> es lo que planeas hacer, y lo calculo como si ya estuviera.</li>
<li><strong>Fuente:</strong> una Mean Well LRS-50-12 (12 V) en el sitio de la LRS-50-5, que mide lo mismo, y un convertidor de 12 a 5 V para la Pi, la pantalla, el módem, el sensor y los ventiladores {SUP}. En el apartado 3.2 comparo las otras tres formas de dar los 12 V.</li>
<li><strong>Resto de la electrónica:</strong> las cargas en 5 V de la revisión de componentes (Bloque 1, 13-11-2026), sin el Solo.</li>
<li><strong>Acabado:</strong> carcasa con pintura en polvo por fuera. Del cajón de componentes ningún documento dice el acabado; como caso base lo tomo <strong>sin pintar o galvanizado</strong> {SUP}, que es el peor para el calor, y calculo también el caso pintado.</li>
</ul>

<h2>1.2 Qué he hecho</h2>
<ol>
<li>Reunir los datos del Sigma que importan para el calor: medidas, hueco, alimentación y rango de temperatura {HOJA}. Su consumo no está publicado.</li>
<li>Rehacer el inventario del calor: sale el Solo, entran el Sigma, la fuente de 12 V y el convertidor.</li>
<li>Añadir el terminal al modelo de la revisión 1 como un nodo más ({NNODOS} en total): recibe sus vatios, da calor al aire del cajón por detrás y al bar por su cara.</li>
<li>Volver a resolver todos los casos: sin ventilador, pintado, con uno y dos ventiladores, averías, suciedad, arranque, corte de luz, sol, funda y frío.</li>
<li>Repetir los 1 500 casos al azar por configuración y la sensibilidad a cada parámetro, con el consumo del Sigma y el rendimiento del convertidor entre las incógnitas.</li>
<li>Recalcular con el mismo modelo la versión del Solo, para comparar las dos sin cambiar de regla.</li>
<li>Mirar en las cotas del CAD si el Sigma y la nueva entrada de aire caben.</li>
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
<li><strong>No es una medida.</strong> El modelo acierta el orden de magnitud y el sentido de cada cambio. En el calentamiento sin ventilador la horquilla razonable es de ±5 K.</li>
<li><strong>La potencia no está medida, y la del Sigma ni siquiera está publicada.</strong> Los {c(KP["sigma"], 0)} W que le pongo salen de lo que gasta un terminal de su clase. Sin ventilador, cada vatio de más son {c(R["pendiente"]["actual"])} K junto al sensor.</li>
<li><strong>No hay plano del Sigma.</strong> myPOS publica las medidas exteriores y el hueco, no cuánto entra por detrás del panel. Lo estimo en unos 30 mm dentro del cajón.</li>
<li><strong>No es una simulación de fluidos.</strong> El aire interior es un solo nodo con un reparto en altura supuesto. Los puntos calientes locales, como el chip de la Pi, van estimados aparte.</li>
</ul>
</div>
''')

# =================================================================== 2. DISEÑO
W(h1("2", "El diseño visto como problema térmico"))
W(f'''
<figure class="duo"><img src="../../FreeCAD/vista-exterior.png"><img src="../../FreeCAD/vista-interior.png">
<figcaption><b>Figura {FIG[0] + 1}.</b> El diseño A según el CAD del repositorio, que todavía lleva el Solo. A la izquierda, por fuera: en el lateral izquierdo se ven las dos rejillas de tres ranuras, los agujeros del escape del soplido y la ventana de la antena. A la derecha, el frente con el policarbonato: pantalla, Solo, cámara y, detrás, la Pi y el sensor. El Sigma iría donde está el Solo, atravesando el frente.</figcaption></figure>
''')
FIG[0] += 1
W(fig("f_seccion", "Lo que hay dentro y dónde, con el Sigma. Los rectángulos naranjas son las piezas que disipan, con su potencia de cálculo; el punto rojo marca las que tienen el límite en 40 °C. El Sigma va dibujado tumbado (en línea de trazos, su marco) y el convertidor, en un sitio supuesto de la caja de red. Las flechas azules son las rejillas actuales. A escala con las cotas del CAD."))
W(f'''
<h2>2.1 Geometría que manda en el calor</h2>
<table>
<tr><th>Elemento</th><th>Medida</th><th>Por qué importa</th></tr>
<tr><td>Carcasa exterior</td><td>220 × 100 × 442,5 mm, acero de 3 mm</td><td>Es la superficie que da calor al bar</td></tr>
<tr><td>Zona de componentes</td><td>Los 282 mm de arriba (desde la bandeja)</td><td>Todo el calor se genera aquí, en unos 3 litros de aire</td></tr>
<tr><td>Cajón de componentes</td><td>203,5 × 73 × 228 mm, acero de 1,5 mm, abierto por arriba; 70 mm de fondo útil</td><td>Segunda pared entre la electrónica y la carcasa</td></tr>
<tr><td>Huecos cajón–carcasa</td><td>3,5 mm (izquierda), 7 mm (derecha), 9,5 mm (detrás), 10 mm (debajo)</td><td>Capas de aire quieto: aíslan</td></tr>
<tr><td>Frente</td><td>Policarbonato de 5 mm + panel de 3 mm + policarbonato de 5 mm + 3,3 mm de aire</td><td>La cara más grande y despejada es la que peor conduce</td></tr>
<tr><td>Ventana de la pantalla</td><td>159 × 91 mm: 145 cm²</td><td>Ahí no hay acero: policarbonato, aire y policarbonato</td></tr>
<tr><td><strong>myPOS Sigma</strong></td><td>146 × 101 × 57 mm y 490 g; hueco de 108,7 × 86,4 mm {HOJA}</td><td>Atraviesa el frente. Su cara, de 147 cm², da al bar sin policarbonato delante: es un camino de calor nuevo</td></tr>
<tr><td>Techo</td><td>Tapa interior de 1,5 mm, cámara de aire de 30,5 mm y tapa de 3 mm</td><td>Otra doble pared, justo encima de lo más caliente</td></tr>
<tr><td>Trasera</td><td>220 × 440 mm contra la pared, con 18 tirafondos</td><td>No ve el aire; el calor sale por la pared</td></tr>
<tr><td>Rejillas</td><td>3 rejillas de 3 ranuras de 22 × 4 mm: 2,5 cm² cada una, en la carcasa y repetidas en el cajón</td><td>Único paso de aire. Entrada a 201 mm de la base; salidas a 361 y 374 mm</td></tr>
<tr><td>Zona del cajón de pajitas</td><td>Los 160 mm de abajo, sin fuentes de calor</td><td>Hace de aleta: la chapa conduce calor hacia abajo y lo suelta</td></tr>
</table>
<p class="peq">Medidas {HOJA} del CAD (<code>diseno.py</code>, <code>specs.py</code> y <code>geo.py</code>) y de la ficha de myPOS.</p>

<h2>2.2 Cinco rasgos que explican el resultado</h2>
<ol>
<li><strong>Doble pared.</strong> El calor tiene que pasar del aire interior a la chapa del cajón, cruzar un hueco de aire y llegar a la carcasa antes de salir al bar. Son tres saltos de temperatura en serie donde un armario normal tiene uno.</li>
<li><strong>Frente aislado, con una excepción nueva.</strong> El doble policarbonato deja pasar unos {c(A["Uwin"])} W/m²K, frente a los {c(K["h_ext"], 0)} W/m²K de una chapa pintada al aire {CALC}. El Sigma es lo único que cruza el frente: por su cara salen {c(A["P_sig_out"])} W sin ventilador, casi tanto como gasta.</li>
<li><strong>Lo delicado, arriba y a la izquierda.</strong> El sensor (40 °C) está en el tercio superior del cajón, detrás y a la izquierda. El módem (40 °C), a media altura, detrás. La Pi (50 °C), debajo del sensor. A la derecha quedan el Sigma y la fuente, que aguantan 70 °C.</li>
<li><strong>Rejillas simbólicas.</strong> Tres ranuras de 22 × 4 mm en dos chapas seguidas dejan pasar {c(A["Q_nat"], 2)} m³/h por tiro natural {CALC}. Sacan {c(A["P_vent"])} W de los {c(A["P"], 0)}.</li>
<li><strong>Cajón sin acabado definido.</strong> Una chapa galvanizada o sin pintar emite y absorbe poca radiación (emisividad 0,2–0,3 frente a 0,9 de una pintada {GEN}). En huecos tan estrechos, con las chapas pintadas la radiación lleva más de la mitad del calor; sin pintar, apenas un tercio.</li>
</ol>

<h2>2.3 Dónde cabe el Sigma</h2>
<p>No es el objeto de este estudio, pero al situarlo para el cálculo salen tres cosas que el bloque 3 tiene que resolver:</p>
<table>
<tr><th>Punto</th><th>Qué sale de las cotas</th><th>Consecuencia</th></tr>
<tr><td><strong>De pie no cabe</strong></td><td>El marco mide 146 mm de alto. Entre el borde de la ventana de la pantalla (a 282,5 mm de la base) y el borde de arriba de los policarbonatos (403 mm) hay 120 mm</td><td>O va tumbado (101 mm de alto, 146 de ancho), o baja la pantalla, o crece el frente. Así lo dibujo: tumbado, arriba a la derecha</td></tr>
<tr><td><strong>El hueco crece</strong></td><td>La ventana del Solo es de 85 × 85 mm en el panel y 81 × 81 mm en el cajón. El Sigma pide 108,7 × 86,4 mm</td><td>Hueco nuevo en el panel, en los dos policarbonatos y en el frente del cajón. Tumbado y arrimado al borde derecho, su marco queda a unos 10 mm de la boquilla</td></tr>
<tr><td><strong>El fondo es justo</strong></td><td>El Sigma tiene 57 mm de fondo total y el cajón, 70 mm útiles. Detrás, a esa altura, van el módem y un extremo de la Pi</td><td>Hay que comprobar con el aparato en la mano cuánto entra y cuánto piden sus conectores {EST}. Si no cabe, el módem se va al montaje tras la ventana de la antena, que además le conviene (apartado 8.3)</td></tr>
</table>
<p class="peq">Para el calor, que el Sigma vaya de pie o tumbado no cambia nada apreciable: cuentan su potencia, que su cara dé al bar y a qué altura queda.</p>

<h2>2.4 Materiales</h2>
<table>
<tr><th>Material</th><th class="n">Conductividad<br>W/m·K</th><th class="n">Emisividad</th><th>Origen</th></tr>
<tr><td>Acero DC01 (carcasa y cajón)</td><td class="n">50</td><td class="n">0,2–0,3 sin pintar</td><td>{GEN}; emisividad de tablas (acero laminado 0,24; galvanizado 0,28)</td></tr>
<tr><td>Pintura en polvo</td><td class="n">—</td><td class="n">0,90</td><td>Tablas: pinturas 0,84–0,97</td></tr>
<tr><td>Policarbonato compacto y carcasa de plástico del Sigma</td><td class="n">0,20</td><td class="n">0,90</td><td>{HOJA} de fabricantes de plancha; el del Sigma {SUP}</td></tr>
<tr><td>Aire a 35 °C</td><td class="n">0,027</td><td class="n">—</td><td>{GEN}</td></tr>
<tr><td>Pared de ladrillo / hormigón</td><td class="n">0,6 / 1,6</td><td class="n">—</td><td>{GEN}</td></tr>
</table>
''')

# =================================================================== 3. CALOR
FU = R["fuentes"]
W(h1("3", "Cuánto calor hay que sacar"))
W(f'''
<p class="lead">Todo lo que entra por el enchufe acaba como calor. Casi todo se queda dentro de la carcasa; una parte del que genera el Sigma sale directa al bar por su cara. Con el Sigma y la fuente de 12 V entran {c(A["P"], 0)} W; con el Solo eran {c(SOA["P"], 1)}.</p>
''')
W(fig("f_potencia", "Calor que deja cada pieza. El punto es el valor de cálculo; la barra, lo que cabe esperar entre un reposo tranquilo y una carga alta sostenida. El Sigma tiene la barra más larga porque su consumo no está publicado."))
W(f'''
<h2>3.1 Pieza a pieza</h2>
<table>
<tr><th>Pieza</th><th class="n">Mínimo</th><th class="n">Cálculo</th><th class="n">Máximo</th><th>De dónde sale</th></tr>
<tr><td>Raspberry Pi 3B+ y cámara</td><td class="n">2,1 W</td><td class="n">4,6 W</td><td class="n">7,1 W</td><td>Raspberry Pi mide 1,9 W en reposo y 5,8 W a plena carga {HOJA}. Reproducir vídeo queda entre los dos {EST}</td></tr>
<tr><td>Pantalla de 7″</td><td class="n">2,5 W</td><td class="n">4,1 W</td><td class="n">5,1 W</td><td>5 W según el anuncio; paneles parecidos, 2,4–2,6 W. Depende del brillo</td></tr>
<tr><td>Fuente de 12 V (pérdidas)</td><td class="n">2,6 W</td><td class="n">{c(KP["p_psu"])} W</td><td class="n">5,6 W</td><td>LRS-50-12: 86 % a plena carga {HOJA}; al {c(KP["carga_psu"] * 100, 0)} % de carga, 81 % {EST}</td></tr>
<tr><td><strong>myPOS Sigma</strong></td><td class="n">1,5 W</td><td class="n"><strong>{c(KP["sigma"])} W</strong></td><td class="n">6,0 W</td><td><strong>Sin dato de fabricante</strong> {EST}. Es un terminal Android con pantalla de 5″, lector sin contacto y 4G. Un terminal de la misma clase, el PAX IM30, declara menos de 0,65 A a 12 V de pico, unos 8 W {HOJA}</td></tr>
<tr><td>Módem 4G</td><td class="n">0,8 W</td><td class="n">2,0 W</td><td class="n">3,5 W</td><td>Menos de 3,5 W {HOJA}. Sube con mala cobertura</td></tr>
<tr><td>Convertidor de 12 a 5 V (pérdidas)</td><td class="n">0,7 W</td><td class="n">{c(KP["p_dcdc"])} W</td><td class="n">3,5 W</td><td>Mean Well RSD-30G-5, de 9–36 V a 5 V y 6 A: 84–85 % {HOJA}. Un reductor no aislado llega al 90–93 % {GEN}</td></tr>
<tr><td>Sensor ZE29A</td><td class="n">0,1 W</td><td class="n">0,5 W</td><td class="n">1,0 W</td><td>Menos de 500 mA de pico {HOJA}; reposo {EST}</td></tr>
<tr><td>Dos ventiladores</td><td class="n">0,4 W</td><td class="n">0,5 W</td><td class="n">0,5 W</td><td>0,22 W típicos cada uno {HOJA}</td></tr>
<tr><td><strong>Total sin ventiladores</strong></td><td class="n">≈ 15 W</td><td class="n"><strong>{c(A["P"])} W</strong></td><td class="n">≈ 27 W</td><td>Suma, con la cadena de abajo</td></tr>
<tr><td><strong>Total con dos ventiladores</strong></td><td class="n"></td><td class="n"><strong>{c(F2["P"])} W</strong></td><td class="n"></td><td></td></tr>
</table>
''')
W(calc("De los 5 V al enchufe: la cadena de la fuente de 12 V",
       "P<sub>enchufe</sub> = (P<sub>5 V</sub> / η<sub>convertidor</sub> + P<sub>Sigma</sub>) / η<sub>fuente</sub>",
       f"P<sub>5 V</sub> = Pi 4,59 + módem 2,04 + pantalla 4,08 + sensor 0,51 = {c(KP['dc5'], 2)} W; η<sub>convertidor</sub> = 0,85; P<sub>Sigma</sub> = {c(KP['sigma'])} W; η<sub>fuente</sub> = 0,81",
       f"En 12 V: {c(KP['dc5'], 2)} / 0,85 + {c(KP['sigma'])} = {c(KP['bus'])} W. En el enchufe: {c(KP['bus'])} / 0,81 = {c(KP['ac'])} W. Son {c(KP['extra'], 2)} W más que con el Solo: {c(KP['sigma'] - 1.02, 2)} del Sigma, {c(KP['p_dcdc'], 2)} del convertidor y {c(KP['extra'] - (KP['sigma'] - 1.02) - KP['p_dcdc'], 2)} de la fuente"))
W(f'''
<h2>3.2 Qué fuente calienta menos</h2>
<p>«Una fuente de 12 V» se puede montar de cuatro maneras. Para el calor cuentan las pérdidas de conversión:</p>
<table>
<tr><th>Opción</th><th class="n">Calor dentro</th><th class="n">Sin ventilador:<br>junto al sensor</th><th class="n">Dos ventiladores:<br>aire que sale</th><th>Comentario</th></tr>
<tr><td><strong>LRS-50-12 y convertidor de 12 a 5 V</strong> (caso base)</td><td class="n">{c(FU["12V"]["P"])} W</td><td class="n">{s(FU["12V"]["sensor"], 1)} K</td><td class="n">{s(FU["12V"]["dT_fan"], 1)} K</td><td>Una sola fuente de red. Toda la parte de 5 V pasa por el convertidor, incluida la rama de la Pi que el Bloque 1 afinó</td></tr>
<tr><td>LRS-50-5, como hoy, y una fuente pequeña de 12 V solo para el Sigma</td><td class="n">{c(FU["dos"]["P"])} W</td><td class="n">{s(FU["dos"]["sensor"], 1)} K</td><td class="n">{s(FU["dos"]["dT_fan"], 1)} K</td><td><strong>La que menos calienta</strong> y la que no toca los 5 V. Pide sitio y un fusible más en la caja de red</td></tr>
<tr><td>LRS-50-5 y un elevador de 5 a 12 V para el Sigma</td><td class="n">{c(FU["elevador"]["P"])} W</td><td class="n">{s(FU["elevador"]["sensor"], 1)} K</td><td class="n">{s(FU["elevador"]["dT_fan"], 1)} K</td><td>El cambio más pequeño: un módulo en la rama que hoy alimenta al Solo</td></tr>
<tr><td>Fuente de dos salidas Mean Well RD-50A (5 V y 12 V)</td><td class="n">{c(FU["doble"]["P"])} W</td><td class="n">{s(FU["doble"]["sensor"], 1)} K</td><td class="n">{s(FU["doble"]["dT_fan"], 1)} K</td><td>Rinde un 78–79 % a plena carga y pide un mínimo de 0,3 A en cada salida {HOJA}: el Sigma en reposo puede quedarse por debajo. Mide 99 × 97 × 36 mm, más que la LRS-50</td></tr>
</table>
<ul>
<li><strong>Entre la mejor y la peor hay {c(FU["12V"]["P"] - FU["dos"]["P"], 1)} W:</strong> {c(FU["12V"]["sensor"] - FU["dos"]["sensor"], 0)} K sin ventilador y {c(FU["12V"]["dT_fan"] - FU["dos"]["dT_fan"], 1)} K con ventiladores. La fuente se elige por fiabilidad, sitio y cableado; el calor solo desempata.</li>
<li><strong>Sigo con la LRS-50-12 y el convertidor como caso base</strong> porque es lo que hablamos y porque es el caso más caliente de los cuatro: lo que cumpla con él cumple con los demás.</li>
<li>Rendimientos a carga parcial {EST}: la hoja solo da el de plena carga, y a un tercio de la carga una fuente conmutada pierde unos 5 puntos.</li>
</ul>

<h2>3.3 Lo que hay que medir</h2>
<ul>
<li><strong>El Sigma en reposo, lo primero.</strong> Entre 1,5 y 6 W, el aire junto al sensor sin ventilador va de {s(R["sigma_P"]["1.5"]["sensor"])} a {s(R["sigma_P"]["6.0"]["sensor"])} K, y con ventiladores el aire sale entre {s(R["sigma_P"]["1.5"]["dT_fan"], 1)} y {s(R["sigma_P"]["6.0"]["dT_fan"], 1)} K. Se mide con una pinza o un medidor en línea en sus 12 V.</li>
<li><strong>El terminal sabe dormirse.</strong> El Nexgo UN20, del que el Sigma parece ser la versión de myPOS (mismas medidas, hueco, alimentación y puertos), lleva sensores de proximidad y de luz que lo despiertan cuando alguien se acerca {HOJA}. Si la app de myPOS lo aprovecha, el consumo medio estará en la parte baja del rango.</li>
<li><strong>El total, con un vatímetro de enchufe.</strong> Con esa cifra, la figura [[f_dT_P]] da el calentamiento sin más cuentas.</li>
<li>La Pi, la pantalla y las dos conversiones suman tres cuartas partes del calor, y todas están por debajo del sensor.</li>
</ul>
''')

# =================================================================== 4. LÍMITES
W(h1("4", "Qué temperatura aguanta cada pieza"))
W(f'''
<p class="lead">Siguen los tres escalones, con una pieza menos en el primero: dos que no pueden pasar de 40 °C (sensor y módem), dos de 50 °C (Pi y cámara) y todo lo demás, ahora también el lector, que aguanta 70 °C o más.</p>
''')
W(fig("f_limites", "Temperatura máxima de trabajo de cada pieza, según su hoja o su ficha. Las dos líneas verticales son la temperatura del aire junto al sensor que da el modelo con el bar a 25 °C."))
W(f'''
<table class="larga">
<thead><tr><th>Pieza</th><th class="c">Trabajo</th><th>Qué pasa si se sale</th><th>Origen</th></tr></thead>
<tr><td><strong>myPOS Sigma</strong></td><td class="c">−20 a 70 °C</td><td>Guardado, de −30 a 80 °C; humedad del 10 al 95 % sin condensar; IP65 e IK08. Sin batería. Una tienda húngara lo cataloga como «interior, 10–40 °C»: conviene que myPOS confirme el rango por escrito al comprarlo</td><td>{HOJA} ficha de myPOS; coincide con la del Nexgo UN20</td></tr>
<tr><td><strong>Sensor ZE29A</strong></td><td class="c">10 a 40 °C</td><td>Fuera de rango la lectura deja de estar garantizada. El calor acorta la vida de la celda electroquímica. Por abajo también tiene límite: 10 °C</td><td>{HOJA} manual V1.1</td></tr>
<tr><td><strong>Módem 4G E3372h</strong></td><td class="c">−10 a 40 °C</td><td>Reinicios y caídas de conexión. Él mismo disipa hasta 3,5 W en un cuerpo muy pequeño</td><td>{HOJA} ficha de Huawei</td></tr>
<tr><td>Raspberry Pi 3B+</td><td class="c">0 a 50 °C</td><td>El procesador baja de 1,4 a 1,2 GHz al llegar a 60 °C y recorta más a partir de 80 °C. No se rompe, pero va lenta</td><td>{HOJA} ficha de producto</td></tr>
<tr><td>Cámara Module 3</td><td class="c">0 a 50 °C</td><td>Ruido en la imagen y enfoque menos fiable</td><td>{HOJA} ficha de producto</td></tr>
<tr><td>Pantalla GeeekPi de 7″</td><td class="c">sin dato</td><td>El fabricante no publica la temperatura. Paneles parecidos dan 0–60 °C o −20–70 °C. Tomo 50 °C {SUP}</td><td>Ficha del repositorio</td></tr>
<tr><td>Fuente LRS-50-12</td><td class="c">−30 a 70 °C</td><td>Misma serie y misma curva que la LRS-50-5: a 230 V da el 100 % hasta 50 °C y baja en línea recta hasta el 60 % a 70 °C. Esta máquina le pide el {c(KP["carga_psu"] * 100, 0)} % típico y cerca del 59 % de pico</td><td>{HOJA} catálogo y hoja de la serie</td></tr>
<tr><td>Convertidor de 12 a 5 V</td><td class="c">−40 a 70 °C</td><td>El RSD-30G-5 da toda su potencia hasta 55 °C y reduce por encima. Aquí trabaja al {c(KP["carga_dcdc"] * 100, 0)} % de la suya</td><td>{HOJA} distribuidores</td></tr>
<tr><td>Ventiladores Noctua</td><td class="c">−10 a 70 °C</td><td>Vida media declarada de más de 150 000 h</td><td>{HOJA}</td></tr>
<tr><td>microSD, bornes WAGO, cable de PVC</td><td class="c">70 a 85 °C</td><td>Ver la figura. No limitan</td><td>{HOJA} y {GEN}</td></tr>
</table>

<div class="caja ok">
<h3>Lo que desaparece con el Solo</h3>
<ul>
<li><strong>El límite de 40 °C del lector</strong> y el aviso de SumUp de que su bloqueo antimanipulación, que es permanente, puede saltar por calor.</li>
<li><strong>La batería de litio siempre cargada,</strong> que a 60 °C se agota en meses y puede hincharse.</li>
<li><strong>La prueba del pago a través del policarbonato</strong> y el arranque del lector tras un corte, que eran riesgos del Bloque 1 ajenos al calor.</li>
</ul>
</div>

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
<li>La cara del Sigma, que es lo que toca el cliente, queda unos {c(KS["dTsig_fan"] * FCARA, 0)} K sobre el bar con ventiladores, templada, y unos {c(KS["dTsig"] * FCARA, 0)} K sin ellos, caliente al tacto sin llegar a quemar {EST}.</li>
<li>Consecuencia práctica: <strong>tocar la chapa por fuera no dice nada de lo que pasa dentro.</strong> Con el interior a 55 °C, la chapa está apenas templada.</li>
</ul>
''')

# =================================================================== 5. MODELO
W(h1("5", "Modelo de cálculo"))
W(f'''
<p class="lead">Es el modelo de la revisión 1 con un nodo más. Una red de resistencias térmicas: cada chapa y cada masa de aire es un nodo con su temperatura, y entre nodos pasa calor por convección, radiación o conducción. Se resuelve el equilibrio de los {NNODOS} nodos a la vez.</p>
''')
W(fig("f_red", f"El camino del calor sin ventilador, con el resultado del caso base (bar a 25 °C, {c(A['P'], 1)} W). Cada caja es un grupo de nodos con su calentamiento sobre el bar; sobre cada flecha, los vatios que pasan."))
W(f'''
<h2>5.1 Qué nodos tiene</h2>
<ul>
<li><strong>Dentro:</strong> el aire interior, las piezas que disipan (un nodo), la pantalla y la fuente con el convertidor y su caja de red.</li>
<li><strong>El terminal:</strong> un nodo propio. Recibe sus {c(KP["sigma"], 0)} W, cede calor al aire del cajón por su parte trasera y al bar por su cara, y radia hacia las paredes del cajón.</li>
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
       f"Trasero, δ = 9,5 mm: 1,2 · {c(hz['trasero']['ka'], 4)} / 0,0095 = {c(hz['trasero']['hc'])}. Radiación con el cajón sin pintar (ε 0,3 y 0,85): {c(hz['trasero']['hr_sin'])}; pintado (0,9 y 0,9): {c(hz['trasero']['hr_pint'])}",
       f"Sin pintar: {c(hz['trasero']['hc'] + hz['trasero']['hr_sin'])} W/m²K. Pintado: {c(hz['trasero']['hc'] + hz['trasero']['hr_pint'])} W/m²K. Pintar el cajón multiplica por {c((hz['trasero']['hc'] + hz['trasero']['hr_pint']) / (hz['trasero']['hc'] + hz['trasero']['hr_sin']))} lo que cruza el hueco trasero. El factor 1,2 cubre el poco aire que circula por el hueco {EST}"))
v = K["ventana"]
W(calc("Ventana de la pantalla: doble policarbonato",
       "U = 1 / (R<sub>hueco 1</sub> + t/k + R<sub>hueco 2</sub> + t/k + 1/h<sub>ext</sub>)",
       f"R<sub>hueco 1</sub> = {c(v['Rg1'], 3)}; policarbonato 0,005/0,20 = {c(v['Rpc'], 3)}; R<sub>hueco 2</sub> (los 3 mm del panel) = {c(v['Rg2'], 3)}; otra vez {c(v['Rpc'], 3)}; 1/h<sub>ext</sub> = {c(v['Ro'], 3)} m²K/W",
       f"U = {c(v['U'], 1)} W/m²K, frente a {c(v['U_chapa'], 1)} de una chapa pintada. Por la ventana (145 cm²) salen {c(A['P_win'])} W"))
W(calc("El terminal: cuánto de su calor sale por su cara y cuánto se queda dentro",
       "G = A / (R<sub>int</sub> + 1/h) por cada lado · · · ΔT<sub>Sigma</sub> ≈ (P + G<sub>dentro</sub>·ΔT<sub>aire</sub>) / (G<sub>dentro</sub> + G<sub>fuera</sub>) · · · P<sub>fuera</sub> = G<sub>fuera</sub>·ΔT<sub>Sigma</sub>",
       f"Cara al bar: 146 × 101 mm = 147 cm², h = {c(KS['ho'])} W/m²K. Cuerpo dentro del cajón: {c(KS['A_in'] * 1e4, 0)} cm², h = {c(KS['hcc'], 0)} W/m²K. R<sub>int</sub> = 0,03 m²K/W por lado (3 mm de plástico y el aire de dentro) {EST}. G<sub>fuera</sub> = {c(KS['G_out'], 3)} y G<sub>dentro</sub> = {c(KS['G_in'], 3)} W/K",
       f"Sin ventilador (aire interior a {s(KS['dTi'], 1)} K): el Sigma queda a {s(KS['dTsig'], 0)} K y echa al bar {c(KS['P_out'])} W de sus {c(KS['P'], 0)}: casi no calienta el cajón. Con ventiladores (aire a {s(KS['dTi_fan'], 1)} K): queda a {s(KS['dTsig_fan'], 0)} K, echa fuera {c(KS['P_out_fan'])} W y deja dentro {c(KS['P'] - KS['P_out_fan'])} W"))
rj = K["rejillas"]
W(calc("Tiro natural por las rejillas actuales",
       "Δp = ρ·g·Δz·ΔT/T · · · Q = √(2·Δp / (ρ·ΣK)) · · · P = ρ·c<sub>p</sub>·Q·ΔT<sub>salida</sub>",
       f"Δz = 0,166 m; ΔT de la columna = {c(rj['dTcol'], 0)} K; Δp = {c(rj['dp'], 2)} Pa. Cada rejilla son dos chapas en serie de {c(rj['A_rej'], 2)} cm² con C<sub>d</sub> = 0,65",
       f"Q = {c(rj['Q'], 2)} m³/h. El aire sale a {s(rj['dT_sal'])} K y se lleva {c(rj['P'])} W. Con {c(rj['dp'], 2)} Pa de empuje no se puede pedir más"))
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
<tr><td>Balance de energía: lo que sale por todos los caminos frente a lo que se genera</td><td>{c(BALANCE, 2)} W frente a {c(A["P"], 2)} W</td></tr>
<tr><td>Independencia de la malla: 11, 22 y 44 franjas por cara</td><td>{s(MALLA[0], 2)}, {s(MALLA[1], 2)} y {s(MALLA[2], 2)} K</td></tr>
<tr><td>Contraste con la regla de los armarios eléctricos (k = 5,5 W/m²K sobre el área eficaz, montaje en pared), aplicada a la zona de componentes. Lo hago con la versión del Solo, que es una caja cerrada sin nada que cruce el frente</td><td>Regla: A = 1,4·0,22·(0,282 + 0,10) + 1,8·0,10·0,282 = {c(R["reglas"]["A_sup"], 3)} m²; ΔT = {c(R["reglas"]["P"], 1)} / (5,5 · {c(R["reglas"]["A_sup"], 3)}) = <strong>{s(R["reglas"]["dT_sup"], 1)} K</strong>. Modelo con el cajón «transparente» (huecos muy conductores y todo pintado): <strong>{s(R["reglas"]["modelo"], 1)} K</strong></td></tr>
<tr><td>Lo que añade la doble pared con el cajón sin pintar, ya con el Sigma</td><td>De {s(R["doble_pared"]["sin"], 1)} a {s(R["doble_pared"]["con"], 1)} K: unos {c(R["doble_pared"]["con"] - R["doble_pared"]["sin"], 0)} K</td></tr>
<tr><td>La versión del Solo, recalculada con el código de esta revisión</td><td>{s(SOA["dT"], 1)} K de media y {s(SOA["local"]["solo"], 1)} K junto al Solo: los mismos números de la revisión 1</td></tr>
</table>
<p>La tercera fila es la que da confianza: quitando lo que este diseño tiene de particular, el modelo cae sobre la regla empírica que usa la industria para armarios de chapa pintada.</p>

<h2>5.4 Dónde puede fallar</h2>
<ul>
<li><strong>Convección dentro del cajón.</strong> Es el coeficiente peor conocido: 3,5 W/m²K entre el aire y las paredes (rango 2,5–5). Un cajón lleno de cables y placas no se parece a una placa lisa.</li>
<li><strong>Reparto del aire en altura.</strong> Supongo que el aire de arriba está un 30 % más caliente que la media (rango 15–45 %), del orden de lo que maneja la IEC TR 60890 para armarios cerrados. Hay que medirlo con tres sondas a distinta altura.</li>
<li><strong>El terminal por dentro.</strong> No sé cómo reparte su calor entre la cara y la trasera. En los casos al azar varío su resistencia interior entre la mitad y el doble; eso mueve el aire interior {c(abs(RSIG[1] - RSIG[0]), 1)} K sin ventilador.</li>
<li><strong>La pared.</strong> Tomo una conductancia fija. Una pared real tarda horas en calentarse, así que las primeras horas se lleva algo más.</li>
<li><strong>Con ventilador,</strong> el aire interior es un solo nodo bien mezclado. Lo que ve cada pieza depende de por dónde pase la corriente; lo trato con un factor por pieza (apartado 8.2).</li>
</ul>
''')

# =================================================================== 6. RESULTADOS
W(h1("6", "Resultados sin ventilador"))
W(f'''
<p class="lead">Caso base: bar a 25 °C, {c(A["P"], 1)} W dentro, Sigma en el frente, rejillas actuales, carcasa pintada, cajón sin pintar y pared de ladrillo.</p>
<table>
<tr><th>Punto</th><th class="n">Sobre el bar</th><th class="n">Con el bar a 25 °C</th><th class="n">Con el bar a 30 °C</th><th class="n">Con el Solo<br>(revisión 1)</th></tr>
<tr><td>Chapa exterior, zona de componentes (media)</td><td class="n">{s(A["chapa_sup"], 1)} K</td><td class="n">{c(25 + A["chapa_sup"], 0)} °C</td><td class="n">{c(30 + A["chapa_sup"], 0)} °C</td><td class="n">{s(SOA["chapa_sup"], 1)} K</td></tr>
<tr><td>Chapa del cajón de componentes (media)</td><td class="n">{s(A["cajon"], 1)} K</td><td class="n">{c(25 + A["cajon"], 0)} °C</td><td class="n">{c(30 + A["cajon"], 0)} °C</td><td class="n">{s(SOA["cajon"], 1)} K</td></tr>
<tr><td><strong>Aire interior, media</strong></td><td class="n"><strong>{s(A["dT"], 1)} K</strong></td><td class="n"><strong>{c(25 + A["dT"], 0)} °C</strong></td><td class="n"><strong>{c(r30["Ti"], 0)} °C</strong></td><td class="n">{s(SOA["dT"], 1)} K</td></tr>
<tr><td><strong>Aire junto al sensor</strong></td><td class="n"><strong>{s(A["local"]["sensor"], 1)} K</strong></td><td class="n"><strong>{c(25 + A["local"]["sensor"], 0)} °C</strong></td><td class="n"><strong>{c(M["actual"]["30"]["sensor"], 0)} °C</strong></td><td class="n">{s(SOA["local"]["sensor"], 1)} K</td></tr>
<tr><td>Aire junto a la Pi y al módem</td><td class="n">{s(A["local"]["modem"], 1)} K</td><td class="n">{c(25 + A["local"]["modem"], 0)} °C</td><td class="n">{c(M["actual"]["30"]["modem"], 0)} °C</td><td class="n">{s(SOA["local"]["modem"], 1)} K</td></tr>
<tr><td>Aire detrás del Sigma</td><td class="n">{s(A["local"]["sigma"], 1)} K</td><td class="n">{c(25 + A["local"]["sigma"], 0)} °C</td><td class="n">{c(M["actual"]["30"]["sigma"], 0)} °C</td><td class="n">—</td></tr>
<tr><td>El Sigma por dentro</td><td class="n">{s(A["Sig"], 0)} K</td><td class="n">{c(25 + A["Sig"], 0)} °C</td><td class="n">{c(30 + A["Sig"], 0)} °C</td><td class="n">—</td></tr>
<tr><td>Superficie de la pantalla</td><td class="n">{s(A["Scr"], 0)} K</td><td class="n">{c(25 + A["Scr"], 0)} °C</td><td class="n">{c(30 + A["Scr"], 0)} °C</td><td class="n">{s(SOA["Scr"], 0)} K</td></tr>
</table>
''')
W(fig("f_escalera", f"De fuera a dentro: cuánto sube la temperatura en cada salto. La chapa exterior apenas se entera ({s(A['chapa_sup'])} K); los dos saltos grandes están dentro, entre la carcasa y el cajón y entre el cajón y el aire."))
W(f'''
<h2>6.1 Dónde se pierde la temperatura</h2>
<ul>
<li><strong>Del bar a la chapa exterior: {s(A["chapa_sup"])} K.</strong> La carcasa de 3 mm reparte bien el calor y por fuera está casi fría.</li>
<li><strong>De la carcasa al cajón: {s(A["cajon"] - A["chapa_sup"])} K.</strong> Es el precio de los huecos de aire.</li>
<li><strong>Del cajón al aire interior: {s(A["dT"] - A["cajon"])} K.</strong> Poca superficie (0,14 m²) y aire casi quieto.</li>
<li><strong>De la media a la zona del sensor: {s(A["local"]["sensor"] - A["dT"])} K.</strong> El aire caliente sube.</li>
<li>Con el interior pintado, el segundo y el tercer salto se reducen y el total baja {c(A["local"]["sensor"] - PN["local"]["sensor"], 0)} K.</li>
<li><strong>Respecto al Solo, todo sube unos {c(A["dT"] - SOA["dT"], 0)} K.</strong> Entran {c(A["P"] - SOA["P"], 1)} W más, pero {c(A["P_sig_out"], 1)} W salen directos por la cara del Sigma. Por las paredes del cajón tienen que salir {c(R["flujos"]["actual"]["cajon"], 1)} W, frente a {c(SOA["P"] - SOA["P_win"] - SOA["P_vent"], 1)} W con el Solo.</li>
</ul>

<h2>6.2 Por dónde sale el calor</h2>
''')
W(fig("f_caminos", "Reparto de la potencia por camino de salida. A la izquierda, sin ventilador: ningún camino destaca, todos son malos; la cara del Sigma es el segundo. A la derecha, con dos ventiladores: seis de cada diez vatios se van con el aire."))
W(f'''
<div class="dos">
<div>
<ul>
<li>Los laterales son la mejor superficie, pero son estrechos: {c(A["caminos"]["laterales"])} W.</li>
<li><strong>La cara del Sigma saca {c(A["caminos"]["terminal"])} W</strong> con 147 cm²: más que la ventana de la pantalla y el marco de acero del frente, que suman {c(A["caminos"]["ventanas"] + A["caminos"]["frente"])} W.</li>
<li>La pared se lleva {c(A["caminos"]["pared"])} W. En pladur baja a la cuarta parte.</li>
<li>La zona del cajón de pajitas y el suelo, que no generan calor, sacan {c(A["caminos"]["zona_baja"] + A["caminos"]["suelo"])} W gracias a la chapa de 3 mm.</li>
<li>La tapa, con su cámara de aire, solo {c(A["caminos"]["techo"])} W.</li>
</ul>
</div>
<div>
''')
W(fig("f_mapa", "Calentamiento de la chapa exterior por cara y altura, sin ventilador. La trasera es la más caliente porque detrás van la fuente y la Pi y porque la pared evacua poco."))
W(f'''</div></div>

<h2>6.3 Con otra potencia</h2>
''')
W(fig("f_dT_P", "Calentamiento del aire junto al sensor según la potencia. Las líneas rojas marcan cuánto puede calentarse como mucho para no pasar de 40 °C con el bar a 25, 30 y 35 °C. Sin ventilador se pasa siempre; con ventilador sobra margen en todo el rango."))
W(f'''
<ul>
<li>Sin ventilador, cada vatio de más son {c(R["pendiente"]["actual"])} K junto al sensor. Con ventiladores, {c(R["pendiente"]["fan2"], 2)} K.</li>
<li>Para cumplir sin ventilador con el bar a 25 °C habría que disipar menos de 7 W. No es realista: solo la pantalla y la Pi en reposo ya suman 4,5 W, sin contar el Sigma ni la fuente.</li>
<li>Aunque el Sigma gastara 1,5 W y se montara la fuente que menos pierde, quedarían {c(MEJ["P"], 1)} W y {s(MEJ["sensor"])} K junto al sensor: prácticamente lo mismo que con el Solo ({s(SOA["local"]["sensor"])} K).</li>
</ul>

<h2>6.4 Cuánto me puedo estar equivocando</h2>
<p>He repetido el cálculo 1 500 veces por configuración, sacando cada parámetro incierto de su rango (anexo A): potencia entre 15 y 27 W, convección interior, emisividades, tipo de pared, aire del bar, calidad de las soldaduras, fugas, reparto en altura y resistencia interior del terminal.</p>
''')
W(fig("f_mc", f"Resultado de los 1 500 casos por configuración. Sin ventilador, ningún caso baja de {s(MCMIN)} K; con ventiladores, ningún caso pasa de {s(MCMAX)} K junto al sensor."))
W(fig("f_sens", "Efecto de cada parámetro por separado, sin ventilador. Lo que más mueve el resultado es lo que se puede decidir o medir: las rejillas, la potencia, el acabado del cajón y el consumo del Sigma. Lo que no se controla (pared, aire del bar, soldaduras) apenas pesa."))
W(f'''
<div class="caja">
<h3>Lectura</h3>
<ul>
<li>Sin ventilador, el aire junto al sensor queda entre {s(MC["actual"]["sensor"]["p10"])} y {s(MC["actual"]["sensor"]["p90"])} K sobre el bar en el 80 % de los casos, con mediana de {s(MC["actual"]["sensor"]["p50"])} K.</li>
<li>Para no pasar de 40 °C con el bar a 25 °C harían falta menos de +15 K. <strong>No lo cumple ninguno de los 1 500 casos.</strong> La conclusión no depende de cómo afine los parámetros ni de lo que acabe gastando el Sigma.</li>
</ul>
</div>
''')

# =================================================================== 7. SIN VENTILADOR
W(h1("7", "¿Se arregla sin ventilador?"))
W(f'''
<p class="lead">Era la pregunta natural al cambiar de lector: si el Sigma aguanta 70 °C, quizá sobren los ventiladores. No sobran, porque el sensor y el módem siguen dentro.</p>
<table>
<tr><th>Medida pasiva</th><th class="n">Aire junto al sensor</th><th class="n">Bar máximo para el sensor</th><th>Pega</th></tr>
<tr><td>Sigma, rejillas de hoy, cajón sin pintar</td><td class="n">{s(A["local"]["sensor"], 1)} K</td><td class="n">{fl(40 - A["local"]["sensor"])} °C</td><td></td></tr>
<tr><td>Pintar el cajón y el interior de la carcasa (mate, cualquier color)</td><td class="n">{s(PN["local"]["sensor"], 1)} K</td><td class="n">{fl(40 - PN["local"]["sensor"])} °C</td><td>Ninguna. Hay que hacerlo de todos modos</td></tr>
<tr><td>Rejillas 4 veces mayores (10 cm² cada una)</td><td class="n">{s(R["pasiva"]["4"]["sensor"], 1)} K</td><td class="n">{fl(40 - R["pasiva"]["4"]["sensor"])} °C</td><td>12 ranuras por rejilla</td></tr>
<tr><td>Rejillas 16 veces mayores (40 cm² cada una)</td><td class="n">{s(R["pasiva"]["16"]["sensor"], 1)} K</td><td class="n">{fl(40 - R["pasiva"]["16"]["sensor"])} °C</td><td>Medio lateral abierto: entran líquidos, dedos y palillos</td></tr>
<tr><td>Las dos cosas: 40 cm² por rejilla e interior pintado</td><td class="n">{s(R["pasiva_max"]["sensor"], 1)} K</td><td class="n">{fl(40 - R["pasiva_max"]["sensor"])} °C</td><td>Lo mismo, y aun así se queda corta en verano</td></tr>
<tr><td>La fuente que menos pierde (LRS-50-5 y una pequeña de 12 V)</td><td class="n">{s(FU["dos"]["sensor"], 1)} K</td><td class="n">{fl(40 - FU["dos"]["sensor"])} °C</td><td>Ayuda poco</td></tr>
<tr><td>Un Sigma que gaste 1,5 W en vez de 3</td><td class="n">{s(R["sigma_P"]["1.5"]["sensor"], 1)} K</td><td class="n">{fl(40 - R["sigma_P"]["1.5"]["sensor"])} °C</td><td>No se elige: es lo que gaste</td></tr>
</table>
<ul>
<li><strong>Con el tiro natural no hay fuerza:</strong> 17 cm de desnivel y 33 K de diferencia dan {c(rj["dp"], 2)} Pa. Un ventilador de 40 mm da 17 Pa, casi cien veces más.</li>
<li><strong>La única pasiva que llegaría</strong> es abrir del orden de 40 a 80 cm² arriba y otro tanto abajo. En una máquina de bar «a prueba de balas» eso es peor que un ventilador.</li>
<li><strong>Sacar de la caja lo que queda de 40 °C</strong> es la otra salida, y con el Sigma ya solo son dos piezas. El módem se puede cambiar por uno de rango industrial, que los hay hasta 70 °C o más {GEN}; el sensor, no: tiene que estar donde llega el soplido. Mientras el sensor esté dentro, hace falta aire.</li>
<li><strong>Las medidas pasivas sí valen como red de seguridad:</strong> con el interior pintado, una avería de los ventiladores deja la máquina {c(A["local"]["sensor"] - PN["local"]["sensor"], 0)} K más fría.</li>
</ul>
''')

# =================================================================== 8. VENTILACIÓN FORZADA
W(h1("8", "Ventilación forzada"))
fn = K["fan"]
W(f'''
<p class="lead">Los ventiladores son los mismos de la revisión 1: dos Noctua NF-A4x10 5V, uno metiendo aire y otro sacándolo. Cambian dos cosas: hay más calor que sacar y el aire fresco ya no hay que dárselo al lector, sino al sensor y al módem.</p>

<h2>8.1 Cuánto aire mueven</h2>
''')
W(calc("Punto de trabajo: curva del ventilador contra la resistencia de las aberturas",
       "n·Δp<sub>máx</sub>·(1 − Q/Q<sub>máx</sub>) = K·(ρ/2)·(Q/A)²",
       f"NF-A4x10 5V: Q<sub>máx</sub> = 8,2 m³/h y Δp<sub>máx</sub> = 1,78 mm H₂O = {c(fn['Pmax'])} Pa. Abertura de Ø38 mm: A = {c(fn['A_o'])} cm². K = 14. Con dos en serie (n = 2) y Q = 5,2 m³/h: velocidad {c(fn['v'], 2)} m/s; lado derecho 14 · {c(fn['pdin'], 2)} = {c(fn['dp_sys'])} Pa; lado izquierdo 2 · {c(fn['Pmax'])} · (1 − 5,2/8,2) = {c(fn['dp_fan'])} Pa",
       "Un ventilador: 4,2 m³/h (51 % de su caudal libre). Dos en serie: 5,2 m³/h (63 %)"))
W(f'''
<ul>
<li><strong>K</strong> es la suma de las pérdidas de todo el recorrido, referida a la abertura de Ø38: dos mallas de protección (unas 3 cada una), dos entradas y salidas bruscas (1,5 cada una), el paso por las dos chapas y los obstáculos de dentro (de 3 a 5). En total, entre 10 y 20; tomo 14 {EST}. Con el cuerpo del Sigma dentro del cajón hay un obstáculo más; cabe en ese margen.</li>
<li>La curva del ventilador la tomo recta entre sus dos datos de catálogo {EST}. La real tiene una panza a medio caudal, así que estos caudales son algo optimistas.</li>
<li>Con 12 V en la máquina se podría montar la versión de 12 V del mismo ventilador. Mueve el mismo aire; no cambia nada de lo que sigue.</li>
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
W(fig("f_fan", f"Izquierda: curvas de uno y de dos ventiladores de 40 × 10 mm contra tres resistencias del recorrido; los puntos son el caso de cálculo. Derecha: calentamiento del aire que sale según el caudal real, con {c(F2['P'], 0)} W dentro."))
W(f'''
<h2>8.2 Cuánto enfría</h2>
''')
W(calc("Balance con ventilación: lo que no sale con el aire sale por las paredes y por la cara del Sigma",
       "ΔT<sub>salida</sub> = P / (G<sub>paredes</sub> + ρ·c<sub>p</sub>·Q)",
       f"P = {c(fn['P'])} W; G<sub>paredes</sub> = {c(fn['G_par'], 2)} W/K (del modelo, con el terminal); ρ·c<sub>p</sub>·Q = 1,17 · 1006 · 5,2 / 3600 = {c(fn['rcq'], 2)} W/K",
       f"ΔT<sub>salida</sub> = {c(fn['P'])} / {c(fn['G_par'] + fn['rcq'], 2)} = {s(fn['dT'], 1)} K. En el 80 % de los casos calculados, entre {s(MC['fan2']['media']['p10'], 1)} y {s(MC['fan2']['media']['p90'], 1)} K. Con el Solo eran {s(SOF['dT'], 1)} K"))
W(f'''
<p>Lo que ve cada pieza depende de dónde esté respecto a la corriente. Con la entrada arriba a la izquierda, junto al sensor, y la salida abajo:</p>
<table>
<tr><th>Pieza</th><th class="n">Fracción del calentamiento<br>de salida que ve</th><th class="n">Aire a su lado</th><th>Por qué</th></tr>
<tr><td>Sensor ZE29A</td><td class="n">0,30 (0,15–0,50)</td><td class="n">{s(F2["local"]["sensor"], 1)} K</td><td>Recibe el chorro de entrada, apenas mezclado</td></tr>
<tr><td>Cámara</td><td class="n">0,45</td><td class="n">{s(F2["local"]["camara"], 1)} K</td><td>Arriba a la izquierda, al lado del chorro</td></tr>
<tr><td>Módem 4G</td><td class="n">0,70 (0,50–0,90)</td><td class="n">{s(F2["local"]["modem"], 1)} K</td><td>A media altura, en el camino de bajada del aire</td></tr>
<tr><td>Raspberry Pi</td><td class="n">0,75</td><td class="n">{s(F2["local"]["pi"], 1)} K</td><td>Debajo del sensor, con el aire ya algo calentado</td></tr>
<tr><td>Pantalla</td><td class="n">1,00</td><td class="n">{s(F2["local"]["pantalla"], 1)} K</td><td>Abajo, hacia la salida</td></tr>
<tr><td>myPOS Sigma (por detrás)</td><td class="n">1,00</td><td class="n">{s(F2["local"]["sigma"], 1)} K</td><td>Arriba a la derecha, fuera de la corriente</td></tr>
<tr><td>Fuente y convertidor</td><td class="n">1,00 más 6 K</td><td class="n">{s(F2["local"]["fuente"], 1)} K</td><td>Dentro de la caja de red, sin corriente directa</td></tr>
</table>
<p class="peq">Fracciones {EST}; son lo que el ensayo del apartado 14 tiene que confirmar con una sonda en cada punto.</p>

<h2>8.3 Dónde van la entrada y la salida</h2>
<p><strong>El principio no cambia:</strong> el aire fresco entra por donde está lo que menos aguanta. Lo que cambia es qué es lo que menos aguanta. Con el Solo era el lector, arriba a la derecha. Con el Sigma, todo lo delicado queda en la mitad izquierda y detrás: el sensor arriba, la Pi debajo y el módem a media altura. A la derecha quedan el Sigma y la fuente, que aguantan 70 °C.</p>
<table>
<tr><th>Punto</th><th>Qué he comprobado en el CAD</th><th>Qué propongo</th></tr>
<tr><td><strong>Entrada</strong></td><td>En el lateral izquierdo, encima de la ventana de la antena, está hoy la rejilla de arriba (a 351–371 mm de la base). Entre la placa de la antena, que llega a 349 mm, y el borde del cajón, a 401 mm, quedan 52 mm de alto, y hay 49 mm de fondo entre pestañas. El sensor empieza a unos 20 mm del lateral del cajón</td><td><strong>Entrada ahí, soplando hacia el sensor.</strong> Cabe un 40 × 10 mm, justo; hay que mover los dos topes de goma de arriba a la izquierda. A confirmar en el bloque 3</td></tr>
<tr><td><strong>Salida</strong></td><td>Como en la revisión 1: junto a la toma C14 no cabe una abertura de Ø38 (quedan 33 mm) y las 4 ranuras de la caja de red ({c(R["fan_cajared"]["A_cm2"])} cm²) bajarían el caudal de 5,2 a {c(R["fan_cajared"]["Q"])} m³/h</td><td><strong>Salida abajo a la izquierda</strong>, donde hoy está la rejilla de entrada: 49 mm de fondo y 46 mm de alto bajo la placa de la antena. El aire baja por el lado de la Pi y el módem</td></tr>
<tr><td><strong>El módem</strong></td><td>Hoy va en el USB de abajo de la Pi, detrás y hacia el centro, a media altura. Es la pieza que limita con ventilación. Además está justo detrás de donde entraría el cuerpo del Sigma</td><td>Pasarlo al montaje (b) del Bloque 1, <strong>tras la ventana de la antena</strong>: queda debajo de la entrada de aire y libera el fondo detrás del Sigma. El bar máximo sube de {fl(bar_disp["izquierda"])} a {fl(bar_disp["modem_b"])} °C {EST}</td></tr>
<tr><td><strong>El lado derecho</strong></td><td>Con entrada y salida a la izquierda, el Sigma y la fuente quedan en la zona menos barrida</td><td>No importa: los dos admiten 70 °C y el Sigma echa parte de su calor por la cara. Sí conviene abrir 10 cm² o más de ranuras en la caja de red para que la fuente y el convertidor respiren</td></tr>
<tr><td><strong>Ventilador de 60 mm</strong></td><td>En los laterales hay 49 mm de fondo entre las pestañas del cajón: <strong>un 60 mm no cabe</strong></td><td>Dos de 40 mm. Si el fondo interior lo permite, el de salida de 40 × 20 mm</td></tr>
</table>
<ul>
<li><strong>Si la entrada se quedara donde iba con el Solo</strong> (arriba a la derecha), el aire fresco se lo llevaría el Sigma, que no lo necesita: el sensor vería {s(DI["derecha"]["local"]["sensor"], 1)} K, el módem {s(DI["derecha"]["local"]["modem"], 1)} K y el bar máximo bajaría a {fl(bar_disp["derecha"])} °C {EST}. Funciona, pero desperdicia el mejor sitio.</li>
<li><strong>Las rejillas actuales no valen como salida de un ventilador.</strong> Tres ranuras en dos chapas son un K de {c(R["fan_rejilla"]["K"], 0)}: el caudal se queda en {c(R["fan_rejilla"]["Q"])} m³/h. Hacen falta aberturas de verdad, de Ø38 o equivalentes.</li>
<li><strong>Burlete entre cajón y carcasa en cada abertura</strong>, como ya dice el Bloque 1. Sin él, el ventilador de entrada sopla al hueco entre las dos chapas y el aire vuelve a salir sin pasar por dentro.</li>
<li><strong>Aberturas con lamas hacia abajo o con un deflector por dentro</strong>, para que una copa tirada de lado no entre. Esa protección es parte del K = 14.</li>
<li><strong>El hueco del Sigma no es una entrada de aire.</strong> El terminal es IP65 por delante; el marco tiene que sellar contra el frente con su junta para que no entre líquido ni se escape el aire de los ventiladores.</li>
</ul>

<h2>8.4 Averías y suciedad</h2>
<table>
<tr><th>Situación</th><th class="n">Caudal</th><th class="n">Aire que sale</th><th class="n">Junto al sensor,<br>bar a 30 °C</th><th class="n">Junto al módem,<br>bar a 30 °C</th><th>Valoración</th></tr>
<tr><td>Dos ventiladores, mallas limpias</td><td class="n">5,2 m³/h</td><td class="n">{s(F2["dT"], 1)} K</td><td class="n">{c(30 + 0.30 * F2["dT"], 0)} °C</td><td class="n">{c(30 + 0.70 * F2["dT"], 0)} °C</td><td>Normal</td></tr>
<tr><td>Un ventilador parado (el otro tira a través de él)</td><td class="n">{c(R["fan_fallo"]["Q"])} m³/h</td><td class="n">{s(R["fan_fallo"]["dT"], 1)} K</td><td class="n">{c(30 + 0.40 * R["fan_fallo"]["dT"], 0)} °C</td><td class="n">{c(30 + 0.75 * R["fan_fallo"]["dT"], 0)} °C</td><td>Sigue en ficha. Avisar y cambiarlo en la siguiente visita</td></tr>
<tr><td>Mallas tapadas al 50 %</td><td class="n">{c(R["fan_sucio"]["50"])} m³/h</td><td class="n">{s(R["fan_sucio_dT"]["50"], 1)} K</td><td class="n">{c(30 + 0.35 * R["fan_sucio_dT"]["50"], 0)} °C</td><td class="n">{c(30 + 0.72 * R["fan_sucio_dT"]["50"], 0)} °C</td><td>Sigue en ficha</td></tr>
<tr><td>Mallas tapadas al 75 %</td><td class="n">{c(R["fan_sucio"]["75"])} m³/h</td><td class="n">{s(R["fan_sucio_dT"]["75"], 1)} K</td><td class="n">{c(30 + 0.45 * R["fan_sucio_dT"]["75"], 0)} °C</td><td class="n">{c(30 + 0.80 * R["fan_sucio_dT"]["75"], 0)} °C</td><td>El módem, en su límite. La sonda lo ve; los tacómetros no</td></tr>
<tr><td>Mallas tapadas al 90 %, o una funda encima</td><td class="n">{c(R["fan_sucio"]["90"])} m³/h</td><td class="n">{s(R["fan_sucio_dT"]["90"], 1)} K</td><td class="n">{c(30 + 0.70 * R["fan_sucio_dT"]["90"], 0)} °C</td><td class="n">{c(30 + 0.90 * R["fan_sucio_dT"]["90"], 0)} °C</td><td>Fuera de ficha</td></tr>
<tr><td>Los dos parados</td><td class="n">tiro natural</td><td class="n">{s(R["fallo_total"]["dT"], 0)} K de media</td><td class="n">{c(30 + R["fallo_total"]["sensor"], 0)} °C</td><td class="n">{c(30 + R["fallo_total"]["modem"], 0)} °C</td><td>Como sin ventilador. Hay que dejar de vender pruebas</td></tr>
</table>
<p class="peq">Con poco caudal la corriente deja de barrer y cada pieza ve una fracción mayor del calentamiento; por eso en las filas degradadas uso fracciones de 0,35 a 0,7 para el sensor y de 0,72 a 0,9 para el módem {EST}.</p>

<h2>8.5 Los ventiladores siguen siendo una pieza crítica, pero menos</h2>
<ul>
<li><strong>Con el Solo, quedarse sin ventilación podía costar un lector.</strong> Con el Sigma no se rompe nada: el sensor y el módem trabajan fuera de rango y la máquina tiene que dejar de vender hasta que se enfríe. Sigue siendo una avería que hay que detectar; ya no es una que no tenga vuelta atrás.</li>
<li><strong>Hoy los dos ventiladores cuelgan del mismo fusible</strong> (W31 del Bloque 1, MINI de 2 A). Un fusible, un empalme o un cable dejan la máquina sin ventilación de golpe. Sigo proponiendo <strong>un fusible por ventilador</strong>.</li>
<li><strong>Los tacómetros no bastan.</strong> Un ventilador puede girar a sus vueltas con la malla tapada o con una funda encima. Hace falta <strong>una sonda de temperatura junto al sensor</strong> (una DS18B20 al GPIO4, unos 3 €), que mide lo que de verdad importa. En la revisión 1 iba junto al Solo.</li>
<li><strong>Dos fuentes de temperatura para el programa:</strong> la sonda y la del procesador de la Pi (<code>vcgencmd measure_temp</code>). La <code>battery_temperature</code> del Solo desaparece con él. Umbrales en el apartado 13.</li>
<li><strong>Dejar de vender exige poder parar el cobro.</strong> Con la app Pulse el Sigma cobra por su cuenta y manda un pulso; la Pi no interviene. La documentación de myPOS describe tres entradas para señales de la máquina {HOJA}, y el estudio de cobro habla de «opciones de inhibición», pero en la página de Pulse que he leído esas entradas solo aparecen como señales de confirmación: hay que preguntárselo a myPOS. Si no se puede, se le cortan los 12 V con un transistor.</li>
<li><strong>Polvo.</strong> Malla metálica y no filtro de espuma. Con malla, lo que se tapa se ve desde fuera y se limpia con la mano.</li>
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


W(tabla_margen("actual", "9.1 Sin ventilador"))
W(tabla_margen("fan2", "9.2 Con dos ventiladores de 40 mm"))
W(f'''<p class="ley"><span class="st ok">✓ en ficha, margen ≥ 5 K</span><span class="st justo">! en ficha, margen &lt; 5 K</span><span class="st mal">✗ fuera de ficha</span> Temperaturas en °C {CALC}. Pantalla: límite de 50 °C {SUP}. Fuente y convertidor: aire dentro de la caja de red.</p>

<h2>9.3 Temperatura máxima del bar, pieza a pieza</h2>
<table>
<tr><th>Pieza</th><th class="n">Sin ventilador</th><th class="n">Interior pintado</th><th class="n">1 ventilador</th><th class="n">2 ventiladores</th></tr>
''')
for comp in R["comp"]:
    k_ = comp["clave"]
    W(f'<tr><td>{comp["nombre"]} ({comp["tmax"]} °C)</td>' + "".join(f'<td class="n">{fl(BM[x][k_])} °C</td>' for x in ("actual", "pintado", "fan1", "fan2")) + "</tr>")
W(f'''<tr><td><strong>Todo en ficha</strong></td>''' + "".join(f'<td class="n"><strong>{fl(bar_todo[x])} °C</strong></td>' for x in ("actual", "pintado", "fan1", "fan2")) + f'''</tr>
<tr><td>Todo en ficha, con el Solo (revisión 1)</td><td class="n">{fl(bar_todo_solo["actual"])} °C</td><td class="n">{fl(bar_todo_solo["pintado"])} °C</td><td class="n">33 °C</td><td class="n">{fl(bar_todo_solo["fan2"])} °C</td></tr>
</table>
<ul>
<li><strong>Sin ventilador el Sigma aguantaría un bar a {fl(BM["actual"]["sigma"])} °C;</strong> el sensor, uno a {fl(BM["actual"]["sensor"])} °C. El cambio de lector quita un límite de la lista, no el primero.</li>
<li><strong>Con ventilación limita el módem,</strong> igual que antes: 40 °C y a media altura. En el 80 % de los casos calculados el bar máximo queda entre {fl(MC["fan2"]["barmax"]["p10"])} y {fl(MC["fan2"]["barmax"]["p90"])} °C. Con el módem tras la ventana de la antena, bajo la entrada de aire, sube a unos {fl(bar_disp["modem_b"])} °C.</li>
<li>Un bar climatizado está entre 21 y 26 °C: el reglamento español de instalaciones térmicas no deja calentar por encima de 21 °C ni enfriar por debajo de 26 °C. Con ventilación quedan de {c(40 - 26 - F2["local"]["modem"], 0)} a {c(40 - 21 - F2["local"]["modem"], 0)} K de margen. Un bar sin aire acondicionado en agosto puede pasar de 30 °C, y ahí el margen es de {c(40 - 30 - F2["local"]["modem"], 0)} K.</li>
</ul>

<h2>9.4 La Pi por dentro</h2>
<ul>
<li>El límite de 50 °C es del aire que la rodea. Lo que la frena es el procesador: a 60 °C baja de 1,4 a 1,2 GHz y a partir de 80 °C recorta más {HOJA}.</li>
<li>En las pruebas publicadas, la 3B+ gasta 1,9 W en reposo y 5,8 W a plena carga, y a plena carga llega enseguida a sus 60 °C en una mesa. De ahí saco unos 9–11 K por vatio entre el procesador y el aire {EST}.</li>
<li>Con unos 3 W reproduciendo vídeo, el procesador va de 27 a 33 K por encima del aire que lo rodea:</li>
</ul>
<table>
<tr><th>Caso</th><th class="n">Aire junto a la Pi</th><th class="n">Procesador (estimado)</th><th>Efecto</th></tr>
<tr><td>Sin ventilador, bar a 25 °C</td><td class="n">{c(M["actual"]["25"]["pi"], 0)} °C</td><td class="n">{c(M["actual"]["25"]["pi"] + 27, 0)}–{c(M["actual"]["25"]["pi"] + 33, 0)} °C</td><td>Recorte fuerte: vídeo a saltos</td></tr>
<tr><td>Dos ventiladores, bar a 25 °C</td><td class="n">{c(M["fan2"]["25"]["pi"], 0)} °C</td><td class="n">{c(M["fan2"]["25"]["pi"] + 27, 0)}–{c(M["fan2"]["25"]["pi"] + 33, 0)} °C</td><td>En el umbral de los 60 °C</td></tr>
<tr><td>Dos ventiladores, bar a 35 °C</td><td class="n">{c(M["fan2"]["35"]["pi"], 0)} °C</td><td class="n">{c(M["fan2"]["35"]["pi"] + 27, 0)}–{c(M["fan2"]["35"]["pi"] + 33, 0)} °C</td><td>A 1,2 GHz casi siempre</td></tr>
</table>
<ul>
<li><strong>Dos medidas baratas:</strong> un disipador de aluminio pegado al procesador (unos 3 €; de 5 a 10 K menos {EST}) y <code>temp_soft_limit=70</code> en <code>config.txt</code>, que sube el primer umbral de 60 a 70 °C y es el máximo que admite ese ajuste.</li>
<li>Con el cobro por pulsos la Pi trabaja menos: ya no pregunta a SumUp cada 3 segundos ni hace de punto de acceso Wi-Fi para el lector. Algo bajará su consumo; no lo descuento {EST}.</li>
</ul>

<h2>9.5 La fuente y el convertidor</h2>
''')
W(fig("f_fuente", f"Curva de reducción de carga de la serie LRS-50 a 230 V, leída en la hoja de Mean Well, con los puntos de trabajo de la LRS-50-12 en esta máquina. Cada trazo vertical va del consumo típico ({c(KP['carga_psu'] * 100, 0)} %) al pico (59 %). La fuente queda dentro de su zona en todos los casos."))
W(f'''
<ul>
<li><strong>La LRS-50-12 no limita.</strong> A 12 V la máquina le pide {c(KP["bus"], 0)} W de sus 50: un tercio. El pico, con la Pi, el módem, la pantalla y el Sigma a tope a la vez, ronda el 59 % {EST}.</li>
<li><strong>Sin ventilador y con el bar a 35 °C</strong> el aire de la caja de red llega a {c(35 + A["local"]["fuente"], 0)} °C. La fuente lo admite hasta el {c(100 - 2 * (35 + A["local"]["fuente"] - 50), 0)} % de carga; el convertidor ya estaría reduciendo. Es otro motivo para ventilar.</li>
<li><strong>Con ventiladores y el bar a 35 °C</strong> son {c(35 + F2["local"]["fuente"], 0)} °C: los dos trabajan sin reducción.</li>
<li>Lo que sí cambia con el calor es su vida (apartado 12).</li>
</ul>

<h2>9.6 El Sigma por dentro</h2>
<ul>
<li>Los 70 °C son del aire que lo rodea. Aquí tiene dos aires: el del bar por delante y el del cajón por detrás. Como criterio prudente comparo sus 70 °C con el aire de detrás.</li>
<li><strong>Con ventiladores</strong> el aire de detrás va {s(F2["local"]["sigma"], 0)} K sobre el bar y el terminal, por dentro, unos {s(F2["Sig"], 0)} K {CALC}. Con el bar a 35 °C son {c(35 + F2["local"]["sigma"], 0)} °C alrededor y unos {c(35 + F2["Sig"], 0)} °C dentro. Le sobran más de 25 K.</li>
<li><strong>Sin ventiladores</strong> el aire de detrás va {s(A["local"]["sigma"], 0)} K sobre el bar: llega a 70 °C con el bar a {fl(BM["actual"]["sigma"])} °C. Es el único caso en el que el Sigma se acerca a su límite, y antes ya han fallado el sensor, el módem, la Pi y la pantalla.</li>
<li>Si gasta 6 W en vez de 3, por dentro sube a {s(R["sigma_P"]["6.0"]["Sig_fan"], 0)} K con ventiladores. Sigue holgado.</li>
</ul>

<div class="caja ok">
<h3>Respuesta a «qué temperatura soporta», con el Sigma</h3>
<ul>
<li><strong>La carcasa, los materiales y ahora también el lector:</strong> 70 °C o más. No limitan.</li>
<li><strong>La máquina sin ventilador:</strong> un bar a {fl(bar_todo["actual"])} °C con todo en ficha. En un bar normal, a 22–26 °C, el sensor trabajaría a {c(22 + A["local"]["sensor"], 0)}–{c(26 + A["local"]["sensor"], 0)} °C.</li>
<li><strong>La máquina con dos ventiladores:</strong> hasta unos <strong>{fl(bar_todo["fan2"])} °C de bar</strong> con todo en ficha, y {fl(BM["fan2"]["sensor"])} °C si solo se mira el sensor. Mantengo la especificación de instalación de la revisión 1: <strong>bares de 10 a 32 °C</strong>.</li>
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
W(fig("f_trans", "Temperatura del aire junto al sensor con el bar a 25 °C. Izquierda: desde que se enchufa en frío. Derecha: desde que se paran los dos ventiladores estando en régimen."))
W(f'''
<h2>10.1 Arranque en frío</h2>
<ul>
<li><strong>Sin ventilador:</strong> el aire junto al sensor pasa de 40 °C a los <strong>{mins(T["actual_t40"])} minutos</strong> de enchufar. Llega al 63 % de su subida en {mins(T["actual_63"])} minutos y al 95 % en {c(T["actual_95"])} horas.</li>
<li><strong>Con ventiladores:</strong> se estabiliza en menos de {c(T["fan2_95"], 1)} horas, a {c(25 + T["fan2_fin"], 0)} °C.</li>
<li>El aire interior responde rápido porque dentro hay poca masa: placas, cables y un cajón de 1,9 kg. La chapa exterior tarda más, pero solo aporta {c(A["chapa_sup"], 0)} de los {c(A["local"]["sensor"], 0)} K.</li>
<li><strong>Para el ensayo, 4 horas bastan:</strong> a las 4 h el modelo está al {c(100 * T["actual_4h"] / T["actual_fin"], 0)} % del valor final.</li>
</ul>

<h2>10.2 Avería de la ventilación</h2>
<ul>
<li>Si se paran los dos ventiladores con el bar a 25 °C, el aire junto al sensor pasa de {c(T["fallo_ini"], 0)} a 40 °C en unos <strong>{mins(T["fallo_t40"])} minutos</strong> y se estabiliza en {c(T["fallo_fin"], 0)} °C. Junto al módem, que parte de {c(T["fallo_ini_modem"], 0)} °C, son unos {mins(T["fallo_t40_modem"])} minutos.</li>
<li>Con el bar a 30 °C son unos {mins(T["fallo_t40_30"])} minutos para el sensor y {max(1, mins(T["fallo_t40_modem_30"]))} para el módem.</li>
<li>La subida es tan rápida porque las piezas ya están calientes: con ventilación la Pi y la pantalla trabajan de 25 a 35 K por encima del bar y es el aire quien las enfría. Al pararse el aire, ese calor se queda dentro en minutos. El modelo supone que el aire caliente tarda unos 10 minutos en acumularse arriba {SUP}.</li>
<li><strong>Qué se pierde:</strong> con el Solo, a partir de 40 °C empezaba el riesgo de un bloqueo sin vuelta atrás. Con el Sigma, el aire de detrás del terminal se estabiliza en {c(25 + R["fallo_total"]["sigma"], 0)} °C con el bar a 25 °C y en {c(35 + R["fallo_total"]["sigma"], 0)} °C con el bar a 35 °C: dentro de sus 70 °C, justo en el segundo caso. El sensor y el módem trabajan fuera de ficha mientras dure, y se recuperan al enfriarse.</li>
<li><strong>Consecuencia:</strong> el programa sigue teniendo minutos, no horas. Tiene que leer la sonda cada pocos segundos, bajar el consumo en el primer umbral y dejar de vender pruebas en el segundo. Lo que cambia es que llegar tarde ya no cuesta un aparato.</li>
</ul>

<h2>10.3 Corte de luz nocturno</h2>
<ul>
<li>Apagada, la máquina se enfría sola: en {c(T_ENFRIA, 1)} horas el aire interior está a menos de 2 K del bar.</li>
<li>Un corte de 7 horas la deja a la temperatura del local. Cada mañana arranca en frío y repite la curva de la figura.</li>
<li>Para el calor esto es bueno: las noches apagada son horas a temperatura ambiente para los condensadores de la fuente y para el sensor.</li>
<li>El arranque del Solo tras un corte era la prueba A1 del Bloque 1. Con el Sigma hay que comprobar lo equivalente en el banco: que al volver la corriente arranque solo y vuelva a la app Pulse sin que nadie lo toque.</li>
</ul>
''')

# =================================================================== 11. SOL, FUNDA, FRÍO
W(h1("11", "Sol, funda y frío"))
E = R["ext"]
W(fig("f_ext", "Calentamiento medio del aire interior en cinco situaciones. «Funda que tapa las aberturas»: sin ventilador equivale a sellar las rejillas; con ventiladores supongo que el caudal cae a 1 m³/h."))
W(f'''
<h2>11.1 Sol directo</h2>
''')
W(calc("Calor del sol sobre el frente y un lateral",
       "P<sub>sol</sub> = q<sub>abs</sub>·(A<sub>frente</sub> + A<sub>lateral</sub>) · · · q<sub>abs</sub> = α·I",
       f"A<sub>frente</sub> = 0,22 · 0,44 = {c(K['sol']['frente'], 3)} m²; A<sub>lateral</sub> = {c(K['sol']['lado'], 3)} m². Tras un escaparate llegan de 300 a 600 W/m² {EST}; el rosa absorbe más o menos la mitad y la pantalla negra y la cara del Sigma, casi todo: q<sub>abs</sub> de 150 a 300 W/m²",
       f"De {c(K['sol']['W150'], 0)} a {c(K['sol']['W300'], 0)} W de más: entre una y dos veces lo que genera la propia máquina"))
W(f'''
<table>
<tr><th>Sol absorbido</th><th>Configuración</th><th class="n">Aire interior</th><th class="n">Chapa más caliente</th><th class="n">Pantalla de 7″,<br>bar a 25 °C</th><th class="n">Sigma por dentro,<br>bar a 25 °C</th></tr>
<tr><td rowspan="2">150 W/m² (débil u oblicuo)</td><td>Sin ventilador</td><td class="n">{s(E["actual"]["sol150"]["dT"])} K</td><td class="n">{s(E["actual"]["sol150"]["chapa_max"])} K</td><td class="n">{c(25 + E["actual"]["sol150"]["Scr"], 0)} °C</td><td class="n">{c(25 + E["actual"]["sol150"]["Sig"], 0)} °C</td></tr>
<tr><td>2 ventiladores</td><td class="n">{s(E["fan2"]["sol150"]["dT"])} K</td><td class="n">{s(E["fan2"]["sol150"]["chapa_max"])} K</td><td class="n">{c(25 + E["fan2"]["sol150"]["Scr"], 0)} °C</td><td class="n">{c(25 + E["fan2"]["sol150"]["Sig"], 0)} °C</td></tr>
<tr><td rowspan="2">300 W/m² (directo)</td><td>Sin ventilador</td><td class="n">{s(E["actual"]["sol300"]["dT"])} K</td><td class="n">{s(E["actual"]["sol300"]["chapa_max"])} K</td><td class="n">{c(25 + E["actual"]["sol300"]["Scr"], 0)} °C</td><td class="n">{c(25 + E["actual"]["sol300"]["Sig"], 0)} °C</td></tr>
<tr><td>2 ventiladores</td><td class="n">{s(E["fan2"]["sol300"]["dT"])} K</td><td class="n">{s(E["fan2"]["sol300"]["chapa_max"])} K</td><td class="n">{c(25 + E["fan2"]["sol300"]["Scr"], 0)} °C</td><td class="n">{c(25 + E["fan2"]["sol300"]["Sig"], 0)} °C</td></tr>
</table>
<ul>
<li><strong>El Sigma aguanta el sol; la pantalla de 7″, no.</strong> El terminal está hecho para ir a la intemperie y da su calor al bar por la cara. La pantalla sigue detrás de dos policarbonatos que no dejan salir lo que entra: {c(25 + E["fan2"]["sol300"]["Scr"], 0)} °C con ventiladores, la zona en la que un LCD empieza a oscurecerse {GEN}.</li>
<li>Con sol directo y ventiladores el aire interior sube a {s(E["fan2"]["sol300"]["dT"])} K: el módem pasaría de 40 °C con el bar a {fl(40 - 0.70 * E["fan2"]["sol300"]["dT"])} °C.</li>
<li>La chapa llega a {c(25 + E["actual"]["sol300"]["chapa_max"], 0)} °C: por encima del umbral de quemadura por contacto prolongado.</li>
<li><strong>Regla de instalación, la misma:</strong> ninguna hora de sol directo sobre la máquina, tampoco a través de un cristal. Si un local solo tiene ese sitio, no se instala.</li>
</ul>

<h2>11.2 La funda de plástico</h2>
<ul>
<li><strong>Bien hecha no molesta.</strong> Una funda de 2 mm ajustada a los laterales y la tapa añade unos 0,02 m²K/W: {s(E["actual"]["funda2"]["dT"] - E["actual"]["base"]["dT"], 1)} K sin ventilador y nada apreciable con ventiladores. Por la chapa sale poco calor; taparla cambia poco.</li>
<li><strong>Mal hecha es una avería.</strong> Si tapa las aberturas, la máquina ventilada se va a {s(E["fan2"]["funda_tapa"]["dT"])} K. La funda tiene que dejar libres la entrada, la salida, la rejilla que quede y la ventana de la antena, con margen alrededor.</li>
<li><strong>Y ahora, la cara del Sigma.</strong> No puede quedar detrás de ningún plástico: es por donde se paga y por donde el terminal echa su calor.</li>
<li><strong>Material.</strong> El PLA de impresión 3D empieza a ablandarse hacia 55–60 °C {GEN}. En condiciones normales la chapa no llega, pero con sol sí. Mejor PETG o ABS.</li>
</ul>

<h2>11.3 Fuentes de calor cercanas</h2>
<ul>
<li>El modelo toma como «bar» el aire que rodea la máquina, no el del termostato del local.</li>
<li>Encima de un radiador, junto a la salida de aire de un botellero o una nevera, al lado de la cafetera o bajo un foco halógeno, ese aire puede estar de 5 a 15 K por encima del resto {EST}. Cada kelvin ahí es un kelvin dentro.</li>
<li><strong>Regla de instalación:</strong> a más de un metro de cualquier salida de aire caliente y nunca encima de un radiador.</li>
</ul>

<h2>11.4 Frío</h2>
<table>
<tr><th>Bar</th><th class="n">Sensor, ventiladores en marcha</th><th class="n">Sensor, ventiladores parados</th><th class="n">Aire detrás del Sigma, ventiladores en marcha</th></tr>
''')
for Ta in ("0", "5", "10", "15"):
    fr = R["frio"][Ta]
    cl = "mal" if fr["fan2"]["sensor"] < 10 else "ok"
    W(f'<tr><td>{Ta} °C</td><td class="n">{c(fr["fan2"]["sensor"], 0)} °C{" (bajo su mínimo de 10 °C)" if cl == "mal" else ""}</td><td class="n">{c(fr["actual"]["sensor"], 0)} °C</td><td class="n">{c(fr["fan2"]["sigma"], 0)} °C</td></tr>')
W(f'''</table>
<ul>
<li>Con los ventiladores siempre en marcha, el sensor baja de sus 10 °C cuando el bar baja de unos {fl(10 - F2["local"]["sensor"])} °C. Con los ventiladores parados, la máquina se calienta sola y el sensor está a más de 30 °C aunque el bar esté a 0 °C.</li>
<li>El Sigma trabaja desde −20 °C: el frío no le afecta en ningún local.</li>
<li><strong>Propuesta, la de la revisión 1:</strong> que los ventiladores no giren siempre. Parados por debajo de unos 25 °C en la sonda interior y en marcha por encima de 30 °C. Hace falta un transistor o un relé en su rama, o la versión PWM del mismo ventilador.</li>
<li>Ventajas: el sensor trabaja templado, que es como mejor mide y como menos condensa el aliento en el tubo; los ventiladores duran más; y entra menos polvo.</li>
<li>Tras una noche apagada en un local frío, la máquina arranca a la temperatura del bar. Si está por debajo de 10 °C, el programa tiene que esperar a que la sonda suba antes de dar una prueba por válida.</li>
</ul>
''')

# =================================================================== 12. VIDA ÚTIL
W(h1("12", "Calor y vida útil"))
dTf = (25 + A["local"]["fuente"]) - (25 + F2["local"]["fuente"])
W(f'''
<p class="lead">Estar dentro de ficha no basta para dos años. Con el Solo, la pieza que antes envejecía era su batería. Con el Sigma esa preocupación desaparece y quedan dos: los condensadores de la fuente y la celda del sensor.</p>

<h2>12.1 Lo que ya no envejece: la batería del lector</h2>
<table>
<tr><th>Temperatura de una batería de litio siempre al 100 % de carga</th><th class="n">Capacidad que queda al cabo de un año</th></tr>
<tr><td>25 °C</td><td class="n">80 %</td></tr>
<tr><td>40 °C</td><td class="n">65 %</td></tr>
<tr><td>60 °C</td><td class="n">60 % a los 3 meses</td></tr>
</table>
<p class="peq">Datos de Battery University para celdas de litio corrientes {HOJA}. Era el caso del Solo, siempre enchufado.</p>
<ul>
<li>En la revisión 1 esta tabla decidía la visita de los dos años: el Solo era una pieza que había que cambiar, y sin ventilación su batería se agotaba en meses.</li>
<li><strong>El Sigma se alimenta de la máquina y no lleva batería.</strong> Esa partida sale del mantenimiento.</li>
</ul>

<h2>12.2 Condensadores de la fuente y del convertidor</h2>
''')
W(calc("Vida de los condensadores electrolíticos: se dobla cada 10 °C menos",
       "L<sub>2</sub> / L<sub>1</sub> = 2<sup>(T<sub>1</sub> − T<sub>2</sub>) / 10</sup>",
       f"Aire junto a la fuente con el bar a 25 °C: {c(25 + A['local']['fuente'], 0)} °C sin ventilador y {c(25 + F2['local']['fuente'], 0)} °C con ventiladores. Diferencia: {c(dTf, 0)} K",
       f"2<sup>{c(dTf / 10, 2)}</sup> = {c(2 ** (dTf / 10), 1)}: con ventilación, los condensadores duran unas {c(2 ** (dTf / 10), 0)} veces más"))
W(f'''
<ul>
<li>Los electrolíticos son la única pieza de una fuente que se desgasta, y su vida depende casi solo de la temperatura {GEN}.</li>
<li>Ahora hay dos aparatos con electrolíticos en la caja de red, la fuente y el convertidor, y disipan entre los dos {c(KP["p_psu"] + KP["p_dcdc"], 1)} W en vez de 3,5. Es el argumento de vida útil a favor de dejar la LRS-50-5 y añadir una fuente pequeña: menos calor en el rincón sin corriente.</li>
<li>Con ventiladores la caja de red queda a {c(25 + F2["local"]["fuente"], 0)} °C con el bar a 25 °C: temperatura cómoda para cualquier fuente industrial.</li>
</ul>

<h2>12.3 El resto</h2>
<table>
<tr><th>Pieza</th><th>Qué le hace el calor</th><th>Qué hacer</th></tr>
<tr><td>Sensor ZE29A</td><td>Las celdas electroquímicas pierden electrolito más deprisa con calor y aire seco {GEN}. El manual no da vida. <strong>Pasa a ser la pieza que más sufre el calor</strong></td><td>Tenerlo entre 15 y 35 °C: en el chorro de entrada en verano y con los ventiladores parados en invierno</td></tr>
<tr><td>Pantalla de 7″</td><td>La retroiluminación pierde brillo antes cuanto más caliente trabaja. Paneles parecidos dan 20 000 h a mitad de brillo; dos años encendida son 17 500 h</td><td>Brillo al mínimo útil y apagarla en las horas de cierre: menos calor y menos horas</td></tr>
<tr><td>myPOS Sigma</td><td>Su pantalla envejece como cualquier LCD. Trabaja unos {c(25 + F2["Sig"], 0)} °C por dentro con el bar a 25 °C, lejos de su límite</td><td>Si la app lo permite, que apague la pantalla cuando no haya nadie delante</td></tr>
<tr><td>Ventiladores</td><td>Más de 150 000 h de vida media declarada y trabajo hasta 70 °C {HOJA}. Dos años son 17 500 h</td><td>No giran siempre (apartado 11.4)</td></tr>
<tr><td>microSD, Pi, módem</td><td>Dentro de ficha no hay un mecanismo de desgaste claro</td><td>—</td></tr>
</table>
''')

# =================================================================== 13. CAMBIOS
W(h1("13", "Cambios recomendados"))
W(f'''
<p class="lead">Por orden de importancia. Los cuatro primeros son los que cambian el resultado; el resto son baratos y quitan riesgos. Lo que cambia respecto a la revisión 1 va marcado como nuevo.</p>
<table class="larga">
<thead><tr><th style="width:4%">N.º</th><th style="width:34%">Cambio</th><th style="width:30%">Efecto</th><th style="width:14%">Coste</th><th>Dónde se hace</th></tr></thead>
<tr><td>1</td><td><strong>Ventilación forzada con dos ventiladores de 40 mm.</strong> Nuevo: la <strong>entrada va arriba a la izquierda, junto al sensor</strong>; la salida, abajo a la izquierda. Aberturas de Ø38 con malla y lamas, y burlete entre cajón y carcasa</td><td>Aire junto al sensor de {s(A["local"]["sensor"])} a {s(F2["local"]["sensor"])} K. Bar máximo de {fl(bar_todo["actual"])} a {fl(bar_todo["fan2"])} °C</td><td>Unos 40 € por máquina</td><td>CAD (bloque 3) y compras</td></tr>
<tr><td>2</td><td><strong>Nuevo: hueco del Sigma en el frente,</strong> de 108,7 × 86,4 mm, con su junta. Tumbado, o recolocando la pantalla. Comprobar el fondo con el aparato en la mano</td><td>Es la condición del cambio de lector. De paso, su cara saca de {c(F2["P_sig_out"], 1)} a {c(A["P_sig_out"], 1)} W directos al bar</td><td>El del terminal</td><td>CAD (bloque 3)</td></tr>
<tr><td>3</td><td><strong>Sonda de temperatura</strong> (DS18B20). Nuevo: <strong>junto al sensor</strong>, no junto al lector. Umbrales en el programa: a 36 °C baja el brillo y avisa; a 38 °C avisa como avería; a 40 °C deja de vender pruebas hasta que baje de 37 °C</td><td>La máquina se protege sola en los minutos que tiene. Detecta mallas tapadas, fundas y sol, que los tacómetros no ven</td><td>Unos 3 €</td><td>Compras y programa (bloque 4)</td></tr>
<tr><td>4</td><td><strong>Nuevo: poder parar el cobro desde la Pi.</strong> Preguntar a myPOS si una entrada del Sigma lo inhibe; si no, cortarle los 12 V con un transistor</td><td>Sin esto, el Sigma seguiría cobrando pruebas que la máquina no puede dar</td><td>Un transistor</td><td>Cableado (bloque 1) y programa</td></tr>
<tr><td>5</td><td><strong>Un fusible por ventilador</strong> en vez de uno para los dos</td><td>Un fallo eléctrico ya no deja la máquina sin ventilación</td><td>Un portafusibles</td><td>Tabla de cableado (W31)</td></tr>
<tr><td>6</td><td><strong>Nuevo: módem tras la ventana de la antena</strong> (montaje (b) del Bloque 1)</td><td>Queda bajo la entrada de aire: bar máximo de {fl(bar_disp["izquierda"])} a unos {fl(bar_disp["modem_b"])} °C. Libera el fondo detrás del Sigma</td><td>Un alargador USB</td><td>CAD y cableado</td></tr>
<tr><td>7</td><td><strong>Nuevo: decidir la fuente.</strong> Por calor, dejar la LRS-50-5 y añadir una fuente pequeña de 12 V solo para el Sigma</td><td>{c(FU["12V"]["P"] - FU["dos"]["P"], 1)} W menos que con LRS-50-12 y convertidor, y los 5 V del Bloque 1 no se tocan</td><td>Parecido</td><td>Bloque 1</td></tr>
<tr><td>8</td><td><strong>Cajón de componentes e interior de la carcasa pintados</strong> en mate, de cualquier color. Nunca galvanizado brillante sin pintar</td><td>{c(A["local"]["sensor"] - PN["local"]["sensor"], 0)} K menos cuando la ventilación falla. De paso resuelve el óxido del cajón</td><td>El de pintar por dentro</td><td>Pedido al taller</td></tr>
<tr><td>9</td><td><strong>Ventiladores con control:</strong> parados por debajo de 25 °C en la sonda, en marcha por encima de 30 °C</td><td>Sensor templado en invierno, menos polvo y más vida</td><td>Un transistor, o la versión PWM</td><td>Cableado y programa</td></tr>
<tr><td>10</td><td><strong>Reglas de instalación:</strong> nunca al sol, a más de un metro de salidas de aire caliente, bares de 10 a 32 °C, aberturas y cara del Sigma despejadas</td><td>Evita los casos que ningún ventilador arregla</td><td>Ninguno</td><td>Hoja de instalación</td></tr>
<tr><td>11</td><td><strong>Medir el consumo real.</strong> Nuevo: el del Sigma en sus 12 V, en reposo y cobrando; y el total en el enchufe</td><td>Sustituye las dos mayores incógnitas del estudio por datos</td><td>Unos 15 €</td><td>Banco</td></tr>
<tr><td>12</td><td><strong>Disipador en el procesador de la Pi</strong> y <code>temp_soft_limit=70</code></td><td>La Pi no baja de velocidad en verano</td><td>Unos 3 €</td><td>Compras y sistema</td></tr>
<tr><td>13</td><td><strong>Más ranuras en la caja de red</strong> (10 cm² o más entre frente y base)</td><td>La fuente y el convertidor respiran aunque no reciban corriente directa</td><td>Ninguno</td><td>CAD</td></tr>
<tr><td>14</td><td><strong>Menos vatios:</strong> brillo al mínimo útil, pantalla apagada en el cierre, módem fijado en 4G y, si la app lo permite, el Sigma en reposo cuando no hay nadie</td><td>De 1 a 4 W menos. Con ventilación son décimas de kelvin, pero dan margen si falla</td><td>Ninguno</td><td>Programa</td></tr>
</table>

<div class="caja">
<h3>Lo que no cambiaría</h3>
<ul>
<li><strong>Los ventiladores.</strong> Es la tentación al cambiar de lector, y el cálculo dice que no: sin ellos el sensor queda a {s(A["local"]["sensor"])} K.</li>
<li><strong>La doble pared y el cajón extraíble.</strong> Cuestan unos {c(R["doble_pared"]["con"] - R["doble_pared"]["sin"], 0)} K sin ventilación, pero con ventilación dejan de importar: el calor se va con el aire.</li>
<li><strong>El doble policarbonato de la pantalla.</strong> Aísla el frente, pero protege lo más frágil que queda a la vista y con ventilación tampoco limita.</li>
<li><strong>La chapa de 3 mm.</strong> Reparte muy bien el calor: la zona del cajón de pajitas saca {c(A["caminos"]["zona_baja"] + A["caminos"]["suelo"])} W sin generar ninguno.</li>
</ul>
</div>
''')

# =================================================================== 14. ENSAYO
Q_EJ = (18.0 - K["fan"]["G_par"] * 8.0) / (1.17 * 1006 * 8.0) * 3600
W(h1("14", "Plan de ensayo"))
W(f'''
<p class="lead">Es el ensayo E1 del Bloque 1, ampliado para que además diga si este modelo acierta. Necesita una carcasa de prototipo con el cajón montado y el Sigma puesto en su hueco.</p>

<h2>14.1 Instrumentación</h2>
<table>
<tr><th>Sonda</th><th>Dónde</th><th>Para qué</th></tr>
<tr><td>T0</td><td>Aire de la sala, a 1 m de la máquina y a su altura, a la sombra</td><td>Referencia</td></tr>
<tr><td>T1</td><td>Aire junto al sensor ZE29A</td><td>El dato que decide</td></tr>
<tr><td>T2</td><td>Aire junto al módem</td><td>Segunda pieza de 40 °C; la que limita con ventilación</td></tr>
<tr><td>T3</td><td>Aire a 1 cm de la trasera del Sigma</td><td>Comprobar que el terminal va holgado</td></tr>
<tr><td>T4, T5, T6</td><td>Aire en el eje del cajón, a 20, 110 y 210 mm de su base</td><td>Media y reparto en altura</td></tr>
<tr><td>T7</td><td>Aire dentro de la caja de red</td><td>Fuente y convertidor</td></tr>
<tr><td>T8</td><td>Chapa exterior, centro del lateral derecho, pegada con cinta</td><td>Comprobar que por fuera apenas se nota</td></tr>
<tr><td>T9</td><td>Aire en la boca de salida</td><td>Caudal real, por balance</td></tr>
<tr><td>—</td><td><code>vcgencmd measure_temp</code>, registrada cada minuto</td><td>Procesador de la Pi</td></tr>
<tr><td>—</td><td>Vatímetro de enchufe y un medidor en los 12 V del Sigma</td><td>Potencia real, total y del terminal</td></tr>
</table>
<p>Valen termopares tipo K con un registrador o diez DS18B20 en un mismo bus leídas por la propia Pi.</p>

<h2>14.2 Pasos</h2>
<table>
<tr><th>Paso</th><th>Qué se hace</th><th>Duración</th><th>Lo que predice el modelo (sobre T0)</th></tr>
<tr><td>1</td><td>Máquina cerrada en la pared, programa en espera con vídeo, Sigma encendido, <strong>ventiladores parados y todas las aberturas tapadas con cinta</strong>. <strong>Sin el sensor ni el módem:</strong> en su sitio, resistencias de 0,5 y 2 W. Son las dos piezas a las que este paso sacaría de ficha</td><td>3 h</td><td>T1 ≈ {s(SE["local"]["sensor"])} K; media de T4–T6 ≈ {s(SE["dT"])} K; T3 ≈ {s(SE["local"]["sigma"])} K; T8 ≈ {s(SE["chapa_sup"])} K. <strong>Parar si T3 pasa de 65 °C:</strong> con la sala a más de 22 °C ocurrirá antes de estabilizar, y vale igual</td></tr>
<tr><td>2</td><td>Quitar la cinta, poner el sensor y el módem, ventiladores en marcha</td><td>2 h</td><td>T9 ≈ {s(F2["dT"])} K (de {s(MC["fan2"]["media"]["p10"])} a {s(MC["fan2"]["media"]["p90"])}); T1 ≈ {s(F2["local"]["sensor"])} K; T2 ≈ {s(F2["local"]["modem"])} K; T3 ≈ {s(F2["local"]["sigma"])} K</td></tr>
<tr><td>3</td><td>Desenchufar un ventilador</td><td>1 h</td><td>T9 ≈ {s(R["fan_fallo"]["dT"])} K</td></tr>
<tr><td>4</td><td>Tapar media malla de entrada y media de salida</td><td>1 h</td><td>T9 ≈ {s(R["fan_sucio_dT"]["50"])} K</td></tr>
<tr><td>5</td><td>Parar los dos ventiladores con las aberturas libres y cronometrar</td><td>30 min</td><td>T1 llega a T0 + 15 K en unos {mins(T["fallo_t40"])} minutos</td></tr>
<tr><td>6</td><td>Cobros reales de prueba con el Sigma cada 2 minutos durante 30 minutos, anotando lo que gasta</td><td>30 min</td><td>Sin cambio apreciable sobre el paso 2</td></tr>
</table>

<h2>14.3 Criterio de aceptación</h2>
<ul>
<li><strong>Paso 2:</strong> T1 a menos de 5 K sobre la sala y T2 a menos de 8 K. Es el criterio del Bloque 1, con el módem añadido y sin el lector, que ya no decide.</li>
<li><strong>Paso 3:</strong> T1 a menos de 8 K sobre la sala con un ventilador parado.</li>
<li><strong>Procesador de la Pi</strong> por debajo de 70 °C en el paso 2 con la sala a 25 °C.</li>
<li><strong>Sigma:</strong> T3 a menos de 15 K sobre la sala en el paso 2.</li>
<li>Si el paso 2 no cumple: revisar el burlete y las mallas antes que nada. Después, ventilador de salida de 40 × 20 mm.</li>
</ul>

<h2>14.4 Cómo corregir el modelo con las medidas</h2>
''')
W(calc("Conductancia real de la máquina cerrada y caudal real de los ventiladores",
       "G<sub>cerrada</sub> = P / ΔT<sub>media</sub> (paso 1) · · · Q = (P − G<sub>paredes</sub>·ΔT<sub>salida</sub>) / (ρ·c<sub>p</sub>·ΔT<sub>salida</sub>) (paso 2)",
       f"El modelo da G<sub>cerrada</sub> = {c(G_SELL, 2)} W/K y G<sub>paredes</sub> = {c(K['fan']['G_par'], 2)} W/K con ventilación. Ejemplo: si en el paso 2 se miden 18 W y T9 = +8 K, Q = (18 − {c(K['fan']['G_par'], 2)} · 8) / (1,17 · 1006 · 8) · 3600",
       f"Q = {c(Q_EJ, 1)} m³/h. Con el caudal real, la figura [[f_fan]] da el margen que queda"))
W(f'''
<p>Con la potencia medida y esos dos números se rehacen las tablas del apartado 9 en una tarde. Los scripts están preparados para ello (anexo B).</p>
''')

# =================================================================== 15. CONCLUSIONES
W(h1("15", "Conclusiones"))
W(f'''
<ol>
<li><strong>Cambiar el Solo por el Sigma es una buena decisión para el calor, pero no por lo que parece.</strong> No enfría la máquina: la calienta unos {c(A["P"] - SOA["P"], 0)} W más. Lo que hace es sacar de la lista la pieza que se rompía para siempre.</li>
<li><strong>El problema térmico de fondo sigue igual.</strong> Doble pared, frente aislado, rejillas mínimas y dos piezas de 40 °C dentro, una de ellas arriba. Sin ventilador el sensor queda unos {c(A["local"]["sensor"], 0)} K por encima del bar, y eso aguanta cualquier combinación razonable de parámetros.</li>
<li><strong>La ventilación forzada lo sigue resolviendo:</strong> 5 m³/h dejan el sensor a {s(F2["local"]["sensor"])} K, el módem a {s(F2["local"]["modem"])} K y el aire de salida a {s(F2["dT"])} K, con la entrada junto al sensor.</li>
<li><strong>La temperatura que soporta la máquina ventilada no cambia: bares de 10 a 32 °C como especificación,</strong> con el límite real hacia {fl(bar_todo["fan2"])} °C. Ahora mandan el módem y el sensor; el lector, con 70 °C, ya no.</li>
<li><strong>Una avería de la ventilación deja de ser irreversible.</strong> Sigue habiendo unos {mins(T["fallo_t40"])} minutos antes de que el sensor salga de rango, y el programa tiene que dejar de vender; pero nada se pierde.</li>
<li><strong>Aparecen tres trabajos nuevos fuera del calor:</strong> el hueco del Sigma, que no cabe de pie en el frente de hoy; la fuente; y cómo para la Pi un cobro que ya no controla.</li>
<li><strong>Y una incógnita nueva: lo que gasta el Sigma.</strong> Se resuelve con el aparato en el banco y un medidor en sus 12 V.</li>
</ol>
<div class="caja">
<h3>Siguiente paso que propongo</h3>
<p>Comprar <strong>un</strong> Sigma para el banco, como ya propone el estudio de cobro. Con él en la mano se miden su consumo y su fondo, se prueba el cobro por pulsos y se sabe si arranca solo tras un corte. Con esos datos se lleva al CAD el hueco, la entrada de aire junto al sensor y la fuente, y se pide una carcasa de prototipo para el ensayo del apartado 14.</p>
</div>
''')

# =================================================================== ANEXO A
D0 = R["meta"]["desglose_nat"]
W(h1("A", "Anexo: parámetros del modelo"))
W(f'''
<table class="larga">
<thead><tr><th>Parámetro</th><th class="n">Caso base</th><th class="n">Rango en los 1 500 casos</th><th>Origen</th></tr></thead>
<tr><td>Potencia total sin ventiladores (con dos ventiladores, 0,7 W más)</td><td class="n">{c(A["P"], 1)} W</td><td class="n">15 – 27 W</td><td>Apartado 3; reparto: fuente y convertidor {c(D0["P_psu"], 2)}, pantalla {c(D0["P_scr"], 2)}, Pi, módem y sensor {c(D0["P_rest"], 2)} y Sigma {c(D0["P_sig"], 2)} W</td></tr>
<tr><td>Sigma: superficie del cuerpo dentro del cajón</td><td class="n">220 cm²</td><td class="n">160 – 280</td><td>{EST}: contorno del hueco por 32 mm de fondo, más la trasera</td></tr>
<tr><td>Sigma: resistencia entre su interior y cada cara</td><td class="n">0,03 m²K/W</td><td class="n">0,015 – 0,06</td><td>{EST}: 3 mm de plástico y el aire de dentro</td></tr>
<tr><td>Convección del aire interior a las paredes del cajón</td><td class="n">3,5 W/m²K</td><td class="n">2,5 – 5,0</td><td>{EST}: placa vertical de 0,23 m con 10–20 K de salto</td></tr>
<tr><td>Convección de las piezas al aire interior</td><td class="n">6,0 W/m²K</td><td class="n">4,5 – 8,0</td><td>{EST}: cuerpos de 5–10 cm</td></tr>
<tr><td>Superficie de las piezas que disipan (Pi, módem, sensor y cámara)</td><td class="n">0,031 m²</td><td class="n">fija</td><td>Medidas del CAD; aparte, pantalla 0,020 m² y caja de red 0,022 m²</td></tr>
<tr><td>Factor de visión de las piezas hacia las paredes</td><td class="n">0,7</td><td class="n">0,5 – 0,9</td><td>{EST}</td></tr>
<tr><td>Emisividad exterior (pintura en polvo y policarbonato)</td><td class="n">0,90</td><td class="n">0,85 – 0,95</td><td>Tablas de emisividad</td></tr>
<tr><td>Emisividad de la cara interior de la carcasa</td><td class="n">0,85</td><td class="n">0,60 – 0,92</td><td>{SUP}: la pintura entra en la carcasa abierta</td></tr>
<tr><td>Emisividad del cajón, sin pintar</td><td class="n">0,30</td><td class="n">0,20 – 0,45</td><td>Tablas: acero laminado 0,24; galvanizado 0,28</td></tr>
<tr><td>Emisividad del cajón, pintado</td><td class="n">0,90</td><td class="n">0,80 – 0,95</td><td>Tablas</td></tr>
<tr><td>Conducción en los huecos de aire (multiplicador)</td><td class="n">1,2</td><td class="n">1,0 – 1,6</td><td>{EST}: 1,0 es aire quieto</td></tr>
<tr><td>Convección exterior (multiplicador por el aire del bar)</td><td class="n">1,15</td><td class="n">1,0 – 1,5</td><td>{EST}</td></tr>
<tr><td>Conductancia hacia la pared</td><td class="n">0,35 W/K</td><td class="n">0,1 – 1,0</td><td>{CALC}: pladur, ladrillo y hormigón</td></tr>
<tr><td>Conductividad del acero y calidad térmica de las uniones por puntos</td><td class="n">50 W/m·K; 0,5</td><td class="n">45 – 55; 0,3 – 1,0</td><td>{GEN}; {EST}: 1 sería chapa continua</td></tr>
<tr><td>Contacto de la fuente con la trasera del cajón</td><td class="n">1,0 W/K</td><td class="n">0,3 – 3,0</td><td>{EST}: 81 cm² de contacto seco</td></tr>
<tr><td>Contacto de la tapa y de la tapa interior con la carcasa</td><td class="n">0,10 W/K</td><td class="n">0,03 – 0,30</td><td>{EST}</td></tr>
<tr><td>Rejillas: área de cada una y coeficiente de descarga</td><td class="n">2,54 cm²; 0,65</td><td class="n">0,55 – 0,75</td><td>CAD; {GEN}</td></tr>
<tr><td>Fugas de aire por arriba (holgura de la tapa interior)</td><td class="n">0,5 cm²</td><td class="n">0 – 2 cm²</td><td>{EST}</td></tr>
<tr><td>Reparto en altura: aire de arriba respecto a la media</td><td class="n">1,30</td><td class="n">1,15 – 1,45</td><td>{EST}; a la altura del sensor resulta 1,17</td></tr>
<tr><td>Caudal con dos ventiladores, y mejora de la convección interior con aire forzado</td><td class="n">5,2 m³/h; × 1,25</td><td class="n">3,5 – 6,5; fija</td><td>{CALC}, apartado 8.1; {EST}</td></tr>
<tr><td>Fracción del calentamiento de salida que ven el sensor y el módem</td><td class="n">0,30 y 0,70</td><td class="n">0,15 – 0,50 y 0,50 – 0,90</td><td>{EST}</td></tr>
</table>
''')

# =================================================================== ANEXO B
W(h1("B", "Anexo: cómo repetir el cálculo"))
W(f'''
<p>Todo el estudio sale de unos scripts de Python (NumPy y Matplotlib). Están en el repositorio, en <code>carcasa/diseno-A/estudio-termico/codigo/</code>.</p>
<table>
<tr><th>Archivo</th><th>Qué hace</th></tr>
<tr><td><code>termico.py</code></td><td>El modelo: propiedades del aire, correlaciones, la red de nodos, el estado estacionario y el transitorio. Todos los parámetros están en la clase <code>P</code>. Con <code>sigma=True</code> añade el terminal; con <code>sigma=False</code> es el modelo de la revisión 1</td></tr>
<tr><td><code>analisis_conf.py</code></td><td>Las cargas y las configuraciones: con el Sigma (sin ventilador, pintado, sellado y las tres con ventilador), las cuatro fuentes y la versión del Solo para comparar</td></tr>
<tr><td><code>analisis.py</code></td><td>Corre todos los casos: configuraciones, potencia, caudal, sensibilidad, los 1 500 casos al azar, márgenes, sol, funda, frío y transitorios. Escribe <code>resultados.json</code></td></tr>
<tr><td><code>calc.py</code></td><td>Las cuentas paso a paso que aparecen en los recuadros</td></tr>
<tr><td><code>fig_*.py</code>, <code>estilo.py</code></td><td>Las figuras</td></tr>
<tr><td><code>informe.py</code>, <code>estilo.css</code></td><td>Montan este documento con los números de <code>resultados.json</code></td></tr>
</table>
<p><strong>Para rehacerlo con datos medidos</strong> basta cambiar en <code>analisis_conf.py</code> el consumo del Sigma (<code>P_SIGMA</code>), las cargas en 5 V (<code>C5</code>), los rendimientos y el caudal (<code>Q_fan</code>), y en <code>termico.py</code> los coeficientes que el ensayo corrija. Después: <code>python3 analisis.py</code>, <code>python3 calc.py</code>, los <code>fig_*.py</code> y <code>python3 informe.py</code>.</p>
<p><strong>Si cambia la geometría</strong> (aberturas, huecos, espesores, posición del Sigma), las cotas están al principio de la clase <code>P</code>, con los mismos valores que en <code>carcasa/diseno-A/modelo/diseno.py</code>.</p>
<p><strong>La revisión 1, con el Solo,</strong> está en <code>historico-solo/</code>: su informe en PDF y la referencia al commit con su código y sus resultados.</p>
''')

# =================================================================== FUENTES
W('<h1>Fuentes</h1>')
W(f'''
<h2>Del proyecto</h2>
<ul class="fuentes">
<li>CAD del diseño A (04-11-2026): <code>carcasa/diseno-A/modelo/diseno.py</code>, <code>specs.py</code>, <code>geo.py</code> y <code>comp.py</code>; <code>carcasa/diseno-A/README.md</code>; vistas de <code>carcasa/diseno-A/FreeCAD/</code>.</li>
<li>Alternativas al SumUp Solo para el cobro (13-11-2026): <code>componentes/alternativas-cobro/</code> en la rama <code>claude/alternativas-cobro</code> (PR n.º 3), opción 3, myPOS Sigma.</li>
<li>Revisión de componentes eléctricos, Bloque 1 (13-11-2026): <code>componentes/REVISION-13-11-2026.md</code> y <code>componentes/cuentas.py</code>.</li>
<li><code>DECISIONES.md</code>, entradas del 27-10 al 13-11-2026.</li>
<li>Fichas de <code>componentes/</code>: Winsen ZE29A, módem Huawei E3372h, Raspberry Pi 3B+, Camera Module 3, pantalla GeeekPi, Mean Well LRS-50-5 y SumUp Solo.</li>
<li>Revisión 1 de este estudio, con el Solo: <code>historico-solo/</code>.</li>
</ul>
<h2>Del Sigma y de las fuentes, consultadas el 13-11-2026</h2>
<ul class="fuentes">
<li>myPOS, ficha del Sigma (12–48 V en continua; 146 × 101 × 57 mm; hueco de 108,7 × 86,4 mm; 490 g; de −20 a 70 °C; IP65 e IK08): <a href="https://www.mypos.com/en-gb/buy-card-machine/unattended-payment-solution">mypos.com/en-gb/buy-card-machine/unattended-payment-solution</a>; folleto: <a href="https://merkato.com/wp-content/uploads/2024/07/Sigma-Device-Brochure-EN.pdf">merkato.com, Sigma Device Brochure</a></li>
<li>myPOS Developers, comunicación por pulsos (patillas de alimentación, salidas de pulso y entradas): <a href="https://developers.mypos.com/in-person-payments/unattended-solutions/pulse-communication">developers.mypos.com/in-person-payments/unattended-solutions/pulse-communication</a></li>
<li>Nexgo UN20, hoja de producto (mismas medidas, hueco, alimentación y puertos que el Sigma; sensores de proximidad y de luz): <a href="https://www.nexgoglobal.com/static/upload/file/20240516/1715846950543668.pdf">nexgoglobal.com, UN20 versión 5.2</a>; reposo hasta que se acerca alguien: <a href="https://www.paytec.ch/en/products/unattended-payment-terminals/un20">paytec.ch/en/products/unattended-payment-terminals/un20</a></li>
<li>Tienda que cataloga el Sigma como «interior, 10–40 °C»: <a href="https://kiosk.novoparts.hu/en/spd/MyPOS_SIGMA/MyPOS-Sigma-unattenden-POS-terminal-with-MDB-inter">kiosk.novoparts.hu</a></li>
<li>PAX IM30, consumo de un terminal de la misma clase (menos de 650 mA de pico a 12 V): <a href="https://computop.com/en/point-of-sale/im30-pos-terminal/">computop.com/en/point-of-sale/im30-pos-terminal</a></li>
<li>Mean Well, catálogo de la serie LRS (LRS-50-5: 83 %; LRS-50-12: 86 %; de −30 a 70 °C): <a href="https://www.meanwell.com/catalog/product/files/basic-html/page4.html">meanwell.com/catalog, página 4</a></li>
<li>Mean Well RD-50A (5 V y 6 A, 12 V y 2 A; 79 %; 99 × 97 × 36 mm): <a href="https://www.meanwellaustralia.com.au/products/RD-50">meanwellaustralia.com.au/products/RD-50</a>; carga mínima de 0,3 A por salida: <a href="https://www.communica.co.za/products/rd-50a">communica.co.za/products/rd-50a</a></li>
<li>Mean Well RSD-30G-5 (de 9–36 V a 5 V y 6 A; 84–85 %; sin reducción de −40 a 55 °C): <a href="https://jp.farnell.com/en-JP/mean-well/rsd-30g-5/dc-dc-converter-5v-6a/dp/2816113">farnell.com, RSD-30G-5</a> y <a href="https://cpc.farnell.com/mean-well/rsd-30g-5/dc-dc-converter-5v-6a/dp/PW05417">cpc.farnell.com, RSD-30G-5</a></li>
</ul>
<h2>De fabricantes y normas, las de la revisión 1</h2>
<ul class="fuentes">
<li>SumUp, información de seguridad del Solo (rango de trabajo de 0 a 40 °C): <a href="https://www.manualslib.com/manual/3046632/Sumup-Solo.html?page=12">manualslib.com/manual/3046632/Sumup-Solo.html</a>; «Avoid blocked readers» (bloqueo permanente): <a href="https://help.sumup.com/en-IE/articles/1fH1DQy2SCfsXvrdb76MS0">help.sumup.com/en-IE/articles/1fH1DQy2SCfsXvrdb76MS0</a></li>
<li>Noctua, especificaciones del NF-A4x10 5V, NF-A4x20 5V y NF-A6x25 5V: <a href="https://noctua.at/en/nf-a4x10-5v/specification">noctua.at/en/nf-a4x10-5v/specification</a>, <a href="https://noctua.at/en/nf-a4x20-5v/specification">noctua.at/en/nf-a4x20-5v/specification</a>, <a href="https://noctua.at/en/nf-a6x25-5v/specification">noctua.at/en/nf-a6x25-5v/specification</a></li>
<li>Raspberry Pi, «Thermal testing Raspberry Pi 4» (consumo de la 3B+ en reposo y en carga): <a href="https://www.raspberrypi.com/blog/thermal-testing-raspberry-pi-4/">raspberrypi.com/blog/thermal-testing-raspberry-pi-4</a></li>
<li>Raspberry Pi, documentación de gestión térmica (límite blando de 60 °C y <code>temp_soft_limit</code>): <a href="https://github.com/raspberrypi/documentation/pull/1348/files">github.com/raspberrypi/documentation/pull/1348</a>; valor máximo de 70 °C: <a href="https://www.brainboxes.com/?p=2381">brainboxes.com/?p=2381</a></li>
<li>Rittal, catálogo técnico de climatización de armarios (k = 5,5 W/m²K para chapa de acero en interior): <a href="https://www.rittal.com/imf/none/3_8419/3312800_Documentaci_oacute_n_t_eacute_cnica_EN">rittal.com/imf/none/3_8419</a>; fórmula del área eficaz para montaje contra pared: <a href="https://storage.electrika.com/flips/0700-univ-encl-15/files/assets/basic-html/page-521.html">storage.electrika.com/flips/0700-univ-encl-15</a></li>
<li>IEC TR 60890:2022, método de cálculo del calentamiento del aire en envolventes: <a href="https://standards.iteh.ai/catalog/standards/iec/7a954d7c-2b57-4c93-8b3b-f930bc8b227c/iec-tr-60890-2022">standards.iteh.ai (IEC TR 60890:2022)</a></li>
<li>Plancha de policarbonato extruido, datos técnicos (0,2 W/m·K; 115 °C en uso continuo): <a href="https://cdn.shopify.com/s/files/1/0468/4742/6721/files/EN_IMPEX_ProductGuide_08-2022.pdf">Impex, guía de producto 08-2022</a></li>
<li>3M, cinta VHB 4949 (93 °C a largo plazo, 149 °C a corto): <a href="https://www.3m.com/3M/en_US/p/d/b40072029/">3m.com/3M/en_US/p/d/b40072029</a></li>
<li>Battery University, BU-808 (capacidad tras un año según temperatura y carga): <a href="https://batteryuniversity.com/article/how-to-prolong-lithium-based-batteries">batteryuniversity.com/article/how-to-prolong-lithium-based-batteries</a></li>
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
doc = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Estudio térmico del alcoholímetro · diseño A · revisión 2 (myPOS Sigma)</title>
<link rel="stylesheet" href="estilo.css"></head><body>{html}</body></html>'''
open("informe.html", "w").write(doc)
SALIDA = "../Estudio_termico_alcoholimetro.pdf"
subprocess.run(["google-chrome", "--headless=new", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={SALIDA}", "informe.html"],
               check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
if "--html" not in sys.argv:
    os.remove("informe.html")
from pypdf import PdfReader
print("páginas:", len(PdfReader(SALIDA).pages), "· figuras:", FIG[0], "·", round(os.path.getsize(SALIDA) / 1e6, 2), "MB")
