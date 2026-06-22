import { useState, useEffect } from 'react';
import { Lightbulb, Plus, X, Activity } from 'lucide-react';
import type { ConceptCard } from '../../../types/progress';
import { AIService, type AIProviderName } from '../../../services/aiProvider';
import { PromptBuilder } from '../../../services/promptBuilder';
import { v4 as uuidv4 } from 'uuid';

export function LearningCards() {
  const [cards, setCards] = useState<ConceptCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [provider, setProvider] = useState<AIProviderName>('Gemini');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(null, (items) => {
        if (items.aiProvider) setProvider(items.aiProvider as AIProviderName);
        if (items.apiKey) setApiKey(items.apiKey as string);
        
        const loadedCards: ConceptCard[] = [];
        for (const [key, value] of Object.entries(items)) {
          if (key.startsWith('concept_')) loadedCards.push(value as ConceptCard);
        }
        setCards(loadedCards);
      });
    }
  }, []);

  const handleGenerate = async () => {
    if (!newTopic.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const prompt = PromptBuilder.buildConceptCardPrompt(newTopic);
      const json = await AIService.generateConceptCard(provider, apiKey, prompt);
      const newCard: ConceptCard = { id: uuidv4(), ...json };
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [`concept_${newCard.id}`]: newCard });
      }
      setCards(prev => [...prev, newCard]);
      setNewTopic('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate card');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove(`concept_${id}`);
    }
    setCards(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-4">
      {error && <div className="text-xs text-red-400 mb-2">{error}</div>}
      <div className="flex gap-2">
        <input 
          type="text" 
          value={newTopic}
          onChange={e => setNewTopic(e.target.value)}
          placeholder="e.g. Sliding Window"
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text focus:outline-none focus:border-accent"
          onKeyDown={e => e.key === 'Enter' && handleGenerate()}
        />
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !newTopic.trim()}
          className="bg-accent text-white px-3 py-1.5 rounded-lg flex items-center justify-center disabled:opacity-50 hover:bg-accent/90 transition-colors"
        >
          {isGenerating ? <Activity size={16} className="animate-pulse" /> : <Plus size={16} />}
        </button>
      </div>

      <div className="space-y-3">
        {cards.map(card => (
          <div key={card.id} className="bg-surface/30 border border-border/50 rounded-xl p-4 relative group">
            <button onClick={() => handleDelete(card.id)} className="absolute top-2 right-2 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
            <div className="flex items-center gap-2 mb-3 pr-6">
              <Lightbulb size={16} className="text-yellow-400 shrink-0" />
              <h4 className="text-sm font-bold text-text truncate">{card.topic}</h4>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Definition</span>
                <p className="text-xs text-text mt-0.5 leading-relaxed">{card.definition}</p>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-2">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Explain Like I'm 12</span>
                <p className="text-xs text-text mt-0.5 leading-relaxed">{card.simpleExplanation}</p>
                <p className="text-xs text-muted mt-1 italic leading-relaxed">"{card.analogy}"</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Use Cases</span>
                <ul className="list-disc list-outside ml-3 mt-0.5">
                  {card.useCases?.map((uc, i) => <li key={i} className="text-xs text-text">{uc}</li>)}
                </ul>
              </div>
              <div>
                <span className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider">Common Mistakes</span>
                <ul className="list-disc list-outside ml-3 mt-0.5">
                  {card.mistakes?.map((cm, i) => <li key={i} className="text-xs text-text">{cm}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ))}
        {cards.length === 0 && !isGenerating && (
          <div className="text-sm text-muted text-center py-4">No cards yet. Try generating one!</div>
        )}
      </div>
    </div>
  );
}
