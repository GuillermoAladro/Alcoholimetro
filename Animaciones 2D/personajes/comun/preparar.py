#!/usr/bin/env python3
"""Recortador común de avatares 2D en piezas para animación por recortables.

Cada personaje tiene su `personajes/<id>/preparar_piezas.py` con un diccionario CFG (solo
coordenadas de su hoja y opciones) que llama a `construir(CFG)`. Todas las hojas de
`Avatares 2D/<Nombre>/<Nombre>-2D.png` comparten formato: 1122 × 1402, fondo blanco cálido,
figura entera en 3/4 a la izquierda, retrato grande a la derecha y el nombre arriba a la izquierda.

No se dibuja ningún personaje nuevo: cada pieza sale de los píxeles del avatar. Solo se rellena
(inpainting) lo que quedaba tapado (bolsillos, costados que tapaban los brazos, pelo que caía
sobre el hombro, piel bajo cejas, boca y pendientes…).

Piezas que salen (las que use el CFG):
  retrato → cabeza (con las cuencas de los ojos vacías), cabeza_roja, ceja_derecha, ceja_izquierda,
            boca y, si hay melena larga, melena / melena_atras (tiras que se balancean)
  figura  → tronco (con las manos en los bolsillos), tronco_libre (sin brazos), brazo (el lejano,
            enderezado), brazo_cerca (el cercano, enderezado), pierna_cerca, pierna_lejos,
            zapato y zapato_lejos (la zapatilla de perfil, para los dos pies)

Para buscar las coordenadas de un personaje nuevo: `python3 personajes/comun/ver_hoja.py <id>`
pinta la hoja con una rejilla y todo lo que ya dice su CFG encima.
"""
import json, math, pathlib
import numpy as np, cv2
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ANIM = pathlib.Path(__file__).resolve().parents[2]            # carpeta «Animaciones 2D»
RAIZ = ANIM.parent


# ---------------------------------------------------------------- utilidades
def poly_mask(pts, shape):
    im = Image.new("L", (shape[1], shape[0]), 0)
    ImageDraw.Draw(im).polygon([tuple(map(float, p)) for p in pts], fill=255)
    return np.array(im) > 127


def mayor_parte(m):
    lab_m, n = ndi.label(m)
    if n == 0: return m
    return lab_m == (np.bincount(lab_m.ravel())[1:].argmax() + 1)


def contorno(mask, eps=1.0):
    """Polígono (lista de [x, y]) del borde exterior de una máscara."""
    cs, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cs, key=cv2.contourArea)
    c = cv2.approxPolyDP(c, eps, True)[:, 0, :]
    return [[int(x), int(y)] for x, y in c]


def parpado(mask, n=10):
    """Curvas de párpado de un ojo: borde de arriba y de abajo, de la comisura interior a la exterior."""
    ys, xs = np.where(mask)
    x0, x1 = xs.min(), xs.max()
    arr, aba = [], []
    for x in np.linspace(x0, x1, n):
        col = np.where(mask[:, int(round(x))])[0]
        if len(col) == 0: continue
        arr.append([round(float(x), 1), int(col.min())]); aba.append([round(float(x), 1), int(col.max())])
    return arr, aba


def zona_paso(paso, clave, R, G, B, shape):
    """Máscara de un paso de «limpiar»: su polígono o lista de polígonos y, si las trae, las opciones
    "mascara": "no_piel", "dilata" y "proteger_zonas" (ver limpiar)."""
    v = paso[clave]
    polis = v if len(v) and isinstance(v[0][0], (list, tuple)) else [v]
    z = np.zeros(shape, bool)
    for q in polis: z |= poly_mask(q, shape)
    if paso.get("mascara") == "no_piel":
        piel = (R > 200) & (G > 110) & (R - B > 60) & (G - B > 25)
        m = z & ~piel
        n = paso.get("dilata", 0)
        if n: m = ndi.binary_dilation(m, iterations=n) & ndi.binary_dilation(z, iterations=n)
        z = m
    for q in paso.get("proteger_zonas", []): z &= ~poly_mask(q, shape)
    return z


