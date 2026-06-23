import { useState } from 'react';
import { Activity, AlertCircle, Compass, Layers, Zap } from 'lucide-react';
import type { ProblemContext } from '../../../services/leetcodeExtractor';
import type { LearningProfile, ProblemRecommendations, SimilarProblemSet } from '../../../types/learn';
import { AIService, type AIProviderName } from '../../../services/aiProvider';
import { PromptBuilder } from '../../../services/promptBuilder';

interface PracticeGuideProps {
  context: ProblemContext | null;
  profile: LearningProfile | null;
  provider: AIProviderName;
  apiKey: string;
}

export function PracticeGuide({ context, profile, provider, apiKey }: PracticeGuideProps) {
  const [recs, setRecs] = useState<ProblemRecommendations | null>(null);
  const [similars, setSimilars] = useState<SimilarProblemSet | null>(null);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
  const [isGeneratingSimilars, setIsGeneratingSimilars] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRecs = async () => {
    if (!profile) return;
    setError(null);
    setIsGeneratingRecs(true);
    try {
      const prompt = PromptBuilder.buildRecommendationsPrompt(profile);
      const res = await AIService.generateRecommendations(provider, apiKey, prompt);
      setRecs(res as ProblemRecommendations);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsGeneratingRecs(false);
    }
  };

  const handleGenerateSimilars = async () => {
    if (!context) return;
    setError(null);
    setIsGeneratingSimilars(true);
    try {
      const prompt = PromptBuilder.buildSimilarProblemsPrompt(context);
      const res = await AIService.generateSimilarProblems(provider, apiKey, prompt);
      setSimilars(res as SimilarProblemSet);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsGeneratingSimilars(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Similar Problems */}
      <div className="bg-surface/30 border border-border/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <Layers size={16} className="text-accent" />
            Similar Problems
          </h3>
          {!similars && context && (
            <button 
              onClick={handleGenerateSimilars}
              disabled={isGeneratingSimilars}
              className="text-[10px] bg-accent/10 text-accent px-2 py-1 rounded font-bold uppercase hover:bg-accent/20 disabled:opacity-50"
            >
              {isGeneratingSimilars ? 'Scanning...' : 'Find Variants'}
            </button>
          )}
        </div>
        
        {isGeneratingSimilars ? (
          <div className="flex justify-center py-4"><Activity size={20} className="text-accent animate-spin" /></div>
        ) : similars ? (
          <div className="space-y-3">
            {similars.variants.map((v, i) => (
              <div key={i} className="bg-background border border-border p-3 rounded-lg flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text truncate max-w-[200px]">{v.title}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    v.type === 'Easier Variant' ? 'bg-green-500/10 text-green-400' :
                    v.type === 'Harder Variant' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {v.type}
                  </span>
                </div>
                <p className="text-[10px] text-muted">{v.skillTaught}</p>
              </div>
            ))}
          </div>
        ) : !context ? (
          <p className="text-xs text-muted text-center py-2">Open a LeetCode problem to find variants.</p>
        ) : null}
      </div>

      {/* Personalized Recommendations */}
      <div className="bg-surface border border-accent/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <Compass size={16} className="text-accent" />
            What to Solve Next
          </h3>
          {!recs && (
            <button 
              onClick={handleGenerateRecs}
              disabled={isGeneratingRecs}
              className="text-[10px] bg-accent text-white px-2 py-1 rounded font-bold uppercase hover:bg-accent/90 disabled:opacity-50"
            >
              {isGeneratingRecs ? 'Analyzing...' : 'Generate Path'}
            </button>
          )}
        </div>

        {isGeneratingRecs ? (
          <div className="flex justify-center py-6"><Activity size={24} className="text-accent animate-pulse" /></div>
        ) : recs ? (
          <div className="space-y-4">
            <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-accent" />
                <span className="text-[10px] font-bold text-accent uppercase">Mentor Advice</span>
              </div>
              <p className="text-xs font-medium text-text">{recs.learningTakeaway}</p>
            </div>
            
            {(['easy', 'medium', 'hard'] as const).map(diff => (
              recs[diff].length > 0 && (
                <div key={diff} className="space-y-2">
                  <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider">{diff}</h4>
                  {recs[diff].map((rec, i) => (
                    <div key={i} className="bg-background border border-border p-2.5 rounded-lg flex flex-col gap-1.5 hover:border-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text truncate pr-2">{rec.title}</span>
                        <span className="text-[10px] font-mono bg-surface px-1.5 py-0.5 rounded border border-border text-muted shrink-0">
                          {rec.pattern}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted leading-relaxed">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
