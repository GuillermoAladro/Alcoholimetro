#!/usr/bin/env python3
"""Piezas de Rodri a partir de su avatar 2D (Avatares 2D/Rodri/Rodri-2D.png).

Solo datos: coordenadas en píxeles de su hoja (1122 × 1402). El recorte lo hace
personajes/comun/preparar.py. Para revisar o ajustar las coordenadas:
    python3 personajes/comun/ver_hoja.py rodri [carpeta]
Uso: python3 preparar_piezas.py [ruta_avatar] [carpeta_salida] [carpeta_depuracion]

Plumífero negro abierto con capucha sobre camiseta negra, vaqueros y zapatillas; pelo castaño alborotado
con flequillo y barba poblada. Mira a la derecha, como los demás (no hace falta reflejar la hoja). Las
mangas son largas, acolchadas y negras: cada brazo es la manga del plumífero, cortada en el hombro y en el
puño; la mano la dibuja el muñeco. Tiene las manos metidas en los bolsillos del vaquero y asoman bajo el
puño: se quitan de la hoja antes de trocear (pasos «limpiar») y se repinta lo que tapaban (puño, bajo de
la camiseta y cintura del vaquero). El negro del plumífero cuenta como «pelo» para el detector de color:
se desactiva en la figura (pelo_hasta_y 0).
"""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "comun"))
import preparar

TINTA = [12, 10, 14]
PLUMIFERO = [50, 49, 58]
CAMISETA = [33, 31, 39]
VAQUERO = [110, 139, 179]
POCKET = [70, 96, 140]
PIEL = [253, 188, 132]

# borde de abajo de la barba del retrato (de debajo de la oreja a la barbilla y el lado derecho)
MANDIBULA = [(631, 626), (649, 652), (667, 675), (690, 697), (722, 718), (749, 734), (776, 743), (804, 747),
             (831, 746), (854, 741), (870, 732), (886, 718), (904, 698)]

