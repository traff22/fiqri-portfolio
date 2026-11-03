# Fiqri Apriandi — Cinematic Portfolio Preview

A responsive creative portfolio for Fiqri Apriandi. **V0.6** uses the latest single black-and-white portrait, purposeful camera/edit/motion icons, restrained copy, and a Chapter One heading that appears as soon as the scene enters the viewport and remains stationary and readable. Floating cards and the showreel frame retain independent motion.

## Preview website

After enabling GitHub Pages, the preview address will be:

https://traff22.github.io/fiqri-portfolio/

### Enable GitHub Pages (once)

1. Open the repository **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Set **Branch: main**, folder **/(root)**, then **Save**.
4. Check the **Actions** tab or return to **Settings → Pages** for the published URL.

This is the staging **preview** (photos are public because this is a public repository). The HTML currently includes `noindex, nofollow` so placeholder art does not get indexed by search engines. Remove this only after the final portfolio assets are approved.

## Local preview

With Python installed in the repository directory:

```sh
python -m http.server 4173
```

Then open http://localhost:4173 .

## Structure

- `index.html` — accessible semantic sections: intro, parallax hero, projects, expertise, about, contact.
- `assets/styles.css` — responsive editorial/cinematic visual system.
- `assets/main.js` — splash/skip/replay, filters, reveal animations and base parallax.
- `assets/chapter-one.css` — 16:9 showreel, floating preview cards, geometric shapes, and Blue Hour hover states.
- `assets/chapter-one.js` — card depth parallax, interactive hover tilt, lazy video loading and optional sound control.
- `assets/collage.css` — compact ratio-aware collage and mobile masonry for Highlights / All work.
- `assets/living-motion.css` — original floating motion and interactive photographic card styling.
- `assets/living-motion.js` — pointer-reactive portrait tilt/glare plus early, stationary Chapter One heading reveal.
- `assets/refinement.css` — single-portrait editorial layout, accessible film iconography, and static chapter typography.
- `assets/fiqri-portrait-bw.webp` — Fiqri's newest black-and-white portrait optimized as a self-hosted WebP, verified against the supplied photo before publishing.

## Add your own animated splash

1. Export an optimized, muted, web-friendly MP4, ideally with a poster image and mobile-compatible encoding.
2. Add it under `assets/intro/splash.mp4`.
3. In `index.html`, set `data-splash-src="assets/intro/splash.mp4"` on the `#intro` element.
4. The splash is skippable and automatically bypassed for returning visitors within the current browser tab or users with reduced-motion preferences.

**Important:** Project artworks and work descriptions are preview placeholders. Replace with authorized real case-study materials before using the website in job applications.

## Editorial auto-collage — Highlights + All work (V0.8)

**Highlights** (4 hand-picked projects) and **All work** (6 projects) now switch automatically into a compact, gap-minimized gallery. On desktop, the 24-track CSS Grid balances complementary visual ratios in pairs:

- Reels portrait **9:16** beside long-form **16:9**
- Event key visual **1760:761** beside product motion **16:9**
- Another event key visual beside portrait reels (All work)

The existing DOM order stays intact for keyboard/screen-reader navigation. `assets/work-gallery.js` assigns a collage slot to each visible card automatically on each filter change; other category filters keep the existing full-width aspect-aware presentation. Adding more projects works with an even-column fallback.

On small screens the gallery switches to a compact **two-column masonry layout** using CSS columns, with tighter titles and gently cropped event thumbnails for readability. Event case studies themselves still show the **full 1760×761** banner, and video player playback keeps the original ratio. Collage mode is only an editorial *thumbnail view*.

Visual labels move inside thumbnails; descriptions remain available to modal views rather than producing rows of text underneath every tile.

**Adding real thumbnails:** change a card's `data-poster-src=""` in `index.html` to an optimized image path such as `assets/posters/bitcoin-almanac.webp`. This is loaded lazily. If empty, the designed artwork placeholder remains, and the site does not fetch missing assets.

Styles: `assets/collage.css`. Layout logic: `assets/work-gallery.js`.

## Real video projects / YouTube + native MP4 (V0.9)

The user-supplied portfolio is configured from the links supplied in November 2026:

| Category | Project | YouTube video ID |
| --- | --- | --- |
| Long-form | IHSG The Movie | `a4KcABEH4XI` |
| Long-form | Podtrade — Suli | `CNrT59yeqJo` |
| Long-form | Cinematic Mancing | `c7GCJP2GcEE` |
| Long-form | Talking Head — Matarakyat | `GPOzjdHp2xA` |
| Motion | Logistics 9 — Product Showcase | `kEtoqcHMs1c` |
| Personal archive (also shown in Motion) | Know More Bout Me — 2024 | `hEhRkIbH-Pg` |

YouTube IDs appear as `data-youtube-id="VIDEO_ID"` on the corresponding `.work-media` element. The thumbnail loads lazily via `https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg`. Clicking the project opens a privacy-enhanced YouTube embed; a fallback **Watch on YouTube** link is available if embedding is restricted. Video titles are the user's labels and have not been independently checked against YouTube.

The **Highlights** default is four existing/linked films (IHSG, Podtrade, Cinematic Mancing, Logistics 9). Additional placeholders for campaign/event/reels assets remain under **All work** until approved footage arrives.

### Add work that is not on YouTube

**Option A — upload to your YouTube channel as Unlisted:** It does not appear in public channel/search listings, but anyone with the URL can watch and share it. In `index.html`, add the video's 11-character ID to `data-youtube-id` and its corresponding thumbnail to `data-poster-src`.

