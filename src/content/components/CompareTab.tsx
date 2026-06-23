import { useState, useEffect } from 'react';
import { Activity, AlertCircle, GitCompare, Eye, ChevronLeft } from 'lucide-react';
import type { ProblemContext } from '../../services/leetcodeExtractor';
import type { ComparisonReport } from '../../types/compare';
import { AIService, type AIProviderName } from '../../services/aiProvider';
import { PromptBuilder } from '../../services/promptBuilder';
import { CompareStorage } from '../../services/compareStorage';
import { ComparisonDashboard } from './compare/ComparisonDashboard';
import { VisualCompareMode } from './compare/VisualCompareMode';

export function CompareTab({ context }: { context: ProblemContext | null }) {
  const [report, setReport] = useState<ComparisonReport | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const [provider, setProvider] = useState<AIProviderName>('Gemini');
  const [apiKey, setApiKey] = useState('');

  const [mode, setMode] = useState<'conceptual' | 'visual'>('conceptual');

  const loadingSteps = [
    "Analyzing Current Architecture...",
    "Brainstorming Alternatives...",
    "Evaluating Tradeoffs...",
    "Writing Optimal Code Snippet...",
    "Finalizing Comparison..."
  ];

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['aiProvider', 'apiKey'], (res: any) => {
        if (res.aiProvider) setProvider(res.aiProvider);
        if (res.apiKey) setApiKey(res.apiKey);
      });
    }

    if (context?.url) {
      CompareStorage.loadComparison(context.url).then(saved => {
        if (saved) setReport(saved);
      });
    }
  }, [context?.url]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep(s => (s + 1) % loadingSteps.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!context || !context.code || context.code.trim().length < 10) {
      setError("Please write some code before requesting a comparison.");
      return;
    }
    
    setError(null);
    setIsGenerating(true);

    try {
      const systemPrompt = PromptBuilder.buildComparisonPrompt(context);
      const jsonResponse = await AIService.generateComparison(provider, apiKey, systemPrompt);
      
      const newReport: ComparisonReport = {
        ...jsonResponse,
        codeSnippet: context.code
      };
      await CompareStorage.saveComparison(context.url, newReport);
      setReport(newReport);
      
    } catch (err: any) {
      setError(err.message || "Failed to generate comparison.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative -mx-4 -mb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-surface/30">
        <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
          Solutions Comparison
        </span>
        <div className="flex items-center gap-2">
          {report && !isGenerating && mode === 'conceptual' && (
            <span className="text-[9px] font-bold bg-accent/10 text-accent px-1.5 py-0.5 rounded uppercase tracking-wider border border-accent/20">Cached</span>
          )}
          {report && mode === 'conceptual' && (
            <button 
              onClick={() => setMode('visual')}
              className="flex items-center gap-1.5 px-2 py-1 bg-accent/10 text-accent rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-accent/20 transition-colors"
            >
              <Eye size={12} />
              Visual Mode
            </button>
          )}
          {mode === 'visual' && (
            <button 
              onClick={() => setMode('conceptual')}
              className="flex items-center gap-1.5 px-2 py-1 bg-surface text-text rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-surface/80 transition-colors border border-border"
            >
              <ChevronLeft size={12} />
              Back to Analysis
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col relative">
        {report && !isGenerating && (
          ((report as any).codeSnippet !== undefined 
            ? (report as any).codeSnippet?.trim() !== context?.code?.trim() 
            : true)
        ) && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-500 flex items-center justify-between gap-2 mb-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Code Has Changed</span>
                <span className="opacity-80">This comparison is for an older version of your code.</span>
              </div>
            </div>
            <button 
              onClick={handleGenerate}
              className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded-md font-bold transition-colors whitespace-nowrap"
            >
              Run New Comparison
            </button>
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2 mb-4">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-surface border-t-accent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity size={24} className="text-accent animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-text">Analyzing Approaches</h3>
              <p className="text-xs text-muted transition-all duration-300">
                {loadingSteps[loadingStep]}
              </p>
            </div>
          </div>
        ) : !report ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-surface border border-border flex items-center justify-center text-accent shadow-sm rotate-12 hover:rotate-0 transition-all duration-300">
              <GitCompare size={32} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text">Compare Solutions</h3>
              <p className="text-xs text-muted mt-2 max-w-[250px] leading-relaxed">
                Discover alternative approaches, understand engineering tradeoffs, and learn why optimal solutions work.
              </p>
            </div>
            <button 
              onClick={handleGenerate}
              className="mt-4 px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-xl shadow-lg hover:bg-accent/90 transition-colors flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <GitCompare size={16} />
              Compare My Solution
            </button>
          </div>
        ) : mode === 'conceptual' ? (
          <ComparisonDashboard report={report} />
        ) : (
          <VisualCompareMode context={context} report={report} provider={provider} apiKey={apiKey} />
        )}
      </div>
    </div>
  );
}
