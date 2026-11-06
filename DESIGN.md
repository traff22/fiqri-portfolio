# DESIGN.md: Fiqri Apriandi portfolio

The one place where the visual direction and its reasons are written down. Read it with `CLAUDE.md` before any visual change. Skills (`antislop`, `design-taste-frontend`, `humanizer`) are filters applied on top of this direction, not a replacement for it.

The tokens live in `assets/design-system.css`, which loads last.

## Design read

A personal portfolio for a Jakarta video editor and motion graphics designer. The audience is clients and recruiters hiring remotely. The language is cinematic: a dark screening room, real footage, and an editor's working marks.

**Dial: ENERGY 3 / RHYTHM 3 / MOTION 3.** The owner asked for cinematic parallax, a 3D room that runs on its own, and a lively, not flat, page. Motion is part of the brief, not an AI default.

## Identity motif

**Film chapters and editor's marks.** Sections are chapters (Chapter one to Chapter five, sentence case). Chapter One carries the editor's marks: `SRC` clips, `]` OUT and `[` IN cut lines, the INGEST / CUT / GRADE / FINISH ruler, crop marks, a `16 : 9` dimension line, and a drafting grid seen through a lens. These marks belong to Chapter One. They are not used as decoration elsewhere.

## Palette (owner decision 2026-11-06: blue-black)

| Token | Value | Role and reason |
|---|---|---|
| `--c-ink` | `#04060a` | Page ground. Near-black with a blue cast: a screening room, so footage carries the colour. |
| `--c-night` | `#080d16` | Section ground. |
| `--c-steel` | `#0e1727` | Raised surfaces: cards, the portrait back, frames. |
| `--c-blue` | `#2563eb` | **The one accent.** Primary buttons and active states. White on it is 5.2:1. |
| `--c-blue-soft` | `#7aa6ff` | The accent as text on dark (8.4:1): chapter marks, years, links. |
| `--c-ice` | `#cfe0ff` | Highlights: focus ring, the active source clip. |
| `--c-muted` | `#94a3b8` | Secondary text (7.9:1 on ink). |

The iris/violet palette is retired, as are copper and beige from earlier phases. The voxel room keeps a few small warm accents (walnut desk, lamp, terracotta pot, skin) because a room lit by a desk lamp needs warm light to read as a room.

## Time of day

`<head>` sets `html[data-daypart]` from the visitor's clock (`?daypart=dawn|day|dusk|night` overrides it for review):

| Daypart | Hours | What changes |
|---|---|---|
| dawn | 05–08 | Soft peach horizon light. The voxel window shows a low sun and the lamp is dimmed. |
| day | 08–16 | Lifted navy ground and brighter blue ambient light. The voxel window shows a blue sky, sun and clouds, the desk lamp is off, and the vignette is lighter. |
| dusk | 16–19 | Amber horizon light. The voxel window glows orange and the lamp is on. |
| night | 19–05 | The deepest black. The voxel window shows the moon and lit city windows, with the strongest lamp and screen glow. |

It stays one identity. Daypart changes the light, not the brand.

## Typography (owner decision 2026-11-06, audit #9)

- **Archivo** (Omnibus-Type, OFL), one variable family with weight 100–900 and width 62–125%, used for everything.
  - Headlines are set **condensed (72%), bold, slightly tight**. Condensed grotesques are the voice of film posters and end credits, so the chapter headlines read like title cards.
  - Body and UI use normal width, where Archivo is an even, readable text face.
  - One family keeps the system consistent and the payload small.
- **Newsreader Italic** (Production Type, OFL) is used only for the hero accent "worth feeling.". It is an editorial serif drawn for screens: the single human, handwritten-feeling note against the hard title cards.
- Both are **self-hosted** in `assets/fonts/` and declared in `assets/design-system.css`, with the main Archivo file preloaded. The Google Fonts `@import` (a render-blocking third-party request) is gone.
- Retired: Space Grotesk (a common AI-default display face), DM Sans, and the accidental Georgia fallback.

## Light and glass

- **Coloured glow on two focal points only:** the showreel frame (the film is the subject) and the portrait on hover. Everything else gets a plain elevation shadow.
- **Backdrop blur on two elements only:** the top bar, so text stays readable over footage, and the Chapter One lens vignette.
- No sparkle (✦) glyphs.

