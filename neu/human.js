/* Page language: German pages get German messages. */
const DE = document.documentElement.lang === 'de';
// Interactions for the human-centered pages (/en/neu/, /en/industries/).
// Everything works without JavaScript: doors are plain links, all story
// panels are readable, and reveal animations only apply once this runs.
(function () {
  document.documentElement.classList.add('hm-js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover)').matches;

  // ---- Industry doors: hover, focus or tap widens a door and shows its story.
  // On touch screens the first tap opens a door, the second follows its link.
  document.querySelectorAll('[data-doors]').forEach((group) => {
    const doors = Array.from(group.querySelectorAll('.door'));
    const live = document.querySelector(group.dataset.live || '');
    const activate = (door) => {
      doors.forEach((d) => d.classList.toggle('is-active', d === door));
      if (live) live.textContent = door.dataset.problem || '';
    };
    doors.forEach((door) => {
      if (canHover) door.addEventListener('mouseenter', () => activate(door));
      door.addEventListener('focus', () => activate(door));
      door.addEventListener('click', (e) => {
        const soon = door.getAttribute('aria-disabled') === 'true';
        if (!door.classList.contains('is-active') && !canHover) { e.preventDefault(); activate(door); return; }
        if (soon) e.preventDefault();
      });
    });
  });

  // ---- Before / after switch (tabs with two panels).
  document.querySelectorAll('[data-ba]').forEach((ba) => {
    const tabs = Array.from(ba.querySelectorAll('.ba__tab'));
    const panels = Array.from(ba.querySelectorAll('.ba__panel'));
    const show = (state, focus) => {
      tabs.forEach((t) => {
        const on = t.dataset.state === state;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      panels.forEach((p) => { p.hidden = p.dataset.state !== state; });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(t.dataset.state, false));
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        show(tabs[(i + 1) % tabs.length].dataset.state, true);
      });
    });
  });

  // ---- Story picker on industry pages: one scenario at a time.
  document.querySelectorAll('[data-stories]').forEach((root) => {
    const picks = Array.from(root.querySelectorAll('.ip-stories__pick'));
    const panels = Array.from(root.querySelectorAll('.ip-stories__panel'));
    const select = (i, focus) => {
      picks.forEach((p, j) => {
        p.setAttribute('aria-selected', j === i ? 'true' : 'false');
        p.tabIndex = j === i ? 0 : -1;
      });
      panels.forEach((p, j) => { p.hidden = j !== i; });
      if (focus) picks[i].focus();
    };
    picks.forEach((p, i) => {
      p.addEventListener('click', () => select(i, false));
      p.addEventListener('keydown', (e) => {
        const next = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!next) return;
        e.preventDefault();
        select((i + next + picks.length) % picks.length, true);
      });
    });
  });

  // ---- AI Brain hero: cycle through example questions while it's on screen.
  document.querySelectorAll('[data-brain]').forEach((g) => {
    let items; try { items = JSON.parse(g.dataset.brain); } catch (e) { return; }
    if (reduceMotion || items.length < 2) return;
    const q = g.querySelector('[data-q]'), a = g.querySelector('[data-a]'), s = g.querySelector('[data-s]');
    let i = 0, timer = null, visible = false;
    const wait = (ms) => new Promise((r) => { timer = setTimeout(r, ms); });
    const cycle = async () => {
      while (visible) {
        await wait(5200); if (!visible) break;
        g.classList.add('is-swapping'); await wait(500);
        i = (i + 1) % items.length;
        q.textContent = items[i].q; a.textContent = items[i].a;
        s.innerHTML = ''; items[i].s.forEach((t) => { const el = document.createElement('span'); el.className = 'brain-g__src'; el.textContent = t; s.appendChild(el); });
        g.classList.remove('is-swapping'); g.classList.add('is-asking');
        await wait(900); g.classList.add('is-thinking');
        await wait(900); g.classList.remove('is-asking', 'is-thinking');
      }
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((en) => {
        const now = en[0].isIntersecting;
        if (now && !visible) { visible = true; cycle(); }
        if (!now) { visible = false; clearTimeout(timer); }
      }, { threshold: 0.3 }).observe(g);
    }
  });

  // ---- Tabs ([data-tabs] with role="tab" buttons and role="tabpanel" panels).
  document.querySelectorAll('[data-tabs]').forEach((root) => {
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
    const select = (i, focus) => {
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); t.tabIndex = j === i ? 0 : -1; });
      panels.forEach((p, j) => { p.hidden = j !== i; });
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i, false));
      t.addEventListener('keydown', (e) => {
        const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (!step) return;
        e.preventDefault(); select((i + step + tabs.length) % tabs.length, true);
      });
    });
  });

  // ---- Package picker: choose a device, see its price and what's included.
  // Without JavaScript all four devices stay visible.
  document.querySelectorAll('[data-pick]').forEach((root) => {
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
    const hw = root.querySelector('[data-pick-hw]');
    root.classList.add('is-live');
    const select = (i, focus) => {
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); t.tabIndex = j === i ? 0 : -1; });
      panels.forEach((p, j) => { p.hidden = j !== i; });
      if (hw) hw.textContent = tabs[i].dataset.hw;
      const pkg = root.querySelector('[data-pick-pkg]'), nm = tabs[i].querySelector('.acc-pick__tabname');
      if (pkg && nm) pkg.textContent = nm.textContent;
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i, false));
      t.addEventListener('keydown', (e) => {
        const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (!step) return;
        e.preventDefault(); select((i + step + tabs.length) % tabs.length, true);
      });
    });
    select(Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')), false);
  });

  // ---- Device cards flip over to show their specs. Click the card or its button.
  document.querySelectorAll('[data-flip]').forEach((card) => {
    const open = card.querySelector('.acc-flip__front .acc-flip__btn');
    const back = card.querySelector('.acc-flip__btn--back');
    const set = (on, focus) => {
      card.classList.toggle('is-flipped', on);
      open.setAttribute('aria-expanded', on ? 'true' : 'false');
      card.querySelector('.acc-flip__front').inert = on;
      card.querySelector('.acc-flip__back').inert = !on;
      if (focus) (on ? back : open).focus();
    };
    set(false, false);
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      set(!card.classList.contains('is-flipped'), !!e.target.closest('button'));
    });
  });
  // Switching device turns any flipped card back to the front.
  document.querySelectorAll('[data-pick] [role="tab"]').forEach((t) => {
    t.addEventListener('click', () => {
      t.closest('[data-pick]').querySelectorAll('[data-flip].is-flipped').forEach((c) => c.querySelector('.acc-flip__btn--back').click());
    });
  });

  // ---- Package picker: the whole card flips to the chosen device's full specs.
  document.querySelectorAll('[data-flip-card]').forEach((card) => {
    const root = card.closest('[data-pick]');
    const front = card.querySelector('.acc-pick__front');
    const back = card.querySelector('.acc-pick__back');
    const backBtn = back.querySelector('.acc-pick__specbtn--back');
    const flip = (on, focus) => {
      card.classList.toggle('is-flipped', on);
      front.inert = on; back.inert = !on;
      card.querySelectorAll('.acc-pick__front .acc-pick__specbtn').forEach((b) => b.setAttribute('aria-expanded', on ? 'true' : 'false'));
      if (focus) { const t = on ? backBtn : root.querySelector('.acc-pick__panel:not([hidden]) .acc-pick__specbtn'); if (t) t.focus(); }
    };
    const showSpec = () => {
      const t = root.querySelector('[role="tab"][aria-selected="true"]');
      const key = t ? t.id.replace('pick-tab-', '') : '';
      back.querySelectorAll('[data-spec]').forEach((sp) => { sp.hidden = sp.dataset.spec !== key; });
    };
    card.addEventListener('click', (e) => {
      const b = e.target.closest('.acc-pick__specbtn');
      if (!b) return;
      flip(!b.classList.contains('acc-pick__specbtn--back'), true);
    });
    root.querySelectorAll('[role="tab"]').forEach((t) => t.addEventListener('click', () => { flip(false, false); showSpec(); }));
    flip(false, false); showSpec();
  });

  // ---- Stack walk: the layer you are reading lights up in the sticky diagram.
  document.querySelectorAll('[data-walk]').forEach((walk) => {
    const map = walk.querySelector('.pg-map');
    const steps = Array.from(walk.querySelectorAll('.pg-step'));
    const light = (id) => {
      map.querySelectorAll('[data-layer]').forEach((el) => el.classList.toggle('is-active', el.dataset.layer === id));
      const step = walk.querySelector('#layer-' + id);
      const group = step ? step.querySelector('.pg-step__group').textContent : '';
      map.querySelectorAll('[data-group]').forEach((g) => g.classList.toggle('is-current', g.dataset.group === group));
    };
    if (!('IntersectionObserver' in window)) return;
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => seen.set(en.target, en.isIntersecting ? en.intersectionRatio : 0));
      let best = null, top = Infinity;
      steps.forEach((s) => { if (seen.get(s) > 0) { const t = Math.abs(s.getBoundingClientRect().top - window.innerHeight * 0.3); if (t < top) { top = t; best = s; } } });
      if (best) light(best.dataset.layer);
    }, { rootMargin: '-25% 0px -45% 0px', threshold: [0, 0.01, 0.5, 1] });
    steps.forEach((s) => io.observe(s));
    light(steps[0].dataset.layer);
  });

  // ---- Interactive stack: click a layer, read what it does.
  document.querySelectorAll('[data-stackx]').forEach((root) => {
    const btns = Array.from(root.querySelectorAll('.pg-sx__btn'));
    const panels = Array.from(root.querySelectorAll('.pg-sx__panel'));
    const show = (id) => {
      btns.forEach((b) => { const on = b.dataset.layer === id; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      panels.forEach((p) => { p.hidden = p.dataset.panel !== id; });
    };
    // Phones: the explanation opens right under the tapped layer, like an accordion.
    const info = root.querySelector('.pg-sx__info');
    const mobile = window.matchMedia('(max-width: 1000px)');
    const place = (id) => {
      panels.forEach((p) => { if (!mobile.matches && p.parentNode !== info) info.appendChild(p); });
      if (!mobile.matches) return;
      const b = btns.find((x) => x.dataset.layer === id);
      const p = panels.find((x) => x.dataset.panel === id);
      if (b && p) b.insertAdjacentElement('afterend', p);
    };
    btns.forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.layer;
      if (mobile.matches && b.classList.contains('is-active')) {
        b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false');
        panels.forEach((p) => { p.hidden = true; });
        return;
      }
      place(id); show(id);
    }));
    mobile.addEventListener('change', () => { const a = btns.find((x) => x.classList.contains('is-active')); const id = a ? a.dataset.layer : 'brain'; place(id); show(id); });
    // Links like #indie-box open that device's details and scroll to the chart.
    const fromHash = () => {
      const m = location.hash.match(/^#(?:dev-)?indie-(box|booster|workstation|rack)$/);
      if (!m) return false;
      const id = 'dev-' + m[1];
      place(id); show(id);
      const b = btns.find((x) => x.dataset.layer === id);
      const go = () => { if (!b) return; const y = b.getBoundingClientRect().top + window.scrollY - (mobile.matches ? 90 : window.innerHeight / 3); window.scrollTo({ top: Math.max(0, y), behavior: 'auto' }); };
      if (document.readyState === 'complete') setTimeout(go, 60); else window.addEventListener('load', () => setTimeout(go, 120), { once: true });
      return true;
    };
    if (!fromHash()) { place('brain'); show('brain'); }
    window.addEventListener('hashchange', fromHash);
  });

  // ---- Prefill a select from the URL, like ?industry=Education on the notify form.
  const params = new URLSearchParams(location.search);
  document.querySelectorAll('[data-prefill]').forEach((sel) => {
    const want = params.get(sel.dataset.prefill);
    if (!want) return;
    Array.from(sel.options).forEach((o) => { if (o.value === want || o.text === want) sel.value = o.value; });
  });

  // ---- Webinar page: add colleagues, and share the page.
  document.querySelectorAll('[data-guests]').forEach((box) => {
    const list = box.querySelector('.wd-guests__list');
    const add = box.querySelector('[data-add-guest]');
    let n = 0;
    add.addEventListener('click', () => {
      if (list.children.length >= 5) return;
      n += 1;
      const row = document.createElement('label');
      row.className = 'wd-guests__row';
      row.innerHTML = '<span class="tf__label" hidden>' + (DE ? 'E-Mail der Kollegin oder des Kollegen' : 'Colleague email') + '</span><input class="tf__input" type="email" name="guest' + n + '" placeholder="' + (DE ? 'kollege@firma.de' : 'colleague@company.com') + '" autocomplete="off"><button type="button" class="wd-guests__x" aria-label="' + (DE ? 'Entfernen' : 'Remove') + '">×</button>';
      row.querySelector('button').addEventListener('click', () => { row.remove(); add.hidden = false; });
      list.appendChild(row);
      row.querySelector('input').focus();
      if (list.children.length >= 5) add.hidden = true;
    });
  });
  document.querySelectorAll('[data-share]').forEach((box) => {
    const url = location.origin + location.pathname;
    const li = box.querySelector('[data-share-li]');
    if (li) li.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
    const mail = box.querySelector('[data-share-mail]');
    if (mail) mail.href = mail.getAttribute('href') + '&body=' + encodeURIComponent('I thought you might like this webinar: ' + url);
    const copy = box.querySelector('[data-copy-link]');
    if (copy) copy.addEventListener('click', () => {
      const done = () => { copy.textContent = DE ? 'Link kopiert' : 'Link copied'; setTimeout(() => { copy.textContent = DE ? 'Link kopieren' : 'Copy link'; }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else done();
    });
  });

  // ---- Trial request form. Checks the required fields, then sends the request.
  // Until the server side is set up, it opens a prepared email to contact@brainbot.com.
  document.querySelectorAll('[data-trial-form]').forEach((form) => {
    const err = form.querySelector('.tf__error');
    const done = form.parentElement.querySelector('.tf__done');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = Array.from(form.querySelectorAll('[required]')).filter((f) => (f.type === 'checkbox' ? !f.checked : !f.value.trim()) || (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value)));
      form.querySelectorAll('.is-invalid').forEach((f) => f.classList.remove('is-invalid'));
      bad.forEach((f) => f.classList.add('is-invalid'));
      if (bad.length) { err.hidden = false; bad[0].focus(); return; }
      err.hidden = true;
      // Send to the server, which emails the team and opens a GitHub ticket.
      // If that fails, fall back to a prepared email so no request is lost.
      const data = { type: form.dataset.type || 'trial', page: location.pathname, consent: true, guests: [] };
      form.querySelectorAll('input[name], select[name], textarea[name]').forEach((f) => {
        if (f.type === 'checkbox' || (f.type === 'radio' && !f.checked) || f.closest('[hidden]')) return;
        if (/^guest\d+$/.test(f.name)) { if (f.value.trim()) data.guests.push(f.value.trim()); return; }
        data[f.name] = f.value.trim();
      });
      if (!data.name && data.first) data.name = (data.first + ' ' + (data.last || '')).trim();
      const lines = [];
      form.querySelectorAll('input[name], select[name], textarea[name]').forEach((f) => {
        if (f.type === 'checkbox' || f.type === 'hidden' || f.name === 'website' || (f.type === 'radio' && !f.checked) || f.closest('[hidden]')) return;
        const lab = f.closest('label') && f.closest('label').querySelector('.tf__label');
        const name = lab ? lab.textContent.replace('*', '').trim() : f.name;
        const val = (f.value || '').trim() || '-';
        lines.push(f.tagName === 'TEXTAREA' ? '\n' + name + '\n' + val : name + ': ' + val);
      });
      if (data.webinar) lines.unshift('Webinar: ' + data.webinar);
      if (data.device) lines.unshift((DE ? 'Angesehen: ' : 'Looked at: ') + data.device);
      /* Order forms send every field (address, VAT ID, payment) in the message, since the lead form has no
         columns for them yet. */
      if ('pack' in form.dataset) data.message = lines.join('\n');
      const subject = (form.dataset.subject || 'Trial request') + ': ' + (data.company || data.industry || data.email || '');
      const mailto = 'mailto:contact@brainbot.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      const btn = form.querySelector('[type=submit]'); if (btn) btn.disabled = true;
      fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then((r) => { if (!r.ok) throw new Error('send failed'); })
        .catch(() => { window.location.href = mailto; })
        .finally(() => { form.hidden = true; if (done) done.hidden = false; });
      return;
      form.hidden = true; if (done) done.hidden = false;
    });
  });

  // ---- Click-to-play YouTube: the player (youtube-nocookie) loads only on press.
  document.querySelectorAll('[data-yt]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + btn.dataset.yt + '?start=' + (btn.dataset.start || 0) + '&autoplay=1&rel=0';
      f.title = btn.getAttribute('aria-label') || 'Video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      btn.replaceWith(f);
    });
  });

  // ---- FAQ: questions past the first few stay hidden until "show all".
  document.querySelectorAll('[data-faq-toggle]').forEach((btn) => {
    const list = btn.previousElementSibling;
    btn.addEventListener('click', () => {
      const more = list.querySelectorAll('[data-faq-more]');
      more.forEach((el) => { el.hidden = false; });
      btn.remove();
      const first = more[0] && more[0].querySelector('summary');
      if (first) first.focus();
    });
  });

  // ---- The floating contact bar is redundant once the contact form is on screen.
  const pill = document.querySelector('.sticky-pill');
  const contactEl = document.getElementById('contact');
  if (pill && contactEl && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((en) => pill.classList.toggle('hm-pill-off', en.isIntersecting));
    }, { threshold: 0.15 }).observe(contactEl);
  }

  // ---- Looping videos: no motion for visitors who ask for less.
  document.querySelectorAll('.phero__video, .bento__video, .acc-brain__video').forEach((v) => {
    if (reduceMotion) { v.removeAttribute('autoplay'); v.pause(); }
  });

  // ---- Short YouTube loop: jump back to the start of the segment every few seconds.
  document.querySelectorAll('iframe[data-yt-loop]').forEach((f) => {
    const start = Number(f.dataset.ytLoop), len = Number(f.dataset.ytLen || 15) * 1000;
    const send = (func, args) => f.contentWindow && f.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: args || [] }), '*');
    f.addEventListener('load', () => {
      send('mute'); send('playVideo');
      setInterval(() => { send('seekTo', [start, true]); send('playVideo'); }, len);
    });
  });

  // ---- Header dropdowns (Industries). On desktop, hovering already opens the menu, so a
  // click must not toggle it shut again. Clicking the button only ever opens it there.
  const desktopNav = window.matchMedia('(hover: hover) and (min-width: 769px)');
  document.querySelectorAll('.nav-item[data-dropdown]').forEach((item) => {
    const btn = item.querySelector('.nav-drop-btn');
    if (!btn) return;
    item.addEventListener('click', (e) => {
      if (!desktopNav.matches || !btn.contains(e.target)) return;
      e.stopImmediatePropagation();
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }, true);
  });

  // ---- Gentle scroll reveal.
  const items = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  items.forEach((el) => io.observe(el));
})();


