#!/usr/bin/env python3
"""Rebuild the detailed vector master from the checked-in Guillermo reference.

Every visible mark is vector geometry. Per-region color fitting preserves small
facial details while replacing large flat-color areas with local SVG gradients.
No embedded images, external links, fonts, filters or JavaScript are used.
"""
from pathlib import Path
import copy
import json
import hashlib
import sys
import time
import xml.etree.ElementTree as ET

from PIL import Image
import cv2
import numpy as np
from scipy.ndimage import binary_propagation, binary_fill_holes
import vtracer
import cairosvg
from refine_colors import refine

BASE = Path(__file__).resolve().parents[1]
REPO = BASE.parent
SOURCE = REPO / 'animaciones/Avatar Guillermo Aladro.png'
WORK = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('/tmp/guillermo-svg-build')
WORK.mkdir(parents=True, exist_ok=True)
SVG = 'http://www.w3.org/2000/svg'
INK = 'http://www.inkscape.org/namespaces/inkscape'
ET.register_namespace('', SVG)
ET.register_namespace('inkscape', INK)

# Shared partition boundaries follow the white spaces and the original
# occlusion between the frontal shirt and the three-quarter left arm.
NAME = [(0,0),(262,0),(262,216),(235,224),(205,244),(181,266),
        (160,296),(145,332),(140,370),(0,370)]
B12 = [(440,0),(440,265),(424,285),(422,329),(433,372),(438,406),
       (441,457),(447,499),(430,529),(420,610),(420,1008)]
B34 = [(837,0),(837,900),(845,930),(845,1008)]
REGIONS = [
    ('nombre', 'Guillermo Aladro · nombre', NAME, (0,90,262,285)),
    ('01-frontal', 'Vista frontal', [(262,0)]+B12+[(0,1008),(0,370)]+list(reversed(NAME[2:-1])), (85,70,360,940)),
    ('02-tres-cuartos', 'Vista tres cuartos', B12+[(663,1008),(663,0)], (420,70,245,940)),
    ('03-perfil', 'Vista de perfil', [(663,0)]+B34+[(663,1008)], (658,70,190,940)),
    ('04-espalda', 'Vista posterior', B34+[(1122,1008),(1122,0)], (832,70,290,940)),
]
BREAKS = [0,172,357,531,726,927,1122]
EXPRESSIONS = [
    ('05-serio','Expresión seria'),('06-sonrisa','Sonrisa'),
    ('07-sorpresa','Sorpresa'),('08-cansancio','Cansancio, mano en la mejilla'),
    ('09-ojos-cerrados','Ojos cerrados'),('10-ceno-fruncido','Ceño fruncido'),
]
for i,(key,label) in enumerate(EXPRESSIONS):
    x0,x1=BREAKS[i:i+2]
    REGIONS.append((key,label,[(x0,1008),(x1,1008),(x1,1328),(x0,1328)],(x0,1008,x1-x0,320)))

def root_svg(title, viewbox):
    x,y,w,h=viewbox
    root=ET.Element(f'{{{SVG}}}svg', dict(width=str(w),height=str(h),viewBox=f'{x} {y} {w} {h}',version='1.1',role='img',**{'aria-labelledby':'title desc','shape-rendering':'geometricPrecision'}))
    ET.SubElement(root,f'{{{SVG}}}title',id='title').text=title
    ET.SubElement(root,f'{{{SVG}}}desc',id='desc').text='Vectorización detallada del avatar oficial de Guillermo Aladro. Trazados y gradientes editables; sin imágenes incrustadas. Misma identidad, vestuario y poses que la referencia del repositorio.'
    return root

def write_svg(root,path):
    path.parent.mkdir(parents=True,exist_ok=True)
    payload=ET.tostring(root,encoding='utf-8',xml_declaration=True)
    temporary=path.with_suffix('.svg.tmp')
    assert temporary.write_bytes(payload)==len(payload)
    temporary.replace(path)
    ET.parse(path)

