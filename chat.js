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
            errorGeneric: 'Sorry, something went wrong. Please try again.',
            errorUnavailable: 'The chat is currently unavailable. Please try again later.',
            errorModel: 'The AI model is not running right now. Please try again in a moment.'
        }
        : {
            thinking: 'Denkt nach …',
            errorGeneric: 'Entschuldigung, da ist etwas schiefgelaufen. Bitte versuche es erneut.',
            errorUnavailable: 'Der Chat ist gerade nicht verfügbar. Bitte versuche es später noch einmal.',
            errorModel: 'Das KI-Modell läuft gerade nicht. Bitte versuche es gleich noch einmal.'
        };

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

    // Show which model is live (fetched from the backend; never the key/URL).
    const modelEl = document.getElementById('chat-model');
    if (modelEl) {
        fetch('/api/chat/info', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (info) {
                if (info && info.model) modelEl.textContent = info.model;
                else modelEl.textContent = '—';
            })
            .catch(function () { modelEl.textContent = '—'; });
    }

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
        sendButton.disabled = state;
        input.disabled = state;
        sendButton.classList.toggle('is-loading', state);
    }

    async function send(text) {
        const content = text.trim();
        if (!content || busy) return;

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

        let answer = '';

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
                credentials: 'same-origin',
                body: JSON.stringify({ messages: messages })
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
                    const piece = delta && delta.content;
                    if (piece) {
                        if (!started) {
                            started = true;
                            bubble.classList.remove('chat-bubble--pending');
                            bubble.textContent = '';
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
                bubble.textContent = STRINGS.errorModel;
                bubble.classList.add('chat-bubble--error');
                setBusy(false);
                return;
            }

            messages.push({ role: 'assistant', content: answer });
        } catch (err) {
            bubble.classList.remove('chat-bubble--pending');
            bubble.textContent = STRINGS.errorGeneric;
            bubble.classList.add('chat-bubble--error');
        } finally {
            setBusy(false);
            input.focus();
        }
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
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
