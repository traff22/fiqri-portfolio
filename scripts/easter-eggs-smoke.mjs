import { chromium } from "playwright";

const origin="http://127.0.0.1:4173/";
const assert=(condition,why)=>{if(!condition)throw new Error(why)};
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});

try{
  for(const [device,viewport] of [
    ["desktop",{width:1440,height:900}],
    ["mobile",{width:390,height:844}]
  ]){
    const context=await browser.newContext({
      viewport, hasTouch:device==="mobile",isMobile:device==="mobile",
      reducedMotion:"reduce"
    });
    const page=await context.newPage();
    page.on("pageerror",err=>{throw err});
    await page.addInitScript(()=>{try{sessionStorage.setItem("fiqri-intro-seen","yes")}catch{}});
    await page.goto(origin,{waitUntil:"domcontentloaded"});
    await page.waitForSelector(".topbar .logo");

    // Three consecutive activations reveal the otherwise-hidden director's note.
    const logo=page.locator(".topbar .logo");
    for(let i=0;i<3;i++)await logo.click();
    assert(await page.locator("#directors-cut").evaluate(e=>e.open),device+": logo secret did not open");
    assert(await page.locator("#directors-cut-title").innerText()==="Director's Cut.",device+": missing secret heading");
    await page.locator("[data-directors-close]").click();
    assert(!await page.locator("#directors-cut").evaluate(e=>e.open),device+": dialog did not close");

    // Editor notes appear without obstructing ordinary clicks.
    const card=page.locator('.work-card[data-project="cinematic-mancing"]');
    const trigger=card.locator(".work-trigger");
    if(device==="desktop"){
      await card.hover();
      await page.waitForTimeout(1375);
      assert(await card.evaluate(e=>e.classList.contains("is-easter-peeking")), "Desktop hover note did not appear");
      await trigger.click();
      assert(await page.locator("#video-dialog").evaluate(e=>e.open),"Ordinary project click was blocked");
      await page.locator("#video-dialog [data-close-dialog]").click();
    }else{
      await trigger.scrollIntoViewIfNeeded();
      await trigger.evaluate(el=>el.dispatchEvent(new PointerEvent("pointerdown",{
        bubbles:true,pointerType:"touch",button:0,clientX:80,clientY:80
      })));
      await page.waitForTimeout(850);
      assert(await card.evaluate(e=>e.classList.contains("is-easter-peeking")), "Mobile long-press note did not appear");
      await trigger.evaluate(el=>el.dispatchEvent(new PointerEvent("pointerup",{
        bubbles:true,pointerType:"touch",button:0,clientX:80,clientY:80
      })));
      await trigger.evaluate(el=>el.click());
      assert(!await page.locator("#video-dialog").evaluate(e=>e.open), "Long press wrongly opened the video");
    }

    await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"}));
    await page.waitForTimeout(1000);
    assert(await page.locator("#footer-final-note").evaluate(e=>e.classList.contains("is-visible")),
      device+": last frame did not reveal");

    const overflow=await page.evaluate(()=>({
      scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth
    }));
    assert(overflow.scrollWidth<=overflow.clientWidth+1,device+": horizontal overflow "+JSON.stringify(overflow));
    console.log("Easter eggs passed:",device,overflow);
    await context.close();
  }
}finally{
  await browser.close();
}
