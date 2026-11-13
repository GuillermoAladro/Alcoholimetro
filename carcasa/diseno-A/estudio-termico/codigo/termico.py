#!/usr/bin/env python3
"""Modelo térmico nodal del alcoholímetro (diseño A, chapa 3 mm / cajón 1,5 mm, 04-11-2026).

Dos variantes de cobro: sigma=False, SumUp Solo detrás del policarbonato (revisión 1 del estudio);
sigma=True, terminal myPOS Sigma en un hueco del frente, con su cara al bar (revisión 2).

Todo es CÁLCULO. No hay nada medido. Unidades SI. Temperaturas en °C salvo donde se indica K.
"""
from dataclasses import dataclass, field, replace
import numpy as np

SIG, GR = 5.670e-8, 9.81


def aire(tc):
    """Propiedades del aire a la temperatura de película tc (°C)."""
    k = 0.0241 + 7.7e-5 * tc
    nu = 1.33e-5 + 9.5e-8 * tc
    al = nu / 0.71
    rho = 353.0 / (tc + 273.15)
    return k, nu, al, rho, 1006.0


def h_vertical(dT, L, tf):
    """Convección natural en placa vertical (Churchill–Chu, todo Ra). W/m²K."""
    dT = max(abs(dT), 0.05)
    k, nu, al, _, _ = aire(tf)
    ra = GR * dT * L ** 3 / ((tf + 273.15) * nu * al)
    nus = (0.825 + 0.387 * ra ** (1 / 6) / (1 + (0.492 / 0.71) ** (9 / 16)) ** (8 / 27)) ** 2
    return nus * k / L


def h_horizontal(dT, Lc, tf, arriba=True):
    """Placa horizontal caliente mirando arriba (arriba=True) o abajo. Lc = área/perímetro."""
    dT = max(abs(dT), 0.05)
    k, nu, al, _, _ = aire(tf)
    ra = GR * dT * Lc ** 3 / ((tf + 273.15) * nu * al)
    if arriba:
        nus = 0.54 * ra ** 0.25 if ra < 1e7 else 0.15 * ra ** (1 / 3)
    else:
        nus = 0.27 * ra ** 0.25
    return max(nus, 1.0) * k / Lc


def h_cavidad_horizontal(dT, d, tf):
    """Capa de aire horizontal calentada por abajo (Hollands). W/m²K."""
    dT = max(abs(dT), 0.05)
    k, nu, al, _, _ = aire(tf)
    ra = GR * dT * d ** 3 / ((tf + 273.15) * nu * al)
    nus = 1 + 1.44 * max(0.0, 1 - 1708 / ra) + max(0.0, (ra / 5830) ** (1 / 3) - 1)
    return nus * k / d


def h_rad(e1, e2, t1, t2, F=1.0):
    """Radiación linealizada entre dos superficies grises enfrentadas (placas paralelas). W/m²K."""
    a, b = t1 + 273.15, t2 + 273.15
    return F * SIG * (a * a + b * b) * (a + b) / (1 / e1 + 1 / e2 - 1)


