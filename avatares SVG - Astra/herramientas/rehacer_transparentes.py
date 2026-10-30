#!/usr/bin/env python3
"""Genera los SVG Astra con fondo transparente a partir de las hojas maestras.

Conserva tal cual los trazados y degradados de cada hoja maestra (el detalle
vectorial de Astra). Lo que hace:
  * quita el rectángulo blanco de fondo y las sombras de suelo;
  * aplica la silueta de herramientas/mascaras/<slug>.npz (ver siluetas.py):
    zapatillas y ropa blanca completas, sin cuadros de fondo, sin halo blanco
    en el pelo, sin restos de figuras vecinas ni líneas de borde de panel;
  * guarda las diez piezas con los mismos nombres en los 14 avatares y un
    viewBox ajustado a la silueta con 8 px de margen.

Es idempotente: se puede volver a ejecutar sobre las hojas ya transparentes.

Uso (desde la raíz del repositorio):
    python3 "avatares SVG - Astra/herramientas/rehacer_transparentes.py" <salida> [slug ...]
Sin slugs procesa los 14. Después, copiar <salida>/* sobre la carpeta.
"""
import os, re, io, sys, json, hashlib
import numpy as np, cv2
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
ASTRA = os.path.dirname(AQUI) + '/'
REPO = os.path.dirname(os.path.dirname(AQUI))
MASCARAS = AQUI + '/mascaras/'
NOMBRES = {'Guillermo-Aladro': 'Guillermo Aladro', 'Marcos-Bombero': 'Marcos Bombero', 'Sara-Saez': 'Sara Saez'}
PARTES = ['01-frontal', '02-tres-cuartos', '03-perfil', '04-espalda',
          '05-neutral', '06-risa', '07-sorpresa', '08-cansancio', '09-ojos-cerrados', '10-guino']
ETIQUETAS = {'01-frontal': 'Vista frontal', '02-tres-cuartos': 'Vista de tres cuartos', '03-perfil': 'Vista de perfil',
             '04-espalda': 'Vista de espalda', '05-neutral': 'Expresión neutral', '06-risa': 'Risa',
             '07-sorpresa': 'Sorpresa', '08-cansancio': 'Cansancio, mano en la mejilla',
             '09-ojos-cerrados': 'Ojos cerrados', '10-guino': 'Guiño', '10-ceno-fruncido': 'Ceño fruncido'}
# Guillermo: su décima expresión no es un guiño, sino el ceño fruncido.
ARCHIVO = {('Guillermo-Aladro', '10-guino'): '10-ceno-fruncido'}
# Capas de la hoja maestra de Guillermo (tiene una capa por pieza).
CAPAS_G = {'01-frontal': '01-frontal', '02-tres-cuartos': '02-tres-cuartos', '03-perfil': '03-perfil',
           '04-espalda': '04-espalda', '05-neutral': '05-serio', '06-risa': '06-sonrisa', '07-sorpresa': '07-sorpresa',
           '08-cansancio': '08-cansancio', '09-ojos-cerrados': '09-ojos-cerrados', '10-guino': '10-ceno-fruncido'}
MARGEN = 8
NUM = re.compile(r'-?\d+(?:\.\d+)?')


def trazar_mascara(binaria2x):
    """Traza una máscara binaria (a escala 2x de la hoja) como trazados spline."""
    import vtracer
    h, w = binaria2x.shape
    ys, xs = np.where(binaria2x)
    x0, y0 = max(0, xs.min() - 2), max(0, ys.min() - 2)
    x1, y1 = min(w, xs.max() + 3), min(h, ys.max() + 3)
    sub = binaria2x[y0:y1, x0:x1]
    g = np.where(sub, 0, 255).astype(np.uint8)
    px = [(int(v), int(v), int(v), 255) for v in g.reshape(-1)]
    svg = vtracer.convert_pixels_to_svg(px, size=(x1 - x0, y1 - y0), colormode='binary', mode='spline',
                                        filter_speckle=4, corner_threshold=60, length_threshold=4.0,
                                        splice_threshold=45, path_precision=1)
    out = []
    for p in re.findall(r'<path [^>]*/>', svg):
        d = re.search(r' d="([^"]*)"', p).group(1)
        m = re.search(r'translate\(([-\d.]+),([-\d.]+)\)', p)
        tx, ty = (float(m.group(1)), float(m.group(2))) if m else (0.0, 0.0)
        out.append(f'<path d="{d}" transform="translate({tx + x0:g},{ty + y0:g})" clip-rule="evenodd"/>')
    return out


