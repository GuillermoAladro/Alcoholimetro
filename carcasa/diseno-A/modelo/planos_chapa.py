"""
Planos de fabricación de la carcasa en chapa plegada.

Las piezas con el mismo código comparten plano. Antes de exportar se comprueba que de verdad son la misma pieza
(una girada respecto a otra). Si una es el espejo de otra, se plegaría al revés, así que el script se para.

  python planos_chapa.py SALIDA
    SALIDA/DXF_desarrollos/   un DXF por pieza distinta: contorno de corte (capa CORTE), líneas de pliegue (capa PLIEGUES,
                              discontinua) y textos (capa TEXTO). Las piezas planas, solo con su contorno.
    SALIDA/STEP_piezas/       la pieza ya plegada, una por pieza distinta
    SALIDA/Conjunto_A.step    la máquina entera
    SALIDA/Planos_chapa_plegada.pdf   una hoja por pieza: desarrollo acotado con sus pliegues y vista 3D
    SALIDA/piezas.json        datos para la lista de piezas
"""
import json, math, os, sys
sys.path.insert(0, "/home/claude/nuevo")
import numpy as np
import cadquery as cq
from cadquery.occ_impl.exporters.dxf import DxfDocument
from OCP.gp import gp_Trsf
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
import specs, diseno, exportar
from chapa import escribir_dxf

GRUPO = {"C": "Carcasa", "T": "Tapa", "V": "Policarbonato", "P": "Cajón de pajitas", "K": "Cajón de componentes", "S": "Soportes"}
SENT = {"abajo": "hacia abajo", "arriba": "hacia arriba"}


def coma(x, d=1):
    return f"{x:.{d}f}".replace(".", ",")


def grupos(m):
    """Piezas fabricadas agrupadas por código de plano (las iguales van juntas)."""
    out = {}
    for p in m.piezas:
        if p["tipo"] != "fabricada":
            continue
        g = out.setdefault(p["codigo"], dict(piezas=[], codigo=p["codigo"]))
        g["piezas"].append(p)
    lista = []
    for g in out.values():
        p0 = g["piezas"][0]
        for p in g["piezas"][1:]:
            if not misma_pieza(p0["solido"], p["solido"]):
                raise SystemExit(f"Plano {g['codigo']}: «{p['nombre']}» no es la misma pieza que «{p0['nombre']}» girada "
                                 "(espejo o cotas distintas). Dale su propio código en diseno.py.")
        g.update(ref=p0["id"], nombre=p0["nombre"], cant=len(g["piezas"]), material=p0["material"], espesor=p0["espesor"],
                 chapa=p0.get("chapa"), solido=p0["solido"], proceso=p0["proceso"], notas=p0.get("notas", ""), color=p0["color"],
                 ids=[p["id"] for p in g["piezas"]])
        if g["cant"] > 1:
            g["nombre"] = nombre_comun(g)
        lista.append(g)
    return lista


def _rotaciones():
    """Las 24 rotaciones que llevan ejes a ejes, solo las de determinante +1 (girar la pieza, nunca reflejarla)."""
    import itertools
    out = []
    for perm in itertools.permutations(range(3)):
        for sig in itertools.product((1, -1), repeat=3):
            M = np.zeros((3, 3))
            for i in range(3):
                M[i, perm[i]] = sig[i]
            if round(np.linalg.det(M)) == 1:
                out.append(M)
    return out


ROTACIONES = _rotaciones()


