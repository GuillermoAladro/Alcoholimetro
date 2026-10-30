#!/usr/bin/env python3
"""Repair Guillermo's six portrait crops from all existing master layers.

The original vertical layer partitions split hair across adjacent layers.
Keep that exact geometry and apply reviewed whitespace boundaries outside it.
The four existing full-body exports are retained byte for byte.
"""
from pathlib import Path
import argparse,copy,json,re,shutil,subprocess
from datetime import datetime,timezone
from lxml import etree as E
from PIL import Image,ImageDraw
import numpy as np
import cairosvg
from separar_avatar_individual import NS,REF,tag,bbox,validate,sha,gitsha,atomic

def main():
    p=argparse.ArgumentParser();p.add_argument('work');p.add_argument('seams');a=p.parse_args()
    work=Path(a.work);repo=Path(__file__).resolve().parents[2];base=repo/'avatares SVG - Astra';out=base/'Guillermo-Aladro';out.mkdir(exist_ok=True)
    master=work/'avatares SVG - Astra/Guillermo-Aladro.svg';raw=master.read_bytes();root=E.fromstring(raw)
    meta=json.loads(root.find('s:metadata',NS).text);source=work/meta['source_path'];assert gitsha(source.read_bytes())==meta['source_git_blob']
    defs={n.get('id'):n for n in root.find('s:defs',NS)}
    art=root.find('s:g[@id="guillermo-aladro"]',NS);assert art.get('transform')=='scale(0.5)'
    layers=[n for n in art if n.get('id','')[:2] in ['05','06','07','08','09','10']];assert len(layers)==6
    seams=json.loads(Path(a.seams).read_text());assert len(seams)==7
    keys=['01-frontal','02-tres-cuartos','03-perfil','04-espalda','05-serio','06-sonrisa','07-sorpresa','08-cansancio','09-ojos-cerrados','10-ceno-fruncido']
    qa=work/'revision/Guillermo-Aladro';qa.mkdir(parents=True,exist_ok=True);records=[];renders=[]
    for key in keys[:4]:
        original=work/'published/avatares SVG - Astra/Guillermo-Aladro'/(key+'.svg')
        if original.exists():shutil.copyfile(original,out/original.name)
        else:assert (out/(key+'.svg')).exists(),'Keep the original body exports from the repository'
    for i,key in enumerate(keys[4:]):
        polygon=seams[i]+list(reversed(seams[i+1]));pts=np.array(polygon)
        bx=max(0,int(np.floor(pts[:,0].min()))-8);ex=min(1122,int(np.ceil(pts[:,0].max()))+8);by=1000;ey=1336;bw=ex-bx;bh=ey-by
        s=E.Element(tag('svg'),nsmap={None:NS['s']},width=str(bw),height=str(bh),viewBox=f'{bx} {by} {bw} {bh}',version='1.1',role='img',attrib={'aria-labelledby':'title desc','shape-rendering':'geometricPrecision'})
        E.SubElement(s,tag('title'),id='title').text='Guillermo Aladro · '+key[3:]
        E.SubElement(s,tag('desc'),id='desc').text='Retrato individual con el cabello completo y sin fragmentos vecinos. Conserva los trazados y gradientes de la hoja maestra, incluidos los que atraviesan sus particiones internas.'
        sd=E.SubElement(s,tag('defs'));cp=E.SubElement(sd,tag('clipPath'),id='limite-retrato',clipPathUnits='userSpaceOnUse')
        E.SubElement(cp,tag('polygon'),points=' '.join(f'{x},{y}' for x,y in polygon))
        E.SubElement(s,tag('rect'),x=str(bx),y=str(by),width=str(bw),height=str(bh),fill='#fff')
        outer=E.SubElement(s,tag('g'),attrib={'clip-path':'url(#limite-retrato)'})
        content=E.SubElement(outer,tag('g'),transform='scale(0.5)');needed=set()
        for layer in layers:
            clone=copy.deepcopy(layer);inner=clone.find('s:g',NS);offset=np.array([float(x) for x in re.findall(r'[-+]?\d*\.?\d+',inner.get('transform'))])/2
            for node in list(inner):
                bounds=bbox(node)+np.tile(offset,2)
                if bounds[0]>ex or bounds[2]<bx or bounds[1]>ey or bounds[3]<by:inner.remove(node)
            if not len(inner):continue
            content.append(clone)
            for node in clone.iter():
                for value in node.attrib.values():needed.update(REF.findall(value))
        pending=list(needed)
        while pending:
            rid=pending.pop()
            for node in defs[rid].iter():
                for value in node.attrib.values():
                    for dep in REF.findall(value):
                        if dep not in needed:needed.add(dep);pending.append(dep)
        for rid in sorted(needed):sd.append(copy.deepcopy(defs[rid]))
        E.SubElement(s,tag('metadata'),id='procedencia').text=json.dumps(dict(character='Guillermo Aladro',pose=key,source_path=meta['source_path'],source_git_blob=meta['source_git_blob'],master_file=master.name,master_git_blob=gitsha(raw),method='Exact vector extraction across original portrait layers with reviewed whitespace boundaries'),ensure_ascii=False)
        validate(s);atomic(out/(key+'.svg'),E.tostring(s,encoding='utf-8',xml_declaration=True))
    for key in keys:
        f=out/(key+'.svg');data=f.read_bytes();r=E.fromstring(data);checks=validate(r);dest=qa/(key+'.png')
        subprocess.run(['inkscape',str(f),'--export-type=png','--export-filename='+str(dest)],check=True,capture_output=True)
        im=Image.open(dest).convert('RGB');im.load();renders.append(im)
        row=dict(file=f.name,**checks,bytes=len(data),sha256=sha(data),viewBox=[float(x) for x in r.get('viewBox').split()],rendered=True,renderer='Inkscape',retained_original_body=key in keys[:4])
        if key not in keys[:4]:
            other=qa/(key+'-cairo.png');cairosvg.svg2png(bytestring=data,write_to=str(other));b=np.array(Image.open(other).convert('RGB')).astype(float)
            row['independent_renderer_mae']=round(float(np.abs(np.array(im).astype(float)-b).mean()),4)
        records.append(row);print(json.dumps({'checked':key,'paths':checks['paths']}),flush=True)
    preview=Image.new('RGB',(1500,1250),'white')
    for i,im in enumerate(renders):
        tw,th=(375,760) if i<4 else (250,420);x=i*375 if i<4 else (i-4)*250;y=20 if i<4 else 810
        tile=im.copy();tile.thumbnail((tw-12,th));preview.paste(tile,(x+(tw-tile.width)//2,y))
    preview.save(out/'vistas-preview.jpg',quality=95)
    detail=Image.new('RGB',(1500,1800),'#ecebe7');draw=ImageDraw.Draw(detail)
    for i,im in enumerate(renders[4:]):
        tile=im.resize((im.width*2,im.height*2),Image.Resampling.LANCZOS);tile.thumbnail((480,850));x=i%3*500;y=i//3*900
        detail.paste(tile,(x+(500-tile.width)//2,y+30));draw.text((x+12,y+8),keys[i+4],fill='#222')
    detail.save(qa/'expresiones-detalle.jpg',quality=96)
    atomic(out/'regiones-expresiones.json',json.dumps(seams,indent=2).encode())
    report=dict(character='Guillermo Aladro',source_git_blob=meta['source_git_blob'],master_git_blob=gitsha(raw),master_sha256=sha(raw),files=records,method='Four original bodies retained; six portraits extracted across existing vector layers with reviewed boundaries',visual_review={'status':'pending'},created_utc=datetime.now(timezone.utc).isoformat())
    atomic(out/'control-calidad.json',json.dumps(report,ensure_ascii=False,indent=2).encode())
    text='# Guillermo Aladro · vistas SVG individuales\n\nCuatro vistas de cuerpo completo y seis expresiones, con la geometría detallada de la hoja maestra. La revisión final corrigió los encuadres de los retratos para conservar el pelo que atravesaba las particiones de la hoja y eliminar fragmentos de retratos vecinos. Las cuatro vistas de cuerpo se conservan sin cambios.\n\n![Vistas individuales](vistas-preview.jpg)\n\n'+''.join('- ['+k+'.svg]('+k+'.svg)\n' for k in keys)+'\nIlustraciones estáticas autónomas con trazados y gradientes reales, sin imágenes incrustadas.\n\n[Control de calidad vigente](control-calidad.json) · [Hoja maestra](../Guillermo-Aladro.svg)\n'
    atomic(out/'README.md',text.encode())

if __name__=='__main__':main()
