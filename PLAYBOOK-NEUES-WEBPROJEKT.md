# Playbook: Neues Website-Projekt

Handoff aus dem Projekt `indie-landing` (indiebox.ai). Dieses Dokument enthält alles, was eine neue Claude-Session braucht, um ein komplett neues Website-Projekt nach demselben Muster aufzusetzen: lokal bauen und anschauen, dann kontrolliert auf einen Remote-Server deployen. Mit oder ohne GitHub.

**Nutzung in einer neuen Session:**

> Lies `/Users/heiko/github/indie-landing/PLAYBOOK-NEUES-WEBPROJEKT.md` und setze danach ein neues Website-Projekt auf. Führe zuerst das Init-Interview mit mir durch.

Die referenzierten Originalskripte liegen in `/Users/heiko/github/indie-landing/` und können als Kopiervorlage dienen.

---

## 1. Init-Interview (in der neuen Session zuerst klären)

Bevor irgendeine Datei entsteht, diese Entscheidungen abfragen und die Antworten sofort in `CLAUDE.md` + ein Konzeptdokument im neuen Projekt schreiben (Learning: nur im Chat vereinbarte Stände fallen nach vielen Iterationen aus dem Kontext).

1. **Projektname und Domain** (auch: gibt es eine Staging-Subdomain, z. B. `staging.<domain>`?)
2. **GitHub: ja oder nein?**
   - *Mit GitHub*: Repo anlegen, CI-Deploy via GitHub Actions (Push auf `main` → Staging, Release → Live). Manuelle Skripte als Fallback.
   - *Ohne GitHub*: lokales Git-Repo trotzdem anlegen (Historie!), Deploy ausschließlich über lokale rsync-Skripte.
3. **Zielserver**: vorhandener IONOS-VPS (87.106.111.141, Caddy, hostet mehrere Projekte) oder ein anderer/neuer Server? Bei neuem Server: SSH-Zugang, Deploy-User, Caddy vorhanden?
4. **Staging ja/nein?** (Empfehlung: ja, sobald die Seite öffentlich ist)
5. **Sprachen**: nur DE, oder DE als Quelle + generiertes EN (wie bei indiebox)?
6. **Backend nötig?** (Formulare, Checkout, API). Wenn nein: reine statische Seite, deutlich einfacher. Wenn ja: separates Backend-Deployment nach dem Muster `push-stack.sh` einplanen.
7. **Design**: gibt es Vorgaben (Farben, Fonts, Logo)? Ablauf der Design-Phase: Abschnitt 4. Ergebnis früh in `STYLE_GUIDE.md` festhalten.
8. **Ausgangsmaterial**: In welcher Form kommen Texte und Bilder (Word, PDF, Fotos)? Aufbereitung: Abschnitt 3.
9. **KI-Crawler-Policy**: Dürfen Modelltraining-Crawler (GPTBot, ClaudeBot usw.) die Seite nutzen, oder nur Suche und KI-Live-Abrufe? Steuert die robots.txt (Abschnitt 5).

---

## 2. Architektur-Blaupause

Kernprinzip aus indie-landing: **statische Seite, keine Frameworks, kein Build-Tooling-Zoo**. Nur Node.js (LTS) für kleine eigene Skripte. Neu gegenüber indie-landing: Texte und Bilder leben als Markdown + Assets-Ordner und sind die Quelle der Wahrheit, HTML wird daraus generiert.

