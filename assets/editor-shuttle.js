/* FQ / Editor shuttle (easter egg).
 * J, K and L are the playback keys in every editing app: L plays forward (tap
 * again for 2x, 4x), K stops, J plays backward. Here they play the page itself:
 * a small timeline appears at the bottom with the chapters as clips, a playhead,
 * timecode and speed. Reaching the end shows FIN with how long the "render" took.
 * Touch: the Director's Cut has a "Play this page" button, and the timeline has
 * on-screen J K L buttons. Scrolling yourself, Escape or × hands control back.
 * Reduced motion: no gliding; L and J jump-cut to the next or previous chapter. */
(()=>{"use strict";
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const clipDefs=[[".hero","Opening"],["#cinema-wrap","The reel"],["#work","Selected work"],["#expertise","The craft"],["#about","Edit bay"],["#contact","Your story"]];
  const clips=clipDefs.map(([sel,name])=>({el:document.querySelector(sel),name})).filter(c=>c.el);
  if(clips.length<3)return;
  const SPEEDS=[1,2,4];
  const BASE=260; // px per second at 1x
  const FPS=25,LENGTH=60; // the whole page reads as one minute of timeline

  let hud=null,track=null,head=null,tc=null,speedLabel=null,clipLabel=null,status=null;
  let speed=0,raf=0,last=0,openedAt=0,ownScroll=false,finished=false;
  const pad=n=>String(n).padStart(2,"0");
  const maxScroll=()=>Math.max(1,document.documentElement.scrollHeight-innerHeight);
  const top=el=>el.getBoundingClientRect().top+scrollY;

  function build(){
    hud=document.createElement("div");
    hud.className="fq-shuttle";hud.setAttribute("role","region");hud.setAttribute("aria-label","Editor mode: play this page like a timeline");
    hud.innerHTML=
      '<div class="fq-shuttle__bar">'+
        '<span class="fq-shuttle__tc">00:00:00:00</span>'+
        '<span class="fq-shuttle__clip">Opening</span>'+
        '<span class="fq-shuttle__speed">Stopped</span>'+
        '<span class="fq-shuttle__keys">'+
          '<button type="button" data-shuttle="j" aria-label="Play backward (J)">J</button>'+
          '<button type="button" data-shuttle="k" aria-label="Stop (K)">K</button>'+
          '<button type="button" data-shuttle="l" aria-label="Play forward (L)">L</button>'+
        '</span>'+
        '<button type="button" class="fq-shuttle__close" data-shuttle="x" aria-label="Close editor mode">×</button>'+
      '</div>'+
      '<div class="fq-shuttle__track" aria-hidden="true"><i class="fq-shuttle__head"></i></div>'+
      '<span class="fq-shuttle__status" aria-live="polite"></span>';
    track=hud.querySelector(".fq-shuttle__track");head=hud.querySelector(".fq-shuttle__head");
    tc=hud.querySelector(".fq-shuttle__tc");speedLabel=hud.querySelector(".fq-shuttle__speed");
    clipLabel=hud.querySelector(".fq-shuttle__clip");status=hud.querySelector(".fq-shuttle__status");
    hud.addEventListener("click",e=>{const k=e.target.closest("[data-shuttle]")?.dataset.shuttle;if(k)key(k)});
    document.body.appendChild(hud);
    layoutClips();
  }
  function layoutClips(){
    track.querySelectorAll(".fq-shuttle__seg").forEach(s=>s.remove());
    const total=maxScroll()+innerHeight;
    clips.forEach((c,i)=>{
      const s=document.createElement("span");s.className="fq-shuttle__seg";
      const start=top(c.el),end=i<clips.length-1?top(clips[i+1].el):total;
      s.style.left=(start/total*100).toFixed(2)+"%";s.style.width=(Math.max(0,end-start)/total*100).toFixed(2)+"%";
      s.dataset.tone=String(i%3);s.title=c.name;
      track.insertBefore(s,head);
    });
  }
  function current(){
    const y=scrollY+innerHeight*.35;let idx=0;
    clips.forEach((c,i)=>{if(top(c.el)<=y)idx=i});return idx;
  }
  function paint(){
    if(!hud)return;
    const p=Math.min(1,scrollY/maxScroll());
    head.style.left=(p*100).toFixed(2)+"%";
    const f=Math.round(p*LENGTH*FPS);
    tc.textContent="00:"+pad(Math.floor(f/FPS/60))+":"+pad(Math.floor(f/FPS)%60)+":"+pad(f%FPS);
    clipLabel.textContent=clips[current()].name;
    speedLabel.textContent=speed===0?"Stopped":(speed<0?"◀ ":"▶ ")+Math.abs(speed)+"x";
    hud.dataset.state=speed===0?"stopped":speed>0?"forward":"backward";
  }
  function open(){
    if(!hud)build();
    if(hud.classList.contains("is-open"))return;
    hud.classList.add("is-open");openedAt=performance.now();finished=false;
    paint();
  }
  function close(){
    stop();if(!hud)return;
    hud.classList.remove("is-open");hud.dataset.fin="";
  }
  function stop(){speed=0;cancelAnimationFrame(raf);raf=0;paint()}
  function tick(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;
    const before=scrollY;
    ownScroll=true;scrollTo({top:before+speed*BASE*dt,behavior:"instant"});
    paint();
    if(speed>0&&scrollY>=maxScroll()-1)return fin();
    if(speed<0&&scrollY<=0){stop();say("Back to the first frame.");return}
    raf=requestAnimationFrame(tick);
  }
  function fin(){
    stop();finished=true;
    const s=(performance.now()-openedAt)/1000,f=Math.round(s*FPS);
    hud.dataset.fin="1";
    speedLabel.textContent="FIN.";
    say("FIN. Rendered in "+pad(Math.floor(s/60))+":"+pad(Math.floor(s)%60)+":"+pad(f%FPS)+". Not bad for a first cut.");
  }
  function say(text){if(status){status.textContent=text;hud.dataset.said="1"}}
  function cut(dir){
    // reduced motion: a straight cut to the next or previous chapter
    const i=Math.max(0,Math.min(clips.length-1,current()+dir));
    ownScroll=true;scrollTo({top:top(clips[i].el),behavior:"instant"});paint();
    if(dir>0&&i===clips.length-1)say("FIN.");
  }
  function key(k){
    if(k==="x")return close();
    open();
    if(k==="k"){stop();say("");return}
    const dir=k==="l"?1:-1;
    if(reduced.matches)return cut(dir);
    if(finished&&dir>0){say("That was the last frame. Press J to rewind.");return}
    finished=false;hud.dataset.fin="";
    const same=Math.sign(speed)===dir;
    const n=same?SPEEDS[Math.min(SPEEDS.length-1,SPEEDS.indexOf(Math.abs(speed))+1)]:1;
    speed=dir*n;say("");
    if(!raf){last=performance.now();raf=requestAnimationFrame(tick)}
    paint();
  }

  const typing=t=>t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  addEventListener("keydown",e=>{
    if(e.ctrlKey||e.metaKey||e.altKey||e.repeat||typing(e.target))return;
    if(document.querySelector("dialog[open]"))return;
    const k=e.key.toLowerCase();
    if(k==="escape"&&hud?.classList.contains("is-open")){close();return}
    if(k!=="j"&&k!=="k"&&k!=="l")return;
    if(k==="k"&&!hud?.classList.contains("is-open"))return; // K alone does nothing until editor mode is open
    e.preventDefault();key(k);
  });
  // your own scroll always wins over the shuttle
  const takeOver=()=>{if(speed!==0)stop()};
  addEventListener("wheel",takeOver,{passive:true});
  addEventListener("touchstart",takeOver,{passive:true});
  addEventListener("scroll",()=>{if(ownScroll){ownScroll=false;return}if(hud?.classList.contains("is-open"))paint()},{passive:true});
  addEventListener("resize",()=>{if(hud)layoutClips()});

  // The Director's Cut hints at it, and gives touch visitors a way in.
  document.querySelector("[data-shuttle-start]")?.addEventListener("click",()=>{
    document.getElementById("directors-cut")?.close();
    setTimeout(()=>key("l"),250);
  });
  console.info("%cFQ.%c  Editors know: J K L. Try it on this page.","font:700 14px Archivo,sans-serif;color:#7aa6ff","color:inherit");
})();
