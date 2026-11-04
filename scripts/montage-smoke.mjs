import { chromium } from "playwright";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:"no-preference"});
 await page.addInitScript(()=>{
  window.__montageTest={loads:[],seeks:[],mutes:0,pauses:0};
  class MockPlayer{
   constructor(el,opts){
    this.config=opts;this.state=0;
    window.setTimeout(()=>opts.events.onReady({target:this}),20);
   }
   mute(){window.__montageTest.mutes++}
   setVolume(){}
   getDuration(){return 108}
   getPlayerState(){return this.state}
   loadVideoById({videoId}){
    window.__montageTest.loads.push(videoId);
    this.state=1;
    window.setTimeout(()=>this.config.events.onStateChange({data:1,target:this}),55);
   }
   seekTo(sec){
    window.__montageTest.seeks.push(sec);
    this.state=1;
    window.setTimeout(()=>this.config.events.onStateChange({data:1,target:this}),55);
   }
   pauseVideo(){this.state=2;window.__montageTest.pauses++}
  }
  window.YT={Player:MockPlayer,PlayerState:{PLAYING:1}};
 });
 await page.goto("http://127.0.0.1:4173",{waitUntil:"domcontentloaded"});
 await page.evaluate(()=>{
  const splash=document.querySelector("#intro");
  if(splash)splash.hidden=true;
  document.body.classList.remove("intro-active");
 });
 await page.locator("#cinema-wrap").scrollIntoViewIfNeeded();
 await page.waitForTimeout(1500);
 const starting=await page.locator(".montage-credit__name").textContent();
 const activePlayers=await page.locator(".montage-youtube-panel.is-current").count();
 const first=await page.evaluate(()=>structuredClone(window.__montageTest));
 if(!first.loads.length||!first.seeks.length||activePlayers!==1)throw new Error("Mock YouTube player did not start a random muted excerpt: "+JSON.stringify(first));
 const screenshotPath="screenshots/chapter-montage-youtube-mock.png";
 await page.locator("#cinema-wrap").screenshot({path:screenshotPath});
 await page.locator("#cinema-wrap .montage-skip").click();
 await page.waitForTimeout(300);
 const changed=await page.locator(".montage-credit__name").textContent();
 const second=await page.evaluate(()=>structuredClone(window.__montageTest));
 if(starting===changed)throw new Error("Click did not skip to a different portfolio project");
 if(second.loads.length<first.loads.length+1)throw new Error("Click failed to request the next YouTube video");
 if(second.seeks.some(x=>x<8||x>101))throw new Error("Random seek outside expected video bounds");
 if(second.mutes<2)throw new Error("Video playback not kept muted");
 await page.evaluate(()=>document.hidden);
 console.log("MONTAGE_SMOKE_REPORT="+JSON.stringify({first:starting,next:changed,videoLoads:second.loads,randomStartSeconds:second.seeks,mutedCalls:second.mutes,activePlayers,clickSkip:true}));
 await page.close();
}finally{await browser.close()}