def limpiar(src, pasos):
    """Retoca la hoja antes de trocearla (opcional, CFG["limpiar"]): quita accesorios que el muñeco
    dibuja aparte (la manguera de Marcos) y repinta lo que tapaban. Cada paso es un dict:
      {"fondo": polígono, "mascara": "rojo"|"claro"|"motas"|None, "dilata": n, "proteger": "marino", "area": n}
          → lo de la máscara dentro del polígono (todo, si no hay máscara) pasa a ser fondo blanco;
            con "proteger" no se toca lo que esté a ≤ 2 px de la tela azul marino (contornos del cuerpo)
      {"pintar": polígono, "color": [r, g, b]}         → relleno liso
      {"rellenar": polígono}                           → inpainting desde lo de alrededor
      {"linea": [[x, y], …], "color": [r, g, b], "ancho": n}   → contorno o costura que quedó tapado
    En "pintar" y "rellenar" (opcional): el valor puede ser una lista de polígonos (se rellenan todos de
    una vez, así lo que se quita en uno no hace de fuente en el de al lado), "mascara": "no_piel" limita
    el paso a lo que no es piel dentro de los polígonos (la montura de unas gafas), "dilata": n la ensancha
    sin salir de los polígonos ensanchados y "proteger_zonas": [polígono, …] deja intacto lo de dentro
    (ojos, cejas). Sin esas claves el paso hace lo de siempre.
    """
    out = src.copy()
    H, W = out.shape[:2]
    for paso in pasos:
        A = out.astype(np.int16); R, G, B = A[..., 0], A[..., 1], A[..., 2]
        mx, mn = A.max(-1), A.min(-1)
        if "fondo" in paso:
            z = poly_mask(paso["fondo"], (H, W))
            masc = paso.get("mascara")
            if masc == "rojo": m = ((R > 90) & (R - G > 50) & (R - B > 45)) | ((R > 150) & (R - G > 30) & (R - B > 20) & (G < 205))
            elif masc == "claro": m = (mn > 150) & ((mx - mn) < 40)
            elif masc == "motas":                                  # restos sueltos (contornos que quedaron aislados)
                lab_, n_ = ndi.label(z & (mn < 235))
                tam = np.bincount(lab_.ravel()); peq = np.where(tam < paso.get("area", 300))[0]
                m = np.isin(lab_, peq[peq > 0])
            else: m = np.ones((H, W), bool)
            m &= z
            if paso.get("dilata"): m = ndi.binary_dilation(m, iterations=paso["dilata"]) & z
            if paso.get("proteger") == "marino":
                marino = (mx < 75) & (B - R >= 6) & (mn > 12)
                m &= ~ndi.binary_dilation(marino, iterations=2)
            out[m] = 255
        elif "pintar" in paso:
            out[zona_paso(paso, "pintar", R, G, B, (H, W))] = paso["color"]
        elif "rellenar" in paso:
            z = zona_paso(paso, "rellenar", R, G, B, (H, W))
            out = cv2.inpaint(out, z.astype(np.uint8) * 255, paso.get("radio", 9), cv2.INPAINT_TELEA)
        elif "linea" in paso:
            im = Image.fromarray(out); ImageDraw.Draw(im).line([tuple(q) for q in paso["linea"]], fill=tuple(paso.get("color", (12, 10, 12))),
                                                             width=paso.get("ancho", 4), joint="curve")
            out = np.array(im)
    return out


class Hoja:
    """La hoja del avatar con el fondo separado, el alfa del contorno y las clases de color."""

    def __init__(self, ruta, cfg):
        self.src = np.array(Image.open(ruta).convert("RGB"))
        if cfg.get("limpiar"): self.src = limpiar(self.src, cfg["limpiar"])
        self.H, self.W = self.src.shape[:2]
        assert (self.W, self.H) == (1122, 1402), f"tamaño inesperado {self.W}×{self.H}"
        A = self.A = self.src.astype(np.int16)
        self.R, self.G, self.B = A[..., 0], A[..., 1], A[..., 2]
        self.mx, self.mn = A.max(-1), A.min(-1)
        self.YY, self.XX = np.mgrid[0:self.H, 0:self.W]
        blanco = (self.mn > 228) & ((self.mx - self.mn) < 28)
        lab, _ = ndi.label(blanco)
        borde = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        fondo = np.isin(lab, list(borde))
        for sx, sy in cfg.get("huecos_fondo", []):           # huecos blancos encerrados (entre brazo y torso…)
            ventana = lab[sy - 6:sy + 7, sx - 6:sx + 7]
            ids = [i for i in np.unique(ventana[ventana > 0]) if i not in borde]
            assert ids, f"no hay hueco blanco cerca de {sx},{sy}"
            for i in ids: fondo |= lab == i
        # fondo_blanco_en (opcional): zonas donde todo lo blanco es fondo, p. ej. los huecos entre los rizos de un
        # pelo muy rizado (Gabacho), que son demasiados para darlos uno a uno en huecos_fondo
        for zona in cfg.get("fondo_blanco_en", []): fondo |= blanco & poly_mask(zona, (self.H, self.W))
        x0, y0, x1, y1 = cfg.get("rotulo", (0, 0, 150, 70))  # el nombre de arriba a la izquierda
        fondo[y0:y1, x0:x1] = True
        self.fondo, self.figura = fondo, ~fondo
        dist = ndi.distance_transform_edt(self.figura)
        banda = self.figura & (dist <= 2.2)
        gris = (self.mx - self.mn) < 60
        self.alfa = self.figura.astype(np.float32)
        lum = A.mean(-1) / 255.0
        self.desm = banda & gris                               # contorno de tinta sobre blanco → se desmezcla
        self.alfa[self.desm] = np.clip(1.0 - lum[self.desm], 0, 1) ** 0.85
        self.rgb = self.src.astype(np.float32)
        self.rgb[self.desm] = np.minimum(self.rgb[self.desm], 40)
        R, G, B, mx = self.R, self.G, self.B, self.mx
        pr = cfg.get("piel_umbral", {})
        self.piel = (R > pr.get("r", 205)) & (G > pr.get("g", 125)) & (R - B > pr.get("rb", 70)) & (G - B > pr.get("gb", 25))
        self.pelo = self.figura & ~self.piel & (R < 200) & (R >= G) & (G >= B - 6) & ((R - B > 18) | (mx < 70))
        self.blanco = self.figura & (self.mn > 175) & ((self.mx - self.mn) < 30)
        self.vaquero = self.figura & (B > R + 12) & (B > 85)
        if cfg.get("sin_vaquero"): self.vaquero = np.zeros_like(self.figura)
        self.tinta = mx < 85
        self.piel_ref = np.array(cfg.get("piel_ref", [254, 186, 130]), np.int16)
        self.dif_piel = np.abs(A - self.piel_ref).sum(-1)

    def poli(self, pts):
        return poly_mask(pts, (self.H, self.W))

    def pieza(self, mask, rgb=None, alfa=None):
        out = np.zeros((self.H, self.W, 4), np.float32)
        out[..., :3] = self.rgb if rgb is None else rgb
        out[..., 3] = (self.alfa if alfa is None else alfa) * mask
        return out

    def color_medio(self, pts):
        return [int(v) for v in np.median(self.src[self.poli(pts)], axis=0)]


