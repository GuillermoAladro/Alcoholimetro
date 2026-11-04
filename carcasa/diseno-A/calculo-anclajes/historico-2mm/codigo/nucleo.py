"""
nucleo.py — Modelos de cálculo del anclaje a pared del alcoholímetro (diseño A, rama programa-raspberry).

Ejes (vista desde delante, mirando la pared):
  x  horizontal en el plano de la pared (+ derecha), origen en el eje de la máquina
  z  vertical (+ arriba), z = 0 en la cara inferior de la carcasa
  n  normal a la pared (+ hacia fuera, hacia el usuario), n = 0 en la cara trasera de la chapa

Modelos:
  1) FEM  : chapa trasera (placa de Kirchhoff, elemento rectangular ACM de 12 GDL) unida a la caja
            (sólido rígido) por las líneas rígidas reales (pliegues de laterales, pestaña soldada de la
            bandeja, suelo plegado), anclajes = muelles axiales solo-tracción con arandela rígida, y
            contacto unilateral (solo compresión) chapa-pared tipo Winkler.
  2) RIGIDA: misma física pero con la chapa perfectamente rígida (3 GDL) -> "modelo analítico".
  3) CLASICO: método de libro (pivote en el canto inferior / lateral, reparto lineal) -> solo para
            contrastar los números preliminares.
Cortante en el plano: chapa rígida en su plano, reparto elástico (traslación + torsión polar).
"""
import math
import numpy as np
import scipy.sparse as sp
import scipy.sparse.linalg as spla

G_ACC = 9.81

# ----------------------------------------------------------------------------- geometría (verificada en diseno.py)
W = 220.0                 # ancho exterior
HW = 440.5                # alto de la trasera (Hw = zi0 + T + BANDA = 407,5 + 2 + 31)
H_TOT = 442.5             # alto total con la tapa (Hw + T)
D_FONDO = 100.0           # fondo exterior
T = 2.0                   # chapa DC01
E_ACERO = 210000.0
NU = 0.3
D_PLACA = E_ACERO * T ** 3 / (12 * (1 - NU ** 2))
R_ARANDELA = 9.0          # DIN 9021 M6: Ø18
Z_HUECO = 150.0           # el lateral izquierdo no existe por debajo (hueco del cajón de pajitas)
Z_BANDEJA = (150.5, 163.5)   # pestaña trasera de la bandeja, soldada a la trasera (ZS1 - 13 ... ZS1)
Z_APOYO = (405.5, 417.5)     # ala del apoyo trasero de la tapa interior (soldada)
Z_LAT_DER = (4.0, 439.6)     # pliegue trasera-lateral derecho (rangos=(RT, Hr - BAJA_D))
Z_LAT_IZQ = (150.0, 440.5)   # pliegue trasera-lateral izquierdo (rangos=(Z_HUECO, Hw))
X_SUELO = 106.0              # el suelo va de -W/2+RT a W/2-RT
GUIAS = [(-71.0, -61.0), (61.0, 71.0)]   # alas de las guías traseras soldadas, z de 173,5 a 391,5
Z_GUIAS = (173.5, 391.5)
ESPARRAGO = (50.0, 376.5)    # espárrago de tierra M4 en la trasera

