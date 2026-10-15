import sys; sys.path.insert(0, sys.argv[1])
from common import *
def pts(items): return '<ul class="pg-points">'+''.join(f'<li><span class="pg-points__check" aria-hidden="true">{CHECK}</span><div><p class="pg-points__t">{t}</p><p class="pg-points__d">{d}</p></div></li>' for t,d in items)+'</ul>'
stats=('<div class="ab-stats" data-animate="fade-up"><div><span class="ab-stats__v">2000</span><span class="ab-stats__l">Founded in Mainz</span></div>'
       '<div><span class="ab-stats__v">9</span><span class="ab-stats__l">Specialists</span></div>'
       '<div><span class="ab-stats__v">25+</span><span class="ab-stats__l">Years in data-sensitive systems</span></div></div>')
who=section('who', head('A product by','brainbot.','indie.solutions is a product of brainbot GmbH, a software company in Mainz, Germany. The devices, the software and the support all come from the same team.')
  +stats, white=True)
def blk(h,d,link=''):
    return ('<div class="ab-blk" data-animate="fade-up"><h3 class="ab-blk__h">'+h+'</h3><p class="ab-blk__d">'+d+'</p>'+link+'</div>')
story=section('story','<div class="acc-chapter__text acc-chapter__text--wide" data-animate="fade-up">'+H('Privacy should never be an add-on.')
  +'<p class="acc-sub">brainbot develops AI and software systems for environments where trust, control and auditability are essential.</p>'
  +'<p class="acc-sub">The company was founded in 2000 as a spin-off of the German Research Center for Artificial Intelligence (DFKI), first as a search engine company. Since 2014, brainbot has built privacy infrastructure for critical systems: sensitive business processes, private AI infrastructure, cryptographic protocols and digital elections.</p></div>'
  +'<h3 class="ab-seg">Other business areas at brainbot</h3>'
  +'<div class="ab-blks">'
  +blk('AI consulting for sensitive business processes.','brainbot helps companies bring AI into processes where data has to stay under control, from the first analysis and a fixed-scope pilot through to production.',
       '<p class="pg-links"><a href="https://brainbot.com/" target="_blank" rel="noopener">More about brainbot <span aria-hidden="true">→</span></a></p>')
  +blk('Digital elections. Secure and verifiable.','brainbot is developing a digital voting system for municipalities, universities, unions and cooperatives, where votes stay hidden from absolutely everyone, and anyone can still verify the results.',
       '<p class="pg-links"><a href="https://shuttergovernance.com/" target="_blank" rel="noopener">More about Shutter Governance <span aria-hidden="true">→</span></a></p>')
  +blk('Privacy for critical digital infrastructure.','With Shutter Network, software developed by brainbot, we provide threshold encryption that protects transactions from attacks that manipulate their order.')
  +'</div>')
team=section('team','<div class="ab-person" data-animate="fade-up"><img class="ab-person__img" src="@@ROOT@@neu/img/heiko-franssen.jpg" alt="Heiko Franssen" loading="lazy">'
  '<div><p class="ab-person__role">Managing Director</p><h3 class="ab-person__name">Heiko Franssen</h3>'
  '<p class="ab-person__bio">Heiko Franssen has two decades of enterprise technology leadership. He has led brainbot since 2020, helping companies with sensitive business processes adopt AI, from strategy and architecture through to production. He also hosts KI am Werk, brainbot&#39;s video series about AI in real companies.</p>'
  '<p class="pg-links"><a href="https://brainbot.com/ki-am-werk/" target="_blank" rel="noopener">Watch KI am Werk <span aria-hidden="true">→</span></a></p></div></div>', white=True)
contact=section('contact', head('Get in','touch.')
  +'<div class="ab-contact" data-animate="fade-up">'
  '<div><p class="ab-contact__h">brainbot GmbH</p><p>Taunusstraße 61<br>55120 Mainz, Germany</p></div>'
  '<div><p class="ab-contact__h">Contact</p><p><a href="mailto:contact@brainbot.com">contact@brainbot.com</a></p></div>'
  '<div><p class="ab-contact__h">More</p><p><a href="https://brainbot.com/" target="_blank" rel="noopener">brainbot.com</a><br><a href="https://www.linkedin.com/company/brainbot-gmbh" target="_blank" rel="noopener">LinkedIn</a></p></div>'
  '</div>')
open(sys.argv[2],'w',encoding='utf-8').write(who+story+team+contact)