**Option B — native MP4, no YouTube:** Put a *compressed web export* under `assets/videos/` (or use a public media CDN URL). On the intended project card's `.work-media` wrapper, set:

```html
data-video-src="assets/videos/my-edit.mp4"
data-poster-src="assets/posters/my-edit.webp"
data-youtube-id=""
```

On click, the modal uses the HTML5 player. It does not autoplay/load the full-length gallery videos until clicked. You can use a separate small promotional loop for thumbnails later; avoid auto-loading 30-minute video files for hover.

**GitHub Pages is primarily static hosting:** do not fill the repository with large master files. Browser file uploads are limited to 25 MiB per file, Git CLI up to 100 MiB per file; published Pages sites have a limit of 1 GB and soft bandwidth limits. For heavier footage, use a video hosting provider/CDN rather than the website repository. Don't use Git LFS pointer files directly as video URLs.

You must have permission to publicly show client/employer footage; an Unlisted link or public static site is *not private or access controlled*.

## Selected Work — gallery, formats and interactions (V0.7)

The **Highlights** filter is the default editorial shortlist. Other filters include All work, Events, Motion, Long-form and Reels. Each project in `index.html` has `data-categories` (space-separated) and `data-featured`. A project can appear in more than one category.

- **Reels / vertical social**: set `data-format="portrait"`, media is **9:16**.
- **Long-form / films / motion**: set `data-format="landscape"`, media is **16:9**.
- **Events / key visuals**: set `data-format="event"`, media is **1760:761** (aspect ratio ~2.313).
- Prefer optimized WebP/AVIF thumbnails, MP4/WebM web exports, and only footage approved for public display.

To attach a playable video to a normal card, find its `.work-media` wrapper in `index.html` and change its empty attribute:

```html
<div class="work-media story" data-video-src="assets/videos/astronacci-longform.mp4">
```

The **Watch video** action opens a real HTML5 player if there is a file. With no file, the same dialog shows an honest placeholder.

For event projects, click **Explore event** to open the event case-study overlay. Asset paths are configured in `assets/work-gallery.js`, in the `events` object. Set the `banner`, `motion`, and `documentation` image paths for each event, for example:

```js
"age-of-chaos": {
  title: "Age of Chaos 2025",
  year: "2025",
  summary: "...",
  contribution: "...",
  banner: "assets/events/age-of-chaos/banner.webp", // 1760 x 761 recommended
  motion: "assets/events/age-of-chaos/motion-still.webp", // 16:9
  documentation: "assets/events/age-of-chaos/documentation.webp" // 4:3
}
```

The case study is a native, keyboard-accessible `<dialog>` with Escape/backdrop/close support, including the event banner, two additional asset slots and contribution notes. Assets are placeholders until uploaded; no project results or client metrics have been invented.

To expand an event into a full image gallery later, add more asset entries to its configuration and update the event-dialog template. The gallery CSS is in `assets/work-gallery.css`, and interactive logic is in `assets/work-gallery.js`.

**Chapter One text layering:** the headline appears when the section first enters view, stays motionless so it is readable, then fades behind the enlarging showreel rather than overlapping in front.

## Chapter One — add actual videos (V0.4)

All video slots have a genuine **16:9 landscape viewport** and intentionally start as art-directed placeholders. **No broken files are requested while `data-video-src` is empty.**

1. Export approved footage as web-optimized H.264 `.mp4` (1920×1080 or 1280×720, 16:9). Use short, muted 3–6-second seamless loops for card previews.
2. Upload the files to the repository at the paths listed below (or host them on a CDN and use full URLs).
3. Open `index.html`. Find the relevant wrapper and fill its `data-video-src=""` attribute with the path.
4. Push the changes. The site loads videos when they approach the viewport, preserves placeholders until each video is available, and plays previews muted where permitted.

| Placement | Element/selector | Example asset |
| --- | --- | --- |
| Main cinematic screen | `.showreel-shell` | `assets/videos/showreel.mp4` |
| Floating card 01 | `.float-reel-card--one .float-reel-card__media` | `assets/videos/product-motion.mp4` |
| Floating card 02 | `.float-reel-card--two .float-reel-card__media` | `assets/videos/youtube-story.mp4` |
| Floating card 03 | `.float-reel-card--three .float-reel-card__media` | `assets/videos/event-film.mp4` |
| Project gallery videos | `.work-media` (4 individual cards) | `assets/videos/bitcoin-almanac.mp4` etc. |

Example:

```html
<div class="cinema-frame showreel-shell" data-video-src="assets/videos/showreel.mp4">
```

The actual media is a native `<video>` using `object-fit: cover`, `playsinline`, `muted` and `loop`. A sound toggle appears only when the main showreel loads. If you want a cinematic poster thumbnail instead of motion, adapt the placeholder styling or provide a static image; do not autoplay full-length 4K source videos.

**Performance:** Keep the main short reel ideally below ~5–8 MB, smaller card loops below ~1–2 MB each when practical. Compress footage before committing large files; GitHub repositories should contain optimized delivery assets, not original project render masters. All motion observes `prefers-reduced-motion`, and touch devices avoid pointer tilt.

**Accessibility:** The cards are intentionally decorative placeholders, not fake clickable project links. Once individual case study pages exist, replace each card's presentation with an actual link.


## Next steps

Replace the concept artwork with Fiqri's approved original films and case studies, add short video previews and meaningful project detail pages, optimize performance, then update SEO metadata and indexability for production.
