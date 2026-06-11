/*
 * Indie.box chat client.
 *
 * Talks to the same-origin `/api/chat` endpoint, which proxies to the
 * LiteLLM gateway server-side (the API key never reaches the browser).
 * The endpoint streams an OpenAI-compatible Server-Sent Events response;
 * we parse `data:` lines and render assistant tokens as they arrive.
 *
 * No framework, no build step — plain DOM, matching the rest of the site.
 */
(function () {
    'use strict';

    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const sendButton = document.getElementById('chat-send');
    const log = document.getElementById('chat-log');
    if (!form || !input || !sendButton || !log) return;

    const isEnglish = (document.documentElement.lang || 'de').toLowerCase().startsWith('en');
    const STRINGS = isEnglish
        ? {
            thinking: 'Thinking …',
            thought: 'Reasoning',
            stop: 'Stop',
            errorGeneric: 'Sorry, something went wrong. Please try again.',
            errorUnavailable: 'The chat is currently unavailable. Please try again later.',
            errorModel: 'The AI model is not running right now. Please try again in a moment.'
        }
        : {
            thinking: 'Denkt nach …',
            thought: 'Gedankengang',
            stop: 'Stopp',
            errorGeneric: 'Entschuldigung, da ist etwas schiefgelaufen. Bitte versuche es erneut.',
            errorUnavailable: 'Der Chat ist gerade nicht verfügbar. Bitte versuche es später noch einmal.',
            errorModel: 'Das KI-Modell läuft gerade nicht. Bitte versuche es gleich noch einmal.'
        };

    // The send button doubles as a stop button while a response streams.
    const sendLabelEl = sendButton.querySelector('.chat-send-label');
    const SEND_TEXT = sendLabelEl ? sendLabelEl.textContent : '';
    let activeController = null;

    // The bottom toolbar has two custom dropdowns (model picker, answer-mode
    // picker), styled identically. Shared open/close wiring; opening one closes
    // the other, and clicks outside / Escape close all.
    const dropdowns = [];
    function closeAllDropdowns() {
        dropdowns.forEach(function (d) { d.setOpen(false); });
    }
    function makeDropdown(rootId, buttonId, menuId) {
        const root = document.getElementById(rootId);
        const button = document.getElementById(buttonId);
        const menu = document.getElementById(menuId);
        if (!root || !button || !menu) return null;
        function setOpen(open) {
            menu.hidden = !open;
            root.classList.toggle('is-open', open);
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            const willOpen = menu.hidden;
            closeAllDropdowns();
            setOpen(willOpen);
        });
        const api = { root: root, button: button, menu: menu, setOpen: setOpen };
        dropdowns.push(api);
        return api;
    }
    document.addEventListener('click', function (event) {
        dropdowns.forEach(function (d) { if (!d.root.contains(event.target)) d.setOpen(false); });
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closeAllDropdowns();
    });

    // On narrow screens the three pickers collapse behind an "Options" toggle.
    function closeOpts() {
        const toolbar = document.getElementById('chat-toolbar');
        const toggle = document.getElementById('chat-opts-toggle');
        if (toolbar) toolbar.classList.remove('is-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
    (function initOptsToggle() {
        const toolbar = document.getElementById('chat-toolbar');
        const toggle = document.getElementById('chat-opts-toggle');
        if (!toolbar || !toggle) return;
        toggle.addEventListener('click', function () {
            const open = !toolbar.classList.contains('is-open');
            toolbar.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    })();

    // Answer-mode picker: "Instant Answer" (reasoning off, fast) vs
    // "Thinking Mode" (reasoning on, with the live chain-of-thought shown).
    let thinkMode = false;   // effective flag sent to the backend
    let userMode = false;    // the user's chosen mode for toggle-capable models
    // MiniMax M2 always reasons; no parameter disables it, so the mode toggle is
    // meaningless there — those models show a static "Auto" instead.
    function modelSupportsModeToggle(id) { return !/minimax/i.test(id || ''); }
    let setModeForModel = function () {};   // wired up by initModeMenu
    let setMode = function () {};           // wired up by initModeMenu (used by chips)

    (function initModeMenu() {
        const dd = makeDropdown('chat-mode', 'chat-mode-button', 'chat-mode-menu');
        const current = document.getElementById('chat-mode-current');
        if (!dd || !current) return;
        const options = Array.prototype.slice.call(dd.menu.querySelectorAll('.chat-mode-option'));

        function labelFor(mode) {
            const o = dd.menu.querySelector('.chat-mode-option[data-mode="' + mode + '"] .chat-mode-label');
            return o ? o.textContent : mode;
        }
        const instantLabel = labelFor('instant');
        const thinkingLabel = labelFor('thinking');

        function setActive(isThinking) {
            options.forEach(function (o) {
                const active = (o.getAttribute('data-mode') === 'thinking') === isThinking;
                o.classList.toggle('is-active', active);
                o.setAttribute('aria-selected', active ? 'true' : 'false');
            });
        }

        // Apply a mode choice, respecting the current model's capability.
        function apply(isThinking) {
            userMode = isThinking;
            if (modelSupportsModeToggle(selectedModel)) {
                thinkMode = userMode;
                current.textContent = userMode ? thinkingLabel : instantLabel;
                setActive(userMode);
            }
        }
        setMode = apply;

        options.forEach(function (opt) {
            opt.addEventListener('click', function () {
                apply(opt.getAttribute('data-mode') === 'thinking');
                dd.setOpen(false);
                closeOpts();
            });
        });

        setModeForModel = function (model) {
            if (modelSupportsModeToggle(model)) {
                dd.root.classList.remove('chat-mode--static');
                dd.button.disabled = false;
                thinkMode = userMode;
                current.textContent = userMode ? thinkingLabel : instantLabel;
                setActive(userMode);
            } else {
                // Always-reasoning model: no choice. Show a static "Auto"; the
                // reasoning streams into the thinking box live regardless.
                dd.setOpen(false);
                dd.button.disabled = true;
                dd.root.classList.add('chat-mode--static');
                current.textContent = 'Auto';
                thinkMode = true;
            }
        };
    })();

    // Friendly metadata for the known models (drives the rich picker).
    function modelMeta(id) {
        const x = (id || '').toLowerCase();
        if (/qwen/.test(x)) return { short: 'Qwen3.6', role: isEnglish ? 'The Fast One' : 'Der Schnelle', tag: isEnglish ? 'speed, images & long docs' : 'Tempo, Bilder & lange Docs', rec: false };
        if (/minimax/.test(x)) return { short: 'MiniMax M2.7', role: isEnglish ? 'The All-Rounder' : 'Der Allrounder', tag: isEnglish ? 'balanced default' : 'ausgewogen, Standardwahl', rec: true };
        if (/kimi/.test(x)) return { short: 'Kimi K2.6', role: isEnglish ? 'The Deep Thinker' : 'Der Tiefdenker', tag: isEnglish ? 'multi-step tasks' : 'mehrstufige Aufgaben', rec: false };
        return { short: id, role: id, tag: '', rec: false };
    }
    let openCompare = function () {};   // wired up by initCompareModal

    // Model picker: reads the available models from the backend (key stays
    // server-side) and lets the user switch; the choice is sent with each message.
    let selectedModel = '';
    (function initModelMenu() {
        const dd = makeDropdown('chat-model', 'chat-model-button', 'chat-model-menu');
        const current = document.getElementById('chat-model-current');
        if (!dd || !current) return;
        const MODEL_LABEL = isEnglish ? 'Model' : 'Modell';

        function choose(id) {
            selectedModel = id;
            current.innerHTML = '';
            const pfx = document.createElement('span');
            pfx.className = 'chat-model-prefix';
            pfx.textContent = MODEL_LABEL + ': ';
            const nm = document.createElement('span');
            nm.className = 'chat-model-name';
            nm.textContent = modelMeta(id).short || id;
            current.appendChild(pfx);
            current.appendChild(nm);
            Array.prototype.slice.call(dd.menu.querySelectorAll('.chat-model-option')).forEach(function (o) {
                const active = o.getAttribute('data-model') === id;
                o.classList.toggle('is-active', active);
                o.setAttribute('aria-selected', active ? 'true' : 'false');
            });
            // Update the answer-mode picker for this model's capabilities.
            setModeForModel(id);
        }

        function buildOption(id) {
            const meta = modelMeta(id);
            const li = document.createElement('li');
            li.className = 'chat-mode-option chat-model-option';
            li.setAttribute('role', 'option');
            li.setAttribute('data-model', id);

            const check = document.createElement('span');
            check.className = 'chat-mode-check';
            check.setAttribute('aria-hidden', 'true');
            check.textContent = '✓';

            const text = document.createElement('span');
            text.className = 'chat-model-opt';
            const role = document.createElement('span');
            role.className = 'chat-model-opt-role';
            role.textContent = meta.role;
            if (meta.rec) {
                const badge = document.createElement('span');
                badge.className = 'chat-model-opt-badge';
                badge.textContent = isEnglish ? 'Recommended' : 'Empfehlung';
                role.appendChild(document.createTextNode(' '));
                role.appendChild(badge);
            }
            const sub = document.createElement('span');
            sub.className = 'chat-model-opt-sub';
            sub.textContent = meta.tag ? (id + ' · ' + meta.tag) : id;
            text.appendChild(role);
            text.appendChild(sub);

            li.appendChild(check);
            li.appendChild(text);
            li.addEventListener('click', function () {
                choose(id);
                dd.setOpen(false);
                closeOpts();
            });
            return li;
        }

        fetch('/api/chat/models', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (info) {
                const models = (info && info.models) || [];
                const def = (info && info.default) || models[0] || '';
                if (!models.length) { selectedModel = def; current.textContent = def ? MODEL_LABEL + ': ' + def : '—'; return; }
                dd.menu.innerHTML = '';
                models.forEach(function (id) { dd.menu.appendChild(buildOption(id)); });

                // "Compare all models" opens the overview overlay.
                const compare = document.createElement('li');
                compare.className = 'chat-model-compare';
                compare.setAttribute('role', 'button');
                compare.tabIndex = 0;
                compare.textContent = (isEnglish ? 'Compare all models' : 'Alle Modelle vergleichen') + ' →';
                compare.addEventListener('click', function () { dd.setOpen(false); openCompare(); });
                dd.menu.appendChild(compare);

                choose(models.indexOf(def) >= 0 ? def : models[0]);
            })
            .catch(function () { current.textContent = '—'; });
    })();

    // Model-comparison overlay, opened from the model picker.
    (function initCompareModal() {
        const modal = document.getElementById('model-compare');
        if (!modal) return;
        function setOpen(open) {
            modal.hidden = !open;
            document.body.classList.toggle('modal-open', open);
        }
        openCompare = function () { setOpen(true); };
        Array.prototype.slice.call(modal.querySelectorAll('[data-close]')).forEach(function (el) {
            el.addEventListener('click', function () { setOpen(false); });
        });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    })();

    // When the user agrees to the greeting's follow-up question, the model
    // gets this fuller prompt instead of the bare "ja"/"yes" — otherwise it
    // has no context for the answer (the greeting lives only in the UI, not in
    // the conversation history). The visible bubble still shows what the user
    // typed. Edit this copy freely.
    const INTRO_FOLLOWUP_PROMPT = isEnglish
        ? 'Yes, please. Explain concretely and clearly the areas where the Indie.cluster can support me. Cover, among others: working and chatting with your own documents (PDFs, contracts, reports) including knowledge bases; building agents and automated workflows with tool and API connectivity; running various AI models locally for text analysis, research, coding, and content creation; and handling long contexts with autonomous validation across the cluster. Describe each area in one or two sentences with a practical example, and emphasise that everything runs fully local and private, with no cloud.'
        : 'Ja, gerne. Bitte erkläre mir konkret und übersichtlich, in welchen Einsatzgebieten mich der Indie.cluster unterstützen kann. Gehe dabei unter anderem auf diese Bereiche ein: das Arbeiten und Chatten mit eigenen Dokumenten (PDFs, Verträge, Berichte) inklusive Wissensdatenbanken; das Erstellen von Agenten und automatisierten Workflows mit Tool- und API-Anbindung; das lokale Ausführen verschiedener KI-Modelle für Textanalyse, Recherche, Programmierung und Inhaltserstellung; sowie die Verarbeitung langer Kontexte und autonome Validierungen über den Cluster. Beschreibe jeden Bereich in ein bis zwei Sätzen mit einem praxisnahen Beispiel und betone, dass alles vollständig lokal und privat ohne Cloud läuft.';

    // A short affirmative answer to the greeting question ("ja", "yes", …).
    const AFFIRMATIVE_RE = /^(ja|jo|jap|jepp|yes|yep|yeah|klar|na klar|gerne|sicher|unbedingt|sure|ok|okay)\b/;
    function isAffirmative(text) {
        return AFFIRMATIVE_RE.test(text.toLowerCase().trim());
    }

    // Conversation history sent to the backend (system prompt is added server-side).
    const messages = [];
    let busy = false;
    // True until the user's first message — their answer to the greeting question.
    let awaitingIntro = true;

    // Run an example prompt: set the matching mode, then send it.
    function runExample(prompt, mode) {
        if (!prompt) return;
        setMode(mode === 'thinking');
        send(prompt);
    }

    // Starter chips under the greeting (a one-time aid; vanish after first send)
    // AND the always-available "Examples" dropdown in the toolbar.
    (function initExamples() {
        const box = document.getElementById('chat-suggestions');
        if (box) {
            Array.prototype.slice.call(box.querySelectorAll('.chat-chip')).forEach(function (chip) {
                chip.addEventListener('click', function () {
                    runExample(chip.getAttribute('data-prompt') || chip.textContent, chip.getAttribute('data-mode'));
                });
            });
        }
        const dd = makeDropdown('chat-examples', 'chat-examples-button', 'chat-examples-menu');
        if (dd) {
            Array.prototype.slice.call(dd.menu.querySelectorAll('.chat-example')).forEach(function (item) {
                item.addEventListener('click', function () {
                    dd.setOpen(false);
                    runExample(item.getAttribute('data-prompt'), item.getAttribute('data-mode'));
                });
            });
        }
    })();

    function autoGrow() {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 200) + 'px';
    }
    input.addEventListener('input', autoGrow);

    function scrollToBottom() {
        log.scrollTop = log.scrollHeight;
    }

    function escapeHtml(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Inline Markdown on an already-HTML-escaped string: code, bold, italic, links.
    function inlineMarkdown(t) {
        return t
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/(^|[^*])\*([^*\n]+?)\*/g, '$1<em>$2</em>')
            .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)"']+)\)/g,
                '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    }

    // Minimal, dependency-free Markdown -> HTML for assistant bubbles. HTML is
    // escaped first, so only the known-safe tags below can ever be produced —
    // the model output cannot inject markup.
    function renderMarkdown(src) {
        const lines = escapeHtml(src).split('\n');
        const out = [];
        let list = null;   // 'ul' | 'ol'
        let para = [];     // buffered consecutive paragraph lines

        function flushPara() {
            if (para.length) { out.push('<p>' + para.join('<br>') + '</p>'); para = []; }
        }
        function closeList() {
            if (list) { out.push('</' + list + '>'); list = null; }
        }

        for (const raw of lines) {
            const line = raw.trim();
            if (!line) { flushPara(); closeList(); continue; }

            let m;
            if ((m = /^#{1,6}\s+(.*)$/.exec(line))) {
                flushPara(); closeList();
                out.push('<p><strong>' + inlineMarkdown(m[1]) + '</strong></p>');
            } else if ((m = /^[-*]\s+(.*)$/.exec(line))) {
                flushPara();
                if (list !== 'ul') { closeList(); out.push('<ul>'); list = 'ul'; }
                out.push('<li>' + inlineMarkdown(m[1]) + '</li>');
            } else if ((m = /^\d+\.\s+(.*)$/.exec(line))) {
                flushPara();
                if (list !== 'ol') { closeList(); out.push('<ol>'); list = 'ol'; }
                out.push('<li>' + inlineMarkdown(m[1]) + '</li>');
            } else {
                closeList();
                para.push(inlineMarkdown(line));
            }
        }
        flushPara(); closeList();
        return out.join('');
    }

    function addMessage(role, text) {
        const wrap = document.createElement('div');
        wrap.className = 'chat-message chat-message--' + role;
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.textContent = text || '';
        wrap.appendChild(bubble);
        log.appendChild(wrap);
        scrollToBottom();
        return bubble;
    }

    function setBusy(state) {
        busy = state;
        input.disabled = state;
        // While streaming the send button becomes a stop button (kept enabled).
        sendButton.classList.toggle('chat-send--stop', state);
        if (sendLabelEl) sendLabelEl.textContent = state ? STRINGS.stop : SEND_TEXT;
        sendButton.setAttribute('aria-label', state ? STRINGS.stop : SEND_TEXT);
    }

    async function send(text) {
        const content = text.trim();
        if (!content || busy) return;

        // Suggestion chips are a starting aid only — remove them on first send.
        const suggestions = document.getElementById('chat-suggestions');
        if (suggestions) suggestions.remove();

        addMessage('user', content);

        // First reply to the greeting: an affirmative ("ja"/"yes") becomes a
        // fuller prompt so the model lays out the concrete use cases; anything
        // else is sent as typed. Either way, the intro turn is now consumed.
        const outgoing = (awaitingIntro && isAffirmative(content)) ? INTRO_FOLLOWUP_PROMPT : content;
        awaitingIntro = false;
        messages.push({ role: 'user', content: outgoing });

        input.value = '';
        autoGrow();
        setBusy(true);

        // Placeholder assistant bubble with a typing indicator.
        const bubble = addMessage('assistant', '');
        bubble.classList.add('chat-bubble--pending');
        bubble.innerHTML = '<span class="chat-typing"><span></span><span></span><span></span></span>';

        const think = thinkMode;
        let answer = '';
        // Lazily-created disclosure that streams the model's reasoning.
        let thinkBody = null;
        let thinking = '';

        function appendThinking(piece) {
            if (!thinkBody) {
                const details = document.createElement('details');
                details.className = 'chat-think';
                details.open = true;
                details.innerHTML = '<summary></summary><div class="chat-think-body"></div>';
                details.querySelector('summary').textContent = STRINGS.thinking;
                bubble.parentElement.insertBefore(details, bubble);
                thinkBody = details.querySelector('.chat-think-body');
                // The reasoning stream replaces the typing dots.
                bubble.classList.remove('chat-bubble--pending');
                bubble.textContent = '';
                bubble.style.display = 'none';
            }
            thinking += piece;
            thinkBody.innerHTML = renderMarkdown(thinking);
            // Keep the newest reasoning visible: scroll the thinking box to its
            // bottom and follow along in the chat log.
            thinkBody.scrollTop = thinkBody.scrollHeight;
            scrollToBottom();
        }

        const controller = new AbortController();
        activeController = controller;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
                credentials: 'same-origin',
                signal: controller.signal,
                body: JSON.stringify({ messages: messages, think: think, model: selectedModel || undefined, lang: isEnglish ? 'en' : 'de' })
            });

            if (!response.ok || !response.body) {
                bubble.classList.remove('chat-bubble--pending');
                if (response.status === 503) {
                    bubble.textContent = STRINGS.errorUnavailable;
                } else if (response.status === 502) {
                    bubble.textContent = STRINGS.errorModel;
                } else {
                    bubble.textContent = STRINGS.errorGeneric;
                }
                bubble.classList.add('chat-bubble--error');
                setBusy(false);
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let started = false;

            // Read the SSE stream and accumulate token deltas.
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                let lineEnd;
                while ((lineEnd = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.slice(0, lineEnd).trim();
                    buffer = buffer.slice(lineEnd + 1);
                    if (!line || !line.startsWith('data:')) continue;

                    const data = line.slice(5).trim();
                    if (data === '[DONE]') continue;

                    let parsed;
                    try {
                        parsed = JSON.parse(data);
                    } catch (err) {
                        continue;
                    }

                    const delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta;
                    if (!delta) continue;

                    // Reasoning tokens arrive before the visible answer.
                    if (delta.reasoning_content) {
                        appendThinking(delta.reasoning_content);
                    }

                    const piece = delta.content;
                    if (piece) {
                        if (!started) {
                            started = true;
                            bubble.classList.remove('chat-bubble--pending');
                            bubble.style.display = '';
                            bubble.textContent = '';
                            // Collapse the reasoning once the answer begins.
                            if (thinkBody) {
                                const details = thinkBody.parentElement;
                                details.open = false;
                                details.querySelector('summary').textContent = STRINGS.thought;
                            }
                        }
                        answer += piece;
                        bubble.classList.add('chat-bubble--rendered');
                        bubble.innerHTML = renderMarkdown(answer);
                        scrollToBottom();
                    }
                }
            }

            if (!started) {
                // Stream ended without any content (e.g. upstream hiccup).
                bubble.classList.remove('chat-bubble--pending');
                bubble.style.display = '';
                bubble.textContent = STRINGS.errorModel;
                bubble.classList.add('chat-bubble--error');
                setBusy(false);
                return;
            }

            messages.push({ role: 'assistant', content: answer });
        } catch (err) {
            if (controller.signal.aborted) {
                // User stopped the response: keep whatever was already rendered
                // (so it stays in the history); if nothing was shown yet, drop
                // the empty assistant message entirely.
                if (answer) {
                    messages.push({ role: 'assistant', content: answer });
                } else {
                    const wrap = bubble.parentElement;
                    if (wrap) wrap.remove();
                }
            } else {
                bubble.classList.remove('chat-bubble--pending');
                bubble.style.display = '';
                bubble.textContent = STRINGS.errorGeneric;
                bubble.classList.add('chat-bubble--error');
            }
        } finally {
            activeController = null;
            setBusy(false);
            input.focus();
        }
    }

    // While streaming, the same button stops the response instead of sending.
    sendButton.addEventListener('click', function (event) {
        if (busy) {
            event.preventDefault();
            if (activeController) activeController.abort();
        }
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (busy) return;
        send(input.value);
    });

    // Enter to send, Shift+Enter for newline.
    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            send(input.value);
        }
    });

    input.focus();
})();
