# Offene Fragen an Heiko (Relaunch indie.solutions, Schritt 1)

Aus dem Persona-/QA-Loop. Nichts davon wurde erfunden oder geraten; die Seiten arbeiten bis zur
Entscheidung mit gekennzeichneten Platzhaltern bzw. lassen die Angabe weg.

## BEANTWORTET (2026-08-17, gilt als Kanon)

**A. Nutzerzahl-Richtwerte: bewusst keine Zahlen, stattdessen Nutzungsart.**
Heiko: "Andere liefern auch keine konkreten Aussagen. Es kommt bei der Nutzeranzahl stark auf die
Art der Nutzung an." Verbindliche Zuordnung ab sofort:
- **Indie.box:** kleine Teams ohne wirklich parallele Nutzung. Agenten, die über Nacht laufen.
  KI-gestützte Workflows.
- **Indie.booster:** Durchsatz für die Arbeitspferde, zum Beispiel Coding-Aufgaben.
- **Indie.workstation:** ebenso Durchsatz für intensive, parallele Arbeitslasten.
Konsequenz für die Website: Die Orientierung läuft über die Art der Nutzung, nicht über
Nutzerzahlen. Formulierungen wie "bis X Nutzer" bleiben verboten.

**B. Lieferzeit: 14 Tage inklusive Setup gilt vorerst.**
Künftig soll die Angabe von Lieferzeit und Bestandsverfügbarkeit abhängig gemacht werden. Bis dahin
bleibt die Kanon-Formel "Lieferzeit normalerweise 14 Tage, inklusive Setup" auf allen Seiten. Der
alte Checkout-Wert "3-5 Werktage" wird beim Checkout-Umzug angeglichen.

**C. Kontakt: E-Mail bleibt der Weg.**
Heiko widerspricht der Persona-Forderung nach Telefonnummer, benannter Ansprechperson und
zugesagter Reaktionszeit ausdrücklich. Kontaktaufnahme läuft über E-Mail und die Formulare.
Kein Handlungsbedarf, Punkt geschlossen.

**D. Hardware-Garantie: gesetzliche Gewährleistung nennen.**
Belegt in `terms.html` § 9: Es gelten die gesetzlichen Mängelhaftungsrechte. Für Unternehmer (B2B)
ein Jahr ab Ablieferung, für Verbraucher zwei Jahre. Bei Hardware-Defekten werden zunächst die
Gewährleistungsansprüche gegen den Hersteller abgetreten (Reseller-Stellung), subsidiär haftet
brainbot. Achtung bei der Umsetzung: Die Zielgruppe ist B2B, also ist ein Jahr der relevante Wert.
Nicht pauschal "zwei Jahre" schreiben.

## Fakten, die nur du liefern kannst

(Die Punkte 1 bis 4 sind beantwortet, siehe oben. Nummerierung der übrigen Punkte bleibt unverändert,
damit Verweise gültig bleiben.)

5. **Zählt der Indie.booster als "System" für Indie.care** (eigene 79 €/Monat, eigene 3 Inklusiv-Monate) oder ist er als Erweiterung der Box abgedeckt?
6. **Indie.rack:** Soll eine Referenzkonfiguration mit Preisrahmen veröffentlicht werden ("Beispiel: 250 Nutzer, X HE, ab Y €")? Persona B kann ohne Hausnummer keine Budgetposition anlegen. Dazu: Höheneinheiten, Leistungsaufnahme, Kühlung als Datenblatt-Angaben.
7. **Nachweis-Materialien für die Revision:** AVV-Muster, TOM-Übersicht, Netzwerkdiagramm, Aussage zu Zertifikaten (ISO 27001 / BSI: vorhanden oder ehrlich "keins, dafür überprüfbar")? "Nachweisbar" braucht auf privacy.html einen konkreten Nachweis-Block.
8. **Router-Token-Kontingent:** Höhe des Inklusiv-Kontingents (Platzhalter "X Tokens/Monat" wartet darauf).
9. **Benchmarks:** Tokens/s für Box, Workstation, Vollausbau, sobald auf Zielhardware gemessen (Platzhalter sind markiert).
10. **Referenzkunden:** Dürfen wir anbieten: "Auf Wunsch stellen wir im Gespräch Kontakt zu einem Referenzkunden Ihrer Branche her"? (Vorschlag Persona A.)
11. **Elektrische/physische Daten** je Produkt (Leistungsaufnahme, Maße, Gewicht, Geräuschpegel) für Datenblätter; Persona B braucht sie für Serverraum- und Stromkostenplanung.
12. **Herstellung/Lieferkette:** Wer fertigt, woher kommt die Hardware? Erste Gremiums-Rückfrage bei einem Souveränitätsversprechen.

