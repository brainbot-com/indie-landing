# Indie.Box Style Guide

This is the **single source of truth** for styling. Use these tokens and rules in all new work.

## Style Intent (from `type-guide.html`)
- Premium, calm, and technical. Dark metallic hero backgrounds with soft gradients.
- Prism/orange is a **signature accent** for key words only, not for UI chrome.
- Typography is confident and tight: large display lines, uppercase kicker style, generous spacing.
- Light sections are clean and quiet; dark sections feel deep and dimensional.

## Typography Tokens (use these)
Defined in `style.css` and `type-guide.css`.

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

### Usage Mapping (Reference-only in `type-guide.css`)
- `.display-1`, `.display-2`, `.title`, `.subhead`, `.body`, `.body-lg`, `.body-sm`, `.ui`, `.kicker`
- These are visual reference classes for the type guide. If we need them on the actual site, propose adding them to `style.css` first.

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

## Animation Hooks (No Styling)
- Use `data-animate="fade-up"` and optional `data-stagger="1|2|3"`.
- Scroll story is wired via `data-scroll-panel="intro|focus|focus-wrap"`.
- Animation triggers should not be implemented with semantic layout classes.

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
- `type-guide.css` (visual reference)
- `type-guide.html` (visual reference)

If you change tokens, update **both** CSS files and this `STYLE_GUIDE.md`.

## Legacy Cleanup
- Do not reintroduce `v4-` classes or legacy references.