@dataclass
class P:
    # ---- ambiente
    Ta: float = 25.0
    # ---- potencia (W): fuente (pérdidas, y las del convertidor 12→5 V si lo hay), pantalla, resto (Pi+cámara, módem, sensor y el Solo si lo hay)
    P_psu: float = 3.45
    P_scr: float = 4.08
    P_rest: float = 8.16
    P_fans: float = 0.0
    # ---- terminal de cobro myPOS Sigma (146 × 101 × 57 mm, hueco de 108,7 × 86,4 mm) en el frente
    sigma: bool = False
    P_sig: float = 0.0          # W que disipa el terminal
    A_sig_in: float = 0.022     # superficie del cuerpo que queda dentro del cajón (contorno × 32 mm + trasera)
    A_sig_out: float = 0.01475  # cara delantera, al bar (146 × 101 mm)
    R_sig: float = 0.03         # m²K/W entre el interior del terminal y cada una de sus caras (plástico de 3 mm y aire interior)
    a_sig_sol: float = 0.9      # absorción solar de su cara (cristal negro)
    # ---- geometría (m)
    W: float = 0.220
    D: float = 0.100
    Hw: float = 0.4395          # alto de laterales y trasera (la tapa añade 3 mm)
    z_band: float = 0.1605      # cara de abajo de la bandeja
    t_s: float = 0.003
    t_k: float = 0.0015
    wk: float = 0.2035
    dk: float = 0.073
    hk: float = 0.228
    zk0: float = 0.1735
    g_izq: float = 0.0035
    g_der: float = 0.0070
    g_tras: float = 0.0095
    g_fr_aire: float = 0.0033   # aire entre el cajón y el policarbonato interior
    g_base: float = 0.010
    g_techo: float = 0.0305     # entre tapa interior y tapa
    t_pc: float = 0.005
    pc_z: tuple = (0.180, 0.403)
    # ventanas del panel: (z0, z1, ancho)
    win_scr: tuple = (0.1915, 0.2825, 0.159)
    win_solo: tuple = (0.3105, 0.3955, 0.085)
    win_sigma: tuple = (0.2995, 0.4005, 0.146)   # zona del frente que ocupa el marco del Sigma (tumbado: 101 de alto × 146 de ancho)
    hueco_sigma: tuple = (0.1087, 0.0864)        # hueco en panel y cajón
    N: int = 11
    # ---- materiales
    k_s: float = 50.0
    k_pc: float = 0.20
    # ---- emisividades
    e_ext: float = 0.90         # pintura en polvo exterior y policarbonato
    e_si: float = 0.85          # cara interior de la carcasa
    e_k: float = 0.30           # chapa del cajón de componentes y tapa interior (0,3 = sin pintar o galvanizada)
    e_c: float = 0.90           # componentes (plásticos, placas)
    # ---- coeficientes interiores
    h_aw: float = 3.5           # aire interior → paredes del cajón (convección natural), W/m²K
    h_cc: float = 6.0           # componentes → aire interior
    F_rad: float = 0.7          # factor de visión componentes → paredes
    A_c: float = 0.050          # superficie de los componentes que disipan (sin pantalla ni fuente)
    A_scr: float = 0.020
    A_psu: float = 0.022
    G_psu_kb: float = 1.0       # contacto fuente → trasera del cajón (W/K)
    nu_gap: float = 1.2         # multiplicador de conducción en los huecos (1 = aire quieto)
    # ---- exterior
    f_aire: float = 1.15        # multiplicador de la convección exterior (aire del bar no del todo quieto)
    G_pared: float = 0.35       # conductancia total trasera → pared → ambiente (W/K); pladur 0,1 · ladrillo 0,35 · hormigón 1,0
    h_ct: float = 30.0          # contacto trasera–pared (W/m²K)
    eta_sold: float = 0.5       # calidad térmica de las uniones por puntos (0–1)
    G_tapa_ct: float = 0.10     # contacto tapa–carcasa (bisagra y faldones), W/K total
    G_tin_ct: float = 0.10      # contacto tapa interior–carcasa, W/K total
    # ---- ventilación natural por las rejillas actuales
    A_rej: float = 2.54e-4      # una rejilla = 3 ranuras de 22 × 4 mm
    n_in: float = 1.0           # rejillas de entrada (abajo izquierda)
    n_out: float = 2.0          # rejillas de salida (arriba izquierda y derecha)
    dz_rej: float = 0.166       # desnivel entre entrada y salida
    Cd: float = 0.65
    A_fuga: float = 0.5e-4      # fugas arriba (holgura de la tapa interior), m²
    c_top: float = 1.30         # estratificación: (T_arriba − Ta) = c_top · (T_media − Ta)
    # ---- ventilación forzada
    Q_fan: float = 0.0          # m³/h reales
    f_mezcla: float = 1.25      # mejora de h interior con aire forzado
    # ---- cargas exteriores
    q_sol: float = 0.0          # W/m² absorbidos en frente y lateral izquierdo (sol directo)
    R_funda: float = 0.0        # m²K/W añadidos en laterales y techo por una funda de plástico
    sellado: bool = False       # True = sin rejillas ni fugas

    @property
    def P_tot(self):
        return self.P_psu + self.P_scr + self.P_rest + self.P_fans + (self.P_sig if self.sigma else 0.0)

    @property
    def win_cobro(self):        # zona del frente del lector de tarjetas
        return self.win_sigma if self.sigma else self.win_solo

    @property
    def A_hueco_cobro(self):    # hueco del frente del cajón para el lector
        return self.hueco_sigma[0] * self.hueco_sigma[1] if self.sigma else 0.081 ** 2


