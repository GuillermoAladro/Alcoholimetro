"""
anclaje.py — Bloque 2: anclaje a pared del alcoholímetro (diseño A, trasera de chapa DC01 de 3 mm).

Un solo script que saca todos los números, las gráficas y la plantilla de taladros del estudio
(anclaje/ESTUDIO-ANCLAJE.md). Unidades: N, mm, N·mm. Semillas aleatorias fijas.

    python anclaje/anclaje.py                 -> todo, usando la búsqueda guardada en resultados/optimo.json
    python anclaje/anclaje.py --optimizar     -> repite además la búsqueda (evolución diferencial; ~1 h con 2 núcleos)
    python anclaje/anclaje.py --rapido        -> menos muestras de Monte Carlo (para probar)
    python anclaje/anclaje.py --mano          -> solo el contraste con el cálculo a mano

Qué reutiliza del repositorio (no se copia, se importa):
    carcasa/diseno-A/calculo-anclajes/codigo/nucleo.py  -> geometría verificada de la trasera, zonas donde se puede
        taladrar y el modelo de elementos finitos de la chapa (estudio del 04-11-2026). Aquí se usa para comprobar si la
        chapa es de verdad rígida y para el reparto final de fuerzas.
    anclaje/resultados/masa_cdg.json                     -> masa y centro de gravedad (lo escribe anclaje/masa_cdg.py desde el CAD)

Ejes (mirando a la pared, con la máquina de frente): x horizontal (+ derecha, 0 = eje de la máquina),
z vertical (0 = base), n = distancia a la pared (0 = cara de la trasera que toca la pared, 100 = frente).
"""
import argparse
import json
import math
import os
import sys
import time

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
RES = os.path.join(AQUI, "resultados")
FIG = os.path.join(AQUI, "figuras")
PLA = os.path.join(AQUI, "plantilla")
sys.path.insert(0, os.path.join(AQUI, "..", "carcasa", "diseno-A", "calculo-anclajes", "codigo"))
import nucleo as NU                                    # noqa: E402  (FEM y geometría del estudio del 04-11-2026)

G = 9.81

# =============================================================================================== 1. DATOS DE PARTIDA
# Cada dato lleva su origen: [CAD] sale de diseno.py / specs.py; [hoja] hoja de datos del fabricante; [norma];
# [cálculo]; [estimación]; [suposición].
W, HW, H_TOT, D_FONDO, T = NU.W, NU.HW, NU.H_TOT, NU.D_FONDO, NU.T       # 220 · 439,5 · 442,5 · 100 · 3 mm  [CAD]
RE_DC01, RM_DC01 = 140.0, 270.0        # MPa, mínimos de cálculo del DC01 (EN 10130: Re 140–280, Rm 270–410)   [norma]
D_AGUJERO, D_ARANDELA, T_ARANDELA = 6.5, 18.0, 1.6      # agujero de la trasera [CAD]; arandela DIN 9021 M6   [norma]
T_YESO = 15.0                          # enlucido de yeso, no resistente (10–15 mm; se toma el peor)          [suposición del encargo]

# --- masa y centro de gravedad [cálculo desde el CAD, anclaje/masa_cdg.py]
try:
    _mc = json.load(open(os.path.join(RES, "masa_cdg.json")))["total"]
    M_CAD, CG_CAD = _mc["masa"], (_mc["x"], _mc["n_pared"], _mc["z"])
except Exception:                      # valores de la ejecución del 13-11-2026, por si falta el JSON
    M_CAD, CG_CAD = 15.63, (-1.7, 49.7, 207.0)
M_CALC = 18.0                          # masa de cálculo: la del CAD + 15 % (funda, cableado real, tolerancias)   [suposición]
CG = (0.0, 55.0, 210.0)                # centro de gravedad de cálculo: 5 mm más lejos de la pared que el del CAD  [suposición]

# --- tornillo: tirafondo hexagonal DIN 571 Ø6 en INOXIDABLE A2 (decisión del 13-11-2026; antes cincado, 400 MPa)
#     (6 × 80 con el taco 8 × 65; 6 × 60 con el 8 × 40)
D_CANA, D_NUCLEO = 6.0, 4.2            # caña lisa y núcleo de la rosca                                          [norma DIN 571]
FU_CINCADO = 400.0                     # MPa, el tirafondo cincado que había: se guarda para comparar              [suposición]
FU_TORNILLO = 500.0                    # MPa. Inoxidable A2: el mínimo de su clase más baja (A2-50, ISO 3506).
#                                        Si llega marcado A2-70 son 700 y hay más margen                           [suposición]
AS_NUCLEO = math.pi * D_NUCLEO ** 2 / 4
W_CANA = math.pi * D_CANA ** 3 / 32
GAMMA_F = 1.4                          # coeficiente de acciones que fischer mete en sus «cargas recomendadas»      [hoja]
N_S_REC = AS_NUCLEO * FU_TORNILLO / 1.5 / GAMMA_F                  # tracción del tornillo, nivel «recomendado»   [cálculo]
BRAZO = T_YESO + T / 2 + D_CANA / 2    # brazo de palanca del cortante: yeso + media chapa + medio diámetro      [cálculo, EN 1992-4]
V_SM_REC = 2.0 * 1.2 * W_CANA * FU_TORNILLO / BRAZO / 1.25 / GAMMA_F   # cortante con brazo de palanca (αM = 2)   [cálculo]

# --- paredes. F_rec = carga recomendada de fischer para UN taco (vale para tracción, cortante y oblicua; ya lleva
# sus coeficientes de seguridad). Tabla de cargas «LT_SX-PLUS_EN_T1».                                             [hoja]
#   formato  = (largo, alto, junta) de la cara vista del ladrillo en el aparejo                                   [suposición del encargo]
#   s_cr     = (horizontal, vertical): separación a partir de la cual dos tacos no se estorban                    [suposición]
#   kappa    = resistencia del cono de ladrillo de un taco aislado / F_rec                                        [suposición]
#   n_pb     = arrancamiento de un ladrillo entero (EOTA TR 054), nivel «recomendado»                             [cálculo con suposiciones]
ALFA_TENDEL, ALFA_LLAGA = 0.5, 0.3     # lo que conserva un taco que cae en junta horizontal / vertical           [suposición]
GAMMA_MM = 2.5                         # coeficiente parcial de la fábrica (TR 054)                               [norma]


def _n_pb(largo, grueso_muro, fvk0):
    """Arrancamiento de un ladrillo (TR 054, llagas sin rellenar, sin carga vertical): 2·l·b·0,5·fvk0."""
    return 2.0 * largo * grueso_muro * 0.5 * fvk0 / GAMMA_MM / GAMMA_F


PAREDES = {
    "macizo": dict(nombre="Medio pie de ladrillo macizo", corto="Macizo", taco="SX Plus 8 × 65 + tirafondo 6 × 80 inox A2",
                   F_rec=800.0, formato=(240.0, 50.0, 10.0), grueso=115.0, hef=65.0 - T_YESO, s_cr=(150.0, 150.0),
                   kappa=2.4, fvk0=0.20, origen="fischer: ladrillo macizo ≥ Mz 12"),
    "perforado": dict(nombre="Medio pie de ladrillo perforado", corto="Perforado", taco="SX Plus 8 × 65 + tirafondo 6 × 80 inox A2",
                      F_rec=400.0, formato=(240.0, 70.0, 10.0), grueso=115.0, hef=65.0 - T_YESO, s_cr=(150.0, 150.0),
                      kappa=2.4, fvk0=0.20, origen="fischer: ladrillo perforado vertical ≥ HLz 12"),
    "hueco": dict(nombre="Tabique de ladrillo hueco doble (7 cm, a panderete)", corto="Hueco doble", taco="SX Plus 8 × 40 + tirafondo 6 × 60",
                  F_rec=100.0, formato=(240.0, 115.0, 10.0), grueso=70.0, hef=40.0 - T_YESO, s_cr=(240.0, 115.0),
                  kappa=1.0, fvk0=0.10, origen="fischer: ladrillo hueco «Forato F8» enlucido, solo con el 8 × 40 (el 8 × 65 no tiene valor)"),
}
for _p in PAREDES.values():
    _p["n_pb"] = _n_pb(_p["formato"][0], _p["grueso"], _p["fvk0"])
# alternativa para hueco: anclaje químico fischer FIS V con tamiz FIS H 12 × 85 K y varilla M6 (tabla de fischer para
# ladrillo perforado HLz ≥ 12, densidad ≥ 1,0): tracción 0,34 kN, cortante 0,43 kN, separación mínima 100 mm.      [hoja]
QUIMICO = dict(N_rec=340.0, V_rec=430.0, s_min=100.0)

S_MIN = 50.0                           # separación mínima entre agujeros: fischer no la publica; = c_min del 8 × 65   [suposición]
R_BROCA = 4.0                          # taladro de Ø8


# =============================================================================================== 2. CASOS DE CARGA
# Todo son suposiciones razonadas (apartado 4 del estudio). Cada fuerza: (x, n, z, Fx, Fn, Fz); Fn > 0 tira hacia fuera.
P_COLGADO, DAF_COLGADO = 120.0, 2.0    # persona de 120 kg que se deja caer colgada del borde: carga aplicada de golpe
F_TIRON = 1000.0                       # tirón con las dos manos y un pie en la pared (≈ 100 kg de fuerza)
F_EMPUJE = 1000.0                      # empuje lateral o hacia arriba con el cuerpo
F_PATADA, F_PUNO = 3000.0 * 1.5, 2000.0 * 1.5   # pico de una patada (3 kN) y de un puñetazo (2 kN) × 1,5 de amplificación
F_FRONTAL = 5000.0                     # golpe de frente (aplasta la caja contra la pared)
PESO = [(CG[0], CG[1], CG[2], 0.0, 0.0, -M_CALC * G)]
XD, ZT, NF = W / 2, H_TOT, D_FONDO     # borde derecho, borde de arriba, frente


def _caso(clave, nombre, fuerzas, grupo):
    Q, plano = NU.generalizadas(PESO + fuerzas)
    return dict(clave=clave, nombre=nombre, fuerzas=PESO + fuerzas, Q=Q, plano=plano, grupo=grupo)


def casos_de_carga():
    c = [_caso("G", "Peso propio (18 kg)", [], "peso")]
    col = P_COLGADO * G * DAF_COLGADO
    c.append(_caso("CU-C", "Persona de 120 kg colgada del borde de arriba, en el centro (×2)", [(0, NF, ZT, 0, 0, -col)], "colgado"))
    for sg, lado in ((1, "dcha"), (-1, "izda")):
        c.append(_caso(f"CU-{lado[0].upper()}", f"Persona de 120 kg colgada de la esquina de arriba {lado}. (×2)", [(sg * XD, NF, ZT, 0, 0, -col)], "colgado"))
    c.append(_caso("T-AR", "Tirón de 1000 N hacia fuera, arriba en el centro", [(0, NF, ZT, 0, F_TIRON, 0)], "tirón"))
    c.append(_caso("T-AB", "Tirón de 1000 N hacia fuera, abajo en el centro", [(0, NF, 0, 0, F_TIRON, 0)], "tirón"))
    for sg, lado in ((1, "D"), (-1, "I")):
        c.append(_caso(f"T-EA{lado}", f"Tirón de 1000 N hacia fuera, esquina de arriba {'dcha' if sg > 0 else 'izda'}.", [(sg * XD, NF, ZT, 0, F_TIRON, 0)], "tirón"))
        c.append(_caso(f"T-EB{lado}", f"Tirón de 1000 N hacia fuera, esquina de abajo {'dcha' if sg > 0 else 'izda'}.", [(sg * XD, NF, 0, 0, F_TIRON, 0)], "tirón"))
        c.append(_caso(f"T-L{lado}", f"Tirón de 1000 N de un lado (canto {'dcho' if sg > 0 else 'izdo'}., media altura): torsión", [(sg * XD, NF, H_TOT / 2, 0, F_TIRON, 0)], "tirón"))
        c.append(_caso(f"E-L{lado}", f"Empuje lateral de 1000 N arriba, hacia la {'dcha' if sg > 0 else 'izda'}.", [(0, NF, ZT, sg * F_EMPUJE, 0, 0)], "empuje"))
        c.append(_caso(f"K-L{lado}", f"Patada lateral (4500 N) en el costado {'izdo' if sg > 0 else 'dcho'}., abajo", [(-sg * XD, NF / 2, 110.0, sg * F_PATADA, 0, 0)], "golpe"))
        c.append(_caso(f"P-L{lado}", f"Puñetazo lateral (3000 N) en el costado {'izdo' if sg > 0 else 'dcho'}., arriba", [(-sg * XD, NF / 2, 400.0, sg * F_PUNO, 0, 0)], "golpe"))
    c.append(_caso("E-UP", "Empuje de 1000 N hacia arriba en el borde de abajo", [(0, NF, 0, 0, 0, F_EMPUJE)], "empuje"))
    c.append(_caso("K-UP", "Patada de abajo arriba (3000 N) en la base", [(0, 60.0, 0, 0, 0, F_PUNO)], "golpe"))
    c.append(_caso("P-FR", "Golpe de frente de 5000 N en una esquina de arriba", [(90.0, NF, 400.0, 0, -F_FRONTAL, 0)], "golpe"))
    est = P_COLGADO * G
    c.append(_caso("C1", "Combinación: colgado (120 kg, sin golpe) + tirón de 1000 N arriba", [(0, NF, ZT, 0, F_TIRON, -est)], "combinación"))
    for sg, lado in ((1, "D"), (-1, "I")):
        c.append(_caso(f"C2{lado}", f"Combinación: colgado de la esquina {'dcha' if sg > 0 else 'izda'}. (120 kg) + empuje lateral de 1000 N",
                       [(sg * XD, NF, ZT, -sg * F_EMPUJE, 0, -est)], "combinación"))
        c.append(_caso(f"C3{lado}", f"Combinación: tirón de 1000 N en la esquina de arriba {'dcha' if sg > 0 else 'izda'}. + empuje lateral de 1000 N",
                       [(sg * XD, NF, ZT, -sg * F_EMPUJE, F_TIRON, 0)], "combinación"))
    return c


