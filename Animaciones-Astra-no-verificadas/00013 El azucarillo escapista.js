"use strict";
/* 00013 · El azucarillo escapista
 * El cubo sigue el centro del canal. Los giros se hacen antes del siguiente tramo.
 * La salida desemboca por encima de la taza, sin atravesar su pared.
 */
(()=>{const A=Astra;const points=[[562,285],[665,285],[665,333],[595,333],[595,379],[746,379],[746,285],[849,285],[849,429]];
class Azucar extends Escena{
 constructor(){super(11);}
 posicion(){const u=A.move(this.t,1.3,7.4)*(points.length-1),i=Math.min(points.length-2,Math.floor(u));return A.mix(points[i],points[i+1],u-i);}
 pintar(g){const t=this.t,[x,y]=this.posicion();A.stage(g,{color:A.C.rose});A.title(g,'EL AZUCARILLO ESCAPISTA',A.move(t,.4,1),'La salida estaba en la taza.');
  A.platform(g,276,555,166,A.C.rose);this.ultimoAvatar=A.avatar(g,276,543,349);A.table(g,724,456,363,A.C.rose);
  A.line(g,points,'#3b505d',27);A.line(g,points,'#12232e',19);A.line(g,[[562,285],[562,449]],'#3b505d',5);A.line(g,[[746,379],[746,449]],'#3b505d',5);
  g.fillStyle='#fbf4df';A.round(g,x-8,y-8,16,16,3);g.fill();A.line(g,[[x-5,y-4],[x+4,y-4]],'#fff',2);
  A.glass(g,849,443,67,71,.45,'#9c7350');if(t>7.5)A.badge(g,'DULCE LIBERTAD',716,187,A.C.rose);
 }
}registrar({id:'00013',nombre:'El azucarillo escapista',crear:()=>new Azucar()});})();
