#!/usr/bin/env python3
"""Bloque 1 · cuentas eléctricas y térmicas del alcoholímetro (diseño A, 13-11-2026).

Todo es CÁLCULO sobre datos de hoja o ESTIMACIONES marcadas. No hay nada medido.
Uso: python3 cuentas.py
"""
from math import sqrt

# ----------------------------------------------------------------------------- datos
V_SET = 5.10                       # ajuste de la fuente sin carga (decisión)
# Envolvente de la LRS-50-5 (hoja LRS-50-SPEC 2025-04-07): línea ±0,5 %, carga ±1 %, 0,03 %/°C
TOL_ABAJO = 0.005 + 0.010 + 0.0003 * 20    # 20 °C por encima de 25 °C dentro de la caja
TOL_ARRIBA = TOL_ABAJO
V_MIN_FUENTE = V_SET * (1 - TOL_ABAJO)
V_MAX_FUENTE = V_SET * (1 + TOL_ARRIBA)

# Resistencias (ohmios). Cobre a ~40 °C.
R_075 = 0.026      # Ω/m, cable de 0,75 mm² (valor de la ficha #21)
R_22AWG = 0.054    # Ω/m
R_16AWG = 0.0135   # Ω/m, hilo de los portafusibles
# Fusibles MINI de cuchilla, resistencia en frío típica (Littelfuse serie 297, hoja de datos)
R_FUS = {2: 0.0556, 3: 0.03375, 4: 0.02348, 5: 0.01775}

# Cargas de 5 V: (típico A, pico A, origen del dato)
CARGAS = {
    "Pi 3B+ con cámara":      (0.90, 1.40, "estimación: placa 0,5–0,7 A + cámara 0,25 A (Raspberry Pi)"),
    "Módem 4G (USB de la Pi)": (0.40, 0.70, "ficha Huawei: < 3,5 W"),
    "Pantalla 7\"":            (0.80, 1.00, "anuncio: 5 W; módulos parecidos 0,5 A (estimación)"),
    "SumUp Solo":              (0.20, 1.50, "sin dato oficial; 1,5 A = tope de un cargador USB"),
    "ZE29A":                   (0.10, 0.50, "manual: < 500 mA; reposo estimado"),
    "2 ventiladores":          (0.09, 0.10, "Noctua NF-A4x10 5V: 0,044 A típ., 0,05 A máx. cada uno"),
}
RAMAS = {   # rama: (cargas, fusible A)
    "Pi (directa a la fuente)": (["Pi 3B+ con cámara", "Módem 4G (USB de la Pi)"], 3),
    "Pantalla":                 (["Pantalla 7\""], 2),
    "Solo":                     (["SumUp Solo"], 2),
    "Sensor":                   (["ZE29A"], 2),
    "Ventiladores":             (["2 ventiladores"], 2),
}
TRONCAL = ["Pantalla", "Solo", "Sensor", "Ventiladores"]
FUS_TRONCAL = 5


def suma(nombres, k):
    return sum(CARGAS[n][k] for n in nombres)


def consumo():
    print("== 1. Consumo por rama (5 V) ==")
    print(f"{'Rama':28s}{'típico':>8s}{'pico':>8s}{'fusible':>9s}{'pico/fus.':>11s}")
    tot_t = tot_p = 0.0
    for rama, (cargas, fus) in RAMAS.items():
        t, p = suma(cargas, 0), suma(cargas, 1)
        tot_t += t
        tot_p += p
        print(f"{rama:28s}{t:7.2f}A{p:7.2f}A{fus:7d} A{100 * p / fus:9.0f} %")
    tt = sum(suma(RAMAS[r][0], 0) for r in TRONCAL)
    tp = sum(suma(RAMAS[r][0], 1) for r in TRONCAL)
    print(f"{'Troncal (sin la Pi)':28s}{tt:7.2f}A{tp:7.2f}A{FUS_TRONCAL:7d} A{100 * tp / FUS_TRONCAL:9.0f} %")
    print(f"{'TOTAL fuente (10 A)':28s}{tot_t:7.2f}A{tot_p:7.2f}A{'':>9s}{100 * tot_p / 10:9.0f} %")
    return tot_t, tot_p, tt, tp


