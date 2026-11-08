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

---

## 10. Iteration log

### 2026-11-06 (WIB) — Chapter One "Cutting Room Marks", checkpoint 1 (Claude Code)
**Branch:** `ccr-b4af4c1b-o7t4qv` (not merged to `main`, not deployed). **Owner visual approval: pending.**

**Audit findings that drove the change (screenshots 1440/1920/1180/390/320):**
- The old blueprint was a fixed 1200×720 SVG with `preserveAspectRatio="none"`, while thumbnails were placed with CSS `%`/`clamp()`. The lines only lined up at one viewport: at 1920 an arrow ran through the Editorial card, and at 1180 most lines were hidden behind the film.
- At full scroll zoom the film covered the EVENT card, the "03 / FINAL DELIVERY" label and the edge title. At 900px tall the caption/Next strip was cut off at the bottom.
- Process labels (Source → Arrange → Final delivery) sat next to project-category cards, so "Event Films = final delivery" read as one story. That was confusing.
- On mobile the blueprint was effectively invisible, and the two thumbnails were stranded at the far left/right edges.

**Owner decisions (this session):**
1. Start with Chapter One. Concept "Cutting Room Marks" was accepted: the blueprint shows *a source clip being cut into the film*, not decoration.
2. **PRODUCT thumbnail is 16:9** (it was a 9:16 crop). Note: its project, *ADS Astronacci — Bitcoin Almanac 2025*, is a vertical short. Its YouTube still is shown with `object-fit: cover`, so check the real crop on the live site.
3. **Thumbnails are clickable** and open the existing Selected Work dialogs (video or event).
4. Work in two checkpoints. Checkpoint 1 = structure only. Checkpoint 2 = montage sync (the active category lights its clip and draws its line), line-draw animation, and crop marks on the frame.

**Implementation:**
- `assets/chapter-blueprint.css` (NEW, loads LAST) owns Chapter One:
  - Film width is capped by side lanes **and** viewport height, so the caption strip always stays on screen at zoom 1.13.
  - Thumbnails are positioned from the film's zoomed edges (CSS vars `--fq-frame-w/--fq-yc/--fq-hh/--fq-hw/--fq-side/--fq-gap`).
  - Layouts: ≥1100 three cards in lanes; 701–1099 landscape two cards in lanes; phones and portrait tablets two cards docked under the film with short vertical cut lines.
  - The "Explore selected work" CTA moved into the right lane.
- `assets/chapter-blueprint.js` (NEW):
  - Measures real `getBoundingClientRect()` boxes and draws orthogonal connectors with `]` OUT / `[` IN marks (labels are dropped when a line is too short). Redraws on scroll, resize and ResizeObserver.
  - Thumbnail buttons click the matching `#work .work-card[data-project] .work-trigger` and return focus to the thumbnail when the dialog closes.
- `index.html`:
  - Static schematic, the 01/02/03 category annotations and the "EDITORIAL ANATOMY" edge title were removed. The INGEST / CUT / GRADE / FINISH ruler is kept (now 10.5px) and still driven by `data-phase` from `creators-lab.js`.
  - Card meta now reads `SRC · MOTION / LONGFORM / EVENT`, plus an accessible `<button class="float-reel-card__open">`.
- `assets/craft-refinement.css`: Chapter One rules moved out (not stacked again). About and spotlight rules are untouched.

**Trade-off to watch:** at 1440×900 the film starts at ~806px wide instead of ~868px. That buys clear lanes and a fully visible caption strip at full zoom. It is larger at 1920×1080.

**QA:**
- New `scripts/chapter-blueprint-smoke.mjs` (added to CI) passes at 1440×900, 1920×1080, 1180×820, 768×1024, 390×844 and 320×740 at scroll 0/0.5/1. It checks:
  - no thumbnail/film/CTA collision;
  - the strip stays inside the viewport;
  - every connector starts at a thumbnail edge and ends at the film edge;
  - all thumbnails are 16:9;
  - clicking a thumbnail opens its dialog and focus comes back.
- Other suites pass locally: color-study, easter-eggs, montage, atmosphere, creators-lab.
- `ui-smoke.mjs` is flaky in the Claude sandbox **on baseline too**, because YouTube is blocked there ("Preview unavailable"). With the YouTube API stubbed it passes fully on both baseline and this branch.
- Real YouTube stills could not be viewed from the sandbox. **Verify the real imagery in CI screenshots or on the live site.**

