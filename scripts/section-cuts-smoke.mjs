// Section cuts: every chapter starts on a slant (no flat rule), the tinted
// plane behind each seam drifts with scroll (still with reduced motion), the
// slant clips no content, and nothing adds horizontal scroll.
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
      const ids=["cinema-wrap","work","expertise","about","contact"];
      const cuts=[...document.querySelectorAll(".fq-cut")];
      for(const [i,c] of cuts.entries()){
        const sec=document.getElementById(ids[i]);
        const plane=c.querySelector(".fq-cut__plane");
        const top=c.getBoundingClientRect().top+scrollY;
        const drift=async y=>{scrollTo({top:y,behavior:"instant"});await wait(250);return new DOMMatrix(getComputedStyle(plane).transform).m42};
        const a=await drift(top-innerHeight*.75),b=await drift(top-innerHeight*.25);
        const cs=getComputedStyle(sec);
        const secTop=sec.getBoundingClientRect().top;
        // first visible content in the section must start below the deepest point of the slant
        const first=[...sec.querySelectorAll("h2,.eyebrow,.chapter-mark,p,a,button")].filter(e=>e.offsetParent&&e.getBoundingClientRect().height>0).map(e=>e.getBoundingClientRect().top-secTop);
        out.push({id:sec.id,clip:cs.clipPath,border:cs.borderTopWidth,moved:Math.abs(b-a),
          clearance:Math.min(...first),slant:Math.max(...(cs.clipPath.match(/\d+(\.\d+)?px/g)||["0"]).map(parseFloat))});
      }
      return {cuts:out,count:cuts.length,sw:document.documentElement.scrollWidth,vw:document.documentElement.clientWidth};
    });
    assert(res.count===5,name+": expected 5 cuts, got "+res.count);
    for(const c of res.cuts){
      assert(/^polygon/.test(c.clip)&&c.slant>=24,name+": "+c.id+" does not start on a slant "+c.clip);
      assert(c.border==="0px",name+": "+c.id+" still has a flat border-top");
      assert(c.clearance>c.slant,name+": "+c.id+" slant clips content ("+Math.round(c.clearance)+" <= "+c.slant+")");
      if(motion==="reduce")assert(c.moved===0,"reduced motion: plane at "+c.id+" still moves");
      else assert(c.moved>5,name+": plane at "+c.id+" does not drift with scroll ("+c.moved+")");
    }
    assert(res.sw<=res.vw,name+": horizontal scroll "+res.sw+">"+res.vw);
    assert(!errors.length,name+": runtime errors "+errors.join(" | "));
    console.log("SECTION_CUTS_PASS="+name);
    await page.close();
  }
}finally{await browser.close()}