CFG = {
    "id": "rodri",
    "fuente": "Avatares 2D/Rodri/Rodri-2D.png",
    "rotulo": (0, 0, 175, 110),
    "piel_ref": PIEL,
    "huecos_fondo": [(985, 257)],                    # hueco blanco entre mechones del retrato
    # ---------------------------------------------------------------- retoques de la hoja
    "limpiar": [
        # manos metidas en los bolsillos (asoman bajo el puño): solo la piel de la mano y su contorno
        # ("mascara": "piel" ensanchada). Detrás de cada mano queda el puño del plumífero, el bajo de la
        # camiseta y la cintura del vaquero; la mano la dibuja el muñeco.
        # detrás de cada mano está el cuerpo: la camiseta por encima de su bajo y el vaquero por debajo
        # (el puño del plumífero solo la bordea por arriba)
        # cercana
        {"pintar": [(125, 618), (210, 618), (210, 641), (125, 652)], "mascara": "piel", "dilata": 4, "color": CAMISETA},
        {"pintar": [(125, 652), (210, 641), (210, 690), (125, 690)], "mascara": "piel", "dilata": 4, "color": VAQUERO},
        # lejana
        {"pintar": [(345, 625), (412, 625), (412, 650), (345, 645)], "mascara": "piel", "dilata": 4, "color": CAMISETA},
        {"pintar": [(345, 645), (412, 650), (412, 690), (345, 690)], "mascara": "piel", "dilata": 4, "color": VAQUERO},
        # bajo de la camiseta, abertura de los bolsillos y borde del puño (que antes era el contorno de la mano)
        {"linea": [(134, 652), (165, 648), (200, 641)], "color": TINTA, "ancho": 3},
        {"linea": [(136, 671), (165, 660), (196, 641)], "color": POCKET, "ancho": 4},
        {"linea": [(132, 662), (150, 643), (170, 628)], "color": TINTA, "ancho": 4},
        {"linea": [(346, 645), (372, 647)], "color": TINTA, "ancho": 3},
        {"linea": [(350, 647), (375, 660), (402, 676)], "color": POCKET, "ancho": 4},
        {"linea": [(366, 634), (388, 642), (400, 656), (403, 672)], "color": TINTA, "ancho": 4},
    ],
    # ---------------------------------------------------------------- retrato
    "retrato": {
        "x_min": 470,
        "corte_y": 780,
        "pivote": (770, 790),                              # punto del retrato que va sobre el cuello del cuerpo
        "mandibula": MANDIBULA,
        "mandibula_ventana": 6,                            # la barba no tiene raya negra debajo: casi la guía
        "cortar_bajo_mandibula": True,                     # cuello y plumífero del retrato fuera (el cuello es el del cuerpo)
        "fundido_pelo": 0,
        # cuello que queda a la izquierda de la barba, bajo la oreja (solo la piel: el pelo de la nuca se queda)
        "excluir_piel": [[(556, 600), (632, 600), (640, 700), (556, 760)]],
        "excluir": [
            # cuello del plumífero a la izquierda y a la derecha de la barbilla
            [(420, 650), (540, 650), (575, 660), (598, 700), (598, 1402), (420, 1402)],
            [(904, 697), (1122, 680), (1122, 1402), (868, 1402), (868, 736), (888, 718)],
        ],
        "ojos": {
            # blanco e iris, por dentro de la raya gruesa de las pestañas
            "d": [(743, 438), (753, 433), (770, 432), (788, 434), (803, 439), (814, 446), (819, 452), (812, 455),
                  (797, 455), (780, 454), (763, 450), (750, 446), (744, 442)],
            "i": [(903, 474), (913, 471), (926, 471), (938, 474), (950, 479), (958, 487), (962, 496), (955, 499),
                  (943, 498), (930, 494), (918, 489), (908, 484), (903, 479)],
        },
        "cejas": {
            # la del ojo derecho asoma solo por dentro (lo de fuera lo tapa el flequillo)
            "d": [(785, 394), (805, 392), (830, 395), (852, 400), (870, 408), (872, 418), (858, 418), (835, 412),
                  (810, 406), (788, 404)],
            "i": [(898, 450), (914, 442), (934, 440), (952, 444), (968, 453), (958, 459), (938, 455), (918, 455),
                  (902, 457)],
        },
        "ceja_umbral": 250,                                 # solo lo oscuro (el flequillo de encima apenas entra)
        # labios entre el bigote y la perilla
        "boca": [(752, 589), (775, 581), (800, 579), (825, 581), (850, 587), (872, 597), (888, 611), (894, 628),
                 (882, 636), (860, 634), (835, 627), (810, 618), (785, 608), (764, 600)],
        "boca_umbral": -1,                                  # la pieza de la boca es la zona entera (labios incluidos)
        "pivotes": {"ceja_d": (828, 405), "ceja_i": (935, 450), "boca": (822, 607)},
    },
    # ---------------------------------------------------------------- figura
    "figura": {
        "x_max": 560,
        "pelvis": (262, 705),
        "cuello_corte": [(190, 0), (330, 0), (330, 228), (190, 228)],
        # el torso baja hasta la cintura del vaquero (las muñecas entran en los bolsillos); lo de debajo, piernas
        "pelvis_corte": [(0, 708), (118, 708), (165, 714), (215, 720), (262, 730), (312, 720), (362, 714), (470, 708),
                         (600, 708), (600, 1402), (0, 1402)],
        "pelo_hasta_y": 0,                                  # el plumífero negro no es pelo
        "brazos": {
            # el izquierdo de él (a la derecha en pantalla): manga acolchada desde el hombro hasta el puño; el
            # borde de dentro es el pliegue junto al costado del plumífero
            "brazo": {
                "poli": [(352, 282), (378, 290), (398, 304), (414, 328), (425, 368), (436, 410), (446, 450), (453, 490),
                         (458, 520), (456, 560), (451, 600), (446, 630), (432, 654), (414, 670), (400, 680), (388, 676),
                         (380, 660), (376, 640), (372, 610), (372, 570), (371, 530), (371, 490), (370, 450), (369, 410),
                         (367, 370), (362, 335), (355, 305)],
                "hombro": (398, 320), "codo": (428, 500), "muneca": (392, 640),
                "radio": 38, "ancho": 96, "sobre": 52,
            },
            # el derecho de él (a la izquierda en pantalla)
            "brazo_cerca": {
                "poli": [(60, 282), (82, 270), (104, 278), (122, 294), (132, 318), (135, 360), (135, 410), (134, 460),
                         (133, 500), (137, 530), (148, 558), (160, 585), (170, 608), (176, 626), (162, 640), (150, 660),
                         (140, 684), (122, 692), (98, 690), (74, 680), (58, 664), (48, 640), (38, 612), (26, 580),
                         (15, 545), (12, 505), (18, 465), (24, 425), (31, 385), (40, 345), (49, 310)],
                "hombro": (82, 320), "codo": (58, 500), "muneca": (150, 640),
                "radio": 40, "ancho": 76, "sobre": 54,
            },
        },
        "torso": {
            # cuello, plumífero abierto con la camiseta y la cintura del vaquero; por los lados llega hasta el
            # costado del plumífero que tapaban las mangas. Donde no hay manga encima (capucha, hombros, caderas
            # del vaquero) va justo por dentro del contorno: lo de fuera se rellenaría
            "poli": [(212, 150), (300, 150), (304, 214), (318, 228), (334, 238), (350, 250), (366, 262), (382, 274),
                     (394, 292), (392, 340), (390, 400), (390, 460), (390, 520), (390, 580), (390, 630), (394, 650),
                     (398, 668), (400, 700), (400, 760),
                     (120, 760), (120, 702), (116, 690), (106, 684), (102, 668), (100, 640), (100, 580), (100, 520),
                     (100, 460), (100, 400), (102, 340), (96, 300), (80, 284), (74, 278), (92, 266), (110, 250),
                     (128, 232), (152, 222), (178, 214), (198, 206), (206, 190)],
            "manos": [],
            "rellenos": [
                # lo que tapaban las mangas: plumífero (liso) en los costados y los hombros
                ([(56, 262), (140, 262), (140, 690), (56, 690)], PLUMIFERO),
                ([(350, 270), (420, 270), (420, 682), (350, 682)], PLUMIFERO),
            ],
            # se pinta aunque no estuviera tapado: el cuello sube por detrás de la barbilla de la cabeza grande
            "forzar": [([(212, 150), (300, 150), (304, 222), (290, 236), (262, 242), (235, 236), (214, 222)], PIEL)],
            "lineas": [
                # lados del cuello (sube por detrás de la cabeza)
                ([(212, 150), (209, 190), (205, 224)], TINTA, 4),
                ([(300, 150), (302, 190), (305, 226)], TINTA, 4),
                # costados del plumífero tras las mangas
                ([(98, 334), (101, 400), (100, 480), (101, 560), (104, 620), (110, 660)], TINTA, 5),
                ([(390, 330), (389, 420), (389, 520), (388, 600), (392, 650)], TINTA, 5),
            ],
        },
        "piernas": {
            "separa": [(770, 266), (1255, 256)],           # recta (y, x) entre las dos piernas
            "desde_y": 676,                                  # por debajo del plumífero y de los puños
            "cerca": {"x": (10, 268), "cadera": (195, 708), "tobillo": (110, 1262),
                      "dobladillo": [(52, 1250), (60, 1262), (75, 1266), (100, 1262), (125, 1258), (148, 1263),
                                     (168, 1270), (174, 1256), (178, 1240)]},
            "lejos": {"x": (255, 470), "cadera": (335, 708), "tobillo": (400, 1262),
                      "dobladillo": [(322, 1262), (330, 1272), (345, 1278), (364, 1267), (386, 1260), (409, 1253),
                                     (432, 1247), (448, 1241), (460, 1236)]},
            "oscurecer_lejos": 0.8,
            "color_cupula": VAQUERO,
            "zapato": {"x": (318, 545), "tobillo": (400, 1262), "y_tope": 1238, "y_suela": 1352, "bajo_de": "lejos",
                       "collar": (34, 16), "color_collar": (236, 232, 230),
                       "nivelar": [(335, 1332), (525, 1347)]},
        },
    },
    "paleta": {"piel_sombra": [214, 130, 74], "pelo": [170, 110, 66], "camiseta": PLUMIFERO, "camiseta_sombra": [26, 25, 31],
               "vaquero": VAQUERO, "tinta": TINTA},
    "paleta_muestras": {"piel": [(740, 500), (775, 500), (775, 530), (740, 530)],
                        "iris": [(764, 438), (774, 438), (774, 446), (764, 446)]},
}

if __name__ == "__main__":
    preparar.construir(CFG)
