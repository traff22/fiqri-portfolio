import {chromium} from "playwright";
import fs from "node:fs";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
fs.mkdirSync("screenshots",{recursive:true});

try{
  for(const [name,width,height] of [["desktop",1440,900],["mobile",390,844],["small-mobile",320,740]]){
    const page=await browser.newPage({viewport:{width,height},reducedMotion:"no-preference"});
    await page.addInitScript(()=>{try{sessionStorage.setItem("fiqri-intro-seen","yes")}catch{}}); // skip the opening titles (tested in design-system-smoke)
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    await page.goto("http://127.0.0.1:4173/",{waitUntil:"domcontentloaded"});
    await page.locator("#about").scrollIntoViewIfNeeded();
    const studio=page.locator("#fq-studio");
    await page.waitForFunction(()=>document.querySelector("#fq-studio")?.dataset.engine==="voxel",null,{timeout:20000});
    const art=page.locator("#fq-studio-art");
    assert(await art.locator("canvas.fq-voxel__canvas").count()===1,name+": 3D voxel canvas missing");
    const room=await art.boundingBox();
    assert(room&&room.width>=280&&room.height>=200,name+": room collapsed or clipped");
    // No card: the room floats in the section.
    const card=await studio.evaluate(el=>{const st=getComputedStyle(el);return {border:st.borderTopWidth,bg:st.backgroundColor,shadow:st.boxShadow}});
    assert(card.border==="0px"&&card.bg==="rgba(0, 0, 0, 0)"&&card.shadow==="none",name+": studio is still drawn as a card "+JSON.stringify(card));
    // The WebGL scene really renders (sample the frame right after a render).
    const pixels=await page.evaluate(()=>{
      const host=document.querySelector("#fq-studio-art");host.fqVoxel.advance(.05);
      const c=host.querySelector("canvas"),t=document.createElement("canvas");t.width=64;t.height=48;
      const g=t.getContext("2d");g.drawImage(c,0,0,64,48);
      const d=g.getImageData(0,0,64,48).data,seen=new Set();let opaque=0;
      for(let i=0;i<d.length;i+=4){if(d[i+3]>200){opaque++;seen.add((d[i]>>4)+","+(d[i+1]>>4)+","+(d[i+2]>>4))}}
      return {opaque,colours:seen.size};
    });
    assert(pixels.opaque>600&&pixels.colours>12,name+": voxel room did not render "+JSON.stringify(pixels));
    // It lives on its own: after the first long edit, mini Fiqri starts a render.
    await page.evaluate(()=>document.querySelector("#fq-studio-art").fqVoxel.advance(9.6));
    assert(await studio.getAttribute("data-state")==="render",name+": autonomous routine did not move on to rendering");
    assert(await page.locator("#fq-studio-note").getAttribute("aria-live")==="off",name+": autonomous changes must not be announced");
    // Visitor controls (touch + keyboard) trigger the same actions.
    await page.locator('[data-studio-mode="coffee"]').click();
    assert(await studio.getAttribute("data-mode")==="coffee",name+": coffee mode broken");
    assert((await page.locator("#fq-studio-note").innerText()).includes("Coffee"),name+": coffee feedback absent");
    assert(await page.locator("#fq-studio-note").getAttribute("aria-live")==="polite",name+": visitor action not announced");
    await page.evaluate(()=>document.querySelector("#fq-studio-art").fqVoxel.advance(7.5));
    await page.locator('[data-studio-mode="render"]').click();
    assert(await studio.getAttribute("data-mode")==="render",name+": render mode broken");
    assert((await page.locator("#fq-studio-note").innerText()).includes("Rendering"),name+": render message absent");
    await page.locator('[data-studio-mode="wave"]').focus();
    await page.keyboard.press("Enter");
    assert((await page.locator("#fq-studio-note").innerText()).includes("hey there"),name+": wave reaction missing");
    await page.evaluate(()=>document.querySelector("#fq-studio-art").fqVoxel.advance(4));
    await page.locator('[data-studio-mode="edit"]').click();
    assert(await studio.getAttribute("data-mode")==="edit",name+": edit mode cannot restore");
    await studio.screenshot({path:"screenshots/creator-studio-"+name+".png"});

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
  // Without WebGL the first-party SVG room is used, hotspots still work.
  {
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    await page.addInitScript(()=>{try{sessionStorage.setItem("fiqri-intro-seen","yes")}catch{}}); // skip the opening titles (tested in design-system-smoke)
    await page.addInitScript(()=>{
      const original=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(type,...rest){return /webgl/.test(type)?null:original.call(this,type,...rest)};
    });
    await page.goto("http://127.0.0.1:4173/",{waitUntil:"domcontentloaded"});
    await page.locator("#about").scrollIntoViewIfNeeded();
    await page.locator("#fq-studio-art svg").waitFor({timeout:10000});
    const svg=page.locator("#fq-studio-art svg");
    assert(await svg.getAttribute("viewBox")==="0 0 920 560","fallback: SVG room missing");
    assert(await page.locator("#fq-studio").getAttribute("data-engine")==="svg","fallback: engine flag wrong");
    await svg.locator('[data-studio-object="render"]').focus();
    await page.keyboard.press("Enter");
    assert(await page.locator("#fq-studio").getAttribute("data-mode")==="render","fallback: keyboard monitor hotspot broken");
    await page.locator('[data-studio-mode="coffee"]').click();
    assert(await page.locator("#fq-studio").getAttribute("data-mode")==="coffee","fallback: coffee button broken");
    console.log("CREATORS_LAB_FALLBACK_PASS");
    await page.close();
  }
}finally{await browser.close()}
