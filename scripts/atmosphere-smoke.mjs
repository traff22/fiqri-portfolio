import {chromium} from "playwright";
import fs from "node:fs";

/* A visual restraint regression test: no generated scene particles or
   blocking intro, and the actual editorial content remains visible. */
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
        heroGrain:css(".hero .hero-ambience").backgroundImage,
        portraitHalo:css(".portrait-halo").display,
        portraitChips:css(".portrait-skills").display,
        introHidden:$("#intro").hidden,
        heading:!!hero.querySelector("h1"),
        actionVisible:css(".hero .actions .button").visibility,
        frame:!!$("#cinema-wrap .showreel-shell"),
        footageVideo:!!$("#cinema-wrap .showreel-visual"),
        frameCard:css("#cinema-wrap .float-reel-card").display,
        chapterHeight:stage.getBoundingClientRect().height,
        viewportHeight:innerHeight,
        overflow:document.documentElement.scrollWidth-innerWidth
      };
    });
    check(result.oldParticles===0,name+": floating particle nodes still present");
    check(result.heroBlob==="none",name+": animated glow blob remains");
    check(result.portraitHalo==="none"&&result.portraitChips==="none",name+": redundant hero chrome remains");
    check(result.heroGrain.includes("data:image/svg+xml"),name+": static film texture missing");
    check(result.introHidden,name+": opening splash blocks the portfolio");
    check(result.heading&&result.actionVisible==="visible",name+": hero content lost");
    check(result.frame&&result.footageVideo,name+": video stage lost");
    check(result.frameCard==="none",name+": satellite film cards remain");
    check(result.overflow<=1,name+": horizontal overflow "+result.overflow);
    if(mobile)check(result.chapterHeight<=innerHeight*1.33,name+": sticky chapter is too tall");

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
