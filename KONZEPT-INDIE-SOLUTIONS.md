# Konzept indie.solutions (Kanon für den Neuaufbau)

Stand: 2026-08-18.
**Maßgebliche Quelle der Wahrheit ist `BRIEFING-RELAUNCH-2026-08-18.md`** (von Heiko).
Es hat Vorrang vor `MASTER-PROMPT-RELAUNCH.md` und vor diesem Dokument, wo sie voneinander abweichen.
Der Master-Prompt bleibt gültig für alles, was das Briefing nicht regelt
(z. B. Faktenbasis, Preise, Qualitätsziele, Übersetzungs-Workflow).
Dieses Dokument fasst den Kanon zusammen und ergänzt Design-Details.
Repo-Status (main = Neuaufbau, Branch indiebox-live = alte Seite): siehe AGENTS.md.

Kern der aktuellen Ausrichtung (Briefing 2026-08-18):

- Zentrale Positionierung: **Souveräne KI**. Lokale KI ist eine wichtige Option, nicht die Marke.
- IndieSolutions ist kein Hardwareanbieter. Der **IndieStack** ist die technologische Plattform,
  Hardware ist eine mögliche physische Basis.
- Eigene Modelle, externe Modelle und Mischbetrieb sind gleichberechtigt. Wahlfreiheit und
  Erweiterbarkeit sind zentrale Verkaufsargumente ("Heute passend starten. Mit dem Bedarf weiterwachsen.").
- brainbot ist der optionale professionelle Integrationspartner, wird aber erst spät in der
  Dramaturgie eingeführt.
- Die Startseite bleibt bewusst einfach und verweist auf Vertiefungsseiten
  (/indiestack, /souveraene-ki, /models, /infrastruktur, /integration).
- Schreibweisen laut Briefing: **IndieStack**, **IndieSolutions**, Produkte klein als
  **indie.box, indie.booster, indie.rack, indie.workstation**.

## Marke & Naming (verbindlich)

- Absender: **IndieSolutions**. Marken-Schriftzug im Hero: `indie.solutions` (klein, Punkt als brand-dot).
- Plattform: **IndieStack**.
- Produktnamen klein in Punkt-Schreibweise: **indie.box, indie.booster, indie.rack, indie.workstation,
  indie.router, indie.care, indie.chat, indie.brain** (dazu: Agent Command Center, Agent Studio).
  Reihenfolge in Aufzählungen: box, booster, rack, workstation.
- Claim der Startseite: **"Souveräne KI für Ihr Unternehmen."**
- Preise: indie.box 5.500 €, indie.booster 8.000 €, indie.workstation 12.000 €, Vollausbau Box+Booster 13.500 €, indie.rack auf Anfrage. indie.care Basis 79 €/Monat, Business 179 €/Monat. indie.router 19 €/Monat oder 190 €/Jahr (bald verfügbar, geplanter Einführungspreis). Alle Preise netto.

## Positionierung

Eine technologische Plattform für souveräne KI im Unternehmen, für den deutschen Mittelstand
und Verwaltungen. Der IndieStack verbindet Unternehmensdaten, bestehende Systeme, Anwendungen,
Prozesse, Benutzer und Zugriffsregeln mit der KI, die zur Aufgabe passt. Eigene Recheninfrastruktur
ist eine mögliche physische Basis, kein Produktversprechen. Die Software-Suite ist auf jeder
Hardware enthalten, ohne Nutzergebühren.
Souveränität heißt: das Unternehmen entscheidet. Sie setzt nicht voraus, alles lokal zu betreiben;
Mischbetrieb aus eigenen und externen Modellen ist ausdrücklich Teil des Konzepts.
Qualitätsmaßstab Gestaltung: Apple, Teenage Engineering, Framework. Reduziert, präzise.
Nach dem Cutover wird indiebox.ai ein Redirect auf indie.solutions.

## Sprache & Tonalität (aus Master-Prompt, verbindlich)

- Deutsch ist Master, Englisch wird generiert (Workflow: TRANSLATION.md), Englisch kommt als späterer Schritt.
- **Kein Du.** Sie oder neutral. Neutral, wo es ohne direkte Ansprache geht; "Sie" wo nötig (Formulare, Checkout, Statusmeldungen).
- **Verboten:** zeitbasierte Produktivitätsversprechen ("Stunden statt Wochen" etc.).
- **Verbotene Begriffe** (Briefing Abschnitt 22): Transformation, AI Journey, End-to-End, Next Generation, Cutting Edge, Holistic, Empowerment.
- Nicht "Kontrolle", "Sicherheit" und "Datensouveränität" behaupten, sondern zeigen, was das Unternehmen entscheiden kann. "Lokal" nicht als Dauerformel wiederholen; die Startseite spricht von souveräner KI.
- Nutzen vor Produkt: erster Satz jeder Sektion funktioniert ohne Produktnamen. Natürlich formulieren, keine gestelzten Inversionen.
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
- Keine Werbenetzwerke, keine Social-Plugins, keine externen Schriften: Fonts self-hosten,
  alles gebündelt im Repo. Einzige Ausnahme ist die Reichweitenmessung mit Matomo
  (Entscheidung Heiko 2026-08-18), cookieless als Default und ablehnbar über das Consent-Banner.

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
- assets/indie-solutions/backgrounds/ — Hero-Bühne stage_web.jpg (Interim) und drei ältere
  Streifen (dark-concrete, light-industrial, dark-cinematic).
