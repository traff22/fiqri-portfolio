import {chromium} from "playwright";
import fs from "node:fs";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
fs.mkdirSync("screenshots",{recursive:true});

try{
  for(const [name,width,height] of [["desktop",1440,900],["mobile",390,844],["small-mobile",320,740]]){
    const page=await browser.newPage({viewport:{width,height},reducedMotion:"no-preference"});
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    await page.goto("http://127.0.0.1:4173/",{waitUntil:"domcontentloaded"});
    await page.locator("#fq-studio-art svg").waitFor({timeout:10000});
    const svg=page.locator("#fq-studio-art svg");
    assert(await svg.getAttribute("viewBox")==="0 0 920 560",name+": rebuilt wide room missing");
    assert(await svg.locator(".fq-workspace__avatar").count()===1,name+": mini Fiqri missing");
    assert(await svg.locator(".fq-render-progress").count()===1,name+": visible workstation UI missing");
    assert(await svg.locator('[data-studio-object]').count()===4,name+": interactive room objects missing");

    await page.locator("#about").scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    const studio=page.locator("#fq-studio");
    const room=await studio.boundingBox();
    assert(room&&room.width>=280,name+": room collapsed or clipped");
    await page.locator('[data-studio-mode="render"]').click();
    assert(await studio.getAttribute("data-mode")==="render",name+": render mode broken");
    assert((await page.locator("#fq-studio-note").innerText()).includes("Rendering"),name+": render message absent");
    await page.locator('[data-studio-mode="coffee"]').click();
    assert(await studio.getAttribute("data-mode")==="coffee",name+": coffee mode broken");
    assert((await page.locator("#fq-studio-note").innerText()).includes("Coffee"),name+": coffee feedback absent");
    await page.locator('[data-studio-mode="edit"]').click();
    assert(await studio.getAttribute("data-mode")==="edit",name+": edit mode cannot restore");
    // Object hotspots provide direct keyboard interaction, not merely decorations.
    await svg.locator('[data-studio-object="render"]').focus();
    await page.keyboard.press("Enter");
    assert(await studio.getAttribute("data-mode")==="render",name+": keyboard monitor hotspot broken");
    await svg.locator('[data-studio-object="coffee"]').focus();
    await page.keyboard.press("Space");
    assert(await studio.getAttribute("data-mode")==="coffee",name+": keyboard mug hotspot broken");
    await svg.locator('[data-studio-object="avatar"]').focus();
    await page.keyboard.press("Enter");
    assert(await studio.evaluate(el=>el.classList.contains("is-waving")),name+": avatar reaction missing");
    await studio.screenshot({path:"screenshots/creator-studio-"+name+".png",animations:"disabled"});

    const frame=page.locator("#cinema-wrap");
    const blueprint=page.locator(".fq-blueprint");
    await frame.scrollIntoViewIfNeeded();
    await page.waitForTimeout(130);
    const drawn=await blueprint.evaluate(el=>{
      const st=getComputedStyle(el);
      return {width:el.getBoundingClientRect().width,background:st.backgroundColor,border:st.borderTopWidth,pointer:st.pointerEvents};
    });
    assert(drawn.width>=width*.9,name+": blueprint no longer spans full frame");
    assert(drawn.background==="rgba(0, 0, 0, 0)"&&drawn.border==="0px"&&drawn.pointer==="none",
      name+": blueprint regressed into a boxed overlay");
    assert(await frame.locator(".fq-blueprint__schematic").count()===1,name+": frame-wide annotation missing");
    const thumbs=await frame.locator(".float-reel-card").evaluateAll(els=>els.filter(e=>getComputedStyle(e).display!=="none").length);
    assert(thumbs===(width>=1100?3:2),name+": artwork thumbnail composition incorrect ("+thumbs+")");
    const start=await frame.evaluate(el=>el.offsetTop);
    const span=await frame.evaluate(el=>Math.max(1,el.offsetHeight-innerHeight));
    await page.evaluate(n=>window.scrollTo({top:n,behavior:"instant"}),start+span*.87);
    await page.waitForTimeout(250);
    assert(await blueprint.getAttribute("data-phase")==="deliver",name+": scroll blueprint phase failed");
    await frame.screenshot({path:"screenshots/creator-frame-"+name+".png",animations:"disabled"});

    // The portrait spotlight stays hidden until pointer hover and flips on click.
    await page.locator(".hero").scrollIntoViewIfNeeded();
    const front=page.locator(".portrait-card__face--front");
    assert(await front.evaluate(el=>getComputedStyle(el,"::after").backgroundImage.includes("radial-gradient")),
      name+": photo spotlight missing");
    assert(await page.locator(".portrait-card__flip-button").count()===1,name+": hero Easter egg removed");
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    assert(overflow<=1,name+": horizontal overflow "+overflow);
    assert(!errors.length,name+": runtime errors "+errors.join(" | "));
    console.log("CREATORS_LAB_V2_PASS="+JSON.stringify({name,roomWidth:Math.round(room.width),thumbs,phase:"deliver",overflow}));
    await page.close();
  }
}finally{await browser.close()}
