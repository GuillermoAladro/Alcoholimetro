"""
Conexiones del diseño A (cableado completo) y su verificación, para el artefacto «Conexiones sobre la mesa».

Fuentes: LEEME del diseño A (diseno-cajon-A.md), MONTAJE-GENERAL (W1…W30), las fichas de componentes/ y el CAD
(specs.py, longitudes de los cables). Donde el diseño A y MONTAJE-GENERAL no coinciden, la conexión se dibuja como el
diseño A (es lo que hay en el CAD) y la verificación lo señala.

Salida: conexiones.json con
  componentes: pieza, modelo 3D, colocación sobre la mesa
  conexiones: extremos (pieza·ancla), terminal en cada extremo, cable, número W, estado de la verificación
  comprobaciones: resultados globales (tensiones, corrientes, fusibles, masas, longitudes)
"""
import json, math, sys
sys.path.insert(0, "/home/claude/nuevo")

SP = "/tmp/claude-0/-home-claude/659a7a58-c69d-5ef4-bd94-d0aa972c769f/scratchpad/"

# ------------------------------------------------------------------ colocación sobre la mesa (marco natural de cada modelo → mesa)
def rz(deg):
    a = math.radians(deg); c, s = round(math.cos(a), 6), round(math.sin(a), 6)
    return dict(ex=[c, s, 0], ey=[-s, c, 0], ez=[0, 0, 1])

def pose(at, base=None, **kw):
    d = dict(base or rz(0)); d["at"] = list(at); d.update(kw); return d

# bases especiales
DE_LADO_X = dict(ex=[0, 1, 0], ey=[0, 0, 1], ez=[1, 0, 0])        # C14 de lado: cara hacia +X, cajón del fusible arriba
DE_PIE = lambda inc: dict(ex=[1, 0, 0], ey=[0, round(math.cos(math.radians(inc)), 6), round(math.sin(math.radians(inc)), 6)],
                          ez=[0, -round(math.sin(math.radians(inc)), 6), round(math.cos(math.radians(inc)), 6)])
CAM_PIE = dict(ex=[-1, 0, 0], ey=[0, 0, -1], ez=[0, -1, 0])       # cámara de pie, boca abajo, objetivo hacia el que mira
T_TUMBADA = dict(ex=[1, 0, 0], ey=[0, 0, 1], ez=[0, -1, 0])       # racor en T tumbado, derivación hacia −Y
T_TUMBADA_DER = dict(ex=[-1, 0, 0], ey=[0, 0, 1], ez=[0, 1, 0])   # (no se usa)
RED_X = dict(ex=[-1, 0, 0], ey=[0, -1, 0], ez=[0, 0, 1])          # giro de 180°

