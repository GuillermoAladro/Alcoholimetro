"""
aplicar_cad.py — Comprueba el patrón de taladros en el CAD y regenera los archivos de la trasera.

El patrón se cambia A MANO en carcasa/diseno-A/modelo/diseno.py (FIJACIONES_PARED). Este script:

    python anclaje/aplicar_cad.py --comprobar
        1. El patrón del CAD es el mismo que el del estudio (anclaje/coordenadas.csv).
        2. Todos los agujeros caen en zona permitida y distan ≥ 50 mm.
        3. Choques entre las piezas del modelo con las 18 cabezas de tirafondo y sus arandelas añadidas
           (en el 3D solo están los agujeros), zonas que deben quedar libres y barridos de la tapa, la tapa
           interior y los dos cajones.
        4. Ningún cable pasa por donde hay una cabeza de tirafondo.

    python anclaje/aplicar_cad.py --regenerar SALIDA
        Vuelve a generar en SALIDA los archivos que dependen de la trasera (DXF y STEP de A-C02, conjuntos,
        planos en PDF, listas y STEP de FreeCAD) con los scripts del propio CAD, y dice cuáles copiar al repo.

Necesita CadQuery, ezdxf, openpyxl y matplotlib (como el resto del CAD).
"""
import csv
import math
import os
import shutil
import subprocess
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(AQUI, ".."))
MODELO = os.path.join(REPO, "carcasa", "diseno-A", "modelo")
sys.path.insert(0, MODELO)
sys.path.insert(0, os.path.join(REPO, "carcasa", "diseno-A", "calculo-anclajes", "codigo"))

H_CABEZA, T_ARANDELA, D_ARANDELA, ENTRECARAS = 4.0, 1.6, 18.0, 10.0      # tirafondo DIN 571 Ø6 y arandela DIN 9021 M6


def patron_estudio():
    with open(os.path.join(AQUI, "coordenadas.csv"), encoding="utf-8") as f:
        filas = list(csv.DictReader(f, delimiter=";"))
    return sorted((float(r["x_cad_mm"].replace(",", ".")), float(r["z_cad_mm"].replace(",", "."))) for r in filas)


def cabezas(m, diseno, cq):
    """Sólidos de la arandela y la cabeza hexagonal de cada tirafondo, por dentro de la trasera."""
    from comp import cyl
    y0 = m.cotas["D"] - diseno.T                               # cara interior de la trasera
    piezas = []
    for k, (x, z) in enumerate(m.cotas["fijaciones_pared"]):
        ar = cyl(D_ARANDELA / 2, T_ARANDELA, (x, y0 - T_ARANDELA, z), (0, 1, 0))
        cab = cq.Workplane("XZ", origin=(x, y0 - T_ARANDELA, z)).polygon(6, ENTRECARAS / math.cos(math.radians(30))).extrude(H_CABEZA).val()
        s = ar.fuse(cab).clean()
        piezas.append(dict(id=f"A-H14.{k + 1}", ref="H14", nombre=f"Tirafondo de pared {k + 1} (cabeza y arandela)", grupo="H", tipo="comprada",
                           solido=s, subs=[("cabeza", s, (0.6, 0.6, 0.6))], color=(0.6, 0.6, 0.6), movil=None, electrico=False, notas="", uds=1, modelo=None))
    return piezas


def comprobar():
    import cadquery as cq
    import specs, diseno, comprobar as CH, barrer
    import nucleo as NU
    ok = True
    m = diseno.construir(specs.SPEC_A)
    cad = sorted((float(x), float(z)) for x, z in m.cotas["fijaciones_pared"])
    est = patron_estudio()
    igual = len(cad) == len(est) and all(abs(a[0] - b[0]) < 1e-6 and abs(a[1] - b[1]) < 1e-6 for a, b in zip(cad, est))
    print(f"1. Patrón del CAD = patrón del estudio: {'SÍ' if igual else 'NO'} ({len(cad)} agujeros)")
    ok &= igual
    fuera = [p for p in cad if not NU.en_zona(*p)]
    dmin = min(math.hypot(a[0] - b[0], a[1] - b[1]) for i, a in enumerate(cad) for b in cad[i + 1:])
    print(f"2. Agujeros fuera de zona permitida: {len(fuera)} {fuera if fuera else ''} · separación mínima {dmin:.1f} mm")
    ok &= not fuera and dmin >= 50.0 - 1e-6
    cab = cabezas(m, diseno, cq)
    base = CH.choques(m.piezas, umbral=0.05)
    m.piezas += cab
    ch = CH.choques(m.piezas, umbral=0.05, ignorar=lambda a, b: CH.buscado(a, b) or (a in cab and b in cab))
    nuevos = [c for c in ch if c not in base]
    print(f"3. Choques sin cabezas: {len(base)} · con las 18 cabezas y arandelas: {len(ch)}")
    for c in nuevos:
        print("     ", c)
    zl = CH.zonas_libres(m)
    print(f"   Zonas que deben quedar libres ocupadas: {len(zl)}")
    br = barrer.barridos(m, 24)
    for k, v in br.items():
        con_cab = [x for x in v if any("Tirafondo de pared" in str(t) for t in x)]
        print(f"   Barrido «{k}»: {len(v)} roces ({len(con_cab)} con tirafondos)")
        for x in con_cab[:6]:
            print("     ", x)
    ok &= not ch and not zl and not any(br.values())
    # holguras de las cabezas con los cajones (dato para el informe)
    y_cab = m.cotas["D"] - diseno.T - T_ARANDELA - H_CABEZA
    dr = diseno.cajon_pajitas_medidas(m.cotas["W"], m.cotas["D"])
    print(f"   Holgura cabeza–cajón de pajitas: {y_cab - dr['y_back']:.1f} mm · cabeza–cajón de componentes: {y_cab - m.cotas['Ky1']:.1f} mm")
    # cables contra cabezas
    toca = []
    for c in m.cables:
        P = c["puntos"]
        for a, b in zip(P, P[1:]):
            for t in [i / 8 for i in range(9)]:
                q = [a[i] + (b[i] - a[i]) * t for i in range(3)]
                for k, (x, z) in enumerate(m.cotas["fijaciones_pared"]):
                    if q[1] > y_cab - c["radio"] and math.hypot(q[0] - x, q[2] - z) < D_ARANDELA / 2 + c["radio"]:
                        toca.append((c["nombre"], k + 1))
    toca = sorted(set(toca))
    print(f"4. Cables que pasan por una cabeza de tirafondo: {len(toca)} {toca if toca else ''}")
    ok &= not toca
    print("RESULTADO:", "TODO BIEN" if ok else "HAY QUE REVISAR")
    return ok


