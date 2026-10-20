"""Switch the Engineering page between the two package sections.

  python3 scripts/site-builder/pricing_option.py A   # fixed packages (Essential, Plus, Performance, Enterprise)
  python3 scripts/site-builder/pricing_option.py B   # starter bundle you configure
  python3 scripts/site-builder/pricing_option.py C   # one starter bundle plus a short list of extras

Each option lives in neu/bbx/options/. Run rebuild.sh afterwards.
"""
import os, sys
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
opt = (sys.argv[1:] or ['?'])[0].upper()
if opt not in ('A', 'B', 'C'): sys.exit(__doc__)
p = os.path.join(R, 'neu/bbx/acc-sections.html'); s = open(p, encoding='utf-8').read()
i = s.index('id="pricing"'); st = s.rfind('<section', 0, i); en = s.index('</section>', i) + 10
new = open(os.path.join(R, f'neu/bbx/options/pricing-option-{opt.lower()}.html'), encoding='utf-8').read()
open(p, 'w', encoding='utf-8').write(s[:st] + new + s[en:])
print('Package section is now option', opt)
