"""
Generador paramétrico del alcoholímetro (carcasa de chapa + cajón de pajitas + cajón de componentes).

Cada pieza fabricada es UNA forma geométrica (chapa plana de corte láser o pieza de policarbonato)
con su número. Las piezas compradas llevan el número de la lista de compra.

Ejes: X ancho (+ derecha mirando de frente), Y fondo (0 = cara exterior del panel, + hacia atrás),
Z alto (0 = suelo).
"""
import math
import cadquery as cq
import comp as C
from comp import box, cyl, fuse
from geo import (place, place_parts, hole_y, hole_x, hole_z, slot_y, slot_x, slot_z, cut_all,
                 keyhole_y, vent_slots_x, vent_slots_z, vent_slots_y)

T = 1.5            # chapa de acero
PC_T = 5.0         # policarbonato, por DENTRO: entre el panel frontal y el cajón de componentes
TUERCA = 3.2       # tuerca M4 que lo aprieta contra el panel
ZS0, ZS1 = 162.0, 163.5   # bandeja (separa cajón de pajitas y zona de componentes)
Z_HUECO = 150.0           # el hueco del lateral izquierdo llega hasta aquí (debajo queda sitio para las tuercas de los silentblocks)
Z_TOP_P = 148.5           # borde superior del cajón de pajitas (igual que el diseño anterior)
SB_H = 10.0        # silentblock
GF = 12.0          # holgura panel-cajón: policarbonato 5 + tuerca 3,2 + 3,8 de aire
GS_L, GS_R = 3.5, 7.0     # holgura lateral izquierda / derecha (a la derecha cabe la brida de la C14 y sus tornillos)
TOPE = 3.0
TIRA = 18.0        # tira trasera fija del techo (tapa extraíble)
BANDA = 32.0       # alto del faldón delantero de la tapa (lleva las cerraduras)
AIRE_TI = 6.0      # aire entre el borde del cajón de componentes y la tapa interior plana
X_CER = 15.0       # eje de cada cerradura a 15 mm del lateral; la leva (recortada a 20,5 mm) entra en una ranura del lateral
LEVA = 20.5
HOLG_TI = 0.3      # holgura de la tapa interior en su ranura del lateral derecho (arriba y abajo)

COL_CHAPA = (0.62, 0.66, 0.70)
COL_CHAPA_OSC = (0.30, 0.34, 0.38)
COL_CAJON = (0.23, 0.45, 0.78)
COL_CART = (0.88, 0.58, 0.20)
COL_RED = (0.85, 0.20, 0.18)
COL_SOP = (0.70, 0.62, 0.30)
COL_TAPA = (0.50, 0.55, 0.60)
COL_PC = (0.75, 0.88, 0.98)


class Modelo:
    def __init__(self, letra, nombre, descripcion):
        self.letra, self.nombre, self.descripcion = letra, nombre, descripcion
        self.piezas = []          # dicts
        self.cables = []
        self.movil = {}
        self.cotas = {}
        self.notas = []
        self.zonas = []           # volúmenes que deben quedar libres (no se exportan)
        self._n = {}

    def nid(self, grupo):
        self._n[grupo] = self._n.get(grupo, 0) + 1
        return f"{self.letra}-{grupo}{self._n[grupo]:02d}"

    def fab(self, grupo, nombre, solido, color, material="Acero DC01 1,5 mm", proceso="Láser", movil=None,
            notas="", espesor=T, plana=True):
        pid = self.nid(grupo)
        self.piezas.append(dict(id=pid, nombre=nombre, grupo=grupo, tipo="fabricada", material=material,
                                proceso=proceso, espesor=espesor, solido=solido, subs=[(nombre, solido, color)],
                                color=color, movil=movil, electrico=False, notas=notas, plana=plana))
        return pid

    def compra(self, ref, nombre, subs, movil=None, electrico=False, notas="", grupo="H", uds=1, modelo=None):
        """uds: unidades que cuenta en la lista de compra (0 si es la otra mitad de una pieza ya contada).
        modelo: modelo detallado del visor {n, a, tf}; si no se da, se toma el que traen las partes colocadas."""
        n = sum(1 for p in self.piezas if p.get("ref") == ref) + 1
        pid = f"{self.letra}-{ref}.{n}"
        sol = fuse([s for _, s, _ in subs])
        self.piezas.append(dict(id=pid, ref=ref, nombre=nombre, grupo=grupo, tipo="comprada", solido=sol,
                                subs=subs, color=subs[0][2], movil=movil, electrico=electrico, notas=notas, uds=uds,
                                modelo=modelo or getattr(subs, "modelo", None)))
        return pid

    def cable(self, nombre, puntos, radio, color, movil="cajon_componentes", tipo="cable", estilo=None, w=None, de=None, a=None, **extra):
        """estilo: cómo lo dibuja el visor (pvc, verdeamarillo, hdmi, trenzado, coax, ffc, silicona, par…);
        w: número de conexión del esquema (W2, W11…); de / a: qué une, para la verificación."""
        self.cables.append(dict(nombre=nombre, puntos=[tuple(round(c, 2) for c in p) for p in puntos],
                                radio=radio, color=color, movil=movil, tipo=tipo, estilo=estilo or tipo, w=w, de=de, a=a, **extra))


# ============================================================================ COMPRAS (lista común)
COMPRAS = {
    # electrónica (lista v7 + cambios de esta versión)
    "E01": ("Pantalla GeeekPi 7\" 1024×600 EP-0170", "B0CHMBCCJB", 45.99),
    "E02": ("SumUp Solo", "B0C9V3LXTF", 72.18),
    "E03": ("Raspberry Pi Camera Module 3 (estándar)", "B0BRY6MVXL", 48.04),
    "E04": ("Raspberry Pi 3B+", "B0BNJPL4MW", 54.90),
    "E05": ("Adaptador Wi-Fi AR9271 con antena", "B0CBW6THN1", 16.24),
    "E06": ("Fuente Mean Well LRS-50-5", "B06XWRCWZ9", 18.52),
    "E07": ("Toma C14 con portafusibles, sin interruptor (Cablepelado)", "B07CQ54BY4", 8.03),
    "E08": ("WAGO 221-415 (kit 221)", "B09XB58ZXJ", 27.08),
    "E09": ("Borne USB-A hembra a tornillo", "B07V86XPL4", 10.99),
    "E10": ("Portafusibles en línea mini + fusibles", "B07Q495GQG", 9.49),
    "E11": ("Sensor de alcohol Winsen ZE29A", "B0H8NVXVG5", 108.46),
    "E12": ("Alargo RP-SMA 30 cm (pasamuros)", "B0FJRPC7MN", 9.99),
    "E13": ("Tubo de silicona 6 mm", "B0D9FJY1SG", 6.99),
    "E14": ("Conector en T para tubo 6 mm", "B0GT5XPRWK", 4.74),
    "E15": ("Reductor de latón 6→4 mm (restricción)", "B0H38RDVZR", 8.20),
    "E16": ("Cable HDMI 30 cm acodado 90°", "B09XHW8C8W", 8.09),
    "E17": ("Cable USB-A → USB-C acodado 30 cm", "B0C8FS5FV2", 4.99),
    "E18": ("Latiguillo micro-USB 22 AWG", "B0DP2NT8LY", 8.49),
    "E19": ("Cable JST-XH 4 pines (sensor)", "B0CBWZNP6Z", 8.99),
    "E20": ("Fusibles mini 2 A / 3 A (kit)", "B0BMGBBPTT", 15.99),
    "E21": ("microSD SanDisk High Endurance 32 GB", "B07P14QHB7", 20.49),
    "E22": ("Cable Schuko → C13", "B00AOAJAUC", 7.00),
    # herrajes
    "H01": ("Silentblock M4 10×10 (4 uds.)", "B07QK5M755", 9.33),
    "H02": ("Topes de goma adhesivos 10×3 mm", "B0CHNRVG2Z", 6.29),
    "H03": ("Cerradura de leva 16 mm con llave", "B0CRRBYJ2Y", 6.99),
    "H04": ("Bisagra de piano inox 30 cm", "B0D8KDZLPN", 9.99),
    "H05": ("Tirador inox 96 mm", "B0DLKMHLX8", 11.98),
    "H06": ("Espárrago M4×10 soldable (PC)", "B0GSCLY4D7", 7.87),
    "H07": ("Espárrago M4×20 soldable (soportes y tierra)", "B0GSCLY4D7", 8.40),
    "H08": ("Separadores M2 nylon (cámara)", "B0FVLLN788", 8.99),
    "H09": ("Separadores M2.5 nylon (Pi)", "B0G4G7WQRM", 9.99),
    "H10": ("Pasacables de goma (kit)", "B0B5DLWVZ2", 7.99),
    "H11": ("Placa de policarbonato 5 mm 1000×1000", "B08CGMX1B6", 94.33),
    "H12": ("Tuercas M4 inox (del surtido de tornillería M06)", "", 0.0),
    "H13": ("Perfil de goma en U para cantos", "B0FPQMRG8J", 9.99),
    "H14": ("Tirafondo hexagonal 6 × 60 DIN 571 (30 uds.)", "B0B61JZ25M", 12.35),
    "H15": ("Arandela ancha M6 DIN 9021 inox (25 uds.)", "B07Q5TVVMJ", 9.69),
    "H16": ("Taco de nylon fischer SX Plus 8 × 40 (100 uds.)", "B0C43ZLBNM", 7.29),
    "H17": ("Tornillo de seguridad Torx con pin M4 × 16, cabeza plana, inox (20 uds.)", "B0GGSDJMYV", 9.19),
    "H18": ("Candado ABUS 65/30 de latón, pack de 2 con la misma llave", "B01H9Z6HB4", 20.59),
}


