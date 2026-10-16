import re
import os as _os
# Homepage address: /en/neu/ in the repo; the staging deploy builds it at /en/ instead.
HOME_EN=_os.environ.get('INDIE_HOME_EN','en/neu/')
v1=open(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)),'nav-source.html'),encoding='utf-8').read()
def cut(s,a,b): i=s.index(a); return s[i:s.index(b,i)+len(b)]
NAV=cut(v1,'<nav class="nav-bar"','</nav>')
# Header for the new pages. Until Software, Devices, Security, Pricing and Webinars have
# their own pages, those links point to the matching sections that already exist.
_i=NAV.index('<div class="nav-links" id="nav-links">'); _j=NAV.index('<div class="nav-actions">')
_chev=re.search(r'<svg[\s\S]*?</svg>',NAV[_i:]).group(0)
TRIAL_MAIL='../../en/request-a-trial/'
ENG='../../en/industries/engineering/'
NAV=NAV[:_i]+f"""<div class="nav-links" id="nav-links">
                <div class="nav-item" data-dropdown>
                    <button class="nav-drop-btn" type="button" aria-expanded="false" aria-haspopup="true">Industries
                        {_chev}
                    </button>
                    <div class="nav-dropdown">
                        <a href="{ENG}">Engineering and Manufacturing</a>
                        <span class="nav-soon" aria-disabled="true">Education <span class="badge-soon">Coming soon</span></span>
                        <span class="nav-soon" aria-disabled="true">Clinic and Elder Care <span class="badge-soon">Coming soon</span></span>
                    </div>
                </div>
                <a href="../../en/devices-and-software/">Devices and Software</a>
                                <a href="../../en/about/">About</a>
            </div>
            """+NAV[_j:]
NAV=re.sub(r'<a href="#contact" class="button button--solid button--pill button--sm nav-buy">Discuss your use case</a>',
           f'<a href="{TRIAL_MAIL}" class="button button--solid button--sm nav-buy nav-buy--square">Request a trial</a>',NAV)
assert 'Request a trial' in NAV
FOOT=cut(v1,'<footer class="footer">','</footer>')
i=v1.index('<div class="acc-frame acc-hero__frame'); d=0
for m in re.finditer(r'<div\b|</div>',v1[i:]):
    d+=1 if m.group(0)=='<div' else -1
    if d==0: FRAME=v1[i:i+m.end()]; break

def depthify(html, R):
    # v1 lives at /en/neu/ (R='../../'); rewrite its relative links for another depth.
    html=html.replace('href="../../','href="@@R@@').replace('src="../../','src="@@R@@')
    html=html.replace('href="../privacy.html"','href="@@R@@en/privacy.html"').replace('href="../terms.html"','href="@@R@@en/terms.html"').replace('href="../impressum.html"','href="@@R@@en/impressum.html"')
    html=html.replace('href="./"','href="@@R@@'+HOME_EN+'"')
    html=html.replace('href="./#','href="@@R@@'+HOME_EN+'#')
    return html.replace('@@R@@',R)

CAM='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>'
VID='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/></svg>'
def ph(tone, brief, kind='Photo', fill=False, ar=None):
    icon = VID if kind=='Video' else CAM
    cls='ph ph--'+tone+(' ph--fill' if fill else '')
    style=f' style="--ar:{ar}"' if ar else ''
    return f'<figure class="{cls}"{style} role="img" aria-label="{kind} placeholder: {brief}"><figcaption class="ph__note" title="{kind} placeholder: {brief}">{icon}</figcaption></figure>'


CAL='https://calendly.com/heiko-franssen-brainbot/analysegesprach'
def FOOTER(R):
    H=R+HOME_EN
    E=R+'en/industries/engineering/'
    cols=[
     ('Industries',[('Engineering and Manufacturing',E),('Education (soon)',H+'#industries'),('Clinic and Elder Care (soon)',H+'#industries')]),
     ('Devices and Software',[('Overview',R+'en/devices-and-software/'),('Packages and pricing',E+'#pricing'),('How your data stays private',E+'#data-protection')]),
     ('Company',[('About',R+'en/about/'),('Customer story: Lightforce',R+'en/customers/lightforce/'),('KI am Werk videos','https://brainbot.com/ki-am-werk/'),('Webinars',R+'en/webinars/'),('Request a trial',R+'en/request-a-trial/'),('Contact',R+'en/about/#contact')]),
    ]
    colh=''.join(f'<nav class="ft__col" aria-label="{t}"><h4>{t}</h4><ul>'+''.join(f'<li><a href="{h}">{l}</a></li>' for l,h in links)+'</ul></nav>' for t,links in cols)
    return f"""<footer class="ft ft--simple">
      <div class="hm-wrap">
        <div class="ft__top">
          <div class="ft__brand">
            <a class="ft__logo" href="{H}">indie<span class="brand-dot">.</span>solutions</a>
            <p class="ft__tag">Your company&#39;s AI Brain. A product by <a href="{R}en/about/">brainbot</a>, Mainz, Germany.</p>
          </div>
          <div class="ft__cols">{colh}</div>
        </div>
        <div class="ft__bottom">
          <span>© 2026 brainbot GmbH</span>
          <span class="ft__legal"><a href="{R}en/legal/imprint/">Imprint</a><a href="{R}en/legal/privacy/">Privacy</a><a href="{R}en/legal/terms/">Terms</a></span>
          <a class="ft__li" href="https://www.linkedin.com/company/brainbot-gmbh" target="_blank" rel="noopener">LinkedIn</a>
        </div>
      </div>
    </footer>"""

PILL='''    <div class="sticky-pill">
        <div class="combi-pill">
            <span class="combi-pill-text">What's slowing your team down?</span>
            <a href="#contact" class="button button--solid button--pill button--sm combi-pill-action">Tell us</a>
        </div>
    </div>'''
import json as _json, html as _html
SITE='https://indie.solutions/'
ORG={"@type":"Organization","@id":SITE+"#brainbot","name":"brainbot GmbH","url":"https://brainbot.com","foundingDate":"2000",
     "address":{"@type":"PostalAddress","streetAddress":"Taunusstraße 61","postalCode":"55120","addressLocality":"Mainz","addressCountry":"DE"},
     "email":"contact@brainbot.com","sameAs":["https://www.linkedin.com/company/brainbot-gmbh"]}
def ld(obj): return '<script type="application/ld+json">'+_json.dumps(obj,ensure_ascii=False)+'</script>'
def faq_ld(body):
    qs=re.findall(r'<summary class="acc-faq__q">\s*<span>([\s\S]*?)</span>[\s\S]*?<div class="acc-faq__a">\s*<p>([\s\S]*?)</p>',body)
    if not qs: return ''
    clean=lambda x:_html.unescape(re.sub(r'<[^>]+>','',x)).strip()
    return ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":clean(q),"acceptedAnswer":{"@type":"Answer","text":clean(a)}} for q,a in qs]})+'\n    '
def seo_head(title, desc, path, image, extra_ld=()):
    url=SITE+path; img=SITE+image
    t=_html.escape(title,quote=True); d=_html.escape(desc,quote=True)
    out=[f'<link rel="canonical" href="{url}">',
         '<meta property="og:type" content="website">','<meta property="og:site_name" content="indie.solutions">','<meta property="og:locale" content="en_US">',
         f'<meta property="og:title" content="{t}">',f'<meta property="og:description" content="{d}">',f'<meta property="og:url" content="{url}">',f'<meta property="og:image" content="{img}">','<meta property="og:image:width" content="1200">','<meta property="og:image:height" content="630">',f'<meta property="og:image:alt" content="{t}">',
         '<meta name="twitter:card" content="summary_large_image">',f'<meta name="twitter:title" content="{t}">',f'<meta name="twitter:description" content="{d}">',f'<meta name="twitter:image" content="{img}">']
    out+=[ld(x) for x in extra_ld]
    return '\n    '.join(out)+'\n    '
# Matomo site for indie.solutions on shutter.matomo.cloud (indiebox.ai uses site 8).
MATOMO_SITE_ID='11'
def page(title, desc, R, body, extra_head='', pill=True, path='', image='neu/img/social-default.jpg', extra_ld=()):
    nav=depthify(NAV,R); foot=FOOTER(R)
    extra_head=seo_head(title,desc,path,image,extra_ld)+faq_ld(body)+extra_head
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <!-- Preview. Photos, videos and proof are placeholders until real material is delivered. -->
    <meta name="robots" content="noindex, nofollow">
    <meta name="description" content="{desc}">
    <link rel="icon" href="{R}assets/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="{R}style.css?v=20260818c">
    <link rel="stylesheet" href="{R}neu/brain-home.css?v=6">
    <link rel="stylesheet" href="{R}neu/human.css?v=308">
    {extra_head}<script src="{R}matomo.js?v=20261015d" data-site-id="{MATOMO_SITE_ID}" data-privacy="/en/legal/privacy/" defer></script>
