/* FQ / Mini Fiqri in Contact.
 * Stills rendered from the voxel model (tools/render-cameos.mjs, cropped to one
 * shared box by tools/crop-cameos.py), so no second WebGL scene runs here.
 * While Contact is on screen he loops through a little routine: wave, point at
 * the email, shades on, a dab, a victory hop. Reaching for a contact link
 * makes him point at it. Tap him (or press the button) to pause; the loop also
 * stops off screen and in background tabs. Reduced motion: one still wave. */
(()=>{"use strict";
  const button=document.querySelector(".fq-cameo--contact");
  const img=button?.querySelector("img");
  if(!button||!img)return;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const src=(pose,f)=>"assets/cameos/"+pose+"-"+f+".webp";
  // [pose, flips, ms per frame]; each beat ends on frame 0 and holds a moment
  const beats=[["wave",3,200],["point",2,320],["cool",2,430],["dab",1,520],["jump",3,230]];
  const HOLD=850;
  const timeline=[];
  for(const [pose,flips,ms] of beats){
    const start=timeline.length;
    for(let i=0;i<flips;i++)timeline.push([src(pose,1),ms],[src(pose,0),ms]);
    timeline[timeline.length-1][1]+=HOLD;
    beats.find(b=>b[0]===pose).start=start;
  }
  // preload every frame so swaps never flash
  beats.forEach(([pose])=>[0,1].forEach(f=>{const i=new Image();i.src=src(pose,f)}));

  let at=0,timer=0,userPaused=false,inView=false;
  const running=()=>!reduced.matches&&!userPaused&&inView&&!document.hidden;
  function step(){
    const [frame,ms]=timeline[at];
    img.src=frame;img.dataset.cameo=frame.match(/cameos\/(\w+)-/)[1];
    at=(at+1)%timeline.length;
    timer=setTimeout(()=>{if(running())step()},ms);
  }
  function sync(){clearTimeout(timer);if(running())step()}
  function jumpTo(pose){
    const b=beats.find(x=>x[0]===pose);
    if(!b||!running())return;
    at=b.start;sync();
  }

  function setPaused(on){
    userPaused=on;
    button.setAttribute("aria-pressed",String(on));
    button.setAttribute("aria-label",on?"Play mini Fiqri":"Pause mini Fiqri");
    sync();
  }
  function applyMotion(){
    // with reduced motion there is nothing to pause: he stands still, waving
    button.disabled=reduced.matches;
    if(reduced.matches){clearTimeout(timer);img.src=src("wave",0);img.dataset.cameo="wave"}
    else sync();
  }
  button.addEventListener("click",()=>setPaused(!userPaused));
  document.querySelectorAll("#contact .mail,#contact .whatsapp-contact,#contact .linkedin-contact").forEach(link=>{
    ["pointerenter","focus"].forEach(type=>link.addEventListener(type,()=>jumpTo("point")));
  });
  if("IntersectionObserver"in window){
    new IntersectionObserver(es=>{inView=es.some(e=>e.isIntersecting);sync()},{threshold:.3}).observe(button);
  }else inView=true;
  document.addEventListener("visibilitychange",sync);
  reduced.addEventListener?.("change",applyMotion);
  setPaused(false);applyMotion();
})();
