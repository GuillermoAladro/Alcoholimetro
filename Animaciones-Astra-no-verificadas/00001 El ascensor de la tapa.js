"use strict";
/* 00001 · El ascensor de la tapa
 * Dos elevadores visibles, uno para Guillermo y otro para la tapa.
 * Los pies permanecen apoyados; no se estira ni cambia el avatar.
 */
(()=>{
 const A=Astra;
 class Ascensor extends Escena{
  constructor(){super(11);}
  pintar(g){const t=this.t;const up=A.move(t,1.3,3.5)*(1-A.move(t,5.7,8));const feet=543-132*up;
   const foodY=310+133*A.move(t,5.75,8);
   A.stage(g);A.title(g,'EL ASCENSOR DE LA TAPA',A.move(t,.4,1),'La tapa también tiene ascensor.');
   A.line(g,[[249,171],[249,553]],'#26343f',8);A.line(g,[[411,171],[411,553]],'#26343f',8);
   A.line(g,[[249,171],[249,553]],'#566976',1);A.line(g,[[411,171],[411,553]],'#566976',1);
   A.shadow(g,330,568,100,.8);A.platform(g,330,feet+12,180);this.ultimoAvatar=A.avatar(g,330,feet,292);
   A.line(g,[[665,279],[665,554]],'#3b4c58',8);A.line(g,[[775,279],[775,554]],'#3b4c58',8);
   A.platform(g,720,foodY+24,143,A.C.gold);A.plate(g,720,foodY+5,38);A.olive(g,720,foodY-7,12);
   A.text(g,'TAPA',720,243,21,A.C.gold);A.text(g,'↑',459,340,42,A.C.mint);
   if(t>8)A.badge(g,'SERVICIO A DOS ALTURAS',594,176,A.C.gold);
  }
 }
 registrar({id:'00001',nombre:'El ascensor de la tapa',crear:()=>new Ascensor()});
})();
