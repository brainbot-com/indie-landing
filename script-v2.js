// ========================================
// INDIE LANDING PAGE V2 - JavaScript
// Hero variant toggle + animations (no analytics)
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
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) {
        document.querySelectorAll('.fade-up').forEach((el) => {
            el.classList.add('visible');
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }

    const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    if (hasGsap) {
        window.gsap.registerPlugin(window.ScrollTrigger);

        window.gsap.utils.toArray('.fade-up').forEach((el) => {
            window.gsap.fromTo(
                el,
                { autoAlpha: 0, y: 30 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        once: true
                    }
                }
            );
        });

        const parallaxItems = window.gsap.utils.toArray('.parallax-bg');
        parallaxItems.forEach((item) => {
            const speed = parseFloat(item.dataset.speed) || 0.2;
            const parent = item.closest('.parallax-container');
            if (!parent) return;

            const update = () => {
                const rect = parent.getBoundingClientRect();
                const viewHeight = window.innerHeight;

                if (rect.bottom <= 0 || rect.top >= viewHeight) return;

                const centerOffset = (rect.top + rect.height / 2) - (viewHeight / 2);
                const translateY = centerOffset * speed;
                window.gsap.set(item, { y: translateY, force3D: true });
            };

            window.ScrollTrigger.create({
                trigger: parent,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                onUpdate: update,
                onRefresh: update
            });

            update();
        });

        return;
    }

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

document.addEventListener('DOMContentLoaded', () => {
    applyHeroVariant(resolveHeroVariant());
    setupAnimations();
});
