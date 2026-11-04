import {chromium} from "playwright";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const summary=[];
try{
 for(const [width,height,label] of [[1440,900,"desktop"],[390,844,"mobile"]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:"no-preference"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:4173",{waitUntil:"domcontentloaded"});
  await page.evaluate(()=>{document.getElementById("intro").hidden=true;document.body.classList.remove("intro-active")});
  for(const [selector,n] of [[".hero",22],["#cinema-wrap .cinema-stick",30],["#work",16],[".expertise",9]]){
   const x=await page.locator(selector).evaluate(root=>{
    const a=root.querySelector(":scope > .editorial-atmosphere");
    return a?{hidden:a.getAttribute("aria-hidden"),pe:getComputedStyle(a).pointerEvents,
     layers:a.querySelectorAll(".ed-plane").length,count:a.querySelectorAll(".ed-particle svg").length}:null;
   });
   if(!x||x.hidden!=="true"||x.pe!=="none"||x.layers!==3||x.count!==n)throw Error(label+" "+selector+" "+JSON.stringify(x));
   summary.push({label,selector,count:x.count});
  }
  await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));
  await page.waitForTimeout(180);
  const first=await page.locator(".hero .ed-plane--near").evaluate(e=>getComputedStyle(e).transform);
  await page.evaluate(()=>scrollTo({top:440,behavior:"instant"}));
  await page.waitForTimeout(180);
  const second=await page.locator(".hero .ed-plane--near").evaluate(e=>getComputedStyle(e).transform);
  if(first===second)throw Error(label+" depth did not respond to scroll");
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth);
  if(overflow>width+3)throw Error(label+" horizontal overflow "+overflow);
  await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));
  await page.locator(".hero").screenshot({path:"screenshots/"+label+"-atmosphere-hero.png"});
  await page.locator("#cinema-wrap .cinema-stick").scrollIntoViewIfNeeded();
  await page.locator("#cinema-wrap .cinema-stick").screenshot({path:"screenshots/"+label+"-atmosphere-chapter.png"});
  if(label==="desktop"){
   await page.locator("#work").scrollIntoViewIfNeeded();
   await page.locator("#work").screenshot({path:"screenshots/"+label+"-atmosphere-gallery.png"});
  }
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.waitForTimeout(120);
  const reduced=await page.locator(".hero .ed-plane--near").evaluate(el=>({
   transform:getComputedStyle(el).transform,
   animation:getComputedStyle(el.querySelector(".ed-particle")).animationName
  }));
  if(reduced.transform!=="none"||reduced.animation!=="none")throw Error(label+" reduced motion "+JSON.stringify(reduced));
  if(errors.length)throw Error(label+" browser errors "+errors.join(" | "));
  summary.push({label,scrollDepth:true,reducedMotion:true,noOverflow:true});
  await page.close();
 }
 console.log("ATMOSPHERE_SMOKE_REPORT="+JSON.stringify(summary));
}finally{await browser.close()}
