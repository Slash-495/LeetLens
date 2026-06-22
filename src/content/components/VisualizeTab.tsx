import { useState, useEffect } from 'react';
import { Play, Activity, AlertCircle, Eye, BrainCircuit } from 'lucide-react';
import type { ProblemContext } from '../../services/leetcodeExtractor';
import type { VisualizationTrace } from '../../types/visualizer';
import { AIService, type AIProviderName } from '../../services/aiProvider';
import { PromptBuilder } from '../../services/promptBuilder';
import { VisualizationStorage } from '../../services/visualizationStorage';
import { PlaybackPlayer } from './visualizer/PlaybackPlayer';
import { VariableTracker } from './visualizer/VariableTracker';
import { VisualizerEngine } from './visualizer/VisualizerEngine';
import { ExplainLikeIm12 } from './ExplainLikeIm12';

export function VisualizeTab({ context }: { context: ProblemContext | null }) {
  const [trace, setTrace] = useState<VisualizationTrace | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const [provider, setProvider] = useState<AIProviderName>('Gemini');
  const [apiKey, setApiKey] = useState('');

  const loadingSteps = [
    "Analyzing Algorithm Architecture...",
    "Creating Execution Sandbox...",
    "Tracing Variable States...",
    "Building Visual Representations...",
    "Finalizing Timeline..."
  ];

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['aiProvider', 'apiKey'], (res: any) => {
        if (res.aiProvider) setProvider(res.aiProvider);
        if (res.apiKey) setApiKey(res.apiKey);
      });
    }

    if (context?.url) {
      VisualizationStorage.loadTrace(context.url).then(saved => {
        if (saved) {
          setTrace(saved);
          setCurrentStepIdx(0);
          setIsPlaying(false);
        }
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

  // Auto-playback logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && trace && currentStepIdx < trace.steps.length - 1) {
      const ms = 2000 / speed;
      timer = setTimeout(() => {
        setCurrentStepIdx(i => i + 1);
      }, ms);
    } else if (isPlaying && trace && currentStepIdx >= trace.steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, speed, trace]);

  const handleGenerate = async () => {
    if (!context || !context.code || context.code.trim().length < 10) {
      setError("Please write some code before requesting a visualization.");
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    setIsPlaying(false);
    setCurrentStepIdx(0);

    try {
      const systemPrompt = PromptBuilder.buildVisualizationPrompt(context);
      const jsonResponse = await AIService.generateVisualization(provider, apiKey, systemPrompt);
      
      const newTrace: VisualizationTrace = jsonResponse as VisualizationTrace;
      if (!newTrace.steps || newTrace.steps.length === 0) {
        throw new Error("AI returned an empty execution trace.");
      }

      await VisualizationStorage.saveTrace(context.url, newTrace);
      setTrace(newTrace);
      
    } catch (err: any) {
      setError(err.message || "Failed to generate visualization.");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentStep = trace?.steps[currentStepIdx];

  return (
    <div className="flex flex-col h-full bg-background relative -mx-4 -mb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-surface/30">
        <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
          Code Execution Visualizer
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
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
              <h3 className="text-sm font-semibold text-text">Tracing Execution</h3>
              <p className="text-xs text-muted transition-all duration-300">
                {loadingSteps[loadingStep]}
              </p>
            </div>
          </div>
        ) : !trace || !currentStep ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-surface border border-border flex items-center justify-center text-accent shadow-sm rotate-12 hover:rotate-0 transition-all duration-300">
              <Eye size={32} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text">Visualize My Solution</h3>
              <p className="text-xs text-muted mt-2 max-w-[250px] leading-relaxed">
                Watch your algorithm execute step-by-step on a sample test case to build deep intuition.
              </p>
            </div>
            <button 
              onClick={handleGenerate}
              className="mt-4 px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-xl shadow-lg hover:bg-accent/90 transition-colors flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              Start Visualization
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
            
            {/* Learning Panel Header */}
            <div className="bg-surface border border-border rounded-xl p-3 flex items-start gap-3 shadow-sm">
              <div className="p-2 bg-accent/10 text-accent rounded-lg">
                <BrainCircuit size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text">{trace.algorithmType}</h3>
                  <div className="flex gap-2 text-[10px] font-mono text-muted">
                    <span className="bg-background px-1.5 py-0.5 rounded border border-border">Time: {trace.timeComplexity}</span>
                    <span className="bg-background px-1.5 py-0.5 rounded border border-border">Space: {trace.spaceComplexity}</span>
                  </div>
                </div>
                <p className="text-xs text-muted mt-1 leading-relaxed">{trace.patternInsight}</p>
                <div className="mt-2">
                  <ExplainLikeIm12 textToSimplify={trace.patternInsight} />
                </div>
              </div>
            </div>

            {/* Visualizer Engine */}
            <div className="flex-1 bg-surface border border-border rounded-xl p-4 flex flex-col justify-center min-h-[150px] shadow-inner relative overflow-hidden">
              <div className="absolute top-2 right-2 text-[10px] font-mono text-muted/50 uppercase">
                {trace.dataStructures?.join(', ')}
              </div>
              <VisualizerEngine step={currentStep} />
            </div>

            {/* Variables */}
            <VariableTracker variables={currentStep.variables} />

            {/* Explanation Box */}
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 min-h-[70px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Step {currentStepIdx + 1} of {trace.steps.length}</span>
              </div>
              <p className="text-sm text-text leading-relaxed">{currentStep.description}</p>
            </div>

            {/* Playback Controls */}
            <PlaybackPlayer 
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onNext={() => setCurrentStepIdx(i => Math.min(i + 1, trace.steps.length - 1))}
              onPrev={() => setCurrentStepIdx(i => Math.max(i - 1, 0))}
              onRestart={() => { setCurrentStepIdx(0); setIsPlaying(false); }}
              canNext={currentStepIdx < trace.steps.length - 1}
              canPrev={currentStepIdx > 0}
              speed={speed}
              onSpeedChange={setSpeed}
            />

            <div className="flex justify-center pt-2 pb-2">
              <button 
                onClick={handleGenerate}
                className="text-[10px] text-muted hover:text-text transition-colors underline underline-offset-2"
              >
                Generate New Trace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
