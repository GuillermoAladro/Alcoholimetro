import json, numpy as np
from estilo import *
from estilo import _radios as rad
R = json.load(open("../resultados/resultados.json"))
C = R["conf"]

# ---------------------------------------------------------------- ventilador: curva y sistema
Q = np.linspace(0, 8.2, 100)
Pmax = 1.78 * 9.80665
A_o = np.pi * 0.038 ** 2 / 4
fig, axs = plt.subplots(1, 2, figsize=(6.7, 3.0), gridspec_kw=dict(wspace=0.30))
ax = axs[0]
ax.plot(Q, Pmax * (1 - Q / 8.2), color=S4, label="1 ventilador 40 × 10", zorder=3)
ax.plot(Q, 2 * Pmax * (1 - Q / 8.2), color=S3, label="2 en serie (uno mete, otro saca)", zorder=3)
for K, col, lab, xy, off in ((5, SEQ[3], "K = 5", (7.5, 5.6), (0, 0)), (14, SEQ[6], "K = 14", (7.5, 17.6), (0, 0)), (40, SEQ[10], "K = 40", (5.05, 35.2), (-5, 0))):
    ps = K * 1.15 / 2 * (Q / 3600 / A_o) ** 2
    ax.plot(Q, ps, color=col, lw=1.3, zorder=2)
    ax.annotate(lab, xy, xytext=off, textcoords="offset points", fontsize=7.8, color=INK2, ha="right" if off[0] < 0 else "center", va="bottom")
for n, col in ((1, S4), (2, S3)):
    a = 14 * 1.15 / 2 / (3600 * A_o) ** 2; b = n * Pmax / 8.2; c = -n * Pmax
    q = (-b + np.sqrt(b * b - 4 * a * c)) / (2 * a)
    punto(ax, q, a * q * q, col, ms=7)
    ax.annotate(coma(q) + " m³/h", (q, a * q * q), xytext=(8, 0) if n == 1 else (8, 4), textcoords="offset points", fontsize=8.5, color=INK, va="center", bbox=dict(fc=SURF, ec="none", pad=1))
ax.set_xlim(0, 8.2); ax.set_ylim(0, 36); ax.set_xlabel("Caudal (m³/h)"); ax.set_ylabel("Presión (Pa)")
ax.legend(loc="upper left", bbox_to_anchor=(-0.02, -0.2), ncol=1, handlelength=1.5, labelspacing=0.3)
ax.set_title("Punto de trabajo")
# ΔT frente a caudal
d = np.load("../resultados/curva_Q.npz")
ax = axs[1]
ax.plot(d["Qs"], d["dT"], color=S1, zorder=3)
ax.fill_between(d["Qs"], d["dT"], color=S1, alpha=0.10, lw=0)
marc = [("rejilla actual como salida", R["fan_rejilla"]["Q"], (8, 4)), ("1 × 40 mm", 4.2, (7, 6)), ("2 × 40 mm", 5.2, (2, -26)), ("1 × 60 mm", 14.0, (0, 8))]
for nom, q, off in marc:
    y = R["conf"]["fan60"]["dT"] if q == 14.0 else np.interp(q, d["Qs"], d["dT"])  # el de 60 mm gasta más: usa su propio caso
    punto(ax, q, y, S1, ms=7)
    ax.annotate(f"{nom}\n+{coma(y)} K", (q, y), xytext=off, textcoords="offset points", fontsize=7.8, color=INK, va="bottom", ha="left" if off[0] > 1 else "center", linespacing=1.15)
ax.set_xlim(0, 16); ax.set_ylim(0, 22); ax.set_yticks([0, 5, 10, 15, 20]); ax.set_xlabel("Caudal real de aire (m³/h)"); ax.set_ylabel("Calentamiento del aire que sale (K)")
ax.set_title("Lo que enfría cada caudal (21 W)")
guardar(fig, "f_fan")

