#!/usr/bin/env python3
"""Piezas de Sara Sáez a partir de su avatar 2D (Avatares 2D/Sara-Saez/Sara-Saez-2D.png).

Solo datos: coordenadas en píxeles de su hoja (1122 × 1402). El recorte lo hace
personajes/comun/preparar.py. Para revisar o ajustar las coordenadas:
    python3 personajes/comun/ver_hoja.py sara-saez [carpeta]
Uso: python3 preparar_piezas.py [ruta_avatar] [carpeta_salida] [carpeta_depuracion]

Melena lisa casi negra hasta la cintura que en la figura cae por delante de los dos hombros; top negro
de manga larga con escote redondo, pantalón cargo negro de tiro alto y zapatillas blancas y grises.
Mira a la derecha, como los demás (no hace falta reflejar la hoja). El negro de la ropa cuenta como
«pelo» para el detector de color, así que en la figura no se usa (pelo_hasta_y 0): la melena de delante
se quita antes de trocear con polígonos («limpiar») y se rehace lo que tapaba (piel del escote, top y
mangas negras, hueco entre el brazo cercano y la cintura, contornos). El pelo lo trae la cabeza del
retrato y la melena que se balancea. Las manos metidas en los bolsillos se quitan (las dibuja el
muñeco). El collar de cordón con la cruz se borra del pecho (y del cuello del retrato) y se dibuja
aparte para que se mezca (sara-saez.js). Los pendientes de perla y el aro de la nariz se quedan en la
cabeza. La pieza del pie es la zapatilla de perfil, con la suela nivelada.
"""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "comun"))
import preparar

TINTA = [12, 10, 12]
PIEL = [251, 183, 131]
NEGRO = [38, 36, 39]                 # top, mangas y pantalón
PELO_OSCURO = [20, 16, 18]

# borde de abajo de la raya de la mandíbula en el retrato (+2 px) y lado derecho del cuello
CUELLO_RETRATO = [(694, 527), (700, 527), (712, 542), (724, 554), (736, 566), (748, 576), (760, 587), (772, 596),
                  (784, 604), (796, 612), (808, 618), (820, 621), (832, 619), (836, 630), (834, 653), (838, 670),
                  (858, 687), (870, 703), (878, 724), (882, 740), (694, 740)]

