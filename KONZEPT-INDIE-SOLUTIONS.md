# Konzept indie.solutions (Kanon für den Neuaufbau)

Stand: 2026-08-17, aktualisiert nach Eingang des Master-Prompts.
**Inhaltliche Quelle der Wahrheit ist `MASTER-PROMPT-RELAUNCH.md`** (von Heiko, 2026-08-17).
Dieses Dokument fasst den Kanon zusammen und ergänzt Design-Details, die der Master-Prompt offen lässt.
Frühere Stände dieses Dokuments (Claim "One Platform. Four Scales.", Versalien-Namen wie INDIE.BOX GPU)
sind durch den Master-Prompt ersetzt.
Repo-Status (main = Neuaufbau, Branch indiebox-live = alte Seite): siehe AGENTS.md.

## Marke & Naming (aus Master-Prompt, verbindlich)

- Absender: **Indie.Solutions**. Marken-Schriftzug im Hero: `indie.solutions` (klein, Punkt als brand-dot).
- Claim: **"Souveräne KI für den Arbeitsalltag."** Subclaim: "Wir machen souveräne KI einfach."
- Produktnamen immer in Punkt-Schreibweise: **Indie.box, Indie.booster, Indie.workstation, Indie.rack, Indie.router, Indie.care, Indie.chat, Indie.brain** (dazu: Agent Command Center, Agent Studio).
- Preise: Indie.box 5.500 €, Indie.booster 8.000 €, Indie.workstation 12.000 €, Vollausbau Box+Booster 13.500 €, Indie.rack auf Anfrage. Indie.care Basis 79 €/Monat, Business 179 €/Monat. Indie.router 19 €/Monat oder 190 €/Jahr (Coming soon, geplanter Einführungspreis).

## Positionierung

Souveräne, lokale KI für den deutschen Mittelstand und Verwaltungen. Eine Hardware-Familie,
eine Software-Suite (auf jeder Hardware enthalten, ohne Nutzergebühren), ein Enterprise-Segment.
Wettbewerbs-Kernsatz: "EU-Hosting ist nicht Souveränität."
Qualitätsmaßstab Gestaltung: Apple, Teenage Engineering, Framework. Reduziert, präzise.
Nach dem Cutover wird indiebox.ai ein Redirect auf indie.solutions.

## Sprache & Tonalität (aus Master-Prompt, verbindlich)

- Deutsch ist Master, Englisch wird generiert (Workflow: TRANSLATION.md), Englisch kommt als späterer Schritt.
- **Kein Du.** Sie oder neutral. Neutral, wo es ohne direkte Ansprache geht; "Sie" wo nötig (Formulare, Checkout, Statusmeldungen).
- **Verboten:** zeitbasierte Produktivitätsversprechen ("Stunden statt Wochen" etc.). Stattdessen Prozess-Sprache: "Auspacken. Anschließen. Loslegen."
- Nutzen vor Produkt: erster Satz jeder Sektion funktioniert ohne Produktnamen.
- Kurze Sätze, Punkt-Rhythmus, keine Buzzwords, keine Superlative ohne Beleg, konkrete Zahlen statt Adjektive.
- Sprach-Mechaniken: Nutzen-Subline unter jeder Headline, Risiko-Umkehr am CTA, Zielgruppen-Label über Sektionen, Feature-Name plus genau ein erklärender Satz.
- Umlaute immer als ä/ö/ü/ß.
- Admin-Bereich bleibt English-only (AGENTS.md).

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
- **Kein einziger Laufzeit-Request an Dritte** (Master-Prompt, nicht verhandelbar): Fonts self-hosten,
  kein Tracking auf den neuen Seiten, alles gebündelt im Repo.

## Stack-Diagramm (verbindliche Ebenen-Begriffe)

Als HTML/CSS (kein Bild), Ebenen von oben nach unten:
1. Anwendungen & Agents
2. API & Integration
3. Orchestrierung & Workflows
4. Modell-Management | Daten & Knowledge | Sicherheit & Governance (eine Reihe)
5. Inferenz-Engine
6. Hardware-Abstraktion

## Assets

- assets/indie-solutions/products/ — Produkt-Referenzfotos. Achtung: ASUS- und
  Razer-Logos sichtbar; vor dem Live-Gang klären, ersetzen oder retuschieren.
- assets/indie-solutions/backgrounds/ — drei Hero-Hintergründe (dark-concrete,
  light-industrial, dark-cinematic).
- Bildregeln (Master-Prompt): Booster im Bild immer neben der Box, Beleuchtung aus.
  Indie.rack immer als 19-Zoll-Rack. Schreibtisch-Szenen nur auf der Indie.box-Produktseite.
  Keine Fremdmarken-Pressebilder, kein Text/Logos in Bildern, im Hero Freiraum für die Headline.

## Offene Punkte

- Fremdlogos auf Produktbildern für den Live-Gang klären.
- Platzhalter laut Master-Prompt: Erklärvideo, Workstation-/Vollausbau-Benchmarks,
  Router-Token-Kontingent, Referenz-Firmennamen.
- Cutover-Schritte: siehe AGENTS.md Status-Block.
