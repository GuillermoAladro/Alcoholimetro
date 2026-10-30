#!/usr/bin/env python3
"""Piezas de Deivi a partir de su avatar 2D (Avatares 2D/Deivi/Deivi-2D.png).

Solo datos: coordenadas en píxeles de su hoja (1122 × 1402). El recorte lo hace
personajes/comun/preparar.py. Para revisar o ajustar las coordenadas:
    python3 personajes/comun/ver_hoja.py deivi [carpeta]
Uso: python3 preparar_piezas.py [ruta_avatar] [carpeta_salida] [carpeta_depuracion]

Camiseta lila de manga corta (como Guillermo): cada brazo es la manga más el brazo de piel, cortado por
la costura del hombro; el torso acaba en esa costura y el hombro redondo del muñeco tapa la junta. Tiene
las manos metidas en los bolsillos del vaquero: los antebrazos llegan hasta la abertura del bolsillo, así
que el torso baja hasta la cintura del vaquero (como Laura) y lo que tapaban las muñecas se repinta.
La camiseta lila cuenta como «vaquero» para el detector de color (azulada): se desactiva.
"""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "comun"))
import preparar

TINTA = [12, 10, 12]
LILA = [185, 153, 218]
VAQUERO = [142, 172, 211]
PIEL = [253, 176, 102]

