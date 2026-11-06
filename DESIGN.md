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

## Typography

- **Display:** Space Grotesk. Tight negative tracking for the big chapter headlines.
- **Body:** DM Sans.
- **Accent:** the italic "worth feeling." in the hero.

Open decision (audit item #9, not yet chosen by the owner): Space Grotesk is a common AI default, and the hero italic currently falls back to Georgia instead of a loaded serif. Decide whether to keep both with a written reason, or pick a display face and an italic serif with editorial character.

## Shape

The radius scale is **6 / 12 / 18**:
- 6: small controls such as Next, Pause and tags;
- 12: buttons, chips, cards and thumbnails;
- 18: big frames such as the showreel, portrait and project cards.

Round shapes are kept only for round icon buttons (the play cue). There are no pill buttons.

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

## Retired, do not bring back

Particle backgrounds; the flat beige/copper "premium restraint" look; the boxed blueprint card; the boxed 2.5D room card (the SVG stays only as the no-WebGL fallback); iris/violet accents; "tap to flip" hints; uppercase, letter-spaced eyebrow labels on every section.
