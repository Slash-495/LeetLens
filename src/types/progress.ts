export interface ConceptCard {
  id: string;
  topic: string;
  definition: string;
  simpleExplanation: string;
  analogy: string;
  useCases: string[];
  mistakes: string[];
}

export interface TimelineEvent {
  id: string;
  type: 'review' | 'visualize';
  timestamp: number;
  problemSlug: string;
  title: string;
  score?: number;
  pattern?: string;
  timeComplexity?: string;
}

export interface ProgressStats {
  totalReviewed: number;
  totalVisualized: number;
  daysActive: number;
  patternCounts: Record<string, number>;
  averageScore: number;
  weaknesses: string[];
  recommendations: string[];
}
