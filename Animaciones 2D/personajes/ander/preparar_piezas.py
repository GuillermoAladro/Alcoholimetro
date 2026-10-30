#!/usr/bin/env python3
"""Piezas de Ander a partir de su avatar 2D (Avatares 2D/Ander/Ander-2D.png).

Solo datos: coordenadas en píxeles de su hoja (1122 × 1402). El recorte lo hace
personajes/comun/preparar.py. Para revisar o ajustar las coordenadas:
    python3 personajes/comun/ver_hoja.py ander [carpeta]
Uso: python3 preparar_piezas.py [ruta_avatar] [carpeta_salida] [carpeta_depuracion]

Lleva sudadera azul con capucha: las mangas son azules (los brazos son mangas con la mano dibujada
aparte) y la capucha, detrás del cuello, va con el torso. En la figura tiene las manos metidas en los
bolsillos del vaquero y asoman por encima del bajo de la sudadera: se quitan de la hoja antes de
trocear (pasos «limpiar»), así el torso con los brazos en los bolsillos y las piernas quedan limpios
y la mano la dibuja el muñeco cuando la saca.
"""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "comun"))
import preparar

TINTA = [12, 10, 12]
SUDADERA = [104, 124, 172]
SUDADERA_SOMBRA = [70, 84, 124]
VAQUERO = [130, 158, 195]
COSTURA = [62, 80, 118]
PIEL = [253, 178, 112]

