import type { ProblemContext } from './leetcodeExtractor';

export class PromptBuilder {
  static buildSystemPrompt(context: ProblemContext | null): string {
    let prompt = `You are LeetLens, an expert AI coding mentor integrated directly into LeetCode.
Your goal is to help the user learn and solve algorithmic problems.
Do NOT just give them the final code unless explicitly requested. Guide them to the solution.

`;

    if (context) {
      prompt += `--- CURRENT PROBLEM CONTEXT ---
Title: ${context.title}
Difficulty: ${context.difficulty}
Language: ${context.language}

Description:
${context.description}

Constraints:
${context.constraints.join('\n')}

--- USER'S CURRENT CODE ---
\`\`\`${context.language}
${context.code}
\`\`\`
`;
    }

    prompt += `
--- INSTRUCTIONS ---
1. Be concise, direct, and developer-focused. No fluff.
2. Use markdown for all code blocks, specifying the language.
3. If they ask for a hint, give them a subtle nudge in the right direction, not the full algorithm (unless requested).
`;

    return prompt;
  }

  static buildHintPrompt(level: number): string {
    switch(level) {
      case 1: return "Give me a very subtle hint (Level 1) pointing me in the right direction without revealing the data structure or algorithm.";
      case 2: return "Give me a Level 2 hint. Suggest a data structure or algorithmic pattern that fits this problem, but don't tell me how to implement it.";
      case 3: return "Give me a Level 3 hint. Explain the step-by-step logic to solve this problem optimally, but do not write the code.";
      case 4: return "Give me a Level 4 hint. Explain the full optimal solution in detail, including the exact logic and time/space complexity.";
      default: return "Give me a hint.";
    }
  }
}
