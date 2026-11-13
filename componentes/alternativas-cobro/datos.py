# -*- coding: utf-8 -*-
"""
Alternativas al SumUp Solo para cobrar la prueba del alcoholímetro (13-11-2026).

Este archivo guarda los datos y las cuentas. `generar.py` saca de aquí el PDF y el Markdown.
Para repetir las cuentas:  python3 datos.py

Etiquetas de origen, como en el resto del proyecto:
  [web]        leído por mí el 13-11-2026 en la página que se cita
  [hoja]       hoja de datos o documentación técnica del fabricante
  [cálculo]    sale de las funciones de este archivo
  [estimación] cifra razonada, sin dato del proveedor
  [sin confirmar] hay que preguntarlo antes de decidir
"""

PRECIO = 2.00  # euros por prueba (programa/config.ejemplo.json: precio_centimos = 200)
VOLUMENES = (1500, 5000, 10000)  # pruebas al año por máquina: tres supuestos, no datos medidos

# --------------------------------------------------------------------------------------------
# Criterios y pesos de la nota (0 a 10). Las notas son mi valoración [estimación].
# --------------------------------------------------------------------------------------------
CRITERIOS = [
    ("A", "Fiabilidad 24/7 y autonomía", 30,
     "Aparato sin batería que arranca solo, conexión propia, cobra aunque falle lo demás, historial del proveedor."),
    ("B", "Robustez física y diseño para máquina", 15,
     "Hecho para ir enrasado en un frente sin personal: golpes (IK), agua (IP), temperatura."),
    ("C", "Coste con una prueba de 2 €", 15,
     "Comisión, fijo por operación y cuotas. Con 2 € el fijo manda."),
    ("D", "Integración con la Raspberry Pi", 10,
     "Cuánto hay que cambiar en el programa y en el cableado, y cuánto puede fallar."),
    ("E", "Contratar en España y empezar con una unidad", 10,
     "Precio público, alta por internet, sin mínimos ni permanencia."),
    ("F", "Gestión remota y flota", 5,
     "Ver desde lejos el estado de cada terminal, alertas, recambios."),
    ("G", "Facilidad de pago para el cliente", 15,
     "Acercar la tarjeta o el móvil y listo, frente a sacar el móvil y escanear."),
]
PESOS = {c[0]: c[2] for c in CRITERIOS}


def nota(n):
    """Nota ponderada 0-10 a partir de un dict {A..G: 0-10}."""
    return sum(n[k] * PESOS[k] for k in PESOS) / 100.0


# --------------------------------------------------------------------------------------------
# Cuentas de coste
# --------------------------------------------------------------------------------------------
def por_prueba(t, precio=PRECIO):
    """Coste de una operación: porcentaje + fijo, con mínimo por operación si lo hay."""
    if t is None:
        return None
    return max(precio * t.get("pct", 0.0) + t.get("fijo", 0.0), t.get("min_op", 0.0))


def anual(t, n, precio=PRECIO):
    """Coste de un año con n pruebas: comisiones (con mínimo mensual si lo hay) + cuotas por máquina."""
    if t is None:
        return None
    comisiones = max(n * por_prueba(t, precio), 12 * t.get("min_mes", 0.0))
    return comisiones + 12 * t.get("cuota_mes", 0.0)


def dos_anios(t, n=5000):
    """Aparato + alta + dos años de uso con n pruebas al año."""
    if t is None or t.get("aparato") is None:
        return None
    return t["aparato"] + t.get("alta", 0.0) + 2 * anual(t, n)


# --------------------------------------------------------------------------------------------
# Referencia: lo que hay hoy
# --------------------------------------------------------------------------------------------
SUMUP = {
    "id": "sumup",
    "nombre": "SumUp Solo (lo que hay hoy)",
    "tarifa": {"pct": 0.0149, "aparato": 79.0},
    "tarifa_txt": ("79 € + IVA", "—", "0 €", "1,49 %"),
    "notas": {"A": 4.5, "B": 3, "C": 9.5, "D": 10, "E": 10, "F": 5.5, "G": 8},
}

