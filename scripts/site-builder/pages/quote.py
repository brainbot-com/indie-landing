# Request a custom quote, for the indie.rack. The team plans the setup with the customer and sends a quote.
# Sent through the same lead form as the trial; the "device" field marks it as a quote request.
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
CHK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>'
# Replaced by the setup chosen in Customize when the page is opened from there.
summary=('<div class="ob" data-ob><div class="ob__head"><p class="ob__t">indie.rack</p><p class="ob__p">Custom quote</p></div>'
         '<p class="ob__d">Servers sized to the number of people who use them, from 100 to 1,000+.</p></div>')
form=('<form class="tf" data-trial-form data-type="trial" data-subject="Custom quote request" novalidate><label class="tf__hp" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>'
  '<input type="hidden" name="device" value="QUOTE: indie.rack">'
  '<div class="tf__grid">'
  +field('name','Your name',req=True,auto='name')+field('company','Company',req=True,auto='organization')
  +field('email','Work email','email',req=True,auto='email')+field('phone','Phone','tel',auto='tel')
  +select('industry','Industry',['Engineering and Manufacturing','Education','Clinic and Elder Care','Other'],req=True)
  +select('team','Company size',['Under 50 employees','50 to 250','250 to 1,000','Over 1,000'],req=True)
  +field('country','Country','text',auto='country-name')
  +'<label class="tf__field tf__field--full"><span class="tf__label">Anything we should know?</span><textarea class="tf__input tf__area" name="message" rows="4" placeholder="For example: how many people will use it, which systems it should connect to, or where the servers will go."></textarea></label>'
  +'</div>'
  '<label class="tf__consent"><input type="checkbox" name="consent" required> <span>I agree that brainbot GmbH, the company behind indie.solutions, may use these details to contact me about my request. See our <a href="@@ROOT@@en/legal/privacy/">privacy policy</a>.</span></label>'
  '<p class="tf__error" role="alert" hidden>Please fill in the fields marked with an asterisk.</p>'
  '<button class="btn btn--filled btn--xl btn--hero-cta tf__submit" type="submit"><span class="btn__label">Send request <span class="arrow">→</span></span></button>'
  '</form>'
  '<div class="tf__done" hidden><h3 class="tf__done-h">Thank you.</h3><p>We have your request. The brainbot team will get in touch to plan your setup with you and send you a quote.</p></div>')
steps=[('Send your request','Fill in the form. It takes about two minutes.'),('We plan it with you','We talk through how many people will use it and which systems it should connect to.'),('You get your quote','We size the servers to your needs and send you a quote.')]
side=('<div class="tf__side">'+summary+'<p class="tf__side-h">What happens next</p><ol class="tf__steps">'
      +''.join(f'<li><span class="tf__num">{i}</span><div><p class="tf__st">{t}</p><p class="tf__sd">{d}</p></div></li>' for i,(t,d) in enumerate(steps,1))
      +'</ol></div>')
body=section('quote', head('Request a custom quote.',None,"Tell us about your organization, and we'll plan your indie.rack with you and send you a quote.")
   +f'<div class="tf__wrap"><div class="tf__card">{form}</div>{side}</div>', white=True)
open(sys.argv[2],'w',encoding='utf-8').write(body)
