'use client';
import { useEffect, useMemo, useState } from 'react';
import { COURSES } from '@/lib/courses';

type Progress = { moduleId: string; completed: boolean; examScore: number; examPassed: boolean };

export default function Learn() {
  const [department, setDepartment] = useState('CSE');
  const [progress, setProgress] = useState<Progress[]>([]);
  const [selected, setSelected] = useState(0);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const course = useMemo(() => COURSES.find(c => c.department === department) || COURSES[0], [department]);
  const module = course.modules[selected];

  useEffect(() => {
    setSelected(0); setCode(''); setMsg('');
    fetch(`/api/modules?department=${encodeURIComponent(department)}`).then(r => r.ok ? r.json() : null).then(d => setProgress(d?.progress || []));
  }, [department]);

  function status(id: string) { return progress.find(p => p.moduleId === id); }
  const completed = course.modules.filter(m => status(m.id)?.completed && status(m.id)?.examScore === 100).length;
  const percent = Math.round(completed / course.modules.length * 100);

  async function submitExam() {
    const text = code.trim();
    if (text.length < 30) { setMsg('Write at least 30 characters of practical code before submitting.'); return; }
    const lower = text.toLowerCase();
    const keywordHits = module.keywords.filter(k => lower.includes(k.replace(/[^a-z0-9]/g, '')) || lower.includes(k));
    const score = keywordHits.length >= 1 && text.length >= 80 ? 100 : 70;
    const r = await fetch('/api/modules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ department, moduleId: module.id, score, completed: score === 100 }) });
    const d = await r.json();
    if (!r.ok) { setMsg(d.error || 'Unable to save exam.'); return; }
    setProgress(p => [...p.filter(x => x.moduleId !== module.id), d]);
    setMsg(score === 100 ? 'Practical passed with 100%! Module completed ✓' : 'Practical needs improvement. Add a more complete solution and submit again.');
  }

  return <main className="container">
    <nav className="nav"><b className="brand">INTERVIEW</b><div className="navlinks"><a href="/dashboard">Dashboard</a><a className="btn secondary" href="/notes">My Notes</a><a className="btn" href="/certificates">Certificates</a></div></nav>
    <div className="topline" style={{marginTop:35}}><div><div className="eyebrow">Learning academy</div><h1 className="title">Learn by department</h1><p className="muted">Every department gets a structured course, modules, lessons and a practical coding exam.</p></div><div><label className="muted">Department</label><select value={department} onChange={e=>setDepartment(e.target.value)} style={{display:'block',padding:12,border:'1px solid #ccd3dd',borderRadius:10,marginTop:6}}>{COURSES.map(c=><option key={c.department} value={c.department}>{c.department} — {c.title}</option>)}</select></div></div>
    <div className="card" style={{marginBottom:18}}><b>{course.title}</b><p className="muted">{course.description}</p><div style={{display:'flex',justifyContent:'space-between'}}><span>Course completion</span><b>{percent}%</b></div><div className="progress"><span style={{width:`${percent}%`}}/></div>{percent===100&&<div className="notice" style={{marginTop:12}}>🎓 All modules are complete with 100% practical scores. <a href="/certificates"><b>Generate your certificate →</b></a></div>}</div>
    <div className="grid" style={{gridTemplateColumns:'minmax(220px, .8fr) minmax(0, 1.7fr)'}}>
      <div className="card"><h2>Modules</h2>{course.modules.map((m,i)=>{const p=status(m.id);return <button key={m.id} onClick={()=>{setSelected(i);setCode('');setMsg('')}} style={{display:'block',width:'100%',textAlign:'left',padding:14,marginTop:8,border:'1px solid #d9dee7',borderRadius:10,background:i===selected?'#f2f5f9':'white',cursor:'pointer'}}><b>{i+1}. {m.title}</b><br/><span className="muted">{p?.completed?'✓ Complete':p?.examPassed?`Exam ${p.examScore}%`:'Not completed'}</span></button>})}</div>
      <div className="card"><span className="pill">MODULE {selected+1}</span><h2>{module.title}</h2><h3>Lesson</h3><p className="muted">{module.lesson}</p><div className="notice"><b>Practical coding exam</b><p>{module.practical}</p><p className="muted">Write your solution below. Submit a complete program to earn 100% and unlock the module.</p></div><textarea value={code} onChange={e=>setCode(e.target.value)} placeholder="Write your code here…" style={{width:'100%',minHeight:230,padding:15,border:'1px solid #ccd3dd',borderRadius:12,fontFamily:'monospace'}}/><div className="actions" style={{marginTop:12}}><button className="btn" onClick={submitExam}>Submit Practical Exam</button>{status(module.id)&&<span className="pill">Best: {status(module.id)?.examScore}%</span>}</div>{msg&&<div className="toast">{msg}</div>}</div>
    </div>
  </main>;
}
