// ========================================
// INDIE LANDING PAGE - JavaScript
// Hero variant toggle + animations
// ========================================

function redirectToEnglishIfNeeded() {
    const path = window.location.pathname || '';
    if (/\/en(\/|$)/.test(path)) return;

    const preferred = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    if (!preferred.toLowerCase().startsWith('en')) return;

    const isRoot = path === '' || path === '/' || path.endsWith('/index.html') || path.endsWith('/');
    if (!isRoot) return;

    const targetPath = window.location.protocol === 'file:' ? 'en/index.html' : 'en/';
    const target = new URL(targetPath, window.location.href).toString();
    window.location.replace(target);
}

redirectToEnglishIfNeeded();

function resolveHeroVariant() {
    const params = new URLSearchParams(window.location.search);
    const hero = (params.get('hero') || '').trim().toLowerCase();

    if (hero === 'alt2' || hero === 'alternative2' || hero === '2') return 'alt2';
    return 'a';
}

function applyHeroVariant(variant) {
    document.querySelectorAll('[data-hero-variant]').forEach((el) => {
        el.hidden = (el.getAttribute('data-hero-variant') !== variant);
    });
}

function setupAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-animate="fade-up"]').forEach(el => observer.observe(el));

    const disableParallax = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    if (disableParallax) return;

    const parallaxItems = document.querySelectorAll('.parallax-bg');
    if (parallaxItems.length === 0) return;

    const updateParallax = () => {
        parallaxItems.forEach(item => {
            const speed = parseFloat(item.dataset.speed) || 0.2;
            const parent = item.closest('.parallax-container');
            if (!parent) return;

            const rect = parent.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            if (rect.bottom <= 0 || rect.top >= viewHeight) return;

            const centerOffset = (rect.top + rect.height / 2) - (viewHeight / 2);
            const rawTranslate = centerOffset * speed;

            const parentHeight = parent.offsetHeight || rect.height;
            const itemHeight = item.offsetHeight || parentHeight;
            const overflow = Math.max(0, itemHeight - parentHeight);
            const maxShift = overflow / 2;
            const translateY = Math.max(-maxShift, Math.min(maxShift, rawTranslate));

            item.style.transform = `translateY(${translateY}px) translateZ(0)`;
        });
    };

    window.addEventListener('scroll', () => requestAnimationFrame(updateParallax), { passive: true });
    updateParallax();
}

function clamp01(value) {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
}

function setupStoryScroll() {
    return;
}

