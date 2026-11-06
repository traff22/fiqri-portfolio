import {chromium} from "playwright";
import fs from "node:fs";

/* Verify the luminous motion direction: real optical depth, no particles,
   one desktop film still, visible content and safe mobile dimensions. */
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const report=[];
fs.mkdirSync("screenshots",{recursive:true});
const check=(ok,message)=>{if(!ok)throw new Error(message)};
try{
  for(const {name,width,height,mobile} of [
    {name:"desktop",width:1440,height:900,mobile:false},
    {name:"mobile",width:390,height:844,mobile:true},
    {name:"compact-mobile",width:320,height:740,mobile:true}
  ]){
    const context=await browser.newContext({
      viewport:{width,height},isMobile:mobile,hasTouch:mobile,
      reducedMotion:"no-preference",deviceScaleFactor:1
    });
    const page=await context.newPage();
    await page.addInitScript(()=>{try{sessionStorage.setItem("fiqri-intro-seen","yes")}catch{}}); // skip the opening titles (tested in design-system-smoke)
    const errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto("http://127.0.0.1:4173/",{waitUntil:"domcontentloaded"});
    await page.evaluate(()=>document.fonts?.ready);
    const result=await page.evaluate(()=>{
      const $=(q)=>document.querySelector(q);
      const css=(q)=>getComputedStyle($(q));
      const stage=$("#cinema-wrap");
      const hero=$(".hero");
      return {
        oldParticles:document.querySelectorAll(".editorial-atmosphere,.ed-particle").length,
        heroBlob:css(".hero-blob").display,
        ambientLight:getComputedStyle($(".hero .hero-ambience"),"::before").backgroundImage,
        portraitHalo:css(".portrait-halo").display,
        portraitChips:css(".portrait-skills").display,
        introHidden:$("#intro").hidden,
        heading:!!hero.querySelector("h1"),
        actionVisible:css(".hero .actions .button").visibility,
        frame:!!$("#cinema-wrap .showreel-shell"),
        footageVideo:!!$("#cinema-wrap .showreel-visual"),
        sideCard:css("#cinema-wrap .float-reel-card--two").display,
        otherCards:[css("#cinema-wrap .float-reel-card--one").display,css("#cinema-wrap .float-reel-card--three").display],
        chapterHeight:stage.getBoundingClientRect().height,
        viewportHeight:innerHeight,
        overflow:document.documentElement.scrollWidth-innerWidth
      };
    });
    check(result.oldParticles===0,name+": floating particle nodes still present");
    check(result.heroBlob==="none",name+": animated glow blob remains");
    check(result.portraitHalo==="none"&&result.portraitChips==="none",name+": redundant hero chrome remains");
    check(result.ambientLight.includes("radial-gradient"),name+": luminous film-light backdrop missing");
    check(result.introHidden,name+": opening splash blocks the portfolio");
    check(result.heading&&result.actionVisible==="visible",name+": hero content lost");
    check(result.frame&&result.footageVideo,name+": video stage lost");
    check(result.otherCards[0]!=="none" && (mobile?result.otherCards[1]==="none":result.otherCards[1]!=="none"),name+": thumbnail responsiveness incorrect");
    check(result.sideCard!=="none",name+": editorial project thumbnail is hidden");
    check(result.overflow<=1,name+": horizontal overflow "+result.overflow);
    if(mobile)check(result.chapterHeight<=result.viewportHeight*1.33,name+": sticky chapter is too tall");

    const initial=await page.locator(".hero").evaluate(el=>el.style.getPropertyValue("--ek-ambient-y"));
    await page.evaluate(()=>scrollTo({top:Math.min(420,document.documentElement.scrollHeight-innerHeight),behavior:"instant"}));
    await page.waitForTimeout(230);
    const scrolled=await page.locator(".hero").evaluate(el=>el.style.getPropertyValue("--ek-ambient-y"));
    check(Boolean(scrolled)&&scrolled!==initial,name+": hero ambient depth did not respond to scroll");

    await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));
    await page.waitForTimeout(120);

    await page.locator(".hero").screenshot({
      path:"screenshots/restraint-"+name+"-hero.png",animations:"disabled"
    });
    await page.locator("#cinema-wrap .cinema-stick").scrollIntoViewIfNeeded();
    await page.locator("#cinema-wrap .cinema-stick").screenshot({
      path:"screenshots/restraint-"+name+"-chapter.png",animations:"disabled"
    });
    await page.locator("#work").scrollIntoViewIfNeeded();
    await page.locator("#work").screenshot({
      path:"screenshots/restraint-"+name+"-gallery.png",animations:"disabled"
    });
    check(errors.length===0,name+": page errors: "+errors.join(" | "));
    report.push({name,...result});
    await context.close();
  }
  console.log("RESTRAINT_SMOKE_REPORT="+JSON.stringify(report));
}finally{
  await browser.close();
}
