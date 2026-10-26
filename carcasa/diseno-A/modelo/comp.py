"""
Modelos 3D de los componentes comprados (electrónica y herrajes), a tamaño real.

Cada función devuelve una lista de (subnombre, sólido, color) en coordenadas LOCALES del componente.
Esa lista es un `Partes`: además recuerda qué modelo detallado del visor la representa (`modelo`), para que
el visor dibuje la pieza con su aspecto real (modelos_elec.js / modelos_herr.js) en el mismo sitio.
Los sólidos de aquí son la envolvente que usan las comprobaciones de choques y los STEP.

Convenio de ejes en todo el proyecto:
    X = ancho (izquierda -> derecha mirando la máquina de frente)
    Y = fondo (0 = cara exterior del panel frontal; +Y hacia atrás)
    Z = alto (0 = suelo de la máquina)
Las medidas salen de fichas oficiales, de los anuncios de Amazon y de las fotos de referencia (ver FUENTES al final).
"""
import math
import cadquery as cq

V = cq.Vector


class Partes(list):
    """Lista de (subnombre, sólido, color) con el modelo detallado del visor que la representa."""
    def __init__(self, it=(), modelo=None):
        super().__init__(it)
        self.modelo = modelo


def _m(nombre, *args):
    return dict(n=nombre, a=[list(a) if isinstance(a, tuple) else a for a in args])


def box(x0, x1, y0, y1, z0, z1):
    return cq.Solid.makeBox(x1 - x0, y1 - y0, z1 - z0, V(x0, y0, z0))


def cyl(r, h, p, d):
    return cq.Solid.makeCylinder(r, h, V(*p), V(*d))


def fuse(lst):
    lst = [s for s in lst if s is not None]
    return lst[0].fuse(*lst[1:]).clean() if len(lst) > 1 else lst[0]


# colores (r, g, b)
NEGRO = (0.10, 0.10, 0.11)
GRIS = (0.55, 0.57, 0.60)
GRIS_OSC = (0.25, 0.26, 0.28)
VERDE_PCB = (0.10, 0.45, 0.25)
AZUL_PANT = (0.10, 0.18, 0.35)
BLANCO = (0.92, 0.93, 0.94)
METAL = (0.78, 0.79, 0.80)
DORADO = (0.85, 0.68, 0.25)
NARANJA = (0.95, 0.50, 0.10)
ROJO = (0.80, 0.12, 0.10)
GOMA = (0.15, 0.15, 0.15)
TRANSP = (0.85, 0.90, 0.95)
LATON = (0.80, 0.62, 0.25)
AZUL_CELDA = (0.12, 0.37, 0.84)


# ---------------------------------------------------------------- pantalla GeeekPi EP-0170
PANT = dict(w=165.0, h=100.0, t_vidrio=6.0, act_w=154.21, act_h=85.92)


def pantalla():
    """Origen: esquina inferior izquierda de la cara del vidrio (y=0 cara delantera, crece hacia atrás).
    Detrás del módulo LCD va la controladora (placa negra de 96 × 52) con HDMI, USB-C y ruleta en el canto izquierdo."""
    w, h, tv = PANT["w"], PANT["h"], PANT["t_vidrio"]
    ax0, az0 = (w - PANT["act_w"]) / 2, (h - PANT["act_h"]) / 2
    return Partes([
        ("panel", box(0, w, 0, tv, 0, h), NEGRO),
        ("area_activa", box(ax0, ax0 + PANT["act_w"], -0.2, 0, az0, az0 + PANT["act_h"]), AZUL_PANT),
        ("controladora", box(0, 96, tv, tv + 1.65, 12, 64), (0.08, 0.08, 0.09)),
        ("componentes", box(20, 75, tv + 1.65, tv + 2.8, 18, 46), GRIS_OSC),
        ("fpc", box(96, 112, tv, tv + 0.2, 30, 70), (0.85, 0.55, 0.20)),
        # conectores en el canto izquierdo (visto de frente), según fotos del anuncio
        ("hdmi_hembra", box(-0.5, 12, tv + 1.65, tv + 7.65, 18, 33), METAL),
        ("usbc_hembra", box(-0.5, 7.5, tv + 1.65, tv + 5.05, 42.5, 51.5), METAL),
        ("ruleta", cyl(3, 5, (-0.6, tv + 4.65, 70), (1, 0, 0)), NEGRO),
    ], _m("pantalla"))


