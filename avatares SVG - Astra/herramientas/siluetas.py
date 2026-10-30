#!/usr/bin/env python3
"""Siluetas nuevas (fondo transparente) para los avatares SVG Astra.

Para cada hoja de `animaciones/Avatar <Nombre>.png` calcula una máscara por vista
(4) y por expresión (6), en coordenadas de la hoja:

 1. Segmentación del personaje con isnet (rembg) sobre cada franja completa
    (vistas arriba, caras abajo): no confunde las zapatillas blancas con el fondo.
 2. Separación de figuras y retratos que se tocan (brazos, mangueras, pelo que
    invade el panel vecino) con watershed desde el eje de cada cabeza / panel.
 3. Contorno del pelo afinado contra el blanco del fondo (sin halo claro).
 4. Prior: la silueta anterior de Astra, rellena y dilatada, para excluir la
    firma manuscrita y respetar a qué figura pertenece cada pieza.

Después limpia cada silueta para la pantalla negra: filo claro y huecos de fondo
entre rizos, líneas blancas de borde de panel, cuñas de fondo junto al hombro,
mellas en zapatillas blancas y la sombra de contacto bajo las botas de Marcos.
La visera transparente del casco, los brillos y la ropa blanca se conservan.

Se usa desde generar_mascaras.py. Necesita la versión anterior (fondo blanco,
commit 0aa384a) renderizada por preparar_anteriores.py en ASTRA_ANTERIORES.
"""
import os, json, io
import numpy as np, cv2
from PIL import Image
from scipy.ndimage import binary_fill_holes, distance_transform_edt
from skimage.segmentation import watershed
from skimage.filters import sobel

AQUI = os.path.dirname(os.path.abspath(__file__))
ASTRA = os.path.dirname(AQUI) + '/'
REPO = os.path.dirname(os.path.dirname(AQUI))
ANTERIORES = os.environ.get('ASTRA_ANTERIORES', '/tmp/astra-anteriores')
FONDO = np.array([253.5, 253.6, 253.6])
NOMBRES = {'Guillermo-Aladro': 'Guillermo Aladro', 'Marcos-Bombero': 'Marcos Bombero', 'Sara-Saez': 'Sara Saez'}
PARTES = ['01-frontal', '02-tres-cuartos', '03-perfil', '04-espalda',
          '05-neutral', '06-risa', '07-sorpresa', '08-cansancio', '09-ojos-cerrados', '10-guino']
_SES = None


def ref_png(slug):
    return f'{REPO}/animaciones/Avatar {NOMBRES.get(slug, slug)}.png'


def sesion():
    global _SES
    if _SES is None:
        from rembg import new_session
        _SES = new_session('isnet-general-use')
    return _SES


def isnet(rgb8):
    from rembg import remove
    m = remove(Image.fromarray(rgb8), session=sesion(), only_mask=True, post_process_mask=False)
    return np.asarray(m, dtype=np.float32) / 255.0


def runs(v):
    out, s = [], None
    for i, x in enumerate(v):
        if x and s is None:
            s = i
        if not x and s is not None:
            out.append((s, i - 1)); s = None
    if s is not None:
        out.append((s, len(v) - 1))
    return out


