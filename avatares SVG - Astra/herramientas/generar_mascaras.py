#!/usr/bin/env python3
"""Calcula herramientas/mascaras/<slug>.npz: una silueta por pieza (10) y la firma.

    ASTRA_ANTERIORES=/tmp/astra-anteriores python3 generar_mascaras.py [slug ...]

Las máscaras ya calculadas están guardadas en el repositorio; solo hace falta
volver a generarlas si cambia una hoja de animaciones/.
"""
import os, sys, glob
import numpy as np, cv2
from PIL import Image
import siluetas as S

ANT = S.ANTERIORES
TODOS = ['Ander', 'Carla', 'Dari', 'Deivi', 'Gabacho', 'Guillermo-Aladro', 'Kiriku', 'Laura', 'Marcos-Bombero',
         'Marta', 'Paradigma', 'Rodri', 'Sara-Saez', 'Yorgi']
for slug in sys.argv[1:] or TODOS:
    anteriores = [os.path.basename(f)[:-6] for f in sorted(glob.glob(f'{ANT}/{slug}/[0-9][0-9]-*__t.png'))]
    rgb, viejas, partes = S.calcular(slug, anteriores)
    m = {k: (v * 255).astype(np.uint8) for k, v in partes.items()}
    # Firma: tinta oscura de la hoja anterior lejos de las piezas.
    vieja = np.asarray(Image.open(f'{ANT}/master_t_{slug}.png'))[..., 3] >= 128
    union = np.zeros(vieja.shape, bool)
    for v in m.values():
        union |= v >= 128
    lejos = ~cv2.dilate(union.astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool)
    firma = vieja & lejos & (rgb.max(axis=2) < 160)
    n, lab, st, _ = cv2.connectedComponentsWithStats(firma.astype(np.uint8), 8)
    firma = np.isin(lab, [i for i in range(1, n) if st[i, 4] >= 30])
    firma = cv2.dilate(firma.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool) & vieja
    m['firma'] = (firma * 255).astype(np.uint8)
    os.makedirs(f'{S.AQUI}/mascaras', exist_ok=True)
    np.savez_compressed(f'{S.AQUI}/mascaras/{slug}.npz', **m)
    print(slug, 'ok')
