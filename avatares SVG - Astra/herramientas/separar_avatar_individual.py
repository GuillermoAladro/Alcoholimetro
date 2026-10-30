#!/usr/bin/env python3
"""Export and verify ONE avatar's poses from its existing detailed SVG.

No re-tracing or simplification: paths, local gradients and silhouette contours
are copied exactly. A person reviews the contact sheets before publication.
"""
from pathlib import Path
import argparse, copy, hashlib, io, json, re, subprocess
from datetime import datetime, timezone
from lxml import etree as E
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import binary_erosion
import cairosvg

SVG='http://www.w3.org/2000/svg'
NS={'s':SVG}
NUM=re.compile(r'[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?')
REF=re.compile(r'url\(#([^)]*)\)')
BASE=Path(__file__).resolve().parents[1]

def nums(s): return np.array([float(x) for x in NUM.findall(s)])
def sha(data): return hashlib.sha256(data).hexdigest()
def gitsha(data): return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
def tag(name): return '{'+SVG+'}'+name
def inside(point,polygon):
    x,y=point;a=polygon;b=np.roll(a,-1,axis=0)
    crossing=(a[:,1]>y)!=(b[:,1]>y)
    ax,ay=a[crossing].T;bx,by=b[crossing].T
    return bool(np.count_nonzero(x<(bx-ax)*(y-ay)/(by-ay)+ax)%2)
