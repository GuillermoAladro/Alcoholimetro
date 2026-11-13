#!/usr/bin/env python3
"""Corre todos los casos del estudio térmico y guarda los resultados en ../resultados/resultados.json (y .npz para las figuras)."""
import json
import numpy as np
from dataclasses import replace
from termico import P, resolver, caminos, transitorio, _nodos, aire, caudal_natural

OUT = "../resultados/"
rng = np.random.default_rng(20261113)

# ------------------------------------------------------------------ configuraciones (en analisis_conf.py)
from analisis_conf import P_NAT, P_FAN, BASE, CONF, BASE_SOLO, CONF_SOLO, cargas_sigma, cargas_solo, FANS_40, P_SIGMA, C5

CL = "sensor"      # pieza de 40 °C que se sigue en todo el estudio: el sensor ZE29A, arriba a la izquierda


def escala(p, Ptot):
    f = Ptot / p.P_tot
    return replace(p, P_psu=p.P_psu * f, P_scr=p.P_scr * f, P_rest=p.P_rest * f, P_fans=p.P_fans * f, P_sig=p.P_sig * f)


# ------------------------------------------------------------------ componentes: posición, límites y factores locales
ZK0, ZK1 = 0.175, 0.4015
COMP = [
    # clave, nombre, z centro (m), P típica (W), área (m²), T máx (°C), T mín (°C), factor local con ventilación forzada, nota del límite
    ("sensor", "Sensor ZE29A",       0.3535, 0.5, 0.0098, 40, 10,  0.30, "aire alrededor"),
    ("modem",  "Módem 4G",           0.303, 2.0, 0.0069, 40, -10,  0.70, "aire alrededor"),
    ("camara", "Cámara",             0.372, 0.3, 0.0012, 50, 0,    0.45, "aire alrededor"),
    ("pi",     "Raspberry Pi 3B+",   0.302, 4.3, 0.0095, 50, 0,    0.75, "aire alrededor"),
    ("pantalla", "Pantalla 7″",      0.237, 4.1, 0.0200, 50, 0,    1.00, "sin dato; 50 °C supuesto"),
    ("sigma",  "myPOS Sigma",        0.350, 3.0, 0.0220, 70, -20,  1.00, "aire alrededor de su parte trasera"),
    ("dcdc",   "Convertidor 12→5 V", 0.220, 2.0, 0.0140, 70, -40,  1.00, "sin reducir hasta 55 °C"),
    ("fuente", "Fuente LRS-50-12",   0.220, 3.8, 0.0220, 70, -30,  1.00, "70 °C hasta el 60 % de carga"),
]
# la misma tabla para la revisión 1 (Solo), con la entrada de aire arriba a la derecha
COMP_SOLO = [
    ("solo",   "SumUp Solo",        0.353, 1.0, 0.0196, 40, 0,   0.30, ""),
    ("sensor", "Sensor ZE29A",      0.3535, 0.5, 0.0098, 40, 10, 0.50, ""),
    ("modem",  "Módem 4G",          0.303, 2.0, 0.0069, 40, -10, 0.85, ""),
    ("camara", "Cámara",            0.372, 0.3, 0.0012, 50, 0,   0.40, ""),
    ("pi",     "Raspberry Pi 3B+",  0.302, 4.3, 0.0095, 50, 0,   0.85, ""),
    ("pantalla", "Pantalla 7″",     0.237, 4.1, 0.0200, 50, 0,   1.00, ""),
    ("fuente", "Fuente LRS-50-5",   0.220, 3.5, 0.0220, 70, -30, 1.00, ""),
]
EN_CAJA_RED = ("fuente", "dcdc")
# otras disposiciones de la ventilación (factor local = parte del calentamiento de salida que ve cada pieza)
F_ENTRADA_DER = dict(sensor=0.50, modem=0.85, camara=0.40, pi=0.85, sigma=0.30)      # la de la revisión 1: entrada arriba a la derecha
F_MODEM_B = dict(modem=0.45)                                                          # módem tras la ventana de la antena, bajo la entrada
DT_CAJA_RED = 6.0      # el aire dentro de la caja de red, sobre el del cajón (estimación)


def factor_natural(z, c_top):
    zeta = (z - ZK0) / (ZK1 - ZK0)
    c_bot = 2.0 - c_top
    return c_bot + (c_top - c_bot) * zeta