# ----------------------------------------------------------------------------- zonas admisibles para el CENTRO del agujero
X_MAX = 95.0                 # arandela Ø18 en la zona plana (cara interior del lateral en ±108, radio de pliegue 2) + llave
ZONAS = [
    dict(nombre="Z1 detrás del cajón de pajitas", x=(-X_MAX, X_MAX), z=(18.0, 139.5)),
    dict(nombre="Z2 detrás del cajón de componentes", x=(-X_MAX, X_MAX), z=(174.5, 394.5)),
    dict(nombre="Z3 franja superior (entre apoyo de la tapa interior y canto)", x=(-X_MAX, X_MAX), z=(427.5, 430.5)),
]
HOLG = 11.0                  # radio arandela 9 + 2 mm a pestañas/soldaduras
EXCL_RECT = [  # (x0, x1, z0, z1): el centro no puede caer dentro
    (-71.0 - HOLG + 1, -61.0 + HOLG - 1, Z_GUIAS[0] - HOLG, Z_GUIAS[1] + HOLG),   # guía izquierda: |x| en (51, 81)
    (61.0 - HOLG + 1, 71.0 + HOLG - 1, Z_GUIAS[0] - HOLG, Z_GUIAS[1] + HOLG),
]
EXCL_CIRC = [(ESPARRAGO[0], ESPARRAGO[1], 16.0)]  # espárrago de tierra + ojal + arandela


def en_zona(x, z, tol=1e-6):
    ok = any(zn["x"][0] - tol <= x <= zn["x"][1] + tol and zn["z"][0] - tol <= z <= zn["z"][1] + tol for zn in ZONAS)
    if not ok:
        return False
    for x0, x1, z0, z1 in EXCL_RECT:
        if x0 < x < x1 and z0 < z < z1:
            return False
    for cx, cz, r in EXCL_CIRC:
        if (x - cx) ** 2 + (z - cz) ** 2 < r ** 2:
            return False
    return True


def proyectar(x, z):
    """Punto admisible más cercano (búsqueda local en malla fina alrededor)."""
    if en_zona(x, z):
        return x, z
    best, bd = None, 1e18
    for zn in ZONAS:
        cx = min(max(x, zn["x"][0]), zn["x"][1])
        cz = min(max(z, zn["z"][0]), zn["z"][1])
        cands = [(cx, cz)]
        for x0, x1, z0, z1 in EXCL_RECT:
            cands += [(x0, cz), (x1, cz)]
        for cx2, cz2, r in EXCL_CIRC:
            ang = math.atan2(cz - cz2, cx - cx2)
            cands.append((cx2 + (r + 0.01) * math.cos(ang), cz2 + (r + 0.01) * math.sin(ang)))
        for px, pz in cands:
            px = min(max(px, zn["x"][0]), zn["x"][1])
            pz = min(max(pz, zn["z"][0]), zn["z"][1])
            if en_zona(px, pz):
                d = (px - x) ** 2 + (pz - z) ** 2
                if d < bd:
                    best, bd = (px, pz), d
    return best


# ----------------------------------------------------------------------------- elemento ACM
def _P(x, z):
    return np.array([1, x, z, x * x, x * z, z * z, x ** 3, x * x * z, x * z * z, z ** 3, x ** 3 * z, x * z ** 3])


def _Px(x, z):
    return np.array([0, 1, 0, 2 * x, z, 0, 3 * x * x, 2 * x * z, z * z, 0, 3 * x * x * z, z ** 3])


def _Pz(x, z):
    return np.array([0, 0, 1, 0, x, 2 * z, 0, x * x, 2 * x * z, 3 * z * z, x ** 3, 3 * x * z * z])


def _B(x, z):
    pxx = np.array([0, 0, 0, 2, 0, 0, 6 * x, 2 * z, 0, 0, 6 * x * z, 0])
    pzz = np.array([0, 0, 0, 0, 0, 2, 0, 0, 2 * x, 6 * z, 0, 6 * x * z])
    pxz = np.array([0, 0, 0, 0, 1, 0, 0, 2 * x, 2 * z, 0, 3 * x * x, 3 * z * z])
    return np.vstack([pxx, pzz, 2 * pxz])


_ACM_CACHE = {}


