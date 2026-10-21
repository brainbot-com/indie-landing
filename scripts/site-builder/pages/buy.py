# Buy now: an order form like the earlier indie.box checkout, next to a summary of what was chosen (the starter
# bundle, or the setup from Customize, which replaces the summary). Payment is not connected yet, so the order
# arrives as a lead with every field in the message; the team confirms it and sends the invoice.
import sys; sys.path.insert(0, sys.argv[1])
from common import *
def field(name,label,typ='text',req=False,auto='',full=False,extra=''):
    r=' required' if req else ''; star=' <span class="tf__req" aria-hidden="true">*</span>' if req else ''
    a=f' autocomplete="{auto}"' if auto else ''
    return f'<label class="tf__field{" tf__field--full" if full else ""}"><span class="tf__label">{label}{star}</span><input class="tf__input" type="{typ}" name="{name}"{r}{a}{extra}></label>'
TRUCK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>'

# 4. The order form
CHK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>'
items=[('The indie.box AI server','<s>€5,999</s> €4,999'),('Two-day setup and getting-started workshop','<s>€3,000</s> €1,500'),
       ('Two custom apps built for your team','<s>€3,000</s> €1,500'),('12 months of Standard support','<s>€1,788</s> Free'),
       ('The AI Brain, AI Agent Command Center and Agent Studio, preinstalled','Included'),('The AI Brain, free plan: up to 1,000 pages and 150 questions a month','Free')]
# The order summary, set out like a formal order: value, discount, net total, VAT and the total with VAT.
# Replaced by the setup chosen in Customize when the page is opened from there.
def money(rows): return '<dl class="ob__sum">'+''.join(f'<div{c}><dt>{k}</dt><dd>{v}</dd></div>' for k,v,c in rows)+'</dl>'
summary=('<div class="ob" data-ob><div class="ob__head ob__head--img"><img src="@@ROOT@@assets/indie-solutions/cutouts/indie-box_cut.webp?v=5" alt=""><div><p class="ob__t">Starter bundle</p><p class="ob__sub">Your AI Brain for your company</p></div></div>'
         '<ul class="ob__list">'+''.join(f'<li>{CHK}<span>{t}</span><em>{v}</em></li>' for t,v in items)+'</ul>'
         +money([('Value','€13,787',''),('Introductory offer','−€5,788',' class="is-save"'),('Total, net','€7,999',' class="is-total"'),('VAT (19%)','€1,519.81',''),('Total with VAT','€9,518.81',' class="is-gross"')])+'</div>'
         +'<ul class="trust"><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>Free shipping within Germany</li><li data-trust-stock><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>In stock, delivery in 3 to 5 working days</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>14-day money-back guarantee</li></ul>')
# A way to ask, under the summary.
proof='<p class="co-ask">Questions about your order? <a href="@@ROOT@@en/talk-to-us/">Talk to us <span aria-hidden="true">→</span></a></p>'
pay=''.join(f'<label class="co-pay"><input type="radio" name="payment" value="{v}"{" checked" if i==0 else ""}><span><b>{t}</b><small>{d}</small></span></label>'
            for i,(v,t,d) in enumerate([('Invoice','Invoice','Pay by bank transfer after we send the invoice.'),('Card','Credit card','Visa, Mastercard and other cards.'),('PayPal','PayPal','Pay with your PayPal account.')]))
form=('<form class="tf co-form" data-trial-form data-type="order" data-pack data-subject="Starter bundle order" novalidate><label class="tf__hp" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>'
  '<input type="hidden" name="device" value="ORDER: Starter bundle, EUR 7,999 net">'
  '<p class="co-note">We currently deliver within Germany only.</p>'
  '<h3 class="co-h">Contact details</h3><div class="tf__grid">'
  +field('first','First name',req=True,auto='given-name')+field('last','Last name',req=True,auto='family-name')
  +field('email','Email','email',req=True,auto='email')+field('phone','Phone','tel',auto='tel')+'</div>'
  '<label class="co-check"><input type="checkbox" data-reveal="co-company"> <span>Order as a company</span></label>'
  '<div class="tf__grid" id="co-company" hidden>'+field('company','Company',req=True,auto='organization')+field('vat','VAT ID')+'</div>'
  '<h3 class="co-h">Billing address</h3><div class="tf__grid">'
  +field('street','Street and house number',req=True,auto='address-line1',full=True)
  +field('postal','Postal code',req=True,auto='postal-code')+field('city','City',req=True,auto='address-level2')
  +field('country','Country',extra=' value="Germany" readonly')+'</div>'
  '<label class="co-check"><input type="checkbox" data-reveal="co-ship"> <span>Deliver to a different address</span></label>'
  '<div class="tf__grid" id="co-ship" hidden>'+field('ship_co','c/o',full=True)
  +field('ship_street','Street and house number',req=True,full=True)+field('ship_postal','Postal code',req=True)+field('ship_city','City',req=True)
  +field('ship_country','Country',extra=' value="Germany" readonly')+'</div>'
  '<h3 class="co-h">Notes</h3><label class="tf__field tf__field--full"><span class="tf__label">Notes on delivery or setup</span><textarea class="tf__input tf__area" name="message" rows="3" placeholder="For example: a purchase order number, or when you would like the workshop."></textarea></label>'
  '<h3 class="co-h">Payment</h3><div class="co-pays" role="radiogroup" aria-label="Payment">'+pay+'</div>'
  '<label class="tf__consent"><input type="checkbox" name="consent" required> <span>I have read and accept the <a href="@@ROOT@@en/legal/terms/">Terms</a>. See our <a href="@@ROOT@@en/legal/privacy/">privacy policy</a>. <span class="tf__req" aria-hidden="true">*</span></span></label>'
  '<p class="tf__error" role="alert" hidden>Please fill in the fields marked with an asterisk.</p>'
  '<button class="btn btn--filled btn--xl btn--hero-cta tf__submit" type="submit"><span class="btn__label">Send order <span class="arrow">→</span></span></button>'
  '<p class="co-fine">We confirm your order and send the invoice, then ship your device and plan the workshop with you. * Required fields</p>'
  '</form>'
  '<div class="tf__done" hidden><h3 class="tf__done-h">Thank you.</h3><p>We have your order. The brainbot team will confirm it, send the invoice and plan your two-day workshop with you.</p></div>')
body=section('buy', head('Get your AI Brain.',None,"Fill in your details, and we'll confirm your order and send the invoice.")
   +f'<div class="co-wrap"><div class="tf__card">{form}</div><div class="co-side">{summary}{proof}</div></div>', white=True)
open(sys.argv[2],'w',encoding='utf-8').write(body)