def caudal_natural(p, dT_col):
    """Tiro natural por las rejillas (dos chapas en serie por rejilla). Devuelve m³/s."""
    if p.sellado or dT_col <= 0:
        return 0.0
    tf = p.Ta + dT_col / 2
    rho = 353.0 / (tf + 273.15)
    dp = rho * GR * p.dz_rej * dT_col / (p.Ta + 273.15)
    a_in = p.Cd * p.A_rej * p.n_in
    a_out = p.Cd * (p.A_rej * p.n_out)
    # salida: rejillas (2 chapas en serie) en paralelo con las fugas de arriba (1 paso)
    a_out_eq = a_out / np.sqrt(2) + p.Cd * p.A_fuga
    kk = 2.0 / a_in ** 2 + 1.0 / a_out_eq ** 2
    return np.sqrt(2 * dp / (rho * kk))


def _nodos(p):
    names = ["Ti", "Tc", "Scr", "Psu", "Kf", "Kl", "Kr", "Kb", "Kbase", "Tin", "Roof", "Floor", "Band"]
    if p.sigma:
        names.append("Sig")
    for f in "FLRB":
        names += [f"{f}{j}" for j in range(p.N)]
    return names, {n: i for i, n in enumerate(names)}


def ensamblar(p, T, ix, on=True):
    """Matriz de conductancias A y vector b (A·T = b) para las temperaturas T. on=False: máquina apagada (sin fuentes)."""
    N = p.N
    n = len(ix)
    dz = p.Hw / N
    Ta = p.Ta
    A = np.zeros((n, n))
    b = np.zeros(n)
    info = {}

    def frac(z0, z1, j):       # fracción de la rebanada j cubierta por [z0, z1]
        lo, hi = j * dz, (j + 1) * dz
        return max(0.0, min(hi, z1) - max(lo, z0)) / dz

    jb = int(p.z_band / dz + 0.5)                 # primera rebanada de la zona de componentes
    zk1 = p.zk0 + p.hk
    low_left = [j for j in range(N) if (j + 1) * dz <= 0.150 + 1e-6]   # hueco del cajón de pajitas en el lateral izquierdo

    def link(i, j, G):
        if G <= 0:
            return
        a, c = ix[i], ix[j]
        A[a, a] += G; A[c, c] += G; A[a, c] -= G; A[c, a] -= G

    def amb(i, G, Text=None):
        a = ix[i]
        A[a, a] += G
        b[a] += G * (Ta if Text is None else Text)

    t = lambda nme: T[ix[nme]]
    forzado = p.Q_fan > 0 and on
    fm = p.f_mezcla if forzado else 1.0
    # ---------------- fuentes
    if on:
        b[ix["Psu"]] += p.P_psu
        b[ix["Scr"]] += p.P_scr
        b[ix["Tc"]] += p.P_rest
        b[ix["Ti"]] += p.P_fans
        if p.sigma:
            b[ix["Sig"]] += p.P_sig
    # ---------------- interior: componentes ↔ aire
    link("Tc", "Ti", p.h_cc * fm * p.A_c)
    link("Scr", "Ti", p.h_cc * fm * p.A_scr)
    link("Psu", "Ti", 0.8 * p.h_cc * fm * p.A_psu)
    link("Psu", "Kb", p.G_psu_kb)
    if p.sigma:                # cuerpo del terminal ↔ aire del cajón
        link("Sig", "Ti", p.A_sig_in / (p.R_sig + 1 / (p.h_cc * fm)))
    # ---------------- interior: aire ↔ paredes del cajón y tapa interior
    Aw = dict(Kf=p.wk * p.hk - p.win_scr[2] * (p.win_scr[1] - p.win_scr[0]) - p.A_hueco_cobro,
              Kl=p.dk * p.hk, Kr=p.dk * p.hk, Kb=p.wk * p.hk * 0.72, Kbase=p.wk * p.dk * 0.63,
              Tin=(p.W - 2 * p.t_s) * (p.D - 2 * p.t_s))
    Asum = sum(Aw.values())
    for w, a_ in Aw.items():
        link("Ti", w, p.h_aw * fm * (1.2 if w == "Tin" else 1.0) * a_)
        sh = a_ / Asum          # radiación de los componentes, la pantalla y la caja de red a cada pared (reparto por área)
        link("Tc", w, sh * p.A_c * h_rad(p.e_c, p.e_k, t("Tc"), t(w), p.F_rad))
        link("Scr", w, sh * p.A_scr * h_rad(p.e_c, p.e_k, t("Scr"), t(w), p.F_rad))
        link("Psu", w, sh * p.A_psu * h_rad(p.e_k, p.e_k, t("Psu"), t(w), p.F_rad))
        if p.sigma:
            link("Sig", w, sh * p.A_sig_in * h_rad(p.e_c, p.e_k, t("Sig"), t(w), p.F_rad))
    # conducción entre caras del cajón (1,5 mm)
    kt = p.k_s * p.t_k
    Ldk = (p.dk + p.wk) / 2
    for a_, c_ in (("Kl", "Kb"), ("Kr", "Kb"), ("Kl", "Kf"), ("Kr", "Kf")):
        link(a_, c_, p.eta_sold * kt * p.hk / Ldk)
    link("Kbase", "Kl", kt * p.dk / ((p.wk + p.hk) / 2)); link("Kbase", "Kr", kt * p.dk / ((p.wk + p.hk) / 2))
    link("Kbase", "Kf", p.eta_sold * kt * p.wk / ((p.dk + p.hk) / 2)); link("Kbase", "Kb", p.eta_sold * kt * p.wk / ((p.dk + p.hk) / 2))
    # ---------------- frente: ventanas (pantalla y Solo) → doble policarbonato → ambiente
    TmF = np.mean([t(f"F{j}") for j in range(N)])
    hcF = p.f_aire * h_vertical(TmF - Ta, p.Hw, (TmF + Ta) / 2)
    ka = aire((t("Scr") + Ta) / 2)[0]
    Rg1 = 1 / (p.nu_gap * ka / 0.004 + h_rad(p.e_c, p.e_ext, t("Scr"), (t("Scr") + Ta) / 2))
    Rg2 = 1 / (ka / p.t_s + h_rad(p.e_ext, p.e_ext, (t("Scr") + Ta) / 2, Ta + 3))
    ho_pc = hcF + h_rad(p.e_ext, 1.0, Ta + 4, Ta)
    Uwin = 1 / (Rg1 + p.t_pc / p.k_pc + Rg2 + p.t_pc / p.k_pc + 1 / ho_pc)
    Awin_s = p.win_scr[2] * (p.win_scr[1] - p.win_scr[0])
    amb("Scr", Uwin * Awin_s)
    if p.sigma:                # la cara del terminal da al bar: sin policarbonato delante
        G_sig_out = p.A_sig_out / (p.R_sig + 1 / ho_pc)
        amb("Sig", G_sig_out)
        info["G_sig_out"] = G_sig_out
    else:
        amb("Tc", Uwin * 0.081 ** 2)
    if p.q_sol > 0:            # sol que entra por las ventanas y lo absorben la pantalla (negra) y el lector
        b[ix["Scr"]] += p.q_sol * Awin_s
        if p.sigma:
            b[ix["Sig"]] += p.q_sol * p.A_sig_out * p.a_sig_sol
        else:
            b[ix["Tc"]] += p.q_sol * 0.081 ** 2 * 0.5
    info["Uwin"] = Uwin
    # ---------------- cajón ↔ carcasa por los huecos
    for j in range(N):
        o = frac(p.zk0, zk1, j) * dz           # solape en altura (m)
        if o <= 0:
            continue
        for kf, sf, gap, wdt in (("Kl", "L", p.g_izq, p.dk), ("Kr", "R", p.g_der, p.dk), ("Kb", "B", p.g_tras, p.wk)):
            tk_, ts_ = t(kf), t(f"{sf}{j}")
            ka = aire((tk_ + ts_) / 2)[0]
            h = p.nu_gap * ka / gap + h_rad(p.e_k, p.e_si, tk_, ts_)
            link(kf, f"{sf}{j}", h * wdt * o)
        phi = (frac(p.win_scr[0], p.win_scr[1], j) * p.win_scr[2] + frac(p.win_cobro[0], p.win_cobro[1], j) * min(p.win_cobro[2], p.hueco_sigma[0] if p.sigma else 1.0)) / p.wk
        tk_, ts_ = t("Kf"), t(f"F{j}")
        ka = aire((tk_ + ts_) / 2)[0]
        R = 1 / (p.nu_gap * ka / p.g_fr_aire + h_rad(p.e_k, p.e_ext, tk_, ts_)) + p.t_pc / p.k_pc
        link("Kf", f"F{j}", p.wk * o * (1 - min(phi, 0.95)) / R)
    ka = aire((t("Kbase") + t("Band")) / 2)[0]
    link("Kbase", "Band", (ka / p.g_base + h_rad(p.e_k, p.e_si, t("Kbase"), t("Band"))) * p.wk * p.dk)
    At = Aw["Tin"]
    hcav = h_cavidad_horizontal(t("Tin") - t("Roof"), p.g_techo, (t("Tin") + t("Roof")) / 2)
    link("Tin", "Roof", (hcav + h_rad(p.e_k, p.e_si, t("Tin"), t("Roof"))) * At)
    link("Tin", f"F{N-1}", p.G_tin_ct / 2); link("Tin", f"B{N-1}", p.G_tin_ct / 2)
    # ---------------- conducción en la carcasa (3 mm)
    ks = p.k_s * p.t_s
    wface = dict(F=p.W, B=p.W, L=p.D, R=p.D)
    for f in "FLRB":
        for j in range(N - 1):
            w_ = wface[f]
            if f == "L" and (j in low_left or (j + 1) in low_left):
                w_ = 0.018                  # sólo queda la franja delantera junto al hueco del cajón de pajitas
            link(f"{f}{j}", f"{f}{j+1}", ks * w_ / dz)
    Ld = (p.W + p.D) / 2
    for j in range(N):
        if j not in low_left:
            link(f"L{j}", f"B{j}", ks * dz / Ld)
        link(f"R{j}", f"B{j}", ks * dz / Ld)
        link(f"F{j}", f"L{j}", p.eta_sold * ks * dz / Ld)
        link(f"F{j}", f"R{j}", p.eta_sold * ks * dz / Ld)
    link("Floor", "B0", ks * p.W / (p.D / 2 + dz / 2)); link("Floor", "R0", ks * p.D / (p.W / 2 + dz / 2))
    link("Floor", "F0", p.eta_sold * ks * p.W / (p.D / 2 + dz / 2))
    link("Band", f"F{jb}", p.eta_sold * ks * p.W / (p.D / 4)); link("Band", f"B{jb}", p.eta_sold * ks * p.W / (p.D / 4))
    link("Band", f"L{jb}", p.eta_sold * ks * p.D / (p.W / 4)); link("Band", f"R{jb}", p.eta_sold * ks * p.D / (p.W / 4))
    for f in "FLRB":
        link("Roof", f"{f}{N-1}", p.G_tapa_ct / 4)
    # ---------------- carcasa ↔ ambiente
    Aback = p.W * p.Hw
    for f in "FLR":
        Tm = np.mean([t(f"{f}{j}") for j in range(N)])
        hc = p.f_aire * h_vertical(Tm - Ta, p.Hw, (Tm + Ta) / 2)
        for j in range(N):
            ts_ = t(f"{f}{j}")
            ho = hc + h_rad(p.e_ext, 1.0, ts_, Ta)
            a_ = wface[f] * dz
            if f == "L" and j in low_left:
                a_ = 0.018 * dz
            if f == "F":
                pcf = frac(p.pc_z[0], p.pc_z[1], j)
                phi = (frac(p.win_scr[0], p.win_scr[1], j) * p.win_scr[2] + frac(p.win_cobro[0], p.win_cobro[1], j) * p.win_cobro[2]) / p.W
                G = a_ * (1 - pcf) * ho + a_ * max(pcf - phi, 0) / (p.t_pc / p.k_pc + 1 / ho)
                a_sol = a_ * (1 - phi)
            else:
                G = a_ / (1 / ho + p.R_funda)
                a_sol = a_
            amb(f"{f}{j}", G)
            if p.q_sol > 0 and f in "FL":
                b[ix[f"{f}{j}"]] += p.q_sol * a_sol
    for j in range(N):
        amb(f"B{j}", p.W * dz / (1 / p.h_ct + Aback / p.G_pared))
    Lc = p.W * p.D / (2 * (p.W + p.D))
    tr = t("Roof")
    ho = p.f_aire * h_horizontal(tr - Ta, Lc, (tr + Ta) / 2, True) + h_rad(p.e_ext, 1.0, tr, Ta)
    amb("Roof", 1.15 * p.W * p.D / (1 / ho + p.R_funda))
    tfl = t("Floor")
    ho = p.f_aire * h_horizontal(tfl - Ta, Lc, (tfl + Ta) / 2, False) + h_rad(p.e_ext, 1.0, tfl, Ta)
    amb("Floor", p.W * p.D * ho)
    # ---------------- ventilación
    dTi = t("Ti") - Ta
    rho, cp = aire(Ta + dTi / 2)[3], 1006.0
    if forzado:
        Qn, Gv = 0.0, rho * cp * p.Q_fan / 3600.0          # mezcla perfecta: el aire sale a Ti
    else:
        Qn = caudal_natural(p, p.c_top * dTi * 0.85)       # la columna entre entrada y salida va algo más fría que arriba
        Gv = rho * cp * Qn * p.c_top                       # el aire sale por arriba, a la temperatura de arriba
    amb("Ti", Gv)
    info.update(Q_nat=Qn * 3600, G_vent=Gv)
    return A, b, info


