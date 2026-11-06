/* Fiqri Portfolio — gallery interactions. Placeholder media never pretends to be uploaded footage. */
(()=>{"use strict";
const $=(q,r=document)=>r.querySelector(q);
const $$=(q,r=document)=>[...r.querySelectorAll(q)];
const cards=$$(".selected-work .work-card"),filters=$$(".selected-work .filter"),count=$("#work-count");
const gallerySection=$(".selected-work");
const galleryGrid=$(".selected-work .work-grid");
// The collage pairs complementary media ratios. Slots are assigned to visible cards
// automatically on every filter change; added projects fall back to an even grid.
let activeGalleryMode="highlights";
function galleryColumnCount(mode){
 const mobile=window.innerWidth<=640;
 const compact=window.innerWidth<=920;
 if(mode==="longform")return mobile?1:2;
 return compact?2:3;
}
function setGalleryMode(kind){
 activeGalleryMode=kind;
 const masonry=kind==="all"||kind==="motion"||kind==="longform";
 gallerySection?.classList.toggle("gallery-collage",kind==="highlights"||kind==="motion"||masonry);
 if(gallerySection)gallerySection.dataset.galleryMode=kind;
 if(!galleryGrid)return;
 // Rebuild from canonical project order when switching modes; this restores
 // cards moved into masonry columns and retains their native click handlers.
 galleryGrid.replaceChildren(...cards);
 galleryGrid.removeAttribute("data-column-count");
 if(masonry){
  const count=galleryColumnCount(kind);
  const gap=window.innerWidth<=640?9:14;
  const width=(galleryGrid.clientWidth-gap*(count-1))/count;
  const heights=Array(count).fill(0);
  const cols=Array.from({length:count},(_,i)=>{
   const node=document.createElement("div");
   node.className="gallery-column";
   node.dataset.column=String(i+1);
   return node;
  });
  for(const card of cards){
   if(card.hidden)continue;
   const targetRatio=card.dataset.format==="portrait"?9/16:16/9;
   const index=heights.indexOf(Math.min(...heights));
   cols[index].appendChild(card);
   heights[index]+=width/targetRatio+gap;
  }
  galleryGrid.replaceChildren(...cols,...cards.filter(card=>card.hidden));
  galleryGrid.style.setProperty("--gallery-columns",String(count));
  galleryGrid.setAttribute("data-column-count",String(count));
 }else{
  galleryGrid.style.removeProperty("--gallery-columns");
 }
 galleryGrid.setAttribute("aria-label",masonry?"Balanced project collage":"Filtered project gallery");
}
let resizeFrame=0;
window.addEventListener("resize",()=>{
 if(!["all","motion","longform"].includes(activeGalleryMode))return;
 if(resizeFrame)cancelAnimationFrame(resizeFrame);
 resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;setGalleryMode(activeGalleryMode)});
},{passive:true});

function filterWork(kind){
 filters.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.filter===kind)));
 let shown=0;
 cards.forEach(card=>{
  const categories=(card.dataset.categories||"").split(/\s+/).filter(Boolean);
  const visible=kind==="all"||(kind==="highlights"?card.dataset.featured==="true":categories.includes(kind));
  card.hidden=!visible;
  if(visible){shown++;card.classList.add("visible");}
 });
 if(count)count.textContent=String(shown);
 const status=$(".work-filter-status");if(status){status.setAttribute("data-active-filter",kind);const suffix=kind==="highlights"?(shown===1?" highlighted project":" highlighted projects"):(shown===1?" project":" projects");const label=status.querySelector("[data-count-label]");if(label)label.textContent=suffix;else status.replaceChildren(count||document.createTextNode(String(shown)),document.createTextNode(suffix));}
 setGalleryMode(kind);
}
filters.forEach(button=>button.addEventListener("click",()=>{stopAllHoverPreviews();filterWork(button.dataset.filter)}));
filterWork("highlights");

// Youtube posters are present in HTML, so thumbnails render even before this JS runs.
// This is progressive enhancement for loading state and optional external image posters.
// Upgrade YouTube thumbnail quality. Some channels do not publish maxres;
 // YouTube sometimes answers 404 thumbnails with a tiny 120x90 JPEG.
