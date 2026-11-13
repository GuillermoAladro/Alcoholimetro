# -*- coding: utf-8 -*-
"""
Genera el informe de alternativas de cobro en PDF y en Markdown a partir de datos.py.

    python3 generar.py

Necesita reportlab y la fuente Carlito (o cualquier TTF: cambia FUENTE_DIR).
"""
import os
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

import datos as D

AQUI = os.path.dirname(os.path.abspath(__file__))
NOMBRE = "ALTERNATIVAS-COBRO-13-11-2026"
FECHA = "13-11-2026"
PIE = f"Alcoholímetro · Alternativas al cobro con SumUp · {FECHA}"

# ---------------------------------------------------------------------------------------------
# Texto de las secciones (el de cada alternativa está en datos.py)
# ---------------------------------------------------------------------------------------------
TITULO = "Cobrar sin el SumUp Solo"
SUBTITULO = "20 alternativas con precios, opinión y orden de recomendación"
AVISO = (
    "Trabajo de papel: nada está probado con aparatos y no he hablado con ningún proveedor. Los precios "
    "son los públicos del 13-11-2026. Cada dato lleva su origen: **[web]** leído hoy en la página que se "
    "cita, **[hoja]** documentación del fabricante, **[cálculo]** sale de `datos.py`, **[estimación]** "
    "cifra razonada, **[de memoria]** lo sé pero no lo he verificado hoy y **[sin confirmar]** hay que "
    "preguntarlo."
)

EN_CORTO = [
    "**El problema no es la empresa SumUp, es el tipo de aparato.** El Solo es un datáfono de mostrador con "
    "batería. Cambiarlo por otro de mostrador (Square, Stripe S700, Revolut, PayPal) deja la máquina igual.",
    "**Lo que lo arregla es un terminal para máquinas sin personal:** sin batería, alimentado por la "
    "máquina, con su propia SIM, enrasado en el frente y con cristal antivandálico. Varios cobran solos y "
    "avisan a la Pi con un pulso, como un monedero de monedas.",
    "**Mis tres primeras:** Payter Apollo, Nayax VPOS Touch y myPOS Sigma. La cuarta, Viva.com con un PAX "
    "IM30, es la que menos comisión se lleva.",
    "**Cuestan más que SumUp, pero poco:** con 5.000 pruebas al año, entre 20 y 345 € más por máquina y año "
    "**[cálculo]**. Un solo viaje a reparar una máquina cuesta más.",
    "**Pondría además un QR en la pantalla** como segundo cobro: si el terminal cae, la máquina sigue vendiendo.",
    "**La decisión es tuya** (te la reservaste) y toca otra regla tuya: no he visto ninguna de las cinco "
    "primeras en Amazon **[sin confirmar: Amazon no se deja leer desde aquí]**.",
]

HALLAZGOS = [
    (
        "Datáfono de mostrador o terminal de máquina",
        "El Solo trabaja de 0 a 40 °C, lleva batería y se puede bloquear para siempre con golpes o calor "
        "(ficha del repositorio). Un terminal de máquina no tiene batería, se alimenta de la máquina y está "
        "hecho para ir en un frente: el myPOS Sigma trabaja de −20 a 70 °C con IP65 e IK08, el Payter Apollo "
        "es IK09 y el Castles S1U2, IK10 **[hoja]**.",
    ),
    (
        "Cobro por pulsos: el terminal cobra solo",
        "Payter, Nayax y myPOS pueden fijar el importe en el terminal, cobrar con su propia conexión y mandar "
        "un pulso eléctrico cuando el pago está hecho **[web]**. La Pi solo lee ese pulso. Sobran la Cloud "
        "API, la consulta cada 3 segundos (del orden de 1 GB al mes, según el bloque 1) y la Wi-Fi entre la "
        "Pi y el lector. Si el módem de la Pi se cae, la máquina sigue cobrando y midiendo, y las fotos se "
        "suben cuando vuelva. Nayax y myPOS tienen además una entrada de inhibición **[hoja]**: en "
        "principio, la Pi puede decirle al terminal que no cobre si el sensor no responde **[sin confirmar]**.",
    ),
    (
        "Con 2 €, el fijo por operación manda",
        "Cada 0,05 € fijos son 2,5 puntos de comisión. Por eso Stripe (0,10 €), Adyen (0,11 €) y las "
        "pasarelas online (0,25 €) salen mal, y las de solo porcentaje salen bien **[cálculo]**.",
    ),
    (
        "El PIN",
        "La norma europea deja pagar por contactless sin PIN hasta 50 €, pero solo mientras no se pasen cinco "
        "pagos seguidos o 150 € acumulados desde la última vez que se pidió; la excepción para terminales sin "
        "personal solo cubre transporte y aparcamiento **[web: Reglamento 2018/389 y EBA]**. Con el Solo "
        "detrás de los policarbonatos nadie puede teclear el PIN, así que esos pagos con tarjeta física "
        "fallan. Con el móvil no suele pasar, porque Apple Pay y Google Pay ya identifican al cliente en "
        "cada pago **[de memoria]**. Un terminal con PIN en pantalla y el frente al alcance lo resuelve.",
    ),
    (
        "Bizum en el datáfono",
        "Desde el 18-05-2026 se puede pagar con Bizum por NFC en comercios. El despliegue es gradual y "
        "depende del banco y del comercio; los TPV Android de Redsys y Cecabank no necesitan cambiar de "
        "aparato **[web]**. Es un punto a favor de la vía con adquirente español (Paytef, Wipay, banco). "
        "Si SumUp, myPOS o Viva lo aceptan **[sin confirmar]**.",
    ),
    (
        "El frente de la máquina cambia",
        "Un terminal de máquina no va detrás de un policarbonato: va en un hueco del frente, con su propio "
        "cristal. Obliga a tocar el CAD, pero quita la duda mayor del bloque 1: si el pago sin contacto "
        "atraviesa dos policarbonatos y un marco de chapa (prueba A2). A cambio queda una pieza a la vista, "
        "y hay que elegirla por su resistencia a golpes.",
    ),
]
SOBRE_SUMUP = (
    "**Sobre el servicio de SumUp:** los monitores externos recogen varias incidencias en 2026, casi todas "
    "de minutos u horas: por ejemplo, 42 minutos de fallos con Mastercard el 15-08 y unas dos horas de "
    "pagos fallando el 27-06 según su página de estado de Estados Unidos **[web]**. No tengo datos para "
    "decir que sea peor que el de otros. El riesgo está en el aparato y en que su contrato no menciona el "
    "uso sin personal (ficha del repositorio)."
)

