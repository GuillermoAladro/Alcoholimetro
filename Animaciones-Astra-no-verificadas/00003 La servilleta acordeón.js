"use strict";
/* 00003 · La servilleta acordeón
 * La aceituna siempre está bajo el pliegue derecho. Se revela al abrirlo.
 * Ocho paneles conservan un borde común: no hay saltos de continuidad.
 */
(()=>{
 const A=Astra;
 class Acordeon extends Escena{
  constructor(){super(10.2);}
  pintar(g){const t=this.t,open=A.move(t,1.3,4.8),close=A.move(t,8.1,9.1),k=open*(1-close),span=A.lerp(74,270,k);
   A.stage(g,{color:A.C.rose});A.title(g,'LA SERVILLETA ACORDEÓN',A.move(t,.4,1),'El último pliegue guardaba algo.');
   A.platform(g,282,555,168,A.C.rose);this.ultimoAvatar=A.avatar(g,282,543,352);A.table(g,722,438,330,A.C.rose);
   A.plate(g,722,435,124);A.olive(g,808,421,17);
   const left=835-span;for(let i=0;i<6;i++){
    const x=left+i*span/8,w=span/8;const up=26*(1-k)+(i%2?0:6);
    g.beginPath();g.moveTo(x,435);g.lineTo(x+w,435);g.lineTo(x+w,365+up);g.lineTo(x,365+(i%2?0:26*(1-k)));g.closePath();g.fillStyle=i%2?'#c9d7dc':'#f1f0e8';g.fill();g.strokeStyle='#8da0a9';g.lineWidth=1;g.stroke();
   }
   // El pliegue final se retira por su bisagra: la aceituna no se teletransporta.
   const reveal=A.move(t,4.8,5.65)*(1-close);g.save();g.translate(835,435);g.rotate(-reveal*1.42);g.fillStyle='#eef1e8';A.round(g,-70,-80,70,80,2);g.fill();g.strokeStyle='#9caeb2';g.stroke();g.restore();
   if(t>5.6&&t<8.4)A.badge(g,'¡ESTABA AQUÍ!',730,238,A.C.rose);
  }
 }
 registrar({id:'00003',nombre:'La servilleta acordeón',crear:()=>new Acordeon()});
})();