def misma_pieza(a, b, tol=1.0):
    """True si b es a girada y movida (todas las piezas están alineadas con los ejes). Tolerancia en mm³."""
    if abs(a.Volume() - b.Volume()) > tol:
        return False
    def centrada(s):
        c = s.BoundingBox().center
        return s.translate(cq.Vector(-c.x, -c.y, -c.z))
    a0, b0 = centrada(a), centrada(b)
    ba = a0.BoundingBox()
    for M in ROTACIONES:
        t = gp_Trsf()
        t.SetValues(*[float(v) for fila in M for v in list(fila) + [0.0]])
        r = b0._apply_transform(t)
        br = r.BoundingBox()
        if max(abs(br.xlen - ba.xlen), abs(br.ylen - ba.ylen), abs(br.zlen - ba.zlen)) > 0.01:
            continue
        r = centrada(r)
        if a0.cut(r).Volume() + r.cut(a0).Volume() < tol:
            return True
    return False


NOMBRES = {"TABIQUE": "Tabique del cajón de pajitas", "GUIA": "Guía trasera", "ANILLA_FIJA": "Anilla para candado (en el lateral)",
           "ANILLA_CAJON": "Anilla para candado (en la tapa del cajón)", "ASIDERO": "Asidero del cajón de componentes",
           "PLETINA": "Pletina de la pantalla"}


def nombre_comun(g):
    return NOMBRES.get(g["codigo"], g["piezas"][0]["nombre"])


def aristas_2d(cara, n=48):
    """Polilíneas de las aristas de una cara plana en XY."""
    out = []
    for e in cara.Edges():
        if e.geomType() == "LINE":
            a, b = e.startPoint(), e.endPoint()
            out.append(([a.x, b.x], [a.y, b.y]))
        else:
            k = max(8, int(n * e.Length() / 30))
            pts = [e.positionAt(t) for t in np.linspace(0, 1, k)]
            out.append(([p.x for p in pts], [p.y for p in pts]))
    return out


def plano_plana(sol):
    """Cara mayor de una pieza plana llevada al plano XY, con la esquina en el origen."""
    cara = exportar.cara_mayor_xy(sol)
    bb = cara.BoundingBox()
    cara = cara.translate(cq.Vector(-bb.xmin, -bb.ymin, -bb.zmax))
    return cara, [], bb.xlen, bb.ylen


def dxf(g, cara, lineas, W, H, ruta, ch):
    medida = "Desarrollo" if ch else "Medidas"
    escribir_dxf(cara, lineas, ruta, [f"{g['ref']}  {g['nombre'].upper()}  -  {g['material']}  -  {g['cant']} ud.",
                                      f"{medida} {coma(W)} x {coma(H)} mm"], ch)


def vista_3d(ax, sol, color, titulo=None):
    v, t = sol.tessellate(0.3, 0.4)
    P = np.array([[p.x, p.y, p.z] for p in v])
    tris = P[np.array(t)]
    n = np.cross(tris[:, 1] - tris[:, 0], tris[:, 2] - tris[:, 0])
    ln = np.linalg.norm(n, axis=1) + 1e-12
    n = n / ln[:, None]
    luz = np.array([-0.4, -0.7, 0.6]); luz /= np.linalg.norm(luz)
    k = 0.45 + 0.55 * np.abs(n @ luz)
    cols = np.clip(np.array(color)[None, :] * k[:, None] + 0.08, 0, 1)
    pc = Poly3DCollection(tris, facecolors=cols, edgecolors="none", linewidths=0)
    ax.add_collection3d(pc)
    lo, hi = P.min(0), P.max(0)
    c = (lo + hi) / 2
    r = (hi - lo).max() / 2
    ax.set_xlim(c[0] - r, c[0] + r); ax.set_ylim(c[1] - r, c[1] + r); ax.set_zlim(c[2] - r, c[2] + r)
    ax.set_box_aspect((1, 1, 1))
    ax.view_init(elev=22, azim=-58)
    ax.set_axis_off()
    if titulo:
        ax.set_title(titulo, fontsize=8)


