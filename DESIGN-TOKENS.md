# Design-Token- und Komponenten-Katalog (extrahiert aus der Bestandsseite)

Erstellt für den Relaunch indiebox.ai → indie.solutions (Master-Prompt Abschnitt 1, Punkt 1).
Quelle: style.css, script.js, index.html der Bestandsseite. Diese Vorgaben werden übernommen, nicht neu erfunden.
Neue Komponenten des Relaunchs stehen am Ende von style.css im Block "INDIE.SOLUTIONS RELAUNCH".

## 1. CSS Custom Properties (:root)

Das System hat zwei parallele Token-Sets: Legacy-Kurznamen (aktiv in fast allen Komponenten) und ein neueres Langform-Set (--color-*, --space-*, --radius-*). Die Startseiten-Komponenten referenzieren fast ausschließlich die Legacy-Tokens.

### 1.1 Farben (Legacy, real benutzt)
| Token | Wert |
|---|---|
| --primary-color | #0A2540 (Deep Navy; im Neuaufbau nicht verwenden, Kanon) |
| --accent-color | #FF4D00 (International Orange, einziger Akzent) |
| --text-dark | #1A1A1A |
| --text-light | #555555 |
| --bg-white | #FFFFFF |
| --bg-light | #F7F9FC |
| --border-light | #E0E6ED |
| --bg-dark | #0b1118 |
| --bg-neutral | #f0f2f5 |
| --bg-dark-metal | radial-gradient(1200px 700px at 20% 30%, rgba(91,153,182,0.18), transparent 60%), #0b1118 |

