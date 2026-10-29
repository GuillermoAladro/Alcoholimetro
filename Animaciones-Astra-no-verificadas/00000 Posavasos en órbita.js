"use strict";
/* 00000 · Posavasos en órbita
 * Dos vueltas completas, salida tangente y aterrizaje bajo el vaso.
 * La mitad posterior se dibuja detrás del avatar; la anterior delante.
 * El vaso solo baja cuando el posavasos ya está apoyado. Negro → negro.
 */
(()=>{
 const A=Astra;
 class Orbita extends Escena{
  constructor(){super(10.5);}
  estado(){const t=this.t,k=A.phase(t,1.1,5.6),a=-Math.PI/2+k*Math.PI*4;
   let x=345+156*Math.cos(a),y=399+51*Math.sin(a),back=Math.sin(a)<0;
   if(t>5.6){const q=A.move(t,5.6,7.15);x=A.lerp(345,732,q);y=A.lerp(348,422,q)-80*Math.sin(q*Math.PI);back=x<450;}
   return{x,y,back,glassY:A.lerp(276,417,A.move(t,7.2,8.05))};}
  pintar(g){const t=this.t,e=this.estado();A.stage(g);A.title(g,'POSAVASOS EN ÓRBITA',A.move(t,.5,1),'Una vuelta más. Y aparcado.');
   A.glow(g,345,398,210,A.C.mint,.13);A.table(g,732,429,228);A.platform(g,345,555,168);A.shadow(g,345,546,61);
   g.save();g.strokeStyle='#25433e';g.setLineDash([3,11]);g.lineWidth=1;g.beginPath();g.ellipse(345,399,156,51,0,0,Math.PI*2);g.stroke();g.restore();
   if(e.back)A.coaster(g,e.x,e.y,36,0,A.C.mint);
   this.ultimoAvatar=A.avatar(g,345,543,357);
   if(!e.back)A.coaster(g,e.x,e.y,36,0,A.C.mint);
   A.line(g,[[732,154],[732,e.glassY-86]],'#60717a',2);A.glass(g,732,e.glassY,51,86,.57);
   if(t>8.05){A.badge(g,'¡CLAVADO!',732,223);A.sparkles(g,t,732,414,18,A.C.mint,A.phase(t,8.05,9.2));}
  }
 }
 registrar({id:'00000',nombre:'Posavasos en órbita',crear:()=>new Orbita()});
})();