def cota(ax, x0, y0, x1, y1, texto, off, horiz):
    if horiz:
        ax.annotate("", (x0, y0 + off), (x1, y0 + off), arrowprops=dict(arrowstyle="<->", lw=0.6, color="#333"))
        ax.plot([x0, x0], [y0, y0 + off], lw=0.4, color="#666"); ax.plot([x1, x1], [y0, y0 + off], lw=0.4, color="#666")
        ax.text((x0 + x1) / 2, y0 + off + (1.2 if off > 0 else -1.2), texto, ha="center", va="bottom" if off > 0 else "top", fontsize=7)
    else:
        ax.annotate("", (x0 + off, y0), (x0 + off, y1), arrowprops=dict(arrowstyle="<->", lw=0.6, color="#333"))
        ax.plot([x0, x0 + off], [y0, y0], lw=0.4, color="#666"); ax.plot([x0, x0 + off], [y1, y1], lw=0.4, color="#666")
        ax.text(x0 + off - 1.5, (y0 + y1) / 2, texto, ha="right", va="center", fontsize=7, rotation=90)


def hoja(pdf, g, cara, lineas, W, H, ch, m_masa):
    fig = plt.figure(figsize=(11.69, 8.27))                  # A4 apaisado
    fig.text(0.04, 0.955, f"{g['ref']}  ·  {g['nombre']}", fontsize=15, weight="bold")
    proc = "Láser + plegado" if ch else ("Láser" if "Acero" in g["material"] else g["proceso"])
    sub = (f"{g['material']}  ·  {g['cant']} ud.  ·  {proc}  ·  "
           f"{'desarrollo' if ch else 'medidas'} {coma(W)} × {coma(H)} mm  ·  {coma(m_masa, 0)} g por pieza")
    fig.text(0.04, 0.925, sub, fontsize=10, color="#333")
    ax = fig.add_axes([0.04, 0.10, 0.60, 0.78])
    for xs, ys in aristas_2d(cara):
        ax.plot(xs, ys, color="black", lw=0.8)
    for L in lineas:
        ax.plot([L["p0"][0], L["p1"][0]], [L["p0"][1], L["p1"][1]], color="#d0021b", lw=0.9, ls=(0, (6, 3)))
        mx, my = (L["p0"] + L["p1"]) / 2
        horiz = abs(L["p1"][0] - L["p0"][0]) > abs(L["p1"][1] - L["p0"][1])
        ax.text(mx, my, f" {L['nombre']} ", color="#d0021b", fontsize=7, ha="center", va="center", rotation=0 if horiz else 90,
                bbox=dict(boxstyle="round,pad=0.15", fc="white", ec="#d0021b", lw=0.5))
    s = max(W, H)
    cota(ax, 0, 0, W, 0, f"{coma(W)}", -0.06 * s, True)
    cota(ax, 0, 0, 0, H, f"{coma(H)}", -0.06 * s, False)
    ax.set_aspect("equal")
    ax.set_xlim(-0.12 * s, W + 0.04 * s); ax.set_ylim(-0.12 * s, H + 0.04 * s)
    ax.axis("off")
    ax3 = fig.add_axes([0.66, 0.48, 0.32, 0.42], projection="3d")
    vista_3d(ax3, g["solido"], g["color"], "Pieza plegada" if ch else "Pieza")
    # tabla de pliegues y notas
    y = 0.44
    if ch:
        fig.text(0.67, y, "Pliegues (todos a 90°)", fontsize=10, weight="bold"); y -= 0.028
        fig.text(0.67, y, f"Radio interior {coma(ch.r)} mm · K {coma(ch.k, 2)} · BA {coma(ch.ba, 2)} mm · BD {coma(2 * (ch.r + ch.t) - ch.ba, 2)} mm",
                 fontsize=8, color="#333"); y -= 0.03
        vis = {}
        for L in lineas:
            vis.setdefault(L["nombre"], L)
        for r in ch.resumen():
            L = vis[r["nombre"]]
            tr = f", en {r['tramos']} tramos" if r["tramos"] > 1 else ""
            fig.text(0.67, y, f"{r['nombre']}: {SENT[L['sentido']]}, largo {coma(r['largo'])} mm{tr}", fontsize=8.5); y -= 0.024
        y -= 0.01
        fig.text(0.67, y, "Vista del desarrollo: desde la cara exterior.", fontsize=7.5, color="#555"); y -= 0.02
        fig.text(0.67, y, "«Hacia abajo» = la pestaña se aleja del que mira.", fontsize=7.5, color="#555"); y -= 0.02
        fig.text(0.67, y, "El taller puede rehacer el desarrollo con su K desde el STEP.", fontsize=7.5, color="#555"); y -= 0.03
    import textwrap
    for linea in textwrap.wrap(g["notas"], 62)[:9]:
        fig.text(0.67, y, linea, fontsize=7.5, color="#222"); y -= 0.019
    fig.text(0.04, 0.03, f"Alcoholímetro · carcasa de chapa plegada · diseño A · piezas: {', '.join(g['ids'])}", fontsize=7, color="#666")
    pdf.savefig(fig)
    plt.close(fig)