```
<projekt>/
  intake/                  # Rohmaterial im Anlieferungszustand (Word, PDF, Originalfotos)
  content/                 # QUELLE DER WAHRHEIT für alle Texte
    index.md               # eine Markdown-Datei pro Seite
    ueber-uns.md
    ...
  assets/                  # QUELLE DER WAHRHEIT für Bilder, Fonts, Downloads
    hero.webp
    ...
  templates/               # HTML-Layouts und Sektions-Templates
    layout.html            # Grundgerüst (head, header, footer)
    sections/              # optional: wiederverwendbare Sektionstypen
  mock/                    # Wegwerf-Layoutentwürfe der Design-Phase (wird nie deployt)
  site/                    # GENERIERTER Output, nur dieser wird deployt
  scripts/
    build.mjs              # content/ + templates/ + assets/ -> site/
  deploy/
    scripts/
      local-preview.mjs    # lokaler Webserver auf site/
      push-site.sh         # manuelles rsync-Deploy (staging/live)
    caddy/
      <projekt>.caddy      # Vhost-Snippet für den Server
  .github/workflows/       # nur bei GitHub-Variante
    deploy-staging.yml
    deploy-live.yml
  CLAUDE.md                # Arbeitsregeln, Kanon, Entscheidungen
  STYLE_GUIDE.md           # Typo, Farben, Komponenten (Single Source of Truth)
  README.md                # Architektur + Deploy-Doku (Muster: indie-landing README)
```

Wichtiger Unterschied zu indie-landing: dort liegt das HTML handgepflegt im Repo-Root und der Root wird deployt. Im neuen Muster wird **nur `site/` deployt**, dadurch entfällt die lange, fehleranfällige rsync-Exclude-Liste fast komplett (siehe Fallstricke).

### Content-Konventionen (Markdown)

Jede Seite ist eine Markdown-Datei mit Frontmatter:

```markdown
---
title: Über uns
description: Meta-Description für SEO
slug: ueber-uns          # -> site/ueber-uns.html
lang: de
template: layout          # optional, Default: layout
---

## hero
# Wir bauen Dinge, die bleiben
Einleitungstext der Hero-Sektion.
![Teamfoto](assets/team.webp)

## features
### Schnell
Text zur Feature-Karte ...
```

- `## <sektionsname>` trennt Sektionen; das Build-Skript ordnet sie Templates zu (`templates/sections/<name>.html`) oder rendert sie als generischen Block.
- Bilder immer relativ als `assets/...` referenzieren; das Build-Skript kopiert `assets/` nach `site/assets/` und kann dabei prüfen, ob referenzierte Dateien existieren.
- Texte NIE direkt in HTML-Templates schreiben, Templates enthalten nur Struktur und Platzhalter.

### Build-Skript (`scripts/build.mjs`)

- Node.js, eine einzige Dependency ist erlaubt und pragmatisch: `marked` (Markdown-Parser). Alternativ komplett dependency-frei mit eigenem Mini-Parser, wenn der Markdown-Umfang klein bleibt.
- Ablauf: `content/*.md` lesen → Frontmatter parsen → Sektionen splitten → in Templates einsetzen → `site/<slug>.html` schreiben → `assets/` nach `site/assets/` spiegeln → `sitemap.xml`, `robots.txt` und `llms.txt` generieren (Details: Abschnitt 5).
- `node scripts/build.mjs` baut alles; `node --watch scripts/build.mjs` oder ein simpler fs.watch-Modus für Live-Arbeit.

---

## 3. Material-Eingang und Aufbereitung (Word/PDF/Bilder → content/ + assets/)

Typischer Startzustand: Die Texte kommen als Word-Dokumente oder PDFs vom Auftraggeber, dazu ein Satz vorhandener Fotos (häufig Personenfotos). Diese Rohlinge sind NICHT die Quelle der Wahrheit. Sie werden einmalig nach `content/` und `assets/` überführt und ab dann nur noch dort gepflegt.

### Ablage

- Alles Angelieferte unverändert nach `intake/` legen (Texte nach `intake/texte/`, Fotos nach `intake/bilder/`). Das ist die Nachschlage- und Vergleichsbasis, wenn später Fragen kommen ("stand das so im Original?").
- Bei großen Originaldateien entscheiden: `intake/` versionieren, per Git LFS, oder unversioniert lassen. Die Entscheidung in `CLAUDE.md` festhalten.

### Texte überführen

