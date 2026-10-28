#!/usr/bin/env python3
"""
Prueba una o varias animaciones del banco y saca una hoja de capturas de cada una.

  python3 probar.py "/ruta/banco/00012 Dardos de bar.js" ["/ruta/otra.js" ...] [--en 1.5,3.2] [--capturas 12]

Para cada archivo comprueba:
  - sintaxis (node --check) y que todo el código esté dentro de (() => { ... })();
  - que se registra con registrar({ id, nombre, crear }) y el ID tiene 5 cifras
  - que corre de principio a fin sin errores, con dt = 1/60 (máx. 25 s)
  - que el primer cuadro (tras 1/60 s) y el último son negros (< 50 píxeles con algún canal > 40)
  - duración entre 5 y 14 s
  - tiempo medio por cuadro (orientativo: en la Pi 3B+ será varias veces más)
Guarda la hoja en revision/<ID>.png (12 cuadros repartidos por la animación) y, con --en, cuadros a tamaño real
en revision/<ID>_t<segundos>.png. Sale con código 1 si algo falla.
"""
import asyncio, base64, fcntl, io, json, os, re, subprocess, sys, time

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, '..'))
# vale tanto con la herramienta dentro de la carpeta del banco (repo) como al lado (banco/ y herramientas/)
BANCO = RAIZ if os.path.exists(os.path.join(RAIZ, 'banco.js')) else os.path.join(RAIZ, 'banco')
REV = os.path.join(RAIZ, 'revision')
# tipografías en local (paquetes @fontsource de npm), opcional: ALC_FUENTES=/ruta/node_modules/@fontsource
FUENTES = os.environ.get('ALC_FUENTES') or os.path.join(RAIZ, '..', 'fuentes', 'node_modules', '@fontsource')
FUENTES = FUENTES.rstrip('/') + '/'
os.makedirs(REV, exist_ok=True)

args = sys.argv[1:]
en = []
ncapt = 12
archivos = []
i = 0
while i < len(args):
    if args[i] == '--en':
        en = [float(x) for x in args[i + 1].split(',') if x.strip()]; i += 2
    elif args[i] == '--capturas':
        ncapt = int(args[i + 1]); i += 2
    else:
        archivos.append(os.path.abspath(args[i])); i += 1
if not archivos:
    print(__doc__); sys.exit(2)

problemas_globales = []
codigos = []
for f in archivos:
    if not os.path.exists(f):
        print(f'NO EXISTE: {f}'); sys.exit(2)
    r = subprocess.run(['node', '--check', f], capture_output=True, text=True)
    if r.returncode != 0:
        print(f'ERROR DE SINTAXIS en {os.path.basename(f)}:\n{r.stderr.strip()[:1500]}'); sys.exit(1)
    s = open(f, encoding='utf-8').read()
    sin_coment = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    sin_coment = re.sub(r'^\s*//.*$', '', sin_coment, flags=re.M)
    if not re.fullmatch(r'\s*"use strict";\s*\(\s*\(\s*\)\s*=>\s*\{.*\}\s*\)\s*\(\s*\)\s*;\s*', sin_coment, re.S):
        problemas_globales.append(f'{os.path.basename(f)}: el código tiene que ir entero dentro de "use strict"; (() => {{ ... }})();')
    if not re.match(r'^\d{5} .+\.js$', os.path.basename(f)):
        problemas_globales.append(f'{os.path.basename(f)}: el archivo tiene que llamarse "IIIII Nombre.js"')
    codigos.append((os.path.basename(f), s))

FAM = [("Big Shoulders Display", "big-shoulders-display", [700, 800, 900]), ("Archivo", "archivo", [400, 600, 800]), ("Bangers", "bangers", [400]), ("Lilita One", "lilita-one", [400])]
CSS = ''.join("@font-face{font-family:'%s';font-weight:%d;src:url(https://fonts.gstatic.com/local/%s/%s-latin-%d-normal.woff2) format('woff2');}\n" % (n, w, c, c, w) for n, c, ps in FAM for w in ps)

def leer(p):
    return open(p, encoding='utf-8').read()

pagina = ['<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=x">',
          '<style>body{margin:0;background:#000}</style><canvas id="pantalla" width="1024" height="600"></canvas>']
