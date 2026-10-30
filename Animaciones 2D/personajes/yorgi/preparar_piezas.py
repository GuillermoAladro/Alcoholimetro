#!/usr/bin/env python3
"""Piezas de Yorgi a partir de su avatar 2D (Avatares 2D/Yorgi/Yorgi-2D.png).

Solo datos: coordenadas en píxeles de su hoja (1122 × 1402). El recorte lo hace
personajes/comun/preparar.py. Para revisar o ajustar las coordenadas:
    python3 personajes/comun/ver_hoja.py yorgi [carpeta]
Uso: python3 preparar_piezas.py [ruta_avatar] [carpeta_salida] [carpeta_depuracion]

Camiseta azul marino de manga corta, vaqueros claros y zapatillas grises y blancas; pelo castaño corto
con degradado a los lados, barba poblada, aros plateados en las dos orejas y reloj negro en la muñeca
izquierda. Mira a la derecha, como los demás (no hace falta reflejar la hoja). Como Deivi: cada brazo es
la manga más el brazo de piel, cortado por la costura del hombro (el hombro redondo del muñeco tapa la
junta), y llega hasta la abertura del bolsillo, donde mete la mano; el torso baja hasta la cintura del
vaquero y se repinta lo que tapaban los antebrazos. El reloj va con el brazo lejano y los aros se quedan
en la cabeza. Los brillos de los hombros de la camiseta son azulados (el detector de «vaquero» se comería
el borde de las mangas): se desactiva. Las sombras del suelo junto a las zapatillas se blanquean antes de
trocear («limpiar»). La pieza del pie es la zapatilla de perfil, con la suela nivelada.
"""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "comun"))
import preparar

TINTA = [12, 10, 14]
MARINO = [44, 45, 61]
VAQUERO = [158, 178, 205]
PIEL = [253, 178, 116]

# borde de abajo de la barba del retrato (+2 px): de su lado izquierdo, bajo la oreja, a la barbilla y
# hasta donde la barba sale al fondo por la derecha (la barba no tiene raya negra debajo)
MANDIBULA = [(622, 708), (630, 718), (640, 730), (650, 740), (660, 747), (670, 754), (680, 765), (690, 773),
             (700, 781), (710, 791), (720, 798), (730, 804), (740, 814), (750, 821), (760, 828), (770, 833),
             (780, 837), (790, 840), (800, 844), (810, 846), (820, 849), (830, 852), (840, 851), (850, 853),
             (860, 850), (870, 846), (880, 843)]

