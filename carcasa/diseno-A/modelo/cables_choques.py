"""Busca cables y tubos que atraviesan piezas: muestrea la curva de cada cable (Catmull-Rom centrípeta, como el visor)
y prueba el eje y 6 puntos a la distancia del radio contra cada sólido. Ignora los primeros y últimos mm (bocas)."""
import sys, math
sys.path.insert(0, "/home/claude/nuevo")
import cadquery as cq
import specs, diseno

def cr(pts, n=12, alpha=0.5):
    P = [cq.Vector(*p) for p in pts]
    if len(P) < 2: return P
    P = [P[0] + (P[0] - P[1])] + P + [P[-1] + (P[-1] - P[-2])]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        def tj(ti, a, b): return ti + max(1e-6, (b - a).Length) ** alpha
        t0 = 0; t1 = tj(t0, p0, p1); t2 = tj(t1, p1, p2); t3 = tj(t2, p2, p3)
        for k in range(n):
            t = t1 + (t2 - t1) * k / n
            A1 = p0 * ((t1 - t) / (t1 - t0)) + p1 * ((t - t0) / (t1 - t0))
            A2 = p1 * ((t2 - t) / (t2 - t1)) + p2 * ((t - t1) / (t2 - t1))
            A3 = p2 * ((t3 - t) / (t3 - t2)) + p3 * ((t - t2) / (t3 - t2))
            B1 = A1 * ((t2 - t) / (t2 - t0)) + A2 * ((t - t0) / (t2 - t0))
            B2 = A2 * ((t3 - t) / (t3 - t1)) + A3 * ((t - t1) / (t3 - t1))
            out.append(B1 * ((t2 - t) / (t2 - t1)) + B2 * ((t - t1) / (t2 - t1)))
    out.append(P[-2])
    return out

m = diseno.construir(specs.SPEC_A)
piezas = [(p, p["solido"], p["solido"].BoundingBox()) for p in m.piezas]
margen = float(sys.argv[1]) if len(sys.argv) > 1 else 0.6
total = 0
for c in m.cables:
    pts = cr(c["puntos"], 14)
    L = 0; acum = [0]
    for a, b in zip(pts, pts[1:]): L += (b - a).Length; acum.append(L)
    r = c["radio"] * margen
    hits = {}
    for i, p in enumerate(pts):
        if acum[i] < 7 or L - acum[i] < 7: continue
        t = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)])
        if t.Length < 1e-6: continue
        t = t.normalized()
        a = cq.Vector(1, 0, 0) if abs(t.x) < 0.9 else cq.Vector(0, 1, 0)
        u = t.cross(a).normalized(); v = t.cross(u).normalized()
        cand = [p] + [p + (u * math.cos(k * math.pi / 3) + v * math.sin(k * math.pi / 3)) * r for k in range(6)]
        for pz, s, bb in piezas:
            if not (bb.xmin - 6 < p.x < bb.xmax + 6 and bb.ymin - 6 < p.y < bb.ymax + 6 and bb.zmin - 6 < p.z < bb.zmax + 6): continue
            if c["movil"] == "cajon_componentes" and pz["movil"] not in ("cajon_componentes",) and c["tipo"] != "puente":
                pass
            for q in cand:
                if s.isInside(q, 0.01):
                    hits.setdefault(pz["id"] + " " + pz["nombre"], []).append(round(acum[i]))
                    break
    if hits:
        total += 1
        print(f"· {c['nombre']}  (L={L:.0f} mm)")
        for k, v in hits.items(): print(f"     {k}: a {v[0]}–{v[-1]} mm ({len(v)} muestras)")
print("CABLES CON CHOQUE", total, "de", len(m.cables))
