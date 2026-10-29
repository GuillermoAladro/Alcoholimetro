"use strict";
/* 00024 · El brindis de cristal
 * Guillermo y Laura usan sus referencias actuales sin rediseñar los avatares.
 * Dos vasos en soportes se acercan, tocan sus bordes y se separan.
 * El reflejo óptico es simultáneo; un eco de luz posterior expresa el remate.
 */
(()=>{const A=Astra;class Brindis extends Escena{
 constructor(){super(11.2);}
 pintar(g){const t=this.t,k=A.move(t,1.8,4.1)*(1-A.move(t,5.3,7.2)),left=A.lerp(442,484,k),right=A.lerp(582,540,k);
  A.stage(g,{color:A.C.rose});A.title(g,'EL BRINDIS DE CRISTAL',A.move(t,.4,1),'Dos vasos. Un pequeño eco de luz.');
  A.platform(g,269,555,170,A.C.mint);A.platform(g,754,555,160,A.C.rose);this.ultimoAvatar=A.avatar(g,269,543,354);A.avatar(g,754,543,350,{who:'laura'});
  A.table(g,512,449,252,A.C.rose);A.rail(g,411,613,441);
  for(const x of[left,right]){A.coaster(g,x,438,31,0,A.C.rose);A.glass(g,x,431,54,96,.58,'#d1a06c');}
  for(const when of[4.1,5.02]){const p=A.phase(t,when,when+.7);if(p>0&&p<1){g.save();g.globalAlpha*=Math.sin(p*Math.PI);A.line(g,[[512,326],[512,309-p*16]],A.C.gold,3);A.line(g,[[496,330],[482-p*10,316]],A.C.gold,3);A.line(g,[[528,330],[542+p*10,316]],A.C.gold,3);g.restore();}}
  if(t>7.25)A.badge(g,'¡CHIN… CHIN!',512,192,A.C.rose);
 }
}registrar({id:'00024',nombre:'El brindis de cristal',crear:()=>new Brindis()});})();
