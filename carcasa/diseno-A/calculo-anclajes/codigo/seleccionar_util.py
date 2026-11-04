"""Redondeo de coordenadas a 0,5 mm manteniéndolas dentro de las zonas admisibles."""
import numpy as np
from nucleo import en_zona


def redondear(pts):
    out = []
    for x, z in pts:
        cands = [(float(fx(x * 2) / 2), float(fz(z * 2) / 2)) for fx in (np.floor, np.ceil) for fz in (np.floor, np.ceil)]
        cands.sort(key=lambda p: (p[0] - x) ** 2 + (p[1] - z) ** 2)
        ok = [p for p in cands if en_zona(*p)]
        out.append(ok[0] if ok else (round(x, 1), round(z, 1)))
    return out
