#!/usr/bin/env python3
"""Second pass over the exact published blobs of ONE completed avatar."""
from pathlib import Path
from datetime import datetime,timezone
import argparse,hashlib,json,os,subprocess,urllib.request,urllib.parse
from lxml import etree as E
from PIL import Image,ImageDraw
import numpy as np
from separar_avatar_individual import validate,gitsha,sha

def verified_png(path):
    """Verify the complete PNG stream, then decode independently."""
    with Image.open(path) as im:im.verify()
    with Image.open(path) as im:
        im.load()
        return im.convert('RGB')

def main():
    p=argparse.ArgumentParser();p.add_argument('name');p.add_argument('work');p.add_argument('snapshot')
    p.add_argument('--reuse-verified-renders',action='store_true',help='Reuse only complete PNGs whose hash and source SVG blob match the previous published review.')
    a=p.parse_args()
    work=Path(a.work);repo=Path(__file__).resolve().parents[2];base='avatares SVG - Astra';slug=a.name.replace(' ','-')
    snapshot=json.loads(Path(a.snapshot).read_text());files={x['path']:x for x in snapshot['files']}
    paths=[base+'/'+slug+'.svg']+sorted(x for x in files if x.startswith(base+'/'+slug+'/') and x.count('/')==2 and x.endswith('.svg'))
    assert len(paths)==11,(slug,len(paths))
    def local(path):
        candidates=[repo/path,work/path]
        for f in candidates:
            if f.exists() and gitsha(f.read_bytes())==files[path]['sha']:return f
        out=work/'published'/path;out.parent.mkdir(parents=True,exist_ok=True)
        if not out.exists() or gitsha(out.read_bytes())!=files[path]['sha']:
            u='https://raw.githubusercontent.com/GuillermoAladro/Alcoholimetro/'+snapshot['commit']+'/'+urllib.parse.quote(path)
            with urllib.request.urlopen(u,timeout=90) as r:out.write_bytes(r.read())
        assert gitsha(out.read_bytes())==files[path]['sha'],path
        return out
    source_path='animaciones/Avatar '+a.name+'.png';source=Image.open(local(source_path)).convert('RGB')
    output=work/'revision-final'/slug;output.mkdir(parents=True,exist_ok=True);rows=[];images=[]
    previous={}
    if a.reuse_verified_renders and (output/'informe.json').exists():
        previous={r['path']:r for r in json.loads((output/'informe.json').read_text())['files']}
    for i,path in enumerate(paths):
        f=local(path);raw=f.read_bytes();root=E.fromstring(raw);checks=validate(root)
        meta=root.find('{http://www.w3.org/2000/svg}metadata')
        provenance_check='legacy_individual_without_embedded_metadata'
        if meta is not None:
            provenance=json.loads(meta.text)
            assert provenance['source_git_blob']==files[source_path]['sha'],'Reference mismatch'
            if i>0:
                assert provenance['master_git_blob']==files[paths[0]]['sha'],'Master mismatch'
            provenance_check='embedded_source_verified'
        else:
            assert i>0 and a.name=='Guillermo Aladro','Missing provenance'
        dest=output/(f.stem+'.png')
        im=None;old=previous.get(path)
        if old and old['published_git_blob']==files[path]['sha'] and dest.exists():
            try:
                if sha(dest.read_bytes())==old['png_sha256']:im=verified_png(dest)
            except (OSError,SyntaxError,ValueError):pass
        reused=im is not None
        if im is None:
            pending=dest.with_suffix('.pending.png')
            subprocess.run(['inkscape',str(f),'--export-type=png','--export-area-page','--export-background=white','--export-background-opacity=1','--export-filename='+str(pending)],check=True,capture_output=True)
            im=verified_png(pending)
            with pending.open('rb') as stream:os.fsync(stream.fileno())
            pending.replace(dest)
        images.append(im)
        assert np.any(np.array(im)<240),'Blank render'
        box=[float(x) for x in root.get('viewBox').split()]
        rows.append(dict(path=path,published_git_blob=files[path]['sha'],bytes=len(raw),sha256=sha(raw),**checks,rendered=True,renderer='Inkscape',viewBox=box,provenance_check=provenance_check,png_complete_verified=True,reused_verified_render=reused,png_sha256=sha(dest.read_bytes())))
        print(json.dumps({'checked':path,'rendered':True}),flush=True)
    canvas=Image.new('RGB',(2000,2300),'#f5f4f0');draw=ImageDraw.Draw(canvas)
    draw.text((20,15),a.name+' | SEGUNDA REVISION DE LOS ARCHIVOS PUBLICADOS',fill='#222')
    for i,im in enumerate([source,images[0]]):
        im=im.copy();im.thumbnail((680,830));canvas.paste(im,(310+i*710,45));draw.text((310+i*710,30),'Referencia' if i==0 else 'Hoja SVG publicada',fill='#222')
    for i,im in enumerate(images[1:]):
        tw,th=(500,800) if i<4 else (333,510);x=i*500 if i<4 else (i-4)*333;y=900 if i<4 else 1745
        im=im.copy();im.thumbnail((tw-20,th));canvas.paste(im,(x+(tw-im.width)//2,y));draw.text((x+12,y-18),Path(paths[i+1]).name,fill='#222')
    canvas.save(output/'revision-publicada.jpg',quality=95)
    detail=Image.new('RGB',(1500,1800),'#ecebe7');dd=ImageDraw.Draw(detail)
    for i,im in enumerate(images[5:]):
        tile=im.resize((im.width*2,im.height*2),Image.Resampling.LANCZOS);tile.thumbnail((480,850))
        x=(i%3)*500;y=(i//3)*900
        detail.paste(tile,(x+(500-tile.width)//2,y+30));dd.text((x+12,y+8),Path(paths[i+5]).name,fill='#222')
    detail.save(output/'expresiones-detalle.jpg',quality=96)
    report=dict(character=a.name,reviewed_commit=snapshot['commit'],source_git_blob=files[source_path]['sha'],files=rows,all_published_bytes_verified=True,all_svg_rendered_after_publication=True,visual_review={'status':'pending'},checked_utc=datetime.now(timezone.utc).isoformat())
    (output/'informe.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps({'character':a.name,'files':len(rows),'review':str(output/'revision-publicada.jpg')}),flush=True)

if __name__=='__main__':main()