CASOS = casos_de_carga()


# =============================================================================================== 3. MODELOS DE REPARTO
def rigido_pivote(pts, Q):
    """Placa rígida sobre pared rígida, anclajes iguales que solo tiran. Es la fórmula del encargo generalizada:
    la placa gira alrededor del borde (o la esquina) que aprieta contra la pared y N_i = M·d_i / Σd_i².
    Se resuelve como un problema cuadrático pequeño: desplazamiento u = a + b·z + c·x ≥ 0 en las 4 esquinas de la
    trasera; se prueban los conjuntos de esquinas en contacto y vale el único que cumple todas las condiciones."""
    P = np.column_stack([np.ones(len(pts)), [p[1] for p in pts], [p[0] for p in pts]])
    A = P.T @ P
    C = np.array([[1.0, z, x] for x in (-W / 2, W / 2) for z in (0.0, HW)])
    Q = np.asarray(Q, float)
    mejor = None
    for mask in range(16):
        S = [j for j in range(4) if mask >> j & 1]
        if len(S) > 3:
            continue
        k = len(S)
        K = np.zeros((3 + k, 3 + k)); K[:3, :3] = A
        if k:
            K[:3, 3:] = -C[S].T; K[3:, :3] = C[S]
        rhs = np.concatenate([Q, np.zeros(k)])
        try:
            sol = np.linalg.solve(K + 1e-12 * np.eye(3 + k), rhs)
        except np.linalg.LinAlgError:
            continue
        q, mu = sol[:3], sol[3:]
        if (C @ q >= -1e-7).all() and (mu >= -1e-7).all():
            mejor = q
            break
    if mejor is None:                   # no debería ocurrir; respaldo: todo apoyado
        mejor = np.zeros(3)
    return np.maximum(P @ mejor, 0.0)


_FEM = {}


def fem(tipo="rapido", empotrado=False):
    """Modelos de elementos finitos de la chapa (nucleo.py). 'rapido': malla de 20 mm, para buscar; 'fino': malla de
    10 mm con arandela rígida, para los valores finales."""
    k = (tipo, empotrado)
    if k not in _FEM:
        _FEM[k] = NU.FEMRapido(h=20.0, empotrado=empotrado) if tipo == "rapido" else NU.ModeloFEM(h=10.0, empotrado=empotrado)
    return _FEM[k]


def fuerzas(pts, casos, modelo="fem-rapido", activos=None):
    """Tracción N y cortante V de cada anclaje en cada caso. Con FEM se calculan las dos hipótesis de borde
    (pliegue apoyado y empotrado) y se devuelven las dos. Salida: N[borde, caso, anclaje], V[caso, anclaje]."""
    pts = np.asarray(pts, float)
    V = np.array([np.hypot(*NU.cortante(pts, *c["plano"], (0.0, 0.0), activos=activos).T) for c in casos])
    if modelo == "rigido":
        if activos is not None:
            idx = np.nonzero(activos)[0]
            N = np.zeros((1, len(casos), len(pts)))
            for j, c in enumerate(casos):
                N[0, j, idx] = rigido_pivote(pts[idx], c["Q"])
        else:
            N = np.array([[rigido_pivote(pts, c["Q"]) for c in casos]])
        return N, V
    tipo = "rapido" if modelo == "fem-rapido" else "fino"
    N = []
    for emp in (False, True):
        m = fem(tipo, emp)
        m.preparar(pts)
        N.append([m.resolver(c["Q"], activos=activos, clave=(c["clave"], emp))["N"] for c in casos])
    return np.array(N), V


# =============================================================================================== 4. RESISTENCIAS
def solape(pts, s_cr, h=5.0):
    """ψ_i: parte del cono propio que le queda a cada taco cuando hay otros cerca. A cada taco le toca el trozo de pared
    que está más cerca de él que de cualquier otro, recortado a un rectángulo s_cr centrado en el taco; ψ = área / (s_cr,x·s_cr,z)."""
    pts = np.asarray(pts, float)
    sx, sz = s_cr
    xs = np.arange(pts[:, 0].min() - sx / 2 + h / 2, pts[:, 0].max() + sx / 2, h)
    zs = np.arange(pts[:, 1].min() - sz / 2 + h / 2, pts[:, 1].max() + sz / 2, h)
    X, Z = np.meshgrid(xs, zs)
    X, Z = X.ravel(), Z.ravel()
    d2 = (X[:, None] - pts[None, :, 0]) ** 2 + (Z[:, None] - pts[None, :, 1]) ** 2
    cerca = d2.argmin(1)
    dentro = (np.abs(X - pts[cerca, 0]) <= sx / 2) & (np.abs(Z - pts[cerca, 1]) <= sz / 2)
    area = np.bincount(cerca[dentro], minlength=len(pts)) * h * h
    return np.clip(area / (sx * sz), 0.02, 1.0)       # suelo de 0,02: dos tacos en el mismo sitio no dan división por cero


def juntas(pts, formato, ox, oz):
    """Aparejo a matajunta desplazado (ox, oz) respecto a la máquina. Devuelve el factor α de cada taco (1 en ladrillo,
    ALFA_TENDEL si el taladro toca una junta horizontal, ALFA_LLAGA si toca una vertical) y el ladrillo en el que cae."""
    L, Hh, j = formato
    pz, px = Hh + j, L + j
    alfa, pieza = [], []
    for x, z in pts:
        zz = z + oz
        fila = math.floor(zz / pz)
        dz = zz - fila * pz                                  # ladrillo en [0, Hh], tendel en [Hh, Hh + j]
        xx = x + ox + (fila % 2) * px / 2
        col = math.floor(xx / px)
        dx = xx - col * px
        a = 1.0
        if dz > Hh - R_BROCA or dz < R_BROCA:
            a = ALFA_TENDEL
        if dx > L - R_BROCA or dx < R_BROCA:
            a = min(a, ALFA_LLAGA)
        alfa.append(a); pieza.append((fila, col))
    return np.array(alfa), pieza


def aprovechamiento(N, V, pared, psi, alfa=None, f_muro=1.0, piezas=None):
    """Cuánto de su resistencia usa cada anclaje (1 = llega a la carga recomendada), por modo de fallo.
    N[..., anclaje], V[..., anclaje]. Devuelve un diccionario modo -> matriz y el máximo de todos."""
    alfa = np.ones(N.shape[-1]) if alfa is None else alfa
    F = pared["F_rec"] * f_muro
    u = {
        "taco (arrancamiento o cortante)": np.hypot(N, V) / (F * alfa),
        "cono de ladrillo (tacos juntos)": N / (F * pared["kappa"] * psi * alfa),
        "tornillo (tracción + flexión en el yeso)": N / N_S_REC + V / V_SM_REC,
    }
    if piezas is not None:              # arrancamiento de un ladrillo entero: suma de tracciones de los tacos del mismo ladrillo
        ub = np.zeros_like(N)
        for pz in set(piezas):
            idx = [i for i, q in enumerate(piezas) if q == pz]
            ub[..., idx] = N[..., idx].sum(-1, keepdims=True) / (pared["n_pb"] * f_muro)
        u["ladrillo entero arrancado"] = ub
    return u


def coeficiente(pts, pared, casos=None, modelo="fem-rapido", alfa=None, activos=None, f_muro=1.0, piezas=None, detalle=False, psi=None, NV=None):
    """Coeficiente de seguridad del patrón = mínimo, sobre casos, hipótesis de borde, anclajes y modos de fallo, de
    (resistencia recomendada / solicitación). CS ≥ 1: ningún anclaje pasa de la carga recomendada del fabricante."""
    casos = CASOS if casos is None else casos
    pts = np.asarray(pts, float)
    act = np.ones(len(pts), bool) if activos is None else np.asarray(activos, bool)
    if psi is None:
        psi = np.ones(len(pts))
        psi[act] = solape(pts[act], pared["s_cr"])
    N, V = fuerzas(pts, casos, modelo, activos=activos) if NV is None else NV      # NV: fuerzas ya calculadas (mismas para todas las paredes)
    u = aprovechamiento(N, V[None], pared, psi, alfa=alfa, f_muro=f_muro, piezas=piezas)
    umax = np.zeros(N.shape)
    modo = np.zeros(N.shape, int)
    nombres = list(u)
    for k, nm in enumerate(nombres):
        uu = np.where(act, u[nm], 0.0)
        modo = np.where(uu > umax, k, modo)
        umax = np.maximum(umax, uu)
    por_caso = umax.max(axis=(0, 2))                          # peor borde y peor anclaje de cada caso
    cs = 1.0 / max(por_caso.max(), 1e-12)
    if not detalle:
        return cs
    b, j, i = np.unravel_index(umax.argmax(), umax.shape)
    filas = []
    for jj, c in enumerate(casos):
        bb, ii = np.unravel_index(umax[:, jj, :].argmax(), umax[:, jj, :].shape)
        filas.append(dict(clave=c["clave"], nombre=c["nombre"], cs=float(1.0 / max(por_caso[jj], 1e-12)), anclaje=int(ii) + 1,
                          modo=nombres[modo[bb, jj, ii]], N=float(N[bb, jj, ii]), V=float(V[jj, ii]), borde="empotrado" if bb else "apoyado",
                          Nmax=float(N[:, jj, :].max()), Vmax=float(V[jj].max())))
    return dict(cs=float(cs), caso=casos[j]["clave"], caso_nombre=casos[j]["nombre"], anclaje=int(i) + 1, modo=nombres[modo[b, j, i]],
                casos=filas, psi=psi.tolist(), N=N, V=V, umax=umax)


def separacion_min(pts):
    p = np.asarray(pts, float)
    d = np.sqrt(((p[:, None] - p[None]) ** 2).sum(-1))
    d[np.diag_indices(len(p))] = 1e9
    return float(d.min())


def cabe(pts):
    """Comprueba zonas prohibidas y separación mínima. Devuelve lista de problemas (vacía si todo cabe)."""
    prob = [f"({x:g}; {z:g}) cae en zona prohibida" for x, z in pts if not NU.en_zona(x, z)]
    if separacion_min(pts) < S_MIN - 1e-6:
        prob.append(f"separación mínima {separacion_min(pts):.1f} mm < {S_MIN:g}")
    return prob


# =============================================================================================== 5. PATRONES A COMPARAR
def _sim(pares, eje=()):
    out = []
    for x, z in pares:
        out += [(-x, z), (x, z)]
    return out + [(0.0, z) for z in eje]


P18_3 = [(-87.5, 428.5), (87.5, 428.5), (-87.0, 376.5), (87.0, 376.5), (-91.5, 325.5), (91.5, 325.5), (-93.0, 275.5), (93.0, 275.5),
         (-93.0, 224.5), (93.0, 224.5), (-38.5, 223.5), (38.5, 223.5), (-54.0, 175.5), (54.0, 175.5), (-93.0, 139.5), (93.0, 139.5),
         (-47.5, 22.0), (47.5, 22.0)]                                              # el que lleva el CAD desde el 04-11-2026

PATRONES = {
    "Rejilla 3 × 6 (la del encargo; ya no cabe)": [(x, z) for z in (25, 75, 125, 205, 295, 391.5) for x in (-85.0, 0.0, 85.0)],
    "Rejilla 3 × 6 adaptada (x = ±89,5)": [(x, z) for z in (25, 75, 125, 205, 295, 391.5) for x in (-89.5, 0.0, 89.5)],
    "Solo perímetro": _sim([(90.0, z) for z in (22, 81, 139.5, 195, 254, 313, 372, 425)], eje=(22, 425)),
    "Perímetro + centro": _sim([(90.0, z) for z in (22, 139.5, 215, 290, 372, 425)], eje=(22, 100, 215, 290, 372, 425)),
    "Tresbolillo": _sim([(90.0, z) for z in (22, 139.5, 260, 425)] + [(45.0, z) for z in (80, 195, 325)], eje=(22, 139.5, 260, 425)),
    "Concentrado arriba y abajo": _sim([(90.0, 425), (45.0, 425), (90.0, 372), (30.0, 372), (90.0, 22), (45.0, 22), (90.0, 80), (30.0, 80)], eje=(425, 22)),
    "P18-3 (el del CAD, 04-11)": P18_3,
}


