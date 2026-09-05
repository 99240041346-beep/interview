import { ENGINEERING_PROGRAMS } from './engineering-catalog';
import type { InterviewBankQuestion } from './interview-bank';

// Large original question generator tied directly to every engineering roadmap module.
// The prompts are original and are informed by public interview-prep patterns; no third-party question text is copied.
const levels: InterviewBankQuestion['difficulty'][] = ['Easy', 'Easy', 'Medium', 'Medium', 'Hard'];
const technicalFrames = [
  'Which statement best explains the core idea of {topic} in an engineering system?',
  'What is the most important first step when applying {topic} to a real project?',
  'Which trade-off should an engineer evaluate when choosing an approach for {topic}?',
  'Which failure mode is most important to test when implementing {topic}?',
  'Which design decision would usually improve reliability when working with {topic}?',
  'Which metric or observation is most useful when validating {topic}?',
  'Which situation is a strong practical use case for {topic}?',
  'What would you check first when a solution involving {topic} gives an unexpected result?',
  'Which statement distinguishes a robust implementation of {topic} from a superficial one?',
  'Which constraint can change the best engineering approach to {topic}?',
  'How should an engineer explain the value of {topic} during a technical interview?',
  'Which test case is especially useful for validating {topic}?',
  'Which optimization is most defensible for a production implementation of {topic}?',
  'Which dependency or assumption should be documented when using {topic}?',
  'Which outcome indicates that {topic} has been implemented correctly?'
];
const codingFrames = [
  'Build a program that applies {topic} to a practical engineering data-processing task.',
  'Given a stream of input records, use {topic} to compute the required result efficiently.',
  'Design an implementation using {topic} that handles empty, minimum and maximum inputs.',
  'Solve a placement-style problem using {topic}; explain why your chosen approach is efficient.',
  'Create a reusable function centered on {topic} and include validation for invalid input.',
  'Implement a solution using {topic} and compare it with a straightforward brute-force approach.',
  'Solve a problem where the input size is large enough that an inefficient {topic} approach will time out.',
  'Write a program using {topic} for a realistic engineering scenario and state time and space complexity.',
  'Create an interview coding problem around {topic} with at least two edge cases and explain your test plan.',
  'Implement a {topic} solution that remains correct when duplicate values, missing values or boundary values occur.',
  'Build a small algorithmic component using {topic}; provide pseudocode before writing the final code.',
  'Solve a medium-difficulty interview problem where {topic} is the key technique.',
  'Solve a hard variant of a {topic} problem and explain the optimization that makes it practical.',
  'Debug a deliberately flawed {topic} solution, identify the bug, and provide the corrected algorithm.',
  'Design a coding challenge based on {topic} that could appear in a technical placement assessment.'
];
const roundFrames = [
  'Explain {topic} to an interviewer using a simple example and then a practical engineering example.',
  'You are asked about {topic} in Round 1. Explain what you know, how you learned it, and where you would apply it.',
  'An interviewer gives you a problem related to {topic}. Talk through your reasoning before proposing a solution.',
  'Describe a project or academic task where {topic} could be useful and defend your technical choices.',
  'The interviewer challenges one of your assumptions about {topic}. How would you respond professionally?',
  'Compare two possible approaches to {topic} and explain which one you would choose under a realistic constraint.',
  'You made a mistake while working with {topic}. Explain how you would detect, communicate and fix it.',
  'Give a concise two-minute explanation of {topic} for a non-specialist interviewer.',
  'What follow-up question would you expect after discussing {topic}, and how would you prepare for it?',
  'Explain the most common beginner mistake in {topic} and how you would avoid it.',
  'Describe how you would test your understanding of {topic} before an interview.',
  'Give an example of a trade-off involving {topic} and explain why there is no universal answer.',
  'The interviewer asks you to connect {topic} to a real product. Give a structured answer.',
  'Explain how you would learn an unfamiliar aspect of {topic} quickly before joining a project.',
  'Close a Round 1 discussion about {topic} with the key takeaway an interviewer should remember.'
];
const aptitudeFrames = [
  'A project has {n} units of {topic}-related work. If {r}% is completed, how many units remain?',
  'An engineering team spends {n} hours on a {topic} task and reduces the time by {r}%. What is the new time?',
  'A process related to {topic} handles {n} items per hour. How many items can it handle in {r} hours?',
  'A {topic} measurement changes from {n} to {m}. What is the percentage change?',
  'A test set for {topic} contains {n} cases, of which {r} fail. What percentage pass?',
  'Two {topic} tasks take {n} and {m} minutes. What is their combined time in hours?',
  'A resource budget for {topic} is {n} units and {r}% is reserved. How many units remain available?',
  'A system processes {n} {topic} records in {r} minutes. At the same rate, how many records are processed in {m} minutes?',
  'A {topic} experiment has {n} samples split in the ratio {r}:{m}. What is the size of the first group?',
  'A {topic} pipeline improves throughput from {n} to {m} items per second. What is the absolute increase?',
  'A team completes {r} of {n} planned {topic} tasks. What fraction of the plan is still incomplete?',
  'A {topic} test has {n} questions and a learner answers {r} correctly. What is the accuracy percentage?',
  'A batch contains {n} {topic} measurements. Removing {r} outliers leaves how many measurements?',
  'A {topic} process runs for {n} minutes each day for {r} days. What is the total runtime in hours?',
  'A project allocates {r}% of a {n}-unit budget to {topic}. How many units are allocated?'
];

