# Offene Fragen an Heiko (Relaunch indie.solutions, Schritt 1)

Aus dem Persona-/QA-Loop. Nichts davon wurde erfunden oder geraten; die Seiten arbeiten bis zur
Entscheidung mit gekennzeichneten Platzhaltern bzw. lassen die Angabe weg.

## Fakten, die nur du liefern kannst

1. **Nutzerzahl-Richtwerte je Stufe.** Beide Personas wollen Zahlen: Wie viele gleichzeitige Nutzer trägt eine Indie.box, eine Indie.workstation? Aktuell steht: Dimensionierung hängt an gleichzeitigen Anfragen, Klärung im Gespräch. Konkrete Richtwerte ("bis ~25 gleichzeitige Nutzer" o. ä.) würden die Orientierung deutlich stärken.
2. **Kontakt-Verbindlichkeit:** Telefonnummer? Benannte Ansprechperson (Name, ggf. Foto)? Zusagbare Reaktionszeit ("Antwort in der Regel am nächsten Werktag")? Der Geschäftsführer-Persona fehlt das für eine 5.500-€+-Entscheidung.
3. **Hardware-Garantie / Defektfall:** Gewährleistung, Garantiedauer, Austauschgerät, Reparaturzeit. Care pflegt ausdrücklich nur den Stack; was bei Hardware-Defekt in Monat 14 passiert, ist unbeantwortet (Standard-Beschaffungsfrage).
4. **Checkout-Widersprüche (Bestand):** checkout.html sagt "3-5 Werktage", Master-Prompt sagt "14 Tage inklusive Setup"; Softwareliste OpenWebUI/Letta/n8n vs. neue Suite-Namen; "bis 120B Parameter" vs. 400B-Klasse; "Ryzen AI Max+ 395" (AMD-Schreibweise) vs. "Ryzen AI Max 395" (Master-Prompt); Produktname "Indie.box AI-Workstation" kollidiert mit Indie.workstation; Satz "Aufgrund gestiegener Hardwarepreise…". Welche Fakten gelten? Der Checkout zieht in Vertiefungs-Schritt 4 um, die Fakten brauchen wir vorher.
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

## Bekannte, gewollte Platzhalter (laut Master-Prompt Abschnitt 9)

Erklärvideo (Hero), UI-Vignetten der Software-Suite, Workstation-/Vollausbau-Benchmarks,
Router-Token-Kontingent, Referenz-Firmennamen.
