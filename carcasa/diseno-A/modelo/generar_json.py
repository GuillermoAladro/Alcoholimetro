"""Construye los diseños pedidos y guarda el JSON de mallas para el visor."""
import sys, json, time
sys.path.insert(0, "/home/claude/nuevo")
import specs, diseno, exportar
SP = "/tmp/claude-0/-home-claude/659a7a58-c69d-5ef4-bd94-d0aa972c769f/scratchpad/"
for L in sys.argv[1:]:
    t = time.time()
    m = diseno.construir(getattr(specs, "SPEC_" + L))
    d = exportar.a_json(m, diseno.COMPRAS)
    json.dump(d, open(SP + f"{L}.json", "w"), separators=(",", ":"), ensure_ascii=False)
    print(L, len(m.piezas), "piezas", round(time.time() - t, 1), "s")
