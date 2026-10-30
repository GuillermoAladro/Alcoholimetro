#!/usr/bin/env python3
"""Recorta el avatar 2D de Guillermo Aladro en piezas para animación por recortables.

Entrada : Avatares 2D/Guillermo-Aladro/Guillermo-Aladro-2D.png  (1122 × 1402, cuerpo + retrato)
Salida  : piezas.png (atlas con todas las piezas) y piezas.js (posiciones, pivotes y polígonos)

No se dibuja ningún personaje nuevo: cada pieza sale de los píxeles del avatar.
Solo se rellena (inpainting) lo que quedaba tapado: el hueco del brazo de la jarra en el
torso, el bolsillo donde estaba la mano, la piel bajo las cejas y bajo la boca, y la parte
de la zapatilla escondida bajo el bajo del vaquero.

Uso: python3 preparar_piezas.py [ruta_avatar] [carpeta_salida]
"""
import json, math, sys, pathlib
import numpy as np, cv2
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parents[2]
FUENTE = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else RAIZ / "Avatares 2D/Guillermo-Aladro/Guillermo-Aladro-2D.png"
SALIDA = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else AQUI

TAU_CUERPO = 0.42   # escala de textura de las piezas del cuerpo (respecto a la hoja)
TAU_CABEZA = 0.25   # escala de textura de la cabeza del retrato

src = np.array(Image.open(FUENTE).convert("RGB"))
Hh, Ww = src.shape[:2]
assert (Ww, Hh) == (1122, 1402), f"tamaño inesperado {Ww}×{Hh}"
A = src.astype(np.int16)
mx, mn = A.max(-1), A.min(-1)


def poly_mask(pts, shape=(Hh, Ww)):
    im = Image.new("L", (shape[1], shape[0]), 0)
    ImageDraw.Draw(im).polygon([tuple(map(float, p)) for p in pts], fill=255)
    return np.array(im) > 127


# ---------------------------------------------------------------- fondo y alfa
blanco = (mn > 228) & ((mx - mn) < 28)
lab, n = ndi.label(blanco)
borde = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
fondo = np.isin(lab, list(borde))
for sx, sy in [(120, 530), (340, 530), (387, 652)]:          # huecos blancos encerrados (brazos/torso)
    ventana = lab[sy - 12:sy + 13, sx - 12:sx + 13]
    ids = np.unique(ventana[ventana > 0])
    assert len(ids), f"no hay hueco blanco cerca de {sx},{sy}"
    for i in ids:
        fondo |= lab == i
figura = ~fondo
# alfa suave en el contorno: la línea exterior es tinta negra sobre blanco → se desmezcla
dist = ndi.distance_transform_edt(figura)
banda = figura & (dist <= 2.2)
gris = (mx - mn) < 60
alfa = figura.astype(np.float32)
lum = A.mean(-1) / 255.0
desm = banda & gris
alfa[desm] = np.clip(1.0 - lum[desm], 0, 1) ** 0.85
rgb = src.astype(np.float32)
rgb[desm] = np.minimum(rgb[desm], 40)                           # color de la tinta


def pieza(mask, rgb_img=None, alfa_img=None):
    """RGBA en coordenadas de hoja para una máscara."""
    r = rgb if rgb_img is None else rgb_img
    a = (alfa if alfa_img is None else alfa_img) * mask
    out = np.zeros((Hh, Ww, 4), np.float32)
    out[..., :3] = r
    out[..., 3] = a
    return out


# ---------------------------------------------------------------- CABEZA (retrato)
def linea_mandibula():
    """Borde inferior de la línea negra de la mandíbula, columna a columna."""
    guia = [(612, 720), (640, 742), (700, 782), (760, 820), (800, 842), (812, 843), (840, 825), (870, 785), (905, 712)]
    gx, gy = zip(*guia)
    pts = []
    for x in range(612, 906):
        ye = int(np.interp(x, gx, gy))
        col = mx[ye - 28:ye + 28, x] < 90
        idx = np.where(col)[0]
        if len(idx) == 0:
            pts.append((x, ye + 3)); continue
        # primer tramo oscuro empezando desde arriba de la ventana
        i0 = idx[0]; i1 = i0
        while i1 + 1 < len(col) and col[i1 + 1]: i1 += 1
        pts.append((x, ye - 28 + i1 + 2))
    # suavizado
    ys = ndi.uniform_filter1d(np.array([p[1] for p in pts], float), 5)
    return [(p[0], float(y)) for p, y in zip(pts, ys)]


