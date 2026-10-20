# Devices and Software: one interactive stack, the devices, and the FAQ.
import sys,re
sys.path.insert(0,sys.argv[1])
from common import *
out=sys.argv[2]
ROOTHTML=open('index.html',encoding='utf-8').read()
st=re.search(r'<section class="solstack" id="indie-solstack">([\s\S]*?)</section>',ROOTHTML).group(1)
st=st[st.index('<div class="solstack__panel"'):].rstrip()
# English, and only the four Indie Suite products in the top row.
st=re.sub(r'<div class="solstack__app">(?:(?!</div>)[\s\S])*?<span>Individuelle Agents</span></div>','',st)
LAYER={'Wissensarbeit':('brain','AI Brain'),'Prozessautomatisierung':('cc','AI Agent Command Center'),'Datenanalyse':('studio','Agent Studio'),
       'Dokumentenverarbeitung':('router','indie.router'),'API &amp; Integration':('integrations','Integrations and API'),
       'Modell-Orchestrierung &amp; Workflows':('orchestration','Model orchestration and workflows'),'Modell-Management':('models','Model management'),
       'Daten &amp; Knowledge':('data','Data and knowledge'),'Sicherheit &amp; Governance':('security','Security and governance'),
       'Lokale Inferenz-Engine':('engine','Local AI engine'),'Hardware-Abstraktion':('hardware','Hardware layer')}
def btn(m):
    cls,inner,label=m.group(1),m.group(2),m.group(3)
    lid,en=LAYER[label]
    if lid=='router': en+=' <em class="pg-soon">Soon</em>'
    return f'<button type="button" class="{cls} pg-sx__btn" data-layer="{lid}" aria-pressed="false">{inner}<span>{en}</span></button>'
st,k=re.subn(r'<div class="(solstack__app|solstack__bar)">(<svg[\s\S]*?</svg>)<span>([^<]*)</span></div>',btn,st)
assert k==11,k
for de,en in [('Anwendungen &amp; Agents','Indie Suite software'),('>Plattform<','>Platform<'),('>Basis<','>Base<'),
              ('Die vier Leistungsklassen nebeneinander: indie.box, indie.booster, indie.workstation und indie.rack.','The four devices side by side: indie.box, indie.booster, indie.rack and indie.workstation.')]:
    assert st.count(de)==1,de; st=st.replace(de,en)
st=st.replace('src="assets/','src="@@ROOT@@assets/').replace('srcset="assets/','srcset="@@ROOT@@assets/').replace(', assets/',', @@ROOT@@assets/')
for x,h in (('17.5%','40%'),('36%','27.5%'),('60%','29%'),('82.5%','7.5%')):
    st=re.sub(r'<span class="solstack__drop" style="--x: '+re.escape(x)+r'; --h: [^;]*; --tip: [^"]*"></span>',f'<span class="solstack__drop" style="--x: {x}; --h: {h}"></span>',st)
labels=re.search(r'<div class="solstack__labels">[\s\S]*?</div>',st).group(0)
LB=[('17.5%','indie-box','indie.box','Local AI, compact.'),('36%','indie-booster','indie.booster','Accelerated AI.'),('60%','indie-rack','indie.rack','Enterprise AI.'),('82.5%','indie-workstation','indie.workstation','High-performance AI.')]
st=st.replace(labels,'<div class="solstack__labels">'+''.join(f'<a class="solstack__label" style="--x: {x}" href="@@ROOT@@en/devices/{sl}/"><span class="solstack__label-name">{n}</span><span class="solstack__label-tag">{t}</span></a>' for x,sl,n,t in LB)+'</div>')

