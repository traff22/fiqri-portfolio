import { chromium } from "playwright";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:"no-preference"});
 await page.addInitScript(()=>{try{sessionStorage.setItem("fiqri-intro-seen","yes")}catch{}}); // skip the opening titles (tested in design-system-smoke)
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.__ytQA={loads:[],seeks:[],pauses:0,mutes:0};
  class MockPlayer{
   constructor(root,config){
    this.root=root;this.config=config;this.duration=95;this.state=-1;
    setTimeout(()=>config.events.onReady({target:this}),25);
   }
   mute(){window.__ytQA.mutes++}
   setVolume(){}
   getDuration(){return this.duration}
   getPlayerState(){return this.state}
   loadVideoById({videoId}){
    window.__ytQA.loads.push(videoId);
    this.state=1;
    setTimeout(()=>this.config.events.onStateChange({data:1,target:this}),40);
   }
   seekTo(seconds){
    window.__ytQA.seeks.push(seconds);
    this.state=1;
    setTimeout(()=>this.config.events.onStateChange({data:1,target:this}),45);
   }
   pauseVideo(){this.state=2;window.__ytQA.pauses++}
   playVideo(){this.state=1;setTimeout(()=>this.config.events.onStateChange({data:1,target:this}),35)}
  }
  window.YT={Player:MockPlayer,PlayerState:{PLAYING:1,ENDED:0,PAUSED:2,BUFFERING:3}};
 });
 await page.goto("http://127.0.0.1:4173",{waitUntil:"domcontentloaded"});
 await page.evaluate(()=>{
  document.documentElement.classList.remove("fq-splash-on");
 });
 await page.locator("#cinema-wrap .showreel-shell").scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector(".montage-stream.is-current"),{timeout:9000});
 const first=await page.locator(".montage-title").textContent();
 if(first!=="Know More Bout Me (2024)")
  throw new Error("Chapter One must always start with Know More Bout Me: "+first);
 const classification=await page.locator('.work-card[data-project="know-more-about-me-2024"]').evaluate(el=>el.dataset.categories);
 if(classification.split(" ").includes("motion")||!classification.split(" ").includes("longform"))
  throw new Error("Know More Bout Me incorrectly classified: "+classification);
 // The blueprint follows the edit: the opening long-form film lights the editorial clip.
 const following=await page.evaluate(()=>({category:document.querySelector("#cinema-wrap").dataset.activeCategory,
  editorial:document.querySelector(".float-reel-card--two").classList.contains("is-source")}));
 if(following.category!=="longform"||!following.editorial)throw new Error("Blueprint does not follow the opening film: "+JSON.stringify(following));
 const firstSource=await page.evaluate(()=>window.__ytQA.loads[0]);
 if(firstSource!=="hEhRkIbH-Pg")throw new Error("Opening stream ID incorrect: "+firstSource);
 const stage=await page.locator(".showreel-montage").evaluate(el=>({
  sourceCount:Number(el.dataset.sourceCount),mode:el.dataset.previewMode,playback:el.dataset.playback
 }));
 if(stage.sourceCount!==13)throw Error("Expected 13 landscape-only YouTube videos, got "+stage.sourceCount);
 const allowed=await page.locator(".showreel-montage").getAttribute("data-source-ids");
 const excluded=["DkounxK31EU","E2D5KPuhug0","wvAc12hybog","9IurjSDUGdQ","XWBZalMYO-A"];
 const ids=(allowed||"").split(",");
 if(ids.length!==13||excluded.some(id=>ids.includes(id)))throw Error("Portrait/Reels leaked into video playlist: "+allowed);
 if(stage.mode!=="original-video-embed")throw Error("Still using fabricated photo montage");
 if(await page.locator(".showreel-montage .montage-clip").count())throw Error("Synthetic native photo videos remain");
 await page.waitForTimeout(1180);
 const timer=await page.locator(".montage-timestamp").textContent();
 if(timer.startsWith("00:00"))throw Error("Five-second segment clock did not advance: "+timer);
 const skip=page.locator(".montage-skip");
 await skip.click({force:true});
 await page.waitForFunction(prior=>document.querySelector(".montage-title")?.textContent!==prior,first,{timeout:8000});
 const second=await page.locator(".montage-title").textContent();
 const caption=await page.locator("#cinema-wrap .showreel-shell > .montage-overlay").boundingBox();
 const movie=await page.locator("#cinema-wrap .showreel-visual").boundingBox();
 if(caption.y < movie.y+movie.height-3)throw new Error("Own title overlaps YouTube player");
 const data=await page.evaluate(()=>structuredClone(window.__ytQA));
 // The fixed introduction starts at 00:00; random seeking begins with the next film.
 if(data.loads.length<2||data.seeks.length<1||data.mutes<2)throw Error("Player did not load and seek real videos: "+JSON.stringify(data));
 if(data.loads.some(v=>!/^[A-Za-z0-9_-]{11}$/.test(v)))throw Error("Invalid video ID in shuffle");
 if(data.loads.some(id=>excluded.includes(id)))throw Error("Shorts/Reels video loaded in landscape montage: "+data.loads.join(","));
 await page.waitForFunction(previous=>document.querySelector(".montage-title")?.textContent!==previous,second,{timeout:7400});
 const third=await page.locator(".montage-title").textContent();
 if(third===first)throw Error("Shuffle immediately repeated the same previous project");
 if(errors.length)throw Error("JS errors: "+errors.join("|"));
 await page.locator("#cinema-wrap").screenshot({path:"screenshots/chapter-original-video-montage.png"});
 console.log("MONTAGE_SMOKE_REPORT="+JSON.stringify({
  sources:stage.sourceCount,opening:first,classification,captionBelow:true,excludedReels:excluded.length,mode:stage.mode,playing:true,first,second,third,
  clock:timer,loads:data.loads,seeks:data.seeks,mutedCalls:data.mutes,
  clickSkip:true,autoNext:true,syntheticPhotoClips:false,jsErrors:errors
 }));
 await page.close();
}finally{await browser.close()}