for p in ['motor/avatar-guillermo.js', 'motor/base.js', 'motor/avatar-rodrigo.js', 'motor/avatar-marcos.js', 'motor/avatar-marcos-bombero.js', 'motor/pantallas-fijas.js', 'banco.js']:
    pagina.append('<script>\n' + leer(os.path.join(BANCO, p)) + '\n</script>')
pagina.append('<script>window.__antes = new Set(Object.getOwnPropertyNames(window));</script>')
for nombre, s in codigos:
    pagina.append(f'<script>window.__archivo = {json.dumps(nombre)}; window.__idsAntes = new Set(BANCO.map(a => a.id));</script>')
    pagina.append('<script>\n' + s + '\n</script>')
    pagina.append('<script>(window.__regs = window.__regs || []).push([window.__archivo, BANCO.map(a => a.id).filter(i => !window.__idsAntes.has(i))]);</script>')
pagina.append('''<script>
window.__nuevos = Object.getOwnPropertyNames(window).filter(k => !window.__antes.has(k) && !k.startsWith("__"));
window.correr = (id, objetivos) => {
  const a = BANCO.find(b => b.id === id);
  if (!a) return { error: "no registrada" };
  const cv = document.getElementById("pantalla"), g = cv.getContext("2d");
  const limpiar = () => { g.setTransform(1,0,0,1,0,0); g.globalAlpha = 1; g.globalCompositeOperation = "source-over"; g.fillStyle = "#000"; g.fillRect(0,0,W,H); };
  const medir = () => { const d = g.getImageData(0,0,W,H).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (Math.max(d[i],d[i+1],d[i+2]) > 40) n++; return n; };
  try {
    camara.t = camara.dur = 1; camara.f = 0;
    const e = a.crear();
    const dur = e.dur;
    const capt = []; let k = 0; let pasos = 0, ms = 0, msMax = 0, ini = -1;
    while (!e.terminada && pasos < 60 * 25) {
      const t0 = performance.now();
      e.actualizar(1 / 60); limpiar(); e.dibujar(g);
      const d = performance.now() - t0; ms += d; msMax = Math.max(msMax, d); pasos++;
      if (pasos === 1) ini = medir();
      while (k < objetivos.length && e.t >= objetivos[k]) { capt.push([e.t, cv.toDataURL("image/jpeg", 0.82)]); k++; }
    }
    const fin = medir();
    if (k < objetivos.length) capt.push([e.t, cv.toDataURL("image/jpeg", 0.82)]);
    return { nombre: a.nombre, dur, t: e.t, pasos, ini, fin, ms: ms / Math.max(1, pasos), msMax, terminada: e.terminada, capt };
  } catch (err) {
    return { error: String(err && err.stack || err) };
  }
};
window.duracion = (id) => { try { return BANCO.find(b => b.id === id).crear().dur; } catch (e) { return -1; } };
</script>''')
html = '\n'.join(pagina).replace('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=x">',
                                  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Archivo:wght@400;600;800&family=Bangers&family=Lilita+One&display=swap">')

# como mucho 2 navegadores a la vez en esta máquina
def turno():
    while True:
        for n in range(2):
            fd = open(os.path.join(REV, f'.turno{n}'), 'w')
            try:
                fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB); return fd
            except OSError:
                fd.close()
        time.sleep(1.5)