def clavija_hdmi90():
    """Clavija HDMI acodada (cable E16) en la boca de la pantalla; el cable sale hacia atrás."""
    tv = PANT["t_vidrio"]
    return Partes([("clavija_hdmi_90", box(-12.9, -0.5, tv + 1.65 - 2, tv + 1.65 + 20.5, 15.3, 35.7), NEGRO)], _m("clavija_hdmi90_pantalla"))


def clavija_usbc90():
    """Clavija USB-C acodada (cable E17) en la boca de la pantalla; el cable sale hacia atrás."""
    tv = PANT["t_vidrio"]
    return Partes([("clavija_usbc_90", box(-9.3, -0.5, tv + 1.65 - 2.3, tv + 1.65 + 14.0, 40.8, 53.2), NEGRO)], _m("clavija_usbc90_pantalla"))


# ---------------------------------------------------------------- SumUp Solo
SOLO = dict(w=83.16, h=83.02, t=17.6)


def solo():
    """Origen: esquina inferior izquierda de la cara frontal. USB-C en el canto de abajo, centrado (con su clavija acodada)."""
    w, h, t = SOLO["w"], SOLO["h"], SOLO["t"]
    return Partes([
        ("cuerpo", box(0, w, 0, t, 0, h), BLANCO),
        ("pantalla_tactil", box(5, w - 5, -0.15, 0, 5, h - 5), (0.05, 0.05, 0.07)),
        ("tecla_encendido", box(w - 0.01, w + 0.6, 6, 12, 56, 68), GRIS_OSC),   # tecla de encendido del propio Solo
        ("clavija_usbc_90", box(w / 2 - 6.2, w / 2 + 6.2, t / 2 - 3.6, t / 2 + 12.5, -8.8, 0), NEGRO),
    ], _m("solo"))


# ---------------------------------------------------------------- Camera Module 3
CAM = dict(w=25.0, h=24.0, pcb=1.0, lente_x=12.5, lente_z=24.0 - 9.462, lente_alto=9.5, sep=8.0)


def camara():
    """Origen: esquina inferior izquierda de la cara DELANTERA de la placa (y=0).
    Módulo de la lente: carcasa de 11,4 × 11,4 (foto) y barril que sobresale 9,5 mm hacia delante.
    Agujeros Ø2,2 (M2) a 2 mm de los bordes; separadores hexagonales de nailon de 8 mm hacia delante."""
    w, h, p = CAM["w"], CAM["h"], CAM["pcb"]
    lx, lz, la = CAM["lente_x"], CAM["lente_z"], CAM["lente_alto"]
    agujeros = [(2, 2), (23, 2), (2, h - 9.5), (23, h - 9.5)]
    sol = [("placa", box(0, w, 0, p, 0, h), VERDE_PCB),
           ("lente_soporte", box(lx - 5.7, lx + 5.7, -5.6, 0, lz - 5.7, lz + 5.7), GRIS),
           ("lente", cyl(3.9, la - 5.6, (lx, -5.6, lz), (0, -1, 0)), (0.05, 0.05, 0.06)),
           ("conector_fpc", box(1.5, w - 1.5, p, p + 3, 0, 5.5), (0.9, 0.9, 0.85))]
    for i, (ax, az) in enumerate(agujeros):
        sol.append((f"separador_m2_{i}", cyl(1.6, CAM["sep"], (ax, 0, az), (0, -1, 0)), NEGRO))
    return Partes(sol, _m("camara", dict(separadores=CAM["sep"])))


