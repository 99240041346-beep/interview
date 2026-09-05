export type LearningExample = {
  title: string;
  problem: string;
  input: string;
  output: string;
  example: string;
};

const clean = (module: string) => module.replace(/\s+/g, ' ').trim();

/**
 * Five reusable practice problems are generated for every module. The module
 * name is included so the examples remain relevant across the full engineering
 * learning catalogue without requiring thousands of duplicated records.
 */
export function getLearningExamples(module: string): LearningExample[] {
  const m = clean(module);
  return [
    {
      title: `${m}: Basic Implementation`,
      problem: `Build a small program that demonstrates the core idea of ${m}. Read the required input, apply the concept correctly, and print a clear result.`,
      input: 'A problem-specific input described by the task.',
      output: 'The result after applying the concept.',
      example: 'Input: 10\nOutput: Processed result',
    },
    {
      title: `${m}: Edge Case Challenge`,
      problem: `Solve a practical ${m} problem and make the solution handle empty input, minimum values, maximum values, duplicates, or other important boundary cases.`,
      input: 'A valid input including possible boundary cases.',
      output: 'Correct output for every valid case.',
      example: 'Input: boundary-case data\nOutput: correct boundary result',
    },
    {
      title: `${m}: Real-World Scenario`,
      problem: `Design a small real-world application using ${m}. Explain why the approach is appropriate and implement the main processing logic.`,
      input: 'Sample records or values from the scenario.',
      output: 'The processed result or decision.',
      example: 'Input: sample records\nOutput: expected decision/result',
    },
    {
      title: `${m}: Interview Problem`,
      problem: `You are asked about ${m} in a technical interview. Write a working solution, explain the algorithm, and state its time and space complexity.`,
      input: 'Interview-style test data.',
      output: 'The expected answer for the test data.',
      example: 'Input: 1 2 3 4\nOutput: 10',
    },
    {
      title: `${m}: Optimization Challenge`,
      problem: `Create a correct first solution for ${m}, then improve it by reducing unnecessary work. Compare the two approaches and use the more efficient implementation.`,
      input: 'A larger test case designed to expose inefficient solutions.',
      output: 'The same correct result using the optimized approach.',
      example: 'Input: large test case\nOutput: optimized result',
    },
  ];
}
