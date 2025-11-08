# Snore Timeline Support Center — Design Guide

The support center is where people go to learn the app. It should feel calm, precise, and crafted, like good product documentation, not like a marketing landing page. This guide is the source of truth for its visual system. The marketing homepage and the 15 language sites are out of scope; the support center carries its own chrome.

## Direction (decided)

- **Refined night.** Dark, layered, premium. No gradients anywhere. Color comes from flat fills and hairlines.
- **Fine line-art.** Thin-stroke illustrations that double as the real teaching diagrams.
- **Sleep-stage palette as wayfinding.** Each topic group owns one color drawn from the app, so color tells you where you are.
- **Own chrome.** A considered header and footer used only on `/support/*`.

## Principles

1. **Teach first.** Every visual choice serves reading and understanding. Decoration that doesn't aid comprehension gets cut.
2. **Borrow from the app, not from the web.** The motifs are the app's own: waveforms, the hypnogram's stage bands, breathing rhythm, decibel readouts.
3. **Quiet by default, color with intent.** A near-black canvas and warm off-white ink. Accent color appears where it carries meaning (a group, a state, a warning), never as wallpaper.
4. **Hairlines over shadows, fills over gradients.** Depth comes from layered solid surfaces and 1px lines.

## Color

No gradients. All fills are solid.

### Canvas and ink