function thumbnailFor(id,quality="maxresdefault"){
 return "https://i.ytimg.com/vi/"+encodeURIComponent(id)+"/"+quality+".jpg";
}
function setThumbnailWithFallback(img,id){
 if(!img||!/^[A-Za-z0-9_-]{11}$/.test(id))return;
 const choices=["maxresdefault","sddefault","hqdefault"];
 let choice=0;
 function next(){
  if(choice>=choices.length-1){img.hidden=true;img.closest(".work-media")?.classList.remove("has-poster");return;}
  choice++;
  img.src=thumbnailFor(id,choices[choice]);
 }
 img.onerror=next;
 img.onload=()=>{
  if(img.naturalWidth<480&&choice<choices.length-1){next();return}
  img.hidden=false;
  img.closest(".work-media")?.classList.add("has-poster");
 };
 img.src=thumbnailFor(id);
 if(img.complete){
  if(img.naturalWidth>=480){img.hidden=false;img.closest(".work-media")?.classList.add("has-poster")}
  else next();
 }
}
cards.forEach(card=>{
 const media=$(".work-media",card);if(!media)return;
 const id=(media.dataset.youtubeId||"").trim();
 let img=$(".work-poster",media);
 if(!img&&(id||media.dataset.posterSrc)){
  img=document.createElement("img");img.className="work-poster";img.alt="";img.width=1280;img.height=720;
  img.loading="lazy";img.decoding="async";media.prepend(img);
 }
 if(!img)return;
 if(id)setThumbnailWithFallback(img,id);
 else{
  const poster=(media.dataset.posterSrc||"").trim();
  if(poster){img.src=poster;img.addEventListener("load",()=>media.classList.add("has-poster"),{once:true})}
 }
});

/* Desktop hover: launch a muted video preview as soon as pointer enters.
   Touch/reduced-motion/save-data never loads a hovering iframe. Clicking
   always opens the independent player dialog with full controls. */
const finePointer=window.matchMedia("(hover: hover) and (pointer: fine)");
const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
const canHoverPreview=()=>finePointer.matches&&!reducedMotion.matches&&!navigator.connection?.saveData&&!videoDialog?.open&&!eventDialog?.open&&Date.now()>hoverCooldownUntil;
let hoverCooldownUntil=0;
let activeHover=null;
function stopHoverPreview(card){
 if(!card)return;
 if(card._hoverTimer){clearTimeout(card._hoverTimer);card._hoverTimer=0;}
 $$(".work-hover-video",card).forEach(frame=>{
  // Unload and remove the browsing context; merely hiding an iframe doesn't stop media.
  frame.setAttribute("src","about:blank");
  frame.remove();
 });
 const media=$(".work-media",card);
 media?.classList.remove("is-previewing");
 if(activeHover===card)activeHover=null;
}
function queueHoverPreview(card){
 const media=$(".work-media",card);
 const id=(media?.dataset.youtubeId||"").trim();
 if(!canHoverPreview()||!/^[A-Za-z0-9_-]{11}$/.test(id)||card.hidden)return;
 if(activeHover&&activeHover!==card)stopHoverPreview(activeHover);
 // Start immediately on pointer enter. Network buffering is YouTube-dependent;
 // don't add the old artificial 650ms timer.
 stopHoverPreview(card);
 activeHover=card;
 const iframe=document.createElement("iframe");
 iframe.className="work-hover-video";
 iframe.title="Muted preview";
 iframe.tabIndex=-1;
 iframe.loading="eager";
 iframe.setAttribute("aria-hidden","true");
 iframe.setAttribute("allow","autoplay; encrypted-media; picture-in-picture");
 const url=new URL("https://www.youtube-nocookie.com/embed/"+id);
 url.searchParams.set("autoplay","1");
 url.searchParams.set("mute","1");
 url.searchParams.set("controls","0");
 url.searchParams.set("playsinline","1");
 url.searchParams.set("rel","0");
 url.searchParams.set("loop","1");
 url.searchParams.set("playlist",id);
 url.searchParams.set("modestbranding","1");
 const start=Math.max(0,Math.min(36000,Number(media.dataset.youtubeStart)||0));
 if(start)url.searchParams.set("start",String(start));
 iframe.addEventListener("load",()=>{
  if(activeHover===card)media.classList.add("is-previewing");
 },{once:true});
 iframe.src=url.toString();
 media.appendChild(iframe);
}

cards.forEach(card=>{
 if(!$(".work-media[data-youtube-id]",card))return;
 card.addEventListener("pointerenter",()=>queueHoverPreview(card));
 card.addEventListener("pointerleave",()=>stopHoverPreview(card));
 card.addEventListener("focusout",()=>stopHoverPreview(card));
});

