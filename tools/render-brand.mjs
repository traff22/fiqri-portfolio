// Renders the social share card and the app icons from tools/og.html, with
// the site's own fonts. Outputs PNGs; tools step converts the card to JPEG.
import {chromium} from "playwright";
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1300,height:1300},deviceScaleFactor:1});
await page.goto("http://127.0.0.1:4173/tools/og.html");
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(400);
await page.locator("#og").screenshot({path:"assets/og-card.png"});
await page.locator("#icon").screenshot({path:"assets/icon-512.png",omitBackground:true});
await browser.close();
console.log("rendered og-card.png and icon-512.png");
