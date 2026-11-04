"""barrido_b.py — barrido para n = 6…16 con 1200 iteraciones (1 arranque libre + 1 simétrico por n).
Uso: python barrido_b.py salida.json"""
import json, sys
from multiprocessing import Pool
import optimizar as O
if __name__ == "__main__":
    trabajos = [(16, 316, 1200, True)]
    for n in range(15, 5, -1):
        trabajos += [(n, 100 + n, 1200, False), (n, 300 + n, 1200, True)]
    out = []
    with Pool(2) as pool:
        for r in pool.imap_unordered(O.recocido, trabajos):
            out.append(r)
            print(f"n={r['n']:2d} sim={r['sim']!s:5s} lam={r['lam']:.3f} pen={r['pen']:.3f} t={r['t']:.0f}s", flush=True)
            json.dump(out, open(sys.argv[1], "w"))