- assets/indie-solutions/cutouts/ — vier Freisteller als WebP (Interim, aus den Referenzfotos).
- Hardware-Referenzen (Briefing Abschnitt 7): indie.box GMKtec EVO-X2, indie.booster Razer eGPU
  mit ausgeschalteter Beleuchtung, indie.rack ASUS ESC8000A-E13P als 19-Zoll-Rack,
  indie.workstation Fractal Design Define 7 XL Black Solid (deutlich höher, steht rechts).
- Bildregeln: keine Produktnamen oder Diagramme in Bildern, keine erfundenen Anschlüsse, Logos,
  Displays oder LEDs, keine generative Neuinterpretation der definierten Hardware, keine
  Fremdmarken-Pressebilder, im Hero Freiraum für die Headline.
- Bildsprache: hochwertige industrielle Produktfotografie, dunkler Beton, kontrolliertes Licht,
  ruhig und präzise. Nicht: Cyberpunk, Hologramme, KI-Gehirne, Roboter, Datenströme,
  leuchtende Netzwerkleitungen, generische Security-Schlösser, Stockfotos von Menschen.


## Startseite (Dramaturgie laut Briefing, Abschnitte 6 bis 17)

1. Hero: H1 "Souveräne KI für Ihr Unternehmen.", Subline zum IndieStack, CTAs
   "Einsatzgebiet besprechen" / "IndieStack entdecken". Visual in getrennten Ebenen:
   Hintergrund, Freisteller, IndieStack-Ebene und Typografie als HTML/CSS.
   Reihenfolge indie.box → indie.booster → indie.rack → indie.workstation.
2. Nutzen: drei Bereiche (Wissen, Arbeit, Neue Möglichkeiten) mit einfachen abstrahierten Flows.
3. Warum IndieStack: Hub-Diagramm (Mitarbeiter/Anwendungen/Prozesse über dem IndieStack,
   Daten/Systeme/Modelle darunter).
4. Modellwahl: eigene/externe Modelle → IndieStack → Anwendungen. Prominent "Bring your own model."
5. Souveränität: vier Dimensionen (Daten, Zugriff, Systeme, Externe KI) plus Architektur-Flow.
6. Schnell wirksam: Weg Einsatzgebiet → Integration → produktive Nutzung → Ausbau.
7. Wachstum: "Heute passend. Morgen erweiterbar.", Hardwarefamilie als Entwicklungspfad.
8. Hardware-Produktfamilie: vier Karten mit je einem Satz, Details auf den Produktseiten.
9. brainbot: "Sie müssen den Weg nicht alleine gehen.", Rollen IndieSolutions/brainbot.
10. Proof: "Souveräne KI in der Praxis.", Branchen-Cases.
11. Abschluss: "Wo kann KI in Ihrem Unternehmen als Erstes wirksam werden?" plus CTAs.

Verbindliche Bauregel unverändert: Text und Diagramme werden NIE in Bilder gerendert.
Bilder liefern nur Szene und Produkte, alles Textliche ist HTML (übersetzbar, barrierefrei).
Interims-Assets: Freisteller aus Referenzfotos (assets/indie-solutions/cutouts/), Bühne
stage_web.jpg. Finale Assets liefert Heiko, siehe OFFENE-FRAGEN.md Nr. 25.

## Offene Punkte

- Fremdlogos auf Produktbildern für den Live-Gang klären.
- Platzhalter laut Master-Prompt: Erklärvideo, Workstation-/Vollausbau-Benchmarks,
  Router-Token-Kontingent, Referenz-Firmennamen.
- Cutover-Schritte: siehe AGENTS.md Status-Block.

## Changelog

- 2026-08-18: Briefing-Relaunch eingecheckt und zur maßgeblichen Quelle erklärt; Startseiten-
  Dramaturgie auf "Souveräne KI / IndieStack als Plattform" umgestellt. Ersetzt den Pivot-Block
  "Der Indie-Stack ist das Produkt" vom selben Tag und die Hardware-zuerst-Dramaturgie des
  Master-Prompts (alte Fassungen: Git-Historie).
- 2026-08-18: Hero "One Platform. Four Scales." samt Feature-Leiste durch das Briefing-Hero ersetzt.
- 2026-08-18: Vergleichs-Sektion "EU-Hosting ist nicht Souveränität." von der Startseite genommen,
  weil sie Souveränität mit Nur-lokal gleichsetzt und damit der Mischbetriebs-Positionierung des
  Briefings widerspricht (siehe OFFENE-FRAGEN.md Nr. 29).
- 2026-08-18: Flache Produkt-URLs (/indie-box/ statt /produkte/indie-box/) und einheitliche
  Navigation (IndieStack vor Produkte, CTA "Einsatzgebiet besprechen") auf allen 52 Seiten.
- 2026-08-18: Kanon-Abschnitte Marke, Positionierung, Sprache, Farben und Assets auf den
  Briefing-Stand gebracht (nur der geltende Regeltext steht im Dokument; frühere Fassungen
  in der Git-Historie). Betrifft: Schreibweisen klein, Plattform statt Hardware-Familie,
  Verbotsliste Buzzwords, Matomo als einzige Drittressource, Hardware-Referenzen und Bildsprache.
