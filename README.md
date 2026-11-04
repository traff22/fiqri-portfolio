## Chapter One — five-second video montage (V1.3)

**Main frame:** A restrained 0–13% forward zoom on scroll, rather than the old uncontrolled full-screen zoom. The main video stays under the heading; supporting project cards recede into the background. A 9:16 Bitcoin Almanac card, 16:9 Editorial Stories card and 1760:761 Age of Chaos event banner communicate different formats and visual depth.

**Live footage:** The page reads published project IDs directly from the Selected Work cards. When Chapter One is visible and the visitor allows motion/data, `assets/chapter-montage.js` loads the official YouTube IFrame Player API and maintains two **muted** players. It chooses an approximately five-second segment of a randomly selected film; when duration is available, it seeks to a randomized valid point. The video panels cross-dissolve, retaining the outgoing frame while the next project becomes playable. Click or keyboard-activate **Next shot** anywhere over the center frame to skip immediately to another randomly selected project. The montage pauses when the page is hidden/offscreen. The 5-second rhythm restarts when the next actual player starts.

**Fallback and limitations:** If YouTube is blocked, an owner disabled embedding, a browser blocks scripted autoplay, or a connection is slow, the project poster remains visible as a cinematic frame montage. YouTube embeds are not guaranteed seamless because the content is streamed by a third party; controls=0 is not equivalent to removing YouTube branding. The deterministic Playwright YouTube mock test validates five-second scheduling, randomized seeks, muting, and click-to-skip logic, but does not guarantee browser-specific external streaming.

**Native teaser upgrade:** Export short silent high-quality `.mp4`/`.webm` clips from footage you're allowed to publish, store them under `assets/showreel/`, and set `data-montage-src="assets/showreel/filename.mp4"` on the relevant card's `.work-media`. The montage prioritizes an available native clip, giving smoother transitions than YouTube. A standalone edited showreel can still replace the montage through `.showreel-shell[data-video-src]`.

**Current project counts:** 15 total cards, 4 Highlights (unchanged), 7 Motion including **A-CLUB Wrapped 2025**, 5 Reels, 5 Long-form, 3 Events.

# Fiqri Apriandi — Cinematic Portfolio Preview

A responsive, cinematic portfolio for Fiqri Apriandi. **V1.3** contains 15 project cards including A-CLUB Wrapped 2025 (TRIV Premiere removed), the exact four selected Highlights, native-aspect video thumbnails, three event case studies, and genuine Age of Chaos / Counter Trend event photography.

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
- `assets/collage.css` — base curated gallery styles.
- `assets/gallery-rebuild.css` — V1.1 native-ratio collage, responsive categories, consistent event modal and video player.
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

## Current gallery and event case studies (V1.1)

The website displays **15 projects**, including the four featured Highlights in this exact editorial order:

1. **ADS Astronacci — Bitcoin Almanac 2025** (Reels, 9:16)
2. **Cinematic Mancing** (Long-form, 16:9)
3. **Age of Chaos** (Event, 1760:761 thumbnail)
4. **Logistics 9 — Product Showcase** (Motion, 16:9)

**Highlights** uses a 9:16 Reel beside three native-ratio 16:9 videos in a ratio-matched editorial collage. **All Work and Motion** use compact masonry; Reels remain 9:16, and Long-form and Events are 16:9. Titles overlay the thumbnail instead of expanding the card vertically. The previous competing CSS gallery sheets have been removed from `index.html`; `assets/gallery-rebuild.css` is the single layout and dialog system. The initial Highlights filter displays only four cards even before JS loads.

**Event architecture:** A visitor sees one prominent banner/bumper video cover per event. Clicking it opens a full event case study, with an interactive video selector and any uploaded photo assets. Switching selected videos unloads the previous iframe. Closing the popup, pressing Escape, switching tabs, or navigating away also unloads playback.

- **Age of Chaos**: banner `c9wCgrjlUhk`, photo assets `stage.webp` and `crew.webp`.
- **Counter Trend**: banner loop `e4LDw8UeBVM`, speaker `ytYOsh3ZcWc`, talkshow `AH1l-VdQj1I`, photo `venue.webp`.
- **Heavenly Whisper**: bumper `ydwCKwjdPHI`, music video `Vk4Me3JrLng`.

Event photos supplied by the owner are compressed and stored at `assets/events/<event-slug>/*.webp`. The originals are not altered. Static assets are visible in the public repository.

`assets/gallery-rebuild.css` is the only loaded gallery / dialog stylesheet. The interactive data and playback behavior live in `assets/work-gallery.js`. To add another video to an event, edit its `videos` array in the `events` object. To add photography, edit its `photos` array with a genuine path, caption and alt text. All event videos are embedded through YouTube's privacy-enhanced domain only after clicking Play.


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

The current **Highlights** selection is Bitcoin Almanac Reels, Cinematic Mancing, Age of Chaos, and Logistics 9 Product Showcase. Nonfeatured projects remain available in All work and their corresponding category filters.

### Linked videos from V1.0

| Category | Video | YouTube ID |
| --- | --- | --- |
| Long-form | Logistics 9 — Yiwu Market Tour VLOG | `X4biFwBPwRg` |
| Reels | ADS Astronacci — Bitcoin Almanac 2025 | `DkounxK31EU` |
| Reels | Astronacci — NFP 100% | `E2D5KPuhug0` |
| Reels | Logistics 9 — Garden Set | `wvAc12hybog` |
| Reels | Logistics 9 — Custom Packaging | `9IurjSDUGdQ` |

Event videos are recorded above under the event case-study section.

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
