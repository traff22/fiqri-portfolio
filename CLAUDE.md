# Claude project instructions — Fiqri Apriandi Portfolio

> Read this file, [DESIGN.md](DESIGN.md) (palette, type, motion and copy rules with reasons) **and** [docs/CLAUDE_HANDOFF_2026-11-06.md](docs/CLAUDE_HANDOFF_2026-11-06.md) before proposing or editing visual work. Project skills live in `.claude/skills/` (antislop, design-taste-frontend, humanizer); latest audit: `anti-slop/audit-001-2026-11-06.md`. This is a handoff from the prior iterative design sessions, not a replacement for inspecting the source and rendered site.

## Identity / intent
- Owner: **Fiqri Apriandi**, Indonesian video editor / motion graphics designer. Speak naturally in Indonesian, direct, collaborative and specific; avoid generic compliments and repetitive preference questions.
- Live site: **https://fiqriapriandi.art/**. GitHub: **https://github.com/traff22/fiqri-portfolio**, public repo, branch **main**. Root `CNAME` is `fiqriapriandi.art`.
- Desired effect: **art-directed, handmade, premium, unmistakably a filmmaker/editor portfolio; lively and surprising, not flat, not a Wix template, not "AI slop."**
- Do not confuse *premium* with removing everything. The owner rejected the too-flat, beige/copper "Premium Restraint" look. Current accepted direction (2026-11-06) is a **blue-black** palette (near-black ink, navy, one cobalt accent; iris/violet retired) whose light follows the visitor's time of day, strong typography, restrained but visible depth, cinematic parallax, **real project imagery**, and thoughtful interactions. Tokens: `assets/design-system.css` (loads last).
- Avoid random/floating particle generators, generic stock 3D, blobs for their own sake, gratuitous UI badges/ornaments, and fake project achievements. Keep footage and editing storytelling in focus.

## Current priority, in the owner's exact order
1. **Chapter One / Blueprint**: The owner explicitly rejected a standalone blueprint card. Technical blueprint lines, crop guides, connections, and work-process annotations must act as an **accent across the whole film composition**. Preserve visible **real project thumbnail cards**: three around the main showreel on desktop (product/editorial/event), two small thumbnails beneath it on mobile. Do not hide them again.
2. **Little About Me / Mini Fiqri workspace**: Since 2026-11-06 this is a **real-time 3D voxel diorama** (Three.js, `assets/voxel-studio.js`), floating in the section **without a card**. Mini Fiqri **lives on his own** (edit → render → walk to coffee, sip facing camera → back), the room can be dragged/turned, and in-scene clicks (monitors, coffee, Fiqri) plus Edit / Render / Coffee / Say hi buttons trigger the same actions on touch and keyboard. The 2.5D SVG room (`assets/creator-workspace.svg`) is kept only as the no-WebGL fallback. Owner explicitly asked for "3D voxel interactive, jalan sendiri, nggak perlu di card".
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
- Mini room: `assets/creators-lab.js` lazy-imports `assets/voxel-studio.js` (which imports vendored `assets/vendor/three.module.min.js`, Three.js r170, MIT) when `#fq-studio` is within 700px of the viewport. It mounts a canvas in `#fq-studio-art`. `#fq-studio` holds `data-engine=voxel|svg`, `data-mode=edit|render|coffee` and `data-state` (incl. `wave`). The test hook is `#fq-studio-art.fqVoxel.advance(seconds)`. Without WebGL it falls back to `assets/creator-workspace.svg` (`viewBox="0 0 920 560"`, `data-studio-object` hotspots). Styling is in `assets/voxel-studio.css`.
- Chapter One is owned by `assets/chapter-blueprint.css/.js` (loaded last): measured connectors, montage-synced source highlight (`fq:shot` event from `chapter-montage.js`), crop marks, drafting grid and construction lines. Don't reuse legacy `fq-blueprint__*` class names from `creators-lab.css`.
- Section cuts: `.fq-cut` blocks between chapters (`assets/section-cuts.css/.js`): the next section's top is cut on a slant (`clip-path`, `--slant`) and one tinted plane behind the seam drifts on scroll. Shapes only: the owner rejected the film-strip/"CUT TO:" version. Selected Work does not overlap the pinned Chapter One. Test: `scripts/section-cuts-smoke.mjs`.
- Contact cameo: `assets/cameos.js` loops voxel stills (wave, point, cool, dab, jump) from `api.cameo()`; render with `tools/render-cameos.mjs` then `python3 tools/crop-cameos.py`. The cameo is its own pause `<button>`. The footer note has no cameo (owner decision). Fiqri gets in and out of the chair over its open side, never through the backrest (`api.figure` test hook).
- AI sidekick: a voxel hover-bot in the room's front-left corner; "AI assist" (button or click) runs `aiAssist()` with a mask-tracing hologram. About has a "Working with AI" block (`.ai-note`); its use-case list awaits the owner's confirmation, never invent case studies.
- Editor shuttle easter egg: J/K/L play the page like an NLE timeline (`assets/editor-shuttle.css/.js`); the Director's Cut hints at it and has a "Play this page" button for touch. Test: `easter-eggs-smoke.mjs` (EDITOR_SHUTTLE_PASS).
- Opening titles: `#intro.fq-splash` (`assets/splash.css` + `assets/main.js`), once per session, skippable, never with reduced motion. Tests that do not exercise it set `sessionStorage['fiqri-intro-seen']='yes'` before load.
- **Dead CSS is not allowed back in.** CI runs `node tools/prune-css.cjs . --check`, which fails if any selector can never match (its class, id or attribute value appears in no markup or JS string). When you remove markup or a feature, run `node tools/prune-css.cjs . --write` and the screenshot parity check described in the handoff.
- `tools/` holds one-off renderers (cameo stills, share card, icons). They run against the local server and write into `assets/`; they are not loaded by the site.
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