VID='<div class="pg-shot pg-sx__media"><img src="@@ROOT@@neu/img/brain-answer.jpg?v=1" alt="The AI Brain answering why the tolerances on a pump housing were changed in 2014, with its sources" width="1924" height="1202" loading="lazy"></div>'
CCI='<div class="pg-shot pg-sx__media"><img src="@@ROOT@@neu/img/cc-dashboard.jpg?v=1" alt="The AI Agent Command Center at Lightforce" width="2000" height="1040" loading="lazy"></div>'
def ptsp(items): return '<ul class="pg-points pg-points--panel">'+''.join(f'<li><span class="pg-points__check" aria-hidden="true">{CHECK}</span><div><p class="pg-points__t">{t}</p><p class="pg-points__d">{d}</p></div></li>' for t,d in items)+'</ul>'
BRAINP=ptsp([('Your sources stay put','They stay where they are, nothing is copied over, and nobody has to change how they work.'),
             ('Always with the source','Every answer names the document and the passage. If it isn&#39;t in your sources, the AI Brain doesn&#39;t claim it.'),
             ('Cleaned up by the Curator','Old versions, duplicates and contradictions get condensed into clear articles, with links back to the originals.')])
CCP=ptsp([('Custom apps for your team','We build apps around how your team works, like a project roadmap or a design simulator. Need another one? Ask the agent and it builds it.'),
          ('An agent for every app','Each app has its own agent that knows your data. Launch new agents whenever you need them, each set up for its own kind of work.'),
          ('Apps that stay up to date','Every app an agent builds stays in your dashboard and always shows your latest approved data, so you can come back to it any time.'),
          ('You stay in the loop','Review and correct the interim results, and approve each step before anything is final.'),
          ('Shared with the right people','You choose who can use each app and agent. Colleagues only see what they have been given access to.')])
STP=ptsp([('Areas and knowledge sources','Each team gets its own area. You decide which documents, databases and file stores it can see, and you can check that at any time.'),
          ('Rules for every area','Each area sets which sources its agents may use, what they may do, and where a person has to approve.'),
          ('One machine for every team','HR and product development can work on the same device, and neither sees the other&#39;s data.')])
