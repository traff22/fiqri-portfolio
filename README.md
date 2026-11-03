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
