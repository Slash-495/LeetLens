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

  static buildReviewPrompt(context: ProblemContext): string {
    return `You are a Senior Software Engineer and Technical Interviewer.
Please review the following solution for the problem "${context.title}".

--- PROBLEM CONTEXT ---
Difficulty: ${context.difficulty}
Language: ${context.language}

Description:
${context.description}

Constraints:
${context.constraints.join('\n')}

--- USER'S CODE ---
${context.code}

--- INSTRUCTIONS ---
Perform a detailed code review. Provide constructive, educational feedback.
DO NOT provide the final optimal code unless it is vastly different and you are outlining it in the alternatives. Focus on learning.

You MUST return your response as a strict, valid JSON object matching this exact schema:
{
  "summary": "Brief 2-4 paragraph summary of the solution logic.",
  "correctness": {
    "status": "Correct", // or "Possibly Correct" or "Potential Issues Found"
    "reasoning": "Explanation"
  },
  "timeComplexity": { "complexity": "O(...)", "explanation": "..." },
  "spaceComplexity": { "complexity": "O(...)", "explanation": "..." },
  "efficiencyRating": { "score": 8, "rationale": "..." },
  "readabilityRating": { "score": 8, "suggestions": "..." },
  "interviewReadiness": { "score": 8, "feedback": "..." },
  "edgeCases": [
    { "name": "...", "handled": true, "explanation": "..." }
  ],
  "improvements": ["practical suggestion 1", "practical suggestion 2"],
  "alternatives": [
    { "name": "...", "timeComplexity": "...", "spaceComplexity": "...", "tradeoffs": "..." }
  ],
  "overallScore": 85
}

Ensure the output is ONLY valid JSON, with no markdown code blocks wrapping it. Do not include \`\`\`json.`;
  }
}
