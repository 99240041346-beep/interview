'use client';

import { useState } from 'react';

export default function GlobalAIAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);

  async function ask() {
    if (!message.trim() || busy) return;
    setBusy(true);
    setAnswer('');
    try {
      const r = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });
      const data = await r.json();
      setAnswer(data.answer || data.error || 'AI could not answer right now.');
    } catch {
      setAnswer('AI is temporarily unavailable. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Open AI assistant"
        style={{ position: 'fixed', right: 22, bottom: 22, zIndex: 1000, border: 0, borderRadius: 999, padding: '13px 18px', cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,.18)', fontWeight: 800 }}
      >
        🤖 AI Answers
      </button>
      {open && (
        <div className="card" style={{ position: 'fixed', right: 22, bottom: 78, zIndex: 999, width: 'min(390px, calc(100vw - 32px))', boxShadow: '0 14px 45px rgba(0,0,0,.18)' }}>
          <div className="topline">
            <div><span className="pill">AI ASSISTANT</span><h3 style={{ margin: '8px 0 0' }}>Ask anything</h3></div>
            <button className="btn secondary" onClick={() => setOpen(false)}>×</button>
          </div>
          <p className="muted">Get explanations, examples, coding help, interview answers, study plans and revision help anywhere in the website.</p>
          <textarea value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) ask(); }} placeholder="Example: Explain binary search with Java code" maxLength={2000} style={{ width: '100%', minHeight: 100, padding: 12, border: '1px solid #ccd3dd', borderRadius: 10 }} />
          <button className="btn" onClick={ask} disabled={busy || !message.trim()} style={{ marginTop: 10 }}>{busy ? 'Thinking…' : 'Ask AI'}</button>
          {answer && <div className="notice" style={{ marginTop: 12, maxHeight: 300, overflow: 'auto' }}><b>🤖 AI Answer</b><p style={{ whiteSpace: 'pre-wrap' }}>{answer}</p></div>}
        </div>
      )}
    </>
  );
}
