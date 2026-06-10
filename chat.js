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

    // Conversation history sent to the backend (system prompt is added server-side).
    const messages = [];
    let busy = false;

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
        messages.push({ role: 'user', content: content });

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
                        bubble.textContent = answer;
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
