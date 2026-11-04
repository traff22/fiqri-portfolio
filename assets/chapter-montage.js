/* Chapter One V1.5 — actual video excerpts from published portfolio films.
   Source: the existing YouTube video IDs in Selected Work (+ event extras).
   No photo-animation assets are used. The official IFrame API remains inside
   YouTube's player and its branding cannot be disabled in every browser. */
(()=>{"use strict";
const scene=document.getElementById("cinema-wrap");
const shell=scene?.querySelector(".showreel-shell");
const stage=shell?.querySelector(".showreel-montage");
// Satellite cards: request the sharpest real project poster with safe fallbacks.
for(const img of scene?.querySelectorAll(".float-reel-card__poster")||[]){
 const id=img.getAttribute("src")?.match(/\/vi\/([\w-]{11})\//)?.[1];
 if(!id)continue;
 const qualities=["maxresdefault","sddefault","hqdefault"];
 let index=0;
 const apply=()=>{img.src="https://i.ytimg.com/vi/"+id+"/"+qualities[index]+".jpg"};
 const fallback=()=>{if(index<qualities.length-1){index++;apply()}};
 img.addEventListener("error",fallback);
 img.addEventListener("load",()=>{
  if(img.naturalWidth<600&&index<qualities.length-1)fallback();
 });
 apply();
}

const panels=stage?[...stage.querySelectorAll(".montage-stream")]:[];
const title=stage?.querySelector(".montage-title");
const clock=stage?.querySelector(".montage-timestamp");
const bar=stage?.querySelector(".montage-progress");
const skip=stage?.querySelector(".montage-skip");
const skipText=skip?.querySelector("span");
if(!scene||!stage||panels.length!==2||!title||!clock||!bar||!skip)return;

const ID=/^[A-Za-z0-9_-]{11}$/;
const FIVE_SECONDS=5000, FADE_MS=580, REVEAL_TIMEOUT=11000;
const extraFilms=[
 {id:"ytYOsh3ZcWc",title:"Counter Trend — Speaker",category:"event",format:"event"},
 {id:"AH1l-VdQj1I",title:"Counter Trend — Talkshow",category:"event",format:"event"},
 {id:"Vk4Me3JrLng",title:"Heavenly Whisper — Tuhan Pengharapanku",category:"event",format:"landscape"}
];
const fromCards=[...document.querySelectorAll("#work .work-card[data-status='published']")].map(card=>{
 const media=card.querySelector(".work-media[data-youtube-id]");
 const id=media?.dataset.youtubeId||"";
 if(!ID.test(id))return null;
 const categories=(card.dataset.categories||"").split(/\s+/);
 // Chapter One uses cinematic widescreen footage only. Reels (even motion
 // projects cross-tagged as Reels) remain available in their gallery filter.
 if(card.dataset.format==="portrait"||categories.includes("reels"))return null;
 return {
  id,
  title:card.dataset.title||"Selected work",
  category:categories.includes("event")?"event":categories.includes("motion")?"motion":"longform",
  format:card.dataset.format||"landscape",
  earliest:Math.max(0,Number(media.dataset.youtubeStart)||0)
 };
}).filter(Boolean);
const catalog=[...new Map([...fromCards,...extraFilms].map(x=>[x.id,x])).values()]
 .filter(item=>item.format!=="portrait"&&item.category!=="reels");
if(!catalog.length)return;
stage.dataset.sourceCount=String(catalog.length);
stage.dataset.sourceFormat="landscape-only";
stage.dataset.sourceIds=catalog.map(item=>item.id).join(",");
stage.dataset.previewMode="original-video-embed";

const slots=panels.map(()=>({player:null,ready:false,request:null}));
const failed=new Set();
let visible=false,enabled=false,apiReady=false,apiLoading=false,blocked=false;
let activeIndex=-1,current=null,bag=[],lastId="",lastCategory="";
let currentTimer=0,preloadTimer=0,watchdog=0,fadeTimer=0,clockRaf=0;
let timeStart=0,playhead=0,requestId=0,pendingPreload=null;

function safe(fn){try{return fn()}catch(_){return undefined}}
function clearTime(){
 clearTimeout(currentTimer);clearTimeout(preloadTimer);clearTimeout(watchdog);clearTimeout(fadeTimer);
 cancelAnimationFrame(clockRaf);clockRaf=0;
 currentTimer=preloadTimer=watchdog=fadeTimer=0;
}
function setProgress(ms){
 playhead=Math.max(0,Math.min(FIVE_SECONDS,ms));
 bar.style.setProperty("--segment-progress",(playhead/FIVE_SECONDS).toFixed(4));
 bar.setAttribute("aria-valuenow",String(Math.round(playhead/1000)));
 clock.textContent="00:"+String(Math.floor(playhead/1000)).padStart(2,"0")+" / 00:05";
}
function tick(now){
 if(!enabled||activeIndex<0)return;
 setProgress(now-timeStart);
 if(playhead>=FIVE_SECONDS){clockRaf=0;return}
 clockRaf=requestAnimationFrame(tick);
}
function reshuffle(){
 bag=catalog.filter(x=>!failed.has(x.id));
 for(let i=bag.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [bag[i],bag[j]]=[bag[j],bag[i]];
 }
}
function pick(){
 if(!bag.length)reshuffle();
 if(!bag.length)return null;
 const preferred=bag.find(x=>x.id!==lastId&&x.category!==lastCategory);
 const distinct=bag.find(x=>x.id!==lastId);
 const result=preferred||distinct||bag[0];
 bag.splice(bag.indexOf(result),1);
 lastId=result.id;lastCategory=result.category;
 return result;
}
function offsetFor(item,duration){
 if(!Number.isFinite(duration)||duration<=10)return Math.max(0,item.earliest||0);
 const minimum=Math.min(duration-6,Math.max(2,item.earliest||0));
 const upper=Math.max(minimum,duration-6.25);
 return Math.round(minimum+Math.random()*(upper-minimum));
}
function safePause(index){
 const player=slots[index]?.player;
 if(player)safe(()=>{player.mute();player.pauseVideo()});
}
function onFailure(index,error){
 const req=slots[index]?.request;
 if(!req)return;
 failed.add(req.item.id);
 if(pendingPreload?.index===index)pendingPreload=null;
 slots[index].request=null;
 if(req.mode==="activate"){
  clearTimeout(watchdog);
  if(failed.size>=catalog.length){
   enabled=false;
   title.textContent="Preview unavailable";
   clock.textContent="View selected work below";
   stage.dataset.playback="unavailable";
   skip.setAttribute("aria-label","Retry video previews");
   return;
  }
  if(enabled)nextVideo();
 }
}
function show(index,req){
 if(!enabled||slots[index].request!==req||req.shown)return;
 req.shown=true;req.mode="current";
 clearTimeout(watchdog);
 const previous=activeIndex;
 activeIndex=index;
 current=req.item;
 stage.dataset.playback="playing";
 stage.classList.add("is-playing");
 if(skipText)skipText.textContent="Next ↗";
 title.textContent=req.item.title;
 panels[index].dataset.format=req.item.format;
 panels[index].classList.add("is-current");
 if(previous>=0&&previous!==index){
  panels[previous].classList.remove("is-current");
  fadeTimer=setTimeout(()=>safePause(previous),FADE_MS+75);
 }
 setProgress(0);
 timeStart=performance.now();
 cancelAnimationFrame(clockRaf);
 clockRaf=requestAnimationFrame(tick);
 clearTimeout(currentTimer);clearTimeout(preloadTimer);
 currentTimer=setTimeout(switchToNext,FIVE_SECONDS);
 preloadTimer=setTimeout(prebufferNext,1400);
}
function handlePlaying(index){
 if(!enabled)return;
 const slot=slots[index],req=slot.request;
 if(!req||!slot.player)return;
 safe(()=>{slot.player.mute();slot.player.setVolume(0)});
 if(!req.seeked){
  req.seeked=true;
  const seconds=offsetFor(req.item,Number(safe(()=>slot.player.getDuration()))||0);
  if(seconds>0){
   req.seekValue=seconds;
   safe(()=>slot.player.seekTo(seconds,true));
   // Some players continue PLAYING without another state event after seek.
   setTimeout(()=>{
    if(safe(()=>slot.player.getPlayerState())===1)settle(index,req);
   },450);
   return;
  }
 }
 settle(index,req);
}
function settle(index,req){
 if(!enabled||slots[index].request!==req||req.settled)return;
 req.settled=true;
 if(req.mode==="preload"){
  req.mode="prepared";
  safePause(index);
  if(pendingPreload?.index===index)pendingPreload.ready=true;
 }else if(req.mode==="activate"){
  show(index,req);
 }
}
function prepare(index,item,mode){
 const slot=slots[index];
 if(!slot.ready||!slot.player)return false;
 const req={id:++requestId,item,mode,seeked:false,settled:false,shown:false};
 slot.request=req;
 panels[index].dataset.format=item.format;
 safe(()=>slot.player.mute());
 safe(()=>slot.player.setVolume(0));
 safe(()=>slot.player.loadVideoById({videoId:item.id,startSeconds:Math.max(0,item.earliest||0),suggestedQuality:"hd1080"}));
 if(mode==="activate"){
  clearTimeout(watchdog);
  watchdog=setTimeout(()=>{
   if(enabled&&slot.request===req&&!req.shown)onFailure(index,"timeout");
  },REVEAL_TIMEOUT);
 }
 return true;
}
function prebufferNext(){
 if(!enabled||activeIndex<0||pendingPreload||catalog.length<2)return;
 const other=1-activeIndex;
 const candidate=pick();
 if(!candidate)return;
 pendingPreload={index:other,item:candidate,ready:false};
 if(!prepare(other,candidate,"preload"))pendingPreload=null;
}
function switchToNext(){
 clearTimeout(currentTimer);clearTimeout(preloadTimer);
 if(!enabled)return;
 const next=activeIndex<0?0:1-activeIndex;
 const queued=pendingPreload;
 pendingPreload=null;
 if(queued&&queued.index===next&&slots[next].request?.item===queued.item){
  const req=slots[next].request;
  req.mode="activate";
  if(req.settled){
   req.settled=false;
   safe(()=>slots[next].player.playVideo());
   watchdog=setTimeout(()=>{
    if(enabled&&slots[next].request===req&&!req.shown)onFailure(next,"resume blocked");
   },REVEAL_TIMEOUT);
  }
 }else{
  const item=pick();
  if(item)prepare(next,item,"activate");
 }
}
function nextVideo(){
 if(!enabled)return;
 clearTimeout(currentTimer);clearTimeout(preloadTimer);clearTimeout(watchdog);
 const next=activeIndex<0?0:1-activeIndex;
 const item=pick();
 pendingPreload=null;
 if(item)prepare(next,item,"activate");
}
function initAPI(){
 if(apiReady||!window.YT?.Player)return;
 apiReady=true;
 for(let i=0;i<2;i++){
  const root=document.getElementById(i===0?"montage-real-a":"montage-real-b");
  if(!root)continue;
  try{
   slots[i].player=new window.YT.Player(root,{
    host:"https://www.youtube-nocookie.com",
    width:"100%",height:"100%",
    playerVars:{
     controls:0,autoplay:0,mute:1,playsinline:1,rel:0,disablekb:1,fs:0,
     iv_load_policy:3,cc_load_policy:0,origin:location.origin
    },
    events:{
     onReady:e=>{
      slots[i].ready=true;
      safe(()=>{e.target.mute();e.target.setVolume(0)});
      if(enabled&&slots.every(s=>s.ready))nextVideo();
     },
     onStateChange:e=>{
      if(e.data===window.YT.PlayerState.PLAYING)handlePlaying(i);
      else if(e.data===window.YT.PlayerState.ENDED&&slots[i].request?.mode==="current")switchToNext();
     },
     onError:()=>onFailure(i,"embedding or playback unavailable"),
     onAutoplayBlocked:()=>{
      blocked=true;
      stage.dataset.playback="blocked";
      skip.setAttribute("aria-label","Click to enable previews");
      if(skipText)skipText.textContent="Play ↗";
     }
    }
   });
  }catch(_){stage.dataset.playback="unavailable"}
 }
}
function loadAPI(){
 if(apiLoading)return;
 apiLoading=true;
 if(window.YT?.Player){initAPI();return}
 const prior=window.onYouTubeIframeAPIReady;
 window.onYouTubeIframeAPIReady=()=>{
  if(typeof prior==="function")safe(()=>prior());
  initAPI();
 };
 const script=document.createElement("script");
 script.src="https://www.youtube.com/iframe_api";
 script.async=true;
 script.onerror=()=>{stage.dataset.playback="unavailable";title.textContent="Preview unavailable"};
 document.head.appendChild(script);
}
function start(){
 if(enabled||!visible||document.hidden)return;
 enabled=true;stage.dataset.playback="loading";
 if(apiReady){
  if(slots.every(s=>s.ready))nextVideo();
 }else loadAPI();
}
function stop(){
 if(!enabled)return;
 enabled=false;clearTime();pendingPreload=null;
 slots.forEach((s,i)=>{safePause(i);s.request=null});
 activeIndex=-1;
 panels.forEach(p=>p.classList.remove("is-current"));
 stage.dataset.playback="paused";
}
skip.addEventListener("click",e=>{
 e.preventDefault();e.stopPropagation();
 if(blocked){blocked=false;stage.dataset.playback="loading"}
 if(!enabled){visible=true;start()}
 else nextVideo();
});
if("IntersectionObserver"in window){
 const io=new IntersectionObserver(entries=>{
  visible=entries.some(e=>e.isIntersecting);
  if(visible)start();else stop();
 },{threshold:.04,rootMargin:"180px 0px"});
 io.observe(shell);
 // Prewarm the official player API during the preceding hero section.
 const preloader=new IntersectionObserver(entries=>{
  if(entries.some(e=>e.isIntersecting)){loadAPI();preloader.disconnect()}
 },{rootMargin:"950px 0px"});
 preloader.observe(scene);
}else{
 const onScroll=()=>{
  const b=shell.getBoundingClientRect();
  visible=b.bottom>0&&b.top<innerHeight;
  if(visible)start();else stop();
 };
 window.addEventListener("scroll",onScroll,{passive:true});onScroll();loadAPI();
}
document.addEventListener("visibilitychange",()=>document.hidden?stop():start());
window.addEventListener("pagehide",stop);
})();
