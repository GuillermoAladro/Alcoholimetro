#!/usr/bin/env python3
"""Piezas de Marcos Bombero a partir de su avatar 2D (Avatares 2D/Marcos-Bombero/Marcos-Bombero-2D.png).

Solo datos: coordenadas en píxeles de su hoja (1122 × 1402). El recorte lo hace
personajes/comun/preparar.py. Para revisar o ajustar las coordenadas:
    python3 personajes/comun/ver_hoja.py marcos-bombero [carpeta]
Uso: python3 preparar_piezas.py [ruta_avatar] [carpeta_salida] [carpeta_depuracion]

En la figura sujeta una lanza con la manguera enrollada en el suelo. La manguera, la lanza y la mano
que la agarra se quitan de la hoja antes de trocear (pasos «limpiar»): el muñeco las dibuja aparte
(marcos-bombero.js) para que las escenas se las den, se las quiten o las suelten.
"""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "comun"))
import preparar

TINTA = [12, 10, 12]
PANTALON = [35, 35, 44]
CHAQUETA = [44, 44, 53]
MANGA = [44, 45, 55]
AMARILLO = [253, 245, 53]
GRIS = [174, 178, 188]
PIEL = [253, 186, 134]

CFG = {
    "id": "marcos-bombero",
    "fuente": "Avatares 2D/Marcos-Bombero/Marcos-Bombero-2D.png",
    "rotulo": (0, 0, 345, 60),
    "sin_vaquero": True,                                   # el gris de las bandas reflectantes no es vaquero
    # ---------------------------------------------------------------- retoques de la hoja
    "limpiar": [
        # mano cercana y lanza encima del muslo → pantalón; encima del puño de la manga → manga; bajo de la chaqueta
        {"pintar": [(104, 712), (146, 712), (151, 699), (197, 708), (205, 714), (222, 740), (245, 770), (266, 812),
                    (268, 870), (262, 903), (80, 903), (80, 712)], "color": PANTALON},
        {"pintar": [(94, 679), (144, 679), (146, 712), (94, 714)], "color": MANGA},
        {"pintar": [(144, 688), (195, 688), (201, 708), (151, 700), (144, 700)], "color": CHAQUETA},
        # funde el borde del parche con el pantalón de al lado
        {"rellenar": [(190, 700), (214, 712), (232, 742), (255, 772), (274, 812), (276, 870), (268, 905), (254, 903),
                      (260, 868), (258, 814), (238, 776), (216, 744), (198, 716)], "radio": 7},
        # muñeca lejana que se mete en el bolsillo → pantalón (la mano se dibuja aparte)
        {"pintar": [(403, 676), (427, 676), (430, 700), (403, 700)], "color": CHAQUETA},
        {"pintar": [(403, 700), (430, 700), (435, 712), (424, 720), (408, 720)], "color": PANTALON},
        # lo que había a la izquierda del muslo (mano y manguera) → fondo
        {"fondo": [(55, 714), (103, 714), (103, 905), (55, 905)]},
        # manguera roja (y su contorno) → fondo, sin tocar los contornos del pantalón
        {"fondo": [(0, 690), (372, 690), (372, 1226), (346, 1226), (346, 1345), (0, 1345)], "mascara": "rojo", "dilata": 7, "proteger": "marino"},
        {"fondo": [(0, 690), (372, 690), (372, 1226), (346, 1226), (346, 1345), (0, 1345)], "mascara": "motas", "area": 260},
        # sombras del suelo bajo la bota de perfil
        {"fondo": [(330, 1324), (620, 1324), (620, 1402), (330, 1402)], "mascara": "claro"},
        {"fondo": [(540, 1240), (620, 1240), (620, 1324), (540, 1324)], "mascara": "claro"},
        # contornos y costuras que tapaban la mano y la lanza
        {"linea": [(72, 712), (100, 713), (146, 710)], "color": TINTA, "ancho": 4},          # bajo de la manga
        {"linea": [(144, 680), (146, 710)], "color": TINTA, "ancho": 3},                   # costura manga–chaqueta
        {"linea": [(144, 694), (151, 694), (197, 704), (212, 707)], "color": TINTA, "ancho": 4},   # bajo de la chaqueta
        {"linea": [(104, 714), (104, 780)], "color": TINTA, "ancho": 4},                   # costado del muslo
        {"linea": [(106, 772), (172, 773), (175, 808), (106, 810)], "color": TINTA, "ancho": 4},   # solapa del bolsillo
        {"linea": [(158, 812), (158, 898)], "color": TINTA, "ancho": 3},                   # bolsillo de pierna
        {"linea": [(427, 676), (432, 698), (436, 712)], "color": TINTA, "ancho": 3},       # puño de la manga lejana
        {"linea": [(403, 700), (412, 698), (428, 700)], "color": TINTA, "ancho": 3},       # bajo de la chaqueta (lejos)
    ],
    # huecos blancos encerrados que son fondo: entre la manga cercana y la chaqueta
    "huecos_fondo": [(130, 560), (272, 1100)],
    "piel_ref": [254, 188, 137],
    # ---------------------------------------------------------------- retrato
    "retrato": {
        "x_min": 495,
        "corte_y": 812,
        "pivote": (765, 800),                              # punto del retrato que va sobre el cuello del cuerpo
        # línea negra de la mandíbula con el barboquejo del casco (por su centro)
        "mandibula": [(700, 686), (730, 716), (760, 745), (790, 772), (815, 786), (840, 790), (865, 780), (890, 763),
                      (915, 742), (940, 718), (965, 694)],
        "cortar_bajo_mandibula": True,                      # cuello y solapas del retrato fuera (el cuello es el del cuerpo)
        "fundido_pelo": 0,                                  # no hay melena: el borde de abajo es la mandíbula
        "excluir": [
            # cuello de la chaqueta a la izquierda (la cogotera negra del casco sí se queda)
            [(495, 705), (510, 705), (572, 682), (607, 675), (641, 701), (662, 722), (662, 1402), (495, 1402)],
            # cuello de la chaqueta a la derecha
            [(978, 742), (1122, 742), (1122, 1402), (978, 1402)],
        ],
        "excluir_piel": [[(600, 702), (705, 702), (705, 1402), (600, 1402)]],
        "roja_zona": [(690, 470), (1005, 470), (1005, 720), (950, 742), (840, 800), (760, 772), (690, 690)],
        "ojos": {
            # incluyen la raya gruesa de las pestañas de arriba: la redibuja el párpado del muñeco
            "d": [(776, 517), (785, 511), (795, 507.5), (808, 506), (820, 506.5), (832, 508.5), (843, 512), (851, 519),
                  (856, 528), (855, 537), (851, 541), (846, 543.5), (835, 543.5), (822, 542), (810, 540), (798, 537),
                  (789, 533), (781, 526)],
            "i": [(915, 558), (921, 550), (930, 546.5), (940, 545.5), (950, 547), (958, 551), (965, 557), (970, 565),
                  (967, 574), (960, 578), (950, 578.5), (940, 576.5), (930, 573), (921, 567)],
        },
        "cejas": {
            "d": [(752, 487), (770, 476), (800, 470), (830, 474), (858, 487), (880, 499), (898, 515), (896, 532),
                  (882, 525), (862, 510), (840, 503), (810, 497), (780, 499), (758, 501)],
            "i": [(918, 533), (930, 521), (950, 515), (975, 515), (1000, 521), (1005, 533), (1000, 543), (975, 539),
                  (950, 539), (930, 546)],
        },
        "boca": [(804, 660), (830, 653), (860, 655), (892, 664), (908, 676), (908, 692), (890, 695), (860, 690),
                 (830, 682), (808, 672)],
        "boca_umbral": -1,                                  # la pieza de la boca es la zona entera (labios incluidos)
        "pivotes": {"ceja_d": (825, 500), "ceja_i": (962, 530), "boca": (858, 676)},
    },
    # ---------------------------------------------------------------- figura
    "figura": {
        "x_max": 560,
        "pelvis": (265, 730),
        "cuello_corte": [(150, 0), (440, 0), (440, 232), (150, 232)],
        # todo lo de debajo del bajo de la chaqueta es de las piernas
        "pelvis_corte": [(0, 700), (104, 695), (151, 695), (197, 705), (251, 712), (290, 717), (340, 715), (394, 705),
                         (412, 698), (440, 698), (600, 698), (600, 1402), (0, 1402)],
        "pelo_hasta_y": 0,
        "brazos": {
            # el izquierdo de él (a la derecha en pantalla): la mano va metida en el bolsillo
            "brazo": {
                "poli": [(378, 300), (400, 300), (415, 318), (426, 345), (434, 380), (442, 420), (450, 470), (456, 530),
                         (459, 570), (456, 620), (453, 660), (447, 690), (437, 708), (427, 716), (403, 678), (400, 650),
                         (397, 600), (392, 560), (389, 500), (388, 440), (389, 400), (388, 360), (384, 330)],
                "hombro": (402, 345), "codo": (430, 530), "muneca": (420, 706),
                "radio": 34, "ancho": 74, "sobre": 52,
            },
            # el derecho de él (a la izquierda en pantalla): agarraba la lanza; se corta en el puño de la manga
            "brazo_cerca": {
                "poli": [(158, 316), (140, 316), (110, 321), (87, 330), (62, 374), (44, 436), (28, 499), (18, 542),
                         (21, 592), (31, 632), (45, 668), (61, 700), (72, 715), (100, 716), (147, 713), (147, 690),
                         (143, 640), (138, 600), (126, 590), (116, 566), (116, 540), (127, 526), (142, 506), (147, 470),
                         (149, 430), (152, 390), (155, 350)],
                "hombro": (110, 350), "codo": (66, 545), "muneca": (106, 714),
                "radio": 36, "ancho": 80, "sobre": 52,
            },
        },
        "torso": {
            "poli": [(232, 176), (298, 176), (300, 215), (303, 240), (306, 250), (322, 258), (345, 275), (372, 300),
                     (392, 308), (410, 322), (421, 345), (422, 400), (422, 500), (422, 600), (421, 690), (420, 740),
                     (100, 740), (100, 700), (100, 600), (102, 500), (106, 420), (112, 370), (122, 338), (140, 318),
                     (160, 300), (178, 282), (196, 262), (212, 248), (226, 236), (232, 215)],
            "manos": [],
            "rellenos": [
                # costados de la chaqueta que tapaban las mangas
                ([(98, 318), (160, 318), (160, 712), (98, 712)], CHAQUETA),
                ([(378, 300), (424, 300), (424, 712), (378, 712)], CHAQUETA),
                # bandas reflectantes que siguen por debajo de las mangas (amarillo · gris · amarillo)
                ([(98, 411), (160, 413), (160, 430), (98, 428)], AMARILLO),
                ([(98, 428), (160, 430), (160, 447), (98, 445)], GRIS),
                ([(98, 445), (160, 447), (160, 463), (98, 461)], AMARILLO),
                ([(98, 627), (160, 628), (160, 641), (98, 640)], AMARILLO),
                ([(98, 640), (160, 641), (160, 656), (98, 655)], GRIS),
                ([(98, 655), (160, 656), (160, 669), (98, 668)], AMARILLO),
                ([(378, 425), (424, 426), (424, 438), (378, 437)], AMARILLO),
                ([(378, 437), (424, 438), (424, 452), (378, 451)], GRIS),
                ([(378, 451), (424, 452), (424, 467), (378, 466)], AMARILLO),
                ([(378, 638), (424, 639), (424, 651), (378, 650)], AMARILLO),
                ([(378, 650), (424, 651), (424, 665), (378, 664)], GRIS),
                ([(378, 664), (424, 665), (424, 680), (378, 679)], AMARILLO),
            ],
            # el cuello sube por detrás de la barbilla de la cabeza grande (tapa la barbilla pequeña)
            "forzar": [([(230, 176), (300, 176), (303, 262), (299, 280), (284, 286), (262, 284), (232, 272)], PIEL)],
            "lineas": [
                # lados del cuello
                ([(230, 176), (228, 230), (226, 258), (230, 282)], TINTA, 4),
                ([(300, 176), (302, 230), (304, 256)], TINTA, 4),
                # costados de la chaqueta (bajo las mangas) y bordes de las bandas
                ([(118, 330), (106, 400), (102, 500), (101, 600), (102, 696)], TINTA, 5),
                ([(404, 312), (418, 360), (421, 450), (421, 560), (420, 690)], TINTA, 5),
                ([(100, 411), (152, 414)], TINTA, 2), ([(100, 461), (152, 464)], TINTA, 2),
                ([(100, 627), (152, 628)], TINTA, 2), ([(100, 668), (152, 669)], TINTA, 2),
                ([(386, 425), (420, 426)], TINTA, 2), ([(386, 466), (420, 467)], TINTA, 2),
                ([(386, 638), (420, 639)], TINTA, 2), ([(386, 679), (420, 680)], TINTA, 2),
                # bajo de la chaqueta en los costados
                ([(100, 696), (151, 695)], TINTA, 4), ([(394, 705), (420, 698)], TINTA, 4),
            ],
        },
        "piernas": {
            "separa": [(712, 266), (1260, 272)],           # recta (y, x) entre las dos piernas
            "desde_y": 700,
            "cerca": {"x": (70, 268), "cadera": (185, 735), "tobillo": (134, 1255),
                      "dobladillo": [(80, 1247), (135, 1249), (192, 1247)]},
            "lejos": {"x": (262, 476), "cadera": (345, 735), "tobillo": (402, 1252),
                      "dobladillo": [(340, 1242), (400, 1246), (470, 1244)]},
            "oscurecer_lejos": 0.8,
            "color_cupula": PANTALON,
            "zapato": {"x": (346, 552), "tobillo": (402, 1252), "y_tope": 1250, "y_suela": 1327, "bajo_de": "lejos",
                       "collar": (40, 18), "color_collar": (34, 34, 38),
                       "nivelar": [(360, 1325), (530, 1319)]},
        },
    },
    "paleta": {"piel_sombra": [222, 140, 96], "pelo": [48, 24, 17], "chaqueta": CHAQUETA, "pantalon": PANTALON,
               "amarillo": AMARILLO, "gris": GRIS, "tinta": TINTA},
    "paleta_muestras": {"piel": [(748, 618), (770, 618), (770, 640), (748, 640)],
                        "iris": [(810, 527), (818, 527), (818, 535), (810, 535)]},
}

if __name__ == "__main__":
    preparar.construir(CFG)
