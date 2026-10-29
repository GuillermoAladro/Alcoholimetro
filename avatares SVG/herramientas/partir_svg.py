#!/usr/bin/env python3
"""Separa la hoja SVG de un avatar en un SVG por vista y por expresión.

Uso:
    python3 partir_svg.py "Avatar Guillermo Aladro.svg" "Guillermo Aladro"

Cada grupo con data-caja="x y ancho alto" se guarda como un SVG independiente
con ese viewBox: <carpeta>/vista-frontal.svg, <carpeta>/cara-risa.svg, ...
Los trazos son los mismos de la hoja (sin volver a vectorizar).
"""
import os, re, sys
import xml.etree.ElementTree as ET

NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS)


def main():
    entrada, carpeta = sys.argv[1], sys.argv[2]
    os.makedirs(carpeta, exist_ok=True)
    raiz = ET.parse(entrada).getroot()
    titulo = raiz.find(f"{{{NS}}}title").text.strip()
    hechos = []
    for g in raiz.iter(f"{{{NS}}}g"):
        caja = g.get("data-caja")
        gid = g.get("id", "")
        if not caja or gid.endswith("-firma"):
            continue
        x, y, w, h = caja.split()
        nombre = re.sub(r"^.*?-(vista|cara)-", r"\1-", gid)
        svg = ET.Element(f"{{{NS}}}svg", {"viewBox": f"{x} {y} {w} {h}", "width": w, "height": h,
                                        "role": "img", "aria-label": f"{titulo} · {g.get('aria-label')}"})
        t = ET.SubElement(svg, f"{{{NS}}}title")
        t.text = f"{titulo} · {g.get('aria-label')}"
        svg.append(g)
        ruta = os.path.join(carpeta, nombre + ".svg")
        ET.ElementTree(svg).write(ruta, encoding="utf-8", xml_declaration=False)
        hechos.append((ruta, os.path.getsize(ruta)))
    for r, s in hechos:
        print(f"{s / 1e6:6.2f} MB  {r}")


if __name__ == "__main__":
    main()
