"use strict";
/* Motor Canvas 1024×600. Conserva el contrato Escena/registrar del banco anterior.
 * El avatar es un recorte del original: solo traslación, rotación rígida y escala UNIFORME.
 * No cambia cara, ropa, pelo, colores, proporciones ni añade accesorios al personaje.
 * Tiempo absoluto y trayectorias deterministas: buscar un instante no cambia la historia.
 */
const W=1024,H=600;
const Astra=(()=>{
 const C={mint:'#63efc1',gold:'#ffd06a',rose:'#ff7394',blue:'#72b9ff',ink:'#070a0f',white:'#f6f3e9',dim:'#a4b0bb'};
 const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
 const lerp=(a,b,t)=>a+(b-a)*t;
 const phase=(t,a,b)=>clamp((t-a)/(b-a));
 const ease=k=>{k=clamp(k);return k*k*(3-2*k)};
 const move=(t,a,b)=>ease(phase(t,a,b));
 const mix=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
 const imgs={};
 function load(){return Promise.all(Object.entries(ASTRA_AVATARES).map(([key,v])=>new Promise((yes,no)=>{
  const im=new Image();im.onerror=()=>no(Error('No carga avatar '+key));im.onload=()=>{
   const mask=new Image();mask.onerror=()=>no(Error('No carga máscara '+key));mask.onload=()=>{
    const c=document.createElement('canvas');c.width=v.width;c.height=v.height;const cg=c.getContext('2d');
    cg.drawImage(im,...v.crop,0,0,v.width,v.height);cg.globalCompositeOperation='destination-in';cg.drawImage(mask,0,0);imgs[key]=c;yes();
   };mask.src=v.mask;
  };im.src=v.src;
 })));}
 function round(g,x,y,w,h,r=12){g.beginPath();g.roundRect(x,y,w,h,r);}
 function ellipse(g,x,y,rx,ry,color){g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();}
 function line(g,points,color,width=2){g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke();}
 function text(g,s,x,y,size=28,color=C.white,align='center',max=900){g.save();g.font=`800 ${size}px Arial, sans-serif`;g.textAlign=align;g.textBaseline='middle';g.fillStyle=color;g.fillText(s,x,y,max);g.restore();}
 function title(g,s,k=1,sub=''){g.save();g.globalAlpha*=clamp(k);text(g,s,512,65,39,C.white);if(sub)text(g,sub,512,108,17,C.dim);g.restore();}
 function badge(g,s,x,y,color=C.mint){g.save();g.font='800 24px Arial';const w=g.measureText(s).width+42;g.fillStyle='#101923';round(g,x-w/2,y-23,w,46,15);g.fill();g.strokeStyle=color;g.lineWidth=1.5;g.stroke();text(g,s,x,y,24,color);g.restore();}
 function glow(g,x,y,r,color,alpha=.18){g.save();const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,color);gr.addColorStop(1,'transparent');g.globalAlpha*=alpha;g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);g.restore();}
 function stage(g,{color=C.mint,floor=556}={}){
  g.save();const grd=g.createRadialGradient(512,floor,12,512,floor,500);grd.addColorStop(0,'#14222a');grd.addColorStop(.6,'#080e14');grd.addColorStop(1,'#000');g.fillStyle=grd;g.fillRect(0,140,W,H-140);
  line(g,[[95,floor+12],[929,floor+12]],'#27313a',1);ellipse(g,512,floor+15,365,17,'#0b1118');g.restore();
 }
 function shadow(g,x,y,rx=58,alpha=.6){ellipse(g,x,y,rx,rx*.14,`rgba(0,0,0,${alpha})`)}
 function platform(g,x,y,w=175,color=C.mint){g.save();shadow(g,x,y+11,w*.62,.8);g.fillStyle='#17212b';g.fillRect(x-w/2,y-12,w,15);ellipse(g,x,y+3,w/2,12,'#101820');ellipse(g,x,y-12,w/2,12,'#253541');g.strokeStyle=color;g.lineWidth=2;g.beginPath();g.ellipse(x,y-12,w/2,12,0,0,Math.PI*2);g.stroke();g.restore();}
 function avatar(g,x,y,h=350,{who='guillermo',rotate=0,alpha=1}={}){
  const im=imgs[who];if(!im)throw Error('Avatar no listo: '+who);
  const meta=ASTRA_AVATARES[who];const w=h*meta.width/meta.height;
  g.save();g.globalAlpha*=alpha;g.translate(x,y);g.rotate(rotate);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,-w/2,-h,w,h);g.restore();
  return{x:x-w/2,y:y-h,w,h,who};
 }
 function coaster(g,x,y,r=36,rotation=0,color=C.gold,depth=.3){g.save();g.translate(x,y);g.rotate(rotation);ellipse(g,0,4,r,r*depth,'#4b311a');ellipse(g,0,0,r,r*depth,color);g.strokeStyle='#fff1b6';g.lineWidth=2;g.beginPath();g.ellipse(0,0,r*.78,r*depth*.78,0,0,Math.PI*2);g.stroke();g.restore();}
 function glass(g,x,y,w=52,h=88,level=.6,color=C.gold){
  g.save();const top=y-h;g.fillStyle='rgba(133,187,205,.12)';g.beginPath();g.moveTo(x-w*.52,top);g.lineTo(x-w*.42,y);g.quadraticCurveTo(x,y+8,x+w*.42,y);g.lineTo(x+w*.52,top);g.closePath();g.fill();
  const ly=y-h*level;g.fillStyle=color;g.globalAlpha*=.75;g.beginPath();g.moveTo(x-w*.45,ly);g.lineTo(x-w*.4,y-3);g.quadraticCurveTo(x,y+2,x+w*.4,y-3);g.lineTo(x+w*.45,ly);g.closePath();g.fill();ellipse(g,x,ly,w*.45,5,'#ffe7a4');g.globalAlpha/=.75;
  g.strokeStyle='#a4d9e8';g.lineWidth=2;g.beginPath();g.moveTo(x-w*.52,top);g.lineTo(x-w*.42,y);g.quadraticCurveTo(x,y+8,x+w*.42,y);g.lineTo(x+w*.52,top);g.stroke();g.beginPath();g.ellipse(x,top,w*.52,6,0,0,Math.PI*2);g.stroke();line(g,[[x-w*.3,top+12],[x-w*.25,y-12]],'rgba(255,255,255,.55)',3);g.restore();
 }
 function table(g,x,y,w=220,color=C.gold){g.save();line(g,[[x,y+8],[x,y+113]],'#526472',11);ellipse(g,x,y+119,w*.22,10,'#263641');ellipse(g,x,y+8,w/2,20,'#3d2b20');const gr=g.createLinearGradient(0,y-20,0,y+10);gr.addColorStop(0,'#79573b');gr.addColorStop(1,'#34291f');ellipse(g,x,y,w/2,20,gr);g.strokeStyle=color;g.globalAlpha*=.35;g.lineWidth=1;g.beginPath();g.ellipse(x,y,w/2-4,17,0,Math.PI,Math.PI*2);g.stroke();g.restore();}
 function plate(g,x,y,r=52){ellipse(g,x,y+5,r,r*.26,'#758799');ellipse(g,x,y,r,r*.26,'#e3e9e8');g.strokeStyle='#b9c9cc';g.lineWidth=2;g.beginPath();g.ellipse(x,y,r*.72,r*.15,0,0,Math.PI*2);g.stroke();}
 function olive(g,x,y,r=13){const gr=g.createRadialGradient(x-r*.3,y-r*.4,1,x,y,r);gr.addColorStop(0,'#d9df75');gr.addColorStop(1,'#61732f');ellipse(g,x,y,r,r*.8,gr);ellipse(g,x+r*.3,y-r*.15,r*.23,r*.18,'#b34d39');}
 function ice(g,x,y,s=32,rot=0){g.save();g.translate(x,y);g.rotate(rot);g.fillStyle='rgba(132,219,244,.48)';round(g,-s/2,-s,s,s,5);g.fill();g.strokeStyle='#c3f3ff';g.lineWidth=2;g.stroke();line(g,[[-s*.3,-s*.78],[s*.24,-s*.78]],'white',3);g.restore();}
 function star(g,x,y,r=14,color=C.gold,rot=0){g.save();g.translate(x,y);g.rotate(rot);g.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2;const rr=i%2?r*.45:r;(i?g.lineTo:g.moveTo).call(g,Math.cos(a)*rr,Math.sin(a)*rr)}g.closePath();g.fillStyle=color;g.fill();g.restore();}
 function sparkles(g,t,x,y,count=14,color=C.gold,progress=0){if(progress<=0||progress>=1)return;g.save();g.globalAlpha*=Math.sin(progress*Math.PI);for(let i=0;i<count;i++){const a=i*2.399963,rr=30+progress*(65+(i%5)*10);star(g,x+Math.cos(a)*rr,y+Math.sin(a)*rr,2+(i%3),color,t+i)}g.restore();}
 function bell(g,x,y,r=35,tilt=0){g.save();g.translate(x,y);g.rotate(tilt);const gr=g.createLinearGradient(-r,0,r,0);gr.addColorStop(0,'#82551e');gr.addColorStop(.35,'#ffe3a1');gr.addColorStop(1,'#a8772b');g.fillStyle=gr;g.beginPath();g.ellipse(0,0,r,r*.82,0,Math.PI,0);g.lineTo(r,4);g.lineTo(-r,4);g.closePath();g.fill();ellipse(g,0,6,r+5,5,'#eab857');ellipse(g,0,-r*.82,6,4,'#ffe3a1');g.restore();}
 function bottle(g,x,y,h=146,tilt=0){g.save();g.translate(x,y);g.rotate(tilt);const gr=g.createLinearGradient(-28,0,28,0);gr.addColorStop(0,'#154a47');gr.addColorStop(.35,'#379886');gr.addColorStop(1,'#0a302e');g.fillStyle=gr;g.beginPath();g.moveTo(-11,-h);g.lineTo(11,-h);g.lineTo(11,-h+43);g.bezierCurveTo(11,-h+59,28,-h+61,28,-h+79);g.lineTo(28,-8);g.quadraticCurveTo(28,3,0,3);g.quadraticCurveTo(-28,3,-28,-8);g.lineTo(-28,-h+79);g.bezierCurveTo(-28,-h+61,-11,-h+59,-11,-h+43);g.closePath();g.fill();line(g,[[-17,-h+80],[-17,-18]],'#64c6b6',3);g.fillStyle='#dfe7d7';round(g,-23,-76,46,38,4);g.fill();text(g,'0,0',0,-56,17,'#28574c');g.restore();}
 function cork(g,x,y,rot=0,s=1){g.save();g.translate(x,y);g.rotate(rot);g.scale(s,s);g.fillStyle='#c69760';round(g,-10,-19,20,31,4);g.fill();line(g,[[-6,-10],[7,-7]],'#8d633d',2);ellipse(g,0,-19,10,4,'#e4bf83');g.restore();}
 function rail(g,x1,x2,y){line(g,[[x1,y],[x2,y]],'#31434f',7);line(g,[[x1,y-2],[x2,y-2]],'#8ba2ad',1);}
 return{C,clamp,lerp,phase,ease,move,mix,load,round,ellipse,line,text,title,badge,glow,stage,shadow,platform,avatar,coaster,glass,table,plate,olive,ice,star,sparkles,bell,bottle,cork,rail};
})();
class Escena{
 constructor(dur=10){this.t=0;this.dur=dur;this.events=new Set();this.ultimoAvatar=null;}
 get terminada(){return this.t>=this.dur;}
 actualizar(dt){if(!Number.isFinite(dt)||dt<0)throw Error('dt inválido');this.t=Math.min(this.dur,this.t+dt);}
 una(key,when,fn){if(when&&!this.events.has(key)){this.events.add(key);fn();}}
 dibujar(g){
  g.save();g.resetTransform();g.globalAlpha=1;g.globalCompositeOperation='source-over';g.fillStyle='#000';g.fillRect(0,0,W,H);
  if(this.t<=.08||this.t>=this.dur-.08){g.restore();return;}
  g.globalAlpha=Math.min(Astra.move(this.t,.08,.58),1-Astra.move(this.t,this.dur-.65,this.dur-.08));
  this.pintar(g);g.restore();
 }
 pintar(){throw Error('Escena sin pintar');}
}
