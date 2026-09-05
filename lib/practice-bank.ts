export type PracticeQuestion = { id: string; category: 'aptitude' | 'technical' | 'coding' | 'round1'; topic: string; question: string; options: string[]; answer: number; explanation: string };

const APTITUDE_TOPICS = ['Percentages','Profit & Loss','Ratio & Proportion','Averages','Time & Work','Time Speed Distance','Simple & Compound Interest','Probability','Permutation & Combination','Number System','LCM & HCF','Algebra','Geometry','Mensuration','Data Interpretation','Clocks & Calendars','Pipes & Cisterns','Mixtures & Alligation','Age Problems','Logical Reasoning','Series','Coding-Decoding','Blood Relations','Syllogisms','Puzzles'];
const TECHNICAL_TOPICS = ['Programming Fundamentals','OOP','Data Structures','Algorithms','DBMS','SQL','Operating Systems','Computer Networks','Computer Architecture','Software Engineering','Git','Web Development','APIs','Cloud Computing','DevOps','Cyber Security','AI Fundamentals','Machine Learning','Data Science','Computer Organization','Distributed Systems','Testing','System Design','Linux','IoT'];
const CODING_TOPICS = ['Variables','Conditions','Loops','Functions','Arrays','Strings','Hashing','Linked Lists','Stacks','Queues','Trees','Binary Search','Sorting','Graphs','Greedy Algorithms','Dynamic Programming','Recursion','Backtracking','Two Pointers','Sliding Window','Bit Manipulation','SQL','OOP','Python','Java'];
const ROUND1_TOPICS = ['Self Introduction','Communication','Problem Solving','Teamwork','Leadership','Time Management','Conflict Resolution','Project Experience','Learning Ability','Adaptability','Failure Handling','Career Goals','Strengths','Weaknesses','Work Ethics','Decision Making','Ownership','Customer Focus','Technical Curiosity','Debugging Approach','Internship Experience','Academic Projects','Pressure Handling','Prioritization','Professional Behaviour'];

function makeOptions(correct: string, a: string, b: string, c: string) { return [correct, a, b, c]; }

export const PRACTICE_BANK: PracticeQuestion[] = [];

APTITUDE_TOPICS.forEach((topic, ti) => {
  for (let v = 1; v <= 10; v++) {
    const n = ti * 10 + v;
    const correct = `${(n * 7) % 91 + 10}`;
    PRACTICE_BANK.push({ id:`apt-${n}`, category:'aptitude', topic, question:`${topic}: In a placement-style problem set, a candidate completes problem ${v} in a sequence of ${ti + 2} stages. If the normalized score is ${correct}, which value represents the final score?`, options:makeOptions(correct,`${Number(correct)+5}`,`${Math.max(1,Number(correct)-5)}`,`${Number(correct)+10}`), answer:0, explanation:`This practice item targets the ${topic} skill. Work through the stated quantities carefully and verify the result before submitting.` });
  }
});

TECHNICAL_TOPICS.forEach((topic, ti) => {
  for (let v = 1; v <= 10; v++) {
    const n = ti * 10 + v;
    const correct = `Apply ${topic} concepts to the problem`; 
    PRACTICE_BANK.push({ id:`tech-${n}`, category:'technical', topic, question:`Which approach is most appropriate when solving a real engineering task involving ${topic}, scenario ${v}?`, options:makeOptions(correct,'Ignore requirements and guess','Skip testing and deploy immediately','Use unrelated tools without validation'), answer:0, explanation:`The best engineering approach is to understand the ${topic} requirements, apply the relevant concept, validate the result and review edge cases.` });
  }
});

CODING_TOPICS.forEach((topic, ti) => {
  for (let v = 1; v <= 10; v++) {
    const n = ti * 10 + v;
    const correct = `Design the solution around ${topic}`;
    PRACTICE_BANK.push({ id:`code-${n}`, category:'coding', topic, question:`Coding Challenge ${n}: You are asked to solve a practical problem centered on ${topic}. What should you do first?`, options:makeOptions(correct,'Copy a solution without understanding it','Skip constraints and start coding randomly','Return a hard-coded output'), answer:0, explanation:`Start by understanding the ${topic} requirements, constraints, input/output and edge cases. Then choose an algorithm and implement it.` });
  }
});

ROUND1_TOPICS.forEach((topic, ti) => {
  for (let v = 1; v <= 10; v++) {
    const n = ti * 10 + v;
    const correct = `Give a specific example and explain your reasoning`;
    PRACTICE_BANK.push({ id:`r1-${n}`, category:'round1', topic, question:`Round 1 interview question ${n}: A recruiter asks about ${topic}. What is the strongest response strategy?`, options:makeOptions(correct,'Give only a one-word answer','Blame someone else without evidence','Avoid answering the question'), answer:0, explanation:`For ${topic}, give a concise real example, explain your actions and reasoning, and finish with the result or lesson learned.` });
  }
});

export const PRACTICE_QUESTION_COUNT = PRACTICE_BANK.length;
export function getPracticeQuestions(category: PracticeQuestion['category'], topic?: string) {
  const filtered = PRACTICE_BANK.filter(q => q.category === category && (!topic || q.topic === topic));
  return filtered.length ? filtered : PRACTICE_BANK.filter(q => q.category === category);
}
