"""
optimizar.py — búsqueda del patrón de anclajes (recocido simulado con varios arranques + pulido por coordenadas).

Función objetivo (a maximizar): lambda = min sobre (casos de la envolvente) x (borde apoyado, borde empotrado) de
    F_rec / max_i |F_i|        (|F_i| = resultante tracción + cortante del anclaje i)
penalizada si dos anclajes quedan a menos de S_MIN. Las posiciones se proyectan siempre a las zonas admisibles.
El método es heurístico: NO demuestra un óptimo global (se informan varios arranques para ver la dispersión).

Uso:  python optimizar.py SALIDA.json [iteraciones] [n_min] [n_max]
"""
import json
import math
import sys
import time
from multiprocessing import Pool

import numpy as np

from nucleo import FEMRapido, ZONAS, en_zona, proyectar
from evaluacion import casos_diseno, evaluar, S_MIN

CASOS = casos_diseno()
_M = None


def _modelos():
    global _M
    if _M is None:
        _M = [FEMRapido(h=20.0, empotrado=False), FEMRapido(h=20.0, empotrado=True)]
    return _M


def lam_patron(pts):
    return min(evaluar(pts, m, CASOS)["lam"] for m in _modelos())


def penal(pts):
    p = np.asarray(pts)
    d = np.sqrt(((p[:, None, :] - p[None, :, :]) ** 2).sum(-1))
    iu = np.triu_indices(len(p), 1)
    return float(np.maximum(0.0, S_MIN - d[iu]).sum() / S_MIN)


def objetivo(pts):
    lam = lam_patron(pts)
    return lam - 20.0 * penal(pts), lam


def punto_aleatorio(rng, x_min=None):
    pesos = np.array([0.38, 0.47, 0.15])
    while True:
        zn = ZONAS[rng.choice(3, p=pesos)]
        x = rng.uniform(*zn["x"]) if x_min is None else rng.uniform(max(x_min, zn["x"][0]), zn["x"][1])
        z = rng.uniform(*zn["z"])
        if en_zona(x, z):
            return (x, z)


def expandir(est, sim):
    """est: lista de puntos libres (sim=False) o (pares, ejes) para patrones simétricos."""
    if not sim:
        return [tuple(p) for p in est]
    pares, ejes = est
    out = []
    for x, z in pares:
        out += [(-x, z), (x, z)]
    out += [(0.0, z) for z in ejes]
    return out


def inicial(n, rng, sim):
    for _ in range(2000):
        if sim:
            npar, neje = n // 2, n % 2
            pares = [punto_aleatorio(rng, x_min=25.0) for _ in range(npar)]
            ejes = []
            for _ in range(neje):
                while True:
                    x, z = punto_aleatorio(rng)
                    if en_zona(0.0, z):
                        ejes.append(z); break
            est = (pares, ejes)
        else:
            est = [punto_aleatorio(rng) for _ in range(n)]
        if penal(expandir(est, sim)) == 0:
            return est
    return est


def mover(est, rng, sigma, sim):
    if not sim:
        new = list(est)
        i = rng.integers(len(new))
        if rng.random() < 0.15:
            new[i] = punto_aleatorio(rng)
        else:
            new[i] = proyectar(new[i][0] + rng.normal(0, sigma), new[i][1] + rng.normal(0, sigma))
        return new
    pares, ejes = list(est[0]), list(est[1])
    k = rng.integers(len(pares) + len(ejes))
    if k < len(pares):
        if rng.random() < 0.15:
            pares[k] = punto_aleatorio(rng, x_min=25.0)
        else:
            x, z = proyectar(abs(pares[k][0] + rng.normal(0, sigma)), pares[k][1] + rng.normal(0, sigma))
            pares[k] = (abs(x), z)
    else:
        j = k - len(pares)
        z = ejes[j] + rng.normal(0, sigma) if rng.random() > 0.15 else punto_aleatorio(rng)[1]
        x, z = proyectar(0.0, z)
        ejes[j] = z if abs(x) < 1e-9 else ejes[j]
    return (pares, ejes)


def recocido(args):
    n, seed, iters, sim = args
    rng = np.random.default_rng(seed)
    est = inicial(n, rng, sim)
    J, lam = objetivo(expandir(est, sim))
    best = (J, lam, est)
    T0, T1 = 0.6, 0.004
    hist = []
    t0 = time.time()
    for k in range(iters):
        f = k / iters
        T = T0 * (T1 / T0) ** f
        sigma = 45.0 * (1.5 / 45.0) ** f
        cand = mover(est, rng, sigma, sim)
        Jc, lamc = objetivo(expandir(cand, sim))
        if Jc >= J or rng.random() < math.exp((Jc - J) / T):
            est, J, lam = cand, Jc, lamc
            if J > best[0]:
                best = (J, lam, est)
        if k % 50 == 0:
            hist.append((k, best[0]))
    # pulido por coordenadas (pasos 3 y 1 mm, 2 pasadas como máximo)
    est = best[2]
    J = best[0]
    for paso in (3.0, 1.0):
        mejora, pasadas = True, 0
        while mejora and pasadas < 2:
            mejora = False
            pasadas += 1
            pts = expandir(est, sim)
            nvar = len(pts) if not sim else len(est[0]) + len(est[1])
            for i in range(nvar):
                for dx, dz in ((paso, 0), (-paso, 0), (0, paso), (0, -paso)):
                    if not sim:
                        cand = list(est)
                        p = (cand[i][0] + dx, cand[i][1] + dz)
                        if not en_zona(*p):
                            continue
                        cand[i] = p
                    else:
                        pares, ejes = list(est[0]), list(est[1])
                        if i < len(pares):
                            p = (pares[i][0] + dx, pares[i][1] + dz)
                            if p[0] < 0 or not en_zona(*p):
                                continue
                            pares[i] = p
                        else:
                            if dx:
                                continue
                            zz = ejes[i - len(pares)] + dz
                            if not en_zona(0.0, zz):
                                continue
                            ejes[i - len(pares)] = zz
                        cand = (pares, ejes)
                    Jc, lamc = objetivo(expandir(cand, sim))
                    if Jc > J + 1e-6:
                        est, J, lam = cand, Jc, lamc
                        mejora = True
    pts = expandir(est, sim)
    return dict(n=n, seed=seed, sim=sim, J=J, lam=lam_patron(pts), pen=penal(pts), pts=[list(map(float, p)) for p in pts],
                hist=hist, t=time.time() - t0)


if __name__ == "__main__":
    salida = sys.argv[1]
    iters = int(sys.argv[2]) if len(sys.argv) > 2 else 2500
    nmin = int(sys.argv[3]) if len(sys.argv) > 3 else 6
    nmax = int(sys.argv[4]) if len(sys.argv) > 4 else 18
    trabajos = []
    for n in range(nmax, nmin - 1, -1):
        trabajos += [(n, 100 + n, iters, False), (n, 200 + n, iters, False), (n, 300 + n, iters, True)]
    res = []
    with Pool(2) as pool:
        for r in pool.imap_unordered(recocido, trabajos):
            res.append(r)
            print(f"n={r['n']:2d} sim={r['sim']!s:5s} seed={r['seed']} lam={r['lam']:.3f} pen={r['pen']:.3f} t={r['t']:.0f}s", flush=True)
            json.dump(res, open(salida, "w"))
