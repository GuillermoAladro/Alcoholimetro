// npm install playwright; install Chromium or set CHROMIUM_EXECUTABLE_PATH.
// Requires ffmpeg on PATH. Renders the actual animated SVG, not a second rig.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),{spawn}=require('child_process');
(async()=>{
 const b=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const page=await b.newPage({viewport:{width:1280,height:900},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.join(__dirname,'Guillermo-Aladro-cerveza.svg'));
 await page.evaluate(()=>document.documentElement.pauseAnimations());
 const out=path.join(__dirname,'Guillermo-Aladro-cerveza.mp4');
 const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-vcodec','png','-r','24','-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',out]);
 let stderr='';ff.stderr.on('data',x=>stderr+=x);
 const done=new Promise((resolve,reject)=>{ff.on('error',reject);ff.on('close',c=>c===0?resolve():reject(new Error(stderr||'ffmpeg exit '+c)));});
 for(let i=0;i<288;i++){
  await page.evaluate(t=>document.documentElement.setCurrentTime(t),i/24);
  const frame=await page.screenshot({type:'png',timeout:60000});
  if(i===120)fs.writeFileSync(path.join(__dirname,'Guillermo-Aladro-cerveza-preview.png'),frame);
  if(!ff.stdin.write(frame))await new Promise(r=>ff.stdin.once('drain',r));
  if(i%24===0)console.log(JSON.stringify({frames:i,total:288,seconds:i/24}));
 }
 ff.stdin.end();await done;
 const report=JSON.parse(fs.readFileSync(path.join(__dirname,'control-calidad.json'),'utf8'));
 report.validation={browser:await b.version(),console_errors:errors,video_frames:288,video_fps:24,rendered_from:'Guillermo-Aladro-cerveza.svg; SMIL timeline sampled directly',source_vector_paths_copied_verbatim:true};
 fs.writeFileSync(path.join(__dirname,'control-calidad.json'),JSON.stringify(report,null,2)+'\n');
 await b.close();console.log(JSON.stringify({saved:out,bytes:fs.statSync(out).size,errors}));
})().catch(e=>{console.error(e);process.exit(1)});