function setupHeroCinematicSequence() {
    const heroSection = document.querySelector('.hero-overlay[data-hero-seq="cinematic"]');
    if (!heroSection) return;

    const activeVariant = heroSection.querySelector('.hero-content-overlay[data-hero-seq-enabled="true"]:not([hidden])');
    if (!activeVariant) {
        heroSection.classList.remove(
            'hero-seq-on',
            'hero-seq-bg',
            'hero-seq-content',
            'hero-seq-stageout',
            'hero-seq-line1',
            'hero-seq-line2',
            'hero-seq-cloud',
            'hero-seq-cloud-active',
            'hero-seq-cloud-move',
            'hero-seq-cloud-done',
            'hero-seq-subtitle-in',
            'hero-seq-subtitle-settle',
            'hero-seq-cta'
        );
        return;
    }

    heroSection.classList.add('hero-seq-on');

    const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
        const at = (ms, fn) => window.setTimeout(fn, ms);
        heroSection.classList.add('hero-seq-bg', 'hero-seq-stageout');
        at(220, () => heroSection.classList.add('hero-seq-content'));
        at(360, () => heroSection.classList.add('hero-seq-cta'));
        at(540, () => heroSection.classList.add('hero-seq-line1'));
        at(900, () => heroSection.classList.add('hero-seq-line2'));
        at(1200, () => heroSection.classList.add('hero-seq-subtitle-settle'));
        return;
    }

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
        heroSection.classList.add(
            'hero-seq-bg',
            'hero-seq-content',
            'hero-seq-stageout',
            'hero-seq-line1',
            'hero-seq-line2',
            'hero-seq-subtitle-settle',
            'hero-seq-cta'
        );
        return;
    }

    const at = (ms, fn) => window.setTimeout(fn, ms);

    const startCloudFlip = () => {
        const flyWrap = heroSection.querySelector('.hero-fly');
        const flyText = heroSection.querySelector('.hero-fly-cloud');
        const target = heroSection.querySelector('.hero-line-2');

        if (!flyWrap || !flyText || !target) {
            heroSection.classList.add('hero-seq-line2');
            return;
        }

        heroSection.classList.remove('hero-seq-cloud-done', 'hero-seq-cloud-move');
        flyWrap.style.removeProperty('--cloud-dx');
        flyWrap.style.removeProperty('--cloud-dy');

        heroSection.classList.add('hero-seq-cloud', 'hero-seq-cloud-active');
        // Ensure the target has its *final* layout (no translateY from base .hero-line)
        // while staying invisible due to hero-seq-cloud-active.
        heroSection.classList.add('hero-seq-line2');

        let finished = false;
        const finish = () => {
            if (finished) return;
            finished = true;
            heroSection.classList.add('hero-seq-cloud-done');
            heroSection.classList.remove('hero-seq-cloud-active');
        };

        // Show big instantly, then move+shrink to the final slot.
        window.setTimeout(() => {
            requestAnimationFrame(() => {
                const from = flyText.getBoundingClientRect();
                const to = target.getBoundingClientRect();

                const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
                const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
                flyWrap.style.setProperty('--cloud-dx', `${dx.toFixed(2)}px`);
                flyWrap.style.setProperty('--cloud-dy', `${dy.toFixed(2)}px`);

                const onEnd = (ev) => {
                    if (ev.propertyName !== 'transform') return;
                    flyWrap.removeEventListener('transitionend', onEnd);
                    finish();
                };

                flyWrap.addEventListener('transitionend', onEnd);
                heroSection.classList.add('hero-seq-cloud-move');
                window.setTimeout(finish, 980);
            });
        }, 0);
    };

    // Timings tuned for: readable, but not sluggish
    at(900, () => heroSection.classList.add('hero-seq-cta'));
    at(1500, () => heroSection.classList.add('hero-seq-bg', 'hero-seq-stageout'));
    at(2200, () => heroSection.classList.add('hero-seq-content'));
    at(3100, () => heroSection.classList.add('hero-seq-line1'));
    at(3350, startCloudFlip); // appear big, brief pause, then move to final slot
    at(4550, () => heroSection.classList.add('hero-seq-subtitle-in')); // subtitle fades in already at 200% size
    at(5100, () => heroSection.classList.add('hero-seq-subtitle-settle')); // settles to final size/position
}

function setupNavReveal() {
    const nav = document.querySelector('.nav-bar--floating');
    const hero = document.querySelector('.hero-overlay');
    if (!nav || !hero) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                nav.classList.remove('nav-bar--visible');
            } else {
                nav.classList.add('nav-bar--visible');
            }
        });
    }, { threshold: 0.05 });

    observer.observe(hero);
}

function setupMobileNav() {
    const nav = document.querySelector('.nav-bar');
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!nav || !toggle || !links) return;

    const setOpen = (open) => {
        nav.classList.toggle('nav-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        setOpen(!nav.classList.contains('nav-open'));
    });

    links.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('click', (event) => {
        if (!nav.contains(event.target)) setOpen(false);
    });

    window.addEventListener('resize', () => {
        if (window.matchMedia('(min-width: 769px)').matches) {
            setOpen(false);
        }
    });
}

