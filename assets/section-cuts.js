/* FQ / Section cuts: the tinted plane behind each slanted seam drifts with
 * scroll at its own speed. Only seams near the viewport are updated; reduced
 * motion leaves the planes still. */
(()=>{"use strict";
  const cuts=[...document.querySelectorAll(".fq-cut")];
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  if(!cuts.length)return;
  const live=new Set();
  let raf=0;
  function update(){
    raf=0;
    const vh=innerHeight;
    live.forEach(cut=>{
      if(reduced.matches){cut.style.removeProperty("--drift");return}
      const y=cut.getBoundingClientRect().top;
      const p=Math.max(-1,Math.min(1,(y-vh/2)/(vh*.6)));
      const slant=(cut.firstElementChild?.offsetHeight||100)/3.4;
      cut.style.setProperty("--drift",(p*-slant*.7).toFixed(1)+"px");
    });
  }
  const queue=()=>{if(!raf)raf=requestAnimationFrame(update)};
  if("IntersectionObserver"in window){
    const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)live.add(e.target);else live.delete(e.target)});queue()},{rootMargin:"120px 0px"});
    cuts.forEach(c=>io.observe(c));
  }else cuts.forEach(c=>live.add(c));
  addEventListener("scroll",queue,{passive:true});
  addEventListener("resize",queue);
  reduced.addEventListener?.("change",queue);
})();