mand = linea_mandibula()
corte_cab = [(440, 0), (1122, 0), (1122, 700), (912, 700)] + mand[::-1] + \
            [(611, 722), (609, 661), (578, 661), (573, 650), (548, 620), (528, 597), (440, 597)]
m_cab = poly_mask(corte_cab) & figura
m_cab[:, :440] = False

OJO_D = [(733, 548), (737, 541), (748, 541), (762, 545), (776, 550), (790, 556), (803, 561), (809, 565), (809, 578),
         (808, 592), (795, 589), (778, 583), (762, 577), (748, 573), (737, 566), (733, 558)]       # ojo derecho de él (izq. en pantalla)
OJO_I = [(866, 602), (872, 597), (885, 598), (900, 602), (913, 606), (921, 611), (923, 622), (921, 637),
         (910, 638), (895, 635), (880, 630), (868, 624)]
CEJA_D_ZONA = [(708, 494), (765, 497), (830, 522), (866, 552), (864, 575), (842, 572), (800, 552), (738, 524), (708, 516)]
CEJA_I_ZONA = [(870, 570), (948, 578), (950, 607), (876, 598)]
BOCA_ZONA = [(752, 706), (792, 703), (838, 710), (856, 735), (850, 752), (832, 778), (778, 778), (758, 756), (748, 718)]

tinta = mx < 85
ceja_d = poly_mask(CEJA_D_ZONA) & tinta
ceja_i = poly_mask(CEJA_I_ZONA) & tinta
ceja_d = ndi.binary_dilation(ceja_d, iterations=1) & poly_mask(CEJA_D_ZONA)
ceja_i = ndi.binary_dilation(ceja_i, iterations=1) & poly_mask(CEJA_I_ZONA)
piel = np.array([255, 186, 114], np.int16)
dif_piel = np.abs(A - piel).sum(-1)
boca = poly_mask(BOCA_ZONA) & (dif_piel > 60)
boca = ndi.binary_dilation(boca, iterations=2) & poly_mask(BOCA_ZONA)

# cabeza sin cejas ni boca (relleno de piel)
cab_rgb = src.copy()
hueco = ndi.binary_dilation(ceja_d | ceja_i | boca, iterations=2)
cab_rgb = cv2.inpaint(cab_rgb, hueco.astype(np.uint8) * 255, 7, cv2.INPAINT_TELEA)
# las cuencas de los ojos quedan transparentes: los ojos se dibujan por detrás
m_ojos = poly_mask(OJO_D) | poly_mask(OJO_I)
cab_alfa = alfa.copy(); cab_alfa[m_ojos] = 0
cab_rgbf = cab_rgb.astype(np.float32); cab_rgbf[desm] = rgb[desm]
CABEZA = pieza(m_cab, cab_rgbf, cab_alfa)
CEJA_D = pieza(ceja_d); CEJA_I = pieza(ceja_i)
BOCA = pieza(boca)
# colores de referencia del retrato
def color_medio(m):
    return [int(v) for v in np.median(src[m], axis=0)]

# ---------------------------------------------------------------- CUERPO
# corte del cuello (bajo la mandíbula de la cabeza pequeña) y de la pelvis
CUELLO = [(140, 236), (196, 229), (206, 223), (242, 250), (284, 266), (297, 263), (308, 250), (330, 250), (330, 0), (140, 0)]
m_sobre_cuello = poly_mask(CUELLO)
PELVIS = [(0, 704), (110, 703), (175, 712), (232, 750), (251, 772), (270, 750), (325, 712), (390, 703), (600, 704), (600, 1402), (0, 1402)]
m_bajo_pelvis = poly_mask(PELVIS)
# borde derecho del torso (donde estaba el brazo de la jarra)
BORDE_TORSO = [(353, 318), (346, 360), (343, 420), (341, 470), (338, 515), (336, 560), (339, 610), (345, 645), (362, 657), (385, 672), (399, 702)]
m_der = poly_mask(BORDE_TORSO + [(470, 702), (470, 300)])
cuerpo = figura.copy(); cuerpo[:, 560:] = False; cuerpo[:200] = False
cuerpo[:1200, 428:] = False                                   # fuera el retrato (pelo y camiseta del retrato)

