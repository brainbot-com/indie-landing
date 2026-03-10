# Implementation Plan: IONOS VPS Migration And Mollie Preparation For Indie.Box

**Branch**: `002-ionos-vps-mollie-migration` | **Date**: 2026-03-10 | **Spec**: n/a
**Input**: Kompletten Umbauplan speichern, zuerst Umzug auf IONOS VPS und eigenes Backend, danach Mollie-Integration fuer Zahlungen.

## Current Domain Context

- Die Domain `indiebox.ai` liegt bei Joker.
- DNS-Cutover und spaetere TLS-Inbetriebnahme laufen deshalb ueber Joker-DNS.

## Summary

Der Umbau erfolgt in zwei getrennten Phasen:

1. Die bestehende statische Site wird von GitHub Pages auf einen selbst
   administrierten IONOS VPS umgezogen.
2. Auf derselben Basis wird ein kleines eigenes Backend vorbereitet, das in
   einer Folgephase die Mollie-Integration uebernimmt.

Feste Entscheidungen fuer diesen Plan:

- Infrastruktur: `IONOS VPS`
- Reverse Proxy: `Caddy`
- Deployment: `Docker Compose`
- Betriebszugriff: `SSH`
- Zahlungsintegration: erst **nach** erfolgreichem Infrastrukturwechsel
- Betriebssystem: `Ubuntu 24.04 LTS`

Diese Reihenfolge senkt das Risiko. Hosting-Wechsel, Backend-Einfuehrung und
Payment-Produktivstart in einem Schritt waeren fuer dieses Repo unnoetig
fehleranfaellig.

## Validated Platform Facts

Stand 2026-03-10 nach Abgleich mit offizieller Dokumentation:

- IONOS VPS bietet `Full root access`, `KVM console`, `Cloud Panel` und
  `encrypted remote access`.
- Linux VPS wird per SSH administriert.
- IONOS dokumentiert SSH fuer VPS mit `root` und Port `22`.
- IONOS dokumentiert Firewall-Policies fuer VPS im Cloud Panel.
- Auf Linux-Installationen ist standardmaessig ein `root`-Benutzer vorhanden;
  ein sudo-faehiger Benutzer kann danach zusaetzlich angelegt werden.
- Ubuntu 24.04 LTS wird standardmaessig bis Mai 2029 mit
  Sicherheitsupdates versorgt.
- Mollie-Zahlungen werden serverseitig erzeugt und nutzen `redirectUrl` und
  `webhookUrl`.
- Mollie empfiehlt, Fulfillment nicht auf die Rueckkehr des Kunden zu stuetzen,
  sondern auf Webhooks.

Quellen:

- IONOS VPS:
  https://www.ionos.com/servers/vps
- IONOS SSH-Zugriff:
  https://www.ionos.com/help/server-cloud-infrastructure/getting-started/connecting-to-linux-server-via-ssh/
- IONOS Firewall fuer VPS:
  https://www.ionos.com/help/server-cloud-infrastructure/firewall-vps/editing-your-firewall-policy-vps-and-migrated-cloud-servers/
- IONOS sudo user:
  https://www.ionos.com/help/server-cloud-infrastructure/server-administration/creating-a-sudo-enabled-user/
- Ubuntu Release Cycle:
  https://ubuntu.com/about/release-cycle
- Mollie Accepting Payments:
  https://docs.mollie.com/docs/accepting-payments
- Mollie Triggering Fulfilment:
  https://docs.mollie.com/docs/triggering-fulfilment
- Mollie Payment Links:
  https://docs.mollie.com/docs/payment-links

## Target Architecture

### Target State After Phase 1

- `indiebox.ai` zeigt auf einen IONOS VPS
- die statische Website wird direkt dort ausgeliefert
- Caddy terminiert HTTPS und uebernimmt Routing
- ein kleines eigenes Backend laeuft als separater Service
- die Basis fuer spaetere Zahlungslogik ist vorhanden
- Mollie ist noch nicht live eingebunden

### Target State After Phase 2

