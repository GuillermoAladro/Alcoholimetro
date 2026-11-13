"""
informe.py — genera el informe técnico en PDF.
Uso: python informe.py resultados_analisis.json resultados_opt.json CARPETA_FIGURAS salida.pdf
"""
import json
import sys
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (Image, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table,
                                TableStyle)

pdfmetrics.registerFont(TTFont("DV", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DVB", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("DVI", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf"))
pdfmetrics.registerFontFamily("DV", normal="DV", bold="DVB", italic="DVI", boldItalic="DVB")

TINTA, TINTA2, LINEA, FONDO = colors.HexColor("#0b0b0b"), colors.HexColor("#52514e"), colors.HexColor("#d9d8d3"), colors.HexColor("#f4f3f0")
ACENTO = colors.HexColor("#2a78d6")
st = dict(
    h1=ParagraphStyle("h1", fontName="DVB", fontSize=13.5, leading=17, spaceBefore=10, spaceAfter=5, textColor=TINTA, keepWithNext=1),
    h2=ParagraphStyle("h2", fontName="DVB", fontSize=10.5, leading=13.5, spaceBefore=8, spaceAfter=3, textColor=TINTA, keepWithNext=1),
    p=ParagraphStyle("p", fontName="DV", fontSize=8.6, leading=12.2, spaceAfter=4, textColor=TINTA, alignment=TA_LEFT),
    pc=ParagraphStyle("pc", fontName="DV", fontSize=7.4, leading=9.6, spaceAfter=6, textColor=TINTA2),
    li=ParagraphStyle("li", fontName="DV", fontSize=8.6, leading=12, leftIndent=10, bulletIndent=2, spaceAfter=2, textColor=TINTA),
    t=ParagraphStyle("t", fontName="DV", fontSize=7.2, leading=8.9, textColor=TINTA),
    tb=ParagraphStyle("tb", fontName="DVB", fontSize=7.2, leading=8.9, textColor=TINTA),
    tit=ParagraphStyle("tit", fontName="DVB", fontSize=17, leading=21, spaceAfter=4, textColor=TINTA),
    sub=ParagraphStyle("sub", fontName="DV", fontSize=9.5, leading=13, spaceAfter=8, textColor=TINTA2),
    caja=ParagraphStyle("caja", fontName="DV", fontSize=8.6, leading=12.2, textColor=TINTA),
)


def P(t, s="p"):
    return Paragraph(t, st[s])


def L(items):
    return [Paragraph(t, st["li"], bulletText="•") for t in items]


def tabla(filas, anchos, cab=1, zebra=True):
    data = [[c if not isinstance(c, str) else Paragraph(c, st["tb" if i < cab else "t"]) for c in fila]
            for i, fila in enumerate(filas)]
    t = Table(data, colWidths=[a * mm for a in anchos], repeatRows=cab)
    est = [("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LINEBELOW", (0, cab - 1), (-1, cab - 1), 0.8, TINTA2),
           ("LINEBELOW", (0, cab), (-1, -1), 0.25, LINEA), ("TOPPADDING", (0, 0), (-1, -1), 2.2),
           ("BOTTOMPADDING", (0, 0), (-1, -1), 2.2), ("LEFTPADDING", (0, 0), (-1, -1), 3), ("RIGHTPADDING", (0, 0), (-1, -1), 3)]
    if zebra:
        for i in range(cab, len(filas)):
            if (i - cab) % 2 == 1:
                est.append(("BACKGROUND", (0, i), (-1, i), FONDO))
    t.setStyle(TableStyle(est))
    t.keepWithNext = True      # la tabla no se separa de su pie
    return t


def caja(texto):
    t = Table([[Paragraph(texto, st["caja"])]], colWidths=[174 * mm])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#eef4fc")),
                           ("LINEBEFORE", (0, 0), (0, -1), 2.5, ACENTO), ("LEFTPADDING", (0, 0), (-1, -1), 8),
                           ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
    return t


def fig(carpeta, nombre, ancho=174, pie=None, titulo=None):
    from PIL import Image as PI
    ruta = f"{carpeta}/{nombre}"
    w, h = PI.open(ruta).size
    el = ([P(titulo, "h2")] if titulo else []) + [Image(ruta, width=ancho * mm, height=ancho * mm * h / w)]
    if pie:
        el.append(P(pie, "pc"))
    return KeepTogether(el)


def f0(v):
    return f"{v:,.0f}".replace(",", ".")


def f1(v):
    return f"{v:.1f}".replace(".", ",")


def f2(v):
    return f"{v:.2f}".replace(".", ",")


def pie_pagina(c, d):
    c.saveState()
    c.setFont("DV", 6.8)
    c.setFillColor(TINTA2)
    c.drawString(18 * mm, 10 * mm, "Alcoholímetro · diseño A · optimización del patrón de anclaje a pared")
    c.drawRightString(192 * mm, 10 * mm, f"pág. {d.page}")
    c.restoreState()


