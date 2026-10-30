#!/usr/bin/env python3
"""Renderiza la versión anterior (fondo blanco) de los SVG Astra sin su fondo,
que generar_mascaras.py usa como guía de qué pertenece a cada pieza.

    git -C <repo> worktree add /tmp/astra-0aa384a 0aa384a
    python3 preparar_anteriores.py "/tmp/astra-0aa384a/avatares SVG - Astra" /tmp/astra-anteriores
"""
import io, os, re, sys, glob, json
import resvg_py
from PIL import Image

origen, destino = sys.argv[1].rstrip('/') + '/', sys.argv[2]
vb = {}
for f in sorted(glob.glob(origen + '*/[0-9][0-9]-*.svg')):
    rel = os.path.relpath(f, origen)
    slug, nombre = rel.split('/')[0], os.path.basename(rel)[:-4]
    d = open(f, 'rb').read()
    k = max(0, d.find(b'</defs>'))
    m = re.compile(rb'<rect[^>]*fill="#fff"[^>]*/>').search(d, k, k + 3000)
    if m:
        d = d[:m.start()] + d[m.end():]
    vb[rel] = [float(v) for v in re.search(rb'viewBox="([^"]+)"', d).group(1).split()]
    os.makedirs(f'{destino}/{slug}', exist_ok=True)
    Image.open(io.BytesIO(bytes(resvg_py.svg_to_bytes(svg_string=d.decode('utf-8'))))).save(f'{destino}/{slug}/{nombre}__t.png')
    print(rel)
for f in sorted(glob.glob(origen + '*.svg')):
    slug = os.path.basename(f)[:-4]
    d = open(f, encoding='utf-8').read()
    d = re.sub(r'<rect id="fondo"[^>]*/>', '', d, count=1)
    d = re.sub(r'<g id="sombras-suelo">.*?</g>', '', d, count=1, flags=re.S)
    Image.open(io.BytesIO(bytes(resvg_py.svg_to_bytes(svg_string=d)))).save(f'{destino}/master_t_{slug}.png')
json.dump(vb, open(f'{destino}/vb.json', 'w'))