# ---------------------------------------------------------------- deformaciones
def enderezar(P, puntos, eje_x, radio, ancho, sobre, bajo, L1_out=None, L2_out=None):
    """Endereza una extremidad doblada: la polilínea hombro→codo→muñeca pasa a ser vertical.
    Con L1_out/L2_out cada tramo se estira o encoge (p. ej. el escorzo del antebrazo en el bolsillo)."""
    (x0, y0), (x1, y1), (x2, y2) = puntos
    L1, L2 = math.hypot(x1 - x0, y1 - y0), math.hypot(x2 - x1, y2 - y1)
    L1o, L2o = L1_out or L1, L2_out or L2
    a1, a2 = math.atan2(-(x1 - x0), y1 - y0), math.atan2(-(x2 - x1), y2 - y1)
    s = np.arange(-sobre, L1 + L2 + bajo + 1, 0.5)
    k = np.clip((s - (L1 - radio)) / (2 * radio), 0, 1); k = k * k * (3 - 2 * k)
    ang = a1 + (a2 - a1) * k
    ds = np.diff(s, prepend=s[0])
    qx = x0 + np.cumsum(-np.sin(ang) * ds)
    qy = y0 + np.cumsum(np.cos(ang) * ds)
    i0 = np.searchsorted(s, 0); qx += x0 - qx[i0]; qy += y0 - qy[i0]
    filas = np.arange(y0 - sobre, y0 + L1o + L2o + bajo).astype(np.float32)
    cols = np.arange(eje_x - ancho, eje_x + ancho + 1).astype(np.float32)
    So = filas - y0
    S = np.where(So <= L1o, So * L1 / L1o, L1 + (So - L1o) * L2 / L2o)
    QX, QY, AN = np.interp(S, s, qx), np.interp(S, s, qy), np.interp(S, s, ang)
    U = cols - eje_x
    mapx = (QX[:, None] + U[None, :] * np.cos(AN)[:, None]).astype(np.float32)
    mapy = (QY[:, None] + U[None, :] * np.sin(AN)[:, None]).astype(np.float32)
    pre = P.copy(); pre[..., :3] *= pre[..., 3:4]
    out = cv2.remap(pre, mapx, mapy, cv2.INTER_LINEAR, borderValue=0)
    al = np.clip(out[..., 3:4], 0, 1)
    out[..., :3] = np.where(al > 1e-4, out[..., :3] / np.maximum(al, 1e-4), 0); out[..., 3] = al[..., 0]
    Rr = np.zeros_like(P); fy, fx = int(filas[0]), int(cols[0])
    h, w = min(out.shape[0], Rr.shape[0] - fy), min(out.shape[1], Rr.shape[1] - fx)
    Rr[fy:fy + h, fx:fx + w] = out[:h, :w]
    return Rr, {"raiz": [eje_x, y0], "fin": [eje_x, y0 + L1o + L2o], "codo": L1o}


def girar_vertical(P, raiz, fin, oscurecer=1.0):
    """Gira una pieza alrededor de `raiz` para que raiz→fin quede vertical (piernas, mechones)."""
    H, W = P.shape[:2]
    ang = math.degrees(math.atan2(fin[0] - raiz[0], fin[1] - raiz[1]))
    M = cv2.getRotationMatrix2D(tuple(map(float, raiz)), -ang, 1.0)
    pre = P.copy(); pre[..., :3] *= pre[..., 3:4]
    rot = cv2.warpAffine(pre, M, (W, H), flags=cv2.INTER_CUBIC, borderValue=0)
    rot = np.clip(rot, 0, None); a = np.clip(rot[..., 3:4], 1e-6, 1)
    rot[..., :3] = np.where(rot[..., 3:4] > 1e-4, rot[..., :3] / a, 0); rot[..., 3] = np.clip(rot[..., 3], 0, 1)
    rot[..., :3] *= oscurecer
    L = math.hypot(fin[0] - raiz[0], fin[1] - raiz[1])
    return rot, {"raiz": [raiz[0], raiz[1]], "fin": [raiz[0], raiz[1] + L], "largo": L, "giro_original": math.radians(ang)}


