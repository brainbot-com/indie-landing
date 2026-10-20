# Builds pricing option B (the starter bundle, or a setup you customize at regular prices) into neu/bbx/options/pricing-option-b.html
import os
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..')+'/'
IMG='@@ROOT@@assets/indie-solutions/cutouts/'
CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>'
def opt(group,key,title,desc,bp,btag,ap=None,atag=None,img='',checked=False,only=''):
    """bp/btag: price and tag in the bundle; ap: the price of the part on its own (None = same)."""
    ap=bp if ap is None else ap; atag=btag if atag is None else atag
    im=f'<span class="cfg__img"><img src="{img}" alt="" loading="lazy"></span>' if img else ''
    # Two tags when the price differs outside the bundle; CSS shows the one for the current mode.
    tag=f'<span class="cfg__p cfg__p--b">{btag}</span><span class="cfg__p cfg__p--a">{atag}</span>' if btag!=atag else f'<span class="cfg__p">{btag}</span>'
    o=f' data-only="{only}"' if only else ''
    return (f'<label class="cfg__opt{" cfg__opt--img" if img else ""}"{o}><input type="radio" name="{group}" value="{key}" data-price="{bp}" data-alc="{ap}" data-title="{title}"{" checked" if checked else ""}>'
            f'{im}<span class="cfg__txt"><span class="cfg__t">{title}</span><span class="cfg__d">{desc}</span></span>{tag}</label>')
dev=''.join([
 opt('device','box','indie.box','For small teams. A compact AI server for your office.',5999,'€5,999',img=IMG+'indie-box_cut.webp?v=5'),
 opt('device','booster','indie.box + indie.booster','For small teams that want faster answers. The booster adds extra power.',13999,'€13,999',img=IMG+'indie-box-booster_cut.webp?v=5'),
 opt('device','workstation','indie.workstation','For teams that use AI all day. Stays fast when many people use it at once.',11999,'€11,999',img=IMG+'indie-workstation_cut.webp?v=5'),
 opt('device','rack','indie.rack','For large organizations. Servers sized to the number of people who use them.',-1,'Custom quote',img=IMG+'indie-rack_cut.webp?v=5'),
])
# The workshop card lists what happens, so the title does not have to.
_WS=''.join(f'<span class="cfg__li">{x}</span>' for x in ['Your AI Brain connected to the systems you choose, so your team can ask about your documents','Two custom apps made for what your team needs now, like a project planner or a dashboard','Hands-on training for your team'])
setup=''.join([
 opt('setup','none','No workshop','You set up the device and connect your systems yourselves.',0,'€0'),
 opt('setup','workshop','Two-day setup and getting-started workshop',_WS,3000,'<s>€6,000</s> €3,000'),
])
import json as _json, html as _html
# Plan details as in the package section of version A, so both read the same.
_A=open(R+'neu/bbx/options/pricing-option-a.html',encoding='utf-8').read()
_AP=[_json.loads(_html.unescape(x)) for x in __import__('re').findall(r'class="sl" data-slider data-inc="[^"]*" data-plans="([^"]*)"',_A)]
# Version A's support slider also has a €0 'No updates' step; B adds its own, so take only the paid plans here.
_AP[1]=[pl for pl in _AP[1] if pl['p'] not in ('€0',)]

