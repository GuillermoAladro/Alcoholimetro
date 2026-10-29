"use strict";
/* 00008 · El mantel viajero
 * Vajilla transportada por carriles; el mantel se enrolla detrás de ella.
 * Cada plato tiene un puesto fijo, viaja por un lado distinto y regresa.
 */
(()=>{const A=Astra;class Mantel extends Escena{
 constructor(){super(11.3);}
 pintar(g){const t=this.t,p=A.move(t,1.5,5.7),back=A.move(t,6,8.8),travel=p*(1-back);
  A.stage(g,{color:A.C.rose});A.title(g,'EL MANTEL VIAJERO',A.move(t,.4,1),'La mesa se recoge sola.');
  this.ultimoAvatar=A.avatar(g,512,552,360);A.table(g,512,432,796,A.C.rose);
  // Tela apoyada: anchura variable porque se enrolla, no porque se estire.
  const left=174+600*travel;g.fillStyle='#a94765';g.beginPath();g.moveTo(left,417);g.lineTo(850,417);g.lineTo(850,445);g.lineTo(left,445);g.closePath();g.fill();
  A.ellipse(g,left,431,10,21,'#dd7591');A.ellipse(g,left,431,4,12,'#7d3453');
  A.rail(g,155,870,453);A.rail(g,155,870,395);
  for(let i=0;i<3;i++){const origin=244+i*255;const x=origin+Math.sin(travel*Math.PI)*(i-1)*72;const y=430+(i%2?1:-1)*35*Math.sin(travel*Math.PI);
   A.plate(g,x,y,48);A.olive(g,x,y-10,13);A.line(g,[[x,y+11],[x,453]],'#697a83',2);}
  if(t>8.8)A.badge(g,'TODO EN SU SITIO',512,162,A.C.rose);
 }
}registrar({id:'00008',nombre:'El mantel viajero',crear:()=>new Mantel()});})();
