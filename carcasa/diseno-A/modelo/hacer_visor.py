"""Monta el visor: inyecta los datos y three.js (en línea para el zip, CDN para el artefacto)."""
import json, sys, os
SP = "/tmp/claude-0/-home-claude/659a7a58-c69d-5ef4-bd94-d0aa972c769f/scratchpad/"
P = SP + "npmthree/package/"
LIBS = ["build/three.min.js", "examples/js/controls/OrbitControls.js", "examples/js/renderers/CSS2DRenderer.js"]


def montar(datos, salida, offline):
    h = open("/home/claude/nuevo/visor_plantilla.html", encoding="utf-8").read()
    if offline:
        scripts = "".join(f"<script>/* three.js r147 · {l} */\n{open(P + l, encoding='utf-8').read()}\n</script>\n" for l in LIBS)
    else:
        scripts = "".join(f'<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/{l}"></script>\n' for l in LIBS)
    h = h.replace("<!--THREE-->", scripts).replace("/*DATOS*/", json.dumps(datos, separators=(",", ":"), ensure_ascii=False))
    if offline:
        h = ('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
             '<style>[hidden]{display:none!important}</style>\n</head>\n<body>\n' + h + '\n</body>\n</html>\n')
    open(salida, "w", encoding="utf-8").write(h)
    return len(h)


if __name__ == "__main__":
    datos = {}
    for L in sys.argv[3:]:
        datos[L] = json.load(open(SP + f"{L}.json"))
    print(montar(datos, sys.argv[1], sys.argv[2] == "offline") // 1024, "KB")
