"""mamposteria.py — variante para mampostería: separación mínima 100 mm (menos tacos por pieza).
Uso: S_MIN=100 python mamposteria.py salida.json"""
import json, sys
from multiprocessing import Pool
import optimizar as O
if __name__ == "__main__":
    trabajos = [(12, 512, 2500, True), (12, 612, 2500, False), (14, 514, 2500, True), (14, 614, 2500, False)]
    out = []
    with Pool(2) as pool:
        for r in pool.imap_unordered(O.recocido, trabajos):
            out.append(r); print(r["n"], r["sim"], round(r["lam"], 3), r["pen"], flush=True)
            json.dump(out, open(sys.argv[1], "w"))