def locales(p, r, f_loc=None):
    """Temperatura del aire junto a cada componente (°C)."""
    out = {}
    for k, nom, z, pw, a, tmax, tmin, floc, nota in (COMP if p.sigma else COMP_SOLO):
        if p.Q_fan > 0:
            f = floc if f_loc is None else f_loc.get(k, floc)
        else:
            f = factor_natural(z, p.c_top)
        t = p.Ta + f * r["dT"] + (DT_CAJA_RED if k in EN_CAJA_RED else 0.0)
        out[k] = t
    return out


def resumen(p):
    r = resolver(p, detalle=True)
    g = caminos(p, r)
    loc = locales(p, r)
    N = p.N
    jb = int(p.z_band / (p.Hw / N) + 0.5)
    chapa_sup = np.mean([r[f"{f}{j}"] for f in "FLR" for j in range(jb, N)])
    cajon = np.average([r[k] for k in ("Kf", "Kl", "Kr", "Kb", "Kbase", "Tin")], weights=[0.0254, 0.0166, 0.0166, 0.0334, 0.0094, 0.0201])
    d = dict(P=p.P_tot, Ta=p.Ta, dT=r["dT"], dT_top=r["T_top"] - p.Ta, G=r["G_tot"], Q_nat=r["Q_nat"], P_vent=r["P_vent"], P_win=r["P_win"],
             Uwin=r["Uwin"], chapa_sup=chapa_sup - p.Ta, chapa_max=max(r[f"{f}{j}"] for f in "FLRB" for j in range(N)) - p.Ta,
             cajon=cajon - p.Ta, Tc=r["Tc"] - p.Ta, Scr=r["Scr"] - p.Ta, Psu=r["Psu"] - p.Ta, Roof=r["Roof"] - p.Ta,
             Sig=(r["Sig"] - p.Ta) if p.sigma else None, P_sig_out=r["P_sig_out"],
             caminos={k: float(v) for k, v in g.items()}, local={k: float(v - p.Ta) for k, v in loc.items()},
             mapa={f: [float(r[f"{f}{j}"] - p.Ta) for j in range(N)] for f in "FLRB"})
    return {k: (float(v) if isinstance(v, (np.floating, float)) else v) for k, v in d.items()}


def desglose(p):
    return {x: float(getattr(p, x)) for x in ("P_psu", "P_scr", "P_rest", "P_fans", "P_sig")}


R = {"conf": {}, "meta": dict(P_nat=BASE.P_tot, P_fan=CONF["fan2"]["p"].P_tot, P_sigma=P_SIGMA, cargas5={k: float(v) for k, v in C5.items()},
                              desglose_nat=desglose(BASE), desglose_fan=desglose(CONF["fan2"]["p"]))}
for k, c in CONF.items():
    R["conf"][k] = dict(nombre=c["nombre"], **resumen(c["p"]))
    print(f"{k:8s} P={R['conf'][k]['P']:5.1f}  aire +{R['conf'][k]['dT']:5.1f}  sensor +{R['conf'][k]['local'][CL]:5.1f}  módem +{R['conf'][k]['local']['modem']:5.1f}  chapa +{R['conf'][k]['chapa_sup']:4.1f}  cajón +{R['conf'][k]['cajon']:4.1f}")
# ---- revisión 1 (Solo), recalculada con el mismo modelo, para comparar
R["solo"] = {}
for k, c in CONF_SOLO.items():
    R["solo"][k] = dict(nombre=c["nombre"], **resumen(c["p"]))
    R["solo"][k]["bar_max"] = {c_[0]: float(c_[5] - R["solo"][k]["local"][c_[0]]) for c_ in COMP_SOLO}
    print(f"SOLO {k:8s} P={R['solo'][k]['P']:5.1f}  aire +{R['solo'][k]['dT']:5.1f}  Solo +{R['solo'][k]['local']['solo']:5.1f}  sensor +{R['solo'][k]['local']['sensor']:5.1f}")
