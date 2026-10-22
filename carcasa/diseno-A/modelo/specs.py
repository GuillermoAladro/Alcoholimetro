"""
Diseño A · Compacta (el elegido; B y C se eliminaron el 21-10-2026). Todas las posiciones de componentes están en coordenadas LOCALES del cajón de componentes:
  x = igual que el mundo (0 = centro de la máquina)
  y = 0 en la cara trasera de la chapa frontal del cajón (crece hacia atrás)
  z = 0 en la cara superior de la base del cajón
Los cables se dibujan con puntos de paso; sus extremos salen de la posición real de cada conector.
"""
import comp as C

T = 1.5
GRIS_CABLE = (0.15, 0.15, 0.16)
ROJO, NEGRO_C, AZUL, MARRON, VERDE_AM = (0.85, 0.15, 0.12), (0.08, 0.08, 0.08), (0.15, 0.35, 0.85), (0.50, 0.30, 0.12), (0.55, 0.75, 0.15)
FFC, SILICONA, COAX, DUPONT, LATON_C = (0.92, 0.88, 0.75), (0.90, 0.92, 0.95), (0.20, 0.20, 0.22), (0.95, 0.75, 0.10), (0.80, 0.62, 0.25)


def usb_de_pie(x, z_arriba, y_cara):
    """Borne USB-A de pie contra una cara (boca USB arriba). Ocupa x..x+21, z 0..z_arriba, y y_cara-12..y_cara."""
    return dict(at=(x, y_cara, z_arriba), ex=(0, 0, -1), ey=(1, 0, 0), ez=(0, -1, 0))


def fusible_de_pie(x, z, y_cara):
    """Portafusibles de canto contra una cara: x..x+45, z..z+14, y y_cara-11..y_cara."""
    return dict(at=(x, y_cara, z), ex=(1, 0, 0), ey=(0, 0, 1), ez=(0, -1, 0))


def tumbado(x, y, z=0.0):
    return dict(at=(x, y, z))


# ---------------------------------------------------------------- puntos de conexión (locales)
def puntos(L):
    """Calcula los extremos de cada cable a partir de la colocación de los componentes."""
    sx, sz = L["pantalla"]
    ox, oz = L["solo"]
    cx, cz = L["camara"]
    px, pz = L["pi"]
    zx, zy, zz = L["ze29a"]
    fx, fz = L["fuente"]
    Yin, Xin1 = L["Yin"], L["Xin1"]
    py = Yin - C.PI["pcb"] - C.PI["sep"]
    c14y, c14z = L["c14"]
    P = dict(
        hdmi_pant=(sx - 9, 16.5, sz + 25.5), usbc_pant=(sx - 7, 13.5, sz + 46.5),
        usbc_solo=(ox + C.SOLO["w"] / 2, 8.5, oz - 14),
        hdmi_pi=(px + 32, py - 3.3, pz - 2), musb_pi=(px + 10.6, py - 2.3, pz - 1.5),
        csi_pi=(px + 45, py - 5.6, pz + 23), gpio=(px + 17, py - 8.5, pz + 52.5),
        rpsma=(px + 75.1 + 93, py - 4.3, pz + 29),
        cam=(cx + 12.5, 12.0, cz + 2.75), ze_j1=(zx + 80.5, zy - 6.5, zz + 16.5),
        ze_alc=(zx + 22, zy - 4, zz + 39), ze_pre=(zx + 66, zy - 4, zz + 39),
        psu_L=(fx - 7, Yin - 31.5, fz + 64.5), psu_N=(fx - 7, Yin - 31.5, fz + 55), psu_FG=(fx - 7, Yin - 31.5, fz + 45.5),
        psu_neg=(fx - 7, Yin - 31.5, fz + 36), psu_pos=(fx - 7, Yin - 31.5, fz + 26.5),
        c14_in=(Xin1 + T - 29, c14y, c14z), boq=(L["boquilla"][0], 0.0, L["boquilla"][1]),
    )
    for k, d in enumerate(L["usb"]):
        x, y, z = d["at"]
        P[f"usb{k}"] = (x + 10.5, y - 6, z + 0.5)
    for k, d in enumerate(L["fusibles"]):
        x, y, z = d["at"]
        if d.get("ey") == (0, 0, 1):      # de canto
            P[f"fus{k}_a"], P[f"fus{k}_b"] = (x - 1, y - 5.5, z + 7), (x + 46, y - 5.5, z + 7)
        else:
            P[f"fus{k}_a"], P[f"fus{k}_b"] = (x - 1, y + 7, z + 5.5), (x + 46, y + 7, z + 5.5)
    for k, d in enumerate(L["wago"]):
        x, y, z = d["at"]
        P[f"wago{k}"] = (x + 15, y - 1, z + 4)
    return P


