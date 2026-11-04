"""variantes.py — análisis reducido de la alternativa simétrica y de la variante para mampostería (s >= 100 mm).
Uso: python variantes.py seleccion.json mamposteria.json variantes.json"""
import json
import sys

import numpy as np

import analisis as AN
from nucleo import FEMRapido, en_zona
from evaluacion import casos_diseno, evaluar, espaciado_min
from seleccionar_util import redondear

S = json.load(open(sys.argv[1]))
M = json.load(open(sys.argv[2]))
cs = casos_diseno()
out = {}
variantes = {"Simétrica (alternativa)": S["alternativa"]["pts"]}
for n in sorted(set(r["n"] for r in M)):
    rs = [r for r in M if r["n"] == n and r["pen"] == 0]
    if rs:
        b = max(rs, key=lambda r: r["lam"])
        variantes[f"Mampostería n={n} (s ≥ 100)"] = redondear(b["pts"])
mods = AN.modelos_fino(h=10.0)
mrap = [FEMRapido(h=20.0, empotrado=False), FEMRapido(h=20.0, empotrado=True)]
for nom, pts in variantes.items():
    env = AN.envolvente(pts, cs, mods)
    adm = {}
    for pared in ("Hormigón ≥ C20/25", "Ladrillo macizo ≥ Mz 12", "Ladrillo perforado vertical ≥ HLz 12",
                  "Bloque hueco de hormigón ligero (enlucido)"):
        adm[pared] = min(AN.F_adm_fijo(pts, m, lambda F: AN.tirón_normal(F, "TR"), AN.PAREDES[pared]) for m in
                         [FEMRapido(h=10.0, empotrado=False), FEMRapido(h=10.0, empotrado=True)])
    jun = AN.montecarlo_juntas(pts, mrap[0], cs, nmc=120)
    out[nom] = dict(pts=pts, n=len(pts), smin=espaciado_min(pts), lam=env["lam"], gob=env["gob"], admisibles=adm, juntas=jun,
                    fuera=[p for p in pts if not en_zona(*p)])
    print(nom, len(pts), round(env["lam"], 3), env["gob"], flush=True)
json.dump(AN.a_json(out), open(sys.argv[3], "w"), ensure_ascii=False)
