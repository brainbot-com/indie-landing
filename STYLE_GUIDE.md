# Indie.Box Style Guide

This is the **single source of truth** for styling. Use these tokens and rules in all new work.

## Style Intent (from current production pages)
- Premium, calm, and technical. Dark metallic hero backgrounds with soft gradients.
- Prism/orange is a **signature accent** for key words only, not for UI chrome.
- Typography is confident and tight: large display lines, uppercase kicker style, generous spacing.
- Light sections are clean and quiet; dark sections feel deep and dimensional.

## Typography Tokens (use these)
Defined in `style.css`.

- `--t-display-1` : Hero headline
- `--t-display-2` : Section/feature headlines
- `--t-title` : Section titles
- `--t-subhead` : Short lead/subline under headlines
- `--t-body-lg` : Lead paragraph (short/medium)
- `--t-body` : Standard body text
- `--t-body-sm` : Secondary/meta text
- `--t-small` : Kicker/overline labels
- `--t-ui` : Buttons, nav, UI labels

### Usage Mapping (Site)
- `.hero-title` → `--t-display-1`
- `.section-heading` → `--t-title`
- `.hero-subtitle` → `--t-subhead`
- `.story-display`, `.box-display` → `--t-display-2`
- `.story-kicker`, `.box-kicker`, `.box-tag` → `--t-small`
- Body text (e.g. `.card p`, `.use-case-item p`, `.box-body`) → `--t-body`
- Buttons + nav → `--t-ui`

## Gradients (Approved)
Use only these tokens.

- `--gradient-prism` **(default accent)**  
  Orange prism (no purple). Use for **Signature/Key moments**.
- `--gradient-hero-dark`  
  Metallic/cool gradient for dark hero text.
- `--gradient-hero-light`  
  Metallic/cool gradient for light backgrounds.
- `--gradient-signature` = `--gradient-prism`

### Gradient Usage
- Signature text (e.g., “Indie Intelligence”) → `--gradient-prism`
- Dark hero headline → `--gradient-hero-dark`
- Light hero headline → `--gradient-hero-light`

## Backgrounds (Approved)
Use only these backgrounds.

- `--bg-dark` (Graphite dark)
- `--bg-dark-metal` (Dark metal with subtle radial glow)
- `--bg-light` (Clean light)
- `--bg-neutral` (Neutral for cards/sections)

### Background Usage
- Hero / statement sections: `--bg-dark` or `--bg-dark-metal`
- Content/reading sections: `--bg-light`
- Cards / transitions: `--bg-neutral`

## Glow Frame (Approved)
Use the `.glow-frame` component to emphasize a box on light backgrounds.

- Gradient stroke via `--gradient-prism` (orange only).
- White surface with soft outer glow and rounded corners.
- Use for “best choice” or premium callouts.
- Do not introduce new gradient colors or multi-hue variants.

Optional emphasis:
- Add `.glow-frame--outer` for the outer glow layer.

## CTA Overlay (Approved)
Use the CTA overlay when a click on a primary action should open focused content above the page.

### Structure
- Trigger: `.overlay-demo-trigger` (or any CTA with `data-overlay-open="id"`)
- Layer: `.overlay`
- Dialog: `.overlay__dialog`
- Close button: `.overlay__close`
- Close hook: `data-overlay-close`

### Behavior Rules
- Overlay covers the full page area with dim + blur background.
- Overlay opens relative to the current viewport top (not always at document start).
- Dialog has a visible frame (border + subtle glow) and rounded corners.
- Close on `X` click, outside click (on overlay area), and `Escape`.
- Long dialog content grows downward in the page flow.
- Use the normal page scrollbar; do not add an internal scrollbar on the dialog.

### Visual Rules
- Overlay background must be dark and calm (no colorful gradients in the scrim).
- Dialog border stays subtle and premium, never high-contrast neon.
- Dialog background remains configurable through `--overlay-panel-bg`
  (default: `--bg-dark-metal`).

## Buttons
**Naming principle:** button names describe **design function**, not usage.

**Base**
- `.button`

**Shape**
- `.button--pill` (only shape used)

**Size**
- `.button--sm`
- `.button--md`
- `.button--lg`

**Visual treatment**
- `.button--solid` (accent fill)
- `.button--plain-light` (borderless fill for light surfaces)
- `.button--plain-dark` (borderless fill for dark surfaces)

**Notes**
- Prism is for text/gradients, **not** for buttons.
- Always combine base + shape + size + treatment.

## Layout Naming (Design Meaning)
- Scroll story: `.story-*` (panels, surfaces, headlines, text)
- Box stack: `.box-*` (stack, box, head, body, meta, tag)
- Names describe layout/visual role, not content meaning.

## Animation Systems

### 1. Scroll Reveal — `data-animate="fade-up"`
Add to any element to fade it in when it enters the viewport.

```html
<div data-animate="fade-up">…</div>
<div data-animate="fade-up" data-stagger="1">…</div>  <!-- +0.08s delay -->
<div data-animate="fade-up" data-stagger="2">…</div>  <!-- +0.16s delay -->
<div data-animate="fade-up" data-stagger="3">…</div>  <!-- +0.24s delay -->
```

**How it works:** JS wires an `IntersectionObserver` (threshold 10%, bottom margin −50px) that adds `.visible` once the element enters the viewport. Fires once — not on scroll-out/re-enter. The element starts at `opacity: 0` via CSS; `.visible` triggers the `fadeUp` keyframe (0.8s, easeOutCubic, 30px rise).