# ---- qué fuente calienta menos
fu = {}
for f, nom in (("12V", "LRS-50-12 y convertidor 12→5 V"), ("dos", "LRS-50-5 y una fuente pequeña de 12 V sólo para el Sigma"),
               ("elevador", "LRS-50-5 y elevador 5→12 V para el Sigma"), ("doble", "Fuente de dos salidas RD-50A (5 V y 12 V)")):
    pn = replace(BASE, **cargas_sigma(fuente=f)); rn = resolver(pn)
    pv = replace(BASE, **cargas_sigma(FANS_40, fuente=f), Q_fan=5.2); rv = resolver(pv)
    fu[f] = dict(nombre=nom, P=float(pn.P_tot), P_psu=float(pn.P_psu), dT=float(rn["dT"]), sensor=float(locales(pn, rn)[CL] - pn.Ta),
                 P_fan=float(pv.P_tot), dT_fan=float(rv["dT"]), sensor_fan=float(locales(pv, rv)[CL] - pv.Ta), modem_fan=float(locales(pv, rv)["modem"] - pv.Ta))
R["fuentes"] = fu
# ---- cuánto pesa el consumo del Sigma (la incógnita nueva)
R["sigma_P"] = {}
for ps in (1.5, 3.0, 4.5, 6.0):
    pn = replace(BASE, **cargas_sigma(p_sig=ps)); rn = resolver(pn)
    pv = replace(BASE, **cargas_sigma(FANS_40, p_sig=ps), Q_fan=5.2); rv = resolver(pv)
    R["sigma_P"][str(ps)] = dict(P=float(pn.P_tot), dT=float(rn["dT"]), sensor=float(locales(pn, rn)[CL] - pn.Ta), Sig=float(rn["Sig"] - pn.Ta), fuera=float(rn["P_sig_out"]),
                                 P_fan=float(pv.P_tot), dT_fan=float(rv["dT"]), Sig_fan=float(rv["Sig"] - pv.Ta), fuera_fan=float(rv["P_sig_out"]))

# ---- el mejor caso para el calor: Sigma de 1,5 W y la fuente que menos pierde
pm = replace(BASE, **cargas_sigma(fuente="dos", p_sig=1.5)); rm = resolver(pm)
R["mejor_caso"] = dict(P=float(pm.P_tot), dT=float(rm["dT"]), sensor=float(locales(pm, rm)[CL] - pm.Ta), bar_max=float(40.0 - (locales(pm, rm)[CL] - pm.Ta)))

# ------------------------------------------------------------------ comprobaciones independientes (reglas de armarios)
W, D, H = 0.220, 0.100, 0.4425
A_rittal_todo = 1.4 * W * (H + D) + 1.8 * D * H
Hsup = H - 0.1605
A_rittal_sup = 1.4 * W * (Hsup + D) + 1.8 * D * Hsup
# la comprobación con la regla se hace sobre la variante del Solo (caja cerrada sin nada que atraviese el frente), como en la revisión 1
R["reglas"] = dict(A_todo=A_rittal_todo, A_sup=A_rittal_sup, dT_todo=BASE_SOLO.P_tot / (5.5 * A_rittal_todo), dT_sup=BASE_SOLO.P_tot / (5.5 * A_rittal_sup),
                   P=BASE_SOLO.P_tot, modelo=resumen(replace(BASE_SOLO, nu_gap=60.0, e_k=0.9, e_si=0.9))["dT"],
                   dT_b1_una=17.0, dT_b1_doble=24.0, dT_v12=(8.0, 12.0))
# cuánto cuesta la doble pared: cajón «transparente» (huecos muy conductores y paredes negras)
R["doble_pared"] = dict(sin=resumen(replace(BASE, nu_gap=60.0, e_k=0.9, e_si=0.9))["dT"], con=R["conf"]["actual"]["dT"])
# cuánto ayudan las ventanas del frente si fueran chapa pintada simple no aplica; coste del doble policarbonato: U
R["frente"] = dict(Uwin=R["conf"]["actual"]["Uwin"])

# ------------------------------------------------------------------ ΔT frente a potencia
Ps = np.arange(10.0, 28.01, 1.0)
curvas = {}
for k in ("actual", "pintado", "fan1", "fan2", "fan60"):
    p0 = CONF[k]["p"]
    extra = p0.P_fans
    vals = []
    for Pt in Ps:
        p = escala(replace(p0, P_fans=0.0), Pt - 0.0)          # la potencia del eje incluye todo
        r = resolver(p)
        vals.append([r["dT"], locales(p, r)[CL] - p.Ta])
    curvas[k] = np.array(vals)
