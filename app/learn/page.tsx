'use client';

import { useEffect, useMemo, useState } from 'react';
import { ENGINEERING_PROGRAMS } from '@/lib/engineering-catalog';
import { getLearningProblems, LearningProblem } from '@/lib/learning-problems';

type Progress = { moduleId: string; completed: boolean; examScore: number; examPassed: boolean };
type Judge = { correct: boolean; score: number; output?: string; feedback?: string; improvedCode?: string; explanation?: string; algorithm?: string; complexity?: string; referenceCode?: string };

const LANGUAGES = ['Python', 'JavaScript', 'Java', 'C++', 'C'];
const TRACKS = Array.from(new Map(ENGINEERING_PROGRAMS.flatMap(p => p.tracks.map(t => [t.id, t]))).values());

function badge(level: LearningProblem['level']) {
  return level === 'Easy' ? '🟢 EASY' : level === 'Medium' ? '🟡 MEDIUM' : '🔴 HARD';
}

export default function Learn() {
  const [department, setDepartment] = useState('CSE');
  const [trackId, setTrackId] = useState('');
  const [started, setStarted] = useState(false);
  const [selectedModule, setSelectedModule] = useState(0);
  const [problemIndex, setProblemIndex] = useState(0);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [language, setLanguage] = useState('Python');
  const [code, setCode] = useState('');
  const [judge, setJudge] = useState<Judge | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [tab, setTab] = useState<'problem' | 'editor' | 'submissions'>('problem');
  const [submissions, setSubmissions] = useState<{time: string; problem: string; result: string; score: number}[]>([]);

  const program = useMemo(() => ENGINEERING_PROGRAMS.find(p => p.code === department) || ENGINEERING_PROGRAMS[0], [department]);
  const track = useMemo(() => TRACKS.find(t => t.id === trackId) || TRACKS[0], [trackId]);
  const module = track.modules[selectedModule] || track.modules[0];
  const problems = useMemo(() => getLearningProblems(module.title), [module.title]);
  const problem = problems[problemIndex] || problems[0];

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user?.department) setDepartment(d.user.department);
    });
  }, []);

  useEffect(() => {
    fetch(`/api/modules?department=${encodeURIComponent(department)}`).then(r => r.ok ? r.json() : null).then(d => setProgress(d?.progress || []));
  }, [department]);

  useEffect(() => {
    setSelectedModule(0); setProblemIndex(0); setCode(''); setJudge(null); setMessage(''); setShowSolution(false); setTab('problem');
  }, [track.id]);

  useEffect(() => {
    setCode(''); setJudge(null); setMessage(''); setShowSolution(false); setTab('problem');
  }, [selectedModule, problemIndex]);

  function status(id: string) { return progress.find(p => p.moduleId === id); }
  const completed = track.modules.filter(m => status(m.id)?.completed && status(m.id)?.examScore === 100).length;
  const percent = Math.round(completed / track.modules.length * 100);

  function chooseTrack(id: string) { setTrackId(id); setStarted(true); }
  function chooseProblem(i: number) { setProblemIndex(i); setTab('problem'); }

  async function submitCode(solutionMode = false) {
    if (!solutionMode && code.trim().length < 10) { setMessage('Write your complete solution before submitting.'); setTab('editor'); return; }
    setLoading(true); setJudge(null); setShowSolution(solutionMode); setMessage(solutionMode ? 'AI is preparing the full explanation and reference solution…' : 'Running CodeChef-style evaluation: correctness, edge cases and complexity…');
    try {
      const r = await fetch('/api/ai/code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ course: track.title, module: module.title, language, code: code.trim() || 'Generate a complete reference solution.', task: `${problem.title}\n${problem.problem}\nInput: ${problem.input}\nOutput: ${problem.output}\nConstraints: ${problem.constraints}\nExample: ${problem.example}`, solutionMode }) });
      const d = await r.json();
      if (!r.ok) { setMessage(d.error || 'Evaluation failed.'); return; }
      setJudge(d);
      if (!solutionMode) {
        const result = d.correct && d.score >= 100 ? 'ACCEPTED' : 'WRONG ANSWER';
        setSubmissions(s => [{ time: new Date().toLocaleTimeString(), problem: problem.title, result, score: d.score || 0 }, ...s].slice(0, 20));
        if (result === 'ACCEPTED') {
          const save = await fetch('/api/modules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ department, moduleId: module.id, score: 100, completed: true }) });
          const saved = await save.json();
          if (save.ok) setProgress(p => [...p.filter(x => x.moduleId !== module.id), saved]);
          setMessage('✓ ACCEPTED — module practical passed with 100%.');
        } else setMessage('✗ NOT ACCEPTED — use the AI feedback, fix your code and submit again.');
      } else setMessage('✓ Full explanation and reference solution ready.');
    } catch { setMessage('Unable to reach the coding evaluator.'); }
    finally { setLoading(false); }
  }

  async function newAIProblem() {
    setLoading(true); setMessage(`Generating a fresh ${module.title} competitive-programming problem…`);
    try {
      const r = await fetch('/api/ai/coding-question', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ course: track.title, module: module.title, language }) });
      const d = await r.json();
      if (r.ok) {
        const generated: LearningProblem = { id: `ai-${Date.now()}`, title: d.title || 'AI Challenge', level: d.level || 'Medium', problem: d.problem || d.question || 'Solve the generated challenge.', input: d.input || 'Standard input.', output: d.output || 'Standard output.', constraints: d.constraints || 'Follow the stated constraints.', example: d.example || 'See the statement.', timeLimit: d.timeLimit || '2 seconds', memoryLimit: d.memoryLimit || '256 MB' };
        setProblemIndex(0); setCode(''); setJudge(null); setMessage('✓ Fresh challenge generated.');
        setAIProblem(generated);
      } else setMessage(d.error || 'Could not generate a new problem.');
    } catch { setMessage('Could not generate a new problem.'); }
    finally { setLoading(false); }
  }

  const [aiProblem, setAIProblem] = useState<LearningProblem | null>(null);
  const active = aiProblem || problem;

  function nextProblem() {
    if (aiProblem) { setAIProblem(null); setProblemIndex(0); }
    else setProblemIndex(i => (i + 1) % problems.length);
    setCode(''); setJudge(null); setMessage(''); setTab('problem');
  }

  if (!started) return (
    <main className="container">
      <nav className="nav"><b className="brand">INTERVIEW</b><div className="navlinks"><a href="/dashboard">Dashboard</a><a className="btn secondary" href="/ai-coach">🤖 AI Answers</a><a className="btn secondary" href="/notes">My Notes</a></div></nav>
      <div className="topline" style={{ marginTop: 35 }}><div><div className="eyebrow">CODE PRACTICE • COMPETITIVE LEARNING</div><h1 className="title">CodeChef-style Learning Arena</h1><p className="muted">Choose a domain, open a module and solve full competitive-programming problems with an online-judge style workflow.</p></div></div>
      <div className="card" style={{ marginTop: 18 }}><b>🎯 Your program</b><p className="muted">{program.code} — {program.title}</p><div className="pill">{program.tracks.length} learning tracks</div></div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', marginTop: 18 }}>
        {TRACKS.map(t => <button key={t.id} onClick={() => chooseTrack(t.id)} className="card feature" style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid #d9dee7' }}><span className="pill">TRACK</span><h2>{t.title}</h2><p className="muted">{t.description}</p><p className="muted"><b>{t.modules.length}</b> modules • competitive problems • AI coding</p><span className="btn" style={{ display: 'inline-block', marginTop: 12 }}>Enter Arena →</span></button>)}
      </div>
    </main>
  );

  return (
    <main className="container">
      <nav className="nav"><b className="brand">INTERVIEW</b><div className="navlinks"><a href="/dashboard">Dashboard</a><a className="btn secondary" href="/ai-coach">🤖 AI Answers</a><button className="btn secondary" onClick={() => setStarted(false)}>All tracks</button></div></nav>
      <div className="topline" style={{ marginTop: 28 }}><div><div className="eyebrow">{program.code} • COMPETITIVE PROGRAMMING</div><h1 className="title">{track.title}</h1><p className="muted">Learn the concept → solve a full problem → code → run AI judge → review → submit again.</p></div></div>

      <div className="card" style={{ marginBottom: 16 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><b>Track progress</b><b>{percent}%</b></div><div className="progress"><span style={{ width: `${percent}%` }} /></div><p className="muted" style={{ marginTop: 8 }}>{completed}/{track.modules.length} modules accepted.</p></div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(240px,.7fr) minmax(0,2fr)' }}>
        <aside className="card"><h2>Modules</h2>{track.modules.map((m, i) => { const s = status(m.id); return <button key={m.id} onClick={() => { setSelectedModule(i); setAIProblem(null); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: 12, marginTop: 8, border: '1px solid #d9dee7', borderRadius: 10, background: i === selectedModule ? '#f2f5f9' : 'white', cursor: 'pointer' }}><b>{i + 1}. {m.title}</b><br/><span className="muted">{s?.completed ? '✓ ACCEPTED' : '○ Not completed'} • 20 problems</span></button> })}</aside>

        <section className="card">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}><span className="pill">PROBLEM {problemIndex + 1} / {problems.length}</span><span className="pill">{badge(active.level)}</span><span className="pill">⏱ {active.timeLimit}</span><span className="pill">💾 {active.memoryLimit}</span></div>
          <h2 style={{ marginTop: 12 }}>{active.title}</h2>
          <p className="muted">Module: {module.title}</p>

          <div className="actions" style={{ marginBottom: 12 }}><button className={tab === 'problem' ? 'btn' : 'btn secondary'} onClick={() => setTab('problem')}>📖 Problem</button><button className={tab === 'editor' ? 'btn' : 'btn secondary'} onClick={() => setTab('editor')}>💻 Code</button><button className={tab === 'submissions' ? 'btn' : 'btn secondary'} onClick={() => setTab('submissions')}>📊 Submissions</button></div>

          {tab === 'problem' && <div>
            <div className="notice"><b>Problem Statement</b><p style={{ whiteSpace: 'pre-wrap' }}>{active.problem}</p></div>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 12 }}><div className="notice"><b>Input Format</b><p style={{ whiteSpace: 'pre-wrap' }}>{active.input}</p></div><div className="notice"><b>Output Format</b><p style={{ whiteSpace: 'pre-wrap' }}>{active.output}</p></div></div>
            <div className="notice" style={{ marginTop: 12 }}><b>Constraints</b><p>{active.constraints}</p></div>
            <div className="notice" style={{ marginTop: 12 }}><b>Sample</b><pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>{active.example}</pre></div>
            <div className="notice" style={{ marginTop: 12 }}><b>💡 How to learn</b><p className="muted">First design your algorithm. Then write the complete program. Use AI hints before asking for the full solution. Your submission should read standard input and print only the required output.</p></div>
          </div>}

          {tab === 'editor' && <div>
            <div className="actions"><select value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: 11, border: '1px solid #ccd3dd', borderRadius: 9 }}>{LANGUAGES.map(x => <option key={x}>{x}</option>)}</select><button className="btn secondary" disabled={loading} onClick={() => submitCode(true)}>🤖 Explain & Full Solution</button><button className="btn secondary" disabled={loading} onClick={newAIProblem}>✨ New Problem</button><button className="btn" disabled={loading} onClick={() => submitCode(false)}>▶ Run & Submit</button></div>
            <textarea value={code} onChange={e => setCode(e.target.value)} spellCheck={false} placeholder={`Write your complete ${language} program here…\n\nExample structure:\n1. Read input\n2. Solve all test cases\n3. Print exact output`} style={{ width: '100%', minHeight: 430, padding: 16, border: '1px solid #1f2937', borderRadius: 12, marginTop: 12, fontFamily: 'monospace', fontSize: 14, background: '#0b1020', color: '#f8fafc' }} />
            <p className="muted">CodeChef-style rule: no interactive prompts in submitted code. Handle the full constraints and all test cases.</p>
            {message && <div className="toast">{message}</div>}
            {judge && <div className="notice" style={{ marginTop: 14 }}><h3>{judge.correct && judge.score >= 100 ? '✅ ACCEPTED' : '❌ WRONG ANSWER / NEEDS FIXES'} — {judge.score ?? 0}/100</h3><p style={{ whiteSpace: 'pre-wrap' }}>{judge.feedback || judge.explanation || 'Review the evaluator result.'}</p>{judge.algorithm && <><b>Algorithm</b><p style={{ whiteSpace: 'pre-wrap' }}>{judge.algorithm}</p></>}{judge.complexity && <><b>Complexity</b><p>{judge.complexity}</p></>}{showSolution && (judge.referenceCode || judge.improvedCode) && <><b>Reference solution</b><pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>{judge.referenceCode || judge.improvedCode}</pre></>}</div>}
          </div>}

          {tab === 'submissions' && <div className="notice"><h3>Submission History</h3>{submissions.length === 0 ? <p className="muted">No submissions in this session yet.</p> : submissions.map((s, i) => <div key={`${s.time}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: 12, borderBottom: '1px solid #e5e7eb' }}><span>{s.time}</span><span>{s.problem}</span><b>{s.result}</b><span>{s.score}/100</span></div>)}</div>}

          <div className="actions" style={{ marginTop: 16 }}><button className="btn secondary" onClick={() => chooseProblem(Math.max(0, problemIndex - 1))}>← Previous</button><button className="btn" onClick={() => { setTab('editor'); setMessage('Write your solution and submit when ready.'); }}>Start Coding →</button><button className="btn secondary" onClick={nextProblem}>Next Problem →</button></div>
          {message && tab !== 'editor' && <div className="toast" style={{ marginTop: 12 }}>{message}</div>}
        </section>
      </div>
    </main>
  );
}