def tension_pi():
    print("\n== 2. Tensión en la Pi (pin 2/4 frente a pin 6) ==")
    casos = {
        # nombre: (R típica, R peor)
        "A. Placa de bornes GPIO + 0,75 mm² (propuesto)": (
            2 * 0.20 * R_075 * 0.9 + R_FUS[3] + 0.007 + 0.001 + 0.008,
            2 * 0.25 * R_075 + R_FUS[3] * 1.2 + 0.013 + 0.002 + 0.023),
        "B. Micro-USB 22 AWG de 15 cm (diseño anterior)": (
            2 * 0.15 * R_22AWG + R_FUS[3] + 0.020 + 0.040 + 0.005,
            2 * 0.15 * R_22AWG * 1.1 + R_FUS[3] * 1.2 + 0.060 + 0.100 + 0.008),
    }
    for nombre, (rt, rp) in casos.items():
        print(f"{nombre}\n   R de la rama: {1000 * rt:.0f} mΩ típica, {1000 * rp:.0f} mΩ peor caso")
        for etiqueta, i in (("Pi sola, típico 0,9 A", 0.9), ("Pi sola, pico 1,4 A", 1.4),
                            ("Pi + módem, típico 1,3 A", 1.3), ("Pi + módem, pico 2,1 A", 2.1)):
            vt = V_SET - i * rt
            vp = V_SET - i * rp
            vpp = V_MIN_FUENTE - i * rp
            print(f"   {etiqueta:26s}: {vt:.2f} V típ. · {vp:.2f} V con R peor · {vpp:.2f} V con R peor y fuente baja")
    print(f"   (fuente: {V_SET:.2f} V ajustados; envolvente {V_MIN_FUENTE:.2f}–{V_MAX_FUENTE:.2f} V; aviso de la Pi < 4,63 V)")


def tension_ramas(tt, tp):
    print("\n== 3. Tensión en las demás cargas (pico de su rama) ==")
    r_tronco = 2 * 0.25 * R_075 + R_FUS[5] + 0.004
    filas = {
        # nombre: (I pico, R rama típ., R rama peor)
        "Pantalla (1,0 A)": (1.0, R_FUS[2] + 2 * 0.15 * R_075 + 0.030 + 2 * 0.30 * 0.084,
                             R_FUS[2] * 1.2 + 2 * 0.15 * R_075 + 0.050 + 2 * 0.30 * 0.213),
        "Solo cargando (1,5 A)": (1.5, R_FUS[2] + 2 * 0.15 * R_075 + 0.030 + 2 * 0.30 * 0.084,
                                  R_FUS[2] * 1.2 + 2 * 0.15 * R_075 + 0.050 + 2 * 0.30 * 0.213),
        "ZE29A (0,5 A)": (0.5, R_FUS[2] + 2 * 0.15 * R_22AWG + 0.010, R_FUS[2] * 1.2 + 2 * 0.15 * R_22AWG + 0.030),
    }
    print(f"   troncal: {1000 * r_tronco:.0f} mΩ (ida y vuelta de 25 cm + fusible de 5 A); cae {1000 * r_tronco * tt:.0f} mV típ. y {1000 * r_tronco * tp:.0f} mV en el pico")
    for nombre, (i, rt, rp) in filas.items():
        vt = V_SET - r_tronco * tt - i * rt
        vp = V_MIN_FUENTE - r_tronco * tp - i * rp
        print(f"   {nombre:24s}: {vt:.2f} V típico · {vp:.2f} V en el peor caso")
    rizado = 0.150
    print(f"   Máximo en el ZE29A (límite 5,30 V): {V_MAX_FUENTE:.3f} V en continua + medio rizado. "
          f"Con {1000 * rizado:.0f} mVpp: {V_MAX_FUENTE + rizado / 2:.3f} V. Rizado que agota el margen: "
          f"{2000 * (5.30 - V_MAX_FUENTE):.0f} mVpp")
    v505 = 5.05 * (1 + TOL_ARRIBA)
    print(f"   Si se bajara la fuente a 5,05 V: máximo en continua {v505:.3f} V; rizado admisible {2000 * (5.30 - v505):.0f} mVpp")


def fusibles():
    print("\n== 4. Fusibles MINI frente a los picos de arranque (I²t) ==")
    i2t = {2: 2.8, 3: 9.4, 5: 25.0}   # A²s de fusión, Littelfuse 297
    for nombre, fus, i_pico, ms in (("Pantalla, carga de condensadores", 2, 5.0, 10),
                                    ("Solo, conexión", 2, 3.0, 20),
                                    ("Pi, arranque", 3, 4.0, 20),
                                    ("Troncal, todo a la vez", 5, 8.0, 20)):
        e = i_pico ** 2 * ms / 1000
        print(f"   {nombre:36s}: {i_pico:.0f} A × {ms} ms = {e:.2f} A²s = {100 * e / i2t[fus]:.0f} % del I²t del fusible de {fus} A (supuesto, a medir)")