# ---------------------------------------------------------------- Raspberry Pi 3B+ (plano RP-008337)
PI = dict(w=85.0, h=56.0, pcb=1.4, sep=6.0)
PI_AGUJEROS = [(3.5, 3.5), (61.5, 3.5), (3.5, 52.5), (61.5, 52.5)]


def raspberry():
    """Origen: esquina inferior izquierda de la placa, cara de componentes en y=0 mirando hacia -Y.
    Placa en el plano XZ (de canto, pegada a una chapa trasera con separadores de 6 mm detrás)."""
    p = PI["pcb"]
    c = lambda x0, x1, z0, z1, alto, col=METAL: box(x0, x1, -alto, 0, z0, z1)
    s = [("placa", box(0, 85, 0, p, 0, 56), VERDE_PCB),
         ("usb_1", c(69.6, 87.1, 40.45, 53.55, 16.0), METAL),
         ("usb_2", c(69.6, 87.1, 22.45, 35.55, 16.0), METAL),
         ("ethernet", c(65.5, 87.75, 2.25, 18.25, 13.5), METAL),
         ("hdmi", c(24.5, 39.5, -1.0, 11.5, 6.5), METAL),
         ("micro_usb", c(6.6, 14.6, -1.0, 4.6, 3.0), METAL),
         ("audio", c(50.5, 56.5, -2.6, 12.0, 6.0), NEGRO),
         ("csi", c(43.0, 47.0, 1.0, 23.0, 5.5), (0.9, 0.9, 0.85)),
         ("dsi", c(1.0, 5.0, 16.0, 38.0, 5.5), (0.9, 0.9, 0.85)),
         ("gpio", c(7.1, 57.9, 50.0, 55.0, 8.5), NEGRO),
         ("soc", c(24.0, 38.0, 24.0, 38.0, 1.2), GRIS),
         ("microsd", box(-2.5, 12.5, p, p + 1.2, 22.5, 33.5), BLANCO)]
    for i, (ax, az) in enumerate(PI_AGUJEROS):
        s.append((f"separador_m25_{i}", cyl(2.5, PI["sep"], (ax, p, az), (0, 1, 0)), NEGRO))
    return Partes(s, _m("raspberry", dict(separadores=PI["sep"])))


# ---------------------------------------------------------------- adaptador Wi-Fi AR9271 (VBESTLIFE)
def wifi_ar9271():
    """Origen: punta de la clavija USB-A; el adaptador crece hacia +X. Centrado en y=0, z=0."""
    return Partes([("clavija_usb", box(0, 12.3, -2.25, 2.25, -6, 6), METAL),
                   ("cuerpo", box(12, 84, -5.5, 5.5, -11, 11), NEGRO),
                   ("rpsma_hembra", cyl(4.0, 9.2, (84, 0, 0), (1, 0, 0)), DORADO)], _m("wifi_ar9271"))


# ---------------------------------------------------------------- Mean Well LRS-50-5 (ficha LRS-50, caso 239A)
FUENTE = dict(L=99.0, W=82.0, H=30.0, agujeros=[(20.5, 40.5), (75.5, 40.5)])


def fuente():
    """Origen: esquina de la fuente con la regleta de bornes en x=0.
    L (99) en X, W (82) en Z, H (30) en Y. Tapa perforada en y=0 (delante), base con 2 roscas M3 en y=30."""
    L, W, H = FUENTE["L"], FUENTE["W"], FUENTE["H"]
    s = [("chasis", box(0, L, 0, H, 0, W), (0.70, 0.71, 0.73)),
         ("regleta", box(0.2, 13, -1.4, 12, 13, 69), NEGRO)]
    for i in range(5):
        z = 17.5 + 9.5 * i
        s.append((f"borne_{i+1}", cyl(2.6, 1.5, (7, -1.5, z), (0, 1, 0)), METAL))
    s.append(("potenciometro", cyl(1.6, 1.2, (20, -0.0, 72), (0, 1, 0)), (0.9, 0.9, 0.3)))
    return Partes(s, _m("fuente"))


