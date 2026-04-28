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

function setupMailtoForms() {
    const forms = Array.from(document.querySelectorAll('form[data-mailto-to]'));
    if (!forms.length) return;

    forms.forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const to = form.getAttribute('data-mailto-to') || '';
            if (!to) return;

            const subject = form.getAttribute('data-mailto-subject') || 'Anfrage';
            const formData = new FormData(form);

            const name = String(formData.get('name') || '').trim();
            const email = String(formData.get('email') || '').trim();
            const url = String(formData.get('url') || '').trim();
            const message = String(formData.get('message') || '').trim();

            const lines = [
                `Name: ${name || '-'}`,
                `E-Mail: ${email || '-'}`,
                `URL: ${url || '-'}`,
                '',
                'Beschreibung:',
                message || '-',
            ];

            const mailtoHref = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
            window.location.href = mailtoHref;
        });
    });
}

function setupCheckoutPaymentMethods() {
    const containers = Array.from(document.querySelectorAll('[data-payment-methods]'));
    if (!containers.length) return;

    const renderStatus = (container, text, isError = false) => {
        container.innerHTML = '';
        const message = document.createElement('p');
        message.className = `payment-methods-status${isError ? ' payment-methods-status--error' : ''}`;
        message.textContent = text;
        container.appendChild(message);
    };

    const renderMethods = (container, methods) => {
        const form = container.closest('form');
        const list = document.createElement('ul');
        list.className = 'form-list';

        methods.forEach((method, index) => {
            const item = document.createElement('li');
            const label = document.createElement('label');
            const radio = document.createElement('input');
            const copy = document.createElement('span');
            const title = document.createElement('strong');
            const description = document.createElement('span');
            const inputId = `pay-method-${method.id}`;

            label.className = 'form-checkbox';
            label.setAttribute('for', inputId);

            radio.type = 'radio';
            radio.id = inputId;
            radio.name = 'paymentMethod';
            radio.value = method.id;
            radio.required = true;
            radio.checked = index === 0;

            copy.className = 'payment-method-label';
            title.textContent = method.label;
            description.className = 'payment-method-description';
            description.textContent = method.description;

            copy.appendChild(title);
            copy.appendChild(description);
            label.appendChild(radio);
            label.appendChild(copy);
            item.appendChild(label);
            list.appendChild(item);
        });

        container.innerHTML = '';
        container.appendChild(list);

        // Restore saved payment method selection
        try {
            const raw = localStorage.getItem('indiebox_checkout_draft');
            if (raw) {
                const draft = JSON.parse(raw);
                if (draft.paymentMethod) {
                    const saved = list.querySelector(`input[value="${CSS.escape(draft.paymentMethod)}"]`);
                    if (saved) saved.checked = true;
                }
            }
        } catch { /* ignore */ }

        const submitButton = form && form.querySelector('button[type="submit"]');
        if (submitButton) submitButton.disabled = false;
    };

    containers.forEach(async (container) => {
        const locale = container.getAttribute('data-locale') || 'de';
        const loadingText = container.getAttribute('data-loading-text') || 'Loading payment methods.';
        const errorText = container.getAttribute('data-error-text') || 'Payment methods could not be loaded.';
        const emptyText = container.getAttribute('data-empty-text') || 'No payment methods available.';
        const form = container.closest('form');
        const submitButton = form && form.querySelector('button[type="submit"]');

        if (submitButton) submitButton.disabled = true;
        renderStatus(container, loadingText);

        try {
            const response = await fetch(`/api/payment-methods?locale=${encodeURIComponent(locale)}`, {
                headers: {
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Payment methods request failed with ${response.status}`);
            }

            const payload = await response.json();
            const methods = Array.isArray(payload.methods) ? payload.methods : [];

            if (!methods.length) {
                renderStatus(container, emptyText, true);
                return;
            }

            renderMethods(container, methods);
        } catch (error) {
            console.error('Unable to load payment methods', error);
            renderStatus(container, errorText, true);
        }
    });
}

async function setupCheckoutInventory() {
    const summaries = Array.from(document.querySelectorAll('.checkout-order-summary'));
    if (!summaries.length) return;

    const localeField = document.querySelector('form[data-checkout-form] input[name="locale"]');
    const locale = localeField && 'value' in localeField ? localeField.value : 'de';

    try {
        const response = await fetch(`/api/inventory/indiebox-ai-workstation?locale=${encodeURIComponent(locale)}`, {
            headers: {
                Accept: 'application/json'
            }
        });

        if (!response.ok) return;

        const payload = await response.json();
        const inventory = payload?.inventory;
        if (!inventory) return;

        document.querySelectorAll('[data-inventory-stock-label]').forEach((node) => {
            node.textContent = inventory.stockLabel;
        });
        document.querySelectorAll('[data-inventory-lead-time]').forEach((node) => {
            node.textContent = inventory.leadTimeLabel;
        });
    } catch (error) {
        console.error('Unable to load inventory status', error);
    }
}

function setupCheckoutTestFill() {
    const buttons = Array.from(document.querySelectorAll('[data-test-fill]'));
    if (!buttons.length) return;

    const hostname = window.location.hostname || '';
    const isTestRuntime =
        window.location.protocol === 'file:' ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === 'staging.indiebox.ai';

    if (!isTestRuntime) return;

    const fillValue = (form, name, value) => {
        const field = form.elements.namedItem(name);
        if (!field || typeof field.value === 'undefined') return;
        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
    };

    buttons.forEach((button) => {
        const form = button.closest('form');
        if (!form) return;

        button.hidden = false;

        button.addEventListener('click', () => {
            const localeField = form.elements.namedItem('locale');
            const locale = localeField && 'value' in localeField ? localeField.value : 'de';

            fillValue(form, 'firstName', 'Heiko');
            fillValue(form, 'lastName', 'Tester');
            fillValue(form, 'email', 'test@indiebox.ai');
            fillValue(form, 'phone', '+49 30 1234567');
            fillValue(form, 'billingStreet', 'Musterstrasse 12');
            fillValue(form, 'billingZip', '10115');
            fillValue(form, 'billingCity', 'Berlin');
            fillValue(
                form,
                'notes',
                locale === 'en'
                    ? 'Automatically filled test data for Mollie staging.'
                    : 'Automatisch eingefuellte Testdaten fuer Mollie Staging.'
            );

            const terms = form.elements.namedItem('termsAccepted');
            if (terms && 'checked' in terms) {
                terms.checked = true;
                terms.dispatchEvent(new Event('change', { bubbles: true }));
            }

            const checkedPaymentMethod = form.querySelector('input[name="paymentMethod"]:checked');
            const firstPaymentMethod = form.querySelector('input[name="paymentMethod"]');
            const paymentMethod = checkedPaymentMethod || firstPaymentMethod;
            if (paymentMethod) {
                paymentMethod.checked = true;
                paymentMethod.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    });
}

function setupCheckoutFormPanels() {
    const toggles = Array.from(document.querySelectorAll('[data-toggle-panel]'));
    if (!toggles.length) return;

    const syncPanel = (toggle) => {
        const panelId = toggle.getAttribute('data-toggle-panel');
        if (!panelId) return;

        const panel = document.getElementById(panelId);
        if (!panel) return;

        const active = Boolean(toggle.checked);
        panel.hidden = !active;

        if (!panel.hasAttribute('data-disabled-when-hidden')) return;

        panel.querySelectorAll('input, select, textarea').forEach((field) => {
            if (field.type === 'hidden') return;
            field.disabled = !active;

            if (field.hasAttribute('data-required-when-active')) {
                field.required = active;
            }
        });
    };

    toggles.forEach((toggle) => {
        syncPanel(toggle);
        toggle.addEventListener('change', () => syncPanel(toggle));
    });
}

function setupCheckoutValidation() {
    const forms = Array.from(document.querySelectorAll('form[data-checkout-form]'));
    if (!forms.length) return;

    forms.forEach((form) => {
        const alertBox = form.querySelector('[data-form-alert]');
        const fields = Array.from(form.querySelectorAll('input, select, textarea'));
        const localeField = form.elements.namedItem('locale');
        const locale = localeField && 'value' in localeField ? localeField.value : 'de';
        const submitButton = form.querySelector('button[type="submit"]');
        const messages = locale === 'en'
            ? {
                zip: 'Please enter a 5-digit German postal code.',
                minLength: 'Please enter at least 2 characters.',
                required: 'This field is required.',
                email: 'Please enter a valid email address.',
                summary: 'Please check and correct the highlighted fields.',
                submitting: 'Redirecting to payment.',
                submitError: 'The payment step could not be started. Please check your details and try again.'
            }
            : {
                zip: 'Bitte eine deutsche Postleitzahl mit 5 Ziffern eingeben.',
                minLength: 'Bitte mindestens 2 Zeichen eingeben.',
                required: 'Dieses Feld ist erforderlich.',
                email: 'Bitte eine gueltige E-Mail-Adresse eingeben.',
                summary: 'Bitte die markierten Felder pruefen und korrigieren.',
                submitting: 'Weiterleitung zur Zahlung wird vorbereitet.',
                submitError: 'Der Zahlungsschritt konnte nicht gestartet werden. Bitte die Angaben pruefen und erneut versuchen.'
            };

        const setFieldError = (field, message) => {
            if (typeof field.setCustomValidity === 'function') {
                field.setCustomValidity(message || '');
            }
            field.classList.toggle('form-input--invalid', Boolean(message));
            field.classList.toggle('form-textarea--invalid', Boolean(message));
            // Mark parent label for checkboxes
            if (field.type === 'checkbox') {
                field.closest('.form-checkbox')?.classList.toggle('form-checkbox--invalid', Boolean(message));
            }
        };

        const validateField = (field) => {
            if (!field.name || field.disabled || field.type === 'hidden') return true;

            setFieldError(field, '');

            if (field.name === 'billingZip' || field.name === 'shippingZip') {
                if (field.required && !/^\d{5}$/.test(field.value.trim())) {
                    setFieldError(field, messages.zip);
                    return false;
                }
            }

            if ((field.name === 'firstName' || field.name === 'lastName') && field.required) {
                if (field.value.trim().length < 2) {
                    setFieldError(field, messages.minLength);
                    return false;
                }
            }

            if (field.required && !field.value.trim()) {
                setFieldError(field, messages.required);
                return false;
            }

            if (field.type === 'email' && field.value.trim()) {
                const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
                if (!isValidEmail) {
                    setFieldError(field, messages.email);
                    return false;
                }
            }

            if (field.type === 'checkbox' && field.required && !field.checked) {
                setFieldError(field, messages.required);
                return false;
            }

            return field.checkValidity();
        };

        fields.forEach((field) => {
            field.addEventListener('input', () => validateField(field));
            field.addEventListener('change', () => validateField(field));
        });

        // Restore saved draft if returning from a failed/cancelled payment
        try {
            const raw = localStorage.getItem('indiebox_checkout_draft');
            if (raw) {
                const draft = JSON.parse(raw);
                const TEXT_FIELDS = ['firstName', 'lastName', 'email', 'phone',
                    'company', 'vatId', 'billingStreet', 'billingZip', 'billingCity',
                    'shippingCareOf', 'shippingStreet', 'shippingZip', 'shippingCity', 'notes'];
                TEXT_FIELDS.forEach(name => {
                    if (draft[name] == null) return;
                    const el = form.elements.namedItem(name);
                    if (el && !el.disabled && el.type !== 'hidden') el.value = draft[name];
                });
                // Restore toggle checkboxes (triggers panel show/hide via existing listeners)
                ['isCompanyOrder', 'shippingDifferent'].forEach(name => {
                    if (draft[name] == null) return;
                    const el = form.elements.namedItem(name);
                    if (el && 'checked' in el) {
                        el.checked = draft[name] === 'on';
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
                // Show restore notice
                const notice = document.createElement('div');
                notice.className = 'form-restore-notice';
                const noticeMsg = locale === 'en'
                    ? 'Your details have been restored. You can try again with the same data or choose a different payment method.'
                    : 'Deine Angaben wurden wiederhergestellt. Du kannst es erneut versuchen oder eine andere Zahlungsart wählen.';
                const discardLabel = locale === 'en' ? 'Discard' : 'Verwerfen';
                notice.innerHTML = `<span>${noticeMsg}</span><button type="button" class="form-restore-discard">${discardLabel}</button>`;
                form.insertAdjacentElement('afterbegin', notice);
                notice.querySelector('.form-restore-discard').addEventListener('click', () => {
                    localStorage.removeItem('indiebox_checkout_draft');
                    form.reset();
                    notice.remove();
                });
            }
        } catch { /* ignore */ }

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const invalidFields = fields.filter((field) => !validateField(field));
            if (invalidFields.length) {
                if (alertBox) {
                    alertBox.hidden = false;
                    alertBox.textContent = messages.summary;
                }

                invalidFields[0]?.focus();
                return;
            }

            if (alertBox) {
                alertBox.hidden = false;
                alertBox.textContent = messages.submitting;
            }

            if (submitButton) {
                submitButton.disabled = true;
            }

            try {
                const response = await fetch(form.action, {
                    method: (form.method || 'POST').toUpperCase(),
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                        'X-Checkout-Request': 'fetch'
                    },
                    body: new URLSearchParams(new FormData(form)).toString(),
                    credentials: 'same-origin'
                });

                const payload = await response.json().catch(() => null);

                if (!response.ok || !payload?.checkoutUrl) {
                    throw new Error(payload?.message || messages.submitError);
                }

                try {
                    const draft = {};
                    for (const [k, v] of new FormData(form).entries()) {
                        if (!['locale', 'product', 'billingCountry', 'shippingCountry'].includes(k)) draft[k] = v;
                    }
                    localStorage.setItem('indiebox_checkout_draft', JSON.stringify(draft));
                } catch { /* ignore */ }

                window.location.assign(payload.checkoutUrl);
            } catch (error) {
                if (alertBox) {
                    alertBox.hidden = false;
                    alertBox.textContent = error.message || messages.submitError;
                }

                if (submitButton) {
                    submitButton.disabled = false;
                }
            }
        });
    });
}

function showConfirmModal(title, body, onConfirm, yesLabel = 'OK', noLabel = 'Abbrechen') {
    const overlay = document.createElement('div');
    overlay.className = 'admin-confirm-overlay';
    overlay.innerHTML = `
        <div class="admin-confirm-dialog" role="alertdialog" aria-modal="true">
            <div class="admin-confirm-dialog__title">${title}</div>
            ${body ? `<div class="admin-confirm-dialog__body">${body}</div>` : ''}
            <div class="admin-confirm-dialog__actions">
                <button type="button" class="button button--pill button--sm" data-modal-cancel>${noLabel}</button>
                <button type="button" class="button button--pill button--sm" style="background:#b91c1c;color:#fff;border-color:#b91c1c" data-modal-confirm>${yesLabel}</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector('[data-modal-cancel]').addEventListener('click', close);
    overlay.querySelector('[data-modal-confirm]').addEventListener('click', () => { close(); onConfirm(); });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

function showInlineConfirm(btn, onConfirm, yesLabel, noLabel) {
    const existing = btn.parentElement?.querySelector('[data-inline-confirm]');
    if (existing) { existing.remove(); btn.disabled = false; return; }
    btn.disabled = true;
    const widget = document.createElement('span');
    widget.setAttribute('data-inline-confirm', '');
    widget.className = 'inline-confirm';
    widget.innerHTML = `<button type="button" class="inline-confirm__yes">${yesLabel}</button><button type="button" class="inline-confirm__no">${noLabel}</button>`;
    btn.insertAdjacentElement('afterend', widget);
    widget.querySelector('.inline-confirm__yes').addEventListener('click', () => {
        widget.remove(); btn.disabled = false; onConfirm();
    });
    widget.querySelector('.inline-confirm__no').addEventListener('click', () => {
        widget.remove(); btn.disabled = false;
    });
}

function showAdminChangePasswordPopover(anchorEl, locale, onSuccess) {
    if (!anchorEl) return;
    const existing = document.querySelector('.admin-change-password-popover');
    if (existing) {
        existing.remove();
    }

    const t = { title: 'Change Password', current: 'Current Password', newPw: 'New Password', save: 'Change', cancel: 'Cancel', success: 'Password changed.', failed: 'Password change failed.' };

    const pop = document.createElement('div');
    pop.className = 'admin-change-password-popover';
    pop.innerHTML = `<form class="admin-user-form" data-change-pw-form>
        <h4>${t.title}</h4>
        <div class="form-row"><label class="form-label" for="chpw-current">${t.current}</label>
            <input class="form-input" id="chpw-current" name="currentPassword" type="password" required autocomplete="current-password"></div>
        <div class="form-row"><label class="form-label" for="chpw-new">${t.newPw}</label>
            <input class="form-input" id="chpw-new" name="newPassword" type="password" required minlength="8" autocomplete="new-password"></div>
        <div class="admin-user-actions">
            <button class="button button--primary button--pill button--sm" type="submit">${t.save}</button>
            <button class="button button--plain-dark button--pill button--sm" type="button" data-chpw-cancel>${t.cancel}</button>
        </div>
        <p class="form-error" data-form-error hidden></p>
    </form>`;

    anchorEl.parentElement?.appendChild(pop);

    const close = () => {
        pop.remove();
        document.removeEventListener('click', outsideHandler);
    };

    const outsideHandler = (ev) => {
        if (!pop.contains(ev.target) && !anchorEl.contains(ev.target)) {
            close();
        }
    };

    pop.querySelector('[data-chpw-cancel]')?.addEventListener('click', close);
    pop.querySelector('[data-change-pw-form]')?.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const errEl = pop.querySelector('[data-form-error]');
        const fd = Object.fromEntries(new FormData(ev.target).entries());
        try {
            const res = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(fd)
            });
            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.error || t.failed);
            }
            close();
            onSuccess?.(t.success);
        } catch (e) {
            if (errEl) {
                errEl.textContent = e.message;
                errEl.hidden = false;
            }
        }
    });

    setTimeout(() => document.addEventListener('click', outsideHandler), 0);
}

function setupAdminAuthShell({ locale, authFailed, authMissing, onAuthenticated, onUnauthenticated, onPasswordChanged }) {
    const body = document.body;
    const authForm = document.querySelector('[data-admin-auth-form]');
    const usernameInput = document.querySelector('[data-admin-username-input]');
    const passwordInput = document.querySelector('[data-admin-password-input]');
    const loginError = document.querySelector('[data-admin-login-error]');
    const userBar = document.querySelector('[data-admin-userbar]');
    const userToggle = document.querySelector('[data-admin-user-toggle]');
    const userMenu = document.querySelector('[data-admin-user-menu]');
    const userLabel = document.querySelector('[data-admin-user-label]');
    const clearAuthButton = document.querySelector('[data-admin-clear-auth]');
    const changePasswordButton = document.querySelector('[data-admin-change-password]');
    let currentUser = null;

    const setPageState = (state) => {
        body.dataset.adminAuthState = state;
    };

    const setLoginError = (message) => {
        if (!loginError) return;
        loginError.textContent = message || '';
        loginError.hidden = !message;
    };

    const closeMenu = () => {
        if (userMenu) userMenu.hidden = true;
        if (userToggle) userToggle.setAttribute('aria-expanded', 'false');
    };

    const setCurrentUser = (user) => {
        currentUser = user || null;
        if (userBar) userBar.hidden = !currentUser;
        if (userLabel) userLabel.textContent = currentUser ? currentUser.displayName : '';
        closeMenu();
    };

    const handleAuthenticated = async (user) => {
        setCurrentUser(user);
        setLoginError('');
        setPageState('authenticated');
        await onAuthenticated?.(user);
    };

    const handleUnauthenticated = async (message = '') => {
        setCurrentUser(null);
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
        setLoginError(message);
        setPageState('unauthenticated');
        await onUnauthenticated?.();
    };

    authForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const username = usernameInput?.value || '';
            const password = passwordInput?.value || '';
            const response = await fetch('/api/admin/session', {
                method: 'POST',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ username, password })
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok || !payload?.authenticated || !payload?.user) {
                throw new Error(payload?.error || authFailed);
            }
            await handleAuthenticated(payload.user);
        } catch (error) {
            setLoginError(error.message || authFailed);
        }
    });

    clearAuthButton?.addEventListener('click', async () => {
        await fetch('/api/admin/session', { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
        await handleUnauthenticated('');
    });

    userToggle?.addEventListener('click', (event) => {
        event.stopPropagation();
        const nextHidden = !userMenu || !userMenu.hidden ? true : false;
        if (userMenu) userMenu.hidden = nextHidden;
        userToggle.setAttribute('aria-expanded', String(!nextHidden));
    });

    changePasswordButton?.addEventListener('click', (event) => {
        event.preventDefault();
        closeMenu();
        showAdminChangePasswordPopover(userToggle, locale, onPasswordChanged);
    });

    document.addEventListener('click', (event) => {
        if (!userMenu || userMenu.hidden) return;
        if (userMenu.contains(event.target) || userToggle?.contains(event.target)) return;
        closeMenu();
    });

    const loadAuthState = async () => {
        setPageState('loading');
        try {
            const response = await fetch('/api/admin/session', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
            const payload = response.ok ? await response.json().catch(() => null) : null;
            if (payload?.authenticated && payload?.user) {
                await handleAuthenticated(payload.user);
                return true;
            }
            await handleUnauthenticated('');
            return false;
        } catch {
            await handleUnauthenticated(authMissing);
            return false;
        }
    };

    return {
        loadAuthState,
        handleUnauthenticated,
        getCurrentUser: () => currentUser
    };
}

function setupAdminInventory() {
    const app = document.querySelector('[data-admin-inventory]');
    if (!app) return;

    const locale = 'en';
    const productKey = app.getAttribute('data-product-key') || 'indiebox-ai-workstation';
    const articleForm = app.querySelector('[data-admin-article-form]');
    const articlesList = app.querySelector('[data-admin-articles-list]');
    const procurementList = app.querySelector('[data-admin-procurement-list]');
    const procurementDetail = app.querySelector('[data-admin-procurement-detail]');
    const allocationsList = app.querySelector('[data-admin-allocations-list]');
    const devicesList = app.querySelector('[data-admin-devices-list]');
    const devicesDetail = app.querySelector('[data-admin-devices-detail]');
    const deviceFilterStatus = app.querySelector('[data-device-filter-status]');
    const feedback = app.querySelector('[data-admin-feedback]');

    let selectedDeviceId = null;
    let deviceStatusFilter = '';
    let allDevicesCache = [];
    let selectedSupplierOrderId = null;
    let allSupplierOrdersCache = [];
    let allDeviceModelsCache = [];

    const m = {
            authMissing: 'Sign in to load internal inventory data.',
            authSaved: 'Admin session is active.',
            authCleared: 'Admin session was ended.',
            authFailed: 'Admin sign-in failed.',
            loadFailed: 'The admin data could not be loaded.',
            saved: 'Changes saved.',
            created: 'Supplier order created.',
            deviceAdded: 'Device added.',
            deviceSaved: 'Device saved.',
            articleCreated: 'Article created.',
            articleSaved: 'Article saved.',
            articleDeleted: 'Article deleted.',
            noOrders: 'No supplier orders have been entered yet.',
            noAllocations: 'No customer orders have reserved stock yet.',
            noDevices: 'No devices in stock yet.',
            noArticles: 'No articles in the catalogue yet.',
            allocationSaved: 'Reservation updated.',
            statusAvailable: 'Available', statusAssigned: 'Assigned', statusRetired: 'Retired', statusUnavailable: 'Unavailable',
            statusOrdered: 'On order', statusReserved: 'Reserved for order', statusInStock: 'In stock', statusInstalled: 'Installed',
            markUnavailable: 'Mark unavailable', markAvailable: 'Mark available',
            markInStock: 'Received – enter serial', markInstalled: 'Mark as installed',
            save: 'Save', retire: 'Retire',
            deleteArticle: 'Delete',
            confirmDeleteArticle: 'Delete this article? This cannot be undone.',
            confirmYes: 'Delete', confirmNo: 'Cancel',
            vatIncl: 'incl. VAT', vatExcl: 'excl. VAT'
        };

    let feedbackTimer = null;
    const setFeedback = (message, isError = false) => {
        if (!feedback) return;
        clearTimeout(feedbackTimer);
        feedback.hidden = !message;
        feedback.textContent = message || '';
        feedback.classList.toggle('admin-toast--error', Boolean(isError));
        if (message && !isError) {
            feedbackTimer = setTimeout(() => { feedback.hidden = true; }, 4000);
        }
    };

    const adminFetch = async (url, options = {}) => {
        const headers = new Headers(options.headers || {});
        headers.set('Accept', 'application/json');
        if (options.body && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
        const response = await fetch(url, { ...options, headers, credentials: 'same-origin' });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const error = new Error(payload?.error || payload?.message || response.statusText);
            error.status = response.status;
            throw error;
        }
        return payload;
    };

    const esc = (value) => String(value ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    // Tab switching
    const tabs = app.querySelectorAll('[data-tab]');
    const panels = app.querySelectorAll('[data-tab-panel]');
    const switchTab = (tabKey) => {
        tabs.forEach((tab) => {
            const isActive = tab.getAttribute('data-tab') === tabKey;
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        panels.forEach((panel) => {
            panel.hidden = panel.getAttribute('data-tab-panel') !== tabKey;
        });
    };
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => switchTab(tab.getAttribute('data-tab')));
    });

    const populateArticleSelect = (deviceModels) => {
        if (!articleSelect) return;
        const current = articleSelect.value;
        const firstOption = articleSelect.options[0];
        articleSelect.innerHTML = '';
        articleSelect.appendChild(firstOption);
        for (const model of deviceModels) {
            const opt = document.createElement('option');
            opt.value = model.productKey;
            opt.textContent = [model.manufacturer, model.productName].filter(Boolean).join(' · ');
            articleSelect.appendChild(opt);
        }
        if (current) articleSelect.value = current;
    };

    const renderArticles = (deviceModels) => {
        if (!articlesList) return;
        if (!deviceModels.length) {
            articlesList.innerHTML = `<p class="admin-empty">${m.noArticles}</p>`;
            return;
        }
        // Group by manufacturer
        const groups = new Map();
        for (const model of deviceModels) {
            const mfr = model.manufacturer || ('No manufacturer');
            if (!groups.has(mfr)) groups.set(mfr, []);
            groups.get(mfr).push(model);
        }
        const html = Array.from(groups.entries()).map(([mfr, models]) => `
            <div class="admin-article-group">
                <div class="admin-article-group__label">${esc(mfr)}</div>
                ${models.map((model) => `
                <div class="admin-article-row" data-article-row data-product-key="${esc(model.productKey)}">
                    <div class="admin-article-row__main">
                        <input class="form-input admin-table-input" type="text" name="productName" value="${esc(model.productName)}" placeholder="${'Article name'}">
                        <input class="form-input admin-table-input" type="text" name="manufacturer" value="${esc(model.manufacturer || '')}" placeholder="${'Manufacturer'}">
                        <input class="form-input admin-table-input" type="text" name="systemSpec" value="${esc(model.systemSpec || '')}" placeholder="${'Specification'}">
                    </div>
                    <div class="admin-article-row__actions">
                        <button type="button" class="button button--plain-dark button--pill button--sm" data-save-article>${esc(m.save)}</button>
                        <button type="button" class="button button--plain-light button--pill button--sm" data-delete-article>${esc(m.deleteArticle)}</button>
                    </div>
                </div>`).join('')}
            </div>`).join('');
        articlesList.innerHTML = html;
    };

    const deviceStatusLabel = (status) => {
        if (status === 'available') return { label: m.statusAvailable, cls: 'available' };
        if (status === 'ordered') return { label: m.statusOrdered, cls: 'ordered' };
        if (status === 'in_stock') return { label: m.statusInStock, cls: 'available' };
        if (status === 'installed') return { label: m.statusInstalled, cls: 'available' };
        if (status === 'reserved') return { label: m.statusReserved, cls: 'reserved' };
        if (status === 'assigned') return { label: m.statusAssigned, cls: 'assigned' };
        if (status === 'unavailable') return { label: m.statusUnavailable, cls: 'unavailable' };
        return { label: m.statusRetired, cls: 'retired' };
    };

    const supplierStatusBadge = (status) => {
        switch (status) {
            case 'ordered': return { cls: 'ordered', label: 'Ordered' };
            case 'in_transit': return { cls: 'neutral', label: 'In transit' };
            case 'received': return { cls: 'info', label: 'Received' };
            case 'in_stock': return { cls: 'available', label: 'In stock' };
            case 'cancelled': return { cls: 'danger', label: 'Cancelled' };
            default: return { cls: 'neutral', label: status || '–' };
        }
    };

    const renderDeviceDetail = (device) => {
        if (!devicesDetail) return;
        if (!device) {
            devicesDetail.innerHTML = `<div class="admin-detail-placeholder"><p>${'Select a device to view and edit details.'}</p></div>`;
            return;
        }
        const d = device;
        const st = deviceStatusLabel(d.status);
        const editable = !['retired'].includes(d.status);
        const modelInfo = [d.manufacturer, d.modelName].filter(Boolean).join(' · ');
        devicesDetail.innerHTML = `
            <div class="admin-detail-body" data-device-detail data-device-id="${esc(d.id)}">
                ${d.assignedOrderId ? `
                    <div class="admin-detail-section admin-detail-section--compact admin-detail-section--highlight">
                        <div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#92400e;margin-bottom:0.35rem">${'Assigned to customer'}</div>
                        <div style="font-weight:500">${esc(d.customerName || d.customerCompany || '–')}</div>
                        ${d.customerCompany && d.customerName ? `<div style="font-size:0.85rem;color:rgba(15,23,42,0.6)">${esc(d.customerCompany)}</div>` : ''}
                        <a href="./orders.html" class="admin-detail-link" style="font-size:0.82rem">${'Order'} #${esc(d.orderNumber || d.assignedOrderId.slice(-8))} →</a>
                    </div>
                ` : ''}
                <div class="admin-detail-section admin-detail-section--compact">
                    <div class="admin-detail-row-pair">
                        <strong>Status</strong>
                        <span class="admin-device-status admin-device-status--${esc(st.cls)}">${esc(st.label)}</span>
                    </div>
                    ${modelInfo ? `<div class="admin-detail-row-pair"><strong>${'Model'}</strong><span>${esc(modelInfo)}</span></div>` : ''}
                    ${d.supplierName ? `<div class="admin-detail-row-pair"><strong>${'Supplier'}</strong><span>${esc(d.supplierName)}${d.expectedDeliveryAt ? ` · ${'exp.'} ${esc(d.expectedDeliveryAt)}` : ''}${d.supplierOrderId ? ` · <button type="button" class="admin-detail-link" style="background:none;border:none;padding:0;cursor:pointer" data-goto-supplier-order="${esc(d.supplierOrderId)}">${'View order →'}</button>` : ''}</span></div>` : ''}
                    ${d.status === 'ordered' ? `<div style="font-size:0.8rem;color:rgba(15,23,42,0.55);margin-top:0.25rem">${'Mark as received via the supplier order or use the button below.'}</div>` : ''}
                </div>
                <div class="admin-detail-section admin-detail-section--compact">
                    <div class="form-row">
                        <label class="form-label">${'Serial number'}</label>
                        <input class="form-input" type="text" name="serialNumber" value="${esc(d.serialNumber.startsWith('PENDING-') ? '' : d.serialNumber)}" placeholder="${d.serialNumber.startsWith('PENDING-') ? ('Enter when received') : ''}" ${editable ? '' : 'disabled'}>
                    </div>
                    <div class="form-grid">
                        <div class="form-row">
                            <label class="form-label">${'Username'}</label>
                            <input class="form-input" type="text" name="deviceUsername" value="${esc(d.deviceUsername || '')}" ${editable ? '' : 'disabled'}>
                        </div>
                        <div class="form-row">
                            <label class="form-label">${'Password'}</label>
                            <input class="form-input" type="text" name="devicePassword" value="${esc(d.devicePassword || '')}" ${editable ? '' : 'disabled'}>
                        </div>
                    </div>
                    <div class="form-row">
                        <label class="form-label">${'Notes'}</label>
                        <textarea class="form-textarea" name="notes" rows="3" ${editable ? '' : 'disabled'}>${esc(d.notes || '')}</textarea>
                    </div>
                </div>
                <div class="admin-detail-section admin-detail-section--compact">
                    <div class="admin-detail-actions">
                        ${editable ? `<button type="button" class="button button--solid button--pill button--sm" data-save-device>${esc(m.save)}</button>` : ''}
                        ${d.status === 'ordered' ? `<button type="button" class="button button--plain-dark button--pill button--sm" data-mark-in-stock>${esc(m.markInStock)}</button>` : ''}
                        ${['in_stock', 'reserved'].includes(d.status) ? `<button type="button" class="button button--plain-dark button--pill button--sm" data-mark-installed>${esc(m.markInstalled)}</button>` : ''}
                        ${d.status === 'available' ? `<button type="button" class="button button--plain-dark button--pill button--sm" data-toggle-unavailable data-next-status="unavailable">${esc(m.markUnavailable)}</button>` : ''}
                        ${d.status === 'unavailable' ? `<button type="button" class="button button--plain-dark button--pill button--sm" data-toggle-unavailable data-next-status="available">${esc(m.markAvailable)}</button>` : ''}
                        ${editable ? `<button type="button" class="button button--plain-light button--pill button--sm admin-danger-btn" data-retire-device>${esc(m.retire)}</button>` : ''}
                    </div>
                </div>
            </div>`;
    };

    const renderDevices = (devices) => {
        allDevicesCache = devices;
        if (!devicesList) return;
        const filtered = deviceStatusFilter ? devices.filter((d) => d.status === deviceStatusFilter) : devices;
        if (!filtered.length) {
            devicesList.innerHTML = `<p class="admin-empty">${m.noDevices}</p>`;
            if (selectedDeviceId) { selectedDeviceId = null; renderDeviceDetail(null); }
            return;
        }
        devicesList.innerHTML = filtered.map((d) => {
            const isSelected = d.id === selectedDeviceId;
            const displaySerial = (d.serialNumber.startsWith('PENDING-') && d.status === 'ordered') ? `(${m.statusOrdered})` : d.serialNumber;
            const shortLabel = (() => {
                switch (d.status) {
                    case 'available': case 'in_stock': case 'installed': return { label: deviceStatusLabel(d.status).label, cls: 'available' };
                    case 'reserved': case 'assigned': return { label: 'Reserved', cls: 'reserved' };
                    case 'unavailable': return { label: 'Blocked', cls: 'unavailable' };
                    default: return deviceStatusLabel(d.status);
                }
            })();
            const subtitle = d.assignedOrderId
                ? [d.orderNumber ? `#${d.orderNumber}` : null, d.customerName, d.customerCompany].filter(Boolean).join(' · ')
                : ([d.manufacturer, d.modelName].filter(Boolean).join(' · '));
            return `<div class="admin-order-item admin-order-item--simple${isSelected ? ' is-selected' : ''}" data-device-item data-device-id="${esc(d.id)}">
                <div class="admin-order-item__body">
                    <span class="admin-order-item__name">${esc(displaySerial)}</span>
                    ${subtitle ? `<span class="admin-order-item__meta">${esc(subtitle)}</span>` : ''}
                </div>
                <span class="admin-device-status admin-device-status--${esc(shortLabel.cls)}" style="white-space:nowrap;flex-shrink:0">${esc(shortLabel.label)}</span>
            </div>`;
        }).join('');
        if (selectedDeviceId) {
            const d = devices.find((d) => d.id === selectedDeviceId);
            if (d) renderDeviceDetail(d);
            else { selectedDeviceId = null; renderDeviceDetail(null); }
        }
    };

    const supplierStatusOptions = (currentValue) => {
        const options = [
            ['ordered', 'Ordered'],
            ['in_transit', 'In transit'],
            ['received', 'Received'],
            ['in_stock', 'In stock'],
            ['cancelled', 'Cancelled']
        ];
        return options.map(([value, label]) => `<option value="${esc(value)}"${value === currentValue ? ' selected' : ''}>${esc(label)}</option>`).join('');
    };

    const articleOptions = (currentKey) => (allDeviceModelsCache || []).map((model) =>
        `<option value="${esc(model.productKey)}"${model.productKey === currentKey ? ' selected' : ''}>${esc([model.manufacturer, model.productName].filter(Boolean).join(' · '))}</option>`
    ).join('');

    const renderSupplierOrderDetail = (order) => {
        if (!procurementDetail) return;
        const isNew = !order;
        const o = order || {};
        const currentProductKey = o.productKey || productKey;
        procurementDetail.innerHTML = `
            <div class="admin-detail-body" data-supplier-order-detail ${o.id ? `data-supplier-order-id="${esc(o.id)}"` : ''}>
                <div class="admin-detail-section admin-detail-section--compact">
                    <div class="form-grid">
                        <div class="form-row form-row--full">
                            <label class="form-label">${'Article'}</label>
                            <select class="form-input" name="productKey">
                                ${allDeviceModelsCache.length ? articleOptions(currentProductKey) : `<option value="${esc(currentProductKey)}">${esc(currentProductKey)}</option>`}
                            </select>
                        </div>
                        <div class="form-row">
                            <label class="form-label">${'Supplier'}</label>
                            <input class="form-input" type="text" name="supplierName" value="${esc(o.supplierName || '')}" required>
                        </div>
                        <div class="form-row">
                            <label class="form-label">${'Reference'}</label>
                            <input class="form-input" type="text" name="supplierReference" value="${esc(o.supplierReference || '')}">
                        </div>
                        <div class="form-row">
                            <label class="form-label">${'Qty'}</label>
                            <input class="form-input" type="number" min="1" name="quantity" value="${esc(String(o.quantity || 1))}">
                        </div>
                        <div class="form-row">
                            <label class="form-label">Status</label>
                            <select class="form-input" name="status">${supplierStatusOptions(o.status || 'ordered')}</select>
                        </div>
                        <div class="form-row">
                            <label class="form-label">${'Price/unit (€)'}</label>
                            <input class="form-input" type="text" name="pricePerItem" value="${esc(o.pricePerItem || '')}" placeholder="0.00">
                        </div>
                        <div class="form-row" style="align-items:center;display:flex;gap:0.5rem">
                            <input type="checkbox" name="priceIncludesVat" value="true"${o.priceIncludesVat ? ' checked' : ''} style="width:auto;flex:none">
                            <label class="form-label" style="margin:0">${esc(m.vatIncl)}</label>
                        </div>
                        <div class="form-row">
                            <label class="form-label">${'Ordered'}</label>
                            <input class="form-input" type="date" name="orderedAt" value="${esc(o.orderedAt || '')}">
                        </div>
                        <div class="form-row">
                            <label class="form-label">${'Expected delivery'}</label>
                            <input class="form-input" type="date" name="expectedDeliveryAt" value="${esc(o.expectedDeliveryAt || '')}">
                        </div>
                        <div class="form-row">
                            <label class="form-label">${'Received'}</label>
                            <input class="form-input" type="date" name="receivedAt" value="${esc(o.receivedAt || '')}">
                        </div>
                        <div class="form-row form-row--full">
                            <label class="form-label">${'Notes'}</label>
                            <textarea class="form-textarea" name="notes" rows="2">${esc(o.notes || '')}</textarea>
                        </div>
                    </div>
                </div>
                <div class="admin-detail-section admin-detail-section--compact">
                    <div class="admin-detail-actions">
                        ${isNew
                            ? `<button type="button" class="button button--solid button--pill button--sm" data-create-supplier-order>${'Create supplier order'}</button>`
                            : `<button type="button" class="button button--solid button--pill button--sm" data-save-supplier-order>${esc(m.save)}</button>
                               <button type="button" class="button button--pill button--sm" data-delete-supplier-order style="color:#dc2626">${'Delete'}</button>`
                        }
                    </div>
                </div>
            </div>`;
    };

    const renderSupplierOrders = (supplierOrders, deviceModels) => {
        allSupplierOrdersCache = supplierOrders;
        allDeviceModelsCache = deviceModels || [];
        if (!procurementList) return;
        if (!supplierOrders.length) {
            procurementList.innerHTML = `<p class="admin-empty">${m.noOrders}</p>`;
            return;
        }
        const modelMap = new Map(allDeviceModelsCache.map((dm) => [dm.productKey, dm]));
        procurementList.innerHTML = supplierOrders.map((order) => {
            const isSelected = order.id === selectedSupplierOrderId;
            const model = modelMap.get(order.productKey);
            const modelName = model ? [model.manufacturer, model.productName].filter(Boolean).join(' ') : order.productKey;
            const sb = supplierStatusBadge(order.status);
            return `<div class="admin-order-item admin-order-item--simple${isSelected ? ' is-selected' : ''}" data-supplier-order-item data-supplier-order-id="${esc(order.id)}">
                <div class="admin-order-item__body">
                    <span class="admin-order-item__name">${esc(order.supplierName)}</span>
                    <span class="admin-order-item__meta">${esc(modelName)} · ${esc(String(order.quantity))}×${order.expectedDeliveryAt ? ` · ${esc(order.expectedDeliveryAt)}` : ''}</span>
                </div>
                <span class="admin-device-status admin-device-status--${esc(sb.cls)}">${esc(sb.label)}</span>
            </div>`;
        }).join('');
        if (selectedSupplierOrderId) {
            const o = supplierOrders.find((o) => o.id === selectedSupplierOrderId);
            if (o) renderSupplierOrderDetail(o);
            else { selectedSupplierOrderId = null; renderSupplierOrderDetail(null); }
        }
    };

    const renderAllocations = (allocations) => {
        if (!allocationsList) return;
        if (!allocations.length) {
            allocationsList.innerHTML = `<p class="admin-empty">${m.noAllocations}</p>`;
            return;
        }
        const allocationStatusOptions = [
            ['reserved', 'Reserved'],
            ['fulfilled', 'Fulfilled'],
            ['released', 'Released'],
            ['cancelled', 'Cancelled']
        ];
        const optionsMarkup = (currentValue) => allocationStatusOptions
            .map(([value, label]) => `<option value="${esc(value)}"${value === currentValue ? ' selected' : ''}>${esc(label)}</option>`)
            .join('');
        allocationsList.innerHTML = `
            <div class="admin-table-wrap">
                <table class="admin-table">
                    <thead><tr>
                        <th>${'Order'}</th>
                        <th>Status</th>
                        <th>${'Qty'}</th>
                        <th>${'Allocated'}</th>
                        <th>${'Notes'}</th>
                        <th></th>
                    </tr></thead>
                    <tbody>${allocations.map((allocation) => `
                        <tr data-allocation-row data-allocation-id="${esc(allocation.orderId)}">
                            <td class="admin-table-code">${esc(allocation.orderId)}</td>
                            <td><select class="form-input admin-table-input" name="status">${optionsMarkup(allocation.status)}</select></td>
                            <td><input class="form-input admin-table-input" type="number" value="${esc(allocation.quantity)}" disabled aria-disabled="true"></td>
                            <td><input class="form-input admin-table-input" type="text" value="${esc(allocation.allocatedAt || '')}" disabled aria-disabled="true"></td>
                            <td><textarea class="form-textarea admin-table-textarea" name="notes" rows="2">${esc(allocation.notes || '')}</textarea></td>
                            <td class="admin-table-action"><button type="button" class="button button--plain-dark button--pill button--sm" data-save-allocation>${'Save'}</button></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    };

    const setAdminVisible = (visible) => app.querySelectorAll('.admin-card').forEach((c) => { c.hidden = !visible; });
    const authShell = setupAdminAuthShell({
        locale,
        authFailed: m.authFailed,
        authMissing: m.authMissing,
        onAuthenticated: async () => {
            setAdminVisible(true);
            await loadAdminData();
        },
        onUnauthenticated: () => {
            setAdminVisible(false);
            renderArticles([]);
            renderSupplierOrders([], []);
            renderAllocations([]);
            renderDevices([]);
        },
        onPasswordChanged: (message) => setFeedback(message, false)
    });

    const loadAdminData = async () => {
        try {
            const [deviceModelsResponse, supplierOrdersResponse, allocationsResponse, devicesResponse] = await Promise.all([
                adminFetch('/api/device-models'),
                adminFetch('/api/supplier-orders'),
                adminFetch(`/api/order-allocations?productKey=${encodeURIComponent(productKey)}`),
                adminFetch('/api/admin/stock-devices')
            ]);
            const deviceModels = deviceModelsResponse.deviceModels || [];
            renderArticles(deviceModels);
            renderSupplierOrders(supplierOrdersResponse.supplierOrders || [], deviceModels);
            renderAllocations(allocationsResponse.allocations || []);
            renderDevices(devicesResponse.devices || []);
            setFeedback('', false);
        } catch (error) {
            renderArticles([]);
            renderSupplierOrders([], []);
            renderAllocations([]);
            renderDevices([]);
            if (error.status === 401) {
                await authShell.handleUnauthenticated(m.authFailed);
            }
        }
    };

    articleForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const payload = Object.fromEntries(new FormData(articleForm).entries());
            await adminFetch('/api/device-models', { method: 'POST', body: JSON.stringify(payload) });
            articleForm.reset();
            setFeedback(m.articleCreated, false);
            await loadAdminData();
        } catch (error) { setFeedback(error.message || m.loadFailed, true); }
    });

    articlesList?.addEventListener('click', async (event) => {
        const saveBtn = event.target.closest('[data-save-article]');
        const deleteBtn = event.target.closest('[data-delete-article]');
        const btn = saveBtn || deleteBtn;
        if (!btn) return;
        const row = btn.closest('[data-article-row]');
        if (!row) return;
        const pk = row.getAttribute('data-product-key');
        try {
            if (saveBtn) {
                const payload = Object.fromEntries(Array.from(row.querySelectorAll('[name]')).map((f) => [f.name, f.value]));
                await adminFetch(`/api/device-models/${encodeURIComponent(pk)}`, { method: 'PUT', body: JSON.stringify(payload) });
                setFeedback(m.articleSaved, false);
                await loadAdminData();
            } else {
                showInlineConfirm(deleteBtn, async () => {
                    try {
                        await adminFetch(`/api/device-models/${encodeURIComponent(pk)}`, { method: 'DELETE' });
                        setFeedback(m.articleDeleted, false);
                        await loadAdminData();
                    } catch (err) { setFeedback(err.message || m.loadFailed, true); }
                }, m.confirmYes, m.confirmNo);
                return;
            }
        } catch (error) { setFeedback(error.message || m.loadFailed, true); }
    });

    // Device list selection
    devicesList?.addEventListener('click', (event) => {
        const item = event.target.closest('[data-device-item]');
        if (!item) return;
        const deviceId = item.getAttribute('data-device-id');
        selectedDeviceId = deviceId;
        devicesList.querySelectorAll('[data-device-item]').forEach((el) => {
            el.classList.toggle('is-selected', el.getAttribute('data-device-id') === deviceId);
        });
        renderDeviceDetail(allDevicesCache.find((d) => d.id === deviceId) || null);
    });

    deviceFilterStatus?.addEventListener('change', () => {
        deviceStatusFilter = deviceFilterStatus.value;
        renderDevices(allDevicesCache);
    });

    // Device detail actions
    devicesDetail?.addEventListener('click', async (event) => {
        const gotoSupplierOrder = event.target.closest('[data-goto-supplier-order]');
        if (gotoSupplierOrder) {
            const supplierOrderId = gotoSupplierOrder.getAttribute('data-goto-supplier-order');
            selectedSupplierOrderId = supplierOrderId;
            switchTab('procurement');
            const order = allSupplierOrdersCache.find((o) => o.id === supplierOrderId);
            if (order) {
                renderSupplierOrderDetail(order);
                procurementList?.querySelectorAll('[data-supplier-order-item]').forEach((el) => {
                    el.classList.toggle('is-selected', el.getAttribute('data-supplier-order-id') === supplierOrderId);
                });
            }
            return;
        }

        const saveBtn = event.target.closest('[data-save-device]');
        const retireBtn = event.target.closest('[data-retire-device]');
        const toggleBtn = event.target.closest('[data-toggle-unavailable]');
        const inStockBtn = event.target.closest('[data-mark-in-stock]');
        const installedBtn = event.target.closest('[data-mark-installed]');
        const createBtn = event.target.closest('[data-create-device]');
        const actionBtn = saveBtn || retireBtn || toggleBtn || inStockBtn || installedBtn || createBtn;
        if (!actionBtn) return;
        try {
            if (createBtn) {
                const form = devicesDetail.querySelector('[data-new-device-form]');
                if (!form) return;
                const payload = Object.fromEntries(Array.from(form.querySelectorAll('[name]')).map((f) => [f.name, f.value]));
                payload.productKey = productKey;
                if (!payload.serialNumber) { setFeedback('Serial number required.', true); return; }
                await adminFetch('/api/admin/stock-devices', { method: 'POST', body: JSON.stringify(payload) });
                setFeedback(m.deviceAdded, false);
                await loadAdminData();
                return;
            }
            const detailEl = devicesDetail.querySelector('[data-device-detail]');
            if (!detailEl) return;
            const deviceId = detailEl.getAttribute('data-device-id');
            const payload = Object.fromEntries(Array.from(detailEl.querySelectorAll('[name]')).map((f) => [f.name, f.value]));
            if (retireBtn) payload.status = 'retired';
            if (toggleBtn) payload.status = toggleBtn.getAttribute('data-next-status');
            if (inStockBtn) {
                const serial = payload.serialNumber || '';
                if (!serial || serial.startsWith('PENDING-')) {
                    setFeedback('Please enter the real serial number first.', true);
                    return;
                }
                payload.status = 'in_stock';
            }
            if (installedBtn) payload.status = 'installed';
            await adminFetch(`/api/admin/stock-devices/${encodeURIComponent(deviceId)}`, { method: 'PUT', body: JSON.stringify(payload) });
            setFeedback(m.deviceSaved, false);
            await loadAdminData();
        } catch (error) { setFeedback(error.message || m.loadFailed, true); }
    });

    // New device button → blank form in detail pane
    app.querySelector('[data-new-device]')?.addEventListener('click', () => {
        selectedDeviceId = null;
        devicesList?.querySelectorAll('[data-device-item]').forEach((el) => el.classList.remove('is-selected'));
        if (!devicesDetail) return;
        devicesDetail.innerHTML = `
            <div class="admin-detail-body" data-new-device-form>
                <div class="admin-detail-section admin-detail-section--compact">
                    <div class="form-row">
                        <label class="form-label">${'Serial number'}</label>
                        <input class="form-input" type="text" name="serialNumber" required>
                    </div>
                    <div class="form-grid">
                        <div class="form-row">
                            <label class="form-label">${'Username'}</label>
                            <input class="form-input" type="text" name="deviceUsername">
                        </div>
                        <div class="form-row">
                            <label class="form-label">${'Password'}</label>
                            <input class="form-input" type="text" name="devicePassword">
                        </div>
                    </div>
                    <div class="form-row">
                        <label class="form-label">${'Notes'}</label>
                        <textarea class="form-textarea" name="notes" rows="3"></textarea>
                    </div>
                </div>
                <div class="admin-detail-section admin-detail-section--compact">
                    <div class="admin-detail-actions">
                        <button type="button" class="button button--solid button--pill button--sm" data-create-device>${'Add device'}</button>
                    </div>
                </div>
            </div>`;
    });

    // Supplier order list selection
    procurementList?.addEventListener('click', (event) => {
        const item = event.target.closest('[data-supplier-order-item]');
        if (!item) return;
        const orderId = item.getAttribute('data-supplier-order-id');
        selectedSupplierOrderId = orderId;
        procurementList.querySelectorAll('[data-supplier-order-item]').forEach((el) => {
            el.classList.toggle('is-selected', el.getAttribute('data-supplier-order-id') === orderId);
        });
        renderSupplierOrderDetail(allSupplierOrdersCache.find((o) => o.id === orderId) || null);
    });

    // Supplier order detail actions
    procurementDetail?.addEventListener('click', async (event) => {
        const saveBtn = event.target.closest('[data-save-supplier-order]');
        const createBtn = event.target.closest('[data-create-supplier-order]');
        const deleteBtn = event.target.closest('[data-delete-supplier-order]');

        if (deleteBtn) {
            const detailEl = procurementDetail.querySelector('[data-supplier-order-detail]');
            const supplierOrderId = detailEl?.getAttribute('data-supplier-order-id');
            if (!supplierOrderId) return;
            showConfirmModal(
                'Delete supplier order?',
                'This will also delete all linked devices that are still in "ordered" status.',
                async () => {
                    try {
                        await adminFetch(`/api/supplier-orders/${encodeURIComponent(supplierOrderId)}`, { method: 'DELETE' });
                        selectedSupplierOrderId = null;
                        await loadAdminData();
                        setFeedback('Deleted.', false);
                    } catch (error) {
                        setFeedback(error.message || m.loadFailed, true);
                    }
                },
                'Delete',
                'Cancel'
            );
            return;
        }

        if (!saveBtn && !createBtn) return;
        const detailEl = procurementDetail.querySelector('[data-supplier-order-detail]');
        if (!detailEl) return;
        try {
            const payload = Object.fromEntries(Array.from(detailEl.querySelectorAll('[name]')).map((f) => [f.name, f.value]));
            const vatCheckbox = detailEl.querySelector('[name="priceIncludesVat"]');
            payload.priceIncludesVat = vatCheckbox ? vatCheckbox.checked : false;
            if (createBtn) {
                const result = await adminFetch('/api/supplier-orders', { method: 'POST', body: JSON.stringify(payload) });
                selectedSupplierOrderId = result.supplierOrder?.id || null;
                await loadAdminData();
                if (result.deviceCreateError) {
                    setFeedback(`${m.created} – Device error: ${result.deviceCreateError}`, true);
                } else {
                    setFeedback(`${m.created} (${result.devicesCreated ?? 0} ${'devices created'})`, false);
                }
                return;
            } else {
                const supplierOrderId = detailEl.getAttribute('data-supplier-order-id');
                await adminFetch(`/api/supplier-orders/${encodeURIComponent(supplierOrderId)}`, { method: 'PUT', body: JSON.stringify(payload) });
                setFeedback(m.saved, false);
            }
            await loadAdminData();
        } catch (error) { setFeedback(error.message || m.loadFailed, true); }
    });

    // New supplier order button → blank form in detail pane
    app.querySelector('[data-new-supplier-order]')?.addEventListener('click', () => {
        selectedSupplierOrderId = null;
        procurementList?.querySelectorAll('[data-supplier-order-item]').forEach((el) => el.classList.remove('is-selected'));
        renderSupplierOrderDetail(null);
    });

    allocationsList?.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-save-allocation]');
        if (!button) return;
        const row = button.closest('[data-allocation-row]');
        if (!row) return;
        try {
            const orderId = row.getAttribute('data-allocation-id');
            const payload = Object.fromEntries(Array.from(row.querySelectorAll('[name]')).map((f) => [f.name, f.value]));
            await adminFetch(`/api/order-allocations/${encodeURIComponent(orderId)}`, { method: 'PUT', body: JSON.stringify(payload) });
            setFeedback(m.allocationSaved, false);
            await loadAdminData();
        } catch (error) { setFeedback(error.message || m.loadFailed, true); }
    });

    authShell.loadAuthState();
}