COMO_ORDEN = (
    "Siete criterios con su peso. Las notas son mías **[estimación]**: sirven para ordenar, no para medir. "
    "Entre dos opciones separadas por dos décimas manda el presupuesto que te den. La nota de cada "
    "criterio está en el anexo."
)
LEYENDA_TRAMOS = (
    "**1 a 5:** las probaría. **6 a 13:** válidas, a falta de presupuesto. **14 a 20:** no resuelven el "
    "problema o solo sirven de respaldo. El SumUp Solo, puntuado igual, saca un 6,7: cualquier datáfono de "
    "mostrador queda por debajo de lo que ya tienes."
)

PRESUP_INTRO = (
    "Precios públicos leídos el 13-11-2026, sin IVA salvo que se diga. No son ofertas en firme: la oferta "
    "de verdad la da cada proveedor cuando se le pide, y varios no publican nada."
)
PRESUP_NOTAS = [
    "Los volúmenes son supuestos míos, no datos: 1.500 pruebas al año son unas 4 al día y 10.000, unas 27.",
    "Nayax: cuota y comisiones de una tienda alemana; en España pueden ser otras. Aparato a 578 € (699 € con IVA).",
    "Viva: con el 1,69 % público y su mínimo de 0,03 €. Con un pack del 0,84 % quedaría en 0,03 € por prueba.",
    "Banco directo: ejemplo de oferta integrada publicada; el terminal suele ir en alquiler.",
    "MONEI: como si todo se pagara por Bizum (0,9 %); con tarjeta nacional sería la mitad. Aparte, 0,03 € al día por cuenta.",
    "Revolut: aparte, el plan de la cuenta (10 € al mes, uno para toda la flota).",
    "Adyen: sin contar su factura mínima mensual.",
]

AHORA = [
    "**Pedir cuatro presupuestos en firme:** Payter (por Eurocoin), Nayax (Nayaxvend Ibérica), Paytef y "
    "Wipay. Puedo mandar yo los correos desde tu Gmail, como con los fabricantes de chapa.",
    "**Comprar un myPOS Sigma para el banco de pruebas** (399–499 € + IVA): no ata a nada y sirve para "
    "validar el cobro por pulsos, el hueco del frente y la alimentación mientras llegan los presupuestos.",
    "**Elegir el terminal de la serie** con los presupuestos y esa prueba delante.",
    "**Añadir el QR** como segundo cobro cuando el primero funcione.",
]
PREGUNTAS = [
    "Comisión exacta para operaciones de 2 €, y si hay fijo o mínimo por operación o por mes.",
    "Cuotas, alta, permanencia y qué pasa al dar de baja un terminal.",
    "Si admiten la actividad (alcoholímetro recreativo en bares, sin personal), por escrito.",
    "Modo de importe fijo con salida de pulsos y entrada de inhibición: tensiones y esquema.",
    "Alimentación (5, 12 o 24 V) y consumo.",
    "Si la SIM va incluida, con qué operadores, y qué hace sin cobertura.",
    "PIN en pantalla y Bizum por NFC.",
    "IK, IP y temperatura de trabajo; medidas del hueco y cuánto sobresale del frente.",
    "Reembolso por API desde la Pi, o solo a mano desde el panel.",
    "Plazo de alta, garantía y cambio de un terminal averiado.",
]
CAMBIOS = [
    "**Chapa (bloque 3):** un hueco en el frente para el terminal en lugar de la ventana del Solo. El "
    "terminal sobresale unos milímetros o queda enrasado, según el modelo y el montaje.",
    "**Eléctrico (bloque 1):** una rama con la tensión del terminal (la LRS-50-5 solo da 5 V y el Sigma "
    "pide de 12 a 48 V) y dos optoacopladores, uno para el pulso y otro para la inhibición. Sobran la rama "
    "USB del Solo, el punto de acceso Wi-Fi de la Pi y el servo del plan B.",
    "**Programa (bloque 4):** un módulo de cobro nuevo y mucho más corto: pulso recibido, prueba pagada. "
    "El diario de cobros y la prueba pendiente tras un apagón se mantienen; el reembolso automático depende "
    "de lo que ofrezca el proveedor.",
    "**Datos:** la SIM de la Pi deja de gastar del orden de 1 GB al mes en preguntar por el cobro.",
]
DECISION = (
    "No he tocado `DECISIONES.md` ni el programa. Cambiar de sistema de cobro y comprar fuera de Amazon "
    "son dos decisiones que te reservaste."
)