# ---------------------------------------------------------------- toma C14 con portafusibles, SIN interruptor (CABLEPELADO)
# Formato genérico de atornillar: brida 44,7 x 33,1, recorte 31,5 x 27,25, 25 mm de cuerpo, 2 tornillos M3 a 36 mm.
# Se monta girada 90°: los tornillos quedan uno encima de otro y el cajón del fusible al lado del enchufe.
C14 = dict(brida=(44.7, 33.1, 3.0), cuerpo=(27.25, 31.5, 25.0), bornes=8.0, agujeros=[(18.0, 0.0), (-18.0, 0.0)])


def toma_c14():
    """Origen: centro de la cara exterior de la brida (y=0). El cuerpo entra hacia +Y.
    X = eje de los tornillos (vertical una vez montada), Z = enchufe y cajón del fusible uno al lado del otro.
    Medidas típicas de este formato (de otra tienda): confirmar con la pieza recibida."""
    bw, bh, bt = C14["brida"]
    cw, ch, cd = C14["cuerpo"]
    return Partes([("brida", box(-bw / 2, bw / 2, 0, bt, -bh / 2, bh / 2), NEGRO),
                   ("cuerpo", box(-cw / 2, cw / 2, bt, bt + cd, -ch / 2, ch / 2), NEGRO),
                   ("cara", box(-14.6, 14.6, -0.9, 0, -16.2, 16.2), (0.2, 0.2, 0.2)),
                   ("cajon_fusible", box(-11.5, 11.5, -1.15, -0.9, 3.2, 15.2), GRIS_OSC),
                   ("bornes", box(-12, 12, bt + cd, bt + cd + C14["bornes"], -13, 11), METAL)], _m("toma_c14"))


# ---------------------------------------------------------------- WAGO 221-415, borne USB-A, portafusibles
def wago_415():
    """29,9 (X) x 18,6 (Y) x 8,3 (Z), palancas hasta 10,6. Origen en una esquina; bocas de los hilos en y=0."""
    s = [("cuerpo", box(0, 29.9, 0, 18.6, 0, 8.3), TRANSP)]
    for i in range(5):
        s.append((f"palanca_{i}", box(0.5 + i * 5.98, 5.5 + i * 5.98, 2.4, 18.9, 8.3, 10.6), NARANJA))
    return Partes(s, _m("wago_415"))


def borne_usb():
    """Borne USB-A hembra a tornillo: cuerpo negro de 50 x 19 x 12 y bloque de bornes verde de 21 mm. USB en x=0."""
    return Partes([("cuerpo", box(14, 35, 1, 20, 0, 12), NEGRO),
                   ("bornes", box(34.5, 50, 0, 21, 0.5, 11.8), (0.12, 0.6, 0.32)),
                   ("usb_a", box(-0.5, 14, 3.95, 17.05, 3.2, 8.8), METAL)], _m("borne_usb"))


def portafusible(amperios=3):
    """Portafusibles en línea para fusible MINI de cuchilla con tapa (foto: 23,5 × 12,5 × 13) y
    manguitos hasta los hilos de 16 AWG: 45 mm de punta a punta. Hilos por los extremos x=0 y x=45, a y=7, z=4,6."""
    return Partes([("cuerpo", box(10.75, 34.25, 0.75, 13.25, 0, 12.6), NEGRO),
                   ("manguitos", box(0, 45, 2.8, 11.2, 0.4, 8.8), NEGRO),
                   ("correa", box(33, 36.5, 5.0, 9.0, 5.5, 13.3), NEGRO)], _m("portafusible", dict(amperios=amperios)))


# ---------------------------------------------------------------- Winsen ZE29A
ZE = dict(L=85.0, W=33.0, H=18.0, agujeros=[(2.5, 2.5), (82.5, 2.5), (2.5, 30.5), (82.5, 30.5)],
          toma_presion=(18.5, -7.4, 28.3), toma_alcohol=(-6.8, -5.6, 13.0), j1_salida=(93.0, -3.0, 11.2))


