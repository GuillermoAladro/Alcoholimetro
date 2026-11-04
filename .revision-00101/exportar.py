from pathlib import Path
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
import base64, hashlib, io, json, os, shutil, subprocess

root = Path("Animaciones 2D").resolve()
scene_id = "00044.2"
stem = next((root / "escenas").glob(scene_id + " *.js")).stem
out = Path(os.environ["RUNNER_TEMP"]) / "export"
out.mkdir()
shutil.copyfile(Path(os.environ["RUNNER_TEMP"]) / "resultados-node.json",out / "resultados-node.json")
movie, sheet_path = out / (stem + ".mp4"), out / (stem + " - fotogramas.png")
times = [0,1.3,1.48,2.2,3.2,4.25,5.2,5.51,6.0,7.0,7.45,8.2,9.78,10.4,11.75,13.59]
sheet = Image.new("RGB", (960, 640), "#16181c")
draw = ImageDraw.Draw(sheet)
errors = []
with sync_playwright() as browser_api:
    chrome = shutil.which("google-chrome") or shutil.which("chromium")
    assert chrome, "Chromium no está disponible en el runner."
    browser = browser_api.chromium.launch(executable_path=chrome, args=["--no-sandbox", "--allow-file-access-from-files"])
    pg = browser.new_page(viewport={"width":1024,"height":600})
    pg.on("pageerror", lambda err: errors.append(str(err)))
    original_id = scene_id.split(".")[0]
    pg.goto((root / "ver.html").as_uri() + "?id=" + original_id + "&pausa")
    pg.wait_for_function("window.A2D && A2D.listo() && Recortes.listos()")
    assert pg.locator("#escena").input_value() == original_id
    pg.locator("#bucle").uncheck()
    pg.locator("#play").click()
    pg.wait_for_function("document.querySelector('#play').textContent === 'Play' && parseFloat(document.querySelector('#tiempo').textContent) >= A2D.dur() - 0.01", timeout=60000)
    print("El visor ha reproducido el original", original_id, pg.locator("#tiempo").inner_text())
    pg.goto((root / "ver.html").as_uri() + "?id=" + scene_id + "&pausa")
    pg.wait_for_function("window.A2D && A2D.listo() && Recortes.listos()")
    assert pg.locator("#escena").input_value() == scene_id
    def frame(t):
        return base64.b64decode(pg.evaluate("(t) => {A2D.cuadro(t);return document.querySelector('#lienzo').toDataURL('image/png').split(',')[1]}", t))
    dur = pg.evaluate("A2D.dur()")
    assert abs(dur - 13.6) < 1e-8
    for index, t in enumerate(times):
        pic = Image.open(io.BytesIO(frame(t))).convert("RGB")
        if index in [0,len(times)-1]:
            assert pic.getbbox() is None
        else:
            assert pic.getbbox(), ("Fotograma vacío", t)
        x, y = index%4*240, index//4*160
        sheet.paste(pic.resize((240,141),Image.Resampling.LANCZOS),(x,y))
        draw.text((x+5,y+143),f"{t:.2f} s",fill="#ddd")
    # La lámina se completará con las imágenes decodificadas del MP4.
    probes = [dur*.25,dur*.5,dur*.75]
    initial = [hashlib.sha256(frame(t)).digest() for t in probes]
    assert len(set(initial)) == 3
    assert initial == list(reversed([hashlib.sha256(frame(t)).digest() for t in reversed(probes)]))
    ff = subprocess.Popen(["ffmpeg","-y","-hide_banner","-loglevel","error","-f","image2pipe","-framerate","60","-c:v","png","-i","pipe:0","-an","-c:v","libx264","-preset","veryfast","-crf","23","-maxrate","780k","-bufsize","900k","-threads","3","-pix_fmt","yuv420p","-movflags","+faststart",str(movie)], stdin=subprocess.PIPE)
    n = round(dur*60)
    try:
        for i in range(n):
            png = frame(i/60)
            if i/60 <= .12 or i/60 >= dur-.12:
                assert Image.open(io.BytesIO(png)).convert("RGB").getbbox() is None
            ff.stdin.write(png)
    finally:
        ff.stdin.close()
        ret = ff.wait()
    assert ret == 0
    pg.locator("#barra").evaluate("(el) => {el.value='500';el.dispatchEvent(new Event('input'))}")
    pg.wait_for_function("document.querySelector('#tiempo').textContent.includes('6.80')")
    pg.locator("#reinicio").click()
    pg.wait_for_function("document.querySelector('#tiempo').textContent.startsWith('0.00')")
    assert not errors, errors
    # Reproducción HTML del MP4 que se acaba de codificar, hasta recibir el evento ended.
    player = browser.new_page()
    player.goto((root / "ver.html").as_uri() + "?id=" + scene_id + "&pausa")
    video_info = player.evaluate("""async src => {
        const v=document.createElement('video'); v.muted=true; v.playsInline=true;
        document.body.replaceChildren(v); v.src=src;
        const ended=new Promise((ok,bad)=>{const tm=setTimeout(()=>bad(Error('Tiempo de reproducción excedido')),45000);
          v.onended=()=>{clearTimeout(tm);ok()};v.onerror=()=>{clearTimeout(tm);bad(Error('No se pudo leer el MP4'))}});
        v.playbackRate=3;await v.play();await ended;
        return [v.videoWidth,v.videoHeight,v.duration,v.getVideoPlaybackQuality().totalVideoFrames];
    }""",movie.as_uri())
    assert video_info[:2] == [1024,600] and abs(video_info[2]-dur) < .025 and video_info[3] > 0, video_info
    print("MP4 reproducido hasta el final en Chromium",video_info)
    player.close()
    browser.close()
subprocess.run(["ffmpeg","-v","error","-xerror","-i",str(movie),"-f","null","-"],check=True)
stream = json.loads(subprocess.check_output(["ffprobe","-v","error","-of","json","-show_entries","stream=codec_name,width,height,r_frame_rate,nb_frames",str(movie)]))["streams"][0]
assert (stream["codec_name"],stream["width"],stream["height"],stream["r_frame_rate"],int(stream["nb_frames"])) == ("h264",1024,600,"60/1",n)
print(json.dumps(stream))
# Cotejar los fotogramas decodificados del MP4 con los mismos instantes del visor.
for index, seconds in enumerate(times):
    frame_number = min(n-1, round(seconds*60))
    raw = subprocess.check_output(["ffmpeg","-v","error","-ss",f"{frame_number/60:.9f}","-i",str(movie),
                                  "-frames:v","1","-f","rawvideo","-pix_fmt","rgb24","pipe:1"])
    visual = Image.frombytes("RGB",(1024,600),raw)
    if index in (0,len(times)-1):
        assert visual.getbbox() is None, ("El negro no se conserva en el MP4",frame_number)
    else:
        assert visual.getbbox(), ("Fotograma decodificado vacío",frame_number)
    sheet.paste(visual.resize((240,141),Image.Resampling.LANCZOS),(index%4*240,index//4*160))
sheet.save(sheet_path)
# Fotogramas del giro de Guillermo cotejados con el MP4
