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
from chapa import Chapa
from geo import (place, place_parts, hole_y, hole_x, hole_z, slot_y, slot_x, slot_z, cut_all,
                 keyhole_y, vent_slots_x, vent_slots_z, vent_slots_y)

T = 3.0            # chapa de acero de la carcasa y de todas las piezas que no son del cajón de componentes (04-11-2026: de 2 a 3 mm)
TK = 1.5           # chapa del cajón de componentes (frente, trasera, cuerpo y caja de red) y de la tapa interior (04-11-2026: de 2 a 1,5 mm)
PC_T = 5.0         # policarbonato, por DENTRO: entre el panel frontal y el cajón de componentes
TUERCA = 3.2       # tuerca M4 que lo aprieta contra el panel
ZS1 = 163.5               # cara de arriba de la bandeja (separa cajón de pajitas y zona de componentes); no se mueve al cambiar el espesor
ZS0 = ZS1 - T
Z_HUECO = 150.0           # el hueco del lateral izquierdo llega hasta aquí (debajo queda sitio para las tuercas de los silentblocks)
Z_TOP_P = 148.5           # borde superior del cajón de pajitas (igual que el diseño anterior)
SB_H = 10.0        # silentblock
GF = 11.5          # holgura panel-cajón: policarbonato 5 + tuerca 3,2 + 3,3 de aire (03-11-2026: era 12; con chapa de 2 mm así el cajón no pierde fondo)
GS_L, GS_R = 3.5, 7.0     # holgura lateral izquierda / derecha (a la derecha cabe la brida de la C14 y sus tornillos); deja 0,5 mm de aire a los topes de goma.
                          # 04-11-2026: con laterales de 3 mm y cajón de 1,5 el interior del cajón es 1 mm más estrecho (200,5 mm) y 1 mm menos profundo (70 mm)
TOPE = 3.0
TIRA = 18.0        # tira trasera fija del techo (tapa extraíble)
BANDA = 35.0 - TK - T     # alto del faldón delantero de la tapa (lleva las cerraduras): tapa interior (TK) + BANDA + tapa (T) = 35 mm, así el alto total no cambia
AIRE_TI = 6.0      # aire entre el borde del cajón de componentes y la tapa interior plana
X_CER = 15.0       # eje de cada cerradura a 15 mm del lateral; la leva (recortada a 20,5 mm) entra en una ranura del lateral
LEVA = 20.5
HOLG_TI = 0.3      # holgura de la tapa interior en su ranura del lateral derecho (arriba y abajo)
PC_A = 2.0         # policarbonato de 2 mm de las ventanas de la antena 4G
# Antena 4G (01-11-2026): dos ventanas alineadas en el lateral IZQUIERDO, una en la carcasa y otra en el cajón de componentes,
# entre las rejillas de abajo y las de arriba. Cotas de mundo: (y desde el frente, z desde el suelo)
VA_Y, VA_Z = (27.0, 63.0), (229.0, 341.0)      # ventana de la carcasa (02-11-2026: 5 mm más atrás, por las pestañas del frente del cajón; 04-11-2026: 1 mm más, el frente del cajón va 1 mm más atrás)
VA_PC = 8.0                                    # la placa de 2 mm pisa la chapa 8 mm por cada lado (cinta VHB)
VK_Y, VK_Z = (29.0, 61.0), (231.0, 339.0)      # ventana del cajón: 2 mm más pequeña por cada lado
VK_PC = 6.0                                    # el soporte de 2 mm pisa la chapa del cajón 6 mm (detrás está la Pi)
ANT_C = (45.0, 285.0)                          # centro de la antena plana (y, z)

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

    def fab(self, grupo, nombre, solido, color, material=None, proceso="Láser", movil=None,
            notas="", espesor=None, plana=True, chapa=None, codigo=None):
        """chapa: objeto Chapa si la pieza es de chapa plegada (de ahí salen el sólido y el desarrollo).
        codigo: piezas iguales comparten código de plano (un solo plano con su cantidad)."""
        pid = self.nid(grupo)
        if espesor is None:
            espesor = chapa.t if chapa is not None else T
        if material is None:
            material = f"Acero DC01 {espesor:g} mm".replace(".", ",")
        if chapa is not None:
            solido = chapa.solido()
            plana = False
            proceso = "Láser + plegado"
        self.piezas.append(dict(id=pid, nombre=nombre, grupo=grupo, tipo="fabricada", material=material,
                                proceso=proceso, espesor=espesor, solido=solido, subs=[(nombre, solido, color)],
                                color=color, movil=movil, electrico=False, notas=notas, plana=plana, chapa=chapa,
                                codigo=codigo or pid))
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
    "E05": ("Módem 4G USB Huawei E3372h-320 (HiLink), para tarjeta SIM de datos", "", 39.90),
    "E06": ("Fuente Mean Well LRS-50-5", "B06XWRCWZ9", 18.52),
    "E07": ("Toma C14 con portafusibles, sin interruptor (Cablepelado)", "B07CQ54BY4", 8.03),
    "E08": ("WAGO 221-415 (kit 221)", "B09XB58ZXJ", 27.08),
    "E09": ("Borne USB-A hembra a tornillo", "B07V86XPL4", 10.99),
    "E10": ("Portafusibles en línea mini + fusibles", "B07Q495GQG", 9.49),
    "E11": ("Sensor de alcohol Winsen ZE29A", "B0H8NVXVG5", 108.46),
    "E12": ("Antena 4G plana (FPC) 698–2700 MHz, ~100 × 15 mm, cable de 20 cm con SMA macho", "", 9.99),
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
    "E23": ("Latiguillo CRC9 macho → SMA hembra, 15 cm (antena del E3372)", "", 7.99),
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
    "H14": ("Tirafondo hexagonal 6 × 80 DIN 571 (proveedor y precio pendientes)", "", 0.0),
    "H15": ("Arandela ancha M6 DIN 9021 inox (25 uds.)", "B07Q5TVVMJ", 9.69),
    "H16": ("Taco de nylon fischer SX Plus 8 × 65 L (ref. 568108; caja 50)", "", 0.0),
    "H17": ("Tornillo de seguridad Torx con pin M4 × 16, cabeza plana, inox (20 uds.)", "B0GGSDJMYV", 9.19),
    "H18": ("Candado ABUS 65/30 de latón, pack de 2 con la misma llave", "B01H9Z6HB4", 20.59),
    "H19": ("Placa de policarbonato compacto 2 mm (300 × 200 mm o más)", "", 9.99),
    "H20": ("Cinta 3M VHB transparente de doble cara, 19 mm", "", 12.99),
}


BOCALLAVE = (19.0, 6.5, 20.0)        # Ø de paso (cabeza + arandela ancha), ancho y largo de la ranura


# 18 agujeros Ø6,5 para la pared (patrón P18-3, 04-11-2026): calculado con la trasera de 3 mm para que el tornillo más cargado
# lleve lo menos posible en el peor caso (tirones de 500 N, persona colgada...). Ver calculo-anclajes/README.md.
# (x desde el eje de la máquina, z desde la base; simétrico respecto a x = 0)
FIJACIONES_PARED = [
    (-87.5, 428.5), (87.5, 428.5),
    (-87.0, 376.5), (87.0, 376.5),
    (-91.5, 325.5), (91.5, 325.5),
    (-93.0, 275.5), (93.0, 275.5),
    (-93.0, 224.5), (93.0, 224.5),
    (-38.5, 223.5), (38.5, 223.5),
    (-54.0, 175.5), (54.0, 175.5),
    (-93.0, 139.5), (93.0, 139.5),
    (-47.5, 22.0), (47.5, 22.0),
]


