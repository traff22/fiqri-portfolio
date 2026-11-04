/* Chapter One v1.4 — minimalist native HTML5 showreel.
   No YouTube iframe, channel overlays, titles, pause buttons, end cards, or logos.
   Current teasers are lightweight motion treatments of user-provided event photos;
   replace the src paths below with approved footage clips when available. */
(()=>{"use strict";
const scene=document.querySelector("#cinema-wrap");
const shell=scene?.querySelector(".showreel-shell");
const montage=shell?.querySelector(".showreel-montage");
const videos=montage?[...montage.querySelectorAll("video.montage-clip")]:[];
const skip=montage?.querySelector(".montage-skip");
const title=montage?.querySelector(".montage-title");
const clock=montage?.querySelector(".montage-timestamp");
const timeline=montage?.querySelector(".montage-progress");
if(!scene||!shell||!montage||videos.length!==2||!skip||!title||!clock||!timeline)return;

const DURATION=5000,FADE=500;
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
const saveData=()=>!!navigator.connection?.saveData;
const clips=[
 {title:"Age of Chaos",src:"assets/showreel/age-of-chaos-stage.mp4"},
 {title:"Counter Trend",src:"assets/showreel/counter-trend-venue.mp4"},
 {title:"Behind the Scenes",src:"assets/showreel/age-of-chaos-crew.mp4"}
];
let visible=false,running=false,started=false,currentIndex=-1,current=null;
let queued=null,queueIndex=-1,lastTitle="",queue=[],generation=0,raf=0,frameStart=0;
let pauseTimeout=0,retryTimeout=0;

const selectNext=()=>{
 if(queue.length===0)queue=[...clips];
 const notSame=queue.filter(x=>x.title!==lastTitle);
 const available=notSame.length?notSame:queue;
 const selected=available[Math.floor(Math.random()*available.length)];
 queue.splice(queue.indexOf(selected),1);
 return selected;
};
function timecode(ms){
 return "00:"+String(Math.min(5,Math.floor(ms/1000))).padStart(2,"0");
}
function showProgress(ms){
 const value=Math.min(DURATION,Math.max(0,ms));
 timeline.style.setProperty("--segment-progress",(value/DURATION).toFixed(4));
 timeline.setAttribute("aria-valuenow",String(Math.round(value/1000)));
 clock.textContent=timecode(value)+" / 00:05";
}
function cancelFrame(){if(raf)cancelAnimationFrame(raf);raf=0}
function prepare(index,item){
 const v=videos[index];
 v.muted=true;v.volume=0;v.defaultMuted=true;
 v.playsInline=true;v.loop=true;v.autoplay=false;
 if(v.dataset.clip!==item.src){
  v.dataset.clip=item.src;
  v.src=item.src;
  v.preload="auto";
  v.load();
 }
}
function ready(video,seq){
 if(video.readyState>=HTMLMediaElement.HAVE_CURRENT_DATA)return Promise.resolve();
 return new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>finish(false),2800);
  const finish=ok=>{
   clearTimeout(timeout);
   video.removeEventListener("loadeddata",onReady);
   video.removeEventListener("error",onFail);
   if(seq!==generation)return reject(Error("stale load"));
   ok?resolve():reject(Error("video not ready"));
  };
  const onReady=()=>finish(true),onFail=()=>finish(false);
  video.addEventListener("loadeddata",onReady,{once:true});
  video.addEventListener("error",onFail,{once:true});
 });
}
function prebuffer(){
 if(!running||reduced.matches||saveData())return;
 const inactive=currentIndex===0?1:0;
 queued=selectNext();queueIndex=inactive;
 prepare(inactive,queued);
}
function tick(now){
 if(!running||!current)return;
 const elapsed=Math.min(DURATION,now-frameStart);
 showProgress(elapsed);
 if(elapsed>=DURATION){
  cancelFrame();
  changeClip();
 }else{
  raf=requestAnimationFrame(tick);
 }
}
async function changeClip(force=false){
 if(!running)return;
 cancelFrame();
 clearTimeout(retryTimeout);retryTimeout=0;
 const seq=++generation;
 const next=currentIndex===0?1:0;
 let item=queued&&queueIndex===next?queued:(!started?clips[0]:selectNext());
 queued=null;queueIndex=-1;
 if(!started){started=true;item=clips[0]}
 const nextVideo=videos[next];
 const oldIndex=currentIndex;
 try{
  prepare(next,item);
  await ready(nextVideo,seq);
  if(!running||seq!==generation)return;
  nextVideo.currentTime=0;
  await nextVideo.play();
  if(!running||seq!==generation){nextVideo.pause();return}
  currentIndex=next;
  current=item;
  lastTitle=item.title;
  nextVideo.classList.add("is-current");
  nextVideo.style.visibility="visible";
  if(oldIndex>=0){
   const old=videos[oldIndex];
   old.classList.remove("is-current");
   clearTimeout(pauseTimeout);
   pauseTimeout=setTimeout(()=>{if(currentIndex!==oldIndex)old.pause()},FADE+50);
  }
  shell.classList.add("is-montage-active");
  title.textContent=item.title;
  showProgress(0);
  frameStart=performance.now();
  if(!reduced.matches&&!saveData())raf=requestAnimationFrame(tick);
  prebuffer();
 }catch(_){
  // Never display a broken player or branding. Keep the existing film if loaded;
  // otherwise use the clean blue placeholder while trying another local clip.
  if(running&&seq===generation)retryTimeout=setTimeout(()=>changeClip(),1600);
 }
}
function stop(){
 running=false;generation++;
 cancelFrame();
 clearTimeout(pauseTimeout);clearTimeout(retryTimeout);
 videos.forEach(v=>{if(!v.paused)v.pause()});
}
function start(){
 if(running||!visible||document.hidden)return;
 running=true;
 if(currentIndex>=0){
  const v=videos[currentIndex];
  v.play().then(()=>{
   if(!running)return;
   frameStart=performance.now();
   if(!reduced.matches&&!saveData())raf=requestAnimationFrame(tick);
  }).catch(()=>changeClip());
 }else changeClip();
}
skip.addEventListener("click",event=>{
 event.preventDefault();
 event.stopPropagation();
 if(!running){visible=true;start();return}
 changeClip(true);
});
// Preload immediately: these are 43–46 KB MP4 previews, not remote embeds.
prepare(0,clips[0]);
if("IntersectionObserver" in window){
 const observer=new IntersectionObserver(entries=>{
  visible=entries.some(e=>e.isIntersecting);
  if(visible)start();else stop();
 },{rootMargin:"90px 0px",threshold:.08});
 observer.observe(shell);
}else{
 function onScroll(){
  const r=shell.getBoundingClientRect();
  visible=r.bottom>0&&r.top<window.innerHeight;
  if(visible)start();else stop();
 }
 window.addEventListener("scroll",onScroll,{passive:true});
 onScroll();
}
document.addEventListener("visibilitychange",()=>document.hidden?stop():start());
window.addEventListener("pagehide",stop);
reduced.addEventListener?.("change",()=>{
 if(reduced.matches){cancelFrame();showProgress(0)}
 else if(running&&current){frameStart=performance.now();raf=requestAnimationFrame(tick)}
});
})();