def acm(a, b, Dp):
    key = (round(a, 6), round(b, 6), round(Dp, 3))
    if key in _ACM_CACHE:
        return _ACM_CACHE[key]
    nodes = [(0, 0), (a, 0), (a, b), (0, b)]
    A = np.array([f(x, z) for (x, z) in nodes for f in (_P, _Px, _Pz)], dtype=float)
    Ai = np.linalg.inv(A)
    Dm = Dp * np.array([[1, NU, 0], [NU, 1, 0], [0, 0, (1 - NU) / 2]])
    g, wg = np.polynomial.legendre.leggauss(4)
    Kc = np.zeros((12, 12))
    for gi, wi in zip(g, wg):
        for gj, wj in zip(g, wg):
            x, z = a * (gi + 1) / 2, b * (gj + 1) / 2
            B = _B(x, z)
            Kc += wi * wj * (a * b / 4) * B.T @ Dm @ B
    K = Ai.T @ Kc @ Ai
    _ACM_CACHE[key] = (K, Ai, Dm)
    return _ACM_CACHE[key]


def _rejilla(lineas, h):
    lineas = sorted(set(round(v, 6) for v in lineas))
    out = [lineas[0]]
    for a, b in zip(lineas[:-1], lineas[1:]):
        n = max(1, int(math.ceil((b - a) / h - 1e-9)))
        out += list(np.linspace(a, b, n + 1)[1:])
    return np.array(out)