/* Package list on phones: tap a heading to read its details. */
(function () {
  document.querySelectorAll('.acc-pick__list li').forEach((li) => {
    const t = li.querySelector('.acc-pick__t');
    if (!t) return;
    t.setAttribute('role', 'button'); t.tabIndex = 0;
    const flip = () => li.classList.toggle('is-open');
    t.addEventListener('click', flip);
    t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  });
})();

/* Phones: open the full labeled Command Center screenshot as a full-screen view. */
(function () {
  const btn = document.querySelector('[data-ccfull]');
  const fig = document.querySelector('.acc-dash--out');
  if (!btn || !fig || typeof HTMLDialogElement === 'undefined') { if (btn) btn.hidden = true; return; }
  let dlg;
  btn.addEventListener('click', () => {
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'ccfull';
      dlg.setAttribute('aria-label', DE ? 'Das ganze AI Agent Command Center' : 'The full AI Agent Command Center');
      dlg.innerHTML = '<button class="ccfull__close" type="button" aria-label="' + (DE ? 'Schließen' : 'Close') + '">×</button><p class="ccfull__hint">' + (DE ? 'Drehen Sie Ihr Handy für eine größere Ansicht.' : 'Turn your phone sideways for a bigger view.') + '</p><div class="ccfull__stage"></div>';
      const copy = fig.cloneNode(true);
      copy.removeAttribute('data-animate');
      copy.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; });
      dlg.querySelector('.ccfull__stage').appendChild(copy);
      btn.after(dlg);
      dlg.querySelector('.ccfull__close').addEventListener('click', () => dlg.close());
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    }
    dlg.showModal();
  });
})();