def ze29a():
    """85 x 33 mm (manual Winsen); las piezas, según las fotos del anuncio (a medir con el módulo en la mano).
    Placa en el plano XZ, de canto; componentes hacia -Y. J1 (XH de 4 vías, entrada lateral) en el extremo derecho;
    celda azul en el izquierdo, que sobresale 4,4 mm del canto, con su boquilla de muestra (toma de alcohol) hacia -X.
    La toma de presión es la boquilla del sensor de presión (arriba a la izquierda) y mira hacia delante (-Y)."""
    L, W = ZE["L"], ZE["W"]
    return Partes([("placa", box(0, L, 0, 1.6, 0, W), VERDE_PCB),
                   ("celda", cyl(8.0, 11.4, (3.6, 0, 14.3), (0, -1, 0)), AZUL_CELDA),
                   ("toma_alcohol", cyl(1.1, 6.0, (-0.8, -5.6, 13.0), (-1, 0, 0)), AZUL_CELDA),
                   ("bomba", box(27, 49.7, -11.2, 0, 6.8, 17.6), TRANSP),
                   ("solenoide", box(49.7, 71.3, -12, 0, 5.7, 18.7), METAL),
                   ("condensador", cyl(7.0, 24.5, (42.5, -7.2, 27.4), (1, 0, 0)), NEGRO),
                   ("sensor_presion", box(14.4, 22.6, -3.4, 0, 24.8, 31.8), NEGRO),
                   ("toma_presion", cyl(1.3, 4.0, (18.5, -3.4, 28.3), (0, -1, 0)), NEGRO),
                   ("conector_j1", box(77.8, 85.7, -6, 0, 5.0, 17.4), BLANCO)], _m("ze29a"))


# ---------------------------------------------------------------- neumática del soplido
def te_6mm():
    """Racor en T para tubo de 6 mm (PP): paso por ±X (espigas hasta 14 mm del centro), derivación por +Z."""
    return Partes([("paso", cyl(3.6, 28, (-14, 0, 0), (1, 0, 0)), TRANSP),
                   ("derivacion", cyl(3.6, 14, (0, 0, 0), (0, 0, 1)), TRANSP),
                   ("cuerpo", box(-4.2, 4.2, -4.2, 4.2, -4.2, 4.2), TRANSP)], _m("te_6mm"))


def reductor_6_4():
    """Reductor de latón 6 → 4 mm (40 mm): espiga de 6 de x=0 a 16, collar hexagonal de 16 a 22, espiga de 4 de 22 a 40."""
    return Partes([("espiga_6", cyl(3.4, 16, (0, 0, 0), (1, 0, 0)), LATON),
                   ("collar", cyl(5.8, 6, (16, 0, 0), (1, 0, 0)), LATON),
                   ("espiga_4", cyl(2.6, 18, (22, 0, 0), (1, 0, 0)), LATON)], _m("reductor_6_4"))


# ---------------------------------------------------------------- herrajes
def silentblock():
    """Silentblock M4 10 x 10 macho-macho. Origen en el centro de la base de goma."""
    return Partes([("goma", cyl(5, 10, (0, 0, 0), (0, 0, 1)), GOMA),
                   ("esparrago_inf", cyl(2, 10, (0, 0, -10), (0, 0, 1)), METAL),
                   ("esparrago_sup", cyl(2, 8, (0, 0, 10), (0, 0, 1)), METAL)], _m("silentblock"))


def tope_goma(d=(0, 1, 0), e=3.0):
    """Tope adhesivo transparente Ø10 x 3 mm (e=6: dos topes pegados uno encima del otro).
    Origen en la cara pegada; crece en la dirección d."""
    return Partes([("tope", cyl(5, e, (0, 0, 0), d), TRANSP)], _m("tope_goma", d, e))