NO_COMPROBADO = [
    "No he hablado con ningún proveedor: todo sale de páginas públicas.",
    "Tarifas de Nayax en España, precio español del myPOS Sigma y precio del IM30 con Viva.",
    "Cuotas de Paytef, Wipay, Worldline, Sipay y Orain: no publican nada.",
    "Que el Payter de Eurocoin lleve PIN; alimentación de Payter y Nayax; si la SIM va incluida en Nayax y myPOS.",
    "Que el plan MONEI Pay valga para cobros creados por API desde una máquina.",
    "Si alguno de estos aparatos se vende en Amazon.",
    "Nada está probado con hardware.",
]

ETIQ_CAMPOS = [
    ("que_es", "Qué es"),
    ("precio", "Precio"),
    ("integracion", "Conexión con la Pi"),
    ("a_favor", "A favor"),
    ("en_contra", "En contra"),
    ("opinion", "Mi opinión"),
]

GRUPOS_FUENTES = [
    ("Norma, Bizum y SumUp", ["rts_389", "eba_4038", "eba_5288", "bizum_legalitas", "bizum_tpv", "sumup_statusgator", "sumup_isdown", "sumup_inc_ago", "sumup_inc_jun", "sumup_precio"]),
]


# ---------------------------------------------------------------------------------------------
# Utilidades de texto
# ---------------------------------------------------------------------------------------------
def num(x, dec=2):
    return f"{x:,.{dec}f}".replace(",", "X").replace(".", ",").replace("X", ".")


def a_rl(t):
    """Marcado ligero (**negrita**, `código`, **[etiqueta]**) → marcado de ReportLab."""
    t = t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    t = re.sub(r"(\d) (%|€|£|°C|V\b|mm\b|GB\b|ms\b)", "\\1\u00a0\\2", t)
    t = re.sub(r"\*\*\[(.+?)\]\*\*", r'<font color="#8C5A12">[\1]</font>', t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"`(.+?)`", r'<font face="Mono" size="8.4">\1</font>', t)
    return t


def a_md(t):
    return t


# ---------------------------------------------------------------------------------------------
# Tablas de datos comunes a PDF y Markdown
# ---------------------------------------------------------------------------------------------
def filas_resumen():
    out = []
    for i, o in enumerate(D.ordenadas(), 1):
        pp = D.por_prueba(o.get("tarifa"))
        out.append({
            "n": i,
            "o": o,
            "nota": D.nota(o["notas"]),
            "pp": ("a presupuesto" if pp is None else "0 €" if pp == 0 else f"{num(pp, 3)} € ({num(100 * pp / D.PRECIO, 1)} %)"),
        })
    return out


def filas_calculo():
    out = []
    for o in [D.SUMUP] + D.ordenadas():
        t = o.get("tarifa")
        if not t:
            continue
        out.append({
            "nombre": o.get("corto", o["nombre"]),
            "pp": D.por_prueba(t),
            "anual": [D.anual(t, n) for n in D.VOLUMENES],
            "dos": D.dos_anios(t),
            "ref": o is D.SUMUP,
        })
    return out


# ---------------------------------------------------------------------------------------------
# PDF
# ---------------------------------------------------------------------------------------------
TINTA = colors.HexColor("#1E2329")
GRIS = colors.HexColor("#5B6470")
ROSA = colors.HexColor("#B4136A")
ROSA_CLARO = colors.HexColor("#FBEAF3")
CAJA = colors.HexColor("#F4F5F7")
RAYA = colors.HexColor("#D5D9DF")
BLANCO = colors.white