/* Plans after 12 months: always open on desktop, behind "Compare plans" on phones. */
(function () {
  const d = document.querySelector('.after1__cmp');
  if (!d) return;
  const mq = matchMedia('(min-width: 761px)');
  const sync = () => { if (mq.matches) d.open = true; };
  sync();
  mq.addEventListener ? mq.addEventListener('change', sync) : mq.addListener(sync);
})();

/* Plan sliders: drag from less to more and the plan card updates. */
(function () {
  document.querySelectorAll('[data-slider]').forEach((root) => {
    const plans = JSON.parse(root.dataset.plans);
    const inc = +root.dataset.inc;
    const range = root.querySelector('.sl__range');
    const card = root.querySelector('.sl__card');
    const ticks = root.querySelectorAll('.sl__tick');
    /* Optional Monthly | Annual switch in the same section: annual is 10 times the monthly price (2 months free). */
    const bill = root.closest('section') && root.closest('section').querySelectorAll('input[name="billing-a"]');
    const fmtE = (n) => DE ? n.toLocaleString('de-DE') + ' €' : '€' + n.toLocaleString('en-US');
    const set = (i) => {
      const yr = bill && bill.length && root.closest('section').querySelector('input[name="billing-a"]:checked').value === 'year';
      const pl = Object.assign({}, plans[i]);
      if (yr && pl.m) { pl.p = fmtE(pl.m * 10); pl.per = (DE ? '/Jahr' : '/year') + ' <s class="cfs__was">' + fmtE(pl.m * 12) + '</s>'; }
      range.value = i;
      range.style.setProperty('--p', (i / (plans.length - 1)) * 100 + '%');
      range.setAttribute('aria-valuetext', pl.p + (pl.per ? (DE ? ' im Monat' : ' a month') : ''));
      card.querySelector('[data-sl="p"]').innerHTML = pl.p;
      card.querySelector('[data-sl="per"]').innerHTML = pl.per;
      card.querySelector('[data-sl="f"]').innerHTML = pl.f;
      card.querySelector('[data-sl="rows"]').innerHTML = pl.rows.map((r) => '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>').join('');
      card.classList.toggle('is-inc', i === inc);
      ticks.forEach((t, k) => t.classList.toggle('is-on', k === i));
    };
    range.addEventListener('input', () => set(+range.value));
    ticks.forEach((t) => t.addEventListener('click', () => set(+t.dataset.i)));
    if (bill) bill.forEach((b) => b.addEventListener('change', () => set(+range.value)));
    set(+range.value);
  });
})();