- `checkout.html` spricht das eigene Backend an
- das Backend erzeugt Mollie-Zahlungen
- Kunden werden auf Mollie Hosted Checkout weitergeleitet
- Webhooks aktualisieren interne Bestellzustaende
- Success-Seiten zeigen Ruecksprungstatus, aber nicht den Zahlungswahrheitswert

## Architecture Decisions

### 1. Hosting

Empfohlen ist ein einzelner **IONOS VPS** in der EU.

Startkonfiguration:

- Produkt: `IONOS VPS`
- Leistung: `4 vCore`, `4 GB RAM`, `120 GB NVMe SSD`
- OS: `Ubuntu 24.04 LTS`
- Verwaltung: SSH-Key und spaeter separater sudo-User
- Add-ons:
  - Firewall-Regeln im Cloud Panel setzen
  - Snapshot-/Image-Strategie festlegen

Aktuelle Instanz:

- `vps 4 4 120`
- `4 vCore`, `4 GB RAM`, `120 GB NVMe SSD`

### 2. Application Layout

Die bestehende Site bleibt zunaechst **statisch**. Ein Framework-Wechsel ist
fuer den Umzug nicht noetig.

Laufzeitaufteilung:

- `site`: statische HTML/CSS/JS-Dateien
- `backend`: kleines HTTP-Backend fuer API und spaetere Mollie-Anbindung
- `proxy`: Caddy fuer TLS, Routing, Kompression und Redirects

### 3. Deployment Model

Empfohlen ist ein reproduzierbares Setup mit **Docker Compose**.

Warum:

- klarer Betriebszustand
- leicht neu aufsetzbar
- spaeter einfach um Datenbank oder Worker erweiterbar
- saubere Trennung zwischen `site`, `backend` und `proxy`

`systemd` plus direkt installierte Prozesse waere moeglich, ist aber fuer
spaetere Erweiterungen unpraktischer.

### 4. Data Storage

Fuer den ersten Schritt reicht:

- `SQLite`, wenn nur Healthchecks, Konfiguration und sehr wenig Schreiblast
  vorbereitet werden

Sauberer fuer spaetere Bestellungen:

- `PostgreSQL`

Empfehlung:

- Phase 1 kann mit Backend-Skelett und ohne produktive Bestelldatenbank
  starten.
- Vor der echten Mollie-Integration sollte ein klares Datenmodell vorhanden
  sein.

### 5. Payment Approach

Fuer Mollie ist langfristig ein **kleines eigenes Backend** vorgesehen.

Nicht vorgesehen:

- direkte Browser-Kommunikation mit der Mollie-API
- n8n als primaerer Bestell-Eingangspunkt
- externe Flickenteppich-Integrationen ohne eigene Systemgrenze

## Scope

### In Scope For This Umbau

- Hosting-Wechsel von GitHub Pages auf IONOS VPS
- DNS- und TLS-Setup ueber Joker und Caddy
- reproduzierbare Deploy-Struktur
- eigenes Backend-Grundgeruest
- optional internes Order-Draft-Modell vorbereiten
- Logging, Backups, Rollback und Monitoring

### Explicitly Out Of Scope For This Step

- echte Mollie-Payment-Erzeugung
- Checkout-Weiterleitung zu Mollie
- Webhook-Produktivlogik
- finale Zahlungsarten
- finale Steuer- und Versandlogik

Diese Themen gehoeren in eine eigene Folgephase nach erfolgreichem Umzug.

## Detailed Migration Plan

### Phase 0: Freeze And Decisions

Ziel:
Vor dem Umzug keine parallelen Infrastrukturannahmen mehr offen lassen.

Schritte:

- aktuell produktive Inhalte einfrieren
- bestehende Seiten, Pfade und Redirects erfassen
- Joker-Zugang und DNS-Verwaltung fuer `indiebox.ai` verfuegbar halten
- Ziel-OS, VPS-Groesse und Caddy als festen Proxy festhalten
- SSH-Key-Strategie festlegen
- Backup-Strategie festlegen

Ergebnis:

- klarer Zielzustand fuer den Infrastrukturwechsel

### Phase 1: IONOS VPS Provisioning

Ziel:
Die neue Zielinstanz bereitstellen, ohne die bestehende Site sofort
umzuschalten.

