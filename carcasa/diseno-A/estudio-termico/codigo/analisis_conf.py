"""Configuraciones del estudio (las mismas de analisis.py), para importarlas sin volver a correr todo.

Revisión 2 (13-11-2026): cobro con myPOS Sigma en un hueco del frente y fuente de 12 V.
Se conservan las cargas de la revisión 1 (SumUp Solo, fuente de 5 V) para comparar.
"""
from dataclasses import replace
from termico import P

# ------------------------------------------------------------------ cargas en 5 V (revisión de componentes del 13-11-2026), W
V5 = 5.10
C5 = dict(pi=0.90 * V5, modem=0.40 * V5, pantalla=0.80 * V5, solo=0.20 * V5, sensor=0.10 * V5)
FANS_40 = 0.09 * V5          # dos Noctua NF-A4x10 5V
FANS_60 = 0.94               # un NF-A6x25 5V (el valor de la revisión 1)

# ------------------------------------------------------------------ terminal y fuentes
P_SIGMA = 3.0                # W, estimación: no hay dato público. Rango 1,5–6 W; pico ~8 W
ETA_LRS5 = 0.78              # LRS-50-5 al 25 % de carga (83 % de hoja a plena carga)
ETA_LRS12 = 0.81             # LRS-50-12 al 30 % de carga (86 % de hoja a plena carga)
ETA_DCDC = 0.85              # RSD-30G-5, 9–36 V → 5 V 6 A (hoja: 84–85 %)
ETA_12_PEQ = 0.78            # fuente pequeña de 12 V sólo para el Sigma, a carga parcial (estimación)


def cargas_solo(fans=0.0):
    """Revisión 1: SumUp Solo, todo en 5 V con la LRS-50-5."""
    dc = sum(C5.values()) + fans
    ac = dc / ETA_LRS5
    return dict(P_psu=ac - dc, P_scr=C5["pantalla"], P_rest=C5["pi"] + C5["modem"] + C5["solo"] + C5["sensor"], P_fans=fans)


def cargas_sigma(fans=0.0, fuente="12V", p_sig=P_SIGMA, eta_dcdc=ETA_DCDC):
    """Revisión 2: myPOS Sigma. fuente = '12V' (LRS-50-12 + convertidor 12→5 V), 'dos' (LRS-50-5 + fuente pequeña de 12 V),
    'elevador' (LRS-50-5 + elevador 5→12 V al 88 %) o 'doble' (RD-50A de dos salidas, 75 % a carga parcial)."""
    dc5 = C5["pi"] + C5["modem"] + C5["pantalla"] + C5["sensor"] + fans
    if fuente == "12V":
        bus = dc5 / eta_dcdc + p_sig
        ac = bus / ETA_LRS12
    elif fuente == "dos":
        ac = dc5 / ETA_LRS5 + p_sig / ETA_12_PEQ
    elif fuente == "elevador":
        ac = (dc5 + p_sig / 0.88) / ETA_LRS5
    elif fuente == "doble":
        ac = (dc5 + p_sig) / 0.75
    else:
        raise ValueError(fuente)
    return dict(P_psu=ac - dc5 - p_sig, P_scr=C5["pantalla"], P_rest=C5["pi"] + C5["modem"] + C5["sensor"], P_fans=fans, P_sig=p_sig)


GEO_SIGMA = dict(sigma=True, A_c=0.031)      # sin el Solo, la superficie de «resto» baja de 0,050 a 0,031 m²

P_NAT = cargas_sigma()
P_FAN = cargas_sigma(FANS_40)
BASE = P(**GEO_SIGMA, **P_NAT)
CONF = {
    "actual":   dict(nombre="Sin ventilador (rejillas actuales, cajón sin pintar)", p=BASE),
    "pintado":  dict(nombre="Sin ventilador, interior pintado", p=replace(BASE, e_k=0.90, e_si=0.90)),
    "sellado":  dict(nombre="Sin rejillas (selladas o tapadas)", p=replace(BASE, sellado=True)),
    "fan1":     dict(nombre="1 ventilador 40 × 10 (4,2 m³/h)", p=replace(BASE, **P_FAN, Q_fan=4.2)),
    "fan2":     dict(nombre="2 ventiladores 40 × 10 (5,2 m³/h)", p=replace(BASE, **P_FAN, Q_fan=5.2)),
    "fan60":    dict(nombre="1 ventilador 60 × 25 (14 m³/h)", p=replace(BASE, **cargas_sigma(FANS_60), Q_fan=14.0)),
}

# revisión 1 (Solo), para la comparación
BASE_SOLO = P(**cargas_solo())
CONF_SOLO = {
    "actual":   dict(nombre="Con el Solo, sin ventilador", p=BASE_SOLO),
    "pintado":  dict(nombre="Con el Solo, interior pintado", p=replace(BASE_SOLO, e_k=0.90, e_si=0.90)),
    "fan2":     dict(nombre="Con el Solo, 2 ventiladores", p=replace(BASE_SOLO, **cargas_solo(FANS_40), Q_fan=5.2)),
}
