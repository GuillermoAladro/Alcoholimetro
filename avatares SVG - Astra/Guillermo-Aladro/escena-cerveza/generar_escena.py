#!/usr/bin/env python3
"""Animate the existing profile SVG using a two-bone arm and SVG SMIL.
No source raster is embedded. All character detail comes from 03-perfil.svg.
"""
from pathlib import Path
import xml.etree.ElementTree as E
import math, copy, json, hashlib, re
import cv2
import numpy as np
from PIL import Image
from scipy.ndimage import binary_fill_holes, binary_propagation
HERE=Path(__file__).resolve().parent
SOURCE=HERE.parent/'03-perfil.svg'
NS='http://www.w3.org/2000/svg'
E.register_namespace('',NS)
def el(tag,attrs=None,parent=None,**kw):
    n=E.Element('{'+NS+'}'+tag,{**(attrs or {}),**{k.replace('_','-'):str(v) for k,v in kw.items()}})
    if parent is not None:parent.append(n)
    return n
def frag(parent,s):
    w=E.fromstring('<g xmlns="'+NS+'">'+s+'</g>')
    for n in w:parent.append(n)
def smooth(x):return x*x*(3-2*x)
def mix(a,b,t):return a+(b-a)*t
def lerp(a,b,t):return tuple(mix(x,y,t) for x,y in zip(a,b))
DURATION=12
S=(718,320);J=(736,438);W=(795,519)
L1=math.dist(S,J);L2=math.dist(J,W)
BASE1=math.atan2(J[1]-S[1],J[0]-S[0]);BASE2=math.atan2(W[1]-J[1],W[0]-J[0])
def cup_wrist(tilt):
    a=math.radians(tilt)
    return (814-(-5*math.cos(a)+70*math.sin(a)),211-(-5*math.sin(a)-70*math.cos(a)))
def pose(t):
    rest=(880,424);near=(853,320);contact=cup_wrist(0)
    if t<1.1:w=rest;tilt=0
    elif t<2.5:w=lerp(rest,near,smooth((t-1.1)/1.4));tilt=0
    elif t<3.3:w=lerp(near,contact,smooth((t-2.5)/.8));tilt=0
    elif t<4.5:tilt=-32*smooth((t-3.3)/1.2);w=cup_wrist(tilt)
    elif t<5.8:tilt=-32-1.2*math.sin((t-4.5)/1.3*math.pi)**2;w=cup_wrist(tilt)
    elif t<6.8:tilt=-32*(1-smooth((t-5.8)));w=cup_wrist(tilt)
    elif t<7.7:w=lerp(contact,near,smooth((t-6.8)/.9));tilt=0
    elif t<9.2:w=lerp(near,rest,smooth((t-7.7)/1.5));tilt=0
    else:w=rest;tilt=0
    dx=w[0]-S[0];dy=w[1]-S[1];d=math.hypot(dx,dy)
    a=math.atan2(dy,dx)+math.acos(max(-1,min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))))
    joint=(S[0]+L1*math.cos(a),S[1]+L1*math.sin(a))
    b=math.atan2(w[1]-joint[1],w[0]-joint[0])
    A=math.degrees(a-BASE1);B=math.degrees(b-BASE2)-A;C=tilt-A-B
    return A,B,C,tilt,w