## Shape

The radius scale is **6 / 12 / 18**:
- 6: small controls such as Next, Pause and tags;
- 12: buttons, chips, cards and thumbnails;
- 18: big frames such as the showreel, portrait and project cards.

Round shapes are kept only for round icon buttons (the play cue). There are no pill buttons.

## Opening titles (splash)

The opening titles are an editor's first three seconds, a little tongue-in-cheek (owner: "khas video editor, menarik, agak nyeleneh lucu"). They use `assets/splash.css` and `assets/main.js` and take 3.8 s:
- A mini edit window opens on `fiqri_portfolio_FINAL_final_v7.mp4`. Clips land on V2 / V1 / A1.
- The razor drops onto V1 and cuts out **"boring part"**: it is struck through, falls off, and the rest ripples together.
- The playhead runs over the title clip, and "Fiqri Apriandi" comes up as a condensed title card.
- Status lines run: "Importing way too much b-roll…", "Cutting the boring part…", "Syncing audio by ear…", "Rendering… it's always 99%", "Exported. Enjoy the cut ✓". The render bar sits at 99% for a beat.
- The frame opens like a letterbox onto the site.

**Rules:**
- Skippable by the Skip button, a click anywhere, or Esc; replayable from "Replay intro".
- Never under reduced motion; once per session (`sessionStorage` key `fiqri-intro-seen`).
- Decided in `<head>` before first paint (`html.fq-splash-on`).
- Pure CSS, so it clears itself without JavaScript. JavaScript only writes the status, the percentage and the timecode, and locks scrolling while it plays.
- Under 5 s, so it needs no pause control (R-39).

## Light and glass

- **Coloured glow on two focal points only:** the showreel frame (the film is the subject) and the portrait on hover. Everything else gets a plain elevation shadow.
- **Backdrop blur on two elements only:** the top bar, so text stays readable over footage, and the Chapter One lens vignette.
- No sparkle (✦) glyphs.

## Shape

The radius scale is **6 / 12 / 18**:
- 6: small controls such as Next, Pause and tags;
- 12: buttons, chips, cards and thumbnails;
- 18: big frames such as the showreel, portrait and project cards.

Round shapes are kept only for round icon buttons (the play cue). There are no pill buttons.

## Opening titles (splash)

The opening titles play on the first open of a session (`assets/splash.css`, logic in `assets/main.js`). They take 2.6 s:
- an editor's timeline draws between `[` IN and `]` OUT;
- "Fiqri Apriandi" rises as a condensed title card;
- the playhead runs while a 24 fps timecode counts;
- the frame splits and opens like a letterbox onto the site.

**Rules:**
- They are skippable by the Skip button, a click anywhere, or Esc, and replayable from "Replay intro" in the footer.
- They never play under reduced motion, and they do not play again in the same session (`sessionStorage` key `fiqri-intro-seen`).
- `<head>` decides before first paint (`html.fq-splash-on`), so the page never flashes first.
- The sequence is pure CSS, so the titles always clear themselves even if JavaScript fails. Scrolling is only locked by JavaScript.

## Motion rules

- Purposeful motion: scroll depth in Chapter One, the lens bulging as the film zooms, the montage-synced source highlight, the voxel routine, and the portrait tilt and flip.
- Anything that runs on its own for more than 5 seconds has a pause control: showreel **Pause**, room **Pause**. Decorative infinite loops (hero light, poster ring, portrait drift) are removed.
- `prefers-reduced-motion`: the room stays still, the montage clips do not animate, the lens grid is static and the cut lines do not draw.

## Copy voice

- Plain, first person, specific: name the formats (YouTube long-form, product ads, event films) and the tools. No slogans stacked on slogans.
- No em or en dashes in site copy. Project titles use a colon ("ADS Astronacci: Bitcoin Almanac 2025"). Years read "2024 to now".
- ↗ only on links that leave the site (email, WhatsApp, LinkedIn, YouTube). ↓ for in-page scrolls. Buttons get no arrow.
- CTAs name the action: "See selected work", "Watch the showreel", "Start a project".
- The owner's own lines are voice samples and stay as written: "Just a person who loves the art of life." (portrait back, alone, small, bottom-left corner) and "I make stories worth feeling."

