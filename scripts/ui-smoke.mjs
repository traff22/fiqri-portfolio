import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const origin = "http://127.0.0.1:4173";
const report = [];
const filters = {
  highlights: 4, all: 15, event: 3, motion: 6, longform: 6, reels: 5
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

 // Validate the Chapter One gentle forward zoom without colliding with text,
 // not merely the CSS string. It must recede, with no collision into copy.
 await page.emulateMedia({reducedMotion:"no-preference"});
 const sceneStart=await page.locator("#cinema-wrap").evaluate(el=>el.offsetTop);
 const sceneSpan=await page.locator("#cinema-wrap").evaluate(el=>Math.max(1,el.offsetHeight-innerHeight));
 await page.evaluate(top=>window.scrollTo({top,behavior:"instant"}),sceneStart);
 await page.waitForTimeout(450);
 const stageStart=await page.locator("#cinema-wrap .showreel-shell").boundingBox();
 const screen=await page.locator("#cinema-wrap .showreel-visual").boundingBox();
 const caption=await page.locator("#cinema-wrap .showreel-shell > .montage-overlay").boundingBox();
 check(Math.abs(screen.width/screen.height-16/9)<.03,device+": video player not in widescreen 16:9");
 check(caption.y>=screen.y+screen.height-3,
   device+": title strip overlaps YouTube video instead of sitting underneath");
 check(caption.height>24&&caption.height<62,
   device+": title strip is too tall: "+caption.height);
 report.push({device,filmBox:{width:Math.round(screen.width),height:Math.round(screen.height)},captionBelow:true});

 const chapterCopy=await page.locator("#cinema-wrap .cinema-copy").boundingBox();
 check(stageStart.width>200,device+": Chapter One main frame missing");
 const satellites=await page.locator("#cinema-wrap .float-reel-card").evaluateAll(nodes=>nodes.map(el=>({
  className:el.className,display:getComputedStyle(el).display
 })));
 const visibleSatellites=satellites.filter(s=>s.display!=="none");
 check(visibleSatellites.length===(device==="desktop"?1:0),
  device+": expected a single desktop film depth cue, none on mobile: "+JSON.stringify(satellites));
 if(device==="desktop")check(visibleSatellites[0].className.includes("float-reel-card--two"),
  device+": wrong supporting film card shown");
 report.push({device,satelliteCardsVisible:visibleSatellites.length});

 check(intersection(stageStart,chapterCopy)<20,device+": Chapter One copy overlaps main frame at start");
 await page.locator("#cinema-wrap").screenshot({path:"screenshots/"+device+"-chapter-start.png"});
 await page.evaluate(top=>window.scrollTo({top,behavior:"instant"}),sceneStart+sceneSpan*.82);
 await page.waitForTimeout(650);
 const stageAfter=await page.locator("#cinema-wrap .showreel-shell").boundingBox();
 check(stageAfter.width>stageStart.width*(device==="mobile"?1.03:1.07)&&stageAfter.width<stageStart.width*1.23,
   device+": main frame scale not in the restrained zoom range, start "+stageStart.width+" end "+stageAfter.width);
 if(device==="desktop")console.log("CHAPTER_COLLISION_GEOMETRY="+JSON.stringify({stageAfter,chapterCopy,overlap:intersection(stageAfter,chapterCopy),scrollTop:await page.evaluate(()=>scrollY),css:await page.locator("#cinema-wrap").evaluate(el=>({section:el.getBoundingClientRect().toJSON(),scale:getComputedStyle(el.querySelector(".showreel-shell")).transform,copyOpacity:getComputedStyle(el.querySelector(".cinema-copy")).opacity,copyStyle:getComputedStyle(el.querySelector(".cinema-copy")).transform}))}));
 check(intersection(stageAfter,chapterCopy)<20,device+": Chapter One copy overlaps frame during scroll");
 const navigation=await page.locator("#cinema-wrap .cinema-view-work").boundingBox();
 check(intersection(stageAfter,navigation)<20,device+": chapter navigation CTA intersects the preview frame");
 await page.locator("#cinema-wrap").screenshot({path:"screenshots/"+device+"-chapter-depth.png"});
 const currentTitle=await page.locator("#cinema-wrap .montage-title").evaluate(el=>{
  const r=el.getBoundingClientRect();
  const shell=el.closest(".showreel-shell");
  const footer=el.closest(".montage-overlay").getBoundingClientRect();
  const film=shell.querySelector(".showreel-visual").getBoundingClientRect();
  const st=getComputedStyle(el);
  const stage=shell.querySelector(".showreel-montage");
  return {text:el.textContent,playback:stage?.dataset.playback||"pending",
    display:st.display,visibility:st.visibility,opacity:st.opacity,width:r.width,height:r.height,
    inside:r.left>=footer.left-2&&r.right<=footer.right+2&&r.top>=footer.top-2&&r.bottom<=footer.bottom+2,
    belowFilm:footer.top>=film.bottom-3};
 });
 check(currentTitle.display!=="none"&&currentTitle.inside&&currentTitle.belowFilm,
  device+": project title must remain in its own footer below the film: "+JSON.stringify(currentTitle));
 if(currentTitle.playback==="playing")check(currentTitle.visibility==="visible"&&currentTitle.width>40&&currentTitle.text.length>2,
  device+": video is playing without a visible project title");
 else check(!currentTitle.text||currentTitle.playback==="unavailable",
  device+": a static title appeared before genuine video playback: "+JSON.stringify(currentTitle));
 report.push({device,titleVisibility:currentTitle});

 report.push({device,chapter:"restrained zoom forward",initialWidth:Math.round(stageStart.width),endWidth:Math.round(stageAfter.width)});
 await page.emulateMedia({reducedMotion:"reduce"});

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
   if(filter==="all"){
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
   if(filter==="motion"){
     const modeGrid=await page.locator("#work .work-grid").boundingBox();
     const rightmost=Math.max(...tiles.map(t=>t.x+t.width));
     check(rightmost>=modeGrid.x+modeGrid.width-5,device+" motion: collage does not fill gallery width");
   }
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
