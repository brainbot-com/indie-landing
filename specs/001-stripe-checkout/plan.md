# Implementation Plan: Stripe Checkout Fuer Indie.Box

**Branch**: `001-stripe-checkout` | **Date**: 2026-03-06 | **Spec**: n/a
**Input**: Stripe so einbinden, dass die Indiebox bestellt und direkt bezahlt werden kann.

## Summary

Die empfohlene Umsetzung ist ein gehosteter Stripe-Checkout mit einer kleinen
serverseitigen Session-Erzeugung und Webhook-Verarbeitung. Das Repo bleibt
statisch fuer Inhalt, Layout und Navigation; nur die Zahlungslogik wird in ein
separates, minimales Backend oder eine Serverless-Funktion ausgelagert.

Stand 2026-03-10 nach Abgleich mit der aktuellen Stripe-Dokumentation:

- Der passende Stripe-Pfad fuer dieses Projekt ist weiterhin `Checkout Sessions`
  mit gehosteter Stripe-Seite (`ui_mode=hosted`).
- Der Browser soll nach Session-Erzeugung auf die von Stripe zurueckgegebene
  `session.url` weitergeleitet werden.
- `stripe.redirectToCheckout` sollte nicht eingeplant werden. Stripe hat die
  Unterstuetzung fuer diese Methode entfernt.
- Die Bestellung darf intern nicht ueber die Success-Seite als "bezahlt"
  markiert werden. Stripe empfiehlt Webhooks als Quelle der Wahrheit.
- Rechnungsadresse, Lieferadresse, Tax IDs und weitere Bestelldaten koennen
  ueber Checkout-Parameter gesammelt werden. Das bestehende Formular muss
  deshalb nicht 1:1 im Frontend erhalten bleiben.

Diese Variante passt besser als ein reiner Payment Link, weil die bestehende
Checkout-Seite bereits ein eigenes Bestellformular, Rechnungs- und
Lieferadressen, Hinweise und AGB-Bestaetigung vorsieht. Ein Payment Link waere
schneller live, wuerde aber die vorhandene Struktur stark vereinfachen und
weniger Kontrolle ueber Bestelldaten, Metadaten und Nachbearbeitung bieten.

## Technical Context

**Language/Version**: HTML5, CSS3, vanilla JavaScript, Node.js fuer Stripe-Integration  
**Primary Dependencies**: `checkout.html`, `en/checkout.html`, `style.css`, `script.js`, Stripe Checkout, Stripe Webhooks  
**Storage**: Stripe als Zahlungs- und Session-System, optional externe Order-Ablage spaeter  
**Testing**: Stripe Test Mode, Webhook-Test, Desktop/Mobile-Flow, Success/Cancel-Flow  
**Target Platform**: GitHub Pages fuer statische Seiten plus separates Serverless-Backend  
**Project Type**: Statische Marketing- und Checkout-Site mit externer Zahlungsabwicklung  
**Performance Goals**: Keine zusaetzliche Frontend-Komplexitaet ausser Redirect zum gehosteten Checkout  
**Constraints**: DE als Quelle, EN-Paritaet, Cross-Page-Konsistenz, keine Stripe-Secrets im Frontend  
**Scale/Scope**: Ein Produkt, direkter Kauf, spaeter erweiterbar auf weitere Varianten  
**Affected Pages**: `checkout.html`, `en/checkout.html`, `terms.html`, `privacy.html`, moeglicherweise `index.html` und `en/index.html`  
**Affected Claims**: Zahlungsarten, Bestellablauf, Versand, Rueckgabe, Steuer-/Rechnungslogik, Datenschutz

## Constitution Check

- Design-System bleibt intakt: Stripe selbst rendert den gehosteten Checkout;
  das Repo braucht nur CTA-, Form- und Copy-Anpassungen im bestehenden Stil.
- DE/EN-Paritaet ist Pflicht: Bestellcopy, Success/Cancel-Hinweise und
  Zahlungsversprechen muessen in beiden Sprachen angepasst werden.
- Claim-Disziplin ist kritisch: Es duerfen nur Zahlungsarten, Steuern,
  Versandbedingungen und Finanzierungsoptionen genannt werden, die im
  konfigurierten Stripe-Setup tatsaechlich aktiviert sind.
- Statische Einfachheit bleibt gewahrt: keine Card-Form im Frontend; nur
  Redirect zu Stripe Checkout.
