# indie.solutions site builder

Builds the new indie.solutions pages in English (`en/`) and German (`de/`).
The `scripts/` folder is not deployed.

## Rebuild everything

From the repo root:

    bash scripts/site-builder/rebuild.sh

Then check the result in the local preview (`node deploy/scripts/local-preview.mjs`, port 3000) and commit the changed files in `en/`, `de/` and `neu/`.

## Where the content lives

- `build.py`: page frame (header, footer, SEO tags), homepage, Engineering page, webinars, and the list of pages.
- `neu/bbx/acc-sections.html` (outside this folder): most of the Engineering page sections, edited directly.
- `pages/*.py`: generators for Devices and Software (`stackx.py`), About, Lightforce, the forms and the legal pages.
- `de/`: the German version. `de_build.py` turns each English page into its German twin. German text lives in `de/tr/`: `b*.py` maps English strings by number (see `todo.json`), `x*.py` maps English text directly.

## Changing English text

Edit the source, run `rebuild.sh`, and add the German version of any new or changed sentence to a file in `de/tr/` (for example a new `x_*.py`). Sentences without a German entry stay English on the German pages.