**Rule:** Animation triggers go on data attributes only. Never use layout/semantic class names as animation hooks.

---

### 2. Parallax — `.parallax-bg`
Scroll-driven vertical shift for background images.

```html
<div class="parallax-container">
  <img class="parallax-bg" data-speed="0.2" …>
  <!-- content -->
</div>
```

- `data-speed` — shift factor relative to scroll (default `0.2`). Higher = more movement.
- `.parallax-container` must have `overflow: hidden`.
- `.parallax-bg` is sized at 140% height and positioned at `top: -20%` to allow travel room.
- JS calculates `translateY` from the element's center offset to viewport center, clamped to the available overflow so the image never shows its edges.
- **Disabled automatically on mobile** (`max-width: 768px`).

---

### 3. Hero Cinematic Sequence
The most complex animation. Triggered once on page load for `alt2` hero variant only.

**HTML marker:**
```html
<div class="hero-overlay" data-hero-seq="cinematic">
  <div class="hero-content-overlay" data-hero-variant="alt2" data-hero-seq-enabled="true">…</div>
</div>
```

**State machine:** JS adds CSS classes to `.hero-overlay` in timed sequence. CSS transitions/keyframes respond to these classes — no inline styles except the two custom properties for the cloud flip.

| Phase | Class added | What happens | Desktop timing |
|---|---|---|---|
| 0 | `hero-seq-on` | Activates the state machine; stage visible, content hidden | immediately |
| 1 | `hero-seq-cta` | Top CTA fades in (on stage) | 900ms |
| 2 | `hero-seq-bg` | Background image fades in | 1500ms |
| 2 | `hero-seq-stageout` | Brand stage fades out; bottom pill fades in | 1500ms |
| 3 | `hero-seq-content` | Hero content overlay rises in (translateY + opacity) | 2200ms |
| 4 | `hero-seq-line1` | First headline line fades up | 3100ms |
| 5 | `hero-seq-cloud` | Cloud element appears large at center | 3350ms |
| 5 | `hero-seq-cloud-active` | `.hero-line-2` hidden (cloud is stand-in) | 3350ms |
| 5 | `hero-seq-cloud-move` | Cloud translates+shrinks to `.hero-line-2` position | 3350ms |
| 5 | `hero-seq-cloud-done` | Cloud fades out; `.hero-line-2` takes over | on transitionend |
| 6 | `hero-seq-subtitle-in` | Subtitle fades in | 4550ms |
| 7 | `hero-seq-subtitle-settle` | Subtitle settles to final size/position | 5100ms |

**Cloud Flip detail:** JS reads `getBoundingClientRect()` of `.hero-fly-cloud` (large, centered) and `.hero-line-2` (final position), computes `dx`/`dy`, sets `--cloud-dx` and `--cloud-dy` as custom properties on `.hero-fly`, then adds `hero-seq-cloud-move`. CSS translates the wrapper to the final slot while `.hero-fly-cloud` scales from `2×` to `1×` simultaneously (both 900ms easeOutCubic).

**Mobile path** (`max-width: 768px`): Simplified — no cloud flip, faster timings (220ms–1200ms), skips cinematic beats.

**Reduced-motion path** (`prefers-reduced-motion: reduce`): All classes added synchronously with no transitions.

---

### 4. Combi-Pill Reveal — `.combi-pill--animated`
A three-part entrance animation for the CTA pill, triggered when its parent `[data-animate="fade-up"]` element becomes `.visible`.

```html
<div data-animate="fade-up">
  <div class="combi-pill combi-pill--animated">
    <span class="combi-pill-text combi-pill-text--animated">…</span>
    <span class="combi-pill-action combi-pill-action--icon">…</span>
  </div>
</div>
```

| Part | Animation | Delay | Duration |
|---|---|---|---|
| Shell (`.combi-pill--animated`) | `clip-path` wipe left→right | +500ms | 760ms |
| Icon (`.combi-pill-action--icon`) | drop in from above + scale up | +620ms | 320ms |
| Text (`.combi-pill-text--animated`) | scale up from 50% | +800ms | 320ms |

Reduced-motion: all parts shown immediately at final state (CSS `@media prefers-reduced-motion`).

---

### 5. Nav Reveal — `.nav-bar--floating`
The floating nav bar is hidden until the hero section scrolls out of view.

- JS wires an `IntersectionObserver` on `.hero-overlay` (threshold 5%).
- When hero exits viewport → `.nav-bar--visible` added to `.nav-bar--floating`.
- When hero re-enters → class removed.
- Purely class-driven; CSS handles the visibility transition.

---

### 6. Story Scroll Panels — `data-scroll-panel`
**Currently disabled.** `setupStoryScroll()` in `script.js` is a no-op stub (`return;`). The classes `.story-panel`, `.story-panel--intro`, `.story-panel--focus`, `.story-panel-wrap` are layout-only. The `data-scroll-panel` attribute exists on elements but triggers nothing.

## Do / Don’t
**Do**
- Keep spacing generous and consistent
- Use typography tokens instead of ad‑hoc font sizes
- Keep gradients subtle/metallic; Prism only for emphasis

**Don’t**
- Add new gradient variations without updating this file
- Introduce additional accent colors
- Use Apple‑identical gradient palettes or typography

## Files of Truth
- `style.css` (main site tokens)

If you change tokens, update `style.css` and this `STYLE_GUIDE.md`.

## Legacy Cleanup
- Do not reintroduce `v4-` classes or legacy references.
