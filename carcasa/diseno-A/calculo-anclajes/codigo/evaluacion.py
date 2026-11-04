"""
evaluacion.py — casos de carga, métricas por patrón y patrones de referencia.
Todas las fuerzas en N, longitudes en mm, momentos en N·mm (los informes convierten a N·m).
"""
import math
import numpy as np
from nucleo import (G_ACC, W, HW, H_TOT, D_FONDO, ModeloFEM, ModeloRigido, FEMRapido, cortante, generalizadas, en_zona)

# ----------------------------------------------------------------------------- datos de fabricante (fischer)
# Carga recomendada por taco SX Plus 8x65 con tornillo de madera Ø6, incluye coeficientes de seguridad,
# válida para tracción, cortante y combinada (tabla de cargas fischer SX Plus; ficha técnica 16/05/2023).
F_REC = {
    "Hormigón ≥ C20/25": 1500.0,
    "Ladrillo macizo ≥ Mz 12": 800.0,
    "Silicocalcáreo macizo ≥ KS 12": 1500.0,
    "Silicocalcáreo perforado ≥ KSL 12": 800.0,
    "Ladrillo perforado vertical ≥ HLz 12": 400.0,
    "Bloque hueco de hormigón ligero (enlucido)": 300.0,
    "Hormigón celular ≥ AAC 4": 400.0,
    "Hormigón celular ≥ AAC 2": 150.0,
    "Ladrillo hueco horizontal (Forato F8)": None,     # sin valor para 8x65 en la tabla
    "Placa de yeso (pladur)": None,                    # SX Plus sin valor de carga en placa
}
C_MIN_HORMIGON = 50.0      # distancia mínima al borde en hormigón (fischer)
import os
S_MIN = float(os.environ.get("S_MIN", "50"))               # distancia mínima entre tacos: NO publicada por fischer -> hipótesis = c_min

# ----------------------------------------------------------------------------- masa y centro de gravedad
M_ACERO = 12.521           # suma de masas de las piezas de chapa con 3 / 1,5 mm (modelo CadQuery, 04-11-2026), kg
M_PC = 0.570               # policarbonatos (modelo CadQuery), kg
M_ESTIMADA = 15.5          # con electrónica, herrajes, pintura y consumibles (estimación, ver informe)
M_DISENO = 18.0            # masa de cálculo con margen (+16 %, como con 2 mm)
CG = (0.0, 55.0, 210.0)    # (x, n, z) estimado; chapa sola a 47 mm de la pared, con la electrónica de delante ≈ 50 -> 55 de cálculo

ESQ = dict(TL=(-W / 2, H_TOT), TR=(W / 2, H_TOT), C=(0.0, H_TOT / 2), B=(0.0, 0.0))


def peso(m=M_DISENO):
    return [(CG[0], CG[1], CG[2], 0.0, 0.0, -m * G_ACC)]


def caso(nombre, fuerzas):
    Q, plano = generalizadas(fuerzas)
    return dict(nombre=nombre, fuerzas=fuerzas, Q=Q, plano=plano)


def casos_diseno(F=500.0, m_cuelgue=80.0, dlf=2.0, simetrico=False):
    """Envolvente usada para optimizar: todos incluyen el peso propio (15 kg)."""
    cs = []
    for k in ("TL", "TR", "C", "B"):
        if simetrico and k == "TR":
            continue
        x, z = ESQ[k]
        cs.append(caso(f"Tirón normal {F:.0f} N {k}", peso() + [(x, D_FONDO, z, 0.0, F, 0.0)]))
    for sg, k in ((-1, "TL"), (1, "TR")):
        if simetrico and k == "TR":
            continue
        x, z = ESQ[k]
        c = F / math.sqrt(2)
        cs.append(caso(f"Tirón oblicuo 45° {F:.0f} N {k}", peso() + [(x, D_FONDO, z, sg * c, c, 0.0)]))
    for sg in ((1,) if simetrico else (1, -1)):
        cs.append(caso(f"Tirón lateral {F:.0f} N arriba {'→' if sg > 0 else '←'}",
                       peso() + [(0.0, D_FONDO, H_TOT, sg * F, 0.0, 0.0)]))
    cs.append(caso(f"Cuelgue {m_cuelgue:.0f} kg ×{dlf:g} en el borde delantero",
                   peso() + [(0.0, D_FONDO, H_TOT, 0.0, 0.0, -m_cuelgue * G_ACC * dlf)]))
    return cs


def evaluar(pts, modelo, casos, f_rec=1500.0, activos=None, guardar=False):
    """Devuelve, por caso: tracción N, cortante V, resultante, factor de carga lambda = f_rec / max resultante."""
    pts = np.asarray(pts, float)
    modelo.preparar(pts)
    out = []
    for c in casos:
        r = modelo.resolver(c["Q"], activos=activos, **({"clave": c["nombre"]} if isinstance(modelo, (ModeloFEM, FEMRapido)) else {}))
        Fx, Fz, Mn = c["plano"]
        V = cortante(pts, Fx, Fz, Mn, (0.0, 0.0), activos=activos)
        Fres = np.sqrt(r["N"] ** 2 + (V ** 2).sum(1))
        if activos is not None:
            Fres = np.where(np.asarray(activos, bool), Fres, 0.0)
        lam = f_rec / max(Fres.max(), 1e-9)
        d = dict(caso=c["nombre"], N=r["N"], V=V, F=Fres, lam=lam, sep=r["sep_max"], it=r["it"],
                 Nmax=float(r["N"].max()), Vmax=float(np.sqrt((V ** 2).sum(1)).max()), Fmax=float(Fres.max()))
        if guardar:
            d["res"] = r
        out.append(d)
    lam = min(o["lam"] for o in out)
    gob = min(out, key=lambda o: o["lam"])
    return dict(lam=lam, gob=gob["caso"], casos=out)


def espaciado_min(pts):
    p = np.asarray(pts, float)
    d = np.sqrt(((p[:, None, :] - p[None, :, :]) ** 2).sum(-1))
    d[np.diag_indices(len(p))] = 1e9
    return float(d.min())


# ----------------------------------------------------------------------------- patrones de referencia
def patron_C():
    return [(x, z) for z in (25, 75, 125, 205, 295, 391.5) for x in (-85, 0, 85)]


def patron_A():
    p = [(x, z) for z in (25, 100, 345, 391.5) for x in (-85, -30, 30, 85)]
    return p + [(-85, 290), (85, 290)]


def patron_B():
    p = [(x, z) for z in (25, 100, 335, 391.5) for x in (-85, -30, 30, 85)]
    return p + [(-85, 215), (85, 215)]


REFERENCIAS = {"C (3 × 6, anterior)": patron_C, "A (algebraico anterior)": patron_A, "B (P18 anterior)": patron_B}


def comprobar_geometria(pts):
    fuera = [p for p in pts if not en_zona(*p)]
    return dict(fuera=fuera, s_min=espaciado_min(pts))
