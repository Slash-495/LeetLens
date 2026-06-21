import { X, Lock, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [provider, setProvider] = useState('Gemini');
  const [apiKey, setApiKey] = useState('');
  const [theme, setTheme] = useState('System');
  const [isKeyMasked, setIsKeyMasked] = useState(true);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['aiProvider', 'apiKey', 'theme'], (result: any) => {
        if (result.aiProvider) setProvider(result.aiProvider);
        if (result.apiKey) setApiKey(result.apiKey);
        if (result.theme) setTheme(result.theme);
      });
    }
  }, []);

  const handleSave = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({
        aiProvider: provider,
        apiKey,
        theme
      }, () => {
        onClose();
      });
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#111827] w-full max-w-sm rounded-xl border border-border shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-semibold text-text tracking-tight">Settings</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-muted hover:text-text hover:bg-surface transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Provider Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text">AI Provider</label>
              <select 
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors"
              >
                <option value="Gemini">Gemini</option>
                <option value="OpenAI">OpenAI</option>
                <option value="OpenRouter">OpenRouter</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center justify-between">
                API Key
                {apiKey && (
                  <button 
                    onClick={() => setIsKeyMasked(!isKeyMasked)}
                    className="text-[10px] text-accent hover:underline"
                  >
                    {isKeyMasked ? 'Show' : 'Hide'}
                  </button>
                )}
              </label>
              <input 
                type={isKeyMasked ? "password" : "text"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors placeholder:text-muted/50"
              />
              <p className="text-[10px] text-muted flex items-center gap-1 mt-1">
                <Lock size={10} /> Keys are stored locally and never logged.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text">Theme</label>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors"
              >
                <option value="Dark">Dark</option>
                <option value="Light">Light</option>
                <option value="System">System</option>
              </select>
            </div>
          </div>

          {/* Privacy & Disclaimer */}
          <div className="pt-4 border-t border-border space-y-4">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
                <Shield size={12} className="text-accent" /> Privacy Policy
              </h3>
              <p className="text-[11px] text-muted leading-relaxed">
                LeetLens does not collect, store, or process user data on external servers.
                Problem data, code, and prompts are sent directly to the selected AI provider.
                LeetLens does not store user code outside local browser storage.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-text uppercase tracking-wider">
                AI Disclaimer
              </h3>
              <p className="text-[11px] text-muted leading-relaxed">
                AI responses may be inaccurate and should be reviewed before use. LeetLens acts as a coding mentor, not a replacement for understanding.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-3 bg-surface/50 rounded-b-xl flex-shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text hover:bg-surface rounded-lg transition-colors border border-border"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
