# Konzept: Neuaufbau als indie.solutions

Arbeitsdokument für den Umbau von indiebox.ai zu indie.solutions (Neuaufbau seit 2026-08-17, siehe `AGENTS.md`). Dieses Dokument konsolidiert den gesetzten Kanon und markiert offene Entscheidungen. Regel aus dem Playbook: Design- und Konzeptfragen werden gegen Dateien entschieden, nicht gegen Chat-Erinnerung.

Status-Legende: **GESETZT** = bestätigter Kanon, gilt. **OFFEN** = braucht eine Entscheidung von Heiko, bevor darauf aufgebaut wird.

---

## 1. Ausgangslage

- **GESETZT:** `main` ist der Neuaufbau als indie.solutions. Jeder Push deployt nach https://staging.indie.solutions. Die alte indiebox.ai-Seite lebt auf Branch `indiebox-live` (Tag v2026.08.17). Kein Release von `main`, solange der Umbau läuft.
- **GESETZT:** Marken-Schriftzug im Hero ist bereits auf `indie.solutions` umgestellt (Kleinschreibung, Punkt als `brand-dot`-Akzent: `indie.solutions`).
- **GESETZT:** Hero-Assets für indie.solutions liegen unter `assets/indie-solutions/` (siehe Abschnitt 3).
- Der Rest der Seite (Copy, Struktur, Bilder, `llms.txt`, Meta-Tags) spricht noch von Indie.box und muss im Umbau nachgezogen werden.

## 2. Design-System (visueller Kanon)

- **GESETZT:** `STYLE_GUIDE.md` + Tokens in `style.css` bleiben die Single Source of Truth und tragen den Neuaufbau weiter. Kern:
  - Stil-Intention: premium, ruhig, technisch. Dunkle metallische Hero-Hintergründe, helle ruhige Content-Sektionen.
  - Prism/Orange ausschließlich als Signatur-Akzent für Schlüsselwörter, nie für UI-Chrome oder Buttons.
  - Typografie-Tokens (`--t-display-1` bis `--t-ui`) statt Ad-hoc-Größen; nur die freigegebenen Gradients und Hintergründe (`--gradient-prism`, `--gradient-hero-dark/-light`, `--bg-dark`, `--bg-dark-metal`, `--bg-light`, `--bg-neutral`).
  - Komponenten-Kanon: Buttons (base + pill + size + treatment), Glow-Frame, CTA-Overlay, Animations-Systeme (Scroll-Reveal, Parallax, Hero-Sequenz, Combi-Pill, Nav-Reveal).
  - Keine neuen Akzentfarben oder Gradient-Varianten ohne Update von `STYLE_GUIDE.md`.
- **OFFEN:** Ob indie.solutions als Dachmarke eigene visuelle Erweiterungen braucht (z. B. Farbcodierung oder Badge-System pro Produkt), oder ob alle Produkte im identischen Look laufen. Default bis zur Entscheidung: identischer Look, keine neuen Farben.

## 3. Produktfamilie und Assets

Die angelieferten Hero-Assets (`assets/indie-solutions/`) definieren eine Vier-Produkt-Familie:

| Referenz-Asset | Arbeitsname |
|---|---|
| `products/indie-box_reference.png` | Indie.Box |
| `products/indie-booster_reference.jpeg` | Indie.Booster (Razer-Enclosure-Referenz) |
| `products/indie-rack_asus-reference.png` | Indie.Rack (4U-Rack, ASUS-Referenz) |
| `products/indie-workstation_reference.png` | Indie.Workstation (Fractal-Referenz) |

Dazu drei Hintergründe: `background-01_dark-concrete`, `background-02_light-industrial`, `background-03_dark-cinematic` (passen zum Dunkel/Hell-Rhythmus des Style Guides).

- **GESETZT (aus Asset-QA):** Die Referenzbilder enthalten teils erkennbare Fremd-Hardware/Logos (ASUS, Razer, Fractal). Für die finale Produktion echte bzw. lizenzrechtlich saubere Produktfotografie verwenden. Learning aus dem Playbook: echte Bilder statt CGI-Platzhalter.
- **OFFEN:** Finale Produktnamen und Schreibweise (Indie.Box-Muster mit Punkt vs. neue Konvention), Positionierung und Preis je Produkt, Reihenfolge/Hierarchie auf der Startseite (ein Hero-Produkt plus Familie, oder gleichberechtigtes Lineup).
- **OFFEN:** Zielgruppenschnitt je Produkt (z. B. Booster = Einstieg/Erweiterung, Rack = Server-Raum/MSP, Workstation = Einzelarbeitsplatz). Nicht erfinden, mit Heiko festlegen.

## 4. Sprache und Tonalität

### Workflow (GESETZT, aus `TRANSLATION.md` + `AGENTS.md`)

