export interface ReviewReport {
  id: string; // Unique ID for history
  timestamp: number;
  codeSnippet?: string; // The exact code this was generated for
  
  summary: string;
  
  correctness: {
    status: 'Correct' | 'Possibly Correct' | 'Potential Issues Found';
    reasoning: string;
  };

  timeComplexity: {
    complexity: string; // e.g., "O(N)"
    explanation: string;
  };

  spaceComplexity: {
    complexity: string; // e.g., "O(1)"
    explanation: string;
  };

  efficiencyRating: {
    score: number; // 1-10
    rationale: string;
  };

  readabilityRating: {
    score: number; // 1-10
    suggestions: string;
  };

  interviewReadiness: {
    score: number; // 1-10
    feedback: string;
  };

  edgeCases: {
    name: string;
    handled: boolean;
    explanation: string;
  }[];

  improvements: string[];

  alternatives: {
    name: string;
    timeComplexity: string;
    spaceComplexity: string;
    tradeoffs: string;
  }[];

  overallScore: number; // 0-100
}