const generated: InterviewBankQuestion[] = [];
let sequence = 1;
const uniqueModules = new Map<string, { id: string; title: string }>();
for (const program of ENGINEERING_PROGRAMS) {
  for (const track of program.tracks) {
    for (const module of track.modules) uniqueModules.set(module.id, module);
  }
}

for (const module of uniqueModules.values()) {
  for (let v = 1; v <= 15; v++) {
    const level = levels[(v - 1) % levels.length];
    const n = 20 + v * 3;
    const m = n + 10 + (v % 7);
    const r = 10 + (v % 8) * 5;
    const topic = module.title;
    const technical = technicalFrames[v - 1].replaceAll('{topic}', topic);
    const techOptions = [
      `Apply ${topic} according to its constraints, test assumptions, and measure the result`,
      `Ignore constraints and optimize only the shortest implementation`,
      `Skip validation because the first sample is sufficient`,
      `Replace the concept with an unrelated technique`
    ];
    generated.push({ id: `sub-tech-${sequence++}`, type: 'technical', topic, difficulty: level, question: `${technical} Variant ${v}`, options: techOptions, answer: techOptions[0], explanation: `A strong answer connects ${topic} to purpose, constraints, validation and practical engineering trade-offs.` });

    const coding = codingFrames[v - 1].replaceAll('{topic}', topic);
    generated.push({ id: `sub-code-${sequence++}`, type: 'coding', topic, difficulty: level, question: `Coding Challenge: ${topic} — Variant ${v}`, prompt: `${coding} Input scale: approximately ${n}–${m} records. Include examples, edge cases, and time/space complexity.`, expectedConcept: `The solution must demonstrate the ${topic} concept rather than only producing a hard-coded result.` });

    const round = roundFrames[v - 1].replaceAll('{topic}', topic);
    generated.push({ id: `sub-round-${sequence++}`, type: 'round1', topic, difficulty: level, question: `${round} Variant ${v}`, explanation: 'Use a structured answer: context, reasoning, concrete example, trade-off, result, and what you would improve.' });

    const aptitude = aptitudeFrames[v - 1].replaceAll('{topic}', topic).replaceAll('{n}', String(n)).replaceAll('{m}', String(m)).replaceAll('{r}', String(r));
    let answer = '';
    if (v === 1) answer = String(Math.round(n * (100 - r) / 100));
    else if (v === 2) answer = String(Math.round(n * (100 - r) / 100));
    else if (v === 3) answer = String(n * r);
    else if (v === 4) answer = `${Math.round(((m - n) / n) * 100)}%`;
    else if (v === 5) answer = `${Math.round(((n - r) / n) * 100)}%`;
    else if (v === 6) answer = `${(n + m) / 60} hours`;
    else if (v === 7) answer = String(Math.round(n * (100 - r) / 100));
    else if (v === 8) answer = String(Math.round((n / r) * m));
    else if (v === 9) answer = String(Math.round((n * r) / (r + m)));
    else if (v === 10) answer = String(m - n);
    else if (v === 11) answer = `${Math.round((n - r) / n * 100)}%`;
    else if (v === 12) answer = `${Math.round(r / n * 100)}%`;
    else if (v === 13) answer = String(n - r);
    else if (v === 14) answer = `${(n * r) / 60} hours`;
    else answer = String(Math.round(n * r / 100));
    const distractors = [String(n), String(m), String(r)];
    const options = Array.from(new Set([answer, ...distractors])).slice(0, 4);
    generated.push({ id: `sub-apt-${sequence++}`, type: 'aptitude', topic, difficulty: level, question: `${aptitude} Variant ${v}`, options, answer, explanation: `Use the appropriate percentage, rate, ratio or arithmetic relationship and verify the units.` });
  }
}

export const SUBTOPIC_INTERVIEW_BANK = generated;
export const SUBTOPIC_INTERVIEW_BANK_COUNT = generated.length;

export function getSubtopicQuestions(type: string, topic?: string) {
  return SUBTOPIC_INTERVIEW_BANK.filter(q => q.type === type && (!topic || q.topic === topic));
}