Schritte:

- IONOS VPS anlegen
- `Ubuntu 24.04 LTS` installieren
- SSH-Key hinterlegen
- Firewall-Regeln im Cloud Panel setzen
  - `22` nur fuer bekannte Admin-IP(s) oder bewusst eingeschraenkt
  - `80` offen
  - `443` offen
- Grundhaertung:
  - separaten sudo-User anlegen
  - Root-Login nach erfolgreichem Bootstrap reduzieren
  - automatische Security Updates nach Policy
- KVM-Konsole als Fallback dokumentieren

Ergebnis:

- vorbereiteter Zielserver fuer Deployment

### Phase 2: Runtime Foundation

Ziel:
Die technische Basis so bauen, dass die Site reproduzierbar deploybar ist.

Schritte:

- Verzeichnisstruktur auf dem Server definieren
  - `/srv/indiebox/app`
  - `/srv/indiebox/config`
  - `/srv/indiebox/data`
  - `/srv/indiebox/backups`
- Docker und Docker Compose Plugin installieren
- Caddy konfigurieren
- statische Site aus dem Repo deployen
- Build-/Deploy-Skript im Repo anlegen
- `.env.example` fuer spaetere Secrets anlegen

Ergebnis:

- wiederholbares Deployment ohne Payment-Logik

### Phase 3: Static Site Staging And Cutover

Ziel:
Die bestehende statische Seite erfolgreich vom VPS ausliefern.

Schritte:

- DNS-Inventar in Joker dokumentieren
- TTL vor dem Umzug absenken
- Staging zuerst ueber `staging.indiebox.ai` oder `preview.indiebox.ai`
  vorbereiten
- Caddy TLS fuer Staging pruefen
- Navigation, Assets, EN/DE-Seiten, Docs und Checkout-Seite pruefen
- nach erfolgreichem Staging A- und ggf. AAAA-Records in Joker umschalten
- TTL nach erfolgreichem Cutover wieder auf normalen Wert setzen

Pruefpunkte:

- Startseite laedt
- `indiebox.ai` laedt
- ggf. `www.indiebox.ai` leitet korrekt weiter oder ist bewusst nicht aktiv
- EN/DE-Seiten laden
- Docs laden
- `checkout.html` laedt
- Redirects und Canonicals funktionieren
- HTTPS ist sauber

Ergebnis:

- komplette Site auf eigener Infrastruktur live

### Phase 4: Backend Foundation

Ziel:
Ein kleines eigenes Backend einfuehren, ohne sofort Zahlungslogik zu
aktivieren.

Backend-Verantwortung in dieser Phase:

- Healthcheck
- Konfigurationsverwaltung
- strukturierte Logs
- API-Routing vorbereiten
- optional persistente Order-Drafts vorbereiten

Empfohlene Endpunkte:

- `GET /api/health`
- `GET /api/version`
- optional `POST /api/order-drafts`

Ergebnis:

- Backend laeuft produktionsnah, aber ohne echte Payment-Abhaengigkeit

### Phase 5: Order Model Preparation

Ziel:
Die spaetere Payment-Integration fachlich vorbereiten.

Empfohlenes Datenmodell:

- `orders`
  - `id`
  - `locale`
  - `status`
  - `product_sku`
  - `amount`
  - `currency`
  - `customer_email`
  - `first_name`
  - `last_name`
  - `company`
  - `vat_id`
  - `billing_address_json`
  - `shipping_address_json`
  - `notes`
  - `payment_provider`
  - `payment_reference`
  - `created_at`
  - `updated_at`

Statusmodell:

- `draft`
- `payment_created`
- `paid`
- `failed`
- `cancelled`
- `fulfilled`

Ergebnis:

- spaetere Mollie-Integration kann auf klares internes Modell aufsetzen

### Phase 6: Operations

Ziel:
Der neue Betrieb soll kontrollierbar und wiederherstellbar sein.

Schritte:

- Logrotation oder Container-Logging-Strategie festlegen
- Monitoring mindestens fuer:
  - HTTP reachability
  - TLS validity
  - Disk usage
  - container/service health
