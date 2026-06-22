import { useState } from 'react';
import { Sparkles, Activity } from 'lucide-react';
import { AIService, type AIProviderName } from '../../services/aiProvider';
import { PromptBuilder } from '../../services/promptBuilder';

interface ExplainLikeIm12Props {
  textToSimplify: string;
}

export function ExplainLikeIm12({ textToSimplify }: ExplainLikeIm12Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [simplifiedText, setSimplifiedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async () => {
    setIsExpanded(true);
    if (simplifiedText || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setSimplifiedText('');

    if (typeof chrome === 'undefined' || !chrome.storage) {
      setError('Storage unavailable');
      setIsGenerating(false);
      return;
    }

    chrome.storage.local.get(['aiProvider', 'apiKey'], async (res: any) => {
      const provider = res.aiProvider as AIProviderName;
      const apiKey = res.apiKey;

      if (!apiKey) {
        setError('API Key missing. Add it in settings.');
        setIsGenerating(false);
        return;
      }

      try {
        const prompt = PromptBuilder.buildELI12Prompt(textToSimplify);
        await AIService.streamChat(
          provider, 
          apiKey, 
          "You are an expert teacher.", 
          [{ id: 'eli12', role: 'user', content: prompt }], 
          {
            onChunk: (text: string) => setSimplifiedText(prev => prev + text),
            onDone: () => setIsGenerating(false),
            onError: (err: any) => {
              setError(err.message);
              setIsGenerating(false);
            }
          }
        );
      } catch (err: any) {
        setError(err.message || 'Failed to explain');
        setIsGenerating(false);
      }
    });
  };

  return (
    <div className="mt-4 mb-2">
      {!isExpanded ? (
        <button 
          onClick={handleExplain}
          className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider rounded-lg border border-accent/20 hover:bg-accent/20 transition-colors w-full justify-center shadow-sm hover:shadow"
        >
          <Sparkles size={14} />
          Explain Like I'm 12
        </button>
      ) : (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 relative shadow-inner">
          <div className="flex items-center gap-2 mb-3 border-b border-accent/10 pb-2">
            <Sparkles size={16} className="text-accent" />
            <h4 className="text-xs font-bold text-accent uppercase tracking-wider">Explain Like I'm 12</h4>
            {isGenerating && <Activity size={14} className="text-accent animate-pulse ml-auto" />}
          </div>
          {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
          <div className="text-sm text-text leading-relaxed prose prose-invert max-w-none">
            {simplifiedText || <span className="text-muted animate-pulse">Thinking of a good analogy...</span>}
          </div>
        </div>
      )}
    </div>
  );
}
