#!/usr/bin/env python3
"""Recover pale shirt shading already present in Paradigma's vector paths."""
from pathlib import Path
import argparse,json,shutil,re
from lxml import etree as E
from shapely.geometry import Polygon,box,GeometryCollection
from shapely import make_valid
from separar_avatar_individual import NS,tag,validate,gitsha,atomic,nums

REGIONS=[(10,1200,185,1289),(200,1200,370,1289),(390,1200,550,1289),
         (570,1200,665,1289),(765,1200,916,1289),(942,1200,1110,1289)]

def main():
    p=argparse.ArgumentParser();p.add_argument('work');a=p.parse_args();work=Path(a.work)
    master=work/'avatares SVG - Astra/Paradigma.svg';source=work/'animaciones/Avatar Paradigma.png'
    root=E.parse(str(master)).getroot();meta=root.find('s:metadata',NS);data=json.loads(meta.text)
    assert data['source_git_blob']==gitsha(source.read_bytes())
    clip=root.find('.//s:clipPath[@id="siluetas"]',NS)
    for node in list(clip)[1:]:
        assert node.get('data-purpose')=='white-shirt';clip.remove(node)
    # An explicit union gives identical clipping in CairoSVG and Inkscape.
    # Keep the original artwork; only the silhouette's pale-cloth holes change.
    shape=GeometryCollection()
    for loop in re.findall(r'M[^Z]+Z',clip[0].get('d')):
        shape=shape.symmetric_difference(make_valid(Polygon(nums(loop).reshape(-1,2))))
    for x0,y0,x1,y1 in REGIONS:shape=shape.union(box(x0*2,y0*2,x1*2,y1*2))
    polygons=[shape] if shape.geom_type=='Polygon' else list(shape.geoms)
    def ring(coords):
        points=list(coords)[:-1]
        return 'M'+'L'.join(f'{x:.6f},{y:.6f}' for x,y in points)+'Z'
    clip[0].set('d',''.join(ring(poly.exterior.coords)+''.join(ring(h.coords) for h in poly.interiors) for poly in polygons if poly.geom_type=='Polygon'))
    data.update(layout_revision=2,white_fabric_regions=REGIONS,clip_revision_note='Retain existing pale-shirt paths and gradients in all six portraits; artwork geometry unchanged.')
    meta.text=json.dumps(data,ensure_ascii=False);validate(root)
    atomic(master,E.tostring(root,encoding='utf-8',xml_declaration=True))
    dest=Path(__file__).resolve().parents[1]/master.name;shutil.copyfile(master,dest)
    print(json.dumps({'file':master.name,'protected_regions':len(REGIONS),'git_blob':gitsha(master.read_bytes())}))

if __name__=='__main__':main()