function setupAdminOrders() {
    const app = document.querySelector('[data-admin-orders]');
    if (!app) return;

    const locale = 'en';
    const ordersList = app.querySelector('[data-admin-orders-list]');
    const detailPane = app.querySelector('[data-admin-orders-detail]');
    const searchInput = app.querySelector('[data-admin-order-search]');
    const paymentFilter = app.querySelector('[data-admin-payment-filter]');
    const fulfilmentFilter = app.querySelector('[data-admin-fulfilment-filter]');
    const orderCount = app.querySelector('[data-admin-order-count]');
    const reloadButton = app.querySelector('[data-admin-reload-orders]');
    const feedback = app.querySelector('[data-admin-feedback]');
    const stockBar = app.querySelector('[data-admin-stock-bar]');
    const lpfx = (loc) => loc === 'en' ? '/en/' : '/';
    let currentOrders = [];
    let availableDevices = [];
    let selectedOrderId = null;
    let selectedOrderDetail = null;
    let mollieOrgId = null;

    const t = {
            authMissing: 'Sign in to load customer orders.',
            authSaved: 'Admin session is active.',
            authCleared: 'Admin session was ended.',
            authFailed: 'Admin sign-in failed.',
            loadFailed: 'The order data could not be loaded.',
            noOrders: 'No customer orders are available yet.',
            allocationSaved: 'Fulfilment state saved.',
            orderLoadFailed: 'Order details could not be loaded.',
            noReservation: 'No reservation',
            save: 'Save',
            countLabel: (n) => `${n} ${n === 1 ? 'order' : 'orders'}`,
            statusReserved: 'Reserved', statusInstalled: 'Installed', statusPacked: 'Packed',
            statusShipped: 'Shipped', statusDelivered: 'Delivered', statusFulfilled: 'Fulfilled',
            statusReleased: 'Released', statusCancelled: 'Cancelled',
            order: 'Order', customer: 'Customer', addresses: 'Addresses',
            billing: 'Billing', shipping: 'Shipping', shippingEqualsBilling: 'Shipping = billing',
            created: 'Created', paidAt: 'Paid at', payment: 'Payment', fulfilment: 'Fulfilment',
            method: 'Method', reference: 'Reference', customerNotes: 'Customer notes',
            fulfillmentWorkflow: 'Fulfilment workflow', serialNumber: 'Serial number',
            deviceUser: 'Device username', devicePassword: 'Device password',
            trackingNumber: 'Tracking number', trackingCarrier: 'Carrier',
            internalNotes: 'Internal notes', statusPage: 'Customer status page',
            sectionDevice: 'Device', sectionShipping: 'Shipping', sectionDeviceConfig: 'Device config',
            recentEvents: 'Recent events', name: 'Name', company: 'Company',
            email: 'Email', phone: 'Phone', vatId: 'VAT ID',
            mailCustomer: 'Email customer', pendingSupplier: 'Pending supplier orders',
            units: 'units', expectedDelivery: 'expected',
            badgeNew: 'New', archive: 'Archive order', archiveConfirm: 'Archive this order? It will no longer appear in the list.',
            archived: 'Order archived.',
            confirmYes: 'Archive', confirmNo: 'Cancel',
            orderDevice: 'Order device', assignFromStock: 'Assign from stock',
            supplier: 'Supplier', linkedDevice: 'Linked device', quantity: 'Qty',
            deviceOrdered: 'On order', deviceReserved: 'Reserved',
            molliePayment: 'Mollie payment ↗'
        };

    const workflowSteps = [
        { key: 'reserved', label: t.statusReserved, icon: '1' },
        { key: 'installed', label: t.statusInstalled, icon: '2' },
        { key: 'packed', label: t.statusPacked, icon: '3' },
        { key: 'shipped', label: t.statusShipped, icon: '4' },
        { key: 'delivered', label: t.statusDelivered, icon: '5' }
    ];

    const setFeedback = (message, isError = false) => {
        if (!feedback) return;
        feedback.hidden = !message;
        feedback.textContent = message || '';
        feedback.classList.toggle('form-alert--error', Boolean(isError));
    };

    const adminFetch = async (url, options = {}) => {
        const headers = new Headers(options.headers || {});
        headers.set('Accept', 'application/json');
        if (options.body && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
        const response = await fetch(url, { ...options, headers, credentials: 'same-origin' });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const error = new Error(payload?.error || payload?.message || response.statusText);
            error.status = response.status;
            throw error;
        }
        return payload;
    };

    const esc = (value) => String(value ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const displayOrderNumber = (order) => {
        if (Number.isInteger(order.orderNumber)) return `#${String(order.orderNumber).padStart(5, '0')}`;
        const raw = String(order.id || '');
        return raw.length <= 8 ? raw : `#${raw.slice(-6).toUpperCase()}`;
    };

    const fmtDateTime = (value) => {
        if (!value) return '–';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
    };

    const fmtDate = (value) => {
        if (!value) return '–';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(d);
    };

    const fmtRelative = (value) => {
        if (!value) return '–';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        const diffMs = Date.now() - d.getTime();
        if (diffMs < 0) return fmtDate(value);
        const mins  = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMs / 3600000);
        const days  = Math.floor(diffMs / 86400000);
        if (mins  < 2)  return 'just now';
        if (mins  < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days  < 7)  return `${days}d ago`;
        return fmtDate(value);
    };

    const isoDate = (v) => { if (!v) return ''; const s = String(v); return s.length >= 10 ? s.slice(0, 10) : s; };

    // Lucide-style inline SVG icons. Stroke 2 for small badge contexts (8–16px
    // render size) where the default 1.8 becomes too thin.
    const icon = (name) => {
        const s = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
        const icons = {
            'check':      `<svg viewBox="0 0 24 24" ${s} aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`,
            'x':          `<svg viewBox="0 0 24 24" ${s} aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
            'clock':      `<svg viewBox="0 0 24 24" ${s} aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
            'rotate-ccw': `<svg viewBox="0 0 24 24" ${s} aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
            'ellipsis':   `<svg viewBox="0 0 24 24" ${s} aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`,
            'circle':     `<svg viewBox="0 0 24 24" ${s} aria-hidden="true"><circle cx="12" cy="12" r="10"/></svg>`
        };
        return icons[name] || '';
    };

    const paymentBadge = (status) => {
        switch (status) {
            case 'paid': return { tone: 'success', label: 'Paid' };
            case 'failed': return { tone: 'danger', label: 'Failed' };
            case 'expired': return { tone: 'danger', label: 'Expired' };
            case 'canceled': case 'cancelled': return { tone: 'danger', label: 'Cancelled' };
            case 'authorized': case 'pending': case 'open': case 'payment_created':
                return { tone: 'warning', label: 'Open' };
            default: return { tone: 'neutral', label: (status || 'draft').toUpperCase() };
        }
    };

    const allocationBadge = (status) => {
        switch (status) {
            case 'reserved': return { tone: 'warning', label: t.statusReserved };
            case 'installed': return { tone: 'info', label: t.statusInstalled };
            case 'packed': return { tone: 'info', label: t.statusPacked };
            case 'shipped': return { tone: 'info', label: t.statusShipped };
            case 'delivered': return { tone: 'success', label: t.statusDelivered };
            case 'fulfilled': return { tone: 'success', label: t.statusFulfilled };
            case 'released': return { tone: 'neutral', label: t.statusReleased };
            case 'cancelled': return { tone: 'danger', label: t.statusCancelled };
            default: return { tone: 'neutral', label: t.noReservation };
        }
    };

    const normalizePaymentFilter = (status) => {
        switch (status) {
            case 'paid': return 'paid';
            case 'authorized': case 'pending': case 'open': case 'payment_created': return 'open';
            case 'failed': return 'failed';
            case 'expired': return 'expired';
            case 'canceled': case 'cancelled': return 'failed';
            default: return 'other';
        }
    };

    const normalizeFulfilmentFilter = (status) => {
        if (!status) return 'none';
        if (['reserved', 'installed', 'packed', 'shipped', 'delivered', 'fulfilled', 'released', 'cancelled'].includes(status)) return status;
        return 'other';
    };

    const renderStockBar = (data) => {
        if (!stockBar || !data) return;
        stockBar.hidden = false;
        const setVal = (sel, val) => { const el = stockBar.querySelector(sel); if (el) el.textContent = val; };
        setVal('[data-stock-ordered]', String(data.stock.ordered ?? 0));
        setVal('[data-stock-free]', String(data.stock.free ?? 0));
        setVal('[data-stock-reserved]', String(data.stock.reserved ?? 0));

        const noStockWarn = stockBar.querySelector('[data-no-stock-warning]');
        if (noStockWarn) {
            const freeDevices = (data.availableDevices || []).length;
            noStockWarn.hidden = freeDevices > 0;
        }

        const pendingSection = stockBar.querySelector('[data-stock-pending-orders]');
        const pendingList = stockBar.querySelector('[data-stock-pending-list]');
        if (pendingSection && pendingList) {
            const pending = data.pendingSupplierOrders || [];
            if (pending.length) {
                pendingSection.hidden = false;
                pendingList.innerHTML = pending.map((s) => `
                    <div class="admin-stock-bar__pending-item">
                        <strong>${esc(s.supplierName)}</strong>
                        <span>${s.quantity} ${t.units}</span>
                        <span class="admin-badge admin-badge--warning">${esc({ ordered: 'Ordered', in_transit: 'In transit', received: 'Received', in_stock: 'In stock', cancelled: 'Cancelled' }[s.status] || s.status)}</span>
                        ${s.expectedDeliveryAt ? `<span>${t.expectedDelivery}: ${esc(fmtDate(s.expectedDeliveryAt))}</span>` : ''}
                    </div>
                `).join('');
            } else {
                pendingSection.hidden = true;
            }
        }
    };

    const paymentIcon = (status) => {
        switch (status) {
            case 'paid': return { symbol: icon('check'), tone: 'success', label: 'Paid' };
            case 'failed': return { symbol: icon('x'), tone: 'danger', label: 'Failed' };
            case 'expired': return { symbol: icon('clock'), tone: 'danger', label: 'Expired' };
            case 'canceled': case 'cancelled': return { symbol: icon('rotate-ccw'), tone: 'danger', label: 'Cancelled' };
            case 'authorized': case 'pending': case 'open': case 'payment_created':
                return { symbol: icon('ellipsis'), tone: 'warning', label: 'Open' };
            default: return { symbol: icon('circle'), tone: 'neutral', label: (status || 'draft').toUpperCase() };
        }
    };

    const fulfillmentProgress = (status) => {
        const steps = ['reserved', 'installed', 'packed', 'shipped', 'delivered'];
        const activeIdx = steps.indexOf(status);
        const label = allocationBadge(status).label;
        if (['fulfilled', 'released', 'cancelled'].includes(status)) {
            const mod = status === 'fulfilled' ? 'done' : 'dim';
            return `<span class="admin-prog admin-prog--${mod}">${esc(label)}</span>`;
        }
        const segs = steps.map((_, i) => {
            const mod = i < activeIdx ? 'done' : (i === activeIdx ? 'active' : 'pending');
            return `<span class="admin-prog__seg admin-prog__seg--${mod}"></span>`;
        }).join('');
        const lbl = activeIdx >= 0 ? `<span class="admin-prog__lbl">${esc(label)}</span>` : '';
        const emptyCls = activeIdx < 0 ? ' admin-prog--empty' : '';
        return `<span class="admin-prog${emptyCls}" title="${esc(activeIdx >= 0 ? label : t.noReservation)}"><span class="admin-prog__segs">${segs}</span>${lbl}</span>`;
    };

    const renderOrderList = (orders) => {
        if (!ordersList) return;
        if (!orders.length) {
            if (orderCount) orderCount.textContent = t.countLabel(0);
            ordersList.innerHTML = `<p class="admin-empty">${t.noOrders}</p>`;
            return;
        }
        if (orderCount) orderCount.textContent = t.countLabel(orders.length);

        ordersList.innerHTML = orders.map((order) => {
            const pi = paymentIcon(order.paymentStatus || order.status);
            const city = order.shippingAddress?.city || order.billingAddress?.city || '';
            const isSelected = order.id === selectedOrderId;
            const isPaid = order.paymentStatus === 'paid' || order.status === 'paid';
            const isNew = isPaid && !order.allocationStatus;
            return `
                <div class="admin-order-item${isSelected ? ' is-selected' : ''}" data-order-row data-order-id="${esc(order.id)}">
                    <span class="admin-order-item__number">${esc(displayOrderNumber(order))}</span>
                    <div class="admin-order-item__body">
                        <span class="admin-order-item__name">${esc(order.customerName)}${order.customerCompany ? ` · ${esc(order.customerCompany)}` : ''}${isNew ? ` <span class="admin-badge admin-badge--new">${esc(t.badgeNew)}</span>` : ''}</span>
                        <span class="admin-order-item__meta">${esc(city || '')}${city ? ` · ` : ''}${esc(fmtRelative(order.createdAt))}</span>
                    </div>
                    <span class="admin-pay-icon admin-pay-icon--${pi.tone}" title="${esc(pi.label)}">${pi.symbol}</span>
                    <div class="admin-order-item__progress">
                        ${fulfillmentProgress(order.allocationStatus || '')}
                    </div>
                </div>
            `;
        }).join('');
    };

    const workflowStepIndex = (status) => {
        const idx = workflowSteps.findIndex((s) => s.key === status);
        return idx >= 0 ? idx : -1;
    };

    const renderWorkflow = (currentStatus) => {
        const activeIdx = workflowStepIndex(currentStatus);
        return `<div class="admin-workflow">${workflowSteps.map((step, i) => {
            let cls = '';
            if (i < activeIdx) cls = 'admin-workflow-step--done';
            else if (i === activeIdx) cls = 'admin-workflow-step--active';
            else cls = 'admin-workflow-step--next';
            return `<button type="button" class="admin-workflow-step ${cls}" data-workflow-step="${step.key}">
                <span class="admin-workflow-step__icon">${i < activeIdx ? icon('check') : step.icon}</span>
                ${esc(step.label)}
            </button>`;
        }).join('')}</div>`;
    };

    const orderDeviceStatusLabel = (status) => {
        if (status === 'ordered') return { label: t.deviceOrdered, cls: 'ordered' };
        if (status === 'reserved') return { label: t.deviceReserved, cls: 'reserved' };
        if (status === 'assigned') return { label: t.deviceReserved, cls: 'reserved' };
        return { label: status, cls: 'neutral' };
    };

    const renderDetail = (order, allocation, events, devices = []) => {
        if (!detailPane) return;
        if (!order) {
            detailPane.innerHTML = `<div class="admin-detail-placeholder"><p>${'Select an order to view and edit details.'}</p></div>`;
            return;
        }

        const pi = paymentIcon(order.paymentStatus || order.status);
        const isPaid = order.paymentStatus === 'paid' || order.status === 'paid';
        const hasShipping = Boolean(order.shippingAddress?.street);
        const billingLines = [order.billingAddress?.street, `${order.billingAddress?.zip || ''} ${order.billingAddress?.city || ''}`.trim(), order.billingAddress?.country || 'DE'].filter(Boolean);
        const shippingLines = hasShipping ? [order.shippingAddress.careOf ? `c/o ${order.shippingAddress.careOf}` : '', order.shippingAddress.street, `${order.shippingAddress.zip} ${order.shippingAddress.city}`, order.shippingAddress.country || 'DE'].filter(Boolean) : null;
        const statusUrl = order.statusToken ? `${lpfx(order.locale)}checkout-status.html?order_id=${encodeURIComponent(order.id)}&status_token=${encodeURIComponent(order.statusToken)}` : null;
        const mailSubject = encodeURIComponent(`${'Your Indiebox order'} ${displayOrderNumber(order)}`);
        const mailTo = `mailto:${encodeURIComponent(order.customer?.email || order.customerEmail || '')}?subject=${mailSubject}`;
        const recentEvents = Array.isArray(events) ? events.slice(0, 4) : [];
        const allocStatus = allocation?.status || (isPaid ? 'reserved' : '');
        const isTerminal = ['released', 'cancelled'].includes(allocStatus);

        detailPane.innerHTML = `
            <div class="admin-detail-head">
                <div class="admin-detail-head__left">
                    <span class="admin-detail-head__number">${esc(displayOrderNumber(order))}</span>
                    <span class="admin-pay-icon admin-pay-icon--${pi.tone}" title="${esc(pi.label)}">${pi.symbol}</span>
                    <button type="button" class="admin-info-toggle" data-info-toggle="order-id" title="UUID">i</button>
                </div>
                <div class="admin-detail-head__right">
                    ${order.paymentMethod ? `<span class="admin-badge admin-badge--neutral">${esc(order.paymentMethod)}</span>` : ''}
                    <span class="admin-badge admin-badge--neutral">${esc(order.amount)} ${esc(order.currency)}</span>
                </div>
            </div>
            <div class="admin-info-content" data-info-target="order-id" style="padding:0 0 0.5rem;font-size:0.72rem;color:rgba(15,23,42,0.4);font-family:ui-monospace,monospace;word-break:break-all">${esc(order.id)}</div>

            ${order.notes ? `<div class="admin-detail-section admin-detail-section--compact admin-detail-section--highlight">
                <div style="font-size:0.78rem;font-weight:600;color:rgba(15,23,42,0.5);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.3rem">${t.customerNotes}</div>
                <div style="white-space:pre-wrap;font-size:0.83rem;color:rgba(15,23,42,0.85)">${esc(order.notes)}</div>
            </div>` : ''}

            ${isPaid || allocation ? `
            <div class="admin-detail-section" data-admin-workflow-section data-allocation-id="${esc(order.id)}">
                <h3>${t.fulfillmentWorkflow}</h3>
                ${renderWorkflow(allocStatus)}
                <div class="admin-detail-section-inner" style="margin-top:0.5rem">
                    <div class="admin-form-section">
                        <div class="admin-form-section__label">${t.sectionDevice}</div>
                        ${devices.length ? `<div class="admin-device-cards">${devices.map((d) => {
                            const dst = orderDeviceStatusLabel(d.status);
                            return `<div class="admin-device-card">
                                <div class="admin-device-card__header">
                                    <span class="admin-device-status admin-device-status--${esc(dst.cls)}">${esc(dst.label)}</span>
                                    <span class="admin-device-card__serial">${esc(d.serialNumber)}</span>
                                </div>
                                <div class="admin-kv-grid admin-device-card__kv">
                                    ${d.deviceUsername ? `<span class="admin-kv-key">${t.deviceUser}</span><span class="admin-kv-val">${esc(d.deviceUsername)}</span>` : ''}
                                    ${d.devicePassword ? `<span class="admin-kv-key">${t.devicePassword}</span><span class="admin-kv-val">${esc(d.devicePassword)}</span>` : ''}
                                    ${d.supplierName ? `<span class="admin-kv-key">${t.supplier}</span><span class="admin-kv-val">${esc(d.supplierName)}${d.expectedDeliveryAt ? ` · ${esc(d.expectedDeliveryAt)}` : ''}</span>` : ''}
                                </div>
                            </div>`;
                        }).join('')}</div>` : ''}
                        ${availableDevices.length ? `<div class="admin-detail-form-grid" style="margin-top:0.5rem">
                            <div class="form-row form-row--full">
                                <label class="form-label">${t.assignFromStock}</label>
                                <select class="form-input" name="deviceId" data-device-picker>
                                    <option value="">—</option>
                                    ${availableDevices.map((d) => `<option value="${esc(d.id)}">${esc(d.status === 'ordered' ? `(Ordered) ${d.serialNumber}` : d.serialNumber)}</option>`).join('')}
                                </select>
                            </div>
                        </div>` : ''}
                    </div>
                    <div class="admin-form-section">
                        <div class="admin-form-section__label">${t.sectionShipping}</div>
                        <div class="admin-detail-form-grid">
                            <div class="form-row">
                                <label class="form-label">${t.trackingCarrier}</label>
                                <input class="form-input" type="text" name="trackingCarrier" value="${esc(allocation?.trackingCarrier || '')}">
                            </div>
                            <div class="form-row">
                                <label class="form-label">${t.trackingNumber}</label>
                                <input class="form-input" type="text" name="trackingNumber" value="${esc(allocation?.trackingNumber || '')}">
                            </div>
                        </div>
                    </div>
                    <div class="admin-form-section">
                        <div class="admin-form-section__label">${t.internalNotes}</div>
                        <textarea class="form-textarea" name="notes" rows="2">${esc(allocation?.notes || '')}</textarea>
                    </div>
                    <input type="hidden" name="status" value="${esc(allocStatus)}">
                    <div class="admin-detail-actions">
                        <button type="button" class="button button--plain-dark button--pill button--sm" data-save-allocation>${t.save}</button>
                        ${!isTerminal ? `
                            <button type="button" class="button button--plain-light button--pill button--sm" data-release-allocation>${t.statusReleased}</button>
                            <button type="button" class="button button--plain-light button--pill button--sm" data-cancel-allocation>${t.statusCancelled}</button>
                        ` : ''}
                    </div>
                </div>
            </div>` : ''}

            <div class="admin-detail-section admin-detail-section--compact">
                <div class="admin-kv-grid">
                    <span class="admin-kv-key">${t.name}</span>
                    <span class="admin-kv-val">${esc(order.customer?.firstName || '')} ${esc(order.customer?.lastName || '')}</span>
                    ${order.customer?.company ? `<span class="admin-kv-key">${t.company}</span><span class="admin-kv-val">${esc(order.customer.company)}</span>` : ''}
                    <span class="admin-kv-key">${t.email}</span>
                    <span class="admin-kv-val"><a href="mailto:${esc(order.customer?.email || '')}" class="admin-detail-link">${esc(order.customer?.email || order.customerEmail || '')}</a></span>
                    ${order.customer?.phone ? `<span class="admin-kv-key">${t.phone}</span><span class="admin-kv-val">${esc(order.customer.phone)}</span>` : ''}
                    ${order.customer?.vatId ? `<span class="admin-kv-key">${t.vatId}</span><span class="admin-kv-val">${esc(order.customer.vatId)}</span>` : ''}
                    <span class="admin-kv-key">${t.billing}</span>
                    <span class="admin-kv-val">${billingLines.map(esc).join(', ')}</span>
                    ${shippingLines ? `<span class="admin-kv-key">${t.shipping}</span><span class="admin-kv-val">${shippingLines.map(esc).join(', ')}</span>` : ''}
                    <span class="admin-kv-key">${t.created}</span>
                    <span class="admin-kv-val">${esc(fmtDateTime(order.createdAt))}</span>
                    ${order.paidAt ? `<span class="admin-kv-key">${t.paidAt}</span><span class="admin-kv-val">${esc(fmtDateTime(order.paidAt))}</span>` : ''}
                </div>
                <div class="admin-detail-actions" style="margin-top:0.5rem">
                    <a href="${mailTo}" class="admin-mailto-link">${t.mailCustomer} ↗</a>
                    ${statusUrl ? `<a href="${esc(statusUrl)}" target="_blank" rel="noopener" class="admin-mailto-link">${t.statusPage} ↗</a>` : ''}
                    ${order.paymentId && mollieOrgId ? `<a href="https://my.mollie.com/dashboard/${esc(mollieOrgId)}/payments/${esc(order.paymentId)}" target="_blank" rel="noopener" class="admin-mailto-link">${t.molliePayment}</a>` : ''}
                </div>
            </div>


            ${recentEvents.length ? `
            <div class="admin-detail-section admin-detail-section--compact">
                <div style="font-size:0.78rem;font-weight:600;color:rgba(15,23,42,0.5);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.3rem">${t.recentEvents}</div>
                <ul class="admin-events-list">
                    ${recentEvents.map((ev) => `
                        <li class="admin-event-item">
                            <span class="admin-event-time" title="${esc(fmtDateTime(ev.createdAt))}">${esc(fmtRelative(ev.createdAt))}</span>
                            <span class="admin-event-type">${esc(ev.eventType || ev.source || '')}</span>
                            ${ev.paymentStatus ? `<span class="admin-event-status">${esc(ev.paymentStatus)}</span>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>` : ''}

            <div class="admin-detail-section admin-detail-section--compact admin-detail-section--danger">
                <button type="button" class="button button--plain-light button--pill button--sm admin-danger-btn" data-archive-order data-order-id="${esc(order.id)}">${t.archive}</button>
            </div>
        `;
    };

    const getFilteredOrders = () => {
        const query = (searchInput?.value || '').trim().toLowerCase();
        const paymentValue = paymentFilter?.value || 'all';
        const fulfilmentValue = fulfilmentFilter?.value || 'all';

        return currentOrders.filter((order) => {
            const pGroup = normalizePaymentFilter(order.paymentStatus || order.status);
            const fGroup = normalizeFulfilmentFilter(order.allocationStatus || '');
            if (paymentValue !== 'all' && pGroup !== paymentValue) return false;
            if (fulfilmentValue === 'new') {
                const isPaid = order.paymentStatus === 'paid' || order.status === 'paid';
                if (!isPaid || order.allocationStatus) return false;
            } else if (fulfilmentValue !== 'all' && fGroup !== fulfilmentValue) return false;
            if (query) {
                const hay = [
                    displayOrderNumber(order), order.id, order.customerName,
                    order.customerCompany, order.customerEmail,
                    order.billingAddress?.city, order.shippingAddress?.city,
                    order.billingAddress?.zip, order.shippingAddress?.zip
                ].filter(Boolean).join(' ').toLowerCase();
                if (!hay.includes(query)) return false;
            }
            return true;
        });
    };

    const refreshList = () => {
        renderOrderList(getFilteredOrders());
    };

    const loadOrderDetail = async (orderId) => {
        if (!orderId) {
            selectedOrderDetail = null;
            renderDetail(null);
            return;
        }
        try {
            const detail = await adminFetch(`/api/orders/${encodeURIComponent(orderId)}`);
            selectedOrderDetail = detail;
            renderDetail(detail.order, detail.allocation, detail.events, detail.devices || []);
        } catch {
            selectedOrderDetail = null;
            renderDetail(null);
            setFeedback(t.orderLoadFailed, true);
        }
    };

    const saveAllocation = async (orderId, payload) => {
        try {
            await adminFetch(`/api/order-allocations/${encodeURIComponent(orderId)}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            setFeedback(t.allocationSaved, false);
            await loadOrders();
            if (selectedOrderId === orderId) {
                await loadOrderDetail(orderId);
            }
        } catch (error) {
            setFeedback(error.message || t.orderLoadFailed, true);
        }
    };

    const setAdminVisible = (visible) => app.querySelectorAll('.admin-card').forEach((c) => { c.hidden = !visible; });
    const authShell = setupAdminAuthShell({
        locale,
        authFailed: t.authFailed,
        authMissing: t.authMissing,
        onAuthenticated: async () => {
            setAdminVisible(true);
            await loadOrders();
        },
        onUnauthenticated: () => {
            setAdminVisible(false);
            currentOrders = [];
            selectedOrderId = null;
            selectedOrderDetail = null;
            if (stockBar) stockBar.hidden = true;
            renderOrderList([]);
            renderDetail(null);
        },
        onPasswordChanged: (message) => setFeedback(message, false)
    });

    const loadOrders = async () => {
        try {
            const [data] = await Promise.all([
                adminFetch('/api/admin/orders-overview?limit=200'),
                mollieOrgId ? Promise.resolve() : adminFetch('/api/admin/mollie-info').then((info) => { mollieOrgId = info.orgId || null; }).catch(() => {})
            ]);
            currentOrders = data.orders || [];
            availableDevices = data.availableDevices || [];
            renderStockBar(data);
            if (selectedOrderId && !currentOrders.some((o) => o.id === selectedOrderId)) {
                selectedOrderId = null;
                selectedOrderDetail = null;
                renderDetail(null);
            }
            refreshList();
            setFeedback('', false);
        } catch (error) {
            currentOrders = [];
            selectedOrderId = null;
            selectedOrderDetail = null;
            renderOrderList([]);
            renderDetail(null);
            if (error.status === 401) {
                await authShell.handleUnauthenticated(t.authFailed);
                return;
            }
            setFeedback(t.loadFailed, true);
        }
    };

    ordersList?.addEventListener('click', (event) => {
        const row = event.target.closest('[data-order-row]');
        if (!row) return;
        const id = row.getAttribute('data-order-id');
        if (id === selectedOrderId) {
            selectedOrderId = null;
            selectedOrderDetail = null;
            refreshList();
            renderDetail(null);
        } else {
            selectedOrderId = id;
            refreshList();
            loadOrderDetail(id);
        }
    });

    detailPane?.addEventListener('click', async (event) => {
        const workflowBtn = event.target.closest('[data-workflow-step]');
        if (workflowBtn) {
            const section = workflowBtn.closest('[data-admin-workflow-section]');
            if (!section) return;
            const orderId = section.getAttribute('data-allocation-id');
            const newStatus = workflowBtn.getAttribute('data-workflow-step');
            const fields = Object.fromEntries(Array.from(section.querySelectorAll('[name]')).map((f) => [f.name, f.value]));
            fields.status = newStatus;
            await saveAllocation(orderId, fields);
            return;
        }

        const saveBtn = event.target.closest('[data-save-allocation]');
        if (saveBtn) {
            const section = saveBtn.closest('[data-admin-workflow-section]');
            if (!section) return;
            const orderId = section.getAttribute('data-allocation-id');
            const fields = Object.fromEntries(Array.from(section.querySelectorAll('[name]')).map((f) => [f.name, f.value]));
            await saveAllocation(orderId, fields);
            return;
        }

        const releaseBtn = event.target.closest('[data-release-allocation]');
        if (releaseBtn) {
            const section = releaseBtn.closest('[data-admin-workflow-section]');
            if (!section) return;
            const orderId = section.getAttribute('data-allocation-id');
            const fields = Object.fromEntries(Array.from(section.querySelectorAll('[name]')).map((f) => [f.name, f.value]));
            fields.status = 'released';
            await saveAllocation(orderId, fields);
            return;
        }

        const cancelBtn = event.target.closest('[data-cancel-allocation]');
        if (cancelBtn) {
            const section = cancelBtn.closest('[data-admin-workflow-section]');
            if (!section) return;
            const orderId = section.getAttribute('data-allocation-id');
            const fields = Object.fromEntries(Array.from(section.querySelectorAll('[name]')).map((f) => [f.name, f.value]));
            fields.status = 'cancelled';
            await saveAllocation(orderId, fields);
            return;
        }

        const infoToggle = event.target.closest('[data-info-toggle]');
        if (infoToggle) {
            const targetId = infoToggle.getAttribute('data-info-toggle');
            const target = detailPane.querySelector(`[data-info-target="${targetId}"]`);
            if (target) target.classList.toggle('is-visible');
            return;
        }

        const archiveBtn = event.target.closest('[data-archive-order]');
        if (archiveBtn) {
            const orderId = archiveBtn.getAttribute('data-order-id');
            showInlineConfirm(archiveBtn, async () => {
                try {
                    await adminFetch(`/api/admin/orders/${encodeURIComponent(orderId)}/archive`, { method: 'POST' });
                    selectedOrderId = null;
                    setFeedback(t.archived, false);
                    await loadOrders();
                } catch (error) { setFeedback(error.message || t.loadFailed, true); }
            }, t.confirmYes, t.confirmNo);
        }
    });

    detailPane?.addEventListener('change', (event) => {
        if (event.target.matches('[data-device-picker]')) {
            // deviceId is collected by saveAllocation via [name] inputs - no extra action needed
        }
    });

    searchInput?.addEventListener('input', () => { refreshList(); });
    paymentFilter?.addEventListener('change', () => { refreshList(); });
    fulfilmentFilter?.addEventListener('change', () => { refreshList(); });
    reloadButton?.addEventListener('click', () => { loadOrders(); });

    authShell.loadAuthState();
}

function setupAdminUsers() {
    const app = document.querySelector('[data-admin-users]');
    if (!app) return;

    const locale = 'en';
    const usersList = app.querySelector('[data-admin-users-list]');
    const detailPane = app.querySelector('[data-admin-users-detail]');
    const roleFilter = app.querySelector('[data-admin-user-role-filter]');
    const statusFilter = app.querySelector('[data-admin-user-status-filter]');
    const userCount = app.querySelector('[data-admin-user-count]');
    const reloadButton = app.querySelector('[data-admin-reload-users]');
    const createButton = app.querySelector('[data-admin-create-user]');
    const feedback = app.querySelector('[data-admin-feedback]');

    let allUsers = [];
    let selectedUserId = null;
    let currentUser = null; // logged-in user

    const t = {
            authMissing: 'Sign in to manage users.',
            authSaved: 'Admin session is active.',
            authCleared: 'Admin session was ended.',
            authFailed: 'Admin sign-in failed.',
            loadFailed: 'User data could not be loaded.',
            noUsers: 'No users found.',
            userCreated: 'User created.',
            userUpdated: 'User updated.',
            userDeleted: 'User deleted.',
            passwordReset: 'Password has been reset.',
            statusToggled: 'User status changed.',
            countLabel: (n) => `${n} ${n === 1 ? 'user' : 'users'}`,
            createTitle: 'Create User',
            editTitle: 'Edit User',
            username: 'Username',
            displayName: 'Display Name',
            role: 'Role',
            password: 'Password',
            status: 'Status',
            active: 'Active',
            disabled: 'Disabled',
            admin: 'Admin',
            user: 'User',
            save: 'Save',
            cancel: 'Cancel',
            create: 'Create',
            deleteUser: 'Delete',
            confirmDelete: 'Delete this user? This cannot be undone.',
            confirmYes: 'Delete',
            confirmNo: 'Cancel',
            disable: 'Disable',
            enable: 'Enable',
            resetPassword: 'Reset Password',
            newPassword: 'New Password',
            reset: 'Reset',
            lastLogin: 'Last login',
            createdAt: 'Created',
            never: 'Never',
            you: '(you)',
            notAuthorized: 'You do not have access to this area.',
            changePassword: 'Change Password',
            currentPassword: 'Current Password',
            changePwSave: 'Change',
            changePwSuccess: 'Password changed.',
        };

    const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const setFeedback = (msg, isError) => {
        if (!feedback) return;
        feedback.textContent = msg;
        feedback.hidden = !msg;
        feedback.classList.toggle('admin-toast--error', Boolean(isError));
        if (msg) setTimeout(() => { feedback.hidden = true; }, 4000);
    };

    const adminFetch = async (url, options = {}) => {
        const headers = new Headers(options.headers || {});
        headers.set('Accept', 'application/json');
        if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
        const response = await fetch(url, { ...options, headers, credentials: 'same-origin' });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const error = new Error(payload?.error || payload?.message || response.statusText);
            error.status = response.status;
            throw error;
        }
        return payload;
    };

    const fmtDate = (iso) => {
        if (!iso) return t.never;
        try { return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }); }
        catch { return iso; }
    };

    const getFiltered = () => {
        let list = allUsers;
        const r = roleFilter?.value;
        const s = statusFilter?.value;
        if (r && r !== 'all') list = list.filter((u) => u.role === r);
        if (s && s !== 'all') list = list.filter((u) => u.status === s);
        return list;
    };

    const renderUserList = (users) => {
        if (!usersList) return;
        if (!users.length) {
            usersList.innerHTML = `<p class="admin-empty">${t.noUsers}</p>`;
            return;
        }
        usersList.innerHTML = users.map((u) => {
            const isYou = currentUser && u.id === currentUser.id;
            const selected = u.id === selectedUserId ? ' admin-row--selected' : '';
            const statusDot = u.status === 'active' ? 'admin-dot--success' : 'admin-dot--danger';
            return `<div class="admin-row${selected}" data-user-row data-user-id="${esc(u.id)}">
                <span class="admin-dot ${statusDot}"></span>
                <span class="admin-row__title">${esc(u.displayName)}${isYou ? ` <em>${t.you}</em>` : ''}</span>
                <span class="admin-row__meta">${esc(u.username)} · ${u.role === 'admin' ? t.admin : t.user}</span>
            </div>`;
        }).join('');
    };

    const refreshList = () => {
        const filtered = getFiltered();
        renderUserList(filtered);
        if (userCount) userCount.textContent = t.countLabel(filtered.length);
    };

    const renderDetailPlaceholder = () => {
        if (!detailPane) return;
        detailPane.innerHTML = `<div class="admin-detail-placeholder"><p>${'Select a user to view details and manage their account.'}</p></div>`;
    };

    const renderUserDetail = (user) => {
        if (!detailPane || !user) { renderDetailPlaceholder(); return; }
        const isYou = currentUser && user.id === currentUser.id;
        const statusLabel = user.status === 'active' ? t.active : t.disabled;
        const statusDot = user.status === 'active' ? 'admin-dot--success' : 'admin-dot--danger';
        detailPane.innerHTML = `
            <div class="admin-user-detail-section">
                <h3>${esc(user.displayName)}${isYou ? ` <em>${t.you}</em>` : ''}</h3>
                <div class="admin-user-detail-grid">
                    <div class="admin-user-detail-field">
                        <span class="admin-user-detail-label">${t.username}</span>
                        <span class="admin-user-detail-value">${esc(user.username)}</span>
                    </div>
                    <div class="admin-user-detail-field">
                        <span class="admin-user-detail-label">${t.role}</span>
                        <span class="admin-user-detail-value">${user.role === 'admin' ? t.admin : t.user}</span>
                    </div>
                    <div class="admin-user-detail-field">
                        <span class="admin-user-detail-label">${t.status}</span>
                        <span class="admin-user-detail-value"><span class="admin-dot ${statusDot}"></span> ${statusLabel}</span>
                    </div>
                    <div class="admin-user-detail-field">
                        <span class="admin-user-detail-label">${t.lastLogin}</span>
                        <span class="admin-user-detail-value">${fmtDate(user.lastLoginAt)}</span>
                    </div>
                    <div class="admin-user-detail-field">
                        <span class="admin-user-detail-label">${t.createdAt}</span>
                        <span class="admin-user-detail-value">${fmtDate(user.createdAt)}</span>
                    </div>
                </div>
                <div class="admin-user-actions">
                    <button class="button button--plain-dark button--pill button--sm" type="button" data-edit-user="${esc(user.id)}">${t.editTitle}</button>
                    <button class="button button--plain-dark button--pill button--sm" type="button" data-toggle-status="${esc(user.id)}">${user.status === 'active' ? t.disable : t.enable}</button>
                    <button class="button button--plain-dark button--pill button--sm" type="button" data-reset-pw="${esc(user.id)}">${t.resetPassword}</button>
                    <button class="button button--plain-dark button--pill button--sm button--danger" type="button" data-delete-user="${esc(user.id)}">${t.deleteUser}</button>
                </div>
            </div>`;
    };

    const renderCreateForm = () => {
        if (!detailPane) return;
        detailPane.innerHTML = `
            <div class="admin-user-detail-section">
                <h3>${t.createTitle}</h3>
                <form class="admin-user-form" data-user-create-form>
                    <div class="form-row"><label class="form-label" for="create-username">${t.username}</label>
                        <input class="form-input" id="create-username" name="username" type="text" required minlength="3" maxlength="50" pattern="[a-zA-Z0-9._\\-]+" autocomplete="off"></div>
                    <div class="form-row"><label class="form-label" for="create-displayName">${t.displayName}</label>
                        <input class="form-input" id="create-displayName" name="displayName" type="text" required maxlength="100"></div>
                    <div class="form-row"><label class="form-label" for="create-role">${t.role}</label>
                        <select class="form-input" id="create-role" name="role">
                            <option value="user">${t.user}</option>
                            <option value="admin">${t.admin}</option>
                        </select></div>
                    <div class="form-row"><label class="form-label" for="create-password">${t.password}</label>
                        <input class="form-input" id="create-password" name="password" type="password" required minlength="8" autocomplete="new-password"></div>
                    <div class="admin-user-actions">
                        <button class="button button--primary button--pill button--sm" type="submit">${t.create}</button>
                        <button class="button button--plain-dark button--pill button--sm" type="button" data-cancel-form>${t.cancel}</button>
                    </div>
                    <p class="form-error" data-form-error hidden></p>
                </form>
            </div>`;
    };

    const renderEditForm = (user) => {
        if (!detailPane || !user) return;
        detailPane.innerHTML = `
            <div class="admin-user-detail-section">
                <h3>${t.editTitle}: ${esc(user.displayName)}</h3>
                <form class="admin-user-form" data-user-edit-form data-user-edit-id="${esc(user.id)}">
                    <div class="form-row"><label class="form-label" for="edit-displayName">${t.displayName}</label>
                        <input class="form-input" id="edit-displayName" name="displayName" type="text" required maxlength="100" value="${esc(user.displayName)}"></div>
                    <div class="form-row"><label class="form-label" for="edit-role">${t.role}</label>
                        <select class="form-input" id="edit-role" name="role">
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>${t.user}</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>${t.admin}</option>
                        </select></div>
                    <div class="admin-user-actions">
                        <button class="button button--primary button--pill button--sm" type="submit">${t.save}</button>
                        <button class="button button--plain-dark button--pill button--sm" type="button" data-cancel-form>${t.cancel}</button>
                    </div>
                    <p class="form-error" data-form-error hidden></p>
                </form>
            </div>`;
    };

    const renderResetPasswordForm = (user) => {
        if (!detailPane || !user) return;
        detailPane.innerHTML = `
            <div class="admin-user-detail-section">
                <h3>${t.resetPassword}: ${esc(user.displayName)}</h3>
                <form class="admin-user-form" data-user-resetpw-form data-user-resetpw-id="${esc(user.id)}">
                    <div class="form-row"><label class="form-label" for="resetpw-new">${t.newPassword}</label>
                        <input class="form-input" id="resetpw-new" name="newPassword" type="password" required minlength="8" autocomplete="new-password"></div>
                    <div class="admin-user-actions">
                        <button class="button button--primary button--pill button--sm" type="submit">${t.reset}</button>
                        <button class="button button--plain-dark button--pill button--sm" type="button" data-cancel-form>${t.cancel}</button>
                    </div>
                    <p class="form-error" data-form-error hidden></p>
                </form>
            </div>`;
    };

    const setFormError = (form, msg) => {
        const el = form?.querySelector('[data-form-error]');
        if (!el) return;
        el.textContent = msg || '';
        el.hidden = !msg;
    };

    const setAdminVisible = (visible) => app.querySelectorAll('.admin-card').forEach((c) => { c.hidden = !visible; });
    const authShell = setupAdminAuthShell({
        locale,
        authFailed: t.authFailed,
        authMissing: t.authMissing,
        onAuthenticated: async (user) => {
            currentUser = user;
            setAdminVisible(true);
            await loadUsers();
        },
        onUnauthenticated: () => {
            currentUser = null;
            allUsers = [];
            selectedUserId = null;
            setAdminVisible(false);
            renderUserList([]);
            renderDetailPlaceholder();
        },
        onPasswordChanged: (message) => setFeedback(message, false)
    });

    const loadUsers = async () => {
        try {
            const data = await adminFetch('/api/admin/users');
            allUsers = data.users || [];
            refreshList();
            if (selectedUserId) {
                const u = allUsers.find((u) => u.id === selectedUserId);
                if (u) renderUserDetail(u); else { selectedUserId = null; renderDetailPlaceholder(); }
            }
        } catch (error) {
            allUsers = [];
            renderUserList([]);
            renderDetailPlaceholder();
            if (error.status === 401) {
                await authShell.handleUnauthenticated(t.authFailed);
            }
        }
    };

    // User list click
    usersList?.addEventListener('click', (event) => {
        const row = event.target.closest('[data-user-row]');
        if (!row) return;
        const id = row.getAttribute('data-user-id');
        if (id === selectedUserId) {
            selectedUserId = null;
            refreshList();
            renderDetailPlaceholder();
        } else {
            selectedUserId = id;
            refreshList();
            const u = allUsers.find((u) => u.id === id);
            renderUserDetail(u);
        }
    });

    // Detail pane interactions
    detailPane?.addEventListener('click', async (event) => {
        // Cancel form
        if (event.target.closest('[data-cancel-form]')) {
            const u = allUsers.find((u) => u.id === selectedUserId);
            if (u) renderUserDetail(u); else renderDetailPlaceholder();
            return;
        }

        // Edit button
        const editBtn = event.target.closest('[data-edit-user]');
        if (editBtn) {
            const u = allUsers.find((u) => u.id === editBtn.getAttribute('data-edit-user'));
            if (u) renderEditForm(u);
            return;
        }

        // Toggle status
        const toggleBtn = event.target.closest('[data-toggle-status]');
        if (toggleBtn) {
            const userId = toggleBtn.getAttribute('data-toggle-status');
            try {
                await adminFetch(`/api/admin/users/${userId}/toggle-status`, { method: 'POST' });
                setFeedback(t.statusToggled, false);
                await loadUsers();
            } catch (e) { setFeedback(e.message || t.loadFailed, true); }
            return;
        }

        // Reset password button
        const resetBtn = event.target.closest('[data-reset-pw]');
        if (resetBtn) {
            const u = allUsers.find((u) => u.id === resetBtn.getAttribute('data-reset-pw'));
            if (u) renderResetPasswordForm(u);
            return;
        }

        // Delete button
        const deleteBtn = event.target.closest('[data-delete-user]');
        if (deleteBtn) {
            showInlineConfirm(deleteBtn, async () => {
                const userId = deleteBtn.getAttribute('data-delete-user');
                try {
                    await adminFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
                    setFeedback(t.userDeleted, false);
                    selectedUserId = null;
                    renderDetailPlaceholder();
                    await loadUsers();
                } catch (e) { setFeedback(e.message || t.loadFailed, true); }
            }, t.confirmYes, t.confirmNo);
            return;
        }
    });

    // Form submissions (delegated)
    detailPane?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;

        // Create form
        if (form.hasAttribute('data-user-create-form')) {
            const fd = Object.fromEntries(new FormData(form).entries());
            try {
                const data = await adminFetch('/api/admin/users', { method: 'POST', body: JSON.stringify(fd) });
                setFeedback(t.userCreated, false);
                selectedUserId = data.user?.id || null;
                await loadUsers();
            } catch (e) { setFormError(form, e.message); }
            return;
        }

        // Edit form
        if (form.hasAttribute('data-user-edit-form')) {
            const userId = form.getAttribute('data-user-edit-id');
            const fd = Object.fromEntries(new FormData(form).entries());
            try {
                await adminFetch(`/api/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify(fd) });
                setFeedback(t.userUpdated, false);
                await loadUsers();
            } catch (e) { setFormError(form, e.message); }
            return;
        }

        // Reset password form
        if (form.hasAttribute('data-user-resetpw-form')) {
            const userId = form.getAttribute('data-user-resetpw-id');
            const fd = Object.fromEntries(new FormData(form).entries());
            try {
                await adminFetch(`/api/admin/users/${userId}/reset-password`, { method: 'POST', body: JSON.stringify(fd) });
                setFeedback(t.passwordReset, false);
                const u = allUsers.find((u) => u.id === userId);
                if (u) renderUserDetail(u);
            } catch (e) { setFormError(form, e.message); }
            return;
        }
    });

    // Filters and reload
    roleFilter?.addEventListener('change', () => refreshList());
    statusFilter?.addEventListener('change', () => refreshList());
    reloadButton?.addEventListener('click', () => loadUsers());
    createButton?.addEventListener('click', () => {
        selectedUserId = null;
        refreshList();
        renderCreateForm();
    });

    authShell.loadAuthState();
}

function setupAdminNotifications() {
    const app = document.querySelector('[data-admin-notifications]');
    if (!app) return;

    const locale = 'en';
    const listEl = app.querySelector('[data-admin-notif-list]');
    const detailEl = app.querySelector('[data-admin-notif-detail]');
    const statusEl = app.querySelector('[data-admin-notif-status]');
    const feedback = app.querySelector('[data-admin-feedback]');
    const reloadButton = app.querySelector('[data-admin-notif-reload]');
    const importBundleButton = app.querySelector('[data-admin-notif-import-bundle]');

    const t = {
            authMissing: 'Sign in to manage templates.',
            authFailed: 'Admin sign-in failed.',
            loadFailed: 'Could not load templates.',
            pickTemplate: 'Pick a template from the list to edit its content.',
            mailNotConfigured: 'Mailgun is not configured yet. Mails will not go out.',
            saveButton: 'Save template',
            saveOk: 'Template saved.',
            saveFailed: 'Saving failed.',
            testButton: 'Send test',
            testPromptTo: 'Send test to:',
            testOk: 'Test sent.',
            testFailed: 'Sending failed.',
            exportButton: 'Export template',
            uploadButton: 'Upload image',
            uploadFailed: 'Upload failed.',
            uploadOk: 'Image saved.',
            deleteAsset: 'Delete',
            confirmDeleteAsset: 'Delete this image? References in templates will break.',
            importHtmlButton: 'Import HTML',
            importHtmlHint: 'Paste the exported HTML from your email editor. External images will be downloaded and stored.',
            importHtmlOk: (n) => `HTML imported. ${n} image(s) stored.`,
            importHtmlFailures: (n) => `${n} image(s) could not be imported — see browser console.`,
            importHtmlFailed: 'Import failed.',
            importBundleButton: 'Import template',
            importBundleHint: 'Upload an exported mail template (.json) from another environment.',
            importBundleOk: 'Template imported.',
            importBundleFailed: 'Template import failed.',
            tokensTitle: 'Available tokens',
            tokensHelp: 'Copy tokens into subject / text / HTML. They are replaced with real order data at send time.',
            imagesTitle: 'Images for this template',
            imagesEmpty: 'No images uploaded yet. Upload or import HTML to add some.',
            imagesHint: 'To embed an image in HTML: <img src="/mail/ID.png" alt="…">',
            copyUrl: 'Copy URL',
            copied: 'Copied.',
            tplName: 'Name',
            tplDescription: 'Description',
            tplTrigger: 'Trigger',
            tplRecipient: 'Recipient',
            tplRecipientAdmin: 'Admin (ORDER_NOTIFICATION_TO)',
            tplRecipientCustomer: 'Customer (from the order)',
            tplRecipientCustom: 'Custom address',
            tplRecipientOverride: 'Custom recipient address',
            tplLocale: 'Order locale filter',
            tplLocaleAny: 'Any',
            tplEnabled: 'Enabled',
            tplSubject: 'Subject',
            tplTextBody: 'Plain-text version',
            tplHtmlBody: 'HTML version',
            tplActions: 'Actions',
            trashOk: 'Image deleted.',
            triggerLabels: { 'order.paid': 'Order paid' },
            confirm: 'Confirm',
            cancel: 'Cancel',
            send: 'Send',
            submit: 'Submit',
            close: 'Close'
        };

    let templates = [];
    let assets = [];
    let meta = { mailEnabled: true, triggers: ['order.paid'], recipientTypes: ['admin','customer','custom'], adminRecipient: '' };
    let selectedId = null;
    let dirty = false;
    let currentFormValues = null;

    const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const setFeedback = (msg, isError) => {
        if (!feedback) return;
        feedback.textContent = msg;
        feedback.hidden = !msg;
        feedback.classList.toggle('admin-toast--error', Boolean(isError));
        if (msg) setTimeout(() => { feedback.hidden = true; }, 4000);
    };

    const setStatus = (msg, variant) => {
        if (!statusEl) return;
        statusEl.textContent = msg || '';
        statusEl.hidden = !msg;
        statusEl.className = 'admin-notif-status';
        if (variant) statusEl.classList.add(`admin-notif-status--${variant}`);
    };

    const adminFetch = async (url, options = {}) => {
        const headers = new Headers(options.headers || {});
        headers.set('Accept', 'application/json');
        if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
        const response = await fetch(url, { ...options, headers, credentials: 'same-origin' });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const error = new Error(payload?.error || payload?.message || response.statusText);
            error.status = response.status;
            error.payload = payload;
            throw error;
        }
        return payload;
    };

    const formatDate = (iso) => {
        if (!iso) return '';
        try { return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }); }
        catch { return iso; }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(0)} KB`;
        return `${(kb / 1024).toFixed(2)} MB`;
    };

    const recipientTypeLabel = (type) => ({
        admin: t.tplRecipientAdmin,
        customer: t.tplRecipientCustomer,
        custom: t.tplRecipientCustom
    }[type] || type);

    const triggerLabel = (trigger) => t.triggerLabels[trigger] || trigger;

    const loadTemplates = async () => {
        try {
            const data = await adminFetch('/api/admin/notification-templates');
            templates = data.templates || [];
            meta = data.meta || meta;
            if (!meta.mailEnabled) setStatus(t.mailNotConfigured, 'warn');
            else setStatus('');
        } catch (error) {
            templates = [];
            setStatus(t.loadFailed, 'error');
            throw error;
        }
    };

    const loadAssets = async () => {
        try {
            const data = await adminFetch('/api/admin/email-assets');
            assets = data.assets || [];
        } catch {
            assets = [];
        }
    };

    const renderList = () => {
        if (!listEl) return;
        if (!templates.length) {
            listEl.innerHTML = `<p class="admin-empty">${esc(t.loadFailed)}</p>`;
            return;
        }
        listEl.innerHTML = templates.map((tpl) => {
            const selected = tpl.id === selectedId ? ' is-selected' : '';
            const dot = tpl.enabled ? 'admin-dot--success' : 'admin-dot--danger';
            return `<div class="admin-order-item${selected}" data-notif-row data-notif-id="${esc(tpl.id)}" role="button" tabindex="0">
                <div class="admin-order-item__body">
                    <span class="admin-order-item__name">${esc(tpl.name)}</span>
                </div>
                <span class="admin-dot ${dot}"></span>
            </div>`;
        }).join('');

        listEl.querySelectorAll('[data-notif-row]').forEach((row) => {
            const activate = () => selectTemplate(row.getAttribute('data-notif-id'));
            row.addEventListener('click', activate);
            row.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    activate();
                }
            });
        });
    };

    const PREVIEW_CONTEXT = {
        appBaseUrl: window.location.origin,
        brand: {
            name: 'Indiebox',
            email: 'indiebox@brainbot.com',
            websiteUrl: 'https://indiebox.ai',
            websiteDomain: 'indiebox.ai'
        },
        order: {
            id: 'preview-order',
            orderNumber: 999,
            product: 'Indiebox AI-Workstation',
            amount: '3999.00',
            currency: 'EUR',
            paymentMethod: 'creditcard',
            paidAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            notes: 'Please ring Mustermann.',
            notesHtml: 'Please ring Mustermann.',
            locale,
            adminUrl: `${window.location.origin}/admin/orders.html`,
            statusUrl: `${window.location.origin}/checkout-status.html`
        },
        customer: {
            firstName: 'Alex',
            lastName: 'Example',
            fullName: 'Alex Example',
            email: 'kunde@example.com',
            phone: '+49 171 0000000',
            company: 'Example GmbH',
            phoneLine: ('Phone') + ': +49 171 0000000',
            companyLine: ('Company') + (': Example GmbH')
        },
        billingAddress: {
            careOf: '',
            street: 'Musterstraße 1',
            zip: '55116',
            city: 'Mainz',
            country: 'Germany',
            block: `Musterstraße 1\n55116 Mainz\n${'Germany'}`,
            blockHtml: `Musterstraße 1<br>55116 Mainz<br>${'Germany'}`
        },
        shippingAddress: {
            careOf: '',
            street: 'Musterstraße 1',
            zip: '55116',
            city: 'Mainz',
            country: 'Germany',
            block: `Musterstraße 1\n55116 Mainz\n${'Germany'}`,
            blockHtml: `Musterstraße 1<br>55116 Mainz<br>${'Germany'}`
        }
    };

    const resolvePath = (ctx, path) => path.split('.').reduce((obj, key) => (obj == null ? obj : obj[key]), ctx);

    const renderTemplate = (template, mode) => {
        if (!template) return '';
        return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, path) => {
            const value = resolvePath(PREVIEW_CONTEXT, path);
            if (value === undefined || value === null) return '';
            const stringValue = String(value);
            if (mode === 'html') {
                const lastKey = path.split('.').pop() || '';
                if (lastKey.endsWith('Html')) return stringValue;
                return esc(stringValue);
            }
            return stringValue;
        });
    };

    const rewriteRelativeMailToAbsolute = (html) => {
        if (!html) return html;
        const prefix = `${window.location.origin}/mail/`;
        return html.replace(
            /(src|href)(\s*=\s*)(["'])(\/mail\/)([^"']+)(["'])/gi,
            (_m, a, eq, q1, _rp, path, q2) => `${a}${eq}${q1}${prefix}${path}${q2}`
        );
    };

    const buildPreviewHtml = (htmlTemplate) => {
        const rendered = renderTemplate(htmlTemplate, 'html');
        const absolute = rewriteRelativeMailToAbsolute(rendered);
        return `<!doctype html><html><head><meta charset="utf-8"><base href="${window.location.origin}/"></head><body style="margin:0;">${absolute}</body></html>`;
    };

    const renderAssets = () => {
        if (!assets.length) {
            return `<p class="admin-empty">${esc(t.imagesEmpty)}</p>`;
        }
        return `<ul class="admin-notif-asset-list">${assets.map((asset) => `
            <li class="admin-notif-asset">
                <img class="admin-notif-asset__thumb" src="${esc(asset.url)}" alt="">
                <div class="admin-notif-asset__info">
                    <span class="admin-notif-asset__filename">${esc(asset.filename)}</span>
                    <span class="admin-notif-asset__meta">${esc(asset.mimeType)} · ${esc(formatBytes(asset.size))}</span>
                    <code class="admin-notif-asset__url">${esc(asset.url)}</code>
                </div>
                <div class="admin-notif-asset__actions">
                    <button type="button" class="button button--plain-light button--pill button--sm" data-notif-copy-url data-url="${esc(asset.url)}">${esc(t.copyUrl)}</button>
                    <button type="button" class="button button--plain-light button--pill button--sm" data-notif-delete-asset data-id="${esc(asset.id)}">${esc(t.deleteAsset)}</button>
                </div>
            </li>
        `).join('')}</ul>`;
    };

    let htmlViewMode = 'edit';

    const renderHtmlEditor = (htmlValue) => {
        if (htmlViewMode === 'preview') {
            const previewDoc = buildPreviewHtml(htmlValue);
            const encoded = previewDoc.replace(/"/g, '&quot;');
            return `<iframe class="admin-notif-preview-frame" data-notif-preview-frame sandbox srcdoc="${encoded}" title="${esc('Template preview')}"></iframe>`;
        }
        return `<textarea class="form-input admin-notif-textarea admin-notif-textarea--code" data-notif-field="htmlTemplate" rows="20" spellcheck="false">${esc(htmlValue)}</textarea>`;
    };

    const renderDetail = () => {
        if (!detailEl) return;
        const tpl = templates.find((x) => x.id === selectedId);
        if (!tpl) {
            detailEl.innerHTML = `<div class="admin-detail-placeholder"><p>${esc(t.pickTemplate)}</p></div>`;
            return;
        }

        const form = currentFormValues || tpl;
        const recipientOptions = meta.recipientTypes
            .map((type) => `<option value="${esc(type)}"${type === form.recipientType ? ' selected' : ''}>${esc(recipientTypeLabel(type))}</option>`)
            .join('');
        const triggerOptions = meta.triggers
            .map((tr) => `<option value="${esc(tr)}"${tr === form.triggerEvent ? ' selected' : ''}>${esc(triggerLabel(tr))}</option>`)
            .join('');

        const htmlValue = form.htmlTemplate || '';

        detailEl.innerHTML = `
            <div class="admin-notif-detail" data-notif-detail>
                <header class="admin-notif-detail__header">
                    <div class="admin-notif-detail__title-group">
                        <h3>${esc(tpl.name)}</h3>
                        <p class="admin-notif-detail__subtitle">${esc(triggerLabel(tpl.triggerEvent))} · ${esc(recipientTypeLabel(tpl.recipientType))}${tpl.locale ? ' · ' + esc(tpl.locale.toUpperCase()) : ''} · ${esc('Updated')} ${esc(formatDate(tpl.updatedAt))}</p>
                    </div>
                    <label class="admin-notif-switch">
                        <input type="checkbox" data-notif-field="enabled"${form.enabled ? ' checked' : ''}>
                        <span class="admin-notif-switch__track"><span class="admin-notif-switch__thumb"></span></span>
                        <span class="admin-notif-switch__label">${esc(t.tplEnabled)}</span>
                    </label>
                </header>

                <form class="admin-notif-form" data-notif-form>
                    <div class="admin-notif-fieldset">
                        <div class="admin-notif-field">
                            <label class="admin-notif-label">${esc(t.tplName)}</label>
                            <input class="admin-notif-input" type="text" data-notif-field="name" value="${esc(form.name)}" required>
                        </div>
                        <div class="admin-notif-field">
                            <label class="admin-notif-label">${esc(t.tplDescription)}</label>
                            <input class="admin-notif-input" type="text" data-notif-field="description" value="${esc(form.description || '')}">
                        </div>
                        <div class="admin-notif-row-3">
                            <div class="admin-notif-field">
                                <label class="admin-notif-label">${esc(t.tplTrigger)}</label>
                                <select class="admin-notif-input" data-notif-field="triggerEvent">${triggerOptions}</select>
                            </div>
                            <div class="admin-notif-field">
                                <label class="admin-notif-label">${esc(t.tplRecipient)}</label>
                                <select class="admin-notif-input" data-notif-field="recipientType">${recipientOptions}</select>
                            </div>
                            <div class="admin-notif-field">
                                <label class="admin-notif-label">${esc(t.tplLocale)}</label>
                                <select class="admin-notif-input" data-notif-field="locale">
                                    <option value=""${!form.locale ? ' selected' : ''}>${esc(t.tplLocaleAny)}</option>
                                    <option value="de"${form.locale === 'de' ? ' selected' : ''}>DE</option>
                                    <option value="en"${form.locale === 'en' ? ' selected' : ''}>EN</option>
                                </select>
                            </div>
                        </div>
                        <div class="admin-notif-field" data-notif-recipient-override ${form.recipientType === 'custom' ? '' : 'hidden'}>
                            <label class="admin-notif-label">${esc(t.tplRecipientOverride)}</label>
                            <input class="admin-notif-input" type="email" data-notif-field="recipientOverride" value="${esc(form.recipientOverride || '')}" placeholder="name@example.com">
                        </div>
                        <div class="admin-notif-field">
                            <label class="admin-notif-label">${esc(t.tplSubject)}</label>
                            <input class="admin-notif-input" type="text" data-notif-field="subjectTemplate" value="${esc(form.subjectTemplate)}" required>
                        </div>
                    </div>

                    <div class="admin-notif-block">
                        <div class="admin-notif-block__header">
                            <h4 class="admin-notif-block__title">${esc(t.tplTextBody)}</h4>
                        </div>
                        <textarea class="form-input admin-notif-textarea" data-notif-field="textTemplate" rows="10" spellcheck="false">${esc(form.textTemplate)}</textarea>
                    </div>

                    <div class="admin-notif-block">
                        <div class="admin-notif-block__header">
                            <h4 class="admin-notif-block__title">${esc(t.tplHtmlBody)}</h4>
                            <div class="admin-notif-block__actions">
                                <div class="admin-notif-view-toggle" role="tablist">
                                    <button type="button" role="tab" class="admin-notif-view-toggle__btn${htmlViewMode === 'edit' ? ' is-active' : ''}" data-notif-html-mode="edit" aria-selected="${htmlViewMode === 'edit'}">${esc('Edit')}</button>
                                    <button type="button" role="tab" class="admin-notif-view-toggle__btn${htmlViewMode === 'preview' ? ' is-active' : ''}" data-notif-html-mode="preview" aria-selected="${htmlViewMode === 'preview'}">${esc('Preview')}</button>
                                </div>
                                <button type="button" class="button button--plain-light button--pill button--sm" data-notif-import-html>${esc(t.importHtmlButton)}</button>
                            </div>
                        </div>
                        <div class="admin-notif-html-body" data-notif-html-body>${renderHtmlEditor(htmlValue)}</div>
                        <p class="admin-notif-hint admin-notif-hint--muted">${esc(t.imagesHint)}</p>
                    </div>

                    <div class="admin-notif-block">
                        <div class="admin-notif-block__header">
                            <h4 class="admin-notif-block__title">${esc(t.imagesTitle)}</h4>
                            <div class="admin-notif-block__actions">
                                <button type="button" class="button button--plain-light button--pill button--sm" data-notif-upload-asset>${esc(t.uploadButton)}</button>
                                <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" data-notif-upload-input hidden>
                            </div>
                        </div>
                        <div data-notif-asset-list>${renderAssets()}</div>
                    </div>

                    <div class="admin-notif-actions">
                        <button type="submit" class="button button--plain-dark button--pill button--md" data-notif-save>${esc(t.saveButton)}</button>
                        <button type="button" class="button button--plain-light button--pill button--md" data-notif-test>${esc(t.testButton)}</button>
                        <button type="button" class="button button--plain-light button--pill button--md" data-notif-export>${esc(t.exportButton)}</button>
                    </div>
                </form>
            </div>
        `;

        bindDetailHandlers();
    };

    const swapHtmlBody = () => {
        const bodyEl = detailEl.querySelector('[data-notif-html-body]');
        if (!bodyEl) return;
        const currentValue = (currentFormValues?.htmlTemplate)
            ?? (templates.find((x) => x.id === selectedId)?.htmlTemplate)
            ?? '';
        bodyEl.innerHTML = renderHtmlEditor(currentValue);
        // Re-bind event for the new textarea (if edit mode)
        const ta = bodyEl.querySelector('textarea[data-notif-field="htmlTemplate"]');
        if (ta) {
            ta.addEventListener('input', () => {
                dirty = true;
                currentFormValues = collectFormValues();
            });
        }
        // Update toggle button states
        detailEl.querySelectorAll('[data-notif-html-mode]').forEach((btn) => {
            const mode = btn.getAttribute('data-notif-html-mode');
            const active = mode === htmlViewMode;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-selected', String(active));
        });
    };

    const collectFormValues = () => {
        const detail = detailEl.querySelector('[data-notif-detail]');
        if (!detail) return null;
        const tpl = templates.find((x) => x.id === selectedId);
        const values = { ...(currentFormValues || tpl || {}) };
        detail.querySelectorAll('[data-notif-field]').forEach((el) => {
            const key = el.getAttribute('data-notif-field');
            if (el.type === 'checkbox') values[key] = el.checked;
            else values[key] = el.value;
        });
        return values;
    };

    const bindDetailHandlers = () => {
        const form = detailEl.querySelector('[data-notif-form]');
        if (!form) return;

        form.querySelectorAll('[data-notif-field]').forEach((el) => {
            const evt = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'input';
            el.addEventListener(evt, () => {
                dirty = true;
                currentFormValues = collectFormValues();
                const recipientOverride = detailEl.querySelector('[data-notif-recipient-override]');
                if (el.getAttribute('data-notif-field') === 'recipientType' && recipientOverride) {
                    if (el.value === 'custom') recipientOverride.removeAttribute('hidden');
                    else recipientOverride.setAttribute('hidden', '');
                }
            });
        });

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            await saveTemplate();
        });

        form.querySelector('[data-notif-test]')?.addEventListener('click', () => sendTest());
        form.querySelector('[data-notif-export]')?.addEventListener('click', () => exportTemplate());
        form.querySelector('[data-notif-import-html]')?.addEventListener('click', () => openImportHtmlDialog());

        const uploadButton = form.querySelector('[data-notif-upload-asset]');
        const uploadInput = form.querySelector('[data-notif-upload-input]');
        uploadButton?.addEventListener('click', () => uploadInput?.click());
        uploadInput?.addEventListener('change', () => {
            const file = uploadInput.files?.[0];
            if (file) handleAssetUpload(file).finally(() => { uploadInput.value = ''; });
        });

        form.querySelectorAll('[data-notif-copy-url]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const url = btn.getAttribute('data-url') || '';
                navigator.clipboard?.writeText(url).then(() => setFeedback(t.copied));
            });
        });

        form.querySelectorAll('[data-notif-delete-asset]').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (!confirm(t.confirmDeleteAsset)) return;
                deleteAsset(btn.getAttribute('data-id'));
            });
        });

        form.querySelectorAll('[data-notif-html-mode]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-notif-html-mode');
                if (mode !== 'edit' && mode !== 'preview') return;
                // Save current textarea value before switching
                currentFormValues = collectFormValues();
                htmlViewMode = mode;
                swapHtmlBody();
            });
        });
    };

    const selectTemplate = (id) => {
        if (dirty && !confirm('Discard unsaved changes?')) return;
        selectedId = id;
        currentFormValues = null;
        dirty = false;
        renderList();
        renderDetail();
    };

    const saveTemplate = async () => {
        const tpl = templates.find((x) => x.id === selectedId);
        if (!tpl) return;
        const values = collectFormValues();
        if (!values) return;

        const patch = {
            name: values.name?.trim(),
            description: values.description || '',
            triggerEvent: values.triggerEvent,
            recipientType: values.recipientType,
            recipientOverride: values.recipientOverride || '',
            locale: values.locale || '',
            enabled: Boolean(values.enabled),
            subjectTemplate: values.subjectTemplate,
            textTemplate: values.textTemplate,
            htmlTemplate: values.htmlTemplate || ''
        };

        try {
            const response = await adminFetch(`/api/admin/notification-templates/${encodeURIComponent(tpl.id)}`, {
                method: 'PATCH',
                body: JSON.stringify(patch)
            });
            const updated = response.template;
            const idx = templates.findIndex((x) => x.id === tpl.id);
            if (idx >= 0) templates[idx] = updated;
            dirty = false;
            currentFormValues = null;
            renderList();
            renderDetail();
            setFeedback(t.saveOk);
        } catch (error) {
            setFeedback(`${t.saveFailed} ${error.message || ''}`, true);
        }
    };

    const sendTest = async () => {
        const tpl = templates.find((x) => x.id === selectedId);
        if (!tpl) return;

        const defaultTo = meta.adminRecipient || '';
        const to = prompt(t.testPromptTo, defaultTo);
        if (to === null) return;
        const recipient = to.trim();
        if (!recipient) return;

        try {
            await adminFetch(`/api/admin/notification-templates/${encodeURIComponent(tpl.id)}/test`, {
                method: 'POST',
                body: JSON.stringify({ to: recipient })
            });
            setFeedback(`${t.testOk} → ${recipient}`);
        } catch (error) {
            setFeedback(`${t.testFailed} ${error.message || ''}`, true);
        }
    };

    const exportTemplate = () => {
        if (!selectedId) return;
        const url = `/api/admin/notification-templates/${encodeURIComponent(selectedId)}/export`;
        const a = document.createElement('a');
        a.href = url;
        a.rel = 'noopener';
        a.click();
    };

    const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result || '';
            const commaIndex = String(result).indexOf(',');
            resolve(commaIndex >= 0 ? String(result).slice(commaIndex + 1) : String(result));
        };
        reader.onerror = () => reject(reader.error || new Error('read_failed'));
        reader.readAsDataURL(file);
    });

    const readFileAsText = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('read_failed'));
        reader.readAsText(file);
    });

    const handleAssetUpload = async (file) => {
        try {
            const base64 = await readFileAsBase64(file);
            const response = await adminFetch('/api/admin/email-assets', {
                method: 'POST',
                body: JSON.stringify({
                    filename: file.name,
                    mimeType: file.type,
                    dataBase64: base64
                })
            });
            const asset = response.asset;
            if (asset) {
                const existing = assets.find((x) => x.id === asset.id);
                if (!existing) assets.unshift(asset);
                else Object.assign(existing, asset);
            }
            refreshAssetList();
            setFeedback(t.uploadOk);
        } catch (error) {
            setFeedback(`${t.uploadFailed} ${error.message || ''}`, true);
        }
    };

    const refreshAssetList = () => {
        const listPane = detailEl.querySelector('[data-notif-asset-list]');
        if (!listPane) return;
        listPane.innerHTML = renderAssets();
        // Re-bind copy/delete handlers on the new nodes
        listPane.querySelectorAll('[data-notif-copy-url]').forEach((btn) => {
            btn.addEventListener('click', () => {
                navigator.clipboard?.writeText(btn.getAttribute('data-url') || '').then(() => setFeedback(t.copied));
            });
        });
        listPane.querySelectorAll('[data-notif-delete-asset]').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (!confirm(t.confirmDeleteAsset)) return;
                deleteAsset(btn.getAttribute('data-id'));
            });
        });
    };

    const deleteAsset = async (id) => {
        try {
            await adminFetch(`/api/admin/email-assets/${encodeURIComponent(id)}`, { method: 'DELETE' });
            assets = assets.filter((a) => a.id !== id);
            refreshAssetList();
            setFeedback(t.trashOk);
        } catch (error) {
            setFeedback(error.message || t.uploadFailed, true);
        }
    };

    const openImportHtmlDialog = () => {
        if (!selectedId) return;
        const value = prompt(t.importHtmlHint, '');
        if (value === null) return;
        const html = value.trim();
        if (!html) return;
        importHtmlForTemplate(html);
    };

    const importHtmlForTemplate = async (html) => {
        const tpl = templates.find((x) => x.id === selectedId);
        if (!tpl) return;
        try {
            const response = await adminFetch(`/api/admin/notification-templates/${encodeURIComponent(tpl.id)}/import-html`, {
                method: 'POST',
                body: JSON.stringify({ html })
            });
            const updated = response.template;
            const idx = templates.findIndex((x) => x.id === tpl.id);
            if (idx >= 0) templates[idx] = updated;
            currentFormValues = null;
            dirty = false;
            await loadAssets();
            renderDetail();
            setFeedback(t.importHtmlOk(response.importedImages || 0));
            if (response.failures?.length) {
                console.warn('HTML import: some images failed', response.failures);
                setTimeout(() => setFeedback(t.importHtmlFailures(response.failures.length), true), 1200);
            }
        } catch (error) {
            setFeedback(`${t.importHtmlFailed} ${error.message || ''}`, true);
        }
    };

    const importBundleFromText = async (jsonText) => {
        let parsed;
        try { parsed = JSON.parse(jsonText); }
        catch { setFeedback(t.importBundleFailed + ' (JSON)', true); return; }

        try {
            const response = await adminFetch('/api/admin/notification-templates/import-bundle', {
                method: 'POST',
                body: JSON.stringify(parsed)
            });
            setFeedback(t.importBundleOk);
            await Promise.all([loadTemplates(), loadAssets()]);
            if (response.template?.id) selectedId = response.template.id;
            renderList();
            renderDetail();
        } catch (error) {
            setFeedback(`${t.importBundleFailed} ${error.message || ''}`, true);
        }
    };

    const openImportBundleDialog = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json,.json';
        input.addEventListener('change', async () => {
            const file = input.files?.[0];
            if (!file) return;
            const text = await readFileAsText(file);
            await importBundleFromText(text);
        });
        input.click();
    };

    reloadButton?.addEventListener('click', async () => {
        await Promise.all([loadTemplates(), loadAssets()]);
        renderList();
        if (selectedId && !templates.find((tpl) => tpl.id === selectedId)) {
            selectedId = null;
        }
        renderDetail();
    });

    importBundleButton?.addEventListener('click', openImportBundleDialog);

    const authShell = setupAdminAuthShell({
        locale,
        authFailed: t.authFailed,
        authMissing: t.authMissing,
        onAuthenticated: async () => {
            await Promise.all([loadTemplates(), loadAssets()]);
            renderList();
            renderDetail();
        },
        onUnauthenticated: () => {
            templates = [];
            assets = [];
            selectedId = null;
            if (listEl) listEl.innerHTML = '';
            if (detailEl) detailEl.innerHTML = `<div class="admin-detail-placeholder"><p>${esc(t.pickTemplate)}</p></div>`;
        }
    });

    authShell.loadAuthState();
}