np.savez(OUT + "curvas_P.npz", Ps=Ps, **curvas)
R["pendiente"] = {k: float((curvas[k][-1, 1] - curvas[k][0, 1]) / (Ps[-1] - Ps[0])) for k in curvas}

# ------------------------------------------------------------------ ΔT frente a caudal
Qs = np.array([0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7, 8, 10, 12, 14, 16])
dTq = np.array([resolver(replace(BASE, **P_FAN, Q_fan=q))["dT"] for q in Qs])
np.savez(OUT + "curva_Q.npz", Qs=Qs, dT=dTq)

# ------------------------------------------------------------------ ventilador: punto de trabajo
RHO = 1.15


def punto(n_serie, K, Qmax, Pmax_mm, D_o):
    """Caudal (m³/h) de n ventiladores en serie contra un sistema de coeficiente K referido a la abertura de diámetro D_o."""
    Pmax = Pmax_mm * 9.80665
    A_o = np.pi * D_o ** 2 / 4
    a = K * RHO / 2 / (3600 * A_o) ** 2
    b = n_serie * Pmax / Qmax
    c = -n_serie * Pmax
    return (-b + np.sqrt(b * b - 4 * a * c)) / (2 * a)


fan = {}
for nombre, n, Qmax, Pmm, Do in (("1 × 40×10", 1, 8.2, 1.78, 0.038), ("2 × 40×10 en serie", 2, 8.2, 1.78, 0.038),
                                  ("2 × 40×20 en serie", 2, 9.4, 2.26, 0.038), ("1 × 60×25", 1, 29.2, 2.18, 0.058)):
    fan[nombre] = {f"K{K}": float(punto(n, K, Qmax, Pmm, Do)) for K in (5, 10, 20, 40, 80)}
R["fan"] = fan
# la rejilla actual como salida de un ventilador: K referido a Ø38
A_o = np.pi * 0.038 ** 2 / 4
K_rej = 2 * (A_o / (0.65 * 2.54e-4)) ** 2
R["fan_rejilla"] = dict(K=float(K_rej), Q=float(punto(1, K_rej + 3, 8.2, 1.78, 0.038)))
# caja de red: 4 ranuras de 20 × 4 en su frente
A_cr = 4 * (20 * 4 - 3.43) * 1e-6
K_cr = (A_o / (0.65 * A_cr)) ** 2
R["fan_cajared"] = dict(A_cm2=A_cr * 1e4, K=float(K_cr), Q=float(punto(2, K_cr + 10, 8.2, 1.78, 0.038)))
# un ventilador parado de los dos (el parado estorba: K≈8) y malla sucia
R["fan_fallo"] = dict(Q=float(punto(1, 10 + 8, 8.2, 1.78, 0.038)))
R["fan_sucio"] = {f"{int(o*100)}": float(punto(2, 4 + 6 / (1 - o) ** 2, 8.2, 1.78, 0.038)) for o in (0.0, 0.5, 0.75, 0.9)}
for k in ("fan_fallo",):
    R[k]["dT"] = float(resolver(replace(BASE, **P_FAN, Q_fan=R[k]["Q"]))["dT"])
R["fan_sucio_dT"] = {k: float(resolver(replace(BASE, **P_FAN, Q_fan=q))["dT"]) for k, q in R["fan_sucio"].items()}
# ventilación pasiva: área de rejilla necesaria
pas = {}
for mult in (1, 2, 4, 8, 16, 32):
    p = replace(BASE, A_rej=2.54e-4 * mult)
    r = resolver(p)
    pas[str(mult)] = dict(A_cm2=2.54 * mult, dT=float(r["dT"]), sensor=float(locales(p, r)[CL] - p.Ta), Q=float(r["Q_nat"]))
R["pasiva"] = pas
r_ = resolver(replace(BASE, A_rej=2.54e-4 * 16, e_k=0.9, e_si=0.9))
R["pasiva_max"] = dict(dT=float(r_["dT"]), sensor=float(locales(replace(BASE, A_rej=2.54e-4 * 16, e_k=0.9, e_si=0.9), r_)[CL] - 25))

