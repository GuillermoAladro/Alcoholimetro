import json
from estilo import *
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
R = json.load(open("../resultados/resultados.json"))
c = R["conf"]["actual"]; f = R["flujos"]["actual"]

fig, ax = plt.subplots(figsize=(6.9, 3.5))
ax.set_xlim(0, 100); ax.set_ylim(3, 53); ax.axis("off")
Y, H, W = 21, 12, 11.5
xs = [1.0, 23.0, 45.0, 67.0, 87.5]
ym = Y + H / 2


def caja(x, titulo, sub, fc="#f1f0ec", ec=AXIS):
    ax.add_patch(FancyBboxPatch((x, Y), W, H, boxstyle="round,pad=0,rounding_size=1.2", fc=fc, ec=ec, lw=0.9, zorder=3))
    ax.text(x + W / 2, ym + 2.0, titulo, ha="center", va="center", fontsize=7.8, fontweight="semibold", color=INK, zorder=4, linespacing=1.1)
    ax.text(x + W / 2, ym - 3.6, sub, ha="center", va="center", fontsize=8.2, color=INK2, zorder=4)


def flecha(p0, p1, rad=0.0):
    ax.add_patch(FancyArrowPatch(p0, p1, connectionstyle=f"arc3,rad={rad}", arrowstyle="-|>", mutation_scale=9, lw=1.1, color=INK2, zorder=2, shrinkA=1, shrinkB=1))


def rot(x, y, s, size=7.6, ha="center", va="center", peso="normal", color=INK2):
    ax.text(x, y, s, ha=ha, va=va, fontsize=size, color=color, zorder=5, linespacing=1.2, fontweight=peso, bbox=dict(fc=SURF, ec="none", pad=1.5))


caja(xs[0], "Electrónica\n(calor)", f"{coma(c['P'])} W", fc="#f8d6c7", ec=S2)
caja(xs[1], "Aire\ninterior", f"+{coma(c['dT'], 0)} K")
caja(xs[2], "Chapa del\ncajón", f"+{coma(c['cajon'], 0)} K")
caja(xs[3], "Carcasa\n(3 mm)", f"+{coma(c['chapa_sup'], 0)} K")
caja(xs[4], "Aire\ndel bar", "0 K", fc=SURF)
for i, (w_, mec) in enumerate(((f["comp_aire"], "convección"), (f["conv"], "convección"), (f["cajon"], "huecos"), (f["cajon"] - c["caminos"]["pared"], "conv. + rad."))):
    x0, x1 = xs[i] + W, xs[i + 1]
    flecha((x0, ym), (x1, ym))
    xm = (x0 + x1) / 2
    ax.text(xm, ym + 1.3, coma(w_) + " W", ha="center", va="bottom", fontsize=8, color=INK, zorder=5)
    ax.text(xm, ym - 1.5, mec, ha="center", va="top", fontsize=6.9, color=INK2, zorder=5)
# por abajo: radiación y contacto (componentes → cajón) y pared (carcasa → bar)
flecha((xs[0] + W / 2, Y), (xs[2] + W / 2, Y), rad=0.30)
rot((xs[0] + xs[2] + W) / 2, Y - 9.9, f"radiación de los componentes: {coma(f['rad'])} W\ncontacto de la fuente con el cajón: {coma(f['contacto'])} W")
flecha((xs[3] + W / 2, Y), (xs[4] + W / 2, Y), rad=0.42)
rot((xs[3] + xs[4] + W) / 2, Y - 7.6, f"a través de la pared:\n{coma(c['caminos']['pared'])} W")
# por arriba: ventanas y rejillas
flecha((xs[0] + W / 2, Y + H), (xs[4] + W / 2 + 2.5, Y + H), rad=-0.30)
rot((xs[0] + xs[4] + W + 2.5) / 2, Y + H + 13.1, f"ventanas del frente (pantalla y Solo, tras el doble policarbonato): {coma(f['win'])} W")
flecha((xs[1] + W / 2, Y + H), (xs[4] + W / 2 - 2.5, Y + H), rad=-0.24)
rot((xs[1] + xs[4] + W - 2.5) / 2, Y + H + 7.7, f"aire caliente que sale por las rejillas: {coma(f['vent'])} W")
guardar(fig, "f_red", pad=0.05)
print("ok red")
