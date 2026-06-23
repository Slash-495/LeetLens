import { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  type: string;
  date: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(null, (items) => {
        const matches: SearchResult[] = [];
        const q = query.toLowerCase();

        for (const [key, value] of Object.entries(items)) {
          const v = value as any;
          if (typeof v !== 'object' || !v) continue;

          let type = '';
          let title = '';

          if (key.startsWith('review_')) { type = 'Review'; title = v.title || key; }
          else if (key.startsWith('visual_')) { type = 'Visualization'; title = v.title || key; }
          else if (key.startsWith('compare_')) { type = 'Comparison'; title = v.title || key; }
          else if (key.startsWith('concept_')) { type = 'Concept Card'; title = v.concept || key; }

          if (type && title.toLowerCase().includes(q)) {
            matches.push({
              id: key,
              type,
              title: title.replace('review_', '').replace('visual_', '').replace('compare_', '').replace('concept_', ''),
              date: v.timestamp ? new Date(v.timestamp).toLocaleDateString() : ''
            });
          }
        }
        setResults(matches.slice(0, 5));
      });
    }
  }, [query]);

  return (
    <div className="bg-surface/30 border border-border/50 rounded-xl p-4">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input 
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search past reviews, visualizations, concepts..."
          className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-text focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/50"
        />
      </div>

      {results.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {results.map(r => (
            <div key={r.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface transition-colors cursor-pointer group">
              <div className="flex flex-col overflow-hidden pr-2">
                <span className="text-xs font-medium text-text truncate group-hover:text-accent transition-colors">{r.title}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted">{r.type}</span>
                  <span className="text-[9px] text-muted/50">{r.date}</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-muted group-hover:text-accent transition-colors shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
