"""Barridos: cajón de componentes subiendo (con la tapa abierta) y cajón de pajitas saliendo a la izquierda."""
import sys, time, math
sys.path.insert(0, "/home/claude/nuevo")
import cadquery as cq
import specs, diseno, comprobar


def tapa_abierta(m, p):
    """Devuelve el sólido de una pieza de la tapa en posición abierta."""
    mv = m.movil["tapa"]
    s = p["solido"]
    if mv["tipo"] == "giro":
        (o, d) = mv["eje"]
        return s.rotate(cq.Vector(*o), cq.Vector(o[0] + d[0], o[1] + d[1], o[2] + d[2]), mv["angulo"])
    for v in mv["ruta"]:
        pass
    v = mv["ruta"][-1]
    return s.translate(cq.Vector(*v)).translate(cq.Vector(0, -200, 300))   # extraíble: se aparta del todo


def barridos(m, pasos=24):
    car = [p for p in m.piezas if p["movil"] == "cajon_componentes"]
    paj = [p for p in m.piezas if p["movil"] == "cajon_pajitas"]
    tap = [p for p in m.piezas if p["movil"] == "tapa"]
    fij = [p for p in m.piezas if p["movil"] in (None, "")]
    tint = [p for p in m.piezas if p["movil"] == "tapa_interior"]      # se quita antes de sacar el cajón
    tap_ab = [dict(p, solido=tapa_abierta(m, p)) for p in tap]
    out = {}
    # 1) tapa abriéndose: comprobar la posición final contra todo lo fijo y el cajón en su sitio
    out["tapa_abierta"] = comprobar.choques(tap_ab + fij + car + tint, umbral=0.05,
                                            ignorar=lambda a, b: comprobar.buscado(a, b) or (a in fij + car + tint and b in fij + car + tint))
    # 1b) recorrido de la tapa (sin la cerradura: antes de abrir se gira la llave y la leva baja)
    mv = m.movil["tapa"]
    tap_sc = [p for p in tap if "Cerradura" not in p["nombre"]]
    rec = []
    for k in range(1, pasos + 1):
        f = k / pasos
        for p in tap_sc:
            if mv["tipo"] == "giro":
                (o, d) = mv["eje"]
                s = p["solido"].rotate(cq.Vector(*o), cq.Vector(o[0] + d[0], o[1] + d[1], o[2] + d[2]), mv["angulo"] * f)
            else:
                ruta = [(0, 0, 0)] + list(mv["ruta"])
                t = f * (len(ruta) - 1); i = min(int(t), len(ruta) - 2); u = t - i
                v = [ruta[i][j] + (ruta[i + 1][j] - ruta[i][j]) * u for j in range(3)]
                s = p["solido"].translate(cq.Vector(*v))
            bs = s.BoundingBox()
            for q in fij + car + tint:
                if comprobar.buscado(p, q) or not comprobar.bbox_overlap(bs, q["solido"].BoundingBox(), 0.01):
                    continue
                vol = s.intersect(q["solido"]).Volume()
                if vol > 0.05:
                    rec.append((round(f * 100), p["id"], p["nombre"], q["id"], q["nombre"], round(vol, 2)))
    out["tapa_recorrido"] = rec
    # 2) cajón de componentes subiendo con la tapa abierta (el puente de tierra y el coaxial ya desconectados)
    t0 = time.time()
    out["cajon_sube"] = comprobar.barrido(car, fij + paj + tap_ab, (0, 0, m.movil["cajon_componentes"]["recorrido"]), pasos)
    t1 = time.time()
    # 3) cajón de pajitas saliendo a la izquierda (todo lo demás en su sitio, tapa cerrada)
    out["pajitas_izq"] = comprobar.barrido(paj, fij + car + tap, (-m.movil["cajon_pajitas"]["recorrido"], 0, 0), pasos)
    # 4) tapa interior saliendo por la ranura del lateral derecho (tapa abierta, cajón en su sitio)
    out["tapa_interior_sale"] = comprobar.barrido(tint, fij + car + paj + tap_ab, (m.cotas["W"] + 10, 0, 0), pasos * 4)
    # 5) con la tapa cerrada el faldón derecho la frena: moverla 2 mm hacia fuera TIENE que chocar con la tapa
    frena = comprobar.barrido(tint, tap, (2.0, 0, 0), 1)
    out["tapa_interior_suelta_con_tapa_cerrada"] = [] if frena else [(100, "-", "Tapa interior", "-", "nada la frena con la tapa cerrada", 0)]
    print("tiempos", round(t1 - t0, 1), round(time.time() - t1, 1))
    return out


if __name__ == "__main__":
    spec = getattr(specs, "SPEC_" + sys.argv[1])
    m = diseno.construir(spec)
    r = barridos(m, int(sys.argv[2]) if len(sys.argv) > 2 else 24)
    for k, v in r.items():
        # resumir: pares únicos con el peor volumen y el primer % en que aparece
        res = {}
        for x in v:
            if k == "tapa_abierta":
                key = (x[0], x[1], x[2], x[3]); res[key] = max(res.get(key, (0, 0))[0], x[4]), 0
            else:
                key = (x[1], x[2], x[3], x[4])
                vol, f0 = res.get(key, (0, 999))
                res[key] = (max(vol, x[5]), min(f0, x[0]))
        print(f"== {k}: {len(res)} pares")
        for key, (vol, f0) in sorted(res.items(), key=lambda t: -t[1][0]):
            print("  ", key, "vol", vol, "desde", f0, "%")
