# Review-Protokoll: Relaunch indie.solutions, Schritt 1

Persona-Loop nach Master-Prompt Abschnitt 8. Geprüft wurden die Startseite in voller Tiefe
und die Navigierbarkeit des Ganzen (Nav, elf Unterseiten v1, Formularwege).

## Loop 1

### Persona A, "Der Geschäftsführer" (Fertigung, 80 Mitarbeitende)

Urteil: **teilweise angesprochen.**

Blockierende Reibungspunkte:
1. **Keine Einordnung für die eigene Größe.** Die Orientierungstabelle nennt "ein Team" bis "über 100 Nutzer", 80 Mitarbeitende fallen in die Lücke; die Matrix-Achsen (Modellgröße/Geschwindigkeit) sind ohne Übersetzung nicht bewertbar; es fehlt eine Beispielrechnung gegen die Cloud-Kosten.
2. **"Nachweisbar" führt in die alte Welt.** privacy.html hatte noch Indie.box-Nav und -Footer ohne Rückweg; der Nachweis selbst (Revisions-Unterlagen) fehlt.
3. **Kontaktweg ohne Verbindlichkeit.** Mailto-Formular ohne Hinweis, ohne Firmenfeld, ohne Datenschutzhinweis; kein Ansprechpartner, keine Telefonnummer, nichts über brainbot.

Weitere Punkte: verwaistes Sternchen "X Tokens/Monat inklusive*", Widerspruch zum alten Checkout, Hardware-Garantie unbeantwortet, Care-Kosten tauchen erst spät auf, EN-Umschalter wirkt wie Baustelle, Demo zu weit unten.

Positiv (nicht kaputt-iterieren): offene Preise mit Lieferzeit, Anti-Marketing-Sätze ("Ohne Care läuft jedes System unbegrenzt weiter"), Vier-Spalten-Vergleich mit "EU-Hosting ist nicht Souveränität", Demo ohne Anmeldung.

### Persona B, "Die Beschaffungsverantwortliche" (IT-Leitung / Verwaltung)

Urteil: **teilweise.**

Blockierende Reibungspunkte:
1. **Alle Preise ohne Netto/Brutto-Kennzeichnung** (bei 13.500 € Vollausbau 2.565 € Unterschied, für die öffentliche Hand budgetentscheidend).
2. **Produktseiten und alter Checkout widersprechen sich** (Lieferzeit 14 Tage vs. 3-5 Werktage, Suite vs. OpenWebUI/Letta/n8n, 400B vs. 120B, "Ryzen AI Max" vs. "Max+", Produktname "Indie.box AI-Workstation").
3. **Indie.rack ohne jede Spezifikation, Tokens/s überall Platzhalter**; damit keine Leistungsbeschreibung und keine Budget-Hausnummer möglich.

Dazu 11 Einzel-Inkonsistenzen (u. a. Router-Jahrespreis nur auf der Unterseite, Geld-zurück-Garantie nur im Checkout, Care-Status des Boosters unklar) und eine Fehlliste für Beschaffungsvorlagen (Datenblätter als PDF, elektrische Daten, Garantie, Support-Kenngrößen, AVV/TOMs, Lieferkette).

Positiv: Betriebsmodell unmissverständlich, saubere Trennung einmalig/monatlich, Rack-Anfrageweg mit Beschaffungsweg-Auswahl "vorbildlich", Router-Ehrlichkeit, Upgrade-Pfad wirtschaftlich argumentierbar.

### QA-Agent

13 von 15 Checkpunkten bestanden (kein Du, keine Zeitversprechen, Punkt-Namen, keine Dritt-Requests,
Preiskonsistenz, HTML-Validität, llms/sitemap konsistent, Footer-Zeile überall). Verstöße V1-V10:
verwaistes Sternchen (V1), Vergleichskarte pauschal vs. Router-Ehrlichkeit (V2), zwei Sektionen führen
mit Produktnamen statt Nutzen (V3, V4), Grundsatz-Zeile fehlte auf den Agent-Seiten (V5), JSON-LD-Marke
uneinheitlich (V6), Router-Preis auf der Startseite ohne "Einführungspreis" und ohne Jahrespreis (V7),
Zeitkontrast "Wochen an Setup-Arbeit" (V8), Care-Tarifnamen (V9, kein Handlungsbedarf), latenter
reduced-motion-Spezifitätsbug der Combi-Pill (V10).

### Nachbesserungen aus Loop 1 (umgesetzt)

