'use client';

import { useEffect, useMemo, useState } from 'react';
import { ENGINEERING_PROGRAMS } from '@/lib/engineering-catalog';
import { getLearningProblems, LearningProblem } from '@/lib/learning-problems';

type Judge = { correct: boolean; score: number; output?: string; feedback?: string; explanation?: string; algorithm?: string; complexity?: string; referenceCode?: string; improvedCode?: string };
const LANGUAGES = ['Python', 'JavaScript', 'Java', 'C++', 'C'];
const TRACKS = Array.from(new Map(ENGINEERING_PROGRAMS.flatMap(p => p.tracks.map(t => [t.id, t]))).values());

const starter = (lang: string) => lang === 'Python' ? '# Write your solution here\n\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    solve()' : lang === 'Java' ? 'import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        // Write your solution here\n    }\n}' : lang === 'C++' ? '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}' : lang === 'C' ? '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}' : '// Write your solution here\nfunction solve() {\n}\nsolve();';

export default function Learn() {
  const [department, setDepartment] = useState('CSE');
  const [trackId, setTrackId] = useState('');
  const [moduleIndex, setModuleIndex] = useState(0);
  const [problemIndex, setProblemIndex] = useState(0);
  const [language, setLanguage] = useState('Python');
  const [code, setCode] = useState(starter('Python'));
  const [customInput, setCustomInput] = useState('');
  const [judge, setJudge] = useState<Judge | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [aiProblem, setAiProblem] = useState<LearningProblem | null>(null);
  const [tab, setTab] = useState<'problem' | 'code' | 'result'>('problem');
  const [history, setHistory] = useState<{ time: string; problem: string; status: string; score: number }[]>([]);

  const program = useMemo(() => ENGINEERING_PROGRAMS.find(p => p.code === department) || ENGINEERING_PROGRAMS[0], [department]);
  const track = useMemo(() => TRACKS.find(t => t.id === trackId) || program.tracks[0] || TRACKS[0], [trackId, program]);
  const module = track.modules[moduleIndex] || track.modules[0];
  const problems = useMemo(() => getLearningProblems(module.title), [module.title]);
  const baseProblem = problems[problemIndex] || problems[0];
  const problem = aiProblem || baseProblem;

  useEffect(() => { fetch('/api/dashboard').then(r => r.ok ? r.json() : null).then(d => { if (d?.user?.department) setDepartment(d.user.department); }); }, []);
  useEffect(() => { setModuleIndex(0); setProblemIndex(0); setAiProblem(null); }, [track.id]);
  useEffect(() => { setCode(starter(language)); setCustomInput(''); setJudge(null); setMessage(''); setShowSolution(false); setTab('problem'); }, [module.id]);

  function chooseProblem(i: number) { setAiProblem(null); setProblemIndex(i); setCode(starter(language)); setCustomInput(''); setJudge(null); setMessage(''); setShowSolution(false); setTab('problem'); }
  function changeLanguage(lang: string) { setLanguage(lang); setCode(starter(lang)); setJudge(null); setShowSolution(false); }

  async function runCode(solutionMode = false) {
    if (!solutionMode && code.trim().length < 15) { setMessage('Write your complete program first.'); setTab('code'); return; }
    setBusy(true); setJudge(null); setShowSolution(solutionMode); setTab('result'); setMessage(solutionMode ? 'Generating a complete solution…' : 'Evaluating your submission…');
    try {
      const task = `${problem.title}\n${problem.problem}\n\nInput Format:\n${problem.input}\n\nOutput Format:\n${problem.output}\n\nConstraints:\n${problem.constraints}\n\nSample:\n${problem.example}`;
      const r = await fetch('/api/ai/code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ course: track.title, module: module.title, language, code: solutionMode ? 'Generate a complete exam-ready solution.' : code, task, solutionMode }) });
      const d = await r.json();
      if (!r.ok) { setMessage(d.error || 'Compiler service failed.'); return; }
      setJudge(d);
      if (!solutionMode) {
        const accepted = Boolean(d.correct) && Number(d.score) >= 100;
        setHistory(h => [{ time: new Date().toLocaleTimeString(), problem: problem.title, status: accepted ? 'ACCEPTED' : 'WRONG ANSWER', score: Number(d.score) || 0 }, ...h].slice(0, 30));
        if (accepted) setMessage('✓ ACCEPTED'); else setMessage('✗ WRONG ANSWER — fix the code and submit again.');
      } else setMessage('✓ Complete reference solution generated.');
    } catch { setMessage('Unable to reach the coding evaluator.'); }
    finally { setBusy(false); }
  }

  async function newProblem() {
    setBusy(true); setMessage('Creating a new competitive-programming problem…');
    try {
      const r = await fetch('/api/ai/coding-question', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ course: track.title, module: module.title, language }) });
      const d = await r.json();
      if (!r.ok) { setMessage(d.error || 'Could not create problem.'); return; }
      setAiProblem({ id: `ai-${Date.now()}`, title: d.title || 'AI Coding Challenge', level: d.level || 'Medium', problem: d.problem || d.question || 'Solve the challenge.', input: d.input || 'Standard input.', output: d.output || 'Standard output.', constraints: d.constraints || 'Use the stated constraints.', example: d.example || 'See statement.', timeLimit: d.timeLimit || '2 seconds', memoryLimit: d.memoryLimit || '256 MB' });
      setCode(starter(language)); setCustomInput(''); setJudge(null); setTab('problem'); setMessage('✓ New problem ready.');
    } catch { setMessage('Could not create problem.'); }
    finally { setBusy(false); }
  }

  if (!trackId) return <main className="container"><nav className="nav"><b className="brand">INTERVIEW</b><div className="navlinks"><a href="/dashboard">Dashboard</a><a className="btn secondary" href="/ai-coach">AI Assistant</a></div></nav><div style={{ marginTop: 40 }}><div className="eyebrow">LEARNING • CODING COMPILER</div><h1 className="title">Online Coding Practice</h1><p className="muted">No lessons or quizzes. Pick a module, open a problem, write code and submit.</p></div><div className="card" style={{ marginTop: 20 }}><b>Your program</b><p className="muted">{program.code} — {program.title}</p></div><div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', marginTop: 18 }}>{TRACKS.map(t => <button key={t.id} className="card feature" onClick={() => setTrackId(t.id)} style={{ textAlign: 'left', cursor: 'pointer' }}><span className="pill">{t.modules.length} MODULES</span><h2>{t.title}</h2><p className="muted">{t.description}</p><b>Open Compiler →</b></button>)}</div></main>;

  return <main className="container">
    <nav className="nav"><b className="brand">INTERVIEW</b><div className="navlinks"><a href="/dashboard">Dashboard</a><button className="btn secondary" onClick={() => setTrackId('')}>Change Track</button></div></nav>
    <div className="topline" style={{ marginTop: 24 }}><div><div className="eyebrow">{program.code} • ONLINE JUDGE</div><h1 className="title">{track.title}</h1><p className="muted">Competitive coding workspace</p></div></div>
    <div className="grid" style={{ gridTemplateColumns: '230px minmax(0,1fr) 220px', alignItems: 'start' }}>
      <aside className="card"><b>MODULES</b>{track.modules.map((m, i) => <button key={m.id} onClick={() => { setModuleIndex(i); setAiProblem(null); }} style={{ width: '100%', textAlign: 'left', marginTop: 8, padding: 10, border: '1px solid #d9dee7', borderRadius: 8, background: i === moduleIndex ? '#eef2ff' : '#fff', cursor: 'pointer' }}><b>{i + 1}. {m.title}</b></button>)}</aside>
      <section className="card" style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}><div><span className="pill">{problem.level}</span> <span className="pill">⏱ {problem.timeLimit}</span> <span className="pill">💾 {problem.memoryLimit}</span></div><button className="btn secondary" disabled={busy} onClick={newProblem}>✨ New Problem</button></div>
        <h2 style={{ marginTop: 12 }}>{problem.title}</h2>
        <div className="actions" style={{ marginBottom: 12 }}><button className={tab === 'problem' ? 'btn' : 'btn secondary'} onClick={() => setTab('problem')}>Problem</button><button className={tab === 'code' ? 'btn' : 'btn secondary'} onClick={() => setTab('code')}>Code</button><button className={tab === 'result' ? 'btn' : 'btn secondary'} onClick={() => setTab('result')}>Result</button></div>
        {tab === 'problem' && <div><div className="notice"><h3>Problem</h3><p style={{ whiteSpace: 'pre-wrap' }}>{problem.problem}</p></div><div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 12 }}><div className="notice"><b>Input</b><p style={{ whiteSpace: 'pre-wrap' }}>{problem.input}</p></div><div className="notice"><b>Output</b><p style={{ whiteSpace: 'pre-wrap' }}>{problem.output}</p></div></div><div className="notice" style={{ marginTop: 12 }}><b>Constraints</b><p>{problem.constraints}</p></div><div className="notice" style={{ marginTop: 12 }}><b>Sample</b><pre style={{ whiteSpace: 'pre-wrap' }}>{problem.example}</pre></div><button className="btn" style={{ marginTop: 12 }} onClick={() => setTab('code')}>Start Coding →</button></div>}
        {tab === 'code' && <div><div className="actions"><select value={language} onChange={e => changeLanguage(e.target.value)} style={{ padding: 10, border: '1px solid #ccd3dd', borderRadius: 8 }}>{LANGUAGES.map(l => <option key={l}>{l}</option>)}</select><button className="btn secondary" disabled={busy} onClick={() => runCode(true)}>🤖 Full Solution</button><button className="btn" disabled={busy} onClick={() => runCode(false)}>▶ Run & Submit</button></div><textarea value={code} onChange={e => setCode(e.target.value)} spellCheck={false} style={{ width: '100%', minHeight: 520, marginTop: 12, padding: 16, resize: 'vertical', background: '#0b1020', color: '#f8fafc', border: '1px solid #111827', borderRadius: 10, fontFamily: 'Consolas, monospace', fontSize: 14, lineHeight: 1.55 }} /><b>Custom Input</b><textarea value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="Paste input here…" style={{ width: '100%', minHeight: 90, marginTop: 7, padding: 12, border: '1px solid #ccd3dd', borderRadius: 8, fontFamily: 'monospace' }} /><p className="muted">Write a complete standard-input program. No interactive prompts. Large solutions are supported.</p>{message && <div className="toast">{message}</div>}</div>}
        {tab === 'result' && <div>{message && <div className="toast">{message}</div>}{!judge ? <div className="notice" style={{ marginTop: 12 }}><h3>No submission yet</h3><p className="muted">Open Code and press Run & Submit.</p></div> : <div className="notice" style={{ marginTop: 12 }}><h2>{judge.correct && judge.score >= 100 ? '✅ ACCEPTED' : '❌ WRONG ANSWER'}</h2><div className="pill">Score {judge.score}/100</div>{judge.output && <><h3>Output</h3><pre style={{ whiteSpace: 'pre-wrap' }}>{judge.output}</pre></>}{judge.feedback && <><h3>Feedback</h3><p style={{ whiteSpace: 'pre-wrap' }}>{judge.feedback}</p></>}{judge.explanation && <><h3>Explanation</h3><p style={{ whiteSpace: 'pre-wrap' }}>{judge.explanation}</p></>}{judge.algorithm && <><h3>Algorithm</h3><p style={{ whiteSpace: 'pre-wrap' }}>{judge.algorithm}</p></>}{judge.complexity && <><h3>Complexity</h3><p>{judge.complexity}</p></>}{showSolution && (judge.referenceCode || judge.improvedCode) && <><h3>Complete Code</h3><pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>{judge.referenceCode || judge.improvedCode}</pre></>}</div>}</div>}
        <div className="actions" style={{ marginTop: 18 }}>{problems.map((p, i) => <button key={p.id} className={!aiProblem && i === problemIndex ? 'btn' : 'btn secondary'} onClick={() => chooseProblem(i)}>{i + 1}</button>)}</div>
      </section>
      <aside className="card"><b>SUBMISSIONS</b>{history.length === 0 ? <p className="muted">No submissions yet.</p> : history.map((h, i) => <div key={`${h.time}-${i}`} style={{ padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}><small>{h.time}</small><br/><b>{h.status}</b><br/><span className="muted">{h.score}/100</span></div>)}<div className="notice" style={{ marginTop: 12 }}><b>AI Assistant</b><p className="muted">Hints, debugging, optimization and full solutions.</p><a className="btn secondary" href="/ai-coach">Ask AI →</a></div></aside>
    </div>
  </main>;
}
