"use strict";
/* Dos arcos con velocidad suave; la salsa solo cae cuando la patata ya aterrizó. */
(()=>{const A=Astra;class Patata extends Escena{
 constructor(){super(10.9);}
 pintar(g){const t=this.t,p=A.phase(t,1.5,6.5)*2,i=Math.min(1,Math.floor(p)),q=p-i,x=A.lerp([608,704][i],[704,814][i],A.ease(q)),y=430-92*Math.sin(Math.PI*q),s=A.move(t,7,8.1);
  A.stage(g,{color:A.C.blue});A.title(g,'LA PATATA LUNAR',A.move(t,.4,1),'Un pequeño salto para la tapa.');A.platform(g,260,555,168,A.C.blue);this.ultimoAvatar=A.avatar(g,260,543,353);A.table(g,730,462,410,A.C.blue);A.plate(g,732,443,173);
  for(const[cx,cy,r]of[[608,430,28],[704,430,30],[814,430,31],[651,453,15],[759,452,18]]){A.ellipse(g,cx,cy,r,r*.23,'#a4b2b5');A.ellipse(g,cx,cy-1,r*.73,r*.14,'#c2cbca');}
  A.line(g,[[863,410],[863,369]],'#d7dee0',3);g.fillStyle=A.C.blue;g.fillRect(863,369,28,15);
  A.line(g,[[878,446],[878,235],[814,235],[814,250]],'#4d6776',6);
  g.save();g.translate(x,y-16);g.rotate(.15*Math.sin(p*Math.PI));A.ellipse(g,0,0,23,16,'#e3b55c');for(const[a,b]of[[-11,-5],[7,5],[13,-6]])A.ellipse(g,a,b,2,1.5,'#b58b40');g.restore();
  if(t>=7&&t<8.1)A.ellipse(g,814,A.lerp(255,394,s),5,8,'#bf533a');if(t>=8.1)A.ellipse(g,814,398,11,4,'#bf533a');
  if(t>8.2)A.badge(g,'ALUNIZAJE CON SALSA',719,179,A.C.blue);
 }
}registrar({id:'00027',nombre:'La patata lunar',crear:()=>new Patata()});})();
