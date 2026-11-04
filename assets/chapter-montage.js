/* Chapter One — curated frame shuffle.
 * Every preview comes from the user's actual Selected Work cards.
 * If a compressed teaser .mp4 is supplied later via data-montage-src on
 * .work-media, that shot plays silently; otherwise its YouTube poster
 * receives a gentle editorial push-in. No YouTube iframe roulette.
 */
(()=>{"use strict";
const scene=document.querySelector("#cinema-wrap");
const shell=scene?.querySelector(".showreel-shell");
const shots=shell?[...shell.querySelectorAll(".montage-shot")]:[];
const clips=shell?[...shell.querySelectorAll(".montage-clip")]:[];
const credit=shell?.querySelector(".montage-credit");
const number=shell?.querySelector(".montage-credit__number");
const name=shell?.querySelector(".montage-credit__name");
const category=shell?.querySelector(".montage-credit__category");
const progress=shell?.querySelector(".montage-progress");
if(!scene||!shell||shots.length!==2||clips.length!==2)return;

const reduced=matchMedia("(prefers-reduced-motion: reduce)");
const projects=[...document.querySelectorAll("#work .work-card[data-status='published']")]
 .map(card=>{
  const media=card.querySelector(".work-media");
  const id=(media?.dataset.youtubeId||"").trim();
  if(!/^[A-Za-z0-9_-]{11}$/.test(id))return null;
  const group=card.dataset.categories||"";
  const type=group.includes("event")?"EVENT FILMS":
             group.includes("reels")?"SHORT-FORM / ADS":
             group.includes("motion")?"MOTION / PRODUCT":
             "LONG-FORM / STORY";
  return {
   id, slug:card.dataset.project, name:card.dataset.title||"Selected film",
   category:type,
   format:card.dataset.format||"landscape",
   clip:(media?.dataset.montageSrc||"").trim()
  };
 }).filter(Boolean);
if(projects.length===0)return;

const initial=projects.find(p=>p.slug==="cinematic-mancing")||projects[0];
let pool=projects.filter(p=>p!==initial);
let last=null,visible=false,running=false,wasStarted=false;
let slot=-1,timer=0,loadTicket=0;
const beat=1700; // A brisk rhythm without unreadably flashing frames.
shell.style.setProperty("--montage-beat",beat+"ms");

function imageCandidates(id){
 return ["maxresdefault","sddefault","hqdefault"]
  .map(q=>"https://i.ytimg.com/vi/"+id+"/"+q+".jpg");
}
function loadPoster(id){
 const urls=imageCandidates(id);
 return new Promise((resolve,reject)=>{
  let current=0;
  let finished=false;
  const img=new Image();
  const timeout=setTimeout(()=>{if(!finished){finished=true;img.onload=null;img.onerror=null;reject(Error("Thumbnail timeout"))}},4500);
  function done(ok,url){
   if(finished)return;
   finished=true;clearTimeout(timeout);img.onload=null;img.onerror=null;
   ok?resolve(url):reject(Error("No thumbnail available"));
  }
  function tryNext(){
   if(finished)return;
   if(current>=urls.length){done(false);return}
   img.src=urls[current++];
  }
  img.onload=()=>{
   // YouTube sometimes serves a tiny default image when maxres is missing.
   if(img.naturalWidth<480&&current<urls.length){tryNext();return}
   done(true,img.src);
  };
  img.onerror=tryNext;
  tryNext();
 });
}
function draw(){
 if(!wasStarted){wasStarted=true;return initial}
 if(!pool.length)pool=[...projects];
 const different=pool.filter(p=>p.id!==last?.id&&p.category!==last?.category);
 const distinct=pool.filter(p=>p.id!==last?.id);
 const candidates=different.length?different:distinct.length?distinct:pool;
 const selected=candidates[Math.floor(Math.random()*candidates.length)];
 pool.splice(pool.indexOf(selected),1);
 return selected;
}
function stopClip(video){
 video.pause();
 video.hidden=true;
 video.classList.remove("is-current");
 video.removeAttribute("src");
 video.load();
 video.oncanplay=null;video.onerror=null;
}
function prepareClip(project,index,ticket){
 const video=clips[index];
 stopClip(video);
 if(!project.clip||!/^((assets\/)[^?#]+\.(mp4|webm))(\?.*)?$/i.test(project.clip))return;
 video.muted=true;video.loop=true;video.playsInline=true;video.preload="auto";
 video.oncanplay=()=>{
  if(ticket!==loadTicket||slot!==index||!running)return;
  video.hidden=false;
  video.classList.add("is-current");
  video.play().catch(()=>{video.hidden=true});
 };
 video.onerror=()=>{video.hidden=true};
 video.src=project.clip;
 video.load();
}
function restartProgress(){
 if(!progress)return;
 progress.classList.remove("is-running");
 void progress.offsetWidth;
 if(running&&!reduced.matches)progress.classList.add("is-running");
}
function showNext(){
 if(!running||shell.classList.contains("has-video"))return;
 const ticket=++loadTicket;
 const project=draw();
 loadPoster(project.id).then(poster=>{
  if(!running||ticket!==loadTicket)return;
  const next=slot===0?1:0;
  const image=shots[next];
  const old=slot===-1?null:shots[slot];
  if(slot!==-1)stopClip(clips[slot]);
  image.src=poster;
  image.dataset.format=project.format;
  image.classList.add("is-current");
  if(old)old.classList.remove("is-current");
  slot=next;last=project;
  shell.classList.add("is-montage-active");
  if(number)number.textContent="FRAME "+String(projects.indexOf(project)+1).padStart(3,"0");
  if(name)name.textContent=project.name;
  if(category)category.textContent=project.category;
  if(credit)credit.title=project.name;
  prepareClip(project,next,ticket);
  restartProgress();
  if(running&&!reduced.matches&&!navigator.connection?.saveData){
   timer=setTimeout(showNext,beat);
  }
 }).catch(()=>{
  if(!running||ticket!==loadTicket)return;
  // A broken remote poster must not break the remaining portfolio sequence.
  timer=setTimeout(showNext,450);
 });
}
function pause(){
 running=false;clearTimeout(timer);timer=0;loadTicket++;
 progress?.classList.remove("is-running");
 clips.forEach(v=>{if(!v.paused)v.pause()});
}
function resume(){
 if(running||!visible||document.hidden||shell.classList.contains("has-video"))return;
 running=true;
 if(!wasStarted){
  // Give the FQ monogram a short opening beat before the selected frames.
  timer=setTimeout(showNext,reduced.matches?0:850);
 }else if(reduced.matches||navigator.connection?.saveData){
  if(slot<0)showNext();
 }else{
  timer=setTimeout(showNext,180);
 }
}
if("IntersectionObserver" in window){
 const observer=new IntersectionObserver(entries=>{
  visible=entries.some(entry=>entry.isIntersecting);
  if(visible)resume();else pause();
 },{rootMargin:"25px 0px",threshold:0.09});
 observer.observe(scene);
}else{
 const check=()=>{
  const r=scene.getBoundingClientRect();
  visible=r.bottom>0&&r.top<innerHeight;
  if(visible)resume();else pause();
 };
 addEventListener("scroll",check,{passive:true});check();
}
document.addEventListener("visibilitychange",()=>{if(document.hidden)pause();else resume()});
window.addEventListener("pagehide",pause);
reduced.addEventListener?.("change",()=>{pause();resume()});
})();