CFG = {
    "id": "deivi",
    "fuente": "Avatares 2D/Deivi/Deivi-2D.png",
    "rotulo": (0, 0, 160, 70),
    "sin_vaquero": True,                                   # la camiseta lila también es azulada
    # huecos blancos encerrados que son fondo: entre los brazos y el torso, y entre mechones del retrato
    "huecos_fondo": [(113, 514), (360, 512), (632, 230), (587, 284), (1054, 304), (1071, 453)],
    "piel_ref": PIEL,
    # ---------------------------------------------------------------- retrato
    "retrato": {
        "x_min": 500,
        "corte_y": 800,
        "pivote": (762, 790),                              # punto del retrato que va sobre el cuello del cuerpo
        # línea negra de la mandíbula, por su centro: del ángulo bajo la oreja a la barbilla y subiendo por la mejilla
        "mandibula": [(668, 652), (690, 670), (710, 686), (730, 700), (750, 714), (770, 728), (790, 740), (810, 750),
                      (830, 757), (848, 760), (862, 757), (876, 748), (888, 735), (897, 720), (910, 700), (922, 682),
                      (935, 660), (948, 636), (960, 612), (970, 590)],
        "mandibula_ventana": 12,
        "cortar_bajo_mandibula": True,                      # cuello y camiseta del retrato fuera (el cuello es el del cuerpo)
        "fundido_pelo": 0,                                  # pelo corto: el borde de abajo es la mandíbula
        # nuca: la piel del cuello que asoma bajo el pelo, por detrás de la línea de la nuca (el pelo se queda)
        "excluir_piel": [[(560, 640), (680, 640), (680, 800), (560, 800)]],
        "excluir": [
            # cuello por debajo de las puntas del pelo de la nuca y cuello de la camiseta a la izquierda
            [(470, 706), (668, 706), (668, 1402), (470, 1402)],
            # camiseta a la derecha
            [(950, 770), (1122, 770), (1122, 1402), (950, 1402)],
        ],
        "ojos": {
            # blanco e iris, por dentro de la raya gruesa de las pestañas y de la del párpado de abajo
            "d": [(772, 468), (780, 464), (795, 462), (810, 463), (825, 464), (838, 468), (845, 474), (848, 482),
                  (845, 489), (836, 493), (822, 492), (808, 490), (795, 488), (783, 484), (775, 478)],
            "i": [(922, 501), (930, 498), (945, 498), (958, 501), (969, 506), (976, 513), (976, 520), (970, 525),
                  (958, 526), (945, 523), (933, 519), (924, 512)],
        },
        "cejas": {
            "d": [(742, 437), (750, 425), (765, 415), (785, 409), (805, 410), (825, 415), (845, 423), (862, 433),
                  (876, 445), (880, 456), (870, 457), (850, 448), (830, 440), (810, 435), (790, 434), (770, 436), (752, 442)],
            "i": [(912, 483), (918, 471), (930, 461), (945, 455), (962, 455), (978, 461), (990, 471), (992, 482),
                  (982, 482), (968, 476), (952, 474), (938, 476), (926, 482), (918, 488)],
        },
        "ceja_umbral": 250,                                 # solo lo oscuro (la sombra del párpado se queda en la cara)
        "boca": [(785, 604), (800, 603), (830, 610), (860, 618), (890, 628), (912, 636), (918, 648), (905, 653),
                 (890, 665), (870, 673), (842, 673), (826, 662), (818, 650), (800, 625), (788, 616)],
        "boca_umbral": -1,                                  # la pieza de la boca es la zona entera (labios incluidos)
        "pivotes": {"ceja_d": (810, 432), "ceja_i": (952, 470), "boca": (850, 635)},
    },
    # ---------------------------------------------------------------- figura
    "figura": {
        "x_max": 560,
        "pelvis": (235, 700),
        "cuello_corte": [(120, 0), (470, 0), (470, 236), (120, 236)],
        # el torso baja hasta la cintura del vaquero (las muñecas entran en los bolsillos); lo de debajo, piernas
        "pelvis_corte": [(0, 692), (90, 692), (150, 696), (200, 708), (235, 724), (270, 708), (320, 698), (380, 704),
                         (600, 704), (600, 1402), (0, 1402)],
        "pelo_hasta_y": 0,
        "brazos": {
            # el izquierdo de él (a la derecha en pantalla): manga cortada por su costura y antebrazo hasta el bolsillo
            "brazo": {
                "poli": [(375, 312), (419, 312), (424, 325), (436, 360), (446, 395), (455, 428), (450, 442),
                         (438, 448), (437, 480), (438, 505), (439, 525), (436, 542), (429, 556), (421, 570), (413, 585),
                         (403, 600), (391, 615), (379, 630), (367, 645), (358, 660), (352, 670), (340, 667), (322, 659),
                         (306, 652), (300, 647), (304, 638), (313, 627), (322, 617), (331, 605), (340, 592), (348, 578),
                         (352, 563), (356, 550), (363, 535), (371, 520), (372, 505), (368, 490), (363, 475), (358, 462),
                         (348, 452), (347, 430), (351, 400), (358, 365), (368, 325)],
                "hombro": (390, 312), "codo": (405, 525), "muneca": (328, 660),
                "radio": 34, "ancho": 72, "sobre": 52,
            },
            # el derecho de él (a la izquierda en pantalla)
            "brazo_cerca": {
                "poli": [(121, 318), (64, 318), (56, 330), (44, 360), (33, 395), (24, 425),
                         (18, 445), (28, 458), (46, 462), (46, 480), (44, 500), (40, 520), (38, 540), (39, 560),
                         (43, 580), (49, 598), (56, 614), (63, 628), (70, 644), (73, 660), (80, 668), (93, 673),
                         (102, 662), (108, 650), (119, 642), (116, 628), (112, 610), (109, 595), (110, 580),
                         (113, 565), (110, 550), (107, 535), (104, 520), (106, 505), (112, 490), (115, 475),
                         (124, 466), (124, 440), (122, 400), (121, 350)],
                "hombro": (92, 318), "codo": (70, 525), "muneca": (95, 662),
                "radio": 36, "ancho": 72, "sobre": 52,
            },
        },
        "torso": {
            # cuello, camiseta hasta las costuras de las mangas y cintura del vaquero
            "poli": [(196, 120), (283, 120), (284, 236), (286, 250), (298, 258), (320, 266), (345, 274), (368, 282),
                     (384, 288), (400, 293), (413, 301), (419, 312), (376, 313), (372, 320), (366, 340), (358, 375), (353, 410), (350, 440), (350, 470), (350, 546),
                     (352, 580), (358, 610), (366, 630), (372, 648), (369, 665), (367, 680), (369, 700), (374, 720),
                     (378, 745), (381, 760), (84, 760), (84, 730), (85, 705), (88, 688), (94, 672), (102, 662), (107, 648), (106, 620), (107, 598), (114, 580),
                     (124, 566), (126, 540), (126, 500), (125, 470), (122, 440), (120, 400), (119, 360), (119, 330),
                     (121, 319), (64, 318), (71, 311), (88, 300), (105, 293), (121, 290), (140, 282), (160, 272),
                     (178, 264), (190, 256), (192, 240)],
            "manos": [],
            "rellenos": [
                # lo que tapaban los antebrazos: camiseta por encima del bajo y cintura del vaquero por debajo
                ([(106, 566), (128, 566), (130, 646), (106, 646), (106, 600)], LILA),
                ([(107, 648), (132, 647), (132, 678), (94, 678), (102, 662)], VAQUERO),
                ([(300, 550), (352, 550), (358, 610), (366, 630), (376, 650), (345, 647), (300, 645)], LILA),
                ([(298, 646), (345, 648), (358, 671), (298, 671)], VAQUERO),
            ],
            # se pinta aunque no estuviera tapado: el cuello sube por detrás de la barbilla de la cabeza grande
            "forzar": [([(196, 120), (282, 120), (282, 236), (270, 240), (256, 242), (240, 237), (222, 233), (196, 233)], PIEL)],
            "lineas": [
                # lados del cuello (sube por detrás de la cabeza)
                ([(194, 120), (193, 180), (192, 238)], TINTA, 4),
                ([(283, 120), (284, 180), (285, 240)], TINTA, 4),
                # costados de la camiseta por las costuras de las mangas
                ([(121, 318), (119, 340), (119, 380), (121, 430), (125, 468)], TINTA, 5),
                ([(376, 313), (370, 330), (362, 355), (355, 395), (351, 435), (350, 470)], TINTA, 5),
                # costado de la camiseta, bajo y esquina del vaquero tras el antebrazo cercano
                ([(125, 566), (116, 578), (109, 596), (106, 620), (108, 646)], TINTA, 5),
                ([(106, 646), (118, 646), (132, 646)], TINTA, 4),
                ([(107, 650), (100, 662), (94, 672)], TINTA, 4),
                # costado y bajo de la camiseta tras el antebrazo lejano
                ([(350, 546), (352, 580), (358, 610), (366, 630), (374, 650)], TINTA, 5),
                ([(288, 643), (315, 644), (345, 647)], TINTA, 4),
            ],
        },
        "piernas": {
            "separa": [(780, 232), (1250, 290)],           # recta (y, x) entre las dos piernas
            "desde_y": 640,
            "cerca": {"x": (40, 256), "cadera": (165, 700), "tobillo": (184, 1256),
                      "dobladillo": [(110, 1230), (150, 1234), (180, 1240), (210, 1246), (245, 1253)]},
            "lejos": {"x": (232, 472), "cadera": (305, 700), "tobillo": (398, 1280),
                      "dobladillo": [(330, 1295), (350, 1293), (380, 1284), (400, 1275), (420, 1265), (440, 1255), (465, 1248)]},
            "oscurecer_lejos": 0.8,
            "color_cupula": VAQUERO,
            "zapato": {"x": (345, 550), "tobillo": (398, 1280), "y_tope": 1250, "y_suela": 1356, "bajo_de": "lejos",
                       "collar": (34, 16), "color_collar": (238, 236, 236),
                       "nivelar": [(362, 1343), (515, 1352)]},
        },
    },
    "paleta": {"piel_sombra": [210, 126, 68], "pelo": [69, 47, 40], "camiseta": LILA, "camiseta_sombra": [139, 111, 177],
               "vaquero": VAQUERO, "tinta": TINTA},
    "paleta_muestras": {"piel": [(810, 545), (835, 545), (835, 565), (810, 565)],
                        "iris": [(781, 481), (789, 481), (789, 489), (781, 489)]},
}

if __name__ == "__main__":
    preparar.construir(CFG)
