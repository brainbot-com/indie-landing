#!/usr/bin/env bash
# Rebuilds the new indie.solutions pages (English and German). Run from the repo root:
#   bash scripts/site-builder/rebuild.sh
set -euo pipefail
B="$(cd "$(dirname "$0")" && pwd)"
P="$B/pages"
cd "$B/../.."

# 1. Page sections that are generated from Python (written to neu/pages/).
python3 "$P/stackx.py"       "$P" neu/pages/devices-and-software.html
python3 "$P/about.py"        "$P" neu/pages/about.html
python3 "$P/lightforce.py"   "$P" neu/pages/lightforce.html
python3 "$P/trial.py"        "$P" neu/pages/request-a-trial.html
python3 "$P/buy.py"          "$P" neu/pages/buy.html
python3 "$P/quote.py"        "$P" neu/pages/request-a-quote.html
python3 "$P/talk.py"         "$P" neu/pages/talk-to-us.html
python3 "$P/industry_req.py" "$P" neu/pages/request-your-industry.html
python3 "$P/notify.py"       "$P" neu/pages/get-notified.html

# 2. Legal pages, from the indie.box originals (English in en/, German at the root).
python3 "$P/legal.py" "$P" en/impressum.html neu/pages/legal-imprint.html "Imprint" ""
python3 "$P/legal.py" "$P" en/datenschutz.html neu/pages/legal-privacy.html "Privacy policy" "This policy is from the old indie.box site. It needs to cover the new trial and contact forms (data sent by email and to a GitHub ticket), the embedded YouTube videos and any analytics. Have it reviewed before launch."
python3 "$P/legal.py" "$P" en/terms.html neu/pages/legal-terms.html "Terms" "These terms are from the old indie.box online shop (orders placed on the website, consumer prices). The new site sells packages on request, so the terms need to be reviewed before launch. Also check the email addresses: these terms use info@brainbot.com in four places and contact@brainbot.com in two, while the rest of the site uses contact@brainbot.com."
python3 "$P/legal.py" "$P" impressum.html neu/pages/legal-imprint-de.html "Impressum" ""
python3 "$P/legal.py" "$P" datenschutz.html neu/pages/legal-privacy-de.html "Datenschutzerklärung" "Diese Datenschutzerklärung stammt von der alten indie.box-Seite. Sie muss die neuen Test- und Kontaktformulare (Daten gehen per E-Mail und als GitHub-Ticket ein), die eingebetteten YouTube-Videos und die Analyse abdecken. Vor dem Start prüfen lassen."
python3 "$P/legal.py" "$P" terms.html neu/pages/legal-terms-de.html "AGB" "Diese AGB stammen aus dem alten indie.box Onlineshop (Bestellung über die Website, Verbraucherpreise). Die neue Seite verkauft Pakete auf Anfrage, deshalb müssen die AGB vor dem Start geprüft werden. Bitte auch die E-Mail-Adressen prüfen: info@brainbot.com und contact@brainbot.com werden gemischt verwendet."

# 3. All English pages, then the German pages built from them.
python3 "$B/build.py"