- **PDFs** kann Claude direkt lesen (Read-Tool), daraus die Inhalte extrahieren.
- **Word-Dokumente** vorher konvertieren: `pandoc intake/texte/xyz.docx -t gfm -o intake/texte/xyz.md --extract-media=intake/media` (eingebettete Bilder landen mit in `intake/media/`).
- Dann **kuratieren statt kopieren**: Die Rohtexte in die Seitenstruktur überführen (`content/<seite>.md` mit Frontmatter und Sektionen). Word-Prosa ist fast immer zu lang fürs Web; kürzen, in Sektionen gliedern, Überschriften-Hierarchie neu denken. Lücken (fehlende Meta-Descriptions, CTAs, Bildunterschriften) als offene Fragen sammeln, nicht erfinden.
- Wo vom Originaltext inhaltlich abgewichen wird, die Abweichung mit dem Auftraggeber rückkoppeln, bevor sie live geht.

### Bilder überführen

- Originale bleiben in `intake/bilder/`. Nach `assets/` kommen nur web-fertige Kopien: sprechende Dateinamen (`vorname-nachname.webp` statt `IMG_4711.jpg`), auf Zielgröße skaliert, als WebP konvertiert (macOS: `sips`, alternativ `cwebp` oder ImageMagick).
- **EXIF-Metadaten entfernen** (enthalten oft GPS-Position und Gerätedaten): `exiftool -all= assets/*.webp` oder bei der Konvertierung strippen.
- **Personenfotos:** Vor Live-Gang klären, dass jede abgebildete Person der Veröffentlichung zugestimmt hat (Recht am eigenen Bild, DSGVO). Der Staging-robots-Schutz ist keine rechtliche Absicherung, Staging ist öffentlich erreichbar. Zusagen schriftlich beim Auftraggeber einholen und den Stand im Konzeptdokument vermerken.
- Alt-Texte für jedes Bild direkt im Markdown pflegen (`![Alt-Text](assets/...)`); bei Personen nur mit Namen, wenn das gewollt ist.

---

## 4. Design-Phase mit Claude

Eigene Phase zwischen Material-Aufbereitung und Build-System. Design entsteht direkt im Dialog mit Claude, kein zusätzlicher Skill nötig. Reihenfolge ist entscheidend: erst echte Inhalte (Abschnitt 3), dann Layout. Ein Layout um Platzhaltertexte kippt später immer.

1. **Design-Kontext festhalten**, bevor die erste Zeile CSS entsteht: Zielgruppe, Tonalität, 2-3 Referenzseiten und was daran konkret gefällt, vorhandene Vorgaben (Logo, Farben, Fonts). Ergebnis ins Konzeptdokument.
2. **Wegwerf-Mocks statt Templates:** In `mock/` eine einzelne HTML-Seite mit den echten Texten und Bildern aus `content/` und `assets/` bauen, davon 2-3 bewusst unterschiedliche Varianten (z. B. ruhig/editorial vs. kräftig/plakativ). Über den Preview-Server im Browser anschauen.
3. **Feedback-Schleife:** Heiko schaut im Browser und gibt Feedback; bei Bedarf Screenshots in den Chat, dann sieht Claude denselben Stand. In dieser Phase ist Iterieren billig, weil noch kein Build-System dranhängt.
4. **Einfrieren:** Wenn eine Richtung gewonnen hat, Tokens (Farben, Typo-Skala, Abstände, Radien) in `STYLE_GUIDE.md` plus eine zentrale Token-CSS extrahieren. Ab hier gilt die Kanon-Regel: Design-Fragen werden gegen die Datei entschieden, nicht gegen Chat-Erinnerung.
5. **Erst jetzt Templates bauen:** `templates/layout.html` und Sektions-Templates aus dem Gewinner-Mock ableiten, dann das Build-Skript verdrahten. Die unterlegenen Mock-Varianten löschen oder als `mock/archiv/` behalten.