# =============================================================================================== 6. OPTIMIZACIÓN
# Evolución diferencial sobre patrones simétricos: n_pares parejas (x, z) con x ≥ 25 y n_eje puntos en el eje.
# Cada punto se lleva al sitio permitido más cercano (zonas de nucleo.py). Objetivo: la mejora del coeficiente de
# seguridad respecto al patrón del CAD (P18-3) que se cumple A LA VEZ en ladrillo macizo y en perforado.
CLAVES_OPT = ("CU-C", "CU-D", "CU-I", "T-AR", "T-AB", "T-EAD", "T-EAI", "T-EBD", "T-EBI", "T-LD", "T-LI",
              "K-LD", "K-LI", "P-LD", "P-LI", "C1", "C3D", "C3I")         # los casos que pueden mandar (comprobado con los 26)
CASOS_OPT = [c for c in CASOS if c["clave"] in CLAVES_OPT]
PAREDES_OPT = ("macizo", "perforado")
_REF = {}


def cs_paredes(pts, casos, modelo="fem-rapido", paredes=PAREDES_OPT, activos=None):
    """CS en varias paredes con un solo cálculo de fuerzas."""
    pts = np.asarray(pts, float)
    N, V = fuerzas(pts, casos, modelo, activos=activos)
    out = {}
    for w in paredes:
        psi = solape(pts, PAREDES[w]["s_cr"])
        u = aprovechamiento(N, V[None], PAREDES[w], psi)
        out[w] = 1.0 / max(max(float(m.max()) for m in u.values()), 1e-12)
    return out


def referencia():
    if not _REF:
        _REF.update(cs_paredes(P18_3, CASOS_OPT))
    return _REF


def mejora(pts):
    """Objetivo: min sobre paredes de CS / CS(P18-3). Vale 1 para el patrón del CAD."""
    ref = referencia()
    cs = cs_paredes(pts, CASOS_OPT)
    return min(cs[w] / ref[w] for w in PAREDES_OPT)


def penal_separacion(pts):
    p = np.asarray(pts, float)
    d = np.sqrt(((p[:, None] - p[None]) ** 2).sum(-1))
    iu = np.triu_indices(len(p), 1)
    return float(np.maximum(0.0, S_MIN - d[iu]).sum() / S_MIN)


def decodificar(v, n_pares, n_eje):
    pts = []
    for k in range(n_pares):
        x, z = NU.proyectar(abs(v[2 * k]), v[2 * k + 1])
        x = abs(x)
        pts += [(-x, z), (x, z)]
    for k in range(n_eje):
        x, z = NU.proyectar(0.0, v[2 * n_pares + k])
        pts.append((x, z))
    return pts


def codificar(pts, n_pares, n_eje):
    der = sorted([p for p in pts if p[0] > 1e-6], key=lambda p: -p[1])
    eje = sorted([p[1] for p in pts if abs(p[0]) <= 1e-6], reverse=True)
    if len(der) != n_pares or len(eje) != n_eje:
        return None
    return np.array([c for p in der for c in p] + eje, float)


def _obj(v, n_pares, n_eje):
    pts = decodificar(v, n_pares, n_eje)
    return -(mejora(pts) - 5.0 * penal_separacion(pts))


def buscar(n_pares, n_eje, semilla=1, gens=140, pop=6, siembra=()):
    """Evolución diferencial (scipy) + pulido por coordenadas + redondeo a 0,5 mm."""
    from scipy.optimize import differential_evolution
    nv = 2 * n_pares + n_eje
    lim = [(25.0, NU.X_MAX), (20.0, 429.5)] * n_pares + [(20.0, 429.5)] * n_eje
    rng = np.random.default_rng(semilla)
    npop = max(pop * nv, 20)
    ini = np.array([[rng.uniform(a, b) for a, b in lim] for _ in range(npop)])
    k = 0
    for pts in siembra:
        v = codificar(pts, n_pares, n_eje)
        if v is not None and k < npop:
            ini[k] = np.clip(v, [a for a, _ in lim], [b for _, b in lim]); k += 1
    hist = []
    t0 = time.time()

    def cb(xk, convergence=None):
        hist.append(float(-_obj(xk, n_pares, n_eje)))
        if len(hist) % 10 == 0:
            print(f"   gen {len(hist):3d}  mejora {hist[-1]:.3f}  ({time.time() - t0:.0f} s)", flush=True)
    r = differential_evolution(_obj, lim, args=(n_pares, n_eje), init=ini, maxiter=gens, tol=0, atol=0, mutation=(0.4, 0.9),
                               recombination=0.7, seed=semilla, polish=False, callback=cb, updating="immediate")
    v, J = r.x.copy(), -r.fun
    for paso in (3.0, 1.0, 0.5):                              # pulido por coordenadas
        mejora_ = True
        vueltas = 0
        while mejora_ and vueltas < 3:
            mejora_ = False; vueltas += 1
            for i in range(nv):
                for s in (paso, -paso):
                    c = v.copy(); c[i] = np.clip(c[i] + s, *lim[i])
                    Jc = -_obj(c, n_pares, n_eje)
                    if Jc > J + 1e-5:
                        v, J, mejora_ = c, Jc, True
    pts = [(round(2 * x) / 2, round(2 * z) / 2) for x, z in decodificar(v, n_pares, n_eje)]
    pts = [p if NU.en_zona(*p) else NU.proyectar(*p) for p in pts]
    return dict(n=len(pts), n_pares=n_pares, n_eje=n_eje, semilla=semilla, pts=[list(map(float, p)) for p in pts],
                mejora=float(mejora(pts)), penal=penal_separacion(pts), hist=hist, t=time.time() - t0, evals=int(r.nfev))


def busqueda_local(pts, n_pares, n_eje, pasos=(20.0, 10.0, 5.0, 2.0, 1.0, 0.5), semilla=100):
    """Búsqueda por coordenadas desde un patrón de partida (manteniendo la simetría): prueba a mover cada coordenada
    ±paso y se queda con lo que mejora; cuando nada mejora, reduce el paso. Barata y buena para afinar una semilla."""
    t0 = time.time()
    v = codificar(pts, n_pares, n_eje)
    nv = len(v)
    lim = [(25.0, NU.X_MAX), (20.0, 429.5)] * n_pares + [(20.0, 429.5)] * n_eje
    J = -_obj(v, n_pares, n_eje)
    hist, evals = [J], 1
    for paso in pasos:
        cambia, vueltas = True, 0
        while cambia and vueltas < 6:
            cambia = False; vueltas += 1
            for i in range(nv):
                for sg in (paso, -paso):
                    c = v.copy(); c[i] = np.clip(c[i] + sg, *lim[i])
                    Jc = -_obj(c, n_pares, n_eje); evals += 1
                    if Jc > J + 1e-5:
                        v, J, cambia = c, Jc, True
            hist.append(J)
        print(f"   paso {paso:g}: mejora {J:.3f} ({time.time() - t0:.0f} s)", flush=True)
    out = [(round(2 * x) / 2, round(2 * z) / 2) for x, z in decodificar(v, n_pares, n_eje)]
    out = [q if NU.en_zona(*q) else NU.proyectar(*q) for q in out]
    return dict(n=len(out), n_pares=n_pares, n_eje=n_eje, semilla=semilla, pts=[list(map(float, q)) for q in out], mejora=float(mejora(out)),
                penal=penal_separacion(out), hist=hist, t=time.time() - t0, evals=evals)


def saltos(pts, n_pares, n_eje, n_saltos=12, sigma=14.0, semilla=200):
    """Para no quedarse en un óptimo local: se dan «patadas» al mejor patrón (se mueven al azar 4 coordenadas) y se
    vuelve a afinar con la búsqueda por coordenadas; se acepta el resultado solo si mejora."""
    rng = np.random.default_rng(semilla)
    t0 = time.time()
    mejor = busqueda_local(pts, n_pares, n_eje, pasos=(2.0, 1.0, 0.5), semilla=semilla)
    hist, evals = [mejor["mejora"]], mejor["evals"]
    for k in range(n_saltos):
        v = codificar([tuple(q) for q in mejor["pts"]], n_pares, n_eje)
        idx = rng.choice(len(v), size=min(4, len(v)), replace=False)
        v[idx] += rng.normal(0, sigma, size=len(idx))
        cand = busqueda_local(decodificar(v, n_pares, n_eje), n_pares, n_eje, pasos=(8.0, 4.0, 2.0, 1.0, 0.5), semilla=semilla)
        evals += cand["evals"]
        if cand["penal"] == 0 and cand["mejora"] > mejor["mejora"] + 1e-4:
            mejor = cand
        hist.append(mejor["mejora"])
        print(f"salto {k + 1}/{n_saltos}: {cand['mejora']:.3f} -> mejor {mejor['mejora']:.3f} ({time.time() - t0:.0f} s)", flush=True)
    mejor.update(hist=hist, evals=evals, t=time.time() - t0, semilla=semilla)
    return mejor


# semillas «de perímetro» para comparar 12, 18 y 24 anclajes con el mismo método
SEMILLAS = {
    "18a": (8, 2, _sim([(90.0, z) for z in (22, 81, 139.5, 195, 254, 313, 372, 425)], eje=(22, 425))),
    "18b": (9, 0, _sim([(30.0, 425), (88.0, 421), (93.0, 361), (93.0, 303), (93.0, 235), (93.0, 175), (93.0, 97), (88.0, 25), (30.0, 20)])),
    "12": (5, 2, _sim([(90.0, 425), (93.0, 330), (93.0, 235), (93.0, 120), (90.0, 22)], eje=(425, 22))),
    "24": (11, 2, _sim([(88.0, 425), (44.0, 425), (93.0, 372), (93.0, 322), (93.0, 272), (93.0, 222), (93.0, 175), (93.0, 125), (93.0, 75), (88.0, 22), (44.0, 22)], eje=(425, 22))),
}


def pulir_libre(pts, pasos=(3.0, 1.0)):
    """Suelta la simetría: mueve cada agujero por separado para ver cuánto se gana sin ella."""
    pts = [tuple(p) for p in pts]
    J = mejora(pts) - 5.0 * penal_separacion(pts)
    for paso in pasos:
        cambia, vueltas = True, 0
        while cambia and vueltas < 2:
            cambia = False; vueltas += 1
            for i in range(len(pts)):
                for dx, dz in ((paso, 0), (-paso, 0), (0, paso), (0, -paso)):
                    q = (pts[i][0] + dx, pts[i][1] + dz)
                    if not NU.en_zona(*q):
                        continue
                    c = list(pts); c[i] = q
                    Jc = mejora(c) - 5.0 * penal_separacion(c)
                    if Jc > J + 1e-5:
                        pts, J, cambia = c, Jc, True
    return dict(pts=[list(map(float, p)) for p in pts], mejora=float(mejora(pts)), penal=penal_separacion(pts))


# =============================================================================================== 7. ROBUSTEZ
def casos_criticos(pts, pared, k=8):
    """Los k casos con menor CS para este patrón y esta pared (para no calcular los 26 en cada muestra)."""
    d = coeficiente(pts, pared, detalle=True)
    orden = sorted(d["casos"], key=lambda f: f["cs"])[:k]
    claves = {f["clave"] for f in orden}
    return [c for c in CASOS if c["clave"] in claves]


def montecarlo_juntas(pts, pared, nmc=150, semilla=7, max_ceden=4):
    """No se sabe dónde caen las juntas: se desplaza el aparejo al azar respecto a la plantilla. Los tacos que tocan
    junta valen menos (ALFA_TENDEL / ALFA_LLAGA). Si el que manda es uno de esos, se da por perdido y se recalcula sin
    él (hasta max_ceden veces): el resultado es el mayor coeficiente de la secuencia, es decir, lo que aguanta el
    conjunto cuando los tacos malos ya han cedido."""
    rng = np.random.default_rng(semilla)
    pts = np.asarray(pts, float)
    cs_ = casos_criticos(pts, pared)
    L, Hh, j = pared["formato"]
    out = dict(cs=[], cs0=[], en_junta=[], ceden=[])
    for _ in range(nmc):
        alfa, piezas = juntas(pts, pared["formato"], rng.uniform(0, 2 * (L + j)), rng.uniform(0, 2 * (Hh + j)))
        act = np.ones(len(pts), bool)
        mejor, primero, n_ceden = 0.0, None, 0
        for paso in range(max_ceden + 1):
            d = coeficiente(pts, pared, casos=cs_, alfa=alfa, activos=act, piezas=piezas, detalle=True)
            primero = d["cs"] if primero is None else primero
            mejor = max(mejor, d["cs"])
            i = d["anclaje"] - 1
            if alfa[i] >= 1.0 or paso == max_ceden or act.sum() <= 4:
                break
            act[i] = False; n_ceden += 1
        out["cs"].append(mejor); out["cs0"].append(primero); out["en_junta"].append(int((alfa < 1).sum())); out["ceden"].append(n_ceden)
    a = np.array(out["cs"])
    return dict(mediana=float(np.median(a)), p05=float(np.percentile(a, 5)), minimo=float(a.min()),
                primero_mediana=float(np.median(out["cs0"])), primero_p05=float(np.percentile(out["cs0"], 5)),
                en_junta_media=float(np.mean(out["en_junta"])), en_junta_max=int(np.max(out["en_junta"])),
                ceden_media=float(np.mean(out["ceden"])), muestras=a.tolist())


