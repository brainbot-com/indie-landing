# One English page per device, in the new design. Facts from the current indie.solutions device pages.
import sys,re; sys.path.insert(0, sys.argv[1])
from common import *
key,out,acc=sys.argv[2],sys.argv[3],sys.argv[4]
ACC=open(acc,encoding='utf-8').read()
def rows_of(k):
    dl=re.search(r'<div class="acc-pick__spec" data-spec="'+k+r'">[\s\S]*?(<dl class="acc-pick__dl">[\s\S]*?</dl>)',ACC).group(1)
    return re.findall(r'<div><dt>([^<]*)</dt><dd>([\s\S]*?)</dd></div>',dl)
BOOSTER=[('Best for','A faster indie.box'),('Users','Small teams that need quick answers'),('Compute','NVIDIA RTX 5090'),
       ('Memory','32 GB dedicated GPU memory. The indie.box keeps its 128 GB'),('Storage','Uses the storage on the indie.box'),('AI models','Large models up to the 400B class, with fast answers'),('Connection','Connects to the indie.box'),('User login','Uses the accounts on the indie.box'),('Offline use','Runs fully offline if you need it'),('Upgrades','Fits any indie.box, also ones already in use. Not for the indie.workstation'),
       ('Software','Runs the software on the indie.box')]
IC={'apps':'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M17.5 14v7M14 17.5h7"/>',
    'team':'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9" r="2.6"/><path d="M16.2 14.3c2.2.4 3.7 2 4.2 4.2"/>',
    'cal':'<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M9.5 14.8l1.8 1.8 3.4-3.4"/>',
    'cycle':'<path d="M4 12a8 8 0 0 1 13.7-5.6L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15"/><path d="M4 20v-5h5"/>',
    'shield':'<path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    'tag':'<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    'server':'<rect x="4" y="4" width="16" height="7" rx="1.5"/><rect x="4" y="13" width="16" height="7" rx="1.5"/><path d="M8 7.5h.01M8 16.5h.01"/>'}