def cables_de(m, Lf, g, lista):
    for nombre, pts, r, col, tipo in lista:
        m.cable(nombre, [Lf(*q) for q in pts], r, col, tipo=tipo)


def pe_carcasa_local(g):
    pe = g["pe_h"]
    return (pe[0] - g["OX"], pe[1] - 10 - g["OY"], pe[2] - g["OZ"])


def k_top(g):
    return g["Ktop"] - g["OZ"]


def agujeros_comunes(L):
    fx, fz = L["fuente"]
    px, pz = L["pi"]
    zx, zy, zz = L["ze29a"]
    a = [(fx - ax, fz + C.FUENTE["W"] - az) for ax, az in C.FUENTE["agujeros"]]
    a += [(px + ax, pz + az) for ax, az in C.PI_AGUJEROS]
    a += [(zx + ax, zz + az) for ax, az in ((4, 4), (81, 4), (4, 29), (81, 29))]
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
    L = dict(Yin=Yin, Xin1=Xin1,
             pantalla=(-82.5, 12.0), solo=(6.5, 136.0), camara=(-67.5, 185.5), boquilla=(-55.0, 150.0),
             pi=(-101.0, 99.0), fuente=(60.0, 3.0), ze29a=(-101.0, Yin - 9.6, 162.0), c14=(Yin - 18.0, 50.0),
             red=dict(x0=-43.0, alto=88.0, fondo=36.0, pasacables=[(86.0, Yin - 9.0)], pasacables_frente=[(50.0, 75.0)],
                      bridas_tapa=[], vent_x=(-30.0, 25.0), vent_z=(8.0, 22.0)),
             escape=(50.0, 212.0), escape_lado="izq", pe_cajon=(60.0, 100.0),
             wago=[tumbado(-60.0, 14.0), tumbado(-26.0, 14.0)],
             usb=[usb_de_pie(-95.0, 50.0, yf - 0.2), usb_de_pie(77.0, 50.0, yf - 0.2)],
             fusibles=[fusible_de_pie(28.0, 2.0 + 16 * i, yf - 0.2) for i in range(4)],
             bridas_trasera=[(-80.0, 75.0), (-10.0, 120.0), (60.0, 150.0)],
             topes_frente=[-80.0, 80.0], rejillas_izq=[(12.0, 40.0), (176.0, 196.0)], rejillas_der=[(186.0, 212.0)],
             )
    L["agujeros_trasera"] = agujeros_comunes(L)

    def cables(m, Lf, g):
        P = puntos(L)
        kt = k_top(g)
        peh, ant = pe_carcasa_local(g), g["antena_l"]
        pe_c = (Xin1 - 12, 60.0, 100.0)
        lista = [
            ("HDMI 90° pantalla → Pi", [P["hdmi_pant"], (-99, 24, 40), (-101, 40, 60), (-69, 50, 80), P["hdmi_pi"]], 3.0, GRIS_CABLE, "cable"),
            ("USB-C pantalla ← borne USB", [P["usbc_pant"], (-100, 20, 62), (-90, 26, 85), (P["usb0"][0], P["usb0"][1], 80), P["usb0"]], 2.0, GRIS_CABLE, "cable"),
            ("USB-C Solo ← borne USB", [P["usbc_solo"], (48, 17, 110), (60, 17, 80), (P["usb1"][0], P["usb1"][1], 78), P["usb1"]], 2.0, GRIS_CABLE, "cable"),
            ("Micro-USB Pi ← fusible 3 A", [P["fus0_a"], (20, 22, 30), (-40, 22, 50), (-92, 44, 80), P["musb_pi"]], 1.6, ROJO, "cable"),
            ("Cinta de cámara (FFC 15 pines, 200 mm)", [P["cam"], (-55, 30, 180), (-55, 44, 150), P["csi_pi"]], 1.0, FFC, "cinta"),
            ("UART + 5 V sensor (JST)", [P["gpio"], (-60, 50, 160.5), (-22, 52, 166), P["ze_j1"]], 1.4, DUPONT, "cable"),
            ("5 V sensor ← fusible 2 A", [P["ze_j1"], (-10, 44, 150), (10, 32, 90), P["fus3_a"]], 1.2, ROJO, "cable"),
            ("5 V fuente → WAGO (0,75 mm²)", [P["psu_pos"], (50, 33, 75), (50, 28, 75), (-20, 25, 20), P["wago0"]], 2.2, ROJO, "cable"),
            ("0 V fuente → WAGO (0,75 mm²)", [P["psu_neg"], (49, 33, 76), (48, 28, 76), (10, 25, 22), P["wago1"]], 2.2, NEGRO_C, "cable"),
            ("230 V C14 → fuente (1,5 mm²)", [P["c14_in"], (66, 46, 60), P["psu_L"]], 2.4, MARRON, "cable"),
            ("Tierra C14 → espárrago del cajón", [(P["c14_in"][0], P["c14_in"][1] + 6, 40), (84, 62, 80), (86, Yin - 9, 89.5), (88, 60, 100), pe_c], 2.0, VERDE_AM, "cable"),
            # los dos puentes cruzan el borde trasero del cajón por detrás del asidero derecho y por debajo del saliente trasero
            # (1,5 mm² Ø3 y RG174 Ø2,8: caben en los 4,5 mm que hay entre el borde del cajón y el saliente trasero)
            ("Puente de tierra cajón → carcasa (faston)", [pe_c, (75, 68.5, 155), (60, 69, 165), (60, 69, kt + 1.8), (56, Yin + 7, kt + 1.8), (peh[0] + 2, peh[1], peh[2] + 15), peh], 1.5, VERDE_AM, "puente"),
            ("Coaxial antena (RP-SMA, se desenrosca)", [P["rpsma"], (71, 59.5, 131), (68, 61, 165), (66, 69, 185), (66, 69, kt + 1.8), (88, Yin + 7, kt + 1.8), (ant[0], ant[1], ant[2] + 25), ant], 1.4, COAX, "puente"),
            ("Tubo de soplido (silicona 6 mm)", [P["boq"], (-55, 18, 150), (-20, 25, 160), (-20, 26, 205), (-20, 50, 212), (P["ze_pre"][0], 50, 212)], 4.5, SILICONA, "tubo"),
            ("Restricción + toma de alcohol", [(P["ze_pre"][0], 50, 212), (P["ze_alc"][0], 50, 212)], 4.5, LATON_C, "tubo"),
            ("Escape del soplido", [(P["ze_alc"][0], 50, 212), (-95, 50, 212), (k["Xin0"], 50, 212)], 4.5, SILICONA, "tubo"),
            ("Toma de presión", [(P["ze_pre"][0], 50, 208), P["ze_pre"]], 2.0, SILICONA, "tubo"),
            ("Toma de alcohol", [(P["ze_alc"][0], 50, 208), P["ze_alc"]], 2.0, SILICONA, "tubo"),
        ]
        cables_de(m, Lf, g, lista)

    L["cables"] = cables
    return L


SPEC_A = dict(letra="A", nombre="Compacta", W=220.0, D=103.0, Hk=228.0, tapa="lateral", bisagra="izq", asa="x", layout=layout_A,
              descripcion="Cámara y Solo arriba, pantalla debajo. Policarbonato delante y detrás del panel. Tapa abatible con cerradura y faldón derecho; tapa interior plana que entra deslizando por una ranura del lateral derecho; cajón de pajitas con dos candados. Sin botón.")
