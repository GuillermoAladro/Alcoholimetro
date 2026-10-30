#!/usr/bin/env python3
"""Piezas de Laura a partir de su avatar 2D (Avatares 2D/Laura/Laura-2D.png).

Solo datos: las coordenadas son píxeles de su hoja (1122 × 1402). El recorte lo hace
personajes/comun/preparar.py. Para revisar o ajustar las coordenadas:
    python3 personajes/comun/ver_hoja.py laura [carpeta]
Uso: python3 preparar_piezas.py [ruta_avatar] [carpeta_salida] [carpeta_depuracion]
"""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "comun"))
import preparar

CFG = {
    "id": "laura",
    "fuente": "Avatares 2D/Laura/Laura-2D.png",
    "rotulo": (0, 0, 150, 70),
    # huecos blancos encerrados que son fondo: entre los brazos y el torso, y entre mechones del retrato
    "huecos_fondo": [(139, 486), (363, 489), (490, 596), (450, 748), (433, 795), (1049, 577), (1047, 644),
                     (1061, 792), (1078, 965), (1101, 1070), (1085, 1049)],
    "piel_ref": [254, 186, 130],
    # ---------------------------------------------------------------- retrato
    "retrato": {
        "x_min": 405,
        "corte_y": 772,                                   # la cabeza acaba aquí; debajo cuelga la melena
        "pivote": (790, 760),                             # punto del retrato que va sobre el cuello del cuerpo
        "mandibula": [(640, 640), (690, 668), (740, 694), (790, 712), (820, 718), (850, 707), (880, 686), (905, 660)],
        "excluir_piel": [[(405, 700), (640, 700), (640, 1402), (405, 1402)]],          # hombro y escote del retrato
        "ojos": {
            "d": [(786, 452), (790, 447), (800, 444), (812, 443), (826, 445), (838, 449), (848, 456), (855, 465), (859, 476),
                  (860, 487), (856, 494), (846, 492), (834, 488), (820, 484), (806, 480), (796, 474), (789, 464)],
            "i": [(906, 492), (912, 488), (922, 487), (934, 488), (945, 491), (953, 496), (957, 504), (957, 514), (953, 521),
                  (944, 524), (930, 522), (918, 518), (910, 512), (906, 503)],
        },
        "cejas": {
            "d": [(770, 400), (800, 396), (840, 398), (872, 410), (895, 432), (896, 455), (880, 452), (858, 430), (832, 418),
                  (800, 414), (772, 416)],
            "i": [(926, 462), (940, 452), (962, 449), (985, 452), (998, 462), (998, 474), (982, 468), (960, 464), (942, 468),
                  (928, 474)],
        },
        "boca": [(780, 588), (800, 592), (830, 600), (862, 608), (888, 616), (890, 630), (870, 640), (848, 648), (822, 646),
                 (800, 630), (782, 604)],
        "pivotes": {"ceja_d": (835, 425), "ceja_i": (962, 462), "boca": (835, 612)},
        # aros dorados: se borran de la cabeza y se dibujan aparte para que se balanceen (laura.js)
        "borrar_margen": 3,
        "borrar": [
            # aro cercano: arriba el lóbulo (piel), abajo pelo
            {"zona": [(614, 536), (650, 528), (662, 546), (662, 600), (650, 614), (628, 614), (614, 596)],
             "corte": [(616, 543), (664, 552)], "A": [-48, 0]},          # A = debajo del corte: pelo copiado de la izquierda
            # aro lejano: a la izquierda la mejilla (piel), a la derecha pelo; se vuelve a trazar el contorno
            {"zona": [(898, 598), (918, 594), (940, 598), (956, 618), (954, 650), (936, 666), (912, 666), (894, 646)],
             "corte": [(958, 560), (942, 590), (925, 612), (910, 630), (895, 650), (882, 668)], "linea": True, "ancho": 4},
        ],
        # melena: el mechón largo de la derecha del retrato (cae por delante del hombro: no lo tapa nada)
        "melena": {"zona": [(868, 640), (1122, 640), (1122, 1300), (868, 1300)], "raiz": (968, 660), "fin": (1052, 1222),
                   "oscurecer_atras": 0.72},
    },
    # ---------------------------------------------------------------- figura
    "figura": {
        "x_max": 440,
        "pelvis": (258, 660),
        # todo lo de encima de la mandíbula de la cabeza pequeña sale fuera (la cabeza es la del retrato)
        "cuello_corte": [(150, 0), (440, 0), (440, 200), (330, 200), (300, 206), (290, 212), (276, 216), (262, 216),
                         (242, 210), (226, 202), (150, 202)],
        "pelvis_corte": [(0, 650), (110, 648), (185, 656), (232, 668), (258, 690), (284, 668), (330, 656), (412, 648),
                         (600, 650), (600, 1402), (0, 1402)],
        "pelo_hasta_y": 520,
        "brazos": {
            # el izquierdo de ella (a la derecha en pantalla): el pelo tapaba su cara interior
            "brazo": {
                "poli": [(352, 262), (368, 262), (382, 270), (394, 286), (401, 308), (405, 342), (407, 380), (408, 420),
                         (410, 460), (414, 500), (416, 530), (412, 556), (406, 568), (366, 551), (362, 528), (358, 506),
                         (356, 484), (354, 460), (351, 430), (349, 396), (346, 360), (343, 326), (338, 296), (336, 274)],
                "hombro": (360, 298), "codo": (398, 472), "muneca": (388, 556),
                "L1": 184.0, "L2": 116.0, "radio": 30, "ancho": 62, "sobre": 50,
                "reparar": {"piel": [252, 182, 126], "quitar_blanco": True,
                            "ancho_linea": 4, "lineas": [[(356, 484), (354, 460), (351, 430), (349, 396), (346, 360), (343, 326), (338, 296), (336, 274)]]},
            },
            # el derecho de ella (a la izquierda en pantalla)
            "brazo_cerca": {
                "poli": [(96, 258), (120, 248), (148, 248), (160, 262), (156, 296), (146, 330), (138, 370), (132, 410),
                         (124, 446), (114, 474), (124, 498), (142, 522), (163, 541), (168, 550), (114, 586), (96, 566),
                         (76, 538), (62, 508), (56, 480), (58, 448), (63, 410), (70, 368), (78, 326), (86, 292)],
                "hombro": (112, 298), "codo": (80, 484), "muneca": (140, 566),
                "L1": 184.0, "L2": 116.0, "radio": 34, "ancho": 70, "sobre": 56,
            },
        },
        "torso": {
            "poli": [(220, 140), (298, 140), (300, 210), (312, 236), (330, 252), (352, 262), (340, 296), (346, 332),
                     (350, 380), (350, 430), (347, 470), (352, 500), (362, 507), (370, 512), (372, 540), (378, 560),
                     (390, 585), (397, 610), (402, 640), (412, 652), (110, 652), (122, 640), (128, 600), (134, 556),
                     (148, 532), (160, 516), (172, 512), (181, 500), (184, 470), (178, 442), (164, 420), (152, 392),
                     (147, 360), (150, 330), (158, 300), (152, 262), (176, 250), (204, 240), (212, 205), (220, 160)],
            "manos": [[(132, 540), (170, 538), (204, 560), (214, 584), (200, 604), (150, 604), (128, 580)],
                      [(330, 548), (350, 540), (390, 540), (408, 562), (400, 598), (360, 600), (334, 576)]],
            "rellenos": [
                # top blanco bajo el pelo que caía por los dos lados
                ([(298, 212), (312, 236), (330, 252), (340, 296), (346, 332), (350, 380), (350, 430), (347, 470), (330, 470),
                  (326, 400), (318, 330), (304, 270), (292, 226)], (232, 226, 228)),
                ([(147, 352), (152, 392), (164, 420), (178, 442), (184, 470), (181, 500), (205, 505), (205, 352)], (232, 226, 228)),
                # piel del hombro lejano junto al tirante
                ([(300, 210), (312, 236), (330, 252), (352, 262), (340, 296), (318, 262), (304, 236)], (252, 182, 128)),
            ],
            # se dan por conocidas antes de rellenar: la cadera del vaquero tras la mano lejana
            "rellenos_previos": [([(350, 512), (370, 512), (372, 540), (378, 560), (390, 585), (397, 612), (352, 612), (346, 560)], (122, 148, 186))],
            # se pinta aunque no estuviera tapado: el cuello sube por detrás de la barbilla de la cabeza grande
            "forzar": [([(220, 140), (298, 140), (296, 214), (224, 214)], (252, 184, 128))],
            "lineas": [
                # tirante y costado del top (los tapaba el pelo)
                ([(292, 214), (304, 238), (322, 262), (338, 292), (346, 332), (350, 380), (350, 430), (347, 470), (352, 500)], (12, 10, 12), 5),
                # costado del top bajo el pelo del lado cercano y línea del hombro
                ([(158, 300), (150, 330), (147, 360), (152, 392), (164, 420), (178, 442), (184, 470), (181, 500), (172, 512)], (12, 10, 12), 5),
                ([(204, 240), (176, 250), (152, 262), (158, 300)], (12, 10, 12), 4),
                ([(352, 262), (340, 296)], (12, 10, 12), 4),
                # costado del vaquero tras la mano lejana
                ([(370, 512), (372, 540), (378, 560), (390, 585), (397, 610)], (12, 10, 12), 4),
                # lados del cuello (sube por detrás de la cabeza)
                ([(224, 140), (222, 180), (219, 214), (212, 240)], (12, 10, 12), 4),
                ([(296, 140), (295, 180), (292, 212)], (12, 10, 12), 4),
                # bolsillos delanteros (las manos ya no están dentro)
                ([(150, 540), (166, 556), (184, 568), (204, 576)], (52, 70, 104), 4),
                ([(152, 546), (168, 561), (186, 573), (204, 581)], (120, 146, 186), 2),
                ([(378, 538), (362, 556), (344, 568), (322, 574)], (52, 70, 104), 4),
                ([(376, 544), (360, 561), (342, 573), (322, 579)], (120, 146, 186), 2),
            ],
        },
        "piernas": {
            "separa": [(676, 258), (1250, 226)],          # recta (y, x) entre las dos piernas
            "desde_y": 620,
            "cerca": {"x": (10, 262), "cadera": (185, 660), "tobillo": (100, 1262)},
            "lejos": {"x": (240, 430), "cadera": (330, 660), "tobillo": (334, 1262)},
            "oscurecer_lejos": 0.8,
            "zapato": {"x": (268, 480), "tobillo": (334, 1262), "y_tope": 1240, "y_suela": 1366, "bajo_de": "lejos", "collar": (36, 22),
                        "nivelar": [(290, 1319), (440, 1349)]},     # la suela del avatar va inclinada: se deja plana
        },
    },
    "paleta": {"piel_sombra": [226, 142, 100], "pelo": [96, 58, 38], "labio": [186, 91, 76], "labio_claro": [220, 125, 105],
               "top": [232, 226, 228], "tinta": [12, 10, 12]},
    "paleta_muestras": {"piel": [(230, 300), (250, 300), (250, 320), (230, 320)],
                        "iris": [(803, 468), (815, 468), (815, 478), (803, 478)]},
}

if __name__ == "__main__":
    preparar.construir(CFG)
