"""Exporta los 3 diseños: STEP por pieza, conjunto STEP, DXF de chapas, JSON del visor, comprobaciones y datos de la lista de piezas."""
import sys, os, json, time
sys.path.insert(0, "/home/claude/nuevo")
import specs, diseno, exportar, comprobar, barrer

OUT = sys.argv[1]
SP = "/tmp/claude-0/-home-claude/659a7a58-c69d-5ef4-bd94-d0aa972c769f/scratchpad/"
res = {}
for L in sys.argv[2:]:
    t0 = time.time()
    spec = getattr(specs, "SPEC_" + L)
    m = diseno.construir(spec)
    carpeta = os.path.join(OUT, f"CAD_{L}_{spec['nombre']}")
    fab = exportar.exportar_cad(m, carpeta, diseno.COMPRAS)
    comp = {}
    for p in m.piezas:
        if p["tipo"] != "comprada":
            continue
        r = comp.setdefault(p["ref"], dict(ref=p["ref"], ids=[], uds=0, electrico=p["electrico"]))
        r["ids"].append(p["id"]); r["uds"] += p.get("uds", 1)
    for r in comp.values():
        n, asin, precio = diseno.COMPRAS[r["ref"]]
        r.update(nombre=n, asin=asin, precio=precio)
    ch = comprobar.choques(m.piezas)
    zl = comprobar.zonas_libres(m)
    br = barrer.barridos(m, 24)
    json.dump(exportar.a_json(m, diseno.COMPRAS), open(SP + f"{L}.json", "w"), separators=(",", ":"), ensure_ascii=False)
    res[L] = dict(nombre=spec["nombre"], descripcion=spec["descripcion"], tapa=spec["tapa"], bisagra=spec.get("bisagra"),
                  cotas={k: v for k, v in m.cotas.items() if isinstance(v, (int, float, str, tuple, list))},
                  fabricadas=fab, compras=sorted(comp.values(), key=lambda r: r["ref"]),
                  choques=len(ch), zonas=len(zl), barridos={k: len(v) for k, v in br.items()},
                  n_piezas=len(m.piezas), n_cables=len(m.cables), cables=[c["nombre"] for c in m.cables])
    print(L, "fab", len(fab), "compras", len(comp), "choques", len(ch), "zonas", len(zl), {k: len(v) for k, v in br.items()}, round(time.time() - t0, 1), "s")
json.dump(res, open(os.path.join(SP, "export_res.json"), "w"), ensure_ascii=False, indent=1, default=list)
