"use strict";
/* 00006 · La pajita periscopio
 * Dos tramos telescópicos conservan longitud y articulación.
 * El desplazamiento de Guillermo se realiza sobre un carrito visible.
 */
(()=>{
 const A=Astra;
 class Pajita extends Escena{
  constructor(){super(10.8);}
  pintar(g){const t=this.t,x=A.lerp(304,463,A.move(t,4.4,6.4)),extend=A.move(t,1.2,3.2)*(1-A.move(t,7.2,8.6)),top=355-114*extend;
   A.stage(g,{color:A.C.blue});A.title(g,'LA PAJITA PERISCOPIO',A.move(t,.4,1),'Te estaba buscando.');
   A.rail(g,190,580,570);A.platform(g,x,555,156,A.C.blue);A.ellipse(g,x-45,566,9,9,'#8fa6b3');A.ellipse(g,x+45,566,9,9,'#8fa6b3');
   this.ultimoAvatar=A.avatar(g,x,543,341);A.table(g,740,454,230,A.C.blue);
   // Tramo dentro del vaso detrás del cristal.
   A.line(g,[[742,438],[742,top]],'#f9c867',11);A.line(g,[[742,top],[681,top]],'#f9c867',11);
   A.line(g,[[744,438],[744,top+5]],'#fff1ab',3);A.glass(g,740,447,78,112,.58,'#65c8ce');
   A.ellipse(g,677,top,8,9,'#1b343e');A.ellipse(g,675,top-2,3,4,A.C.blue);
   if(t>6.4&&t<8.8)A.badge(g,'¡AHÍ ESTÁS!',698,171,A.C.blue);
  }
 }
 registrar({id:'00006',nombre:'La pajita periscopio',crear:()=>new Pajita()});
})();