def limpiar_suelo(alfa, banda=30, minimo=60):
    """Quita restos finos de la sombra del suelo bajo los zapatos: en la franja
    inferior de la figura, apertura 3x3 y fuera las islas pequeñas."""
    b = alfa >= 0.5
    ys = np.where(b.any(1))[0]
    y1 = ys.max() + 1
    y0 = max(0, y1 - banda)
    abierta = cv2.morphologyEx(b[y0:y1].astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
    nb = b.copy()
    nb[y0:y1] = abierta
    # Franjas de sombra de contacto de menos de 5 filas bajo la suela.
    z0 = max(0, y1 - 20)
    baja = cv2.morphologyEx(nb[z0:y1].astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 3), np.uint8)) > 0
    nb[y1 - 8:y1] = baja[-8:]
    n, lab, st, _ = cv2.connectedComponentsWithStats(nb.astype(np.uint8), 8)
    grande = 1 + int(np.argmax(st[1:, 4]))
    keep = (lab == grande) | np.isin(lab, [k for k in range(1, n) if st[k, 4] >= minimo and st[k, 1] < y0])
    return np.where(keep, alfa, 0).astype(np.float32)


def poligonos(binaria2x, tol=0.6):
    """Contornos (exteriores y huecos) como polígonos absolutos, para clip-rule evenodd."""
    cs, _ = cv2.findContours(binaria2x.astype(np.uint8), cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    out = []
    for c in cs:
        if cv2.contourArea(c) < 6:
            continue
        p = cv2.approxPolyDP(c, tol, True)[:, 0, :]
        out.append('M' + 'L'.join(f'{a},{b}' for a, b in p) + 'Z')
    return ' '.join(out)


def mascara_2x(alfa):
    a = cv2.resize(alfa.astype(np.float32), (alfa.shape[1] * 2, alfa.shape[0] * 2), interpolation=cv2.INTER_LINEAR)
    return a >= 0.5


def caja(binaria, W, H, margen=MARGEN):
    ys, xs = np.where(binaria)
    x0, y0 = max(0, xs.min() - margen), max(0, ys.min() - margen)
    x1, y1 = min(W, xs.max() + 1 + margen), min(H, ys.max() + 1 + margen)
    return int(x0), int(y0), int(x1 - x0), int(y1 - y0)


def caja_trazado(etiqueta, dx=0.0, dy=0.0):
    d = re.search(r' d="([^"]*)"', etiqueta).group(1)
    v = [float(n) for n in NUM.findall(d)]
    m = re.search(r'translate\(([-\d.]+),([-\d.]+)\)', etiqueta)
    tx, ty = (float(m.group(1)), float(m.group(2))) if m else (0.0, 0.0)
    xs, ys = v[0::2], v[1::2]
    return min(xs) + tx + dx, min(ys) + ty + dy, max(xs) + tx + dx, max(ys) + ty + dy


def degradados(texto):
    return {m.group(2): m.group(0) for m in re.finditer(
        r'<(linearGradient|radialGradient) id="([^"]+)".*?</\1>', texto, re.S)}


def usados(trazos):
    return sorted(set(re.findall(r'url\(#([^)]+)\)', ''.join(trazos))))


def cortar(trazos, cajas, bb):
    """Trazados cuya caja (2x) se cruza con bb (2x)."""
    X0, Y0, X1, Y1 = bb
    return [t for t, (a, b, c, d) in zip(trazos, cajas) if c >= X0 and a <= X1 and d >= Y0 and b <= Y1]


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('"', '&quot;')


def construir(slug, salida, entrada=None):
    nombre = NOMBRES.get(slug, slug)
    master = open((entrada or ASTRA) + slug + '.svg', encoding='utf-8').read()
    W, H = (int(v) for v in re.search(r'viewBox="0 0 (\d+) (\d+)"', master).groups())
    ref = f'animaciones/Avatar {nombre}.png'
    ref_sha = hashlib.sha256(open(f'{REPO}/{ref}', 'rb').read()).hexdigest()
    mask = np.load(f'{MASCARAS}{slug}.npz')
    partes = {k: mask[k].astype(np.float32) / 255 for k in PARTES}
    for k in PARTES[:4]:
        partes[k] = limpiar_suelo(partes[k])
    grads = degradados(master)
    guillermo = slug == 'Guillermo-Aladro'

    # --- Arte de la hoja maestra ---
    if guillermo:
        capas = {}
        for m in re.finditer(r'<g inkscape:groupmode="layer" inkscape:label="([^"]*)"(?: clip-path="url\(#([^)]+)\)")? id="([^"]+)">'
                             r'<title>[^<]*</title><g transform="translate\(([-\d.]+),([-\d.]+)\)">(.*?)</g></g>', master, re.S):
            label, clip, lid, tx, ty, cuerpo = m.groups()
            tr = re.findall(r'<path [^>]*/>', cuerpo)
            tx, ty = float(tx), float(ty)
            capas[lid] = dict(label=label, clip=clip, tx=tx, ty=ty, trazos=tr,
                              cajas=[caja_trazado(t, tx, ty) for t in tr])
        recortes = {m.group(1): m.group(0) for m in re.finditer(r'<clipPath id="(recorte-[^"]+)".*?</clipPath>', master, re.S)}
        assert len(capas) == 11, list(capas)
    else:
        g = re.search(r'<g clip-path="url\(#siluetas\)"[^>]*id="avatar-[^"]+"[^>]*>(.*?)</g>\s*<metadata', master, re.S)
        trazos = re.findall(r'<path [^>]*/>', g.group(1))
        cajas = [caja_trazado(t) for t in trazos]

    informe = {'avatar': nombre, 'referencia': ref, 'referencia_sha256': ref_sha, 'archivos': []}
    os.makedirs(f'{salida}/{slug}', exist_ok=True)

    # --- Piezas individuales ---
    for k in PARTES:
        archivo = ARCHIVO.get((slug, k), k)
        etiqueta = ETIQUETAS[archivo]
        b = partes[k] >= 0.5
        x, y, w, h = caja(b, W, H)
        b2 = mascara_2x(partes[k])
        clip = trazar_mascara(b2)
        bb = (2 * x - 4, 2 * y - 4, 2 * (x + w) + 4, 2 * (y + h) + 4)
        if guillermo:
            propia = CAPAS_G[k]
            if k in PARTES[:4]:
                # Cuerpos: una capa; su recorte viejo cortaba las zapatillas, se sustituye.
                c = capas[propia]
                sel = cortar(c['trazos'], c['cajas'], bb)
                cuerpo = f'<g transform="translate({c["tx"]:g},{c["ty"]:g})">' + '\n'.join(sel) + '</g>'
                defs_extra = []
            else:
                # Caras: el pelo cruza las particiones de la hoja; se usan la capa propia y
                # las vecinas, cada una con su recorte, y la silueta nueva por encima.
                orden = [CAPAS_G[p] for p in PARTES[4:]]
                i = orden.index(propia)
                trozos, defs_extra, sel = [], [], []
                for lid in orden[max(0, i - 1):i + 2]:
                    c = capas[lid]
                    s_ = cortar(c['trazos'], c['cajas'], bb)
                    if not s_:
                        continue
                    sel += s_
                    trozos.append(f'<g clip-path="url(#{c["clip"]})"><g transform="translate({c["tx"]:g},{c["ty"]:g})">'
                                  + '\n'.join(s_) + '</g></g>')
                    defs_extra.append(recortes[c['clip']])
                cuerpo = '\n'.join(trozos)
        else:
            sel = cortar(trazos, cajas, bb)
            cuerpo = '\n'.join(sel)
            defs_extra = []
        gr = [grads[u] for u in usados(sel) if u in grads]
        meta = {'avatar': nombre, 'pieza': archivo, 'referencia': ref, 'referencia_sha256': ref_sha,
                'hoja_maestra': f'{slug}.svg', 'escala_interna': 0.5, 'fondo': 'transparente',
                'caja_en_hoja': [x, y, w, h]}
        svg = (f'<?xml version="1.0" encoding="UTF-8"?>\n'
               f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="{x} {y} {w} {h}" '
               f'role="img" aria-labelledby="title desc">'
               f'<title id="title">{esc(nombre)} · {esc(etiqueta)}</title>'
               f'<desc id="desc">{esc(etiqueta)} de {esc(nombre)}, recortada de la hoja maestra con fondo transparente. '
               f'Trazados y degradados vectoriales; sin imágenes incrustadas.</desc>'
               f'<defs><clipPath id="silueta" clipPathUnits="userSpaceOnUse">' + ''.join(clip) + '</clipPath>'
               + ''.join(defs_extra) + ''.join(gr) + '</defs>\n'
               f'<g id="{archivo}" transform="scale(0.5)" clip-path="url(#silueta)">\n{cuerpo}\n</g>\n'
               f'<metadata id="procedencia">{esc(json.dumps(meta, ensure_ascii=False))}</metadata>\n</svg>\n')
        if guillermo and k in PARTES[:4]:
            # Compatibilidad con los generadores de las escenas de cerveza: recorte
            # con el id de siempre como polígono absoluto y el arte como último hijo.
            c = capas[CAPAS_G[k]]
            lid = CAPAS_G[k]
            poli = poligonos(b2)
            svg = (f'<?xml version="1.0" encoding="UTF-8"?>\n'
                   f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" '
                   f'width="{w}" height="{h}" viewBox="{x} {y} {w} {h}" role="img" aria-labelledby="title desc">'
                   f'<title id="title">{esc(nombre)} · {esc(etiqueta)}</title>'
                   f'<desc id="desc">{esc(etiqueta)} de {esc(nombre)}, recortada de la hoja maestra con fondo transparente. '
                   f'Trazados y degradados vectoriales; sin imágenes incrustadas.</desc>'
                   f'<defs><clipPath id="recorte-{lid}" clipPathUnits="userSpaceOnUse"><path d="{poli}" clip-rule="evenodd"/></clipPath>'
                   + ''.join(gr) + '</defs>\n'
                   f'<metadata id="procedencia">{esc(json.dumps(meta, ensure_ascii=False))}</metadata>\n'
                   f'<g transform="scale(0.5)"><g inkscape:groupmode="layer" inkscape:label="{esc(c["label"])}" '
                   f'clip-path="url(#recorte-{lid})" id="{lid}"><title>{esc(c["label"])}</title>'
                   f'<g transform="translate({c["tx"]:g},{c["ty"]:g})">' + '\n'.join(sel) + '</g></g></g>\n</svg>\n')
        open(f'{salida}/{slug}/{archivo}.svg', 'w', encoding='utf-8').write(svg)
        informe['archivos'].append({'archivo': f'{slug}/{archivo}.svg', 'pieza': archivo, 'caja_en_hoja': [x, y, w, h],
                                    'trazados': len(sel)})

    # --- Firma (nombre manuscrito), guardada en la máscara ---
    firma = mask['firma'] >= 128
    total = np.maximum.reduce([partes[k] for k in PARTES] + [firma.astype(np.float32)])

    # --- Hoja maestra transparente ---
    m2 = re.sub(r'<rect id="fondo"[^>]*/>', '', master, count=1)
    m2 = re.sub(r'<g id="sombras-suelo">.*?</g>', '', m2, count=1, flags=re.S)
    m2 = re.sub(r'<radialGradient id="sombra-suelo">.*?</radialGradient>', '', m2, count=1, flags=re.S)
    clip_total = '<clipPath id="siluetas" clipPathUnits="userSpaceOnUse">' + ''.join(trazar_mascara(mascara_2x(total))) + '</clipPath>'
    m2 = re.sub(r'<clipPath id="siluetas".*?</clipPath>', '', m2, count=1, flags=re.S)
    m2 = m2.replace('<defs>', '<defs>' + clip_total, 1)
    if guillermo:
        for p in PARTES[:4]:
            lid = CAPAS_G[p]
            viejo = capas[lid]['clip']
            if viejo:
                m2 = m2.replace(f' clip-path="url(#{viejo})" id="{lid}"', f' id="{lid}"', 1)
                m2 = re.sub(rf'<clipPath id="{viejo}".*?</clipPath>', '', m2, count=1, flags=re.S)
        m2 = re.sub(r'<g id="guillermo-aladro" transform="scale\(0\.5\)"[^>]*>',
                    '<g id="guillermo-aladro" transform="scale(0.5)" clip-path="url(#siluetas)">', m2, count=1)
    assert m2.count('<clipPath id="siluetas"') == 1
    m2 = re.sub(r'<desc id="desc">.*?</desc>', f'<desc id="desc">Hoja de personaje de {esc(nombre)}: cuatro vistas de cuerpo '
                f'entero y seis expresiones, con fondo transparente. Trazados y degradados vectoriales; sin imágenes '
                f'incrustadas.</desc>', m2, count=1, flags=re.S)
    assert 'id="fondo"' not in m2 and 'sombras-suelo' not in m2
    open(f'{salida}/{slug}.svg', 'w', encoding='utf-8').write(m2)
    print(slug, 'ok')
    return informe


TODOS = ['Ander', 'Carla', 'Dari', 'Deivi', 'Gabacho', 'Guillermo-Aladro', 'Kiriku', 'Laura', 'Marcos-Bombero',
         'Marta', 'Paradigma', 'Rodri', 'Sara-Saez', 'Yorgi']

if __name__ == '__main__':
    salida = sys.argv[1]
    entrada = os.environ.get('ASTRA_ENTRADA')  # carpeta alternativa con las hojas maestras
    for slug in sys.argv[2:] or TODOS:
        construir(slug, salida, entrada + '/' if entrada else None)
