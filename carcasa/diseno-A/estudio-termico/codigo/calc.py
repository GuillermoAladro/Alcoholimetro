#!/usr/bin/env python3
"""Cálculos a mano que el informe enseña paso a paso (fórmula → sustitución → resultado). Se guardan en ../resultados/calc.json."""
import json, numpy as np
from termico import *
from dataclasses import replace
R = json.load(open("../resultados/resultados.json"))
c = R["conf"]["actual"]
K = {}
Ta = 25.0
# (a) convección exterior, placa vertical
L, dT = 0.4395, c["chapa_sup"]
tf = Ta + dT / 2
k, nu, al, rho, cp = aire(tf)
Ra = GR * dT * L ** 3 / ((tf + 273.15) * nu * al)
Nu = (0.825 + 0.387 * Ra ** (1 / 6) / (1 + (0.492 / 0.71) ** (9 / 16)) ** (8 / 27)) ** 2
K["conv_ext"] = dict(L=L, dT=dT, tf=tf, k=k, nu=nu, al=al, Ra=Ra, Nu=Nu, h=Nu * k / L, h_f=1.15 * Nu * k / L)
# (b) radiación exterior
Ts = Ta + dT
K["rad_ext"] = dict(Ts=Ts, h=h_rad(0.9, 1.0, Ts, Ta))
K["h_ext"] = K["conv_ext"]["h_f"] + K["rad_ext"]["h"]
# (c) huecos
huecos = {}
for nom, gap, t1, t2 in (("izquierdo", 0.0035, 40.0, 32.0), ("derecho", 0.0070, 42.0, 31.5), ("trasero", 0.0095, 47.0, 33.5)):
    ka = aire((t1 + t2) / 2)[0]
    hc = 1.2 * ka / gap
    huecos[nom] = dict(gap=gap * 1000, hc=hc, hr_sin=h_rad(0.3, 0.85, t1, t2), hr_pint=h_rad(0.9, 0.9, t1, t2), ka=ka)
K["huecos"] = huecos
K["eps"] = dict(sin=1 / (1 / 0.3 + 1 / 0.85 - 1), pint=1 / (1 / 0.9 + 1 / 0.9 - 1))
# (d) doble policarbonato
ka = aire(45.0)[0]
Rg1 = 1 / (1.2 * ka / 0.004 + h_rad(0.9, 0.9, 64.0, 44.5))
Rg2 = 1 / (ka / 0.003 + h_rad(0.9, 0.9, 44.5, 28.0))
ho = K["conv_ext"]["h_f"] + h_rad(0.9, 1.0, 29.0, 25.0)
K["ventana"] = dict(Rg1=Rg1, Rpc=0.005 / 0.20, Rg2=Rg2, Ro=1 / ho, U=c["Uwin"], U_chapa=K["h_ext"], A_scr=0.159 * 0.091, A_solo=0.081 ** 2)
# (e) rejillas: tiro natural
p = P()
dTcol = p.c_top * c["dT"] * 0.85
rho_ = 353.0 / (Ta + dTcol / 2 + 273.15)
dp = rho_ * GR * p.dz_rej * dTcol / (Ta + 273.15)
a_in = p.Cd * p.A_rej; a_out = p.Cd * 2 * p.A_rej / np.sqrt(2) + p.Cd * p.A_fuga
kk = 2 / a_in ** 2 + 1 / a_out ** 2
Q = np.sqrt(2 * dp / (rho_ * kk))
K["rejillas"] = dict(A_rej=p.A_rej * 1e4, dTcol=dTcol, dp=dp, Q=Q * 3600, v=Q / a_in * p.Cd, P=c["P_vent"], dT_sal=c["dT_top"], Gv=c["P_vent"] / c["dT"])
# (f) aleta: zona del cajón de pajitas
h_ = K["h_ext"]; per = 0.22 + 2 * 0.10; Ac = per * 0.003
m = np.sqrt(h_ * per / (50.0 * Ac)); Lf = 0.1605
K["aleta"] = dict(m=m, mL=m * Lf, eta=np.tanh(m * Lf) / (m * Lf), G=np.sqrt(h_ * per * 50 * Ac) * np.tanh(m * Lf), P=c["caminos"]["zona_baja"] + c["caminos"]["suelo"])
# (g) pared
r_eq = np.sqrt(0.22 * 0.4395 / np.pi)
K["pared"] = dict(r=r_eq, S=4 * r_eq, ladrillo=4 * r_eq * 0.6, hormigon=4 * r_eq * 1.6, pladur=0.1)
# (h) ventilador: balance
f2 = R["conf"]["fan2"]
rcq = aire(Ta + 3)[3] * 1006 * 5.2 / 3600
K["fan"] = dict(rcq=rcq, G_par=(f2["P"] - f2["P_vent"]) / f2["dT"], dT=f2["dT"], P=f2["P"], Pmax=1.78 * 9.80665, A_o=np.pi * 0.038 ** 2 / 4 * 1e4,
                v=5.2 / 3600 / (np.pi * 0.038 ** 2 / 4), pdin=0.5 * 1.15 * (5.2 / 3600 / (np.pi * 0.038 ** 2 / 4)) ** 2)
K["fan"]["dp_sys"] = 14 * K["fan"]["pdin"]; K["fan"]["dp_fan"] = 2 * K["fan"]["Pmax"] * (1 - 5.2 / 8.2)
K["fan"]["empuje"] = 1.15 * 9.81 * 0.17 * 6.3 / 298
# (i) Pi: SoC
K["pi"] = dict(Rth=(9.0, 11.0), P=3.0, dT=(27, 33))
# (j) sol
K["sol"] = dict(frente=0.22 * 0.4425, lado=0.10 * 0.4425, W150=150 * (0.22 * 0.4425 + 0.10 * 0.4425), W300=300 * (0.22 * 0.4425 + 0.10 * 0.4425))
# (k) tiempo
K["tau"] = dict(C=R["C_total"], G=c["G"], tau_global=R["C_total"] / c["G"] / 3600)
json.dump(K, open("../resultados/calc.json", "w"), indent=1, default=float)
for k_, v in K.items():
    print(k_, {a: (round(b, 4) if isinstance(b, (float, np.floating)) else b) for a, b in v.items()} if isinstance(v, dict) else v)
