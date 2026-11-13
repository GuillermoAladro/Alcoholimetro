import json, numpy as np
from estilo import *
from estilo import _radios as rad
from matplotlib.colors import LinearSegmentedColormap
R = json.load(open("../resultados/resultados.json"))
C = R["conf"]

# ---------------------------------------------------------------- escalera de temperaturas (de fuera a dentro)
est = ["Aire\ndel bar", "Chapa exterior\nde la carcasa", "Chapa del cajón\nde componentes", "Aire interior\n(media)", "Aire junto\nal Solo"]
fig, ax = plt.subplots(figsize=(6.7, 3.4))
x = np.arange(5)
for k in ("actual", "pintado", "fan2"):
    y = R["escalera"][k]
    ax.plot(x, y, color=C_CONF[k], zorder=3, label=N_CONF[k])
    for xi, yi in zip(x, y):
        punto(ax, xi, yi, C_CONF[k])
    dy = {"actual": 9, "pintado": -13, "fan2": 9}[k]
    ax.annotate("+" + coma(y[-1], 0) + " K", (4, y[-1]), xytext=(9, 0), textcoords="offset points", va="center", fontsize=8.5, color=INK)
ax.set_xticks(x); ax.set_xticklabels(est, color=INK); ax.set_xlim(-0.3, 4.55); ax.set_ylim(0, 36)
ax.set_ylabel("Calentamiento sobre el aire del bar (K)"); ax.grid(axis="x", visible=False)
ax.axhline(15, color=CRIT, lw=1.0, zorder=2)
ax.annotate("Máximo junto al Solo con el bar a 25 °C", (4.5, 15), xytext=(0, 3), textcoords="offset points", fontsize=8, color=INK2, ha="right", va="bottom")
ax.legend(loc="upper left", ncol=1, handlelength=1.8, bbox_to_anchor=(0.0, 1.0))
guardar(fig, "f_escalera")

# ---------------------------------------------------------------- mapa de la carcasa (calentamiento por cara y altura)
m = C["actual"]["mapa"]
N = len(m["F"])
dz = 439.5 / N
caras = [("F", "Frente"), ("L", "Lateral\nizquierdo"), ("R", "Lateral\nderecho"), ("B", "Trasera\n(pared)")]
Z = np.array([m[c] for c, _ in caras]).T          # filas = altura
cm = LinearSegmentedColormap.from_list("azul", SEQ)
fig, ax = plt.subplots(figsize=(3.6, 4.2))
im = ax.imshow(Z, origin="lower", aspect="auto", cmap=cm, vmin=0, vmax=10, extent=(-0.5, 3.5, 0, 439.5))
for i in range(1, 4):
    ax.axvline(i - 0.5, color=SURF, lw=2)
for j in range(1, N):
    ax.axhline(j * dz, color=SURF, lw=2)
ax.set_xticks(range(4)); ax.set_xticklabels([c[1] for c in caras], color=INK); ax.xaxis.tick_top()
ax.set_ylabel("Altura desde la base (mm)"); ax.grid(False)
ax.set_yticks([0, 100, 200, 300, 400])
jmax = np.unravel_index(np.argmax(Z), Z.shape); jmin = np.unravel_index(np.argmin(Z), Z.shape)
for (j, i), col in ((jmax, "#ffffff"), (jmin, INK)):
    ax.text(i, (j + 0.5) * dz, "+" + coma(Z[j, i]) + " K", ha="center", va="center", fontsize=8, color=col)
ax.axhline(160.5, color=INK2, lw=0.8); ax.annotate("bandeja", (3.5, 160.5), xytext=(4, 0), textcoords="offset points", fontsize=7.5, color=INK2, va="center", annotation_clip=False)
cb = fig.colorbar(im, ax=ax, orientation="horizontal", fraction=0.045, pad=0.04, aspect=30)
cb.set_label("Calentamiento de la chapa sobre el bar (K)", fontsize=8); cb.outline.set_visible(False); cb.ax.tick_params(length=0, labelsize=8)
guardar(fig, "f_mapa")

# ---------------------------------------------------------------- por dónde sale el calor
orden = [("laterales", "Laterales de la carcasa"), ("ventanas", "Ventanas del frente (doble policarbonato)"), ("aire", "Aire: rejillas o ventilador"), ("pared", "Trasera, hacia la pared"),
         ("frente", "Panel frontal (marco de acero)"), ("zona_baja", "Zona del cajón de pajitas"), ("techo", "Tapa"), ("suelo", "Suelo")]
fig, axs = plt.subplots(1, 2, figsize=(6.7, 2.9), sharey=True, gridspec_kw=dict(wspace=0.08))
for ax, k in zip(axs, ("actual", "fan2")):
    ax.set_xlim(0, 12.5); ax.set_ylim(-0.6, len(orden) - 0.4); ax.invert_yaxis()
    r = rad(ax)
    for i, (kk, nom) in enumerate(orden):
        v = C[k]["caminos"][kk]
        barra_h(ax, i, 0, v, 0.46, C_CONF[k], rx_ry=r)
        ax.annotate(coma(v) + " W", (v, i), xytext=(5, 0), textcoords="offset points", va="center", fontsize=8.5, color=INK)
    ax.set_title(f"{N_CONF[k]} · {coma(C[k]['P'])} W"); ax.grid(axis="y", visible=False); ax.set_xlabel("Potencia evacuada (W)")
    ax.set_yticks(range(len(orden))); ax.set_yticklabels([o[1] for o in orden], color=INK)
