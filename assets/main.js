(()=>{"use strict";
const one=(q)=>document.querySelector(q),all=(q)=>[...document.querySelectorAll(q)];
const menu=one("#mobile-menu"),nav=one("#navlinks");
menu?.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));menu.textContent=open?"Close":"Menu"});
all("#navlinks a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu?.setAttribute("aria-expanded","false");if(menu)menu.textContent="Menu"}));
const splash=one("#intro"),reduced=window.matchMedia("(prefers-reduced-motion: reduce)"),key="fiqri-intro-seen";
let introTimeout=null,exitTimeout=null;
function enter(){if(!splash||splash.hidden)return;splash.classList.add("exit");document.body.classList.remove("intro-active");try{sessionStorage.setItem(key,"yes")}catch{}clearTimeout(introTimeout);clearTimeout(exitTimeout);exitTimeout=setTimeout(()=>{splash.hidden=true;splash.classList.remove("exit")},720)}
function startIntro(force=false){if(!splash)return;const seen=(()=>{try{return sessionStorage.getItem(key)==="yes"}catch{return false}})();if(reduced.matches){splash.hidden=true;document.body.classList.remove("intro-active");return}if(!force&&seen){splash.hidden=true;document.body.classList.remove("intro-active");return}splash.hidden=false;splash.classList.remove("exit");document.body.classList.add("intro-active");one("#enter")?.focus();clearTimeout(introTimeout);introTimeout=setTimeout(enter,4200)}
if(splash){const video=splash.querySelector("video"),src=splash.dataset.splashSrc;if(src&&video){video.src=src;video.classList.remove("hidden");video.play().catch(()=>{})}startIntro(false)}
one("#enter")?.addEventListener("click",enter);one("#skip-intro")?.addEventListener("click",enter);
one("#replay")?.addEventListener("click",()=>{try{sessionStorage.removeItem(key)}catch{}window.scrollTo({top:0,behavior:reduced.matches?"instant":"smooth"});startIntro(true)});
document.addEventListener("keydown",e=>{if(e.key==="Escape")enter()});
reduced.addEventListener?.("change",()=>{if(reduced.matches)enter();schedule()});
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