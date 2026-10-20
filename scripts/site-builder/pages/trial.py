# Request a trial: a short form. Until the server side is set up, it opens a prepared email.
import sys; sys.path.insert(0, sys.argv[1])
from common import *
def field(name,label,typ='text',req=False,auto='',ph=''):
    r=' required' if req else ''
    star=' <span class="tf__req" aria-hidden="true">*</span>' if req else ''
    a=f' autocomplete="{auto}"' if auto else ''
    p=f' placeholder="{ph}"' if ph else ''
    return f'<label class="tf__field"><span class="tf__label">{label}{star}</span><input class="tf__input" type="{typ}" name="{name}"{r}{a}{p}></label>'
def select(name,label,opts,req=False):
    r=' required' if req else ''
    star=' <span class="tf__req" aria-hidden="true">*</span>' if req else ''
    o='<option value="" disabled selected>Choose</option>'+''.join(f'<option>{x}</option>' for x in opts)
    return f'<label class="tf__field"><span class="tf__label">{label}{star}</span><select class="tf__input" name="{name}"{r}>{o}</select></label>'
form=('<form class="tf" data-trial-form data-type="trial" novalidate><label class="tf__hp" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>'
  '<div class="tf__grid">'
  +field('name','Your name',req=True,auto='name')
  +field('company','Company',req=True,auto='organization')
  +field('email','Work email','email',req=True,auto='email')
  +field('phone','Phone','tel',auto='tel')
  +select('role','Your role',['Managing director or owner','IT','Department lead','Other'])
  +select('industry','Industry',['Engineering and Manufacturing','Education','Clinic and Elder Care','Other'],req=True)
  +select('team','Company size',['Under 50 employees','50 to 250','250 to 1,000','Over 1,000'],req=True)
  +select('start','When would you like to start?',['Now','In 3 months','This year','Just exploring'])
  +field('country','Country','text',auto='country-name')
  +select('source','How did you hear about us?',['Referral','Webinar','KI am Werk','Search','LinkedIn','Other'])
  +'<div class="tf__field tf__field--full tf__sel" data-sel hidden><span class="tf__label">What you looked at</span><ul class="tf__sel-list"></ul><input type="hidden" name="device"></div>'
  +'<label class="tf__field tf__field--full"><span class="tf__label">What should your AI Brain help with?</span><textarea class="tf__input tf__area" name="message" rows="5" placeholder="For example: finding answers in old projects, preparing quotes, or onboarding new colleagues."></textarea></label>'
  +'</div>'
  '<label class="tf__consent"><input type="checkbox" name="consent" required> <span>I agree that brainbot GmbH, the company behind indie.solutions, may use these details to contact me about my trial. See our <a href="@@ROOT@@en/legal/privacy/">privacy policy</a>.</span></label>'
  '<p class="tf__error" role="alert" hidden>Please fill in the fields marked with an asterisk.</p>'
  '<button class="btn btn--filled btn--xl btn--hero-cta tf__submit" type="submit"><span class="btn__label">Request a trial <span class="arrow">→</span></span></button>'
  '</form>'
  '<div class="tf__done" hidden><h3 class="tf__done-h">Thank you.</h3><p>We have your request. The brainbot team will get in touch to plan your trial.</p></div>')
steps=[('Tell us about your team','Fill in the form. It takes about two minutes.'),('The brainbot team gets in touch','brainbot is the company behind indie.solutions. We talk through what your team needs and which setup fits.'),('Your trial starts','You get access to a web portal and try the AI Brain with your own questions.')]
side=('<div class="tf__side"><p class="tf__side-h">What happens next</p><ol class="tf__steps">'
      +''.join(f'<li><span class="tf__num">{i}</span><div><p class="tf__st">{t}</p><p class="tf__sd">{d}</p></div></li>' for i,(t,d) in enumerate(steps,1))
      +'</ol></div>')
body=section('trial', head('Request a trial.',None,"Tell us a little about your team. We'll send you access to a web portal where your team can try the AI Brain, and talk through which setup fits.")
   +f'<div class="tf__wrap"><div class="tf__card">{form}</div>{side}</div>', white=True)
open(sys.argv[2],'w',encoding='utf-8').write(body)
