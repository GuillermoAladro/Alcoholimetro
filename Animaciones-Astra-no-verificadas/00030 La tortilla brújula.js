"use strict";
/* Sector elíptico con ángulo idéntico al hueco. El brazo gira primero y encaja después. */
(()=>{const A=Astra;function sector(g,x,y,angle,whole=false){g.save();g.translate(x,y);g.scale(1,.43);g.rotate(angle);g.fillStyle=whole?'#bd8438':'#e6b65c';g.beginPath();g.moveTo(0,0);g.arc(0,0,113,whole?Math.PI/6:-Math.PI/6,whole?Math.PI*11/6:Math.PI/6);g.closePath();g.fill();g.strokeStyle='#f5cf7c';g.lineWidth=3;g.stroke();g.restore();}
 class Tortilla extends Escena{constructor(){super(11.3);}
 pintar(g){const t=this.t,turn=A.move(t,1.4,4.8)*Math.PI*4,slide=A.move(t,5.1,8.1),x=A.lerp(563,744,slide),y=A.lerp(313,415,slide);A.stage(g,{color:A.C.gold});A.title(g,'LA TORTILLA BRÚJULA',A.move(t,.4,1),'Norte: el hueco exacto.');A.platform(g,256,555,164,A.C.gold);this.ultimoAvatar=A.avatar(g,256,543,351);A.table(g,728,466,410);A.plate(g,744,429,145);sector(g,744,415,0,true);
  A.line(g,[[915,451],[915,222],[x,222],[x,y]],'#4b6875',5);A.ellipse(g,x,y,9,5,'#8198a0');sector(g,x,y,turn);
  if(t>8.3)A.badge(g,'CÍRCULO COMPLETO',721,181,A.C.gold);
 }
}registrar({id:'00030',nombre:'La tortilla brújula',crear:()=>new Tortilla()});})();
