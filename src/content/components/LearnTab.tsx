import { useState, useEffect } from 'react';
import { Lightbulb, Navigation, BookMarked } from 'lucide-react';
import type { ProblemContext } from '../../services/leetcodeExtractor';
import type { LearningProfile } from '../../types/learn';
import { LearnStorage } from '../../services/learnStorage';
import { MentorDashboard } from './learn/MentorDashboard';
import { PracticeGuide } from './learn/PracticeGuide';
import { KnowledgeBase } from './learn/KnowledgeBase';
import { GlobalSearch } from './learn/GlobalSearch';
import type { AIProviderName } from '../../services/aiProvider';

export function LearnTab({ context }: { context: ProblemContext | null }) {
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'mentor' | 'practice' | 'knowledge'>('mentor');
  
  const [provider, setProvider] = useState<AIProviderName>('Gemini');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    LearnStorage.getLearningProfile().then(setProfile);
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['aiProvider', 'apiKey'], (res: any) => {
        if (res.aiProvider) setProvider(res.aiProvider);
        if (res.apiKey) setApiKey(res.apiKey);
      });
    }
  }, [context]);

  return (
    <div className="flex flex-col h-full bg-background relative -mx-4 -mb-4">
      
      {/* Sub-navigation */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-surface/30 shrink-0">
        <button 
          onClick={() => setActiveSubTab('mentor')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            activeSubTab === 'mentor' ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-surface hover:text-text'
          }`}
        >
          <Lightbulb size={14} />
          Mentor
        </button>
        <button 
          onClick={() => setActiveSubTab('practice')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            activeSubTab === 'practice' ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-surface hover:text-text'
          }`}
        >
          <Navigation size={14} />
          Practice
        </button>
        <button 
          onClick={() => setActiveSubTab('knowledge')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            activeSubTab === 'knowledge' ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-surface hover:text-text'
          }`}
        >
          <BookMarked size={14} />
          Knowledge
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeSubTab === 'mentor' && (
          <>
            <GlobalSearch />
            <div className="mt-6" />
            <MentorDashboard profile={profile} />
          </>
        )}
        
        {activeSubTab === 'practice' && (
          <PracticeGuide context={context} profile={profile} provider={provider} apiKey={apiKey} />
        )}

        {activeSubTab === 'knowledge' && (
          <KnowledgeBase />
        )}
      </div>
    </div>
  );
}