# ------------------------------------------------------------------ sensibilidad (uno cada vez) sobre el diseño actual
def solo_dT(p):          # aire junto al sensor sobre el del bar
    r = resolver(p)
    return locales(p, r)[CL] - p.Ta


sens = []
b0 = solo_dT(BASE)
for etiqueta, lo, hi in (
    ("Potencia total (15 – 27 W)", escala(BASE, 15.0), escala(BASE, 27.0)),
    ("Consumo del Sigma (1,5 – 6 W)", replace(BASE, **cargas_sigma(p_sig=1.5)), replace(BASE, **cargas_sigma(p_sig=6.0))),
    ("Convertidor 12→5 V (93 % – 80 %)", replace(BASE, **cargas_sigma(eta_dcdc=0.93)), replace(BASE, **cargas_sigma(eta_dcdc=0.80))),
    ("Acabado del cajón (pintado ε 0,9 – galvanizado ε 0,2)", replace(BASE, e_k=0.9), replace(BASE, e_k=0.2)),
    ("Rejillas (4 veces más área – tapadas)", replace(BASE, A_rej=4 * 2.54e-4), replace(BASE, sellado=True)),
    ("Convección interior aire–pared (5 – 2,5 W/m²K)", replace(BASE, h_aw=5.0), replace(BASE, h_aw=2.5)),
    ("Estratificación (factor arriba 1,15 – 1,45)", replace(BASE, c_top=1.15), replace(BASE, c_top=1.45)),
    ("Conducción en los huecos (×1,6 – ×1,0)", replace(BASE, nu_gap=1.6), replace(BASE, nu_gap=1.0)),
    ("Pared (hormigón – pladur)", replace(BASE, G_pared=1.0), replace(BASE, G_pared=0.1)),
    ("Contacto fuente–cajón (3 – 0,3 W/K)", replace(BASE, G_psu_kb=3.0), replace(BASE, G_psu_kb=0.3)),
    ("Aire del bar (algo movido – quieto)", replace(BASE, f_aire=1.5), replace(BASE, f_aire=1.0)),
    ("Cara interior de la carcasa (ε 0,9 – 0,3)", replace(BASE, e_si=0.9), replace(BASE, e_si=0.3)),
    ("Uniones soldadas (buenas – malas)", replace(BASE, eta_sold=1.0), replace(BASE, eta_sold=0.2)),
):
    sens.append(dict(nombre=etiqueta, lo=float(solo_dT(lo)), hi=float(solo_dT(hi))))
R["sens"] = dict(base=float(b0), filas=sens)

# ------------------------------------------------------------------ Monte Carlo
def muestra(base):
    Pt = rng.triangular(15.0, 20.0, 27.0)
    p = escala(base, Pt if base.P_fans == 0 else Pt + 0.7)
    p = replace(p, R_sig=rng.uniform(0.015, 0.06), A_sig_in=rng.uniform(0.016, 0.028))
    return replace(p, e_k=rng.uniform(0.2, 0.45) if base.e_k < 0.5 else rng.uniform(0.8, 0.95), e_si=rng.uniform(0.6, 0.92), e_ext=rng.uniform(0.85, 0.95),
                   h_aw=rng.uniform(2.5, 5.0), h_cc=rng.uniform(4.5, 8.0), F_rad=rng.uniform(0.5, 0.9), nu_gap=rng.uniform(1.0, 1.6),
                   f_aire=rng.uniform(1.0, 1.5), G_pared=float(np.exp(rng.uniform(np.log(0.1), np.log(1.0)))), eta_sold=rng.uniform(0.3, 1.0),
                   G_psu_kb=float(np.exp(rng.uniform(np.log(0.3), np.log(3.0)))), k_s=rng.uniform(45, 55), Cd=rng.uniform(0.55, 0.75),
                   A_fuga=rng.uniform(0.0, 2.0e-4), c_top=rng.uniform(1.15, 1.45), G_tapa_ct=rng.uniform(0.03, 0.3), G_tin_ct=rng.uniform(0.03, 0.3))


