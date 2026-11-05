/* FQ / Creator's Lab — progressive, accessible scene interactions.
 * About: loads the real-time 3D voxel editing room (assets/voxel-studio.js,
 * Three.js vendored) when the section comes near; falls back to the
 * first-party SVG room without WebGL. Buttons trigger the same actions.
 * Chapter One: scrolling advances the ingest / cut / finish ruler. */
(()=>{"use strict";
  const studio=document.getElementById("fq-studio");
  const art=document.getElementById("fq-studio-art");
  const note=document.getElementById("fq-studio-note");
  const chapter=document.getElementById("cinema-wrap");
  const blueprint=chapter?.querySelector(".fq-blueprint");
  if(!studio||!art||!note)return;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const messages={
    edit:{title:"On the timeline.",body:"Cut by cut, finding the rhythm."},
    render:{title:"Rendering...",body:"Final_final_v7. Probably."},
    coffee:{title:"Coffee break.",body:"The best idea might arrive in five minutes."},
    wave:{title:"Oh, hey there!",body:"Back to the timeline in a second."}
  };
  let voxel=null;
  // Reflect what mini Fiqri is doing. Autonomous changes update the UI quietly;
  // only visitor-triggered changes are announced to screen readers.
  function setMode(mode,{byUser=false}={}){
    if(!Object.prototype.hasOwnProperty.call(messages,mode))return;
    if(mode!=="wave")studio.dataset.mode=mode;
    studio.dataset.state=mode;
    studio.querySelectorAll("[data-studio-mode]").forEach(button=>{
      button.setAttribute("aria-pressed",String(button.dataset.studioMode===(mode==="wave"?"wave":studio.dataset.mode)));
    });
    note.setAttribute("aria-live",byUser?"polite":"off");
    const bold=document.createElement("strong");
    bold.textContent=messages[mode].title+" ";
    note.replaceChildren(bold,document.createTextNode(messages[mode].body));
    const bar=art.querySelector(".fq-render-bar");
    if(mode==="render"&&bar){
      // Restart the render bar when repeatedly pressing the Render control.
      bar.style.animation="none";
      void bar.getBoundingClientRect();
      bar.style.animation="";
    }
  }
  function svgWave(){
    studio.classList.remove("is-waving");
    void studio.getBoundingClientRect();
    studio.classList.add("is-waving");
    setTimeout(()=>studio.classList.remove("is-waving"),1800);
  }
  studio.querySelectorAll("[data-studio-mode]").forEach(button=>{
    button.addEventListener("click",()=>{
      const mode=button.dataset.studioMode;
      if(voxel){voxel.trigger(mode);return}
      if(mode==="wave")svgWave();
      setMode(mode,{byUser:true});
    });
  });
  setMode("edit");

  // Fallback: the first-party 2.5D SVG room, used when WebGL is unavailable.
  function loadSvgRoom(){
    studio.dataset.engine="svg";
    return fetch("assets/creator-workspace.svg?v=2.0.0")
    .then(response=>{if(!response.ok)throw Error("Artwork unavailable");return response.text()})
    .then(source=>{
      const xml=new DOMParser().parseFromString(source,"image/svg+xml");
      const svg=xml.documentElement;
      if(svg.localName!=="svg"||xml.querySelector("parsererror"))throw Error("Artwork is invalid");
      art.replaceChildren(document.importNode(svg,true));
      art.querySelectorAll("[data-studio-object]").forEach(object=>{
        const action=()=>{
          const which=object.dataset.studioObject;
          if(which==="screen")setMode("edit",{byUser:true});
          else if(which==="render")setMode("render",{byUser:true});
          else if(which==="coffee")setMode("coffee",{byUser:true});
          else if(which==="avatar"){svgWave();setMode("wave",{byUser:true})}
        };
        object.addEventListener("click",action);
        object.addEventListener("keydown",e=>{
          if(e.key==="Enter"||e.key===" "){e.preventDefault();action()}
        });
        object.addEventListener("pointerenter",()=>{
          if(object.dataset.studioObject==="avatar")studio.classList.add("is-curious");
        });
        object.addEventListener("pointerleave",()=>studio.classList.remove("is-curious"));
      });
      const fine=matchMedia("(hover: hover) and (pointer: fine)");
      art.addEventListener("pointermove",e=>{
        if(!fine.matches||reduced.matches||e.pointerType==="touch")return;
        const r=art.getBoundingClientRect();
        const x=(e.clientX-r.left)/Math.max(1,r.width)-.5;
        const y=(e.clientY-r.top)/Math.max(1,r.height)-.5;
        art.style.setProperty("--fq-room-ry",(x*3.3).toFixed(2)+"deg");
        art.style.setProperty("--fq-room-rx",(-y*2.2).toFixed(2)+"deg");
      },{passive:true});
      art.addEventListener("pointerleave",()=>{
        art.style.removeProperty("--fq-room-ry");
        art.style.removeProperty("--fq-room-rx");
      });
    })
    .catch(()=>{
      art.textContent="A desk, two monitors, a timeline, and one more cut.";
      art.classList.add("fq-studio__fallback");
    });
  }
  const webgl=(()=>{try{const c=document.createElement("canvas");return Boolean(c.getContext("webgl2")||c.getContext("webgl"))}catch(_){return false}})();
  // Primary: the real-time 3D voxel room, loaded only when About comes near.
  function loadVoxelRoom(){
    if(!webgl){loadSvgRoom();return}
    studio.dataset.engine="loading";
    import(new URL("assets/voxel-studio.js?v=1.0.0",document.baseURI).href)
      .then(({mountVoxelStudio})=>{
        art.replaceChildren();
        art.classList.add("fq-studio__art--voxel");
        voxel=mountVoxelStudio(art,{reducedMotion:reduced,onState:(mode,byUser)=>setMode(mode,{byUser})});
        studio.dataset.engine="voxel";
      })
      .catch(()=>{art.classList.remove("fq-studio__art--voxel");loadSvgRoom()});
  }
  if("IntersectionObserver"in window){
    const near=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){near.disconnect();loadVoxelRoom()}
    },{rootMargin:"700px 0px"});
    near.observe(studio);
  }else loadVoxelRoom();

  // Scrub the hand-drawn production blueprint using real scroll progress.
  if(blueprint&&chapter){
    const phases=["capture","craft","deliver"];
    let raf=0;
    function paintBlueprint(){
      raf=0;
      const rect=chapter.getBoundingClientRect();
      const vh=Math.max(1,innerHeight);
      if(rect.top>vh*1.2||rect.bottom<-vh*.2)return;
      const scrollable=Math.max(1,chapter.offsetHeight-vh);
      const amount=Math.min(1,Math.max(0,-rect.top/scrollable));
      const current=reduced.matches?1:Math.min(2,Math.floor(amount*3));
      blueprint.dataset.phase=phases[current];
      blueprint.style.setProperty("--fq-blueprint-y",reduced.matches?"0px":((amount-.5)*-22).toFixed(1)+"px");
    }
    function schedule(){if(!raf)raf=requestAnimationFrame(paintBlueprint)}
    addEventListener("scroll",schedule,{passive:true});
    addEventListener("resize",schedule,{passive:true});
    reduced.addEventListener?.("change",schedule);
    schedule();
  }
})();