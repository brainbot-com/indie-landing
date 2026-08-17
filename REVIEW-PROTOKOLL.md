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

_Wird nach Abschluss der Loop-2-Prüfung ergänzt._

## Nicht im Loop lösbar (Entscheidungen/Fakten von Heiko nötig)

Siehe OFFENE-FRAGEN.md.
