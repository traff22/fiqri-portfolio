/* FQ / Electric Cinema — deliberately small scroll & pointer choreography.
 * All movement is driven by composition, not animated background particles.
 * Does not alter the site's existing project, portrait flip or modal handlers. */
(()=>{"use strict";
 const hero=document.querySelector(".hero");
 const stage=document.querySelector("#cinema-wrap");
 const work=document.querySelector("#work");
 if(!hero||!stage||!work)return;
 const reduced=matchMedia("(prefers-reduced-motion: reduce)");
 const pointer=matchMedia("(hover: hover) and (pointer: fine)");
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 const saveData=()=>Boolean(navigator.connection?.saveData);
 let aimX=0,aimY=0,currentX=0,currentY=0,raf=0;
 const set=(el,key,val)=>el.style.setProperty(key,val);
 const clear=()=>{
   for(const [el,vars] of [
     [hero,["--ek-ambient-x","--ek-ambient-y","--ek-copy-y","--ek-portrait-y"]],
     [stage,["--ek-stage-light","--ek-side-y"]],
     [work,["--ek-work-light"]]
   ])for(const k of vars)el.style.removeProperty(k);
 };
 function paint(){
   raf=0;
   if(reduced.matches||saveData()){clear();return}
   const vh=Math.max(1,innerHeight||1);
   const compact=innerWidth<=850;
   let follow=false;
   const h=hero.getBoundingClientRect();
   if(h.bottom>-vh*.25&&h.top<vh*1.2){
     const p=clamp(-h.top/Math.max(1,h.height),0,1);
     currentX+=(aimX-currentX)*.14;
     currentY+=(aimY-currentY)*.14;
     if(Math.abs(aimX-currentX)+Math.abs(aimY-currentY)>.35)follow=true;
     set(hero,"--ek-ambient-x",(currentX*.9).toFixed(1)+"px");
     set(hero,"--ek-ambient-y",(-p*(compact?24:72)+currentY*.68).toFixed(1)+"px");
     set(hero,"--ek-copy-y",(compact?0:-p*16).toFixed(1)+"px");
     set(hero,"--ek-portrait-y",(compact?0:p*42).toFixed(1)+"px");
   }
   const c=stage.getBoundingClientRect();
   if(c.bottom>-vh*.2&&c.top<vh*1.2){
     const p=clamp((vh-c.top)/(vh+c.height),0,1);
     set(stage,"--ek-stage-light",((.5-p)*(compact?35:80)).toFixed(1)+"px");
     set(stage,"--ek-side-y",((p-.5)*(compact?0:64)).toFixed(1)+"px");
   }
   const w=work.getBoundingClientRect();
   if(w.bottom>-vh*.2&&w.top<vh*1.2){
     const p=clamp((vh-w.top)/(vh+w.height),0,1);
     set(work,"--ek-work-light",((p-.5)*(compact?27:84)).toFixed(1)+"px");
   }
   if(follow)schedule();
 }
 function schedule(){if(!raf)raf=requestAnimationFrame(paint)}
 hero.addEventListener("pointermove",e=>{
   if(!pointer.matches||e.pointerType==="touch"||reduced.matches||saveData())return;
   const box=hero.getBoundingClientRect();
   aimX=clamp((e.clientX-box.left)/Math.max(1,box.width)*2-1,-1,1)*35;
   aimY=clamp((e.clientY-box.top)/Math.max(1,box.height)*2-1,-1,1)*19;
   schedule();
 },{passive:true});
 hero.addEventListener("pointerleave",()=>{aimX=0;aimY=0;schedule()},{passive:true});
 addEventListener("scroll",schedule,{passive:true});
 addEventListener("resize",schedule,{passive:true});
 addEventListener("pageshow",schedule);
 reduced.addEventListener?.("change",schedule);
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)schedule()});
 schedule();
})();