def construir(A, O, carpeta, salida, extra):
    orden = list(A.keys())
    nC, nA, nB, nG = orden
    G = A[nG]
    doc = SimpleDocTemplate(salida, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm,
                            bottomMargin=16 * mm, title="Optimización del patrón de anclaje del alcoholímetro",
                            author="Claude (Anthropic) para Guillermo Aladro")
    s = []
    hoy = date.today().strftime("%d/%m/%Y")

    def caso(nom, txt):
        return [o for o in A[nom]["envolvente"] if o["caso"] == txt][0]

    def adm(nom, pared, acc):
        return A[nom]["admisibles"][pared][acc]

    # ------------------------------------------------------------------ portada y resumen
    s += [P("Patrón de anclaje a pared del alcoholímetro", "tit"),
          P(f"Investigación matemática, computacional y estructural · diseño A, rama <i>programa-raspberry</i> · {hoy}", "sub")]
    fil = ", ".join(f"({f1(x)}; {f1(z)})" for x, z in G["pts"])
    s.append(caja(
        f"<b>Recomendación.</b> Fabricar la trasera con el patrón <b>{nG}</b>: {G['n']} agujeros Ø6,5 en las coordenadas de la "
        f"tabla 5 (x desde el eje, z desde la base). En el modelo de elementos finitos (chapa flexible + contacto con la pared, "
        f"envolvente de bordes) su factor de carga frente a la envolvente de diseño es <b>λ = {f2(G['lam'])}</b>, frente a "
        f"<b>{f2(A[nC]['lam'])}</b> del patrón anterior de 3 × 6 (C), {f2(A[nA]['lam'])} del A y {f2(A[nB]['lam'])} del B: "
        f"<b>{f0(100 * (G['lam'] / A[nC]['lam'] - 1))} % más capacidad que el anterior</b> con el mismo número de tornillos, sin tocar la "
        f"electrónica, pestañas, soldaduras ni cajones. La mejora sale de llevar los tornillos junto a las partes rígidas de la caja "
        f"(pliegues laterales, pestaña de la bandeja y canto superior) en vez de repartirlos por el centro de la chapa, que aun con 3 mm "
        f"es flexible y hace palanca contra la pared. Es simétrico, así que se replantea y se comprueba fácil. "
        f"Es el mejor patrón encontrado por una búsqueda heurística reproducible; <b>no está demostrado que sea el óptimo global</b>."))
    s.append(Spacer(1, 6))
    filas = [["", nC, nA, nB, nG]]
    filas.append(["Tornillos / separación mínima (mm)"] + [f"{A[k]['n']} / {f1(A[k]['geometria']['s_min'])}" for k in orden])
    filas.append(["λ envolvente (FEM, hormigón)"] + [f2(A[k]["lam"]) for k in orden])
    filas.append(["Caso que gobierna"] + [A[k]["gob"] for k in orden])
    filas.append(["F máx. tornillo, tirón 300 N esquina sup. dcha. (N)"] + [f0(A[k]["tiron300"]["TR"]["FEM"]) for k in orden])
    filas.append(["Ídem esquina sup. izqda. (N)"] + [f0(A[k]["tiron300"]["TL"]["FEM"]) for k in orden])
    for pared, et in (("Hormigón ≥ C20/25", "Tirón admisible esq. sup. dcha. — hormigón (N)"),
                      ("Ladrillo macizo ≥ Mz 12", "Ídem — ladrillo macizo Mz 12 (N)"),
                      ("Ladrillo perforado vertical ≥ HLz 12", "Ídem — ladrillo perforado HLz 12 (N)")):
        filas.append([et] + [f0(adm(k, pared, "Tirón normal TR")) for k in orden])
    filas.append(["Tirón en esq. sup. dcha. con 1.ª plastificación local de la chapa (Re 140 MPa) (N)"] + [f0(A[k]["chapa_TR"]["F_fluencia_140"]) for k in orden])
    filas.append(["Capacidad que queda sin los 2 tornillos peores"] + [f"{f0(100 * A[k]['perdidas']['menos_2']['peor_rel'])} %" for k in orden])
    s.append(tabla(filas, [58, 29, 29, 29, 29]))
    s.append(P("Tabla 1. Resumen. λ = F<sub>rec</sub> / (fuerza máxima en un tornillo) para el peor caso de la envolvente (tirones de 500 N en "
               "esquinas, centro, base, oblicuos y laterales, y una persona de 80 kg colgada con factor dinámico 2, todo con un peso propio de cálculo de 18 kg). "
               "Los tirones admisibles se calculan con el peso fijo y la carga recomendada de fischer de un taco SX Plus 8×65 (que ya incluye "
               "sus coeficientes de seguridad). No son cargas certificadas del conjunto.", "pc"))
    s.append(P("Lo que cambia respecto al cálculo con chapa de 2 mm (03-11-2026)", "h2"))
    t3c = A[nC]["tiron300"]
    s += L([f"<b>Chapa:</b> la trasera pasa de 2 a 3 mm (rigidez a flexión × 3,4) y el cajón de componentes y la tapa interior, de 2 a 1,5 mm. "
            f"La masa de cálculo sube de 15 a 18 kg (12,5 kg de acero, 15,5 kg estimados con todo).",
            "<b>Geometría:</b> las guías traseras ya no son angulares sino pletinas planas de 12 mm en x = ±70, y el apoyo trasero de la "
            "tapa interior es una pletina plana soldada con MIG por su canto (z = 404,5–407,5). Las zonas para taladrar cambian (§1) y los "
            "agujeros de x = ±85 de A, B y C quedan pegados a las guías nuevas (la arandela toca su canto): <b>esos tres patrones ya no se "
            "podrían taladrar tal cual</b>; se calculan sólo como referencia.",
            f"<b>Búsqueda:</b> se repite sólo para n = 18 (el número de tornillos no cambia), con 7 recocidos y el óptimo de 2 mm (P18-O) como "
            f"candidato. Ahora gana un patrón <b>simétrico</b>: llega al {f0(100 * extra['sel_ratio'])} % del mejor libre con la malla fina, por "
            f"encima del 95 % que se pedía para preferirlo.",
            f"Con chapa flexible, el patrón C da <b>{f0(t3c['TR']['FEM'])} N</b> en el tornillo más cargado con 300 N en la esquina derecha "
            f"y {f0(t3c['TL']['FEM'])} N en la izquierda; con chapa rígida, {f0(t3c['TR']['rigido'])} N. La chapa de 3 mm sigue sin "
            f"comportarse como rígida (§2.2 y §6).",
            "La caja no es simétrica: bajo z = 150 el lateral izquierdo no existe (hueco del cajón de pajitas) y el suelo plegado sólo está "
            "unido a la caja por la esquina derecha. " + extra["gob_txt"],
            extra["chapa_txt"],
            "El tipo de pared manda más que el patrón: el mismo patrón admite tirones unas 4 veces menores en ladrillo perforado que en hormigón, "
            "y en ladrillo hueco horizontal y en pladur fischer no da valores para este taco (§5)."])
    s.append(PageBreak())

    # ------------------------------------------------------------------ 1. datos
    s.append(P("1. Datos de partida: comprobados, de fabricante, estimados e hipótesis", "h1"))
    filas = [["Dato", "Valor", "Estado / fuente"],
             ["Carcasa (ancho × fondo × alto)", "220 × 100 × 442,5 mm", "Comprobado en diseno.py / specs.py (W, D, Hw + T)"],
             ["Trasera: alto de chapa", "439,5 mm (Hw = 407,5 + 1,5 + 30,5)", "Comprobado: Ktop = 401,5; zi0 = 407,5; TK = 1,5; BANDA = 30,5"],
             ["Chapa", "DC01; trasera y caja de 3 mm, cajón de componentes y tapa interior de 1,5 mm; pliegues 90°, radio interior = espesor", "Comprobado (T = 3,0, TK = 1,5; Lista_de_piezas.xlsx del 04-11-2026)"],
             ["Masa de chapa", f"{f2(extra['m_acero'])} kg", "Calculado: suma de las 29 piezas de acero de la lista (24 de 3 mm y 5 de 1,5 mm)"],
             ["Chapa + policarbonato", f"{f2(extra['m_acero'] + extra['m_pc'])} kg", "Calculado: + 4 piezas de PC (0,57 kg)"],
             ["Masa con electrónica y herrajes", f"≈ {f1(extra['m_est'])} kg", "Estimado (tabla 2); cálculo con 18 kg"],
             ["Centro de gravedad", "x ≈ 0; z ≈ 210 mm; a unos 50 mm de la pared", "Estimado por reparto de masas; cálculo a 55 mm (sensibilidad 45–65)"],
             ["Patrón anterior (C)", "x = −85, 0, 85; z = 25, 75, 125, 205, 295, 391,5", "Comprobado: fijaciones_pared(W, Ktop − 10) hasta el 03-11-2026"],
             ["Agujeros / taco / tornillo / arandela", "Ø6,5 / SX Plus 8×65 / DIN 571 6×80 / DIN 9021 M6 (Ø18)", "Comprobado (ANCLAJE-PARED-8x65.md)"],
             ["SX Plus 8×65: taladro, h1, h<sub>ef</sub>, tornillo", "Ø8; ≥ 75 mm; 65 mm; Ø4,5–6,0", "Fischer (ficha técnica SX Plus, 16/05/2023)"],
             ["SX Plus 8×65: c<sub>min</sub> en hormigón", "50 mm", "Fischer (tabla de cargas SX Plus)"],
             ["SX Plus 8×65: separación mínima s<sub>min</sub>", "no publicada", "Hipótesis: 50 mm (= c<sub>min</sub>); variante con 100 mm en §3.3b"],
             ["Carga recomendada F<sub>rec</sub> (tracción, cortante y combinada)", "ver tabla 3", "Fischer; incluye coef. de seguridad; un solo taco"],
             ["Rigidez axial del anclaje k<sub>a</sub>", "2000 N/mm (500–10 000)", "Hipótesis (fischer no la publica); sensibilidad en §2.4"],
             ["Rigidez de contacto pared k<sub>w</sub>", "50 N/mm³ (5–500)", "Hipótesis (Winkler); sensibilidad en §2.4"],
             ["DC01: límite elástico", "Re ≤ 280 MPa; mínimo de cálculo 140 MPa; Rm 270–410", "Hoja de material thyssenkrupp (EN 10130)"]]
    s.append(tabla(filas, [46, 58, 70]))
    s.append(P("Tabla 1b. Datos de partida.", "pc"))
    s.append(P("Masa estimada con electrónica (tabla 2)", "h2"))
    filas = [["Grupo", "Masa (kg)", "Base de la estimación"]] + [[a, f2(b), c] for a, b, c in extra["masas"]]
    filas.append(["<b>Total estimado</b>", f"<b>{f2(sum(b for _, b, _ in extra['masas']))}</b>", "Se calcula con <b>18 kg</b> (≈ +16 % de margen)"])
    s.append(tabla(filas, [62, 18, 94]))
    s.append(P("Tabla 2. Las masas de chapa y policarbonato son datos del repositorio; el resto son estimaciones de orden de magnitud "
               "(no proceden de fichas técnicas) y deberían sustituirse por la pesada del primer prototipo.", "pc"))
    s.append(P("Cargas recomendadas de fischer para un SX Plus 8×65 con tornillo de Ø6 (tabla 3)", "h2"))
    filas = [["Material de la pared", "F<sub>rec</sub> (kN)", "Observaciones del fabricante"]]
    for k, v in extra["frec"]:
        filas.append([k, "—" if v is None else f2(v / 1000), extra["frec_notas"].get(k, "")])
    s.append(tabla(filas, [64, 18, 92]))
    s.append(P("Tabla 3. Valores para un taco aislado, en material seco, hasta +24 °C (+40 °C corto plazo), válidos para tracción, cortante y "
               "combinada, con los coeficientes de seguridad ya incluidos. No se colocan en juntas de mortero; en ladrillo hueco, taladrar "
               "sin percusión. Fischer no publica el coeficiente global aplicado, ni la separación mínima entre tacos, ni la rigidez.", "pc"))
    s.append(P("Zonas donde se puede taladrar", "h2"))
    s.append(P("Se ha recorrido la geometría de diseno.py para dejar libres todas las piezas que tocan la trasera por dentro. El centro de "
               "cada agujero debe quedar a ≥ 11 mm (radio de la arandela + 2 mm) de cualquier pestaña o soldadura y en la parte plana:"))
    s += L(["<b>Z1</b> (detrás del cajón de pajitas): x ∈ [−93, 93], z ∈ [20, 139,5]. Debajo, el pliegue del suelo (radio 3); encima, la "
            "pestaña de 13 mm de la bandeja soldada a la trasera (z = 150,5–163,5). Las cabezas (≈ 5,6 mm con la arandela) caben en los 8 mm "
            "libres detrás del cajón (quedan 3,4 mm).",
            "<b>Z2</b> (detrás del cajón de componentes): x ∈ [−93, 93], z ∈ [174,5, 393,5], excepto |x| entre 54 y 86 mm a la altura de las "
            "guías traseras (pletinas planas de 12 mm soldadas por puntos en x = ±64…76, z = 173,5–391,5) y un círculo de 16 mm alrededor del "
            "espárrago de tierra (50; 376,5). Arriba, el apoyo trasero de la tapa interior (pletina de 3 mm en z = 404,5–407,5, soldada con "
            "MIG por su canto). Holgura cabeza–cajón: 3,9 mm.",
            "<b>Z3</b> (franja superior, encima del cordón del apoyo de la tapa interior): z ∈ [420,5, 429,5]. Accesible con la tapa abierta; "
            "el canto superior es libre (la tapa sólo apoya). Distancia al canto ≥ 10 mm = 1,5 d<sub>0</sub>.",
            "|x| ≤ 93: la cara interior de los laterales está en ±107 y el pliegue (radio 3) termina en ±104; con la arandela de Ø18 y una "
            "llave de vaso o de estrella de 10 mm no conviene acercarse más.",
            "Para llegar a los agujeros hay que sacar los dos cajones (el procedimiento de montaje ya lo exige)."])
    s.append(fig(carpeta, "fig1_patrones.png", pie="Figura 1. Los cuatro patrones a la misma escala sobre la trasera vista desde delante."))
    s.append(PageBreak())

    # ------------------------------------------------------------------ 2. modelos
    s.append(P("2. Modelos de cálculo e hipótesis", "h1"))
    s.append(P("Ejes: x horizontal en la pared (+ derecha, mirando la máquina), z vertical desde la base, n normal a la pared (+ hacia fuera). "
               "Toda fuerza se expresa en newtons: una masa m produce F = m·g = m·9,81 N. Una fuerza aplicada a una distancia n de la pared "
               "o desplazada del eje genera momentos M = F·e que se reparten entre tracciones de anclajes y compresión de la chapa contra la pared."))
    s.append(P("Acciones generalizadas sobre la caja: Q<sub>n</sub> = ΣF<sub>n</sub>; M<sub>vuelco</sub> = Σ(z·F<sub>n</sub> − n·F<sub>z</sub>); "
               "M<sub>vertical</sub> = Σ(x·F<sub>n</sub> − n·F<sub>x</sub>); y en el plano V<sub>x</sub>, V<sub>z</sub> y el torsor "
               "T = Σ(z·F<sub>x</sub> − x·F<sub>z</sub>). Ejemplo: peso propio de cálculo 18 kg → F = 177 N a 55 mm → M = 177 × 0,055 = 9,7 N·m."))
    s.append(P("2.1 Modelo de elementos finitos (resultados «FEM»)", "h2"))
    s += L(["Chapa trasera de 3 mm como placa delgada de Kirchhoff con elementos rectangulares ACM de 12 GDL (malla de 2,5 a 20 mm). "
            "Verificación: placa cuadrada apoyada con carga central, error 0,2 % con 32×32 elementos frente a Timoshenko (0,0116·P·a²/D).",
            "La caja (laterales, frontal, bandeja, tapa) es un sólido rígido unido a la chapa en las líneas reales: pliegue derecho (z = 6–438), "
            "pliegue izquierdo sólo en z = 150–439,5, franja de la pestaña soldada de la bandeja (z = 150,5–163,5). El suelo plegado es una "
            "viga rígida en su plano unida a la caja sólo en la esquina derecha (puede girar). Canto superior y canto izquierdo bajo z = 150: libres.",
            "Bordes laterales: dos hipótesis extremas — <b>apoyado</b> (el pliegue gira libre) y <b>empotrado</b> (el lateral, soldado al frontal, "
            "impide el giro). Todos los resultados de diseño toman <b>el peor de los dos</b>.",
            "Cada tornillo: muelle axial solo-tracción k<sub>a</sub> unido a una arandela rígida de Ø18. Contacto chapa–pared: muelles "
            "Winkler solo-compresión en todos los nudos (iteración de conjunto activo hasta que no cambia ningún estado).",
            "Cortante en el plano: chapa rígida en su plano, reparto elástico por traslación + torsión polar entre todos los tornillos "
            "(holgura del agujero 0,25 mm radial; se supone que todos colaboran). Sin rozamiento y sin precarga del apriete (conservador).",
            "Combinación por tornillo: F = √(N² + V²) ≤ F<sub>rec</sub>, porque fischer da un único valor para cualquier dirección."])
    s.append(P("2.2 Modelo analítico de chapa rígida («rígido») y método clásico", "h2"))
    s.append(P("Misma física con la chapa infinitamente rígida: 3 GDL (traslación normal y dos giros), anclajes solo-tracción y contacto "
               "unilateral sobre toda la trasera. Es la generalización correcta de la fórmula de libro. Como «clásico» se reproducen además "
               "las fórmulas de pivote en el canto inferior y de Navier biaxial respecto al centroide, que es lo que suele hacerse a mano. "
               "Ninguno de los dos detecta el efecto palanca de la chapa delgada."))
    # tabla de comparación de modelos
    filas = [["Tirón normal 300 N (sin peso)", "Patrón", "FEM (peor borde)", "Rígido", "Pivote inferior", "Pivote inf. + lateral", "Navier"]]
    for k in ("TL", "TR"):
        for nom in orden:
            t = A[nom]["tiron300"][k]
            filas.append([f"Esquina sup. {'izqda.' if k == 'TL' else 'dcha.'}", nom, f1(t["FEM"]), f1(t["rigido"]), f1(t["clasico"]["pivote_inf"]),
                          f1(t["clasico"]["pivote_inf_mas_lateral"]), f1(t["clasico"]["navier"])])
    s.append(tabla(filas, [32, 34, 22, 18, 22, 26, 20]))
    s.append(P("Tabla 4. Tracción máxima en un tornillo (N) con los tres niveles de modelo. " + extra["fem_rig_txt"] + " La chapa se curva "
               "entre las líneas rígidas y los tornillos, y la parte de chapa que queda más allá de cada tornillo empuja contra la pared "
               "(efecto palanca): la suma de tracciones supera la fuerza aplicada y la diferencia la devuelve la pared en compresión.", "pc"))
    s.append(fig(carpeta, "fig8_convergencia.png", ancho=150, titulo="2.3 Convergencia de malla", pie="Figura 2. Fuerza máxima del caso gobernante frente al tamaño de elemento "
                 "(2,5–20 mm, con arandela rígida). La diferencia entre 5 y 2,5 mm es " + extra["conv_txt"] + ". Diseño y tablas: malla de 10 mm; "
                 "búsqueda: malla de 20 mm sin arandela (≈ 5 % por debajo, mismo orden de patrones)."))
    s.append(P("2.4 Sensibilidad a las hipótesis", "h2"))
    filas = [["Variante"] + orden]
    for i, v in enumerate(A[nC]["sensibilidad"]):
        filas.append([v["variante"]] + [f2(A[k]["sensibilidad"][i]["lam"]) for k in orden])
    s.append(tabla(filas, [52, 30, 30, 30, 30]))
    s.append(P("Tabla 5a. λ de la envolvente al variar la rigidez del anclaje, la del contacto y la posición del CdG. La rigidez de los tacos "
               "es la hipótesis más influyente (tacos más rígidos atraen más carga y aumentan la palanca), pero " + extra["sens_txt"], "pc"))
    s.append(PageBreak())

    # ------------------------------------------------------------------ 3. optimización
    s.append(P("3. Optimización", "h1"))
    s.append(P("3.1 Método", "h2"))
    s += L(["Variables: coordenadas (x, z) de cada tornillo, continuas, proyectadas siempre a las zonas Z1–Z3; separación ≥ 50 mm "
            "como penalización. Patrones libres (asimétricos) y simétricos respecto a x = 0.",
            "Objetivo: maximizar λ = mín sobre 9 casos de diseño × 2 hipótesis de borde de F<sub>rec</sub>/F<sub>máx</sub>. No se optimiza "
            "solo la tracción: la resultante incluye el cortante y entran casos de cuelgue y laterales.",
            f"Algoritmo: recocido simulado con pulido final por coordenadas, sólo para n = 18. Primera fase: 2 arranques libres y 1 "
            f"simétrico de 2000 iteraciones; además, el óptimo de 2 mm (P18-O) llevado a las zonas nuevas como candidato. Segunda fase: "
            f"4 recocidos de {extra['iters2']} iteraciones (2 desde las mejores soluciones, libre y simétrica, y 2 desde arranques nuevos). "
            f"Cada evaluación resuelve 18 problemas de contacto FEM (malla 20 mm, Cholesky en banda + Schur).",
            "Es un método heurístico. La dispersión entre arranques (figura 3) indica que <b>no se puede afirmar que el resultado sea el óptimo "
            "global</b>; sí que es claramente mejor que los tres candidatos previos con cualquiera de las hipótesis ensayadas."])
    s.append(fig(carpeta, "fig3_lambda_n.png", ancho=150, pie="Figura 3. λ de cada arranque de la búsqueda con n = 18 (malla de búsqueda de 20 mm, "
                 "sin arandela) y de los patrones de referencia con la misma malla. El P18-O de 2 mm, llevado a las zonas de 3 mm, deja dos "
                 "pares de agujeros a menos de 50 mm (48,4 y 49,5) y queda descartado. Con 3 mm no se ha repetido el barrido de 6 a 17 tornillos del estudio de 2 mm."))
    s.append(P("3.2 Lo que ha aprendido la búsqueda", "h2"))
    s += L(["Los tornillos útiles son los que están <b>pegados a las partes rígidas</b>: columnas a ±87…93 mm (junto a los pliegues "
            "laterales), filas justo por encima y por debajo de la pestaña de la bandeja, y la franja Z3 bajo el canto superior (mayor brazo "
            "de palanca y menos chapa en voladizo). Es la misma lección que con 2 mm.",
            "La columna central x = 0 del patrón C trabaja muy poco en los tirones: la chapa entre los pliegues se curva y en el centro "
            "aprieta contra la pared (figura 5).",
            "Con 3 mm, el mejor simétrico se acerca más al mejor libre que con 2 mm (96 % frente a 90 %); probablemente porque la chapa más "
            "rígida reparte mejor y la asimetría de la caja pesa menos. El límite |x| ≤ 93 sigue activo."])
    s.append(PageBreak())
    s.append(P(f"3.3 Patrón ganador: {nG}", "h2"))
    filas = [["Nº", "x (mm, desde el eje)", "z (mm, desde la base)", "x desde el canto izqdo. (mm)", "Zona", "F en tirón 500 N dcha. (N)"]]
    e = caso(nG, "Tirón normal 500 N TR")
    orden_pts = sorted(range(len(G["pts"])), key=lambda i: (-G["pts"][i][1], G["pts"][i][0]))
    for j, i in enumerate(orden_pts):
        x, z = G["pts"][i]
        zona = "Z3" if z > 420 else ("Z2" if z > 170 else "Z1")
        filas.append([str(j + 1), f1(x), f1(z), f1(x + 110), zona, f0(e["N"][i])])
    s.append(tabla(filas, [10, 30, 30, 36, 14, 40]))
    s.append(P("Tabla 5. Coordenadas exactas (también en el CSV adjunto). Taladro Ø6,5 en la chapa; origen de x en el eje vertical de la "
               "máquina, z desde la cara inferior; trasera vista desde delante.", "pc"))
    V = extra.get("variantes", {})
    if V:
        s.append(P("3.3b Alternativas: versión libre y versión para mampostería", "h2"))
        fmt0 = "Ladrillo macizo/perforado 24x11,5x5"
        filas = [["Patrón", "n", "s<sub>mín</sub> (mm)", "λ (FEM)", "Tirón adm. dcha. hormigón / HLz 12 (N)",
                  "Ladrillo 24×11,5×5: P(≥ 1 en junta) / máx. por pieza"]]
        filas.append([nG, str(G["n"]), f1(G["geometria"]["s_min"]), f2(G["lam"]),
                      f"{f0(adm(nG, 'Hormigón ≥ C20/25', 'Tirón normal TR'))} / {f0(adm(nG, 'Ladrillo perforado vertical ≥ HLz 12', 'Tirón normal TR'))}",
                      f"{f0(100 * G['juntas'][fmt0]['p_alguno'])} % / {G['juntas'][fmt0]['max_por_pieza']}"])
        for nom, v in V.items():
            filas.append([nom, str(v["n"]), f1(v["smin"]), f2(v["lam"]),
                          f"{f0(v['admisibles']['Hormigón ≥ C20/25'])} / {f0(v['admisibles']['Ladrillo perforado vertical ≥ HLz 12'])}",
                          f"{f0(100 * v['juntas'][fmt0]['p_alguno'])} % / {v['juntas'][fmt0]['max_por_pieza']}"])
        s.append(tabla(filas, [44, 8, 18, 16, 44, 44]))
        s.append(P("Tabla 5b. La alternativa libre (asimétrica) rinde algo más, pero no llega al 5 % de ventaja que se pedía para "
                   "renunciar a la simetría, que facilita replantear y comprobar los agujeros. La versión para mampostería separa los tacos "
                   "≥ 100 mm para que haya menos por pieza de ladrillo; con esa separación sólo caben 12 sin penalización en las zonas, así "
                   "que tiene bastante menos capacidad en hormigón. Coordenadas de ambas en el anexo.", "pc"))
    s.append(fig(carpeta, "fig2_fuerzas.png", titulo="3.4 Distribución de fuerzas", pie="Figura 4. Tracción por tornillo con el tirón que gobierna."))
    conc = []
    for nom in orden:
        c = A[nom]["concentracion"].get("Tirón normal 500 N TR", {})
        conc.append(c)
    s.append(P("Concentración en las filas superiores (tirón de 500 N en la esquina derecha): fracción de la tracción total que llevan los "
               "tornillos con z ≥ 300 mm — " + "; ".join(f"{nom}: {f0(100 * c.get('frac_z300', 0))} %" for nom, c in zip(orden, conc)) +
               ". Los tres tornillos más cargados llevan " + "; ".join(f"{f0(100 * c.get('frac_top3', 0))} %" for c in conc) + " respectivamente."))
    s.append(fig(carpeta, "fig9_deformada.png", ancho=130, pie="Figura 5. Desplazamiento normal de la chapa (FEM 5 mm) con 500 N en la "
                 "esquina superior derecha + peso. Rojo: se separa; azul: aprieta contra la pared (zonas de palanca)."))
    s.append(PageBreak())

    # ------------------------------------------------------------------ 4. escenarios
    s.append(P("4. Simulación de situaciones reales (mismas condiciones para los cuatro)", "h1"))
    s.append(P("4.1 Cargas verticales", "h2"))
    filas = [["Masa (kg) → F (N)"] + [f"{nom}: CdG / borde" for nom in orden]]
    for i, m_ in enumerate((15, 25, 40, 60, 80, 100)):
        fila = [f"{m_} → {f0(m_ * 9.81)}"]
        for nom in orden:
            a = A[nom]["escenarios"]["vertical_cg"][i][1]["Fmax"]
            b = A[nom]["escenarios"]["vertical_frente"][i][1]["Fmax"]
            fila.append(f"{f0(a)} / {f0(b)}")
        filas.append(fila)
    s.append(tabla(filas, [30, 36, 36, 36, 36]))
    s.append(P("Tabla 6. Fuerza máxima en un tornillo (N). «CdG»: toda la carga en el centro de gravedad (equivale a una máquina de esa masa). "
               "«Borde»: 18 kg propios + esa masa colgada del borde delantero superior (n = 100 mm). Incluye el cortante.", "pc"))
    s.append(fig(carpeta, "fig5_verticales.png", ancho=165, pie="Figura 6. Cargas verticales."))
    s.append(P("4.2 Tirones horizontales (normales a la pared) de 100, 200, 300 y 500 N", "h2"))
    filas = [["Punto de tirón", "F (N)"] + orden]
    for k, et in (("TL", "Esquina sup. izqda."), ("TR", "Esquina sup. dcha."), ("C", "Centro"), ("B", "Parte inferior")):
        for i, F in enumerate((100, 200, 300, 500)):
            filas.append([et if i == 0 else "", str(F)] + [f0(A[nom]["escenarios"][f"normal_{k}"][i][1]["Fmax"]) for nom in orden])
    s.append(tabla(filas, [34, 14, 31, 31, 31, 31]))
    s.append(P("Tabla 7. Fuerza máxima en un tornillo (N), con peso propio. Comparar con F<sub>rec</sub>: 1500 N hormigón, 800 N ladrillo "
               "macizo, 400 N ladrillo perforado HLz 12, 300 N bloque hueco.", "pc"))
    s.append(fig(carpeta, "fig4_tirones.png", ancho=165, pie="Figura 7. Tirones en las esquinas superiores."))
    s.append(P("4.3 Tirones laterales y oblicuos, personas y golpes", "h2"))
    filas = [["Situación"] + orden]
    for F_i, F in enumerate((300, 500)):
        filas.append([f"Tirón lateral {F} N arriba (torsión + vuelco lateral)"] +
                     [f0(A[nom]["escenarios"]["lateral"][F_i + 2][1]["Fmax"]) for nom in orden])
        filas.append([f"Tirón oblicuo 45° {F} N esquina dcha."] + [f0(A[nom]["escenarios"]["oblicuo_TR"][F_i + 2][1]["Fmax"]) for nom in orden])
    for i, et in enumerate(("Persona apoyada (300 N abajo + 300 N contra la pared)", "Persona de 80 kg colgada del borde (estático)",
                            "Ídem, se deja caer (factor dinámico 2)")):
        filas.append([et] + [f0(A[nom]["escenarios"]["persona"][i][1]["Fmax"]) for nom in orden])
    filas.append(["Golpe frontal 2000 N hacia la pared (centro / esquina)"] +
                 [f"{f0(A[nom]['escenarios']['golpe_frontal'][0][1]['Nmax'])} / {f0(A[nom]['escenarios']['golpe_frontal'][1][1]['Nmax'])}" for nom in orden])
    for j, E in enumerate((10, 30)):
        filas.append([f"Golpe lateral en esquina sup., {E} J: F equivalente (N)"] + [f0(A[nom]["golpe_lateral"][j]["Feq"]) for nom in orden])
        filas.append([f"  → fuerza máx. en un tornillo (N)"] + [f0(A[nom]["golpe_lateral"][j]["Fmax"]) for nom in orden])
        filas.append([f"  (impactador rígido, cota superior: F equivalente)"] + [f0(A[nom]["golpe_lateral"][j]["Feq_rig"]) for nom in orden])
    s.append(tabla(filas, [66, 27, 27, 27, 27]))
    s.append(P("Tabla 8. Fuerza máxima en un tornillo (N). Golpe frontal: centrado, empuja la chapa contra la pared y los anclajes apenas trabajan "
               "(sólo el peso); en una esquina, la caja bascula sobre la chapa flexible y aparecen tracciones del orden de las de un tirón de "
               "300 N. El riesgo del golpe frontal está más en el panel frontal y la pantalla que en el anclaje. "
               "Golpe lateral: método energético F = √(2·E·k<sub>ef</sub>): toda la energía se almacena elásticamente; k<sub>ef</sub> = rigidez "
               "lateral del conjunto (vuelco del FEM + cortante con 1000 N/mm por taco, hipótesis) en serie con la del cuerpo que golpea "
               "(50 N/mm, hipótesis). Sin amortiguamiento ni abolladura local, así que es conservador; con impactador rígido la fuerza sería "
               "varias veces mayor (fila entre paréntesis), lo que no es realista para un pie o un puño. 30 J ≈ 5 kg a 3,5 m/s.", "pc"))
    s.append(P("4.4 Pérdida de anclajes y fallo progresivo", "h2"))
    filas = [["Escenario"] + orden]
    filas.append(["Intacto: λ (malla 20 mm)"] + [f2(A[nom]["perdidas"]["base"] * 1500) for nom in orden])
    for k in (1, 2, 4, 6):
        filas.append([f"Faltan {k}, peor combinación: λ (% del intacto)"] +
                     [f"{f2(A[nom]['perdidas'][f'menos_{k}']['peor'] * 1500)} ({f0(100 * A[nom]['perdidas'][f'menos_{k}']['peor_rel'])} %)" for nom in orden])
        filas.append([f"Faltan {k} al azar: mediana / percentil 10 (%)"] +
                     [f"{f0(100 * A[nom]['perdidas'][f'menos_{k}']['med'])} / {f0(100 * A[nom]['perdidas'][f'menos_{k}']['p10'])} %" for nom in orden])
    filas.append(["Colapso progresivo / primera rotura"] + [f2(A[nom]["cremallera"]["ratio_colapso"]) for nom in orden])
    s.append(tabla(filas, [62, 28, 28, 28, 28]))
    s.append(P("Tabla 9. Capacidad tras perder tornillos (malla de búsqueda, envolvente de casos). «Peor combinación»: se eliminan, uno a uno, "
               "los tornillos cuya falta más perjudica. «Al azar»: 40 combinaciones. El ganador pierde más en porcentaje (cada tornillo suyo "
               "trabaja más) pero <b>conserva más capacidad absoluta que los otros tres en todos los escenarios</b>. La última fila es el cociente entre la carga que agota el último "
               "equilibrio posible eliminando cada vez el tornillo que rompe y la carga de la primera rotura (> 1: hay reserva tras la "
               "primera rotura; = 1: rotura en cadena).", "pc"))
    s.append(fig(carpeta, "fig6_perdidas.png", ancho=165, pie="Figura 8. Robustez frente a la pérdida de anclajes."))
    s.append(PageBreak())

    # ------------------------------------------------------------------ 5. pared
    s.append(P("5. Sensibilidad al tipo de pared", "h1"))
    filas = [["Pared (F<sub>rec</sub>)", "Acción"] + orden]
    for pared in A[nG]["admisibles"]:
        for j, acc in enumerate(("Tirón normal TR", "Cuelgue en borde delantero (N)")):
            et = "Tirón esquina sup. dcha." if j == 0 else "Peso colgado en el borde"
            filas.append([pared if j == 0 else "", et] + [f0(A[nom]["admisibles"][pared][acc]) for nom in orden])
    s.append(tabla(filas, [50, 32, 23, 23, 23, 23]))
    s.append(P("Tabla 10. Acción admisible de diseño (N) con el peso propio fijo, hasta que el tornillo más cargado alcanza la carga "
               "recomendada de fischer para ese soporte. 785 N = una persona de 80 kg colgada sin impulso. Sólo se comprueban los tacos: con "
               "pesos colgados tan grandes mandarían antes la chapa, las soldaduras o la propia caja, que no se calculan aquí.", "pc"))
    s.append(fig(carpeta, "fig7_paredes.png", ancho=165, pie="Figura 9. Tirón admisible en la esquina superior derecha según la pared."))
    s.append(P("5.1 Juntas y piezas de mampostería (Monte Carlo)", "h2"))
    filas = [["Formato", "Patrón", "En junta (media / máx.)", "Máx. por pieza", "λ sin ajuste: mediana / p05", "λ con ajuste de altura: mediana / p05"]]
    JA = extra.get("juntas_ajuste", {})
    pats_j = [(nom, A[nom]["juntas"]) for nom in orden] + [(nom, v["juntas"]) for nom, v in V.items() if nom in JA]
    for fmt in [f for f in A[nG]["juntas"] if not f.startswith("_")]:
        for i, (nom, J) in enumerate(pats_j):
            j = J[fmt]
            ja = JA.get(nom, {}).get(fmt)
            filas.append([fmt if i == 0 else "", nom, f"{f1(j['media_en_junta'])} / {j['max_en_junta']}", str(j["max_por_pieza"]),
                          f"{f1(1500 * j['lam_med'])} / {f1(1500 * j['lam_p05'])}",
                          f"{f1(1500 * ja['ajuste_med'])} / {f1(1500 * ja['ajuste_p05'])}" if ja else "—"])
    s.append(tabla(filas, [36, 36, 22, 16, 32, 32]))
    s.append(P("Tabla 11. Aparejo a soga con junta de 10 mm y desfase aleatorio respecto a la máquina (120 posiciones; 40 con ajuste). Un tornillo "
               "cuenta como «en junta» si el taladro de Ø8 toca la junta (fischer: no anclar en juntas) y entonces se omite. λ en las "
               "mismas unidades que la figura 3 (F<sub>rec</sub> de hormigón; para otra pared, multiplicar por F<sub>rec</sub>/1500). "
               "«Con ajuste»: el instalador sube o baja la máquina dentro de una hilada (pasos de 10 mm) hasta la posición que deja más "
               "capacidad. p05 = percentil 5 (1 de cada 20 instalaciones queda por debajo).", "pc"))
    s.append(P("5.2 Qué patrón usar en cada pared", "h2"))
    fm = [f for f in A[nG]["juntas"] if not f.startswith("_")]
    if JA.get(nG) and JA.get(nC):
        r_aj = [JA[nG][f]["ajuste_p05"] / JA[nC][f]["ajuste_p05"] for f in fm]
        juntas_txt = (f"Con esa regla el ganador conserva, en el percentil 5, entre {f1(min(r_aj))} y {f1(max(r_aj))} veces la capacidad "
                      f"del patrón C.")
    else:
        juntas_txt = ""
    sG, sC = 1500 * A[nG]["juntas"][fm[0]]["lam_p05"], 1500 * A[nC]["juntas"][fm[0]]["lam_p05"]
    juntas_txt += (f" Incluso sin ajustar, en ladrillo de 5 cm su percentil 5 es {f1(sG)} frente a {f1(sC)} del C." if sG > sC else
                   f" Sin ajustar, en ladrillo de 5 cm su percentil 5 queda en {f1(sG)} frente a {f1(sC)} del C: conviene ajustar.")
    s += L(["<b>Hormigón ≥ C20/25 y silicocalcáreo macizo KS 12</b> (F<sub>rec</sub> 1,5 kN): el patrón ganador tal cual. La interacción entre "
            "tacos no limita: con h<sub>ef</sub> = 65 mm, el cono de hormigón fisurado de un taco aislado da ≈ 20 kN (k = 7,7 del método de "
            "EN 1992-4) y, aun repartiendo el área de conos solapados de 9 tacos a 50 mm, quedan ≈ 5 kN por taco, más de 3 veces F<sub>rec</sub>. "
            "Respetar c<sub>min</sub> = 50 mm a cantos y huecos de la pared.",
            "<b>Ladrillo macizo Mz 12</b> (0,8 kN) y <b>perforado KSL/HLz</b> (0,8 / 0,4 kN): con juntas cada 6–8 cm es casi seguro que "
            "varios agujeros caigan en junta (tabla 11), y los del ganador que están a la misma altura (franja superior) caen juntos. "
            "<b>Regla de montaje:</b> localizar las juntas (o hacer un taladro piloto de Ø4 en los agujeros de la franja superior) y subir o "
            "bajar la máquina hasta que esa fila caiga en ladrillo; los tacos que aun así caigan en junta se omiten. " + juntas_txt +
            " Taladrar sin percusión en perforado. "
            "La capacidad de cada pieza de ladrillo frente a extracción no la da fischer: no más de 2–3 tacos por pieza si se puede elegir.",
            "<b>Ladrillo hueco horizontal</b> (tabiques de hueco doble/sencillo, «Forato»): fischer no da carga para el 8×65 (para el 8×40, 0,10 kN "
            "en pared enlucida). <b>No es un soporte válido</b> para esta máquina con estos tacos: usar anclaje químico con tamiz o pasante "
            "con contraplaca, con datos del fabricante y ensayo in situ.",
            "<b>Bloque hueco de hormigón</b> (0,30 kN, enlucido): capacidad algo menor que HLz y hasta 10 tacos en el mismo bloque de 40×20; "
            "se recomienda anclaje químico con tamiz.",
            "<b>Hormigón celular</b> (0,15–0,40 kN): sólo con anclajes específicos para celular.",
            "<b>Pladur</b>: el SX Plus no tiene valor de carga en placa. La máquina debe ir a un refuerzo (tablero o pletina atornillada a los "
            "montantes) diseñado y verificado aparte; no se cuantifica aquí.",
            "En todos los casos, la carga recomendada es de un taco aislado: <b>no se multiplica por el número de tacos</b>; el reparto real "
            "lo da el modelo y gobierna el más cargado."])

    # ------------------------------------------------------------------ 6. chapa
    s.append(P("6. Chapa trasera: tensiones, separación y contacto", "h1"))
    filas = [["Chapa trasera"] + orden]
    filas.append(["Tensión de flexión máx. con 500 N en la esquina dcha. (MPa, von Mises de cara)"] + [f0(A[k]["chapa_TR"]["sigma_500"]) for k in orden])
    filas.append(["Tirón en esquina dcha. con primera plastificación local, Re = 140 / 280 MPa (N)"] +
                 [f"{f0(A[k]['chapa_TR']['F_fluencia_140'])} / {f0(A[k]['chapa_TR']['F_fluencia_280'])}" for k in orden])
    filas.append(["Tirón admisible por los tacos en hormigón, para comparar (N)"] + [f0(adm(k, "Hormigón ≥ C20/25", "Tirón normal TR")) for k in orden])
    filas.append(["Separación máx. chapa–pared a la carga admisible del caso gobernante (mm)"] + [f2(A[k]["chapa"]["sep_adm"]) for k in orden])
    filas.append(["Pico de presión de contacto, ídem (MPa)"] + [f1(A[k]["chapa"]["p_contacto_max_adm"]) for k in orden])
    filas.append(["ΣN / 500 N con el tirón de 500 N en la esquina dcha. (efecto palanca)"] +
                 [f2(sum(caso(k, "Tirón normal 500 N TR")["N"]) / 500.0) for k in orden])
    filas.append(["Momento de vuelco admisible puro (N·m)"] + [f0(A[k]["momentos_adm_Nm"]["vuelco (eje horizontal)"]) for k in orden])
    filas.append(["Momento admisible alrededor del eje vertical (N·m)"] + [f0(A[k]["momentos_adm_Nm"]["giro eje vertical"]) for k in orden])
    filas.append(["Torsor admisible en el plano de la pared (N·m)"] + [f0(A[k]["momentos_adm_Nm"]["torsión en el plano"]) for k in orden])
    s.append(tabla(filas, [74, 25, 25, 25, 25]))
    s.append(P("Tabla 12. Tensiones elásticas de flexión (placa lineal); el pico está en el borde de la arandela de un tornillo superior. DC01: "
               "Re ≤ 280 MPa sin mínimo garantizado, 140 MPa como mínimo de cálculo. <b>En hormigón y ladrillo macizo la chapa de 3 mm "
               "plastifica localmente antes de que el taco llegue a su carga recomendada</b>: deformación permanente alrededor de la arandela, "
               "no rotura (el arrancamiento de la arandela de Ø18 a través de 3 mm exige del orden de π·18·3·0,6·270 ≈ 27 kN). Con 2 mm la "
               "plastificación empezaba a la mitad de carga, más o menos. "
               "El pico de presión es local, en la línea de un pliegue, y depende de la rigidez de contacto supuesta.", "pc"))
    s.append(P("Si se quiere que en hormigón mande el taco y no la chapa, la medida eficaz es local: una pletina de 4–5 mm soldada por "
               "dentro bajo la franja superior y bajo la fila de la bandeja (o arandelas de mayor diámetro), sin cambiar el espesor general. "
               "En ladrillo perforado, bloque o celular manda el taco y la chapa no limita.", "p"))
    s.append(P("La hipótesis de chapa rígida <b>no se cumple</b>: con los mismos tornillos, la fuerza máxima del FEM es entre 1,4 y 3 veces "
               "la del modelo rígido y la suma de tracciones llega a ser más del doble de la carga aplicada. Por eso el patrón óptimo con chapa "
               "flexible (tornillos junto a las líneas rígidas) es muy distinto del que sale con chapa rígida (tornillos lo más arriba y lejos "
               "del pivote posible)."))
    s.append(P("7. Carga máxima teórica frente a carga admisible de diseño", "h1"))
    filas = [["Concepto (tirón en la esquina sup. dcha., hormigón)"] + orden]
    filas.append(["Tirón admisible de diseño: primer tornillo a F<sub>rec</sub> = 1,5 kN (N)"] + [f0(adm(k, "Hormigón ≥ C20/25", "Tirón normal TR")) for k in orden])
    filas.append(["Primera rotura si el taco rompe a γ·F<sub>rec</sub>, con γ = 3 ilustrativo (N)"] + [f0(3 * adm(k, "Hormigón ≥ C20/25", "Tirón normal TR")) for k in orden])
    filas.append(["Carga de colapso del modelo / primera rotura"] + [f2(A[k]["cremallera"]["ratio_colapso"]) for k in orden])
    s.append(tabla(filas, [74, 25, 25, 25, 25]))
    s.append(P("Tabla 13. La carga <b>admisible de diseño</b> es la única con respaldo de fabricante. La <b>carga máxima teórica</b> depende "
               "del margen real entre rotura y F<sub>rec</sub> (γ), que fischer no publica para el SX Plus; γ = 3 es sólo un ejemplo para "
               "mostrar el orden de magnitud. Ninguna de las dos es una resistencia certificada del conjunto: eso requiere ensayo.", "pc"))

    # ------------------------------------------------------------------ 8. conclusión
    s.append(P("8. Conclusión y verificaciones antes de fabricar", "h1"))
    s.append(caja(
        f"<b>Elegiría {nG}</b> para fabricar la carcasa: es el que más carga admite en el caso que gobierna (λ = {f2(G['lam'])} frente a "
        f"{f2(A[nC]['lam'])} del anterior), mantiene la ventaja con todas las hipótesis de rigidez probadas, es " + extra["robustez_txt"] +
        f" y respeta todas las holguras de la geometría (separación mínima {f1(G['geometria']['s_min'])} mm). En hormigón admite del orden de "
        f"{f0(adm(nG, 'Hormigón ≥ C20/25', 'Tirón normal TR'))} N de tirón en la esquina más desfavorable con el criterio de fischer; en ladrillo "
        f"perforado HLz 12, unos {f0(adm(nG, 'Ladrillo perforado vertical ≥ HLz 12', 'Tirón normal TR'))} N."))
    s.append(Spacer(1, 6))
    s += L([f"<b>Para bares (instalación habitual):</b> hormigón, ladrillo macizo o perforado. Se taladran los {G['n']} agujeros en la chapa. "
            "En hormigón se colocan todos. En ladrillo se aplica la regla de montaje de §5.2 (ajustar la altura para que la franja superior "
            "caiga en ladrillo, omitir los que caigan en junta) y no se deja sin tornillo ninguno de la franja superior (Z3).",
            "<b>No instalar</b> sobre ladrillo hueco horizontal, pladur o revestimientos sin un anclaje distinto (químico con tamiz, "
            "pasante con contraplaca o refuerzo detrás del pladur).",
            "Una persona de 80 kg que se deja caer colgada del borde (1570 N con factor 2) queda cubierta por los cuatro patrones en todas "
            "las paredes con dato de fischer salvo hormigón celular AAC 2, donde sólo la cubre el ganador (tabla 10).",
            "En hormigón, el límite práctico lo pone la chapa de 3 mm, que plastifica localmente junto a las arandelas superiores a partir de "
            f"≈ {f0(A[nG]['chapa_TR']['F_fluencia_140'])} N de tirón en la esquina con el ganador (≈ {f0(A[nC]['chapa_TR']['F_fluencia_140'])} N con el "
            "patrón C), bastante antes que los tacos. No es una rotura, pero sí una deformación permanente; ver §6 para reforzarla localmente.",
            "Si se quiere más margen frente a golpes (tabla 8), el siguiente paso no es mover tornillos sino cambiar de anclaje (metálico "
            "con evaluación técnica) o añadir rigidez a la trasera (pliegues o un perfil soldado entre los pliegues laterales)."])
    s.append(P("Verificaciones pendientes antes de fabricar", "h2"))
    s += L(["Hecho (04-11-2026): el P18-3 está en el CAD (diseno.py → FIJACIONES_PARED), con 0 choques entre piezas y barridos de los "
            "cajones limpios; DXF A-C02, STEP, planos y lista regenerados.",
            "Pesar el primer prototipo completo y medir su centro de gravedad; repetir el cálculo si supera 18 kg o 65 mm de la pared.",
            "Ensayo de arrancamiento in situ (tracción sobre 3–5 tacos de prueba) en cada tipo de pared nueva, y uno del conjunto con la "
            "máquina montada (tirón lateral y en esquina) para validar el modelo de chapa flexible.",
            "Confirmar con el taller el radio de plegado y la soldadura de la pestaña de la bandeja (el modelo la trata como unión rígida).",
            "Comprobar el acceso con llave de 10 mm a los agujeros de ±93 mm (14 mm de la cara interior del lateral) y a la franja Z3 con la tapa abierta.",
            "Pedir a fischer la separación mínima entre tacos y, si es posible, la curva carga–desplazamiento del SX Plus 8×65."])
    if V:
        s.append(P("Anexo. Coordenadas de las alternativas (x desde el eje, z desde la base, mm)", "h2"))
        for nom, v in V.items():
            pts = sorted(v["pts"], key=lambda p: (-p[1], p[0]))
            s.append(P(f"<b>{nom}</b> ({v['n']} agujeros): " + "; ".join(f"({f1(x)}, {f1(z)})" for x, z in pts), "p"))
    s.append(P("9. Referencias y archivos entregados", "h1"))
    s += L(["fischer, tabla de cargas Expansion plug SX Plus (cargas recomendadas, c<sub>min</sub>; notas 1–3): "
            "fiproductmedia.azureedge.net/media/Load Tables/Load Tables fischer/LT_SX-PLUS_EN_T1.pdf",
            "fischer, ficha técnica Cheville SX PLUS (16/05/2023): taladro, h1, h<sub>ef</sub>, tornillo, no anclar en juntas.",
            "fischer España, ficha de producto SX Plus 8×65 (567857): Ø8, h1 ≥ 75 mm, tornillo Ø4,5–6,0.",
            "thyssenkrupp Materials Services, Werkstoffdatenblatt DC01–DC07 (EN 10130): Re ≤ 280 MPa, Rm 270–410 MPa, mín. de cálculo 140 MPa.",
            "S. Timoshenko, S. Woinowsky-Krieger, Theory of Plates and Shells (verificación del elemento de placa).",
            "Repositorio GuillermoAladro/Alcoholimetro, rama programa-raspberry (04-11-2026): carcasa/diseno-A/modelo/diseno.py, specs.py, "
            "Lista_de_piezas.xlsx, ANCLAJE-PARED-8x65.md.",
            "Carpeta carcasa/diseno-A/calculo-anclajes/: patron_ganador.csv (coordenadas), codigo/ (todo el cálculo), resultados/ (JSON de "
            "esta ejecución), figuras/ y, en historico-2mm/, el estudio con la trasera de 2 mm."])
    doc.build(s, onFirstPage=pie_pagina, onLaterPages=pie_pagina)


if __name__ == "__main__":
    A = json.load(open(sys.argv[1]))
    O = json.load(open(sys.argv[2]))
    extra = json.load(open(sys.argv[5]))
    construir(A, O, sys.argv[3], sys.argv[4], extra)
    print("ok")
