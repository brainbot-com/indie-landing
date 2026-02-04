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
- Body text (e.g. `.card p`, `.use-case-item p`) → `--t-body`
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

## Buttons
- **Primary CTA**: `.primary-button` (pill shape, `--accent-color`)
- **Secondary CTA**: `.secondary-button` (outline)
- **Small buttons**: `.primary-button.small` and `.secondary-button.small`
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

## Legacy Cleanup
- Do not reintroduce `v4-` classes or legacy references.
