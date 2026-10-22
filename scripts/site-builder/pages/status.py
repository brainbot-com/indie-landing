# Order status: Mollie sends the customer here after paying. The page asks the backend
# (GET /api/orders/status) and shows one of the states below; human.js picks the state.
import sys; sys.path.insert(0, sys.argv[1])
from common import *
def state(key, title, text, extra='', hidden=True):
    return f'<div class="os__state" data-os="{key}"{" hidden" if hidden else ""}><h2 class="section-title">{title}</h2><p class="acc-sub">{text}</p>{extra}</div>'
again='<div class="acc-cta-pair os__ctas"><a href="@@ROOT@@en/buy/" class="btn btn--filled btn--xl btn--hero-cta"><span class="btn__label">Try again <span class="arrow">→</span></span></a> <a href="@@ROOT@@en/talk-to-us/" class="btn btn--lg acc-demo-btn">Talk to us <span class="arrow" aria-hidden="true">→</span></a></div>'
home='<div class="acc-cta-pair os__ctas"><a href="@@ROOT@@en/industries/engineering/" class="btn btn--lg acc-demo-btn">Back to the site <span class="arrow" aria-hidden="true">→</span></a></div>'
body=section('order-status','<div class="os" data-order-status>'
  +state('checking','Checking your payment.','This takes a moment. Please keep this page open.',hidden=False)
  +state('paid','Thank you for your order.','Your payment went through. You will get a confirmation by email, and we will be in touch to plan delivery and the next steps.',home)
  +state('transfer','Your order is placed.','Mollie has emailed you the bank details. As soon as your transfer arrives, we confirm your order and plan delivery with you.',home)
  +state('failed','Your payment did not go through.','Nothing was charged. You can try again, or talk to us if something is unclear.',again)
  +state('missing','We could not find this order.','The link may be incomplete. Write to us at contact@brainbot.com, and we will look it up for you.',home)
  +'</div>', white=True)
open(sys.argv[2],'w',encoding='utf-8').write(body)