- Backup-Strategie festlegen
- Restore-Test dokumentieren
- Fallback ueber KVM-Konsole festhalten

Ergebnis:

- produktionsfaehiger Betrieb statt nur "Server laeuft"

## Deferred Payment Integration Plan

Diese Phase ist bewusst **nachgelagert**.

### Phase 7: Mollie Integration After Cutover

Ziel:
Nach stabilem Hosting und laufendem Backend wird Mollie angebunden.

Geplanter Flow:

1. `checkout.html` sendet Bestelldaten an das eigene Backend
2. Backend validiert Daten und legt Order-Draft an
3. Backend erzeugt Mollie Payment
4. Mollie gibt Checkout-URL zurueck
5. Browser wird weitergeleitet
6. Mollie ruft Webhook auf
7. Backend fragt Zahlungsstatus bei Mollie nach
8. Erst dann wird die Bestellung als `paid` markiert

Pflichtbestandteile in dieser Phase:

- `POST /api/orders/checkout`
- `POST /api/mollie/webhook`
- Success-/Cancel-Seiten
- rechtliche Texte aktualisieren

### Phase 8: Payment Hardening

Nach erster erfolgreicher Integration:

- Idempotenz fuer Webhooks
- Retry-Verhalten
- E-Mail-Bestaetigungen
- operative Bestellansicht
- manuelle Rueckerstattungs- und Fehlerprozesse

## Repo Changes To Prepare

Diese Aenderungen sollten im Repo entstehen, auch wenn Mollie erst spaeter
aktiviert wird:

- `deploy/` oder `ops/` fuer Infrastruktur und Startskripte
- `.env.example`
- `docker-compose.yml`
- Caddy-Konfiguration
- Backend-Skelett
- Dokumentation fuer Deployment und Rollback

Empfohlene Struktur:

```text
indie-landing/
├── backend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── deploy/
│   ├── caddy/
│   ├── compose/
│   └── scripts/
├── docs/
├── en/
├── style.css
├── script.js
└── docker-compose.yml
```

## Risks

### Risk 1: Hosting And Payment Change At The Same Time

Vermeidung:

- Mollie erst nach stabilem VPS-Cutover integrieren

### Risk 2: Server Exists But Is Not Operable

Vermeidung:

- SSH, KVM-Konsole, Backups, Monitoring und Service-Definitionen von Anfang an
  mit einplanen

### Risk 3: Overbuilding Too Early

Vermeidung:

- kein Framework-Wechsel vor dem Hosting-Wechsel erzwingen
- kein n8n einziehen, solange stabile feste Geschaeftslogik reicht

### Risk 4: False Sense Of Backup Safety

Vermeidung:

- Restore aktiv testen
- Datenhaltung und Konfiguration getrennt sichern

## Recommended Execution Order

1. VPS-Groesse und OS final festlegen
2. IONOS VPS anlegen und per SSH absichern
3. Joker-DNS-Bestand fuer `indiebox.ai` dokumentieren
4. Docker- und Caddy-Basis aufsetzen
5. statische Site produktionsnah deployen
6. DNS und HTTPS ueber Joker umziehen
7. Backend-Skelett einfuehren
8. Order-Draft-Modell vorbereiten
9. Monitoring und Backups absichern
10. erst danach Mollie integrieren

## Exit Criteria For Phase 1

Der Umzug gilt als erfolgreich, wenn:

- die Site vollstaendig vom IONOS VPS ausgeliefert wird
- HTTPS stabil funktioniert
- Deployments reproduzierbar sind
- ein eigenes Backend laeuft
- Backups und Monitoring eingerichtet sind
- der Checkout ohne Payment-Logik weiterhin stabil erreichbar ist

## Exit Criteria For Phase 2

Die Mollie-Integration gilt erst dann als produktionsreif, wenn:

- Zahlungen serverseitig erzeugt werden
- Webhooks verarbeitet und verifiziert werden
- Bestellungen nur nach bestaetigtem Zahlungsstatus auf `paid` wechseln
- Success-Seiten nicht als Zahlungsquelle missbraucht werden
- Rechts- und Datenschutzhinweise aktualisiert sind
