import {chromium} from "playwright";
import fs from "node:fs";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
fs.mkdirSync("screenshots",{recursive:true});
const intersection=(a,b)=>{
  const w=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));
  const h=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  return w*h;
};
try{
 for(const [label,width,height] of [["desktop",1440,900],["mobile",390,844],["small-mobile",320,740]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:"no-preference"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:4173/",{waitUntil:"domcontentloaded"});
  await page.locator("#fq-studio-art svg").waitFor({timeout:10000});
  const svg=page.locator("#fq-studio-art svg");
  assert((await svg.getAttribute("viewBox"))==="0 0 620 426",label+": custom miniature SVG missing");
  assert(await svg.locator(".fq-avatar-bob").count()===1,label+": pixel character missing");
  assert(await svg.locator(".fq-render-progress").count()===1,label+": rendering UI missing");

  const about=page.locator("#about");
  await about.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const studio=page.locator("#fq-studio");
  const st=await studio.boundingBox();
  assert(st&&st.width>260,label+": workspace collapsed");
  await page.locator('[data-studio-mode="render"]').click();
  assert(await studio.getAttribute("data-mode")==="render",label+": render mode not active");
  assert(await page.locator('[data-studio-mode="render"]').getAttribute("aria-pressed")==="true",label+": render selection not announced");
  assert((await page.locator("#fq-studio-note").innerText()).includes("Rendering"),label+": status not updated");
  await page.locator('[data-studio-mode="coffee"]').click();
  assert(await studio.getAttribute("data-mode")==="coffee",label+": coffee mode not active");
  assert((await page.locator("#fq-studio-note").innerText()).includes("Coffee"),label+": coffee message missing");
  await page.locator('[data-studio-mode="edit"]').click();
  assert(await studio.getAttribute("data-mode")==="edit",label+": editing mode did not restore");
  await studio.screenshot({path:"screenshots/creator-studio-"+label+".png",animations:"disabled"});

  const chapter=page.locator("#cinema-wrap");
  const blueprint=page.locator(".fq-blueprint");
  await chapter.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const bp=await blueprint.boundingBox();
  const film=await page.locator("#cinema-wrap .showreel-visual").boundingBox();
  assert(bp&&bp.width>=130&&bp.height>50,label+": blueprint collapsed");
  assert(intersection({left:bp.x,top:bp.y,right:bp.x+bp.width,bottom:bp.y+bp.height},
     {left:film.x,top:film.y,right:film.x+film.width,bottom:film.y+film.height})<500,
     label+": blueprint obscures the actual film");
  const start=await chapter.evaluate(el=>el.offsetTop);
  const span=await chapter.evaluate(el=>Math.max(1,el.offsetHeight-innerHeight));
  await page.evaluate(n=>scrollTo({top:n,behavior:"instant"}),start+span*.87);
  await page.waitForTimeout(280);
  assert(await blueprint.getAttribute("data-phase")==="deliver",
    label+": scroll storyboard did not reach output phase");
  await chapter.screenshot({path:"screenshots/creator-blueprint-"+label+".png",animations:"disabled"});
  const ov=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert(ov<=1,label+": horizontal overflow "+ov);
  assert(errors.length===0,label+": browser errors "+errors.join(" | "));
  console.log("CREATORS_LAB_PASS="+JSON.stringify({label,studioWidth:Math.round(st.width),blueprintWidth:Math.round(bp.width),phase:"deliver",overflow:ov}));
  await page.close();
 }
}finally{await browser.close()}
