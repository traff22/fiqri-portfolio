/* Fiqri Portfolio — gallery interactions. Placeholder media never pretends to be uploaded footage. */
(()=>{"use strict";
const $=(q,r=document)=>r.querySelector(q);
const $$=(q,r=document)=>[...r.querySelectorAll(q)];
const cards=$$(".selected-work .work-card"),filters=$$(".selected-work .filter"),count=$("#work-count");
const gallerySection=$(".selected-work");
const galleryGrid=$(".selected-work .work-grid");
// The collage pairs complementary media ratios. Slots are assigned to visible cards
// automatically on every filter change; added projects fall back to an even grid.
const collageColumns=[12,12,12,12,12,12,5,19,19,5];
function setGalleryMode(kind){
 const collage=kind==="highlights"||kind==="all";
 gallerySection?.classList.toggle("gallery-collage",collage);
 if(gallerySection)gallerySection.dataset.galleryMode=kind;
 const visible=cards.filter(card=>!card.hidden);
 visible.forEach((card,i)=>{
  if(collage){
   card.dataset.collageSlot=String(i+1);
   const isUnpaired=i===visible.length-1 && i%2===0;
   card.style.setProperty("--collage-span",String(isUnpaired?24:(collageColumns[i]||12)));
  }else{
   card.removeAttribute("data-collage-slot");
   card.style.removeProperty("--collage-span");
  }
 });
 if(galleryGrid)galleryGrid.setAttribute("aria-label",collage?"Curated project collage":"Filtered project gallery");
}

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
filters.forEach(button=>button.addEventListener("click",()=>filterWork(button.dataset.filter)));
filterWork("highlights");

// Youtube posters are present in HTML, so thumbnails render even before this JS runs.
// This is progressive enhancement for loading state and optional external image posters.
cards.forEach(card=>{
 const media=$(".work-media",card);
 if(!media)return;
 const src=(media.dataset.posterSrc||"").trim();
 let image=$(".work-poster",media);
 if(!image&&src){
  image=document.createElement("img");
  image.className="work-poster";image.alt="";
  image.loading="lazy";image.decoding="async";
  media.prepend(image);image.src=src;
 }
 if(!image)return;
 let triedFallback=false;
 const ready=()=>{
  if(image.naturalWidth>1&&image.naturalHeight>1){image.hidden=false;media.classList.add("has-poster");}
 };
 const failed=()=>{
  const id=(media.dataset.youtubeId||"").trim();
  if(!triedFallback&&/^[A-Za-z0-9_-]{11}$/.test(id)){
   triedFallback=true;
   image.src="https://img.youtube.com/vi/"+id+"/mqdefault.jpg";
   return;
  }
  image.hidden=true;media.classList.remove("has-poster");
 };
 image.addEventListener("load",ready);
 image.addEventListener("error",failed);
 if(image.complete){if(image.naturalWidth>1)ready();else failed();}
});

/* Desktop hover: muted YouTube video preview after a deliberate pause.
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
 $(".work-hover-video",card).forEach(frame=>{
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
 if(!canHoverPreview()||!/^[A-Za-z0-9_-]{11}$/.test(id))return;
 if(activeHover&&activeHover!==card)stopHoverPreview(activeHover);
 activeHover=card;
 card._hoverTimer=setTimeout(()=>{
  card._hoverTimer=0;
  if(activeHover!==card||card.hidden||!canHoverPreview())return;
  const iframe=document.createElement("iframe");
  iframe.className="work-hover-video";
  iframe.title="Muted preview";
  iframe.tabIndex=-1;
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
  const start=Math.max(0,Math.min(36000,Number(media.dataset.youtubeStart)||0));
  if(start)url.searchParams.set("start",String(start));
  iframe.src=url.toString();
  media.appendChild(iframe);
  iframe.addEventListener("load",()=>{
   if(activeHover===card)media.classList.add("is-previewing");
  },{once:true});
 },650);
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
  title:"Age of Chaos 2025",year:"2025",
  summary:"Motion assets, event visuals, and cinematic coverage — gathered as one creative project.",
  contribution:"Event motion design, visual assets, cinematic editing and selected on-site footage. Individual credits and approved behind-the-scenes assets will be added as the archive is curated.",
  banner:"",motion:"",documentation:""
 },
 "triv-premiere":{
  title:"TRIV Premiere 2026",year:"2026",
  summary:"An event story told across moving images, graphic design and behind-the-scenes documentation.",
  contribution:"Event aftermovie editing, camera operation, B-roll and motion assets. Approved final materials and production credits will be added here.",
  banner:"",motion:"",documentation:""
 }
};
function openModal(dialog,origin){
 if(!dialog)return;
 if(videoDialog?.open&&dialog!==videoDialog)closeModal(videoDialog);
 if(eventDialog?.open&&dialog!==eventDialog)eventDialog.close();
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
 if(dialog.open&&typeof dialog.close==="function")dialog.close();
 else{dialog.removeAttribute("open");onModalClosed();}
}
function onModalClosed(){
 if(!eventDialog?.open&&!videoDialog?.open)document.body.classList.remove("modal-open");
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
 });
 $$("[data-close-dialog]",dialog).forEach(btn=>btn.addEventListener("click",()=>closeModal(dialog)));
});
function configureImage(img,src,placeholder){
 if(!img)return;
 img.hidden=true;if(placeholder)placeholder.hidden=false;
 if(src){
  img.addEventListener("load",()=>{img.hidden=false;if(placeholder)placeholder.hidden=true},{once:true});
  img.addEventListener("error",()=>{img.hidden=true;if(placeholder)placeholder.hidden=false},{once:true});
  img.src=src;
 }else img.removeAttribute("src");
}
function openEvent(card,trigger){
 const config=events[card.dataset.project];if(!config||!eventDialog)return;
 $("#event-dialog-title").textContent=config.title;
 $("#event-dialog-year").textContent=config.year;
 $("#event-dialog-summary").textContent=config.summary;
 $("#event-dialog-contribution").textContent=config.contribution;
 $("#event-banner-name").textContent=config.title;
 configureImage($("#event-banner-img"),config.banner,$(".event-banner-concept"));
 for(const name of ["motion","documentation"]){
  const img=$('[data-event-asset="'+name+'"]',eventDialog);
  const placeholder=img?.parentElement?.querySelector(".event-asset-placeholder");
  configureImage(img,config[name],placeholder);
 }
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
$(".work-trigger").forEach(trigger=>trigger.addEventListener("click",()=>{
 const card=trigger.closest(".work-card");if(!card)return;
 if(trigger.dataset.open==="event")openEvent(card,trigger);else openVideo(card,trigger);
}));
// Never leave embedded audio running when the tab is hidden or navigated away.
document.addEventListener("visibilitychange",()=>{if(document.hidden){
 stopAllHoverPreviews();stopVideoPlayback();
 if(videoDialog?.open)closeModal(videoDialog);
}});
window.addEventListener("pagehide",()=>{stopAllHoverPreviews();stopVideoPlayback();});
})();