def afinar_pelo(rgb, alfa, zona):
    fuera = alfa < 0.5
    dist = distance_transform_edt(~fuera)
    mn, mx = rgb.min(axis=2), rgb.max(axis=2)
    blancura = np.clip((mn - 196) / 46.0, 0, 1) * (mx - mn < 26)
    a_color = 1 - blancura
    interior = (alfa >= 0.95) & (dist >= 5) & ~((mn > 150) & (mx - mn < 30))
    _, (iy, ix) = distance_transform_edt(~interior, return_indices=True)
    F = rgb[iy, ix]
    d = F - FONDO
    n2 = (d * d).sum(axis=2)
    a_mezcla = np.clip(((rgb - FONDO) * d).sum(axis=2) / np.maximum(n2, 1), 0, 1)
    fiable = n2 > 60 ** 2
    a_color = np.where(fiable, np.minimum(a_color, a_mezcla), a_color)
    cerca = (dist < 16) & zona
    nuevo = np.where(cerca, np.minimum(alfa, a_color), alfa)
    # Solo se abre lo que queda conectado con el fondo exterior (huecos entre
    # mechones); los brillos blancos encerrados (casco, gafas) no se tocan.
    # Solo huecos finos (entre mechones): una zona clara amplia es parte del
    # personaje (visera transparente del casco, cristal de gafas, brillo).
    bajado = (nuevo < 0.5) & ~fuera
    amplio = cv2.morphologyEx(bajado.astype(np.uint8), cv2.MORPH_OPEN, np.ones((9, 9), np.uint8)) > 0
    amplio = cv2.dilate(amplio.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    nuevo = np.where(amplio & bajado, alfa, nuevo)
    bajo = (nuevo < 0.5) | fuera
    n, lab = cv2.connectedComponents(bajo.astype(np.uint8), connectivity=4)
    exteriores = np.unique(lab[fuera])
    abierto = np.isin(lab, exteriores[exteriores > 0])
    return np.where(abierto | ~bajo, nuevo, alfa)


def quitar_filos_claros(rgb, alfa, ancho=9):
    """Quita líneas claras finas y alargadas pegadas al contorno (el borde blanco
    de los paneles de la hoja), que sobre la pantalla negra se verían como un filo."""
    mn, mx = rgb.min(axis=2), rgb.max(axis=2)
    dentro = alfa >= 0.5
    claro = dentro & (mn > 190) & (mx - mn < 30)
    grueso = cv2.morphologyEx(claro.astype(np.uint8), cv2.MORPH_OPEN, np.ones((ancho, ancho), np.uint8)) > 0
    fino = claro & ~grueso
    borde = distance_transform_edt(dentro) <= 3
    n, lab, st, _ = cv2.connectedComponentsWithStats(fino.astype(np.uint8), 8)
    quitar = np.zeros_like(dentro)
    for k in range(1, n):
        x, y, w, h, area = st[k]
        if max(w, h) >= 30 and min(w, h) <= ancho and (lab[y:y + h, x:x + w][borde[y:y + h, x:x + w]] == k).any():
            quitar |= lab == k
    return np.where(quitar, 0, alfa)


def quitar_restos_fondo(rgb, alfa, area_max=3000):
    """Quita trozos de fondo blanco que quedan entre el hombro y el borde del
    panel: blancos puros, pegados al contorno, en la mitad inferior del retrato
    y que no suben desde el borde inferior (eso sería ropa blanca)."""
    dentro = alfa >= 0.5
    ys = np.where(dentro.any(1))[0]
    if not len(ys):
        return alfa
    y_top, y_bot = ys.min(), ys.max()
    mn, mx = rgb.min(axis=2), rgb.max(axis=2)
    blanco = dentro & (mn > 215) & (mx - mn < 20)
    borde = dentro & (distance_transform_edt(dentro) <= 2)
    n, lab, st, _ = cv2.connectedComponentsWithStats(blanco.astype(np.uint8), 8)
    quitar = np.zeros_like(dentro)
    xs_ = np.where(dentro.any(0))[0]
    x_izq, x_der = xs_.min(), xs_.max()
    for k in range(1, n):
        x, y, w, h, area = st[k]
        if y + h - 1 >= y_bot - 3:
            continue
        comp = lab[y:y + h, x:x + w] == k
        # Cuña de fondo entre el pelo y el borde lateral del panel: blanca y pegada
        # al extremo izquierdo o derecho del retrato, a cualquier altura.
        lateral = (x <= x_izq + 2 or x + w - 1 >= x_der - 2) and area < 6000
        if lateral or (area < area_max and y >= y_top + 0.4 * (y_bot - y_top)):
            if (comp & borde[y:y + h, x:x + w]).any():
                quitar[y:y + h, x:x + w] |= comp
    return np.where(quitar, 0, alfa)


CASCO = False


def limpiar_halo(rgb, alfa, zona, huecos_blancos=True):
    """Limpia el contorno para la pantalla negra.
    1) Filo claro: en los 2 px del borde, los píxeles que son mezcla de un interior
       oscuro o de color con el blanco del fondo en menos de un 75 % se quitan.
       Si el interior es blanco (camiseta, zapatilla) no se toca.
    2) Huecos de fondo entre rizos: en la zona del pelo, manchas blancas puras y
       pequeñas a menos de 14 px del contorno, que no llegan al borde inferior del
       retrato (eso sería ropa blanca)."""
    dentro = alfa >= 0.5
    if not dentro.any():
        return alfa
    mn, mx = rgb.min(axis=2), rgb.max(axis=2)
    # Distancia al contorno exterior (los huecos internos no cuentan como borde).
    dist = distance_transform_edt(binary_fill_holes(dentro))
    interior = dentro & (dist >= 4) & ~((mn > 150) & (mx - mn < 30))
    if interior.any():
        _, (iy, ix) = distance_transform_edt(~interior, return_indices=True)
        d = rgb[iy, ix] - FONDO
        n2 = (d * d).sum(axis=2)
        a_mezcla = np.clip(((rgb - FONDO) * d).sum(axis=2) / np.maximum(n2, 1), 0, 1)
        filo = dentro & zona & (dist <= 2) & (n2 > 70 ** 2) & (a_mezcla < 0.75)
        alfa = np.where(filo, 0, alfa)
    if huecos_blancos:
        dentro = alfa >= 0.5
        dist = distance_transform_edt(binary_fill_holes(dentro))
        ys = np.where(dentro.any(1))[0]
        y_bot = ys.max()
        # La prueba de tamaño y de «llega abajo» se hace con la mancha blanca
        # completa; luego solo se quita su parte en la zona del pelo, cerca del borde.
        blanco = dentro & (mn > 212) & (mx - mn < 22)
        n, lab, st, _ = cv2.connectedComponentsWithStats(blanco.astype(np.uint8), 8)
        cand = np.zeros_like(dentro)
        for k in range(1, n):
            x, y, w, h, area = st[k]
            if area < 1500 and y + h - 1 < y_bot - 3:
                cand |= lab == k
        alfa = np.where(cand & zona & (dist <= 14), 0, alfa)
    return alfa


def alfa_anterior(slug, parte_archivo, H, W):
    """Alfa de la silueta Astra anterior, colocada en coordenadas de la hoja."""
    t = Image.open(f'{ANTERIORES}/{slug}/{parte_archivo}__t.png')
    a = np.asarray(t)[..., 3].astype(np.float32) / 255.0
    vb = json.load(open(f'{ANTERIORES}/vb.json'))[f'{slug}/{parte_archivo}.svg']
    x, y = int(round(vb[0])), int(round(vb[1]))
    out = np.zeros((H, W), np.float32)
    h, w = a.shape
    out[y:y + h, x:x + w] = a[:min(h, H - y), :min(w, W - x)]
    return out


def calcular(slug, archivos_anteriores, R=12):
    global CASCO
    # Marcos lleva casco con visera transparente: sus zonas blancas junto al
    # contorno son reflejos del casco, no fondo atrapado entre mechones.
    CASCO = slug == 'Marcos-Bombero'
    rgb = np.asarray(Image.open(ref_png(slug)).convert('RGB')).astype(np.float32)
    H, W, _ = rgb.shape
    viejas = [alfa_anterior(slug, a, H, W) for a in archivos_anteriores]
    # Franjas: vistas y caras a partir de las siluetas anteriores.
    y_caras = int(min(np.where(v > 0.5)[0].min() for v in viejas[4:]))
    y_cuerpo_fin = int(max(np.where(v > 0.5)[0].max() for v in viejas[:4]))
    corte = (y_cuerpo_fin + y_caras) // 2 if y_caras > y_cuerpo_fin else y_caras - 2
    franjas = [(0, corte, viejas[:4]), (corte, H, viejas[4:])]
    partes = {}
    for (y0, y1, grupo), nombres in zip(franjas, (PARTES[:4], PARTES[4:])):
        tira = rgb[y0:y1]
        m = isnet(tira.astype(np.uint8))
        es_caras = nombres[0].startswith('05')
        mn, mx = tira.min(axis=2), tira.max(axis=2)
        if es_caras:
            # Lo muy oscuro (camiseta, pelo) nunca es fondo; el panel lo corta el borde.
            m = np.maximum(m, (mx < 90).astype(np.float32))
            claro = (mn > 205) & (mx - mn < 26)
            # Huecos cerrados se rellenan salvo si son blanco atrapado.
            huecos = binary_fill_holes(m >= 0.5) & (m < 0.5) & ~claro
            m = np.where(huecos, 1.0, m)
        else:
            # Huecos cerrados no blancos (p. ej. sombras entre brazo y cuerpo) también son personaje.
            claro = (mn > 236) & (mx - mn < 14)
            huecos = binary_fill_holes(m >= 0.5) & (m < 0.5) & ~claro
            m = np.where(huecos, 1.0, m)
        # Zona de pelo: tercio superior de cada figura / retrato completo.
        zona = np.zeros(m.shape, bool)
        for v in grupo:
            ys, xs = np.where(v[y0:y1] > 0.5)
            if not len(ys):
                continue
            alto = ys.max() - ys.min()
            zona[ys.min():ys.min() + int(alto * (0.62 if es_caras else 0.2)), max(0, xs.min() - 20):xs.max() + 20] = True
        zona_pelo = np.zeros(m.shape, bool)
        for v in grupo:
            ys, xs = np.where(v[y0:y1] > 0.5)
            if not len(ys):
                continue
            alto = ys.max() - ys.min()
            zona_pelo[ys.min():ys.min() + int(alto * (0.45 if es_caras else 0.2)), max(0, xs.min() - 20):xs.max() + 20] = True
        m_bruta = m
        cuerpo = m >= 0.5
        # Prior: siluetas anteriores rellenas y dilatadas.
        priors = []
        for v in grupo:
            b = binary_fill_holes(v[y0:y1] > 0.5)
            b = cv2.dilate(b.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * R + 1, 2 * R + 1))) > 0
            priors.append(b)
        # Semillas: núcleo de cada silueta anterior (erosionado) dentro del personaje.
        semillas = np.zeros(m.shape, np.int32)
        for i, v in enumerate(grupo):
            nucleo = cv2.erode((v[y0:y1] > 0.5).astype(np.uint8), np.ones((25, 25), np.uint8)) > 0
            semillas[nucleo & cuerpo] = i + 1
        region = watershed(sobel(tira.mean(axis=2) / 255.0), semillas, mask=cuerpo)
        otras = lambda i: (region > 0) & (region != i + 1)
        for i, n in enumerate(nombres):
            sel = (region == i + 1) & priors[i]
            alfa_p = np.where(sel, m_bruta, 0).astype(np.float32)
            # Lo que el modelo pierde y la silueta anterior sí tenía se recupera, sin
            # invadir a los vecinos. Lo oscuro/de color (p. ej. la manguera pegada al
            # borde de la hoja) se recupera si es una pieza gruesa. Lo blanco solo en
            # retratos y solo si es ropa: sube desde el borde inferior del panel y es
            # ancha (camiseta blanca de Laura o Paradigma); así no entran el fondo ni
            # la línea blanca del borde de panel.
            vieja = grupo[i][y0:y1] * (~otras(i))
            claro_p = (mn > 200) & (mx - mn < 26)
            extra = (vieja >= 0.5) & (alfa_p < 0.5)
            oscuro_x = cv2.morphologyEx((extra & ~claro_p).astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8)) > 0
            añadir = oscuro_x
            if es_caras:
                yb = np.where((vieja >= 0.5).any(1))[0].max()
                n_, lab_, st_, _ = cv2.connectedComponentsWithStats((extra & claro_p).astype(np.uint8), 8)
                dentro_n = alfa_p >= 0.5
                for k in range(1, n_):
                    x_, y_, w_, h_, ar_ = st_[k]
                    comp = lab_ == k
                    if y_ + h_ - 1 >= yb - 3 and w_ >= 20 and ar_ >= 300 and h_ <= 6 * w_:
                        añadir = añadir | comp
                        continue
                    # Hueco claro rodeado casi del todo por el personaje (visera
                    # transparente, brillo del casco): es del personaje, no fondo.
                    anillo = cv2.dilate(comp.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
                    anillo &= ~comp
                    if anillo.any() and dentro_n[anillo].mean() >= 0.75:
                        añadir = añadir | comp
            alfa_p = np.where(añadir, np.maximum(alfa_p, vieja), alfa_p)
            # Contorno del pelo afinado contra el fondo (sin halo claro).
            alfa_p = afinar_pelo(tira, alfa_p, zona)
            if es_caras:
                alfa_p = quitar_filos_claros(tira, alfa_p)
                alfa_p = quitar_restos_fondo(tira, alfa_p)
            alfa_p = limpiar_halo(tira, alfa_p, zona_pelo, huecos_blancos=not CASCO)
            if not es_caras and CASCO:
                # Botas negras (Marcos): la sombra de contacto gris clara del suelo
                # se quita en la franja de las botas si toca el contorno exterior.
                d_ = alfa_p >= 0.5
                ys_ = np.where(d_.any(1))[0]
                yb_ = ys_.max(); ya_ = yb_ - int(0.08 * (yb_ - ys_.min()))
                gris = d_ & (mn > 140) & (mx - mn < 35)
                gris[:ya_] = False
                borde_ = distance_transform_edt(binary_fill_holes(d_)) <= 2
                n_, lab_ = cv2.connectedComponents(gris.astype(np.uint8), connectivity=8)
                tocan = np.unique(lab_[gris & borde_])
                alfa_p = np.where(np.isin(lab_, tocan[tocan > 0]), 0, alfa_p)
            if not es_caras and not CASCO:
                # Zapatillas blancas: el modelo muerde a veces el blanco del calzado
                # junto al fondo. En la franja de los pies se cierran las mellas
                # (cierre 15 px) con los píxeles que no son fondo puro.
                d_ = alfa_p >= 0.5
                if d_.any():
                    ys_ = np.where(d_.any(1))[0]
                    yb_ = ys_.max(); ya_ = yb_ - int(0.14 * (yb_ - ys_.min()))
                    banda = np.zeros_like(d_); banda[ya_:yb_ + 1] = True
                    cerr = cv2.morphologyEx(d_.astype(np.uint8), cv2.MORPH_CLOSE,
                                            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))) > 0
                    nuevo = cerr & ~d_ & banda & (mn < 250) & ~otras(i)
                    alfa_p = np.where(nuevo, 1.0, alfa_p)
            if es_caras:
                # Huecos internos pequeños fuera del pelo (costura entre piel y ropa
                # blanca): son personaje. Los huecos de fondo reales son mucho mayores.
                d_ = alfa_p >= 0.5
                hue = binary_fill_holes(d_) & ~d_ & ~zona_pelo
                n_, lab_, st_, _ = cv2.connectedComponentsWithStats(hue.astype(np.uint8), 8)
                rell = np.isin(lab_, [k for k in range(1, n_) if st_[k, 4] < 600])
                alfa_p = np.where(rell, 1.0, alfa_p)
            sel = alfa_p >= 0.5
            # Se queda solo con la pieza principal y lo que esté pegado a ella.
            num, lab, st, _ = cv2.connectedComponentsWithStats(sel.astype(np.uint8), 8)
            if num > 1:
                grande = 1 + int(np.argmax(st[1:, 4]))
                keep = np.zeros_like(sel)
                for k in range(1, num):
                    if k == grande or st[k, 4] >= 400:
                        keep |= lab == k
                sel = keep
            a = np.zeros((H, W), np.float32)
            a[y0:y1] = np.where(sel, alfa_p, 0)
            partes[n] = a
    return rgb, viejas, partes