# ----- brazo de la jarra (el izquierdo de él, a la derecha en pantalla)
m_brazo = cuerpo & m_der & ~m_sobre_cuello
m_brazo[650:] = False
m_brazo[:296] = False
jeans_px = (A[..., 2] > A[..., 0] + 12) & (A[..., 2] > 110)
m_brazo &= ~(jeans_px & (np.arange(Hh)[:, None] > 600))
lab_b, _ = ndi.label(m_brazo)
mayor = np.bincount(lab_b.ravel())[1:].argmax() + 1
m_brazo = lab_b == mayor
m_brazo = ndi.binary_fill_holes(m_brazo)
BRAZO = pieza(m_brazo)

# ----- torso: todo lo del cuerpo entre cuello y pelvis, menos el brazo; se rellena el hueco
m_tronco = cuerpo & ~m_sobre_cuello & ~m_bajo_pelvis & ~m_der
# zona interior que hay que reconstruir: dentro del borde del torso y que era brazo o fondo
interior = poly_mask([(250, 300)] + BORDE_TORSO + [(399, 720), (250, 720)]) & ~m_bajo_pelvis
rellenar = interior & (fondo | m_brazo | ~cuerpo)
rellenar &= ~m_sobre_cuello
sub = (slice(280, 730), slice(230, 470))
img_sub = src[sub].copy()
mask_sub = (rellenar[sub] | m_der[sub] | fondo[sub]).astype(np.uint8) * 255
mask_sub[:, -1] = 255
img_inp = cv2.inpaint(img_sub, mask_sub, 9, cv2.INPAINT_TELEA)
tronco_rgb = src.copy(); tronco_rgb[sub] = np.where(rellenar[sub][..., None], img_inp, src[sub])
# camiseta: el relleno de arriba debe ser negro de camiseta liso
cam = rellenar & (np.arange(Hh)[:, None] < 646)
tronco_rgb[cam] = np.array([30, 30, 36], np.uint8)
m_tronco = (m_tronco | interior) & ~m_bajo_pelvis & ~m_sobre_cuello & ~m_der
t_img = Image.fromarray(tronco_rgb)
d = ImageDraw.Draw(t_img)
d.line(BORDE_TORSO[:8], fill=(8, 8, 10), width=6, joint="curve")
d.line(BORDE_TORSO[7:], fill=(8, 8, 10), width=6, joint="curve")
# bolsillo delantero (la mano ya no está dentro)
d.line([(330, 664), (346, 668), (362, 676), (377, 688), (388, 703)], fill=(60, 78, 112), width=4, joint="curve")
d.line([(333, 670), (352, 676), (368, 686), (380, 700)], fill=(118, 142, 182), width=2)
tronco_rgb = np.array(t_img)
alfa_tronco = alfa.copy(); alfa_tronco[interior & ~m_der] = 1.0
TRONCO = pieza(m_tronco, tronco_rgb.astype(np.float32), alfa_tronco)

# ----- piernas y zapatillas
jeans = (A[..., 2] > A[..., 0] + 10) & (A[..., 2] > 95)
def bajo_vaquero(x0, x1):
    """y del borde inferior del vaquero por columna (el dobladillo)."""
    h = {}
    for x in range(x0, x1):
        ys = np.where(jeans[1150:1310, x])[0]
        h[x] = 1150 + ys.max() + 4 if len(ys) else None
    xs = [x for x in h if h[x] is not None]
    for x in h:
        if h[x] is None: h[x] = h[min(xs, key=lambda q: abs(q - x))]
    return h

def mascara_pierna(x0, x1, xcorte, lado):
    h = bajo_vaquero(x0, x1)
    m = np.zeros((Hh, Ww), bool)
    for x in range(x0, x1):
        m[680:h[x], x] = True
    if lado == "izq": m[:, xcorte:] = False
    else: m[:, :xcorte] = False
    return m & cuerpo, h