# ---------------------------------------------------------------- retrato
def linea_mandibula(h, guia, ventana=24):
    """Borde inferior de la línea negra de la mandíbula, columna a columna, cerca de los puntos guía."""
    gx, gy = zip(*guia)
    pts = []
    for x in range(int(gx[0]), int(gx[-1]) + 1):
        ye = int(np.interp(x, gx, gy))
        col = h.mx[ye - ventana:ye + ventana, x] < 95
        idx = np.where(col)[0]
        if len(idx) == 0: pts.append((x, ye + 3)); continue
        i1 = idx[0]
        while i1 + 1 < len(col) and col[i1 + 1]: i1 += 1
        pts.append((x, ye - ventana + i1 + 2))
    ys = ndi.uniform_filter1d(np.array([p[1] for p in pts], float), 7)
    return [(p[0], float(y)) for p, y in zip(pts, ys)]


def retrato(h, c, dep):
    """Cabeza del retrato (cuencas vacías), cejas, boca, cara roja y melena."""
    piezas, refs = {}, {}
    XX, YY = h.XX, h.YY
    zona = XX >= c["x_min"]
    # mandibula_ventana (opcional): ventana de búsqueda más estrecha alrededor de los puntos guía, para
    # barbas cuyos pelos sueltos tocan la línea de la mandíbula (Ander); sin ella, ±24 px como siempre
    mand = linea_mandibula(h, c["mandibula"], c.get("mandibula_ventana", 24))
    refs["mandibula"] = [[round(x, 1), round(y, 1)] for x, y in mand[::6]]
    g0, g1 = c["mandibula"][0], c["mandibula"][-1]
    cuello = h.poli([(g0[0] - 40, g0[1])] + mand + [(g1[0] + 10, g1[1]), (g1[0] + 10, 1402), (g0[0] - 40, 1402)])
    corte = c["corte_y"]
    m_cab = h.figura & zona & (YY < corte) & ~(cuello & h.piel)
    for zona_ex in c.get("excluir_piel", []): m_cab &= ~(h.poli(zona_ex) & h.piel)
    for zona_ex in c.get("excluir", []): m_cab &= ~h.poli(zona_ex)
    if c.get("cortar_bajo_mandibula"): m_cab &= ~cuello            # cuello de chaqueta, correas… (opcional)
    m_cab = ndi.binary_fill_holes(mayor_parte(m_cab)) & ~h.fondo
    # ojos: lo que no es piel dentro de cada zona (blanco, iris y pupila) → cuenca transparente
    ojos = {}
    for lado, nombre in (("d", "derecho"), ("i", "izquierdo")):
        z = h.poli(c["ojos"][lado])
        m = ndi.binary_fill_holes(z & ~h.piel) & z
        m = mayor_parte(ndi.binary_opening(m, iterations=1))
        ojos[lado] = m
        arr, aba = parpado(m)
        ys, xs = np.where(m)
        refs.setdefault("ojos", {})[lado] = {"arriba": arr, "abajo": aba}
    m_ojos = ndi.binary_dilation(ojos["d"] | ojos["i"], iterations=1)
    # cejas y boca
    cejas = {}
    for lado in ("d", "i"):
        z = h.poli(c["cejas"][lado])
        m = z & (h.dif_piel > c.get("ceja_umbral", 70))
        cejas[lado] = mayor_parte(ndi.binary_dilation(m, iterations=1) & z)
    zb = h.poli(c["boca"])
    boca = ndi.binary_dilation(zb & (h.dif_piel > c.get("boca_umbral", 55)), iterations=2) & zb
    # pendientes y otros adornos que se dibujan aparte (se borran de la cabeza). Cada zona es un
    # polígono o {"zona": polígono, "corte": [p0, p1, …], "linea": True}: el corte separa los dos
    # fondos que hay detrás (piel a un lado, pelo al otro) y cada lado se rellena solo con lo suyo;
    # con "linea" se vuelve a trazar el contorno de la cara por el corte.
    borrar_cfg = [z if isinstance(z, dict) else {"zona": z} for z in c.get("borrar", [])]
    hueco = ndi.binary_dilation(cejas["d"] | cejas["i"] | boca, iterations=2)
    cab = cv2.inpaint(h.src.copy(), hueco.astype(np.uint8) * 255, 7, cv2.INPAINT_TELEA)
    borra = np.zeros_like(m_cab)
    for zb_ in borrar_cfg:
        z = h.poli(zb_["zona"])
        m = z & ~h.piel & (((h.R - h.B > 60) & (h.G > 90)) | (h.mx > 200) | h.tinta)
        m = ndi.binary_dilation(m, iterations=2 + c.get("borrar_margen", 1)) & z
        borra |= m
        linea_corte = zb_.get("corte")
        def rellena(cab, msk, como, otro):
            if isinstance(como, (list, tuple)):                  # copiar textura de al lado (pelo)
                dx, dy = como; ys_, xs_ = np.where(msk)
                cab = cab.copy(); cab[ys_, xs_] = cab[np.clip(ys_ + dy, 0, h.H - 1), np.clip(xs_ + dx, 0, h.W - 1)]
                return cab
            parche = cv2.inpaint(cab, (msk | otro).astype(np.uint8) * 255, 9, cv2.INPAINT_TELEA)   # el otro lado no es fuente
            return np.where(msk[..., None], parche, cab)
        if not linea_corte:
            cab = rellena(cab, m, zb_.get("A", "inpaint"), np.zeros_like(m)); continue
        # lado A: hacia donde apunta la normal (−dy, dx) de p0→p1 (abajo si la línea va hacia la derecha)
        p0, p1 = np.array(linea_corte[0], float), np.array(linea_corte[-1], float)
        nrm = np.array([-(p1 - p0)[1], (p1 - p0)[0]])
        lado = ((XX - p0[0]) * nrm[0] + (YY - p0[1]) * nrm[1]) > 0
        for L, clave in ((lado, "A"), (~lado, "B")):
            cab = rellena(cab, m & L, zb_.get(clave, "inpaint"), z & ~L)
        if zb_.get("linea"):
            im = Image.fromarray(cab); ImageDraw.Draw(im).line([tuple(p) for p in linea_corte], fill=(14, 10, 10), width=zb_.get("ancho", 4), joint="curve")
            linea = np.array(im)
            cab = np.where(z[..., None], linea, cab)
    cab_alfa = h.alfa.copy(); cab_alfa[m_ojos] = 0
    fundido = c.get("fundido_pelo", 46)                         # el pelo se desvanece en el corte de abajo
    if fundido:
        # el borde no es una recta: cada columna acaba a una altura distinta, como puntas de mechones
        xs_ = XX.astype(np.float32)
        puntas = fundido * (0.55 + 0.3 * np.sin(xs_ * 0.21) + 0.15 * np.sin(xs_ * 0.077 + 2.0))
        f = np.clip((corte - YY - puntas * 0.6) / float(fundido) * 1.6, 0, 1)
        cab_alfa = np.where(h.pelo & (YY > corte - fundido), cab_alfa * f, cab_alfa)
    cab_rgb = cab.astype(np.float32); cab_rgb[h.desm & ~borra] = h.rgb[h.desm & ~borra]
    piv = c["pivote"]
    piezas["cabeza"] = (h.pieza(m_cab, cab_rgb, cab_alfa), piv, {"ojos": {"derecho": contorno(ojos["d"]), "izquierdo": contorno(ojos["i"])}})
    c8 = np.clip(cab_rgb, 0, 255).astype(np.int16)
    piel_cab = m_cab & (c8[..., 0] >= 150) & (c8[..., 0] - c8[..., 2] > 60) & (c8[..., 1] > 90)
    if c.get("roja_zona"): piel_cab &= h.poli(c["roja_zona"])     # p. ej. sin teñir un casco amarillo
    roja = cab_rgb.copy()
    roja[piel_cab] = roja[piel_cab] * np.array([1.0, 0.7, 0.72], np.float32) + np.array([0, 4, 6], np.float32)
    piezas["cabeza_roja"] = (h.pieza(m_cab, roja, cab_alfa), piv, None)
    piezas["ceja_derecha"] = (h.pieza(cejas["d"]), c["pivotes"]["ceja_d"], None)
    piezas["ceja_izquierda"] = (h.pieza(cejas["i"]), c["pivotes"]["ceja_i"], None)
    piezas["boca"] = (h.pieza(boca), c["pivotes"]["boca"], None)
    # melena: un mechón largo del retrato que cuelga y se balancea (tira enderezada)
    mel = c.get("melena")
    if mel:
        m = h.figura & zona & h.pelo & h.poli(mel["zona"])
        m &= ~(cuello & h.piel)
        for zb_ in borrar_cfg: m &= ~h.poli(zb_["zona"])
        m = mayor_parte(ndi.binary_closing(m, iterations=1) & h.figura)
        y_ini = min(p[1] for p in mel["zona"])
        mal = h.alfa * np.where(m, np.clip((YY - y_ini) / 30.0, 0, 1), 1)
        P, info = girar_vertical(h.pieza(m, h.rgb, mal), mel["raiz"], mel["fin"])
        piezas["melena"] = (P, mel["raiz"], info)
        Q = P.copy(); Q[..., :3] *= mel.get("oscurecer_atras", 0.72)
        piezas["melena_atras"] = (Q, mel["raiz"], info)
        dep("melena", m, (255, 0, 255))
    dep("cabeza", m_cab, (255, 0, 0))
    dep("ojos_cejas_boca_borrar", m_ojos | cejas["d"] | cejas["i"] | boca | borra, (0, 200, 0))
    return piezas, refs