# --------------------------------------------------------------------------------------------
# Las 20 alternativas. El orden final lo da la nota.
#   tarifa: números para las cuentas (None = solo con presupuesto)
#   tarifa_txt: (aparato, alta, cuota al mes, comisión) tal como se publica
# --------------------------------------------------------------------------------------------
OPCIONES = [
    {
        "id": "payter",
        "nombre": "Payter Apollo + adquirente (Elavon / Excell Pay)",
        "corto": "Payter Apollo",
        "tipo": "Terminal desatendido",
        "veredicto": "El más robusto y el más barato de los «de verdad»",
        "tarifa": {"pct": 0.02, "min_mes": 5.0, "cuota_mes": 11.5, "aparato": 627.0, "alta": 12.5},
        "tarifa_txt": ("627 € + IVA", "12,50 €", "11,50 € (6,50 sin su SIM)", "2,00 %, mínimo 5 €/mes"),
        "notas": {"A": 9, "B": 9.5, "C": 6.5, "D": 9, "E": 6.5, "F": 8.5, "G": 10},
        "que_es": (
            "Terminal holandés hecho solo para máquinas sin personal (vending, recreativas, cargadores de "
            "coche). Pantalla táctil de 3,5\", 4G, Wi-Fi y LAN, lector de QR, sensor de proximidad, IK09 "
            "antivandálico y PIN en pantalla **[hoja: folleto SuzoHapp]**. En España lo vende Eurocoin Components."
        ),
        "precio": (
            "**627 € + IVA** en Eurocoin, hoy sin stock **[web]**. Alta 12,50 €. Al mes: 2,50 € de servicio, "
            "4 € de pasarela y 5 € de SIM (opcional). Comisión del **2,00 % con un mínimo de 5 € al mes**, "
            "con Elavon / Excell Pay; se puede usar otro adquirente compatible **[web]**. En el Reino Unido "
            "se vende a 585 £ con cuotas de 7 a 11 £ y 12 meses de permanencia **[web]**."
        ),
        "integracion": (
            "Tres vías **[web: Eurocoin]**: **pulsos** (importe fijo: cobra y manda un pulso, que la Pi lee "
            "por un GPIO con optoacoplador), **MDB** (la máquina pide el importe y recibe la confirmación) "
            "o librerías para integrarlo por programa."
        ),
        "a_favor": (
            "Sin batería. Pensado para ir enrasado en el frente. Panel MyPayter con el estado de cada "
            "terminal. Es la opción barata entre las que están hechas para esto."
        ),
        "en_contra": (
            "Dos contratos (Payter y el adquirente) y alta de hasta 10 días **[web: Monta]**. La ficha de "
            "Eurocoin lo describe como contactless sin PIN: hay que confirmar que la versión trae PIN. "
            "Alimentación (lo normal son 12–24 V) y permanencia en España **[sin confirmar]**."
        ),
        "opinion": (
            "Es la que probaría primero. Junta lo que pides: aguanta golpes, cobra sola con su SIM y se "
            "conecta a la Pi como un monedero. Con 5.000 pruebas al año sale unos 190 € más cara que SumUp "
            "**[cálculo]**. La pega es el papeleo con el adquirente; si Elavon pone problemas con la "
            "actividad, pasa a la siguiente."
        ),
        "fuentes": ["eurocoin", "suzohapp", "payter_uk", "monta"],
    },
    {
        "id": "nayax",
        "nombre": "Nayax VPOS Touch",
        "corto": "Nayax VPOS Touch",
        "tipo": "Terminal desatendido",
        "veredicto": "La apuesta segura; la más cara por uso",
        "tarifa": {"pct": 0.035, "cuota_mes": 12.0, "aparato": 578.0, "alta": 45.0},
        "tarifa_txt": ("430 a 975 € según tienda", "45 €", "12 €", "3,5 % (4 % por debajo de 2 €)"),
        "notas": {"A": 9.5, "B": 8, "C": 4, "D": 9, "E": 8, "F": 10, "G": 9.5},
        "que_es": (
            "El nombre más conocido en máquinas sin personal: vending, lavanderías, sillones de masaje, "
            "fotomatones. Un solo proveedor pone el terminal, la adquirencia y el panel con telemetría y "
            "alertas. 3G/4G y Ethernet **[web]**, cristal Gorilla antivandálico y sensores de puerta "
            "abierta y de temperatura **[hoja: manual VPOS Touch]**."
        ),
        "precio": (
            "Terminal: 652,50 € (Grupo Innovaly), 699 € con IVA (Eurochip), 975 € + IVA con cable y alta "
            "(Hostelería10); 430 € en una tienda alemana **[web]**. Esa tienda alemana publica las cuotas: "
            "**12 € al mes**, alta de 45 € y comisión por tramos: **4 % por debajo de 2 €, 3,5 % de 2 a 5 €** "
            "y 2,95 % por encima **[web; en España sin confirmar]**. Nayax dice que no hay permanencia **[web]**."
        ),
        "integracion": (
            "**Pulsos**: 6 entradas/salidas y una entrada de inhibición **[hoja]**, que en principio sirve "
            "para que la máquina le diga «no cobres» **[sin confirmar]**. También MDB, o **Marshall** "
            "(RS-232 con SDK en C para Linux), en el que la máquina confirma si la venta se entregó, pero "
            "que obliga a certificar la integración con Nayax **[web: Nayax DevZone]**."
        ),
        "a_favor": (
            "Trabaja justo tu tipo de máquina: su tienda lista atracciones infantiles, fotomatones y "
            "sillones de masaje, y dice tener más de 95.000 operadores **[web]**. Alertas en tiempo real y "
            "ventas de cada máquina en el panel **[web]**. Distribuidor en España (Nayaxvend Ibérica)."
        ),
        "en_contra": (
            "El más caro: con 2 € se lleva 7 céntimos por prueba más la cuota. Un anuncio español dice que "
            "no incluye SIM ni alta: confirmarlo. PIN en su pantalla de 2,4\" **[sin confirmar]**. Hay "
            "alguna opinión de cliente muy mala **[web]**."
        ),
        "opinion": (
            "Si prefieres pagar más a cambio de no pensar, es esta: un contrato, un panel y un teléfono al "
            "que llamar. Con 5.000 pruebas al año son unos 345 € más que SumUp **[cálculo]**. Pediría su "
            "presupuesto a la vez que el de Payter y decidiría con los dos en la mano."
        ),
        "fuentes": ["nayax_innovaly", "nayax_eurochip", "nayax_h10", "nayax_de", "nayax_manual", "nayax_sdk", "nayax_shop", "nayax_hostelearte", "nayax_guia", "nayax_opinion"],
    },
    {
        "id": "mypos",
        "nombre": "myPOS Sigma",
        "corto": "myPOS Sigma",
        "tipo": "Terminal desatendido",
        "veredicto": "Sin cuotas y se compra hoy; ideal para el prototipo",
        "tarifa": {"pct": 0.0169, "fijo": 0.05, "aparato": 449.0},
        "tarifa_txt": ("399 a 499 € + IVA", "0 €", "0 €", "1,69 % + 0,05 €"),
        "notas": {"A": 8, "B": 8.5, "C": 6, "D": 8.5, "E": 9.5, "F": 6, "G": 10},
        "que_es": (
            "Terminal desatendido de myPOS, proveedor europeo de datáfonos con cuenta propia. Android 11, pantalla de "
            "5\", **IP65 e IK08, de −20 a 70 °C**, 4G, Wi-Fi, LAN y Bluetooth; se alimenta a 12–48 V en "
            "continua **[hoja: ficha myPOS]**."
        ),
        "precio": (
            "**399 a 499 € + IVA** según la tienda **[web: tiendas y comparativas francesas; la ficha "
            "española no da precio]**. Sin cuota mensual. **1,69 % + 0,05 €** con tarjetas de particulares "
            "del EEE; una comparativa española habla de 1,45 % + 0,05 € **[web]**. El dinero entra al momento "
            "en la cuenta myPOS; pasarlo a tu banco cuesta 3–4 € por transferencia **[web: comparativas]**."
        ),
        "integracion": (
            "App **myPOS Pulse**: importe fijo y pulso de 30, 50 o 100 ms por un pin de salida; tiene pines "
            "de entrada y opciones de inhibición **[hoja: documentación myPOS]**. También MDB y RS-232, USB "
            "o TCP/IP con SDK."
        ),
        "a_favor": (
            "Alta por internet, sin contrato ni mínimos. Rango térmico de sobra para tu caja. Es la forma "
            "más rápida de tener un cobro desatendido funcionando."
        ),
        "en_contra": (
            "Los 5 céntimos fijos pesan: 4,2 % efectivo sobre 2 € **[cálculo]**. Hay quejas de cuentas "
            "bloqueadas en opiniones de usuarios **[web]**. Panel de flota básico. Necesita 12 V (tu fuente "
            "da 5 V). SIM incluida **[sin confirmar]**."
        ),
        "opinion": (
            "Para el banco de pruebas es la mejor: se compra por internet y no te ata a nada. Para la flota me fío "
            "algo menos que de Payter o Nayax, que solo viven de máquinas. Con pocas pruebas al año es la "
            "más barata de las tres porque no tiene cuota."
        ),
        "fuentes": ["mypos_ficha", "mypos_pulse", "mypos_unatt", "mypos_precio", "mypos_tarifas", "mypos_es", "mypos_mr"],
    },
    {
        "id": "viva",
        "nombre": "Viva.com + PAX IM30",
        "corto": "Viva.com + PAX IM30",
        "tipo": "Terminal desatendido + API",
        "veredicto": "La que menos comisión se lleva",
        "tarifa": {"pct": 0.0169, "min_op": 0.03, "aparato": 500.0},
        "tarifa_txt": ("≈ 500 € [estimación]", "0 €", "0 €", "1,69 % (mín. 0,03 €); packs desde 0,84 %"),
        "notas": {"A": 7.5, "B": 8, "C": 9.5, "D": 8, "E": 6, "F": 7, "G": 10},
        "que_es": (
            "Viva.com (entidad de pagos europea con sucursal en España) con su app de terminal sobre un "
            "**PAX IM30**, un terminal Android para máquinas: Ethernet, Wi-Fi y 4G, montable, IP54 e IK08 "
            "**[web: Viva y PAX]**."
        ),
        "precio": (
            "Comisión orientativa del **1,69 %** para tarjetas de particulares del EEE en sus webs de "
            "Francia, Portugal e Italia, con un **mínimo de 0,03 € por operación**; la web española anuncia "
            "«packs desde el 0,84 %» al registrarse y devolución de comisiones si gastas con su tarjeta "
            "**[web]**. Sin cuota publicada. El IM30 ronda los 500–575 € en tiendas; con Viva, a consultar "
            "**[estimación]**."
        ),
        "integracion": (
            "**Cloud Terminal API** (como ahora con SumUp: la Pi pide el cobro por internet) o **Local "
            "Terminal API** (por la red local, sin pasar por la nube para hablar con el terminal) **[web]**. "
            "La app tiene un modo desatendido **[web: guía de Ventrata]**. Anuncian pagos sin conexión."
        ),
        "a_favor": (
            "Coste por prueba casi igual al de SumUp, pero con un terminal hecho para máquinas. El cambio "
            "en el programa es pequeño: sustituir `sumup.js` por otro cliente."
        ),
        "en_contra": (
            "Con la API en la nube el cobro sigue dependiendo del internet de la Pi. Android: más cosas que "
            "se pueden colgar. Hay que hablar con ventas para el IM30 y para el uso sin personal."
        ),
        "opinion": (
            "Si acabas con muchas máquinas es la que deja más margen: unos 170 € al año con 5.000 pruebas, "
            "20 € más que SumUp **[cálculo]**. La pongo cuarta porque no cobra sola por pulsos y porque me "
            "falta confirmar con Viva el suministro del terminal."
        ),
        "fuentes": ["viva_api", "viva_disp", "viva_es", "viva_pt", "viva_ventrata", "pax_im30", "pax_precio"],
    },
    {
        "id": "paytef",
        "nombre": "Paytef + tu banco (Redsys)",
        "corto": "Paytef + banco",
        "tipo": "Pasarela española + terminal desatendido",
        "veredicto": "La vía seria cuando haya muchas máquinas",
        "tarifa": None,
        "tarifa_txt": ("a presupuesto", "a presupuesto", "cuota (soporte 24×7 incluido)", "la tasa de tu banco"),
        "notas": {"A": 8.5, "B": 8, "C": 8.5, "D": 6, "E": 5, "F": 8, "G": 10},
        "que_es": (
            "Pasarela presencial española. Tú eliges banco adquirente (uno o varios) y Paytef pone el "
            "puente y la API entre tu programa y el terminal. Trabaja con terminales atendidos y "
            "desatendidos; está certificada con Redsys para la gama PAX, incluido el IM30, y con el pinpad "
            "desatendido de Ingenico **[web]**."
        ),
        "precio": (
            "No publica tarifas: cuota por terminal con soporte 24 horas incluido **[web]**, más la tasa del "
            "banco. Como referencia de tasa bancaria integrada: **0,35 % en débito y 0,50 % en crédito, "
            "19 € al mes y 49 € de alta** (oferta de Comercia con TPVOnline) **[web]**. En general los "
            "bancos cobran del 0,3 al 1,5 % y de 5 a 40 € al mes **[web: comparativas]**."
        ),
        "integracion": (
            "API REST con JSON y SDK; también MDB y Executive para vending **[web]**. Hay que integrar y "
            "pasar su puesta en marcha."
        ),
        "a_favor": (
            "Porcentaje bajo y sin fijo por operación. Si un banco falla o sube precios, cambias de banco "
            "sin tocar la máquina. Al ser adquirencia española, es la vía natural para Bizum por NFC "
            "**[estimación]**."
        ),
        "en_contra": (
            "Dos contratos y más papeleo. Cuotas fijas cada mes, vendas o no. Nada de precios públicos: "
            "todo con presupuesto."
        ),
        "opinion": (
            "Con una máquina no compensa. Con veinte, probablemente sí. Pediría presupuesto ya para saber "
            "el número, aunque el prototipo se haga con otra."
        ),
        "fuentes": ["paytef_pres", "paytef_pax", "paytef_iun", "paytef_en", "comercia_tpvonline", "rankia_tpv", "batemat"],
    },
    {
        "id": "wipay",
        "nombre": "Wipay (terminal Android QPayPos)",
        "corto": "Wipay",
        "tipo": "Adquirente español + terminal desatendido",
        "veredicto": "Un solo proveedor español con experiencia en vending",
        "tarifa": None,
        "tarifa_txt": ("a presupuesto", "a presupuesto", "a presupuesto", "a medida"),
        "notas": {"A": 8, "B": 7.5, "C": 7, "D": 7, "E": 5.5, "F": 8, "G": 10},
        "que_es": (
            "Marca de Global Payment Systems S.L. (Jaén), entidad de pago autorizada por el Banco de "
            "España, con adquirencia propia de Visa y Mastercard y terminales Android QPayPos para vending, "
            "parking, lavandería y carga de coches **[web]**."
        ),
        "precio": "Precio a medida; no publican tarifas **[web]**.",
        "integracion": (
            "Su integración del terminal Q5000 en neveras inteligentes se hizo entera en la nube y por API "
            "**[web: nota de prensa]**."
        ),
        "a_favor": (
            "Terminal y adquirencia con la misma empresa, española y centrada en máquinas sin personal. "
            "Llevan todo el parque del operador Arbitrade **[web]**."
        ),
        "en_contra": "Empresa pequeña. Sin precios ni documentación técnica públicos.",
        "opinion": (
            "Merece un correo pidiendo presupuesto junto al de Paytef: si su comisión no lleva fijo, "
            "puede competir con las cuatro primeras."
        ),
        "fuentes": ["wipay_4yfn", "wipay_forbes", "wipay_selfly", "wipay_pp"],
    },
    {
        "id": "worldline",
        "nombre": "Worldline WL Vending Suite (Valina, Self/2000 LE, Castles S1U2)",
        "corto": "Worldline Vending Suite",
        "tipo": "Terminal desatendido + pasarela",
        "veredicto": "Hardware excelente, trato de gran cuenta",
        "tarifa": None,
        "tarifa_txt": ("a presupuesto", "a presupuesto", "a presupuesto", "a medida"),
        "notas": {"A": 8.5, "B": 9, "C": 5.5, "D": 6, "E": 4, "F": 8, "G": 10},
        "que_es": (
            "La oferta de Worldline para vending en España: terminales desatendidos con PIN, de hasta IK10 "
            "e IP65, más pasarela, con adquirencia propia o de terceros «a la carta» **[web: folleto español]**."
        ),
        "precio": "Solo con presupuesto.",
        "integracion": (
            "Protocolos de vending y las interfaces de Worldline; en su web suiza piden certificar la "
            "máquina completa **[web]**. En España **[sin confirmar]**."
        ),
        "a_favor": "Terminales de los más duros (hasta IK10) y un grupo enorme detrás.",
        "en_contra": "Pensado para operadores con volumen e integradores; lento y caro para empezar con una unidad.",
        "opinion": "Para dentro de dos años, si la flota crece. Hoy no perdería tiempo aquí.",
        "fuentes": ["worldline_es", "worldline_ch"],
    },
    {
        "id": "qr_monei",
        "nombre": "QR en la pantalla con MONEI (Bizum, Apple Pay, Google Pay, tarjeta)",
        "corto": "QR + MONEI",
        "tipo": "Sin terminal: paga con el móvil",
        "veredicto": "Como segundo canal, sí; como único cobro, no",
        "tarifa": {"pct": 0.009},
        "tarifa_txt": ("0 €", "0 €", "0,03 €/día por cuenta", "0,45 % tarjeta nacional · 0,9 % Bizum"),
        "notas": {"A": 7.5, "B": 10, "C": 8, "D": 7, "E": 8.5, "F": 8, "G": 3.5},
        "que_es": (
            "La pantalla enseña un QR, el cliente paga en su móvil y la Pi recibe la confirmación. MONEI es "
            "una pasarela española con licencia del Banco de España y Bizum **[web]**."
        ),
        "precio": (
            "Plan **MONEI Pay** (tienda física): 0,45 % con tarjeta nacional, 1,65 % de la UE, 2,95 % de "
            "empresa o de fuera, **0,9 % con Bizum** y 0,03 € al día **[web: soporte de MONEI]**. Ojo: su "
            "plan online lleva fijo (0,90 % + 0,25 € más intercambio; Bizum 1,29 % + 0,25 € + 0,17 €) "
            "**[web]**, y con 2 € eso no sale. Hay que confirmar que un cobro creado por API desde una "
            "máquina entra en MONEI Pay **[sin confirmar]**."
        ),
        "integracion": "API de pagos: crear el cobro, pintar el QR y esperar la confirmación.",
        "a_favor": (
            "No hay lector que romper ni ventana que atravesar. Coste de aparato cero. Bizum tiene más de "
            "30 millones de usuarios **[web]**."
        ),
        "en_contra": (
            "Sacar el móvil, escanear y confirmar: de madrugada se pierde venta. Depende del internet de la "
            "Pi y de que el cliente tenga cobertura dentro del bar."
        ),
        "opinion": (
            "Lo añadiría sea cual sea el terminal: si el terminal cae, la máquina sigue vendiendo. Como "
            "único cobro no lo pondría."
        ),
        "fuentes": ["monei_fees", "monei_bizum", "monei_stripe", "bizum_tpv"],
    },
    {
        "id": "mollie",
        "nombre": "Mollie + PAX IM30",
        "corto": "Mollie + PAX IM30",
        "tipo": "Terminal desatendido + API",
        "veredicto": "Buena API; falta confirmar España y tarifa",
        "tarifa": None,
        "tarifa_txt": ("a consultar", "0 €", "0 €", "sin publicar para España"),
        "notas": {"A": 7.5, "B": 8, "C": 5, "D": 8.5, "E": 5, "F": 7, "G": 10},
        "que_es": (
            "Pasarela holandesa. Su documentación recoge el PAX IM30 como terminal para cobro desatendido, "
            "por Ethernet o Wi-Fi y sin 4G **[web: docs de Mollie]**."
        ),
        "precio": (
            "En España vende pagos presenciales con otros terminales (A920 Pro y A35) **[web]**; la tarifa "
            "presencial y si sirven aquí el IM30 **[sin confirmar]**."
        ),
        "integracion": (
            "Una sola API: se crea el pago con el identificador del terminal y se consulta su estado "
            "**[web]**. Es casi lo mismo que hace hoy `sumup.js`."
        ),
        "a_favor": "Integración sencilla y bien documentada. Sin cuotas ni permanencia en sus tarifas estándar.",
        "en_contra": "Sin 4G propio en el IM30 de Mollie: dependería siempre de la red de la Pi. Faltan datos de España.",
        "opinion": "Solo la miraría si Viva no da el IM30: es el mismo aparato con otra pasarela.",
        "fuentes": ["mollie_im30", "mollie_int", "mollie_es"],
    },
    {
        "id": "banco",
        "nombre": "Banco directo con TPV desatendido (Comercia/CaixaBank, Sabadell, BBVA, Santander)",
        "corto": "Banco directo",
        "tipo": "Banco + terminal de vending",
        "veredicto": "Barato por operación, difícil de integrar",
        "tarifa": {"pct": 0.0045, "cuota_mes": 19.0, "aparato": None, "alta": 49.0},
        "tarifa_txt": ("alquiler", "49 € (ejemplo)", "19 € (ejemplo)", "0,35 % débito · 0,50 % crédito (ejemplo)"),
        "notas": {"A": 8, "B": 8, "C": 8, "D": 3.5, "E": 4, "F": 6, "G": 10},
        "que_es": (
            "Contratar el TPV con el banco y que ponga un terminal de vending como el Ingenico Self/2000: "
            "solo contactless, IK09, PIN en pantalla y 4G opcional **[hoja: Ingenico]**."
        ),
        "precio": (
            "Tasas del 0,3 al 1,5 % y cuota de 5 a 40 € al mes **[web: comparativas]**. Ejemplo publicado: "
            "0,35 % / 0,50 %, 19 € al mes y 49 € de alta **[web]**. CaixaBank tiene tarifa plana desde 12 € "
            "al mes hasta 2.000 € de facturación, pero es para su TPV de mostrador **[web]**."
        ),
        "integracion": (
            "Aquí está el problema: el banco no te da una API web, sino su protocolo de TPV integrado, con "
            "homologación **[de memoria, sin verificar hoy]**. Para eso existen Paytef y similares."
        ),
        "a_favor": "La comisión más baja y Bizum por NFC en cuanto el banco lo active.",
        "en_contra": "Integración pesada, alta lenta, cuotas fijas y un gestor de banco que no sabe de máquinas.",
        "opinion": "No iría directo al banco: iría con Paytef o Wipay y que ellos traigan el banco.",
        "fuentes": ["ingenico_self", "comercia_tpvonline", "rankia_tpv", "batemat", "caixabank"],
    },
    {
        "id": "adyen",
        "nombre": "Adyen + Castles S1U2",
        "corto": "Adyen + Castles S1U2",
        "tipo": "Terminal desatendido + API",
        "veredicto": "Lo mejor técnicamente; solo para empresas grandes",
        "tarifa": {"pct": 0.009, "fijo": 0.11, "aparato": None},
        "tarifa_txt": ("a presupuesto", "0 €", "factura mínima", "≈ 0,11 € + intercambio + 0,60 %"),
        "notas": {"A": 9, "B": 10, "C": 1.5, "D": 8, "E": 1.5, "F": 9, "G": 10},
        "que_es": (
            "El S1U2 es un terminal Android desatendido de exterior con eSIM de serie: si falla la red "
            "pasa solo a 4G, y tiene modo quiosco **[hoja: manual de Adyen]**; el fabricante lo da como "
            "IK10 e IP65 **[hoja]**."
        ),
        "precio": (
            "Unos 0,11 € fijos por operación más intercambio y un 0,60 %: cerca de **0,13 € por prueba** "
            "**[cálculo]**. Además hay una factura mínima mensual que Adyen no publica; terceros hablan de "
            "100 a 1.000 € al mes **[web]**."
        ),
        "integracion": "Terminal API, por la nube o en local. Muy buena.",
        "a_favor": "El terminal más duro de la lista (IK10), con 4G de respaldo de serie, y una plataforma de pagos de primera fila.",
        "en_contra": "El fijo de 0,11 € se come el 5,5 % de cada prueba y la factura mínima lo descarta con pocas máquinas.",
        "opinion": "Descartada hoy. Tenla en mente si algún día hay cientos de máquinas y negocias precio.",
        "fuentes": ["adyen_s1u2", "castles_s1u2", "adyen_es", "adyen_nerd", "adyen_eightx", "adyen_mm"],
    },
    {
        "id": "orain",
        "nombre": "Orain (Barcelona)",
        "corto": "Orain",
        "tipo": "Sistema de pago para vending por suscripción",
        "veredicto": "Cuota fija sin comisión: puede salir muy bien o muy mal",
        "tarifa": None,
        "tarifa_txt": ("sin inversión inicial", "0 €", "suscripción (a presupuesto)", "sin comisión por operación"),
        "notas": {"A": 7.5, "B": 7, "C": 7, "D": 6.5, "E": 6, "F": 7, "G": 9},
        "que_es": (
            "Empresa de Barcelona con sistemas de pago para vending, lavanderías, parkings y lavado de "
            "coches: tarjeta contactless, Apple Pay, Google Pay y su propia app **[web]**."
        ),
        "precio": (
            "Cuota mensual o anual, **sin costes de integración, sin negociar con bancos y sin comisión por "
            "operación** **[web: preguntas frecuentes de Orain]**; modelo de suscripción sin inversión "
            "inicial **[web: prensa]**. La cifra, a presupuesto."
        ),
        "integracion": "Va cableado al sistema de cobro de la máquina **[web]**; con una máquina propia, MDB o pulsos **[sin confirmar]**.",
        "a_favor": "Con pruebas de 2 €, una cuota fija sin porcentaje puede ser lo más barato si la máquina trabaja.",
        "en_contra": "Con una máquina que venda poco, la cuota se lo come. Empuja a usar su app. Poca información técnica.",
        "opinion": "Pediría el precio de la cuota: si son menos de 15 € al mes por máquina, sube varios puestos.",
        "fuentes": ["orain_faq", "orain_prensa", "orain_blog"],
    },
    {
        "id": "sipay",
        "nombre": "Sipay",
        "corto": "Sipay",
        "tipo": "Pasarela española + terminal",
        "veredicto": "Otra española a la que pedir precio",
        "tarifa": None,
        "tarifa_txt": ("a presupuesto", "a presupuesto", "a presupuesto", "a medida"),
        "notas": {"A": 7.5, "B": 8, "C": 6, "D": 6, "E": 4.5, "F": 7, "G": 10},
        "que_es": (
            "Fintech española de pagos con más de 30 años. Ofrece terminales certificados de mano, de "
            "mostrador y desatendidos, con su app sobre Android y modo sin conexión **[web]**."
        ),
        "precio": "Solo con presupuesto.",
        "integracion": "Terminal integrado con tu sistema o independiente **[web]**; detalles **[sin confirmar]**.",
        "a_favor": "Española, con soporte aquí y cobro sin conexión.",
        "en_contra": "Orientada a comercio y hostelería más que a máquinas. Sin precios públicos.",
        "opinion": "Tercera en la lista de correos a pasarelas españolas, después de Paytef y Wipay.",
        "fuentes": ["sipay"],
    },
    {
        "id": "qr_stripe",
        "nombre": "QR en la pantalla con Stripe (Payment Links o Checkout)",
        "corto": "QR + Stripe",
        "tipo": "Sin terminal: paga con el móvil",
        "veredicto": "Se monta en un día, pero se lleva el 14 %",
        "tarifa": {"pct": 0.015, "fijo": 0.25},
        "tarifa_txt": ("0 €", "0 €", "0 €", "1,5 % + 0,25 €"),
        "notas": {"A": 7.5, "B": 10, "C": 1, "D": 9, "E": 9.5, "F": 8, "G": 3.5},
        "que_es": "Igual que el anterior, con Stripe: QR, página de pago con Apple Pay y Google Pay, y confirmación a la Pi.",
        "precio": (
            "**1,5 % + 0,25 €** con tarjetas europeas estándar **[web: Stripe España]**: 0,28 € de cada "
            "prueba de 2 € **[cálculo]**."
        ),
        "integracion": "Para mí, la mejor documentada. Los enlaces de pago se convierten en QR **[web]**.",
        "a_favor": "Nada que romper, alta en minutos, sin cuotas.",
        "en_contra": "El fijo de 0,25 € lo hace carísimo con 2 €. La misma fricción de móvil que el otro QR.",
        "opinion": "Solo como respaldo de emergencia mientras no esté MONEI: mejor cobrar 1,72 € que nada.",
        "fuentes": ["stripe_precio", "stripe_links"],
    },
    {
        "id": "stripe_s700",
        "nombre": "Stripe Terminal (Reader S700 / S710)",
        "corto": "Stripe S700 / S710",
        "tipo": "Datáfono de mostrador con API",
        "veredicto": "Mejor API, mismo problema físico y 4 veces más caro",
        "tarifa": {"pct": 0.014, "fijo": 0.10, "aparato": 259.0},
        "tarifa_txt": ("259 € + IVA", "0 €", "0 €", "1,4 % + 0,10 €"),
        "notas": {"A": 6.5, "B": 4.5, "C": 2.5, "D": 9.5, "E": 9, "F": 8, "G": 9},
        "que_es": (
            "Lector Android de Stripe para mostrador o mano. El S710 añade 4G de respaldo y está "
            "disponible en España **[web]**."
        ),
        "precio": "**259 € + IVA** el S700 y **1,4 % + 0,10 €** por cobro con tarjetas del EEE **[web]**: 0,128 € por prueba **[cálculo]**.",
        "integracion": (
            "Integración por servidor, muy parecida a la de SumUp. El modo sin conexión solo funciona con "
            "sus SDK, no con la integración por servidor **[web: docs de Stripe]**."
        ),
        "a_favor": "Plataforma muy sólida y gestión de lectores a distancia.",
        "en_contra": (
            "El único lector desatendido de Stripe, el Verifone UX700, solo se ofrece en Estados Unidos "
            "**[web]**. El S700 es otro aparato de mostrador con batería, y el fijo de 0,10 € pesa mucho."
        ),
        "opinion": "No cambia nada de lo que te preocupa y cuesta cuatro veces más por prueba. Fuera.",
        "fuentes": ["stripe_precio", "stripe_terminal", "stripe_unatt", "stripe_offline", "stripe_s710"],
    },
    {
        "id": "square",
        "nombre": "Square Terminal + Terminal API",
        "corto": "Square Terminal",
        "tipo": "Datáfono de mostrador con API",
        "veredicto": "Otro datáfono de mostrador",
        "tarifa": {"pct": 0.0125, "fijo": 0.05, "aparato": 165.0},
        "tarifa_txt": ("165 € + IVA", "0 €", "0 €", "1,25 % + 0,05 €"),
        "notas": {"A": 5.5, "B": 3.5, "C": 6, "D": 8.5, "E": 8.5, "F": 6, "G": 9},
        "que_es": "Datáfono todo en uno con impresora. Su Terminal API está disponible en España desde el lanzamiento **[web]**.",
        "precio": "**165 € + IVA** (el hub para Ethernet, 59 €) y **1,25 % + 0,05 €** **[web]**: 0,075 € por prueba **[cálculo]**.",
        "integracion": "La Pi manda el cobro al terminal por la API de Square.",
        "a_favor": "Barato de comprar y fácil de dar de alta.",
        "en_contra": "Aparato de mostrador con batería e impresora; necesita Wi-Fi o Ethernet. Más caro que SumUp por prueba.",
        "opinion": "Es cambiar un Solo por otro Solo más grande. No.",
        "fuentes": ["square_hw", "square_api", "square_fee"],
    },
    {
        "id": "revolut",
        "nombre": "Revolut Terminal",
        "corto": "Revolut Terminal",
        "tipo": "Datáfono de mostrador",
        "veredicto": "Comisión muy baja, sin forma de mandarle cobros",
        "tarifa": {"pct": 0.008, "fijo": 0.02, "aparato": 189.0},
        "tarifa_txt": ("189 € + IVA", "0 €", "plan de cuenta (10 €)", "0,8 % + 0,02 €"),
        "notas": {"A": 5, "B": 3.5, "C": 9, "D": 3, "E": 8, "F": 5, "G": 9},
        "que_es": "Datáfono de Revolut Business con eSIM integrada **[web]**.",
        "precio": (
            "**189 € + IVA** y **0,8 % + 0,02 €** con tarjetas de particulares nacionales y europeas "
            "**[web]**: 0,036 € por prueba **[cálculo]**. Hace falta cuenta Revolut Business; el plan "
            "básico figura a 10 € **[web: prensa]**."
        ),
        "integracion": "No he encontrado una API para lanzar cobros a un terminal desde un servidor, sin su app **[sin confirmar]**.",
        "a_favor": "La comisión con fijo más baja de la lista.",
        "en_contra": "Aparato de mostrador y, hasta donde he visto, sin integración posible con la Pi.",
        "opinion": "Descartada mientras no haya API. Aunque la hubiera, es otro datáfono de mostrador.",
        "fuentes": ["revolut_precio", "revolut_terminal", "revolut_comp", "revolut_prensa"],
    },
    {
        "id": "softpos",
        "nombre": "Cobro en un móvil Android dentro de la caja (Tap to Pay)",
        "corto": "Android con Tap to Pay",
        "tipo": "SoftPOS",
        "veredicto": "Todo de Amazon, pero no está pensado para esto",
        "tarifa": {"pct": 0.0169, "min_op": 0.03, "aparato": 150.0},
        "tarifa_txt": ("≈ 150 € [estimación]", "0 €", "0 €", "la del proveedor (p. ej. Viva)"),
        "notas": {"A": 4, "B": 3, "C": 9.5, "D": 6, "E": 5, "F": 5, "G": 8.5},
        "que_es": (
            "Un Android con NFC detrás de la ventana, con la app de un proveedor que cobre sin lector. "
            "Viva dice que su app va en cualquier Android 8.1 o superior con NFC y anuncia Tap to Pay para "
            "cobro desatendido **[web]**."
        ),
        "precio": "El móvil y la comisión del proveedor.",
        "integracion": "Con Viva, la misma API que con el IM30.",
        "a_favor": "Es la única alternativa que se compra entera en Amazon.",
        "en_contra": (
            "El estándar de cobro en móvil está pensado para cobros con personal; para máquinas se siguen "
            "usando terminales específicos **[web: Paytef]**. Un móvil de consumo siempre cargando tiene el "
            "mismo problema de batería y calor que el Solo."
        ),
        "opinion": "No la recomiendo: cambia un aparato de consumo por otro.",
        "fuentes": ["viva_guia", "viva_unatt", "paytef_softpos"],
    },
    {
        "id": "zettle",
        "nombre": "PayPal Reader (Zettle)",
        "corto": "PayPal / Zettle",
        "tipo": "Lector de mostrador",
        "veredicto": "Peor que lo que ya tienes",
        "tarifa": {"pct": 0.0175},
        "tarifa_txt": ("sin precio español a mano", "0 €", "0 €", "1,75 %"),
        "notas": {"A": 4.5, "B": 3, "C": 9, "D": 3, "E": 6, "F": 4, "G": 9},
        "que_es": "El lector de PayPal, antes Zettle.",
        "precio": "**1,75 %** por cobro en sus tarifas europeas **[web]**; precio del lector en España **[sin confirmar]**.",
        "integracion": "Existe una API para manejar el lector (Reader Connect), pero solo para socios aprobados **[web]**.",
        "a_favor": "Sin cuotas.",
        "en_contra": "Lector con batería, integración cerrada y más caro que SumUp.",
        "opinion": "Descartada.",
        "fuentes": ["zettle_api", "zettle_fee"],
    },
    {
        "id": "monedas",
        "nombre": "Monedero de monedas como respaldo",
        "corto": "Monedero de monedas",
        "tipo": "Efectivo",
        "veredicto": "Lo que querías dejar atrás",
        "tarifa": {"pct": 0.0, "aparato": 30.0},
        "tarifa_txt": ("≈ 30 € [estimación]", "0 €", "0 €", "0 %"),
        "notas": {"A": 3, "B": 5, "C": 7, "D": 9, "E": 10, "F": 1, "G": 5},
        "que_es": "Un selector de monedas con salida de pulsos, en paralelo con el cobro con tarjeta.",
        "precio": "Unos 20–40 € el selector **[estimación]** y ninguna comisión.",
        "integracion": "Un pulso a un GPIO, igual que un terminal por pulsos.",
        "a_favor": "Cobra aunque no haya internet ni proveedor de pagos.",
        "en_contra": "Se atasca, invita a forzar la máquina y obliga a ir a recaudar: lo contrario de «no ir nunca».",
        "opinion": "Solo si un local lo exige. Va en contra de la razón por la que rediseñas la máquina.",
        "fuentes": [],
    },
]

