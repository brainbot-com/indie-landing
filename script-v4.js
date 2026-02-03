// ========================================
// INDIE LANDING PAGE V4 - JavaScript
// Hero variant toggle + animations
// ========================================

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

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

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
            const translateY = centerOffset * speed;
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

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function setupV4ScrollStory() {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const panel1 = document.querySelector('[data-scroll-panel="panel1"]');
    const panel2 = document.querySelector('[data-scroll-panel="panel2"]');
    const panel2Wrap = document.querySelector('[data-scroll-panel="panel2-wrap"]');
    if (!panel1 && !panel2) return;

    let raf = 0;
    let panel2Fixed = false;

    const update = () => {
        raf = 0;

        if (panel2) {
            const viewHeight = window.innerHeight || 0;
            const panel1Text = panel1 ? panel1.querySelector('.v4-apple-text') : null;

            const computeProgress = (sectionEl) => {
                const rect = sectionEl.getBoundingClientRect();
                const start = window.scrollY + rect.top;
                const end = start + sectionEl.offsetHeight - window.innerHeight;
                if (end <= start) return { progress: 1, start, end };
                return { progress: clamp01((window.scrollY - start) / (end - start)), start, end };
            };

            // Panel 2 should begin to enter when Panel 1 reaches the middle of the viewport
            // and be fully "connected" below Panel 1 when Panel 1 sits near the top.
            const p1Info = panel1 ? computeProgress(panel1) : { progress: 0, start: 0, end: 0 };
            const p1 = p1Info.progress;
            let enterFromP1 = 0;

            let panel2TopPx = 0;
            if (panel1Text && viewHeight > 0) {
                const p1Rect = panel1Text.getBoundingClientRect();

                const startTop = viewHeight * 0.55; // start when Panel 1 is around the middle
                const endTop = viewHeight * 0.12;   // end when Panel 1 is close to the top
                enterFromP1 = clamp01((startTop - p1Rect.top) / (startTop - endTop));

                const gapPx = Math.round(Math.max(18, Math.min(34, viewHeight * 0.03)));
                const unclampedTop = p1Rect.bottom + gapPx;
                const minTop = viewHeight * 0.25;
                const maxTop = viewHeight * 0.72;
                panel2TopPx = Math.round(Math.max(minTop, Math.min(maxTop, unclampedTop)));
            }

            const panel2HeightPx = Math.max(0, viewHeight - panel2TopPx);
            const enterY = (1 - enterFromP1) * (panel2HeightPx + 40);
            const extraScroll = Math.max(0, window.scrollY - p1Info.end);

            const headMove = clamp01((enterFromP1 - 0.2) / 0.8);
            const headY = (1 - headMove) * 22;

            panel2.style.setProperty('--v4-p2-top', `${panel2TopPx}px`);
            panel2.style.setProperty('--v4-p2-enter-y', `${enterY.toFixed(2)}px`);
            panel2.style.setProperty('--v4-head-y', `${headY.toFixed(2)}vh`);
            panel2.style.setProperty('--v4-p2-follow', `${(-extraScroll).toFixed(2)}px`);

            // Panel 3 (inline) should start joining once Panel 2 is already connected.
            const p3 = clamp01((enterFromP1 - 0.86) / 0.14);
            const p3Enter = (1 - p3) * Math.min(260, viewHeight * 0.42);
            panel2.style.setProperty('--v4-p3-enter-y', `${p3Enter.toFixed(2)}px`);

            const wrapTop = panel2Wrap ? panel2Wrap.getBoundingClientRect().top : 0;
            const shouldFix = enterFromP1 > 0 && panel2Wrap && wrapTop > panel2TopPx;
            if (shouldFix && !panel2Fixed) {
                panel2.classList.add('is-fixed');
                panel2Fixed = true;
            }
            if (!shouldFix && panel2Fixed) {
                panel2.classList.remove('is-fixed');
                panel2Fixed = false;
            }
        }
    };

    const requestUpdate = () => {
        if (raf) return;
        raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    update();
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
    at(1100, () => heroSection.classList.add('hero-seq-bg', 'hero-seq-content', 'hero-seq-stageout'));
    at(2100, () => heroSection.classList.add('hero-seq-line1'));
    at(2450, startCloudFlip); // appear big, brief pause, then move to final slot
    at(4200, () => heroSection.classList.add('hero-seq-subtitle-in')); // subtitle fades in already at 200% size
    at(4750, () => heroSection.classList.add('hero-seq-subtitle-settle')); // settles to final size/position
    at(5200, () => heroSection.classList.add('hero-seq-cta')); // CTA last
}

document.addEventListener('DOMContentLoaded', () => {
    applyHeroVariant(resolveHeroVariant());
    setupHeroCinematicSequence();
    setupAnimations();
    setupV4ScrollStory();
});
