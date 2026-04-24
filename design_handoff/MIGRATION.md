# Migration auf das neue Indie.box Design System

Dieses Dokument hält fest, was wir im Projekt `indie-landing` vom alten Styling (`style.css`-Token-Set, inline-SVG-Icons, hardcoded Werte) auf das neue Master Design System umstellen. Das Master-System selbst wird von *Claude Design* gepflegt und liefert seine Artefakte in den Ordner `design_handoff/`.

## Was wir tun und warum

**Zustand heute**
- 36 CSS-Tokens in `:root` (`--t-*`, `--bg-*`, `--gradient-*`, `--spacing-*`, …). Token-Coverage nach Audit: **ca. 40–50 %**.
- ~180 hardcoded Hex-Farben, ~130 hardcoded `font-size`-Werte, ~511 `rgba(…)`-Literale.
- Keine Tokens für: Border-Radii, Shadows, Z-Index-Layer, Breakpoints, Motion-Dauern/Easings, Status-Farben, Muted-Foreground.
- Keine Icon-Bibliothek: inline-SVG (konsistent im Lucide-Stil) plus Unicode-Symbole (`✓ ✕ ⏱ ↺ · …`) für Status-Badges.

**Zielzustand**
- 100 % token-basiert: jeder visuelle Wert kommt aus einem Token, keine Ad-hoc-Werte mehr.
- Vollständige Token-Kategorien: Colors (inkl. Status + Muted), Typography, Spacing, Radii, Shadows, Z-Index, Breakpoints, Motion, Gradients.
- Naming-Konvention in Langform: `--color-*`, `--font-size-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--z-*`, `--bp-*`, `--motion-*`, `--gradient-*`. Keine verkürzten Präfixe.
- Icons ausschließlich **Lucide** als inline-SVG (viewBox 24, `stroke="currentColor"`, stroke-width 1.8, round caps/joins). Keine Unicode-Status-Symbole mehr.

Die Disziplin-Regeln, Motion-Regeln und Token-/Icon-Regeln sind als Prompts an Claude Design übergeben und dort die autoritative Quelle. Dieses Dokument ist **nur** der Migrationspfad auf unserer Seite.

## Token-Mapping (alt → neu)

### Farben
| alt | neu |
|---|---|
| `--primary-color` | `--color-primary` |
| `--accent-color` | `--color-accent` |
| `--text-dark` | `--color-fg` |
| `--text-light` | `--color-fg-muted` |
| `--bg-white` | `--color-bg` |
| `--bg-light` | `--color-bg-surface` |
| `--bg-neutral` | `--color-bg-neutral` |
| `--bg-dark` | `--color-bg-dark` |
| `--bg-dark-metal` | `--color-bg-dark-metal` |
| `--border-light` | `--color-border-subtle` |

### Typografie
| alt | neu |
|---|---|
| `--t-display-1` | `--font-size-display-1` |
| `--t-display-2` | `--font-size-display-2` |
| `--t-title` | `--font-size-title` |
| `--t-subhead` | `--font-size-subhead` |
| `--t-body-lg` | `--font-size-body-lg` |
| `--t-body` | `--font-size-body` |
| `--t-body-sm` | `--font-size-body-sm` |
| `--t-small` | `--font-size-small` |
| `--t-ui` | `--font-size-ui` |
| `--font-main`, `--font-heading` | `--font-sans` |

### Spacing
| alt | neu |
|---|---|
| `--spacing-sm` (1rem) | `--space-md` |
| `--spacing-md` (2rem) | `--space-xl` |
| `--spacing-lg` (4rem) | `--space-3xl` |

Die Skala wird erweitert um `--space-3xs`, `--space-2xs`, `--space-xs`, `--space-sm`, `--space-lg`, `--space-2xl`.

### Gradients
Präfix stimmt bereits — bleiben 1:1:
`--gradient-prism`, `--gradient-hero-dark`, `--gradient-hero-light`, `--gradient-signature`.