# ---------------------------------------------------------------- figura
def brazo(h, b, cuerpo, pelo_fig):
    """Un brazo de la figura: máscara por polígono, reparación de lo tapado y enderezado."""
    zona = h.poli(b["poli"])
    rgb, alfa = h.rgb, h.alfa
    m = cuerpo & zona & ~pelo_fig & ~h.vaquero
    rep = b.get("reparar")
    if rep:                       # lo tapaba el pelo (o un hueco): se rellena de piel y se dibuja su borde
        tapado = zona & (pelo_fig | ~h.figura | (h.blanco if rep.get("quitar_blanco") else False))
        src = cv2.inpaint(h.src.copy(), ndi.binary_dilation(tapado, iterations=2).astype(np.uint8) * 255, 11, cv2.INPAINT_TELEA)
        mez = ndi.gaussian_filter(tapado.astype(np.float32), 2.0)[..., None]
        rgbf = src.astype(np.float32) * (1 - mez) + np.array(rep["piel"], np.float32) * mez
        im = Image.fromarray(np.clip(rgbf, 0, 255).astype(np.uint8))
        for linea in rep.get("lineas", []): ImageDraw.Draw(im).line([tuple(p) for p in linea], fill=(12, 10, 12), width=rep.get("ancho_linea", 5), joint="curve")
        rgb = np.array(im).astype(np.float32)
        alfa = h.alfa.copy(); alfa[zona & ~h.vaquero] = 1.0
        m = zona & ~h.vaquero & (h.figura | tapado)
    m = ndi.binary_fill_holes(mayor_parte(m))
    P = h.pieza(m, rgb, alfa)
    hom, codo, mun = b["hombro"], b["codo"], b["muneca"]
    R_, info = enderezar(P, [hom, codo, mun], hom[0], b.get("radio", 32), b.get("ancho", 70), b.get("sobre", 56), b.get("bajo", 2),
                         b.get("L1"), b.get("L2"))
    return m, rgb, alfa, R_, info


