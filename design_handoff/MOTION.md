# Indie.box Design System — Motion-Regeln

Motion ist Teil des Design-Vertrags — nicht Dekoration. Diese Regeln gelten
für alle Komponenten, Seiten und Templates.

> **Gültigkeit:** Bei jedem neuen Komponenten-Entwurf einhalten. Wenn ein
> Entwurf gegen eine dieser Regeln verstößt, explizit darauf hinweisen und
> eine regelkonforme Alternative vorschlagen.

---

## Grundhaltung

Animation ist funktional. Jede Bewegung muss begründbar sein durch eines dieser Ziele:

1. **Orientierung** — „Woher kommt der Inhalt? Wohin führt die Interaktion?"
2. **Rhythmus** — „In welcher Reihenfolge soll ich es wahrnehmen?"
3. **Signatur** — „Das ist ein besonderer Moment in dieser Marke."

Wenn keiner dieser drei Gründe gilt, wird **nicht** animiert.

---

## Drei Ebenen der Bewegung

Das System kennt genau **drei** Motion-Ebenen. Keine weiteren.

---

### Ebene 1 — Entry-Reveal (Standard)

Inhalte erscheinen beim Eintritt in den Viewport per sanftem Fade-Up.
Dezent, einheitlich, nicht ablenkend. Default für fast allen Content.

| Parameter | Wert |
|---|---|
| Trigger | `IntersectionObserver`, `data-animate="fade-up"` |
| Threshold | `0.1`, rootMargin `0px 0px -50px 0px` |
| Bewegung | `opacity: 0→1`, `translateY: 30px→0` |
| Dauer | `800ms` (`--motion-dur-entry`) |
| Easing | `cubic-bezier(0.215, 0.61, 0.355, 1)` (`--motion-ease-entry`) |
| Stagger | `data-stagger="1|2|3"` → 80ms / 160ms / 240ms Delay |
| Wiederholung | Einmalig — Observer wird nach Erscheinen entfernt |

```html
<!-- Einfaches Entry-Reveal -->
<div data-animate="fade-up">…</div>

<!-- Mit Stagger (gestaffelt) -->
<div data-animate="fade-up" data-stagger="1">…</div>
<div data-animate="fade-up" data-stagger="2">…</div>
<div data-animate="fade-up" data-stagger="3">…</div>
```

---

### Ebene 2 — Signature-Moment (Hero-Sequenz)

Kinetische Inszenierung für das Brand-Intro. Mehrstufige State-Sequenz —
keine alltägliche Komponente. **Sparsam einsetzen: idealerweise einmal pro Seite, typischerweise Hero.**

| Parameter | Wert |
|---|---|
| Markup-Hook | `data-hero-seq="cinematic"` |
| Aktivierung | Klasse `.hero-seq-on` |
| Stage-Klassen | `.hero-seq-bg` → `.hero-seq-content` → `.hero-seq-line1` → `.hero-seq-line2` → `.hero-seq-cloud` → `.hero-seq-cta` → `.hero-seq-stageout` |
| Dauer pro Stufe | `650–1400ms` (länger = dramatischer) |
| Easing | identisch zu Ebene 1 (`--motion-ease-entry`) |
| Parallax | `.parallax-container` + `.parallax-bg`, JS via `requestAnimationFrame`, `data-speed` |
| Parallax mobil | Deaktiviert auf Viewports < 768px |

---

### Ebene 3 — UI-Mikro-Transition

Feedback auf Interaktion: Hover, Focus, aktive States, Toggles, Öffnen/Schließen.
Unauffällig, schnell, **immer unter 350ms**.

| Parameter | Wert |
|---|---|
| Dauer | `120–300ms` (je kürzer, desto besser) |
| Default Easing | `ease` für Trivialfälle |
| Hover/Link | `cubic-bezier(0.25, 0.8, 0.25, 1)` (`--motion-ease-link`) |
| Überschießend | `cubic-bezier(0.34, 1.3, 0.64, 1)` (`--motion-ease-pop`) — z. B. Toast-in |
| Properties | `background-color`, `color`, `border-color`, `opacity`, `transform` |
| **Verboten** | `transition: all` bei Komponenten mit vielen Properties (außer einfachen Links) |