def portada(pdf, m, gl):
    fig = plt.figure(figsize=(11.69, 8.27))
    fig.text(0.04, 0.94, "Carcasa del alcoholímetro · chapa plegada", fontsize=18, weight="bold")
    fig.text(0.04, 0.905, f"Acero DC01 de {coma(diseno.T, 0)} mm y de {coma(diseno.TK)} mm (cajón de componentes y tapa interior), cortado por láser, "
             f"plegado a 90° (radio interior = espesor) y soldado por puntos sobre pestañas", fontsize=10, color="#333")
    ax3 = fig.add_axes([0.0, 0.05, 0.42, 0.82], projection="3d")
    for p in m.piezas:
        if p["tipo"] == "fabricada" and p.get("movil") in (None, "", "cajon_pajitas", "tapa", "tapa_interior", "cajon_componentes"):
            pass
    sol = [p for p in m.piezas if p["tipo"] == "fabricada" and "Acero" in p["material"]]
    v_all = []
    for p in sol:
        v, t = p["solido"].tessellate(0.6, 0.6)
        P = np.array([[q.x, q.y, q.z] for q in v])
        if not len(t):
            continue
        tris = P[np.array(t)]
        n = np.cross(tris[:, 1] - tris[:, 0], tris[:, 2] - tris[:, 0]); n /= (np.linalg.norm(n, axis=1) + 1e-12)[:, None]
        luz = np.array([-0.4, -0.7, 0.6]); luz /= np.linalg.norm(luz)
        k = 0.45 + 0.55 * np.abs(n @ luz)
        ax3.add_collection3d(Poly3DCollection(tris, facecolors=np.clip(np.array(p["color"])[None, :] * k[:, None] + 0.08, 0, 1), edgecolors="none"))
        v_all.append(P)
    P = np.vstack(v_all); lo, hi = P.min(0), P.max(0); c = (lo + hi) / 2; r = (hi - lo).max() / 2
    ax3.set_xlim(c[0] - r, c[0] + r); ax3.set_ylim(c[1] - r, c[1] + r); ax3.set_zlim(c[2] - r, c[2] + r)
    ax3.set_box_aspect((1, 1, 1)); ax3.view_init(elev=18, azim=-55); ax3.set_axis_off()
    # tabla de piezas
    x0, y = 0.44, 0.86
    cab = ["Plano", "Pieza", "Ud.", "Material", "Pliegues", "Desarrollo (mm)"]
    xs = [0, 0.065, 0.315, 0.345, 0.425, 0.48]
    for c_, xx in zip(cab, xs):
        fig.text(x0 + xx, y, c_, fontsize=8, weight="bold")
    y -= 0.022
    n_ud = n_pl = 0
    for g in gl:
        if "Policarbonato" in g["material"]:
            continue
        npl = len(g["chapa"].pliegues) if g["chapa"] else 0
        n_ud += g["cant"]; n_pl += npl * g["cant"]
        fila = [g["ref"], g["nombre"][:44], str(g["cant"]), g["material"].replace("Acero ", ""), str(npl) if npl else "plana",
                f"{coma(g['W'])} × {coma(g['H'])}"]
        for c_, xx in zip(fila, xs):
            fig.text(x0 + xx, y, c_, fontsize=7.5)
        y -= 0.0215
    y -= 0.01
    fig.text(x0, y, f"{len([g for g in gl if 'Policarbonato' not in g['material']])} planos de chapa, {n_ud} piezas en total, {n_pl} pliegues por máquina "
             "(antes: 44 chapas planas sin pliegues).", fontsize=8.5, weight="bold"); y -= 0.025
    for tx in ("Policarbonatos (sin cambios): exterior e interior de 5 mm, ventana y soporte de la antena de 2 mm.",
               "Planas: anillas, asideros y pestaña de tope (MIG); guías traseras (por puntos) y apoyo trasero de la tapa interior (MIG por su canto).",
               "Cada hoja siguiente: desarrollo acotado con sus líneas de pliegue y la pieza plegada en 3D."):
        fig.text(x0, y, tx, fontsize=7.5, color="#333"); y -= 0.02
    pdf.savefig(fig)
    plt.close(fig)