FUENTE_DIR = "/usr/share/fonts/truetype/crosextra"


def registrar_fuentes():
    pdfmetrics.registerFont(TTFont("Texto", os.path.join(FUENTE_DIR, "Carlito-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("Texto-B", os.path.join(FUENTE_DIR, "Carlito-Bold.ttf")))
    pdfmetrics.registerFont(TTFont("Texto-I", os.path.join(FUENTE_DIR, "Carlito-Italic.ttf")))
    pdfmetrics.registerFont(TTFont("Texto-BI", os.path.join(FUENTE_DIR, "Carlito-BoldItalic.ttf")))
    pdfmetrics.registerFontFamily("Texto", normal="Texto", bold="Texto-B", italic="Texto-I", boldItalic="Texto-BI")
    pdfmetrics.registerFont(TTFont("Mono", "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"))


def estilos():
    base = dict(fontName="Texto", textColor=TINTA, alignment=TA_LEFT)
    e = {}
    e["titulo"] = ParagraphStyle("titulo", fontName="Texto-B", fontSize=27, leading=31, textColor=TINTA)
    e["sub"] = ParagraphStyle("sub", fontName="Texto", fontSize=13.5, leading=18, textColor=GRIS)
    e["meta"] = ParagraphStyle("meta", fontName="Texto", fontSize=9, leading=12.5, textColor=GRIS)
    e["h1"] = ParagraphStyle("h1", fontName="Texto-B", fontSize=15.5, leading=19, textColor=TINTA, spaceBefore=14, spaceAfter=6)
    e["h2"] = ParagraphStyle("h2", fontName="Texto-B", fontSize=11.5, leading=15, textColor=TINTA, spaceBefore=9, spaceAfter=3)
    e["p"] = ParagraphStyle("p", fontSize=10, leading=14, spaceAfter=5, **base)
    e["li"] = ParagraphStyle("li", fontSize=10, leading=14, leftIndent=13, bulletIndent=1, spaceAfter=3.5, **base)
    e["nota"] = ParagraphStyle("nota", fontSize=8.6, leading=11.6, spaceAfter=2, fontName="Texto", textColor=GRIS)
    e["c"] = ParagraphStyle("c", fontSize=8.7, leading=11.2, **base)
    e["cb"] = ParagraphStyle("cb", fontName="Texto-B", fontSize=8.7, leading=11.2, textColor=TINTA)
    e["ch"] = ParagraphStyle("ch", fontName="Texto-B", fontSize=8.3, leading=10.6, textColor=GRIS)
    e["cd"] = ParagraphStyle("cd", fontSize=8.7, leading=11.2, alignment=2, **{k: v for k, v in base.items() if k != "alignment"})
    e["ficha"] = ParagraphStyle("ficha", fontSize=9.6, leading=13.2, spaceAfter=3.2, **base)
    e["fuentes"] = ParagraphStyle("fuentes", fontName="Texto", fontSize=8, leading=10.6, textColor=GRIS, spaceBefore=1)
    e["fnombre"] = ParagraphStyle("fnombre", fontName="Texto-B", fontSize=11.6, leading=14.2, textColor=TINTA)
    e["ftipo"] = ParagraphStyle("ftipo", fontName="Texto", fontSize=8.8, leading=11.5, textColor=GRIS)
    e["fnum"] = ParagraphStyle("fnum", fontName="Texto-B", fontSize=17, leading=19, textColor=BLANCO, alignment=1)
    e["fnota"] = ParagraphStyle("fnota", fontName="Texto-B", fontSize=12.5, leading=15, textColor=ROSA, alignment=2)
    e["src"] = ParagraphStyle("src", fontName="Texto", fontSize=8.4, leading=11.2, textColor=TINTA, leftIndent=9, bulletIndent=0, spaceAfter=1.2)
    return e


class LienzoNumerado(canvas.Canvas):
    """Pie con «página X de Y»."""

    def __init__(self, *a, **k):
        super().__init__(*a, **k)
        self._paginas = []

    def showPage(self):
        self._paginas.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._paginas)
        for estado in self._paginas:
            self.__dict__.update(estado)
            self._pie(total)
            super().showPage()
        super().save()

    def _pie(self, total):
        ancho, _ = A4
        self.setStrokeColor(RAYA)
        self.setLineWidth(0.5)
        self.line(17 * mm, 13.5 * mm, ancho - 17 * mm, 13.5 * mm)
        self.setFont("Texto", 8)
        self.setFillColor(GRIS)
        self.drawString(17 * mm, 9.5 * mm, PIE)
        self.drawRightString(ancho - 17 * mm, 9.5 * mm, f"página {self._pageNumber} de {total}")


def tabla(datos_tabla, anchos, estilo_extra=(), repetir=1):
    t = Table(datos_tabla, colWidths=anchos, repeatRows=repetir)
    estilo = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3.2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3.6),
        ("LINEBELOW", (0, 0), (-1, 0), 0.8, TINTA),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, RAYA),
    ]
    estilo.extend(estilo_extra)
    t.setStyle(TableStyle(estilo))
    return t


