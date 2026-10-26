"""Comprobaciones: choques entre piezas en posición, y barridos de los cajones."""
import itertools
import cadquery as cq


def bbox_overlap(a, b, tol=0.0):
    return not (a.xmax <= b.xmin + tol or b.xmax <= a.xmin + tol or a.ymax <= b.ymin + tol or b.ymax <= a.ymin + tol
                or a.zmax <= b.zmin + tol or b.zmax <= a.zmin + tol)


PARES_BUSCADOS = [("Tuerca", "Espárrago"), ("Tuerca M4", "Tornillo de seguridad"), ("Separador", "Espárrago"), ("Pasacables", ""), ("AR9271", "Raspberry"),
                  ("Clavija", "Pantalla 7"), ("Clavija HDMI recta", "Raspberry"), ("Clavija micro-USB", "Raspberry"), ("Clavija USB-A del cable", "Borne USB-A"), ("Clavija XH", "Sensor ZE29A"), ("Silentblock", "Bandeja"), ("Silentblock", "Base del cajón"),
                  ("Cerradura", "Faldón"), ("Pasamuros", "Tira trasera"), ("Pasamuros", "Tapa superior"),
                  ("Tirador", "Tapa (cierra"), ("Separador sensor", "Sensor ZE29A"), ("Espárrago", "Frente del cajón"),
                  ("Espárrago", "Panel frontal"), ("Espárrago", "Trasera"), ("Espárrago de tierra M4×20 (cajón)", "Lateral derecho del cajón"),
                  ("Bisagra", "Tapa superior"), ("Bisagra", "Lateral"), ("Bisagra de piano (ala fija", "Bisagra de piano (ala móvil"),
                  ("Pestaña de tope", "Tapa superior"), ("Pasamuros", "Lateral"), ("Cerradura", "Faldón")]


def buscado(a, b):
    for x, y in PARES_BUSCADOS:
        if (x in a["nombre"] and y in b["nombre"]) or (x in b["nombre"] and y in a["nombre"]):
            return True
    return False


def choques(piezas, umbral=0.05, ignorar=None):
    ignorar = ignorar or buscado
    bbs = [(p, p["solido"].BoundingBox()) for p in piezas]
    out = []
    for (pa, ba), (pb, bb) in itertools.combinations(bbs, 2):
        if not bbox_overlap(ba, bb, 0.01):
            continue
        if ignorar(pa, pb):
            continue
        try:
            v = pa["solido"].intersect(pb["solido"]).Volume()
        except Exception as e:
            v = -1
        if v > umbral or v < 0:
            out.append((pa["id"], pa["nombre"], pb["id"], pb["nombre"], round(v, 2)))
    return out


def barrido(moviles, fijos, vector, pasos, umbral=0.05):
    """Traslada el grupo móvil en 'pasos' posiciones a lo largo de 'vector' y busca choques con los fijos."""
    res = []
    fb = [(p, p["solido"].BoundingBox()) for p in fijos]
    for k in range(1, pasos + 1):
        f = k / pasos
        d = cq.Vector(vector[0] * f, vector[1] * f, vector[2] * f)
        for pm in moviles:
            s = pm["solido"].translate(d)
            bm = s.BoundingBox()
            for pf, bf in fb:
                if not bbox_overlap(bm, bf, 0.01):
                    continue
                v = s.intersect(pf["solido"]).Volume()
                if v > umbral:
                    res.append((round(f * 100), pm["id"], pm["nombre"], pf["id"], pf["nombre"], round(v, 2)))
    return res


def zonas_libres(m, piezas=None):
    """Comprueba que los volúmenes de m.zonas (p. ej. el giro de la leva) no tocan ninguna pieza."""
    piezas = piezas if piezas is not None else m.piezas
    out = []
    for nz, sz in m.zonas:
        bz = sz.BoundingBox()
        for p in piezas:
            if p["movil"] == "tapa":
                continue
            if not bbox_overlap(bz, p["solido"].BoundingBox(), 0.01):
                continue
            v = sz.intersect(p["solido"]).Volume()
            if v > 0.05:
                out.append((nz, p["id"], p["nombre"], round(v, 2)))
    return out
