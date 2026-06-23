import { useState, useEffect } from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import type { ProblemContext } from '../../../services/leetcodeExtractor';
import type { ComparisonReport } from '../../../types/compare';
import type { VisualizationTrace } from '../../../types/visualizer';
import type { AIProviderName } from '../../../services/aiProvider';
import { AIService } from '../../../services/aiProvider';
import { PromptBuilder } from '../../../services/promptBuilder';
import { VisualizationStorage } from '../../../services/visualizationStorage';
import { PlaybackPlayer } from '../visualizer/PlaybackPlayer';
import { VisualizerEngine } from '../visualizer/VisualizerEngine';

interface VisualCompareModeProps {
  context: ProblemContext | null;
  report: ComparisonReport;
  provider: AIProviderName;
  apiKey: string;
}

export function VisualCompareMode({ context, report, provider, apiKey }: VisualCompareModeProps) {
  const [userTrace, setUserTrace] = useState<VisualizationTrace | null>(null);
  const [optimalTrace, setOptimalTrace] = useState<VisualizationTrace | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    let mounted = true;

    const fetchTraces = async () => {
      if (!context) return;
      try {
        let utrace = await VisualizationStorage.loadTrace(context.url);
        if (!utrace) {
          const userPrompt = PromptBuilder.buildVisualizationPrompt(context);
          const uResp = await AIService.generateVisualization(provider, apiKey, userPrompt);
          utrace = uResp as VisualizationTrace;
          await VisualizationStorage.saveTrace(context.url, utrace);
        }

        let otrace = await VisualizationStorage.loadTrace(`${context.url}_optimal`);
        if (!otrace) {
          const optimalContext = { ...context, code: report.optimalCodeSnippet };
          const optPrompt = PromptBuilder.buildVisualizationPrompt(optimalContext);
          const oResp = await AIService.generateVisualization(provider, apiKey, optPrompt);
          otrace = oResp as VisualizationTrace;
          await VisualizationStorage.saveTrace(`${context.url}_optimal`, otrace);
        }

        if (mounted) {
          setUserTrace(utrace);
          setOptimalTrace(otrace);
          setIsGenerating(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Failed to generate visual traces.");
          setIsGenerating(false);
        }
      }
    };

    fetchTraces();
    return () => { mounted = false; };
  }, [context, report, provider, apiKey]);

  const maxSteps = Math.max(userTrace?.steps.length || 0, optimalTrace?.steps.length || 0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && currentStepIdx < maxSteps - 1) {
      const ms = 2000 / speed;
      timer = setTimeout(() => {
        setCurrentStepIdx(i => i + 1);
      }, ms);
    } else if (isPlaying && currentStepIdx >= maxSteps - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, speed, maxSteps]);

  if (error) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2">
        <AlertCircle size={14} className="shrink-0 mt-0.5" />
        <span className="leading-relaxed">{error}</span>
      </div>
    );
  }

  if (isGenerating || !userTrace || !optimalTrace) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <Activity size={24} className="text-accent animate-pulse" />
        <h3 className="text-sm font-semibold text-text">Generating Side-by-Side Traces</h3>
        <p className="text-xs text-muted max-w-[200px]">Simulating your code and the optimal code...</p>
      </div>
    );
  }

  const uStep = userTrace.steps[Math.min(currentStepIdx, userTrace.steps.length - 1)];
  const oStep = optimalTrace.steps[Math.min(currentStepIdx, optimalTrace.steps.length - 1)];

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1 grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar pb-4">
        
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col shadow-inner relative">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Your Solution</span>
            <span className="text-[10px] font-mono text-muted truncate max-w-[150px]">{userTrace.algorithmType}</span>
          </div>
          <div className="flex flex-col justify-center min-h-[100px]">
            <VisualizerEngine step={uStep} />
          </div>
          <div className="mt-2 text-xs text-text border-t border-border/50 pt-2">
            {uStep.description}
          </div>
        </div>

        <div className="bg-surface border border-accent/30 rounded-xl p-4 flex flex-col shadow-inner relative">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Optimal Code</span>
            <span className="text-[10px] font-mono text-accent truncate max-w-[150px]">{optimalTrace.algorithmType}</span>
          </div>
          <div className="flex flex-col justify-center min-h-[100px]">
            <VisualizerEngine step={oStep} />
          </div>
          <div className="mt-2 text-xs text-text border-t border-border/50 pt-2">
            {oStep.description}
          </div>
        </div>
      </div>

      <div className="pb-2 shrink-0">
        <PlaybackPlayer 
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onNext={() => setCurrentStepIdx(i => Math.min(i + 1, maxSteps - 1))}
          onPrev={() => setCurrentStepIdx(i => Math.max(i - 1, 0))}
          onRestart={() => { setCurrentStepIdx(0); setIsPlaying(false); }}
          canNext={currentStepIdx < maxSteps - 1}
          canPrev={currentStepIdx > 0}
          speed={speed}
          onSpeedChange={setSpeed}
        />
      </div>
    </div>
  );
}
