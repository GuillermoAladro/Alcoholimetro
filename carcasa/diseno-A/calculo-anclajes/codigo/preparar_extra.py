"""preparar_extra.py — datos auxiliares del informe y CSV del ganador.
Uso: python preparar_extra.py resultados_analisis.json seleccion.json extra.json patron_ganador.csv"""
import csv
import json
import sys

from evaluacion import F_REC, M_ACERO, M_PC

A = json.load(open(sys.argv[1]))
S = json.load(open(sys.argv[2]))
orden = list(A.keys())
G = A[orden[-1]]
for k, v in S["lam_rap_ref"].items():
    A[k]["lam_rapido"] = v
json.dump(A, open(sys.argv[1], "w"), ensure_ascii=False)

masas = [("Chapa DC01: 24 piezas de 3 mm (10,67 kg) y 5 de 1,5 mm (1,85 kg)", 12.522, "Lista_de_piezas.xlsx del 04-11-2026 (dato del repositorio)"),
         ("Policarbonatos (4 piezas)", 0.571, "Lista_de_piezas.xlsx (dato del repositorio)"),
         ("Pantalla 7\", SumUp Solo, Pi 3B+, cámara, módem 4G, fuente LRS-50-5, sensor ZE29A", 0.875,
          "Estimación por componente: 0,30 + 0,20 + 0,05 + 0,005 + 0,04 + 0,18 + 0,10"),
         ("Toma C14, WAGO, fusibles, bornes, antena, tubos y latón", 0.19, "Estimación"),
         ("Cableado (HDMI, USB, manguera 3G1,5, 2×0,75)", 0.25, "Estimación"),
         ("Herrajes: bisagra, 2 candados ABUS 65/30, cerradura, silentblocks, topes, tornillería", 0.48, "Estimación"),
         ("Pintura en polvo", 0.13, "Calculado: ≈ 1,25 m² × 70 µm × 1,5 g/cm³"),
         ("Pajitas y consumibles en el cajón", 0.50, "Hipótesis")]
notas = {"Hormigón ≥ C20/25": "c<sub>min</sub> = 50 mm a cantos de la pared",
         "Ladrillo perforado vertical ≥ HLz 12": "También Doppio UNI 19. Taladrar sin percusión",
         "Bloque hueco de hormigón ligero (enlucido)": "Sepa Parpaing; carga determinada en pared enlucida",
         "Ladrillo hueco horizontal (Forato F8)": "Sin valor para 8×65 (para 8×40: 0,10 kN, pared enlucida)",
         "Placa de yeso (pladur)": "La ficha la cita como soporte, pero la tabla de cargas no da valor"}
cv = G["convergencia"]
d = abs(cv[-1]["apoyado"] - cv[-2]["apoyado"]) / cv[-1]["apoyado"] * 100
d2 = abs(cv[-1]["empotrado"] - cv[-2]["empotrado"]) / cv[-1]["empotrado"] * 100
conv_txt = f"del {max(d, d2):.1f} % en el ganador".replace(".", ",")
abs2 = {k: A[k]["perdidas"]["menos_2"]["peor"] for k in orden}
if max(abs2, key=abs2.get) == orden[-1]:
    rob = "también el que más capacidad absoluta conserva si fallan los 2 tornillos peores"
else:
    rob = f"aunque sin los 2 tornillos peores conserva menos que {max(abs2, key=abs2.get)} en valor absoluto"
def dc(v, d=1):
    return f"{v:.{d}f}".replace(".", ",")


# textos que dependen de los resultados (así el informe no lleva cifras escritas a mano)
nG, refs = orden[-1], orden[:3]
sel_ratio = S["ganador"]["lam_fino"] / S["alternativa"]["lam_fino"]
gob_tr = [k.split(" ")[0] for k in refs if A[k]["gob"] == "Tirón normal 500 N TR"]
gob_txt = (f"Por eso el tirón en la esquina superior <b>derecha</b> gobierna en {', '.join(gob_tr[:-1]) + ' y ' + gob_tr[-1] if len(gob_tr) > 1 else gob_tr[0]}"
           if gob_tr else "El caso que gobierna cambia según el patrón")
