"use strict";
/* 00020 · El menú desplegable
 * Tres paneles se deslizan sobre guías; sus letras conservan orientación.
 * Una puerta del último panel se eleva antes de la salida de la tapa.
 */
(()=>{const A=Astra;class Menu extends Escena{
 constructor(){super(11.4);}
 pintar(g){const t=this.t,open=A.move(t,1.2,4.1),door=A.move(t,4.3,5.7),food=A.move(t,5.9,7.7);A.stage(g,{color:A.C.rose});A.title(g,'EL MENÚ DESPLEGABLE',A.move(t,.4,1),'La especialidad sale de la carta.');
  A.platform(g,268,555,166,A.C.rose);this.ultimoAvatar=A.avatar(g,268,543,351);A.table(g,733,458,358,A.C.rose);
  A.rail(g,557,900,450);
  for(let i=0;i<3;i++){const x=612+i*85*open;g.fillStyle=['#60384b','#854761','#b45a7a'][i];A.round(g,x,250,88,193,8);g.fill();A.text(g,['HOY','TAPA','ESPECIAL'][i],x+44,281,i===2?14:20,A.C.white);A.line(g,[[x+16,308],[x+70,308]],'#daa6bb',2);}
  const dx=612+170*open;g.fillStyle='#0a1219';A.round(g,dx+16,337,57,108,5);g.fill();
  const px=A.lerp(dx+44,744,food),py=A.lerp(427,448,food);A.plate(g,px,py,32);A.olive(g,px,py-12,15);
  g.save();g.beginPath();g.rect(dx+12,327,65,118);g.clip();g.fillStyle='#cb708d';A.round(g,dx+16,337-110*door,57,108,5);g.fill();g.restore();
  if(t>7.8)A.badge(g,'ESPECIAL DEL DÍA',727,183,A.C.rose);
 }
}registrar({id:'00020',nombre:'El menú desplegable',crear:()=>new Menu()});})();
