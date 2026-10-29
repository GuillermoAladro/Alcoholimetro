"use strict";
/* 00014 · El limón con cremallera
 * Ocho gajos de utilería giran sobre el mismo centro, conservando su orden.
 * La cremallera es un elemento del objeto, nunca un cambio del avatar.
 */
(()=>{const A=Astra;class Limon extends Escena{
 constructor(){super(10.7);}
 pintar(g){const t=this.t,k=A.move(t,1.4,4)*(1-A.move(t,6.1,8.3)),cx=732,cy=377;
  A.stage(g,{color:A.C.gold});A.title(g,'EL LIMÓN CON CREMALLERA',A.move(t,.4,1),'Abrir. Mirar. Volver a cerrar.');
  A.platform(g,274,555,166,A.C.gold);this.ultimoAvatar=A.avatar(g,274,543,352);A.table(g,732,454,302);A.plate(g,732,447,111);
  for(let i=0;i<8;i++){const a=i*Math.PI/4,cx2=cx+Math.cos(a)*41*k,cy2=cy+Math.sin(a)*41*k;g.save();g.translate(cx2,cy2);g.rotate(a);g.fillStyle='#d9a72b';g.beginPath();g.moveTo(0,0);g.arc(0,0,62,-Math.PI/8,Math.PI/8);g.closePath();g.fill();g.strokeStyle='#fdf4ad';g.lineWidth=3;g.stroke();g.fillStyle='#ffe27a';g.beginPath();g.moveTo(6,0);g.arc(0,0,53,-Math.PI/9,Math.PI/9);g.closePath();g.fill();g.restore();}
  // Cremallera sobre la carcasa de utilería, recogida cuando se abre.
  const zipY=A.lerp(325,431,k);A.line(g,[[732,322],[732,zipY]],'#d4e5e6',3);g.fillStyle='#667e89';A.round(g,725,zipY-9,14,20,4);g.fill();
  if(t>8.4)A.badge(g,'BIEN CERRADO',728,210,A.C.gold);
 }
}registrar({id:'00014',nombre:'El limón con cremallera',crear:()=>new Limon()});})();
