"use strict";
/* 00018 · La máquina de burbujas
 * Las burbujas de utilería pasan de cuadradas a redondas dentro del aro.
 * Misma burbuja, mismo tamaño y trayectoria; solo cambia su contorno.
 */
(()=>{const A=Astra;class Burbujas extends Escena{
 constructor(){super(11.7);}
 pintar(g){const t=this.t;A.stage(g,{color:A.C.blue});A.title(g,'LA MÁQUINA DE BURBUJAS',A.move(t,.4,1),'Salieron cuadradas. El aro lo arregla.');
  A.platform(g,267,555,160,A.C.blue);this.ultimoAvatar=A.avatar(g,267,543,348);
  g.fillStyle='#263e4b';A.round(g,475,414,93,116,14);g.fill();A.line(g,[[521,416],[521,330],[555,330]],'#819aa7',18);A.ellipse(g,561,330,6,15,'#121f29');A.text(g,'POMPAS',521,475,15,A.C.blue);
  A.line(g,[[705,407],[705,552]],'#365567',8);A.ellipse(g,705,554,47,8,'#1a2e3a');
  // Mitad trasera del aro detrás de las burbujas.
  g.strokeStyle='#447486';g.lineWidth=7;g.beginPath();g.ellipse(705,326,22,77,0,Math.PI*.5,Math.PI*1.5);g.stroke();
  for(let i=0;i<5;i++){const age=t-(1.3+i*1.05);if(age<0||age>5.7)continue;const x=560+age*68,y=330-Math.max(0,x-705)*.24,round=A.move(x,680,729)*18,alpha=Math.min(1,age/.35,1-A.phase(age,5,5.7));g.save();g.globalAlpha*=alpha;g.fillStyle='rgba(114,185,255,.08)';g.strokeStyle=[A.C.blue,A.C.mint,A.C.rose][i%3];g.lineWidth=2;A.round(g,x-18,y-18,36,36,Math.max(2,round));g.fill();g.stroke();A.ellipse(g,x-6,y-8,3,4,'#fff');g.restore();}
  g.strokeStyle=A.C.mint;g.lineWidth=5;g.beginPath();g.ellipse(705,326,22,77,0,-Math.PI*.5,Math.PI*.5);g.stroke();
  if(t>7)A.badge(g,'ASÍ, MEJOR',733,180,A.C.blue);
 }
}registrar({id:'00018',nombre:'La máquina de burbujas',crear:()=>new Burbujas()});})();