C = {
    # ---- red y tierra
    "schuko":   dict(n="Cordón Schuko → C13 (2 m)", ref="E22", modelo="clavija_schuko", pose=pose([330, -170, 0], dict(ex=[0, 1, 0], ey=[-1, 0, 0], ez=[0, 0, 1])), grupo="230 V y tierra"),
    "c14":      dict(n="Toma C14 con portafusibles (T2,5A), sin interruptor", ref="E07 + M01", modelo="toma_c14", pose=pose([250, -20, 0], DE_LADO_X), grupo="230 V y tierra"),
    "pe_cajon": dict(n="Espárrago de tierra M4 × 20 del cajón", ref="H07", modelo="chapa_tierra", args=[20, "CAJÓN"], pose=pose([250, 95, 0]), grupo="230 V y tierra"),
    "pe_carc":  dict(n="Espárrago de tierra M4 × 10 de la carcasa", ref="H07", modelo="chapa_tierra", args=[10, "CARCASA"], pose=pose([335, 115, 0]), grupo="230 V y tierra"),
    "psu":      dict(n="Fuente Mean Well LRS-50-5 (ajustada a 5,20 V)", ref="E06", modelo="fuente", pose=pose([175, 10, 0], rz(90)), grupo="230 V y tierra"),
    # ---- reparto de 5 V
    "wago_p":   dict(n="WAGO 221-415 · +5 V", ref="E08", modelo="wago_415", pose=pose([80, -40, 0], RED_X), grupo="Reparto de 5 V"),
    "wago_n":   dict(n="WAGO 221-415 · GND", ref="E08", modelo="wago_415", pose=pose([40, -40, 0], RED_X), grupo="Reparto de 5 V"),
    "fus_pi":   dict(n="Portafusibles MINI · Pi 3 A", ref="E10 + E20", modelo="portafusible", args=[{"amperios": 3}], pose=pose([-70, 30, 0]), grupo="Reparto de 5 V"),
    "fus_solo": dict(n="Portafusibles MINI · Solo 3 A", ref="E10 + E20", modelo="portafusible", args=[{"amperios": 3}], pose=pose([-70, 0, 0]), grupo="Reparto de 5 V"),
    "fus_pant": dict(n="Portafusibles MINI · pantalla 3 A", ref="E10 + E20", modelo="portafusible", args=[{"amperios": 3}], pose=pose([-70, -30, 0]), grupo="Reparto de 5 V"),
    "fus_sens": dict(n="Portafusibles MINI · sensor 2 A", ref="E10 + E20", modelo="portafusible", args=[{"amperios": 2}], pose=pose([-70, 60, 0]), grupo="Reparto de 5 V"),
    "lat_pi":   dict(n="Latiguillo micro-USB: se abre en rojo y negro", ref="E18", modelo=None, nodo=[-190, -20, 1.7], grupo="Reparto de 5 V"),
    "emp_pi":   dict(n="WAGO 221-412 · empalme 5 V de la Pi", ref="E08 (surtido)", modelo="wago_412", pose=pose([-150, 10, 0]), grupo="Reparto de 5 V"),
    "emp_sens": dict(n="WAGO 221-412 · empalme 5 V del sensor", ref="E08 (surtido)", modelo="wago_412", pose=pose([-110, 120, 0]), grupo="Reparto de 5 V"),
    "usb_solo": dict(n="Borne USB-A a tornillo · Solo", ref="E09", modelo="borne_usb", pose=pose([-150, -70, 0]), grupo="Reparto de 5 V"),
    "usb_pant": dict(n="Borne USB-A a tornillo · pantalla", ref="E09", modelo="borne_usb", pose=pose([-150, -125, 0]), grupo="Reparto de 5 V"),
    # ---- cargas y señales
    "pi":       dict(n="Raspberry Pi 3 Model B+ (con microSD de 32 GB)", ref="E04 + E21", modelo="raspberry", pose=pose([-320, 20, 0]), grupo="Pi y periféricos"),
    "wifi":     dict(n="Adaptador Wi-Fi USB AR9271", ref="E05", modelo="wifi_ar9271", pose=None, grupo="Pi y periféricos"),
    "antena":   dict(n="Alargo RP-SMA 30 cm con pasamuros y antena", ref="E12", modelo="chapa_antena", pose=pose([-115, 200, 0], RED_X), grupo="Pi y periféricos"),
    "cam":      dict(n="Camera Module 3", ref="E03", modelo="camara", pose=pose([-365, 160, 0], CAM_PIE), grupo="Pi y periféricos"),
    "pant":     dict(n="Pantalla GeeekPi EP-0170 7\" (1024 × 600)", ref="E01", modelo="pantalla", pose=pose([-470, -150, 0], DE_PIE(72)), grupo="Pi y periféricos"),
    "solo":     dict(n="SumUp Solo", ref="E02", modelo="solo", pose=pose([-300, -200, 0]), grupo="Pi y periféricos"),
    "ze":       dict(n="Sensor de alcohol Winsen ZE29A", ref="E11", modelo="ze29a", pose=pose([-140, 250, 0], RED_X), grupo="Sensor y soplido"),
    # ---- aire del soplido
    "boq":      dict(n="Boquilla del panel (pasacables + pajita)", ref="H10 + panel", modelo="boquilla_panel", pose=pose([-300, 330, 0], dict(ex=[0, -1, 0], ey=[1, 0, 0], ez=[0, 0, 1])), grupo="Sensor y soplido"),
    "t_pre":    dict(n="Racor en T · toma de presión", ref="E14", modelo="te_6mm", pose=pose([-230, 330, 0], T_TUMBADA), grupo="Sensor y soplido"),
    "red_a":    dict(n="Reductor de latón 6 → 4 (barrera)", ref="E15", modelo="reductor_6_4", pose=pose([-206, 330, 0]), grupo="Sensor y soplido"),
    "red_b":    dict(n="Reductor de latón 4 → 6 (barrera)", ref="E15", modelo="reductor_6_4", pose=pose([-110, 330, 0], RED_X), grupo="Sensor y soplido"),
    "t_alc":    dict(n="Racor en T · toma de alcohol", ref="E14", modelo="te_6mm", pose=pose([-80, 330, 0], T_TUMBADA), grupo="Sensor y soplido"),
    "esc":      dict(n="Escape del soplido (lateral izquierdo)", ref="panel", modelo="escape_panel", pose=pose([-10, 330, 0], dict(ex=[0, 1, 0], ey=[-1, 0, 0], ez=[0, 0, 1])), grupo="Sensor y soplido"),
}
# el AR9271 va enchufado en el USB de abajo de la Pi: lo coloca el visor a partir del ancla usb_bajo