def sin_los_peores(pts, pared, k=4):
    """Capacidad con los k peores anclajes fallados: cada vez se quita el anclaje cuya falta más baja el coeficiente."""
    pts = np.asarray(pts, float)
    cs_ = casos_criticos(pts, pared, k=10)
    act = np.ones(len(pts), bool)
    serie = [coeficiente(pts, pared, casos=cs_)]
    quitados = []
    for _ in range(k):
        peor, ip = None, None
        for i in np.nonzero(act)[0]:
            a2 = act.copy(); a2[i] = False
            c = coeficiente(pts, pared, casos=cs_, activos=a2)
            if peor is None or c < peor:
                peor, ip = c, i
        act[ip] = False
        quitados.append(int(ip) + 1); serie.append(float(peor))
    return dict(cs=serie, quitados=quitados)


def tension_chapa(pts, caso, empotrado=False):
    """Tensión de flexión (von Mises de 6M/t²) en el borde de cada arandela y en la malla, con el modelo fino."""
    m = fem("fino", empotrado)
    m.preparar(pts)
    r = m.resolver(caso["Q"])
    u = r["u"]
    cand = [((m.xs[i] + m.xs[i + 1]) / 2, (m.zs[j] + m.zs[j + 1]) / 2) for j in range(len(m.zs) - 1) for i in range(len(m.xs) - 1)]
    for xa, za in pts:
        for t in np.linspace(0, 2 * math.pi, 16, endpoint=False):
            px, pz = xa + (NU.R_ARANDELA + 0.5) * math.cos(t), za + (NU.R_ARANDELA + 0.5) * math.sin(t)
            if -W / 2 <= px <= W / 2 and 0 <= pz <= HW:
                cand.append((px, pz))
    smax, donde = 0.0, None
    for px, pz in cand:
        sx, sz, txz = 6 * m.momentos(u, px, pz) / T ** 2
        vm = math.sqrt(sx ** 2 - sx * sz + sz ** 2 + 3 * txz ** 2)
        if vm > smax:
            smax, donde = vm, (px, pz)
    return smax, donde


# =============================================================================================== 8. PLANTILLA DE TALADROS 1:1
def numerar(pts):
    """Numeración de la plantilla: de arriba abajo y de izquierda a derecha, mirando a la pared."""
    return sorted([tuple(p) for p in pts], key=lambda p: (-p[1], p[0]))


def coordenadas(pts):
    """Tabla (n.º, X, Z) desde la esquina inferior IZQUIERDA de la trasera, mirando a la pared; y (x, z) del CAD."""
    return [dict(n=k + 1, X=x + W / 2, Z=z, x_cad=x, z_cad=z) for k, (x, z) in enumerate(numerar(pts))]


NOMBRE_PLANTILLA = "P18-4"
Z_NIVEL = 250.0                        # línea de nivel de la plantilla (altura sobre la base de la máquina)
PROF_TALADRO, D_BROCA = 85.0, 8.0


def _dibujo_plantilla(pts):
    """Entidades de la plantilla en mm, origen en la esquina inferior izquierda de la trasera mirando a la pared.
    Devuelve listas de líneas, círculos y textos, que luego se pasan a DXF y a PDF (así los dos dibujan lo mismo)."""
    Ls, Cs, Ts = [], [], []           # (capa, x1, z1, x2, z2) · (capa, x, z, r) · (capa, x, z, alto, texto, alineación)
    Ls += [("CONTORNO", 0, 0, W, 0), ("CONTORNO", W, 0, W, HW), ("CONTORNO", W, HW, 0, HW), ("CONTORNO", 0, HW, 0, 0)]
    cajas = [(f["X"] - 11, f["X"] + 11, f["Z"] - 11, f["Z"] + 11, f["n"]) for f in coordenadas(pts)]      # cruces: no se pisan con rótulos
    puestas = [(-40, W + 40, -40, -0.5, 0), (-40, W + 40, HW + 0.5, HW + 95, 0)]      # los rótulos no salen del contorno por arriba ni por abajo

    def libre(c, n):
        return not any(c[0] < q[1] and q[0] < c[1] and c[2] < q[3] and q[2] < c[3] for q in [k for k in cajas if k[4] != n] + puestas)
    for f in sorted(coordenadas(pts), key=lambda f: abs(f["X"] - W / 2)):      # primero los del centro, que tienen menos sitio
        X, Z, n = f["X"], f["Z"], f["n"]
        Ls += [("TALADROS", X - 10, Z, X + 10, Z), ("TALADROS", X, Z - 10, X, Z + 10)]
        Cs += [("TALADROS", X, Z, D_BROCA / 2)]
        cota = f"X {X:g}  Z {Z:g}".replace(".", ",")
        d = 1 if X < W / 2 else -1                            # primero se intenta hacia el interior de la chapa
        lado = lambda dd: dict(caja=(min(X + dd * 13, X + dd * 46), max(X + dd * 13, X + dd * 46), Z - 8, Z + 9.5, n),
                               num=(X + dd * 13, Z + 2.5, "izq" if dd > 0 else "der"), cot=(X + dd * 13, Z - 6.5, "izq" if dd > 0 else "der"))
        arriba = dict(caja=(X - 18, X + 18, Z + 12, Z + 26.5, n), num=(X, Z + 19.5, "cen"), cot=(X, Z + 13.5, "cen"))
        abajo = dict(caja=(X - 18, X + 18, Z - 27, Z - 12, n), num=(X, Z - 19.5, "cen"), cot=(X, Z - 25.5, "cen"))
        orden = [lado(d)] + ([abajo, arriba] if Z > HW / 2 else [arriba, abajo]) + [lado(-d)]
        e = next((o for o in orden if libre(o["caja"], n)), orden[0])
        puestas.append(e["caja"])
        Ts += [("NUMEROS", e["num"][0], e["num"][1], 6.0, f"{n}", e["num"][2]), ("COTAS", e["cot"][0], e["cot"][1], 3.2, cota, e["cot"][2])]
    # línea de nivel y eje
    Ls += [("NIVEL", -22, Z_NIVEL, W + 22, Z_NIVEL), ("EJE", W / 2, -12, W / 2, HW + 12)]
    Ts += [("NIVEL", W / 2 + 3, Z_NIVEL + 2, 3.5, f"LÍNEA DE NIVEL (a {Z_NIVEL:g} mm de la base): poner aquí el nivel", "izq"),
           ("EJE", W / 2 + 2, HW + 6, 3.0, "EJE", "izq")]
    # flecha ARRIBA
    xa, za = W / 2 - 40, HW + 22
    Ls += [("TEXTO", xa, za, xa, za + 30), ("TEXTO", xa, za + 30, xa - 6, za + 20), ("TEXTO", xa, za + 30, xa + 6, za + 20)]
    Ts += [("TEXTO", xa + 9, za + 14, 9.0, "ARRIBA", "izq")]
    # reglas de control de 100 mm (vertical a la derecha y horizontal arriba)
    xr, zr = W + 6, 180.0
    Ls += [("REGLA", xr, zr, xr, zr + 100)]
    for k in range(11):
        Ls += [("REGLA", xr, zr + 10 * k, xr + (6 if k % 5 == 0 else 3.5), zr + 10 * k)]
    Ts += [("REGLA", xr + 8, zr - 1.2, 3.0, "0", "izq"), ("REGLA", xr + 8, zr + 48.8, 3.0, "50", "izq"), ("REGLA", xr + 8, zr + 98.8, 3.0, "100 mm", "izq")]
    xh, zh = W / 2 + 5, HW + 58
    Ls += [("REGLA", xh, zh, xh + 100, zh)]
    for k in range(11):
        Ls += [("REGLA", xh + 10 * k, zh, xh + 10 * k, zh + (6 if k % 5 == 0 else 3.5))]
    Ts += [("REGLA", xh, zh - 5.5, 3.0, "Regla de control: de 0 a 100 mm. Si no mide 100, la hoja está escalada.", "izq")]
    # rótulos
    Ts += [("TEXTO", 2, HW + 3, 3.2, "IZQUIERDA: lado del cajón de pajitas y los candados", "izq"),
           ("TEXTO", W - 2, -6.5, 3.2, "DERECHA: lado del enchufe y de la cerradura", "der"),
           ("TEXTO", 2, -6.5, 3.2, "Esquina inferior izquierda = origen (X 0, Z 0)", "izq"),
           ("TEXTO", W / 2 + 5, HW + 46, 3.6, f"Broca Ø{D_BROCA:g} mm · profundidad {PROF_TALADRO:g} mm desde el enlucido", "izq"),
           ("TEXTO", W / 2 + 5, HW + 40, 3.2, "Taco fischer SX Plus 8 × 65 · arandela ancha M6 DIN 9021", "izq"),
           ("TEXTO", W / 2 + 5, HW + 35, 3.2, "Tirafondo hexagonal 6 × 80 DIN 571 de acero inoxidable A2", "izq"),
           ("TEXTO", W / 2 + 5, HW + 29, 3.2, "Vista MIRANDO A LA PARED (no es espejo). Cotas en mm desde la esquina", "izq"),
           ("TEXTO", W / 2 + 5, HW + 24, 3.2, "inferior izquierda de la trasera (220 × 439,5 mm).", "izq"),
           ("TEXTO", 2, HW + 76, 5.0, "ALCOHOLÍMETRO · PLANTILLA DE TALADROS A LA PARED · ESCALA 1:1", "izq"),
           ("TEXTO", 2, HW + 69, 3.2, f"Diseño A · trasera A-C02 · {len(pts)} taladros · patrón {NOMBRE_PLANTILLA} · 13-11-2026 · imprimir al 100 % (sin «ajustar a página»)", "izq")]
    return Ls, Cs, Ts


def plantilla_dxf(pts, ruta):
    import ezdxf
    doc = ezdxf.new("R2010", setup=True)
    doc.units = 4                                             # milímetros
    msp = doc.modelspace()
    colores = dict(CONTORNO=7, TALADROS=1, NUMEROS=5, COTAS=8, NIVEL=3, EJE=8, TEXTO=7, REGLA=6)
    for capa, col in colores.items():
        doc.layers.add(capa, color=col)
    Ls, Cs, Ts = _dibujo_plantilla(pts)
    for capa, x1, z1, x2, z2 in Ls:
        msp.add_line((x1, z1), (x2, z2), dxfattribs=dict(layer=capa))
    for capa, x, z, r in Cs:
        msp.add_circle((x, z), r, dxfattribs=dict(layer=capa))
    from ezdxf.enums import TextEntityAlignment as TA
    for capa, x, z, h, txt, al in Ts:
        t = msp.add_text(txt, height=h, dxfattribs=dict(layer=capa))
        t.set_placement((x, z), align={"izq": TA.LEFT, "der": TA.RIGHT, "cen": TA.CENTER}[al])
    doc.saveas(ruta)


def _pinta(ax, pts, ventana=None):
    """Dibuja la plantilla en un eje de matplotlib a escala real (1 unidad = 1 mm)."""
    Ls, Cs, Ts = _dibujo_plantilla(pts)
    est = dict(CONTORNO=("#0b0b0b", 0.9, "-"), TALADROS=("#0b0b0b", 0.45, "-"), NIVEL=("#2a78d6", 0.6, "-"),
               EJE=("#8a8984", 0.4, (0, (8, 3, 1.5, 3))), TEXTO=("#0b0b0b", 0.6, "-"), REGLA=("#0b0b0b", 0.5, "-"))
    for capa, x1, z1, x2, z2 in Ls:
        c, lw, ls = est[capa]
        ax.plot([x1, x2], [z1, z2], color=c, lw=lw, ls=ls, solid_capstyle="butt", zorder=2)
    import matplotlib.patches as mp
    for capa, x, z, r in Cs:
        ax.add_patch(mp.Circle((x, z), r, fill=False, ec="#0b0b0b", lw=0.45, zorder=2))
    col = dict(NUMEROS="#0b0b0b", COTAS="#52514e", NIVEL="#2a78d6", EJE="#8a8984", TEXTO="#0b0b0b", REGLA="#0b0b0b")
    for capa, x, z, h, txt, al in Ts:
        ax.text(x, z, txt, fontsize=h * 72 / 25.4 * 0.95, color=col[capa], ha={"izq": "left", "der": "right", "cen": "center"}[al], va="baseline",
                fontweight="bold" if capa == "NUMEROS" else "normal", zorder=3, clip_on=True)


