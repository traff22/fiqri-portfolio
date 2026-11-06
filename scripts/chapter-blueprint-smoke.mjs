// Chapter One "Cutting Room Marks": thumbnails never collide with the film,
// blueprint connectors stay attached to real boxes at every size and scroll
// position, all source clips are 16:9, and each clip opens its project.
import {chromium} from "playwright";
import fs from "node:fs";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
fs.mkdirSync("screenshots",{recursive:true});
const area=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*
  Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));

const viewports=[
  ["desktop",1440,900,3],["wide",1920,1080,3],["laptop",1180,820,3],
  ["tablet-portrait",768,1024,2],["mobile",390,844,2],["small-mobile",320,740,2]
];
try{
  for(const [name,width,height,expected] of viewports){
    const touch=width<700;
    const page=await browser.newPage({viewport:{width,height},hasTouch:touch,isMobile:touch,reducedMotion:"no-preference"});
    await page.addInitScript(()=>{try{sessionStorage.setItem("fiqri-intro-seen","yes")}catch{}}); // skip the opening titles (tested in design-system-smoke)
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    await page.goto("http://127.0.0.1:4173/",{waitUntil:"domcontentloaded"});
    const scene=page.locator("#cinema-wrap");
    const start=await scene.evaluate(el=>el.offsetTop);
    const span=await scene.evaluate(el=>Math.max(1,el.offsetHeight-innerHeight));
    for(const progress of [0,.5,1]){
      await page.evaluate(y=>window.scrollTo({top:y,behavior:"instant"}),start+span*progress);
      await page.waitForTimeout(650);
      const g=await page.evaluate(()=>{
        const box=el=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
        const host=document.querySelector(".fq-blueprint").getBoundingClientRect();
        const film=box(document.querySelector(".showreel-shell .showreel-visual"));
        const strip=box(document.querySelector(".showreel-shell > .montage-overlay"));
        const cards=[...document.querySelectorAll(".float-reel-card")]
          .filter(c=>getComputedStyle(c).display!=="none")
          .map(c=>({name:c.className.match(/--(\w+)/)[1],...box(c),
            // Layout size, not the rotated bounding box.
            media:(m=>({width:m.offsetWidth,height:m.offsetHeight}))(c.querySelector(".float-reel-card__media"))}));
        const links=[...document.querySelectorAll(".fq-blueprint__clip:not([display]) .fq-blueprint__link")].map(p=>{
          const d=p.getAttribute("d"),n=d.match(/-?\d+(\.\d+)?/g).map(Number);
          const vertical=/^M[\d.\- ]+V/.test(d);
          // Vertical links end on a y value, side links on an x value.
          return {x1:n[0]+host.left,y1:n[1]+host.top,end:n[n.length-1]+(vertical?host.top:host.left),vertical};
        });
        return {film,strip,cards,links,
          cta:box(document.querySelector(".cinema-view-work")),
          vw:innerWidth,vh:innerHeight,
          overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
      });
      const tag=name+"@"+progress;
      const frame={...g.film,bottom:Math.max(g.film.bottom,g.strip.bottom)};
      assert(g.cards.length===expected,tag+": expected "+expected+" thumbnails, got "+g.cards.length);
      assert(frame.bottom<=g.vh,tag+": film caption strip falls below the viewport ("+Math.round(frame.bottom)+")");
      assert(area(frame,g.cta)<=4,tag+": CTA overlaps the film");
      for(const c of g.cards){
        assert(area(c,frame)<=4,tag+": "+c.name+" thumbnail collides with the film");
        assert(area(c,g.cta)<=4,tag+": "+c.name+" thumbnail collides with the CTA");
        assert(c.left>=0&&c.right<=g.vw&&c.bottom<=g.vh,tag+": "+c.name+" thumbnail leaves the viewport");
        assert(Math.abs(c.media.width/c.media.height-16/9)<.04,tag+": "+c.name+" thumbnail is not 16:9");
      }
      assert(g.links.length===g.cards.length,tag+": "+g.links.length+" connectors for "+g.cards.length+" thumbnails");
      // Every connector starts at a thumbnail edge and ends at the film edge.
      for(const l of g.links){
        if(l.vertical){
          assert(g.cards.some(c=>Math.abs(l.y1-c.top)<=12&&l.x1>=c.left&&l.x1<=c.right),tag+": vertical connector detached from thumbnail");
          assert(Math.abs(l.end-frame.bottom)<=10,tag+": vertical connector detached from film");
        }else{
          assert(g.cards.some(c=>Math.min(Math.abs(l.x1-c.right),Math.abs(l.x1-c.left))<=10),tag+": connector detached from thumbnail");
          assert(Math.min(Math.abs(l.end-g.film.left),Math.abs(l.end-g.film.right))<=10,tag+": connector detached from film");
        }
      }
      assert(g.overflow<=1,tag+": horizontal overflow "+g.overflow);
      if(progress===.5)await page.screenshot({path:"screenshots/chapter-blueprint-"+name+".png"});
    }
    // Follow the edit: the clip matching the film on screen becomes the source.
    const state=()=>page.evaluate(()=>({
      source:document.querySelector(".fq-blueprint").dataset.activeSource,
      cards:Object.fromEntries([...document.querySelectorAll(".float-reel-card")].map(c=>[
        c.className.match(/--(\w+)/)[1],
        c.classList.contains("is-source")?"source":c.classList.contains("is-idle")?"idle":"neutral"])),
      active:[...document.querySelectorAll(".fq-blueprint__clip.is-active")].map(g=>g.dataset.category),
      crop:(document.querySelector(".fq-blueprint__crop")?.getAttribute("d")||"").length
    }));
    const shot=category=>page.evaluate(c=>document.querySelector("#cinema-wrap")
      .dispatchEvent(new CustomEvent("fq:shot",{detail:{category:c}})),category);
    await shot("longform");
    let st=await state();
    assert(st.source==="longform"&&st.cards.two==="source"&&st.cards.one==="idle"&&st.active.join()==="longform",
      name+": longform film did not light the editorial clip "+JSON.stringify(st));
    if(width>=700)assert(st.crop>20,name+": crop marks missing around the film");
    await shot("event");
    st=await state();
    if(expected===3)assert(st.source==="event"&&st.cards.three==="source"&&st.cards.two==="idle",name+": event film did not light the event clip "+JSON.stringify(st));
    else assert(st.source==="none"&&st.cards.one==="neutral"&&st.cards.two==="neutral",name+": hidden event clip must leave the visible clips neutral "+JSON.stringify(st));
    await shot(null);
    st=await state();
    assert(st.source==="none"&&!st.active.length&&Object.values(st.cards).every(v=>v==="neutral"),
      name+": clips should return to neutral without real playback "+JSON.stringify(st));

    // Thumbnails open the real project through the Selected Work dialogs.
    const first=page.locator(".float-reel-card--one .float-reel-card__open");
    await first.scrollIntoViewIfNeeded();
    if(touch)await first.tap();else await first.click();
    await page.waitForTimeout(300);
    const opened=await page.evaluate(()=>document.querySelector("dialog[open]")?.id||"");
    assert(opened==="video-dialog",name+": product thumbnail did not open its project ("+opened+")");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    assert(await page.evaluate(()=>!!document.activeElement?.closest(".float-reel-card--one")),name+": focus not returned to the thumbnail");
    assert(!errors.length,name+": runtime errors "+errors.join(" | "));
    console.log("CHAPTER_BLUEPRINT_PASS="+JSON.stringify({name,thumbs:expected}));
    await page.close();
  }
}finally{await browser.close()}
