export interface LearningGoal {
  id: string;
  text: string;
  current: number;
  target: number;
  completed: boolean;
}

export interface FavoriteItem {
  id: string;
  type: 'review' | 'visual' | 'concept' | 'comparison';
  title: string;
  timestamp: number;
  pattern?: string;
}

export interface LearningProfile {
  totalSolved: number;
  strongPatterns: string[];
  weakPatterns: string[];
  recentTopics: string[];
  goalsCompleted: number;
}

export interface RecommendedProblem {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  pattern: string;
  reason: string;
}

export interface ProblemRecommendations {
  easy: RecommendedProblem[];
  medium: RecommendedProblem[];
  hard: RecommendedProblem[];
  learningTakeaway: string;
}

export interface SimilarProblemVariant {
  title: string;
  type: 'Easier Variant' | 'Similar Variant' | 'Harder Variant';
  skillTaught: string;
}

export interface SimilarProblemSet {
  variants: SimilarProblemVariant[];
}

export interface ConceptReinforcement {
  keyIdea: string;
  commonMistakes: string[];
  whenToUse: string;
  whenNotToUse: string;
  relatedPatterns: { pattern: string; relationship: string }[];
}
