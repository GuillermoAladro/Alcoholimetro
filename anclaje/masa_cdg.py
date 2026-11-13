"""
masa_cdg.py — Masa y centro de gravedad de la máquina, sacados del CAD paramétrico y de la lista de componentes.

Uso (desde la raíz del repositorio; necesita CadQuery, como el resto del CAD):
    python anclaje/masa_cdg.py            -> escribe anclaje/resultados/masa_cdg.json y lo imprime

Cómo se calcula:
  - Piezas fabricadas (chapa y policarbonato): volumen del sólido del CAD × densidad. Centro = centro del sólido.  [cálculo]
  - Piezas compradas: la masa NO sale del volumen (el sólido es un bulto); se toma de la tabla MASAS de abajo,
    con su origen (hoja de datos o estimación). El centro sí es el del sólido colocado en el CAD.            [hoja / estimación]
  - Lo que el CAD no dibuja como sólido (cables, pintura, pajitas, tornillería suelta) va en EXTRAS, con una
    posición razonada.                                                                                          [estimación]

Ejes del CAD: X ancho (+ derecha mirando la máquina de frente), Y fondo (0 = cara exterior del panel frontal,
100 = cara de la trasera que toca la pared), Z alto desde la base. La distancia a la pared es n = 100 − Y.
"""
import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, "..", "carcasa", "diseno-A", "modelo"))

RHO_ACERO = 7.85e-6      # kg/mm³  [dato de material]
RHO_PC = 1.20e-6         # kg/mm³  policarbonato compacto [dato de material]

# masa de cada pieza comprada, en kg POR UNIDAD DIBUJADA (clave = referencia de la lista de compra).
# origen: "hoja" = hoja de datos o ficha del fabricante; "est" = estimación mía por tamaño y material.
MASAS = {
    "E01": (0.300, "est", "Pantalla 7\" con su placa: 0,25–0,35 kg en pantallas de este tipo; el anuncio no da el peso"),
    "E02": (0.170, "est", "SumUp Solo: unos 170 g (recuerdo de la ficha de SumUp; a pesar al recibirlo)"),
    "E03": (0.004, "hoja", "Camera Module 3: 4 g"),
    "E04": (0.050, "est", "Raspberry Pi 3B+: unos 50 g"),
    "E05": (0.040, "est", "Módem E3372h: menos de 50 g"),
    "E06": (0.180, "hoja", "Mean Well LRS-50-5: 0,18 kg (hoja LRS-50-SPEC)"),
    "E07": (0.025, "est", "Toma C14 con portafusibles"),
    "E08": (0.005, "est", "WAGO 221"),
    "E09": (0.010, "est", "Borne USB-A a tornillo"),
    "E10": (0.008, "est", "Portafusibles en línea"),
    "E11": (0.080, "est", "Sensor ZE29A con su bomba; el manual no da el peso"),
    "E12": (0.003, "est", "Antena plana"),
    "E14": (0.003, "est", "T de plástico"),
    "E15": (0.015, "est", "Reductor de latón"),
    "E16": (0.020, "est", "Media clavija de un cable HDMI (el cable va en EXTRAS)"),
    "E17": (0.008, "est", "Clavija USB (el cable va en EXTRAS)"),
    "E18": (0.004, "est", "Clavija micro-USB"),
    "E19": (0.002, "est", "Clavija XH"),
    "H01": (0.005, "est", "Silentblock M4"),
    "H02": (0.0003, "est", "Tope de goma"),
    "H03": (0.060, "est", "Cerradura de leva de zamak"),
    "H04": (0.060, "est", "Media bisagra de piano inox de 30 cm (0,12 kg entera)"),
    "H06": (0.002, "est", "Espárrago M4"),
    "H07": (0.003, "est", "Espárrago M4"),
    "H09": (0.0005, "est", "Separador de nailon"),
    "H10": (0.001, "est", "Pasacables de goma"),
    "H12": (0.001, "est", "Tuerca M4"),
    "H17": (0.002, "est", "Tornillo M4 × 16"),
    "H18": (0.110, "est", "Candado ABUS 65/30 de latón: unos 0,11 kg"),
}

