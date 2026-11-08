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
    await page.addInitScript(()=>{try{sessionStorage.setItem("fiqri-intro-seen","yes")}catch{}}); // skip the opening titles (tested in design-system-smoke)
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

    // Audit #10, #11, #13: no sparkle glyphs; glass on at most two elements;
    // coloured glow (0 0 Npx halo) only on the showreel frame at rest.
    const dose=await page.evaluate(()=>{
      const all=[...document.querySelectorAll("body *")].filter(e=>{const r=e.getBoundingClientRect(),st=getComputedStyle(e);return r.width>0&&st.display!=="none"&&st.visibility!=="hidden"});
      const glass=all.filter(e=>getComputedStyle(e).backdropFilter!=="none").map(e=>e.className.toString().split(" ")[0]);
      const glow=all.filter(e=>/rgba?\([^)]*\) 0px 0px (\d{2,})px/.test(getComputedStyle(e).boxShadow)).map(e=>e.className.toString().split(" ")[0]);
      return {sparkles:(document.body.innerText.match(/✦/g)||[]).length,glass:[...new Set(glass)],glow:[...new Set(glow)]};
    });
    assert(dose.sparkles===0,name+": sparkle glyphs remain");
    assert(dose.glass.length<=2,name+": glassmorphism on "+dose.glass.length+" elements "+JSON.stringify(dose.glass));
    assert(dose.glow.filter(c=>!/cinema-frame/.test(c)).length===0,name+": coloured glow outside the showreel frame "+JSON.stringify(dose.glow));

    // Mini Fiqri cameo in Contact: loaded, and never on top of the text or links.
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const cameo=await page.evaluate(()=>{
      // measure the painted text/controls, not full-width block boxes
      const img=document.querySelector(".fq-cameo--contact img");
      const box=e=>{if(e===img||/whatsapp|linkedin/.test(e.className))return e.getBoundingClientRect();const r=document.createRange();r.selectNodeContents(e);return r.getBoundingClientRect()};
      const c=box(img),hit=[...document.querySelectorAll("#contact h2,#contact .section-lead,#contact .mail,#contact .whatsapp-contact,#contact .linkedin-contact")]
        .filter(e=>{const b=box(e);return Math.max(0,Math.min(c.right,b.right)-Math.max(c.left,b.left))*Math.max(0,Math.min(c.bottom,b.bottom)-Math.max(c.top,b.top))>40}).map(e=>e.className||e.tagName);
      return {loaded:img.complete&&img.naturalWidth>0,hit,fin:!document.querySelector(".footer-final-note img")};
    });
    assert(cameo.loaded&&cameo.fin,name+": cameo missing or footer voxel back "+JSON.stringify(cameo));
    assert(!cameo.hit.length,name+": cameo covers contact content "+JSON.stringify(cameo.hit));
    // He loops through his poses while Contact is on screen, and he is his own pause button.
    const poses=new Set();
    for(let i=0;i<45;i++){await page.waitForTimeout(220);poses.add(await page.evaluate(()=>document.querySelector(".fq-cameo--contact img").dataset.cameo))}
    assert(["wave","point","cool","dab","jump"].every(p=>poses.has(p)),name+": cameo loop missing poses "+JSON.stringify([...poses]));
    await page.locator(".fq-cameo--contact").click();
    const held=await page.evaluate(()=>document.querySelector(".fq-cameo--contact img").src);
    await page.waitForTimeout(1300);
    assert(held===await page.evaluate(()=>document.querySelector(".fq-cameo--contact img").src)&&await page.locator(".fq-cameo--contact").getAttribute("aria-pressed")==="true",name+": tapping the cameo does not pause him");
    await page.locator(".fq-cameo--contact").click();

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
    await page.waitForFunction(()=>document.querySelector(".montage-stream.is-current"),null,{timeout:20000});
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
    await page.waitForFunction(()=>!document.querySelector("dialog[open]")&&!document.body.classList.contains("modal-open"),null,{timeout:8000});
    await page.waitForTimeout(350); // let the dialog close transition finish

    // Editing room pause.
    await page.locator("#fq-studio").scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>["voxel","svg"].includes(document.querySelector("#fq-studio")?.dataset.engine),null,{timeout:20000});
    // On a slow CI machine the room is still settling when the engine flag
    // flips; wait until it has drawn and the Pause button stops moving.
    await page.waitForFunction(()=>{
      const art=document.querySelector("#fq-studio-art"),b=document.querySelector("[data-studio-pause]").getBoundingClientRect();
      const key=Math.round(b.x)+","+Math.round(b.y),w=window;
      const drawn=document.querySelector("#fq-studio").dataset.engine==="svg"||Number(art.dataset.frames||0)>2;
      if(w.__pauseKey===key&&drawn)return (w.__pauseSame=(w.__pauseSame||0)+1)>=6;
      w.__pauseKey=key;w.__pauseSame=0;return false;
    },null,{timeout:20000,polling:100});
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
  // Opening titles: first open of a session, gone by themselves in under 4 s,
  // not again on reload, skippable, absent with reduced motion, replayable.
  {
    const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:"no-preference"});
    await page.goto("http://127.0.0.1:4173/",{waitUntil:"domcontentloaded"});
    const shown=await page.evaluate(()=>({on:document.documentElement.classList.contains("fq-splash-on"),display:getComputedStyle(document.querySelector("#intro")).display}));
    assert(shown.on&&shown.display==="block","splash: opening titles did not show on first open "+JSON.stringify(shown));
    assert(await page.locator("#skip-intro").isVisible(),"splash: skip button missing");
    assert(await page.evaluate(()=>!!document.querySelector(".fq-clip--boring")),"splash: edit window missing");
    await page.waitForTimeout(4300);
    const after=await page.evaluate(()=>({on:document.documentElement.classList.contains("fq-splash-on"),display:getComputedStyle(document.querySelector("#intro")).display,overflow:document.body.style.overflow,tc:document.querySelector("#fq-splash-tc").textContent}));
    assert(!after.on&&after.display==="none"&&after.overflow==="","splash: titles did not clear themselves "+JSON.stringify(after));
    assert(after.tc!=="00:00:00:00","splash: timecode never ran");
    await page.reload({waitUntil:"domcontentloaded"});
    assert(!await page.evaluate(()=>document.documentElement.classList.contains("fq-splash-on")),"splash: shown again in the same session");
    await page.locator("#replay").click();
    assert(await page.evaluate(()=>document.documentElement.classList.contains("fq-splash-on")),"splash: Replay intro did not replay");
    await page.close();
    const skip=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
    await skip.goto("http://127.0.0.1:4173/",{waitUntil:"domcontentloaded"});
    await skip.locator("#skip-intro").tap();
    await skip.waitForTimeout(700);
    assert(!await skip.evaluate(()=>document.documentElement.classList.contains("fq-splash-on")),"splash: Skip did not open the site");
    await skip.close();
    const calm=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:"reduce"});
    await calm.goto("http://127.0.0.1:4173/",{waitUntil:"domcontentloaded"});
    assert(!await calm.evaluate(()=>document.documentElement.classList.contains("fq-splash-on")),"splash: shown despite reduced motion");
    // reduced motion: mini Fiqri stands still on his wave, nothing to pause
    await calm.locator("#contact").scrollIntoViewIfNeeded();await calm.waitForTimeout(1500);
    const still=await calm.evaluate(()=>{const b=document.querySelector(".fq-cameo--contact");return {pose:b.querySelector("img").dataset.cameo,disabled:b.disabled}});
    assert(still.pose==="wave"&&still.disabled,"reduced motion: cameo should be a still wave "+JSON.stringify(still));
    await calm.close();
    console.log("SPLASH_PASS");
  }
  // Share card + icons are referenced and served; noindex stays until the owner says so.
  {
    const page=await browser.newPage();
    await page.goto("http://127.0.0.1:4173/",{waitUntil:"domcontentloaded"});
    const meta=await page.evaluate(()=>({og:document.querySelector('meta[property="og:image"]')?.content,card:document.querySelector('meta[name="twitter:card"]')?.content,icons:[...document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]')].map(l=>l.getAttribute("href")),robots:document.querySelector('meta[name="robots"]')?.content}));
    assert(meta.og==="https://fiqriapriandi.art/assets/og-card.jpg"&&meta.card==="summary_large_image","share card meta missing "+JSON.stringify(meta));
    assert(meta.robots==="noindex, nofollow","robots meta changed without owner approval");
    for(const path of ["assets/og-card.jpg",...meta.icons]){
      const res=await page.request.get("http://127.0.0.1:4173/"+path);
      assert(res.ok(),"asset not served: "+path);
    }
    await page.close();
    console.log("BRAND_PASS");
  }
  // The mood follows the clock: night and day differ in ground colour.
  const grounds={};
  for(const part of ["night","day"]){
    const page=await browser.newPage({viewport:{width:1024,height:700}});
    await page.addInitScript(()=>{try{sessionStorage.setItem("fiqri-intro-seen","yes")}catch{}}); // skip the opening titles (tested in design-system-smoke)
    await page.goto("http://127.0.0.1:4173/?daypart="+part,{waitUntil:"domcontentloaded"});
    grounds[part]=await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue("--c-ink").trim());
    await page.close();
  }
  assert(grounds.night&&grounds.day&&grounds.night!==grounds.day,"daypart grounds identical "+JSON.stringify(grounds));
  console.log("DAYPART_PASS="+JSON.stringify(grounds));
}finally{await browser.close()}