m_pc, hem_c = mascara_pierna(20, 260, 251, "izq")
m_pl, hem_l = mascara_pierna(245, 470, 251, "der")
# zapatilla derecha (apunta a la derecha): se usa para los dos pies
m_zap = np.zeros((Hh, Ww), bool)
for x in range(300, 560):
    yh = hem_l.get(x, 1235) if x < 470 else 1235
    m_zap[yh - 3:1380, x] = True
m_zap &= cuerpo
lab_z, _ = ndi.label(m_zap); m_zap = lab_z == (np.bincount(lab_z.ravel())[1:].argmax() + 1)

TOB_C, TOB_L = (130, 1252), (384, 1250)
CAD_C, CAD_L = (172, 712), (328, 712)

def pierna_recta(m, cad, tob, oscurecer=1.0):
    """Gira la pierna para que cadera→tobillo quede vertical; añade una cúpula en la cadera."""
    ang = math.degrees(math.atan2(tob[0] - cad[0], tob[1] - cad[1]))
    P = pieza(m)
    # cúpula de vaquero alrededor de la cadera (queda bajo el torso: tapa huecos al girar)
    r = 74
    yy, xx = np.mgrid[0:Hh, 0:Ww]
    cup = ((xx - cad[0]) ** 2 + (yy - cad[1]) ** 2 <= r * r) & (yy < cad[1] + 30)
    cup_rgb = np.array([118, 142, 182], np.float32)
    nuevo = cup & (P[..., 3] < 0.99)
    P[nuevo, :3] = cup_rgb; P[nuevo, 3] = 1.0
    M = cv2.getRotationMatrix2D(cad, -ang, 1.0)       # gira alrededor de la cadera
    pre = P.copy(); pre[..., :3] *= pre[..., 3:4]
    rot = cv2.warpAffine(pre, M, (Ww, Hh), flags=cv2.INTER_CUBIC, borderValue=0)
    rot = np.clip(rot, 0, None)
    a = np.clip(rot[..., 3:4], 1e-6, 1)
    rot[..., :3] = np.where(rot[..., 3:4] > 1e-4, rot[..., :3] / a, 0)
    rot[..., 3] = np.clip(rot[..., 3], 0, 1)
    rot[..., :3] *= oscurecer
    L = math.hypot(tob[0] - cad[0], tob[1] - cad[1])
    return rot, {"raiz": [cad[0], cad[1]], "fin": [cad[0], cad[1] + L], "largo": L, "giro_original": math.radians(ang)}

PIERNA_C, info_pc = pierna_recta(m_pc, CAD_C, TOB_C)
PIERNA_L, info_pl = pierna_recta(m_pl, CAD_L, TOB_L, 0.78)

# relleno de la zapatilla bajo el dobladillo (cuello de la zapatilla)
zap_rgb = rgb.copy(); zap_alfa = alfa.copy()
zim = Image.fromarray(np.clip(zap_rgb, 0, 255).astype(np.uint8)); zd = ImageDraw.Draw(zim)
zd.ellipse([TOB_L[0] - 50, TOB_L[1] - 28, TOB_L[0] + 46, TOB_L[1] + 22], fill=(236, 228, 228), outline=(10, 10, 12), width=5)
zl = np.zeros((Hh, Ww), bool); zl_im = Image.new("L", (Ww, Hh), 0)
ImageDraw.Draw(zl_im).ellipse([TOB_L[0] - 52, TOB_L[1] - 30, TOB_L[0] + 48, TOB_L[1] + 24], fill=255)
zl = np.array(zl_im) > 127
zap_new = np.array(zim).astype(np.float32)
zap_rgb = np.where((zl & ~m_zap)[..., None], zap_new, zap_rgb)
zap_alfa = np.where(zl & ~m_zap, 1.0, zap_alfa)
ZAPATO = pieza(m_zap | zl, zap_rgb, zap_alfa)
ZAPATO_L = ZAPATO.copy(); ZAPATO_L[..., :3] *= 0.78

