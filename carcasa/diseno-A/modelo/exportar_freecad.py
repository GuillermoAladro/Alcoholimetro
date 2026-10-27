"""Exporta el diseño A completo a un solo STEP pensado para abrir en FreeCAD (Archivo → Abrir).

Lleva todo lo que tiene el modelo: chapas, policarbonatos, componentes comprados, tornillería y cables/tubos,
con su nombre ("A-C01 Panel frontal"), su color y agrupado por conjuntos. Los componentes con varias partes
(la Pi, la fuente, el Solo…) van como subconjunto con cada parte en su color.

  python exportar_freecad.py SALIDA.step
"""
import sys, os, math, unicodedata
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cadquery as cq
import specs, diseno

GRUPOS = [  # (nombre del grupo, condición sobre la pieza)
    ("01 Carcasa", lambda p: p["tipo"] == "fabricada" and p["grupo"] == "C"),
    ("02 Frente (policarbonatos)", lambda p: p["tipo"] == "fabricada" and p["grupo"] == "V"),
    ("03 Tapa abatible", lambda p: p.get("movil") == "tapa"),
    ("04 Tapa interior", lambda p: p.get("movil") == "tapa_interior"),
    ("05 Cajon de pajitas", lambda p: p.get("movil") in ("cajon_pajitas", "candado")),
    ("06 Cajon de componentes", lambda p: p["tipo"] == "fabricada" and p.get("movil") == "cajon_componentes"),
    ("07 Electronica", lambda p: p["tipo"] == "comprada" and p.get("ref", "").startswith("E")),
    ("08 Tornilleria y fijaciones", lambda p: p["tipo"] == "comprada"),
]


def nombre_seguro(s, maxlen=70):
    """Nombre legible en cualquier versión de FreeCAD: sin tildes ni símbolos raros."""
    s = s.replace("×", "x").replace("→", "-").replace("·", "-").replace("Ø", "D").replace("°", "deg").replace("²", "2").replace("⁺", "+")
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = "".join(c if (c.isalnum() or c in " -_.,()+=") else "_" for c in s)
    return " ".join(s.split())[:maxlen].strip()


def solido_cable(c):
    """Tubo del radio del cable por sus puntos de paso: un cilindro por tramo y una esfera en cada codo."""
    r, pts = c["radio"], c["puntos"]
    partes = []
    for a, b in zip(pts, pts[1:]):
        d = [b[i] - a[i] for i in range(3)]
        L = math.sqrt(sum(v * v for v in d))
        if L < 1e-3:
            continue
        partes.append(cq.Solid.makeCylinder(r, L, cq.Vector(*a), cq.Vector(*[v / L for v in d])))
    for p in pts[1:-1]:
        partes.append(cq.Solid.makeSphere(r, cq.Vector(*p), angleDegrees1=-90, angleDegrees2=90))
    try:                                     # un solo sólido por cable: FreeCAD le pone bien el color y se selecciona entero
        u = partes[0].fuse(*partes[1:]) if len(partes) > 1 else partes[0]
        if u.isValid():
            return u
    except Exception:
        pass
    return cq.Compound.makeCompound(partes)


