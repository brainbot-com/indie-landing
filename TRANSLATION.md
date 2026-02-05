# Translation (Indie.Box)

This project ships fast, static pages per language. German is the source of truth in `index.html`. English is generated into `/en/index.html` from translation keys.

## What gets generated

- Source file: `index.html` (German copy is the master)
- English strings: `i18n/index.html.lang.en.json`
- Generator: `scripts/generate-lang.js`
- Output: `en/index.html`

Run:

```bash
node scripts/generate-lang.js
```

## How keys work

- Elements in `index.html` that should be translated get a `data-i18n` attribute.
- The German text stays in the HTML for reference and fallback.
- The generator replaces the inner text with the English value from the JSON.
- If an element needs HTML (e.g. `<br>`), add `data-i18n-html="true"` and keep the `<br>` in the English string.

## Asset paths

- The generator rewrites relative `src`/`href` to `../...` so assets load from `/en/`.
- Keep assets referenced relative in `index.html` (e.g. `style.css`, `script.js`, `image.png`).

## Editing workflow

1. Update German copy in `index.html`.
2. Add or update matching keys in `i18n/index.html.lang.en.json`.
3. Regenerate `en/index.html` with the script.

## Rules for new copy (agents)

- German is the source of truth. Do not invent new structure in English.
- Keys must be stable and semantic (e.g. `hero.title.line1`, not `blue_button_text`).
- Keep English concise; avoid expanding copy length by more than ~10-15%.
- Use the same punctuation style as German unless it reads unnatural.
- If unsure, mark with a clear TODO note in the English JSON.
- Do not use HTML entities like `&amp;` in JSON strings unless the target element is `data-i18n-html="true"`. For normal text, use literal characters (e.g. `&`) to avoid double-escaping.

## Lists, bold, links

- List items are individual keys (`items.0`, `items.1`, etc.), not newline-separated strings.
- Do not insert HTML except for `<br>` where `data-i18n-html="true"` is set.
- Links remain in the HTML; only the link text is translated.
