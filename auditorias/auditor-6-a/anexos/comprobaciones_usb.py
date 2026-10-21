from pathlib import Path
import json
out=Path(__file__).resolve().parent
def reachable(edges,source,target):
 seen={source}; q=[source]
 while q:
  x=q.pop()
  for a,b in edges:
   y=b if a==x else a if b==x else None
   if y is not None and y not in seen:seen.add(y);q.append(y)
 return target in seen
# Logical connectivity model only: HDMI signal ground bonded to each device ground;
# adapter RF ground to USB ground is explicitly conditional, not measured.
edges=[('wago_gnd','pi_gnd'),('wago_gnd','screen_gnd'),('pi_gnd','screen_gnd'),('pi_gnd','usb_gnd'),('rf_shield','chassis'),('chassis','PE')]
tests=[]
tests.append({'test':'baseline Pi power return path','result':reachable(edges,'pi_gnd','wago_gnd')})
no_micro_gnd=[e for e in edges if e!=('wago_gnd','pi_gnd')]
tests.append({'test':'W13 black open still has return via HDMI and display branch','result':reachable(no_micro_gnd,'pi_gnd','wago_gnd'),'implication':'latent fault; HDMI not designed as Pi supply return'})
tests.append({'test':'RF shield bonded to USB GND makes Pi GND-to-PE connected','result':reachable(edges+[('rf_shield','usb_gnd')],'pi_gnd','PE'),'condition':'requires confirmation RF shield-to-USB GND on actual AR9271'})
volt=[]
for v in [5.1,5.15,5.2]:
 trunk_r=2*.3*.0172/.75
 branch_r=2*.15*.05296+.06+.10
 pi=v-6*trunk_r-2.5*branch_r
 volt.append({'source_v':v,'trunk_current_a_assumed':6,'trunk_length_m_one_way_assumed':.3,'trunk_r_ohm':trunk_r,'pi_current_a_assumed':2.5,'pi_branch_r_ohm':branch_r,'pi_rail_v':round(pi,6),'above_nominal_4_63':pi>=4.63})
r={'kind':'analytical topology and Ohm-law scenarios, NOT SPICE or hardware validation','tests':tests,'voltage_scenarios':volt,'assumptions':'22AWG copper resistance 52.96 mOhm/m at 20C; 15cm each conductor; contact pair 60mOhm, F1 100mOhm post-trip upper scenario. NOT initial max guaranteed nor measured values. Loads and lengths assumed.'}
(out/'comprobaciones_usb.json').write_text(json.dumps(r,indent=2),encoding='utf8');print(json.dumps(r,indent=2))
assert all(t['result'] for t in tests)
