#!/usr/bin/env python3
"""Verifica los SVG transparentes y deja hojas de revisión sobre negro.

    python3 verificar_transparentes.py <carpeta_svg> <salida> [slug ...]

<carpeta_svg> es la carpeta "avatares SVG - Astra" (o la salida de
rehacer_transparentes.py). En <salida> quedan informe.json y, por avatar,
rev_<slug>_cuerpos.png / rev_<slug>_caras.png (original | SVG sobre negro).

Por archivo: XML válido, ids únicos, referencias internas resueltas, sin imágenes
ni recursos externos, fondo transparente (esquinas alfa 0), silueta que coincide
con la máscara (IoU), error de color frente a la hoja original dentro de la
silueta y piezas sueltas.
"""
import os, re, io, sys, json, glob, hashlib
import numpy as np, cv2, resvg_py
from PIL import Image, ImageDraw, ImageFont
from lxml import etree

AQUI = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(AQUI))
NOMBRES = {'Guillermo-Aladro': 'Guillermo Aladro', 'Marcos-Bombero': 'Marcos Bombero', 'Sara-Saez': 'Sara Saez'}
S = '{http://www.w3.org/2000/svg}'


def estructura(datos):
    r = etree.fromstring(datos, etree.XMLParser(huge_tree=True))
    ids, refs, tags = [], [], {}
    for el in r.iter():
        if not isinstance(el.tag, str):
            continue
        t = el.tag.replace(S, '')
        tags[t] = tags.get(t, 0) + 1
        if el.get('id'):
            ids.append(el.get('id'))
        for k, v in el.attrib.items():
            refs += re.findall(r'url\(#([^)]+)\)', v)
            if k.endswith('href'):
                refs.append(v)
    externos = [x for x in refs if not re.match(r'^[\w.-]+$', x)]
    faltan = sorted(set(x for x in refs if re.match(r'^[\w.-]+$', x)) - set(ids))
    return dict(xml_valido=True, ids_unicos=len(ids) == len(set(ids)), referencias_rotas=faltan,
                externos=externos, imagenes=tags.get('image', 0), scripts=tags.get('script', 0),
                trazados=tags.get('path', 0), degradados=tags.get('linearGradient', 0) + tags.get('radialGradient', 0),
                viewBox=r.get('viewBox'))


def render(datos):
    return np.asarray(Image.open(io.BytesIO(bytes(resvg_py.svg_to_bytes(svg_string=datos.decode('utf-8'))))).convert('RGBA'))


def verificar(slug, carpeta, OUT):
    nombre = NOMBRES.get(slug, slug)
    rgb = np.asarray(Image.open(f'{REPO}/animaciones/Avatar {nombre}.png').convert('RGB')).astype(np.float32)
    mask = np.load(f'{AQUI}/mascaras/{slug}.npz')
    claves = [k for k in mask.files if k != 'firma']
    res = []
    tiles = []
    for f in sorted(glob.glob(f'{carpeta}/{slug}/[0-9][0-9]-*.svg')):
        datos = open(f, 'rb').read()
        e = estructura(datos)
        img = render(datos)
        x, y, w, h = (int(float(v)) for v in e['viewBox'].split())
        clave = claves[int(os.path.basename(f)[:2]) - 1]
        m = mask[clave][y:y + h, x:x + w] >= 128
        a = img[..., 3] >= 128
        iou = float((a & m).sum() / max(1, (a | m).sum()))
        ref = rgb[y:y + h, x:x + w]
        dentro = a & m
        mae = float(np.abs(img[..., :3].astype(np.float32) - ref)[dentro].mean())
        esquinas = int(max(img[0, 0, 3], img[0, -1, 3], img[-1, 0, 3], img[-1, -1, 3]))
        n, lab, st, _ = cv2.connectedComponentsWithStats(a.astype(np.uint8), 8)
        sueltas = int(sum(1 for k in range(1, n) if st[k, 4] >= 15)) - 1
        e.update(archivo=os.path.relpath(f, carpeta), bytes=len(datos), sha256=hashlib.sha256(datos).hexdigest(),
                 iou_silueta=round(iou, 4), error_color_medio=round(mae, 2), alfa_esquinas=esquinas,
                 piezas_sueltas=sueltas)
        res.append(e)
        negro = Image.new('RGBA', (w, h), (0, 0, 0, 255))
        negro.alpha_composite(Image.fromarray(img))
        tiles.append((os.path.basename(f)[:-4], Image.fromarray(ref.astype(np.uint8)), negro.convert('RGB')))
    # Hoja de revisión: original | SVG sobre negro
    try:
        F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
    except Exception:
        F = None
    for grupo, sel, sc in (('cuerpos', tiles[:4], 0.62), ('caras', tiles[4:], 1.0)):
        Hh = int(max(t[1].size[1] for t in sel) * sc) + 22
        Ww = sum(int(t[1].size[0] * sc) * 2 + 20 for t in sel)
        c = Image.new('RGB', (Ww, Hh), (70, 70, 80)); g = ImageDraw.Draw(c); x0 = 0
        for nm, a1, b1 in sel:
            g.text((x0 + 2, 3), nm, fill=(255, 255, 255), font=F)
            for im in (a1, b1):
                im2 = im.resize((int(im.size[0] * sc), int(im.size[1] * sc)), Image.LANCZOS)
                c.paste(im2, (x0, 20)); x0 += im2.size[0] + 3
            x0 += 14
        c.save(f'{OUT}/rev_{slug}_{grupo}.png')
    # Hoja maestra
    datos = open(f'{carpeta}/{slug}.svg', 'rb').read()
    e = estructura(datos)
    img = render(datos)
    esquinas = int(max(img[0, 0, 3], img[0, -1, 3], img[-1, 0, 3], img[-1, -1, 3]))
    e.update(archivo=f'{slug}.svg', bytes=len(datos), sha256=hashlib.sha256(datos).hexdigest(), alfa_esquinas=esquinas)
    res.insert(0, e)
    for r in res:
        print(f"{r['archivo']:34s} {r['bytes'] / 1e6:6.2f}MB ids_ok={r['ids_unicos']} rotas={len(r['referencias_rotas'])} "
              f"ext={len(r['externos'])} img={r['imagenes']} esq={r['alfa_esquinas']} "
              f"iou={r.get('iou_silueta', '-')} err={r.get('error_color_medio', '-')} sueltas={r.get('piezas_sueltas', '-')}")
    return res


TODOS = ['Ander', 'Carla', 'Dari', 'Deivi', 'Gabacho', 'Guillermo-Aladro', 'Kiriku', 'Laura', 'Marcos-Bombero',
         'Marta', 'Paradigma', 'Rodri', 'Sara-Saez', 'Yorgi']

if __name__ == '__main__':
    carpeta, OUT = sys.argv[1].rstrip('/'), sys.argv[2]
    os.makedirs(OUT, exist_ok=True)
    todo = []
    for slug in sys.argv[3:] or TODOS:
        todo += verificar(slug, carpeta, OUT)
    json.dump(todo, open(f'{OUT}/informe.json', 'w'), ensure_ascii=False, indent=1)
    ind = [r for r in todo if 'iou_silueta' in r]
    mal = [r['archivo'] for r in todo if not r['ids_unicos'] or r['referencias_rotas'] or r['externos'] or r['imagenes'] or r['scripts']]
    print(f"{len(todo)} SVG | estructura con fallos: {mal} | IoU mínimo {min(r['iou_silueta'] for r in ind):.4f} | "
          f"error de color medio máximo {max(r['error_color_medio'] for r in ind):.2f}")