# ----------------------------------------------------------------------------- modelo FEM
class ModeloFEM:
    """Chapa trasera + caja rígida + anclajes + contacto unilateral.
    GDL: 3 por nudo (w, dw/dx, dw/dz) + caja (a0, b, c: u_n = a0 + b z + c x) + giro del suelo (phi)."""

    def __init__(self, h=20.0, ka=2000.0, kw=50.0, kp=1e8, arandela=True, rigida=False, suelo_libre=True, empotrado=False):
        self.h, self.ka, self.kw, self.kp, self.arandela = h, ka, kw, kp, arandela
        self.empotrado = empotrado
        Dp = D_PLACA * (1e4 if rigida else 1.0)
        xl = [-W / 2, W / 2, -X_SUELO, X_SUELO, 0.0]
        zl = [0.0, HW, Z_BANDEJA[0], Z_BANDEJA[1], Z_APOYO[0], Z_APOYO[1], Z_HUECO, 4.0]
        self.xs, self.zs = _rejilla(xl, h), _rejilla(zl, h)
        nx, nz = len(self.xs), len(self.zs)
        self.nx, self.nz = nx, nz
        self.nn = nx * nz
        self.ib = 3 * self.nn          # a0, b, c
        self.iphi = self.ib + 3        # giro del suelo
        self.ndof = self.ib + 4
        X, Z = np.meshgrid(self.xs, self.zs)        # [j, i]
        self.X, self.Z = X.ravel(), Z.ravel()
        rows, cols, vals = [], [], []
        for j in range(nz - 1):
            for i in range(nx - 1):
                a, b = self.xs[i + 1] - self.xs[i], self.zs[j + 1] - self.zs[j]
                K, _, _ = acm(a, b, Dp)
                ns = [i + j * nx, i + 1 + j * nx, i + 1 + (j + 1) * nx, i + (j + 1) * nx]
                dofs = np.array([3 * n + k for n in ns for k in range(3)])
                rows.append(np.repeat(dofs, 12)); cols.append(np.tile(dofs, 12)); vals.append(K.ravel())
        # restricciones (penalización): líneas unidas a la caja
        cons = []
        for n in range(self.nn):
            x, z = self.X[n], self.Z[n]
            caja = None
            if abs(x - W / 2) < 1e-6 and Z_LAT_DER[0] - 1e-6 <= z <= Z_LAT_DER[1] + 1e-6:
                caja = True
            if abs(x + W / 2) < 1e-6 and Z_LAT_IZQ[0] - 1e-6 <= z <= Z_LAT_IZQ[1] + 1e-6:
                caja = True
            if Z_BANDEJA[0] - 1e-6 <= z <= Z_BANDEJA[1] + 1e-6:
                caja = True
            if caja:
                cons.append(([3 * n, self.ib, self.ib + 1, self.ib + 2], [1.0, -1.0, -z, -x]))
                lateral = abs(abs(x) - W / 2) < 1e-6 and not (Z_BANDEJA[0] - 1e-6 <= z <= Z_BANDEJA[1] + 1e-6)
                if empotrado and lateral:
                    # el lateral (unido al frontal) impide el giro del pliegue: pendiente dw/dx = la de la caja (c)
                    cons.append(([3 * n + 1, self.ib + 2], [1.0, -1.0]))
            elif abs(z) < 1e-6 and abs(x) <= X_SUELO + 1e-6:
                # suelo plegado: viga muy rígida en su plano, articulada a la caja en la esquina derecha
                if suelo_libre:
                    cons.append(([3 * n, self.ib, self.ib + 2, self.iphi], [1.0, -1.0, -X_SUELO, -(x - X_SUELO)]))
                else:
                    cons.append(([3 * n, self.ib, self.ib + 1, self.ib + 2], [1.0, -1.0, -z, -x]))
        for d, c in cons:
            d, c = np.array(d), np.array(c)
            rows.append(np.repeat(d, len(d))); cols.append(np.tile(d, len(d))); vals.append(kp * np.outer(c, c).ravel())
        if not suelo_libre:
            rows.append(np.array([self.iphi])); cols.append(np.array([self.iphi])); vals.append(np.array([1.0]))
        # regularización mínima
        rows.append(np.arange(self.ndof)); cols.append(np.arange(self.ndof)); vals.append(np.full(self.ndof, 1e-6))
        self.K0 = sp.coo_matrix((np.concatenate(vals), (np.concatenate(rows), np.concatenate(cols))),
                                shape=(self.ndof, self.ndof)).tocsc()
        # áreas tributarias para el contacto
        dx = np.gradient(self.xs) if nx > 1 else np.ones(1)
        dz = np.gradient(self.zs)
        ax = np.zeros(nx); ax[0] = (self.xs[1] - self.xs[0]) / 2; ax[-1] = (self.xs[-1] - self.xs[-2]) / 2
        ax[1:-1] = (self.xs[2:] - self.xs[:-2]) / 2
        az = np.zeros(nz); az[0] = (self.zs[1] - self.zs[0]) / 2; az[-1] = (self.zs[-1] - self.zs[-2]) / 2
        az[1:-1] = (self.zs[2:] - self.zs[:-2]) / 2
        self.atrib = np.outer(az, ax).ravel()
        self.kc = kw * self.atrib

    # -- interpolación de w en un punto
    def _elem(self, x, z):
        i = int(np.clip(np.searchsorted(self.xs, x) - 1, 0, self.nx - 2))
        j = int(np.clip(np.searchsorted(self.zs, z) - 1, 0, self.nz - 2))
        a, b = self.xs[i + 1] - self.xs[i], self.zs[j + 1] - self.zs[j]
        _, Ai, Dm = acm(a, b, D_PLACA)
        nx = self.nx
        ns = [i + j * nx, i + 1 + j * nx, i + 1 + (j + 1) * nx, i + (j + 1) * nx]
        dofs = np.array([3 * n + k for n in ns for k in range(3)])
        return dofs, Ai, Dm, x - self.xs[i], z - self.zs[j]

    def N(self, x, z):
        dofs, Ai, _, xl, zl = self._elem(x, z)
        return dofs, _P(xl, zl) @ Ai

    def momentos(self, u, x, z):
        dofs, Ai, Dm, xl, zl = self._elem(x, z)
        return Dm @ _B(xl, zl) @ Ai @ u[dofs]

    # -- anclajes
    def preparar(self, pts):
        """Para cada anclaje: GDL maestros extra (w, sx, sz) si hay arandela rígida, y vectores de interpolación."""
        self.pts = np.asarray(pts, float)
        na = len(self.pts)
        self.ndof_t = self.ndof + (3 * na if self.arandela else 0)
        rows, cols, vals = [], [], []
        self.a_int = []
        for k, (xa, za) in enumerate(self.pts):
            if self.arandela:
                m = self.ndof + 3 * k
                cpts = [(xa, za)] + [(xa + R_ARANDELA * math.cos(t), za + R_ARANDELA * math.sin(t))
                                     for t in np.linspace(0, 2 * math.pi, 8, endpoint=False)]
                for px, pz in cpts:
                    px = min(max(px, -W / 2), W / 2); pz = min(max(pz, 0.0), HW)
                    d, Nv = self.N(px, pz)
                    dd = np.concatenate([d, [m, m + 1, m + 2]])
                    cc = np.concatenate([Nv, [-1.0, -(px - xa), -(pz - za)]])
                    rows.append(np.repeat(dd, len(dd))); cols.append(np.tile(dd, len(dd)))
                    vals.append(self.kp * 1e-2 * np.outer(cc, cc).ravel())
                self.a_int.append((np.array([m]), np.array([1.0])))
            else:
                self.a_int.append(self.N(xa, za))
        nd = self.ndof_t
        K0 = self.K0.tocoo()
        r0 = [K0.row, np.concatenate(rows) if rows else np.zeros(0, int), np.arange(self.ndof, nd)]
        c0 = [K0.col, np.concatenate(cols) if cols else np.zeros(0, int), np.arange(self.ndof, nd)]
        v0 = [K0.data, np.concatenate(vals) if vals else np.zeros(0), np.full(nd - self.ndof, 1e-6)]
        self.kb = (np.concatenate(r0), np.concatenate(c0), np.concatenate(v0))
        # anclajes (cada uno: ka * v v^T) en formato coo
        self.ka_coo = []
        for d, v in self.a_int:
            self.ka_coo.append((np.repeat(d, len(d)), np.tile(d, len(d)), self.ka * np.outer(v, v).ravel()))
        self.wdofs = 3 * np.arange(self.nn)
        self._warm = {}

    def resolver(self, Q, activos=None, maxit=40, clave=None):
        """Q = (Qa, Qb, Qc). activos: máscara de anclajes existentes (para simular pérdidas).
        clave: identificador del caso para arrancar con el conjunto de contacto de la última vez."""
        na = len(self.pts)
        exist = np.ones(na, bool) if activos is None else np.asarray(activos, bool)
        nd = self.ndof_t
        f = np.zeros(nd)
        f[self.ib:self.ib + 3] = Q
        a_act = exist.copy()
        c_act = np.zeros(self.nn, bool)
        if clave is not None and clave in self._warm:
            c_act = self._warm[clave].copy()
        for it in range(maxit):
            R, C, V = [self.kb[0]], [self.kb[1]], [self.kb[2]]
            for k in np.nonzero(a_act)[0]:
                r, c, v = self.ka_coo[k]; R.append(r); C.append(c); V.append(v)
            R.append(self.wdofs[c_act]); C.append(self.wdofs[c_act]); V.append(self.kc[c_act])
            K = sp.csc_matrix((np.concatenate(V), (np.concatenate(R), np.concatenate(C))), shape=(nd, nd))
            u = spla.splu(K).solve(f)
            wa = np.array([v @ u[d] for d, v in self.a_int])
            wn = u[self.wdofs]
            na_act = exist & (wa > -1e-9)
            nc_act = wn < 0
            if np.array_equal(na_act, a_act) and np.array_equal(nc_act, c_act):
                break
            a_act, c_act = na_act, nc_act
        if clave is not None:
            self._warm[clave] = c_act.copy()
        Na = np.where(a_act, self.ka * np.maximum(wa, 0), 0.0)
        Fc = np.where(c_act, -self.kc * np.minimum(wn, 0), 0.0)
        return dict(u=u, N=Na, w_anc=wa, w=wn, contacto=Fc, it=it, sep_max=float(max(wn.max(), 0.0)),
                    equil=float(Na.sum() - Fc.sum() - Q[0]))


