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
7. **Design**: gibt es Vorgaben (Farben, Fonts, Logo)? Ergebnis früh in `STYLE_GUIDE.md` festhalten.

---

## 2. Architektur-Blaupause

Kernprinzip aus indie-landing: **statische Seite, keine Frameworks, kein Build-Tooling-Zoo**. Nur Node.js (LTS) für kleine eigene Skripte. Neu gegenüber indie-landing: Texte und Bilder leben als Markdown + Assets-Ordner und sind die Quelle der Wahrheit, HTML wird daraus generiert.

```
<projekt>/
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
- Ablauf: `content/*.md` lesen → Frontmatter parsen → Sektionen splitten → in Templates einsetzen → `site/<slug>.html` schreiben → `assets/` nach `site/assets/` spiegeln → `sitemap.xml` und `robots.txt` generieren.
- `node scripts/build.mjs` baut alles; `node --watch scripts/build.mjs` oder ein simpler fs.watch-Modus für Live-Arbeit.

---

## 3. Lokale Vorschau

Vorlage: `deploy/scripts/local-preview.mjs` aus indie-landing (dependency-freier Node-HTTP-Server, ~120 Zeilen). Anpassungen für das neue Muster:

- `projectRoot` auf `site/` zeigen lassen statt auf den Repo-Root.
- Den `/api/*`-Proxy-Teil nur übernehmen, wenn es ein Backend gibt (Proxy auf `http://127.0.0.1:8080`, steuerbar über `API_ORIGIN`).
- Start: `node deploy/scripts/local-preview.mjs` → `http://127.0.0.1:3000`.

Workflow lokal: `build.mjs` (watch) + `local-preview.mjs` parallel laufen lassen, Browser auf Port 3000.

---

## 4. Deployment

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

## 5. Serverseite (Caddy)

Auf dem vorhandenen IONOS-Server (und als Muster für neue Server):

- Caddy terminiert TLS und setzt Security-Header zentral über Snippets (`import security_headers`, `import tls_security_headers`). Header-Set: HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`, `Cross-Origin-*-Policy`.
- Pro Projekt ein eigenes Vhost-Snippet unter `conf.d/` (Vorlage: `deploy/caddy/conf.d/indiebox.caddy`): Live- und Staging-Block, `root`, `encode zstd gzip`, `file_server`, `handle_errors` mit eigener `404.html`.
- **WICHTIG (bestehende Regel):** Der Server hostet mehrere Projekte. Caddyfile und `docker-compose.yml` nur **additiv** bearbeiten, fremde Vhosts/Mounts/Services niemals anfassen ohne Absprache.
- Neuer Vhost = neues Snippet + Verzeichnisse anlegen (`/srv/<projekt>/site`, `/srv/staging.<projekt>/site`, Owner = Deploy-User) + DNS-A-Record + Caddy reload.
- CSP-Learning: Embeds brauchen explizite CSP-Anpassung (Beispiel: YouTube erforderte `frame-src`). CSP-Änderungen gehören in das zentrale Snippet bzw. den Vhost, nicht in HTML-Meta-Tags.

---

## 6. Gelernte Regeln und Fallstricke (das eigentliche Gold)

1. **Kanon in Dateien, nicht im Chat.** Entscheidungen zu Konzept, Stil, Architektur sofort in `CLAUDE.md` / `STYLE_GUIDE.md` / Konzeptdokument schreiben. Chat-Kontext geht verloren, Dateien nicht.
2. **`rsync --delete --delete-excluded` ist scharf.** Alles, was nicht explizit excludiert ist, wird auf dem Server GELÖSCHT, wenn es lokal fehlt. Deshalb: nur `site/` deployen (kleine Exclude-Liste) und vor dem ersten echten Lauf immer `--dry-run`.
3. **Zwei SSH-Keys, zwei Zwecke.** Lokaler Deploy-Key mit Passphrase (via `ssh-add --apple-use-keychain` in den Agent laden), CI-Key passphrasenlos und nur in GitHub-Secrets. Public Keys in `deploy@host:~/.ssh/authorized_keys`.
4. **Staging = Push, Live = Release.** Diese Trennung hat sich bewährt; niemals einen Automatismus bauen, der bei normalem Push Live deployt.
5. **Markdown/YAML nie mitdeployen.** `*.md`, `*.yml`, Dotfiles, `deploy/`, `scripts/` gehören nicht auf den Server. Im neuen Muster automatisch gelöst, weil nur `site/` synchronisiert wird.
6. **DE ist Quelle, EN wird generiert.** Falls zweisprachig: Übersetzungen als JSON pro Seite (`i18n/<seite>.lang.en.json`) + Generator-Skript (Vorlage: `scripts/generate-lang.js`). Nie EN von Hand pflegen. Im Markdown-Muster alternativ: `content/en/` als parallele Quelle, aber eine Richtung als Quelle der Wahrheit festlegen.
7. **Style Guide als Datei** (`STYLE_GUIDE.md` + CSS-Tokens in einer zentralen CSS-Datei). Jede Design-Frage wird gegen diese Datei entschieden, nicht gegen Erinnerung.
8. **Texte kritikfest schreiben:** pro Sektion fragen "wo würde ein kritischer Leser nachhaken?" und dort eine optionale Detail-Ebene anbieten (FAQ, Accordion, Infobox). Hauptfläche knapp halten.
9. **404 sauber behandeln** (eigene `404.html`, in Caddy via `handle_errors` verdrahtet, bei Zweisprachigkeit pro Sprache).
10. **SEO-Basics von Anfang an generieren:** `sitemap.xml`, `robots.txt`, Meta-Description aus dem Frontmatter, ggf. Schema.org-Markup (Learning: fehlendes `price`-Feld im Product-Schema fiel erst spät auf).
11. **Echte Bilder statt CGI-Platzhalter** wirken auf Landingpages messbar besser (Hero-Learning).
12. **Falls Backend/Datenbank:** vor jedem Stack-Deploy automatisches Backup, Deploy bricht ab, wenn das Backup scheitert (Muster: `push-stack.sh`). Secrets nur in Env-Dateien auf dem Server, nie im Repo.

---

## 7. Bootstrap-Checkliste für die neue Session

1. Init-Interview führen (Abschnitt 1), Antworten in `CLAUDE.md` + Konzeptdokument schreiben.
2. Projektordner + Git-Repo anlegen (`git init`, auch ohne GitHub). Bei GitHub-Variante: `gh repo create`.
3. Ordnerstruktur aus Abschnitt 2 anlegen, `.gitignore` (`site/` NICHT ignorieren, wenn CI ohne Build deployen soll; sonst `site/` ignorieren und im CI bauen, empfohlen).
4. `templates/layout.html` + minimale `content/index.md` + `scripts/build.mjs` schreiben, bis `node scripts/build.mjs` eine Seite erzeugt.
5. `local-preview.mjs` aus indie-landing kopieren und auf `site/` anpassen; lokal anschauen.
6. `STYLE_GUIDE.md` mit den abgestimmten Tokens anlegen, CSS darauf aufbauen.
7. Deploy vorbereiten: Server-Verzeichnisse + Caddy-Snippet (additiv!) + DNS. Erst Staging verdrahten und mit `--dry-run` testen.
8. Variante A: Workflows kopieren/anpassen, Secrets setzen, Push → Staging prüfen. Variante B: `push-site.sh` anpassen, Preflight testen.
9. Staging-`robots.txt`-Override einbauen und verifizieren (`curl https://staging.<domain>/robots.txt`).
10. Erst wenn Staging rund läuft: Live-Pfad verdrahten (Release bzw. `--production`).

---

## 8. Referenzdateien in indie-landing

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
| Agent-Arbeitsregeln (Muster) | `AGENTS.md` |