def _pagina(pdf, pts, ancho, alto, x0, z0, extra=None):
    """Una página de ancho × alto mm cuya esquina inferior izquierda está en (x0, z0) del dibujo. Escala exacta 1:1."""
    import matplotlib.pyplot as plt
    fig = plt.figure(figsize=(ancho / 25.4, alto / 25.4))
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(x0, x0 + ancho); ax.set_ylim(z0, z0 + alto)
    ax.set_aspect("equal"); ax.axis("off")
    _pinta(ax, pts)
    if extra:
        extra(ax)
    pdf.savefig(fig)
    plt.close(fig)


def plantilla_pdf(pts, ruta_a2, ruta_a4):
    """Dos PDF a escala 1:1: una sola hoja A2 (420 × 594) y un mosaico de 3 hojas A4 apaisadas con marcas de solape.
    (En una hoja A3 no cabe: la trasera mide 439,5 mm de alto y el A3, 420.)"""
    import matplotlib
    matplotlib.use("Agg")
    from matplotlib.backends.backend_pdf import PdfPages
    tabla = coordenadas(pts)

    def tabla_a2(ax):
        x, z = W + 62, HW + 40
        ax.text(x, z + 8, "Coordenadas (mm)", fontsize=11, fontweight="bold", color="#0b0b0b")
        ax.text(x, z, "N.º        X          Z", fontsize=9, color="#52514e", family="monospace")
        for k, f in enumerate(tabla):
            ax.text(x, z - 7 * (k + 1), f"{f['n']:>2d}    {f['X']:>6.1f}    {f['Z']:>6.1f}".replace(".", ","), fontsize=9, family="monospace", color="#0b0b0b")
        zz = z - 7 * (len(tabla) + 3)
        notas = ["Orden de trabajo:", "1. Pegar la plantilla con cinta, con la línea", "   azul a nivel.", "2. Marcar las 18 cruces con un punzón.",
                 "3. Quitar la plantilla y taladrar con broca", f"   de Ø{D_BROCA:g} a {PROF_TALADRO:g} mm de profundidad.", "4. Soplar los agujeros y meter los tacos a ras.",
                 "5. Presentar la máquina y atornillar según", "   las instrucciones de montaje."]
        for k, t in enumerate(notas):
            ax.text(x, zz - 6.5 * k, t, fontsize=8.5, color="#0b0b0b")
    with PdfPages(ruta_a2) as pdf:
        _pagina(pdf, pts, 420.0, 594.0, -60.0, -40.0, extra=tabla_a2)
    # mosaico: A4 apaisado (297 × 210), una columna y 3 filas; cada hoja repite 10 mm de la anterior
    AN, AL, M, SOL = 297.0, 210.0, 10.0, 10.0
    x0 = W / 2 - AN / 2
    util = AL - 2 * M
    z_ini = -30.0
    with PdfPages(ruta_a4) as pdf:
        for k in range(3):
            zb = z_ini + k * (util - SOL)                   # borde inferior de la zona útil de esta hoja

            def extra(ax, k=k, zb=zb):
                import matplotlib.patches as mp
                # tapa lo que cae fuera de la zona útil y dibuja su marco
                for (xx, zz, ww, hh) in ((x0, zb - M, AN, M), (x0, zb + util, AN, M), (x0, zb - M, M, AL), (x0 + AN - M, zb - M, M, AL)):
                    ax.add_patch(mp.Rectangle((xx, zz), ww, hh, fc="white", ec="none", zorder=5))
                ax.add_patch(mp.Rectangle((x0 + M, zb), AN - 2 * M, util, fill=False, ec="#8a8984", lw=0.3, ls=(0, (2, 2)), zorder=6))
                ax.text(x0 + M + 2, zb + util + 2.5, f"Hoja {k + 1} de 3 (A4 apaisado) · escala 1:1 · imprimir al 100 %", fontsize=7, color="#52514e", zorder=7)
                for zs, txt in ((zb + util - SOL, "solape: la hoja siguiente se pega encima haciendo coincidir esta línea y las cruces"),
                                (zb + SOL, "solape: esta línea coincide con la de la hoja anterior")):
                    if (k < 2 and zs > zb + util / 2) or (k > 0 and zs < zb + util / 2):
                        ax.plot([x0 + M, x0 + AN - M], [zs, zs], color="#eb6834", lw=0.4, ls=(0, (6, 3)), zorder=6)
                        ax.text(x0 + M + 22, zs + 0.8, txt, fontsize=5.5, color="#eb6834", zorder=7)
                        for xm in (x0 + M + 10, x0 + AN - M - 10):
                            ax.plot([xm - 5, xm + 5], [zs, zs], color="#eb6834", lw=0.8, zorder=7)
                            ax.plot([xm, xm], [zs - 5, zs + 5], color="#eb6834", lw=0.8, zorder=7)
            _pagina(pdf, pts, AN, AL, x0, zb - M, extra=extra)


# =============================================================================================== 9. CONTRASTE A MANO
def contraste_a_mano(pts):
    """Tres casos simples hechos con la fórmula del encargo y comparados con lo que da el código (modelo rígido)."""
    pts = np.asarray(pts, float)
    x, z = pts[:, 0], pts[:, 1]
    n = len(pts)
    out = []
    # (a) tirón de 1000 N arriba en el centro: gira sobre el borde de abajo. N_i = M·z_i / Σz_i²
    M = F_TIRON * H_TOT + M_CALC * G * CG[1]
    Nmano = M * z.max() / (z ** 2).sum()
    c = next(c for c in CASOS if c["clave"] == "T-AR")
    Ncod = rigido_pivote(pts, c["Q"]).max()
    out.append(dict(caso="Tirón de 1000 N arriba en el centro (tracción del anclaje más alto)",
                    formula="N = M·z_max / Σz²,  M = F·H + m·g·e",
                    sustitucion=f"M = {F_TIRON:.0f}·{H_TOT:g} + {M_CALC:g}·9,81·{CG[1]:g} = {M:.0f} N·mm;  N = {M:.0f}·{z.max():g} / {(z ** 2).sum():.0f}",
                    mano=float(Nmano), codigo=float(Ncod)))
    # (b) persona colgada en el centro: cortante directo V = (P + G) / n
    P = P_COLGADO * G * DAF_COLGADO + M_CALC * G
    c = next(c for c in CASOS if c["clave"] == "CU-C")
    Vcod = np.hypot(*NU.cortante(pts, *c["plano"], (0.0, 0.0)).T).max()
    out.append(dict(caso="Persona colgada en el centro (cortante de cada anclaje)", formula="V = (P·DAF + m·g) / n",
                    sustitucion=f"V = ({P_COLGADO:g}·9,81·{DAF_COLGADO:g} + {M_CALC:g}·9,81) / {n} = {P:.0f} / {n}", mano=float(P / n), codigo=float(Vcod)))
    # (c) patada lateral baja: cortante directo + torsión, V_i = F/n + T·r_i/Σr²
    c = next(c for c in CASOS if c["clave"] == "K-LD")
    x0, z0 = x.mean(), z.mean()
    J = ((x - x0) ** 2 + (z - z0) ** 2).sum()
    Tt = F_PATADA * (z0 - 110.0) + M_CALC * G * x0
    i = int(np.argmin(z))                                     # el anclaje más bajo (el más lejos del golpe hacia abajo)
    Vx = F_PATADA / n + Tt * (z0 - z[i]) / J
    Vz = -M_CALC * G / n + Tt * (x[i] - x0) / J
    Vcod = NU.cortante(pts, *c["plano"], (0.0, 0.0))[i]
    out.append(dict(caso=f"Patada lateral de 4500 N a 110 mm de la base (cortante del anclaje más bajo, x = {x[i]:g}, z = {z[i]:g})",
                    formula="V_x = F/n + T·(z0 − z_i)/J;  V_z = −m·g/n + T·(x_i − x0)/J;  V = √(V_x² + V_z²);  T = F·(z0 − 110);  J = Σ[(x−x0)² + (z−z0)²]",
                    sustitucion=f"z0 = {z0:.1f}; J = {J:.0f} mm²; T = {F_PATADA:.0f}·({z0:.1f} − 110) = {Tt:.0f} N·mm; V_x = {F_PATADA / n:.1f} + {Tt * (z0 - z[i]) / J:.1f} = {Vx:.1f}; V_z = {-M_CALC * G / n:.1f} + ({Tt * (x[i] - x0) / J:.1f}) = {Vz:.1f}",
                    mano=float(math.hypot(Vx, Vz)), codigo=float(math.hypot(*Vcod))))
    return out


# =============================================================================================== 10. FIGURAS
COL = dict(fondo="#fcfcfb", tinta="#0b0b0b", tinta2="#52514e", gris="#c9c8c2", rejilla="#e6e5e0", azul="#2a78d6", naranja="#eb6834", verde="#1baf7a")


def _plt():
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    plt.rcParams.update({"font.size": 9, "axes.edgecolor": COL["gris"], "axes.labelcolor": COL["tinta2"], "xtick.color": COL["tinta2"],
                         "ytick.color": COL["tinta2"], "axes.spines.top": False, "axes.spines.right": False, "figure.facecolor": COL["fondo"],
                         "axes.facecolor": COL["fondo"], "savefig.facecolor": COL["fondo"], "font.family": "DejaVu Sans"})
    return plt


def _trasera(ax, pts=None, color=None, etiquetas=False, valores=None, vmax=None):
    """Dibuja la trasera mirando a la pared con las zonas prohibidas en gris y, si se dan, los anclajes."""
    import matplotlib.patches as mp
    ax.add_patch(mp.Rectangle((-W / 2, 0), W, HW, fc="#f1f0ec", ec=COL["tinta"], lw=0.8))
    for zn in NU.ZONAS:                                       # zonas donde sí cabe el centro de un agujero
        ax.add_patch(mp.Rectangle((zn["x"][0], zn["z"][0]), zn["x"][1] - zn["x"][0], zn["z"][1] - zn["z"][0], fc=COL["fondo"], ec="none"))
    for x0, x1, z0, z1 in NU.EXCL_RECT:
        ax.add_patch(mp.Rectangle((x0, max(z0, NU.ZONAS[1]["z"][0])), x1 - x0, min(z1, NU.ZONAS[1]["z"][1]) - max(z0, NU.ZONAS[1]["z"][0]), fc="#f1f0ec", ec="none"))
    for cx, cz, r in NU.EXCL_CIRC:
        ax.add_patch(mp.Circle((cx, cz), r, fc="#f1f0ec", ec="none"))
    if pts is not None:
        p = np.asarray(numerar(pts), float)
        if valores is None:
            ax.scatter(p[:, 0], p[:, 1], s=26, color=color or COL["azul"], zorder=3, edgecolors=COL["fondo"], linewidths=0.8)
        else:
            orden = {tuple(q): k for k, q in enumerate(map(tuple, np.asarray(pts, float)))}
            v = np.array([valores[orden[tuple(q)]] for q in p])
            import matplotlib.cm as cm
            sc = ax.scatter(p[:, 0], p[:, 1], s=95, c=v, cmap="Blues", vmin=0, vmax=vmax or v.max(), zorder=3, edgecolors=COL["tinta2"], linewidths=0.5)
            for (xx, zz), vv in zip(p, v):
                ax.text(xx, zz - 17, f"{vv:.2f}".replace(".", ","), ha="center", va="center", fontsize=6.5, color=COL["tinta"])
        if etiquetas:
            for k, (xx, zz) in enumerate(p):
                ax.text(xx + (9 if xx < 0 else -9), zz + 7, str(k + 1), ha="center", va="center", fontsize=6.5, color=COL["tinta2"])
    ax.set_xlim(-W / 2 - 8, W / 2 + 8); ax.set_ylim(-8, HW + 8)
    ax.set_aspect("equal"); ax.axis("off")