def figura(h, c, dep):
    piezas, refs = {}, {}
    XX, YY = h.XX, h.YY
    cuerpo = h.figura & (XX < c["x_max"])
    sobre_cuello = h.poli(c["cuello_corte"])
    bajo_pelvis = h.poli(c["pelvis_corte"])
    pelo_fig = cuerpo & h.pelo & ~h.vaquero & (YY < c.get("pelo_hasta_y", 520))
    # ---- brazos
    brazos = {}
    for nombre in ("brazo", "brazo_cerca"):
        b = c["brazos"].get(nombre)
        if not b: continue
        m, rgb_b, alfa_b, P, info = brazo(h, b, cuerpo, pelo_fig)
        brazos[nombre] = (m, rgb_b, alfa_b)
        piezas[nombre] = (P, b["hombro"], info)
        refs[nombre] = {"hombro": b["hombro"], "codo": b["codo"], "muneca": b["muneca"]}
    m_brazos = np.zeros_like(cuerpo)
    for m, _, _ in brazos.values(): m_brazos |= m
    # ---- torso
    t = c["torso"]
    z_torso = h.poli(t["poli"]) & ~bajo_pelvis
    manos = np.zeros_like(cuerpo)
    for zm in t.get("manos", []): manos |= h.poli(zm)
    rec = z_torso & (pelo_fig | m_brazos | h.fondo | ~h.figura)
    rec |= manos & z_torso & (h.piel | h.tinta | ~h.vaquero)
    ys, xs = np.where(z_torso)
    sub = (slice(max(0, ys.min() - 10), ys.max() + 10), slice(max(0, xs.min() - 10), xs.max() + 10))
    t_rgb = h.src.copy()
    # zonas que se dan por conocidas con un color liso antes de rellenar (p. ej. la cadera tras la mano)
    previo = np.zeros_like(cuerpo)
    for poli_, color in t.get("rellenos_previos", []):
        z = h.poli(poli_) & rec; t_rgb[z] = color; previo |= z
    # el fondo también cuenta como desconocido: así el relleno no arrastra blanco desde fuera
    inp = cv2.inpaint(t_rgb[sub].copy(), ((rec & ~previo)[sub] | h.fondo[sub]).astype(np.uint8) * 255, 9, cv2.INPAINT_TELEA)
    t_rgb[sub] = np.where(rec[sub][..., None], inp, t_rgb[sub])
    for poli_, color in t.get("rellenos", []):                  # zonas de color liso (top, piel, vaquero)
        z = h.poli(poli_) & rec
        t_rgb[z] = color
    forz = np.zeros_like(cuerpo)
    for poli_, color in t.get("forzar", []):                   # zonas que se pintan aunque no estuvieran tapadas
        z = h.poli(poli_); t_rgb[z] = color; forz |= z
    rec |= forz
    im = Image.fromarray(t_rgb); d = ImageDraw.Draw(im)
    for pts, color, ancho in t.get("lineas", []):              # contornos y costuras que quedaron tapados
        d.line([tuple(p) for p in pts], fill=tuple(color), width=ancho, joint="curve")
    libre_rgb = np.array(im).astype(np.float32)
    m_libre = mayor_parte(z_torso & (h.figura | rec))
    alfa_libre = h.alfa.copy(); alfa_libre[rec] = 1.0
    piezas["tronco_libre"] = (h.pieza(m_libre, libre_rgb, alfa_libre), c["pelvis"], None)
    # tronco con las manos en los bolsillos (la pose del avatar)
    tr_rgb, tr_alfa, m_tr = libre_rgb.copy(), alfa_libre.copy(), m_libre.copy()
    for m, rgb_b, alfa_b in brazos.values():
        tr_rgb[m] = rgb_b[m]; tr_alfa[m] = alfa_b[m]; m_tr |= m
    m_manos = manos & h.figura & ~bajo_pelvis
    tr_rgb[m_manos] = h.rgb[m_manos]; tr_alfa[m_manos] = h.alfa[m_manos]; m_tr |= m_manos
    piezas["tronco"] = (h.pieza(m_tr, tr_rgb, tr_alfa), c["pelvis"], None)
    # ---- piernas
    p = c["piernas"]
    def bajo_vaquero(x0, x1, dob=None):
        if dob:                                                  # dobladillo dado a mano: [(x, y), …]
            dx, dy = zip(*dob); return {x: int(round(float(np.interp(x, dx, dy)))) for x in range(x0, x1)}
        y0, y1 = p.get("bajo_y", (1150, 1300)); hh = {}
        for x in range(x0, x1):
            ys_ = np.where(h.vaquero[y0:y1, x])[0]
            hh[x] = y0 + ys_.max() + 4 if len(ys_) else None
        xs_ = [x for x in hh if hh[x] is not None]
        for x in hh:
            if hh[x] is None: hh[x] = hh[min(xs_, key=lambda q: abs(q - x))]
        return hh
    (sy0, sx0), (sy1, sx1) = p["separa"]
    sep = np.interp(YY, [sy0, sy1], [sx0, sx1])
    y_ini = p.get("desde_y", 620)
    excluir = m_brazos | manos
    hems = {}
    for lado in ("cerca", "lejos"):
        x0, x1 = p[lado]["x"]
        hh = bajo_vaquero(x0, x1, p[lado].get("dobladillo")); hems[lado] = hh
        m = np.zeros_like(cuerpo)
        for x in range(x0, x1): m[y_ini:hh[x], x] = True
        m &= (XX < sep) if lado == "cerca" else (XX >= sep)
        m &= bajo_pelvis | (YY > y_ini) & (YY < y_ini + 90)
        m = mayor_parte(m & cuerpo & ~excluir)
        cad, tob = p[lado]["cadera"], p[lado]["tobillo"]
        P = h.pieza(m)
        r = p.get("cupula", 70)                                 # cúpula de vaquero en la cadera (tapa huecos al girar)
        cup = ((XX - cad[0]) ** 2 + (YY - cad[1]) ** 2 <= r * r) & (YY < cad[1] + 30)
        nuevo = cup & (P[..., 3] < 0.99)
        P[nuevo, :3] = np.array(p.get("color_cupula", [128, 154, 192]), np.float32); P[nuevo, 3] = 1.0
        R_, info = girar_vertical(P, cad, tob, 1.0 if lado == "cerca" else p.get("oscurecer_lejos", 0.8))
        piezas["pierna_" + lado] = (R_, cad, info)
        dep("pierna_" + lado, m, (0, 220, 120))
    # ---- zapatilla (la de perfil) para los dos pies
    z = p["zapato"]
    tob = z["tobillo"]
    hh = hems[z.get("bajo_de", "lejos")]
    m_zap = np.zeros_like(cuerpo)
    for x in range(z["x"][0], z["x"][1]):
        yh = hh.get(x, z["y_tope"])
        m_zap[yh - 3:z["y_suela"] + 6, x] = True
    m_zap = mayor_parte(m_zap & h.figura & (XX < z["x"][1]))
    zap_rgb, zap_alfa = h.rgb.copy(), h.alfa.copy()
    ex, ey = z.get("collar", (46, 26))
    zim = Image.fromarray(np.clip(zap_rgb, 0, 255).astype(np.uint8)); zd = ImageDraw.Draw(zim)
    zd.ellipse([tob[0] - ex, tob[1] - ey, tob[0] + ex - 2, tob[1] + ey - 6], fill=tuple(z.get("color_collar", (236, 230, 230))), outline=(10, 10, 12), width=5)
    zl = h.poli([(tob[0] + math.cos(a) * (ex + 2), tob[1] - 3 + math.sin(a) * (ey + 1)) for a in np.linspace(0, 2 * math.pi, 40)])
    zap_new = np.array(zim).astype(np.float32)
    zap_rgb = np.where((zl & ~m_zap)[..., None], zap_new, zap_rgb)
    zap_alfa = np.where(zl & ~m_zap, 1.0, zap_alfa)
    ZAP = h.pieza(m_zap | zl, zap_rgb, zap_alfa)
    ys_z = np.where(m_zap)[0]
    refs["suela"] = int(ys_z.max())
    niv = z.get("nivelar")                    # [talón, puntera] donde la suela toca el suelo → se gira para dejarla plana
    if niv:
        (tx, ty), (px, py) = niv
        ang = math.degrees(math.atan2(py - ty, px - tx))
        M = cv2.getRotationMatrix2D(tuple(map(float, tob)), ang, 1.0)
        pre = ZAP.copy(); pre[..., :3] *= pre[..., 3:4]
        rot = cv2.warpAffine(pre, M, (h.W, h.H), flags=cv2.INTER_CUBIC, borderValue=0)
        rot = np.clip(rot, 0, None); al = np.clip(rot[..., 3:4], 1e-6, 1)
        rot[..., :3] = np.where(rot[..., 3:4] > 1e-4, rot[..., :3] / al, 0); rot[..., 3] = np.clip(rot[..., 3], 0, 1)
        ZAP = rot
        gira = lambda q: M @ np.array([q[0], q[1], 1.0])
        tal, pun = gira(niv[0]), gira(niv[1])
        refs["suela"] = int(np.where(ZAP[..., 3] > 0.5)[0].max())     # lo más bajo de la suela ya plana
        refs["talon"] = [round(float(tal[0] - tob[0]), 1), round(float(tal[1] - tob[1]), 1)]
        refs["punta"] = [round(float(pun[0] - tob[0]), 1), round(float(pun[1] - tob[1]), 1)]
    ZAP_L = ZAP.copy(); ZAP_L[..., :3] *= p.get("oscurecer_lejos", 0.8)
    piezas["zapato"] = (ZAP, tob, None); piezas["zapato_lejos"] = (ZAP_L, tob, None)
    dep("brazos", m_brazos, (255, 120, 0))
    dep("torso", m_libre, (0, 120, 255))
    dep("reconstruir", rec, (255, 0, 0))
    dep("zapato", m_zap | zl, (0, 220, 120))
    return piezas, refs


