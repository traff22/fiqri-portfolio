/* Fiqri Portfolio — tiny hidden discoveries.
   Logo: three clicks. Projects: linger/long-press. Footer: last frame. */
(()=>{"use strict";
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  const fine=window.matchMedia("(hover: hover) and (pointer: fine)");

  // Director's Cut: triple click (keyboard activation works as clicks too).
  const logo=document.querySelector(".topbar .logo");
  const dialog=document.getElementById("directors-cut");
  const closeButton=dialog?.querySelector("[data-directors-close]");
  let taps=0, lastTap=0;
  if(logo&&dialog&&typeof dialog.showModal==="function"){
    logo.addEventListener("click",(event)=>{
      if(event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
      const now=performance.now();
      taps=now-lastTap<1200?taps+1:1;
      lastTap=now;
      if(taps<3)return;
      taps=0;
      event.preventDefault();
      if(!dialog.open){
        dialog.showModal();
        document.body.classList.add("directors-cut-open");
        closeButton?.focus();
      }
    });
    const close=()=>dialog.close();
    closeButton?.addEventListener("click",close);
    dialog.addEventListener("click",(event)=>{if(event.target===dialog)close()});
    dialog.addEventListener("close",()=>document.body.classList.remove("directors-cut-open"));
    window.addEventListener("pagehide",()=>{if(dialog.open)dialog.close()});
  }

  // Editor notes: no visible icon or extra overlay until discovered.
  const notes={
    "bitcoin-almanac":"Sometimes the hardest cut is knowing what to leave out.",
    "cinematic-mancing":"Plot twist: the quiet frames can say the most.",
    "age-of-chaos":"A little chaos. A lot of timeline layers.",
    "logistics-nine":"Good motion is just patience with keyframes."
  };
  Object.entries(notes).forEach(([id,copy],index)=>{
    const card=document.querySelector('.work-card[data-project="'+id+'"]');
    const trigger=card?.querySelector(".work-trigger");
    if(!card||!trigger)return;
    const note=document.createElement("span");
    note.className="easter-work-note";
    note.id="easter-note-"+id;
    const heading=document.createElement("span");
    heading.className="easter-work-note__eyebrow";
    heading.textContent="EDITOR'S NOTE / 0"+(index+1);
    const body=document.createElement("span");
    body.className="easter-work-note__copy";
    body.textContent=copy;
    note.append(heading,body);
    card.appendChild(note);
    trigger.setAttribute("aria-describedby",note.id);

    let showTimer=0,hideTimer=0,pressed=false,suppressClick=false;
    let startX=0,startY=0;
    const clearShow=()=>{clearTimeout(showTimer);showTimer=0};
    const hide=()=>{clearTimeout(hideTimer);card.classList.remove("is-easter-peeking")};
    const reveal=()=>{
      clearShow();
      card.classList.add("is-easter-peeking");
      clearTimeout(hideTimer);
      hideTimer=setTimeout(hide,3100);
    };
    card.addEventListener("pointerenter",(e)=>{
      if(fine.matches&&e.pointerType!=="touch"){
        clearShow();showTimer=setTimeout(reveal,1250);
      }
    });
    card.addEventListener("pointerleave",(e)=>{
      if(e.pointerType!=="touch"){clearShow();hide()}
    });
    trigger.addEventListener("focus",()=>{reveal()});
    trigger.addEventListener("blur",hide);

    // Hold on mobile to read, release without opening a video.
    trigger.addEventListener("pointerdown",(e)=>{
      if(e.pointerType==="mouse"||e.button!==0)return;
      pressed=false;startX=e.clientX;startY=e.clientY;
      clearShow();showTimer=setTimeout(()=>{
        pressed=true;suppressClick=true;reveal();
      },700);
    });
    trigger.addEventListener("pointermove",(e)=>{
      if(e.pointerType==="mouse")return;
      if(Math.hypot(e.clientX-startX,e.clientY-startY)>14)clearShow();
    },{passive:true});
    const release=()=>{
      clearShow();
      if(pressed){
        pressed=false;
        // Reset even if a browser suppresses the following click.
        setTimeout(()=>{suppressClick=false},450);
      }
    };
    trigger.addEventListener("pointerup",release);
    trigger.addEventListener("pointercancel",release);
    trigger.addEventListener("contextmenu",(e)=>{if(suppressClick)e.preventDefault()});
    // Capture before work-gallery's button click handler.
    card.addEventListener("click",(e)=>{
      if(!suppressClick)return;
      suppressClick=false;
      e.preventDefault();
      e.stopImmediatePropagation();
    },true);
  });

  // Last frame: a small thank-you only when the footer is actually in view.
  const footer=document.querySelector("footer.footer");
  const finalNote=document.getElementById("footer-final-note");
  if(footer&&finalNote){
    let timer=0;
    if("IntersectionObserver" in window){
      const observer=new IntersectionObserver((entries)=>{
        for(const entry of entries){
          if(entry.isIntersecting&&entry.intersectionRatio>=.65){
            if(!timer&&!finalNote.classList.contains("is-visible")){
              timer=setTimeout(()=>{
                finalNote.classList.add("is-visible");
                timer=0;observer.disconnect();
              },reduced.matches?0:750);
            }
          }else{clearTimeout(timer);timer=0}
        }
      },{threshold:[0,.65,1]});
      observer.observe(footer);
    }else{
      finalNote.classList.add("is-visible");
    }
  }
})();