def figuras(R):
    plt = _plt()
    os.makedirs(FIG, exist_ok=True)
    pats = R["patrones"]
    gan, act = R["ganador"], R["actual"]
    # ---- fig 1: todos los patrones a la misma escala
    nombres = list(pats)
    fig, axs = plt.subplots(1, len(nombres), figsize=(1.75 * len(nombres), 4.3))
    for ax, nm in zip(axs, nombres):
        _trasera(ax, pats[nm]["pts"], color=COL["azul"] if nm == gan else (COL["naranja"] if nm == act else COL["tinta2"]))
        t = nm.split(" (")[0]
        ax.set_title(f"{t}\nmacizo {pats[nm]['cs']['macizo']:.2f} · perf. {pats[nm]['cs']['perforado']:.2f}".replace(".", ","), fontsize=7.2, color=COL["tinta"])
    fig.suptitle("Patrones comparados, mirando a la pared (en gris, donde no cabe un agujero).\nBajo cada nombre, el coeficiente de seguridad en ladrillo macizo y en perforado",
                 fontsize=9, x=0.5, y=1.02, ha="center")
    fig.savefig(os.path.join(FIG, "fig1_patrones.png"), dpi=170, bbox_inches="tight"); plt.close(fig)
    # ---- fig 2: aprovechamiento por anclaje, actual y ganador (pared de ladrillo perforado)
    fig, axs = plt.subplots(1, 2, figsize=(6.4, 5.6))
    vmax = max(max(pats[act]["u_perforado"]), max(pats[gan]["u_perforado"]))
    for ax, nm in zip(axs, (act, gan)):
        _trasera(ax, pats[nm]["pts"], valores=pats[nm]["u_perforado"], vmax=vmax, etiquetas=True)
        ax.set_title(f"{nm.split(' (')[0]}: máximo {max(pats[nm]['u_perforado']):.2f}".replace(".", ","), fontsize=9, color=COL["tinta"])
    fig.suptitle("Cuánto de su carga recomendada usa cada anclaje en su peor caso (ladrillo perforado).\nMás oscuro = más cargado; 1,00 = llega a la carga recomendada de fischer", fontsize=8.5, x=0.01, ha="left")
    fig.savefig(os.path.join(FIG, "fig2_aprovechamiento.png"), dpi=170, bbox_inches="tight"); plt.close(fig)
    # ---- fig 3: CS por grupo de casos, actual y ganador (ladrillo perforado)
    pared = "perforado"
    filas = []
    for nombre, claves, carga, valor, unidad in GRUPOS_CASO[1:]:
        va = min(f["cs"] for f in pats[act]["casos"][pared] if f["clave"] in claves)
        vg = min(f["cs"] for f in pats[gan]["casos"][pared] if f["clave"] in claves)
        filas.append((f"{nombre} · {carga}", va, vg))
    filas.sort(key=lambda f: min(f[1], f[2]))
    fig, ax = plt.subplots(figsize=(7.8, 0.42 * len(filas) + 1.3))
    y = np.arange(len(filas))
    if gan != act:
        ax.barh(y - 0.19, [f[2] for f in filas], height=0.34, color=COL["azul"], label=gan.split(" (")[0])
        ax.barh(y + 0.19, [f[1] for f in filas], height=0.34, color=COL["naranja"], label=act.split(" (")[0])
        ax.legend(frameon=False, fontsize=8, loc="upper right")
    else:
        ax.barh(y, [f[1] for f in filas], height=0.5, color=COL["azul"])
    xmax = min(6.0, max(max(f[1], f[2]) for f in filas) * 1.05)
    ax.set_xlim(0, xmax)
    ax.axvline(1.0, color=COL["tinta"], lw=0.8)
    ax.text(1.03, -0.75, "1 = carga recomendada de fischer", fontsize=7, color=COL["tinta2"], va="center")
    ax.set_yticks(y); ax.set_yticklabels([f[0] for f in filas], fontsize=7.5)
    ax.set_ylim(len(filas) - 0.4, -1.1)
    ax.set_xlabel("Coeficiente de seguridad del caso (resistencia recomendada / solicitación)")
    ax.grid(axis="x", color=COL["rejilla"], lw=0.6); ax.set_axisbelow(True)
    ax.set_title(f"Coeficiente de seguridad por caso de carga · {PAREDES[pared]['nombre'].lower()}", fontsize=9, loc="left", color=COL["tinta"])
    fig.savefig(os.path.join(FIG, "fig3_casos.png"), dpi=170, bbox_inches="tight"); plt.close(fig)
    # ---- fig 4: Monte Carlo de juntas
    mc = R["juntas"]
    fig, axs = plt.subplots(1, 3, figsize=(9.2, 3.0), sharey=False)
    for ax, pared in zip(axs, PAREDES):
        noms = list(mc[pared])
        datos = [mc[pared][nm]["muestras"] for nm in noms]
        bp = ax.boxplot(datos, orientation="horizontal", widths=0.55, patch_artist=True, showfliers=False, medianprops=dict(color=COL["tinta"], lw=1.2))
        for b, nm in zip(bp["boxes"], noms):
            b.set(facecolor=COL["azul"] if nm == gan else (COL["naranja"] if nm == act else COL["gris"]), edgecolor=COL["tinta2"], lw=0.6)
        ax.set_yticks(range(1, len(noms) + 1)); ax.set_yticklabels([nm.split(" (")[0] for nm in noms] if pared == "macizo" else [""] * len(noms), fontsize=7.5)
        ax.invert_yaxis(); ax.grid(axis="x", color=COL["rejilla"], lw=0.6); ax.set_axisbelow(True)
        ax.set_title(PAREDES[pared]["corto"], fontsize=9, loc="left", color=COL["tinta"])
        ax.set_xlabel("CS con las juntas al azar")
    fig.suptitle("Con las juntas donde caigan: reparto del coeficiente de seguridad (caja = 50 % central, bigotes = extremos sin atípicos)", fontsize=8.5, x=0.01, y=1.05, ha="left")
    fig.savefig(os.path.join(FIG, "fig4_juntas.png"), dpi=170, bbox_inches="tight"); plt.close(fig)
    # ---- fig 5: 12, 18 y 24 anclajes
    if R.get("numero"):
        ns = sorted(int(k) for k in R["numero"])
        fig, ax = plt.subplots(figsize=(4.6, 3.0))
        for pared, c in (("macizo", COL["azul"]), ("perforado", COL["naranja"])):
            v = [R["numero"][str(n)]["cs"][pared] for n in ns]
            ax.plot(ns, v, "-o", color=c, lw=2, ms=6)
            ax.text(ns[-1] + 0.4, v[-1], PAREDES[pared]["corto"], color=COL["tinta"], fontsize=8, va="center")
            for n, vv in zip(ns, v):
                ax.text(n, vv + 0.04, f"{vv:.2f}".replace(".", ","), ha="center", fontsize=7.5, color=COL["tinta"])
        ax.set_xticks(ns); ax.set_xlim(ns[0] - 1.5, ns[-1] + 4.5); ax.set_ylim(0, None)
        ax.set_xlabel("Número de anclajes (cada uno con su mejor patrón)"); ax.set_ylabel("Coeficiente de seguridad")
        ax.grid(axis="y", color=COL["rejilla"], lw=0.6); ax.set_axisbelow(True)
        ax.set_title("Qué se gana o se pierde con 12 y con 24", fontsize=9, loc="left", color=COL["tinta"])
        fig.savefig(os.path.join(FIG, "fig5_numero.png"), dpi=170, bbox_inches="tight"); plt.close(fig)
    # ---- fig 6: ¿es rígida la chapa? tracción máxima, modelo rígido frente a elementos finitos
    rg = R["rigidez"]
    filas = sorted([f for f in rg if f["rigido"] > 20], key=lambda f: -f["fem"])
    fig, ax = plt.subplots(figsize=(7.2, 0.3 * len(filas) + 1.1))
    y = np.arange(len(filas))
    for yy, f in zip(y, filas):
        ax.plot([f["rigido"], f["fem"]], [yy, yy], color=COL["gris"], lw=2, zorder=1)
    ax.scatter([f["rigido"] for f in filas], y, color=COL["tinta2"], s=30, zorder=2, label="Placa rígida (fórmula del encargo)")
    ax.scatter([f["fem"] for f in filas], y, color=COL["azul"], s=30, zorder=2, label="Chapa de 3 mm flexible (elementos finitos)")
    ax.set_yticks(y); ax.set_yticklabels([f["nombre"][:60] for f in filas], fontsize=7); ax.invert_yaxis()
    ax.set_xlabel("Tracción del anclaje más cargado (N)"); ax.grid(axis="x", color=COL["rejilla"], lw=0.6); ax.set_axisbelow(True)
    ax.legend(frameon=False, fontsize=7.5, loc="lower right")
    ax.set_title(f"La chapa no es rígida: la tracción real es mayor que la de la fórmula ({gan.split(' (')[0]})", fontsize=9, loc="left", color=COL["tinta"])
    fig.savefig(os.path.join(FIG, "fig6_rigidez.png"), dpi=170, bbox_inches="tight"); plt.close(fig)


# =============================================================================================== 11. TODO JUNTO
NOMBRE_NUEVO = "P18-4 (óptimo numérico)"
NOMBRE_ACTUAL = "P18-3 (el del CAD, 04-11)"
UMBRAL_CAMBIO = 1.10                   # solo se cambia el patrón del CAD si el nuevo mejora al menos un 10 % en macizo y en perforado


def _c(v, d=2):
    return f"{v:.{d}f}".replace(".", ",")


def cargar_busquedas():
    out = []
    if os.path.isdir(RES):
        for f in sorted(os.listdir(RES)):
            if f.startswith("busqueda_") and f.endswith(".json"):
                out.append(json.load(open(os.path.join(RES, f))))
    return out


def evaluar_fino(pts):
    """Evaluación completa de un patrón con el modelo fino (26 casos, dos bordes) en las tres paredes."""
    pts = np.asarray(pts, float)
    NV = fuerzas(pts, CASOS, "fem-fino")
    NVr = fuerzas(pts, CASOS, "rigido")
    r = dict(pts=pts.tolist(), cs={}, manda={}, casos={}, cs_rigido={}, s_min=separacion_min(pts), problemas=cabe(pts))
    for w, pared in PAREDES.items():
        d = coeficiente(pts, pared, modelo="fem-fino", detalle=True, NV=NV)
        r["cs"][w] = d["cs"]
        r["manda"][w] = dict(caso=d["caso"], nombre=d["caso_nombre"], anclaje=d["anclaje"], modo=d["modo"])
        r["casos"][w] = d["casos"]
        r["cs_rigido"][w] = coeficiente(pts, pared, modelo="rigido", NV=NVr)
        r.setdefault("psi", {})[w] = d["psi"]
        if w == "perforado":
            r["u_perforado"] = d["umax"].max(axis=(0, 1)).tolist()
    r["rigidez"] = [dict(clave=c["clave"], nombre=c["nombre"], fem=float(NV[0][:, j, :].max()), rigido=float(NVr[0][0, j, :].max())) for j, c in enumerate(CASOS)]
    return r


def subconjunto_separado(pts, s_min):
    """Quita agujeros (de la pareja más junta, el que deja mejor separación) hasta que todos distan ≥ s_min."""
    p = [tuple(q) for q in pts]
    while separacion_min(p) < s_min:
        a = np.asarray(p)
        d = np.sqrt(((a[:, None] - a[None]) ** 2).sum(-1)); d[np.diag_indices(len(p))] = 1e9
        i, j = np.unravel_index(d.argmin(), d.shape)
        si = np.sort(d[i])[1]; sj = np.sort(d[j])[1]
        p.pop(i if si <= sj else j)
    return p


def sensibilidad(pts):
    """Cómo cambia el CS (macizo, perforado, hueco) al mover las suposiciones que más pesan. Fuerzas con el modelo rápido."""
    global V_SM_REC
    pts = np.asarray(pts, float)
    NV = fuerzas(pts, CASOS, "fem-rapido")
    sin_patada = [j for j, c in enumerate(CASOS) if not c["clave"].startswith("K-L")]
    out = {}

    def cs3(f_muro=1.0, kap=1.0, idx=None):
        r = {}
        for w, pared in PAREDES.items():
            pp = dict(pared, kappa=pared["kappa"] * kap)
            nv = NV if idx is None else (NV[0][:, idx, :], NV[1][idx])
            cs_ = CASOS if idx is None else [CASOS[j] for j in idx]
            d = coeficiente(pts, pp, casos=cs_, f_muro=f_muro, detalle=True, NV=nv)
            r[w] = dict(cs=d["cs"], modo=d["modo"], caso=d["caso"])
        return r
    out["Base"] = cs3()
    out["Ladrillo un 50 % más flojo"] = cs3(f_muro=0.5)
    out["Ladrillo un 50 % más fuerte"] = cs3(f_muro=1.5)
    out["Cono de ladrillo un 50 % más flojo (κ × 0,5)"] = cs3(kap=0.5)
    out["Cono de ladrillo un 50 % más fuerte (κ × 1,5)"] = cs3(kap=1.5)
    v0 = V_SM_REC
    V_SM_REC = 2.0 * 1.2 * W_CANA * FU_TORNILLO / (10.0 + T / 2 + D_CANA / 2) / 1.25 / GAMMA_F
    out["Enlucido de 10 mm en vez de 15"] = cs3()
    V_SM_REC = 1e9
    out["Si el yeso sí sujetara el tornillo (sin flexión)"] = cs3()
    V_SM_REC = v0
    out["Sin el caso de la patada lateral baja"] = cs3(idx=sin_patada)
    out["Sin patada lateral baja y sin efecto de cono (κ × 3)"] = cs3(idx=sin_patada, kap=3.0)
    return out


