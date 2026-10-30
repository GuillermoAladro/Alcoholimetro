#!/usr/bin/env python3
"""Piezas de Gabacho a partir de su avatar 2D (Avatares 2D/Gabacho/Gabacho-2D.png).

Solo datos: coordenadas en píxeles de su hoja (1122 × 1402). El recorte lo hace
personajes/comun/preparar.py. Para revisar o ajustar las coordenadas:
    python3 personajes/comun/ver_hoja.py gabacho [carpeta]
Uso: python3 preparar_piezas.py [ruta_avatar] [carpeta_salida] [carpeta_depuracion]

Camiseta de fútbol azul marino de manga corta con el cuello y los puños de rayas: cada brazo es la manga
(con su puño) más el brazo de piel, cortado a la altura del hombro; el hombro redondo del muñeco tapa la
junta. Lo estampado en la camiseta se queda tal cual está en el avatar. Tiene las manos metidas en los
bolsillos del vaquero: los antebrazos llegan hasta la abertura del bolsillo, así que el torso baja hasta
la cintura del vaquero y lo que tapaban los antebrazos se repinta. El azul marino cuenta como «vaquero»
para el detector de color: se desactiva.
"""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "comun"))
import preparar

TINTA = [12, 10, 12]
MARINO = [31, 45, 90]
VAQUERO = [156, 176, 206]
PIEL = [253, 176, 120]

