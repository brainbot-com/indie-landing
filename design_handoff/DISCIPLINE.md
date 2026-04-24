# Indie.box Design System — Disziplin-Regeln

Diese Regeln sind verbindlicher Bestandteil des Indie.box Design Systems.
Sie gelten für alle Komponenten, Seiten und Templates und sind Teil des
Design-Vertrags — nicht nur der Ästhetik, sondern auch der Konsistenz über
Releases hinweg.

**Gültigkeit:** Halte diese Regeln bei jedem neuen Komponenten-Entwurf ein und
validiere bestehende Vorschläge gegen sie. Wenn ein Entwurf eine dieser Regeln
verletzen würde, weise explizit darauf hin und schlage eine regelkonforme
Alternative vor, statt stillschweigend eine Ausnahme einzuführen.

---

## 1. Orange (#FF4D00) ist Signature-Akzent, kein UI-Element

Orange wird ausschließlich für Signature-Momente eingesetzt:
- Hervorhebungen in Text und Gradienten (Schlüsselwörter, Claim-Highlights)
- Signaturlogik der Wortmarke (Punkt in „Indie.box", „Indie.hub", „Indie.cluster")
- Premium-Emphasis-Komponenten (z. B. Callout-Rahmen, Glow-Frame-Stroke)

**Nicht erlaubt:**
- Orange als Button-Füllfarbe
- Orange in UI-Chrome (Navigation, Eingabefelder, Funktions-Icons)
- Großflächige orange Flächen
- Orange zur Dekoration ohne inhaltliche Aussage

---

## 2. Closed-Set-Prinzip für Gradienten und Hintergründe

Es werden ausschließlich die im Design System definierten Gradient- und
Background-Tokens verwendet:

```css
--gradient-prism          /* Prism Orange — Hero + Signature */
--gradient-hero-dark      /* Metal Dark — Subline-Behandlung */
--gradient-hero-light     /* Metal Light — Subline-Behandlung */
--bg-dark-metal           /* Radial-Scrim auf Graphite */
```

Neue Varianten dürfen **nicht ad hoc** erfunden werden. Erweiterungen erfolgen
nur durch explizite Aufnahme ins Token-Set mit Begründung und Usage-Mapping.

---

## 3. Buttons werden nach Design-Funktion benannt, nicht nach Verwendung

Button-Klassen beschreiben ihre visuelle Rolle, nicht ihren Einsatzort.

**Erlaubte Struktur:** `Base + Shape + Size + Treatment`

| Modifier | Werte |
|---|---|
| Base | `.button` |
| Shape | `.button--pill` |
| Size | `.button--sm` · `.button--md` · `.button--lg` |
| Treatment | `.button--solid` · `.button--plain-light` · `.button--plain-dark` |

**Nicht erlaubt:** kontextgebundene Klassen wie `.cta-hero-button`,
`.checkout-submit`, `.download-primary`. Der Kontext kommt aus dem umgebenden
Layout, nicht aus dem Button-Namen.

---

## 4. Typografie ausschließlich über Tokens

Ad-hoc-Schriftgrößen (`font-size: 42px` etc.) sind nicht erlaubt. Jede
Textgröße referenziert ein Typografie-Token aus `colors_and_type.css`.

**Verbindliches Mapping Komponente → Token:**

| Komponente | Token |
|---|---|
| Hero-Headline | `--t-display-1` |
| Section/Feature-Headline | `--t-display-2` |
| Section Title | `--t-title` |
| Lead / Subline unter Headline | `--t-subhead` |
| Body-Text (groß) | `--t-body-lg` |
| Body-Text (Standard) | `--t-body` |
| Body-Text (klein) | `--t-body-sm` |
| Kicker / Overline | `--t-small` (+ uppercase + tracking 0.14em) |
| Buttons / Nav | `--t-ui` |

Neue Komponenten ergänzen dieses Mapping in der Dokumentation.

---

## 5. Komponenten mit definiertem Eigenverhalten

Komponenten, deren Verhalten nicht aus Farb-/Typo-Tokens ableitbar ist, haben
dokumentierte Verhaltensregeln.

### Premium-Callout („glow-frame")
- Rahmen mit Gradient-Stroke (`--gradient-prism`) auf hellem Grund
- Weiße Fläche (`#FFFFFF`), weicher Außenglow (`--shadow-prism-soft`), abgerundete Ecken (`--r-lg`)
- Nur Signature-Akzent im Stroke — keine Multi-Hue-Varianten
- Zweck: „beste Wahl" / Premium-Callout

### CTA-Overlay
- Vollflächig, Scrim dunkel + blur, ruhig (kein bunter Gradient)
- Dialog mit dezentem Rahmen + leichtem Glow, abgerundete Ecken
- Öffnet relativ zum aktuellen Viewport-Top (nicht immer am Dokumentstart)
- Schließt per X, Klick außerhalb, Escape
- Langer Inhalt wächst im Seitenfluss nach unten — normale Seiten-Scrollbar, kein interner Scroll

---

## 6. Animationen sind vom Styling getrennt

Animationstrigger werden ausschließlich über `data`-Attribute gesetzt, niemals
über semantische Layout-Klassen:

```html
<!-- Fade-up mit optionalem Stagger -->
<div data-animate="fade-up" data-stagger="1"></div>
<div data-animate="fade-up" data-stagger="2"></div>

<!-- Scroll-Story-Panels -->
<section data-scroll-panel="intro"></section>
<section data-scroll-panel="focus"></section>
<section data-scroll-panel="focus-wrap"></section>
```

Styling-Klassen tragen **keine** Animationslogik. Eine Komponente kann animiert
oder nicht animiert verwendet werden, ohne ihre CSS-Klassen zu ändern.

---

## 7. Layout-Klassen beschreiben Rolle, nicht Inhalt

Layout-Klassen benennen die visuelle/strukturelle Rolle, nicht den konkreten Content.

**Richtig:**
```css
.story-*    /* Scroll-Story-Panels, -Surfaces, -Headlines */
.box-*      /* Box-Stacks, -Heads, -Bodies, -Metas, -Tags */
.spec-*     /* Spec-Cards und -Explorer */
.compare-*  /* Comparison-Grid und -Cards */
```

**Falsch:** `.product-box`, `.feature-box`, `.testimonial-box` — wenn alle drei
dieselbe visuelle Rolle erfüllen, ist das eine Klasse. Content-Bedeutung wird
durch Position und Kontext ausgedrückt, nicht durch den Klassennamen.

---

## Zusammenfassung: Schnell-Checkliste

Bevor eine Komponente gemergt / übergeben wird:

- [ ] Orange nur als Signature-Akzent (Punkt, Highlight, Stroke) — nicht als Button-Farbe?
- [ ] Nur definierte Gradient- und Background-Tokens verwendet?
- [ ] Button-Klassen nach Funktion benannt (`.button--solid`), nicht nach Kontext?
- [ ] Alle Schriftgrößen über Token-Variablen?
- [ ] Neues Komponenten-Token-Mapping dokumentiert?
- [ ] Glow-Frame und CTA-Overlay folgen dem Eigenverhalten-Spec?
- [ ] Animationstrigger via `data-animate`, nicht via CSS-Klassen?
- [ ] Layout-Klassen beschreiben Rolle, nicht Content?

---

*Indie.box Design System · DISCIPLINE.md · April 2026 · v1.0*
