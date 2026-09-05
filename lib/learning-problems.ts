export type LearningProblem = {
  id: string;
  title: string;
  level: 'Easy' | 'Medium' | 'Hard';
  problem: string;
  input: string;
  output: string;
  constraints: string;
  example: string;
};

/**
 * Generates a reusable set of practical coding problems for every roadmap module.
 * The module name is deliberately included in each challenge so the same library
 * works across programming, engineering, science and management-oriented tracks.
 */
export function getLearningProblems(moduleTitle: string): LearningProblem[] {
  const m = moduleTitle.trim();
  const base = [
    ['01', `Concept Starter: ${m}`, 'Easy', `Write a small program that accepts the required values for ${m}, applies the main concept taught in this module, and prints a clear result. Focus on correct input handling and readable logic.`, 'Read the values required by the problem from standard input.', 'Print the calculated or processed result.', 'Use valid input values and keep the solution simple.', 'Input: 10 20\nOutput: 30'],
    ['02', `Validation Challenge: ${m}`, 'Easy', `Build a validator for a realistic ${m} scenario. Reject invalid input and accept valid input according to the rules you define from the module lesson.`, 'A value or record representing the scenario.', 'Print VALID for accepted input or INVALID otherwise.', 'Handle empty, zero, negative and boundary values where applicable.', 'Input: 25\nOutput: VALID'],
    ['03', `Data Processing with ${m}`, 'Easy', `Given a collection of measurements or values related to ${m}, calculate a useful summary such as total, average, minimum and maximum.`, 'n followed by n numeric values.', 'Print the requested summary values.', '1 <= n <= 100000.', 'Input: 5\n2 4 6 8 10\nOutput: 6 2 10'],
    ['04', `Search and Detect — ${m}`, 'Medium', `Search a dataset for a requested value or condition related to ${m}. Return the first matching position, or -1 when no match exists.`, 'n values followed by a target value.', 'Print the first zero-based index of the target, or -1.', 'Use an efficient search appropriate to the data assumptions.', 'Input: 5\n4 9 2 7 9\n9\nOutput: 1'],
    ['05', `Frequency Analysis — ${m}`, 'Medium', `Count how often each important value, state or category occurs in a ${m} dataset and report the most frequent one.`, 'n followed by n values or categories.', 'Print the most frequent value and its frequency.', 'Define a deterministic tie rule such as choosing the smallest value.', 'Input: 6\n2 3 2 4 2 3\nOutput: 2 3'],
    ['06', `Transformation Pipeline — ${m}`, 'Medium', `Create a two-step processing pipeline for ${m}: clean or normalize the input first, then transform it into the required output.`, 'A sequence or record to process.', 'Print the transformed result.', 'Preserve required information and handle malformed input safely.', 'Input:  a-b-c\nOutput: ABC'],
    ['07', `Edge Cases in ${m}`, 'Medium', `Solve a ${m} problem while explicitly handling the smallest input, largest input, duplicate values, missing values and other boundary cases relevant to the lesson.`, 'Input containing normal and boundary cases.', 'Print a correct result for every case.', 'Do not assume that the first sample represents every possible input.', 'Input: 1\n5\nOutput: 5'],
    ['08', `Real-World Simulation: ${m}`, 'Medium', `Simulate a simple real-world process that uses ${m}. Process events in order and report the final state after all events have been handled.`, 'n events followed by event data.', 'Print the final state.', 'Process events in their given order; n <= 10000.', 'Input: 3\nADD 5\nADD 2\nREMOVE 5\nOutput: 2'],
    ['09', `Interview Debugging — ${m}`, 'Hard', `A developer has written a solution for ${m} but it gives wrong results on boundary inputs. Reimplement the logic correctly and explain the likely failure point.`, 'Problem-specific test data.', 'Print the corrected result.', 'Consider types, off-by-one errors, invalid assumptions and empty input.', 'Input: 3\n1 1 2\nOutput: 2'],
    ['10', `Optimization Challenge: ${m}`, 'Hard', `Implement a scalable solution for a ${m} dataset. First think of a straightforward approach, then improve its time or space complexity without changing the result.`, 'n followed by a large dataset.', 'Print the required answer efficiently.', 'Target O(n log n) or better when the problem structure permits.', 'Input: 5\n10 3 7 3 8\nOutput: 3'],
    ['11', `Mini Project Problem: ${m}`, 'Hard', `Design a small command-line utility around ${m}. It should accept multiple records, process them, validate errors, and produce a useful report that a real student or engineer could use.`, 'n records followed by record fields.', 'Print a concise report with totals and important findings.', 'Use clear functions, meaningful names and robust input handling.', 'Input: 2\nA 10\nB 20\nOutput: TOTAL 30'],
    ['12', `Interview Master Challenge: ${m}`, 'Hard', `Explain your approach and implement an interview-style solution based on ${m}. Your solution must include correct logic, edge-case handling and an efficient complexity.`, 'Use the input format specified by the interviewer.', 'Print the required answer with no extra prompts.', 'State assumptions and analyze time and space complexity before coding.', 'Input: 4\n1 2 3 4\nOutput: 10'],
  ] as const;

  return base.map(([id, title, level, problem, input, output, constraints, example]) => ({
    id: `${m.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${id}`,
    title,
    level,
    problem,
    input,
    output,
    constraints,
    example,
  }));
}
