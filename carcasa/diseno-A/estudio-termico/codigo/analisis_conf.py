"""Configuraciones del estudio (las mismas de analisis.py), para importarlas sin volver a correr todo."""
from dataclasses import replace
from termico import P

P_NAT = dict(P_psu=3.45, P_scr=4.08, P_rest=8.16, P_fans=0.0)
P_FAN = dict(P_psu=3.58, P_scr=4.08, P_rest=8.16, P_fans=0.46)
BASE = P(**P_NAT)
CONF = {
    "actual":   dict(nombre="Diseño actual (rejillas, cajón sin pintar)", p=BASE),
    "pintado":  dict(nombre="Actual con el interior pintado", p=replace(BASE, e_k=0.90, e_si=0.90)),
    "sellado":  dict(nombre="Sin rejillas (selladas o tapadas)", p=replace(BASE, sellado=True)),
    "fan1":     dict(nombre="1 ventilador 40 × 10 (4,2 m³/h)", p=replace(BASE, **P_FAN, Q_fan=4.2)),
    "fan2":     dict(nombre="2 ventiladores 40 × 10 (5,2 m³/h)", p=replace(BASE, **P_FAN, Q_fan=5.2)),
    "fan60":    dict(nombre="1 ventilador 60 × 25 (14 m³/h)", p=replace(BASE, P_psu=3.72, P_scr=4.08, P_rest=8.16, P_fans=0.94, Q_fan=14.0)),
}
