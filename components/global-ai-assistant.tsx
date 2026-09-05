'use client';

import { useEffect, useRef, useState } from 'react';

export default function GlobalAIAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

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
      if (r.status === 401) {
        setAnswer('Please sign in first to use the INTERVIEW AI Assistant.');
      } else {
        setAnswer(data.answer || data.error || 'AI could not answer right now.');
      }
    } catch {
      setAnswer('The AI service is temporarily unavailable. You can still use the built-in learning tools.');
    } finally {
      setBusy(false);
    }
  }

  const quickPrompts = [
    'Explain this topic simply',
    'Help me solve this coding problem',
    'Give me interview questions',
    'Make a study plan for me',
  ];

  return (
    <>
      {open && <button aria-label="Close AI assistant overlay" onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1090, border: 0, background: 'rgba(15,23,42,.22)', backdropFilter: 'blur(3px)', cursor: 'default' }} />}

      <button onClick={() => setOpen(v => !v)} aria-label="Open INTERVIEW AI Assistant" title="Open AI Assistant" style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1100, width: 62, height: 62, border: '1px solid rgba(255,255,255,.7)', borderRadius: 20, cursor: 'pointer', color: '#fff', background: 'linear-gradient(135deg,#172554,#4f46e5,#0891b2)', boxShadow: '0 14px 35px rgba(79,70,229,.35)', fontSize: 27, transition: 'transform .2s ease, box-shadow .2s ease' }}>
        {open ? '×' : '✦'}
      </button>

      {open && (
        <aside role="dialog" aria-label="INTERVIEW AI Assistant" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1095, width: 'min(430px, 100vw)', background: 'rgba(248,250,252,.97)', backdropFilter: 'blur(22px)', borderLeft: '1px solid #e2e8f0', boxShadow: '-20px 0 60px rgba(15,23,42,.16)', display: 'flex', flexDirection: 'column', animation: 'aiSlideIn .25s ease-out' }}>
          <style>{`@keyframes aiSlideIn{from{transform:translateX(100%);opacity:.7}to{transform:translateX(0);opacity:1}}@keyframes aiPulse{0%,100%{opacity:.35}50%{opacity:1}}`}</style>
          <div style={{ padding: '22px 20px 18px', color: '#fff', background: 'linear-gradient(135deg,#111827,#312e81 55%,#0369a1)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', right: -70, top: -80, background: 'rgba(255,255,255,.1)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              <div><div style={{ fontSize: 12, letterSpacing: '.12em', fontWeight: 900, opacity: .75 }}>INTERVIEW AI</div><h2 style={{ margin: '5px 0 0', fontSize: 25 }}>Your AI Assistant</h2></div>
              <div style={{ width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 14, background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.2)', fontSize: 22 }}>🤖</div>
            </div>
            <p style={{ margin: '13px 0 0', fontSize: 13, lineHeight: 1.6, opacity: .86, position: 'relative' }}>Open me anytime. I can explain topics, debug code, prepare interviews and build your study plan.</p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
            {!answer && <>
              <div style={{ display: 'grid', gap: 9, marginBottom: 18 }}>
                {quickPrompts.map(prompt => <button key={prompt} onClick={() => setMessage(prompt)} style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 13, border: '1px solid #e2e8f0', background: '#fff', color: '#334155', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 14px rgba(15,23,42,.04)' }}>{prompt} <span style={{ float: 'right', color: '#6366f1' }}>→</span></button>)}
              </div>
              <div style={{ padding: 15, borderRadius: 16, background: 'linear-gradient(135deg,#eef2ff,#ecfeff)', border: '1px solid #dbeafe', color: '#334155', fontSize: 13, lineHeight: 1.6 }}><b>💡 Tip</b><br />Ask specific questions for better answers. You can paste a coding error, question, concept or interview problem here.</div>
            </>}
            {answer && <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 17, padding: 16, boxShadow: '0 8px 24px rgba(15,23,42,.06)' }}><div style={{ fontSize: 12, fontWeight: 900, color: '#4f46e5', letterSpacing: '.08em' }}>AI RESPONSE</div><p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#334155', margin: '10px 0 0' }}>{answer}</p></div>}
            {busy && <div style={{ marginTop: 12, padding: 14, borderRadius: 14, background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>✦ Thinking<span style={{ animation: 'aiPulse 1s infinite' }}>...</span></div>}
          </div>

          <div style={{ padding: 15, borderTop: '1px solid #e2e8f0', background: 'rgba(255,255,255,.9)' }}>
            <textarea ref={inputRef} value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) ask(); }} placeholder="Ask your AI assistant anything…" maxLength={2000} style={{ width: '100%', minHeight: 94, maxHeight: 180, resize: 'vertical', padding: 14, border: '1px solid #cbd5e1', borderRadius: 15, outline: 'none', background: '#f8fafc', color: '#0f172a', lineHeight: 1.5 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 9, gap: 10 }}><span style={{ fontSize: 11, color: '#94a3b8' }}>Ctrl/Cmd + Enter to send</span><button className="btn" onClick={ask} disabled={busy || !message.trim()}>{busy ? 'Thinking…' : 'Ask Assistant ✨'}</button></div>
            <button onClick={() => { setAnswer(''); setMessage(''); }} style={{ marginTop: 9, border: 0, background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Clear conversation</button>
          </div>
        </aside>
      )}
    </>
  );
}
