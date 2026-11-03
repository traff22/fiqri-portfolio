/* Fiqri Portfolio — gallery interactions. Placeholder media never pretends to be uploaded footage. */
(()=>{"use strict";
const $=(q,r=document)=>r.querySelector(q);
const $$=(q,r=document)=>[...r.querySelectorAll(q)];
const cards=$$(".selected-work .work-card"),filters=$$(".selected-work .filter"),count=$("#work-count");
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
 const status=$(".work-filter-status");if(status)status.lastChild.textContent=shown===1?" project":" projects";
}
filters.forEach(button=>button.addEventListener("click",()=>filterWork(button.dataset.filter)));
filterWork("highlights");

const eventDialog=$("#event-dialog"),videoDialog=$("#video-dialog"),player=$("#video-player"),waiting=$("#video-awaiting");
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
 if(videoDialog?.open&&dialog!==videoDialog)videoDialog.close();
 if(eventDialog?.open&&dialog!==eventDialog)eventDialog.close();
 priorFocus=origin||document.activeElement;
 if(typeof dialog.showModal==="function")dialog.showModal();
 else dialog.setAttribute("open","");
 document.body.classList.add("modal-open");
 $(".dialog-close",dialog)?.focus({preventScroll:true});
}
function closeModal(dialog){
 if(!dialog)return;
 if(dialog.open&&typeof dialog.close==="function")dialog.close();
 else{dialog.removeAttribute("open");onModalClosed();}
}
function onModalClosed(){
 if(!eventDialog?.open&&!videoDialog?.open)document.body.classList.remove("modal-open");
 if(videoDialog&&!videoDialog.open&&player){player.pause();player.removeAttribute("src");player.load();}
 if(priorFocus?.isConnected){priorFocus.focus({preventScroll:true});priorFocus=null;}
}
[eventDialog,videoDialog].filter(Boolean).forEach(dialog=>{
 dialog.addEventListener("close",onModalClosed);
 dialog.addEventListener("click",e=>{if(e.target===dialog)closeModal(dialog)});
 $$("[data-close-dialog]",dialog).forEach(btn=>btn.addEventListener("click",()=>closeModal(dialog)));
});
function configureImage(img,src,placeholder){
 if(!img)return;
 img.hidden=!src;if(placeholder)placeholder.hidden=false;
 if(src){
  img.addEventListener("load",()=>{if(placeholder)placeholder.hidden=true},{once:true});
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
 $("#video-dialog-title").textContent=card.dataset.title||"Video project";
 const note=card.querySelector(":scope > p");
 $("#video-dialog-description").textContent=note?.textContent||"";
 const wrapper=$(".video-player-frame",videoDialog);
 wrapper?.classList.toggle("is-portrait",card.dataset.format==="portrait");
 const media=$(".work-media",card),src=(media?.dataset.videoSrc||"").trim();
 player.pause();player.removeAttribute("src");player.load();
 if(src){
  player.src=src;player.hidden=false;if(waiting)waiting.hidden=true;
  openModal(videoDialog,trigger);
  player.play().catch(()=>{});
 }else{
  player.hidden=true;if(waiting)waiting.hidden=false;
  openModal(videoDialog,trigger);
 }
}
$$(".work-trigger").forEach(trigger=>trigger.addEventListener("click",()=>{
 const card=trigger.closest(".work-card");if(!card)return;
 if(trigger.dataset.open==="event")openEvent(card,trigger);else openVideo(card,trigger);
}));
})();