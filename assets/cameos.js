/* FQ / Mini Fiqri cameos outside the editing room.
 * Stills rendered from the voxel model (tools/render-cameos.mjs), so no second
 * WebGL scene runs here. Every animation is a short, finite flip between two
 * frames; nothing loops, and reduced motion keeps the first frame. */
(()=>{"use strict";
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const night=document.documentElement.dataset.daypart==="night";
  const frames={wave:["assets/cameos/wave-0.webp","assets/cameos/wave-1.webp"],coffee:["assets/cameos/coffee-0.webp","assets/cameos/coffee-1.webp"],sleep:["assets/cameos/sleep-0.webp","assets/cameos/sleep-1.webp"]};
  // flip between two frames `times` times, then rest on the first
  function play(img,set,times,step){
    if(reduced.matches||img.dataset.playing)return;
    img.dataset.playing="1";
    const [a,b]=frames[set];let n=0;
    const tick=()=>{img.src=n%2?a:b;n++;if(n<times*2)setTimeout(tick,step);else{img.src=a;delete img.dataset.playing}};
    tick();
  }
  // preload the second frames so flips never flash
  Object.values(frames).forEach(([,b])=>{const i=new Image();i.src=b});
  const once=(el,fn)=>{if(!("IntersectionObserver"in window))return;const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();setTimeout(fn,350)}},{threshold:.5});io.observe(el)};

  // Contact: waves when you arrive, and again when you reach for a contact link.
  const wave=document.querySelector('.fq-cameo--contact img');
  if(wave){
    once(wave,()=>play(wave,"wave",3,200));
    document.querySelectorAll("#contact .mail,#contact .whatsapp-contact,#contact .linkedin-contact").forEach(link=>{
      ["pointerenter","focus"].forEach(type=>link.addEventListener(type,()=>play(wave,"wave",2,200)));
    });
  }
  // Last frame: dozing in his chair at night, otherwise one sip of coffee.
  const fin=document.querySelector('.fq-cameo--fin');
  if(fin){
    const set=night?"sleep":"coffee";
    fin.src=frames[set][0];fin.dataset.cameo=set;
    if(night){fin.width=305;fin.height=561}
    once(fin,()=>play(fin,set,1,night?1400:900));
  }
})();
