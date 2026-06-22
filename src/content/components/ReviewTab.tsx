import { useState, useEffect } from 'react';
import { RefreshCw, Play, AlertCircle, Activity, AlertTriangle, Zap, CheckCircle2, History } from 'lucide-react';
import type { ProblemContext } from '../../services/leetcodeExtractor';
import type { ReviewReport } from '../../types/review';
import { AIService, type AIProviderName } from '../../services/aiProvider';
import { PromptBuilder } from '../../services/promptBuilder';
import { ReviewStorage } from '../../services/reviewStorage';
import { ReviewScorecard } from './ReviewScorecard';
import { ExpandableSection } from './ExpandableSection';
import { v4 as uuidv4 } from 'uuid';

export function ReviewTab({ context }: { context: ProblemContext | null }) {
  const [reviews, setReviews] = useState<ReviewReport[]>([]);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [provider, setProvider] = useState<AIProviderName>('Gemini');
  const [apiKey, setApiKey] = useState('');

  const loadingSteps = [
    "Analyzing Solution Architecture...",
    "Checking Correctness & Logic...",
    "Estimating Time Complexity...",
    "Estimating Space Complexity...",
    "Evaluating Interview Readiness...",
    "Finding Edge Cases..."
  ];

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['aiProvider', 'apiKey'], (res: any) => {
        if (res.aiProvider) setProvider(res.aiProvider);
        if (res.apiKey) setApiKey(res.apiKey);
      });
    }

    if (context?.url) {
      ReviewStorage.loadReviews(context.url).then(saved => {
        setReviews(saved);
        if (saved.length > 0) setActiveReviewId(saved[0].id);
      });
    }
  }, [context?.url]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep(s => (s + 1) % loadingSteps.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerateReview = async () => {
    if (!context || !context.code || context.code.trim().length < 10) {
      setError("Please write some code before requesting a review.");
      return;
    }
    
    setError(null);
    setIsGenerating(true);

    try {
      const systemPrompt = PromptBuilder.buildReviewPrompt(context);
      const jsonResponse = await AIService.generateReview(provider, apiKey, systemPrompt);
      
      const newReview: ReviewReport = {
        id: uuidv4(),
        timestamp: Date.now(),
        ...jsonResponse
      };

      await ReviewStorage.saveReview(context.url, newReview);
      
      const updatedReviews = [newReview, ...reviews].slice(0, 5);
      setReviews(updatedReviews);
      setActiveReviewId(newReview.id);
      
    } catch (err: any) {
      setError(err.message || "Failed to generate review. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const activeReview = reviews.find(r => r.id === activeReviewId) || null;

  return (
    <div className="flex flex-col h-full bg-background relative -mx-4 -mb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-surface/30">
        <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
          Solution Review Engine
        </span>
        {reviews.length > 0 && !isGenerating && (
          <select 
            value={activeReviewId || ''}
            onChange={(e) => setActiveReviewId(e.target.value)}
            className="bg-transparent text-xs text-text border border-border rounded-md px-2 py-1 focus:outline-none focus:border-accent"
          >
            {reviews.map((r, i) => (
              <option key={r.id} value={r.id}>
                {i === 0 ? 'Latest Review' : new Date(r.timestamp).toLocaleTimeString()}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-surface border-t-accent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity size={24} className="text-accent animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-text">Reviewing Solution</h3>
              <p className="text-xs text-muted transition-all duration-300">
                {loadingSteps[loadingStep]}
              </p>
            </div>
          </div>
        ) : !activeReview ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
            <div className="w-16 h-16 rounded-3xl bg-surface border border-border flex items-center justify-center text-accent shadow-sm rotate-12 hover:rotate-0 transition-all duration-300">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text">Review My Solution</h3>
              <p className="text-xs text-muted mt-2 max-w-[250px] leading-relaxed">
                Get instant feedback from a senior engineer. We'll analyze correctness, time complexity, and interview readiness.
              </p>
            </div>
            <button 
              onClick={handleGenerateReview}
              className="mt-4 px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-xl shadow-lg hover:bg-accent/90 transition-colors flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              Start Review
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ReviewScorecard report={activeReview} />

            <div className="text-sm text-text leading-relaxed bg-surface/30 p-4 rounded-xl border border-border/50">
              {activeReview.summary}
            </div>

            <ExpandableSection title="Correctness Analysis" icon={<CheckCircle2 size={16} />} defaultExpanded>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">Status:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    activeReview.correctness.status === 'Correct' ? 'bg-green-500/10 text-green-400' :
                    activeReview.correctness.status === 'Possibly Correct' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {activeReview.correctness.status}
                  </span>
                </div>
                <p className="text-sm text-text mt-1">{activeReview.correctness.reasoning}</p>
              </div>
            </ExpandableSection>

            <ExpandableSection title="Complexity Analysis" icon={<Activity size={16} />}>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted uppercase tracking-wider">Time Complexity:</span>
                    <span className="text-sm font-mono text-accent bg-accent/10 px-1.5 rounded">{activeReview.timeComplexity?.complexity || 'Unknown'}</span>
                  </div>
                  <p className="text-sm text-text">{activeReview.timeComplexity?.explanation}</p>
                </div>
                <div className="h-px bg-border/50" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted uppercase tracking-wider">Space Complexity:</span>
                    <span className="text-sm font-mono text-accent bg-accent/10 px-1.5 rounded">{activeReview.spaceComplexity?.complexity || 'Unknown'}</span>
                  </div>
                  <p className="text-sm text-text">{activeReview.spaceComplexity?.explanation}</p>
                </div>
              </div>
            </ExpandableSection>

            {activeReview.edgeCases && activeReview.edgeCases.length > 0 && (
              <ExpandableSection title="Edge Cases" icon={<AlertTriangle size={16} />}>
                <div className="space-y-3">
                  {activeReview.edgeCases.map((ec, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className="shrink-0 mt-0.5">
                        {ec.handled ? (
                          <CheckCircle2 size={16} className="text-green-400" />
                        ) : (
                          <AlertCircle size={16} className="text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-text">{ec.name}</span>
                        <p className="text-muted mt-0.5">{ec.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            )}

            {activeReview.improvements && activeReview.improvements.length > 0 && (
              <ExpandableSection title="Suggested Improvements" icon={<Zap size={16} />}>
                <ul className="list-disc list-outside ml-4 space-y-2">
                  {activeReview.improvements.map((imp, i) => (
                    <li key={i} className="text-sm text-text pl-1">{imp}</li>
                  ))}
                </ul>
              </ExpandableSection>
            )}

            {activeReview.alternatives && activeReview.alternatives.length > 0 && (
              <ExpandableSection title="Alternative Approaches" icon={<History size={16} />}>
                <div className="space-y-4">
                  {activeReview.alternatives.map((alt, i) => (
                    <div key={i} className="space-y-2">
                      <h4 className="text-sm font-semibold text-text">{alt.name}</h4>
                      <div className="flex items-center gap-4 text-xs font-mono text-muted">
                        <span>Time: {alt.timeComplexity}</span>
                        <span>Space: {alt.spaceComplexity}</span>
                      </div>
                      <p className="text-sm text-muted">{alt.tradeoffs}</p>
                      {i < activeReview.alternatives.length - 1 && <div className="h-px bg-border/50 my-3" />}
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            )}

            <div className="flex justify-center pt-4 pb-2">
              <button 
                onClick={handleGenerateReview}
                className="flex items-center gap-2 px-4 py-2 bg-surface text-text text-xs font-medium rounded-lg hover:bg-surface/80 border border-border transition-colors"
              >
                <RefreshCw size={14} />
                Run New Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