def atomic(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    temp=path.with_suffix(path.suffix+'.tmp');temp.write_bytes(data);temp.replace(path)

def bbox(path):
    d=path.get('d','')
    if set(re.findall('[A-DF-Za-df-z]', d)) - set('MLZ'):
        raise ValueError('Unexpected path commands; review bounds parser')
    p=nums(d).reshape(-1,2)
    t=path.get('transform','')
    if t:
        if not re.fullmatch(r'translate\([^)]*\)',t):raise ValueError(t)
        shift=nums(t);p=p+shift
    return np.r_[p.min(0),p.max(0)]/2

def validate(root):
    ids=[n.get('id') for n in root.iter() if n.get('id')]
    assert len(ids)==len(set(ids)), 'Duplicate IDs'
    found=set(ids);refs=set()
    for n in root.iter():
        assert E.QName(n).localname not in ('image','script','foreignObject')
        for k,v in n.attrib.items():
            assert not E.QName(k).localname.lower().startswith('on')
            if E.QName(k).localname=='href': assert v.startswith('#');refs.add(v[1:])
            refs.update(REF.findall(v))
            assert not re.search(r'url\((?!#)',v),v
    assert refs<=found,refs-found
    return dict(xml_valid=True,vector_only=True,unique_ids=True,internal_references_valid=True,
                paths=len(root.findall('.//s:path',NS)),gradients=len(root.findall('.//s:linearGradient',NS)))

def main():
    ap=argparse.ArgumentParser();ap.add_argument('name');ap.add_argument('work');ap.add_argument('--expressions',default='neutral,risa,sorpresa,cansancio,ojos-cerrados,guino');ap.add_argument('--contours',help='Explicit contour indices sorted by front, 3/4, profile, back, six expressions');args=ap.parse_args()
    slug=args.name.replace(' ','-');work=Path(args.work);master=work/'avatares SVG - Astra'/(slug+'.svg');source=work/'animaciones'/('Avatar '+args.name+'.png')
    raw=master.read_bytes();root=E.fromstring(raw);meta=json.loads(root.find('s:metadata',NS).text)
    assert meta['source_git_blob']==gitsha(source.read_bytes()),'Source changed; review first'
    checks=validate(root)
    art=root.find('s:g[@id="avatar-'+slug.lower()+'"]',NS);assert art is not None
    assert art.get('transform')=='scale(0.5)'
    defs={n.get('id'):n for n in root.find('s:defs',NS)}
    clip=root.find('.//s:clipPath[@id="siluetas"]/s:path',NS)
    contours=[]
    for index,d in enumerate(re.findall(r'M[^Z]+Z',clip.get('d'))):
        pts=nums(d).reshape(-1,2)/2;shift=np.roll(pts,-1,axis=0)
        signed=((pts[:,0]*shift[:,1]-pts[:,1]*shift[:,0]).sum()/2)
        contours.append(dict(index=index,d=d,box=np.r_[pts.min(0),pts.max(0)],area=abs(signed),points=pts))
    largest=sorted(contours,key=lambda c:c['area'],reverse=True)[:10]
    bodies=sorted(sorted(largest,key=lambda c:c['box'][1])[:4],key=lambda c:c['box'][0])
    faces=sorted([c for c in largest if c not in bodies],key=lambda c:c['box'][0])
    if args.contours:
        order=[int(i) for i in args.contours.split(',')];assert len(order)==10
        selected=[contours[i] for i in order]
    else:selected=bodies+faces
    assert len(selected)==10
    # Candidate indices and boxes are recorded for the human visual review.
    keys=['01-frontal','02-tres-cuartos','03-perfil','04-espalda']+[f'{i+5:02d}-{s}' for i,s in enumerate(args.expressions.split(','))]
    assert len(keys)==10
    paths=list(art);bounds=np.array([bbox(p) for p in paths])
    out=BASE/slug;out.mkdir(exist_ok=True);qa=work/'revision'/slug;qa.mkdir(parents=True,exist_ok=True)
    original=Image.open(source).convert('RGB');original_arr=np.array(original);w,h=original.size
    master_png=cairosvg.svg2png(bytestring=raw,output_width=w,output_height=h)
    fresh=Image.open(io.BytesIO(master_png)).convert('RGB');fresh_arr=np.array(fresh)
    records=[];renders=[]
    for key,c in zip(keys,selected):
        x0,y0,x1,y1=c['box'];box=[max(0,int(np.floor(x0))-8),max(0,int(np.floor(y0))-8),min(w,int(np.ceil(x1))+9),min(h,int(np.ceil(y1))+9)]
        bx,by,ex,ey=box;bw,bh=ex-bx,ey-by
        s=E.Element(tag('svg'),nsmap={None:SVG},width=str(bw),height=str(bh),viewBox=f'{bx} {by} {bw} {bh}',version='1.1',role='img',attrib={'aria-labelledby':'title desc','shape-rendering':'geometricPrecision'})
        E.SubElement(s,tag('title'),id='title').text=args.name+' · '+key[3:]
        E.SubElement(s,tag('desc'),id='desc').text='Vista individual de la hoja oficial. Conserva exactamente los trazados y gradientes de la hoja maestra; sin imágenes incrustadas. Ilustración estática, no rig articulado.'
        sd=E.SubElement(s,tag('defs'))
        cp=E.SubElement(sd,tag('clipPath'),id='silueta-individual',clipPathUnits='userSpaceOnUse')
        # Include holes wholly inside the selected outer contour's box.
        loops=[c['d']]
        for small in contours:
            if small is c or small['area']>=c['area']:continue
            sb=small['box']
            if sb[0]>=x0 and sb[1]>=y0 and sb[2]<=x1 and sb[3]<=y1 and inside(small['points'][0],c['points']):loops.append(small['d'])
        E.SubElement(cp,tag('path'),d=''.join(loops),attrib={'clip-rule':'evenodd'})
        E.SubElement(s,tag('rect'),x=str(bx),y=str(by),width=str(bw),height=str(bh),fill='#fff')
        g=E.SubElement(s,tag('g'),id=key,transform='scale(0.5)',attrib={'clip-path':'url(#silueta-individual)'})
        keep=(bounds[:,0]<=x1)&(bounds[:,1]<=y1)&(bounds[:,2]>=x0)&(bounds[:,3]>=y0)
        needed=set()
        for index in np.flatnonzero(keep):
            p=copy.deepcopy(paths[index]);g.append(p)
            for value in p.attrib.values():needed.update(REF.findall(value))
        pending=list(needed)
        while pending:
            rid=pending.pop();definition=defs[rid]
            for node in definition.iter():
                for value in node.attrib.values():
                    for dep in REF.findall(value):
                        if dep not in needed:needed.add(dep);pending.append(dep)
        for rid in sorted(needed):sd.append(copy.deepcopy(defs[rid]))
        provenance=dict(character=args.name,pose=key,source_path=meta['source_path'],source_git_blob=meta['source_git_blob'],master_file=slug+'.svg',master_git_blob=gitsha(raw),method='Exact vector extraction; no geometry simplification',silhouette_contour=c['index'])
        E.SubElement(s,tag('metadata'),id='procedencia').text=json.dumps(provenance,ensure_ascii=False)
        structural=validate(s);data=E.tostring(s,encoding='utf-8',xml_declaration=True);atomic(out/(key+'.svg'),data)
        rendered=cairosvg.svg2png(bytestring=data);im=Image.open(io.BytesIO(rendered)).convert('RGB');renders.append(im)
        atomic(qa/(key+'.png'),rendered)
        # Render the exact vector silhouette to compare only the figure's interior.
        m=E.Element(tag('svg'),nsmap={None:SVG},width=str(bw),height=str(bh),viewBox=f'{bx} {by} {bw} {bh}')
        mg=E.SubElement(m,tag('g'),transform='scale(0.5)');E.SubElement(mg,tag('path'),d=''.join(loops),fill='#fff',attrib={'fill-rule':'evenodd'})
        mask=np.array(Image.open(io.BytesIO(cairosvg.svg2png(bytestring=E.tostring(m)))).convert('RGBA'))[:,:,3]>250
        interior=binary_erosion(mask,iterations=2)
        a=np.array(im).astype(float);b=fresh_arr[by:ey,bx:ex].astype(float);ref=original_arr[by:ey,bx:ex].astype(float)
        err=np.abs(a-b)[interior];source_err=np.abs(a-ref)[interior]
        assert err.mean()<.15, (key,float(err.mean()))
        row=dict(file=key+'.svg',**structural,bytes=len(data),sha256=sha(data),viewBox=[bx,by,bw,bh],contour_index=c['index'],figure_mae_vs_master=round(float(err.mean()),6),figure_mae_vs_reference=round(float(source_err.mean()),4))
        records.append(row);print(json.dumps(row),flush=True)
    # A second independent renderer checks a full body and a face.
    independent=[]
    for key in [keys[0],keys[5]]:
        dest=qa/(key+'-inkscape.png')
        subprocess.run(['inkscape',str(out/(key+'.svg')),'--export-type=png','--export-filename='+str(dest)],check=True,capture_output=True)
        a=np.array(Image.open(qa/(key+'.png')).convert('RGB')).astype(float);b=np.array(Image.open(dest).convert('RGB')).astype(float)
        assert a.shape==b.shape
        independent.append(dict(file=key+'.svg',renderer='Inkscape',mae_vs_cairosvg=round(float(np.abs(a-b).mean()),4)))
    # Individual contact sheets (source then SVG, consistent scale).
    canvas=Image.new('RGB',(1800,1800),'#f4f3ef');draw=ImageDraw.Draw(canvas)
    draw.text((30,20),args.name+' | Referencia / SVG individual',fill='#222')
    for i,(row,im) in enumerate(zip(records,renders)):
        cellw=450 if i<4 else 300;x=(i if i<4 else i-4)*cellw;y=60 if i<4 else 1000
        bw=cellw//2-12;bh=880 if i<4 else 700
        bx,by,ww,hh=row['viewBox'];src=original.crop((bx,by,bx+ww,by+hh))
        for j,tile in enumerate([src,im]):
            tile=tile.copy();tile.thumbnail((bw,bh));canvas.paste(tile,(x+j*cellw//2+(bw-tile.width)//2,y))
        draw.text((x+8,y-20),row['file'],fill='#222')
    canvas.save(qa/'comparacion.jpg',quality=94)
    preview=Image.new('RGB',(1500,1250),'#fff')
    for i,im in enumerate(renders):
        tw,th=(375,760) if i<4 else (250,420);x=i*375 if i<4 else (i-4)*250;y=20 if i<4 else 810
        tile=im.copy();tile.thumbnail((tw-12,th));preview.paste(tile,(x+(tw-tile.width)//2,y))
    preview.save(out/'vistas-preview.jpg',quality=94)
    report=dict(character=args.name,source_git_blob=meta['source_git_blob'],master_git_blob=gitsha(raw),master_sha256=sha(raw),master_checks=checks,method='Exact extraction from original detailed vector master; individual contour selection and definition pruning',static_illustrations=True,files=records,independent_renderer=independent,visual_review={'status':'pending'},created_utc=datetime.now(timezone.utc).isoformat())
    atomic(out/'control-calidad.json',json.dumps(report,ensure_ascii=False,indent=2).encode())
    readme='# '+args.name+' · vistas SVG individuales\n\nDiez ilustraciones estáticas extraídas de la hoja maestra detallada, sin simplificar los trazados ni los gradientes. Conservan la referencia, las proporciones, el vestuario y las expresiones.\n\n![Vistas individuales](vistas-preview.jpg)\n\n'+''.join('- ['+r['file']+']('+r['file']+')\n' for r in records)+'\nCada SVG es autónomo y contiene geometría vectorial real. No es un esqueleto articulado para animación. El fondo blanco coincide con la presentación de Guillermo. Las sombras del suelo de la hoja completa no se añaden a los recortes.\n\n[Control de calidad y procedencia](control-calidad.json) · [Hoja maestra](../'+slug+'.svg)\n'
    atomic(out/'README.md',readme.encode())
    print(json.dumps({'character':args.name,'out':str(out),'review':str(qa/'comparacion.jpg'),'total_bytes':sum(r['bytes'] for r in records)}),flush=True)

if __name__=='__main__':main()
