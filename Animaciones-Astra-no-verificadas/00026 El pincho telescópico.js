"use strict";
/* Los soportes se retiran tras atravesar los ingredientes. El pincho se contrae
 * y el conjunto desciende con el mismo actuador hasta la rebanada. */
(()=>{const A=Astra;class Pincho extends Escena{
 constructor(){super(11.4);}
 pintar(g){const t=this.t,collect=A.move(t,1.3,4.1),pack=A.move(t,4.8,6.8),lower=A.move(t,7.1,8.6),y=336+76*lower,tip=A.lerp(552,850,collect)-120*pack;
  A.stage(g,{color:A.C.mint});A.title(g,'EL PINCHO TELESCÓPICO',A.move(t,.4,1),'Tres ingredientes. Un solo viaje.');A.platform(g,267,555,168);this.ultimoAvatar=A.avatar(g,267,543,352);A.table(g,721,460,414);A.plate(g,660,445,97);
  A.ellipse(g,660,441,70,14,'#aa6b32');A.ellipse(g,660,436,66,12,'#efcc89');
  for(let i=0;i<3;i++){const xx=650+i*80,down=A.move(t,4.2,4.7);A.line(g,[[xx,441],[xx,355+70*down]],'#415e67',5);A.line(g,[[xx-20,355+70*down],[xx+20,355+70*down]],'#698891',4);}
  A.line(g,[[534,447],[534,y]],'#426574',12);A.line(g,[[534,y],[tip,y]],'#dfc48c',5);A.line(g,[[tip-8,y-5],[tip,y],[tip-8,y+5]],'#dfc48c',2);
  for(let i=0;i<3;i++){const xx=A.lerp(650+i*80,620+i*40,pack);if(i===0){g.fillStyle='#f3cf64';A.round(g,xx-18,y-17,36,34,3);g.fill();A.ellipse(g,xx-5,y-5,4,4,'#c99735');}if(i===1){A.ellipse(g,xx,y,19,18,'#d94939');A.ellipse(g,xx-6,y-7,4,3,'#f5a17e');}if(i===2)A.olive(g,xx,y,18);}
  if(t>8.7)A.badge(g,'TODO EN SU SITIO',718,207,A.C.mint);
 }
}registrar({id:'00026',nombre:'El pincho telescópico',crear:()=>new Pincho()});})();
