"""Extrae máscaras técnicas; no sintetiza ni repinta píxeles del personaje."""
from pathlib import Path
import hashlib,json,base64,io,shutil
import numpy as np
from PIL import Image,ImageDraw
from scipy.ndimage import binary_propagation,binary_fill_holes,label

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT.parent/'animaciones'
OUT=ROOT/'motor'
# Región de la pose frontal de la hoja ORIGINAL; el polígono separa la pose vecina y el rótulo.
SPECS={
 'guillermo':{'file':'Avatar Guillermo Aladro.png','box':[88,76,438,1000],
 'polygon':[[275,76],[415,76],[403,193],[375,231],[391,251],[414,278],[431,324],[438,351],[434,371],[426,376],[430,470],[408,520],[420,1000],[88,1000],[88,890],[145,500],[130,365],[151,282],[240,242],[264,204]]},
}
manifest={};browser_assets={}
for key,s in SPECS.items():
 source=SOURCE/s['file'];im=Image.open(source).convert('RGBA');arr=np.asarray(im).copy()
 polygon=Image.new('L',im.size);ImageDraw.Draw(polygon).polygon([tuple(p) for p in s['polygon']],fill=255)
 inside=np.asarray(polygon)>0
 rgb=arr[:,:,:3].astype(float)
 bright=rgb.min(2)>218
 allowed=bright|~inside
 seed=np.zeros(inside.shape,bool);seed[0,:]=seed[-1,:]=True;seed[:,0]=seed[:,-1]=True;seed|=~inside
 background=binary_propagation(seed,mask=allowed)
 foreground=inside&~background
 labels,n=label(foreground)
 sizes=np.bincount(labels.ravel());sizes[0]=0
 foreground=labels==sizes.argmax()
 foreground=binary_fill_holes(foreground)
 arr[:,:,3]=np.where(foreground,255,0)
 box=s['box'];sprite=Image.fromarray(arr).crop(box)
 # El color RGB de todo píxel opaco coincide exactamente con la imagen original.
 dest=OUT/(key+'.png');sprite.save(dest)
 opacity=np.asarray(sprite)[:,:,3]>0;original=np.asarray(im.crop(box))
 assert np.array_equal(np.asarray(sprite)[opacity,:3],original[opacity,:3])
 mask_image=Image.new('RGBA',sprite.size,(255,255,255,0));mask_image.putalpha(sprite.getchannel('A'))
 mask_bytes=io.BytesIO();mask_image.save(mask_bytes,format='PNG')
 local_source='referencia-'+key+'.png';shutil.copyfile(source,OUT/local_source)
 browser_assets[key]={'src':'motor/'+local_source,'mask':'data:image/png;base64,'+base64.b64encode(mask_bytes.getvalue()).decode(),
  'crop':[box[0],box[1],box[2]-box[0],box[3]-box[1]],'width':sprite.width,'height':sprite.height}
 manifest[key]={'archivo_fuente':'../animaciones/'+s['file'],'sha256_fuente':hashlib.sha256(source.read_bytes()).hexdigest(),
  'fuente_local':'motor/'+local_source,'sprite_en_memoria':'motor/avatar-guillermo.js + motor/base.js','sha256_sprite':hashlib.sha256(dest.read_bytes()).hexdigest(),
  'region':box,'poligono_fuente':s['polygon'],'dimensiones':list(sprite.size),
  'transformacion':'Máscara alfa y recorte; RGB opaco idéntico; sin síntesis, retoque facial, cambio de ropa ni deformación.'}
(OUT/'procedencia-avatares.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(OUT/'avatar-guillermo.js').write_text('"use strict";\n/* Fuente original inalterada; máscara aplicada al dibujar, sin repintado. */\nconst ASTRA_AVATARES='+json.dumps(browser_assets,separators=(',',':'))+';\n')
print(json.dumps(manifest,ensure_ascii=False))
