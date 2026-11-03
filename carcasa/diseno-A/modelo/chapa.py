"""
Chapa plegada: una pieza = varias caras planas unidas por pliegues de 90°.

Cada cara se da como su caja "en esquina viva" (como si las esquinas no tuvieran radio), en coordenadas del modelo,
con sus recortes. Cada pliegue une una cara madre con una cara hija; la hija llega hasta la cara exterior de la madre
y la madre hasta la cara exterior de la hija (esquina viva). A partir de ahí se calcula:
  - el sólido plegado real: las caras se recortan r + t en la esquina y se añade el tramo curvo (radio interior r);
  - el desarrollo plano: cada cara se gira hasta el plano de la cara base y entre cara y cara queda la "longitud del
    pliegue" (BA = π/2 · (r + K·t)), con las líneas de pliegue y su sentido.

Convenios: todos los pliegues son de 90°, las caras son paralelas a los planos XY, XZ o YZ.
Radio interior por defecto = espesor (1,5 mm) y factor K = 0,33 (plegado al aire, acero DC01). El taller puede
rehacer el desarrollo con sus propios valores a partir del STEP plegado.
"""
import math
import numpy as np
import cadquery as cq
from comp import box, cyl
from geo import place

K_DEF = 0.33
EJES = "xyz"


def _bb(b):
    return dict(lo=[b[0], b[2], b[4]], hi=[b[1], b[3], b[5]])


def _caja(lo, hi):
    return box(lo[0], hi[0], lo[1], hi[1], lo[2], hi[2])


def _corta(s, cortes):
    for c in cortes:
        s = s.cut(c)
    return s


