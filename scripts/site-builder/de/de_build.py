# Builds the German site from the English pages: same layout, German text, German URLs.
import re,json,html,os,sys,glob
SP=os.path.dirname(os.path.abspath(__file__))
SITE='https://indie.solutions/'
URLS={'en/neu/':'de/neu/','en/industries/engineering/':'de/branchen/engineering-und-fertigung/','en/devices-and-software/':'de/geraete-und-software/',
      'en/about/':'de/ueber-uns/','en/customers/lightforce/':'de/kunden/lightforce/','en/webinars/crm/':'de/webinare/crm/',
      'en/webinars/email-management/':'de/webinare/e-mail-management/','en/webinars/':'de/webinare/','en/request-a-trial/':'de/test-anfragen/',
      'en/request-your-industry/':'de/branche-anfragen/','en/get-notified/':'de/benachrichtigung/','en/legal/imprint/':'de/rechtliches/impressum/',
      'en/legal/privacy/':'de/rechtliches/datenschutz/','en/legal/terms/':'de/rechtliches/agb/'}
LEGAL={'en/legal/imprint/':'legal-imprint-de','en/legal/privacy/':'legal-privacy-de','en/legal/terms/':'legal-terms-de'}
# translation map
todo=json.load(open(SP+'/todo.json')); T={}
for f in sorted(glob.glob(SP+'/tr/b*.py')):
    ns={}; exec(open(f).read(),ns); T.update(ns['T'])
M={todo[i]['en']:v for i,v in T.items()}
for f in sorted(glob.glob(SP+'/tr/x*.py')):
    ns={}; exec(open(f).read(),ns)
    for k,v in ns['X'].items(): M[k.replace("'",'&#39;')]=v.replace("'",'&#39;'); M[k]=v
RAW=[('>Updates<br>only</button>','>Nur<br>Updates</button>'),('>Standard<br>support</button>','>Standard-<br>Support</button>'),
     ('>Priority<br>support</button>','>Priority-<br>Support</button>'),('>Premium<br>support</button>','>Premium-<br>Support</button>')]
def num(t):
    s=t.strip()
    m=re.fullmatch(r'€\s?([\d,]+)(\.\d+)?',s)
    if m: return t.replace(s,m.group(1).replace(',','.')+(m.group(2) or '').replace('.',',')+' €')
    if re.fullmatch(r'\d{1,3}(,\d{3})+',s): return t.replace(s,s.replace(',','.'))
    return t
def tr(t):
    k=t.strip()
    if not k: return t
    if k in M: return t.replace(k,M[k],1)
    return num(t)
def remap(u):
    for a in sorted(URLS,key=len,reverse=True):
        if a in u: return u.replace(a,URLS[a])
    return u
TOK=re.compile(r'(<!--[\s\S]*?-->|<[^>]+>)')
ATTR=re.compile(r'\b(alt|aria-label|title|placeholder|data-hw|data-subject|data-yt-title|content|value|data-plans|href|src|data-privacy)="([^"]*)"')
def do_tag(t):
    def rep(m):
        a,v=m.group(1),m.group(2)
        if a=='data-plans':
            pl=json.loads(html.unescape(v))
            for p in pl:
                for key in ('p','per','f'): p[key]=num(M.get(p[key],p[key]))
                p['rows']=[[num(M.get(c,c)) for c in r] for r in p['rows']]
            return f'{a}="{html.escape(json.dumps(pl,ensure_ascii=False),quote=True)}"'
        if a in('href','src','content','data-privacy') :
            if a=='content' and not v.startswith('http'):
                return f'{a}="{M.get(v,v)}"' if v in M else m.group(0)
            if a=='data-privacy': return 'data-privacy="/de/rechtliches/datenschutz/"'
            return f'{a}="{remap(v)}"'
        if a=='value' and 'type="hidden"' not in t: return m.group(0)
        return f'{a}="{M.get(v,v)}"'
    return ATTR.sub(rep,t)
def ld_tr(o):
    if isinstance(o,dict):
        return {k:(ld_tr(v) if k not in('@context','@type','image','startDate','endDate','eventAttendanceMode','eventStatus','availability','priceCurrency','price','uploadDate','duration','telephone','email','postalCode','addressCountry','contentUrl','embedUrl','thumbnailUrl') else (remap(v) if isinstance(v,str) and v.startswith('http') else v)) for k,v in o.items()}
    if isinstance(o,list): return [ld_tr(v) for v in o]
    if isinstance(o,str):
        if o.startswith('http'): return remap(o)
        return html.unescape(M.get(o,M.get(html.escape(o,quote=False).replace("'","&#39;"),o)))
    return o
def build(en_path):
    key=[k for k in URLS if en_path.startswith(k) and en_path==k+'index.html'][0]
    de_rel=URLS[key]; s=open(en_path).read()
    for a,b in RAW: s=s.replace(a,b)
    if key in LEGAL:
        de_sec=open('neu/pages/'+LEGAL[key]+'.html').read()
        s=re.sub(r'<section class="acc-chapter acc-chapter--white" id="legal">[\s\S]*?</section>',lambda m:de_sec,s,count=1)
    out=[]; skip=None
    for t in TOK.split(s):
        if t.startswith('<'):
            mm=re.match(r'<\s*(/?)\s*([a-zA-Z0-9]+)',t)
            if mm:
                tag=mm.group(2).lower()
                if tag in('script','style'): skip=None if mm.group(1) else (tag if 'ld+json' not in t else 'ld')
                if not mm.group(1): t=do_tag(t)
            out.append(t); continue
        if skip=='ld':
            out.append(json.dumps(ld_tr(json.loads(t)),ensure_ascii=False)); continue
        if skip: out.append(t); continue
        out.append(tr(t))
    s=''.join(out)
    s=s.replace('<html lang="en">','<html lang="de">').replace('content="en_US"','content="de_DE"')
    # language switch: DE is current, EN links to the English page
    s=re.sub(r'<a class="nav-lang__item" href="[^"]*" lang="de" hreflang="de">DE</a>\s*<span class="nav-lang__item" aria-current="true" lang="en">EN</span>',
             lambda m:'<span class="nav-lang__item" aria-current="true" lang="de">DE</span>\n                    <a class="nav-lang__item" href="'+('../'*en_path.count('/'))[:-0 or None]+key+'" lang="en" hreflang="en">EN</a>',s)
    alt=f'<link rel="alternate" hreflang="en" href="{SITE}{key}">\n    <link rel="alternate" hreflang="de" href="{SITE}{de_rel}">\n    <link rel="alternate" hreflang="x-default" href="{SITE}{key}">\n    '
    s=s.replace('<link rel="canonical"',alt+'<link rel="canonical"',1)
    dst=de_rel+'index.html'; os.makedirs(os.path.dirname(dst),exist_ok=True); open(dst,'w').write(s)
    # English page: DE switch goes to the German page, plus the same alternates
    e=open(en_path).read()
    e=re.sub(r'<a class="nav-lang__item" href="[^"]*" lang="de" hreflang="de">DE</a>',lambda m:'<a class="nav-lang__item" href="'+('../'*en_path.count('/'))+de_rel+'" lang="de" hreflang="de">DE</a>',e)
    if 'hreflang="x-default"' not in e: e=e.replace('<link rel="canonical"',alt+'<link rel="canonical"',1)
    open(en_path,'w').write(e)
    return dst
built=[build(k+'index.html') for k in URLS if os.path.exists(k+'index.html')]
print('de pages:',len(built))