# ------------------------------------------------------------------ qué es cada ancla (para verificar)
# clase: red (L/N con o sin fusible), pe, +5, 0v, tx, rx, usb_vbus…; tipo de conector y sexo
A = {
    ("c14", "F"): dict(clase="red_fus", con="lengüeta 4,8", tension=230), ("c14", "N"): dict(clase="red", con="lengüeta 4,8", tension=230),
    ("c14", "PE"): dict(clase="pe", con="lengüeta 4,8"), ("c14", "C13"): dict(clase="red_entrada", con="C14 macho"),
    ("psu", "L"): dict(clase="red_L", con="borne de tornillo"), ("psu", "N"): dict(clase="red_N", con="borne de tornillo"),
    ("psu", "FG"): dict(clase="pe", con="borne de tornillo"), ("psu", "-V"): dict(clase="0v", con="borne de tornillo"), ("psu", "+V"): dict(clase="+5", con="borne de tornillo"),
    ("pe_cajon", "o1"): dict(clase="pe", con="espárrago M4"), ("pe_cajon", "o2"): dict(clase="pe", con="espárrago M4"), ("pe_cajon", "o3"): dict(clase="pe", con="espárrago M4"),
    ("pe_carc", "o1"): dict(clase="pe", con="espárrago M4"),
    ("pi", "pwr"): dict(clase="usb_pwr", con="micro-USB B hembra"), ("pi", "hdmi"): dict(clase="hdmi", con="HDMI A hembra"),
    ("pi", "csi"): dict(clase="csi", con="FFC 15 vías"), ("pi", "gpio8"): dict(clase="tx", con="pin 0,64"), ("pi", "gpio10"): dict(clase="rx", con="pin 0,64"),
    ("pi", "usb_bajo"): dict(clase="usb_host", con="USB-A hembra"),
    ("ze", "j1_1"): dict(clase="+5", con="XH"), ("ze", "j1_2"): dict(clase="0v", con="XH"), ("ze", "j1_3"): dict(clase="tx", con="XH"), ("ze", "j1_4"): dict(clase="rx", con="XH"),
    ("pant", "hdmi"): dict(clase="hdmi", con="HDMI A hembra"), ("pant", "usbc"): dict(clase="usb_pwr", con="USB-C hembra"),
    ("solo", "usbc"): dict(clase="usb_pwr", con="USB-C hembra"), ("cam", "fpc"): dict(clase="csi", con="FFC 15 vías"),
    ("wifi", "rpsma"): dict(clase="rf", con="RP-SMA hembra"), ("antena", "coax"): dict(clase="rf", con="RP-SMA (alargo)"),
}
for k in range(1, 6):
    A[("wago_p", f"p{k}")] = dict(clase="+5", con="WAGO 221")
    A[("wago_n", f"p{k}")] = dict(clase="0v", con="WAGO 221")
for f in ("fus_pi", "fus_solo", "fus_pant", "fus_sens"):
    A[(f, "a")] = dict(clase="+5", con="hilo 16 AWG"); A[(f, "b")] = dict(clase="+5", con="hilo 16 AWG")
for e in ("emp_pi", "emp_sens"):
    A[(e, "p1")] = dict(clase="+5", con="WAGO 221"); A[(e, "p2")] = dict(clase="+5", con="WAGO 221")
for u in ("usb_solo", "usb_pant"):
    A[(u, "+")] = dict(clase="+5", con="tornillo"); A[(u, "-")] = dict(clase="0v", con="tornillo")
    A[(u, "S")] = dict(clase="malla", con="tornillo"); A[(u, "D+")] = dict(clase="usb_d", con="tornillo"); A[(u, "D-")] = dict(clase="usb_d", con="tornillo")
    A[(u, "usb")] = dict(clase="usb_pwr_out", con="USB-A hembra")

# ------------------------------------------------------------------ conexiones
# cada una: id, W, de (pieza, ancla, terminal), a (pieza, ancla, terminal), cable, color, radio, estilo, por (puntos de paso sobre la mesa)
VA, ROJO, NEGRO, MARRON, AZUL, BLANCO, AMARILLO = "#2c9a3e", "#b0231c", "#141414", "#5b3a1f", "#1f56b5", "#ecebe6", "#e8c21c"
K = []
def con(id_, w, de, a, cable, color, radio, estilo="pvc", por=(), nota="", grupo="", alto=0.0, holgura=None):
    K.append(dict(id=id_, w=w, de=list(de), a=list(a), cable=cable, color=color, radio=radio, estilo=estilo, por=[list(p) for p in por], nota=nota, grupo=grupo, alto=alto, holgura=holgura))

G230, GPE, G5, GSEN, GDAT, GAIRE = "230 V", "Tierra", "5 V", "Sensor (UART y 5 V)", "Datos y USB", "Aire del soplido"
con("W1", "W1", ("schuko", "fin", "ninguno"), ("c14", "C13", "c13"), "Cordón Schuko → C13, 3 × 1 mm², 2 m", NEGRO, 3.2, "pvc", [(470, -150), (420, -60)], grupo=G230,
    nota="Lado del bar: toma de pared. Lado de la máquina: el C13 entra por la ventana del lateral derecho")
con("W2", "W2", ("c14", "F", "faston"), ("psu", "L", "puntera"), "H05VV-F, hilo marrón 1,5 mm²", MARRON, 1.5, por=[(192, -30), (158, -14)], grupo=G230)
con("W3", "W3", ("c14", "N", "faston"), ("psu", "N", "puntera"), "H05VV-F, hilo azul 1,5 mm²", AZUL, 1.5, por=[(186, -16), (148, -8)], grupo=G230)
con("W6", "W6", ("c14", "PE", "faston"), ("pe_cajon", "o1", "ojal"), "H05VV-F, hilo verde-amarillo 1,5 mm²", VA, 1.5, "verdeamarillo", por=[(205, 20), (228, 72)], grupo=GPE)
con("W7", "W7", ("pe_cajon", "o2", "ojal"), ("psu", "FG", "puntera"), "H05VV-F, hilo verde-amarillo 1,5 mm²", VA, 1.5, "verdeamarillo", por=[(215, 62), (192, 0), (140, -10)], grupo=GPE)
con("W10", "W10", ("pe_cajon", "o3", "ojal"), ("pe_carc", "o1", "ojal"), "Puente verde-amarillo 1,5 mm² con faston (se suelta para sacar el cajón)", VA, 1.5, "verdeamarillo", por=[(292, 112)], grupo=GPE)
con("W11", "W11", ("psu", "+V", "puntera"), ("wago_p", "p1", "directo"), "Cable 2 × 0,75 mm², rojo", ROJO, 1.2, por=[(116, -12), (86, -20)], grupo=G5)
con("W12", "W12", ("psu", "-V", "puntera"), ("wago_n", "p1", "directo"), "Cable 2 × 0,75 mm², negro", NEGRO, 1.2, por=[(128, -16), (62, -24), (40, -26)], grupo=G5)
ramas = [("fus_pi", "p2", "W13", "Pi"), ("fus_solo", "p3", "W14", "Solo"), ("fus_pant", "p4", "W16", "pantalla"), ("fus_sens", "p5", "W18", "sensor")]
for f, p, w, nom in ramas:
    yb = {"fus_pi": 37, "fus_solo": 7, "fus_pant": -23, "fus_sens": 67}[f]
    xp = {"p2": 71.0, "p3": 65.1, "p4": 59.1, "p5": 53.1}[p]
    con(f"{w}a" if w != "W13" else "W13a", w, ("wago_p", p, "directo"), (f, "b", "pigtail"), f"Hilo rojo 16 AWG del portafusibles ({nom})", ROJO, 1.45,
        por=[(xp, -22 + (71 - xp) * 0.6), (0, yb - 4), (-14, yb)], grupo=G5)