# ---------------------------------------------------------------- empaquetado
def recorta_y_escala(P, tau, nombre, pivote, extra=None):
    a = P[..., 3]
    ys, xs = np.where(a > 0.004)
    x0, x1, y0, y1 = xs.min() - 3, xs.max() + 4, ys.min() - 3, ys.max() + 4
    c = P[y0:y1, x0:x1].copy()
    pre = c.copy(); pre[..., :3] *= pre[..., 3:4]
    w, h = max(1, round((x1 - x0) * tau)), max(1, round((y1 - y0) * tau))
    chans = [np.array(Image.fromarray(pre[..., i].astype(np.float32), "F").resize((w, h), Image.LANCZOS)) for i in range(4)]
    out = np.stack(chans, -1)
    al = np.clip(out[..., 3], 0, 1)
    rgbo = np.where(al[..., None] > 1e-3, out[..., :3] / np.maximum(al[..., None], 1e-3), 0)
    img = np.concatenate([np.clip(rgbo, 0, 255), (al * 255)[..., None]], -1).astype(np.uint8)
    info = {"origen": [int(x0), int(y0)], "tam_hoja": [int(x1 - x0), int(y1 - y0)], "tau": tau,
            "pivote": [float(pivote[0]), float(pivote[1])]}
    if extra: info.update(extra)
    return nombre, Image.fromarray(img, "RGBA"), info

piezas = [
    recorta_y_escala(CABEZA, TAU_CABEZA, "cabeza", (700, 800), {"ojos": {"derecho": OJO_D, "izquierdo": OJO_I}}),
    recorta_y_escala(CEJA_D, TAU_CABEZA, "ceja_derecha", (790, 532)),
    recorta_y_escala(CEJA_I, TAU_CABEZA, "ceja_izquierda", (910, 590)),
    recorta_y_escala(BOCA, TAU_CABEZA, "boca", (802, 735)),
    recorta_y_escala(TRONCO, TAU_CUERPO, "tronco", (250, 712), {"borde_torso": BORDE_TORSO}),
    recorta_y_escala(BRAZO, TAU_CUERPO, "brazo", (370, 372), {"raiz": [370, 372], "fin": [370, 648]}),
    recorta_y_escala(PIERNA_C, TAU_CUERPO, "pierna_cerca", CAD_C, info_pc),
    recorta_y_escala(PIERNA_L, TAU_CUERPO, "pierna_lejos", CAD_L, info_pl),
    recorta_y_escala(ZAPATO, TAU_CUERPO, "zapato", TOB_L),
    recorta_y_escala(ZAPATO_L, TAU_CUERPO, "zapato_lejos", TOB_L),
]

# atlas por filas (estantería simple)
ANCHO = 1024; pad = 4
x = y = pad; fila = 0; marcos = {}
for nombre, img, info in sorted(piezas, key=lambda p: -p[1].height):
    if x + img.width + pad > ANCHO: x = pad; y += fila + pad; fila = 0
    marcos[nombre] = (x, y, img, info); x += img.width + pad; fila = max(fila, img.height)
alto = y + fila + pad
atlas = Image.new("RGBA", (ANCHO, alto), (0, 0, 0, 0))
meta = {}
for nombre, (x, y, img, info) in marcos.items():
    atlas.paste(img, (x, y))
    meta[nombre] = dict(info, marco=[x, y, img.width, img.height])

paleta = {
    "piel": color_medio(poly_mask([(640, 600), (700, 600), (700, 640), (640, 640)])),
    "piel_sombra": [198, 114, 66],
    "pelo": [138, 66, 30],
    "iris": color_medio(poly_mask([(744, 552), (758, 552), (758, 566), (744, 566)]) & (mx > 60)),
    "camiseta": [30, 30, 36],
    "tinta": [10, 9, 12],
}
SALIDA.mkdir(parents=True, exist_ok=True)
atlas.save(SALIDA / "piezas.png", optimize=True)
datos = {"fuente": "Avatares 2D/Guillermo-Aladro/Guillermo-Aladro-2D.png", "hoja": [Ww, Hh], "atlas": "piezas.png",
         "piezas": meta, "paleta": paleta}
(SALIDA / "piezas.js").write_text(
    "/* Generado por preparar_piezas.py a partir del avatar 2D. No editar a mano. */\n"
    "window.PIEZAS_2D = window.PIEZAS_2D || {};\n"
    f"window.PIEZAS_2D[\"guillermo-aladro\"] = {json.dumps(datos, ensure_ascii=False, separators=(',', ':'))};\n",
    encoding="utf-8")
print("atlas", atlas.size, "piezas:", ", ".join(f"{k} {v['marco'][2]}×{v['marco'][3]}" for k, v in meta.items()))
