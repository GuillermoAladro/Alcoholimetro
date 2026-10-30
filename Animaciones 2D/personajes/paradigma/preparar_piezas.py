#!/usr/bin/env python3
"""Piezas de Paradigma a partir de su avatar 2D (Avatares 2D/Paradigma/Paradigma-2D.png).

Solo datos: coordenadas en píxeles de su hoja (1122 × 1402). El recorte lo hace
personajes/comun/preparar.py. Para revisar o ajustar las coordenadas:
    python3 personajes/comun/ver_hoja.py paradigma [carpeta]
Uso: python3 preparar_piezas.py [ruta_avatar] [carpeta_salida] [carpeta_depuracion]

Cazadora negra abierta (cremallera, cuello alto) sobre camiseta blanca, vaqueros y zapatillas; pelo
castaño ondulado por la nuca, bigote y perilla con barba de tres días. Mira a la derecha, como los
demás (no hace falta reflejar la hoja). Las mangas son largas y negras: cada brazo es la manga de la
cazadora, cortada en el hombro (la costura del hombro) y en el puño; la mano la dibuja el muñeco.
Tiene las manos metidas en los bolsillos del vaquero y asoman por debajo del puño: se quitan de la
hoja antes de trocear (pasos «limpiar») y se repinta el bajo de la cazadora y la cintura del vaquero.
La cazadora negra cuenta como «pelo» para el detector de color: se desactiva en la figura
(pelo_hasta_y 0).
"""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "comun"))
import preparar

TINTA = [12, 10, 12]
CAZADORA = [45, 44, 48]
VAQUERO = [66, 90, 126]
COSTURA = [150, 112, 70]
PIEL = [253, 181, 120]

# borde de abajo de la línea de la mandíbula del retrato (de debajo de la oreja a la barbilla)
MANDIBULA = [(634, 650), (645, 664), (660, 676), (680, 690), (700, 704), (720, 719), (740, 733), (760, 747),
             (780, 757), (800, 764), (820, 768), (840, 767), (852, 760), (862, 748), (870, 734)]

