from pathlib import Path
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
import base64, io
root=Path("Animaciones 2D").resolve()
times=[0,.8,1.4,2.5,3.6,4.9,5.7,6.5,7.3,8.2,9,10,11,12,13,13.99]
sheet=Image.new("RGB",(960,640),"#16181c");draw=ImageDraw.Draw(sheet);errors=[]
with sync_playwright() as api:
    b=api.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox","--allow-file-access-from-files"])
    p=b.new_page(viewport={"width":1024,"height":600});p.on("pageerror",lambda e:errors.append(str(e)))
    p.goto((root/"ver.html").as_uri()+"?id=00045&pausa");p.wait_for_function("window.A2D&&A2D.listo()&&Recortes.listos()")
    assert p.locator("#escena").input_value()=="00045";p.locator("#bucle").uncheck();p.locator("#play").click()
    p.wait_for_function("document.querySelector('#play').textContent==='Play'&&parseFloat(document.querySelector('#tiempo').textContent)>=A2D.dur()-.01",timeout=60000)
    assert abs(p.evaluate("A2D.dur()")-14)<1e-8
    for i,t in enumerate(times):
        raw=base64.b64decode(p.evaluate("(t)=>{A2D.cuadro(t);return document.querySelector('#lienzo').toDataURL('image/png').split(',')[1]}",t))
        im=Image.open(io.BytesIO(raw)).convert("RGB");assert (im.getbbox() is None)==(i in [0,len(times)-1])
        x,y=i%4*240,i//4*160;sheet.paste(im.resize((240,141),Image.Resampling.LANCZOS),(x,y));draw.text((x+5,y+143),f"{t:.2f} s",fill="#ddd")
    assert not errors,errors;b.close()
out=Path(".revision-00101/base-00045.png");out.parent.mkdir(exist_ok=True);sheet.save(out)