# ----------------------------------------------------------------------------- modelo de chapa rígida (analítico)
class ModeloRigido:
    """Chapa infinitamente rígida: u_n = a0 + b z + c x; anclajes solo-tracción ka; contacto Winkler solo-compresión
    sobre una malla de 5 mm de toda la trasera."""

    def __init__(self, ka=2000.0, kw=50.0, h=5.0):
        self.ka, self.kw = ka, kw
        xs = np.arange(-W / 2 + h / 2, W / 2, h); zs = np.arange(h / 2, HW, h)
        X, Z = np.meshgrid(xs, zs)
        self.cx, self.cz = X.ravel(), Z.ravel()
        self.kc = kw * h * h

    def preparar(self, pts):
        self.pts = np.asarray(pts, float)

    def resolver(self, Q, activos=None, maxit=60):
        na = len(self.pts)
        exist = np.ones(na, bool) if activos is None else np.asarray(activos, bool)
        Pa = np.column_stack([np.ones(na), self.pts[:, 1], self.pts[:, 0]])
        Pc = np.column_stack([np.ones(len(self.cx)), self.cz, self.cx])
        a_act, c_act = exist.copy(), np.zeros(len(self.cx), bool)
        for it in range(maxit):
            K = self.ka * Pa[a_act].T @ Pa[a_act] + self.kc * Pc[c_act].T @ Pc[c_act] + 1e-9 * np.eye(3)
            q = np.linalg.solve(K, np.asarray(Q, float))
            wa, wc = Pa @ q, Pc @ q
            na_act, nc_act = exist & (wa > -1e-12), wc < 0
            if np.array_equal(na_act, a_act) and np.array_equal(nc_act, c_act):
                break
            a_act, c_act = na_act, nc_act
        Na = np.where(a_act, self.ka * np.maximum(wa, 0), 0.0)
        return dict(N=Na, w_anc=wa, q=q, it=it, sep_max=float(max((Pc @ q).max(), 0)))


