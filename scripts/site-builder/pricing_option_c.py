# Builds pricing option C (one starter bundle plus a short list of extras) into neu/bbx/options/pricing-option-c.html
import os
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..')+'/'
CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>'
inc=''.join(f'<li>{CHECK}<span>{t}</span></li>' for t in [
 'The indie.box, delivered to your office, at the introductory price of €4,999 instead of €5,999',
 'Two-day setup and getting-started workshop',
 'Two custom apps, built during the workshop',
 'The AI Brain, AI Agent Command Center and Agent Studio, preinstalled',
 'The AI Brain, free plan: up to 1,000 pages and 150 questions a month'])
extras=[('Faster answers','Add an indie.booster to your indie.box.','+ €7,999'),
        ('AI in use all day','Choose the indie.workstation, or indie.rack servers for large organizations.','<a href="@@ROOT@@en/about/#contact">Ask us</a>'),
        ('More knowledge','Bigger AI Brain plans, up to 70,000 pages and 10,000 questions a month.','from €300/month'),
        ('Updates and support','Updates from €25 a month. Support with device protection from €149 a month.','from €25/month')]
rows=''.join(f'<li><div><p class="xl__t">{t}</p><p class="xl__d">{d}</p></div><p class="xl__p">{p}</p></li>' for t,d,p in extras)
C=f'''<section class="acc-chapter acc-pricing" id="pricing"> <div class="container"> <div class="acc-chapter__text acc-chapter__text--wide" data-animate="fade-up"> <h2 class="section-title">Get an AI Brain<br><span class="accent">for your company.</span></h2> <p class="acc-sub">Start with the starter bundle. Add more when you need it.</p> </div>
<span class="todo-flag">TO CHECK: Prices for option C. Starter bundle €7,999 (the price list says €8,000), indie.box €4,999 in the bundle instead of €5,999, indie.booster €7,999. AI Brain plans and support plans as in the price list.</span>
<div class="sb" data-animate="fade-up">
 <div class="sb__img"><img src="@@ROOT@@assets/indie-solutions/cutouts/indie-box_cut.webp?v=5" alt="The indie.box" loading="lazy"></div>
 <div class="sb__body">
  <div class="sb__head"><h3 class="sb__title">Starter bundle</h3><p class="sb__price">€7,999 <span>Net, plus VAT</span></p></div>
  <ul class="sb__inc">{inc}</ul>
  <a href="@@ROOT@@en/request-a-trial/?bundle=Starter%20bundle" class="sb__cta">Request a trial <span aria-hidden="true">→</span></a>
 </div>
</div>
<div class="xl" data-animate="fade-up"><h3 class="xl__h">Need more?</h3><ul class="xl__list">{rows}</ul><p class="xl__note">Monthly plans are per device, for any number of users, with a minimum of 12 months, then 3 months notice. We put together anything beyond the starter bundle with you.</p></div>
<div class="acc-extras-line"><h3 class="acc-extras-line__h">More services on request</h3><p>Extra custom apps and AI agents, extra support and training, and personalized consulting.</p></div>
 </div> </section>'''
open(R+'neu/bbx/options/pricing-option-c.html','w').write(C)
print('ok',len(C))
