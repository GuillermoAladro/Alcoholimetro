"""Auditor 6-A: modelo DC resistivo reproducible, NO simulador del equipo real.
Python 3, solo biblioteca estandar. Ejecutar: python modelo_dc.py --repo ../.. --output resultados_dc.json
No toca hardware ni realiza ensayos de red. Resistencias/contactos/consumos son escenarios.
"""
import argparse, json, csv, itertools, math, re
from pathlib import Path

def solve(a,b):
    a=[list(row)+[v] for row,v in zip(a,b)]
    n=len(b)
    for k in range(n):
        pivot=max(range(k,n),key=lambda i:abs(a[i][k]))
        a[k],a[pivot]=a[pivot],a[k]
        if abs(a[k][k])<1e-12: raise ValueError('singular')
        f=a[k][k]; a[k]=[x/f for x in a[k]]
        for i in range(n):
            if i==k:continue
            f=a[i][k]; a[i]=[x-f*y for x,y in zip(a[i],a[k])]
    return [row[-1] for row in a]

def nodal(vsource,rtrunk,rbranch,currents,hdmi_ground_ohm=None,open_pi_return=False):
    # Node0=bus+,node1=bus0; 2,3 = branch0+/0, etc.
    n=2+2*len(currents); a=[[0.]*n for _ in range(n)]; b=[0.]*n
    def resistor(i,j,r,fixed=None):
        g=1/r; a[i][i]+=g
        if j is None:b[i]+=g*fixed
        else:a[j][j]+=g; a[i][j]-=g; a[j][i]-=g
    resistor(0,None,rtrunk/2,vsource); resistor(1,None,rtrunk/2,0)
    for k,(r,current) in enumerate(zip(rbranch,currents)):
        p=2+2*k; m=p+1
        resistor(0,p,r/2)
        if not (open_pi_return and k==0):resistor(1,m,r/2)
        b[p]-=current; b[m]+=current
    if hdmi_ground_ohm is not None:resistor(3,7,hdmi_ground_ohm)
    v=solve(a,b)
    return {'bus_v':v[0]-v[1],'loads_v':[v[2+2*k]-v[3+2*k] for k in range(len(currents))],
            'source_a':(vsource-v[0])/(rtrunk/2),'return_a':v[1]/(rtrunk/2),
            'ground_offsets_v':[v[3+2*k] for k in range(len(currents))],
            'hdmi_ground_a':(v[3]-v[7])/hdmi_ground_ohm if hdmi_ground_ohm else None}

def wire_loop(length,res_per_m,temp):
    return 2*length*res_per_m*(1+0.00393*(temp-20))

def case(name,vs,length,temp,contact,loads,corrected=False):
    # 26 mOhm/m Cu 0.75 mm2;13.3mOhm/m Cu1.5;53mOhm/m AWG22 reference.
    trunk=wire_loop(length,0.0133 if corrected else 0.026,temp)+0.004
    branches=[wire_loop(.15,.053,temp)+contact,
              wire_loop(.30,.026,temp)+wire_loop(.30,.053,temp)+contact,
              wire_loop(.30,.026,temp)+wire_loop(.30,.053,temp)+contact,
              wire_loop(.15,.053,temp)+contact]
    result=nodal(vs,trunk,branches,loads)
    analytic=[vs-sum(loads)*trunk-i*r for i,r in zip(loads,branches)]
    err=max(abs(x-y) for x,y in zip(result['loads_v'],analytic))
    assert err<1e-9
    assert abs(result['source_a']-sum(loads))<1e-9
    assert abs(result['return_a']-sum(loads))<1e-9
    return dict(name=name,source_v=vs,trunk_one_way_m=length,temp_c=temp,contact_loop_ohm=contact,
                trunk_loop_ohm=trunk,branch_loop_ohm=branches,currents_a=loads,
                analytic_error_v=err,**result,
                engineering_window_4_75_to_5_25=all(4.75<=v<=5.25 for v in result['loads_v']))

