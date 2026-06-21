import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Tabs } from './components/Tabs';
import { SettingsModal } from './components/SettingsModal';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeetCodeProblem, setIsLeetCodeProblem] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
        const currentTab = tabs[0];
        if (currentTab?.url && currentTab.url.includes('leetcode.com/problems/')) {
          setIsLeetCodeProblem(true);
        }
      });
    } else {
      // Fallback for local development testing
      setIsLeetCodeProblem(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <main className="flex-1 flex flex-col p-4 overflow-y-auto">
        {isLeetCodeProblem ? (
          <div className="flex flex-col h-full">
            <Tabs />
            <div className="flex-1 flex items-center justify-center border border-border border-dashed rounded-xl mt-4 bg-surface/30 m-4">
              <p className="text-sm text-muted">AI Features Coming in Phase 2</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-border shadow-sm mb-6">
              <span className="text-accent font-bold text-2xl">LL</span>
            </div>
            <h2 className="text-xl font-semibold text-text mb-2 tracking-tight">LeetLens</h2>
            <p className="text-sm text-muted mb-8 leading-relaxed">AI-powered interview and coding assistant for LeetCode.</p>
            <div className="bg-surface/50 border border-border rounded-xl p-4 w-full">
              <p className="text-sm text-text font-medium">Open a LeetCode problem to begin.</p>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}

export default App;
