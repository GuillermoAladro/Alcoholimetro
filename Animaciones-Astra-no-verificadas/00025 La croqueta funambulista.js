"use strict";
/* Cuerda y croqueta comparten exactamente la misma curva de apoyo.
 * La servilleta termina de abrirse antes de que empiece el descenso. */
(()=>{const A=Astra;class Croqueta extends Escena{
 constructor(){super(11.2);}
 pintar(g){const t=this.t,q=A.move(t,1.5,6.6),drop=A.move(t,7.1,8.4),x=A.lerp(590,865,q),y=A.lerp(325+22*Math.sin(Math.PI*q),416,drop);
  A.stage(g,{color:A.C.gold});A.title(g,'LA CROQUETA FUNAMBULISTA',A.move(t,.4,1),'Cruzar. Frenar. Caer blandito.');A.platform(g,263,555,166,A.C.gold);this.ultimoAvatar=A.avatar(g,263,543,352);
  A.table(g,727,461,410);A.plate(g,590,446,51);A.plate(g,865,446,58);
  A.line(g,[[590,441],[590,340]],'#536a77',5);A.line(g,[[865,441],[865,340]],'#536a77',5);const rope=[];for(let i=0;i<=40;i++)rope.push([590+275*i/40,340+22*Math.sin(Math.PI*i/40)]);A.line(g,rope,'#e7d2a2',3);
  const open=A.move(t,5.5,6.8);g.fillStyle='#f7f0dc';g.beginPath();g.moveTo(865-45*open,441);g.lineTo(865-29*open,431);g.lineTo(865+35*open,431);g.lineTo(865+47*open,441);g.closePath();g.fill();
  g.save();g.translate(x,y);g.rotate(.07*Math.sin(q*Math.PI*8)*(1-drop));const gr=g.createLinearGradient(0,-15,0,15);gr.addColorStop(0,'#f4c876');gr.addColorStop(1,'#a55d23');g.fillStyle=gr;A.round(g,-29,-15,58,30,15);g.fill();for(let i=0;i<11;i++)A.ellipse(g,-23+(i*13)%46,-9+(i*7)%19,1.8,1.8,'#996127');A.line(g,[[-48,-22],[48,-22]],'#dac89f',3);A.line(g,[[0,-22],[0,-13]],'#dac89f',3);g.restore();
  if(t>8.5)A.badge(g,'ATERRIZAJE CRUJIENTE',725,200,A.C.gold);
 }
}registrar({id:'00025',nombre:'La croqueta funambulista',crear:()=>new Croqueta()});})();