def run(repo):
    doc=(repo/'MONTAJE-GENERAL.md').read_text(encoding='utf-8')
    wires=[]
    for lineno,line in enumerate(doc.splitlines(),1):
        if re.match(r'^\| W\d+ \|',line):
            cols=[x.strip() for x in line.strip('|').split('|')]
            wires.append({'wire':cols[0],'from':cols[1],'to':cols[2],'method':cols[3],'notes':cols[4] if len(cols)>4 else '', 'source_line':lineno})
    assert len(wires)==29 and len({x['wire'] for x in wires})==29
    scenarios=[]
    sets={'tipico_guia':[.9,.8,.5,.1], 'pico_guia':[2,2,.5,.5], 'reserva_pi_2_5A':[2.5,2,.5,.5]}
    for (ln,t,c,vs),(loadname,loads) in itertools.product(itertools.product([.25,.5,1.0],[20,60],[.02,.1,.2],[5.08,5.2]),sets.items()):
        scenarios.append(case(loadname,vs,ln,t,c,loads))
    named=[case('base_5A',5.2,.5,20,.04,sets['pico_guia']),
           case('base_desfavorable_5A',5.08,1,60,.2,sets['pico_guia']),
           case('propuesta_nominal_5_5A',5.1,.25,20,.04,sets['reserva_pi_2_5A'],True),
           case('propuesta_hipotesis_baja_5_5A',5.1-.051-.04,.25,60,.04,sets['reserva_pi_2_5A'],True)]
    # Source envelopes are conditional bounds, NOT measured values and NOT certification.
    envelope={'baseline_set_v':5.2,'line_fraction':.005,'load_fraction':.01,'temp_fraction_25_to_50':.0003*25,
              'baseline_high_without_ripple_v':5.2*(1+.005+.01+.0003*25),
              'proposal_set_v':5.1,'proposal_assumed_residual_fraction':.01,'proposal_assumed_ripple_half_v':.04,
              'proposal_assumed_high_v':5.1*1.01+.04,
              'warning':'80mVpp NO garantizado por nota7 LRS a carga0-50%; +1% residual propuesta es objetivo a validar, no dato garantizado.'}
    fault={'source_overload_w':[50*1.10,50*1.50], 'at_5_2V_a':[50*1.1/5.2,50*1.5/5.2],
           'trunk_0_75_0_5m_power_at_12A_w':12**2*wire_loop(.5,.026,20),
           'same_trunk_power_at_5A_w':5**2*wire_loop(.5,.026,20),
           'proposed_fuses_a':[3,3,3,2], 'sum_fuses_a':11,
           'status':'coordinacion sin demostrar; no predice temperatura ni tiempo disparo ni corriente real hiccup'}
    parallel=[]
    for r,opened in itertools.product([.05,.2,1.0],[False,True]):
        ref=named[0]; x=nodal(ref['source_v'],ref['trunk_loop_ohm'],ref['branch_loop_ohm'],ref['currents_a'],r,opened)
        assert abs(x['source_a']-5)<1e-9 and abs(x['return_a']-5)<1e-9
        if opened:assert abs(x['hdmi_ground_a']-2)<1e-9
        parallel.append({'hdmi_ground_ohm':r,'pi_return_open':opened,**x})
    outside=sum(not x['engineering_window_4_75_to_5_25'] for x in scenarios)
    proposed_pass=all(x['engineering_window_4_75_to_5_25'] for x in named if x['name'].startswith('propuesta'))
    high=envelope['baseline_high_without_ripple_v']
    checks=[{'id':'DC-KCL','status':'PASS','detail':f'{len(scenarios)+len(named)} circuitos coinciden con ecuacion analitica y KCL a <1e-9'},
            {'id':'NET-W01-W29','status':'PASS','detail':'29 conexiones extraidas del documento; no confirma conectores fisicos'},
            {'id':'HDMI-RETORNO','status':'RISK_CONFIRMED_IN_MODEL','detail':'6 escenarios con masa HDMI hipotetica, KCL cumple; retorno Pi abierto hace circular2A por HDMI en modelo de corriente constante. No se predice consumo real tras colapso.'},
            {'id':'BASE-MARGEN','status':'OUTSIDE_WINDOW_IN_MODEL' if outside else 'INSIDE_WINDOW_IN_MODEL','detail':f'{outside}/{len(scenarios)} escenarios salen de ventana de ingenieria elegida'},
            {'id':'BASE-SOBRETENSION','status':'OUTSIDE_WINDOW_IN_MODEL' if high>5.25 else 'INSIDE_WINDOW_IN_MODEL','detail':f'envolvente {high:.6f}V; techo proyecto5.25V, ZE29A5.3V; sin sumar ripple; no valor medido'},
            {'id':'PROPUESTA-DC','status':'PASS_CONDITIONAL' if proposed_pass else 'OUTSIDE_WINDOW_IN_MODEL','detail':'ver escenarios; la hipotesis de ripple y tolerancia debe validarse'},
            {'id':'C14','status':'BLOCKED','detail':'no hay esquema del componente exacto para simular red'},
            {'id':'FUSIBLES','status':'BLOCKED','detail':'faltan curvas/I2t/modelo hiccup y cargas dinamicas'},
            {'id':'HARDWARE','status':'NOT_RUN','detail':'sin circuito fisico ni instrumentos conectados'}]
    return {'auditor':'Auditor 6-A','baseline_commit':'84be97669a9efec43e79b3dadc4af5e87458c41a','model':'DC resistivo nodal de corriente constante; no SPICE/EMC/termico/metrologia',
            'limits':'Ventana 4.75–5.25V es objetivo de proyecto, no rango universal USB ni prueba fabricante pantalla/Solo. Cargas incluyen Pi+perifericos por escenario, no corrientes medidas. Resistencias de contacto y longitudes desconocidas son hipotesis. Sin capacitancias, regulacion dinamica, backfeed ni fallo de semiconductores. Barrido principal estrella sin retornos HDMI/USB/RF; 6 escenarios adicionales incluyen solo masa HDMI hipotetica.',
            'wires':wires,'checks':checks,'named_scenarios':named,'source_envelope':envelope,'fault_sensitivity':fault,'parallel_hdmi_ground_scenarios':parallel,'sweep':scenarios}

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--repo',type=Path,required=True);ap.add_argument('--output',type=Path,required=True);args=ap.parse_args()
    result=run(args.repo.resolve());args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    with args.output.with_name('conexiones_originales.csv').open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(result['wires'][0]));w.writeheader();w.writerows(result['wires'])
    print(json.dumps({'checks':result['checks'],'named_scenarios':[{k:v for k,v in x.items() if k in ['name','loads_v','bus_v','engineering_window_4_75_to_5_25']} for x in result['named_scenarios']]},ensure_ascii=False,indent=2))
