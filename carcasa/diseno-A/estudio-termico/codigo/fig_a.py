import json, numpy as np
from estilo import *
R = json.load(open("../resultados/resultados.json"))

# ---------------------------------------------------------------- Fig. potencia: rango y valor típico por componente
filas = [  # nombre, mín, típ (Bloque 1), máx, origen
    ("Raspberry Pi 3B+ y cámara", 2.1, 4.6, 7.1), ("Pantalla 7″", 2.5, 4.1, 5.1), ("Fuente (pérdidas)", 2.0, 3.5, 5.0),
    ("Módem 4G", 0.8, 2.0, 3.5), ("SumUp Solo", 0.3, 1.0, 2.0), ("Sensor ZE29A", 0.1, 0.5, 1.0), ("2 ventiladores", 0.44, 0.46, 0.50),
]
fig, ax = plt.subplots(figsize=(6.7, 2.75))
ax.set_xlim(0, 8); ax.set_ylim(-0.6, len(filas) - 0.4); ax.invert_yaxis()
rr = _radios = None
from estilo import _radios as rad
r = rad(ax)
for i, (n, a, t, b) in enumerate(filas):
    barra_h(ax, i, a, b, 0.34, SEQ[2], rx_ry=r, ambos=True)
    punto(ax, t, i, S1)
    ax.annotate(coma(t) + " W", (b, i), xytext=(6, 0), textcoords="offset points", va="center", fontsize=8.5, color=INK)
ax.set_yticks(range(len(filas))); ax.set_yticklabels([f[0] for f in filas]); ax.tick_params(axis="y", labelcolor=INK)
ax.grid(axis="y", visible=False); ax.set_xlabel("Potencia que se convierte en calor dentro de la carcasa (W)")
ax.xaxis.set_major_formatter(fmt_coma())
# leyenda manual
ax.plot([], [], marker="o", ms=6.5, mfc=S1, mec=SURF, mew=1.5, ls="none", label="Valor de proyecto (Bloque 1)")
ax.plot([], [], color=SEQ[2], lw=6, solid_capstyle="round", label="Rango plausible (mín. – máx. sostenido)")
ax.legend(loc="lower right", handlelength=1.6)
guardar(fig, "f_potencia")

# ---------------------------------------------------------------- Fig. límites de temperatura por pieza
piezas = [  # nombre, máx
    ("SumUp Solo", 40), ("Sensor ZE29A", 40), ("Módem 4G E3372h", 40), ("Raspberry Pi 3B+", 50), ("Cámara Module 3", 50),
    ("Fuente LRS-50-5 (hasta el 60 % de carga)", 70), ("Ventiladores Noctua", 70), ("Cable de PVC (H05VV-F)", 70), ("microSD High Endurance", 85),
    ("Bornes WAGO 221", 85), ("Cinta VHB (uso continuo)", 93), ("Policarbonato (uso continuo)", 115),
]
fig, ax = plt.subplots(figsize=(6.7, 4.2))
ax.set_xlim(20, 125); ax.set_ylim(-2.1, len(piezas) - 0.4); ax.invert_yaxis()
ta = 25.0
xa = ta + R["conf"]["actual"]["local"]["solo"]; xf = ta + R["conf"]["fan2"]["local"]["solo"]
for x, txt, col, ha in ((xa, f"Aire junto al Solo con el bar a 25 °C,\ndiseño actual: {coma(xa,0)} °C", CRIT, "left"), (xf, f"Lo mismo con\n2 ventiladores: {coma(xf,0)} °C", GOOD, "left")):
    ax.axvline(x, color=col, lw=1.0, zorder=2)
    ax.annotate(txt, (x, -1.25), xytext=(5, 0), textcoords="offset points", ha=ha, va="center", fontsize=8, color=INK2)
for i, (n, b) in enumerate(piezas):
    ax.plot([20, b], [i, i], color=GRID, lw=0.8, zorder=1)
    punto(ax, b, i, S1 if b <= 50 else NEUTRO, ms=8)
    ax.annotate(f"{b} °C", (b, i), xytext=(8, 0), textcoords="offset points", va="center", fontsize=8.5, color=INK, bbox=dict(fc=SURF, ec="none", pad=1.0), zorder=6)
ax.set_yticks(range(len(piezas))); ax.set_yticklabels([p[0] for p in piezas]); ax.tick_params(axis="y", labelcolor=INK)
ax.grid(axis="y", visible=False); ax.set_xlabel("Temperatura máxima de trabajo (°C)")
ax.plot([], [], marker="o", ms=8, mfc=S1, mec=SURF, mew=1.5, ls="none", label="Piezas que mandan (límite de 40 o 50 °C)")
ax.plot([], [], marker="o", ms=8, mfc=NEUTRO, mec=SURF, mew=1.5, ls="none", label="Resto")
ax.legend(loc="upper left", handlelength=1.2, bbox_to_anchor=(-0.01, -0.13), ncol=2, columnspacing=2.0)
guardar(fig, "f_limites")
print("ok")
