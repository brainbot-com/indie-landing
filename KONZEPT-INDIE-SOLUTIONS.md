# Konzept indie.solutions (Kanon für den Neuaufbau)

Stand: 2026-08-17. Verbindlich für alle Sessions und Agents, die am Neuaufbau arbeiten.
Abgestimmte Inhalte hier nur ergänzen oder präzisieren, nicht neu erfinden.
Repo-Status (main = Neuaufbau, Branch indiebox-live = alte Seite): siehe AGENTS.md.

## Marke & Naming

- Marke: **indie.solutions** (klein geschrieben, mit Punkt, auch am Satzanfang).
- Claim: **"One Platform. Four Scales."** (bleibt in beiden Sprachversionen englisch).
- Produktlinie (Namen in Versalien, Taglines englisch, in beiden Sprachen identisch):
  | Produkt | Tagline | Referenzbild |
  |---|---|---|
  | INDIE.BOX | Local AI. Compact. | assets/indie-solutions/products/indie-box_reference.png |
  | INDIE.BOX GPU | Accelerated AI. | assets/indie-solutions/products/indie-booster_reference.jpeg |
  | INDIE WORKSTATION | High Performance AI. | assets/indie-solutions/products/indie-workstation_reference.png |
  | INDIE RACK | Enterprise AI. | assets/indie-solutions/products/indie-rack_asus-reference.png |

## Positionierung

Die gleiche souveräne KI-Plattform für jede Anforderung die passende Hardware:
ein Software-Stack, vier Hardware-Skalen (kompakt bis Enterprise-Rack). Zielgruppe B2B.
Nach dem Cutover wird indiebox.ai ein Redirect auf indie.solutions.

## Sprache & Tonalität

- Deutsch ist Master, Englisch wird generiert (Workflow: TRANSLATION.md).
- **Kein Du.** Neutral formulieren, wo es ohne direkte Ansprache geht
  ("auf der eigenen Plattform" statt "auf deiner Plattform").
  **"Sie"**, wo direkte Ansprache nötig ist (Checkout, Formulare, Status- und
  Fehlermeldungen: "Sie erhalten in Kürze …").
- Englisch bleibt "you", davon unberührt.
- Tonalität weiterhin nach AGENTS.md: positiv, selbstbewusst, klar positioniert,
  mit Detail-Ebenen für kritische Leser.
- Admin-Bereich bleibt English-only (AGENTS.md).

## Hero-Konzept "Variante 1"

- Bühne: dunkle, kinoartige Betonhalle; die vier Produkte stehen wie fotografiert
  auf dem Boden, darüber schwebt das Stack-Diagramm als dezentes Panel.
- Links: Zeile "indie.solutions", Headline "One Platform. Four Scales.", Subline
  "Die gleiche souveräne KI-Plattform – für jede Anforderung die passende Hardware."
- Stack-Diagramm "INDIE SOLUTIONS STACK" als HTML/CSS (kein Bild), Ebenen von oben
  nach unten (verbindliche Begriffe):
  1. Anwendungen & Agents: Wissensarbeit, Prozessautomatisierung, Datenanalyse,
     Dokumentenverarbeitung, Individuelle Agents
  2. API & Integration
  3. Modell-Orchestrierung & Workflows
  4. Modell-Management | Daten & Knowledge | Sicherheit & Governance (eine Reihe)
  5. Lokale Inferenz-Engine
  6. Hardware-Abstraktion
- Produkte per dünner Orange-Linie mit dem Stack verbunden, Tagline mit kurzem
  Unterstrich in Akzentfarbe.
- Mock-Referenz: assets/indie-solutions/mockups/hero-variante-1.png (sobald eingecheckt).

## Farben & Stil (Neuaufbau)

- Basis sind die Tokens in style.css (:root). Einziger Farbakzent: **--accent-color**
  (#FF4D00). --primary-color (Navy) im neuen Design nicht verwenden.
- Dunkle Flächen: --bg-dark / --bg-dark-metal oder die Hintergründe aus
  assets/indie-solutions/backgrounds/.
- Diagramm-/Panel-Elemente: Füllung rgba(255,255,255,0.05), Rand 1px
  rgba(255,255,255,0.14), Trenner rgba(255,255,255,0.12), Radius ~10px.
  Beim ersten Verwender als Tokens anlegen (--panel-fill, --panel-border,
  --panel-divider) und danach nur noch über die Tokens nutzen.
- Text auf Panels: Weiß ~85% Deckkraft, Uppercase, --t-small/--t-ui.
- Icons: weiße Line-Icons als Inline-SVG (stroke: currentColor). Keine Emojis,
  keine Icon-Fonts, keine externen Ressourcen (strikte CSP).
- Glow sparsam, Orientierung: --shadow-glow und STYLE_GUIDE.md "Glow Frame".

## Assets

- assets/indie-solutions/products/ — Produkt-Referenzfotos. Achtung: ASUS- und
  Razer-Logos sichtbar; vor dem Live-Gang klären, ersetzen oder retuschieren.
- assets/indie-solutions/backgrounds/ — drei Hero-Hintergründe (dark-concrete,
  light-industrial, dark-cinematic).

## Offene Punkte

- Hero-Mock einchecken (assets/indie-solutions/mockups/hero-variante-1.png).
- Fremdlogos auf Produktbildern für den Live-Gang klären.
- Cutover-Schritte: siehe AGENTS.md Status-Block.