BOCALLAVE = (19.0, 6.5, 20.0)        # Ø de paso (cabeza + arandela ancha), ancho y largo de la ranura


def fijaciones_pared(W, z_arriba):
    """18 agujeros redondos Ø6,5 para la pared: 3 columnas (x = -85, 0, 85) × 6 filas.
    3 filas detrás del cajón de pajitas (z = 25, 75, 125) y 3 detrás del cajón de componentes (z = 205, 295 y la de arriba,
    10 mm por debajo del borde del cajón); se evitan la bandeja, el pasamuros de la antena y el saliente de la tapa interior."""
    xs = (-(W / 2 - 25), 0.0, W / 2 - 25)
    zs = (25.0, 75.0, 125.0, 205.0, 295.0, z_arriba)
    return [(x, z, False) for z in zs for x in xs]


ZA_CANDADOS = (40.0, 110.0)          # altura de los dos pares de anillas del cajón de pajitas


def candado_30(xh, yh, z0, z1):
    """Candado ABUS 65/30: cuerpo 30 × 15 × 30 mm, arco Ø5 con 20 mm entre patas. Una pata pasa por los agujeros
    (xh, yh) de las dos anillas (de z0 a z1) y la otra queda por fuera; el cuerpo cuelga debajo."""
    zc = z0 - 4.0                       # cara de arriba del cuerpo
    zp = z1 + 6.0                       # eje del puente del arco
    xo = xh - 20.0
    patas = [cyl(2.5, zp - zc, (x, yh, zc), (0, 0, 1)) for x in (xh, xo)]
    puente = cyl(2.5, 25.0, (xh + 2.5, yh, zp), (-1, 0, 0))
    cuerpo = box(xh - 25, xh + 5, yh - 7.5, yh + 7.5, zc - 30, zc)
    return [("cuerpo", cuerpo, C.LATON), ("arco", fuse(patas + [puente]), C.METAL)]


def tornillo_pared(p):
    """Tirafondo hexagonal 6 × 60 (DIN 571, cabeza de 10 mm entre caras y 4 mm de alto) por dentro de la trasera,
    sobre una arandela ancha; la caña entra en el taco de la pared."""
    x, y, z = p
    cab = cq.Workplane("XZ", origin=(x, y - 1.6, z)).polygon(6, 10.0 / math.cos(math.radians(30))).extrude(4.0).val()
    return [("cabeza", cab, C.METAL), ("cana", cyl(3.0, 56.0, (x, y - 1.6, z), (0, 1, 0)), C.METAL)]


def tuerca_m4(p):
    """Tuerca hexagonal M4 (7 mm entre caras, 3,2 mm de alto). Crece hacia +Y desde p."""
    return cq.Workplane("XZ", origin=(p[0], p[1] + TUERCA, p[2])).polygon(6, 7.0 / math.cos(math.radians(30))).extrude(TUERCA).val()


def tuerca_ciega(p):
    """Tuerca ciega M4 (DIN 1587): hexágono de 7 mm entre caras, 4 mm de alto, y cúpula Ø7. Crece hacia -Y."""
    hexa = cq.Workplane("XZ", origin=(p[0], p[1], p[2])).polygon(6, 7.0 / math.cos(math.radians(30))).extrude(4.0).val()
    cup = cq.Solid.makeSphere(3.5, cq.Vector(p[0], p[1] - 4.0, p[2]))
    return hexa.fuse(cup).clean()


