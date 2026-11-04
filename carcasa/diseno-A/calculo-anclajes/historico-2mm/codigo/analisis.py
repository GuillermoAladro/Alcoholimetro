"""
analisis.py — verificación y comparación de patrones (A, B, C y ganador): convergencia de malla, sensibilidad,
escenarios de carga, pérdidas de anclajes, tipos de pared, juntas de mampostería, golpes y fallo progresivo.
Uso: python analisis.py resultados_opt.json resultados_analisis.json
"""
import json
import math
import sys
import time

import numpy as np

from nucleo import (ModeloFEM, ModeloRigido, FEMRapido, G_ACC, W, HW, H_TOT, D_FONDO, T, R_ARANDELA,
                    cortante, generalizadas, en_zona)
from evaluacion import (F_REC, CG, M_DISENO, ESQ, peso, caso, casos_diseno, evaluar, espaciado_min,
                        REFERENCIAS, comprobar_geometria, S_MIN)

FREC_H = F_REC["Hormigón ≥ C20/25"]
PAREDES = {k: v for k, v in F_REC.items() if v is not None}


def modelos_fino(h=10.0, ka=2000.0, kw=50.0):
    return [ModeloFEM(h=h, ka=ka, kw=kw, arandela=True, empotrado=False),
            ModeloFEM(h=h, ka=ka, kw=kw, arandela=True, empotrado=True)]


def envolvente(pts, casos, modelos, activos=None, guardar=False):
    """Para cada caso, el peor de los modelos de borde (apoyado / empotrado)."""
    rs = [evaluar(pts, m, casos, f_rec=FREC_H, activos=activos, guardar=guardar) for m in modelos]
    out = []
    for i in range(len(casos)):
        cands = [r["casos"][i] for r in rs]
        ib = int(np.argmax([c["Fmax"] for c in cands]))
        peor = dict(cands[ib])
        peor["borde"] = "apoyado" if ib == 0 else "empotrado"
        peor["Fmax_modelos"] = [c["Fmax"] for c in cands]
        out.append(peor)
    lam = min(o["lam"] for o in out)
    return dict(lam=lam, gob=min(out, key=lambda o: o["lam"])["caso"], casos=out)


# ----------------------------------------------------------------------------- modelo "clásico" de libro
def clasico(pts, F, xp, zp):
    """Tirón normal F en (xp, zp). Variante 1: centroide de anclajes sin contacto (fórmula de Navier biaxial).
    Variante 2: pivote en el canto inferior (z = 0) + pivote en el canto lateral opuesto, superpuestos."""
    p = np.asarray(pts, float)
    x, z = p[:, 0], p[:, 1]
    n = len(p)
    x0, z0 = x.mean(), z.mean()
    N1 = F / n + F * (zp - z0) * (z - z0) / ((z - z0) ** 2).sum() + F * (xp - x0) * (x - x0) / ((x - x0) ** 2).sum()
    xpiv = W / 2 if xp < 0 else -W / 2
    dz = z
    dx = np.abs(x - xpiv)
    N2 = F * zp * dz / (dz ** 2).sum()
    N3 = F * abs(xp - xpiv) * dx / (dx ** 2).sum()
    # variante 3: pivote en la esquina inferior opuesta, giro alrededor de la diagonal (distancia a la recta de pivote)
    return dict(navier=float(N1.max()), pivote_inf=float(N2.max()), pivote_inf_mas_lateral=float((N2 + N3).max()),
                pivote_lateral=float(N3.max()))


