#!/usr/bin/env python3
"""Vectoriza una hoja de avatar (4 vistas de cuerpo entero + 6 expresiones + firma)
en un SVG por capas, con fondo transparente, en las mismas coordenadas que la hoja.

Uso (con los ajustes por defecto, que son los del avatar de Guillermo Aladro):
    python3 vectorizar_avatar.py "animaciones/Avatar Guillermo Aladro.png" bruto.svg \
        --nombre "Guillermo Aladro" --slug guillermo-aladro \
        --fuente-repo "animaciones/Avatar Guillermo Aladro.png" --informe informe.json
    npx svgo@4 --config svgo.config.mjs -i bruto.svg -o "Avatar Guillermo Aladro.svg"
    python3 partir_svg.py "Avatar Guillermo Aladro.svg" "Guillermo Aladro"

Requisitos (una vez):
    pip install "rembg[cpu]" vtracer numpy pillow opencv-python-headless scipy scikit-image
    (rembg descarga el modelo isnet-general-use, ~180 MB, la primera vez)

Pasos:
 1. Detecta el diseño de la hoja: 4 figuras arriba, 6 paneles de cara abajo, firma a la izquierda.
 2. Recorta el fondo con un modelo de segmentación (isnet) sobre cada franja completa
    (en recortes estrechos confunde el blanco de las zapatillas con el fondo).
 3. Separa figuras y caras que se tocan (brazos, pelo que invade el panel vecino) con
    watershed desde el eje de cada cabeza / centro de cada panel.
 4. Afina el contorno del pelo: despeja la mezcla con el fondo blanco para recuperar los
    mechones y no dejar filo gris; los bordes toman el color del interior (sin halo).
 5. Traza cada parte ampliada x2 con vtracer (splines, capas de color finas).
 6. Añade encima una capa solo para la tela negra, trazada con los oscuros expandidos
    (gamma), para que la camiseta tenga sombreado continuo en vez de manchas.
 7. Monta un SVG con un grupo <g id> por vista, por expresión y para la firma; cada grupo
    lleva data-caja="x y ancho alto" con su contorno exacto.
"""
import argparse, hashlib, io, json, re, sys
import numpy as np
from PIL import Image
import cv2

FONDO = np.array([253.5, 253.6, 253.6])

VISTAS = ["frontal", "tres-cuartos", "perfil", "espalda"]
VISTAS_TXT = ["Vista frontal", "Vista de tres cuartos", "Vista de perfil", "Vista de espalda"]
EXPRESIONES = ["neutral", "risa", "sorpresa", "dormido", "ojos-cerrados", "mirada-de-lado"]
EXPRESIONES_TXT = ["Expresión neutral", "Risa con un ojo entornado", "Sorpresa",
                   "Dormido apoyado en la mano", "Ojos cerrados, tranquilo", "Mirada de lado"]

# Ajustes de vtracer: detalle alto, curvas spline suaves.
VT = dict(colormode="color", hierarchical="stacked", mode="spline",
          filter_speckle=2, color_precision=8, layer_difference=6,
          corner_threshold=60, length_threshold=3.5, max_iterations=10,
          splice_threshold=45, path_precision=1)


def runs(v):
    out, s = [], None
    for i, x in enumerate(v):
        if x and s is None:
            s = i
        if not x and s is not None:
            out.append((s, i - 1)); s = None
    if s is not None:
        out.append((s, len(v) - 1))
    return out


def detectar_diseno(rgb):
    H, W, _ = rgb.shape
    oscuro = rgb.min(axis=2) < 240
    filas = runs(oscuro.sum(1) > 2)
    filas = [r for r in filas if r[1] - r[0] > 40]
    if len(filas) < 2:
        sys.exit("No encuentro las dos franjas (vistas y caras)")
    arriba, abajo = filas[0], filas[-1]
    # Paneles de cara: columnas blancas en la parte baja de la franja inferior.
    banda = rgb[abajo[1] - 40:abajo[1] - 4]
    blanco = (banda.min(axis=2) >= 240).all(axis=0)
    paneles = [r for r in runs(~blanco) if r[1] - r[0] > 60]
    if len(paneles) != 6:
        sys.exit(f"Esperaba 6 paneles de cara y encuentro {len(paneles)}: {paneles}")
    return arriba, abajo, paneles


