"""Exporta un Modelo a: JSON de mallas para el visor, STEP (piezas y conjunto), DXF de chapas y tablas."""
import csv, json, math, os
import cadquery as cq
from cadquery.occ_impl.exporters.dxf import DxfDocument

GRUPOS = {"C": "Carcasa", "T": "Tapa", "V": "Policarbonato", "P": "Cajón de pajitas", "K": "Cajón de componentes",
          "S": "Soportes", "E": "Electrónica", "H": "Herrajes"}


def malla(sh, tol=0.12, ang=0.35):
    v, t = sh.tessellate(tol, ang)
    return dict(v=[round(c, 2) for p in v for c in (p.x, p.y, p.z)], i=[i for tri in t for i in tri])


def bb(sh):
    b = sh.BoundingBox()
    return [round(b.xmin, 2), round(b.ymin, 2), round(b.zmin, 2), round(b.xmax, 2), round(b.ymax, 2), round(b.zmax, 2)]


def medidas_chapa(sh):
    b = sh.BoundingBox()
    d = sorted([b.xlen, b.ylen, b.zlen], reverse=True)
    return d


def a_json(m, compras):
    piezas = []
    for p in m.piezas:
        g = p["id"].split("-")[1][0]
        ref = p.get("ref")
        info = dict(id=p["id"], nombre=p["nombre"], grupo=GRUPOS.get(g, g), tipo=p["tipo"], movil=p["movil"],
                    electrico=p["electrico"], notas=p.get("notas", ""), bb=bb(p["solido"]))
        if p["tipo"] == "fabricada":
            d = medidas_chapa(p["solido"])
            info.update(material=p["material"], proceso=p["proceso"], medidas=[round(x, 1) for x in d],
                        masa=round(p["solido"].Volume() * (7.85e-3 if "Acero" in p["material"] else 1.2e-3), 1))
        else:
            n, asin, precio = compras.get(ref, (p["nombre"], "", 0))
            info.update(ref=ref, compra=n, asin=asin)
            if p.get("modelo"):
                info["modelo"] = p["modelo"]
        info["mallas"] = []
        if info.get("modelo"):                 # el visor la dibuja con su modelo detallado: no hace falta la malla
            piezas.append(info)
            continue
        for sub, s, c in p["subs"]:
            mm = malla(s)
            mm["c"] = [round(x, 3) for x in c]
            mm["n"] = sub
            info["mallas"].append(mm)
        piezas.append(info)
    return dict(letra=m.letra, nombre=m.nombre, descripcion=m.descripcion, accesorios=m.cotas.get("accesorios", []),
                cotas={k: (round(v, 2) if isinstance(v, float) else v) for k, v in m.cotas.items()
                       if isinstance(v, (int, float, str))},
                piezas=piezas, cables=m.cables, movil=m.movil)


# ---------------------------------------------------------------- DXF de una chapa plana
def cara_mayor_xy(sh):
    """Cara mayor de la chapa llevada al plano XY, 'de pie': las chapas verticales se ven con su altura hacia
    arriba (las frontales vistas desde delante, las laterales vistas desde la derecha); las horizontales desde arriba."""
    f = max(sh.Faces(), key=lambda x: x.Area())
    n = f.normalAt()
    c = f.Center()
    f = f.translate(cq.Vector(-c.x, -c.y, -c.z))
    o = cq.Vector(0, 0, 0)
    if abs(n.y) > 0.9:
        f = f.rotate(o, cq.Vector(1, 0, 0), -90)
    elif abs(n.x) > 0.9:
        f = f.rotate(o, cq.Vector(0, 1, 0), 90).rotate(o, cq.Vector(0, 0, 1), 90)
    return f


def dxf_chapa(sh, ruta, texto):
    cara = cara_mayor_xy(sh)
    dxf = DxfDocument(setup=True)
    dxf.add_layer("CORTE", color=7)
    dxf.add_layer("TEXTO", color=3)
    dxf.add_shape(cara, "CORTE")
    bbx = cara.BoundingBox()
    dxf.document.modelspace().add_text(texto, height=4, dxfattribs={"layer": "TEXTO"}).set_placement((bbx.xmin, bbx.ymin - 12))
    dxf.document.saveas(ruta)
    return round(bbx.xlen, 1), round(bbx.ylen, 1)


def exportar_cad(m, carpeta, compras):
    os.makedirs(os.path.join(carpeta, "STEP_piezas"), exist_ok=True)
    os.makedirs(os.path.join(carpeta, "DXF_corte"), exist_ok=True)
    asm = cq.Assembly(name=f"alcoholimetro_{m.letra}")
    filas = []
    for p in m.piezas:
        nombre_step = p["id"].replace(".", "_")
        col = p["color"]
        asm.add(p["solido"], name=nombre_step, color=cq.Color(*col))
        if p["tipo"] == "fabricada":
            cq.exporters.export(cq.Workplane(obj=p["solido"]), os.path.join(carpeta, "STEP_piezas", f"{p['id']}.step"))
            dims = None
            if p.get("plana", True):
                dims = dxf_chapa(p["solido"], os.path.join(carpeta, "DXF_corte", f"{p['id']}.dxf"),
                                 f"{p['id']} {p['nombre'].upper()} - {p['material']} - 1 ud.")
            d = medidas_chapa(p["solido"])
            masa = p["solido"].Volume() * (7.85e-3 if "Acero" in p["material"] else 1.2e-3)
            filas.append(dict(id=p["id"], nombre=p["nombre"], grupo=GRUPOS[p["id"].split("-")[1][0]], material=p["material"],
                              proceso=p["proceso"], largo=round(d[0], 1), ancho=round(d[1], 1), espesor=round(d[2], 1),
                              dxf=(f"DXF_corte/{p['id']}.dxf" if dims else ""), step=f"STEP_piezas/{p['id']}.step",
                              masa_g=round(masa, 0), notas=p.get("notas", "")))
    asm.save(os.path.join(carpeta, f"Conjunto_{m.letra}.step"))
    return filas