Optional lässt sich später ein Design-Skill wie [impeccable](https://github.com/pbakaus/impeccable) für Audit- und Polish-Pässe ergänzen; für den Start ist er nicht nötig.

---

## 5. SEO und AEO (Templates, robots.txt, llms.txt)

Sichtbarkeit in klassischer Suche (SEO) und in KI-Antwortmaschinen (AEO) ist Template- und Build-Sache, nicht nachträgliche Kür. Alles hier wird vom Build-Skript aus `content/` generiert, nichts von Hand in einzelne HTML-Dateien gepflegt.

### Head-Block im Template (pro Seite, aus Frontmatter)

Muster: `index.html` Zeilen 10-33 in indie-landing. `templates/layout.html` enthält diesen Block mit Platzhaltern:

- `<title>` und `<meta name="description">` aus Frontmatter (Pflichtfelder, Build bricht ab, wenn sie fehlen).
- `<link rel="canonical">` mit absoluter URL.
- Bei Zweisprachigkeit: `hreflang`-Trio pro Seite (`de`, `en`, `x-default`), beide Richtungen konsistent.
- Open Graph (`og:type`, `og:title`, `og:description`, `og:url`, `og:image` mit absoluter URL) und Twitter Card (`summary_large_image`). Ein Share-Bild pro Seite im Frontmatter, Fallback auf ein Site-Default.
- **JSON-LD (Schema.org) pro Seitentyp**, gesteuert über ein Frontmatter-Feld: `Organization`/`LocalBusiness` auf der Startseite, `Product` mit `offers` inkl. `price`, `priceCurrency`, `availability` (Learning: das fehlende `price`-Feld fiel erst spät auf), `FAQPage` bei FAQ-Sektionen, `Person` bei Team-Seiten (relevant bei Projekten mit Personenfotos). Validieren mit dem Google Rich Results Test.
- Semantik: genau eine `h1` pro Seite, saubere Überschriften-Hierarchie, Alt-Texte (Abschnitt 3).

### robots.txt (Produktion)

Muster: `robots.txt` in indie-landing. Drei Bot-Klassen bewusst getrennt behandeln:

1. **Klassische Suche und KI-Suche/Live-Abruf**: erlaubt (Google, Bing, nutzergetriggerte Abrufe wie Claude-User, ChatGPT-User, Perplexity-User).
2. **Modelltraining-Crawler**: bei indiebox gesperrt (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, meta-externalagent, CCBot, Bytespider, Amazonbot, AI2Bot). Das ist eine Geschäftsentscheidung, pro Projekt im Init-Interview neu treffen. Für maximale AEO-Reichweite kann es richtig sein, sie zuzulassen.
3. **Private Pfade** für alle sperren: Admin, Checkout, Preview- und Testseiten.

Dazu die `Sitemap:`-Zeile mit absoluter URL. Die Datei vom Build-Skript generieren lassen, damit gesperrte Seiten und Sitemap-Pfad nicht auseinanderlaufen. Staging bekommt beim Deploy die strengere Override-Datei (Abschnitt Deployment).

### llms.txt (AEO)

Muster: `llms.txt` in indie-landing. Eine kompakte Markdown-Selbstbeschreibung unter `https://<domain>/llms.txt`: Einzeiler-Claim, kurze Produkt-/Firmenbeschreibung, Key Features als Liste, kommentierte Links auf die wichtigsten Seiten, Firmenangaben und Kontakt. KI-Systeme nutzen sie als Zitiergrundlage. Bei Relaunch-Texten aus `content/` generieren oder bewusst von Hand pflegen, aber im Build-Repo versionieren und bei inhaltlichen Änderungen mitziehen.

Für AEO zusätzlich in den Inhalten selbst: klare, zitierfähige Faktensätze (Zahlen, Ortsangaben, Preise konsistent über alle Seiten), eine FAQ-Sektion mit echten Fragen in natürlicher Sprache, und `llms.txt`/Schema/Copy dürfen sich nicht widersprechen.

### sitemap.xml

Vom Build-Skript generieren: alle indexierbaren Seiten mit absoluter URL, bei Zweisprachigkeit mit hreflang-Alternates; gesperrte Seiten (Checkout, Admin, Previews) tauchen nicht auf.

---

## 6. Lokale Vorschau

Vorlage: `deploy/scripts/local-preview.mjs` aus indie-landing (dependency-freier Node-HTTP-Server, ~120 Zeilen). Anpassungen für das neue Muster:

- `projectRoot` auf `site/` zeigen lassen statt auf den Repo-Root (in der Design-Phase vorübergehend auf `mock/`, z. B. per Env-Variable umschaltbar).
- Den `/api/*`-Proxy-Teil nur übernehmen, wenn es ein Backend gibt (Proxy auf `http://127.0.0.1:8080`, steuerbar über `API_ORIGIN`).
- Start: `node deploy/scripts/local-preview.mjs` → `http://127.0.0.1:3000`.

Workflow lokal: `build.mjs` (watch) + `local-preview.mjs` parallel laufen lassen, Browser auf Port 3000.

---

## 7. Deployment

### Grundmuster (beide Varianten)

- Transport: **rsync über SSH** auf den Zielserver, Ziel-Verzeichnisse pro Umgebung:
  - Live: `/srv/<projekt>/site/`
  - Staging: `/srv/staging.<projekt>/site/`
- Es wird nur `site/` synchronisiert (`rsync --archive --compress --delete site/ user@host:/srv/...`).
- **Staging = Push, Live = bewusste Handlung.** Ein normaler Push oder ein Staging-Deploy darf niemals Live anfassen.

### Variante A: mit GitHub

Vorlagen: `.github/workflows/deploy-staging.yml` und `deploy-live.yml` aus indie-landing. Kernpunkte:

- `deploy-staging.yml`: Trigger `push: branches: [main]` + `workflow_dispatch`. Concurrency-Gruppe mit `cancel-in-progress: true`.
- `deploy-live.yml`: Trigger `release: types: [published]` + `workflow_dispatch`, GitHub-Environment `production`, `cancel-in-progress: false`.
- Beide: `webfactory/ssh-agent` + `ssh-keyscan`, dann rsync. Im neuen Muster vor dem rsync einen Build-Step einfügen (`node scripts/build.mjs`) und `site/` deployen.
- Repo-Secrets: `SSH_PRIVATE_KEY` (eigener, **passphrasenloser** Deploy-Key nur für CI), `DEPLOY_HOST`, `DEPLOY_USER`, `STAGING_PATH`, `LIVE_PATH`.
- Live-Release erzeugen: `gh release create vYYYY.MM.DD --target main --title "..." --notes "..."` oder Workflow manuell starten.

### Variante B: ohne GitHub

Nur das manuelle Skript, Vorlage `deploy/scripts/push-site.sh` aus indie-landing:

- Flags: `--staging`, `--production`, `--dry-run` (Default in indie-landing: beide; im neuen Projekt besser Default = staging, live nur explizit).
- Konfiguration über Env-Variablen mit Defaults (`<PROJEKT>_DEPLOY_HOST`, `_USER`, `_KEY`, Pfade).
- **SSH-Preflight übernehmen** (BatchMode-Testverbindung mit klarer Fehlermeldung samt `ssh-add --apple-use-keychain <key>`-Hinweis). Ohne den Preflight scheitert rsync mit kryptischem "Permission denied (publickey)".
- Auch in Variante A dieses Skript als Fallback anlegen.

### Staging vor Suchmaschinen verstecken

Nach jedem Staging-Deploy die `robots.txt` remote überschreiben (Learning aus push-site.sh): Crawler aussperren, nutzergetriggerte KI-Live-Abrufe erlauben:

```
User-agent: Claude-User
User-agent: ChatGPT-User
User-agent: Perplexity-User
User-agent: MistralAI-User
User-agent: meta-externalfetcher
User-agent: Amzn-User
Allow: /

User-agent: *
Disallow: /
```

In der GitHub-Variante als letzten Step im Staging-Workflow, in der manuellen Variante wie in `push-site.sh` per `ssh ... "cat > .../robots.txt" <<'EOF'`.

---

## 8. Serverseite (Caddy)

Auf dem vorhandenen IONOS-Server (und als Muster für neue Server):

- Caddy terminiert TLS und setzt Security-Header zentral über Snippets (`import security_headers`, `import tls_security_headers`). Header-Set: HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`, `Cross-Origin-*-Policy`.
- Pro Projekt ein eigenes Vhost-Snippet unter `conf.d/` (Vorlage: `deploy/caddy/conf.d/indiebox.caddy`): Live- und Staging-Block, `root`, `encode zstd gzip`, `file_server`, `handle_errors` mit eigener `404.html`.
- **WICHTIG (bestehende Regel):** Der Server hostet mehrere Projekte. Caddyfile und `docker-compose.yml` nur **additiv** bearbeiten, fremde Vhosts/Mounts/Services niemals anfassen ohne Absprache.
- Neuer Vhost = neues Snippet + Verzeichnisse anlegen (`/srv/<projekt>/site`, `/srv/staging.<projekt>/site`, Owner = Deploy-User) + DNS-A-Record + Caddy reload.
- CSP-Learning: Embeds brauchen explizite CSP-Anpassung (Beispiel: YouTube erforderte `frame-src`). CSP-Änderungen gehören in das zentrale Snippet bzw. den Vhost, nicht in HTML-Meta-Tags.

---

## 9. Gelernte Regeln und Fallstricke (das eigentliche Gold)

1. **Kanon in Dateien, nicht im Chat.** Entscheidungen zu Konzept, Stil, Architektur sofort in `CLAUDE.md` / `STYLE_GUIDE.md` / Konzeptdokument schreiben. Chat-Kontext geht verloren, Dateien nicht.
2. **`rsync --delete --delete-excluded` ist scharf.** Alles, was nicht explizit excludiert ist, wird auf dem Server GELÖSCHT, wenn es lokal fehlt. Deshalb: nur `site/` deployen (kleine Exclude-Liste) und vor dem ersten echten Lauf immer `--dry-run`.
3. **Zwei SSH-Keys, zwei Zwecke.** Lokaler Deploy-Key mit Passphrase (via `ssh-add --apple-use-keychain` in den Agent laden), CI-Key passphrasenlos und nur in GitHub-Secrets. Public Keys in `deploy@host:~/.ssh/authorized_keys`.
4. **Staging = Push, Live = Release.** Diese Trennung hat sich bewährt; niemals einen Automatismus bauen, der bei normalem Push Live deployt.
5. **Markdown/YAML nie mitdeployen.** `*.md`, `*.yml`, Dotfiles, `deploy/`, `scripts/` gehören nicht auf den Server. Im neuen Muster automatisch gelöst, weil nur `site/` synchronisiert wird.
6. **DE ist Quelle, EN wird generiert.** Falls zweisprachig: Übersetzungen als JSON pro Seite (`i18n/<seite>.lang.en.json`) + Generator-Skript (Vorlage: `scripts/generate-lang.js`). Nie EN von Hand pflegen. Im Markdown-Muster alternativ: `content/en/` als parallele Quelle, aber eine Richtung als Quelle der Wahrheit festlegen.
7. **Style Guide als Datei** (`STYLE_GUIDE.md` + CSS-Tokens in einer zentralen CSS-Datei). Jede Design-Frage wird gegen diese Datei entschieden, nicht gegen Erinnerung.
8. **Texte kritikfest schreiben:** pro Sektion fragen "wo würde ein kritischer Leser nachhaken?" und dort eine optionale Detail-Ebene anbieten (FAQ, Accordion, Infobox). Hauptfläche knapp halten.
9. **404 sauber behandeln** (eigene `404.html`, in Caddy via `handle_errors` verdrahtet, bei Zweisprachigkeit pro Sprache).
10. **SEO und AEO von Anfang an generieren, nicht nachrüsten:** Head-Block, `sitemap.xml`, `robots.txt`, `llms.txt` und Schema.org-Markup kommen aus dem Build (Details: Abschnitt 5; Learning: fehlendes `price`-Feld im Product-Schema fiel erst spät auf).
11. **Echte Bilder statt CGI-Platzhalter** wirken auf Landingpages messbar besser (Hero-Learning).
12. **Falls Backend/Datenbank:** vor jedem Stack-Deploy automatisches Backup, Deploy bricht ab, wenn das Backup scheitert (Muster: `push-stack.sh`). Secrets nur in Env-Dateien auf dem Server, nie im Repo.

---

## 10. Bootstrap-Checkliste für die neue Session

1. Init-Interview führen (Abschnitt 1), Antworten in `CLAUDE.md` + Konzeptdokument schreiben.
2. Projektordner + Git-Repo anlegen (`git init`, auch ohne GitHub). Bei GitHub-Variante: `gh repo create`.
3. Ordnerstruktur aus Abschnitt 2 anlegen, `.gitignore` (`site/` NICHT ignorieren, wenn CI ohne Build deployen soll; sonst `site/` ignorieren und im CI bauen, empfohlen).
4. Rohmaterial nach `intake/` übernehmen und zu `content/*.md` + `assets/` aufbereiten (Abschnitt 3). Offene Fragen an den Auftraggeber sammeln.
5. `local-preview.mjs` aus indie-landing kopieren und anpassen; dient in der Design-Phase schon als Mock-Viewer.
6. Design-Phase durchlaufen (Abschnitt 4): Mocks mit echten Inhalten, Feedback-Schleife, Ergebnis in `STYLE_GUIDE.md` + Token-CSS einfrieren.
7. `templates/` + `scripts/build.mjs` aus dem Gewinner-Mock ableiten, bis `node scripts/build.mjs` alle Seiten erzeugt und die Vorschau auf `site/` läuft. Inklusive SEO/AEO-Schicht: Head-Block, `sitemap.xml`, `robots.txt`, `llms.txt`, Schema-Markup (Abschnitt 5, Rich-Results-Test).
8. Deploy vorbereiten: Server-Verzeichnisse + Caddy-Snippet (additiv!) + DNS. Erst Staging verdrahten und mit `--dry-run` testen.
9. Variante A: Workflows kopieren/anpassen, Secrets setzen, Push → Staging prüfen. Variante B: `push-site.sh` anpassen, Preflight testen.
10. Staging-`robots.txt`-Override einbauen und verifizieren (`curl https://staging.<domain>/robots.txt`).
11. Vor Live-Gang: Einwilligungen für Personenfotos bestätigt? (Abschnitt 3)
12. Erst wenn Staging rund läuft und Punkt 11 geklärt ist: Live-Pfad verdrahten (Release bzw. `--production`).

---

## 11. Referenzdateien in indie-landing

| Zweck | Datei |
|---|---|
| Architektur- und Deploy-Doku (Muster für README) | `README.md` |
| Staging-Workflow | `.github/workflows/deploy-staging.yml` |
| Live-Workflow (Release-getriggert) | `.github/workflows/deploy-live.yml` |
| Manuelles rsync-Deploy inkl. SSH-Preflight + robots-Override | `deploy/scripts/push-site.sh` |
| Lokaler Preview-Server (dependency-frei, optionaler API-Proxy) | `deploy/scripts/local-preview.mjs` |
| Caddy-Vhost-Muster (Live + Staging + 404 + Admin-Gate) | `deploy/caddy/conf.d/indiebox.caddy` |
| Backend-Stack-Deploy mit Backup-Gate (nur bei Backend) | `deploy/scripts/push-stack.sh` |
| DE→EN-Generator | `scripts/generate-lang.js` + `i18n/` |
| robots.txt-Muster (Suche erlaubt, Trainings-Crawler gesperrt, private Pfade) | `robots.txt` |
| llms.txt-Muster (AEO-Selbstbeschreibung) | `llms.txt` |
| SEO-Head-Block-Muster (canonical, hreflang, OG, Twitter, JSON-LD) | `index.html` Zeilen 10-33 |
| Agent-Arbeitsregeln (Muster) | `AGENTS.md` |
