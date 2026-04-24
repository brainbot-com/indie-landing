# Handoff: Indie.box Design System

> **Diese Dateien sind Design-Referenzen in HTML** — keine Produktions-Code-Basis.
> Dein Job ist es, diese Designs in deinem bestehenden Codebase-Environment (React, Vue, Next.js o.ä.) neu zu implementieren — mit den dort vorhandenen Patterns und Libraries. Die HTML-Prototypen zeigen Aussehen, Verhalten und Tokens; sie werden nicht direkt deployed.

---

## Fidelität: High-Fidelity

Alle Komponenten und Screens sind pixel-präzise Mockups mit finalen Farben, Schriften, Abständen und Interaktionen. Der Entwickler soll diese 1:1 im Ziel-Framework nachbauen.

---

## Das Produkt

**Indie.box** ist ein dedizierter lokaler KI-Server (Hardware-Appliance). Kein Cloud-Zwang, keine Telemetrie, keine Abos.

**Produktfamilie — die Wortmarke ist ein System:**
| Produkt | Typ | Beschreibung |
|---|---|---|
| `Indie.box` | Hardware | Dedizierter lokaler KI-Server für Teams |
| `Indie.hub` | Software | Indie-Softwarebundle aus eigenen + Open-Source-Komponenten, plattformübergreifend |
| `Indie.cluster` | Infrastruktur | Vernetzter Verbund mehrerer Indie.box-Geräte als Rechenpool |

---

## Design Tokens — Single Source of Truth

**Datei:** `colors_and_type.css` (im Handoff-Paket enthalten)

Importiere diese CSS-Datei in deinen Build-Prozess oder überführe die Variablen in dein Token-System (Tailwind config, Style Dictionary, etc.).

### Farben

```css
/* Primär */
--ib-navy:          #0A2540;   /* Deep Navy — ~70% der Fläche */
--ib-orange:        #FF4D00;   /* International Orange — Akzent + Dots */
--ib-orange-hover:  #E64600;

/* Surfaces */
--bg-white:         #FFFFFF;
--bg-light:         #F7F9FC;   /* sehr helles Blau-Grau */
--bg-neutral:       #F0F2F5;   /* neutral für Cards */
--bg-dark:          #0B1118;   /* graphite */
--bg-dark-deep:     #05101A;   /* sehr dunkles Navy */

/* Prism-Gradient (primärer Akzentgradient) */
--gradient-prism: linear-gradient(95deg, #C2410C 0%, #F97316 35%, #FB923C 68%, #FDBA74 100%);

/* Ink / Text auf Hintergründen */
--ink-on-dark:       rgba(236, 242, 248, 0.78);
--ink-on-dark-lead:  rgba(248, 250, 252, 0.88);
--ink-on-dark-title: #F3F7FB;
--ink-on-light:      rgba(11, 34, 52, 0.72);

/* Borders */
--border-dark:    rgba(255, 255, 255, 0.08);
--border-light:   rgba(10, 37, 64, 0.08);
```

### Typografie

**Schrift:** Inter Variable (self-hosted), Fallback: system-ui.
**Dateien:** `fonts/InterVariable.woff2` + `fonts/InterVariable-Italic.woff2`

```css
--font-main: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;

/* Skala */
--t-display-1: clamp(3.3rem, 7.9vw, 7rem);   /* Hero-Headline */
--t-display-2: clamp(2.35rem, 5.4vw, 4.4rem); /* Sektion-Headline */
--t-title:     clamp(1.7rem, 3.4vw, 2.5rem);  /* Section Title */
--t-subhead:   clamp(1.1rem, 2.1vw, 1.6rem);  /* Subline */
--t-body-lg:   1.1rem;
--t-body:      1rem;
--t-body-sm:   0.9rem;
--t-small:     0.85rem;   /* Kicker / Overline */
--t-ui:        0.95rem;   /* Buttons / Nav */
```

**Gewichte:**
- `700` — alle Headlines, Wortmarke
- `600` — UI-Labels, Buttons
- `500` — Secondary UI
- `400` — Body-Text

**Letter-Spacing:**
- Display: `-0.03em`
- Title: `-0.02em`
- Kicker: `+0.14em` (uppercase)
- Body: Standard

### Abstände