/* Phones: the Command Center screenshot stays pinned and zooms to each step as it scrolls into view. */
(function () {
  const stick = document.querySelector('.ccstick');
  const img = stick && stick.querySelector('.ccstick__img');
  const steps = Array.from(document.querySelectorAll('.acc-dash__steps li[data-zoom]'));
  if (!img || !steps.length || !('IntersectionObserver' in window)) return;
  const zoom = (x, y, w) => {
    const k = 1000 / w;
    img.style.transform = 'scale(' + k + ') translate(' + (-x / 10) + '%, ' + (-y / 5.2) + '%)';
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      steps.forEach((li) => li.classList.toggle('is-active', li === en.target));
      const [x, y, w] = en.target.dataset.zoom.split(',').map(Number);
      zoom(x, y, w);
    });
  }, { rootMargin: '-55% 0px -35% 0px' });
  steps.forEach((li) => io.observe(li));
})();

/* "Back" links return to the page the visitor came from; without one, they go to the link's own address. */
(function () {
  document.querySelectorAll('[data-back]').forEach((a) => {
    a.addEventListener('click', (e) => {
      let same = false;
      try { same = document.referrer && new URL(document.referrer).origin === location.origin; } catch (err) {}
      if (same && history.length > 1) { e.preventDefault(); history.back(); }
    });
  });
})();

/* Package option B: the starter bundle, or a setup you customize at regular prices. "Customize" opens the steps.
   Each device radio carries its regular price in data-price (-1 = custom quote); the workshop with two custom apps
   is added if chosen. The AI Brain and support are sliders, billed monthly or annually (2 months free). The summary
   adds it up, and the request button carries the choices to the trial form. */
