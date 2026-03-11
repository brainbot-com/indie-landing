# Security Hardening Plan

## Ziel

Das bestehende Checkout-, Admin- und Inventarsystem soll so gehärtet werden, dass es für produktive Bestellungen und interne Betriebsprozesse belastbar ist.

Schwerpunkte:

- untrusted Input sicher verarbeiten
- gespeicherte und reflektierte XSS schließen
- Admin-Zugriff deutlich härten
- öffentliche Endpunkte gegen Missbrauch begrenzen
- Transport- und Browser-Sicherheit erzwingen
- gespeicherte Kunden- und Zahlungsdaten minimieren und besser schützen

## Umsetzungsstand

Stand: 11.03.2026

| Block | Status | Kurzfazit |
| --- | --- | --- |
| Block 1: XSS und Input-Härtung | teilweise umgesetzt | Escaping und Input-Normalisierung sind drin, aber keine echte Schema-Validierung |
| Block 2: Admin-Zugang härten | teilweise umgesetzt | Staging hat Basic Auth plus App-Session, die Admin-API ist aber nicht zusätzlich auf Proxy-Ebene geschützt |
| Block 3: Öffentliche Status-URL absichern | umgesetzt | `order_id` allein reicht nicht mehr, `status_token` ist Pflicht |
| Block 4: Transport- und Browser-Sicherheit | teilweise umgesetzt | Header und TLS-Hosts sind da, aber `:80` liefert noch Inhalte statt nur HTTPS-Redirect |
| Block 5: Missbrauchsschutz und Beobachtbarkeit | teilweise umgesetzt | Rate Limiting ist aktiv, strukturierte Security-/Audit-Logs fehlen |
| Block 6: Datenminimierung und Serverrechte | teilweise umgesetzt | Mollie-Payload wurde reduziert, Response-Minimierung und sauber dokumentierte Rechte/Restore-Prozesse fehlen noch |

## Bereits umgesetzt

- Stored-XSS-Grundschutz in den Admin-Seiten durch serverseitiges/Client-seitiges Escaping
- Input-Normalisierung für:
  - Namen
  - Adresse
  - E-Mail
  - Telefon
  - USt-ID
  - PLZ
  - ISO-Datumsfelder
  - Enumerationen
- Admin-App-Login über HttpOnly-Session-Cookie statt nur Browser-Token
- Session-Cookie mit:
  - `HttpOnly`
  - `SameSite=Strict`
  - `Secure` außerhalb `development`
- Staging-Admin zusätzlich hinter Basic Auth
- `status_token` für öffentliche Bestellstatus-Abfragen
- Rate Limiting für:
  - `/api/orders/checkout`
  - `/api/orders/status`
  - Admin-Login / Admin-API
  - Mollie-Webhook
