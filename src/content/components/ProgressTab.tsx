import { useState, useEffect } from 'react';
import { Target, TrendingUp, History } from 'lucide-react';
import type { ProgressStats, TimelineEvent } from '../../types/progress';
import { ProgressStorage } from '../../services/progressStorage';
import { PatternDashboard } from './progress/PatternDashboard';
import { LearningTimeline } from './progress/LearningTimeline';
import { ExportButton } from './progress/ExportButton';

export function ProgressTab() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'timeline'>('overview');

  useEffect(() => {
    ProgressStorage.getProgressStats().then(({ stats, timeline }) => {
      setStats(stats);
      setTimeline(timeline);
    });
  }, []);

  if (!stats) return <div className="p-4 text-center text-sm text-muted">Loading analytics...</div>;

  return (
    <div className="flex flex-col h-full bg-background relative -mx-4 -mb-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-surface/30">
        <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
          Learning Analytics
        </span>
        <ExportButton />
      </div>

      <div className="flex border-b border-border bg-surface/50">
        <button onClick={() => setActiveSubTab('overview')} className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${activeSubTab === 'overview' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-text'}`}>Overview</button>
        <button onClick={() => setActiveSubTab('timeline')} className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${activeSubTab === 'timeline' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-text'}`}>Timeline</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeSubTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Streak & Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-surface/30 border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold text-accent">{stats.daysActive}</span>
                <span className="text-[10px] text-muted uppercase tracking-wider mt-1">Days Active</span>
              </div>
              <div className="bg-surface/30 border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold text-text">{stats.totalReviewed}</span>
                <span className="text-[10px] text-muted uppercase tracking-wider mt-1">Reviewed</span>
              </div>
              <div className="bg-surface/30 border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold text-text">{stats.totalVisualized}</span>
                <span className="text-[10px] text-muted uppercase tracking-wider mt-1">Visualized</span>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target size={16} className="text-accent" />
                <h3 className="text-sm font-bold text-text">What To Learn Next</h3>
              </div>
              <ul className="space-y-2">
                {stats.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-text flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pattern Dashboard */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-muted" />
                <h3 className="text-sm font-bold text-text">Pattern Dashboard</h3>
              </div>
              <PatternDashboard counts={stats.patternCounts} />
            </div>
          </div>
        )}

        {activeSubTab === 'timeline' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <History size={16} className="text-muted" />
              <h3 className="text-sm font-bold text-text">Activity History</h3>
            </div>
            <LearningTimeline events={timeline} />
          </div>
        )}

      </div>
    </div>
  );
}
