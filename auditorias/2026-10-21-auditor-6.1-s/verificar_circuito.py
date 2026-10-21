"""Modelo de auditoría: DC resistivo y reglas de conectividad, sin hardware.

Python >=3.10, biblioteca estándar. Desde esta carpeta:
    python verificar_circuito.py
No representa la dinámica de la LRS, negociación USB, temperaturas ni fusibles.
Los límites de la propuesta son REQUISITOS, no prestaciones medidas de piezas.
"""
import copy
import itertools
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent


def load_voltage(v_source, trunk_loop_ohm, branch_loop_ohm, currents):
    """KVL con cargas de corriente constante y resistencias de ida + retorno."""
    bus = v_source - sum(currents.values()) * trunk_loop_ohm
    return {name: bus - currents[name] * branch_loop_ohm[name] for name in currents}


def topology_errors(model):
    errors = []
    if model['psu_terminals'] != {'1': 'AC_L', '2': 'AC_N', '3': 'PE', '4': 'DC_GND', '5': 'DC_POS'}:
        errors.append('LRS_TERMINALES')
    required = {('PI.8', 'ZE29A.4'), ('ZE29A.3', 'PI.10')}
    if set(map(tuple, model['uart'])) != required:
        errors.append('UART_TX_RX')
    if any('5V' in pin for edge in model['uart'] for pin in edge):
        errors.append('GPIO_5V')
    if model['sensor_power'] != {'1': 'DC_POS', '2': 'DC_GND'}:
        errors.append('SENSOR_POLARIDAD')
    expected_pe = {'PSU.FG', 'CUERPO', 'PANEL', 'CAJA_INTERIOR', 'CAJON'}
    if not expected_pe.issubset(set(model['pe_destinations'])):
        errors.append('PE_INCOMPLETO')
    if model['pe_switched_or_fused']:
        errors.append('PE_INTERRUMPIDO')
    if model['mains_poles_opened'] != 2:
        errors.append('CORTE_NO_BIPOLAR')
    if model['gpio_button'] != ['PI.11', 'PI.9']:
        errors.append('PULSADOR')
    for name in ('pi', 'solo', 'pantalla', 'sensor'):
        if not model['branch_protected'][name]:
            errors.append('RAMA_SIN_PROTECCION:' + name)
    if model['solo_supply_verified'] is not True:
        errors.append('CARGA_SOLO_NO_VERIFICADA')
    return errors