NO='<span class="sl__no">Not included</span>'
BRAIN=[{"tick":t,"t":pl["rows"][0][1],"f":"","m":m,"rows":pl["rows"]} for (t,m,eq),pl in zip([('1,000 pages',0,'100 documents of 10 pages'),('3,500 pages',300,'350 documents of 10 pages'),('18,000 pages',1200,'1,800 documents of 10 pages'),('70,000 pages',3500,'7,000 documents of 10 pages')],_AP[0])]
BOXR='<span class="sl__yes">Defects only: replacement shipped the next business day</span>'
OTHER='<span class="sl__yes">Free repair of defects only, after you send it in</span>'  # indie.booster, workstation and rack are repaired, not replaced
CARE=[{"tick":"No updates","t":"No updates","f":"No updates, security fixes or support","m":0,"rows":[[r[0],NO] for r in _AP[1][0]["rows"]]}]
CARE+=[{"tick":t,"t":n,"f":pl["f"],"m":m,"rows":[[r[0],BOXR if "replaced" in r[1] else r[1]] for r in pl["rows"]],"rows_other":[[r[0],OTHER if "replaced" in r[1] else r[1]] for r in pl["rows"]]} for (t,n,m),pl in zip([('Updates only','Updates only',25),('Standard','Standard support',149),('Priority','Priority support',349),('Premium','Premium support',790)],_AP[1])]
def slider(key,head,q,plans,start):
    data=_html.escape(_json.dumps([{k:v for k,v in p.items() if k!='tick'} for p in plans],ensure_ascii=False),quote=True)
    ticks=''.join(f'<button type="button" class="sl__tick" data-i="{i}">{p["tick"].replace(" ","<br>",1)}</button>' for i,p in enumerate(plans))
    return (f'<div class="sl cfs" data-cfs="{key}" data-plans="{data}"><h3 class="sl__h">{head}</h3><label class="sl__q" for="cfs-{key}">{q}</label>'
            f'<div class="sl__ctl"><span class="sl__end">Less</span><input class="sl__range" id="cfs-{key}" type="range" min="0" max="{len(plans)-1}" step="1" value="{start}"><span class="sl__end">More</span></div>'
            f'<div class="sl__ticks">{ticks}</div><div class="sl__card is-inc"><p class="sl__price"><span data-cfs-p></span><span class="sl__per" data-cfs-per></span><s class="cfs__was" data-cfs-was></s></p><p class="sl__for" data-cfs-f></p><dl class="sl__rows" data-cfs-rows></dl></div></div>')
brain=slider('brain','AI Brain','How much should your AI Brain read?',BRAIN,0)
care=slider('care','Updates and support','How much help does your team need?',CARE,0)
inc=''.join(f'<li>{CHECK}<span><span class="pk2__pp">{v}</span>{t}</span></li>' for t,v in [
 ('The indie.box AI server','<s>€5,999</s> <b>€4,999</b>'),
 ('Two-day setup and getting-started workshop','<s>€3,000</s> <b>€1,500</b>'),
 ('Two custom apps built for your team','<s>€3,000</s> <b>€1,500</b>'),
 ('12 months of Standard support','<s>€1,788</s> <b>Free</b>'),
 ('The AI Brain, AI Agent Command Center and Agent Studio, preinstalled','<b>Included</b>'),
 ('The AI Brain, free plan: up to 1,000 pages and 150 questions a month','<b>Free</b>')])