- Orientierungstabelle mit Preisspalte; Hinweis, dass Dimensionierung an gleichzeitigen Anfragen hängt und im Gespräch geklärt wird; Achsen-Übersetzung unter der Matrix; Rechenbeispiel 80 Nutzer (3.200 bis 6.000 €/Monat Cloud vs. 13.500 € einmal) in Kapitel 7.
- privacy.html: neue indie.solutions-Nav und -Footer, Google-Fonts- und Matomo-Einbindung entfernt, Em-Dash bereinigt. (Inhaltlicher Umbau bleibt Vertiefungs-Schritt 4.)
- Kontaktformular: Felder Unternehmen und Mitarbeitende (ca.), ehrlicher Mailto-Hinweis, Datenschutz-Link; gleiche Fußnote am Rack- und Router-Formular.
- Netto-Kennzeichnung an Produktfamilie, Orientierungstabelle, Produkt-Heroes (Box/Booster/Workstation) und Care-Paketen.
- V1-V8, V10 behoben (Sternchen entfernt, "Lokale Verarbeitung:" präzisiert, Booster-Headline nutzengeführt, Box-Suite-Absatz umgestellt, Grundsatz-Zeile ergänzt, JSON-LD-Marke vereinheitlicht, Router-Pill mit Einführungspreis und Jahrespreis, Zeitkontrast ersetzt, reduced-motion !important).
- Zusätzlich aus Persona A: Live-Demo-Link im Hero, Care-Kosten-Hinweis direkt unter den drei Versprechen, 14 Tage Geld-zurück-Garantie auf der Box-Seite (Fakt aus dem Bestand-Checkout), /betriebs.html von Box- und Care-Seite verlinkt.

## Loop 2

- **Persona A: teilweise, nah an ja.** Loop-1-Blocker 1 (Orientierung) und 3 (Kontakt) ausgeräumt, Blocker 2 (Datensicherheit) teilweise. Neuer Blocker: privacy.html beschrieb noch Matomo-Cloud-Analytics (InnoCraft, Neuseeland) und widersprach damit der Footer-Zusage "lädt nichts von Dritten".
- **Persona B: teilweise.** Netto-Kennzeichnung griff auf Startseite und Produktseiten, aber der Care-Netto-Einschub war versehentlich in den head geraten (ungültiges HTML, Hinweis unsichtbar); Abo-Preise auf Startseite Kapitel 8 und Router-Preis noch ohne Netto. Checkout- und Rack-Punkte als offene Fragen akzeptiert.
- **QA: nicht grün.** V1-V10 verifiziert behoben; neu V11 (Care-Head-Streutext), V12 (Matomo-Abschnitt privacy.html), V13 (privacy.html Canonical/OG auf indiebox.ai), V14 (Router-Seite trägt "X Tokens/Monat inklusive*").

Nachbesserungen aus Loop 2 (umgesetzt):
- Matomo vollständig entfernt: Skript-Einbindung von allen Seiten genommen (inklusive Bestand: Checkout, Chat, Betrieb, Legal), privacy.html-Abschnitt ersetzt durch "Diese Website: keine Analytics, keine Dritt-Requests".
- Care-Head repariert; Netto-Hinweis sichtbar im Care-Hero und in der Konditionen-Passage; "jeweils netto" in der Startseiten-Care-Box; Router-Fußnote um "netto zzgl. gesetzlicher Umsatzsteuer" ergänzt; Formulierung an Box/Workstation/Booster vereinheitlicht.
- privacy.html: Canonical, hreflang, OG auf indie.solutions (V13).
- Rechenbeispiel um Care- und Stromkosten ergänzt, Geld-zurück-Garantie an der Box-Karte der Startseite, Footer-Link Datensicherheit.
- Zu V14: "X Tokens/Monat inklusive*" bleibt auf der Router-Seite bewusst stehen. Der Master-Prompt schreibt genau diesen Platzhalter vor; er ist per Fußnote als Platzhalter erklärt. Die Startseite trägt die verdichtete Form "Token-Kontingent inklusive (Höhe folgt)".

## Loop 3 (Finalurteile)

- **Persona B: JA.** Loop-2-Blocker ausgeräumt, keine neuen Inkonsistenzen. Letzter mechanischer Punkt: alte Domain indiebox.ai in terms.html (Anbieter-Block), betriebs.html und chat.html (Canonical/OG). Nach Loop 3 behoben (Domains auf indie.solutions umgestellt).
- **Persona A: teilweise.** Fand die restlichen Dritt-Requests, die der erste Sweep übersehen hatte: matomo.js noch in docs/, Google Fonts noch auf allen Bestandsseiten, und datenschutz.html beschrieb weiter die Matomo-Verarbeitung. Ausdrücklich als Handwerk, nicht als Heiko-Frage eingestuft. Nach Loop 3 behoben: matomo.js und Google-Fonts-Einbindungen aus sämtlichen 45 betroffenen HTML-Dateien entfernt (docs/, admin/, en/, 404, Legal), datenschutz.html-Analytics-Abschnitt durch zutreffende Aussage ersetzt (juristische Bestätigung siehe OFFENE-FRAGEN.md Nr. 16).

**Endstand nach drei Loops:** Persona B "ja". Persona A "teilweise": Die verbliebenen Punkte sind ausschließlich Fakten, die nur Heiko liefern kann (Nutzerzahl-Richtwerte, Kontakt-Verbindlichkeit, Revisions-Nachweise, Hardware-Garantie, Über-uns). Die von Persona A benannten handwerklichen Blocker sind alle behoben. QA-Punkte V1-V13 verifiziert, V14 als Master-Prompt-Vorgabe dokumentiert. Gemäß Master-Prompt (max. 3 Loops) endet der Loop hier; die ungelösten Punkte eskalieren als OFFENE-FRAGEN.md an Heiko.

## Nicht im Loop lösbar (Entscheidungen/Fakten von Heiko nötig)

Siehe OFFENE-FRAGEN.md.
