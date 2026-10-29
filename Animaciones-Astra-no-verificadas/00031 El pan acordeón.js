"use strict";
/* Las siete rebanadas conservan tamaño y orden. Tres láminas de relleno descienden
 * en huecos independientes y se desplazan con esos huecos al cerrar. */
(()=>{const A=Astra;class Pan extends Escena{
 constructor(){super(11.4);}
 pintar(g){const t=this.t,span=10+32*A.move(t,1.4,3.8)-16*A.move(t,6.8,8.6),fy=A.lerp(244,398,A.move(t,4.5,6.2));A.stage(g,{color:A.C.gold});A.title(g,'EL PAN ACORDEÓN',A.move(t,.4,1),'Abre sitio para el relleno.');A.platform(g,258,555,168,A.C.gold);this.ultimoAvatar=A.avatar(g,258,543,350);A.table(g,737,462,427);A.plate(g,737,446,181);A.rail(g,592,881,442);
  for(let i=0;i<7;i++){const x=737+(i-3)*span;g.fillStyle='#b97a36';A.round(g,x-10,358,20,84,10);g.fill();g.fillStyle='#f0d7a0';A.round(g,x-7,363,14,73,7);g.fill();A.ellipse(g,x-1,384,1.4,2,'#ccb47e');}
  for(let i=0;i<3;i++){const x=737+(i-1.5)*span;A.line(g,[[x,205],[x,fy-31]],'#4a5b61',1);g.fillStyle=['#f5c94d','#d74a3a','#73a64c'][i];A.round(g,x-3,fy-31,6,62,2);g.fill();}
  if(t>8.7)A.badge(g,'PAN, CON COMPAÑÍA',734,183,A.C.gold);
 }
}registrar({id:'00031',nombre:'El pan acordeón',crear:()=>new Pan()});})();