con("W13b", "W13", ("fus_pi", "a", "pigtail"), ("emp_pi", "p1", "directo"), "Hilo rojo 16 AWG del portafusibles (Pi)", ROJO, 1.45, por=[(-112, 30), (-146.7, -6)], grupo=G5)
con("W13c", "W13", ("pi", "pwr", "microusb"), ("lat_pi", "x", "nodo"), "Latiguillo micro-USB 22 AWG (30 cm): rojo y negro en una funda", NEGRO, 1.7, por=[(-292, -12)], grupo=G5,
    nota="Se abre en sus dos hilos cerca del empalme")
con("W13d", "W13", ("lat_pi", "x", "nodo"), ("emp_pi", "p2", "directo"), "Latiguillo: hilo rojo (VBUS)", ROJO, 0.8, por=[(-150, -6)], grupo=G5)
con("W13e", "W13", ("lat_pi", "x", "nodo"), ("wago_n", "p2", "directo"), "Latiguillo: hilo negro (GND)", NEGRO, 0.8, por=[(-120, -16), (31, -24)], grupo=G5)
con("W14b", "W14", ("fus_solo", "a", "pigtail"), ("usb_solo", "+", "directo"), "Hilo rojo 16 AWG del portafusibles (Solo)", ROJO, 1.45, por=[(-86, 2), (-88, -63)], grupo=G5)
con("W14c", "W14", ("wago_n", "p3", "directo"), ("usb_solo", "-", "directo"), "Cable 2 × 0,75 mm², negro", NEGRO, 1.2, por=[(25, -26), (-40, -42), (-88, -52)], grupo=G5)
con("W16b", "W16", ("fus_pant", "a", "pigtail"), ("usb_pant", "+", "directo"), "Hilo rojo 16 AWG del portafusibles (pantalla)", ROJO, 1.45, por=[(-86, -34), (-88, -118)], grupo=G5)
con("W16c", "W16", ("wago_n", "p4", "directo"), ("usb_pant", "-", "directo"), "Cable 2 × 0,75 mm², negro", NEGRO, 1.2, por=[(19, -30), (-40, -80), (-88, -107)], grupo=G5)
con("W18b", "W18", ("fus_sens", "a", "pigtail"), ("emp_sens", "p1", "directo"), "Hilo rojo 16 AWG del portafusibles (sensor)", ROJO, 1.45, por=[(-92, 80), (-106.7, 104)], grupo=G5)
con("W18c", "W18", ("emp_sens", "p2", "directo"), ("ze", "j1_1", "xh"), "Hilo del cable XH 22 AWG: pin 1 (5 V)", ROJO, 0.75, por=[(-98, 140), (-180, 205), (-242, 226)], grupo=GSEN)
con("W18d", "W18", ("wago_n", "p5", "directo"), ("ze", "j1_2", "xh"), "Hilo del cable XH 22 AWG: pin 2 (GND)", NEGRO, 0.75, por=[(13, -26), (-20, 100), (-195, 208), (-243, 232)], grupo=GSEN,
    holgura="El hilo del XH mide 150 mm: en la máquina el recorrido es de unos 110–130 mm (CAD), justo")