# ----------------------------------------------------------------------------- cortante en el plano
def cortante(pts, Fx, Fz, Mn_ref, ref, activos=None):
    """Reparto elástico, chapa rígida en su plano, misma rigidez a cortante en todos los anclajes.
    Mn_ref: momento torsor (eje n) respecto al punto ref. Devuelve (Vx, Vz) por anclaje."""
    pts = np.asarray(pts, float)
    ex = np.ones(len(pts), bool) if activos is None else np.asarray(activos, bool)
    p = pts[ex]
    x0, z0 = p[:, 0].mean(), p[:, 1].mean()
    Mn = Mn_ref + (ref[1] - z0) * Fx - (ref[0] - x0) * Fz      # trasladar el torsor al centroide
    J = ((p[:, 0] - x0) ** 2 + (p[:, 1] - z0) ** 2).sum()
    n = len(p)
    V = np.zeros((len(pts), 2))
    V[ex, 0] = Fx / n + Mn * (p[:, 1] - z0) / J
    V[ex, 1] = Fz / n - Mn * (p[:, 0] - x0) / J
    return V


# ----------------------------------------------------------------------------- cargas
def generalizadas(fuerzas):
    """fuerzas: lista de (x, n, z, Fx, Fn, Fz). Devuelve Q (fuera del plano) y (Fx, Fz, Mn) en el plano respecto a (0,0)."""
    Qa = Qb = Qc = Fx_t = Fz_t = Mn = 0.0
    for x, n, z, Fx, Fn, Fz in fuerzas:
        Qa += Fn
        Qb += z * Fn - n * Fz
        Qc += x * Fn - n * Fx
        Fx_t += Fx; Fz_t += Fz
        Mn += z * Fx - x * Fz
    return np.array([Qa, Qb, Qc]), (Fx_t, Fz_t, Mn)


