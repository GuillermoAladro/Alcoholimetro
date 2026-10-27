import sys, json, math, os
sys.path.insert(0, '/tmp/claude-0/-home-claude/659a7a58-c69d-5ef4-bd94-d0aa972c769f/scratchpad/avatar3d')
from inflar import *
I = '/tmp/claude-0/-home-claude/659a7a58-c69d-5ef4-bd94-d0aa972c769f/scratchpad/ilus/'
OUT = '/tmp/claude-0/-home-claude/659a7a58-c69d-5ef4-bd94-d0aa972c769f/scratchpad/avatar3d/'
O = (560.0, 695.0)                      # origen: centro de la cintura
XC = 560.0                              # eje de simetría para el brazo derecho
S_L = (378.0, 398.0); E_L = (468.0, 534.0); W_L = (660.0, 523.0); CUELLO = (578.0, 332.0)
ANG_F = math.atan2(520 - 532, 668 - 467)
LM = json.load(open(I + 'landmarks.json')); P68 = np.array(LM['l68'])[:, :2]

def pieza(nombre):
    im = cv2.imread(I + 'p_%s.png' % nombre, cv2.IMREAD_UNCHANGED); o = json.load(open(I + 'p_%s.json' % nombre))
    return im, (o['x'], o['y'])

def textura(rgba):
    """El color se extiende más allá del borde (si no, al muestrear en el contorno sale el halo del fondo)."""
    col = rgba[..., :3].copy(); a = rgba[..., 3]
    fuera = (a < 120).astype(np.uint8)
    # los píxeles del borde llevan mezclado el fondo de la ilustración: se rehacen desde dentro
    dentro = cv2.erode((a >= 250).astype(np.uint8), np.ones((5, 5), np.uint8))
    banda = cv2.dilate(dentro, np.ones((31, 31), np.uint8)) & (1 - dentro)
    col = cv2.inpaint(col, banda * 255, 6, cv2.INPAINT_TELEA)
    # fuera de la banda, un color medio (nunca se ve)
    med = col[a >= 120].mean(0) if (a >= 120).any() else np.array([128, 128, 128])
    col[(fuera > 0) & (banda == 0)] = med
    return Image.fromarray(cv2.cvtColor(col, cv2.COLOR_BGR2RGB))

def material(img, oscuro=1.0, doble=False):
    f = [oscuro, oscuro, oscuro, 1.0]
    return trimesh.visual.material.PBRMaterial(baseColorTexture=img, baseColorFactor=f, metallicFactor=0.0, roughnessFactor=0.85, alphaMode='OPAQUE', doubleSided=doble)

def relieve_cabeza(rgba, o):
    """Relieve extra de la cara: nariz, pómulos, cejas (los puntos de la cara), y el pelo más grueso."""
    h, w = rgba.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    P = P68 - np.array(o)
    z = np.zeros((h, w), np.float32)
    def bulto(c, sx, sy, amp, ang=0.0):
        nonlocal z
        ca, sa = math.cos(ang), math.sin(ang)
        u = (xx - c[0]) * ca + (yy - c[1]) * sa; v = -(xx - c[0]) * sa + (yy - c[1]) * ca
        z += amp * np.exp(-0.5 * ((u / sx) ** 2 + (v / sy) ** 2))
    oi = P[36:42].mean(0); od = P[42:48].mean(0)
    roll = math.atan2(od[1] - oi[1], od[0] - oi[0])
    nariz_eje = (P[27] + P[30]) / 2; L = np.linalg.norm(P[30] - P[27])
    bulto(nariz_eje, 9, L * 0.7, 16, roll + math.pi / 2)        # puente
    bulto(P[30], 13, 11, 10, roll)                               # punta
    bulto(P[31], 9, 7, 4, roll); bulto(P[35], 9, 7, 4, roll)     # aletas
    bulto(oi, 26, 14, -7, roll); bulto(od, 26, 14, -7, roll)     # cuencas
    bulto(P[17:22].mean(0), 30, 9, 5, roll); bulto(P[22:27].mean(0), 30, 9, 5, roll)  # arcos de las cejas
    bulto(P[8], 24, 18, 6, roll)                                 # barbilla
    bulto(P[48:68].mean(0), 30, 14, 5, roll)                     # labios
    return z