function setupSpecExplorer() {
    const explorers = document.querySelectorAll('[data-spec-explorer]');
    if (!explorers.length) return;

    explorers.forEach((explorer) => {
        const tabs = Array.from(explorer.querySelectorAll('[data-spec-tab]'));
        const panels = Array.from(explorer.querySelectorAll('[data-spec-panel]'));
        const panelsWrap = explorer.querySelector('.spec-explorer__panels');
        if (!tabs.length || !panels.length) return;

        const setActive = (name, { focus = false } = {}) => {
            let activeTab = null;

            tabs.forEach((tab) => {
                const isActive = tab.dataset.specTab === name;
                tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
                tab.tabIndex = isActive ? 0 : -1;
                if (isActive) activeTab = tab;
            });

            panels.forEach((panel) => {
                panel.hidden = panel.dataset.specPanel !== name;
            });

            if (focus && activeTab) activeTab.focus();
        };

        const updatePanelsMinHeight = () => {
            if (!panelsWrap) return;

            const activePanel = panels.find((panel) => !panel.hidden) || panels[0];
            let maxHeight = activePanel ? activePanel.getBoundingClientRect().height : 0;

            panels.forEach((panel) => {
                if (panel === activePanel) return;

                const wasHidden = panel.hidden;
                panel.hidden = false;

                const previousStyle = {
                    position: panel.style.position,
                    left: panel.style.left,
                    right: panel.style.right,
                    top: panel.style.top,
                    width: panel.style.width,
                    visibility: panel.style.visibility,
                    pointerEvents: panel.style.pointerEvents
                };

                panel.style.position = 'absolute';
                panel.style.left = '0';
                panel.style.right = '0';
                panel.style.top = '0';
                panel.style.width = '100%';
                panel.style.visibility = 'hidden';
                panel.style.pointerEvents = 'none';

                const height = panel.getBoundingClientRect().height;
                if (height > maxHeight) maxHeight = height;

                panel.style.position = previousStyle.position;
                panel.style.left = previousStyle.left;
                panel.style.right = previousStyle.right;
                panel.style.top = previousStyle.top;
                panel.style.width = previousStyle.width;
                panel.style.visibility = previousStyle.visibility;
                panel.style.pointerEvents = previousStyle.pointerEvents;
                panel.hidden = wasHidden;
            });

            panelsWrap.style.minHeight = `${Math.ceil(maxHeight)}px`;
        };

        let resizeFrame = 0;
        const requestMinHeightUpdate = () => {
            if (resizeFrame) cancelAnimationFrame(resizeFrame);
            resizeFrame = requestAnimationFrame(() => {
                resizeFrame = 0;
                updatePanelsMinHeight();
            });
        };

        const initial = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
        setActive(initial.dataset.specTab || 'hardware');
        requestMinHeightUpdate();

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(requestMinHeightUpdate).catch(() => {
                /* Ignore font loading errors */
            });
        }

        window.addEventListener('resize', requestMinHeightUpdate, { passive: true });

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => setActive(tab.dataset.specTab));

            tab.addEventListener('keydown', (event) => {
                const key = event.key;
                if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Home' && key !== 'End') return;

                event.preventDefault();

                let nextIndex = index;
                if (key === 'Home') nextIndex = 0;
                if (key === 'End') nextIndex = tabs.length - 1;
                if (key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
                if (key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;

                const next = tabs[nextIndex];
                if (!next) return;
                setActive(next.dataset.specTab, { focus: true });
            });
        });
    });
}

function setupCtaOverlays() {
    const overlays = Array.from(document.querySelectorAll('.cta-overlay[id]'));
    if (!overlays.length) return;

    const syncScrimState = () => {
        const hasOpenOverlay = overlays.some((overlay) => overlay.classList.contains('is-open'));
        document.body.classList.toggle('overlay-scrim-on', hasOpenOverlay);
    };

    const closeOverlay = (overlay) => {
        if (!overlay.classList.contains('is-open')) return;
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        syncScrimState();
    };

    const openOverlay = (overlay) => {
        if (overlay.classList.contains('is-open')) return;
        overlays.forEach((item) => {
            if (item !== overlay) closeOverlay(item);
        });
        const openTop = Math.max(window.scrollY || 0, window.pageYOffset || 0);
        overlay.style.setProperty('--overlay-offset-top', `${openTop}px`);
        document.body.classList.add('overlay-scrim-on');
        overlay.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => overlay.classList.add('is-open'));
    };

    document.querySelectorAll('[data-overlay-open]').forEach((trigger) => {
        const targetId = trigger.getAttribute('data-overlay-open');
        if (!targetId) return;

        const overlay = document.getElementById(targetId);
        if (!overlay) return;

        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            openOverlay(overlay);
        });
    });

    overlays.forEach((overlay) => {
        overlay.querySelectorAll('[data-overlay-close]').forEach((button) => {
            button.addEventListener('click', () => closeOverlay(overlay));
        });

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) closeOverlay(overlay);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;

        overlays.forEach((overlay) => {
            if (overlay.classList.contains('is-open')) closeOverlay(overlay);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    applyHeroVariant(resolveHeroVariant());
    setupHeroCinematicSequence();
    setupAnimations();
    setupStoryScroll();
    setupNavReveal();
    setupMobileNav();
    setupSpecExplorer();
    setupCtaOverlays();
});