def resolver(p, detalle=False, T0=None, itmax=400):
    """Estado estacionario. Devuelve dict con temperaturas (°C)."""
    names, ix = _nodos(p)
    n = len(names)
    Ta = p.Ta
    T = np.full(n, Ta + 10.0) if T0 is None else T0.copy()
    for it in range(itmax):
        A, b, info = ensamblar(p, T, ix)
        Tn = np.linalg.solve(A, b)
        err = np.max(np.abs(Tn - T))
        T = 0.5 * T + 0.5 * Tn
        if err < 1e-5:
            break
    A, b, info = ensamblar(p, T, ix)
    res = {nme: T[i] for nme, i in ix.items()}
    dT = res["Ti"] - Ta
    res.update(dT=dT, G_tot=p.P_tot / dT if dT > 0 else np.nan, iters=it, **info)
    res["P_vent"] = info["G_vent"] * dT
    res["T_top"] = Ta + (p.c_top if p.Q_fan <= 0 else 1.0) * dT
    res["P_win"] = info["Uwin"] * (p.win_scr[2] * (p.win_scr[1] - p.win_scr[0]) * (res["Scr"] - Ta) + (0.0 if p.sigma else 0.081 ** 2 * (res["Tc"] - Ta)))
    res["P_sig_out"] = info["G_sig_out"] * (res["Sig"] - Ta) if p.sigma else 0.0      # lo que el terminal echa al bar por su cara
    if detalle:
        res["_T"], res["_ix"], res["_names"] = T, ix, names
        res["_zc"] = (np.arange(p.N) + 0.5) * p.Hw / p.N
        res["_A"], res["_b"] = A, b
    return res


