// Renders mini Fiqri cameo frames (transparent PNG) from the live voxel model,
// so Contact and the footer show the same character without a second WebGL
// scene. Output: assets/cameos/<pose>-<frame>.png, then cropped to a shared box per pose and saved as WebP.
import {chromium} from "playwright";
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:640,height:640},deviceScaleFactor:1});
await page.goto("http://127.0.0.1:4173/tools/cameo.html");
await page.waitForFunction(()=>window.__ready&&window.__cameo);
for(const [pose,frames] of [["wave",2]]){
  for(let f=0;f<frames;f++){
    await page.evaluate(([p,f])=>window.__cameo.cameo(p,f),[pose,f]);
    await page.waitForTimeout(150);
    await page.locator("#host canvas").screenshot({path:`assets/cameos/${pose}-${f}.png`,omitBackground:true});
    console.log("rendered",pose,f);
  }
}
await browser.close();