guardar(fig, "f_caminos")

# ---------------------------------------------------------------- ΔT junto al Solo frente a potencia
d = np.load("../resultados/curvas_P.npz")
Ps = d["Ps"]
fig, ax = plt.subplots(figsize=(6.7, 3.5))
for k in ("actual", "pintado", "fan1", "fan2"):
    ax.plot(Ps, d[k][:, 1], color=C_CONF[k], label=N_CONF[k], zorder=3)
ax.set_xlim(8, 24); ax.set_ylim(0, 50); ax.set_xlabel("Potencia total disipada dentro (W)"); ax.set_ylabel("Calentamiento del aire junto al Solo (K)")
ax.axvspan(13, 21, color=NEUTRO, alpha=0.18, lw=0, zorder=0)
ax.annotate("rango de proyecto\n13 – 21 W", (17, 48.5), ha="center", va="top", fontsize=8, color=INK2)
for val, s_ in ((15, "bar a 25 °C"), (10, "bar a 30 °C"), (5, "bar a 35 °C")):
    ax.axhline(val, color=CRIT, lw=1.0, zorder=2)
    ax.annotate(f"límite con el {s_}", (23.85, val), xytext=(0, 2.5), textcoords="offset points", fontsize=7.8, color=INK2, ha="right", va="bottom")
for k, txt_, dy in (("actual", "Diseño actual", 0), ("pintado", "Interior pintado", 0), ("fan1", "1 y 2 ventiladores", 0)):
    ax.annotate(txt_, (24, d[k][-1, 1]), xytext=(6, dy), textcoords="offset points", fontsize=8, color=INK, ha="left", va="center", annotation_clip=False)
ax.legend(loc="upper left", handlelength=1.8)
guardar(fig, "f_dT_P")

# ---------------------------------------------------------------- Monte Carlo
mc = np.load("../resultados/mc.npz")
fig, axs = plt.subplots(1, 3, figsize=(6.7, 2.5), sharey=True, gridspec_kw=dict(wspace=0.10))
for ax, k, rng_ in zip(axs, ("actual", "pintado", "fan2"), ((15, 45), (15, 45), (0, 6))):
    v = mc[k][:, 1]
    bins = np.linspace(rng_[0], rng_[1], 31 if k != "fan2" else 25)
    h, e = np.histogram(v, bins=bins)
    w = (e[1] - e[0])
    ax.bar(e[:-1] + w / 2, 100 * h / len(v), width=w * 0.86, color=C_CONF[k], zorder=3, lw=0)
    q = R["mc"][k]["solo"]
    ax.set_title(N_CONF[k]); ax.set_xlim(*rng_); ax.grid(axis="x", visible=False)
    ax.set_xlabel("Calentamiento junto al Solo (K)")
    ax.annotate(f"mediana +{coma(q['p50'])} K\n80 % de los casos:\n+{coma(q['p10'])} a +{coma(q['p90'])} K", (0.97, 0.95), xycoords="axes fraction", ha="right", va="top", fontsize=7.8, color=INK2)
axs[0].set_ylabel("Casos (%)"); axs[0].set_ylim(0, 19)
guardar(fig, "f_mc")

# ---------------------------------------------------------------- sensibilidad
s = R["sens"]; base = s["base"]
filas = sorted(s["filas"], key=lambda f: -(abs(f["hi"] - f["lo"])))
fig, ax = plt.subplots(figsize=(6.7, 3.6))
ax.set_xlim(19, 42); ax.set_ylim(-0.6, len(filas) - 0.4); ax.invert_yaxis()
r = rad(ax)
for i, f in enumerate(filas):
    barra_h(ax, i, base, f["lo"], 0.42, S1, rx_ry=r)
    barra_h(ax, i, base, f["hi"], 0.42, CRIT if False else "#e34948", rx_ry=r)
    ax.annotate("+" + coma(f["lo"], 0), (min(f["lo"], f["hi"]), i), xytext=(-5, 0), textcoords="offset points", ha="right", va="center", fontsize=8, color=INK)
    ax.annotate("+" + coma(f["hi"], 0), (max(f["lo"], f["hi"]), i), xytext=(5, 0), textcoords="offset points", ha="left", va="center", fontsize=8, color=INK)
ax.axvline(base, color=INK2, lw=0.9, zorder=4)
ax.set_yticks(range(len(filas))); ax.set_yticklabels([f["nombre"] for f in filas], color=INK); ax.grid(axis="y", visible=False)
ax.set_xlabel(f"Calentamiento del aire junto al Solo (K) · caso base: +{coma(base)} K")
ax.plot([], [], color=S1, lw=6, label="Mejor valor del parámetro"); ax.plot([], [], color="#e34948", lw=6, label="Peor valor del parámetro")
ax.legend(loc="lower right", handlelength=1.4)
guardar(fig, "f_sens")
print("ok b1")
