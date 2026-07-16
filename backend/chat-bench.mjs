// Ad-hoc chat latency benchmark. Runs a fixed sequence of requests against
// /api/chat SEQUENTIALLY so the cluster's warm/cold state is observable.
// Usage: node chat-bench.mjs [baseUrl]
const BASE = process.argv[2] || 'https://staging.indiebox.ai/api/chat';
const Q1 = 'Was ist Optionshandel? Fasse dich kurz, 3-4 Sätze.';
const Q2 = 'Was ist ein ETF? Fasse dich kurz, 3-4 Sätze.';

const QWEN = 'Qwen3.6-35B-A3B-8bit';
const MINI = 'MiniMax-M2.7-8bit';
const KIMI = 'Kimi-K2.6';

const steps = [
  // Teil 1: jede Modell/Modus-Kombi, Frage 1
  { tag: 'P1 Qwen    think', model: QWEN, think: true,  q: Q1 },
  { tag: 'P1 Qwen    fast',  model: QWEN, think: false, q: Q1 },
  { tag: 'P1 MiniMax think', model: MINI, think: true,  q: Q1 },
  { tag: 'P1 MiniMax fast',  model: MINI, think: false, q: Q1 },
  { tag: 'P1 Kimi    think', model: KIMI, think: true,  q: Q1 },
  { tag: 'P1 Kimi    fast',  model: KIMI, think: false, q: Q1 },
  // Teil 2: warm vs. Modellwechsel (fast mode), 2. Frage zeigt warmen Lauf
  { tag: 'P2 Qwu    #1 switch', model: QWEN, think: false, q: Q1 },
  { tag: 'P2 Qwen   #2 warm',   model: QWEN, think: false, q: Q2 },
  { tag: 'P2 MiniMax#1 switch', model: MINI, think: false, q: Q1 },
  { tag: 'P2 MiniMax#2 warm',   model: MINI, think: false, q: Q2 },
  { tag: 'P2 Qwen   #1 switch', model: QWEN, think: false, q: Q1 }
];

function fmt(x) { return x == null ? '   -  ' : (x.toFixed(2) + 's').padStart(7); }

async function run(step) {
  const t0 = Date.now();
  const el = () => (Date.now() - t0) / 1000;
  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), 120000);
  try {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ messages: [{ role: 'user', content: step.q }], think: step.think, model: step.model }),
      signal: ac.signal
    });
    const ttfb = el();
    if (!res.ok || !res.body) return { ...step, ttfb, error: 'HTTP ' + res.status };
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '', firstReason = null, firstContent = null, reasonTok = 0, contentTok = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        if (!line.startsWith('data:')) continue;
        const d = line.slice(5).trim();
        if (d === '[DONE]') continue;
        let p; try { p = JSON.parse(d); } catch { continue; }
        const dl = (p.choices && p.choices[0] && p.choices[0].delta) || {};
        if (dl.reasoning_content) { if (firstReason === null) firstReason = el(); reasonTok++; }
        if (dl.content) { if (firstContent === null) firstContent = el(); contentTok++; }
      }
    }
    return { ...step, ttfb, firstReason, firstContent, reasonTok, contentTok, done: el() };
  } catch (e) {
    return { ...step, error: e.name === 'AbortError' ? 'timeout(120s)' : e.message };
  } finally {
    clearTimeout(to);
  }
}

console.log('Ziel:', BASE);
console.log('Spalten: TTFB | erster sichtbarer Token | fertig | Denk-Tokens | Antwort-Tokens\n');
for (const step of steps) {
  const r = await run(step);
  if (r.error) {
    console.log(`${r.tag.padEnd(20)} | FEHLER: ${r.error}`);
  } else {
    console.log(
      `${r.tag.padEnd(20)} | TTFB ${fmt(r.ttfb)} | 1.Tok ${fmt(r.firstContent)} | fertig ${fmt(r.done)} | denk ${String(r.reasonTok).padStart(4)} | ans ${String(r.contentTok).padStart(4)}`
    );
  }
}
