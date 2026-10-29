"use strict";
/* 00021 · La taza sobre raíles
 * La taza llega en un carro; una cucharilla le sigue en un segundo vagón.
 * Ambos frenan antes de tocarse. La taza no flota ni arrastra el líquido.
 */
(()=>{const A=Astra;class Taza extends Escena{
 constructor(){super(10.6);}
 pintar(g){const t=this.t,cup=A.lerp(824,608,A.move(t,1.3,4)),spoon=A.lerp(923,711,A.move(t,4.2,7.2));A.stage(g,{color:A.C.gold});A.title(g,'LA TAZA SOBRE RAÍLES',A.move(t,.4,1),'Faltaba la cucharilla.');
  A.platform(g,272,555,166,A.C.gold);this.ultimoAvatar=A.avatar(g,272,543,352);A.table(g,745,457,450);A.rail(g,538,966,441);
  for(const x of[cup,spoon]){g.fillStyle='#27434c';A.round(g,x-40,417,80,14,5);g.fill();A.ellipse(g,x-26,438,8,8,'#a1b6bf');A.ellipse(g,x+26,438,8,8,'#a1b6bf');}
  A.glass(g,cup,413,57,79,.65,'#a4774e');A.line(g,[[cup+28,349],[cup+46,349],[cup+46,386],[cup+28,386]],'#abc9cf',5);
  A.line(g,[[spoon-22,410],[spoon+15,405]],'#b8ccd1',7);A.ellipse(g,spoon+24,403,15,8,'#dce8e8');
  if(t>7.4)A.badge(g,'SERVICIO COMPLETO',725,211,A.C.gold);
 }
}registrar({id:'00021',nombre:'La taza sobre raíles',crear:()=>new Taza()});})();
