"""
figuras.py — figuras del informe a partir de resultados_analisis.json y resultados_opt.json.
Uso: python figuras.py resultados_analisis.json resultados_opt.json CARPETA
"""
import json
import math
import os
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle
import numpy as np

from nucleo import (W, HW, H_TOT, ZONAS, Z_BANDEJA, Z_APOYO, GUIAS, Z_GUIAS, ESPARRAGO, Z_HUECO, ModeloFEM, EXCL_RECT, EXCL_CIRC)
from matplotlib.ticker import FuncFormatter

def dc(v, d=2):
    return f"{v:.{d}f}".replace(".", ",")
from evaluacion import casos_diseno, evaluar

# paleta categórica de referencia (orden fijo) y tinta
COL = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"]
TXT, TXT2, GRID, SURF = "#0b0b0b", "#52514e", "#e4e3df", "#fcfcfb"
SEQ = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#0d366b"]

plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 8.5, "axes.edgecolor": "#9a9993", "axes.labelcolor": TXT2,
                     "xtick.color": TXT2, "ytick.color": TXT2, "axes.grid": True, "grid.color": GRID, "grid.linewidth": 0.6,
                     "axes.spines.top": False, "axes.spines.right": False, "figure.facecolor": "white",
                     "axes.facecolor": "white", "legend.frameon": False, "lines.linewidth": 2})


def dibujar_trasera(ax, pts=None, titulo="", color=COL[0], fuerzas=None, fmax=None, etiquetas=True):
    ax.set_aspect("equal")
    ax.grid(False)
    ax.add_patch(Rectangle((-W / 2, 0), W, HW, fc="#f4f3f0", ec="#6b6a66", lw=1.0, zorder=0))
    for zn in ZONAS:
        ax.add_patch(Rectangle((zn["x"][0], zn["z"][0]), zn["x"][1] - zn["x"][0], max(zn["z"][1] - zn["z"][0], 1.5),
                               fc="#dfeafb", ec="none", zorder=1))
    # márgenes excluidos alrededor de guías y espárrago
    for x0, x1, z0, z1 in EXCL_RECT:
        ax.add_patch(Rectangle((x0, max(z0, ZONAS[1]["z"][0])), x1 - x0, min(z1, ZONAS[1]["z"][1]) - max(z0, ZONAS[1]["z"][0]),
                               fc="#f4f3f0", ec="none", zorder=1.2))
    for cx, cz, r in EXCL_CIRC:
        ax.add_patch(Circle((cx, cz), r, fc="#f4f3f0", ec="none", zorder=1.2))
    # obstáculos
    ax.add_patch(Rectangle((-W / 2, Z_BANDEJA[0]), W, Z_BANDEJA[1] - Z_BANDEJA[0], fc="#b9b8b2", ec="none", zorder=2))
    ax.add_patch(Rectangle((-W / 2 + 4.5, Z_APOYO[0]), W - 9, Z_APOYO[1] - Z_APOYO[0], fc="#b9b8b2", ec="none", zorder=2))
    for x0, x1 in GUIAS:
        ax.add_patch(Rectangle((x0, Z_GUIAS[0]), x1 - x0, Z_GUIAS[1] - Z_GUIAS[0], fc="#b9b8b2", ec="none", zorder=2))
    ax.add_patch(Circle(ESPARRAGO, 4, fc="#6b6a66", zorder=3))
    # líneas rígidas (pliegues y pestaña soldada)
    ax.plot([W / 2, W / 2], [4, HW - 1], color="#3b3a37", lw=2.2, zorder=3)
    ax.plot([-W / 2, -W / 2], [Z_HUECO, HW], color="#3b3a37", lw=2.2, zorder=3)
    ax.plot([-106, 106], [0, 0], color="#3b3a37", lw=2.2, zorder=3)
    ax.plot([-W / 2, -W / 2], [0, Z_HUECO], color="#3b3a37", lw=0.8, ls=(0, (3, 2)), zorder=3)
    if pts is not None:
        P = np.asarray(pts)
        for k, (x, z) in enumerate(P):
            if fuerzas is not None:
                f = fuerzas[k] / fmax
                c = SEQ[min(int(f * (len(SEQ) - 1) + 0.5), len(SEQ) - 1)] if f > 0.02 else "#ffffff"
                ax.add_patch(Circle((x, z), 9, fc=c, ec="#3b3a37", lw=0.6, zorder=4))
                if etiquetas:
                    ax.text(x, z - 15.5, f"{fuerzas[k]:.0f}", ha="center", va="center", fontsize=6.2, color=TXT, zorder=5)
            else:
                ax.add_patch(Circle((x, z), 9, fc=color, ec="white", lw=0.8, zorder=4))
                ax.add_patch(Circle((x, z), 3.25, fc="white", ec="none", zorder=5))
    ax.set_xlim(-W / 2 - 12, W / 2 + 12)
    ax.set_ylim(-12, H_TOT + 12)
    ax.set_xticks([-110, -55, 0, 55, 110])
    ax.set_yticks([0, 100, 200, 300, 400])
    ax.tick_params(labelsize=6.5)
    ax.set_title(titulo, fontsize=8.5, color=TXT, loc="left")


