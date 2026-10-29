"use strict";
/* 00017 · El platillo aparcacoches
 * Cinco plazas de plato; cuatro aceitunas conservan su posición relativa.
 * La quinta baja en su plaza libre después de detenerse el plato.
 */
(()=>{const A=Astra;class Platillo extends Escena{
 constructor(){super(10.5);}
 pintar(g){const t=this.t,angle=Math.PI*2*A.move(t,1.3,5.4),land=A.move(t,5.7,7.3);A.stage(g,{color:A.C.gold});A.title(g,'EL PLATILLO APARCACOCHES',A.move(t,.4,1),'Quedaba una plaza.');
  A.platform(g,278,555,166,A.C.gold);this.ultimoAvatar=A.avatar(g,278,543,351);A.table(g,737,452,330);A.plate(g,737,436,139);
  const marks=[];for(let i=0;i<5;i++){const a=angle+i*2*Math.PI/5;marks.push({i,x:737+94*Math.cos(a),y:433+22*Math.sin(a)});}
  marks.sort((a,b)=>a.y-b.y);for(const p of marks){g.strokeStyle=p.i===0?A.C.mint:'#a6b6bd';g.lineWidth=1.5;g.beginPath();g.ellipse(p.x,p.y,22,7,0,0,Math.PI*2);g.stroke();if(p.i)A.olive(g,p.x,p.y-10,15);}
  const x=831,y=A.lerp(235,423,land);A.line(g,[[831,186],[831,y-17]],'#4a6269',2);A.olive(g,x,y,15);
  if(t>7.4)A.badge(g,'APARCADO',733,193,A.C.gold);
 }
}registrar({id:'00017',nombre:'El platillo aparcacoches',crear:()=>new Platillo()});})();