con("W19", "W19", ("pi", "gpio8", "dupont"), ("ze", "j1_4", "xh"), "Hilo del cable XH 22 AWG: pin 4 (RX del sensor) con Dupont hembra en el pin 8", AMARILLO, 0.75, por=[(-292, 150), (-246, 238)], grupo=GSEN)
con("W20", "W20", ("ze", "j1_3", "xh"), ("pi", "gpio10", "dupont"), "Hilo del cable XH 22 AWG: pin 3 (TX del sensor) con Dupont hembra en el pin 10", BLANCO, 0.75, por=[(-247, 236), (-286, 152)], grupo=GSEN)
con("W15", "W15", ("usb_solo", "usb", "usbA"), ("solo", "usbc", "usbc90"), "Cable USB-A → USB-C acodado, 30 cm (trenzado)", "#6b7078", 1.9, "trenzado", por=[(-200, -62), (-246, -150)], grupo=GDAT)
con("W17", "W17", ("usb_pant", "usb", "usbA"), ("pant", "usbc", "usbc90"), "Cable USB-A → USB-C de la pantalla", "#6b7078", 1.9, "trenzado", por=[(-200, -150), (-380, -232), (-505, -175)], grupo=GDAT)
con("W23", "W23", ("pi", "hdmi", "hdmiRecta"), ("pant", "hdmi", "hdmi90"), "Cable HDMI 30 cm, un extremo acodado 90°", "#17181a", 2.25, "hdmi", por=[(-300, -55), (-490, -105)], grupo=GDAT)
con("W24", "W24", ("cam", "fpc", "ffc"), ("pi", "csi", "ffc"), "Cinta FFC de 15 vías, paso 1 mm, 200 mm (la que trae la cámara)", "#eceae2", 8.0, "ffc", por=[(-345, 110), (-310, 70)], grupo=GDAT, alto=34.0)
con("W25", "W25", ("pi", "usb_bajo", "enchufado"), ("wifi", "usb", "enchufado"), "Enchufado directo en el USB de abajo", "#000000", 0, "ninguno", grupo=GDAT)
con("W26", "W26", ("wifi", "rpsma", "rpsma"), ("antena", "coax", "directo"), "Alargo RG316 30 cm (RP-SMA macho → pasamuros)", "#9b6a43", 1.3, "coax", por=[(-128, 95)], grupo=GDAT)
# aire
con("W28a", "W28", ("boq", "tubo", "tubo"), ("t_pre", "a", "tubo"), "Tubo de silicona de 6 mm", "#f3f5f2", 4.0, "silicona", por=[], grupo=GAIRE)
con("W28b", "W28", ("t_pre", "b", "tubo"), ("red_a", "r6", "tubo"), "Tubo de silicona de 6 mm (tramo corto)", "#f3f5f2", 4.0, "silicona", grupo=GAIRE)
con("W28c", "W28", ("red_a", "r4", "tubo"), ("red_b", "r4", "tubo"), "Tubo de silicona de 4 mm (falta en la lista)", "#f3f5f2", 3.0, "silicona", grupo=GAIRE)
con("W28d", "W28", ("red_b", "r6", "tubo"), ("t_alc", "a", "tubo"), "Tubo de silicona de 6 mm (tramo corto)", "#f3f5f2", 4.0, "silicona", grupo=GAIRE)
con("W28e", "W28", ("t_alc", "b", "tubo"), ("esc", "tubo", "tubo"), "Tubo de silicona de 6 mm (escape)", "#f3f5f2", 4.0, "silicona", grupo=GAIRE)
con("W28f", "W28", ("t_pre", "c", "tubo"), ("ze", "presion", "tubo_fino"), "Tubo de 2 × 4 mm a la boquilla de presión (y reducción 6 → 2,5: faltan en la lista)", "#f3f5f2", 2.0, "silicona", por=[(-212, 285)], grupo=GAIRE, alto=10)
con("W28g", "W28", ("t_alc", "c", "tubo"), ("ze", "alcohol", "tubo_fino"), "Tubo de 2 × 4 mm a la boquilla de muestra (y reducción 6 → 2,5: faltan en la lista)", "#f3f5f2", 2.0, "silicona", por=[(-90, 270), (-112, 238)], grupo=GAIRE)

# ------------------------------------------------------------------ verificación
OK, AV, ERR = "ok", "aviso", "error"
ver = {c["id"]: [] for c in K}
def nota(cid, estado, texto, fuente=""):
    ver[cid].append(dict(estado=estado, texto=texto, fuente=fuente))

PAR = {"red_fus": {"red_L", "red_N"}, "red": {"red_L", "red_N"}, "pe": {"pe"}, "+5": {"+5"}, "0v": {"0v"}, "tx": {"rx"}, "rx": {"tx"},
       "hdmi": {"hdmi"}, "csi": {"csi"}, "usb_pwr": {"usb_pwr_out"}, "usb_pwr_out": {"usb_pwr"}, "rf": {"rf"}, "usb_host": {"usb_dev"}}
def clase(p, a):
    return A.get((p, a), {}).get("clase")

for c in K:
    a, b = tuple(c["de"][:2]), tuple(c["a"][:2])
    ca, cb = clase(*a), clase(*b)
    if c["grupo"] == GAIRE or c["estilo"] == "ninguno" or ca is None or cb is None:
        continue
    if cb in PAR.get(ca, set()) or ca in PAR.get(cb, set()):
        if ca in ("tx", "rx"):
            nota(c["id"], OK, "TX va a RX: la UART está cruzada como debe. Niveles de 3,3 V en los dos lados (manual del ZE29A: TTL 3,3 V), sin conversor.", "Manual ZE29A V1.1; MONTAJE W19–W20")
        elif ca == "pe":
            nota(c["id"], OK, "Tierra con tierra.", "MONTAJE W6–W10")
        elif ca in ("+5", "0v"):
            nota(c["id"], OK, f"Mismo potencial ({'+5 V' if ca == '+5' else 'GND'}) en los dos extremos.")
        elif ca.startswith("red"):
            nota(c["id"], OK, "Fase/neutro de la toma al borne de entrada de la fuente (AC/L o AC/N).", "Ficha LRS-50: bornes 1 AC/L, 2 AC/N")
        else:
            nota(c["id"], OK, "Conectores compatibles.")
    else:
        nota(c["id"], ERR, f"Une clases distintas: {ca} ↔ {cb}.")

