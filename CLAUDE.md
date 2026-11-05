# Claude project instructions — Fiqri Apriandi Portfolio

> Read this file **and** [docs/CLAUDE_HANDOFF_2026-11-06.md](docs/CLAUDE_HANDOFF_2026-11-06.md) before proposing or editing visual work. This is a handoff from the prior iterative design sessions, not a replacement for inspecting the source and rendered site.

## Identity / intent
- Owner: **Fiqri Apriandi**, Indonesian video editor / motion graphics designer. Speak naturally in Indonesian, direct, collaborative and specific; avoid generic compliments and repetitive preference questions.
- Live site: **https://fiqriapriandi.art/**. GitHub: **https://github.com/traff22/fiqri-portfolio**, public repo, branch **main**. Root `CNAME` is `fiqriapriandi.art`.
- Desired effect: **art-directed, handmade, premium, unmistakably a filmmaker/editor portfolio; lively and surprising, not flat, not a Wix template, not "AI slop."**
- Do not confuse *premium* with removing everything. The owner rejected the too-flat, beige/copper "Premium Restraint" look. Current accepted direction is electric midnight blue/iris/cobalt, strong typography, restrained but visible depth, cinematic parallax, **real project imagery**, and thoughtful interactions.
- Avoid random/floating particle generators, generic stock 3D, blobs for their own sake, gratuitous UI badges/ornaments, and fake project achievements. Keep footage and editing storytelling in focus.

## Current priority, in the owner's exact order
1. **Chapter One / Blueprint**: The owner explicitly rejected a standalone blueprint card. Technical blueprint lines, crop guides, connections, and work-process annotations must act as an **accent across the whole film composition**. Preserve visible **real project thumbnail cards**: three around the main showreel on desktop (product/editorial/event), two small thumbnails beneath it on mobile. Do not hide them again.
2. **Little About Me / Mini Fiqri workspace**: The first hand-drawn SVG had overlapping, cramped, physically inconsistent shapes. It was rebuilt as a wide, layered 2.5D/pixel-isometric editing room, not an actual free-rotatable voxel engine. Keep monitor/desk/mini-avatar separated, legible and proportionate. Owner wants **genuine interaction**: subtle pointer tilt of room, clicking/focusing monitor for editing/rendering, coffee for coffee break, avatar wave/curiosity; Edit / Render / Coffee buttons must work on touch.
3. **Hero portrait**: Preserve black-and-white owner portrait, slight tilt and secret **flip** Easter egg (no visible "tap to flip" instruction). Added pointer-follow **spotlight** on the photo must complement the flip and not obscure the person's face/text.
4. Do not regress Selected Work, actual YouTube montage, filters, mobile navigation, contact methods, accessibility, or previous Easter eggs.

## Read in this order
1. `docs/CLAUDE_HANDOFF_2026-11-06.md` — *chronological user feedback, what was tried/rejected, current architecture, known open points, QA process*.
2. `index.html` — actual DOM and **stylesheet/script load order**; no framework/build system.
3. `assets/craft-refinement.css` — **latest visual overrides**: unboxed blueprint, thumbnails, spacious mini-room, spotlight. It loads **last**.
4. `assets/creator-workspace.svg`, `assets/creators-lab.js`, `assets/creators-lab.css` — original artwork, interactive hotspots, blueprint phases, prior styling.
5. `assets/electric-cinema.css` and `assets/electric-cinema.js` — contemporary lighting/palette and subtle scroll/pointer depth.
6. `assets/chapter-montage.js`, `assets/chapter-montage.css`, `assets/chapter-one.js`, `assets/chapter-one.css`, `assets/showreel-clean.css` — main player and project thumbnails.
7. `assets/living-motion.js`, `assets/portrait-flip.js`, `assets/portrait-flip.css` — portrait pointer coordinates and flip.
8. `assets/work-gallery.js`, `assets/gallery-rebuild.css`, `assets/easter-eggs.js` — keep interactions intact.

## Important implementation realities
- **Static HTML / CSS / vanilla JS**, hosted with GitHub Pages. No React/Next.js required; do not migrate frameworks unless explicitly requested.
- Many cascading CSS files are loaded in `index.html`; some *old, unlinked* files are intentionally left for history (`editorial-atmosphere.*`). Don't revive them by accident. `README.md` contains older V1.x notes, not the freshest design decisions.
- Technical Chapter One SVG markup: `.fq-blueprint__schematic` inside `#cinema-wrap .fq-blueprint`. The JS updates `data-phase=capture|craft|deliver` on scroll. Current work cards: `.float-reel-card--one/--two/--three`. They contain actual linked project thumbnails.
- Mini room SVG: `assets/creator-workspace.svg`, `viewBox="0 0 920 560"`. Loaded by `assets/creators-lab.js` into `#fq-studio-art`; interactive SVG groups use `data-studio-object="screen|render|coffee|avatar"`. `#fq-studio` holds `data-mode=edit|render|coffee`.
- Hero spotlight uses `.portrait-card__face--front::after` and CSS `--hover-x/--hover-y` populated in `assets/living-motion.js`. Keep `.portrait-card__rotator` 3D flip and the clickable accessible button.
- The real showreel uses official YouTube embeds; do not promise hiding YouTube branding/controls entirely or claim videos are locally owned. Respect permissions/public use for client footage.
- `index.html` currently contains `<meta name="robots" content="noindex, nofollow">`: **do not remove without owner approval** and approval of public portfolio assets.
- Never expose credentials, API keys, private analytics, client confidential assets, or invent work metrics.

## Working method — MUST follow
1. Before any design revision: inspect **current code + desktop and mobile screenshots** (1440×900, 390×844, 320×740 at minimum). State what feels wrong *and why*; identify the exact section to change.
2. For substantial design changes, present a concrete, scoped art-direction proposal first. Prefer editing one section at a time; do not silently recolor/rebuild the whole site.
3. Write **specific, intentional visuals**: real project frames, consistent light/perspective, designed motion and purposeful asymmetry. No generic filler graphics.
4. Preserve user-approved behaviors and IDs; do not remove thumbnails, the portrait Easter egg, or mini-room interactive actions as a simplifying shortcut.
5. Respect `prefers-reduced-motion`, mobile/touch, keyboard/aria labels, image permissions, and sensible payloads. Test real browser rendering and collision/overflow rather than checking source code only.
6. Local preview: `python3 -m http.server 4173` from repo root; open `http://127.0.0.1:4173/`. Existing GitHub Actions workflow runs Playwright in Chromium (`scripts/*-smoke.mjs`).
7. When editing: preserve a clean Git diff, explain why each change was made, update tests if behavior *intentionally* changes, include screenshot evidence, and report exact QA results. Do not mark success while a workflow is failing/pending.
8. Always update the handoff doc / changelog section with **new owner decisions and their rationale** for the next Claude session.

## Latest stable verification before this handoff
- Website revision commit: `edbc3b1e` (2026-11-05 UTC / Nov 6 WIB).
- GitHub Pages deployment: [successful run 42118369949](https://github.com/traff22/fiqri-portfolio/actions/runs/42118369949).
- Chromium smoke tests: [successful run 42118369546](https://github.com/traff22/fiqri-portfolio/actions/runs/42118369546). Tests include desktop/mobile/compact-mobile and interactions.
- These are historical checkpoints; **recheck current HEAD and current runs** before claiming a later change passed.