def principal(rapido=False):
    t0 = time.time()
    for d in (RES, FIG, PLA):
        os.makedirs(d, exist_ok=True)
    busq = cargar_busquedas()
    b18 = [b for b in busq if b["n"] == 18 and b["penal"] == 0]
    R = dict(fecha="2026-11-13", masa=dict(cad=M_CAD, cg_cad=CG_CAD, calculo=M_CALC, cg=CG), datos=dict(N_S_REC=N_S_REC, V_SM_REC=V_SM_REC, BRAZO=BRAZO),
             paredes={w: {k: v for k, v in p.items()} for w, p in PAREDES.items()}, casos=[dict(clave=c["clave"], nombre=c["nombre"], grupo=c["grupo"],
             Q=c["Q"].tolist(), plano=list(c["plano"])) for c in CASOS])
    pats = dict(PATRONES)
    ya = {}                                                  # evaluaciones finas ya hechas, para no repetirlas
    if b18:
        # Las búsquedas puntúan con el modelo rápido. Dos formas distintas pueden empatar ahí y no con el modelo fino, que
        # es el que da las cifras del estudio. Por eso, entre las que quedan a menos de 0,01 de la mejor, decide el fino.
        print(f"[{time.time() - t0:5.0f} s] desempate de las búsquedas con el modelo fino…", flush=True)
        ya[NOMBRE_ACTUAL] = evaluar_fino(PATRONES[NOMBRE_ACTUAL])
        tope = max(b["mejora"] for b in b18)
        cand = {}
        for bq in sorted(b18, key=lambda b: (-b["mejora"], b["semilla"])):
            clave = tuple(sorted(map(tuple, bq["pts"])))
            if bq["mejora"] < tope - 0.01:
                continue
            if clave in cand:
                cand[clave]["semillas"].append(bq["semilla"])
                continue
            ef = evaluar_fino([tuple(q) for q in bq["pts"]])
            cand[clave] = dict(b=bq, fino=ef, semillas=[bq["semilla"]],
                               j=min(ef["cs"][w] / ya[NOMBRE_ACTUAL]["cs"][w] for w in PAREDES_OPT) if not ef["problemas"] else 0.0)
        elegido = max(cand.values(), key=lambda c: (round(c["j"], 4), c["b"]["mejora"]))
        mejor = elegido["b"]
        pats[NOMBRE_NUEVO] = [tuple(q) for q in mejor["pts"]]
        ya[NOMBRE_NUEVO] = elegido["fino"]
        R["candidatos"] = [dict(n_pares=c["b"]["n_pares"], n_eje=c["b"]["n_eje"], semillas=c["semillas"], mejora_rapido=c["b"]["mejora"],
                                mejora_fino=c["j"], cs_fino=c["fino"]["cs"], elegido=c is elegido) for c in cand.values()]
        for c in R["candidatos"]:
            print(f"        {c['n_pares']} parejas + {c['n_eje']} en el eje, semillas {c['semillas']}: rápido {c['mejora_rapido']:.4f} · fino {c['mejora_fino']:.4f}"
                  + ("  <- elegido" if c["elegido"] else ""), flush=True)
        R["busqueda"] = [dict(n=b["n"], n_pares=b["n_pares"], n_eje=b["n_eje"], semilla=b["semilla"], mejora=b["mejora"], evals=b["evals"], t=b["t"], hist=b["hist"]) for b in busq]
    print(f"[{time.time() - t0:5.0f} s] evaluación fina de {len(pats)} patrones…", flush=True)
    R["patrones"] = {nm: (ya[nm] if nm in ya else evaluar_fino(p)) for nm, p in pats.items()}
    R["actual"] = NOMBRE_ACTUAL
    gan = NOMBRE_ACTUAL
    if NOMBRE_NUEVO in R["patrones"]:
        a, n = R["patrones"][NOMBRE_ACTUAL]["cs"], R["patrones"][NOMBRE_NUEVO]["cs"]
        R["mejora_fina"] = {w: n[w] / a[w] for w in PAREDES}
        if min(n[w] / a[w] for w in PAREDES_OPT) >= UMBRAL_CAMBIO and not R["patrones"][NOMBRE_NUEVO]["problemas"]:
            gan = NOMBRE_NUEVO
    R["ganador"] = gan
    global NOMBRE_PLANTILLA
    NOMBRE_PLANTILLA = gan.split(" (")[0]
    G_ = pats[gan]
    R["rigidez"] = R["patrones"][gan]["rigidez"]
    print(f"[{time.time() - t0:5.0f} s] ganador: {gan}  CS {R['patrones'][gan]['cs']}", flush=True)
    # tensión en la chapa: tirón en la esquina que más castiga
    R["chapa"] = {}
    for nm in dict.fromkeys((NOMBRE_ACTUAL, gan)):
        peor = None
        for clave in ("T-EAD", "T-EAI", "T-EBD", "T-EBI"):
            c = next(c for c in CASOS if c["clave"] == clave)
            for emp in (False, True):
                s, donde = tension_chapa(pats[nm], c, emp)
                if peor is None or s > peor["sigma"]:
                    peor = dict(sigma=float(s), donde=donde, caso=clave, borde="empotrado" if emp else "apoyado")
        peor["tiron_fluencia_140"] = F_TIRON * RE_DC01 / peor["sigma"]
        R["chapa"][nm] = peor
    print(f"[{time.time() - t0:5.0f} s] robustez (juntas al azar)…", flush=True)
    nmc = 30 if rapido else 150
    comparar = [nm for nm in (NOMBRE_ACTUAL, NOMBRE_NUEVO, "Rejilla 3 × 6 adaptada (x = ±89,5)", "Solo perímetro") if nm in pats]
    R["juntas"] = {w: {nm: montecarlo_juntas(pats[nm], PAREDES[w], nmc=nmc) for nm in comparar} for w in PAREDES}
    print(f"[{time.time() - t0:5.0f} s] anclajes fallados y sensibilidad…", flush=True)
    R["sin_peores"] = {nm: {w: sin_los_peores(pats[nm], PAREDES[w]) for w in PAREDES_OPT} for nm in dict.fromkeys((NOMBRE_ACTUAL, gan))}
    R["sensibilidad"] = {nm: sensibilidad(pats[nm]) for nm in dict.fromkeys((NOMBRE_ACTUAL, gan))}
    # 12 y 24 anclajes
    R["numero"] = {"18": dict(cs=R["patrones"][gan]["cs"], pts=[list(p) for p in G_])}
    for n in (12, 24):
        bn = [b for b in busq if b["n"] == n and b["penal"] == 0]
        if bn:
            b = max(bn, key=lambda b: b["mejora"])
            e = evaluar_fino(b["pts"])
            R["numero"][str(n)] = dict(cs=e["cs"], pts=b["pts"], manda=e["manda"], s_min=e["s_min"])
    # ¿gana algo soltar la simetría?
    if not rapido:
        print(f"[{time.time() - t0:5.0f} s] prueba sin simetría…", flush=True)
        lib = pulir_libre(G_)
        R["libre"] = dict(mejora_simetrico=mejora(G_), mejora_libre=lib["mejora"], pts=lib["pts"])
    # alternativa química en ladrillo hueco: solo los agujeros que distan ≥ 100 mm
    sub = subconjunto_separado(G_, QUIMICO["s_min"])
    pq = dict(PAREDES["hueco"], F_rec=QUIMICO["N_rec"])
    R["quimico"] = dict(n=len(sub), pts=[list(p) for p in sub], cs=coeficiente(sub, pq, modelo="fem-fino"),
                        cs_18_taco=R["patrones"][gan]["cs"]["hueco"])
    # lo que debería medirse en el ensayo de la máquina montada: separación de la trasera al tirar de una esquina
    R["ensayo"] = {}
    for clave in ("T-EAD", "T-AR"):
        c = next(c for c in CASOS if c["clave"] == clave)
        sep, nmax = [], []
        for emp in (False, True):
            mm = fem("fino", emp); mm.preparar(np.asarray(G_, float))
            rr = mm.resolver(c["Q"])
            sep.append(rr["sep_max"]); nmax.append(float(rr["N"].max()))
        R["ensayo"][clave] = dict(nombre=c["nombre"], separacion_mm=[min(sep), max(sep)], traccion_max_N=[min(nmax), max(nmax)])
    R["mano"] = contraste_a_mano(G_)
    R["coordenadas"] = coordenadas(G_)
    # plantilla y tabla
    plantilla_dxf(G_, os.path.join(PLA, "Plantilla_taladros_1a1.dxf"))
    plantilla_pdf(G_, os.path.join(PLA, "Plantilla_taladros_A2_1a1.pdf"), os.path.join(PLA, "Plantilla_taladros_A4_mosaico_1a1.pdf"))
    with open(os.path.join(AQUI, "coordenadas.csv"), "w", encoding="utf-8") as f:
        f.write("n;X_mm_desde_esquina_inferior_izquierda;Z_mm_desde_la_base;x_cad_mm;z_cad_mm\n")
        for c in R["coordenadas"]:
            f.write(f"{c['n']};{c['X']:.1f};{c['Z']:.1f};{c['x_cad']:.1f};{c['z_cad']:.1f}\n".replace(".", ","))
    figuras(R)
    for nm in R["patrones"]:                                  # las matrices grandes no van al JSON
        R["patrones"][nm].pop("rigidez", None) if nm != gan else None
    json.dump(R, open(os.path.join(RES, "resumen.json"), "w"), ensure_ascii=False, indent=1, default=lambda o: o.tolist() if hasattr(o, "tolist") else str(o))
    open(os.path.join(RES, "tablas.md"), "w", encoding="utf-8").write(tablas(R))
    print(f"[{time.time() - t0:5.0f} s] hecho. Ganador: {gan}. Resultados en {RES}, figuras en {FIG}, plantilla en {PLA}")
    return R


GRUPOS_CASO = [  # (nombre, claves, carga supuesta, valor, unidad) -> «carga que agota» = valor × CS
    ("Peso propio", ("G",), "18 kg", 18.0, "kg"),
    ("Persona colgada del borde de arriba (se deja caer, ×2)", ("CU-C", "CU-D", "CU-I"), "120 kg", 120.0, "kg"),
    ("Tirón hacia fuera, arriba o abajo en el centro", ("T-AR", "T-AB"), "1000 N", 1000.0, "N"),
    ("Tirón hacia fuera desde una esquina", ("T-EAD", "T-EAI", "T-EBD", "T-EBI"), "1000 N", 1000.0, "N"),
    ("Tirón de un lado, a media altura (torsión)", ("T-LD", "T-LI"), "1000 N", 1000.0, "N"),
    ("Empuje lateral arriba", ("E-LD", "E-LI"), "1000 N", 1000.0, "N"),
    ("Empuje hacia arriba", ("E-UP",), "1000 N", 1000.0, "N"),
    ("Patada lateral abajo", ("K-LD", "K-LI"), "4500 N", 4500.0, "N"),
    ("Puñetazo lateral arriba", ("P-LD", "P-LI"), "3000 N", 3000.0, "N"),
    ("Patada de abajo arriba", ("K-UP",), "3000 N", 3000.0, "N"),
    ("Golpe de frente", ("P-FR",), "5000 N", 5000.0, "N"),
    ("Colgado (120 kg, sin golpe) + tirón de 1000 N", ("C1",), "1177 N + 1000 N", None, ""),
    ("Colgado de una esquina + empuje lateral", ("C2D", "C2I"), "1177 N + 1000 N", None, ""),
    ("Tirón en esquina + empuje lateral", ("C3D", "C3I"), "1000 N + 1000 N", None, "")]


def _agota(valor, unidad, cs):
    if valor is None:
        return f"las dos × {_c(cs)}"
    return f"{_c(valor * cs, 0)} {unidad}"


