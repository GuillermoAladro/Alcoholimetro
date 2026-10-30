#!/usr/bin/env python3
"""Graba una animación de la carpeta a vídeo MP4 (fotograma a fotograma, sin saltos).

Uso: python3 herramientas/grabar.py 00001 [salida.mp4] [--fps 60]
Necesita Playwright (Chromium) y ffmpeg. Abre ver.html?id=…, dibuja cada instante t = i/fps y lo
manda a ffmpeg (H.264, CRF 18).
"""
import argparse, asyncio, base64, pathlib, shutil, subprocess, sys
from playwright.async_api import async_playwright

CARPETA = pathlib.Path(__file__).resolve().parents[1]

async def grabar(id_, salida, fps, chromium=None):
    async with async_playwright() as p:
        opciones = {"args": ["--allow-file-access-from-files"]}
        if chromium: opciones["executable_path"] = chromium
        br = await p.chromium.launch(**opciones)
        pg = await br.new_page(viewport={"width": 1024, "height": 600})
        errores = []
        pg.on("pageerror", lambda e: errores.append(str(e)))
        await pg.goto((CARPETA / "ver.html").as_uri() + f"?id={id_}&pausa")
        await pg.wait_for_function("window.A2D && A2D.listo()")
        dur = await pg.evaluate("A2D.dur()")
        n = int(round(dur * fps))
        ff = subprocess.Popen([shutil.which("ffmpeg") or "ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(fps),
                               "-c:v", "png", "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
                               "-movflags", "+faststart", str(salida)], stdin=subprocess.PIPE)
        for i in range(n + 1):
            t = min(dur, i / fps)
            png = await pg.evaluate(f"(() => {{ A2D.cuadro({t}); return document.getElementById('lienzo').toDataURL('image/png').slice(22); }})()")
            ff.stdin.write(base64.b64decode(png))
        ff.stdin.close(); ff.wait(); await br.close()
        if errores: sys.exit("Errores en la página: " + "; ".join(errores[:3]))
        print(f"{salida}: {n + 1} fotogramas a {fps} fps ({dur:.2f} s)")

if __name__ == "__main__":
    a = argparse.ArgumentParser(); a.add_argument("id"); a.add_argument("salida", nargs="?"); a.add_argument("--fps", type=int, default=60)
    a.add_argument("--chromium", help="ruta a un Chromium concreto (opcional)")
    o = a.parse_args()
    salida = pathlib.Path(o.salida) if o.salida else CARPETA / "vista previa" / f"{o.id}.mp4"
    salida.parent.mkdir(parents=True, exist_ok=True)
    asyncio.run(grabar(o.id, salida, o.fps, o.chromium))
