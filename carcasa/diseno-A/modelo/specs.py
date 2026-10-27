"""
Diseño A · Compacta (el elegido; B y C se eliminaron el 21-10-2026). Todas las posiciones de componentes están en coordenadas LOCALES del cajón de componentes:
  x = igual que el mundo (0 = centro de la máquina)
  y = 0 en la cara trasera de la chapa frontal del cajón (crece hacia atrás)
  z = 0 en la cara superior de la base del cajón
Los cables se dibujan con puntos de paso; sus extremos salen de la boca, borne o pin real de cada conector
(las mismas anclas que usan los modelos detallados del visor, modelos_elec.js).

26-10-2026 · revisión con las medidas reales (fotos de referencia):
  - El ZE29A se corre 21 mm a la derecha: su celda y su boquilla de muestra sobresalen del canto izquierdo y chocaban con el lateral.
  - La fuente se corre 17 mm a la izquierda (y la caja de red se ensancha): entre la C14 y la regleta solo quedaban 8 mm, sin sitio para faston y punteras.
  - Las WAGO pasan a ir de pie en el frente de la caja de red, con las bocas hacia arriba: tumbadas en la base, los hilos salían debajo de la pantalla.
  - Los bornes USB se suben 15 mm: de pie sobre la base, sus bornes de tornillo quedaban contra la chapa.
  - Neumática: T de presión → reductor 6→4 → tubo de 4 mm → reductor 4→6 → T de alcohol → escape (la barrera necesita los dos reductores del pack y un tramo de tubo de 4 mm).
"""
import comp as C
from geo import place_parts

T = 1.5
GRIS_CABLE = (0.15, 0.15, 0.16)
ROJO, NEGRO_C, AZUL, MARRON, VERDE_AM = (0.85, 0.15, 0.12), (0.08, 0.08, 0.08), (0.15, 0.35, 0.85), (0.50, 0.30, 0.12), (0.55, 0.75, 0.15)
BLANCO_C, AMARILLO = (0.92, 0.92, 0.90), (0.92, 0.78, 0.12)
FFC, SILICONA, COAX, DUPONT, LATON_C = (0.92, 0.88, 0.75), (0.90, 0.92, 0.95), (0.60, 0.42, 0.27), (0.95, 0.75, 0.10), (0.80, 0.62, 0.25)
TRENZA = (0.42, 0.44, 0.47)


# ---------------------------------------------------------------- colocaciones (dicts con at, ex, ey, ez en coordenadas locales)
def usb_de_pie(x, z_arriba, y_cara):
    """Borne USB-A de pie contra una cara (boca USB arriba). Ocupa x..x+21, z z_arriba-50..z_arriba, y y_cara-12..y_cara.
    Sus bornes de tornillo quedan abajo, con las bocas hacia abajo: hace falta aire debajo para meter y doblar los hilos."""
    return dict(at=(x, y_cara, z_arriba), ex=(0, 0, -1), ey=(1, 0, 0), ez=(0, -1, 0))


def fusible_de_pie(x, z, y_cara):
    """Portafusibles de canto contra una cara: x..x+45, z..z+13,25, y y_cara-13,3..y_cara."""
    return dict(at=(x, y_cara, z), ex=(1, 0, 0), ey=(0, 0, 1), ez=(0, -1, 0))


def wago_de_pie(x_der, z_arriba, y_cara):
    """WAGO 221-415 de pie contra una cara: polos a lo largo de X (el 1 a la derecha), bocas hacia arriba y palancas hacia delante.
    Ocupa x_der-29,9..x_der, z z_arriba-18,6..z_arriba, y y_cara-10,6..y_cara."""
    return dict(at=(x_der, y_cara, z_arriba), ex=(-1, 0, 0), ey=(0, 0, -1), ez=(0, -1, 0))


def tumbado(x, y, z=0.0):
    return dict(at=(x, y, z))


def tf_pt(d, p):
    ex, ey, ez = d.get("ex", (1, 0, 0)), d.get("ey", (0, 1, 0)), d.get("ez", (0, 0, 1))
    a = d["at"]
    return tuple(a[i] + ex[i] * p[0] + ey[i] * p[1] + ez[i] * p[2] for i in range(3))


def tf_dir(d, v):
    ex, ey, ez = d.get("ex", (1, 0, 0)), d.get("ey", (0, 1, 0)), d.get("ez", (0, 0, 1))
    return tuple(ex[i] * v[0] + ey[i] * v[1] + ez[i] * v[2] for i in range(3))


def mas(p, d, L):
    return tuple(p[i] + d[i] * L for i in range(3))


