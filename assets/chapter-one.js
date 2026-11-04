/* Blue Hour V0.4 — subtle interactive depth + real video placeholders */
(()=>{"use strict";
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
const fine=window.matchMedia("(hover: hover) and (pointer: fine)");
const scene=$("#cinema-wrap");
const floating=$$(".float-reel-card");
const page=document.documentElement;
const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
const ease=t=>t*t*(3-2*t);

/* A data-video-src is intentionally empty in the template. No broken video loads.
   Add an approved asset path when the real footage is ready. */
const videoSlots=$$(".showreel-shell[data-video-src], .float-reel-card__media[data-video-src]");
const videoObservers=[];
const managedVideos=[];
function setVideoReady(slot,video){
 if(slot.dataset.videoReady==="yes")return;
 slot.dataset.videoReady="yes";
 video.hidden=false;
 const placeholder=$(".showreel-placeholder, .float-reel-card__placeholder",slot);
 if(placeholder)placeholder.hidden=true;
 slot.classList.add("has-video");
 const box=slot.getBoundingClientRect();
 if(!reduced.matches && box.bottom>0 && box.top<window.innerHeight)video.play().catch(()=>{});
 const sound=$(".showreel-sound",slot);
 if(sound){
  sound.hidden=false;
  sound.addEventListener("click",async()=>{
   video.muted=!video.muted;
   sound.textContent=video.muted?"Sound on ↗":"Mute sound ↗";
   sound.setAttribute("aria-label",video.muted?"Enable sound for showreel":"Mute showreel");
   if(video.paused){try{await video.play()}catch{}}
  });
 }
}
function initVideo(slot){
 const src=(slot.getAttribute("data-video-src")||"").trim();
 const video=$("video",slot);
 if(!src||!video)return;
 video.muted=true; video.loop=true; video.playsInline=true;
 video.preload="metadata";
 video.addEventListener("loadeddata",()=>setVideoReady(slot,video),{once:true});
 video.addEventListener("error",()=>{slot.classList.add("video-unavailable");console.warn("Portfolio video could not load:",src)},{once:true});
 managedVideos.push({slot,video,src,loaded:false});
}
videoSlots.forEach(initVideo);
function prepareVideo(entry){
 if(entry.loaded)return;
 entry.loaded=true;
 entry.video.src=entry.src;
 entry.video.load();
}
function syncPlayback(){
 for(const entry of managedVideos){
  const box=entry.slot.getBoundingClientRect();
  const visible=box.bottom>0&&box.top<innerHeight&&box.right>0&&box.left<innerWidth;
  if(!visible){if(!entry.video.paused)entry.video.pause();continue}
  if(!entry.loaded)prepareVideo(entry);
  if(entry.video.readyState>=2 && entry.video.paused && !reduced.matches)entry.video.play().catch(()=>{});
 }
}
if("IntersectionObserver"in window){
 const loadObs=new IntersectionObserver(entries=>{
  entries.forEach(it=>{if(it.isIntersecting){const entry=managedVideos.find(x=>x.slot===it.target);if(entry)prepareVideo(entry);}});
 },{rootMargin:"220px 0px",threshold:0});
 managedVideos.forEach(x=>loadObs.observe(x.slot));videoObservers.push(loadObs);
}

/* Scroll cards independently of the expanding main film frame.
   requestAnimationFrame batching avoids forced layouts per scroll event. */
let frame=0,lastViewportWidth=window.innerWidth;
function animate(){
 frame=0;
 if(!scene)return;
 if(reduced.matches){for(const c of floating){c.style.removeProperty("--float-y");c.style.removeProperty("--float-x");c.style.removeProperty("--float-rot");c.style.removeProperty("--float-scale");c.style.removeProperty("--float-opacity")}
  ["--shape-a-y","--shape-b-y","--shape-a-x","--shape-b-x","--shape-a-rot","--shape-b-rot","--showreel-message-y","--showreel-message-opacity","--glyph-angle"].forEach(k=>page.style.removeProperty(k));syncPlayback();return}
 const rect=scene.getBoundingClientRect(),vh=innerHeight||1,span=Math.max(1,scene.offsetHeight-vh);
 const p=clamp(-rect.top/span);
 if(rect.bottom>-vh*.3&&rect.top<vh*1.3){
  const e=ease(p),mobile=window.innerWidth<621;
  page.style.setProperty("--shape-a-y",(e*-85).toFixed(2)+"px");
  page.style.setProperty("--shape-b-y",(e*75).toFixed(2)+"px");
  page.style.setProperty("--shape-a-x",(e*25).toFixed(2)+"px");
  page.style.setProperty("--shape-b-x",(e*-35).toFixed(2)+"px");
  page.style.setProperty("--shape-a-rot",(e*10).toFixed(2)+"deg");
  page.style.setProperty("--shape-b-rot",(e*-17).toFixed(2)+"deg");
  page.style.setProperty("--glyph-angle",(e*8).toFixed(2)+"deg");
  page.style.setProperty("--showreel-message-y",(e*-12).toFixed(2)+"px");
  page.style.setProperty("--showreel-message-opacity",clamp(1-Math.max(0,p-.56)*2.8).toFixed(3));
  // Cinematic depth should be felt through relative size, light and distance,
  // not by ejecting the supporting cards beyond the viewport during scroll.
  const direction=[-1,1,-1];
  const drift=mobile?[5,6,5]:[11,13,15];
  const lift=mobile?[4,-7,3]:[9,-19,8];
  const spin=mobile?[.7,.9,.7]:[1.5,2.4,1.8];
  floating.forEach((card,i)=>{
   card.style.setProperty("--float-x",(direction[i]*(3+e*drift[i])).toFixed(2)+"px");
   card.style.setProperty("--float-y",(e*lift[i]).toFixed(2)+"px");
   card.style.setProperty("--float-rot",(direction[i]*e*spin[i]).toFixed(2)+"deg");
   card.style.setProperty("--float-scale",(1-e*.018).toFixed(3));
   card.style.setProperty("--float-opacity",(1-e*.04).toFixed(3));
  });
 }
 syncPlayback();
}
function schedule(){if(frame)return;frame=requestAnimationFrame(animate)}
window.addEventListener("scroll",schedule,{passive:true});
window.addEventListener("resize",()=>{if(window.innerWidth!==lastViewportWidth){lastViewportWidth=window.innerWidth;schedule()}},{passive:true});
reduced.addEventListener?.("change",schedule);

/* Local hover perspective. The cards remain non-clickable until real case study pages exist. */
function wirePointerTilt(selector,containerSelector,prefix,maxAngle){
 for(const item of $$(selector)){
  let pointerFrame=0,nextX=0,nextY=0;
  const surface=containerSelector?$(containerSelector,item):item;
  if(!surface)continue;
  const move=e=>{
   if(!fine.matches||reduced.matches||e.pointerType==="touch")return;
   const bounds=surface.getBoundingClientRect(),dx=clamp((e.clientX-bounds.left)/bounds.width)*2-1,dy=clamp((e.clientY-bounds.top)/bounds.height)*2-1;
   nextX=-dy*maxAngle;nextY=dx*maxAngle;
   if(pointerFrame)return;
   pointerFrame=requestAnimationFrame(()=>{
    pointerFrame=0;
    item.style.setProperty(prefix+"x",nextX.toFixed(2)+"deg");
    item.style.setProperty(prefix+"y",nextY.toFixed(2)+"deg");
   });
  };
  item.addEventListener("pointermove",move,{passive:true});
  item.addEventListener("pointerleave",()=>{
   if(pointerFrame)cancelAnimationFrame(pointerFrame);
   pointerFrame=0;
   item.style.setProperty(prefix+"x","0deg");item.style.setProperty(prefix+"y","0deg");
  });
 }
}
wirePointerTilt(".float-reel-card",".float-reel-card__inner","--float-tilt-",5.5);
wirePointerTilt(".work-card",".work-media","--tilt-",3.3);
schedule();
})();