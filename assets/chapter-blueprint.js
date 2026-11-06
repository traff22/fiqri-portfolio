/* FQ / Chapter One — "Cutting Room Marks".
 * 1. Draws the blueprint connectors from each visible source thumbnail to the
 *    film frame using their REAL on-screen boxes, so the lines stay attached
 *    at every viewport size and during the scroll zoom.
 * 2. Follows the edit: when the showreel plays a motion / longform / event
 *    film (announced by chapter-montage.js as "fq:shot"), the matching source
 *    clip lights up and its cut line is drawn into the frame. Without real
 *    playback (blocked, unavailable, off-screen) every clip stays neutral.
 * 3. Crop marks sit just OUTSIDE the picture, never over the footage.
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

  /* ---------- lens: drafting grid with barrel distortion + blur vignette ---------- */
  // The grid is the editor's drafting paper seen through the camera lens. It
  // bulges from the film's centre, a little more as the film zooms in.
  const lens=document.createElement("canvas");lens.className="fq-blueprint__lens";lens.setAttribute("aria-hidden","true");
  const vignette=document.createElement("div");vignette.className="fq-blueprint__vignette";vignette.setAttribute("aria-hidden","true");
  layer.prepend(lens,vignette);
  const lctx=lens.getContext("2d");
  let lensKey="";
  function drawLens(w,h,cx,cy,progress){
    if(!lctx)return;
    const k=(reducedLens()?.16:.12+.12*progress);
    const key=[Math.round(w),Math.round(h),Math.round(cx),Math.round(cy),k.toFixed(3)].join("|");
    if(key===lensKey)return;lensKey=key;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    if(lens.width!==Math.round(w*dpr)||lens.height!==Math.round(h*dpr)){lens.width=Math.round(w*dpr);lens.height=Math.round(h*dpr)}
    lctx.setTransform(dpr,0,0,dpr,0,0);lctx.clearRect(0,0,w,h);
    const R2=Math.pow(Math.max(w,h)*.62,2);
    const warp=(x,y)=>{const dx=x-cx,dy=y-cy,s=1/(1+k*(dx*dx+dy*dy)/R2);return [cx+dx*s,cy+dy*s]};
    const line=(x0,y0,x1,y1)=>{
      lctx.beginPath();
      for(let i=0;i<=36;i++){const t=i/36,[x,y]=warp(x0+(x1-x0)*t,y0+(y1-y0)*t);i?lctx.lineTo(x,y):lctx.moveTo(x,y)}
      lctx.stroke();
    };
    const span=Math.max(w,h)*1.1;
    for(const [step,alpha] of [[24,.075],[120,.17]]){
      lctx.strokeStyle=`rgba(143,180,255,${alpha})`;lctx.lineWidth=1;
      const n=Math.ceil(span/step);
      for(let i=-n;i<=n;i++){
        if(step===24&&i%5===0)continue; // major lines are drawn on the second pass
        const x=cx+i*step,y=cy+i*step;
        line(x,cy-span,x,cy+span);line(cx-span,y,cx+span,y);
      }
    }
  }
  const reducedLens=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  // Drafting layer first so it sits behind the cut lines.
  const construct=make("path",{class:"fq-blueprint__construct"},svg);
  const centre=make("path",{class:"fq-blueprint__centre"},svg);
  const reg=make("path",{class:"fq-blueprint__reg"},svg);
  const dim=make("path",{class:"fq-blueprint__dim"},svg);
  const dimLabel=Object.assign(make("text",{class:"fq-blueprint__dim-label","text-anchor":"middle"},svg),{textContent:"16 : 9"});
  const sequence=layer.querySelector(".fq-blueprint__sequence");
  const copy=scene.querySelector(".cinema-copy");
  const cta=scene.querySelector(".cinema-view-work");
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

  function placeConstruct(f,frame,w,h,compact,shift){
    // Technical-drawing construction around the shot: extension lines from the
    // picture edges, a centre line, a dimension line under the film and two
    // registration targets. Desktop/landscape only — phones keep the grid.
    if(compact){[construct,centre,reg,dim].forEach(n=>n.setAttribute("d",""));show(dimLabel,false);return}
    const blockers=[sequence,copy,cta].filter(Boolean).map(n=>shift(n.getBoundingClientRect()));
    const blockedAbove=(x,from)=>blockers.filter(b=>x>=b.left-6&&x<=b.right+6&&b.bottom<=from)
      .reduce((y,b)=>Math.max(y,b.bottom+16),24);
    const blockedBelow=(x,from)=>blockers.filter(b=>x>=b.left-6&&x<=b.right+6&&b.top>=from)
      .reduce((y,b)=>Math.min(y,b.top-14),h-24);
    let d="";
    // Horizontal extension lines along the picture's top and bottom edges.
    for(const y of [f.top,f.bottom]){
      if(f.left-30>40)d+=`M24 ${r1(y)}H${r1(f.left-30)}`;
      if(w-24-(f.right+30)>16)d+=`M${r1(f.right+30)} ${r1(y)}H${r1(w-24)}`;
    }
    // Vertical extension lines from the picture's side edges.
    for(const x of [f.left,f.right]){
      const top=blockedAbove(x,f.top-30);
      if(f.top-30-top>16)d+=`M${r1(x)} ${r1(top)}V${r1(f.top-30)}`;
      const bottom=blockedBelow(x,frame.bottom+12);
      if(bottom-(frame.bottom+12)>10)d+=`M${r1(x)} ${r1(frame.bottom+12)}V${r1(bottom)}`;
    }
    construct.setAttribute("d",d);
    // Centre line (dash-dot) below the film.
    const cx=f.left+f.width/2,low=blockedBelow(cx,frame.bottom+10);
    centre.setAttribute("d",low-(frame.bottom+10)>12?`M${r1(cx)} ${r1(frame.bottom+10)}V${r1(low)}`:"");
    // Dimension line under the caption strip: |<—— 16 : 9 ——>|
    const y=frame.bottom+20;
    if(y<=h-12){
      const gap=34,a=f.left,b=f.right,m=cx;
      dim.setAttribute("d",
        `M${r1(a)} ${r1(y-5)}v10M${r1(b)} ${r1(y-5)}v10`+
        `M${r1(a)} ${r1(y)}H${r1(m-gap)}M${r1(m+gap)} ${r1(y)}H${r1(b)}`+
        `M${r1(a+7)} ${r1(y-3)}L${r1(a)} ${r1(y)}L${r1(a+7)} ${r1(y+3)}`+
        `M${r1(b-7)} ${r1(y-3)}L${r1(b)} ${r1(y)}L${r1(b-7)} ${r1(y+3)}`);
      dimLabel.setAttribute("x",r1(m));dimLabel.setAttribute("y",r1(y+3));show(dimLabel,true);
    }else{dim.setAttribute("d","");show(dimLabel,false)}
    // Registration targets: top-right mirrors the process ruler, bottom-left
    // closes the composition. Skipped wherever a thumbnail sits.
    const cardBoxes=links.filter(L=>getComputedStyle(L.card).display!=="none").map(L=>shift(L.card.getBoundingClientRect()));
    const seq=sequence?shift(sequence.getBoundingClientRect()):{top:120,bottom:140};
    const targets=[[w-56,(seq.top+seq.bottom)/2],[56,h-44]];
    let rd="";
    for(const [x,ty] of targets){
      const hit=[...cardBoxes,...blockers].some(b=>x+16>b.left&&x-16<b.right&&ty+16>b.top&&ty-16<b.bottom);
      if(hit||ty>h-20)continue;
      rd+=`M${r1(x+7)} ${r1(ty)}A7 7 0 1 0 ${r1(x-7)} ${r1(ty)}A7 7 0 1 0 ${r1(x+7)} ${r1(ty)}`+
          `M${r1(x-12)} ${r1(ty)}H${r1(x+12)}M${r1(x)} ${r1(ty-12)}V${r1(ty+12)}`;
    }
    reg.setAttribute("d",rd);
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
    placeConstruct(f,frame,host.width,host.height,compact,shift);
    const sr=scene.getBoundingClientRect();
    const progress=Math.min(1,Math.max(0,-sr.top/Math.max(1,scene.offsetHeight-vh)));
    drawLens(host.width,host.height,f.left+f.width/2,f.top+f.height/2,progress);
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

  // Opening a project from a thumbnail is handled by work-gallery.js
  // ([data-open-project]), shared with the What I do section.
})();
