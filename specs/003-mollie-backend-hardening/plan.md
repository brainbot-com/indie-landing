# Mollie Backend Hardening Plan

## Ziel

Aus dem aktuellen Mollie-Prototyp soll ein kleines, belastbares Order-Backend werden:

- Orders dauerhaft speichern
- Zahlungsstatus nachvollziehbar verarbeiten
- doppelte Webhooks schadlos tolerieren
- eine minimale interne Sicht auf Bestellungen bereitstellen
- die Live-Schaltung vorbereiten, ohne jetzt schon unnötig groß zu bauen

## Status nach dem aktuellen Umbau

Bereits umgesetzt:

- SQLite als lokale Datenhaltung statt JSON-Dateien in der Hauptlogik
- automatische Übernahme vorhandener Legacy-JSON-Orders in die Datenbank
- Order-Tabelle mit Kundendaten, Adressen, Payment-Status und Mollie-Referenzen
- Payment-Event-Log für Checkout-Start, Payment-Erzeugung und Webhook-Synchronisierung
- idempotente Webhook-Verarbeitung über `payment_id + payment_status`
- Admin-API für lokale/interne Nutzung:
  - `GET /api/orders`
  - `GET /api/orders/:orderId`
- Checkout und Statuspfad arbeiten gegen SQLite
- Zahlungsarten werden aus Mollie geladen und im Formular dynamisch angezeigt

## Architektur

### Laufzeit

- `Caddy` als Reverse Proxy
- `backend-staging` und `backend-live` als getrennte Container
- pro Umgebung eigene `.env`
- pro Umgebung eigenes Datenverzeichnis

### Datenhaltung

SQLite-Datei im jeweiligen `DATA_DIR`:

- `orders`
- `payment_events`

Die Datenbank ist bewusst klein und lokal. Für den aktuellen Umfang ist das sinnvoller als eine sofortige Postgres-Einführung.

## Nächste Ausbaustufen

### 1. Admin-Zugriff absichern

Aktuell ist die Order-API absichtlich nur lokal bzw. bei gesetztem `ENABLE_ADMIN_API=true` aktiv.  
Vor einem Staging-/Live-Einsatz braucht es eine echte Zugangssicherung:

- HTTP Basic Auth auf Reverse-Proxy-Ebene oder
- eigenes Admin-Token oder
- VPN / IP-Restriktion

Empfehlung:

- zuerst Basic Auth auf Staging
- später entscheiden, ob ein kleines internes Admin-Frontend sinnvoll ist

### 2. Validierung härten

Noch offen:

- E-Mail robuster validieren
- Pflichtfelder serverseitig stärker prüfen
- Länder/Adressfelder normalisieren
- Länge von Freitexten und Sonderfällen definieren
- B2B/B2C-Fälle klar trennen, falls USt.-Logik relevant wird

### 3. Produkt- und Preislogik vom Formular lösen

Aktuell ist das Produkt noch formnah.

Nächster Schritt:

- serverseitige Produktdefinition
- eindeutige Produkt-ID
- Preis und Währung nur aus dem Backend

Dann kann das Frontend keine fachliche Preislogik mehr beeinflussen.

### 4. Fulfillment und Benachrichtigung

Nach `paid` fehlen noch Folgeaktionen:

- Bestellbestätigung per E-Mail
- interne Benachrichtigung
- optional Rechnungs- oder Versandlogik
- interner Status `fulfilled`

Empfehlung:

- zuerst einfache Transaktionsmail
- danach manuelles Fulfillment sauber modellieren

### 5. Logging und Betrieb

Noch offen:

- strukturierte Fehlerlogs
- Log-Rotation
- Backup-Konzept für SQLite
- Restore-Test
- Service-Monitoring

Empfehlung:

- täglicher SQLite-Dump
- Order-Daten zusätzlich in Server-Backups
- einfacher Uptime-/Health-Check auf `/api/health`

### 6. Live-Schaltung

Vor Live:

- `runtime.live.env` vollständig befüllen
- Mollie Live-Profil prüfen
- Webhook-URL live verifizieren
- `indiebox.ai` final auf den neuen Stack ziehen
- Staging und Live getrennt testen

## Empfohlene Reihenfolge

1. Admin-Zugriff absichern
2. Validierung härten
3. E-Mail / Fulfillment ergänzen
4. Backup- und Betriebssetup ergänzen
5. Live-Profil verdrahten
6. End-to-End-Test mit echter Live-Zahlung

## Hinweis

Die aktuelle SQLite-Lösung ist für den jetzigen Umfang angemessen.  
Ein Wechsel auf Postgres wird erst sinnvoll, wenn mehrere Schreibpfade, umfangreicheres Backoffice oder teamweiser Zugriff entstehen.