def calor(tot_t):
    print("\n== 5. Calor ==")
    for nombre, amp, rend in (("mínimo", tot_t * 0.8, 0.80), ("típico", tot_t, 0.78), ("máximo", tot_t * 1.25, 0.76)):
        p_dc = amp * V_SET
        p = p_dc / rend
        print(f"   {nombre:7s}: {p_dc:4.1f} W en 5 V / rendimiento {rend:.0%} = {p:4.1f} W de calor dentro (pérdidas de la fuente {p - p_dc:.1f} W)")
    p_tip = tot_t * V_SET / 0.78

    # Zona caliente = cajón de componentes: 220 × 100 × 245 mm (de la bandeja a la tapa)
    a_frente, a_lados, a_techo = 0.22 * 0.245, 2 * 0.10 * 0.245, 0.22 * 0.10
    a_tras, a_suelo = 0.22 * 0.245, 0.22 * 0.10
    a_ef = a_frente + a_lados + a_techo + 0.3 * a_tras + 0.5 * a_suelo
    print(f"   superficie eficaz (IEC 60890: trasera contra la pared ×0,3, suelo ×0,5): {a_ef:.3f} m²")
    k = 5.5   # W/m²K, chapa de acero pintada, aire quieto (regla de armarios eléctricos)
    rho_cp = 1.16 * 1005
    print(f"   {'Caso':52s}{'W/K':>7s}{'ΔT':>8s}")

    def fila(nombre, g):
        print(f"   {nombre:52s}{g:7.2f}{p_tip / g:6.0f} K")

    for nombre, factor in (("Sin ventilador, una sola pared (optimista)", 1.0),
                           ("Sin ventilador, doble pared cajón+carcasa (×0,6)", 0.6)):
        g_pared = k * a_ef * factor
        # rejillas: tiro natural con ~5 cm² de entrada y de salida separadas 0,15 m
        dt = p_tip / g_pared
        for _ in range(30):
            v = sqrt(2 * 9.81 * 0.15 * dt / 303)
            g_rej = rho_cp * 0.6 * 5e-4 * v
            dt = p_tip / (g_pared + g_rej)
        fila(nombre, g_pared + g_rej)
    g_pared = k * a_ef * 0.6
    for nombre, q in (("1 × NF-A4x10 (≈ 3 m³/h reales, 37 % del libre)", 3.0),
                      ("2 × NF-A4x10 en serie, entra y sale (≈ 4,5 m³/h)", 4.5),
                      ("2 × NF-A4x20 en serie (≈ 6 m³/h)", 6.0),
                      ("1 × 60 mm NF-A6x25 5V (≈ 14 m³/h)", 14.0)):
        fila(nombre, g_pared + rho_cp * q / 3600)
    print("   ΔT = aire de salida sobre el del bar. El caudal real es una ESTIMACIÓN (fracción del caudal libre).")
    print("   Con el aire entrando junto al Solo y el sensor, esas dos piezas ven aire casi a la temperatura del bar.")

    # lo que sacan las rejillas actuales por tiro natural, con el ΔT del caso de doble pared
    dt = p_tip / (k * a_ef * 0.6)
    for _ in range(30):
        v = sqrt(2 * 9.81 * 0.15 * dt / 303)
        g_rej = rho_cp * 0.6 * 5e-4 * v
        dt = p_tip / (k * a_ef * 0.6 + g_rej)
    print(f"   rejillas actuales por tiro natural (5 cm² de entrada y de salida, 15 cm de desnivel): {g_rej * dt:.1f} W de los {p_tip:.1f}")
    empuje = 1.16 * 9.81 * 0.25 * 8 / 303
    print(f"   empuje del aire caliente (8 K, 25 cm): {empuje:.2f} Pa · presión del NF-A4x10: {1.78 * 9.81:.1f} Pa")
    print(f"   aire que pasa en 2 años a 4 m³/h: {4 * 17520:,.0f} m³; con 50 µg/m³ de polvo: {4 * 17520 * 50e-6:.1f} g")

    print("\n== 6. Pantalla: horas de retroiluminación en 2 años ==")
    for nombre, h_dia in (("24 h encendida", 24), ("apagada 10 h al día (cierre)", 14), ("apagada 14 h al día", 10)):
        print(f"   {nombre:30s}: {h_dia * 730:6d} h")

    print("\n== 7. Radio y datos ==")
    for nombre, largo in (("ventana de la carcasa, 112 mm", 0.112), ("ventana del cajón, 108 mm", 0.108)):
        print(f"   {nombre}: media onda a {299.79 / (2 * largo):.0f} MHz")
    for banda, f in (("B28 700", 760), ("B20 800", 820), ("B8 900", 940), ("B3 1800", 1800), ("B1 2100", 2140), ("B7 2600", 2650)):
        print(f"   {banda:8s}: media onda = {1000 * 299.79 / (2 * f):.0f} mm")
    consultas = 86400 / 3
    print(f"   consultas a SumUp cada 3 s: {consultas:,.0f} al día; a 1 kB cada una, {consultas * 30 / 1e6:.2f} GB al mes (estimación)")

    print("\n== 8. Comisiones con 10 000 pruebas de 2 € al año ==")
    print(f"   SumUp 1,49 %: {10000 * 2 * 0.0149:.0f} € · Nayax 3 % + 12 €/mes: {10000 * 2 * 0.03 + 144:.0f} €")


if __name__ == "__main__":
    tot_t, tot_p, tt, tp = consumo()
    tension_pi()
    tension_ramas(tt, tp)
    fusibles()
    calor(tot_t)