# ---------------------------------------------------------------- puntos de conexión (locales)
def puntos(L):
    """Extremos de cada cable a partir de la colocación de los componentes. Cada punto es la boca del conector o
    del borne (lo que dibuja el visor); las direcciones están en el comentario de cada uno."""
    sx, sz = L["pantalla"]
    ox, oz = L["solo"]
    cx, cz = L["camara"]
    px, pz = L["pi"]
    zx, zy, zz = L["ze29a"]
    fx, fz = L["fuente"]
    Yin, Xin1 = L["Yin"], L["Xin1"]
    py = Yin - C.PI["pcb"] - C.PI["sep"]
    c14y, c14z = L["c14"]
    Kx1 = Xin1 + T
    P = dict(
        # pantalla: salidas del cable de las clavijas acodadas (hacia +Y)
        hdmi_pant=(sx - 6.9, 31.65, sz + 25.5), usbc_pant=(sx - 5.1, 26.85, sz + 47.0),
        # Solo: salida del cable de su clavija USB-C acodada (hacia +Y)
        usbc_solo=(ox + C.SOLO["w"] / 2, 26.3, oz - 4.7),
        # Pi: bocas (HDMI y micro-USB miran hacia −Z; CSI hacia −Y; pines hacia −Y)
        hdmi_pi=(px + 32, py - 3.1, pz - 1.0), musb_pi=(px + 10.6, py - 1.5, pz - 1.0),
        csi_pi=(px + 45, py - 5.6, pz + 12), gpio8=(px + 15.99, py - 8.5, pz + 53.81), gpio10=(px + 18.53, py - 8.5, pz + 53.81),
        rpsma=(px + 75.1 + 93.2, py - 4.3, pz + 29),
        # cámara: boca del conector FPC (mira hacia −Z, por detrás de la placa)
        cam=(cx + 12.5, C.CAM["sep"] + 2.4, cz - 0.2),
        # ZE29A: salida de los hilos de la clavija XH (+X), boquilla de presión (−Y) y boquilla de muestra (−X)
        ze_j1=tuple(a + b for a, b in zip((zx, zy, zz), C.ZE["j1_salida"])),
        ze_pre=tuple(a + b for a, b in zip((zx, zy, zz), C.ZE["toma_presion"])),
        ze_alc=tuple(a + b for a, b in zip((zx, zy, zz), C.ZE["toma_alcohol"])),
        # fuente: bocas de la regleta (miran hacia +X, hacia la C14)
        psu_L=(fx + 0.2, Yin - 22.5, fz + 82 - 17.5), psu_N=(fx + 0.2, Yin - 22.5, fz + 82 - 27.0), psu_FG=(fx + 0.2, Yin - 22.5, fz + 82 - 36.5),
        psu_neg=(fx + 0.2, Yin - 22.5, fz + 82 - 46.0), psu_pos=(fx + 0.2, Yin - 22.5, fz + 82 - 55.5),
        # C14: puntas de las lengüetas faston (miran hacia −X). Qué lengüeta lleva el fusible se mide (apartado 4 del montaje)
        c14_F=(Kx1 - 32, c14y + 4.6, c14z - 7), c14_N=(Kx1 - 32, c14y + 4.6, c14z + 7), c14_PE=(Kx1 - 32, c14y + 11, c14z),
        boq=(L["boquilla"][0], 0.0, L["boquilla"][1]),
    )
    for k, d in enumerate(L["usb"]):
        P[f"usb{k}"] = tf_pt(d, (-0.6, 10.5, 6.0))                                    # boca USB (hacia arriba)
        for i, nm in enumerate(["S", "+", "D-", "D+", "-"]):
            P[f"usb{k}_{nm}"] = tf_pt(d, (50.2, 2.88 + 3.81 * i, 4.8))               # bocas de los bornes (hacia abajo)
    for k, d in enumerate(L["fusibles"]):
        P[f"fus{k}_a"], P[f"fus{k}_b"] = tf_pt(d, (-0.2, 7, 4.6)), tf_pt(d, (45.2, 7, 4.6))
    for k, d in enumerate(L["wago"]):
        for i in range(5):
            P[f"wago{k}_{i + 1}"] = tf_pt(d, (3.0 + 5.98 * i, -0.2, 3.9))           # bocas (hacia arriba)
        P[f"wago{k}"] = P[f"wago{k}_1"]
    for k, d in enumerate(L["empalmes"]):
        for i in range(2):
            P[f"emp{k}_{i + 1}"] = tf_pt(d, (3.3 + 6.5 * i, -0.2, 3.9))              # bocas (hacia −Y)
    return P


def cables_de(m, Lf, g, lista):
    for c in lista:
        nombre, pts, r, col, tipo = c[:5]
        extra = c[5] if len(c) > 5 else {}
        m.cable(nombre, [Lf(*q) for q in pts], r, col, tipo=tipo, **extra)


def pe_carcasa_local(g):
    pe = g["pe_h"]
    return (pe[0] - g["OX"], pe[1] - 8 - g["OY"], pe[2] - g["OZ"])      # punta del espárrago de 8 mm


def k_top(g):
    return g["Ktop"] - g["OZ"]


