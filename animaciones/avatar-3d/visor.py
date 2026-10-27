"""Genera el visor 3D del avatar (una sola página): avatar.glb y las caras incrustados, three.js del CDN o inline."""
import base64, json, os, sys, math
A = '/tmp/claude-0/-home-claude/659a7a58-c69d-5ef4-bd94-d0aa972c769f/scratchpad/avatar3d/'
I = '/tmp/claude-0/-home-claude/659a7a58-c69d-5ef4-bd94-d0aa972c769f/scratchpad/ilus/'
THREE = '/tmp/claude-0/-home-claude/659a7a58-c69d-5ef4-bd94-d0aa972c769f/scratchpad/npmthree/package/'
LIBS = ['build/three.min.js', 'examples/js/controls/OrbitControls.js', 'examples/js/loaders/GLTFLoader.js']
S_L = (378.0, 398.0); E_L = (468.0, 534.0); W_L = (660.0, 523.0); O = (560.0, 695.0); CUELLO = (578.0, 332.0)
ANG_U = math.atan2(E_L[1] - S_L[1], E_L[0] - S_L[0]); ANG_F = math.atan2(520 - 532, 668 - 467)
L1 = math.hypot(E_L[0] - S_L[0], E_L[1] - S_L[1]); L2 = math.hypot(W_L[0] - E_L[0], W_L[1] - E_L[1])

def b64(p, mime):
    return 'data:%s;base64,%s' % (mime, base64.b64encode(open(p, 'rb').read()).decode())

def pagina(offline, con_glb_inline=True):
    caras = {n: b64(I + 'cab_%s.png' % n, 'image/png') for n in ['normal', 'parpadeo', 'sonrisa', 'guino', 'esfuerzo', 'grito', 'meh', 'soplo', 'dormido']}
    glb = b64(A + 'avatar.glb', 'model/gltf-binary') if con_glb_inline else 'avatar.glb'
    if offline:
        libs = ''.join('<script>/* three.js r147 · %s */\n%s\n</script>\n' % (l, open(THREE + l, encoding='utf-8').read()) for l in LIBS)
    else:
        libs = ''.join('<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/%s"></script>\n' % l for l in LIBS)
    datos = dict(ANG_U=ANG_U, ANG_F=ANG_F, L1=L1, L2=L2, KB=(L1 + L2) / 474)
    html = open(A + 'visor_plantilla.html', encoding='utf-8').read()
    html = html.replace('/*LIBS*/', libs).replace('"/*GLB*/"', json.dumps(glb)).replace('"/*CARAS*/"', json.dumps(caras)).replace('"/*DATOS*/"', json.dumps(datos))
    return html

if __name__ == '__main__':
    for nombre, off in (('avatar3d_cdn.html', False), ('avatar3d.html', True)):
        h = pagina(off)
        open(A + nombre, 'w', encoding='utf-8').write(h); print(nombre, len(h) // 1024, 'KB')
