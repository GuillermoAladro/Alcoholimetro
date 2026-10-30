#!/usr/bin/env python3
"""Piezas de Marta a partir de su avatar 2D (Avatares 2D/Marta/Marta-2D.png).

Solo datos: coordenadas en píxeles de su hoja (1122 × 1402) YA REFLEJADA. El recorte lo hace
personajes/comun/preparar.py. Para revisar o ajustar las coordenadas (se ve la hoja reflejada):
    python3 personajes/comun/ver_hoja.py marta [carpeta]
Uso: python3 preparar_piezas.py [ruta_avatar] [carpeta_salida] [carpeta_depuracion]

Su avatar es el único que mira a la izquierda: la figura y el retrato se reflejan cada uno en su sitio
(«espejar») y así mira a la derecha, como todos los demás; todas las coordenadas de abajo son de la hoja
reflejada. Lleva una chaqueta de punto gris de manga larga muy holgada: los brazos son mangas (con la
mano dibujada aparte) y los hombros del muñeco son grises. La melena larga le cae en la figura por
delante de los dos hombros y del pecho: se quita antes de trocear («limpiar») y lo que tapaba se rehace
copiando de más abajo el punto de la chaqueta (el canalé vertical sigue) y pintando la piel del escote.
El pelo lo traen la cabeza del retrato (con su pinza de carey detrás) y la melena que se balancea.
Bajo la barbilla, el cuello en sombra del retrato se queda fuera de la cabeza: lo pone el cuerpo, tan ancho
como el del retrato, con pelo en sombra detrás hasta los hombros. La manga no pinta nada por encima del
hombro, así que el torso trae los hombros redondos con su contorno, y lo que tapaban las mangas se rehace
con el punto de la chaqueta («rellenos_teja»), no con un gris liso.
Las manos metidas en los bolsillos también se quitan (vaquero y abertura del bolsillo) y el trozo del
retrato que casi toca la pierna lejana se borra para que no se peguen.
"""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "comun"))
import preparar

TINTA = [12, 10, 12]
PIEL = [253, 185, 130]
CHAQUETA = [167, 160, 159]
CHAQUETA_BORDE = [74, 68, 70]
VAQUERO = [150, 172, 204]
COSTURA = [62, 82, 120]
COSTURA_CLARA = [176, 150, 112]
TROZO_PUNTO = [234, 422, 48, 44]                  # trozo limpio del punto de la chaqueta (x, y, ancho, alto)
PELO_SOMBRA, PELO_LUZ, PELO_OSCURO = [82, 47, 27], [128, 76, 43], [50, 28, 17]

