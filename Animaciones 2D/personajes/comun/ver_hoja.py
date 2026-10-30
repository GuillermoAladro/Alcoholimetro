#!/usr/bin/env python3
"""Pinta la hoja de un avatar con una rejilla de coordenadas y todo lo que dice su CFG encima.

Sirve para dar de alta un personaje nuevo o retocar uno: se leen las coordenadas en la rejilla, se
apuntan en personajes/<id>/preparar_piezas.py y se vuelve a mirar hasta que todo encaja.

Uso:
  python3 personajes/comun/ver_hoja.py <id> [carpeta_salida]            → <id>-figura.png y <id>-retrato.png
  python3 personajes/comun/ver_hoja.py <id> [carpeta] --zona x0,y0,x1,y1 [--esc 3] [--paso 10]
                                                                        → <id>-zona.png (detalle)
Si el personaje aún no tiene preparar_piezas.py, se puede pasar la ruta del PNG en lugar del id
para ver solo la rejilla.
Colores: rojo = polígonos de recorte · verde = ojos, cejas, boca · naranja = brazos (hombro, codo y
muñeca en puntos) · azul = torso, rellenos y líneas · morado = melena · amarillo = piernas y zapato · cian = retoques de la hoja («limpiar»).
"""
import importlib.util, pathlib, sys
from PIL import Image, ImageDraw, ImageFont

AQUI = pathlib.Path(__file__).resolve().parent
ANIM = AQUI.parent.parent
RAIZ = ANIM.parent
F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 11)


def cargar_cfg(ident):
    ruta = AQUI.parent / ident / "preparar_piezas.py"
    if not ruta.exists(): return None
    spec = importlib.util.spec_from_file_location("cfg_" + ident, ruta)
    mod = importlib.util.module_from_spec(spec); sys.path.insert(0, str(AQUI)); spec.loader.exec_module(mod)
    return mod.CFG


def capa(cfg):
    """Lista de (tipo, puntos, color, etiqueta) a dibujar."""
    out = []
    if not cfg: return out
    r, f = cfg.get("retrato", {}), cfg.get("figura", {})
    poli = lambda pts, col, et="": out.append(("poli", pts, col, et))
    punto = lambda p, col, et="": out.append(("punto", [p], col, et))
    linea = lambda pts, col, et="": out.append(("linea", pts, col, et))
    ROJO, VERDE, NAR, AZUL, MOR, AMA = (230, 0, 0), (0, 170, 0), (255, 120, 0), (0, 90, 255), (190, 0, 190), (220, 170, 0)
    CIAN = (0, 170, 190)
    for paso in cfg.get("limpiar", []):                    # retoques de la hoja (accesorios quitados) en cian
        for k in ("fondo", "pintar", "rellenar"):
            if k in paso: poli(paso[k], CIAN, "limpiar: " + k)
        if "linea" in paso: linea(paso["linea"], CIAN)
    if r:
        linea(r.get("mandibula", []), ROJO, "mandíbula")
        linea([(r["x_min"], r["corte_y"]), (1122, r["corte_y"])], ROJO, "corte")
        punto(r["pivote"], ROJO, "pivote cabeza")
        for lado, pts in r.get("ojos", {}).items(): poli(pts, VERDE, "ojo " + lado)
        for lado, pts in r.get("cejas", {}).items(): poli(pts, VERDE, "ceja " + lado)
        if "boca" in r: poli(r["boca"], VERDE, "boca")
        for k, p in r.get("pivotes", {}).items(): punto(p, VERDE, k)
        for z in r.get("borrar", []): poli(z["zona"] if isinstance(z, dict) else z, ROJO, "borrar")
        for z in r.get("excluir_piel", []) + r.get("excluir", []): poli(z, ROJO, "excluir")
        m = r.get("melena")
        if m: poli(m["zona"], MOR, "melena"); linea([m["raiz"], m["fin"]], MOR, "eje melena")
    if f:
        poli(f["cuello_corte"], ROJO, "corte cuello"); poli(f["pelvis_corte"], ROJO, "corte pelvis")
        punto(f["pelvis"], ROJO, "pelvis")
        for n, b in f.get("brazos", {}).items():
            poli(b["poli"], NAR, n)
            linea([b["hombro"], b["codo"], b["muneca"]], NAR)
            for k in ("hombro", "codo", "muneca"): punto(b[k], NAR, k)
            for l in (b.get("reparar") or {}).get("lineas", []): linea(l, NAR)
        t = f.get("torso", {})
        if t:
            poli(t["poli"], AZUL, "torso")
            for z in t.get("manos", []): poli(z, AZUL, "mano")
            for z, _ in t.get("rellenos", []) + t.get("forzar", []): poli(z, AZUL)
            for pts, _, _ in t.get("lineas", []): linea(pts, AZUL)
        p = f.get("piernas", {})
        if p:
            (y0, x0), (y1, x1) = p["separa"]; linea([(x0, y0), (x1, y1)], AMA, "separa")
            for lado in ("cerca", "lejos"):
                linea([p[lado]["cadera"], p[lado]["tobillo"]], AMA, lado)
                punto(p[lado]["cadera"], AMA); punto(p[lado]["tobillo"], AMA)
            z = p.get("zapato")
            if z: punto(z["tobillo"], AMA, "tobillo zapato"); linea([(z["x"][0], z["y_suela"]), (z["x"][1], z["y_suela"])], AMA, "suela")
    for x, y in cfg.get("huecos_fondo", []): punto((x, y), (0, 200, 220), "hueco")
    return out