# --------------------------------------------------------------------------------------------
# Fuentes (consultadas el 13-11-2026)
# --------------------------------------------------------------------------------------------
FUENTES = {
    # contexto
    "eba_4038": ("EBA, pregunta 2018_4038: contactless y límites sin autenticación reforzada", "https://eba.europa.eu/single-rule-book-qa/qna/view/publicId/2018_4038"),
    "eba_5288": ("EBA, pregunta 2020_5288: lector solo contactless en máquinas de vending", "https://eba.europa.eu/single-rule-book-qa/qna/view/publicId/2020_5288"),
    "rts_389": ("Reglamento Delegado (UE) 2018/389, artículos 11 y 12", "https://www.legislation.gov.uk/eur/2018/389/chapter/III/data.xht"),
    "bizum_legalitas": ("Legálitas: Bizum en comercios físicos (04-09-2026)", "https://www.legalitas.com/actualidad/bizum-en-comercios"),
    "bizum_tpv": ("Ecosistema Startup: Bizum por NFC y TPV Android de Redsys y Cecabank", "https://ecosistemastartup.com/?p=81625"),
    "sumup_statusgator": ("StatusGator: historial de incidencias de SumUp", "https://statusgator.com/services/sumup"),
    "sumup_isdown": ("IsDown: incidencias de SumUp", "https://isdown.app/status/sumup"),
    "sumup_inc_ago": ("IsDown: fallos con Mastercard y Maestro en SumUp (15-08-2026)", "https://isdown.app/status/sumup/incidents/638878-elevated-card-payment-failures-mastercard-maestro"),
    "sumup_inc_jun": ("SumUp, página de estado (EE. UU.): pagos fallando (27-06-2026)", "https://status.sumup.com/usa/incidents/01KW4PXNYDDPRXZQ3GS5ZQA6CY"),
    "sumup_precio": ("SumUp: comparación con Stripe (1,49 %, Solo a 79 € sin IVA)", "https://www.sumup.com/es-es/compare/sumup-vs-stripe/"),
    # Payter
    "eurocoin": ("Eurocoin Components: Payter Apollo, precio y cuotas", "https://eurocoin.es/en/producto/payter-apollo/"),
    "suzohapp": ("SuzoHapp: folleto del Payter Apollo", "https://oem.suzohapp.com/wp-content/uploads/2023/12/SH-PayterApollo-flyer-A4-EN.pdf"),
    "payter_uk": ("TOB International: Payter Apollo en el Reino Unido", "https://tobinternational.co.uk/product/payter-apollo-modem/"),
    "monta": ("Monta: alta de un terminal Payter", "https://monta.com/en/help-center/set-up-payter-terminal/"),
    # Nayax
    "nayax_innovaly": ("Grupo Innovaly: Nayax VPOS Touch", "https://www.grupoinnovaly.com/tienda/electronica-e-informatica/127-nayax-vpos-touch-amarillo.html"),
    "nayax_eurochip": ("Eurochip: Nayax VPOS Touch", "https://eurochip.es/inicio/265-nayax-pos-vpos-touch.html"),
    "nayax_h10": ("Hostelería10: Nayax VPOS Touch con cable y alta", "https://hosteleria10.com/lavado/lavadoras/nayax-lector-tarjetas-vpos-touch.html"),
    "nayax_de": ("Vapemaxx (Alemania): Nayax VPOS Touch, cuotas y comisiones", "https://www.vapemaxx.de/en/products/nayax-vpos-touch-kartenterminal"),
    "nayax_manual": ("Manual del VPOS Touch (copia en FCC)", "https://fcc.report/FCC-ID/2AK6L-VPOST/3770077.pdf"),
    "nayax_sdk": ("Nayax DevZone: SDK Marshall en C", "https://devzone.nayax.com/docs/integrate-pos-device/marshall/get-started/c-sdk-integration"),
    "nayax_hostelearte": ("Hostelearte: Nayax VPOS Touch, conectividad", "https://hostelearte.com/limpieza-higiene-para-bares-y-restaurantes/lavadoras-industriales-y-profesionales/lavadoras-autoservicio-industriales/lector-nayax-vpos-touch-tarjeta-nfc-qr"),
    "nayax_guia": ("VMFS: guía de lectores Nayax (pantalla de 2,4 pulgadas)", "https://vmfsusa.com/blogs/business/nayax-vending-card-reader-guide"),
    "nayax_opinion": ("SourceForge: opiniones sobre Nayax", "https://sourceforge.net/software/product/Nayax"),
    "nayax_shop": ("Tienda de Nayax para España", "https://shop.nayax.com/es_es"),
    # myPOS
    "mypos_ficha": ("myPOS España: solución de pago sin supervisión (Sigma)", "https://www.mypos.com/es-es/comprar-datafono/unattended-payment-solution"),
    "mypos_pulse": ("myPOS Developers: comunicación por pulsos", "https://developers.mypos.com/in-person-payments/unattended-solutions/pulse-communication"),
    "mypos_unatt": ("myPOS Developers: soluciones desatendidas", "https://developers.mypos.com/in-person-payments/unattended-solutions"),
    "mypos_precio": ("Mon Petit Paiement: myPOS Sigma, precio y comisión", "https://mon-petit-paiement.com/mypos-sigma-avis/"),
    "mypos_tarifas": ("TPE Carte Bancaire: tarifas de myPOS y precio del Sigma", "https://tpecartebancaire.fr/es/content/10-tarifas-terminal-mypos"),
    "mypos_es": ("Sincomisiones: opinión y comisiones de myPOS en España", "https://sincomisiones.org/mypos-opinion"),
    "mypos_mr": ("MoneyRadar: tarifas de myPOS y coste de las transferencias", "https://moneyradar.org/banque/mypos/"),
    # Viva
    "viva_api": ("Viva.com España: formas de integración del terminal", "https://www.viva.com/es-es/vendor-solutions/integrations"),
    "viva_disp": ("Viva.com España: dispositivos compatibles (PAX IM30)", "https://www.viva.com/es-es/vendor-solutions/supported-devices"),
    "viva_es": ("Viva.com España: pagos y precios", "https://www.viva.com/es-es/payments"),
    "viva_pt": ("Viva.com Portugal: tabla de precios", "https://www.viva.com/pt-pt/pricing"),
    "viva_ventrata": ("Ventrata: puesta en marcha del IM30 con Viva", "https://support.ventrata.com/en/articles/10130788-how-to-set-up-the-im30-payment-terminal"),
    "viva_guia": ("Viva.com: guía para elegir dispositivos", "https://intercom.help/vivacomeu/es/articles/10210826-guia-para-elegir-dispositivos-de-viva-com"),
    "viva_unatt": ("Viva.com: soluciones de cobro desatendido", "https://viva.com/en-eu/businesses/unattended-payment-solutions"),
    "pax_im30": ("PAX: IM30", "https://www.paxtechnology.com/im30"),
    "pax_precio": ("eBay: PAX IM30 nuevo (499,99 £)", "https://www.ebay.de/itm/176681789622"),
    # Paytef y banca
    "paytef_pres": ("Paytef: pagos presenciales", "https://paytef.es/presencial/"),
    "paytef_pax": ("PAX: Paytef y la certificación Redsys de la gama PAX", "https://www.paxtechnology.es/blog/paytef-despliega-innovadoras-soluciones-de-terminales-de-pago-pax-android-en"),
    "paytef_iun": ("Paytef: pinpad desatendido de Ingenico", "https://paytef.es/noticias/pin-pad-desatendido-iun-iself-series/"),
    "paytef_en": ("Paytef: preguntas frecuentes", "https://paytef.es/en/"),
    "paytef_softpos": ("Paytef: qué es el SoftPOS y sus límites", "https://paytef.es/que-es-el-softpos/"),
    "comercia_tpvonline": ("TPVOnline: oferta integrada con Comercia Global Payments", "https://www.tpvonline.es/comercia-global-payments-cms-112-50-1821-1844/"),
    "rankia_tpv": ("Rankia: comisiones de TPV en España en 2026", "https://rankiabusiness.com/comisiones-tpv/"),
    "batemat": ("Batemat: comisiones y cuotas de TPV de los bancos", "https://batemat.es/comisiones-tpv-cuanto-cobran-los-bancos-tipos-de-tarifa-y-como-reducir-el-coste/"),
    "caixabank": ("CaixaBank: tarifas MyCommerce+", "https://www.caixabank.es/empresa/negocios/tpv-mini.html"),
    "ingenico_self": ("Ingenico: hoja del Self/2000", "https://ingenico.com/sites/default/files/resource-document/2023-10/SELF%202000%20datasheet_OCT23.pdf"),
    # Wipay, Worldline, Sipay, Orain
    "wipay_4yfn": ("4YFN: ficha de Wipay", "https://www.4yfn.com/exhibitors/28157-wipay"),
    "wipay_forbes": ("Forbes España: Arbitrade y Wipay", "https://forbes.es/?p=876295"),
    "wipay_selfly": ("Diario Estrategia: Wipay y el terminal Q5000 en neveras inteligentes", "https://www.diarioestrategia.cl/texto-diario/mostrar/5324829/wipay-impulsa-tecnologia-retail-integracion-pago-tarjeta-neveras-inteligentes"),
    "wipay_pp": ("PaymentProviders: ficha de Wipay", "https://paymentproviders.io/providers/wipay"),
    "worldline_es": ("Worldline España: folleto de WL Vending Suite", "https://worldline.com/content/dam/worldline/local/es-es/documents/brochures/brochure-vending-suite-es.pdf"),
    "worldline_ch": ("Worldline: terminales desatendidos", "https://worldline.com/en-ch/home/main-navigation/solutions/merchants/solutions-and-services/terminals/unattended-payment-terminals"),
    "sipay": ("Sipay: pagos presenciales", "https://sipay.es/en/products/in-person-payments/"),
    "orain_faq": ("Orain: preguntas frecuentes", "https://www.orain.io/en/faqs/"),
    "orain_prensa": ("Hostelvending: Orain y su modelo de suscripción", "https://www.hostelvending.com/noticias-vending/orain-consigue-3-millones-de-euros-para-rentabilizar-los-micropagos-digitales"),
    "orain_blog": ("Orain: sistemas de pago para máquinas expendedoras", "https://www.orain.io/es/blog/sistemas-de-pago-para-maquinas-expendedoras"),
    # QR
    "monei_fees": ("MONEI: tarifas", "https://support.monei.com/hc/en-us/articles/360017954318-MONEI-fees"),
    "monei_bizum": ("MONEI: Bizum", "https://monei.com/payment-methods/bizum/"),
    "monei_stripe": ("MONEI frente a Stripe", "https://monei.com/stripe-alternative/"),
    "stripe_precio": ("Stripe España: tarifas", "https://stripe.com/es/pricing"),
    "stripe_links": ("Stripe España: plataforma de pagos y enlaces con QR", "https://stripe.com/es/lp/payments/payments-platform"),
    # Mollie, Adyen
    "mollie_im30": ("Mollie: terminal PAX IM30", "https://docs.mollie.com/docs/im30-terminal"),
    "mollie_int": ("Mollie: integrar terminales", "https://docs.mollie.com/docs/integrating-mollie-terminals"),
    "mollie_es": ("Mollie España: terminales de pago", "https://www.mollie.com/es/growth/payment-terminal-eol-pci-compliance-guide"),
    "adyen_s1u2": ("Adyen: manual del S1U2", "https://docs.adyen.com/point-of-sale/user-manuals/s1u2-user-manual"),
    "castles_s1u2": ("Castles Technology: hoja del S1U2", "https://cdn-assets.inwink.com/0b61be1d-c656-4312-87f7-eaf7cbc154b7/be2e9770-21fa-4cbc-9c7c-af7a890230d2"),
    "adyen_es": ("Adyen España: Castles S1U2", "https://www.adyen.com/es_ES/dispositivos-tpv/castles-s1u2"),
    "adyen_nerd": ("NerdWallet: precios de Adyen", "https://www.nerdwallet.com/business/software/learn/adyen"),
    "adyen_eightx": ("EightX: cuánto cuesta Adyen", "https://eightx.co/blog/compare/how-much-does-adyen-cost"),
    "adyen_mm": ("Merchant Maverick: Adyen", "https://www.merchantmaverick.com/reviews/adyen-review/"),
    # mostrador
    "stripe_terminal": ("Stripe Terminal en España: lectores y precio", "https://stripe.com/en-es/terminal"),
    "stripe_unatt": ("Stripe: Terminal en entornos con y sin personal", "https://support.stripe.com/questions/using-terminal-in-attended-semi-attended-and-unattended-retail-environments"),
    "stripe_offline": ("Stripe: guía de integración de Terminal (modo sin conexión)", "https://docs.stripe.com/extensibility/terminal-for-pos-partners"),
    "stripe_s710": ("Stripe: Reader S710 y países", "https://stripe.com/en-ch/terminal/s710"),
    "square_hw": ("Square España: Square Terminal", "https://squareup.com/es/es/hardware/terminal"),
    "square_api": ("Square: lanzamiento en España y Terminal API", "https://developer.squareup.com/blog/square-launches-in-spain/"),
    "square_fee": ("SumUp: comparación con Square (comisiones)", "https://www.sumup.com/es-es/compare/sumup-vs-square/"),
    "revolut_precio": ("Revolut España: precios de aceptación de pagos", "https://revolut.com/es-ES/business/accept-payments-pricing"),
    "revolut_terminal": ("Revolut España: Terminal", "https://revolut.com/es-ES/business/revolut-terminal"),
    "revolut_comp": ("Revolut: comparación de terminales y precio", "https://www.revolut.com/ca-ES/business/in-person-payments-comparison/"),
    "revolut_prensa": ("Finantres: Revolut Business para cobrar con tarjeta", "https://finantresnoticias.com/negocios-y-autonomos/revolut-business-cobrar-tarjeta-comisiones-liquidacion/"),
    "zettle_api": ("Supergood: la API de Zettle", "https://supergood.ai/api-report-card/zettle"),
    "zettle_fee": ("Spendways: PayPal POS, comisiones", "https://www.spendways.com/produit/paypal-pos/"),
}