def foreground_mask(original):
    a=np.array(original)
    lo=a.min(2).astype(int);hi=a.max(2).astype(int)
    candidate=(lo>210)&((hi-lo)<18)
    seed=np.zeros(candidate.shape,bool);seed[[0,-1],:]=True;seed[:,[0,-1]]=True
    bg=binary_propagation(seed&candidate,mask=candidate)
    fg=cv2.morphologyEx((~bg).astype('uint8'),cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5)))
    # Keep enclosed white details, particularly laces and sneaker midsoles.
    fg=binary_fill_holes(fg).astype('uint8')*255
    fg=cv2.resize(fg,None,fx=2,fy=2,interpolation=cv2.INTER_NEAREST)
    return cv2.dilate(fg,np.ones((3,3),'uint8'))

def silhouette_clip(polygon,foreground,isolated=False):
    region=np.zeros(foreground.shape,'uint8')
    cv2.fillPoly(region,[np.array(polygon,dtype='int32')*2],255)
    # A half-pixel bleed avoids antialias seams between adjacent layers.
    region=cv2.dilate(region,np.ones((3,3),'uint8'))
    region=cv2.bitwise_and(region,foreground)
    if isolated:
        count,labels,stats,_=cv2.connectedComponentsWithStats(region,8)
        if count>1:
            largest=1+int(np.argmax(stats[1:,cv2.CC_STAT_AREA]))
            region=np.where(labels==largest,255,0).astype('uint8')
    contours,_=cv2.findContours(region,cv2.RETR_LIST,cv2.CHAIN_APPROX_SIMPLE)
    pieces=[]
    for contour in contours:
        if cv2.contourArea(contour)<.5:continue
        pts=cv2.approxPolyDP(contour,.35,True)[:,0,:]
        pieces.append('M'+'L'.join(f'{x},{y}' for x,y in pts)+'Z')
    return ''.join(pieces)

SHADOWS={
    '01-frontal':[(154,973,65,12),(365,985,52,11)],
    '02-tres-cuartos':[(492,983,66,11),(593,954,69,10)],
    '03-perfil':[(748,983,75,11),(800,947,45,9)],
    '04-espalda':[(889,981,52,10),(1055,982,50,10)],
}

def shadow_defs(defs):
    grad=ET.SubElement(defs,f'{{{SVG}}}radialGradient',id='sombra-suelo')
    for off,opacity in [('0','.19'),('.45','.10'),('1','0')]:
        ET.SubElement(grad,f'{{{SVG}}}stop',offset=off,attrib={'stop-color':'#514740','stop-opacity':opacity})

def shadows(parent,keys):
    group=ET.SubElement(parent,f'{{{SVG}}}g',id='sombras-suelo')
    for key in keys:
        for cx,cy,rx,ry in SHADOWS.get(key,[]):
            ET.SubElement(group,f'{{{SVG}}}ellipse',cx=str(cx),cy=str(cy),rx=str(rx),ry=str(ry),fill='url(#sombra-suelo)')

