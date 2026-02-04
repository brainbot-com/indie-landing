# Indie.Box Style Guide

This is the **single source of truth** for styling. Use these tokens and rules in all new work.

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

### Usage Mapping
- `.hero-title` → `--t-display-1`
- `.v4-display` → `--t-display-2`
- `.section-heading` → `--t-title`
- `.hero-subtitle` → `--t-subhead`
- `.v4-kicker`/kicker labels → `--t-small`
- Buttons and nav → `--t-ui`

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

## Buttons
- **Primary CTA**: pill shape, `--accent-color`
- **Secondary CTA**: outline
- **Small Button**: compact pill for tight UI (see `.primary-button.small`)
- Prism is for text/gradients, **not** for buttons

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