STPH='<div class="pg-sx__media pg-sx__ph"><figure class="ph ph--eng" role="img" aria-label="Screenshot placeholder: Agent Studio with two team areas and the sources each one can see"><figcaption class="ph__note" title="Screenshot placeholder: Agent Studio with two team areas and the sources each one can see"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg></figcaption></figure></div>'
CONNECTS='<div class="pg-sx__media pg-sx__connects">'+open(sys.argv[1]+'/connects_frame.html',encoding='utf-8').read()+'</div>'
P=[('brain','Indie Suite software','AI Brain','Everything your company knows, one question away. It connects your drives, email, wikis and business systems, and every answer comes with its source.',BRAINP+VID),
   ('cc','Indie Suite software','AI Agent Command Center','Your custom apps and AI agents, together in one dashboard. Describe a task, and an agent gets it done with your approved data.',CCP+CCI),
   ('studio','Indie Suite software','Agent Studio','A protected area for every team, with its own knowledge and its own rules.',STP+STPH),
   ('integrations','Platform','Integrations and API','The AI Brain connects to the systems your company already uses, and your apps and agents can use your own tools.',ptsp([('Works with what you have','Shared drives, email and GitLab, connected where they already are. File servers, network drives and more systems, like SharePoint, Teams, Confluence, Notion, SAP, Salesforce and HubSpot, can be connected on request.'),('Your own APIs and MCP servers','Apps and agents can call your own APIs and remote MCP servers, the same ones in chat and in agents.'),('Also works with the AI you already use','The AI Brain runs on its own local models. If your team already uses ChatGPT, Claude or Copilot, you can connect them too, so they answer with your company knowledge. Access control decides what each tool can see.'),('Locked to one address','Each connector is tied to one fixed address that apps and agents cannot change.'),('New skills for your agents','Teach agents a skill, like summarizing a PDF, and they use it only when it is relevant.')])+'<div class="pg-shot pg-sx__media"><img src="@@ROOT@@neu/img/sw-integrations.jpg?v=1" alt="The Integrations screen, with MCP servers, connectors to your own APIs, and skills" width="2092" height="1668" loading="lazy"></div>'),
   ('orchestration','Platform','Orchestration and workflows','Agents take on recurring work and keep running in the background, on a schedule you set.',ptsp([('Routines on a schedule','Give an agent a routine, like a summary of open quotes every Monday, and it runs on that cadence on your own server, even when nobody is logged in.'),('As a chat or an agent','A routine can answer into its own chat, or run a full agent turn with its workspace and tools.'),('See what is running','Agents with a routine or a running service move to the Background tab, so you can see at a glance what works on its own.'),('Pause any time','Pause a routine or stop a service, and the agent moves back to the Foreground.')])+'<div class="pg-shot pg-sx__media"><img src="@@ROOT@@neu/img/sw-routines.jpg?v=1" alt="The Routines panel, where scheduled work is set up as a chat or an agent routine" width="1134" height="770" loading="lazy"></div>'),
   ('models','Platform','Model management','You choose which AI model answers, and you can switch at any time.',ptsp([('Pick the default','Set the model every new chat starts with, like Qwen 3.8 27B running on your own device. Switch it in the chat toolbar whenever you like.'),('Bring your own endpoint','Connect any OpenAI-compatible API, and it appears as Custom next to your local models. Its key stays in your browser.'),('Add open models','Add or remove open models on your device whenever you need to.'),('In your administrators&#39; hands','Only your administrators can install models, and each one can be checked against its published checksum.')])+'<div class="pg-shot pg-sx__media"><img src="@@ROOT@@neu/img/sw-models.jpg?v=1" alt="The Models screen, with the default model for new chats and a field for your own endpoint" width="1638" height="1214" loading="lazy"></div>'),
   ('data','Platform','Data and knowledge','Your team and your agents work from one knowledge base, kept in one place on your device.',ptsp([('One knowledge base, with guardrails','Every connected source feeds the AI Brain. Your team and your agents each see only the knowledge they have been given access to.'),('Private until shared','What someone creates stays private until they choose to share it with the team.'),('Simple to back up','All data sits in one central area on your device, so it fits into the backup routine you already have.')])+CONNECTS),
   ('security','Platform','Security and governance','The system itself enforces who sees what, and what each agent may do.',ptsp([('Access set per agent','For every wiki, you choose which agents can read it and which one maintains it. Only an admin can change who maintains the shared wiki.'),('Personal data filtered out','A privacy filter can replace emails, phone numbers and secrets with placeholders before a request reaches the model.'),('A sealed space for every agent','Each app and agent runs in its own closed space, with no internet unless you allow it.'),('Access per person','Everyone has their own account, and each team only sees the areas it has been given. Signing in with your company login is available as an add-on.'),('Kept to yourself','The device sends nothing back to us, and your data is never used to train AI.')])+'<div class="pg-shot pg-sx__media"><img src="@@ROOT@@neu/img/sw-access.jpg?v=2" alt="The Wiki settings, where you choose which agents can read a wiki and which one maintains it" width="1440" height="930" loading="lazy"></div>'),
   ('engine','Base','Device dashboard','One start page for your device. See at a glance that everything runs, and look after it in a few clicks.',ptsp([('Everything at a glance','Apps, updates, services and models, each with a clear status.'),('Apps and models','Install apps, and add or remove AI models.'),('Network and secure access','Check the connection and set up HTTPS.'),('Storage and backups','Free space, the last backup and your restore points.'),('Hardware, live','Processor, memory, GPU and temperature right now.')])+'<div class="pg-shot pg-sx__media"><img src="@@ROOT@@neu/img/sw-dashboard.jpg?v=3" alt="The device dashboard, showing apps, updates, network, HTTPS and live hardware use, with storage, backups and models in the menu" width="1632" height="1120" loading="lazy"></div>')]
# Device specs live in the package section of option A (kept even while option B is shown).
ACCX=open('neu/bbx/acc-sections.html',encoding='utf-8').read()+open('neu/bbx/options/pricing-option-a.html',encoding='utf-8').read()
def specrows(k):
    dl=re.search(r'<div class="acc-pick__spec" data-spec="'+k+r'">[\s\S]*?(<dl class="acc-pick__dl">[\s\S]*?</dl>)',ACCX).group(1)
    return [(x,y.replace('acc-pick__part','pg-part')) for x,y in re.findall(r'<div><dt>([^<]*)</dt><dd>([\s\S]*?)</dd></div>',dl)]