NMC = 1500
mc = {}
for k in ("actual", "pintado", "fan2"):
    vals = np.zeros((NMC, 4))
    for i in range(NMC):
        p = muestra(CONF[k]["p"])
        if p.Q_fan > 0:
            p = replace(p, Q_fan=rng.uniform(3.5, 6.5))
            r = resolver(p)
            loc = locales(p, r, f_loc=dict(sensor=rng.uniform(0.15, 0.5), modem=rng.uniform(0.5, 0.9)))
        else:
            r = resolver(p)
            loc = locales(p, r)
        vals[i] = (r["dT"], loc[CL] - p.Ta, p.P_tot, loc["modem"] - p.Ta)
    mc[k] = vals
    q = np.percentile(vals[:, 1], [5, 10, 50, 90, 95])
    qm = np.percentile(vals[:, 0], [5, 10, 50, 90, 95])
    qd = np.percentile(vals[:, 3], [5, 10, 50, 90, 95])
    qb = np.percentile(40.0 - np.maximum(vals[:, 1], vals[:, 3]), [5, 10, 50, 90, 95])      # bar máximo con sensor y módem en ficha
    pct = lambda q_: dict(p5=q_[0], p10=q_[1], p50=q_[2], p90=q_[3], p95=q_[4])
    R.setdefault("mc", {})[k] = dict(sensor=pct(q), media=pct(qm), modem=pct(qd), barmax=pct(qb), min_sensor=float(vals[:, 1].min()),
                                     frac_bajo15=float(np.mean(vals[:, 1] < 15.0)))
    print("MC", k, "sensor:", np.round(q, 1), " media:", np.round(qm, 1), " módem:", np.round(qd, 1), " bar máx:", np.round(qb, 1))
np.savez(OUT + "mc.npz", **mc)

# ------------------------------------------------------------------ tabla de márgenes por temperatura del bar
bares = [15, 20, 25, 27, 30, 35, 40]
marg = {}
for k in ("actual", "pintado", "fan2"):
    filas = {}
    for Ta in bares:
        p = replace(CONF[k]["p"], Ta=float(Ta))
        r = resolver(p)
        filas[str(Ta)] = {kk: float(v) for kk, v in locales(p, r).items()}
    marg[k] = filas
R["margenes"] = marg
R["bar_max"] = {k: {c[0]: float(c[5] - R["conf"][k]["local"][c[0]]) for c in COMP} for k in ("actual", "pintado", "fan1", "fan2", "fan60")}
# otras disposiciones de la ventilación con dos ventiladores
pf_, rf_ = CONF["fan2"]["p"], resolver(CONF["fan2"]["p"])
R["disposicion"] = {}
for nom, fl in (("izquierda", None), ("derecha", F_ENTRADA_DER), ("modem_b", F_MODEM_B)):
    loc = locales(pf_, rf_, f_loc=fl)
    R["disposicion"][nom] = dict(local={k: float(v - pf_.Ta) for k, v in loc.items()}, bar_max={c[0]: float(c[5] - (loc[c[0]] - pf_.Ta)) for c in COMP})
R["comp"] = [dict(clave=c[0], nombre=c[1], z=c[2], P=c[3], A=c[4], tmax=c[5], tmin=c[6], floc=c[7], nota=c[8]) for c in COMP]

# ------------------------------------------------------------------ casos exteriores: funda, sol, frío
ext = {}
for k in ("actual", "fan2"):
    p0 = CONF[k]["p"]
    casos = {
        "base": p0,
        "funda2": replace(p0, R_funda=0.02),
        "funda_suelta": replace(p0, R_funda=0.05),
        "funda_tapa": replace(p0, R_funda=0.02, sellado=True) if p0.Q_fan <= 0 else replace(p0, R_funda=0.02, Q_fan=1.0),
        "sol150": replace(p0, q_sol=150.0),
        "sol300": replace(p0, q_sol=300.0),
    }
    ext[k] = {}
    for kk, p in casos.items():
        r = resolver(p, detalle=True)
        N = p.N
        ext[k][kk] = dict(dT=float(r["dT"]), sensor=float(locales(p, r)[CL] - p.Ta), chapa_max=float(max(r[f"{f}{j}"] for f in "FL" for j in range(N)) - p.Ta),
                          Scr=float(r["Scr"] - p.Ta), Sig=float(r["Sig"] - p.Ta), sigma_aire=float(locales(p, r)["sigma"] - p.Ta))
