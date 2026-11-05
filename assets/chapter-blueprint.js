/* FQ / Chapter One — "Cutting Room Marks".
 * 1. Draws the blueprint connectors from each visible source thumbnail to the
 *    film frame using their REAL on-screen boxes, so the lines stay attached
 *    at every viewport size and during the scroll zoom.
 * 2. Follows the edit: when the showreel plays a motion / longform / event
 *    film (announced by chapter-montage.js as "fq:shot"), the matching source
 *    clip lights up and its cut line is drawn into the frame. Without real
 *    playback (blocked, unavailable, off-screen) every clip stays neutral.
 * 3. Crop marks sit just OUTSIDE the picture, never over the footage.
 * 4. Makes each thumbnail open its project through the existing Selected
 *    Work dialog (same player, same event dialog, same cleanup).
 * No dependencies; batched with requestAnimationFrame. */
(()=>{"use strict";
  const scene=document.getElementById("cinema-wrap");
  const layer=scene?.querySelector(".fq-blueprint");
  const svg=layer?.querySelector(".fq-blueprint__links");
  const film=scene?.querySelector(".showreel-shell .showreel-visual");
  const strip=scene?.querySelector(".showreel-shell > .montage-overlay");
  const cards=scene?[...scene.querySelectorAll(".float-reel-card")]:[];
  if(!scene||!layer||!svg||!film)return;
  const NS="http://www.w3.org/2000/svg";
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  // Which montage category each source clip stands for.
  const CATEGORY={one:"motion",two:"longform",three:"event"};

  const make=(name,attrs,parent)=>{
    const node=document.createElementNS(NS,name);
    for(const k in attrs)node.setAttribute(k,attrs[k]);
    parent.appendChild(node);return node;
  };
  const r1=n=>Math.round(n*10)/10;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const show=(node,on)=>{if(on)node.removeAttribute("display");else node.setAttribute("display","none")};

  /* ---------- persistent SVG nodes (so the draw animation survives scroll) ---------- */
  const crop=make("path",{class:"fq-blueprint__crop"},svg);
  const links=cards.map(card=>{
    const key=card.className.match(/float-reel-card--(\w+)/)?.[1]||"";
    card.dataset.sourceCategory=CATEGORY[key]||"";
    const g=make("g",{class:"fq-blueprint__clip","data-category":CATEGORY[key]||""},svg);
    return {card,g,
      line:make("path",{class:"fq-blueprint__link",pathLength:"1"},g),
      out:make("path",{class:"fq-blueprint__mark"},g),
      in:make("path",{class:"fq-blueprint__mark fq-blueprint__mark--in"},g),
      joint:make("circle",{class:"fq-blueprint__joint",r:"2.5"},g),
      tagOut:Object.assign(make("text",{class:"fq-blueprint__tag"},g),{textContent:"OUT"}),
      tagIn:Object.assign(make("text",{class:"fq-blueprint__tag fq-blueprint__tag--in"},g),{textContent:"IN"})};
  });

  function placeSide(L,box,frame,side){
    const dir=side==="left"?1:-1;
    const x1=side==="left"?box.right:box.left;
    const x2=side==="left"?frame.left:frame.right;
    if((x2-x1)*dir<24)return false; // touching/overlapping: no line rather than a wrong one
    const y1=box.top+box.height/2;
    const y2=clamp(y1,frame.top+frame.height*.2,frame.bottom-frame.height*.2);
    const xm=x1+(x2-x1)*.42;
    L.line.setAttribute("d",`M${r1(x1+dir*7)} ${r1(y1)}H${r1(xm)}V${r1(y2)}H${r1(x2-dir*8)}`);
    // OUT-point "]" hugging the source clip, IN-point "[" on the film edge.
    L.out.setAttribute("d",`M${r1(x1+dir*2)} ${r1(y1-7)}h${dir*3}v14h${-dir*3}`);
    L.in.setAttribute("d",`M${r1(x2-dir*2)} ${r1(y2-7)}h${-dir*3}v14h${dir*3}`);
    const bend=Math.abs(y2-y1)>1;
    show(L.joint,bend);
    if(bend){L.joint.setAttribute("cx",r1(xm));L.joint.setAttribute("cy",r1(y2))}
    const labels=Math.abs(x2-x1)>=96; // too short for labels: marks alone read cleaner
    show(L.tagOut,labels);show(L.tagIn,labels);
    if(labels){
      Object.entries({x:r1(x1+dir*9),y:r1(y1-7),"text-anchor":dir>0?"start":"end"}).forEach(([k,v])=>L.tagOut.setAttribute(k,v));
      Object.entries({x:r1(x2-dir*9),y:r1(y2-9),"text-anchor":dir>0?"end":"start"}).forEach(([k,v])=>L.tagIn.setAttribute(k,v));
    }
    return true;
  }
  function placeBelow(L,box,frame){
    const x=clamp(box.left+box.width/2,frame.left+16,frame.right-16);
    const y1=box.top,y2=frame.bottom;
    if(y1-y2<12)return false;
    L.line.setAttribute("d",`M${r1(x)} ${r1(y1-6)}V${r1(y2+6)}`);
    L.out.setAttribute("d",`M${r1(x-6)} ${r1(y1-1)}v-3h12v3`);
    L.in.setAttribute("d",`M${r1(x-6)} ${r1(y2+1)}v3h12v-3`);
    show(L.joint,false);show(L.tagOut,false);show(L.tagIn,false);
    return true;
  }
  function placeCrop(f,compact,width){
    // Print-style crop marks: offset ticks extending from each picture edge.
    // Bottom corners only get horizontal ticks — the caption strip sits below.
    // Side ticks are skipped when the film nearly touches the viewport edge.
    const g=8,n=compact?10:16,{left:l,right:r,top:t,bottom:b}=f;
    const sides=l-g-n>=4&&r+g+n<=width-4;
    // On phones the film nearly fills the width and the process ruler sits
    // just above it: marks there would read as clutter, so leave them out.
    if(compact&&!sides){crop.setAttribute("d","");return}
    let d=`M${r1(l)} ${r1(t-g-n)}v${n}M${r1(r)} ${r1(t-g-n)}v${n}`;
    if(sides)d+=`M${r1(l-g-n)} ${r1(t)}h${n}M${r1(r+g)} ${r1(t)}h${n}`+
                `M${r1(l-g-n)} ${r1(b)}h${n}M${r1(r+g)} ${r1(b)}h${n}`;
    if(!compact){
      // Rule-of-thirds ticks above the frame.
      const w=r-l;
      for(const k of [1/3,2/3])d+=`M${r1(l+w*k)} ${r1(t-g-6)}v6`;
    }
    crop.setAttribute("d",d);
  }

  let raf=0,settleUntil=0;
  function paint(){
    raf=0;
    const host=layer.getBoundingClientRect();
    const vh=innerHeight||1;
    if(host.bottom<-vh*.2||host.top>vh*1.2){if(performance.now()<settleUntil)schedule();return}
    svg.setAttribute("viewBox",`0 0 ${r1(Math.max(1,host.width))} ${r1(Math.max(1,host.height))}`);
    const shift=b=>({left:b.left-host.left,right:b.right-host.left,top:b.top-host.top,bottom:b.bottom-host.top,width:b.width,height:b.height});
    const f=shift(film.getBoundingClientRect());
    const s=strip?shift(strip.getBoundingClientRect()):null;
    const frame={...f,bottom:s&&s.height?Math.max(f.bottom,s.bottom):f.bottom};
    let compact=false;
    for(const L of links){
      let drawn=false;
      if(getComputedStyle(L.card).display!=="none"){
        const b=shift(L.card.getBoundingClientRect());
        if(b.width){
          if(b.top>=frame.bottom){compact=true;drawn=placeBelow(L,b,frame)}
          else drawn=placeSide(L,b,f,b.left+b.width/2<f.left+f.width/2?"left":"right");
        }
      }
      show(L.g,drawn);
    }
    placeCrop(f,compact,host.width);
    // Cards ease their scale/opacity over ~160ms; keep following briefly.
    if(performance.now()<settleUntil)schedule();
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(paint)}
  function nudge(){settleUntil=performance.now()+350;schedule()}
  addEventListener("scroll",nudge,{passive:true});
  addEventListener("resize",nudge,{passive:true});
  addEventListener("load",nudge);
  if("ResizeObserver"in window){
    const ro=new ResizeObserver(nudge);
    ro.observe(scene);ro.observe(film);cards.forEach(c=>ro.observe(c));
  }
  nudge();

  /* ---------- follow the edit ---------- */
  let activeCategory="";
  function setActive(category){
    category=category||"";
    // Only light a clip that is actually on screen at this breakpoint.
    const target=links.find(L=>L.g.dataset.category===category&&getComputedStyle(L.card).display!=="none");
    const next=target?category:"";
    layer.dataset.activeSource=next||"none";
    if(next===activeCategory)return;
    activeCategory=next;
    for(const L of links){
      const on=L===target;
      L.card.classList.toggle("is-source",on);
      L.card.classList.toggle("is-idle",Boolean(target)&&!on);
      L.g.classList.toggle("is-active",on);
      L.g.classList.remove("is-drawing");
      if(on&&!reduced.matches){
        void L.line.getBoundingClientRect(); // restart the draw for every new shot
        L.g.classList.add("is-drawing");
      }
    }
  }
  scene.addEventListener("fq:shot",e=>setActive(e.detail?.category));
  // A breakpoint change can hide the active clip (e.g. EVENT on tablets).
  addEventListener("resize",()=>{const c=scene.dataset.activeCategory||"";activeCategory="#";setActive(c)},{passive:true});
  setActive(scene.dataset.activeCategory);

  /* ---------- thumbnails open their real project ---------- */
  for(const card of cards){
    const button=card.querySelector(".float-reel-card__open");
    const project=card.dataset.projectLink;
    if(!button||!project)continue;
    button.addEventListener("click",()=>{
      const trigger=document.querySelector(`#work .work-card[data-project="${CSS.escape(project)}"] .work-trigger`);
      if(!trigger)return;
      trigger.click();
      // The gallery returns focus to its own trigger; bring it back here so
      // keyboard users stay where they were in Chapter One.
      const dialog=document.querySelector("dialog[open]");
      dialog?.addEventListener("close",()=>button.focus({preventScroll:true}),{once:true});
    });
  }
})();