### 2026-11-06 (WIB) — Chapter One checkpoint 2: follow the edit (Claude Code)
**Branch:** `ccr-b4af4c1b-o7t4qv` (still not merged to `main`, not deployed). **Owner visual approval: pending.**
**Owner instruction:** "Gas lanjut", read as: continue to checkpoint 2 on the same branch, without merging.

**Implementation:**
- **The blueprint follows the edit.**
  - `chapter-montage.js` now announces the category of each shot it shows on `#cinema-wrap` (`data-active-category` plus a `fq:shot` event). The categories are motion, longform and event.
  - It announces "none" when previews stop, are blocked or are unavailable. Montage order and playback are unchanged.
  - `chapter-blueprint.js` maps motion→PRODUCT, longform→EDITORIAL, event→EVENT. The matching clip gets `.is-source` (teal border and soft glow) and its cut line redraws into the frame in 0.62s (`stroke-dashoffset` with `pathLength="1"`). The IN mark fades in at the end of the draw.
  - Other clips step back (opacity .58, desaturated, full again on hover/focus), and their lines drop to 35%.
  - If the matching clip is hidden at that breakpoint (EVENT on tablets/phones), everything stays neutral. Without real playback everything stays neutral too; we don't fake a "source".
- **SVG nodes are persistent** (created once, attributes updated on scroll), so the draw animation isn't restarted by scrolling.
- **Crop marks:** print-style offset ticks outside the picture's corners, plus rule-of-thirds ticks above the frame. They are never drawn over footage. Bottom corners get horizontal ticks only, because the caption strip sits there. They are skipped on phones, where they cluttered the INGEST/CUT/FINISH ruler.
- **Reduced motion:** the highlight state still applies, with no draw or fade animation.
- **Bug fixed (also present in checkpoint 1):** the connector group class `.fq-blueprint__cut` clashed with a legacy rule in `creators-lab.css` (animated dashed 2px stroke). That garbled the OUT/IN marks and labels. The group is renamed `.fq-blueprint__clip`. **Don't reuse `fq-blueprint__*` names from `creators-lab.css`** (`top, drawing, base, mesh, guide, cut, wave, sweep, steps, step, footer, caption`).

**QA:**
- `chapter-blueprint-smoke.mjs` now also checks: longform lights EDITORIAL and dims the others; event lights EVENT on desktop and stays neutral where EVENT is hidden; everything returns to neutral without playback; crop marks exist on ≥700px.
- `montage-smoke.mjs` asserts that the opening long-form film lights the editorial clip.
- All suites pass locally. `ui-smoke` was run with the YouTube API stubbed, because YouTube is blocked in the sandbox.
- Real thumbnails and real playback still need checking outside the sandbox.

### 2026-11-06 (WIB) — Blueprint background fill + 3D voxel About room, merged to live (Claude Code)
**Owner feedback (verbatim intent):**
- "review sekilas apakah masuk logika dan perintah gw mau blueprintuh biar belakangnya nggak kosong kesannya". Honest review: the connectors were logically right, but the large background areas were still empty, so the intent was only partly met.
- "Animasi little about me itu gw pengen 3 d voxel interactive dan jalan sendiri nggak perlu di card gitu ... sebelumnya gpt kureng". Owner authorised merging straight to live ("langsung merge ke live karna webnya juga belum ku sebar").

**Chapter One background:**
- A drafting-paper grid sits on `.fq-blueprint::before`: 24px minor / 120px major lines, centred on the film and radially masked, so the connectors and labels are never faded.
- A construction drawing is computed from the real film box:
  - dashed extension lines from the picture edges, stopping before the headline, ruler and CTA;
  - a dash-dot centre line;
  - a `16 : 9` dimension line under the caption strip;
  - registration targets top-right and bottom-left, skipped where a thumbnail sits.
- Phones keep only the grid.

**About — 3D voxel room (`assets/voxel-studio.js`, `assets/voxel-studio.css`):**
- Everything is built from first-party voxels with InstancedMesh, using an orthographic isometric camera:
  - room with plinth, window over Jakarta at night, walnut desk, two monitors with live canvas feeds (timeline with playhead / program monitor / render bar / "BRB");
  - warm desk lamp as a real light, PC with teal LED, chair, coffee station, shelf with books and a clapperboard, "FQ." poster, plant, camera on a tripod with blinking REC.
