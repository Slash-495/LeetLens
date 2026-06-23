export interface SolutionProfile {
  pattern: string;
  timeComplexity: string;
  spaceComplexity: string;
  strengths: string[];
  weaknesses: string[];
}

export interface AlternativeApproach {
  name: string;
  pattern: string;
  timeComplexity: string;
  spaceComplexity: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  advantages: string[];
  disadvantages: string[];
  tradeoffs: string;
}

export interface SideBySideMetrics {
  readability: { user: string; optimal: string };
  memoryUsage: { user: string; optimal: string };
  implementationDifficulty: { user: string; optimal: string };
  interviewFriendliness: { user: string; optimal: string };
  maintainability: { user: string; optimal: string };
}

export interface ComparisonReport {
  codeSnippet?: string; // The exact code this was generated for
  id?: string;
  timestamp?: number;
  userProfile: SolutionProfile;
  optimalAnalysis: {
    reasoning: string;
    runtimeExplain: string;
    memoryExplain: string;
    simplicityExplain: string;
    scalabilityExplain: string;
  };
  sideBySide: SideBySideMetrics;
  alternatives: AlternativeApproach[];
  tradeoffExplorer: string[];
  patternComparison: {
    recommendedPattern: string;
    whyFitsBetter: string;
    whenToUseUserPattern: string;
    whenToUseRecommendedPattern: string;
  };
  relatedPatterns: {
    pattern: string;
    relationship: string;
  }[];
  learningTakeaway: string;
  optimalCodeSnippet: string; // Used to generate visual comparison later
}