function setupAdminRoleGuard() {
    // On any admin page: after session check, if user is not admin, hide admin content and show message
    const adminContainers = document.querySelectorAll('[data-admin-inventory], [data-admin-orders], [data-admin-users], [data-admin-notifications]');
    if (!adminContainers.length) return;

    const locale = 'en';
    const msg = 'You do not have access to this area.';

    fetch('/api/admin/session', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
            if (!data?.authenticated || !data?.user) return;
            if (data.user.role === 'admin') return;
            // Non-admin user: hide admin content
            adminContainers.forEach((c) => {
                c.innerHTML = `<div class="admin-not-authorized"><p>${msg}</p></div>`;
            });
            // Hide admin nav links
            document.querySelectorAll('.admin-subnav a').forEach((link) => {
                const href = link.getAttribute('href') || '';
                if (href.includes('inventory') || href.includes('orders') || href.includes('users') || href.includes('notifications')) {
                    link.style.display = 'none';
                }
            });
        })
        .catch(() => {});
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
    setupMailtoForms();
    setupCheckoutInventory();
    setupCheckoutPaymentMethods();
    setupCheckoutFormPanels();
    setupCheckoutValidation();
    setupCheckoutTestFill();
    setupAdminInventory();
    setupAdminOrders();
    setupAdminUsers();
    setupAdminNotifications();
    setupAdminRoleGuard();
});
