# Request an AI Brain for another industry. Short on purpose.
import sys; sys.path.insert(0, sys.argv[1])
from common import *
exec(open(sys.argv[1]+'/trial.py',encoding='utf-8').read().split('form=(')[0].split('from common import *')[1])
form=('<form class="tf" data-trial-form data-type="industry" data-subject="Industry request" novalidate><label class="tf__hp" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>'
  '<div class="tf__grid">'
  +field('name','Your name',req=True,auto='name')
  +field('company','Company',req=True,auto='organization')
  +field('email','Work email','email',req=True,auto='email')
  +field('phone','Phone','tel',auto='tel')
  +select('role','Your role',['Managing director or owner','IT','Department lead','Other'])
  +field('industry','Your industry',req=True)
  +select('team','Company size',['Under 50 employees','50 to 250','250 to 1,000','Over 1,000'],req=True)
  +select('start','When would you like to start?',['Now','In 3 months','This year','Just exploring'])
  +field('country','Country','text',auto='country-name')
  +select('source','How did you hear about us?',['Referral','Webinar','KI am Werk','Search','LinkedIn','Other'])
  +'<label class="tf__field tf__field--full"><span class="tf__label">What do you need it for? <span class="tf__req" aria-hidden="true">*</span></span><textarea class="tf__input tf__area" name="message" rows="4" required></textarea></label>'
  +'</div>'
  '<label class="tf__consent"><input type="checkbox" name="consent" required> <span>I agree that brainbot may contact me about this request. <a href="@@ROOT@@en/legal/privacy/">Privacy policy</a></span></label>'
  '<p class="tf__error" role="alert" hidden>Please fill in the fields marked with an asterisk.</p>'
  '<button class="btn btn--filled btn--xl btn--hero-cta tf__submit" type="submit"><span class="btn__label">Send request <span class="arrow">→</span></span></button>'
  '</form>'
  '<div class="tf__done" hidden><h3 class="tf__done-h">Thank you.</h3><p>We will be in touch soon.</p></div>')
body=section('industry', head('Want an AI Brain for your industry?',None,'Tell us what you need it for. We will get in touch to learn about your requirements and see how we can set one up for you and your team.')
   +f'<div class="tf__wrap tf__wrap--single"><div class="tf__card">{form}</div></div>', white=True)
open(sys.argv[2],'w',encoding='utf-8').write(body)
