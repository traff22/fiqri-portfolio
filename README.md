# Fiqri Apriandi — Cinematic Portfolio Preview

A lightweight, mobile-friendly GitHub Pages preview of Fiqri's cinematic video editor / motion graphics portfolio.

## Preview website

After enabling GitHub Pages, the preview address will be:

https://traff22.github.io/fiqri-portfolio/

### Enable GitHub Pages (once)

1. Open the repository **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Set **Branch: main**, folder **/(root)**, then **Save**.
4. Check the **Actions** tab or return to **Settings → Pages** for the published URL.

This is the staging **preview**. The HTML currently includes `noindex, nofollow` so placeholder art does not get indexed by search engines. Remove this only after the final portfolio assets are approved.

## Local preview

With Python installed in the repository directory:

```sh
python -m http.server 4173
```

Then open http://localhost:4173 .

## Structure

- `index.html` — accessible semantic sections: intro, parallax hero, projects, expertise, about, contact.
- `assets/styles.css` — responsive editorial/cinematic visual system.
- `assets/main.js` — splash/skip/replay, filters, reveal animations, scroll progress and parallax.

## Add your own animated splash

1. Export an optimized, muted, web-friendly MP4, ideally with a poster image and mobile-compatible encoding.
2. Add it under `assets/intro/splash.mp4`.
3. In `index.html`, set `data-splash-src="assets/intro/splash.mp4"` on the `#intro` element.
4. The splash is skippable and automatically bypassed for returning visitors within the current browser tab or users with reduced-motion preferences.

**Important:** Project artworks and work descriptions are preview placeholders. Replace with authorized real case-study materials before using the website in job applications.

## Next steps

Replace the concept artwork with Fiqri's approved original films and case studies, add short video previews and meaningful project detail pages, optimize performance, then update SEO metadata and indexability for production.