SPECS={'box':specrows('box'),'workstation':specrows('workstation'),'rack':specrows('rack'),
  'booster':[('Best for','A faster indie.box'),('Users','Small teams that need quick answers'),('Compute','NVIDIA RTX 5090'),
       ('Memory','32 GB dedicated GPU memory. The indie.box keeps its 128 GB'),('Storage','Uses the storage on the indie.box'),('AI models','Runs the same models as the indie.box, up to the 400B class, with faster answers'),('Connection','Connects to the indie.box'),('User login','Uses the accounts on the indie.box'),('Offline use','Runs fully offline if you need it'),('Upgrades','Fits any indie.box, also ones already in use. Not for the indie.workstation'),
       ('Software','Runs the software on the indie.box')]}
# Full device content, shared with the device pages (device_page.py): who it's for, when to choose it,
# specs, what's included and the FAQ.
_src=open(sys.argv[1]+'/device_page.py',encoding='utf-8').read()
_src=_src[_src.index('D={'):_src.index('d=D[key]')]
_ns={'SOFT':None}
_pre=open(sys.argv[1]+'/device_page.py',encoding='utf-8').read()
exec(_pre[_pre.index('IC={'):_pre.index('D={')],_ns); exec(_src,_ns); DD=_ns['D']
def ptsx(items): return '<ul class="pg-points pg-points--tight">'+''.join(f'<li><span class="pg-points__check" aria-hidden="true">{CHECK}</span><div><p class="pg-points__t">{t}</p><p class="pg-points__d">{x}</p></div></li>' for t,x in items)+'</ul>'
LINE={'box':'For small teams. A compact AI server for your office.','booster':'For small teams that want faster answers. A second device that adds extra power to your indie.box.','workstation':'For teams that use AI all day. Built to stay fast when many people use it at once.','rack':'For large organizations. Servers sized to the number of people who use them, from 100 to 1,000+.'}
for k in ('box','booster','workstation','rack'):
    d=DD[k]; h1,h2,txt=d['who']
    # "Best for" and "Users" would repeat the line above, so the panel starts with the hardware.
    dl='<dl class="pg-specs pg-specs--panel">'+''.join(f'<div><dt>{x}</dt><dd>{y}</dd></div>' for x,y in SPECS[k] if x not in ('Best for','Users'))+'</dl>'
    inc='<ul class="pg-inc">'+''.join(f'<li><p class="pg-inc__t">{t}</p><p class="pg-inc__d">{x}</p></li>' for _i,t,x in d['inc'])+'</ul>'
    fq='<div class="pg-devfaq">'+''.join(f'<details><summary>{q}</summary><p>{a_}</p></details>' for q,a_ in d['faq'])+'</div>'
    body=(f'<div class="pg-sx__media pg-sx__devimg"><img src="@@ROOT@@assets/indie-solutions/cutouts/indie-{k}_cut.webp?v=5" alt="The {d["name"]}" loading="lazy"></div>'+dl)
    P.append((f'dev-{k}','Devices',d['name'],LINE[k],body))
panels=''.join(f'<div class="pg-sx__panel" data-panel="{i}"{"" if n==0 else " hidden"}><p class="pg-sx__group">{g}</p><h3 class="pg-sx__h">{t}</h3><p class="pg-sx__p">{d}</p>{m}</div>' for n,(i,g,t,d,m) in enumerate(P))
# A clean layered chart: one row per group, the explanation panel below it.
ICON={k:re.search(r'data-layer="'+k+r'" aria-pressed="false">(<svg[\s\S]*?</svg>)',st).group(1) for k in ('brain','cc','studio','router','integrations','orchestration','models','data','security','engine','hardware')}
_SV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
ICON['brain']=_SV+'<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>'
ICON['engine']=_SV+'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 14l3-3 2.5 2L17 8.5"/><path d="M8 21h8"/></svg>'
ICON['cc']=_SV+'<rect x="3" y="3" width="7" height="9" rx="1.2"/><rect x="14" y="3" width="7" height="5" rx="1.2"/><rect x="14" y="12" width="7" height="9" rx="1.2"/><rect x="3" y="16" width="7" height="5" rx="1.2"/></svg>'
NM={'brain':'AI Brain','cc':'AI Agent Command Center','studio':'Agent Studio','router':'indie.router <em class="pg-soon">Soon</em>','integrations':'Integrations and API',
    'orchestration':'Orchestration and workflows','models':'Model management','data':'Data and knowledge','security':'Security and governance','engine':'Device dashboard','hardware':'Hardware layer'}