class Chapa:
    def __init__(self, nombre, t=1.5, r=None, k=K_DEF):
        self.nombre, self.t = nombre, t
        self.r = t if r is None else r
        self.k = k
        self.ba = math.pi / 2 * (self.r + self.k * self.t)        # longitud desarrollada de un pliegue de 90°
        self.caras = {}                                           # nombre -> dict(lo, hi, n, cortes)
        self.orden = []
        self.pliegues = []
        self.base = None
        self.vista = None

    # ------------------------------------------------------------------ definición
    def cara(self, nombre, caja, cortes=()):
        d = _bb(caja)
        ext = [d["hi"][i] - d["lo"][i] for i in range(3)]
        n = min(range(3), key=lambda i: ext[i])
        assert abs(ext[n] - self.t) < 1e-6, f"{self.nombre}/{nombre}: el espesor de la cara no es {self.t} ({ext})"
        d.update(n=n, cortes=list(cortes), nombre=nombre)
        self.caras[nombre] = d
        self.orden.append(nombre)
        if self.base is None:
            self.base = nombre
        return self

    def corte(self, nombre_cara, *cortes):
        self.caras[nombre_cara]["cortes"].extend(cortes)
        return self

    def pliegue(self, madre, hija, rangos=None, nombre=None):
        """rangos: lista de (w0, w1) a lo largo del eje del pliegue donde se dobla (por defecto, lo común a las dos caras).
        Varios tramos = el pliegue se interrumpe (p. ej. ventanas que cruzan la línea de pliegue)."""
        A, B = self.caras[madre], self.caras[hija]
        a, b = A["n"], B["n"]
        assert a != b, f"{madre}/{hija}: caras paralelas"
        w = 3 - a - b
        ca = lambda F, i: (F["lo"][i] + F["hi"][i]) / 2
        s_a = 1 if ca(B, a) > ca(A, a) else -1                    # hacia dónde sale la hija respecto a la madre
        s_b = 1 if ca(A, b) > ca(B, b) else -1                    # hacia dónde se extiende la madre respecto a la hija
        A_out = A["lo"][a] if s_a > 0 else A["hi"][a]            # cara exterior del pliegue en la madre
        B_out = B["lo"][b] if s_b > 0 else B["hi"][b]            # y en la hija
        hija_a = B["lo"][a] if s_a > 0 else B["hi"][a]
        madre_b = A["lo"][b] if s_b > 0 else A["hi"][b]
        assert abs(hija_a - A_out) < 1e-6, f"{self.nombre} {madre}->{hija}: la hija no llega a la cara exterior de la madre ({hija_a} vs {A_out})"
        assert abs(madre_b - B_out) < 1e-6, f"{self.nombre} {madre}->{hija}: la madre no llega a la cara exterior de la hija ({madre_b} vs {B_out})"
        if rangos is None:
            rangos = [(max(A["lo"][w], B["lo"][w]), min(A["hi"][w], B["hi"][w]))]
        for w0, w1 in rangos:
            assert w1 > w0
        self.pliegues.append(dict(madre=madre, hija=hija, a=a, b=b, w=w, s_a=s_a, s_b=s_b, A_out=A_out, B_out=B_out,
                                  rangos=list(rangos), nombre=nombre or f"P{len(self.pliegues) + 1}"))
        return self

    # ------------------------------------------------------------------ geometría
    def _madre_de(self, cara):
        for p in self.pliegues:
            if p["hija"] == cara:
                return p
        return None

    def _cara_recortada(self, nombre):
        """Cara con sus recortes y con las esquinas de los pliegues quitadas (r + t)."""
        F = self.caras[nombre]
        s = _caja(F["lo"], F["hi"])
        rt = self.r + self.t
        quitar = []
        for p in self.pliegues:
            if p["madre"] == nombre:                               # la madre se recorta solo donde dobla
                for w0, w1 in p["rangos"]:
                    lo, hi = list(F["lo"]), list(F["hi"])
                    b = p["b"]
                    lo[b], hi[b] = sorted((p["B_out"], p["B_out"] + p["s_b"] * rt))
                    lo[p["w"]], hi[p["w"]] = w0, w1
                    lo[b] -= 1e-3 if p["s_b"] > 0 else 0
                    hi[b] += 1e-3 if p["s_b"] < 0 else 0
                    quitar.append(_caja(lo, hi))
            if p["hija"] == nombre:                                # la hija se recorta en toda su longitud
                lo, hi = list(F["lo"]), list(F["hi"])
                a = p["a"]
                lo[a], hi[a] = sorted((p["A_out"], p["A_out"] + p["s_a"] * rt))
                lo[a] -= 1e-3 if p["s_a"] > 0 else 0
                hi[a] += 1e-3 if p["s_a"] < 0 else 0
                lo[p["w"]] -= 1; hi[p["w"]] += 1
                quitar.append(_caja(lo, hi))
        return _corta(s, F["cortes"] + quitar)

    def _tramo_curvo(self, p, w0, w1):
        a, b, w = p["a"], p["b"], p["w"]
        rt = self.r + self.t
        ax = [0.0, 0.0, 0.0]
        ax[a] = p["A_out"] + p["s_a"] * rt
        ax[b] = p["B_out"] + p["s_b"] * rt
        ax[w] = w0
        d = [0, 0, 0]; d[w] = 1
        L = w1 - w0
        anillo = cyl(rt, L, tuple(ax), tuple(d)).cut(cyl(self.r, L, tuple(ax), tuple(d)))
        lo, hi = [0, 0, 0], [0, 0, 0]
        lo[a], hi[a] = sorted((ax[a], ax[a] - p["s_a"] * rt))
        lo[b], hi[b] = sorted((ax[b], ax[b] - p["s_b"] * rt))
        lo[w], hi[w] = w0, w1
        return anillo.intersect(_caja(lo, hi))

    def solido(self):
        partes = [self._cara_recortada(n) for n in self.orden]
        for p in self.pliegues:
            for w0, w1 in p["rangos"]:
                partes.append(self._tramo_curvo(p, w0, w1))
        s = partes[0].fuse(*partes[1:]) if len(partes) > 1 else partes[0]
        return s.clean()

    # ------------------------------------------------------------------ desarrollo
    def _trf_local(self, p):
        """Transformación que lleva la hija de su posición plegada al plano de la madre (desplegada)."""
        a, b, w = p["a"], p["b"], p["w"]
        e = np.eye(3)
        e1, e2 = p["s_a"] * e[a], p["s_b"] * e[b]
        # R: e1 -> -e2, e2 -> e1, e_w -> e_w
        R = np.outer(-e2, e1) + np.outer(e1, e2) + np.outer(e[w], e[w])
        rt = self.r + self.t
        P0 = np.zeros(3); P0[a] = p["A_out"] + p["s_a"] * rt; P0[b] = p["B_out"]
        P1 = np.zeros(3); P1[a] = p["A_out"]; P1[b] = p["B_out"] + p["s_b"] * rt - p["s_b"] * self.ba
        return R, P1 - R @ P0

    def _trf(self, cara):
        p = self._madre_de(cara)
        if p is None:
            return np.eye(3), np.zeros(3)
        Rm, tm = self._trf(p["madre"])
        Rl, tl = self._trf_local(p)
        return Rm @ Rl, Rm @ tl + tm

    def _aplica(self, s, R, t):
        return place(s, ex=tuple(R[:, 0]), ey=tuple(R[:, 1]), ez=tuple(R[:, 2]), at=tuple(t))

    def desarrollo(self):
        """Devuelve (sólido plano en el plano de la cara base, lista de líneas de pliegue)."""
        partes, lineas = [], []
        for n in self.orden:
            R, t = self._trf(n)
            partes.append(self._aplica(self._cara_recortada(n), R, t))
        rt = self.r + self.t
        for p in self.pliegues:
            A = self.caras[p["madre"]]
            R, t = self._trf(p["madre"])
            a, b, w = p["a"], p["b"], p["w"]
            b_t = p["B_out"] + p["s_b"] * rt
            for w0, w1 in p["rangos"]:
                lo, hi = list(A["lo"]), list(A["hi"])
                lo[b], hi[b] = sorted((b_t, b_t - p["s_b"] * self.ba))
                lo[w], hi[w] = w0, w1
                partes.append(self._aplica(_caja(lo, hi), R, t))
                q0, q1 = np.zeros(3), np.zeros(3)
                for q, ww in ((q0, w0), (q1, w1)):
                    q[a] = p["A_out"]; q[b] = b_t - p["s_b"] * self.ba / 2; q[w] = ww
                d = np.zeros(3); d[a] = p["s_a"]                    # sentido en que se dobla la hija
                lineas.append(dict(nombre=p["nombre"], p0=R @ q0 + t, p1=R @ q1 + t, sentido=R @ d,
                                   madre=p["madre"], hija=p["hija"]))
        s = partes[0].fuse(*partes[1:]).clean() if len(partes) > 1 else partes[0]
        return s, lineas

    # ------------------------------------------------------------------ vista 2D del desarrollo
    def plano_2d(self, vista=None, arriba=None):
        """Lleva el desarrollo al plano XY visto desde 'vista' (vector del observador hacia la pieza).
        Devuelve (cara 2D vista, líneas de pliegue 2D con sentido 'arriba'/'abajo', ancho, alto)."""
        flat, lineas = self.desarrollo()
        nb = self.caras[self.base]["n"]
        if vista is None:
            vista = self.vista or self._vista_por_defecto()
        v = np.array(vista, float)
        assert abs(abs(v[nb]) - 1) < 1e-9, "la vista debe ser perpendicular a la cara base"
        if arriba is None:
            arriba = (0, 0, 1) if nb != 2 else (0, 1, 0)
        sy = np.array(arriba, float)
        tv = -v                                                    # hacia el observador
        sx = np.cross(sy, tv)
        M = np.vstack([sx, sy, tv])                                # filas: coordenadas de pantalla
        fl = place(flat, ex=tuple(M[:, 0]), ey=tuple(M[:, 1]), ez=tuple(M[:, 2]), at=(0, 0, 0))
        caras_z = [f for f in fl.Faces() if f.normalAt().z > 0.99]
        cara = max(caras_z, key=lambda f: (round(f.Center().z, 3), f.Area()))
        bb = cara.BoundingBox()
        off = np.array([-bb.xmin, -bb.ymin, -bb.zmax])
        cara = cara.translate(cq.Vector(*off))
        l2 = []
        for L in lineas:
            p0, p1 = M @ L["p0"] + off, M @ L["p1"] + off
            sd = M @ L["sentido"]
            l2.append(dict(nombre=L["nombre"], p0=p0[:2], p1=p1[:2], sentido=("arriba" if sd[2] > 0 else "abajo"),
                           madre=L["madre"], hija=L["hija"]))
        return cara, l2, bb.xlen, bb.ylen

    def _vista_por_defecto(self):
        """Se mira la base desde fuera: desde el lado contrario al que salen la mayoría de las pestañas."""
        nb = self.caras[self.base]["n"]
        lados = [p["s_a"] for p in self.pliegues if p["madre"] == self.base]
        s = 1 if sum(lados) >= 0 else -1
        v = [0, 0, 0]; v[nb] = s
        return tuple(v)

    def resumen(self):
        """Datos de cada pliegue para la tabla del plano."""
        out = []
        for p in self.pliegues:
            L = sum(w1 - w0 for w0, w1 in p["rangos"])
            out.append(dict(nombre=p["nombre"], madre=p["madre"], hija=p["hija"], largo=round(L, 1), tramos=len(p["rangos"])))
        return out


