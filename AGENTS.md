# Agent Briefing (Indie.Box)

## Repo-Status: Neuaufbau als indie.solutions (seit 2026-08-17)
- **main = Neuaufbau der Website als indie.solutions.** Jeder Push deployt automatisch nach https://staging.indie.solutions (identisch mit staging.indiebox.ai, gleiche Docroot, gleiches backend-staging).
- **Die alte indiebox.ai-Live-Seite lebt auf dem Branch `indiebox-live`** (Referenz: Release-Tag v2026.08.17). Patches an der alten Seite: dort committen, neu taggen, GitHub-Release auf den Tag → deployt live. NIEMALS ein Release von main machen, solange der Umbau läuft.
- Cutover am Ende: Live-Vhost indie.solutions anlegen, APP_BASE_URL umstellen, indiebox.ai wird Redirect.
- **Konzeptdokument für den Neuaufbau: `KONZEPT-INDIE-SOLUTIONS.md`** (gesetzter Kanon + offene Entscheidungen). Vor Design- oder Copy-Arbeit am Umbau dort nachsehen.

## Design System
- Style Guide (Tokens, Komponenten, Animationen): `STYLE_GUIDE.md`
- CSS Tokens: `style.css`

Translation workflow lives in `TRANSLATION.md`. Agents must follow it when creating or updating copy.
Always generate matching English pages for any new or updated HTML pages (e.g. `en/index.html`, `en/checkout.html`, `en/terms.html`, `en/impressum.html`).

**Admin/backend pages are English-only.** The `/admin/` directory and all backend-facing pages must be written in English only. Do not create German versions or `en/admin/` counterparts.

## Text & Informationsarchitektur

Keep the current style and strengthen it: positive, self-confident, and clear in positioning. Avoid vague claims: wherever a reasonable user would expect details, provide them either directly in the copy or via easy-to-find optional detail elements (e.g. "Details", "Mehr erfahren", small infoboxes, FAQ, accordions).

Checklist per section:
- Where would a critical reader challenge this?
- Add a suitable detail layer for those points (one extra sentence or a compact info element).
- Keep the main surface concise; details stay optional and discoverable without searching.
- Ensure consistency: no contradictions across pages/sections (specs, privacy, checkout, overlays).

## Active Technologies
- Node.js 22 (ES modules), Express.js 4, vanilla JavaScript frontend, HTML5, CSS3 + `express@^4.21.2` (only npm dependency), `node:sqlite` (built-in), `node:crypto` (built-in) (001-user-management)
- SQLite via `node:sqlite` — new `users` table added to existing `indiebox.sqlite` database (001-user-management)

## Recent Changes
- 001-user-management: Added Node.js 22 (ES modules), Express.js 4, vanilla JavaScript frontend, HTML5, CSS3 + `express@^4.21.2` (only npm dependency), `node:sqlite` (built-in), `node:crypto` (built-in)