def ordenadas():
    """Las 20, de mayor a menor nota."""
    return sorted(OPCIONES, key=lambda o: -nota(o["notas"]))


def eur(x, dec=0):
    """Número con formato español: 1.234,56"""
    if x is None:
        return "—"
    s = f"{x:,.{dec}f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return s + " €"


if __name__ == "__main__":
    print(f"Prueba de {PRECIO:.2f} €. Pruebas al año: {VOLUMENES}\n")
    filas = [SUMUP] + ordenadas()
    print(f"{'':3}{'Solución':28}{'nota':>6}{'€/prueba':>10}{'%':>7}" + "".join(f"{n:>9}" for n in VOLUMENES) + f"{'2 años':>10}")
    for i, o in enumerate(filas):
        t = o.get("tarifa")
        pp = por_prueba(t)
        an = [anual(t, n) for n in VOLUMENES]
        da = dos_anios(t)
        nombre = o.get("corto", o["nombre"])[:27]
        print(
            f"{(str(i) if i else '-'):3}{nombre:28}{nota(o['notas']):6.2f}"
            + (f"{pp:10.4f}{100 * pp / PRECIO:6.1f}%" if pp is not None else f"{'-':>10}{'-':>7}")
            + "".join((f"{a:9.0f}" if a is not None else f"{'-':>9}") for a in an)
            + (f"{da:10.0f}" if da is not None else f"{'-':>10}")
        )
    s = SUMUP["tarifa"]
    print("\nDiferencia con SumUp a 5.000 pruebas al año:")
    for o in ordenadas():
        if o.get("tarifa"):
            print(f"  {o['corto']:26}{anual(o['tarifa'], 5000) - anual(s, 5000):+8.0f} €")