---

## Regeln, die immer gelten

### Reduced Motion ist Pflicht

Jede Animationsdefinition hat einen `prefers-reduced-motion`-Pfad:

```css
@media (prefers-reduced-motion: reduce) {
  /* Hero-Sequenz: alle Transitions deaktivieren */
  [data-hero-seq] * { transition: none !important; }

  /* Parallax: deaktiviert / statische Position */
  .parallax-bg { transform: none !important; }

  /* Loop- und Highlight-Animationen: Endzustand direkt setzen */
  [data-animate] {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

> Entry-Reveal (Ebene 1) darf bestehen bleiben, weil sehr kurz und opacity-dominiert.

### Animation ist vom Styling getrennt

Animationstrigger stehen als `data-*`-Attribute, niemals als semantische Layout-Klasse:

```
data-animate="fade-up"          Entry-Reveal (+ optional data-stagger)
data-hero-seq="cinematic"       Signature-Sequenz
data-scroll-panel="intro|focus|focus-wrap"   Scroll-Stories
```

Dieselbe visuelle Klasse kann animiert oder nicht animiert verwendet werden,
ohne ihre CSS-Klassen zu ändern.

### Keine spontanen neuen Timing-Werte

Neue Komponenten nutzen ausschließlich die definierten Tokens. Eine neue Dauer
oder ein neues Easing braucht Begründung und wird ins Motion-Token-Set
aufgenommen, bevor es verwendet wird.

**Ad-hoc-Timings sind nicht erlaubt:**
```css
/* ❌ Verboten */
transition: all 0.47s linear;

/* ✅ Korrekt */
transition: opacity var(--motion-dur-ui) var(--motion-ease-link);
```

### Performance-Grenzen

- Bewegung läuft auf `transform` und `opacity` — GPU-beschleunigt, kein Layout-Reflow
- Keine `top` / `left` / `width` / `height` für Motion
- Parallax und Scroll-reaktive Bewegungen werden über `requestAnimationFrame` gedrosselt

---

## Motion-Token-Referenz

Diese Tokens ergänzen `colors_and_type.css`:

```css
:root {
  /* Dauern */
  --motion-dur-entry:         800ms;   /* Ebene 1: Entry-Reveal */
  --motion-dur-signature-min: 650ms;   /* Ebene 2: Hero-Stage min */
  --motion-dur-signature-max: 1400ms;  /* Ebene 2: Hero-Stage max */
  --motion-dur-ui:            200ms;   /* Ebene 3: Mikro-Transition */

  /* Easings */
  --motion-ease-entry: cubic-bezier(0.215, 0.61, 0.355, 1); /* easeOutCirc */
  --motion-ease-link:  cubic-bezier(0.25, 0.8, 0.25, 1);    /* easeOut */
  --motion-ease-pop:   cubic-bezier(0.34, 1.3, 0.64, 1);    /* slight overshoot */

  /* Stagger */
  --motion-stagger-step: 80ms; /* Faktor × data-stagger-Wert */
}
```

---

## Kurz-Checkliste vor jedem Merge

- [ ] Hat die Animation einen der drei Gründe (Orientierung / Rhythmus / Signatur)?
- [ ] Wird ausschließlich `transform` / `opacity` animiert?
- [ ] Werden nur Token-Dauern und -Easings verwendet (keine ad hoc)?
- [ ] Ist `prefers-reduced-motion` abgedeckt?
- [ ] Sind Trigger via `data-animate` / `data-hero-seq` gesetzt, nicht via CSS-Klassen?
- [ ] Parallax auf mobile (`< 768px`) deaktiviert?
- [ ] Kein `transition: all` bei Komponenten mit vielen Properties?

---

*Indie.box Design System · MOTION.md · April 2026 · v1.0*
