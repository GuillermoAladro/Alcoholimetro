"use strict";
/* 00012 · La cucharilla brújula
 * Una cucharilla articulada gira alrededor de un pivote fijo.
 * La taza se descubre retirando una cortina: estaba detrás desde el inicio.
 */
(()=>{const A=Astra;class Brujula extends Escena{
 constructor(){super(10.4);}
 pintar(g){const t=this.t,turn=A.move(t,1.2,5.4),angle=-Math.PI*.5+Math.PI*4.5*turn,open=A.move(t,5.5,6.7);
  A.stage(g);A.title(g,'LA CUCHARILLA BRÚJULA',A.move(t,.4,1),'Siempre encuentra la taza.');
  A.platform(g,274,555,166);this.ultimoAvatar=A.avatar(g,274,543,352);A.table(g,725,442,345);
  A.ellipse(g,654,420,65,20,'#203b43');g.save();g.translate(654,406);g.rotate(angle);A.line(g,[[-48,0],[43,0]],'#a5c4ce',11);A.ellipse(g,54,0,22,12,'#d8e7eb');A.ellipse(g,54,0,15,7,'#6a909e');g.restore();A.ellipse(g,654,406,7,7,A.C.gold);
  A.glass(g,838,428,61,77,.7,'#a97d59');A.line(g,[[865,367],[889,367],[889,404],[864,404]],'#a1cad4',5);
  A.rail(g,783,915,281);g.save();g.beginPath();g.rect(780,284,132,155);g.clip();for(let i=0;i<7;i++){const x=780+i*20+132*open;g.fillStyle=i%2?'#813d61':'#aa547c';g.fillRect(x,284,21,155);}g.restore();
  if(t>6.8)A.badge(g,'DESTINO ENCONTRADO',724,182);
 }
}registrar({id:'00012',nombre:'La cucharilla brújula',crear:()=>new Brujula()});})();