# ============================================================================ CONSTRUCTOR
def construir(spec):
    """spec: diccionario con medidas y colocación de componentes (ver diseños A, B y C)."""
    m = Modelo(spec["letra"], spec["nombre"], spec["descripcion"])
    W, D = spec["W"], spec["D"]
    tapa = spec["tapa"]                       # "lateral" (abatible) | "extraible"
    bis = spec.get("bisagra", "izq")          # lado de la bisagra de la tapa lateral
    Hk = spec["Hk"]                           # alto del cajón de componentes (de base a borde)
    Kz0 = ZS1 + SB_H                          # cara inferior de la base del cajón
    Ktop = Kz0 + Hk
    gb = (TIRA + 1.0) if tapa == "extraible" else spec.get("gb", 14.0)   # hueco detrás del cajón
    Kx0, Kx1 = -W / 2 + T + GS_L, W / 2 - T - GS_R
    Ky0, Ky1 = T + GF, D - T - gb
    zi0 = Ktop + AIRE_TI                      # cara de abajo de la tapa interior plana
    Hp = zi0 + T                              # alto del panel frontal: a ras de la tapa interior plana
    ys0, ys1 = T + 2.5, D - T - 7.5           # ranura de la tapa interior: deja 2,5 mm de chapa delante y 7,5 mm detrás
    y_sb = Ky1 + 1.5                          # el saliente trasero llega hasta 1,5 mm del cajón
    Hw = Hp + BANDA                           # alto de laterales y trasera
    Hr = Hw
    zl = (Hp + 0.5 + Hw) / 2                  # eje de las cerraduras
    if tapa == "extraible":
        cer = [(-(W / 2 - X_CER), -1), (W / 2 - X_CER, 1)]
    else:
        cer = [((W / 2 - X_CER), 1)] if bis == "izq" else [(-(W / 2 - X_CER), -1)]
    lado_ant = 1 if (tapa == "extraible" or bis == "izq") else -1
    y_ant, z_ant = D - T - gb / 2, Hw - 98.5
    m.cotas.update(W=W, D=D, H=Hw + T, Hp=Hp, Hw=Hw, Hr=Hr, Ktop=Ktop, Kz0=Kz0, Kx0=Kx0, Kx1=Kx1, Ky0=Ky0, Ky1=Ky1)
    # sistema local del cajón de componentes: x igual, y=0 cara trasera de la chapa frontal, z=0 cara de la base
    OX, OY, OZ = 0.0, Ky0 + T, Kz0 + T
    Yin = (Ky1 - T) - OY                      # fondo útil interior del cajón
    Xin0, Xin1 = Kx0 + T, Kx1 - T
    m.cotas.update(Yin=Yin, Xin0=Xin0, Xin1=Xin1, OY=OY, OZ=OZ)

    def L(x, y, z):                           # local cajón -> mundo
        return (x + OX, y + OY, z + OZ)

    lay = spec["layout"](dict(Xin0=Xin0, Xin1=Xin1, Yin=Yin, Hk=Hk, W=W, D=D))
    # posiciones en mundo de lo que se ve de frente
    scr = lay["pantalla"]                     # (x izq, z abajo)  local cajón
    sol = lay["solo"]
    cam = lay["camara"]                       # (x, z) de la esquina inferior izquierda de la placa
    boq = lay["boquilla"]                     # (x, z) centro
    act_c = (scr[0] + 82.5, scr[1] + 50.0)    # centro del área activa (local)
    solo_c = (sol[0] + C.SOLO["w"] / 2, sol[1] + C.SOLO["h"] / 2)
    lens = (cam[0] + C.CAM["lente_x"], cam[1] + C.CAM["lente_z"])
    VENT_P = (159.0, 91.0)                    # ventana de pantalla en panel y cajón
    VENT_S_PANEL, VENT_S_CAJ = 85.0, 81.0
    D_CAM_P, D_CAM_K, D_BOQ_P, D_BOQ_K = 12.0, 12.0, 10.0, 10.0
    zc = lambda zl: zl + OZ
    m.cotas.update(pantalla_centro=(act_c[0], zc(act_c[1])), solo_centro=(solo_c[0], zc(solo_c[1])),
                   lente=(lens[0], zc(lens[1])), boquilla=(boq[0], zc(boq[1])))

    # ------------------------------------------------------------------ CARCASA
    # policarbonatos (uno delante y otro detrás del panel) y sus 10 tornillos pasantes
    pcz0 = min(zc(act_c[1]) - VENT_P[1] / 2, zc(solo_c[1]) - VENT_S_PANEL / 2, zc(boq[1]) - 6) - 14
    pcz1 = max(zc(act_c[1]) + VENT_P[1] / 2, zc(solo_c[1]) + VENT_S_PANEL / 2, zc(lens[1]) + 6) + 14
    pcz1 = min(pcz1, Hp - 6)
    pcx0, pcx1 = -W / 2 + 7, W / 2 - 7
    studs = []
    nx = max(2, math.ceil((pcx1 - pcx0 - 16) / 95) + 1)
    nz = max(2, math.ceil((pcz1 - pcz0 - 16) / 95) + 1)
    for i in range(nx):
        x = pcx0 + 8 + i * (pcx1 - pcx0 - 16) / (nx - 1)
        studs += [(x, pcz0 + 8), (x, pcz1 - 8)]
    for j in range(1, nz - 1):
        z = pcz0 + 8 + j * (pcz1 - pcz0 - 16) / (nz - 1)
        studs += [(pcx0 + 8, z), (pcx1 - 8, z)]
    # panel frontal
    p = box(-W / 2, W / 2, 0, T, 0, Hp)
    cuts = [box(act_c[0] - VENT_P[0] / 2, act_c[0] + VENT_P[0] / 2, -5, 5, zc(act_c[1]) - VENT_P[1] / 2, zc(act_c[1]) + VENT_P[1] / 2),
            box(solo_c[0] - VENT_S_PANEL / 2, solo_c[0] + VENT_S_PANEL / 2, -5, 5, zc(solo_c[1]) - VENT_S_PANEL / 2, zc(solo_c[1]) + VENT_S_PANEL / 2),
            hole_y(lens[0], zc(lens[1]), D_CAM_P), hole_y(boq[0], zc(boq[1]), D_BOQ_P)]
    cuts += [hole_y(x, z, 4.5) for x, z in studs]
    # ranuras de pajitas, centradas en los compartimentos del cajón de pajitas
    dr = cajon_pajitas_medidas(W, D)
    for xc in dr["centros"]:
        cuts.append(slot_y(xc, dr["z_ran"], dr["L_ran"], dr["A_ran"]))
    p = cut_all(p, cuts)
    m.fab("C", "Panel frontal", p, COL_CHAPA_OSC,
          notas="Ventanas de pantalla, Solo, cámara y boquilla; 10 × Ø4,5 de los tornillos de los policarbonatos; 3 ranuras de pajitas")
    avellanado = lambda x, z, r: cq.Solid.makeCone(r + 2.25, r, 2.25, cq.Vector(x, -PC_T - 0.01, z), cq.Vector(0, 1, 0))
    pe = box(pcx0, pcx1, -PC_T, 0, pcz0, pcz1)                 # policarbonato exterior, apoyado en el panel
    pe = cut_all(pe, [hole_y(x, z, 4.5) for x, z in studs] + [avellanado(x, z, 2.25) for x, z in studs]
                 + [hole_y(boq[0], zc(boq[1]), 7.0), avellanado(boq[0], zc(boq[1]), 3.5)])
    m.fab("V", "Policarbonato exterior 5 mm (delante del panel)", pe, COL_PC, material="Policarbonato compacto 5 mm",
          proceso="Corte CNC + taladros", espesor=PC_T,
          notas="10 × Ø4,5 avellanados a Ø8,5 por delante (tornillos de cabeza plana a ras); boquilla Ø7 avellanada")
    pi = box(pcx0, pcx1, T, T + PC_T, pcz0, pcz1)              # policarbonato interior, pegado a la cara de dentro del panel
    pi = cut_all(pi, [hole_y(x, z, 5.0) for x, z in studs] + [hole_y(boq[0], zc(boq[1]), 7.0)])
    m.fab("V", "Policarbonato interior 5 mm (detrás del panel)", pi, COL_PC, material="Policarbonato compacto 5 mm",
          proceso="Corte CNC + taladros", espesor=PC_T, notas="Entre el panel y el cajón de componentes; Ø5 de los tornillos; boquilla Ø7")
    for x, z in studs:
        cab = cq.Solid.makeCone(4.0, 2.0, 2.0, cq.Vector(x, -PC_T, z), cq.Vector(0, 1, 0))
        m.compra("H17", "Tornillo de seguridad M4 × 16 (Torx con pin, cabeza plana)",
                 [("tornillo", cab.fuse(cyl(2.0, 16.0, (x, -PC_T, z), (0, 1, 0))).clean(), C.METAL)],
                 modelo=dict(n="torx_m4", a=[16, [0, 1, 0]], tf=dict(ex=[1, 0, 0], ey=[0, 1, 0], ez=[0, 0, 1], at=[x, -PC_T, z])),
                 notas="Atraviesa policarbonato exterior, panel y policarbonato interior; tuerca por dentro")
        m.compra("H12", "Tuerca M4 con fijador de roscas", [("tuerca", tuerca_m4((x, T + PC_T, z)), C.METAL)],
                 modelo=dict(n="tuerca_m4", a=[[0, 1, 0]], tf=dict(ex=[1, 0, 0], ey=[0, 1, 0], ez=[0, 0, 1], at=[x, T + PC_T, z])))
    m.cotas["pc"] = (pcx1 - pcx0, pcz1 - pcz0)
    # trasera: 18 tornillos a la pared (3 columnas × 6 filas), agujeros redondos; se aprietan desde dentro con arandela ancha
    fij = fijaciones_pared(W, Ktop - 10.0)
    t = box(-W / 2, W / 2, D - T, D, 0, Hw)
    t = cut_all(t, [keyhole_y(x, z, BOCALLAVE[0], BOCALLAVE[1], BOCALLAVE[2]) if bl else hole_y(x, z, 6.5) for x, z, bl in fij])
    m.fab("C", "Trasera", t, COL_CHAPA,
          notas="18 agujeros Ø6,5 para la pared (3 columnas × 6 filas). Tirafondo 6 × 60 con taco de 8 mm y arandela ancha M6, apretados desde dentro")
    m.cotas["fijaciones_pared"] = [(x, z) for x, z, bl in fij]
    # laterales
    hz = ZS0 - 0.0
    li = box(-W / 2, -W / 2 + T, T, D - T, T, Hw)
    cuts = [box(-W / 2 - 1, -W / 2 + T + 1, T + 15.0, D - T + 1, 0, Z_HUECO)]      # hueco del cajón de pajitas
    ex = lay["escape"]                                                            # (y, z local) del escape
    esc_izq = lay.get("escape_lado", "izq") == "izq"
    rej_esc = [hole_x(ex[0] + OY + dy, zc(ex[1]) + dz, 4.0)                       # rejilla de escape: 7 agujeros Ø4
               for dy, dz in ((0, 0), (-6, 0), (6, 0), (0, -6), (0, 6), (-6, -6), (6, 6))]
    if esc_izq:
        cuts += rej_esc
    for z0, z1 in lay["rejillas_izq"]:
        cuts += vent_slots_x(Ky0 + 12, Ky1 - 12, zc(z0), zc(z1))
    cuts += [box(-W / 2 - 5, -W / 2 + 5, 15.0, 19.0, zl - 7, zl + 7) for x, sg in cer if sg < 0]
    if lado_ant < 0:
        cuts.append(hole_x(y_ant, z_ant, 6.5))
    li = cut_all(li, cuts)
    m.fab("C", "Lateral izquierdo", li, COL_CHAPA, notas="Hueco del cajón de pajitas, rejilla de escape del soplido y rejillas de ventilación"
          + ("; ranura 4×14 de la leva" if any(sg < 0 for _, sg in cer) else "") + ("; agujero Ø6,5 de la antena" if lado_ant < 0 else ""))
    ld = box(W / 2 - T, W / 2, T, D - T, T, Hr)
    c14 = lay["c14"]                                                              # (y, z) local del centro de la toma
    VENT_C14 = (38.0, 46.0)                                                       # ventana del enchufe (y × z)
    cuts = [box(W / 2 - 5, W / 2 + 5, c14[0] + OY - VENT_C14[0] / 2, c14[0] + OY + VENT_C14[0] / 2,
                zc(c14[1]) - VENT_C14[1] / 2, zc(c14[1]) + VENT_C14[1] / 2)]
    for z0, z1 in lay["rejillas_der"]:
        cuts += vent_slots_x(Ky0 + 12, Ky1 - 12, zc(z0), zc(z1))
    if not esc_izq:
        cuts += rej_esc
    cuts += [box(W / 2 - 5, W / 2 + 5, 15.0, 19.0, zl - 7, zl + 7) for x, sg in cer if sg > 0]
    if lado_ant > 0:
        cuts.append(hole_x(y_ant, z_ant, 6.5))
    # ranura por la que entra la tapa interior y, encima, una muesca R8 para empujarla con el dedo
    zr0, zr1 = zi0 - HOLG_TI, zi0 + T + HOLG_TI
    ym = (ys0 + ys1) / 2
    cuts.append(box(W / 2 - 5, W / 2 + 5, ys0, ys1, zr0, zr1))
    cuts.append(hole_x(ym, zr1, 16.0).intersect(box(W / 2 - 5, W / 2 + 5, ym - 9, ym + 9, zr1, zr1 + 9)))
    ld = cut_all(ld, cuts)
    m.cotas["ranura_tapa_interior"] = dict(y=(ys0, ys1), z=(zr0, zr1), largo=ys1 - ys0, alto=zr1 - zr0)
    m.fab("C", "Lateral derecho", ld, COL_CHAPA, notas=f"Ventana del enchufe de la toma C14 ({VENT_C14[0]:.0f} × {VENT_C14[1]:.0f}), rejillas, "
          f"ranura {zr1 - zr0:.1f} × {ys1 - ys0:.0f} de la tapa interior con muesca R8 encima"
          + ("; ranura 4×14 de la leva" if any(sg > 0 for _, sg in cer) else "") + ("; agujero Ø6,5 de la antena" if lado_ant > 0 else ""))
    # suelo y bandeja
    m.fab("C", "Suelo", box(-W / 2, W / 2, T, D - T, 0, T), COL_CHAPA)
    sb_pos = [(Kx0 + 16, Ky0 + 14), (Kx1 - 16, Ky0 + 14), (Kx0 + 16, Ky1 - 14), (Kx1 - 16, Ky1 - 14)]
    ba = box(-W / 2 + T, W / 2 - T, T, D - T, ZS0, ZS1)
    ba = cut_all(ba, [hole_z(x, y, 4.5) for x, y in sb_pos])
    m.fab("C", "Bandeja (suelo de la zona de componentes)", ba, COL_CHAPA, notas="4 agujeros Ø4,5 para los silentblocks")
    if tapa == "extraible":
        tira = box(-W / 2, W / 2, D - TIRA, D, Hw, Hw + T)
        m.fab("C", "Tira trasera fija del techo", tira, COL_CHAPA, notas="Las lengüetas de la tapa entran por debajo")
    # guías traseras: dos pletinas verticales soldadas a la trasera topan el cajón por detrás
    for sg in (-1, 1):
        x = sg * (W / 2 - 40)
        gu = box(x - T / 2, x + T / 2, Ky1 + 0.5 + TOPE, D - T, Kz0, Ktop - 10)
        m.fab("C", f"Guía trasera {'izquierda' if sg < 0 else 'derecha'}", gu, COL_CHAPA,
              notas="Pletina vertical soldada a la trasera; un tope de goma en su canto delantero")
        m.compra("H02", "Tope de goma 10×3", place_parts(C.tope_goma((0, -1, 0)), at=(x, Ky1 + 0.5 + TOPE, Kz0 + Hk / 2)))
    # espárrago de tierra de la carcasa: en la trasera, detrás del cajón
    pe_h = (W / 2 - 60, D - T, Ktop - 25)
    m.compra("H07", "Espárrago de tierra M4 cortado a 8 mm (carcasa)", place_parts(C.esparrago_m4(8, (0, -1, 0)), at=pe_h), electrico=True,
             notas="Del kit M4×20, cortado a 8 mm: con 11 mm detrás del cajón, uno de 10 quedaría a 1 mm de su trasera")
    m.cotas["pe_carcasa"] = pe_h
    # silentblocks
    for x, y in sb_pos:
        m.compra("H01", "Silentblock M4 10×10", place_parts(C.silentblock(), at=(x, y, ZS1)))

    # ------------------------------------------------------------------ TAPA INTERIOR PLANA (antipolvo, deslizante)
    mti = "tapa_interior"
    ti = box(-W / 2 + T + 0.2, W / 2, ys0 + 0.2, ys1 - 0.2, zi0, zi0 + T)
    m.fab("T", "Tapa interior plana (antipolvo, deslizante)", ti, COL_TAPA, movil=mti,
          notas="Chapa lisa sin agujeros. Entra deslizando por la ranura del lateral derecho, apoya en los salientes "
                "y hace tope en el lateral izquierdo; queda a ras por fuera. Con la tapa cerrada el faldón derecho tapa la ranura. "
                "Para sacarla: abrir la tapa, empujar con el dedo desde la muesca y tirar hacia la derecha (hacen falta ~23 cm libres a ese lado)")
    sal = [("Saliente delantero (tapa interior)", box(-W / 2 + T, W / 2 - T, T, T + 5.0, zi0 - T, zi0),
            "Soldado a la cara interior del panel frontal; 5 mm de vuelo. Hace de guía de la tapa interior"),
           ("Saliente trasero (tapa interior)", box(-W / 2 + T, W / 2 - T, y_sb, D - T, zi0 - T, zi0),
            f"Soldado a la trasera; {D - T - y_sb:.1f} mm de vuelo. Hace de guía de la tapa interior")]
    for k, (y0, y1) in enumerate(((33.0, 68.0), (83.0, y_sb))):
        sal.append((f"Saliente izquierdo {k + 1} (tapa interior)", box(-W / 2 + T, -W / 2 + T + 2.5, y0, y1, zi0 - T, zi0),
                    "Soldado al lateral izquierdo; 2,5 mm de vuelo (deja pasar el cajón y sus topes)"))
    for nom, sh, nt in sal:
        m.fab("C", nom, sh, COL_CHAPA, notas=nt)
    m.cotas["tapa_interior_z"] = zi0

    # ------------------------------------------------------------------ TAPA
    construir_tapa(m, spec, W, D, Hp, Hw, cer, zl)

    # ------------------------------------------------------------------ CAJÓN DE PAJITAS
    construir_cajon_pajitas(m, W, D, dr)

    # ------------------------------------------------------------------ CAJÓN DE COMPONENTES
    mv = "cajon_componentes"
    base = box(Kx0, Kx1, Ky0, Ky1, Kz0, Kz0 + T)
    bc = [hole_z(x, y, 6.0) for x, y in sb_pos]
    rb = lay["red"]                                                  # caja de red: x0 local, alto
    bc += vent_slots_z(rb["x0"] + 10, Xin1 - 40, Yin - 34 + OY, Yin - 4 + OY, L=18, pitch_y=10)
    base = cut_all(base, bc)
    m.fab("K", "Base del cajón", base, COL_CART, movil=mv, notas="4 agujeros Ø6 que encajan en los silentblocks; rejilla bajo la fuente")
    fr = box(Kx0, Kx1, Ky0, Ky0 + T, Kz0 + T, Ktop)
    cuts = [box(act_c[0] - VENT_P[0] / 2, act_c[0] + VENT_P[0] / 2, 0, 50, zc(act_c[1]) - VENT_P[1] / 2, zc(act_c[1]) + VENT_P[1] / 2),
            box(solo_c[0] - VENT_S_CAJ / 2, solo_c[0] + VENT_S_CAJ / 2, 0, 50, zc(solo_c[1]) - VENT_S_CAJ / 2, zc(solo_c[1]) + VENT_S_CAJ / 2),
            hole_y(lens[0], zc(lens[1]), D_CAM_K), hole_y(boq[0], zc(boq[1]), D_BOQ_K)]
    for ax, az in [(2, 2), (23, 2), (2, C.CAM["h"] - 9.5), (23, C.CAM["h"] - 9.5)]:
        cuts.append(hole_y(cam[0] + ax, zc(cam[1] + az), 2.4))
    fr = cut_all(fr, cuts)
    m.fab("K", "Frente del cajón", fr, COL_CART, movil=mv, notas="Sujeta pantalla, Solo y cámara a ras del panel; tornillos M2 avellanados de la cámara")
    tr = box(Kx0, Kx1, Ky1 - T, Ky1, Kz0 + T, Ktop)
    tcuts = []
    for hx, hz in lay["agujeros_trasera"]:
        tcuts.append(hole_y(hx, zc(hz), 3.4))
    for sx, sz in lay["bridas_trasera"]:
        tcuts += [slot_y(sx - 6, zc(sz), 3.2, 8.0, horizontal=False), slot_y(sx + 6, zc(sz), 3.2, 8.0, horizontal=False)]
    tr = cut_all(tr, tcuts)
    m.fab("K", "Trasera del cajón", tr, COL_CART, movil=mv, notas="Taladros de la fuente (M3) y de la Pi (M2,5); pares de ranuras para bridas")
    lz = box(Kx0, Kx0 + T, Ky0 + T, Ky1 - T, Kz0 + T, Ktop)
    lzc = [hole_x(ex[0] + OY, zc(ex[1]), 12.0)] if esc_izq else []
    for z0, z1 in lay["rejillas_izq"]:
        lzc += vent_slots_x(Ky0 + 12, Ky1 - 12, zc(z0), zc(z1))
    lz = cut_all(lz, lzc)
    m.fab("K", "Lateral izquierdo del cajón", lz, COL_CART, movil=mv, notas=("Paso del tubo de escape Ø12 con pasacables y rejillas" if esc_izq else "Rejillas"))
    rz = box(Kx1 - T, Kx1, Ky0 + T, Ky1 - T, Kz0 + T, Ktop)
    cw, chh = C.C14["cuerpo"][0], C.C14["cuerpo"][1]
    rzc = [box(Kx1 - 5, Kx1 + 5, c14[0] + OY - chh / 2 - 0.2, c14[0] + OY + chh / 2 + 0.2, zc(c14[1]) - cw / 2 - 0.2, zc(c14[1]) + cw / 2 + 0.2)]
    for ax, az in C.C14["agujeros"]:
        rzc.append(hole_x(c14[0] + OY - az, zc(c14[1]) + ax, 3.4))
    for z0, z1 in lay["rejillas_der"]:
        rzc += vent_slots_x(Ky0 + 12, Ky1 - 12, zc(z0), zc(z1))
    if not esc_izq:
        rzc.append(hole_x(ex[0] + OY, zc(ex[1]), 12.0))
    rz = cut_all(rz, rzc)
    m.fab("K", "Lateral derecho del cajón", rz, COL_CART, movil=mv,
          notas=f"Recorte de la toma C14 ({chh + 0.4:.2f} × {cw + 0.4:.2f}, ancho × alto) y 2 taladros M3 a 36 mm, uno encima de otro")
    # sin asa: dos asideros (chapa de 3 mm con agujero para dos dedos) a ras del borde de arriba, por dentro de los laterales
    for nom, x0, x1, y0, y1, yh, yt in (("Asidero izquierdo", Kx0 + T, Kx0 + T + 30, 8 + OY, 48 + OY, 20 + OY, 38 + OY),
                                        ("Asidero derecho", Kx1 - T - 30, Kx1 - T, Yin - 43 + OY, Yin - 3 + OY, Yin - 31 + OY, Yin - 13 + OY)):
        xh = (x0 + x1) / 2
        asd = cut_all(box(x0, x1, y0, y1, Ktop - 3.0, Ktop), [hole_z(xh, yh, 22.0)])
        m.fab("K", nom, asd, COL_CART, material="Acero DC01 3 mm", movil=mv, espesor=3.0,
              notas="Soldado por dentro del lateral, a ras del borde. Agujero Ø22 para meter dos dedos y levantar el cajón")
        m.compra("H02", "Tope de goma 10×3", place_parts(C.tope_goma((0, 0, 1)), at=(xh, yt, Ktop)), movil=mv,
                 notas="Queda 3 mm por debajo de la tapa interior (que pasa por encima al deslizar); si el cajón se levanta, topa con ella")
    # topes laterales y delanteros del cajón
    c14w = (lay["c14"][0] + OY, zc(lay["c14"][1]))
    bx_c14, bz_c14 = C.C14["brida"][1] / 2, C.C14["brida"][0] / 2                  # media brida en y y en z
    def libre_c14(yy, zz):
        return abs(yy - c14w[0]) > bx_c14 + 5 + 1 or abs(zz - c14w[1]) > bz_c14 + 5 + 1
    for zz in (Kz0 + 25, Ktop - 25):
        for yy in (Ky0 + 12, Ky1 - 12):
            m.compra("H02", "Tope de goma 10×3", place_parts(C.tope_goma((-1, 0, 0)), at=(Kx0, yy, zz)), movil=mv)
            z2 = zz if libre_c14(yy, zz) else (c14w[1] + bz_c14 + 8)
            m.compra("H02", "Tope de goma 10×3 (dos, uno encima de otro)", place_parts(C.tope_goma((1, 0, 0), 6.0), at=(Kx1, yy, z2)), movil=mv, uds=2)
        for xx in lay["topes_frente"]:
            m.compra("H02", "Tope de goma 10×3 (dos, uno encima de otro)", place_parts(C.tope_goma((0, -1, 0), 6.0), at=(xx, Ky0, zz)),
                     movil=mv, uds=2, notas="Apoya en la cara trasera del policarbonato")

    # caja de red (fuente + C14): tapa, frente y lateral
    yr0 = Yin - rb["fondo"]                                          # cara delantera interior de la caja de red (local)
    hr = rb["alto"]
    xr0 = rb["x0"]
    tp = box(xr0 - T, Xin1, yr0 - T + OY, Yin + OY, zc(hr), zc(hr) + T)
    tpc = [hole_z(gx, gy + OY, 12.0) for gx, gy in rb["pasacables"]]
    tpc += [slot_z(xb, yr0 + 9 + OY, 3.2, 8.0, "y") for xb in rb["bridas_tapa"]]
    tp = cut_all(tp, tpc)
    m.fab("K", "Tapa de la caja de red (230 V)", tp, COL_RED, movil=mv,
          notas="Cierra la fuente y la C14 por arriba; pasacables para 5 V y tierra; encima van WAGO, fusibles y bornes USB")
    fp = box(xr0 - T, Xin1, yr0 - T + OY, yr0 + OY, zc(0), zc(hr))
    fpc = vent_slots_y(rb["vent_x"][0], rb["vent_x"][1], zc(rb["vent_z"][0]), zc(rb["vent_z"][1]), L=20)
    fpc += [hole_y(gx, zc(gz), 12.0) for gx, gz in rb.get("pasacables_frente", [])]
    fp = cut_all(fp, fpc)
    m.fab("K", "Frente de la caja de red", fp, COL_RED, movil=mv, notas="Rejilla de ventilación abajo")
    lp = box(xr0 - T, xr0, yr0 + OY, Yin + OY, zc(0), zc(hr))
    m.fab("K", "Lateral de la caja de red", lp, COL_RED, movil=mv,
          notas="Tapa, frente y lateral de la caja de red se sueldan entre sí: forman una tapa en U que se quita con 2 tuercas M4")
    # fijación de la tapa en U: dos pestañas soldadas abajo, atornilladas a espárragos M4×10 soldados en la base
    fij = [("Pestaña de fijación de la caja de red (derecha)", Xin1 - 32, Xin1 - 12, yr0, yr0 + 14),
           ("Pestaña de fijación de la caja de red (izquierda)", xr0 - T - 14, xr0 - T) + tuple(rb.get("fij_izq_y", (Yin - 22, Yin - 2)))]
    for nom, x0, x1, y0, y1 in fij:
        xc, yc = (x0 + x1) / 2, (y0 + y1) / 2
        tab = cut_all(box(x0, x1, y0 + OY, y1 + OY, zc(0), zc(0) + T), [hole_z(xc, yc + OY, 4.5)])
        m.fab("K", nom, tab, COL_RED, movil=mv, notas="Soldada al borde inferior de la tapa en U; taladro Ø4,5 para el espárrago M4 de la base")
        m.compra("H06", "Espárrago M4×10 (fija la caja de red)", place_parts(C.esparrago_m4(10, (0, 0, 1)), at=(xc, yc + OY, zc(0))), movil=mv)

    # ------------------------------------------------------------------ COMPONENTES Y SOPORTES
    colocar_componentes(m, spec, lay, L, dict(OX=OX, OY=OY, OZ=OZ, Yin=Yin, Xin0=Xin0, Xin1=Xin1, Kx0=Kx0, Kx1=Kx1,
                                               Ky0=Ky0, Ky1=Ky1, Kz0=Kz0, Ktop=Ktop, Hw=Hw, W=W, D=D, pe_h=pe_h, tapa=tapa,
                                               lado_ant=lado_ant, y_ant=y_ant, z_ant=z_ant))
    # zona que barre la leva de cada cerradura al abrir (de horizontal a vertical hacia abajo): debe quedar libre
    for x, sg in cer:
        for ang in (0, 30, 60, 90):
            a = math.radians(ang)
            d = (sg * math.cos(a), 0, -math.sin(a))
            lv = place(box(-6, LEVA - 6, 16, 18, -6, 6), ex=d, ey=(0, 1, 0), ez=(-d[2], 0, d[0]), at=(x, 0, zl))
            m.zonas.append((f"Giro de la leva ({ang}°)", lv))
    # movimientos para el visor
    m.movil["cajon_componentes"] = dict(tipo="subir", recorrido=round(Hw + 40 - Kz0, 1))
    m.movil["cajon_pajitas"] = dict(tipo="izquierda", recorrido=round(dr["recorrido"], 1))
    return m


