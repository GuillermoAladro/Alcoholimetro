"use strict";
/* 00016 · La botella metrónomo
 * Botella 0,0 sobre una cuna articulada. El giro mantiene su pivote.
 * La cucharilla responde al último paso por el centro y el conjunto se frena.
 */
(()=>{const A=Astra;class Metronomo extends Escena{
 constructor(){super(10.4);}
 pintar(g){const t=this.t,active=A.move(t,.9,1.8)*(1-A.move(t,6.4,8)),a=.23*Math.sin((t-1.8)*4.2)*active;
  A.stage(g);A.title(g,'LA BOTELLA METRÓNOMO',A.move(t,.4,1),'El último golpe lo pone la cucharilla.');A.platform(g,280,555,166);this.ultimoAvatar=A.avatar(g,280,543,350);A.table(g,731,452,310);
  A.ellipse(g,729,444,48,13,'#223b43');A.bottle(g,729,438,166,a);A.ellipse(g,729,439,10,7,A.C.gold);
  const spoon=A.phase(t,7.1,7.55),swing=spoon>0&&spoon<1?Math.sin(spoon*Math.PI)*.6:0;g.save();g.translate(848,423);g.rotate(-swing);A.line(g,[[0,0],[0,-75]],'#9bb7c2',7);A.ellipse(g,0,-83,13,19,'#cddce0');g.restore();A.ellipse(g,848,427,20,5,'#29404b');
  if(t>7.1){A.badge(g,'TIN. Y A DESCANSAR.',723,202);A.sparkles(g,t,848,351,8,A.C.gold,A.phase(t,7.1,7.9));}
 }
}registrar({id:'00016',nombre:'La botella metrónomo',crear:()=>new Metronomo()});})();