def b2(k): return f'<button type="button" class="pg-sx__btn pg-lay__btn" data-layer="{k}" aria-pressed="false">{ICON[k]}<span>{NM[k]}</span></button>'
ROWS=[('Indie Suite software',['brain','cc','studio']),('Platform',['integrations','orchestration','models','data','security']),('Base',['engine'])]
chart='<div class="pg-lay">'+''.join(f'<div class="pg-lay__row"><p class="pg-lay__label">{g}</p><div class="pg-lay__cells pg-lay__cells--{len(ks)}">'+''.join(b2(k) for k in ks)+'</div></div>' for g,ks in ROWS)
chart+=('<div class="pg-lay__row pg-lay__row--hw"><p class="pg-lay__label">Devices</p><div class="pg-lay__cells pg-lay__cells--4">'
        +''.join(f'<button type="button" class="pg-sx__btn pg-lay__dev" data-layer="dev-{k}" aria-pressed="false"><img src="@@ROOT@@assets/indie-solutions/cutouts/indie-{k}_cut.webp?v=5" alt="" loading="lazy"><span>{n}</span></button>' for k,n in [('box','indie.box'),('booster','indie.booster'),('workstation','indie.workstation'),('rack','indie.rack')])
        +'</div></div></div>')
stack=section('stack', head('Everything works together.',None,'The Indie Solutions Stack brings your AI Brain, apps, agents and data together on one device in your office. Pick the device that fits your team, and the same software comes with it. Click any layer to see what it does.')
   +'<span class="todo-flag stack-flag">TO DO: Agent Studio still needs a screenshot. It shows a placeholder when you open Agent Studio below.</span>'
   +f'<div class="pg-sx pg-sx--clean" data-stackx><div class="pg-sx__diagram">{chart}</div><div class="pg-sx__info" aria-live="polite">{panels}</div></div>', white=True)

IMG='@@ROOT@@assets/indie-solutions/cutouts/'
D=[('box','indie.box','Large AI models for small teams and background work.'),('booster','indie.booster','Adds a fast GPU to your indie.box.'),
   ('workstation','indie.workstation','Fast answers when many people work at once.'),('rack','indie.rack','Dedicated servers for 100 to 1,000+ users.')]
cards=''.join(f'<a class="pg-dev" href="@@ROOT@@en/devices/indie-{k}/" data-animate="fade-up" data-stagger="{i}"><span class="pg-dev__img"><img src="{IMG}indie-{k}_cut.webp?v=5" alt="The {n}" loading="lazy"></span><span class="pg-dev__name">{n}</span><span class="pg-dev__d">{d}</span><span class="pg-dev__go">Learn more <span aria-hidden="true">→</span></span></a>' for i,(k,n,d) in enumerate(D,1))
devices=section('devices', head('Four devices,','one software.','When the AI works in the background, model size matters most. When someone waits for the answer, speed matters most.')
   +f'<div class="pg-devs">{cards}</div><p class="pg-note">Every device comes set up, and is usually delivered within 14 days.</p>')
FQ=[('Which device should we start with?','Most teams start with the Essential package and the indie.box. If people often wait for answers while they work, for example when coding, the indie.workstation is the better fit. For 100 users or more, the indie.rack is the right choice.'),
    ('Is the software the same on every device?','Yes. Every device runs the same software, so your apps and agents keep working when you add or change devices.'),
    ('Is the software included in the price?','Yes. The AI Brain, AI Agent Command Center and Agent Studio come preinstalled on every device, and each package includes 12 months of the AI Brain and of updates, support and device replacement. After that, you choose monthly plans, priced per device for any number of users.'),
    ('Does it work without an internet connection?','Yes. The devices can run fully offline.'),
    ('Who can access our data?','Only the people you give access to. Your data stays on your device and is never used to train AI models.'),
    ('Can we use our own AI models?','Yes. Your administrators can add open models next to the preinstalled ones, or connect any OpenAI-compatible endpoint.'),
    ('Does it connect to the systems we already use?','Yes. The AI Brain connects to shared drives, email and code repositories such as GitLab and GitHub, without moving your data. File servers, network drives and other systems, such as SharePoint, Confluence or Salesforce, can be connected on request.'),
    ('How do updates work?','Updates, security patches and tested model updates are part of every plan for updates, support and device replacement, and the first 12 months are included in your package. Your administrators start each update from the admin dashboard, so nothing changes without their approval.'),
    ('Can we add more devices later?','Yes. Add an indie.booster to an indie.box, add workstations, or move to a rack. What you have stays part of the system.')]