CFG = {
    "id": "ander",
    "fuente": "Avatares 2D/Ander/Ander-2D.png",
    "rotulo": (0, 0, 300, 75),
    "sin_vaquero": True,                                   # la sudadera también es azul: no se distingue por color
    # ---------------------------------------------------------------- retoques de la hoja
    "limpiar": [
        # manos metidas en los bolsillos → sudadera (arriba del bajo) y vaquero (abajo); la mano la dibuja el muñeco
        {"rellenar": [(126, 614), (172, 611), (195, 634), (182, 657), (163, 676), (124, 664)], "radio": 7},
        {"rellenar": [(354, 624), (372, 615), (400, 617), (413, 640), (407, 665), (383, 668), (357, 650)], "radio": 7},
        {"pintar": [(124, 612), (196, 612), (199, 636), (124, 646)], "color": SUDADERA},
        {"pintar": [(124, 646), (199, 636), (196, 660), (182, 660), (163, 678), (124, 668)], "color": VAQUERO},
        {"pintar": [(352, 615), (414, 615), (416, 646), (352, 636)], "color": SUDADERA},
        {"pintar": [(352, 636), (416, 646), (410, 668), (383, 670), (356, 652)], "color": VAQUERO},
        # bajo de la sudadera y abertura de los bolsillos
        {"linea": [(120, 648), (150, 643), (178, 639), (204, 636)], "color": TINTA, "ancho": 5},
        {"linea": [(346, 635), (372, 641), (396, 646), (418, 650)], "color": TINTA, "ancho": 5},
        {"linea": [(196, 648), (176, 660), (154, 672), (130, 680)], "color": COSTURA, "ancho": 4},
        {"linea": [(360, 646), (378, 658), (396, 668), (414, 676)], "color": COSTURA, "ancho": 4},
    ],
    # hueco blanco encerrado que es fondo: entre el antebrazo cercano y el torso
    "huecos_fondo": [(131, 509)],
    "piel_ref": PIEL,
    # ---------------------------------------------------------------- retrato
    "retrato": {
        "x_min": 525,
        "corte_y": 830,
        "pivote": (720, 812),                              # punto del retrato que va sobre el cuello del cuerpo
        # línea negra de la mandíbula (borde de abajo de la barba), por su centro; los pelos de la barba la
        # tocan, así que se busca en una ventana estrecha
        "mandibula": [(640, 689), (652, 702), (664, 714), (676, 725), (688, 735), (700, 745), (712, 756), (724, 764),
                      (736, 773), (748, 781), (760, 789), (772, 796), (784, 804), (796, 809), (808, 812), (832, 815),
                      (856, 820), (868, 817), (880, 813), (892, 798), (904, 782), (916, 765), (928, 746), (940, 726),
                      (952, 702), (964, 677)],
        "mandibula_ventana": 5,
        "cortar_bajo_mandibula": True,                      # cuello y capucha del retrato fuera (el cuello es el del cuerpo)
        "fundido_pelo": 0,                                  # pelo corto: el borde de abajo es la mandíbula
        "excluir": [
            # capucha y cuello a la izquierda, bajo la oreja
            [(430, 650), (575, 650), (605, 690), (636, 700), (636, 1402), (430, 1402)],
            # capucha a la derecha, detrás de la barbilla
            [(965, 740), (1122, 740), (1122, 1402), (965, 1402)],
        ],
        "ojos": {
            # blanco e iris, por dentro de la raya gruesa de las pestañas (la redibuja el párpado)
            "d": [(764, 482), (775, 480), (790, 481), (805, 484), (820, 488), (835, 493), (848, 498), (854, 504),
                  (856, 512), (852, 522), (845, 525), (835, 522), (822, 518), (808, 513), (795, 509), (782, 505),
                  (772, 500), (766, 493)],
            "i": [(918, 543), (926, 541), (936, 543), (946, 547), (956, 551), (966, 556), (975, 562), (979, 570),
                  (976, 579), (968, 584), (958, 583), (948, 579), (938, 574), (928, 568), (921, 560), (918, 551)],
        },
        "cejas": {
            "d": [(735, 446), (745, 436), (770, 428), (800, 423), (830, 425), (855, 432), (878, 443), (898, 455),
                  (912, 470), (916, 490), (912, 503), (900, 500), (885, 485), (865, 471), (840, 461), (810, 455),
                  (780, 452), (755, 453), (738, 452)],
            "i": [(916, 529), (922, 515), (932, 503), (945, 496), (962, 494), (980, 497), (996, 503), (1007, 512),
                  (1012, 522), (1011, 533), (1000, 531), (985, 527), (968, 523), (950, 522), (935, 525), (922, 532)],
        },
        "ceja_umbral": 250,                                 # solo lo oscuro (la sombra del párpado se queda en la cara)
        "boca": [(780, 650), (800, 645), (830, 643), (858, 648), (879, 660), (896, 678), (910, 694), (906, 704),
                 (894, 702), (874, 691), (854, 683), (830, 677), (805, 671), (784, 664)],
        "boca_umbral": -1,                                  # la pieza de la boca es la zona entera (labios incluidos)
        "pivotes": {"ceja_d": (825, 448), "ceja_i": (965, 513), "boca": (845, 668)},
    },
    # ---------------------------------------------------------------- figura
    "figura": {
        "x_max": 565,
        "pelvis": (262, 690),
        "cuello_corte": [(120, 0), (470, 0), (470, 200), (120, 200)],
        # todo lo de debajo del bajo de la sudadera es de las piernas
        "pelvis_corte": [(0, 655), (110, 652), (130, 646), (204, 637), (275, 650), (346, 636), (372, 642), (418, 651),
                         (470, 652), (600, 652), (600, 1402), (0, 1402)],
        "pelo_hasta_y": 0,
        "brazos": {
            # el izquierdo de él (a la derecha en pantalla)
            "brazo": {
                "poli": [(372, 292), (398, 296), (416, 325), (426, 360), (434, 400), (440, 440), (447, 480), (454, 520),
                         (451, 560), (448, 600), (441, 626), (429, 643), (410, 632), (385, 628), (364, 617), (357, 590),
                         (361, 560), (366, 520), (368, 480), (366, 440), (364, 400), (362, 360), (364, 320)],
                "hombro": (398, 335), "codo": (442, 482), "muneca": (393, 628),
                "radio": 34, "ancho": 70, "sobre": 50,
            },
            # el derecho de él (a la izquierda en pantalla)
            "brazo_cerca": {
                "poli": [(60, 280), (98, 269), (122, 284), (134, 310), (137, 340), (135, 380), (134, 420), (133, 460),
                         (131, 490), (137, 530), (146, 560), (161, 585), (183, 604), (188, 624), (162, 630), (131, 641),
                         (100, 650), (77, 631), (54, 601), (34, 561), (19, 521), (21, 470), (25, 420), (31, 370), (41, 320)],
                "hombro": (86, 322), "codo": (34, 500), "muneca": (152, 624),
                "radio": 38, "ancho": 80, "sobre": 54,
            },
        },
        "torso": {
            # arriba sigue el borde de la capucha (fuera queda fondo) y la columna del cuello
            "poli": [(212, 120), (338, 120), (340, 204), (337, 223), (347, 231), (355, 252), (361, 274), (372, 283), (388, 292),
                     (400, 303), (405, 322), (398, 340), (380, 350), (374, 360), (371, 420), (369, 480), (371, 540), (370, 600), (372, 645), (128, 650), (128, 600),
                     (129, 540), (129, 480), (130, 420), (130, 360), (128, 300), (126, 262), (128, 242), (135, 226),
                     (147, 203), (162, 196), (178, 193), (197, 191), (207, 189), (212, 170)],
            "manos": [],
            "rellenos": [
                # costados y bajo de la sudadera que tapaban las mangas
                ([(124, 290), (190, 290), (205, 560), (205, 650), (124, 655)], SUDADERA),
                ([(355, 280), (376, 280), (408, 300), (408, 332), (378, 352), (376, 650), (340, 650), (352, 560)], SUDADERA),
            ],
            # se pinta aunque no estuviera tapado: el cuello sube por detrás de la barbilla de la cabeza grande
            "forzar": [([(212, 120), (338, 120), (340, 200), (322, 212), (300, 226), (280, 221), (258, 210), (238, 199),
                         (222, 190), (212, 182)], PIEL)],
            "lineas": [
                # lados del cuello (sube por detrás de la cabeza)
                ([(214, 120), (212, 160), (210, 184)], TINTA, 4),
                ([(337, 120), (339, 170), (341, 198)], TINTA, 4),
                # costados de la sudadera bajo las mangas
                ([(136, 296), (132, 360), (131, 430), (130, 500), (130, 570), (127, 646)], TINTA, 5),
                ([(368, 300), (371, 360), (370, 430), (368, 500), (369, 570), (371, 640)], TINTA, 5),
                # bajo de la sudadera junto a las caderas
                ([(124, 650), (150, 645), (178, 640), (204, 637)], TINTA, 5),
                ([(346, 635), (360, 639), (376, 643)], TINTA, 5),
            ],
        },
        "piernas": {
            "separa": [(700, 268), (1260, 262)],           # recta (y, x) entre las dos piernas
            "desde_y": 640,
            "cerca": {"x": (55, 272), "cadera": (195, 690), "tobillo": (124, 1258),
                      "dobladillo": [(60, 1254), (100, 1246), (150, 1243), (190, 1240)]},
            "lejos": {"x": (258, 458), "cadera": (335, 690), "tobillo": (390, 1262),
                      "dobladillo": [(324, 1274), (360, 1268), (400, 1262), (430, 1254), (452, 1244)]},
            "oscurecer_lejos": 0.8,
            "color_cupula": VAQUERO,
            "zapato": {"x": (322, 562), "tobillo": (390, 1262), "y_tope": 1258, "y_suela": 1350, "bajo_de": "lejos",
                       "collar": (34, 16), "color_collar": (236, 232, 230),
                       "nivelar": [(338, 1328), (520, 1348)]},
        },
    },
    "paleta": {"piel_sombra": [212, 126, 72], "pelo": [85, 55, 38], "barba": [150, 105, 75], "sudadera": SUDADERA,
               "sudadera_sombra": SUDADERA_SOMBRA, "vaquero": VAQUERO, "tinta": TINTA},
    "paleta_muestras": {"piel": [(690, 490), (712, 490), (712, 512), (690, 512)],
                        "iris": [(796, 496), (802, 496), (802, 502), (796, 502)]},
}

if __name__ == "__main__":
    preparar.construir(CFG)