</head>
<body>
    {nav}
    <main class="hm">
{body}
    </main>
    {foot}
{PILL if pill else ''}
    <script src="{R}script.js?v=20260818"></script>
    <script src="{R}neu/human.js?v=47"></script>
</body>
</html>
'''

def contact(R, subject):
    return f'''      <section class="hm-section hm-section--ink" id="contact">
        <div class="hm-wrap hm-cta">
          <div class="reveal">
            <h2 class="hm-h2">Tell us what's slowing your team down.</h2>
            <p class="hm-lead">We'll explore whether AI could make that work easier. No obligation, and no sales pitch: just a conversation about your team's day.</p>
            <p class="hm-body">Prefer email? Write to <a href="mailto:contact@brainbot.com" class="text-link text-link--on-dark">contact@brainbot.com</a>.</p>
          </div>
          <form class="hm-form reveal" data-mailto-to="contact@brainbot.com" data-mailto-subject="{subject}">
            <label>Name<input type="text" name="name" data-mailto-label="Name" autocomplete="name" required></label>
            <label>Email<input type="email" name="email" data-mailto-label="Email" autocomplete="email" required></label>
            <label>Company<input type="text" name="company" data-mailto-label="Company" autocomplete="organization"></label>
            <label>What's slowing your team down?<textarea name="message" data-mailto-label="What's slowing your team down" required></textarea></label>
            <div><button type="submit" class="hm-btn hm-btn--solid">Start the conversation <span aria-hidden="true">→</span></button></div>
            <p class="hm-form__note">The button opens your email program with your message ready to send. It goes to us and no one else. <a href="{R}en/legal/privacy/">Privacy</a></p>
          </form>
        </div>
      </section>'''

# ================= HOMEPAGE =================
R='../'*HOME_EN.count('/')
doors=[
 ('eng','Engineering and Manufacturing',"Your company's lifetime of knowledge, one question away.",R+'en/industries/engineering/','Two engineers at a workbench, comparing a printed drawing with a prototype part.'),
 ('edu','Education',"Years of school know-how, there for every teacher.",None,'A school administrator between timetables and a stack of forms, a teacher leaning in the doorway with a question.'),
 ('care','Clinic and Elder Care',"What one caregiver knows, the whole team knows.",None,'A caregiver sitting with an elderly resident, sharing a quiet moment over a cup of tea.'),
]
door_html=''
for tone,name,problem,href,brief in doors:
    active=' is-active' if tone=='eng' else ''
    if href:
        go=f'<span class="door__go">See the {name.lower()} story <span aria-hidden="true">→</span></span>'
        a=f'<a class="door{active}" href="{href}" data-problem="{name}: {problem}">'
    else:
        go='<span class="door__go door__go--soon">Story coming soon</span>'
        a=f'<a class="door{active}" href="#" aria-disabled="true" data-problem="{name}: {problem}">'
    door_html+=f'''
            {a}
              {ph(tone, brief, fill=True)}
              <span class="door__shade" aria-hidden="true"></span>
              <span class="door__body">
                <span class="door__name">{name}</span>
                <span class="door__problem">{problem}</span>
                {go}
              </span>
            </a>'''

BENEFIT={'Engineering':'Every past project, one question away.',
 'Manufacturing':'Every fix, ready for the next shift.',
 'Education':'Answers staff can find themselves.',
 'Clinic and Elder Care':'What the team knows, for every shift.',
 'Professional Services':'Past work, ready to reuse.',
 'Public Sector':'The right answer, in one place.'}
IN={'Engineering':'engineering','Manufacturing':'manufacturing','Education':'education','Clinic and Elder Care':'elder care','Professional Services':'professional services','Public Sector':'the public sector'}
PHOTO={
 'eng': f'<img class="pcard__img" src="{R}neu/img/industry-engineering.jpg" alt="An engineer with a tablet on a factory floor" style="object-position:38% 30%" loading="lazy">',
 'edu': f'<img class="pcard__img" src="{R}neu/img/industry-education.jpg" alt="A teacher helping a student at a laptop in class" style="object-position:58% 30%" loading="lazy">',
 'care': f'<img class="pcard__img" src="{R}neu/img/industry-care.jpg" alt="A caregiver going through a form with an elderly man" style="object-position:45% 30%" loading="lazy">',
}
cards=''
for tone,name,problem,href,brief in doors:
    go='<span class="pcard__go">See how it works <span aria-hidden="true">→</span></span>' if href else '<span class="pcard__soon">Launching soon. <a href="'+R+'en/get-notified/?industry='+name.replace(' ','%20')+'">Get notified →</a></span>'
    if href: open_t=f'<a class="pcard" href="{href}">'; close_t='</a>'
    else: open_t='<div class="pcard pcard--soon">'; close_t='</div>'
    cards+=f"""
            {open_t}
              {PHOTO[tone] if tone in PHOTO else ph(tone, brief, fill=True)}
              <span class="pcard__shade" aria-hidden="true"></span>{'' if href else '<span class="pcard__badge">Coming soon</span>'}
              <span class="pcard__body">
                <span class="pcard__name">{name}</span>
                <span class="pcard__problem">{problem}</span>
                {go}
              </span>
            {close_t}"""

# Upcoming webinars. Dates and times are placeholders until the webinars are scheduled.
# A webinar without a date yet has empty month and day, and shows a calendar icon instead.
CAL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>'
def wdate(m,d,p): return f'<span class="{p}__mo">{m}</span><span class="{p}__day">{d}</span>' if m else f'<span class="{p}__cal">{CAL}</span>'
WEBINARS={
 'crm':('','','Date coming soon · Online','The AI Brain for your CRM','How sales teams get answers from their CRM, emails and quotes in seconds, with a live demo.','Webinar%3A%20The%20AI%20Brain%20for%20your%20CRM','Webinar image: the host asking the AI Brain about a customer, with the answer drawn from the CRM and emails.'),
 'mail':('','','Date coming soon · Online','Email management with local AI agents','How local AI agents, powered by your AI Brain, sort your inbox and draft replies without your email leaving your office. With a live demo.','Webinar%3A%20Email%20management%20with%20local%20AI%20agents','Webinar image: a local agent sorting an inbox and drafting a reply for approval.'),
}
WSL={'crm':'crm','mail':'email-management'}
WIMG={'crm':('webinar-heiko.jpg?v=3','Heiko Franssen presenting the AI Brain live'),'mail':('webinar-heiko.jpg?v=3','Heiko Franssen presenting the AI Brain live')}
WCARD={'mail':lambda R:f'<img class="wb__shot" src="{R}neu/img/webinar-mail.jpg?v=3" alt="An inbox where the agent has sorted the mail and drafted replies" loading="lazy"><figure class="wb__presenter"><img src="{R}neu/img/heiko-kaw-portrait.jpg?v=1" alt="Heiko Franssen" loading="lazy"><figcaption>Heiko Franssen</figcaption></figure>',
       'crm':lambda R:f'<img class="wb__shot" src="{R}neu/img/webinar-crm.jpg?v=1" alt="The CRM demo: a sales pipeline with an AI copilot beside it" loading="lazy"><figure class="wb__presenter"><img src="{R}neu/img/luis-kaw-portrait.jpg?v=1" alt="Luis Bezzenberger" loading="lazy"><figcaption>Luis Bezzenberger</figcaption></figure>'}
def webinars(R, keys, title='Upcoming webinars.', lead='See the AI Brain live and ask our team your questions.', extra=''):
    cards=''
    for k in keys:
        m,d,meta,t,desc,subj,brief=WEBINARS[k]
        cards+=f'''
            <article class="wb reveal">
              <div class="wb__img">{WCARD[k](R) if k in WCARD else ph('eng', brief)}</div>
              <div class="wb__row">
                <div class="wb__date" aria-hidden="true">{wdate(m,d,"wb")}</div>
                <div class="wb__body">
                  <p class="wb__meta">{meta}</p>
                  <h3 class="wb__t">{t}</h3>
                  <p class="wb__d">{desc}</p>
                  <a class="wb__go" href="{R}en/webinars/{WSL[k]}/">Register <span aria-hidden="true">→</span></a>
                </div>
              </div>
            </article>'''
    one=' wb-grid--one' if len(keys)==1 else ''
    return f'''      <section class="hm-section hm-section--paper wb-sec{extra}" id="webinars">
        <div class="hm-wrap">
          <h2 class="hm-h2 reveal">{title}</h2>
          <p class="hm-lead reveal">{lead}</p>
          <div class="wb-grid{one}">{cards}
          </div>
        </div>
      </section>'''

home_body=f'''
      <!-- Hero: one big photograph of people at work. The words sit on the picture. -->
      <section class="phero" id="top">
        <video class="phero__video" autoplay muted loop playsinline preload="auto" poster="{R}neu/video/hero-poster.jpg?v=9" aria-hidden="true">
          <source src="{R}neu/video/hero-mobile.mp4?v=9" type="video/mp4" media="(max-width: 760px)">
          <source src="{R}neu/video/hero-1920.mp4?v=9" type="video/mp4">
        </video>
        <span class="phero__shade" aria-hidden="true"></span>
        <div class="hm-wrap phero__body">
          <h1 class="hm-h1 phero__title">Every answer your team needs, right when they need it.</h1>
        </div>
      </section>

      <!-- Meet your AI Brain: what it is, in four visual tiles. -->
      <section class="hm-section hm-section--paper" id="ai-brain">
        <div class="hm-wrap">
          <h2 class="hm-h2 reveal">Meet your company's AI Brain.</h2>
          <p class="hm-lead reveal">Years of decisions, drawings and know-how are buried across file servers, inboxes, drives and old projects. The AI Brain digs through all of it and brings back the answer.</p>
          <div class="bento">
            <div class="bento__tile bento__tile--big reveal">
              <div class="bento__media bento__media--shot"><video class="bento__video" autoplay muted loop playsinline preload="metadata" poster="{R}neu/video/ask-anything-poster.jpg?v=2" width="1280" height="800" aria-label="The AI Brain is asked why the tolerances on a pump housing were changed in 2014, searches the file server, email and shared drive, and answers with its sources."><source src="{R}neu/video/ask-anything.mp4?v=2" type="video/mp4"></video></div>
              <h3 class="bento__t">Find any answer in seconds.</h3>
              <p class="bento__d">Ask a question and get the answer from years of company knowledge, with the document it came from.</p>
            </div>
            <div class="bento__tile bento__tile--wide reveal">
              <div class="bento__media bh">{FRAME}</div>
              <h3 class="bento__t">All your knowledge, always at hand.</h3>
              <p class="bento__d">The AI Brain connects to your files, email, drives and code where they already are, so nothing has to be moved. It sorts out old versions and duplicates, and you decide who sees what.</p>
            </div>
            <div class="bento__tile reveal">
              <div class="bento__media bento__media--video"><video class="bento__video" autoplay muted loop playsinline preload="metadata" poster="{R}neu/video/apps-agents-poster.jpg?v=2" width="1280" height="720" aria-label="Lightforce using a custom wind tunnel app, built in the AI Agent Command Center"><source src="{R}neu/video/apps-agents.mp4?v=2" type="video/mp4"></video></div>
              <h3 class="bento__t">Put your knowledge to work.</h3>
              <p class="bento__d">Custom apps and AI agents use your company's knowledge to handle everyday tasks, like project planning, quotes and reports.</p>
            </div>
            <div class="bento__tile reveal">
              <div class="bento__media bento__media--product"><img src="{R}assets/indie-solutions/products/indie-box_web.jpg" alt="The indie.box server" loading="lazy"></div>
              <h3 class="bento__t">Your data never leaves your office.</h3>
              <p class="bento__d">The AI Brain runs on your own local AI server, so you stay in control of your data and nothing is sent to the cloud.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Industries: vertical photo cards, the moment written on each. -->
      <section class="hm-section" id="industries">
        <div class="hm-wrap">
          <h2 class="hm-h2 reveal">The AI Brain expands what your team can achieve.</h2>
          <div class="pgrid pgrid--tall">{cards}
          </div>
          <a class="req-bar reveal" href="{R}en/request-your-industry/">
            <span class="req-bar__text"><strong>Don't see your industry?</strong> Tell us what you need.</span>
            <span class="req-bar__go" aria-hidden="true">→</span>
          </a>
        </div>
      </section>