def agujeros_comunes(L):
    fx, fz = L["fuente"]
    px, pz = L["pi"]
    zx, zy, zz = L["ze29a"]
    a = [(fx - ax, fz + C.FUENTE["W"] - az) for ax, az in C.FUENTE["agujeros"]]
    a += [(px + ax, pz + az) for ax, az in C.PI_AGUJEROS]
    a += [(zx + ax, zz + az) for ax, az in C.ZE["agujeros"]]
    for d in L["usb"]:                                   # bornes USB de pie contra la trasera: 2 taladros M3
        if abs(d["at"][1] - (L["Yin"] - 0.2)) < 0.01:
            x, y, z = d["at"]
            a += [(x + 10.5, z - 12), (x + 10.5, z - 38)]
    for d in L["fusibles"]:
        if d.get("ey") == (0, 0, 1) and abs(d["at"][1] - (L["Yin"] - 0.2)) < 0.01:
            x, y, z = d["at"]
            a += [(x + 22.5, z + 7)]
    return a


# ============================================================================ DISEÑO A · Compacta
def layout_A(k):
    Yin, Xin1 = k["Yin"], k["Xin1"]
    yf = Yin - 36 - T                                    # cara delantera de la caja de red
    yc = yf - 0.2                                        # plano donde se apoyan las piezas de pie del reparto de 5 V
    L = dict(Yin=Yin, Xin1=Xin1,
             pantalla=(-82.5, 12.0), solo=(6.5, 136.0), camara=(-67.5, 185.5), boquilla=(-55.0, 150.0),
             pi=(-101.0, 99.0), fuente=(43.0, 3.0), ze29a=(-80.0, Yin - 9.6, 162.0), c14=(Yin - 18.0, 50.0),
             red=dict(x0=-56.5, alto=88.0, fondo=36.0, pasacables=[(86.0, Yin - 9.0)], pasacables_frente=[(-45.0, 45.0)],
                      bridas_tapa=[], vent_x=(-30.0, 25.0), vent_z=(8.0, 22.0)),
             escape=(50.0, 212.0), escape_lado="izq", pe_cajon=(60.0, 100.0),
             wago=[wago_de_pie(-28.0, 78.6, yc), wago_de_pie(4.0, 78.6, yc)],
             usb=[usb_de_pie(27.0, 65.0, yc), usb_de_pie(77.0, 65.0, yc)],
             fusibles=[fusible_de_pie(-22.0, 2.0 + 14 * i, yc) for i in range(4)],
             empalmes=[tumbado(0.0, 38.0, 88.0 + T), tumbado(20.0, 38.0, 88.0 + T)],
             bridas_trasera=[(-80.0, 75.0), (-10.0, 120.0), (60.0, 150.0)],
             topes_frente=[-80.0, 80.0], rejillas_izq=[(12.0, 40.0), (176.0, 196.0)], rejillas_der=[(186.0, 212.0)],
             # neumática (centros): T de presión, reductores y T de alcohol, en línea a y = 40, z = 205
             te_presion=(45.0, 40.0, 205.0), te_alcohol=(-75.0, 40.0, 205.0), reductor_a=28.0, reductor_b=-58.0,
             )
    L["agujeros_trasera"] = agujeros_comunes(L)

    def cables(m, Lf, g):
        P = puntos(L)
        kt = k_top(g)
        peh, ant = pe_carcasa_local(g), g["antena_l"]
        mv = "cajon_componentes"
        px, pz = L["pi"]
        py = Yin - C.PI["pcb"] - C.PI["sep"]
        zx, zy, zz = L["ze29a"]
        stud = (Xin1 - 4.0, L["pe_cajon"][0], L["pe_cajon"][1])
        yw = g["D"] - T - g["OY"]                                           # cara interior de la trasera de la carcasa (local)            # ojales en el espárrago de tierra del cajón

        # ---------------- clavijas, empalmes y racores que se dibujan (y se comprueban contra choques)
        def tfw(at, ex=(1, 0, 0), ey=(0, 1, 0), ez=(0, 0, 1)):
            return dict(at=Lf(*at), ex=ex, ey=ey, ez=ez)
        m.compra("E16", "Clavija HDMI recta (Pi)", place_parts(C.Partes([("clavija", C.box(-9.6, 44, -10.5, 10.5, -5.5, 5.5), C.NEGRO)], C._m("clavija_hdmi_recta")),
                 **tfw(P["hdmi_pi"], ex=(0, 0, -1), ey=(1, 0, 0), ez=(0, -1, 0))), movil=mv, electrico=True, uds=0,
                 notas="Extremo recto del cable HDMI acodado: entra en la Pi desde abajo")
        m.compra("E18", "Clavija micro-USB del latiguillo (Pi)", place_parts(C.Partes([("clavija", C.box(-5.6, 21, -5.3, 5.3, -2.9, 2.9), C.NEGRO)], C._m("clavija_microusb")),
                 **tfw(P["musb_pi"], ex=(0, 0, -1), ey=(1, 0, 0), ez=(0, -1, 0))), movil=mv, electrico=True)
        for k_ in range(2):
            m.compra("E17", f"Clavija USB-A del cable ({'pantalla' if k_ == 0 else 'Solo'})",
                     place_parts(C.Partes([("clavija", C.box(-12, 22, -7.4, 7.4, -3.8, 3.8), C.NEGRO)], C._m("clavija_usba")),
                                 **tfw(P[f"usb{k_}"], ex=(0, 0, 1), ey=(1, 0, 0), ez=(0, 1, 0))), movil=mv, electrico=True, uds=0)
        m.compra("E19", "Clavija XH de 4 vías en J1 del ZE29A", place_parts(C.Partes([("clavija", C.box(-7.2, 0, -2.4, 3.4, -6.2, 6.2), C.BLANCO)], C._m("clavija_xh")),
                 **tfw(P["ze_j1"], ex=(1, 0, 0), ey=(0, 1, 0), ez=(0, 0, 1))), movil=mv, electrico=True,
                 notas="Hilos por posición: 1 = 5 V, 2 = GND, 3 = TX del sensor, 4 = RX del sensor (los colores del anuncio no dicen cuál es cuál)")
        for k_, d in enumerate(L["empalmes"]):
            m.compra("E08", f"WAGO 221-412 (empalme {'5 V de la Pi' if k_ == 0 else '5 V del sensor'})",
                     place_parts(C.Partes([("cuerpo", C.box(0, 13.1, 0, 18.6, 0, 10.6), C.TRANSP)], C._m("wago_412")), at=Lf(*d["at"])),
                     movil=mv, electrico=True, uds=0, notas="Del surtido 221 (#20): une el hilo de 16 AWG del portafusibles con el latiguillo")
        tp, ta = L["te_presion"], L["te_alcohol"]
        for nom, c in (("T de la toma de presión", tp), ("T de la toma de alcohol", ta)):
            m.compra("E14", nom, place_parts(C.te_6mm(), **tfw(c, ex=(1, 0, 0), ey=(0, -1, 0), ez=(0, 0, -1))), movil=mv)
        m.compra("E15", "Reductor 6 → 4 (barrera, entrada)", place_parts(C.reductor_6_4(), **tfw((L["reductor_a"], 40.0, 205.0), ex=(-1, 0, 0), ey=(0, -1, 0), ez=(0, 0, 1))), movil=mv,
                 notas="Con el reductor 4 → 6 y un tramo de tubo de 4 mm forma la barrera que crea la presión del soplido")
        m.compra("E15", "Reductor 4 → 6 (barrera, salida)", place_parts(C.reductor_6_4(), **tfw((L["reductor_b"], 40.0, 205.0))), movil=mv)

        # ---------------- accesorios pequeños que solo dibuja el visor (faston, punteras, ojales, tuercas, Dupont, RP-SMA macho)
        acc = m.cotas.setdefault("accesorios", [])
        def cruz(a, b):
            return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])
        def ac(n, at, ex, ey, ez=None, a=None, movil=mv, local=True):
            ez = ez or cruz(ex, ey)
            pt = Lf(*at) if local else at
            acc.append(dict(n=n, a=a or [], tf=dict(at=[round(v, 3) for v in pt], ex=list(ex), ey=list(ey), ez=list(ez)), movil=movil))
        for tab, ey_ in (("c14_F", (0, 0, 1)), ("c14_N", (0, 0, 1)), ("c14_PE", (0, 1, 0))):
            ac("faston", mas(P[tab], (-1, 0, 0), 1.0), (-1, 0, 0), ey_, a=["#2257b8"])
        for b_, col in (("psu_L", "#1a1a1a"), ("psu_N", "#1a1a1a"), ("psu_FG", "#1a1a1a"), ("psu_pos", "#d22b25"), ("psu_neg", "#1f56b5")):
            ac("puntera", P[b_], (1, 0, 0), (0, 1, 0), a=[col])
        # espárrago de tierra del cajón (eje −X desde la pared): ojal W6, tuerca y contratuerca, ojales W7 y W10, tuerca
        xs = Xin1
        anillos = {"W6": ((xs - 1.3, 60.0, 100.0), (0, -1, 0)), "W7": ((xs - 8.9, 60.0, 100.0), (0, 0.7071, -0.7071)), "W10": ((xs - 9.7, 60.0, 100.0), (0, 0, 1))}
        for k_, (c, d) in anillos.items():
            ac("ojal_m4", c, d, (1, 0, 0))
        for xt in (xs - 1.3, xs - 4.5, xs - 9.7):
            ac("tuerca_m4", (xt, 60.0, 100.0), (1, 0, 0), (0, 1, 0), a=[[-1, 0, 0]])
        punta = {k_: mas(c, d, 14.0) for k_, (c, d) in anillos.items()}
        # espárrago de tierra de la carcasa (trasera, eje −Y): ojal del puente y tuerca — no se mueve con el cajón
        pc = (g["pe_h"][0], g["pe_h"][1] - 1.1, g["pe_h"][2])
        ac("ojal_m4", pc, (0, 0, 1), (0, -1, 0), movil=None, local=False)
        ac("tuerca_m4", (pc[0], pc[1] - 0.8, pc[2]), (1, 0, 0), (0, 1, 0), a=[[0, -1, 0]], movil=None, local=False)
        pcl = (pc[0] - g["OX"], pc[1] - g["OY"], pc[2] - g["OZ"] + 14.0)
        for pin, col in (("gpio8", "#e8c21c"), ("gpio10", "#ecebe6")):
            q = P[pin]
            ac("dupont", (q[0], py - 16.5, q[2]), (0, -1, 0), (1, 0, 0), a=[col])
        ac("rpsma_macho", P["rpsma"], (1, 0, 0), (0, 1, 0))
        ac("faston_par", (60.0, 69.0, 214.0), (0, 0, 1), (1, 0, 0), a=["#2257b8"])

        # ---------------- cables: (nombre, puntos, radio, color, tipo, {estilo, w, de, a})
        X = lambda **kw: kw
        UP, DN, FW, BK, XP = (0, 0, 1), (0, 0, -1), (0, -1, 0), (0, 1, 0), (1, 0, 0)
        tab_out = {t: mas(P[t], (-1, 0, 0), 9.0) for t in ("c14_F", "c14_N", "c14_PE")}           # fin del faston
        ent = {b_: mas(P[b_], XP, 6.0) for b_ in ("psu_L", "psu_N", "psu_FG", "psu_pos", "psu_neg")}   # fin de la puntera
        fin = lambda e: [mas(e, XP, 4.0), e]
        def entra(p_, d_, L_=6.0):            # últimos puntos de un hilo que entra en una boca que mira hacia d_
            return [mas(p_, d_, L_), p_]
        lista = [
            # ---- 230 V y tierra (manguera H05VV-F, hilos de 1,5 mm²)
            ("W2 · 230 V: C14 (polo con fusible) → fuente L", [tab_out["c14_F"], (57, 56, 50), (55, 52, 60)] + fin(ent["psu_L"]), 1.5, MARRON, "cable",
             X(estilo="pvc", w="W2", de="C14 · lengüeta del polo con fusible", a="LRS-50-5 · borne 1 (AC/L)")),
            ("W3 · 230 V: C14 (otro polo) → fuente N", [tab_out["c14_N"], (57, 55, 58)] + fin(ent["psu_N"]), 1.5, AZUL, "cable",
             X(estilo="pvc", w="W3", de="C14 · lengüeta del otro polo", a="LRS-50-5 · borne 2 (AC/N)")),
            ("W6 · Tierra: C14 → espárrago del cajón", [tab_out["c14_PE"], (62, 64, 62), (76, 63, 78), (86, 62, 85), (86, 62, 92), (92, 50, 99), (96, 40, 100), mas(punta["W6"], FW, 4), punta["W6"]], 1.5, VERDE_AM, "cable",
             X(estilo="verdeamarillo", w="W6", de="C14 · contacto de tierra", a="Espárrago M4 del cajón")),
            ("W7 · Tierra: espárrago del cajón → fuente FG", [punta["W7"], (89, 66.5, 91), (86, 62, 89), (84, 62, 80), (66, 60, 72), (56, 54, 62)] + fin(ent["psu_FG"]), 1.5, VERDE_AM, "cable",
             X(estilo="verdeamarillo", w="W7", de="Espárrago M4 del cajón", a="LRS-50-5 · borne 3 (FG)")),
            # ---- troncal de 5 V (cable 2 × 0,75 mm²) por el pasacables del frente de la caja de red
            ("W11 · +5 V troncal: fuente +V → WAGO +5 V (polo 1)", [ent["psu_pos"], mas(ent["psu_pos"], XP, 4), (54, 44, 31), (50, 39, 32), (40, 37.0, 34), (0, 37.0, 39), (-30, 37.4, 43), (-38, 38.8, 44), (-45, 38.8, 45), (-45, 33.5, 45), (-45, 28.5, 45), (-44, 24, 50), (-40, 19, 62), (-34, 18, 90)] + entra(P["wago0_1"], UP, 7.2), 1.2, ROJO, "cable",
             X(estilo="pvc", w="W11", de="LRS-50-5 · borne 5 (+V)", a="WAGO +5 V · polo 1")),
            ("W12 · 0 V troncal: fuente −V → WAGO GND (polo 1)", [ent["psu_neg"], mas(ent["psu_neg"], XP, 4), (54, 45, 38), (50, 39.5, 39.5), (40, 38.2, 41), (0, 38.2, 43), (-34, 38.6, 45), (-40, 39.2, 46), (-46.5, 39.0, 46.5), (-46.5, 33.5, 46.5), (-46.5, 28.5, 46.5), (-40, 23, 52), (-10, 17.5, 70), (-3, 18, 90)] + entra(P["wago1_1"], UP, 7.2), 1.2, NEGRO_C, "cable",
             X(estilo="pvc", w="W12", de="LRS-50-5 · borne 4 (−V)", a="WAGO GND · polo 1")),
        ]
        # ---- entradas de los portafusibles (hilo rojo de 16 AWG que trae cada portafusibles) desde los polos 2 a 5 de la WAGO +5 V
        ramas = ["Pi", "Solo", "pantalla", "sensor"]
        for kf in range(4):
            w = P[f"wago0_{kf + 2}"]; a = P[f"fus{kf}_a"]; yv = 16.5 + 1.6 * kf
            lista.append((f"Rama {ramas[kf]}: WAGO +5 V (polo {kf + 2}) → portafusibles", [w, mas(w, UP, 7.2), (w[0], yv, 89), (w[0] + 3, yv, 70), (-36, yv, a[2] + 6), (-30, a[1] - 3, a[2]), mas(a, (-1, 0, 0), 4), a], 1.45, ROJO, "cable",
                          X(estilo="pvc", w=["W13", "W14", "W16", "W18"][kf], de=f"WAGO +5 V · polo {kf + 2}", a=f"Portafusibles {ramas[kf]} · entrada")))
        b0, b1, b2, b3 = (P[f"fus{i}_b"] for i in range(4))
        lista += [
            ("Rama Pi: portafusibles 3 A → empalme (5 V de la Pi)", [b0, mas(b0, XP, 3.5), (27, 18, 12), (25, 16, 50), (15, 18, 86)] + entra(P["emp0_1"], FW, 5), 1.45, ROJO, "cable",
             X(estilo="pvc", w="W13", de="Portafusibles Pi · salida", a="WAGO 221-412 (empalme de la Pi)")),
            ("Rama Solo: portafusibles 3 A → borne USB del Solo (+)", [b1, (25.5, 26, 23), (27, 19, 21), (60, 18, 6), (P["usb1_+"][0], 24, 4)] + entra(P["usb1_+"], DN, 6), 1.45, ROJO, "cable",
             X(estilo="pvc", w="W14", de="Portafusibles Solo · salida", a="Borne USB del Solo · tornillo +")),
            ("Rama pantalla: portafusibles 3 A → borne USB de la pantalla (+)", [b2, (25.5, 25, 37), (26, 18, 30), (29, 18, 8), (P["usb0_+"][0], 24, 4)] + entra(P["usb0_+"], DN, 6), 1.45, ROJO, "cable",
             X(estilo="pvc", w="W16", de="Portafusibles pantalla · salida", a="Borne USB de la pantalla · tornillo +")),
            ("Rama sensor: portafusibles 2 A → empalme (5 V del sensor)", [b3, (25, 25, 53), (25, 21, 60), (24.5, 20, 84)] + entra(P["emp1_1"], FW, 5), 1.45, ROJO, "cable",
             X(estilo="pvc", w="W18", de="Portafusibles sensor · salida", a="WAGO 221-412 (empalme del sensor)")),
        ]
        # ---- GND desde los polos 2 a 5 de la WAGO GND (2 = Pi, 3 = Solo, 4 = pantalla, 5 = sensor)
        g2, g3, g4, g5 = (P[f"wago1_{i}"] for i in range(2, 6))
        lista += [
            ("GND Solo: WAGO GND (polo 3) → borne USB del Solo (−)", [g3, mas(g3, UP, 7.2), (g3[0] + 4, 15.5, 84), (55, 15, 36), (P["usb1_-"][0], 23, 4)] + entra(P["usb1_-"], DN, 6), 1.2, NEGRO_C, "cable",
             X(estilo="pvc", w="W14", de="WAGO GND · polo 3", a="Borne USB del Solo · tornillo −")),
            ("GND pantalla: WAGO GND (polo 4) → borne USB de la pantalla (−)", [g4, mas(g4, UP, 7.2), (g4[0] + 4, 14.5, 82), (36, 14.5, 26), (P["usb0_-"][0], 23, 4)] + entra(P["usb0_-"], DN, 6), 1.2, NEGRO_C, "cable",
             X(estilo="pvc", w="W16", de="WAGO GND · polo 4", a="Borne USB de la pantalla · tornillo −")),
        ]
        # ---- latiguillo micro-USB de la Pi (rojo y negro): clavija → se abre en dos cerca del empalme
        mu = mas(P["musb_pi"], DN, 21.0)
        split = (-6.0, 30.0, 96.0)
        lista += [
            ("W13 · Latiguillo micro-USB (Pi)", [mu, mas(mu, DN, 5), (-86, 54, 66), (-72, 40, 80), (-60, 30, 96), (-30, 30, 98), split], 1.7, NEGRO_C, "cable",
             X(estilo="pvc", w="W13", de="Raspberry Pi · micro-USB (PWR IN)", a="empalme y WAGO GND")),
            ("W13 · Latiguillo: rojo → empalme", [split, (2, 30, 95)] + entra(P["emp0_2"], FW, 4), 0.8, ROJO, "cable",
             X(estilo="pvc", w="W13", de="Latiguillo · rojo (VBUS)", a="WAGO 221-412 (empalme de la Pi)")),
            ("W13 · Latiguillo: negro → WAGO GND (polo 2)", [split, (-5, 27, 90)] + entra(g2, UP, 7.2), 0.8, NEGRO_C, "cable",
             X(estilo="pvc", w="W13", de="Latiguillo · negro (GND)", a="WAGO GND · polo 2")),
        ]
        # ---- sensor: cuatro hilos de 22 AWG de la clavija XH (150 mm). Colores por posición: supuestos
        j = P["ze_j1"]
        jo = [(j[0], j[1], j[2] + dz) for dz in (3.75, 1.25, -1.25, -3.75)]    # 1 = 5V arriba … 4 = RX abajo
        d8 = (P["gpio8"][0], py - 21.5, P["gpio8"][2]); d10 = (P["gpio10"][0], py - 21.5, P["gpio10"][2])
        lista += [
            ("W19 · UART: Pi pin 8 (TX) → ZE29A pin 4 (RX)", [jo[3], mas(jo[3], XP, 6), (22, 54, 168), (0, 48, 162), (-60, 44, 158)] + entra(d8, FW, 5), 0.75, AMARILLO, "cable",
             X(estilo="pvc", w="W19", de="Raspberry Pi · pin 8 (GPIO14, TXD)", a="ZE29A · J1 pin 4 (RX)")),
            ("W20 · UART: ZE29A pin 3 (TX) → Pi pin 10 (RX)", [jo[2], mas(jo[2], XP, 7), (23, 53.5, 168.5), (0, 47.5, 162.5), (-60, 43.5, 158.5)] + entra(d10, FW, 5), 0.75, BLANCO_C, "cable",
             X(estilo="pvc", w="W20", de="ZE29A · J1 pin 3 (TX)", a="Raspberry Pi · pin 10 (GPIO15, RXD)")),
            ("W18 · Sensor 5 V: J1 pin 1 → empalme", [jo[0], mas(jo[0], XP, 8), (24, 54, 168), (30, 48, 130), (P["emp1_2"][0], 30, 100)] + entra(P["emp1_2"], FW, 4), 0.75, ROJO, "cable",
             X(estilo="pvc", w="W18", de="ZE29A · J1 pin 1 (5 V)", a="WAGO 221-412 (empalme del sensor)")),
            ("W18 · Sensor GND: J1 pin 2 → WAGO GND (polo 5)", [jo[1], mas(jo[1], XP, 8), (22, 54.5, 166), (8, 44, 128), (-12, 30, 100)] + entra(g5, UP, 7.2), 0.75, NEGRO_C, "cable",
             X(estilo="pvc", w="W18", de="ZE29A · J1 pin 2 (GND)", a="WAGO GND · polo 5")),
        ]
        # ---- datos y USB
        hp = mas(P["hdmi_pi"], DN, 44.0)
        u0, u1 = mas(P["usb0"], UP, 22.0), mas(P["usb1"], UP, 22.0)
        lista += [
            ("W23 · HDMI: Pi → pantalla (cable acodado de 30 cm)", [P["hdmi_pant"], mas(P["hdmi_pant"], BK, 8), (-87, 50, 39), (-74, 60, 42)] + entra(hp, DN, 6), 2.25, GRIS_CABLE, "cable",
             X(estilo="hdmi", w="W23", de="Raspberry Pi · HDMI", a="Pantalla · HDMI")),
            ("W17 · USB-C pantalla ← borne USB (cable A → C)", [P["usbc_pant"], mas(P["usbc_pant"], BK, 6), (-82, 30, 80), (-60, 19, 100), (10, 20, 104), (P["usb0"][0], 26, 101)] + entra(u0, UP, 6), 1.9, TRENZA, "cable",
             X(estilo="trenzado", w="W17", de="Borne USB de la pantalla · USB-A", a="Pantalla · USB-C (Power IN)")),
            ("W15 · USB-C Solo ← borne USB (cable A → C)", [P["usbc_solo"], mas(P["usbc_solo"], BK, 6), (62, 33, 118), (P["usb1"][0], 28, 101)] + entra(u1, UP, 6), 1.9, TRENZA, "cable",
             X(estilo="trenzado", w="W15", de="Borne USB del Solo · USB-A", a="SumUp Solo · USB-C")),
            ("W24 · Cinta de la cámara (FFC 15 vías, 200 mm)", [P["cam"], mas(P["cam"], DN, 7), (-55, 18, 168), (-55.5, 30, 140), (-56, 42, 116)] + entra(P["csi_pi"], FW, 6), 8.0, FFC, "cinta",
             X(estilo="ffc", w="W24", de="Camera Module 3 · J1", a="Raspberry Pi · CSI (CAMERA)", n0=[0, 1, 0], n1=[1, 0, 0])),
            ("W10 · Puente de tierra cajón → carcasa (faston)", [punta["W10"], (88, 62, 125), (75, 68.5, 155), (60, 69, 165), (60, 69, 215), (60, 69, kt - 2), (60, 69.3, kt + 1.2), (60, 70.5, kt + 2.1), (60, 72, kt + 2.1), (60, yw - 9.5, kt + 2.1), (56, yw - 6.5, kt + 2.1), (51, yw - 2.5, kt - 3.5), (pcl[0], pcl[1], pcl[2] + 3), pcl], 1.5, VERDE_AM, "puente",
             X(estilo="verdeamarillo", w="W10", de="Espárrago M4 del cajón", a="Espárrago M4 de la carcasa")),
            ("W26 · Coaxial de la antena (RP-SMA, se desenrosca)", [mas(P["rpsma"], XP, 12), (84, 60, 136), (70, 61, 165), (66, 69, 185), (66, 69, kt - 6), (66, 69.3, kt + 1.2), (66, 70.5, kt + 2.1), (66, 72, kt + 2.1), (66, 76, kt + 2.1), (80, 78, kt + 2.1), (90, 79, kt - 4.5), (ant[0], ant[1], ant[2] + 25), ant], 1.3, COAX, "puente",
             X(estilo="coax", w="W26", de="AR9271 · RP-SMA", a="Antena por el pasamuros")),
        ]
        # ---- aire del soplido (W28): boquilla → T presión → reductor → tubo 4 mm → reductor → T alcohol → escape
        ra, rb = L["reductor_a"], L["reductor_b"]
        yv, zv = 40.0, 205.0
        lista += [
            ("W28 · Tubo de soplido: boquilla → T de presión", [P["boq"], (-55, 10, 150), (-32, 22, 160), (-10, 30, 174), (24, 33, 190), (62, 36, 198), (68, 39, 204), (tp[0] + 15, yv, zv), (tp[0] + 5, yv, zv)], 4.0, SILICONA, "tubo",
             X(estilo="silicona", w="W28", de="Boquilla del panel", a="T de presión")),
            ("W28 · T de presión → reductor 6 → 4", [(tp[0] - 5, yv, zv), (ra - 15, yv, zv)], 4.0, SILICONA, "tubo", X(estilo="silicona", w="W28")),
            ("W28 · Tubo de 4 mm entre reductores (falta en la lista)", [(ra - 25, yv, zv), (rb + 25, yv, zv)], 3.0, SILICONA, "tubo", X(estilo="silicona", w="W28")),
            ("W28 · reductor 4 → 6 → T de alcohol", [(rb + 15, yv, zv), (ta[0] + 5, yv, zv)], 4.0, SILICONA, "tubo", X(estilo="silicona", w="W28")),
            ("W28 · Escape del soplido", [(ta[0] - 5, yv, zv), (ta[0] - 16, yv, zv), (-96, 43, 207), (-101, 48, 211), (k["Xin0"] + 0.5, 50, 212), (k["Xin0"] - T, 50, 212)], 4.0, SILICONA, "tubo",
             X(estilo="silicona", w="W28", de="T de alcohol", a="Rejilla de escape del lateral izquierdo")),
            ("W28 · Toma de presión (reducción 6 → 2,5, falta en la lista)", [(tp[0], yv, zv - 5), (tp[0], yv, zv - 15)], 3.6, SILICONA, "tubo", X(estilo="silicona", w="W28")),
            ("W28 · Toma de presión: tubo de 2 × 4 mm", [(tp[0], yv, zv - 15), (tp[0], yv, zv - 19), (30, 43, 188), (-20, 44, 192), (P["ze_pre"][0] + 4, 44.5, P["ze_pre"][2] + 1), (P["ze_pre"][0], P["ze_pre"][1] - 6, P["ze_pre"][2]), (P["ze_pre"][0], P["ze_pre"][1] + 2.5, P["ze_pre"][2])], 2.0, SILICONA, "tubo",
             X(estilo="silicona", w="W28", de="T de presión · derivación", a="ZE29A · boquilla de presión")),
            ("W28 · Toma de alcohol (reducción 6 → 2,5, falta en la lista)", [(ta[0], yv, zv - 5), (ta[0], yv, zv - 15)], 3.6, SILICONA, "tubo", X(estilo="silicona", w="W28")),
            ("W28 · Toma de alcohol: tubo de 2 × 4 mm", [(ta[0], yv, zv - 15), (ta[0], yv, zv - 19), (-80, 46, 184), (-94, 53, 178), (P["ze_alc"][0] - 5, P["ze_alc"][1], P["ze_alc"][2]), (P["ze_alc"][0] + 3, P["ze_alc"][1], P["ze_alc"][2])], 2.0, SILICONA, "tubo",
             X(estilo="silicona", w="W28", de="T de alcohol · derivación", a="ZE29A · boquilla de muestra")),
        ]
        cables_de(m, Lf, g, lista)

    L["cables"] = cables
    return L


SPEC_A = dict(letra="A", nombre="Compacta", W=220.0, D=100.0, gb=11.0, Hk=228.0, tapa="lateral", bisagra="izq", asa="x", layout=layout_A,
              descripcion="Cámara y Solo arriba, pantalla debajo. Policarbonato delante y detrás del panel. Tapa abatible con cerradura y faldón derecho; tapa interior plana que entra deslizando por una ranura del lateral derecho; cajón de pajitas con dos candados. Sin botón.")