# comprobaciones concretas, con su fuente
nota("W1", OK, "C13 hembra del cordón en la C14 macho de la toma.", "Anuncio B00AOAJAUC")
nota("W1", AV, "El Schuko entra de las dos maneras: el fusible de la C14 puede quedar en la fase o en el neutro. Las auditorías piden una entrada con portafusibles de dos polos documentada.", "DECISIONES 25-10; auditorías 6.1-S F02–F03, 6-A A6A-02")
nota("W1", AV, "Sin interruptor: la máquina se apaga desenchufando. El enchufe de la pared tiene que quedar a mano.", "DECISIONES 25-10")
nota("W2", AV, "Qué lengüeta lleva el fusible no está medido: se comprueba con el polímetro antes de cablear (apartado 4, punto 1).", "MONTAJE §4.1")
for w in ("W2", "W3"):
    nota(w, OK, "Faston hembra aislado de 4,8 mm en lengüeta de 4,8 mm (la tienda da 4,8). El espesor (0,5 o 0,8) se mide.", "Ficha kit faston; tienda Cablepelado")
    nota(w, OK, "Hilo de 1,5 mm² con puntera en el borne de la fuente; 230 V protegidos por el T2,5A.", "LEEME diseño A §6")
nota("W6", OK, "Tierra de la C14 al espárrago del cajón con ojal M4 y arandela dentada; sin fusible ni interruptor en la tierra.", "MONTAJE W6")
nota("W7", OK, "El borne FG de la fuente queda unido a la chapa.", "MONTAJE W7")
nota("W10", AV, "El puente con faston es la única unión entre la chapa del cajón y la carcasa: hay que comprobar < 0,1 Ω y que el faston no se suelta solo.", "LEEME diseño A §6 (tierra)")
nota("W11", AV, "El troncal no lleva fusible en el diseño A. La fuente solo se protege a sí misma (hipo a 11–15 A): un corto en el troncal de 0,75 mm² no lo corta nadie. MONTAJE W11 y las auditorías piden un F 5 A pegado a la fuente.", "MONTAJE W11; auditorías")
nota("W11", AV, "Ajuste de la fuente: el diseño A dice 5,20 V; MONTAJE corrige a 5,10 V (como mucho 5,12): con 5,20 V la envolvente de la hoja de datos llega a ~5,32 V y pasa los 5,3 V del ZE29A y los 5,25 V de USB.", "MONTAJE W11; hoja LRS-50")
nota("W12", OK, "−V de la fuente al polo 1 de la WAGO GND.", "Ficha LRS-50: borne 4 −V")
nota("W12", AV, "El −V queda flotante respecto a tierra salvo por la malla del coaxial si el pasamuros RP-SMA toca la chapa: o se aísla el pasamuros o se hace la unión única W12b.", "MONTAJE W12b y W26")
nota("W13a", OK, "Polo 2 de la WAGO +5 V a la entrada del portafusibles de 3 A de la Pi.")
nota("W13d", AV, "La Pi cuelga del troncal (diseño A). Con 5,20 V en la fuente y las resistencias de MONTAJE (troncal ≈ 0,03 Ω, rama de la Pi ≈ 0,16 Ω): unos 4,85 V con el consumo normal del diseño A (3,6 A en total, 1,5 A la Pi) y 4,63 V en el pico (5,5 A y 2,5 A), justo en el aviso de subtensión de la Pi (4,63 V ±5 %). MONTAJE W13 lleva la Pi directa a los bornes de la fuente con su fusible.", "MONTAJE W13 (cálculo de caídas)")
nota("W13c", AV, "El anuncio del latiguillo no dice qué hilo es VBUS: se mide antes (rojo → VBUS, pin 1).", "MONTAJE W13")
nota("W14c", OK, "GND al tornillo «−» del borne; S (malla) también a «−» y D+ con D− puenteados en el borne (cargador BC 1.2).", "MONTAJE W14")
nota("W14b", AV, "Fusible de 3 A delante de un borne USB-A cuya corriente no consta (los USB-A de placa dan 1–1,5 A): el fusible no protege el borne. Mejor 2 A, como en MONTAJE.", "Ficha borne USB-A; MONTAJE W14")
nota("W16b", AV, "Igual que el del Solo: fusible de 3 A y borne sin corriente nominal. La pantalla gasta 1 A: 2 A basta.", "MONTAJE W16")
nota("W16c", OK, "GND al tornillo «−» del borne de la pantalla.")
nota("W18b", OK, "Fusible de 2 A para el ZE29A (< 500 mA según el manual).", "Manual ZE29A")
nota("W18c", AV, "El pin 1 del J1 es el extremo «5V» de la serigrafía (fotos del anuncio). El tipo y el paso del J1 (¿XH de 2,5 mm?) no están medidos: se miden con calibre.", "MONTAJE W18 y §4.9")
nota("W18c", AV, "Los colores del cable XH (amarillo, blanco, rojo y negro) no tienen posición fija en el anuncio: se cablea por posición, no por color.", "MONTAJE W18")
nota("W18d", AV, "Hilo del XH de 150 mm: en el CAD el recorrido hasta la WAGO GND mide unos 125 mm. Llega, pero sin holgura.", "CAD specs.py")
nota("W19", AV, "Desactivar la consola serie de la Pi (raspi-config) o el kernel escribe en el sensor. Apagado parcial: una resistencia de 1 kΩ en serie en cada hilo de la UART está propuesta y sin decidir.", "MONTAJE W19")
nota("W20", OK, "TX del sensor (pin 3) al RX de la Pi (pin 10, GPIO15).", "Manual ZE29A; plano GPIO de la Pi")
nota("W15", AV, "El anuncio del cable no dice que el extremo grande sea USB-A ni la resistencia de 56 kΩ en CC: se mira al recibirlo. Validar antes la carga del Solo con su cargador y cable oficiales.", "MONTAJE W15; auditorías")
nota("W17", AV, "El cable de la pantalla tiene que ser A → C (si viene C → C no entra en el borne).", "MONTAJE W17")
nota("W23", OK, "HDMI de tamaño completo en la Pi y en la pantalla; el extremo acodado va en la pantalla (su HDMI está en el canto, junto al lateral del cajón).", "Anuncio de la pantalla")
nota("W24", OK, "15 vías en los dos lados (Pi 3B+ y Camera Module 3). Contactos: en la Pi hacia el conector HDMI; en la cámara, hacia su placa.", "MONTAJE W24")
nota("W24", AV, "Cinta de 200 mm: en el CAD el recorrido mide unos 125 mm. Bien.", "CAD specs.py")
nota("W25", OK, "El AR9271 va en el USB de abajo de la Pi (cualquiera de los cuatro vale).", "MONTAJE W25")
nota("W26", AV, "El pasamuros une la malla del coaxial (GND de la Pi) a la chapa: montarlo aislado con arandelas aislantes, o asumirlo como la unión única −V/tierra.", "MONTAJE W26")
nota("W26", AV, "Macho y hembra del alargo (RP-SMA) a comprobar al recibirlo.", "MONTAJE W26")
nota("W28a", OK, "Orden en el sentido del soplido: boquilla → toma de presión → barrera → toma de alcohol → escape, como pide el manual (notas 1, 4 y 6).", "Manual ZE29A V1.1")
nota("W28c", AV, "La barrera necesita dos reductores (6→4 y 4→6, vienen 4 en el pack) y un tramo de tubo de 4 mm que no está en la lista: con un solo reductor, su lado de 4 mm no cierra en un tubo de 6 mm.", "Anuncio del reductor (4 uds., 40 mm)")
nota("W28f", AV, "Las boquillas del ZE29A son de unos 2,5 mm (fotos): no entra un tubo de 6 mm. Hace falta tubo fino (2 × 4 mm) y una reducción desde la T; no están en la lista. Se miden al recibir el módulo.", "Fotos del anuncio del ZE29A")
nota("W28g", AV, "Igual que la toma de presión: boquilla de muestra de ~2,2 mm, tubo fino y reducción pendientes.", "Fotos del anuncio del ZE29A")
nota("W28e", OK, "El escape sale por el paso de Ø12 del lateral izquierdo del cajón y por la rejilla de la carcasa.", "CAD")

