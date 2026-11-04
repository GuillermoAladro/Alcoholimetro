"""juntas_ajuste.py — mampostería: capacidad cuando el instalador ajusta la altura de montaje (dentro de una hilada)
para que el máximo de tacos caiga en ladrillo y no en junta. Uso: python juntas_ajuste.py salida.json"""
import json, sys
import numpy as np
import analisis as AN
from nucleo import FEMRapido
from evaluacion import casos_diseno, evaluar

pats = json.load(open("patrones.json"))
V = json.load(open("variantes.json"))
for nom_v, v in V.items():          # la alternativa libre y las variantes de mampostería que hayan salido sin penalización
    pats[nom_v] = v["pts"]
cs = casos_diseno()
m = FEMRapido(h=20.0, empotrado=False)
rng = np.random.default_rng(3)
ox_s = rng.uniform(0, 250, 40)
out = {}
for nom, pts in pats.items():
    base = evaluar(pts, m, cs, f_rec=1.0)["lam"]
    out[nom] = {"_base": base}
    for fmt_n, fmt in AN.FORMATOS.items():
        paso = fmt["Hh"] + fmt["j"]
        lam_aj, lam_az = [], []
        for ox in ox_s:
            mejores = []
            for oz in np.arange(0, paso, 10.0):
                ej, _ = AN.juntas(pts, fmt, ox * (fmt["L"] + fmt["j"]) / 250, oz)
                act = ~ej
                mejores.append(evaluar(pts, m, cs, f_rec=1.0, activos=act)["lam"] if act.sum() >= 3 else 0.0)
            lam_aj.append(max(mejores)); lam_az.append(mejores[0])
        out[nom][fmt_n] = dict(ajuste_med=float(np.median(lam_aj)), ajuste_p05=float(np.percentile(lam_aj, 5)),
                               sin_ajuste_med=float(np.median(lam_az)), sin_ajuste_p05=float(np.percentile(lam_az, 5)))
    print(nom, {k: (round(v["ajuste_p05"] * 1500, 2), round(v["sin_ajuste_p05"] * 1500, 2)) for k, v in out[nom].items() if k != "_base"}, flush=True)
json.dump(out, open(sys.argv[1], "w"), ensure_ascii=False)