scene = trimesh.Scene()
scene.graph.update(frame_to='torso', frame_from=scene.graph.base_frame, matrix=np.eye(4))

PIVOTES = {'torso': O}
def anadir(nombre, nodo_padre, pares, tex, pivote_px=None, oscuro_atras=0.6, doble=False):
    pivote_px = PIVOTES[nodo_padre] if pivote_px is None else pivote_px
    """Añade las mallas (delante/detrás) al nodo `nodo_padre`, con los vértices relativos al pivote."""
    piv3 = np.array([pivote_px[0] - O[0], O[1] - pivote_px[1], 0.0])
    for i, (mf, mb) in enumerate(pares):
        for j, (m, osc) in enumerate(((mf, 1.0), (mb, oscuro_atras))):
            m3 = a_3d(m, O); m3.vertices -= piv3
            m3.visual.material = material(tex, osc, doble)
            scene.add_geometry(m3, node_name=f'{nombre}_{i}_{j}', geom_name=f'{nombre}_{i}_{j}', parent_node_name=nodo_padre)

def nodo(nombre, padre, pivote_px):
    pp = PIVOTES[padre]
    T = np.eye(4); T[:3, 3] = [pivote_px[0] - pp[0], pp[1] - pivote_px[1], 0.0]
    scene.graph.update(frame_to=nombre, frame_from=padre, matrix=T)
    PIVOTES[nombre] = pivote_px

# ---- torso (más plano hacia el cuello; estrecho de hombros: la manga va delante)
im, o = pieza('torso3d')
h, w = im.shape[:2]; yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
Xg = xx + o[0]; Yg = yy + o[1]
# grosor del torso: según la distancia al borde de un torso sin hombreras (x 405..715)
estrecho = im[..., 3].copy(); estrecho[(Xg < 405) | (Xg > 715)] = 0
d = cv2.distanceTransform((estrecho > 120).astype(np.uint8), cv2.DIST_L2, 5)
R = 150.0; t = np.clip(d / R, 0, 1)
z = np.sqrt(1 - (1 - t) ** 2) * R * 1.1
z *= (0.45 + 0.55 * rampa(Yg, 330, 420))      # el cuello, más fino
z = cv2.GaussianBlur(z.astype(np.float32), (0, 0), 6)
pares = inflar(im, k=0.0, z_extra=z, area_max=60, atras=0.0, origen=o)
# detrás: la misma forma (inflar con k=0 deja z=0; ponemos la espalda con el mismo mapa)
for mf, mb in pares:
    zs = cv2.remap(z.astype(np.float32), mb.vertices[:, 0].astype(np.float32)[None] - o[0], mb.vertices[:, 1].astype(np.float32)[None] - o[1], cv2.INTER_LINEAR)[0]
    mb.vertices[:, 2] = -zs * 0.8
