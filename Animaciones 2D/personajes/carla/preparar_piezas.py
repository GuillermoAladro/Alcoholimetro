#!/usr/bin/env python3
"""Piezas de Carla a partir de su avatar 2D (Avatares 2D/Carla/Carla-2D.png).

Solo datos: coordenadas en píxeles de su hoja (1122 × 1402). El recorte lo hace
personajes/comun/preparar.py. Para revisar o ajustar las coordenadas:
    python3 personajes/comun/ver_hoja.py carla [carpeta]
Uso: python3 preparar_piezas.py [ruta_avatar] [carpeta_salida] [carpeta_depuracion]

Melena larga ondulada que en la figura cae por delante de los dos hombros y tapa medio torso. El
detector de pelo confundiría el top negro y la tinta de los contornos con pelo, así que en la figura
no se usa: la melena se quita antes de trocear con polígonos («limpiar») y se rehace lo que tapaba
(piel del hombro lejano y del pecho, tirante, top negro, cara de dentro de los brazos y los huecos
entre brazos y torso). El pelo lo trae la cabeza del retrato y la melena que se balancea.
Los aros y el collar se borran (de la cabeza y del pecho) y se dibujan aparte para que se muevan
(carla.js). Botines negros de tacón: la pieza del pie es el botín de perfil, con la suela nivelada
entre el tacón y la planta.
"""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "comun"))
import preparar

TINTA = [12, 10, 12]
PIEL = [254, 185, 125]
TOP = [37, 37, 43]
VAQUERO = [108, 144, 194]
COSTURA = [52, 70, 104]
COSTURA_CLARA = [120, 146, 186]