CFG = {
    "id": "paradigma",
    "fuente": "Avatares 2D/Paradigma/Paradigma-2D.png",
    "rotulo": (0, 0, 230, 62),
    "piel_ref": PIEL,
    # huecos blancos encerrados: entre el codo cercano y el costado, y entre los mechones sueltos del retrato
    "huecos_fondo": [(117, 505),
                     (774, 184), (928, 199), (1030, 262), (533, 352), (1080, 346), (1080, 352), (1043, 461), (999, 555)],
    # ---------------------------------------------------------------- retoques de la hoja
    "limpiar": [
        # manos metidas en los bolsillos (asoman bajo el puño): solo la piel de la mano y su contorno
        # ("mascara": "piel" ensanchada) pasa a cazadora por encima del bajo y a vaquero por debajo; el puño
        # de la manga y lo de alrededor no se tocan. La mano la dibuja el muñeco.
        # cercana: a la izquierda de la mano está el puño de la manga (cazadora); debajo del bajo, vaquero
        {"pintar": [(110, 600), (212, 600), (212, 627), (152, 641), (145, 674), (110, 674)], "mascara": "piel",
         "dilata": 4, "color": CAZADORA},
        {"pintar": [(145, 674), (152, 641), (212, 627), (212, 690), (145, 690)], "mascara": "piel", "dilata": 4,
         "color": VAQUERO},
        # lejana: a la derecha de la mano está el puño de la manga
        {"pintar": [(340, 598), (412, 598), (412, 690), (396, 690), (394, 644), (340, 648)], "mascara": "piel",
         "dilata": 4, "color": CAZADORA},
        {"pintar": [(340, 648), (394, 644), (396, 690), (340, 690)], "mascara": "piel", "dilata": 4, "color": VAQUERO},
        # bajo de la cazadora, borde del puño y abertura del bolsillo
        {"linea": [(151, 642), (176, 636), (204, 630)], "color": TINTA, "ancho": 4},
        {"linea": [(152, 640), (148, 656), (145, 672)], "color": TINTA, "ancho": 4},
        {"linea": [(147, 668), (170, 655), (197, 639)], "color": TINTA, "ancho": 3},
        {"linea": [(346, 650), (370, 647), (392, 644)], "color": TINTA, "ancho": 4},
    ],
    # ---------------------------------------------------------------- retrato
    "retrato": {
        "x_min": 470,
        "corte_y": 790,
        "pivote": (740, 780),                              # punto del retrato que va sobre el cuello del cuerpo
        "mandibula": MANDIBULA,
        "mandibula_ventana": 6,                            # la barba de tres días toca la línea de la mandíbula
        "cortar_bajo_mandibula": True,                     # cuello y cazadora del retrato fuera (el cuello es el del cuerpo)
        "fundido_pelo": 0,                                 # el pelo de la nuca acaba en sus puntas, antes del corte
        # cuello que queda a la izquierda de la mandíbula, bajo la oreja (solo la piel: el pelo de la nuca se queda)
        "excluir_piel": [[(566, 600), (628, 598), (636, 652), (600, 700), (566, 740)]],
        "excluir": [
            # cuello de la cazadora a la izquierda (bajo las puntas del pelo de la nuca) y a la derecha de la barbilla
            [(430, 690), (470, 689), (520, 681), (545, 683), (560, 691), (586, 706), (586, 1402), (430, 1402)],
            [(874, 722), (1122, 722), (1122, 1402), (874, 1402)],
        ],
        "ojos": {
            # blanco e iris, por dentro de la raya gruesa de las pestañas
            "d": [(744, 479), (755, 476), (770, 476), (785, 477), (797, 480), (807, 484), (813, 491), (817, 501),
                  (814, 508), (804, 507), (794, 504), (781, 501), (768, 497), (757, 493), (749, 488), (744, 483)],
            "i": [(892, 518), (900, 515), (912, 515), (924, 518), (934, 521), (942, 527), (946, 535), (943, 544),
                  (935, 547), (925, 545), (915, 542), (905, 539), (897, 535), (892, 527)],
        },
        "cejas": {
            "d": [(757, 434), (770, 429), (788, 428), (806, 432), (825, 439), (845, 447), (860, 455), (872, 465),
                  (870, 478), (858, 477), (842, 467), (822, 459), (802, 453), (782, 449), (765, 448), (757, 443)],
            "i": [(893, 489), (910, 481), (930, 479), (950, 483), (965, 489), (976, 497), (974, 506), (960, 502),
                  (942, 497), (922, 494), (904, 496), (895, 495)],
        },
        "ceja_umbral": 250,                                 # solo lo oscuro (la sombra del párpado se queda en la cara)
        # labios entre el bigote y la perilla, sin tocar el contorno de la cara (a la derecha)
        "boca": [(768, 640), (790, 637), (820, 638), (850, 643), (875, 650), (895, 657), (902, 665), (897, 674),
                 (880, 678), (855, 679), (830, 676), (805, 670), (785, 660), (770, 650)],
        "boca_umbral": -1,                                  # la pieza de la boca es la zona entera (labios incluidos)
        "pivotes": {"ceja_d": (812, 448), "ceja_i": (935, 491), "boca": (835, 658)},
    },
    # ---------------------------------------------------------------- figura
    "figura": {
        "x_max": 560,
        "pelvis": (262, 700),
        "cuello_corte": [(205, 0), (330, 0), (330, 225), (205, 225)],
        # el torso baja hasta la cintura del vaquero (las muñecas entran en los bolsillos); lo de debajo, piernas
        "pelvis_corte": [(0, 705), (110, 705), (160, 712), (210, 718), (262, 728), (312, 718), (362, 712), (470, 705),
                         (600, 705), (600, 1402), (0, 1402)],
        "pelo_hasta_y": 0,                                  # la cazadora negra no es pelo
        "brazos": {
            # el izquierdo de él (a la derecha en pantalla): manga de la cazadora desde la costura del hombro
            # hasta el puño; el borde de dentro es el pliegue junto al costado de la cazadora
            "brazo": {
                "poli": [(350, 288), (375, 298), (392, 312), (400, 335), (405, 360), (410, 390), (414, 412), (419, 432),
                         (425, 460), (432, 480), (438, 500), (437, 530), (437, 560), (438, 590), (438, 606), (431, 622),
                         (420, 636), (406, 646), (390, 650), (372, 650), (358, 646), (355, 630), (360, 606), (366, 575),
                         (368, 540), (368, 500), (368, 460), (368, 420), (366, 385), (360, 360), (352, 330), (348, 305)],
                "hombro": (378, 330), "codo": (420, 500), "muneca": (384, 632),
                "radio": 36, "ancho": 84, "sobre": 52,
            },
            # el derecho de él (a la izquierda en pantalla)
            "brazo_cerca": {
                "poli": [(62, 292), (80, 285), (98, 300), (112, 325), (120, 350), (122, 400), (121, 450), (120, 490),
                         (119, 510), (122, 530), (130, 560), (138, 585), (146, 604), (150, 620), (140, 640), (125, 652),
                         (108, 656), (92, 646), (80, 632), (68, 615), (55, 598), (44, 575), (32, 550), (22, 525),
                         (17, 505), (21, 470), (27, 440), (31, 410), (37, 385), (41, 360), (43, 330), (52, 305)],
                "hombro": (88, 322), "codo": (52, 500), "muneca": (138, 634),
                "radio": 38, "ancho": 88, "sobre": 54,
            },
        },
        "torso": {
            # cuello, cazadora abierta con la camiseta y la cintura del vaquero; por los lados llega hasta el
            # costado de la cazadora que tapaban las mangas. Donde no hay manga encima (cuello de la cazadora,
            # hombro lejano, caderas del vaquero) va justo por dentro del contorno: lo de fuera se rellenaría
            "poli": [(222, 150), (298, 150), (300, 219), (316, 229), (332, 238), (338, 243), (339, 248), (336, 252),
                     (332, 258), (329, 264), (326, 270), (327, 273), (331, 276), (336, 279), (342, 282), (348, 286),
                     (360, 293), (376, 302), (391, 313), (390, 340), (388, 400), (388, 460),
                     (388, 520), (388, 580), (386, 630), (389, 648), (393, 656), (391, 664), (390, 672), (390, 690),
                     (391, 700), (393, 706), (395, 712), (397, 760),
                     (124, 760), (125, 708), (126, 696), (127, 686), (128, 678), (126, 670), (122, 666), (115, 664),
                     (110, 660), (107, 652), (104, 644), (104, 600), (102, 540), (102, 480), (102, 420),
                     (104, 360), (100, 330), (80, 300), (72, 290), (83, 280), (106, 270), (130, 260), (152, 250),
                     (171, 240), (178, 222), (188, 206), (205, 201), (215, 204), (222, 190)],
            "manos": [],
            "rellenos": [
                # lo que tapaban las mangas: cazadora (lisa) en los costados y los hombros
                ([(60, 270), (135, 270), (135, 662), (60, 662)], CAZADORA),
                ([(350, 280), (410, 280), (410, 652), (350, 652)], CAZADORA),
            ],
            # se pinta aunque no estuviera tapado: el cuello sube por detrás de la barbilla de la cabeza grande
            "forzar": [([(222, 150), (298, 150), (300, 214), (286, 224), (268, 229), (250, 225), (235, 214), (222, 204)], PIEL)],
            "lineas": [
                # lados del cuello (sube por detrás de la cabeza)
                ([(222, 150), (220, 185), (216, 210)], TINTA, 4),
                ([(298, 150), (299, 185), (300, 218)], TINTA, 4),
                # costados de la cazadora tras las mangas
                ([(100, 332), (103, 400), (102, 480), (103, 560), (106, 620), (112, 652)], TINTA, 5),
                ([(388, 330), (387, 420), (387, 520), (386, 600), (388, 646)], TINTA, 5),
            ],
        },
        "piernas": {
            "separa": [(770, 266), (1250, 258)],           # recta (y, x) entre las dos piernas
            "desde_y": 668,                                  # por debajo de la cazadora y de los puños
            "cerca": {"x": (10, 270), "cadera": (195, 705), "tobillo": (112, 1262),
                      "dobladillo": [(42, 1238), (60, 1248), (90, 1252), (120, 1252), (140, 1258), (152, 1262),
                                     (165, 1246), (172, 1232)]},
            "lejos": {"x": (255, 458), "cadera": (335, 705), "tobillo": (392, 1262),
                      "dobladillo": [(316, 1262), (332, 1270), (355, 1262), (380, 1250), (410, 1238), (440, 1228),
                                     (456, 1222)]},
            "oscurecer_lejos": 0.8,
            "color_cupula": VAQUERO,
            "zapato": {"x": (318, 552), "tobillo": (392, 1262), "y_tope": 1238, "y_suela": 1352, "bajo_de": "lejos",
                       "collar": (34, 16), "color_collar": (236, 234, 232),
                       "nivelar": [(335, 1350), (530, 1346)]},
        },
    },
    "paleta": {"piel_sombra": [214, 130, 74], "pelo": [142, 85, 48], "camiseta": CAZADORA, "camiseta_sombra": [24, 24, 28],
               "vaquero": VAQUERO, "tinta": TINTA},
    "paleta_muestras": {"piel": [(700, 560), (740, 560), (740, 600), (700, 600)],
                        "iris": [(762, 483), (772, 483), (772, 493), (762, 493)]},
}

if __name__ == "__main__":
    preparar.construir(CFG)
