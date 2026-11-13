import json
from estilo import *
from matplotlib.patches import Rectangle
R = json.load(open("../resultados/resultados.json"))

CAL = "#f8d6c7"      # lavado del naranja de la paleta para lo que disipa
CHAPA = "#6f6e69"
PC = "#bcd9f8"

fig = plt.figure(figsize=(6.9, 4.25))
gs = fig.add_gridspec(1, 3, width_ratios=[296, 296, 262], wspace=0.0, left=0.0, right=1.0, top=1.0, bottom=0.0)
axs = [fig.add_subplot(gs[0, i]) for i in range(3)]
for ax in axs:
    ax.set_aspect("equal"); ax.grid(False); ax.set_xticks([]); ax.set_yticks([])
    for s in ax.spines.values():
        s.set_visible(False)
    ax.set_ylim(-26, 470)


def rect(ax, x0, x1, z0, z1, fc="none", ec=INK2, lw=0.8, ls="-", z=2):
    ax.add_patch(Rectangle((x0, z0), x1 - x0, z1 - z0, fc=fc, ec=ec, lw=lw, ls=ls, zorder=z))


def txt(ax, x, z, s, size=6.8, ha="center", va="center", color=INK, weight="normal", rot=0):
    ax.text(x, z, s, fontsize=size, ha=ha, va=va, color=color, fontweight=weight, rotation=rot, zorder=8, linespacing=1.15)


def lim40(ax, x, z):
    ax.plot([x], [z], marker="o", ms=5.5, mfc=CRIT, mec=SURF, mew=1.0, zorder=9)


def carcasa_frente(ax, titulo):
    ax.set_xlim(-148, 148)
    rect(ax, -110, 110, 0, 442.5, fc="#f1f0ec", ec=CHAPA, lw=2.0, z=1)           # carcasa 3 mm
    rect(ax, -107, 107, 160.5, 163.5, fc=CHAPA, ec="none")                         # bandeja
    rect(ax, -107, 107, 407.5, 409, fc=CHAPA, ec="none")                           # tapa interior
    rect(ax, -103.5, 100, 173.5, 401.5, fc=SURF, ec=CHAPA, lw=1.0, z=1.5)          # cajón 1,5 mm
    txt(ax, 0, 80, "Cajón de pajitas\n(no genera calor)", color=MUTED)
    txt(ax, 0, 425, "cámara de aire de 30 mm", size=6.3, color=MUTED)
    txt(ax, 0, 459, titulo, size=8.2, weight="semibold")
    for x, z0, z1 in ((-110, 187, 215), (-110, 351, 371), (110, 361, 387)):       # rejillas: 3 ranuras de 22 × 4
        for zz in np.linspace(z0 + 4, z1 - 4, 3):
            ax.plot([x - 3.5, x + 3.5], [zz, zz], color=SURF, lw=1.6, zorder=3, solid_capstyle="butt")


def flecha(ax, x0, x1, z, s, ha):
    ax.annotate("", (x1, z), (x0, z), arrowprops=dict(arrowstyle="-|>", color=S1, lw=1.2, mutation_scale=7))
    txt(ax, min(x0, x1) + 12, z + 13, s, size=6.3, color=INK2, ha="center")


# ---------------- A: lo que va contra el frente
ax = axs[0]
carcasa_frente(ax, "Delante (contra el frente)")
rect(ax, -82.5, 82.5, 187, 287, fc=CAL, ec=S2, lw=0.9); txt(ax, 0, 237, "Pantalla 7″\n4,1 W")
rect(ax, -39.4, 106.6, 299.5, 400.5, fc="none", ec=S2, lw=0.9, ls=(0, (3, 2)), z=4)      # marco del Sigma, tumbado (146 × 101)
rect(ax, -20.7, 88, 306.8, 393.2, fc=CAL, ec=S2, lw=0.9); txt(ax, 33.6, 350, "myPOS Sigma\n3,0 W")
rect(ax, -67.5, -42.5, 360.5, 384.5, fc=CAL, ec=S2, lw=0.9); txt(ax, -55, 353, "cámara", size=6.3, ha="center", color=INK2)
ax.plot([-55], [325], marker="o", ms=4, mfc=SURF, mec=INK2, mew=0.9, zorder=5); txt(ax, -47, 325, "boquilla", size=6.3, ha="left", color=INK2)
flecha(ax, -142, -114, 201, "entra", "right"); flecha(ax, -114, -142, 361, "sale", "left"); flecha(ax, 114, 142, 374, "sale", "left")
ax.annotate("", (-110, -10), (110, -10), arrowprops=dict(arrowstyle="<->", color=MUTED, lw=0.7)); txt(ax, 0, -19, "220 mm", size=6.3, color=INK2)