SOFT=('apps','The software, preinstalled','The AI Brain, AI Agent Command Center and Agent Studio, ready to use from day one.')
FEES=('team','One-time purchase','The software comes preinstalled and is part of the purchase.')
LOCAL=('shield','Private by default','Everything runs locally. No telemetry, and outside services stay off unless you turn them on.')
D={
'box':dict(name='indie.box',img='indie-box_cut.webp',
  who=('Large AI models,','in a compact box.','The indie.box runs large AI models up to the 400B class entirely in your office. It is built for small teams that ask questions about documents and search company knowledge, and for agents that work in the background, like overnight runs.'),
  choose=[('Choose it when','Model size matters more than speed, because the work runs in the background.'),('Choose something else when','People wait for answers while they work, like when coding. Add an indie.booster, or choose the indie.workstation.')],
  inc=[SOFT,FEES,('cal','Set up by us','We deliver it, set it up and connect your first systems.'),LOCAL,('cycle','Works offline','It can run without an internet connection if you need it.'),('server','Grows with you','Add an indie.booster any time for faster answers.')],
  faq=[('Need more speed later?','Add an indie.booster to the box at any time. For interactive work all day, the indie.workstation is the better fit.'),
       ('Does it work without an internet connection?','Yes. It can run fully offline.'),('Who can access our data?','Only your own administrators. The box sends no telemetry.'),
       ('Can we use our own AI models?','Yes. You can add your own models next to the preinstalled ones, and remove them again.'),
       ('Do we need our own IT staff?','Your team uses it in the browser. Some technical know-how helps for the network setup and company login (SSO).'),
       ('How do people connect?','In the browser, on desktop or mobile, with local accounts or your company login (SSO or LDAP).'),
       ('How do backups work?','All data sits in one central data area, which you include in your existing backup routine.'),
       ('What if the hardware has a defect?','The statutory warranty applies, one year for businesses.')]),
'booster':dict(name='indie.booster',img='indie-booster_cut.webp?v=5',
  who=('Add speed','to your indie.box.','The indie.booster adds an NVIDIA RTX 5090 to an indie.box, without replacing it. The box keeps its 128 GB of memory for large models, and the booster adds fast answers. Together they are the only setup with both.'),
  choose=[('Choose it when','You want large models and fast answers in one setup, or your indie.box should become faster.'),('Good to know','The booster works only with an indie.box. It does not run on its own or with the indie.workstation.')],
  inc=[('server','A fast GPU','An NVIDIA RTX 5090 with 32 GB, in an external enclosure.'),('cal','Connected and set up','We connect it to your indie.box and set it up.'),('apps','Uses the box&#39;s software','The AI Brain, AI Agent Command Center and Agent Studio run on the indie.box, now faster.'),FEES,('cycle','Fits any indie.box','Also boxes already in use, so you can add it whenever you are ready.'),LOCAL],
  faq=[('Do we need an indie.box?','Yes. The booster only works together with an indie.box.'),('Can we add it later?','Yes, at any time, also to a box that is already in use.'),
       ('Does it work with the indie.workstation?','No. The workstation already has its own built-in GPU.'),
       ('What changes in daily use?','Very little. Access, users and updates stay the same. The booster takes over the requests that need speed.')]),
'workstation':dict(name='indie.workstation',img='indie-workstation_cut.webp',
  who=('The workhorse','for busy teams.','The indie.workstation is built for speed. With a built-in NVIDIA RTX 5090, it gives quick answers even when several people and agents work at the same time, around the clock.'),
  choose=[('Choose it when','People wait for the answer while they work, like when coding, and many requests come in at once.'),('Choose something else when','You need the largest AI models. The indie.box, with or without a booster, runs models up to the 400B class.')],
  inc=[SOFT,FEES,('cal','Set up by us','We deliver it, set it up and connect your first systems.'),('server','Room to grow','Add a second GPU or 2 × 2 TB of storage later, at extra cost.'),LOCAL,('cycle','Built for 24/7','Sound-dampened for the office, and built to run around the clock.')],
  faq=[('Why does it have less memory than the indie.box?','The two are tuned for different goals. The workstation is tuned for speed, the indie.box for the largest models.'),
       ('Can we add an indie.booster?','No. The booster only works with the indie.box.'),('How loud is it?','The case is sound-dampened for the office.'),
       ('Can it run around the clock?','Yes. It is built for 24/7 use and also fits a server cabinet.'),('What do the upgrades cost?','A second GPU or more storage is not included. We work out the scope and price with you.')]),
'rack':dict(name='indie.rack',img='indie-rack_cut.webp',
  who=('Dedicated servers','for your whole organization.','The indie.rack brings dedicated 19-inch servers to public administration and large companies, for 100 to 1,000+ users. There is no standard configuration. Every rack is sized to your organization.'),
  choose=[('Choose it when','A whole organization or data center needs AI, for 100 to 1,000+ users.'),('Choose something else when','You have fewer than about 100 users or a single department. A smaller device is usually the better fit.')],
  inc=[SOFT,('team','Software included','The software comes preinstalled and is part of the purchase.'),('server','Sized for you','Compute, storage, network and redundancy, planned before delivery.'),('shield','Yours alone','Dedicated infrastructure, reserved for your organization.'),('cal','Planned and set up by us','We plan, deliver and set up the rack together with your team.'),('cycle','Room to grow','Add capacity as your organization grows, planned together with you.')],
  faq=[('Can we buy it through a systems integrator or a public tender?','Yes. Both are supported, as well as buying directly.'),('Can it run fully offline?','Yes, as part of an individual agreement.'),
       ('Who runs it?','Your organization, through the admin dashboard.'),('What if we grow beyond the original setup?','We plan the next step together with you.')]),
}
d=D[key]
rows=BOOSTER if key=='booster' else rows_of(key)
rows=[(a,b.replace('acc-pick__part','pg-part')) for a,b in rows]
pts=lambda items: '<ul class="pg-points">'+''.join(f'<li><span class="pg-points__check" aria-hidden="true">{CHECK}</span><div><p class="pg-points__t">{t}</p><p class="pg-points__d">{x}</p></div></li>' for t,x in items)+'</ul>'
h1,h2,txt=d['who']
who=section('about','<div class="pg-split"><div class="pg-split__text" data-animate="fade-up">'+H(h1,h2)+f'<p class="acc-sub">{txt}</p>'+pts(d['choose'])
   +f'</div><div class="pg-split__media" data-animate="fade-up"><div class="pg-detail__img"><img src="@@ROOT@@assets/indie-solutions/cutouts/{d["img"]}" alt="The {d["name"]}" loading="lazy"></div></div></div>', white=True)
specs=section('specs', head(f'{d["name"]}','specs.')+'<dl class="pg-specs pg-specs--two" data-animate="fade-up">'+''.join(f'<div><dt>{a}</dt><dd>{b}</dd></div>' for a,b in rows)+'</dl>')
inc=section('included', head('What&#39;s','included.')+'<div class="acc-features acc-cc-grid">'+''.join(card(IC[i],t,x,n%3+1) for n,(i,t,x) in enumerate(d['inc']))+'</div>', white=True)
others=[k for k in D if k!=key]
more=('<div class="pg-others" data-animate="fade-up"><p class="pg-others__h">Other devices</p><div class="pg-others__row">'
      +''.join(f'<a class="pg-other" href="@@ROOT@@en/devices/indie-{k}/"><img src="@@ROOT@@assets/indie-solutions/cutouts/{D[k]["img"]}" alt="" loading="lazy"><span>{D[k]["name"]}</span></a>' for k in others)
      +'<a class="pg-other pg-other--all" href="@@ROOT@@en/devices-and-software/"><span>All devices and software →</span></a></div></div>')
faqs=section('faq', head('Frequently asked','questions.')+faq(d['faq'])+more)
open(out,'w',encoding='utf-8').write(who+specs+inc+faqs)