def cerradura_leva(eje=(0, 1, 0), largo_leva=32.0, leva=(0, 0, -1)):
    """Cerradura de leva shinfly 16 mm: agujero Ø18, cuerpo 16 mm. Origen en la cara exterior de la chapa;
    'eje' apunta hacia dentro. La leva (12 x 2 mm, 'largo_leva' de largo, 6 mm por detrás del eje) queda al
    final del cuerpo y apunta hacia 'leva' (perpendicular al eje)."""
    from geo import place
    ex, ey, ez = eje
    def p(t):
        return (ex * t, ey * t, ez * t)
    # cara exterior con su bombín y la ranura de la llave, para que se vea que es una cerradura (no un botón)
    arriba = (0, 0, 1) if abs(ez) < 0.9 else (1, 0, 0)
    lado = (ey * arriba[2] - ez * arriba[1], ez * arriba[0] - ex * arriba[2], ex * arriba[1] - ey * arriba[0])
    emb = cyl(10.5, 2.0, p(-2.0), eje).cut(cyl(6.0, 2.02, p(-2.01), eje))
    ranura = place(box(-0.9, 0.9, -2.35, -2.05, -4.0, 4.0), ex=lado, ey=eje, ez=arriba)
    s = [("embellecedor", emb, METAL),
         ("bombin", cyl(5.9, 2.2, p(-2.2), eje), LATON),
         ("ranura_llave", ranura, NEGRO),
         ("cuerpo", cyl(9.0, 16.0, p(0), eje), METAL),
         ("tuerca", cyl(12.0, 3.0, p(4.5), eje), METAL)]
    lx, ly, lz = leva
    q = (ly * ez - lz * ey, lz * ex - lx * ez, lx * ey - ly * ex)       # leva x eje
    b = box(-6, largo_leva - 6, 0, 2, -6, 6)
    s.append(("leva", place(b, ex=leva, ey=eje, ez=q, at=p(16.0)), METAL))
    return Partes(s, _m("cerradura_leva", eje, largo_leva, leva))


def bisagra_piano(L, eje="x", ala=16.0):
    """Bisagra de piano inox: 2 alas de 'ala' mm x 1 mm y nudo Ø4,5. Origen en el centro del nudo, al
    principio; se extiende L en la dirección del eje. Las alas quedan planas (abierta 180°): -ala y +ala."""
    if eje == "x":
        return [("nudo", cyl(2.25, L, (0, 0, 0), (1, 0, 0)), METAL),
                ("ala_fija", box(0, L, 0, ala, -0.5, 0.5), METAL),
                ("ala_movil", box(0, L, -ala, 0, -0.5, 0.5), METAL)]
    return [("nudo", cyl(2.25, L, (0, 0, 0), (0, 1, 0)), METAL),
            ("ala_fija", box(-0.5, 0.5, 0, L, -ala, 0), METAL),
            ("ala_movil", box(0, ala, 0, L, -0.5, 0.5), METAL)]


def tirador_96():
    """Tirador de mueble inox, entre ejes 96 mm, Ø10, 30 mm de alto. Origen en el centro, sobre la chapa; crece hacia -X (sale de un lateral izquierdo)."""
    return [("pata_1", cyl(5, 30, (0, -48, 0), (-1, 0, 0)), METAL),
            ("pata_2", cyl(5, 30, (0, 48, 0), (-1, 0, 0)), METAL),
            ("barra", cyl(5, 116, (-30, -58, 0), (0, 1, 0)), METAL)]


def esparrago_m4(L, d=(0, 1, 0)):
    """Espárrago M4 soldable por puntos (ORANXIN, inox 304), con su brida de Ø5,6. Origen en la base soldada."""
    return Partes([("esparrago", cyl(2.0, L, (0, 0, 0), d), METAL)], _m("esparrago_m4", L, d))


def separador(L, d=(0, 1, 0), r=3.5):
    """Separador hexagonal de nailon negro (kit M2,5). 'r' es el radio de la envolvente."""
    return Partes([("separador", cyl(r, L, (0, 0, 0), d), NEGRO)], _m("separador", L, d, r))