# ---------------------------------------------------------------- transitorios
t = np.load("../resultados/trans.npz")
fig, axs = plt.subplots(1, 2, figsize=(6.7, 3.0), sharey=True, gridspec_kw=dict(wspace=0.08))
ax = axs[0]
ax.plot(t["frio_actual_t"], t["frio_actual_solo"], color=S1, label="Sin ventilador", zorder=3)
ax.plot(t["frio_fan2_t"], t["frio_fan2_solo"], color=S3, label="2 ventiladores", zorder=3)
ax.set_xlim(0, 8); ax.set_ylim(20, 66); ax.set_xlabel("Horas desde que se enchufa"); ax.set_ylabel("Aire junto al sensor (°C), bar a 25 °C")
ax.set_title("Arranque en frío")
ax.axhline(40, color=CRIT, lw=1.0, zorder=2); ax.annotate("límite del sensor: 40 °C", (7.9, 40), xytext=(0, 3), textcoords="offset points", ha="right", fontsize=7.8, color=INK2)
ax.annotate("Sin ventilador", (8, t["frio_actual_solo"][-1]), xytext=(-4, -9), textcoords="offset points", ha="right", va="top", fontsize=8, color=INK)
ax.annotate("2 ventiladores", (8, t["frio_fan2_solo"][-1]), xytext=(-4, 5), textcoords="offset points", ha="right", va="bottom", fontsize=8, color=INK)
t40 = R["trans"]["actual_t40"]
punto(ax, t40, 40, S1, ms=7); ax.annotate(f"{int(round(t40 * 60))} min", (t40, 40), xytext=(8, -11), textcoords="offset points", fontsize=8, color=INK)
ax = axs[1]
ax.plot(np.r_[-0.6, t["fallo_t"]], np.r_[t["fallo_solo"][0], t["fallo_solo"]], color=S3, zorder=3)
ax.set_xlim(-0.6, 8); ax.set_xlabel("Horas desde que se paran los dos ventiladores")
t40 = R["trans"]["fallo_t40"]
punto(ax, t40, 40, S3, ms=7); ax.annotate(f"{int(round(t40 * 60))} min", (t40, 40), xytext=(8, -11), textcoords="offset points", fontsize=8, color=INK)
ax.set_title("Avería de la ventilación")
ax.axhline(40, color=CRIT, lw=1.0, zorder=2)
ax.annotate(f"se estabiliza en {coma(R['trans']['fallo_fin'], 0)} °C", (8, t["fallo_solo"][-1]), xytext=(-4, -9), textcoords="offset points", ha="right", va="top", fontsize=8, color=INK)
guardar(fig, "f_trans")

# ---------------------------------------------------------------- curva de reducción de carga de la fuente
fig, ax = plt.subplots(figsize=(6.7, 3.0))
ax.plot([-30, 50, 70, 70], [100, 100, 60, 0], color=INK2, zorder=3, lw=1.7)
ax.fill_between([-30, 50, 70], [100, 100, 60], color=NEUTRO, alpha=0.18, lw=0)
ax.set_xlim(0, 80); ax.set_ylim(0, 110); ax.set_xlabel("Temperatura del aire alrededor de la fuente (°C)"); ax.set_ylabel("Carga admitida (% de 50 W)")
LO, HI = 32, 59            # carga de la LRS-50-12: típica y de pico
ax.annotate("zona admitida por Mean Well (230 V)", (12, 86), fontsize=8, color=INK2)
pts = []
for k in ("actual", "fan2"):
    for Ta in (25, 35):
        x = Ta + C[k]["local"]["fuente"]
        pts.append((k, Ta, x))
for k, Ta, x in pts:
    ax.plot([x, x], [LO, HI], color=C_CONF[k], lw=2.2, zorder=4, solid_capstyle="round")
    punto(ax, x, LO, C_CONF[k], ms=6.5)
    if k == "fan2":
        ax.annotate(f"bar a {Ta} °C", (x, HI), xytext=(0, 5), textcoords="offset points", ha="center", fontsize=7.8, color=INK)
    else:
        ax.annotate(f"bar a {Ta} °C", (x, LO), xytext=(0, -7), textcoords="offset points", ha="center", va="top", fontsize=7.8, color=INK)
ax.plot([], [], color=S1, lw=2.2, label="Sin ventilador: del 32 % (típico) al 59 % (pico)"); ax.plot([], [], color=S3, lw=2.2, label="2 ventiladores")
ax.legend(loc="upper left", handlelength=1.6, bbox_to_anchor=(-0.01, -0.2), ncol=2, columnspacing=2.0)
guardar(fig, "f_fuente")

# ---------------------------------------------------------------- funda y sol
casos = [("base", "Sin funda,\na la sombra"), ("funda2", "Funda de 2 mm\nbien ajustada"), ("funda_tapa", "Funda que tapa\nlas aberturas"), ("sol150", "Sol débil u oblicuo\n(150 W/m²)"), ("sol300", "Sol directo\n(300 W/m²)")]
fig, ax = plt.subplots(figsize=(6.7, 3.1))
ax.set_xlim(-0.6, len(casos) - 0.4); ax.set_ylim(0, 52)
r = rad(ax)
w = 0.26
for i, (kk, nom) in enumerate(casos):
    for j, k in enumerate(("actual", "fan2")):
        v = R["ext"][k][kk]["dT"]
        x = i + (j - 0.5) * (w + 0.04)
        barra_v(ax, x, 0, v, w, C_CONF[k], rx_ry=r)
        ax.annotate("+" + coma(v, 0), (x, v), xytext=(0, 3), textcoords="offset points", ha="center", fontsize=8.2, color=INK)
ax.set_xticks(range(len(casos))); ax.set_xticklabels([c[1] for c in casos], color=INK); ax.grid(axis="x", visible=False)
ax.set_ylabel("Calentamiento medio del aire interior (K)")
ax.plot([], [], color=S1, lw=6, label="Sin ventilador"); ax.plot([], [], color=S3, lw=6, label="2 ventiladores")
ax.legend(loc="upper left", handlelength=1.4, ncol=2)
guardar(fig, "f_ext")
print("ok c")
