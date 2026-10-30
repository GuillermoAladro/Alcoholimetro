#!/usr/bin/env python3
"""Piezas de Dari a partir de su avatar 2D (Avatares 2D/Dari/Dari-2D.png).

Solo datos: coordenadas en píxeles de su hoja (1122 × 1402). El recorte lo hace
personajes/comun/preparar.py. Para revisar o ajustar las coordenadas:
    python3 personajes/comun/ver_hoja.py dari [carpeta]
Uso: python3 preparar_piezas.py [ruta_avatar] [carpeta_salida] [carpeta_depuracion]

Lleva parka beis con capucha y mangas largas: los brazos son mangas con la mano dibujada aparte y la
capucha, detrás del cuello, va con el torso. Tiene las manos metidas en los bolsillos del vaquero, por
debajo del bajo de la parka: se quitan de la hoja antes de trocear (pasos «limpiar»).

Gafas: la montura del retrato se borra de la hoja (rellenando las varillas, el puente y los aros con lo
de alrededor) y la vuelve a dibujar dari.js encima de los ojos, con la misma geometría (GAFAS, abajo).
Así los párpados, el iris y las cejas se mueven por debajo de las gafas.
"""
import math, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "comun"))
import preparar

TINTA = [12, 10, 12]
PARKA = [210, 176, 130]
PARKA_SOMBRA = [150, 122, 86]
VAQUERO = [147, 171, 208]
COSTURA = [70, 90, 132]
PIEL = [252, 172, 116]

# ---------------------------------------------------------------- gafas (coordenadas del retrato)
# Líneas centrales de la montura; dari.js dibuja exactamente estas mismas (copiadas en GAFAS).
GAFAS = {
    "aro_d": [(729, 474), (744, 471), (789, 478), (833, 496), (858, 509), (861, 517), (849, 545), (837, 569),
              (823, 579), (789, 575), (745, 561), (734, 553), (729, 530)],
    "aro_i": [(905, 522), (949, 537), (993, 551), (1006, 557), (1003, 580), (999, 608), (986, 621), (949, 624),
              (917, 615), (907, 604), (904, 570)],
    "puente": [(858, 509), (884, 513), (905, 522)],
    "varilla_d": [(729, 474), (700, 475), (668, 477), (642, 479)],
    "varilla_i": [(1006, 557), (1026, 563), (1040, 567)],
    "ancho": 9,
}


def banda(pts, mitad, cerrada=False):
    """Cuadriláteros que cubren una polilínea gruesa (para borrar la montura con «rellenar»)."""
    pts = list(pts) + ([pts[0]] if cerrada else [])
    out = []
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        L = math.hypot(x1 - x0, y1 - y0) or 1
        ux, uy = (x1 - x0) / L, (y1 - y0) / L
        nx, ny = -uy * mitad, ux * mitad
        a, b = (x0 - ux * mitad, y0 - uy * mitad), (x1 + ux * mitad, y1 + uy * mitad)
        out.append([(round(a[0] + nx, 1), round(a[1] + ny, 1)), (round(b[0] + nx, 1), round(b[1] + ny, 1)),
                    (round(b[0] - nx, 1), round(b[1] - ny, 1)), (round(a[0] - nx, 1), round(a[1] - ny, 1))])
    return out


# ojos y cejas del retrato: no se tocan al borrar la montura (las cejas, recortadas por encima de la montura)
OJO_D = [(760, 507), (773, 505), (788, 505), (802, 507), (815, 510), (826, 515), (832, 521), (828, 530),
         (820, 535), (806, 533), (792, 530), (779, 526), (768, 520), (761, 514)]
OJO_I = [(905, 551), (918, 549), (932, 552), (946, 557), (958, 563), (965, 570), (962, 578), (952, 581),
         (938, 579), (924, 574), (912, 567), (906, 559)]
CEJA_D = [(745, 452), (765, 444), (790, 446), (815, 455), (840, 466), (862, 478), (878, 492), (880, 500),
          (866, 498), (848, 489), (828, 481), (806, 474), (782, 466), (760, 462), (745, 460)]
CEJA_I = [(902, 508), (912, 500), (930, 494), (952, 496), (972, 504), (986, 514), (988, 524), (978, 526),
          (960, 520), (940, 515), (922, 513), (906, 516)]


