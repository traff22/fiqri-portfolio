import { chromium } from "playwright";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:"no-preference"});
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:4173",{waitUntil:"domcontentloaded"});
 await page.evaluate(()=>{
  const intro=document.getElementById("intro");
  if(intro)intro.hidden=true;
  document.body.classList.remove("intro-active");
 });
 await page.locator("#cinema-wrap .showreel-shell").scrollIntoViewIfNeeded();
 await page.locator(".showreel-montage video.montage-clip.is-current").waitFor({timeout:10000});
 const first=await page.locator(".showreel-montage .montage-title").textContent();
 await page.waitForTimeout(1150);
 const progress=await page.locator(".montage-timestamp").textContent();
 const firstVideo=await page.locator(".montage-clip.is-current").evaluate(v=>({
  currentTime:v.currentTime,paused:v.paused,muted:v.muted,readyState:v.readyState,
  src:v.currentSrc.split("/").at(-1)
 }));
 if(firstVideo.paused||!firstVideo.muted||firstVideo.readyState<2)throw Error("Native preview was not running silently: "+JSON.stringify(firstVideo));
 if(progress.startsWith("00:00"))throw Error("5-second timecode did not advance: "+progress);
 if(await page.locator("#cinema-wrap iframe").count())throw Error("A YouTube iframe is still inside Chapter One");
 const skip=page.locator(".montage-skip");
 await skip.click({force:true});
 await page.waitForFunction(prev=>document.querySelector(".montage-title")?.textContent!==prev,first,{timeout:6000});
 const second=await page.locator(".montage-title").textContent();
 const after=await page.locator(".montage-clip.is-current").evaluate(v=>({paused:v.paused,muted:v.muted,src:v.currentSrc.split("/").at(-1)}));
 if(after.paused||!after.muted||after.src===firstVideo.src)throw Error("Skip failed to switch to a different native video: "+JSON.stringify(after));
 if(errors.length)throw Error("Browser JS error: "+errors.join(" | "));
 await page.locator("#cinema-wrap").screenshot({path:"screenshots/chapter-native-clean.png"});
 console.log("MONTAGE_SMOKE_REPORT="+JSON.stringify({first,second,timecode:progress,playing:true,muted:true,withoutYoutube:true,clip1:firstVideo.src,clip2:after.src,skip:true,errors}));
 await page.close();
}finally{await browser.close()}