def mascara_ia(img_rgb, sesion):
    from rembg import remove
    m = remove(Image.fromarray(img_rgb), session=sesion, only_mask=True, post_process_mask=False)
    return np.asarray(m, dtype=np.float32) / 255.0


def componentes(binaria, minimo=20):
    n, lab, st, _ = cv2.connectedComponentsWithStats(binaria.astype(np.uint8), 8)
    comps = [(i, st[i]) for i in range(1, n) if st[i][4] >= minimo]
    return lab, comps


def afinar_pelo(rgb, alfa, zona):
    """El modelo da una silueta suave que rellena el hueco entre pinchos de pelo
    con fondo blanco. En `zona` (cabezas), lo casi blanco y sin color que está
    pegado al contorno pasa a transparente, y así se recuperan los mechones."""
    from scipy.ndimage import distance_transform_edt
    fuera = alfa < 0.5
    dist = distance_transform_edt(~fuera)
    mn, mx = rgb.min(axis=2), rgb.max(axis=2)
    blancura = np.clip((mn - 196) / 46.0, 0, 1) * (mx - mn < 26)
    a_color = 1 - blancura
    # Mezcla con el fondo: cada píxel del borde es a·F + (1−a)·blanco, con F el
    # color del interior más cercano (pelo, piel). Se despeja a. Así las puntas
    # claras de pelo mezcladas con el blanco no quedan como un filo gris.
    # El interior de referencia no puede ser fondo blanco atrapado entre pinchos.
    interior = (alfa >= 0.95) & (dist >= 5) & ~((mn > 150) & (mx - mn < 30))
    _, (iy, ix) = distance_transform_edt(~interior, return_indices=True)
    F = rgb[iy, ix]
    d = F - FONDO
    n2 = (d * d).sum(axis=2)
    a_mezcla = np.clip(((rgb - FONDO) * d).sum(axis=2) / np.maximum(n2, 1), 0, 1)
    fiable = n2 > 60 ** 2          # si F es casi blanco (camiseta blanca), no se toca
    a_color = np.where(fiable, np.minimum(a_color, a_mezcla), a_color)
    cerca = (dist < 16) & zona
    return np.where(cerca, np.minimum(alfa, a_color), alfa)


def descontaminar(rgb, alfa):
    """Quita el blanco del fondo que se mezcla en los bordes (pelo, contorno).
    Los píxeles semitransparentes toman el color del píxel opaco más cercano,
    así no queda halo claro al poner el avatar sobre la pantalla negra."""
    from scipy.ndimage import distance_transform_edt
    nucleo = alfa >= 0.95
    _, (iy, ix) = distance_transform_edt(~nucleo, return_indices=True)
    cercano = rgb[iy, ix]
    borde = (alfa > 0.02) & ~nucleo
    out = rgb.copy()
    out[borde] = cercano[borde]
    return np.clip(out, 0, 255)


def gamma_ida(v, g):
    return 255.0 * (np.clip(v, 0, 255) / 255.0) ** g


def gamma_vuelta_hex(svg_trazos, g):
    """Devuelve los colores de relleno al espacio original."""
    def f(m):
        h = m.group(1)
        c = [int(h[i:i + 2], 16) for i in (0, 2, 4)]
        c = [int(round(255.0 * (x / 255.0) ** (1.0 / g))) for x in c]
        return 'fill="#%02x%02x%02x"' % tuple(min(255, max(0, x)) for x in c)
    return [re.sub(r'fill="#([0-9a-fA-F]{6})"', f, t) for t in svg_trazos]


def vectorizar(rgb, alfa, caja, escala=1, gamma=1.0):
    """Vectoriza un recorte. Con escala > 1 se amplía antes de trazar: los
    mechones y las costuras finas salen con curvas más limpias."""
    import vtracer
    x0, y0, x1, y1 = caja
    sub = rgb[y0:y1, x0:x1].astype(np.float32)
    a = alfa[y0:y1, x0:x1].astype(np.float32)
    if escala > 1:
        tam = ((x1 - x0) * escala, (y1 - y0) * escala)
        sub = cv2.resize(sub, tam, interpolation=cv2.INTER_LANCZOS4)
        a = cv2.resize(a, tam, interpolation=cv2.INTER_LINEAR)
    if gamma != 1.0:
        # Expande los tonos oscuros para que el sombreado de la ropa negra y del
        # pelo tenga capas propias; luego los colores se devuelven a su valor real.
        sub = gamma_ida(sub, gamma)
    sub = np.clip(np.round(sub), 0, 255).astype(np.uint8)
    a8 = np.where(a >= 0.5, 255, 0).astype(np.uint8)
    rgba = np.dstack([sub, a8])
    h, w = a8.shape
    px = [tuple(int(c) for c in p) for p in rgba.reshape(-1, 4)]
    svg = vtracer.convert_pixels_to_svg(px, size=(w, h), **VT)
    trazos = re.findall(r"<path [^>]*/>", svg)
    return gamma_vuelta_hex(trazos, gamma) if gamma != 1.0 else trazos


