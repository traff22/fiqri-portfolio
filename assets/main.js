(()=>{"use strict";
const one=(q)=>document.querySelector(q),all=(q)=>[...document.querySelectorAll(q)];
const menu=one("#mobile-menu"),nav=one("#navlinks");
menu?.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));menu.textContent=open?"Close":"Menu"});
all("#navlinks a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu?.setAttribute("aria-expanded","false");if(menu)menu.textContent="Menu"}));
/* Opening titles (assets/splash.css). <head> decides whether they run
   (once per session, never with reduced motion). The sequence itself is CSS;
   this only counts the timecode, locks scrolling while they play, lets the
   visitor skip, and replays them from the footer. */
const splash=one("#intro"),reduced=window.matchMedia("(prefers-reduced-motion: reduce)"),key="fiqri-intro-seen";
const root=document.documentElement,tc=one("#fq-splash-tc");
let splashDone=0,tcRaf=0;
function finishSplash(){
 if(!root.classList.contains("fq-splash-on"))return;
 root.classList.remove("fq-splash-on");splash?.classList.remove("is-skipping");
 document.body.style.overflow="";cancelAnimationFrame(tcRaf);clearTimeout(splashDone);
}
function skipSplash(){
 if(!root.classList.contains("fq-splash-on")||splash.classList.contains("is-skipping"))return;
 splash.classList.add("is-skipping");clearTimeout(splashDone);splashDone=setTimeout(finishSplash,480);
}
function runSplash(){
 if(!splash||!root.classList.contains("fq-splash-on"))return;
 try{sessionStorage.setItem(key,"yes")}catch{}
 document.body.style.overflow="hidden";
 // The edit plays out in CSS; this writes the timecode (24 fps while the
 // playhead runs), the status lines and the render percentage in step.
 const start=performance.now(),status=one("#fq-splash-status"),pct=one("#fq-splash-pct");
 const lines=[[0,"Importing way too much b-roll…"],[650,"Cutting the boring part…"],[1350,"Syncing audio by ear…"],[1900,"Rendering…"],[2400,"Rendering… it's always 99%"],[2850,"Exported. Enjoy the cut ✓"]];
 const count=now=>{
  const t=now-start,f=Math.round(Math.max(0,Math.min(1,(t-400)/2450))*75);
  if(tc)tc.textContent="00:00:"+String(Math.floor(f/24)).padStart(2,"0")+":"+String(f%24).padStart(2,"0");
  let line=lines[0][1];for(const [at,text] of lines)if(t>=at)line=text;
  if(status&&status.textContent!==line)status.textContent=line;
  if(pct){const r=t<1900?"":t<2350?Math.round((t-1900)/450*99)+"%":t<2850?"99%":"100%";if(pct.textContent!==r)pct.textContent=r}
  if(t<3000)tcRaf=requestAnimationFrame(count)};
 tcRaf=requestAnimationFrame(count);
 one("#skip-intro")?.focus({preventScroll:true});
 splashDone=setTimeout(finishSplash,3850);
}
splash?.addEventListener("click",skipSplash);
document.addEventListener("keydown",e=>{if(e.key==="Escape")skipSplash()});
one("#replay")?.addEventListener("click",()=>{
 if(reduced.matches)return;
 window.scrollTo({top:0,behavior:"instant"});
 splash.classList.remove("is-skipping");root.classList.remove("fq-splash-on");
 void splash.offsetWidth; // restart the CSS sequence
 root.classList.add("fq-splash-on");runSplash();
});
reduced.addEventListener?.("change",()=>{if(reduced.matches)finishSplash();schedule()});
runSplash();
/* Filter handling moved to work-gallery.js for multi-category projects. */
const io=("IntersectionObserver"in window)?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.08}):null;
all(".reveal").forEach(el=>io?io.observe(el):el.classList.add("visible"));
const doc=document.documentElement,hero=one(".hero"),poster=one(".poster"),cinema=one("#cinema-wrap"),frame=one(".cinema-frame"),cards=all(".work-card");
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
let raf=0;
function tick(){raf=0;
const scroll=window.scrollY||0,vh=window.innerHeight||1,max=Math.max(1,doc.scrollHeight-vh),isReduced=reduced.matches,small=window.innerWidth<850;
const progress=one("#progress");if(progress)progress.style.transform="scaleX("+clamp(scroll/max)+")";
if(isReduced){
 ["--hero-back-y","--hero-mid-y","--hero-content-y","--poster-y","--poster-orbit-y","--poster-letter-y","--cinema-copy-y","--scene-back-y","--scene-front-y","--frame-y","--scene-rotation","--work-card-shift","--work-art-y","--work-ambient-shift"].forEach(k=>doc.style.removeProperty(k));
 doc.style.setProperty("--cinema-scale","1");doc.style.setProperty("--cinema-copy-opacity","1");doc.style.setProperty("--cinema-phrase-opacity","0");doc.style.setProperty("--cinema-logo-opacity","1");return;
}
if(hero){const h=hero.offsetHeight,amount=clamp(scroll/Math.max(h,1));
 doc.style.setProperty("--hero-back-y",(-scroll*.11).toFixed(1)+"px");
 doc.style.setProperty("--hero-mid-y",(scroll*.19).toFixed(1)+"px");
 doc.style.setProperty("--hero-content-y",small?"0px":(-scroll*.085).toFixed(1)+"px");
 doc.style.setProperty("--poster-y",small?"0px":(scroll*.14).toFixed(1)+"px");
 doc.style.setProperty("--poster-orbit-y",(-scroll*.075).toFixed(1)+"px");
 doc.style.setProperty("--poster-letter-y",(scroll*.048).toFixed(1)+"px");
 doc.style.setProperty("--poster-rotate",(small?0:amount*3.5).toFixed(2)+"deg");
}
if(cinema&&frame){
 const rect=cinema.getBoundingClientRect(),span=Math.max(1,cinema.offsetHeight-vh),p=clamp(-rect.top/span),active=rect.bottom>0&&rect.top<vh;
 if(active){
 const easing=p*p*(3-2*p);
 doc.style.setProperty("--cinema-scale",(1.00+easing*(small?.05:.13)).toFixed(3));
 doc.style.setProperty("--cinema-copy-y",(-easing*90).toFixed(1)+"px");
 doc.style.setProperty("--cinema-copy-opacity",clamp(1-p*1.65).toFixed(3));
 doc.style.setProperty("--scene-back-y",(-p*65).toFixed(1)+"px");
 doc.style.setProperty("--scene-front-y",(p*42).toFixed(1)+"px");
 doc.style.setProperty("--frame-y",(-p*10).toFixed(1)+"px");
 // Three distinct visual planes: foreground film, midground event, background product.
 // Each moves to a different depth as the main film grows on scroll.
 doc.style.setProperty("--chapter-card-depth",(1-easing*.28).toFixed(3));
 doc.style.setProperty("--chapter-card-fade",(1-easing*.32).toFixed(3));
 doc.style.setProperty("--depth-near-scale",(1.06-easing*.17).toFixed(3));
 doc.style.setProperty("--depth-mid-scale",(.95-easing*.21).toFixed(3));
 doc.style.setProperty("--depth-far-scale",(.83-easing*.19).toFixed(3));
 doc.style.setProperty("--depth-near-opacity",(1-easing*.13).toFixed(3));
 doc.style.setProperty("--depth-mid-opacity",(.91-easing*.24).toFixed(3));
 doc.style.setProperty("--depth-far-opacity",(.67-easing*.23).toFixed(3));
 doc.style.setProperty("--scene-rotation",(p*25).toFixed(1)+"deg");
 doc.style.setProperty("--frame-radius",(26-p*20).toFixed(1)+"px");
 doc.style.setProperty("--cinema-logo-opacity",clamp(1-p*2.0).toFixed(3));
 doc.style.setProperty("--cinema-phrase-opacity",clamp((p-.43)*3).toFixed(3));
 doc.style.setProperty("--phrase-y",((1-easing)*35).toFixed(1)+"px");
 }
}
if(!small){for(const card of cards){if(card.hidden)continue;const rect=card.getBoundingClientRect();if(rect.bottom<0||rect.top>vh)continue;const mid=rect.top+rect.height/2,phase=clamp((vh/2-mid)/(vh+rect.height)*2,-1,1);const media=card.querySelector(".work-media");if(media){media.style.setProperty("--work-art-y",(phase*14).toFixed(1)+"px");media.style.setProperty("--work-ambient-shift",(phase*29).toFixed(1)+"px");media.style.setProperty("--work-card-shift",(phase*5).toFixed(1)+"px")}}}
}
function schedule(){if(raf)return;raf=requestAnimationFrame(tick)}
window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule,{passive:true});
const year=one("#year");if(year)year.textContent=new Date().getFullYear();schedule();
})();