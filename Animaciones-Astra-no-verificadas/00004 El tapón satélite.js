"use strict";
/* 00004 · El tapón satélite
 * Tapón unido a una guía de escenario; arco continuo y regreso al cuello.
 * La botella lleva 0,0; el mecanismo es de utilería y no hay consumo.
 */
(()=>{
 const A=Astra;
 class Tapon extends Escena{
  constructor(){super(10.3);}
  posicion(){const t=this.t;const q=A.move(t,1.3,7.2);const theta=q*Math.PI*2;return{x:738-374*Math.sin(theta/2),y:310-159*Math.sin(theta/2)+48*Math.sin(theta),rot:Math.sin(theta)*.55};}
  pintar(g){const t=this.t,p=this.posicion();A.stage(g);A.title(g,'EL TAPÓN SATÉLITE',A.move(t,.4,1),'Ida y vuelta al mismo cuello.');
   A.platform(g,334,555,165);this.ultimoAvatar=A.avatar(g,334,543,320);A.table(g,738,466,210);A.bottle(g,738,459,139);
   g.save();g.strokeStyle='#203634';g.lineWidth=2;g.setLineDash([3,9]);g.beginPath();for(let i=0;i<=96;i++){const q=i/96,a=q*Math.PI*2,x=738-374*Math.sin(a/2),y=310-159*Math.sin(a/2)+48*Math.sin(a);if(i===0)g.moveTo(x,y);else g.lineTo(x,y);}g.stroke();g.restore();
   A.line(g,[[p.x,128],[p.x,p.y-20]],'#33434b',1);A.cork(g,p.x,p.y,p.rot,1.05);
   if(t>7.3){A.badge(g,'VUELTA A CASA',722,214);A.sparkles(g,t,738,315,13,A.C.mint,A.phase(t,7.3,8.5));}
  }
 }
 registrar({id:'00004',nombre:'El tapón satélite',crear:()=>new Tapon()});
})();
