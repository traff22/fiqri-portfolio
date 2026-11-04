/* Fiqri / editorial atmosphere v1.8
 * Film-production microgeometry: edit keyframes, crop marks, focus crosses,
 * timeline ticks and perforations. Never content, never clickable.
 * A few GPU-composited parent planes provide depth, not hundreds of moving DOM nodes.
 */
(()=>{"use strict";
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
const fine=window.matchMedia("(hover: hover) and (pointer: fine)");
const saveData=()=>!!navigator.connection?.saveData;
const config=[
 {selector:".hero",n:[6,9,7],strength:1,horizon:"63%"},
 {selector:"#cinema-wrap .cinema-stick",n:[8,12,10],strength:1.25,horizon:"51%"},
 {selector:"#work",n:[5,7,4],strength:.65,horizon:"47%"},
 {selector:".expertise",n:[3,4,2],strength:.42,horizon:"43%"}
];
const symbols={
 keyframe:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z"/><circle cx="12" cy="12" r="1.45"/></svg>',
 crop:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 9V3h6M16 3h6v6M22 15v6h-6M8 21H2v-6"/></svg>',
 perforation:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="2.8" width="16" height="18.4" rx="1"/><path d="M7 3v18M17 3v18"/><path d="M5 7h3M5 12h3M5 17h3M16 7h3M16 12h3M16 17h3"/></svg>',
 cross:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v6M12 16v6M2 12h6M16 12h6"/></svg>',
 wave:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12h3V7h3v10h3V4h3v16h3V9h3v6h2"/></svg>',
 tick:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 6v12M7 10v8M12 6v12M17 10v8M22 6v12"/></svg>',
 spark:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2.6"/></svg>'
};
const types=["keyframe","crop","perforation","cross","wave","tick","spark"];
function seeded(n){let v=(Math.imul(n+41,2654435761)>>>0);v^=v>>>16;v=Math.imul(v,2246822519)>>>0;return(v>>>0)/4294967295}
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const scenes=[];
const baseMobile=()=>innerWidth<700;
config.forEach((setting,si)=>{
 const section=document.querySelector(setting.selector);
 if(!section)return;
 const atmosphere=document.createElement("div");
 atmosphere.className="editorial-atmosphere";
 atmosphere.setAttribute("aria-hidden","true");
 atmosphere.dataset.editorialScene=["hero","chapter","work","expertise"][si];
 const grid=document.createElement("div");grid.className="ed-depth-grid";atmosphere.appendChild(grid);
 const horizon=document.createElement("div");horizon.className="ed-depth-horizon";
 horizon.style.setProperty("--ed-horizon",setting.horizon);
 atmosphere.appendChild(horizon);
 if(si<3){
  for(let side=0;side<2;side++){
   const rail=document.createElement("div");
   rail.className="ed-film-rail"+(side?" ed-film-rail--right":"");
   for(let k=0;k<6;k++)rail.appendChild(document.createElement("i"));
   atmosphere.appendChild(rail);
  }
 }
 const planes=[];
 ["far","mid","near"].forEach((depth,li)=>{
  const layer=document.createElement("div");
  layer.className="ed-plane ed-plane--"+depth;
  const count=setting.n[li];
  for(let pi=0;pi<count;pi++){
   // Fixed decorative positions: reproducible and stable across client renders.
   const seed=si*683+li*101+pi*19;
   const type=types[(pi+li*3+si*2)%types.length];
   const part=document.createElement("span");
   part.className="ed-particle ed-particle--"+type;
   part.innerHTML=symbols[type];
   const left=5+seeded(seed+1)*90;
   let top=6+seeded(seed+3)*87;
   // Avoid a concentrated cluster directly behind the large Chapter One heading.
   if(si===1&&top<29&&left>30&&left<72)top=34+seeded(seed+17)*22;
   const size=(depth==="far"?9:depth==="mid"?13:16)*(0.6+seeded(seed+5)*.8);
   part.style.cssText=[
    "left:"+left.toFixed(2)+"%",
    "top:"+top.toFixed(2)+"%",
    "--ed-size:"+size.toFixed(1)+"px",
    "--ed-opacity:"+(0.3+seeded(seed+7)*.43).toFixed(2),
    "--ed-duration:"+(7+seeded(seed+11)*8).toFixed(2)+"s",
    "--ed-delay:"+(-seeded(seed+13)*11).toFixed(2)+"s",
    "--ed-rotate:"+(seeded(seed+29)*90-45).toFixed(1)+"deg"
   ].join(";");
   layer.appendChild(part);
  }
  atmosphere.appendChild(layer);
  planes.push(layer);
 });
 section.prepend(atmosphere);
 const state={section,planes,grid,horizon,strength:setting.strength,
  visible:true,pointerX:0,pointerY:0,currentX:0,currentY:0};
 scenes.push(state);
 if(fine.matches){
  section.addEventListener("pointermove",e=>{
   if(reduced.matches||saveData()||e.pointerType==="touch")return;
   const rect=section.getBoundingClientRect();
   state.pointerX=clamp((e.clientX-rect.left)/rect.width*2-1,-1,1);
   state.pointerY=clamp((e.clientY-rect.top)/Math.min(innerHeight,rect.height)*2-1,-1,1);
   requestPaint();
  },{passive:true});
  section.addEventListener("pointerleave",()=>{
   state.pointerX=0;state.pointerY=0;requestPaint();
  },{passive:true});
 }
});
if(!scenes.length)return;
const allow=()=>!reduced.matches&&!saveData();
let raf=0,lastScrollY=-1;
function paint(){
 raf=0;
 const active=allow(),vh=innerHeight||1,mobile=baseMobile();
 let follow=false;
 for(const state of scenes){
  if(!state.visible)continue;
  const rect=state.section.getBoundingClientRect();
  if(rect.top>vh*1.3||rect.bottom< -vh*.3)continue;
  if(!active){
   state.planes.forEach(p=>{p.style.transform="";p.style.willChange="auto"});
   state.grid.style.transform="";
   state.horizon.style.transform="";
   continue;
  }
  state.currentX+=(state.pointerX-state.currentX)*.16;
  state.currentY+=(state.pointerY-state.currentY)*.16;
  if(Math.abs(state.pointerX-state.currentX)+Math.abs(state.pointerY-state.currentY)>.025)follow=true;
  const progress=clamp((vh-rect.top)/(vh+rect.height),0,1);
  const offset=(progress-.5)*2;
  const strength=state.strength*(mobile?.45:1);
  // Each plane occupies a genuinely distinct scroll/pointer distance.
  const factors=[{y:25,x:8,mouse:8,scale:.025},
                 {y:65,x:13,mouse:19,scale:.065},
                 {y:112,x:21,mouse:29,scale:.115}];
  state.planes.forEach((plane,i)=>{
   const f=factors[i],x=offset*f.x*strength+state.currentX*f.mouse*strength;
   const y=offset*f.y*strength+state.currentY*f.mouse*.45*strength;
   const zoom=1+Math.abs(offset)*f.scale*(mobile?.48:1);
   plane.style.transform="translate3d("+x.toFixed(1)+"px,"+y.toFixed(1)+"px,0) scale("+zoom.toFixed(3)+")";
  });
  state.grid.style.transform="translate3d(0,"+(offset*32*strength).toFixed(1)+"px,0) rotate(-4deg)";
  state.horizon.style.transform="translate3d(0,"+(offset*45*strength).toFixed(1)+"px,0) rotate(-7deg)";
 }
 if(follow)requestPaint();
 lastScrollY=scrollY;
}
function requestPaint(){if(!raf)raf=requestAnimationFrame(paint)}
if("IntersectionObserver"in window){
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   const entryState=scenes.find(x=>x.section===entry.target);
   if(entryState)entryState.visible=entry.isIntersecting;
  });
  requestPaint();
 },{rootMargin:"40% 0px",threshold:0});
 scenes.forEach(s=>observer.observe(s.section));
}
addEventListener("scroll",requestPaint,{passive:true});
addEventListener("resize",requestPaint,{passive:true});
reduced.addEventListener?.("change",requestPaint);
addEventListener("pageshow",requestPaint);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)requestPaint()});
const gallery=document.querySelector("#work");
if(gallery&&fine.matches){
 let hovered=null,hoverRaf=0,px=50,py=50;
 gallery.addEventListener("pointermove",e=>{
  if(reduced.matches)return;
  const target=e.target.closest?.(".work-card:not([hidden])");
  if(target!==hovered)hovered=target;
  if(!target)return;
  const media=target.querySelector(".work-media");
  if(!media)return;
  const box=media.getBoundingClientRect();
  px=clamp((e.clientX-box.left)/box.width*100,0,100);
  py=clamp((e.clientY-box.top)/box.height*100,0,100);
  if(hoverRaf)return;
  hoverRaf=requestAnimationFrame(()=>{
   hoverRaf=0;media.style.setProperty("--ed-card-glow-x",px.toFixed(1)+"%");
   media.style.setProperty("--ed-card-glow-y",py.toFixed(1)+"%");
  });
 },{passive:true});
}
requestPaint();
})();
