// Owner media slots: native reel clips (assets/reel/clips.json) and the colour
// grade before/after (assets/grades/grades.json). Uses synthetic fixtures in
// scripts/fixtures, served in place of the (empty) live manifests.
import {chromium} from "playwright";
import fs from "node:fs";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const reelFixture=fs.readFileSync("scripts/fixtures/reel/clips.json","utf8");
const gradeFixture=fs.readFileSync("scripts/fixtures/grades/grades.json","utf8");
const skipTitles=()=>{try{sessionStorage.setItem("fiqri-intro-seen","yes")}catch{}};
const ytMock=()=>{
  class P{constructor(r,c){this.c=c;this.s=-1;setTimeout(()=>c.events.onReady({target:this}),25)}
    mute(){}setVolume(){}getDuration(){return 95}getPlayerState(){return this.s}
    loadVideoById(){this.s=1;setTimeout(()=>this.c.events.onStateChange({data:1,target:this}),40)}
    seekTo(){this.s=1;setTimeout(()=>this.c.events.onStateChange({data:1,target:this}),45)}
    pauseVideo(){this.s=2}playVideo(){this.s=1;setTimeout(()=>this.c.events.onStateChange({data:1,target:this}),35)}}
  window.YT={Player:P,PlayerState:{PLAYING:1,ENDED:0,PAUSED:2,BUFFERING:3}};
};
try{
  // 1. Native clips replace the YouTube montage entirely.
  {
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    let youtubeRequested=false;
    await page.route("**/youtube.com/**",r=>{youtubeRequested=true;r.abort()});
    await page.route("**/assets/reel/clips.json*",r=>r.fulfill({status:200,contentType:"application/json",body:reelFixture}));
    await page.addInitScript(skipTitles);
    await page.goto("http://127.0.0.1:4173/",{waitUntil:"domcontentloaded"});
    await page.locator("#cinema-wrap .showreel-shell").scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector(".showreel-montage")?.dataset.playback==="playing",null,{timeout:15000});
    const s1=await page.evaluate(()=>({mode:document.querySelector(".showreel-montage").dataset.previewMode,
      title:document.querySelector(".montage-title").textContent,
      iframes:document.querySelectorAll("#cinema-wrap iframe").length,
      category:document.querySelector("#cinema-wrap").dataset.activeCategory,
      playing:[...document.querySelectorAll(".montage-native")].some(v=>!v.paused&&v.currentTime>0)}));
    assert(s1.mode==="native-clips","native mode not active "+JSON.stringify(s1));
    assert(s1.title==="Test clip one","opening clip should play first "+JSON.stringify(s1));
    assert(s1.iframes===0&&!youtubeRequested,"YouTube still loaded in native mode");
    assert(s1.category==="longform","fq:shot category not announced "+JSON.stringify(s1));
    assert(s1.playing,"native clip is not playing");
    await page.locator(".montage-skip").click();
    await page.waitForFunction(()=>document.querySelector(".montage-title").textContent!=="Test clip one",null,{timeout:8000});
    await page.locator(".montage-pause").click();
    const t1=await page.evaluate(()=>[...document.querySelectorAll(".montage-native")].every(v=>v.paused));
    const clockA=await page.locator(".montage-timestamp").textContent();
    await page.waitForTimeout(1300);
    assert(t1&&clockA===await page.locator(".montage-timestamp").textContent(),"native reel kept running while paused");
    await page.locator(".montage-pause").click();
    await page.waitForTimeout(400);
    assert(await page.evaluate(()=>[...document.querySelectorAll(".montage-native")].some(v=>!v.paused)),"native reel did not resume");
    assert(!errors.length,"runtime errors "+errors.join(" | "));
    console.log("NATIVE_REEL_PASS="+JSON.stringify({first:s1.title}));
    await page.close();
  }
  // 2. If every listed clip fails, Chapter One falls back to the YouTube montage.
  {
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    await page.route("**/assets/reel/clips.json*",r=>r.fulfill({status:200,contentType:"application/json",
      body:JSON.stringify([{title:"Missing",category:"event",webm:"assets/reel/nope.webm",src:"assets/reel/nope.mp4"}])}));
    await page.addInitScript(skipTitles);await page.addInitScript(ytMock);
    await page.goto("http://127.0.0.1:4173/",{waitUntil:"domcontentloaded"});
    await page.locator("#cinema-wrap .showreel-shell").scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector(".montage-stream.is-current iframe, .montage-stream.is-current [id^=montage-real]"),null,{timeout:15000});
    const mode=await page.evaluate(()=>document.querySelector(".showreel-montage").dataset.previewMode);
    assert(mode==="original-video-embed","fallback did not hand back to YouTube ("+mode+")");
    console.log("NATIVE_FALLBACK_PASS");
    await page.close();
  }
  // 3. Colour grade slider: only for listed projects, keyboard operable.
  {
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    await page.route("**/assets/grades/grades.json*",r=>r.fulfill({status:200,contentType:"application/json",body:gradeFixture}));
    await page.addInitScript(skipTitles);
    await page.goto("http://127.0.0.1:4173/",{waitUntil:"domcontentloaded"});
    await page.locator('#work .work-card[data-project="cinematic-mancing"] .work-trigger').click({force:true});
    await page.waitForFunction(()=>!document.getElementById("grade-compare").hidden,null,{timeout:5000});
    const shown=await page.evaluate(()=>{const f=document.getElementById("grade-compare");return {labels:[...f.querySelectorAll(".grade-compare__label")].map(l=>l.textContent),before:f.querySelector(".grade-compare__before").getAttribute("src"),alt:f.querySelector(".grade-compare__after").alt}});
    assert(shown.labels.join()==="Log,Graded"&&/raw\.jpg$/.test(shown.before)&&/Cinematic Mancing/.test(shown.alt),"grade compare content wrong "+JSON.stringify(shown));
    await page.waitForFunction(()=>document.querySelector(".grade-compare__before").complete&&document.querySelector(".grade-compare__before").naturalWidth>0);
    await page.locator(".grade-compare__range").focus();
    for(let i=0;i<10;i++)await page.keyboard.press("ArrowRight");
    const pos=await page.evaluate(()=>document.querySelector(".grade-compare__frame").style.getPropertyValue("--pos"));
    assert(pos==="60%","keyboard did not move the divider ("+pos+")");
    await page.screenshot({path:"screenshots/grade-compare.png"});
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await page.locator('#work .work-card[data-project="logistics-nine"] .work-trigger').click({force:true});
    await page.waitForTimeout(500);
    assert(await page.evaluate(()=>document.getElementById("grade-compare").hidden),"grade compare shown for a project without frames");
    console.log("GRADE_COMPARE_PASS");
    await page.close();
  }
}finally{await browser.close()}