- Jede Aenderung dient Conversion und Vertrauen: klarer Bestellfluss,
  transparente Zahlarten, verifizierbare Nachkauf-Kommunikation.

## Proposed Architecture

### Option A (Empfohlen): Stripe Checkout Sessions

1. Der Nutzer fuellt das bestehende Bestellformular auf `checkout.html` aus.
2. Das Frontend sendet die Daten an einen serverseitigen Endpoint wie
   `POST /api/create-checkout-session`.
3. Der Server validiert die Eingaben, erstellt eine Stripe Checkout Session und
   speichert relevante Daten als `metadata` oder `customer_details`.
4. Das Frontend leitet auf `session.url` weiter.
5. Stripe verarbeitet die Zahlung gehostet.
6. Stripe ruft einen Webhook auf, zum Beispiel fuer
   `checkout.session.completed`.
7. Der Webhook markiert die Bestellung als bezahlt, loest E-Mail/CRM/ERP-Folge-
   schritte aus und bestaetigt die Bestellung intern.
8. Der Kunde landet auf einer Success-Seite oder einer Cancel-Seite.

Fuer dieses Repo sollte der Flow konkret so aussehen:

1. `checkout.html` und `en/checkout.html` sammeln nur die Daten, die vor der
   Stripe-Weiterleitung wirklich noetig sind.
2. `POST /api/create-checkout-session` validiert den Payload und erstellt die
   Checkout Session serverseitig.
3. Die Antwort enthaelt die Session-URL.
4. Das Frontend leitet mit `window.location.href = session.url` weiter.
5. Stripe sammelt Zahlung, weitere Pflichtdaten und optional Steuer-/Adress-
   daten.
6. `checkout.session.completed` und bei Bedarf
   `checkout.session.async_payment_succeeded` loesen die interne
   Bestellverarbeitung aus.
7. Die Success-Seite dient nur als Kundenruecksprung und zur Anzeige der
   Bestellnummer bzw. Session-ID, nicht als Quelle fuer Fulfillment.

### Option B (Schneller, aber eingeschraenkt): Stripe Payment Link

- Sinnvoll nur, wenn das Form stark vereinfacht wird und Stripe den groessten
  Teil der Datenerfassung uebernimmt.
- Weniger eigener Code, aber weniger Kontrolle ueber Datenerfassung,
  Vorvalidierung und spaetere Erweiterungen.
- Fuer das aktuelle Formular- und Informationsmodell nicht erste Wahl.

## Scope

### Phase 1: Stripe-Voraussetzungen und Business-Entscheidungen

- Stripe-Account anlegen oder vorhandenen Account produktiv verifizieren.
- Auszahlungsbankkonto, Firmenangaben und Steuereinstellungen vervollstaendigen.
- Festlegen:
  - Verkauf nur B2C oder auch B2B
  - Ziellaender
  - Versandkostenmodell
  - Steuerlogik inkl. VAT / USt-IdNr.
  - welche Zahlarten wirklich angeboten werden
  - ob Finanzierung ausserhalb von Stripe bleibt oder gestrichen wird
- Festlegen, welche Daten vor der Zahlung zwingend auf eurer Seite erhoben
  werden muessen und welche Stripe sammeln darf.

### Phase 2: Serverless-Backend

- Kleines Backend oder Function-Projekt aufsetzen, zum Beispiel auf Vercel,
  Netlify, Cloudflare Workers oder eigener Infrastruktur.
- Endpoint fuer `create-checkout-session` bauen.
- Stripe Secret Key nur dort hinterlegen, nie im Frontend.
- Stripe Webhook-Endpoint fuer erfolgreiche und abgebrochene Zahlungen
  bereitstellen.
- Success- und Cancel-URLs definieren.

Pflichtparameter fuer die Session:

- `mode=payment`
- `success_url` mit `{CHECKOUT_SESSION_ID}`
- `cancel_url`
- `line_items`

Voraussichtlich sinnvolle Session-Parameter fuer Indiebox:

- `billing_address_collection=required`
- `shipping_address_collection[allowed_countries]`
- `phone_number_collection[enabled]=true`
- `automatic_tax[enabled]=true` oder bewusst manuelle Steuerraten
- `tax_id_collection[enabled]=true`, falls B2B direkt im Checkout unterstuetzt
  werden soll
- `customer_creation=always`, wenn jede Bestellung sauber einem Stripe Customer
  zugeordnet werden soll