def fig_patrones(A, carpeta, orden):
    fig, axs = plt.subplots(1, len(orden), figsize=(7.2, 4.6), sharey=True)
    for k, (ax, nom) in enumerate(zip(axs, orden)):
        r = A[nom]
        dibujar_trasera(ax, r["pts"], f"{nom}\n{r['n']} tornillos · λ = {dc(r['lam'])}", COL[k])
    axs[0].set_ylabel("z (mm desde la base)")
    for ax in axs:
        ax.set_xlabel("x (mm)")
    fig.text(0.01, 0.005, "Azul claro: zona admisible para el centro del agujero. Gris: bandeja soldada, apoyo de la tapa interior, guías y espárrago. "
             "Trazo grueso: pliegues/uniones rígidas;\ndiscontinuo: canto libre (sin lateral bajo z = 150). Círculos = arandela Ø18 a escala. "
             "λ = factor de carga (hormigón) de la envolvente de diseño.", fontsize=6.3, color=TXT2)
    fig.tight_layout(rect=(0, 0.06, 1, 1))
    fig.savefig(os.path.join(carpeta, "fig1_patrones.png"), dpi=220)
    plt.close(fig)


def fig_fuerzas(A, carpeta, orden, caso="Tirón normal 500 N TR"):
    fig, axs = plt.subplots(1, len(orden), figsize=(7.2, 4.6), sharey=True)
    fm = 0
    for nom in orden:
        e = [o for o in A[nom]["envolvente"] if o["caso"] == caso][0]
        fm = max(fm, max(e["N"]))
    for ax, nom in zip(axs, orden):
        e = [o for o in A[nom]["envolvente"] if o["caso"] == caso][0]
        dibujar_trasera(ax, A[nom]["pts"], f"{nom}\nmáx. {max(e['N']):.0f} N · ΣN = {sum(e['N']):.0f} N",
                        fuerzas=e["N"], fmax=fm)
    axs[0].set_ylabel("z (mm)")
    fig.text(0.01, 0.005, "Tracción por tornillo (N), tirón normal de 500 N en la esquina superior derecha + peso propio de 15 kg; FEM 10 mm "
             "con arandela,\npeor de borde apoyado/empotrado. Mismo color en los cuatro: blanco = sin tracción, azul oscuro = más carga. "
             "ΣN > 500 N por el efecto palanca.", fontsize=6.3, color=TXT2)
    fig.tight_layout(rect=(0, 0.06, 1, 1))
    fig.savefig(os.path.join(carpeta, "fig2_fuerzas.png"), dpi=220)
    plt.close(fig)


def fig_lambda_n(O, A, carpeta, orden):
    fig, ax = plt.subplots(figsize=(6.6, 3.0))
    ns = sorted(set(r["n"] for r in O))
    libre = [max([r["lam"] for r in O if r["n"] == n and not r["sim"]] or [np.nan]) for n in ns]
    sim = [max([r["lam"] for r in O if r["n"] == n and r["sim"]] or [np.nan]) for n in ns]
    peor = [min([r["lam"] for r in O if r["n"] == n and not r["sim"]] or [np.nan]) for n in ns]
    ax.plot(ns, libre, color=COL[3], marker="o", ms=4.5, label="Optimizado libre (mejor arranque)")
    ax.plot(ns, sim, color=COL[0], marker="s", ms=4.5, label="Optimizado simétrico")
    ax.fill_between(ns, peor, libre, color=COL[3], alpha=0.15, lw=0, label="Dispersión entre arranques (libre)")
    for k, nom in enumerate(orden[:3]):
        r = A[nom]
        ax.plot([r["n"]], [r["lam_rapido"]], marker="D", ms=6, color=COL[k], ls="none", label=f"{nom}")
    ax.set_xlabel("número de tornillos")
    ax.set_ylabel("λ (malla 20 mm, hormigón)")
    ax.set_xticks(ns)
    ax.legend(fontsize=6.6, loc="upper left", ncol=2)
    fig.tight_layout()
    fig.savefig(os.path.join(carpeta, "fig3_lambda_n.png"), dpi=220)
    plt.close(fig)


