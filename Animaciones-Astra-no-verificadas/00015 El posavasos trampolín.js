"use strict";
/* 00015 · El posavasos trampolín
 * Una gota cae, comprime una membrana y rebota hacia la boca del vaso.
 * Trayectoria por tramos con posiciones coincidentes en los dos impactos.
 */
(()=>{const A=Astra;class Trampolin extends Escena{
 constructor(){super(10.4);}
 estado(){const t=this.t;let x=634,y=211,visible=true;
  if(t<3.4){const q=A.phase(t,1.4,3.4);y=211+208*q*q;}
  else if(t<3.8){y=419+11*Math.sin(A.phase(t,3.4,3.8)*Math.PI);}
  else if(t<6.4){const q=A.phase(t,3.8,6.4);x=A.lerp(634,843,q);y=A.lerp(419,411,q)-230*4*q*(1-q);}
  else visible=false;return{x,y,visible};}
 pintar(g){const t=this.t,e=this.estado(),deform=Math.sin(A.phase(t,3.4,3.8)*Math.PI)*11;
  A.stage(g,{color:A.C.blue});A.title(g,'EL POSAVASOS TRAMPOLÍN',A.move(t,.4,1),'Un bote. Y dentro.');
  A.platform(g,276,555,166,A.C.blue);this.ultimoAvatar=A.avatar(g,276,543,351);A.table(g,731,447,356,A.C.blue);
  A.line(g,[[587,439],[587,430],[681,430],[681,439]],'#58727d',5);
  g.strokeStyle=A.C.blue;g.lineWidth=4;g.beginPath();g.moveTo(587,430);g.quadraticCurveTo(634,430+deform*2,681,430);g.stroke();
  if(e.visible){A.ellipse(g,e.x,e.y,8,11,'#98ebf3');A.ellipse(g,e.x-2,e.y-3,2.5,3,'white');}
  A.glass(g,843,438,74,112,t<6.4?.2:.22,'#5bbacb');
  if(t>6.4){A.sparkles(g,t,843,405,13,A.C.blue,A.phase(t,6.4,7.5));A.badge(g,'REBOTE PERFECTO',714,159,A.C.blue);}
 }
}registrar({id:'00015',nombre:'El posavasos trampolín',crear:()=>new Trampolin()});})();
