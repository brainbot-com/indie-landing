// ========================================
// INDIE LANDING PAGE - JavaScript
// Form handling, analytics, tracking
// ========================================

// Configuration
const CONFIG = {
    formEndpoint: 'https://formspree.io/f/YOUR_FORM_ID', // TODO: Replace with actual Formspree ID
    matomoUrl: 'https://analytics.example.com/', // TODO: Replace with Matomo instance
    matomoSiteId: 1,
};



// ========================================
// Email Form Handling
// ========================================

function setupEmailForms() {
    const forms = document.querySelectorAll('.email-form');

    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = form.querySelector('.email-input');
            const submitButton = form.querySelector('.cta-button');
            const email = emailInput.value.trim();

            if (!isValidEmail(email)) {
                showMessage(form, 'Please enter a valid email address.', 'error');
                return;
            }

            // Disable form while submitting
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';

            try {
                await submitEmail(email, form.id);

                // Track conversion
                trackEvent('Email Signup', 'Submit', form.id);

                // Success
                showMessage(form, '✓ You\'re on the list! Check your email for confirmation.', 'success');
                emailInput.value = '';

                // Redirect to thank you page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'thank-you.html';
                }, 2000);

            } catch (error) {
                console.error('Form submission error:', error);
                showMessage(form, 'Something went wrong. Please try again.', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = form.id === 'heroForm' ? 'INITIATE_ACCESS' : 'SECURE_ALLOCATION';
            }
        });
    });
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

async function submitEmail(email, formId) {
    // TODO: Replace with actual form submission endpoint (Formspree, Mailchimp, custom API)

    // For now, log to console (development)
    console.log('Email submitted:', { email, formId, timestamp: new Date().toISOString() });

    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            // Store in localStorage as backup
            const submissions = JSON.parse(localStorage.getItem('emailSubmissions') || '[]');
            submissions.push({ email, formId, timestamp: new Date().toISOString() });
            localStorage.setItem('emailSubmissions', JSON.stringify(submissions));

            resolve({ success: true });
        }, 500);
    });

    /* Uncomment when using Formspree:
    const response = await fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email, 
            formId,
            timestamp: new Date().toISOString(),
            source: window.location.href
        })
    });
    
    if (!response.ok) {
        throw new Error('Form submission failed');
    }
    
    return await response.json();
    */
}

function showMessage(form, message, type) {
    // Remove existing message
    const existingMsg = form.querySelector('.form-message');
    if (existingMsg) {
        existingMsg.remove();
    }

    // Create new message
    const msgDiv = document.createElement('div');
    msgDiv.className = `form-message ${type}`;
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
        margin-top: 1rem;
        padding: 0.75rem 1rem;
        border-radius: 6px;
        font-size: 0.9rem;
        text-align: center;
        background: ${type === 'success' ? '#00CC66' : '#FF6B6B'};
        color: white;
    `;

    form.appendChild(msgDiv);

    // Auto-remove after 5 seconds (if not success)
    if (type !== 'success') {
        setTimeout(() => msgDiv.remove(), 5000);
    }
}

// ========================================
// Analytics & Tracking
// ========================================

function setupAnalytics() {
    // Matomo Analytics (privacy-friendly)
    if (CONFIG.matomoUrl && CONFIG.matomoSiteId) {
        var _paq = window._paq = window._paq || [];
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);

        (function () {
            var u = CONFIG.matomoUrl;
            _paq.push(['setTrackerUrl', u + 'matomo.php']);
            _paq.push(['setSiteId', CONFIG.matomoSiteId]);
            var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
            g.async = true; g.src = u + 'matomo.js';
            s.parentNode.insertBefore(g, s);
        })();
    }

    // Track scroll depth
    setupScrollTracking();

    // Track CTA clicks
    setupCTATracking();

    // Track FAQ interactions
    setupFAQTracking();
}

function trackEvent(category, action, name) {
    console.log('Event tracked:', { category, action, name });

    // Matomo
    if (window._paq) {
        window._paq.push(['trackEvent', category, action, name]);
    }
}

function setupScrollTracking() {
    const thresholds = [25, 50, 75, 100];
    const tracked = new Set();

    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

        thresholds.forEach(threshold => {
            if (scrollPercent >= threshold && !tracked.has(threshold)) {
                tracked.add(threshold);
                trackEvent('Scroll Depth', `${threshold}%`, window.location.pathname);
            }
        });
    });
}

function setupCTATracking() {
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', () => {
            const formId = button.closest('form')?.id || 'unknown';
            trackEvent('CTA Click', 'Button Click', formId);
        });
    });
}

function setupFAQTracking() {
    document.querySelectorAll('.faq-item').forEach((item, index) => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                const question = item.querySelector('.faq-question').textContent;
                trackEvent('FAQ', 'Question Opened', `Q${index + 1}: ${question.substring(0, 50)}`);
            }
        });
    });
}

// ========================================
// UTM Parameter Tracking
// ========================================

function trackUTMParameters() {
    const params = new URLSearchParams(window.location.search);
    const utmParams = {};

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
        if (params.has(param)) {
            utmParams[param] = params.get(param);
        }
    });

    if (Object.keys(utmParams).length > 0) {
        console.log('UTM Parameters:', utmParams);
        localStorage.setItem('utm_params', JSON.stringify(utmParams));

        // Track campaign visit
        trackEvent('Campaign', 'Visit', utmParams.utm_campaign || 'unknown');
    }
}

// ========================================
// Page Load Performance
// ========================================

function trackPagePerformance() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                const loadTime = perfData.loadEventEnd - perfData.fetchStart;
                console.log('Page load time:', Math.round(loadTime), 'ms');

                // Track if load time is slow
                if (loadTime > 3000) {
                    trackEvent('Performance', 'Slow Load', `${Math.round(loadTime)}ms`);
                }
            }
        }, 0);
    });
}

// ========================================
// Initialize Everything
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    setupEmailForms();
    setupAnalytics();
    trackUTMParameters();
    trackPagePerformance();

    console.log('🚀 INDIE PLATFORM: SYSTEM_ONLINE');
    console.log('📧 STORAGE_MODE: LOCAL');
    console.log('📊 TELEMETRY: ACTIVE');
});

// ========================================
// Export for testing (if needed)
// ========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidEmail,
        trackEvent
    };
}