# ----------------------------------------------------------------------------- utilidades
def F_adm_fijo(pts, modelo, construir, f_rec, Fmax_busqueda=20000.0):
    """Mayor valor de la acción variable F (con el peso propio fijo) tal que max |F_i| <= f_rec. Bisección."""
    modelo.preparar(pts)

    def fmax(F):
        c = construir(F)
        r = modelo.resolver(c["Q"], clave=c["nombre"][:20]) if isinstance(modelo, (ModeloFEM, FEMRapido)) else modelo.resolver(c["Q"])
        Fx, Fz, Mn = c["plano"]
        V = cortante(pts, Fx, Fz, Mn, (0, 0))
        return float(np.sqrt(r["N"] ** 2 + (V ** 2).sum(1)).max())

    if fmax(0.0) > f_rec:
        return 0.0
    lo, hi = 0.0, Fmax_busqueda
    if fmax(hi) <= f_rec:
        return hi
    for _ in range(30):
        mid = (lo + hi) / 2
        if fmax(mid) <= f_rec:
            lo = mid
        else:
            hi = mid
    return lo


def tirón_normal(F, k):
    x, z = ESQ[k]
    return caso(f"Tirón normal {k}", peso() + [(x, D_FONDO, z, 0.0, F, 0.0)])


def tirón_oblicuo(F, k):
    x, z = ESQ[k]
    sg = -1 if k == "TL" else 1
    c = F / math.sqrt(2)
    return caso(f"Tirón oblicuo {k}", peso() + [(x, D_FONDO, z, sg * c, c, 0.0)])


def tirón_lateral(F, sg=1):
    return caso(f"Tirón lateral {sg}", peso() + [(0.0, D_FONDO, H_TOT, sg * F, 0.0, 0.0)])


def cuelgue(m, dlf=1.0):
    return caso(f"Cuelgue {m}x{dlf}", peso() + [(0.0, D_FONDO, H_TOT, 0.0, 0.0, -m * G_ACC * dlf)])


def vertical_cg(m):
    return caso(f"Vertical {m} kg en el CdG", [(CG[0], CG[1], CG[2], 0.0, 0.0, -m * G_ACC)])


def vertical_frente(m):
    return caso(f"Vertical {m} kg en el borde delantero", peso() + [(0.0, D_FONDO, H_TOT, 0.0, 0.0, -m * G_ACC)])


def apoyo_persona():
    # persona apoyada: 300 N hacia abajo en el borde delantero superior + 300 N empujando contra la pared arriba
    return caso("Persona apoyada", peso() + [(0.0, D_FONDO, H_TOT, 0.0, -300.0, -300.0)])


def golpe_frontal(F=2000.0, k="C"):
    x, z = ESQ[k] if k != "C" else (0.0, 300.0)
    return caso(f"Golpe frontal {k}", peso() + [(x, D_FONDO, z, 0.0, -F, 0.0)])


# ----------------------------------------------------------------------------- fallo progresivo
def cremallera(pts, modelo, c, max_pasos=None):
    """Cada paso: el anclaje más cargado alcanza su capacidad (igual para todos) y se elimina. Devuelve la secuencia
    de multiplicadores lambda_k (relativos a la capacidad unitaria) -> colapso = max_k lambda_k."""
    pts = np.asarray(pts, float)
    act = np.ones(len(pts), bool)
    seq, orden = [], []
    modelo.preparar(pts)
    for paso in range(len(pts) - 3 if max_pasos is None else max_pasos):
        r = modelo.resolver(c["Q"], activos=act)
        Fx, Fz, Mn = c["plano"]
        V = cortante(pts, Fx, Fz, Mn, (0, 0), activos=act)
        F = np.where(act, np.sqrt(r["N"] ** 2 + (V ** 2).sum(1)), 0.0)
        i = int(np.argmax(F))
        seq.append(1.0 / F[i])
        orden.append(i)
        act[i] = False
    return seq, orden


# ----------------------------------------------------------------------------- juntas de mampostería
FORMATOS = {
    "Ladrillo macizo/perforado 24x11,5x5": dict(L=240, Hh=50, j=10),
    "Ladrillo perforado 24x11,5x7": dict(L=240, Hh=70, j=10),
    "Ladrillo hueco doble 24x11,5x8": dict(L=240, Hh=80, j=10),
    "Bloque de hormigón 40x20x20": dict(L=400, Hh=200, j=10),
}