# ------------------------------------------------------------------ comprobaciones globales
V_AJ, R_TR, R_PI = 5.20, 0.03, 0.16
cargas = [("Raspberry Pi 3B+ + cámara + AR9271", 1.5, 2.5, 3, "Latiguillo 22 AWG"), ("Pantalla 7\"", 1.0, 1.0, 3, "Borne USB-A + cable"),
          ("SumUp Solo (cargando)", 0.8, 1.5, 3, "Borne USB-A + cable"), ("ZE29A", 0.3, 0.5, 2, "Cable XH 22 AWG")]
tot_t, tot_p = sum(c[1] for c in cargas), sum(c[2] for c in cargas)
g = []
g.append(dict(estado=OK, titulo="Fuente de 10 A", texto=f"Consumo típico ≈ {tot_t:.1f} A y pico ≈ {tot_p:.1f} A: la fuente va al {tot_p / 10 * 100:.0f} % en el pico."))
for nom, t, p, f, cab in cargas:
    g.append(dict(estado=OK if p <= 0.85 * f else AV, titulo=f"Rama {nom}", texto=f"Pico {p:.1f} A con fusible de {f} A ({p / f * 100:.0f} %). {cab}."))
v_t = V_AJ - tot_t * R_TR - 1.5 * R_PI; v_p = V_AJ - tot_p * R_TR - 2.5 * R_PI
g.append(dict(estado=AV, titulo="Tensión en la Pi", texto=f"Con la fuente a {V_AJ:.2f} V y la Pi colgando del troncal: {v_t:.2f} V típico y {v_p:.2f} V en el pico (objetivo ≥ 4,90 V; la Pi avisa por debajo de 4,63 V). Directa a la fuente (MONTAJE W13) se gana unos 0,15 V."))
g.append(dict(estado=AV, titulo="Tope de 5,3 V del ZE29A", texto="5,20 V × 1,0225 (línea, carga y temperatura de la hoja LRS-50) ≈ 5,32 V más el rizado: se pasa del máximo del sensor. MONTAJE fija 5,10 V (nunca más de 5,12 V)."))
g.append(dict(estado=OK, titulo="WAGO 221-415", texto="Cinco polos ocupados en cada regleta (troncal + 4 ramas): ninguno con dos hilos. Hilos de 0,33 a 1,3 mm², dentro de 0,2–4 mm²."))
g.append(dict(estado=AV, titulo="Troncal sin fusible", texto="0,75 mm² sin protección entre la fuente y las WAGO: falta el F 5 A del troncal (MONTAJE W11, cinco portafusibles; el kit MINI trae 5)."))
g.append(dict(estado=AV, titulo="Bornes USB-A", texto="Corriente nominal sin dato (1–1,5 A en USB-A de placa) detrás de fusibles de 3 A: bajar a 2 A o cambiar el borne por uno de 2–3 A."))
g.append(dict(estado=OK, titulo="UART", texto="Pin 8 (TXD) → RX del sensor y TX del sensor → pin 10 (RXD); GND común por la WAGO GND. 9600 8N1 a 3,3 V."))
g.append(dict(estado=AV, titulo="Masa y tierra", texto="Tierra: C14 → espárrago del cajón → FG y → carcasa por el puente. El −V solo se une a tierra a través del coaxial si el pasamuros toca la chapa: decidir W12b o aislarlo."))
g.append(dict(estado=AV, titulo="Fusible de 230 V en un solo polo", texto="T2,5A en la C14 (lento: aguanta el arranque de 45 A en frío). Con Schuko puede quedar en el neutro."))
g.append(dict(estado=AV, titulo="Neumática", texto="Orden correcto (presión → barrera → alcohol). Faltan en la lista: tubo de 4 mm para la barrera, tubo fino de 2 × 4 mm y dos reducciones a las boquillas del ZE29A (a medir con el módulo)."))