def fig_tirones(A, carpeta, orden):
    fig, axs = plt.subplots(1, 2, figsize=(7.0, 2.9), sharey=True)
    for ax, k in zip(axs, ("TL", "TR")):
        for i, nom in enumerate(orden):
            d = A[nom]["escenarios"][f"normal_{k}"]
            ax.plot([a for a, _ in d], [o["Fmax"] for _, o in d], color=COL[i], marker="o", ms=4, label=nom)
        for fr, lab in ((400, "HLz 12 / AAC 4"), (300, "bloque hueco")):
            ax.axhline(fr, color="#9a9993", lw=0.8, ls=(0, (4, 3)))
            ax.text(105, fr + 8, f"F_rec {lab} = {fr:.0f} N", fontsize=6, color=TXT2)
        ax.set_title(f"Tirón normal en la esquina superior {'izquierda' if k == 'TL' else 'derecha'}", fontsize=8, loc="left")
        ax.set_xlabel("tirón (N), con peso propio 15 kg")
    axs[0].set_ylabel("fuerza máx. en un tornillo (N)")
    axs[0].legend(fontsize=6.5)
    fig.tight_layout()
    fig.savefig(os.path.join(carpeta, "fig4_tirones.png"), dpi=220)
    plt.close(fig)


def fig_verticales(A, carpeta, orden):
    fig, axs = plt.subplots(1, 2, figsize=(7.0, 2.9), sharey=True)
    for ax, k, t in zip(axs, ("vertical_cg", "vertical_frente"),
                        ("Carga vertical total en el CdG (n = 55 mm)", "15 kg propios + carga en el borde delantero")):
        for i, nom in enumerate(orden):
            d = A[nom]["escenarios"][k]
            ax.plot([a for a, _ in d], [o["Fmax"] for _, o in d], color=COL[i], marker="o", ms=4, label=nom)
        ax.set_title(t, fontsize=8, loc="left")
        ax.set_xlabel("masa (kg) → fuerza = m·9,81 N")
    axs[0].set_ylabel("fuerza máx. en un tornillo (N)")
    axs[0].legend(fontsize=6.5)
    fig.tight_layout()
    fig.savefig(os.path.join(carpeta, "fig5_verticales.png"), dpi=220)
    plt.close(fig)


def fig_perdidas(A, carpeta, orden):
    fig, ax = plt.subplots(figsize=(7.0, 2.8))
    ks = [1, 2, 4, 6]
    wbar = 0.19
    for i, nom in enumerate(orden):
        p = A[nom]["perdidas"]
        vals = [p[f"menos_{k}"]["peor_rel"] * 100 for k in ks]
        med = [p[f"menos_{k}"]["med"] * 100 for k in ks]
        xs = np.arange(len(ks)) + (i - 1.5) * (wbar + 0.02)
        ax.bar(xs, vals, width=wbar, color=COL[i], label=f"{nom} (peor caso)")
        ax.scatter(xs, med, s=14, color="white", edgecolor=TXT, zorder=5, lw=0.8)
        for x, v in zip(xs, vals):
            ax.text(x, v + 1.5, f"{v:.0f}", ha="center", fontsize=5.8, color=TXT)
    ax.scatter([], [], s=14, color="white", edgecolor=TXT, label="mediana de pérdidas al azar")
    ax.set_xticks(np.arange(len(ks)))
    ax.set_xticklabels([f"faltan {k}" for k in ks])
    ax.set_ylabel("capacidad restante (% de la propia intacta)")
    ax.set_ylim(0, 115)
    ax.legend(fontsize=6.2, ncol=3, loc="upper right")
    fig.tight_layout()
    fig.savefig(os.path.join(carpeta, "fig6_perdidas.png"), dpi=220)
    plt.close(fig)


