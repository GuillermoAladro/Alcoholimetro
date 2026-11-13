import sys, time
sys.path.insert(0, "/home/claude/nuevo")
import specs, diseno, comprobar
spec = getattr(specs, "SPEC_" + sys.argv[1])
t0 = time.time()
m = diseno.construir(spec)
print("piezas", len(m.piezas), "cables", len(m.cables), "tiempo", round(time.time() - t0, 1), "s")
print({k: (round(v, 1) if isinstance(v, float) else v) for k, v in m.cotas.items() if k in ("W", "D", "H", "Hp", "Hw", "Ktop", "Yin")})
# choques: se ignoran pares que se tocan a propósito (espárrago-pletina, etc.) solo si el volumen es mínimo
ch = comprobar.choques(m.piezas, umbral=0.05)
print("CHOQUES", len(ch))
for c in ch: print("  ", c)
zl = comprobar.zonas_libres(m)
print("ZONAS", len(zl))
for z in zl: print("  ", z)
