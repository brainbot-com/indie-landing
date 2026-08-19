"""Hero-Buehne fuer indie.solutions zusammensetzen.

Leere Buehne (mit Higgsfield erzeugt) + die vier Geraete als Freisteller der
Referenzfotos. Die Geraete werden NUR skaliert, platziert und global in der
Belichtung angepasst — keine generative Veraenderung, damit die Charakteristik
der Hardware erhalten bleibt.

Skalierung ueber die scheinbare Standflaechenbreite (W*cos(yaw)+D*sin(yaw)),
weil die am wenigsten von der unterschiedlichen Kamerahoehe der Fotos abhaengt.

Aufruf aus assets/indie-solutions/references/:
    python3 ../../../scripts/hero-compose.py
Ergebnis: composite.jpg. Danach die drei Auslieferungsgroessen und den
4:3-Ausschnitt fuer das gestapelte Layout erzeugen (siehe KONZEPT, Abschnitt Hero).
Die im Skript ausgegebenen Prozentwerte gehoeren als --x/--w/--t in den Hero.
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

STAGE = "stage_higgsfield.jpg"
PLATE_W, PLATE_H = 4779, 2688          # 16:9 Ausschnitt der Buehne
CROP_X = 0                             # dunkle linke Zone (Typografie) behalten
BASE_Y = int(PLATE_H * 0.760)          # gemeinsame Standlinie
BAND = (0.320, 0.970)                  # Geraeteband in Bildbreite
S = 1.25                               # Szenen-Maßstab (scheinbare px pro mm)
RACK_SQUASH = 0.62                     # rein geometrisch: Aufsicht der Rack-Referenz flacher stellen
GAIN = {"box": 0.90, "booster": 0.94, "rack": 0.76, "workstation": 0.95}

# name, datei, scheinbare Standflaechenbreite in mm, px/mm im Freisteller
DEV = [
    ("box",         "cutouts/indie-box_cut.png",         304, 1192/304),
    ("booster",     "cutouts/indie-booster_cut.png",     402, 1241/402),
    ("rack",        "cutouts/indie-rack_cut.png",        907, 2179/907),
    ("workstation", "cutouts/indie-workstation_cut.png", 602,  809/602),
]

stage = Image.open(STAGE).convert("RGB").crop((CROP_X, 0, CROP_X + PLATE_W, PLATE_H))
plate = stage.copy()

# 1) Skalieren
items = []
for name, f, mm, pxmm in DEV:
    im = Image.open(f).convert("RGBA")
    k = S / pxmm
    h = im.height * k * (RACK_SQUASH if name == "rack" else 1.0)
    im = im.resize((max(1, round(im.width * k)), max(1, round(h))), Image.LANCZOS)
    # Belichtung an die Buehne anpassen (globaler Gain, keine lokale Retusche)
    d = np.asarray(im).astype(np.float32)
    d[:, :, :3] *= GAIN[name]
    im = Image.fromarray(np.clip(d, 0, 255).astype(np.uint8), "RGBA")
    items.append([name, im])

# 2) Horizontal verteilen: gleiche Luecken innerhalb des Bands
x0, x1 = int(PLATE_W * BAND[0]), int(PLATE_W * BAND[1])
total = sum(i[1].width for i in items)
gap = (x1 - x0 - total) / (len(items) - 1)
print(f"Band {x0}-{x1} ({x1-x0}px), Geraete {total}px, Luecke {gap:.0f}px")

x = x0
placed = []
for name, im in items:
    placed.append((name, im, int(x), BASE_Y - im.height))
    x += im.width + gap

# 3) Bodenspiegelung (gestaucht, ausgeblendet) + Kontaktschatten, dann Geraet
shadow = Image.new("L", (PLATE_W, PLATE_H), 0)
sd = ImageDraw.Draw(shadow)
for name, im, px, py in placed:
    w, h = im.size
    # Kontaktschatten als flache Ellipse auf der Standlinie
    sw, sh = int(w * 1.12), max(6, int(w * 0.16))
    sd.ellipse([px - (sw - w) // 2, BASE_Y - sh // 2, px - (sw - w) // 2 + sw, BASE_Y + sh // 2], fill=190)
shadow = shadow.filter(ImageFilter.GaussianBlur(radius=PLATE_W // 190))
a = np.asarray(plate).astype(np.float32)
a *= (1.0 - 0.72 * (np.asarray(shadow).astype(np.float32) / 255.0))[..., None]
plate = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGB")

for name, im, px, py in placed:
    w, h = im.size
    refl = im.transpose(Image.FLIP_TOP_BOTTOM).resize((w, max(1, int(h * 0.55))), Image.LANCZOS)
    ra = np.asarray(refl).astype(np.float32)
    grad = np.linspace(0.30, 0.0, refl.height)[:, None]        # oben (=Kontakt) staerker
    ra[:, :, 3] *= grad
    refl = Image.fromarray(np.clip(ra, 0, 255).astype(np.uint8), "RGBA").filter(ImageFilter.GaussianBlur(2.2))
    plate.paste(refl, (px, BASE_Y), refl)

for name, im, px, py in placed:
    plate.paste(im, (px, py), im)
    print(f"{name:12} x {px/PLATE_W*100:5.1f}%-{(px+im.width)/PLATE_W*100:5.1f}%  Mitte {(px+im.width/2)/PLATE_W*100:5.1f}%  H {im.height/PLATE_H*100:4.1f}%  oben {py/PLATE_H*100:4.1f}%")

plate.save("composite.jpg", quality=92)
plate.resize((1600, round(1600 * PLATE_H / PLATE_W)), Image.LANCZOS).save("view_composite.jpg", quality=90)
print("Standlinie", BASE_Y / PLATE_H * 100, "%   Platte", plate.size)
