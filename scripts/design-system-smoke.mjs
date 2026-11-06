// Anti-slop audit 001 fixes stay fixed: no em dashes, ↗ only on links that
// leave the site, 44px touch targets, pause controls for endless motion, the
// time-of-day mood, the one-line portrait note, What I do evidence, and the
// Chapter One lens grid.
import {chromium} from "playwright";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const youTubeMock=()=>{
  window.__ytQA={loads:[],pauses:0};
  class MockPlayer{
    constructor(root,config){this.config=config;this.state=-1;setTimeout(()=>config.events.onReady({target:this}),25)}
    mute(){}setVolume(){}getDuration(){return 95}getPlayerState(){return this.state}
    loadVideoById({videoId}){window.__ytQA.loads.push(videoId);this.state=1;setTimeout(()=>this.config.events.onStateChange({data:1,target:this}),40)}
    seekTo(){this.state=1;setTimeout(()=>this.config.events.onStateChange({data:1,target:this}),45)}
    pauseVideo(){this.state=2;window.__ytQA.pauses++}
    playVideo(){this.state=1;setTimeout(()=>this.config.events.onStateChange({data:1,target:this}),35)}
  }
  window.YT={Player:MockPlayer,PlayerState:{PLAYING:1,ENDED:0,PAUSED:2,BUFFERING:3}};
};
try{
  for(const [name,width,height] of [["desktop",1440,900],["mobile",390,844]]){
    const touch=width<700;
    const page=await browser.newPage({viewport:{width,height},hasTouch:touch,isMobile:touch,reducedMotion:"no-preference"});
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    await page.addInitScript(youTubeMock);
    await page.goto("http://127.0.0.1:4173/?daypart=dusk",{waitUntil:"domcontentloaded"});
    assert(await page.evaluate(()=>document.documentElement.dataset.daypart)==="dusk",name+": ?daypart override ignored");

    // Copy: no em/en dashes anywhere on the page; ↗ only on external links.
    const copy=await page.evaluate(()=>{
      const text=document.body.innerText+" "+document.title;
      const arrows=[...document.querySelectorAll("a,button")].filter(el=>el.textContent.includes("↗"))
        .map(el=>({text:el.textContent.trim().slice(0,30),external:/^(https?:|mailto:)/.test(el.getAttribute("href")||"")||el.target==="_blank"}));
      return {dashes:(text.match(/[—–]/g)||[]).length,arrows};
    });
    assert(copy.dashes===0,name+": "+copy.dashes+" em/en dashes in visible copy");
    const internalArrows=copy.arrows.filter(a=>!a.external);
    assert(!internalArrows.length,name+": ↗ on in-site controls "+JSON.stringify(internalArrows));

    // Portrait back: one line only (owner, K6).
    const back=await page.evaluate(()=>[...document.querySelector(".portrait-card__face--back").querySelectorAll("p,span,div")].map(e=>e.textContent.trim()).filter(Boolean));
    assert(back.length===1&&back[0]==="Just a person who loves the art of life.",name+": portrait back is not the single owner line "+JSON.stringify(back));

    // Touch targets on phones.
    if(touch){
      await page.locator("#about").scrollIntoViewIfNeeded();
      const small=await page.evaluate(()=>[...document.querySelectorAll(".montage-skip,.montage-pause,.fq-studio__button,.footer .replay,.footer .footer-top,.topbar .logo,#mobile-menu")]
        .map(el=>{const r=el.getBoundingClientRect();return {t:(el.textContent||el.getAttribute("aria-label")||"").trim().slice(0,20),w:Math.round(r.width),h:Math.round(r.height)}})
        .filter(c=>c.w&&(c.w<44||c.h<44)));
      assert(!small.length,name+": touch targets under 44px "+JSON.stringify(small));
      assert(await page.locator("#mobile-menu").evaluate(el=>getComputedStyle(el).cursor)==="pointer",name+": menu button lacks pointer cursor");
    }

    // Showreel pause: the clock stops, Play resumes.
    await page.locator("#cinema-wrap .showreel-shell").scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector(".montage-stream.is-current"),null,{timeout:9000});
    await page.locator(".montage-pause").click();
    assert(await page.locator(".montage-pause").getAttribute("aria-pressed")==="true",name+": pause did not engage");
    const clockA=await page.locator(".montage-timestamp").textContent();
    await page.waitForTimeout(1600);
    const clockB=await page.locator(".montage-timestamp").textContent();
    assert(clockA===clockB,name+": showreel kept running while paused ("+clockA+" → "+clockB+")");
    await page.locator(".montage-pause").click();
    await page.waitForTimeout(1300);
    assert((await page.locator(".montage-timestamp").textContent())!==clockB,name+": showreel did not resume");

    // Chapter One lens grid is drawn (non-empty canvas) under a blur vignette.
    const lens=await page.evaluate(()=>{
      const c=document.querySelector(".fq-blueprint__lens");if(!c)return {ok:false};
      const d=c.getContext("2d").getImageData(0,0,c.width,c.height).data;let lit=0;
      for(let i=3;i<d.length;i+=4*97)if(d[i]>0)lit++;
      return {ok:true,lit,vignette:getComputedStyle(document.querySelector(".fq-blueprint__vignette")).backdropFilter};
    });
    assert(lens.ok&&lens.lit>50&&/blur/.test(lens.vignette),name+": lens grid / blur vignette missing "+JSON.stringify(lens));

    // What I do: varied hierarchy, every craft backed by a real project.
    const crafts=await page.evaluate(()=>[...document.querySelectorAll(".craft")].map(c=>({lead:c.classList.contains("craft--lead"),clips:c.querySelectorAll("[data-open-project]").length})));
    assert(crafts.length===3&&crafts[0].lead&&crafts.every(c=>c.clips>=1),name+": What I do lost its evidence "+JSON.stringify(crafts));
    const clip=page.locator('.craft [data-open-project="logistics-nine"]');
    await clip.scrollIntoViewIfNeeded();
    if(touch)await clip.tap();else await clip.click();
    await page.waitForTimeout(250);
    assert(await page.evaluate(()=>document.querySelector("dialog[open]")?.id)==="video-dialog",name+": craft evidence did not open its project");
    await page.keyboard.press("Escape");
    await page.waitForFunction(()=>!document.querySelector("dialog[open]")&&!document.body.classList.contains("modal-open"),null,{timeout:4000});
    await page.waitForTimeout(350); // let the dialog close transition finish

    // Editing room pause.
    await page.locator("#fq-studio").scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>["voxel","svg"].includes(document.querySelector("#fq-studio")?.dataset.engine),null,{timeout:20000});
    await page.locator("[data-studio-pause]").click();
    const pauseState=await page.evaluate(()=>({pressed:document.querySelector("[data-studio-pause]").getAttribute("aria-pressed"),note:document.querySelector("#fq-studio-note").textContent,active:document.activeElement?.textContent?.trim().slice(0,20),cls:document.querySelector("#fq-studio").className}));
    assert(pauseState.pressed==="true",name+": room pause did not engage "+JSON.stringify(pauseState));
    if(await page.locator("#fq-studio").getAttribute("data-engine")==="voxel"){
      assert(await page.evaluate(()=>document.querySelector("#fq-studio-art").fqVoxel.paused),name+": voxel room still running while paused");
      const frames=await page.evaluate(()=>document.querySelector("#fq-studio-art").dataset.frames);
      await page.waitForTimeout(900);
      assert(frames===await page.evaluate(()=>document.querySelector("#fq-studio-art").dataset.frames),name+": voxel kept rendering while paused");
    }
    await page.locator('[data-studio-mode="coffee"]').click();
    assert(await page.locator("[data-studio-pause]").getAttribute("aria-pressed")==="false",name+": an action should resume the room");

    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    assert(overflow<=1,name+": horizontal overflow "+overflow);
    assert(!errors.length,name+": runtime errors "+errors.join(" | "));
    console.log("DESIGN_SYSTEM_PASS="+JSON.stringify({name,arrows:copy.arrows.length}));
    await page.close();
  }
  // The mood follows the clock: night and day differ in ground colour.
  const grounds={};
  for(const part of ["night","day"]){
    const page=await browser.newPage({viewport:{width:1024,height:700}});
    await page.goto("http://127.0.0.1:4173/?daypart="+part,{waitUntil:"domcontentloaded"});
    grounds[part]=await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue("--c-ink").trim());
    await page.close();
  }
  assert(grounds.night&&grounds.day&&grounds.night!==grounds.day,"daypart grounds identical "+JSON.stringify(grounds));
  console.log("DAYPART_PASS="+JSON.stringify(grounds));
}finally{await browser.close()}
