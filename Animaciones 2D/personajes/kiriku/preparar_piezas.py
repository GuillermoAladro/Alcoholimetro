#!/usr/bin/env python3
"""Piezas de Kiriku a partir de su avatar 2D (Avatares 2D/Kiriku/Kiriku-2D.png).

Solo datos: coordenadas en píxeles de su hoja (1122 × 1402). El recorte lo hace
personajes/comun/preparar.py. Para revisar o ajustar las coordenadas:
    python3 personajes/comun/ver_hoja.py kiriku [carpeta]
Uso: python3 preparar_piezas.py [ruta_avatar] [carpeta_salida] [carpeta_depuracion]

Polo negro de manga corta con un jersey negro echado sobre los hombros (las mangas anudadas al pecho)
y unas gafas de sol colgadas del cuello: jersey y gafas son del torso y se quedan tal cual. Cada brazo
es la manga del polo más el brazo de piel, cortado bajo el jersey; el hombro redondo del muñeco (negro)
tapa la junta. Tiene las manos metidas en los bolsillos del vaquero: los antebrazos llegan hasta la
abertura del bolsillo, así que el torso baja hasta la cintura del vaquero y lo que tapaban los
antebrazos se repinta. El negro del polo cuenta como «pelo» para el detector de color: se desactiva
en la figura (pelo_hasta_y 0).
"""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "comun"))
import preparar

TINTA = [12, 10, 12]
POLO = [36, 35, 42]
VAQUERO = [158, 177, 208]
COSTURA = [92, 104, 130]
PIEL = [253, 181, 122]

# borde de abajo de la línea de la mandíbula del retrato: de debajo de la oreja a la barbilla
MANDIBULA = [(680, 545), (682, 562), (686, 577), (694, 590), (705, 601), (718, 610), (740, 617), (760, 624),
             (780, 639), (800, 653), (830, 668), (860, 680), (885, 687), (905, 686), (920, 676)]