# ----------------------------------------------------------------------------- versión rápida (banda + Schur) para optimizar
from scipy.linalg import cholesky_banded, cho_solve_banded


class FEMRapido:
    """Mismo modelo que ModeloFEM(arandela=False) pero resuelto con Cholesky en banda de la chapa y complemento de
    Schur para los 4 GDL de caja/suelo. Se usa en la optimización (miles de evaluaciones)."""

    def __init__(self, h=20.0, ka=2000.0, kw=50.0, kp=1e8, empotrado=False):
        b = ModeloFEM(h=h, ka=ka, kw=kw, kp=kp, arandela=False, empotrado=empotrado)
        self.b, self.ka = b, ka
        npl = 3 * b.nn
        self.npl = npl
        K0 = b.K0.tocoo()
        r, c, v = K0.row, K0.col, K0.data
        m = (r < npl) & (c < npl) & (r >= c)
        self.bw = int((r[m] - c[m]).max())
        ab = np.zeros((self.bw + 1, npl))
        np.add.at(ab, (r[m] - c[m], c[m]), v[m])
        self.ab0 = ab
        m = (r < npl) & (c >= npl)
        self.B = np.zeros((npl, 4)); np.add.at(self.B, (r[m], c[m] - npl), v[m])
        m = (r >= npl) & (c >= npl)
        self.C = np.zeros((4, 4)); np.add.at(self.C, (r[m] - npl, c[m] - npl), v[m])
        self.kc = b.kc
        self.wd = 3 * np.arange(b.nn)
        self._warm = {}

    def preparar(self, pts):
        self.pts = np.asarray(pts, float)
        self.ai = []
        for xa, za in self.pts:
            d, Nv = self.b.N(xa, za)
            o = np.argsort(d); d, Nv = d[o], Nv[o]
            I, J = np.meshgrid(np.arange(12), np.arange(12), indexing="ij")
            low = d[I] >= d[J]
            self.ai.append((d, Nv, (d[I][low] - d[J][low], d[J][low]), self.ka * np.outer(Nv, Nv)[low]))

    def resolver(self, Q, activos=None, maxit=40, clave=None):
        na = len(self.pts)
        exist = np.ones(na, bool) if activos is None else np.asarray(activos, bool)
        a_act = exist.copy()
        c_act = self._warm.get(clave, np.zeros(len(self.kc), bool)).copy() if clave is not None else np.zeros(len(self.kc), bool)
        fb = np.zeros(4); fb[:3] = Q
        for it in range(maxit):
            ab = self.ab0.copy()
            for k in np.nonzero(a_act)[0]:
                _, _, idx, vals = self.ai[k]
                np.add.at(ab, idx, vals)
            ab[0, self.wd[c_act]] += self.kc[c_act]
            cb = cholesky_banded(ab, lower=True, check_finite=False)
            X = cho_solve_banded((cb, True), self.B, check_finite=False)
            S = self.C - self.B.T @ X
            ub = np.linalg.solve(S, fb)
            up = -X @ ub
            wa = np.array([Nv @ up[d] for d, Nv, _, _ in self.ai])
            wn = up[self.wd]
            na_act = exist & (wa > -1e-9)
            nc_act = wn < 0
            if np.array_equal(na_act, a_act) and np.array_equal(nc_act, c_act):
                break
            a_act, c_act = na_act, nc_act
        if clave is not None:
            self._warm[clave] = c_act.copy()
        Na = np.where(a_act, self.ka * np.maximum(wa, 0), 0.0)
        Fc = np.where(c_act, -self.kc * np.minimum(wn, 0), 0.0)
        return dict(N=Na, w_anc=wa, w=wn, contacto=Fc, it=it, sep_max=float(max(wn.max(), 0.0)),
                    equil=float(Na.sum() - Fc.sum() - Q[0]), ub=ub)