- `metadata[...]` fuer interne Referenzen wie `order_draft_id`, `locale`,
  `product_sku`

### Phase 3: Checkout-Seite umbauen

- `checkout.html` und `en/checkout.html` von `form action="__BACKEND_URL__"`
  auf einen echten JS-Submit-Flow mit Session-Erzeugung umstellen.
- Zahlungsarten-Radios entfernen. Stripe Checkout zeigt die aktivierten
  Zahlungsarten dynamisch auf Basis von Dashboard-Konfiguration, Land, Waehrung
  und Risikokontext an.
- Im Frontend keine `redirectToCheckout`-Implementierung vorsehen.
- Stattdessen nach erfolgreichem API-Call direkt auf `session.url`
  weiterleiten.
- Optional: Felder reduzieren, wenn Stripe Billing/Shipping/Phone/Tax-ID direkt
  im Checkout sammelt.
- Success- und Cancel-Seiten oder Overlay-Nachrichten im vorhandenen Design
  ergaenzen.

Empfohlene Feldstrategie:

- Auf der eigenen Seite behalten:
  - Vorname
  - Nachname
  - Firma
  - E-Mail
  - optional interne Freitext-Hinweise
  - AGB-Zustimmung
- Nach Moeglichkeit an Stripe uebergeben lassen:
  - Rechnungsadresse
  - Lieferadresse
  - Telefonnummer
  - Tax ID

Der Vorteil ist weniger Doppelpflege, weniger Validierungslogik im eigenen
Frontend und weniger Risiko, dass Frontend-Formular und Stripe-Datenmodell
auseinanderlaufen.

### Phase 4: Recht, Datenschutz, Cross-Page-Sync

- `terms.html` und `privacy.html` an Stripe-Zahlungsabwicklung anpassen.
- Falls Stripe Zahlungsdaten, Adressen, Steuerdaten oder Fraud-Checks
  verarbeitet, muss das in der Datenschutzerklaerung sauber beschrieben sein.
- Checkout-, Hero- und CTA-Copy ueber alle Seiten synchronisieren:
  Zahlarten, Preis, Versand, Widerruf, Bestaetigungsablauf.
- DE/EN-Paritaet sicherstellen.

### Phase 5: Test und Go-Live

- End-to-End-Test im Stripe Test Mode.
- Erfolgsfall, Abbruchfall, fehlgeschlagene Zahlung und Webhook-Verarbeitung
  pruefen.
- Mobile-Flow und Desktop-Flow testen.
- Live Keys erst nach erfolgreichem Test aktivieren.
- Test-Banner, Test-Keys und Test-URLs vor Go-Live entfernen.

Zusaetzliche Stripe-spezifische Tests:

- Webhook-Signaturpruefung
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- Success-Seite mit `session_id={CHECKOUT_SESSION_ID}`
- Session-Ablauf / abgebrochene Sessions
- Adress- und Tax-ID-Erfassung fuer relevante Laender

## Data Mapping

Folgende Daten sind im aktuellen Formular vorhanden und muessen bewusst
zugeordnet werden:

- Kontakt: `firstName`, `lastName`, `email`, `phone`
- Firma / Steuern: `company`, `vatId`
- Rechnung: `billingStreet`, `billingZip`, `billingCity`, `billingCountry`
- Lieferung: `shippingCareOf`, `shippingStreet`, `shippingZip`,
  `shippingCity`, `shippingCountry`
- Freitext: `notes`
- Zustimmung: `termsAccepted`

Empfehlung:

- Kontakt, Rechnung, Lieferung und Steuerdaten soweit moeglich in Stripe-eigene
  Felder legen.
- Nur wirklich benoetigte Zusatzdaten als `metadata` oder separaten
  Nachbearbeitungsdatensatz speichern.
- `notes` nur uebernehmen, wenn dieser Freitext operativ wirklich gebraucht
  wird.

Wichtige Einschraenkung:

- Keine sensiblen personenbezogenen Daten unnoetig in `metadata` speichern.
  Stripe empfiehlt `metadata` fuer interne Referenzen, nicht fuer
  umfangreiche PII-Ablage.

## Security and Operations

- Keine Stripe Secret Keys in HTML, JS oder Git committen.
- Webhook-Signatur zwingend verifizieren.
- Bestellung intern erst nach bestaetigtem Stripe-Erfolg als bezahlt markieren.
- Keine Erfuellung nur auf Basis des Browser-Redirects ausloesen; immer Webhook
  als Quelle der Wahrheit verwenden.
