// ========================================
// INDIE LANDING PAGE V3 - JavaScript
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

document.addEventListener('DOMContentLoaded', () => {
    applyHeroVariant(resolveHeroVariant());
    setupAnimations();
});

