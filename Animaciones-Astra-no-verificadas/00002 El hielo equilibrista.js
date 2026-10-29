"use strict";
/* 00002 · El hielo equilibrista
 * Tres cubitos identificables siguen caminos continuos hasta el vaso.
 * La rampa curva conduce el último; no desaparecen al entrar en el cristal.
 */
(()=>{
 const A=Astra;
 class Hielo extends Escena{
  constructor(){super(10.6);}
  estado(i){const t=this.t,starts=[562,881,731],targets=[690,726,708],baseY=i===2?394:425;
   let x=A.lerp(starts[i],targets[i],A.move(t,1+i*.25,2.8+i*.25));let y=baseY;
   if(i===2)y=A.lerp(246,394,A.move(t,2,3.5));
   const start=[5.3,5.7,4.8][i],q=A.move(t,start,start+1.8);x=A.lerp(x,[806,840,823][i],q);y=A.lerp(y,[425,425,394][i],q)-238*Math.sin(q*Math.PI);
   return{x,y,rot:q<.99?q*.5*(i-1):0};}
  pintar(g){const t=this.t;A.stage(g,{color:A.C.blue});A.title(g,'EL HIELO EQUILIBRISTA',A.move(t,.4,1),'Tres cubitos. Una salida elegante.');
   A.platform(g,264,555,165,A.C.blue);this.ultimoAvatar=A.avatar(g,264,543,350);A.table(g,733,433,356,A.C.blue);
   A.line(g,[[570,240],[731,240],[731,343]],'#304a5a',3);
   for(let i=0;i<3;i++){const p=this.estado(i);A.ice(g,p.x,p.y,31,p.rot);}
   // El vaso transparente delante deja ver los cubitos en su interior.
   A.glass(g,823,433,94,107,0.23,'#7bd2e6');
   if(t>7.8){A.badge(g,'TODO BAJO CERO',713,216,A.C.blue);A.sparkles(g,t,823,386,12,A.C.blue,A.phase(t,7.8,9));}
  }
 }
 registrar({id:'00002',nombre:'El hielo equilibrista',crear:()=>new Hielo()});
})();