# ============================================================================ CAJÓN DE PAJITAS
def cajon_pajitas_medidas(W, D):
    """Cajón 'cartucho cerrado' del diseño anterior, ahora saliendo por la IZQUIERDA."""
    holg = 1.0
    x_tapa0, x_tapa1 = -W / 2, -W / 2 + T                      # tapa enrasada con el lateral izquierdo
    x_end = W / 2 - T - holg                                   # cara exterior del extremo (dentro, a la derecha)
    y_front = T + 15.0 + holg                                  # el frente pasa por detrás de la franja de 15 mm
    y_back = D - T - holg - 8.0          # 8 mm libres para las cabezas de los tornillos de pared
    zf0 = T + 0.3
    z_top = Z_TOP_P
    # 3 compartimentos iguales entre la tapa y el extremo
    xi0, xi1 = x_tapa1, x_end - T
    sep = [(xi0 + (xi1 - xi0) * k / 3) for k in (1, 2)]
    lim = [xi0] + sep + [xi1]
    centros = [(lim[k] + lim[k + 1]) / 2 for k in range(3)]
    ancho_comp = (xi1 - xi0) / 3
    L_ran = min(60.0, ancho_comp - 6)
    z_ran = zf0 + T + 3.5                                       # ranura a ras del fondo del cajón (pajita Ø6)
    return dict(x_tapa0=x_tapa0, x_tapa1=x_tapa1, x_end=x_end, y_front=y_front, y_back=y_back, zf0=zf0, z_top=z_top,
                sep=sep, centros=centros, L_ran=L_ran, A_ran=7.0, z_ran=z_ran, recorrido=x_end - x_tapa1 + 20)


