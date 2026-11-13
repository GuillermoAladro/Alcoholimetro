"""
seleccionar.py — reúne las dos fases de búsqueda, elige el patrón ganador de 18 tornillos y prepara los patrones a analizar.
Uso: python seleccionar.py resultados_opt.json intens18.json patrones.json opt_todo.json
"""
import json
import sys

import numpy as np

from nucleo import en_zona, FEMRapido, ModeloFEM
from evaluacion import REFERENCIAS, casos_diseno, evaluar, espaciado_min, S_MIN

O1 = json.load(open(sys.argv[1]))
O2 = json.load(open(sys.argv[2]))
todo = O1 + O2
json.dump(todo, open(sys.argv[4], "w"))


def redondear(pts):
    out = []
    for x, z in pts:
        cands = []
        for fx in (np.floor, np.ceil):
            for fz in (np.floor, np.ceil):
                cands.append((float(fx(x * 2) / 2), float(fz(z * 2) / 2)))
        cands.sort(key=lambda p: (p[0] - x) ** 2 + (p[1] - z) ** 2)
        ok = [p for p in cands if en_zona(*p)]
        out.append(ok[0] if ok else (round(x, 1), round(z, 1)))
    return out


cs = casos_diseno()
fino = [ModeloFEM(h=10.0, arandela=True, empotrado=False), ModeloFEM(h=10.0, arandela=True, empotrado=True)]
rap = [FEMRapido(h=20.0, empotrado=False), FEMRapido(h=20.0, empotrado=True)]


def lam_fino(p):
    return min(evaluar(p, m, cs)["lam"] for m in fino)


def lam_rap(p):
    return min(evaluar(p, m, cs)["lam"] for m in rap)


cand18 = sorted([r for r in todo if r["n"] == 18 and r["pen"] == 0], key=lambda r: -r["lam"])
mejor_libre = [r for r in cand18 if not r["sim"]][:2]
mejor_sim = [r for r in cand18 if r["sim"]][:2]
evals = []
for r in mejor_libre + mejor_sim:
    p = redondear(r["pts"])
    if r["sim"]:   # mantener la simetría exacta tras redondear
        p = [(np.sign(x) * abs(x), z) for x, z in p]
    evals.append(dict(sim=r["sim"], lam_busqueda=r["lam"], pts=p, lam_fino=lam_fino(p), lam_rap=lam_rap(p),
                      smin=espaciado_min(p), fuera=[q for q in p if not en_zona(*q)]))
    print(f"sim={r['sim']} lam_busq={r['lam']:.3f} -> redondeado: rap={evals[-1]['lam_rap']:.3f} fino={evals[-1]['lam_fino']:.3f} "
          f"smin={evals[-1]['smin']:.1f} fuera={evals[-1]['fuera']}")
libre = max([e for e in evals if not e["sim"]], key=lambda e: e["lam_fino"])
sim = max([e for e in evals if e["sim"]], key=lambda e: e["lam_fino"])
gan = sim if sim["lam_fino"] >= 0.95 * libre["lam_fino"] else libre
print("ganador:", "simétrico" if gan["sim"] else "libre", gan["lam_fino"])
pats = {k: f() for k, f in REFERENCIAS.items()}
pats = {"C (GitHub actual)": pats["C (GitHub actual)"], "A (algebraico anterior)": pats["A (algebraico anterior)"],
        "B (P18 anterior)": pats["B (P18 anterior)"], "Óptimo P18-O": gan["pts"]}
json.dump(pats, open(sys.argv[3], "w"))
json.dump(dict(evals=evals, ganador=gan, lam_rap_ref={k: lam_rap(v) for k, v in pats.items()},
               alternativa=(libre if gan is sim else sim)), open("seleccion.json", "w"))