def enlaces_fuentes(claves):
    partes = []
    for k in claves:
        titulo, url = D.FUENTES[k]
        corto = titulo.split(":")[0]
        partes.append(f'<link href="{url}" color="#5B6470"><u>{a_rl(corto)}</u></link>')
    # quitar repetidos conservando el orden
    vistos, limpio = set(), []
    for p in partes:
        clave = re.sub(r"<.*?>", "", p)
        if clave not in vistos:
            vistos.add(clave)
            limpio.append(p)
    return "Fuentes: " + " · ".join(limpio)


def ficha_pdf(n, o, e, ancho):
    cab = Table(
        [[
            Paragraph(str(n), e["fnum"]),
            [Paragraph(a_rl(o["nombre"]), e["fnombre"]), Paragraph(a_rl(o["tipo"] + " · " + o["veredicto"]), e["ftipo"])],
            Paragraph(num(D.nota(o["notas"]), 1), e["fnota"]),
        ]],
        colWidths=[11 * mm, ancho - 11 * mm - 16 * mm, 16 * mm],
    )
    cab.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), ROSA if n <= 5 else (TINTA if n <= 13 else GRIS)),
        ("BACKGROUND", (1, 0), (-1, 0), CAJA),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (1, 0), (1, 0), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 4.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5.5),
        ("RIGHTPADDING", (2, 0), (2, 0), 7),
    ]))
    cuerpo = [cab, Spacer(1, 4)]
    for campo, etiqueta in ETIQ_CAMPOS:
        if o.get(campo):
            cuerpo.append(Paragraph(f"<b>{etiqueta}.</b> " + a_rl(o[campo]), e["ficha"]))
    if o.get("fuentes"):
        cuerpo.append(Paragraph(enlaces_fuentes(o["fuentes"]), e["fuentes"]))
    cuerpo.append(Spacer(1, 9))
    return KeepTogether(cuerpo)


