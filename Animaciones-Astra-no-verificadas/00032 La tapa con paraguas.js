"use strict";
/* Tres gotas se desvían a platillos laterales. La cuarta cae cuando la cubierta
 * ya está cerrada; trayectorias enlazadas, sin gotas que desaparezcan al impactar. */
(()=>{const A=Astra;class Paraguas extends Escena{
 constructor(){super(11.3);}
 pintar(g){const t=this.t,close=A.move(t,5.6,6.6);A.stage(g,{color:A.C.rose});A.title(g,'LA TAPA CON PARAGUAS',A.move(t,.4,1),'Solo quería una gota.');A.platform(g,257,555,165,A.C.rose);this.ultimoAvatar=A.avatar(g,257,543,352);A.table(g,730,464,413);A.plate(g,712,445,83);A.plate(g,590,445,33);A.plate(g,834,445,33);
  g.fillStyle='#a8703a';A.round(g,677,416,70,24,8);g.fill();g.fillStyle='#e4ba70';A.round(g,680,411,64,20,8);g.fill();A.line(g,[[759,440],[759,270]],'#9bb7ba',4);
  const cx=712+47*close,r=88*(1-close)+6;g.fillStyle='#bc4b70';g.beginPath();g.moveTo(cx-r,300);g.quadraticCurveTo(cx,239+49*close,cx+r,300);g.lineTo(cx+r*.5,291);g.lineTo(cx,301);g.lineTo(cx-r*.5,291);g.closePath();g.fill();A.line(g,[[759,270],[cx,270]],'#9bb7ba',3);
  for(let i=0;i<3;i++){const age=t-(1.5+i*.65),startX=653+i*59,side=i===2?1:-1,hitY=270+30*Math.pow((startX-712)/88,2);if(age<0)continue;let x=startX,y;if(age<1.1)y=A.lerp(190,hitY,A.phase(age,0,1.1));else if(age<1.5){const p=A.move(age,1.1,1.5);x=A.lerp(startX,712+side*93,p);y=A.lerp(hitY,306,p);}else if(age<2.1){const p=A.move(age,1.5,2.1);x=A.lerp(712+side*93,712+side*122,p);y=A.lerp(306,439,p);}else{x=712+side*122;y=440;}A.ellipse(g,x,y,age>=2.1?10:4,age>=2.1?3:7,'#c1593c');}
  if(t>=7){const p=A.move(t,7,8.3);A.ellipse(g,712,A.lerp(191,410,p),t>=8.3?12:5,t>=8.3?4:8,'#c1593c');}if(t>8.5)A.badge(g,'LA JUSTA',720,175,A.C.rose);
 }
}registrar({id:'00032',nombre:'La tapa con paraguas',crear:()=>new Paraguas()});})();