SCRATCH = "/tmp/claude-0/-home-claude/659a7a58-c69d-5ef4-bd94-d0aa972c769f/scratchpad/"   # ruta fija que usan los scripts del CAD


def regenerar(salida):
    os.makedirs(salida, exist_ok=True)
    os.makedirs(SCRATCH, exist_ok=True)

    def run(*args):
        print("·", " ".join(args), flush=True)
        r = subprocess.run([sys.executable, *args], cwd=MODELO, capture_output=True, text=True)
        print("   " + "\n   ".join((r.stdout + r.stderr).strip().splitlines()[-6:]))
        if r.returncode:
            raise SystemExit("falló " + args[0])
    run("exportar_todo.py", salida, "A")                        # CAD_A_Compacta + datos del visor + comprobaciones
    run("planos_chapa.py", os.path.join(salida, "Carcasa_plegada"))
    run("exportar_freecad.py", os.path.join(salida, "Alcoholimetro_A_completo.step"))
    run("hacer_bom.py", os.path.join(salida, "Lista_de_piezas.xlsx"))
    print("Hecho. Copiar al repo (carcasa/diseno-A/):")
    for origen, destino in copias(salida):
        print(f"   {os.path.relpath(origen, salida)}  ->  {os.path.relpath(destino, REPO)}")


def copias(salida):
    """Solo lo que depende de la trasera (los demás DXF y STEP no cambian)."""
    dA = os.path.join(REPO, "carcasa", "diseno-A")
    pl = os.path.join(salida, "Carcasa_plegada")
    c02 = "A-C02_Cuerpo_trasera_laterales_y_suelo"
    return [
        (os.path.join(salida, "CAD_A_Compacta", "DXF_corte", "A-C02.dxf"), os.path.join(dA, "CAD_A_Compacta", "DXF_corte", "A-C02.dxf")),
        (os.path.join(salida, "CAD_A_Compacta", "STEP_piezas", "A-C02.step"), os.path.join(dA, "CAD_A_Compacta", "STEP_piezas", "A-C02.step")),
        (os.path.join(salida, "CAD_A_Compacta", "Conjunto_A.step"), os.path.join(dA, "CAD_A_Compacta", "Conjunto_A.step")),
        (os.path.join(pl, "DXF_desarrollos", c02 + ".dxf"), os.path.join(dA, "presupuesto", "Carcasa_plegada", "DXF_desarrollos", c02 + ".dxf")),
        (os.path.join(pl, "STEP_piezas", c02 + ".step"), os.path.join(dA, "presupuesto", "Carcasa_plegada", "STEP_piezas", c02 + ".step")),
        (os.path.join(pl, "Planos_chapa_plegada.pdf"), os.path.join(dA, "presupuesto", "Carcasa_plegada", "Planos_chapa_plegada.pdf")),
        (os.path.join(pl, "Conjunto_A.step"), os.path.join(dA, "presupuesto", "Carcasa_plegada", "Conjunto_A.step")),
        (os.path.join(pl, "Lista_piezas_chapa.xlsx"), os.path.join(dA, "presupuesto", "Carcasa_plegada", "Lista_piezas_chapa.xlsx")),
        (os.path.join(salida, "Alcoholimetro_A_completo.step"), os.path.join(dA, "FreeCAD", "Alcoholimetro_A_completo.step")),
        (os.path.join(salida, "Lista_de_piezas.xlsx"), os.path.join(dA, "Lista_de_piezas.xlsx")),
    ]


if __name__ == "__main__":
    if "--comprobar" in sys.argv:
        sys.exit(0 if comprobar() else 1)
    if "--regenerar" in sys.argv:
        salida = os.path.abspath(sys.argv[sys.argv.index("--regenerar") + 1])
        regenerar(salida)
        if "--copiar" in sys.argv:
            for origen, destino in copias(salida):
                shutil.copyfile(origen, destino)
            print("Copiado.")
        sys.exit(0)
    print(__doc__)
