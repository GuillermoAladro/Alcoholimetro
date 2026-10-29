from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1];rev=root/'revision'
rows=json.loads((rev/'resultados.json').read_text());notes=json.loads((rev/'notas-visuales.json').read_text())
for r in rows:
 if r['id'] in notes:
  r['revision_visual']='Revisión de 8 fotogramas por escena, con correcciones';r['nota_visual']=notes[r['id']]
 p=rev/(r['id']+'.png')
 if p.exists():Image.open(p).convert('RGB').save(rev/(r['id']+'.jpg'),quality=86,optimize=True)
(rev/'resultados.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
lines=['# Revisión del banco Astra','',f"**{len(rows)} escenas, IDs {rows[0]['id']}–{rows[-1]['id']}. {sum(r['cuadros'] for r in rows)} fotogramas renderizados con Canvas Skia.**",'',
'Controles por escena: registro e ID únicos, sintaxis y ejecución JavaScript, negro exacto al inicio (incluido 1/60 s) y al final, Guillermo dentro del cuadro durante la acción, contenido visible y render determinista al volver a un instante.','',
'Las referencias de los avatares se conservan byte a byte. Los valores RGB opacos del recorte coinciden con los de la región original; el motor solo aplica transformaciones rígidas y escala uniforme.','',
'## Revisión visual por muestras','', '| ID | Continuidad revisada | Capturas |','|---|---|---|']
for r in rows:lines.append(f"| {r['id']} | {notes.get(r['id'],'Pendiente de revisión visual')} | [{r['id']}.jpg]({r['id']}.jpg) |")
lines+=['','## Límites','',
'Las capturas representan 8 instantes por escena y mantienen la relación 1024:600. La revisión por muestras puede no detectar todos los errores entre fotogramas. Los controles de píxeles no certifican por sí solos perspectiva o raccord.','',
'La comprobación se ha ejecutado con Canvas Skia en Node. No se ha completado una prueba en navegador: Chromium no estaba disponible y su descarga devolvió una página de sitio no disponible. El JavaScript del visor ha pasado la comprobación de sintaxis. Rendimiento en Raspberry Pi 3B+, reproducción del visor en navegador e integración con el programa del alcoholímetro: pendientes. El máximo de tiempo de render registrado es de este entorno, no una medida de la Pi.','',
'Las escenas mantienen el estado de banco **no-verificado** solicitado por el usuario; las pruebas no afirman ausencia absoluta de fallos.']
(rev/'INFORME.md').write_text('\n'.join(lines)+'\n')
print(len(rows),'escenas;',sum(r['cuadros'] for r in rows),'fotogramas;',len(notes),'revisiones visuales')