def construir_cajon_pajitas(m, W, D, d):
    mv = "cajon_pajitas"
    zf0, zf1 = d["zf0"], d["zf0"] + T
    x0, x1 = d["x_tapa1"], d["x_end"]
    m.fab("P", "Fondo", box(x0, x1, d["y_front"], d["y_back"], zf0, zf1), COL_CAJON, movil=mv)
    fr = box(x0, x1, d["y_front"], d["y_front"] + T, zf1, d["z_top"])
    fr = cut_all(fr, [box(xc - d["L_ran"] / 2, xc + d["L_ran"] / 2, 0, 50, zf1, zf1 + d["A_ran"]) for xc in d["centros"]])
    m.fab("P", "Delantera (3 ventanas)", fr, COL_CAJON, movil=mv, notas="Ventanas alineadas con las ranuras del panel")
    m.fab("P", "Trasera", box(x0, x1, d["y_back"] - T, d["y_back"], zf1, d["z_top"]), COL_CAJON, movil=mv)
    m.fab("P", "Extremo derecho", box(x1 - T, x1, d["y_front"] + T, d["y_back"] - T, zf1, d["z_top"]), COL_CAJON, movil=mv)
    tapa = box(d["x_tapa0"], d["x_tapa1"], T + 15.0 + 0.5, D - T - 0.5, T + 0.3, Z_HUECO - 0.5)
    m.fab("P", "Tapa (cierra el hueco del lateral izquierdo)", tapa, COL_CAJON, movil=mv,
          notas="Sin tirador: se tira de las anillas de los candados")
    for k, xs in enumerate(d["sep"]):
        m.fab("P", f"Separador {k + 1}", box(xs - T / 2, xs + T / 2, d["y_front"] + T, d["y_back"] - T, zf1, d["z_top"]), COL_CAJON, movil=mv)
    # dos pares de anillas (chapa de 3 mm): una en la franja fija del lateral y otra en la tapa del cajón, una encima de la otra
    xe = -W / 2
    xh, yh = xe - 11.0, 9.0                                  # centro de los agujeros Ø9
    for k, z in enumerate(ZA_CANDADOS):
        fija = cut_all(box(xe - 18, xe, 3.0, 15.0, z, z + 3), [hole_z(xh, yh, 9.0)])
        m.fab("C", f"Anilla para candado {k + 1} (lateral)", fija, COL_CHAPA_OSC, material="Acero DC01 3 mm", espesor=3.0,
              notas="Soldada a la franja fija del lateral izquierdo, delante del hueco del cajón. Agujero Ø9")
        movil_ = cut_all(box(xe - 18, xe, 3.0, 30.0, z + 3.2, z + 6.2), [hole_z(xh, yh, 9.0)])
        m.fab("P", f"Anilla para candado {k + 1} (tapa del cajón)", movil_, COL_CAJON, material="Acero DC01 3 mm", movil=mv, espesor=3.0,
              notas="Soldada a la tapa del cajón; vuela por delante y queda encima de la anilla fija. También sirve de tirador")
        m.compra("H18", "Candado de latón 30 mm (cierre igualado)", candado_30(xh, yh, z, z + 6.2), movil="candado",
                 modelo=dict(n="candado_30", a=[xh, yh, z, z + 6.2], tf=dict(ex=[1, 0, 0], ey=[0, 1, 0], ez=[0, 0, 1], at=[0, 0, 0])),
                 notas="Se quita antes de sacar el cajón de pajitas")