# ---------------------------------------------------------------------- DXF
def coma(x, d=1):
    return f"{x:.{d}f}".replace(".", ",")


def escribir_dxf(cara, lineas, ruta, textos, ch=None):
    """DXF de corte: contorno y agujeros (capa CORTE), líneas de pliegue discontinuas con su nombre y sentido (capa PLIEGUES)
    y textos (capa TEXTO). 'cara' es una cara plana en el plano XY con la esquina en el origen."""
    from cadquery.occ_impl.exporters.dxf import DxfDocument
    doc = DxfDocument(setup=True)
    doc.add_layer("CORTE", color=7)
    doc.add_layer("PLIEGUES", color=1, linetype="DASHED")
    doc.add_layer("TEXTO", color=3)
    doc.add_shape(cara, "CORTE")
    ms = doc.document.modelspace()
    for L in lineas:
        ms.add_line(tuple(L["p0"]), tuple(L["p1"]), dxfattribs={"layer": "PLIEGUES", "linetype": "DASHED"})
        mx, my = (L["p0"] + L["p1"]) / 2
        horiz = abs(L["p1"][0] - L["p0"][0]) > abs(L["p1"][1] - L["p0"][1])
        t = ms.add_text(f"{L['nombre']} 90° {L['sentido'].upper()}", height=2.5,
                        dxfattribs={"layer": "TEXTO", "rotation": 0 if horiz else 90})
        t.set_placement((mx + (0 if horiz else -1.5), my + (1.0 if horiz else 0)))
    textos = list(textos)
    if ch is not None:
        textos.append(f"Pliegues a 90°, radio interior {coma(ch.r)} mm, factor K {coma(ch.k, 2)} (BA {coma(ch.ba, 2)} mm). "
                      "Vista desde la cara exterior: ABAJO = la pestaña se dobla alejándose del que mira")
    y = -8
    for tx in textos:
        ms.add_text(tx, height=3, dxfattribs={"layer": "TEXTO"}).set_placement((0, y))
        y -= 5
    doc.document.saveas(ruta)