def capacidades(p, ix):
    """Capacidad térmica de cada nodo (J/K)."""
    N, dz = p.N, p.Hw / p.N
    rc_s, rc_pc = 7850 * 480.0, 1200 * 1170.0
    C = np.zeros(len(ix))
    C[ix["Ti"]] = 25.0
    C[ix["Tc"]] = 400.0 if p.sigma else 430.0     # Pi, módem, sensor, cables y bornes (y el Solo si lo hay)
    if p.sigma:
        C[ix["Sig"]] = 450.0     # terminal de 0,49 kg
    C[ix["Scr"]] = 200.0
    C[ix["Psu"]] = 280.0         # fuente (0,23 kg) y caja de red
    Aw = dict(Kf=0.0254, Kl=p.dk * p.hk, Kr=p.dk * p.hk, Kb=p.wk * p.hk, Kbase=p.wk * p.dk, Tin=0.0201)
    for k_, a_ in Aw.items():
        C[ix[k_]] = rc_s * p.t_k * a_
    for f, w_ in (("F", p.W), ("B", p.W), ("L", p.D), ("R", p.D)):
        for j in range(N):
            C[ix[f"{f}{j}"]] = rc_s * p.t_s * w_ * dz
            if f == "F":
                lo, hi = j * dz, (j + 1) * dz
                o = max(0.0, min(hi, p.pc_z[1]) - max(lo, p.pc_z[0]))
                C[ix[f"F{j}"]] += rc_pc * 2 * p.t_pc * p.W * o
    C[ix["Roof"]] = rc_s * p.t_s * p.W * p.D * 1.3
    C[ix["Floor"]] = rc_s * p.t_s * p.W * p.D
    C[ix["Band"]] = rc_s * p.t_s * p.W * p.D * 1.2
    return C