{webinars(R, ['crm', 'mail'])}
'''
open(HOME_EN+'index.html','w',encoding='utf-8').write(page(
  "Private AI Brain for your company | indie.solutions",
  "A private AI Brain that connects your files, email and drives, answers your team's questions with sources, and runs on your own device in your office.",
  R, home_body, pill=False, path=HOME_EN, image='neu/img/social-default.jpg',
  extra_ld=({"@context":"https://schema.org","@graph":[ORG,{"@type":"WebSite","@id":SITE+"#website","url":SITE,"name":"indie.solutions","publisher":{"@id":SITE+"#brainbot"}}]},)))

# ================= ENGINEERING =================
R='../../../'
scenes=[
 ("The answer exists somewhere. Nobody knows where.",
  "An engineer needs something from a project finished years ago. They spend hours in reports, technical documentation and old emails, even though a colleague solved the same problem back then.",
  "An engineer at two monitors late in the day, a folder of old test reports open beside the keyboard.",
  ("If I had to dig everything up myself, it might take three days to find it again.", "Reinhart Paelinck, co-founder, Lightforce")),
 ("Your team knows what to do. But do they know why?",
  "A technical requirement doesn't seem to make sense. The reason is buried in another project's history, in a department the engineer has never worked with. Understanding it means hours of asking around, or guessing.",
  "An electronics engineer frowning at a requirement on a printed spec sheet, pen in hand.", None),
 ("People come and go. Their knowledge shouldn't.",
  "Years of decisions and lessons learned sit with the people who made them. When they change jobs or retire, the documents stay, but the context behind them gets hard to recover.",
  "An experienced engineer handing over a worn project binder to a younger colleague on their last day.",
  ("People come, people go, and it's always a question of where the knowledge is actually stored.", "Reinhart Paelinck, co-founder, Lightforce")),
 ("The same problem shouldn't need solving twice.",
  "One team works out a fix that another team already found on a previous project. Nobody could see the earlier result, so the work gets done again.",
  "Two small teams in different rooms, sketching near-identical solutions on whiteboards.", None),
 ("Your company has the information. It's just scattered everywhere.",
  "One project lives in GitLab. Another is documented in Google Drive. The decision that matters was made in an email thread. Engineers need the whole picture without having to know where each piece is stored.",
  "A desk with a laptop showing code, a printed drawing and a phone with an email thread open.", None),
]
scene_html=''
for n,(t,txt,brief,quote) in enumerate(scenes,1):
    q=''
    if quote:
        q=f"""
                <blockquote class="pq">
                  <p>"{quote[0]}"</p>
                  <footer>{quote[1]} <span class="pq__flag">Translated from the German interview. To be approved before publishing.</span></footer>
                </blockquote>"""
    scene_html+=f"""
            <article class="ip-scene reveal">
              <div class="ip-scene__media">{ph('eng',brief, ar='4 / 3')}</div>
              <div>
                <h3 class="hm-h2 ip-scene__title">{t}</h3>
                <p class="ip-scene__text">{txt}</p>{q}
              </div>
            </article>"""

costs=[("Hours that should go into engineering.","Searching instead of designing, testing and building."),
       ("Interruptions for the people who know.","The same questions land on the same few colleagues, again and again."),
       ("Work done twice.","Solutions that already exist get rebuilt from scratch."),
       ("Decisions without the full picture.","Requirements get questioned, or followed blindly, because the reasons are out of reach."),
       ("Knowledge that walks out the door.","Every departure takes context the documents alone don't hold.")]
cost_html=''.join(f'<li class="reveal"><strong>{a}</strong><span>{b}</span></li>' for a,b in costs)

stories=[
 ('The answer exists somewhere.',"Days of digging through folders, inboxes and old reports, or a message to whoever might remember.","You ask the way you'd ask a colleague. The answer comes back with the report and the email it came from.","Minutes instead of days, and the source is right there to check."),
 ('Why is this requirement here?',"Hours of asking around, or building on an assumption.","The AI Brain finds where the requirement came from, in the other project's notes and decisions.","You understand the why, not only the what."),
 ('The colleague who knew has left.',"The project stalls, or the team starts again from scratch.","What they wrote down over the years can still be asked.","Their experience keeps helping the team."),
 ('Haven\'t we solved this before?',"Two teams find out at the design review that they worked on the same thing.","Before starting, a team asks, and finds the earlier notes and results.","No more solving the same problem twice."),
]
picks=''; panels=''
for i,(t,before,after,outcome) in enumerate(stories):
    sel='true' if i==0 else 'false'; tab='0' if i==0 else '-1'; hid='' if i==0 else ' hidden'
    picks+=f'\n              <button class="ip-stories__pick" role="tab" type="button" aria-selected="{sel}" tabindex="{tab}" id="story-{i}" aria-controls="story-panel-{i}">{t}</button>'
    panels+=f"""
            <div class="ip-stories__panel" role="tabpanel" id="story-panel-{i}" aria-labelledby="story-{i}"{hid}>
              <div class="ba" data-ba>
                <div class="ba__switch" role="tablist" aria-label="Compare">
                  <button class="ba__tab" role="tab" type="button" data-state="before" aria-selected="true">Today</button>
                  <button class="ba__tab" role="tab" type="button" data-state="after" aria-selected="false" tabindex="-1">A better day</button>
                </div>
                <div class="ba__panel" role="tabpanel" data-state="before"><p class="ba__text">{before}</p></div>
                <div class="ba__panel" role="tabpanel" data-state="after" hidden><p class="ba__text">{after}</p><p class="ba__outcome">{outcome}</p></div>
              </div>
            </div>"""


IMG=R+'neu/img/'
CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
PLAY='<svg viewBox="0 0 68 48" aria-hidden="true"><path class="yt__bg" d="M66.5 7.7a8.5 8.5 0 0 0-6-6C55.2.3 34 .3 34 .3s-21.2 0-26.5 1.4a8.5 8.5 0 0 0-6 6C.1 13 .1 24 .1 24s0 11 1.4 16.3a8.5 8.5 0 0 0 6 6C12.8 47.7 34 47.7 34 47.7s21.2 0 26.5-1.4a8.5 8.5 0 0 0 6-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z"/><path fill="#fff" d="M45 24 27 14v20"/></svg>'
def yt(start, poster, alt):
    return f'<button class="yt" type="button" data-yt="ZuK5Un2pFrE" data-start="{start}" aria-label="Play video: {alt}"><img src="{IMG}{poster}" alt="" width="1600" height="900" loading="lazy">{PLAY}</button>'

apps=[('Design & testing','Design, model and test your products. Ask the agent for a change and see the result.',233,'yt-design-233.jpg','the wind tunnel app for designing and testing aircraft'),
      ('Project roadmap','A project planner with timelines, owners and dependencies, kept up to date by the agent.',373,'yt-roadmap-373.jpg','the roadmap app'),
      ('To-do list','A shared to-do list. Tell the agent what you need and it adds it.',143,'yt-todo-143.jpg','the to-do app')]
tabs_btn=''; tabs_pan=''
for i,(lab,desc,st,poster,alt) in enumerate(apps):
    sel='true' if i==0 else 'false'; ti='0' if i==0 else '-1'; hid='' if i==0 else ' hidden'
    tabs_btn+=f'<button class="tabs__tab" role="tab" type="button" id="app-{i}" aria-controls="app-panel-{i}" aria-selected="{sel}" tabindex="{ti}">{lab}</button>'
    tabs_pan+=f"""
              <div class="tabs__panel" role="tabpanel" id="app-panel-{i}" aria-labelledby="app-{i}"{hid}>
                <p class="tabs__desc">{desc}</p>
                <div class="tabs__media">{yt(st,poster,'Lightforce, '+alt)}</div>
              </div>"""

team=[('Give each agent its own job','Every app can have its own agent, and several can run side by side, each set up for its own kind of work.'),
      ('Watch, review and approve','See each step as the agent works, and review and approve its actions, so a person always stays in the loop.'),
      ('Share everything with your team','Apps, knowledge and agents are shared across the company, so everyone works from the same information.'),
      ('Let agents work in the background','Set up routines, like checking a mailbox every morning, and the agent handles them without being asked.')]
team_html=''.join(f'<div class="tm-item reveal"><h3 class="hm-h3">{t}</h3><p class="hm-body">{d}</p></div>' for t,d in team)

prot=[('Sealed environment','Each agent works in a closed-off space that controls what it can reach, with no internet unless you allow it.'),
      ('Read-only by default','The agent makes changes only through actions you switch on.'),
      ('Access for the right people','Knowledge in the AI Brain can be private or shared with the team, so each person sees only what they should.'),
      ('Locked apps stay locked','You decide for each app whether the agent may change it or only use it.'),
      ('Full audit trail','Every question and action is logged, so you can show an auditor what happened.'),
      ('Never used for training','Your data never trains any AI model.'),
      ('GDPR compliant','Data is processed in Germany, on hardware you control.'),
      ('Data processing agreement included','We sign a data processing agreement before setup.')]
prot_html=''.join(f'<li class="reveal">{CHECK}<span><strong>{t}</strong>{d}</span></li>' for t,d in prot)

where=[('On an indie.box in your office','It runs open AI models locally, so nothing goes to the cloud.',['Unpack it, plug it in and go','Your data never leaves your building','Works without an internet connection'],R+'indie-box/','About the indie.box'),
       ('In your own cloud account','We set it up in the cloud you already use.',['Runs under your keys and your access rules','Fits the IT setup you already have','No hardware to install'],None,None),
       ('In a sealed cloud (TEE)','The AI runs in an encrypted cloud service that we set up and connect for you.',['No hardware to buy or install','Pay only for what you use','Encrypted, so not even we or the cloud provider can see your data'],'https://brainbot.com/en/what-is-a-tee/','What is a TEE?')]
where_html=''
for t,d,bs,href,link in where:
    l=f'<a class="where__link" href="{href}">{link} <span aria-hidden="true">→</span></a>' if href else ''
    where_html+=f'<div class="where__card reveal"><h4>{t}</h4><p>{d}</p><ul>{"".join(f"<li>{CHECK}{b}</li>" for b in bs)}</ul>{l}</div>'

steps=[('Intro call','Tell us what slows your team down in a 30-minute call.'),
       ('Preparation','We set up an indie.box in your office, or prepare a sealed cloud.'),
       ('Setup and training','We set it up with your team, connect your first systems and show everyone how it works.'),
       ('Ongoing support','We keep building new apps as your needs grow.')]
steps_html=''.join(f'<li class="reveal"><span class="st__num">{i}</span><h3 class="hm-h3">{t}</h3><p class="hm-body">{d}</p></li>' for i,(t,d) in enumerate(steps,1))
incl=['<strong>indie.box</strong> with the AI Brain and software preinstalled',
      'The AI Brain connected to your files, email, drives, code and other systems',
      '<strong>Two custom apps</strong>, built in the AI Agent Command Center on your knowledge',
      '<strong>Two days</strong> of installation, customization and team training',
      '<strong>Six months</strong> of Business Support']
incl_html=''.join(f'<li>{CHECK}<span>{t}</span></li>' for t in incl)

faq=[('Where does our data live?','That depends on where it runs. On an indie.box, everything stays in your office. In the sealed cloud (TEE), your data stays encrypted even while it is processed, so not even we or the cloud provider can see it.'),
     ('Is our data used to train AI models?','No. Nothing your team asks or stores is ever used to train AI models.'),
     ('Can the agent change our data?','Only when you allow it. By default the agent can only read. It makes changes only through actions you switch on, you decide for each app whether it may edit it, and every action is logged.'),
     ('Does it work with the systems we already use?','Yes. It runs alongside your existing systems, so nothing has to be replaced. The AI Brain connects to your file servers, shared drives, email and code, including GitLab and GitHub, with read-only access.'),
     ('Can employees only see what they are allowed to?','Yes. Knowledge in the AI Brain can be kept private or shared with a team, so each person sees only what they should.'),
     ('Which AI models does it use?','It runs open AI models, such as Qwen and GPT-OSS. On an indie.box they run locally, so nothing is sent to an outside AI provider, and new models arrive as software updates.'),
     ('Does it work without internet?','On an indie.box, yes. The AI runs locally in your office, with no internet connection needed. The sealed cloud needs an internet connection.'),
     ('Do we need our own IT staff to run it?','No. We install it, connect your first systems during setup, and keep maintaining it afterward.'),
     ('Who builds the apps?','We build the first apps around the way your team works. After that, your team can ask the agent for new ones, and we keep building with you as your needs grow.'),
     ('Can it carry our own branding?','Yes. It shows your company name and logo, like the Lightforce example in the videos above.'),
     ('What happens to our apps if we stop working together?','They stay yours. The apps, their settings and your data belong to you.')]
faq_html=''
for i,(q,a) in enumerate(faq):
    more=' data-faq-more hidden' if i>=5 else ''
    faq_html+=f'<details class="faq__item"{more}><summary>{q}<span aria-hidden="true"></span></summary><p>{a}</p></details>'

NEWSECTIONS=f"""      <!-- 5. Meet the AI Brain -->
      <section class="hm-section hm-section--paper" id="ai-brain">
        <div class="hm-wrap">
          <h2 class="hm-h2 reveal">The AI Brain finds anything your company knows.</h2>
          <p class="hm-lead reveal">Your engineering knowledge is scattered across file servers, drives, mailboxes and code. The AI Brain brings it into one place and answers questions in plain language, even when the engineer who wrote it left years ago.</p>
          <div class="hm-product bh reveal">
            {FRAME}
            <p class="hm-product__caption">The AI Brain can read your sources, but never change them.</p>
          </div>
          <p class="ab-stat reveal">Finding something from twelve years ago by hand can take days. With the AI Brain, it takes seconds.</p>
          <div class="ab-shots">
            <figure class="reveal"><img src="{IMG}brain-ask-mfg.jpg" alt="The AI Brain being asked why the tolerances on the pump housing were changed in 2014" width="1600" height="1000" loading="lazy"><figcaption><strong>Ask a question.</strong> Ask in plain language, like why a part was changed years ago, and the answer comes from everything connected.</figcaption></figure>
            <figure class="reveal"><img src="{IMG}brain-search-mfg.jpg" alt="AI Brain search for the 2014 pump housing tolerance change, with results from a file server, email and a shared drive" width="1600" height="1000" loading="lazy"><figcaption><strong>Search everything.</strong> Or search it all at once. Each result shows which system it lives in.</figcaption></figure>
          </div>
        </div>
      </section>

      <!-- 6. Apps built around engineering work, shown at Lightforce -->
      <section class="hm-section" id="apps">
        <div class="hm-wrap">
          <h2 class="hm-h2 reveal">Not off-the-shelf software. Built around your engineering.</h2>
          <p class="hm-lead reveal">Every workspace is set up for your company, down to your own name and logo. We build the first apps around the way your team works, and when you need another, you ask the agent and it builds it. Every app draws on the AI Brain.</p>
          <p class="apps__real reveal">These are real apps at Lightforce, an engineering company that builds autonomy and control systems for unmanned vehicles.</p>
          <div class="tabs reveal" data-tabs>
            <div class="tabs__list" role="tablist" aria-label="Apps at Lightforce">{tabs_btn}</div>{tabs_pan}
          </div>
          <div class="ip-proof ip-proof--quote reveal">
            <blockquote class="pq pq--big">
              <p>"Had this existed earlier, I'd have done it much sooner."</p>
              <footer>Reinhart Paelinck, co-founder, Lightforce <span class="pq__flag">Translated from the German interview. To be approved before publishing.</span></footer>
            </blockquote>
            <div>
              <p class="ip-proof__text">Lightforce works with years of software, designs, simulations and real-world test data, spread across servers, GitLab, GitHub, Google Drive and email. Today its AI Agent Command Center runs on an indie.box in its own office.</p>
              <a class="hm-btn hm-btn--ghost" href="https://brainbot.com/ki-am-werk/agent-command-center-in-der-praxis/">Watch the full conversation (in German) <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. Working with the agents -->
      <section class="hm-section hm-section--paper" id="agents">
        <div class="hm-wrap">
          <h2 class="hm-h2 reveal">How your team works with the agents.</h2>
          <p class="hm-lead reveal">Work in any app yourself, or ask its agent to do the task for you.</p>
          <div class="tm-grid">{team_html}</div>
        </div>
      </section>

      <!-- 8. Protection, and where it runs -->
      <section class="hm-section hm-section--ink" id="protection">
        <div class="hm-wrap">
          <h2 class="hm-h2 reveal">Your designs stay yours.</h2>
          <p class="hm-lead reveal">Data protection is built in. The system enforces the rules, so the agent can't work around them.</p>
          <ul class="dp-list">{prot_html}</ul>
          <h3 class="hm-h3 where__title reveal">Where it can run</h3>
          <p class="hm-body reveal">Choose the setup that fits your company. The protections above apply to all three.</p>
          <div class="where">{where_html}</div>
        </div>
      </section>

      <!-- 9. Getting started -->
      <section class="hm-section hm-section--paper" id="start">
        <div class="hm-wrap">
          <h2 class="hm-h2 reveal">Up and running alongside what you already use.</h2>
          <p class="hm-lead reveal">Nothing has to be replaced. The AI Brain runs next to your existing systems.</p>
          <div class="start">
            <ol class="st">{steps_html}</ol>
            <div class="incl reveal">
              <h3 class="hm-h3">What's included</h3>
              <ul>{incl_html}</ul>
              <p class="incl__note">We put together a quote for your team.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 10. Questions -->
      <section class="hm-section" id="faq">
        <div class="hm-wrap faq">
          <h2 class="hm-h2 reveal">Questions engineering teams ask.</h2>
          <div class="faq__list">{faq_html}</div>
          <button class="hm-btn hm-btn--ghost faq__more" type="button" data-faq-toggle>Show all questions ({len(faq)})</button>
        </div>
      </section>"""

# Agent Command Center sections, verbatim from brainbot.com (copy and design), scoped in .bbx.
ACC=open('neu/bbx/acc-sections.html',encoding='utf-8').read().replace('@@IMG@@', R+'neu/bbx/img/').replace('@@VID@@', R+'neu/video/').replace('@@ROOT@@', R).replace('@@PH_AGENTS@@', ph('eng', 'An app with its AI agent beside it, doing a task the user asked for, like updating a deal or filling in a report.')).replace('@@PH_CONTROL@@', ph('eng', 'The agent showing each step it is taking, with an approve button before it acts.')).replace('@@PH_TOGETHER@@', ph('eng', 'Colleagues sharing an app and its knowledge: the same plan or document, updated for the whole team.')).replace('@@PH_STUDIO@@', ph('eng', 'Agent Studio showing two team areas side by side, each with its own knowledge sources and rules.')).replace('@@PH_CHAT@@', ph('eng', 'indie.chat answering a question about a contract, with the source passage highlighted next to the answer.')).replace('@@PH_ROUTINES@@', ph('eng', 'An agent running a morning routine: checking a shared mailbox and filing what it found.'))
NEWSECTIONS='      <!-- From here: sections adapted from the brainbot.com Agent Command Center page. -->\n      <div class="bbx"><div class="acc-page">\n'+ACC+'\n      </div></div>'


# Structured product data for the packages on the Engineering page (prices net, plus VAT).
_PK=[('Essential','indie.box','indie-box_cut.webp','For small teams. Comes with the indie.box, a compact AI server for your office.','20900'),
     ('Plus','indie.box + indie.booster','indie-box-booster_cut.webp','For small teams that want faster answers. Comes with the indie.box plus the indie.booster.','26400'),
     ('Performance','indie.workstation','indie-workstation_cut.webp','For teams that use AI all day. Comes with the indie.workstation.','27400'),
     ('Enterprise','indie.rack','indie-rack_cut.webp','For large organizations. Comes with indie.rack servers, sized to the number of people who use them.',None)]
def _pkg(n,dev,img,d,price):
    x={"@type":"Product","name":f"AI Brain package {n}","description":d+" Includes delivery, a two-day setup workshop, two custom apps, 12 months of the AI Brain and 12 months of Priority support.",
       "image":SITE+'assets/indie-solutions/cutouts/'+img,"brand":{"@type":"Brand","name":"indie.solutions"},"isRelatedTo":{"@type":"Product","name":dev}}
    if price: x["offers"]={"@type":"Offer","price":price,"priceCurrency":"EUR","availability":"https://schema.org/InStock","url":SITE+'en/industries/engineering/#pricing',
                           "priceSpecification":{"@type":"UnitPriceSpecification","price":price,"priceCurrency":"EUR","valueAddedTaxIncluded":False},"seller":{"@type":"Organization","name":"brainbot GmbH"}}
    return x
PKG_LD=({"@context":"https://schema.org","@type":"ItemList","name":"AI Brain packages","itemListElement":[{"@type":"ListItem","position":i+1,"item":_pkg(*p)} for i,p in enumerate(_PK)]},)

eng_body=f"""
      <!-- 1. The person's experience -->
      <section class="ip-hero" id="top" data-pill-sentinel>
        <img class="ip-hero__img" src="{R}neu/img/industry-engineering.jpg" alt="An engineer with a tablet on a factory floor" fetchpriority="high">
        <span class="ip-hero__shade" aria-hidden="true"></span>
        <div class="hm-wrap ip-hero__body">
          <h1 class="hm-h1 ip-hero__quote">Your company's lifetime of knowledge, one question away.</h1>
          <p class="hm-lead ip-hero__sub">The private AI Brain for engineering and manufacturing companies.</p>
          <div class="bbx ip-hero__cta"><div class="acc-cta-pair"><a href="{R}en/request-a-trial/" class="btn btn--filled btn--xl btn--hero-cta"> <span class="btn__label">Request a trial <span class="arrow">→</span></span> </a> <a href="{R}en/webinars/" class="btn btn--lg acc-demo-btn">Join a webinar <span class="arrow" aria-hidden="true">→</span></a></div></div>
        </div>
      </section>

      <!-- 2. The problem, in the Agent Command Center style -->
      <div class="bbx"><div class="acc-page">
      <section class="acc-chapter acc-problem" id="problem"><div class="container">
        <div class="acc-chapter__text acc-chapter__text--wide" data-animate="fade-up">
          <h2 class="section-title">Every team knows this problem.</h2>
        </div>
        <div class="pb"><div class="pb__card" data-animate="fade-up" data-stagger="1"><div class="pb__vis" aria-hidden="true"><div class="pq pq--eng"><svg class="pi " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h6l2 2h10v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg><svg class="pi " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h6l2 2h10v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg><svg class="pi " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h6l2 2h10v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg><span class="pq-lens"><svg class="pi pi--o" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg></span></div></div><h3 class="pb__t">Engineering</h3><p class="pb__s">Hours lost searching old projects</p><p class="pb__d">Hours spent digging through drives and old projects for a fix a colleague found years ago.</p></div><div class="pb__card" data-animate="fade-up" data-stagger="2"><div class="pb__vis" aria-hidden="true"><div class="pq pq--sales"><svg class="pi pi--big" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 17h4"/></svg><span class="pq-badge"><svg class="pi pi--o" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg></span></div></div><h3 class="pb__t">Sales</h3><p class="pb__s">Quotes stall while specs are found</p><p class="pb__d">Specs are spread across folders and inboxes, so quotes stall and customers wait days.</p></div><div class="pb__card" data-animate="fade-up" data-stagger="3"><div class="pb__vis" aria-hidden="true"><div class="pq pq--pm"><span class="pq-center"><svg class="pi pi--o pi--big" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.4M12 17h.01"/></svg></span><span class="pq-o pq-o--1"><svg class="pi " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></span><span class="pq-o pq-o--2"><svg class="pi " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg></span><span class="pq-o pq-o--3"><svg class="pi " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h6l2 2h10v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg></span></div></div><h3 class="pb__t">Project management</h3><p class="pb__s">Nobody can say why</p><p class="pb__d">Decisions are scattered across emails, meetings and old projects, so nobody can say why.</p></div><div class="pb__card" data-animate="fade-up" data-stagger="1"><div class="pb__vis" aria-hidden="true"><div class="pq pq--sup"><span class="pq-chat"><svg class="pi pi--big" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg><span class="pq-dots"><i></i><i></i><i></i></span></span></div></div><h3 class="pb__t">Customer support</h3><p class="pb__s">Customers wait for answers</p><p class="pb__d">The answer is in an email thread somewhere, and the customer waits while the team searches.</p></div><div class="pb__card" data-animate="fade-up" data-stagger="2"><div class="pb__vis" aria-hidden="true"><div class="pq pq--nh"><span class="pq-me"><svg class="pi pi--o pi--big" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/></svg></span><span class="pq-them"><svg class="pi " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/></svg><b>?</b></span><span class="pq-them" style="--d:.8s"><svg class="pi " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/></svg><b>?</b></span><span class="pq-them" style="--d:1.6s"><svg class="pi " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/></svg><b>?</b></span></div></div><h3 class="pb__t">New hires</h3><p class="pb__s">Months of asking around</p><p class="pb__d">Months of asking around, because nothing is in one place.</p></div><div class="pb__card" data-animate="fade-up" data-stagger="3"><div class="pb__vis" aria-hidden="true"><div class="pq pq--lv"><svg class="pi pi--big" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6v18h8"/><path d="M14 3l5 2v14l-5 2z"/><circle cx="16.5" cy="12" r=".6"/></svg><span class="pq-doc"><svg class="pi " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 17h4"/></svg></span><span class="pq-doc" style="--d:1s"><svg class="pi " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 17h4"/></svg></span><span class="pq-doc" style="--d:2s"><svg class="pi " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 17h4"/></svg></span></div></div><h3 class="pb__t">When someone leaves</h3><p class="pb__s">Their knowledge leaves too</p><p class="pb__d">Years of decisions and lessons learned walk out the door with them.</p></div></div>
        <figure class="acc-pquote" data-animate="fade-up"><blockquote>“If I had to dig everything up myself, it might take three days to find it again.”</blockquote></figure>
      </div></section>
      </div></div>

{NEWSECTIONS}

{webinars(R, ['crm', 'mail'], extra=' wb-sec--eng')}

{{contact(R, 'What is slowing our engineering team down (indie.solutions)')}}
"""
eng_body=eng_body.replace("{contact(R, 'What is slowing our engineering team down (indie.solutions)')}", '')
open('en/industries/engineering/index.html','w',encoding='utf-8').write(page(
  "AI Brain for engineering and manufacturing | indie.solutions",
  "Your company's lifetime of knowledge, one question away. A private AI Brain with custom apps and AI agents for engineering and manufacturing teams.",
  R, eng_body, extra_head=f'<link rel="stylesheet" href="{R}neu/bbx/bbx.css?v=1">\n    <script src="{R}neu/bbx/bbx.js?v=1" defer></script>\n    ', pill=False, path='en/industries/engineering/', image='neu/img/social-engineering.jpg', extra_ld=PKG_LD))

# ================= PRODUCT PAGES (Devices, Software, Security) =================
# Same frame as the Engineering page: photo hero with two calls to action, then
# sections in the brainbot style. Each page's sections live in neu/pages/<name>.html.
def hero_ctas():
    return ('<div class="bbx ip-hero__cta"><div class="acc-cta-pair">'
      '<a href="'+'@@ROOT@@en/request-a-trial/'+'" class="btn btn--filled btn--xl btn--hero-cta"> <span class="btn__label">Request a trial <span class="arrow">→</span></span> </a> '
      '<a href="@@ROOT@@en/webinars/" class="btn btn--lg acc-demo-btn">Join a webinar <span class="arrow" aria-hidden="true">→</span></a>'
      '</div></div>')
def sub_page(out, name, title, desc, hero_img, hero_pos, h1, sub, buttons=True, webinars_on=True):
    R='../'*out.count('/')
    body=open(f'neu/pages/{name}.html',encoding='utf-8').read()
    body=(body.replace('@@ROOT@@',R).replace('@@IMG@@',R+'neu/bbx/img/').replace('@@VID@@',R+'neu/video/')
              .replace('@@TRIAL@@',R+'en/request-a-trial/')
              .replace('@@WEBINAR@@',R+'en/webinars/'))
    hero=f"""      <section class="ip-hero ip-hero--{name}" id="top">
        <img class="ip-hero__img" src="{R}neu/img/{hero_img}" alt="{h1}" fetchpriority="high" style="object-position:{hero_pos}">
        <span class="ip-hero__shade" aria-hidden="true"></span>
        <div class="hm-wrap ip-hero__body">
          <h1 class="hm-h1 ip-hero__quote">{h1}</h1>
          {f'<p class="hm-lead ip-hero__sub">{sub}</p>' if sub else ''}
          {hero_ctas() if buttons else ''}
        </div>
      </section>

""" if hero_img else ""
    html=f"""
{hero}      <div class="bbx"><div class="acc-page">
{body}
      </div></div>

{webinars(R, ['crm', 'mail']) if webinars_on else ''}
"""
    html=html.replace('@@ROOT@@',R)
    import os; os.makedirs(os.path.dirname(out), exist_ok=True)
    if not hero_img: html=re.sub(r'<h2 class="section-title">([\s\S]*?)</h2>',r'<h1 class="section-title">\1</h1>',html,count=1)
    path=out[:-len('index.html')]
    image='neu/img/social-default.jpg'
    xl=[]
    if name.startswith('device-'):
        k=name[7:]; nm={'box':'indie.box','booster':'indie.booster','workstation':'indie.workstation','rack':'indie.rack'}[k]
        xl.append({"@context":"https://schema.org","@type":"Product","name":nm,"description":desc,"image":SITE+'assets/indie-solutions/cutouts/indie-'+k+'_cut.webp',"brand":{"@type":"Brand","name":"indie.solutions"},"manufacturer":ORG})
    if name.startswith('webinar-'):
        k=name[8:]; m,d,meta,t,wdesc,subj,brief=WEBINARS[k]; day={'crm':'2026-11-05','mail':'2026-11-19'}[k]
        # Event data only once the webinar has a date.
        if m: xl.append({"@context":"https://schema.org","@type":"Event","name":t,"description":wdesc,"startDate":day+"T16:00:00+01:00","endDate":day+"T17:00:00+01:00",
                   "eventAttendanceMode":"https://schema.org/OnlineEventAttendanceMode","eventStatus":"https://schema.org/EventScheduled",
                   "location":{"@type":"VirtualLocation","url":SITE+path},"organizer":ORG,"isAccessibleForFree":True,
                   "offers":{"@type":"Offer","price":"0","priceCurrency":"EUR","url":SITE+path,"availability":"https://schema.org/InStock"}})
    if name=='lightforce':
        xl.append({"@context":"https://schema.org","@type":"Article","headline":"How Lightforce puts its engineering knowledge to work","about":"Private, on-premise AI at an aircraft and drone engineering company","publisher":ORG,
                   "video":{"@type":"VideoObject","name":"Wie sieht ein AI Agent Command Center in der Praxis aus?","description":"KI am Werk, episode 3, with Reinhart Paelinck of Lightforce.","uploadDate":"2026-10-01","duration":"PT11M48S","thumbnailUrl":"https://i.ytimg.com/vi/ZuK5Un2pFrE/hqdefault.jpg","embedUrl":"https://www.youtube-nocookie.com/embed/ZuK5Un2pFrE","inLanguage":"de"}})
    if name=='about': xl.append({"@context":"https://schema.org","@type":"AboutPage","about":ORG})
    open(out,'w',encoding='utf-8').write(page(title, desc, R, html, path=path, image=image, extra_ld=tuple(xl),
      extra_head=f'<link rel="stylesheet" href="{R}neu/bbx/bbx.css?v=1">\n    <script src="{R}neu/bbx/bbx.js?v=1" defer></script>\n    ', pill=False))

import os

def webinar_page():
    CHK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.2 4.2L19 7"/></svg>'
    cards=''.join(f'<a class="wr" href="@@ROOT@@en/webinars/{WINFO[k]["slug"]}/" data-animate="fade-up"><div class="wr__date" aria-hidden="true">{wdate(m,d,"wr")}</div><div><p class="wr__meta">{meta}</p><h3 class="wr__t">{t}</h3><p class="wr__d">{desc}</p><span class="wr__go">Details and registration →</span></div></a>' for k,(m,d,meta,t,desc,subj,brief) in WEBINARS.items())
    opts=''.join(f'<option value="{k}">{v[3]}'+(f' · {v[0]} {v[1]}' if v[0] else '')+'</option>' for k,v in WEBINARS.items())
    form=('<form class="tf" data-trial-form data-subject="Webinar registration" novalidate><div class="tf__grid">'
      f'<label class="tf__field tf__field--full"><span class="tf__label">Webinar</span><select class="tf__input" name="webinar" data-prefill="webinar">{opts}</select></label>'
      '<label class="tf__field"><span class="tf__label">Your name <span class="tf__req" aria-hidden="true">*</span></span><input class="tf__input" type="text" name="name" required autocomplete="name"></label>'
      '<label class="tf__field"><span class="tf__label">Work email <span class="tf__req" aria-hidden="true">*</span></span><input class="tf__input" type="email" name="email" required autocomplete="email"></label>'
      '<label class="tf__field tf__field--full"><span class="tf__label">Company</span><input class="tf__input" type="text" name="company" autocomplete="organization"></label>'
      '<label class="tf__field"><span class="tf__label">Company size</span><select class="tf__input" name="team"><option value="" disabled selected>Choose</option><option>Under 50 employees</option><option>50 to 250</option><option>250 to 1,000</option><option>Over 1,000</option></select></label><label class="tf__field"><span class="tf__label">Your role</span><select class="tf__input" name="role"><option value="" disabled selected>Choose</option><option>Managing director or owner</option><option>IT</option><option>Department lead</option><option>Other</option></select></label><label class="tf__field"><span class="tf__label">Country</span><input class="tf__input" type="text" name="country" autocomplete="country-name"></label><label class="tf__field"><span class="tf__label">How did you hear about this webinar?</span><select class="tf__input" name="source"><option value="" disabled selected>Choose</option><option>Referral</option><option>LinkedIn</option><option>Email</option><option>KI am Werk</option><option>Search</option><option>Other</option></select></label><label class="tf__field tf__field--full"><span class="tf__label">A question for the speaker</span><textarea class="tf__input tf__area" name="question" rows="3" placeholder="Optional"></textarea></label></div><label class="tf__consent"><input type="checkbox" name="consent" required> <span>I agree that brainbot may email me about this webinar. <a href="@@ROOT@@en/legal/privacy/">Privacy policy</a></span></label>'
      '<p class="tf__error" role="alert" hidden>Please fill in the fields marked with an asterisk.</p>'
      '<button class="btn btn--filled btn--xl btn--hero-cta tf__submit" type="submit"><span class="btn__label">Register <span class="arrow">→</span></span></button></form>'
      '<div class="tf__done" hidden><h3 class="tf__done-h">You are registered.</h3><p>We will email you the link to join.</p></div>')
    body=(f'<section class="acc-chapter acc-chapter--white" id="webinars"><div class="container">'
          '<div class="acc-chapter__text acc-chapter__text--wide" data-animate="fade-up"><h2 class="section-title">Upcoming webinars.</h2><p class="acc-sub">See the AI Brain live, online, and ask our team your questions.</p></div>'
          f'<div class="wr-list wr-list--page">{cards}</div></div></section>')
    open('neu/pages/webinars.html','w',encoding='utf-8').write(body)
WINFO={
 'crm':dict(slug='crm', host=('Luis Bezzenberger','luis-bezzenberger.jpg','Project Manager at brainbot',False), flag='No CRM is connected out of the box yet. Salesforce and HubSpot can be connected (Onyx connectors, per Luis). Decide which CRM the demo will use before promoting the webinar.',
   who='For managing directors, sales leads and account managers who spend too long piecing together what is going on with a customer.',
   get=[('See the AI Brain answer customer questions','Ask about a customer in plain language and get the answer from your CRM, emails and past quotes, with the source for every answer.'),
        ('See an agent prepare your follow-ups','How an agent drafts follow-ups and a weekly summary of open quotes, and waits for your approval before anything goes out.'),
        ('Understand how it stays private','How the AI Brain runs on a device in your own office, and how access is set for every team and agent.'),
        ('Get your questions answered','Bring your own questions. There is time for an open Q&amp;A at the end.')],
   agenda=[('10 min','Why customer knowledge gets scattered, and what it costs your sales team'),('20 min','Live demo of the AI Brain with CRM data'),('15 min','An agent that prepares follow-ups and weekly summaries'),('15 min','Your questions')]),
 'mail':dict(slug='email-management',
   who='For managing directors, office managers and anyone whose working day disappears into their inbox. The agents work with your AI Brain, so every reply draws on what your company already knows.',
   get_title='What your agent does for you',
   get=[('Only read what matters','The agent sorts your inbox overnight and, in the morning, shows you only what really needs your decision.'),
        ('Stay on top of long emails','You know right away what the sender wants and by when, even if they wrote three pages.'),
        ('Never forget a thing','The agent keeps track of every open request and every commitment, and reminds you before anyone has to follow up.'),
        ('Replies with the full picture','The agent knows your quotes, prices and agreements and puts the finished reply in your drafts. You review it and click send.')],
   box=('Experience AI that belongs to you, live','No slides. A real inbox, live.',
        [('How it works without the cloud','The AI runs on a device in your office, connected directly to your inbox. We show you what is inside, so you can explain it yourself afterward.'),
         ('Waiting time you never notice','Local AI takes longer than the cloud. That is why the agent works in the background, and when you open your inbox, everything is ready.'),
         ('Why no one else reads along','Your emails never leave the building. No cloud provider and no AI company ever gets to see them.')]),
   agenda=[('10 min','Why email eats up your team&#39;s day'),('15 min','Live demo of the AI Brain: one place for your emails, documents and company knowledge'),('20 min','Live demo of local agents sorting email and drafting replies from the AI Brain'),('15 min','Your questions')]),
}
def webinar_detail(k):
    m,d,meta,t,desc,subj,brief=WEBINARS[k]; w=WINFO[k]
    FLAG=''  # no yellow notes on the webinar pages
    CHK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.2 4.2L19 7"/></svg>'
    BOX=''
    if w.get('box'):
        bt,bs,bl=w['box']
        BOX=('<div class="wd-box"><h3 class="wd-box__h">'+bt+'</h3><p class="wd-box__s">'+bs+'</p><ul class="pg-points">'+''.join(f'<li><span class="pg-points__check" aria-hidden="true">{CHK}</span><div><p class="pg-points__t">{x}</p><p class="pg-points__d">{y}</p></div></li>' for x,y in bl)+'</ul></div>')
    pts='<ul class="pg-points">'+''.join(f'<li><span class="pg-points__check" aria-hidden="true">{CHK}</span><div><p class="pg-points__t">{a}</p><p class="pg-points__d">{b}</p></div></li>' for a,b in w['get'])+'</ul>'
    ag='<ol class="wd-agenda">'+''.join(f'<li><span>{a}</span>{b}</li>' for a,b in w['agenda'])+'</ol>'
    facts=(f'<div class="wd-facts"><div class="wr__date" aria-hidden="true">{wdate(m,d,"wr")}</div>'
           f'<div><p class="wd-facts__l">{meta}</p><p class="wd-facts__s">60 minutes · Google Meet · Free</p></div></div>')
    hn,hi,hr,hflag=w.get('host',('Heiko Franssen','heiko-franssen.jpg','Managing Director of brainbot and host of KI am Werk',False))
    host=(f'<div class="wd-host"><img src="@@ROOT@@neu/img/{hi}" alt="{hn}" loading="lazy">'
          f'<div><p class="wd-host__n">{hn}</p><p class="wd-host__r">{hr}</p>'+('')+'</div></div>')
    form=('<form class="tf" data-trial-form data-type="webinar" data-subject="Webinar registration" novalidate><label class="tf__hp" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>'
      f'<input type="hidden" name="webinar" value="{t}'+(f' ({m} {d})' if m else '')+'">'
      '<div class="tf__grid">'
      '<label class="tf__field"><span class="tf__label">Your name <span class="tf__req" aria-hidden="true">*</span></span><input class="tf__input" type="text" name="name" required autocomplete="name"></label>'
      '<label class="tf__field"><span class="tf__label">Work email <span class="tf__req" aria-hidden="true">*</span></span><input class="tf__input" type="email" name="email" required autocomplete="email"></label>'
      '<label class="tf__field tf__field--full"><span class="tf__label">Company</span><input class="tf__input" type="text" name="company" autocomplete="organization"></label>'
      '<label class="tf__field"><span class="tf__label">Company size</span><select class="tf__input" name="team"><option value="" disabled selected>Choose</option><option>Under 50 employees</option><option>50 to 250</option><option>250 to 1,000</option><option>Over 1,000</option></select></label><label class="tf__field"><span class="tf__label">Your role</span><select class="tf__input" name="role"><option value="" disabled selected>Choose</option><option>Managing director or owner</option><option>IT</option><option>Department lead</option><option>Other</option></select></label><label class="tf__field"><span class="tf__label">Country</span><input class="tf__input" type="text" name="country" autocomplete="country-name"></label><label class="tf__field"><span class="tf__label">How did you hear about this webinar?</span><select class="tf__input" name="source"><option value="" disabled selected>Choose</option><option>Referral</option><option>LinkedIn</option><option>Email</option><option>KI am Werk</option><option>Search</option><option>Other</option></select></label><label class="tf__field tf__field--full"><span class="tf__label">A question for the speaker</span><textarea class="tf__input tf__area" name="question" rows="3" placeholder="Optional"></textarea></label></div>'
      '<div class="wd-guests" data-guests><p class="tf__label">Bring colleagues</p><p class="wd-guests__d">Add their email addresses, and they will get their own invite.</p><div class="wd-guests__list"></div>'
      '<button class="wd-guests__add" type="button" data-add-guest>+ Add a colleague</button></div>'
      '<label class="tf__consent"><input type="checkbox" name="consent" required> <span>I agree that brainbot may email me about this webinar. <a href="@@ROOT@@en/legal/privacy/">Privacy policy</a></span></label>'
      '<p class="tf__error" role="alert" hidden>Please fill in the fields marked with an asterisk.</p>'
      '<button class="btn btn--filled btn--xl btn--hero-cta tf__submit" type="submit"><span class="btn__label">Register <span class="arrow">→</span></span></button></form>'
      '<div class="tf__done" hidden><h3 class="tf__done-h">You are registered.</h3><p>We will email you the link to join.</p></div>')
    share=('<div class="wd-share" data-share><p class="wd-share__h">Know someone who should see this?</p><div class="wd-share__row">'
           '<button type="button" class="wd-share__b" data-copy-link>Copy link</button>'
           '<a class="wd-share__b" data-share-li target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/">Share on LinkedIn</a>'
           f'<a class="wd-share__b" data-share-mail href="mailto:?subject={subj}">Share by email</a></div></div>')
    body=(f'<section class="acc-chapter acc-chapter--white" id="webinar"><div class="container">'
          f'<p class="wd-back"><a href="@@ROOT@@en/webinars/" data-back>← Back</a></p>'
          f'<div class="acc-chapter__text acc-chapter__text--wide" data-animate="fade-up"><h2 class="section-title">{t}.</h2></div>'
          f'<div class="tf__wrap"><div class="wd-main">{facts}<p class="wd-who">{w["who"]}</p>{FLAG}'
          f'<h3 class="wd-h">{w.get("get_title","What you will get out of it")}</h3>{pts}{BOX}<h3 class="wd-h">Agenda</h3>{ag}<h3 class="wd-h">Hosted by</h3>{host}</div>'
          f'<div class="wd-side"><div class="tf__card">{form}</div>{share}</div></div></div></section>')
    open(f'neu/pages/webinar-{k}.html','w',encoding='utf-8').write(body)
    return w['slug']
webinar_page()
WSLUG={k:webinar_detail(k) for k in WEBINARS}

PAGES=[
 ('en/webinars/crm/index.html','webinar-crm',"Webinar: the AI Brain for your CRM | indie.solutions","A free online webinar, date coming soon. See how sales teams get answers from their CRM, emails and quotes in seconds, with a live demo.",None,'',"",""),
 ('en/webinars/email-management/index.html','webinar-mail',"Webinar: email management with local AI agents | indie.solutions","A free online webinar, date coming soon. See how local AI agents, powered by your AI Brain, sort your inbox and draft replies without your email leaving your office.",None,'',"",""),
 ('en/webinars/index.html','webinars',"Webinars: see the AI Brain live | indie.solutions","Join a free online webinar and see the AI Brain live, with time for your questions.",None,'',"",""),
 ('en/request-a-trial/index.html','request-a-trial',"Request a trial | indie.solutions","Tell us about your team, and we will set up a trial of your private AI Brain.",None,'',"",""),
 ('en/request-your-industry/index.html','request-your-industry',"An AI Brain for your industry | indie.solutions","Don't see your industry yet? Tell us about it, and we will get in touch about an AI Brain for your field.",None,'',"",""),
 ('en/get-notified/index.html','get-notified',"Get notified | indie.solutions","Leave your email, and we will let you know when the AI Brain for your industry is ready.",None,'',"",""),
 ('en/customers/lightforce/index.html','lightforce',"Lightforce: private AI for an engineering company | indie.solutions","How Lightforce, an aircraft and drone engineering company, runs a private AI Brain on an indie.box, with a virtual wind tunnel and its own roadmap app.",None,'',"",""),
 ('en/about/index.html','about',"About: the team behind indie.solutions | indie.solutions","indie.solutions is a product of brainbot GmbH in Mainz, Germany, founded in 2000 as a spin-off of the German Research Center for Artificial Intelligence.",'hero-mainz-office.jpg?v=2','55% 50%',"The team behind your AI Brain.",""),
 ('en/legal/imprint/index.html','legal-imprint',"Imprint | indie.solutions","Legal information about brainbot GmbH, the company behind indie.solutions.",None,'',"",""),
 ('en/legal/privacy/index.html','legal-privacy',"Privacy policy | indie.solutions","How brainbot GmbH processes personal data on indie.solutions.",None,'',"",""),
 ('en/legal/terms/index.html','legal-terms',"Terms | indie.solutions","Terms and conditions of brainbot GmbH for indie.solutions.",None,'',"",""),
 ('en/devices-and-software/index.html','devices-and-software',"Devices and software for your AI Brain | indie.solutions","Four devices for your private AI Brain, each with the AI Brain, AI Agent Command Center and Agent Studio preinstalled. Specs and details.",'hero-devices.jpg','50% 70%',"Your AI Brain, on the device that fits your team.",""),
]
for out,name,title,desc,img,pos,h1,sub in PAGES:
    if os.path.exists(f'neu/pages/{name}.html'): sub_page(out,name,title,desc,img,pos,h1,sub,buttons=(name not in ('software','product','devices-and-software','about') and not name.startswith('device-')),webinars_on=(name not in ('devices-and-software','about','request-a-trial','request-your-industry','get-notified','webinars','webinar-crm','webinar-mail','lightforce') and not name.startswith('legal-') and not name.startswith('device-')))
print('ok')

# German site, built from the English pages.
import subprocess as _sp
_sp.run(['python3',__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'de','de_build.py')],check=True)