- Deutsch ist die Quelle der Wahrheit (`index.html` u. a.), Englisch wird generiert (`i18n/<seite>.lang.en.json` + `scripts/generate-lang.js` → `en/`). Englisch nie von Hand pflegen.
- Für jede neue oder geänderte HTML-Seite die passende englische Seite mitgenerieren.
- Übersetzungs-Keys stabil und semantisch (`hero.title.line1`), Englisch knapp halten (max. ~10-15 % länger als Deutsch).
- Admin-/Backend-Seiten sind ausschließlich Englisch, keine deutschen Versionen.

### Tonalität (GESETZT, aus `AGENTS.md`)

- Positiv, selbstbewusst, klar in der Positionierung. Kurze, konkrete Sätze statt vager Claims (Muster aus dem Bestand: "Deine Daten. Deine KI. Keine Cloud.").
- Kritikfest schreiben: pro Sektion fragen, wo ein kritischer Leser nachhakt, und dort eine optionale Detail-Ebene anbieten (FAQ, Accordion, Infobox, "Mehr erfahren"). Hauptfläche knapp halten.
- Konsistenz über alle Seiten: Specs, Preise, Datenschutz-Aussagen und Overlays dürfen sich nicht widersprechen. `llms.txt`, Schema.org-Markup und Copy müssen dieselben Fakten nennen.

### Anrede (OFFEN, Inkonsistenz im Bestand)

Der aktuelle Bestand mischt die Anrede: Meta-Description und einzelne Sektionen siezen ("Ihre Daten"), Hero und Produkt-Copy duzen ("Deine Daten", "dein"). Für indie.solutions eine Anrede festlegen und im gesamten Bestand vereinheitlichen. Empfehlung: Du beibehalten (passt zum selbstbewussten, direkten Ton des Heros), Sie nur, falls die Zielgruppe mit Rack/Workstation stärker Richtung klassischer Unternehmens-IT rückt.

### Schreibweisen (GESETZT, soweit im Bestand erkennbar)

- Marke: `indie.solutions` klein mit Punkt (Hero-Schriftzug). In Fließtext-Anfängen und Titeln bis auf Weiteres ebenso klein halten, nicht "Indie Solutions".
- Produkte bisher im Muster `Indie.box`/`Indie.Box` — finale Konvention siehe Abschnitt 3 (OFFEN), bis dahin bestehende Schreibweise nicht eigenmächtig ändern.

## 5. Seitenarchitektur des Neuaufbaus

- **GESETZT (Bestand, wird weitergeführt):** statische Seite ohne Frameworks, handgepflegtes HTML im Repo-Root, `style.css` + `script.js`, Backend nur für Checkout/Chat. SEO/AEO-Schicht pro Seite: Head-Block (canonical, hreflang, OG/Twitter, JSON-LD), `robots.txt` (Trainings-Crawler gesperrt, Suche und nutzergetriggerte KI-Abrufe erlaubt), `llms.txt`, `sitemap.xml`.
- **OFFEN:** Ob der Neuaufbau bei der bestehenden Struktur bleibt oder auf das Markdown-basierte Muster aus `PLAYBOOK-NEUES-WEBPROJEKT.md` (content/ + templates/ + build.mjs → site/) migriert. Default bis zur Entscheidung: bestehende Struktur beibehalten, Playbook-Muster nur für ein etwaiges frisches Repo.
- **Nachziehen im Umbau (Checkliste):**
  - [ ] Hero: Copy und Bild auf indie.solutions-Lineup umstellen (neue Assets)
  - [ ] Produktsektionen für die Vier-Produkt-Familie (nach Entscheidung Abschnitt 3)
  - [ ] Meta-Tags, `<title>`, OG/Twitter, JSON-LD auf indie.solutions
  - [ ] `llms.txt` neu schreiben (spricht noch komplett von Indie.box/indiebox.ai)
  - [ ] `sitemap.xml`/`robots.txt`-URLs beim Cutover auf indie.solutions
  - [ ] Anrede vereinheitlichen (nach Entscheidung Abschnitt 4)
  - [ ] EN-Seiten regenerieren
  - [ ] Cutover: Live-Vhost indie.solutions, `APP_BASE_URL`, indiebox.ai als Redirect (siehe `AGENTS.md`)

## 6. Offene Entscheidungen (Sammelliste für Heiko)

1. Produktnamen, Schreibweise und Positionierung der Vier-Produkt-Familie (Abschnitt 3)
2. Preise je Produkt (Bestand nennt nur 5.500 € für die Indie.box)
3. Anrede Du vs. Sie (Abschnitt 4, Empfehlung: Du)
4. Startseiten-Dramaturgie: ein Hero-Produkt oder Familien-Lineup
5. Visuelle Differenzierung der Produkte ja/nein (Abschnitt 2)
6. Struktur beibehalten oder Playbook-Markdown-Muster (Abschnitt 5)
7. Finale Produktfotografie (Referenz-Assets zeigen Fremd-Hardware, Abschnitt 3)

Sobald ein Punkt entschieden ist: Status hier auf GESETZT ziehen und ggf. `STYLE_GUIDE.md`/`AGENTS.md` nachführen.