(function () {
  const STD = DE ? 'Standard-Support' : 'Standard support';
  const SETUP = 6000; /* two-day workshop €3,000 plus two custom apps €3,000 */
  const fmt = (n) => DE ? n.toLocaleString('de-DE') + ' €' : '€' + n.toLocaleString('en-US');
  const T = DE
    ? { quote: 'Individuelles Angebot', free: 'Kostenlos', mo: '/Monat', yr: '/Jahr', per: { month: 'Monatlich', year: 'Jährlich' }, bill: { month: 'monatliche Abrechnung', year: 'jährliche Abrechnung' }, own: 'Eigene Zusammenstellung', pre: 'Interesse an', preOwn: 'Ihre Ausstattung:', bundleL: 'Starter-Bundle', billL: 'Abrechnung', once: 'Einmalig', dev: 'Gerät', ws: 'Einstieg', incl12: '12 Monate kostenlos', ship: 'Versand', shipT: 'An Ihr Büro', incl: 'Inklusive', trialWs: 'Kostenloser Versand an Ihr Büro. Die Termine für den Workshop legen wir nach Ihrer Bestellung gemeinsam fest.', trialNo: 'Kostenloser Versand an Ihr Büro.', starter: 'Starter-Bundle', ownSetup: 'Ihre Ausstattung', sel: '✓ Ausgewählt', same: 'Gleicher Preis', aYear: 'pro Jahr', aMonth: 'pro Monat', first12: 'in den ersten 12 Monaten', wsT: 'Zweitägiger Einrichtungs- und Einstiegsworkshop mit zwei eigenen Apps', wsS: 'Zweitägiger Workshop mit zwei eigenen Apps', pickDev: 'Wählen Sie ein Gerät, um Ihren Preis zu sehen.', aiSrv: ['Der KI-Server ', ''], brainL: 'Das AI Brain: ', qMo: ' Fragen im Monat', andL: ' und ', sw: 'AI Brain, AI Agent Command Center und Agent Studio, vorinstalliert', inclL: 'Inklusive', forCo: 'Ihr AI Brain für Ihr Unternehmen', valL: 'Wert', saveL: 'Bundle-Rabatt', netL: 'Gesamt, netto', vatL: 'MwSt. (19 %)', grossL: 'Gesamt inkl. MwSt.', moL: 'Monatlich', moL12: 'Monatlich, erste 12 Monate', moLater: 'Monatlich, danach', yrL: 'Danach jährlich', firstYr: 'Erstes Jahr AI Brain und Support', plusVat: 'zzgl. MwSt.', careFor: 'Updates und Support für ', need: ['ein Gerät', 'eine Workshop-Option', 'einen AI-Brain-Tarif', 'einen Support-Tarif'], needPre: 'Wählen Sie noch ', and: ' und ', noWs: 'ohne Einrichtungsworkshop', brain: 'AI Brain', care: 'Support' }
    : { quote: 'Custom quote', free: 'Free', mo: '/month', yr: '/year', per: { month: 'Monthly', year: 'Annual' }, bill: { month: 'billed monthly', year: 'billed annually' }, own: 'Own setup', pre: 'Interested in', preOwn: 'Your setup:', bundleL: 'starter bundle', billL: 'Billing', once: 'One-time', dev: 'Device', ws: 'Getting started', incl12: 'Free for 12 months', ship: 'Shipping', shipT: 'To your office', incl: 'Included', trialWs: 'Free shipping to your office. We set the workshop dates with you after you order.', trialNo: 'Free shipping to your office.', starter: 'Starter bundle', ownSetup: 'Your setup', sel: '✓ Selected', same: 'Same price', aYear: 'a year', aMonth: 'a month', first12: 'for the first 12 months', wsT: 'Two-day setup and getting-started workshop with two custom apps', wsS: 'Two-day workshop with two custom apps', pickDev: 'Choose a device to see your price.', aiSrv: ['The ', ' AI server'], brainL: 'The AI Brain: ', qMo: ' questions a month', andL: ' and ', sw: 'The AI Brain, AI Agent Command Center and Agent Studio, preinstalled', inclL: 'Included', forCo: 'Your AI Brain for your company', valL: 'Value', saveL: 'Bundle discount', netL: 'Total, net', vatL: 'VAT (19%)', grossL: 'Total with VAT', moL: 'Each month', moL12: 'Each month, first 12 months', moLater: 'Each month after that', yrL: 'Each year after that', firstYr: 'First year of AI Brain and support', plusVat: 'plus VAT', careFor: 'Updates and support for ', need: ['a device', 'a workshop option', 'an AI Brain plan', 'a support plan'], needPre: 'To continue, choose ', and: ' and ', noWs: 'no setup workshop', brain: 'AI Brain', care: 'Support' };
  document.querySelectorAll('[data-cfg]').forEach((box) => {
    const sec = box.closest('section');
    const pick = (g) => box.querySelector('input[name="' + g + '"]:checked');
    const $ = (s) => box.querySelector(s);
    const img = $('[data-cfg-img]'), lines = $('[data-cfg-lines]'), cta = $('[data-cfg-cta]');
    const bar = sec.querySelector('[data-cfg-bar]'), open = sec.querySelector('[data-cfg-open]');
    const base = cta.getAttribute('href');
    const starterNote = (sec.querySelector('[data-cfg-bundle]') || {}).innerHTML;
    /* The indie.rack is priced per organization: its button asks for a quote instead of buying. */
    const buyLabel = cta.innerHTML, quoteBase = base.replace(DE ? '/kaufen/' : '/buy/', DE ? '/angebot-anfragen/' : '/request-a-quote/');
    const quoteLabel = (DE ? 'Individuelles Angebot anfragen' : 'Request a custom quote') + ' <span aria-hidden="true">→</span>';
    /* Sliders: the current plan of each, by key. */
    const sl = {}, touched = {};
    box.querySelectorAll('[data-cfs]').forEach((el) => {
      const plans = JSON.parse(el.dataset.plans), range = el.querySelector('.sl__range'), ticks = el.querySelectorAll('.sl__tick');
      sl[el.dataset.cfs] = { el, plans, range, ticks, get: () => plans[+range.value] };
      /* A plan shows up in the price overview only once the visitor has set it. */
      range.addEventListener('input', () => { touched[el.dataset.cfs] = true; update(); });
      ticks.forEach((tk) => tk.addEventListener('click', () => { range.value = tk.dataset.i; touched[el.dataset.cfs] = true; update(); }));
    });
    const price = (m, yr) => (m ? fmt(yr ? m * 10 : m) + (yr ? T.yr : T.mo) : T.free);
    const low = (t) => t.charAt(0).toLowerCase() + t.slice(1);
    /* The chosen device's product shot in the price overview. */
    const ROOT = img ? img.getAttribute('src').split('assets/')[0] : '';
    const SHOT = { box: 'indie-box', booster: 'indie-box-booster', workstation: 'indie-workstation', rack: 'indie-rack' };
    let shownDev = null;
    const showDevice = (dEl) => {
      if (!img || shownDev === dEl.value) return;
      shownDev = dEl.value;
      img.classList.remove('is-in');
      img.alt = dEl.dataset.title;
      img.src = ROOT + 'assets/indie-solutions/cutouts/' + SHOT[dEl.value] + '_cut.webp?v=5';
      requestAnimationFrame(() => img.classList.add('is-in'));
    };
    /* Package: the starter bundle sets the steps to its contents; any change away from it switches to Customize. */
    let mode = 'starter';
    const toStarter = () => {
      box.querySelector('input[name="device"][value="box"]').checked = true;
      box.querySelector('input[name="setup"][value="workshop"]').checked = true;
      if (sl.brain) sl.brain.range.value = 0;
      if (sl.care) sl.care.range.value = sl.care.plans.findIndex((p) => p.t === STD);
    };
    box.addEventListener('change', (ev) => {
      if (ev.target.name !== 'pkg') return;
      mode = ev.target.value;
      if (mode === 'starter') toStarter();
      else { const dv = box.querySelector('#cfg-device'); if (dv) dv.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }, true);
    const update = () => {
      /* Customize starts empty: nothing is chosen until the visitor picks it. */
      const d = pick('device'), yr = pick('billing').value === 'year';
      const sEl = pick('setup'), ws = !!sEl && sEl.value === 'workshop';
      /* indie.box with the setup workshop is exactly the starter bundle: point to its lower price. */
      const bundleNote = sec.querySelector('[data-cfg-bundle]');
      const inBundle = !!d && d.value === 'box' && ws;
      Object.values(sl).forEach((x) => {
        const i = +x.range.value, pl = x.get();
        x.range.style.setProperty('--p', (i / (x.plans.length - 1)) * 100 + '%');
        x.range.setAttribute('aria-valuetext', pl.t);
        x.ticks.forEach((tk, k) => tk.classList.toggle('is-on', k === i));
        const q = (s) => x.el.querySelector(s);
        const care = x.el.dataset.cfs === 'care';
        q('[data-cfs-p]').textContent = pl.m || care ? fmt(yr ? pl.m * 10 : pl.m) : T.free;
        q('[data-cfs-per]').textContent = pl.m || care ? (yr ? T.yr : T.mo) : '';
        q('[data-cfs-was]').textContent = yr && pl.m ? fmt(pl.m * 12) : '';
        q('[data-cfs-f]').innerHTML = pl.f;
        /* Only the indie.box is replaced; the other devices are repaired. */
        const rows = pl.rows_other && d && d.value !== 'box' ? pl.rows_other : pl.rows;
        q('[data-cfs-rows]').innerHTML = rows.map((r) => '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>').join('');
        /* The support heading names the chosen device, with a small photo of it. */
        if (care) {
          const h = q('.sl__h'), dimg = d && d.closest('label').querySelector('img');
          if (!h.dataset.h) h.dataset.h = h.textContent;
          h.innerHTML = d ? (dimg ? '<img class="sl__hdev" src="' + dimg.getAttribute('src') + '" alt="">' : '') + T.careFor + d.dataset.title : h.dataset.h;
        }
      });
      const b = sl.brain.get(), c = sl.care.get();
      const STDM = 149, WS_B = 3000, HW_OFF = 1000;
      /* What the chosen AI Brain plan holds, in terms of the documents a team would connect first. */
      const fit = sec.querySelector('[data-cfg-fit]');
      if (fit) {
        const FIT = DE
          ? ['Genug, um es mit einigen Unterlagen auszuprobieren, bevor Sie mehr anbinden.', 'Die wichtigsten Unterlagen eines Teams.', 'Die wichtigsten Unterlagen einer Abteilung und ein gemeinsames Postfach.', 'Die wichtigsten Unterlagen mehrerer Abteilungen, dazu Postfächer und Wiki.']
          : ['Enough to try it out on a small set of documents, before you connect more.', "One team's most important documents.", "A department's key documents and a shared mailbox.", "Several departments' key documents, mailboxes and wiki."];
        fit.innerHTML = (DE ? '<b>Was passt in diesen Tarif?</b> ' : '<b>What fits in this plan?</b> ') + FIT[+sl.brain.range.value];
      }
      /* Buy now waits until every step has a choice, so nothing is left out by accident. */
      const steps = [[d, '#cfg-device'], [sEl, 'setup'], [touched.brain, '[data-cfs="brain"]'], [touched.care, '[data-cfs="care"]']];
      missing = steps.map((s, k) => (s[0] ? null : k)).filter((k) => k !== null);
      const needEl = sec.querySelector('[data-cfg-need]');
      if (needEl) {
        const names = missing.map((k) => T.need[k]);
        needEl.hidden = !missing.length;
        needEl.textContent = names.length ? T.needPre + (names.length > 1 ? names.slice(0, -1).join(', ') + T.and + names[names.length - 1] : names[0]) + '.' : '';
      }
      cta.classList.toggle('is-off', !!missing.length);
      if (missing.length) cta.setAttribute('aria-disabled', 'true'); else cta.removeAttribute('aria-disabled');
      if (!d) {
        /* No device yet: list prices on the options, and no total. */
        box.querySelectorAll('input[name="device"]').forEach((i) => { const h = +i.dataset.price, p = i.closest('label').querySelector('.cfg__p'); if (p) p.innerHTML = h < 0 ? T.quote : ws ? '<s>' + fmt(h) + '</s> ' + fmt(h - HW_OFF) : fmt(h); });
        box.querySelectorAll('input[name="setup"]').forEach((i) => { const p = i.closest('label').querySelector('.cfg__p'); if (p) p.innerHTML = (i.value === 'workshop' ? '<s>' + fmt(SETUP) + '</s> ' + fmt(WS_B) : fmt(0)) + (i.checked ? '<small>' + T.sel + '</small>' : ''); });
        if (bundleNote) bundleNote.hidden = true;
        lines.innerHTML = '<li class="cfg__hint">' + T.pickDev + '</li>';
        sec.querySelectorAll('[data-cfg-once], [data-cfg-month]').forEach((e) => { e.textContent = fmt(0); });
        box.classList.add('is-empty');
        sec.querySelectorAll('[data-cfg-per]').forEach((e) => { e.textContent = T.per[yr ? 'year' : 'month']; });
        cta.href = '#cfg-device'; cta.innerHTML = buyLabel;
        return;
      }
      box.classList.remove('is-empty');
      const isStarter = d.value === 'box' && ws && !b.m && c.t === STD;
      if (!isStarter) mode = 'custom';
      const pr = box.querySelector('input[name="pkg"][value="' + (isStarter && mode === 'starter' ? 'starter' : 'custom') + '"]'); if (pr) pr.checked = true;
      const pn = sec.querySelector('[data-cfg-pkgname]'); if (pn) pn.textContent = isStarter ? T.starter : T.ownSetup;
      showDevice(d);
      sec.querySelectorAll('[data-cfg-perl]').forEach((e) => { e.textContent = yr ? T.aYear : T.aMonth; });
      const hw = +d.dataset.price, quote = hw < 0;
      /* Bundle benefits stay as long as the setup workshop is kept: workshop and apps at €3,000 instead of €6,000,
         and 12 months of Standard support (€149 a month) credited, and €1,000 off any device. */
      const dev = ws && !quote ? hw - HW_OFF : hw, credit = ws ? Math.min(c.m, STDM) : 0;
      const once = quote ? 0 : dev + (ws ? WS_B : 0), plans = (b.m + c.m - credit) * (yr ? 10 : 1);
      const regular = hw + (ws ? SETUP : 0);
      /* Option cards show what each choice adds or takes away from the current total, like Apple's configurator. */
      const calc = (dEl, w) => {
        const h = +dEl.dataset.price; if (h < 0) return null;
        const credit = w ? Math.min(c.m, STDM) : 0;
        return { once: (w ? h - HW_OFF : h) + (w ? WS_B : 0), plans: (b.m + c.m - credit) * (yr ? 10 : 1) };
      };
      const cur = calc(d, ws);
      const sign = (n) => (n > 0 ? '+ ' : '− ') + fmt(Math.abs(n));
      const tag = (r) => {
        if (!r) return T.quote;
        if (!cur) return fmt(r.once);
        const o = r.once - cur.once, m = r.plans - cur.plans, out = [];
        if (o) out.push(sign(o));
        if (m) out.push('<small>' + sign(m) + (yr ? T.yr : T.mo) + '</small>');
        return out.join('') || T.same;
      };
      box.querySelectorAll('input[name="device"]').forEach((i) => { const p = i.closest('label').querySelector('.cfg__p'); if (p) p.innerHTML = i.checked ? T.sel : tag(calc(i, ws)); });
      /* The workshop always shows its own price, not the change in the total. */
      const wsTag = (i) => (i.value === 'workshop' ? '<s>' + fmt(SETUP) + '</s> ' + fmt(WS_B) : fmt(0)) + (i.checked ? '<small>' + T.sel + '</small>' : '');
      box.querySelectorAll('input[name="setup"]').forEach((i) => { const p = i.closest('label').querySelector('.cfg__p'); if (p) p.innerHTML = wsTag(i); });
      if (bundleNote) {
        bundleNote.hidden = !ws || quote;
        /* The exact starter bundle says so; any other setup with the workshop gets the bundle discounts, and a nudge
           towards Standard support while it is free. */
        const more = once - 7999;
        if (isStarter) bundleNote.innerHTML = starterNote;
        else if (ws && !quote) bundleNote.innerHTML = (DE ? '<b>Bundle-Rabatte aktiv.</b> ' : '<b>Bundle discounts applied.</b> ')
          + (c.m < STDM ? (DE ? 'Standard-Support ist zwölf Monate kostenlos.' : 'Standard support is free for 12 months.') : more > 0 ? fmt(more) + (DE ? ' mehr als das Starter-Bundle.' : ' more than the starter bundle.') : '');
      }
      /* Savings in orange, as on the starter bundle card: the new price, Included and Free. */
      const sv = (x) => '<i class="cfg__save">' + x + '</i>';
      const was = (a, n) => '<s>' + fmt(a) + '</s> ' + sv(fmt(n));
      /* One line per choice: what it is, then what it costs. */
      const row = (k, v, p) => '<li><b>' + v + '</b><em>' + p + '</em></li>';
      lines.innerHTML = row(T.dev, d.dataset.title, quote ? T.quote : ws ? was(hw, hw - HW_OFF) : fmt(hw))
        + (ws ? row(T.ws, T.wsS, was(SETUP, WS_B)) : '')
        + (touched.brain ? row(T.brain, T.brain + ', ' + low(b.t), b.m ? price(b.m, yr) : sv(T.free)) : '')
        + (touched.care ? row(T.care, c.t, ws && c.m && c.m <= STDM ? sv(T.incl12) : ws && c.m > STDM ? price(c.m - STDM, yr) + ' ' + T.first12 : c.m ? price(c.m, yr) : fmt(0) + (yr ? T.yr : T.mo)) : '');
      sec.querySelectorAll('[data-cfg-once]').forEach((e) => { e.innerHTML = quote ? T.quote : once < regular ? '<s class="cfg__was">' + fmt(regular) + '</s> ' + fmt(once) : fmt(once); });
      sec.querySelectorAll('[data-cfg-month]').forEach((e) => { e.textContent = fmt(plans); });
      sec.querySelectorAll('[data-cfg-per]').forEach((e) => { e.textContent = T.per[yr ? 'year' : 'month']; });
      /* The trial form gets the setup as a short list (items only, no prices), so sales sees what someone looked at. */
      const note = [T.preOwn,
        '- ' + T.dev + ': ' + d.dataset.title,
        '- ' + T.ws + ': ' + (ws ? T.wsT : T.noWs),
        '- ' + T.brain + ': ' + b.t,
        '- ' + T.care + ': ' + c.t,
        '- ' + T.billL + ': ' + T.bill[yr ? 'year' : 'month'],
        T.once + ': ' + (quote ? T.quote : fmt(once)) + (inBundle ? ' (' + T.bundleL + ')' : ''),
        T.per[yr ? 'year' : 'month'] + ': ' + fmt(plans)].join('\n');
      cta.innerHTML = quote ? quoteLabel : buyLabel;
      /* Stock and delivery time do not apply to a rack, which is built to order. */
      sec.querySelectorAll('.cfg__sum [data-trust-stock]').forEach((e) => { e.hidden = quote; });
      /* The order page gets the setup item by item, with prices, so it can show exactly what is being bought. */
      const q = (pl) => ((pl.rows || []).find((r) => /question|Frage/i.test(r[0])) || [])[1];
      const cfg = { dev: d.value, title: d.dataset.title, once, regular, plans, plansFull: (b.m + c.m) * (yr ? 10 : 1), yr,
        cart: { kind: 'custom', device: d.value, workshop: ws, brain: +sl.brain.range.value, care: +sl.care.range.value, billing: yr ? 'year' : 'month' }, items: [
        [T.aiSrv[0] + d.dataset.title + T.aiSrv[1], ws ? hw : 0, ws ? hw - HW_OFF : hw],
        ws ? [T.wsT, SETUP, WS_B] : null,
        [T.brainL + low(b.t) + (q(b) ? T.andL + q(b) + T.qMo : ''), 0, b.m ? price(b.m, yr) : T.free],
        [c.t, 0, ws && c.m && c.m <= STDM ? T.incl12 : ws && c.m > STDM ? price(c.m - STDM, yr) + ' ' + T.first12 : c.m ? price(c.m, yr) : fmt(0) + (yr ? T.yr : T.mo)],
        [T.sw, 0, T.inclL]].filter(Boolean) };
      cta.href = quote ? quoteBase + '?order=' + encodeURIComponent(note) : isStarter && !yr ? base : base + '?order=' + encodeURIComponent(note) + '&cfg=' + encodeURIComponent(JSON.stringify(cfg));
    };
    let missing = [];
    const STEP = ['#cfg-device', null, '[data-cfs="brain"]', '[data-cfs="care"]'];
    /* An early click on Buy now goes to the first step that still needs a choice. */
    cta.addEventListener('click', (ev) => {
      if (!missing.length) return;
      ev.preventDefault();
      const k = missing[0], el = k === 1 ? box.querySelector('input[name="setup"]').closest('fieldset') : box.querySelector(STEP[k]);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.remove('is-flag'); void el.offsetWidth; el.classList.add('is-flag');
    });
    box.addEventListener('change', update);
    update();
    if (img) img.classList.add('is-in');
    if (open) open.addEventListener('click', () => {
      box.hidden = false;
      open.setAttribute('aria-expanded', 'true');
      box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    /* Phones: a small bar with the totals while the options are on screen and the summary is not. */
    if (bar) {
      const sum = $('.cfg__sum');
      let inSteps = false, inSum = false;
      const set = () => { bar.hidden = box.hidden || !(inSteps && !inSum && window.innerWidth < 900); };
      new IntersectionObserver((es) => { inSteps = es[0].isIntersecting; set(); }).observe($('.cfg__steps'));
      new IntersectionObserver((es) => { inSum = es[0].isIntersecting; set(); }).observe(sum);
      window.addEventListener('resize', set);
      bar.querySelector('[data-cfg-jump]').addEventListener('click', (ev) => { ev.preventDefault(); sum.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    }
  });
  /* Order page: the order goes to the checkout backend, which prices the chosen setup and returns Mollie's
     payment page. Field names match POST /api/orders/checkout. */
  document.querySelectorAll('[data-checkout-form]').forEach((form) => {
    const err = form.querySelector('.tf__error:not([data-checkout-fail])'), fail = form.querySelector('[data-checkout-fail]');
    const btn = form.querySelector('[type=submit]');
    let cart = { kind: 'starter' };
    try { const c = JSON.parse(new URLSearchParams(location.search).get('cfg') || 'null'); if (c && c.cart) cart = c.cart; } catch (e) { /* starter bundle */ }
    /* Only offer the payment methods Mollie has enabled. If the list cannot be loaded, all three stay. */
    fetch('/api/payment-methods?locale=' + (DE ? 'de' : 'en')).then((r) => (r.ok ? r.json() : null)).then((j) => {
      if (!j || !Array.isArray(j.methods) || !j.methods.length) return;
      const on = new Set(j.methods.map((m) => m.id));
      form.querySelectorAll('[data-pay]').forEach((l) => { l.hidden = !on.has(l.dataset.pay); });
      const first = form.querySelector('[data-pay]:not([hidden]) input'); if (first && !form.querySelector('[data-pay]:not([hidden]) input:checked')) first.checked = true;
    }).catch(() => {});
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const shown = (f) => !f.closest('[hidden]');
      const bad = Array.from(form.querySelectorAll('[required], [pattern]')).filter(shown).filter((f) => (f.type === 'checkbox' ? !f.checked : !f.value.trim() && f.required) || (f.pattern && f.value && !new RegExp('^' + f.pattern + '$').test(f.value.trim())) || (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value)));
      form.querySelectorAll('.is-invalid').forEach((f) => f.classList.remove('is-invalid'));
      bad.forEach((f) => f.classList.add('is-invalid'));
      fail.hidden = true;
      if (bad.length) { err.hidden = false; bad[0].focus(); return; }
      err.hidden = true;
      const data = { locale: DE ? 'de' : 'en', cart };
      form.querySelectorAll('input[name], textarea[name]').forEach((f) => {
        if (/^countryShown/.test(f.name) || (f.type !== 'hidden' && !shown(f))) return;
        if (f.type === 'checkbox') { if (f.checked) data[f.name] = 'on'; return; }
        if (f.type === 'radio') { if (f.checked) data[f.name] = f.value; return; }
        data[f.name] = f.value.trim();
      });
      btn.disabled = true;
      fetch('/api/orders/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
        .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
        .then(({ ok, j }) => { if (!ok || !j.checkoutUrl) throw new Error((j && j.error) || 'checkout failed'); location.assign(j.checkoutUrl); })
        .catch(() => { fail.hidden = false; btn.disabled = false; });
    });
  });
  /* Order status: after Mollie, ask the backend until the payment is settled, then show the matching state.
     A bank transfer stays open until the money arrives, so it counts as placed. */
  document.querySelectorAll('[data-order-status]').forEach((box) => {
    const p = new URLSearchParams(location.search), id = p.get('order_id'), token = p.get('status_token');
    const show = (k) => box.querySelectorAll('[data-os]').forEach((s) => { s.hidden = s.dataset.os !== k; });
    if (!id || !token) { show('missing'); return; }
    let tries = 0;
    const check = () => fetch('/api/orders/status?order_id=' + encodeURIComponent(id) + '&status_token=' + encodeURIComponent(token))
      .then((r) => { if (r.status === 404 || r.status === 400) { show('missing'); return null; } return r.json(); })
      .then((j) => {
        if (!j) return;
        const s = j.paymentStatus || j.status;
        if (j.status === 'paid' || s === 'paid') return show('paid');
        if (['failed', 'cancelled', 'canceled', 'expired'].includes(j.status) || ['failed', 'canceled', 'expired'].includes(s)) return show('failed');
        if (j.paymentMethod === 'banktransfer' && ['open', 'pending'].includes(s)) return show('transfer');
        if (++tries < 40) setTimeout(check, 3000);
      })
      .catch(() => { if (++tries < 40) setTimeout(check, 3000); });
    check();
  });
  /* Order form: "Order as a company" and "Deliver to a different address" reveal their fields. */
  document.querySelectorAll('[data-reveal]').forEach((cb) => {
    const box = document.getElementById(cb.dataset.reveal); if (!box) return;
    const req = box.querySelectorAll('[required]');
    const set = () => { box.hidden = !cb.checked; req.forEach((f) => { f.required = cb.checked; if (!cb.checked) f.classList.remove('is-invalid'); }); };
    cb.addEventListener('change', set); set();
  });
  /* Order page: a setup put together in Customize replaces the starter bundle summary and is sent with the order. */
  const order = new URLSearchParams(location.search).get('order');
  const ob = order && document.querySelector('[data-ob]');
  if (ob) {
    const lines = order.split('\n').filter(Boolean), esc = (x) => x.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const items = lines.filter((l) => l.startsWith('- ')).map((l) => '<li><span>' + esc(l.slice(2)) + '</span></li>').join('');
    const tot = lines.filter((l) => !l.startsWith('- ')).slice(1).map((l) => '<p class="ob__tot">' + esc(l) + '</p>').join('');
    /* VAT on the one-time total, so the summary reads like a formal order. */
    const onceL = lines.find((l) => /^(One-time|Einmalig):/.test(l)), net = onceL ? +onceL.replace(/[^0-9]/g, '') : 0;
    const eur = (n) => (DE ? n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €' : '€' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    const vat = net ? '<dl class="ob__sum"><div><dt>' + (DE ? 'MwSt. (19 %)' : 'VAT (19%)') + '</dt><dd>' + eur(net * 0.19) + '</dd></div><div class="is-gross"><dt>' + (DE ? 'Gesamt inkl. MwSt.' : 'Total with VAT') + '</dt><dd>' + eur(net * 1.19) + '</dd></div></dl>' : '';
    let cfg = null; try { cfg = JSON.parse(new URLSearchParams(location.search).get('cfg') || 'null'); } catch (e) { cfg = null; }
    if (cfg && cfg.items) {
      /* The same layout as the starter bundle: device photo, each item with its price, then the totals. */
      const SHOTS = { box: 'indie-box', booster: 'indie-box-booster', workstation: 'indie-workstation', rack: 'indie-rack' };
      const root = (document.querySelector('link[href*="human.css"]') || { getAttribute: () => '' }).getAttribute('href').split('neu/human.css')[0];
      const chk = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';
      const cell = (it) => (it[1] && typeof it[2] === 'number' ? '<s>' + fmt(it[1]) + '</s> ' : '') + (typeof it[2] === 'number' ? fmt(it[2]) : esc(String(it[2])));
      const row = (k, v, c) => '<div' + (c ? ' class="' + c + '"' : '') + '><dt>' + k + '</dt><dd>' + v + '</dd></div>';
      /* Annual billing: the first year is paid today, with the order. */
      const firstYear = cfg.yr ? cfg.plans : 0;
      if (firstYear) cfg.items = cfg.items.concat([[T.firstYr, 0, firstYear]]);
      const net = cfg.once + firstYear, save = cfg.regular - cfg.once;
      ob.innerHTML = '<div class="ob__head ob__head--img"><img src="' + root + 'assets/indie-solutions/cutouts/' + (SHOTS[cfg.dev] || 'indie-box') + '_cut.webp?v=5" alt=""><div><p class="ob__t">' + esc(cfg.title) + '</p><p class="ob__sub">' + T.forCo + '</p></div></div>'
        + '<ul class="ob__list">' + cfg.items.map((it) => {
          /* Orange only for savings: a struck-out price, Free or Included. Paid amounts stay dark. */
          const deal = it[1] || it[2] === T.free || it[2] === T.inclL || it[2] === T.incl12;
          return '<li>' + chk + '<span>' + esc(it[0]) + '</span><em' + (deal ? '' : ' class="is-paid"') + '>' + cell(it) + '</em></li>';
        }).join('') + '</ul>'
        + '<dl class="ob__sum">' + (save > 0 ? row(T.valL, fmt(cfg.regular)) + row(T.saveL, '−' + fmt(save), 'is-save') : '')
        + row(T.netL, fmt(net), 'is-total') + row(T.vatL, eur(net * 0.19)) + row(T.grossL, eur(net * 1.19), 'is-gross')
        /* Later periods at the full plan price: the workshop's support discount only covers the first 12 months. */
        + (cfg.yr ? (cfg.plansFull ? row(T.yrL, fmt(cfg.plansFull) + ' ' + T.plusVat) : '')
          : cfg.plansFull !== cfg.plans ? (cfg.plans ? row(T.moL12, fmt(cfg.plans) + ' ' + T.plusVat) : '') + row(T.moLater, fmt(cfg.plansFull) + ' ' + T.plusVat)
          : cfg.plans ? row(T.moL, fmt(cfg.plans) + ' ' + T.plusVat) : '') + '</dl>';
    } else {
      ob.innerHTML = '<div class="ob__head"><p class="ob__t">' + esc(lines[0].replace(/:$/, '')) + '</p></div><ul class="ob__list ob__list--plain">' + items + '</ul>' + tot + vat;
    }
    const dev = document.querySelector('[data-trial-form] input[name="device"]');
    /* Keep the form's own marker (ORDER or QUOTE) in front of the setup. */
    if (dev) dev.value = (dev.value.split(':')[0] + ': ' + lines.slice(1).map((l) => l.replace(/^- /, '')).join(', ')).slice(0, 200);
  }
  /* Starter bundle button: the bundle as a short list. */
  document.querySelectorAll('[data-starter-cta]').forEach((a) => {
    const note = DE
      ? ['Interesse am Starter-Bundle:', '- indie.box', '- Zweitägiger Workshop mit zwei eigenen Apps', '- AI Brain im kostenlosen Tarif'].join('\n')
      : ['Interested in the starter bundle:', '- indie.box', '- Two-day workshop with two custom apps', '- AI Brain, free plan'].join('\n');
    a.href = a.getAttribute('href').split('?')[0] + '?bundle=' + encodeURIComponent(note);
  });
  /* Trial form: what someone looked at in the package section. */
  const want = new URLSearchParams(location.search).get('bundle');
  /* Show what someone looked at as its own list above the question, and send it along in the "device" field. */
  const sel = want && document.querySelector('[data-trial-form] [data-sel]');
  if (sel) {
    const items = want.split('\n').map((l) => l.replace(/^-\s*/, '').trim()).filter(Boolean);
    const head = items[0].replace(/:$/, '');
    sel.querySelector('.tf__sel-list').innerHTML = [head].concat(items.slice(1)).map((x, i) => '<li' + (i ? '' : ' class="is-head"') + '>' + x.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])) + '</li>').join('');
    sel.querySelector('input[name="device"]').value = (head + ': ' + items.slice(1).join(', ')).slice(0, 200);
    sel.hidden = false;
  }
})();