CFG = {
    "id": "carla",
    "fuente": "Avatares 2D/Carla/Carla-2D.png",
    "rotulo": (0, 0, 175, 70),
    # ---------------------------------------------------------------- retoques de la hoja
    "limpiar": [
        # collar de la figura (cadena fina y colgante): fuera; lo dibuja carla.js y se mece
        {"rellenar": [(172, 252), (200, 262), (228, 272), (250, 276), (262, 272), (282, 262), (300, 256), (300, 268),
                      (270, 282), (258, 292), (244, 292), (226, 284), (198, 274), (170, 264)], "radio": 5},
        # puntas de la melena del retrato: el marco del retrato la corta en recto; se le dan puntas de mechón
        {"fondo": [(884, 1000), (905, 1052), (926, 992), (955, 1062), (981, 1002), (1010, 1076), (1036, 1010), (1064, 1082), (1090, 1022), (1112, 1064), (1122, 1040), (1122, 1145), (884, 1145)]},
        {"linea": [(884, 1000), (905, 1052), (926, 992), (955, 1062), (981, 1002), (1010, 1076), (1036, 1010), (1064, 1082), (1090, 1022), (1112, 1064), (1122, 1040)], "color": [40, 22, 14], "ancho": 3},
        # ---- la melena que cae por delante del cuerpo
        # piel del pecho (bajo el escote), del hombro lejano y de la cara de dentro del brazo lejano, lisa;
        # el tatuaje del antebrazo se queda. El escote del lado cercano y el hombro cercano son los del avatar.
        {"pintar": [(140, 253), (165, 250), (190, 242), (212, 222), (268, 222), (290, 246), (320, 258), (345, 264), (360, 268),
                    (372, 276), (379, 284), (382, 292), (384, 302), (386, 318), (388, 334), (389, 350), (389, 370), (390, 390),
                    (391, 406), (380, 412), (376, 430), (372, 445), (368, 460), (364, 470), (356, 480), (348, 480), (348, 352),
                    (256, 352), (248, 349), (210, 345), (174, 336), (164, 300), (150, 270)], "color": PIEL},
        # cara de dentro del brazo cercano, junto a su borde
        {"pintar": [(139, 330), (131, 360), (124, 380), (117, 400), (110, 420), (104, 440), (98, 458), (95, 476), (88, 472),
                    (96, 452), (103, 432), (110, 412), (117, 392), (124, 372), (132, 345)], "color": PIEL},
        # el top entero, liso (bajo el escote del avatar, que se conserva en el centro)
        {"pintar": [(133, 378), (171, 340), (210, 352), (248, 356), (290, 355), (350, 354), (350, 400), (350, 470), (348, 488),
                    (347, 520), (348, 547), (142, 548), (152, 535), (163, 510), (165, 480), (160, 445), (155, 420), (145, 400)],
         "color": TOP},
        # huecos entre los brazos y el top, y el rizo suelto junto al brazo lejano: fondo
        {"fondo": [(133, 378), (145, 400), (155, 420), (160, 445), (165, 480), (163, 510), (152, 535), (142, 548), (140, 548),
                   (124, 518), (110, 500), (95, 478), (98, 458), (104, 440), (110, 420), (117, 400), (124, 380)]},
        {"fondo": [(350, 478), (358, 478), (363, 490), (364, 520), (365, 552), (348, 552), (347, 520), (348, 488)]},
        {"fondo": [(397, 384), (412, 384), (412, 430), (403, 430), (401, 418), (398, 400)]},
        # contornos, tirantes, escote y pliegues del top que quedaron tapados
        {"linea": [(98, 252), (120, 248), (140, 253), (165, 250), (190, 241), (212, 230)], "color": TINTA, "ancho": 4},
        {"linea": [(154, 250), (162, 290), (171, 333)], "color": TOP, "ancho": 7},
        {"linea": [(139, 330), (131, 360), (124, 380), (117, 400), (110, 420), (104, 440), (98, 458), (95, 476)], "color": TINTA, "ancho": 5},
        {"linea": [(95, 478), (110, 500), (124, 518), (140, 548), (150, 558)], "color": TINTA, "ancho": 5},
        {"linea": [(171, 336), (150, 356), (133, 378), (145, 400), (155, 420), (160, 445), (165, 480), (163, 510), (152, 535),
                   (142, 548)], "color": TINTA, "ancho": 5},
        {"linea": [(267, 228), (290, 246), (320, 258), (345, 264), (362, 270), (375, 277), (381, 286)], "color": TINTA, "ancho": 4},
        {"linea": [(392, 384), (393, 398), (395, 406), (396, 414), (397.5, 422), (398.5, 430)], "color": TINTA, "ancho": 4},
        {"linea": [(350, 350), (350, 400), (350, 470), (348, 488), (347, 520), (348, 547)], "color": TINTA, "ancho": 5},
        {"linea": [(351, 468), (357, 478), (363, 490), (364, 520), (365, 550)], "color": TINTA, "ancho": 5},
        {"linea": [(256, 351), (290, 351), (325, 350), (350, 350)], "color": TINTA, "ancho": 4},
        {"linea": [(325, 351), (330, 305), (336, 263)], "color": TOP, "ancho": 8},
        {"linea": [(198, 262), (222, 270), (246, 268)], "color": [217, 136, 83], "ancho": 3},
        {"linea": [(266, 266), (290, 262), (316, 266)], "color": [217, 136, 83], "ancho": 3},
        {"linea": [(241, 324), (244, 336), (246, 346)], "color": [217, 136, 83], "ancho": 2},
        {"linea": [(176, 398), (212, 408), (250, 411), (298, 405), (334, 394)], "color": [20, 20, 25], "ancho": 3},
        {"linea": [(172, 498), (210, 507), (248, 510)], "color": [20, 20, 25], "ancho": 2},
        {"linea": [(262, 514), (300, 511), (334, 503)], "color": [20, 20, 25], "ancho": 2},
    ],
    # huecos blancos encerrados que son fondo: entre brazos y torso, entre mechones (figura y retrato)
    "huecos_fondo": [(187, 81), (169, 117), (359, 119), (361, 134), (155, 151), (139, 172), (151, 163), (354, 182),
                     (358, 194), (133, 210), (140, 207), (120, 233), (361, 243), (114, 432), (123, 427),
                     (125, 497), (358, 494), (357, 514),
                     (926, 186), (1006, 233), (587, 317), (1067, 312), (1086, 441), (509, 449), (499, 528), (477, 556),
                     (1043, 615), (1063, 629), (1072, 657), (439, 655), (448, 648), (419, 681), (1057, 765), (1083, 773),
                     (459, 737), (423, 758), (1088, 852), (1079, 872), (1104, 927)],
    "piel_ref": PIEL,
    # ---------------------------------------------------------------- retrato
    "retrato": {
        "x_min": 420,
        "corte_y": 770,                                   # la cabeza acaba aquí; debajo cuelga la melena
        "pivote": (775, 745),                             # punto del retrato que va sobre el cuello del cuerpo
        "mandibula": [(700, 588), (712, 602), (736, 620), (760, 643), (784, 661), (808, 679), (828, 692), (845, 696),
                      (859, 690), (870, 677), (887, 663), (910, 646), (933, 617), (950, 594)],
        "ojos": {
            # blanco e iris, por dentro de la raya gruesa de las pestañas (que se queda en la cabeza)
            "d": [(818, 430), (828, 426), (841, 425), (854, 429), (865, 435), (874, 442), (880, 450), (882, 460),
                  (875, 465), (863, 463), (850, 460), (838, 456), (827, 451), (820, 444), (817, 437)],
            "i": [(933, 486), (943, 479), (957, 476), (972, 478), (984, 485), (990, 493), (986, 502), (975, 509),
                  (962, 509), (950, 504), (939, 497)],
        },
        "cejas": {
            # la cercana empieza a la derecha de los mechones que le caen por encima
            "d": [(828, 384), (850, 384), (876, 389), (900, 399), (921, 410), (930, 422), (927, 435), (914, 428),
                  (894, 417), (870, 408), (848, 402), (828, 400)],
            "i": [(946, 446), (958, 439), (978, 440), (998, 445), (1008, 451), (1013, 461), (1012, 472), (1004, 467),
                  (990, 459), (970, 456), (950, 457)],
        },
        "ceja_umbral": 230,                               # solo el trazo oscuro (la sombra de debajo es de la cara)
        "boca": [(828, 588), (845, 582), (875, 578), (893, 579), (907, 590), (906, 606), (898, 620), (885, 630),
                 (862, 628), (848, 614), (835, 600)],
        "pivotes": {"ceja_d": (878, 406), "ceja_i": (980, 452), "boca": (866, 604)},
        # aros dorados: se borran de la cabeza y se dibujan aparte para que se balanceen (carla.js)
        "borrar_margen": 3,
        "borrar": [
            # aro cercano: a la izquierda pelo (se copia de al lado), a la derecha el cuello
            {"zona": [(646, 506), (674, 503), (690, 514), (692, 545), (686, 572), (660, 575), (644, 556)],
             "corte": [(686, 500), (686, 580)], "A": [-34, 0]},
            # aro lejano: arriba a la izquierda la mejilla (piel), abajo a la derecha pelo; se vuelve a trazar la cara
            {"zona": [(912, 600), (936, 596), (960, 600), (964, 628), (956, 652), (930, 654), (910, 640)],
             "corte": [(968, 562), (950, 594), (933, 617), (908, 648)], "A": "inpaint", "B": [40, 8], "linea": True, "ancho": 4},
        ],
        # melena: la masa larga de la derecha del retrato (pelo ondulado); con espejo y más oscura va detrás
        "melena": {"zona": [(884, 640), (1122, 640), (1122, 1090), (884, 1090)],
                   "raiz": (990, 650), "fin": (1040, 1070), "oscurecer_atras": 0.72},
    },
    # ---------------------------------------------------------------- figura
    "figura": {
        "x_max": 592,
        "pelvis": (246, 668),
        "cuello_corte": [(150, 0), (420, 0), (420, 200), (290, 200), (275, 208), (262, 214), (245, 214), (228, 206),
                         (215, 198), (150, 198)],
        "pelvis_corte": [(0, 652), (108, 652), (130, 655), (178, 662), (225, 675), (246, 700), (268, 675), (322, 662),
                         (370, 655), (392, 652), (600, 652), (600, 1402), (0, 1402)],
        "pelo_hasta_y": 0,                                # la melena de delante ya se quitó en «limpiar»
        "brazos": {
            # el izquierdo de ella (a la derecha en pantalla)
            "brazo": {
                "poli": [(338, 260), (356, 265), (378, 276), (390, 298), (393, 336), (396, 375), (400, 420), (404, 460),
                         (412, 500), (416, 530), (416, 560), (410, 585), (398, 600), (385, 606), (372, 600), (364, 585),
                         (362, 560), (362, 530), (361, 500), (355, 478), (347, 468), (347, 400), (347, 360), (344, 330),
                         (338, 300)],
                "hombro": (370, 300), "codo": (388, 495), "muneca": (385, 590),
                "L1": 192.0, "L2": 116.0, "radio": 32, "ancho": 66, "sobre": 50,
            },
            # el derecho de ella (a la izquierda en pantalla)
            "brazo_cerca": {
                "poli": [(98, 250), (120, 247), (140, 256), (140, 300), (137, 345), (127, 388), (116, 420), (101, 454),
                         (96, 474), (104, 486), (121, 508), (144, 531), (162, 545), (174, 560), (162, 585), (138, 603),
                         (121, 600), (110, 580), (85, 555), (57, 524), (42, 498), (44, 470), (52, 422), (61, 368),
                         (68, 315), (78, 278)],
                "hombro": (102, 298), "codo": (66, 487), "muneca": (142, 575),
                "L1": 192.0, "L2": 116.0, "radio": 34, "ancho": 72, "sobre": 54,
            },
        },
        "torso": {
            "poli": [(212, 130), (268, 130), (267, 228), (285, 245), (310, 255), (335, 262), (352, 266), (350, 300),
                     (347, 345), (343, 400), (341, 460), (343, 500), (348, 540), (362, 550), (373, 572), (380, 600),
                     (383, 640), (386, 668), (104, 668), (110, 640), (118, 605), (128, 575), (136, 548), (139, 500),
                     (139, 460), (137, 400), (137, 345), (140, 300), (140, 256), (160, 251), (185, 245), (205, 238),
                     (212, 228)],
            "manos": [[(116, 556), (165, 550), (196, 572), (194, 604), (168, 616), (126, 616), (112, 596)],
                      [(338, 572), (364, 558), (402, 562), (412, 590), (402, 618), (362, 627), (334, 606)]],
            # colores que se dan por conocidos antes de rellenar: lo que tapaban los antebrazos y las manos
            "rellenos_previos": [
                ([(104, 462), (178, 462), (178, 549), (104, 549)], TOP),
                ([(104, 549), (198, 549), (198, 620), (104, 620)], VAQUERO),
                ([(336, 462), (392, 462), (392, 547), (336, 547)], TOP),
                ([(330, 547), (414, 547), (414, 630), (330, 630)], VAQUERO),
            ],
            # se pinta aunque no estuviera tapado: el cuello sube por detrás de la barbilla de la cabeza grande
            "forzar": [([(212, 130), (268, 130), (267, 230), (213, 230)], PIEL)],
            "lineas": [
                # lados del cuello (sube por detrás de la cabeza)
                ([(214, 130), (213, 180), (212, 228)], TINTA, 4),
                ([(266, 130), (266, 180), (267, 226)], TINTA, 4),
                # costados del top y del vaquero tras los antebrazos
                ([(134, 549), (176, 551)], TINTA, 4),
                ([(330, 546), (362, 549)], TINTA, 4),
                ([(142, 549), (130, 575), (121, 605), (110, 640)], TINTA, 5),
                ([(350, 546), (366, 558), (376, 588), (381, 620), (383, 650)], TINTA, 5),
                # bolsillos delanteros (las manos ya no están dentro)
                ([(124, 572), (142, 588), (162, 598), (188, 604)], COSTURA, 4),
                ([(124, 579), (142, 594), (162, 604), (188, 610)], COSTURA_CLARA, 2),
                ([(380, 596), (366, 605), (350, 611), (334, 612)], COSTURA, 4),
                ([(380, 603), (366, 611), (350, 617), (334, 618)], COSTURA_CLARA, 2),
            ],
        },
        "piernas": {
            "separa": [(700, 246), (1250, 275)],          # recta (y, x) entre las dos piernas
            "desde_y": 620,
            "cerca": {"x": (85, 262), "cadera": (178, 668), "tobillo": (172, 1262),
                      "dobladillo": [(85, 1258), (110, 1262), (141, 1266), (176, 1269), (224, 1263), (262, 1258)]},
            "lejos": {"x": (232, 500), "cadera": (322, 668), "tobillo": (425, 1272),
                      "dobladillo": [(232, 1270), (380, 1284), (388, 1283), (429, 1280), (460, 1270), (491, 1255), (500, 1250)]},
            "oscurecer_lejos": 0.8,
            "color_cupula": VAQUERO,
            # botín negro de tacón (el de perfil); la suela se nivela entre el tacón y la planta
            "zapato": {"x": (380, 592), "tobillo": (425, 1272), "y_tope": 1250, "y_suela": 1356, "bajo_de": "lejos",
                       "collar": (40, 16), "color_collar": (34, 31, 33),
                       "nivelar": [(424, 1334), (530, 1351)]},
        },
    },
    "paleta": {"piel_sombra": [217, 136, 83], "pelo": [96, 58, 34], "labio": [220, 106, 88], "labio_claro": [239, 121, 103],
               "top": TOP, "vaquero": VAQUERO, "tinta": TINTA},
    "paleta_muestras": {"piel": [(70, 330), (95, 330), (95, 350), (70, 350)],
                        "iris": [(826, 440), (832, 440), (832, 446), (826, 446)]},
}

if __name__ == "__main__":
    preparar.construir(CFG)