def main(salida):
    m = diseno.construir(specs.SPEC_A)
    os.makedirs(os.path.join(salida, "DXF_desarrollos"), exist_ok=True)
    os.makedirs(os.path.join(salida, "STEP_piezas"), exist_ok=True)
    gl = [g for g in grupos(m) if "Acero" in g["material"]]       # los policarbonatos van aparte (CAD_A_Compacta)
    datos = []
    for g in gl:
        ch = g["chapa"]
        if ch:
            cara, lineas, W, H = ch.plano_2d()
        else:
            cara, lineas, W, H = plano_plana(g["solido"])
        g.update(cara=cara, lineas=lineas, W=W, H=H)
    pdf_ruta = os.path.join(salida, "Planos_chapa_plegada.pdf")
    with PdfPages(pdf_ruta) as pdf:
        portada(pdf, m, gl)
        for g in gl:
            ch = g["chapa"]
            masa = g["solido"].Volume() * (7.85e-3 if "Acero" in g["material"] else 1.2e-3)
            nombre_f = f"{g['ref']}_{g['nombre']}".replace("/", "-").replace(" ", "_").replace(",", "").replace("(", "").replace(")", "")
            import unicodedata
            nombre_f = unicodedata.normalize("NFKD", nombre_f.replace(":", "")).encode("ascii", "ignore").decode()[:70]   # sin tildes en el nombre
            if "Policarbonato" not in g["material"]:
                dxf(g, g["cara"], g["lineas"], g["W"], g["H"], os.path.join(salida, "DXF_desarrollos", nombre_f + ".dxf"), ch)
            else:
                dxf(g, g["cara"], [], g["W"], g["H"], os.path.join(salida, "DXF_desarrollos", nombre_f + ".dxf"), None)
            cq.exporters.export(cq.Workplane(obj=g["solido"]), os.path.join(salida, "STEP_piezas", nombre_f + ".step"))
            hoja(pdf, g, g["cara"], g["lineas"], g["W"], g["H"], ch, masa)
            datos.append(dict(ref=g["ref"], ids=g["ids"], nombre=g["nombre"], cant=g["cant"], material=g["material"],
                              espesor=g["espesor"], proceso="Láser + plegado" if ch else ("Láser" if "Acero" in g["material"] else g["proceso"]),
                              pliegues=len(ch.pliegues) if ch else 0, desarrollo=[round(g["W"], 1), round(g["H"], 1)],
                              masa_g=round(masa), dxf=f"DXF_desarrollos/{nombre_f}.dxf", step=f"STEP_piezas/{nombre_f}.step",
                              notas=g["notas"], grupo=GRUPO.get(g["ref"].split("-")[1][0], "")))
    asm = cq.Assembly(name="alcoholimetro_A")
    for p in m.piezas:
        asm.add(p["solido"], name=p["id"].replace(".", "_"), color=cq.Color(*p["color"]))
    asm.save(os.path.join(salida, "Conjunto_A.step"))
    lista_xlsx(datos, os.path.join(salida, "Lista_piezas_chapa.xlsx"))
    print("planos", len(datos), "->", salida)