def borrar_gafas():
    """Pasos de «limpiar» que quitan la montura del retrato: todo lo que no es piel en una banda a lo largo
    de cada pieza de la montura (aros, puente, varillas) se rellena de una vez desde lo de alrededor, sin
    tocar ojos ni cejas. El tinte del cristal sobre el pelo (a la derecha del aro lejano) pasa a ser pelo y
    se vuelve a trazar el contorno de la cara que tapaba."""
    zonas = []
    for clave, cerrada in (("aro_d", True), ("aro_i", True), ("puente", False), ("varilla_d", False), ("varilla_i", False)):
        zonas += banda(GAFAS[clave], 11, cerrada)
    zonas.append([(738, 474), (772, 474), (772, 500), (738, 500)])            # brillo del cristal cercano
    tinte = [(976, 546), (1013, 556), (1011, 612), (991, 629), (962, 630), (966, 610), (972, 586)]
    # trozos de montura que van sobre piel lisa (puente, aro cercano por abajo y por fuera, aro lejano por
    # dentro y por abajo): primero se pintan de piel, así el relleno de después no arrastra lo oscuro de las
    # cejas y del pelo hacia la cara
    sobre_piel = (banda([(729, 496), (729, 474), (744, 471), (789, 478), (833, 496), (856, 508), (884, 513), (906, 522)], 11)
                  + banda([(861, 517), (849, 545), (837, 569), (823, 579), (789, 575), (745, 561), (734, 553), (729, 530), (729, 496)], 11)
                  + banda([(905, 534), (904, 570), (907, 604), (917, 615), (949, 624), (986, 621)], 11))
    return [
        {"pintar": tinte, "mascara": "no_piel", "color": [66, 42, 33]},
        {"pintar": sobre_piel, "mascara": "no_piel", "dilata": 1, "color": PIEL, "proteger_zonas": [OJO_D, OJO_I, CEJA_D, CEJA_I]},
        {"rellenar": zonas, "mascara": "no_piel", "dilata": 2, "radio": 7,
         "proteger_zonas": [OJO_D, OJO_I, CEJA_D, CEJA_I]},
        {"linea": [(977, 546), (974, 578), (968, 606), (959, 628)], "color": TINTA, "ancho": 4},
    ]


