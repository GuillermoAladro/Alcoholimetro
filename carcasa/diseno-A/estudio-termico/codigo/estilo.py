"""Estilo común de las figuras (paleta validada con validate_palette.js; superficie #fcfcfb)."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.path import Path
from matplotlib.patches import PathPatch
from matplotlib import font_manager as fm
import numpy as np

for f in fm.findSystemFonts():
    if "/inter/" in f.lower() and "display" not in f.lower():
        try:
            fm.fontManager.addfont(f)
        except Exception:
            pass

INK, INK2, MUTED, GRID, AXIS, SURF = "#0b0b0b", "#52514e", "#898781", "#e1e0d9", "#c3c2b7", "#fcfcfb"
S1, S2, S3, S4, S5 = "#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"      # categóricos, en orden fijo
CRIT, GOOD, WARN, SERIO = "#d03b3b", "#0ca30c", "#fab219", "#ec835a"             # estado (reservados)
SEQ = ["#cde2fb", "#b7d3f6", "#9ec5f4", "#86b6ef", "#6da7ec", "#5598e7", "#3987e5", "#2a78d6", "#256abf", "#1c5cab", "#184f95", "#104281", "#0d366b"]
NEUTRO = "#c3c2b7"
# color por configuración (sigue a la entidad en todo el informe)
C_CONF = dict(actual=S1, pintado=S2, fan2=S3, fan1=S4, fan60=S5)
N_CONF = dict(actual="Sin ventilador", pintado="Sin ventilador, pintado por dentro", fan2="2 ventiladores 40 mm", fan1="1 ventilador 40 mm", fan60="1 ventilador 60 mm")

plt.rcParams.update({
    "font.family": "Inter", "font.size": 8.5, "axes.edgecolor": AXIS, "axes.labelcolor": INK2, "text.color": INK,
    "xtick.color": MUTED, "ytick.color": MUTED, "xtick.labelcolor": INK2, "ytick.labelcolor": INK2,
    "axes.spines.top": False, "axes.spines.right": False, "axes.spines.left": False, "axes.linewidth": 0.8,
    "axes.grid": True, "grid.color": GRID, "grid.linewidth": 0.6, "grid.linestyle": "-", "axes.axisbelow": True,
    "xtick.major.size": 0, "ytick.major.size": 0, "xtick.major.pad": 5, "ytick.major.pad": 5,
    "figure.facecolor": SURF, "axes.facecolor": SURF, "savefig.facecolor": SURF, "savefig.dpi": 220,
    "legend.frameon": False, "legend.fontsize": 8.5, "lines.linewidth": 1.7, "lines.solid_capstyle": "round", "lines.solid_joinstyle": "round",
    "axes.titlesize": 9.5, "axes.titleweight": "semibold", "axes.titlelocation": "left", "axes.titlepad": 8, "axes.labelsize": 8.5,
    "svg.fonttype": "path", "axes.formatter.use_locale": False,
})


def coma(x, dec=1):
    return f"{x:.{dec}f}".replace(".", ",")


def fmt_coma(dec=0):
    from matplotlib.ticker import FuncFormatter
    return FuncFormatter(lambda v, _: coma(v, dec) if dec else f"{v:.0f}")


def _radios(ax, r_pt=3.0):
    fig = ax.figure
    fig.canvas.draw()
    bb = ax.get_window_extent()
    rp = r_pt * fig.dpi / 72.0
    x0, x1 = ax.get_xlim(); y0, y1 = ax.get_ylim()
    return abs(x1 - x0) / bb.width * rp, abs(y1 - y0) / bb.height * rp


def barra_h(ax, y, x0, x1, alto, color, r_pt=3.0, z=3, rx_ry=None, alpha=1.0, ambos=False):
    """Barra horizontal con el extremo del dato redondeado (4 px) y el arranque recto (ambos=True redondea los dos: barras de rango)."""
    rx, ry = rx_ry if rx_ry else _radios(ax, r_pt)
    s = 1 if x1 >= x0 else -1
    rx = min(rx, abs(x1 - x0) / (2 if ambos else 1)); ry = min(ry, alto / 2)
    b, t = y - alto / 2, y + alto / 2
    if ambos:
        v = [(x0 + s * rx, b), (x1 - s * rx, b), (x1, b), (x1, b + ry), (x1, t - ry), (x1, t), (x1 - s * rx, t),
             (x0 + s * rx, t), (x0, t), (x0, t - ry), (x0, b + ry), (x0, b), (x0 + s * rx, b)]
        c = [Path.MOVETO, Path.LINETO, Path.CURVE3, Path.CURVE3, Path.LINETO, Path.CURVE3, Path.CURVE3,
             Path.LINETO, Path.CURVE3, Path.CURVE3, Path.LINETO, Path.CURVE3, Path.CURVE3]
    else:
        v = [(x0, b), (x1 - s * rx, b), (x1, b), (x1, b + ry), (x1, t - ry), (x1, t), (x1 - s * rx, t), (x0, t), (x0, b)]
        c = [Path.MOVETO, Path.LINETO, Path.CURVE3, Path.CURVE3, Path.LINETO, Path.CURVE3, Path.CURVE3, Path.LINETO, Path.CLOSEPOLY]
    ax.add_patch(PathPatch(Path(v, c), facecolor=color, edgecolor="none", zorder=z, alpha=alpha))


def barra_v(ax, x, y0, y1, ancho, color, r_pt=3.0, z=3, rx_ry=None, alpha=1.0):
    rx, ry = rx_ry if rx_ry else _radios(ax, r_pt)
    s = 1 if y1 >= y0 else -1
    ry = min(ry, abs(y1 - y0)); rx = min(rx, ancho / 2)
    l, r = x - ancho / 2, x + ancho / 2
    v = [(l, y0), (l, y1 - s * ry), (l, y1), (l + rx, y1), (r - rx, y1), (r, y1), (r, y1 - s * ry), (r, y0), (l, y0)]
    c = [Path.MOVETO, Path.LINETO, Path.CURVE3, Path.CURVE3, Path.LINETO, Path.CURVE3, Path.CURVE3, Path.LINETO, Path.CLOSEPOLY]
    ax.add_patch(PathPatch(Path(v, c), facecolor=color, edgecolor="none", zorder=z, alpha=alpha))


def punto(ax, x, y, color, ms=6.5, z=5):
    ax.plot([x], [y], marker="o", ms=ms, mfc=color, mec=SURF, mew=1.5, ls="none", zorder=z)


def limite(ax, valor, texto, eje="y", color=CRIT, pos=None, va="bottom", ha="right", dx=0, dy=0):
    """Línea de límite (color de estado) con su etiqueta en tinta."""
    if eje == "y":
        ax.axhline(valor, color=color, lw=1.0, zorder=2)
        x = ax.get_xlim()[1] if pos is None else pos
        ax.annotate(texto, (x, valor), xytext=(dx - 2, dy + 2 if va == "bottom" else dy - 2), textcoords="offset points", ha=ha, va=va, fontsize=8, color=INK2)
    else:
        ax.axvline(valor, color=color, lw=1.0, zorder=2)
        y = ax.get_ylim()[1] if pos is None else pos
        ax.annotate(texto, (valor, y), xytext=(dx + 3, dy), textcoords="offset points", ha="left", va="top", fontsize=8, color=INK2)


def guardar(fig, nombre, pad=0.12):
    fig.savefig(f"../figuras/{nombre}.svg", bbox_inches="tight", pad_inches=pad)
    fig.savefig(f"../figuras/{nombre}.png", bbox_inches="tight", pad_inches=pad, dpi=110)
    plt.close(fig)
