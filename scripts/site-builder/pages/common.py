# Shared bits for the product pages (written into neu/pages/*.html, built by build_human.py).
def H(t, accent=None):
    return f'<h2 class="section-title">{t}' + (f'<br><span class="accent">{accent}</span>' if accent else '') + '</h2>'
def head(t, accent=None, sub=None):
    return ('<div class="acc-chapter__text acc-chapter__text--wide" data-animate="fade-up">' + H(t, accent)
            + (f'<p class="acc-sub">{sub}</p>' if sub else '') + '</div>')
def section(id_, inner, white=False, extra=''):
    cls='acc-chapter'+(' acc-chapter--white' if white else '')+extra
    return f'<section class="{cls}" id="{id_}"><div class="container">{inner}</div></section>\n'
def faq(items, show=5):
    out=''
    for i,(q,a) in enumerate(items):
        more='' if i<show else ' hidden data-faq-more'
        out+=(f'<details class="acc-faq__item"{more}> <summary class="acc-faq__q"> <span>{q}</span> <span class="acc-faq__icon" aria-hidden="true"></span> </summary>'
              f' <div class="acc-faq__a"> <p>{a}</p> </div> </details>')
    btn=f' <button type="button" class="btn acc-faq__more" data-faq-toggle> Show all questions ({len(items)}) </button>' if len(items)>show else ''
    return f'<div class="acc-faq" data-animate="fade-up">{out}</div>{btn}'
def ctas():
    return ('<div class="acc-cta-pair acc-cta-mid" data-animate="fade-up"><a href="@@TRIAL@@" class="btn btn--filled btn--xl btn--hero-cta"> <span class="btn__label">Request a trial <span class="arrow">→</span></span> </a> '
            '<a href="@@WEBINAR@@" class="btn btn--lg acc-demo-btn">Join a webinar <span class="arrow" aria-hidden="true">→</span></a></div>')
SV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'
CHECK=SV+'<path d="M5 12.5l4.2 4.2L19 7"/></svg>'
def card(icon_path, title, desc, n=1):
    return (f'<div class="acc-feature" data-animate="fade-up" data-stagger="{n}"><span class="acc-step__icon acc-benefit__icon" aria-hidden="true">{SV}{icon_path}</svg></span>'
            f'<h3 class="acc-benefit__title">{title}</h3><p class="acc-benefit__desc">{desc}</p></div>')
def specs(rows):
    return '<dl class="pg-specs">'+''.join(f'<div><dt>{a}</dt><dd>{b}</dd></div>' for a,b in rows)+'</dl>'