async def main():
    from playwright.async_api import async_playwright
    from PIL import Image, ImageDraw
    tmp = os.path.join(REV, f'.pagina_{os.getpid()}.html')
    open(tmp, 'w', encoding='utf-8').write(html)
    fallo = bool(problemas_globales)
    for p in problemas_globales: print('PROBLEMA:', p)
    cerrojo = turno()
    try:
        async with async_playwright() as pw:
            b = await pw.chromium.launch()
            pg = await b.new_page(viewport={'width': 1024, 'height': 600})
            errores = []
            pg.on('pageerror', lambda e: errores.append(str(e)))
            pg.on('console', lambda m: errores.append(m.text) if m.type == 'error' and 'ERR_' not in m.text else None)
            async def css(route):
                await route.fulfill(status=200, headers={'Content-Type': 'text/css', 'Access-Control-Allow-Origin': '*'}, body=CSS)
            async def fich(route):
                partes = route.request.url.split('/local/')[1].split('/')
                try:
                    with open(FUENTES + partes[0] + '/files/' + partes[1], 'rb') as fh:
                        await route.fulfill(status=200, headers={'Content-Type': 'font/woff2', 'Access-Control-Allow-Origin': '*'}, body=fh.read())
                except OSError:
                    await route.abort()
            if os.path.isdir(FUENTES):
                await pg.route('https://fonts.googleapis.com/**', css)
                await pg.route('https://fonts.gstatic.com/local/**', fich)
            await pg.goto('file://' + tmp)
            await pg.evaluate('''() => Promise.race([Promise.all(["900 100px 'Big Shoulders Display'", "800 20px Archivo", "100px Bangers", "100px 'Lilita One'"].map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 3000))]).then(() => cachesTexto.forEach(m => m.clear()))''')
            regs = await pg.evaluate('window.__regs || []')
            nuevos = await pg.evaluate('window.__nuevos')
            if nuevos:
                print('PROBLEMA: variables globales nuevas (tienen que ir dentro de la función):', ', '.join(nuevos)); fallo = True
            if errores:
                print('ERRORES AL CARGAR:'); [print('  ', e[:400]) for e in errores]; fallo = True; errores.clear()
            for archivo, ids in regs:
                if len(ids) != 1:
                    print(f'PROBLEMA: {archivo} registra {len(ids)} animaciones (tiene que registrar una): {ids}'); fallo = True
                for id_ in ids:
                    if not archivo.startswith(id_ + ' '):
                        print(f'PROBLEMA: {archivo} se registra con el ID {id_}, distinto del de su nombre de archivo'); fallo = True
                    dur = await pg.evaluate('(id) => duracion(id)', id_)
                    objetivos = sorted(set([round(0.05 + (max(dur, 0.2) - 0.1) * k / (ncapt - 1), 3) for k in range(ncapt)] + en))
                    r = await pg.evaluate('([id, o]) => correr(id, o)', [id_, objetivos])
                    if 'error' in r:
                        print(f'✗ {id_}: ERROR AL CORRER\n{r["error"][:1500]}'); fallo = True; continue
                    ok = []
                    if errores: ok.append('errores en consola: ' + ' | '.join(e[:200] for e in errores)); errores.clear()
                    if not r['terminada']: ok.append(f'no termina (sigue a los {r["t"]:.1f} s)')
                    if r['ini'] >= 50: ok.append(f'el primer cuadro no es negro ({r["ini"]} px claros)')
                    if r['fin'] >= 50: ok.append(f'el último cuadro no es negro ({r["fin"]} px claros)')
                    if not (5 <= r['t'] <= 14.05): ok.append(f'dura {r["t"]:.1f} s (tiene que estar entre 5 y 14)')
                    estado = '✓' if not ok else '✗'
                    if ok: fallo = True
                    print(f'{estado} {id_} · {r["nombre"]}: {r["t"]:.2f} s, {r["pasos"]} cuadros, {r["ms"]:.1f} ms/cuadro (máx {r["msMax"]:.0f}), primer cuadro {r["ini"]} px claros, último {r["fin"]} px claros')
                    for p in ok: print('    ·', p)
                    # hoja de capturas
                    caps = [(t, Image.open(io.BytesIO(base64.b64decode(u.split(',')[1])))) for t, u in r['capt']]
                    normales = [c for c in caps if not any(abs(c[0] - x) < 1 / 59 for x in en)] or caps
                    n = len(normales); cols = 4; filas = (n + cols - 1) // cols
                    w, h = 340, 199
                    hoja = Image.new('RGB', (cols * (w + 6), filas * (h + 6)), (45, 45, 50))
                    for j, (t, im) in enumerate(normales):
                        x = (j % cols) * (w + 6); y = (j // cols) * (h + 6)
                        hoja.paste(im.convert('RGB').resize((w, h)), (x, y))
                        dd = ImageDraw.Draw(hoja); dd.rectangle([x, y, x + 52, y + 14], fill=(0, 0, 0)); dd.text((x + 3, y + 2), f'{t:5.2f}s', fill=(255, 230, 0))
                    ruta = os.path.join(REV, f'{id_}.png'); hoja.save(ruta)
                    print(f'    hoja: {ruta}')
                    for t_en in en:
                        cerca = min(caps, key=lambda c: abs(c[0] - t_en))
                        rr = os.path.join(REV, f'{id_}_t{t_en:g}.png'); cerca[1].convert('RGB').save(rr)
                        print(f'    cuadro {cerca[0]:.2f} s: {rr}')
            await b.close()
    finally:
        cerrojo.close()
        try: os.remove(tmp)
        except OSError: pass
    sys.exit(1 if fallo else 0)

asyncio.run(main())