anadir('torso', 'torso', pares, textura(im))
# ---- piernas
im, o = pieza('piernas')
pares = inflar(im, k=1.0, area_max=70, origen=o)
anadir('piernas', 'torso', pares, textura(im))
# ---- cuello de la camisa (delante del cuello)
im, o = pieza('cuello')
pares = inflar(im, k=0.5, area_max=30, origen=o, z0=58.0, atras=0.3)
anadir('cuello_camisa', 'torso', pares, textura(im), doble=True)
# ---- cabeza (pivote en la base del cuello)
nodo('cuello', 'torso', CUELLO)
im, o = pieza('cabeza')
zx = relieve_cabeza(im, o)
pares = inflar(im, k=1.0, z_extra=zx, area_max=22, origen=o, atras=1.05)
# por detrás, pelo: la cara se sustituye por el color del pelo (desde atrás se ve la nuca, no una cara oscura)
pelo = im[..., :3][(im[..., 3] > 200) & (np.mgrid[0:im.shape[0], 0:im.shape[1]][0] < 110)]
col_pelo = np.median(pelo, axis=0).astype(np.uint8) if len(pelo) else np.array([40, 30, 25], np.uint8)
im_atras = im.copy(); im_atras[..., :3] = (im[..., :3].astype(np.float32) * 0.12 + col_pelo.astype(np.float32) * 0.88).astype(np.uint8)
tex_c = textura(im); tex_ca = textura(im_atras)
piv3 = np.array([CUELLO[0] - O[0], O[1] - CUELLO[1], 0.0])
for i, (mf, mb) in enumerate(pares):
    for j, (m, tx, osc) in enumerate(((mf, tex_c, 1.0), (mb, tex_ca, 0.75))):
        m3 = a_3d(m, O); m3.vertices -= piv3
        m3.visual.material = material(tx, osc)
        scene.add_geometry(m3, node_name=f'cabeza_{i}_{j}', geom_name=f'cabeza_{i}_{j}', parent_node_name='cuello')
json.dump({'cabezas': {}}, open(OUT + 'info.json', 'w'))

# ---- brazos
def brazo(lado):
    s = 1 if lado == 'L' else -1
    def mx(p): return p if lado == 'L' else (2 * XC - p[0], p[1])
    S = mx(S_L); E = mx(E_L); W = mx(W_L)
    nodo('hombro_' + lado, 'torso', S); nodo('codo_' + lado, 'hombro_' + lado, E); nodo('muneca_' + lado, 'codo_' + lado, W)
    # manga
    im, o = pieza('manga'); imm = im if lado == 'L' else im[:, ::-1].copy()
    om = o if lado == 'L' else (int(2 * XC - o[0] - im.shape[1] + 1), o[1])
    pares = inflar(imm, k=1.0, area_max=40, origen=om, z0=14.0, atras=0.8)
    anadir('manga_' + lado, 'hombro_' + lado, pares, textura(imm), pivote_px=S)
    # antebrazo
    im, o = pieza('antebrazo'); imm = im if lado == 'L' else im[:, ::-1].copy()
    om = o if lado == 'L' else (int(2 * XC - o[0] - im.shape[1] + 1), o[1])
    pares = inflar(imm, k=1.0, area_max=30, origen=om, z0=8.0, atras=0.8)
    anadir('antebrazo_' + lado, 'codo_' + lado, pares, textura(imm), pivote_px=E)
    # manos: en el marco de la mano (origen en la muñeca, +y hacia los dedos), giradas al eje del antebrazo
    for n in ('abierta', 'puno', 'pulgar', 'movil'):
        hm = cv2.imread(I + 'mano_%s.png' % n, cv2.IMREAD_UNCHANGED); org = json.load(open(I + 'mano_%s.json' % n))['org']
        pares = inflar(hm, k=0.55, area_max=24, z0=6.0, atras=0.8)
        ang = ANG_F - math.pi / 2
        for i, (mf, mb) in enumerate(pares):
            for m in (mf, mb):
                q = m.vertices[:, :2] - np.array(org)
                c, sn = math.cos(ang), math.sin(ang)
                x = q[:, 0] * c - q[:, 1] * sn; y = q[:, 0] * sn + q[:, 1] * c
                if lado != 'L': x = -x
                m.vertices[:, 0] = x + W[0]; m.vertices[:, 1] = y + W[1]
                if lado != 'L': m.invert()
        anadir('mano_%s_%s' % (n, lado), 'muneca_' + lado, pares, textura(hm), pivote_px=W, doble=True)
brazo('L'); brazo('R')
scene.export(OUT + 'avatar.glb')
print('glb', os.path.getsize(OUT + 'avatar.glb') // 1024, 'KB', 'nodos', len(scene.graph.nodes), 'geometrias', len(scene.geometry))
