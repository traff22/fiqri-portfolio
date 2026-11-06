/* FQ / Section cuts: fills each strip with real frames from Selected Work and
 * ties the layers to scroll. Frames load only when a cut is near the viewport.
 * Reduced motion: frames are filled, nothing moves. */
(()=>{"use strict";
  const cuts=[...document.querySelectorAll(".fq-cut")];
  if(!cuts.length)return;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const ids=[...new Set([...document.querySelectorAll("[data-youtube-thumb]")].map(i=>i.dataset.youtubeThumb).filter(Boolean))];
  const live=new Set();
  const pad=n=>String(n).padStart(2,"0");

  function fill(cut,index){
    const reel=cut.querySelector(".fq-cut__reel");
    if(!reel||reel.childElementCount)return;
    const pick=[];
    for(let k=0;k<7&&ids.length;k++)pick.push(ids[(index*4+k)%ids.length]);
    const frames=[...pick,...pick];
    frames.forEach((id,k)=>{
      const f=document.createElement("figure");f.className="fq-cut__frame";
      const img=new Image();img.alt="";img.decoding="async";img.width=320;img.height=180;
      img.addEventListener("error",()=>f.classList.add("is-empty"),{once:true});
      img.src="https://i.ytimg.com/vi/"+id+"/mqdefault.jpg";
      const n=document.createElement("span");n.textContent=pad(k%pick.length+1);
      f.append(img,n);reel.appendChild(f);
    });
  }

  function update(){
    raf=0;
    const vh=innerHeight,vw=document.documentElement.clientWidth;
    live.forEach(cut=>{
      const r=cut.getBoundingClientRect();
      const p=Math.max(-1,Math.min(1,((r.top+r.height/2)-vh/2)/(vh*.6)));
      const reel=cut.querySelector(".fq-cut__reel"),strip=cut.querySelector(".fq-cut__window");
      const dir=cut.dataset.dir==="right"?-1:1,speed=parseFloat(cut.dataset.speed)||1;
      const S=strip.offsetWidth,W=reel.scrollWidth;
      const base=(S-W)/2,travel=Math.min(Math.max(0,(W-S)/2),Math.max(vw*.18,140)*speed);
      if(!reduced.matches){
        cut.style.setProperty("--x",(base+p*dir*travel).toFixed(1)+"px");
        cut.style.setProperty("--y",(p*-18).toFixed(1)+"px");
      }else cut.style.setProperty("--x",base.toFixed(1)+"px");
      const tc=cut.querySelector(".fq-cut__tc");
      if(tc){const f=Math.round((1-p)*90),c=+cut.dataset.chapter||1;tc.textContent=pad(c)+":00:"+pad(Math.floor(f/25))+":"+pad(f%25)}
    });
  }
  let raf=0;const queue=()=>{if(!raf)raf=requestAnimationFrame(update)};

  if("IntersectionObserver"in window){
    const near=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){fill(e.target,cuts.indexOf(e.target));near.unobserve(e.target);queue()}}),{rootMargin:"800px 0px"});
    const seen=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)live.add(e.target);else live.delete(e.target)});queue()},{rootMargin:"60px 0px"});
    cuts.forEach(c=>{near.observe(c);seen.observe(c)});
  }else cuts.forEach((c,i)=>{fill(c,i);live.add(c)});
  addEventListener("scroll",queue,{passive:true});
  addEventListener("resize",queue);
  reduced.addEventListener?.("change",queue);
})();