def build():
    original=Image.open(SOURCE).convert('RGB')
    assert original.size==(1122,1402), 'Reference dimensions changed; review partitions.'
    master=root_svg('Guillermo Aladro · hoja de personaje SVG detallada',(0,0,1122,1402))
    defs=ET.SubElement(master,f'{{{SVG}}}defs')
    shadow_defs(defs)
    ET.SubElement(master,f'{{{SVG}}}rect',id='fondo',x='0',y='0',width='1122',height='1402',fill='#fff')
    shadows(master,list(SHADOWS))
    artwork=ET.SubElement(master,f'{{{SVG}}}g',id='guillermo-aladro',transform='scale(0.5)')
    foreground=foreground_mask(original)
    report=[]
    for key,label,polygon,export_box in REGIONS:
        started=time.time()
        x0=max(0,min(p[0] for p in polygon)-2);y0=max(0,min(p[1] for p in polygon)-2)
        x1=min(1122,max(p[0] for p in polygon)+2);y1=min(1402,max(p[1] for p in polygon)+2)
        crop=original.crop((x0,y0,x1,y1)).resize(((x1-x0)*2,(y1-y0)*2),Image.Resampling.LANCZOS)
        inp=WORK/f'{key}-input.png';raw=WORK/f'{key}-raw.svg';shaded=WORK/f'{key}-shaded.svg'
        crop.save(inp)
        if not shaded.exists():
            vtracer.convert_image_to_svg_py(str(inp),str(raw),colormode='color',hierarchical='stacked',mode='polygon',filter_speckle=1,color_precision=8,layer_difference=1,corner_threshold=90,length_threshold=3.5,max_iterations=10,splice_threshold=45,path_precision=3)
            stats=refine(raw,inp,shaded)
        tile=ET.parse(shaded).getroot()
        local_defs=tile.find(f'{{{SVG}}}defs')
        for node in tile.iter():
            if node.get('id'): node.set('id',key+'-'+node.get('id'))
            for attr,value in list(node.attrib.items()):
                if 'url(#' in value:node.set(attr,value.replace('url(#','url(#'+key+'-'))
        tile_defs=list(local_defs)
        for node in tile_defs: defs.append(copy.deepcopy(node))
        clip=ET.SubElement(defs,f'{{{SVG}}}clipPath',id='recorte-'+key,clipPathUnits='userSpaceOnUse')
        ET.SubElement(clip,f'{{{SVG}}}path',d=silhouette_clip(polygon,foreground),attrib={'clip-rule':'evenodd'})
        group=ET.SubElement(artwork,f'{{{SVG}}}g',id=key,attrib={f'{{{INK}}}groupmode':'layer',f'{{{INK}}}label':label,'clip-path':f'url(#recorte-{key})'})
        ET.SubElement(group,f'{{{SVG}}}title').text=label
        inner=ET.SubElement(group,f'{{{SVG}}}g',transform=f'translate({x0*2},{y0*2})')
        for node in tile:
            if node.tag==f'{{{SVG}}}path': inner.append(copy.deepcopy(node))
        count=sum(1 for _ in inner.iter(f'{{{SVG}}}path'))
        # Each export remains self-contained and uses only its own definitions.
        if key!='nombre':
            single=root_svg('Guillermo Aladro · '+label,export_box)
            sd=ET.SubElement(single,f'{{{SVG}}}defs')
            shadow_defs(sd)
            for node in tile_defs:sd.append(copy.deepcopy(node))
            single_clip=copy.deepcopy(clip)
            export_polygon=polygon
            if key=='01-frontal':
                # The reference's two shirts touch here. Keep the frontal
                # silhouette without the one-pixel sliver of its neighbour.
                export_polygon=[(x-2 if 265<=y<=372 and x>=420 else x,y) for x,y in polygon]
            single_clip[0].set('d',silhouette_clip(export_polygon,foreground,isolated=True))
            sd.append(single_clip)
            bx,by,bw,bh=export_box
            ET.SubElement(single,f'{{{SVG}}}rect',x=str(bx),y=str(by),width=str(bw),height=str(bh),fill='#fff')
            shadows(single,[key])
            sg=ET.SubElement(single,f'{{{SVG}}}g',transform='scale(0.5)');sg.append(copy.deepcopy(group))
            write_svg(single,BASE/'Guillermo-Aladro'/f'{key}.svg')
        record=dict(id=key,label=label,paths=count,gradients=len(tile_defs),source_crop=[x0,y0,x1,y1],export_viewbox=list(export_box),seconds=round(time.time()-started,2))
        report.append(record);print(json.dumps(record,ensure_ascii=False),flush=True)
    metadata=dict(character='Guillermo Aladro',source_path=str(SOURCE.relative_to(REPO)),source_git_blob='92ff45ef7481f430f566b3fa383be7f8ea242685',source_sha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),source_size=[1122,1402],format='SVG 1.1',vector_only=True,regions=[{k:v for k,v in r.items() if k!='seconds'} for r in report])
    ET.SubElement(master,f'{{{SVG}}}metadata',id='procedencia').text=json.dumps(metadata,ensure_ascii=False)
    out=BASE/'Guillermo-Aladro.svg';write_svg(master,out)
    (WORK/'build-report.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2))
    print(json.dumps(dict(master_bytes=out.stat().st_size,paths=sum(r['paths']for r in report),gradients=sum(r['gradients']for r in report))),flush=True)
    cairosvg.svg2png(url=str(out),write_to=str(BASE/'Guillermo-Aladro-preview.png'),output_width=1122,output_height=1402)

if __name__=='__main__':build()