CMP=[('Where your data is processed','Data processed','On a device in your own office','In your office','In the provider&#39;s data centers','Provider&#39;s data center'),
     ('Who can see your data','Who sees it','Only your own team','Only your team','The provider processes it in readable form','The provider too'),
     ('Internet connection','Internet','Works fully offline if you need it','Works offline','Always needed','Always needed'),
     ('Your company knowledge','Your knowledge','Connected where it already is: drives, email and code, with file servers on request','Stays where it is','Uploaded, or connected through the provider&#39;s cloud','Uploaded to the cloud'),
     ('Custom apps and AI agents','Apps and agents','Built around your team, running on your own data','Built for your team','Mostly general-purpose assistants','General-purpose'),
     ('AI models','AI models','Open models you choose, like Llama, GPT-OSS and Qwen','Open models you choose','The provider&#39;s own models','Provider&#39;s own'),
     ('Cost','Cost','One price per device, for any number of users','Per device','A monthly fee for every user','Per user, monthly')]
def two(lg,sh): return f'<span class="vs__lg">{lg}</span><span class="vs__sh">{sh}</span>'
DASH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 12h10"/></svg>'
table=('<div class="vs" data-animate="fade-up" role="table" aria-label="Local AI compared with cloud AI">'
       '<div class="vs__row vs__row--head" role="row"><span role="columnheader" class="vs__k"></span>'
       '<span role="columnheader" class="vs__local vs__local--top"><span class="vs__tag">Local AI</span><span class="vs__name">'+two('AI Brain on your own device','AI Brain')+'</span></span>'
       '<span role="columnheader" class="vs__cloud"><span class="vs__tag vs__tag--muted">Cloud AI</span><span class="vs__name">'+two('Like ChatGPT or Microsoft Copilot','Like ChatGPT')+'</span></span></div>'
       +''.join(f'<div class="vs__row{" vs__row--last" if i==len(CMP)-1 else ""}" role="row"><span role="rowheader" class="vs__k">{two(k,ks)}</span>'
                f'<span role="cell" class="vs__local{" vs__local--bottom" if i==len(CMP)-1 else ""}"><i aria-hidden="true">{CHECK}</i><span>{two(l,ls)}</span></span>'
                f'<span role="cell" class="vs__cloud"><i aria-hidden="true">{DASH}</i><span>{two(c,cs)}</span></span></div>' for i,(k,ks,l,ls,c,cs) in enumerate(CMP))
       +'</div>')
compare=section('compare', head('Local AI or cloud AI?',None,'The AI Brain is a private AI knowledge base that runs on a local AI server in your office. Your team asks questions in plain language, just like with ChatGPT or Microsoft Copilot. The difference is where it runs, and who controls your data.')
   +''+table+'<p class="pg-note">Cloud tools differ by plan and settings. This comparison describes the typical setup.</p>')
FQ.insert(0,('Is this an alternative to ChatGPT or Microsoft Copilot?','Yes, for companies that want to keep their data in-house. Your team asks questions in plain language, like with ChatGPT or Copilot, but the AI runs on-premise on your own device, works with your company knowledge, and is set up to meet GDPR requirements.'))
FQ.insert(1,('What is on-premise AI?','On-premise AI runs on hardware in your own building instead of a provider&#39;s cloud. With indie.solutions, that is one of four devices, from the compact indie.box to the indie.rack, with the AI Brain, AI Agent Command Center and Agent Studio preinstalled.'))
faqs=section('faq', head('Frequently asked','questions.')+faq(FQ))
open(out,'w',encoding='utf-8').write(stack+compare+faqs.replace('class="acc-chapter"','class="acc-chapter acc-chapter--white"',1))
