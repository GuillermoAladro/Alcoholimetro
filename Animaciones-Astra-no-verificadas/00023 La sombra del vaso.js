"use strict";
/* 00023 · La sombra del vaso
 * Luz en movimiento; vaso inmóvil. La longitud de la sombra depende de la altura de la luz.
 * La sombra se pinta sobre el tablero y queda por detrás del vaso real.
 */
(()=>{const A=Astra;class Sombra extends Escena{
 constructor(){super(10.5);}
 pintar(g){const t=this.t,k=A.move(t,1.5,5.7)*(1-A.move(t,7.1,8.6)),lx=A.lerp(598,657,k),ly=A.lerp(225,319,k),objX=731,floor=440,top=355;
  A.stage(g,{color:A.C.gold});A.title(g,'LA SOMBRA DEL VASO',A.move(t,.4,1),'El vaso no ha crecido.');A.platform(g,267,555,166,A.C.gold);this.ultimoAvatar=A.avatar(g,267,543,351);A.table(g,733,446,390);
  // Proyección 2D del borde superior sobre el plano del tablero.
  const end=Math.min(905,objX+(objX-lx)*(floor-top)/(top-ly));g.fillStyle='#101819';g.beginPath();g.moveTo(objX-20,floor-5);g.lineTo(end,floor-11);g.lineTo(end,floor+11);g.lineTo(objX-20,floor+6);g.closePath();g.fill();
  A.glass(g,objX,439,52,84,0);A.line(g,[[565,444],[565,201],[lx,ly]],'#5b717c',5);A.ellipse(g,lx,ly,14,14,'#dac484');A.glow(g,lx,ly,38,A.C.gold,.35);
  if(t>6)A.badge(g,'ERA LA LUZ',729,173,A.C.gold);
 }
}registrar({id:'00023',nombre:'La sombra del vaso',crear:()=>new Sombra()});})();