def lista_xlsx(datos, ruta):
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    from openpyxl.utils import get_column_letter
    wb = Workbook(); ws = wb.active; ws.title = "Piezas de chapa"
    F, FB, FH = Font(name="Arial", size=10), Font(name="Arial", size=10, bold=True), Font(name="Arial", size=10, bold=True, color="FFFFFF")
    thin = Side(style="thin", color="C6CFD6"); BOX = Border(top=thin, bottom=thin, left=thin, right=thin)
    ws["A1"] = "Carcasa del alcoholímetro · piezas de chapa (diseño A plegado)"; ws["A1"].font = Font(name="Arial", size=14, bold=True)
    ws["A2"] = (f"Acero DC01 de {coma(diseno.T, 0)} mm (carcasa, tapa, bandeja, cajón de pajitas y soportes) y de {coma(diseno.TK)} mm (cajón de componentes y tapa interior); "
                "ver la columna Material. Pliegues a 90° con radio interior igual al espesor; desarrollo calculado con K = 0,33 (el taller puede rehacerlo con su K "
                "desde el STEP plegado). Soldadura por puntos sobre las pestañas; anillas, asideros, pestaña de tope y apoyo trasero de la tapa interior, con MIG."); ws["A2"].font = F
    cols = [("Plano", 10), ("Pieza", 40), ("Ud. por máquina", 10), ("Material", 18), ("Proceso", 16), ("Pliegues por pieza", 10),
            ("Desarrollo largo (mm)", 12), ("Desarrollo ancho (mm)", 12), ("Masa por pieza (g)", 11), ("DXF", 46), ("STEP", 46), ("Notas", 80)]
    for j, (c, w) in enumerate(cols, 1):
        x = ws.cell(row=4, column=j, value=c); x.font, x.fill, x.border = FH, PatternFill("solid", fgColor="2F3B46"), BOX
        x.alignment = Alignment(wrap_text=True, vertical="center"); ws.column_dimensions[get_column_letter(j)].width = w
    ws.row_dimensions[4].height = 32
    r = 5
    for d in datos:
        vals = [d["ref"], d["nombre"], d["cant"], d["material"], d["proceso"], d["pliegues"], max(d["desarrollo"]), min(d["desarrollo"]),
                d["masa_g"], d["dxf"], d["step"], d["notas"]]
        for j, v in enumerate(vals, 1):
            x = ws.cell(row=r, column=j, value=v); x.font, x.border = F, BOX; x.alignment = Alignment(wrap_text=True, vertical="top")
        for j in (7, 8):
            ws.cell(row=r, column=j).number_format = "0.0"
        r += 1
    ws.cell(row=r, column=1, value="Total").font = FB
    ws.cell(row=r, column=3, value=f"=SUM(C5:C{r - 1})").font = FB
    ws.cell(row=r, column=6, value=f"=SUMPRODUCT(C5:C{r - 1},F5:F{r - 1})").font = FB
    ws.cell(row=r, column=9, value=f"=SUMPRODUCT(C5:C{r - 1},I5:I{r - 1})").font = FB
    ws.cell(row=r + 1, column=1, value="En la fila Total: piezas, pliegues y gramos por máquina.").font = Font(name="Arial", size=9, italic=True)
    ws.freeze_panes = "C5"
    wb.save(ruta)


if __name__ == "__main__":
    main(sys.argv[1])
