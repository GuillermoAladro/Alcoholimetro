"""Búsqueda n = 18 con trasera de 3 mm: fase 1 (2 libres + 1 simétrico, 2000 it.), se añade el P18-O de 2 mm proyectado
a las zonas nuevas como candidato, y fase 2 (4 recocidos de 4000 it.)."""
import json, subprocess, sys
from nucleo import proyectar
import optimizar as O
subprocess.run([sys.executable, "optimizar.py", "resultados_opt.json", "2000", "18", "18"], check=True)
R = json.load(open("resultados_opt.json"))
import os
RUTA_2MM = os.environ.get("PATRONES_2MM", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "historico-2mm", "resultados", "patrones.json"))
P = json.load(open(RUTA_2MM))["Óptimo P18-O"]          # óptimo del estudio de 2 mm, como candidato
pp = [list(proyectar(*q)) for q in P]
R.append(dict(n=18, seed=0, sim=False, J=O.objetivo(pp)[0], lam=O.lam_patron(pp), pen=O.penal(pp), pts=pp, hist=[], t=0, origen="P18-O 2 mm proyectado"))
json.dump(R, open("resultados_opt.json", "w"))
print("P18-O proyectado", R[-1]["lam"], R[-1]["pen"], flush=True)
subprocess.run([sys.executable, "intensificar.py", "resultados_opt.json", "18", "4000", "intens18.json"], check=True)
