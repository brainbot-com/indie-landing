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
    const passwordInput = app.querySelector('[data-admin-password-input]');
    const authStatus = app.querySelector('[data-admin-auth-status]');
    const authForm = app.querySelector('[data-admin-auth-form]');
    const clearAuthButton = app.querySelector('[data-admin-clear-auth]');
    const overviewStatus = app.querySelector('[data-admin-overview-status]');
    const overviewLeadTime = app.querySelector('[data-admin-overview-lead-time]');
    const modelForm = app.querySelector('[data-admin-model-form]');
    const inventoryForm = app.querySelector('[data-admin-inventory-form]');
    const procurementForm = app.querySelector('[data-admin-procurement-form]');
    const procurementList = app.querySelector('[data-admin-procurement-list]');
    const allocationsList = app.querySelector('[data-admin-allocations-list]');
    const feedback = app.querySelector('[data-admin-feedback]');

    const messages = locale === 'en'
        ? {
            authMissing: 'Sign in to load internal inventory data.',
            authSaved: 'Admin session is active.',
            authCleared: 'Admin session was ended.',
            authFailed: 'Admin sign-in failed.',
            loadFailed: 'The admin data could not be loaded.',
            saved: 'Changes saved.',
            created: 'Supplier order created.',
            noOrders: 'No supplier orders have been entered yet.',
            noAllocations: 'No customer orders have reserved stock yet.',
            allocationSaved: 'Reservation updated.'
        }
        : {
            authMissing: 'Anmelden, um die internen Bestandsdaten zu laden.',
            authSaved: 'Admin-Sitzung ist aktiv.',
            authCleared: 'Admin-Sitzung wurde beendet.',
            authFailed: 'Admin-Anmeldung fehlgeschlagen.',
            loadFailed: 'Die internen Bestandsdaten konnten nicht geladen werden.',
            saved: 'Änderungen gespeichert.',
            created: 'Lieferantenbestellung angelegt.',
            noOrders: 'Es wurden noch keine Lieferantenbestellungen erfasst.',
            noAllocations: 'Es wurden noch keine Kundenbestellungen gegen den Bestand reserviert.',
            allocationSaved: 'Reservierung gespeichert.'
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
        authStatus.classList.toggle('admin-auth-status--error', Boolean(isError));
    };

    const adminFetch = async (url, options = {}) => {
        const headers = new Headers(options.headers || {});
        headers.set('Accept', 'application/json');
        if (options.body && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'same-origin'
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const error = new Error(payload?.error || payload?.message || response.statusText);
            error.status = response.status;
            error.payload = payload;
            throw error;
        }

        return payload;
    };

    const updateOverview = (inventory) => {
        if (overviewStatus) overviewStatus.textContent = inventory?.stockLabel || '–';
        if (overviewLeadTime) overviewLeadTime.textContent = inventory?.leadTimeLabel || '–';
    };

    const fillForms = (inventoryPayload, deviceModel) => {
        updateOverview(inventoryPayload);

        if (modelForm) {
            const productName = modelForm.elements.namedItem('productName');
            const systemSpec = modelForm.elements.namedItem('systemSpec');
            if (productName && 'value' in productName) productName.value = deviceModel?.productName || inventoryPayload?.productName || '';
            if (systemSpec && 'value' in systemSpec) systemSpec.value = deviceModel?.systemSpec || '';
        }

        if (inventoryForm) {
            const minField = inventoryForm.elements.namedItem('leadTimeMinBusinessDays');
            const maxField = inventoryForm.elements.namedItem('leadTimeMaxBusinessDays');
            const unitsField = inventoryForm.elements.namedItem('availableUnits');
            if (minField && 'value' in minField) minField.value = String(inventoryPayload?.leadTimeMinBusinessDays ?? 3);
            if (maxField && 'value' in maxField) maxField.value = String(inventoryPayload?.leadTimeMaxBusinessDays ?? 5);
            if (unitsField && 'value' in unitsField) unitsField.value = String(inventoryPayload?.availableUnits ?? 0);
        }
    };

    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const supplierStatusOptions = (currentValue) => {
        const options = [
            ['ordered', locale === 'en' ? 'Ordered' : 'Bestellt'],
            ['in_transit', locale === 'en' ? 'In transit' : 'Unterwegs'],
            ['received', locale === 'en' ? 'Received' : 'Geliefert'],
            ['in_stock', locale === 'en' ? 'In stock' : 'Auf Lager'],
            ['cancelled', locale === 'en' ? 'Cancelled' : 'Storniert']
        ];

        return options.map(([value, label]) => `<option value="${escapeHtml(value)}"${value === currentValue ? ' selected' : ''}>${escapeHtml(label)}</option>`).join('');
    };

    const renderSupplierOrders = (supplierOrders) => {
        if (!procurementList) return;

        if (!supplierOrders.length) {
            procurementList.innerHTML = `<p class="admin-empty">${messages.noOrders}</p>`;
            return;
        }

        procurementList.innerHTML = `
            <div class="admin-table-wrap">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>${locale === 'en' ? 'Supplier' : 'Lieferant'}</th>
                            <th>${locale === 'en' ? 'Reference' : 'Referenz'}</th>
                            <th>${locale === 'en' ? 'Quantity' : 'Menge'}</th>
                            <th>${locale === 'en' ? 'Status' : 'Status'}</th>
                            <th>${locale === 'en' ? 'Ordered' : 'Bestellt'}</th>
                            <th>${locale === 'en' ? 'Expected' : 'Erwartet'}</th>
                            <th>${locale === 'en' ? 'Received' : 'Geliefert'}</th>
                            <th>${locale === 'en' ? 'Notes' : 'Notizen'}</th>
                            <th>${locale === 'en' ? 'Action' : 'Aktion'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${supplierOrders.map((order) => `
                            <tr data-supplier-order-row data-supplier-order-id="${escapeHtml(order.id)}">
                                <td><input class="form-input admin-table-input" type="text" name="supplierName" value="${escapeHtml(order.supplierName || '')}"></td>
                                <td><input class="form-input admin-table-input" type="text" name="supplierReference" value="${escapeHtml(order.supplierReference || '')}"></td>
                                <td><input class="form-input admin-table-input" type="number" min="1" name="quantity" value="${escapeHtml(order.quantity || 1)}"></td>
                                <td><select class="form-input admin-table-input" name="status">${supplierStatusOptions(order.status)}</select></td>
                                <td><input class="form-input admin-table-input" type="date" name="orderedAt" value="${escapeHtml(order.orderedAt || '')}"></td>
                                <td><input class="form-input admin-table-input" type="date" name="expectedDeliveryAt" value="${escapeHtml(order.expectedDeliveryAt || '')}"></td>
                                <td><input class="form-input admin-table-input" type="date" name="receivedAt" value="${escapeHtml(order.receivedAt || '')}"></td>
                                <td><textarea class="form-textarea admin-table-textarea" name="notes" rows="2">${escapeHtml(order.notes || '')}</textarea></td>
                                <td class="admin-table-action"><button type="button" class="button button--plain-dark button--pill button--sm" data-save-supplier-order>${locale === 'en' ? 'Save' : 'Speichern'}</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    };

    const renderAllocations = (allocations) => {
        if (!allocationsList) return;

        if (!allocations.length) {
            allocationsList.innerHTML = `<p class="admin-empty">${messages.noAllocations}</p>`;
            return;
        }

        const allocationStatusOptions = [
            ['reserved', locale === 'en' ? 'Reserved' : 'Reserviert'],
            ['fulfilled', locale === 'en' ? 'Fulfilled' : 'Erfüllt'],
            ['released', locale === 'en' ? 'Released' : 'Freigegeben'],
            ['cancelled', locale === 'en' ? 'Cancelled' : 'Storniert']
        ].map(([value, label]) => ({ value, label }));

        const optionsMarkup = (currentValue) => allocationStatusOptions
            .map(({ value, label }) => `<option value="${escapeHtml(value)}"${value === currentValue ? ' selected' : ''}>${escapeHtml(label)}</option>`)
            .join('');

        allocationsList.innerHTML = `
            <div class="admin-table-wrap">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>${locale === 'en' ? 'Order' : 'Bestellung'}</th>
                            <th>${locale === 'en' ? 'Status' : 'Status'}</th>
                            <th>${locale === 'en' ? 'Quantity' : 'Menge'}</th>
                            <th>${locale === 'en' ? 'Allocated' : 'Reserviert'}</th>
                            <th>${locale === 'en' ? 'Fulfilled' : 'Erfüllt'}</th>
                            <th>${locale === 'en' ? 'Released' : 'Freigegeben'}</th>
                            <th>${locale === 'en' ? 'Notes' : 'Notizen'}</th>
                            <th>${locale === 'en' ? 'Action' : 'Aktion'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allocations.map((allocation) => `
                            <tr data-allocation-row data-allocation-id="${escapeHtml(allocation.orderId)}">
                                <td class="admin-table-code">${escapeHtml(allocation.orderId)}</td>
                                <td><select class="form-input admin-table-input" name="status">${optionsMarkup(allocation.status)}</select></td>
                                <td><input class="form-input admin-table-input" type="number" value="${escapeHtml(allocation.quantity)}" disabled aria-disabled="true"></td>
                                <td><input class="form-input admin-table-input" type="text" value="${escapeHtml(allocation.allocatedAt || '')}" disabled aria-disabled="true"></td>
                                <td><input class="form-input admin-table-input" type="text" name="fulfilledAt" value="${escapeHtml(allocation.fulfilledAt || '')}"></td>
                                <td><input class="form-input admin-table-input" type="text" name="releasedAt" value="${escapeHtml(allocation.releasedAt || '')}"></td>
                                <td><textarea class="form-textarea admin-table-textarea" name="notes" rows="2">${escapeHtml(allocation.notes || '')}</textarea></td>
                                <td class="admin-table-action"><button type="button" class="button button--plain-dark button--pill button--sm" data-save-allocation>${locale === 'en' ? 'Save' : 'Speichern'}</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    };

    const loadPublicOverview = async () => {
        const response = await fetch(`/api/inventory/${encodeURIComponent(productKey)}?locale=${encodeURIComponent(locale)}`, {
            headers: {
                Accept: 'application/json'
            }
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.inventory) {
            throw new Error(messages.loadFailed);
        }

        updateOverview(payload.inventory);
        return payload;
    };

    const loadAdminData = async () => {
        try {
            const inventoryResponse = await loadPublicOverview();
            const deviceModelsResponse = await adminFetch('/api/device-models');
            const supplierOrdersResponse = await adminFetch(`/api/supplier-orders?productKey=${encodeURIComponent(productKey)}`);
            const allocationsResponse = await adminFetch(`/api/order-allocations?productKey=${encodeURIComponent(productKey)}`);

            const deviceModel = (deviceModelsResponse.deviceModels || []).find((item) => item.productKey === productKey) || inventoryResponse.deviceModel;
            fillForms(inventoryResponse.inventory, deviceModel);
            renderSupplierOrders(supplierOrdersResponse.supplierOrders || []);
            renderAllocations(allocationsResponse.allocations || []);
            setFeedback('', false);
            setAuthStatus(messages.authSaved, false);
        } catch (error) {
            renderSupplierOrders([]);
            renderAllocations([]);
            if (error.status === 401) {
                setAuthStatus(messages.authFailed, true);
            } else if (error.status === 404) {
                setAuthStatus(messages.loadFailed, true);
            } else {
                setAuthStatus(messages.loadFailed, true);
            }
            setFeedback(messages.loadFailed, true);
        }
    };

    const loadAuthState = async () => {
        try {
            const response = await fetch('/api/admin/session', {
                headers: {
                    Accept: 'application/json'
                },
                credentials: 'same-origin'
            });
            if (!response.ok) {
                setAuthStatus(messages.authMissing, false);
                return false;
            }
            const payload = await response.json().catch(() => null);
            const authenticated = Boolean(payload?.authenticated);
            setAuthStatus(authenticated ? messages.authSaved : messages.authMissing, false);
            return authenticated;
        } catch {
            setAuthStatus(messages.authMissing, false);
            return false;
        }
    };

    authForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const password = passwordInput?.value || '';
            const response = await fetch('/api/admin/session', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({ password })
            });
            if (!response.ok) {
                throw new Error(messages.authFailed);
            }
            if (passwordInput) passwordInput.value = '';
            setAuthStatus(messages.authSaved, false);
            await loadAdminData();
        } catch {
            setAuthStatus(messages.authFailed, true);
        }
    });

    clearAuthButton?.addEventListener('click', async () => {
        await fetch('/api/admin/session', {
            method: 'DELETE',
            credentials: 'same-origin'
        }).catch(() => {});
        if (passwordInput) passwordInput.value = '';
        renderSupplierOrders([]);
        renderAllocations([]);
        setAuthStatus(messages.authCleared, false);
    });

    modelForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const payload = Object.fromEntries(new FormData(modelForm).entries());
            await adminFetch(`/api/device-models/${encodeURIComponent(productKey)}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            setFeedback(messages.saved, false);
            await loadAdminData();
        } catch (error) {
            setFeedback(error.message || messages.loadFailed, true);
        }
    });

    inventoryForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const payload = Object.fromEntries(new FormData(inventoryForm).entries());
            await adminFetch(`/api/inventory/${encodeURIComponent(productKey)}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            setFeedback(messages.saved, false);
            await loadAdminData();
        } catch (error) {
            setFeedback(error.message || messages.loadFailed, true);
        }
    });

    procurementForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const payload = Object.fromEntries(new FormData(procurementForm).entries());
            payload.productKey = productKey;
            await adminFetch('/api/supplier-orders', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            procurementForm.reset();
            setFeedback(messages.created, false);
            await loadAdminData();
        } catch (error) {
            setFeedback(error.message || messages.loadFailed, true);
        }
    });

    procurementList?.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-save-supplier-order]');
        if (!button) return;
        const row = button.closest('[data-supplier-order-row]');
        if (!row) return;

        try {
            const supplierOrderId = row.getAttribute('data-supplier-order-id');
            const payload = Object.fromEntries(Array.from(row.querySelectorAll('[name]')).map((field) => [field.name, field.value]));
            await adminFetch(`/api/supplier-orders/${encodeURIComponent(supplierOrderId)}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            setFeedback(messages.saved, false);
            await loadAdminData();
        } catch (error) {
            setFeedback(error.message || messages.loadFailed, true);
        }
    });

    allocationsList?.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-save-allocation]');
        if (!button) return;
        const row = button.closest('[data-allocation-row]');
        if (!row) return;

        try {
            const orderId = row.getAttribute('data-allocation-id');
            const payload = Object.fromEntries(Array.from(row.querySelectorAll('[name]')).map((field) => [field.name, field.value]));
            await adminFetch(`/api/order-allocations/${encodeURIComponent(orderId)}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            setFeedback(messages.allocationSaved, false);
            await loadAdminData();
        } catch (error) {
            setFeedback(error.message || messages.loadFailed, true);
        }
    });

    loadAuthState().then((authenticated) => {
        if (authenticated) {
            loadAdminData();
            return;
        }
        renderSupplierOrders([]);
        renderAllocations([]);
        loadPublicOverview().catch(() => {});
    });
}