cinc=''.join(f'<li>{CHECK}<span>{t}</span></li>' for t in ['Choose your device','Two-day setup and getting-started workshop with two custom apps, €3,000','Choose your AI Brain plan and support'])
TRIAL="Free shipping to your office. We set the workshop dates with you after you order."
B=f'''<section class="acc-chapter acc-pricing" id="pricing"> <div class="container"> <div class="acc-chapter__text acc-chapter__text--wide" data-animate="fade-up"> <h2 class="section-title">Get an AI Brain<br><span class="accent">for your company.</span></h2> <p class="acc-sub">Take the starter bundle, or customize your own setup.</p> </div>
<div class="pk2" data-animate="fade-up">
 <div class="pk2__card pk2__card--main">
  <div class="pk2__img"><img src="{IMG}indie-box_cut.webp?v=5" alt="The indie.box" loading="lazy"></div>
  <div class="pk2__head"><h3 class="pk2__title">Starter bundle</h3><p class="pk2__price"><s>€13,787</s> €7,999 <span>Net, plus VAT</span></p></div>
  <p class="pk2__badge">Introductory offer: you save €5,788</p>
  <ul class="pk2__inc">{inc}</ul>
  <a href="@@ROOT@@en/buy-starter-bundle/" class="pk2__cta">Buy now <span aria-hidden="true">→</span></a>
  <ul class="trust"><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>Free shipping within Germany</li><li data-trust-stock><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>In stock, delivery in 3 to 5 working days</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>14-day money-back guarantee</li></ul>
 </div>
 <div class="pk2__row">
  <div><h3 class="pk2__rowt">Customize</h3><p class="pk2__rowd">Pick your device, workshop and plans yourself.</p></div>
  <button type="button" class="pk2__cta pk2__cta--ghost" data-cfg-open aria-expanded="false" aria-controls="cfg-custom">Customize <span aria-hidden="true">↓</span></button>
 </div>
</div>
<p class="pk2__help">Not ready to buy? <a href="@@ROOT@@en/request-a-trial/">Request a trial <span aria-hidden="true">→</span></a></p>
<div class="cfg" id="cfg-custom" data-cfg hidden>
 <div class="cfg__steps">
  <fieldset class="cfg__step" id="cfg-device"><legend class="cfg__h">Device. <span>Which one fits your team?</span></legend><div class="cfg__opts">{dev}</div><p class="cfg__more"><a href="@@ROOT@@en/devices-and-software/#indie-box">Compare the devices <span aria-hidden="true">→</span></a></p></fieldset>
  <fieldset class="cfg__step"><legend class="cfg__h">Setup workshop. <span>Recommended.</span></legend><div class="cfg__opts">{setup}</div></fieldset>
  <div class="cfg__step"><h3 class="cfg__h">AI Brain and support. <span>Billed monthly or yearly.</span></h3><div class="cfg__bill" role="radiogroup" aria-label="Billing"><label><input type="radio" name="billing" value="month" checked><span>Monthly</span></label><label><input type="radio" name="billing" value="year"><span>Annual <em>2 months free</em></span></label></div></div>
  <div class="cfg__step">{brain}<div class="ap__page"><p data-cfg-fit><b>What fits in this plan?</b> Enough to try it out on a small set of documents, before you connect more.</p><p class="ap__page-s">One page is about 500 words of text, about the same as an email, one page of a PDF or Word file, one presentation slide, or a small Excel sheet.</p></div></div>
  <div class="cfg__step">{care}<p class="cfg__note">Support runs Monday to Friday, 8 am to 5 pm CET. Free replacement and repair cover defects only. Damage caused in use, like a drop or a spill, is not covered. We can still repair it, but you pay for the repair.</p></div>
 </div>
 <aside class="cfg__sum" id="cfg-sum" aria-live="polite">
  <p class="cfg__sumh">Your price</p>
  <p class="cfg__deal2" data-cfg-bundle hidden><b>Starter bundle.</b> You save €5,788.</p>
  <ul class="cfg__lines" data-cfg-lines></ul>
  <div class="cfg__tot"><div><span>One-time</span><strong data-cfg-once>€7,999</strong></div><div><span data-cfg-per>Monthly</span><strong data-cfg-month>€0</strong></div></div>
  <p class="cfg__fine">Net, plus VAT.</p>
  <p class="cfg__need" data-cfg-need hidden></p>
  <a href="@@ROOT@@en/buy-starter-bundle/" class="cfg__cta" data-cfg-cta>Buy now <span aria-hidden="true">→</span></a>
  <ul class="trust"><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>Free shipping within Germany</li><li data-trust-stock><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>In stock, delivery in 3 to 5 working days</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>14-day money-back guarantee</li></ul>
 </aside>
</div>
<div class="cfg__bar" data-cfg-bar hidden><div><span>One-time</span><strong data-cfg-once>€7,999</strong></div><div><span data-cfg-per>Monthly</span><strong data-cfg-month>€0</strong></div><a href="#cfg-sum" class="cfg__barbtn" data-cfg-jump>Review</a></div>
 </div> </section>'''
open(R+'neu/bbx/options/pricing-option-b.html','w').write(B)
print('ok',len(B))
