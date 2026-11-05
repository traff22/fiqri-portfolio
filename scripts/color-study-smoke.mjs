import {chromium} from "playwright";
import fs from "node:fs";

const base="http://127.0.0.1:4173/";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
fs.mkdirSync("screenshots",{recursive:true});
const assert=(yes,why)=>{if(!yes)throw new Error(why)};
const color=(style)=>style.replace(/ /g,"").toLowerCase();
const read=async(page,selector,property)=>page.locator(selector).first().evaluate((el,prop)=>getComputedStyle(el).getPropertyValue(prop).trim(),property);
const report=[];
try{
  for(const {name,width,height,mobile} of [
    {name:"desktop",width:1440,height:900,mobile:false},
    {name:"mobile",width:390,height:844,mobile:true},
    {name:"small-mobile",width:320,height:740,mobile:true}
  ]){
    const context=await browser.newContext({
      viewport:{width,height},isMobile:mobile,hasTouch:mobile,
      reducedMotion:"reduce",deviceScaleFactor:1
    });
    const page=await context.newPage();
    await page.addInitScript(()=>{try{sessionStorage.setItem("fiqri-intro-seen","yes")}catch{}});
    await page.goto(base,{waitUntil:"domcontentloaded"});
    await page.evaluate(()=>document.fonts?.ready);
    const result=await page.evaluate(()=>{
      const css=(selector)=>getComputedStyle(document.querySelector(selector));
      const root=css("html"),hero=css(".hero h1 em"),
            button=css(".hero .button"),contact=css(".contact"),
            active=css('#work .filter[aria-pressed="true"]'),
            gallery=css("#work");
      const heroTitle=document.querySelector(".hero h1").getBoundingClientRect();
      const doc=document.documentElement;
      return {
        accent:root.getPropertyValue("--fq-copper").trim(),
        base:root.getPropertyValue("--fq-ink").trim(),
        heroAccent:hero.color,
        heroFont:hero.fontFamily,
        buttonBackground:button.backgroundColor,
        buttonRadius:button.borderRadius,
        contactBackground:contact.backgroundColor,
        filterBackground:active.backgroundColor,
        filterBottom:active.borderBottomColor,
        filterBottomWidth:active.borderBottomWidth,
        galleryBackground:gallery.backgroundColor,
        title:{x:heroTitle.x,right:heroTitle.right},
        overflow:doc.scrollWidth-doc.clientWidth,
        bodyOverflow:document.body.scrollWidth-doc.clientWidth
      };
    });
    assert(result.accent==="#dda582",name+": palette token not applied");
    assert(color(result.heroAccent)==="rgb(235,187,156)",name+": hero signature color missing");
    assert(color(result.buttonBackground)==="rgb(221,165,130)",name+": CTA not emphasized");
    assert(result.buttonRadius==="10px",name+": CTA still generic pill");
    assert(color(result.contactBackground)==="rgb(236,231,220)",name+": paper contrast section missing");
    assert(result.filterBottomWidth==="2px",name+": selected filter lacks underline");
    assert(color(result.filterBottom)==="rgb(221,165,130)",name+": selected filter lacks signal color");
    assert(result.overflow<=1,name+": document horizontal overflow "+result.overflow);
    assert(result.bodyOverflow<=1,name+": body horizontal overflow "+result.bodyOverflow);
    if(mobile){
      const menu=page.locator("#mobile-menu");
      await menu.click();
      assert(await page.locator("#navlinks").evaluate(el=>el.classList.contains("open")),name+": navigation menu failed");
      await menu.click();
      assert(!await page.locator("#navlinks").evaluate(el=>el.classList.contains("open")),name+": navigation menu would not close");
    }
    await page.screenshot({path:"screenshots/color-study-"+name+".png",fullPage:true,animations:"disabled"});
    report.push({name,...result});
    await context.close();
  }
  console.log("COLOR_STUDY_REPORT="+JSON.stringify(report));
}finally{
  await browser.close();
}