- Logging auf Session-ID, Payment-Status und Order-Referenz begrenzen; keine
  unnötigen persoenlichen Daten loggen.

Operative Regel fuer Bestellungen:

- Ein interner Bestellentwurf kann vor der Stripe-Weiterleitung angelegt
  werden.
- Eine Bestellung gilt erst dann als bezahlt, wenn der Webhook dies bestaetigt.
- Fulfillment muss idempotent sein, weil Webhooks mehrfach eintreffen koennen.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Separates Backend fuer Zahlungen | Stripe Secrets und Webhooks duerfen nicht im statischen Frontend liegen | GitHub Pages kann keine sicheren serverseitigen Stripe-Operationen ausfuehren |
| Gehosteter Stripe Checkout statt reinem HTML-Card-Formular | Schnellere, sicherere und compliance-aermere Umsetzung | Eigenes Card-Formular mit Elements waere fuer dieses Repo unnoetig komplex |

## Open Decisions

1. Soll der Kauf sofort bezahlt werden oder nur als verbindliche Bestellung mit
   spaeterer Rechnung starten?
2. Welche Laender duerfen direkt bestellen?
3. Sind Versandkosten fix, laenderabhaengig oder im Preis enthalten?
4. Soll B2B mit USt-IdNr. und Reverse-Charge sofort unterstuetzt werden?
5. Bleibt eine gesonderte Finanzierung erhalten oder wird zunaechst nur direkte
   Zahlung angeboten?
6. Wollt ihr nach erfolgreicher Zahlung direkt eine interne E-Mail, ein CRM-
   Event oder einen manuellen Fulfillment-Schritt ausloesen?

## Recommended Execution Plan

### Sprint 1: Zahlungsfluss technisch sauber machen

- Stripe-Account und Produkte/Preise sauber anlegen
- Serverless-Endpoint fuer `create-checkout-session`
- Webhook-Endpoint mit Signaturpruefung
- Success-/Cancel-Seiten
- Checkout-Frontend auf Session-Redirect umbauen

### Sprint 2: Bestellung als internes Objekt anbinden

- Vor Stripe einen `order_draft` im eigenen System anlegen
- `order_draft_id` in Stripe-Session-Metadaten speichern
- Webhook mappt Stripe-Event zur internen Bestellung
- Statusmodell definieren: `draft`, `checkout_started`, `paid`,
  `payment_failed`, `cancelled`, `fulfilled`

### Sprint 3: Steuer, Versand, Recht und Betrieb

- Steuerlogik finalisieren
- Laender und Versandregeln finalisieren
- Datenschutz / AGB an Stripe-Flow anpassen
- Monitoring, Retry-Handling und manuelle Order-Ansicht ergaenzen

## Official Stripe References

- Checkout lifecycle und gehostete Checkout-Seite:
  https://docs.stripe.com/payments/checkout/how-checkout-works
- Checkout Session erstellen:
  https://docs.stripe.com/api/checkout/sessions/create
- Fulfillment mit `checkout.session.completed`:
  https://docs.stripe.com/checkout/fulfillment
- Webhooks und Signaturpruefung:
  https://docs.stripe.com/webhooks
- Success-Seite mit `{CHECKOUT_SESSION_ID}`:
  https://docs.stripe.com/payments/checkout/custom-success-page
- Billing- und Shipping-Adressen in Checkout:
  https://docs.stripe.com/payments/collect-addresses?payment-ui=checkout
- Tax ID Collection:
  https://docs.stripe.com/tax/checkout/tax-ids
- Metadata und Order-Referenzen:
  https://docs.stripe.com/metadata
- Wichtige aktuelle Aenderung:
  `stripe.redirectToCheckout` wird nicht mehr unterstuetzt:
  https://docs.stripe.com/changelog/clover/2025-09-30/remove-redirect-to-checkout

## Execution Order

1. Business- und Rechtsentscheidungen finalisieren.
2. Stripe Dashboard in Test Mode konfigurieren.
3. Serverless-Backend und Webhook bauen.
4. Checkout-Seiten DE/EN auf den neuen Flow umstellen.
5. Rechtstexte und Datenschutz synchronisieren.
6. End-to-End testen.
7. Auf Live Mode umstellen.
