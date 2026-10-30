#!/usr/bin/env python3
"""Verify one existing scene SVG and render its static state; not a playback test."""
from pathlib import Path
from datetime import datetime,timezone
import argparse,json,os,urllib.request,urllib.parse
import cairosvg
from lxml import etree as E
from separar_avatar_individual import validate,gitsha,sha,NS
from auditar_svg_publicados import verified_png

def main():
    p=argparse.ArgumentParser()
    p.add_argument('scene',choices=['escena-cerveza','escena-cerveza-frontal'])
    p.add_argument('work');p.add_argument('snapshot');a=p.parse_args()
    work=Path(a.work);snapshot=json.loads(Path(a.snapshot).read_text())
    files={x['path']:x for x in snapshot['files']}
    stem='Guillermo-Aladro-'+a.scene.removeprefix('escena-')
    path='avatares SVG - Astra/Guillermo-Aladro/'+a.scene+'/'+stem+'.svg'
    f=work/'published'/path;f.parent.mkdir(parents=True,exist_ok=True)
    if not f.exists() or gitsha(f.read_bytes())!=files[path]['sha']:
        url='https://raw.githubusercontent.com/GuillermoAladro/Alcoholimetro/'+snapshot['commit']+'/'+urllib.parse.quote(path)
        with urllib.request.urlopen(url,timeout=90) as response:raw=response.read()
        assert gitsha(raw)==files[path]['sha'];f.write_bytes(raw)
    raw=f.read_bytes();assert gitsha(raw)==files[path]['sha']
    root=E.fromstring(raw);checks=validate(root)
    animation=root.findall('.//s:animate',NS)+root.findall('.//s:animateTransform',NS)
    assert animation
    for node in animation:
        if node.get('keyTimes') and node.get('values'):
            assert len(node.get('keyTimes').split(';'))==len(node.get('values').split(';'))
    out=work/'revision-final/escenas'/a.scene;out.mkdir(parents=True,exist_ok=True)
    pending=out/'estado-estatico.pending.png';dest=out/'estado-estatico.png'
    # These existing SVG2 scenes use <use href>; Inkscape 1.2 omits those pieces.
    # CairoSVG resolves the original references without rewriting the asset.
    pending.write_bytes(cairosvg.svg2png(bytestring=raw))
    im=verified_png(pending)
    with pending.open('rb') as stream:os.fsync(stream.fileno())
    pending.replace(dest);im.save(out/'revision.jpg',quality=95)
    report=dict(path=path,published_git_blob=files[path]['sha'],bytes=len(raw),sha256=sha(raw),**checks,
        reviewed_commit=snapshot['commit'],rendered=True,renderer='CairoSVG '+cairosvg.__version__,render_scope='Static state only; full SMIL playback not retested',
        smil_nodes=len(animation),smil_value_and_keytime_counts_match=True,png_sha256=sha(dest.read_bytes()),png_complete_verified=True,
        visual_review={'status':'pending'},checked_utc=datetime.now(timezone.utc).isoformat())
    (out/'informe.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps({'scene':a.scene,'checks':checks,'smil_nodes':len(animation),'review':str(out/'revision.jpg')}))

if __name__=='__main__':main()
