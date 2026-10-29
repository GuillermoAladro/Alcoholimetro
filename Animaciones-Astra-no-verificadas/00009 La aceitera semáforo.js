"use strict";
/* 00009 · La aceitera semáforo
 * Tres gotas se forman en tres boquillas; solo caen con la luz verde.
 * Cada gota se consume en su propia mancha, sin duplicación de materia.
 */
(()=>{const A=Astra;class Aceitera extends Escena{
 constructor(){super(10.4);}
 pintar(g){const t=this.t;A.stage(g,{color:A.C.gold});A.title(g,'LA ACEITERA SEMÁFORO',A.move(t,.4,1),'Rojo. Ámbar. A la tostada.');
  A.platform(g,278,555,166,A.C.gold);this.ultimoAvatar=A.avatar(g,278,543,353);A.table(g,729,448,313);
  A.plate(g,729,442,111);g.fillStyle='#ad743b';A.round(g,651,400,156,37,14);g.fill();g.fillStyle='#f0c87f';A.round(g,659,404,140,25,11);g.fill();
  g.fillStyle='#24343b';A.round(g,662,207,134,48,14);g.fill();A.line(g,[[668,252],[668,280],[689,280],[689,311]],'#7f9c87',9);A.line(g,[[729,252],[729,311]],'#7f9c87',9);A.line(g,[[788,252],[788,280],[769,280],[769,311]],'#7f9c87',9);
  const green=t>=4.2;for(let i=0;i<3;i++){const on=green?i===2:(t<2.8?i===0:i===1);A.ellipse(g,688+i*41,231,11,11,on?[A.C.rose,A.C.gold,A.C.mint][i]:'#101b21');}
  for(let i=0;i<3;i++){const start=4.2+i*.7,q=A.phase(t,start,start+.65),x=689+i*40;if(q<1){const r=7*A.move(t,1.1+i*.4,2+i*.4);A.ellipse(g,x,315+100*q*q,r,r*1.3,A.C.gold);}else A.ellipse(g,x,415,12,4,'#c49a39');}
  if(t>6.5)A.badge(g,'TRÁFICO FLUIDO',731,160,A.C.gold);
 }
}registrar({id:'00009',nombre:'La aceitera semáforo',crear:()=>new Aceitera()});})();