# ---------------- B: lo que va contra la trasera
ax = axs[1]
carcasa_frente(ax, "Detrás (contra la trasera)")
rect(ax, -54, 98.5, 175, 263, fc="none", ec=CHAPA, lw=0.9, ls=(0, (3, 2)))                    # caja de red
rect(ax, -4, 95, 179.5, 250, fc=CAL, ec=S2, lw=0.9); txt(ax, 45.5, 215, "Fuente 12 V\n3,8 W")
rect(ax, -50, -9, 183, 243, fc=CAL, ec=S2, lw=0.9, ls=(0, (3, 2))); txt(ax, -29.5, 213, "conv.\n12→5 V\n2,0 W", size=6.0)
txt(ax, -52, 268.5, "caja de red", size=6.0, ha="left", va="center", color=INK2)
rect(ax, -99, -14, 274, 330, fc=CAL, ec=S2, lw=0.9); txt(ax, -56.5, 302, "Raspberry Pi\n4,6 W")
rect(ax, -6, 82, 290, 302, fc=CAL, ec=S2, lw=0.9); txt(ax, 38, 314, "Módem 2,0 W", size=6.3); lim40(ax, 76, 296)
rect(ax, -80, 5, 337, 370, fc=CAL, ec=S2, lw=0.9); txt(ax, -41, 353.5, "Sensor 0,5 W"); lim40(ax, -3, 363)
rect(ax, 100, 110, 202, 248, fc=NEUTRO, ec="none", z=3); txt(ax, 122, 225, "toma\nC14", size=6.0, color=INK2, ha="left")
rect(ax, -110, -103.5, 229, 341, fc=PC, ec="none", z=3); txt(ax, -116, 285, "ventana\nde la\nantena", size=6.0, color=INK2, ha="right")
lim40(ax, -100, -14); txt(ax, -92, -14, "pieza con límite de 40 °C", size=6.5, ha="left", color=INK2)

# ---------------- C: sección lateral
ax = axs[2]
ax.set_xlim(-106, 156)
txt(ax, 49, 459, "Sección lateral", size=8.2, weight="semibold")
rect(ax, 100, 134, -8, 452, fc=GRID, ec="none", z=0); txt(ax, 117, 80, "pared", color=INK2, rot=90)
rect(ax, 0, 100, 0, 442.5, fc="#f1f0ec", ec="none", z=0.5)
for x0, x1, z0, z1 in ((97, 100, 0, 439.5), (0, 3, 0, 407.5), (0, 100, 0, 3), (-2, 100, 439.5, 442.5), (-2, 1, 409, 439.5), (3, 97, 160.5, 163.5), (3, 97, 407.5, 409)):
    rect(ax, x0, x1, z0, z1, fc=CHAPA, ec="none", z=2)
rect(ax, -5, 0, 180, 403, fc=PC, ec=S1, lw=0.4); rect(ax, 3, 8, 180, 403, fc=PC, ec=S1, lw=0.4)      # policarbonatos
rect(ax, 14.5, 87.5, 173.5, 401.5, fc=SURF, ec="none", z=1)
for x0, x1, z0, z1 in ((14.5, 16, 173.5, 401.5), (86, 87.5, 173.5, 401.5), (14.5, 87.5, 173.5, 175)):
    rect(ax, x0, x1, z0, z1, fc=CHAPA, ec="none", z=2)
rect(ax, 16, 25, 187, 287, fc=CAL, ec=S2, lw=0.8)
rect(ax, -17, -5, 299.5, 400.5, fc=CAL, ec=S2, lw=0.8, z=5); rect(ax, -5, 48, 306.8, 393.2, fc=CAL, ec=S2, lw=0.8, z=5)      # Sigma: marco por fuera y cuerpo que atraviesa el frente
rect(ax, 56, 86, 179.5, 261.5, fc=CAL, ec=S2, lw=0.8); rect(ax, 68, 80, 274, 330, fc=CAL, ec=S2, lw=0.8); rect(ax, 68, 86, 337, 370, fc=CAL, ec=S2, lw=0.8)
txt(ax, 71, 222, "fuente", size=6.0, rot=90); txt(ax, 58, 302, "Pi", size=6.0); txt(ax, 60, 353, "sensor", size=6.0, rot=90)
txt(ax, 26, 350, "Sigma", size=6.0, rot=90); txt(ax, 33, 237, "pantalla", size=6.0, rot=90)
txt(ax, 50, 80, "cajón de\npajitas", color=MUTED, size=6.5)


def cota(x, z, s, tx, tz, ha="right"):
    ax.annotate(s, (x, z), xytext=(tx, tz), fontsize=6.3, color=INK2, ha=ha, va="center", zorder=9, linespacing=1.15,
                arrowprops=dict(arrowstyle="-", color=MUTED, lw=0.6, shrinkA=2, shrinkB=1))


cota(-2.5, 293, "dos policarbonatos\nde 5 mm con el panel\nde 3 mm en medio", -22, 318)
cota(-11, 380, "el Sigma atraviesa\nel frente: su cara\nda al bar", -22, 380)
cota(11, 262, "hueco delantero:\n3,3 mm de aire", -22, 266)
cota(15.2, 195, "chapa del cajón:\n1,5 mm", -22, 192)
cota(20, 168.5, "hueco inferior: 10 mm", -14, 150)
cota(1.5, 60, "carcasa: 3 mm", -14, 60)
cota(50, 424, "cámara: 30,5 mm", -14, 424)
cota(92, 388, "hueco trasero:\n9,5 mm", 140, 418, ha="center")
ax.annotate("", (0, -10), (100, -10), arrowprops=dict(arrowstyle="<->", color=MUTED, lw=0.7)); txt(ax, 50, -19, "100 mm", size=6.3, color=INK2)
guardar(fig, "f_seccion", pad=0.06)
print("ok")