def fijaciones_pared(W, z_arriba):
    """18 agujeros redondos Ø6,5 para la pared (patrón P18-3). Van pegados a las partes rígidas de la caja: columnas junto a
    los pliegues laterales, filas justo encima y debajo de la pestaña de la bandeja y una fila en la franja de arriba,
    entre el apoyo de la tapa interior y el canto. Esquivan las guías traseras, el espárrago de tierra y las soldaduras.
    W y z_arriba se mantienen por compatibilidad; el patrón ya no depende de ellos."""
    return [(x, z, False) for x, z in FIJACIONES_PARED]


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
    """Tirafondo hexagonal 6 × 80 (DIN 571, cabeza de 10 mm entre caras y 4 mm de alto) por dentro de la trasera,
    sobre una arandela ancha; la caña entra en el taco de la pared."""
    x, y, z = p
    cab = cq.Workplane("XZ", origin=(x, y - 1.6, z)).polygon(6, 10.0 / math.cos(math.radians(30))).extrude(4.0).val()
    return [("cabeza", cab, C.METAL), ("cana", cyl(3.0, 76.0, (x, y - 1.6, z), (0, 1, 0)), C.METAL)]


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
    Hp = zi0                                  # alto del panel frontal: su pestaña de arriba es el apoyo delantero de la tapa interior
    ys0, ys1 = T + 2.5, D - T - 6.0           # ranura de la tapa interior: deja 2,5 mm de chapa delante y 6 mm detrás (04-11-2026: eran 7,5; así la
                                              # tapa interior vuelve a pisar 1,8 mm el apoyo trasero, que con el fondo actual se había quedado en 0,3)
    y_sb = Ky1 + 1.5                          # el saliente trasero llega hasta 1,5 mm del cajón
    Hw = zi0 + TK + BANDA                     # alto de laterales y trasera
    Hr = Hw
    zl = (zi0 + TK + 0.5 + Hw) / 2            # eje de las cerraduras
    if tapa == "extraible":
        cer = [(-(W / 2 - X_CER), -1), (W / 2 - X_CER, 1)]
    else:
        cer = [((W / 2 - X_CER), 1)] if bis == "izq" else [(-(W / 2 - X_CER), -1)]
    m.cotas.update(W=W, D=D, H=Hw + T, Hp=Hp, Hw=Hw, Hr=Hr, Ktop=Ktop, Kz0=Kz0, Kx0=Kx0, Kx1=Kx1, Ky0=Ky0, Ky1=Ky1)
    # sistema local del cajón de componentes: x igual, y=0 cara trasera de la chapa frontal, z=0 cara de la base
    OX, OY, OZ = 0.0, Ky0 + TK, Kz0 + TK
    Yin = (Ky1 - TK) - OY                     # fondo útil interior del cajón
    Xin0, Xin1 = Kx0 + TK, Kx1 - TK
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
    pcz1 = min(pcz1, Hp - 6, Hp - 2 * T - 1)       # por debajo del radio del pliegue de la pestaña de arriba del panel
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
    # panel frontal plegado: va ENTRE los laterales, con una pestaña a cada lado (hacia atrás, soldada por puntos al lateral
    # por dentro) y otra arriba, que hace de apoyo delantero de la tapa interior
    RT = 2 * T                                # radio interior + espesor: lo que se come cada esquina plegada
    XP = W / 2 - T
    PEST_P, PEST_SUP = 12.0, 12.0             # 04-11-2026: la de arriba era de 7 mm; con chapa de 3 mm una pestaña tan corta no se puede plegar
    cuts = [box(act_c[0] - VENT_P[0] / 2, act_c[0] + VENT_P[0] / 2, -5, 5, zc(act_c[1]) - VENT_P[1] / 2, zc(act_c[1]) + VENT_P[1] / 2),
            box(solo_c[0] - VENT_S_PANEL / 2, solo_c[0] + VENT_S_PANEL / 2, -5, 5, zc(solo_c[1]) - VENT_S_PANEL / 2, zc(solo_c[1]) + VENT_S_PANEL / 2),
            hole_y(lens[0], zc(lens[1]), D_CAM_P), hole_y(boq[0], zc(boq[1]), D_BOQ_P)]
    cuts += [hole_y(x, z, 4.5) for x, z in studs]
    # ranuras de pajitas, centradas en los compartimentos del cajón de pajitas
    dr = cajon_pajitas_medidas(W, D)
    for xc in dr["centros"]:
        cuts.append(slot_y(xc, dr["z_ran"], dr["L_ran"], dr["A_ran"]))
    cuts += [box(XP - RT, XP + 1, -1, T + 1, Hp - RT, Hp + 1), box(-XP - 1, -XP + RT, -1, T + 1, Hp - RT, Hp + 1)]   # alivios de esquina
    ch = Chapa("Panel frontal", t=T)
    ch.cara("frente", (-XP, XP, 0, T, 0, Hp), cuts)
    ch.cara("izq", (-XP, -XP + T, 0, PEST_P, 0, Hp - RT))
    ch.cara("der", (XP - T, XP, 0, PEST_P, 0, Hp - RT))
    # muescas en la pestaña de arriba: por ahí pasan los topes delanteros del cajón (llegan a y = Ky0 - 6) al sacarlo por arriba
    mu_sup = [box(xx - 7, xx + 7, 7.5, PEST_SUP + 1, Hp - T - 1, Hp + 1) for xx in lay["topes_frente"]]
    ch.cara("sup", (-XP + RT, XP - RT, 0, PEST_SUP, Hp - T, Hp), mu_sup)
    ch.pliegue("frente", "izq").pliegue("frente", "der").pliegue("frente", "sup")
    m.fab("C", "Panel frontal", None, COL_CHAPA_OSC, chapa=ch,
          notas="Ventanas de pantalla, Solo, cámara y boquilla; 10 × Ø4,5 de los tornillos de los policarbonatos; 3 ranuras de pajitas. "
                f"Pestañas laterales de {PEST_P:.0f} mm soldadas por puntos a los laterales por dentro; pestaña de arriba de {PEST_SUP:.0f} mm "
                "donde apoya la tapa interior, con dos muescas de 14 mm (se queda en 7,5) por donde pasan los topes del cajón")
    avellanado = lambda x, z, r: cq.Solid.makeCone(r + 2.25, r, 2.25, cq.Vector(x, -PC_T - 0.01, z), cq.Vector(0, 1, 0))
    pe = box(pcx0, pcx1, -PC_T, 0, pcz0, pcz1)                 # policarbonato exterior, apoyado en el panel
    pe = cut_all(pe, [hole_y(x, z, 4.5) for x, z in studs] + [avellanado(x, z, 2.25) for x, z in studs]
                 + [hole_y(boq[0], zc(boq[1]), 7.0), avellanado(boq[0], zc(boq[1]), 3.5)])
    m.fab("V", "Policarbonato exterior 5 mm (delante del panel)", pe, COL_PC, material="Policarbonato compacto 5 mm",
          proceso="Corte CNC + taladros", espesor=PC_T,
          notas="10 × Ø4,5 avellanados a Ø8,5 por delante (tornillos de cabeza plana a ras); boquilla Ø7 avellanada")
    pix = min(W / 2 - 7, W / 2 - 3 * T - 0.5)                  # el interior no puede llegar al radio de los pliegues laterales del panel
    pi = box(-pix, pix, T, T + PC_T, pcz0, pcz1)               # policarbonato interior, pegado a la cara de dentro del panel
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
    # trasera: 18 tornillos a la pared (patrón P18-3), agujeros redondos; se aprietan desde dentro con arandela ancha
    fij = fijaciones_pared(W, Ktop - 10.0)
    cuts_t = [keyhole_y(x, z, BOCALLAVE[0], BOCALLAVE[1], BOCALLAVE[2]) if bl else hole_y(x, z, 6.5) for x, z, bl in fij]
    # alivios: a la izquierda el pliegue empieza encima del hueco del cajón de pajitas; abajo a la derecha, esquina con el suelo
    cuts_t += [box(-W / 2 - 1, -W / 2 + RT, D - T - 1, D + 1, -1, Z_HUECO), box(W / 2 - RT, W / 2 + 1, D - T - 1, D + 1, -1, RT)]
    m.cotas["fijaciones_pared"] = [(x, z) for x, z, bl in fij]
    # laterales
    cuts = [box(-W / 2 - 1, -W / 2 + T + 1, T + 15.0, D + 1, -1, Z_HUECO)]      # hueco del cajón de pajitas
    ex = lay["escape"]                                                            # (y, z local) del escape
    esc_izq = lay.get("escape_lado", "izq") == "izq"
    rej_esc = [hole_x(ex[0] + OY + dy, zc(ex[1]) + dz, 4.0)                       # rejilla de escape: 7 agujeros Ø4
               for dy, dz in ((0, 0), (-6, 0), (6, 0), (0, -6), (0, 6), (-6, -6), (6, 6))]
    if esc_izq:
        cuts += rej_esc
    for z0, z1 in lay["rejillas_izq"]:
        cuts += vent_slots_x(Ky0 + 12, Ky1 - 12, zc(z0), zc(z1))
    cuts += [box(-W / 2 - 5, -W / 2 + 5, 15.0, 19.0, zl - 10, zl + 7) for x, sg in cer if sg < 0]
    cuts.append(box(-W / 2 - 1, -W / 2 + T + 1, VA_Y[0], VA_Y[1], VA_Z[0], VA_Z[1]))           # ventana de la antena 4G
    cuts_li = cuts
    va = box(-W / 2 + T, -W / 2 + T + PC_A, VA_Y[0] - VA_PC, VA_Y[1] + VA_PC, VA_Z[0] - VA_PC, VA_Z[1] + VA_PC)
    m.fab("V", "Ventana de la antena 4G (policarbonato 2 mm, por dentro del lateral izquierdo)", va, COL_PC,
          material="Policarbonato compacto 2 mm", proceso="Corte con sierra o cúter", espesor=PC_A,
          notas=f"Pegada con cinta VHB por dentro del lateral, pisando {VA_PC:.0f} mm la chapa alrededor de la ventana. Por fuera queda a ras: "
                "no sobresale nada. Deja 1,5 mm hasta el cajón de componentes")
    c14 = lay["c14"]                                                              # (y, z) local del centro de la toma
    VENT_C14 = (38.0, 46.0)                                                       # ventana del enchufe (y × z)
    cuts = [box(W / 2 - 5, W / 2 + 5, c14[0] + OY - VENT_C14[0] / 2, c14[0] + OY + VENT_C14[0] / 2,
                zc(c14[1]) - VENT_C14[1] / 2, zc(c14[1]) + VENT_C14[1] / 2)]
    for z0, z1 in lay["rejillas_der"]:
        cuts += vent_slots_x(Ky0 + 12, Ky1 - 12, zc(z0), zc(z1))
    if not esc_izq:
        cuts += rej_esc
    cuts += [box(W / 2 - 5, W / 2 + 5, 15.0, 19.0, zl - 10, zl + 7) for x, sg in cer if sg > 0]     # 04-11-2026: 3 mm más abajo, por el lateral de 3 mm
    # ranura por la que entra la tapa interior y, encima, una muesca R8 para empujarla con el dedo
    zr0, zr1 = zi0 - HOLG_TI, zi0 + TK + HOLG_TI
    ym = (ys0 + ys1) / 2
    cuts.append(box(W / 2 - 5, W / 2 + 5, ys0, ys1, zr0, zr1))
    cuts.append(hole_x(ym, zr1, 16.0).intersect(box(W / 2 - 5, W / 2 + 5, ym - 9, ym + 9, zr1, zr1 + 9)))
    m.cotas["ranura_tapa_interior"] = dict(y=(ys0, ys1), z=(zr0, zr1), largo=ys1 - ys0, alto=zr1 - zr0)
    # arriba, los laterales dejan sitio al faldón delantero de la tapa (va delante, a y = 0) y al radio interior de sus pliegues
    for cl, sg in ((cuts_li, -1), (cuts, 1)):
        xs = sorted((sg * W / 2, sg * (W / 2 - T)))
        cl += [box(xs[0] - 0.1, xs[1] + 0.1, -1, T, Hp, Hw + 1), box(xs[0] - 0.1, xs[1] + 0.1, -1, RT + 0.1, Hw - T - 0.1, Hw + 1)]
    # canto de arriba del lateral derecho, bajo el pliegue del faldón derecho de la tapa: el lateral acaba BAJA_D más abajo, en todo
    # su grueso (así es un corte del contorno, no un rebaje). BAJA_D sale de que la cara de fuera del lateral (a T - 0,5 del centro
    # del pliegue, que está en x = W/2 + 0,5 - T) quede dentro del radio interior T con 0,1 mm de aire
    BAJA_D = math.ceil((T - math.sqrt(T ** 2 - (T - 0.5) ** 2) + 0.1) * 10) / 10
    cuts.append(box(W / 2 - T - 0.1, W / 2 + 0.1, -1, D + 1, Hw - BAJA_D, Hw + 1))
    cuts_t.append(box(W / 2 - RT, W / 2 + 0.1, D - T - 0.1, D + 0.1, Hw - BAJA_D, Hw + 1))   # y la esquina de arriba de la trasera
    ch = Chapa("Cuerpo", t=T)
    ch.cara("trasera", (-W / 2, W / 2, D - T, D, 0, Hw), cuts_t)
    ch.cara("izq", (-W / 2, -W / 2 + T, 0, D, 0, Hw), cuts_li)
    ch.cara("der", (W / 2 - T, W / 2, 0, D, 0, Hr), cuts)
    ch.cara("suelo", (-W / 2 + RT, W / 2 - RT, T, D, 0, T),
            [box(sg * (W / 2 - T - RT) - (0 if sg > 0 else 5), sg * (W / 2 - T - RT) + (5 if sg > 0 else 0), 0, RT + 0.5, -1, T + 1) for sg in (-1, 1)])  # radio de las pestañas del panel
    ch.pliegue("trasera", "izq", rangos=[(Z_HUECO, Hw)]).pliegue("trasera", "der", rangos=[(RT, Hr - BAJA_D)]).pliegue("trasera", "suelo")
    m.fab("C", "Cuerpo (trasera, laterales y suelo)", None, COL_CHAPA, chapa=ch,
          notas="Una sola chapa en cruz con 3 pliegues. Trasera: 18 agujeros Ø6,5 para la pared, patrón P18-3 (tirafondo 6 × 80 DIN 571 con taco fischer SX Plus 8 × 65 y arandela "
                "ancha M6, apretados desde dentro). Lateral izquierdo: hueco del cajón de pajitas, rejilla de escape, rejillas y ventana de la "
                f"antena 4G ({VA_Y[1] - VA_Y[0]:.0f} × {VA_Z[1] - VA_Z[0]:.0f}). Lateral derecho: ventana de la C14 ({VENT_C14[0]:.0f} × "
                f"{VENT_C14[1]:.0f}), rejillas, ranura {zr1 - zr0:.1f} × {ys1 - ys0:.0f} de la tapa interior con muesca R8 y ranura 4 × 14 de la leva")
    # bandeja plegada: pestañas hacia abajo a los lados y detrás, soldadas por puntos a laterales y trasera
    sb_pos = [(Kx0 + 16, Ky0 + 14), (Kx1 - 16, Ky0 + 14), (Kx0 + 16, Ky1 - 14), (Kx1 - 16, Ky1 - 14)]
    XB, ALA_B, YB0 = W / 2 - T, 13.0, PEST_P + 2.0
    cb = [hole_z(x, y, 4.5) for x, y in sb_pos]
    cb += [box(sg * XB - (1 if sg < 0 else RT), sg * XB + (RT if sg < 0 else 1), T - 1, YB0, ZS0 - 1, ZS1 + 1) for sg in (-1, 1)]       # muescas: pestañas del panel
    cb += [box(sg * XB - (1 if sg < 0 else RT), sg * XB + (RT if sg < 0 else 1), D - T - RT, D, ZS0 - 1, ZS1 + 1) for sg in (-1, 1)]    # alivios de esquina
    ch = Chapa("Bandeja", t=T)
    ch.cara("bandeja", (-XB, XB, T, D - T, ZS0, ZS1), cb)
    ch.cara("izq", (-XB, -XB + T, YB0, D - T - RT, ZS1 - ALA_B, ZS1))
    ch.cara("der", (XB - T, XB, YB0, D - T - RT, ZS1 - ALA_B, ZS1))
    ch.cara("tras", (-XB + RT, XB - RT, D - 2 * T, D - T, ZS1 - ALA_B, ZS1))
    ch.pliegue("bandeja", "izq").pliegue("bandeja", "der").pliegue("bandeja", "tras")
    m.fab("C", "Bandeja (suelo de la zona de componentes)", None, COL_CHAPA, chapa=ch,
          notas="4 agujeros Ø4,5 para los silentblocks. Pestañas de 13 mm hacia abajo, soldadas por puntos a los laterales y a la trasera")
    if tapa == "extraible":
        tira = box(-W / 2, W / 2, D - TIRA, D, Hw, Hw + T)
        m.fab("C", "Tira trasera fija del techo", tira, COL_CHAPA, notas="Las lengüetas de la tapa entran por debajo")
    # guías traseras: dos pletinas planas soldadas por puntos a la trasera, con dos topes de goma (6 mm) que topan el cajón por detrás.
    # 04-11-2026: antes eran angulares de 2 mm con un ala de 6 mm hacia el cajón; con chapa de 3 mm (radio 3) un ala tan corta no se
    # puede plegar, así que la pletina va plana contra la trasera y la altura la dan los topes
    for sg in (-1, 1):
        x = sg * (W / 2 - 40)
        g_ = box(x - 6, x + 6, D - 2 * T, D - T, Kz0, Ktop - 10)
        m.fab("C", f"Guía trasera {'izquierda' if sg < 0 else 'derecha'}", g_, COL_CHAPA, codigo="GUIA",
              notas="Pletina de 12 mm de ancho soldada por puntos a la trasera, plana; dos topes de goma pegados uno encima de otro "
                    "(6 mm) dejan 0,5 mm hasta la trasera del cajón. Las dos son la misma pieza")
        m.compra("H02", "Tope de goma 10×3 (dos, uno encima de otro)", place_parts(C.tope_goma((0, -1, 0), 6.0), at=(x, D - 2 * T, Kz0 + Hk / 2)), uds=2)
    # espárrago de tierra de la carcasa: en la trasera, detrás del cajón
    pe_h = (W / 2 - 60, D - T, Ktop - 25)
    m.compra("H07", "Espárrago de tierra M4 cortado a 8 mm (carcasa)", place_parts(C.esparrago_m4(8, (0, -1, 0)), at=pe_h), electrico=True,
             notas="Del kit M4×20, cortado a 8 mm: detrás del cajón hay 9,5 mm, así que queda a 1,5 mm de su trasera")
    m.cotas["pe_carcasa"] = pe_h
    # silentblocks
    for x, y in sb_pos:
        m.compra("H01", "Silentblock M4 10×10", place_parts(C.silentblock(), at=(x, y, ZS1)))

    # ------------------------------------------------------------------ TAPA INTERIOR PLANA (antipolvo, deslizante)
    mti = "tapa_interior"
    ti = box(-W / 2 + T + 0.2, W / 2, ys0 + 0.2, ys1 - 0.2, zi0, zi0 + TK)
    m.fab("T", "Tapa interior plana (antipolvo, deslizante)", ti, COL_TAPA, movil=mti, espesor=TK,
          notas="Chapa lisa sin agujeros. Entra deslizando por la ranura del lateral derecho, apoya en los salientes "
                "y hace tope en el lateral izquierdo; queda a ras por fuera. Con la tapa cerrada el faldón derecho tapa la ranura. "
                "Para sacarla: abrir la tapa, empujar con el dedo desde la muesca y tirar hacia la derecha (hacen falta ~23 cm libres a ese lado)")
    # el apoyo delantero es la pestaña de arriba del panel; el de atrás, un angular soldado a la trasera (los salientes
    # del lateral izquierdo sobran: la tapa apoya en todo su largo delante y detrás)
    # 04-11-2026: antes era un angular de 2 mm (apoyo de 8 mm + ala de 12); con chapa de 3 mm un apoyo tan corto no se puede plegar,
    # así que es una pletina plana soldada con MIG por su canto trasero a la trasera
    xa0, xa1 = -W / 2 + RT + 0.5, W / 2 - RT - 0.5            # fuera del radio de las esquinas de la trasera
    ap = box(xa0, xa1, y_sb, D - T, zi0 - T, zi0)
    m.fab("C", "Apoyo trasero de la tapa interior", ap, COL_CHAPA, proceso="Láser + MIG",
          notas=f"Pletina de {D - T - y_sb:.1f} × {xa1 - xa0:.0f} mm, soldada con MIG por su canto trasero a la trasera (cordón por arriba); "
                "la tapa interior apoya encima")
    m.cotas["tapa_interior_z"] = zi0

    # ------------------------------------------------------------------ TAPA
    construir_tapa(m, spec, W, D, Hp, Hw, cer, zl)

    # ------------------------------------------------------------------ CAJÓN DE PAJITAS
    construir_cajon_pajitas(m, W, D, dr)

    # ------------------------------------------------------------------ CAJÓN DE COMPONENTES
    mv = "cajon_componentes"
    RTK = 2 * TK                              # radio interior + espesor en las esquinas plegadas del cajón (chapa de 1,5)
    bc = [hole_z(x, y, 6.0) for x, y in sb_pos]
    rb = lay["red"]                                                  # caja de red: x0 local, alto
    bc += vent_slots_z(rb["x0"] + 10, Xin1 - 40, Yin - 34 + OY, Yin - 9 + OY, L=18, pitch_y=10)   # acaba antes de la pestaña de la trasera
    ALA_K = 8.0                                                      # pestañas del frente y de la trasera del cajón
    xk0, xk1 = Kx0 + TK, Kx1 - TK                                      # frente y trasera van entre los laterales
    cuts = [box(act_c[0] - VENT_P[0] / 2, act_c[0] + VENT_P[0] / 2, 0, 50, zc(act_c[1]) - VENT_P[1] / 2, zc(act_c[1]) + VENT_P[1] / 2),
            box(solo_c[0] - VENT_S_CAJ / 2, solo_c[0] + VENT_S_CAJ / 2, 0, 50, zc(solo_c[1]) - VENT_S_CAJ / 2, zc(solo_c[1]) + VENT_S_CAJ / 2),
            hole_y(lens[0], zc(lens[1]), D_CAM_K), hole_y(boq[0], zc(boq[1]), D_BOQ_K)]
    for ax, az in [(2, 2), (23, 2), (2, C.CAM["h"] - 9.5), (23, C.CAM["h"] - 9.5)]:
        cuts.append(hole_y(cam[0] + ax, zc(cam[1] + az), 2.4))
    cuts += [box(xk0 - 0.1, xk0 + RTK, Ky0 - 0.1, Ky0 + TK + 0.1, Kz0 + TK - 0.1, Kz0 + TK + RTK),
             box(xk1 - RTK, xk1 + 0.1, Ky0 - 0.1, Ky0 + TK + 0.1, Kz0 + TK - 0.1, Kz0 + TK + RTK)]            # alivios de esquina
    ch = Chapa("Frente del cajón", t=TK)
    ch.cara("frente", (xk0, xk1, Ky0, Ky0 + TK, Kz0 + TK, Ktop), cuts)
    ch.cara("izq", (xk0, xk0 + TK, Ky0, Ky0 + ALA_K, Kz0 + TK + RTK, Ktop))
    ch.cara("der", (xk1 - TK, xk1, Ky0, Ky0 + ALA_K, Kz0 + TK + RTK, Ktop))
    ch.cara("inf", (xk0 + RTK, xk1 - RTK, Ky0, Ky0 + ALA_K, Kz0 + TK, Kz0 + 2 * TK))
    ch.pliegue("frente", "izq").pliegue("frente", "der").pliegue("frente", "inf")
    m.fab("K", "Frente del cajón", None, COL_CART, movil=mv, chapa=ch,
          notas="Sujeta pantalla, Solo y cámara a ras del panel; tornillos M2 avellanados de la cámara. Pestañas de 8 mm a los lados y abajo, "
                "soldadas por puntos a los laterales y a la base")
    tcuts = []
    for hx, hz in lay["agujeros_trasera"]:
        tcuts.append(hole_y(hx, zc(hz), 3.4))
    for sx, sz in lay["bridas_trasera"]:
        tcuts += [slot_y(sx - 6, zc(sz), 3.2, 8.0, horizontal=False), slot_y(sx + 6, zc(sz), 3.2, 8.0, horizontal=False)]
    tcuts.append(box(xk0 - 0.1, xk0 + RTK, Ky1 - TK - 0.1, Ky1 + 0.1, Kz0 + TK - 0.1, Kz0 + TK + RTK))          # alivio de esquina
    tcuts.append(box(xk1 - TK, xk1 + 0.1, Ky1 - TK - 0.1, Ky1 + 0.1, Kz0 + TK - 0.1, Kz0 + TK + RTK + 0.5))      # radio del pliegue derecho del cuerpo + alivio
    ch = Chapa("Trasera del cajón", t=TK)
    ch.cara("trasera", (xk0, xk1, Ky1 - TK, Ky1, Kz0 + TK, Ktop), tcuts)
    pz_w = lay["pi"][1] + OZ                                       # muesca en la pestaña izquierda para la microSD de la Pi
    ch.cara("izq", (xk0, xk0 + TK, Ky1 - ALA_K, Ky1, Kz0 + TK + RTK, Ktop),
            [box(xk0 - 0.1, xk0 + TK + 0.1, Ky1 - ALA_K - 0.1, Ky1 - ALA_K + 3.0, pz_w + 18.0, pz_w + 38.0)])
    ch.cara("inf", (xk0 + RTK, xk1 - TK, Ky1 - ALA_K, Ky1, Kz0 + TK, Kz0 + 2 * TK))
    ch.pliegue("trasera", "izq").pliegue("trasera", "inf")
    m.fab("K", "Trasera del cajón", None, COL_CART, movil=mv, chapa=ch,
          notas="Taladros de la fuente (M3) y de la Pi (M2,5); pares de ranuras para bridas. Pestañas de 8 mm a la izquierda y abajo, soldadas "
                "por puntos; sin pestaña a la derecha (ahí está la toma C14)")
    lzc = [hole_x(ex[0] + OY, zc(ex[1]), 12.0)] if esc_izq else []
    for z0, z1 in lay["rejillas_izq"]:
        lzc += vent_slots_x(Ky0 + 12, Ky1 - 12, zc(z0), zc(z1))
    lzc.append(box(Kx0 - 1, Kx0 + TK + 1, VK_Y[0], VK_Y[1], VK_Z[0], VK_Z[1]))                 # ventana de la antena 4G
    m.cotas["ventana_antena"] = dict(carcasa=(VA_Y[1] - VA_Y[0], VA_Z[1] - VA_Z[0]), cajon=(VK_Y[1] - VK_Y[0], VK_Z[1] - VK_Z[0]))
    cw, chh = C.C14["cuerpo"][0], C.C14["cuerpo"][1]
    rzc = [box(Kx1 - 5, Kx1 + 5, c14[0] + OY - chh / 2 - 0.2, c14[0] + OY + chh / 2 + 0.2, zc(c14[1]) - cw / 2 - 0.2, zc(c14[1]) + cw / 2 + 0.2)]
    for ax, az in C.C14["agujeros"]:
        rzc.append(hole_x(c14[0] + OY - az, zc(c14[1]) + ax, 3.4))
    for z0, z1 in lay["rejillas_der"]:
        rzc += vent_slots_x(Ky0 + 12, Ky1 - 12, zc(z0), zc(z1))
    if not esc_izq:
        rzc.append(hole_x(ex[0] + OY, zc(ex[1]), 12.0))
    ch = Chapa("Cuerpo del cajón de componentes", t=TK)
    ch.cara("base", (Kx0, Kx1, Ky0, Ky1, Kz0, Kz0 + TK), bc)
    ch.cara("lat_izq", (Kx0, Kx0 + TK, Ky0, Ky1, Kz0, Ktop), lzc)
    ch.cara("lat_der", (Kx1 - TK, Kx1, Ky0, Ky1, Kz0, Ktop), rzc)
    ch.pliegue("base", "lat_izq").pliegue("base", "lat_der")
    m.fab("K", "Cuerpo del cajón (base y laterales)", None, COL_CART, movil=mv, chapa=ch,
          notas="U con 2 pliegues. Base: 4 agujeros Ø6 que encajan en los silentblocks y rejilla bajo la fuente. Lateral izquierdo: "
                + ("paso del tubo de escape Ø12 con pasacables, " if esc_izq else "") + f"rejillas y ventana de la antena 4G "
                f"({VK_Y[1] - VK_Y[0]:.0f} × {VK_Z[1] - VK_Z[0]:.0f}). Lateral derecho: recorte de la toma C14 ({chh + 0.4:.2f} × "
                f"{cw + 0.4:.2f}, ancho × alto), 2 taladros M3 a 36 mm y rejillas")
    # sin asa: dos asideros (chapa de 3 mm con agujero para dos dedos) a ras del borde de arriba, por dentro de los laterales
    for nom, x0, x1, y0, y1, yh, yt in (("Asidero izquierdo", Kx0 + TK, Kx0 + TK + 30, 8 + OY, 48 + OY, 20 + OY, 38 + OY),
                                        ("Asidero derecho", Kx1 - TK - 30, Kx1 - TK, Yin - 43 + OY, Yin - 3 + OY, Yin - 31 + OY, Yin - 13 + OY)):
        xh = (x0 + x1) / 2
        asd = cut_all(box(x0, x1, y0, y1, Ktop - 3.0, Ktop), [hole_z(xh, yh, 22.0)])
        m.fab("K", nom, asd, COL_CART, material="Acero DC01 3 mm", movil=mv, espesor=3.0, codigo="ASIDERO",
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
            if zz == Kz0 + 25:     # los de abajo a la izquierda van pegados a la carcasa: si fueran en el cajón, al subirlo rozarían la ventana de la antena
                m.compra("H02", "Tope de goma 10×3 (en la carcasa)", place_parts(C.tope_goma((1, 0, 0)), at=(-W / 2 + T, yy, zz)),
                         notas="Pegado por dentro del lateral izquierdo, debajo de la ventana de la antena: centra el cajón por abajo")
            else:
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
    # caja de red: una sola chapa (tapa con el frente y el lateral doblados hacia abajo y una pestaña de fijación al pie de cada uno)
    xl, yfr, zt0 = xr0 - TK, yr0 - TK + OY, zc(hr)
    tpc = [hole_z(gx, gy + OY, 12.0) for gx, gy in rb["pasacables"]]
    tpc += [slot_z(xb, yr0 + 9 + OY, 3.2, 8.0, "y") for xb in rb["bridas_tapa"]]
    tpc.append(box(xl - 0.1, xl + RTK, yfr - 0.1, yfr + RTK, zt0 - 0.1, zt0 + TK + 0.1))                   # alivio de esquina
    fpc = vent_slots_y(rb["vent_x"][0], rb["vent_x"][1], zc(rb["vent_z"][0]), zc(rb["vent_z"][1]), L=20)
    fpc += [hole_y(gx, zc(gz), 12.0) for gx, gz in rb.get("pasacables_frente", [])]
    px0, px1, py0, py1 = Xin1 - 32, Xin1 - 12, yr0, yr0 + 14                                          # pestaña derecha (del frente, hacia dentro)
    qx0, qx1 = xr0 - TK - 14, xr0 - TK                                                                  # pestaña izquierda (del lateral, hacia fuera)
    hp_der, hp_izq = ((px0 + px1) / 2, (py0 + py1) / 2), ((qx0 + qx1) / 2, None)
    qy0, qy1 = rb.get("fij_izq_y", (Yin - 28, Yin - 10))
    hp_izq = (hp_izq[0], (qy0 + qy1) / 2)
    fpc += [box(px0 - TK, px0, yfr - 0.1, yfr + TK + 0.1, zc(0) - 0.1, zc(0) + RTK + 0.5),
            box(px1, px1 + TK, yfr - 0.1, yfr + TK + 0.1, zc(0) - 0.1, zc(0) + RTK + 0.5)]                 # alivios de la pestaña
    lpc = [box(xl - 0.1, xl + TK + 0.1, qy0 + OY - TK, qy0 + OY, zc(0) - 0.1, zc(0) + RTK + 0.5),
           box(xl - 0.1, xl + TK + 0.1, qy1 + OY, qy1 + OY + TK, zc(0) - 0.1, zc(0) + RTK + 0.5),
           box(xl - 0.1, xl + TK + 0.1, Yin + OY - ALA_K - 0.5, Yin + OY + 0.1, zc(0) - 0.1, zc(0) + RTK + 0.5)]   # pestaña de abajo de la trasera
    fpc.append(box(Xin1 - TK - 0.1, Xin1 + 0.1, yfr - 0.1, yfr + TK + 0.1, zc(0) - 0.1, zc(0) + TK + 0.1))         # radio del pliegue derecho del cuerpo
    ch = Chapa("Caja de red", t=TK)
    ch.cara("tapa", (xl, Xin1, yfr, Yin + OY, zt0, zt0 + TK), tpc)
    ch.cara("frente", (xl, Xin1, yfr, yfr + TK, zc(0), zt0 + TK), fpc)
    ch.cara("lateral", (xl, xl + TK, yfr + TK, Yin + OY, zc(0), zt0 + TK), lpc)
    ch.pliegue("tapa", "frente", rangos=[(xl + RTK, Xin1)]).pliegue("tapa", "lateral", rangos=[(yfr + RTK, Yin + OY)])
    ch.cara("pest_der", (px0, px1, yfr, py1 + OY, zc(0), zc(0) + TK), [hole_z(hp_der[0], hp_der[1] + OY, 4.5)])
    ch.cara("pest_izq", (qx0, xr0, qy0 + OY, qy1 + OY, zc(0), zc(0) + TK), [hole_z(hp_izq[0], hp_izq[1] + OY, 4.5)])   # en esquina viva llega a la cara de dentro del lateral
    ch.pliegue("frente", "pest_der").pliegue("lateral", "pest_izq")
    m.fab("K", "Caja de red (230 V)", None, COL_RED, movil=mv, chapa=ch,
          notas="Una sola chapa: tapa, frente y lateral doblados, con una pestaña de fijación al pie del frente (hacia dentro) y otra al pie "
                "del lateral (hacia fuera). Cierra la fuente y la C14; se quita con 2 tuercas M4. Pasacables para 5 V y tierra; rejilla abajo; "
                "encima van WAGO, fusibles y bornes USB")
    for xc, yc in (hp_der, hp_izq):
        m.compra("H06", "Espárrago M4×10 (fija la caja de red)", place_parts(C.esparrago_m4(10, (0, 0, 1)), at=(xc, yc + OY, zc(0))), movil=mv)

    # ------------------------------------------------------------------ COMPONENTES Y SOPORTES
    colocar_componentes(m, spec, lay, L, dict(OX=OX, OY=OY, OZ=OZ, Yin=Yin, Xin0=Xin0, Xin1=Xin1, Kx0=Kx0, Kx1=Kx1,
                                               Ky0=Ky0, Ky1=Ky1, Kz0=Kz0, Ktop=Ktop, Hw=Hw, W=W, D=D, pe_h=pe_h, tapa=tapa))
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
    RT = 2 * T
    yf, yb, zt = d["y_front"], d["y_back"], d["z_top"]
    # cuerpo en U: fondo con la delantera y la trasera dobladas hacia arriba. Las 3 ventanas cruzan el pliegue de la delantera
    # (las pajitas salen rodando a ras del fondo): el pliegue se hace a tramos, entre ventana y ventana
    ven = [(xc - d["L_ran"] / 2, xc + d["L_ran"] / 2) for xc in d["centros"]]
    tramos, a = [], x0
    for v0, v1 in ven:
        tramos.append((a, v0)); a = v1
    tramos.append((a, x1))
    ch = Chapa("Cuerpo del cajón de pajitas", t=T)
    ch.cara("fondo", (x0, x1, yf, yb, zf0, zf1), [box(v0, v1, yf - 1, yf + RT + 1, zf0 - 1, zf1 + 1) for v0, v1 in ven])
    ch.cara("delantera", (x0, x1, yf, yf + T, zf0, zt), [box(v0, v1, yf - 1, yf + T + 1, zf0 - 1, zf1 + d["A_ran"]) for v0, v1 in ven])
    ch.cara("trasera", (x0, x1, yb - T, yb, zf0, zt))
    ch.pliegue("fondo", "delantera", rangos=tramos).pliegue("fondo", "trasera")
    m.fab("P", "Cuerpo del cajón (fondo, delantera y trasera)", None, COL_CAJON, movil=mv, chapa=ch,
          notas="U con 2 pliegues. Las 3 ventanas (alineadas con las ranuras del panel) cruzan el pliegue de la delantera: ese pliegue va a tramos")
    # 4 tabiques iguales (extremo derecho, cierre izquierdo y 2 separadores): chapa con pestañas delante, detrás y abajo,
    # soldadas por puntos al cuerpo. La pestaña de delante empieza por encima de las ventanas
    ALA = 12.0                       # 04-11-2026: era 10; con chapa de 3 mm la pestaña mínima para plegar es de unos 12 mm
    yi0, yi1, z_del = yf + T, yb - T, zf1 + d["A_ran"] + 1.7

    def tabique(xo, sg):
        # las pestañas delantera y trasera empiezan a la misma altura (z_del, por encima de las ventanas): así la pieza es
        # simétrica y el tabique derecho (pestañas hacia -x) es uno de los otros girado 180°, no su espejo -> 4 piezas iguales
        fx, ax = sorted((xo, xo + sg * T)), sorted((xo, xo + sg * ALA))
        c = Chapa("Tabique del cajón de pajitas", t=T)
        c.cara("tabique", (fx[0], fx[1], yi0, yi1, zf1, zt),
               [box(fx[0] - 0.1, fx[1] + 0.1, yi0 - 0.1, yi0 + RT, zf1 - 0.1, z_del),
                box(fx[0] - 0.1, fx[1] + 0.1, yi1 - RT, yi1 + 0.1, zf1 - 0.1, z_del)])
        c.cara("del", (ax[0], ax[1], yi0, yi0 + T, z_del, zt))
        c.cara("tras", (ax[0], ax[1], yi1 - T, yi1, z_del, zt))
        c.cara("inf", (ax[0], ax[1], yi0 + RT, yi1 - RT, zf1, zf1 + T))
        c.pliegue("tabique", "del").pliegue("tabique", "tras").pliegue("tabique", "inf")
        return c
    nt = ("Las 4 son la misma pieza: el tabique derecho es otro girado 180°. "
          "Pestañas de 10 mm soldadas por puntos a la delantera, a la trasera y al fondo")
    m.fab("P", "Tabique: extremo derecho", None, COL_CAJON, movil=mv, chapa=tabique(x1, -1), codigo="TABIQUE", notas=nt)
    m.fab("P", "Tabique: cierre izquierdo (detrás de la tapa)", None, COL_CAJON, movil=mv, chapa=tabique(x0, 1), codigo="TABIQUE",
          notas=nt + ". La tapa se suelda por puntos a su cara")
    for k, xs in enumerate(d["sep"]):
        m.fab("P", f"Tabique: separador {k + 1}", None, COL_CAJON, movil=mv, chapa=tabique(xs - T / 2, 1), codigo="TABIQUE", notas=nt)
    tapa = box(d["x_tapa0"], d["x_tapa1"], T + 15.0 + 0.5, D - T - 0.5, T + 0.3, Z_HUECO - 0.5)
    m.fab("P", "Tapa (cierra el hueco del lateral izquierdo)", tapa, COL_CAJON, movil=mv,
          notas="Chapa plana soldada por puntos al tabique del cierre izquierdo. Sin tirador: se tira de las anillas de los candados")
    # dos pares de anillas (chapa de 3 mm): una en la franja fija del lateral y otra en la tapa del cajón, una encima de la otra
    xe = -W / 2
    xh, yh = xe - 11.0, 9.0                                  # centro de los agujeros Ø9
    for k, z in enumerate(ZA_CANDADOS):
        fija = cut_all(box(xe - 18, xe, 3.0, 15.0, z, z + 3), [hole_z(xh, yh, 9.0)])
        m.fab("C", f"Anilla para candado {k + 1} (lateral)", fija, COL_CHAPA_OSC, material="Acero DC01 3 mm", espesor=3.0, codigo="ANILLA_FIJA",
              notas="Soldada (MIG, todo alrededor) a la franja fija del lateral izquierdo, delante del hueco del cajón. Agujero Ø9")
        movil_ = cut_all(box(xe - 18, xe, 3.0, 30.0, z + 3.2, z + 6.2), [hole_z(xh, yh, 9.0)])
        m.fab("P", f"Anilla para candado {k + 1} (tapa del cajón)", movil_, COL_CAJON, material="Acero DC01 3 mm", movil=mv, espesor=3.0, codigo="ANILLA_CAJON",
              notas="Soldada (MIG, todo alrededor) a la tapa del cajón; vuela por delante y queda encima de la anilla fija. También sirve de tirador")
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
        RT = 2 * T
        xd = W / 2 + 0.5 + T                                   # canto derecho de la tapa: 0,5 mm de aire + el faldón derecho
        ch = Chapa("Tapa superior", t=T)
        ch.cara("tapa", (-W / 2, xd, 0, D, Hw, Hw + T), [box(xd - RT, xd + 1, -1, RT, Hw - 1, Hw + T + 1)])    # alivio de esquina
        ch.cara("faldon_del", (-W / 2, W / 2 + 0.3, 0, T, Hp + 0.5, Hw + T), [hole_y(x, zl, 18.0) for x, sg in cer])
        ch.cara("faldon_der", (W / 2 + 0.5, xd, 0, D, zi0 - 4.0, Hw + T))
        ch.pliegue("tapa", "faldon_del", rangos=[(-W / 2, xd - RT)]).pliegue("tapa", "faldon_der", rangos=[(RT, D)])
        m.fab("T", "Tapa superior (con faldón delantero y derecho)", None, COL_TAPA, movil=mv, chapa=ch,
              notas="Una chapa con 2 pliegues. Abre hacia la izquierda con bisagra de piano remachada. Faldón delantero con el taladro Ø18 "
                    "de la cerradura. Cerrada, el faldón derecho tapa por fuera la ranura de la tapa interior y la de la leva: la tapa "
                    "interior no se puede sacar sin abrir con llave")
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
        b = box(xs0, xs1, 6.0 + OY, 6.0 + T + OY, z0 + OZ, z1 + OZ)
        zst = (z0 + z1) / 2 + (-1.2 if z0 < sz else 1.2)
        b = cut_all(b, [hole_y(sx - 5, zst + OZ, 4.5), hole_y(sx + 170, zst + OZ, 4.5)])
        m.fab("S", nombre, b, COL_SOP, movil=mv, codigo="PLETINA", notas="Aprieta el borde del vidrio contra el frente (con burlete de goma). Las dos son la misma pieza")
        for xx in (sx - 5, sx + 170):
            m.compra("H07", "Espárrago M4×20 (pletina)", place_parts(C.esparrago_m4(13), at=L(xx, 0, zst)), movil=mv)
            m.compra("H09", "Separador 6 mm", place_parts(C.separador(6.0), at=L(xx, 0, zst)), movil=mv)
    # ---- Solo con repisa y contraplaca
    ox, oz = lay["solo"]
    m.compra("E02", "SumUp Solo", place_parts(C.solo(), at=L(ox, 0, oz)), movil=mv, electrico=True)
    w, h = C.SOLO["w"], C.SOLO["h"]
    ch = Chapa("Repisa del Solo", t=T)
    ch.cara("repisa", (ox - 3, ox + w + 3, OY, OY + 22, oz - T + OZ, oz + OZ), [box(ox + w / 2 - 8, ox + w / 2 + 8, OY + 3, OY + 30, oz - 5 + OZ, oz + 5 + OZ)])
    ch.cara("ala", (ox - 3, ox + w + 3, OY, OY + T, oz + OZ - 13.5, oz + OZ))
    ch.pliegue("repisa", "ala", rangos=[(ox - 3, ox + w / 2 - 8), (ox + w / 2 + 8, ox + w + 3)])   # a tramos: la muesca de la clavija USB-C corta el pliegue
    m.fab("S", "Repisa del Solo", None, COL_SOP, movil=mv, chapa=ch,
          notas="Angular: el ala de 13,5 mm hacia abajo se suelda por puntos al frente del cajón; muesca de 16 mm para la clavija USB-C")
    cp = box(ox - 9, ox + w + 9, OY + 19.6, OY + 19.6 + T, oz + 18 + OZ, oz + 60 + OZ)
    cp = cut_all(cp, [hole_y(ox - 5, oz + 39 + OZ, 4.5), hole_y(ox + w + 5, oz + 39 + OZ, 4.5)])
    m.fab("S", "Contraplaca del Solo", cp, COL_SOP, movil=mv, notas="Aprieta el Solo por detrás con goma de 2 mm")
    for xx in (ox - 5, ox + w + 5):
        m.compra("H07", "Espárrago M4×20 (Solo)", place_parts(C.esparrago_m4(26), at=L(xx, 0, oz + 39)), movil=mv)
        m.compra("H09", "Separador 19,6 mm", place_parts(C.separador(19.6), at=L(xx, 0, oz + 39)), movil=mv)
    # ---- cámara
    cx, cz = lay["camara"]
    m.compra("E03", "Camera Module 3", place_parts(C.camara(), at=L(cx, C.CAM["sep"], cz)), movil=mv, electrico=True)
    # ---- Raspberry Pi + módem 4G (en el USB de abajo, donde iba el AR9271)
    px, pz = lay["pi"]
    py = Yin - C.PI["pcb"] - C.PI["sep"]
    m.compra("E04", "Raspberry Pi 3B+", place_parts(C.raspberry(), at=L(px, py, pz)), movil=mv, electrico=True)
    m.compra("E05", "Módem 4G USB Huawei E3372h-320", place_parts(C.modem_4g(), at=L(*lay["modem"])), movil=mv, electrico=True,
             notas="Enchufado en el USB de abajo de la Pi, con la SIM de datos dentro. La antena plana va a su toma CRC9 principal")
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
    m.compra("H10", "Pasacables de la boquilla", place_parts(C.arandela_pasacables(4.5, 7.5), at=L(bx, -TK / 2, bz)), movil=mv)
    # ---- espárrago de tierra del cajón
    pe = lay["pe_cajon"]
    m.compra("H07", "Espárrago de tierra M4×20 (cajón)", place_parts(C.esparrago_m4(20, (-1, 0, 0)), at=(g["Kx1"] - TK, pe[0] + OY, pe[1] + OZ)),
             movil=mv, electrico=True)
    m.cotas["pe_cajon"] = (g["Kx1"] - TK, pe[0] + OY, pe[1] + OZ)
    # ---- pasacables de la tapa de red
    for gx, gy in rb["pasacables"]:
        m.compra("H10", "Pasacables caja de red", place_parts(C.arandela_pasacables(4.5, 7.5, (0, 0, 1)), at=L(gx, gy, rb["alto"] + TK / 2)), movil=mv)
    for gx, gz in rb.get("pasacables_frente", []):
        m.compra("H10", "Pasacables caja de red", place_parts(C.arandela_pasacables(4.5, 7.5, (0, 1, 0)), at=L(gx, Yin - rb["fondo"] - TK / 2, gz)), movil=mv)
    # ---- antena 4G plana, pegada en el soporte de policarbonato del lateral izquierdo del cajón (dentro, nada por fuera)
    Kx0 = g["Kx0"]
    sa_ = box(Kx0 + TK, Kx0 + TK + PC_A, VK_Y[0] - VK_PC, VK_Y[1] + VK_PC, VK_Z[0] - VK_PC, VK_Z[1] + VK_PC)
    m.fab("S", "Soporte de la antena 4G (policarbonato 2 mm)", sa_, COL_PC, material="Policarbonato compacto 2 mm",
          proceso="Corte con sierra o cúter", movil=mv, espesor=PC_A,
          notas=f"Pegado con cinta VHB por dentro del lateral izquierdo del cajón, pisando {VK_PC:.0f} mm la chapa alrededor de su ventana. "
                "La antena plana va pegada encima. Viaja con el cajón: al sacarlo no hay que soltar ningún cable de la antena")
    xa = Kx0 + TK + PC_A
    m.compra("E12", "Antena 4G plana (FPC)", place_parts(C.antena_fpc(), at=(xa, ANT_C[0], ANT_C[1])), movil=mv, electrico=True,
             notas="Pegada sobre el soporte de 2 mm, enfrente de las dos ventanas; el cable sale por arriba hacia el módem")
    g["antena_l"] = (xa + 0.8 - g["OX"], ANT_C[0] - OY, ANT_C[1] + C.FPC["largo"] / 2 + 1.5 - OZ)   # salida del cable (local)
    m.cotas["antena"] = (xa, ANT_C[0], ANT_C[1])
    # ---- cables y tubos
    lay["cables"](m, L, g)
