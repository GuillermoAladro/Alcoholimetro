"""Monta los artefactos: visor del CAD y vista de conexiones, en versión CDN (artefacto) y en línea (zip, sin conexión)."""
import json, sys, os
R = os.path.dirname(os.path.abspath(__file__)) + "/"
# three.js r147 para la versión sin conexión: `npm pack three@0.147.0`, descomprimir y pasar la carpeta en THREE
P = os.environ.get("THREE", "/tmp/claude-0/-home-claude/659a7a58-c69d-5ef4-bd94-d0aa972c769f/scratchpad/npmthree/package/")
LIBS = ["build/three.min.js", "examples/js/controls/OrbitControls.js", "examples/js/renderers/CSS2DRenderer.js",
        "examples/js/geometries/RoundedBoxGeometry.js", "examples/js/environments/RoomEnvironment.js", "examples/js/utils/BufferGeometryUtils.js"]
JS = ["js/lib3d.js", "js/modelos_elec.js", "js/modelos_herr.js", "js/modelos_mesa.js", "js/escena.js"]


def scripts(offline):
    if offline:
        s = "".join(f"<script>/* three.js r147 · {l} */\n{open(P + l, encoding='utf-8').read()}\n</script>\n" for l in LIBS)
    else:
        s = "".join(f'<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/{l}"></script>\n' for l in LIBS)
    s += "".join(f"<script>/* {f} */\n{open(R + f, encoding='utf-8').read()}\n</script>\n" for f in JS)
    return s


def envolver(h):
    return ('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            '<style>[hidden]{display:none!important}</style>\n</head>\n<body>\n' + h + '\n</body>\n</html>\n')


def visor(datos, salida, offline):
    cab = open(R + "visor_cabeza.html", encoding="utf-8").read()
    js = open(R + "visor_script.js", encoding="utf-8").read().replace("/*DATOS*/", json.dumps(datos, separators=(",", ":"), ensure_ascii=False))
    h = cab + scripts(offline) + "<script>\n" + js + "\n</script>\n"
    if offline:
        h = envolver(h)
    open(salida, "w", encoding="utf-8").write(h)
    return len(h)


# el programa de la Pi (el mismo que se instala en la máquina) y su hardware simulado
_REPO = os.path.normpath(os.path.join(R, "../../../../programa")) + "/"  # carcasa/diseno-A/modelo/realista → programa/
PROG = os.environ.get("PROGRAMA", _REPO if os.path.isdir(_REPO) else "/home/claude/programa/")
PROG_JS = ["nucleo/util.js", "nucleo/reloj.js", "nucleo/protocolo_ze29a.js", "nucleo/sensor_ze29a.js", "nucleo/ranking.js",
           "nucleo/almacen.js", "nucleo/sumup.js", "nucleo/cobro.js", "nucleo/textos.js", "nucleo/maquina.js", "nucleo/pantalla.js",
           "sim/fs_memoria.js", "sim/ze29a_sim.js", "sim/sumup_sim.js", "sim/camara_sim.js", "sim/pantalla_solo.js", "sim/simulador.js"]
FUENTES = [("Big Shoulders Display", 700, "big-shoulders-display-latin-700-normal.woff2"), ("Big Shoulders Display", 800, "big-shoulders-display-latin-800-normal.woff2"),
           ("Big Shoulders Display", 900, "big-shoulders-display-latin-900-normal.woff2"), ("Archivo", 400, "archivo-latin-400-normal.woff2"),
           ("Archivo", 600, "archivo-latin-600-normal.woff2"), ("Archivo", 800, "archivo-latin-800-normal.woff2")]


def fuentes_css():
    import base64
    out = []
    for fam, peso, f in FUENTES:
        b = base64.b64encode(open(PROG + "pi/fuentes/" + f, "rb").read()).decode()
        out.append(f'@font-face{{font-family:"{fam}";font-weight:{peso};font-display:block;src:url(data:font/woff2;base64,{b}) format("woff2")}}')
    return "\n".join(out)


def programa_js():
    return "".join(f"<script>/* programa/{f} */\n{open(PROG + f, encoding='utf-8').read()}\n</script>\n" for f in PROG_JS)


def conexiones(datos, salida, offline):
    cab = open(R + "conexiones_cabeza.html", encoding="utf-8").read().replace("/*FUENTES*/", fuentes_css())
    js = open(R + "conexiones_script.js", encoding="utf-8").read().replace("/*DATOS*/", json.dumps(datos, separators=(",", ":"), ensure_ascii=False))
    sim = open(R + "sim_script.js", encoding="utf-8").read()
    h = cab + scripts(offline) + "<script>\n" + js + "\n</script>\n" + programa_js() + "<script>\n" + sim + "\n</script>\n"
    if offline:
        h = envolver(h)
    open(salida, "w", encoding="utf-8").write(h)
    return len(h)


if __name__ == "__main__":
    SP = "/tmp/claude-0/-home-claude/659a7a58-c69d-5ef4-bd94-d0aa972c769f/scratchpad/"
    que = sys.argv[1]
    if que == "visor":
        d = {"A": json.load(open(SP + "A.json"))}
        print("visor", visor(d, sys.argv[2], sys.argv[3] == "offline") // 1024, "KB")
    else:
        d = json.load(open(SP + "conexiones.json"))
        print("conexiones", conexiones(d, sys.argv[2], sys.argv[3] == "offline") // 1024, "KB")
