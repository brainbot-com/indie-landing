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

            return field.checkValidity();
        };

        fields.forEach((field) => {
            field.addEventListener('input', () => validateField(field));
            field.addEventListener('change', () => validateField(field));
        });

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

function setupAdminInventory() {
    const app = document.querySelector('[data-admin-inventory]');
    if (!app) return;

    const locale = app.getAttribute('data-locale') === 'en' ? 'en' : 'de';
    const productKey = app.getAttribute('data-product-key') || 'indiebox-ai-workstation';
    const passwordInput = document.querySelector('[data-admin-password-input]');
    const authStatus = document.querySelector('[data-admin-auth-status]');
    const authForm = document.querySelector('[data-admin-auth-form]');
    const clearAuthButton = document.querySelector('[data-admin-clear-auth]');
    const articleForm = app.querySelector('[data-admin-article-form]');
    const articlesList = app.querySelector('[data-admin-articles-list]');
    const procurementForm = app.querySelector('[data-admin-procurement-form]');
    const procurementList = app.querySelector('[data-admin-procurement-list]');
    const allocationsList = app.querySelector('[data-admin-allocations-list]');
    const devicesForm = app.querySelector('[data-admin-device-form]');
    const devicesList = app.querySelector('[data-admin-devices-list]');
    const articleSelect = app.querySelector('[data-article-select]');
    const feedback = app.querySelector('[data-admin-feedback]');

    const m = locale === 'en'
        ? {
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
            statusOrdered: 'On order', statusReserved: 'Reserved for order', statusInStock: 'In stock',
            markUnavailable: 'Mark unavailable', markAvailable: 'Mark available',
            markInStock: 'Received – enter serial',
            save: 'Save', retire: 'Retire',
            deleteArticle: 'Delete',
            confirmDeleteArticle: 'Delete this article? This cannot be undone.',
            vatIncl: 'incl. VAT', vatExcl: 'excl. VAT'
        }
        : {
            authMissing: 'Anmelden, um die internen Bestandsdaten zu laden.',
            authSaved: 'Admin-Sitzung ist aktiv.',
            authCleared: 'Admin-Sitzung wurde beendet.',
            authFailed: 'Admin-Anmeldung fehlgeschlagen.',
            loadFailed: 'Die internen Bestandsdaten konnten nicht geladen werden.',
            saved: 'Änderungen gespeichert.',
            created: 'Lieferantenbestellung angelegt.',
            deviceAdded: 'Gerät hinzugefügt.',
            deviceSaved: 'Gerät gespeichert.',
            articleCreated: 'Artikel angelegt.',
            articleSaved: 'Artikel gespeichert.',
            articleDeleted: 'Artikel gelöscht.',
            noOrders: 'Es wurden noch keine Lieferantenbestellungen erfasst.',
            noAllocations: 'Es wurden noch keine Kundenbestellungen gegen den Bestand reserviert.',
            noDevices: 'Noch keine Geräte im Lager.',
            noArticles: 'Noch keine Artikel im Katalog.',
            allocationSaved: 'Reservierung gespeichert.',
            statusAvailable: 'Verfügbar', statusAssigned: 'Zugewiesen', statusRetired: 'Ausgemustert', statusUnavailable: 'Nicht verfügbar',
            statusOrdered: 'Bestellt', statusReserved: 'Reserviert für Bestellung', statusInStock: 'Auf Lager',
            markUnavailable: 'Sperren', markAvailable: 'Freigeben',
            markInStock: 'Erhalten – Seriennr. eingeben',
            save: 'Speichern', retire: 'Ausmustern',
            deleteArticle: 'Löschen',
            confirmDeleteArticle: 'Diesen Artikel löschen? Das kann nicht rückgängig gemacht werden.',
            vatIncl: 'inkl. MwSt.', vatExcl: 'zzgl. MwSt.'
        };

    const setFeedback = (message, isError = false) => {
        if (!feedback) return;
        feedback.hidden = !message;
        feedback.textContent = message || '';
        feedback.classList.toggle('form-alert--error', Boolean(isError));
    };

    const setAuthStatus = (message, isError = false) => {
        if (!authStatus) return;
        authStatus.textContent = message;
        authStatus.classList.toggle('admin-header-auth__status--error', Boolean(isError));
        authStatus.classList.toggle('admin-header-auth__status--ok', !isError && Boolean(message));
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
            const mfr = model.manufacturer || (locale === 'en' ? 'No manufacturer' : 'Kein Hersteller');
            if (!groups.has(mfr)) groups.set(mfr, []);
            groups.get(mfr).push(model);
        }
        const html = Array.from(groups.entries()).map(([mfr, models]) => `
            <div class="admin-article-group">
                <div class="admin-article-group__label">${esc(mfr)}</div>
                ${models.map((model) => `
                <div class="admin-article-row" data-article-row data-product-key="${esc(model.productKey)}">
                    <div class="admin-article-row__main">
                        <input class="form-input admin-table-input" type="text" name="productName" value="${esc(model.productName)}" placeholder="${locale === 'en' ? 'Article name' : 'Artikelname'}">
                        <input class="form-input admin-table-input" type="text" name="manufacturer" value="${esc(model.manufacturer || '')}" placeholder="${locale === 'en' ? 'Manufacturer' : 'Hersteller'}">
                        <input class="form-input admin-table-input" type="text" name="systemSpec" value="${esc(model.systemSpec || '')}" placeholder="${locale === 'en' ? 'Specification' : 'Spezifikation'}">
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
        if (status === 'reserved') return { label: m.statusReserved, cls: 'reserved' };
        if (status === 'assigned') return { label: m.statusAssigned, cls: 'assigned' };
        if (status === 'unavailable') return { label: m.statusUnavailable, cls: 'unavailable' };
        return { label: m.statusRetired, cls: 'retired' };
    };

    const renderDevices = (devices) => {
        if (!devicesList) return;
        if (!devices.length) {
            devicesList.innerHTML = `<p class="admin-empty">${m.noDevices}</p>`;
            return;
        }
        const rows = devices.map((d) => {
            const st = deviceStatusLabel(d.status);
            const editable = !['packed', 'shipped', 'delivered', 'fulfilled', 'retired'].includes(d.status);
            const modelInfo = [d.manufacturer, d.modelName].filter(Boolean).join(' · ');
            return `<tr data-device-row data-device-id="${esc(d.id)}">
                <td>
                    ${modelInfo ? `<div style="font-size:0.72rem;color:rgba(15,23,42,0.5);margin-bottom:0.15rem">${esc(modelInfo)}</div>` : ''}
                    <input class="form-input admin-table-input" type="text" name="serialNumber" value="${esc(d.serialNumber)}" ${editable ? '' : 'disabled'}>
                    ${d.supplierName ? `<div style="font-size:0.72rem;color:rgba(15,23,42,0.45);margin-top:0.15rem">${esc(d.supplierName)}${d.expectedDeliveryAt ? ` · ${esc(d.expectedDeliveryAt)}` : ''}</div>` : ''}
                </td>
                <td><input class="form-input admin-table-input" type="text" name="deviceUsername" value="${esc(d.deviceUsername)}" ${editable ? '' : 'disabled'}></td>
                <td><input class="form-input admin-table-input" type="text" name="devicePassword" value="${esc(d.devicePassword)}" ${editable ? '' : 'disabled'}></td>
                <td><textarea class="form-textarea admin-table-textarea" name="notes" rows="2" ${editable ? '' : 'disabled'}>${esc(d.notes)}</textarea></td>
                <td><span class="admin-device-status admin-device-status--${esc(st.cls)}">${esc(st.label)}</span></td>
                ${d.assignedOrderId ? `<td class="admin-table-code" style="font-size:0.7rem;color:rgba(15,23,42,0.45)">${esc(d.assignedOrderId.slice(-8))}</td>` : '<td>–</td>'}
                <td class="admin-table-action" style="white-space:nowrap;display:flex;flex-direction:column;gap:0.3rem;padding:0.4rem 0.6rem">
                    ${editable ? `<button type="button" class="button button--plain-dark button--pill button--sm" data-save-device>${esc(m.save)}</button>` : ''}
                    ${d.status === 'ordered' ? `<button type="button" class="button button--plain-light button--pill button--sm" data-mark-in-stock>${esc(m.markInStock)}</button>` : ''}
                    ${d.status === 'available' ? `<button type="button" class="button button--plain-light button--pill button--sm" data-toggle-unavailable data-next-status="unavailable">${esc(m.markUnavailable)}</button>` : ''}
                    ${d.status === 'unavailable' ? `<button type="button" class="button button--plain-light button--pill button--sm" data-toggle-unavailable data-next-status="available">${esc(m.markAvailable)}</button>` : ''}
                    ${editable ? `<button type="button" class="button button--plain-light button--pill button--sm" data-retire-device>${esc(m.retire)}</button>` : ''}
                </td>
            </tr>`;
        }).join('');
        devicesList.innerHTML = `
            <div class="admin-table-wrap">
                <table class="admin-device-table">
                    <thead><tr>
                        <th>${locale === 'en' ? 'Serial / Model' : 'Seriennr. / Modell'}</th>
                        <th>${locale === 'en' ? 'Username' : 'Benutzer'}</th>
                        <th>${locale === 'en' ? 'Password' : 'Passwort'}</th>
                        <th>${locale === 'en' ? 'Notes' : 'Notizen'}</th>
                        <th>${locale === 'en' ? 'Status' : 'Status'}</th>
                        <th>${locale === 'en' ? 'Order' : 'Bestellung'}</th>
                        <th></th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
    };

    const supplierStatusOptions = (currentValue) => {
        const options = [
            ['ordered', locale === 'en' ? 'Ordered' : 'Bestellt'],
            ['in_transit', locale === 'en' ? 'In transit' : 'Unterwegs'],
            ['received', locale === 'en' ? 'Received' : 'Geliefert'],
            ['in_stock', locale === 'en' ? 'In stock' : 'Auf Lager'],
            ['cancelled', locale === 'en' ? 'Cancelled' : 'Storniert']
        ];
        return options.map(([value, label]) => `<option value="${esc(value)}"${value === currentValue ? ' selected' : ''}>${esc(label)}</option>`).join('');
    };

    const renderSupplierOrders = (supplierOrders, deviceModels) => {
        if (!procurementList) return;
        if (!supplierOrders.length) {
            procurementList.innerHTML = `<p class="admin-empty">${m.noOrders}</p>`;
            return;
        }
        const modelMap = new Map((deviceModels || []).map((dm) => [dm.productKey, dm]));
        const articleOptions = (currentKey) => (deviceModels || []).map((model) =>
            `<option value="${esc(model.productKey)}"${model.productKey === currentKey ? ' selected' : ''}>${esc([model.manufacturer, model.productName].filter(Boolean).join(' · '))}</option>`
        ).join('');
        procurementList.innerHTML = `
            <div class="admin-table-wrap">
                <table class="admin-table">
                    <thead><tr>
                        <th>${locale === 'en' ? 'Article' : 'Artikel'}</th>
                        <th>${locale === 'en' ? 'Supplier' : 'Lieferant'}</th>
                        <th>${locale === 'en' ? 'Reference' : 'Referenz'}</th>
                        <th>${locale === 'en' ? 'Qty' : 'Menge'}</th>
                        <th>${locale === 'en' ? 'Price/unit' : 'Preis/Stk.'}</th>
                        <th>Status</th>
                        <th>${locale === 'en' ? 'Ordered' : 'Bestellt'}</th>
                        <th>${locale === 'en' ? 'Expected' : 'Erwartet'}</th>
                        <th>${locale === 'en' ? 'Received' : 'Erhalten'}</th>
                        <th>${locale === 'en' ? 'Notes' : 'Notizen'}</th>
                        <th></th>
                    </tr></thead>
                    <tbody>${supplierOrders.map((order) => `
                        <tr data-supplier-order-row data-supplier-order-id="${esc(order.id)}">
                            <td><select class="form-input admin-table-input" name="productKey">${articleOptions(order.productKey)}</select></td>
                            <td><input class="form-input admin-table-input" type="text" name="supplierName" value="${esc(order.supplierName || '')}"></td>
                            <td><input class="form-input admin-table-input" type="text" name="supplierReference" value="${esc(order.supplierReference || '')}"></td>
                            <td><input class="form-input admin-table-input" type="number" min="1" name="quantity" value="${esc(order.quantity || 1)}"></td>
                            <td><input class="form-input admin-table-input" type="text" name="pricePerItem" value="${esc(order.pricePerItem || '')}" placeholder="0.00" style="width:6rem">
                                <label style="font-size:0.72rem;display:flex;align-items:center;gap:0.25rem;margin-top:0.2rem"><input type="checkbox" name="priceIncludesVat" value="true"${order.priceIncludesVat ? ' checked' : ''}> ${esc(m.vatIncl)}</label>
                            </td>
                            <td><select class="form-input admin-table-input" name="status">${supplierStatusOptions(order.status)}</select></td>
                            <td><input class="form-input admin-table-input" type="date" name="orderedAt" value="${esc(order.orderedAt || '')}"></td>
                            <td><input class="form-input admin-table-input" type="date" name="expectedDeliveryAt" value="${esc(order.expectedDeliveryAt || '')}"></td>
                            <td><input class="form-input admin-table-input" type="date" name="receivedAt" value="${esc(order.receivedAt || '')}"></td>
                            <td><textarea class="form-textarea admin-table-textarea" name="notes" rows="2">${esc(order.notes || '')}</textarea></td>
                            <td class="admin-table-action"><button type="button" class="button button--plain-dark button--pill button--sm" data-save-supplier-order>${locale === 'en' ? 'Save' : 'Speichern'}</button></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    };

    const renderAllocations = (allocations) => {
        if (!allocationsList) return;
        if (!allocations.length) {
            allocationsList.innerHTML = `<p class="admin-empty">${m.noAllocations}</p>`;
            return;
        }
        const allocationStatusOptions = [
            ['reserved', locale === 'en' ? 'Reserved' : 'Reserviert'],
            ['fulfilled', locale === 'en' ? 'Fulfilled' : 'Erfüllt'],
            ['released', locale === 'en' ? 'Released' : 'Freigegeben'],
            ['cancelled', locale === 'en' ? 'Cancelled' : 'Storniert']
        ];
        const optionsMarkup = (currentValue) => allocationStatusOptions
            .map(([value, label]) => `<option value="${esc(value)}"${value === currentValue ? ' selected' : ''}>${esc(label)}</option>`)
            .join('');
        allocationsList.innerHTML = `
            <div class="admin-table-wrap">
                <table class="admin-table">
                    <thead><tr>
                        <th>${locale === 'en' ? 'Order' : 'Bestellung'}</th>
                        <th>Status</th>
                        <th>${locale === 'en' ? 'Qty' : 'Menge'}</th>
                        <th>${locale === 'en' ? 'Allocated' : 'Reserviert'}</th>
                        <th>${locale === 'en' ? 'Notes' : 'Notizen'}</th>
                        <th></th>
                    </tr></thead>
                    <tbody>${allocations.map((allocation) => `
                        <tr data-allocation-row data-allocation-id="${esc(allocation.orderId)}">
                            <td class="admin-table-code">${esc(allocation.orderId)}</td>
                            <td><select class="form-input admin-table-input" name="status">${optionsMarkup(allocation.status)}</select></td>
                            <td><input class="form-input admin-table-input" type="number" value="${esc(allocation.quantity)}" disabled aria-disabled="true"></td>
                            <td><input class="form-input admin-table-input" type="text" value="${esc(allocation.allocatedAt || '')}" disabled aria-disabled="true"></td>
                            <td><textarea class="form-textarea admin-table-textarea" name="notes" rows="2">${esc(allocation.notes || '')}</textarea></td>
                            <td class="admin-table-action"><button type="button" class="button button--plain-dark button--pill button--sm" data-save-allocation>${locale === 'en' ? 'Save' : 'Speichern'}</button></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    };

    const loadAdminData = async () => {
        try {
            const [deviceModelsResponse, supplierOrdersResponse, allocationsResponse, devicesResponse] = await Promise.all([
                adminFetch('/api/device-models'),
                adminFetch('/api/supplier-orders'),
                adminFetch(`/api/order-allocations?productKey=${encodeURIComponent(productKey)}`),
                adminFetch(`/api/admin/stock-devices?productKey=${encodeURIComponent(productKey)}`)
            ]);
            const deviceModels = deviceModelsResponse.deviceModels || [];
            populateArticleSelect(deviceModels);
            renderArticles(deviceModels);
            renderSupplierOrders(supplierOrdersResponse.supplierOrders || [], deviceModels);
            renderAllocations(allocationsResponse.allocations || []);
            renderDevices(devicesResponse.devices || []);
            setFeedback('', false);
            setAuthStatus(m.authSaved, false);
        } catch (error) {
            renderArticles([]);
            renderSupplierOrders([], []);
            renderAllocations([]);
            renderDevices([]);
            setAuthStatus(error.status === 401 ? m.authFailed : m.loadFailed, true);
        }
    };

    const loadAuthState = async () => {
        try {
            const response = await fetch('/api/admin/session', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
            if (!response.ok) { setAuthStatus(m.authMissing, false); return false; }
            const payload = await response.json().catch(() => null);
            const authenticated = Boolean(payload?.authenticated);
            setAuthStatus(authenticated ? m.authSaved : m.authMissing, false);
            return authenticated;
        } catch {
            setAuthStatus(m.authMissing, false);
            return false;
        }
    };

    authForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const password = passwordInput?.value || '';
            const response = await fetch('/api/admin/session', {
                method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                credentials: 'same-origin', body: JSON.stringify({ password })
            });
            if (!response.ok) throw new Error(m.authFailed);
            if (passwordInput) passwordInput.value = '';
            setAuthStatus(m.authSaved, false);
            await loadAdminData();
        } catch {
            setAuthStatus(m.authFailed, true);
        }
    });

    clearAuthButton?.addEventListener('click', async () => {
        await fetch('/api/admin/session', { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
        if (passwordInput) passwordInput.value = '';
        renderArticles([]);
        renderSupplierOrders([], []);
        renderAllocations([]);
        renderDevices([]);
        setAuthStatus(m.authCleared, false);
    });

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
            } else {
                if (!confirm(m.confirmDeleteArticle)) return;
                await adminFetch(`/api/device-models/${encodeURIComponent(pk)}`, { method: 'DELETE' });
                setFeedback(m.articleDeleted, false);
            }
            await loadAdminData();
        } catch (error) { setFeedback(error.message || m.loadFailed, true); }
    });

    devicesForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const payload = Object.fromEntries(new FormData(devicesForm).entries());
            payload.productKey = productKey;
            await adminFetch('/api/admin/stock-devices', { method: 'POST', body: JSON.stringify(payload) });
            devicesForm.reset();
            setFeedback(m.deviceAdded, false);
            await loadAdminData();
        } catch (error) { setFeedback(error.message || m.loadFailed, true); }
    });

    devicesList?.addEventListener('click', async (event) => {
        const saveBtn = event.target.closest('[data-save-device]');
        const retireBtn = event.target.closest('[data-retire-device]');
        const toggleBtn = event.target.closest('[data-toggle-unavailable]');
        const inStockBtn = event.target.closest('[data-mark-in-stock]');
        const btn = saveBtn || retireBtn || toggleBtn || inStockBtn;
        if (!btn) return;
        const row = btn.closest('[data-device-row]');
        if (!row) return;
        try {
            const deviceId = row.getAttribute('data-device-id');
            const payload = Object.fromEntries(Array.from(row.querySelectorAll('[name]')).map((f) => [f.name, f.value]));
            if (retireBtn) payload.status = 'retired';
            if (toggleBtn) payload.status = toggleBtn.getAttribute('data-next-status');
            if (inStockBtn) {
                const serial = payload.serialNumber || '';
                if (!serial || serial.startsWith('PENDING-')) {
                    const newSerial = prompt(locale === 'en' ? 'Enter the real serial number:' : 'Seriennummer eingeben:');
                    if (!newSerial) return;
                    payload.serialNumber = newSerial.trim();
                }
                payload.status = 'in_stock';
            }
            await adminFetch(`/api/admin/stock-devices/${encodeURIComponent(deviceId)}`, { method: 'PUT', body: JSON.stringify(payload) });
            setFeedback(m.deviceSaved, false);
            await loadAdminData();
        } catch (error) { setFeedback(error.message || m.loadFailed, true); }
    });

    procurementForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const formData = new FormData(procurementForm);
            const payload = Object.fromEntries(formData.entries());
            // Checkbox value needs special handling
            payload.priceIncludesVat = formData.get('priceIncludesVat') === 'true';
            await adminFetch('/api/supplier-orders', { method: 'POST', body: JSON.stringify(payload) });
            procurementForm.reset();
            setFeedback(m.created, false);
            await loadAdminData();
        } catch (error) { setFeedback(error.message || m.loadFailed, true); }
    });

    procurementList?.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-save-supplier-order]');
        if (!button) return;
        const row = button.closest('[data-supplier-order-row]');
        if (!row) return;
        try {
            const supplierOrderId = row.getAttribute('data-supplier-order-id');
            const payload = Object.fromEntries(Array.from(row.querySelectorAll('[name]')).map((f) => [f.name, f.value]));
            const vatCheckbox = row.querySelector('[name="priceIncludesVat"]');
            payload.priceIncludesVat = vatCheckbox ? vatCheckbox.checked : false;
            await adminFetch(`/api/supplier-orders/${encodeURIComponent(supplierOrderId)}`, { method: 'PUT', body: JSON.stringify(payload) });
            setFeedback(m.saved, false);
            await loadAdminData();
        } catch (error) { setFeedback(error.message || m.loadFailed, true); }
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

    loadAuthState().then((authenticated) => {
        if (authenticated) { loadAdminData(); return; }
        renderArticles([]);
        renderSupplierOrders([], []);
        renderAllocations([]);
        renderDevices([]);
    });
}

function setupAdminOrders() {
    const app = document.querySelector('[data-admin-orders]');
    if (!app) return;

    const locale = app.getAttribute('data-locale') === 'en' ? 'en' : 'de';
    const passwordInput = document.querySelector('[data-admin-password-input]');
    const authStatus = document.querySelector('[data-admin-auth-status]');
    const authForm = document.querySelector('[data-admin-orders-auth-form]');
    const clearAuthButton = document.querySelector('[data-admin-clear-auth]');
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

    const t = locale === 'en'
        ? {
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
            orderDevice: 'Order device', assignFromStock: 'Assign from stock',
            supplier: 'Supplier', linkedDevice: 'Linked device', quantity: 'Qty',
            deviceOrdered: 'On order', deviceReserved: 'Reserved'
        }
        : {
            authMissing: 'Anmelden, um Kundenbestellungen zu laden.',
            authSaved: 'Admin-Sitzung ist aktiv.',
            authCleared: 'Admin-Sitzung wurde beendet.',
            authFailed: 'Admin-Anmeldung fehlgeschlagen.',
            loadFailed: 'Die Bestelldaten konnten nicht geladen werden.',
            noOrders: 'Es sind noch keine Kundenbestellungen vorhanden.',
            allocationSaved: 'Fulfillment-Status gespeichert.',
            orderLoadFailed: 'Bestelldetails konnten nicht geladen werden.',
            noReservation: 'Keine Reservierung',
            save: 'Speichern',
            countLabel: (n) => `${n} ${n === 1 ? 'Bestellung' : 'Bestellungen'}`,
            statusReserved: 'Reserviert', statusInstalled: 'Installiert', statusPacked: 'Verpackt',
            statusShipped: 'Versendet', statusDelivered: 'Zugestellt', statusFulfilled: 'Abgeschlossen',
            statusReleased: 'Freigegeben', statusCancelled: 'Storniert',
            order: 'Bestellung', customer: 'Kunde', addresses: 'Adressen',
            billing: 'Rechnung', shipping: 'Lieferung', shippingEqualsBilling: 'Lieferung = Rechnung',
            created: 'Angelegt', paidAt: 'Bezahlt am', payment: 'Zahlung', fulfilment: 'Fulfillment',
            method: 'Zahlart', reference: 'Referenz', customerNotes: 'Kundennotizen',
            fulfillmentWorkflow: 'Fulfillment-Workflow', serialNumber: 'Seriennummer',
            deviceUser: 'Benutzername', devicePassword: 'Geräte-Passwort',
            trackingNumber: 'Sendungsnummer', trackingCarrier: 'Versanddienstleister',
            internalNotes: 'Interne Notizen', statusPage: 'Kundenstatusseite',
            sectionDevice: 'Gerät', sectionShipping: 'Versand', sectionDeviceConfig: 'Gerätekonfiguration',
            recentEvents: 'Letzte Ereignisse', name: 'Name', company: 'Firma',
            email: 'E-Mail', phone: 'Telefon', vatId: 'USt-ID',
            mailCustomer: 'Kunde anschreiben', pendingSupplier: 'Offene Lieferantenbestellungen',
            units: 'Stück', expectedDelivery: 'erwartet',
            badgeNew: 'Neu', archive: 'Bestellung archivieren', archiveConfirm: 'Bestellung archivieren? Sie erscheint dann nicht mehr in der Liste.',
            archived: 'Bestellung archiviert.',
            orderDevice: 'Gerät bestellen', assignFromStock: 'Aus Lager zuweisen',
            supplier: 'Lieferant', linkedDevice: 'Verknüpftes Gerät', quantity: 'Anzahl',
            deviceOrdered: 'Bestellt', deviceReserved: 'Reserviert'
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

    const setAuthStatus = (message, isError = false) => {
        if (!authStatus) return;
        authStatus.textContent = message;
        authStatus.classList.toggle('admin-header-auth__status--error', Boolean(isError));
        authStatus.classList.toggle('admin-header-auth__status--ok', !isError && Boolean(message));
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
        return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
    };

    const fmtDate = (value) => {
        if (!value) return '–';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'de-DE', { dateStyle: 'medium' }).format(d);
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
        if (mins  < 2)  return locale === 'en' ? 'just now' : 'gerade eben';
        if (mins  < 60) return locale === 'en' ? `${mins}m ago`  : `vor ${mins}m`;
        if (hours < 24) return locale === 'en' ? `${hours}h ago` : `vor ${hours}h`;
        if (days  < 7)  return locale === 'en' ? `${days}d ago`  : `vor ${days}d`;
        return fmtDate(value);
    };

    const isoDate = (v) => { if (!v) return ''; const s = String(v); return s.length >= 10 ? s.slice(0, 10) : s; };

    const paymentBadge = (status) => {
        switch (status) {
            case 'paid': return { tone: 'success', label: locale === 'en' ? 'Paid' : 'Bezahlt' };
            case 'failed': return { tone: 'danger', label: locale === 'en' ? 'Failed' : 'Fehlgeschl.' };
            case 'expired': return { tone: 'danger', label: locale === 'en' ? 'Expired' : 'Abgelaufen' };
            case 'canceled': case 'cancelled': return { tone: 'danger', label: locale === 'en' ? 'Cancelled' : 'Abgebr.' };
            case 'authorized': case 'pending': case 'open': case 'payment_created':
                return { tone: 'warning', label: locale === 'en' ? 'Open' : 'Offen' };
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
        setVal('[data-stock-available]', String(data.stock.available));
        setVal('[data-stock-in-stock]', String(data.stock.inStock));
        setVal('[data-stock-allocated]', String(data.stock.allocated));

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
                        <span class="admin-badge admin-badge--warning">${esc(s.status)}</span>
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
            case 'paid': return { symbol: '✓', tone: 'success', label: locale === 'en' ? 'Paid' : 'Bezahlt' };
            case 'failed': return { symbol: '✕', tone: 'danger', label: locale === 'en' ? 'Failed' : 'Fehlgeschlagen' };
            case 'expired': return { symbol: '⏱', tone: 'danger', label: locale === 'en' ? 'Expired' : 'Abgelaufen' };
            case 'canceled': case 'cancelled': return { symbol: '↺', tone: 'danger', label: locale === 'en' ? 'Cancelled' : 'Abgebrochen' };
            case 'authorized': case 'pending': case 'open': case 'payment_created':
                return { symbol: '…', tone: 'warning', label: locale === 'en' ? 'Open' : 'Offen' };
            default: return { symbol: '·', tone: 'neutral', label: (status || 'draft').toUpperCase() };
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
                <span class="admin-workflow-step__icon">${i < activeIdx ? '✓' : step.icon}</span>
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
            detailPane.innerHTML = `<div class="admin-detail-placeholder"><p>${locale === 'en' ? 'Select an order to view and edit details.' : 'Eine Bestellung auswählen, um Details und Fulfillment zu bearbeiten.'}</p></div>`;
            return;
        }

        const pi = paymentIcon(order.paymentStatus || order.status);
        const isPaid = order.paymentStatus === 'paid' || order.status === 'paid';
        const hasShipping = Boolean(order.shippingAddress?.street);
        const billingLines = [order.billingAddress?.street, `${order.billingAddress?.zip || ''} ${order.billingAddress?.city || ''}`.trim(), order.billingAddress?.country || 'DE'].filter(Boolean);
        const shippingLines = hasShipping ? [order.shippingAddress.careOf ? `c/o ${order.shippingAddress.careOf}` : '', order.shippingAddress.street, `${order.shippingAddress.zip} ${order.shippingAddress.city}`, order.shippingAddress.country || 'DE'].filter(Boolean) : null;
        const statusUrl = order.statusToken ? `${lpfx(order.locale)}checkout-status.html?order_id=${encodeURIComponent(order.id)}&status_token=${encodeURIComponent(order.statusToken)}` : null;
        const mailSubject = encodeURIComponent(`${locale === 'en' ? 'Your Indiebox order' : 'Ihre Indiebox-Bestellung'} ${displayOrderNumber(order)}`);
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
                                    ${availableDevices.map((d) => `<option value="${esc(d.id)}">${esc(d.serialNumber)}</option>`).join('')}
                                </select>
                            </div>
                        </div>` : ''}
                        <div style="margin-top:0.5rem">
                            <button type="button" class="button button--plain-dark button--pill button--sm" data-order-device-toggle>+ ${t.orderDevice}</button>
                            <div data-order-device-form hidden style="margin-top:0.75rem;padding:0.75rem;background:rgba(15,23,42,0.04);border-radius:8px" data-order-id="${esc(order.id)}" data-product-key="${esc(order.product || '')}">
                                <div class="admin-detail-form-grid">
                                    <div class="form-row">
                                        <label class="form-label">${t.supplier} *</label>
                                        <input class="form-input" type="text" name="od_supplierName">
                                    </div>
                                    <div class="form-row">
                                        <label class="form-label">${t.expectedDelivery}</label>
                                        <input class="form-input" type="date" name="od_expectedDeliveryAt">
                                    </div>
                                    <div class="form-row">
                                        <label class="form-label">${t.quantity}</label>
                                        <input class="form-input" type="number" name="od_quantity" value="1" min="1" max="99" style="width:5rem">
                                    </div>
                                </div>
                                <div class="admin-detail-actions" style="margin-top:0.5rem">
                                    <button type="button" class="button button--plain-dark button--pill button--sm" data-submit-order-device>${t.orderDevice}</button>
                                    <button type="button" class="button button--plain-light button--pill button--sm" data-order-device-toggle>${locale === 'en' ? 'Cancel' : 'Abbrechen'}</button>
                                </div>
                            </div>
                        </div>
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
                </div>
            </div>

            ${order.notes ? `<div class="admin-detail-section admin-detail-section--compact">
                <div style="font-size:0.78rem;font-weight:600;color:rgba(15,23,42,0.5);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.3rem">${t.customerNotes}</div>
                <div style="white-space:pre-wrap;font-size:0.83rem;color:rgba(15,23,42,0.75)">${esc(order.notes)}</div>
            </div>` : ''}

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

    const loadOrders = async () => {
        try {
            const data = await adminFetch('/api/admin/orders-overview?limit=200');
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
            setAuthStatus(t.authSaved, false);
        } catch (error) {
            currentOrders = [];
            selectedOrderId = null;
            selectedOrderDetail = null;
            renderOrderList([]);
            renderDetail(null);
            setAuthStatus(error.status === 401 ? t.authFailed : t.loadFailed, true);
            setFeedback(t.loadFailed, true);
        }
    };

    const loadAuthState = async () => {
        try {
            const response = await fetch('/api/admin/session', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
            if (!response.ok) { setAuthStatus(t.authMissing, false); return false; }
            const payload = await response.json().catch(() => null);
            const ok = Boolean(payload?.authenticated);
            setAuthStatus(ok ? t.authSaved : t.authMissing, false);
            return ok;
        } catch { setAuthStatus(t.authMissing, false); return false; }
    };

    authForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const password = passwordInput?.value || '';
            const response = await fetch('/api/admin/session', {
                method: 'POST',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ password })
            });
            if (!response.ok) throw new Error(t.authFailed);
            if (passwordInput) passwordInput.value = '';
            setAuthStatus(t.authSaved, false);
            await loadOrders();
        } catch { setAuthStatus(t.authFailed, true); }
    });

    clearAuthButton?.addEventListener('click', async () => {
        await fetch('/api/admin/session', { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
        if (passwordInput) passwordInput.value = '';
        setAuthStatus(t.authCleared, false);
        currentOrders = [];
        selectedOrderId = null;
        selectedOrderDetail = null;
        if (stockBar) stockBar.hidden = true;
        renderOrderList([]);
        renderDetail(null);
    });

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
            if (!confirm(t.archiveConfirm)) return;
            const orderId = archiveBtn.getAttribute('data-order-id');
            try {
                await adminFetch(`/api/admin/orders/${encodeURIComponent(orderId)}/archive`, { method: 'POST' });
                selectedOrderId = null;
                setFeedback(t.archived, false);
                await loadOrders();
            } catch (error) { setFeedback(error.message || t.loadFailed, true); }
        }
    });

    detailPane?.addEventListener('click', async (event) => {
        const orderDeviceToggle = event.target.closest('[data-order-device-toggle]');
        if (orderDeviceToggle) {
            const form = detailPane.querySelector('[data-order-device-form]');
            if (form) form.hidden = !form.hidden;
            return;
        }

        const submitOrderDevice = event.target.closest('[data-submit-order-device]');
        if (submitOrderDevice) {
            const form = detailPane.querySelector('[data-order-device-form]');
            if (!form) return;
            const orderId = form.getAttribute('data-order-id');
            const productKey = form.getAttribute('data-product-key');
            const supplierName = form.querySelector('[name="od_supplierName"]')?.value?.trim();
            const expectedDeliveryAt = form.querySelector('[name="od_expectedDeliveryAt"]')?.value || null;
            const quantity = Number.parseInt(form.querySelector('[name="od_quantity"]')?.value || '1', 10);
            if (!supplierName) { setFeedback(locale === 'en' ? 'Supplier name is required.' : 'Lieferantenname ist erforderlich.', true); return; }
            try {
                await adminFetch(`/api/admin/orders/${encodeURIComponent(orderId)}/order-device`, {
                    method: 'POST',
                    body: JSON.stringify({ productKey, supplierName, expectedDeliveryAt, quantity })
                });
                setFeedback(locale === 'en' ? 'Device order created.' : 'Gerätebestellung angelegt.', false);
                await loadOrderDetail(orderId);
            } catch (error) { setFeedback(error.message || t.loadFailed, true); }
            return;
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

    loadAuthState().then((authenticated) => {
        if (authenticated) { loadOrders(); return; }
        renderOrderList([]);
        renderDetail(null);
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
    setupMailtoForms();
    setupCheckoutInventory();
    setupCheckoutPaymentMethods();
    setupCheckoutFormPanels();
    setupCheckoutValidation();
    setupCheckoutTestFill();
    setupAdminInventory();
    setupAdminOrders();
});
