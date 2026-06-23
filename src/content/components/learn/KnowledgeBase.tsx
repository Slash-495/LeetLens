import { useState, useEffect } from 'react';
import { Bookmark, Library } from 'lucide-react';
import type { FavoriteItem } from '../../../types/learn';
import { LearnStorage } from '../../../services/learnStorage';
import { LearningCards } from './LearningCards';

export function KnowledgeBase() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    LearnStorage.getFavorites().then(setFavorites);
  }, []);

  const removeFav = async (id: string) => {
    await LearnStorage.removeFavorite(id);
    setFavorites(f => f.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
      
      {/* Concept Cards Engine (Moved from Progress Tab) */}
      <LearningCards />

      {/* Favorites Manager */}
      <div className="bg-surface/30 border border-border/50 rounded-xl p-4">
        <h3 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
          <Bookmark size={16} className="text-accent" />
          Saved Content
        </h3>
        
        {favorites.length === 0 ? (
          <div className="text-center py-6">
            <Library size={24} className="text-muted mx-auto mb-2 opacity-50" />
            <p className="text-xs text-muted">No saved items yet.</p>
            <p className="text-[10px] text-muted mt-1">Bookmark visualizations, reviews, and concepts.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.map(fav => (
              <div key={fav.id} className="flex items-center justify-between bg-background p-2.5 rounded-lg border border-border">
                <div className="flex flex-col gap-1 overflow-hidden">
                  <span className="text-xs font-bold text-text truncate pr-2">{fav.title}</span>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-accent uppercase font-bold tracking-wider">{fav.type}</span>
                    {fav.pattern && <span className="font-mono text-muted truncate">{fav.pattern}</span>}
                  </div>
                </div>
                <button 
                  onClick={() => removeFav(fav.id)}
                  className="p-1.5 text-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                  title="Remove Favorite"
                >
                  <Bookmark size={14} className="fill-current" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
