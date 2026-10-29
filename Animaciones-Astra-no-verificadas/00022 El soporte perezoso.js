"use strict";
/* 00022 · El soporte perezoso
 * La tapa gira sobre la bisagra. Una servilleta llega desde un soporte visible.
 * Cierre pausado después de depositar la servilleta en el borde.
 */
(()=>{const A=Astra;class Soporte extends Escena{
 constructor(){super(10.8);}
 pintar(g){const t=this.t,open=A.move(t,1.3,3.1)*(1-A.move(t,6.5,8.1)),cloth=A.move(t,3.6,6.2);A.stage(g,{color:A.C.rose});A.title(g,'EL SOPORTE PEREZOSO',A.move(t,.4,1),'Una servilleta y a dormir.');
  A.platform(g,275,555,166,A.C.rose);this.ultimoAvatar=A.avatar(g,275,543,351);A.table(g,731,454,330,A.C.rose);
  g.fillStyle='#607a87';A.round(g,665,366,146,78,10);g.fill();g.fillStyle='#152630';A.round(g,675,370,126,18,5);g.fill();
  g.save();g.translate(665,371);g.rotate(-open*.9);g.fillStyle='#96b1bb';A.round(g,0,-8,147,14,6);g.fill();g.restore();
  const x=A.lerp(863,766,cloth),y=A.lerp(242,370,cloth);A.line(g,[[863,194],[863,240]],'#415e6c',3);
  g.fillStyle='#f2eee4';g.beginPath();g.moveTo(x-27,y-9);g.quadraticCurveTo(x,y+5+Math.sin(t*5)*(1-cloth)*8,x+27,y-9);g.lineTo(x+24,y+36);g.quadraticCurveTo(x,y+43,x-29,y+34);g.closePath();g.fill();A.line(g,[[x-18,y+15],[x+18,y+15]],'#c9d0cd',1);
  if(t>8.2)A.badge(g,'Z Z Z',729,198,A.C.rose);
 }
}registrar({id:'00022',nombre:'El soporte perezoso',crear:()=>new Soporte()});})();
