"use strict";
/* Fichas articuladas de 49 px separadas 50 px: caída encadenada sin solapamientos.
 * La última ficha queda horizontal antes de recibir la galleta. */
(()=>{const A=Astra;class Domino extends Escena{
 constructor(){super(11.1);}
 pintar(g){const t=this.t;A.stage(g,{color:A.C.gold});A.title(g,'EL QUESO DOMINÓ',A.move(t,.4,1),'La última ficha tenía un trabajo.');A.platform(g,246,555,160,A.C.gold);this.ultimoAvatar=A.avatar(g,246,543,350);A.table(g,727,458,445);A.rail(g,550,924,440);
  for(let i=6;i>=0;i--){const x=559+i*50,a=Math.PI/2*A.move(t,1.4+i*.63,2.02+i*.63);g.save();g.translate(x,435);g.rotate(a);g.fillStyle=i%2?'#f1c54f':'#f8d877';A.round(g,-7,-49,14,49,3);g.fill();for(const y of[-38,-21,-9])A.ellipse(g,0,y,2.5,2.5,'#c59436');g.restore();A.ellipse(g,x,435,4,4,'#825e32');}
  const cy=A.lerp(240,410,A.move(t,6.8,8.3));A.line(g,[[884,195],[884,cy-18]],'#425966',1);A.ellipse(g,884,cy,18,18,'#c79553');A.ellipse(g,884,cy,14,14,'#e4b674');for(let i=0;i<6;i++){const a=i*Math.PI/3;A.ellipse(g,884+8*Math.cos(a),cy+8*Math.sin(a),1.5,1.5,'#936135');}
  if(t>8.4)A.badge(g,'GALLETa A SALVO'.toUpperCase(),718,199,A.C.gold);
 }
}registrar({id:'00028',nombre:'El queso dominó',crear:()=>new Domino()});})();