const eventDialog=$("#event-dialog"),videoDialog=$("#video-dialog"),player=$("#video-player"),externalLink=$("#video-external-link"),waiting=$("#video-awaiting");
let youtube=$("#youtube-player");
const youtubeTemplate=youtube?.cloneNode(false)||null;
const youtubeContainer=$(".video-player-frame",videoDialog);
function stopAllHoverPreviews(){
 cards.forEach(stopHoverPreview);
 activeHover=null;
}
function stopVideoPlayback(){
 // Stop native MP4 AND destroy YouTube's embedded player browsing context.
 if(player){player.pause();player.removeAttribute("src");player.load();player.hidden=true;}
 if(youtube){
  youtube.setAttribute("src","about:blank");
  youtube.remove();
  youtube=null;
 }
 if(externalLink){externalLink.hidden=true;externalLink.removeAttribute("href");}
}
function newYoutubePlayer(){
 if(!youtubeTemplate||!youtubeContainer)return null;
 const frame=youtubeTemplate.cloneNode(false);
 frame.id="youtube-player";
 frame.hidden=true;
 youtubeContainer.appendChild(frame);
 youtube=frame;
 return frame;
}
let priorFocus=null;
const events={
 "age-of-chaos":{
  title:"Age of Chaos",year:"2025",
  summary:"Stage graphics, a banner video and photos of the people behind the production.",
  contribution:"Event visuals, motion and cinematic documentation. Photos supplied from the event archive.",
  videos:[{id:"c9wCgrjlUhk",label:"Event banner",type:"Main banner film"}],
  photos:[
   {src:"assets/events/age-of-chaos/stage.webp",caption:"Stage visuals, Age of Chaos",alt:"Age of Chaos event stage and digital backdrop"},
   {src:"assets/events/age-of-chaos/crew.webp",caption:"Production crew",alt:"Crew members with a cinema camera at Age of Chaos"}
  ]
 },
 "counter-trend":{
  title:"Counter Trend",year:"EVENT VISUALS",
  summary:"An event visual package spanning looping screens, speaker visuals and talkshow material.",
  contribution:"Stage-screen motion assets and event visuals, accompanied by venue documentation.",
  videos:[
   {id:"e4LDw8UeBVM",label:"Banner loop",type:"Main stage loop"},
   {id:"ytYOsh3ZcWc",label:"Speaker",type:"Speaker visual"},
   {id:"AH1l-VdQj1I",label:"Talkshow",type:"Talkshow visual"}
  ],
  photos:[{src:"assets/events/counter-trend/venue.webp",caption:"Counter Trend venue and stage",alt:"Counter Trend venue with stage screen and audience seating"}]
 },
 "heavenly-whisper":{
  title:"Heavenly Whisper",year:"EVENT & MUSIC",
  summary:"An opening bumper and a separate music video brought together in one event collection.",
  contribution:"Bumper and music video editing / motion work.",
  videos:[
   {id:"ydwCKwjdPHI",label:"Event bumper",type:"Opening visual"},
   {id:"Vk4Me3JrLng",label:"Tuhan Pengharapanku",type:"Music video"}
  ],
  photos:[]
 }
};
const eventFeature=$("#event-feature-player");
const eventFeaturePoster=$("#event-feature-poster");
const eventPlayButton=$("#event-main-play");
const eventPlayLabel=$("#event-main-play-label");
const eventVideoList=$("#event-video-list");
const eventPhotoList=$("#event-photo-list");
let activeEventVideo=null,activeEventIframe=null,activeEventConfig=null;
function youtubeThumb(id){return thumbnailFor(id,"maxresdefault")}
function makeEventIframe(id){
 const frame=document.createElement("iframe");
 frame.className="event-video-frame";
 frame.title="Playing event video";
 frame.setAttribute("allow","accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
 frame.setAttribute("allowfullscreen","");
 frame.setAttribute("referrerpolicy","strict-origin-when-cross-origin");
 const embed=new URL("https://www.youtube-nocookie.com/embed/"+id);
 embed.searchParams.set("autoplay","1");
 embed.searchParams.set("rel","0");
 frame.src=embed.toString();
 return frame;
}
function stopEventPlayback(){
 if(activeEventIframe){
  activeEventIframe.src="about:blank";
  activeEventIframe.remove();
  activeEventIframe=null;
 }
 eventFeature?.classList.remove("is-playing");
 if(eventFeaturePoster)eventFeaturePoster.hidden=false;
 if(eventPlayButton)eventPlayButton.hidden=!activeEventVideo;
}
function showEventVideo(video,shouldPlay=false){
 stopEventPlayback();
 activeEventVideo=video||null;
 const valid=video&&/^[A-Za-z0-9_-]{11}$/.test(video.id);
 if(eventFeature){
  eventFeature.classList.toggle("is-empty",!valid);
 }
 if(eventFeaturePoster){eventFeaturePoster.hidden=!valid;
  if(valid)setThumbnailWithFallback(eventFeaturePoster,video.id);
  else eventFeaturePoster.removeAttribute("src");
 }
 if(eventPlayButton)eventPlayButton.hidden=!valid;
 if(eventPlayLabel)eventPlayLabel.textContent=video?"Play "+video.label:"No video available yet";
 const empty=$("#event-feature-empty");if(empty)empty.hidden=!!valid;
 $$(".event-video-choice",eventVideoList).forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.videoId===video?.id)));
 const external=$("#event-video-external");
 if(external){
  external.hidden=!valid;
  if(valid)external.href="https://www.youtube.com/watch?v="+video.id;
  else external.removeAttribute("href");
 }
 if(valid&&shouldPlay&&eventFeature){
  const frame=makeEventIframe(video.id);
  activeEventIframe=frame;
  eventFeature.appendChild(frame);
  eventFeature.classList.add("is-playing");
  if(eventPlayButton)eventPlayButton.hidden=true;
 }
}
eventPlayButton?.addEventListener("click",()=>{if(activeEventVideo)showEventVideo(activeEventVideo,true)});
function renderEventVideos(videos){
 if(!eventVideoList)return;
 eventVideoList.replaceChildren();
 for(const video of videos){
  const button=document.createElement("button");
  button.type="button";
  button.className="event-video-choice";
  button.dataset.videoId=video.id;
  button.setAttribute("aria-pressed","false");
  const image=document.createElement("img");
  image.alt="";image.width=480;image.height=270;image.loading="lazy";image.decoding="async";setThumbnailWithFallback(image,video.id);
  const body=document.createElement("span");body.className="event-video-choice__text";
  const label=document.createElement("strong");label.textContent=video.label;
  const desc=document.createElement("small");desc.textContent=video.type;
  body.append(label,desc);button.append(image,body);
  button.addEventListener("click",()=>showEventVideo(video,true));
  eventVideoList.appendChild(button);
 }
 const count=$("#event-video-count");if(count)count.textContent=videos.length+" video"+(videos.length===1?"":"s");
 const heading=$("#event-videos-heading");if(heading)heading.hidden=videos.length<=1;
 eventVideoList.hidden=videos.length<=1;
}
function renderEventPhotos(photos){
 if(!eventPhotoList)return;
 eventPhotoList.replaceChildren();
 const section=$("#event-photo-section");
 if(section)section.hidden=photos.length===0;
 for(const photo of photos){
  const fig=document.createElement("figure");fig.className="event-photo";
  const img=document.createElement("img");
  img.src=photo.src;img.alt=photo.alt;img.width=640;img.height=427;img.loading="lazy";img.decoding="async";
  const cap=document.createElement("figcaption");cap.textContent=photo.caption;
  fig.append(img,cap);eventPhotoList.appendChild(fig);
 }
 const count=$("#event-photo-count");if(count)count.textContent=photos.length+" photos";
}