```css
--space-xs: 0.5rem;
--space-sm: 1rem;
--space-md: 2rem;
--space-lg: 4rem;
--container-max: 1100px;
```

### Radien

```css
--r-sm:   8px;
--r-md:   12px;
--r-lg:   18px;
--r-xl:   22px;   /* Cards */
--r-2xl:  26px;   /* Hero/Info Cards */
--r-pill: 999px;
```

### Schatten

```css
--shadow-card-light:   0 10px 30px rgba(0,0,0,0.05);
--shadow-card-hover:   0 20px 40px rgba(0,0,0,0.10);
--shadow-card-deep:    0 24px 60px rgba(11,34,52,0.12);
--shadow-prism-soft:   0 22px 50px rgba(255,77,0,0.14), 0 10px 26px rgba(10,37,64,0.08);
--shadow-button-accent: 0 4px 6px rgba(255,77,0,0.20);
```

### Motion

```css
--ease-out:    cubic-bezier(0.25, 0.8, 0.25, 1);
--ease-spring: cubic-bezier(0.215, 0.61, 0.355, 1);
--dur-fast:    180ms;
--dur-base:    300ms;
--dur-slow:    800ms;
```

---

## Wortmarke — Konstruktionsregeln

Die Wortmarke ist das wichtigste visuelle Element. Diese Regeln sind nicht verhandelbar:

1. **Font:** Inter 700, `letter-spacing: -0.03em`
2. **Farben:** `Indie` + Suffix = Navy (`#0A2540`); Punkt `.` = Orange (`#FF4D00`)
3. **Suffix immer lowercase:** `Indie.box`, `Indie.hub`, `Indie.cluster` — niemals `Indie.Box` oder `INDIE.BOX`
4. **Auf dunkel:** Stamm in `#F3F7FB`, Punkt bleibt `#FF4D00`
5. **Favicon niemals neben Wortmarke** — beide wiederholen das „i."-Motiv

**HTML-Pattern:**
```html
<span class="wordmark">Indie<span class="dot">.</span>box</span>

<style>
  .wordmark { font-weight: 700; letter-spacing: -0.03em; color: #0A2540; }
  .dot { color: #FF4D00; }
  /* Dark variant */
  .dark .wordmark { color: #F3F7FB; }
  .dark .dot { color: #FF4D00; } /* bleibt orange */
</style>
```

---

## Favicon / Bildmarke

**Datei:** `assets/favicon.svg`

Das „i."-Icon: Inter-700-Proportionen (Stem + Tittle in Weiß, Period-Dot in Orange), auf Navy-Hintergrund, Apple-Icon-Radius (ca. 22.5% der Größe).

**Verwendung:**
- Browser-Tab, Dock, App-Icon, Favicon → Favicon verwenden
- Im Layout / Header → Wortmarke verwenden
- **Nie beides zusammen** in einer Zeile

---

## Komponenten

### 1. Navigation (`preview/components-nav.html`)

**Struktur:** `Wortmarke links | Links mittig/rechts | CTA-Button rechts`

```
Layout: flex, justify-between, align-center
Höhe: 64–72px
Padding: 0 2rem (container-max: 1100px)
Hintergrund Light: #FFFFFF mit border-bottom rgba(10,37,64,0.08)
Hintergrund Dark: rgba(11,17,24,0.85) + backdrop-filter: blur(12px)
```

**CTA-Button (Kaufen-Pill):**
```css
background: #FF4D00;
color: #FFFFFF;
font-weight: 700;
font-size: var(--t-ui);
border-radius: 999px;
padding: 0.55rem 1.25rem;
box-shadow: 0 4px 6px rgba(255,77,0,0.20);
```

### 2. Buy-Pill / Primär-CTA (`preview/components-buttons.html`)

```css
background: #FF4D00;
color: #FFFFFF;
border-radius: 999px;
padding: 0.85rem 2rem;
font-weight: 700;
box-shadow: 0 4px 6px rgba(255,77,0,0.20);
transition: background 180ms ease;
```
Hover: `background: #E64600`

### 3. Toggle/Segment-Pill (`preview/components-combi-pill.html`)

Zwei Varianten:
- **Light-Pill:** `background: rgba(10,37,64,0.06)`, aktiver Segment `background: #FFFFFF`, `border-radius: 999px`
- **Combi-Pill (Dark):** Wrapper `background: #0A2540`, rechte Aktion `background: #FF4D00`

