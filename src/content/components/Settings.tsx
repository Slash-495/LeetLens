import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Palette, Shield, Info, ExternalLink, CheckCircle2 } from 'lucide-react';
import type { AIProviderName } from '../../services/aiProvider';

interface SettingsProps {
  onClose: () => void;
  onThemeChange: (theme: 'light'|'dark'|'system') => void;
}

export function Settings({ onClose, onThemeChange }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'privacy' | 'about'>('ai');
  
  // AI State
  const [provider, setProvider] = useState<AIProviderName>('Gemini');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'light'|'dark'|'system'>('dark');

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['aiProvider', 'apiKey', 'theme'], (res: any) => {
        if (res.aiProvider) setProvider(res.aiProvider);
        if (res.apiKey) setApiKey(res.apiKey);
        if (res.theme) setTheme(res.theme);
      });
    }
  }, []);

  const handleSaveAI = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ aiProvider: provider, apiKey }, () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      });
    }
  };

  const handleThemeChange = (newTheme: 'light'|'dark'|'system') => {
    setTheme(newTheme);
    onThemeChange(newTheme);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ theme: newTheme });
    }
  };

  return (
    <div className="absolute inset-0 bg-background z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
        <h2 className="text-sm font-bold text-text flex items-center gap-2">
          <SettingsIcon size={16} className="text-accent" />
          Settings
        </h2>
        <button onClick={onClose} className="text-xs font-bold text-muted hover:text-text bg-background border border-border px-3 py-1 rounded-lg transition-colors">Close</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 bg-surface/30 border-r border-border flex flex-col p-2 space-y-1">
          <button onClick={() => setActiveTab('general')} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'general' ? 'bg-accent/10 text-accent border border-accent/20' : 'text-muted hover:text-text hover:bg-surface border border-transparent'}`}>
            <Palette size={14} /> General
          </button>
          <button onClick={() => setActiveTab('ai')} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'ai' ? 'bg-accent/10 text-accent border border-accent/20' : 'text-muted hover:text-text hover:bg-surface border border-transparent'}`}>
            <Key size={14} /> AI Provider
          </button>
          <button onClick={() => setActiveTab('privacy')} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'privacy' ? 'bg-accent/10 text-accent border border-accent/20' : 'text-muted hover:text-text hover:bg-surface border border-transparent'}`}>
            <Shield size={14} /> Privacy
          </button>
          <button onClick={() => setActiveTab('about')} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'about' ? 'bg-accent/10 text-accent border border-accent/20' : 'text-muted hover:text-text hover:bg-surface border border-transparent'}`}>
            <Info size={14} /> About
          </button>
        </div>

        {/* Content */}
        <div className="w-2/3 p-4 overflow-y-auto custom-scrollbar">
          {activeTab === 'general' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-2">Theme Preferences</label>
                <div className="space-y-2">
                  {(['dark', 'light', 'system'] as const).map(t => (
                    <label key={t} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${theme === t ? 'border-accent bg-accent/5' : 'border-border hover:bg-surface'}`}>
                      <input 
                        type="radio" 
                        name="theme" 
                        value={t} 
                        checked={theme === t} 
                        onChange={() => handleThemeChange(t)}
                        className="accent-accent w-4 h-4"
                      />
                      <span className="text-xs font-bold text-text capitalize">{t} Mode</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-accent/10 p-3 rounded-xl border border-accent/20">
                <p className="text-xs text-text leading-relaxed font-medium">
                  LeetLens requires your own API keys. Keys are stored <strong>locally</strong> and securely on your device.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted uppercase tracking-wider block">Provider</label>
                <select
                  value={provider}
                  onChange={e => setProvider(e.target.value as AIProviderName)}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-text focus:outline-none focus:border-accent transition-colors cursor-pointer"
                >
                  <option value="Gemini">Gemini (Recommended, Free Tier Available)</option>
                  <option value="OpenAI">OpenAI</option>
                  <option value="OpenRouter">OpenRouter</option>
                </select>
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
                  onChange={e => setApiKey(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-xs text-text focus:outline-none focus:border-accent font-mono transition-colors"
                  placeholder="Enter your API Key..."
                />
              </div>
              <button
                onClick={handleSaveAI}
                className="w-full py-3 bg-accent text-white rounded-xl text-xs font-bold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 mt-2 shadow-lg shadow-accent/20"
              >
                {saved ? <><CheckCircle2 size={16} /> Saved Successfully</> : 'Save API Configuration'}
              </button>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <div className="flex items-center justify-center pt-2">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                  <Shield size={28} className="text-green-500" />
                </div>
              </div>
              <h3 className="text-base font-bold text-text">Your Data is Yours</h3>
              <ul className="space-y-3 text-left">
                <li className="text-xs text-text font-medium flex gap-3 bg-surface p-3 rounded-lg border border-border">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                  No personal data is collected.
                </li>
                <li className="text-xs text-text font-medium flex gap-3 bg-surface p-3 rounded-lg border border-border">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                  API keys are stored strictly in local storage.
                </li>
                <li className="text-xs text-text font-medium flex gap-3 bg-surface p-3 rounded-lg border border-border">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                  Requests route directly from your browser to the AI.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2 border-b border-border pb-6 pt-2">
                <div className="w-14 h-14 bg-accent/20 rounded-2xl border border-accent/30 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  <span className="text-2xl font-black text-accent tracking-tighter">LL</span>
                </div>
                <h3 className="text-base font-bold text-text">LeetLens</h3>
                <p className="text-[10px] font-mono text-muted bg-surface inline-block px-2 py-0.5 rounded border border-border">v1.0.0 (Production)</p>
              </div>

              <div className="space-y-2.5">
                <a href="https://github.com/Slash-495/LeetLens" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-accent/50 hover:bg-surface transition-colors group">
                  <span className="text-xs font-bold text-text group-hover:text-accent transition-colors">GitHub Repository</span>
                  <ExternalLink size={14} className="text-muted group-hover:text-accent transition-colors" />
                </a>
                <a href="https://github.com/Slash-495/LeetLens/issues" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-accent/50 hover:bg-surface transition-colors group">
                  <span className="text-xs font-bold text-text group-hover:text-accent transition-colors">Report a Bug / Request Feature</span>
                  <ExternalLink size={14} className="text-muted group-hover:text-accent transition-colors" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
