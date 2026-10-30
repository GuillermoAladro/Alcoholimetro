#!/usr/bin/env python3
"""Comprueba las reglas de la carpeta en una animación.

Uso: python3 herramientas/comprobar.py 00001 [--fps 60]

  1. Empieza y acaba en negro absoluto (todos los píxeles a 0 en los primeros y últimos 0,12 s).
  2. Sin errores de JavaScript ni piezas sin cargar.
  3. Fluidez: dibuja todos los fotogramas y mide cuánto cambia la imagen de uno al siguiente.
     Un salto (corte brusco) es un fotograma que cambia mucho más que sus vecinos.
"""
import argparse, asyncio, pathlib, sys
from playwright.async_api import async_playwright

CARPETA = pathlib.Path(__file__).resolve().parents[1]
JS = """(fps) => {
  const W = 256, H = 150, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true }), src = document.getElementById('lienzo');
  const dur = A2D.dur(), n = Math.round(dur * fps), dif = [], negros = [];
  let prev = null;
  for (let i = 0; i <= n; i++) {
    const t = Math.min(dur, i / fps); A2D.cuadro(t);
    const full = src.getContext('2d').getImageData(0, 0, src.width, src.height).data;
    let max = 0; for (let k = 0; k < full.length; k += 4) { const m = Math.max(full[k], full[k + 1], full[k + 2]); if (m > max) max = m; }
    negros.push([t, max]);
    g.drawImage(src, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H).data;
    if (prev) { let s = 0; for (let k = 0; k < d.length; k += 4) s += Math.abs(d[k] - prev[k]) + Math.abs(d[k + 1] - prev[k + 1]) + Math.abs(d[k + 2] - prev[k + 2]); dif.push([t, s / (W * H * 3)]); }
    prev = d;
  }
  return { dur, dif, negros, errores: Recortes.errores() };
}"""

async def main(id_, fps, chromium):
    async with async_playwright() as p:
        opciones = {"args": ["--allow-file-access-from-files"]}
        if chromium: opciones["executable_path"] = chromium
        br = await p.chromium.launch(**opciones)
        pg = await br.new_page(viewport={"width": 1024, "height": 600})
        errores = []
        pg.on("pageerror", lambda e: errores.append(str(e)))
        await pg.goto((CARPETA / "ver.html").as_uri() + f"?id={id_}&pausa")
        await pg.wait_for_function("window.A2D && A2D.listo()")
        r = await pg.evaluate(JS, fps)
        await br.close()
    ok = True
    dur = r["dur"]
    ini = [m for t, m in r["negros"] if t <= 0.12]
    fin = [m for t, m in r["negros"] if t >= dur - 0.12]
    print(f"Duración {dur:.2f} s, {len(r['negros'])} fotogramas a {fps} fps")
    print(f"Negro al empezar: {len(ini)} fotogramas, valor máximo {max(ini)}  |  al acabar: {len(fin)} fotogramas, valor máximo {max(fin)}")
    if max(ini) or max(fin) or not ini or not fin: ok = False; print("  ✗ no empieza o no acaba en negro absoluto")
    if errores or r["errores"]: ok = False; print("  ✗ errores:", errores[:3], r["errores"][:3])
    d = [v for _, v in r["dif"]]
    saltos = []
    for i in range(len(d)):
        vec = sorted(d[max(0, i - 6):i] + d[i + 1:i + 7])
        base = vec[len(vec) // 2] if vec else 0
        if d[i] > 4 * base + 1.5: saltos.append((r["dif"][i][0], d[i], base))
    print(f"Cambio medio entre fotogramas {sum(d) / len(d):.2f}, máximo {max(d):.2f} (escala 0–255)")
    for t, v, b in saltos: print(f"  salto en t={t:.3f} s: {v:.2f} frente a {b:.2f} de sus vecinos")
    print("OK" if ok else "FALLA", "— saltos:", len(saltos))
    return ok

if __name__ == "__main__":
    a = argparse.ArgumentParser(); a.add_argument("id"); a.add_argument("--fps", type=int, default=60); a.add_argument("--chromium")
    o = a.parse_args()
    sys.exit(0 if asyncio.run(main(o.id, o.fps, o.chromium)) else 1)
