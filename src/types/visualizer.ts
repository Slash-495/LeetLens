export interface VisualizerStep {
  step: number;
  description: string;
  variables: Record<string, string | number | boolean>;
  
  // Optional visual states
  arrayState?: {
    values: (string | number)[];
    pointers: Record<string, number>; // Name -> Index
    highlights?: number[]; // Indices to highlight
  };
  stringState?: {
    value: string;
    pointers: Record<string, number>;
  };
  mapState?: Record<string, string | number>;
  dpState?: {
    matrix: (number | string)[][];
    activeCell?: [number, number];
  };
}

export interface VisualizationTrace {
  algorithmType: string;
  patternInsight: string;
  timeComplexity: string;
  spaceComplexity: string;
  dataStructures: string[];
  codeSnippet?: string;
  steps: VisualizerStep[];
}
