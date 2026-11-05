/* FQ / Creator's Lab 01 — progressive, accessible scene interactions.
 * Loads first-party SVG illustration. Buttons change mini editor actions;
 * scrolling through Chapter One advances the captured/cut/deliver blueprint.
 * No animation framework or WebGL dependency. */
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
    coffee:{title:"Coffee break.",body:"The best idea might arrive in five minutes."}
  };
  function setMode(mode){
    if(!Object.prototype.hasOwnProperty.call(messages,mode))return;
    studio.dataset.mode=mode;
    studio.querySelectorAll("[data-studio-mode]").forEach(button=>{
      button.setAttribute("aria-pressed",String(button.dataset.studioMode===mode));
    });
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
  studio.querySelectorAll("[data-studio-mode]").forEach(button=>{
    button.addEventListener("click",()=>setMode(button.dataset.studioMode));
  });
  setMode("edit");

  // First-party, same-origin SVG is editable artwork, not an external asset
  // or a fake raster of an interactive scene.
  fetch("assets/creator-workspace.svg")
    .then(response=>{if(!response.ok)throw Error("Artwork unavailable");return response.text()})
    .then(source=>{
      const xml=new DOMParser().parseFromString(source,"image/svg+xml");
      const svg=xml.documentElement;
      if(svg.localName!=="svg"||xml.querySelector("parsererror"))throw Error("Artwork is invalid");
      art.replaceChildren(document.importNode(svg,true));
      // The diorama is explorable. Hovering gently tilts the ROOM; selecting
      // visible props works with mouse, touch or keyboard.
      art.querySelectorAll("[data-studio-object]").forEach(object=>{
        const action=()=>{
          const which=object.dataset.studioObject;
          if(which==="screen")setMode("edit");
          else if(which==="render")setMode("render");
          else if(which==="coffee")setMode("coffee");
          else if(which==="avatar"){
            studio.classList.remove("is-waving");
            void studio.getBoundingClientRect();
            studio.classList.add("is-waving");
            setTimeout(()=>studio.classList.remove("is-waving"),1800);
            const bold=document.createElement("strong");
            bold.textContent="Oh, hey there! ";
            note.replaceChildren(bold,document.createTextNode("Back to the timeline in a second."));
          }
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
      // Preserve a useful fallback instead of a blank interactive panel.
      art.textContent="A desk, two monitors, a timeline, and one more cut.";
      art.classList.add("fq-studio__fallback");
    });

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