CFG = {
    "id": "yorgi",
    "fuente": "Avatares 2D/Yorgi/Yorgi-2D.png",
    "rotulo": (0, 0, 182, 76),
    "sin_vaquero": True,                                   # los brillos de la camiseta marino son azulados
    "piel_ref": PIEL,
    # huecos blancos encerrados que son fondo: entre cada brazo y el torso y entre mechones del retrato
    "huecos_fondo": [(130, 532), (372, 531), (372, 577), (790, 199)],
    # ---------------------------------------------------------------- retoques de la hoja
    "limpiar": [
        # sombras grises del suelo junto a las zapatillas (lo claro de fuera de su contorno negro)
        {"fondo": [(165, 1290), (212, 1290), (212, 1372), (0, 1372), (0, 1348), (14, 1348), (19, 1355), (26, 1359),
                   (34, 1360), (50, 1361), (66, 1362), (90, 1362), (100, 1361), (108, 1359), (114, 1356), (120, 1350),
                   (126, 1342), (132, 1338), (140, 1334), (150, 1330), (158, 1325), (164, 1321)], "mascara": "claro"},
        {"fondo": [(280, 1298), (323, 1298), (326, 1322), (334, 1326), (350, 1330), (366, 1332), (382, 1334), (398, 1335),
                   (414, 1339), (430, 1343), (446, 1346), (462, 1348), (478, 1349), (494, 1349), (510, 1347), (526, 1344),
                   (534, 1342), (542, 1339), (546, 1336), (547, 1316), (572, 1316), (572, 1372), (280, 1372)],
         "mascara": "claro"},
    ],
    # ---------------------------------------------------------------- retrato
    "retrato": {
        "x_min": 500,
        "corte_y": 870,
        "pivote": (720, 830),                              # punto del retrato que va sobre el cuello del cuerpo
        "mandibula": MANDIBULA,
        "mandibula_ventana": 6,                            # la barba no tiene raya negra debajo: casi la guía
        "cortar_bajo_mandibula": True,                     # cuello y camiseta del retrato fuera (el cuello es el del cuerpo)
        "fundido_pelo": 0,                                 # pelo corto: el borde de abajo es la barba
        # cuello que queda a la izquierda de la barba, bajo el lóbulo (solo la piel: la barba y el aro se quedan)
        "excluir_piel": [[(584, 630), (612, 626), (624, 630), (626, 714), (584, 714)]],
        "excluir": [
            # nuca (con su raya) por debajo del aro y cuello de la camiseta a la izquierda
            [(430, 636), (586, 636), (586, 1402), (430, 1402)],
            # camiseta a la derecha de la barbilla
            [(886, 846), (1122, 846), (1122, 1402), (886, 1402)],
        ],
        "ojos": {
            # blanco e iris, por dentro de la raya gruesa de las pestañas y de la del párpado de abajo
            "d": [(756, 484), (767, 482), (780, 482), (792, 483), (805, 486), (817, 489), (830, 494), (839, 500),
                  (842, 510), (841, 519), (835, 520), (825, 517), (812, 514), (800, 512), (787, 509), (775, 504),
                  (765, 497), (757, 490)],
            "i": [(928, 540), (937, 538), (950, 538), (962, 540), (975, 544), (986, 549), (993, 555), (995, 562),
                  (992, 570), (986, 573), (975, 572), (962, 570), (954, 566), (942, 561), (932, 556), (928, 549)],
        },
        "cejas": {
            "d": [(728, 443), (745, 432), (770, 423), (800, 417), (830, 421), (855, 429), (880, 440), (905, 446),
                  (915, 452), (912, 470), (902, 482), (885, 474), (865, 463), (845, 456), (820, 448), (795, 445),
                  (770, 444), (745, 446), (730, 448)],
            # la del ojo izquierdo acaba antes del contorno de la cara (se junta con él)
            "i": [(932, 503), (938, 492), (946, 482), (955, 474), (966, 472), (980, 476), (1000, 482), (1015, 489),
                  (1024, 496), (1025, 524), (1012, 518), (995, 513), (978, 510), (960, 507), (945, 507), (935, 507)],
        },
        "ceja_umbral": 250,                                 # solo lo oscuro (la sombra del párpado se queda en la cara)
        # labios rosas entre el bigote y la perilla
        "boca": [(768, 664), (790, 656), (830, 652), (870, 656), (900, 664), (922, 676), (930, 698), (924, 716),
                 (900, 718), (870, 710), (840, 702), (812, 692), (785, 680), (770, 672)],
        "boca_umbral": -1,                                  # la pieza de la boca es la zona entera (labios incluidos)
        "pivotes": {"ceja_d": (830, 445), "ceja_i": (980, 497), "boca": (848, 686)},
    },
    # ---------------------------------------------------------------- figura
    "figura": {
        "x_max": 560,
        "pelvis": (262, 705),
        "cuello_corte": [(150, 0), (470, 0), (470, 236), (150, 236)],
        # el torso baja hasta la cintura del vaquero (las muñecas entran en los bolsillos); lo de debajo, piernas
        "pelvis_corte": [(0, 708), (120, 708), (170, 712), (220, 722), (262, 740), (300, 722), (350, 712), (420, 708),
                         (600, 708), (600, 1402), (0, 1402)],
        "pelo_hasta_y": 0,
        "brazos": {
            # el izquierdo de él (a la derecha en pantalla): manga cortada por su costura y antebrazo con el reloj
            # hasta la abertura del bolsillo
            "brazo": {
                "poli": [(400, 309), (400, 337), (396, 363), (391, 383), (383, 403), (375, 420), (370, 437), (368, 450),
                         (367, 460), (368, 470), (367, 480), (367, 500), (367, 512), (367, 540), (370, 546), (373, 552),
                         (375, 560), (375, 570), (373, 576), (376, 582), (381, 590), (383, 600), (379, 608), (378, 614),
                         (382, 622), (383, 630), (380, 636), (377, 640), (376, 645), (380, 648), (390, 650), (400, 652),
                         (406, 655),
                         (408, 664), (411, 672), (415, 677), (422, 677), (428, 673), (432, 667), (434, 660), (434, 652),
                         (432, 646), (432, 640), (433, 634), (434, 628), (437, 624), (439, 620), (441, 614), (443, 608),
                         (446, 602), (448, 596), (449, 590), (451, 584), (452, 572), (453, 560), (452, 548), (451, 536),
                         (448, 524), (444, 512), (442, 500), (442, 476), (442, 464), (442, 458), (449, 447), (441, 423),
                         (434, 403), (434, 380), (427, 350), (417, 323), (404, 309)],
                "hombro": (402, 335), "codo": (410, 540), "muneca": (403, 664),
                "radio": 34, "ancho": 72, "sobre": 52, "bajo": 14,           # el reloj baja un poco más que la muñeca
            },
            # el derecho de él (a la izquierda en pantalla)
            "brazo_cerca": {
                "poli": [(66, 294), (78, 290), (92, 289), (106, 293), (120, 303), (130, 320), (138, 342), (143, 366),
                         (145, 390), (145, 410), (143, 428), (139, 446), (134, 456), (128, 464), (127, 476), (126, 488),
                         (121, 494), (119, 500), (115, 506), (111, 512), (107, 518), (107, 530), (109, 536), (113, 542),
                         (117, 548), (120, 554), (123, 560), (125, 566), (127, 572), (129, 578), (132, 584), (134, 590),
                         (134, 596), (137, 602), (140, 608), (140, 614), (145, 620), (150, 626), (155, 632), (158, 638),
                         (164, 644), (170, 649), (176, 654), (175, 658), (171, 661), (168, 664), (165, 667), (161, 670),
                         (156, 673), (151, 676), (146, 679), (141, 682), (134, 685), (127, 688), (122, 684), (118, 679),
                         (115, 675), (111, 670), (107, 665), (100, 658), (92, 650), (85, 642), (78, 632), (70, 622),
                         (64, 612), (55, 602), (50, 594), (46, 584), (40, 576), (35, 566), (30, 558), (27, 550),
                         (28, 540), (30, 530), (30, 500), (31, 470), (30, 454), (26, 446), (16, 438), (25, 413),
                         (33, 387), (35, 350), (45, 327), (58, 306)],
                "hombro": (92, 322), "codo": (70, 540), "muneca": (152, 672),
                "radio": 36, "ancho": 72, "sobre": 52,
            },
        },
        "torso": {
            # cuello, camiseta hasta las costuras de las mangas y cintura del vaquero
            # (por las costuras y donde toca los brazos se mete unos px bajo la manga: así no queda rendija al
            # dibujar el brazo suelto encima)
            "poli": [(214, 120), (306, 120), (306, 236), (308, 252), (322, 266), (342, 277), (362, 288), (382, 298),
                     (404, 307), (404, 337), (400, 363), (395, 383), (387, 403), (379, 421), (374, 437), (372, 450),
                     (371, 470), (371, 500), (371, 512), (369, 520), (368, 526), (368, 532), (371, 538), (374, 544),
                     (375, 555), (380, 580), (384, 605), (387, 625), (390, 640), (398, 648), (405, 658), (410, 672),
                     (412, 690), (412, 720), (414, 760), (110, 760), (110, 720), (110, 700), (111, 688), (114, 672),
                     (118, 656), (123, 641), (126, 622), (129, 605), (132, 586), (137, 580), (141, 574), (138, 568),
                     (135, 562), (133, 556), (134, 550), (136, 544), (138, 538), (139, 532), (138, 526), (136, 520),
                     (134, 514), (132, 508), (130, 502), (128, 496), (126, 490), (124, 486), (124, 476), (125, 464),
                     (131, 458), (135, 446), (139, 428), (141, 410), (141, 390), (139, 366), (134, 344), (127, 323),
                     (117, 306), (104, 297), (92, 293), (78, 294), (68, 298), (68, 292), (88, 283), (124, 266),
                     (164, 251), (190, 240), (205, 232), (214, 220)],
            # dorso de la mano lejana, que bajo el reloj se tuerce hacia el bolsillo: va con el torso de las manos
            # en los bolsillos (en el brazo suelto asomaría de lado); sin brazos se repinta de vaquero
            "manos": [[(356, 648), (370, 645), (380, 647), (390, 649), (400, 651), (406, 654), (408, 662), (410, 670),
                       (414, 677), (416, 681), (412, 685), (408, 687), (404, 685), (397, 681), (386, 675), (377, 669),
                       (369, 663), (362, 657), (357, 653)]],
            "rellenos": [
                # lo que tapaban los antebrazos: camiseta por encima del bajo y cintura del vaquero por debajo
                ([(118, 584), (146, 584), (150, 615), (160, 636), (168, 645), (145, 642), (124, 638), (118, 620)], MARINO),
                ([(108, 638), (124, 637), (145, 641), (162, 646), (180, 653), (176, 660), (128, 692), (108, 692)], VAQUERO),
                ([(366, 546), (402, 546), (404, 600), (396, 640), (388, 644), (374, 646), (366, 648)], MARINO),
                ([(358, 648), (374, 645), (388, 643), (400, 650), (408, 664), (412, 690), (400, 686), (362, 656)], VAQUERO),
            ],
            # se pinta aunque no estuviera tapado: el cuello sube por detrás de la barbilla de la cabeza grande
            "forzar": [([(214, 120), (306, 120), (306, 236), (292, 244), (262, 248), (232, 244), (214, 236)], PIEL)],
            "lineas": [
                # lados del cuello (sube por detrás de la cabeza)
                ([(214, 120), (214, 190), (214, 216), (206, 234), (196, 248)], TINTA, 4),
                ([(306, 120), (306, 200), (307, 232), (310, 250), (318, 262)], TINTA, 4),
                # costados de la camiseta por las costuras de las mangas
                ([(70, 298), (80, 294), (90, 292), (103, 296), (117, 306), (127, 323), (135, 343), (140, 367),
                  (142, 390), (142, 410), (140, 427), (134, 452), (128, 464), (126, 476), (126, 488)], TINTA, 5),
                ([(402, 312), (402, 337), (398, 363), (393, 383), (385, 403), (377, 420), (372, 437), (370, 457),
                  (369, 470), (369, 490), (369, 512)], TINTA, 5),
                # costado y bajo de la camiseta y lado del vaquero tras el antebrazo cercano
                ([(134, 584), (131, 605), (128, 622), (126, 638)], TINTA, 5),
                ([(125, 638), (142, 641), (162, 647)], TINTA, 4),
                ([(125, 640), (120, 656), (116, 672), (113, 688), (112, 700)], TINTA, 4),
                # costado y bajo de la camiseta y lado del vaquero tras el antebrazo lejano
                ([(374, 548), (380, 580), (384, 605), (387, 625), (388, 642)], TINTA, 5),
                ([(372, 645), (388, 643)], TINTA, 4),
                ([(388, 644), (398, 651), (405, 663), (409, 677), (410, 690)], TINTA, 4),
            ],
        },
        "piernas": {
            "separa": [(700, 266), (1250, 248)],           # recta (y, x) entre las dos piernas
            "desde_y": 660,
            "cerca": {"x": (30, 268), "cadera": (185, 708), "tobillo": (108, 1262),
                      "dobladillo": [(45, 1268), (60, 1260), (80, 1255), (100, 1254), (120, 1256), (140, 1262),
                                     (155, 1270), (165, 1280), (175, 1282)]},
            "lejos": {"x": (250, 466), "cadera": (335, 708), "tobillo": (388, 1265),
                      "dobladillo": [(322, 1270), (330, 1272), (350, 1275), (380, 1270), (415, 1252), (440, 1245),
                                     (455, 1241), (466, 1240)]},
            "oscurecer_lejos": 0.8,
            "color_cupula": VAQUERO,
            "zapato": {"x": (318, 556), "tobillo": (388, 1265), "y_tope": 1238, "y_suela": 1352, "bajo_de": "lejos",
                       "collar": (34, 16), "color_collar": (238, 234, 234),
                       "nivelar": [(348, 1343), (505, 1344)]},
        },
    },
    "paleta": {"piel_sombra": [205, 126, 75], "pelo": [75, 48, 33], "barba": [59, 40, 30], "camiseta": MARINO,
               "camiseta_sombra": [33, 34, 45], "vaquero": VAQUERO, "tinta": TINTA},
    "paleta_muestras": {"piel": [(810, 545), (835, 545), (835, 565), (810, 565)],
                        "iris": [(782, 490), (798, 490), (798, 502), (782, 502)]},
}

if __name__ == "__main__":
    preparar.construir(CFG)
