import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const origin = "http://127.0.0.1:4173";
const report = [];
const filters = {
  highlights: 4, all: 14, event: 3, motion: 6, longform: 5, reels: 4
};
function check(ok, reason) { if (!ok) throw new Error(reason); }
function intersection(a,b){
  const dx=Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x));
  const dy=Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
  return dx*dy;
}
for (const [viewport, device] of [
  [{width:1440,height:900,deviceScaleFactor:1},"desktop"],
  [{width:390,height:844,deviceScaleFactor:1},"mobile"]
]){
 const page=await browser.newPage({ viewport, deviceScaleFactor:1, reducedMotion:"reduce" });
 await page.goto(origin, {waitUntil:"domcontentloaded"});
 await page.evaluate(()=>{
   const intro=document.getElementById("intro");
   if(intro) intro.hidden=true;
   document.body.classList.remove("intro-active");
 });
 await page.locator("#work").scrollIntoViewIfNeeded();
 for(const [filter,n] of Object.entries(filters)){
   await page.locator('.filter[data-filter="'+filter+'"]').click();
   await page.waitForTimeout(90);
   const tiles=await page.locator("#work .work-card:visible").evaluateAll(nodes=>nodes.map(n=>{
    const r=n.getBoundingClientRect();
    return {id:n.dataset.project,format:n.dataset.format,x:r.x,y:r.y,width:r.width,height:r.height}
   }));
   check(tiles.length===n,device+" "+filter+": count "+tiles.length+" != "+n);
   const overlap=[];
   for(let i=0;i<tiles.length;i++){
    check(tiles[i].width>35&&tiles[i].height>55,device+" "+filter+": collapsed tile "+tiles[i].id);
    let target=tiles[i].format==="portrait"?9/16:16/9;
    let ratio=tiles[i].width/tiles[i].height;
    check(Math.abs(ratio/target-1)<.035,device+" "+filter+": wrong aspect "+tiles[i].id+" = "+ratio);
    for(let j=i+1;j<tiles.length;j++)
     if(intersection(tiles[i],tiles[j])>25)overlap.push(tiles[i].id+" overlaps "+tiles[j].id);
   }
   check(overlap.length===0,device+" "+filter+": "+overlap.join(", "));
   if(filter==="all"||filter==="motion"){
     const cols=await page.locator("#work .work-grid > .gallery-column").evaluateAll(nodes=>nodes.map(n=>{
       const r=n.getBoundingClientRect();
       return {children:n.querySelectorAll(".work-card:not([hidden])").length,x:r.x,right:r.right,width:r.width};
     }));
     const wanted=(device==="desktop"?3:2);
     check(cols.length===wanted,device+" "+filter+": expected "+wanted+" filled columns, saw "+cols.length);
     check(cols.every(c=>c.children>0),device+" "+filter+": empty masonry column");
     const grid=await page.locator("#work .work-grid").boundingBox();
     check(Math.abs(cols.at(-1).right-(grid.x+grid.width))<5,device+" "+filter+": right side was not filled");
   }
   report.push({device,filter,count:tiles.length,overlap:0,ratios:"ok"});
   if(filter==="highlights"||filter==="motion"){
     await page.locator("#work").screenshot({path:"screenshots/"+device+"-"+filter+".png"});
   }
 }
 // Open the event case study and validate its visual size.
 await page.locator('.filter[data-filter="event"]').click();
 await page.locator('.work-card[data-project="age-of-chaos"] .work-trigger').click();
 check(await page.locator("#event-dialog").evaluate(el=>el.open),device+": event modal did not open");
 const dialog=await page.locator("#event-dialog").boundingBox();
 const video=await page.locator("#event-feature-player").boundingBox();
 check(video.width>dialog.width*.70,device+": event player only "+video.width+" of "+dialog.width+"px modal");
 check(Math.abs(video.width/video.height-16/9)<.05,device+": event player ratio wrong");
 await page.locator("#event-dialog").screenshot({path:"screenshots/"+device+"-event-dialog.png"});
 const photoCount=await page.locator(".event-photo").count();
 check(photoCount===2,device+": Age of Chaos missing photos: "+photoCount);
 await page.locator("#event-dialog [data-close-dialog]").click();
 check(!(await page.locator("#event-dialog").evaluate(el=>el.open)),device+": modal failed to close");
 await page.screenshot({path:"screenshots/"+device+"-work.png",fullPage:true});
 report.push({device,eventModal:"ok",photos:photoCount,videoSize:[Math.round(video.width),Math.round(video.height)]});
 await page.close();
}
await browser.close();
console.log("UI_SMOKE_REPORT="+JSON.stringify(report));