def fig_paredes(A, carpeta, orden, accion="Tirón normal TR"):
    paredes = list(A[orden[0]]["admisibles"].keys())
    fig, ax = plt.subplots(figsize=(7.0, 3.6))
    hb = 0.19
    for i, nom in enumerate(orden):
        vals = [A[nom]["admisibles"][p][accion] for p in paredes]
        ys = np.arange(len(paredes)) + (i - 1.5) * (hb + 0.01)
        ax.barh(ys, vals, height=hb, color=COL[i], label=nom)
    ax.set_yticks(np.arange(len(paredes)))
    ax.set_yticklabels(paredes, fontsize=6.8)
    ax.invert_yaxis()
    ax.set_xlabel("tirón admisible por los tacos (N), esquina sup. dcha., con peso propio")
    ax.legend(fontsize=6.5, loc="lower right")
    fig.tight_layout()
    fig.savefig(os.path.join(carpeta, "fig7_paredes.png"), dpi=220)
    plt.close(fig)


def fig_convergencia(A, carpeta, orden):
    fig, ax = plt.subplots(figsize=(6.6, 2.7))
    for i, nom in enumerate(orden):
        cv = A[nom]["convergencia"]
        hs = [c["h"] for c in cv]
        ax.plot(hs, [c["apoyado"] for c in cv], color=COL[i], marker="o", ms=4, label=f"{nom} · apoyado")
        ax.plot(hs, [c["empotrado"] for c in cv], color=COL[i], marker="s", ms=3.5, ls=(0, (3, 2)), lw=1.4,
                label=f"{nom} · empotrado")
    ax.set_xscale("log", base=2)
    ax.set_xticks([2.5, 5, 10, 20])
    ax.set_xticklabels(["2,5", "5", "10", "20"])
    ax.invert_xaxis()
    ax.set_xlabel("tamaño de elemento (mm)")
    ax.set_ylabel("F máx. caso gobernante (N)")
    ax.legend(fontsize=5.8, ncol=2)
    fig.tight_layout()
    fig.savefig(os.path.join(carpeta, "fig8_convergencia.png"), dpi=220)
    plt.close(fig)


def fig_deformada(A, carpeta, noms, caso="Tirón normal 500 N TR"):
    fig, axs = plt.subplots(1, len(noms), figsize=(5.6, 4.6), sharey=True)
    cs = [c for c in casos_diseno() if c["nombre"] == caso]
    vmax = 0
    datos = []
    for nom in noms:
        m = ModeloFEM(h=5.0, arandela=True)
        m.preparar(A[nom]["pts"])
        r = m.resolver(cs[0]["Q"])
        Wm = r["w"].reshape(m.nz, m.nx)
        datos.append((m, Wm))
        vmax = max(vmax, np.abs(Wm).max())
    lev = np.linspace(-vmax, vmax, 23)
    for ax, nom, (m, Wm) in zip(axs, noms, datos):
        dibujar_trasera(ax, None, f"{nom}\nseparación máx. {dc(Wm.max())} mm")
        cf = ax.contourf(m.xs, m.zs, Wm, levels=lev, cmap="RdBu_r", zorder=1.5, alpha=0.9)
        P = np.asarray(A[nom]["pts"])
        ax.scatter(P[:, 0], P[:, 1], s=22, facecolor="none", edgecolor=TXT, lw=0.8, zorder=6)
    cb = fig.colorbar(cf, ax=axs, shrink=0.8, label="w (mm): + se separa · − aprieta")
    tk = np.round(np.linspace(-vmax, vmax, 7), 2)
    cb.set_ticks(tk)
    cb.ax.yaxis.set_major_formatter(FuncFormatter(lambda v, p: dc(v)))
    cb.ax.tick_params(labelsize=6.5)
    fig.savefig(os.path.join(carpeta, "fig9_deformada.png"), dpi=220, bbox_inches="tight")
    plt.close(fig)


if __name__ == "__main__":
    A = json.load(open(sys.argv[1]))
    O = json.load(open(sys.argv[2]))
    carpeta = sys.argv[3]
    os.makedirs(carpeta, exist_ok=True)
    orden = list(A.keys())
    fig_patrones(A, carpeta, orden)
    fig_fuerzas(A, carpeta, orden)
    fig_lambda_n(O, A, carpeta, orden)
    fig_tirones(A, carpeta, orden)
    fig_verticales(A, carpeta, orden)
    fig_perdidas(A, carpeta, orden)
    fig_paredes(A, carpeta, orden)
    fig_convergencia(A, carpeta, orden)
    fig_deformada(A, carpeta, [orden[0], orden[-1]])
    print("ok")