def main():
    model = json.loads((HERE / 'modelo_circuito.json').read_text(encoding='utf-8'))
    checks = []

    def check(name, condition, detail):
        checks.append({'id': name, 'pass': bool(condition), 'detail': detail})

    original = model['original']
    proposal = model['proposal']
    expected = {'RAMA_SIN_PROTECCION:pi', 'RAMA_SIN_PROTECCION:solo',
                'RAMA_SIN_PROTECCION:pantalla', 'RAMA_SIN_PROTECCION:sensor',
                'CORTE_NO_BIPOLAR', 'CARGA_SOLO_NO_VERIFICADA'}
    errors = topology_errors(original)
    check('T01_original_rechazado', set(errors) == expected, errors)
    check('T02_topologia_propuesta_condicional', not topology_errors(proposal),
          'Hipótesis de diseño cumplidas en el modelo; no piezas verificadas.')

    mutations = []
    for label, change in (
        ('bornes_invertidos', lambda m: m['psu_terminals'].update({'1': 'DC_GND', '4': 'AC_L'})),
        ('TX_con_TX', lambda m: m.update(uart=[['PI.8', 'ZE29A.3'], ['ZE29A.4', 'PI.10']])),
        ('5V_en_UART', lambda m: m.update(uart=[['PI.5V', 'ZE29A.4'], ['ZE29A.3', 'PI.10']])),
        ('sensor_invertido', lambda m: m.update(sensor_power={'1': 'DC_GND', '2': 'DC_POS'})),
        ('tierra_cajon_abierta', lambda m: m['pe_destinations'].remove('CAJON')),
        ('fusible_en_PE', lambda m: m.update(pe_switched_or_fused=True)),
        ('un_solo_polo', lambda m: m.update(mains_poles_opened=1)),
        ('LED_en_GPIO', lambda m: m.update(gpio_button=['LED.5V', 'PI.11'])),
        ('rama_sensor_sin_proteger', lambda m: m['branch_protected'].update(sensor=False)),
        ('Solo_sin_cargador_validado', lambda m: m.update(solo_supply_verified=False)),
    ):
        broken = copy.deepcopy(proposal)
        change(broken)
        caught = topology_errors(broken)
        mutations.append({'fault': label, 'detected': caught})
    check('T03_mutaciones_detectadas', all(x['detected'] for x in mutations), mutations)

    # Caso original hipotético: NO se conocen longitudes ni resistencias reales.
    # 0.75 mm2 clase 5: 26 ohm/km por conductor a20C (tabla T11 local).
    old_trunk = 2 * .5 * .026 + .020  # ida/retorno 0.5m cada uno + contactos supuestos
    # USB2 tabla6-6:22AWG máximo0.0574ohm/m por conductor a20C.
    old_branches = {'pi': 2 * .15 * .0574 + .040,
                    'solo': .120, 'pantalla': .120, 'sensor': 2 * .15 * .0574 + .020}
    high = model['load_envelope_A']['high']
    old_high = load_voltage(5.20, old_trunk, old_branches, high)
    old_low_source = load_voltage(5.20 * .98, old_trunk, old_branches, high)
    check('T04_contraejemplo_subtension', old_low_source['pi'] < 4.75,
          {'assumptions': '5.20V-2%; R troncal=0.046 ohm; latiguillo22AWG0.15m; contactos supuestos',
           'V_nominal_source_at_connectors': old_high, 'V_low_source_at_connectors': old_low_source,
           'node_note': 'Original: Pi antes de F1, por tanto caída interna solo empeoraría esta cifra.'})
    check('T05_5_20_sin_margen_sensor', 5.20 * 1.02 > 5.30,
          {'calculation_V': 5.20 * 1.02,
           'warning': 'Cribado de margen, no predicción tras ajuste. El +/-2% ya incluye línea y carga; no se suma otra vez. Rizado a baja carga no acotado por nota7.'})

    # Barrido condicional 2^4 combinaciones de carga x dos tensiones extremas.
    # Resistencias de lazo MAXIMAS, incluidas protecciones/contactos en caliente.
    new_r = model['proposal_envelope']['branch_loop_max_ohm']
    new_trunk = model['proposal_envelope']['trunk_loop_max_ohm']
    cases = []
    for v_source in model['proposal_envelope']['source_instantaneous_range_V']:
        for values in itertools.product(*[(0, high[n]) for n in high]):
            currents = dict(zip(high, values))
            volts = load_voltage(v_source, new_trunk, new_r, currents)
            valid = all(model['voltage_acceptance_V'][n][0] - 1e-9 <= volts[n]
                        <= model['voltage_acceptance_V'][n][1] + 1e-9 for n in volts)
            cases.append({'source_V': v_source, 'currents_A': currents, 'load_V': volts, 'within_targets': valid})
    check('T06_32_casos_propuesta', all(x['within_targets'] for x in cases),
          {'cases': len(cases), 'minimum_V': {n: min(c['load_V'][n] for c in cases) for n in high},
           'maximum_V': {n: max(c['load_V'][n] for c in cases) for n in high},
           'nodes': model['proposal_envelope']['voltage_nodes'],
           'note': 'Pi R50mohm incluye F1/pistas. Este presupuesto total no está demostrado; no basta asignarlo al cable.'})

    # Robustez: resistencia excesiva debe hacer fallar el criterio de tensión.
    bad_r = dict(new_r, pi=.20)
    bad_voltage = load_voltage(5.10, new_trunk, bad_r, high)
    check('T07_cable_malo_no_aprobado', bad_voltage['pi'] < 4.90, bad_voltage)
    check('T08_potencia_estatica', sum(high.values()) * 5.20 < 50,
          {'I_total_A': sum(high.values()), 'P_upper_W': sum(high.values()) * 5.20,
           'warning': 'Capacidad nominal a temperatura compatible; corrientes de cargas son hipótesis, no medidas.'})

    # Capacidad local: descarga ideal, sin ESR ni respuesta dinámica de la fuente.
    droop = .5 * .005 / .001
    hold = .001 * .2 / .5
    check('T09_condensador_ante_deficit_5ms', droop > .3,
          {'C_uF': 1000, 'I_step_A': .5, 'duration_ms': 5, 'droop_V': droop, 'hold_for_0_2V_ms': hold * 1000})
    faults = []
    main_limit = model['proposal_envelope']['main_current_limit_min_A']
    for n, limit in model['proposal_envelope']['branch_current_limit_upper_A'].items():
        total = sum(high.values()) - high[n] + limit
        faults.append({'shorted_branch': n, 'ideal_limit_A': limit, 'total_A': total,
                       'below_main_minimum_limit': total < main_limit,
                       'warning': 'Límite ideal; no respuesta transitoria, SOA ni tiempo de corte comprobados.'})
    check('T10_selectividad_ideal', all(f['below_main_minimum_limit'] for f in faults), faults)
    heat = [{'I_A': i, 'R_ohm': .05, 'P_W': i * i * .05} for i in (10.6, 14.4)]
    check('T11_sobrecorriente_calienta', min(x['P_W'] for x in heat) > 5, heat)
    check('T12_pulsador_logico', 3.3 > 1.6 and 0 < .9,
          'Abierto con pull-up=3.3V; cerrado aGND=0V. No se simulan rebotes/ESD.')
    check('T13_servicio_sin_disparo_condicional', all(
        model['proposal_envelope']['branch_no_trip_min_A'][n] >= high[n]
        for n in high), 'Requisito de no disparo mínimo en caliente/con tolerancia; no verificado en componente.')
    # Sensibilidad al F1 de Pi:0.1ohm NO se presupone en todos los ejemplares;
    # es escenario documentable de límite después de disparo para MF-MSMF250.
    r_f1 = dict(new_r, pi=.100 + .035)
    f1_case = load_voltage(5.10, new_trunk, r_f1, high)
    check('T14_F1_puede_romper_presupuesto', f1_case['pi'] < 4.90,
          {'R_F1_scenario_ohm': .100, 'R_external_scenario_ohm': .035,
           'V_PI_board': f1_case['pi'],
           'warning': 'No eludir F1 por GPIO. Medir placa y revisar fuente/arquitectura si incumple.'})

    results = {'auditor': 'Auditor 6.1-S', 'date': '2026-10-21',
               'base_commit': model['base_commit'], 'method': 'KVL DC + comprobaciones declarativas + inyección de fallos',
               'physical_test': False, 'spice_test': False, 'circuit_approved': False,
               'checks_passed': sum(x['pass'] for x in checks), 'checks_total': len(checks),
               'interpretation': 'PASS verifica el análisis o rechazo esperado, no valida hardware. Las reglas de topología comprueban declaraciones seleccionadas; no es ERC integral del listado W1-W29.',
               'checks': checks, 'proposal_corner_cases': cases}
    (HERE / 'resultados_circuito.json').write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: results[k] for k in ('checks_passed', 'checks_total', 'physical_test', 'spice_test', 'circuit_approved')}, ensure_ascii=False))
    if not all(x['pass'] for x in checks):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
