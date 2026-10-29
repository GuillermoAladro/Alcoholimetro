"use strict";
/* 00005 · La campana impaciente
 * La campana grande salta y vuelve a su base en cada golpe.
 * Una segunda emerge desde un cajón visible y responde con su onda menor.
 */
(()=>{
 const A=Astra;
 class Campana extends Escena{
  constructor(){super(10.5);}
  pintar(g){const t=this.t;A.stage(g,{color:A.C.gold});A.title(g,'LA CAMPANA IMPACIENTE',A.move(t,.4,1),'Una respuesta a su medida.');
   A.platform(g,294,555,166,A.C.gold);this.ultimoAvatar=A.avatar(g,294,543,354);A.table(g,707,438,325);
   let jump=0;for(const start of[1.5,2.5,3.5]){const q=A.phase(t,start,start+.65);if(q>0&&q<1)jump=33*Math.sin(q*Math.PI);}
   A.ellipse(g,695,435,52,10,'#18242b');A.bell(g,695,428-jump,45,Math.sin(t*18)*jump*.001);
   const small=A.move(t,4.9,6);g.fillStyle='#26333b';A.round(g,797,448,79,46,8);g.fill();g.fillStyle='#0a1015';A.round(g,803,452,67,27,4);g.fill();
   A.line(g,[[836,476],[836,467-57*small]],'#617a84',4);A.bell(g,836,470-57*small,20);
   for(const [when,x,y,r,color] of[[1.8,695,400,45,A.C.gold],[2.8,695,400,45,A.C.gold],[3.8,695,400,45,A.C.gold],[6.4,836,393,20,A.C.mint]]){
    const q=A.phase(t,when,when+.65);if(q>0&&q<1){g.save();g.globalAlpha*=1-q;g.strokeStyle=color;g.lineWidth=2;g.beginPath();g.arc(x,y,r+q*48,Math.PI*1.1,Math.PI*1.9);g.stroke();g.restore();}}
   if(t>6.4)A.badge(g,'DING… ding.',696,235,A.C.gold);
  }
 }
 registrar({id:'00005',nombre:'La campana impaciente',crear:()=>new Campana()});
})();