# ---------------------------------------------------------------- empaquetado
def recorta_y_escala(P, tau, nombre, pivote, extra=None):
    a = P[..., 3]
    ys, xs = np.where(a > 0.004)
    x0, x1, y0, y1 = xs.min() - 3, xs.max() + 4, ys.min() - 3, ys.max() + 4
    c = P[y0:y1, x0:x1].copy()
    pre = c.copy(); pre[..., :3] *= pre[..., 3:4]
    w, hgt = max(1, round((x1 - x0) * tau)), max(1, round((y1 - y0) * tau))
    chans = [np.array(Image.fromarray(pre[..., i].astype(np.float32), "F").resize((w, hgt), Image.LANCZOS)) for i in range(4)]
    out = np.stack(chans, -1)
    al = np.clip(out[..., 3], 0, 1)
    rgbo = np.where(al[..., None] > 1e-3, out[..., :3] / np.maximum(al[..., None], 1e-3), 0)
    img = np.concatenate([np.clip(rgbo, 0, 255), (al * 255)[..., None]], -1).astype(np.uint8)
    info = {"origen": [int(x0), int(y0)], "tam_hoja": [int(x1 - x0), int(y1 - y0)], "tau": tau,
            "pivote": [float(pivote[0]), float(pivote[1])]}
    if extra: info.update(extra)
    return nombre, Image.fromarray(img, "RGBA"), info