# lo que no es un sólido del CAD: (nombre, masa kg, (x, y, z) en ejes del CAD, origen)
EXTRAS = [
    ("Cables (HDMI, 2 USB, red de 230 V, 5 V, tierra) y tubos del soplido", 0.300, (0.0, 55.0, 280.0), "est"),
    ("Pintura en polvo (≈ 1,2 m² de chapa por las dos caras, 80 µm)", 0.150, (0.0, 55.0, 210.0), "est"),
    ("Cajón de pajitas lleno (pajitas de papel, ≈ 1,7 L a 0,18 kg/L)", 0.300, (0.0, 54.0, 78.0), "est"),
    ("Cabezas de los 18 tirafondos y sus arandelas (lo que queda dentro de la caja)", 0.060, (0.0, 96.0, 250.0), "est"),
    ("Tornillería suelta, bridas, fijador, placa de bornes y 2 ventiladores del bloque 1", 0.200, (0.0, 55.0, 260.0), "est"),
]

D_FONDO = 100.0


def calcular():
    import specs
    import diseno
    m = diseno.construir(specs.SPEC_A)
    filas = []
    for p in m.piezas:
        s = p["solido"]
        c = s.Center()
        if p["tipo"] == "fabricada":
            rho = RHO_ACERO if "Acero" in p["material"] else RHO_PC
            masa, origen, grupo = s.Volume() * rho, "cálculo (volumen CAD × densidad)", ("acero" if "Acero" in p["material"] else "policarbonato")
        else:
            masa, o, _ = MASAS[p["ref"]]
            origen, grupo = ("hoja de datos" if o == "hoja" else "estimación"), "compras"
        filas.append(dict(id=p["id"], nombre=p["nombre"], grupo=grupo, masa=masa, x=c.x, y=c.y, z=c.z, origen=origen))
    for nombre, masa, (x, y, z), o in EXTRAS:
        filas.append(dict(id="extra", nombre=nombre, grupo="extras", masa=masa, x=x, y=y, z=z, origen="estimación"))

    def resumen(fs):
        M = sum(f["masa"] for f in fs)
        return dict(masa=M, x=sum(f["masa"] * f["x"] for f in fs) / M, y=sum(f["masa"] * f["y"] for f in fs) / M,
                    z=sum(f["masa"] * f["z"] for f in fs) / M)
    grupos = {g: resumen([f for f in filas if f["grupo"] == g]) for g in ("acero", "policarbonato", "compras", "extras")}
    tot = resumen(filas)
    tot["n_pared"] = D_FONDO - tot["y"]
    for g in grupos.values():
        g["n_pared"] = D_FONDO - g["y"]
    cotas = {k: m.cotas[k] for k in ("W", "D", "H", "Hw", "Hp", "Ktop", "Kz0", "tapa_interior_z", "pe_carcasa", "fijaciones_pared")}
    return dict(total=tot, grupos=grupos, cotas=cotas, n_piezas=len(m.piezas),
                filas=sorted(filas, key=lambda f: -f["masa"]))


if __name__ == "__main__":
    r = calcular()
    os.makedirs(os.path.join(AQUI, "resultados"), exist_ok=True)
    json.dump(r, open(os.path.join(AQUI, "resultados", "masa_cdg.json"), "w"), ensure_ascii=False, indent=1, default=list)
    t = r["total"]
    print(f"Masa total {t['masa']:.2f} kg · centro de gravedad x = {t['x']:.1f}, z = {t['z']:.1f}, a {t['n_pared']:.1f} mm de la pared")
    for g, v in r["grupos"].items():
        print(f"  {g:14s} {v['masa']:6.2f} kg   x = {v['x']:6.1f}  z = {v['z']:6.1f}  n = {v['n_pared']:5.1f}")
    print("Las 12 piezas que más pesan:")
    for f in r["filas"][:12]:
        print(f"  {f['masa']:6.3f} kg  {f['nombre'][:60]:60s} [{f['origen']}]")