poses=[pose(i*DURATION/360) for i in range(361)]
root=el('svg',xmlns=NS,width=1280,height=900,viewBox='0 0 1280 900',role='img',aria_labelledby='scene-title scene-desc')
# ElementTree supplies the namespace itself.
root.attrib.pop('xmlns')
el('title',id='scene-title',parent=root).text='Guillermo Aladro · Una cerveza en la barra'
el('desc',id='scene-desc',parent=root).text='Escena vectorial animada de doce segundos. Guillermo levanta un vaso de cerveza, lo acerca a los labios, bebe y lo devuelve a la barra. Rostro, pelo, camiseta y textura del brazo conservados del SVG original. Bucle sin sonido.'
style=el('style',parent=root);style.text='@media (prefers-reduced-motion: reduce){.ambient{display:none}}'
defs=el('defs',parent=root)
source=E.parse(SOURCE).getroot()
# Tight vector silhouette removes the original white reference-sheet fringe.
ref=np.array(Image.open(HERE.parents[2]/'animaciones'/'Avatar Guillermo Aladro.png').convert('RGB'))
roi=np.zeros(ref.shape[:2],np.uint8);roi[:1008,663:837]=1
candidate=(ref.min(2)>175)&((ref.max(2).astype(int)-ref.min(2))<35)
seed=np.zeros(candidate.shape,bool);seed[:,663]=True;seed[:,836]=True;seed[0,:]=True
bg=binary_propagation(seed&candidate,mask=candidate)
mask=(~bg&roi.astype(bool)).astype('uint8')*255
mask=cv2.morphologyEx(mask,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
mask=(binary_fill_holes(mask)>0).astype('uint8')*255
mask=cv2.resize(mask,None,fx=2,fy=2,interpolation=cv2.INTER_CUBIC)
mask=(cv2.GaussianBlur(mask,(5,5),.8)>127).astype('uint8')*255
mask=cv2.erode(mask,np.ones((5,5),np.uint8))
def maskpath(mask,scale=1):
    contours,_=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
    out=[]
    for c in contours:
        if cv2.contourArea(c)<25:continue
        pts=cv2.approxPolyDP(c,.7,True)[:,0,:]/scale
        out.append('M'+'L'.join(f'{x:.2f},{y:.2f}' for x,y in pts)+'Z')
    return ''.join(out)
for n in source.find('{'+NS+'}defs'):
    n=copy.deepcopy(n)
    if n.get('id')=='recorte-03-perfil':n[0].set('d',maskpath(mask))
    defs.append(n)
skin=((ref[:,:,0]>ref[:,:,1]*1.12)&(ref[:,:,1]>ref[:,:,2]*1.13)&(ref[:,:,0]>140)).astype('uint8')*255
skin[:365]=0;skin[535:]=0;skin[:,:680]=0;skin[:,818:]=0
skin=cv2.morphologyEx(skin,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
skin=(binary_fill_holes(skin)>0).astype('uint8')*255
skinclip=el('clipPath',id='skin-only',parent=defs);el('path',d=maskpath(skin),parent=skinclip)
art=copy.deepcopy(list(source)[-1])
# Bound each moving fragment to its own geometry; avoid rendering the complete
# full-body source three times per frame. Kept paths are copied verbatim.
fragment_counts={}
for name,box in [('cuerpo',(660,75,837,550)),('brazo',(679,280,764,450)),('antebrazo',(700,410,815,540))]:
    part=copy.deepcopy(art);part.set('id','perfil-'+name)
    inner=part[0][-1]
    for path in list(inner):
        xy=np.array([float(x) for x in re.findall(r'[-+]?\d*\.?\d+',path.get('d'))]).reshape(-1,2)
        tr=[float(x) for x in re.findall(r'[-+]?\d*\.?\d+',path.get('transform','translate(0,0)'))]
        lo=(xy.min(0)+tr+[1322,0])*.5;hi=(xy.max(0)+tr+[1322,0])*.5
        if lo[0]>box[2] or hi[0]<box[0] or lo[1]>box[3] or hi[1]<box[1]:inner.remove(path)
    for node in part.iter():
        if node is not part and node.get('id'):node.attrib.pop('id')
    fragment_counts[name]=len(inner)
    defs.append(part)
# Remove only unused gradient definitions, retaining all visible source detail.
references=set(re.findall(r'url\(#([^)]*)\)',E.tostring(defs,encoding='unicode')))
for node in list(defs):
    if node.tag.endswith('Gradient') and node.get('id') not in references:defs.remove(node)
frag(defs,'''
<linearGradient id="room" x2="0.7" y2="1"><stop stop-color="#17191b"/><stop offset=".55" stop-color="#302725"/><stop offset="1" stop-color="#171617"/></linearGradient>
<radialGradient id="amber-glow"><stop stop-color="#e8b66a" stop-opacity=".22"/><stop offset="1" stop-color="#e8b66a" stop-opacity="0"/></radialGradient>
<linearGradient id="wood" x2="0" y2="1"><stop stop-color="#b37a4a"/><stop offset=".2" stop-color="#795035"/><stop offset=".23" stop-color="#38251e"/><stop offset="1" stop-color="#211b1a"/></linearGradient>
<linearGradient id="counter" x2="0" y2="1"><stop stop-color="#a77954"/><stop offset=".25" stop-color="#78533b"/><stop offset="1" stop-color="#593c2d"/></linearGradient>
<linearGradient id="shirt-repair" x1="0" x2="1"><stop stop-color="#17171a"/><stop offset=".45" stop-color="#202025"/><stop offset="1" stop-color="#29282d"/></linearGradient>
<linearGradient id="skin" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="#b57149"/><stop offset=".3" stop-color="#eaa46d"/><stop offset=".6" stop-color="#f3b77e"/><stop offset="1" stop-color="#ce8b5b"/></linearGradient>
<linearGradient id="finger" x2=".1" y2="1"><stop stop-color="#f7bf85"/><stop offset=".55" stop-color="#e6a16b"/><stop offset="1" stop-color="#b7764e"/></linearGradient>
<linearGradient id="beer" x2="1" y2=".1"><stop stop-color="#7f3d10"/><stop offset=".25" stop-color="#d78819"/><stop offset=".55" stop-color="#f8bd3f"/><stop offset=".85" stop-color="#d9911f"/><stop offset="1" stop-color="#94510e"/></linearGradient>
<linearGradient id="glass" x2="1" y2="0"><stop stop-color="#e9f4ef" stop-opacity=".48"/><stop offset=".16" stop-color="#fff" stop-opacity=".08"/><stop offset=".68" stop-color="#fef2d2" stop-opacity=".04"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient>
<linearGradient id="foam" x2="0" y2="1"><stop stop-color="#fff9df"/><stop offset="1" stop-color="#decda6"/></linearGradient>
<radialGradient id="vignette"><stop offset=".48" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".46"/></radialGradient>
<radialGradient id="table-shadow"><stop stop-color="#150f0c" stop-opacity=".5"/><stop offset="1" stop-color="#150f0c" stop-opacity="0"/></radialGradient>
<clipPath id="torso-cut"><path clip-rule="evenodd" d="M640 75H845V1010H640Z M688 290 Q718 274 748 300 L763 340 764 395 787 467 819 529 787 546 746 518 703 470 682 412 677 360Z"/></clipPath>
<clipPath id="upper-cut"><path d="M686 291 Q714 279 740 297 Q763 320 759 365 L754 406 Q754 428 742 447 Q717 451 704 435 L688 394 Q675 350 686 291Z"/></clipPath>
<clipPath id="forearm-cut"><path d="M715 451Q704 440 714 423Q729 409 745 420Q759 435 779 467L806 510Q811 522 799 529Q788 537 777 525L743 489Q724 466 715 451Z"/></clipPath>
<clipPath id="glass-inside"><path d="M-3-68H43L36 7Q20 14 4 7Z"/></clipPath>
''')
# Scene: restrained, warm bar interior.
frag(root,'''
<rect width="1280" height="900" fill="url(#room)"/>
<ellipse cx="900" cy="320" rx="540" ry="510" fill="url(#amber-glow)"/>
<path d="M72 0V650M298 0V650M1052 0V650M1212 0V650" stroke="#9f7855" stroke-opacity=".09" stroke-width="2"/>
<rect x="760" y="211" width="430" height="345" rx="4" fill="#121516" fill-opacity=".6"/>
<path d="M765 340H1190M765 505H1190" stroke="#8b6142" stroke-width="13"/>
<path d="M765 332H1190M765 497H1190" stroke="#dbb372" stroke-opacity=".43" stroke-width="2"/>
''')
# Bottle silhouettes use subdued geometry so the avatar stays dominant.
for x,h,color in [(791,82,'#486052'),(843,105,'#71523d'),(902,90,'#637058'),(968,112,'#675743'),(1110,92,'#4b5b4c'),(1160,80,'#766147')]:
    frag(root,f'<path d="M{x} 333v-{h-26}q0-9 8-13v-21h12v21q8 4 8 13v{h-26}Z" fill="{color}" opacity=".48"/><rect x="{x+4}" y="{333-h+47}" width="20" height="25" rx="2" fill="#d3bc8b" opacity=".24"/>')
for x in [805,865,920,1100,1155]:
    frag(root,f'<path d="M{x} 440h30l-5 55h-20Z" fill="#d5cbb3" opacity=".13"/><path d="M{x+3} 441v46" stroke="#e8d6b6" opacity=".23" stroke-width="2"/>')
frag(root,'''
<path d="M1018 0V126" stroke="#171719" stroke-width="6"/>
<ellipse cx="1018" cy="192" rx="130" ry="100" fill="url(#amber-glow)"/>
<path d="M965 158Q974 113 1018 113Q1062 113 1071 158Z" fill="#252a29" stroke="#77715c" stroke-width="2"/>
<ellipse cx="1018" cy="159" rx="53" ry="9" fill="#e6bd73"/><ellipse cx="1018" cy="159" rx="39" ry="5" fill="#ffe9ac"/>
<text x="64" y="73" fill="#d8c4a1" font-size="13" font-family="Arial,sans-serif" letter-spacing="5">GUILLERMO ALADRO</text>
<path d="M64 95H116" stroke="#bd8b4e" stroke-width="2"/>
<text x="64" y="122" fill="#a29280" font-size="11" font-family="Arial,sans-serif" letter-spacing="2.5">UNA CERVEZA EN LA BARRA</text>
<ellipse cx="683" cy="658" rx="197" ry="30" fill="url(#table-shadow)"/>
''')
character=el('g',id='personaje',transform='translate(-740 -70) scale(1.7)',parent=root)
# Reconstruct only the shirt area exposed when the originally pocketed arm moves.
frag(character,'''
<path d="M685 294Q716 268 750 293L776 383 795 452 817 523 789 541 690 530Q678 470 679 409Z" fill="url(#shirt-repair)"/>
<path d="M697 325Q686 395 700 464M701 485Q749 491 790 514M705 510Q750 512 788 528" fill="none" stroke="#090b10" stroke-opacity=".32" stroke-width="5"/>
<path d="M706 328Q693 392 710 450M710 482Q745 493 770 492" fill="none" stroke="#414046" stroke-opacity=".25" stroke-width="2"/>
<g clip-path="url(#torso-cut)"><use href="#perfil-cuerpo"/></g>
''')
def animated_rotation(parent,id,idx,pivot=(0,0)):
    values=['%.4f %s %s'%(p[idx],*pivot) for p in poses]
    g=el('g',id=id,transform='rotate('+values[0]+')',parent=parent)
    el('animateTransform',attributeName='transform',type='rotate',values=';'.join(values),dur='12s',repeatCount='indefinite',calcMode='linear',parent=g)
    return g
upper=animated_rotation(character,'hombro',0,S)
frag(upper,'<g clip-path="url(#upper-cut)"><use href="#perfil-brazo"/></g>')
# A small joint patch is behind the original detailed forearm to prevent a cut seam.
lower=animated_rotation(upper,'codo',1,J)
frag(lower,'<g clip-path="url(#forearm-cut)"><ellipse cx="733" cy="437" rx="20" ry="23" fill="url(#skin)"/><g clip-path="url(#skin-only)"><use href="#perfil-antebrazo"/></g></g>')
handpos=el('g',transform='translate(795 519)',parent=lower)
grip=animated_rotation(handpos,'muneca-y-vaso',2)
frag(grip,'''
<path d="M-12-2Q-15-14-8-24L7-39Q13-43 19-38L28-21 27 1Q15 12 2 13Z" fill="url(#skin)" stroke="#bb7d54" stroke-width=".45"/>
<path d="M-8-11Q-1-18 2-29" fill="none" stroke="#a66c48" stroke-width=".8" opacity=".5"/>
<path d="M-5-70Q20-74 45-70L38 10Q21 17 2 10Z" fill="url(#glass)" stroke="#eee4c7" stroke-opacity=".7" stroke-width="1"/>
<g clip-path="url(#glass-inside)"><g id="nivel-horizontal">
<path id="liquido" d="M-120-59H160V150H-120Z" fill="url(#beer)"/>
<path id="espuma" d="M-120-64H-8Q4-67 13-64Q25-68 34-64Q42-66 48-64H160V-54H48Q28-50 12-54Q1-51-8-54H-120Z" fill="url(#foam)"/>
<g fill="#ffed9d" fill-opacity=".6" class="ambient">
<circle cx="11" cy="-9" r=".7"><animate attributeName="cy" values="0;-49" dur="2.3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.65;0" dur="2.3s" repeatCount="indefinite"/></circle>
<circle cx="29" cy="-31" r=".65"><animate attributeName="cy" values="5;-48" dur="3.1s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.7;0" dur="3.1s" repeatCount="indefinite"/></circle>
<circle cx="19" cy="-20" r=".85"><animate attributeName="cy" values="7;-51" dur="2.7s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.7;0" dur="2.7s" repeatCount="indefinite"/></circle>
</g></g></g>
<ellipse cx="20" cy="-70" rx="25" ry="3.2" fill="#fffae1" fill-opacity=".13" stroke="#f8f1d8" stroke-width=".9"/>
<path d="M-1-64L5 5M39-62L34 4" stroke="#fff9e5" stroke-opacity=".58" stroke-width="1.5"/>
<path d="M4 9Q20 15 37 9" stroke="#f6efd6" stroke-width="1.8" fill="none" opacity=".8"/>
<g fill="url(#finger)" stroke="#bb7c52" stroke-width=".5">
<path d="M-8-27Q0-34 11-32L20-29Q23-26 20-23Q15-21 8-23L-5-21Z"/>
<path d="M-7-19Q5-24 15-21L23-18Q26-14 22-12L9-13-4-12Z"/>
<path d="M-5-10Q5-16 16-12L21-9Q23-5 19-3L6-5-2-3Z"/>
<path d="M-1-2Q8-7 16-3L19 0Q20 3 16 5L5 4Z"/>
<path d="M-11-20Q-7-34-1-40Q3-45 7-41Q10-38 6-31L2-20Q-2-12-8-11Z"/>
</g>
<path d="M2-39Q5-42 7-39L5-33Q3-31 1-33Z" fill="#f4c7a2" stroke="#d39a76" stroke-width=".4"/>
<g fill="none" stroke="#a76947" stroke-opacity=".4" stroke-width=".45"><path d="M9-29l-1 4M13-19l-1 4M12-10l-1 4M10 0l-1 3"/></g>
''')
# Counter-rotate the liquid so its surface stays horizontal under gravity.
liquid=next(n for n in grip.iter() if n.get('id')=='nivel-horizontal')
el('animateTransform',attributeName='transform',type='rotate',values=';'.join(f'{-p[3]:.4f} 20 -55' for p in poses),dur='12s',repeatCount='indefinite',parent=liquid)
# Table occludes only lower torso, never the drinking hand.
frag(root,'''
<path d="M0 670H1280V723H0Z" fill="url(#counter)"/>
<path d="M0 685Q360 679 730 687T1280 684M0 702Q470 694 1280 707M140 715Q550 705 1110 718" stroke="#d4a77b" stroke-width="1" opacity=".17" fill="none"/>
<path d="M0 722H1280V900H0Z" fill="url(#wood)"/>
<path d="M0 722H1280" stroke="#d3a26e" stroke-width="3"/>
<path d="M0 744H1280M0 876H1280" stroke="#181718" stroke-width="4"/>
<path d="M90 756V870M400 756V870M710 756V870M1020 756V870" stroke="#805438" stroke-opacity=".2" stroke-width="2"/>
<ellipse cx="790" cy="675" rx="46" ry="8" fill="#261910" opacity=".22"/>
<ellipse cx="790" cy="674" rx="31" ry="5" fill="#c2a477" opacity=".58"/>

<rect width="1280" height="900" fill="url(#vignette)" pointer-events="none"/>
<text x="64" y="843" fill="#bca68b" opacity=".65" font-size="11" font-family="Arial,sans-serif" letter-spacing="3">ASTRA / ESTUDIO DE MOVIMIENTO 01</text>
''')
# Counter is drawn after the arm; its top is exactly below the resting glass.
path=HERE/'Guillermo-Aladro-cerveza.svg'
payload=E.tostring(root,encoding='utf-8',xml_declaration=True)
path.write_bytes(payload)
manifest={'source':'../03-perfil.svg','source_sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'duration_seconds':12,'dimensions':[1280,900],'vector_only':True,'original_detail_paths':sum(1 for n in art.iter() if n.tag.endswith('}path')),'fragment_paths':fragment_counts,'animation':'SMIL; two-bone inverse kinematics; 361 sampled keys; seamless pose loop','new_artwork':['bar interior','shirt occlusion repair','hand grip','glass, foam and beer'],'files':['Guillermo-Aladro-cerveza.svg','Guillermo-Aladro-cerveza.mp4','Guillermo-Aladro-cerveza-preview.png']}
(HERE/'control-calidad.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'svg_bytes':len(payload),'paths':manifest['original_detail_paths'],'first_pose':poses[0],'sip_pose':pose(5)},ensure_ascii=False))
