#!/usr/bin/env python3
"""Create self-contained, high-density SVG sheets for the repository avatars.

Guillermo uses the separate, manually partitioned master. Other characters are
traced from their own current reference sheet without substituting identities,
clothes, poses or expressions. Characters are processed strictly one at a time.
"""
from pathlib import Path
import copy
import hashlib
import json
import sys
import time
import io
import xml.etree.ElementTree as ET

from PIL import Image
import cv2
import numpy as np
import vtracer
import cairosvg
from skimage.metrics import structural_similarity
from refine_colors import refine
from generar_guillermo import foreground_mask, silhouette_clip

BASE=Path(__file__).resolve().parents[1]
REPO=BASE.parent
WORK=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/tmp/avatares-astra-build')
SVG='http://www.w3.org/2000/svg'
INK='http://www.inkscape.org/namespaces/inkscape'
ET.register_namespace('',SVG);ET.register_namespace('inkscape',INK)

def svgroot(name,w,h):
    root=ET.Element(f'{{{SVG}}}svg',dict(width=str(w),height=str(h),viewBox=f'0 0 {w} {h}',version='1.1',role='img',**{'aria-labelledby':'title desc','shape-rendering':'geometricPrecision'}))
    ET.SubElement(root,f'{{{SVG}}}title',id='title').text=f'{name} · hoja de personaje SVG detallada'
    ET.SubElement(root,f'{{{SVG}}}desc',id='desc').text=f'Vectorización detallada de la hoja oficial del avatar {name}. Mantiene las vistas, expresiones, ropa, accesorios y nombre de la referencia. Trazados y gradientes; sin imágenes incrustadas.'
    return root

def shadows_from_mask(mask):
    small=mask[::2,::2]
    _,_,stats,_=cv2.connectedComponentsWithStats(small,8)
    bodies=[s for s in stats[1:] if s[1]<250 and s[3]>450 and s[1]+s[3]<int(small.shape[0]*.9)]
    if not bodies:return [],int(small.shape[0]*.73)
    bottom=max(int(s[1]+s[3]) for s in bodies)
    y0=max(0,bottom-120)
    _,_,stats,_=cv2.connectedComponentsWithStats(small[y0:bottom+4],8)
    shadows=[]
    for x,y,w,h,area in stats[1:]:
        if area>200 and w>25 and y+h>45:
            shadows.append((round(float(x+w/2),2),int(y0+y+h-2),round(float(w*.58),2),7))
    return shadows,bottom

