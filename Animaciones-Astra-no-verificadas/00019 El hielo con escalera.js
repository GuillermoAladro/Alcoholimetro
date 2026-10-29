"use strict";
/* 00019 · El hielo con escalera
 * Cuatro saltos sobre peldaños, descanso elevado y salto final por encima del borde.
 * Las parábolas enlazan contactos precisos; el cubito termina parcialmente sumergido.
 */
(()=>{const A=Astra;const pts=[[562,440],[598,430],[643,402],[688,374],[733,346],[778,316],[838,434]];class Escalera extends Escena{
 constructor(){super(11.3);}
 pintar(g){const t=this.t,u=A.phase(t,1.2,8.2)*(pts.length-1),i=Math.min(pts.length-2,Math.floor(u)),q=u-i;let[x,y]=A.mix(pts[i],pts[i+1],q);y-=(i===5?95:42)*Math.sin(q*Math.PI);A.stage(g,{color:A.C.blue});A.title(g,'EL HIELO CON ESCALERA',A.move(t,.4,1),'Subir cuesta. Bajar es fácil.');
  A.platform(g,270,555,166,A.C.blue);this.ultimoAvatar=A.avatar(g,270,543,351);A.table(g,731,456,390,A.C.blue);
  for(let j=0;j<4;j++){const xx=576+j*45,yy=430-j*28;g.fillStyle=j%2?'#284554':'#325666';A.round(g,xx,yy,45,452-yy,3);g.fill();A.line(g,[[xx,yy],[xx+45,yy]],'#84bdd0',2);}
  A.line(g,[[778,452],[778,320]],'#477381',8);A.line(g,[[757,319],[799,319]],'#8fcee0',6);A.ice(g,x,y,26);A.glass(g,838,445,76,119,.28,'#77c3d4');
  if(t>8.2)A.badge(g,'ÚLTIMA PLANTA: VASO',716,187,A.C.blue);
 }
}registrar({id:'00019',nombre:'El hielo con escalera',crear:()=>new Escalera()});})();