def empaqueta(lista, ancho=1024, pad=4):
    x = y = pad; fila = 0; marcos = {}
    for nombre, img, info in sorted(lista, key=lambda q: (-q[1].height, q[0])):
        if x + img.width + pad > ancho: x = pad; y += fila + pad; fila = 0
        marcos[nombre] = (x, y, img, info); x += img.width + pad; fila = max(fila, img.height)
    atlas = Image.new("RGBA", (ancho, y + fila + pad), (0, 0, 0, 0))
    meta = {}
    for nombre, (x, y, img, info) in marcos.items():
        atlas.paste(img, (x, y))
        meta[nombre] = dict(info, marco=[x, y, img.width, img.height])
    return atlas, meta


def construir(cfg, salida=None, depura=None):
    """Genera piezas.png y piezas.js del personaje a partir de su CFG."""
    import sys
    args = sys.argv[1:]
    fuente = pathlib.Path(args[0]) if len(args) > 0 else RAIZ / cfg["fuente"]
    salida = pathlib.Path(args[1]) if len(args) > 1 else pathlib.Path(salida or (ANIM / "personajes" / cfg["id"]))
    depura = pathlib.Path(args[2]) if len(args) > 2 else (pathlib.Path(depura) if depura else None)
    h = Hoja(fuente, cfg)

    def dep(nombre, mask, color):
        if not depura: return
        depura.mkdir(parents=True, exist_ok=True)
        im = h.src.astype(np.float32).copy()
        im[mask] = im[mask] * 0.45 + np.array(color, np.float32) * 0.55
        Image.fromarray(im.astype(np.uint8)).save(depura / f"{nombre}.png")

    dep("fondo", h.fondo, (0, 160, 255))
    p_ret, refs_ret = retrato(h, cfg["retrato"], dep)
    p_fig, refs_fig = figura(h, cfg["figura"], dep)
    tau_c, tau_r = cfg.get("tau_cuerpo", 0.42), cfg.get("tau_cabeza", 0.25)
    lista = [recorta_y_escala(P, tau_r, n, piv, extra) for n, (P, piv, extra) in p_ret.items()]
    lista += [recorta_y_escala(P, tau_c, n, piv, extra) for n, (P, piv, extra) in p_fig.items()]
    atlas, meta = empaqueta(lista)
    paleta = dict(cfg.get("paleta", {}))
    for k, zona in cfg.get("paleta_muestras", {}).items(): paleta[k] = h.color_medio(zona)
    salida.mkdir(parents=True, exist_ok=True)
    atlas.save(salida / "piezas.png", optimize=True)
    datos = {"fuente": cfg["fuente"], "hoja": [h.W, h.H], "atlas": ["piezas.png"], "piezas": meta, "paleta": paleta,
             "referencias": dict(refs_ret, **refs_fig)}
    (salida / "piezas.js").write_text(
        "/* Generado por preparar_piezas.py (personajes/comun/preparar.py) a partir del avatar 2D. No editar a mano. */\n"
        "window.PIEZAS_2D = window.PIEZAS_2D || {};\n"
        f"window.PIEZAS_2D[{json.dumps(cfg['id'])}] = {json.dumps(datos, ensure_ascii=False, separators=(',', ':'))};\n",
        encoding="utf-8")
    print(cfg["id"], "atlas", atlas.size, "·", ", ".join(f"{k} {v['marco'][2]}×{v['marco'][3]}" for k, v in sorted(meta.items())))
    print("referencias:", json.dumps({k: v for k, v in datos["referencias"].items() if k in ("suela", "talon", "punta")}))
    return datos