CFG = {
    "id": "marta",
    "fuente": "Avatares 2D/Marta/Marta-2D.png",
    # mira a la izquierda: la figura y el retrato se reflejan cada uno sobre su propio eje (el nombre se queda fuera)
    "espejar": [
        {"zona": [(0, 70), (175, 70), (175, 0), (495, 0), (495, 700), (415, 700), (415, 1402), (0, 1402)], "eje": 247.5},
        {"zona": [(495, 0), (1122, 0), (1122, 1402), (415, 1402), (415, 700), (495, 700)], "eje": 768.5},
    ],
    # ---------------------------------------------------------------- retoques de la hoja (ya reflejada)
    "limpiar": [
        # el retrato, abajo a la izquierda, casi toca la pierna lejana: fuera (solo se usa su cabeza y su melena)
        {"fondo": [(415, 735), (560, 735), (560, 1220), (450, 1220), (450, 1190), (448, 1170), (442, 1150), (433, 1130),
                   (425, 1112), (417, 1095), (415, 1000)]},
        # contorno del hombro de la chaqueta del retrato junto a la melena (si no, la tira lo arrastra)
        {"fondo": [(1004, 736), (1122, 736), (1122, 830), (972, 830), (970, 762), (985, 753), (1000, 750)]},
        # sombra del suelo entre los pies (la pieza del zapato no debe llevarla)
        {"fondo": [(195, 1285), (338, 1285), (338, 1352), (195, 1352)], "mascara": "claro"},
        {"fondo": [(320, 1300), (338, 1300), (339, 1318), (350, 1328), (372, 1331), (378, 1340), (392, 1347), (420, 1352),
                   (320, 1352)], "mascara": "claro"},
        # manos metidas en los bolsillos → vaquero (copiado de debajo); la mano la dibuja el muñeco al sacarla
        {"copiar": [[(94, 586), (128, 586), (153, 596), (156, 616), (150, 640), (120, 644), (94, 640)],
                    [(289, 590), (318, 588), (347, 592), (353, 616), (350, 646), (318, 646), (289, 636)]],
         "mascara": "piel", "dilata": 3, "desde": [0, 46], "repetir": True},
        # abertura del bolsillo (sin la mano): costura oscura y pespunte
        {"linea": [(96, 634), (117, 637), (136, 632), (148, 621), (154, 608), (157, 600)], "color": COSTURA, "ancho": 3},
        {"linea": [(97, 639), (118, 642), (139, 637), (152, 625), (159, 611)], "color": COSTURA_CLARA, "ancho": 1},
        {"linea": [(289, 602), (296, 617), (309, 631), (327, 642), (348, 646)], "color": COSTURA, "ancho": 3},
        {"linea": [(286, 609), (293, 623), (306, 637), (325, 648), (346, 652)], "color": COSTURA_CLARA, "ancho": 1},
        # ---- la melena que cae por delante del cuerpo
        # fondo por encima de los hombros, a los lados del cuello
        {"fondo": [(70, 185), (180, 185), (180, 236), (170, 250), (165, 258), (140, 266), (115, 274), (95, 281), (70, 286)]},
        {"fondo": [(250, 185), (345, 185), (345, 258), (330, 260), (300, 255), (280, 258), (268, 262), (258, 252), (250, 238)]},
        # piel bajo el pelo: la base del cuello y el escote (solo lo que no es piel)
        {"pintar": [[(178, 236), (183, 236), (183, 262), (178, 300), (174, 343), (168, 300), (165, 259), (170, 250)],
                    [(238, 186), (250, 186), (250, 238), (258, 252), (268, 262), (262, 282), (250, 312), (232, 342),
                     (224, 338), (234, 300), (240, 250)],
                   [(222, 236), (242, 236), (242, 268), (224, 268)]],
         "mascara": "no_piel", "dilata": 1, "color": PIEL},
        # chaqueta bajo el pelo: mosaico de un trozo limpio del delantero (48 × 44, el canalé va cada 8 px, así
        # los canales siguen alineados con la chaqueta de alrededor)
        {"teja": [[(88, 292), (95, 282), (115, 274), (140, 266), (165, 259), (168, 300), (175, 343), (205, 372), (210, 400),
                   (207, 432), (190, 446), (160, 454), (130, 452), (108, 438), (96, 418), (87, 400), (86, 350)],
                  [(268, 262), (300, 256), (330, 262), (346, 270), (343, 300), (341, 340), (339, 380), (337, 416), (300, 418),
                   (265, 411), (240, 400), (222, 378), (232, 342), (250, 310), (262, 281)]],
         "origen": TROZO_PUNTO},
        # contornos de los hombros, bordes del escote y costuras de las mangas que tapaba el pelo
        {"linea": [(86, 287), (95, 282), (115, 274), (140, 266), (165, 259)], "color": TINTA, "ancho": 4},
        {"linea": [(250, 264), (270, 260), (300, 256)], "color": TINTA, "ancho": 4},
        {"linea": [(165, 259), (168, 300), (175, 343), (205, 372)], "color": CHAQUETA_BORDE, "ancho": 3},
        {"linea": [(205, 372), (232, 342), (250, 311), (262, 282), (268, 263)], "color": CHAQUETA_BORDE, "ancho": 3},
        {"linea": [(128, 273), (120, 300), (114, 340), (110, 390), (108, 440)], "color": CHAQUETA_BORDE, "ancho": 2},
        {"linea": [(318, 259), (326, 290), (331, 330), (333, 380), (332, 420)], "color": CHAQUETA_BORDE, "ancho": 2},
    ],
    # huecos blancos encerrados que son fondo: entre brazos y torso, entre las piernas y entre mechones del retrato
    "huecos_fondo": [(117, 498), (330, 494), (469, 569),
                     (842, 170), (934, 510), (946, 525), (912, 564), (921, 610), (936, 619), (940, 685), (960, 717)],
    "piel_ref": PIEL,
    # ---------------------------------------------------------------- retrato
    "retrato": {
        "x_min": 418,
        "corte_y": 735,                                   # la cabeza acaba aquí; debajo cuelga la melena
        "pivote": (715, 712),                             # punto del retrato que va sobre el cuello del cuerpo (centro del cuello)
        "mandibula": [(655, 555), (670, 570), (690, 588), (720, 607), (750, 627), (780, 650), (807, 663), (827, 668),
                      (840, 663), (860, 640), (883, 607), (900, 580), (913, 557), (923, 510)],
        # bajo la mandíbula: el cuello en sombra y el pelo oscuro de detrás del cuello se quedan fuera de la
        # cabeza (el cuello lo pone el cuerpo; detrás, fondo, como en Laura y Carla)
        "excluir": [[(662, 588), (690, 610), (720, 628), (750, 646), (775, 661), (800, 673), (825, 679), (842, 672), (852, 660),
                     (858, 645), (858, 740), (662, 740)]],
        "ojos": {
            # blanco e iris, por dentro de la raya gruesa de las pestañas (que se queda en la cabeza)
            "d": [(754, 404), (763, 401), (774, 400), (786, 401), (797, 404), (807, 408), (815, 412), (821, 418), (823, 428),
                  (822, 438), (815, 443), (804, 440), (790, 436), (776, 433), (765, 430), (758, 423), (755, 413)],
            "i": [(883, 452), (892, 448), (904, 446), (916, 447), (925, 450), (930, 455), (930, 463), (926, 470), (918, 477),
                  (906, 479), (895, 476), (887, 470), (883, 462)],
        },
        "cejas": {
            # la cercana empieza a la derecha del mechón que le cruza la frente
            "d": [(762, 346), (786, 343), (808, 348), (826, 355), (842, 364), (856, 374), (862, 384), (855, 391), (840, 383),
                  (822, 374), (805, 367), (786, 362), (764, 360)],
            "i": [(898, 410), (906, 402), (916, 397), (928, 397), (940, 402), (950, 410), (956, 422), (954, 432), (946, 424),
                  (936, 413), (924, 408), (912, 408), (902, 414)],
        },
        "ceja_umbral": 120,
        "boca": [(768, 540), (786, 541), (815, 550), (850, 556), (878, 565), (884, 578), (872, 591), (848, 598), (822, 594),
                 (798, 583), (782, 568), (770, 552)],
        "boca_umbral": -1,                                # la pieza de la boca es la zona entera (labios incluidos)
        "pivotes": {"ceja_d": (808, 358), "ceja_i": (925, 405), "boca": (826, 568)},
        # melena: el mechón largo que le cae por el lado de la mejilla lejana; con espejo y más oscura va detrás
        "melena": {"zona": [(845, 640), (1122, 640), (1122, 1160), (845, 1160)], "raiz": (950, 660), "fin": (1005, 1100),
                   "oscurecer_atras": 0.72},
    },
    # ---------------------------------------------------------------- figura
    "figura": {
        "x_max": 500,
        "pelvis": (232, 690),
        "cuello_corte": [(60, 0), (470, 0), (470, 190), (262, 190), (250, 205), (236, 222), (225, 226), (210, 218), (192, 205),
                         (175, 192), (60, 190)],
        # el torso baja hasta la cintura del vaquero (las muñecas entran en los bolsillos); lo de debajo, piernas
        "pelvis_corte": [(0, 676), (100, 678), (150, 684), (200, 698), (232, 712), (262, 700), (310, 686), (355, 678),
                         (500, 676), (500, 1402), (0, 1402)],
        "pelo_hasta_y": 0,                                # la melena de delante ya se quitó en «limpiar»
        "brazos": {
            # el izquierdo de ella (a la derecha en pantalla)
            "brazo": {
                "poli": [(318, 258), (345, 265), (368, 275), (388, 298), (400, 330), (412, 370), (426, 420), (440, 470), (440, 520),
                         (434, 560), (424, 600), (408, 628), (380, 640), (352, 634), (335, 618), (320, 606), (312, 594), (318, 576),
                         (321, 556), (334, 546), (340, 525), (336, 495), (331, 465), (334, 430), (334, 390), (330, 340), (322, 300)],
                "hombro": (372, 318), "codo": (424, 505), "muneca": (330, 604),
                "radio": 36, "ancho": 80, "sobre": 52,
            },
            # el derecho de ella (a la izquierda en pantalla)
            "brazo_cerca": {
                "poli": [(92, 284), (112, 277), (132, 271), (140, 295), (132, 335), (122, 380), (114, 420), (110, 455), (110, 490),
                         (104, 515), (98, 535), (108, 552), (135, 558), (160, 565), (170, 578), (168, 594), (150, 599), (128, 597),
                         (108, 600), (99, 618), (96, 646), (78, 640), (58, 624), (40, 604), (26, 580), (16, 552), (12, 520), (12, 500),
                         (16, 470), (22, 440), (27, 400), (32, 360), (37, 330), (42, 310), (52, 296), (66, 286), (82, 280)],
                "hombro": (100, 318), "codo": (55, 515), "muneca": (118, 598),
                "radio": 36, "ancho": 82, "sobre": 52,
            },
        },
        "torso": {
            "poli": [(164, 70), (254, 70), (254, 150), (332, 150), (332, 259), (342, 267), (352, 271), (360, 278), (368, 287), (374, 297), (379, 307),
                     (382, 318), (384, 327), (350, 334), (340, 350),
                     (338, 400), (336, 460), (340, 520), (345, 560), (350, 600), (352, 640), (352, 700), (232, 715), (98, 700),
                     (96, 660), (98, 620), (102, 580), (106, 540), (110, 500), (110, 450), (110, 400), (108, 340), (90, 330),
                     (55, 322), (56, 318), (63, 306), (75, 296), (85, 288), (92, 284), (92, 60), (164, 60)],
            "manos": [],
            # lo que tapaban los brazos: chaqueta por encima del bajo y vaquero por debajo (solo se pinta lo que hay
            # que reconstruir dentro de cada zona, así que las zonas van holgadas)
            "rellenos": [
                ([(88, 600), (178, 600), (178, 705), (88, 705)], VAQUERO),
                ([(286, 604), (362, 604), (362, 705), (286, 705)], VAQUERO),
            ],
            # la chaqueta bajo las mangas con su punto (el mismo trozo limpio que en «limpiar»): al levantar el
            # brazo, el hombro y el costado que asoman no son un gris liso
            "rellenos_teja": [
                ([(50, 255), (142, 255), (142, 600), (50, 600)], TROZO_PUNTO),
                ([(318, 250), (390, 250), (390, 604), (318, 604)], TROZO_PUNTO),
            ],
            # se pinta aunque no estuviera tapado: el cuello sube por detrás de la barbilla de la cabeza grande, tan
            # ancho como el del retrato (de hombro a hombro del escote), liso
            "forzar": [([(165, 70), (253, 70), (253, 254), (165, 252)], PIEL),
                       # pelo en sombra detrás del cuello, hasta los hombros (lo que asoma bajo la barbilla)
                       ([(253, 150), (332, 150), (332, 259), (300, 254), (270, 258), (253, 261)], PELO_SOMBRA),
                       ([(92, 60), (164, 60), (164, 256), (140, 263), (115, 271), (92, 280)], PELO_SOMBRA)],
            "lineas": [
                # lados del cuello (sube por detrás de la cabeza)
                ([(165, 70), (165, 200), (166, 258)], TINTA, 4),
                ([(253, 70), (253, 200), (252, 263)], TINTA, 4),
                # mechones del pelo de detrás del cuello y hombros por encima
                ([(262, 150), (267, 200), (271, 256)], PELO_LUZ, 2), ([(286, 150), (290, 205), (292, 252)], PELO_LUZ, 2),
                ([(307, 150), (313, 200), (318, 254)], PELO_LUZ, 2), ([(276, 150), (279, 210), (281, 255)], PELO_OSCURO, 2),
                ([(297, 150), (301, 200), (305, 252)], PELO_OSCURO, 2),
                ([(152, 60), (149, 200), (151, 255)], PELO_LUZ, 2), ([(128, 60), (124, 210), (122, 268)], PELO_LUZ, 2),
                ([(106, 60), (102, 210), (103, 274)], PELO_LUZ, 2), ([(140, 60), (136, 205), (137, 261)], PELO_OSCURO, 2),
                ([(117, 60), (113, 210), (112, 270)], PELO_OSCURO, 2),
                # contorno de los hombros (la manga no pinta nada por encima del hombro: lo pone el torso)
                ([(250, 264), (270, 260), (300, 256), (320, 259), (330, 262), (342, 267), (352, 271), (360, 278), (368, 287),
                  (374, 297), (379, 307), (382, 318), (384, 327)], TINTA, 5),
                ([(55, 323), (56, 318), (63, 306), (75, 296), (85, 288), (95, 282), (115, 274), (140, 266), (165, 259)], TINTA, 5),
                # costados de la chaqueta bajo las mangas
                ([(104, 334), (105, 340), (109, 400), (109, 460), (107, 520), (103, 560), (100, 598)], TINTA, 4),
                ([(342, 334), (340, 350), (338, 410), (336, 460), (339, 520), (344, 560), (348, 600)], TINTA, 4),
                # bajo de la chaqueta tras los puños y abertura de los bolsillos
                ([(98, 600), (125, 600), (150, 601), (172, 606)], TINTA, 4),
                ([(296, 606), (320, 604), (348, 601)], TINTA, 4),
                ([(96, 634), (117, 637), (136, 632), (148, 621), (154, 608), (157, 600)], COSTURA, 3),
                ([(289, 602), (296, 617), (309, 631), (327, 642), (348, 646)], COSTURA, 3),
            ],
        },
        "piernas": {
            "separa": [(712, 230), (1250, 262)],          # recta (y, x) entre las dos piernas
            "desde_y": 640,
            "cerca": {"x": (35, 245), "cadera": (165, 690), "tobillo": (155, 1250),
                      "dobladillo": [(35, 1225), (100, 1228), (125, 1233), (140, 1236), (155, 1237), (165, 1239), (175, 1243),
                                     (185, 1248), (195, 1253), (205, 1258), (215, 1263), (222, 1265), (230, 1252), (240, 1238),
                                     (245, 1232)]},
            "lejos": {"x": (215, 455), "cadera": (300, 690), "tobillo": (378, 1262),
                      "dobladillo": [(215, 1262), (320, 1262), (335, 1272), (350, 1272), (370, 1262), (390, 1252), (410, 1246),
                                     (430, 1240), (445, 1235), (455, 1228)]},
            "oscurecer_lejos": 0.8,
            "color_cupula": VAQUERO,
            # zapatilla blanca y gris (la de la pierna lejana, casi de perfil); la suela se nivela
            "zapato": {"x": (325, 495), "tobillo": (378, 1262), "y_tope": 1238, "y_suela": 1350, "bajo_de": "lejos",
                       "collar": (34, 16), "color_collar": (240, 238, 238),
                       "nivelar": [(342, 1332), (478, 1346)]},
        },
    },
    "paleta": {"piel_sombra": [222, 140, 92], "pelo": [119, 71, 40], "labio": [214, 122, 108], "labio_claro": [236, 150, 136],
               "chaqueta": CHAQUETA, "vaquero": VAQUERO, "tinta": TINTA},
    "paleta_muestras": {"piel": [(760, 560), (780, 560), (780, 580), (760, 580)],
                        "iris": [(770, 410), (778, 410), (778, 418), (770, 418)]},
}

if __name__ == "__main__":
    preparar.construir(CFG)
