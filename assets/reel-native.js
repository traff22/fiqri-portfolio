/* FQ / Chapter One native reel.
 * When assets/reel/clips.json lists clips exported by the owner, Chapter One
 * plays them as plain <video> (muted, inline) instead of YouTube embeds: no
 * YouTube title, logo or play button, and faster to start. With an empty or
 * missing list, or if every clip fails, chapter-montage.js keeps the YouTube
 * montage. Same UI and contract: title, 00:0x / 00:05 clock, progress, Next,
 * Pause, and the fq:shot event (category + YouTube id) for the blueprint and
 * the voxel monitor. See assets/reel/README.md for the export spec. */
(()=>{"use strict";
  const scene=document.getElementById("cinema-wrap");
  const shell=scene?.querySelector(".showreel-shell");
  const stage=shell?.querySelector(".showreel-montage");
  const panels=stage?[...stage.querySelectorAll(".montage-stream")]:[];
  let decide;
  window.fqReel={ready:new Promise(r=>{decide=r})};
  if(!scene||!stage||panels.length!==2){decide(false);return}

  const title=shell.querySelector(".montage-title"),clock=shell.querySelector(".montage-timestamp");
  const bar=shell.querySelector(".montage-progress"),skip=shell.querySelector(".montage-skip");
  const pauseButton=shell.querySelector(".montage-pause"),pauseText=pauseButton?.querySelector("span");
  const SHOT=5000;

  fetch("assets/reel/clips.json",{cache:"no-cache"})
    .then(r=>r.ok?r.json():[])
    .then(list=>{
      const clips=(Array.isArray(list)?list:[]).filter(c=>c&&(c.src||c.webm)&&c.title);
      if(!clips.length){decide(false);return}
      decide(true);run(clips);
    })
    .catch(()=>decide(false));

  function run(clips){
    stage.dataset.previewMode="native-clips";
    stage.dataset.sourceCount=String(clips.length);
    const videos=panels.map(p=>{
      const v=document.createElement("video");
      v.className="montage-native";v.muted=true;v.playsInline=true;v.preload="auto";
      v.setAttribute("muted","");v.setAttribute("playsinline","");v.setAttribute("aria-hidden","true");
      p.appendChild(v);return v;
    });
    const webm=document.createElement("video").canPlayType('video/webm; codecs="vp9"')!=="";
    const failed=new Set();
    let order=[],active=-1,current=null,visible=false,paused=false,started=false;
    let timer=0,preTimer=0,raf=0,shotStart=0,elapsed=0,queued=null;

    const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
    function refill(){
      const live=clips.filter(c=>!failed.has(c));
      const first=!started&&live.find(c=>c.opening);
      order=shuffle(live.filter(c=>c!==first));
      if(first)order.unshift(first);
      // never the same clip twice in a row across a refill
      if(order.length>1&&order[0]===current)order.push(order.shift());
    }
    const nextClip=()=>{if(!order.length)refill();return order.shift()||null};
    const srcOf=c=>webm&&c.webm?c.webm:(c.src||c.webm);
    const setProgress=ms=>{
      elapsed=Math.max(0,Math.min(SHOT,ms));
      bar?.style.setProperty("--segment-progress",(elapsed/SHOT).toFixed(4));
      bar?.setAttribute("aria-valuenow",String(Math.round(elapsed/1000)));
      if(clock)clock.textContent="00:0"+Math.floor(elapsed/1000)+" / 00:05";
    };
    const tick=now=>{setProgress(now-shotStart);if(elapsed<SHOT&&!paused)raf=requestAnimationFrame(tick)};
    const clear=()=>{clearTimeout(timer);clearTimeout(preTimer);cancelAnimationFrame(raf)};
    function announce(c){
      if(c?.category)scene.dataset.activeCategory=c.category;else delete scene.dataset.activeCategory;
      scene.dispatchEvent(new CustomEvent("fq:shot",{detail:{category:c?.category||null,id:c?.youtube||null,title:c?.title||null}}));
    }
    function load(slot,clip){
      const v=videos[slot];
      v.dataset.clip=clip.title;
      if(clip.poster)v.poster=clip.poster;
      v.src=srcOf(clip);
      v.load();
    }
    function show(slot,clip){
      const v=videos[slot],prev=active;
      active=slot;current=clip;started=true;
      panels[slot].classList.add("is-current");
      if(prev>=0&&prev!==slot){panels[prev].classList.remove("is-current");setTimeout(()=>{if(active!==prev)videos[prev].pause()},650)}
      stage.dataset.playback="playing";stage.classList.add("is-playing");shell.classList.add("is-playing");
      if(title)title.textContent=clip.title;
      announce(clip);
      shotStart=performance.now();setProgress(0);
      clear();raf=requestAnimationFrame(tick);
      timer=setTimeout(advance,SHOT);
      preTimer=setTimeout(()=>{queued=nextClip();if(queued)load(1-slot,queued)},1400);
      if(paused)hold();
    }
    function play(slot,clip){
      if(!clip)return;
      const v=videos[slot];
      if(v.dataset.clip!==clip.title||!v.src)load(slot,clip);
      const begin=()=>{try{v.currentTime=clip.start||0}catch(_){}
        v.play().then(()=>show(slot,clip)).catch(()=>{if(!visible)return;stage.dataset.playback="blocked";if(title)title.textContent="Tap Next to play"})};
      if(v.readyState>=1)begin();else v.addEventListener("loadedmetadata",begin,{once:true});
    }
    function advance(){
      if(!visible||paused)return;
      const slot=active<0?0:1-active;
      const clip=queued||nextClip();queued=null;
      play(slot,clip);
    }
    function hold(){clear();videos.forEach(v=>v.pause())}
    videos.forEach((v,slot)=>v.addEventListener("error",()=>{
      const bad=clips.find(c=>c.title===v.dataset.clip);
      if(bad)failed.add(bad);
      if(failed.size>=clips.length){
        // nothing playable: hand Chapter One back to the YouTube montage
        clear();videos.forEach(x=>{x.removeAttribute("src");x.remove()});
        delete stage.dataset.previewMode;
        window.dispatchEvent(new CustomEvent("fq:reel-fallback"));
        return;
      }
      if(slot===(active<0?0:1-active)||active===slot){queued=null;advance()}
    }));

    function setPaused(on){
      paused=on;
      shell.classList.toggle("is-user-paused",false); // native video pauses on its own frame
      if(pauseButton){
        pauseButton.setAttribute("aria-pressed",String(on));
        pauseButton.setAttribute("aria-label",on?"Play the previews":"Pause the previews");
        if(pauseText)pauseText.textContent=on?"Play":"Pause";
      }
      if(on){hold();return}
      if(active<0){advance();return}
      const v=videos[active];
      v.play().catch(()=>{});
      shotStart=performance.now()-elapsed;raf=requestAnimationFrame(tick);
      timer=setTimeout(advance,Math.max(400,SHOT-elapsed));
      if(!queued)preTimer=setTimeout(()=>{queued=nextClip();if(queued)load(1-active,queued)},900);
    }
    pauseButton?.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();setPaused(!paused)},true);
    skip?.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();clear();if(paused)setPaused(false);else advance()},true);

    const onView=on=>{
      visible=on;
      if(!on){hold();announce(null);return}
      if(paused)return;
      if(active<0)advance();else setPaused(false);
    };
    if("IntersectionObserver"in window){
      new IntersectionObserver(es=>onView(es.some(e=>e.isIntersecting)),{threshold:.04,rootMargin:"180px 0px"}).observe(shell);
    }else onView(true);
    document.addEventListener("visibilitychange",()=>{if(document.hidden)hold();else if(visible&&!paused&&active>=0)setPaused(false)});
  }
})();