def build_one(source_path):
    start=time.time();source=Path(source_path);name=source.stem.removeprefix('Avatar ');slug=name.replace(' ','-')
    work=WORK/slug;work.mkdir(parents=True,exist_ok=True)
    original=Image.open(source).convert('RGB');w,h=original.size
    layout_revision=2 if name in ('Laura','Paradigma') else 1
    checkpoint=work/'quality.json'
    if checkpoint.exists():
        previous=json.loads(checkpoint.read_text())
        existing=BASE/previous['file']
        if previous['source_sha256']!=hashlib.sha256(source.read_bytes()).hexdigest():
            (work/'raw.svg').unlink(missing_ok=True)
            (work/'shaded.svg').unlink(missing_ok=True)
        if previous.get('layout_revision',1)==layout_revision and previous['source_sha256']==hashlib.sha256(source.read_bytes()).hexdigest() and existing.exists() and previous['svg_sha256']==hashlib.sha256(existing.read_bytes()).hexdigest():
            Image.open(BASE/previous['preview']).verify()
            return previous
    inp=work/'input.png';raw=work/'raw.svg';shaded=work/'shaded.svg'
    crop=original.resize((w*2,h*2),Image.Resampling.LANCZOS)
    if not shaded.exists():
        buffer=io.BytesIO();crop.save(buffer,format='PNG');payload=buffer.getvalue()
        Image.open(io.BytesIO(payload)).verify()
        raw.write_text(vtracer.convert_raw_image_to_svg(payload,img_format='png',colormode='color',hierarchical='stacked',mode='polygon',filter_speckle=1,color_precision=8,layer_difference=1,corner_threshold=90,length_threshold=3.5,max_iterations=10,splice_threshold=45,path_precision=3))
        refine(raw,crop,shaded)
    tile=ET.parse(shaded).getroot();root=svgroot(name,w,h)
    defs=ET.SubElement(root,f'{{{SVG}}}defs')
    for node in tile.find(f'{{{SVG}}}defs'):defs.append(copy.deepcopy(node))
    gradient_count=len(defs)
    fg=foreground_mask(original)
    if name=='Laura':
        # White clothing touches the white sheet background in this reference.
        # These reviewed regions retain the complete garment and its shading.
        for x0,y0,x1,y1 in [(180,185,370,420),(480,190,620,420),(725,190,825,430),(880,280,1080,420),(0,1160,1122,1402)]:
            fg[y0*2:y1*2,x0*2:x1*2]=255
    if name=='Paradigma':
        # Pale shirt tones connect to the background at the portrait bottoms.
        for x0,y0,x1,y1 in [(10,1200,185,1289),(200,1200,370,1289),(390,1200,550,1289),(570,1200,665,1289),(765,1200,916,1289),(942,1200,1110,1289)]:
            fg[y0*2:y1*2,x0*2:x1*2]=255
    clip=ET.SubElement(defs,f'{{{SVG}}}clipPath',id='siluetas',clipPathUnits='userSpaceOnUse')
    ET.SubElement(clip,f'{{{SVG}}}path',d=silhouette_clip([(0,0),(w,0),(w,h),(0,h)],fg),attrib={'clip-rule':'evenodd'})
    radial=ET.SubElement(defs,f'{{{SVG}}}radialGradient',id='sombra-suelo')
    for off,opacity in [('0','.19'),('.45','.10'),('1','0')]:
        ET.SubElement(radial,f'{{{SVG}}}stop',offset=off,attrib={'stop-color':'#514740','stop-opacity':opacity})
    ET.SubElement(root,f'{{{SVG}}}rect',id='fondo',x='0',y='0',width=str(w),height=str(h),fill='#fff')
    shadows,bottom=shadows_from_mask(fg)
    shadowgroup=ET.SubElement(root,f'{{{SVG}}}g',id='sombras-suelo')
    for cx,cy,rx,ry in shadows:ET.SubElement(shadowgroup,f'{{{SVG}}}ellipse',cx=str(cx),cy=str(cy),rx=str(rx),ry=str(ry),fill='url(#sombra-suelo)')
    art=ET.SubElement(root,f'{{{SVG}}}g',id='avatar-'+slug.lower(),transform='scale(0.5)',attrib={'clip-path':'url(#siluetas)',f'{{{INK}}}groupmode':'layer',f'{{{INK}}}label':name+' · ilustración vectorial'})
    paths=[n for n in tile if n.tag==f'{{{SVG}}}path']
    for node in paths:art.append(copy.deepcopy(node))
    blob=source.read_bytes();blobsha=hashlib.sha1(b'blob '+str(len(blob)).encode()+b'\0'+blob).hexdigest()
    meta=dict(character=name,source_path=str(source.relative_to(REPO)),source_git_blob=blobsha,source_sha256=hashlib.sha256(blob).hexdigest(),source_size=[w,h],format='SVG 1.1',vector_only=True,paths=len(paths),gradients=gradient_count,layout_revision=layout_revision)
    ET.SubElement(root,f'{{{SVG}}}metadata',id='procedencia').text=json.dumps(meta,ensure_ascii=False)
    output=BASE/(slug+'.svg')
    payload=ET.tostring(root,encoding='utf-8',xml_declaration=True)
    temporary_svg=output.with_suffix('.svg.tmp')
    assert temporary_svg.write_bytes(payload)==len(payload)
    temporary_svg.replace(output)
    ET.parse(output)
    preview=BASE/(slug+'-preview.png');temporary=work/'preview.png'
    rendered=cairosvg.svg2png(url=str(output),output_width=w,output_height=h)
    Image.open(io.BytesIO(rendered)).verify();preview.write_bytes(rendered)
    a=np.array(original);b=np.array(Image.open(preview).convert('RGB'))
    full_ssim=float(structural_similarity(a,b,channel_axis=2,data_range=255))
    y0=min(bottom+10,h-150);face_ssim=float(structural_similarity(a[y0:],b[y0:],channel_axis=2,data_range=255))
    meta.update(file=output.name,preview=preview.name,bytes=output.stat().st_size,svg_sha256=hashlib.sha256(output.read_bytes()).hexdigest(),ssim=round(full_ssim,5),expression_strip_ssim=round(face_ssim,5),mean_absolute_channel_error_0_255=round(float(np.abs(a.astype(float)-b).mean()),5),body_bottom=bottom,seconds=round(time.time()-start,2))
    (work/'quality.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2))
    return meta

if __name__=='__main__':
    WORK.mkdir(parents=True,exist_ok=True)
    sources=[p for p in sorted((REPO/'animaciones').glob('Avatar *.png')) if p.stem!='Avatar Guillermo Aladro']
    if len(sys.argv)>2:sources=[p for p in sources if p.stem.removeprefix('Avatar ') in sys.argv[2:]]
    records=[]
    for source in sources:
        result=build_one(str(source))
        records.append(result)
        print(json.dumps(result,ensure_ascii=False),flush=True)
    report=BASE/'control-calidad-coleccion.json'
    all_records={r['character']:r for r in json.loads(report.read_text())['characters']} if report.exists() else {}
    all_records.update({r['character']:r for r in records})
    report.write_text(json.dumps({'method':'Direct high-density vector tracing with local color-gradient fitting','note':'SSIM measures pixel-structure similarity, not facial identity or artistic quality. Backgrounds and contact shadows are cleaned.','characters':sorted(all_records.values(),key=lambda r:r['character'])},ensure_ascii=False,indent=2))
