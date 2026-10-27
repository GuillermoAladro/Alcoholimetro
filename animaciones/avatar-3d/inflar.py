"""Convierte una pieza RGBA (dibujo plano) en una malla 3D "hinchada": la silueta se triangula y cada vértice se
levanta según lo lejos que está del borde (sección redondeada), por delante y por detrás."""
import numpy as np, cv2, triangle, trimesh
from shapely.geometry import Polygon
from PIL import Image

def rampa(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

def contornos(alpha, umbral=120, simplificar=1.5, min_area=400):
    m = (alpha > umbral).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    cs, hier = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    out = []
    for i, c in enumerate(cs):
        if hier[0][i][3] != -1: continue  # solo exteriores
        if cv2.contourArea(c) < min_area: continue
        c = cv2.approxPolyDP(c, simplificar, True)[:, 0, :].astype(np.float64)
        if len(c) >= 3: out.append(c)
    return out

def triangular(contorno, area_max):
    """Triangulación de calidad del polígono (puntos interiores añadidos por `triangle`)."""
    n = len(contorno)
    seg = np.array([[i, (i + 1) % n] for i in range(n)])
    t = triangle.triangulate({'vertices': contorno, 'segments': seg}, 'pq28a%.1f' % area_max)
    return t['vertices'], t['triangles'], t['vertex_markers'][:, 0] > 0

def inflar(rgba, k=1.0, z_extra=None, area_max=40.0, suavizado=4, origen=(0, 0), escala_z=1.0, z0=0.0, atras=0.9, perfil=None):
    """Devuelve una lista de (mesh_delante, mesh_detras) por componente conexa. Coordenadas: x, y del dibujo
    (desplazadas por `origen`), z hacia quien mira. `k`: grosor respecto al radio local (1 = sección circular).
    `z_extra`: mapa de relieve adicional (mismo tamaño que la pieza), se suma por delante.
    `perfil`: función (d_normalizada 0..1) -> 0..1 para la sección; por defecto, un cuarto de elipse."""
    a = rgba[..., 3]
    h, w = a.shape
    m = (a > 120).astype(np.uint8)
    d = cv2.distanceTransform(m, cv2.DIST_L2, 5)
    R = float(np.percentile(d[d > 0], 99.5)) if (d > 0).any() else 1.0
    t = np.clip(d / R, 0, 1)
    z = (np.sqrt(1 - (1 - t) ** 2) if perfil is None else perfil(t)) * R * k
    z = cv2.GaussianBlur(z.astype(np.float32), (0, 0), suavizado)
    z[m == 0] = 0
    if z_extra is not None: zf = z + z_extra
    else: zf = z
    zb = z * atras
    out = []
    for c in contornos(a):
        V2, F, borde = triangular(c, area_max)
        xs = np.clip(V2[:, 0], 0, w - 1).astype(np.float32); ys = np.clip(V2[:, 1], 0, h - 1).astype(np.float32)
        zfv = cv2.remap(zf.astype(np.float32), xs[None], ys[None], cv2.INTER_LINEAR)[0]
        zbv = cv2.remap(zb.astype(np.float32), xs[None], ys[None], cv2.INTER_LINEAR)[0]
        # los vértices del contorno (también los que `triangle` añade sobre él) quedan a z = 0: delante y detrás
        # se cierran ahí
        zfv[borde] = 0; zbv[borde] = 0
        X = V2[:, 0] + origen[0]; Y = V2[:, 1] + origen[1]
        uv = np.stack([V2[:, 0] / w, 1 - V2[:, 1] / h], 1)
        vf = np.stack([X, Y, z0 + zfv * escala_z], 1); vb = np.stack([X, Y, z0 - zbv * escala_z], 1)
        mf = trimesh.Trimesh(vf, F, process=False); mb = trimesh.Trimesh(vb, F[:, ::-1], process=False)
        mf.visual = trimesh.visual.TextureVisuals(uv=uv); mb.visual = trimesh.visual.TextureVisuals(uv=uv.copy())
        out.append((mf, mb))
    return out

def a_3d(mesh, O):
    """Del sistema del dibujo (x derecha, y abajo, z hacia quien mira) al 3D (x derecha, y arriba, z hacia quien mira),
    con el origen O (en px del dibujo)."""
    v = mesh.vertices.copy()
    v[:, 0] -= O[0]; v[:, 1] = O[1] - v[:, 1]
    m = mesh.copy(); m.vertices = v
    m.invert()  # el cambio de signo de y invierte la orientación
    return m