def pasamuros_rpsma():
    """Alargo RP-SMA: extremo hembra de chapa (agujero Ø6,5) con tuerca. Origen en la cara exterior; cuerpo hacia +Y local."""
    return Partes([("tuerca_ext", cyl(4.6, 2.5, (0, -2.5, 0), (0, 1, 0)), DORADO),
                   ("cuerpo", cyl(3.2, 14, (0, 0, 0), (0, 1, 0)), DORADO),
                   ("tuerca_int", cyl(4.6, 2.5, (0, 3, 0), (0, 1, 0)), DORADO)], _m("pasamuros_antena"))


def antena():
    """Antena 2 dBi del AR9271, girada vertical. Origen en el conector."""
    return [("rotula", cyl(4.5, 14, (0, 0, 0), (0, 0, 1)), NEGRO),
            ("antena", cyl(5.0, 95, (0, 0, 14), (0, 0, 1)), NEGRO)]


def arandela_pasacables(r_int, r_ext=None, d=(0, 1, 0)):
    """Pasacables de goma (kit de 7 tamaños). Origen en el centro del agujero."""
    r_ext = r_ext or r_int + 3
    return Partes([("pasacables", cyl(r_ext, 4, tuple(-1.25 * c for c in d), d).cut(cyl(r_int, 4, tuple(-1.25 * c for c in d), d)), GOMA)],
                  _m("arandela_pasacables", r_int, r_ext, d))


FUENTES = {
    "pantalla": "GeeekPi EP-0170 (ASIN B0CHMBCCJB): 165 x 100 x 8 mm, 5 W; conectores en un canto (fotos del anuncio y wiki 52Pi)",
    "solo": "SumUp Solo: 83,16 x 83,02 x 17,6 mm, USB-C en el canto inferior, ranura de chip arriba (manual SumUp)",
    "camara": "Raspberry Pi Camera Module 3: 25 x 24 x 11,5 mm, agujeros M2 iguales al Camera Module 2 (product brief); carcasa de la lente ~11,4 mm (foto)",
    "pi": "Raspberry Pi 3B+: plano mecánico oficial RP-008337 (85 x 56, agujeros 58 x 49 a 3,5 mm del borde)",
    "fuente": "Mean Well LRS-50-5: 99 x 82 x 30, 2 x M3 abajo (penetración máx. 3 mm), regleta de 5 bornes (ficha LRS-50)",
    "c14": "Toma C14 con portafusibles y sin interruptor (ASIN B07CQ54BY4): medidas típicas del formato de atornillar (brida 44,7 × 33,1, recorte 31,5 × 27,25, tornillos a 36 mm), confirmar al recibirla",
    "ze29a": "Winsen ZE29A: 85 x 33 mm (manual V1.1); celda, bomba, condensador, sensor de presión y J1 medidos sobre las fotos del anuncio (a confirmar)",
    "wifi": "AR9271 VBESTLIFE (ASIN B0CBW6THN1): adaptador de pincho con RP-SMA (fotos del anuncio)",
    "wago": "WAGO 221-415: 29,9 x 18,6 x 8,3 mm (ficha WAGO)",
    "usb": "Borne USB-A (ASIN B07V86XPL4): 50 mm, bloque de bornes de 21 mm, cuerpo de 19 × 12 (foto con cotas del anuncio)",
    "portafusible": "Portafusibles MINI en línea (ASIN B07Q495GQG): 23,5 × 12,5 × 13 mm (foto con cotas), hilo de 16 AWG",
    "neumatica": "Racor en T de 6 mm (B0GT5XPRWK) y reductor de latón 6 → 4 de 40 mm (B0H38RDVZR), fotos con cotas del anuncio",
    "cerradura": "Cerradura de leva shinfly 16 mm (ASIN B0CRRBYJ2Y): agujero Ø18, cuerpo 16 mm, levas de 32 y 47 mm",
}
