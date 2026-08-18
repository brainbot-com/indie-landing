# Vorgabe: Produktseiten auf volle Tiefe (Vertiefungs-Schritt 1)

Verbindliche Arbeitsgrundlage für die Vertiefung der vier Produktseiten.
Übergeordneter Kanon: `MASTER-PROMPT-RELAUNCH.md` (Fakten und Sprache), `STYLE_GUIDE.md` und
`DESIGN-TOKENS.md` (Gestaltung), `REVIEW-PROTOKOLL.md` (bereits eingearbeitete Persona-Findings).
Reihenfolge laut Master-Prompt Abschnitt 5: Box zuerst, dann Workstation, Booster, Rack.

## 0. Die eine Regel, die über allem steht

**Nichts erfinden.** Jede Zahl, jede Spezifikation, jede Zusage muss aus einer der unten genannten
Quellen stammen. Wenn eine naheliegende Angabe fehlt (Leistungsaufnahme, Garantiedauer, Tokens/s,
Rack-Konfiguration), gibt es genau zwei erlaubte Wege:

1. Die Aussage weglassen.
2. Sie als gekennzeichneten Platzhalter führen ("Werte werden auf der Zielhardware gemessen und
   dann hier veröffentlicht").

Verboten ist der dritte Weg: eine plausible Zahl hinschreiben. Offene Punkte gehören in
`OFFENE-FRAGEN.md`, nicht auf die Seite. Eine FAQ-Frage, deren Antwort wir nicht belegen können,
kommt nicht auf die Seite; eine unbeantwortete Frage ist schlechter als eine fehlende.

## 1. Erlaubte Faktenquellen

| Quelle | Was daraus verwendet werden darf |
|---|---|
| `MASTER-PROMPT-RELAUNCH.md` Abschnitt 3 | Alle Preise, Hardware-Eckdaten, Rollen, Modell-Lineup, Lieferaussage, Care-Konditionen |
| `betriebs.html` | Betriebsfakten: gehärtetes Linux, getrennte Container je Anwendung, Dashboard und Admin-Interface, Browser-Zugriff im lokalen Netz, lokale Nutzerverwaltung plus optionales Business-Login (SSO/LDAP), n8n-Workflows und Integrationen, planbare Updates (optional automatisch), vorinstallierte und erweiterbare Modelle, getrennte Datenbereiche mit Backup und Wiederherstellung, Netzintegration und HTTPS, eigene Anwendungen und Partnerlösungen |
| `privacy.html` | Datensicherheits-Aussagen: lokale Verarbeitung, keine Telemetrie, externe Dienste standardmäßig deaktiviert und nur bewusst freizugeben, Administratorzugriff gehört zur eigenen Organisation, Air-Gap-Betrieb möglich |
| `docs/` | Technische Details zu Einrichtung, Zugriff, Wissensdatenbanken, Shell-Zugang, Fehlerbehebung (nur als Verweis oder zur Absicherung einer Aussage) |
| `terms.html` (AGB) | Vertragliche Konditionen: Zahlung fällig mit Vertragsschluss, Rechnungskauf mit Zahlungsziel als abweichende Vereinbarung möglich, Eigentumsvorbehalt, Widerrufsrecht. Nur zitieren, nicht auslegen; bei Zitat auf `/terms.html` verlinken |
| Bestehende v1 der Seite | Alles, was schon dort steht, bleibt gültig |

**Wichtig bei der Übernahme aus `betriebs.html`:** Dort steht die Überschrift "Inbetriebnahme: in
wenigen Minuten arbeitsbereit". Zeitversprechen sind verboten (Master-Prompt Abschnitt 2). Beim
Übernehmen umformulieren in Prozess-Sprache: "Auspacken. Anschließen. Loslegen." bzw. beschreiben,
**was** passiert, nicht **wie schnell**.

## 2. Verbindlicher Sektionsplan je Produktseite

Reihenfolge einhalten, damit alle vier Seiten gleich lesbar sind. Hell/Dunkel im Wechsel nach dem
Muster der bestehenden Seiten (Hero dunkel, dann abwechselnd `.section` und
`.section` mit `style="background-color: var(--bg-light);"`).

1. **Hero** (bleibt inhaltlich, nur schärfen falls nötig). Kicker, H1 mit einem `<em>`-Akzentwort, Nutzen-Subline, CTA-Zeile, Hero-Note mit Konditionen, Produktbild.
2. **Spezifikation in voller Tiefe.** Statt zwei Karten jetzt eine gruppierte Tabelle (`.docs-table` in einem `div` mit `overflow-x: auto`) mit den Gruppen, die für das Produkt belegt sind: Rechenleistung, Speicher, Software-Stack, Anschluss und Betrieb. Danach ein Absatz, der die wichtigste Zahl **einordnet** (warum 128 GB, warum 32 GB VRAM, warum 64 GB plus GPU). Nicht belegte Zeilen weglassen.
3. **Was damit möglich ist.** Drei bis vier `.card` in `.grid-3`, je mit `.kicker`, kurzer Überschrift und zwei bis drei Sätzen: konkrete Arbeitssituationen aus der Software-Suite (Dokumente befragen, Firmenwissen durchsuchen, Aufgaben von Agenten erledigen lassen, Team-Bereiche trennen). Führt mit der Arbeitssituation, nicht mit dem Produktnamen.
4. **Lieferumfang und Grenzen.** Zweiteilig: links bzw. oben eine `.spec-checks`-Liste "Im Lieferumfang enthalten" (Hardware, vorinstallierter Stack, Software-Suite, erste 3 Monate Indie.care Basis, Setup). Darunter eine `.honest-box` mit dem Titel "Was nicht dabei ist" und den ehrlichen Grenzen des jeweiligen Produkts (siehe Abschnitt 3 je Produkt). Diese Sektion ist Markenkern, sie wird nicht weichgespült.
5. **Inbetriebnahme und Betrieb.** Was beim Aufstellen passiert und wie das System im Alltag läuft, auf Basis von `betriebs.html`: Netzwerk und Strom, Browser-Zugriff im lokalen Netz, Nutzerverwaltung lokal oder per Business-Login, getrennte Container je Anwendung, planbare Updates, Backup und Wiederherstellung. Prozess-Sprache, keine Zeitangaben. Abschluss: Textlink auf `/betriebs.html` ("Betrieb im Detail").
6. **Datensicherheit auf dieser Stufe.** Drei bis fünf Sätze, was konkret für dieses Produkt gilt: lokale Verarbeitung, keine Telemetrie, externe Dienste standardmäßig aus, Air-Gap möglich. Beim Rack zusätzlich: dedizierte Hardware je Organisation. Abschluss: Textlink auf `/privacy.html`.
7. **Abgrenzung: Wann diese Stufe, wann eine andere.** Ehrliche Zuordnung mit `.crosslinks` auf die anderen drei Produkte und `/care/`. Je Link ein `small` mit dem Grund, wann man dorthin wechselt. Diese Sektion darf und soll auch vom eigenen Produkt abraten, wenn eine andere Stufe besser passt.
8. **FAQ.** Fünf bis sieben Fragen als Richtwert, mehr nur bei belegtem Bedarf (Regeländerung vom 2026-08-17 nach dem Beschaffungs-Persona-Review: Die Indie.box-Seite führt als Flaggschiff zehn Fragen, weil drei Fragen aus konkretem Beschaffungsbedarf ergänzt wurden, siehe REVIEW-PROTOKOLL.md. Jede zusätzliche Frage braucht eine belegbare Antwort.) als `<details class="faq-item">` in `<div class="faq-list">`, Muster:
   ```html
   <div class="faq-list">
     <details class="faq-item">
       <summary>Frage in natürlicher Sprache?</summary>
       <div class="faq-item__body"><p>Antwort.</p></div>
     </details>
   </div>
   ```
   Nur Fragen, deren Antwort aus Abschnitt 1 belegbar ist. Kandidaten je Produkt in Abschnitt 3.
9. **Abschluss-CTA** (bestehende `.final-cta` bzw. beim Rack das Anfrageformular). Bleibt wie gebaut.

Zielumfang je Seite: etwa 450 bis 600 Zeilen. Kein Füllmaterial, lieber eine Sektion knapp als eine
Behauptung ohne Deckung.

## 3. Produktspezifische Vorgaben

### Indie.box (`produkte/indie-box/index.html`)

Belegte Fakten: 5.500 € netto einmalig; AMD Ryzen AI Max 395, 16 Kerne; NPU 50 TOPS; 128 GB
High-Speed RAM; 2 TB NVMe SSD; quantisierte Großmodelle bis zur 400B-Klasse; Llama 4 Maverick
(400B MoE) als Flaggschiff, GPT-OSS 120B als Reasoning-Klasse, Qwen 3.6 35B-A3B als Alltagsmodell;
Lieferzeit normalerweise 14 Tage inklusive Setup; erste 3 Monate Indie.care Basis enthalten;
14 Tage Geld-zurück-Garantie; komplette Software-Suite im Kaufpreis ohne Nutzergebühren.

Einordnung der Kernzahl: 128 GB gemeinsamer Speicher sind die Voraussetzung, damit ein Modell der
400B-Klasse quantisiert überhaupt in den Speicher passt. Genau das unterscheidet die Box von einer
GPU-Karte mit 32 GB.

"Was nicht dabei ist": keine gemessenen Tokens/s-Werte (folgen), Geschwindigkeit ist nicht die
Stärke dieser Stufe (dafür Booster oder Workstation), Indie.care ist nach 3 Monaten optional und
kostenpflichtig, Indie.router ist ein separates Modul und noch nicht verfügbar.

FAQ-Kandidaten (nur belegbare): Was passiert nach den ersten 3 Monaten Care? Läuft das System ohne
Internet? Wer kann auf die Daten zugreifen? Kann ich eigene Modelle nachladen? Was ist, wenn wir
später mehr Geschwindigkeit brauchen? Brauche ich eigene IT dafür? Wie kommen die Nutzer an das
System?

### Indie.workstation (`produkte/indie-workstation/index.html`)

Belegte Fakten: 12.000 € netto einmalig; RTX 5090 fest eingebaut; 64 GB RAM; schallgedämmt;
24/7-tauglich; ausbaufähig mit zweiter GPU oder 2 × 2 TB Speicher; für viele Nutzer im Dauerbetrieb;
Software-Suite enthalten; Lieferzeit 14 Tage inklusive Setup; erste 3 Monate Care Basis.

Einordnung: Die feste GPU liefert kurze Antwortzeiten auch bei mehreren gleichzeitigen Anfragen.
Die 64 GB Systemspeicher sind bewusst kleiner als bei der Box: Diese Stufe optimiert Tempo, nicht
maximale Modellgröße.

"Was nicht dabei ist": keine 400B-Klasse wie bei der Box (kleinerer Speicher), keine gemessenen
Benchmarks (folgen), der Indie.booster ist mit dieser Stufe nicht kombinierbar (er läuft nur an der
Box), Ausbau mit zweiter GPU oder Speicher ist nicht im Preis enthalten.

FAQ-Kandidaten: Warum weniger RAM als die Box? Kann ich den Booster daran betreiben (nein, nur an
der Box)? Wie laut ist das Gerät im Büro? Läuft sie wirklich 24/7? Was kostet der Ausbau? Für wie
viele Nutzer reicht sie (ehrlich: hängt an gleichzeitigen Anfragen, Klärung im Gespräch)?

### Indie.booster (`produkte/indie-booster/index.html`)

Belegte Fakten: 8.000 € netto einmalig; RTX 5090 mit 32 GB im externen Gehäuse; nachrüstbar an jede
Indie.box; läuft ausschließlich an der Box, nicht eigenständig und nicht an der Workstation;
Vollausbau Box plus Booster 13.500 € netto; dieser Vollausbau liegt bewusst über der Workstation,
weil er als einziges Setup große Modelle **und** Geschwindigkeit kann; Lieferzeit 14 Tage.

Einordnung: Die Box behält ihre 128 GB für große Modelle, der Booster ergänzt 32 GB schnellen
GPU-Speicher für kurze Antwortzeiten. Beide Achsen gleichzeitig gibt es nur so.

"Was nicht dabei ist": kein eigenständiges Gerät (ohne Box nutzlos), nicht an der Workstation
betreibbar, keine gemessenen Beschleunigungswerte (folgen), keine eigene Care-Position falls der
Booster als Erweiterung zählt (offener Punkt, deshalb auf der Seite nicht behaupten).

FAQ-Kandidaten: Brauche ich zwingend eine Box? Kann ich später nachrüsten oder muss ich mich sofort
entscheiden? Warum kostet Box plus Booster mehr als die Workstation? Passt er an jede Box? Was
ändert sich im Betrieb?

### Indie.rack (`produkte/indie-rack/index.html`)

Belegte Fakten: Preis auf Anfrage (keine Zahlen, auch keine Spanne); dedizierte 19-Zoll-Server;
für Verwaltung, öffentliche Hand und Konzerne; ausgelegt auf 100 bis über 1.000 Nutzer;
Beschaffungswege Direktkauf, Systemhaus, Ausschreibung; SLA, Air-Gap-Pakete und Vor-Ort-Konzepte
sind Einzelvertrag; Software-Suite enthalten.

Besonderheit: Die Spezifikations-Sektion kann hier keine Zahlentabelle sein. Stattdessen
beschreiben, **was dimensioniert wird** (Rechenleistung, Speicher, Nutzerzahl, Netzanbindung,
Redundanz) und dass die konkrete Konfiguration je Organisation entsteht. Ausdrücklich sagen, dass
Höheneinheiten, Leistungsaufnahme und Kühlung Teil des Angebots sind.

"Was nicht dabei ist": kein Listenpreis und keine Standardkonfiguration, SLA und Air-Gap-Pakete
nicht automatisch enthalten, keine Selbstbedienung über den Checkout.

FAQ-Kandidaten: Wie läuft eine Beschaffung über ein Systemhaus? Können wir ausschreiben? Ist
Air-Gap-Betrieb möglich? Wer betreibt die Hardware? Was passiert bei Wachstum? Bekommen wir
Unterlagen für die Vergabeakte (ehrlich: im Gespräch, Liste steht in Klärung)?

Das bestehende Anfrageformular bleibt unverändert erhalten, inklusive Datenschutz-Fußnote.

## 4. Sprache (unverändert verbindlich)

Sie oder neutral, niemals Du. Keine zeitbasierten Produktivitätsversprechen. Punkt-Schreibweise der
Produktnamen. Nutzen vor Produkt: Der erste Satz jeder Sektion funktioniert ohne den Produktnamen.
Kurze Sätze, konkrete Zahlen statt Adjektive, keine Superlative ohne Beleg. Umlaute als ä/ö/ü/ß.
Keine Em-Dashes, stattdessen Doppelpunkt oder Punkt. Nutzen-Subline unter jeder Headline.

## 5. Technische Vorgaben

- Nav, Footer und Head-Struktur der Seite bleiben unverändert (nur `<title>`, `meta description` und
  JSON-LD dürfen ergänzt werden).
- Alle Pfade root-absolut (`/style.css`, `/assets/...`).
- Keine externen Requests, kein Tracking, keine Google Fonts.
- Nur vorhandene CSS-Klassen verwenden. Neu verfügbar: `.faq-list`, `.faq-item`, `.faq-item__body`,
  `.honest-box`, `.honest-box__title`, `.honest-box__note`. Kein eigenes CSS in den HTML-Dateien
  außer den bereits üblichen `style="background-color: var(--bg-light);"`-Sektionsschaltern und
  `style="color: var(--text-light); max-width: 56ch;"`-Absätzen.
- Neue Sektionen mit `data-animate="fade-up"` versehen, Staffelung über `data-stagger="1"` bis `"6"`.
- Jede Sektion mit `id` versehen, damit Anker funktionieren (`#spezifikation`, `#lieferumfang`,
  `#betrieb`, `#sicherheit`, `#abgrenzung`, `#faq`).
- JSON-LD: bestehendes `Product`-Objekt behalten, zusätzlich ein `FAQPage`-Objekt mit **exakt** den
  Fragen und Antworten, die auf der Seite stehen. Beide Objekte über `"@graph"` in einem
  `<script type="application/ld+json">` bündeln.
- Genau ein `h1` je Seite, saubere h2/h3-Hierarchie.

## 6. Definition of Done je Seite

- Alle neun Sektionen vorhanden, in der vorgegebenen Reihenfolge, mit Ankern.
- Keine erfundene Zahl; jede Angabe auf eine Quelle aus Abschnitt 1 zurückführbar.
- FAQ mit fünf bis sieben belegbaren Fragen (Abweichung nach oben nur mit Begründung im Review-Protokoll), Fragen und Antworten wortgleich im FAQPage-JSON-LD.
- "Was nicht dabei ist" ehrlich und produktspezifisch, nicht generisch.
- Abgrenzungs-Sektion verlinkt alle drei anderen Produkte und Care.
- Sprachregeln eingehalten, HTML valide, keine toten Links, keine Dritt-Requests.