R["ext"] = ext
frio = {}
for Ta in (0, 5, 10, 15):
    f = {}
    for k in ("actual", "fan2"):
        p = replace(CONF[k]["p"], Ta=float(Ta))
        r = resolver(p)
        f[k] = {kk: float(v) for kk, v in locales(p, r).items()}
    frio[str(Ta)] = f
R["frio"] = frio

# ------------------------------------------------------------------ transitorios
names, ix = _nodos(BASE)


def serie(p_de_t, horas, T_ini=None, on_de_t=None, dt=60.0, fsolo=None):
    ts, hist, ix_ = transitorio(p_de_t, horas * 3600, dt=dt, T_ini=T_ini, on_de_t=on_de_t)
    Ti = hist[:, ix_["Ti"]]
    chapa = hist[:, [ix_[f"L{j}"] for j in range(4, 11)]].mean(axis=1)
    return ts / 3600, Ti, chapa, hist


ZS = 0.3535             # altura del sensor


def aire_solo(p, Ti):   # aire junto al sensor
    f = 0.30 if p.Q_fan > 0 else factor_natural(ZS, p.c_top)
    return p.Ta + f * (Ti - p.Ta)


tr = {}
pa, pf = CONF["actual"]["p"], CONF["fan2"]["p"]
t, Ti, ch, h = serie(lambda t: pa, 12)
tr["frio_actual"] = (t, aire_solo(pa, Ti), Ti, ch)
t, Ti, ch, h2 = serie(lambda t: pf, 12)
tr["frio_fan2"] = (t, aire_solo(pf, Ti), Ti, ch)
# fallo de los dos ventiladores partiendo del régimen con ventilación (quedan las aberturas: tiro natural por 2 × Ø38 con el rodete parado)
r0 = resolver(pf, detalle=True)
p_fallo = replace(pf, Q_fan=0.0, **P_NAT, A_rej=4.0e-4, n_in=1.0, n_out=1.0, dz_rej=0.15, A_fuga=0.0)
t, Ti, ch, h3 = serie(lambda t: p_fallo, 10, T_ini=r0["_T"], dt=30.0)
TAU_ESTR = 10.0 / 60.0          # h: la estratificación natural tarda unos minutos en formarse (supuesto)


def solo_fallo(p, t, Ti):
    f = factor_natural(ZS, p.c_top) - (factor_natural(ZS, p.c_top) - 0.30) * np.exp(-t / TAU_ESTR)
    return p.Ta + f * (Ti - p.Ta)


tr["fallo"] = (t, solo_fallo(p_fallo, t, Ti), Ti, ch)
ZM = 0.303              # altura del módem


def modem_fallo(p, t, Ti):
    f = factor_natural(ZM, p.c_top) - (factor_natural(ZM, p.c_top) - 0.70) * np.exp(-t / TAU_ESTR)
    return p.Ta + f * (Ti - p.Ta)


fallo_modem = modem_fallo(p_fallo, t, Ti)
r_fallo = resolver(p_fallo)
R["fallo_total"] = dict(dT=float(r_fallo["dT"]), sensor=float(locales(p_fallo, r_fallo)[CL] - 25), modem=float(locales(p_fallo, r_fallo)["modem"] - 25),
                        sigma=float(locales(p_fallo, r_fallo)["sigma"] - 25))
# corte de luz nocturno de 7 h partiendo del régimen, luego arranque
ra = resolver(pa, detalle=True)
t, Ti, ch, h4 = serie(lambda t: pa, 16, T_ini=ra["_T"], on_de_t=lambda t: t >= 7 * 3600)
tr["corte"] = (t, aire_solo(pa, Ti), Ti, ch)
np.savez(OUT + "trans.npz", **{k + "_" + n: v[i] for k, v in tr.items() for i, n in enumerate(("t", "solo", "Ti", "chapa"))})


def t_hasta(t, y, umbral):
    i = np.argmax(y >= umbral)
    return float(t[i]) if y[i] >= umbral else None


def t_frac(t, y, frac):
    y0, y1 = y[0], y[-1]
    i = np.argmax((y - y0) >= frac * (y1 - y0))
    return float(t[i])


