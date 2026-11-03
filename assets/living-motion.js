/* Blue Hour V0.5 — photograph tilt and living copy. Uses no animation libraries. */
(()=>{"use strict";
const root=document.documentElement;
const portrait=document.querySelector(".portrait-card");
const photoZone=document.querySelector(".hero-photo-stage");
const hero=document.querySelector(".hero");
const chapter=document.querySelector("#cinema-wrap");
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
const fine=window.matchMedia("(hover: hover) and (pointer: fine)");
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
let portraitOver=false,tX=0,tY=0,cX=0,cY=0,hoverX=50,hoverY=50,activeRAF=0;
function paintPortrait(){
 activeRAF=0;if(!portrait)return;
 cX+=(tX-cX)*.13;cY+=(tY-cY)*.13;
 portrait.style.setProperty("--hero-tilt-x",cX.toFixed(2)+"deg");
 portrait.style.setProperty("--hero-tilt-y",cY.toFixed(2)+"deg");
 portrait.style.setProperty("--hover-x",hoverX.toFixed(1)+"%");
 portrait.style.setProperty("--hover-y",hoverY.toFixed(1)+"%");
 portrait.style.setProperty("--glare-amount",portraitOver?".54":".20");
 if(Math.abs(tX-cX)>.03||Math.abs(tY-cY)>.03)activeRAF=requestAnimationFrame(paintPortrait);
}
function schedulePortrait(){if(!activeRAF)activeRAF=requestAnimationFrame(paintPortrait)}
if(photoZone&&portrait){
 photoZone.addEventListener("pointermove",e=>{
  if(reduced.matches||!fine.matches||e.pointerType==="touch")return;
  const b=portrait.getBoundingClientRect();
  const x=clamp((e.clientX-b.left)/b.width),y=clamp((e.clientY-b.top)/b.height);
  hoverX=x*100;hoverY=y*100;tY=(x-.5)*15;tX=(.5-y)*13;portraitOver=true;schedulePortrait();
 },{passive:true});
 photoZone.addEventListener("pointerleave",()=>{portraitOver=false;tX=0;tY=0;hoverX=50;hoverY=50;schedulePortrait()});
}
const heroLines=[...document.querySelectorAll(".hero-line")],chapterLines=[...document.querySelectorAll(".cinema-copy-line")];
let scrollRAF=0;
function animateCopy(){
 scrollRAF=0;if(reduced.matches)return;
 const vh=window.innerHeight||1;
 if(hero){
  const r=hero.getBoundingClientRect(),p=clamp(-r.top/Math.max(vh,hero.offsetHeight));
  root.style.setProperty("--hero-type-y",(-p*38).toFixed(2)+"px");
  root.style.setProperty("--hero-type-opacity",clamp(1-Math.max(0,p-.36)*1.65).toFixed(3));
 }
 if(chapter){
  const r=chapter.getBoundingClientRect();
  const span=Math.max(1,chapter.offsetHeight-vh);
  const p=clamp(-r.top/span);
  const heading=clamp(p*8)*clamp((.72-p)*5);
  const detail=clamp((p-.19)*6)*clamp((.89-p)*5);
  root.style.setProperty("--chapter-line-opacity",heading.toFixed(3));
  root.style.setProperty("--chapter-line-y",((1-heading)*23-p*20).toFixed(2)+"px");
  root.style.setProperty("--chapter-line-blur",((1-heading)*5).toFixed(2)+"px");
  root.style.setProperty("--chapter-deck-opacity",clamp(heading*.9).toFixed(3));
  root.style.setProperty("--chapter-deck-y",((1-heading)*18).toFixed(2)+"px");
  root.style.setProperty("--chapter-footer-opacity",clamp(.45+detail*.55).toFixed(3));
  root.style.setProperty("--chapter-reel-copy-opacity",clamp(1-Math.max(0,p-.72)*2).toFixed(3));
 }
}
function onScroll(){if(!scrollRAF)scrollRAF=requestAnimationFrame(animateCopy)}
window.addEventListener("scroll",onScroll,{passive:true});
window.addEventListener("resize",onScroll,{passive:true});
reduced.addEventListener?.("change",()=>{if(reduced.matches){[
"--hero-type-y","--hero-type-opacity","--chapter-line-opacity","--chapter-line-y","--chapter-line-blur","--chapter-deck-opacity","--chapter-deck-y","--chapter-footer-opacity","--chapter-reel-copy-opacity"].forEach(k=>root.style.removeProperty(k));tX=0;tY=0;portraitOver=false;schedulePortrait()}else onScroll()});
onScroll();
})();