def transitorio(p_de_t, t_fin, dt=60.0, T_ini=None, on_de_t=None):
    """Integra en el tiempo (Euler implícito, conductancias evaluadas al principio de cada paso).
    p_de_t(t) devuelve los parámetros en el instante t (s); on_de_t(t) si la máquina está encendida."""
    p0 = p_de_t(0.0)
    names, ix = _nodos(p0)
    C = capacidades(p0, ix)
    T = np.full(len(names), p0.Ta) if T_ini is None else T_ini.copy()
    ts, hist = [0.0], [T.copy()]
    t = 0.0
    while t < t_fin - 1e-9:
        p = p_de_t(t)
        on = True if on_de_t is None else on_de_t(t)
        A, b, _ = ensamblar(p, T, ix, on=on)
        M = A + np.diag(C / dt)
        T = np.linalg.solve(M, b + C / dt * T)
        t += dt
        ts.append(t); hist.append(T.copy())
    return np.array(ts), np.array(hist), ix




def caminos(p, r):
    """Reparto de la potencia por camino de salida (W)."""
    N, dz, Ta = p.N, p.Hw / p.N, p.Ta
    A, T, ix = r["_A"], r["_T"], r["_ix"]
    # potencia que sale por cada nodo al ambiente = (diag − suma de enlaces)·(T − Ta) − fuentes solares
    out = {}
    for nme, i in ix.items():
        Gamb = A[i].sum()          # la fila suma el término al ambiente (los enlaces internos se cancelan)
        out[nme] = Gamb * (T[i] - Ta)
    grupos = dict(frente=0.0, laterales=0.0, pared=0.0, techo=0.0, suelo=0.0, zona_baja=0.0, ventanas=0.0, terminal=0.0, aire=0.0)
    jb = int(p.z_band / dz + 0.5)
    for nme, q in out.items():
        if nme == "Ti":
            grupos["aire"] += q
        elif nme in ("Scr", "Tc"):
            grupos["ventanas"] += q
        elif nme == "Sig":
            grupos["terminal"] += q
        elif nme == "Roof":
            grupos["techo"] += q
        elif nme == "Floor":
            grupos["suelo"] += q
        elif nme[0] in "FLRB" and nme[1:].isdigit():
            j = int(nme[1:])
            if j < jb and nme[0] != "B":
                grupos["zona_baja"] += q
            elif nme[0] == "F":
                grupos["frente"] += q
            elif nme[0] == "B":
                grupos["pared"] += q
            else:
                grupos["laterales"] += q
    return grupos


if __name__ == "__main__":
    p = P()
    r = resolver(p, detalle=True)
    print(f"P = {p.P_tot:.1f} W  Ta = {p.Ta} °C  → aire medio +{r['dT']:.1f} K, arriba +{r['T_top']-p.Ta:.1f} K, G = {r['G_tot']:.2f} W/K, iters {r['iters']}")
    for k in ("Ti", "Tc", "Scr", "Psu", "Kf", "Kl", "Kr", "Kb", "Kbase", "Tin", "Roof", "Floor", "Band") + (("Sig",) if p.sigma else ()):
        print(f"  {k:6s} {r[k]:6.1f} °C  (+{r[k]-p.Ta:5.1f})")
    for f in "FLRB":
        print("  ", f, " ".join(f"{r[f'{f}{j}']-p.Ta:5.1f}" for j in range(p.N)))
    print("  tiro natural:", f"{r['Q_nat']:.2f} m³/h, {r['P_vent']:.2f} W; ventanas {r['P_win']:.2f} W; Uwin {r['Uwin']:.2f}")
    g = caminos(p, r)
    print("  caminos:", {k: round(v, 2) for k, v in g.items()}, "suma", round(sum(g.values()), 2))