- Mini Fiqri follows the portrait: black swept fringe falling to one side, charcoal sweater, white collar, ears and nape visible (hair replaces skin voxels, so no helmet silhouette).
- Autonomous loop: edit 9s (typing, glances over the shoulder) → render (leans back, hands behind head, render bar to "EXPORTED") → edit 7s → coffee (stands, walks, picks up the mug in the right hand, turns to the camera, sips twice with voxel steam, returns the mug, sits).
- Interaction:
  - drag turns the room (azimuth, plus elevation on mouse);
  - clicks on the left monitor = edit, right monitor = render, coffee or mug = coffee, Fiqri = wave (the chair spins to face the viewer);
  - the buttons trigger the same actions.
- Autonomous state changes update the note with `aria-live="off"`; visitor actions use `polite`.
- Paused off-screen and in hidden tabs. `prefers-reduced-motion`: no autonomous routine and no camera drift; poses switch instantly.
- Lazy-loaded: Three.js r170 is vendored (`assets/vendor/three.module.min.js`, ≈690KB, ≈171KB gzipped, MIT licence alongside) and only fetched when About is within 700px of the viewport. Without WebGL, the SVG room is used.
- No card: `#fq-studio` has no border/background/shadow and the header strip is hidden. The diorama floats on a light pool with a contact shadow. Buttons are quiet chips.

**QA:**
- `creators-lab-smoke.mjs` rewritten to test the voxel path at 1440 / 390 / 320:
  - canvas present, no card, real rendered pixels;
  - the autonomous routine reaches "render" after the first edit, and those changes are not announced;
  - coffee / render / wave (keyboard) / edit buttons work;
  - SVG fallback with WebGL stubbed out, hotspots and buttons working.
- A separate in-scene click probe hit all four targets.
- Reduced motion stays on "edit" after 20s.
- All suites pass locally (`ui-smoke` with the YouTube API stubbed). The SwiftShader frame rate in the sandbox is very low (software GL), so real-device smoothness must be checked live.

**Open points for the owner:**
- Is mini Fiqri's likeness close enough?
- Is the room palette too blue overall?
- Should the drafting grid sit behind the headline, or be masked away from it?

