"use strict";
/* 00011 · La bandeja niveladora
 * Tres vasos permanecen verticales sobre soportes articulados.
 * La bandeja se nivela moviendo sus dos patas; el líquido nunca gira con ella.
 */
(()=>{const A=Astra;class Nivel extends Escena{
 constructor(){super(11);}
 pintar(g){const t=this.t,q=A.move(t,1.3,4.5),fix=A.move(t,5,7.7),angle=(.13*Math.sin(q*Math.PI*2)+.09*q)*(1-fix),cx=730,cy=429;
  A.stage(g,{color:A.C.blue});A.title(g,'LA BANDEJA NIVELADORA',A.move(t,.4,1),'Los vasos, siempre verticales.');
  A.platform(g,278,555,166,A.C.blue);this.ultimoAvatar=A.avatar(g,278,543,351);
  const leftY=cy-143*Math.sin(angle),rightY=cy+143*Math.sin(angle);A.line(g,[[587,554],[587,leftY]],'#46616f',12);A.line(g,[[873,554],[873,rightY]],'#46616f',12);
  A.ellipse(g,587,556,38,7,'#1b2c35');A.ellipse(g,873,556,38,7,'#1b2c35');
  g.save();g.translate(cx,cy);g.rotate(angle);g.fillStyle='#6b8593';A.round(g,-169,-5,338,12,5);g.fill();g.restore();
  for(let i=0;i<3;i++){const local=-102+i*102,x=cx+local*Math.cos(angle),y=cy+local*Math.sin(angle);A.ellipse(g,x,y-4,27,6,'#d0dde0');A.glass(g,x,y-8,41,70,.57);}
  if(t>7.7)A.badge(g,'NIVEL EXPERTO',729,225,A.C.blue);
 }
}registrar({id:'00011',nombre:'La bandeja niveladora',crear:()=>new Nivel()});})();
