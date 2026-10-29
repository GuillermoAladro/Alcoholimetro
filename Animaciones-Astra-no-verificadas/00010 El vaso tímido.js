"use strict";
/* 00010 · El vaso tímido
 * El vaso recorre un carril detrás del servilletero; se revela por oclusión.
 * Su foco pequeño permanece anclado al vaso, sin cambiar la luz de Guillermo.
 */
(()=>{const A=Astra;class Timido extends Escena{
 constructor(){super(10.8);}
 pintar(g){const t=this.t,hide=A.move(t,1.2,2.6),out=A.move(t,4.8,6.5),x=684-72*hide+190*out;
  A.stage(g);A.title(g,'EL VASO TÍMIDO',A.move(t,.4,1),'Un foco de su tamaño.');
  A.glow(g,289,385,170,A.C.mint,.2);A.platform(g,289,555,164);this.ultimoAvatar=A.avatar(g,289,543,354);A.table(g,737,448,326);
  A.rail(g,575,855,442);A.glass(g,x,433,47,78,.58);A.coaster(g,x,438,29,0,A.C.mint);
  // Servilletero opaco por delante, con base apoyada en el tablero.
  g.fillStyle='#778d97';A.round(g,578,347,88,96,10);g.fill();g.fillStyle='#e9ebe3';A.round(g,587,323,70,79,4);g.fill();A.line(g,[[590,376],[654,376]],'#344d59',5);
  const lamp=A.move(t,4.3,5.2);A.line(g,[[846,183],[846,226]],'#4b6571',3);g.fillStyle='#23343f';A.round(g,825,224,42,21,8);g.fill();
  if(lamp>0){g.save();g.globalAlpha*=lamp;const gr=g.createLinearGradient(0,244,0,438);gr.addColorStop(0,'rgba(99,239,193,.15)');gr.addColorStop(1,'rgba(99,239,193,0)');g.fillStyle=gr;g.beginPath();g.moveTo(834,245);g.lineTo(858,245);g.lineTo(x+63,438);g.lineTo(x-63,438);g.closePath();g.fill();g.restore();}
  if(t>6.7)A.badge(g,'AHORA SÍ',754,162);
 }
}registrar({id:'00010',nombre:'El vaso tímido',crear:()=>new Timido()});})();