### 2026-11-06 (WIB): skills installed, anti-slop audit 001 and fixes (Claude Code)
**Owner request:** "gunakan taste skill, anti-slop, humanizer agar web kita semakin oke". The owner installed `Leonxlnx/taste-skill`, `miqdadbadjuber/anti-slop` and `blader/humanizer` (in `.claude/skills/`, committed without the taste skill's 40MB of demo assets) and chose antislop mode **AFTER**: audit first, then fix only the numbers the owner picks.

**Audit:** `anti-slop/audit-001-2026-11-06.md` (numbered findings and the R-37 conflicts between the skills and the owner's direction).

**Owner decisions:**
- Fix items 1–8, 12, 14, 15, 16 and 17.
- K1: new blue-black palette (iris/violet retired).
- K2: the drafting grid gets a lens bulge and a blurred vignette.
- K3: parallax stays. K4: portrait tilt stays.
- K5: the theme follows the time of day, including the animations.
- K6: portrait back = only "Just a person who loves the art of life.", small, bottom-left corner.
- Not selected (left as is): 9 (typeface), 10 (✦), 11 (glow), 13 (glass).

**Implementation:**
- `assets/design-system.css` (new, loads last): tokens, daypart moods, radius scale 6/12/18, chapter labels, 44px targets, the infinite-loop kill, portrait back, What I do layout, poster-failure state.
- `DESIGN.md` (new): the single source of direction with reasons.
- Copy rewritten across `index.html`, with no em dashes.
- Showreel Pause/Play in `chapter-montage.js`; room Pause/Play in `creators-lab.js` with `voxel.setPaused`.
- Lens grid canvas and blur vignette in `chapter-blueprint.js/.css`.
- Voxel palette and daypart lighting in `voxel-studio.js`.
- Shared `[data-open-project]` opener in `work-gallery.js`; What I do rebuilt with real project evidence.
- Image dimensions everywhere.

**QA:**
- New `scripts/design-system-smoke.mjs` (in CI) covers copy dashes, arrows, touch targets, both pause controls, the lens canvas, What I do evidence, the portrait back line and daypart grounds.
- `color-study-smoke.mjs` updated to the new tokens.
- All suites pass locally (`ui-smoke` with the YouTube API stubbed).
- Re-measured: dashes 10→0, images without dimensions 20→0, uppercase labels 16→0, running infinite animations 3→0, mobile targets under 44px 12→1 (the off-screen skip link).

**Still open:** item 9 (typeface, see DESIGN.md), contrast of text over real photos (not measurable in the sandbox), and real-device feel.

### 2026-11-06 (WIB): typeface (audit #9)
**Owner:** "Gas #9 ganti font juga."

- Archivo variable (condensed, bold title-card headlines; normal width for text) and a Newsreader Italic accent, both self-hosted in `assets/fonts/` (OFL licences included). The main Archivo file is preloaded; the Google Fonts `@import` in `styles.css` is removed. The font names were renamed in source across the linked stylesheets.
- Reasons are in DESIGN.md, Typography.
- **Pitfall hit and fixed:** inserting CSS inside the header comment of `design-system.css` silently broke the whole file. Keep new blocks *after* the closing `*/`.
- Also fixed a pre-existing montage shuffle bug (the opening film could repeat as the third shot).

### 2026-11-06 (WIB): audit #10, #11, #13 and opening titles
**Owner:** fix #10, #11 and #13, and make sure there is a splash screen on first open.

- Sparkles removed.
- Glow limited to the showreel frame (rest) and the portrait (hover).
- Glass limited to the top bar and the lens vignette; dialog backdrops are now solid.
- The old intro (centred text, rotating orbit ring, Enter button) was disabled on first load. It is replaced by new opening titles (`#intro.fq-splash`, `assets/splash.css`, logic in `assets/main.js`): timeline with IN and OUT, a condensed name title card, playhead and 24 fps timecode, letterbox opening. They play once per session and are decided in `<head>` with `html.fq-splash-on`.
- Existing tests set `fiqri-intro-seen` before load; `design-system-smoke.mjs` tests the titles themselves.

### 2026-11-06 (WIB): editor-style opening titles, showreel pause still, WhatsApp glyph, CI timeout
**Owner:** "Buat splashscreennya kaya khas video editor gitu dan menarik agak nyeleneh lucu gpp"; "preview tengah di chapter one itu nggak bisa hilang button playnya? Atau title youtube?"; "logo whatsapp itu aneh gepeng".

- **Opening titles rebuilt as a mini edit window:** V2/V1/A1 clips, a razor cuts out "boring part" and the rest ripples, the playhead runs over the title clip and reveals the name, and the render sticks at "it's always 99%" before export. Then the letterbox opens. 3.8 s; details in DESIGN.md.
- **Showreel paused:** a paused YouTube player shows its own play button and title, so Pause now hides the player and shows our still (the project's YouTube thumbnail, maxres then hq).
- **YouTube UI, honest limit:** the player already uses `controls:0`, `rel:0` and `iv_load_policy:3`, and pointer events are off, so hover does not show the title. YouTube still shows the title and channel briefly when a clip starts. YouTube's policies do not allow covering or cropping player elements, so we do not mask them. The clean fix is **native clips**: the owner exports short silent MP4/WebM teasers (about 5 s each, 720p) of his own films, and they replace the embeds in Chapter One. Not built yet; waiting for the owner's clips.
- **WhatsApp:** the hand-drawn icon was replaced with the official glyph (Simple Icons, CC0), locked square at 26×26.
- **CI:** the run for `1b486d7` was cancelled, not failed. Installing apt and Chromium took 8m48s and hit the 10-minute job limit about 1.4 minutes into the tests. `timeout-minutes` was raised to 25. Tight waits in `design-system-smoke.mjs` were also loosened for slower runners.

### 2026-11-06 (WIB): ideas round, items 1, 2 and 10
**Owner:** asked for ideas to make the site better (illustration included), then "Gass i'll tryna believe u", which accepted the recommended order 1 + 2, then 10. Item 11 (CSS consolidation) is deliberately kept for its own session with screenshot parity.

- **#1 Monitor plays real work:**
  - `chapter-montage.js` `fq:shot` now carries `{id,title}`.
  - The voxel program monitor shows that film's thumbnail (pixelated, CORS) or cycles through the highlights. Clicking it opens the project; the PC tower is the in-scene Render.
  - Verified with the thumbnail CDN stubbed by a local image carrying CORS headers: no canvas security errors.
- **#2 Cameos:**
  - Mini Fiqri stills come from the voxel model (`api.cameo(pose,frame)`, `tools/render-cameos.mjs`). The cameo camera is lower than the room's so the face reads.
  - Contact: a wave, played when you arrive and when you reach for a contact link. Footer: asleep at night, otherwise a coffee sip. Finite flips; reduced motion keeps the first frame.
- **#10 Share card + icons:**
  - `og-card.jpg`, favicons and the apple-touch icon, rendered from `tools/og.html`.
  - OG/Twitter meta (`summary_large_image`); theme-color `#04060a`. `noindex` untouched.
- **QA:** `design-system-smoke.mjs` adds cameo (loaded, no overlap with painted contact text/controls), share card and icon serving, the robots guard and the night footer pose. All suites pass locally.

### 2026-11-06 (WIB): CSS clean-up (idea #11)
**Owner:** "Gas #11 rapihin CSS sekarang."

**Method:**
1. A deterministic screenshot parity harness: 24 shots covering 1440/390/320 full page, the "All work" filter, the flipped portrait, the video and event dialogs, Director's Cut, the mobile menu, the no-WebGL SVG room and a frozen splash frame. It runs with reduced motion, `?daypart=night`, the YouTube API blocked and thumbnails from a local file, with the random canvases hidden. Two baseline runs differ only in ~40 px of the splash playhead (known noise).
2. `tools/prune-css.cjs` (PostCSS) removes only selectors that can never match: the class, id or attribute value appears in no HTML or SVG attribute and in no JS string literal (inline `<script>` included). Selector lists keep their live members; unreferenced `@keyframes` go.
   - A first pass wrongly marked the daypart selectors, because the inline head script had not been scanned. Fixed before writing.
   - No dynamically built class names exist (checked).
3. After writing, parity was identical in 23/24 shots. The splash shot differs only by the known noise in the same box.

**Result:**
- 258 dead rules, 12 trimmed selector lists and 11 unused keyframes removed (old intro, portrait side cards, the first blueprint, the old SVG room animations, old montage credits, the old Expertise grid, the old portrait back).
- CSS 228.7 KB → 203.6 KB (gzip 54.5 KB → 49.3 KB); `!important` 933 → 892.
- All smoke suites pass.

**Guard:** CI runs `tools/prune-css.cjs . --check`, verified to fail on an injected dead rule.

**Not done (on purpose):**
- Reducing `!important` and merging stylesheets. That means untangling the cascade file by file, and should be its own project with the same parity harness.
- Hidden legacy DOM (cinema atmosphere spans, portrait skills) is also left in place, because existing tests still assert on it.

### 2026-11-06 (WIB): ideas #5 and #6, built as ready slots
**Owner:** "Gas semua".

Both items need the owner's own footage, which is not in the repo; YouTube is blocked in the sandbox, and clipping client films without his files is not appropriate. So the systems are built and tested, and they switch on as soon as he adds files:
- **#5 native reel:**
  - `assets/reel-native.js` reads `assets/reel/clips.json`, currently `[]`.
  - With clips, Chapter One plays them as plain video (WebM preferred, MP4 fallback): no YouTube title, logo or play button.
  - It keeps the clock, progress, Next and Pause, emits `fq:shot` with category and YouTube id for the blueprint and the voxel monitor, and honours an `opening` clip.
  - `chapter-montage.js` waits for that decision; if every clip fails, `fq:reel-fallback` hands back to YouTube.
- **#6 colour grade slider:**
  - `assets/grade-compare.js` with `assets/grades/grades.json`, currently `{}`, inside the video dialog. `work-gallery.js` now sets `videoDialog.dataset.project`.
  - Native range input; labels are configurable.
- **Owner guides with export specs and ffmpeg commands:** `assets/reel/README.md` and `assets/grades/README.md`.
- **QA:**
  - New `scripts/media-slots-smoke.mjs` (in CI) uses synthetic fixtures (`scripts/fixtures/reel` ffmpeg colour clips, `scripts/fixtures/grades` derived from an event photo). It checks native mode (no iframe, no YouTube request, opening clip, Next, Pause/Play), the fallback to YouTube when clips fail, and the slider (listed project only, keyboard moves it).
  - The parity harness shows the live page unchanged while both lists are empty. All suites pass locally.

### 2026-11-06 (WIB): footer cameo removed, screenplay section cuts
**Owner:** "Yang terakhir you made it to the last frame nggak usah ada voxel jelek, dan yang gw pengen tuh kek setiap section dibagi sama sesuatu yang nggak garis flat doang ada kesan apa yang sesuai dan paralax gitu setiap di scroll yang baguss research".
- **Footer cameo removed.** The "You made it to the last frame" note is text only again. The fin logic and the coffee/sleep frames are gone from `assets/cameos.js` and `assets/cameos/`; `tools/render-cameos.mjs` renders only the wave. `design-system-smoke.mjs` now asserts the footer has no voxel image (the night-pose check is dropped). Do not put a cameo back there.
- **Section cuts.** Research (scroll-driven filmstrip / parallax showreel patterns; scroll parallax kept small, reduced motion honoured) led to a divider that is about editing, not decoration: screenplay transitions plus a strip of the real work. See DESIGN.md "Section cuts" for the rules.
  - Files: `assets/section-cuts.css` (loaded before `splash.css`), `assets/section-cuts.js` (rAF on scroll, only for cuts in view), five `.fq-cut` blocks in `index.html` (cut 3 sits before the closed project dialogs, hence the `.fq-cut ~ dialog + section` rule).
  - Removed the 1px border-top on sections after a cut: those were the flat lines the owner disliked.
  - Chapter One is pinned and its tests measure scroll span, so `#cinema-wrap` keeps zero padding; cut 1 is lifted 32px, cut 2 starts at the scene's end.
- **QA:** new `scripts/section-cuts-smoke.mjs` (in CI): five cuts in chapter order, a slug each, strips filled, strip moves with scroll (still under reduced motion), no heading/text/control under the strip, no horizontal scroll, at 1440, 390, 320 and reduced motion. All other suites pass locally (ui-smoke with the YouTube mock), and `prune-css --check` is clean. Local screenshots use a stand-in image because the sandbox blocks `i.ytimg.com`; live, the strips show the real thumbnails.

### 2026-11-06 (WIB): section cuts redone as plain slanted shapes
**Owner** (on the film-strip version): "Jelek aneh gajelas gw cumn pengen shape aja kaya agak mirinh paralax dll yang enak simple, jangan ada repeating aneh strip film lah dll jangan seperti itu pahami dah".
- **Rejected and removed:** the film strip, the screenplay slugs ("CUT TO:" etc.), the timecode and the repeated thumbnail frames. Do not bring back literal film props as dividers; the owner wants shape, not illustration.
- **Now:** each chapter's top edge is a diagonal (`clip-path`, alternating side), overlapping the section above by `--slant` so the real grounds meet on the angle. One tinted plane behind each seam drifts with scroll (the only motion). Selected Work keeps its place under the pinned Chapter One. See DESIGN.md "Section cuts".
- **QA:** `scripts/section-cuts-smoke.mjs` rewritten: five slanted chapter tops, no flat border, the slant clips no content, the plane drifts with scroll (still with reduced motion), no horizontal scroll, at 1440/390/320 and reduced motion. All other suites pass locally (ui-smoke with the YouTube mock); `prune-css --check` clean.
- **CI note:** the first run of this commit failed in `chapter-blueprint-smoke` (mobile: "longform film did not light the editorial clip", source none). In CI YouTube is reachable, so the real montage announced its own `fq:shot` between the test's dispatched shot and its read. The test now blocks youtube.com (montage playback is covered by `montage-smoke`).

### 2026-11-06 (WIB): chair clipping fix, looping Contact cameo with new poses
**Owner:** "untuk voxel gw itu nembus kursi pas turun orangnya, dan pas melambai di have a story loop gerak voxel dan kasih beberapa pose nyeleneh lucu dan cool".
- **Chair:** `standUp()` used to slide him to `SEAT.z+1.6`, i.e. backwards through the backrest. Now he swivels chair and body a quarter turn toward the open side (+x), stands and steps to `SIDE` (seat x + 2.3). `sitDown()` walks to `SIDE`, turns his back to the seat as the chair swivels open, sits, then swivels back to the desk. New `api.figure` (position in the chair's frame) and `advance(sec, draw)` let `creators-lab-smoke` step through a whole coffee break and assert he never enters the backrest zone.
- **Contact cameo:** new poses in `api.cameo()`: `point`, `cool` (cameo-only `shades` prop on the head), `dab`, `jump`, plus the existing `wave`. `assets/cameos.js` loops them while in view; the cameo is now a `<button>` that pauses/plays (motion longer than 5 s needs a pause control). Contact link hover/focus jumps to `point`. Reduced motion: still wave, button disabled. Frames are cropped to one shared box by the new `tools/crop-cameos.py` (482x526).
- **QA:** `design-system-smoke` checks all five poses appear, tapping pauses, and the reduced-motion still; `creators-lab-smoke` checks the chair path. All suites pass locally; `prune-css --check` clean.

### 2026-11-08 (WIB): new easter egg, the editor shuttle (J K L)
**Owner:** "Claude research and give me the best easter egg like i do before but better and best".
- **Research:** the best easter eggs reward curiosity with something specific to the maker (Awwwards "easter egg" entries, playful portfolios like Bruno Simon's). For an editor the most specific gesture is the J/K/L shuttle every NLE shares (J back, K stop, L forward, repeat for speed).
- **Built:** `assets/editor-shuttle.css/.js`. J/K/L play the page; a transport bar shows timecode, chapter-as-clip, speed, J K L buttons and a chapter timeline; the end shows FIN and the "render" time. The Director's Cut now hints at it and has a "Play this page" button (the touch entry). Own scroll takes over, Escape closes, reduced motion = jump cuts. Existing eggs (logo triple-click, project notes, last frame, portrait flip, room actions) are unchanged.
- **QA:** `easter-eggs-smoke.mjs` adds EDITOR_SHUTTLE_PASS (K alone inert, L plays, L L = 2x, K stops, J rewinds, wheel takes over, Escape closes; reduced-motion touch path via the Director's Cut button cuts straight to Chapter One). All suites pass locally; `prune-css --check` clean.

### 2026-11-08 (WIB): AI robot in the voxel room + "Working with AI" copy
**Owner:** "skrng gw mau tambahin ai di voxel gw jadi kek ada 3d robot gitu dipojok terus jabarin gw jga gunain ai untuk beberapa case video dan memrealisasikan video yang imposibble jadi lebih cepat, dan intinya nunjukin gw awear sama ai juga".
- **Robot:** voxel hover-bot in `assets/voxel-studio.js` ("AI assistant" block), front-left corner (`BOT_HOME` 3.3, 9.3). Idle: bob, blink, antenna pulse, glance. New action `ai` (`aiAssist()`): Fiqri swivels to it, the bot rises and projects a canvas hologram of a mask being traced, Fiqri nods, swivels back. Tagged for clicks; also in the autonomous loop after coffee. Hidden in cameo renders.
- **UI:** new "AI assist" button in the room controls; `creators-lab.js` message "AI assist. The bot traces the mask in seconds. The cut is still mine." (`ai` is a passing state like `wave`).
- **Copy:** "Working with AI" block in About (`.ai-note`). The use-case list (masks/roto, cleanup, upscaling, transcripts/subtitles, previs) is a reasonable general list, **not confirmed by the owner**: ask which tools and real cases he wants named, and never invent client case studies.
- **Shuttle hardening:** arrow keys, Space, PageUp/Down, Home and End now also stop the J/K/L shuttle; the takeover test waits instead of racing (one flaky local run).
- **QA:** `creators-lab-smoke` adds the AI assist path (message, pressed state, hands back to edit). All suites pass locally; `prune-css --check` clean.

### 2026-11-08 (WIB): AI is also for generating impossible, fast footage
**Owner:** "coba add kaya bukan cuman buat masking or any, tapi juga generate imposibble dan fast footage".
- **Robot:** `aiAssist()` alternates two jobs (`holoTask`): mask tracing, then generating a shot (a pixel whale over the Jakarta skyline at night resolves block by block out of noise, "GENERATING n%" then "SHOT READY"). New passing state `ai-gen` with its own note: "A shot nobody could film, generated in minutes. I still pick the take." `trigger()` now names the actual job before the choreography starts (the button's announcement used to overwrite it).
- **Copy:** "Working with AI" now has a second paragraph on generated footage (impossible establishing shots, extra B-roll, effects plates, previs). Still a general list awaiting the owner's real tools and cases.
- **QA:** `creators-lab-smoke` presses AI assist twice: mask first, then the generate message. Suites pass locally; `prune-css --check` clean.

