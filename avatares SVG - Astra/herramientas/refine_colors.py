from pathlib import Path
import re,copy,xml.etree.ElementTree as ET
import numpy as np
from PIL import Image
import cairosvg
SVG='http://www.w3.org/2000/svg'
ET.register_namespace('',SVG)
def refine(svg_path,image_path,output_path,id_path=None):
 root=ET.parse(svg_path).getroot(); paths=list(root.iter('{'+SVG+'}path'));n=len(paths)+1
 idroot=copy.deepcopy(root);idroot.set('shape-rendering','crispEdges');
 for i,p in enumerate(idroot.iter('{'+SVG+'}path'),1):p.set('fill',f'#{i:06x}');p.set('stroke','none')
 b=cairosvg.svg2png(bytestring=ET.tostring(idroot));
 import io
 ida=np.array(Image.open(io.BytesIO(b)).convert('RGB')).astype(np.uint32)
 ids=((ida[:,:,0]<<16)+(ida[:,:,1]<<8)+ida[:,:,2]).ravel();valid=(ids>0)&(ids<n)
 source=image_path if isinstance(image_path,Image.Image) else Image.open(image_path)
 a=np.array(source.convert('RGB'),dtype=float);h,w=a.shape[:2]
 yy,xx=np.mgrid[:h,:w];x=xx.ravel()+.5;y=yy.ravel()+.5;rgb=a.reshape(-1,3)
 idx=ids[valid];x=x[valid];y=y[valid];rgb=rgb[valid]
 def acc(v):return np.bincount(idx,weights=v,minlength=n)
 count=np.bincount(idx,minlength=n);N=np.maximum(count,1);mx=acc(x)/N;my=acc(y)/N
 mc=np.stack([acc(rgb[:,j])/N for j in range(3)],axis=1)
 cxx=acc(x*x)/N-mx*mx;cyy=acc(y*y)/N-my*my;cxy=acc(x*y)/N-mx*my
 cov=np.stack([np.stack([cxx+.2,cxy],1),np.stack([cxy,cyy+.2],1)],1)
 cr=np.stack([np.stack([acc(x*rgb[:,j])/N-mx*mc[:,j],acc(y*rgb[:,j])/N-my*mc[:,j]],1)for j in range(3)],1)
 slope=np.linalg.solve(cov,np.transpose(cr,(0,2,1))).transpose(0,2,1)
 u,s,vh=np.linalg.svd(slope,full_matrices=False);direction=vh[:,0,:];direction[~np.isfinite(direction).all(axis=1)]=[1,0]
 slope1=np.einsum('nci,ni->nc',slope,direction)
 proj=(x-mx[idx])*direction[idx,0]+(y-my[idx])*direction[idx,1]
 lo=np.full(n,np.inf);hi=np.full(n,-np.inf);np.minimum.at(lo,idx,proj);np.maximum.at(hi,idx,proj)
 defs=ET.Element('{'+SVG+'}defs');root.insert(0,defs);gradcount=0
 for i,path in enumerate(paths,1):
  if count[i]==0:continue
  color=np.clip(np.round(mc[i]),0,255).astype(int);path.set('fill','#'+''.join(f'{z:02x}'for z in color))
  span=hi[i]-lo[i];delta=slope1[i]*span
  gain=float((delta*delta).sum())
  if count[i]<12 or span<1 or gain<12:continue
  # Fit a rank-one RGB gradient along the dominant local shading direction.
  p1=np.array([mx[i],my[i]])+direction[i]*lo[i];p2=np.array([mx[i],my[i]])+direction[i]*hi[i]
  tr=path.get('transform','');m=re.search(r'translate\(([-\d.e]+)[ ,]+([-\d.e]+)\)',tr)
  if m:p1-=np.array([float(m[1]),float(m[2])]);p2-=np.array([float(m[1]),float(m[2])])
  c1=np.clip(np.round(mc[i]+slope1[i]*lo[i]),0,255).astype(int);c2=np.clip(np.round(mc[i]+slope1[i]*hi[i]),0,255).astype(int)
  gid=f'tone-{i}';g=ET.SubElement(defs,'{'+SVG+'}linearGradient',id=gid,gradientUnits='userSpaceOnUse',x1=f'{p1[0]:.3f}',y1=f'{p1[1]:.3f}',x2=f'{p2[0]:.3f}',y2=f'{p2[1]:.3f}')
  for offset,col in [('0',c1),('1',c2)]:ET.SubElement(g,'{'+SVG+'}stop',offset=offset,attrib={'stop-color':'#'+''.join(f'{z:02x}'for z in col)})
  path.set('fill',f'url(#{gid})');gradcount+=1
 root.set('shape-rendering','geometricPrecision')
 payload=ET.tostring(root,encoding='utf-8',xml_declaration=True)
 target=Path(output_path);temporary=target.with_suffix('.svg.tmp')
 assert temporary.write_bytes(payload)==len(payload)
 temporary.replace(target)
 ET.parse(target)
 return dict(paths=len(paths),gradients=gradcount,bytes=Path(output_path).stat().st_size)
if __name__=='__main__':
 import sys,json
 print(json.dumps(refine(*sys.argv[1:4])))