R["trans"] = dict(
    actual_t40=t_hasta(*tr["frio_actual"][:2], 40.0), actual_63=t_frac(*tr["frio_actual"][:2], 0.632), actual_95=t_frac(*tr["frio_actual"][:2], 0.95),
    actual_4h=float(np.interp(4, tr["frio_actual"][0], tr["frio_actual"][1]) - 25), actual_fin=float(tr["frio_actual"][1][-1] - 25),
    fan2_63=t_frac(*tr["frio_fan2"][:2], 0.632), fan2_95=t_frac(*tr["frio_fan2"][:2], 0.95), fan2_fin=float(tr["frio_fan2"][1][-1] - 25),
    fan2_4h_Ti=float(np.interp(4, tr["frio_fan2"][0], tr["frio_fan2"][2]) - 25), fan2_fin_Ti=float(tr["frio_fan2"][2][-1] - 25),
    fallo_t40=t_hasta(*tr["fallo"][:2], 40.0), fallo_ini=float(tr["fallo"][1][0]), fallo_1h=float(np.interp(1, tr["fallo"][0], tr["fallo"][1])), fallo_fin=float(tr["fallo"][1][-1]),
    corte_min=float(tr["corte"][1][:7 * 60].min()), corte_7h=float(np.interp(7, tr["corte"][0], tr["corte"][1])),
    fallo_t40_modem=t_hasta(tr["fallo"][0], fallo_modem, 40.0), fallo_ini_modem=float(fallo_modem[0]), fallo_fin_modem=float(fallo_modem[-1]),
)
# fallo con el bar a 30 y 35 °C: tiempo hasta 40 °C junto al Solo
for Ta in (30.0, 35.0):
    pf_ = replace(pf, Ta=Ta)
    r0_ = resolver(pf_, detalle=True)
    pfa = replace(p_fallo, Ta=Ta)
    t, Ti, ch, _ = serie(lambda t: pfa, 6, T_ini=r0_["_T"], dt=30.0)
    R["trans"][f"fallo_t40_{int(Ta)}"] = t_hasta(t, solo_fallo(pfa, t, Ti), 40.0)
    R["trans"][f"fallo_t40_modem_{int(Ta)}"] = t_hasta(t, modem_fallo(pfa, t, Ti), 40.0)
    R["trans"][f"fallo_ini_{int(Ta)}"] = float(aire_solo(pf_, np.array([r0_['Ti']]))[0])
# capacidad térmica total
from termico import capacidades
R["C_total"] = float(capacidades(BASE, ix).sum())

# ------------------------------------------------------------------ flujos interiores del caso base (para el esquema de la red)
def flujos(p):
    r = resolver(p)
    Aw = dict(Kf=p.wk * p.hk - p.win_scr[2] * (p.win_scr[1] - p.win_scr[0]) - p.A_hueco_cobro, Kl=p.dk * p.hk, Kr=p.dk * p.hk, Kb=p.wk * p.hk * 0.72,
              Kbase=p.wk * p.dk * 0.63, Tin=(p.W - 2 * p.t_s) * (p.D - 2 * p.t_s))
    fm = p.f_mezcla if p.Q_fan > 0 else 1.0
    q_conv = sum(p.h_aw * fm * (1.2 if w == "Tin" else 1.0) * a * (r["Ti"] - r[w]) for w, a in Aw.items())
    q_psu = p.G_psu_kb * (r["Psu"] - r["Kb"])
    q_cajon = p.P_tot - r["P_win"] - r["P_vent"] - r["P_sig_out"]
    return dict(conv=float(q_conv), contacto=float(q_psu), rad=float(q_cajon - q_conv - q_psu), cajon=float(q_cajon), win=float(r["P_win"]), vent=float(r["P_vent"]),
                sig_out=float(r["P_sig_out"]), comp_aire=float(q_conv + r["P_vent"] - p.P_fans))


R["flujos"] = {k: flujos(CONF[k]["p"]) for k in ("actual", "pintado", "fan2")}

# ------------------------------------------------------------------ escalera de temperaturas (de fuera a dentro)
esc = {}
for k in ("actual", "pintado", "fan2"):
    c = R["conf"][k]
    esc[k] = [0.0, c["chapa_sup"], c["cajon"], c["dT"], c["local"][CL]]
R["escalera"] = esc

json.dump(R, open(OUT + "resultados.json", "w"), indent=1, ensure_ascii=False, default=float)
print("OK")
