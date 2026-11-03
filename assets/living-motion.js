/* Fiqri Portfolio — intentional motion.
   The portrait tilts gently; Chapter One's headline is pinned and readable. */
(()=>{"use strict";
const root=document.documentElement;
const portrait=document.querySelector(".portrait-card");
const photoZone=document.querySelector(".hero-photo-stage");
const hero=document.querySelector(".hero");
const chapter=document.querySelector("#cinema-wrap");
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
const fine=window.matchMedia("(hover: hover) and (pointer: fine)");
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
let portraitOver=false,tX=0,tY=0,cX=0,cY=0,hoverX=50,hoverY=50,portraitFrame=0;
function paintPortrait(){
 portraitFrame=0;if(!portrait)return;
 cX+=(tX-cX)*.13;cY+=(tY-cY)*.13;
 portrait.style.setProperty("--hero-tilt-x",cX.toFixed(2)+"deg");
 portrait.style.setProperty("--hero-tilt-y",cY.toFixed(2)+"deg");
 portrait.style.setProperty("--hover-x",hoverX.toFixed(1)+"%");
 portrait.style.setProperty("--hover-y",hoverY.toFixed(1)+"%");
 portrait.style.setProperty("--glare-amount",portraitOver?".5":".12");
 if(Math.abs(tX-cX)>.03||Math.abs(tY-cY)>.03)portraitFrame=requestAnimationFrame(paintPortrait);
}
function schedulePortrait(){if(!portraitFrame)portraitFrame=requestAnimationFrame(paintPortrait)}
if(photoZone&&portrait){
 photoZone.addEventListener("pointermove",e=>{
  if(reduced.matches||!fine.matches||e.pointerType==="touch")return;
  const b=portrait.getBoundingClientRect();
  const x=clamp((e.clientX-b.left)/b.width),y=clamp((e.clientY-b.top)/b.height);
  hoverX=x*100;hoverY=y*100;tY=(x-.5)*12;tX=(.5-y)*10;portraitOver=true;schedulePortrait();
 },{passive:true});
 photoZone.addEventListener("pointerleave",()=>{
  portraitOver=false;tX=0;tY=0;hoverX=50;hoverY=50;schedulePortrait()
 });
}
let scrollFrame=0;
function updateVisibility(){
 scrollFrame=0;
 const vh=window.innerHeight||1;
 if(chapter){
  const r=chapter.getBoundingClientRect();
  // Reveal at the first hint of the section, not halfway through its parallax.
  chapter.classList.toggle("is-inview",reduced.matches||(r.top<vh*.95&&r.bottom>vh*.08));
 }
 if(hero&&!reduced.matches){
  const r=hero.getBoundingClientRect(),p=clamp(-r.top/Math.max(vh,hero.offsetHeight));
  root.style.setProperty("--hero-type-y",(-p*24).toFixed(2)+"px");
  root.style.setProperty("--hero-type-opacity",clamp(1-Math.max(0,p-.52)*1.3).toFixed(3));
 }
}
function onScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateVisibility)}
window.addEventListener("scroll",onScroll,{passive:true});
window.addEventListener("resize",onScroll,{passive:true});
reduced.addEventListener?.("change",()=>{
 if(reduced.matches){
  ["--hero-type-y","--hero-type-opacity"].forEach(k=>root.style.removeProperty(k));
  portraitOver=false;tX=0;tY=0;schedulePortrait();
 }
 onScroll();
});
updateVisibility();
})();