function openModal(dialog,origin){
 if(!dialog)return;
 if(videoDialog?.open&&dialog!==videoDialog)closeModal(videoDialog);
 if(eventDialog?.open&&dialog!==eventDialog)closeModal(eventDialog);
 priorFocus=origin||document.activeElement;
 if(typeof dialog.showModal==="function")dialog.showModal();
 else dialog.setAttribute("open","");
 document.body.classList.add("modal-open");
 $(".dialog-close",dialog)?.focus({preventScroll:true});
}
function closeModal(dialog){
 if(!dialog)return;
 stopAllHoverPreviews();
 hoverCooldownUntil=Date.now()+900;
 if(dialog===videoDialog)stopVideoPlayback(); // synchronous, before the close animation/event
 if(dialog===eventDialog)stopEventPlayback();
 if(dialog.open&&typeof dialog.close==="function")dialog.close();
 else{dialog.removeAttribute("open");onModalClosed();}
}
function onModalClosed(){
 if(!eventDialog?.open&&!videoDialog?.open)document.body.classList.remove("modal-open");
 if(eventDialog&&!eventDialog.open)stopEventPlayback();
 if(videoDialog&&!videoDialog.open){
  stopVideoPlayback(); // also covers native Escape or external calls to dialog.close()
  stopAllHoverPreviews();
  hoverCooldownUntil=Date.now()+900;
 }
 if(priorFocus?.isConnected){priorFocus.focus({preventScroll:true});priorFocus=null;}
}
[eventDialog,videoDialog].filter(Boolean).forEach(dialog=>{
 dialog.addEventListener("close",onModalClosed);
 dialog.addEventListener("click",e=>{if(e.target===dialog)closeModal(dialog)});
 dialog.addEventListener("cancel",()=>{ // Escape: stop audio before the native close event
  stopAllHoverPreviews();
  hoverCooldownUntil=Date.now()+900;
  if(dialog===videoDialog)stopVideoPlayback();
  if(dialog===eventDialog)stopEventPlayback();
 });
 $$("[data-close-dialog]",dialog).forEach(btn=>btn.addEventListener("click",()=>closeModal(dialog)));
});
function openEvent(card,trigger){
 const config=events[card.dataset.project];
 if(!config||!eventDialog)return;
 stopAllHoverPreviews();
 activeEventConfig=config;
 $("#event-dialog-title").textContent=config.title;
 $("#event-dialog-year").textContent=config.year;
 $("#event-dialog-summary").textContent=config.summary;
 $("#event-dialog-contribution").textContent=config.contribution;
 renderEventVideos(config.videos);
 renderEventPhotos(config.photos);
 showEventVideo(config.videos[0]||null,false); // quiet thumbnail first; audio starts only on click
 openModal(eventDialog,trigger);
}
function openVideo(card,trigger){
 if(!videoDialog||!player)return;
 stopAllHoverPreviews();
 $("#video-dialog-title").textContent=card.dataset.title||"Video project";
 const note=card.querySelector(":scope > p");
 $("#video-dialog-description").textContent=note?.textContent||"";
 const wrapper=$(".video-player-frame",videoDialog);
 wrapper?.classList.toggle("is-portrait",card.dataset.format==="portrait");
 const media=$(".work-media",card);
 const src=(media?.dataset.videoSrc||"").trim();
 const ytId=(media?.dataset.youtubeId||"").trim();
 const start=Math.max(0,Math.min(36000,Number(media?.dataset.youtubeStart)||0));
 stopVideoPlayback();
 if(waiting)waiting.hidden=true;
 // User-supplied YouTube links play only on click. No heavyweight iframe before opening.
 if(/^[A-Za-z0-9_-]{11}$/.test(ytId)&&youtubeTemplate){
  const embed=new URL("https://www.youtube-nocookie.com/embed/"+ytId);
  embed.searchParams.set("autoplay","1");
  embed.searchParams.set("rel","0");
  if(start>0)embed.searchParams.set("start",String(start));
  const frame=newYoutubePlayer();
  if(frame){frame.src=embed.toString();frame.hidden=false;}
  if(externalLink){
   externalLink.href="https://www.youtube.com/watch?v="+ytId+(start>0?"&t="+start+"s":"");
   externalLink.hidden=false;
   externalLink.textContent="Watch on YouTube ↗";
  }
  openModal(videoDialog,trigger);
 }else if(src){
  player.src=src;player.hidden=false;
  openModal(videoDialog,trigger);
  player.play().catch(()=>{});
 }else{
  if(waiting)waiting.hidden=false;
  openModal(videoDialog,trigger);
 }
}
$$(".work-trigger").forEach(trigger=>trigger.addEventListener("click",()=>{
 const card=trigger.closest(".work-card");if(!card)return;
 if(trigger.dataset.open==="event")openEvent(card,trigger);else openVideo(card,trigger);
}));
// Never leave embedded audio running when the tab is hidden or navigated away.
document.addEventListener("visibilitychange",()=>{if(document.hidden){
 stopAllHoverPreviews();stopVideoPlayback();stopEventPlayback();
 if(videoDialog?.open)closeModal(videoDialog);
 if(eventDialog?.open)closeModal(eventDialog);
}});
window.addEventListener("pagehide",()=>{stopAllHoverPreviews();stopVideoPlayback();stopEventPlayback();});
})();

/* Any [data-open-project="<work-card id>"] control (Chapter One clips, the
   What I do evidence) opens that project through the Selected Work dialogs,
   then hands focus back to the control that opened it. */
(()=>{"use strict";
  // A thumbnail that cannot load leaves its quiet frame, not a broken icon.
  document.querySelectorAll(".craft__frame img").forEach(img=>{
    const hide=()=>{img.hidden=true};
    if(img.complete&&img.naturalWidth===0&&img.currentSrc)hide();else img.addEventListener("error",hide,{once:true});
  });
  document.addEventListener("click",e=>{
    const opener=e.target.closest?.("[data-open-project]");
    if(!opener)return;
    const id=opener.dataset.openProject;
    const trigger=document.querySelector(`#work .work-card[data-project="${CSS.escape(id)}"] .work-trigger`);
    if(!trigger)return;
    trigger.click();
    document.querySelector("dialog[open]")?.addEventListener("close",()=>opener.focus({preventScroll:true}),{once:true});
  });
})();