function setupAdminOrders() {
    const app = document.querySelector('[data-admin-orders]');
    if (!app) return;

    const locale = app.getAttribute('data-locale') === 'en' ? 'en' : 'de';
    const passwordInput = app.querySelector('[data-admin-password-input]');
    const authStatus = app.querySelector('[data-admin-auth-status]');
    const authForm = app.querySelector('[data-admin-orders-auth-form]');
    const clearAuthButton = app.querySelector('[data-admin-clear-auth]');
    const ordersList = app.querySelector('[data-admin-orders-list]');
    const searchInput = app.querySelector('[data-admin-order-search]');
    const paymentFilter = app.querySelector('[data-admin-payment-filter]');
    const fulfilmentFilter = app.querySelector('[data-admin-fulfilment-filter]');
    const orderCount = app.querySelector('[data-admin-order-count]');
    const reloadButton = app.querySelector('[data-admin-reload-orders]');
    const feedback = app.querySelector('[data-admin-feedback]');
    const localePrefix = (loc) => loc === 'en' ? '/en/' : '/';
    let currentEntries = [];
    let selectedOrderId = null;
    let activeStatusPopover = null;

    const messages = locale === 'en'
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
            detailIntro: 'Select an order to view and edit details.',
            save: 'Save',
            orderLabel: 'Order',
            dateLabel: 'Date',
            customerLabel: 'Customer',
            paymentLabel: 'Payment',
            fulfilmentLabel: 'Fulfilment',
            deliveryLabel: 'Delivery',
            countLabel: (count) => `${count} ${count === 1 ? 'order' : 'orders'}`,
            paymentStatusDetails: 'Payment status',
            fulfilmentStatusDetails: 'Fulfilment status',
            paymentMethodLabel: 'Method',
            paymentReferenceLabel: 'Reference'
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
            detailIntro: 'Eine Bestellung auswählen, um Details und Fulfillment zu bearbeiten.',
            save: 'Speichern',
            orderLabel: 'Bestellung',
            dateLabel: 'Datum',
            customerLabel: 'Kunde',
            paymentLabel: 'Zahlung',
            fulfilmentLabel: 'Fulfillment',
            deliveryLabel: 'Lieferung',
            countLabel: (count) => `${count} ${count === 1 ? 'Bestellung' : 'Bestellungen'}`,
            paymentStatusDetails: 'Zahlungsstatus',
            fulfilmentStatusDetails: 'Fulfillment-Status',
            paymentMethodLabel: 'Zahlart',
            paymentReferenceLabel: 'Referenz'
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
        authStatus.classList.toggle('admin-auth-status--error', Boolean(isError));
    };

    const adminFetch = async (url, options = {}) => {
        const headers = new Headers(options.headers || {});
        headers.set('Accept', 'application/json');
        if (options.body && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'same-origin'
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const error = new Error(payload?.error || payload?.message || response.statusText);
            error.status = response.status;
            error.payload = payload;
            throw error;
        }

        return payload;
    };

    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const shortOrderId = (value) => {
        const raw = String(value || '');
        if (raw.length <= 8) return raw;
        return `#${raw.slice(-6).toUpperCase()}`;
    };

    const displayOrderNumber = (order) => {
        if (Number.isInteger(order.orderNumber)) {
            return `#${String(order.orderNumber).padStart(5, '0')}`;
        }
        return shortOrderId(order.id);
    };

    const formatDateTime = (value) => {
        if (!value) return '–';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'de-DE', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(parsed);
    };

    const formatDate = (value) => {
        if (!value) return '–';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'de-DE', {
            dateStyle: 'medium'
        }).format(parsed);
    };

    const allocationStatusOptions = (currentValue) => {
        const options = [
            ['reserved', locale === 'en' ? 'Reserved' : 'Reserviert'],
            ['fulfilled', locale === 'en' ? 'Fulfilled' : 'Erfüllt'],
            ['released', locale === 'en' ? 'Released' : 'Freigegeben'],
            ['cancelled', locale === 'en' ? 'Cancelled' : 'Storniert']
        ];

        return options.map(([value, label]) => `<option value="${escapeHtml(value)}"${value === currentValue ? ' selected' : ''}>${escapeHtml(label)}</option>`).join('');
    };

    const normalizePaymentFilter = (status) => {
        switch (status) {
            case 'paid':
                return 'paid';
            case 'authorized':
            case 'pending':
            case 'open':
            case 'payment_created':
                return 'open';
            case 'failed':
                return 'failed';
            case 'expired':
                return 'expired';
            case 'canceled':
            case 'cancelled':
                return 'failed';
            default:
                return 'other';
        }
    };

    const normalizeFulfilmentFilter = (status) => {
        if (!status) return 'none';
        if (['reserved', 'fulfilled', 'released', 'cancelled'].includes(status)) return status;
        return 'other';
    };

    const paymentStatusIcon = (status) => {
        switch (status) {
            case 'paid':
                return { symbol: '✓', tone: 'success', label: locale === 'en' ? 'Paid' : 'Bezahlt' };
            case 'failed':
                return { symbol: '✕', tone: 'danger', label: locale === 'en' ? 'Failed' : 'Fehlgeschlagen' };
            case 'expired':
                return { symbol: '⏱', tone: 'danger', label: locale === 'en' ? 'Expired' : 'Abgelaufen' };
            case 'canceled':
            case 'cancelled':
                return { symbol: '↺', tone: 'danger', label: locale === 'en' ? 'Cancelled' : 'Abgebrochen' };
            case 'authorized':
            case 'pending':
            case 'open':
            case 'payment_created':
                return { symbol: '…', tone: 'warning', label: locale === 'en' ? 'Open' : 'Offen' };
            default:
                return { symbol: '•', tone: 'neutral', label: (status || 'draft').toUpperCase() };
        }
    };

    const allocationStatusIcon = (status) => {
        switch (status) {
            case 'fulfilled':
                return { symbol: '✓', tone: 'success', label: locale === 'en' ? 'Fulfilled' : 'Erfüllt' };
            case 'reserved':
                return { symbol: '□', tone: 'warning', label: locale === 'en' ? 'Reserved' : 'Reserviert' };
            case 'released':
                return { symbol: '↗', tone: 'neutral', label: locale === 'en' ? 'Released' : 'Freigegeben' };
            case 'cancelled':
                return { symbol: '✕', tone: 'danger', label: locale === 'en' ? 'Cancelled' : 'Storniert' };
            default:
                return { symbol: '–', tone: 'neutral', label: messages.noReservation };
        }
    };

    const renderStatusIcon = (status, type, order, allocation) => {
        const meta = type === 'payment' ? paymentStatusIcon(status) : allocationStatusIcon(status);
        const popoverKey = `${type}:${order.id}`;
        const isOpen = activeStatusPopover === popoverKey;
        const detailLabel = type === 'payment' ? messages.paymentStatusDetails : messages.fulfilmentStatusDetails;
        const detailLines = type === 'payment'
            ? [
                `<strong>${escapeHtml(detailLabel)}:</strong> ${escapeHtml(meta.label)}`,
                order.paymentMethod ? `<strong>${escapeHtml(messages.paymentMethodLabel)}:</strong> ${escapeHtml(order.paymentMethod)}` : '',
                order.paymentId ? `<strong>${escapeHtml(messages.paymentReferenceLabel)}:</strong> ${escapeHtml(shortOrderId(order.paymentId))}` : ''
            ]
            : [
                `<strong>${escapeHtml(detailLabel)}:</strong> ${escapeHtml(meta.label)}`,
                allocation?.allocatedAt ? `<strong>${locale === 'en' ? 'Allocated' : 'Reserviert'}:</strong> ${escapeHtml(formatDateTime(allocation.allocatedAt))}` : '',
                allocation?.fulfilledAt ? `<strong>${locale === 'en' ? 'Fulfilled' : 'Erfüllt'}:</strong> ${escapeHtml(allocation.fulfilledAt)}` : ''
            ];

        return `
            <div class="admin-status-wrap">
                <button
                    type="button"
                    class="admin-status-icon admin-status-icon--${meta.tone}"
                    title="${escapeHtml(meta.label)}"
                    aria-label="${escapeHtml(meta.label)}"
                    aria-expanded="${isOpen ? 'true' : 'false'}"
                    data-status-button
                    data-status-key="${escapeHtml(popoverKey)}"
                >${meta.symbol}</button>
                ${isOpen ? `
                    <div class="admin-status-popover" data-status-popover>
                        ${detailLines.filter(Boolean).map((line) => `<p>${line}</p>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    };

    const isoDateOnly = (value) => {
        if (!value) return '';
        const s = String(value);
        return s.length >= 10 ? s.slice(0, 10) : s;
    };

    const renderOrderDetail = (entry) => {
        if (!entry) return '';
        const { order, allocation, events } = entry;
        const showAllocationForm = Boolean(allocation) || order.status === 'paid';
        const hasShipping = Boolean(order.shippingAddress?.street);
        const billingLines = [
            order.billingAddress.street,
            `${order.billingAddress.zip} ${order.billingAddress.city}`,
            order.billingAddress.country || 'DE'
        ].filter(Boolean);
        const shippingLines = hasShipping ? [
            order.shippingAddress.careOf ? `c/o ${order.shippingAddress.careOf}` : '',
            order.shippingAddress.street,
            `${order.shippingAddress.zip} ${order.shippingAddress.city}`,
            order.shippingAddress.country || 'DE'
        ].filter(Boolean) : null;

        const paymentIcon = paymentStatusIcon(order.paymentStatus || order.status);
        const allocIcon = allocationStatusIcon(allocation?.status || '');

        const statusUrl = order.statusToken
            ? `${localePrefix(order.locale)}checkout-status.html?order_id=${encodeURIComponent(order.id)}&status_token=${encodeURIComponent(order.statusToken)}`
            : null;

        const recentEvents = Array.isArray(events) ? events.slice(-5).reverse() : [];

        return `
            <div class="admin-detail-grid">
                <article class="admin-detail-block">
                    <h3>${locale === 'en' ? 'Order' : 'Bestellung'}</h3>
                    <div class="admin-detail-meta">
                        <p><strong>${locale === 'en' ? 'Number' : 'Nr.'}:</strong> ${escapeHtml(displayOrderNumber(order))}</p>
                        <p><strong>ID:</strong> <span class="admin-mono">${escapeHtml(order.id)}</span></p>
                        <p><strong>${locale === 'en' ? 'Created' : 'Angelegt'}:</strong> ${escapeHtml(formatDateTime(order.createdAt))}</p>
                        ${order.paidAt ? `<p><strong>${locale === 'en' ? 'Paid at' : 'Bezahlt am'}:</strong> ${escapeHtml(formatDateTime(order.paidAt))}</p>` : ''}
                        <p><strong>${locale === 'en' ? 'Payment' : 'Zahlung'}:</strong>
                            <span class="admin-status-inline admin-status-inline--${paymentIcon.tone}">${escapeHtml(paymentIcon.label)}</span>
                        </p>
                        <p><strong>${locale === 'en' ? 'Fulfilment' : 'Fulfillment'}:</strong>
                            <span class="admin-status-inline admin-status-inline--${allocIcon.tone}">${escapeHtml(allocIcon.label)}</span>
                        </p>
                        ${order.paymentMethod ? `<p><strong>${escapeHtml(messages.paymentMethodLabel)}:</strong> ${escapeHtml(order.paymentMethod)}</p>` : ''}
                        ${order.paymentId ? `<p><strong>${escapeHtml(messages.paymentReferenceLabel)}:</strong> <span class="admin-mono">${escapeHtml(order.paymentId)}</span></p>` : ''}
                        ${statusUrl ? `<p><a href="${escapeHtml(statusUrl)}" target="_blank" rel="noopener" class="admin-detail-link">${locale === 'en' ? 'Open customer status page ↗' : 'Kundenstatusseite öffnen ↗'}</a></p>` : ''}
                    </div>
                </article>
                <article class="admin-detail-block">
                    <h3>${locale === 'en' ? 'Customer' : 'Kunde'}</h3>
                    <div class="admin-detail-meta">
                        <p><strong>${locale === 'en' ? 'Name' : 'Name'}:</strong> ${escapeHtml(order.customer.firstName)} ${escapeHtml(order.customer.lastName)}</p>
                        ${order.customer.company ? `<p><strong>${locale === 'en' ? 'Company' : 'Firma'}:</strong> ${escapeHtml(order.customer.company)}</p>` : ''}
                        ${order.customer.vatId ? `<p><strong>${locale === 'en' ? 'VAT ID' : 'USt-ID'}:</strong> ${escapeHtml(order.customer.vatId)}</p>` : ''}
                        <p><strong>${locale === 'en' ? 'Email' : 'E-Mail'}:</strong> <a href="mailto:${escapeHtml(order.customer.email)}" class="admin-detail-link">${escapeHtml(order.customer.email)}</a></p>
                        ${order.customer.phone ? `<p><strong>${locale === 'en' ? 'Phone' : 'Telefon'}:</strong> ${escapeHtml(order.customer.phone)}</p>` : ''}
                    </div>
                </article>
                <article class="admin-detail-block">
                    <h3>${locale === 'en' ? 'Addresses' : 'Adressen'}</h3>
                    <div class="admin-detail-meta">
                        <p><strong>${locale === 'en' ? 'Billing' : 'Rechnung'}:</strong><br>${billingLines.map(escapeHtml).join('<br>')}</p>
                        ${shippingLines
                            ? `<p><strong>${locale === 'en' ? 'Shipping' : 'Lieferung'}:</strong><br>${shippingLines.map(escapeHtml).join('<br>')}</p>`
                            : `<p class="admin-meta-dim">${locale === 'en' ? 'Shipping = billing' : 'Lieferung = Rechnung'}</p>`}
                    </div>
                </article>
                ${order.notes ? `
                <article class="admin-detail-block admin-detail-block--full">
                    <h3>${locale === 'en' ? 'Customer notes' : 'Kundennotizen'}</h3>
                    <div class="admin-detail-meta">
                        <p class="admin-detail-notes">${escapeHtml(order.notes)}</p>
                    </div>
                </article>` : ''}
            </div>
            <div class="admin-detail-form"${showAllocationForm ? ` data-admin-order-detail-form data-allocation-id="${escapeHtml(order.id)}"` : ''}>
                <h3>${locale === 'en' ? 'Fulfilment' : 'Fulfillment'}</h3>
                ${showAllocationForm ? `
                    <div class="form-grid">
                        <div class="form-row">
                            <label class="form-label">${locale === 'en' ? 'Status' : 'Status'}</label>
                            <select class="form-input" name="status">${allocationStatusOptions(allocation?.status || 'reserved')}</select>
                        </div>
                        <div class="form-row">
                            <label class="form-label">${locale === 'en' ? 'Fulfilled at' : 'Erfüllt am'}</label>
                            <input class="form-input" type="date" name="fulfilledAt" value="${escapeHtml(isoDateOnly(allocation?.fulfilledAt))}">
                        </div>
                        <div class="form-row">
                            <label class="form-label">${locale === 'en' ? 'Released at' : 'Freigegeben am'}</label>
                            <input class="form-input" type="date" name="releasedAt" value="${escapeHtml(isoDateOnly(allocation?.releasedAt))}">
                        </div>
                        <div class="form-row form-row--full">
                            <label class="form-label">${locale === 'en' ? 'Internal notes' : 'Interne Notizen'}</label>
                            <textarea class="form-textarea" name="notes" rows="3">${escapeHtml(allocation?.notes || '')}</textarea>
                        </div>
                    </div>
                    <div class="admin-table-action">
                        <button type="button" class="button button--plain-dark button--pill button--sm" data-save-order-detail-allocation>${messages.save}</button>
                    </div>
                ` : `<p class="admin-empty">${messages.noReservation}</p>`}
            </div>
            ${recentEvents.length ? `
            <div class="admin-detail-events">
                <h3>${locale === 'en' ? 'Recent events' : 'Letzte Ereignisse'}</h3>
                <ul class="admin-events-list">
                    ${recentEvents.map((ev) => `
                        <li class="admin-event-item">
                            <span class="admin-event-time">${escapeHtml(formatDateTime(ev.createdAt))}</span>
                            <span class="admin-event-type">${escapeHtml(ev.eventType || ev.source || '')}</span>
                            ${ev.paymentStatus ? `<span class="admin-event-status">${escapeHtml(ev.paymentStatus)}</span>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>` : ''}
        `;
    };

    const renderOrders = (entries) => {
        if (!ordersList) return;

        if (!entries.length) {
            if (orderCount) orderCount.textContent = messages.countLabel(0);
            ordersList.innerHTML = `<p class="admin-empty">${messages.noOrders}</p>`;
            return;
        }

        if (orderCount) orderCount.textContent = messages.countLabel(entries.length);

        ordersList.innerHTML = `
            <div class="admin-table-wrap">
                <table class="admin-table admin-table--orders">
                    <thead>
                        <tr>
                            <th>${messages.orderLabel}</th>
                            <th>${messages.dateLabel}</th>
                            <th>${messages.customerLabel}</th>
                            <th>${messages.paymentLabel}</th>
                            <th>${messages.fulfilmentLabel}</th>
                            <th>${messages.deliveryLabel}</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${entries.map(({ order, allocation }) => {
            const deliveryLabel = order.shippingAddress?.city
                ? `${order.shippingAddress.zip} ${order.shippingAddress.city}`
                : `${order.billingAddress.zip} ${order.billingAddress.city}`;
            const detailMarkup = order.id === selectedOrderId
                ? `<tr class="admin-detail-row"><td colspan="6">${renderOrderDetail({ order, allocation })}</td></tr>`
                : '';
            return `
                            <tr class="${order.id === selectedOrderId ? 'is-selected' : ''}" data-order-row data-order-id="${escapeHtml(order.id)}">
                                <td>
                                    <div class="admin-cell-stack">
                                        <span class="admin-cell-primary">${escapeHtml(displayOrderNumber(order))}</span>
                                        <span class="admin-cell-secondary">${escapeHtml(order.id.slice(0, 8))}…</span>
                                    </div>
                                </td>
                                <td>${escapeHtml(formatDate(order.createdAt))}</td>
                                <td>
                                    <div class="admin-cell-stack">
                                        <span class="admin-cell-primary">${escapeHtml(order.customer.firstName)} ${escapeHtml(order.customer.lastName)}</span>
                                        <span class="admin-cell-secondary">${escapeHtml(order.customer.company || '')}</span>
                                    </div>
                                </td>
                                <td>
                                    <div class="admin-cell-stack">
                                        ${renderStatusIcon(order.paymentStatus || order.status, 'payment', order, allocation)}
                                        <span class="admin-cell-secondary">${escapeHtml(paymentStatusIcon(order.paymentStatus || order.status).label)}</span>
                                    </div>
                                </td>
                                <td>
                                    <div class="admin-cell-stack">
                                        ${renderStatusIcon(allocation?.status || '', 'allocation', order, allocation)}
                                        <span class="admin-cell-secondary">${escapeHtml(allocationStatusIcon(allocation?.status || '').label)}</span>
                                    </div>
                                </td>
                                <td>${escapeHtml(deliveryLabel)}</td>
                            </tr>
                            ${detailMarkup}
                        `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    };

    const getFilteredEntries = () => {
        const query = (searchInput?.value || '').trim().toLowerCase();
        const paymentValue = paymentFilter?.value || 'all';
        const fulfilmentValue = fulfilmentFilter?.value || 'all';

        return currentEntries.filter(({ order, allocation }) => {
            const paymentGroup = normalizePaymentFilter(order.paymentStatus || order.status);
            const fulfilmentGroup = normalizeFulfilmentFilter(allocation?.status || '');
            const searchHaystack = [
                displayOrderNumber(order),
                order.id,
                order.customer.firstName,
                order.customer.lastName,
                order.customer.email,
                order.customer.company,
                order.billingAddress.city,
                order.shippingAddress?.city,
                order.billingAddress.zip,
                order.shippingAddress?.zip
            ].filter(Boolean).join(' ').toLowerCase();

            if (paymentValue !== 'all' && paymentGroup !== paymentValue) return false;
            if (fulfilmentValue !== 'all' && fulfilmentGroup !== fulfilmentValue) return false;
            if (query && !searchHaystack.includes(query)) return false;
            return true;
        });
    };

    const refreshOrdersView = () => {
        renderOrders(getFilteredEntries());
    };

    const loadOrders = async () => {
        try {
            const ordersResponse = await adminFetch('/api/orders?limit=100');
            const orders = ordersResponse.orders || [];
            const detailedOrders = await Promise.all(
                orders.map(async (entry) => {
                    try {
                        const detail = await adminFetch(`/api/orders/${encodeURIComponent(entry.id)}`);
                        return detail;
                    } catch {
                        return null;
                    }
                })
            );

            currentEntries = detailedOrders.filter(Boolean);
            if (!currentEntries.length) {
                selectedOrderId = null;
                activeStatusPopover = null;
                renderOrders([]);
                return;
            }
            if (selectedOrderId && !currentEntries.some(({ order }) => order.id === selectedOrderId)) {
                selectedOrderId = null;
            }
            activeStatusPopover = null;
            refreshOrdersView();
            setFeedback('', false);
            setAuthStatus(messages.authSaved, false);
        } catch (error) {
            currentEntries = [];
            selectedOrderId = null;
            activeStatusPopover = null;
            renderOrders([]);
            setAuthStatus(error.status === 401 ? messages.authFailed : messages.loadFailed, true);
            setFeedback(messages.loadFailed, true);
        }
    };

    const loadAuthState = async () => {
        try {
            const response = await fetch('/api/admin/session', {
                headers: {
                    Accept: 'application/json'
                },
                credentials: 'same-origin'
            });
            if (!response.ok) {
                setAuthStatus(messages.authMissing, false);
                return false;
            }
            const payload = await response.json().catch(() => null);
            const authenticated = Boolean(payload?.authenticated);
            setAuthStatus(authenticated ? messages.authSaved : messages.authMissing, false);
            return authenticated;
        } catch {
            setAuthStatus(messages.authMissing, false);
            return false;
        }
    };

    authForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const password = passwordInput?.value || '';
            const response = await fetch('/api/admin/session', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({ password })
            });
            if (!response.ok) {
                throw new Error(messages.authFailed);
            }
            if (passwordInput) passwordInput.value = '';
            setAuthStatus(messages.authSaved, false);
            await loadOrders();
        } catch {
            setAuthStatus(messages.authFailed, true);
        }
    });

    clearAuthButton?.addEventListener('click', async () => {
        await fetch('/api/admin/session', {
            method: 'DELETE',
            credentials: 'same-origin'
        }).catch(() => {});
        if (passwordInput) passwordInput.value = '';
        setAuthStatus(messages.authCleared, false);
        currentEntries = [];
        selectedOrderId = null;
        activeStatusPopover = null;
        renderOrders([]);
    });

    ordersList?.addEventListener('click', async (event) => {
        const statusButton = event.target.closest('[data-status-button]');
        if (statusButton) {
            event.stopPropagation();
            const key = statusButton.getAttribute('data-status-key');
            activeStatusPopover = activeStatusPopover === key ? null : key;
            refreshOrdersView();
            return;
        }

        const saveButton = event.target.closest('[data-save-order-detail-allocation]');
        if (saveButton) {
            const form = saveButton.closest('[data-admin-order-detail-form]');
            if (!form) return;

            try {
                const orderId = form.getAttribute('data-allocation-id');
                const payload = Object.fromEntries(Array.from(form.querySelectorAll('[name]')).map((field) => [field.name, field.value]));
                await adminFetch(`/api/order-allocations/${encodeURIComponent(orderId)}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                setFeedback(messages.allocationSaved, false);
                await loadOrders();
            } catch (error) {
                setFeedback(error.message || messages.orderLoadFailed, true);
            }
            return;
        }

        const row = event.target.closest('[data-order-row]');
        if (!row) return;
        activeStatusPopover = null;
        selectedOrderId = row.getAttribute('data-order-id') === selectedOrderId ? null : row.getAttribute('data-order-id');
        refreshOrdersView();
    });

    searchInput?.addEventListener('input', () => {
        selectedOrderId = null;
        activeStatusPopover = null;
        refreshOrdersView();
    });

    paymentFilter?.addEventListener('change', () => {
        selectedOrderId = null;
        activeStatusPopover = null;
        refreshOrdersView();
    });

    fulfilmentFilter?.addEventListener('change', () => {
        selectedOrderId = null;
        activeStatusPopover = null;
        refreshOrdersView();
    });

    reloadButton?.addEventListener('click', () => {
        loadOrders();
    });

    loadAuthState().then((authenticated) => {
        if (authenticated) {
            loadOrders();
            return;
        }
        renderOrders([]);
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