# ============================================================================ TAPA
def construir_tapa(m, spec, W, D, Hp, Hw, cer, zl):
    """Dos tipos de tapa (la abatible hacia atrás se descartó: abierta, su faldón y su cerradura quedan
    encima del cajón y no lo dejan subir salvo que la máquina tenga ~30 mm más de fondo).
      lateral   : bisagra de piano en un canto lateral; abre ~105° y se queda apoyada en una pestaña de tope.
      extraible : 2 lengüetas traseras bajo una tira fija; se quita hacia delante y arriba."""
    tipo = spec["tapa"]
    mv = "tapa"
    # faldón delantero con las cerraduras (común a las dos)
    f = box(-W / 2, W / 2, 0, T, Hp + 0.5, Hw)
    f = cut_all(f, [hole_y(x, zl, 18.0) for x, sg in cer])
    n_c = len(cer)
    if tipo == "extraible":
        t = box(-W / 2, W / 2, 0, D - TIRA - 0.5, Hw, Hw + T)
        m.fab("T", "Tapa superior", t, COL_TAPA, movil=mv,
              notas="Se quita: se abren las 2 cerraduras, se tira 12 mm hacia delante (salen las lengüetas) y se levanta")
        m.fab("T", "Faldón delantero de la tapa", f, COL_TAPA, movil=mv, notas="2 taladros Ø18 de las cerraduras; soldado a la tapa")
        for sg in (-1, 1):
            m.fab("T", f"Lengüeta trasera {'izquierda' if sg < 0 else 'derecha'}",
                  box(sg * W / 4 - 15, sg * W / 4 + 15, D - TIRA - 12, D - TIRA + 10, Hw - T, Hw), COL_TAPA, movil=mv,
                  notas="Soldada bajo la tapa; entra 10 mm bajo la tira fija")
        m.movil["tapa"] = dict(tipo="quitar", ruta=[(0, -12, 0), (0, -12, 8), (0, -12, 70), (W + 60, -12, 70)])
    else:
        sg_b = -1 if spec.get("bisagra", "izq") == "izq" else 1      # lado de la bisagra
        assert sg_b < 0, "el faldón derecho (tapa de la ranura de la tapa interior) pide la bisagra a la izquierda"
        zi0 = m.cotas["tapa_interior_z"]
        t = box(-W / 2, W / 2 + 2.0, 0, D, Hw, Hw + T)
        m.fab("T", "Tapa superior", t, COL_TAPA, movil=mv,
              notas="Abre hacia la izquierda con bisagra de piano remachada; sobresale 2 mm por la derecha para el faldón derecho")
        f = cut_all(box(-W / 2, W / 2 + 0.5, 0, T, Hp + 0.5, Hw), [hole_y(x, zl, 18.0) for x, sg in cer])
        m.fab("T", "Faldón delantero de la tapa", f, COL_TAPA, movil=mv, notas="Taladro Ø18 de la cerradura; soldado a la tapa y al faldón derecho")
        fd = box(W / 2 + 0.5, W / 2 + 2.0, 0, D, zi0 - 4.0, Hw)
        m.fab("T", "Faldón derecho de la tapa", fd, COL_TAPA, movil=mv,
              notas="Soldado bajo el canto derecho de la tapa. Cerrada, tapa por fuera la ranura de la tapa interior y la de la leva: "
                    "la tapa interior no se puede sacar sin abrir con llave")
        xa, za = sg_b * (W / 2 + 1.25), Hw + T + 1.25
        def lado(x0, x1):            # caja en x medida desde el canto de la bisagra hacia fuera (+) o hacia dentro (-)
            u0, u1 = sg_b * (W / 2 + x0), sg_b * (W / 2 + x1)
            return min(u0, u1), max(u0, u1)
        L_b = D - 20
        nx0, nx1 = lado(-0.01, 0.01)
        hb_fija = [("nudo", cyl(2.25, L_b, (xa, 10, za), (0, 1, 0)), C.METAL),
                   ("ala_fija", box(*lado(0, 1), 10, D - 10, Hw - 15, Hw + T), C.METAL)]
        hb_movil = [("ala_movil", box(*lado(-15, 0), 10, D - 10, Hw + T, Hw + T + 1), C.METAL)]
        m.compra("H04", "Bisagra de piano (ala fija y nudo)", hb_fija)
        m.compra("H04", "Bisagra de piano (ala móvil, misma bisagra)", hb_movil, movil=mv, uds=0,
                 notas="Es la otra mitad de la bisagra anterior: la que gira con la tapa")
        # pestaña de tope (chapa de 3 mm en L): sobresale 9,75 mm por fuera de la bisagra, 1 mm por encima del nudo
        pe = box(*lado(-10, 0), 2.0, 5.0, Hw + T, Hw + T + 6).fuse(box(*lado(0, 9.75), 2.0, 5.0, Hw + T + 2.25, Hw + T + 6)).clean()
        m.fab("T", "Pestaña de tope de apertura", pe, COL_TAPA, material="Acero DC01 3 mm", movil=mv, espesor=3.0,
              notas="Soldada sobre la tapa, delante de la bisagra; al abrir ~105° apoya en el lateral y la tapa se queda abierta")
        # ángulo al que la pestaña toca la cara exterior del lateral
        xr, zr = -sg_b * 0, 0
        tip_x, tip_z = sg_b * (W / 2 + 9.75) - xa, (Hw + T + 2.25) - za     # relativo al eje
        ang = None
        for k in range(0, 1800):
            al = math.radians(k / 10.0)
            # giro de la tapa: el canto libre sube; en coordenadas relativas al eje
            if sg_b < 0:
                x1 = tip_x * math.cos(al) - tip_z * math.sin(al)
                if x1 >= (-W / 2) - xa:
                    ang = k / 10.0; break
            else:
                x1 = tip_x * math.cos(al) + tip_z * math.sin(al)
                if x1 <= (W / 2) - xa:
                    ang = k / 10.0; break
        ang = ang or 105.0
        m.cotas["angulo_tapa"] = ang
        m.movil["tapa"] = dict(tipo="giro", eje=[(xa, 0, za), (0, 1, 0)], angulo=(-ang if sg_b < 0 else ang))
    for x, sg in cer:
        m.compra("H03", "Cerradura de leva (leva recortada a 20,5 mm)",
                 place_parts(C.cerradura_leva((0, 1, 0), LEVA, (sg, 0, 0)), at=(x, 0, zl)), movil=mv,
                 notas="Cerrada: la leva entra en la ranura del lateral. Al abrir gira 90° hacia abajo")