- Security Header in Caddy:
  - CSP
  - HSTS für TLS-Hosts
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Cross-Origin-Opener-Policy`
  - `Cross-Origin-Resource-Policy`
- Mollie-Payload-Minimierung in SQLite

## Noch offen

- echte Schema-Validierung statt Utility-basiertem Feld-Handling
- Proxy-Schutz auch für Admin-API sauber entscheiden und konsequent umsetzen
- `:80` nur noch als Redirect auf HTTPS betreiben
- strukturierte Audit- und Security-Logs
- Admin-Responses weiter minimieren
- Datei-/Backup-Rechte und Restore-Test direkt im Plan dokumentieren

## Aktuelle Hauptschwachstellen

### Kritisch

1. Stored XSS in den Admin-Seiten
- Admin-Listen werden per `innerHTML` aus Datenbankinhalten aufgebaut.
- Kundendaten, Lieferantenfelder und Notizen können dadurch beim Anzeigen aktiven Code ausführen.

2. Schwaches Admin-Authentifizierungsmodell
- ein statischer Bearer-Token schützt alle Admin-Endpunkte
- der Token liegt im Browser in `sessionStorage`
- keine Benutzerkonten, keine Rotation, keine zweite Schranke

3. Öffentliche Statusabfrage nur mit `order_id`
- `GET /api/orders/status` ist ohne Auth aufrufbar
- bei bekannt gewordener Order-ID ist der Zahlungsstatus offen einsehbar

### Hoch

4. Root-Site und Root-API noch nicht HTTPS-only
- die Hauptseite wird derzeit noch auf `:80` ausgeliefert
- HTTP darf nur noch für Redirects auf HTTPS verwendet werden

5. Eingabevalidierung zu schwach
- viele Felder werden nur getrimmt und längenbegrenzt
- keine saubere Schema-Validierung
- keine konsistente Whitelist für Zeichen, Formate und Datumsfelder

6. Keine Missbrauchsbegrenzung
- kein Rate Limiting
- keine IP-Drosselung
- keine harte Begrenzung für Status- oder Checkout-Abfragen

### Mittel

7. Zu breite Datenhaltung
- vollständige Mollie-Payloads werden gespeichert
- Admin-Responses enthalten mehr Daten als operativ nötig

8. Fehlende Browser-Sicherheitsheader
- keine CSP
- keine HSTS-Strategie
- keine restriktiven Referrer-/Framing-/MIME-Header

9. Dateirechte und Backups enger fassen
- Daten- und Backup-Verzeichnisse sind aktuell breiter berechtigt als nötig

## Zielzustand

Nach der Härtung soll gelten:

- untrusted Text wird nie ungefiltert als HTML gerendert
- Checkout- und Admin-Input wird serverseitig nach Schema validiert
- Admin-Zugriff ist zusätzlich zu App-Logik auch auf Proxy-/Netzebene geschützt
- Statusseiten benötigen einen zweiten geheimen Zugriffswert
- Live-Seiten sind HTTPS-only mit HSTS und CSP
- öffentliche Endpunkte sind rate-limitiert
- gespeicherte PII und Payment-Metadaten sind auf das Notwendige reduziert
- Backups und Datenverzeichnisse sind restriktiv berechtigt

## Umsetzungsblöcke

### Block 1: XSS und Input-Härtung

Status: teilweise umgesetzt

Ziel:
- Stored XSS schließen
- gefährliche Eingaben früh normalisieren

Maßnahmen:
- Admin-Rendering von `innerHTML` auf sichere DOM-Erzeugung oder konsequentes Escaping umstellen
- serverseitig Utility-Funktionen für Plain-Text-Normalisierung einführen
- Felder in sinnvolle Kategorien trennen:
  - Name/Firma
  - Adresse
  - E-Mail
  - Telefon
  - Freitext/Notizen
  - Datumsfelder
  - Enumerationen/Statusfelder
- unerwartete Werte verwerfen
- Freitext nur als Plain Text behandeln

Akzeptanzkriterien:
- HTML-/Script-Payloads in Kundendaten oder Notizen werden im Admin nur als Text angezeigt
- Checkout und Admin speichern keine offensichtlich ungültigen Werte mehr
- Status-, Datums- und Mengenfelder werden serverseitig strikt validiert

Ist-Stand:
- Escaping in den Admin-Ansichten ist eingebaut
- Feld-Normalisierung und Formatprüfungen sind eingebaut
- echte Schema-Validierung mit zentralem Validierungsmodell fehlt noch

### Block 2: Admin-Zugang härten

Status: teilweise umgesetzt

Ziel:
- Admin-Endpunkte nicht mehr allein auf einen Frontend-Token stützen

Maßnahmen:
- Admin-Routen zusätzlich auf Proxy-Ebene schützen
- bevorzugt:
  - HTTP Basic Auth auf Staging und Live
  - optional zusätzlich IP-Allowlist oder VPN/Tailscale
- statischen App-Token rotierbar machen oder mittelfristig ersetzen
- Admin-Token nicht dauerhaft im Browser speichern, wenn Proxy-Schutz aktiv ist

Akzeptanzkriterien:
- `/admin/*` und Admin-API sind ohne Proxy-Auth nicht erreichbar
- Token-Leak allein reicht nicht mehr für vollständigen Admin-Zugriff

Ist-Stand:
- Staging-Admin-Seiten sind per Basic Auth geschützt
- die App nutzt Session-Cookies statt reinem Frontend-Token
- Fallback per `ADMIN_API_TOKEN` existiert weiter
- die Admin-API ist nicht zusätzlich per Proxy-Basic-Auth geschützt

### Block 3: Öffentliche Order-Status-URL absichern

Status: umgesetzt

Ziel:
- Zahlungsstatus nicht nur über eine Order-ID offenlegen

Maßnahmen:
- pro Order einen zufälligen `status_token` erzeugen
- Rücksprungseite und Status-Endpoint nur mit `order_id + status_token`
- bestehende Staging-Orders migrationsfreundlich behandeln

Akzeptanzkriterien:
- eine bekannte `order_id` allein reicht nicht mehr für Statusabfragen

Ist-Stand:
- umgesetzt
- Rücksprungseite und Status-Endpunkt nutzen `order_id + status_token`

### Block 4: Transport- und Browser-Sicherheit

Status: teilweise umgesetzt

Ziel:
- Live-Verkehr nur noch über abgesicherte Hosts

Maßnahmen:
- Root-Domain auf hostbasierte TLS-Konfiguration umstellen
- `:80` nur noch als Redirect auf HTTPS
- Security Header in Caddy setzen:
  - `Strict-Transport-Security`
  - `Content-Security-Policy`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `frame-ancestors 'none'`

Akzeptanzkriterien:
- Root-Site und Checkout laufen nur noch über HTTPS
- Browser-Sicherheitsheader sind nachvollziehbar gesetzt

Ist-Stand:
- TLS-Hosts und Header sind eingerichtet
- `indiebox.ai`, `www.indiebox.ai`, `staging.indiebox.ai`, `docs.indiebox.ai` laufen mit TLS
- der Catch-all-Host `:80` liefert weiterhin Inhalte und API statt nur Redirects

### Block 5: Missbrauchsschutz und Beobachtbarkeit

Status: teilweise umgesetzt

Ziel:
- Spam, Enumeration und Brute-Force begrenzen

Maßnahmen:
- Rate Limiting einführen für:
  - `/api/orders/checkout`
  - `/api/orders/status`
  - Admin-API
  - Mollie-Webhook
- strukturierte Request-Logs ergänzen
- Admin- und Checkout-Fehler sauber protokollieren

Akzeptanzkriterien:
- wiederholte missbräuchliche Requests werden gebremst
- verdächtige Zugriffsmuster sind im Betrieb nachvollziehbar

Ist-Stand:
- Rate Limiting ist implementiert
- strukturierte Audit-/Security-Logs fehlen
- es gibt noch keine dedizierte Auswertung verdächtiger Zugriffsmuster

### Block 6: Datenminimierung und Serverrechte

Status: teilweise umgesetzt

Ziel:
- Impact eines Leaks verkleinern

Maßnahmen:
- Mollie-Payload auf notwendige Felder reduzieren oder getrennt kapseln
- Admin-Responses auf operative Daten beschränken
- Daten- und Backup-Verzeichnisse auf minimale Rechte reduzieren
- Backup-Routine dokumentieren und Restore-Test festhalten

Akzeptanzkriterien:
- nur notwendige Payment-Metadaten werden dauerhaft gehalten
- Datei- und Backup-Rechte sind restriktiv

Ist-Stand:
- Mollie-Payloads werden auf ein Minimalformat reduziert gespeichert
- Admin-Responses sind noch breiter als nötig
- restriktive Rechte und Restore-Tests sind noch nicht sauber im Plan dokumentiert

## Empfohlene Reihenfolge

1. Block 1: XSS und Input-Härtung
2. Block 2: Admin-Zugang härten
3. Block 3: Öffentliche Status-URL absichern
4. Block 4: Transport- und Browser-Sicherheit
5. Block 5: Missbrauchsschutz und Beobachtbarkeit
6. Block 6: Datenminimierung und Serverrechte

## Nächster Schritt

Direkt umsetzen:

- Block 4 abschließen:
  - `:80` auf Redirect-only umstellen
- Block 2 abschließen:
  - Admin-API-Absicherung auf Proxy-Ebene sauber entscheiden
- Block 5/6 abschließen:
  - Audit-Logging ergänzen
  - Rechte- und Restore-Dokumentation vervollständigen