def construir_pdf(ruta):
    registrar_fuentes()
    e = estilos()
    ancho = A4[0] - 34 * mm
    doc = SimpleDocTemplate(
        ruta, pagesize=A4, leftMargin=17 * mm, rightMargin=17 * mm, topMargin=16 * mm, bottomMargin=19 * mm,
        title="Cobrar sin el SumUp Solo: 20 alternativas", author="Claude, para Guillermo Aladro",
        subject="Alternativas de cobro con tarjeta para el alcoholímetro", lang="es",
    )
    h = []

    # --- portada ---
    h.append(Spacer(1, 6))
    h.append(Paragraph(TITULO, e["titulo"]))
    h.append(Spacer(1, 3))
    h.append(Paragraph(SUBTITULO, e["sub"]))
    h.append(Spacer(1, 5))
    h.append(Paragraph(f"Proyecto Alcoholímetro · {FECHA}", e["meta"]))
    h.append(Spacer(1, 9))
    caja = Table([[[Paragraph("En corto", e["h2"])] + [Paragraph(a_rl(t), e["li"], bulletText="•") for t in EN_CORTO]]], colWidths=[ancho])
    caja.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), ROSA_CLARO),
        ("LINEBEFORE", (0, 0), (0, -1), 2.5, ROSA),
        ("LEFTPADDING", (0, 0), (-1, -1), 11), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    h.append(caja)
    h.append(Spacer(1, 8))
    h.append(Paragraph(a_rl(AVISO), e["nota"]))

    # --- 1 ---
    h.append(Paragraph("1. Seis cosas que cambian el planteamiento", e["h1"]))
    for i, (tit, txt) in enumerate(HALLAZGOS, 1):
        h.append(KeepTogether([Paragraph(f"{i}. {a_rl(tit)}", e["h2"]), Paragraph(a_rl(txt), e["p"])]))
    h.append(Spacer(1, 2))
    h.append(Paragraph(a_rl(SOBRE_SUMUP), e["p"]))

    # --- 2 ---
    h.append(Paragraph("2. Cómo las he ordenado", e["h1"]))
    h.append(Paragraph(a_rl(COMO_ORDEN), e["p"]))
    dt = [[Paragraph("", e["ch"]), Paragraph("Criterio", e["ch"]), Paragraph("Peso", e["ch"]), Paragraph("Qué mira", e["ch"])]]
    for k, nombre, peso, que in D.CRITERIOS:
        dt.append([Paragraph(k, e["cb"]), Paragraph(a_rl(nombre), e["cb"]), Paragraph(f"{peso} %", e["c"]), Paragraph(a_rl(que), e["c"])])
    h.append(tabla(dt, [8 * mm, 58 * mm, 13 * mm, ancho - 79 * mm]))

    # --- 3 ---
    h.append(PageBreak())
    h.append(Paragraph("3. Las 20, de un vistazo", e["h1"]))
    h.append(Paragraph(a_rl(LEYENDA_TRAMOS), e["p"]))
    dt = [[Paragraph(x, e["ch"]) for x in ("N.º", "Solución", "Tipo", "Nota", "Por prueba de 2 €", "En una frase")]]
    extra = []
    for f in filas_resumen():
        o = f["o"]
        dt.append([
            Paragraph(str(f["n"]), e["cb"]),
            Paragraph(a_rl(o["corto"]), e["cb"]),
            Paragraph(a_rl(o["tipo"]), e["c"]),
            Paragraph(num(f["nota"], 1), e["cb"]),
            Paragraph(f["pp"], e["c"]),
            Paragraph(a_rl(o["veredicto"]), e["c"]),
        ])
        if f["n"] <= 5:
            extra.append(("BACKGROUND", (0, f["n"]), (-1, f["n"]), ROSA_CLARO))
        elif f["n"] >= 14:
            extra.append(("BACKGROUND", (0, f["n"]), (-1, f["n"]), CAJA))
    h.append(tabla(dt, [9 * mm, 38 * mm, 39 * mm, 11 * mm, 28 * mm, ancho - 125 * mm], extra))


    # --- 4 ---
    h.append(PageBreak())
    h.append(Paragraph("4. Presupuestos", e["h1"]))
    h.append(Paragraph(a_rl(PRESUP_INTRO), e["p"]))
    h.append(Paragraph("Lo que publica cada uno", e["h2"]))
    dt = [[Paragraph(x, e["ch"]) for x in ("N.º", "Solución", "Aparato", "Alta", "Cuota al mes", "Comisión")]]
    s = D.SUMUP
    dt.append([Paragraph("—", e["c"]), Paragraph("<i>SumUp Solo (hoy)</i>", e["c"])] + [Paragraph(a_rl(x), e["c"]) for x in s["tarifa_txt"]])
    for f in filas_resumen():
        o = f["o"]
        dt.append([Paragraph(str(f["n"]), e["c"]), Paragraph(a_rl(o["corto"]), e["cb"])] + [Paragraph(a_rl(x), e["c"]) for x in o["tarifa_txt"]])
    h.append(tabla(dt, [9 * mm, 40 * mm, 33 * mm, 22 * mm, 32 * mm, ancho - 136 * mm]))

    h.append(Spacer(1, 9))
    bloque = [Paragraph("Lo que sale al año por máquina <font color='#8C5A12'>[cálculo]</font>", e["h2"])]
    cab = ["Solución", "Por prueba"] + [f"{num(n, 0)} pruebas" for n in D.VOLUMENES] + ["Aparato y alta + 2 años a 5.000"]
    dt = [[Paragraph(cab[0], e["ch"])] + [Paragraph(x, ParagraphStyle("chd", parent=e["ch"], alignment=2)) for x in cab[1:]]]
    extra = []
    for i, f in enumerate(filas_calculo(), 1):
        est = e["c"] if not f["ref"] else ParagraphStyle("ci", parent=e["c"], fontName="Texto-I")
        dt.append([Paragraph(a_rl(f["nombre"]), est), Paragraph(("0 €" if f["pp"] == 0 else num(f["pp"], 3) + " €"), e["cd"])]
                  + [Paragraph(num(a, 0) + " €", e["cd"]) for a in f["anual"]]
                  + [Paragraph((num(f["dos"], 0) + " €") if f["dos"] is not None else "—", e["cd"])])
        if f["ref"]:
            extra.append(("BACKGROUND", (0, i), (-1, i), CAJA))
    bloque.append(tabla(dt, [50 * mm, 22 * mm, 25 * mm, 25 * mm, 25 * mm, ancho - 147 * mm], extra))
    bloque.append(Spacer(1, 4))
    h.append(KeepTogether(bloque))
    for t in PRESUP_NOTAS:
        h.append(Paragraph(a_rl(t), e["nota"], bulletText="·"))

    # --- 5 ---
    h.append(PageBreak())
    h.append(Paragraph("5. Ficha y opinión de cada una", e["h1"]))
    tramos = {1: "Las probaría", 6: "Válidas, a falta de presupuesto", 14: "No resuelven el problema o solo sirven de respaldo"}
    for f in filas_resumen():
        if f["n"] in tramos:
            h.append(Paragraph(tramos[f["n"]], e["h2"]))
            h.append(Spacer(1, 2))
        h.append(ficha_pdf(f["n"], f["o"], e, ancho))

    # --- 6 ---
    h.append(Paragraph("6. Qué haría yo ahora", e["h1"]))
    for i, t in enumerate(AHORA, 1):
        h.append(Paragraph(a_rl(t), e["li"], bulletText=f"{i}."))
    h.append(Paragraph("Qué preguntar a cada proveedor", e["h2"]))
    for t in PREGUNTAS:
        h.append(Paragraph(a_rl(t), e["li"], bulletText="•"))
    h.append(Paragraph("Qué cambia en la máquina con un terminal por pulsos", e["h2"]))
    for t in CAMBIOS:
        h.append(Paragraph(a_rl(t), e["li"], bulletText="•"))
    h.append(Spacer(1, 3))
    h.append(Paragraph(a_rl(DECISION), e["p"]))

    # --- 7 ---
    h.append(Paragraph("7. Lo que no he podido comprobar", e["h1"]))
    for t in NO_COMPROBADO:
        h.append(Paragraph(a_rl(t), e["li"], bulletText="•"))

    # --- anexo ---
    anexo = [Paragraph("Anexo. Nota por criterio", e["h1"])]
    dt = [[Paragraph(x, e["ch"]) for x in ["N.º", "Solución"] + [c[0] for c in D.CRITERIOS] + ["Nota"]]]
    for f in filas_resumen():
        o = f["o"]
        dt.append([Paragraph(str(f["n"]), e["c"]), Paragraph(a_rl(o["corto"]), e["c"])]
                  + [Paragraph(num(o["notas"][c[0]], 1).replace(",0", ""), e["c"]) for c in D.CRITERIOS]
                  + [Paragraph(num(f["nota"], 1), e["cb"])])
    s = D.SUMUP
    dt.append([Paragraph("—", e["c"]), Paragraph("<i>SumUp Solo (hoy)</i>", e["c"])]
              + [Paragraph(num(s["notas"][c[0]], 1).replace(",0", ""), e["c"]) for c in D.CRITERIOS]
              + [Paragraph(num(D.nota(s["notas"]), 1), e["cb"])])
    anexo.append(tabla(dt, [9 * mm, 52 * mm] + [13.5 * mm] * 7 + [ancho - 61 * mm - 94.5 * mm]))
    anexo.append(Spacer(1, 3))
    anexo.append(Paragraph("A fiabilidad · B robustez · C coste · D integración · E contratación · F flota · G facilidad para el cliente.", e["nota"]))
    h.append(KeepTogether(anexo))

    # --- fuentes ---
    h.append(Paragraph("Fuentes", e["h1"]))
    h.append(Paragraph("Consultadas el 13-11-2026. Los datos del SumUp Solo y de la máquina salen del repositorio "
                       "(<font face='Mono' size='8'>componentes/sumup-solo/README.md</font> y el bloque 1 de componentes).", e["nota"]))
    h.append(Spacer(1, 3))
    usadas = set()
    for titulo_g, claves in grupos_fuentes():
        grupo = []
        for k in claves:
            if k in usadas:
                continue
            usadas.add(k)
            titulo_f, url = D.FUENTES[k]
            grupo.append(Paragraph(f'{a_rl(titulo_f)} — <link href="{url}" color="#5B6470">{a_rl(url)}</link>', e["src"], bulletText="·"))
        if grupo:
            h.append(KeepTogether([Paragraph(a_rl(titulo_g), e["h2"])] + grupo))

    doc.build(h, canvasmaker=LienzoNumerado)