| Token | Hex | Use |
|---|---|---|
| `--sup-bg` | `#0E1116` | Page canvas (near-black, slightly cool) |
| `--sup-surface` | `#161A20` | Cards, sidebar, raised panels |
| `--sup-surface-2` | `#1C212A` | Hover, nested panels, code/path chips |
| `--sup-line` | `#272E38` | Hairline borders, dividers |
| `--sup-line-strong` | `#39414D` | Emphasized borders, focus rings |
| `--sup-ink` | `#ECEAE3` | Headings, primary text (warm off-white, nods to the app's oat-milk) |
| `--sup-ink-2` | `#C2C8D0` | Body copy |
| `--sup-ink-3` | `#828B97` | Meta, captions, eyebrows when not colored |

Never pure white or pure black.

### Stage-color wayfinding

Four topic groups, each with one accent pulled from the app's palette. The hues are deliberately far apart (orange, indigo, cyan, green) so color reads as location at a glance. Tuned for contrast on the dark canvas.

| Group | Pages | Token | Hex | App origin |
|---|---|---|---|---|
| Recording | getting-started, how-detection-works, storage-and-quality, siri-and-shortcuts | `--grp-recording` | `#EC9A4D` | apricot (snore indicator) |
| Your results | timeline-and-playback, episodes-and-events, breathing-disruptions, sleep-stages, sleep-score | `--grp-results` | `#8B8CEC` | lavender → indigo (deep-sleep band) |
| Devices & health | apple-watch, export-and-sharing, android | `--grp-devices` | `#4FB8C9` | light-sleep cyan (vitals) |
| Help & guides | troubleshooting + all 5 guides | `--grp-help` | `#6FBF9C` | forest/mint (silence band) |

The active group color drives: the page eyebrow, the left accent rule on the page header, the sidebar group marker and current-item bar, card hover borders, and the tint of that page's line-art. A page sets its group by `data-group="recording|results|devices|help"` on `<body>`; CSS maps that to `--accent`.

### State colors

- Medical / caution callout: `--grp-recording` apricot border (warm, attention without alarm). Reserve red only for genuine errors, which this content doesn't have.
- Tip callout: `--grp-help` mint.
- Note callout: `--sup-line-strong` neutral.

## Typography

System stack only (no web fonts: privacy and performance). Hierarchy comes from size, weight, tracking, and a monospace accent, not from a typeface purchase.

- **Body stack:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Mono stack (eyebrows, labels, metrics, timecodes):** `ui-monospace, "SF Mono", Menlo, monospace`. The monospace ties the UI to the app's decibel and timeline readouts.

Scale:

| Role | Size | Weight | Notes |
|---|---|---|---|
| Hub display | `clamp(2.4rem, 5vw, 3.6rem)` | 700 | tracking `-0.02em` |
| Page h1 | `clamp(2rem, 4vw, 2.7rem)` | 700 | tracking `-0.015em` |
| Section h2 | `clamp(1.35rem, 2.4vw, 1.7rem)` | 650 | ink, not colored |
| h3 | `1.15rem` | 650 | |
| Body | `1.0625rem` | 400 | line-height `1.75`, color `--sup-ink-2` |
| Eyebrow | `0.72rem` mono | 600 | uppercase, tracking `0.16em`, accent color |
| Caption / meta | `0.85rem` | 400 | `--sup-ink-3` |

**Measure:** article body capped at ~68ch so lines stay readable.

## Layout

- **Grid, not overlay.** The page is a CSS grid: `[sidebar 240px | content 1fr]` at ≥1080px, single column below. The sidebar is a real column, so it can never overlap the content (the v2 bug).
- **Sidebar scrolling.** Sidebar is `position: sticky; top: <header height>; max-height: calc(100vh - header); overflow-y: auto`. It scrolls independently and always reaches its bottom.
- **Sidebar length.** Grouped and collapsible. Only the current group is expanded; section anchors show only under the current page. This fixes the "super long" list.
- **Content rhythm:** generous vertical spacing between sections (`clamp(2.5rem, 5vw, 4rem)`), a waveform hairline divider between major sections.

## Components

- **Header (support chrome).** Slim sticky bar: wordmark left, a `SUPPORT` mono eyebrow, and a bordered (not filled) "Open app" link right. A 1px waveform line sits along the bottom edge as the signature. Breadcrumb lives just under it on article pages.
- **Footer (support chrome, `.support-footer`).** Distinct from the marketing footer. Three columns: a compact topic index (every page reinforces navigation), contact, and a small wordmark + privacy line. Hairline top border, no gradient.
- **Sidebar.** Grouped nav with a stage-color marker per group, current item gets a left bar in the accent color and a filled surface. Collapsible groups.
- **Eyebrow.** Mono, uppercase, accent color, often numbered (`03 · YOUR RESULTS`).
- **Cards (hub).** Solid `--sup-surface`, hairline border, a 2px left or top rule in the group color, line-icon, title, one line, deep links. Hover: border and rule brighten to the accent, 2px lift. No gradient, no glassmorphism.
- **Persona cards (hub "Start here").** Larger, with a line-art glyph; tinted by the group they lead into.
- **Callouts.** Left rule in the state color, `--sup-surface` fill, mono label. Variants: medical (apricot), tip (mint), note (neutral).
- **Figures.** Screenshot in a thin device-less frame with a caption; pending slots use a dashed `--sup-line` box labeled with the intended shot.
- **Pager (prev/next).** Two cells, hairline borders, mono labels.
- **Waveform divider.** A reusable inline SVG: a single thin amplitude line in `--sup-line-strong`, used to separate major sections and as the header underline.

## Illustration system

Fine line-art, built as inline SVG so it scales, themes, and animates.

- **Stroke:** `1.5px`, round caps and joins. One stroke color = the page accent; a second muted line in `--sup-line-strong` for context geometry.
- **Fills:** none, or a single 8–12% accent wash behind a shape. No gradients.
- **Labels:** mono, `--sup-ink-3`, small.
- **Tone:** schematic and calm. These are diagrams that happen to be pretty, not spot illustrations.

Priority diagrams to build (each grounded in real app behavior):

1. **Episode grouping** (episodes-and-events): snore ticks on a time axis, a labeled 30-second gap splitting episode 1 from episode 2.
2. **Breathing-disruption sequence** (breathing-disruptions): breathing waveform → 10s+ flat silence → a taller recovery spike marked `+15 dB`.
3. **Hypnogram anatomy** (sleep-stages): stacked stage bands (Awake/Light/Deep/REM/Silence) with the legend, 5-minute resolution.
4. **Timeline zoom ladder** (timeline-and-playback): the five zoom scales (1s/5s/1m/10m/1h) as nested brackets.
5. **Detection pipeline** (how-detection-works): mic → on-device analysis → labeled events, all on-device.
6. **Decibel ladder** (how-detection-works): Faint/Light/Audible/Heavy bands against a dB scale.

## Motion (subtle, optional, reduced-motion safe)

- **Breathing pulse:** a slow 4s ease in/out scale or opacity on a single hero glyph. Evokes calm breathing.
- **Waveform draw-in:** the divider/diagram strokes animate with `stroke-dashoffset` on first scroll into view.
- **Hypnogram fill:** stage bands wipe in left-to-right when the sleep-stages diagram enters view.
- All wrapped in `@media (prefers-reduced-motion: reduce)` to disable. Nothing loops aggressively; motion is a one-time reveal or a slow ambient pulse.

## Screenshots and motion graphics plan

Real app screenshots are the highest-value visuals; the line-art carries pages until they arrive.

- **Source:** iOS simulator with the app's built-in mock data (a `-demoMode` launch path seeded by the existing preview fixtures). Capture at 2x, frame in the thin figure frame.
- **Shot list (~10):** main waveform with episodes, calendar, nightly summary, episode detail card, breathing-disruption card, hypnogram, sleep-score card, weekly summary, Export Report sheet, settings (quality tiers). The 6 Apple Watch shots already exist and are wired into the watch page.
- **Motion graphics (later):** short looping captures or SVG recreations of the timeline scrubbing, a disruption marker pulsing, and the hypnogram filling. Keep under a few seconds, muted, autoplay-on-view.

## Wayfinding summary

```
Recording          apricot  #EC9A4D
Your results       indigo   #8B8CEC
Devices & health   cyan     #4FB8C9
Help & guides      mint     #6FBF9C
canvas #0E1116 · ink #ECEAE3 · hairline #272E38 · no gradients
```