### 4. Glow-Frame (`preview/components-glow-frame.html`)

Premium-Callout mit Prism-Gradient-Border:
```css
border-radius: 18px;
background: #FFFFFF;
box-shadow: 0 22px 50px rgba(255,77,0,0.14), 0 10px 26px rgba(10,37,64,0.08);

/* 2px Prism-Border via background-origin trick */
background-clip: padding-box;
border: 2px solid transparent;
background-image:
  linear-gradient(white, white),
  linear-gradient(95deg, #C2410C, #F97316, #FB923C, #FDBA74);
background-origin: border-box;
```

### 5. Comparison Card (`preview/components-comparison.html`)

Dreispaltiger Vergleich. Beste-Wahl-Karte:
```css
border: 2px solid #FF4D00;
box-shadow: 0 4px 14px rgba(255,77,0,0.14);
border-radius: var(--r-xl);
```

### 6. Box-Stack (`preview/components-box.html`)

Gestapelte Feature-Karten mit UPPERCASE Display-Text und Combi-Pill-CTAs. Jede Box: Kicker (UPPERCASE, tracking +0.14em), Display-2-Title (UPPERCASE), Body-Text, Tag + CTA.

---

## Copywriting-Regeln

- **Ton:** Premium, ruhig, selbstbewusst, technisch. Nie laut. Nie Hype.
- **Sprache:** Deutsch ist Quelle der Wahrheit.
- **Kasus:** Sentence case für Headlines (`Warum Indie.box?`), ALL CAPS für Kicker (`PRIVATSPHÄRE`)
- **Interpunktion:** Fragmentierte Headlines mit Punkten — `Deine Daten. Deine KI. Keine Cloud.`
- **Duzen:** `du / dein` (nicht Sie)
- **Produkt als Subjekt:** `Indie.box verarbeitet …`, `Indie.hub verbindet …`
- **Keine Emojis** in der UI

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Punkt `.` immer in `#FF4D00` | Punkt in Navy oder grau |
| Favicon ODER Wortmarke | Beides nebeneinander |
| Navy dominiert (~70%), Orange punktuell | Orange als Flächenfarbe |
| Inter 700 für alle Headlines | Andere Schriften mischen |
| Lowercase Suffix: `indie.box` | `Indie.Box`, `INDIE.BOX` |
| Prism-Gradient für Hero + CTA | Prism + Orange gestapelt |

---

## Dateien im Handoff-Paket

| Datei | Zweck |
|---|---|
| `colors_and_type.css` | **Single Source of Truth** — alle Tokens |
| `fonts/InterVariable.woff2` | Self-hosted Inter Variable |
| `fonts/InterVariable-Italic.woff2` | Italic Variant |
| `assets/favicon.svg` | Das „i."-Icon |
| `assets/indiebox-free-clean.png` | Kanonischer Hero-Produktshot (transparent, 1536×1024) |
| `preview/brand-logo.html` | Wortmarken-Familie (Light + Dark) |
| `preview/components-nav.html` | Navigation (Light + Dark) |
| `preview/components-buttons.html` | Buttons + Pills |
| `preview/components-comparison.html` | Comparison Card |
| `preview/components-glow-frame.html` | Glow-Frame |
| `preview/colors-core.html` | Farbpalette-Übersicht |
| `preview/type-display-1.html` | Display-1 Typo-Referenz |
| `Design System Briefing.html` | 9-Folien-Briefing (Überblick für alle) |

---

## Empfehlung für Claude Code

Füge diese Anweisung in deine `CLAUDE.md` im Repo ein:

```markdown
## Design System
Das Indie.box Design System liegt im Ordner `design_handoff/`.
- Token-Quelle: `design_handoff/colors_and_type.css`
- Schriften: `design_handoff/fonts/`
- Favicon: `design_handoff/assets/favicon.svg`
- Komponenten-Referenz: `design_handoff/preview/`
- Wortmarke: Inter 700, Punkt immer in #FF4D00
- Primärfarbe: #0A2540 (Navy), Akzent: #FF4D00 (Orange)
```

Dann kann Claude Code jederzeit auf die Tokens und Komponenten referenzieren, ohne dass du es jedes Mal neu erklären musst.

---

*Indie.box Design System · April 2026 · v1.0*
