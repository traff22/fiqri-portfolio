# Fiqri Portfolio — Design & Engineering Handoff to Claude
**Prepared:** 2026-11-06 (Asia/Jakarta). **Owner:** Fiqri Apriandi. **Audience:** Claude Code / Claude Project.  
**Canonical repository:** https://github.com/traff22/fiqri-portfolio (`main`)  
**Live URL:** https://fiqriapriandi.art/  
**Last *website* change before handoff:** `edbc3b1e` (not counting documentation-only commits).  
**Verified:** [GitHub Pages success](https://github.com/traff22/fiqri-portfolio/actions/runs/42118369949), [Playwright/Chromium tests success](https://github.com/traff22/fiqri-portfolio/actions/runs/42118369546).

> **Source priority:** latest direct owner instruction > current live source/render > this handoff > old `README.md` and previous experimental CSS. This handoff reflects iterative work and user feedback; not every aesthetic decision has received final approval. Never mistake “implemented and test-passing” for “owner visually approved.”

## 1. What the owner is creating

A premium, unmistakably *human-crafted* portfolio for an Indonesian video editor, motion graphics designer and visual storyteller. It must communicate editing craft, rhythm, shot selection, and personality—not a generic landing page made from design-template ingredients.

**Non-negotiable taste signals:**
- Strong hierarchy and confident typography; scroll should direct attention **Hero → Chapter One/showreel → Selected Work → About → Contact**.
- “Wow” from **real project images**, layered staging, cinematic camera/lighting, crafted interactive scenes, subtle parallax—not glitter or a blizzard of pseudo-technical particles.
- Electric midnight ink + iris/periwinkle/cobalt, with measured cyan/teal signals. Copper/beige color study looked dated to the owner.
- Avoid both extremes: motion-heavy “AI-slop” and over-stripped, flat corporate/Wix template. Deliberate contrast, depth and an artistic voice matter.
- Desktop art direction and mobile touch experience must *both* be excellent. Respect reduced motion, data savings and performance. Do not sacrifice readability to show off effects.
- Describe progress honestly; when visual or QA uncertainty exists, say so. Use screenshot comparisons, not merely claims that CSS is “premium.”

## 2. Chronology: how we arrived here, and WHAT NOT to repeat

Chronology is ordered by the actual design conversation, not by label/version number:

| Order | Owner feedback / event | Experiment or implementation | Decision / lesson |
|---|---|---|---|
| 1 | Initial cinematic editorial portfolio, 15 project cards with real-linked footage. Wanted mobile cleanup. | Mobile polish layer (`assets/mobile-polish.css`), better hero/menu/gallery/dialog responsive behavior. | Preserve site's work-first architecture and usable mobile UX. |
| 2 | Wanted hero portrait to reveal a poetic note: “Just an introvert who loves the art of life…” | 3D portrait flip built. | **Keep** Easter egg flip and personal back-side copy. |
| 3 | “Gausah ada tulisan tap to flip,” and the outline did not rotate. | Removed visible flip cue, moved frame/border/shadow onto rotating faces. | **Never restore visible flip instructions.** Border must rotate with both faces. |
| 4 | Wanted small fun Easter eggs. | Triple-click `FQ.` = Director's Cut; held/hovered project notes; end-of-page “last frame” thank-you. | Keep them subtle; don't clutter homepage with tutorial labels. |
| 5 | Asked for elegant modern 60/30/10, handmade, not AI-slop. | Dark ink / slate / film copper; warm-paper contact section. | Was an intermediate experiment **not the chosen final art direction**. |
| 6 | “Particle backgroundnya agak ganggu” and asked for more premium restraint. | Particle scripts removed from loaded page; most satellite film cards and halo/chips hidden. | Removing random particles was right, **but the total simplification went too far**. |
| 7 | “Sekarang malah jadi flat … Wix-type … warnanya kayak old website jelek … belakangnya plain.” | Reintroduced layered cinematography with `assets/electric-cinema.css/.js`: rich cobalt/iris lighting and scroll-responsive depth, color in contact, pointer/scroll parallax, a thumbnail. | Current direction: **Electric Cinema**, expressive not chaotic. Never return to flat beige/copper or inert background. |
| 8 | Proposed *visuals depicting the work*: blueprint animation around raw/real footage; interactive little voxel/pixel Fiqri and workspace in About. | First `assets/creator-workspace.svg` (620×426 isometric) and floating rectangular `fq-blueprint` panel. | This first attempt was **rejected**: blueprint was a boxed UI instead of part of scene; voxel illustration looked cramped, overlapping, misaligned. |
| 9 | Explicit final critique: liked **several existing project thumbnail cards** and wanted blueprint across the **whole frame**, showing how he works; wanted actual hover/tap room interaction, spacious/symmetric character; hero spotlight on hover. | Rebuilt `creator-workspace.svg` to 920×560; created latest override `craft-refinement.css`; swapped blueprint DOM to full-composition guide lines and process annotations; restored 3 desktop / 2 mobile work thumbnails; interactive SVG object hotspots + room tilt; portrait spotlight. | **THIS is the current working baseline.** It passed browser tests. Owner has **not yet signed off** on final aesthetic details. |
| 10 | Most recent activity | Coffee gesture brought toward cup, hover avatar head reacts, asset cache versions refreshed. | Website commit `edbc3b1e`, stable deployed/tested checkpoint. |

### Verbatim owner feedback that should steer future work

> “Gw pengen ... clean not a template ... ai slop i dont want that i want something elegant unique handmade craft clean not a template.”

> “Kok gw ngerasa particle-particle backgroundnya agak ganggu ... premium.”

> “Kok gw lihatnya skrng malah jadi flat ... Wix-type ... belakangnya plain banget.”

> “blueprintnya bukan seperti itu gw jujur suka yang ada beberapa thumbnail project gw dari sebelumnya, ... blueprintuh jadi kaya aksen si a whole framenya gimana car gw kerja dll”

> “Untuk animasi a little about me bagu konsepnya tapi gambarnya aneh banget tumpang tindih nggak rapih dan kelihatan banget ngawor, ... itu kelihatan terlalu sempit dan nggak simetris”

> “gw pengen yang bener bener interaktif gw nya gerak siruangannya bisa di kaya hover or something”

> “Juga kayanya bagus kalo di card hero kaya ada spotlight gitu pas gw hover”

Do **not** interpret “blueprint” as a blue rectangular explanatory widget. It is *a designer/editor's working marks around a scene*, supporting real footage. Do **not** interpret “voxel” as permission to add a random AI-generated character/render that fails perspective or proportions; current solution is custom editable SVG with purposeful interactivity.

## 3. Current site / file map

**Repo is a static site.** No bundler, Next.js, React or backend. GitHub Pages serves `index.html` directly.

| Responsibility | Files and notes |
|---|---|
| Entry and section DOM | `index.html` — head stylesheet/script order is the authority. `#intro` hidden on first load, `.hero`, `#cinema-wrap`, `#work`, `#event-photo-section`, `#expertise`, `#about`, `#contact`, footer, dialogs. |
| Base design | `assets/styles.css`, `chapter-one.css`, `living-motion.css`, `refinement.css`. |
| Work gallery and modal | `assets/gallery-rebuild.css`, `assets/work-gallery.js`. |
| Video montage and floating project thumbnails | `assets/chapter-montage.css/.js`, `chapter-one.js`, `showreel-clean.css`. Avoid breaking the 5-second excerpt sequencing/Next button and official YouTube player. |
| Touch/mobile adjustments | `assets/mobile-polish.css` and mobile media queries in subsequent cascade sheets. |
| Hero secret flip | `assets/portrait-flip.css/.js`, `assets/living-motion.js`; owner portrait `assets/fiqri-portrait-bw.webp`. |
| Easter eggs | `assets/easter-eggs.css/.js`; logo triple-click, project secret notes, “last frame.” |
| Color history / visual direction | `color-study-01.css` (copper experiment), `premium-restraint.css` (over-restrictive phase), **`electric-cinema.css/.js` (current lighting/color)**. Both older sheets still load for cascading overrides; don't assume they are the final tokens. |
| FIRST blueprint / mini room implementation | `assets/creators-lab.css/.js`. Some old selectors from initial design remain; the later CSS is authoritative. |
| **CURRENT** blueprint / room / thumbnails / spotlight | **`assets/craft-refinement.css`**, the LAST stylesheet in `index.html`; overrides prior layout. |
| Room artwork | **`assets/creator-workspace.svg`**, original first-party SVG, **920×560** viewBox. Loaded by `creators-lab.js` via `fetch("assets/creator-workspace.svg?v=2.0.0")`. |
| Browser regression | `.github/workflows/ui-smoke.yml`, `scripts/color-study-smoke.mjs`, `easter-eggs-smoke.mjs`, `ui-smoke.mjs`, `montage-smoke.mjs`, `atmosphere-smoke.mjs`, `creators-lab-smoke.mjs`. |
| Legacy particles | `assets/editorial-atmosphere.css/.js` remain in repository, **NOT loaded in index.html**. Do not accidentally relink. |

**Important style debt:** Many versioned CSS layers plus `!important` overrides accumulated during rapid design iterations. Consolidation would be valuable, but **only after screenshot/behavior parity** and preferably with a dedicated refactor branch. Do not "clean up" by deleting the late `craft-refinement.css` layer, or the page will revert to rejected designs.

## 4. Exact current behavior: Chapter One blueprint

The owner originally liked the film thumbnails and wants **real footage as the core visual**.

- `#cinema-wrap` is the sticky cinematic chapter containing real YouTube previews, main `.cinema-frame.showreel-shell`, caption/Next, and three `.float-reel-card` work stills in `index.html`.
- Original project cards in the composition, source posters:
  - `.float-reel-card--one`: PRODUCT MOTION; `https://i.ytimg.com/vi/DkounxK31EU/hqdefault.jpg` (a project still).
  - `.float-reel-card--two`: EDITORIAL STORIES; `https://i.ytimg.com/vi/c7GCJP2GcEE/hqdefault.jpg`.
  - `.float-reel-card--three`: EVENT FILMS; `https://i.ytimg.com/vi/c9wCgrjlUhk/hqdefault.jpg`.
- Latest composition in `craft-refinement.css`: at desktop >=1100px show **three** smaller floating previews placed on opposing sides of the showreel. At 701–1099px show **two**, third hidden. At <=700px show **two** smaller horizontal thumbnails beneath film, leaving footage unobstructed.
- `.fq-blueprint` is a **full-section transparent overlay** (`position:absolute; inset:0; background:transparent; border:0; pointer-events:none`), NOT a box. Inside `index.html`: `.fq-blueprint__schematic` drawing with technical lines, guide marks, connector paths; `.fq-blueprint__annotation--one/--two/--three` positioned around scene; `.fq-blueprint__sequence` stage labels.
- Current labels describe process (source footage, arrange/refine, delivery). `assets/creators-lab.js` changes blueprint `data-phase="capture|craft|deliver"` on scroll; CSS accents one phase. On mobile large annotations are hidden while slim process labels and lines remain.
- Blueprint is a *visual language*: think editor's cut path, crop/frame coordinates, tracking, sequence markers and production diagrams. It should relate visually to clips, framing and what an editor does. **Don't put another boxed `fq-blueprint` card on top of the video**.
- Future improvement if owner asks: make guide lines feel dynamically attached to the moving thumbnails / frame, clarify raw vs crafted footage, use authentic material and concise labels, careful occlusion and depth. Don't fabricate real project metrics or non-existent footage.

## 5. Exact current behavior: About Me 2.5D interactive mini editor

This is the most sensitive design area because the first version had serious composition problems.

- `#about .about-grid` contains `.fq-studio-column` and body/career copy. Latest CSS allocates ~1.5fr artwork / .88fr copy on desktop; stacks on <=900px.
- `#fq-studio` contains head, `#fq-studio-art`, three buttons (`data-studio-mode="edit|render|coffee"`), and `#fq-studio-note` with `aria-live="polite"`.
- Current SVG: `assets/creator-workspace.svg`, viewBox **0 0 920 560**. Carefully ordered:
  1. background wall + window, shelf and wall art;
  2. two full monitors with editing screen and render output;
  3. a broad centered desk and keyboard, PC/case and chair;
  4. mini Fiqri with headphones, dark hair, blocky/pixel features, independent arm/head groups on right;
  5. coffee mug with steam; small editorial scene metadata.
- This is **layered, interactive 2.5D SVG**, not a Three.js voxel mesh. Avoid claiming free camera orbit or true 3D rotation. Pointer moves camera by approx +/-3.3 degrees Y / +/-2.2 degrees X with CSS variables `--fq-room-ry/-rx`. On touch, scene interaction works through taps and control buttons.
- Click/tap/focus hotspots: `[data-studio-object="screen"]` returns to edit mode; `render` shows render progress; `coffee` pauses monitor playhead, animates steam, moves avatar toward the mug; `avatar` triggers wave + “Oh, hey there!” response. SVG groups are keyboard accessible with Enter/Space.
- Button states (Edit/Render/Coffee) are reflected in `aria-pressed`, `#fq-studio[data-mode]` and the live note. Rendering progress bar restarts if Render pressed again.
- Animations are CSS keyframes in `craft-refinement.css`; reduced-motion rules disable them. `creators-lab.js` uses `fetch` and `DOMParser` to import first-party SVG; serving page via `file://` may break fetch—use local HTTP server instead.
- The user's fundamental complaint was **messy layer overlap, cramped non-symmetric layout**. Before changing graphics, take screenshot at 1440px and 390px; check entire room, desk geometry, character proportions, z-order, hit-targets, legibility of details. A room with *more* detail is not necessarily better.
- Owner has not said the latest room is perfect; treat it as **working V2**, not a finished character-design approval.

## 6. Exact current behavior: hero photo / Easter eggs

- Black/white `fiqri-portrait-bw.webp` remains hero visual, with photographic staging and subtle pointer tilt.
- `assets/living-motion.js` writes CSS `--hover-x` and `--hover-y` along with tilt and glare. In `assets/craft-refinement.css`, `.portrait-card__face--front::after` uses a soft radial spotlight at those coordinates, exposed on fine-pointer hover. It is meant to illuminate the actual image and follow the cursor.
- The entire card is still clickable via accessible button `.portrait-card__flip-button`; `portrait-flip.js` toggles `.is-flipped`, flipping inner rotator and its outline. Back: personal note beginning “Just an introvert who loves the art of life.” **No visible “tap to flip” hints.**
- Other hidden interactions: click FQ. logo 3 times = Director's Cut dialogue; sustained hover/hold on selected work cards = notes; reaching footer = “You made it to the last frame. Thanks for staying.” Preserve their light footprint and accessibility.

## 7. Deployment, QA and sources of truth

### Run locally

```bash
git clone https://github.com/traff22/fiqri-portfolio.git
cd fiqri-portfolio
python3 -m http.server 4173
# Open http://127.0.0.1:4173/
```

The repository has no package manifest/build pipeline. CI installs Playwright ad hoc. From a separate shell, if Node/Playwright are available:

```bash
npm install --no-save playwright@1.56.1
npx playwright install chromium
node scripts/color-study-smoke.mjs
node scripts/easter-eggs-smoke.mjs
node scripts/ui-smoke.mjs
node scripts/montage-smoke.mjs
node scripts/atmosphere-smoke.mjs
node scripts/creators-lab-smoke.mjs
```

GitHub Actions workflow: [`.github/workflows/ui-smoke.yml`](https://github.com/traff22/fiqri-portfolio/blob/main/.github/workflows/ui-smoke.yml). It starts localhost:4173, runs Chromium tests at **desktop 1440×900**, **mobile 390×844**, and **compact 320×740** where applicable; uploads `gallery-screenshots` artifact (GitHub Actions artifacts expire). Inspect latest workflow and screenshots after any meaningful revision.

### Last VERIFIED website checkpoint
- `edbc3b1e` website commit (Nov 5, 2026 UTC / Nov 6 WIB).
- [Pages successful run #42118369949](https://github.com/traff22/fiqri-portfolio/actions/runs/42118369949).
- [Portfolio layout smoke test successful run #42118369546](https://github.com/traff22/fiqri-portfolio/actions/runs/42118369546).
- Documentation files `CLAUDE.md` and this handoff came later and did **not** modify website behavior; verify current HEAD before starting work.

### Visual QA expected, not optional
- Hero: spotlight tracks pointer on front portrait, photo remains readable, flip + rotating outline still works; no visible hint.
- Chapter One: multiple real thumbnails visible by breakpoint (3/2/2), do not collide with main film/headline/CTA; transparent blueprint annotations serve as frame accents, not a box; video remains real and playable.
- About: scene well-proportioned and visually believable; no overlap/cropped avatar/desk; Edit/Render/Coffee and SVG hotspots respond on desktop, touch, keyboard; mobile screenshot legible.
- Gallery: 15 projects / 4 selected highlights, categories and event dialogs intact. YouTube player is real; never falsely claim generic placeholder footage is a real client outcome.
- Check a11y, prefers-reduced-motion, Safari/mobile scroll behavior, horizontal overflow, asset network errors, no heavy unnecessary dependency.

### Content, client permissions, SEO
- Public repo and Pages domain make any checked-in media publicly reachable; verify rights to employer/client footage and photographs.
- `index.html` has `<meta name="robots" content="noindex, nofollow">` intentionally. Owner should approve removing it when visuals/content are publication-ready.
- Original `README.md` includes outdated first-preview instructions (`traff22.github.io/fiqri-portfolio`) and older V1.8 particle direction; **do not let this override current domain or art direction**.
- `CNAME` already contains `fiqriapriandi.art`; do not break GitHub Pages DNS/custom domain.

## 8. Risks and design-quality questions for next Claude session

Prioritize an **audit in plan/read-only mode** before changing anything. Suggested questions:

1. At 1440px and 390px, does the mini room *actually* read as a coherent perspective, not just a collage of shapes? Does mini Fiqri feel like a memorable character and occupy the right scale? Are hotspots intuitive without overloading the room?
2. Are blueprint callout lines visually *anchored* to actual footage cards and editorial process? Are 3 thumbnails placed with intentional hierarchy rather than random overlap? Would 16:9 playback still be the focal point?
3. Is portrait spotlight flattering and subtle, and does it coexist with the flip/tilt and performance budgets?
4. Can layered CSS specificity be consolidated safely, preserving screenshot parity and authored details?
5. How would true **voxel 3D** (e.g., custom 3D mesh of the room/character) compare to this lightweight 2.5D SVG in craft, load time, touch responsiveness, maintainability, accessibility? Propose this upgrade only if it would materially improve quality and the owner approves the tradeoff.

**Don't restart design exploration from generic moodboards or overwrite live sections in one giant pass.** The owner wants deliberate, stepwise iteration and honest visual critique.

## 9. Migration handshake / what Claude should answer first

Before editing code, respond in Indonesian:

1. Briefly explain the timeline of rejected versus accepted directions, **especially copper/particle/minimal vs Electric Cinema**, the unboxed blueprint, real thumbnails, SVG mini room, and hero spotlight.
2. List exact responsible files and current limitations (SVG 2.5D vs genuine 3D; current styling debt; possible aesthetics still awaiting approval).
3. Explain which first visual issue you would prioritize, grounded in current screenshots. Present a small, testable plan.
4. **Do not claim a complete redesign, build, deployment or visual QA until actually performed.** Ask no repeated preference questions: the owner's requirements above are already answered.

After each future owner-approved iteration, append a dated entry here summarizing exact feedback, implementation, QA, commit and any rejected idea. Keep this file updated so subsequent sessions never have to reconstruct the full conversation again.
