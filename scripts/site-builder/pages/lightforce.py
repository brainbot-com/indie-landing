# Customer story: Lightforce. Short, built around the episode, with the four things that matter.
import sys; sys.path.insert(0, sys.argv[1])
from common import *
yt=open(sys.argv[1]+'/ytframe.html').read()
video=(yt.replace('data-yt-start="373"','data-yt-start="0"').replace('data-yt-title="Video: the roadmap app from the KI am Werk episode"','data-yt-title="Video: KI am Werk, episode 3, with Reinhart Paelinck of Lightforce"')
         .replace('aria-label="Play video: Project roadmap"','aria-label="Play the episode with Reinhart Paelinck of Lightforce"').replace('@@IMG@@yt-roadmap-373.jpg','@@ROOT@@neu/img/lightforce-episode.jpg'))
def lst(items): return '<ul class="lf-list">'+''.join(f'<li><span aria-hidden="true">{CHECK}</span>{x}</li>' for x in items)+'</ul>'
challenge=('<div class="lf-block" data-animate="fade-up"><p class="lf-step">The challenge</p>'
  '<p class="lf-lead">Lightforce wanted its internal knowledge, engineering data and code within easy reach, with AI agents that could work with it. The condition was clear: no data could leave the company, and nothing could be lost. In Reinhart&#39;s words, &ldquo;It&#39;s really important that nothing can be deleted by accident.&rdquo;</p></div>')
res=[('Custom apps on their own knowledge',lst(['A virtual wind tunnel, where the team changes aircraft designs. When another project updates, the app can pull that in straight away.','A roadmap app for project planning, built by a Lightforce colleague. It replaced an outside tool at around €50 per seat per year, of which the team only used a small part.'])),
     ('Apps and AI side by side','<p>The agent sits next to every app. What someone changes in the app, the agent can read and keep working with, which suits simulations, dashboards and tables.</p>'),
     ('Agents with clear limits','<p>The agents run locally on the indie.box, with read-only access to company data and no internet access unless the team allows it. Each one works in a sealed container that lets it read, answer through one set channel and make small changes in its own workspace. Reinhart calls it &ldquo;the best solution there is right now.&rdquo;</p>'),
     ('Connected in 20 minutes','<p>A colleague from brainbot brought the indie.box to Lightforce and plugged it in. About 20 minutes later the first systems were connected, and the team connected everything else it needed from there.</p>')]
results=('<div class="lf-block" data-animate="fade-up"><p class="lf-step">The results</p><div class="lf-grid">'
  +''.join(f'<div class="lf-card"><h3 class="lf-card__h">{t}</h3>{b}</div>' for t,b in res)+'</div></div>')
advice=('<div class="lf-block" data-animate="fade-up"><p class="lf-step">Reinhart&#39;s advice</p><div class="lf-card lf-card--wide">'
  +lst(['Use clear structure, so you can check whether what comes out is right.','Bring colleagues in early, so more of the company&#39;s combined knowledge becomes visible in the AI Brain.'])+'</div></div>')
grid=challenge+results+advice
body=section('story', head('How Lightforce puts its engineering knowledge to work.',None,'Lightforce, an aircraft and drone engineering company, runs a private AI Brain and AI Agent Command Center on an indie.box in its own office. Co-founder Reinhart Paelinck shows how it works in this 12-minute episode of KI am Werk.')
   +f'<div class="lf-video" data-animate="fade-up"><div class="pg-shot">{video}</div><p class="pg-note">The conversation is in German.</p></div>'
   +grid
   +'<figure class="acc-quote__fig lf-quote" data-animate="fade-up"><blockquote class="acc-quote__text">&ldquo;If this had existed earlier, I would have done it much sooner.&rdquo;</blockquote><figcaption class="acc-quote__who"><strong>Reinhart Paelinck</strong> Co-founder, Lightforce</figcaption></figure>'
   +ctas(), white=True)
open(sys.argv[2],'w',encoding='utf-8').write(body)