def ajustar(trazos, dx, dy):
    """Pasa las traslaciones de vtracer a coordenadas absolutas de la hoja."""
    out = []
    for t in trazos:
        m = re.search(r'transform="translate\(([-\d.]+),([-\d.]+)\)"', t)
        tx, ty = (float(m.group(1)), float(m.group(2))) if m else (0.0, 0.0)
        t = re.sub(r'\s*transform="[^"]*"', "", t)
        t = t.replace("<path ", f'<path transform="translate({tx + dx:g},{ty + dy:g})" ', 1)
        out.append(t)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("entrada"); ap.add_argument("salida")
    ap.add_argument("--nombre", required=True); ap.add_argument("--slug", required=True)
    ap.add_argument("--fuente-repo", default=None, help="ruta de la hoja dentro del repo, para los metadatos")
    ap.add_argument("--informe", default=None, help="JSON con cajas y recuentos")
    ap.add_argument("--mascara", default=None, help="PNG con la máscara final (para verificar)")
    ap.add_argument("--capas", type=int, default=VT["layer_difference"], help="diferencia de color entre capas (menos = más detalle)")
    ap.add_argument("--motas", type=int, default=VT["filter_speckle"], help="tamaño mínimo de mancha en px")
    ap.add_argument("--precision", type=int, default=VT["path_precision"], help="decimales en las coordenadas")
    ap.add_argument("--suavizado", type=float, default=0.0, help="sigma (px) del desenfoque de la ropa oscura para quitar el grano de la tela (0 = sin filtro)")
    ap.add_argument("--gamma", type=float, default=0.5, help="<1 añade una capa para la tela negra trazada con los oscuros expandidos (0.5 recomendado; 1 = sin capa)")
    ap.add_argument("--escala", type=int, default=2, help="ampliación antes de trazar (2 = más detalle en mechones)")
    args = ap.parse_args()
    VT.update(layer_difference=args.capas, filter_speckle=args.motas, path_precision=args.precision)

    from rembg import new_session
    sesion = new_session("isnet-general-use")
    bruto = open(args.entrada, "rb").read()
    sha = hashlib.sha256(bruto).hexdigest()
    rgb = np.asarray(Image.open(io.BytesIO(bruto)).convert("RGB")).astype(np.float32)
    H, W, _ = rgb.shape
    arriba, abajo, paneles = detectar_diseno(rgb.astype(int))

    alfa = np.zeros((H, W), np.float32)

    # --- Figuras: primera pasada de toda la franja para localizarlas ---
    ya, yb = max(0, arriba[0] - 30), min(H, arriba[1] + 14)
    m_total = mascara_ia(rgb[ya:yb].astype(np.uint8), sesion)
    lab, comps = componentes(m_total > 0.5, 400)
    total = sum(c[1][4] for c in comps)
    grandes = [c[0] for c in comps if c[1][4] > 0.05 * total]
    cuerpo = np.isin(lab, grandes)
    # Cabezas: columnas ocupadas en la franja superior de los cuerpos.
    filas_c = np.where(cuerpo.any(1))[0]
    techo = filas_c.min()
    cabezas = [r for r in runs(cuerpo[techo:techo + 150].any(0)) if r[1] - r[0] > 50]
    if len(cabezas) != 4:
        sys.exit(f"Esperaba 4 cabezas y encuentro {len(cabezas)}: {cabezas}")
    # Separa figuras que se tocan con watershed: semillas en el eje de cada cabeza.
    from skimage.segmentation import watershed
    from skimage.filters import sobel
    semillas = np.zeros(cuerpo.shape, np.int32)
    for i, (c0, c1) in enumerate(cabezas):
        cx = (c0 + c1) // 2
        franja = np.zeros_like(cuerpo)
        franja[:, cx - 5:cx + 6] = True
        semillas[franja & cuerpo] = i + 1
    relieve = sobel(rgb[ya:yb].mean(axis=2) / 255.0)
    # Cada píxel del cuerpo va a una de las 4 figuras; el corte sigue los bordes de la imagen.
    marcas = watershed(relieve, semillas, mask=cuerpo)
    cajas_fig = []
    for i in range(4):
        propia = (marcas == i + 1) & cuerpo
        ys_, xs_ = np.where(propia)
        x, y, w, h = xs_.min(), ys_.min(), xs_.max() - xs_.min() + 1, ys_.max() - ys_.min() + 1
        cx0, cx1 = max(0, x - 24), min(W, x + w + 24)
        cy0, cy1 = max(ya, ya + y - 24), min(yb, ya + y + h + 24)
        # La máscara de la franja completa es más fiable que un recorte estrecho
        # (en recortes el modelo confunde el blanco de las zapatillas con el fondo).
        m = m_total[cy0 - ya:cy1 - ya, cx0:cx1]
        # Solo la parte de esta figura (evita trozos de la vecina o de la firma).
        sel_lab = propia[cy0 - ya:cy1 - ya, cx0:cx1]
        sel_lab = cv2.dilate(sel_lab.astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
        otras = cuerpo[cy0 - ya:cy1 - ya, cx0:cx1] & ~propia[cy0 - ya:cy1 - ya, cx0:cx1]
        sel_lab &= ~otras
        sel = np.where(sel_lab, m, 0)
        bloque = np.zeros((H, W), np.float32)
        bloque[cy0:cy1, cx0:cx1] = sel
        alfa = np.maximum(alfa, bloque)
        cajas_fig.append((cx0, cy0, cx1, cy1, bloque >= 0.5))

    # --- Firma: tinta oscura fuera de las figuras, arriba a la izquierda ---
    resto = (m_total > 0.5) & ~cuerpo
    tinta = np.zeros((H, W), bool)
    tinta[ya:yb] = cv2.dilate(resto.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    tinta[:, int(W * 0.4):] = False
    oscur = rgb.min(axis=2)
    alfa_firma = np.clip((236 - oscur) / 140.0, 0, 1) * tinta
    ys, xs = np.where(alfa_firma > 0.5)
    caja_firma = (max(0, xs.min() - 4), max(0, ys.min() - 4), min(W, xs.max() + 5), min(H, ys.max() + 5)) if len(xs) else None
    color_firma = np.median(rgb[alfa_firma > 0.85], axis=0) if len(xs) else np.array([30, 30, 40])

    # --- Caras: el pelo sobresale de su panel e invade el vecino, así que no se
    # cortan por columnas: se separan desde el centro de cada cara (watershed). ---
    from scipy.ndimage import binary_fill_holes
    fy0, fy1 = max(0, abajo[0] - 24), min(H, abajo[1] + 2)
    tira = rgb[fy0:fy1]
    m_caras = mascara_ia(tira.astype(np.uint8), sesion)
    # Lo oscuro (camiseta, pelo, ojos) nunca es fondo: el modelo a veces deja
    # fuera esquinas de la camiseta cortadas por el borde del panel.
    m_caras = np.maximum(m_caras, (tira.max(axis=2) < 90).astype(np.float32))
    # Bordes laterales de cada panel: línea clara de antialiasing que se
    # vectorizaría como un filo blanco. Se quita solo donde es clara.
    claro = tira.min(axis=2) > 205
    for (a, b) in paneles:
        for x in (a, a + 1, b - 1, b):
            m_caras[claro[:, x], x] = 0
    m_caras[-3:][claro[-3:]] = 0
    # Huecos cerrados: se rellenan salvo si son blanco de fondo atrapado entre mechones.
    blanco_t = (tira.min(axis=2) > 205) & (np.ptp(tira, axis=2) < 26)
    huecos = binary_fill_holes(m_caras >= 0.5) & (m_caras < 0.5) & ~blanco_t
    m_caras = np.where(huecos, 1.0, m_caras)
    bin_caras = m_caras >= 0.5
    semillas = np.zeros(bin_caras.shape, np.int32)
    for i, (a, b) in enumerate(paneles):
        cx = (a + b) // 2
        semillas[:, cx - 5:cx + 6][bin_caras[:, cx - 5:cx + 6]] = i + 1
    lab_caras = watershed(sobel(tira.mean(axis=2) / 255.0), semillas, mask=bin_caras)
    alfa[fy0:fy1] = np.maximum(alfa[fy0:fy1], m_caras)
    cajas_cara = []
    for i in range(len(paneles)):
        propia = np.zeros((H, W), bool)
        propia[fy0:fy1] = lab_caras == i + 1
        ys_, xs_ = np.where(propia)
        cajas_cara.append((xs_.min(), ys_.min(), xs_.max() + 1, ys_.max() + 1, propia))

    # Cabezas: arriba de cada figura y toda la tira de caras.
    zona = np.zeros((H, W), bool)
    for (x0, y0, x1, y1, _) in cajas_fig:
        zona[y0:y0 + int(0.2 * (y1 - y0)), x0:x1] = True
    zona[fy0:fy1] = True
    alfa = afinar_pelo(rgb, alfa, zona)
    color = descontaminar(rgb, alfa)
    if args.suavizado > 0:
        # Solo la ropa oscura: la trama de la tela negra se cuantiza en manchas.
        # Un desenfoque normalizado dentro de la tela quita ese grano y conserva
        # el sombreado amplio (pliegues, cuello, hombros). Piel, barba y ojos intactos.
        tela = cv2.morphologyEx((rgb.max(axis=2) < 70).astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8)).astype(np.float32)
        k = (0, 0)
        num = cv2.GaussianBlur(color.astype(np.float32) * tela[..., None], k, args.suavizado)
        den = cv2.GaussianBlur(tela, k, args.suavizado)[..., None]
        suave = num / np.maximum(den, 1e-3)
        peso = cv2.GaussianBlur(tela, (0, 0), 1.5)[..., None] * tela[..., None]
        color = peso * suave + (1 - peso) * color
    abin = alfa >= 0.5
    # Tela negra (camiseta): oscura y poco saturada, en manchas grandes. El pelo
    # castaño oscuro queda fuera por saturación y por grosor.
    from scipy.ndimage import binary_fill_holes as _rellenar
    mx_, mn_ = rgb.max(axis=2), rgb.min(axis=2)
    tela = ((mx_ < 78) & (mx_ - mn_ < 28)).astype(np.uint8)
    tela = cv2.morphologyEx(tela, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    tela = cv2.morphologyEx(tela, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    tela = _rellenar(tela > 0) & cv2.erode(abin.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    # Solo manchas grandes: las sombras del pelo también son oscuras, pero pequeñas.
    _lab, _comps = componentes(tela, 2500)
    tela = np.isin(_lab, [i for i, _ in _comps])
    # Quita motas sueltas (restos del fondo).
    lab2, comps2 = componentes(abin, 1)
    for i, st in comps2:
        if st[4] < 30:
            abin[lab2 == i] = False
            alfa[lab2 == i] = 0

    grupos = []
    informe = {"fuente_sha256": sha, "tamano": [W, H], "escala_trazado": args.escala, "gamma_trazado": args.gamma, "suavizado_tela": args.suavizado,
               "ajustes_vtracer": dict(VT), "vistas": {}, "expresiones": {}}
    f = args.escala
    for tipo, nombres, textos, cajas_parte in (("vista", VISTAS, VISTAS_TXT, cajas_fig),
                                              ("cara", EXPRESIONES, EXPRESIONES_TXT, cajas_cara)):
        for nombre, txt, (x0, y0, x1, y1, propia) in zip(nombres, textos, cajas_parte):
            recorte = (x0, y0, x1, y1)
            parte = np.where(propia, alfa, 0)
            tr = vectorizar(color, parte, recorte, f)
            if args.gamma != 1.0:
                # Segunda capa encima, solo sobre la tela negra: trazada con los oscuros
                # expandidos para que los pliegues tengan sombreado continuo en vez de manchas.
                tr += vectorizar(color, np.where(propia & tela, 1.0, 0.0), recorte, f, args.gamma)
            trans = f"translate({x0} {y0})" + (f" scale({1 / f:g})" if f > 1 else "")
            grupos.append((f"{args.slug}-{tipo}-{nombre}", txt, tr, tipo, trans))
            # Caja ajustada al personaje (sin el margen del recorte), lista para usar como viewBox.
            ys_, xs_ = np.where(parte >= 0.5)
            caja = (int(xs_.min()), int(ys_.min()), int(xs_.max()) + 1, int(ys_.max()) + 1)
            clave = "vistas" if tipo == "vista" else "expresiones"
            informe[clave][nombre] = {"caja": caja, "trazos": len(tr)}

    firma_svg = ""
    if caja_firma:
        import vtracer
        x0, y0, x1, y1 = caja_firma
        a8 = (alfa_firma[y0:y1, x0:x1] >= 0.5).astype(np.uint8)
        g = np.where(a8 > 0, 0, 255).astype(np.uint8)
        px = [(int(v), int(v), int(v), 255) for v in g.reshape(-1)]
        s = vtracer.convert_pixels_to_svg(px, size=(x1 - x0, y1 - y0), colormode="binary",
                                          mode="spline", filter_speckle=4, corner_threshold=60,
                                          length_threshold=4.0, splice_threshold=45, path_precision=2)
        tr = ajustar(re.findall(r"<path [^>]*/>", s), x0, y0)
        hexf = "#%02x%02x%02x" % tuple(int(c) for c in color_firma)
        tr = [re.sub(r'fill="[^"]*"', f'fill="{hexf}"', t) for t in tr]
        firma_svg = "\n".join(tr)
        informe["firma"] = {"caja": caja_firma, "trazos": len(tr), "color": hexf}

    def ident(s, n=2):
        return " " * n + s

    partes = []
    partes.append('<?xml version="1.0" encoding="UTF-8"?>')
    partes.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
                  f'role="img" aria-labelledby="titulo desc">')
    partes.append(f'<title id="titulo">Avatar {args.nombre}</title>')
    partes.append(f'<desc id="desc">Hoja de personaje vectorizada de {args.nombre}: cuatro vistas de cuerpo entero '
                  f'(frontal, tres cuartos, perfil y espalda) y seis expresiones. Fondo transparente. '
                  f'Fuente: {args.fuente_repo or args.entrada} (SHA-256 {sha}).</desc>')
    partes.append(f'<metadata>{json.dumps({"fuente": args.fuente_repo or args.entrada, "sha256_fuente": sha, "lienzo": [W, H], "metodo": "segmentacion isnet + vtracer spline x2 + capa de tela con gamma, grupos por vista y expresion"}, ensure_ascii=False)}</metadata>')
    cajas = {}
    for k, v in informe["vistas"].items():
        cajas[f"{args.slug}-vista-{k}"] = v["caja"]
    for k, v in informe["expresiones"].items():
        cajas[f"{args.slug}-cara-{k}"] = v["caja"]

    def caja_attr(gid):
        x0, y0, x1, y1 = (int(c) for c in cajas[gid])
        return f'data-caja="{x0} {y0} {x1 - x0} {y1 - y0}"'

    if firma_svg:
        x0, y0, x1, y1 = (int(c) for c in caja_firma)
        partes.append(f'<g id="{args.slug}-firma" aria-label="Firma: {args.nombre}" data-caja="{x0} {y0} {x1 - x0} {y1 - y0}">')
        partes.append(firma_svg)
        partes.append("</g>")
    for bloque, tipo in (("vistas", "vista"), ("expresiones", "cara")):
        partes.append(f'<g id="{args.slug}-{bloque}">')
        for gid, txt, tr, t, trans in grupos:
            if t != tipo:
                continue
            partes.append(ident(f'<g id="{gid}" aria-label="{txt}" {caja_attr(gid)}>'))
            partes.append(ident(f'<g transform="{trans}">', 4))
            partes.extend(tr)
            partes.append(ident("</g>", 4))
            partes.append(ident("</g>"))
        partes.append("</g>")
    partes.append("</svg>")
    open(args.salida, "w", encoding="utf-8").write("\n".join(partes) + "\n")
    if args.informe:
        json.dump(informe, open(args.informe, "w"), ensure_ascii=False, indent=2, default=int)
    if args.mascara:
        Image.fromarray((abin * 255).astype(np.uint8)).save(args.mascara)
    print(json.dumps(informe, ensure_ascii=False, default=int))


if __name__ == "__main__":
    main()
