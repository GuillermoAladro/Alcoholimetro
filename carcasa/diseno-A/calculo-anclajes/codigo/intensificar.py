"""
intensificar.py — segunda fase para un n dado: recocido a temperatura baja partiendo de las mejores soluciones de la
primera fase (libres y simétricas) + arranques aleatorios nuevos con más iteraciones.
Uso: python intensificar.py resultados_opt.json n iteraciones salida.json
"""
import json
import math
import sys
import time
from multiprocessing import Pool

import numpy as np

import optimizar as O
from nucleo import en_zona


def recocido_desde(args):
    n, seed, iters, sim, est0, T0 = args
    rng = np.random.default_rng(seed)
    est = est0 if est0 is not None else O.inicial(n, rng, sim)
    J, lam = O.objetivo(O.expandir(est, sim))
    best = (J, lam, est)
    T1 = 0.003
    t0 = time.time()
    for k in range(iters):
        f = k / iters
        T = T0 * (T1 / T0) ** f
        sigma = (20.0 if est0 is not None else 45.0) * ((1.0 / (20.0 if est0 is not None else 45.0)) ** f)
        cand = O.mover(est, rng, sigma, sim)
        Jc, lamc = O.objetivo(O.expandir(cand, sim))
        if Jc >= J or rng.random() < math.exp((Jc - J) / T):
            est, J, lam = cand, Jc, lamc
            if J > best[0]:
                best = (J, lam, est)
    pts = O.expandir(best[2], sim)
    return dict(n=n, seed=seed, sim=sim, J=best[0], lam=O.lam_patron(pts), pen=O.penal(pts),
                pts=[list(map(float, p)) for p in pts], t=time.time() - t0, fase=2,
                origen="refinado" if est0 is not None else "nuevo")


def a_estado(pts, sim):
    if not sim:
        return [tuple(p) for p in pts]
    pares = [tuple(p) for p in pts if p[0] > 1e-6]
    ejes = [p[1] for p in pts if abs(p[0]) <= 1e-6]
    return (pares, ejes)


if __name__ == "__main__":
    R = json.load(open(sys.argv[1]))
    n, iters, salida = int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
    libres = sorted([r for r in R if r["n"] == n and not r["sim"]], key=lambda r: -r["lam"])
    sims = sorted([r for r in R if r["n"] == n and r["sim"]], key=lambda r: -r["lam"])
    trabajos = [(n, 900 + n, iters, False, a_estado(libres[0]["pts"], False), 0.15),
                (n, 901 + n, iters, True, a_estado(sims[0]["pts"], True), 0.15),
                (n, 902 + n, iters, False, None, 0.6),
                (n, 903 + n, iters, True, None, 0.6)]
    out = []
    with Pool(2) as pool:
        for r in pool.imap_unordered(recocido_desde, trabajos):
            out.append(r)
            print(f"n={n} sim={r['sim']} origen={r['origen']} lam={r['lam']:.3f} t={r['t']:.0f}s", flush=True)
            json.dump(out, open(salida, "w"))