def juntas(pts, fmt, ox, oz, holgura=4.0):
    """Para un aparejo a soga con desplazamientos (ox, oz): qué anclajes caen en junta (borde del taladro Ø8 dentro
    de la junta de 10 mm) y cuántos comparten pieza."""
    L, Hh, j = fmt["L"], fmt["Hh"], fmt["j"]
    paso_z, paso_x = Hh + j, L + j
    res_j, piezas = [], []
    for x, z in pts:
        zz = z + oz
        fila = math.floor(zz / paso_z)
        dz = zz - fila * paso_z                     # 0..paso_z ; junta horizontal en [Hh, Hh + j]
        en_j = (dz > Hh - holgura) or (dz < holgura)
        xx = x + ox + (fila % 2) * paso_x / 2       # aparejo a soga: media pieza de desfase
        col = math.floor(xx / paso_x)
        dx = xx - col * paso_x
        en_j = en_j or (dx > L - holgura) or (dx < holgura)
        res_j.append(en_j)
        piezas.append((fila, col))
    from collections import Counter
    cnt = Counter(p for p, e in zip(piezas, res_j) if not e)
    return np.array(res_j), (max(cnt.values()) if cnt else 0)


def montecarlo_juntas(pts, modelo, casos, nmc=150, seed=1):
    rng = np.random.default_rng(seed)
    out = {"_base": evaluar(pts, modelo, casos, f_rec=1.0)["lam"]}
    for nombre, fmt in FORMATOS.items():
        lam, njun, maxpz = [], [], []
        for _ in range(nmc):
            ox, oz = rng.uniform(0, fmt["L"] + fmt["j"]), rng.uniform(0, fmt["Hh"] + fmt["j"])
            ej, mp = juntas(pts, fmt, ox, oz)
            act = ~ej
            njun.append(int(ej.sum())); maxpz.append(mp)
            if act.sum() >= 3:
                lam.append(evaluar(pts, modelo, casos, f_rec=1.0, activos=act)["lam"])
            else:
                lam.append(0.0)
        lam = np.array(lam)
        out[nombre] = dict(media_en_junta=float(np.mean(njun)), p_alguno=float(np.mean(np.array(njun) > 0)),
                           max_en_junta=int(np.max(njun)), max_por_pieza=int(np.max(maxpz)),
                           media_por_pieza=float(np.mean(maxpz)), lam_med=float(np.median(lam)),
                           lam_p05=float(np.percentile(lam, 5)))
    return out


# ----------------------------------------------------------------------------- golpe (método energético)
def golpe_lateral(pts, modelo, E=30000.0, kv=1000.0, k="TL", k_cuerpo=50.0):
    """Golpe lateral en la esquina superior delantera. Energía E (N·mm) absorbida elásticamente por el anclaje:
    F_eq = sqrt(2 E k_eff), con 1/k_eff = cortante (n·kv) + torsión en el plano + vuelco (del FEM)."""
    x, z = ESQ[k]
    sg = 1 if k == "TL" else -1          # golpe hacia el centro de la máquina
    pts = np.asarray(pts, float)
    c = caso("golpe unidad", [(x, D_FONDO, z, sg * 1.0, 0.0, 0.0)])
    modelo.preparar(pts)
    r = modelo.resolver(c["Q"])
    # desplazamiento lateral del punto de impacto debido al giro alrededor del eje vertical (c = omega_z): u_x = -c n
    ub = r["u"][modelo.ib:modelo.ib + 3]
    d_rock = abs(-ub[2] * D_FONDO)
    n = len(pts)
    x0, z0 = pts[:, 0].mean(), pts[:, 1].mean()
    J = ((pts[:, 0] - x0) ** 2 + (pts[:, 1] - z0) ** 2).sum()
    d_cort = 1.0 / (n * kv) + (z - z0) ** 2 / (kv * J)
    keff_rig = 1.0 / (d_rock + d_cort)                  # impactador rígido (cota superior)
    keff = 1.0 / (d_rock + d_cort + 1.0 / k_cuerpo)     # en serie con la rigidez del cuerpo que golpea (hipótesis)
    Feq = math.sqrt(2 * E * keff)
    Feq_rig = math.sqrt(2 * E * keff_rig)
    cF = caso("golpe", peso() + [(x, D_FONDO, z, sg * Feq, 0.0, 0.0)])
    rr = evaluar(pts, modelo, [cF], f_rec=FREC_H)
    return dict(E_J=E / 1000, keff=keff, keff_rig=keff_rig, Feq_rig=Feq_rig, k_cuerpo=k_cuerpo, d_rock=d_rock, d_cort=d_cort,
                Feq=Feq, Fmax=rr["casos"][0]["Fmax"],
                Nmax=rr["casos"][0]["Nmax"])


