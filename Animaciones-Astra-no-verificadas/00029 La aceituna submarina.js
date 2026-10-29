"use strict";
/* Vaso transparente, nivel fijo y burbujas que elevan la aceituna por su eje.
 * Las burbujas se disuelven al alcanzar la superficie, no atraviesan el cristal. */
(()=>{const A=Astra;class Submarina extends Escena{
 constructor(){super(11.2);}
 pintar(g){const t=this.t,down=A.move(t,1.6,4),up=A.move(t,5.1,8),oy=289+98*down-98*up;A.stage(g,{color:A.C.mint});A.title(g,'LA ACEITUNA SUBMARINA',A.move(t,.4,1),'El ascensor va por dentro.');A.platform(g,270,555,168);this.ultimoAvatar=A.avatar(g,270,543,352);A.table(g,742,465,306);A.glass(g,742,448,169,211,.7,'#5da99f');
  g.save();g.beginPath();g.moveTo(658,238);g.lineTo(672,445);g.lineTo(812,445);g.lineTo(826,238);g.closePath();g.clip();
  for(let i=0;i<16;i++){const age=t-(4.5+i*.16);if(age<0||age>2.2)continue;const p=age/2.2,x=742+Math.sin(i*2.3)*24,y=430-p*130;g.save();g.globalAlpha*=Math.sin(Math.PI*p);g.strokeStyle='#bcefe6';g.lineWidth=1.6;g.beginPath();g.arc(x,y,4+i%4,0,Math.PI*2);g.stroke();g.restore();}
  A.olive(g,742,oy,21);if(oy>300)A.ellipse(g,742,oy,21,17,'rgba(72,156,158,.22)');g.restore();
  A.line(g,[[742,466],[742,451]],'#79b8b5',5);A.ellipse(g,742,452,17,5,'#284f55');
  if(t>8.1)A.badge(g,'VUELTA A LA SUPERFICIE',739,183,A.C.mint);
 }
}registrar({id:'00029',nombre:'La aceituna submarina',crear:()=>new Submarina()});})();