def tablas(R):
    """Tablas del estudio en Markdown (se pegan en ESTUDIO-ANCLAJE.md)."""
    P, gan, act = R["patrones"], R["ganador"], R["actual"]
    L = ["<!-- generado por anclaje.py; no editar a mano -->", ""]
    L += ["### T1. Resumen por patrón", "",
          "| Patrón | Cabe | Sep. mín. (mm) | CS macizo | CS perforado | CS hueco doble | Caso que manda (perforado) | Modo de fallo que manda (perforado) | CS con placa rígida (perforado) |",
          "|---|---|---|---|---|---|---|---|---|"]
    for nm, r in P.items():
        m = r["manda"]["perforado"]
        L.append(f"| {nm} | {'sí' if not r['problemas'] else 'no'} | {_c(r['s_min'], 1)} | {_c(r['cs']['macizo'])} | {_c(r['cs']['perforado'])} | {_c(r['cs']['hueco'])} | "
                 f"{m['nombre']} | {m['modo']} | {_c(r['cs_rigido']['perforado'])} |")
    for nm in dict.fromkeys((act, gan)):
        L += ["", f"### T2. Carga de fallo por caso · {nm}", "",
              "«Carga que agota» = carga supuesta × CS del caso: la que lleva al anclaje más cargado a su carga recomendada.", "",
              "| Caso | Carga supuesta | CS macizo | CS perforado | CS hueco | Carga que agota (macizo) | Carga que agota (perforado) | Modo que manda (perforado) |", "|---|---|---|---|---|---|---|---|"]
        for nombre, claves, carga, valor, unidad in GRUPOS_CASO:
            f = {w: min((x for x in P[nm]["casos"][w] if x["clave"] in claves), key=lambda x: x["cs"]) for w in PAREDES}
            L.append(f"| {nombre} | {carga} | {_c(f['macizo']['cs'])} | {_c(f['perforado']['cs'])} | {_c(f['hueco']['cs'])} | {_agota(valor, unidad, f['macizo']['cs'])} | "
                     f"{_agota(valor, unidad, f['perforado']['cs'])} | {f['perforado']['modo']} |")
        L.append(f"| **Mínimo** | | **{_c(P[nm]['cs']['macizo'])}** | **{_c(P[nm]['cs']['perforado'])}** | **{_c(P[nm]['cs']['hueco'])}** | | | |")
    L += ["", f"### T3. ¿Es rígida la chapa? Tracción del anclaje más cargado ({gan})", "", "| Caso | Placa rígida (N) | Chapa flexible, FEM (N) | FEM / rígida |", "|---|---|---|---|"]
    for f in R["rigidez"]:
        if f["rigido"] > 20:
            L.append(f"| {f['nombre']} | {_c(f['rigido'], 0)} | {_c(f['fem'], 0)} | {_c(f['fem'] / f['rigido'])} |")
    L += ["", "### T4. Juntas al azar (Monte Carlo)", "", "| Pared | Patrón | Tacos en junta (media / máx.) | CS mediana | CS percentil 5 | CS mínimo | Tacos que ceden (media) |", "|---|---|---|---|---|---|---|"]
    for w in PAREDES:
        for nm, m in R["juntas"][w].items():
            L.append(f"| {PAREDES[w]['corto']} | {nm} | {_c(m['en_junta_media'], 1)} / {m['en_junta_max']} | {_c(m['mediana'])} | {_c(m['p05'])} | {_c(m['minimo'])} | {_c(m['ceden_media'], 1)} |")
    L += ["", "### T5. Con los peores anclajes fallados", "", "| Patrón | Pared | Intacto | Sin 1 | Sin 2 | Sin 3 | Sin 4 | Anclajes quitados (n.º de plantilla) |", "|---|---|---|---|---|---|---|---|"]
    for nm in dict.fromkeys((act, gan)):
        d = R["sin_peores"][nm]
        num = {tuple(p): k + 1 for k, p in enumerate(numerar(P[nm]["pts"]))}
        for w, s in d.items():
            q = [num[tuple(P[nm]["pts"][i - 1])] for i in s["quitados"]]
            L.append(f"| {nm} | {PAREDES[w]['corto']} | " + " | ".join(_c(v) for v in s["cs"]) + f" | {', '.join(map(str, q))} |")
    L += ["", "### T6. Sensibilidad", "", "| Suposición | Patrón | CS macizo (modo) | CS perforado (modo) | CS hueco (modo) |", "|---|---|---|---|---|"]
    for var in R["sensibilidad"][gan]:
        for nm in dict.fromkeys((act, gan)):
            s = R["sensibilidad"][nm][var]
            L.append(f"| {var} | {nm.split(' (')[0]} | " + " | ".join(f"{_c(s[w]['cs'])} ({s[w]['modo'].split(' (')[0]})" for w in PAREDES) + " |")
    L += ["", "### T7. Número de anclajes", "", "| N.º | CS macizo | CS perforado | CS hueco | Respecto a 18 (perforado) |", "|---|---|---|---|---|"]
    for n in sorted(R["numero"], key=int):
        c = R["numero"][n]["cs"]
        L.append(f"| {n} | {_c(c['macizo'])} | {_c(c['perforado'])} | {_c(c['hueco'])} | {_c(100 * (c['perforado'] / R['numero']['18']['cs']['perforado'] - 1), 0)} % |")
    L += ["", f"### T8. Coordenadas de los 18 taladros ({gan})", "", "Mirando a la pared. X desde la esquina inferior izquierda de la trasera, Z desde la base. x del CAD = X − 110.", "",
          "| N.º | X (mm) | Z (mm) | x CAD (mm) | | N.º | X (mm) | Z (mm) | x CAD (mm) |", "|---|---|---|---|---|---|---|---|---|"]
    co = R["coordenadas"]
    for k in range(9):
        a, b = co[k], co[k + 9]
        L.append(f"| {a['n']} | {_c(a['X'], 1)} | {_c(a['Z'], 1)} | {_c(a['x_cad'], 1)} | | {b['n']} | {_c(b['X'], 1)} | {_c(b['Z'], 1)} | {_c(b['x_cad'], 1)} |")
    noms = list(P)
    L += ["", "### T10. Coeficiente de seguridad por caso y por patrón (ladrillo perforado)", "",
          "| Caso · carga supuesta | " + " | ".join(nm.split(" (")[0] for nm in noms) + " |", "|---|" + "---|" * len(noms)]
    for nombre, claves, carga, valor, unidad in GRUPOS_CASO:
        v = [min(x["cs"] for x in P[nm]["casos"]["perforado"] if x["clave"] in claves) for nm in noms]
        L.append(f"| {nombre} · {carga} | " + " | ".join(_c(x) for x in v) + " |")
    L.append("| **Mínimo** | " + " | ".join(f"**{_c(P[nm]['cs']['perforado'])}**" for nm in noms) + " |")
    L += ["", "### T9. Contraste a mano (modelo de placa rígida)", "", "| Caso | Fórmula | Sustitución | A mano | Código |", "|---|---|---|---|---|"]
    for m in R["mano"]:
        L.append(f"| {m['caso']} | {m['formula']} | {m['sustitucion'].replace('.', ',')} | {_c(m['mano'], 1)} N | {_c(m['codigo'], 1)} N |")
    return "\n".join(L) + "\n"


def _guardar_busqueda(r):
    os.makedirs(RES, exist_ok=True)
    f = os.path.join(RES, f"busqueda_{r['n_pares']}_{r['n_eje']}_{r['semilla']}.json")
    json.dump(r, open(f, "w"), indent=1)
    print(f"n = {r['n']}  mejora = {r['mejora']:.3f}  penal = {r['penal']:.2f}  {r['evals']} evaluaciones en {r['t']:.0f} s -> {os.path.basename(f)}", flush=True)
    return r


def tarea_de(n_pares, n_eje, semilla, gens=120, pop=6):
    """Evolución diferencial sembrada con los patrones a mano que tengan esa forma."""
    siembra = [[tuple(q) for q in b["pts"]] for b in cargar_busquedas() if b["n_pares"] == n_pares and b["n_eje"] == n_eje and b["penal"] == 0]
    siembra += [p for p in PATRONES.values() if codificar(p, n_pares, n_eje) is not None]      # también los patrones hechos a mano
    return _guardar_busqueda(buscar(n_pares, n_eje, semilla, gens=gens, pop=pop, siembra=siembra))


def tarea_saltos(clave, n_saltos, semilla, desde_mejor=False):
    """Búsqueda por coordenadas desde una semilla de perímetro + saltos."""
    n_pares, n_eje, pts = SEMILLAS[clave]
    prev = [b for b in cargar_busquedas() if b["n_pares"] == n_pares and b["n_eje"] == n_eje and b["penal"] == 0] if desde_mejor else []
    if prev:
        pts = [tuple(q) for q in max(prev, key=lambda b: b["mejora"])["pts"]]
    else:
        pts = [tuple(q) for q in busqueda_local(pts, n_pares, n_eje, semilla=semilla)["pts"]]
    return _guardar_busqueda(saltos(pts, n_pares, n_eje, n_saltos=n_saltos, semilla=semilla))


def optimizar_todo():
    """La búsqueda completa tal como se hizo el 13-11-2026 (alrededor de una hora con 2 núcleos, lanzada en serie).
    Se hizo con el tirafondo cincado; al pasar al inoxidable A2 se repitieron las dos de 18 anclajes con las semillas
    301 y 302 (--saltos 18a,12,301 y --saltos 18b,8,302). El ganador lo elige principal() con el modelo fino."""
    tarea_saltos("18a", 12, 201)         # coordenadas + saltos desde el perímetro (8 parejas + 2 en el eje)
    tarea_saltos("18b", 8, 202)          # ídem con 9 parejas y ninguno en el eje
    tarea_de(8, 2, 2, gens=60)           # evolución diferencial sembrada con lo anterior: ¿encuentra algo mejor?
    tarea_saltos("12", 6, 212)           # 12 anclajes
    tarea_saltos("24", 6, 224)           # 24 anclajes


def montar_estudio():
    """Rellena ESTUDIO.plantilla.md con las tablas de resultados/tablas.md -> ESTUDIO-ANCLAJE.md. Así las tablas del estudio
    salen siempre del cálculo; las cifras citadas en el texto se revisan a mano contra ellas."""
    plantilla = os.path.join(AQUI, "ESTUDIO.plantilla.md")
    if not os.path.exists(plantilla):
        return
    trozos, clave, vistos = {}, None, {}
    for linea in open(os.path.join(RES, "tablas.md"), encoding="utf-8").read().splitlines():
        if linea.startswith("### T"):
            k = linea[4:].split(".")[0]
            vistos[k] = vistos.get(k, 0) + 1
            clave = k if k != "T2" else "T2" + "ab"[vistos[k] - 1]            # T2a = patrón que había, T2b = ganador
            trozos[clave] = []
        elif clave and not linea.startswith("«Carga que agota»") and not linea.startswith("Mirando a la pared."):
            trozos[clave].append(linea)
    if "T2b" not in trozos and "T2a" in trozos:
        trozos["T2b"] = trozos["T2a"]
    txt = open(plantilla, encoding="utf-8").read()
    for k, v in trozos.items():
        txt = txt.replace("{{" + k + "}}", "\n".join(v).strip())
    faltan = [m for m in ("{{T1}}", "{{T2a}}", "{{T2b}}", "{{T3}}", "{{T4}}", "{{T5}}", "{{T6}}", "{{T7}}", "{{T8}}", "{{T9}}", "{{T10}}") if m in txt]
    if faltan:
        print("AVISO: sin rellenar", faltan)
    open(os.path.join(AQUI, "ESTUDIO-ANCLAJE.md"), "w", encoding="utf-8").write(txt)
    print("ESTUDIO-ANCLAJE.md montado")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Bloque 2: anclaje a pared (ver cabecera)")
    ap.add_argument("--optimizar", action="store_true", help="repite toda la búsqueda (18, 12 y 24 anclajes) antes de evaluar")
    ap.add_argument("--de", metavar="PAREJAS,EJE,SEMILLA[,GENS]", help="solo una evolución diferencial")
    ap.add_argument("--saltos", metavar="CLAVE,SALTOS,SEMILLA", help="solo una búsqueda por coordenadas + saltos (claves: 18a, 18b, 12, 24)")
    ap.add_argument("--desde-mejor", action="store_true", help="con --saltos: parte del mejor resultado guardado de esa forma")
    ap.add_argument("--rapido", action="store_true", help="menos muestras de Monte Carlo")
    ap.add_argument("--mano", action="store_true", help="solo el contraste con el cálculo a mano")
    ap.add_argument("--figuras", action="store_true", help="rehace figuras, tablas y plantilla con los resultados guardados (sin recalcular)")
    a = ap.parse_args()
    if a.de:
        v = [int(t) for t in a.de.split(",")]
        tarea_de(*v[:3], **(dict(gens=v[3]) if len(v) > 3 else {}))
        sys.exit(0)
    if a.saltos:
        v = a.saltos.split(",")
        tarea_saltos(v[0], int(v[1]), int(v[2]), desde_mejor=a.desde_mejor)
        sys.exit(0)
    if a.mano:
        f = os.path.join(RES, "resumen.json")                # el patrón ganador es el del último cálculo completo
        pts = P18_3
        if os.path.exists(f):
            Rm = json.load(open(f))
            pts = Rm["patrones"][Rm["ganador"]]["pts"]
        for m in contraste_a_mano(pts):
            print(f"{m['caso']}\n   {m['formula']}\n   {m['sustitucion']}\n   a mano {m['mano']:.2f} N · código {m['codigo']:.2f} N")
        sys.exit(0)
    if a.figuras:
        R = json.load(open(os.path.join(RES, "resumen.json")))
        NOMBRE_PLANTILLA = R["ganador"].split(" (")[0]
        G_ = [tuple(q) for q in R["patrones"][R["ganador"]]["pts"]]
        R["mano"] = contraste_a_mano(G_)
        plantilla_dxf(G_, os.path.join(PLA, "Plantilla_taladros_1a1.dxf"))
        plantilla_pdf(G_, os.path.join(PLA, "Plantilla_taladros_A2_1a1.pdf"), os.path.join(PLA, "Plantilla_taladros_A4_mosaico_1a1.pdf"))
        figuras(R)
        json.dump(R, open(os.path.join(RES, "resumen.json"), "w"), ensure_ascii=False, indent=1)
        open(os.path.join(RES, "tablas.md"), "w", encoding="utf-8").write(tablas(R))
        montar_estudio()
        print("figuras, tablas y plantilla rehechas")
        sys.exit(0)
    if a.optimizar:
        optimizar_todo()
    principal(rapido=a.rapido)
    montar_estudio()
