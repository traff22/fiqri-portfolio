/* Chapter One v1.3 — muted five-second excerpts with cross-dissolved YouTube players.
   Only loads embeds while the chapter is in view. Falls back to project posters
   when autoplay / embedding / network policy prevents playback. */
(()=>{"use strict";
const scene=document.querySelector("#cinema-wrap");
const shell=scene?.querySelector(".showreel-shell");
const montage=shell?.querySelector(".showreel-montage");
const images=montage?[...montage.querySelectorAll(".montage-shot")]:[];
const clipNodes=montage?[...montage.querySelectorAll(".montage-clip")]:[];
const panels=montage?[...montage.querySelectorAll(".montage-youtube-panel")]:[];
const nextButton=montage?.querySelector(".montage-skip");
const progress=montage?.querySelector(".montage-progress");
if(!scene||!shell||!montage||images.length!==2||panels.length!==2||!nextButton)return;

const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
const saveData=()=>!!navigator.connection?.saveData;
const beat=5000;
const fade=650;
const published=[...document.querySelectorAll("#work .work-card[data-status='published']")];
const projects=published.map(card=>{
 const media=card.querySelector(".work-media");
 const id=(media?.dataset.youtubeId||"").trim();
 if(!/^[\w-]{11}$/.test(id))return null;
 const tags=card.dataset.categories||"";
 return {
  id,
  slug:card.dataset.project,
  name:card.dataset.title||"Selected work",
  category:tags.includes("event")?"EVENT / MOTION":tags.includes("reels")?"SHORT-FORM / VERTICAL":tags.includes("motion")?"PRODUCT / MOTION":"FILM / STORY",
  format:card.dataset.format||"landscape",
  mp4:(media?.dataset.montageSrc||"").trim()
 };
}).filter(Boolean);
if(!projects.length)return;

const credit={
 count:montage.querySelector(".montage-credit__number"),
 title:montage.querySelector(".montage-credit__name"),
 kind:montage.querySelector(".montage-credit__category")
};
const players=[null,null];
const slots=[{ready:false,turn:0,seeked:false,video:""},{ready:false,turn:0,seeked:false,video:""}];
let started=false,active=false,visible=false,turn=0,picture=-1,current=null,order=[],last=null;
let timer=0,booting=false,apiReady=false,videoStarted=false,apiFailed=false;
let settleTimer=0,introTimer=0;
const pick=()=>{
 if(!started){started=true;return projects.find(x=>x.slug==="cinematic-mancing")||projects[0]}
 if(!order.length)order=[...projects].sort(()=>Math.random()-.5);
 const candidates=order.filter(x=>x.id!==last?.id&&x.category!==last?.category);
 const options=candidates.length?candidates:order.filter(x=>x.id!==last?.id);
 const choice=(options.length?options:order)[Math.floor(Math.random()*(options.length||order.length))];
 order.splice(order.indexOf(choice),1);
 return choice;
};
function safe(fn){try{fn()}catch(_){}}
function clearTime(){
 clearTimeout(timer);clearTimeout(settleTimer);clearTimeout(introTimer);
 timer=settleTimer=introTimer=0;
}
function restartProgress(){
 progress?.classList.remove("is-running");
 if(!active||reduceMotion.matches||saveData())return;
 void progress?.offsetWidth;
 progress?.classList.add("is-running");
}
function scheduleNext(ms=beat){
 clearTimeout(timer);
 if(active&&!reduceMotion.matches&&!saveData())timer=setTimeout(()=>advance(),ms);
}
function thumbnail(index,project){
 const img=images[index];
 let quality=0;
 const q=["maxresdefault","sddefault","hqdefault"];
 img.onerror=()=>{if(++quality<q.length)img.src="https://i.ytimg.com/vi/"+project.id+"/"+q[quality]+".jpg"};
 img.onload=()=>{
  if(img.naturalWidth<480&&quality<q.length-1){
   quality++;img.src="https://i.ytimg.com/vi/"+project.id+"/"+q[quality]+".jpg";
  }
 };
 img.src="https://i.ytimg.com/vi/"+project.id+"/"+q[0]+".jpg";
 img.dataset.format=project.format;
}
function stopNative(){
 for(const v of clipNodes){safe(()=>v.pause());v.classList.remove("is-current");v.hidden=true;v.removeAttribute("src");safe(()=>v.load())}
}
function useNative(project,idx,seq){
 stopNative();
 if(!/^assets\/[\w/.-]+\.(?:mp4|webm)(?:\?[\w.-]+)?$/i.test(project.mp4))return false;
 const video=clipNodes[idx];
 video.muted=true;video.playsInline=true;video.loop=true;video.preload="auto";
 video.hidden=false;
 video.oncanplay=()=>{
  if(seq!==turn||!active)return;
  video.play().then(()=>{
    if(seq!==turn)return;
    video.classList.add("is-current");
    scheduleNext(beat);
    restartProgress();
  }).catch(()=>{video.hidden=true});
 };
 video.onerror=()=>{video.hidden=true};
 video.src=project.mp4;
 safe(()=>video.load());
 return true;
}
function chooseStart(duration){
 if(!Number.isFinite(duration)||duration<=9)return 0;
 const latest=Math.max(0,duration-beat/1000-2);
 const earliest=duration>27?8:2;
 return Math.round(earliest+Math.random()*Math.max(0,latest-earliest));
}
function stopPlayers(){
 panels.forEach(panel=>panel.classList.remove("is-current"));
 players.forEach(player=>{if(player)safe(()=>{player.mute();player.pauseVideo()})});
}
function onState(i,event){
 if(!window.YT||event.data!==window.YT.PlayerState.PLAYING)return;
 const slot=slots[i];
 if(!active||slot.turn!==turn||!slot.ready||!players[i])return;
 const player=players[i];
 safe(()=>player.mute());
 if(!slot.seeked){
  slot.seeked=true;
  const offset=chooseStart(Number(safeDuration(player)));
  if(offset>0)safe(()=>player.seekTo(offset,true));
  // If seek briefly triggers BUFFERING, the next PLAYING state takes over.
  settleTimer=setTimeout(()=>{if(slot.turn===turn&&active&&safePlayerState(player)===1)presentVideo(i)},350);
  return;
 }
 presentVideo(i);
}
function safeDuration(player){try{return player.getDuration()||0}catch(_){return 0}}
function safePlayerState(player){try{return player.getPlayerState()}catch(_){return -1}}
function presentVideo(i){
 if(!active||slots[i].turn!==turn||videoStarted)return;
 videoStarted=true;
 panels[i].classList.add("is-current");
 panels[1-i].classList.remove("is-current");
 // Pause the retiring player only after the video crossfade finishes.
 const old=players[1-i],generation=turn;
 if(old)setTimeout(()=>{if(turn===generation)safe(()=>old.pauseVideo())},fade+80);
 scheduleNext(beat);
 restartProgress();
}
function onError(i){
 if(slots[i].turn===turn){
  panels[i].classList.remove("is-current");
  if(!timer)scheduleNext(beat);
 }
}
function initPlayers(){
 if(apiReady||apiFailed||!window.YT?.Player)return;
 apiReady=true;
 for(let i=0;i<2;i++){
  const root=document.getElementById("montage-youtube-"+(i===0?"a":"b"));
  if(!root)continue;
  try{
   players[i]=new window.YT.Player(root,{
    width:"100%",height:"100%",
    host:"https://www.youtube-nocookie.com",
    playerVars:{controls:0,autoplay:0,playsinline:1,disablekb:1,fs:0,iv_load_policy:3,rel:0,cc_load_policy:0,origin:location.origin},
    events:{
     onReady:e=>{
      slots[i].ready=true;
      safe(()=>{e.target.mute();e.target.setVolume(0)});
      if(active&&current&&slots[i].turn===turn)loadForTurn(i,current,turn);
      else if(active&&current&&players.every((p,j)=>!p||slots[j].ready))loadForCurrent();
     },
     onStateChange:e=>onState(i,e),
     onError:()=>onError(i),
     onAutoplayBlocked:()=>onError(i)
    }
   });
  }catch(_){apiFailed=true;break}
 }
}
function loadAPI(){
 if(booting||apiReady||apiFailed||reduceMotion.matches||saveData())return;
 booting=true;
 if(window.YT?.Player){initPlayers();return}
 const previous=window.onYouTubeIframeAPIReady;
 window.onYouTubeIframeAPIReady=()=>{if(typeof previous==="function")safe(previous);initPlayers()};
 const script=document.createElement("script");
 script.src="https://www.youtube.com/iframe_api";
 script.async=true;
 script.onerror=()=>{apiFailed=true};
 document.head.appendChild(script);
 // API failure leaves the thumbnail gallery fully usable.
}
function loadForTurn(i,project,seq){
 const player=players[i];if(!player||!slots[i].ready||!active)return;
 const slot=slots[i];slot.turn=seq;slot.seeked=false;slot.video=project.id;
 safe(()=>{
  player.mute();
  player.loadVideoById({videoId:project.id,startSeconds:0,suggestedQuality:"hd720"});
 });
}
function loadForCurrent(){
 if(!current||!active)return;
 const preferred=picture;
 if(slots[preferred]?.ready)loadForTurn(preferred,current,turn);
}
function advance(force=false){
 if(!active)return;
 if(reduceMotion.matches&&!force&&started)return;
 clearTime();
 const project=pick(),prev=picture;
 picture=picture===0?1:0;
 turn++;
 current=project;last=project;
 videoStarted=false;
 const seq=turn;
 thumbnail(picture,project);
 images[picture].classList.add("is-current");
 images[1-picture].classList.remove("is-current");
 panels.forEach(p=>p.classList.remove("is-current"));
 if(prev>=0)setTimeout(()=>{if(turn===seq)safe(()=>players[prev]?.pauseVideo())},fade+75);
 const number=String(projects.indexOf(project)+1).padStart(3,"0");
 if(credit.count)credit.count.textContent="FRAME "+number;
 if(credit.title)credit.title.textContent=project.name;
 if(credit.kind)credit.kind.textContent=project.category;
 shell.classList.add("is-montage-active");
 panels[picture].dataset.format=project.format;
 const hasNative=useNative(project,picture,seq);
 restartProgress();
 // Fallback keeps changing frames if the YouTube server does not respond.
 scheduleNext(beat);
 if(hasNative)return;
 if(slots[picture].ready)loadForTurn(picture,project,seq);
 else if(!apiReady)loadAPI();
}
function pause(){
 active=false;clearTime();stopPlayers();stopNative();
 progress?.classList.remove("is-running");
}
function resume(){
 if(active||!visible||document.hidden||shell.classList.contains("has-video"))return;
 active=true;
 if(!started){
  introTimer=setTimeout(()=>{introTimer=0;if(active)advance()},550);
 }else{
  advance(true);
 }
 if(!reduceMotion.matches&&!saveData())loadAPI();
}
nextButton.addEventListener("click",event=>{
 event.preventDefault();event.stopPropagation();
 if(!active){visible=true;resume()}
 advance(true);
});
if("IntersectionObserver" in window){
 const io=new IntersectionObserver(entries=>{
  visible=entries.some(e=>e.isIntersecting);
  if(visible)resume();else pause();
 },{threshold:.08,rootMargin:"80px 0px"});
 io.observe(scene);
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
reduceMotion.addEventListener?.("change",()=>{pause();resume()});
})();