## Mini Fiqri beyond the room

- **The program monitor plays the real work.**
  - The right-hand monitor in the voxel room shows the film Chapter One last played (the `fq:shot` event now carries the YouTube id). Until then it cycles through the Selected Work highlights.
  - Frames are the project thumbnails, pixelated to match the voxels and loaded with CORS. If the CDN refuses, the painted feed stays.
  - Clicking that monitor opens the project. The PC tower is now the in-scene Render button.
- **Getting up.** Fiqri swivels the chair toward its open side (+x, the coffee corner), stands and steps off the front of the seat; sitting down is the reverse. He never moves through the backrest (owner bug report 2026-11-06; guarded by `creators-lab-smoke`).
- **Contact cameo.** Stills rendered from the same voxel model (`tools/render-cameos.mjs`, then `tools/crop-cameos.py` crops every frame to one shared box so poses swap without jumping). No second WebGL scene runs.
  - While Contact is on screen he loops a routine (owner asked for looping motion and "pose nyeleneh lucu dan cool"): wave, point toward the email, shades on with crossed arms, a dab, a victory hop. About 10 s per loop, ten WebP frames, about 70 KB.
  - Reaching for email, WhatsApp or LinkedIn makes him point. He is his own pause button (a real `<button>`, `aria-pressed`); the loop also stops off screen and in background tabs.
  - Reduced motion: a single still wave, button disabled.
  - The footer "last frame" note has **no cameo** (owner, 2026-11-06).

## Section cuts (between every chapter)

Chapters meet on a slant, not a flat rule (`assets/section-cuts.css/.js`, test `scripts/section-cuts-smoke.mjs`). Owner direction, 2026-11-06: "cuma shape aja, agak miring, parallax, simple". No film strips, no transition text, no repeating patterns.
- **The edge.** Each chapter's top edge is cut on a diagonal (`clip-path`), `--slant` = 32 to 84px, alternating which side is high. The section overlaps the one above by the slant, so the real grounds meet on the angle in every daypart (this is how the blue Contact gets its slanted top).
- **The plane.** One soft cobalt-tinted slab (`--ambient`, 5 to 16% alpha) sits behind each edge, a little steeper, so a wedge of light shows above the seam. On scroll it drifts at its own speed (up to 0.7 x slant), which is the parallax. Nothing else moves.
- Selected Work does not overlap the pinned Chapter One scene above it (film controls sit near its bottom); it only takes the slant.
- Reduced motion: the plane stays still. Decorative only (`aria-hidden`, no pointer events).

## Share card and icons

- `assets/og-card.jpg` (1200×630): the title card (condensed name, Newsreader "stories worth feeling.", timeline with IN and OUT, the real portrait).
- Icons: `favicon-32.png`, `icon-192.png`, `apple-touch-icon.png` ("FQ." with the cobalt dot).
- All are rendered from `tools/og.html` with the site's fonts (`tools/render-brand.mjs`). Re-render after a name, tagline or palette change.
- `noindex` stays until the owner approves publishing.

## Owner media slots (ready, waiting for footage)

- **Native reel** (`assets/reel-native.js`, `assets/reel/clips.json`, spec in `assets/reel/README.md`). When the list has clips, Chapter One plays the owner's own 5 s excerpts as `<video>`, with no YouTube UI at all, the same Next / Pause / clock / blueprint sync and the voxel monitor link. It prefers WebM (VP9) with an MP4 fallback for Safari. An empty list, or every clip failing, leaves the YouTube montage in place.
- **Colour grade before / after** (`assets/grade-compare.js`, `assets/grades/grades.json`, spec in `assets/grades/README.md`). A raw-vs-graded slider in a project's video dialog. It is a native range input, so mouse, touch and keyboard all work, and it appears only for listed projects.
- Never fill these slots with stand-in or generated footage. Tests use synthetic fixtures in `scripts/fixtures/` only.

## Retired, do not bring back

Film-strip / screenplay-slug section dividers (tried 2026-11-06, owner: "jelek, aneh"); particle backgrounds; the flat beige/copper "premium restraint" look; the boxed blueprint card; the boxed 2.5D room card (the SVG stays only as the no-WebGL fallback); iris/violet accents; "tap to flip" hints; uppercase, letter-spaced eyebrow labels on every section.