def pinta(src, out, x0, y0, x1, y1, esc, paso, elementos):
    im = Image.open(src).convert("RGB").crop((x0, y0, x1, y1))
    im = im.resize((int(im.width * esc), int(im.height * esc)), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    T = lambda p: ((p[0] - x0) * esc, (p[1] - y0) * esc)
    for x in range((x0 // paso + 1) * paso, x1, paso):
        X = (x - x0) * esc; fuerte = x % (paso * 5) == 0
        d.line([(X, 0), (X, im.height)], fill=(255, 120, 120) if fuerte else (255, 205, 205), width=1)
        if fuerte or esc >= 2: d.text((X + 2, 2), str(x), fill=(190, 0, 0), font=F)
    for y in range((y0 // paso + 1) * paso, y1, paso):
        Y = (y - y0) * esc; fuerte = y % (paso * 5) == 0
        d.line([(0, Y), (im.width, Y)], fill=(120, 120, 255) if fuerte else (205, 205, 255), width=1)
        if fuerte or esc >= 2: d.text((2, Y + 2), str(y), fill=(0, 0, 190), font=F)
    for tipo, pts, col, et in elementos:
        P = [T(p) for p in pts]
        if tipo == "poli" and len(P) > 2: d.polygon(P, outline=col); d.line(P + [P[0]], fill=col, width=2)
        elif tipo == "linea" and len(P) > 1: d.line(P, fill=col, width=2)
        elif tipo == "punto": x, y = P[0]; d.ellipse([x - 4, y - 4, x + 4, y + 4], outline=col, width=2)
        if et and P: d.text((P[0][0] + 5, P[0][1] - 12), et, fill=col, font=F)
    im.save(out); print(out)


def main():
    a = sys.argv[1:]
    def opt(n, defecto=None):
        nonlocal a
        if n in a: i = a.index(n); v = a[i + 1]; a = a[:i] + a[i + 2:]; return v
        return defecto
    zona, esc, paso = opt("--zona"), float(opt("--esc", "0")), int(opt("--paso", "0"))
    ident = a[0]; salida = pathlib.Path(a[1]) if len(a) > 1 else pathlib.Path(".")
    salida.mkdir(parents=True, exist_ok=True)
    if ident.endswith(".png"): src, cfg, ident = pathlib.Path(ident), None, pathlib.Path(ident).stem
    else: cfg = cargar_cfg(ident); src = RAIZ / cfg["fuente"]
    el = capa(cfg)
    if zona:
        x0, y0, x1, y1 = map(int, zona.split(","))
        pinta(src, salida / f"{ident}-zona.png", x0, y0, x1, y1, esc or 3, paso or 10, el)
    else:
        pinta(src, salida / f"{ident}-figura.png", 0, 0, 470, 1402, esc or 1.4, paso or 20, el)
        pinta(src, salida / f"{ident}-retrato.png", 400, 120, 1122, 1320, esc or 1.1, paso or 20, el)


if __name__ == "__main__":
    main()