## Entscheidungen

13. **Formularversand serverseitig?** Aktuell öffnen die Formulare ehrlich gekennzeichnet das E-Mail-Programm (Mailto). Ein Backend existiert; ein kleiner Endpoint mit Bestätigungsanzeige wäre die verbindlichere Lösung. In Verwaltungsumgebungen scheitert Mailto oft.
14. **"Über uns"-Sektion oder -Seite:** drei Sätze zu brainbot (seit 2000, Mainz, DFKI-Spin-off, Teamgröße, Systeme im Feld). Persona A vertraut keiner Firma, über die auf der Seite nichts steht. Material liegt in der alten llms.txt/Impressum vor; Freigabe und Zahlen fehlen.
15. **EN-Umschalter:** aktuell sichtbar, aber ausgegraut mit "English version folgt" (Master-Prompt verlangt den Umschalter). Persona A empfiehlt: ganz ausblenden, bis EN existiert. Wie hättest du es?
16. **Matomo/Analytics:** Gemäß Master-Prompt ("kein Tracking, nicht verhandelbar") wurden matomo.js und alle Google-Fonts-Einbindungen von sämtlichen Seiten entfernt (auch Bestand: Checkout, Chat, docs/, admin/, en/). Es gibt aktuell keinerlei Web-Analytics mehr; der Matomo-Abschnitt in datenschutz.html wurde durch die zutreffende Aussage "keine Analyse-Dienste, keine Cookies" ersetzt. Bitte bestätigen (Verzicht auf Analytics) und den geänderten Rechtstext juristisch gegenlesen lassen. en/datenschutz.html (alter EN-Stand) erwähnt Matomo noch und wird mit der EN-Version in Vertiefungs-Schritt 6 neu gemacht.
17. **TCO-Mini-Rechner** (optional laut Master-Prompt): statisches Rechenbeispiel ist drin; interaktiver Schieberegler-Rechner in einem Folgeschritt?
18. **Gebündelte Konditionen-Seite** (netto, Versand, Zahlungsziel, Gewährleistung, Geld-zurück-Garantie an einer Stelle) als Vertiefung? (Vorschlag Persona B.)
19. **Rack-Formular erweitern:** Beschaffungsweg um "Rahmenvertrag / Vergabeplattform", optional Feld USt-IdNr./Rechnungsanschrift? (Vorschlag Persona B.)
20. **Fremdlogos auf den Produkt-Referenzbildern** (GMKtec, Razer, ASUS, sichtbare Fremdhardware): vor Live-Gang ersetzen oder retuschieren; finale Produktfotografie nach den Bildregeln des Master-Prompts (Booster neben Box, Beleuchtung aus, keine Fremdlogos).

21. **Betriebskennzahlen für Beschaffungsvorlagen** (Persona Beschaffung, Vertiefungs-Loop): Gibt es zusagbare Werte für Backup-Rhythmus und Wiederherstellungsdauer (RTO/RPO)? Die Seiten beschreiben aktuell nur die Mechanik (zentraler Datenbereich, Wiederherstellung über den Installer) und sagen ehrlich, dass Rhythmus und Aufbewahrung die Organisation festlegt. Falls es Zusagen im Rahmen von Indie.care gibt, gehören sie auf die Care-Seite.
22. **Monitoring und Meldewege im Fehlerfall:** Gibt es Monitoring oder Alerting, und wer wird bei einem Systemausfall wie informiert? Bisher auf keiner Seite und auch nicht in `betriebs.html` belegt, deshalb nirgends behauptet.
23. **Redundanz beim Indie.rack:** Gibt es eine Basis-Redundanzstufe im Standardangebot, oder ist jede Stufe Einzelvertrag? Die Seite sagt derzeit, dass der Umfang je Organisation festgelegt und im Angebot ausgewiesen wird.

## Bekannte, gewollte Platzhalter (laut Master-Prompt Abschnitt 9)

Erklärvideo (Hero), UI-Vignetten der Software-Suite, Workstation-/Vollausbau-Benchmarks,
Router-Token-Kontingent, Referenz-Firmennamen.
