/* FQ / Chapter One — "Cutting Room Marks", checkpoint 1.
 * 1. Draws the blueprint connectors from each visible source thumbnail to the
 *    film frame using their REAL on-screen boxes, so the lines stay attached
 *    at every viewport size and during the scroll zoom.
 * 2. Makes each thumbnail open its project through the existing Selected
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

  /* ---------- 1. Measured connectors ---------- */
  const el=(name,attrs,parent)=>{
    const node=document.createElementNS(NS,name);
    for(const k in attrs)node.setAttribute(k,attrs[k]);
    parent.appendChild(node);return node;
  };
  const r1=n=>Math.round(n*10)/10;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));

  function linkSide(g,box,frame,side){
    // side: "left" (card left of frame) or "right"
    const dir=side==="left"?1:-1;
    const x1=side==="left"?box.right:box.left;
    const x2=side==="left"?frame.left:frame.right;
    if((x2-x1)*dir<24)return; // touching/overlapping: no line rather than a wrong one
    const y1=box.top+box.height/2;
    const y2=clamp(y1,frame.top+frame.height*.2,frame.bottom-frame.height*.2);
    const xm=x1+(x2-x1)*.42;
    const a=x1+dir*7,b=x2-dir*8;
    el("path",{class:"fq-blueprint__link",d:`M${r1(a)} ${r1(y1)}H${r1(xm)}V${r1(y2)}H${r1(b)}`},g);
    // OUT-point "]" hugging the source clip, IN-point "[" on the film edge.
    el("path",{class:"fq-blueprint__mark",d:`M${r1(x1+dir*2)} ${r1(y1-7)}h${dir*3}v14h${-dir*3}`},g);
    el("path",{class:"fq-blueprint__mark",d:`M${r1(x2-dir*2)} ${r1(y2-7)}h${-dir*3}v14h${dir*3}`},g);
    if(Math.abs(y2-y1)>1)el("circle",{class:"fq-blueprint__joint",cx:r1(xm),cy:r1(y2),r:2.5},g);
    if(Math.abs(x2-x1)<96)return; // too short for labels: marks alone read cleaner
    const tagOut=el("text",{class:"fq-blueprint__tag",x:r1(x1+dir*9),y:r1(y1-7),"text-anchor":side==="left"?"start":"end"},g);
    tagOut.textContent="OUT";
    const tagIn=el("text",{class:"fq-blueprint__tag fq-blueprint__tag--in",x:r1(x2-dir*9),y:r1(y2-9),"text-anchor":side==="left"?"end":"start"},g);
    tagIn.textContent="IN";
  }
  function linkBelow(g,box,frame){
    const x=clamp(box.left+box.width/2,frame.left+16,frame.right-16);
    const y1=box.top,y2=frame.bottom;
    if(y1-y2<12)return;
    el("path",{class:"fq-blueprint__link",d:`M${r1(x)} ${r1(y1-6)}V${r1(y2+6)}`},g);
    el("path",{class:"fq-blueprint__mark",d:`M${r1(x-6)} ${r1(y1-1)}v-3h12v3`},g);
    el("path",{class:"fq-blueprint__mark",d:`M${r1(x-6)} ${r1(y2+1)}v3h12v-3`},g);
  }

  let raf=0,settleUntil=0;
  function paint(){
    raf=0;
    const host=layer.getBoundingClientRect();
    const vh=innerHeight||1;
    if(host.bottom<-vh*.2||host.top>vh*1.2){if(performance.now()<settleUntil)schedule();return}
    const w=Math.max(1,host.width),h=Math.max(1,host.height);
    svg.setAttribute("viewBox",`0 0 ${r1(w)} ${r1(h)}`);
    const shift=b=>({left:b.left-host.left,right:b.right-host.left,top:b.top-host.top,bottom:b.bottom-host.top,width:b.width,height:b.height});
    const f=shift(film.getBoundingClientRect());
    const s=strip?shift(strip.getBoundingClientRect()):null;
    const frame={...f,bottom:s&&s.height?Math.max(f.bottom,s.bottom):f.bottom};
    const g=document.createElementNS(NS,"g");
    for(const card of cards){
      if(getComputedStyle(card).display==="none")continue;
      const b=shift(card.getBoundingClientRect());
      if(!b.width)continue;
      const cx=b.left+b.width/2;
      if(b.top>=frame.bottom)linkBelow(g,b,frame);
      else linkSide(g,b,f,cx<f.left+f.width/2?"left":"right");
    }
    svg.replaceChildren(g);
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

  /* ---------- 2. Thumbnails open their real project ---------- */
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
