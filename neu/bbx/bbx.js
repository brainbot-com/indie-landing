// Copied from brainbot.com main.js for the Agent Command Center sections (.bbx).
// Only tabs, click-to-play videos and the FAQ toggle; the rest of main.js would
// clash with the indie.solutions navigation.
(function () {
function setupTabs() {
    document.querySelectorAll('[data-tabs]').forEach((root) => {
        const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
        const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
        const select = (idx, focus) => {
            tabs.forEach((tab, i) => {
                const on = i === idx;
                tab.setAttribute('aria-selected', on ? 'true' : 'false');
                tab.tabIndex = on ? 0 : -1;
                if (panels[i]) panels[i].hidden = !on;
            });
            if (focus) tabs[idx].focus();
        };
        tabs.forEach((tab, i) => {
            tab.addEventListener('click', () => select(i, false));
            tab.addEventListener('keydown', (e) => {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                e.preventDefault();
                const step = e.key === 'ArrowRight' ? 1 : tabs.length - 1;
                select((i + step) % tabs.length, true);
            });
        });
    });
}
function setupYouTubePreviews() {
    document.querySelectorAll('[data-yt-id]').forEach((frame) => {
        const btn = frame.querySelector('button');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const iframe = document.createElement('iframe');
            const start = parseInt(frame.dataset.ytStart || '0', 10);
            iframe.src = `https://www.youtube-nocookie.com/embed/${frame.dataset.ytId}?start=${start}&autoplay=1&rel=0&modestbranding=1`;
            iframe.title = frame.dataset.ytTitle || 'YouTube video';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';
            iframe.allowFullscreen = true;
            btn.replaceWith(iframe);
            iframe.focus();
        });
    });
}
function setupFaqReveal() {
    document.querySelectorAll('[data-faq-toggle]').forEach((btn) => {
        const list = btn.previousElementSibling;
        btn.addEventListener('click', () => {
            const more = list.querySelectorAll('[data-faq-more]');
            more.forEach((el) => { el.hidden = false; });
            btn.remove();
            // Keep keyboard users in place: focus the first newly shown question.
            const first = more[0] && more[0].querySelector('summary');
            if (first) first.focus();
        });
    });
}
document.addEventListener('DOMContentLoaded', () => { setupTabs(); setupYouTubePreviews(); setupFaqReveal(); });
})();
