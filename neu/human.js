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
        if (f.type === 'checkbox') return;
        if (/^guest\d+$/.test(f.name)) { if (f.value.trim()) data.guests.push(f.value.trim()); return; }
        data[f.name] = f.value.trim();
      });
      const lines = [];
      form.querySelectorAll('input[name], select[name], textarea[name]').forEach((f) => {
        if (f.type === 'checkbox' || f.type === 'hidden' || f.name === 'website') return;
        const lab = f.closest('label') && f.closest('label').querySelector('.tf__label');
        const name = lab ? lab.textContent.replace('*', '').trim() : f.name;
        const val = (f.value || '').trim() || '-';
        lines.push(f.tagName === 'TEXTAREA' ? '\n' + name + '\n' + val : name + ': ' + val);
      });
      if (data.webinar) lines.unshift('Webinar: ' + data.webinar);
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
    const set = (i) => {
      const pl = plans[i];
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