### 1.2 Gradients
| Token | Wert |
|---|---|
| --gradient-prism | linear-gradient(95deg, #c2410c 0%, #f97316 35%, #fb923c 68%, #fdba74 100%) |
| --gradient-hero-dark | linear-gradient(95deg, #f2f5f7 0%, #c7d4dc 35%, #7b93a7 70%, #415b6f 100%) |
| --gradient-hero-light | linear-gradient(95deg, #0e2436 0%, #243b4f 40%, #3c576b 70%, #516c81 100%) |
| --gradient-signature | var(--gradient-prism) |

Anwendungsklassen: .gradient-signature, .gradient-light, .gradient-text.

### 1.3 Typografie-Tokens
| Token | Wert |
|---|---|
| --t-display-1 | clamp(3.3rem, 7.9vw, 7rem) |
| --t-display-2 | clamp(2.35rem, 5.4vw, 4.4rem) |
| --t-title | clamp(1.7rem, 3.4vw, 2.5rem) |
| --t-subhead | clamp(1.1rem, 2.1vw, 1.6rem) |
| --t-body-lg | 1.1rem |
| --t-body | 1rem |
| --t-body-sm | 0.9rem |
| --t-small | 0.85rem |
| --t-ui | 0.95rem |

Gewichte: 400/500/600/700 (Inter, jetzt self-hosted als Variable Font 100-900, damit sind auch die im CSS verwendeten 650/800 echt).

### 1.4 Abstände / Layout
--container-max: 1100px, --spacing-sm: 1rem, --spacing-md: 2rem, --spacing-lg: 4rem.
Story: --story-gap: clamp(2.5rem, 6vh, 4.5rem), --story-box-width: 1040px, --story-text-inset: clamp(3rem, 6vw, 5.5rem).

### 1.5 Panel-Tokens (NEU im Relaunch, Kanon aus KONZEPT)
--panel-fill: rgba(255,255,255,0.05), --panel-border: rgba(255,255,255,0.14), --panel-divider: rgba(255,255,255,0.12), --panel-radius: 10px. Für alle Diagramm-/Panel-Elemente auf dunklen Flächen.

### 1.6 Schatten und Motion
--shadow-glow: 0 0 32px rgba(255,77,0,0.35). Kernkomponenten nutzen hartkodierte Radien (Karten 22-28px) und Schatten; beim Weiterbauen die vorhandenen Literale der jeweiligen Komponente spiegeln.

## 2. Schrift

Inter, self-hosted unter assets/fonts/ (variable, latin + latin-ext), eingebunden via @font-face in style.css. Google-Fonts-Requests sind entfernt (Grundsatz: kein Laufzeit-Request an Dritte).
body { font-family: var(--font-main); line-height: 1.6; }

## 3. Navigation

Struktur: nav.nav-bar > .container.nav-container > a.nav-logo (+ span.brand-dot) + .nav-links + .nav-actions (.nav-toggle für mobil).
- .nav-bar: weiß, sticky top, z-index 100. Unterseiten nutzen genau das.
- .nav-bar--floating (+ .nav-bar--visible via setupNavReveal, IntersectionObserver auf .hero-overlay): Startseiten-Muster, Nav erscheint nach dem Hero.
- Mobile unter 768px: .nav-open auf .nav-bar, Menü als absolutes Panel, setupMobileNav.
- NEU im Relaunch: .nav-item/.nav-dropdown (Dropdown-Menüs für Produkte und Software), .nav-lang (DE/EN-Umschalter). JS: setupNavDropdowns.

## 4. Buttons

.button Basis + Shape .button--pill + Größe --sm/--md/--lg + Treatment --solid/--plain-light/--plain-dark. Prism nie auf Buttons. Kombination immer vollständig, z. B. `button button--solid button--pill button--sm`.

## 5. Sektions- und Kartensysteme (wiederverwendet)

- .section + .container; .section-heading.
- Story: .story-panel--intro (hell, weiße Karte), .story-panel--focus (dunkel #081a2b), .story-kicker, .story-display, .story-text.
- Box-Stack (dunkel): .box-stack > .box (28px Radius, dunkle Karte), .box-kicker, .box-display, .box-body, .box-meta, .box-tag; .box:nth-child(2) bekommt Metal-Hintergrund.
- Software-Kapitel: .capability-cards (eigenes --cap-* Subtheme, dunkel), .cap-card (+ --flip), .cap-card__num (01 / …), .cap-card__title (em = Orange), .cap-card__body, .cap-card__pills > .cap-pill, .cap-card__visual.
- Karten hell: .card (12px Radius, Hover-Lift), .grid-2/.grid-3.
- Vergleich: .comparison-grid > .comparison-item (+ --highlight mit Prism-Rahmen) > .comparison-card (--positive Häkchen-Liste, --negative Minus-Liste), .comparison-head, .comparison-label, .symbol-list.
- Spezifikation: .spec-card--full, .spec-visual, .spec-content, .spec-kicker, .spec-title, .spec-list, .spec-checks; Tabs via .spec-explorer__* + data-spec-explorer (ARIA + Pfeiltasten fertig).
- Info-Kapitel: .info-section (dunkel metal) / .info-section--light, .info-card, .info-title--display-2, .info-text--lead, .text-link.
- .glow-frame (+ --outer) für Premium-Callouts auf hellen Flächen.
- Overlay: .cta-overlay (+ --dark/--metal), Trigger data-overlay-open="id", Schließen data-overlay-close/Escape/Backdrop; body.overlay-scrim-on.
- Combi-Pill: .combi-pill (+ --flat, --animated) mit .combi-pill-text und .combi-pill-action; Preis-Pill der Bestandsseite. Im Hero absolut unten rechts (.hero-actions-pill). NEU: .sticky-pill (fixe Variante unten rechts nach dem Hero, Produktwechsel via data-pill-Attribute, setupStickyPill).
- Formulare: .form-grid, .form-row (+ --full), .form-label, .form-input, .form-textarea, .form-actions, .field-required; Mailto-Versand via form[data-mailto-to] + setupMailtoForms. NEU: .form-select im gleichen Stil.
- Tabellen: .docs-table (Content), .specs-table/.spec-row (Pseudo-Tabelle).
- Akkordeon: details.docs-details bzw. .form-details.
- FAQ (Vertiefung): div.faq-list > details.faq-item > summary + div.faq-item__body; Variante .faq-list--on-dark für dunkle Sektionen. Chevron per CSS, reduced-motion abgedeckt.
- Ehrlichkeits-Box (Vertiefung): .honest-box mit .honest-box__title, Liste und optionaler .honest-box__note. Für "Was nicht dabei ist"-Abschnitte auf hellen Flächen.

## 6. Hell/Dunkel-Kapitellogik

Kein globales Theme; pro Sektion Modifier-Klassen. Dunkel: --bg-dark/--bg-dark-metal (.box-stack, .info-section, .capability-cards, .story-panel--focus). Hell: --bg-light (.story-panel--intro, .use-cases, section mit bg-light), Karten weiß. Der Relaunch-Rhythmus (8 Kapitel dunkel/hell) wird über diese vorhandenen Sektionstypen abgebildet.

## 7. Animations-Hooks

- Scroll-Reveal: data-animate="fade-up" + optional data-stagger="1..6" (Stufen 4-6 NEU). JS IntersectionObserver (threshold 0.1, -50px unten), einmalig.
- Parallax: .parallax-container > .parallax-bg mit data-speed (Default 0.2), auf Mobil (768px) deaktiviert.
- Hero-Sequenz: data-hero-seq="cinematic" (Klassen-Statemachine, siehe STYLE_GUIDE.md).
- prefers-reduced-motion: Hero-Sequenz und Combi-Pill waren abgedeckt; NEU ergänzt: fade-up erscheint sofort, Parallax aus, Upgrade-Pfad statisch.

## 8. Footer

.footer (Navy) > .footer-content (.footer-brand, .footer-contact) + .footer-bottom (.legal-links). NEU: .footer-sov (Souveränitäts-Zeile "Diese Website lädt nichts von Dritten.").

## 9. Kicker und Pills

Uppercase-Kicker: je Sektion eigene Klasse (.box-kicker, .story-kicker, .spec-kicker, .cap-eyebrow, …), alle --t-small/700/0.14em. NEU: .kicker Basisklasse (+ .kicker--on-dark) für neue Sektionen.
Tag-Pills: .cap-pill (Fläche) und .box-tag (Gradient-Text). NEU: .badge-soon ("Bald verfügbar").

## 10. Breakpoints

Hauptbreakpoint 768px (Nav mobil, Grids einspaltig, Parallax aus). Sekundär: 980/900/840/820/680px komponentenlokal. Ausschließlich max-width-Queries.

## 11. Neue Relaunch-Komponenten (Block "INDIE.SOLUTIONS RELAUNCH" in style.css)

Nav-Dropdown (.nav-item, .nav-dropdown), DE/EN-Umschalter (.nav-lang), Kicker-Basis (.kicker), Badge (.badge-soon), Panel-Tokens (--panel-*), Versprechen-Sektion (.promise-*), Produktfamilien-Karten (.family-*), Zwei-Achsen-Matrix (.matrix-*), Upgrade-Pfad (.upath-*), Stack-Diagramm (.stack-*), Referenz-Karten (.ref-*), Vier-Spalten-Vergleich (.compare4), Video-Platzhalter (.video-ph), Sticky-Preis-Pill (.sticky-pill), Seiten-Hero für Unterseiten (.page-hero), Querverweise (.crosslinks), .form-select.