CFG = {
    "id": "dari",
    "fuente": "Avatares 2D/Dari/Dari-2D.png",
    "rotulo": (0, 0, 220, 75),
    "piel_umbral": {"rb": 95},                             # la parka beis no cuenta como piel
    # ---------------------------------------------------------------- retoques de la hoja
    "limpiar": borrar_gafas() + [
        # manos metidas en los bolsillos → parka (arriba del bajo) y vaquero (abajo); la mano la dibuja el muñeco.
        # El vaquero acaba en x ≈ 122 (izquierda) y x ≈ 410 (derecha): lo que asomaba fuera (puños de las
        # mangas) pasa a ser fondo, para que no se quede pegado a las piernas
        {"rellenar": [(124, 614), (176, 613), (192, 636), (180, 662), (160, 672), (124, 668)], "radio": 7},
        {"rellenar": [(358, 620), (400, 618), (414, 640), (406, 668), (380, 672), (360, 654)], "radio": 7},
        {"fondo": [(96, 628), (121, 628), (121, 690), (96, 690)]},
        {"fondo": [(411, 626), (440, 626), (440, 690), (411, 690)]},
        {"fondo": [(381, 626), (412, 626), (412, 650), (381, 650)]},
        {"pintar": [(122, 619), (184, 619), (190, 634), (122, 648)], "color": PARKA},
        {"pintar": [(122, 648), (190, 634), (196, 650), (182, 664), (160, 674), (122, 672)], "color": VAQUERO},
        {"pintar": [(356, 629), (380, 629), (380, 652), (356, 643)], "color": PARKA},
        {"pintar": [(356, 643), (380, 652), (410, 652), (410, 678), (382, 678), (358, 658)], "color": VAQUERO},
        # bajo de la parka, contorno del vaquero y abertura de los bolsillos
        {"linea": [(123, 649), (146, 643), (168, 639), (190, 636)], "color": TINTA, "ancho": 5},
        {"linea": [(356, 644), (372, 649), (388, 652), (404, 653)], "color": TINTA, "ancho": 5},
        {"linea": [(122, 646), (122, 676)], "color": TINTA, "ancho": 5},
        {"linea": [(409, 650), (410, 680)], "color": TINTA, "ancho": 5},
        {"linea": [(378, 652), (409, 652)], "color": TINTA, "ancho": 4},
        {"linea": [(188, 646), (168, 658), (146, 668), (128, 674)], "color": COSTURA, "ancho": 4},
        {"linea": [(362, 656), (380, 664), (398, 670)], "color": COSTURA, "ancho": 4},
    ],
    # huecos blancos encerrados entre los rizos del retrato: son fondo
    "huecos_fondo": [(823, 217), (960, 260), (680, 261), (554, 353), (1050, 364), (515, 384), (1081, 470), (997, 647)],
    "piel_ref": PIEL,
    # ---------------------------------------------------------------- retrato
    "retrato": {
        "x_min": 470,
        "corte_y": 860,
        "pivote": (790, 845),                              # punto del retrato que va sobre el cuello del cuerpo
        # borde de abajo de la barba (mandíbula), por su centro
        "mandibula": [(632, 640), (636, 670), (645, 700), (660, 716), (677, 728), (700, 746), (724, 764), (750, 783),
                      (777, 801), (800, 814), (820, 822), (840, 822), (858, 818), (878, 806), (898, 790), (918, 768),
                      (940, 738), (952, 712), (961, 685), (970, 660), (977, 633)],
        "mandibula_ventana": 8,
        "cortar_bajo_mandibula": True,                      # cuello y parka del retrato fuera (el cuello es el del cuerpo)
        "fundido_pelo": 0,                                  # pelo corto: el borde de abajo es la mandíbula
        "excluir": [
            # parka y capucha a la izquierda, bajo la oreja
            [(470, 640), (600, 640), (632, 660), (640, 720), (680, 760), (700, 1402), (470, 1402)],
            # capucha a la derecha, detrás de la barba
            [(980, 640), (1122, 640), (1122, 1402), (930, 1402), (930, 780), (960, 720)],
        ],
        "ojos": {"d": OJO_D, "i": OJO_I},             # blanco e iris, por dentro de la raya gruesa de las pestañas
        "cejas": {"d": CEJA_D, "i": CEJA_I},
        "ceja_umbral": 250,                                 # solo lo oscuro (la sombra del párpado se queda en la cara)
        "boca": [(762, 666), (780, 662), (820, 658), (852, 661), (878, 668), (892, 690), (898, 706), (888, 710),
                 (860, 702), (830, 694), (800, 686), (778, 679), (765, 673)],
        "pivotes": {"ceja_d": (812, 472), "ceja_i": (945, 510), "boca": (830, 682)},
    },
    # ---------------------------------------------------------------- figura
    "figura": {
        "x_max": 565,
        "pelvis": (265, 700),
        "cuello_corte": [(120, 0), (470, 0), (470, 205), (120, 205)],
        # todo lo de debajo del bajo de la parka es de las piernas
        "pelvis_corte": [(0, 655), (100, 652), (140, 643), (190, 636), (218, 655), (250, 667), (275, 672), (300, 668),
                         (333, 660), (356, 644), (380, 651), (405, 654), (420, 666), (600, 666), (600, 1402), (0, 1402)],
        "pelo_hasta_y": 0,
        "brazos": {
            # el izquierdo de él (a la derecha en pantalla)
            "brazo": {
                "poli": [(370, 292), (398, 298), (418, 325), (428, 360), (436, 400), (443, 440), (448, 480), (448, 520),
                         (446, 560), (440, 600), (432, 628), (420, 646), (400, 632), (380, 628), (364, 618), (360, 590),
                         (364, 560), (370, 520), (372, 480), (370, 440), (366, 400), (362, 360), (364, 320)],
                "hombro": (395, 335), "codo": (442, 482), "muneca": (393, 628),
                "radio": 34, "ancho": 74, "sobre": 50,
            },
            # el derecho de él (a la izquierda en pantalla)
            "brazo_cerca": {
                "poli": [(56, 284), (98, 272), (124, 286), (134, 312), (138, 340), (136, 380), (135, 420), (135, 460),
                         (136, 500), (142, 535), (150, 565), (160, 590), (176, 606), (176, 622), (156, 626), (128, 634),
                         (100, 640), (78, 628), (56, 600), (36, 562), (20, 520), (20, 470), (25, 420), (32, 370), (42, 320)],
                "hombro": (88, 322), "codo": (34, 495), "muneca": (150, 626),
                "radio": 38, "ancho": 84, "sobre": 54,
            },
        },
        "torso": {
            # arriba sigue el borde de la capucha (fuera queda fondo) y la columna del cuello
            "poli": [(212, 120), (330, 120), (334, 205), (334, 222), (342, 236), (348, 256), (358, 276), (374, 286), (392, 296),
                     (404, 308), (408, 326), (400, 344), (382, 354), (376, 364), (373, 420), (371, 480), (372, 540), (374, 600), (390, 626), (402, 652),
                     (130, 650), (130, 600), (131, 540), (131, 480), (132, 420), (132, 360), (130, 300), (128, 262), (132, 240),
                     (140, 222), (152, 205), (168, 198), (186, 196), (204, 194), (212, 170)],
            "manos": [],
            "rellenos": [
                # costados y bajo de la parka que tapaban las mangas
                ([(124, 290), (190, 290), (205, 560), (205, 650), (124, 655)], PARKA),
                ([(352, 280), (376, 280), (410, 300), (410, 334), (380, 354), (376, 600), (392, 626), (404, 654), (340, 654), (350, 560)], PARKA),
            ],
            # se pinta aunque no estuviera tapado: el cuello sube por detrás de la barbilla de la cabeza grande
            "forzar": [([(212, 120), (330, 120), (332, 204), (316, 214), (296, 226), (276, 222), (256, 212), (236, 202),
                         (222, 196), (212, 188)], PIEL)],
            "lineas": [
                # lados del cuello (sube por detrás de la cabeza)
                ([(214, 120), (212, 160), (210, 190)], TINTA, 4),
                ([(329, 120), (331, 170), (333, 202)], TINTA, 4),
                # costados de la parka bajo las mangas
                ([(138, 300), (134, 360), (133, 430), (132, 500), (132, 570), (129, 646)], TINTA, 5),
                ([(370, 302), (373, 360), (372, 430), (370, 500), (372, 570), (376, 600), (391, 626), (402, 650)], TINTA, 5),
                # bajo de la parka junto a las caderas
                ([(126, 650), (150, 645), (172, 640), (190, 637)], TINTA, 5),
                ([(356, 644), (372, 649), (388, 652), (403, 652)], TINTA, 5),
            ],
        },
        "piernas": {
            "separa": [(700, 268), (1260, 262)],           # recta (y, x) entre las dos piernas
            "desde_y": 640,
            "cerca": {"x": (20, 272), "cadera": (195, 700), "tobillo": (112, 1262),
                      "dobladillo": [(40, 1258), (70, 1260), (100, 1256), (150, 1267), (176, 1280), (200, 1284)]},
            "lejos": {"x": (258, 462), "cadera": (335, 700), "tobillo": (388, 1262),
                      "dobladillo": [(322, 1268), (360, 1262), (400, 1250), (430, 1240), (460, 1230)]},
            "oscurecer_lejos": 0.8,
            "color_cupula": VAQUERO,
            "zapato": {"x": (320, 560), "tobillo": (388, 1262), "y_tope": 1250, "y_suela": 1352, "bajo_de": "lejos",
                       "collar": (34, 16), "color_collar": (236, 232, 230),
                       "nivelar": [(340, 1340), (525, 1348)]},
        },
    },
    "paleta": {"piel_sombra": [214, 128, 78], "pelo": [92, 56, 42], "barba": [92, 60, 45], "parka": PARKA,
               "parka_sombra": PARKA_SOMBRA, "vaquero": VAQUERO, "tinta": TINTA},
    "paleta_muestras": {"piel": [(700, 600), (720, 600), (720, 620), (700, 620)],
                        "iris": [(785, 516), (790, 516), (790, 521), (785, 521)]},
}

if __name__ == "__main__":
    preparar.construir(CFG)