CFG = {
    "id": "kiriku",
    "fuente": "Avatares 2D/Kiriku/Kiriku-2D.png",
    "rotulo": (0, 0, 175, 62),
    "piel_ref": PIEL,
    "huecos_fondo": [(120, 536), (371, 532)],          # huecos blancos entre los antebrazos y el polo
    # ---------------------------------------------------------------- retrato
    "retrato": {
        "x_min": 545,
        "corte_y": 700,
        "pivote": (780, 700),                              # punto del retrato que va sobre el cuello del cuerpo
        "mandibula": [(680, 540), (682, 560), (686, 574), (692, 586), (702, 598), (717, 607), (740, 614), (760, 621),
                      (780, 636), (800, 650), (830, 665), (860, 677), (885, 684), (905, 683), (920, 673)],
        "mandibula_ventana": 8,                            # la barba de tres días toca la línea de la mandíbula
        "fundido_pelo": 0,                                 # el pelo de la nuca acaba antes del corte
        "excluir": [
            # cuello bajo la mandíbula (de la oreja a la barbilla) y el cuello de la camisa del retrato; el
            # mechón de la nuca se queda en la cabeza
            [(640, 529), (657, 534), (677, 528)] + MANDIBULA +
            [(1122, 676), (1122, 1402), (540, 1402), (540, 650), (608, 643), (615, 627), (620, 607), (622, 584),
             (630, 568), (637, 548)],
            # el mechón de la nuca acaba en punta bajo la oreja: en el muñeco el cuello es más estrecho y quedaría
            # colgando en el aire
            [(560, 520), (598, 528), (622, 534), (642, 531), (645, 700), (560, 700)],
        ],
        "ojos": {
            # blanco e iris, por dentro de la raya gruesa de las pestañas
            "d": [(804, 389), (817, 388), (833, 388), (850, 389), (864, 393), (872, 399), (877, 407), (870, 410),
                  (858, 408), (845, 405), (828, 401), (812, 397), (805, 394)],
            "i": [(940, 428), (950, 427), (962, 429), (972, 433), (980, 440), (985, 448), (982, 453), (972, 452),
                  (962, 449), (950, 444), (942, 438), (938, 432)],
        },
        "cejas": {
            "d": [(778, 357), (790, 346), (802, 338), (820, 331), (838, 329), (856, 332), (873, 335), (891, 339),
                  (910, 344), (922, 347), (928, 354), (924, 364), (912, 371), (900, 367), (888, 361), (872, 355),
                  (857, 348), (840, 343), (822, 344), (803, 348), (790, 354), (781, 359)],
            "i": [(944, 388), (948, 379), (953, 367), (960, 369), (970, 372), (980, 375), (990, 379), (998, 384),
                  (1001, 392), (1001, 404), (992, 401), (982, 397), (970, 392), (958, 390), (948, 392)],
        },
        "ceja_umbral": 250,                                 # solo lo oscuro (la sombra del párpado se queda en la cara)
        "boca": [(822, 535), (832, 527), (845, 521), (860, 517), (890, 514), (915, 517), (928, 526), (937, 544),
                 (940, 565), (932, 576), (915, 573), (895, 566), (875, 559), (855, 551), (838, 545), (826, 541)],
        "boca_umbral": -1,                                  # la pieza de la boca es la zona entera (labios incluidos)
        "pivotes": {"ceja_d": (852, 346), "ceja_i": (975, 386), "boca": (880, 542)},
    },
    # ---------------------------------------------------------------- figura
    "figura": {
        "x_max": 560,
        "pelvis": (262, 705),
        "cuello_corte": [(200, 0), (340, 0), (340, 236), (200, 236)],
        # el torso baja hasta la cintura del vaquero (las muñecas entran en los bolsillos); lo de debajo, piernas
        "pelvis_corte": [(0, 700), (110, 700), (160, 705), (210, 714), (262, 728), (312, 714), (362, 705), (470, 700),
                         (600, 700), (600, 1402), (0, 1402)],
        "pelo_hasta_y": 0,                                  # el polo negro no es pelo
        "brazos": {
            # el izquierdo de él (a la derecha en pantalla): manga del polo y antebrazo hasta el bolsillo; el borde
            # de dentro va pegado al costado del polo (lo que pisa del torso se repinta en el torso)
            "brazo": {
                "poli": [(364, 300), (384, 292), (404, 304), (418, 325), (428, 355), (436, 390), (442, 425), (448, 455),
                         (447, 472), (445, 500), (443, 530), (438, 560), (429, 595), (418, 625), (412, 648), (410, 676),
                         (396, 664), (382, 652), (368, 643), (374, 632), (378, 610), (379, 580), (378, 560), (376, 540),
                         (374, 520), (370, 505), (369, 480), (368, 455), (367, 420), (366, 380), (364, 340)],
                "hombro": (394, 322), "codo": (414, 525), "muneca": (393, 660),
                "radio": 34, "ancho": 72, "sobre": 48,
            },
            # el derecho de él (a la izquierda en pantalla)
            "brazo_cerca": {
                "poli": [(58, 302), (96, 318), (134, 342), (133, 400), (132, 452), (128, 465), (117, 488), (108, 505),
                         (107, 520), (112, 532), (118, 545), (124, 556), (128, 566), (132, 582), (137, 595), (147, 614),
                         (166, 630), (192, 635), (157, 659), (123, 683), (112, 666), (100, 646), (85, 621), (68, 596),
                         (52, 570), (40, 541), (33, 501), (30, 470), (28, 435), (32, 400), (38, 370), (46, 340), (52, 318)],
                "hombro": (86, 322), "codo": (75, 525), "muneca": (150, 658),
                "radio": 36, "ancho": 74, "sobre": 48,
            },
        },
        "torso": {
            # cuello, polo con el jersey y las gafas, y cintura del vaquero; por los lados llega hasta el costado del
            # polo y la cadera del vaquero que tapaban los brazos
            "poli": [(222, 140), (305, 140), (306, 236), (322, 240), (342, 254), (362, 272), (384, 292), (404, 304),
                     (390, 312), (370, 318), (362, 340), (364, 400), (366, 455), (368, 511), (369, 548), (371, 580),
                     (372, 610), (374, 638), (380, 642), (397, 654), (404, 670), (407, 700), (410, 760),
                     (100, 760), (108, 730), (114, 705), (118, 690), (122, 682), (129, 660), (136, 640), (138, 634),
                     (139, 612), (139, 590), (140, 560), (138, 542), (124, 530), (120, 510), (116, 490), (120, 470),
                     (126, 452), (130, 400), (133, 342), (118, 330), (96, 318), (58, 302), (62, 292), (72, 282),
                     (85, 272), (115, 262), (150, 245), (180, 232), (205, 228), (222, 232)],
            "manos": [],
            "rellenos": [
                # lo que tapaban los brazos: polo por encima del bajo y cintura del vaquero por debajo
                # (solo se pinta lo que hay que reconstruir dentro de cada zona, así que las zonas van holgadas)
                ([(90, 300), (150, 330), (150, 600), (200, 600), (200, 634), (126, 637), (90, 642)], POLO),
                ([(90, 642), (126, 637), (200, 634), (204, 705), (90, 705)], VAQUERO),
                ([(355, 296), (420, 296), (420, 641), (355, 641)], POLO),
                ([(355, 641), (420, 641), (420, 705), (355, 705)], VAQUERO),
            ],
            # se pinta aunque no estuviera tapado: el cuello sube por detrás de la barbilla de la cabeza grande
            "forzar": [([(222, 140), (305, 140), (306, 230), (286, 238), (262, 242), (240, 238), (222, 230)], PIEL)],
            "lineas": [
                # lados del cuello (sube por detrás de la cabeza)
                ([(222, 140), (221, 190), (219, 232)], TINTA, 4),
                ([(305, 140), (306, 190), (307, 236)], TINTA, 4),
                # costado del polo tras el brazo cercano, bajo del polo, cadera y abertura del bolsillo
                ([(133, 342), (130, 400), (126, 452), (121, 490), (124, 530), (134, 560), (138, 600), (138, 634)], TINTA, 5),
                ([(138, 634), (160, 640), (192, 637)], TINTA, 4),
                ([(137, 638), (129, 660), (122, 682), (118, 700)], TINTA, 5),
                ([(123, 684), (155, 662), (190, 640)], COSTURA, 3),
                # costado del polo tras el brazo lejano, bajo, cadera y bolsillo
                ([(362, 342), (364, 400), (366, 455), (368, 511), (369, 548), (371, 580), (372, 610), (374, 638)], TINTA, 5),
                ([(368, 642), (386, 640)], TINTA, 4),
                ([(380, 642), (397, 654), (404, 670), (407, 700)], TINTA, 5),
                ([(370, 646), (390, 660), (406, 677)], COSTURA, 3),
            ],
        },
        "piernas": {
            "separa": [(755, 262), (1250, 256)],           # recta (y, x) entre las dos piernas
            "desde_y": 660,
            "cerca": {"x": (40, 264), "cadera": (192, 705), "tobillo": (128, 1262),
                      "dobladillo": [(55, 1195), (62, 1232), (70, 1248), (90, 1254), (115, 1260), (150, 1267),
                                     (172, 1278), (185, 1272), (194, 1245), (200, 1205)]},
            "lejos": {"x": (255, 442), "cadera": (335, 705), "tobillo": (385, 1268),
                      "dobladillo": [(310, 1240), (318, 1262), (328, 1277), (350, 1280), (370, 1275), (390, 1266),
                                     (410, 1258), (430, 1251), (447, 1246)]},
            "oscurecer_lejos": 0.8,
            "color_cupula": VAQUERO,
            "zapato": {"x": (318, 550), "tobillo": (385, 1268), "y_tope": 1240, "y_suela": 1352, "bajo_de": "lejos",
                       "collar": (34, 16), "color_collar": (238, 236, 236),
                       "nivelar": [(332, 1332), (500, 1350)]},
        },
    },
    "paleta": {"piel_sombra": [202, 124, 73], "pelo": [57, 44, 42], "camiseta": POLO, "camiseta_sombra": [22, 22, 26],
               "vaquero": VAQUERO, "tinta": TINTA},
    "paleta_muestras": {"piel": [(740, 440), (770, 440), (770, 470), (740, 470)],
                        "iris": [(826, 390), (834, 390), (834, 398), (826, 398)]},
}

if __name__ == "__main__":
    preparar.construir(CFG)