CFG = {
    "id": "sara-saez",
    "fuente": "Avatares 2D/Sara-Saez/Sara-Saez-2D.png",
    "rotulo": (0, 0, 235, 55),
    "piel_ref": PIEL,
    # ---------------------------------------------------------------- retoques de la hoja
    "limpiar": [
        # puntas de la melena del retrato: el marco del retrato la corta en recto; se le dan puntas de mechón
        {"fondo": [(1040, 1050), (1052, 1094), (1064, 1046), (1077, 1090), (1089, 1040), (1101, 1078), (1114, 1030),
                   (1122, 1030), (1122, 1140), (1040, 1140)]},
        {"linea": [(1040, 1050), (1052, 1094), (1064, 1046), (1077, 1090), (1089, 1040), (1101, 1078), (1114, 1030)],
         "color": PELO_OSCURO, "ancho": 3},
        # hombro del top del retrato que asoma entre los mechones de la derecha: pelo copiado de encima
        {"copiar": [(1000, 712), (1066, 712), (1060, 792), (1000, 792)], "desde": [0, -80], "repetir": True},
        # ---- la melena que cae por delante del cuerpo (lado cercano, a la izquierda en pantalla)
        # piel del escote y del hombro entre el cuello y el borde del top (solo donde había pelo; se ensancha
        # un poco para tapar el borde del pelo y lo que se sale lo vuelve a tapar el top)
        {"pintar": [(139, 256), (160, 252), (185, 247), (212, 243), (214, 280), (208, 305), (198, 328), (190, 338),
                    (182, 344), (172, 330), (162, 311), (152, 292), (144, 274)], "mascara": "no_piel", "dilata": 3, "color": PIEL},
        # top y manga negros bajo el pelo (fuera del escote)
        {"pintar": [(106, 264), (139, 258), (144, 274), (152, 292), (162, 311), (172, 330), (181, 347), (186, 350),
                    (200, 351), (200, 420), (194, 470), (188, 505), (182, 532), (150, 532), (112, 505), (110, 440), (106, 330)],
         "color": NEGRO},
        # ---- lado lejano (a la derecha en pantalla)
        {"pintar": [(278, 243), (300, 260), (330, 278), (360, 293), (354, 315), (349, 335), (345, 350), (341, 354),
                    (318, 354), (296, 300), (284, 278)], "mascara": "no_piel", "dilata": 3, "color": PIEL},
        {"pintar": [(358, 294), (372, 298), (388, 310), (396, 330), (398, 385), (402, 400), (404, 470), (404, 500),
                    (380, 516), (352, 516), (336, 505), (338, 470), (341, 400), (343, 362), (347, 340), (352, 318)],
         "color": NEGRO},
        # pelo que caía sobre el lado derecho del cuello: piel
        {"pintar": [(256, 238), (286, 238), (288, 250), (296, 290), (284, 296), (268, 292), (260, 262)],
         "mascara": "no_piel", "dilata": 3, "color": PIEL},
        # collar de la figura (cordón negro y cruz), ya sin el pelo alrededor: fuera; lo dibuja sara-saez.js y se mece
        {"rellenar": [(203, 266), (214, 264), (238, 288), (258, 308), (262, 312), (276, 284), (282, 270), (292, 276),
                      (280, 304), (272, 318), (272, 346), (250, 346), (250, 318), (234, 302), (203, 278)],
         "mascara": "no_piel", "dilata": 2, "radio": 5},
        # mechones que asomaban por fuera del brazo lejano: fondo
        {"fondo": [(397, 384), (400, 376), (418, 376), (418, 500), (405, 500), (402, 470), (400, 440), (398, 410)]},
        # hueco entre el brazo cercano y la cintura (con los mechones que caían dentro): fondo
        {"fondo": [(126, 362), (123, 400), (122, 439), (115, 467), (113, 482), (117, 495), (121, 514), (131, 545),
                   (143, 568), (149, 557), (159, 539), (168, 520), (174, 504), (166, 475), (155, 440), (142, 400),
                   (131, 364)]},
        # manos metidas en los bolsillos: solo la piel (y su contorno); dentro del bolsillo, negro
        {"pintar": [(122, 596), (170, 596), (170, 652), (122, 652)], "mascara": "piel", "dilata": 3, "color": NEGRO},
        {"pintar": [(378, 588), (418, 588), (418, 640), (378, 640)], "mascara": "piel", "dilata": 3, "color": NEGRO},
        # contornos tapados: hombro, escote, brazo cercano por dentro, costado de la cintura, brazo lejano
        {"linea": [(108, 263), (125, 260), (139, 258), (160, 254), (185, 249), (208, 245)], "color": TINTA, "ancho": 4},
        {"linea": [(139, 258), (144, 274), (152, 292), (162, 311), (172, 330), (182, 347), (190, 350)], "color": TINTA, "ancho": 3},
        {"linea": [(126, 352), (124, 400), (122, 441)], "color": TINTA, "ancho": 4},
        {"linea": [(126, 356), (142, 400), (155, 440), (166, 475), (174, 504), (168, 520)], "color": TINTA, "ancho": 4},
        {"linea": [(280, 248), (300, 265), (325, 280), (350, 291), (365, 297), (378, 302)], "color": TINTA, "ancho": 4},
        {"linea": [(336, 364), (343, 362), (347, 340), (352, 318), (358, 298), (364, 296)], "color": TINTA, "ancho": 3},
        {"linea": [(395, 330), (396, 360), (397, 385), (398, 410), (400, 440), (402, 470), (404, 495), (406, 506)], "color": TINTA, "ancho": 4},
        {"linea": [(351, 366), (354, 390), (358, 430), (363, 470), (370, 505), (377, 530)], "color": TINTA, "ancho": 4},
    ],
    # huecos blancos encerrados que son fondo: entre el brazo cercano y la cintura
    "huecos_fondo": [(140, 480)],
    # ---------------------------------------------------------------- retrato
    "retrato": {
        "x_min": 430,
        "corte_y": 728,                                   # la cabeza acaba aquí; debajo cuelga la melena
        "pivote": (775, 690),                             # punto del retrato que va sobre el cuello del cuerpo
        "mandibula": [(700, 524), (723, 549), (748, 570), (777, 591), (802, 605), (823, 614), (840, 612), (869, 595),
                      (894, 574), (915, 553), (932, 528), (948, 507)],
        "mandibula_ventana": 8,                           # el lado derecho de la cara toca el pelo sin raya
        # cuello bajo la barbilla (sombras y cordón del collar): fuera; el cuello es el del cuerpo
        "excluir": [CUELLO_RETRATO],
        "ojos": {
            # blanco e iris, por dentro de la raya gruesa de las pestañas (que se queda en la cabeza)
            "d": [(782, 367), (788, 366), (796, 366), (806, 366), (816, 367), (822, 372), (830, 378), (838, 384),
                  (843, 391), (845, 399), (838, 400), (828, 398), (818, 395), (806, 391), (796, 388), (788, 384),
                  (783, 378), (781, 372)],
            "i": [(893, 417), (898, 412), (905, 409), (915, 408), (925, 408), (932, 408.5), (940, 411), (945, 414),
                  (948, 419), (948, 425), (942, 430), (933, 431), (924, 430), (917, 428), (908, 424), (900, 422),
                  (893, 419)],
        },
        "cejas": {
            "d": [(796, 316), (818, 320), (836, 326), (852, 335), (866, 344), (880, 353), (882, 364), (866, 362),
                  (850, 351), (832, 342), (814, 335), (798, 331)],
            "i": [(906, 374), (920, 367), (944, 365), (966, 365), (978, 369), (984, 377), (982, 384), (966, 383),
                  (944, 384), (922, 385), (906, 384)],
        },
        "ceja_umbral": 200,                               # solo el trazo oscuro
        "boca": [(798, 516), (808, 507), (828, 500), (846, 498), (862, 501), (874, 506), (880, 516), (880, 535),
                 (872, 548), (852, 553), (830, 550), (814, 542), (803, 528)],
        "pivotes": {"ceja_d": (840, 340), "ceja_i": (945, 375), "boca": (839, 523)},
        # melena: la masa larga de la derecha del retrato (sin el hombro del top); con espejo y más oscura va detrás
        "melena": {"zona": [(905, 600), (1074, 600), (1070, 712), (1060, 720), (1058, 850), (1085, 860), (1100, 890),
                            (1114, 920), (1114, 1066), (1046, 1110), (1040, 935), (1000, 862), (960, 800), (905, 725)],
                   "raiz": (990, 610), "fin": (1079, 1090), "oscurecer_atras": 0.72},
    },
    # ---------------------------------------------------------------- figura
    "figura": {
        "x_max": 520,
        "pelvis": (262, 700),
        "cuello_corte": [(150, 0), (420, 0), (420, 236), (282, 244), (262, 250), (245, 250), (207, 240), (150, 240)],
        "pelvis_corte": [(0, 690), (110, 690), (150, 694), (200, 700), (240, 708), (262, 722), (285, 708), (330, 700),
                         (380, 694), (420, 690), (600, 690), (600, 1402), (0, 1402)],
        "pelo_hasta_y": 0,                                # la melena de delante ya se quitó en «limpiar»
        "brazos": {
            # el izquierdo de ella (a la derecha en pantalla): casi todo estaba bajo la melena
            "brazo": {
                "poli": [(360, 295), (372, 294), (388, 300), (398, 316), (401, 350), (401, 384), (402, 410), (404, 440),
                         (406, 470), (408, 493), (416, 520), (423, 553), (428, 580), (429, 600), (423, 624), (413, 642), (400, 624),
                         (385, 602), (381, 594), (378, 570), (375, 532), (368, 505), (361, 470), (356, 430), (352, 390),
                         (350, 365), (352, 330), (356, 312)],
                "hombro": (372, 325), "codo": (388, 495), "muneca": (400, 610),
                "L1": 185.0, "L2": 138.0, "radio": 30, "ancho": 64, "sobre": 50,
            },
            # el derecho de ella (a la izquierda en pantalla)
            "brazo_cerca": {
                "poli": [(68, 268), (90, 262), (110, 259), (125, 257), (140, 256), (139, 300), (131, 340), (126, 360),
                         (124, 400), (122, 439), (115, 467), (113, 482), (117, 495), (121, 514), (131, 545), (143, 568),
                         (151, 592), (140, 622), (131, 652), (118, 645), (108, 625), (92, 604), (66, 560), (46, 516),
                         (40, 488), (44, 440), (49, 380), (56, 328), (58, 296)],
                "hombro": (98, 302), "codo": (78, 490), "muneca": (138, 618),
                "L1": 185.0, "L2": 138.0, "radio": 34, "ancho": 72, "sobre": 54,
            },
        },
        "torso": {
            "poli": [(210, 120), (280, 120), (280, 248), (300, 266), (325, 281), (350, 292), (365, 297), (378, 302),
                     (386, 320), (380, 360), (373, 420), (370, 470), (372, 510), (380, 545), (396, 575), (406, 610),
                     (410, 650), (412, 690), (414, 745),
                     (110, 745), (112, 717), (118, 680), (122, 642), (126, 620), (135, 590), (148, 560), (159, 539),
                     (168, 520), (174, 504), (166, 475), (155, 440), (142, 400), (130, 362), (124, 340), (118, 300),
                     (124, 270), (139, 259), (160, 255), (185, 250), (208, 246)],
            "manos": [],
            # lo que tapaban las mangas: top y pantalón negros, lisos
            "rellenos": [
                ([(100, 250), (175, 250), (175, 745), (100, 745)], NEGRO),
                ([(330, 285), (430, 285), (430, 745), (330, 745)], NEGRO),
            ],
            # se pinta aunque no estuviera tapado: el cuello sube por detrás de la barbilla de la cabeza grande
            "forzar": [([(210, 120), (280, 120), (280, 247), (272, 256), (256, 262), (236, 260), (218, 254), (209, 246)], PIEL)],
            "lineas": [
                # lados del cuello (sube por detrás de la cabeza)
                ([(210, 120), (209, 180), (208, 244)], TINTA, 4),
                ([(279, 120), (279, 180), (280, 247)], TINTA, 4),
                # costados del top y del pantalón tras los brazos
                ([(386, 318), (380, 360), (373, 420), (370, 470), (372, 510), (380, 545), (396, 575), (406, 610),
                  (410, 650)], TINTA, 5),
                ([(159, 539), (148, 560), (135, 590), (126, 620), (122, 642)], TINTA, 5),
            ],
        },
        "piernas": {
            "separa": [(700, 262), (1250, 240)],          # recta (y, x) entre las dos piernas
            "desde_y": 645,
            "cerca": {"x": (20, 262), "cadera": (190, 700), "tobillo": (100, 1258),
                      "dobladillo": [(20, 1250), (42, 1257), (55, 1250), (70, 1247), (95, 1245), (120, 1250), (140, 1262),
                                     (148, 1277), (160, 1255), (172, 1230), (180, 1225), (262, 1225)]},
            "lejos": {"x": (240, 436), "cadera": (335, 700), "tobillo": (365, 1250),
                      "dobladillo": [(240, 1262), (310, 1261), (337, 1260), (352, 1254), (367, 1248), (382, 1241),
                                     (397, 1234), (412, 1227), (428, 1221), (436, 1213)]},
            "oscurecer_lejos": 0.8,
            "color_cupula": NEGRO,
            # zapatilla blanca y gris (la de perfil); la suela se nivela entre el talón y la planta
            "zapato": {"x": (300, 512), "tobillo": (365, 1250), "y_tope": 1228, "y_suela": 1330, "bajo_de": "lejos",
                       "collar": (26, 10), "color_collar": (128, 120, 122),
                       "nivelar": [(312, 1287), (450, 1323)]},
        },
    },
    "paleta": {"piel_sombra": [206, 130, 82], "pelo": [28, 24, 26], "labio": [200, 98, 106], "labio_claro": [224, 128, 126],
               "top": NEGRO, "tinta": TINTA},
    "paleta_muestras": {"piel": [(225, 300), (245, 300), (245, 315), (225, 315)],
                        "iris": [(799, 375), (807, 375), (807, 383), (799, 383)]},
}

if __name__ == "__main__":
    preparar.construir(CFG)