def grupos_fuentes():
    g = list(GRUPOS_FUENTES)
    for f in filas_resumen():
        o = f["o"]
        if o.get("fuentes"):
            g.append((f"{f['n']}. {o['corto']}", o["fuentes"]))
    return g


# ---------------------------------------------------------------------------------------------
# Markdown
# ---------------------------------------------------------------------------------------------
def construir_md(ruta):
    L = []
    w = L.append
    s = D.SUMUP
    w(f"# {TITULO}\n")
    w(f"**{SUBTITULO}** · Proyecto Alcoholímetro · {FECHA}\n")
    w(f"Versión para imprimir: [{NOMBRE}.pdf]({NOMBRE}.pdf). Las cuentas salen de [`datos.py`](datos.py).\n")
    w("## En corto\n")
    for t in EN_CORTO:
        w(f"- {t}")
    w("")
    w(f"> {AVISO}\n")
    w("## 1. Seis cosas que cambian el planteamiento\n")
    for i, (tit, txt) in enumerate(HALLAZGOS, 1):
        w(f"**{i}. {tit}.** {txt}\n")
    w(SOBRE_SUMUP + "\n")
    w("## 2. Cómo las he ordenado\n")
    w(COMO_ORDEN + "\n")
    w("| | Criterio | Peso | Qué mira |\n|---|---|---|---|")
    for k, nombre, peso, que in D.CRITERIOS:
        w(f"| {k} | {nombre} | {peso} % | {que} |")
    w("")
    w("## 3. Las 20, de un vistazo\n")
    w(LEYENDA_TRAMOS + "\n")
    w("| N.º | Solución | Tipo | Nota | Por prueba de 2 € | En una frase |\n|---|---|---|---|---|---|")
    for f in filas_resumen():
        o = f["o"]
        w(f"| {f['n']} | **{o['corto']}** | {o['tipo']} | {num(f['nota'], 1)} | {f['pp']} | {o['veredicto']} |")
    w("")
    w("## 4. Presupuestos\n")
    w(PRESUP_INTRO + "\n")
    w("### Lo que publica cada uno\n")
    w("| N.º | Solución | Aparato | Alta | Cuota al mes | Comisión |\n|---|---|---|---|---|---|")
    w("| — | *SumUp Solo (hoy)* | " + " | ".join(s["tarifa_txt"]) + " |")
    for f in filas_resumen():
        o = f["o"]
        w(f"| {f['n']} | **{o['corto']}** | " + " | ".join(o["tarifa_txt"]) + " |")
    w("")
    w("### Lo que sale al año por máquina **[cálculo]**\n")
    w("| Solución | Por prueba | " + " | ".join(f"{num(n, 0)} pruebas" for n in D.VOLUMENES) + " | Aparato y alta + 2 años a 5.000 |\n|---|---:|---:|---:|---:|---:|")
    for f in filas_calculo():
        nombre = f"*{f['nombre']}*" if f["ref"] else f["nombre"]
        w(f"| {nombre} | {'0' if f['pp'] == 0 else num(f['pp'], 3)} € | " + " | ".join(num(a, 0) + " €" for a in f["anual"]) + " | " + ((num(f["dos"], 0) + " €") if f["dos"] is not None else "—") + " |")
    w("")
    for t in PRESUP_NOTAS:
        w(f"- {t}")
    w("")
    w("## 5. Ficha y opinión de cada una\n")
    tramos = {1: "Las probaría", 6: "Válidas, a falta de presupuesto", 14: "No resuelven el problema o solo sirven de respaldo"}
    for f in filas_resumen():
        o = f["o"]
        if f["n"] in tramos:
            w(f"### {tramos[f['n']]}\n")
        w(f"#### {f['n']}. {o['nombre']} — {num(f['nota'], 1)}\n")
        w(f"*{o['tipo']} · {o['veredicto']}*\n")
        for campo, etiqueta in ETIQ_CAMPOS:
            if o.get(campo):
                w(f"- **{etiqueta}.** {o[campo]}")
        if o.get("fuentes"):
            w("- Fuentes: " + " · ".join(f"[{D.FUENTES[k][0].split(':')[0]}]({D.FUENTES[k][1]})" for k in o["fuentes"]))
        w("")
    w("## 6. Qué haría yo ahora\n")
    for i, t in enumerate(AHORA, 1):
        w(f"{i}. {t}")
    w("\n### Qué preguntar a cada proveedor\n")
    for t in PREGUNTAS:
        w(f"- {t}")
    w("\n### Qué cambia en la máquina con un terminal por pulsos\n")
    for t in CAMBIOS:
        w(f"- {t}")
    w("\n" + DECISION + "\n")
    w("## 7. Lo que no he podido comprobar\n")
    for t in NO_COMPROBADO:
        w(f"- {t}")
    w("\n## Anexo. Nota por criterio\n")
    w("| N.º | Solución | " + " | ".join(c[0] for c in D.CRITERIOS) + " | Nota |\n|---|---|" + "---|" * 8)
    for f in filas_resumen():
        o = f["o"]
        w(f"| {f['n']} | {o['corto']} | " + " | ".join(num(o["notas"][c[0]], 1).replace(",0", "") for c in D.CRITERIOS) + f" | **{num(f['nota'], 1)}** |")
    s = D.SUMUP
    w("| — | *SumUp Solo (hoy)* | " + " | ".join(num(s["notas"][c[0]], 1).replace(",0", "") for c in D.CRITERIOS) + f" | **{num(D.nota(s['notas']), 1)}** |")
    w("\nA fiabilidad · B robustez · C coste · D integración · E contratación · F flota · G facilidad para el cliente.\n")
    w("\n## Fuentes\n")
    w("Consultadas el 13-11-2026. Los datos del SumUp Solo y de la máquina salen del repositorio "
      "([ficha del SumUp Solo](../sumup-solo/README.md) y el bloque 1 de componentes).\n")
    usadas = set()
    for titulo_g, claves in grupos_fuentes():
        nuevas = [k for k in claves if k not in usadas]
        if not nuevas:
            continue
        usadas.update(nuevas)
        w(f"**{titulo_g}**\n")
        for k in nuevas:
            w(f"- [{D.FUENTES[k][0]}]({D.FUENTES[k][1]})")
        w("")
    with open(ruta, "w", encoding="utf-8") as fh:
        fh.write("\n".join(L).rstrip() + "\n")


if __name__ == "__main__":
    construir_pdf(os.path.join(AQUI, NOMBRE + ".pdf"))
    construir_md(os.path.join(AQUI, NOMBRE + ".md"))
    print("hecho:", NOMBRE + ".pdf", "y", NOMBRE + ".md")