DESC = {
    "c14.F": "lengüeta del polo con fusible", "c14.N": "lengüeta del otro polo", "c14.PE": "lengüeta de tierra", "c14.C13": "enchufe C14",
    "psu.L": "borne 1 · AC/L", "psu.N": "borne 2 · AC/N", "psu.FG": "borne 3 · FG (tierra)", "psu.-V": "borne 4 · −V", "psu.+V": "borne 5 · +V",
    "pe_cajon.o1": "1.er ojal (bajo tuerca y contratuerca)", "pe_cajon.o2": "2.º ojal", "pe_cajon.o3": "3.er ojal", "pe_carc.o1": "ojal",
    "pi.pwr": "micro-USB (PWR IN)", "pi.hdmi": "HDMI", "pi.csi": "conector CSI «CAMERA»", "pi.gpio8": "pin 8 · GPIO14 (TXD)", "pi.gpio10": "pin 10 · GPIO15 (RXD)",
    "pi.usb_bajo": "USB 2.0 de abajo", "wifi.usb": "clavija USB-A", "wifi.rpsma": "RP-SMA", "antena.coax": "lado de dentro del pasamuros",
    "ze.j1_1": "J1 pin 1 · 5 V", "ze.j1_2": "J1 pin 2 · GND", "ze.j1_3": "J1 pin 3 · TX", "ze.j1_4": "J1 pin 4 · RX", "ze.presion": "boquilla de presión", "ze.alcohol": "boquilla de muestra (celda)",
    "pant.hdmi": "HDMI (canto izquierdo)", "pant.usbc": "USB-C «Power IN»", "solo.usbc": "USB-C (canto de abajo)", "cam.fpc": "conector J1 (FPC)",
    "boq.tubo": "salida de la boquilla", "esc.tubo": "paso del escape", "t_pre.a": "entrada", "t_pre.b": "salida", "t_pre.c": "derivación", "t_alc.a": "entrada", "t_alc.b": "salida", "t_alc.c": "derivación",
    "red_a.r6": "lado de 6 mm", "red_a.r4": "lado de 4 mm", "red_b.r6": "lado de 6 mm", "red_b.r4": "lado de 4 mm", "lat_pi.x": "donde se abre el latiguillo", "schuko.fin": "a la toma de pared",
}
for k in range(1, 6):
    DESC[f"wago_p.p{k}"] = f"polo {k}"; DESC[f"wago_n.p{k}"] = f"polo {k}"
for f in ("fus_pi", "fus_solo", "fus_pant", "fus_sens"):
    DESC[f + ".b"] = "hilo de entrada"; DESC[f + ".a"] = "hilo de salida"
for e in ("emp_pi", "emp_sens"):
    DESC[e + ".p1"] = "polo 1"; DESC[e + ".p2"] = "polo 2"
for u in ("usb_solo", "usb_pant"):
    for t in ("+", "-", "S", "D+", "D-"):
        DESC[f"{u}.{t}"] = f"tornillo {t.replace('-', '−')}"
    DESC[u + ".usb"] = "boca USB-A"
datos = dict(componentes=C, anclas={f"{p}.{a}": v for (p, a), v in A.items()}, desc=DESC, conexiones=K, verificacion=ver, globales=g)
json.dump(datos, open(SP + "conexiones.json", "w"), ensure_ascii=False, separators=(",", ":"))
n = {OK: 0, AV: 0, ERR: 0}
for c in K:
    for v in ver[c["id"]]:
        n[v["estado"]] += 1
print("conexiones", len(K), "notas", n, "globales", len(g))
