// Section cuts: one between every chapter, filled with real work frames, the
// strip runs with scroll (and stands still with reduced motion), covers no
// content, and adds no horizontal scroll.
import {chromium} from "playwright";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
try{
  for(const [name,w,h,motion] of [["desktop",1440,900,"no-preference"],["mobile",390,844,"no-preference"],["compact",320,740,"no-preference"],["reduced",1440,900,"reduce"]]){
    const page=await browser.newPage({viewport:{width:w,height:h},reducedMotion:motion});
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    await page.route("**/i.ytimg.com/**",r=>r.abort());
    await page.route("**/youtube.com/**",r=>r.abort());
    await page.addInitScript(()=>{try{sessionStorage.setItem("fiqri-intro-seen","yes")}catch{}});
    await page.goto("http://127.0.0.1:4173/",{waitUntil:"load"});
    const res=await page.evaluate(async()=>{
      const wait=ms=>new Promise(r=>setTimeout(r,ms)),out=[];
      for(const c of document.querySelectorAll(".fq-cut")){
        const top=c.getBoundingClientRect().top+scrollY;
        const x=()=>parseFloat(getComputedStyle(c).getPropertyValue("--x"));
        const at=async y=>{scrollTo({top:y,behavior:"instant"});await wait(150);for(let i=0;i<20&&isNaN(x());i++)await wait(100);return x()};
        const mid=await at(top-innerHeight/2+c.offsetHeight/2),late=await at(top-innerHeight*.15);
        await at(top-innerHeight/2+c.offsetHeight/2);
        const s=c.querySelector(".fq-cut__strip").getBoundingClientRect(),sl=c.querySelector(".fq-cut__slug").getBoundingClientRect();
        const hits=[...document.querySelectorAll("h1,h2,h3,p,a,button,.eyebrow")].filter(e=>!c.contains(e)&&e.offsetParent).filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.bottom>Math.min(s.top,sl.top)+4&&r.top<s.bottom-4}).map(e=>(e.textContent||"").trim().slice(0,24));
        out.push({ch:c.dataset.chapter,next:(c.nextElementSibling.tagName==="SECTION"?c.nextElementSibling:document.getElementById("expertise")).id,slug:c.querySelector(".fq-cut__slug").textContent,frames:c.querySelectorAll(".fq-cut__frame").length,moved:Math.abs(late-mid),hits});
      }
      return {cuts:out,sw:document.documentElement.scrollWidth,vw:document.documentElement.clientWidth};
    });
    assert(res.cuts.map(c=>c.next).join()==="cinema-wrap,work,expertise,about,contact","a chapter is missing its cut "+JSON.stringify(res.cuts.map(c=>c.next)));
    for(const c of res.cuts){
      assert(/TO:/.test(c.slug),name+": cut "+c.ch+" has no transition slug");
      assert(c.frames>=10,name+": cut "+c.ch+" strip not filled ("+c.frames+")");
      assert(!c.hits.length,name+": cut "+c.ch+" covers content "+JSON.stringify(c.hits));
      if(motion==="reduce")assert(c.moved===0,"reduced motion: cut "+c.ch+" still moves");
      else assert(c.moved>15,name+": cut "+c.ch+" strip does not follow scroll ("+c.moved+")");
    }
    assert(res.sw<=res.vw,name+": horizontal scroll "+res.sw+">"+res.vw);
    assert(!errors.length,name+": runtime errors "+errors.join(" | "));
    console.log("SECTION_CUTS_PASS="+name);
    await page.close();
  }
}finally{await browser.close()}
