"use strict";
/* 00007 · La gota puntual
 * La gota recorre el borde, se desprende y cae por gravedad al posavasos.
 * Después del impacto se convierte en la mancha, nunca en dos objetos.
 */
(()=>{
 const A=Astra;
 class Gota extends Escena{
  constructor(){super(10);}
  pintar(g){const t=this.t,q=A.move(t,1.1,3.8),drop=A.phase(t,4,5.05),cx=A.lerp(566,790,A.move(t,4.15,4.94));
   A.stage(g,{color:A.C.blue});A.title(g,'LA GOTA PUNTUAL',A.move(t,.4,1),'Justo antes de tocar la mesa.');
   A.platform(g,286,555,168,A.C.blue);this.ultimoAvatar=A.avatar(g,286,543,353);A.table(g,721,437,340,A.C.blue);A.glass(g,741,357,93,133,.79,'#86d4dd');
   // Vaso sostenido por una repisa: no queda suspendido sin apoyo.
   A.line(g,[[692,363],[793,363],[810,395],[810,435]],'#50626d',5);A.coaster(g,cx,429,38,0,A.C.blue);
   if(t<5.05){const a=Math.PI*1.5+q*Math.PI*.5;const x=t<4?741+49*Math.cos(a):790;const y=t<4?224+7*Math.sin(a):224+(429-224)*drop*drop;
    A.ellipse(g,x,y,7,10,'#9fe8f3');A.ellipse(g,x-2,y-3,2,3,'#fff');
   }else{A.ellipse(g,790,428,13,4,'#68d5e7');const s=A.phase(t,5.05,5.7);if(s<1){g.save();g.globalAlpha*=1-s;g.strokeStyle=A.C.blue;g.lineWidth=2;g.beginPath();g.ellipse(790,428,13+34*s,4+10*s,0,0,Math.PI*2);g.stroke();g.restore();}}
   if(t>5.3)A.badge(g,'NI UNA FUERA',727,154,A.C.blue);
  }
 }
 registrar({id:'00007',nombre:'La gota puntual',crear:()=>new Gota()});
})();