gob_txt += f"; en el ganador gobierna «{A[nG]['gob']}»." if A[nG]["gob"] != "Tirón normal 500 N TR" else "; también en el ganador."
fl_G, fl_C = A[nG]["chapa_TR"]["F_fluencia_140"], A[refs[0]]["chapa_TR"]["F_fluencia_140"]
adm_G = A[nG]["admisibles"]["Hormigón ≥ C20/25"]["Tirón normal TR"]
if fl_G < adm_G:
    fN = lambda v: f"{v:,.0f}".replace(",", ".")
    chapa_txt = (f"En hormigón la chapa de 3 mm todavía se deforma de forma permanente junto a las arandelas superiores antes de que "
                 f"mande el taco: a ≈ {fN(fl_G)} N de tirón en la esquina con el ganador ({fN(fl_C)} N con C), frente a {fN(adm_G)} N que "
                 f"admitirían los tacos. Con 2 mm pasaba a ≈ 900 N con el P18-O. Se arregla con una pletina local, no moviendo tornillos (§6).")
else:
    chapa_txt = (f"Con 3 mm la chapa ya no limita en hormigón: su primera plastificación local llega a ≈ {fl_G:.0f} N de tirón en la "
                 f"esquina con el ganador, por encima de los {adm_G:.0f} N que admiten los tacos (con 2 mm, ≈ 900 N con el P18-O).")
rat = [A[k]["tiron300"][e]["FEM"] / A[k]["tiron300"][e]["rigido"] for k in orden for e in ("TL", "TR")]
fem_rig_txt = (f"La tracción máxima del FEM es entre {dc(min(rat))} y {dc(max(rat))} veces la del modelo rígido (con 2 mm, entre 1,4 y 3): "
               f"incluso con 3 mm la chapa no se comporta como rígida.")
sv = []
for i in range(len(A[nG]["sensibilidad"])):
    otros = max(A[k]["sensibilidad"][i]["lam"] for k in refs)
    sv.append(A[nG]["sensibilidad"][i]["lam"] / otros)
sens_txt = (f"<b>el ganador es el mejor en todas las variantes</b>, con entre {dc(min(sv))} y {dc(max(sv))} veces la λ del mejor de los otros tres."
            if min(sv) > 1 else f"el ganador no es el mejor en todas las variantes (cociente mínimo {dc(min(sv), 2)}).")
extra = dict(m_acero=M_ACERO, m_pc=M_PC, m_est=sum(m for _, m, _ in masas), masas=masas,
             frec=list(F_REC.items()), frec_notas=notas, iters2=4000, conv_txt=conv_txt, robustez_txt=rob,
             sel_ratio=sel_ratio, gob_txt=gob_txt, chapa_txt=chapa_txt, fem_rig_txt=fem_rig_txt, sens_txt=sens_txt)
import os
if os.path.exists("juntas_ajuste.json"):
    extra["juntas_ajuste"] = json.load(open("juntas_ajuste.json"))
if os.path.exists("variantes.json"):
    extra["variantes"] = json.load(open("variantes.json"))
json.dump(extra, open(sys.argv[3], "w"), ensure_ascii=False)

with open(sys.argv[4], "w", newline="") as f:
    w = csv.writer(f, delimiter=";")
    w.writerow(["n", "x_mm_desde_eje", "z_mm_desde_base", "x_mm_desde_canto_izquierdo", "zona", "diametro_agujero_mm"])
    pts = sorted(G["pts"], key=lambda p: (-p[1], p[0]))
    for i, (x, z) in enumerate(pts):
        zona = "Z3" if z > 420 else ("Z2" if z > 170 else "Z1")
        w.writerow([i + 1, f"{x:.1f}".replace(".", ","), f"{z:.1f}".replace(".", ","), f"{x + 110:.1f}".replace(".", ","), zona, "6,5"])
print("ok", conv_txt, rob)
