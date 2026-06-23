import { useState, useEffect } from 'react';
import { Target, Trophy, TrendingUp } from 'lucide-react';
import type { LearningProfile, LearningGoal } from '../../../types/learn';
import { LearnStorage } from '../../../services/learnStorage';

export function MentorDashboard({ profile }: { profile: LearningProfile | null }) {
  const [goals, setGoals] = useState<LearningGoal[]>([]);

  useEffect(() => {
    LearnStorage.getGoals().then(g => {
      if (g.length === 0) {
        // Initialize default goals
        const defaultGoals: LearningGoal[] = [
          { id: '1', text: 'Solve 3 problems', current: 0, target: 3, completed: false },
          { id: '2', text: 'Review 1 Optimal Solution', current: 0, target: 1, completed: false }
        ];
        LearnStorage.saveGoals(defaultGoals);
        setGoals(defaultGoals);
      } else {
        setGoals(g);
      }
    });
  }, []);

  const toggleGoal = async (id: string) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        const completed = !g.completed;
        return { ...g, completed, current: completed ? g.target : 0 };
      }
      return g;
    });
    setGoals(updated);
    await LearnStorage.saveGoals(updated);
  };

  if (!profile) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Skill Gap Analysis */}
      <div className="bg-surface/30 border border-border/50 rounded-xl p-4">
        <h3 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-accent" />
          Skill Gap Analysis
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Strong Areas</span>
            <ul className="mt-2 space-y-1">
              {profile.strongPatterns.length > 0 ? profile.strongPatterns.map(p => (
                <li key={p} className="text-xs text-text flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  {p}
                </li>
              )) : <li className="text-xs text-muted">Solve more problems to identify strengths.</li>}
            </ul>
          </div>
          <div>
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Needs Work</span>
            <ul className="mt-2 space-y-1">
              {profile.weakPatterns.length > 0 ? profile.weakPatterns.map(p => (
                <li key={p} className="text-xs text-text flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {p}
                </li>
              )) : <li className="text-xs text-muted">No weak areas identified yet.</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Weekly Goals */}
      <div className="bg-surface/30 border border-border/50 rounded-xl p-4">
        <h3 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
          <Target size={16} className="text-accent" />
          Weekly Goals
        </h3>
        <div className="space-y-2">
          {goals.map(goal => (
            <div key={goal.id} className="flex items-center gap-3 bg-background p-2.5 rounded-lg border border-border">
              <button 
                onClick={() => toggleGoal(goal.id)}
                className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                  goal.completed ? 'bg-accent border-accent text-white' : 'border-muted hover:border-accent'
                }`}
              >
                {goal.completed && <Trophy size={12} />}
              </button>
              <div className="flex-1">
                <p className={`text-sm font-medium transition-colors ${goal.completed ? 'text-muted line-through' : 'text-text'}`}>
                  {goal.text}
                </p>
                <div className="w-full bg-surface h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="bg-accent h-full transition-all duration-500" 
                    style={{ width: `${(goal.current / goal.target) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-mono text-muted shrink-0">{goal.current}/{goal.target}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
