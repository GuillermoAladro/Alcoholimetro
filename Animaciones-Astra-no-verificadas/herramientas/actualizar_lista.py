from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
files=sorted(p.name for p in root.glob('*.js') if re.match(r'^\d{5} ',p.name))
ideas=json.loads((root/'ideas.json').read_text())
summaries={r['id']:r['idea'] for r in ideas if any(f.startswith(r['id']+' ') for f in files)}
(root/'lista.js').write_text('"use strict";\nconst ARCHIVOS_BANCO='+json.dumps(files,ensure_ascii=False,indent=2)+';\nconst IDEAS_ASTRA='+json.dumps(summaries,ensure_ascii=False,indent=2)+';\n')
print('Escenas registradas:',len(files))
