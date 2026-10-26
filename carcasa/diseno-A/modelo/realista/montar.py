"""Monta los artefactos: visor del CAD y vista de conexiones, en versión CDN (artefacto) y en línea (zip, sin conexión)."""
import json, sys, os
P = "/tmp/claude-0/-home-claude/659a7a58-c69d-5ef4-bd94-d0aa972c769f/scratchpad/npmthree/package/"
LIBS = ["build/three.min.js", "examples/js/controls/OrbitControls.js", "examples/js/renderers/CSS2DRenderer.js",
        "examples/js/geometries/RoundedBoxGeometry.js", "examples/js/environments/RoomEnvironment.js", "examples/js/utils/BufferGeometryUtils.js"]
R = "/home/claude/realista/"
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


def conexiones(datos, salida, offline):
    cab = open(R + "conexiones_cabeza.html", encoding="utf-8").read()
    js = open(R + "conexiones_script.js", encoding="utf-8").read().replace("/*DATOS*/", json.dumps(datos, separators=(",", ":"), ensure_ascii=False))
    h = cab + scripts(offline) + "<script>\n" + js + "\n</script>\n"
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