### Neue Kategorien (im alten System nicht vorhanden)
- **Foreground-Varianten:** `--color-fg-subtle`, `--color-fg-on-dark`, `--color-fg-on-accent`, `--color-fg-disabled`
- **Background-Varianten:** `--color-bg-elevated`, `--color-bg-disabled`
- **Border:** `--color-border`, `--color-border-strong`
- **Status:** `--color-success`, `--color-success-bg`, `--color-warning`, `--color-warning-bg`, `--color-danger`, `--color-danger-bg`, `--color-info`, `--color-info-bg`
- **Interactive:** `--color-accent-hover`, `--color-accent-active`
- **Typografie-Gewichte:** `--font-weight-regular|medium|semibold|bold`
- **Line-Heights:** `--line-height-tight|normal|relaxed`
- **Letter-Spacing:** `--letter-spacing-tight|normal|kicker`
- **Radii:** `--radius-none|sm|md|lg|xl|pill|full`
- **Shadows:** `--shadow-none|sm|md|lg|glow`
- **Z-Index:** `--z-base|sticky|nav|dropdown|overlay|modal|toast`
- **Breakpoints:** `--bp-sm|md|lg|xl`
- **Motion:** `--motion-dur-entry|ui|signature-min|signature-max`, `--motion-ease-entry|link|pop`, `--motion-stagger-step`

## Phasen

**Phase 0 — Vorbereitung (diese Session)**
- Migrationsplan (dieses Dokument) ins Repo.
- `design_handoff/` bleibt ansonsten leer, bis Claude Design liefert.

**Phase 1 — Token-Fundament**
- Neue Kategorien (Radii, Shadows, Z-Index, Breakpoints, Motion, Status, Muted-Fg) in `:root` hinzufügen. Werte: aus bestehendem `style.css` extrahiert oder sinnvolle Defaults.
- Langform-Tokens parallel zu den bestehenden einführen. Alte `--t-*`/`--bg-*`-Tokens werden **Aliase** auf die neuen — nichts bricht.
- Kein Komponenten-Code wird geändert.

**Phase 2 — Icon-System auf Lucide**
- `paymentIcon()` und Co. in `script.js`: Unicode-Symbole durch inline-Lucide-SVG ersetzen.
- `.admin-pay-icon` CSS entsprechend anpassen (Größe über width/height, nicht font-size).
- Vorhandene inline-SVG in `admin/*.html` sind bereits Lucide-Stil und bleiben — ggf. gegen echte Lucide-Source gecrosschecked.

**Phase 3 — Komponenten-Migration**
- Pro PR ein Bereich (z. B. Admin Stock-Bar, dann Admin Orders-Detail, dann Hero, dann Sections). Alle `color: #…`, `font-size: …px`, `rgba(…)`-Literale auf Tokens umstellen. Hover-Varianten per `color-mix()` aus Accent-Token.

**Phase 4 — Claude-Design-Integration**
- Sobald `design_handoff/colors_and_type.css` liefert, Werte aus unserer `:root`-Definition durch die gelieferten Werte ersetzen. Struktur bleibt, weil wir die Langform-Namen schon etabliert haben.
- `design_handoff/fonts/`, `assets/favicon.svg`, `preview/` übernehmen.

**Phase 5 — Aufräumen**
- Alte `--t-*`/`--bg-*`-Aliase löschen.
- `STYLE_GUIDE.md` aus dem Repo entfernen (Referenz in AGENTS.md ist bereits weg).

## Offene Punkte
- Lucide-Bezug: direkt inline aus lucide.dev kopieren, oder lokale Kopie im Repo? Vorschlag: inline — keine npm-Abhängigkeit nötig bei <20 Icons.
- Spacing-Skala konkret: 4 → 8 → 12 → 16 → 24 → 32 → 48 → 64 → 96 als Vorschlag, finale Werte entscheidet Claude Design.
- Status-Farben: aktuell verteilt in rgba-Literalen (success `#15803d`, warning `#92400e`, danger `#b91c1c`) — werden 1:1 übernommen oder von Claude Design neu vergeben?
