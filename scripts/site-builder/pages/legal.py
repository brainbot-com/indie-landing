# Legal pages (imprint, privacy policy, terms) in the new design. Text carried over from the old indie.box pages.
import sys,re; sys.path.insert(0, sys.argv[1])
from common import *
src,out,title,flag=sys.argv[2],sys.argv[3],sys.argv[4],sys.argv[5]
s=open(src,encoding='utf-8').read()
m=re.search(r'<div class="legal-content">([\s\S]*)</div>\s*</(?:section|main)>',s) or re.search(r'<div class="legal-content">([\s\S]*?)</main>',s)
body=m.group(1)
status=re.search(r'(Status|Stand):\s*([^<]+)<',s)
# keep only simple tags, drop old classes and wrappers
body=re.sub(r'<(/?)(section|div)[^>]*>','',body)
body=re.sub(r'\s(class|id|style)="[^"]*"','',body)
body=re.sub(r'<a href="(?:\.\./)*(?:en/)?(index|impressum|privacy|datenschutz|terms)\.html[^"]*"[^>]*>(.*?)</a>',r'\2',body)
body=body.replace('Brainbot GmbH','brainbot GmbH').replace('brainbot gmbh','brainbot GmbH')
body=re.sub(r'\n\s*\n+','\n',body).strip()
st=f'<p class="lg__status">{status.group(1)}: {status.group(2).strip()}</p>' if status else ''
fl=f'<span class="todo-flag lg__flag">TO CHECK: {flag}</span>' if flag else ''
html=section('legal','<div class="lg" data-animate="fade-up"><h1 class="section-title lg__title">'+title+'</h1>'+st+fl+'<div class="lg__body">'+body+'</div></div>', white=True)
open(out,'w',encoding='utf-8').write(html)
