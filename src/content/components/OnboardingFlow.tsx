import { useState } from 'react';
import { BrainCircuit, ArrowRight, Check } from 'lucide-react';
import type { AIProviderName } from '../../services/aiProvider';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState<AIProviderName>('Gemini');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }
    
    setError(null);
    setIsTesting(true);

    try {
      // Simulate quick check (can't truly validate some without a real call, but we save it anyway for UX, just check if it's not empty)
      if (apiKey.length < 10) throw new Error("API Key seems too short to be valid.");
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ aiProvider: provider, apiKey, hasCompletedOnboarding: true });
      }
      onComplete();
    } catch (e: any) {
      setError(e.message || 'Invalid API key');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative z-[9999] overflow-y-auto">
      {step === 1 && (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-accent/20 rounded-3xl border border-accent/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <span className="text-3xl font-black text-accent tracking-tighter">LL</span>
          </div>
          <h1 className="text-2xl font-bold text-text mb-3">Welcome to LeetLens</h1>
          <p className="text-sm text-muted leading-relaxed mb-8">
            Your personal, AI-powered coding mentor. Get deep conceptual reviews, step-by-step visual execution traces, and smart learning paths directly inside LeetCode.
          </p>
          <button 
            onClick={() => setStep(2)}
            className="w-full py-3 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent/90 transition-transform active:scale-95 shadow-lg shadow-accent/20"
          >
            Get Started
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col h-full p-6 animate-in slide-in-from-right duration-500">
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-text mb-2 flex items-center gap-2">
                <BrainCircuit className="text-accent" /> Bring Your Own Key
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                LeetLens is entirely client-side. Your API keys are stored locally on your device and never sent to our servers. We support OpenAI, Gemini, and OpenRouter.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">Select AI Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Gemini', 'OpenAI', 'OpenRouter'] as AIProviderName[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setProvider(p)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                        provider === p 
                          ? 'bg-accent/10 border-accent text-accent' 
                          : 'bg-surface border-border text-muted hover:text-text'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">API Key</label>
                  <a 
                    href={provider === 'Gemini' ? 'https://aistudio.google.com/api-keys' : provider === 'OpenAI' ? 'https://platform.openai.com/api-keys' : 'https://openrouter.ai/keys'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-accent hover:underline flex items-center gap-1 font-medium"
                  >
                    Get your {provider} key
                  </a>
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setError(null); }}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent font-mono transition-colors"
                  placeholder={`Enter your ${provider} API Key`}
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 font-medium">{error}</p>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isTesting}
            className="w-full py-3 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent/90 transition-transform active:scale-95 shadow-lg shadow-accent/20 mt-auto disabled:opacity-50"
          >
            {isTesting ? 'Connecting...' : 'Connect AI'}
            {!isTesting && <Check size={18} />}
          </button>
        </div>
      )}
    </div>
  );
}
