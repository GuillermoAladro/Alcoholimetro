#!/usr/bin/env python3
"""Cálculos a mano que el informe enseña paso a paso (fórmula → sustitución → resultado). Se guardan en ../resultados/calc.json."""
import json, numpy as np
from termico import *
from dataclasses import replace
import analisis_conf as AC
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
rb = resolver(AC.BASE)
jb_ = int(AC.BASE.z_band / (AC.BASE.Hw / AC.BASE.N) + 0.5)
med = lambda f: float(np.mean([rb[f"{f}{j}"] for j in range(jb_ + 1, AC.BASE.N)]))
for nom, gap, t1, t2 in (("izquierdo", 0.0035, rb["Kl"], med("L")), ("derecho", 0.0070, rb["Kr"], med("R")), ("trasero", 0.0095, rb["Kb"], med("B"))):
    ka = aire((t1 + t2) / 2)[0]
    hc = 1.2 * ka / gap
    huecos[nom] = dict(gap=gap * 1000, hc=hc, hr_sin=h_rad(0.3, 0.85, t1, t2), hr_pint=h_rad(0.9, 0.9, t1, t2), ka=ka, t1=float(t1), t2=float(t2))
K["huecos"] = huecos
K["eps"] = dict(sin=1 / (1 / 0.3 + 1 / 0.85 - 1), pint=1 / (1 / 0.9 + 1 / 0.9 - 1))
# (d) doble policarbonato
ka = aire(45.0)[0]
Tscr = Ta + c["Scr"]
Rg1 = 1 / (1.2 * ka / 0.004 + h_rad(0.9, 0.9, Tscr, (Tscr + Ta) / 2))
Rg2 = 1 / (ka / 0.003 + h_rad(0.9, 0.9, (Tscr + Ta) / 2, 28.0))
ho = K["conv_ext"]["h_f"] + h_rad(0.9, 1.0, 29.0, 25.0)
K["ventana"] = dict(Rg1=Rg1, Rpc=0.005 / 0.20, Rg2=Rg2, Ro=1 / ho, U=c["Uwin"], U_chapa=K["h_ext"], A_scr=0.159 * 0.091, Tscr=Tscr, P=c["P_win"])
# (d2) el terminal: lo que sale por su cara y lo que deja dentro
pb = AC.BASE
G_in = pb.A_sig_in / (pb.R_sig + 1 / pb.h_cc)
G_out = pb.A_sig_out / (pb.R_sig + 1 / ho)
f2_ = R["conf"]["fan2"]
K["sigma"] = dict(A_in=pb.A_sig_in, A_out=pb.A_sig_out, R=pb.R_sig, hcc=pb.h_cc, ho=ho, G_in=G_in, G_out=G_out, P=pb.P_sig,
                  dTi=c["dT"], dTsig=c["Sig"], P_out=c["P_sig_out"], dTsig_simple=(pb.P_sig + G_in * c["dT"]) / (G_in + G_out),
                  dTi_fan=f2_["dT"], dTsig_fan=f2_["Sig"], P_out_fan=f2_["P_sig_out"])
# (d3) de dónde salen los vatios
dc5 = AC.C5["pi"] + AC.C5["modem"] + AC.C5["pantalla"] + AC.C5["sensor"]
bus = dc5 / AC.ETA_DCDC + AC.P_SIGMA
K["potencia"] = dict(dc5=dc5, eta_dcdc=AC.ETA_DCDC, p_dcdc=dc5 / AC.ETA_DCDC - dc5, sigma=AC.P_SIGMA, bus=bus, eta_psu=AC.ETA_LRS12, ac=bus / AC.ETA_LRS12,
                     p_psu=bus / AC.ETA_LRS12 - bus, carga_psu=bus / 50.4, solo_ac=R["solo"]["actual"]["P"], extra=bus / AC.ETA_LRS12 - R["solo"]["actual"]["P"],
                     ac_fan=R["meta"]["P_fan"], bus_fan=(dc5 + AC.FANS_40) / AC.ETA_DCDC + AC.P_SIGMA, carga_dcdc=dc5 / 30.0)
# (e) rejillas: tiro natural
p = AC.BASE
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
K["fan"]["empuje"] = 1.15 * 9.81 * 0.17 * f2["dT"] / 298
# (i) Pi: SoC
K["pi"] = dict(Rth=(9.0, 11.0), P=3.0, dT=(27, 33))
# (j) sol
K["sol"] = dict(frente=0.22 * 0.4425, lado=0.10 * 0.4425, W150=150 * (0.22 * 0.4425 + 0.10 * 0.4425), W300=300 * (0.22 * 0.4425 + 0.10 * 0.4425))
# (k) tiempo
K["tau"] = dict(C=R["C_total"], G=c["G"], tau_global=R["C_total"] / c["G"] / 3600)
json.dump(K, open("../resultados/calc.json", "w"), indent=1, default=float)
for k_, v in K.items():
    print(k_, {a: (round(b, 4) if isinstance(b, (float, np.floating)) else b) for a, b in v.items()} if isinstance(v, dict) else v)