CFG = {
    "id": "gabacho",
    "fuente": "Avatares 2D/Gabacho/Gabacho-2D.png",
    "rotulo": (0, 0, 235, 75),
    "sin_vaquero": True,                                   # el azul marino de la camiseta también es azulado
    "huecos_fondo": [(122, 531)],                         # el hueco blanco entre el bíceps cercano y la camiseta
    # los huecos blancos entre los rizos del retrato son fondo (demasiados para darlos uno a uno); las zonas
    # rodean el pelo y dejan fuera la cara, así los blancos de los ojos y el brillo de la nariz se quedan
    "fondo_blanco_en": [
        [(462, 150), (1122, 150), (1122, 425), (462, 425)],                                 # pelo de arriba
        [(462, 425), (712, 425), (705, 470), (690, 520), (660, 600), (625, 660), (600, 720), (462, 760)],   # izquierda
        [(978, 425), (1122, 425), (1122, 800), (880, 800), (905, 740), (945, 690), (970, 610), (985, 520)],  # derecha
    ],
    "piel_ref": PIEL,
    # ---------------------------------------------------------------- retrato
    "retrato": {
        "x_min": 462,
        "corte_y": 805,
        "pivote": (745, 795),                              # punto del retrato que va sobre el cuello del cuerpo
        # borde de la cara contra el cuello: de debajo de la oreja a la barbilla y subiendo por la mejilla
        "mandibula": [(624, 640), (630, 666), (655, 697), (680, 714), (705, 727), (730, 738), (755, 747), (776, 754),
                      (797, 760), (815, 764), (830, 764), (851, 760), (872, 751), (897, 735), (922, 714), (938, 693),
                      (947, 672), (955, 652), (962, 628), (967, 604)],
        "mandibula_ventana": 6,
        "fundido_pelo": 0,                                  # el pelo acaba en sus rizos, sin desvanecer
        "excluir": [
            # cuello y su sombra bajo la barbilla, siguiendo la línea izquierda del cuello (los rizos se quedan)
            [(624, 640), (630, 666), (655, 697), (680, 714), (705, 727), (730, 738), (755, 747), (776, 754),
             (797, 760), (815, 764), (830, 764), (851, 760), (872, 751), (880, 746), (880, 1402), (462, 1402),
             (462, 762), (562, 762), (571, 742), (578, 724), (585, 706), (590, 690), (594, 668), (615, 660)],
            # camiseta a la derecha, por debajo de los rizos
            [(880, 792), (1122, 792), (1122, 1402), (880, 1402)],
        ],
        "ojos": {
            # blanco e iris, por dentro de la raya gruesa de las pestañas y de la del párpado de abajo
            "d": [(741, 485), (748, 483), (758, 482), (770, 482), (782, 483), (790, 485), (800, 489), (807, 495),
                  (810, 502), (806, 503), (795, 500), (785, 497), (775, 495), (765, 494), (755, 491), (746, 488)],
            "i": [(884, 525), (890, 521), (900, 519), (910, 519), (920, 522), (930, 525), (940, 528), (947, 532),
                  (950, 538), (944, 541), (933, 539), (922, 536), (912, 534), (902, 532), (892, 529)],
        },
        "cejas": {
            "d": [(714, 451), (722, 439), (736, 431), (760, 426), (790, 428), (820, 436), (845, 446), (860, 459),
                  (856, 467), (840, 464), (820, 459), (800, 455), (776, 453), (750, 454), (726, 457)],
            "i": [(887, 476), (894, 466), (905, 460), (920, 460), (940, 464), (958, 470), (971, 478), (973, 489),
                  (967, 498), (954, 494), (940, 490), (920, 486), (902, 485), (891, 481)],
        },
        "ceja_umbral": 250,                                 # solo lo oscuro (la sombra del párpado se queda en la cara)
        "boca": [(738, 598), (750, 593), (770, 597), (800, 602), (830, 606), (860, 613), (880, 623), (895, 635),
                 (901, 647), (894, 655), (880, 651), (860, 646), (835, 641), (810, 634), (785, 627), (765, 621),
                 (748, 615), (739, 608)],
        "boca_umbral": -1,                                  # la pieza de la boca es la zona entera (labios incluidos)
        "pivotes": {"ceja_d": (788, 442), "ceja_i": (930, 476), "boca": (818, 624)},
    },
    # ---------------------------------------------------------------- figura
    "figura": {
        "x_max": 560,
        "pelvis": (255, 720),
        "cuello_corte": [(140, 0), (430, 0), (430, 250), (140, 250)],
        # el torso baja hasta la cintura del vaquero (las muñecas entran en los bolsillos); lo de debajo, piernas
        "pelvis_corte": [(0, 714), (100, 714), (160, 718), (210, 728), (262, 744), (300, 730), (350, 718), (430, 718),
                         (600, 718), (600, 1402), (0, 1402)],
        "pelo_hasta_y": 0,
        "brazos": {
            # el izquierdo de él (a la derecha en pantalla): manga con su puño y antebrazo hasta el bolsillo
            "brazo": {
                "poli": [(334, 329), (357, 327), (372, 337), (386, 352), (395, 372), (400, 405), (404, 437), (410, 465),
                         (416, 484), (411, 495), (414, 510), (418, 533), (422, 567), (421, 590), (418, 620), (413, 650),
                         (408, 670), (403, 681), (385, 667), (362, 651), (369, 640), (367, 622), (362, 605), (353, 578),
                         (351, 558), (351, 530), (349, 505), (350, 490), (350, 462), (346, 428), (342, 395), (339, 362)],
                "hombro": (370, 348), "codo": (391, 570), "muneca": (385, 668),
                "radio": 34, "ancho": 75, "sobre": 50,
            },
            # el derecho de él (a la izquierda en pantalla)
            "brazo_cerca": {
                "poli": [(126, 298), (90, 298), (78, 310), (62, 330), (50, 360), (44, 390), (38, 420), (30, 445),
                         (25, 455), (31, 463), (35, 472), (31, 500), (29, 530), (34, 551), (47, 573), (65, 605),
                         (87, 627), (107, 650), (114, 667), (130, 686), (150, 677), (170, 667), (192, 653), (170, 630),
                         (153, 612), (141, 590), (134, 568), (125, 550), (114, 532), (111, 520), (123, 500), (134, 482),
                         (141, 477), (147, 445), (149, 400), (146, 360), (137, 328)],
                "hombro": (100, 320), "codo": (78, 545), "muneca": (158, 666),
                "radio": 36, "ancho": 78, "sobre": 50,
            },
        },
        "torso": {
            # cuello, camiseta hasta el arranque de las mangas y cintura del vaquero, por dentro del contorno
            "poli": [(201, 130), (294, 130), (294, 256), (291, 272), (288, 284), (297, 291), (318, 308), (342, 320),
                     (357, 327), (334, 329), (339, 362), (342, 395), (346, 428), (350, 462), (356, 490), (359, 515),
                     (363, 545), (368, 575), (372, 605), (375, 630), (376, 648), (392, 656), (400, 668), (402, 690),
                     (402, 716), (402, 760), (103, 760), (105, 750), (109, 740), (110, 725), (112, 705), (116, 695),
                     (110, 685), (102, 665), (105, 652), (108, 630), (113, 605), (120, 575), (127, 545), (134, 510),
                     (141, 477), (147, 445), (149, 400), (146, 360), (137, 328), (126, 298), (90, 298), (120, 289),
                     (151, 279), (174, 271), (184, 266), (192, 259), (200, 256)],
            "manos": [],
            "rellenos": [
                # lo que tapaban los antebrazos: camiseta por encima del bajo y cintura del vaquero por debajo
                # (solo se pinta lo que hay que reconstruir dentro de cada zona, así que las zonas van holgadas)
                ([(95, 470), (200, 470), (200, 646), (150, 666), (110, 688), (95, 690)], MARINO),
                ([(95, 690), (110, 688), (150, 666), (200, 646), (205, 720), (95, 720)], VAQUERO),
                ([(345, 470), (382, 470), (382, 649), (345, 652)], MARINO),
                ([(345, 652), (382, 649), (408, 650), (408, 720), (345, 720)], VAQUERO),
            ],
            # se pinta aunque no estuviera tapado: el cuello sube por detrás de la barbilla de la cabeza grande
            "forzar": [([(201, 130), (294, 130), (294, 246), (272, 252), (250, 254), (226, 250), (201, 246)], PIEL)],
            "lineas": [
                # lados del cuello (sube por detrás de la cabeza)
                ([(201, 130), (201, 190), (201, 252)], TINTA, 4),
                ([(294, 130), (294, 190), (294, 254)], TINTA, 4),
                # costado de la camiseta y esquina del bajo tras el antebrazo cercano
                ([(141, 478), (134, 510), (127, 545), (120, 575), (113, 605), (108, 630), (105, 652)], TINTA, 5),
                ([(110, 686), (150, 666), (192, 647)], TINTA, 4),
                # abertura del bolsillo del vaquero (costura)
                ([(122, 698), (152, 678), (194, 656)], [70, 86, 120], 3),
                # costado de la camiseta tras el antebrazo lejano, bajo y bolsillo
                ([(356, 492), (359, 515), (363, 545), (368, 575), (372, 605), (375, 630), (376, 648)], TINTA, 5),
                ([(358, 652), (376, 648)], TINTA, 4),
                ([(376, 648), (392, 656), (400, 668), (402, 682)], TINTA, 5),
                ([(368, 656), (386, 669), (401, 683)], [70, 86, 120], 3),
            ],
        },
        "piernas": {
            "separa": [(770, 263), (1250, 250)],           # recta (y, x) entre las dos piernas
            "desde_y": 660,
            "cerca": {"x": (36, 262), "cadera": (185, 720), "tobillo": (108, 1250),
                      "dobladillo": [(45, 1192), (52, 1225), (60, 1245), (94, 1250), (131, 1247), (166, 1244), (178, 1228),
                                     (184, 1205)]},
            "lejos": {"x": (250, 452), "cadera": (322, 720), "tobillo": (378, 1272),
                      "dobladillo": [(310, 1215), (318, 1255), (325, 1274), (345, 1281), (362, 1283), (382, 1278),
                                     (400, 1262), (420, 1250), (437, 1243), (448, 1230)]},
            "oscurecer_lejos": 0.8,
            "color_cupula": VAQUERO,
            "zapato": {"x": (316, 547), "tobillo": (378, 1272), "y_tope": 1240, "y_suela": 1352, "bajo_de": "lejos",
                       "collar": (34, 16), "color_collar": (238, 236, 236),
                       "nivelar": [(328, 1326), (530, 1344)]},
        },
    },
    "paleta": {"piel_sombra": [214, 130, 82], "pelo": [94, 56, 39], "camiseta": MARINO, "camiseta_sombra": [20, 29, 62],
               "vaquero": VAQUERO, "tinta": TINTA},
    "paleta_muestras": {"piel": [(820, 650), (850, 650), (850, 680), (820, 680)],
                        "iris": [(898, 524), (905, 524), (905, 531), (898, 531)]},
}

if __name__ == "__main__":
    preparar.construir(CFG)