# ============================================================================ COMPONENTES
def colocar_componentes(m, spec, lay, L, g):
    mv = "cajon_componentes"
    OY, OZ, Yin = g["OY"], g["OZ"], g["Yin"]
    Xin1 = g["Xin1"]
    # ---- pantalla y sus pletinas
    sx, sz = lay["pantalla"]
    P = place_parts(C.pantalla(), at=L(sx, 0, sz))
    m.compra("E01", "Pantalla 7\"", P, movil=mv, electrico=True)
    m.compra("E16", "Clavija HDMI 90°", place_parts(C.clavija_hdmi90(), at=L(sx, 0, sz)), movil=mv, electrico=True)
    m.compra("E17", "Clavija USB-C 90° (pantalla)", place_parts(C.clavija_usbc90(), at=L(sx, 0, sz)), movil=mv, electrico=True)
    for nombre, z0, z1 in (("Pletina inferior de la pantalla", sz - 7.0, sz + 4.5), ("Pletina superior de la pantalla", sz + 95.5, sz + 107.0)):
        xs0, xs1 = sx - 10, sx + 175
        b = box(xs0, xs1, 6.0 + OY, 7.5 + OY, z0 + OZ, z1 + OZ)
        zst = (z0 + z1) / 2 + (-1.2 if z0 < sz else 1.2)
        b = cut_all(b, [hole_y(sx - 5, zst + OZ, 4.5), hole_y(sx + 170, zst + OZ, 4.5)])
        m.fab("S", nombre, b, COL_SOP, movil=mv, notas="Aprieta el borde del vidrio contra el frente (con burlete de goma)")
        for xx in (sx - 5, sx + 170):
            m.compra("H07", "Espárrago M4×20 (pletina)", place_parts(C.esparrago_m4(12), at=L(xx, 0, zst)), movil=mv)
            m.compra("H09", "Separador 6 mm", place_parts(C.separador(6.0), at=L(xx, 0, zst)), movil=mv)
    # ---- Solo con repisa y contraplaca
    ox, oz = lay["solo"]
    m.compra("E02", "SumUp Solo", place_parts(C.solo(), at=L(ox, 0, oz)), movil=mv, electrico=True)
    w, h = C.SOLO["w"], C.SOLO["h"]
    rep = box(ox - 3 , ox + w + 3, OY, OY + 22, oz - T + OZ, oz + OZ)
    rep = cut_all(rep, [box(ox + w / 2 - 8, ox + w / 2 + 8, OY + 3, OY + 30, oz - 5 + OZ, oz + 5 + OZ)])
    m.fab("S", "Repisa del Solo", rep, COL_SOP, movil=mv, notas="Soldada al frente del cajón; muesca de 16 mm para la clavija USB-C")
    cp = box(ox - 9, ox + w + 9, OY + 19.6, OY + 21.1, oz + 18 + OZ, oz + 60 + OZ)
    cp = cut_all(cp, [hole_y(ox - 5, oz + 39 + OZ, 4.5), hole_y(ox + w + 5, oz + 39 + OZ, 4.5)])
    m.fab("S", "Contraplaca del Solo", cp, COL_SOP, movil=mv, notas="Aprieta el Solo por detrás con goma de 2 mm")
    for xx in (ox - 5, ox + w + 5):
        m.compra("H07", "Espárrago M4×20 (Solo)", place_parts(C.esparrago_m4(25), at=L(xx, 0, oz + 39)), movil=mv)
        m.compra("H09", "Separador 19,6 mm", place_parts(C.separador(19.6), at=L(xx, 0, oz + 39)), movil=mv)
    # ---- cámara
    cx, cz = lay["camara"]
    m.compra("E03", "Camera Module 3", place_parts(C.camara(), at=L(cx, C.CAM["sep"], cz)), movil=mv, electrico=True)
    # ---- Raspberry Pi + Wi-Fi
    px, pz = lay["pi"]
    py = Yin - C.PI["pcb"] - C.PI["sep"]
    m.compra("E04", "Raspberry Pi 3B+", place_parts(C.raspberry(), at=L(px, py, pz)), movil=mv, electrico=True)
    m.compra("E05", "Adaptador Wi-Fi AR9271", place_parts(C.wifi_ar9271(), at=L(px + 87.1 - 12, py - 4.3, pz + 29)), movil=mv, electrico=True)
    # ---- fuente (bornes hacia +X, base contra la trasera)
    fx, fz = lay["fuente"]                       # x del extremo de bornes, z de abajo
    m.compra("E06", "Fuente LRS-50-5", place_parts(C.fuente(), ex=(-1, 0, 0), ey=(0, 1, 0), ez=(0, 0, -1),
                                                  at=L(fx, Yin - C.FUENTE["H"], fz + C.FUENTE["W"])), movil=mv, electrico=True)
    # ---- C14 en el lateral derecho del cajón
    cy, czz = lay["c14"]
    m.compra("E07", "Toma C14 con portafusibles (sin interruptor)", place_parts(C.toma_c14(), ex=(0, 0, 1), ey=(-1, 0, 0), ez=(0, -1, 0),
                                            at=(g["Kx1"] + C.C14["brida"][2], cy + OY, czz + OZ)), movil=mv, electrico=True)
    # ---- reparto de 5 V (zona baja entre pantalla y caja de red)
    def P_(d):
        x, y, z = d["at"]
        return dict(ex=d.get("ex", (1, 0, 0)), ey=d.get("ey", (0, 1, 0)), ez=d.get("ez", (0, 0, 1)), at=L(x, y, z))
    for k, d in enumerate(lay["wago"]):
        m.compra("E08", f"WAGO 221-415 ({'+5 V' if k == 0 else 'GND'})", place_parts(C.wago_415(), **P_(d)), movil=mv, electrico=True)
    for k, d in enumerate(lay["usb"]):
        m.compra("E09", f"Borne USB-A ({'pantalla' if k == 0 else 'Solo'})", place_parts(C.borne_usb(), **P_(d)), movil=mv, electrico=True)
    for k, d in enumerate(lay["fusibles"]):
        nom = ["Pi 3 A", "Solo 3 A", "Pantalla 3 A", "Sensor 2 A"][k]
        m.compra("E10", f"Portafusible ({nom})", place_parts(C.portafusible(2 if "2 A" in nom else 3), **P_(d)), movil=mv, electrico=True)
    rb = lay["red"]
    # ---- ZE29A y tubo de soplido
    zx, zy, zz = lay["ze29a"]                    # esquina inferior izquierda de la placa, y de la cara de componentes
    m.compra("E11", "Sensor ZE29A", place_parts(C.ze29a(), at=L(zx, zy, zz)), movil=mv, electrico=True)
    # separadores del sensor (4 x M3, a confirmar con el módulo)
    for ax, az in C.ZE["agujeros"]:
        m.compra("H09", "Separador sensor", place_parts(C.separador(Yin - zy - 1.6, (0, 1, 0), 2.5), at=L(zx + ax, zy + 1.6, zz + az)), movil=mv)
    bx, bz = lay["boquilla"]
    m.compra("H10", "Pasacables de la boquilla", place_parts(C.arandela_pasacables(4.5, 7.5), at=L(bx, -T / 2, bz)), movil=mv)
    # ---- espárrago de tierra del cajón
    pe = lay["pe_cajon"]
    m.compra("H07", "Espárrago de tierra M4×20 (cajón)", place_parts(C.esparrago_m4(20, (-1, 0, 0)), at=(g["Kx1"] - T, pe[0] + OY, pe[1] + OZ)),
             movil=mv, electrico=True)
    m.cotas["pe_cajon"] = (g["Kx1"] - T, pe[0] + OY, pe[1] + OZ)
    # ---- pasacables de la tapa de red
    for gx, gy in rb["pasacables"]:
        m.compra("H10", "Pasacables caja de red", place_parts(C.arandela_pasacables(4.5, 7.5, (0, 0, 1)), at=L(gx, gy, rb["alto"] + T / 2)), movil=mv)
    for gx, gz in rb.get("pasacables_frente", []):
        m.compra("H10", "Pasacables caja de red", place_parts(C.arandela_pasacables(4.5, 7.5, (0, 1, 0)), at=L(gx, Yin - rb["fondo"] - T / 2, gz)), movil=mv)
    # ---- antena: pasamuros en un lateral, detrás del cajón; la antena va por fuera, vertical
    sa, W = g["lado_ant"], g["W"]
    ant = (sa * W / 2, g["y_ant"], g["z_ant"])
    g["antena_l"] = (ant[0] - sa * 16.5 - g["OX"], ant[1] - OY, ant[2] - OZ)       # extremo interior del pasamuros (local)
    x_r = sa * (W / 2 + 2.5)
    ext = [("rotula", cyl(4.5, 14, (x_r, ant[1], ant[2]), (sa, 0, 0)), C.NEGRO),
           ("codo", cq.Solid.makeSphere(4.6, cq.Vector(x_r + sa * 11.5, ant[1], ant[2])), C.NEGRO),
           ("antena", cyl(5.0, 95, (x_r + sa * 11.5, ant[1], ant[2] - 4.5), (0, 0, -1)), C.NEGRO)]
    m.compra("E12", "Pasamuros RP-SMA + antena",
             place_parts(C.pasamuros_rpsma(), ex=(0, sa, 0), ey=(-sa, 0, 0), ez=(0, 0, 1), at=ant) + ext, electrico=True,
             modelo=dict(n="pasamuros_antena", a=[], tf=dict(ex=[0, sa, 0], ey=[-sa, 0, 0], ez=[0, 0, 1], at=[round(v, 3) for v in ant])),
             notas="La antena del AR9271 se enrosca por fuera y se gira vertical HACIA ABAJO: hacia arriba cortaría el paso de la tapa interior")
    m.cotas["antena"] = ant
    # ---- cables y tubos
    lay["cables"](m, L, g)
