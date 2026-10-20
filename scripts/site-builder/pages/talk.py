# Talk to us: a short form for questions about the AI Brain, the devices or pricing.
# Sent as a "contact" lead; if the server cannot take it, the form opens a prepared email instead.
import sys; sys.path.insert(0, sys.argv[1])
from common import *
def field(name,label,typ='text',req=False,auto=''):
    r=' required' if req else ''; star=' <span class="tf__req" aria-hidden="true">*</span>' if req else ''
    a=f' autocomplete="{auto}"' if auto else ''
    return f'<label class="tf__field"><span class="tf__label">{label}{star}</span><input class="tf__input" type="{typ}" name="{name}"{r}{a}></label>'
def select(name,label,opts,req=False):
    r=' required' if req else ''; star=' <span class="tf__req" aria-hidden="true">*</span>' if req else ''
    o='<option value="" disabled selected>Choose</option>'+''.join(f'<option>{x}</option>' for x in opts)
    return f'<label class="tf__field"><span class="tf__label">{label}{star}</span><select class="tf__input" name="{name}"{r}>{o}</select></label>'
form=('<form class="tf" data-trial-form data-type="contact" data-subject="Question" novalidate><label class="tf__hp" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>'
  '<div class="tf__grid">'
  +field('name','Your name',req=True,auto='name')+field('company','Company',auto='organization')
  +field('email','Work email','email',req=True,auto='email')+field('phone','Phone','tel',auto='tel')
  +'<label class="tf__field tf__field--full"><span class="tf__label">What would you like to know? <span class="tf__req" aria-hidden="true">*</span></span><textarea class="tf__input tf__area" name="message" rows="5" required></textarea></label>'
  +'</div>'
  '<label class="tf__consent"><input type="checkbox" name="consent" required> <span>I agree that brainbot GmbH, the company behind indie.solutions, may use these details to answer my question. See our <a href="@@ROOT@@en/legal/privacy/">privacy policy</a>.</span></label>'
  '<p class="tf__error" role="alert" hidden>Please fill in the fields marked with an asterisk.</p>'
  '<button class="btn btn--filled btn--xl btn--hero-cta tf__submit" type="submit"><span class="btn__label">Send <span class="arrow">→</span></span></button>'
  '</form>'
  '<div class="tf__done" hidden><h3 class="tf__done-h">Thank you.</h3><p>We have your message, and someone from the brainbot team will get back to you.</p></div>')
side=('<div class="tf__side"><p class="tf__side-h">Prefer email?</p><p class="tf__sd">Write to us at <a href="mailto:contact@brainbot.com">contact@brainbot.com</a>.</p></div>')
body=section('talk', head('Talk to us.',None,"Ask us anything about the AI Brain, the devices or pricing, and we'll get back to you.")
   +f'<div class="tf__wrap"><div class="tf__card">{form}</div>{side}</div>', white=True)
open(sys.argv[2],'w',encoding='utf-8').write(body)