# ----------------------------------------------------------------------------- tensiones en la chapa
def tension_chapa(modelo, u, pts):
    """Tensión de flexión máxima (von Mises de las tensiones de cara, 6M/t^2) en puntos de la malla y en el borde
    de cada arandela."""
    smax, donde = 0.0, None
    xs, zs = modelo.xs, modelo.zs
    cand = []
    for j in range(len(zs) - 1):
        for i in range(len(xs) - 1):
            cand.append(((xs[i] + xs[i + 1]) / 2, (zs[j] + zs[j + 1]) / 2))
    for xa, za in pts:
        for t in np.linspace(0, 2 * math.pi, 16, endpoint=False):
            px, pz = xa + (R_ARANDELA + 0.5) * math.cos(t), za + (R_ARANDELA + 0.5) * math.sin(t)
            if -W / 2 <= px <= W / 2 and 0 <= pz <= HW:
                cand.append((px, pz))
    for px, pz in cand:
        M = modelo.momentos(u, px, pz)
        sx, sz, txz = 6 * M / T ** 2
        vm = math.sqrt(sx ** 2 - sx * sz + sz ** 2 + 3 * txz ** 2)
        if vm > smax:
            smax, donde = vm, (px, pz)
    return smax, donde


# ----------------------------------------------------------------------------- análisis completo de un patrón
def analizar(nombre, pts, rapido=None):
    t0 = time.time()
    pts = [tuple(map(float, p)) for p in pts]
    P = np.asarray(pts)
    res = dict(nombre=nombre, pts=pts, n=len(pts), geometria=comprobar_geometria(pts))
    mods = modelos_fino(h=10.0)
    cs = casos_diseno()
    env = envolvente(pts, cs, mods, guardar=True)
    res["envolvente"] = [dict(caso=o["caso"], Nmax=o["Nmax"], Vmax=o["Vmax"], Fmax=o["Fmax"], lam=o["lam"], borde=o["borde"],
                              sep=o["sep"], N=o["N"].tolist(), V=o["V"].tolist(), Fmax_modelos=o["Fmax_modelos"])
                         for o in env["casos"]]
    res["lam"], res["gob"] = env["lam"], env["gob"]
    gob = min(env["casos"], key=lambda o: o["lam"])
    # tensiones y separación a la carga admisible del caso gobernante (escalado homogéneo)
    rgob = gob["res"]
    m_gob = mods[0] if gob["borde"] == "apoyado" else mods[1]
    m_gob.preparar(pts)
    cgob = [c for c in cs if c["nombre"] == gob["caso"]][0]
    rr = m_gob.resolver(cgob["Q"])
    s, donde = tension_chapa(m_gob, rr["u"], pts)
    # tirón de referencia (500 N esquina dcha.): tensión en la chapa -> tirón con la primera fluencia local
    cTR = [c for c in cs if c["nombre"] == "Tirón normal 500 N TR"][0]
    sTR = 0.0
    for m_ in mods:
        m_.preparar(pts)
        r_ = m_.resolver(cTR["Q"])
        sTR = max(sTR, tension_chapa(m_, r_["u"], pts)[0])
    res["chapa_TR"] = dict(sigma_500=sTR, F_fluencia_140=500.0 * 140.0 / sTR, F_fluencia_280=500.0 * 280.0 / sTR)
    res["chapa"] = dict(sigma_ref=s, donde=donde, sigma_adm=s * env["lam"], sep_adm=rr["sep_max"] * env["lam"],
                        sep_ref=rr["sep_max"], p_contacto_max_adm=float(m_gob.kw * max(-rr["w"].min(), 0)) * env["lam"],
                        contacto_total_ref=float(rr["contacto"].sum()), N_total_ref=float(rr["N"].sum()))
    # modelo rígido (analítico) y clásico
    rig = evaluar(pts, ModeloRigido(), cs, f_rec=FREC_H)
    res["rigido"] = [dict(caso=o["caso"], Fmax=o["Fmax"], lam=o["lam"]) for o in rig["casos"]]
    res["rigido_lam"] = rig["lam"]
    res["clasico_300_TL"] = clasico(pts, 300.0, *ESQ["TL"])
    res["clasico_300_TR"] = clasico(pts, 300.0, *ESQ["TR"])
    # tirón de 300 N en esquina con los tres modelos (sin peso propio, para comparar con los preliminares)
    c300 = {k: caso(f"300 {k}", [(ESQ[k][0], D_FONDO, ESQ[k][1], 0, 300.0, 0)]) for k in ("TL", "TR")}
    res["tiron300"] = {}
    for k, c in c300.items():
        fe = envolvente(pts, [c], mods)["casos"][0]
        rg = evaluar(pts, ModeloRigido(), [c], f_rec=FREC_H)["casos"][0]
        res["tiron300"][k] = dict(FEM=fe["Nmax"], FEM_modelos=fe["Fmax_modelos"], rigido=rg["Nmax"],
                                  clasico=res[f"clasico_300_{k}"])
    # convergencia de malla (caso gobernante, borde apoyado y empotrado)
    conv = []
    for h in (20.0, 10.0, 5.0, 2.5):
        fila = dict(h=h)
        for emp in (False, True):
            m = ModeloFEM(h=h, arandela=True, empotrado=emp)
            r = evaluar(pts, m, [cgob], f_rec=FREC_H)["casos"][0]
            fila["empotrado" if emp else "apoyado"] = r["Fmax"]
        fila["ndof"] = m.ndof_t
        conv.append(fila)
    res["convergencia"] = conv
    # sensibilidad (caso gobernante, malla 10 mm)
    sens = []
    for etiqueta, kw_ in (("ka = 500 N/mm", dict(ka=500.0)), ("ka = 2000 N/mm (base)", dict(ka=2000.0)),
                          ("ka = 10000 N/mm", dict(ka=10000.0)), ("kw = 5 N/mm³", dict(kw=5.0)),
                          ("kw = 500 N/mm³", dict(kw=500.0))):
        ms = modelos_fino(h=10.0, **kw_)
        e = envolvente(pts, cs, ms)
        sens.append(dict(variante=etiqueta, lam=e["lam"], gob=e["gob"]))
    for ng in (45.0, 65.0):
        cs2 = [caso(c["nombre"], [(f[0], ng if (f[1] == CG[1] and f[5] < 0 and f[2] == CG[2]) else f[1], *f[2:]) for f in c["fuerzas"]])
               for c in cs]
        e = envolvente(pts, cs2, mods)
        sens.append(dict(variante=f"CdG a {ng:.0f} mm de la pared", lam=e["lam"], gob=e["gob"]))
    res["sensibilidad"] = sens
    # escenarios de carga
    esc = {}
    esc["vertical_cg"] = [(m_, envolvente(pts, [vertical_cg(m_)], mods)["casos"][0]) for m_ in (15, 25, 40, 60, 80, 100)]
    esc["vertical_frente"] = [(m_, envolvente(pts, [vertical_frente(m_)], mods)["casos"][0]) for m_ in (15, 25, 40, 60, 80, 100)]
    for k in ("TL", "TR", "C", "B"):
        esc[f"normal_{k}"] = [(F, envolvente(pts, [tirón_normal(F, k)], mods)["casos"][0]) for F in (100, 200, 300, 500)]
    esc["lateral"] = [(F, envolvente(pts, [tirón_lateral(F, 1), tirón_lateral(F, -1)], mods)) for F in (100, 200, 300, 500)]
    esc["lateral"] = [(F, max(e["casos"], key=lambda o: o["Fmax"])) for F, e in esc["lateral"]]
    esc["oblicuo_TL"] = [(F, envolvente(pts, [tirón_oblicuo(F, "TL")], mods)["casos"][0]) for F in (100, 200, 300, 500)]
    esc["oblicuo_TR"] = [(F, envolvente(pts, [tirón_oblicuo(F, "TR")], mods)["casos"][0]) for F in (100, 200, 300, 500)]
    esc["persona"] = [("apoyada", envolvente(pts, [apoyo_persona()], mods)["casos"][0]),
                      ("cuelgue 80 kg estático", envolvente(pts, [cuelgue(80, 1.0)], mods)["casos"][0]),
                      ("cuelgue 80 kg dinámico (x2)", envolvente(pts, [cuelgue(80, 2.0)], mods)["casos"][0])]
    esc["golpe_frontal"] = [(k, envolvente(pts, [golpe_frontal(2000.0, k)], mods)["casos"][0]) for k in ("C", "TL")]
    res["escenarios"] = {k: [(a, dict(Nmax=o["Nmax"], Vmax=o["Vmax"], Fmax=o["Fmax"], lam=o["lam"], borde=o["borde"]))
                             for a, o in v] for k, v in esc.items()}
    # reparto en filas superiores (tirón normal 500 N en TL/TR, envolvente)
    conc = {}
    for o in env["casos"]:
        if o["caso"].startswith("Tirón normal") and ("TL" in o["caso"] or "TR" in o["caso"]):
            N = np.asarray(o["N"])
            conc[o["caso"]] = dict(frac_z300=float(N[P[:, 1] >= 300].sum() / max(N.sum(), 1e-9)),
                                   frac_top3=float(np.sort(N)[-3:].sum() / max(N.sum(), 1e-9)),
                                   suma_N=float(N.sum()))
    res["concentracion"] = conc
    # momentos admisibles (acción pura, modelo fino envolvente)
    mom = {}
    for nom_, Q in (("vuelco (eje horizontal)", [0, 1e5, 0]), ("giro eje vertical", [0, 0, 1e5])):
        c = dict(nombre=nom_, Q=np.array(Q, float), plano=(0, 0, 0), fuerzas=[])
        e = envolvente(pts, [c], mods)["casos"][0]
        mom[nom_] = 1e5 / e["Fmax"] * FREC_H / 1000.0   # N·m
    Jp = ((P[:, 0] - P[:, 0].mean()) ** 2 + (P[:, 1] - P[:, 1].mean()) ** 2).sum()
    rmax = np.sqrt((P[:, 0] - P[:, 0].mean()) ** 2 + (P[:, 1] - P[:, 1].mean()) ** 2).max()
    mom["torsión en el plano"] = FREC_H * Jp / rmax / 1000.0
    res["momentos_adm_Nm"] = mom
    # cargas admisibles con peso fijo, por tipo de pared (modelo fino, envolvente = mínimo de los dos bordes)
    adm = {}
    acciones = {"Tirón normal TL": lambda F: tirón_normal(F, "TL"), "Tirón normal TR": lambda F: tirón_normal(F, "TR"),
                "Tirón normal centro": lambda F: tirón_normal(F, "C"), "Tirón normal abajo": lambda F: tirón_normal(F, "B"),
                "Tirón oblicuo TR": lambda F: tirón_oblicuo(F, "TR"), "Tirón lateral": lambda F: tirón_lateral(F, 1),
                "Cuelgue en borde delantero (N)": lambda F: caso("cuelgue", peso() + [(0.0, D_FONDO, H_TOT, 0, 0, -F)])}
    mr = [FEMRapido(h=10.0, empotrado=False), FEMRapido(h=10.0, empotrado=True)]
    for pared, fr in PAREDES.items():
        adm[pared] = {}
        for an, fn in acciones.items():
            adm[pared][an] = min(F_adm_fijo(pts, m, fn, fr) for m in mr)
    res["admisibles"] = adm
    # pérdida de anclajes (modelo rápido h=20, envolvente de casos de diseño)
    mrap = [FEMRapido(h=20.0, empotrado=False), FEMRapido(h=20.0, empotrado=True)]
    perd = {}
    base = min(evaluar(pts, m, cs, f_rec=1.0)["lam"] for m in mrap)
    perd["base"] = base
    rng = np.random.default_rng(7)
    for k in (1, 2, 4, 6):
        # peor caso (voraz): se quitan sucesivamente los más cargados del caso gobernante
        act = np.ones(len(pts), bool)
        for _ in range(k):
            best_i, best_l = None, 1e9
            for i in np.nonzero(act)[0]:
                a2 = act.copy(); a2[i] = False
                l2 = min(evaluar(pts, m, cs, f_rec=1.0, activos=a2)["lam"] for m in mrap)
                if l2 < best_l:
                    best_i, best_l = i, l2
            act[best_i] = False
        peor = best_l
        quitados = [int(i) for i in np.nonzero(~act)[0]]
        al = []
        for _ in range(40):
            a2 = np.ones(len(pts), bool)
            a2[rng.choice(len(pts), k, replace=False)] = False
            al.append(min(evaluar(pts, m, cs, f_rec=1.0, activos=a2)["lam"] for m in mrap))
        perd[f"menos_{k}"] = dict(peor=peor, peor_rel=peor / base, quitados=quitados, med=float(np.median(al)) / base,
                                  p10=float(np.percentile(al, 10)) / base)
    res["perdidas"] = perd
    # fallo progresivo (caso gobernante)
    seq, orden = cremallera(pts, mods[0] if gob["borde"] == "apoyado" else mods[1], cgob)
    res["cremallera"] = dict(seq=seq, orden=orden, ratio_colapso=max(seq) / seq[0])
    # juntas de mampostería (Monte Carlo, modelo rápido)
    res["juntas"] = montecarlo_juntas(pts, mrap[0], cs, nmc=120)
    # golpes laterales (energía 10 y 30 J)
    res["golpe_lateral"] = [golpe_lateral(pts, ModeloFEM(h=10.0, arandela=True), E=E) for E in (10000.0, 30000.0)]
    res["t"] = time.time() - t0
    return res


def a_json(o):
    if isinstance(o, dict):
        return {str(k): a_json(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [a_json(v) for v in o]
    if isinstance(o, np.ndarray):
        return o.tolist()
    if isinstance(o, (np.floating,)):
        return float(o)
    if isinstance(o, (np.integer,)):
        return int(o)
    return o


if __name__ == "__main__":
    pats = json.load(open(sys.argv[1]))
    salida = sys.argv[2]
    todos = {}
    for nombre, pts in pats.items():
        print("analizando", nombre, flush=True)
        r = analizar(nombre, pts)
        todos[nombre] = r
        json.dump(a_json(todos), open(salida, "w"), ensure_ascii=False)
        print(f"  lam={r['lam']:.2f} gob={r['gob']} t={r['t']:.0f}s", flush=True)