class DocStep:
    """Documento XCAF de OpenCASCADE (lo mismo que lee FreeCAD): nombre en producto e instancia, color en cada pieza."""
    def __init__(self):
        from OCP.TDocStd import TDocStd_Document
        from OCP.TCollection import TCollection_ExtendedString
        from OCP.XCAFDoc import XCAFDoc_DocumentTool
        self.doc = TDocStd_Document(TCollection_ExtendedString("XmlXCAF"))
        self.st = XCAFDoc_DocumentTool.ShapeTool_s(self.doc.Main())
        self.ct = XCAFDoc_DocumentTool.ColorTool_s(self.doc.Main())

    def _nombrar(self, lab, nom):
        from OCP.TDataStd import TDataStd_Name
        from OCP.TCollection import TCollection_ExtendedString
        TDataStd_Name.Set_s(lab, TCollection_ExtendedString(nom))

    def grupo(self, nom):
        lab = self.st.NewShape()
        self._nombrar(lab, nom)
        return lab

    def pieza(self, forma, nom, color):
        from OCP.Quantity import Quantity_Color, Quantity_TOC_RGB
        from OCP.XCAFDoc import XCAFDoc_ColorType
        lab = self.st.AddShape(forma.wrapped, False, False)
        self._nombrar(lab, nom)
        c = Quantity_Color(*[float(v) for v in color], Quantity_TOC_RGB)
        for t in (XCAFDoc_ColorType.XCAFDoc_ColorGen, XCAFDoc_ColorType.XCAFDoc_ColorSurf):
            self.ct.SetColor(lab, c, t)
        return lab

    def meter(self, padre, hijo, nom):
        from OCP.TopLoc import TopLoc_Location
        comp = self.st.AddComponent(padre, hijo, TopLoc_Location())
        self._nombrar(comp, nom)

    def guardar(self, raiz, salida):
        from OCP.STEPCAFControl import STEPCAFControl_Writer
        from OCP.STEPControl import STEPControl_AsIs
        from OCP.Interface import Interface_Static
        from OCP.IFSelect import IFSelect_RetDone
        self.st.UpdateAssemblies()
        Interface_Static.SetCVal_s("write.step.schema", "AP214IS")
        Interface_Static.SetCVal_s("write.step.unit", "MM")
        Interface_Static.SetCVal_s("write.step.product.name", "Alcoholimetro")
        w = STEPCAFControl_Writer()
        w.SetNameMode(True); w.SetColorMode(True)
        assert w.Transfer(self.doc, STEPControl_AsIs)
        assert w.Write(salida) == IFSelect_RetDone


def construir_conjunto(m, salida):
    D = DocStep()
    k = m.cotas
    nraiz = f"Alcoholimetro {m.letra} {k['W']:g}x{k['D']:g}x{k['H']:g} mm"
    raiz = D.grupo(nraiz)
    usados, cuenta = set(), {}
    for g_nombre, cond in GRUPOS:
        piezas = [p for p in m.piezas if p["id"] not in usados and cond(p)]
        if not piezas:
            continue
        g = D.grupo(g_nombre)
        for p in piezas:
            usados.add(p["id"])
            nom = nombre_seguro(f"{p['id']} {p['nombre']}")
            subs = [s for s in p["subs"] if s[1] is not None]
            if len(subs) <= 1:
                D.meter(g, D.pieza(p["solido"], nom, p["color"]), nom)
            else:
                sa = D.grupo(nom)
                for n_, (sn, ss, sc) in enumerate(subs):
                    ns = nombre_seguro(f"{p['id']}.{n_ + 1} {sn}")
                    D.meter(sa, D.pieza(ss, ns, sc), ns)
                D.meter(g, sa, nom)
        D.meter(raiz, g, g_nombre)
        cuenta[g_nombre] = len(piezas)
    faltan = [p["id"] for p in m.piezas if p["id"] not in usados]
    assert not faltan, faltan
    g = D.grupo("09 Cables y tubos")
    vistos = {}
    for c in m.cables:
        base = nombre_seguro(c["nombre"])
        vistos[base] = vistos.get(base, 0) + 1
        nom = base if vistos[base] == 1 else f"{base} ({vistos[base]})"
        D.meter(g, D.pieza(solido_cable(c), nom, c["color"]), nom)
    D.meter(raiz, g, "09 Cables y tubos")
    cuenta["09 Cables y tubos"] = len(m.cables)
    D.guardar(raiz, salida)
    return cuenta


if __name__ == "__main__":
    salida = sys.argv[1]
    m = diseno.construir(specs.SPEC_A)
    cuenta = construir_conjunto(m, salida)
    print(salida, f"{os.path.getsize(salida) / 1e6:.1f} MB", cuenta)
