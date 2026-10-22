"""Utilidades geométricas: colocación con ejes, agujeros en chapas planas, ranuras."""
import math
import cadquery as cq
from OCP.gp import gp_Trsf
from OCP.BRepBuilderAPI import BRepBuilderAPI_Transform
from comp import box, cyl, V


def place(shape, ex=(1, 0, 0), ey=(0, 1, 0), ez=(0, 0, 1), at=(0, 0, 0)):
    """Coloca un sólido: el eje X local va a 'ex', Y local a 'ey', Z local a 'ez' (deben ser ortonormales
    y dextrógiros) y el origen local a 'at'."""
    t = gp_Trsf()
    t.SetValues(float(ex[0]), float(ey[0]), float(ez[0]), float(at[0]),
                float(ex[1]), float(ey[1]), float(ez[1]), float(at[1]),
                float(ex[2]), float(ey[2]), float(ez[2]), float(at[2]))
    return cq.Shape.cast(BRepBuilderAPI_Transform(shape.wrapped, t, True).Shape())


def place_parts(parts, **kw):
    return [(n, place(s, **kw), c) for n, s, c in parts]


def rot_x(deg):
    a = math.radians(deg)
    return dict(ex=(1, 0, 0), ey=(0, math.cos(a), math.sin(a)), ez=(0, -math.sin(a), math.cos(a)))


def hole_y(x, z, d, y0=-50, h=200):
    """Taladro de eje Y (chapas verticales paralelas al frente)."""
    return cyl(d / 2, h, (x, y0, z), (0, 1, 0))


def hole_x(y, z, d, x0=-500, h=1000):
    return cyl(d / 2, h, (x0, y, z), (1, 0, 0))


def hole_z(x, y, d, z0=-50, h=1000):
    return cyl(d / 2, h, (x, y, z0), (0, 0, 1))


def slot_y(xc, zc, L, W, horizontal=True):
    """Ranura de extremos redondos en una chapa vertical paralela al frente (eje Y)."""
    if horizontal:
        r = W / 2
        s = box(xc - L / 2 + r, xc + L / 2 - r, -50, 150, zc - r, zc + r)
        s = s.fuse(cyl(r, 200, (xc - L / 2 + r, -50, zc), (0, 1, 0))).fuse(cyl(r, 200, (xc + L / 2 - r, -50, zc), (0, 1, 0)))
    else:
        r = L / 2
        s = box(xc - r, xc + r, -50, 150, zc - W / 2 + r, zc + W / 2 - r)
        s = s.fuse(cyl(r, 200, (xc, -50, zc - W / 2 + r), (0, 1, 0))).fuse(cyl(r, 200, (xc, -50, zc + W / 2 - r), (0, 1, 0)))
    return s


def slot_x(yc, zc, L, W):
    """Ranura horizontal (larga en Y) en una chapa lateral (eje X)."""
    r = W / 2
    s = box(-500, 500, yc - L / 2 + r, yc + L / 2 - r, zc - r, zc + r)
    return s.fuse(cyl(r, 1000, (-500, yc - L / 2 + r, zc), (1, 0, 0))).fuse(cyl(r, 1000, (-500, yc + L / 2 - r, zc), (1, 0, 0)))


def slot_z(xc, yc, L, W, along="x"):
    """Ranura en una chapa horizontal (eje Z), larga en X o en Y."""
    r = W / 2
    if along == "x":
        s = box(xc - L / 2 + r, xc + L / 2 - r, yc - r, yc + r, -500, 500)
        return s.fuse(cyl(r, 1000, (xc - L / 2 + r, yc, -500), (0, 0, 1))).fuse(cyl(r, 1000, (xc + L / 2 - r, yc, -500), (0, 0, 1)))
    s = box(xc - r, xc + r, yc - L / 2 + r, yc + L / 2 - r, -500, 500)
    return s.fuse(cyl(r, 1000, (xc, yc - L / 2 + r, -500), (0, 0, 1))).fuse(cyl(r, 1000, (xc, yc + L / 2 - r, -500), (0, 0, 1)))


def cut_all(shape, cutters):
    for c in cutters:
        shape = shape.cut(c)
    return shape.clean()


def keyhole_y(x, z, d_cabeza=10.0, ancho=5.0, largo=10.0):
    """Agujero de cuelgue (bocallave) en la trasera: agujero d_cabeza abajo + ranura de 'ancho' hacia arriba."""
    s = cyl(d_cabeza / 2, 200, (x, -50, z), (0, 1, 0))
    s = s.fuse(box(x - ancho / 2, x + ancho / 2, -50, 150, z, z + largo)).fuse(cyl(ancho / 2, 200, (x, -50, z + largo), (0, 1, 0)))
    return s


def vent_slots_x(y0, y1, z0, z1, L=22, W=4, pitch_y=30, pitch_z=10):
    """Rejilla de ranuras (largas en Y) para una chapa lateral."""
    out = []
    ny = max(1, int((y1 - y0 + pitch_y - L) // pitch_y))
    nz = max(1, int((z1 - z0) // pitch_z) + 1)
    yspan = (ny - 1) * pitch_y
    yc0 = (y0 + y1) / 2 - yspan / 2
    zspan = (nz - 1) * pitch_z
    zc0 = (z0 + z1) / 2 - zspan / 2
    for i in range(ny):
        for j in range(nz):
            out.append(slot_x(yc0 + i * pitch_y, zc0 + j * pitch_z, L, W))
    return out


def vent_slots_z(x0, x1, y0, y1, L=22, W=4, pitch_x=28, pitch_y=9):
    """Rejilla de ranuras (largas en X) para una chapa horizontal."""
    out = []
    nx = max(1, int((x1 - x0 + pitch_x - L) // pitch_x))
    ny = max(1, int((y1 - y0) // pitch_y) + 1)
    xc0 = (x0 + x1) / 2 - (nx - 1) * pitch_x / 2
    yc0 = (y0 + y1) / 2 - (ny - 1) * pitch_y / 2
    for i in range(nx):
        for j in range(ny):
            out.append(slot_z(xc0 + i * pitch_x, yc0 + j * pitch_y, L, W, "x"))
    return out


def vent_slots_y(x0, x1, z0, z1, L=22, W=4, pitch_x=28, pitch_z=9):
    out = []
    nx = max(1, int((x1 - x0 + pitch_x - L) // pitch_x))
    nz = max(1, int((z1 - z0) // pitch_z) + 1)
    xc0 = (x0 + x1) / 2 - (nx - 1) * pitch_x / 2
    zc0 = (z0 + z1) / 2 - (nz - 1) * pitch_z / 2
    for i in range(nx):
        for j in range(nz):
            out.append(slot_y(xc0 + i * pitch_x, zc0 + j * pitch_z, L, W))
    return out
